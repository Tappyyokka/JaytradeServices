-- CreateTable
CREATE TABLE "MarketplaceStore" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "MarketplaceStore_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "MarketplaceProduct" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "original" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MarketplaceProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceWallet" (
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MarketplaceWallet_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "MarketplaceLedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lines" JSONB NOT NULL,
    "total" INTEGER NOT NULL,
    "sellerStage" INTEGER NOT NULL DEFAULT 0,
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketplaceProduct_sellerId_idx" ON "MarketplaceProduct"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceLedgerEntry_reference_key" ON "MarketplaceLedgerEntry"("reference");

-- CreateIndex
CREATE INDEX "MarketplaceLedgerEntry_userId_createdAt_idx" ON "MarketplaceLedgerEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MarketplaceOrder_userId_createdAt_idx" ON "MarketplaceOrder"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "MarketplaceStore" ADD CONSTRAINT "MarketplaceStore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceProduct" ADD CONSTRAINT "MarketplaceProduct_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "MarketplaceStore"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceWallet" ADD CONSTRAINT "MarketplaceWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceLedgerEntry" ADD CONSTRAINT "MarketplaceLedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MarketplaceWallet"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceOrder" ADD CONSTRAINT "MarketplaceOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MarketplaceWallet" ADD CHECK ("balance" >= 0);
ALTER TABLE "MarketplaceProduct" ADD CHECK ("stock" >= 0 AND "price" > 0 AND "original" >= "price");
