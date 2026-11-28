CREATE TABLE "ApplicationDelivery" (
    "applicationId" text PRIMARY KEY REFERENCES "Application"("applicationId") ON DELETE RESTRICT,
    "attempts" integer NOT NULL DEFAULT 0,
    "lastAttemptAt" timestamptz,
    "nextAttemptAt" timestamptz DEFAULT now(),
    "reason" text
);
CREATE INDEX "ApplicationDelivery_due_idx" ON "ApplicationDelivery" ("nextAttemptAt") WHERE "nextAttemptAt" IS NOT NULL;
