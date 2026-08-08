import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "../shared/_components/ui/button";

const LoginPage = async () => {
  const { userId } = await auth();

  if (userId) {
    return redirect("/");
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <Image
          src="/transaction_ia_logo.webp"
          alt="Transaction IA"
          width={100}
          height={100}
          priority
        />

        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Transaction IA</h1>
        <div className="text-center max-w-4xl">
          <p className="text-muted-foreground text-lg">
            Com a Trasaction IA, você não precisa mais se preocupar em planilhas complicadas. Nossa
            plataforma com inteligência artificial monitora suas finanças e te oferece insights
            personalizados para você economizar mais e realizar seus sonhos.
            <br /> Focada em soluções e facilidade de uso, ideal para usuários que buscam
            praticidade.
          </p>
        </div>
        <SignInButton>
          <Button>Conhecer a plataforma</Button>
        </SignInButton>
      </main>
    </div>
  );
};

export default LoginPage;
