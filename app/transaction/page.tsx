import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "../_lib/prisma";
import AddTransactionButton from "./_components/add-transaction-button";
import { TransactionTable } from "./_components/transaction-table";

export const TransactionPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const transactionsData = await db.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const transactions = transactionsData.map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
  }));

  return (
    <div className="space-y-4  overflow-hidden p-6">
      <h1 className="text-2xl font-bold tracking-tight pt-4">Transações</h1>
      <AddTransactionButton />
      <TransactionTable transactions={transactions} />
    </div>
  );
};

export default TransactionPage;
