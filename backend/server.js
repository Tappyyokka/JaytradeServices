
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./src/config/prisma");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const authenticateCustomer = authRoutes.authenticateCustomer;
const chatbotRoutes = require("./routes/chatbot");
function requireAdmin(req, res, next) {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required.",
        });
    }

    next();
}

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
app.use("/api/marketplace", express.json({ limit: "600kb" }), require("./routes/marketplace"));
app.use(express.json());
app.use("/api/auth", authRoutes);
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
            fullName: 100, mobile: 20, email: 254, service: 180, address: 500,
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
                await prisma.application.create({
                    data: { ...cleaned, applicationId, userId: req.user.id, remarks: remarks || null },
                });
                break;
            } catch (error) {
                if (error.code !== "P2002" || attempt === 4) throw error;
            }
        }

        // 2. Forward the saved application to JAYTRADE
        try {
            const response = await fetch(
                process.env.JAYTRADE_LEADS_API_URL,
                {
                    method: "POST",
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
if (application.userId !== req.user.id) {
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
            signal: AbortSignal.timeout(10000),
            headers: {
                "X-API-Key": process.env.INDIPAY_API_KEY,
            },
        });

        const responseText = await response.text();

let result;

try {
    result = JSON.parse(responseText);
} catch (parseError) {
    throw new Error(
        `Jaytrade returned invalid JSON. HTTP ${response.status}`
    );
}

if (!response.ok || !result.success) {
    throw new Error(
        result.error || result.message || "Could not retrieve Jaytrade status."
    );
}

        // 4. Return application and employee details
        return res.json({
            success: true,
            synced: true,
            applicationId,
            jaytrade: {
                status: result.status,
                customer_status: result.customer_status,
                department: result.department,
                assigned_employee: result.assigned_employee,
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
app.patch("/api/applications/:applicationId/status", authenticateCustomer, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body ?? {};

        const allowedStatuses = [
            "Pending",
            "Under Review",
            "Approved",
            "Rejected",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status.",
            });
        }

        const application = await prisma.application.update({
            where: {
                applicationId: req.params.applicationId,
            },
            data: {
                status,
            },
        });

        return res.json({
            success: true,
            application,
        });

    } catch (error) {
        console.error("Status update failed:", error.code || error.name);

        return res.status(error.code === "P2025" ? 404 : 500).json({
            success: false,
            message: "Application not found or status update failed.",
        });
    }
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
    app.listen(PORT, () => {
        console.log(`Indipay backend running on port ${PORT}`);
    });
}

module.exports = app;
