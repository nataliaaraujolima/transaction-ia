import { z } from "zod";

export const deleteTransactionSchema = z.object({
  id: z.string().uuid(),
});
