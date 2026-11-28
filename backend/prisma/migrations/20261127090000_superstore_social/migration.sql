ALTER TABLE "MarketplaceProduct" ADD COLUMN "createdAt" TIMESTAMP(3);
ALTER TABLE "MarketplaceProduct" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "MarketplaceFollow" (
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "storeId" TEXT NOT NULL REFERENCES "MarketplaceStore"("userId") ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "following" BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY ("userId", "storeId")
);
CREATE INDEX "MarketplaceFollow_storeId_createdAt_idx" ON "MarketplaceFollow"("storeId", "createdAt");

CREATE TABLE "MarketplaceProductState" (
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "productKey" TEXT NOT NULL,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY ("userId", "productKey")
);
CREATE TABLE "MarketplaceSocialPreference" (
    "userId" TEXT PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "storeUpdates" BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE "MarketplaceReview" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "MarketplaceProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "orderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
    "text" TEXT NOT NULL,
    "image" TEXT,
    "reply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "MarketplaceReview_userId_productId_key" ON "MarketplaceReview"("userId", "productId");
CREATE INDEX "MarketplaceReview_productId_createdAt_idx" ON "MarketplaceReview"("productId", "createdAt");
CREATE INDEX "MarketplaceReview_userId_repliedAt_idx" ON "MarketplaceReview"("userId", "repliedAt");
CREATE TABLE "MarketplaceReviewReport" (
    "reviewId" TEXT NOT NULL REFERENCES "MarketplaceReview"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("reviewId", "userId")
);
CREATE INDEX "MarketplaceReviewReport_createdAt_idx" ON "MarketplaceReviewReport"("createdAt");
CREATE TABLE "MarketplacePost" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "MarketplaceProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "kind" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MarketplacePost_productId_createdAt_idx" ON "MarketplacePost"("productId", "createdAt");
