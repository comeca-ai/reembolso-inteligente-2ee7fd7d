# Redesign Reembolsa — só a parte visual, em fases

Limites: banco, funções do servidor, motor de análise, login e endereços das páginas ficam como estão. Mantemos o teal "reembolsa aí" e todo o texto em pt-BR. Cada fase pode ser desfeita sozinha e só começa depois que você aprovar.

## (a) Telas que existem hoje

Públicas
- `/` landing Enterprise (198 linhas)
- `/login`, `/reset-password`, `/signup` (empresa → política → participantes), `/onboarding`, `/pre-cadastro` (redireciona)
- `/teste-webhook` (ferramenta interna)

Área logada (`_app`: AppShell + SidebarNav)
- `/overview` painel
- `/expenses` lista de despesas · `/expenses/$id` detalhe
- `/reimbursements` reembolsos vindos do WhatsApp
- `/nfe` NF-e + compliance (ComplianceDialog)
- `/policy` política (upload + PolicyDraftStudio)
- `/reports` relatórios
- `/users` participantes e convites

Peças compartilhadas: StatusBadge, VerdictBadge, Confidence, RuleCheck, CategoryBadge, EmptyState, Skeletons, PageHeader, TrustStrip, DemoDataBadge, Logo, AuthLayout, ParticipantsStep, PolicyUploadStep, mais os componentes de interface padrão.

## (b) O que muda em cada tela

- Tokens (`styles.css`): escala de cor teal 50–900; cores de estado (aprovado, pendente, divergente, erro de leitura); tipografia própria no lugar da Inter (título + texto + números com largura fixa para valores); densidade compacta para tabelas; sombras e foco revisados.
- Peças base: um único `DecisionBadge` (motor × humano lado a lado), `PolicyVersionPill`, `MoneyCell`, `ReceiptThumb`, um `StateBlock` com variantes (vazio, carregando, erro de leitura, convite falhado, sem permissão) e atalhos de teclado.
- AppShell: barra lateral mais estreita; a versão da política em vigor fica fixa no topo de todas as telas ("Política v3 · em vigor desde 12/09"), clicável até `/policy`.
- `/expenses` vira a **fila do aprovador**: lista à esquerda, comprovante + análise à direita na mesma tela; aprovar/reprovar/próxima pelo teclado (A / R / J / K); seleção em lote para casos "motor e humano concordam"; contador "faltam N". A divergência motor × humano aparece como coluna e tarja na linha, sem precisar clicar.
- `/expenses/$id`: o endereço continua; mesmo painel de detalhe da fila, em tela cheia, com trilha de auditoria em linha do tempo.
- `/overview`: indicadores (fila pendente, tempo médio de decisão, divergências da semana) e atalho "Zerar fila".
- `/reimbursements`: mesmo padrão de tabela, com estado "erro de leitura" desenhado (pedido de foto mais nítida enviado).
- `/nfe`: tabela no padrão novo; as 3 etapas de compliance viram uma faixa de passos.
- `/policy`: versão em vigor em destaque, histórico de versões, comparação; estados de envio e processamento.
- `/users`: convites com estado por pessoa (enviado, falhou + "tentar de novo").
- `/reports`: gráficos com as cores novas; estados vazio e carregando.
- Landing e telas de login/cadastro: tokens e tipografia novos, mesmo texto e mesma estrutura.

## (c) Fases

1. Tokens e tipografia (só `styles.css` + fontes em `__root`). Sem mudar telas.
2. Peças base novas + StateBlock; trocar os badges antigos de forma compatível.
3. AppShell + selo de versão da política em todas as telas.
4. Fila do aprovador em `/expenses` (lista + detalhe na mesma tela, teclado, lote, divergência visível).
5. `/expenses/$id` + trilha de auditoria.
6. `/policy` e `/users` (versões e convites falhados).
7. `/overview`, `/reimbursements`, `/nfe`, `/reports`.
8. Landing e telas de login/cadastro.
9. Conferência final: Playwright no computador e no celular, teste cronometrado com 20 despesas de demonstração (meta: menos de 10 min), todos os estados revistos.

## Detalhes técnicos
- Só arquivos de apresentação (`src/components/**`, `src/routes/*.tsx` JSX, `src/styles.css`); chamadas em `src/lib/*` sem alteração.
- Atalhos de teclado e seleção em lote chamam as mesmas funções de aprovação que já existem.
- O painel lado a lado na fila usa o mesmo carregamento de dados do detalhe; o endereço `/expenses/$id` continua.
- Testes existentes rodam a cada fase; nenhum teste de visual.

Sobre as mensagens das fases 1–4: não precisa escrever. Depois que você aprovar este plano, eu executo uma fase por vez e paro para você revisar.
