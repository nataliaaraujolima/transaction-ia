import { auth } from "@clerk/nextjs/server";
import { endOfMonth, startOfMonth } from "date-fns";
import { db } from "@/app/_lib/prisma";

export const getCurrentMonthTransactions = async () => {
  const { userId } = await auth();
  const currentMonthTransactions = await db.transaction.count({
    where: {
      userId: userId ?? undefined,
      createdAt: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
    },
  });

  return {
    currentMonthTransactions,
  };
};
