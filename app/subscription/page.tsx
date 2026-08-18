import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Subscription() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/login");
  }
  return <div>SubscriptionPage</div>;
}
