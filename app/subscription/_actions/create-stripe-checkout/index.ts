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

  let stripeCustomerId = typeof existingCustomerId === "string" ? existingCustomerId : undefined;

  if (stripeCustomerId) {
    try {
      await stripe.customers.update(stripeCustomerId, {
        metadata: { [CLERK_USER_ID_METADATA_KEY]: userId },
      });
    } catch (error: any) {
      if (error?.code === "resource_missing") {
        stripeCustomerId = undefined;
      } else {
        throw error;
      }
    }
  }

  const session = await stripe.checkout.sessions.create({
    ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),

    payment_method_types: ["card"],
    mode: "subscription",
    ...(process.env.NODE_ENV === "development"
      ? {
          success_url: process.env.APP_URL_LOCALHOST,
          cancel_url: process.env.APP_URL_LOCALHOST,
        }
      : {
          success_url: process.env.APP_URL_PRODUCTION,
          cancel_url: process.env.APP_URL_PRODUCTION,
        }),
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
