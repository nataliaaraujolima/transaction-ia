import { NextResponse } from "next/server";
import Stripe from "stripe";
import { STRIPE_API_VERSION } from "@/app/subscription/_constants/stripe-metadata";
import { revalidateSubscriptionPaths } from "@/app/subscription/_helpers/revalidate-subscription-paths";
import { toStripeId } from "@/app/subscription/_helpers/to-stripe-id";
import { syncStripeSubscriptionToClerk } from "@/app/subscription/_usecases/sync-stripe-subscription-to-clerk";

async function syncSubscriptionAndRevalidate(
  stripe: Stripe,
  subscription: Stripe.Subscription
) {
  await syncStripeSubscriptionToClerk({ stripe, subscription });
  revalidateSubscriptionPaths();
}

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const stripeSignature = request.headers.get("stripe-signature");
    if (!stripeSignature) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    const requestBody = await request.text();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION,
    });
    const stripeEvent = stripe.webhooks.constructEvent(
      requestBody,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const checkoutSession = stripeEvent.data.object;
        const isSubscriptionCheckout = checkoutSession.mode === "subscription";

        if (!isSubscriptionCheckout) {
          break;
        }

        const stripeCustomerId = toStripeId(checkoutSession.customer);
        const stripeSubscriptionId = toStripeId(checkoutSession.subscription);

        if (!stripeCustomerId || !stripeSubscriptionId) {
          console.error("Stripe checkout.session.completed missing Stripe IDs", {
            stripeCustomerId,
            stripeSubscriptionId,
          });
          return NextResponse.json({ error: "Missing subscription data" }, { status: 400 });
        }

        const subscriptionFromCheckout = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        await syncSubscriptionAndRevalidate(stripe, subscriptionFromCheckout);
        break;
      }
      case "invoice.paid": {
        const paidInvoice = stripeEvent.data.object;
        const subscriptionDetails = paidInvoice.parent?.subscription_details;
        const stripeSubscriptionId = toStripeId(subscriptionDetails?.subscription);

        if (!stripeSubscriptionId) {
          break;
        }

        const subscriptionFromInvoice = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        await syncSubscriptionAndRevalidate(stripe, subscriptionFromInvoice);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const updatedSubscription = stripeEvent.data.object;
        await syncSubscriptionAndRevalidate(stripe, updatedSubscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
