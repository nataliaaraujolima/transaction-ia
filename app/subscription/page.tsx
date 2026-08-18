import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NavBar from "../shared/_components/common/nav-bar";
import { PlanCard } from "./_components/plan-card";

export default async function Subscription() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/login");
  }

  return (
    <div className="space-y-4 p-6">
      <NavBar />
      <h1 className="pt-4 text-2xl font-bold tracking-tight">Assinatura</h1>
      <div className="flex flex-col gap-6 md:flex-row">
        <PlanCard variant="basic" />
        <PlanCard variant="pro" />
      </div>
    </div>
  );
}
