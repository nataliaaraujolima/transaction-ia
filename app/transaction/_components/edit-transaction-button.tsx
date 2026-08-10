"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/_components/ui/button";
import type { SerializedTransaction } from "./transaction-columns";
import TransactionDialogWrapper from "./transaction-dialog-wrapper";

interface EditTransactionButtonProps {
  transaction: SerializedTransaction;
}

export default function EditTransactionButton({ transaction }: EditTransactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpenModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={handleOpenModal}
      >
        <PencilIcon />
      </Button>
      <TransactionDialogWrapper
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        transactionId={transaction.id}
        defaultValues={{
          name: transaction.name,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          paymentMethod: transaction.paymentMethod,
          date: new Date(transaction.date),
        }}
      />
    </>
  );
}
