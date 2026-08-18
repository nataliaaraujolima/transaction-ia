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
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];
