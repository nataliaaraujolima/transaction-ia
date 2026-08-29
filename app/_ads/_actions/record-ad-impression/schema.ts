import { z } from "zod";

export const recordAdImpressionSchema = z.object({
  slotId: z.string().trim().min(1).max(64),
  sessionId: z.string().trim().min(1).max(128),
  adUnitId: z.string().trim().max(128).optional(),
  campaignKv: z.record(z.string(), z.string()).optional(),
});

export type RecordAdImpressionSchema = z.infer<typeof recordAdImpressionSchema>;
