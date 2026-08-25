import { BASIC_MONTHLY_TRANSACTION_LIMIT } from "@/app/subscription/_constants/subscription-limits";
import { getCurrentMonthTransactions } from "@/app/transaction/_db/get-current-moth-transactions";
import { ClerkPremiumPlan } from "@/app/transaction/clerk-premium-plan";

export async function canUserAddTransaction() {
  const subscriptionPlan = await ClerkPremiumPlan();
  const { currentMonthTransactions } = await getCurrentMonthTransactions();

  if (subscriptionPlan === "premium") {
    return true;
  }

  const hasReachedMonthlyTransactionLimit =
    currentMonthTransactions >= BASIC_MONTHLY_TRANSACTION_LIMIT;

  return !hasReachedMonthlyTransactionLimit;
}
