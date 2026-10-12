# SIGTAP Executive — pacote de layout para implementação

Destino desejado no Windows: `C:\Users\henry\OneDrive\_Meus Projetos\_Tabela SIGTAP\layout-chatgpt`

Este é um pacote de **referência visual + especificação + starter de interface**, não uma importação completa do SIGTAP. Os valores e registros de demonstração são fictícios/ilustrativos e NÃO podem ser considerados conteúdo oficial. O layout reflete a opção 01, acrescida dos recursos da arquitetura funcional solicitada.

## Conteúdo
- `referencias/01-layout-executive.png`: principal referência visual aprovada (usar como norte de estilo, não transcrever seus números).
- `referencias/02-conceitos-originais.png`: conceitos anteriores para contexto.
- `referencias/03-requisitos-funcionais.png`: imagem dos módulos solicitados.
- `docs/01-PROMPT-MESTRE.md`: instrução pronta para colar em outra IA.
- `docs/02-ESPECIFICACAO-UI-UX.md`: estrutura, comportamento e layout responsivo.
- `docs/03-DESIGN-SYSTEM.md`: tokens visuais e estados.
- `docs/04-DADOS-E-INTEGRACAO.md`: dados, contratos sugeridos, importação e integridade.
- `docs/05-CRITERIOS-DE-ACEITE.md`: checklist de conclusão.
- `starter/`: interface React/Vite exemplificativa, com dados explicitamente demonstrativos, interações de busca, filtros, seleção de procedimentos, abas e competência.

## Como usar com outra IA
Abra seu projeto existente e forneça à IA o arquivo `docs/01-PROMPT-MESTRE.md` e os demais documentos desta pasta. A IA deve primeiro inspecionar o repositório existente, manter o menu superior e a stack do projeto quando houver, e integrar o layout — sem sobrescrever arbitrariamente arquivos preexistentes.

## Executar o starter opcional
Na pasta `starter`, execute `npm install` e `npm run dev` (Node.js LTS). É uma prévia de interface, não um sistema de faturamento nem um leitor oficial de bases DATASUS.

## Observação
A competência `03/2025`, códigos e números do mockup original foram utilizados apenas como linguagem visual; toda informação exibida em produção deverá ser originada de base oficial SIGTAP importada e etiquetada com a competência correspondente.
