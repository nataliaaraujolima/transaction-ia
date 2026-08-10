import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "./dashboard/page";

export default async function Home() {
  const { userId } = await auth();
  console.log("userId", userId);
  if (!userId) {
    return redirect("/login");
  }
  return <Dashboard />;
}
