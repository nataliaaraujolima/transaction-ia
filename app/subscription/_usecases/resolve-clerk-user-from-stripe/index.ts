import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";
import {
  CLERK_USER_ID_METADATA_KEY,
  CLERK_USER_LOOKUP_PAGE_SIZE,
} from "@/app/subscription/_constants/stripe-metadata";

export type ResolveClerkUserFromStripeParams = {
  stripe: Stripe;
  metadata?: Stripe.Metadata | null;
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null;
};

function getClerkUserIdFromMetadata(metadata?: Stripe.Metadata | null) {
  const clerkUserId = metadata?.[CLERK_USER_ID_METADATA_KEY];
  return typeof clerkUserId === "string" ? clerkUserId : undefined;
}

function toStripeCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer) {
    return undefined;
  }

  return typeof customer === "string" ? customer : customer.id;
}

async function findClerkUserIdByEmail(email: string) {
  const clerk = await clerkClient();
  const { data: clerkUsers } = await clerk.users.getUserList({
    emailAddress: [email],
    limit: CLERK_USER_LOOKUP_PAGE_SIZE,
  });

  return clerkUsers[0]?.id;
}

async function findClerkUserIdFromStripeCustomer(stripe: Stripe, customerId: string) {
  const stripeCustomer = await stripe.customers.retrieve(customerId);

  if (stripeCustomer.deleted) {
    return undefined;
  }

  const clerkUserIdFromCustomer = getClerkUserIdFromMetadata(stripeCustomer.metadata);
  if (clerkUserIdFromCustomer) {
    return clerkUserIdFromCustomer;
  }

  if (!stripeCustomer.email) {
    return undefined;
  }

  return findClerkUserIdByEmail(stripeCustomer.email);
}

export async function resolveClerkUserFromStripe(params: ResolveClerkUserFromStripeParams) {
  const clerkUserIdFromMetadata = getClerkUserIdFromMetadata(params.metadata);
  if (clerkUserIdFromMetadata) {
    return clerkUserIdFromMetadata;
  }

  const customerId = toStripeCustomerId(params.customer);
  if (!customerId) {
    return null;
  }

  const clerkUserId = await findClerkUserIdFromStripeCustomer(params.stripe, customerId);
  return clerkUserId ?? null;
}
