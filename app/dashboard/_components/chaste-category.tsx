import { formatCurrency } from "@/app/shared/utils";
import { CardContent, CardHeader, CardTitle } from "../../shared/_components/ui/card";
import { Progress } from "../../shared/_components/ui/progress";
import { TRANSACTION_CATEGORY_LABELS } from "../../transaction/_constants/transactions";
import type { TotalExpensePerCategory } from "../_types/dashboard";

const overlayScroll =
  "max-h-[320px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255_/_0.35)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30";

interface ChartCategoryProps {
  expensesPerCategory: TotalExpensePerCategory[];
}

export function ChartCategory({ expensesPerCategory }: ChartCategoryProps) {
  return (
    <div className="col-span-1 flex flex-col rounded-xl bg-(--background-black) p-4 ring-1 ring-foreground/10 lg:col-span-2">
      <CardHeader className="shrink-0">
        <CardTitle className="font-bold">Gastos por Categoria</CardTitle>
      </CardHeader>

      <CardContent className={`space-y-6 pt-4 ${overlayScroll}`}>
        {expensesPerCategory.map((category) => (
          <div key={category.category} className="space-y-2">
            <div className="flex w-full justify-between gap-4">
              <p className="text-sm font-bold">
                {TRANSACTION_CATEGORY_LABELS[category.category] ?? category.category}
              </p>
              <p className="text-sm font-bold">
                {formatCurrency(category.totalAmount)} · {category.percentageOfTotal}%
              </p>
            </div>

            <Progress value={category.percentageOfTotal} />
          </div>
        ))}

        {expensesPerCategory.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma despesa neste mês para mostrar por categoria.
          </p>
        )}
      </CardContent>
    </div>
  );
}
