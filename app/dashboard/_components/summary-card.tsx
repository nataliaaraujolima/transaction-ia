import type { TransactionType } from "@prisma/client";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/app/_lib/utils";
import { formatCurrency } from "@/app/shared/utils";
import { Card, CardContent, CardHeader } from "../../shared/_components/ui/card";

const summaryCardVariants = cva("transition-colors", {
  variants: {
    size: {
      large: "text-primary-foreground",
    },
    type: {
      DEFAULT: "bg-[#0F0E0E]",
      DEPOSIT: "bg-mist-950 text-primary-foreground ring-primary/20 border border-green-300/40",
      EXPENSE: "bg-mist-950  text-red-500-foreground ring-red-500/20 border border-red-300/40",
      INVESTMENT:
        "bg-mist-950 text-green-500-foreground ring-green-500/20 border border-mist-200/40",
    },
  },
  defaultVariants: {
    size: "large",
    type: "DEFAULT",
  },
});

const summaryCardTitleVariants = cva("text-sm font-medium", {
  variants: {
    size: {
      large: "text-primary-foreground/70",
    },
    textColor: {
      DEPOSIT: "text-primary-foreground/85",
      EXPENSE: "text-red-600 dark:text-red-400",
      INVESTMENT: "text-green-600 dark:text-mist-400",
    },
  },
  defaultVariants: {
    size: "large",
  },
});

const summaryCardAmountVariants = cva("truncate font-bold", {
  variants: {
    size: {
      large: "text-2xl md:text-4xl",
    },
    textColor: {
      DEPOSIT: "text-primary-foreground",
      EXPENSE: "text-red-500-foreground",
      INVESTMENT: "text-green-500-foreground",
    },
  },
  defaultVariants: {
    size: "large",
  },
});

interface SummaryCardProps extends Omit<VariantProps<typeof summaryCardVariants>, "type"> {
  icon: ReactNode;
  title: string;
  amount: number;
  className?: string;
  type?: TransactionType;
}

export function SummaryCard({
  icon,
  title,
  amount,
  size = "large",
  className,
  type,
}: SummaryCardProps) {
  return (
    <Card className={cn(summaryCardVariants({ size, type: type as TransactionType }), className)}>
      <CardHeader className="flex flex-row items-center gap-4">
        {icon}
        <p className={summaryCardTitleVariants({ size, textColor: type })}>{title}</p>
      </CardHeader>

      <CardContent>
        <p className={summaryCardAmountVariants({ size, textColor: type })}>
          {formatCurrency(amount)}
        </p>
      </CardContent>
    </Card>
  );
}
