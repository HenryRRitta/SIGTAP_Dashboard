# Sistema visual — Modern Navy / Indigo

Especificação genérica para múltiplas páginas. Os nomes das classes são referências e podem ser adaptados ao projeto. Os tokens, estados e relações visuais devem permanecer consistentes.

## Paleta

| Token CSS | Cor | Aplicação |
|---|---|---|
| `--ui-bg` | `#F5F7FB` | Fundo geral |
| `--ui-surface` | `#FFFFFF` | Cards, formulários, menus e modais |
| `--ui-surface-muted` | `#F8FAFC` | Cabeçalhos de tabela e áreas secundárias |
| `--ui-text` | `#15233B` | Texto principal e títulos |
| `--ui-text-muted` | `#596980` | Legendas e texto secundário |
| `--ui-border` | `#E2E8F0` | Divisórias e contornos sutis |
| `--ui-control-border` | `#8492A6` | Contorno de campos e controles |
| `--ui-primary` | `#4458E8` | Botão principal e links |
| `--ui-primary-hover` | `#3546C9` | Hover principal |
| `--ui-primary-pressed` | `#2D3BA8` | Pressionado |
| `--ui-primary-soft` | `#EEF1FF` | Fundo informativo índigo |
| `--ui-sidebar` | `#122139` | Menu lateral |
| `--ui-sidebar-hover` | `#1C3050` | Item de menu em hover |
| `--ui-sidebar-active` | `#293F7A` | Item selecionado |
| `--ui-sidebar-text` | `#CBD5E1` | Texto e ícones inativos |
| `--ui-sidebar-muted` | `#A8B7CB` | Legendas do menu |
| `--ui-success` / `--ui-success-bg` | `#087F73` / `#E8F7F3` | Estado positivo existente |
| `--ui-warning` / `--ui-warning-bg` | `#915300` / `#FFF4DD` | Atenção ou pendência existente |
| `--ui-danger` / `--ui-danger-bg` | `#B42318` / `#FFF0EE` | Erro ou ação destrutiva |
| `--ui-info` / `--ui-info-bg` | `#315AB5` / `#EDF3FF` | Informação |
| `--ui-neutral` / `--ui-neutral-bg` | `#526174` / `#EEF2F6` | Categoria neutra |

Bordas de painéis podem ser discretas; campos precisam ser identificáveis. Validar contraste no contexto final, incluindo estilos herdados: texto normal ≥ 4,5:1, texto grande ≥ 3:1 e indicadores essenciais de controles/foco ≥ 3:1. Não comunicar estados apenas por cor.

## Tipografia

- Usar Inter se já disponível ou hospedar o arquivo licenciado localmente. Fallback: system-ui, Segoe UI, sans-serif. O CSS não depende de CDN.
- Texto base: 14px, peso 400, entrelinha 1,5. Em formulários móveis: pelo menos 16px.
- Título de página: 28–32px, peso 700, entrelinha 1,2, tracking -0,025em. Mobile: 24px.
- Título de seção: 18px/600; título de card: 14px/600; legenda: 12px/400; cabeçalho de tabela: 12px/600.
- Números destacados: 28–32px/700 com algarismos tabulares. Não reduzir a fonte para esconder overflow; permitir quebra de layout.
- Evitar caixa alta em descrições e parágrafos. Usar somente em pequenas legendas, se o padrão do projeto exigir.
- Negrito somente para hierarquia, seleção e valores de destaque.

## Espaçamento, raios e sombras

Escala: 4, 8, 12, 16, 20, 24, 32 e 40px. Painéis: padding 24px desktop e 16px mobile. Gap de seções: 24px. Gap de controles: 8–12px. Raio dos cards: 12px; controles: 8px; pills: 999px. Bordas 1px. Sombra padrão leve; sombras mais intensas apenas em menus flutuantes e modais.

## Shell e menu lateral

- Desktop ≥ 1200px: sidebar fixa de 240px; conteúdo com margem correspondente. Largura útil máxima de 1600px, centralizada na área restante; padding 32px.
- De 768px a 1199px: sidebar compacta de 80px, ícones centrados; os rótulos continuam acessíveis por nome e tooltip no hover/foco; logo compacto com nome acessível. Conteúdo com padding 24px.
- Abaixo de 768px: sidebar escondida e aberta por botão no cabeçalho, em drawer de até 288px e máximo 85vw. O conteúdo ocupa toda a largura; padding 16px.
- Sidebar: fundo `--ui-sidebar`, sem gradiente; marca no topo, navegação no meio e área de usuário no rodapé. Rolagem interna quando necessário. Não criar marca ou usuário fictício.
- Item: mínimo 44px de altura, padding 12px, gap 12px, raio 8px. Texto 14px/500, ícone 20px. Ativo: fundo `--ui-sidebar-active`, texto branco, peso 600 e marcador lateral discreto.
- Usar `aria-current="page"` somente na rota atual. Submenu: botão de expansão com `aria-expanded`; rota pai pode mostrar estado expandido sem competir com a seleção do filho.
- Nomes de navegação devem vir do projeto. Não inventar menus, links, logout ou avatar não existentes.

## Cabeçalho de página e ações

Breadcrumb opcional, título e descrição à esquerda, ações à direita. Uma ação primária evidente por região; demais secundárias ou discretas. Não mostrar ações sem funcionalidade. Em telas pequenas, empilhar cabeçalho e ações. O cabeçalho não precisa ser fixo; evitar consumir altura útil.

Botão padrão: altura mínima 40px desktop/44px touch, padding 10px 16px, fonte 14px/600, raio 8px. Principal índigo/branco; secundário branco/borda; discreto transparente; destrutivo vermelho somente para ações destrutivas. Ícone 18px. Estado loading mantém largura e inclui nome acessível. Desabilitado visivelmente inativo, sem hover funcional. Ícone sozinho exige nome acessível e área de toque 44×44px.

## Cards, destaques e indicadores

Painel branco com borda e sombra leve. Cabeçalho alinhado e corpo com espaço consistente. Indicadores existentes podem usar grade de 4/2/1 colunas conforme largura; cards devem ter alturas coerentes sem truncar conteúdo. Ícone opcional em caixa de 40px com fundo semântico suave. Título discreto, valor forte, contexto secundário. Cards não interativos não recebem cursor de link ou efeito que sugira clique.

Destaque contextual: fundo semântico suave + ícone + texto. Não usar verde para valor positivo se isso não representar o estado real. Não colocar borda colorida grossa em todos os cards.

## Pills e badges

Altura visual de aproximadamente 24–28px, padding 4px 10px, texto 12px/600, raio completo, sem sombra. Variantes: neutral, primary, info, success, warning e danger. Ícone opcional de 14px. Sempre incluir texto de estado; não depender apenas do ícone. Badge é informativo, sem cursor pointer. Chip clicável é botão separado, alvo de toque mínimo 44px, com foco e estado selecionado acessível. Não repetir a mesma categoria em todas as linhas se ela já estiver clara no contexto, salvo quando necessário para compreender cada item.

## Tabelas e listas

- Tabela semântica real; cabeçalho claro, texto escuro secundário; divisórias horizontais finas. Evitar cabeçalho preto pesado e grades verticais fortes.
- Células: padding 12px 16px; linhas com altura mínima aproximada de 52px, crescendo com conteúdo. Densidade compacta opcional: 8px 12px, preservando alvos interativos.
- Texto à esquerda; quantidades e valores alinhados à direita; códigos sem quebra; números tabulares. Descrições quebram naturalmente. Não aplicar `white-space: nowrap` em toda a tabela.
- Hover leve na linha, sem sugerir clique quando a linha não for interativa. Ações existentes em coluna própria; evitar ícones de exclusão sempre chamativos.
- Grupos com fundo suave e rótulo claro; expansão somente quando implementada e acessível.
- Toolbar com busca e filtros existentes. Preservar seleção, ordenação, agrupamento, edição, totais e exportação.
- Mobile: rolagem horizontal contida com região identificada e teclado acessível. Alternativa de cards somente se preservar toda a informação e ações; não esconder colunas importantes arbitrariamente.
- Paginação e tamanho da página refletem registros reais. Nunca limitar o conjunto de dados para imitar uma imagem.
- Loading, vazio, erro e ausência de resultados devem ser distinguíveis. Skeleton sem dados inventados.

## Formulários, abas e navegação secundária

Labels visíveis acima dos campos, texto 13px/500. Inputs com altura mínima 40px, padding 10px 12px, borda identificável e fundo branco. Foco com anel índigo e sem deslocar layout. Erro com borda vermelha e mensagem associada via `aria-describedby`/`aria-invalid`. Placeholder não substitui label. Campos somente leitura têm aparência diferenciada sem perder legibilidade. Checkbox/radio/switch devem manter semântica e alvos amplos.

Formulários em 2 colunas onde couber, uma no mobile; textarea e campos longos podem ocupar toda a largura. Preservar `name`, validação e submissão existentes. Abas com borda inferior, selecionada índigo e semântica correta; abas reais usam padrão de teclado, navegação entre rotas usa links. Breadcrumb e paginação devem ter nomes de navegação distintos.

## Modais, drawers, menus, tooltips e notificações

Usar componentes acessíveis existentes. Modal com overlay navy a 48%, painel branco de raio 16px, largura padrão até 560px, altura até 85dvh, corpo rolável e ações no rodapé. Drawer mobile usa o mesmo cuidado com foco e fundo inerte. Fechar por botão nomeado e Escape, respeitando fluxos existentes de dados não salvos; restaurar foco ao acionador. Bloquear rolagem de fundo enquanto modal estiver aberto. `aria-modal` apenas enquanto modal real.

Dropdown branco, borda sutil, raio 10px, sombra elevada; itens de 40–44px; reposicionar no viewport. Tooltip por hover e foco, sem ocultar conteúdo essencial. Toast discreto, não cobrir ações; `role=status` para informação não urgente e anúncio apropriado para erro. Não usar toast como único local de erro de campo.

## Movimento e acessibilidade

Transições de cor, borda e sombra: 160ms ease; drawer até 200ms. Não animar números ou grandes áreas sem necessidade. Respeitar `prefers-reduced-motion`. Foco visível em todos os controles. Link de pular para conteúdo. Hierarquia de títulos correta, labels e nomes acessíveis. Conferir zoom de 200%, textos longos, teclado e screen reader básico. Nenhuma informação essencial deve depender de hover.

## Gráficos e componentes especiais já existentes

Aplicar a mesma tipografia, bordas e superfícies. Mapear séries a tokens centralizados; não alterar valores ou escalas por motivo estético. Usar legendas e padrões além da cor; garantir alternativa textual quando necessária. Não criar gráficos como decoração. Editores e widgets de terceiros devem ser tematizados pelas APIs próprias quando disponíveis.

## Tema e impressão

Este pacote define tema claro com sidebar escura. Não criar um modo escuro incompleto. Se já houver tema escuro, preservar o recurso e estabelecer tokens equivalentes com contraste validado. Na impressão, remover navegação e controles não essenciais, usar fundo branco, evitar sombras e preservar conteúdo. Paginação/virtualização exigem o fluxo de impressão existente ou uma visão própria completa; CSS não imprime registros ausentes do DOM.
