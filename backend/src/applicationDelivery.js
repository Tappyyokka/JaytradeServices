const MAX_ATTEMPTS = 5;
const { deliverConfirmation } = require("./registrationConfirmationDelivery");

async function enqueueDelivery(db, applicationId) {
    await db.$executeRaw`INSERT INTO "ApplicationDelivery" ("applicationId") VALUES (${applicationId})`;
}

async function deliverOne(db, endpoint, apiKey) {
    const [job] = await db.$queryRaw`
        WITH candidate AS (
            SELECT d."applicationId" FROM "ApplicationDelivery" d
            JOIN "Application" a USING ("applicationId")
            WHERE d."nextAttemptAt" <= now() AND a."leadSyncStatus" <> 'SYNCED'
              AND NOT EXISTS (SELECT 1 FROM "ApplicationDemoRegistration" r WHERE r."applicationId" = d."applicationId")
            ORDER BY d."nextAttemptAt" FOR UPDATE OF d SKIP LOCKED LIMIT 1
        )
        UPDATE "ApplicationDelivery" d SET "attempts" = d."attempts" + 1,
            "lastAttemptAt" = now(), "nextAttemptAt" = now() + interval '60 seconds'
        FROM candidate c WHERE d."applicationId" = c."applicationId"
        RETURNING d."applicationId", d."attempts"
    `;
    if (!job) return false;
    const application = await db.application.findUniqueOrThrow({ where: { applicationId: job.applicationId } });
    const { applicationId, fullName, mobile, email, service, address, district, state, pincode, remarks } = application;
    let reason = "upstream_unavailable";
    let leadId;
    let retryable = true;
    try {
        const response = await fetch(endpoint, {
            method: "POST", redirect: "error", signal: AbortSignal.timeout(8000),
            headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
            body: JSON.stringify({ application_id: applicationId, fullName, mobile, email, service, address,
                district, state, pincode, remarks: remarks ?? "" }),
        });
        retryable = response.ok || response.status === 429 || response.status >= 500;
        if (response.ok) {
            reason = "invalid_upstream_response";
            const data = await response.json();
            if (data.success && Number.isSafeInteger(data.lead_id) && data.lead_id > 0) leadId = String(data.lead_id);
            else reason = "invalid_upstream_response";
        } else {
            reason = response.status === 409 ? "identity_conflict" : retryable ? "upstream_unavailable" : "upstream_rejected";
        }
    } catch {
        // Persist a category rather than upstream response bodies or credentials.
    }
    const delay = !leadId && retryable && job.attempts < MAX_ATTEMPTS ? Math.min(300, 15 * 2 ** (job.attempts - 1)) : null;
    await db.$transaction(async (tx) => {
        const changed = await tx.$executeRaw`UPDATE "ApplicationDelivery"
            SET "nextAttemptAt" = CASE WHEN ${delay}::integer IS NULL THEN NULL ELSE now() + ${delay}::integer * interval '1 second' END,
                "reason" = ${leadId ? null : reason}
            WHERE "applicationId" = ${applicationId} AND "attempts" = ${job.attempts}`;
        if (changed) await tx.application.update({ where: { applicationId }, data: leadId
            ? { leadId, leadSyncStatus: "SYNCED" }
            : { leadSyncStatus: delay === null ? "FAILED" : "PENDING" } });
    });
    return true;
}

function startApplicationDelivery(db, endpoint, apiKey) {
    if (!endpoint || !apiKey) throw new Error("Jaytrade delivery configuration is missing");
    let running = false;
    const timer = setInterval(async () => {
        if (running) return;
        running = true;
        try {
            for (let count = 0; count < 10 && await deliverOne(db, endpoint, apiKey); count += 1) {
                // Bound each scan to leave capacity for normal requests.
            }
            await deliverConfirmation(db);
        } catch (error) {
            console.error("Application delivery worker failed:", error.code || error.name);
        } finally { running = false; }
    }, 3000);
    timer.unref();
}

module.exports = { enqueueDelivery, deliverOne, startApplicationDelivery };
