# Design System — SIGTAP Executive

## Paleta
| Token | Cor | Uso |
|---|---|---|
| `navy-900` | `#0F2D5B` | cabeçalho/navy profundo |
| `navy-950` | `#092342` | fundo de destaques e total |
| `blue-600` | `#2563EB` | CTA, seleção, links |
| `blue-50` | `#EAF3FF` | linha selecionada e fundos informativos |
| `canvas` | `#F5F7FA` | fundo geral |
| `surface` | `#FFFFFF` | cards e painéis |
| `border` | `#DFE6EF` | bordas discretas |
| `text-900` | `#172B4D` | texto principal |
| `text-500` | `#63748B` | texto auxiliar |
| `success` | `#16A34A` | integridade/sucesso |
| `warning` | `#D97706` | atenção |
| `danger` | `#DC3545` | erros |

## Tipografia e ritmo
Inter (fallback Segoe UI, Arial, sans-serif). Título página 24–28/700; seções 18–20/650; card KPI 24–28/700; corpo 13–14/400; labels 12/600; legenda 11–12/400; código e números com `font-variant-numeric: tabular-nums`. Grid de espaçamento base 4px (4, 8, 12, 16, 20, 24, 32). Container desktop padding 24px; gap principal 12–16px.

## Componentes
- `TopNavigation`: 64px, gradiente navy sutil, tabs com indicador ativo, seletor competência e busca.
- `MetricCard`: ícone em disco azul pálido, título pequeno, número forte, mini-insight opcional.
- `SearchToolbar`: categoria, input expansível, CTA navy, controle de filtros.
- `FilterChip`: pequeno, removível, estados ativo/hover/foco.
- `ResultsTable`: cabeçalho gelo, divisor horizontal sutil, hover azul muito leve, selecionado `#DCEBFC`.
- `ProcedureDetail`: card branco, código azul, descrição uppercase quando a fonte assim vier, badges semânticas, metadados e abas.
- `ValuesRow`: blocos SA/SH/SP e total em navy, moeda `pt-BR`.
- `HistoryChart`: linhas e tooltip com legenda textual; paleta contrastante e tabela auxiliar acessível.
- `StatusPill`: Local/Offline, base válida, alerta de competência desatualizada sem presumir atualização online.
- `EmptyState`, `ErrorState`, `LoadingSkeleton`, `ImportDialog`, `ConfirmationDialog`.

## Estados obrigatórios
Default, hover, focus-visible (anel azul 2px), pressed, disabled, loading, empty, selected, validation-error, success. Não usar só cores para diferenciação. Alvos clicáveis recomendados de pelo menos 40px, títulos e inputs com rótulos.

## Responsividade
>=1440px: tabela e detalhe 68/32; 1024–1439px: 62/38; abaixo 1024px: detalhe empilhado ou drawer; abaixo 640px: KPIs em coluna ou dupla, navegação superior com menu compacto (NUNCA sidebar permanente). Sem rolagem horizontal da página inteira; somente da tabela quando necessária.

## Ícones
Usar Lucide ou ícones da biblioteca já instalada, com espessura coerente. Exemplos: search, clipboard-list, calculator, chart-no-axes-combined, git-compare-arrows, database, shield-check, filter, calendar-days, chevron-down.
