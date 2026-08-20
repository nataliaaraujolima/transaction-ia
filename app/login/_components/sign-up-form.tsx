"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { useState } from "react";
import { Button } from "../../shared/_components/ui/button";
import { FieldError } from "../../shared/_components/ui/field";

export function SignUpForm() {
  const { isLoaded, signIn } = useSignIn();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogle() {
    if (!isLoaded || !signIn) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      const clerkError = err as { errors?: { message?: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Não foi possível entrar com o Google.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <Button
        type="button"
        className="h-12 w-full rounded-full bg-white text-black hover:bg-white/90"
        onClick={handleGoogle}
        disabled={!isLoaded || isSubmitting}
      >
        {isSubmitting ? "Redirecionando..." : "Entrar com Google"}
      </Button>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
