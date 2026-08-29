"use server";

import { auth } from "@clerk/nextjs/server";
import { recordImpression } from "@/app/_ads/_use-cases/record-impression";
import { type RecordAdImpressionSchema, recordAdImpressionSchema } from "./schema";

export async function recordAdImpression(params: RecordAdImpressionSchema) {
  const parsed = recordAdImpressionSchema.parse(params);
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return recordImpression({
    userId,
    ...parsed,
  });
}
