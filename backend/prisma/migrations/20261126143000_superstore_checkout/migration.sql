ALTER TABLE "MarketplaceOrder" ADD COLUMN "checkoutDetails" JSONB;
ALTER TABLE "ApplicationDemoCredit" ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'application';

CREATE TABLE "MarketplaceVariant" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "MarketplaceProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "attributes" JSONB NOT NULL,
    "price" INTEGER NOT NULL CHECK ("price" > 0),
    "original" INTEGER NOT NULL CHECK ("original" >= "price"),
    "stock" INTEGER NOT NULL CHECK ("stock" >= 0),
    "active" BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX "MarketplaceVariant_productId_idx" ON "MarketplaceVariant"("productId");

CREATE TABLE "MarketplaceAddress" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "details" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MarketplaceAddress_userId_idx" ON "MarketplaceAddress"("userId");
CREATE UNIQUE INDEX "MarketplaceAddress_one_default" ON "MarketplaceAddress"("userId") WHERE "isDefault";

CREATE TABLE "MarketplaceCheckout" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "paymentReference" TEXT NOT NULL UNIQUE,
    "orderIds" TEXT[] NOT NULL,
    "total" INTEGER NOT NULL CHECK ("total" > 0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MarketplaceCheckout_userId_idx" ON "MarketplaceCheckout"("userId");
