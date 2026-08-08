"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/_components/ui/button";
import TransactionForm from "./transaction-form";

export default function AddTransactionButton() {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Button className="rounded-full font-bold" onClick={() => setDialogIsOpen(true)}>
        Adicionar transação
        <ArrowDownUpIcon />
      </Button>
      <TransactionForm isOpen={dialogIsOpen} setIsOpen={setDialogIsOpen} />
    </>
  );
}
