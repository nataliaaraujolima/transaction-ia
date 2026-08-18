import type { Transaction, TransactionCategory, TransactionType } from "@prisma/client";

export type TransactionPercentagePerType = {
  [key in TransactionType]: number;
};

export interface TotalExpensePerCategory {
  category: TransactionCategory;
  totalAmount: number;
  percentageOfTotal: number;
}

export type SerializedTransaction = Omit<Transaction, "amount"> & {
  amount: number;
};

export interface DashboardData {
  balance: number;
  depositsTotal: number;
  investmentsTotal: number;
  expensesTotal: number;
  typesPercentage: TransactionPercentagePerType;
  totalExpensePerCategory: TotalExpensePerCategory[];
  lastTransactions: SerializedTransaction[];
}
