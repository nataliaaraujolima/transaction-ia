import { auth, clerkClient } from "@clerk/nextjs/server";

export async function ClerkPremiumPlan(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  const publicMetadata = clerkUser.publicMetadata as { subscriptionPlan?: string };

  return publicMetadata.subscriptionPlan === "premium";
}
