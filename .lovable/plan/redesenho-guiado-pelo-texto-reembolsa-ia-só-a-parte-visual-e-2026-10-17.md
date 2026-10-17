# Redesenho guiado pelo texto "reembolsa.ia" — só a parte visual, em fases

O texto enviado passa a orientar o visual e a organização das telas. Banco, funções do servidor, análise, login, WhatsApp e endereços das páginas não mudam. Nenhum dado de exemplo entra na operação real. A fase 1 (fontes e cores) já foi feita.

## O que aproveitamos do texto
- Cada tela abre com uma frase dizendo o que vai acontecer; os detalhes ficam recolhidos; nada de parede de texto.
- Visual: verde-escuro e grafite, cartões com borda fina e uma faixa colorida no topo (ok / atenção / não), sem gradiente nem ilustração.
- Situações da despesa com nomes fixos: Recebida, Lida / Não lida, Em revisão, Aprovada / Recusada / Reclassificada.
- "Data não informada" quando a data não foi lida; comprovante repetido sinalizado.
- Justificativa da decisão cita a regra da política.

## O que fica de fora (não existe no app hoje ou mudaria o funcionamento)
Liberação da empresa por um operador, área de Gestão separada, check-in e trajeto de combustível, kit do contador como recurso novo, termo de aceite, prova digital (hash). Se quiser algum, vira um pedido à parte.

## Fases (cada uma pede sua aprovação)
2. Peças base: cartão com faixa de cor, selo de situação com os nomes acima, selo "Política vN em vigor", telas de vazio / carregando / erro de leitura / convite falhou.
3. Moldura do app: selo da política em vigor fixo no topo de todas as telas.
4. Início (`/overview`) com cinco blocos: Espera na fila, Análise × decisão, Política em vigor, Pessoas, Leitura dos comprovantes — número grande, faixa de cor e uma frase, com os números reais que já existem.
5. Despesas: abas "Para revisar" e "Todas", ordenar por data/valor/situação, busca por colaborador; detalhe ao lado com comprovante, campos lidos, regra aplicada, parecer e Aprovar / Recusar / Reclassificar com justificativa; atalhos de teclado.
6. Política (lista por categoria com limite, prazo e exigência; aviso de categorias abaixo de 90% de certeza a confirmar) e Equipe (situação do convite por pessoa, "tentar de novo").
7. Relatórios, NF-e e reembolsos no mesmo padrão.
8. Página inicial e telas de login/cadastro no visual novo, mesmo texto.
9. Conferência no computador e celular.

## Detalhes técnicos
- Só arquivos de apresentação; nenhuma alteração em `src/lib/*`, banco ou rotas.
- Reclassificar e justificativa usam as ações de decisão já existentes; se não houver campo para a justificativa, aviso antes em vez de mudar o banco.
- Testes existentes rodam a cada fase.
