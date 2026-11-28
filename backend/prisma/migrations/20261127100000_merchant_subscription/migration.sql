ALTER TABLE "MarketplaceStore"
    ADD COLUMN "pendingPlan" TEXT,
    ADD COLUMN "subscriptionIntent" TEXT,
    ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN "subscriptionStart" TIMESTAMP(3),
    ADD COLUMN "subscriptionEnd" TIMESTAMP(3),
    ADD COLUMN "subscriptionReference" TEXT,
    ADD COLUMN "merchantSuspended" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "MarketplaceStore_subscriptionIntent_key" ON "MarketplaceStore"("subscriptionIntent");
