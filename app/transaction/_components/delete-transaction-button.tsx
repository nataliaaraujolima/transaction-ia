"use client";

import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../shared/_components/ui/button";
import { deleteTransaction } from "../_actions/delete-transaction";

interface DeleteTransactionButtonProps {
  transactionId: string;
}

export default function DeleteTransactionButton({ transactionId }: DeleteTransactionButtonProps) {
  async function handleDeleteTransaction() {
    try {
      const request = deleteTransaction({ id: transactionId });

      toast.promise(request, {
        loading: "Excluindo transação...",
        success: "Transação excluída!",
        error: "Não foi possível excluir a transação.",
      });

      await request;
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground"
      onClick={handleDeleteTransaction}
    >
      <TrashIcon />
    </Button>
  );
}
