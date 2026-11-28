const express = require("express");
const prisma = require("../src/config/prisma");
const { authenticateCustomer } = require("./auth");
const { installCheckoutRoutes, checkoutEnabled } = require("../src/superstoreCheckout");
const { installOrderRoutes, publicOrder, managesStore, requestOptions } = require("../src/superstoreOrders");

const { installManagementRoutes, publicStoreFields } = require("../src/superstoreManagement");
const { publishedStore, subscriptionStatus } = require("../src/merchantSubscription");
const { requireAdminArea, confirmation, audit } = require("../src/adminAccess");
const { installPublicReviews, installSocialRoutes, socialNotifications } = require("../src/superstoreSocial");

const router = express.Router();

// TEMPORARY SUPER STORE PREVIEW MODE
const SUPERSTORE_PREVIEW_MODE = true;

router.use((req, res, next) => {
    if (
        SUPERSTORE_PREVIEW_MODE &&
        !["GET", "HEAD", "OPTIONS"].includes(req.method)
    ) {
        return res.status(403).json({
            success: false,
            message: "Indipay Super Store is coming soon. Currently available for browsing only.",
        });
    }

    next();
});
const amount = (value, min = 1, max = 10000000) => Number.isInteger(value) && value >= min && value <= max;

function fail(status, message) {
    throw Object.assign(new Error(message), { status });
}

function route(handler) {
    return async (req, res) => {
        try {
            res.json(await handler(req));
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            if (["P2002", "P2034"].includes(error.code)) {
                return res.status(409).json({ message: "This request conflicted with another update. Refresh and retry." });
            }
            console.error("Marketplace request failed:", error.code || error.name);
            res.status(500).json({ message: "Superstore request failed." });
        }
    };
}

router.get("/catalog", route(async () => {
    const published = publishedStore();
    const [products, stores, reviews] = await Promise.all([prisma.marketplaceProduct.findMany({
        where: { active: true, deletedAt: null, store: published },
        include: { store: { select: { name: true } }, variants: { where: { active: true }, select: {
            id: true, attributes: true, price: true, original: true, stock: true,
        } }, _count: { select: { variants: true } } },
        orderBy: { name: "asc" },
    }), prisma.marketplaceStore.findMany({ where: published, select: { ...publicStoreFields, _count: { select: { followers: { where: { following: true } } } } } }),
    prisma.marketplaceReview.groupBy({ by: ["productId"], where: { product: { active: true, store: published } }, _avg: { rating: true }, _count: { _all: true } })]);
    const ratings = new Map(reviews.map((row) => [row.productId, row]));
    return {
        stores: stores.map(({ _count, ...store }) => ({ ...store, followers: _count.followers })),
        products: products.map(({ _count, ...product }) => ({
            ...product, hasVariants: _count.variants > 0,
            rating: ratings.get(product.id)?._avg.rating ?? null, reviewCount: ratings.get(product.id)?._count._all ?? 0,
        })),
    };
}));
installPublicReviews(router, prisma, route);

router.use(authenticateCustomer, (req, res, next) => {
    if (!["GET", "HEAD"].includes(req.method) && req.get("X-Indipay-Marketplace") !== "1") {
        return res.status(403).json({ message: "Invalid Superstore request." });
    }
    next();
});

const managementBody = express.json({ limit: "2500kb" });
const standardBody = express.json({ limit: "600kb" });
router.use((req, res, next) => {
    const editing = req.method === "PUT" && (req.path === "/store" || req.path.startsWith("/products/"));
    return (editing ? managementBody : standardBody)(req, res, next);
});

router.get("/account", route(async ({ user }) => {
    const [wallet, orders, store, creditRequests] = await Promise.all([
        prisma.marketplaceWallet.findUnique({ where: { userId: user.id }, include: { entries: { orderBy: { createdAt: "desc" } } } }),
        prisma.marketplaceOrder.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
        prisma.marketplaceStore.findUnique({ where: { userId: user.id }, include: { products: { where: { deletedAt: null }, include: { variants: { where: { active: true } } }, orderBy: { name: "asc" } } } }),
        prisma.applicationDemoCredit.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" },
            select: { id: true, purpose: true, amountPaise: true, status: true, remarks: true, createdAt: true } }),
    ]);
    const sellerOrders = store ? await prisma.marketplaceOrder.findMany({
        where: { lines: { array_contains: [{ sellerId: user.id }] } },
        orderBy: { createdAt: "desc" },
    }) : [];
   return {
    role: user.role,
    wallet: wallet ?? {
        userId: user.id,
        balancePaise: 0,
        entries: [],
    },
    store,
    creditRequests,
    merchantSubscription: subscriptionStatus(store, user.role),
        orders: orders.map((order) => ({ ...publicOrder(order), requestOptions: requestOptions(order) })),
        sellerOrders: sellerOrders.map(({ userId, ...order }) => {
            const canManage = managesStore(order, user);
            if (canManage) {
                const details = order.checkoutDetails;
                const checkoutDetails = details && {
                    store: details.store, address: details.address, notes: details.notes, demo: details.demo,
                    deliveryLabel: details.deliveryLabel, estimatedDate: details.estimatedDate,
                };
                return { ...publicOrder(order), checkoutDetails, canManage };
            }
            const lines = order.lines.filter((line) => line.sellerId === user.id);
            return {
                id: order.id, lines, total: lines.reduce((sum, line) => sum + line.quantity * line.price, 0),
                sellerStage: order.sellerStage, refunded: order.refunded, createdAt: order.createdAt, canManage,
            };
        }) };
}));

installManagementRoutes(router, prisma, route, fail);
installSocialRoutes(router, prisma, route, fail);

installCheckoutRoutes(router, prisma, route);
const approveRefund = installOrderRoutes(router, prisma, route, fail);

router.get("/notifications", route(async ({ user }) => {
    const where = { checkoutDetails: { path: ["demo"], equals: true } };
    const [purchases, sales, updates, social] = await Promise.all([
        prisma.marketplaceCheckout.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 12 }),
        prisma.marketplaceOrder.findMany({ where: { ...where, lines: { array_contains: [{ sellerId: user.id }] } },
            orderBy: { createdAt: "desc" }, take: 12 }),
        prisma.marketplaceOrder.findMany({
            where: { managementUpdatedAt: { not: null }, OR: [
                { userId: user.id }, { lines: { array_contains: [{ sellerId: user.id }] } },
            ] },
            orderBy: { managementUpdatedAt: "desc" }, take: 30,
        }),
        socialNotifications(prisma, user.id),
    ]);
    const events = [
        ...social,
        ...purchases.map(({ id, createdAt }) => ({ id, key: id, date: createdAt, title: "Demo order placed and wallet payment confirmed" })),
        ...sales.map(({ id, createdAt }) => ({ id, key: "seller-" + id, date: createdAt, seller: true, title: "New customer order · Demo" })),
        ...updates.flatMap((order) => (order.management?.events ?? []).flatMap((event, index) => {
            const seller = event.audience === "seller";
            if (seller ? !managesStore(order, user) : order.userId !== user.id) return [];
            return [{ id: order.id, key: order.id + "-" + event.at + "-" + index, seller, date: new Date(event.at), title: event.title }];
        })),
    ];
    return { events: events.sort((a, b) => b.date - a.date).slice(0, 40) };
}));

router.use("/admin", (req, res, next) => {
    if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Admin access required." });
    next();
});

router.get("/admin/recent", requireAdminArea("admins"), route(async () => {
    const [users, orders, transactions, openRequests, reviewReports] = await Promise.all([
        prisma.user.findMany({ take: 50, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true } }),
        prisma.marketplaceOrder.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
        prisma.marketplaceLedgerEntry.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
        prisma.marketplaceOrder.findMany({ where: { refunded: false, OR: ["pending", "approved"].map((status) => ({
            management: { path: ["request", "status"], equals: status },
        })) }, orderBy: { managementUpdatedAt: "desc" } }),
        prisma.marketplaceReviewReport.findMany({ orderBy: { createdAt: "desc" }, take: 30,
            select: { reviewId: true, userId: true, reason: true, createdAt: true,
                review: { select: { text: true, rating: true, product: { select: { name: true } } } } } }),
    ]);
    const orderList = new Map([...openRequests, ...orders].map((order) => [order.id, publicOrder(order)]));
    return { users, orders: [...orderList.values()], transactions, reviewReports, demoRefundsEnabled: checkoutEnabled() };
}));

router.patch("/admin/sellers/:id", requireAdminArea("marketplace"), route(async ({ user, params, body }) => {
    const reason = confirmation(body);
    if (typeof body?.approved !== "boolean") fail(400, "Approval must be true or false.");
    const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.user.updateMany({
            where: { id: params.id, role: { in: ["CUSTOMER", "SELLER"] } },
            data: { role: body.approved ? "SELLER" : "CUSTOMER" },
        });
        if (updated.count && !body.approved) {
            await tx.marketplaceProduct.updateMany({ where: { sellerId: params.id }, data: { active: false } });
        }
        if (updated.count) {
            await tx.marketplaceStore.updateMany({ where: { userId: params.id }, data: { merchantSuspended: !body.approved } });
            await audit(tx, user, "merchant.approval", params.id, reason);
        }
        return updated;
    });
    if (!result.count) fail(404, "Account not found.");
    return { success: true };
}));

router.post("/admin/wallets/:id/credits", requireAdminArea("finance"), route(async ({ user, params, body }) => {
    const reason = confirmation(body);
    if (!amount(body?.amount) || !/^[\w-]{8,80}$/.test(body?.reference ?? "")) fail(400, "Amount and a unique credit reference are required.");
    return prisma.$transaction(async (tx) => {
        const wallet = await tx.marketplaceWallet.upsert({
            where: { userId: params.id },
            create: { userId: params.id, balancePaise: body.amount * 100 },
            update: { balancePaise: { increment: body.amount * 100 } },
        });
        await tx.marketplaceLedgerEntry.create({ data: { userId: params.id, amountPaise: body.amount * 100, reference: `credit:${body.reference}` } });
        await audit(tx, user, "wallet.adjustment", params.id, reason);
        return wallet;
    });
}));

router.post("/admin/orders/:id/refund", requireAdminArea("finance"), route(approveRefund));

module.exports = router;
