const express = require("express");
const db = require("../src/config/prisma");
const { authenticateCustomer } = require("./auth");
const { adminRoles, permissions, canAdmin, confirmation, audit } = require("../src/adminAccess");
const { publicOrder, stageOf } = require("../src/superstoreOrders");
const { plans, planTerms, publishedStore } = require("../src/merchantSubscription");

const router = express.Router();
const channels = ["indipay", "superstore", "offers", "announcements", "merchant-notifications"];
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const clean = (value, size) => typeof value === "string" ? value.trim().slice(0, size) : "";
const route = (handler) => async (req, res) => {
    try { res.json(await handler(req)); }
    catch (error) {
        if (!error.status) console.error("Admin centre request failed:", error.code || error.name);
        res.status(error.status || (error.code === "P2025" ? 404 : 500)).json({ message: error.status ? error.message : "Could not complete this request." });
    }
};

router.get("/published/:channel", route(async ({ params }) => {
    if (!channels.includes(params.channel) || params.channel === "merchant-notifications") fail(404, "Content unavailable.");
    const now = new Date();
    return db.adminContent.findMany({ where: { channel: params.channel, active: true, AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
    ] }, orderBy: [{ position: "asc" }, { id: "asc" }], take: 12 });
}));
router.get("/service-catalogue", route(() => db.serviceOverride.findMany()));
const listPlans = async () => (await Promise.all(Object.keys(plans).map(async (id) => {
    const terms = await planTerms(db, id);
    return { id, ...terms, limit: Number.isFinite(terms.limit) ? terms.limit : null };
})));
router.get("/subscription-plans", route(async () => (await listPlans()).filter((plan) => plan.available)));

router.use(authenticateCustomer);
router.post("/support", route(async ({ user, body }) => {
    const { kind } = body ?? {};
    const subject = clean(body?.subject, 140), message = clean(body?.message, 2000);
    if (!["complaint", "support", "dispute"].includes(kind) || subject.length < 4 || message.length < 10) fail(422, "Enter a subject and details.");
    return db.supportRequest.create({ data: { userId: user.id, kind, subject, message }, select: { id: true, status: true } });
}));
router.get("/merchant-notifications", route(async ({ user }) => {
    if (user.role !== "SELLER") fail(403, "Merchant access required.");
    const now = new Date();
    return db.adminContent.findMany({ where: { channel: "merchant-notifications", active: true, AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
    ] }, orderBy: { position: "asc" }, take: 12 });
}));
router.use((req, res, next) => {
    if (!permissions(req.user).length) return res.status(403).json({ message: "Administrator access required." });
    if (req.method !== "GET" && req.get("X-Indipay-Admin") !== "1") return res.status(403).json({ message: "Invalid admin request." });
    next();
});

router.get("/application-delivery", route(async ({ user }) => {
    if (!canAdmin(user, "applications")) fail(403, "Application access required.");
    if (process.env.INDIPAY_DURABLE_DELIVERY !== "1") fail(404, "Delivery reporting is disabled.");
    const pending = await db.$queryRaw`
        SELECT a."applicationId", a."leadSyncStatus", d."attempts", d."lastAttemptAt", d."nextAttemptAt", d."reason"
        FROM "Application" a LEFT JOIN "ApplicationDelivery" d USING ("applicationId")
        WHERE a."leadSyncStatus" <> 'SYNCED' ORDER BY a."submittedAt" DESC LIMIT 100
    `;
    const awaitingPaymentConfirmation = await db.$queryRaw`
        SELECT r."applicationId", r."acceptedAt", j."attempts", j."lastAttemptAt", j."nextAttemptAt", j."reason"
        FROM "ApplicationDemoRegistration" r LEFT JOIN "RegistrationConfirmationDelivery" j USING ("applicationId")
        WHERE r."syncedAt" IS NULL ORDER BY r."acceptedAt" DESC LIMIT 100
    `;
    return { pending, awaitingPaymentConfirmation };
}));

router.put("/application-delivery/:id/retry", route(async ({ user, params, body }) => {
    if (!canAdmin(user, "applications", true)) fail(403, "Application management access required.");
    if (process.env.INDIPAY_DURABLE_DELIVERY !== "1") fail(404, "Delivery retry is disabled.");
    const remarks = confirmation(body);
    await db.$transaction(async (tx) => {
        const changed = await tx.$executeRaw`
            UPDATE "ApplicationDelivery" d SET "attempts" = 0, "nextAttemptAt" = now()
            WHERE d."applicationId" = ${params.id} AND d."nextAttemptAt" IS NULL
              AND d."reason" <> 'identity_conflict'
              AND EXISTS (SELECT 1 FROM "Application" a WHERE a."applicationId" = d."applicationId" AND a."leadSyncStatus" = 'FAILED')
              AND NOT EXISTS (SELECT 1 FROM "ApplicationDemoRegistration" r WHERE r."applicationId" = d."applicationId")
        `;
        if (!changed) fail(409, "This application is not eligible for retry. Review its synchronization history.");
        await tx.application.update({ where: { applicationId: params.id }, data: { leadSyncStatus: "PENDING" } });
        await audit(tx, user, "application.delivery_retry", params.id, remarks);
    });
    return { queued: true };
}));

router.get("/application-delivery/:id", route(async ({ user, params }) => {
    if (!canAdmin(user, "applications")) fail(403, "Application access required.");
    const applicationId = params.id;
    const app = await db.application.findUnique({ where: { applicationId },
        select: { leadSyncStatus: true, leadId: true } });
    if (!app) fail(404, "Application unavailable.");
    const receipt = await db.applicationDemoRegistration.findUnique({ where: { applicationId },
        select: { syncedAt: true, reference: true, amountPaise: true } });
    const issues = [];
    if (app.leadSyncStatus === "PENDING") issues.push("delivery_pending");
    if (app.leadSyncStatus === "FAILED") issues.push("delivery_failed");
    if (receipt && !receipt.syncedAt) issues.push("payment_confirmation_pending");
    const base = process.env.JAYTRADE_STATUS_API_URL?.replace(/\/+$/, "");
    try {
        if (!base || !process.env.INDIPAY_API_KEY) throw new Error("Unconfigured");
        const response = await fetch(base + "/" + encodeURIComponent(applicationId) + "/status", {
            headers: { "X-API-Key": process.env.INDIPAY_API_KEY }, redirect: "error", signal: AbortSignal.timeout(5000),
        });
        if (response.status === 404) issues.push("lead_missing_in_jaytrade");
        else if (!response.ok) issues.push("jaytrade_lookup_unavailable");
        else {
            const result = await response.json();
            if (result.application_id !== applicationId || (app.leadId && result.lead_id && app.leadId !== String(result.lead_id))) issues.push("lead_mapping_mismatch");
            if (result.status === "Moved to Quick Action" && result.customer_linked === false) issues.push("customer_relationship_missing");
            const registration = result.registration;
            if (registration?.paid && (!receipt || receipt.reference !== registration.payment_reference ||
                receipt.amountPaise !== registration.amount_paise)) issues.push("payment_record_mismatch");
            if (receipt?.syncedAt && !registration?.paid) issues.push("jaytrade_payment_not_confirmed");
        }
    } catch { issues.push("jaytrade_lookup_unavailable"); }
    return { applicationId, issues, guidance: "Verify the authoritative records before any repair. This report makes no changes." };
}));

router.get("/wallet-reconciliation", route(async ({ user }) => {
    if (!canAdmin(user, "finance")) fail(403, "Finance access required.");
    const differences = await db.$queryRaw`
        SELECT w."userId", w."balancePaise", COALESCE(SUM(e."amountPaise"), 0)::text AS "ledgerPaise",
            (w."balancePaise" - COALESCE(SUM(e."amountPaise"), 0))::text AS "unexplainedOpeningPaise"
        FROM "MarketplaceWallet" w LEFT JOIN "MarketplaceLedgerEntry" e ON e."userId" = w."userId"
        GROUP BY w."userId", w."balancePaise"
        HAVING w."balancePaise" <> COALESCE(SUM(e."amountPaise"), 0)
        ORDER BY w."userId" LIMIT 100
    `;
    return { differences, limit: 100, guidance: "Compare differences to documented opening balances. Legacy opening balances may predate available ledger entries. No corrections are applied." };
}));

const sections = {
    services: { area: "content", model: "serviceOverride", search: ["id", "description"] },
    plans: { area: "marketplace", model: "merchantPlanOverride", search: ["id"] },
    customers: { area: "customers", model: "user", search: ["name", "email", "accountId"], select: { id: true, name: true, email: true, phone: true, accountId: true, role: true, isActive: true, createdAt: true }, where: { role: { in: ["CUSTOMER", "SELLER"] } } },
    applications: { area: "applications", model: "application", date: "submittedAt", search: ["applicationId", "fullName", "service", "leadId", "leadSyncStatus", "status"] },
    registrations: { area: "applications", model: "applicationDemoRegistration", date: "acceptedAt", search: ["applicationId", "service", "department", "staff", "reference"] },
    wallets: { area: "finance", model: "marketplaceWallet", key: "userId", search: ["userId"], select: { userId: true, balancePaise: true, user: { select: { name: true, accountId: true } } } },
    transactions: { area: "finance", model: "marketplaceLedgerEntry", search: ["reference", "userId"] },
    merchants: { area: "marketplace", model: "marketplaceStore", key: "userId", search: ["name", "username", "plan", "subscriptionStatus", "userId"], select: { userId: true, name: true, username: true, plan: true, merchantSuspended: true, subscriptionStatus: true, subscriptionStart: true, subscriptionEnd: true, subscriptionReference: true } },
    subscriptions: { area: "finance", model: "marketplaceLedgerEntry", search: ["reference", "userId"], where: { reference: { startsWith: "subscription:" } } },
    rewards: { area: "finance", model: "marketplaceLedgerEntry", search: ["reference", "userId"],
        where: { AND: [{ OR: ["reward:", "referral:", "learning:", "commission:"].map((prefix) => ({ reference: { startsWith: prefix } })) }] } },
    products: { area: "marketplace", model: "marketplaceProduct", search: ["name", "category", "sellerId"], select: { id: true, sellerId: true, name: true, category: true, price: true, stock: true, active: true, deletedAt: true, createdAt: true, variants: { where: { active: true }, select: { stock: true, attributes: true } } } },
    orders: { area: "marketplace", model: "marketplaceOrder", search: ["id", "userId"] },
    refunds: { area: "finance", model: "marketplaceOrder", search: ["id", "userId"], where: { management: { path: ["request", "status"], equals: "approved" }, refunded: false }, select: { id: true, userId: true, total: true, createdAt: true } },
    reviews: { area: "review", model: "marketplaceReviewReport", key: "reviewId", search: ["reason", "reviewId"], select: { reviewId: true, userId: true, reason: true, createdAt: true, review: { select: { rating: true, text: true, productId: true } } } },
    support: { area: "support", model: "supportRequest", search: ["subject", "status", "kind", "userId"] },
    content: { area: "content", model: "adminContent", date: "updatedAt", search: ["channel", "title"] },
    audit: { area: "audit", model: "adminAudit", search: ["actorId", "action", "target", "reason"] },
    admins: { area: "admins", model: "user", search: ["name", "email"], where: { role: "ADMIN" }, select: { id: true, name: true, email: true, adminRole: true, isActive: true, createdAt: true } },
};

function period(query, field) {
    const result = {};
    for (const [key, operator] of [["from", "gte"], ["to", "lt"]]) {
        if (!query[key]) continue;
        if (typeof query[key] !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(query[key])) fail(422, "Use a valid date.");
        const date = new Date(query[key] + "T00:00:00+05:30");
        if (!Number.isFinite(+date)) fail(422, "Use a valid date.");
        result[operator] = operator === "lt" ? new Date(+date + 86400000) : date;
    }
    if (result.gte && result.lt && result.gte >= result.lt) fail(422, "Start date must be before the end date.");
    return Object.keys(result).length ? { [field]: result } : {};
}

router.get("/session", route(({ user }) => ({
    role: user.adminRole ?? "SUPER", grants: permissions(user), roles: Object.keys(adminRoles),
    sections: Object.entries(sections).filter(([, config]) => canAdmin(user, config.area)).map(([name]) => name),
    finance: canAdmin(user, "finance"), applications: canAdmin(user, "applications"), marketplace: canAdmin(user, "marketplace"),
})));

router.get("/dashboard", route(async ({ user, query }) => {
    const metrics = [];
    const task = async (label, value, unit) => metrics.push({ label, value: await value, unit });
    const date = period(query, "createdAt");
    const tasks = [];
    if (canAdmin(user, "customers")) tasks.push(task("Customers", db.user.count({ where: { role: { in: ["CUSTOMER", "SELLER"] }, ...date } })));
    if (canAdmin(user, "marketplace")) tasks.push(
        task("Merchants", db.user.count({ where: { role: "SELLER" } })),
        task("Stores", db.marketplaceStore.count()),
        task("Products", db.marketplaceProduct.count({ where: { deletedAt: null } })),
        task("Active subscriptions", db.marketplaceStore.count({ where: publishedStore() })),
        task("Orders", db.marketplaceOrder.count({ where: date })),
        task("Marketplace sales volume", db.marketplaceOrder.aggregate({ where: { ...date, refunded: false }, _sum: { total: true } }).then((x) => (x._sum.total ?? 0) * 100), "paise"));
    if (canAdmin(user, "applications")) tasks.push(task("Applications", db.application.count({ where: period(query, "submittedAt") })),
        task("Application sync failures", db.application.count({ where: { leadSyncStatus: "FAILED" } })));
    if (canAdmin(user, "finance")) tasks.push(
        task("Customer wallet liabilities", db.marketplaceWallet.aggregate({ _sum: { balancePaise: true } }).then((x) => x._sum.balancePaise ?? 0), "paise"),
        task("Wallet transaction volume", db.marketplaceLedgerEntry.count({ where: date })),
        task("Recorded test subscription payments", db.marketplaceLedgerEntry.aggregate({ where: { ...date, reference: { startsWith: "subscription:" } }, _sum: { amountPaise: true } }).then((x) => -(x._sum.amountPaise ?? 0)), "paise"),
        task("Pending wallet verifications", db.applicationDemoCredit.count({ where: { status: "pending" } })));
    if (canAdmin(user, "support")) tasks.push(task("Open complaints", db.supportRequest.count({ where: { kind: "complaint", status: { not: "resolved" } } })));
    await Promise.all(tasks);
    return { metrics: metrics.sort((a, b) => a.label.localeCompare(b.label)),
        recent: canAdmin(user, "audit") ? await db.adminAudit.findMany({ where: date, orderBy: { createdAt: "desc" }, take: 8 }) : [] };
}));

router.get("/records/:section", route(async ({ user, params, query }) => {
    const setup = Object.hasOwn(sections, params.section) && sections[params.section];
    if (!setup || !canAdmin(user, setup.area)) fail(403, "Section access required.");
    const q = clean(query.q, 100);
    if (params.section === "plans") {
        const rows = (await listPlans()).filter(({ id }) => !q || id.includes(q.toLowerCase()));
        return { rows, total: rows.length, page: 1, size: 25 };
    }
    const date = setup.date ?? (["wallets", "merchants"].includes(params.section) ? null : "createdAt");
    const where = { ...setup.where, ...(date ? period(query, date) : {}),
        ...(q && { OR: setup.search.map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) }) };
    const page = Math.min(10000, Math.max(1, Number.parseInt(query.page, 10) || 1));
    const model = db[setup.model];
    const [rows, total] = await Promise.all([
        model.findMany({ where, select: setup.select, orderBy: { [date ?? setup.key ?? "id"]: "desc" }, take: 25, skip: (page - 1) * 25 }),
        model.count({ where }),
    ]);
    const data = params.section === "orders" ? rows.map((row) => ({ ...publicOrder(row), sellerStage:
        ["Placed", "Confirmed", "Processing", "Packed", "Shipped", "Out for delivery", "Delivered"][stageOf(row)] })) : rows;
    return { rows: data, total, page, size: 25 };
}));

router.get("/customers/:id", route(async ({ user, params }) => {
    if (!canAdmin(user, "customers")) fail(403, "Customer access required.");
    const result = await db.user.findFirst({ where: { id: params.id, role: { in: ["CUSTOMER", "SELLER"] } }, select: {
        ...sections.customers.select, applications: { take: 20, orderBy: { submittedAt: "desc" } },
        marketplaceWallet: { include: { entries: { take: 20, orderBy: { createdAt: "desc" } } } },
    } });
    if (!result) fail(404, "Customer unavailable.");
    return result;
}));

router.put("/manage/:section/:id", route(async ({ user, params, body }) => {
    const { section, id } = params;

        // Super Store temporary read-only mode
    const frozenSections = [
        "plans",
        "merchants",
        "subscriptions",
        "products",
        "orders",
        "refunds",
        "reviews"
    ];

    if (frozenSections.includes(section)) {
        fail(403, "Super Store is currently in preview mode.");
    }
    const config = Object.hasOwn(sections, section) && sections[section];
    if (!config || !canAdmin(user, config.area, true)) fail(403, "Management permission required.");
    const reason = confirmation(body);
    return db.$transaction(async (tx) => {
        if (section === "customers") {
            if (typeof body.isActive !== "boolean") fail(422, "Choose an account status.");
            await tx.user.update({ where: { id, role: { in: ["CUSTOMER", "SELLER"] } }, data: { isActive: body.isActive } });
        } else if (section === "services") {
            const key = clean(body.name, 180).toLowerCase();
            if (!key || typeof body.available !== "boolean") fail(422, "Enter a catalogue service name and availability.");
            const data = { description: clean(body.description, 1500), available: body.available };
            await tx.serviceOverride.upsert({ where: { id: key }, create: { id: key, ...data }, update: data });
            await audit(tx, user, "service.override", key, reason);
            return { success: true };
        } else if (section === "plans") {
            const { amountPaise, days, limit, available } = body;
            if (!Object.hasOwn(plans, id) || !Number.isInteger(amountPaise) || amountPaise < 100 || amountPaise > 100000000 ||
                !Number.isInteger(days) || days < 1 || days > 366 || (limit !== null && (!Number.isInteger(limit) || limit < 1 || limit > 10000)) ||
                typeof available !== "boolean") fail(422, "Review the plan price, validity and product limit.");
            const data = { amountPaise, days, limit, available };
            await tx.merchantPlanOverride.upsert({ where: { id }, create: { id, ...data }, update: data });
        } else if (section === "admins") {
            if (id === user.id || !Object.hasOwn(adminRoles, body.adminRole)) fail(422, "Choose a role for a different account.");
            await tx.user.update({ where: { id, isActive: true }, data: { role: "ADMIN", adminRole: body.adminRole } });
        } else if (section === "merchants" && typeof body.merchantSuspended === "boolean") {
            await tx.marketplaceStore.update({ where: { userId: id }, data: { merchantSuspended: body.merchantSuspended } });
        } else if (section === "products" && body.active === false) {
            await tx.marketplaceProduct.update({ where: { id }, data: { active: false } });
        } else if (section === "applications") {
            fail(409, "Jaytrade manages application stages.");
        } else if (section === "support" && ["open", "in_review", "resolved"].includes(body.status)) {
            await tx.supportRequest.update({ where: { id }, data: { status: body.status } });
        } else if (section === "content") {
            const { channel, active, position, image } = body;
            const title = clean(body.title, 140), text = clean(body.body, 2000);
            const startsAt = body.startsAt ? new Date(body.startsAt) : null;
            const endsAt = body.endsAt ? new Date(body.endsAt) : null;
            if (!channels.includes(channel) || !title || !text || typeof active !== "boolean" ||
                !Number.isInteger(position) || position < 0 || position > 1000 ||
                (image && (typeof image !== "string" || image.length > 550000 || !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(image))) ||
                (startsAt && !Number.isFinite(+startsAt)) || (endsAt && !Number.isFinite(+endsAt)) || (startsAt && endsAt && endsAt <= startsAt)) {
                fail(422, "Review the content fields and schedule.");
            }
            const data = { title, body: text, channel, active, position, image: image || null, startsAt, endsAt };
            const item = id === "new" ? await tx.adminContent.create({ data }) : await tx.adminContent.update({ where: { id }, data });
            await audit(tx, user, "content.save", item.id, reason);
            return { success: true };
        } else fail(422, "This action is unavailable.");
        await audit(tx, user, section + ".update", id, reason);
        return { success: true };
    });
}));

module.exports = router;
