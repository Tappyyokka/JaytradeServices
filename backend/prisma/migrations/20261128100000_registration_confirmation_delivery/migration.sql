CREATE TABLE "RegistrationConfirmationDelivery" (
    "applicationId" text PRIMARY KEY REFERENCES "ApplicationDemoRegistration"("applicationId") ON DELETE RESTRICT,
    "attempts" integer NOT NULL DEFAULT 0,
    "lastAttemptAt" timestamptz,
    "nextAttemptAt" timestamptz DEFAULT now(),
    "reason" text
);
CREATE INDEX "RegistrationConfirmationDelivery_due_idx" ON "RegistrationConfirmationDelivery" ("nextAttemptAt") WHERE "nextAttemptAt" IS NOT NULL;
