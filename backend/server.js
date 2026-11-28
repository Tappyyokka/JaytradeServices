
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./src/config/prisma");
const { registrationDemoEnabled } = require("./src/registrationDemoIsolation");
const { enqueueDelivery, startApplicationDelivery } = require("./src/applicationDelivery");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const authenticateCustomer = authRoutes.authenticateCustomer;
const chatbotRoutes = require("./routes/chatbot");
const { requireAdminArea, canAdmin } = require("./src/adminAccess");
const requireAdmin = requireAdminArea("applications");

const app = express();
const allowedOrigins = new Set([
    "http://localhost:5173",
    process.env.FRONTEND_URL?.trim().replace(/\/+$/, ""),
].filter(Boolean));

app.disable("x-powered-by");
app.use(cors({
    origin: [...allowedOrigins],
    credentials: true
}));

app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Content-Type-Options", "nosniff");
    const origin = req.get("Origin");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && origin && !allowedOrigins.has(origin)) {
        return res.status(403).json({ success: false, message: "Request origin is not allowed." });
    }
    next();
});

app.use(cookieParser());
app.use("/api/admin-centre", express.json({ limit: "600kb" }), require("./routes/adminCentre"));
app.use("/api/marketplace", require("./routes/marketplace"));
app.use("/api/registration-demo", express.json({ limit: "1150kb" }), require("./routes/registrationDemo"));
app.use("/api/service-processing", require("./routes/serviceProcessing"));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.get("/api/customer-money", authenticateCustomer, async (req, res) => {
    try {
        const userId = req.user.id;
        const [wallet, creditRequests] = await prisma.$transaction([
            prisma.marketplaceWallet.findUnique({ where: { userId }, select: {
                balancePaise: true, entries: { orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                    select: { id: true, reference: true, amountPaise: true, createdAt: true } },
            } }),
            prisma.applicationDemoCredit.findMany({ where: { userId }, orderBy: { createdAt: "desc" },
                select: { id: true, purpose: true, amountPaise: true, status: true, remarks: true, createdAt: true } }),
        ], { isolationLevel: "RepeatableRead" });
        const registrationDemoAvailable = await registrationDemoEnabled(prisma);
        const entries = wallet?.entries ?? [];
        res.json({ wallet: { balancePaise: wallet?.balancePaise ?? 0, entries }, creditRequests,
            registrationDemoAvailable });
    } catch (error) {
        console.error("Customer Money read failed:", error.code || error.name);
        res.status(503).json({ success: false, message: "Customer Money is temporarily unavailable. Please retry." });
    }
});
app.use("/api/chatbot", chatbotRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Indipay Backend is Running!");
});

// Database test
app.get("/api/db-test", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            success: true,
            message: "PostgreSQL connected successfully!",
        });
    } catch (error) {
        console.error("Database health check failed:", error.code || error.name);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

// CREATE APPLICATION + FORWARD TO JAYTRADE
app.post("/api/applications", authenticateCustomer, async (req, res) => {
    try {
        const fields = {
            fullName: 100, mobile: 20, email: 150, service: 180, address: 500,
            district: 100, state: 100, pincode: 6, remarks: 2000,
        };
        const cleaned = {};
        for (const [name, maxLength] of Object.entries(fields)) {
            const value = req.body?.[name] ?? "";
            if (typeof value !== "string" || value.trim().length > maxLength || (name !== "remarks" && !value.trim())) {
                return res.status(400).json({ success: false, message: "Check the required application details and field lengths." });
            }
            cleaned[name] = value.trim();
        }
        const {
            fullName,
            mobile,
            email,
            service,
            address,
            district,
            state,
            pincode,
            remarks,
        } = cleaned;

        const serviceOverride = await prisma.serviceOverride.findUnique({ where: { id: service.toLowerCase() } });
        if (serviceOverride?.available === false) {
            return res.status(409).json({ success: false, message: "This service is currently unavailable." });
        }

        if (
            !/^[0-9]{10}$/.test(mobile) ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !/^[0-9]{6}$/.test(pincode)
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid mobile number, email, and PIN code.",
            });
        }

        let syncStatus = "PENDING";
        let applicationId;
        const submittedAt = Date.now();
        for (let attempt = 0; attempt < 5; attempt++) {
            applicationId = `IND-${submittedAt + attempt}`;
            try {
                const data = { ...cleaned, applicationId, userId: req.user.id, remarks: remarks || null };
                if (process.env.INDIPAY_DURABLE_DELIVERY === "1") {
                    await prisma.$transaction(async (tx) => {
                        await tx.application.create({ data });
                        await enqueueDelivery(tx, applicationId);
                    });
                } else await prisma.application.create({ data });
                break;
            } catch (error) {
                if (error.code !== "P2002" || attempt === 4) throw error;
            }
        }

        if (process.env.INDIPAY_DURABLE_DELIVERY === "1") {
            return res.status(201).json({ success: true, applicationId, syncStatus,
                message: "Application saved and queued for Jaytrade." });
        }

        // Compatibility for environments that have not applied the delivery migration.
        try {
            const response = await fetch(
                process.env.JAYTRADE_LEADS_API_URL,
                {
                    method: "POST",
                    redirect: "error",
                    signal: AbortSignal.timeout(10000),
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": process.env.INDIPAY_API_KEY,
                    },
                    body: JSON.stringify({
                        application_id: applicationId,
                        fullName,
                        mobile,
                        email,
                        service,
                        address,
                        district,
                        state,
                        pincode,
                        remarks,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    result.error ||
                    "JAYTRADE could not receive the application."
                );
            }

            // 3. Record successful transfer
            await prisma.application.update({
                where: { applicationId },
                data: {
                    leadId: result.lead_id
                        ? String(result.lead_id)
                        : null,
                    leadSyncStatus: "SYNCED",
                },
            });
            syncStatus = "SYNCED";

        } catch (syncError) {
            // Keep the application even if JAYTRADE is unavailable
            console.error("JAYTRADE sync failed:", syncError.code || syncError.name);
        }

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully!",
            applicationId,
            syncStatus,
        });

    } catch (error) {
        console.error("Application submission failed:", error.code || error.name);

        return res.status(500).json({
            success: false,
            message: "Could not save your application.",
        });
    }
});


// GET APPLICATION STATUS FROM JAYTRADE
app.get(
    "/api/applications/:applicationId/jaytrade-status",
    authenticateCustomer,
    async (req, res) => {
    try {
        const { applicationId } = req.params;

        // 1. Find the application in Indipay database
        const application = await prisma.application.findUnique({
            where: { applicationId },
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found.",
            });
        }
        // Make sure this application belongs to the logged-in customer
if (application.userId !== req.user.id && !canAdmin(req.user, "applications")) {
    return res.status(403).json({
        success: false,
        message: "You are not authorized to view this application.",
    });
}

        // 2. Check whether the application was synced to Jaytrade
        if (application.leadSyncStatus !== "SYNCED") {
            return res.json({
                success: true,
                synced: false,
                message: "Your application has not yet been transferred to Jaytrade.",
            });
        }

        // 3. Request the latest status from Jaytrade
        const jaytradeUrl =
            `${process.env.JAYTRADE_STATUS_API_URL}/${encodeURIComponent(applicationId)}/status`;

        const response = await fetch(jaytradeUrl, {
            method: "GET",
            redirect: "error",
            signal: AbortSignal.timeout(10000),
            headers: {
                "X-API-Key": process.env.INDIPAY_API_KEY,
            },
        });

        if (response.status === 404) return res.status(404).json({ success: false, message: "The linked Jaytrade enquiry is missing." });
        if (!response.ok) throw new Error("Jaytrade status unavailable");
        const result = await response.json();
        if (!result.success) throw new Error("Jaytrade status unavailable");
        if (result.application_id !== applicationId || (application.leadId && result.lead_id && application.leadId !== String(result.lead_id))) {
            return res.status(409).json({ success: false, message: "The application link needs reconciliation." });
        }

        // 4. Return application and employee details
        const registration = result.registration;
        return res.json({
            success: true,
            synced: true,
            applicationId,
            jaytrade: {
                status: result.status,
                customer_status: result.customer_status,
                department: result.department,
                assigned_employee: result.assigned_employee ? {
                    name: result.assigned_employee.name,
                    phone: result.assigned_employee.business_phone ?? null,
                    designation: result.assigned_employee.designation,
                    department: result.assigned_employee.department,
                } : null,
                registration: registration ? {
                    stage: registration.stage,
                    eligible: registration.eligible,
                    amount_paise: registration.amount_paise,
                    service: registration.service,
                    department: registration.department,
                    staff: registration.staff,
                    paid: registration.paid,
                    payment_reference: registration.payment_reference,
                    registered_at: registration.registered_at,
                    demo: registration.demo === true && await registrationDemoEnabled(prisma),
                } : null,
            },
        });

    } catch (error) {
        console.error("Jaytrade status lookup failed:", error.code || error.name);

        return res.status(502).json({
            success: false,
            message: "Could not retrieve the latest application status.",
        });
    }
});

// GET LOGGED-IN CUSTOMER'S APPLICATIONS
app.get("/api/my-applications", authenticateCustomer, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                submittedAt: "desc",
            },
        });

        return res.json({
            success: true,
            applications,
        });

    } catch (error) {
        console.error("Could not retrieve customer applications:", error);

        return res.status(500).json({
            success: false,
            message: "Could not retrieve your applications.",
        });
    }
});

// GET ALL APPLICATIONS
app.get("/api/applications", authenticateCustomer, requireAdmin, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            orderBy: {
                submittedAt: "desc",
            },
        });

        return res.json({
            success: true,
            applications,
        });

    } catch (error) {
        console.error("Could not retrieve applications:", error);

        return res.status(500).json({
            success: false,
            message: "Could not retrieve applications.",
        });
    }
});

// UPDATE APPLICATION STATUS
app.patch("/api/applications/:applicationId/status", authenticateCustomer, requireAdmin, (_req, res) => {
    res.status(409).json({ message: "Jaytrade manages application stages." });
});

const PORT = process.env.PORT || 5000;

app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "API endpoint not found." });
});

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ success: false, message: "Invalid JSON request." });
    }
    if (error.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "Request is too large." });
    }
    console.error("Unhandled API error:", error.code || error.name);
    res.status(500).json({ success: false, message: "Something went wrong." });
});

if (require.main === module) {
    if (process.env.INDIPAY_DURABLE_DELIVERY === "1") {
        startApplicationDelivery(prisma, process.env.JAYTRADE_LEADS_API_URL, process.env.INDIPAY_API_KEY);
    }
    app.listen(PORT, () => {
        console.log(`Indipay backend running on port ${PORT}`);
    });
}

module.exports = app;
