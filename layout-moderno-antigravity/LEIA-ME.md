# Pacote de layout moderno para Antigravity

Sistema visual genérico para aplicar a muitas páginas. Não contém dados financeiros, conteúdo específico de negócio ou dependência de framework.

## Como usar

1. Extraia o ZIP na pasta do projeto, por exemplo em `design-reference/layout-moderno/`.
2. Disponibilize os quatro arquivos numerados ao Antigravity pelo mecanismo de contexto de arquivos da sua instalação.
3. Copie o conteúdo de `01-PROMPT-ANTIGRAVITY.md` para a conversa do Antigravity com o projeto aberto. Ajuste apenas os caminhos dos arquivos se necessário.
4. Peça para executar a implementação em todas as páginas do escopo e verificar o checklist do arquivo 04.

Mensagem curta alternativa:

> Aplique o sistema visual deste pacote a todas as páginas do projeto. Leia 01-PROMPT-ANTIGRAVITY.md, 02-SISTEMA-VISUAL.md, 03-theme.css e 04-INTEGRACAO-E-VALIDACAO.md. Centralize tokens e componentes, preserve conteúdo e funcionalidades, implemente o tema completo no frontend existente e valide desktop, tablet e mobile. Não encerre após modificar apenas uma página.

## Arquivos

- `01-PROMPT-ANTIGRAVITY.md`: instrução de execução pronta para copiar.
- `02-SISTEMA-VISUAL.md`: paleta HEX, dimensões, tipografia e padrões de componentes.
- `03-theme.css`: tokens e CSS de referência reutilizáveis.
- `04-INTEGRACAO-E-VALIDACAO.md`: integração ao projeto, exemplos e checklist.

A referência é um painel claro com sidebar azul-marinho e ações índigo. A aparência é compartilhada; cada página conserva sua estrutura de informação. O CSS deve ser integrado aos componentes reais; ele não é um instalador automático nem inclui lógica JavaScript.

Este pacote foi revisado como material de especificação. A validação visual e funcional no aplicativo real cabe à etapa de integração, pois o código do projeto não foi fornecido nesta conversa.
