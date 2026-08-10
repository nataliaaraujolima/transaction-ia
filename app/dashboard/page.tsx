"use client";
import { Button } from "@base-ui/react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Dashboard = () => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <UserButton showName />
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Transaction IA</h1>
        <p className="text-muted-foreground text-lg">
          Boilerplate e configurações inicializados com sucesso!
        </p>
        <Button>
          <Link href="/transaction">
            <p>Ir para a página de transações</p>
          </Link>
        </Button>
      </main>
    </div>
  );
};

export default Dashboard;
