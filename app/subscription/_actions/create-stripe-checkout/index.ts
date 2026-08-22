"use server";

import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const createStripeCheckout = async () => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: "Unauthorized",
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      error: "Stripe secret key is not set",
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-07-29.dahlia",
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: "http://localhost:3000/subscription",
    cancel_url: "http://localhost:3000/subscription",
    client_reference_id: userId,
    metadata: {
      clerk_user_id: userId,
    },
    subscription_data: {
      metadata: {
        clerk_user_id: userId,
      },
    },
    line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
  });

  return { url: session.url };
};
