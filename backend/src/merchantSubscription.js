const { randomUUID } = require("node:crypto");

const plans = {
    starter: { amountPaise: 29900, limit: 10 },
    business: { amountPaise: 69900, limit: 50 },
    premium: { amountPaise: 149900, limit: Infinity },
};
async function planTerms(db, id) {
    if (!Object.hasOwn(plans, id)) return null;
    const saved = await db.merchantPlanOverride.findUnique({ where: { id } });
    return saved ? { ...saved, limit: saved.limit ?? Infinity } : { ...plans[id], days: 30, available: true };
}
const uuid = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
// Temporarily disabled until Super Store launches.
function samplePaymentEnabled() {
    return false;
}

function subscriptionStatus(store, role, now = new Date()) {
    if (!store) return "unregistered";
    if (store.merchantSuspended) return "suspended";
    if (store.subscriptionEnd && store.subscriptionEnd <= now) return "expired";
    if (role === "SELLER" && store.subscriptionStatus === "active" && store.subscriptionStart && store.subscriptionStart <= now &&
        store.subscriptionEnd > now && Object.hasOwn(plans, store.plan) && store.subscriptionReference) return "active";
    return "pending";
}

function publishedStore(now = new Date()) {
    return {
        merchantSuspended: false, subscriptionStatus: "active", subscriptionStart: { lte: now },
        subscriptionEnd: { gt: now }, subscriptionReference: { not: null }, plan: { in: Object.keys(plans) },
        user: { isActive: true, role: "SELLER" },
    };
}

async function requireSubscription(db, userId, fail) {
    const store = await db.marketplaceStore.findUnique({ where: { userId }, include: { user: { select: { role: true, isActive: true } } } });
    if (!store?.user.isActive || subscriptionStatus(store, store.user.role) !== "active") fail(403, "An active paid merchant subscription is required.");
    return store;
}

async function merchantSummary(db, store, role, wallet) {
    const terms = store?.pendingPlan ? await planTerms(db, store.pendingPlan) : null;
    return {
        paymentEnabled: samplePaymentEnabled(), status: subscriptionStatus(store, role),
        balancePaise: wallet?.balancePaise ?? 0,
        store: store ? {
            name: store.name, username: store.username, plan: store.plan, pendingPlan: store.pendingPlan,
            subscriptionStart: store.subscriptionStart, subscriptionEnd: store.subscriptionEnd,
            paymentReference: store.subscriptionReference, intentId: store.subscriptionIntent,
            amountPaise: terms?.amountPaise ?? null, days: terms?.days ?? null, planAvailable: terms?.available ?? false,
        } : null,
    };
}

function installMerchantRoutes(router, db, route, fail, validateProfile) {
    const customer = (user) => {
        if (!["CUSTOMER", "SELLER"].includes(user.role)) fail(403, "Use your customer account to register a merchant store.");
    };

    router.get("/merchant/subscription", route(async ({ user }) => {
        customer(user);
        const [store, wallet] = await Promise.all([
            db.marketplaceStore.findUnique({ where: { userId: user.id } }),
            db.marketplaceWallet.findUnique({ where: { userId: user.id }, select: { balancePaise: true } }),
        ]);
        return merchantSummary(db, store, user.role, wallet);
    }));

    router.post("/merchant/registration", route(async ({ user, body }) => {
        customer(user);
        const plan = body?.plan;
        if (!Object.hasOwn(plans, plan)) fail(422, "Choose a valid merchant plan.");
        return db.$transaction(async (tx) => {
            const current = await tx.marketplaceStore.findUnique({ where: { userId: user.id } });
            if (current?.merchantSuspended) fail(403, "This merchant account is suspended.");
            const listingCount = await tx.marketplaceProduct.count({ where: { sellerId: user.id, deletedAt: null } });
            const terms = await planTerms(tx, plan);
            if (!terms.available) fail(409, "This plan is unavailable.");
            if (listingCount > terms.limit) fail(409, "Choose a plan that covers your existing products.");
            if (current?.subscriptionIntent && current.pendingPlan === plan) return merchantSummary(tx, current, user.role,
                await tx.marketplaceWallet.findUnique({ where: { userId: user.id } }));
            const profile = body.details ? validateProfile(body.details, current, true) : {};
            if (!current && !body.details) fail(422, "Enter your store details first.");
            const data = { ...profile, pendingPlan: plan, subscriptionIntent: randomUUID() };
            const store = await tx.marketplaceStore.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
            return merchantSummary(tx, store, user.role, await tx.marketplaceWallet.findUnique({ where: { userId: user.id } }));
        }, { isolationLevel: "Serializable" });
    }));

    router.post("/merchant/payment", route(async ({ user, body }) => {
        customer(user);
        if (!samplePaymentEnabled()) fail(403, "Merchant test payments are disabled on this server.");
        if (typeof body?.intentId !== "string" || !uuid.test(body.intentId)) fail(422, "Refresh the subscription quote.");
        const reference = "subscription:" + body.intentId;
        return db.$transaction(async (tx) => {
            const store = await tx.marketplaceStore.findUnique({ where: { userId: user.id } });
            if (!store || store.merchantSuspended) fail(403, "Merchant activation is unavailable.");
            const previous = await tx.marketplaceLedgerEntry.findUnique({ where: { reference } });
            if (previous?.userId === user.id) {
                const account = await tx.user.findUnique({ where: { id: user.id }, select: { role: true } });
                const wallet = await tx.marketplaceWallet.findUnique({ where: { userId: user.id } });
                return { ...await merchantSummary(tx, store, account.role, wallet), paymentReference: reference };
            }
            if (store.subscriptionIntent !== body.intentId || !Object.hasOwn(plans, store.pendingPlan)) fail(409, "The subscription quote changed.");
            const plan = store.pendingPlan;
            const { amountPaise, limit, days, available } = await planTerms(tx, plan);
            if (!available) fail(409, "This plan is unavailable.");
            if (body.amountPaise !== amountPaise || body.days !== days) fail(409, "Review the current subscription terms.");
            const count = await tx.marketplaceProduct.count({ where: { sellerId: user.id, deletedAt: null } });
            if (count > limit) fail(409, "Choose a plan that covers your existing products.");
            const debit = await tx.marketplaceWallet.updateMany({
                where: { userId: user.id, balancePaise: { gte: amountPaise } },
                data: { balancePaise: { decrement: amountPaise } },
            });
            if (!debit.count) fail(409, "Insufficient Customer Money for this test subscription.");
            await tx.marketplaceLedgerEntry.create({ data: { userId: user.id, reference, amountPaise: -amountPaise } });
            const now = new Date();
            const renew = subscriptionStatus(store, user.role, now) === "active" && store.plan === plan;
            const end = new Date((renew ? store.subscriptionEnd : now).getTime() + days * 86400000);
            const activated = await tx.marketplaceStore.update({ where: { userId: user.id }, data: {
                plan, pendingPlan: null, subscriptionIntent: null, subscriptionStatus: "active",
                subscriptionStart: renew ? store.subscriptionStart : now, subscriptionEnd: end, subscriptionReference: reference,
                subscriptionProductLimit: Number.isFinite(limit) ? limit : -1,
            } });
            await tx.user.update({ where: { id: user.id, role: { in: ["CUSTOMER", "SELLER"] }, isActive: true }, data: { role: "SELLER" } });
            const wallet = await tx.marketplaceWallet.findUnique({ where: { userId: user.id } });
            return { ...await merchantSummary(tx, activated, "SELLER", wallet), paymentReference: reference };
        }, { isolationLevel: "Serializable" });
    }));
}

module.exports = { installMerchantRoutes, plans, planTerms, publishedStore, requireSubscription, subscriptionStatus, samplePaymentEnabled };
