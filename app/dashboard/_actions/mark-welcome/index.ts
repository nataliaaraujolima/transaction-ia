"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function markWelcomeSeen() {
  const { userId } = await auth();
  if (!userId) return;

  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      hasSeenWelcome: true,
    },
  });
}
