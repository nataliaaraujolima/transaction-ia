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

export const MONTH_OPTIONS = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];
