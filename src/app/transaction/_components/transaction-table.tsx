"use client";

import type { Transaction } from "@prisma/client";
import { DataTable } from "@/_components/ui/data-table";
import { transactionColumns } from "./transaction-columns";

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  return <DataTable columns={transactionColumns} data={transactions} />;
};
