"use client";

import type { Transaction } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "../../shared/_components/ui/badge";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
  TRANSACTION_SOURCE_LABELS,
} from "../_constants/transactions";
import DeleteTransactionButton from "./delete-transaction-button";
import EditTransactionButton from "./edit-transaction-button";
import { TransactionTypeBadge } from "./type-badge";

export type SerializedTransaction = Omit<Transaction, "amount"> & {
  amount: number;
};

export const transactionColumns: ColumnDef<SerializedTransaction>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row: { original: transaction } }) => <TransactionTypeBadge type={transaction.type} />,
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row: { original: transaction } }) => TRANSACTION_CATEGORY_LABELS[transaction.category],
  },
  {
    accessorKey: "paymentMethod",
    header: "Método de Pagamento",
    cell: ({ row: { original: transaction } }) =>
      TRANSACTION_PAYMENT_METHOD_LABELS[transaction.paymentMethod],
  },
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row: { original: transaction } }) =>
      new Date(transaction.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row: { original: transaction } }) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(transaction.amount),
  },
  {
    accessorKey: "source",
    header: "Origem",
    cell: ({ row: { original: transaction } }) => (
      <Badge variant={transaction.source === "MANUAL" ? "secondary" : "outline"}>
        {TRANSACTION_SOURCE_LABELS[transaction.source]}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: ({ table }) => {
      const hasManualTransactions = table
        .getRowModel()
        .rows.some((row) => row.original.source === "MANUAL");

      return hasManualTransactions ? "Ações" : null;
    },
    cell: ({ row: { original: transaction } }) =>
      transaction.source === "MANUAL" ? (
        <div className="flex items-center gap-1">
          <EditTransactionButton transaction={transaction} />
          <DeleteTransactionButton transactionId={transaction.id} />
        </div>
      ) : null,
  },
];
