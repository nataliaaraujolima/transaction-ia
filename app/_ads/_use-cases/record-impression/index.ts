import { Prisma } from "@prisma/client";
import {
  countRecentAdImpressions,
  createAdEventError,
  findAdImpressionByDedupKey,
} from "@/app/_ads/_db/ad-impression";
import { buildDedupKey } from "@/app/_ads/_helpers/dedup-key";
import { sanitizeCampaignKv } from "@/app/_ads/_helpers/sanitize-campaign-kv";
import { resolveAdEligibility } from "@/app/_ads/_use-cases/resolve-ad-eligibility";
import { db } from "@/app/_lib/prisma";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

export type RecordImpressionInput = {
  userId: string;
  slotId: string;
  sessionId: string;
  adUnitId?: string;
  campaignKv?: Record<string, string>;
};

export type RecordImpressionResult =
  | { ok: true; status: 201; deduplicated: false }
  | { ok: true; status: 200; deduplicated: true; reason: "duplicate" }
  | { ok: false; status: 403; reason: string }
  | { ok: false; status: 429; reason: "rate_limited" }
  | { ok: false; status: 500; reason: "persist_failed" };

export async function recordImpression(
  input: RecordImpressionInput
): Promise<RecordImpressionResult> {
  const eligibility = await resolveAdEligibility(input.userId);

  if (!eligibility.eligible) {
    return { ok: false, status: 403, reason: eligibility.reason };
  }

  const recentCount = await countRecentAdImpressions(input.userId, RATE_LIMIT_WINDOW_MS);
  if (recentCount >= RATE_LIMIT_MAX) {
    return { ok: false, status: 429, reason: "rate_limited" };
  }

  const campaignKv = sanitizeCampaignKv(input.campaignKv);
  const dedupKey = buildDedupKey({
    userId: input.userId,
    slotId: input.slotId,
    sessionId: input.sessionId,
  });

  const existing = await findAdImpressionByDedupKey(dedupKey);
  if (existing) {
    return {
      ok: true,
      status: 200,
      deduplicated: true,
      reason: "duplicate",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.adImpression.create({
        data: {
          userId: input.userId,
          slotId: input.slotId,
          sessionId: input.sessionId,
          adUnitId: input.adUnitId,
          campaignKv,
          source: "gpt",
          dedupKey,
        },
      });

      const existingState = await tx.userAdState.findUnique({
        where: { userId: input.userId },
      });

      await tx.userAdState.upsert({
        where: { userId: input.userId },
        create: {
          userId: input.userId,
          adSeen: true,
          adSeenAt: new Date(),
          adViewsCount: 1,
          adLastViewSessionId: input.sessionId,
          adLastSlotId: input.slotId,
          adCampaignKv: campaignKv,
        },
        update: {
          adSeen: true,
          adSeenAt: existingState?.adSeenAt ?? new Date(),
          adViewsCount: { increment: 1 },
          adLastViewSessionId: input.sessionId,
          adLastSlotId: input.slotId,
          adCampaignKv: campaignKv,
        },
      });
    });

    return { ok: true, status: 201, deduplicated: false };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: true,
        status: 200,
        deduplicated: true,
        reason: "duplicate",
      };
    }

    await createAdEventError({
      userId: input.userId,
      slotId: input.slotId,
      code: "persist_failed",
      message: error instanceof Error ? error.message : "Unknown error",
      payload: { slotId: input.slotId }, // sem PII
    });

    return { ok: false, status: 500, reason: "persist_failed" };
  }
}
