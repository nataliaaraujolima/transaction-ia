"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/_components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/_components/ui/dialog";
import UpsertTransaction, { type FormSchema } from "./upsert-transaction";

interface TransactionDialogWrapperProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<FormSchema>;
  transactionId?: string;
}

export function TransactionDialogWrapper({
  isOpen,
  onOpenChange,
  defaultValues,
  transactionId,
}: TransactionDialogWrapperProps) {
  const isUpdate = Boolean(transactionId);
  const [isLoading, setIsLoading] = useState(false);

  function handleCloseModal() {
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isUpdate ? "Atualizar" : "Criar"} transação</DialogTitle>
          <DialogDescription>Insira as informações abaixo</DialogDescription>
        </DialogHeader>
        <UpsertTransaction
          isOpen={isOpen}
          onLoadingChange={setIsLoading}
          defaultValues={defaultValues}
          transactionId={transactionId}
          onSuccess={handleCloseModal}
        />
        <DialogFooter>
          <DialogClose render={<Button disabled={isLoading} type="button" variant="outline" />}>
            Cancelar
          </DialogClose>
          <Button type="submit" form="transaction-form">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdate ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TransactionDialogWrapper;
