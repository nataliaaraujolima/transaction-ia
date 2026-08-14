"use server";

import { auth } from "@clerk/nextjs/server";
import { TransactionSource } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "../../../_lib/prisma";
import { deleteTransactionSchema } from "./schema";

interface DeleteTransactionParams {
  id: string;
}

export const deleteTransaction = async (params: DeleteTransactionParams) => {
  deleteTransactionSchema.parse(params);
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await db.transaction.deleteMany({
    where: {
      id: params.id,
      userId,
      source: TransactionSource.MANUAL,
    },
  });

  if (result.count === 0) {
    throw new Error("Transaction not found or cannot be deleted");
  }

  revalidatePath("/transaction");
};
