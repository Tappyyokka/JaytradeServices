const { installMerchantRoutes, plans, requireSubscription } = require("./merchantSubscription");
const categories = new Set(["Electronics", "Fashion", "Grocery", "Beauty", "Home & Living", "Accessories"]);
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const text = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
const image = (value) => typeof value === "string" && (value === "" ||
    (value.length <= 550000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)));
const publicStoreFields = { userId: true, name: true, description: true, username: true, profile: true };

function storeData(body, current, required, fail) {
    const name = text(body?.name, 80);
    if (!name) fail(422, "Store name is required.");
    const data = { name, description: text(body.description, 1000) };
    if (body.username !== undefined) {
        const username = text(body.username, 30).toLowerCase();
        if (!/^[a-z0-9][a-z0-9_-]{2,29}$/.test(username)) fail(422, "Enter a username with 3 to 30 letters, digits, hyphens or underscores.");
        data.username = username;
    }
    if (body.profile !== undefined) {
        const input = body.profile;
        if (!input || Array.isArray(input) || typeof input !== "object") fail(422, "Invalid store profile.");
        const profile = {};
        for (const [field, max] of Object.entries({ category: 80, owner: 100, address: 500, pin: 6, email: 254, mobile: 25, policies: 1000 })) {
            profile[field] = text(input[field], max);
        }
        if ((profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) ||
            (profile.mobile && !/^\+?[0-9 ()-]{7,24}$/.test(profile.mobile)) ||
            (profile.pin && !/^[1-9][0-9]{5}$/.test(profile.pin))) fail(422, "Review the public contact details.");
        for (const field of ["opensAt", "closesAt"]) {
            const time = input[field] ?? "";
            if (time && (typeof time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) fail(422, "Enter valid opening hours.");
            profile[field] = time;
        }
        if (Boolean(profile.opensAt) !== Boolean(profile.closesAt)) fail(422, "Enter both opening and closing times.");
        for (const field of ["logo", "cover"]) {
            if (input[field] !== undefined) {
                if (!image(input[field])) fail(422, "Use a JPG, PNG or WebP image up to 400 KB.");
                profile[field] = input[field];
            }
        }
        profile.deliveryAvailable = input.deliveryAvailable === true;
        profile.pickupAvailable = input.pickupAvailable === true;
        data.profile = { ...current?.profile, ...profile };
    }
    if (required && (!data.username || !data.description || !data.profile?.address || !data.profile.pin || !data.profile.email || !data.profile.mobile || !data.profile.category)) {
        fail(422, "Complete the business and public contact details.");
    }
    return data;
}

function installManagementRoutes(router, db, route, fail) {
    installMerchantRoutes(router, db, route, fail, (body, current, required) => storeData(body, current, required, fail));

    router.put("/store", route(async ({ user, body }) => {
        const store = await requireSubscription(db, user.id, fail);
        return db.marketplaceStore.update({ where: { userId: user.id }, data: storeData(body, store, false, fail) });
    }));

    function variantData(variants, price, original, stock) {
        if (!Array.isArray(variants) || variants.length > 12) fail(422, "Enter up to 12 variant combinations.");
        const seen = new Set();
        const ids = new Set();
        let attributeNames;
        return variants.map((variant) => {
            if (!variant || typeof variant.id !== "string" || !variant.id || ids.has(variant.id) ||
                !variant.attributes || typeof variant.attributes !== "object" || Array.isArray(variant.attributes)) fail(422, "Invalid variant.");
            ids.add(variant.id);
            const pairs = Object.entries(variant.attributes);
            if (!pairs.length || pairs.length > 4 || pairs.some(([key, value]) =>
                !key.trim() || key.length > 50 || typeof value !== "string" || !value.trim() || value.length > 80)) fail(422, "Invalid variant attributes.");
            const ordered = pairs.map(([key, value]) => [key.trim().toLowerCase(), value.trim().toLowerCase()]).sort(([a], [b]) => a.localeCompare(b));
            const names = JSON.stringify(ordered.map(([key]) => key));
            attributeNames ??= names;
            const combination = JSON.stringify(ordered);
            if (names !== attributeNames || new Set(ordered.map(([key]) => key)).size !== ordered.length || seen.has(combination)) fail(422, "Use distinct combinations with the same variant attributes.");
            seen.add(combination);
            const selling = variant.price ?? price;
            const list = variant.original ?? Math.max(original, selling);
            const inventory = variant.stock ?? stock;
            if (!integer(selling, 1, 10_000_000) || !integer(list, selling, 10_000_000) || !integer(inventory, 0, 1_000_000)) fail(422, "Invalid variant price or stock.");
            return { id: variant.id, attributes: variant.attributes, price: selling, original: list, stock: inventory, expectedStock: variant.expectedStock };
        });
    }

    router.put("/products/:id", route(async ({ user, body, params }) => {
        const { price, original, stock, category, active, lowStockThreshold, variantOptions, expectedStock } = body ?? {};
        const name = text(body?.name, 100);
        const description = text(body?.description, 1000);
        const photos = body?.images ?? (body?.image ? [body.image] : []);
        if (!name || !description || !categories.has(category) || !integer(price, 1, 10_000_000) ||
            !integer(original, price, 10_000_000) || !integer(stock, 0, 1_000_000) ||
            !Array.isArray(photos) || photos.length > 4 || photos.some((photo) => !image(photo)) ||
            (active !== undefined && typeof active !== "boolean") ||
            (lowStockThreshold !== undefined && !integer(lowStockThreshold, 0, 1000))) fail(422, "Review the listing details.");
        const data = { name, description, category, price, original, stock, image: photos[0] || "", images: photos, active, lowStockThreshold };
        const options = variantOptions === undefined ? null : variantData(variantOptions, price, original, stock);
        return db.$transaction(async (tx) => {
            const store = await requireSubscription(tx, user.id, fail);
            let product;
            if (params.id === "new") {
                const count = await tx.marketplaceProduct.count({ where: { sellerId: user.id, deletedAt: null } });
                const limit = store.subscriptionProductLimit === -1 ? Infinity : store.subscriptionProductLimit ?? plans[store.plan].limit;
                if (count >= limit) fail(409, "Your subscription product limit has been reached.");
                product = await tx.marketplaceProduct.create({ data: { ...data, sellerId: user.id }, include: { variants: true } });
            } else {
                const current = await tx.marketplaceProduct.findFirst({ where: { id: params.id, sellerId: user.id, deletedAt: null }, include: { variants: true } });
                if (!current) fail(404, "Listing not found.");
                if (expectedStock !== undefined && current.stock !== expectedStock) {
                    if (stock !== expectedStock) fail(409, "Stock changed since you opened the editor. Refresh before adjusting stock.");
                    data.stock = current.stock;
                }
                product = await tx.marketplaceProduct.update({ where: { id: current.id }, data, include: { variants: true } });
            }
            if (options) {
                if (!options.length && product.variants.length) fail(422, "Keep at least one variant on this listing. Use zero stock to make it unavailable.");
                const existing = new Map(product.variants.map((variant) => [variant.id, variant]));
                await tx.marketplaceVariant.updateMany({ where: { productId: product.id, id: { notIn: options.map(({ id }) => id) } }, data: { active: false } });
                for (const { id, expectedStock: previousStock, ...option } of options) {
                    const current = existing.get(id);
                    if (current) {
                        if (previousStock !== undefined && current.stock !== previousStock) {
                            if (option.stock !== previousStock) fail(409, "Variant stock changed. Refresh before adjusting stock.");
                            option.stock = current.stock;
                        }
                        await tx.marketplaceVariant.update({ where: { id }, data: { ...option, active: true } });
                    } else {
                        await tx.marketplaceVariant.create({ data: { ...option, productId: product.id } });
                    }
                }
            }
            return { id: product.id, success: true };
        }, { isolationLevel: "Serializable" });
    }));

    router.patch("/products/:id/inventory", route(async ({ user, body, params }) => {
        const outOfStock = body?.outOfStock === true;
        const active = body?.active;
        if (!outOfStock && typeof active !== "boolean") fail(422, "Choose an inventory or visibility action.");
        return db.$transaction(async (tx) => {
            await requireSubscription(tx, user.id, fail);
            const where = { id: params.id, sellerId: user.id, deletedAt: null };
            const result = await tx.marketplaceProduct.updateMany({ where, data: outOfStock ? { stock: 0 } : { active } });
            if (!result.count) fail(404, "Listing not found.");
            if (outOfStock) await tx.marketplaceVariant.updateMany({ where: { productId: params.id, active: true }, data: { stock: 0 } });
            return { success: true };
        }, { isolationLevel: "Serializable" });
    }));

    router.delete("/products/:id", route(({ user, params }) => db.$transaction(async (tx) => {
        await requireSubscription(tx, user.id, fail);
        const result = await tx.marketplaceProduct.updateMany({
            where: { id: params.id, sellerId: user.id, deletedAt: null }, data: { active: false, deletedAt: new Date() },
        });
        if (!result.count) fail(404, "Listing not found.");
        return { success: true };
    }, { isolationLevel: "Serializable" })));
}

module.exports = { installManagementRoutes, publicStoreFields };
