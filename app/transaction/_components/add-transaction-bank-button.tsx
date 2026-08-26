"use client";

import { Cable, Loader2 } from "lucide-react";
import { Suspense, use, useState } from "react";
import { PluggyConnect } from "react-pluggy-connect";
import { cn } from "@/app/_lib/utils";
import { Button } from "../../shared/_components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../shared/_components/ui/tooltip";
import { syncPluggyItem } from "../_actions/sync-pluggy-item";
import type { PluggyConnectTokenResult } from "../_types/pluggy-sync";

interface AddTransactionBankButtonProps {
  userCanAddTransaction: boolean;
  connectTokenPromise: Promise<PluggyConnectTokenResult>;
}

export default function AddTransactionBankButton({
  userCanAddTransaction,
  connectTokenPromise,
}: AddTransactionBankButtonProps) {
  return (
    <Suspense fallback={<ConnectBankAccountButton isMuted isDisabled isSyncing={false} />}>
      <BankAccountConnection
        userCanAddTransaction={userCanAddTransaction}
        connectTokenPromise={connectTokenPromise}
      />
    </Suspense>
  );
}

function BankAccountConnection({
  userCanAddTransaction,
  connectTokenPromise,
}: AddTransactionBankButtonProps) {
  const { accessToken, errorMessage } = use(connectTokenPromise);
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncItem = async (syncedItemId: string) => {
    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncPluggyItem({ itemId: syncedItemId });
      return result.accounts;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao sincronizar");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSuccess = async (data: { item: { id: string } }) => {
    const nextItemId = data.item.id;
    setIsOpen(false);
    await syncItem(nextItemId);
  };

  if (!accessToken) {
    return (
      <>
        <ConnectBankAccountButton isMuted isDisabled isSyncing={false} />
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </>
    );
  }
  const isDisabled = isSyncing || !userCanAddTransaction;
  return (
    <>
      <ConnectBankAccountButton
        isMuted={isDisabled}
        isDisabled={isDisabled}
        isSyncing={isSyncing}
        tooltipMessage="A integração bancária está temporariamente restrita à conta de testes principal."
        onConnectBankAccount={() => setIsOpen(true)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {isOpen && (
        <PluggyConnect
          connectToken={accessToken}
          onSuccess={handleSuccess}
          onError={(err) => {
            console.error(err);
            setError("Erro no widget Pluggy Connect.");
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

function ConnectBankAccountButton({
  isMuted,
  isDisabled,
  isSyncing,
  tooltipMessage,
  onConnectBankAccount,
}: {
  isMuted: boolean;
  isDisabled: boolean;
  isSyncing: boolean;
  tooltipMessage?: string;
  onConnectBankAccount?: () => void;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          delay={200}
          render={
            <span className="inline-flex">
              <Button
                disabled={isDisabled}
                onClick={onConnectBankAccount}
                className={cn(isMuted && "text-muted-foreground bg-muted cursor-not-allowed")}
              >
                {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSyncing ? "Conectando a conta bancária" : "Conectar conta Bancária"}

                <Cable />
              </Button>
            </span>
          }
        />

        {tooltipMessage && <TooltipContent side="right">{tooltipMessage}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}
