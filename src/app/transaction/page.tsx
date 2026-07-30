import { db } from "../_lib/prisma";
import AddTransactionButton from "./_components/add-transaction-button";
import { TransactionTable } from "./_components/transaction-table";

export const TransactionPage = async () => {
  const transactionsData = await db.transaction.findMany({});
  return (
    <div className="space-y-6 overflow-hidden p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
        <AddTransactionButton />
      </div>
      <TransactionTable transactions={transactionsData} />
    </div>
  );
};

export default TransactionPage;
