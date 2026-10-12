# Especificação UI/UX

## Hierarquia da tela operacional
1. Barra superior horizontal: logo `SIGTAP EXECUTIVE`, links de seção, seletor de competência, campo de busca global, notificações e perfil. Sem sidebar fixa.
2. Faixa KPI: cards dos totais do conjunto efetivamente importado e competência atual. Indicadores comparativos com competência anterior somente se houver fonte e cálculo válidos.
3. Filtros: seletor de categoria + campo de busca grande + botão Buscar + filtros avançados expansíveis e chips removíveis. Tecla Enter inicia a busca; Esc fecha menus/modal.
4. Corpo principal: resultados em tabela à esquerda; ficha detalhada selecionada à direita. Clique numa linha atualiza ficha e URL/estado, sem perder filtros ou rolagem.
5. Ficha: cabeçalho código, descrição, etiquetas; atributos classificatórios; abas Valores, Atributos, CID/CBO, Compatibilidades, Histórico. Totalização conforme definições oficiais; usar travessão para dado ausente, jamais zero implícito.
6. Histórico: gráfico com tooltip, legenda, eixo temporal e tabela de variação por competência; se só houver uma competência, exibir mensagem explicativa.
7. Área de status da base/gestão: competência ativa, horário de importação, arquivo/fonte, checksum quando disponível, quantidade de registros, consistência, alertas e log; acesso pela navegação/configuração sem ocupar o painel de consulta o tempo todo.

## Recursos obrigatórios
- Busca universal: código, descrição, CID, CBO e combinações.
- Ficha SIGTAP: atributos oficiais completos da entidade selecionada.
- Valores SUS: SA, SH, SP, total ambulatorial/hospitalar segundo esquema oficial.
- Histórico: comparação entre competências por código, indicando inclusões/alterações/exclusões.
- Compatibilidades: relações, regras e restrições, com filtros.
- Base local: seleção/importação de competência mensal oficial.
- Controle de integridade: competência, data/hora, origem, validação e rastreabilidade.

## Interações detalhadas
- Nenhum resultado: mostrar contexto, termo, filtros ativos e ação Limpar filtros.
- Enquanto carrega: skeleton leve; falha: texto claro, opção de tentar novamente.
- Sem base instalada: onboarding com chamada para importar competência, sem cards com números falsos.
- Competência alterada: invalida resultados e ficha anteriores e consulta novamente a fonte daquela competência.
- Ordenação da tabela por colunas compatíveis; valores monetários alinhados à direita, tipografia tabular.
- Busca longa: debounce opcional (~250ms), mas Enter deve disparar imediatamente.
- Mobile/tablet: KPIs em grade reduzida, tabela com rolagem horizontal e ficha como painel abaixo ou drawer.
- Exportação, quando implementada: registrar competência/filtros e informar data da extração.

## Wireframe textual (desktop)
`[LOGO][INÍCIO PROC MED OPM CONSULTAS COMPAT RELAT] [COMPETÊNCIA][BUSCA GLOBAL][STATUS]`
`[ KPI 1 ][ KPI 2 ][ KPI 3 ][ KPI 4 ][ KPI 5 ][ KPI competência ]`
`[Categoria][ Busca universal................................][Buscar][Filtros]`
`[ TABELA RESULTADOS (≈ 68%)             ][ FICHA (≈ 32%) ]`
`[ Código / Descrição / atributos / valores][Resumo e abas ]`
`[ rolagem própria, seleção azul           ][Valores/Histórico]`

A faixa inferior de 'Arquitetura funcional', cores e componentes na prancha visual é documentação do produto, não parte fixa da tela de consulta. Distribuir esses recursos em telas e navegação reais.
