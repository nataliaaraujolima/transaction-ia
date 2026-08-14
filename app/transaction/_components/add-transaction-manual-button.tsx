"use client";

import { Repeat } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/_components/ui/button";
import TransactionDialogWrapper from "./transaction-dialog-wrapper";

export default function AddTransactionManualButton() {
  const [isOpen, setIsOpen] = useState(false);

  function handleOPenModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Button onClick={handleOPenModal}>
        Adicionar transação
        <Repeat />
      </Button>
      <TransactionDialogWrapper isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
