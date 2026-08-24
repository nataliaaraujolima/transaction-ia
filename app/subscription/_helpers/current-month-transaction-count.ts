import { getCurrentMonthTransactions } from "@/app/transaction/_db/get-current-moth-transactions";

export async function currentMonthTransactionCount() {
  const { currentMonthTransactions } = await getCurrentMonthTransactions();
  const currentMonthTransactionLimit = currentMonthTransactions >= 10;

  return {
    currentMonthTransactionLimit,
  };
}
