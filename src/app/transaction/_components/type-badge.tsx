import type { Transaction } from "@prisma/client";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleIcon } from "lucide-react";
import { Badge } from "@/_components/ui/badge";
import { cn } from "@/app/_lib/utils";
import { TRANSACTION_TYPE_LABELS } from "@/app/transaction/_constants/transactions";

const transactionTypeBadgeVariants = cva("border-transparent font-bold hover:bg-muted", {
  variants: {
    type: {
      DEPOSIT: "bg-muted text-primary",
      EXPENSE: "bg-red/10 text-red",
      INVESTMENT: "bg-foreground/10 text-foreground",
    },
  },
  defaultVariants: {
    type: "DEPOSIT",
  },
});

const transactionTypeDotVariants = cva("size-2.5", {
  variants: {
    type: {
      DEPOSIT: "fill-primary text-primary",
      EXPENSE: "fill-red text-red",
      INVESTMENT: "fill-foreground text-foreground",
    },
  },
  defaultVariants: {
    type: "DEPOSIT",
  },
});

interface TransactionTypeBadgeProps extends VariantProps<typeof transactionTypeBadgeVariants> {
  type: Transaction["type"];
  className?: string;
}

export function TransactionTypeBadge({ type, className }: TransactionTypeBadgeProps) {
  if (!type) return null;

  return (
    <Badge className={cn(transactionTypeBadgeVariants({ type }), className)}>
      <CircleIcon className={cn(transactionTypeDotVariants({ type }))} />
      {TRANSACTION_TYPE_LABELS[type]}
    </Badge>
  );
}
