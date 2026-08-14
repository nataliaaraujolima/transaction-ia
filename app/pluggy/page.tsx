"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { syncPluggyItem } from "../transaction/_actions/sync-pluggy-item";
import { Button } from "../shared/_components/ui/button";

const PluggyConnect = dynamic(
  () => import("react-pluggy-connect").then((mod) => mod.PluggyConnect),
  { ssr: false }
);

type SyncedAccount = {
  id: string;
  name: string;
  type: string;
  subtype: string;
  balance: number;
  currencyCode: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function Pluggy() {
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<SyncedAccount[]>([]);
  const [transactionsSynced, setTransactionsSynced] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setTransactionsSynced(result.transactionsSynced);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao sincronizar");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSuccess = async (data: { item: { id: string } }) => {
    const nextItemId = data.item.id;
    setItemId(nextItemId);
    setIsOpen(false);
    await syncItem(nextItemId);
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Conectar banco</h1>
        <Button onClick={() => setIsOpen(true)} disabled={!connectToken || isSyncing}>
          Conectar Conta Bancária
        </Button>
        {itemId && (
          <Button variant="outline" onClick={() => syncItem(itemId)} disabled={isSyncing}>
            {isSyncing ? "Sincronizando..." : "Atualizar dados"}
          </Button>
        )}
        <Link
          href="/transaction"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
        >
          Ver transações
        </Link>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {isSyncing && (
        <p className="text-sm text-muted-foreground">Sincronizando contas e transações...</p>
      )}
      {itemId && !isSyncing && (
        <p className="text-sm text-muted-foreground">Item conectado: {itemId}</p>
      )}
      {transactionsSynced !== null && !isSyncing && (
        <p className="text-sm text-muted-foreground">
          {transactionsSynced} transações sincronizadas e salvas. Veja em{" "}
          <Link href="/transaction" className="underline">
            Transações
          </Link>
          .
        </p>
      )}

      {accounts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Contas sincronizadas</h2>
          <ul className="space-y-1 text-sm">
            {accounts.map((account) => (
              <li key={account.id}>
                {account.name} ({account.type}/{account.subtype}) —{" "}
                {formatMoney(account.balance)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {isOpen && connectToken && (
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
    </div>
  );
}
