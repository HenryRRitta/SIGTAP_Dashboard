# HANDOFF — Estado Vivo do Projeto

> **Atualizado em**: 27/10/2026 16:15 (America/Sao_Paulo)
> **Branch**: `main`
> **Como rodar**: `node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173` (URL `http://127.0.0.1:5173/`)
> **Cache-buster ativo**: não se aplica

---

## 1. Último commit registrado
- **Hash**: `52b3aa5`
- **Mensagem**: `feat(mesa): filtrar complexidade na barra da tabela`
> Este é o commit anterior ao que gravou este HANDOFF. Confira com `git log -3 --oneline`.

## 2. Pronto e validado
- Ficha lateral sem abas: valores no topo; abaixo da tarja, cards de Atributos, Compatibilidades, CID (principal+secundário), CBO e Histórico.
- Conferido em `02.07.03.005-7` (C61, D075, CBO 225320, 3 compatibilidades oficiais). Histórico continua só com `public/data/diff.json` (07×08).
- `tsc --noEmit` ok.

## 3. Em andamento / pendente
- SHA-256 de integridade da tabela ainda não implementado.
- Aba Histórico da ficha completa ainda usa só `public/data/diff.json` (07×08); não inventar série.
- Novembro–dezembro/2026 ainda não constam no FTP DATASUS.
- ADRs 001–005 ainda marcados como inferidos no bootstrap — Henry confirmar.
- Gzip das competências em `data/competencias/` permanece gitignored.

## 4. Arquivos modificados nesta sessão
- `src/components/ProcedurePanel.tsx`, `docs/HANDOFF.md`, `docs/CHANGELOG.md`.

## 5. Próximo passo exato
- Henry usa a ficha lateral com os cards sempre visíveis e pede ajuste de ordem/altura se a lista de CBO/compat ficar longa.
