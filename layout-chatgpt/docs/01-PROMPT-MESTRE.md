# PROMPT-MESTRE — IMPLEMENTAR SIGTAP EXECUTIVE

Você é um engenheiro frontend sênior e designer de produto especializado em sistemas hospitalares. Implemente no projeto local existente a interface **SIGTAP Executive — opção 01**, conforme `referencias/01-layout-executive.png`, complementada pelos módulos de `referencias/03-requisitos-funcionais.png`. Leia TODOS os arquivos em `docs/` antes de alterar o projeto.

**Objetivo:** plataforma desktop-first de consulta local/offline da tabela oficial SIGTAP (procedimentos, medicamentos e OPM do SUS), com experiência executiva premium e alta densidade informacional sem poluição visual.

**REGRA CRÍTICA:** NÃO criar sidebar permanente. O usuário já utiliza menu SUPERIOR horizontal. Preserve a estrutura tecnológica, rotas, autenticação, componentes, nomenclaturas e integrações já existentes; primeiro examine o repositório e proponha mudanças mínimas. Use o starter apenas como referência se houver conflito com a stack existente.

## Entregáveis
1. Dashboard responsiva fiel à referência visual (não incluir os painéis de design system na tela operacional: estão na prancha apenas como documentação).
2. Menu superior: Início, Procedimentos, Medicamentos, OPM, Consultas/Favoritos, Compatibilidades, Relatórios; seletor de competência, pesquisa global, status da base e ações de usuário.
3. Cards de indicadores calculados EXCLUSIVAMENTE dos dados importados: total de procedimentos e subdivisões quando aplicável, medicamentos, OPM, competência ativa. Se não houver dados, mostrar estados vazios, jamais números inventados.
4. Busca universal por código, descrição, CID e CBO (busca via índices relacionais apropriados); filtros avançados por grupo/subgrupo, forma de organização, complexidade, modalidade, financiamento, instrumento de registro, habilitação e atributos existentes na base.
5. Tabela principal com ordenação, paginação/virtualização, campos configuráveis e linha selecionada em azul suave.
6. Painel de ficha à direita com código/descrição, informações classificatórias, valores SA/SH/SP e totais conforme regras oficiais; abas Valores, Atributos, CID/CBO, Compatibilidades, Histórico. Não somar métricas distintas como se fossem sempre equivalentes: utilizar definições da fonte e sinalizar ausências.
7. Evolução entre competências por procedimento, com indicação de fonte/competência e diferenças calculadas somente quando registros comparáveis estiverem disponíveis.
8. Tela de Base Local: importar arquivos oficiais DATASUS/SIGTAP com validação de formato, competência, integridade, duplicidade, logs de execução e rollback seguro; informar versão, data de importação, fonte e estado da base. Operação offline após a importação.
9. Favoritos e consultas recentes persistidos localmente; exportação dos resultados com competência e filtros aplicados quando a aplicação tiver este recurso.
10. Todos os elementos funcionais navegáveis com estados de carregando, vazio, erro e êxito. Acessibilidade: teclado, foco visível, contraste suficiente, sem depender só da cor.

## Fluxo prioritário
Selecionar competência → buscar procedimento → filtrar resultados → selecionar linha → visualizar ficha e valores → conferir CID/CBO/compatibilidades → comparar histórico. A competência ativa deve filtrar TODOS os indicadores, buscas, fichas e exportações; nunca misturar registros de meses diferentes sem rotular uma comparação explícita.

## UI
Adotar tokens de `docs/03-DESIGN-SYSTEM.md`. Layout em desktop: cabeçalho superior de 64–68px; cards KPI; barra de busca e filtros; corpo em duas colunas (aprox. 68% resultados / 32% ficha, ajustável); tabelas com cabeçalho fixo e rolagem independente; cards brancos, fundo cinza gelo, azul-marinho institucional, cantos discretos e sombras muito sutis. Em telas menores, ficha passa a drawer/painel inferior. Não usar dados da imagem como verdade; são mockups fictícios.

## Contratos e domínio
Ler `docs/04-DADOS-E-INTEGRACAO.md`. Separar adapter de dados do frontend; preferir SQLite local ou banco já adotado no projeto. Importar layout e lógica sem alterar dados oficiais nem inventar equivalências. Expor à interface `competencias`, `resumoCompetencia`, `buscarProcedimentos`, `detalheProcedimento`, `historicoProcedimento`, `statusImportacao`.

## Etapas de execução
(a) Inspecionar projeto; (b) apresentar plano de arquivos a alterar; (c) implementar design tokens e shell com menu existente; (d) tela de consulta e ficha; (e) adapters e estados; (f) importação/integração com fonte oficial disponível; (g) testar filtros, competência e responsividade; (h) entregar resumo, caminhos alterados, comandos e limitações pendentes. Não alegar integração real enquanto só houver dados de demonstração.

## Critérios de aceite
Seguir `docs/05-CRITERIOS-DE-ACEITE.md`. A implementação final deve preservar a identidade Executive e exibir explicitamente os sete recursos: Busca universal, Ficha SIGTAP, Valores SUS, Histórico, Compatibilidades, Base local e Controle de integridade.
