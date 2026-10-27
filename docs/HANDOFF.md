# HANDOFF — Estado Vivo do Projeto

> **Atualizado em**: 27/10/2026 15:58 (America/Sao_Paulo)
> **Branch**: `main`
> **Como rodar**: `node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173` (URL `http://127.0.0.1:5173/`)
> **Cache-buster ativo**: não se aplica

---

## 1. Último commit registrado
- **Hash**: `bd2d02d`
- **Mensagem**: `feat(mesa): sinalizar excludencias no card e na ficha`
> Este é o commit anterior ao que gravou este HANDOFF. Confira com `git log -3 --oneline`.

## 2. Pronto e validado
- Typeahead marca com pill azul “CID” quando o termo parece CID-10 (ex.: `j100` → `03.03.14.015-1`). Busca por nome (ex.: “gripe”) não mostra a pill.
- Faixa de excludência no rodapé da ficha lateral e da ficha completa.
- `tsc --noEmit` ok. Vite em `http://127.0.0.1:5173/`.

## 3. Em andamento / pendente
- SHA-256 de integridade da tabela ainda não implementado.
- Aba Histórico da ficha só usa `public/data/diff.json` (07×08); não inventar série.
- Novembro–dezembro/2026 ainda não constam no FTP DATASUS.
- ADRs 001–005 ainda marcados como inferidos no bootstrap — Henry confirmar.
- Gzip das competências em `data/competencias/` permanece gitignored (só o JSON empacotado em `public/data/` vai no git).
- A mesa local pode estar numa competência diferente da empacotada 10/2026 (ex.: 09/2026 no seletor).

## 4. Arquivos modificados nesta sessão
- `src/components/TypeaheadField.tsx`, `src/components/ProcedurePanel.tsx`, `src/pages/Procedure.tsx`, `docs/HANDOFF.md`, `docs/CHANGELOG.md`.

## 5. Próximo passo exato
- Henry testa a pill CID na busca da mesa (`j100`) e a faixa no rodapé da ficha; pede ajuste se quiser a mesma pill na tabela de resultados.
