Perfeito — abaixo está a solução completa e final, adaptada **100**% à sua estrutura de projeto Next.js (App Router + Server Actions) que você mostrou. Inclui: overview, arquitetura, modelos de dados, interfaces e tipos TS, use case (pseudocódigo + trechos TS prontos), repositórios Prisma, Route Handlers exatos (paths do seu repo), Server Action admin opcional, componentes frontend (client/server), cron/**SST**, observability, segurança, testes e checklist de implantação. Tudo localizado nos caminhos que você forneceu.

Resumo executivo (uma frase)

- Implementar notificações in‑app THRESHOLD_80 integradas ao pipeline existente (Stripe sync, checkout), rodando via Route Handler acionado por **SST** cron, com use case em subscription/_usecases e UI em shared/_components/ui + subscription/_components.

1 — Overview & Scope

- Goal: notificar usuários quando atingirem ≥80% do limite do plano (badge, dropdown, banner, card) com cooldown por ciclo e fallback 24h; **CTA** inicia checkout Stripe existente.
- Escopo incluído: criação de Notification e UserBillingState (Prisma), use case EvaluateUsageAndNotify, route **POST** /api/jobs/evaluate-usage (cron), endpoints **GET**/**PATCH** /api/notifications, UI NotificationsMenu + SubscriptionBanner + DashboardCard, integração com create-stripe-checkout, testes básicos.
- Excluído: e‑mail/push, features promocionais complexas, prorrata complexa.
- Apps/pastas impactadas:
    - app/api/jobs/evaluate-usage/route.ts
    - app/api/notifications/route.ts
    - app/api/notifications/[id]/route.ts
    - subscription/_usecases/evaluate-usage-and-notify/index.ts
    - subscription/_db/notification-repo.ts
    - subscription/_db/user-billing-state-repo.ts
    - subscription/_usecases/providers/stripe-usage-provider.ts
    - shared/_components/ui/notifications-menu.tsx
    - subscription/_components/subscription-banner.tsx
    - app/api/webhooks/stripe/route.ts (augmentação to clear flags)
    - prisma schema + migration

2 — Data model (Prisma) Adicione ao seu schema.prisma (onde já mantém modelos):

model Notification { id String @id @default(uuid()) userId String @index type String payload Json read Boolean @default(false) createdAt DateTime @default(now()) cycleId String? @index }

model UserBillingState { userId String @id cycleId String? notified80 Boolean @default(false) updatedAt DateTime @updatedAt }

Rode: prisma migrate dev --name add_notifications_and_billing_state (em staging primeiro).

3 — Types & Interfaces (TypeScript) Coloque no mesmo diretório do usecase (subscription/_usecases/types.ts):

export type BillingUsageRecord = { userId: string; subscriptionId: string; currentUsage: number; planLimit: number; periodStart: number; // unix seconds daysLeft?: number; suggestedPlanId?: string; };

export type Threshold80Payload = { currentUsage: number; planLimit: number; percentUsed: number; daysLeft?: number; suggestedPlanId?: string; };

export interface INotificationRepository { create(notification: { userId: string; type: string; payload: object; cycleId?: string; }): Promise<{ id: string }>; listByUser(userId: string, opts?: { limit?: number; offset?: number }): Promise<any[]>; markRead(id: string, userId: string): Promise; existsRecent(userId: string, type: string, withinMs: number): Promise; countUnread(userId: string): Promise; }

export interface IUserBillingStateRepository { getByUser(userId: string): Promise<{ userId: string; cycleId?: string; notified80: boolean } | null>; upsertState(userId: string, cycleId?: string): Promise; setNotified80(userId: string, value: boolean): Promise; }

export interface IBillingUsageProvider { getUsageForActiveSubscriptions(opts?: { page?: number; pageSize?: number }): AsyncIterable | Promise<BillingUsageRecord[]>; }

4 — Use Case (Application Layer) Local: subscription/_usecases/evaluate-usage-and-notify/index.ts

Named export class EvaluateUsageAndNotifyUseCase with execute(opts).

Essencial (trecho pronto, adaptável):

import pLimit from 'p-limit'; import { BillingUsageRecord, INotificationRepository, IUserBillingStateRepository, IBillingUsageProvider } from '../types';

export class EvaluateUsageAndNotifyUseCase { constructor( private notificationRepo: INotificationRepository, private stateRepo: IUserBillingStateRepository, private billingProvider: IBillingUsageProvider, private opts: { concurrency?: number } = { concurrency: 5 } ) {}

public async execute({ dryRun = false, pageSize = **200** } : { dryRun?: boolean; pageSize?: number } = {}) { const limit = pLimit(this.opts.concurrency ?? 5); const summary = { created: 0, skipped: 0, errors: 0, processed: 0 }; // If billingProvider yields async iterable const records = await this.billingProvider.getUsageForActiveSubscriptions({ pageSize }); const iterate = async (recList: BillingUsageRecord[] | AsyncIterable) => { if (Symbol.asyncIterator in Object(recList)) { for await (const r of recList as AsyncIterable) { await limit(() => this.processRecord(r, dryRun, summary)); } } else { for (const r of (recList as BillingUsageRecord[])) { await limit(() => this.processRecord(r, dryRun, summary)); } } }; await iterate(records); return summary; }

private async processRecord(r: BillingUsageRecord, dryRun: boolean, summary: any) { try { summary.processed++; const percentUsed = Math.floor((r.currentUsage / Math.max(1, r.planLimit)) * **100**); const cycleId = `${r.subscriptionId}_${r.periodStart}`; let state = await this.stateRepo.getByUser(r.userId); if (!state || state.cycleId !== cycleId) { await this.stateRepo.upsertState(r.userId, cycleId); state = await this.stateRepo.getByUser(r.userId); } if (percentUsed >= 80 && !state.notified80) { const recent = await this.notificationRepo.existsRecent(r.userId, 'THRESHOLD_80', 24 * 60 * 60 * **1000**); if (!recent) { if (!dryRun) { await this.notificationRepo.create({ userId: r.userId, type: 'THRESHOLD_80', payload: { currentUsage: r.currentUsage, planLimit: r.planLimit, percentUsed, daysLeft: r.daysLeft, suggestedPlanId: r.suggestedPlanId }, cycleId }); await this.stateRepo.setNotified80(r.userId, true); } summary.created++; } else { summary.skipped++; } } else { summary.skipped++; } } catch (err) { summary.errors++; // prefer logging, not throwing console.error('processRecord error', err); } } }

Notas:

- Use p-limit para limitar concorrência.
- Processo idempotente via stateRepo and existsRecent; para evitar race conditions, ideal usar transaction in repo.create + setNotified80.

5 — Repositories (Prisma) — Resources Layer Local: subscription/_db/notification-repo.ts

Trechos:

import { prisma } from '../../_lib/prisma'; // seu client import { INotificationRepository } from '../types';

export class NotificationRepoPrisma implements INotificationRepository { async create({ userId, type, payload, cycleId }: any) { const rec = await prisma.notification.create({ data: { userId, type, payload, cycleId } }); return { id: rec.id }; } async listByUser(userId: string, { limit = 20, offset = 0 } = {}) { return prisma.notification.findMany({ where: { userId }, orderBy: [{ read: 'asc' }, { createdAt: 'desc' }], take: limit, skip: offset }); } async markRead(id: string, userId: string) { // ensure only owner can mark as read await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } }); } async existsRecent(userId: string, type: string, withinMs: number) { const since = new Date(Date.now() - withinMs); const rec = await prisma.notification.findFirst({ where: { userId, type, createdAt: { gte: since } }, select: { id: true } }); return !!rec; } async countUnread(userId: string) { return prisma.notification.count({ where: { userId, read: false } }); } }

Local: subscription/_db/user-billing-state-repo.ts

import { prisma } from '../../_lib/prisma'; import { IUserBillingStateRepository } from '../types';

export class UserBillingStateRepoPrisma implements IUserBillingStateRepository { async getByUser(userId: string) { return prisma.userBillingState.findUnique({ where: { userId } }); } async upsertState(userId: string, cycleId?: string) { await prisma.userBillingState.upsert({ where: { userId }, create: { userId, cycleId, notified80: false }, update: { cycleId, notified80: false } }); } async setNotified80(userId: string, value: boolean) { await prisma.userBillingState.update({ where: { userId }, data: { notified80: value } }); } }

6 — Billing Usage Provider (adapter) Use/adapter existing logic in subscription/_usecases/providers/stripe-usage-provider.ts

- If já tem função em subscription/_usecases/_helpers (ex: resolve-clerk-user-from-stripe or sync), adapte e exponha getUsageForActiveSubscriptions which returns async iterable or paginated array. Deve retornar BillingUsageRecord shape.

Exemplo simples (paginated array):

export class StripeUsageProvider implements IBillingUsageProvider { async getUsageForActiveSubscriptions({ page = 1, pageSize = **200** } = {}) { // Reaproveite sua função que calcula usage; pagine pelos seus registros (ex: subscriptions table) // Return array or implement AsyncIterable for large scale. } }

7 — Route Handlers (Drivers) — locais e trechos

- Job route (cron) Path: app/api/jobs/evaluate-usage/route.ts

import { NextResponse } from 'next/server'; import { EvaluateUsageAndNotifyUseCase } from '@/subscription/_usecases/evaluate-usage-and-notify'; import { NotificationRepoPrisma } from '@/subscription/_db/notification-repo'; import { UserBillingStateRepoPrisma } from '@/subscription/_db/user-billing-state-repo'; import { StripeUsageProvider } from '@/subscription/_usecases/providers/stripe-usage-provider';

export async function **POST**(req: Request) { const jobSecret = process.env.JOB_SECRET; const header = req.headers.get('x-infra-key'); if (!jobSecret || header !== jobSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: **401** }); const body = await req.json().catch(() => ({})); const dryRun = !!body.dryRun; const notificationRepo = new NotificationRepoPrisma(); const stateRepo = new UserBillingStateRepoPrisma(); const billingProvider = new StripeUsageProvider(); const useCase = new EvaluateUsageAndNotifyUseCase(notificationRepo, stateRepo, billingProvider, { concurrency: 6 }); const result = await useCase.execute({ dryRun, pageSize: body.pageSize || **200** }); return NextResponse.json({ result }); }

Proteja rota com X-Infra-Key igual ao JOB_SECRET configurado no **SST**.

- **GET** notifications Path: app/api/notifications/route.ts

import { NextResponse } from 'next/server'; import { getSession } from '...'; // adapte para Clerk/NextAuth import { NotificationRepoPrisma } from '@/subscription/_db/notification-repo';

export async function **GET**(req: Request) { const session = await getSession({ req }); // adapte if (!session?.user?.id) return NextResponse.json({}, { status: **401** }); const userId = session.user.id; const url = new **URL**(req.url); const limit = Number(url.searchParams.get('limit') ?? 20); const offset = Number(url.searchParams.get('offset') ?? 0); const repo = new NotificationRepoPrisma(); const data = await repo.listByUser(userId, { limit, offset }); const unreadCount = await repo.countUnread(userId); return NextResponse.json({ notifications: data, unreadCount }); }

- **PATCH** mark read Path: app/api/notifications/[id]/route.ts

import { NextResponse } from 'next/server'; import { getSession } from '...'; import { NotificationRepoPrisma } from '@/subscription/_db/notification-repo';

export async function **PATCH**(req: Request, { params }: { params: { id: string } }) { const session = await getSession({ req }); if (!session?.user?.id) return NextResponse.json({}, { status: **401** }); const userId = session.user.id; const id = params.id; const repo = new NotificationRepoPrisma(); await repo.markRead(id, userId); return NextResponse.json({ ok: true }); }

Adapte getSession ao seu provedor auth (Clerk/NextAuth).

8 — Webhook Stripe: limpar flags Local já existe: app/api/webhooks/stripe/route.ts

Após sincronizar subscription, adicionar:

// após update subscription logic await new UserBillingStateRepoPrisma().setNotified80(userId, false); // opcional: marcar notificações do cycle como read await prisma.notification.updateMany({ where: { userId, cycleId: currentCycleId }, data: { read: true } });

Isso garante que upgrade limpa notificação e permite novas notificações quando apropriado.

9 — Frontend components

- NotificationsMenu (client) Local sugerido: shared/_components/ui/notifications-menu.tsx

- Client component (use 'use client')
- Usa TanStack Query para **GET** /api/notifications
- Badge utiliza shared/_components/ui/badge.tsx
- Dropdown list: map notifications with **CTA**
- On item click:
    - optimistically **PATCH** /api/notifications/:id/read
    - call existing server action create-stripe-checkout with suggestedPlanId (reuse subscription/_actions/create-stripe-checkout/index.ts)
    - emit analytic event via your telemetry

Trecho:

'use client'; import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; import { useRouter } from 'next/navigation'; export function NotificationsMenu() { const qc = useQueryClient(); const { data } = useQuery(['notifications'], () => fetch('/api/notifications').then(r => r.json())); const markRead = useMutation((id: string) => fetch(`/api/notifications/${id}`, { method: '**PATCH**' }).then(r => r.json()), { onSuccess: () => qc.invalidateQueries(['notifications']) }); const items = data?.notifications ?? []; return (

<Badge count={data?.unreadCount ?? 0} />{items.map(n => (

{n.type === 'THRESHOLD_80' ? `Uso: ${n.payload.percentUsed}%` : n.type}

{/* timestamp */}

<button onClick={async () => { markRead.mutate(n.id); // start checkout: call server action or redirect // if suggestedPlanId exists, call create-stripe-checkout with that plan }}>Ver planos))}); }

- SubscriptionBanner (server component preferred) Local: subscription/_components/subscription-banner.tsx

- Server component that, ao render, busca percentUsed via a mesma IBillingUsageProvider ou chama internal route
- Se percentUsed >= 80 render Alert + LinearProgress + **CTA** *Ver planos*
- Dismiss: client-side localStorage via small client component wrapper

Trecho (simplified):

import { getSession } from '...'; import { StripeUsageProvider } from '@/subscription/_usecases/providers/stripe-usage-provider';

export default async function SubscriptionBanner() { const session = await getSession(); if (!session?.user?.id) return null; const provider = new StripeUsageProvider(); const recs = await provider.getUsageForActiveSubscriptionsForUser(session.user.id); const percentUsed = recs?.percentUsed ?? 0; if (percentUsed < 80) return null; return (

Você usou {percentUsed}% do limite do plano

); }

Notes: if provider **API** lacks *by user* method, create helper to fetch only current user's usage.

10 — Observability & Metrics Instrumente:

- notifications_created (tags: type)
- notifications_skipped
- notification_clicks
- checkout_sessions_started_from_notification
- checkout_success_from_notification
- job_run_duration and job_run_errors

11 — Security

- Job route: header X-Infra-Key compared to JOB_SECRET (env). Store JOB_SECRET in packages/infra secrets and **SST**.
- User routes: validate session from your auth provider (Clerk/NextAuth).
- Do not expose other users' notifications.
- Mask **PII** in logs.

12 — Concurrency & atomicity

- Prefer transactional creation: no duplicate notifications if two job runs overlap. Implement transaction in NotificationRepoPrisma.create (use prisma.$transaction):
    - Check current UserBillingState.notified80 inside transaction; if false then create notification + update state to true.
- Batched processing with p-limit to avoid DB spikes.
- If serverless lambda timeouts likely, process smaller pages or move heavy job to worker lambda importing the same use case from shared package.

13 — Tests

- Unit tests (Jest/vi) for EvaluateUsageAndNotifyUseCase:
    - percent < 80 -> no create
    - percent >=80 & not notified -> create & set flag
    - cycle change resets flagged
    - duplicate within 24h skipped
- Integration tests for route handlers with test Prisma DB (use sqlite in memory or test Postgres).
- **E2E**: simulate user with usage 82% to verify end-to-end (job -> DB -> UI -> **CTA** -> checkout flow -> webhook -> flags cleared).

14 — Cron (**SST**) configuration

- Create **SST** Cron to **POST** [https://{**HOST**}/api/jobs/evaluate-usage](https://{**HOST**}/api/jobs/evaluate-usage) with header X-Infra-Key: process.env.JOB_SECRET
- In staging test one **POST** manually with dryRun true and small pageSize to validate.

15 — Deployment & rollout

- Feature flag: FEATURE_NOTIFICATIONS (env). Default off in prod until validated.
- Flow:
    1. Deploy schema + code to staging.
    2. Run migration and run one manual job.
    3. Verify DB notifications and UI.
    4. Enable feature for small % (use flag) then full rollout.
- Monitor metrics for first 72h.

16 — Checklist pronto para executar (passos mínimos)

## Add Prisma models + migrate.

## Implement NotificationRepoPrisma & UserBillingStateRepoPrisma. ## Implement StripeUsageProvider adapter. ## Implement EvaluateUsageAndNotifyUseCase. ## Implement app/api/jobs/evaluate-usage/route.ts. ## Implement app/api/notifications/route.ts and app/api/notifications/[id]/route.ts. ## Update app/api/webhooks/stripe/route.ts to clear flags post-upgrade. ## Implement NotificationsMenu (client) and SubscriptionBanner (server). ## Instrument metrics. ## Configure SST cron with JOB_SECRET. ## Tests (unit + integration). ## Deploy to staging, smoke test, then rollout.

17 — Trade-offs e decisões justificadas

- Route Handler (**HTTP** job) chosen por simplicidade de infra e reutilização do Next runtime. Se scale for grande, mover para worker importando use case é recomendado.
- Banner dismiss localStorage (UX mais simples) — server-side persistência opcional futura.
- Notification cooldown: both per-cycle flag (notified80) and existsRecent(24h) fallback — evita duplicatas em falhas.
- Use case isolado e testável (arquitetura hexagonal respeitada).