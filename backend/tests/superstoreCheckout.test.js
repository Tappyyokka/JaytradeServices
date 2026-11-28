const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { test } = require("node:test");
const { addressDetails, checkoutEnabled, commitCheckout, quoteCheckout } = require("../src/superstoreCheckout");
const { samplePaymentEnabled } = require("../src/merchantSubscription");

const address = {
    fullName: "Demo buyer", mobile: "+91 98765 43210", building: "Demo house", locality: "Example Road",
    landmark: "", city: "Kochi", district: "Ernakulam", state: "Kerala", pin: "682001", type: "Home",
};

test("the demo feature cannot enable production payments and validates delivery addresses", () => {
    const mode = process.env.NODE_ENV;
    const flag = process.env.INDIPAY_SUPERSTORE_CHECKOUT_DEMO;
    try {
        process.env.INDIPAY_SUPERSTORE_CHECKOUT_DEMO = "1";
        process.env.NODE_ENV = "production";
        assert.equal(checkoutEnabled(), false);
        process.env.NODE_ENV = "test";
        assert.equal(checkoutEnabled(), false);
        assert.equal(samplePaymentEnabled(), false);
        assert.equal(addressDetails(address).mobile, "9876543210");
        assert.throws(() => addressDetails({ ...address, pin: "ABCDE" }), { status: 422 });
        assert.throws(() => addressDetails({ ...address, building: "" }), { status: 422 });
    } finally {
        if (mode === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = mode;
        if (flag === undefined) delete process.env.INDIPAY_SUPERSTORE_CHECKOUT_DEMO;
        else process.env.INDIPAY_SUPERSTORE_CHECKOUT_DEMO = flag;
    }
});

const connectionString = process.env.SUPERSTORE_TEST_DATABASE_URL;
test("PostgreSQL preserves funds and stock on failure and commits a multi-store variant purchase once", { skip: "Checkout is intentionally frozen" }, async () => {
    assert.match(new URL(connectionString).pathname, /^\/checkout_test(?:_\w+)?$/);
    const environment = {
        DATABASE_URL: connectionString, JWT_SECRET: randomUUID(), NODE_ENV: "test",
        INDIPAY_SUPERSTORE_CHECKOUT_DEMO: "1", INDIPAY_REGISTRATION_DEMO: "1", INDIPAY_MERCHANT_PAYMENT_DEMO: "1",
    };
    const previousEnv = Object.fromEntries(Object.keys(environment).map((key) => [key, process.env[key]]));
    Object.assign(process.env, environment);
    const { PrismaClient } = require("../generated/prisma");
    const { PrismaPg } = require("@prisma/adapter-pg");
    const express = require("express");
    const bcrypt = require("bcryptjs");
    const routeDb = require("../src/config/prisma");
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    const app = express();
    app.use(require("cookie-parser")());
    app.use(express.json({ limit: "1150kb" }));
    app.use("/auth", require("../routes/auth"));
    app.use("/marketplace", require("../routes/marketplace"));
    app.use("/registration", require("../routes/registrationDemo"));
    app.use("/centre", require("../routes/adminCentre"));
    const server = await new Promise((resolve) => {
        const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    async function request(path, { method = "GET", cookie = "", body } = {}) {
        const response = await fetch("http://127.0.0.1:" + server.address().port + path, {
            method, headers: {
                Cookie: cookie, "Content-Type": "application/json", "X-Indipay-Registration": "demo", "X-Indipay-Marketplace": "1", "X-Indipay-Admin": "1",
            }, body: body ? JSON.stringify(body) : undefined,
        });
        return { status: response.status, cookie: response.headers.get("set-cookie")?.split(";")[0],
            data: response.headers.get("content-type")?.includes("json") ? await response.json() : await response.text() };
    }
    try {
        const password = randomUUID();
        const hash = await bcrypt.hash(password, 4);
        const createUser = (name, role) => db.user.create({
            data: { email: randomUUID() + "@example.test", name, password: hash, role },
        });
        const buyer = await createUser("Merchant buyer", "SELLER");
        const sellerA = await createUser("Seller A", "SELLER");
        const sellerB = await createUser("Seller B", "SELLER");
        const customer = await createUser("Customer", "CUSTOMER");
        const admin = await createUser("Administrator", "ADMIN");
        async function login(user, mode) {
            const reply = await request("/auth/login", { method: "POST", body: { email: user.email, password, mode } });
            assert.equal(reply.status, 200);
            assert.equal(reply.data.user.id, user.id);
            assert.ok(reply.cookie);
            return reply.cookie;
        }
        const buyerCookie = await login(buyer, "merchant");
        const customerCookie = await login(customer, "customer");
        const adminCookie = await login(admin, "admin");
        const saved = await db.marketplaceAddress.create({
            data: { userId: buyer.id, details: addressDetails(address), isDefault: true },
        });
        await db.marketplaceWallet.create({ data: { userId: buyer.id, balancePaise: 10000 } });
        for (const seller of [sellerA, sellerB]) {
            await db.marketplaceStore.create({ data: {
                userId: seller.id, name: seller.name, description: "Test store", plan: "starter",
                subscriptionStatus: "active", subscriptionStart: new Date(Date.now() - 3600000),
                subscriptionEnd: new Date(Date.now() + 86400000), subscriptionReference: "fixture:" + seller.id,
            } });
        }
        const listing = { category: "Fashion", description: "Test listing", image: "", active: true };
        const shirt = await db.marketplaceProduct.create({
            data: { ...listing, name: "Shirt", sellerId: sellerA.id, price: 40, original: 60, stock: 99 },
        });
        const small = await db.marketplaceVariant.create({
            data: { productId: shirt.id, attributes: { Size: "Small" }, price: 40, original: 60, stock: 3 },
        });
        const large = await db.marketplaceVariant.create({
            data: { productId: shirt.id, attributes: { Size: "Large" }, price: 50, original: 60, stock: 2 },
        });
        const bag = await db.marketplaceProduct.create({
            data: { ...listing, name: "Bag", sellerId: sellerB.id, price: 30, original: 40, stock: 4 },
        });
        const query = {
            addressId: saved.id,
            items: [{ id: shirt.id, variantId: large.id, quantity: 1 }, { id: shirt.id, variantId: small.id, quantity: 2 },
                { id: bag.id, quantity: 1 }],
            delivery: { [sellerA.id]: "standard", [sellerB.id]: "express" },
            notes: "Use the test address",
        };
        const balance = async () => (await db.marketplaceWallet.findUnique({ where: { userId: buyer.id } })).balancePaise;
        const ledger = () => db.marketplaceLedgerEntry.count({ where: { userId: buyer.id, amountPaise: { lt: 0 } } });
        assert.equal((await request("/marketplace/addresses", { cookie: buyerCookie })).data[0].id, saved.id);
        assert.equal((await request("/marketplace/addresses", { cookie: customerCookie })).data.length, 0);
        assert.equal((await request("/marketplace/addresses/" + saved.id, { cookie: customerCookie, method: "DELETE" })).status, 404);
        const current = await quoteCheckout(db, buyer.id, query);
        assert.equal(current.total, 239);
        assert.equal(current.discount, 60);
        assert.equal(current.balance, 100);
        assert.equal(current.stores.length, 2);
        await assert.rejects(quoteCheckout(db, sellerA.id, query), { status: 404 });
        await assert.rejects(quoteCheckout(db, buyer.id, { ...query, items: [{ id: shirt.id, quantity: 1 }] }), { status: 409 });
        await assert.rejects(quoteCheckout(db, buyer.id, { ...query, items: [query.items[0], query.items[0]] }), { status: 422 });
        const payment = { ...query, id: randomUUID(), fingerprint: current.fingerprint };
        await assert.rejects(commitCheckout(db, buyer.id, payment), { status: 409, message: /Insufficient/ });
        assert.equal(await balance(), 10000);
        assert.equal(await ledger(), 0);

        const utr = "TEST" + randomUUID().replace(/-/g, "").slice(0, 12);
        const evidence = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aUfcAAAAASUVORK5CYII=";
        const submission = await request("/registration/credits", { method: "POST", cookie: buyerCookie,
            body: { purpose: "superstore", amountPaise: 13900, utr, mime: "image/png", data: evidence } });
        assert.equal(submission.status, 201);
        assert.equal(await balance(), 10000);
        const review = "/registration/admin/credits/" + submission.data.credit.id + "/review";
        const decision = { decision: "approved", verified: true, confirmed: true, reference: utr, remarks: "Matched test record" };
        assert.equal((await request(review, { method: "POST", cookie: buyerCookie, body: decision })).status, 403);
        assert.equal((await request(review, { method: "POST", cookie: adminCookie, body: decision })).status, 200);
        assert.equal((await request(review, { method: "POST", cookie: adminCookie, body: decision })).status, 409);
        assert.equal((await request("/registration/wallet?purpose=superstore", { cookie: buyerCookie })).data.balancePaise, 23900);
        assert.equal((await request("/registration/wallet", { cookie: buyerCookie })).data.balancePaise, 23900);
        assert.equal((await request("/marketplace/account", { cookie: buyerCookie })).data.creditRequests[0].id,
            submission.data.credit.id);
        assert.equal((await request("/marketplace/account", { cookie: customerCookie })).data.creditRequests.length, 0);
        await db.marketplaceProduct.update({ where: { id: bag.id }, data: { price: 31 } });
        await assert.rejects(commitCheckout(db, buyer.id, payment), { status: 409, message: /changed/ });
        await db.marketplaceProduct.update({ where: { id: bag.id }, data: { price: 30, stock: 0 } });
        await assert.rejects(commitCheckout(db, buyer.id, payment), { status: 409, message: /Stock/ });
        assert.equal(await balance(), 23900);
        assert.equal(await ledger(), 0);
        await db.marketplaceProduct.update({ where: { id: bag.id }, data: { stock: 4 } });

        const results = await Promise.allSettled([commitCheckout(db, buyer.id, payment), commitCheckout(db, buyer.id, payment)]);
        const successful = results.filter(({ status }) => status === "fulfilled");
        assert.ok(successful.length >= 1);
        const confirmed = successful[0].value;
        assert.equal(confirmed.orderIds.length, 2);
        assert.deepEqual((await commitCheckout(db, buyer.id, payment)).orderIds, confirmed.orderIds);
        await assert.rejects(commitCheckout(db, sellerB.id, payment), { status: 409 });
        assert.equal(await balance(), 0);
        assert.equal(await ledger(), 1);
        assert.equal((await db.marketplaceVariant.findUnique({ where: { id: small.id } })).stock, 1);
        assert.equal((await db.marketplaceVariant.findUnique({ where: { id: large.id } })).stock, 1);
        assert.equal((await db.marketplaceProduct.findUnique({ where: { id: shirt.id } })).stock, 99);
        for (const seller of [sellerA, sellerB]) {
            const own = await db.marketplaceOrder.findMany({ where: { id: { in: confirmed.orderIds },
                lines: { array_contains: [{ sellerId: seller.id }] } } });
            assert.equal(own.length, 1);
            assert.equal(own[0].checkoutDetails.checkoutId, payment.id);
            assert.equal(own[0].checkoutDetails.address.pin, address.pin);
            assert.equal(own[0].checkoutDetails.paymentReference, confirmed.paymentReference);
        }
        assert.equal(await db.marketplaceOrder.count({ where: { id: { in: confirmed.orderIds } } }), 2);
        const { amountPaise } = await db.marketplaceLedgerEntry.findUnique({ where: { reference: confirmed.paymentReference } });
        assert.equal(amountPaise, -23900);
        assert.equal((await request("/marketplace/checkout/" + payment.id, { cookie: customerCookie })).status, 404);
        const recovery = await request("/marketplace/checkout/" + payment.id, { cookie: buyerCookie });
        assert.equal(recovery.status, 200);
        assert.equal(recovery.data.purchased.length, 3);
        const sellerCookie = await login(sellerA, "merchant");
        const sellerAccount = await request("/marketplace/account", { cookie: sellerCookie });
        assert.equal(sellerAccount.data.sellerOrders.length, 1);
        assert.ok(sellerAccount.data.sellerOrders[0].lines.every((item) => item.sellerId === sellerA.id));
        assert.equal((await request("/marketplace/admin/recent", { cookie: buyerCookie })).status, 403);
        const audit = await request("/marketplace/admin/recent", { cookie: adminCookie });
        assert.equal(audit.data.orders.filter((order) => confirmed.orderIds.includes(order.id)).length, 2);
        assert.ok(audit.data.transactions.some((entry) => entry.reference === confirmed.paymentReference));

        const deliveredId = sellerAccount.data.sellerOrders[0].id;
        const cancelledId = confirmed.orderIds.find((id) => id !== deliveredId);
        const sellerBCookie = await login(sellerB, "merchant");
        const endpoint = (id, section) => "/marketplace/orders/" + id + "/" + section;
        const changeStage = (stage, cookie = sellerCookie, body = {}) =>
            request(endpoint(deliveredId, "delivery"), { method: "PATCH", cookie, body: { stage, ...body } });
        const sendRequest = (id, body, cookie = buyerCookie) =>
            request(endpoint(id, "requests"), { method: "POST", cookie, body });
        const reviewRequest = (id, cookie, decision = "approved") =>
            request(endpoint(id, "requests"), { method: "PATCH", cookie, body: { decision, note: "Reviewed by the test store" } });
        const refund = (id, cookie = adminCookie) =>
            request("/marketplace/admin/orders/" + id + "/refund", { method: "POST", cookie, body: { confirmed: true, remarks: "Test refund review" } });
        const reason = "Ordered the wrong item";
        assert.equal((await changeStage(1, sellerBCookie)).status, 404);
        assert.equal((await changeStage(3)).status, 422);
        assert.equal((await sendRequest(cancelledId, { kind: "cancel", reason }, customerCookie)).status, 404);
        assert.equal((await sendRequest(cancelledId, { kind: "cancel", reason })).status, 200);
        assert.equal((await refund(cancelledId)).status, 409);
        assert.equal((await request(endpoint(cancelledId, "delivery"), {
            method: "PATCH", cookie: sellerBCookie, body: { stage: 1 },
        })).status, 409);
        assert.ok((await request("/marketplace/notifications", { cookie: sellerBCookie })).data.events.some(
            (event) => event.id === cancelledId && event.seller && event.title === "Cancellation requested"));
        assert.equal((await reviewRequest(cancelledId, sellerBCookie)).status, 200);
        assert.equal((await refund(cancelledId, sellerBCookie)).status, 403);
        const simultaneousRefunds = await Promise.all([refund(cancelledId), refund(cancelledId)]);
        assert.ok(simultaneousRefunds.some(({ status }) => status === 200));
        assert.equal((await refund(cancelledId)).status, 200);
        assert.equal(await balance(), (239 - 130) * 100);
        assert.equal(await db.marketplaceLedgerEntry.count({ where: { reference: "refund:" + cancelledId } }), 1);

        for (let stage = 1; stage <= 6; stage += 1) {
            assert.equal((await changeStage(stage, sellerCookie, stage === 4 ? { courier: "Demo courier", tracking: "TEST012" } : {})).status, 200);
        }
        const deliveredOrder = (await request("/marketplace/account", { cookie: buyerCookie })).data.orders.find(({ id }) => id === deliveredId);
        assert.deepEqual(deliveredOrder.management.events.map(({ stage }) => stage), [1, 2, 3, 4, 5, 6]);
        assert.equal(deliveredOrder.management.tracking, "TEST012");
        assert.deepEqual(deliveredOrder.requestOptions, ["return"]);
        const reviewsPath = "/marketplace/social/products/" + shirt.id + "/reviews";
        const reviewBody = { rating: 5, text: "Good fit and quality." };
        assert.equal((await request(reviewsPath, { method: "POST", cookie: customerCookie, body: reviewBody })).status, 403);
        const verified = await request(reviewsPath, { method: "POST", cookie: buyerCookie, body: reviewBody });
        assert.equal(verified.status, 200);
        assert.equal((await request(reviewsPath, { method: "POST", cookie: buyerCookie, body: reviewBody })).status, 409);
        const reply = "/marketplace/social/reviews/" + verified.data.id + "/reply";
        assert.equal((await request(reply, { method: "PUT", cookie: sellerBCookie, body: { reply: "Thank you" } })).status, 404);
        assert.equal((await request(reply, { method: "PUT", cookie: sellerCookie, body: { reply: "Thank you" } })).status, 200);
        const reviews = await request(reviewsPath);
        assert.equal(reviews.data.average, 5);
        assert.equal(reviews.data.counts["5"], 1);
        assert.equal(reviews.data.reviews[0].verifiedPurchase, true);
        assert.equal(reviews.data.reviews[0].reply, "Thank you");
        const report = "/marketplace/social/reviews/" + verified.data.id + "/report";
        assert.equal((await request(report, { method: "POST", cookie: customerCookie, body: { reason: "Please check this content." } })).status, 200);
        assert.ok((await request("/marketplace/notifications", { cookie: buyerCookie })).data.events.some(
            (event) => event.productId === shirt.id && event.title.includes("replied")));
        assert.equal((await sendRequest(deliveredId, { kind: "return", reason })).status, 422);
        const image = "data:image/png;base64," + evidence;
        assert.equal((await sendRequest(deliveredId, { kind: "return", reason, evidence: image })).status, 200);
        assert.equal((await request(endpoint(deliveredId, "evidence"), { cookie: sellerBCookie })).status, 404);
        assert.equal((await request(endpoint(deliveredId, "evidence"), { cookie: sellerCookie })).data.image, image);
        const updatedAudit = await request("/marketplace/admin/recent", { cookie: adminCookie });
        const returnRequest = updatedAudit.data.orders.find(({ id }) => id === deliveredId).management.request;
        assert.equal(returnRequest.hasEvidence, true);
        assert.equal(returnRequest.evidence, undefined);
        assert.equal((await reviewRequest(deliveredId, sellerCookie)).status, 200);
        assert.equal((await refund(deliveredId)).status, 200);
        assert.equal(await balance(), 23900);
        assert.ok((await request("/marketplace/notifications", { cookie: buyerCookie })).data.events.some(
            (event) => event.id === deliveredId && event.title === "Refund credited to Customer Money"));

        const followPath = "/marketplace/social/stores/" + sellerA.id + "/follow";
        assert.equal((await request(followPath, { method: "PUT", cookie: buyerCookie, body: { following: true } })).data.followers, 1);
        const storePath = "/marketplace/store";
        const profile = { name: "Updated test store", username: "store-" + randomUUID().slice(0, 8),
            description: "Store overview", profile: { policies: "Returns by arrangement", opensAt: "08:00", closesAt: "20:00", pickupAvailable: true } };
        assert.equal((await request(storePath, { method: "PUT", cookie: sellerCookie, body: profile })).status, 200);
        const listingPath = "/marketplace/products/";
        const productBody = { name: "Dashboard listing", category: "Fashion", description: "New inventory",
            price: 75, original: 85, stock: 0, images: [image, image], lowStockThreshold: 3,
            variantOptions: [{ id: "draft", attributes: { Size: "M" }, stock: 8 }] };
        const created = await request(listingPath + "new", { method: "PUT", cookie: sellerCookie, body: productBody });
        assert.equal(created.status, 200);
        const productId = created.data.id;
        const catalog = (await request("/marketplace/catalog")).data;
        assert.equal(catalog.stores.find(({ userId }) => userId === sellerA.id).profile.pickupAvailable, true);
        const listingRow = catalog.products.find(({ id }) => id === productId);
        assert.equal(listingRow.images.length, 2);
        assert.equal(listingRow.variants[0].stock, 8);
        assert.equal((await request(listingPath + productId + "/inventory", { method: "PATCH", cookie: sellerBCookie, body: { outOfStock: true } })).status, 404);
        const postPath = "/marketplace/social/posts";
        const offer = { productId, kind: "offer", text: "A new store offer for followers." };
        assert.equal((await request(postPath, { method: "POST", cookie: sellerBCookie, body: offer })).status, 404);
        assert.equal((await request(postPath, { method: "POST", cookie: sellerCookie, body: offer })).status, 200);
        const social = await request("/marketplace/social", { cookie: buyerCookie });
        assert.ok(social.data.feed.some((entry) => entry.productId === productId && entry.kind === "new"));
        assert.ok(social.data.feed.some((entry) => entry.productId === productId && entry.kind === "offer"));
        await request("/marketplace/social/preferences", { method: "PUT", cookie: buyerCookie, body: { storeUpdates: false } });
        assert.ok(!(await request("/marketplace/notifications", { cookie: buyerCookie })).data.events.some(
            (event) => event.productId === productId));
        const statePath = "/marketplace/social/products/" + productId + "/state";
        await request(statePath, { method: "PUT", cookie: buyerCookie, body: { field: "saved", value: true } });
        assert.equal((await request("/marketplace/social", { cookie: buyerCookie })).data.products.length, 1);
        assert.equal((await request("/marketplace/social", { cookie: customerCookie })).data.products.length, 0);
        await request(statePath, { method: "PUT", cookie: buyerCookie, body: { field: "saved", value: false } });
        await request("/marketplace/social/wishlist/import", { method: "POST", cookie: buyerCookie, body: { keys: [productId] } });
        assert.equal((await request("/marketplace/social", { cookie: buyerCookie })).data.products.length, 0);
        await request(followPath, { method: "PUT", cookie: buyerCookie, body: { following: false } });
        await request("/marketplace/social/follows/import", { method: "POST", cookie: buyerCookie, body: { stores: [sellerA.id] } });
        assert.equal((await request("/marketplace/social", { cookie: buyerCookie })).data.following.length, 0);

        for (let index = 0; index < 8; index += 1) {
            assert.equal((await request(listingPath + "new", { method: "PUT", cookie: sellerCookie, body: productBody })).status, 200);
        }
        assert.equal((await request(listingPath + "new", { method: "PUT", cookie: sellerCookie, body: productBody })).status, 409);
        assert.equal((await request(listingPath + productId + "/inventory", { method: "PATCH", cookie: sellerCookie, body: { outOfStock: true } })).status, 200);
        assert.equal((await db.marketplaceVariant.findUnique({ where: { id: listingRow.variants[0].id } })).stock, 0);
        assert.equal((await request(listingPath + shirt.id, { method: "DELETE", cookie: sellerCookie })).status, 200);
        assert.equal((await db.marketplaceProduct.findUnique({ where: { id: shirt.id } })).active, false);
        assert.ok((await db.marketplaceOrder.findUnique({ where: { id: deliveredId } })).lines.some((line) => line.id === shirt.id));

        const register = async (suffix) => {
            const email = randomUUID() + "@example.test";
            const mobile = "9" + String(BigInt("0x" + randomUUID().slice(0, 8)) % 1000000000n).padStart(9, "0");
            const result = await request("/auth/register", { method: "POST", body: { fullName: "Step 8.5 " + suffix, email, mobile, password } });
            assert.equal(result.status, 201);
            assert.equal(result.data.user.role, "CUSTOMER");
            return result.data.user;
        };
        const merchant = await register("Account A");
        const shopper = await register("Account B");
        const merchantCookie = await login(merchant, "customer");
        const shopperCookie = await login(shopper, "customer");
        const subscriptionPath = "/marketplace/merchant";
        const draft = await request(subscriptionPath + "/registration", { method: "POST", cookie: merchantCookie, body: {
            plan: "starter",
            details: { name: "Step 8.5 public store", username: "shop-" + randomUUID().slice(0, 8), description: "Permanent test listing store",
                profile: { category: "Fashion", address: "Example Road", pin: "682001", email: merchant.email, mobile: merchant.phone } },
        } });
        assert.equal(draft.status, 200);
        assert.equal(draft.data.status, "pending");
        assert.equal(draft.data.store.amountPaise, 29900);
        assert.ok(!(await request("/marketplace/catalog", { cookie: shopperCookie })).data.stores.some((store) => store.userId === merchant.id));
        assert.equal((await request(listingPath + "new", { method: "PUT", cookie: merchantCookie, body: productBody })).status, 403);
        const payPlan = (cookie = merchantCookie, amountPaise = 29900) => request(subscriptionPath + "/payment", {
            method: "POST", cookie, body: { intentId: draft.data.store.intentId, amountPaise, days: draft.data.store.days },
        });
        assert.equal((await payPlan(shopperCookie)).status, 403);
        assert.equal((await payPlan(merchantCookie, 1)).status, 409);
        assert.match((await payPlan()).data.message, /Insufficient/);
        await db.marketplaceWallet.create({ data: { userId: merchant.id, balancePaise: 40000 } });
        const paid = await Promise.all([payPlan(), payPlan()]);
        assert.ok(paid.some((result) => result.status === 200 && result.data.status === "active"));
        const replay = await payPlan();
        assert.equal(replay.status, 200);
        assert.equal(replay.data.paymentReference, "subscription:" + draft.data.store.intentId);
        assert.equal(await db.marketplaceLedgerEntry.count({ where: { reference: replay.data.paymentReference } }), 1);
        assert.equal((await db.marketplaceWallet.findUnique({ where: { userId: merchant.id } })).balancePaise, 10100);
        assert.equal((await request("/auth/me", { cookie: merchantCookie })).data.user.id, merchant.id);
        assert.equal((await request("/auth/me", { cookie: merchantCookie })).data.user.role, "SELLER");
        const merchantListing = await request(listingPath + "new", { method: "PUT", cookie: merchantCookie, body: productBody });
        assert.equal(merchantListing.status, 200);
        await request("/auth/logout", { method: "POST", cookie: merchantCookie });
        const afterLogin = await login(merchant, "merchant");
        assert.equal((await request(subscriptionPath + "/subscription", { cookie: afterLogin })).data.status, "active");
        assert.ok((await request("/marketplace/account", { cookie: afterLogin })).data.store.products.some((item) => item.id === merchantListing.data.id));
        await request("/auth/logout", { method: "POST", cookie: shopperCookie });
        const shopperSession = await login(shopper, "customer");
        const publicCatalogue = await request("/marketplace/catalog", { cookie: shopperSession });
        const published = publicCatalogue.data.products.find((item) => item.id === merchantListing.data.id);
        assert.equal(published.store.name, "Step 8.5 public store");
        assert.equal(published.variants.length, 1);
        assert.equal((await request(listingPath + published.id, { method: "PUT", cookie: sellerBCookie, body: productBody })).status, 404);
        const shopperAddress = await db.marketplaceAddress.create({ data: { userId: shopper.id, details: addressDetails(address), isDefault: true } });
        const checkoutSelection = { addressId: shopperAddress.id, items: [{ id: published.id, variantId: published.variants[0].id, quantity: 1 }] };
        assert.equal((await quoteCheckout(db, shopper.id, checkoutSelection)).subtotal, productBody.price);
        await db.marketplaceStore.update({ where: { userId: merchant.id }, data: { subscriptionEnd: new Date(Date.now() - 1000) } });
        assert.equal((await request(subscriptionPath + "/subscription", { cookie: afterLogin })).data.status, "expired");
        assert.equal((await request(listingPath + published.id, { method: "PUT", cookie: afterLogin, body: productBody })).status, 403);
        assert.ok(!(await request("/marketplace/catalog")).data.products.some((item) => item.id === published.id));
        await assert.rejects(quoteCheckout(db, shopper.id, checkoutSelection), { status: 409 });
        process.env.NODE_ENV = "production";
        try { assert.equal((await payPlan()).status, 403); }
        finally { process.env.NODE_ENV = "test"; }

        assert.equal((await request("/centre/session", { cookie: shopperSession })).status, 403);
        assert.equal((await request("/centre/dashboard", { cookie: adminCookie })).status, 200);
        const auditor = await createUser("Auditor", "ADMIN");
        await db.user.update({ where: { id: auditor.id }, data: { adminRole: "AUDITOR" } });
        const auditCookie = await login(auditor, "admin");
        assert.equal((await request("/centre/records/audit", { cookie: auditCookie })).status, 200);
        const suspendPath = "/centre/manage/customers/" + shopper.id;
        const confirmation = { confirmed: true, remarks: "Integration test review", isActive: false };
        assert.equal((await request(suspendPath, { method: "PUT", cookie: auditCookie, body: confirmation })).status, 403);
        assert.equal((await request(suspendPath, { method: "PUT", cookie: adminCookie, body: { isActive: false } })).status, 422);
        assert.equal((await request(suspendPath, { method: "PUT", cookie: adminCookie, body: confirmation })).status, 200);
        assert.equal((await request("/auth/me", { cookie: shopperSession })).status, 401);
        assert.equal(await db.adminAudit.count({ where: { actorId: admin.id, target: shopper.id, action: "customers.update" } }), 1);
        assert.equal((await request("/centre/manage/content/new", { method: "PUT", cookie: adminCookie, body: {
            ...confirmation, title: "Integration test notice", body: "Published to customer announcements", active: true, position: 1, channel: "announcements",
        } })).status, 200);
        assert.ok((await request("/centre/published/announcements")).data.some(({ title }) => title === "Integration test notice"));
        assert.equal((await request("/centre/manage/plans/starter", { method: "PUT", cookie: adminCookie, body: {
            ...confirmation, amountPaise: 32100, days: 31, limit: 12, available: true,
        } })).status, 200);
        assert.equal((await request("/centre/subscription-plans")).data.find(({ id }) => id === "starter").days, 31);
        assert.equal((await request("/centre/manage/services/new", { method: "PUT", cookie: adminCookie, body: {
            ...confirmation, name: "Housing Loan", description: "Updated test description", available: false,
        } })).status, 200);
        assert.equal((await request("/centre/service-catalogue")).data.find(({ id }) => id === "housing loan").available, false);
    } finally {
        await new Promise((resolve) => server.close(resolve));
        await routeDb.$disconnect();
        await db.$disconnect();
        for (const [key, value] of Object.entries(previousEnv)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});
