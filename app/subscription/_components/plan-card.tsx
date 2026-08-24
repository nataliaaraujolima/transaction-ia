"use client";
import { useUser } from "@clerk/nextjs";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/app/_lib/utils";
import { Badge } from "../../shared/_components/ui/badge";
import { Button } from "../../shared/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/_components/ui/card";
import { createStripePortalSession } from "../_actions/create-stripe-portal-session";

const BASIC_MONTHLY_TRANSACTION_LIMIT = 10;

const planCardVariants = cva("w-full max-w-[450px] gap-0 py-0 bg-(--background-black)", {
  variants: {
    variant: {
      basic: "",
      pro: "ring-primary/25",
    },
  },
  defaultVariants: {
    variant: "basic",
  },
});

type PlanVariant = NonNullable<VariantProps<typeof planCardVariants>["variant"]>;

type PlanFeature = {
  label: string;
  included: boolean;
  hint?: string;
};

type PlanConfig = {
  name: string;
  price: number;
  badge?: string;
  cta: string;
  ctaButtonVariant: "default" | "outline";
  features: PlanFeature[];
};

const PLAN_CONFIG = {
  basic: {
    name: "Plano Básico",
    price: 0,
    badge: undefined,
    cta: "Fazer upgrade",
    ctaButtonVariant: "outline",
    features: [
      { label: `Apenas ${BASIC_MONTHLY_TRANSACTION_LIMIT} transações por mês`, included: true },
      { label: "Relatórios de IA", included: false },
    ],
  },
  pro: {
    name: "Plano Profissional",
    price: 21,
    badge: "Recomendado",
    cta: "Adquirir plano",
    ctaButtonVariant: "default",
    features: [
      { label: "Transações ilimitadas", included: true },
      { label: "Relatórios de IA", included: true },
      { label: "Integração com open finance", included: true },
    ],
  },
} satisfies Record<PlanVariant, PlanConfig>;

function getPlanFeatures(
  variant: PlanVariant,
  currentMonthTransactionLimit?: boolean
): PlanFeature[] {
  const features = PLAN_CONFIG[variant].features;

  if (variant !== "basic" || currentMonthTransactionLimit == null) {
    return features;
  }

  return features.map((feature, index) =>
    index === 0
      ? {
          ...feature,
          hint: `${currentMonthTransactionLimit}/${BASIC_MONTHLY_TRANSACTION_LIMIT}`,
        }
      : feature
  );
}

const CTA_CLASS_NAME = "w-full rounded-full font-bold";

interface PlanCardCtaProps {
  hasPremiumPlan: boolean;
  plan: PlanConfig;
  onClick?: () => void | Promise<void>;
}

function PlanButtonCta({ hasPremiumPlan, plan, onClick }: PlanCardCtaProps) {
  async function handleManageSubscriptionClick() {
    const portal = await createStripePortalSession();

    if (!("url" in portal) || !portal.url) {
      throw new Error(portal.error ?? "Stripe portal URL is not set");
    }

    window.location.assign(portal.url);
  }

  if (hasPremiumPlan) {
    return (
      <Button className={CTA_CLASS_NAME} onClick={handleManageSubscriptionClick} variant="link">
        Gerenciar assinatura
      </Button>
    );
  }

  return (
    <Button className={CTA_CLASS_NAME} onClick={onClick} variant={plan.ctaButtonVariant}>
      {plan.cta}
    </Button>
  );
}

interface PlanCardProps extends VariantProps<typeof planCardVariants> {
  variant: PlanVariant;
  className?: string;
  onClick?: () => void | Promise<void>;
  currentMonthTransactionLimit?: boolean;
}

export function PlanCard({
  variant,
  className,
  onClick,
  currentMonthTransactionLimit,
}: PlanCardProps) {
  const { user } = useUser();
  const plan = PLAN_CONFIG[variant];
  const features = getPlanFeatures(variant, currentMonthTransactionLimit);
  const hasPremiumPlan = user?.publicMetadata?.subscriptionPlan === "premium";
  const badge = hasPremiumPlan && variant === "pro" ? "Plano ativo" : plan.badge;

  return (
    <Card className={cn(planCardVariants({ variant }), className)}>
      <CardHeader className="relative border-b border-solid py-8">
        {badge && (
          <Badge className="absolute top-4 right-4 bg-primary/10 text-primary">{badge}</Badge>
        )}

        <CardTitle className="text-center text-2xl font-semibold">{plan.name}</CardTitle>

        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">R$</span>
          <span className="text-6xl font-semibold">{plan.price}</span>
          <span className="text-2xl text-muted-foreground">/mês</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 py-8">
        {features.map((feature) => (
          <div key={feature.label} className="flex items-start gap-2">
            {feature.included ? (
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            ) : (
              <XIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            )}
            <div>
              <p>{feature.label}</p>
              {feature.hint && <p className="text-sm text-muted-foreground">{feature.hint}</p>}
            </div>
          </div>
        ))}

        <PlanButtonCta
          hasPremiumPlan={hasPremiumPlan && variant === "pro"}
          onClick={onClick}
          plan={plan}
        />
      </CardContent>
    </Card>
  );
}
