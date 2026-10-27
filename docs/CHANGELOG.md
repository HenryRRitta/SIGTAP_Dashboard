# CHANGELOG

Alterações notáveis do projeto. Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
**Entradas novas sempre no topo. Nunca edite entradas antigas.**

---

## [2026-10-27] - renomear-coluna-compatibilidade

### Alterado
- Coluna da tabela da mesa renomeada de "Status" para "Compatibilidade" (`src/pages/Home.tsx`).

## [2026-10-27] - status-relacoes-tabela

### Adicionado
- Coluna Status entre Complexidade e SA na mesa (`src/pages/Home.tsx`): ícone verde (link para a ficha) quando há compatibilidades (tipos 1, 3, 4 e 5) e triângulo vermelho quando há excludência (tipo 2), lidos de `rl_procedimento_compativel`.
- Typeahead da busca: pill “N compatibilidades” e triângulo de excludência ao lado do código (`src/components/TypeaheadField.tsx`).

### Alterado
- Mesa empilha a tabela em largura total e a ficha abaixo; valores, classificação e cards da ficha passam a usar a linha inteira (`src/pages/Home.tsx`, `src/components/ProcedurePanel.tsx`).
- Badge verde da coluna Status passa a mostrar a quantidade de compatibilidades no lugar do ícone de elo (`src/components/Excludencia.tsx`).

## [2026-10-27] - cards-ficha-lateral

### Adicionado
- Cards sempre visíveis abaixo da tarja de excludência na ficha lateral: Atributos, Compatibilidades, CID (principal + secundário), CBO e Histórico (`src/components/ProcedurePanel.tsx`).

### Removido
- Abas da ficha lateral (Valores ficou fixo no topo; o restante não precisa mais de clique).

## [2026-10-27] - filtro-complexidade-barra

### Adicionado
- Botões de complexidade na barra “Registros encontrados” da mesa: Todas, Não se aplica, Atenção Básica, Média complexidade e Alta complexidade (`src/pages/Home.tsx`), com os rótulos oficiais de `lookups.complexidade`.

## [2026-10-27] - pill-cid-typeahead

### Adicionado
- Pill “CID” na sugestão azul do typeahead quando a busca casa com um código CID-10 (`src/components/TypeaheadField.tsx`). Busca por nome ou código SIGTAP não mostra a pill.

### Alterado
- Faixa “Não cobrar junto” passou para o rodapé da ficha lateral e da ficha completa, abaixo de chips e conteúdo (`src/components/ProcedurePanel.tsx`, `src/pages/Procedure.tsx`).

## [2026-10-27] - excludencias-no-card

### Adicionado
- Faixa “Não cobrar junto” no rodapé do card, na ficha lateral e na ficha completa, só quando `rl_procedimento_compativel.tp_compatibilidade` for tipo 2 (`src/components/Excludencia.tsx`).
- Ícone de alerta ao lado da estrela de favorito nos mesmos pontos, mais catálogo/pesquisa, favoritos e sessão rápida.

### Alterado
- `excludenciasOf` em `src/lib/format.ts` passa a listar os pares excludentes oficiais, sem misturar `rel.excecoes`.

## [2026-10-16] - sincronizacao-competencia-10-2026

### Adicionado
- Competência oficial 10/2026 baixada do FTP do DATASUS (`TabelaUnificada_202610_v2610151110.zip`) com 5.039 procedimentos.

### Alterado
- Base ativa empacotada em `public/data/sigtap.json` e `public/data/sigtap.json.gz` atualizada para 10/2026.
- Servidor Vite inicializado e respondendo em `http://127.0.0.1:5173/`.

## [2026-10-11] - executive-competencias-typeahead

### Adicionado
- Layout SIGTAP Executive: top nav sem sidebar, workspace 68/32, KPIs e ficha com dados oficiais (`src/components/TopNav.tsx`, `src/pages/Home.tsx`, `src/index.css`).
- Seletor de competência 01/2026–09/2026 via FTP DATASUS (`src/components/CompetenciaSelect.tsx`, `scripts/sigtapUpdate.ts`).
- Typeahead nos campos de pesquisa (`src/components/TypeaheadField.tsx`).
- Favoritos, Relatórios, atualização automática de competência, persistência IndexedDB.
- Pacote de referência `layout-chatgpt/` (docs + starter demonstrativo, sem dados oficiais).

### Alterado
- Competência empacotada em `public/data/sigtap.json` passou a 09/2026 (`TabelaUnificada_202609_v2610050950.zip`).
- `.gitignore` ignora `data/zips` e `data/competencias`.

## [2026-10-11] - governança

### Adicionado
- Estrutura de memória multi-IA: `AGENTS.md`, `docs/HANDOFF.md`, `docs/PROTOCOLO_IAS.md`, `docs/DECISOES.md`, `docs/CHANGELOG.md`, `docs/rotinas/`.
