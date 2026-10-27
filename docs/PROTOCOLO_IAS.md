# PROTOCOLO DE CONVIVÊNCIA MULTI-IA

## 1. Memória viva no repositório
- Nenhuma IA acessa os chats de outra. Código, `git log` e `docs/` são a **única fonte da verdade**.
- Nunca presuma que uma tarefa foi feita sem conferir no código e no git.

## 2. Checklist de todo turno
### Início (`/inicio`)
1. [ ] Ler `AGENTS.md` e os arquivos de `docs/` na ordem indicada.
2. [ ] `git status -s` e `git log -3 --oneline`; comparar com o HANDOFF.
3. [ ] Consultar `DECISOES.md` antes de propor mudanças.

### Durante
1. [ ] Validar sintaxe/testes dos arquivos tocados.
2. [ ] Atualizar o cache-buster de assets versionados a cada edição (neste projeto: não se aplica).
3. [ ] Não inventar dados SIGTAP; usar RSS/FTP/ZIP parseado ou perguntar.

### Fim (`/encerramento`, no mesmo turno)
1. [ ] Nova entrada no topo de `docs/CHANGELOG.md`.
2. [ ] Reescrever `docs/HANDOFF.md` (estado, último commit, cache, próximo passo).
3. [ ] Se uma decisão foi fechada com o usuário: acrescentar ADR em `docs/DECISOES.md`.
4. [ ] Um único commit local com código + docs.
5. [ ] Só então confirmar a entrega ao usuário.

## 3. Commits
- Apenas locais. Proibido `git push`, `rebase`, `reset --hard`, `--no-verify`, alterar `git config`.
- `feat(área): ...` · `fix(área): ...` · `refactor(área): ...` · `style(área): ...` · `docs(área): ...` · `test(área): ...` · `chore(área): ...`
- Não criar commits só para sincronizar o hash no HANDOFF.
