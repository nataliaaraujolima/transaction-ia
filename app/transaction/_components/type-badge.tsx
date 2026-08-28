import type { Transaction } from "@prisma/client";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleIcon } from "lucide-react";
import { cn } from "../../_lib/utils";
import { Badge } from "../../shared/_components/ui/badge";
import { TRANSACTION_TYPE_LABELS } from "../_constants/transactions";

const transactionTypeBadgeVariants = cva("border-transparent font-bold hover:bg-muted", {
  variants: {
    type: {
      DEPOSIT: "bg-muted text-primary dark:text-zinc-300",
      EXPENSE: "bg-red/10 dark:text-zinc-300",
      INVESTMENT: "bg-foreground/10 dark:text-zinc-300",
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
