const assert = require("node:assert/strict");
const { test } = require("node:test");
const { deliverOne } = require("../src/applicationDelivery");
const { deliverConfirmation } = require("../src/registrationConfirmationDelivery");

function fixture(confirmation = false) {
    const applicationId = "IND-DELIVERY-FIXTURE";
    const request = { applicationId, attempts: 0 };
    const results = [];
    const original = { applicationId, reference: "existing-confirmed-fixture-reference", amountPaise: 300000,
        acceptedAt: new Date("2026-11-28T00:00:00Z") };
    const db = {
        $queryRaw: async (strings) => {
            if (strings.join("").includes("indipay_demo_guard")) return [{ allowed: true }];
            return [{ ...request, attempts: ++request.attempts }];
        },
        $transaction: async (work) => work({
            $executeRaw: async (strings, delay, _repeatedDelay, reason) => {
                results.push({ sql: strings.join(""), delay, reason });
                return 1;
            },
            application: { update: async ({ data }) => { results.push(data); } },
            applicationDemoRegistration: { updateMany: async ({ data }) => { results.push(data); } },
        }),
        application: { findUniqueOrThrow: async () => ({ applicationId, fullName: "Synthetic customer" }) },
        applicationDemoRegistration: { findUniqueOrThrow: async () => original },
    };
    const env = { NODE_ENV: "development", INDIPAY_REGISTRATION_DEMO: "1",
        INDIPAY_REGISTRATION_DEMO_ISOLATION: "a".repeat(64), JAYTRADE_STATUS_API_URL: "http://fixture.invalid",
        INDIPAY_API_KEY: "fixture-key" };
    const deliver = () => confirmation ? deliverConfirmation(db, applicationId, env) : deliverOne(db, "http://fixture.invalid", "fixture-key");
    return { deliver, results, original, applicationId, env };
}

test("outage preserves the enquiry ID, backs off and retries the original lead", async (t) => {
    const { deliver, results, applicationId } = fixture();
    const sent = [];
    t.mock.method(globalThis, "fetch", async (_url, options) => {
        sent.push(JSON.parse(options.body).application_id);
        assert.equal(options.redirect, "error");
        return sent.length === 1 ? new Response("{}", { status: 503 })
            : Response.json({ success: true, lead_id: 42 });
    });
    await deliver();
    assert.deepEqual(results[1], { leadSyncStatus: "PENDING" });
    assert.equal(results[0].delay, 15);
    await deliver();
    assert.deepEqual(sent, [applicationId, applicationId]);
    assert.deepEqual(results[3], { leadId: "42", leadSyncStatus: "SYNCED" });
});

test("an identity conflict is terminal and recorded without upstream details", async (t) => {
    const { deliver, results } = fixture();
    t.mock.method(globalThis, "fetch", async () => new Response("Private details", { status: 409 }));
    await deliver();
    assert.equal(results[0].delay, null);
    assert.equal(results[0].reason, "identity_conflict");
    assert.deepEqual(results[1], { leadSyncStatus: "FAILED" });
});

test("confirmation retries preserve the existing receipt and stop on conflicts", async (t) => {
    const { deliver, results, original } = fixture(true);
    const sent = [];
    t.mock.method(globalThis, "fetch", async (_url, options) => {
        sent.push(JSON.parse(options.body));
        return new Response("{}", { status: sent.length === 1 ? 503 : 409 });
    });
    await deliver();
    await deliver();
    assert.equal(results[0].delay, 15);
    assert.equal(results[1].delay, null);
    assert.equal(results[1].reason, "confirmation_conflict");
    assert.deepEqual(sent[0], sent[1]);
    assert.equal(sent[0].payment_reference, original.reference);
});
