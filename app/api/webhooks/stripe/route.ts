import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

function toStripeId(value: string | { id: string } | null | undefined) {
  if (!value) {
    return undefined;
  }

  return typeof value === "string" ? value : value.id;
}

async function updateClerkSubscriptionMetadata(
  clerkUserId: string,
  {
    stripeCustomerId,
    stripeSubscriptionId,
    subscriptionPlan,
  }: {
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    subscriptionPlan: "premium" | "basic" | null;
  }
) {
  const clerk = await clerkClient();
  await clerk.users.replaceUserMetadata(clerkUserId, {
    privateMetadata: {
      stripeCustomerId,
      stripeSubscriptionId,
    },
    publicMetadata: {
      subscriptionPlan,
    },
  });
}

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    const text = await request.text();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-07-29.dahlia",
    });
    const event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") {
          break;
        }

        const clerkUserId = session.metadata?.clerk_user_id ?? session.client_reference_id;
        const stripeCustomerId = toStripeId(session.customer);
        const stripeSubscriptionId = toStripeId(session.subscription);

        if (!clerkUserId || !stripeCustomerId || !stripeSubscriptionId) {
          console.error("Stripe checkout.session.completed missing Clerk or Stripe IDs", {
            clerkUserId,
            stripeCustomerId,
            stripeSubscriptionId,
          });
          return NextResponse.json({ error: "Missing subscription data" }, { status: 400 });
        }

        await updateClerkSubscriptionMetadata(clerkUserId, {
          stripeCustomerId,
          stripeSubscriptionId,
          subscriptionPlan: "premium",
        });
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionDetails = invoice.parent?.subscription_details;
        const stripeCustomerId = toStripeId(invoice.customer);
        const stripeSubscriptionId = toStripeId(subscriptionDetails?.subscription);
        const clerkUserId =
          subscriptionDetails?.metadata?.clerk_user_id ??
          (stripeSubscriptionId
            ? (await stripe.subscriptions.retrieve(stripeSubscriptionId)).metadata.clerk_user_id
            : undefined);

        if (!clerkUserId || !stripeCustomerId || !stripeSubscriptionId) {
          break;
        }

        await updateClerkSubscriptionMetadata(clerkUserId, {
          stripeCustomerId,
          stripeSubscriptionId,
          subscriptionPlan: "premium",
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const clerkUserId = subscription.metadata.clerk_user_id;

        if (!clerkUserId) {
          break;
        }

        const clerk = await clerkClient();

        const user = await clerk.users.getUser(clerkUserId);

        const currentSubscriptionId =
          typeof user.privateMetadata.stripeSubscriptionId === "string"
            ? user.privateMetadata.stripeSubscriptionId
            : undefined;

        if (currentSubscriptionId && currentSubscriptionId !== subscription.id) {
          break; // já tem uma assinatura mais nova
        }
        // TODO: Implement the logic to update the subscription plan to basic
        await updateClerkSubscriptionMetadata(clerkUserId, {
          stripeCustomerId:
            typeof user.privateMetadata.stripeCustomerId === "string"
              ? user.privateMetadata.stripeCustomerId
              : null,
          stripeSubscriptionId: null,
          subscriptionPlan: "basic",
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
