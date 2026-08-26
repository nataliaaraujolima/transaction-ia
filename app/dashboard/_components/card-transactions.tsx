import { TransactionType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/app/shared/utils";
import { Button } from "../../shared/_components/ui/button";
import { CardContent, CardHeader, CardTitle } from "../../shared/_components/ui/card";
import { TRANSACTION_PAYMENT_METHOD_ICONS } from "../../transaction/_constants/transactions";
import type { SerializedTransaction } from "../_types/dashboard";

const overlayScroll =
  "max-h-80 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255_/_0.35)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30";

interface CardTransactionsProps {
  lastTransactions: SerializedTransaction[];
}

function getAmountColor(transaction: SerializedTransaction) {
  if (transaction.type === TransactionType.EXPENSE) return "text-red";
  if (transaction.type === TransactionType.DEPOSIT) return "text-primary";
  return "text-foreground";
}

function getAmountPrefix(transaction: SerializedTransaction) {
  if (transaction.type === TransactionType.DEPOSIT) return "+";
  return "-";
}

function formatTransactionDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CardTransactions({ lastTransactions }: CardTransactionsProps) {
  return (
    <div className="flex flex-col rounded-xl bg-(--background-black) p-4 ring-1 ring-foreground/10">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold lg:text-2xl">Últimas Transações</CardTitle>

        {lastTransactions.length > 0 && (
          <Link href="/transaction">
            <Button variant="outline" className="rounded-full font-bold">
              Ver mais
            </Button>
          </Link>
        )}
      </CardHeader>

      <CardContent className={`space-y-6 pt-4 ${overlayScroll}`}>
        {lastTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-foreground/5 p-3">
                <Image
                  alt={transaction.paymentMethod}
                  width={20}
                  height={20}
                  src={`/${TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod]}`}
                />
              </div>
              <div>
                <p className="text-sm font-bold">{transaction.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTransactionDate(transaction.date)}
                </p>
              </div>
            </div>

            <p className={`text-sm font-bold ${getAmountColor(transaction)}`}>
              {getAmountPrefix(transaction)}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        ))}

        {lastTransactions.length === 0 && (
          <p className="text-sm text-muted-foreground">Faça sua primeira transação.</p>
        )}
      </CardContent>
    </div>
  );
}
