"use client";

import { XIcon } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { dismissAd } from "@/app/_ads/_actions/dismiss-ad";
import { GPT_SCRIPT_URL } from "@/app/_ads/_constants/ads-config";
import type { AdConfig } from "@/app/_ads/_use-cases/resolve-ad-eligibility";
import { cn } from "@/app/_lib/utils";
import { Button, buttonVariants } from "@/app/shared/_components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/shared/_components/ui/card";

type AdBannerProps = {
  adConfig: AdConfig;
};

function getOrCreateSessionId(): string {
  const key = "ads_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(key, id);
  return id;
}

function impressionLockKey(slotId: string): string {
  return `ads_impression_sent:${slotId}`;
}

async function postImpressionWithRetry(
  payload: {
    slotId: string;
    sessionId: string;
    campaignKv: AdConfig["campaignKv"];
  },
  attempt = 0
): Promise<void> {
  try {
    const response = await fetch("/api/ads/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "same-origin",
    });

    if (!response.ok && response.status >= 500 && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
      return postImpressionWithRetry(payload, attempt + 1);
    }
  } catch {
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
      return postImpressionWithRetry(payload, attempt + 1);
    }
  }
}

export function AdBanner({ adConfig }: AdBannerProps) {
  const slotDomId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const impressionSentRef = useRef(false);
  const inViewportRef = useRef(false);
  const slotDefinedRef = useRef(false);

  const [isDismissed, setIsDismissed] = useState(false);
  const [shouldLoadGpt, setShouldLoadGpt] = useState(false);
  const [isGptLoaded, setIsGptLoaded] = useState(false);
  const [isSlotReady, setIsSlotReady] = useState(!adConfig.adUnitPath?.trim());

  const hasGamUnit = Boolean(adConfig.adUnitPath?.trim());

  const recordVisibleImpression = useCallback(() => {
    if (impressionSentRef.current) return;

    const lock = impressionLockKey(adConfig.slotId);
    if (sessionStorage.getItem(lock) === "1") {
      impressionSentRef.current = true;
      return;
    }

    impressionSentRef.current = true;
    sessionStorage.setItem(lock, "1");

    void postImpressionWithRetry({
      slotId: adConfig.slotId,
      sessionId: getOrCreateSessionId(),
      campaignKv: adConfig.campaignKv,
    });
  }, [adConfig.campaignKv, adConfig.slotId]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.5) return;

        inViewportRef.current = true;

        if (hasGamUnit) {
          setShouldLoadGpt(true);
          return;
        }

        setIsSlotReady(true);
        recordVisibleImpression();
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasGamUnit, recordVisibleImpression]);

  useEffect(() => {
    if (!shouldLoadGpt || !hasGamUnit || !isGptLoaded || slotDefinedRef.current) return;

    const googletag = window.googletag;
    if (!googletag) return;

    slotDefinedRef.current = true;
    googletag.cmd = googletag.cmd ?? [];
    googletag.cmd.push(() => {
      const sizes = [adConfig.sizes.mobile, adConfig.sizes.desktop];
      const slot = googletag
        .defineSlot(adConfig.adUnitPath, sizes, `gpt-slot-${slotDomId}`)
        ?.addService(googletag.pubads());

      if (!slot) return;

      googletag.pubads().enableSingleRequest();
      googletag.enableServices();

      googletag.pubads().addEventListener("slotRenderEnded", (event) => {
        if (event.slot === slot) {
          setIsSlotReady(true);
        }
      });

      googletag.pubads().addEventListener("impressionViewable", (event) => {
        if (event.slot === slot && inViewportRef.current) {
          recordVisibleImpression();
        }
      });

      googletag.display(`gpt-slot-${slotDomId}`);
    });
  }, [
    adConfig.adUnitPath,
    adConfig.sizes.desktop,
    adConfig.sizes.mobile,
    hasGamUnit,
    isGptLoaded,
    recordVisibleImpression,
    shouldLoadGpt,
    slotDomId,
  ]);

  const handleDismiss = async () => {
    setIsDismissed(true);
    try {
      await dismissAd({});
    } catch {
      // UI já some; dismiss no server é best-effort
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div ref={rootRef} className="w-full max-w-md">
      {shouldLoadGpt && hasGamUnit ? (
        <Script
          src={GPT_SCRIPT_URL}
          strategy="lazyOnload"
          onLoad={() => setIsGptLoaded(true)}
        />
      ) : null}

      <Card size="sm" className="border border-border bg-card">
        <CardHeader className="border-b border-border/60">
          <CardTitle>Você está perto do limite do plano</CardTitle>
          <CardDescription>
            Faça upgrade para continuar registrando transações sem interrupção.
          </CardDescription>
          <CardAction>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Fechar anúncio"
              onClick={handleDismiss}
            >
              <XIcon />
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-3 pt-(--card-spacing)">
          {hasGamUnit ? (
            <div
              id={`gpt-slot-${slotDomId}`}
              className="mx-auto flex min-h-[50px] w-full max-w-[320px] items-center justify-center md:min-h-[250px] md:max-w-[300px]"
              aria-hidden={!isSlotReady}
            >
              {!isSlotReady ? (
                <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
              ) : null}
            </div>
          ) : null}

          {!isSlotReady && !hasGamUnit ? (
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          ) : null}
        </CardContent>

        <CardFooter className="justify-start gap-2">
          <Link
            href="/subscription"
            className={cn(buttonVariants({ variant: "default" }))}
            aria-label="Fazer upgrade do plano"
          >
            Fazer upgrade — desbloqueie transações ilimitadas
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

declare global {
  interface Window {
    googletag?: {
      cmd: Array<() => void>;
      defineSlot: (
        adUnitPath: string,
        sizes: ReadonlyArray<readonly [number, number]>,
        elementId: string
      ) => { addService: (service: unknown) => unknown } | null;
      pubads: () => {
        enableSingleRequest: () => void;
        addEventListener: (event: string, handler: (event: { slot: unknown }) => void) => void;
      };
      enableServices: () => void;
      display: (elementId: string) => void;
    };
  }
}
