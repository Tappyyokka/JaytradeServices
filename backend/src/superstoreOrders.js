const { checkoutEnabled } = require("./superstoreCheckout");
const { canAdmin, confirmation, audit } = require("./adminAccess");

const stages = ["Order Placed", "Order Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"];
const legacyStages = [1, 3, 4, 6];
const legacyProjection = [0, 0, 0, 1, 2, 2, 3];
const returnWindow = 7 * 24 * 60 * 60 * 1000;

function stageOf(order) {
    return order.management?.stage ?? (order.checkoutDetails?.demo && order.sellerStage === 0 ? 0 : legacyStages[order.sellerStage] ?? 0);
}

function managesStore(order, user) {
    return ["SELLER", "ADMIN"].includes(user.role) && order.lines.length > 0 &&
        order.lines.every((line) => line.sellerId === user.id);
}

function publicOrder(order) {
    if (!order.management?.request) return order;
    const { evidence, ...request } = order.management.request;
    return { ...order, management: { ...order.management, request: { ...request, hasEvidence: Boolean(evidence) } } };
}

function requestOptions(order, now = Date.now()) {
    const request = order.management?.request;
    if (!checkoutEnabled() || !order.checkoutDetails?.demo || order.refunded ||
        (request && request.status !== "rejected")) return [];
    const stage = stageOf(order);
    if (stage < 4) return ["cancel"];
    if (stage !== 6) return [];
    const deliveredAt = order.management?.events?.find((event) => event.stage === 6)?.at;
    return deliveredAt && now - Date.parse(deliveredAt) <= returnWindow ? ["return"] : [];
}

function installOrderRoutes(router, prisma, route, fail) {
    async function load(id) {
        const order = await prisma.marketplaceOrder.findUnique({ where: { id } });
        if (!order) fail(404, "Order not found.");
        return order;
    }

    async function update(db, order, management, extra = {}) {
        const changed = await db.marketplaceOrder.updateMany({
            where: { id: order.id, managementVersion: order.managementVersion, refunded: false },
            data: { management, managementVersion: { increment: 1 }, managementUpdatedAt: new Date(), ...extra },
        });
        if (!changed.count) fail(409, "Order status changed. Refresh the order and try again.");
    }

    function record(order, event, changes = {}) {
        const management = order.management ?? { stage: stageOf(order) };
        return {
            ...management, ...changes,
            events: [...(management.events ?? []), { ...event, at: new Date().toISOString() }].slice(-40),
        };
    }

    router.patch("/orders/:id/delivery", route(async ({ user, params, body }) => {
        const order = await load(params.id);
        if (!canAdmin(user, "marketplace", true) && !managesStore(order, user)) fail(404, "Order not found.");
        const current = stageOf(order);
        const request = order.management?.request;
        if (order.refunded || (request?.kind === "cancel" && request.status !== "rejected")) {
            fail(409, "This order is closed or its cancellation is under review.");
        }
        const { stage, courier = "", tracking = "", updateTracking = false } = body ?? {};
        if (updateTracking ? stage !== current : stage !== current + 1 || stage >= stages.length) {
            fail(422, "Select the next delivery stage.");
        }
        if (typeof courier !== "string" || typeof tracking !== "string" || courier.length > 80 || tracking.length > 100) {
            fail(422, "Enter valid courier and tracking details.");
        }
        const delivery = { courier: courier.trim(), tracking: tracking.trim() };
        if (stage === current && (stage < 3 || stage >= 6 || !delivery.courier || !delivery.tracking ||
            (delivery.courier === order.management?.courier && delivery.tracking === order.management?.tracking))) {
            fail(422, "Enter new courier and tracking details for this shipment.");
        }
        const changes = { stage, ...(stage >= 3 && delivery.courier && delivery.tracking ? delivery : {}) };
        await update(prisma, order, record(order,
            stage === current ? { title: "Courier tracking updated" } : { title: stages[stage], stage }, changes),
        { sellerStage: legacyProjection[stage] });
        return { success: true };
    }));

    router.post("/orders/:id/requests", route(async ({ user, params, body }) => {
        const order = await load(params.id);
        if (order.userId !== user.id) fail(404, "Order not found.");
        const { kind, reason, evidence } = body ?? {};
        if (!requestOptions(order).includes(kind)) fail(409, "This order is not eligible for that request.");
        if (typeof reason !== "string" || reason.trim().length < 5 || reason.length > 500) fail(422, "Enter a reason of 5 to 500 characters.");
        if (evidence != null) {
            const match = typeof evidence === "string" && evidence.length <= 350000 &&
                /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(evidence);
            const bytes = match && Buffer.from(match[2], "base64");
            const signature = bytes && bytes.subarray(0, 8).toString("hex");
            if (!bytes || bytes.length < 32 || bytes.length > 250 * 1024 ||
                (match[1] === "png" ? signature !== "89504e470d0a1a0a" : !signature.startsWith("ffd8ff"))) {
                fail(422, "Attach a PNG or JPEG up to 250 KB.");
            }
        }
        if (kind === "return" && !evidence) fail(422, "Attach an image showing the reason for your return.");
        const request = { kind, reason: reason.trim(), status: "pending", at: new Date().toISOString(), ...(evidence && { evidence }) };
        await update(prisma, order, record(order, { title: kind === "cancel" ? "Cancellation requested" : "Return requested", audience: "seller" }, { request }));
        return { success: true };
    }));

    router.get("/orders/:id/evidence", route(async ({ user, params }) => {
        const order = await load(params.id);
        if (order.userId !== user.id && !canAdmin(user, "marketplace") && !canAdmin(user, "finance") && !managesStore(order, user)) fail(404, "Order not found.");
        const image = order.management?.request?.evidence;
        if (!image) fail(404, "No supporting image.");
        return { image };
    }));

    router.patch("/orders/:id/requests", route(async ({ user, params, body }) => {
        const order = await load(params.id);
        if (!canAdmin(user, "marketplace", true) && !managesStore(order, user)) fail(404, "Order not found.");
        const request = order.management?.request;
        const { decision, note } = body ?? {};
        if (!checkoutEnabled() || request?.status !== "pending" || order.refunded) fail(409, "No pending demo request.");
        if (!["approved", "rejected"].includes(decision) || typeof note !== "string" || note.trim().length < 3 || note.length > 500) {
            fail(422, "Choose a decision and enter a review note.");
        }
        const label = request.kind === "cancel" ? "Cancellation" : "Return";
        const reviewed = { ...request, status: decision, note: note.trim(), reviewedAt: new Date().toISOString() };
        await update(prisma, order, record(order, { title: label + " " + decision }, { request: reviewed }));
        return { success: true };
    }));

    // Registered after the existing admin role middleware.
    return ({ user, params, body }) => prisma.$transaction(async (tx) => {
        const reason = confirmation(body);
        const order = await tx.marketplaceOrder.findUnique({ where: { id: params.id } });
        if (!order) fail(404, "Order not found.");
        if (order.refunded) return publicOrder(order);
        const request = order.management?.request;
        if (order.checkoutDetails?.demo && (!checkoutEnabled() || request?.status !== "approved")) {
            fail(409, "An accepted cancellation or received return is required for a demo refund.");
        }
        await update(tx, order, record(order, { title: "Refund credited to Customer Money" },
            request ? { request: { ...request, status: "refunded" } } : {}), { refunded: true });
        await tx.marketplaceWallet.update({ where: { userId: order.userId }, data: { balancePaise: { increment: order.total * 100 } } });
        await tx.marketplaceLedgerEntry.create({ data: { userId: order.userId, amountPaise: order.total * 100, reference: "refund:" + order.id } });
        await audit(tx, user, "order.refund", order.id, reason);
        for (const line of order.lines) {
            const inventory = line.variantId ? tx.marketplaceVariant : tx.marketplaceProduct;
            await inventory.updateMany({ where: { id: line.variantId ?? line.id }, data: { stock: { increment: line.quantity } } });
        }
        return { success: true };
    }, { isolationLevel: "Serializable" });
}

module.exports = { installOrderRoutes, publicOrder, managesStore, requestOptions, stageOf };
