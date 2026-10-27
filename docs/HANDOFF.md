# HANDOFF — Estado Vivo do Projeto

> **Atualizado em**: 27/10/2026 15:55 (America/Sao_Paulo)
> **Branch**: `main`
> **Como rodar**: `node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173` (URL `http://127.0.0.1:5173/`)
> **Cache-buster ativo**: não se aplica

---

## 1. Último commit registrado
- **Hash**: `905c718`
- **Mensagem**: `feat(dados): sincronizar competencia oficial 10/2026 e subir localhost`
> Este é o commit anterior ao que gravou este HANDOFF. Confira com `git log -3 --oneline`.

## 2. Pronto e validado
- Excludências (tipo 2 da tabela unificada) aparecem sozinhas no card, na ficha lateral e na ficha completa: alerta ao lado do favorito e faixa vermelha “Não cobrar junto”.
- Conferido no navegador com códigos oficiais: `02.07.03.005-7` (1 par), `03.03.05.003-9` (15 pares, lista 3 + “e mais 12”) e `01.01.01.001-0` (sem faixa nem alerta).
- `tsc --noEmit` ok. Vite em `http://127.0.0.1:5173/`.

## 3. Em andamento / pendente
- SHA-256 de integridade da tabela ainda não implementado.
- Aba Histórico da ficha só usa `public/data/diff.json` (07×08); não inventar série.
- Novembro–dezembro/2026 ainda não constam no FTP DATASUS.
- ADRs 001–005 ainda marcados como inferidos no bootstrap — Henry confirmar.
- Gzip das competências em `data/competencias/` permanece gitignored (só o JSON empacotado em `public/data/` vai no git).
- A mesa local pode estar numa competência diferente da empacotada 10/2026 (ex.: 09/2026 no seletor).

## 4. Arquivos modificados nesta sessão
- `src/components/Excludencia.tsx`, `src/components/ProcedureCard.tsx`, `src/components/ProcedurePanel.tsx`, `src/components/SearchResults.tsx`, `src/components/FavoritesSession.tsx`, `src/pages/Procedure.tsx`, `src/pages/Favoritos.tsx`, `src/lib/format.ts`, `docs/HANDOFF.md`, `docs/CHANGELOG.md`, `docs/DECISOES.md`.

## 5. Próximo passo exato
- Henry usa a faixa no dia a dia (mesa + pesquisa) e pede ajuste visual se quiser mostrar os pares restantes na ficha, ou confirma os ADRs 001–005.
