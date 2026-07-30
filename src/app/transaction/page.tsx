import type { TransactionTableRow } from "./_columns";
import AddTransactionButton from "./_components/add-transaction-button";
import { TransactionTable } from "./_components/transaction-table";

const MOCK_TRANSACTIONS: TransactionTableRow[] = [
  {
    id: "1",
    name: "Aluguel",
    type: "EXPENSE",
    category: "HOUSING",
    paymentMethod: "BANK_TRANSFER",
    date: "2024-11-03",
    amount: 1500,
  },
  {
    id: "2",
    name: "Salário",
    type: "DEPOSIT",
    category: "SALARY",
    paymentMethod: "BANK_TRANSFER",
    date: "2024-11-03",
    amount: 1500,
  },
  {
    id: "3",
    name: "FII's",
    type: "INVESTMENT",
    category: "OTHER",
    paymentMethod: "BANK_TRANSFER",
    date: "2024-11-03",
    amount: 1500,
  },
];

export default function TransactionPage() {
  return (
    <div className="space-y-6 overflow-hidden p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
        <AddTransactionButton />
      </div>
      <TransactionTable transactions={MOCK_TRANSACTIONS} />
    </div>
  );
}
