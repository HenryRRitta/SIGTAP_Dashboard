# HANDOFF — Estado Vivo do Projeto

> **Atualizado em**: 11/10/2026 23:31 (America/Sao_Paulo)
> **Branch**: `main`
> **Como rodar**: `npx vite --host 127.0.0.1 --port 5173` (URL `http://127.0.0.1:5173/`)
> **Cache-buster ativo**: não se aplica

---

## 1. Último commit registrado
- **Hash**: `bdc63ff`
- **Mensagem**: `docs(governanca): criar estrutura de memoria multi-ia`
> Este é o commit anterior ao que gravou este HANDOFF. Confira com `git log -3 --oneline`.

## 2. Pronto e validado
- Mesa SIGTAP Executive no ar (HTTP 200 em `http://127.0.0.1:5173/`), menu superior, sem sidebar permanente.
- Competências oficiais jan–set/2026 no seletor (FTP DATASUS). Empacotada: 09/2026, `TabelaUnificada_202609_v2610050950.zip`, 5.023 procedimentos (`data/competencias/index.json`).
- Typeahead nos campos de busca; seleção de sugestão abre a ficha (ex.: ALTEPLASE 10MG → `06.03.05.004-2`).
- `tsc --noEmit` ok neste encerramento.

## 3. Em andamento / pendente
- SHA-256 de integridade da tabela ainda não implementado.
- Aba Histórico da ficha só usa `public/data/diff.json` (07×08); não inventar série.
- Outubro–dezembro/2026 não constam no FTP (conferido em 11/10/2026).
- ADRs 001–005 ainda marcados como inferidos no bootstrap — Henry confirmar.
- Gzip das competências em `data/competencias/` permanece gitignored (só o JSON empacotado em `public/data/` vai no git).

## 4. Arquivos modificados nesta sessão
- App Executive, top nav, home, typeahead, API de competência, store/IndexedDB, `public/data/sigtap.json*`, `layout-chatgpt/`, `scripts/sigtapUpdate.ts`, docs de memória.

## 5. Próximo passo exato
- Henry confirma os ADRs em `docs/DECISOES.md` ou pede a próxima feature (ex.: SHA-256, histórico multi-competência, ou UI extra).
