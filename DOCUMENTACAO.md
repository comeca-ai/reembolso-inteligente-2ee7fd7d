# Documentação Técnica — Reembolso Inteligente

> Plataforma de gestão de reembolsos corporativos com captura via WhatsApp,
> leitura automática de comprovantes por IA, verificação fiscal de NF-e (SEFAZ)
> e análise de conformidade contra a política de reembolso da empresa.

- **Preview:** https://id-preview--95e4f1ba-e730-46d6-951e-3c12435fb6b9.lovable.app
- **Produção:** https://reembolso-inteligente.lovable.app

---

## 1. Visão geral da arquitetura

| Camada | Tecnologia |
| --- | --- |
| Framework | TanStack Start v1 (React 19, SSR/SSG) |
| Build | Vite 7 |
| Runtime do servidor | Cloudflare Workers (edge) |
| Estilo | Tailwind CSS v4 (`src/styles.css`) |
| Backend | Lovable Cloud (banco, auth, storage, filas) |
| IA | Lovable AI Gateway (modelos Gemini) |
| Lógica interna | `createServerFn` (RPC tipado) |
| Endpoints externos | Server routes em `src/routes/api/public/*` |

**Princípio de fronteiras:**
- **Lógica do app** (CRUD, regras de negócio, queries) → `createServerFn` em arquivos `*.functions.ts`.
- **Webhooks / APIs públicas / cron** → server routes sob `src/routes/api/public/*` (esse prefixo ignora a autenticação; a segurança é feita dentro do handler).

---

## 2. Bases de dados

Todas as tabelas vivem no schema `public`, com RLS habilitada e isolamento por
empresa (`company_id`) via `current_company_id()` / `has_role()`.

### 2.1 Núcleo do negócio

#### `companies`
Cadastro da empresa (tenant). Cada usuário pertence a uma empresa.
`id, razao_social, cnpj, politica_reembolso_arquivo, cartao_cnpj_arquivo, cartao_cnpj_path, whatsapp_number, evolution_instance, webhook_token, created_at, updated_at`
- `whatsapp_number` / `evolution_instance` → chaves para resolver a empresa nos webhooks do WhatsApp.

#### `profiles`
Perfil do usuário, ligado a `auth.users` e à empresa.
`id, company_id, nome, email, whatsapp, must_change_password, created_at, updated_at`
- `whatsapp` casa o colaborador que envia o comprovante.
- `must_change_password` força a troca de senha no primeiro acesso (convidados).

#### `user_roles`
Papéis fora da tabela de perfil (evita escalonamento de privilégio).
`id, user_id, role, created_at` — enum `app_role`: `admin`, `approver`, `member`/`user`.
Verificado por `has_role(uid, role)` (security definer).

#### `inbound_reimbursements`
Coração do sistema — cada comprovante recebido vira uma linha.
`id, company_id, channel, sender, sender_name, message, attachment_url, amount, category, status, raw_payload, danfe_key, decision, decided_by, decided_at, decision_note, wa_message_id, …`
Blocos por etapa:
- **Leitura IA:** `amount, category, message, attachment_url`, status `recebido` / `pendente_leitura`.
- **Política:** `policy_verdict, policy_summary, policy_cited_rule, policy_confidence, policy_analyzed_at`.
- **Fiscal (NF-e):** `danfe_key, nfe_status, nfe_verified_at, nfe_raw`.
- **Compliance:** `compliance_report, compliance_status, compliance_at`.
- **Decisão humana:** `decision, decided_by, decided_at, decision_note`.
- **Idempotência:** `wa_message_id` (único por empresa) evita duplicados de reenvio.

#### `policies` e `policy_rules`
Política de reembolso versionada por empresa.
- `policies`: `version, file_name, file_path, source, source_text, pages, active, status, …`
- `policy_rules`: `code, title, category, rule_limit, rule_basis, rule_text` — regras extraídas/estruturadas usadas na avaliação automática.

#### `despesas`
Tabela simples de despesas (canal legado/externo): `id, telefone, recibo, created_at`.

### 2.2 Infra de e-mail

- `email_send_log` — log de cada envio (status, erro, template, destinatário).
- `email_send_state` — configuração de throttle/TTL da fila de e-mail.
- `email_unsubscribe_tokens` / `suppressed_emails` — opt-out e supressão.

### 2.3 Observabilidade

- `webhook_debug` — registra apenas casos acionáveis (ex.: empresa não resolvida no webhook), para diagnóstico.

### 2.4 Funções de banco (SECURITY DEFINER)

| Função | Papel |
| --- | --- |
| `handle_new_user()` | Cria empresa + perfil + role no signup (ou anexa a empresa do convite). |
| `ensure_current_user_profile()` | Garante perfil/role do usuário logado (auto-reparo). |
| `current_company_id()` | Empresa do usuário atual (base do isolamento RLS). |
| `has_role(uid, role)` | Checa papel sem recursão de RLS. |
| `can_view_reimbursement(sender)` | Admin/aprovador veem tudo; membro só os próprios (telefone/e-mail). |
| `resolve_company_by_whatsapp / _instance / _sender_whatsapp` | Resolvem a empresa nos webhooks. |
| `enqueue_email / read_email_batch / delete_email / move_to_dlq` | Fila de e-mail (pgmq). |

### 2.5 Storage (buckets privados)

- `comprovantes` — imagens/PDFs dos recibos.
- `policies` — arquivos das políticas de reembolso.
- `cartoes-cnpj` — cartão CNPJ da empresa.

---

## 3. Features (funções de servidor)

### 3.1 Visão geral — `overview.functions.ts`
- `getOverviewMetrics` — métricas do dashboard (totais, status, categorias).

### 3.2 Reembolsos — `reimbursements.functions.ts`
- `getReimbursementsConfig` — lista despesas + config de WhatsApp/instância da empresa.
- `setCompanyWhatsapp` / `setCompanyEvolutionInstance` — define as chaves de captura.
- `updateReimbursementStatus` — muda o status interno.
- `decideReimbursement` — decisão humana (aprovar/recusar) com nota.
- `analyzeReimbursement` — dispara análise de política sob demanda.

### 3.3 Política — `policy.functions.ts`
- `getPolicyState` — política ativa e regras.
- `uploadAndExtractPolicy` — sobe o arquivo e a IA extrai as regras estruturadas.
- `evaluateExpense` — avalia um comprovante contra as regras (veredito + regra citada + confiança).
- `savePolicyRule` / `deletePolicyRule` — edição manual de regras.
- `draftPolicyFromInput` — gera rascunho de política a partir de áudio/texto.
- `publishDraftPolicy` — publica o rascunho como versão ativa.

### 3.4 NF-e / SEFAZ — `nfe.functions.ts`
- `verifyNfe` / `verifyNfeKey` — validação estrutural offline da chave (44 dígitos) + consulta de situação via nfe.io (SERPRO/SEFAZ), com link para conferência manual no portal.

### 3.5 Compliance — `compliance.functions.ts`
- `evaluateCompliance` — pipeline em 3 etapas executadas uma a uma: triagem, SEFAZ e detecção de "foto de foto", consolidando um veredito.

### 3.6 Convites e cadastro
- `invites.functions.ts` → `inviteApprover` (convida aprovador).
- `participants-invite.functions.ts` → `inviteParticipantsBatch` (convite em lote dos participantes, via CSV).
- `employee-invite.functions.ts` — convite de colaborador.
- `cartao-cnpj.functions.ts` → `uploadCartaoCnpj`.

### 3.7 Saúde do sistema — `health-check.server.ts`
- Checks diários de consistência; cron às 06h BRT; alerta o admin por e-mail em caso de falha.

---

## 4. Edge functions / endpoints públicos

> Não são edge functions do Supabase: são **server routes** do TanStack rodando
> no Lovable Cloud, sob `src/routes/api/public/*`.

### 4.1 `POST /api/public/evolution` — Webhook do WhatsApp (Evolution API)
Fluxo principal de captura:
1. Recebe o evento `MESSAGES_UPSERT` (ignora `fromMe` e mensagens de texto puro).
2. Resolve a empresa pelo colaborador (WhatsApp), instância ou número da linha.
3. Idempotência por `wa_message_id`.
4. Descriptografa a mídia (`.enc`) via Evolution se necessário.
5. **Cadeia de modelos de IA** lê o comprovante: `gemini-3-flash-preview` →
   fallback `gemini-2.5-pro` (visão mais forte) para resgatar valores difíceis.
6. Salva o comprovante no Storage e grava em `inbound_reimbursements`.
7. Se houver chave de DANFE, verifica na SEFAZ automaticamente.
8. Se a IA **não** leu o valor → responde ao colaborador pedindo foto mais nítida
   e marca `pendente_leitura`.

### 4.2 `POST /api/public/despesas` — Ingestão externa de despesas (token).
### 4.3 `POST /api/public/reimbursements` — API pública de reembolsos.
### 4.4 `/api/public/hooks/health-check` — Endpoint do cron de saúde diária.

### 4.5 Rotas de e-mail (`src/routes/lovable/email/*`)
- `auth/webhook` e `auth/preview` — e-mails de autenticação (templates em `src/lib/email-templates`).
- `queue/process` — processa a fila de envio (pgmq).

---

## 5. Experiência do usuário

### 5.1 Onboarding / autenticação
- **`/` (index)** — landing "Configure a solução".
- **`/signup`** — fluxo de setup: cadastro → participantes → política → `/onboarding`.
- **`/login`** — **somente e-mail e senha**. Após login, vai direto ao app
  (`landingForRole`); o envio da política **não** trava o acesso — é etapa do setup.
- **`/onboarding`** — conclui a configuração (participantes/política).
- **`/reset-password`** e troca obrigatória de senha (`ForcePasswordChangeDialog`) para convidados.
- **`/pre-cadastro`** — captação inicial.

### 5.2 App autenticado (`_app.*`, dentro do `AppShell`)
| Rota | Tela | O que faz |
| --- | --- | --- |
| `/overview` | Visão geral | KPIs, status e categorias dos reembolsos. |
| `/reimbursements` | Reembolsos | Config de WhatsApp/instância e despesas recebidas (realtime). |
| `/expenses` + `/expenses/$id` | Despesas | Lista e detalhe de cada comprovante. |
| `/nfe` | NF-e | Pipeline de compliance em 3 etapas (triagem, SEFAZ, foto-de-foto). |
| `/policy` | Política | Upload/edição da política e regras; estúdio de rascunho. |
| `/reports` | Relatórios | Exportações (HTML/relatório). |
| `/users` | Usuários | Gestão de membros e papéis. |

### 5.3 Papéis e permissões
- **Admin** — acesso total à empresa; gerencia usuários, política, configurações.
- **Aprovador** — vê e decide todos os reembolsos da empresa.
- **Membro** — vê apenas os próprios reembolsos (casados por telefone/e-mail).

### 5.4 Jornada típica do colaborador
1. Tira foto do comprovante e envia no WhatsApp da empresa.
2. A IA lê valor, categoria e (se houver) a chave da NF-e.
3. O sistema verifica a nota na SEFAZ e a conformidade com a política.
4. O aprovador vê o reembolso já triado no painel e decide (aprovar/recusar).
5. Se a foto estiver ilegível, o colaborador recebe um pedido automático de nova foto.

---

## 6. Segurança (resumo)

- RLS em todas as tabelas + `GRANT` explícito por papel.
- Papéis em `user_roles` (nunca no perfil).
- Webhooks identificam a empresa sem expor segredos; casos não resolvidos vão para `webhook_debug`.
- Segredos (Evolution, Resend/SMTP2GO, NFE.io, Lovable AI, service role) ficam no backend, nunca no cliente.
- Idempotência de mensagens e respostas de erro silenciosas para não derrubar o webhook.
