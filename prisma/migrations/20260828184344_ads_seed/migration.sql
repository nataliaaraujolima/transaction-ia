-- CreateTable
CREATE TABLE "UserAdState" (
    "userId" TEXT NOT NULL,
    "adSeen" BOOLEAN NOT NULL DEFAULT false,
    "adSeenAt" TIMESTAMP(3),
    "adViewsCount" INTEGER NOT NULL DEFAULT 0,
    "adLastViewSessionId" TEXT,
    "adLastSlotId" TEXT,
    "adCampaignKv" JSONB,
    "dismissedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAdState_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "AdImpression" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "adUnitId" TEXT,
    "sessionId" TEXT NOT NULL,
    "campaignKv" JSONB,
    "source" TEXT NOT NULL DEFAULT 'gpt',
    "dedupKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdImpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdEventError" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "slotId" TEXT,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdEventError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdImpression_dedupKey_key" ON "AdImpression"("dedupKey");

-- CreateIndex
CREATE INDEX "AdImpression_userId_createdAt_idx" ON "AdImpression"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AdImpression_userId_slotId_sessionId_idx" ON "AdImpression"("userId", "slotId", "sessionId");

-- CreateIndex
CREATE INDEX "AdEventError_createdAt_idx" ON "AdEventError"("createdAt");
