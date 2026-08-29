import { db } from "@/app/_lib/prisma";

async function main() {
  console.log("Iniciando o seeding de ads...");

  const userId = "user_naruto";
  const slotId = "dashboard_alert";
  const sessionId = "seed_session_naruto";
  const dayUTC = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const dedupKey = `${userId}:${slotId}:${sessionId}:${dayUTC}`;

  // Só allowlist — nunca userId/email/nome
  const campaignKv = {
    plan: "basic",
    zone: "alert",
    txn_bucket: "8-9",
  };

  await db.userAdState.upsert({
    where: { userId },
    create: {
      userId,
      adSeen: true,
      adSeenAt: new Date(),
      adViewsCount: 1,
      adLastViewSessionId: sessionId,
      adLastSlotId: slotId,
      adCampaignKv: campaignKv,
      dismissedUntil: null,
    },
    update: {
      adSeen: true,
      adSeenAt: new Date(),
      adViewsCount: 1,
      adLastViewSessionId: sessionId,
      adLastSlotId: slotId,
      adCampaignKv: campaignKv,
    },
  });

  await db.adImpression.upsert({
    where: { dedupKey },
    create: {
      userId,
      slotId,
      adUnitId: null,
      sessionId,
      campaignKv,
      source: "gpt",
      dedupKey,
    },
    update: {},
  });

  console.log("Ads seed criado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar o seed de ads:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
