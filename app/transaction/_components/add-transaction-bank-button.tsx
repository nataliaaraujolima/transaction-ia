"use client";

import { Cable } from "lucide-react";
import { useEffect, useState } from "react";
import { PluggyConnect } from "react-pluggy-connect";
import { cn } from "@/app/_lib/utils";
import { getFeatureFlag } from "@/app/shared/_components/_costants/feature-fleg";
import { Button } from "../../shared/_components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../shared/_components/ui/tooltip";
import { syncPluggyItem } from "../_actions/sync-pluggy-item";
import type { SyncedPluggyAccount } from "../_types/pluggy-sync";

export default function AddTransactionBankButton() {
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState<SyncedPluggyAccount[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("accounts", accounts);

  useEffect(() => {
    fetch("/api/create-pluggy-token", { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao gerar token");
        }
        setConnectToken(data.accessToken);
      })
      .catch((err) => {
        console.error("Erro ao buscar connect token:", err);
        setError("Não foi possível gerar o token de conexão.");
      });
  }, []);

  const syncItem = async (syncedItemId: string) => {
    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncPluggyItem({ itemId: syncedItemId });
      setAccounts(result.accounts);
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

  const isDisabled = !connectToken || isSyncing || Boolean(getFeatureFlag(1)?.enabled);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger delay={200} render={<span className="inline-flex" />}>
            <Button
              onClick={() => setIsOpen(true)}
              disabled={isDisabled}
              className={cn(isDisabled && "text-muted-foreground bg-muted cursor-not-allowed")}
            >
              {isSyncing ? "Conectando a conta bancária..." : "Conectar Conta Bancária"}
              <Cable />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Feature em desenvolvimento, favor aguarde.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {isOpen && connectToken && getFeatureFlag(1)?.enabled && (
        <PluggyConnect
          connectToken={connectToken}
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
