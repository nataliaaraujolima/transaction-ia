"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Dashboard = () => {
  const { userId } = useAuth();
  if (!userId) {
    return redirect("/login");
  }
  return <h1>dashboard</h1>;
};

export default Dashboard;
