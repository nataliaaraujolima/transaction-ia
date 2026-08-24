import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import NavBar from "../shared/_components/common/nav-bar";
import { AcquirePlanButton } from "./_components/acquire-plan-button";
import { PlanCard } from "./_components/plan-card";
import { canUserAddTransaction } from "./_helpers/can-user-add-transaciton";

export default async function Subscription() {
  const { userId } = await auth();
  const userCanAddTransaction = await canUserAddTransaction();

  if (!userId) {
    return redirect("/");
  }

  return (
    <div className="space-y-4 p-6">
      <NavBar />
      <h1 className="pt-4 text-2xl font-bold tracking-tight">Assinatura</h1>
      <div className="flex flex-col gap-6 md:flex-row">
        <PlanCard userCanAddTransaction={userCanAddTransaction} variant="basic" />
        <AcquirePlanButton />
      </div>
    </div>
  );
}
