"use client";

import { DataTable } from "@/_components/ui/data-table";
import { type TransactionTableRow, transactionColumns } from "../_columns";

interface TransactionTableProps {
  transactions: TransactionTableRow[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return <DataTable columns={transactionColumns} data={transactions} />;
}
