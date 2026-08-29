Tasks para começar (foco schema + actions) task-**001** — Schema Prisma (Notification + UserBillingState) Esforço: ~1–1.5h · Bloqueia: tudo de persistência

* Adicionar modelos no prisma/schema.prisma

* Migration add_notifications_userbillingstate

* Índices @@index([userId, read, createdAt]) e @@index([cycleId])

* Seed mínimo (1 notificação unread + 1 billing state)

