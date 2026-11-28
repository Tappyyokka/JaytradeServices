ALTER TABLE "MarketplaceStore"
    ADD COLUMN "username" TEXT,
    ADD COLUMN "profile" JSONB,
    ADD COLUMN "plan" TEXT;

CREATE UNIQUE INDEX "MarketplaceStore_username_key" ON "MarketplaceStore"("username");

ALTER TABLE "MarketplaceProduct"
    ADD COLUMN "images" JSONB,
    ADD COLUMN "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN "deletedAt" TIMESTAMP(3);
