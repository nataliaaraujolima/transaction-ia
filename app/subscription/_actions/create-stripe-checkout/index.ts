"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import {
  CLERK_USER_ID_METADATA_KEY,
  STRIPE_API_VERSION,
} from "@/app/subscription/_constants/stripe-metadata";

export const createStripeCheckout = async () => {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return {
      error: "Unauthorized",
    };
  }

  const existingCustomerId = user.privateMetadata.stripeCustomerId;

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      error: "Stripe secret key is not set",
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
  });

  if (typeof existingCustomerId === "string") {
    await stripe.customers.update(existingCustomerId, {
      metadata: { [CLERK_USER_ID_METADATA_KEY]: userId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    ...(typeof existingCustomerId === "string" ? { customer: existingCustomerId } : {}),

    payment_method_types: ["card"],
    mode: "subscription",
    success_url: "http://localhost:3000/subscription",
    cancel_url: "http://localhost:3000/subscription",
    client_reference_id: userId,
    metadata: {
      [CLERK_USER_ID_METADATA_KEY]: userId,
    },
    subscription_data: {
      metadata: {
        [CLERK_USER_ID_METADATA_KEY]: userId,
      },
    },
    line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
  });

  return { url: session.url };
};
