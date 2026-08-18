import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { formatCurrency } from "@/app/shared/utils";
import { Card, CardContent, CardHeader } from "../../shared/_components/ui/card";

const summaryCardVariants = cva("", {
  variants: {
    size: {
      small: "",
      large: "bg-primary text-primary-foreground ring-primary/20",
    },
  },
  defaultVariants: {
    size: "small",
  },
});

const summaryCardTitleVariants = cva("text-sm", {
  variants: {
    size: {
      small: "text-muted-foreground",
      large: "text-primary-foreground/70",
    },
  },
  defaultVariants: {
    size: "small",
  },
});

const summaryCardAmountVariants = cva("truncate font-bold", {
  variants: {
    size: {
      small: "text-2xl",
      large: "text-2xl md:text-4xl",
    },
  },
  defaultVariants: {
    size: "small",
  },
});

interface SummaryCardProps extends VariantProps<typeof summaryCardVariants> {
  icon: ReactNode;
  title: string;
  amount: number;
  className?: string;
}

export function SummaryCard({ icon, title, amount, size = "small", className }: SummaryCardProps) {
  return (
    <Card className={cn(summaryCardVariants({ size }), className)}>
      <CardHeader className="flex flex-row items-center gap-4">
        {icon}
        <p className={summaryCardTitleVariants({ size })}>{title}</p>
      </CardHeader>

      <CardContent>
        <p className={summaryCardAmountVariants({ size })}>{formatCurrency(amount)}</p>
      </CardContent>
    </Card>
  );
}
