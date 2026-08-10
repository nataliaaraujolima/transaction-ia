import { TransactionCategory, TransactionPaymentMethod, TransactionType } from "@prisma/client";
import { z } from "zod";

export const addTransactionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1),
  amount: z.number().positive(),
  type: z.enum(TransactionType),
  category: z.enum(TransactionCategory),
  paymentMethod: z.enum(TransactionPaymentMethod),
  date: z.date(),
});
