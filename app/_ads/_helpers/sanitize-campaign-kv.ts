import { CAMPAIGN_KV_ALLOWLIST } from "@/app/_ads/_constants/ads-config";

const ALLOWLIST = new Set<string>(CAMPAIGN_KV_ALLOWLIST);

export function sanitizeCampaignKv(
  campaignKv?: Record<string, string>
): Record<string, string> | undefined {
  if (!campaignKv) return undefined;

  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(campaignKv)) {
    if (!ALLOWLIST.has(key)) continue;
    if (typeof value !== "string") continue;
    sanitized[key] = value.trim().slice(0, 64);
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}
