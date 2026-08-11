-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('MANUAL', 'BANK');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "source" "TransactionSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "pluggyTransactionId" TEXT,
ADD COLUMN     "pluggyAccountId" TEXT,
ADD COLUMN     "pluggyItemId" TEXT;

-- CreateTable
CREATE TABLE "PluggyConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PluggyConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_pluggyTransactionId_key" ON "Transaction"("pluggyTransactionId");

-- CreateIndex
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");

-- CreateIndex
CREATE INDEX "Transaction_userId_source_idx" ON "Transaction"("userId", "source");

-- CreateIndex
CREATE UNIQUE INDEX "PluggyConnection_itemId_key" ON "PluggyConnection"("itemId");

-- CreateIndex
CREATE INDEX "PluggyConnection_userId_idx" ON "PluggyConnection"("userId");
