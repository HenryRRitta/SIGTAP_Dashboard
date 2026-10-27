# HANDOFF — Estado Vivo do Projeto

> **Atualizado em**: 27/10/2026 16:02 (America/Sao_Paulo)
> **Branch**: `main`
> **Como rodar**: `node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173` (URL `http://127.0.0.1:5173/`)
> **Cache-buster ativo**: não se aplica

---

## 1. Último commit registrado
- **Hash**: `fb65686`
- **Mensagem**: `feat(mesa): pill CID no typeahead e faixa no rodape da ficha`
> Este é o commit anterior ao que gravou este HANDOFF. Confira com `git log -3 --oneline`.

## 2. Pronto e validado
- Barra da tabela da mesa tem filtro em botões com as complexidades oficiais. Conferido: “Alta complexidade” filtra (09/2026 → 1.644 registros, URL `?cx=3`).
- `tsc --noEmit` ok. Vite em `http://127.0.0.1:5173/`.

## 3. Em andamento / pendente
- SHA-256 de integridade da tabela ainda não implementado.
- Aba Histórico da ficha só usa `public/data/diff.json` (07×08); não inventar série.
- Novembro–dezembro/2026 ainda não constam no FTP DATASUS.
- ADRs 001–005 ainda marcados como inferidos no bootstrap — Henry confirmar.
- Gzip das competências em `data/competencias/` permanece gitignored (só o JSON empacotado em `public/data/` vai no git).
- A mesa local pode estar numa competência diferente da empacotada 10/2026 (ex.: 09/2026 no seletor).

## 4. Arquivos modificados nesta sessão
- `src/pages/Home.tsx`, `docs/HANDOFF.md`, `docs/CHANGELOG.md`.

## 5. Próximo passo exato
- Henry usa o filtro de complexidade na barra da mesa e pede ajuste visual se quiser os botões numa única linha no desktop.
