Implementation Task Summary for In‑App Usage Threshold Notifications (**MVP** 80%) Overview **MVP** para notificar usuários pagantes quando atingirem ≥80% do limite do plano. Reaproveitar: cálculo de usage existente (transações via Pluggy + Stripe), autenticação Clerk, Prisma/Neon DB, websocket Stripe e fluxo de checkout Stripe. Entregas: migration Prisma, use case evaluateUsageAndNotify (cron + webhook trigger), endpoints notifications (**GET**/**PATCH**), UI (badge/dropdown, banner, dashboard card), testes mínimos, deploy em staging e runbook.

### Task Dependencies

graph TD A[task-**001**: DB Migration & Indexes] --> B[task-**002**: Backend — Logic & **API**] A --> C[task-**003**: Tests & Metrics] B --> D[task-**004**: Frontend Components] B --> C C --> E[task-**005**: Staging Integration, Deploy & Docs] D --> E

Tasks task-**001**: DB Migration & Indexes (Low, 1.5h) task-**002**: Backend — evaluateUsageAndNotify + Notifications **API** (Medium, 8h) - blocked_by: task-**001** task-**003**: Tests, Metrics & Stripe websocket wiring (Medium, 4h) - blocked_by: task-**002** (parcialmente paralelo com task-**004**) task-**004**: Frontend — NotificationsMenu, SubscriptionBanner, DashboardCard (Medium, 6h) - blocked_by: task-**002** (pode iniciar com mocks) task-**005**: Staging Integration, Deploy CI, Docs e Rollout Checklist (Low, 3h) - blocked_by: task-**002**, task-**003**, task-**004** ### Execution Strategy Parallel Tracks: task-**001** → task-**002** → task-**003** → task-**004** → task-**005** Frontend work (task-**004**) can start with **API** contracts/mocks and then switch to real endpoints. Critical Path: task-**001** → task-**002** → task-**003** → task-**004** → task-**005** Estimated Total Time (1 dev): ~1.5–2 dias; com 2 devs em paralelo: **MVP** em ~1 dia. Nota: Este escopo foi agrupado em 5 tasks principais para entrega rápida do **MVP**. Posso quebrar qualquer task em sub-tarefas menores se desejar.

--- task-**001**.md

status: pending parallelizable: false blocked_by: [] <task_context> packages/db-schema, apps/api implementation database schema + migration low none </task_context>

Overview Adicionar modelos Prisma Notification e UserBillingState ao schema existente (arquivo que você enviou). Gerar migration, aplicar em dev/staging e adicionar índices para consultas rápidas. Entregável: alteração do schema.prisma + migration aplicável + seeds. Requirements (checklist) Adicionar modelos Notification e UserBillingState no schema.prisma. Gerar migration: npx prisma migrate dev --name add_notifications_userbillingstate Aplicar migration em dev/staging: npx prisma migrate deploy Adicionar índices: @@index([userId, read, createdAt]) e @@index([cycleId]) Atualizar **README**/db docs com instruções para rodar migration localmente Criar seeds de exemplo (1 notification read=false, 1 userBillingState) Sub-tasks 1.0 Alterar schema.prisma (inserir abaixo do seu schema existente) 1.1 Inserir modelos:

model Notification { id String @id @default(uuid()) userId String type String payload Json read Boolean @default(false) createdAt DateTime @default(now()) cycleId String? @@index([userId, read, createdAt]) @@index([cycleId]) }

model UserBillingState { userId String @id cycleId String? notified80 Boolean @default(false) updatedAt DateTime @updatedAt }

1.2 Rodar migration local e revisar **SQL** gerado. 1.3 Gerar Prisma Client: npx prisma generate 1.4 Criar seed script em prisma/seed.ts (ex: inserir 1 notification e 1 userBillingState)

### Implementation Details

Payload **JSON** padrão: { currentUsage, planLimit, percentUsed, daysLeft, suggestedPlanId } — não guardar dados sensíveis. CycleId recomendada: ${subscriptionId}_${periodStartISO} (**YYYY**-MM-DD) — se subscriptionId não disponível, use periodStartISO. Se seu monorepo utilizar packages/db-schema como fonte única, aplique a mudança lá. ### Acceptance Criteria Migration criada e aplicada localmente. Prisma client gerado sem erros. Indexes presentes e consulta unread count rápida. Seeds funcionando para testes locais. Dependencies & Parallelism

Bloqueia persistência real do task-**002**, porém backend pode implementar lógica com mocks durante a aplicação da migration. Est. tempo: Low — ~1.5 horas.

--- task-**002**.md

status: pending parallelizable: true blocked_by: [*task-**001***] <task_context> apps/api, packages/core implementation backend application logic + **API** drivers medium prisma migration, stripe, existing usage function </task_context>

Overview Implementar use case evaluateUsageAndNotify reaproveitando sua função existente que calcula { currentUsage, planLimit, subscriptionId, periodStart, daysLeft } (transações via Pluggy + Stripe). Criar endpoints **GET** /api/notifications e **PATCH** /api/notifications/:id/read. Tornar a rotina acionável via cron (**SST** job) e via webhook/websocket Stripe (já ativo). Requirements (checklist) Adapter que chame sua função getUsageForUser/getUsageForActiveSubscriptions. percentUsed = Math.floor(currentUsage / planLimit * **100**) cycleId = ${subscriptionId}_${periodStartISO} Upsert UserBillingState: reset notified80 ao mudar cycleId Criar Notification THRESHOLD_80 quando percentUsed ≥ 80 e notificado ainda não marcado no cycle Proteção fallback: não criar >1 THRESHOLD_80 nas últimas 24h Operação atômica (prisma.$transaction) para evitar race conditions **GET** /api/notifications (Clerk auth): retorna unreadCount + notifications[] ordenados (unread first) **PATCH** /api/notifications/:id/read (Clerk auth): valida owner e marca read=true Reaproveitar /api/checkout/create-session?source=notification_threshold80 Usar Stripe websocket para triggers imediatos (invoice/subscription events) Sub-tasks 2.0 Types & Contracts 2.0.1 Definir NotificationType e NotificationPayload em packages/core 2.1 Implement evaluateForUser(userId) 2.1.1 Adapter chama getUsageForUser 2.1.2 Calcular percentUsed e cycleId 2.1.3 prisma.$transaction: upsert UserBillingState; checar last Notification; criar Notification + set notified80=true 2.1.4 Retornar { createdNotification, percentUsed, cycleId } para logs 2.2 Cron + Websocket trigger 2.2.1 Job **HTTP** protegido (**POST** /api/jobs/evaluate-usage) acionado por **SST** cron com header X-Infra-Key=JOB_SECRET 2.2.2 Handler na websocket/webhook Stripe para avaliar subscription afetado 2.3 **API** endpoints 2.3.1 **GET** /api/notifications: lista paginada para usuário autenticado 2.3.2 **PATCH** /api/notifications/:id/read: marca read e retorna unreadCount atualizado 2.4 Observability 2.4.1 Logs estruturados e metric notification_created 2.5 Security 2.5.1 Validar sessão Clerk em cada endpoint 2.5.2 Ignorar contas de teste (metadata isTestAccount)

### Implementation Details

Use p-limit para limitar concorrência no processamento em lote.

Exemplo transacional (simplificado):

const percentUsed = Math.floor((currentUsage / Math.max(1, planLimit)) * **100**); const cycleId = ${subscriptionId}_${periodStartISO}; await prisma.$transaction(async (tx) => { const state = await tx.userBillingState.findUnique({ where: { userId } }); if (!state || state.cycleId !== cycleId) { await tx.userBillingState.upsert({ where:{userId}, create:{userId, cycleId, notified80:false}, update:{cycleId, notified80:false} }); } if (percentUsed >= 80 && !(state?.notified80)) { const last = await tx.notification.findFirst({ where:{ userId, type: 'THRESHOLD_80' }, orderBy:{ createdAt:'desc' }}); if (!last || (Date.now() - last.createdAt.getTime()) > (**246060*****1000**)) { await tx.notification.create({ data: { userId, type: 'THRESHOLD_80', payload:{ currentUsage, planLimit, percentUsed, daysLeft }, cycleId }}); await tx.userBillingState.update({ where:{ userId }, data:{ notified80: true }}); } } });

Proteja rota job com JOB_SECRET (**SST** secret). Use Clerk server-side helpers para validar userId em endpoints.

### Acceptance Criteria

Notification criada quando percentUsed ≥ 80 e notified80 era false Segunda execução no mesmo cycleId não cria nova Notification Fallback 24h previne spam **GET**/**PATCH** endpoints operacionais com auth Clerk create-session aceita source param e preserva metadata para analytics Dependencies & Parallelism

Bloqueado por task-**001** para persistência real; pode ser implementado com mocks previamente. parallelizable: true (cron processor e endpoints podem ser divididos entre devs) Est. tempo: Medium — ~8 horas (reduzido por função de cálculo existente).

--- task-**003**.md

status: pending parallelizable: true blocked_by: [*task-**002***] <task_context> apps/api, CI, monitoring testing & instrumentation unit tests, integration, metrics, webhook wiring medium backend implementation </task_context>

Overview Implementar testes unitários e de integração para evaluateUsageAndNotify e endpoints de notifications; instrumentar métricas mínimas; conectar webhook/websocket Stripe para acionar avaliação quando pertinente. Entregável: testes automatizados rodando no CI e métricas básicas. Requirements (checklist) Unit tests para evaluateUsageAndNotify (cenários: <80 não cria, ≥80 cria, cycle reset) Integration tests com DB de teste (Neon local/container) cobrindo cenários 50%/82%/99% Endpoint tests (**GET**/**PATCH**) com Clerk mock Instrument metrics: notification_created, notification_clicked, checkout_started_from_notification Documentar quais eventos Stripe disparam avaliação (invoice.finalized, subscription.updated, invoice.payment_succeeded) Sub-tasks 3.1 Unit tests 3.1.1 Mock getUsageForUser e prisma; testar criação/skip 3.2 Integration tests 3.2.1 Start test DB, rodar migrations, seed, rodar evaluateForUser e verificar DB 3.3 Endpoint tests 3.3.1 Supertest com Clerk mocked session para **GET**/**PATCH** 3.4 Metrics 3.4.1 Adicionar wrapper de telemetry em packages/core e emitir counters 3.5 Stripe websocket wiring 3.5.1 Reaproveitar mapeamento customerId→userId e chamar evaluateForUser

### Implementation Details

Test runner: seguir padrão do repo (vitest/jest) Limpar DB entre testes com prisma migrate reset ou util de testes Webhook handler deve ser idempotente e logar eventos ### Acceptance Criteria Unit + integration tests passam no CI Metrics visíveis (logs ou backend metrics) Websocket handler documentado e acionando avaliação Dependencies & Parallelism

Bloqueado por task-**002** para lógica real; parte dos testes pode ser desenvolvida em paralelo com frontend. Est. tempo: Medium — ~4 horas.

--- task-**004**.md

status: pending parallelizable: true blocked_by: [*task-**002***] <task_context> apps/web, apps/agents-hub-web, packages/ui implementation frontend UI + integration Clerk + checkout medium notifications **API**, Clerk, packages/ui </task_context>

Overview Implementar UI **MVP**: NotificationsMenu (badge + dropdown), SubscriptionBanner (Assinaturas & Dashboard) e DashboardCard. Reaproveitar packages/ui (shadcn/**MUI**). **CTA** “Ver planos” marca notificação como lida e inicia create-session?source=notification_threshold80. Requirements (checklist) useNotifications hook consome **GET** /api/notifications e fornece unreadCount, notifications, markRead NotificationsMenu com badge e dropdown (resumo e **CTA**) SubscriptionBanner aparece quando percentUsed ≥ 80 com LinearProgress e **CTA**; dismiss armazena flag local (não altera cooldown) DashboardCard com percentUsed e **CTA** Ao clicar **CTA**: **PATCH** /api/notifications/:id/read e **POST** /api/checkout/create-session?source=notification_threshold80 (redirecionar para Stripe) Acessibilidade: aria-labels e foco por teclado Tests: component tests + **E2E** smoke Sub-tasks 4.0 Contracts & mocks 4.0.1 Definir types Notification em packages/core exportáveis para frontend 4.0.2 Se backend indisponível, usar **MSW**; preferir usar backend real com Clerk 4.1 NotificationsMenu 4.1.1 Badge no AppBar com unreadCount 4.1.2 Dropdown list de notificações com **CTA** 4.2 SubscriptionBanner 4.2.1 Mostrar quando percentUsed≥80; LinearProgress + texto + **CTA** 4.2.2 Dismiss via localStorage 4.3 DashboardCard 4.3.1 Card compacto com percentUsed e **CTA** 4.4 Checkout integration 4.4.1 Chamar **POST** /api/checkout/create-session?source=notification_threshold80 e redirecionar 4.4.2 Emitir client metric notification_clicked 4.5 Tests 4.5.1 Component tests (render + interaction) e **E2E** smoke

### Implementation Details

Hook exemplo (useSWR or React Query):

export function useNotifications() { const { data, mutate } = useSWR('/api/notifications', fetcher); const markRead = async (id) => { await fetch(/api/notifications/${id}/read, { method: '**PATCH**' }); mutate(); } return { notifications: data?.notifications ?? [], unreadCount: data?.unreadCount ?? 0, markRead } }

Para realtime, considerar **SSE**/websocket server->client; se não disponível, polling curto.

### Acceptance Criteria

Badge mostra unreadCount correto Banner aparece quando percentUsed≥80 **CTA** marca como lida e inicia checkout Component tests + **E2E** smoke passam Dependencies & Parallelism

Pode começar com contratos; integração final bloqueada por task-**002**. parallelizable: true. Est. tempo: Medium — ~6 horas (**MVP** minimal ≈ 1–2 horas).

--- task-**005**.md

status: pending parallelizable: false blocked_by: [*task-**002***,*task-**003***,*task-**004***] <task_context> CI/CD, staging, docs, product integration & rollout deploy, monitoring, docs, runbook low all previous tasks </task_context>

Overview Integrar e validar o **MVP** em staging, rodar testes **E2E**, documentar endpoints e runbook de rollout, instrumentar métricas e garantir feature flag para ativação controlada em produção. Requirements (checklist) Aplicar migrations em staging: npx prisma migrate deploy Deploy backend e frontend em staging Rodar integration tests (50% / 82% / 99%) e testes manuais Verificar cooldown: não criar múltiplas notificações no mesmo cycle Verificar UI: badge, banner, card e **CTA** → checkout (Stripe test) Confirmar métricas: percentUsersNotified, notificationClickThroughRate Documentar endpoints e runbook de rollback Feature flag/env: FEATURE_NOTIFICATIONS (padronizar para deploy controlado) Sub-tasks 5.0 Migration & deploy to staging 5.0.1 Rodar prisma migrate deploy em staging 5.0.2 Deploy backend + frontend branch 5.1 Smoke tests & manual checks 5.1.1 Simular usuários com usage 50/82/99 e executar evaluateForUser 5.1.2 Verificar DB e UI 5.2 Metrics & dashboards 5.2.1 Confirmar counters visíveis para product/marketing 5.3 Docs & Runbook 5.3.1 **README** com endpoints, payloads e comandos de simulação (npm run notify:run --userId=...) 5.3.2 Rollback steps: desabilitar FEATURE_NOTIFICATIONS, revert PR se necessário 5.4 Go/no-go checklist 5.4.1 Lista de checagens para product antes de habilitar em production

### Implementation Details

Use Stripe test keys em staging; checkout redirect para staging **URL**. Criar script utilitário scripts/run-evaluate-for-user.ts para testes manuais com override de usage. **SQL** de verificação: **SELECT** count(*) **FROM** *Notification* **WHERE** *userId* = '...' **AND** *cycleId* = '...'; ### Acceptance Criteria End-to-end flow validado em staging Docs e runbook prontos Feature flag disponível para ativação controlada Dependencies & Parallelism

Bloqueado até backend/frontend/testes estarem prontos; docs e feature flag podem ser preparados em paralelo. Est. tempo: Low — ~3 horas.

Observações finais rápidas

Ordem recomendada: 1) migration (task-**001**) → 2) use case + endpoints (task-**002**) → 3) testes/metrics (task-**003**) → 4) frontend (task-**004**) → 5) staging & deploy (task-**005**). CycleId: confirmar que sua função de cálculo retorna subscription.current_period_start; converter para **YYYY**-MM-DD para robustez. Race conditions: usar prisma.$transaction e checar notified80 dentro de transação; para maior segurança, faça a criação e flag update atomically. Job: usar **SST** cron para chamar **POST** /api/jobs/evaluate-usage com header X-Infra-Key=JOB_SECRET. Feature flag: FEATURE_NOTIFICATIONS para controlar rollout. Contas de teste: marcar/importadas via Pluggy com metadata isTestAccount para excluí-las das avaliações.