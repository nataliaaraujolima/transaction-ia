import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

//http://localhost:3000/api/webhoks/stripe
export const POST = async (request: Request) => {
  const signature = request.headers.get("stripe-signature");
  // Verifica se a requisição é uma requisição POST
  if (!signature) {
    return NextResponse.error();
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.error();
  }

  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-07-29.dahlia",
  });

  const event = stripe.webhooks.constructEvent(text, signature, process.env.STRIPE_WEBHOOK_SECRET);

  switch (event.type) {
    case "invoice.paid": {
      //atualizar o status do usuário com o novo plano
      const invoice = event.data.object;
      const subscriptionDetails = invoice.parent?.subscription_details;
      const clerkUserId = subscriptionDetails?.metadata?.clerk_user_id;
      if (!clerkUserId) {
        return NextResponse.error();
      }

      const clerk = await clerkClient();
      await clerk.users.updateUser(clerkUserId, {
        privateMetadata: {
          stripe_subscription_id: subscriptionDetails.subscription,
          stripe_customer_id: invoice.customer,
        },
        publicMetadata: {
          subscriptionPlan: "premium",
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
};
