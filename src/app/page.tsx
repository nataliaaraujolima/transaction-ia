import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/login");
  }
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <UserButton showName />
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Finance IA</h1>
        <p className="text-muted-foreground text-lg">
          Boilerplate e configurações inicializados com sucesso!
        </p>
      </main>
    </div>
  );
}
