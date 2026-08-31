const PREMIUM_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

type StripeSubscriptionAccess = {
  status: string;
  cancel_at_period_end?: boolean | null;
};

export function isPremiumStripeSubscription(subscription: StripeSubscriptionAccess) {
  if (subscription.cancel_at_period_end) {
    return false;
  }

  return PREMIUM_SUBSCRIPTION_STATUSES.has(subscription.status);
}

export function planFromStripeSubscription(
  subscription: StripeSubscriptionAccess
): "premium" | "basic" {
  return isPremiumStripeSubscription(subscription) ? "premium" : "basic";
}
