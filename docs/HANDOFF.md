# HANDOFF — Estado Vivo do Projeto

> **Atualizado em**: 11/10/2026 23:22 (America/Sao_Paulo)
> **Branch**: `main`
> **Como rodar**: `npx vite --host 127.0.0.1 --port 5173` (URL `http://127.0.0.1:5173/`)
> **Cache-buster ativo**: não se aplica

---

## 1. Último commit registrado
- **Hash**: `85bef5b`
- **Mensagem**: `Commit inicial do dashboard Mesa SIGTAP no GitHub.`
> Este é o commit anterior ao que gravou este HANDOFF. Confira com `git log -3 --oneline`.

## 2. Pronto e validado
- Consulta da Tabela Unificada no visual SIGTAP Executive (menu superior, sem sidebar permanente), verificado no navegador.
- Competências oficiais 01/2026 a 09/2026 gravadas em `data/competencias/` a partir do FTP DATASUS; seletor na top nav troca a tabela ativa. Catálogo em `data/competencias/index.json` (ex.: 09/2026 = 5.023 procedimentos no ZIP `TabelaUnificada_202609_v2610050950.zip`).
- Typeahead nos campos de pesquisa (home, top nav, SearchBox, CID/CBO, comparar, regras).
- Atualização de competência via RSS + FTP (`/api/competencia/*` no plugin Vite); persistência IndexedDB `mesa-sigtap` + favoritos em localStorage.
- `tsc --noEmit` passou após typeahead.

## 3. Em andamento / pendente
- Toda a entrega Executive + competências 2026 + typeahead **ainda não está no git** (só o commit inicial `85bef5b`). Falta `/encerramento` para commitar o código.
- Integridade SHA-256 da tabela ainda não implementada.
- Aba Histórico da ficha só usa variação disponível em `public/data/diff.json` (07×08); não há série de competências inventada.
- Outubro–dezembro/2026 não existem no FTP oficial (lista conferida em 11/10/2026).
- Confirmar ADRs inferidos no bootstrap (`docs/DECISOES.md`).

## 4. Arquivos modificados na última sessão
- Governança criada agora: `AGENTS.md`, `docs/*`.
- Código ainda untracked/modificado (não incluído neste commit de governança): `src/**`, `scripts/sigtapUpdate.ts`, `index.html`, `vite.config.ts`, `.gitignore`, `public/data/sigtap.json*`, pasta `layout-chatgpt/`.

## 5. Próximo passo exato
- Henry decide a próxima tarefa; se a entrega Executive deve ir para o histórico git, pedir `/encerrar` (commit local único do código + docs, sem push).
