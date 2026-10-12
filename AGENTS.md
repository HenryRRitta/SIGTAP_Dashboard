# AGENTS.md — Diretrizes Universais para Agentes de IA

> **Leitura obrigatória para qualquer IA (Claude Code, Cursor, Antigravity, ChatGPT/Codex).**
> Este repositório é trabalhado em pair programming com Henry, alternando entre ferramentas de IA que **não compartilham memória de chat**. Toda memória persistente está em `AGENTS.md` e na pasta `docs/`.

---

## 1. Ordem obrigatória de leitura
1. `AGENTS.md` (este arquivo)
2. `docs/HANDOFF.md`: estado vivo, último commit, versões de cache, próximo passo
3. `docs/PROTOCOLO_IAS.md`: regras de gravação e conduta
4. `docs/DECISOES.md`: decisões fechadas (append-only; nunca desfazer)
5. `docs/CHANGELOG.md`: histórico (entradas novas no topo)
6. `docs/rotinas/INICIO.md` e `docs/rotinas/ENCERRAMENTO.md`: fluxos `/inicio` e `/encerramento`

## 2. Regras fundamentais
1. **Idioma**: Português do Brasil.
2. **Memória no mesmo turno**: nunca dizer "feito/concluído" sem atualizar `docs/HANDOFF.md` e `docs/CHANGELOG.md`.
3. **Dados reais**: nunca inventar dados, números, metas, nomes ou regras de negócio da Tabela Unificada. Fontes oficiais: RSS `http://sigtap.datasus.gov.br/tabela-unificada/competencias.rss`, FTP `ftp://ftp2.datasus.gov.br/pub/sistemas/tup/downloads/`, ZIPs `TabelaUnificada_*.zip` parseados em `src/lib/parseZip.ts`, catálogo local `data/competencias/index.json` e JSON empacotado `public/data/sigtap.json`. Números de procedimento/CID/CBO/valores só saem dessas bases. Na dúvida, perguntar.
4. **Cache-buster**: não se aplica. O `index.html` carrega `/src/main.tsx` via Vite, sem `?v=` em JS/CSS.
5. **Git local estrito**: só commits locais em Conventional Commits (`tipo(área): frase curta`). NUNCA `git push`, `rebase`, `reset --hard`, `--no-verify` ou alteração de `git config`.
6. **Layout**: menu superior permanente; sem sidebar fixa. Identidade visual SIGTAP Executive (`layout-chatgpt/docs/`). O pacote `layout-chatgpt/starter/` é demonstrativo e **não** é base oficial de dados.
7. **Protótipo**: dados do starter ChatGPT não entram na UI operacional.

## 3. Visão geral do projeto
- **Objetivo**: mesa de consulta da Tabela Unificada de Procedimentos, Medicamentos e OPM do SUS (SIGTAP) para auditoria médica, no visual SIGTAP Executive · FluxSUS.
- **Stack**: Vite 7, React 19, TypeScript, Tailwind CSS v4, React Router 7, MiniSearch, JSZip, lucide-react (`package.json`).
- **Como executar**: `npm run dev` (Vite, porta 5173) ou `npx vite --host 127.0.0.1 --port 5173`. Build: `npm run build`.
- **Arquivos principais**:
  - `src/App.tsx`, `src/components/Layout.tsx`, `src/components/TopNav.tsx`
  - `src/pages/Home.tsx`, `src/lib/store.tsx`, `src/lib/parseZip.ts`
  - `scripts/sigtapUpdate.ts` (plugin Vite: RSS/FTP, listar/baixar competências)
  - `public/data/sigtap.json` (competência empacotada)
  - `data/competencias/` (gzip por competência; gitignored)

## 4. Rotinas
- Ao iniciar uma sessão ou receber `/inicio` → `docs/rotinas/INICIO.md`.
- Ao concluir uma entrega ou receber `/encerramento` (ou `/encerrar`) → `docs/rotinas/ENCERRAMENTO.md`.
