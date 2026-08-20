import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Login } from "./login/_components/login";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return <Login />;
}
