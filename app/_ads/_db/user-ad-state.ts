import { db } from "@/app/_lib/prisma";

export async function findUserAdStateByUserId(userId: string) {
  return db.userAdState.findUnique({
    where: { userId },
  });
}

export async function countAdImpressionsToday(userId: string): Promise<number> {
  const startOfDayUTC = new Date();
  startOfDayUTC.setUTCHours(0, 0, 0, 0);

  return db.adImpression.count({
    where: {
      userId,
      createdAt: { gte: startOfDayUTC },
    },
  });
}

export async function upsertUserAdStateAfterImpression(params: {
  userId: string;
  sessionId: string;
  slotId: string;
  campaignKv?: Record<string, string>;
}) {
  const existing = await db.userAdState.findUnique({
    where: { userId: params.userId },
  });

  return db.userAdState.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      adSeen: true,
      adSeenAt: new Date(),
      adViewsCount: 1,
      adLastViewSessionId: params.sessionId,
      adLastSlotId: params.slotId,
      adCampaignKv: params.campaignKv,
    },
    update: {
      adSeen: true,
      adSeenAt: existing?.adSeenAt ?? new Date(),
      adViewsCount: { increment: 1 },
      adLastViewSessionId: params.sessionId,
      adLastSlotId: params.slotId,
      adCampaignKv: params.campaignKv,
    },
  });
}

export async function dismissUserAd(userId: string, days = 1) {
  const dismissedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return db.userAdState.upsert({
    where: { userId },
    create: {
      userId,
      dismissedUntil,
    },
    update: {
      dismissedUntil,
    },
  });
}
