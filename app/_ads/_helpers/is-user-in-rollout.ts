import { ADS_ROLLOUT_PERCENT } from "@/app/_ads/_constants/ads-config";

/** Hash estável (FNV-1a 32-bit) → bucket 0–99 */
function stableHashPercent(userId: string): number {
  let hash = 0x811c9dc5;

  for (let i = 0; i < userId.length; i++) {
    hash ^= userId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0) % 100;
}

/**
 * true se o user entra no percentual de rollout.
 * Ex.: ADS_ROLLOUT_PERCENT=1 → ~1% dos userIds.
 */
export function isUserInRollout(
  userId: string,
  rolloutPercent: number = ADS_ROLLOUT_PERCENT
): boolean {
  if (!userId) return false;

  const percent = Math.min(100, Math.max(0, rolloutPercent));
  if (percent <= 0) return false;
  if (percent >= 100) return true;

  return stableHashPercent(userId) < percent;
}
