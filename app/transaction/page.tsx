import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdBannerGate } from "../_ads/_components/ad-banner-gate";
import { db } from "../_lib/prisma";
import NavBar from "../shared/_components/common/nav-bar";
import { SelectTransaction } from "../shared/_components/common/select-transaction";
import { canUserAddTransaction } from "../subscription/_helpers/can-user-add-transaciton";
import AddTransactionBankButton from "./_components/add-transaction-bank-button";
import AddTransactionManualButton from "./_components/add-transaction-manual-button";
import { TransactionTable } from "./_components/transaction-table";
import { createPluggyConnectToken } from "./_lib/create-pluggy-connect-token";

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

  const userCanAddTransaction = await canUserAddTransaction();
  const connectTokenPromise = createPluggyConnectToken();

  return (
    <div className="space-y-4 overflow-hidden p-6">
      <NavBar />
      <h1 className="pt-4 text-2xl font-bold tracking-tight">Transações</h1>
      <AdBannerGate />
      <div className="flex shrink-0 gap-4">
        <AddTransactionManualButton userCanAddTransaction={userCanAddTransaction} />
        <AddTransactionBankButton
          userCanAddTransaction={userCanAddTransaction}
          connectTokenPromise={connectTokenPromise}
        />
        <SelectTransaction />
      </div>
      <TransactionTable transactions={transactions} />
    </div>
  );
};

export default Transaction;
