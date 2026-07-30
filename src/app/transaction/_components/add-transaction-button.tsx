"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/_components/ui/button";
import { UpsertTransactionDialog } from "./transaction-dialog";

export default function AddTransactionButton() {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Button className="rounded-full font-bold" onClick={() => setDialogIsOpen(true)}>
        Adicionar transação
        <ArrowDownUpIcon />
      </Button>
      <UpsertTransactionDialog isOpen={dialogIsOpen} setIsOpen={setDialogIsOpen} />
    </>
  );
}
