export type AdEligibilityReason =
  | "alert_zone"
  | "feature_off"
  | "not_in_rollout"
  | "premium"
  | "below_zone"
  | "above_zone"
  | "dismissed"
  | "frequency_capped"
  | "unauthorized";

export type IsAdEligibleInput = {
  featureEnabled: boolean;
  inRollout: boolean;
  plan: string;
  currentMonthTransactions: number;
  alertZoneMin: number;
  alertZoneMax: number;
  dismissedUntil: Date | null;
  viewsToday: number;
  frequencyCapPerDay: number;
  now?: Date;
};

export type IsAdEligibleResult =
  | { eligible: true; reason: "alert_zone" }
  | { eligible: false; reason: Exclude<AdEligibilityReason, "alert_zone"> };

export function isAdEligible(input: IsAdEligibleInput): IsAdEligibleResult {
  const now = input.now ?? new Date();

  if (!input.featureEnabled) {
    return { eligible: false, reason: "feature_off" };
  }

  if (!input.inRollout) {
    return { eligible: false, reason: "not_in_rollout" };
  }

  if (input.plan === "premium") {
    return { eligible: false, reason: "premium" };
  }

  if (input.currentMonthTransactions < input.alertZoneMin) {
    return { eligible: false, reason: "below_zone" };
  }

  if (input.currentMonthTransactions > input.alertZoneMax) {
    return { eligible: false, reason: "above_zone" };
  }

  if (input.dismissedUntil && input.dismissedUntil > now) {
    return { eligible: false, reason: "dismissed" };
  }

  if (input.viewsToday >= input.frequencyCapPerDay) {
    return { eligible: false, reason: "frequency_capped" };
  }

  return { eligible: true, reason: "alert_zone" };
}
