-- Bring the two demonstration balances into one Customer Money wallet.
-- Amounts are stored in paise so application fees retain their precision.
BEGIN;
ALTER TABLE "MarketplaceWallet" ADD COLUMN "balancePaise" INTEGER;
UPDATE "MarketplaceWallet" SET "balancePaise" = "balance" * 100;

INSERT INTO "MarketplaceWallet" ("userId", "balance", "balancePaise")
SELECT "userId", 0, "balancePaise" FROM "ApplicationDemoWallet"
ON CONFLICT ("userId") DO UPDATE
SET "balancePaise" = "MarketplaceWallet"."balancePaise" + EXCLUDED."balancePaise";

INSERT INTO "MarketplaceWallet" ("userId", "balance", "balancePaise")
SELECT DISTINCT "userId", 0, 0 FROM "ApplicationDemoLedger"
ON CONFLICT ("userId") DO NOTHING;

ALTER TABLE "MarketplaceWallet" ALTER COLUMN "balancePaise" SET DEFAULT 0;
ALTER TABLE "MarketplaceWallet" ALTER COLUMN "balancePaise" SET NOT NULL;
ALTER TABLE "MarketplaceWallet" DROP COLUMN "balance";
ALTER TABLE "MarketplaceWallet" ADD CONSTRAINT "MarketplaceWallet_balancePaise_check" CHECK ("balancePaise" >= 0);

ALTER TABLE "MarketplaceLedgerEntry" ADD COLUMN "amountPaise" INTEGER;
UPDATE "MarketplaceLedgerEntry" SET "amountPaise" = "amount" * 100;
ALTER TABLE "MarketplaceLedgerEntry" ALTER COLUMN "amountPaise" SET NOT NULL;
ALTER TABLE "MarketplaceLedgerEntry" ALTER COLUMN "amount" DROP NOT NULL;

INSERT INTO "MarketplaceLedgerEntry" ("id", "userId", "amountPaise", "reference", "createdAt")
SELECT gen_random_uuid()::text, "userId", "amountPaise", "reference", "createdAt"
FROM "ApplicationDemoLedger";

ALTER TABLE "MarketplaceLedgerEntry" DROP COLUMN "amount";
DROP TABLE "ApplicationDemoLedger";
DROP TABLE "ApplicationDemoWallet";
COMMIT;
