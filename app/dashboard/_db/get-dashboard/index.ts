import { TransactionType } from "@prisma/client";
import { db } from "@/app/_lib/prisma";
import type { DashboardData, TotalExpensePerCategory } from "../../_types/dashboard";

interface IGetDashboardProps {
  userId: string;
  where: {
    date: {
      gte: Date;
      lt: Date;
    };
  };
}

export async function getDashboard({ userId, where }: IGetDashboardProps): Promise<DashboardData> {
  const filters = {
    ...where,
    userId,
  };

  const depositsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...filters, type: TransactionType.DEPOSIT },
        _sum: { amount: true },
      })
    )._sum.amount ?? 0
  );

  const investmentsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...filters, type: TransactionType.INVESTMENT },
        _sum: { amount: true },
      })
    )._sum.amount ?? 0
  );

  const expensesTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...filters, type: TransactionType.EXPENSE },
        _sum: { amount: true },
      })
    )._sum.amount ?? 0
  );

  const balance = depositsTotal - investmentsTotal - expensesTotal;
  const transactionsTotal = depositsTotal + investmentsTotal + expensesTotal;

  const typesPercentage = {
    [TransactionType.DEPOSIT]:
      transactionsTotal > 0 ? Math.round((depositsTotal / transactionsTotal) * 100) : 0,
    [TransactionType.EXPENSE]:
      transactionsTotal > 0 ? Math.round((expensesTotal / transactionsTotal) * 100) : 0,
    [TransactionType.INVESTMENT]:
      transactionsTotal > 0 ? Math.round((investmentsTotal / transactionsTotal) * 100) : 0,
  };

  const totalExpensePerCategory: TotalExpensePerCategory[] = (
    await db.transaction.groupBy({
      by: ["category"],
      where: {
        ...filters,
        type: TransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    })
  ).map((category) => ({
    category: category.category,
    totalAmount: Number(category._sum.amount ?? 0),
    percentageOfTotal:
      expensesTotal > 0 ? Math.round((Number(category._sum.amount ?? 0) / expensesTotal) * 100) : 0,
  }));

  const lastTransactionsData = await db.transaction.findMany({
    where: filters,
    orderBy: { date: "desc" },
    take: 15,
  });

  const lastTransactions = lastTransactionsData.map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
  }));

  return {
    balance,
    depositsTotal,
    investmentsTotal,
    expensesTotal,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions,
  };
}
