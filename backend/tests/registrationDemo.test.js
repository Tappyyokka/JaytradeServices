const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const { registrationDemoEnabled } = require("../src/registrationDemoIsolation");

const source = fs.readFileSync(path.join(__dirname, "../routes/registrationDemo.js"), "utf8");
const customer = { id: "customer", role: "CUSTOMER" };
const admin = { id: "admin", role: "ADMIN" };
const quote = { demo: true, stage: "primary_approval", eligible: true, amount_paise: 5000,
    service: "Demo service", department: "Finance", staff: "Demo employee" };
const payment = { accepted: true, termsVersion: "demo-registration-v1", amountPaise: 5000 };
const receiptPath = "/applications/:applicationId";
const reviewPath = "/admin/credits/:id/review";

function fixture() {
    const routes = new Map();
    const middleware = [];
    const router = {
        use(prefix, fn) { middleware.push(typeof prefix === "function" ? ["/", prefix] : [prefix, fn]); },
        get(path, fn) { routes.set("GET " + path, fn); },
        post(path, fn) { routes.set("POST " + path, fn); },
    };
    let state = { wallet: 0, registration: null, ledger: [], credits: [] };
    let transactions = Promise.resolve();
    const prisma = {
        application: { findFirst: async ({ where }) => where.userId === customer.id && where.applicationId === "APP-1" ? { ...where, leadSyncStatus: "SYNCED" } : null },
        marketplaceWallet: {
            findUnique: async () => ({ balancePaise: state.wallet }),
            updateMany: async ({ where, data }) => {
                if (state.wallet < where.balancePaise.gte) return { count: 0 };
                state.wallet -= data.balancePaise.decrement;
                return { count: 1 };
            },
            upsert: async ({ update }) => { state.wallet += update.balancePaise.increment; },
        },
        applicationDemoRegistration: {
            findUnique: async () => state.registration,
            create: async ({ data }) => {
                if (state.registration) throw Object.assign(new Error("duplicate"), { code: "P2002" });
                state.registration = { ...data, acceptedAt: new Date() };
                return state.registration;
            },
            update: async ({ data }) => {
                state.registration = { ...state.registration, ...data };
                return state.registration;
            },
        },
        marketplaceLedgerEntry: { create: async ({ data }) => { state.ledger.push(data); } },
        adminAudit: { create: async () => {} },
        applicationDemoCredit: {
            create: async ({ data }) => {
                if (state.credits.some(({ utr }) => utr === data.utr)) throw Object.assign(new Error("duplicate"), { code: "P2002" });
                const credit = { ...data, id: String(state.credits.length + 1), status: "pending" };
                state.credits.push(credit);
                return credit;
            },
            findUnique: async ({ where }) => state.credits.find(({ id }) => id === where.id),
            updateMany: async ({ where, data }) => {
                const row = state.credits.find(({ id, status }) => id === where.id && status === where.status);
                if (!row) return { count: 0 };
                Object.assign(row, data);
                return { count: 1 };
            },
        },
        $transaction(action) {
            const result = transactions.then(async () => {
                const before = structuredClone(state);
                try { return await action(prisma); }
                catch (error) { state = before; throw error; }
            });
            transactions = result.catch(() => {});
            return result;
        },
    };
    const upstream = { registration: null, unavailable: false, confirmed: [] };
    const env = { NODE_ENV: "development", INDIPAY_REGISTRATION_DEMO: "1", INDIPAY_REGISTRATION_DEMO_ISOLATION: "a".repeat(64), JAYTRADE_STATUS_API_URL: "http://demo.invalid/leads", INDIPAY_API_KEY: "test-only" };
    const isolation = { allowed: true };
    prisma.$queryRaw = async () => [{ allowed: isolation.allowed }];
    const nextMiddleware = (_req, _res, next) => next();
    vm.runInNewContext(source, {
        module: {}, console, Buffer, AbortSignal, process: { env },
        fetch: async (url, options) => {
            if (url.endsWith("/status")) return { ok: true, json: async () => ({ success: true, registration: upstream.registration }) };
            if (upstream.unavailable) throw new Error("test outage");
            upstream.confirmed.push(JSON.parse(options.body));
            return { ok: true, json: async () => ({ success: true }) };
        },
        require(name) {
            if (name === "express") return { Router: () => router };
            if (name === "../src/config/prisma") return prisma;
            if (name === "./auth") return { authenticateCustomer: nextMiddleware };
            if (name === "../src/rateLimit") return () => nextMiddleware;
            if (name === "../src/registrationDemoIsolation") return { registrationDemoEnabled: (db) => registrationDemoEnabled(db, env) };
            return require(name);
        },
    });

    async function request(method, path, { body, id = "1", user = customer, header = "demo" } = {}) {
        const req = { method, body, user, params: { applicationId: "APP-1", id }, get: () => header };
        const res = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; },
            sendStatus(code) { return this.status(code); },
        };
        const chain = middleware.filter(([prefix]) => path.startsWith(prefix)).map(([, fn]) => fn);
        chain.push(routes.get(method + " " + path));
        await chain.reduceRight((next, fn) => async () => {
            let downstream;
            await fn(req, res, () => { downstream = next(); });
            await downstream;
        }, () => {})();
        return res;
    }
    return { request, upstream, env, isolation, get state() { return state; } };
}

test("rejects demo operations without database attestation or in production", async () => {
    const { request, env, isolation } = fixture();
    isolation.allowed = false;
    assert.equal((await request("POST", receiptPath + "/pay", { body: payment })).statusCode, 404);
    assert.equal((await request("POST", reviewPath, { user: admin })).statusCode, 404);
    isolation.allowed = true;
    delete env.INDIPAY_REGISTRATION_DEMO_ISOLATION;
    assert.equal((await request("GET", receiptPath)).statusCode, 404);
    env.INDIPAY_REGISTRATION_DEMO_ISOLATION = "a".repeat(64);
    env.NODE_ENV = "production";
    assert.equal((await request("GET", receiptPath)).statusCode, 404);
});

test("requires demo mode, ownership, Primary Approval and accepted terms", async () => {
    const { request, upstream, env } = fixture();
    env.INDIPAY_REGISTRATION_DEMO = "0";
    assert.equal((await request("GET", receiptPath)).statusCode, 404);
    env.INDIPAY_REGISTRATION_DEMO = "1";
    assert.equal((await request("GET", receiptPath, { user: admin })).statusCode, 404);
    assert.equal((await request("GET", receiptPath)).statusCode, 409);
    upstream.registration = quote;
    const preview = await request("GET", receiptPath);
    assert.equal(preview.body.offer.amountPaise, 5000);
    assert.equal((await request("POST", receiptPath + "/pay", { body: { ...payment, accepted: false } })).statusCode, 422);
    assert.equal((await request("POST", receiptPath + "/pay", { body: payment, header: "" })).statusCode, 403);
});

test("rolls back insufficient payments and charges an exact or larger balance once", async () => {
    for (const startingBalance of [4999, 5000, 9000]) {
        const demo = fixture();
        demo.upstream.registration = quote;
        demo.state.wallet = startingBalance;
        const pay = () => demo.request("POST", receiptPath + "/pay", { body: payment });
        const first = await pay();
        if (startingBalance < 5000) {
            assert.equal(first.statusCode, 409);
            assert.equal(demo.state.wallet, startingBalance);
            assert.equal(demo.state.registration, null);
            assert.equal(demo.state.ledger.length, 0);
            continue;
        }
        assert.equal(first.statusCode, 200);
        const repeat = await pay();
        assert.equal(repeat.body.registration.reference, first.body.registration.reference);
        assert.equal(demo.state.wallet, startingBalance - 5000);
        assert.equal(demo.state.ledger.length, 1);
    }
});

test("keeps the receipt on a Jaytrade outage and retries without another debit", async () => {
    const demo = fixture();
    demo.upstream.registration = quote;
    demo.upstream.unavailable = true;
    demo.state.wallet = 5000;
    const result = await demo.request("POST", receiptPath + "/pay", { body: payment });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.registration.syncedAt, undefined);
    assert.equal((await demo.request("GET", receiptPath)).body.registration.reference, result.body.registration.reference);
    demo.upstream.unavailable = false;
    const retry = await demo.request("POST", receiptPath + "/sync", { body: {} });
    assert.ok(retry.body.registration.syncedAt);
    assert.equal(demo.state.ledger.length, 1);
    assert.equal(demo.state.wallet, 0);
});

test("simultaneous confirmation requests return the same receipt", async () => {
    const demo = fixture();
    demo.upstream.registration = quote;
    demo.state.wallet = 10000;
    const pay = () => demo.request("POST", receiptPath + "/pay", { body: payment });
    const [first, second] = await Promise.all([pay(), pay()]);
    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.equal(first.body.registration.reference, second.body.registration.reference);
    assert.equal(demo.state.ledger.length, 1);
    assert.equal(demo.state.wallet, 5000);
});

test("keeps credit pending, requires an admin and reference match, and prevents duplicate credits", async () => {
    const demo = fixture();
    const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aUfcAAAAASUVORK5CYII=", "base64");
    const submit = (utr) => demo.request("POST", "/credits", { body: { amountPaise: 5000, utr, mime: "image/png", data: image.toString("base64") } });
    const pending = await submit("DEMO1234");
    assert.equal(pending.statusCode, 201);
    assert.equal(pending.body.credit.status, "pending");
    assert.equal(demo.state.wallet, 0);
    assert.equal((await submit("DEMO1234")).statusCode, 409);
    const body = { decision: "approved", verified: true, confirmed: true, reference: "DEMO1234", remarks: "Demo match" };
    assert.equal((await demo.request("POST", reviewPath, { body })).statusCode, 403);
    assert.equal((await demo.request("POST", reviewPath, { body: { ...body, reference: "MISMATCH" }, user: admin })).statusCode, 422);
    assert.equal((await demo.request("POST", reviewPath, { body, user: admin })).body.credit.status, "approved");
    assert.equal((await demo.request("POST", reviewPath, { body, user: admin })).statusCode, 409);
    const second = await submit("DEMO5678");
    const rejected = await demo.request("POST", reviewPath, { id: second.body.credit.id, user: admin, body: { ...body, decision: "rejected" } });
    assert.equal(rejected.body.credit.status, "rejected");
    assert.equal(demo.state.wallet, 5000);
    assert.equal(demo.state.ledger.length, 1);
});
