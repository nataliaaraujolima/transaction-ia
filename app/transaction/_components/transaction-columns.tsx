"use client";

import type { Transaction } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";

import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
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
    id: "actions",
    header: "Ações",
    cell: ({ row: { original: transaction } }) => (
      <div className="flex items-center gap-1">
        <EditTransactionButton transaction={transaction} />
        <DeleteTransactionButton transactionId={transaction.id} />
      </div>
    ),
  },
];
