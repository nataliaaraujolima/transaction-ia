import type { Transaction } from "@prisma/client";

export const TRANSACTION_CATEGORY_LABELS: Record<Transaction["category"], string> = {
  EDUCATION: "Educação",
  ENTERTAINMENT: "Entretenimento",
  FOOD: "Alimentação",
  HEALTH: "Saúde",
  HOUSING: "Moradia",
  OTHER: "Outros",
  SALARY: "Salário",
  TRANSPORTATION: "Transporte",
  UTILITY: "Utilidades",
};

export const TRANSACTION_PAYMENT_METHOD_LABELS: Record<Transaction["paymentMethod"], string> = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  BANK_TRANSFER: "Transferência bancária",
  BANK_SLIP: "Boleto",
  PIX: "Pix",
  OTHER: "Outro",
};

export const TRANSACTION_TYPE_LABELS: Record<Transaction["type"], string> = {
  DEPOSIT: "Depósito",
  EXPENSE: "Gasto",
  INVESTMENT: "Investimento",
};
