import { getCurrentMonthTransactions } from "@/app/transaction/_db/get-current-moth-transactions";
import { ClerkPremiumPlan } from "@/app/transaction/clerk-premium-plan";

export async function canUserAddTransaction() {
  const subscriptionPlan = await ClerkPremiumPlan();
  const { currentMonthTransactions } = await getCurrentMonthTransactions();

  console.log({
    subscriptionPlan,
    currentMonthTransactions,
  });

  // Switch case verificando o tipo de plano do usuário
  switch (subscriptionPlan) {
    case "premium":
      return true; // Premium tem acesso livre ilimitado

    case "basic":
    default:
      // Plano basic possui limite de 10 transações
      if (currentMonthTransactions >= 10) {
        return false; // Atingiu o limite, não pode adicionar
      }
      return true; // Abaixo do limite, pode adicionar
  }
}
