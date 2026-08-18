import { TransactionType } from "@prisma/client";
import { db } from "../../../_lib/prisma";
import type { DashboardData, TotalExpensePerCategory } from "../../_types/dashboard";

function getMonthDateRange(month: string) {
  const currentYear = new Date().getFullYear();
  const monthIndex = Number(month) - 1;

  return {
    gte: new Date(currentYear, monthIndex, 1),
    lt: new Date(currentYear, monthIndex + 1, 1),
  };
}

export async function getDashboard(userId: string, month: string): Promise<DashboardData> {
  const where = {
    userId,
    date: getMonthDateRange(month),
  };

  const depositsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: TransactionType.DEPOSIT },
        _sum: { amount: true },
      })
    )._sum.amount ?? 0
  );

  const investmentsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: TransactionType.INVESTMENT },
        _sum: { amount: true },
      })
    )._sum.amount ?? 0
  );

  const expensesTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: TransactionType.EXPENSE },
        _sum: { amount: true },
      })
    )._sum.amount ?? 0
  );

  const balance = depositsTotal - expensesTotal - investmentsTotal;

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
        ...where,
        type: TransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
    })
  ).map((category) => ({
    category: category.category,
    totalAmount: Number(category._sum.amount ?? 0),
    percentageOfTotal:
      expensesTotal > 0 ? Math.round((Number(category._sum.amount ?? 0) / expensesTotal) * 100) : 0,
  }));

  const lastTransactionsData = await db.transaction.findMany({
    where,
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
