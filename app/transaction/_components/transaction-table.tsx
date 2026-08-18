"use client";

import { ScrollArea } from "@/app/shared/_components/ui/scroll-area";
import { DataTable } from "../../shared/_components/ui/data-table";
import { type SerializedTransaction, transactionColumns } from "./transaction-columns";

interface TransactionTableProps {
  transactions: SerializedTransaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-14rem)]">
      <DataTable columns={transactionColumns} data={transactions} />
    </ScrollArea>
  );
};
