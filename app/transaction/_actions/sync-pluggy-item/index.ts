"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { pluggyClient } from "../../../_lib/pluggy";
import { db } from "../../../_lib/prisma";
import { mapPluggyTransaction } from "../../_lib/map-pluggy-transaction";
import { syncPluggyItemSchema } from "./schema";

interface SyncPluggyItemParams {
  itemId: string;
}

export const syncPluggyItem = async (params: SyncPluggyItemParams) => {
  syncPluggyItemSchema.parse(params);
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { itemId } = params;

  const existingConnection = await db.pluggyConnection.findUnique({
    where: { itemId },
  });

  if (existingConnection && existingConnection.userId !== userId) {
    throw new Error("This Pluggy item belongs to another user");
  }

  await db.pluggyConnection.upsert({
    where: { itemId },
    create: {
      id: crypto.randomUUID(),
      userId,
      itemId,
    },
    update: {},
  });

  const accountsPage = await pluggyClient.fetchAccounts(itemId);
  const accounts = accountsPage.results;

  const mappedTransactions = (
    await Promise.all(
      accounts.map(async (account) => {
        const txs = await pluggyClient.fetchAllTransactions(account.id);
        return txs.map((tx) =>
          mapPluggyTransaction({
            id: tx.id,
            accountId: account.id,
            itemId,
            description: tx.description,
            amount: tx.amount,
            type: tx.type,
            date: tx.date,
          })
        );
      })
    )
  ).flat();

  await Promise.all(
    mappedTransactions.map((tx) =>
      db.transaction.upsert({
        where: { pluggyTransactionId: tx.pluggyTransactionId },
        create: {
          id: crypto.randomUUID(),
          userId,
          name: tx.name,
          type: tx.type,
          amount: tx.amount,
          category: tx.category,
          paymentMethod: tx.paymentMethod,
          date: tx.date,
          source: tx.source,
          pluggyTransactionId: tx.pluggyTransactionId,
          pluggyAccountId: tx.pluggyAccountId,
          pluggyItemId: tx.pluggyItemId,
        },
        update: {
          name: tx.name,
          type: tx.type,
          amount: tx.amount,
          category: tx.category,
          paymentMethod: tx.paymentMethod,
          date: tx.date,
          pluggyAccountId: tx.pluggyAccountId,
          pluggyItemId: tx.pluggyItemId,
          userId,
        },
      })
    )
  );

  revalidatePath("/transaction");
  revalidatePath("/pluggy");

  return {
    accountsCount: accounts.length,
    transactionsSynced: mappedTransactions.length,
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      subtype: account.subtype,
      balance: account.balance,
      currencyCode: account.currencyCode,
    })),
  };
};
