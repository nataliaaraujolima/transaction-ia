export const ADS_ALERT_ZONE = {
  min: Number(process.env.ADS_ALERT_ZONE_MIN ?? 8),
  max: Number(process.env.ADS_ALERT_ZONE_MAX ?? 9),
};

export const ADS_FREQUENCY_CAP_PER_DAY = Number(process.env.ADS_FREQUENCY_CAP_PER_DAY ?? 1);

export const ADS_DEDUP_WINDOW_MINUTES = Number(process.env.ADS_DEDUP_WINDOW_MINUTES ?? 30);

export const ADS_ROLLOUT_PERCENT = Number(process.env.ADS_ROLLOUT_PERCENT ?? 1);

export const ADS_SLOT = {
  id: process.env.NEXT_PUBLIC_GAM_SLOT_ID ?? "dashboard_alert",
  networkCode: process.env.NEXT_PUBLIC_GAM_NETWORK_CODE ?? "",
  adUnitPath: process.env.NEXT_PUBLIC_GAM_AD_UNIT_PATH ?? "",
};

export const ADS_SIZES = {
  mobile: [320, 50] as const,
  desktop: [300, 250] as const,
};

/** Keys permitidas em campaign_kv — nunca userId/email/nome */
export const CAMPAIGN_KV_ALLOWLIST = ["plan", "zone", "txn_bucket"] as const;

export const GPT_SCRIPT_URL = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
