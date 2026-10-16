# HANDOFF — Estado Vivo do Projeto

> **Atualizado em**: 16/10/2026 16:48 (America/Sao_Paulo)
> **Branch**: `main`
> **Como rodar**: `node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173` (URL `http://127.0.0.1:5173/`)
> **Cache-buster ativo**: não se aplica

---

## 1. Último commit registrado
- **Hash**: `a7c2e35`
- **Mensagem**: `feat(mesa): layout executive, competencias 2026 e typeahead`
> Este é o commit anterior ao que gravou este HANDOFF. Confira com `git log -3 --oneline`.

## 2. Pronto e validado
- Servidor de desenvolvimento Vite ativo e respondendo em `http://127.0.0.1:5173/` (HTTP 200).
- Competência oficial 10/2026 baixada diretamente do FTP DATASUS (`TabelaUnificada_202610_v2610151110.zip`, liberada em 15/10/2026) e sincronizada como padrão em `public/data/sigtap.json` com 5.039 procedimentos.
- Catálogo local cobrindo competências 01/2026 até 10/2026 (`data/competencias/index.json`).
- Typeahead nos campos de busca; seleção de sugestão abre a ficha (ex.: ALTEPLASE 10MG → `06.03.05.004-2`).
- `tsc --noEmit` ok neste encerramento.

## 3. Em andamento / pendente
- SHA-256 de integridade da tabela ainda não implementado.
- Aba Histórico da ficha só usa `public/data/diff.json` (07×08); não inventar série.
- Novembro–dezembro/2026 ainda não constam no FTP DATASUS.
- ADRs 001–005 ainda marcados como inferidos no bootstrap — Henry confirmar.
- Gzip das competências em `data/competencias/` permanece gitignored (só o JSON empacotado em `public/data/` vai no git).

## 4. Arquivos modificados nesta sessão
- `public/data/sigtap.json`, `public/data/sigtap.json.gz`, `docs/HANDOFF.md`, `docs/CHANGELOG.md`.

## 5. Próximo passo exato
- Henry confirma os ADRs em `docs/DECISOES.md` ou solicita a próxima feature (ex.: SHA-256, histórico multi-competência, ou telas adicionais).
