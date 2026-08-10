"use client";

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
        {isOpen && (
          <UpsertTransaction
            defaultValues={defaultValues}
            transactionId={transactionId}
            onSuccess={handleCloseModal}
          />
        )}
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <Button type="submit" form="transaction-form">
            {isUpdate ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TransactionDialogWrapper;
