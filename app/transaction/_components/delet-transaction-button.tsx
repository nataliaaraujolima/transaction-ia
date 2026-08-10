import { TrashIcon } from "lucide-react";
import { Button } from "../../shared/_components/ui/button";
import { deleteTransaction } from "../_actions/delete-transaction";

interface DeleteTransactionButtonProps {
  transactionId: string;
}
export default function DeleteTransactionButton({ transactionId }: DeleteTransactionButtonProps) {
  async function handleDeleteTransaction() {
    try {
      await deleteTransaction({ id: transactionId });
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
