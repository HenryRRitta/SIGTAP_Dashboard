# /inicio — Bootstrap de sessão multi-IA

Princípio: IAs não compartilham memória de chat. A **única memória oficial** do projeto está nos arquivos do repositório: `AGENTS.md` na raiz + pasta `docs/`. Código e `git log` são a fonte da verdade; nunca presuma que algo foi feito sem verificar.

Responda sempre em Português do Brasil.

## Passo 1 — Localizar a raiz do projeto
- Use a raiz do repositório git (`git rev-parse --show-toplevel`). Se não for repositório git, use o diretório de trabalho e avise o usuário (ofereça `git init`, não execute sem autorização).

## Passo 2 — Garantir a estrutura de memória
Verifique se existem:

```
AGENTS.md
docs/HANDOFF.md
docs/PROTOCOLO_IAS.md
docs/DECISOES.md
docs/CHANGELOG.md
docs/rotinas/INICIO.md
docs/rotinas/ENCERRAMENTO.md
```

- **Se todos existem** → siga para o Passo 3. Não reescreva nada.
- **Se faltar algum** → crie **apenas os ausentes** a partir dos modelos em `templates/` (pasta ao lado deste SKILL.md; mesmos nomes de arquivo). Ao preencher:
  - Extraia nome, objetivo, stack, arquivos principais, comandos de execução e convenções de `README*`, manifestos (`package.json`, `pyproject.toml`, `requirements.txt` etc.), estrutura de pastas e `git log`.
  - **Nunca invente** dados, números, metas, regras de negócio, nomes de pessoas ou normas. O que não estiver no repositório fica como `[A PREENCHER]` e entra na lista de pendências.
  - Em `DECISOES.md` registre só o que é verificável no código (ex.: stack, forma de persistência), marcado como "inferido no bootstrap — confirmar com o usuário".
  - Os arquivos `docs/rotinas/*.md` são cópias desta rotina e da de encerramento, para IAs que não têm as skills instaladas.
  - Crie a primeira entrada do `CHANGELOG.md` registrando a criação da governança.
  - Faça um commit local: `docs(governanca): criar estrutura de memoria multi-ia`.

## Passo 3 — Ler a memória na ordem obrigatória
1. `AGENTS.md`: orientações universais e regras específicas do projeto (elas **prevalecem** sobre esta skill quando forem mais específicas).
2. `docs/HANDOFF.md`: estado vivo, último commit, versões de cache, próximo passo.
3. `docs/PROTOCOLO_IAS.md`: regras de gravação e conduta.
4. `docs/DECISOES.md`: decisões fechadas (append-only; **nunca desfaça** uma decisão listada).
5. `docs/CHANGELOG.md`: leia apenas as entradas mais recentes (topo).
6. `docs/rotinas/INICIO.md` e `docs/rotinas/ENCERRAMENTO.md`: se divergirem desta skill, siga a versão do projeto.

## Passo 4 — Verificar o repositório
- `git status -s` → alterações não commitadas ou arquivos untracked.
- `git log -3 --oneline` → ponto exato da branch.
- Compare com o HANDOFF:
  - O hash citado no HANDOFF pode ser o commit **anterior** ao que gravou o próprio HANDOFF. Isso é normal e não é divergência.
  - Divergência real: existem commits de código depois do HANDOFF sem registro no CHANGELOG, ou há alterações não commitadas. Nesses casos, aponte o problema na síntese.

## Passo 5 — Verificar o ambiente (sem alterar nada)
- Se o projeto tem servidor de desenvolvimento documentado, confira se está no ar (porta/URL do HANDOFF ou AGENTS).
- Valide a sintaxe dos arquivos com alterações pendentes, conforme a linguagem (`node --check`, `python -m py_compile`, `tsc --noEmit`, linter do projeto etc.).
- Se o projeto usa cache-buster (`?v=...` em assets), confira se a versão citada no HANDOFF é a mesma do HTML.

## Passo 6 — Síntese ao usuário (até 6 linhas)
1. **Governança**: já existia ou foi criada agora (e quais arquivos);
2. **Último commit**: `hash` + mensagem;
3. **Pronto e validado**: resumo do HANDOFF confirmado pela verificação;
4. **Em andamento / pendente**: inclua divergências, alterações não commitadas e itens `[A PREENCHER]`;
5. **Próximo passo exato**: o que o HANDOFF indica, ou uma sugestão sua se ele estiver vazio;
6. "Aguardando sua instrução para iniciar a tarefa."

Não comece nenhuma alteração de código nesta rotina. Ao fim de qualquer tarefa da sessão, execute `/encerramento`.

## Regras permanentes da sessão
- Nunca diga "feito/concluído" sem atualizar `docs/HANDOFF.md` e `docs/CHANGELOG.md` no mesmo turno.
- Assets com cache-buster: atualize a versão a cada edição do arquivo.
- Git **apenas local**: commits no padrão `tipo(área): frase curta`. NUNCA `git push`, `rebase`, `reset --hard`, `--no-verify` ou alteração de `git config`.
- Nunca invente dados. Use fontes oficiais do repositório ou pergunte.
