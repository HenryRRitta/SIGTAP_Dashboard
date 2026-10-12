# /encerramento — Fechamento de entrega multi-IA

Objetivo: deixar o repositório pronto para que **qualquer outra IA ou pessoa** continue o trabalho só lendo `AGENTS.md` + `docs/`. Responda em Português do Brasil.

Se `AGENTS.md` ou `docs/` não existirem, execute antes o Passo 2 da skill `/inicio` (criação da estrutura a partir dos modelos).

Regras específicas em `AGENTS.md` ou em `docs/rotinas/ENCERRAMENTO.md` do projeto **prevalecem** sobre esta skill (ex.: identidade de autor do commit, comandos de teste).

## Passo 1 — Levantar o que mudou
- `git status -s` e `git diff --stat` → lista exata de arquivos tocados na sessão.
- Se não houve nenhuma alteração, diga isso ao usuário e encerre sem commit.

## Passo 2 — Validar
- Sintaxe e testes dos arquivos tocados, conforme a linguagem (`node --check`, `python -m py_compile`, suíte de testes/linter do projeto, se houver).
- **Cache-buster**: se algum asset versionado (`.js`, `.css`, imagens com `?v=`) mudou, a versão no HTML precisa ser nova. Padrão: `?v=AAAAMMDD_vN`, ou o padrão que o projeto já usa.
- Se algo falhar, **não encerre**: corrija ou relate a falha com a saída real ao usuário.

## Passo 3 — Atualizar a memória (no mesmo turno, antes de qualquer "concluído")
1. **`docs/CHANGELOG.md`**: nova entrada **no topo** (abaixo do cabeçalho), no formato:
   ```
   ## [AAAA-MM-DD] - <versão de cache ou rótulo>
   ### Adicionado | Alterado | Corrigido | Removido
   - o quê mudou, em qual arquivo, e por quê
   ```
   Nunca edite entradas antigas.
2. **`docs/HANDOFF.md`**: reescreva como fotografia **atual**:
   - data/hora, branch, como rodar, versão de cache ativa;
   - último commit **anterior** a este fechamento (hash + mensagem). Não tente registrar o hash do próprio commit de fechamento: isso gera commits extras só de sincronização;
   - pronto e validado, em andamento/pendente, arquivos modificados nesta sessão;
   - **próximo passo exato e acionável** para quem chegar depois.
3. **`docs/DECISOES.md`**: só se uma decisão arquitetural ou de negócio foi **fechada com o usuário** nesta sessão. Acrescente ao final com numeração sequencial (`[ADR-NNN]` com data, contexto e decisão). Append-only: nunca altere ou remova ADRs anteriores.

## Passo 4 — Commit local único
- Faça `git add` **apenas** dos arquivos da entrega + `docs/`, nunca `git add -A` às cegas. Não inclua segredos, `.env` ou arquivos temporários.
- Mensagem no padrão Conventional Commits, em minúsculas: `tipo(área): frase curta` (`feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`).
- Se um hook recusar o commit: investigue, corrija e crie um **novo** commit. Nunca use `--no-verify` ou `--amend` para contornar.
- PROIBIDO: `git push`, `rebase`, `reset --hard`, alterar `git config`.

## Passo 5 — Comunicação final (curta)
- O que foi entregue (1 a 3 linhas);
- validação executada e resultado;
- commit gerado (`hash` + mensagem) e versão de cache;
- próximo passo registrado no HANDOFF.
