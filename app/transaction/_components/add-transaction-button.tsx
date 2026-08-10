"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/_components/ui/button";
import TransactionDialogWrapper from "./transaction-dialog-wrapper";

export default function AddTransactionButton() {
  const [isOpen, setIsOpen] = useState(false);

  function handleOPenModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Button className="rounded-full font-bold" onClick={handleOPenModal}>
        Adicionar transação
        <ArrowDownUpIcon />
      </Button>
      <TransactionDialogWrapper isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
