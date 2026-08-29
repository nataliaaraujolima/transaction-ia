"use server";

import { auth } from "@clerk/nextjs/server";
import { dismissUserAd } from "@/app/_ads/_db/user-ad-state";
import { dismissAdSchema } from "./schema";

export async function dismissAd(params: unknown = {}) {
  dismissAdSchema.parse(params);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await dismissUserAd(userId, 1);
  return { ok: true as const };
}
