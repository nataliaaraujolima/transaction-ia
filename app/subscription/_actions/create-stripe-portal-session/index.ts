"use server";

import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import {
  CLERK_STRIPE_CUSTOMER_ID_METADATA_KEY,
  LEGACY_CLERK_STRIPE_CUSTOMER_ID_METADATA_KEY,
  STRIPE_API_VERSION,
} from "@/app/subscription/_constants/stripe-metadata";
import { getClerkMetadataString } from "@/app/subscription/_helpers/get-clerk-metadata-string";

export const createStripePortalSession = async () => {
  const user = await currentUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  const stripeCustomerId =
    getClerkMetadataString(user.privateMetadata, CLERK_STRIPE_CUSTOMER_ID_METADATA_KEY) ??
    getClerkMetadataString(user.privateMetadata, LEGACY_CLERK_STRIPE_CUSTOMER_ID_METADATA_KEY);

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      error: "Stripe secret key is not set",
    };
  }

  if (!stripeCustomerId) {
    return {
      error: "Stripe customer is not set",
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
  });

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: "http://localhost:3000/subscription",
  });

  return { url: portalSession.url };
};
