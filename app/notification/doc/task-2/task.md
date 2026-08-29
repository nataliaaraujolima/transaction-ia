task-**002** — Completar schema do domínio de notificação Esforço: ~1h · blocked_by: — · Onde: prisma/schema.prisma + seed

Evoluir o model atual (não recriar do zero):

model Notification {
    id        String   @id @default(uuid())
    userId    String
    type      String              // ex: THRESHOLD_80
    payload   Json
    read      Boolean  @default(false)
    cycleId   String?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    @@index([userId, read, createdAt])
    @@index([cycleId])
}
model UserBillingState {
    userId     String   @id
    cycleId    String?
    notified80 Boolean  @default(false)
    updatedAt  DateTime @updatedAt
}
Checklist:

Migration (ex.: enrich_notifications_and_billing_state) Atualizar notification_seed.ts com type, payload, read: false, cycleId + 1 UserBillingState prisma generate