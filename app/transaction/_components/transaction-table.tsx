"use client";

import { DataTable } from "../../shared/_components/ui/data-table";
import { type SerializedTransaction, transactionColumns } from "./transaction-columns";

interface TransactionTableProps {
  transactions: SerializedTransaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  return <DataTable columns={transactionColumns} data={transactions} />;
};
