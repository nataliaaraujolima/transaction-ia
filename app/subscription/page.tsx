import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import NavBar from "../shared/_components/common/nav-bar";
import { getCurrentMonthTransactions } from "../transaction/_db/get-current-moth-transactions";
import { ClerkPremiumPlan } from "../transaction/clerk-premium-plan";
import { AcquirePlanButton } from "./_components/acquire-plan-button";
import { PlanCard } from "./_components/plan-card";

export default async function Subscription() {
  const { userId } = await auth();
  const { currentMonthTransactions } = await getCurrentMonthTransactions();
  const hasPremiumPlan = (await ClerkPremiumPlan()) === "premium";

  if (!userId) {
    return redirect("/");
  }

  return (
    <div className="space-y-4 p-6">
      <NavBar />
      <h1 className="pt-4 text-2xl font-bold tracking-tight">Assinatura</h1>
      <div className="flex flex-col gap-6 md:flex-row">
        <PlanCard
          currentMonthTransactions={currentMonthTransactions}
          hasPremiumPlan={hasPremiumPlan}
          variant="basic"
        />
        <AcquirePlanButton hasPremiumPlan={hasPremiumPlan} />
      </div>
    </div>
  );
}
