-- AlterTable
ALTER TABLE "Stock"
    ALTER COLUMN "purchasePrice" SET DATA TYPE DECIMAL(18, 4),
    ALTER COLUMN "currentPrice" SET DATA TYPE DECIMAL(18, 4);

-- AlterTable
ALTER TABLE "Transaction"
    ALTER COLUMN "price" SET DATA TYPE DECIMAL(18, 4),
    ALTER COLUMN "total" SET DATA TYPE DECIMAL(18, 4);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_ticker_userId_key" ON "Stock"("ticker", "userId");
