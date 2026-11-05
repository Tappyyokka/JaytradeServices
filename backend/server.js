
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./src/config/prisma");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Indipay Backend is Running!");
});

// Database test
app.get("/api/db-test", async (req, res) => {
    try {
        await prisma.$connect();

        res.json({
            success: true,
            message: "PostgreSQL connected successfully!",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

// CREATE APPLICATION + FORWARD TO JAYTRADE
app.post("/api/applications", async (req, res) => {
    try {
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
        } = req.body;

        if (
            !fullName ||
            !mobile ||
            !email ||
            !service ||
            !address ||
            !district ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required application details.",
            });
        }

        const applicationId = `IND-${Date.now()}`;

        // 1. Save application in Indipay PostgreSQL
        const application = await prisma.application.create({
            data: {
                applicationId,
                fullName,
                mobile,
                email,
                service,
                address,
                district,
                state,
                pincode,
                remarks: remarks || null,
            },
        });

        // 2. Forward the saved application to JAYTRADE
        try {
            const response = await fetch(
                process.env.JAYTRADE_LEADS_API_URL,
                {
                    method: "POST",
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

        } catch (syncError) {
            // Keep the application even if JAYTRADE is unavailable
            console.error("JAYTRADE sync failed:", syncError.message);

            await prisma.application.update({
                where: { applicationId },
                data: {
                    leadSyncStatus: "PENDING",
                },
            });
        }

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully!",
            applicationId,
            syncStatus: (
                await prisma.application.findUnique({
                    where: { applicationId },
                    select: { leadSyncStatus: true },
                })
            ).leadSyncStatus,
        });

    } catch (error) {
        console.error("Application submission failed:", error);

        return res.status(500).json({
            success: false,
            message: "Could not save your application.",
        });
    }
});

// GET ALL APPLICATIONS
app.get("/api/applications", async (req, res) => {
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
app.patch("/api/applications/:applicationId/status", async (req, res) => {
    try {
        const { status } = req.body;

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
        console.error("Status update failed:", error);

        return res.status(404).json({
            success: false,
            message: "Application not found or status update failed.",
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Indipay backend running on port ${PORT}`);
});
