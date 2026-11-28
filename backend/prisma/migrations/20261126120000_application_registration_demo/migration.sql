CREATE TABLE "ApplicationDemoWallet" (
    "userId" TEXT PRIMARY KEY,
    "balancePaise" INTEGER NOT NULL DEFAULT 0 CHECK ("balancePaise" >= 0)
);

CREATE TABLE "ApplicationDemoRegistration" (
    "applicationId" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "staff" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "reference" TEXT NOT NULL UNIQUE,
    "termsVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP(3)
);

CREATE TABLE "ApplicationDemoCredit" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "amountPaise" INTEGER NOT NULL,
    "utr" TEXT NOT NULL UNIQUE,
    "mime" TEXT NOT NULL,
    "evidence" BYTEA NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "remarks" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ApplicationDemoLedger" (
    "reference" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ApplicationDemoRegistration_userId_idx" ON "ApplicationDemoRegistration"("userId");
CREATE INDEX "ApplicationDemoCredit_userId_createdAt_idx" ON "ApplicationDemoCredit"("userId", "createdAt");
CREATE INDEX "ApplicationDemoLedger_userId_createdAt_idx" ON "ApplicationDemoLedger"("userId", "createdAt");
