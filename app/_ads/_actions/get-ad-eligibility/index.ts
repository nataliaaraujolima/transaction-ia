"use server";

import { auth } from "@clerk/nextjs/server";
import { resolveAdEligibility } from "../../_use-cases/resolve-ad-eligibility";
import { type GetAdEligibilitySchema, getAdEligibilitySchema } from "./schema";

export async function getAdEligibility(params: GetAdEligibilitySchema = {}) {
  getAdEligibilitySchema.parse(params);

  const { userId } = await auth();

  if (!userId) {
    return {
      eligible: false as const,
      adConfig: null,
      reason: "unauthorized" as const,
    };
  }

  return resolveAdEligibility(userId);
}
