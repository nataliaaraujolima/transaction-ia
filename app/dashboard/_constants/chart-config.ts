import { TransactionType } from "@prisma/client";
import type { ChartConfig } from "../../shared/_components/ui/chart";

export const chartConfig = {
  [TransactionType.INVESTMENT]: {
    label: "Investido",
    color: "var(--foreground)",
  },
  [TransactionType.DEPOSIT]: {
    label: "Receita",
    color: "var(--color-green)",
  },
  [TransactionType.EXPENSE]: {
    label: "Despesas",
    color: "var(--color-red)",
  },
} satisfies ChartConfig;
