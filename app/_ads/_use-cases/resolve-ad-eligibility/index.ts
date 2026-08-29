import {
  ADS_ALERT_ZONE,
  ADS_FREQUENCY_CAP_PER_DAY,
  ADS_SIZES,
  ADS_SLOT,
} from "@/app/_ads/_constants/ads-config";
import { countAdImpressionsToday, findUserAdStateByUserId } from "@/app/_ads/_db/user-ad-state";
import { isAdEligible } from "@/app/_ads/_helpers/is-ad-eligible";
import { isAdsFeatureEnabled } from "@/app/_ads/_helpers/is-ads-feature-enabled";
import { isUserInRollout } from "@/app/_ads/_helpers/is-user-in-rollout";
import { getCurrentMonthTransactions } from "@/app/transaction/_db/get-current-moth-transactions";
import { ClerkPremiumPlan } from "@/app/transaction/clerk-premium-plan";

export type AdConfig = {
  slotId: string;
  adUnitPath: string;
  sizes: {
    mobile: readonly [number, number];
    desktop: readonly [number, number];
  };
  campaignKv: {
    plan: "basic";
    zone: "alert";
    txn_bucket: "8-9";
  };
};

export type ResolveAdEligibilityResult =
  | {
      eligible: true;
      adConfig: AdConfig;
      reason: "alert_zone";
    }
  | {
      eligible: false;
      adConfig: null;
      reason:
        | "feature_off"
        | "not_in_rollout"
        | "premium"
        | "below_zone"
        | "above_zone"
        | "dismissed"
        | "frequency_capped"
        | "unauthorized";
    };

export async function resolveAdEligibility(userId: string): Promise<ResolveAdEligibilityResult> {
  if (!userId) {
    return { eligible: false, adConfig: null, reason: "unauthorized" };
  }

  const [plan, { currentMonthTransactions }, state, viewsToday] = await Promise.all([
    ClerkPremiumPlan(),
    getCurrentMonthTransactions(),
    findUserAdStateByUserId(userId),
    countAdImpressionsToday(userId),
  ]);

  const result = isAdEligible({
    featureEnabled: isAdsFeatureEnabled(),
    inRollout: isUserInRollout(userId),
    plan,
    currentMonthTransactions,
    alertZoneMin: ADS_ALERT_ZONE.min,
    alertZoneMax: ADS_ALERT_ZONE.max,
    dismissedUntil: state?.dismissedUntil ?? null,
    viewsToday,
    frequencyCapPerDay: ADS_FREQUENCY_CAP_PER_DAY,
  });

  if (!result.eligible) {
    return { eligible: false, adConfig: null, reason: result.reason };
  }

  return {
    eligible: true,
    reason: "alert_zone",
    adConfig: {
      slotId: ADS_SLOT.id,
      adUnitPath: ADS_SLOT.adUnitPath,
      sizes: {
        mobile: ADS_SIZES.mobile,
        desktop: ADS_SIZES.desktop,
      },
      campaignKv: {
        plan: "basic",
        zone: "alert",
        txn_bucket: "8-9",
      },
    },
  };
}
