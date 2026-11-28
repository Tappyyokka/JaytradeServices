const express = require("express");
const prisma = require("../src/config/prisma");
const { authenticateCustomer } = require("./auth");
const rateLimit = require("../src/rateLimit");
const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");

const router = express.Router();
const receiptFields = {
    applicationId: true, service: true, department: true, staff: true, amountPaise: true,
    reference: true, termsVersion: true, acceptedAt: true, syncedAt: true,
};

router.use((_req, res, next) => {
    if (process.env.INDIPAY_SERVICE_PROCESSING !== "1") return res.sendStatus(404);
    next();
});
router.use(authenticateCustomer, rateLimit({ limit: 120, windowMs: 60_000 }));

async function relay(applicationId, documentId, upload) {
    const base = process.env.JAYTRADE_STATUS_API_URL?.replace(/\/+$/, "");
    const key = process.env.INDIPAY_API_KEY;
    if (!base || !key) return { status: 503, payload: { message: "Service progress is temporarily unavailable." } };
    let address = base + "/" + encodeURIComponent(applicationId) + "/processing";
    if (documentId) address += "/documents/" + encodeURIComponent(documentId);
    try {
        const reply = await fetch(address, {
            method: upload ? "POST" : "GET",
            headers: { "X-API-Key": key, ...(upload ? upload.headers : {}) },
            body: upload?.body,
            signal: AbortSignal.timeout(10000),
            redirect: "error",
        });
        if (!reply.ok) {
            const errors = {
                404: "Service processing or document request unavailable.",
                409: "This document is no longer open for upload. Refresh service progress.",
                413: "The file exceeds 4 MB.",
                422: "Choose a valid PDF, PNG or JPEG up to 4 MB.",
            };
            return { status: errors[reply.status] ? reply.status : 502, payload: {
                message: errors[reply.status] ?? "Service progress is temporarily unavailable.",
            } };
        }
        const payload = await reply.json();
        if (payload.applicationId !== applicationId) throw new Error("Mismatched response");
        return { status: reply.status, payload };
    } catch {
        return { status: 502, payload: { message: "Could not connect to Jaytrade service processing." } };
    }
}

function receipts(userId, take) {
    return prisma.applicationDemoRegistration.findMany({
        where: { userId }, select: receiptFields, orderBy: { acceptedAt: "desc" }, take,
    });
}

router.get("/receipts", async (req, res) => {
    res.json({ registrations: await receipts(req.user.id), billDeliveryAvailable: process.env.INDIPAY_COMPANY_BILLS === "1" });
});

router.get("/updates", async (req, res) => {
    const registrations = await receipts(req.user.id, 10);
    const items = await Promise.all(registrations.map(async ({ applicationId }) => {
        const { status, payload } = await relay(applicationId);
        if (status !== 200) return [];
        return [
            ...payload.events.map(({ id, message, date }) => ({
                key: "processing-" + applicationId + "-" + id, title: message, date,
                id: applicationId, section: "completed",
            })),
            ...(process.env.INDIPAY_COMPANY_BILLS === "1" ? (payload.billUpdates ?? []) : []).map(({ id, message, date }) => ({
                key: "bill-" + applicationId + "-" + id, title: message, date,
                id: applicationId, billId: id, section: "bill",
            })),
        ];
    }));
    res.json({ events: items.flat().sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 30) });
});

router.use("/:applicationId", async (req, res, next) => {
    const applicationId = req.params.applicationId;
    const [application, registration] = await Promise.all([
        prisma.application.findFirst({ where: { applicationId, userId: req.user.id }, select: { id: true } }),
        prisma.applicationDemoRegistration.findFirst({ where: { applicationId, userId: req.user.id }, select: { applicationId: true } }),
    ]);
    if (!application || !registration) return res.sendStatus(404);
    next();
});

router.get("/:applicationId", async (req, res) => {
    const result = await relay(req.params.applicationId);
    // Publication events are delivered through the existing notifications endpoint.
    const { billUpdates: _billUpdates, ...payload } = result.payload;
    res.status(result.status).json(payload);
});

router.post("/:applicationId/documents/:documentId", express.raw({
    type: ["application/pdf", "image/png", "image/jpeg"], limit: "4mb",
}), async (req, res) => {
    if (req.get("X-Indipay-Service-Document") !== "1") return res.sendStatus(403);
    const name = req.get("X-Document-Name");
    const { applicationId, documentId } = req.params;
    if (!name || name.length > 500 || !/^[0-9a-f-]{36}$/.test(documentId) ||
        !Buffer.isBuffer(req.body) || !req.body.length) return res.status(422).json({ message: "Choose a valid document." });
    const result = await relay(applicationId, documentId, {
        headers: { "Content-Type": req.get("Content-Type"), "X-Document-Name": name },
        body: req.body,
    });
    res.status(result.status).json(result.payload);
});

async function fetchBills(applicationId, suffix = "", signal) {
    const base = process.env.JAYTRADE_STATUS_API_URL?.replace(/\/+$/, "");
    const key = process.env.INDIPAY_API_KEY;
    if (!base || !key) throw new Error("Bill delivery unavailable");
    return fetch(base + "/" + encodeURIComponent(applicationId) + "/processing/bills" + suffix, {
        headers: { "X-API-Key": key },
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000),
        redirect: "error",
    });
}

function billFailure(res) {
    return res.status(502).json({ message: "Bills are temporarily unavailable. Please retry." });
}

router.get("/:applicationId/bills", async (req, res) => {
    if (process.env.INDIPAY_COMPANY_BILLS !== "1") return res.sendStatus(404);
    const { applicationId } = req.params;
    try {
        const reply = await fetchBills(applicationId);
        if (reply.status === 404) return res.sendStatus(404);
        if (!reply.ok) return billFailure(res);
        const result = await reply.json();
        if (result.applicationId !== applicationId || !Array.isArray(result.bills)) return billFailure(res);
        res.json(result);
    } catch {
        return billFailure(res);
    }
});

router.get("/:applicationId/bills/:billId/file", async (req, res) => {
    if (process.env.INDIPAY_COMPANY_BILLS !== "1") return res.sendStatus(404);
    const { applicationId, billId } = req.params;
    if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(billId)) return res.sendStatus(404);
    const controller = new AbortController();
    const cancel = () => controller.abort();
    res.once("close", cancel);
    try {
        const reply = await fetchBills(applicationId, "/" + billId + "/file", controller.signal);
        if (reply.status === 404) return res.sendStatus(404);
        if (!reply.ok || !reply.body) return billFailure(res);
        const mime = reply.headers.get("content-type");
        const disposition = reply.headers.get("content-disposition");
        if (!["application/pdf", "image/png", "image/jpeg"].includes(mime) || !disposition?.startsWith("attachment;")) {
            await reply.body.cancel();
            return billFailure(res);
        }
        res.set({
            "Content-Type": mime, "Content-Disposition": disposition, "Cache-Control": "private, no-store",
            "Content-Security-Policy": "sandbox; default-src 'none'", "X-Content-Type-Options": "nosniff",
        });
        await pipeline(Readable.fromWeb(reply.body), res);
    } catch {
        if (!res.headersSent && !res.destroyed) return billFailure(res);
        if (!res.destroyed) res.destroy();
    } finally {
        res.off("close", cancel);
    }
});

module.exports = router;
