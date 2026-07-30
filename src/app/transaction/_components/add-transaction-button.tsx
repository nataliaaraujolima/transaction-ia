"use client";

import { ArrowDownUpIcon } from "lucide-react";

import { Button } from "@/_components/ui/button";

export default function AddTransactionButton() {
  return (
    <Button className="rounded-full font-bold" onClick={() => alert("clicou")}>
      Adicionar transação
      <ArrowDownUpIcon />
    </Button>
  );
}
