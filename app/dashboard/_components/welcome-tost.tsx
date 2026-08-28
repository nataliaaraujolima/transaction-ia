"use client";

import { useUser } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { markWelcomeSeen } from "../_actions/mark-welcome";

const FIVE_MINUTES_MS = 30 * 60 * 1000;

export function WelcomeToast() {
  const { user, isLoaded } = useUser();
  const alreadyShown = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || alreadyShown.current) return;
    if (user.publicMetadata.hasSeenWelcome) return;
    if (!user.createdAt) return;

    const isNewUser = Date.now() - user.createdAt.getTime() < FIVE_MINUTES_MS;
    if (!isNewUser) return;

    alreadyShown.current = true;

    const timeoutId = window.setTimeout(() => {
      const name = user.firstName ?? "bem-vindo(a)";

      toast.custom(
        () => (
          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 [animation:welcome-card_1.2s_0.2s_cubic-bezier(0.22,1,0.36,1)_both,welcome-glow_1.6s_0.2s_ease-out_both]">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-green/15 text-green [animation:welcome-icon_0.7s_0.55s_cubic-bezier(0.22,1,0.36,1)_both]">
              <Sparkles className="size-4" />
            </span>
            <div className="space-y-0.5 [animation:welcome-text_0.7s_0.7s_cubic-bezier(0.22,1,0.36,1)_both]">
              <p className="text-sm font-medium text-white">Olá, {name}!</p>
              <p className="text-xs leading-relaxed text-zinc-400">
                Bem-vindo(a) à plataforma. Que bom ter você aqui.
              </p>
            </div>
          </div>
        ),
        { duration: 9000 }
      );

      void markWelcomeSeen();
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [isLoaded, user]);

  return null;
}
