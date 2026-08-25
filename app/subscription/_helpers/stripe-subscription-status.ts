const PREMIUM_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

export function isPremiumStripeStatus(status: string) {
  return PREMIUM_SUBSCRIPTION_STATUSES.has(status);
}

export function planFromStripeStatus(status: string): "premium" | "basic" {
  return isPremiumStripeStatus(status) ? "premium" : "basic";
}
