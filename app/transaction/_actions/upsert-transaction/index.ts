"use server";

import { auth } from "@clerk/nextjs/server";
import {
  type TransactionCategory,
  type TransactionPaymentMethod,
  TransactionSource,
  type TransactionType,
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

  if (id) {
    const existing = await db.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    if (existing.source === TransactionSource.BANK) {
      throw new Error("Bank transactions cannot be edited");
    }

    await db.transaction.update({
      where: { id },
      data,
    });
  } else {
    await db.transaction.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        userId,
        source: TransactionSource.MANUAL,
      },
    });
  }

  revalidatePath("/transaction");
};
