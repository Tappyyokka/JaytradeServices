const { registrationDemoEnabled } = require("./registrationDemoIsolation");

async function enqueueConfirmation(db, applicationId) {
    await db.$executeRaw`INSERT INTO "RegistrationConfirmationDelivery" ("applicationId")
        VALUES (${applicationId}) ON CONFLICT ("applicationId") DO NOTHING`;
}

async function deliverConfirmation(db, applicationId = null, env = process.env) {
    if (!await registrationDemoEnabled(db, env)) return false;
    const [job] = await db.$queryRaw`
        WITH candidate AS (
            SELECT j."applicationId" FROM "RegistrationConfirmationDelivery" j
            JOIN "ApplicationDemoRegistration" r USING ("applicationId")
            WHERE j."nextAttemptAt" <= now() AND r."syncedAt" IS NULL
                AND (${applicationId}::text IS NULL OR j."applicationId" = ${applicationId})
            ORDER BY j."nextAttemptAt" FOR UPDATE OF j SKIP LOCKED LIMIT 1
        )
        UPDATE "RegistrationConfirmationDelivery" j SET "attempts" = j."attempts" + 1,
            "lastAttemptAt" = now(), "nextAttemptAt" = now() + interval '60 seconds'
        FROM candidate c WHERE j."applicationId" = c."applicationId"
        RETURNING j."applicationId", j."attempts"
    `;
    if (!job) return false;
    const record = await db.applicationDemoRegistration.findUniqueOrThrow({ where: { applicationId: job.applicationId } });
    let reason = "upstream_unavailable";
    let retry = true;
    let synced = false;
    try {
        const base = env.JAYTRADE_STATUS_API_URL?.replace(/\/+$/, "");
        if (!base || !env.INDIPAY_API_KEY) throw new Error("Unconfigured");
        const response = await fetch(base + "/" + encodeURIComponent(job.applicationId) + "/registration", {
            method: "POST", redirect: "error", signal: AbortSignal.timeout(5000),
            headers: { "X-API-Key": env.INDIPAY_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ demo: true, payment_reference: record.reference,
                amount_paise: record.amountPaise, registered_at: record.acceptedAt }),
        });
        retry = response.ok || response.status === 429 || response.status >= 500;
        if (response.ok) {
            reason = "invalid_upstream_response";
            const result = await response.json();
            if (result.application_id && result.application_id !== job.applicationId) {
                retry = false;
                reason = "confirmation_conflict";
            } else synced = result.success === true;
        } else if (!retry) reason = "confirmation_conflict";
    } catch {
        // Retry transport failures without logging receipt data.
    }
    const delay = !synced && retry && job.attempts < 5 ? 15 * 2 ** (job.attempts - 1) : null;
    await db.$transaction(async (tx) => {
        const changed = await tx.$executeRaw`UPDATE "RegistrationConfirmationDelivery"
            SET "nextAttemptAt" = CASE WHEN ${delay}::integer IS NULL THEN NULL ELSE now() + ${delay}::integer * interval '1 second' END,
                "reason" = ${synced ? null : reason}
            WHERE "applicationId" = ${job.applicationId} AND "attempts" = ${job.attempts}`;
        if (changed && synced) await tx.applicationDemoRegistration.updateMany({
            where: { applicationId: job.applicationId, syncedAt: null }, data: { syncedAt: new Date() },
        });
    });
    return true;
}

async function requestConfirmationRetry(db, applicationId) {
    await db.$executeRaw`UPDATE "RegistrationConfirmationDelivery" SET "attempts" = 0, "nextAttemptAt" = now()
        WHERE "applicationId" = ${applicationId} AND "nextAttemptAt" IS NULL AND "reason" = 'upstream_unavailable'`;
}

module.exports = { enqueueConfirmation, deliverConfirmation, requestConfirmationRetry };
