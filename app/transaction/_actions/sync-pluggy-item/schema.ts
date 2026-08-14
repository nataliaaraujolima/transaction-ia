import { z } from "zod";

export const syncPluggyItemSchema = z.object({
  itemId: z.string().uuid(),
});
