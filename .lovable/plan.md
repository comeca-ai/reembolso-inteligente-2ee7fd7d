# Experiência de cadastro — política antes dos participantes

## Objetivo
Organizar a configuração inicial em uma jornada clara: **empresa e administrador → política da empresa → participantes → aplicação**. Manter **Entrar** exclusivamente para e-mail e senha, sem obrigar clientes existentes a repetir a configuração.

## Ajustes propostos
1. **Dar clareza às etapas.** Mostrar o progresso da configuração e separar os dados da empresa dos dados do administrador, preservando a identidade teal e o tom premium de reembolsa aí.
2. **Enviar a política de verdade.** Usar o mesmo processamento da tela Política para armazenar o documento e extrair as regras. Hoje, o cadastro e o onboarding passam apenas o nome do arquivo para `api.uploadPolicy`; isso não transmite o documento selecionado. Só mostrar a política como ativada após confirmação do processamento.
3. **Política antes dos participantes.** Após criar a conta, apresentar o envio da política; depois, a importação dos participantes. Preservar a opção de enviar depois, sem afirmar que a análise está ativa.
4. **Retomar a configuração.** Guardar a etapa pendente para continuar após confirmação do e-mail, atualização da página ou interrupção. Hoje, as etapas do cadastro ficam apenas no estado da página e a confirmação aponta para `/overview`. Essa retomada será específica da configuração, sem transformar o login comum em uma barreira de política.
5. **Convites com resultado claro.** Manter a revisão da planilha e apresentar sucessos e falhas individualmente, permitindo corrigir ou repetir apenas os convites que falharam antes de concluir.
6. **Consistência de apresentação.** Alinhar cadastro, login e onboarding ao posicionamento corporativo, melhorar associação entre rótulos e campos, preenchimento automático, mensagens de erro e estados de processamento. Nenhuma alteração no funcionamento das despesas ou do WhatsApp.

## Detalhes técnicos
- Reutilizar `uploadAndExtractPolicy` com o conteúdo real do arquivo, substituindo o caminho antigo no cadastro e no onboarding.
- Alinhar os formatos aceitos à capacidade real do processamento existente, que trabalha com PDF; não anunciar suporte a DOC/DOCX sem conversão implementada.
- Compartilhar a etapa de envio da política para evitar comportamentos diferentes entre cadastro e onboarding.
- Persistir progresso por empresa com autenticação e isolamento de acesso, sem usar armazenamento do navegador como controle de permissão.
- Manter o cadastro sem dados de demonstração e preservar as restrições existentes de convites e WhatsApp.
- Atualizar documentação, decisões de arquitetura e lista de tarefas durante a implementação.

## Validação
- Testes unitários para ordem das etapas, retomada da configuração e avanço apenas após sucesso do envio.
- Conferir cadastro com confirmação de e-mail, interrupção e retorno, documento inválido, falha no processamento e convites parcialmente enviados.
- Testar a jornada completa com uma conta autorizada e um PDF real, verificando a leitura das regras na tela Política.
- Conferir apresentação em telas grandes e pequenas e manter o login comum direcionando à aplicação.

## Limites
Não publicar automaticamente, não alterar a política da empresa por suposição e não criar dados fictícios de clientes. A expressão “política de crédito” será tratada como o documento de política da empresa usado nas análises de reembolso, sem introduzir um produto de crédito.