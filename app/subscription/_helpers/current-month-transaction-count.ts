import { endOfMonth, startOfMonth } from "date-fns";
import { db } from "@/app/_lib/prisma";

export async function currentMonthTransactionCount(userId: string | null) {
  const currentMonthTransactions = await db.transaction.count({
    where: {
      userId: userId ?? undefined,
      createdAt: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
    },
  });
  const currentMonthTransactionLimit = currentMonthTransactions === 10;

  return {
    currentMonthTransactions,
    currentMonthTransactionLimit,
  };
}
