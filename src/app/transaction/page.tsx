import AddTransactionButton from "./_components/add-transaction-button";
import { TransactionTable } from "./_components/transaction-table";

export default function TransactionPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
        <AddTransactionButton />
      </div>
      <TransactionTable />
    </div>
  );
}
