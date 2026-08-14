export type SyncedPluggyAccountType = "BANK" | "CREDIT";

export type SyncedPluggyAccountSubtype =
  | "SAVINGS_ACCOUNT"
  | "CHECKING_ACCOUNT"
  | "CREDIT_CARD";

export interface SyncedPluggyAccount {
  id: string;
  name: string;
  type: SyncedPluggyAccountType;
  subtype: SyncedPluggyAccountSubtype;
  balance: number;
  currencyCode: string;
}

export interface SyncPluggyItemResult {
  accountsCount: number;
  transactionsSynced: number;
  accounts: SyncedPluggyAccount[];
}
