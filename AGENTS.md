# Mesa SIGTAP — contexto para agentes (Cursor e outros)

Este repositório contém a aplicação React 19/Vite da Mesa SIGTAP. Ela é desenvolvida aqui, mas publicada manualmente dentro do FluxSUS. Leia estas regras antes de mudar rotas, assets, dados ou dependências.

## Produção

- URL: `https://fluxsus.auditar.med.br/saladesituacao/sigtap`.
- O FluxSUS é uma aplicação Laravel separada. Ele exige login para o HTML, JavaScript, CSS, imagens e JSON da Mesa SIGTAP.
- O build deste projeto é guardado no FluxSUS em `storage/app/sigtap-dashboard`, fora de `public/`. Colocar arquivos em `public/` no FluxSUS contornaria a autenticação.
- O servidor de produção não compila frontend e não depende de Node ou Python para servir a Mesa. O build é feito fora do servidor e enviado manualmente por rsync/SSH.
- Não há capacidade disponível para depender de GitLab CI/CD nessa publicação. Um push neste GitHub não publica automaticamente. Combine cada release com o responsável pelo FluxSUS.

## Contrato de integração atual

O FluxSUS clona este repositório e executa `scripts/build-sigtap.mjs` do repositório Fluxos. O script instala as dependências do `package-lock.json`, compila com Vite usando base `/saladesituacao/sigtap/` e adapta no clone temporário seis arquivos que hoje presumem a raiz `/`:

- `src/main.tsx`: `BrowserRouter`.
- `src/lib/store.tsx` e `src/pages/Compare.tsx`: caminhos de `data/*.json`.
- `src/components/BrandMark.tsx` e `src/components/PrintShell.tsx`: caminho do logo.
- `src/lib/workspace.ts`: URLs de impressão.

Se modificar qualquer um desses pontos, avise o responsável pelo FluxSUS e atualize/teste a integração junto. O build do FluxSUS falha de propósito quando não encontra o trecho esperado; isso evita publicar navegação ou dados quebrados. A solução futura preferida é usar `import.meta.env.BASE_URL` neste projeto para todos os caminhos internos, mantendo o funcionamento local em `/` e em produção na subrota. Coordene a troca com o FluxSUS para remover os ajustes temporários no mesmo release.

Novas telas devem funcionar ao recarregar uma URL interna, por exemplo `/saladesituacao/sigtap/procedimento/123`. Links internos devem permanecer na base da aplicação. Requisições a dados e imagens não podem escapar para `/data`, `/brand` ou `/print` na raiz do domínio.

## Antes de entregar mudanças

1. Use Node 20 e o `package-lock.json`; execute `npm ci` e `npm run build` fora de produção.
2. Verifique a página inicial, uma rota interna recarregada, os arquivos de dados, o logo e a impressão com base `/saladesituacao/sigtap/`.
3. Mantenha a Mesa como frontend estático. Qualquer API, banco, upload no servidor, processamento Python em runtime, nova dependência ou alteração de autenticação exige alinhamento prévio com o FluxSUS e um plano de deploy manual.
4. Não coloque segredos nem dados de pacientes no repositório ou no build. Dados de trabalho do auditor hoje ficam no navegador (`localStorage`/`sessionStorage`); preserve esse contrato até existir uma solução aprovada para persistência.
5. Revise mudanças de JavaScript como código do FluxSUS: a Mesa roda na mesma origem e pode fazer requisições com a sessão do usuário autenticado.

O deploy do FluxSUS fica em manutenção apenas durante a troca e só deve voltar após a validação. Se uma etapa falhar, diagnostique antes de tentar novamente. Não dispare deploy diretamente deste repositório.
