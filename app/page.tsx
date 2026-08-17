import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./shared/_components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/login");
  }
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <UserButton showName />
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Transaction IA!</h1>
        <p className="text-muted-foreground text-lg">
          Boilerplate e configurações inicializados com sucesso!
        </p>
        <Button asChild>
          <Link href="/transaction"> Ir para a página de transações</Link>
        </Button>
      </main>
    </div>
  );
}
