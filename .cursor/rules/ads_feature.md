Documento de Requisitos de Produto (**PRD**) Visão Geral Este **PRD** descreve a implementação de anúncios **DISPLAY** no produto transaction-ia, acionados apenas quando usuários do plano gratuito se aproximarem do limite de transações (limite atual: 10 transações). Objetivo: monetizar e incentivar upgrade sem degradar a experiência do usuário nem comprometer privacidade. Não será implementado suporte a vídeo nesta iniciativa.

Contexto:

Produto: dashboard financeiro com importações (Pluggy), autenticação via Clerk, pagamentos via Stripe. Cenário: usuários gratuitos têm limite de 10 transações; queremos exibir anúncios discretos (banners ou cards nativos) quando o usuário estiver em zona de alerta (ex.: 8 ou 9 transações). Valor: gerar receita incremental e aumentar conversões para planos pagos, mantendo UX e confiança. Por que agora:

Monetização adicional sem alterar oferta principal. Fluxo bem delimitado (zona de alerta) permite testes controlados e mensuração clara de impacto (impressão → upgrade). Objetivos Como será medido o sucesso

Métricas primárias: Taxa de impressão por usuários elegíveis (impressions_rate) — % dos usuários na zona de alerta que visualizaram o banner. **CTR** (click-through rate) do banner. Taxa de conversão para plano pago em 7/30/90 dias após impressão (upgrade_conversion_7/30/90). Incremento de **ARPU** atribuível a anúncios (estimado). Métricas secundárias: Taxa de rejeição / churn diferencial entre expostos e controle. Latência e erros do endpoint /api/ads/impression. Discrepância entre impressões registradas internamente vs. **GAM** (quando integrado). Critérios de sucesso (meta inicial, ajustável após testes)

impressions_rate ≥ 60% para usuários elegíveis. **CTR** ≥ 0.5% (benchmark inicial). upgrade_conversion_7d ≥ baseline + 0.5 percentage points for exposed cohort. Nenhum impacto detectável negativo (>1% aumento no churn) no grupo exposto. Critérios de aceitação de alto nível

AdBanner mostra anúncios somente para usuários elegíveis (free + zona de alerta). Impressões visíveis são gravadas com idempotência e sem duplicação excessiva. Assinantes (pagos) nunca veem anúncios. Não são enviados **PII** a servidores de anúncios; dados gravados internamente para análises. Histórias de Usuário Personas

Usuário primário: João, usuário free do transaction-ia que já importou transações e está próximo do limite. Usuário secundário: Administrador do produto / Growth PM que quer medir impacto e ajustar campanhas. User stories

Como usuário free, eu quero ver uma sugestão discreta para fazer upgrade quando eu estiver próximo do limite de transações, para que eu possa continuar usando o serviço sem interrupções. Como usuário free, eu quero que o anúncio não atrapalhe meu fluxo nem esconda informações críticas do meu dashboard. Como growth PM, quero registrar impressões confiáveis para medir quantos usuários viram o anúncio e quantos converteram. Como engenheiro, quero um endpoint idempotente para registrar impressões e evitar contagens infladas. Fluxos principais

Fluxo de exibição: Server/edge calcula eligibilidade (user.plan, transaction_count). Se elegível, retorna config para frontend renderizar AdBanner. AdBanner lazy-loads **GPT** apenas quando em viewport; detecta impressão e chama backend. Fluxo de registro: Frontend envia **POST** /api/ads/impression com sessionId/slotId. Backend valida sessão Clerk, dedup, grava evento e atualiza counters. Fluxos alternativos/casos extremos: Usuário faz upgrade imediatamente após ver o anúncio — anúncio não aparece mais. Falha na chamada /api/ads/impression: frontend tenta retry com backoff e registra telemetry; não bloqueia UX. ### Funcionalidades Principais Gatilho de elegibilidade (server-side) O que: lógica server-side que determina se usuário deve ver ads. Por que: evita carregar scripts de ads para assinantes e reduz risco de expor **PII**. Como (alto nível): Regra padrão: user.plan !== 'paid' **AND** transaction_count ∈ zona_de_alerta (configurável). Requisitos funcionais: 1.1 Endpoint ou **SSR**/edge resolver devolve { eligible: boolean, adConfig }. 1.2 Zona de alerta configurável (p.ex.: [8,9]); valor armazenado em configuração. AdBanner component (client-side) O que: componente React/TS (Next.js client component) que renderiza banner/card. Por que: exibir anúncio de forma não-intrusiva e detectar impressão visível. Como (alto nível): Recebe adConfig do server, usa IntersectionObserver, lazy-load do script **GPT** apenas se eligible true. Cria slot com googletag, escuta slotRenderEnded/impressionViewable. Requisitos funcionais: 2.1 Carregar **GPT** somente se eligible. 2.2 Usar IntersectionObserver para evitar marcar impressões off-screen. 2.3 Ao confirmar impressão, chamar **POST** /api/ads/impression com payload mínimo: { slotId, sessionId, optional campaignKv }. 2.4 Limitar a 1 impressão por sessão por slot (client-side lock). Endpoint /api/ads/impression (backend) O que: **API** Next.js que grava impressão e mantém counters. Por que: coletar dados para métricas e evitar exposição direta de **PII** a provedores de ads. Como (alto nível): Valida sessão Clerk; extrai userId; dedup por (userId, slotId, sessionId) em janela configurável (ex: 30 min). Atualiza users table: ad_seen boolean, ad_seen_at timestamp (se null), ad_views_count++. Insere evento granular em ads_impressions table. Requisitos funcionais: 3.1 Autenticação obrigatória (Clerk). 3.2 Dedup idempotente. 3.3 Rate-limit e sanitização de payload. 3.4 Responder com **200**/**201** e motivo quando deduplicado. Modelo de dados e armazenamento O que: tabelas para métricas e eventos. Por que: permitir análise e reconciliation. Como (alto nível): ver seção de Modelos de Dados abaixo. Requisitos: 4.1 Tabelas: users (ad_* campos), ads_impressions (event store). 4.2 Armazenamento de campaign_kv como **JSONB** sem **PII**. Observability & Reconciliation O que: jobs/métricas que comparam dados internos vs **GAM** quando aplicável. Por que: detectar discrepâncias e garantir integridade dos relatórios. Requisitos: 5.1 Job diário de comparação (quando **GAM** integrado). 5.2 Alertas se divergência > threshold (p.ex. 5–10%). Dependências entre funcionalidades

AdBanner depende do Gatilho de elegibilidade. Endpoint /api/ads/impression depende de autenticação Clerk e DB. Reconciliation depende de integração com **GAM** (futuro). Experiência do Usuário Jornada do usuário

Ponto de entrada: dashboard principal ou página de criação de transação. Condição: usuário free com transaction_count = 8 ou 9. Interação: um banner discreto aparece em zona definida do layout (sidebar ou header pequeno). Ações possíveis: ver, clicar no **CTA** (ex: “Fazer upgrade — desbloqueie +10 transações”), fechar (dismiss) ou ignorar. Resultado esperado: upgrade via Stripe ou manutenção de fluxo normal. Interações principais e feedback

Carregamento não bloqueante: banner lazy-load; conteúdo principal do dashboard não atrasado. Feedback visual: mostrar loading placeholder até slot renderizar; ao clique no **CTA**, mostrar modal de upgrade ou redirecionar para checkout. Dismiss: permitir fechar o banner; persistir dismiss para sessão/1 dia. Frequência: no máximo 1 impressão por sessão; configurable per-day cap. Requisitos de UI/UX

Tamanho: mobile (320x50) e desktop (300x250 ou fluid); preferir designs responsivos. Estilo: visual alinhado ao produto (não parece “spammy”); usar linguagem orientada a benefício. Acessibilidade: Banner acessível via teclado. Texto com contraste adequado. **ARIA** labels para **CTA** e botão fechar. Referências de design

Cards nativos com **CTA** claro; evitar elementos piscantes e autoplay. Restrições Técnicas de Alto Nível Integrações obrigatórias

Clerk: validação de sessão e extração de userId/plan. Stripe: leitura do plano do usuário (via webhook/database). (Opcional futuro) Google Ad Manager (**GAM**/**GPT**) para servir criativos — inicialmente apenas client-side **GPT** script usado; reports do **GAM** serão integrados posteriormente. Conformidade / segurança / privacidade

Não enviar **PII** (nome, email, userId em claro) como key-values para **GAM**. Armazenar campaign_kv como categorias não-identificáveis. Seguir políticas de consentimento aplicáveis (se operar em jurisdições com requisitos). Secrets (**GAM** creds, Stripe keys) em secret manager. Metas de performance

Endpoint /api/ads/impression: p95 latency < 200ms, disponibilidade 99.9%. AdBanner lazy-load não deve aumentar **TTFB** do page render. Throughput: escalar para picos esperados de impressões — começar com **RPS** baixo, usar rate-limiting. Considerações de privacidade

Usuário deve poder optar por não participar (feature flag / consent). Logs com dados sensíveis mascarados. Requisitos não-negociáveis

Impressões visíveis (viewport) somente marcadas. Autenticação Clerk obrigatória para gravação de impressões. Não-Objetivos (Fora de Escopo) Não incluir suporte a anúncios em vídeo (**VAST**/**VPAID**) nesta fase. Não implementar rewarded ads ou incentivos em troca de assistir conteúdo. Não transferir **PII** para servidores de ads. Não automatizar criação/gestão de line items no **GAM** via **API** **SOAP** (pode ser futuro). Não substituir relatórios internos por dados do **GAM**; **GAM** será fonte paralela para reconciliation quando integrado. Questões em Aberto Zona de alerta exata: confirmar valores iniciais (recomendado: [8,9]). Deseja outra configuração? Política de frequência: qual cap por usuário por dia/semana? (recomendado inicial: 1/day). Estratégia de A/B: vamos rodar teste controlado? (recomendado: iniciar com 1–5% rollout vs controle). Mensagens/creatives: haverá equipe de growth/marketing para redigir CTAs e imagens ou usaremos placeholders? Integração com **GAM** agora ou apenas **GPT** client-side? (recomendado: começar com client-side **GPT** e sem relatórios **GAM**; integrar relatórios depois). Quais métricas de sucesso são obrigatórias para aprovar expansão (números mínimos para impressions/**CTR**/conversão)? Tempo de retenção de dados de impressões (p.ex.: manter eventos brutos por 2 anos?) — política de retenção necessária. Modelos de Dados (resumo mínimo) Campos novos em users (exemplo Prisma/Drizzle)

ad_seen boolean **DEFAULT** false ad_seen_at timestamp **NULL** ad_views_count integer **DEFAULT** 0 ad_last_view_session_id varchar **NULL** ad_last_slot_id varchar **NULL** ad_campaign_kv jsonb **NULL** Tabela ads_impressions

id (PK) user_id (FK) slot_id (string) ad_unit_id (string) — optional session_id (string) campaign_kv jsonb source (string, e.g., 'gpt') created_at timestamp dedup_key string (opcional) Observability tables/logs

ads_events_errors (para falhas de gravação) ads_reconciliation_audit (quando **GAM** integrado) Plano de Entrega Prioritário (**MVP** → próximo) **MVP** (1–3 sprints)

Implementar Gatilho de elegibilidade server-side. AdBanner **TSX** (React/TS) com IntersectionObserver + **GPT** + listener slotRenderEnded. Endpoint /api/ads/impression com validação Clerk, dedup e gravação em ads_impressions + atualização users.ad_*. Feature flag e rollout controlado (1% → 5% → **100**%). Dashboards básicos: impressões por dia, usuários que viram anúncio, clicks, upgrades atribuídos. Post-**MVP** (prioridade média) 6. Endpoint /api/ads/click e tracking de conversão por clique. 7. Job de reconciliation com **GAM** (quando integrar). 8. Tests **E2E**, load tests e alerting por divergência. 9. A/B test para criatives e copy.

Nice-to-have (mais tarde)

Integração de relatórios customizados do **GAM** (**API** **SOAP**). Segmentação avançada por key-values e experimentos. Integração com analytics (Mixpanel/Amplitude) para funnel tracking. Riscos e Mitigações Risco: degradação de confiança do usuário

Mitigação: formato discreto, possibilidade de dismiss, não intrusivo, restrição a usuários free. Risco: contagem inflada de impressões / fraude

Mitigação: usar IntersectionObserver + googletag events + dedup no backend + reconciliação com **GAM**. Risco: envio de **PII** a provedores de anuncios

Mitigação: sanitizar key-values; nunca incluir identificadores pessoais. Risco: impacto em métricas de retenção

Mitigação: rollout controlado, monitoramento de churn por cohort, rollback via feature flag. Testes e QA Testes unitários

Gatilho de elegibilidade (vários transaction_count e states de plano). Dedup logic do endpoint. Testes de integração

Fluxo completo: eligible user → AdBanner renderiza → impressão detectada → /api/ads/impression grava evento. **E2E**

Simular free user em zona de alerta: ver banner, clicar **CTA**, completar upgrade (Stripe), verificar anúncio não reaparece. Load tests

Simular picos de impressões (definir target de **RPS** esperado) e verificar rate-limits e latência. Reconciliation tests

Quando **GAM** integrado, comparar grupos sample e checar divergências.
Entregáveis
AdBanner **TSX** (Next.js / TypeScript) pronto para integração.
Endpoint /api/ads/impression (Next.js) com validação Clerk + Prisma/Drizzle examples.
Script de DB (Prisma schema) com campos ad_* e tabela ads_impressions.
Plano de rollout e checklist de QA.
Dashboard inicial para métricas chave.
Próximos Passos Imediatos (recomendado)
Confirmação dos parâmetros:
Zona de alerta (recomendo: [8,9]).
Frequency cap (recomendo: 1 impressão por dia).
Percentual inicial de rollout (recomendo: 1%).
Decidir se quer que eu gere imediatamente:
- AdBanner **TSX** + instruções de integração, ou
- Endpoint /api/ads/impression + Prisma schema, ou
- Ambos (pacote completo).
Planejar teste em staging e definição de dashboards.