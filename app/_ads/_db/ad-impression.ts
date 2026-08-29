import { db } from "@/app/_lib/prisma";

export async function findAdImpressionByDedupKey(dedupKey: string) {
  return db.adImpression.findUnique({ where: { dedupKey } });
}

export async function countRecentAdImpressions(userId: string, withinMs: number): Promise<number> {
  const since = new Date(Date.now() - withinMs);
  return db.adImpression.count({
    where: {
      userId,
      createdAt: { gte: since },
    },
  });
}

export async function createAdEventError(params: {
  userId?: string;
  slotId?: string;
  code: string;
  message: string;
  payload?: object;
}) {
  return db.adEventError.create({
    data: {
      userId: params.userId,
      slotId: params.slotId,
      code: params.code,
      message: params.message,
      payload: params.payload,
    },
  });
}
