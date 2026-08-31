import { auth, clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";
import Stripe from "stripe";
import {
  CLERK_STRIPE_CUSTOMER_ID_METADATA_KEY,
  CLERK_STRIPE_SUBSCRIPTION_ID_METADATA_KEY,
  CLERK_SUBSCRIPTION_PLAN_METADATA_KEY,
  LEGACY_CLERK_STRIPE_CUSTOMER_ID_METADATA_KEY,
  STRIPE_API_VERSION,
  STRIPE_SUBSCRIPTION_LOOKUP_PAGE_SIZE,
} from "@/app/subscription/_constants/stripe-metadata";
import { getClerkMetadataString } from "@/app/subscription/_helpers/get-clerk-metadata-string";
import { isPremiumStripeSubscription } from "@/app/subscription/_helpers/stripe-subscription-status";

export const ClerkPremiumPlan = cache(async (): Promise<string> => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);
  const publicMetadata = clerkUser.publicMetadata as Record<string, unknown>;
  const currentPlan =
    getClerkMetadataString(publicMetadata, CLERK_SUBSCRIPTION_PLAN_METADATA_KEY) ?? "basic";
  const storedStripeSubscriptionId = getClerkMetadataString(
    clerkUser.privateMetadata,
    CLERK_STRIPE_SUBSCRIPTION_ID_METADATA_KEY
  );
  const storedStripeCustomerId =
    getClerkMetadataString(clerkUser.privateMetadata, CLERK_STRIPE_CUSTOMER_ID_METADATA_KEY) ??
    getClerkMetadataString(clerkUser.privateMetadata, LEGACY_CLERK_STRIPE_CUSTOMER_ID_METADATA_KEY);

  if (!process.env.STRIPE_SECRET_KEY || (!storedStripeSubscriptionId && !storedStripeCustomerId)) {
    return currentPlan;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
  });

  let stripeSubscription: Stripe.Subscription | undefined;

  if (storedStripeSubscriptionId) {
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(storedStripeSubscriptionId);
    } catch (error) {
      const isMissingSubscription =
        error instanceof Stripe.errors.StripeInvalidRequestError &&
        error.code === "resource_missing";

      if (!isMissingSubscription) {
        console.error("Failed to retrieve Stripe subscription", error);
        return currentPlan;
      }
    }
  }

  if (!stripeSubscription && storedStripeCustomerId) {
    const customerSubscriptions = await stripe.subscriptions.list({
      customer: storedStripeCustomerId,
      status: "all",
      limit: STRIPE_SUBSCRIPTION_LOOKUP_PAGE_SIZE,
    });
    stripeSubscription =
      customerSubscriptions.data.find((subscription) =>
        isPremiumStripeSubscription(subscription)
      ) ?? customerSubscriptions.data[0];
  }

  const syncedPlan =
    stripeSubscription && isPremiumStripeSubscription(stripeSubscription) ? "premium" : "basic";

  if (syncedPlan !== currentPlan) {
    const isPremiumPlan = syncedPlan === "premium";

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        [CLERK_SUBSCRIPTION_PLAN_METADATA_KEY]: syncedPlan,
      },
      privateMetadata: {
        [CLERK_STRIPE_SUBSCRIPTION_ID_METADATA_KEY]: isPremiumPlan
          ? (stripeSubscription?.id ?? null)
          : null,
      },
    });
  }

  return syncedPlan;
});
