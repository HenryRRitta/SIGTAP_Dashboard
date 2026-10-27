# HANDOFF — Estado Vivo do Projeto

> **Atualizado em**: 27/10/2026 16:43 (America/Sao_Paulo)
> **Branch**: `main`
> **Como rodar**: `node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173` (URL `http://127.0.0.1:5173/`)
> **Cache-buster ativo**: não se aplica

---

## 1. Último commit registrado
- **Hash**: `1127695`
- **Mensagem**: `feat(mesa): cards da ficha sempre visiveis abaixo da tarja`
> Este é o commit anterior ao que gravou este HANDOFF. Confira com `git log -3 --oneline`.

## 2. Pronto e validado
- Mesa com tabela em largura total e ficha empilhada abaixo. Coluna Compatibilidade entre Complexidade e SA: badge verde com a quantidade e alerta vermelho de excludência.
- Typeahead da busca mostra pill “N compatibilidades” ao lado do código e o triângulo quando há excludência.
- Choque cardiogênico `03.03.06.006-9`: 4 compatibilidades oficiais no typeahead e na coluna.
- Infarto `03.03.06.019-0`: 10 compatibilidades, inclusive as três alteplases (`06.03.05.004-2`, `06.03.05.005-0`, `06.03.05.006-9`).
- Ressonância `02.07.03.005-7`: 2 compatibilidades (contraste e sedação) + 1 excludência (`02.07.03.002-2`).
- `tsc --noEmit` ok.

## 3. Em andamento / pendente
- SHA-256 de integridade da tabela ainda não implementado.
- Aba Histórico da ficha completa ainda usa só `public/data/diff.json` (07×08); não inventar série.
- Novembro–dezembro/2026 ainda não constam no FTP DATASUS.
- ADRs 001–005 ainda marcados como inferidos no bootstrap — Henry confirmar.
- Gzip das competências em `data/competencias/` permanece gitignored.

## 4. Arquivos modificados nesta sessão
- `src/pages/Home.tsx`, `src/components/ProcedurePanel.tsx`, `src/components/Excludencia.tsx`, `src/components/TypeaheadField.tsx`, `src/lib/format.ts`, `docs/HANDOFF.md`, `docs/CHANGELOG.md`.

## 5. Próximo passo exato
- Henry usa a mesa com a coluna Compatibilidade e as pills do typeahead; pedir ajuste de tamanho/ordem se a pill “N compatibilidades” apertar o dropdown em telas estreitas.
