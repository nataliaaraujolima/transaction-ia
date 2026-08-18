import { CardContent, CardHeader, CardTitle } from "../../shared/_components/ui/card";
import { Progress } from "../../shared/_components/ui/progress";
import { ScrollArea } from "../../shared/_components/ui/scroll-area";
import { TRANSACTION_CATEGORY_LABELS } from "../../transaction/_constants/transactions";
import type { TotalExpensePerCategory } from "../_types/dashboard";

interface ChartCategoryProps {
  expensesPerCategory: TotalExpensePerCategory[];
}

export function ChartCategory({ expensesPerCategory }: ChartCategoryProps) {
  return (
    <ScrollArea className="col-span-2 h-full rounded-xl ring-1 ring-foreground/10 pb-6 bg-[var(--background-black)] p-4">
      <CardHeader>
        <CardTitle className="font-bold">Gastos por Categoria</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {expensesPerCategory.map((category) => (
          <div key={category.category} className="space-y-2">
            <div className="flex w-full justify-between">
              <p className="text-sm font-bold">{TRANSACTION_CATEGORY_LABELS[category.category]}</p>
              <p className="text-sm font-bold">{category.percentageOfTotal}%</p>
            </div>

            <Progress value={category.percentageOfTotal} />
          </div>
        ))}

        {expensesPerCategory.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum resultado encontrado...</p>
        )}
      </CardContent>
    </ScrollArea>
  );
}
