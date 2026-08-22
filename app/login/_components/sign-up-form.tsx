"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "../../shared/_components/ui/button";
import { FieldError } from "../../shared/_components/ui/field";

export function SignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReady = Boolean(signUp) && fetchStatus !== "fetching";

  async function handleGoogle() {
    if (!signUp || !isReady) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signUp.sso({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/dashboard`,
        redirectCallbackUrl: `${window.location.origin}/sso`,
      });

      if (error) {
        setError(error.message ?? "Não foi possível entrar com o Google.");
        setIsSubmitting(false);
      }
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
        disabled={!isReady || isSubmitting}
      >
        {isSubmitting ? "Redirecionando..." : "Entrar com Google"}
      </Button>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
