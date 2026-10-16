# CHANGELOG

Alterações notáveis do projeto. Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
**Entradas novas sempre no topo. Nunca edite entradas antigas.**

---

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
