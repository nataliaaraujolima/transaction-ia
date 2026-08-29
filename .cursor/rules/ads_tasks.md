# Ads MVP — Implementation Tasks

Formato alinhado ao PRD (`ads_feature.md`): cada task tem **O que**, **Por que**, **Como**, **Arquivos** (caminho exato) e **Requisitos** numerados.

---

## Decisões travadas (defaults do PRD)

| Parâmetro | Valor | Fonte no código |
| --- | --- | --- |
| Limite mensal | `10` | `app/subscription/_constants/subscription-limits.ts` → `BASIC_MONTHLY_TRANSACTION_LIMIT` |
| Contagem | mês civil | `app/transaction/_db/get-current-moth-transactions/index.ts` |
| Plano | `basic` \| `premium` | `app/transaction/clerk-premium-plan/index.ts` → `ClerkPremiumPlan()` |
| Zona de alerta | `[8, 9]` | env `ADS_ALERT_ZONE_MIN` / `ADS_ALERT_ZONE_MAX` |
| Cap | 1 impressão/dia | env `ADS_FREQUENCY_CAP_PER_DAY` |
| Dedup | `(userId, slotId, sessionId)` ~30 min | env `ADS_DEDUP_WINDOW_MINUTES` |
| Rollout | flag + % | `FEATURE_ADS` + `ADS_ROLLOUT_PERCENT` |
| CTA | “Fazer upgrade — desbloqueie transações ilimitadas” | link para `/subscription` |
| Estado por usuário | `userId` Clerk (sem tabela `User`) | igual `UserBillingState` / `Notification` |

**Já feito no repo (não refazer):**

- Models `UserAdState`, `AdImpression`, `AdEventError` em `prisma/schema.prisma`
- Vars ADS no `.env`

**Errado hoje:** existe `ads-config.ts` vazio na **raiz** do projeto. O arquivo correto é `app/ads/_constants/ads-config.ts` — apagar o da raiz ao criar o certo.

---

## Mapa final do módulo

```text
app/ads/
  _constants/
    ads-config.ts
  _helpers/
    is-ads-feature-enabled.ts
    is-user-in-rollout.ts
    is-ad-eligible.ts
    sanitize-campaign-kv.ts
    dedup-key.ts
  _db/
    user-ad-state.ts
    ad-impression.ts
  _usecases/
    resolve-ad-eligibility/index.ts
    record-impression/index.ts
  _actions/
    get-ad-eligibility/index.ts
    get-ad-eligibility/schema.ts
    record-ad-impression/index.ts
    record-ad-impression/schema.ts
    dismiss-ad/index.ts
    dismiss-ad/schema.ts
  _components/
    ad-banner.tsx
  doc/
    runbook.md

app/api/ads/impression/route.ts
prisma/seed/ads_seed.ts
vitest.config.ts
.env.example                    # documentar vars ADS (já existem no .env)
types/googletag.d.ts            # só se @types/google-publisher-tag não cobrir Window
```

Padrão de action (igual `app/transaction/_actions/upsert-transaction/`):

1. `"use server"`
2. `auth()` → Unauthorized
3. `schema.parse(...)` (Zod em `schema.ts`, não `shema.ts`)
4. lógica / use case
5. retorno tipado

---

## Dependências entre tasks

```text
001 Setup ──┐
            ├──► 003 Elegibilidade ──► 005 AdBanner ──┐
002 Prisma ─┤              │                          ├──► 007 Rollout/QA
            └──► 004 Impression API ──► 006 Testes ───┘
```

| Task | Título | Esforço | Status |
| --- | --- | --- | --- |
| 001 | Setup: libs, env, constantes, tipos | ~1h | pendente (`ads-config` na raiz está errado) |
| 002 | Seed + migration (schema já existe) | ~30–45min | schema ✅; falta seed/migration |
| 003 | Gatilho de elegibilidade | ~2–3h | pendente |
| 004 | Impression API + dismiss | ~4–5h | pendente |
| 005 | AdBanner + páginas | ~4–6h | pendente |
| 006 | Testes Vitest | ~3–4h | pendente |
| 007 | Flag, métricas, QA, rollout | ~2–3h | pendente |

**Estimativa MVP:** ~2–3 dias (1 dev). 001 e 002 paralelizáveis.

---

# task-001 — Setup: libs, env, constantes, tipos GPT

### O que

Preparar o módulo `app/ads` com constantes tipadas, helpers de feature flag/rollout, env documentado e runner de testes. **Não** carregar GPT no layout global.

### Por que

Toda elegibilidade, banner e impression dependem desses valores (zona 8–9, cap, slot, allowlist). Sem isso, as tasks seguintes inventam magic numbers.

### Como

1. Criar pasta `app/ads/_constants/` e `_helpers/`.
2. Mover a lógica de config para `app/ads/_constants/ads-config.ts` (apagar `ads-config.ts` da raiz).
3. Instalar tipagem GPT + Vitest.
4. Documentar env em `.env.example` (valores já estão no `.env`).

### Arquivos a criar / alterar

| Ação | Caminho |
| --- | --- |
| **Apagar** | `ads-config.ts` (raiz) |
| **Criar** | `app/ads/_constants/ads-config.ts` |
| **Criar** | `app/ads/_helpers/is-ads-feature-enabled.ts` |
| **Criar** | `app/ads/_helpers/is-user-in-rollout.ts` |
| **Criar** | `vitest.config.ts` |
| **Criar** (opcional) | `types/googletag.d.ts` |
| **Alterar** | `package.json` — deps + scripts `test` / `test:watch` |
| **Alterar** | `.env.example` — bloco ADS |
| **Não tocar** | `app/layout.tsx` (não importar GPT aqui) |

### Conteúdo esperado de `app/ads/_constants/ads-config.ts`

Exportar constantes (lendo env com fallback):

```ts
// caminhos e nomes exatos a exportar
export const ADS_ALERT_ZONE = {
  min: Number(process.env.ADS_ALERT_ZONE_MIN ?? 8),
  max: Number(process.env.ADS_ALERT_ZONE_MAX ?? 9),
};

export const ADS_FREQUENCY_CAP_PER_DAY = Number(
  process.env.ADS_FREQUENCY_CAP_PER_DAY ?? 1
);

export const ADS_DEDUP_WINDOW_MINUTES = Number(
  process.env.ADS_DEDUP_WINDOW_MINUTES ?? 30
);

export const ADS_ROLLOUT_PERCENT = Number(
  process.env.ADS_ROLLOUT_PERCENT ?? 1
);

export const ADS_SLOT = {
  id: process.env.NEXT_PUBLIC_GAM_SLOT_ID ?? "dashboard_alert",
  networkCode: process.env.NEXT_PUBLIC_GAM_NETWORK_CODE ?? "",
  adUnitPath: process.env.NEXT_PUBLIC_GAM_AD_UNIT_PATH ?? "",
};

export const ADS_SIZES = {
  mobile: [320, 50] as const,
  desktop: [300, 250] as const,
};

/** Keys permitidas em campaign_kv — nunca userId/email/nome */
export const CAMPAIGN_KV_ALLOWLIST = [
  "plan",
  "zone",
  "txn_bucket",
] as const;

export const GPT_SCRIPT_URL =
  "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
```

### Requisitos funcionais

1.1 Instalar (dev): `@types/google-publisher-tag`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`.  
1.2 Em `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.  
1.3 `isAdsFeatureEnabled()` em `app/ads/_helpers/is-ads-feature-enabled.ts` lê `FEATURE_ADS` (server) — default `false`.  
1.4 `isUserInRollout(userId)` em `app/ads/_helpers/is-user-in-rollout.ts`: hash estável de `userId`, depois `% 100 < ADS_ROLLOUT_PERCENT`.  
1.5 `.env.example` documenta as mesmas keys já presentes no `.env` (FEATURE_ADS, ADS_*, NEXT_PUBLIC_GAM_*).  
1.6 **Não** instalar: pacote npm do GPT, Upstash, Mixpanel, `@google-ads`. GPT entra só via CDN + `next/script` **dentro do AdBanner** (task-005), quando `eligible === true`.

### Critérios de aceitação

- [ ] `npm test` / `pnpm test` roda (suite vazia ok)
- [ ] Não existe mais `ads-config.ts` na raiz
- [ ] Existe `app/ads/_constants/ads-config.ts` com zona, cap, dedup, slot, sizes, allowlist
- [ ] Env ADS documentado em `.env.example`
- [ ] `app/layout.tsx` sem script GPT

---

# task-002 — Schema Prisma + migration + seed

### O que

Garantir migration aplicada e seed de ads. Os **models já estão** em `prisma/schema.prisma` — não recriar.

### Por que

Impression API e dismiss precisam persistir `UserAdState` / `AdImpression` / `AdEventError`.

### Como

1. Conferir models no schema (já ok).
2. Gerar/aplicar migration se ainda não rodou.
3. Criar seed no padrão de `prisma/seed/notification_seed.ts`.

### Arquivos

| Ação | Caminho |
| --- | --- |
| **Já existe** | `prisma/schema.prisma` → models `UserAdState`, `AdImpression`, `AdEventError` |
| **Criar** | `prisma/seed/ads_seed.ts` |
| **Alterar** (opcional) | `package.json` → `"prisma": { "seed": "..." }` se quiser seed único ou script separado |
| **Rodar** | `npx prisma migrate dev --name add_ads_impressions_and_user_ad_state` (se migration ainda não existir) |
| **Rodar** | `npx prisma generate` |

### Requisitos funcionais

2.1 Confirmar no schema: `dedupKey String @unique` em `AdImpression`; índices `[userId, createdAt]` e `[userId, slotId, sessionId]`.  
2.2 **Não** criar tabela `User` nem FK para User.  
2.3 Seed `prisma/seed/ads_seed.ts`: 1 `UserAdState` + 1 `AdImpression` para um `userId` de teste (ex.: `user_naruto`), com `campaignKv` só allowlist (`plan`, `zone`, `txn_bucket`) — **sem** email/nome/userId no JSON.  
2.4 `prisma generate` sem erro.

### Critérios de aceitação

- [ ] Migration aplicada no DB local/staging
- [ ] Client Prisma gera os 3 models
- [ ] Seed insere sem PII no `campaignKv`

---

# task-003 — Gatilho de elegibilidade (server-side)

### O que

Decidir no servidor se o usuário pode ver ads e devolver `adConfig` sem PII. Espelha a feature “Gatilho de elegibilidade” do PRD.

### Por que

Evita carregar GPT para premium / fora da zona / flag off, e centraliza a regra numa função testável.

### Como

1. Função pura `isAdEligible(input)` (unit-testável, sem I/O).
2. Use case monta input com Clerk + count mensal + `UserAdState`.
3. Server Action expõe isso para as páginas RSC.

### Arquivos a criar

| Caminho | Responsabilidade |
| --- | --- |
| `app/ads/_helpers/is-ad-eligible.ts` | regra pura: recebe plan, count, flag, rollout, dismissedUntil, viewsToday → `{ eligible, reason }` |
| `app/ads/_usecases/resolve-ad-eligibility/index.ts` | orquestra: `auth` data, `ClerkPremiumPlan`, `getCurrentMonthTransactions`, lê `UserAdState`, chama helper, monta `adConfig` |
| `app/ads/_actions/get-ad-eligibility/schema.ts` | Zod (vazio ou `{ pathname?: string }`) |
| `app/ads/_actions/get-ad-eligibility/index.ts` | `"use server"` → chama use case |
| `app/ads/_db/user-ad-state.ts` | `findByUserId`, (depois upsert na 004) |

### Reusar (não duplicar)

- `ClerkPremiumPlan` → `app/transaction/clerk-premium-plan/index.ts`
- `getCurrentMonthTransactions` → `app/transaction/_db/get-current-moth-transactions/index.ts`
- `BASIC_MONTHLY_TRANSACTION_LIMIT` → `app/subscription/_constants/subscription-limits.ts`
- Constantes → `app/ads/_constants/ads-config.ts`
- Flag/rollout → helpers da task-001

### Regra (todos AND)

```text
FEATURE_ADS === true
AND isUserInRollout(userId)
AND plan !== "premium"
AND currentMonthTransactions ∈ [ADS_ALERT_ZONE.min, ADS_ALERT_ZONE.max]   // 8 e 9
AND (dismissedUntil == null OR now > dismissedUntil)
AND viewsHoje < ADS_FREQUENCY_CAP_PER_DAY
```

### Retorno da action

```ts
type GetAdEligibilityResult =
  | {
      eligible: true;
      adConfig: {
        slotId: string;
        adUnitPath: string;
        sizes: { mobile: readonly [number, number]; desktop: readonly [number, number] };
        campaignKv: { plan: "basic"; zone: "alert"; txn_bucket: "8-9" };
      };
      reason: "alert_zone";
    }
  | {
      eligible: false;
      adConfig: null;
      reason:
        | "feature_off"
        | "not_in_rollout"
        | "premium"
        | "below_zone"
        | "above_zone"
        | "dismissed"
        | "frequency_capped"
        | "unauthorized";
    };
```

### Requisitos funcionais

3.1 Action `getAdEligibility` em `app/ads/_actions/get-ad-eligibility/index.ts` com `auth()` + `schema.parse`.  
3.2 Premium → sempre `eligible: false`, **sem** `adConfig`.  
3.3 Count 7 → false (`below_zone`); 8 e 9 → true (se flag + rollout + basic); 10 → false (`above_zone`).  
3.4 `campaignKv` só allowlist — nunca userId/email/nome.  
3.5 Se `UserAdState` ainda não existir (task-002 seed/migration), tratar `dismissedUntil`/`adViewsCount` como null/0.

### Critérios de aceitação

- [ ] Premium nunca eligible
- [ ] 7 txs false; 8–9 true (basic + flag + rollout); 10 false
- [ ] Flag off → false e reason `feature_off`

---

# task-004 — POST /api/ads/impression + actions Zod

### O que

Endpoint e actions para gravar impressão visível (idempotente) e dismiss de 1 dia. Espelha a feature “Endpoint /api/ads/impression” do PRD.

### Por que

Métricas internas confiáveis sem inflar contagem; CTA dismiss sem spam.

### Como

1. Helpers de sanitize + dedup key.
2. Use case único usado pela action **e** pelo Route Handler.
3. Transação Prisma: insert impression + upsert state.
4. Action separada para dismiss.

### Arquivos a criar

| Caminho | Responsabilidade |
| --- | --- |
| `app/ads/_helpers/sanitize-campaign-kv.ts` | filtra keys pela allowlist; drop PII |
| `app/ads/_helpers/dedup-key.ts` | `buildDedupKey({ userId, slotId, sessionId, dayUTC })` → string |
| `app/ads/_db/ad-impression.ts` | create, countRecent, findByDedupKey |
| `app/ads/_db/user-ad-state.ts` | upsert após impressão / dismiss (completar) |
| `app/ads/_usecases/record-impression/index.ts` | validação elegibilidade + tx |
| `app/ads/_actions/record-ad-impression/schema.ts` | Zod abaixo |
| `app/ads/_actions/record-ad-impression/index.ts` | server action |
| `app/ads/_actions/dismiss-ad/schema.ts` | Zod (pode ser `z.object({})`) |
| `app/ads/_actions/dismiss-ad/index.ts` | set `dismissedUntil = now + 1 day` |
| `app/api/ads/impression/route.ts` | `POST` → mesmo use case; status HTTP |

### Schema Zod (`record-ad-impression/schema.ts`)

```ts
import { z } from "zod";

export const recordAdImpressionSchema = z.object({
  slotId: z.string().trim().min(1).max(64),
  sessionId: z.string().trim().min(1).max(128),
  adUnitId: z.string().trim().max(128).optional(),
  campaignKv: z.record(z.string(), z.string()).optional(),
});

export type RecordAdImpressionSchema = z.infer<typeof recordAdImpressionSchema>;
```

### Fluxo do use case

1. `auth()` → sem sessão: action throw / route **401**.
2. Revalidar elegibilidade no server (não confiar no client) → premium/fora zona → **403**, não grava.
3. `sanitizeCampaignKv(campaignKv)`.
4. `dedupKey = \`${userId}:${slotId}:${sessionId}:${dayUTC}\`` (ou janela `ADS_DEDUP_WINDOW_MINUTES`).
5. Se `dedupKey` já existe → **200** `{ ok: true, deduplicated: true, reason: "duplicate" }` (não 500).
6. Senão, `prisma.$transaction`:
   - `AdImpression.create`
   - `UserAdState.upsert`: `adSeen=true`, `adSeenAt` se null, `adViewsCount++`, `adLastViewSessionId`, `adLastSlotId`, `adCampaignKv`
7. Rate-limit barato: se count de impressões do user nos últimos 60s > N → **429**.
8. Falha de persistência → `AdEventError.create` (payload mascarado) + erro controlado.

### Requisitos funcionais

4.1 Único Route Handler novo de ads: `app/api/ads/impression/route.ts` (além do webhook Stripe já existente).  
4.2 Action e route compartilham `record-impression` use case.  
4.3 Duplicata por `dedupKey` → 200 deduplicated.  
4.4 `dismiss-ad` grava `dismissedUntil` (+1 dia) em `UserAdState`.  
4.5 Nunca persistir email/nome/userId dentro de `campaignKv`.

### Critérios de aceitação

- [ ] 1ª call → **201**
- [ ] 2ª mesmo key → **200** dedup
- [ ] Premium → **403**
- [ ] KV com `email` é stripped
- [ ] Dismiss impede elegibilidade até o dia seguinte

---

# task-005 — AdBanner + dashboard / transações

### O que

Componente client `AdBanner` + integração nas páginas. Espelha a feature “AdBanner component” do PRD.

### Por que

Usuário free na zona 8–9 vê upgrade discreto; premium nunca vê; impressão só quando visível.

### Como

1. Página RSC chama `getAdEligibility`.
2. Se `eligible === false`, **não** monta o client component (zero GPT).
3. Se true, renderiza `AdBanner` com `adConfig`; GPT via `next/script` só no viewport.

### Arquivos

| Ação | Caminho |
| --- | --- |
| **Criar** | `app/ads/_components/ad-banner.tsx` (`"use client"`) |
| **Alterar** | `app/dashboard/page.tsx` — banner no header/sidebar discreto (**não** em cima dos cards de saldo) |
| **Alterar** | `app/transaction/page.tsx` — mesmo padrão discreto |
| **Não alterar** | `app/layout.tsx` (sem GPT global) |

### Comportamento do `AdBanner`

5.1 Recebe `adConfig` do server (props).  
5.2 `IntersectionObserver` threshold ~0.5 — GPT/`googletag` só quando entra no viewport.  
5.3 Placeholder: Card shadcn até `slotRenderEnded`.  
5.4 Impressão: só com `impressionViewable` **e** observer visível → `POST /api/ads/impression`.  
5.5 Lock client: 1 call / sessão / slot via `sessionStorage`.  
5.6 Retry com backoff no POST; falha **não** quebra dashboard.  
5.7 Botão X dismiss → action `dismiss-ad` + some da UI; `aria-label`.  
5.8 CTA texto: “Fazer upgrade — desbloqueie transações ilimitadas” → `Link`/`router` para `/subscription` (checkout Stripe já existe em `create-stripe-checkout`).  
5.9 Tamanhos: mobile 320×50 / desktop 300×250 (fluid).  
5.10 A11y: teclado, contraste, aria no CTA e no fechar.

### Critérios de aceitação

- [ ] Basic com 8–9 txs vê banner
- [ ] Premium nunca vê
- [ ] Dismiss some até o dia seguinte
- [ ] Após upgrade premium, banner some no reload
- [ ] Sem GPT em `layout.tsx`

---

# task-006 — Testes (Vitest)

### O que

Cobrir regra de elegibilidade, sanitize, dedup, impression e smoke do banner. Sem Playwright no MVP.

### Por que

Zona 8–9 vs premium/flag é fácil de regredir; impressão duplicada não pode inflar métrica.

### Como

Runner da task-001. Unitário nos helpers; integração no use case (DB de teste ou mocks Prisma); componente com mocks.

### Arquivos a criar (sugestão)

| Caminho | Cobre |
| --- | --- |
| `app/ads/_helpers/is-ad-eligible.test.ts` | matriz count × plan × flag × rollout × dismissed |
| `app/ads/_helpers/sanitize-campaign-kv.test.ts` | drop PII |
| `app/ads/_helpers/dedup-key.test.ts` | key estável |
| `app/ads/_helpers/is-user-in-rollout.test.ts` | determinístico |
| `app/ads/_usecases/record-impression/record-impression.test.ts` | 1ª grava / 2ª dedup / premium 403 |
| `app/ads/_components/ad-banner.test.tsx` | eligible false → sem googletag; off-screen → sem POST |

### Requisitos funcionais

6.1 Casos obrigatórios `is-ad-eligible`: count `0, 7, 8, 9, 10` × `basic/premium` × flag on/off × rollout × dismissed.  
6.2 Integração: 1ª impressão incrementa `adViewsCount`; 2ª mesma key não incrementa; premium não grava.  
6.3 Componente: `eligible false` → nenhum `googletag`; observer não visível → nenhum POST.  
6.4 Sem E2E Playwright neste MVP (fica task-010).

### Critérios de aceitação

- [ ] `npm test` verde
- [ ] Casos 8/9 vs premium cobertos

---

# task-007 — Feature flag, métricas internas, QA, rollout

### O que

Ligar ads com segurança: flag off por default, queries internas, runbook e checklist de QA. Espelha “Plano de rollout” do PRD.

### Por que

Rollout 1% → 5% → 100% com rollback instantâneo (`FEATURE_ADS=false`).

### Arquivos

| Ação | Caminho |
| --- | --- |
| **Criar** | `app/ads/doc/runbook.md` |
| **Criar** (opcional MVP) | página interna simples com Recharts **ou** só queries SQL/Prisma documentadas no runbook |
| **Conferir** | prod: `FEATURE_ADS=false`, `NEXT_PUBLIC_FEATURE_ADS=false` |

### Requisitos funcionais

7.1 Flag default **off** em produção.  
7.2 Métricas MVP (sem Mixpanel): impressões/dia, usuários com `adSeen=true`, dedup rate — via queries Prisma documentadas.  
7.3 CTR / conversion 7–30–90 → pós-MVP (task-008).  
7.4 Runbook em `app/ads/doc/runbook.md`:
   - ligar: `FEATURE_ADS=true`, `ADS_ROLLOUT_PERCENT` 1 → 5 → 100
   - rollback: `FEATURE_ADS=false`
7.5 QA manual checklist:
   - basic com 8 txs vê banner
   - premium não vê
   - dismiss 1 dia
   - upgrade Stripe test some banner
   - falha de rede no POST não quebra UI
   - zero PII em `campaignKv` / logs  
7.6 **Fora do MVP:** job GAM, reconciliation audit, A/B de criativo.

### Critérios de aceitação

- [ ] Flag desliga 100% dos banners
- [ ] Runbook + checklist de QA preenchíveis
- [ ] Queries de impressão documentadas

---

# Pós-MVP (não bloqueia)

| Task | O que fazer | Onde (quando chegar) |
| --- | --- | --- |
| **008** | `POST /api/ads/click` + `upgrade_conversion_7/30/90` (join `checkout.session.completed` com `adSeenAt`) | `app/api/ads/click/route.ts` + webhook Stripe existente |
| **009** | Job diário interno vs GAM + `AdReconciliationAudit` | quando houver credenciais GAM |
| **010** | Playwright E2E + load no impression + A/B copy | CI |

**Fora de escopo (PRD):** vídeo VAST, rewarded ads, SOAP GAM, enviar PII para ads.

---

## Ordem de implementação (checklist rápido)

1. [ ] **001** — Apagar `ads-config.ts` da raiz; criar `app/ads/_constants/ads-config.ts` + helpers + Vitest + `.env.example`
2. [ ] **002** — Migration (se faltar) + `prisma/seed/ads_seed.ts`
3. [ ] **003** — `is-ad-eligible` + use case + `get-ad-eligibility` action
4. [ ] **004** — sanitize/dedup + `record-impression` + `POST /api/ads/impression` + `dismiss-ad`
5. [ ] **005** — `ad-banner.tsx` em dashboard + transaction
6. [ ] **006** — testes Vitest
7. [ ] **007** — runbook + QA + rollout %

**Estimativa:** 1 dev ≈ 2–3 dias de MVP.
