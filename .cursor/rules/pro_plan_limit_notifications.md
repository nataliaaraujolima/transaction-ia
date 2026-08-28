# **Visão Geral**

Problema

- Usuários chegam perto ou atingem o limite do plano (ex.: número de transações) sem aviso claro, gerando frustração ou interrupção de funcionalidades.
- Atualmente você já calcula usage/planLimit via Stripe + server actions/Prisma, mas não há entrega contextual e acionável desse cálculo ao usuário.

Solução

- Implementar um sistema de notificações in‑app (badge, dropdown, banner na tela Assinaturas e card no Dashboard) que avisa quando o usuário atinge o threshold definido (80%) do limite do plano e oferece CTA genérica para upgrade (reaproveitando o checkout Stripe existente).
- Objetivo prático: entrega de um MVP hoje que gere notificações somente quando necessário (cooldown por ciclo), com UX claro, evitando spam.

Público-alvo

- Usuários pagantes (com subscription ativa).
- Product/marketing (para acompanhar conversões geradas por notificação).

Valor

- Melhora na experiência ao evitar surpresas.
- Redução de tickets relacionados a limites.
- Aumento potencial de upgrades/ARPU.

# **Objetivos**

Como será medido o sucesso

- Percentual de usuários notificados (por threshold) corretamente detectados.
- CTR (notificação → Assinaturas) e conversion rate (notificação → upgrade).
- Redução de tickets “limite atingido sem aviso” após rollout.

KPIs principais

- percentUsersNotified (por threshold)
- notificationClickThroughRate
- notificationToUpgradeConversionRate
- número de notificações criadas por usuário por ciclo (deve ser ≤ 1 para o mesmo threshold)

Critérios de aceitação (alto nível)

- Notificações geradas automaticamente com base no cálculo Stripe/Prisma.
- Badge com contagem de não-lidas aparece no topo.
- Banner aparece na tela Assinaturas quando percentUsed ≥ 80.
- Cooldown: apenas 1 notificação do tipo THRESHOLD_80 por ciclo de faturamento por usuário.
- Ao clicar na notificação/CTA, usuário é levado ao fluxo de checkout Stripe existente.

# **Histórias de Usuário**

Primárias

- Como usuário com subscription ativa, quero receber um aviso quando eu atingir 80% do limite do meu plano para poder planejar um upgrade.
- Como usuário, quero ver quantos recursos faltam e um botão para ver os planos e atualizar.

Secundárias

- Como product manager, quero rastrear quantos usuários receberam e clicaram nas notificações para medir eficácia.

Fluxos principais

1. Backend: cron/server action calcula percentUsed (reaproveitando seu cálculo Stripe).
2. Se percentUsed ≥ 80 e usuário ainda não notificado neste ciclo → criar Notification THRESHOLD_80 e marcar cooldown.
3. UI mostra badge/dropdown; Banner aparece na página Assinaturas e Dashboard.
4. Usuário clica em “Ver planos” → redireciona ao checkout Stripe existente.
5. Após upgrade, atualizar billing state e limpar notificações relevantes para o ciclo.

Casos extremos / fluxos alternativos

- Usuário com múltiplos limites (transações + contas): priorizar o limite com maior urgência (o que estiver mais próximo de 100%).
- Uso flutuante (baixa depois de aviso): sistema não reenviará notificação pelo mesmo threshold no mesmo ciclo; somente no próximo ciclo.
- Contas de teste/dev: ignorar itemId/flags de teste para não notificar usuários reais a partir de importações de dev.

# **Funcionalidades Principais**

1. Cálculo e detecção de threshold (80%)
- O que faz: compara currentUsage / planLimit e detecta percentUsed.
- Por que: é o gatilho para notificações.
- Como (alto nível): server action evaluateUsageAndNotify roda via cron (hourly) ou via webhook/invoice event do Stripe; reaproveita a sua lógica atual.
- Requisitos funcionais: 1.1 Deve obter currentUsage, planLimit, subscriptionId e periodStart. 1.2 Calcular percentUsed = floor(currentUsage / planLimit * 100). 1.3 Derivar cycleId = `${subscriptionId}_${periodStart}`. 1.4 Consultar UserBillingState para cooldown; resetar flags se cycleId mudou. 1.5 Criar Notification THRESHOLD_80 e set notified80=true quando apropriado.
1. Persistência de notificações e estado de cooldown
- O que faz: armazena notificações e controla se um usuário já foi notificado no ciclo.
- Requisitos funcionais: 2.1 Modelo Notification no DB (id, userId, type, payload JSON, read boolean, createdAt, cycleId). 2.2 Modelo UserBillingState (userId PK, cycleId, notified80 boolean, updatedAt). 2.3 Evitar múltiplas notificações do mesmo tipo no mesmo cycleId.
1. API / Endpoints
- GET /api/notifications?userId=... → lista notificações (unread primeiro).
- PATCH /api/notifications/:id/read → marca read=true.
- POST /api/notifications/emit → admin/campaign (opcional).
- Reutilizar endpoint existente de checkout Stripe (POST /api/checkout/create-session) para abrir checkout.
1. UI in‑app
- NotificationsMenu (topbar dropdown)
    - Mostra badge com número de não-lidas.
    - Lista notificações (tipo, resumo, createdAt).
    - Ação “Ver planos” na notificação THRESHOLD_80.
    - Ao clicar: marcar read e abrir /assinaturas ou chamar checkout.
- SubscriptionBanner (Assinaturas & Dashboard)
    - Condição: percentUsed ≥ 80.
    - Componente: MUI Alert + LinearProgress + texto com percentUsed e faltantes.
    - CTA: “Ver planos” → chama create-session ou redireciona para /assinaturas.
- Card no Dashboard
    - Mostra percentUsed e CTA “Gerenciar plano”.
1. Regras de negócio adicionais
- Cooldown: somente 1 notificação THRESHOLD_80 por user por cycleId.
- Proteção extra: não criar mais de 1 notificacao do tipo THRESHOLD_80 por 24h (fallback).
- Dismiss: banner pode ser dismissible (não afeta cooldown).

# **Experiência do Usuário**

Jornada do usuário resumida

- O backend detecta percentUsed ≥ 80 e cria a notificação.
- Usuário vê badge no topo e banner na tela Assinaturas/Dashboard.
- Banner mostra percentUsed, faltantes, e botão “Ver planos”.
- Clicar no CTA leva ao checkout Stripe. Notificação marcada como lida.

Interações principais e feedbacks

- Notificação no dropdown: resumo curto (“Você usou 82% do limite do plano”), CTA.
- Banner persistente com progress bar e botão.
- Ações: “Ver planos” (primária), “Fechar” (secundária — fecha banner).
- Acessibilidade: todos os elementos com aria-labels; contraste adequado; foco navegável por teclado.

Referências de UI (alto nível)

- Usar MUI Alert, LinearProgress, Menu/List para dropdown.
- Estilo consistente com tema escuro das telas já enviadas nas imagens (botão primário azul).

# **Restrições Técnicas de Alto Nível**

- Integrações obrigatórias: Stripe API, Prisma/Postgres.
- Segurança: endpoints autenticados; não expor dados sensíveis na payload; validar userId via token.
- Performance: evaluateUsageAndNotify deve ser incremental/por usuário; evitar recalcular para todos os usuários a cada hora sem filtros.
- Privacidade: respeitar preferências de e-mail (não implementado por enquanto).
- Deploy: cron em staging antes de prod; somente código server-side acessa credenciais Stripe/DB.

# **Não-Objetivos (Fora de Escopo)**

- E‑mail automático não será implementado nesta fase (somente se houver tempo).
- Push mobile / PWA push não será implementado agora.
- Upsell com ML/recomendações personalizadas não faz parte do MVP.
- Prorrata e upgrades complexos não serão tratados — usar checkout Stripe existente.

# **Questões em Aberto**

- Confirmado threshold: 80% (decisão tomada).
- Envio de e‑mail: não por enquanto.
- Promoção: CTA genérica por ora; 10% off só se houver tempo.
- Confirmação de qual campo do seu cálculo Stripe será usado como currentUsage (assumi currentUsage já tratado por você).
- Confirmar se cycleId será baseado em subscription.current_period_start (recomendado) — necessário para integração.

---

Implementação técnica prática (instruções para entrega hoje)

1. Prisma — modelos (adicionar ao schema.prisma)
- Notification model Notification { id String @id @default(uuid()) userId String type String payload Json read Boolean @default(false) createdAt DateTime @default(now()) cycleId String? }
- UserBillingState model UserBillingState { userId String @id cycleId String? notified80 Boolean @default(false) updatedAt DateTime @updatedAt }
1. Server action: evaluateUsageAndNotify (pseudocódigo)
- Reaproveitar sua função que retorna { currentUsage, planLimit, subscriptionId, periodStart, daysLeft }.
- Calcular percentUsed.
- Derivar cycleId = `${subscriptionId}_${periodStart}`.
- Upsert UserBillingState; se cycleId mudou, resetar notified80.
- Se percentUsed ≥ 80 && !notified80:
    - criar Notification com payload { currentUsage, planLimit, percentUsed, daysLeft, suggestedPlanId }.
    - set notified80 = true.
1. Endpoints (server actions/API)
- GET /api/notifications?userId=: retorna notificações ordenadas (unread first).
- PATCH /api/notifications/:id/read: marca read=true.
- Reutilizar /api/checkout/create-session para iniciar checkout.
1. UI components (React + TypeScript + MUI) — resumo
- NotificationsMenu
    - Hook fetch /api/notifications.
    - Badge no AppBar com count unread.
    - Dropdown lista itens; para THRESHOLD_80 mostrar resumo e botão “Ver planos”.
- SubscriptionBanner
    - Fetch /api/billing/usage ou receber props de percentUsed.
    - Render MUI Alert + LinearProgress + CTA “Ver planos”.
    - CTA chama create-session e redireciona.
- Upgrade flow
    - Reusar seu fluxo de checkout Stripe existente; ao sucesso, atualizar UserBillingState e marcar notificações relacionadas como lidas/arquivadas.
1. Exemplos de payloads
- Notification payload: { "currentUsage": 820, "planLimit": 1000, "percentUsed": 82, "daysLeft": 12, "suggestedPlanId": "plan_pro_01" }
- GET /api/notifications response: [ { "id": "uuid", "userId": "u_123", "type": "THRESHOLD_80", "payload": { ... }, "read": false, "createdAt": "2026-08-28T12:00:00Z" } ]
1. Testes mínimos recomendados Unit
- evaluateUsageAndNotify: percentUsed < 80 não cria notificação.
- evaluateUsageAndNotify: percentUsed ≥ 80 cria notificação e seta notified80.
- cycle change: novo cycleId reseta notified80.

Integration / Manual (staging)

- Simular 50%, 82% e 99% para users e validar criação no DB.
- Verificar UI: badge aparece, banner aparece, CTA chama checkout.
- Verificar cooldown: segundo run no mesmo cycle não cria nova notificação.
1. Checklist para entrega hoje (ordem sugerida)
2. Adicionar models e rodar migration (10–20 min).
3. Implementar evaluateUsageAndNotify (30–45 min).
4. Criar endpoints GET/PATCH (15–30 min).
5. Implementar SubscriptionBanner + NotificationsMenu (60–90 min).
6. Testar end‑to‑end em staging (30 min).
7. Ajustes UX e deploy (15–30 min).
8. Mensagens / Copy recomendadas
- Banner: “Você usou 82% do limite do seu plano. Ver planos”
- Dropdown short: “Uso do plano: 82% — faltam 180 transações. Ver planos”
- CTA: “Ver planos”
1. Extensões futuras (priorizadas)
- Adicionar 90% / 100% thresholds com mensagens e comportamentos específicos.
- Habilitar envio de e‑mail quando atingir 100%.
- Implementar oferta promo (10% off) no 90% ou 100% como A/B test.
- Push Mobile / PWA push notifications.
1. Segurança & Privacidade
- Endpoints autenticados.
- Não incluir dados sensíveis nas notificações.
- Somente server-side acessa Stripe keys.