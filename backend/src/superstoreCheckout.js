const { createHash, randomUUID } = require("node:crypto");
const { publishedStore } = require("./merchantSubscription");

const methods = {
    standard: { label: "Standard delivery", charge: 0, days: 5 },
    express: { label: "Express delivery", charge: 79, days: 2 },
    local: { label: "Local delivery", charge: 29, days: 1 },
    pickup: { label: "In-store pickup", charge: 0, days: 1 },
};
const addressFields = { fullName: 100, mobile: 20, building: 120, locality: 120, landmark: 120, city: 80, district: 80, state: 80, pin: 6, type: 10 };
const uuid = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const maximum = 10_000_000;

function checkoutEnabled() {
    return false;
}

function fail(status, message) {
    throw Object.assign(new Error(message), { status });
}

function addressDetails(input) {
    const details = {};
    for (const [key, limit] of Object.entries(addressFields)) {
        const value = typeof input?.[key] === "string" ? input[key].trim() : "";
        if ((!value && key !== "landmark") || value.length > limit) fail(422, "Complete all required address fields.");
        details[key] = value;
    }
    details.mobile = details.mobile.replace(/\s/g, "").replace(/^\+91/, "");
    if (!/^[6-9]\d{9}$/.test(details.mobile) || !/^[1-9]\d{5}$/.test(details.pin) ||
        !["Home", "Work", "Other"].includes(details.type)) fail(422, "Enter a valid Indian mobile number, PIN and address type.");
    return details;
}

function validItems(items) {
    return Array.isArray(items) && items.length >= 1 && items.length <= 30 &&
        items.every((item) => typeof item?.id === "string" && uuid.test(item.id) &&
            (item.variantId == null || (typeof item.variantId === "string" && uuid.test(item.variantId))) &&
            Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 100) &&
        new Set(items.map((item) => JSON.stringify([item.id, item.variantId ?? null]))).size === items.length;
}

async function quoteCheckout(db, userId, body, now = new Date()) {
    const { addressId, items, delivery, notes = "" } = body ?? {};
    if (!validItems(items) || typeof addressId !== "string" || !uuid.test(addressId) ||
        typeof notes !== "string" || notes.length > 500) fail(422, "Review your items, address and order notes.");
    const [address, products, wallet] = await Promise.all([
        db.marketplaceAddress.findFirst({ where: { id: addressId, userId } }),
        db.marketplaceProduct.findMany({
            where: { id: { in: items.map((item) => item.id) }, active: true, store: publishedStore(now) },
            include: { store: { select: { name: true } }, variants: true },
        }),
        db.marketplaceWallet.findUnique({ where: { userId }, select: { balancePaise: true } }),
    ]);
    if (!address) fail(404, "Select a saved delivery address.");
    const available = new Map(products.map((product) => [product.id, product]));
    const groups = new Map();
    for (const item of [...items].sort((a, b) => a.id.localeCompare(b.id) || (a.variantId ?? "").localeCompare(b.variantId ?? ""))) {
        const product = available.get(item.id);
        const variant = product?.variants.find(({ id, active }) => active && id === item.variantId);
        if (!product || ((item.variantId != null || product.variants.length) && !variant) ||
            (variant ?? product).stock < item.quantity) fail(409, "Stock or options changed. Return to your cart and review the selection.");
        if (product.sellerId === userId) fail(422, "You cannot purchase your own listing.");
        const offer = variant ?? product;
        if (!groups.has(product.sellerId)) {
            const method = delivery?.[product.sellerId] ?? "standard";
            if (typeof method !== "string" || !Object.hasOwn(methods, method)) fail(422, "Select a supported delivery method.");
            const { label, charge, days } = methods[method];
            const date = new Date(now);
            date.setUTCDate(date.getUTCDate() + days);
            groups.set(product.sellerId, {
                sellerId: product.sellerId, store: product.store.name, method, deliveryLabel: label,
                deliveryCharge: charge, estimatedDate: date.toISOString().slice(0, 10), lines: [],
            });
        }
        groups.get(product.sellerId).lines.push({
            id: product.id, sellerId: product.sellerId, name: product.name, variantId: variant?.id ?? null,
            variantName: variant ? Object.values(variant.attributes).join(" · ") : "",
            quantity: item.quantity, price: offer.price, original: offer.original,
        });
    }
    const stores = [...groups.values()].map((group) => {
        const subtotal = group.lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { ...group, subtotal, total: subtotal + group.deliveryCharge };
    });
    const subtotal = stores.reduce((sum, group) => sum + group.subtotal, 0);
    const deliveryTotal = stores.reduce((sum, group) => sum + group.deliveryCharge, 0);
    const discount = stores.flatMap(({ lines }) => lines).reduce((sum, line) => sum + (line.original - line.price) * line.quantity, 0);
    const total = subtotal + deliveryTotal;
    if (!Number.isSafeInteger(total) || total < 1 || total > maximum) fail(422, "Order total exceeds the checkout limit.");
    const draft = { address: address.details, notes: notes.trim(), stores, subtotal, deliveryTotal, discount, total };
    const fingerprint = createHash("sha256").update(JSON.stringify({ userId, ...draft })).digest("hex");
    return { ...draft, fingerprint, balance: (wallet?.balancePaise ?? 0) / 100, demo: true };
}

async function commitCheckout(prisma, userId, body) {
    const { id, fingerprint } = body ?? {};
    if (typeof id !== "string" || !uuid.test(id) || typeof fingerprint !== "string" || !/^[\da-f]{64}$/.test(fingerprint)) {
        fail(422, "Refresh the checkout summary before confirming.");
    }
    const findExisting = async (db) => {
        const previous = await db.marketplaceCheckout.findUnique({ where: { id } });
        if (previous && previous.userId !== userId) fail(409, "Checkout reference unavailable.");
        return previous;
    };
    try {
        return await prisma.$transaction(async (tx) => {
            const existing = await findExisting(tx);
            if (existing) return existing;
            const quote = await quoteCheckout(tx, userId, body);
            if (quote.fingerprint !== fingerprint) fail(409, "Checkout details changed. Review the updated quote and confirm again.");
            const debit = await tx.marketplaceWallet.updateMany({
                where: { userId, balancePaise: { gte: quote.total * 100 } },
                data: { balancePaise: { decrement: quote.total * 100 } },
            });
            if (!debit.count) fail(409, "Insufficient eligible Customer Money.");
            const payment = await tx.marketplaceLedgerEntry.create({ data: { userId, amountPaise: -quote.total * 100, reference: "order:" + id } });
            const orderIds = [];
            for (const store of quote.stores) {
                for (const line of store.lines) {
                    const inventory = line.variantId ? tx.marketplaceVariant : tx.marketplaceProduct;
                    const changed = await inventory.updateMany({
                        where: { id: line.variantId ?? line.id, price: line.price, active: true, stock: { gte: line.quantity } },
                        data: { stock: { decrement: line.quantity } },
                    });
                    if (!changed.count) fail(409, "Stock or prices changed. Review your cart.");
                }
                const orderId = randomUUID();
                const { lines, ...delivery } = store;
                await tx.marketplaceOrder.create({
                    data: {
                        id: orderId, userId, lines, total: store.total,
                        checkoutDetails: {
                            ...delivery, address: quote.address, notes: quote.notes, checkoutId: id, demo: true,
                            paymentReference: payment.reference, walletTransactionId: payment.id,
                        },
                    },
                });
                orderIds.push(orderId);
            }
            return tx.marketplaceCheckout.create({ data: { id, userId, total: quote.total, paymentReference: payment.reference, orderIds } });
        }, { isolationLevel: "Serializable" });
    } catch (error) {
        if (["P2002", "P2034"].includes(error.code)) {
            const previous = await findExisting(prisma);
            if (previous) return previous;
        }
        throw error;
    }
}

function installCheckoutRoutes(router, prisma, route) {
    router.get("/checkout/config", route(async () => ({ enabled: checkoutEnabled(), demo: true, methods })));
    const enabled = (handler) => route(async (req) => {
        if (!checkoutEnabled()) fail(403, "Super Store payments are disabled. Demo checkout is available on an enabled test environment.");
        return handler(req);
    });
    router.get("/addresses", enabled(async ({ user }) =>
        prisma.marketplaceAddress.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] })));
    router.put("/addresses/:id", enabled(async ({ user, params, body }) => {
        const details = addressDetails(body?.details);
        return prisma.$transaction(async (tx) => {
            const where = { userId: user.id };
            const current = params.id === "new" ? null : await tx.marketplaceAddress.findFirst({ where: { ...where, id: params.id } });
            if (params.id !== "new" && !current) fail(404, "Address not found.");
            const count = await tx.marketplaceAddress.count({ where });
            if (!current && count >= 12) fail(422, "Delete an existing address before saving another.");
            const isDefault = Boolean(body?.isDefault === true || current?.isDefault || count === 0);
            if (isDefault) await tx.marketplaceAddress.updateMany({ where: { ...where, isDefault: true }, data: { isDefault: false } });
            const data = { details, isDefault };
            return current
                ? tx.marketplaceAddress.update({ where: { id: current.id }, data })
                : tx.marketplaceAddress.create({ data: { ...data, userId: user.id } });
        }, { isolationLevel: "Serializable" });
    }));
    router.delete("/addresses/:id", enabled(async ({ user, params }) =>
        prisma.$transaction(async (tx) => {
            const where = { userId: user.id };
            const current = await tx.marketplaceAddress.findFirst({ where: { ...where, id: params.id } });
            if (!current) fail(404, "Address not found.");
            await tx.marketplaceAddress.delete({ where: { id: current.id } });
            if (current.isDefault) {
                const next = await tx.marketplaceAddress.findFirst({ where, orderBy: { createdAt: "asc" } });
                if (next) await tx.marketplaceAddress.update({ where: { id: next.id }, data: { isDefault: true } });
            }
            return { success: true };
        }, { isolationLevel: "Serializable" })));
    async function withPurchased(receipt) {
        const orders = await prisma.marketplaceOrder.findMany({
            where: { id: { in: receipt.orderIds }, userId: receipt.userId }, select: { lines: true },
        });
        return { ...receipt, purchased: orders.flatMap(({ lines }) => lines) };
    }
    router.post("/checkout/quote", enabled(({ user, body }) => quoteCheckout(prisma, user.id, body)));
    router.get("/checkout/:id", enabled(async ({ user, params }) => {
        const receipt = await prisma.marketplaceCheckout.findFirst({ where: { id: params.id, userId: user.id } });
        if (!receipt) fail(404, "No confirmed payment found for this checkout.");
        return withPurchased(receipt);
    }));
    router.post("/checkout", enabled(async ({ user, body }) => withPurchased(await commitCheckout(prisma, user.id, body))));
}

module.exports = { checkoutEnabled, installCheckoutRoutes, quoteCheckout, commitCheckout, addressDetails };
