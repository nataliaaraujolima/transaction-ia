import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "../_lib/prisma";
import NavBar from "../shared/_components/common/nav-bar";
import AddTransactionBankButton from "./_components/add-transaction-bank-button";
import AddTransactionManualButton from "./_components/add-transaction-manual-button";
import { TransactionTable } from "./_components/transaction-table";

export const Transaction = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
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
    <div className="space-y-4 overflow-hidden p-6">
      <NavBar />
      <h1 className="pt-4 text-2xl font-bold tracking-tight">Transações</h1>
      <div className="flex shrink-0 gap-4">
        <AddTransactionManualButton />
        <AddTransactionBankButton />
      </div>
      <TransactionTable transactions={transactions} />
    </div>
  );
};

export default Transaction;
