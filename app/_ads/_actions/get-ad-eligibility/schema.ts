import { z } from "zod";

export const getAdEligibilitySchema = z.object({
  pathname: z.string().trim().min(1).optional(),
});

export type GetAdEligibilitySchema = z.infer<typeof getAdEligibilitySchema>;