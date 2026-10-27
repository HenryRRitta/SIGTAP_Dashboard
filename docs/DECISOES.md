# DECISÕES ARQUITETURAIS E DE NEGÓCIO (APPEND-ONLY)

> **Regra**: append-only. Nunca reverter ou editar uma decisão sem autorização explícita do usuário. Novas decisões vão ao final, com numeração sequencial.

---

### [ADR-001] Stack da mesa
- **Data**: 11/10/2026
- **Contexto**: o `package.json` define a aplicação como Vite + React + TypeScript.
- **Decisão**: Vite 7, React 19, TypeScript, Tailwind CSS v4, React Router 7, MiniSearch, JSZip.
- **Status**: inferida no bootstrap — confirmar com o usuário

### [ADR-002] Fonte da tabela é o ZIP oficial DATASUS
- **Data**: 11/10/2026
- **Contexto**: a UI operacional não pode usar os números do protótipo `layout-chatgpt/starter`.
- **Decisão**: procedimentos, CID, CBO e valores vêm do parse de `TabelaUnificada_*.zip` (`src/lib/parseZip.ts`). Download oficial via RSS + FTP DATASUS (`scripts/sigtapUpdate.ts`).
- **Status**: inferida no bootstrap — confirmar com o usuário

### [ADR-003] Shell Executive sem sidebar permanente
- **Data**: 11/10/2026
- **Contexto**: o pacote `layout-chatgpt/docs/` e o pedido de implementação exigem menu superior.
- **Decisão**: navegação principal na top nav; ferramentas de auditoria no overflow “Auditoria”; identidade navy/canvas Executive em `src/index.css`.
- **Status**: inferida no bootstrap — confirmar com o usuário

### [ADR-004] Persistência local da competência ativa
- **Data**: 11/10/2026
- **Contexto**: F5 não deve perder a tabela importada.
- **Decisão**: IndexedDB `mesa-sigtap` / store `tabela`; favoritos/recents/uso em localStorage (`mesa-pinned`, `mesa-recent`, `mesa-usage`); competência escolhida em `mesa-competencia-ativa`; arquivos gzip em `data/competencias/{AAAAMM}.json.gz`.
- **Status**: inferida no bootstrap — confirmar com o usuário

### [ADR-005] Git só local nas sessões de IA
- **Data**: 11/10/2026
- **Contexto**: o repositório é compartilhado entre IAs e o responsável.
- **Decisão**: IAs fazem apenas commit local. Sem push, rebase, `--no-verify` ou alteração de `git config`.
- **Status**: inferida no bootstrap — confirmar com o usuário

### [ADR-006] Typeahead em todos os campos de pesquisa
- **Data**: 11/10/2026
- **Contexto**: Henry pediu typeahead para não precisar completar a palavra nem clicar em Buscar.
- **Decisão**: componente `TypeaheadField` nas buscas da home, top nav, SearchBox, CID/CBO, comparar, compatibilidades, auditoria, glosas, catálogo, favoritos e regras. Setas/Enter/clique escolhem o item.
- **Status**: fechada com o usuário

### [ADR-007] Catálogo local das competências oficiais de 2026
- **Data**: 11/10/2026
- **Contexto**: Henry pediu baixar todas as competências de 2026 e deixá-las no seletor da top nav.
- **Decisão**: listar e baixar do FTP DATASUS o último ZIP de cada mês; gravar gzip em `data/competencias/`; o seletor troca a tabela ativa. Só entram meses publicados no FTP.
- **Status**: fechada com o usuário

### [ADR-008] Excludência visível no card e na ficha
- **Data**: 27/10/2026
- **Contexto**: Henry pediu sinalizar automaticamente os pares excludentes da tabela unificada, com destaque visual e alerta ao lado do favorito.
- **Decisão**: usar só `rl_procedimento_compativel` tipo 2 (`tp_compatibilidade` = Excludente). Não misturar com `rel.excecoes`. Faixa “Não cobrar junto” no rodapé do card/ficha; ícone de alerta só quando houver pelo menos um par. Até 3 códigos na faixa; o restante vira “e mais N”.
- **Status**: fechada com o usuário

