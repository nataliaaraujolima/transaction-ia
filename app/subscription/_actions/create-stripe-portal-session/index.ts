"use server";

import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const createStripePortalSession = async () => {
  const user = await currentUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  const customerId = user.privateMetadata.stripe_customer_id;

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      error: "Stripe secret key is not set",
    };
  }

  if (typeof customerId !== "string" || !customerId) {
    return {
      error: "Stripe customer is not set",
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-07-29.dahlia",
  });

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: "http://localhost:3000/subscription",
  });

  return { url: session.url };
};
