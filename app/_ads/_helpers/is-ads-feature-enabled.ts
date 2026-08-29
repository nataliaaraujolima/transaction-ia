export function isAdsFeatureEnabled(): boolean {
  const value = process.env.FEATURE_ADS?.trim().toLowerCase();
  return value === "true" || value === "1";
}
