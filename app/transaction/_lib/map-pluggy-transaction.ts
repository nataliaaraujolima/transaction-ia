import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionSource,
  TransactionType,
} from "@prisma/client";

type PluggyTxInput = {
  id: string;
  accountId: string;
  itemId: string;
  description: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  date: Date | string;
};

export type MappedBankTransaction = {
  name: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  paymentMethod: TransactionPaymentMethod;
  date: Date;
  source: typeof TransactionSource.BANK;
  pluggyTransactionId: string;
  pluggyAccountId: string;
  pluggyItemId: string;
};

export function mapPluggyTransaction(tx: PluggyTxInput): MappedBankTransaction {
  return {
    name: tx.description?.trim() || "Transação bancária",
    type: tx.type === "CREDIT" ? TransactionType.DEPOSIT : TransactionType.EXPENSE,
    amount: Math.abs(tx.amount),
    category: TransactionCategory.OTHER,
    paymentMethod: TransactionPaymentMethod.OTHER,
    date: new Date(tx.date),
    source: TransactionSource.BANK,
    pluggyTransactionId: tx.id,
    pluggyAccountId: tx.accountId,
    pluggyItemId: tx.itemId,
  };
}
