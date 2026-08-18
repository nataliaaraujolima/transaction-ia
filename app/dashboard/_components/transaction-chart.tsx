"use client";

import { TransactionType } from "@prisma/client";
import { PiggyBankIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Pie, PieChart } from "recharts";
import { Card, CardContent } from "../../shared/_components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../shared/_components/ui/chart";
import { chartConfig } from "../_constants/chart-config";
import type { TransactionPercentagePerType } from "../_types/dashboard";
import { PercentageItem } from "./percentage-item";

interface TransactionChartProps {
  typesPercentage: TransactionPercentagePerType;
  depositsTotal: number;
  investmentsTotal: number;
  expensesTotal: number;
}

export function TransactionChart({
  depositsTotal,
  investmentsTotal,
  expensesTotal,
  typesPercentage,
}: TransactionChartProps) {
  const chartData = [
    {
      type: TransactionType.DEPOSIT,
      amount: depositsTotal,
      fill: "var(--color-green)",
    },
    {
      type: TransactionType.EXPENSE,
      amount: expensesTotal,
      fill: "var(--color-red)",
    },
    {
      type: TransactionType.INVESTMENT,
      amount: investmentsTotal,
      fill: "var(--foreground)",
    },
  ];

  return (
    <Card className="flex flex-col p-4 text-primary-foreground bg-[var(--background-black)]">
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie nameKey="type" data={chartData} dataKey="amount" innerRadius={50} />
          </PieChart>
        </ChartContainer>

        <div className="space-y-2">
          <PercentageItem
            title="Receita"
            value={typesPercentage[TransactionType.DEPOSIT]}
            icon={<TrendingUpIcon className="size-4 text-primary" />}
          />

          <PercentageItem
            title="Despesas"
            value={typesPercentage[TransactionType.EXPENSE]}
            icon={<TrendingDownIcon className="size-4 text-red" />}
          />

          <PercentageItem
            title="Investido"
            value={typesPercentage[TransactionType.INVESTMENT]}
            icon={<PiggyBankIcon className="size-4" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
