# Protocolo de Agentes — reembolso.ia.br

Protocolo de orquestração multi-agente do projeto. Quando uma **ideia** chega
(feature, correção, integração, melhoria), o **Diretor de Tecnologia (CTO)** —
agente orquestrador — faz a triagem, define quais agentes especialistas e
skills entram em jogo e como eles trabalham juntos, seguindo as boas práticas
de agentes da Anthropic/Claude.

Documento vivo — ajuste papéis e regras conforme o time evoluir.

---

## 1. Fluxo geral

```text
Ideia chega
   │
   ▼
[CTO / Orquestrador]
   1. Classifica a ideia (feature, bug, infra, segurança, negócio)
   2. Verifica GUARDRAILS.md (a ideia viola alguma conduta?)
   3. Define os agentes necessários e a ordem de trabalho
   4. Mapeia skills existentes (.agents/skills/) aplicáveis
   5. Emite o "Plano de Escalação" (template no item 5)
   │
   ▼
[Agentes especialistas trabalham] ──► paralelo quando independente,
   │                                   sequencial quando há dependência
   ▼
[CTO consolida] → revisão cruzada (segurança sempre revisa) → Definition of Done
```

Regras de decisão do CTO:

- **Toda ideia passa primeiro pelo CTO.** Nenhum agente especialista inicia
  trabalho sem um Plano de Escalação.
- **Menor time possível.** Só escale os agentes realmente necessários — mais
  agentes = mais contexto gasto e mais coordenação.
- **Segurança revisa sempre** que a ideia tocar em: webhooks, auth, RLS,
  storage, dados de empresa/colaborador ou variáveis de ambiente.
- **Negócios valida antes de codar** quando a ideia altera regra de reembolso,
  política, cobrança ou experiência do cliente.

---

## 2. Os agentes

| Agente | Papel | Escopo neste projeto |
| --- | --- | --- |
| **CTO (orquestrador)** | Triagem, plano, coordenação e consolidação final | Todo o repositório; único que fala com o solicitante |
| **Infra** | Deploy, edge/Cloudflare Workers, Lovable Cloud, filas, cron, migrações, health-check | `supabase/migrations/`, `src/routes/api/public/*` (operação), build/Vite, publicação |
| **Segurança** | RLS, papéis (`user_roles`/`has_role()`), webhooks, tokens, storage privado, LGPD | Revisão obrigatória de tudo que toca dados multi-tenant; guardião do GUARDRAILS.md |
| **Código (backend)** | Lógica de negócio, server functions, integrações (Evolution, nfe.io, Lovable AI) | `src/lib/`, `*.functions.ts`, pipeline de compliance de notas |
| **Frontend** | UI/UX, rotas de página, componentes, acessibilidade, design tokens | `src/routes/_app.*`, `src/components/`, `src/styles.css` |
| **Negócios** | Regras de reembolso, políticas, priorização, impacto no cliente do piloto | Requisitos, critérios de aceite, GUARDRAILS de negócio (empresas sem mock, domínio de e-mail etc.) |

Cada agente tem **uma responsabilidade única** e devolve resultado no formato
do item 6. O CTO nunca implementa: apenas planeja, delega e consolida.

---

## 3. Mapa de skills por agente

As skills vivem em `.agents/skills/`. O CTO indica no plano quais devem ser
usadas; o agente responsável é quem executa.

| Skill | Agente dono | Quando o CTO escala |
| --- | --- | --- |
| `health-check-diario` | Infra | Início de sessão, antes de publicar, ou quando algo "parou/sumiu" |
| `webhook-whatsapp-despesas` | Infra + Segurança | Ideias sobre recebimento de despesas via WhatsApp / Evolution |
| `triagem-nota-fiscal` | Código | Etapa 1 do pipeline de compliance (estrutura/completude da nota) |
| `verifica-nota-sefaz` | Código | Etapa 2 do pipeline (autenticidade/situação na SEFAZ) |
| `recibo-foto-de-foto` | Código | Etapa 3 do pipeline (forense de imagem, score de fraude) |

Ideias que criarem capacidades recorrentes devem virar **nova skill** em
`.agents/skills/<nome>/SKILL.md`, com dono definido nesta tabela.

---

## 4. Boas práticas de Claude aplicadas

1. **Orquestrador + subagentes**: um agente coordenador (CTO) delega para
   subagentes especializados com contexto próprio e enxuto — cada subagente
   recebe só o que precisa (arquivos, guardrails e skill aplicável), nunca o
   histórico inteiro.
2. **Responsabilidade única**: cada agente tem um papel claro; se uma tarefa
   exige dois papéis, o CTO divide em duas tarefas com handoff explícito.
3. **Paralelizar o que é independente**: frontend e backend podem trabalhar em
   paralelo quando o contrato (tipos/rotas) foi definido antes pelo CTO.
4. **Plano antes de código**: o CTO sempre produz o Plano de Escalação (item 5)
   antes de qualquer implementação; ideias grandes são quebradas em etapas
   pequenas e verificáveis.
5. **Ferramentas e skills em vez de improviso**: usar as skills existentes e
   comandos do ecossistema (`bunx vitest run`, migrações, scaffolding) em vez
   de soluções manuais.
6. **Verificação como etapa obrigatória**: nenhuma tarefa fecha sem testes
   verdes (`health-check-diario`), revisão de segurança quando aplicável e
   checagem dos GUARDRAILS.
7. **Contexto persistente em arquivos**: decisões e convenções vão para
   `GUARDRAILS.md`, `DOCUMENTACAO.md` ou uma skill — não ficam só na conversa.
8. **Humano no circuito**: mudanças irreversíveis (migração destrutiva,
   publicação em produção, alteração de política de reembolso) exigem
   confirmação explícita do solicitante antes de executar.

---

## 5. Template — Plano de Escalação (saída do CTO)

```markdown
## Plano de Escalação — <título da ideia>

**Ideia:** <resumo em 1–2 frases>
**Classificação:** feature | bug | infra | segurança | negócio
**Guardrails afetados:** <itens do GUARDRAILS.md ou "nenhum">

### Agentes escalados
| Agente | Tarefa | Depende de | Skill(s) |
| --- | --- | --- | --- |
| Negócios | <validar regra X> | — | — |
| Código | <implementar Y> | Negócios | triagem-nota-fiscal |
| Frontend | <tela Z> | contrato do Código | — |
| Segurança | <revisar RLS/webhook> | Código | — |
| Infra | <migração + publicar> | Segurança | health-check-diario |

### Ordem de execução
1. <etapa> (paralelo: <agentes>)
2. <etapa>

### Definition of Done
- [ ] Testes verdes (`bunx vitest run`)
- [ ] GUARDRAILS.md respeitado
- [ ] Revisão de segurança (se tocou dados/webhook/auth)
- [ ] Documentação atualizada (DOCUMENTACAO.md / skill)
```

---

## 6. Template — Resposta de agente especialista

```markdown
## <Agente> — <tarefa>

**Status:** concluído | bloqueado | precisa de decisão
**O que foi feito:** <resumo objetivo>
**Arquivos tocados:** <lista>
**Riscos/alertas:** <ex.: impacto em RLS, migração irreversível>
**Handoff:** <o que o próximo agente precisa saber>
```

---

## 7. Exemplo rápido

> Ideia: "Quero aprovar reembolsos direto pelo WhatsApp."

Plano do CTO (resumo): Negócios valida a regra de aprovação (quem pode, limites)
→ Segurança define autenticação do aprovador pelo número (WhatsApp único por
empresa, GUARDRAILS §1) → Código implementa o fluxo no webhook Evolution
(skill `webhook-whatsapp-despesas`) em paralelo com Frontend ajustando o painel
→ Infra roda `health-check-diario` e publica. Segurança revisa antes do merge.
