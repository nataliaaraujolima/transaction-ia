import { getCurrentMonthTransactions } from "@/app/transaction/_db/get-current-moth-transactions";
import { ClerkPremiumPlan } from "@/app/transaction/clerk-premium-plan";

export async function canUserAddTransaction() {
  const userIsPremium = await ClerkPremiumPlan();
  const { currentMonthTransactions } = await getCurrentMonthTransactions();
  if (userIsPremium) {
    return true;
  }

  if (currentMonthTransactions >= 10) {
    return false;
  }

  return true;
}
