import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";
import {
  CLERK_STRIPE_CUSTOMER_ID_METADATA_KEY,
  CLERK_STRIPE_SUBSCRIPTION_ID_METADATA_KEY,
  CLERK_USER_ID_METADATA_KEY,
} from "@/app/subscription/_constants/stripe-metadata";
import { getClerkMetadataString } from "@/app/subscription/_helpers/get-clerk-metadata-string";
import { planFromStripeStatus } from "@/app/subscription/_helpers/stripe-subscription-status";
import { toStripeId } from "@/app/subscription/_helpers/to-stripe-id";
import { resolveClerkUserFromStripe } from "@/app/subscription/_usecases/resolve-clerk-user-from-stripe";

export type SyncStripeSubscriptionToClerkParams = {
  stripe: Stripe;
  subscription: Stripe.Subscription;
};

type ClerkSubscriptionMetadata = {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionPlan: "premium" | "basic";
};

async function updateClerkSubscriptionMetadata(
  clerkUserId: string,
  subscriptionMetadata: ClerkSubscriptionMetadata
) {
  const clerk = await clerkClient();

  await clerk.users.updateUserMetadata(clerkUserId, {
    privateMetadata: {
      stripeCustomerId: subscriptionMetadata.stripeCustomerId,
      stripeSubscriptionId: subscriptionMetadata.stripeSubscriptionId,
    },
    publicMetadata: {
      subscriptionPlan: subscriptionMetadata.subscriptionPlan,
    },
  });
}

function shouldIgnoreOutdatedSubscriptionDowngrade({
  subscriptionPlan,
  storedStripeSubscriptionId,
  incomingStripeSubscriptionId,
}: {
  subscriptionPlan: "premium" | "basic";
  storedStripeSubscriptionId?: string;
  incomingStripeSubscriptionId: string;
}) {
  const isDowngradeToBasicPlan = subscriptionPlan === "basic";
  const userAlreadyHasDifferentSubscription =
    storedStripeSubscriptionId !== undefined &&
    storedStripeSubscriptionId !== incomingStripeSubscriptionId;

  return isDowngradeToBasicPlan && userAlreadyHasDifferentSubscription;
}

async function linkStripeCustomerToClerkUser(
  stripe: Stripe,
  stripeCustomerId: string,
  clerkUserId: string
) {
  await stripe.customers.update(stripeCustomerId, {
    metadata: { [CLERK_USER_ID_METADATA_KEY]: clerkUserId },
  });
}

export async function syncStripeSubscriptionToClerk({
  stripe,
  subscription,
}: SyncStripeSubscriptionToClerkParams) {
  const clerkUserId = await resolveClerkUserFromStripe({
    stripe,
    metadata: subscription.metadata,
    customer: subscription.customer,
  });

  if (!clerkUserId) {
    console.error("Unable to resolve Clerk user for Stripe subscription", {
      stripeSubscriptionId: subscription.id,
    });
    return;
  }

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(clerkUserId);
  const storedStripeSubscriptionId = getClerkMetadataString(
    clerkUser.privateMetadata,
    CLERK_STRIPE_SUBSCRIPTION_ID_METADATA_KEY
  );
  const subscriptionPlan = planFromStripeStatus(subscription.status);

  if (
    shouldIgnoreOutdatedSubscriptionDowngrade({
      subscriptionPlan,
      storedStripeSubscriptionId,
      incomingStripeSubscriptionId: subscription.id,
    })
  ) {
    return;
  }

  const stripeCustomerIdFromSubscription = toStripeId(subscription.customer);
  const storedStripeCustomerId = getClerkMetadataString(
    clerkUser.privateMetadata,
    CLERK_STRIPE_CUSTOMER_ID_METADATA_KEY
  );
  const resolvedStripeCustomerId =
    stripeCustomerIdFromSubscription ?? storedStripeCustomerId ?? null;

  if (resolvedStripeCustomerId) {
    await linkStripeCustomerToClerkUser(stripe, resolvedStripeCustomerId, clerkUserId);
  }

  const isPremiumPlan = subscriptionPlan === "premium";

  await updateClerkSubscriptionMetadata(clerkUserId, {
    stripeCustomerId: resolvedStripeCustomerId,
    stripeSubscriptionId: isPremiumPlan ? subscription.id : null,
    subscriptionPlan,
  });
}
