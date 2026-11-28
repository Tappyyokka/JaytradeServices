const express = require("express");
const { randomUUID } = require("node:crypto");
const prisma = require("../src/config/prisma");
const { authenticateCustomer } = require("./auth");
const rateLimit = require("../src/rateLimit");
const { checkoutEnabled } = require("../src/superstoreCheckout");
const { registrationDemoEnabled } = require("../src/registrationDemoIsolation");
const { enqueueConfirmation, deliverConfirmation, requestConfirmationRetry } = require("../src/registrationConfirmationDelivery");

const router = express.Router();
const { requireAdminArea, confirmation, audit } = require("../src/adminAccess");
const terms = {
    version: "demo-registration-v1",
    conditions: "This is a demonstration of application registration. Primary Approval is preliminary. It does not guarantee loan sanction or final service delivery.",
    cancellation: "Development placeholder. For a cancellation or refund review, contact Indipay support with your receipt reference. This demonstration makes no real payment.",
};
const creditFields = {
    id: true, userId: true, applicationId: true, purpose: true, amountPaise: true, utr: true, status: true,
    remarks: true, reviewedBy: true, reviewedAt: true, createdAt: true,
};

function fail(status, message) {
    throw Object.assign(new Error(message), { status });
}

function handle(action) {
    return async (req, res) => {
        try {
            return await action(req, res);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            if (error.code === "P2002") return res.status(409).json({ message: "This registration or reference has already been recorded." });
            console.error("Registration demo failed:", error.code || error.name);
            return res.status(500).json({ message: "The demonstration workflow is temporarily unavailable." });
        }
    };
}

router.use(async (req, res, next) => {
    if (!(await registrationDemoEnabled(prisma))) return res.status(404).json({ message: "Application registration demo is disabled." });
    if (req.method === "POST" && req.get("X-Indipay-Registration") !== "demo") return res.sendStatus(403);
    next();
});
router.use(authenticateCustomer);
router.use(rateLimit({ limit: 240, windowMs: 60_000 }));

async function ownedApplication(userId, applicationId) {
    const application = await prisma.application.findFirst({ where: { userId, applicationId } });
    if (!application) fail(404, "Application not found.");
    return application;
}

async function jaytrade(applicationId, action, body) {
    const base = process.env.JAYTRADE_STATUS_API_URL?.replace(/\/+$/, "");
    const key = process.env.INDIPAY_API_KEY;
    if (!base || !key) fail(503, "Jaytrade registration is not configured.");
    try {
        const reply = await fetch(base + "/" + encodeURIComponent(applicationId) + "/" + action, {
            method: body ? "POST" : "GET",
            headers: { "X-API-Key": key, ...(body && { "Content-Type": "application/json" }) },
            signal: AbortSignal.timeout(5000),
            redirect: "error",
            body: body ? JSON.stringify(body) : undefined,
        });
        const result = await reply.json();
        if (!reply.ok || !result.success || (result.application_id && result.application_id !== applicationId)) throw new Error("Unexpected Jaytrade response");
        return result;
    } catch {
        fail(502, "Unable to confirm registration with Jaytrade right now.");
    }
}

async function approvedOffer(application) {
    if (application.leadSyncStatus !== "SYNCED") fail(409, "This application has not received Primary Approval.");
    const { registration, status, customer_status: customerStatus } = await jaytrade(application.applicationId, "status");
    const rejected = /reject|\blost\b/i.test(status ?? "") || /reject|\blost\b/i.test(customerStatus ?? "");
    if (rejected || registration?.demo !== true || registration.stage !== "primary_approval" || registration.eligible !== true) {
        fail(409, "This application is not ready for registration.");
    }
    const { amount_paise: amountPaise, service, department, staff } = registration;
    if (!Number.isInteger(amountPaise) || amountPaise < 1 || amountPaise > 10_000_000 ||
        ![service, department, staff].every((field) => typeof field === "string" && field.trim() && field.length <= 200)) {
        fail(409, "The approved registration details are incomplete.");
    }
    return { amountPaise, service, department, staff };
}

async function balanceFor(userId) {
    const wallet = await prisma.marketplaceWallet.findUnique({ where: { userId } });
    return wallet?.balancePaise ?? 0;
}

async function syncRegistration(record, adminRetry = false) {
    if (record.syncedAt) return record;
    try {
        if (process.env.INDIPAY_DURABLE_DELIVERY === "1") {
            await enqueueConfirmation(prisma, record.applicationId);
            if (adminRetry) await requestConfirmationRetry(prisma, record.applicationId);
            await deliverConfirmation(prisma, record.applicationId);
            return await prisma.applicationDemoRegistration.findUnique({ where: { applicationId: record.applicationId } }) ?? record;
        }
        await jaytrade(record.applicationId, "registration", {
            demo: true, payment_reference: record.reference, amount_paise: record.amountPaise, registered_at: record.acceptedAt,
        });
        return await prisma.applicationDemoRegistration.update({
            where: { applicationId: record.applicationId }, data: { syncedAt: new Date() },
        });
    } catch {
        return record;
    }
}

router.get("/wallet", handle(async (req, res) => {
    const userId = req.user.id;
    if (req.query?.purpose === "superstore") {
        if (!checkoutEnabled()) fail(403, "Super Store demo credits are disabled.");
        const [wallet, credits] = await Promise.all([
            prisma.marketplaceWallet.findUnique({ where: { userId }, select: { balancePaise: true } }),
            prisma.applicationDemoCredit.findMany({ where: { userId, purpose: "superstore" }, select: creditFields, orderBy: { createdAt: "desc" } }),
        ]);
        return res.json({ demo: true, balancePaise: wallet?.balancePaise ?? 0, credits, registrations: [] });
    }
    const [balancePaise, registrations, credits] = await Promise.all([
        balanceFor(userId),
        prisma.applicationDemoRegistration.findMany({ where: { userId }, orderBy: { acceptedAt: "desc" } }),
        prisma.applicationDemoCredit.findMany({ where: { userId }, select: creditFields, orderBy: { createdAt: "desc" } }),
    ]);
    res.json({ demo: true, balancePaise, registrations, credits });
}));

router.get("/notifications", handle(async (req, res) => {
    const userId = req.user.id;
    const [applications, registrations, credits] = await Promise.all([
        prisma.application.findMany({ where: { userId }, take: 10, orderBy: { submittedAt: "desc" } }),
        prisma.applicationDemoRegistration.findMany({ where: { userId }, take: 10, orderBy: { acceptedAt: "desc" } }),
        prisma.applicationDemoCredit.findMany({ where: { userId }, select: creditFields, take: 10, orderBy: { createdAt: "desc" } }),
    ]);
    const enquiries = await Promise.all(applications.map(async (application) => {
        const id = application.applicationId;
        const events = [{ key: "enquiry-" + id, title: "Enquiry received", id, date: application.submittedAt, section: "application" }];
        if (application.leadSyncStatus === "SYNCED") {
            try {
                const { registration } = await jaytrade(id, "status");
                if (registration?.demo && registration.stage === "primary_approval") {
                    events.push({ key: "approval-" + id, title: "Primary Approval completed", id, section: "application" });
                    if (registration.eligible && !registrations.some((row) => row.applicationId === id)) {
                        events.push({ key: "register-" + id, title: "Application registration required", id, section: "application" });
                    }
                }
            } catch { /* Existing enquiry notifications remain available during a sync outage. */ }
        }
        return events;
    }));
    const events = [
        ...enquiries.flat(),
        ...registrations.flatMap((row) => ["Demo application payment confirmed", "Application registration completed"].map((title, index) => ({
            key: row.reference + "-" + index, title, id: row.applicationId, date: row.acceptedAt, section: "completed",
        }))),
        ...credits.flatMap((row) => {
            const base = { id: row.id, section: row.purpose === "superstore" ? "superstore-credit" : "credit" };
            return [
                { ...base, key: row.id + "-submitted", title: "Demo wallet credit request submitted", date: row.createdAt },
                ...(row.reviewedAt ? [{ ...base, key: row.id + "-reviewed", title: "Demo wallet credit request " + row.status, date: row.reviewedAt }] : []),
            ];
        }),
    ];
    events.sort((first, second) => new Date(second.date ?? 0) - new Date(first.date ?? 0));
    res.json({ demo: true, events });
}));

router.get("/applications/:applicationId", handle(async (req, res) => {
    const app = await ownedApplication(req.user.id, req.params.applicationId);
    const record = await prisma.applicationDemoRegistration.findUnique({ where: { applicationId: app.applicationId } });
    if (record) return res.json({ demo: true, registration: record, terms });
    const [offer, balancePaise] = await Promise.all([approvedOffer(app), balanceFor(req.user.id)]);
    res.json({ demo: true, applicationId: app.applicationId, offer, balancePaise, terms });
}));

router.post("/applications/:applicationId/pay", handle(async (req, res) => {
    const userId = req.user.id;
    const application = await ownedApplication(userId, req.params.applicationId);
    const { applicationId } = application;
    const existing = await prisma.applicationDemoRegistration.findUnique({ where: { applicationId } });
    if (existing) return res.json({ demo: true, registration: await syncRegistration(existing) });

    if (req.body?.accepted !== true || req.body.termsVersion !== terms.version) {
        fail(422, "Accept the current registration terms before confirming.");
    }
    let offer;
    try {
        offer = await approvedOffer(application);
    } catch (error) {
        if (error.status !== 409) throw error;
        const concurrent = await prisma.applicationDemoRegistration.findUnique({ where: { applicationId } });
        if (!concurrent) throw error;
        return res.json({ demo: true, registration: await syncRegistration(concurrent) });
    }
    if (req.body.amountPaise !== offer.amountPaise) fail(409, "The registration quote changed. Refresh and review it again.");
    const reference = "DEMO-REG-" + randomUUID();
    let record;
    try {
        record = await prisma.$transaction(async (tx) => {
            const registration = await tx.applicationDemoRegistration.create({
                data: { applicationId, userId, reference, termsVersion: terms.version, ...offer },
            });
            const result = await tx.marketplaceWallet.updateMany({
                where: { userId, balancePaise: { gte: offer.amountPaise } },
                data: { balancePaise: { decrement: offer.amountPaise } },
            });
            if (result.count !== 1) fail(409, "Insufficient eligible demo wallet balance.");
            await tx.marketplaceLedgerEntry.create({ data: { userId, reference: "application:" + reference, amountPaise: -offer.amountPaise } });
            if (process.env.INDIPAY_DURABLE_DELIVERY === "1") await enqueueConfirmation(tx, applicationId);
            return registration;
        });
    } catch (error) {
        if (error.code !== "P2002") throw error;
        record = await prisma.applicationDemoRegistration.findUnique({ where: { applicationId } });
        if (!record) throw error;
    }
    res.json({ demo: true, registration: await syncRegistration(record) });
}));

router.post("/applications/:applicationId/sync", handle(async (req, res) => {
    const { applicationId } = await ownedApplication(req.user.id, req.params.applicationId);
    const registration = await prisma.applicationDemoRegistration.findUnique({ where: { applicationId } });
    if (!registration) fail(404, "There is no completed registration to synchronize.");
    res.json({ demo: true, registration: await syncRegistration(registration) });
}));

function parseScreenshot(type, value) {
    if (typeof value !== "string" || value.length > 1_117_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
        fail(422, "Choose a PNG or JPEG screenshot up to 800 KB.");
    }
    const bytes = Buffer.from(value, "base64");
    const header = bytes.subarray(0, 8).toString("hex");
    const valid = (type === "image/png" && header === "89504e470d0a1a0a") ||
        (type === "image/jpeg" && header.startsWith("ffd8ff"));
    if (!valid || bytes.length < 32 || bytes.length > 819200) fail(422, "Choose a valid PNG or JPEG screenshot up to 800 KB.");
    return bytes;
}

router.post("/credits", handle(async (req, res) => {
    const { amountPaise, applicationId, mime, data } = req.body ?? {};
    const purpose = req.body?.purpose === "superstore" ? "superstore" : "application";
    const utr = typeof req.body?.utr === "string" ? req.body.utr.trim().toUpperCase() : "";
    if (!Number.isInteger(amountPaise) || amountPaise < 100 || amountPaise > 10_000_000 || !/^[A-Z0-9]{8,26}$/.test(utr)) {
        fail(422, "Enter a valid amount and an 8–26 character transaction reference.");
    }
    if (applicationId) await ownedApplication(req.user.id, applicationId);
    if (purpose === "superstore" && (!checkoutEnabled() || applicationId || amountPaise % 100 !== 0)) {
        fail(422, "Super Store demo credits require an enabled checkout and a whole rupee amount.");
    }
    const evidence = parseScreenshot(mime, data);
    const credit = await prisma.applicationDemoCredit.create({
        data: { userId: req.user.id, applicationId: applicationId || null, purpose, mime, evidence, utr, amountPaise },
        select: creditFields,
    });
    res.status(201).json({ demo: true, credit });
}));

router.post("/admin/registrations/:id/sync", requireAdminArea("applications"), handle(async (req, res) => {
    const reason = confirmation(req.body);
    const record = await prisma.applicationDemoRegistration.findUnique({ where: { applicationId: req.params.id } });
    if (!record) fail(404, "Registration unavailable.");
    if (!record.syncedAt) await audit(prisma, req.user, "registration.sync.retry", record.applicationId, reason);
    const result = await syncRegistration(record, true);
    if (!result.syncedAt) fail(502, "Jaytrade has not confirmed synchronization. The existing payment reference is retained.");
    res.json({ demo: true, registration: result });
}));

router.use("/admin", requireAdminArea("finance"));

router.get("/admin/credits", handle(async (req, res) => {
    const status = ["pending", "approved", "rejected"].includes(req.query.status) ? req.query.status : "pending";
    const rows = await prisma.applicationDemoCredit.findMany({ where: { status }, select: creditFields, orderBy: { createdAt: "desc" }, take: 100 });
    const users = await prisma.user.findMany({
        where: { id: { in: [...new Set(rows.flatMap((row) => [row.userId, row.reviewedBy].filter(Boolean)))] } },
        select: { id: true, name: true, accountId: true },
    });
    const byId = new Map(users.map((user) => [user.id, user]));
    res.json({ demo: true, credits: rows.map((row) => ({
        ...row, customer: byId.get(row.userId), reviewer: byId.get(row.reviewedBy)?.name,
    })) });
}));

router.get("/admin/credits/:id/evidence", handle(async (req, res) => {
    const row = await prisma.applicationDemoCredit.findUnique({ where: { id: req.params.id }, select: { evidence: true, mime: true } });
    if (!row) fail(404, "Screenshot not found.");
    res.set("Content-Security-Policy", "sandbox; default-src 'none'");
    res.type(row.mime).send(Buffer.from(row.evidence));
}));

router.post("/admin/credits/:id/review", handle(async (req, res) => {
    const { decision, verified, confirmed, reference } = req.body ?? {};
    const remarks = typeof req.body?.remarks === "string" ? req.body.remarks.trim() : "";
    if (!["approved", "rejected"].includes(decision) || !remarks || remarks.length > 1000 || confirmed !== true) {
        fail(422, "Confirm the decision and enter review remarks.");
    }

    const credit = await prisma.$transaction(async (tx) => {
        const current = await tx.applicationDemoCredit.findUnique({ where: { id: req.params.id }, select: creditFields });
        if (!current) fail(404, "Credit request not found.");
        if (current.purpose === "superstore" && !checkoutEnabled()) fail(403, "Super Store demo credits are disabled.");
        if (decision === "approved" && (verified !== true || typeof reference !== "string" || reference.trim().toUpperCase() !== current.utr)) {
            fail(422, "Confirm the demo reconciliation separately and enter the matching transaction reference.");
        }
        const update = { status: decision, reviewedAt: new Date(), reviewedBy: req.user.id, remarks };
        const changed = await tx.applicationDemoCredit.updateMany({ where: { id: current.id, status: "pending" }, data: update });
        if (changed.count !== 1) fail(409, "This request has already been reviewed.");
        if (decision === "approved" && current.purpose === "superstore") {
            const userId = current.userId;
            await tx.marketplaceWallet.upsert({
                where: { userId }, create: { userId, balancePaise: current.amountPaise }, update: { balancePaise: { increment: current.amountPaise } },
            });
            await tx.marketplaceLedgerEntry.create({ data: { userId, amountPaise: current.amountPaise, reference: "credit:" + current.utr } });
        } else if (decision === "approved") {
            await tx.marketplaceWallet.upsert({
                where: { userId: current.userId }, create: { userId: current.userId, balancePaise: current.amountPaise },
                update: { balancePaise: { increment: current.amountPaise } },
            });
            await tx.marketplaceLedgerEntry.create({ data: { reference: "application-credit:" + current.utr, userId: current.userId, amountPaise: current.amountPaise } });
        }
        await audit(tx, req.user, "wallet-credit." + decision, current.id, remarks);
        return { ...current, ...update };
    });
    res.json({ demo: true, credit });
}));

module.exports = router;
