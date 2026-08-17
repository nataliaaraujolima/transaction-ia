import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Subscription() {
  const { userId } = useAuth();

  if (!userId) {
    return redirect("/login");
  }
  return <div>SubscriptionPage</div>;
}
