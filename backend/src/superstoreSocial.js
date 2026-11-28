const { stageOf } = require("./superstoreOrders");
const { publishedStore, requireSubscription } = require("./merchantSubscription");
const trimmed = (value) => typeof value === "string" ? value.trim() : "";
const imageOkay = (value) => typeof value === "string" && value.length <= 350000 &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
const activeProduct = () => ({ active: true, deletedAt: null, store: publishedStore() });
const productFields = { id: true, name: true, sellerId: true };

async function followedUpdates(db, follows) {
    if (!follows.length) return [];
    const [products, posts] = await Promise.all([
        db.marketplaceProduct.findMany({
            where: { ...activeProduct(), OR: follows.map(({ storeId, createdAt }) => ({ sellerId: storeId, createdAt: { gte: createdAt } })) },
            orderBy: { createdAt: "desc" }, take: 40, select: { ...productFields, createdAt: true },
        }),
        db.marketplacePost.findMany({
            where: { OR: follows.map(({ storeId, createdAt }) => ({ product: { ...activeProduct(), sellerId: storeId }, createdAt: { gte: createdAt } })) },
            orderBy: { createdAt: "desc" }, take: 40,
        }),
    ]);
    return [
        ...products.map(({ id, createdAt }) => ({ id: "product-" + id, productId: id, date: createdAt, kind: "new" })),
        ...posts.map(({ id, productId, createdAt, kind, text }) => ({ id, productId, date: createdAt, kind, text })),
    ].sort((a, b) => b.date - a.date).slice(0, 40);
}

function installPublicReviews(router, db, route) {
    router.get("/social/products/:id/reviews", route(async ({ params }) => {
        const where = { productId: params.id, product: activeProduct() };
        const [rows, groups] = await Promise.all([
            db.marketplaceReview.findMany({
                where, orderBy: { createdAt: "desc" }, take: 30,
                select: { id: true, rating: true, text: true, image: true, reply: true, repliedAt: true,
                    createdAt: true, user: { select: { name: true } } },
            }),
            db.marketplaceReview.groupBy({ by: ["rating"], where, _count: { _all: true } }),
        ]);
        const counts = Object.fromEntries(groups.map(({ rating, _count }) => [rating, _count._all]));
        const total = groups.reduce((sum, { _count }) => sum + _count._all, 0);
        const average = total ? groups.reduce((sum, { rating, _count }) => sum + rating * _count._all, 0) / total : null;
        return { counts, total, average, reviews: rows.map(({ user, createdAt, image, ...row }) => ({
            ...row, author: user.name, date: createdAt, images: image ? [image] : [], verifiedPurchase: true,
        })) };
    }));
}

function installSocialRoutes(router, db, route, fail) {
    router.get("/social", route(async ({ user }) => {
        const [follows, products, preferences, reviews] = await Promise.all([
            db.marketplaceFollow.findMany({ where: { userId: user.id, following: true }, orderBy: { createdAt: "desc" } }),
            db.marketplaceProductState.findMany({ where: { userId: user.id, OR: [{ liked: true }, { saved: true }] } }),
            db.marketplaceSocialPreference.findUnique({ where: { userId: user.id } }),
            db.marketplaceReview.findMany({ where: { userId: user.id }, select: { productId: true } }),
        ]);
        return { following: follows.map(({ storeId }) => storeId), products, reviewed: reviews.map(({ productId }) => productId),
            storeUpdates: preferences?.storeUpdates ?? true, feed: await followedUpdates(db, follows) };
    }));

    router.put("/social/stores/:id/follow", route(async ({ user, params, body }) => {
        const storeId = params.id;
        if (typeof body?.following !== "boolean" || storeId === user.id) fail(422, "Choose whether to follow this store.");
        if (!await db.marketplaceStore.findUnique({ where: { userId: storeId }, select: { userId: true } })) fail(404, "Store unavailable.");
        const key = { userId: user.id, storeId };
        const where = { userId_storeId: key };
        const existing = await db.marketplaceFollow.findUnique({ where });
        const change = { following: body.following };
        if (existing?.following !== body.following) {
            await db.marketplaceFollow.upsert({ where, create: { ...key, ...change }, update: { ...change, createdAt: new Date() } });
        }
        return { following: body.following, followers: await db.marketplaceFollow.count({ where: { storeId, following: true } }) };
    }));

    router.post("/social/follows/import", route(async ({ user, body }) => {
        const stores = body?.stores;
        if (!Array.isArray(stores) || stores.length > 250 || stores.some((id) => typeof id !== "string" || !id || id.length > 140)) {
            fail(422, "Invalid followed store list.");
        }
        const rows = await db.marketplaceStore.findMany({ where: { userId: { in: stores, not: user.id } }, select: { userId: true } });
        await db.marketplaceFollow.createMany({ data: rows.map(({ userId: storeId }) => ({ userId: user.id, storeId })), skipDuplicates: true });
        return { success: true };
    }));

    router.put("/social/preferences", route(async ({ user, body }) => {
        if (typeof body?.storeUpdates !== "boolean") fail(422, "Choose a notification preference.");
        const data = { storeUpdates: body.storeUpdates };
        await db.marketplaceSocialPreference.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
        return data;
    }));

    router.put("/social/products/:id/state", route(async ({ user, params, body }) => {
        const productKey = params.id;
        if (!productKey || productKey.length > 140 || typeof body?.value !== "boolean" ||
            !["saved", "liked"].includes(body?.field)) fail(422, "Invalid shopping preference.");
        const key = { userId: user.id, productKey };
        const data = { [body.field]: body.value };
        return db.marketplaceProductState.upsert({ where: { userId_productKey: key }, create: { ...key, ...data }, update: data });
    }));

    router.post("/social/wishlist/import", route(async ({ user, body }) => {
        const keys = body?.keys;
        if (!Array.isArray(keys) || keys.length > 250 || keys.some((key) => typeof key !== "string" || !key || key.length > 140)) {
            fail(422, "Invalid saved product list.");
        }
        await db.marketplaceProductState.createMany({ data: [...new Set(keys)].map((productKey) => ({
            userId: user.id, productKey, saved: true,
        })), skipDuplicates: true });
        return { success: true };
    }));

    router.post("/social/products/:id/reviews", route(async ({ user, params, body }) => {
        const productId = params.id;
        const rating = body?.rating;
        const text = trimmed(body?.text);
        const image = body?.image || null;
        if (!Number.isInteger(rating) || rating < 1 || rating > 5 || text.length < 5 || text.length > 1500 ||
            (image !== null && !imageOkay(image))) fail(422, "Enter a rating, a review of 5 to 1,500 characters and an optional image up to 250 KB.");
        return db.$transaction(async (tx) => {
            const product = await tx.marketplaceProduct.findFirst({ where: { ...activeProduct(), id: productId }, select: productFields });
            if (!product || product.sellerId === user.id) fail(404, "Reviewable product unavailable.");
            const orders = await tx.marketplaceOrder.findMany({
                where: { userId: user.id, refunded: false, lines: { array_contains: [{ id: productId }] } }, orderBy: { createdAt: "desc" },
            });
            const order = orders.find((item) => stageOf(item) === 6 && item.management?.request?.status !== "approved");
            if (!order) fail(403, "A delivered purchase is required to review this product.");
            if (await tx.marketplaceReview.findUnique({ where: { userId_productId: { userId: user.id, productId } }, select: { id: true } })) {
                fail(409, "You have already reviewed this product.");
            }
            return tx.marketplaceReview.create({ data: { userId: user.id, orderId: order.id, productId, rating, text, image }, select: { id: true } });
        }, { isolationLevel: "Serializable" });
    }));

    router.put("/social/reviews/:id/reply", route(async ({ user, params, body }) => {
        const reply = trimmed(body?.reply);
        if (!["SELLER", "ADMIN"].includes(user.role)) fail(403, "Merchant access required.");
        if (reply.length < 2 || reply.length > 1000) fail(422, "Enter a reply of 2 to 1,000 characters.");
        const result = await db.marketplaceReview.updateMany({
            where: { id: params.id, product: { sellerId: user.id } }, data: { reply, repliedAt: new Date() },
        });
        if (!result.count) fail(404, "Review unavailable.");
        return { success: true };
    }));

    router.post("/social/reviews/:id/report", route(async ({ user, params, body }) => {
        const reason = trimmed(body?.reason);
        if (reason.length < 5 || reason.length > 500) fail(422, "Enter a reason of 5 to 500 characters.");
        const review = await db.marketplaceReview.findFirst({ where: { id: params.id, product: activeProduct() }, select: { userId: true } });
        if (!review || review.userId === user.id) fail(404, "Review unavailable.");
        const key = { userId: user.id, reviewId: params.id };
        await db.marketplaceReviewReport.upsert({ where: { reviewId_userId: key }, create: { ...key, reason }, update: { reason } });
        return { success: true };
    }));

    router.post("/social/posts", route(async ({ user, body }) => {
        await requireSubscription(db, user.id, fail);
        const text = trimmed(body?.text);
        const { productId, kind } = body ?? {};
        if (typeof productId !== "string" || !["announcement", "offer"].includes(kind) || text.length < 5 || text.length > 500) {
            fail(422, "Choose a product and write an announcement or offer of 5 to 500 characters.");
        }
        const product = await db.marketplaceProduct.findFirst({ where: { ...activeProduct(), id: productId, sellerId: user.id }, select: { id: true } });
        if (!product) fail(404, "Active store product unavailable.");
        return db.marketplacePost.create({ data: { productId, text, kind }, select: { id: true } });
    }));
}

async function socialNotifications(db, userId) {
    const [incoming, received, replies, follows, prefs] = await Promise.all([
        db.marketplaceFollow.findMany({ where: { storeId: userId, following: true }, orderBy: { createdAt: "desc" }, take: 15 }),
        db.marketplaceReview.findMany({ where: { product: { sellerId: userId } }, orderBy: { createdAt: "desc" }, take: 15,
            select: { id: true, productId: true, createdAt: true } }),
        db.marketplaceReview.findMany({ where: { userId, repliedAt: { not: null } }, orderBy: { repliedAt: "desc" }, take: 15,
            select: { id: true, productId: true, repliedAt: true } }),
        db.marketplaceFollow.findMany({ where: { userId, following: true } }),
        db.marketplaceSocialPreference.findUnique({ where: { userId } }),
    ]);
    const feed = prefs?.storeUpdates !== false ? await followedUpdates(db, follows) : [];
    return [
        ...incoming.map(({ userId: follower, createdAt }) => ({ key: "follow-" + follower + createdAt.toISOString(),
            storeId: userId, date: createdAt, title: "Your store has a new follower" })),
        ...received.map(({ id, productId, createdAt }) => ({ key: "review-" + id, productId, date: createdAt, title: "New review on your product" })),
        ...replies.map(({ id, productId, repliedAt }) => ({ key: "reply-" + id, productId, date: repliedAt, title: "A merchant replied to your review" })),
        ...feed.map(({ id, productId, date, kind }) => ({ key: "feed-" + id, productId, date,
            title: kind === "offer" ? "New offer from a followed store" : kind === "announcement" ? "New store announcement" : "New product from a followed store",
            feed: kind !== "new" })),
    ];
}

module.exports = { installPublicReviews, installSocialRoutes, socialNotifications };
