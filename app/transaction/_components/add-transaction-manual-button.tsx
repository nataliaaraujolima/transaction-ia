"use client";

import { Repeat } from "lucide-react";
import { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/shared/_components/ui/tooltip";

import { Button } from "../../shared/_components/ui/button";
import TransactionDialogWrapper from "./transaction-dialog-wrapper";

interface AddTransactionManualButtonProps {
  userCanAddTransaction?: boolean;
}

export default function AddTransactionManualButton({
  userCanAddTransaction,
}: AddTransactionManualButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpenModal() {
    setIsOpen(true);
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="inline-flex">
                <Button onClick={handleOpenModal} disabled={userCanAddTransaction === false}>
                  Adicionar transação
                  <Repeat />
                </Button>
              </span>
            }
          />

          {userCanAddTransaction === false && (
            <TooltipContent side="top">
              Você atingiu o limite de transações para o mês, atualize seu plano para continuar.
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <TransactionDialogWrapper isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
