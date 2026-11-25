const express = require("express");
const prisma = require("../src/config/prisma");
const { authenticateCustomer } = require("./auth");

const router = express.Router();
const categories = new Set(["Electronics", "Fashion", "Grocery", "Beauty", "Home & Living", "Accessories"]);
const stages = ["Confirmed", "Packed", "Shipped", "Delivered"];
const amount = (value, min = 1, max = 10000000) => Number.isInteger(value) && value >= min && value <= max;
const clean = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";

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
            res.status(500).json({ message: "Marketplace request failed." });
        }
    };
}

router.get("/catalog", route(async () => ({
    products: await prisma.marketplaceProduct.findMany({
        where: { active: true },
        include: { store: { select: { name: true } } },
        orderBy: { name: "asc" },
    }),
})));

router.use(authenticateCustomer, (req, res, next) => {
    if (!["GET", "HEAD"].includes(req.method) && req.get("X-Indipay-Marketplace") !== "1") {
        return res.status(403).json({ message: "Invalid marketplace request." });
    }
    next();
});

router.get("/account", route(async ({ user }) => {
    const [wallet, orders, store] = await Promise.all([
        prisma.marketplaceWallet.findUnique({ where: { userId: user.id }, include: { entries: { orderBy: { createdAt: "desc" }, take: 25 } } }),
        prisma.marketplaceOrder.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
        prisma.marketplaceStore.findUnique({ where: { userId: user.id }, include: { products: { where: { active: true } } } }),
    ]);
    const sellerOrders = store ? await prisma.marketplaceOrder.findMany({
        where: { lines: { array_contains: [{ sellerId: user.id }] } },
        orderBy: { createdAt: "desc" },
    }) : [];
    return { role: user.role, wallet, orders, store, sellerOrders: sellerOrders.map(({ userId, ...order }) => order) };
}));

router.put("/store", route(async ({ user, body }) => {
    if (!["SELLER", "ADMIN"].includes(user.role)) fail(403, "Seller approval required.");
    const name = clean(body?.name, 80);
    if (!name) fail(400, "Store name is required.");
    const data = { name, description: clean(body.description, 500) };
    return prisma.marketplaceStore.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
}));

router.put("/products/:id", route(async ({ user, body, params }) => {
    if (!["SELLER", "ADMIN"].includes(user.role)) fail(403, "Seller approval required.");
    const { price, original, stock, category } = body ?? {};
    const name = clean(body?.name, 100);
    const description = clean(body?.description, 1000);
    const image = body?.image ?? "";
    const imageValid = typeof image === "string" && (image === "" ||
        (image.length <= 550000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(image)));
    if (!name || !description || !categories.has(category) || !amount(price) ||
        !amount(original, price) || !amount(stock, 0, 1000000) || !imageValid) fail(400, "Invalid listing.");
    const data = { name, description, price, original, stock, category, image };
    if (params.id === "new") {
        if (!await prisma.marketplaceStore.findUnique({ where: { userId: user.id } })) fail(400, "Create your store first.");
        return prisma.marketplaceProduct.create({ data: { ...data, sellerId: user.id } });
    }
    const result = await prisma.marketplaceProduct.updateMany({ where: { id: params.id, sellerId: user.id, active: true }, data });
    if (!result.count) fail(404, "Listing not found.");
    return { success: true };
}));

router.delete("/products/:id", route(async ({ user, params }) => {
    if (!["SELLER", "ADMIN"].includes(user.role)) fail(403, "Seller approval required.");
    const result = await prisma.marketplaceProduct.updateMany({
        where: { id: params.id, sellerId: user.id, active: true }, data: { active: false },
    });
    if (!result.count) fail(404, "Listing not found.");
    return { success: true };
}));

router.post("/checkout", route(async ({ user, body }) => {
    const { id, items, expectedTotal } = body ?? {};
    if (!amount(expectedTotal) || typeof id !== "string" || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id) || !Array.isArray(items) || items.length < 1 || items.length > 30 ||
        items.some((item) => typeof item?.id !== "string" || !amount(item.quantity, 1, 100)) ||
        new Set(items.map((item) => item.id)).size !== items.length) fail(400, "Invalid order.");

    return prisma.$transaction(async (tx) => {
        const existing = await tx.marketplaceOrder.findUnique({ where: { id } });
        if (existing) {
            if (existing.userId !== user.id) fail(409, "Order reference unavailable.");
            return existing;
        }
        const lines = [];
        let total = 0;
        for (const item of [...items].sort((a, b) => a.id.localeCompare(b.id))) {
            const product = await tx.marketplaceProduct.findUnique({ where: { id: item.id } });
            if (!product?.active || product.stock < item.quantity) fail(409, "A product is unavailable in that quantity.");
            if (product.sellerId === user.id) fail(400, "You cannot purchase your own listing.");
            if (lines.length && product.sellerId !== lines[0].sellerId) fail(400, "Check out one store at a time.");
            total += product.price * item.quantity;
            if (!amount(total)) fail(400, "Order total is too large.");
            lines.push({ id: product.id, sellerId: product.sellerId, name: product.name, price: product.price, quantity: item.quantity });
            const updated = await tx.marketplaceProduct.updateMany({
                where: { id: product.id, active: true, stock: { gte: item.quantity }, price: product.price },
                data: { stock: { decrement: item.quantity } },
            });
            if (!updated.count) fail(409, "Stock or price changed. Refresh your cart.");
        }
        if (total !== expectedTotal) fail(409, "Prices changed. Refresh the marketplace before checking out.");
        const debit = await tx.marketplaceWallet.updateMany({
            where: { userId: user.id, balance: { gte: total } }, data: { balance: { decrement: total } },
        });
        if (!debit.count) fail(409, "Insufficient wallet balance.");
        await tx.marketplaceLedgerEntry.create({ data: { userId: user.id, amount: -total, reference: `order:${id}` } });
        return tx.marketplaceOrder.create({ data: { id, userId: user.id, total, lines } });
    }, { isolationLevel: "Serializable" });
}));

router.patch("/orders/:id/delivery", route(async ({ user, params, body }) => {
    const order = await prisma.marketplaceOrder.findUnique({ where: { id: params.id } });
    if (!order || (user.role !== "ADMIN" && order.lines[0]?.sellerId !== user.id)) fail(404, "Order not found.");
    if (!amount(body?.stage, 0, stages.length - 1) || body.stage !== order.sellerStage + 1) fail(400, "Select the next delivery stage.");
    const updated = await prisma.marketplaceOrder.updateMany({
        where: { id: order.id, refunded: false, sellerStage: order.sellerStage }, data: { sellerStage: body.stage },
    });
    if (!updated.count) fail(409, "Order status changed.");
    return { success: true };
}));

router.use("/admin", (req, res, next) => {
    if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Admin access required." });
    next();
});

router.get("/admin/recent", route(async () => {
    const [users, orders] = await Promise.all([
        prisma.user.findMany({ take: 50, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true } }),
        prisma.marketplaceOrder.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
    ]);
    return { users, orders };
}));

router.patch("/admin/sellers/:id", route(async ({ params, body }) => {
    if (typeof body?.approved !== "boolean") fail(400, "Approval must be true or false.");
    const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.user.updateMany({
            where: { id: params.id, role: { in: ["CUSTOMER", "SELLER"] } },
            data: { role: body.approved ? "SELLER" : "CUSTOMER" },
        });
        if (updated.count && !body.approved) {
            await tx.marketplaceProduct.updateMany({ where: { sellerId: params.id }, data: { active: false } });
        }
        return updated;
    });
    if (!result.count) fail(404, "Account not found.");
    return { success: true };
}));

router.post("/admin/wallets/:id/credits", route(async ({ params, body }) => {
    if (!amount(body?.amount) || !/^[\w-]{8,80}$/.test(body?.reference ?? "")) fail(400, "Amount and a unique credit reference are required.");
    return prisma.$transaction(async (tx) => {
        const wallet = await tx.marketplaceWallet.upsert({
            where: { userId: params.id },
            create: { userId: params.id, balance: body.amount },
            update: { balance: { increment: body.amount } },
        });
        await tx.marketplaceLedgerEntry.create({ data: { userId: params.id, amount: body.amount, reference: `credit:${body.reference}` } });
        return wallet;
    });
}));

router.post("/admin/orders/:id/refund", route(async ({ params }) =>
    prisma.$transaction(async (tx) => {
        const order = await tx.marketplaceOrder.findUnique({ where: { id: params.id } });
        if (!order) fail(404, "Order not found.");
        if (order.refunded) return order;
        const updated = await tx.marketplaceOrder.updateMany({ where: { id: order.id, refunded: false }, data: { refunded: true } });
        if (!updated.count) fail(409, "Order is already being refunded.");
        await tx.marketplaceWallet.update({ where: { userId: order.userId }, data: { balance: { increment: order.total } } });
        await tx.marketplaceLedgerEntry.create({ data: { userId: order.userId, amount: order.total, reference: `refund:${order.id}` } });
        for (const line of order.lines) {
            await tx.marketplaceProduct.update({ where: { id: line.id }, data: { stock: { increment: line.quantity } } });
        }
        return { ...order, refunded: true };
    }, { isolationLevel: "Serializable" })
));

module.exports = router;
