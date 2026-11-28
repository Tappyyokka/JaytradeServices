CREATE TABLE "ServiceOverride" (
    "id" TEXT PRIMARY KEY, "description" TEXT NOT NULL, "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "MerchantPlanOverride" (
    "id" TEXT PRIMARY KEY, "amountPaise" INTEGER NOT NULL, "days" INTEGER NOT NULL,
    "limit" INTEGER, "available" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "MarketplaceStore" ADD COLUMN "subscriptionProductLimit" INTEGER;
