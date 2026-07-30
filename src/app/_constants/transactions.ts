export const TRANSACTION_TYPES = ["DEPOSIT", "EXPENSE", "INVESTMENT"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_CATEGORIES = [
  "HOUSING",
  "TRANSPORTATION",
  "FOOD",
  "ENTERTAINMENT",
  "HEALTH",
  "UTILITY",
  "SALARY",
  "EDUCATION",
  "OTHER",
] as const;
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const TRANSACTION_PAYMENT_METHODS = [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "BANK_TRANSFER",
  "BANK_SLIP",
  "CASH",
  "PIX",
  "OTHER",
] as const;
export type TransactionPaymentMethod = (typeof TRANSACTION_PAYMENT_METHODS)[number];

export const TRANSACTION_CATEGORY_LABELS: Record<TransactionCategory, string> = {
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

export const TRANSACTION_PAYMENT_METHOD_LABELS: Record<TransactionPaymentMethod, string> = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  BANK_TRANSFER: "Transferência bancária",
  BANK_SLIP: "Boleto",
  PIX: "Pix",
  OTHER: "Outro",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  DEPOSIT: "Depósito",
  EXPENSE: "Gasto",
  INVESTMENT: "Investimento",
};
