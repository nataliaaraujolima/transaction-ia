import { TransactionType } from "@prisma/client";
import { PiggyBankIcon, TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react";
import { SummaryCard } from "./summary-card";

interface TransactionSummaryProps {
  balance: number;
  depositsTotal: number;
  investmentsTotal: number;
  expensesTotal: number;
}

export function TransactionSummary({
  balance,
  depositsTotal,
  investmentsTotal,
  expensesTotal,
}: TransactionSummaryProps) {
  return (
    <div className="space-y-6">
      <SummaryCard
        size="large"
        title="Saldo"
        amount={balance}
        icon={<WalletIcon className="size-4" />}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <SummaryCard
          type={TransactionType.INVESTMENT}
          title="Investido"
          amount={investmentsTotal}
          icon={<PiggyBankIcon className="size-4" />}
        />
        <SummaryCard
          type={TransactionType.DEPOSIT}
          title="Receita"
          amount={depositsTotal}
          icon={<TrendingUpIcon className="size-4 text-primary" />}
        />
        <SummaryCard
          type={TransactionType.EXPENSE}
          title="Despesas"
          amount={expensesTotal}
          icon={<TrendingDownIcon className="size-4 text-red" />}
        />
      </div>
    </div>
  );
}
