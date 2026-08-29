// prisma/seed.ts

import { NotificationType } from "@prisma/client";
import { db } from "@/app/_lib/prisma"; // Ajuste o caminho do seu arquivo prisma.ts/db.ts

async function main() {
  console.log("Iniciando o seeding de notificações...");

  // Exemplo de criação de notificações para um usuário específico (ou vários)
  const userIdExemplo = "user_naruto"; // Substitua por um ID de usuário real se necessário

  await db.notification.createMany({
    data: [
      {
        userId: userIdExemplo,
        type: NotificationType.THRESHOLD_80,
        payload: {
          amount: 100,
        },
        read: true,
        cycleId: "cycle_naruto",
      },
      {
        userId: userIdExemplo,
        type: NotificationType.THRESHOLD_80,
        payload: {
          amount: 100,
        },
        read: false,
        cycleId: "cycle_naruto",
      },
    ],
  });

  console.log("Notificações criadas com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
