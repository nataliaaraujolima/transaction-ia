import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo ao Finance IA
        </h1>
        <p className="text-muted-foreground text-lg">
          Boilerplate e configurações inicializados com sucesso!
        </p>
        <Button>Clique para testar</Button>
      </main>
    </div>
  );
}
