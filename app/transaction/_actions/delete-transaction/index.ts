"use server";

import { auth } from "@clerk/nextjs/server";
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

  await db.transaction.delete({
    where: {
      id: params.id,
    },
  });
  revalidatePath("/transaction");
};
