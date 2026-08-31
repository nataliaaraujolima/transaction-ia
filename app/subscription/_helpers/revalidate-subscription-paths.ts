import { revalidatePath } from "next/cache";

const SUBSCRIPTION_DEPENDENT_PATHS = ["/dashboard", "/subscription", "/transaction"] as const;

export function revalidateSubscriptionPaths() {
  for (const path of SUBSCRIPTION_DEPENDENT_PATHS) {
    revalidatePath(path);
  }
}
