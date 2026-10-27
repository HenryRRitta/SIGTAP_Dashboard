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


---

## Produção no FluxSUS (contrato de integração)

Este repositório contém a aplicação React 19/Vite da Mesa SIGTAP. Ela é desenvolvida aqui, mas publicada manualmente dentro do FluxSUS. Leia estas regras antes de mudar rotas, assets, dados ou dependências.

### Produção

- URL: `https://fluxsus.auditar.med.br/saladesituacao/sigtap`.
- O FluxSUS é uma aplicação Laravel separada. Ele exige login para o HTML, JavaScript, CSS, imagens e JSON da Mesa SIGTAP.
- O build deste projeto é guardado no FluxSUS em `storage/app/sigtap-dashboard`, fora de `public/`. Colocar arquivos em `public/` no FluxSUS contornaria a autenticação.
- O servidor de produção não compila frontend e não depende de Node ou Python para servir a Mesa. O build é feito fora do servidor e enviado manualmente por rsync/SSH.
- Não há capacidade disponível para depender de GitLab CI/CD nessa publicação. Um push neste GitHub não publica automaticamente. Combine cada release com o responsável pelo FluxSUS.

### Contrato de integração atual

O FluxSUS clona este repositório e executa `scripts/build-sigtap.mjs` do repositório Fluxos. O script instala as dependências do `package-lock.json`, compila com Vite usando base `/saladesituacao/sigtap/` e adapta no clone temporário oito arquivos que hoje presumem a raiz `/`:

- `src/main.tsx`: `BrowserRouter`.
- `src/lib/store.tsx`, `src/pages/Compare.tsx`, `src/components/ProcedurePanel.tsx` e `src/components/AtualizarCompetencia.tsx`: caminhos de `data/*.json`.
- `src/components/BrandMark.tsx` e `src/components/PrintShell.tsx`: caminho do logo.
- `src/lib/workspace.ts`: URLs de impressão.

Se modificar qualquer um desses pontos, avise o responsável pelo FluxSUS e atualize/teste a integração junto. O build do FluxSUS falha de propósito quando não encontra o trecho esperado; isso evita publicar navegação ou dados quebrados. A solução futura preferida é usar `import.meta.env.BASE_URL` neste projeto para todos os caminhos internos, mantendo o funcionamento local em `/` e em produção na subrota. Coordene a troca com o FluxSUS para remover os ajustes temporários no mesmo release.

Novas telas devem funcionar ao recarregar uma URL interna, por exemplo `/saladesituacao/sigtap/procedimento/123`. Links internos devem permanecer na base da aplicação. Requisições a dados e imagens não podem escapar para `/data`, `/brand` ou `/print` na raiz do domínio.

### Antes de entregar mudanças

1. Use Node 20 e o `package-lock.json`; execute `npm ci` e `npm run build` fora de produção.
2. Verifique a página inicial, uma rota interna recarregada, os arquivos de dados, o logo e a impressão com base `/saladesituacao/sigtap/`.
3. Mantenha a Mesa como frontend estático. Qualquer API, banco, upload no servidor, processamento Python em runtime, nova dependência ou alteração de autenticação exige alinhamento prévio com o FluxSUS e um plano de deploy manual.
4. Não coloque segredos nem dados de pacientes no repositório ou no build. Dados de trabalho do auditor hoje ficam no navegador (`localStorage`/`sessionStorage`); preserve esse contrato até existir uma solução aprovada para persistência.
5. Revise mudanças de JavaScript como código do FluxSUS: a Mesa roda na mesma origem e pode fazer requisições com a sessão do usuário autenticado.

O deploy do FluxSUS fica em manutenção apenas durante a troca e só deve voltar após a validação. Se uma etapa falhar, diagnostique antes de tentar novamente. Não dispare deploy diretamente deste repositório.
