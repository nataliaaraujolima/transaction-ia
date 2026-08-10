import { db } from "../_lib/prisma";
import AddTransactionButton from "./_components/add-transaction-button";
import { TransactionTable } from "./_components/transaction-table";

export const TransactionPage = async () => {
  const transactionsData = await db.transaction.findMany({});
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
