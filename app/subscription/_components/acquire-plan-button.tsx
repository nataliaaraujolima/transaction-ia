"use client";

import { createStripeCheckout } from "../_actions/create-stripe-checkout";
import { PlanCard } from "./plan-card";

export const AcquirePlanButton = () => {
  async function handleAcquirePlanClick() {
    const checkout = await createStripeCheckout();

    if (!("url" in checkout) || !checkout.url) {
      throw new Error("Stripe checkout URL is not set");
    }

    window.location.assign(checkout.url);
  }

  return <PlanCard variant="pro" onClick={handleAcquirePlanClick} />;
};
