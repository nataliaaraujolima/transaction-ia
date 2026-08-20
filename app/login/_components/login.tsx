import { Wallet } from "lucide-react";
import { Badge } from "@/app/shared/_components/ui/badge";
import { ProductArt } from "./product-art";
import { SignUpForm } from "./sign-up-form";

export function Login() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 bg-black md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center gap-8 px-8 py-10 md:px-14 md:py-16">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl md:leading-tight">
              Entenda suas transações com Open Finance e IA
            </h1>
            <p className="max-w-md text-base leading-relaxed text-zinc-400">
              Conecte suas contas com segurança, acompanhe cada movimentação e receba análises
              automáticas para organizar gastos, receitas e o fluxo de caixa.
            </p>
          </div>

          <SignUpForm />

          <Badge variant="destructive">
            <Wallet />
            Conexão com Open Finance ainda não disponível!
          </Badge>
        </div>

        <ProductArt />
      </section>
    </div>
  );
}
