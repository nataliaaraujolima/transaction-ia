"use server";

import { auth } from "@clerk/nextjs/server";
import type {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "../../../_lib/prisma";
import { addTransactionSchema } from "./schema";

interface UpsertTransactionParams {
  id?: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  paymentMethod: TransactionPaymentMethod;
  date: Date;
}

export const upsertTransaction = async (params: UpsertTransactionParams) => {
  addTransactionSchema.parse(params);
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { id, ...data } = params;
  const transactionId = id ?? crypto.randomUUID();

  await db.transaction.upsert({
    where: {
      id: transactionId,
    },
    update: data,
    create: {
      ...data,
      id: transactionId,
      userId,
    },
  });
  revalidatePath("/transaction");
};
