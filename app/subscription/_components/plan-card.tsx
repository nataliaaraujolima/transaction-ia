"use client";
import { useUser } from "@clerk/nextjs";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/app/_lib/utils";
import { Badge } from "../../shared/_components/ui/badge";
import { Button } from "../../shared/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/_components/ui/card";

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

type PlanConfig = {
  name: string;
  price: number;
  badge?: string;
  cta: string;
  ctaButtonVariant: "default" | "outline";
  features: { label: string; included: boolean }[];
};

const PLAN_CONFIG = {
  basic: {
    name: "Plano Básico",
    price: 0,
    badge: undefined,
    cta: "Fazer upgrade",
    ctaButtonVariant: "outline",
    features: [
      { label: "Apenas 10 transações por mês", included: true },
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

const CTA_CLASS_NAME = "w-full rounded-full font-bold";
const STRIPE_CUSTOMER_PORTAL_URL = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL ?? "";

interface PlanCardCtaProps {
  hasPremiumPlan: boolean;
  plan: PlanConfig;
  email?: string;
  onClick?: () => void | Promise<void>;
}

function PlanButtonCta({ hasPremiumPlan, plan, email, onClick }: PlanCardCtaProps) {
  if (hasPremiumPlan) {
    const portalHref = email
      ? `${STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=${encodeURIComponent(email)}`
      : STRIPE_CUSTOMER_PORTAL_URL;

    return (
      <Button className={CTA_CLASS_NAME} variant="link" render={<Link href={portalHref} />}>
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
}

export function PlanCard({ variant, className, onClick }: PlanCardProps) {
  const { user } = useUser();
  const plan = PLAN_CONFIG[variant];
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
        {plan.features.map((feature) => (
          <div key={feature.label} className="flex items-center gap-2">
            {feature.included ? (
              <CheckIcon className="size-4 shrink-0 text-primary" />
            ) : (
              <XIcon className="size-4 shrink-0 text-muted-foreground" />
            )}
            <p>{feature.label}</p>
          </div>
        ))}

        <PlanButtonCta
          email={user?.emailAddresses[0]?.emailAddress}
          hasPremiumPlan={hasPremiumPlan && variant === "pro"}
          onClick={onClick}
          plan={plan}
        />
      </CardContent>
    </Card>
  );
}
