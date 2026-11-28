ALTER TABLE "MarketplaceOrder"
    ADD COLUMN "management" JSONB,
    ADD COLUMN "managementVersion" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "managementUpdatedAt" TIMESTAMP(3);
