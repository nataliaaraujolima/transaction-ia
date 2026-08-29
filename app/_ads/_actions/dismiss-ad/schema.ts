import { z } from "zod";

export const dismissAdSchema = z.object({});

export type DismissAdSchema = z.infer<typeof dismissAdSchema>;
