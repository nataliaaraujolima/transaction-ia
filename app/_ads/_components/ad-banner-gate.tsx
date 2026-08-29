import { getAdEligibility } from "@/app/_ads/_actions/get-ad-eligibility";
import { AdBanner } from "@/app/_ads/_components/ad-banner";

/** RSC: só monta o client AdBanner quando elegível (zero GPT se false). */
export async function AdBannerGate() {
  const eligibility = await getAdEligibility();

  if (!eligibility.eligible || !eligibility.adConfig) {
    return null;
  }

  return <AdBanner adConfig={eligibility.adConfig} />;
}
