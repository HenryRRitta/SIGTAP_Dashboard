# Integração e validação

## Estrutura sugerida (adaptar à arquitetura existente)

```text
styles/
  tokens.css         # variáveis do tema
  shell.css          # sidebar, cabeçalho e responsividade
  components.css     # variantes compartilhadas
components/ui/
  Button, IconButton, Badge, Chip, Card, Input, Select
  Table, Tabs, Dialog, Drawer, Dropdown, Toast
components/layout/
  AppShell, Sidebar, PageHeader, PageContainer
```

Os nomes são conceituais. Não criar arquivos ou abstrações redundantes se equivalentes já existirem. O `03-theme.css` reúne os estilos para facilitar a transferência; ele pode ser dividido conforme o projeto.

## Ordem de aplicação

1. Registrar telas, rotas, variantes e estilos atuais. Se houver controle de versão, trabalhar em alteração isolada e preservar trabalho anterior.
2. Adicionar os tokens ao tema central e associar `.modern-ui` à raiz apropriada.
3. Migrar o shell compartilhado; depois componentes fundamentais; depois páginas e estados especiais.
4. Retirar somente estilos legados que conflitam e já foram substituídos. Verificar cascata e imports; evitar carregar duas folhas concorrentes.
5. Percorrer todas as rotas acessíveis no escopo. Registrar páginas migradas e não migradas com motivo concreto. Não declarar todas concluídas sem inspeção.

## Escopo e portais

- A folha não altera elementos fora de `.modern-ui`. Aplicar a classe ao `body` simplifica herança para modais e menus montados no body, quando toda a aplicação usa o tema.
- Se a classe ficar numa raiz interna, criar um container de portais descendente dessa raiz. Caso seja necessário um container externo, replicar ali o escopo e tokens, sobrescrevendo nele `min-height:0; margin:0; background:transparent` para não gerar uma segunda tela. Preservar a estratégia de posicionamento da biblioteca.
- Classes como `.ui-tone-success` devem estar no próprio badge/card ou ancestral que delimite a variante.
- Evitar propagar uma cor semântica acidentalmente para todos os descendentes de uma página.
- Este CSS oferece aparência; não implementa roteamento, busca, persistência, validação, foco de modal, tooltip ou menu. Manter essas responsabilidades no frontend existente.

## Contrato do shell responsivo

A raiz usa `data-nav-open="true"` quando o drawer móvel está aberto. O JavaScript deve sincronizar o estado, `aria-expanded` do botão e `aria-controls` apontando para o drawer.

No mobile, o drawer deve ter comportamento de diálogo modal acessível: nome, foco inicial apropriado, contenção de foco, fundo inerte, bloqueio de scroll, Escape e restauração do foco. A sidebar fechada deve permanecer fora da navegação de teclado. Ao mudar para desktop, remover atributos modais, desbloquear scroll e restaurar o comportamento de navegação comum. Não deixar `inert` preso no conteúdo após resize.

No tablet, o CSS oculta rótulos visuais. Os links continuam precisando de `aria-label` com o mesmo nome da navegação e tooltip no foco/hover. Ícones meramente decorativos usam `aria-hidden="true"`. Manter submenus e páginas filhas alcançáveis em todos os tamanhos.

## Exemplo de composição genérica

A estrutura abaixo demonstra classes. Substituir comentários pelos componentes e dados reais; não copiar handlers fictícios.

```html
<body class="modern-ui">
  <a class="ui-skip-link" href="#main-content">Pular para o conteúdo</a>
  <!-- Acionador mobile, backdrop e fechamento devem usar o drawer acessível do projeto. -->
  <aside class="ui-sidebar" aria-label="Menu principal">
    <!-- Marca existente: .ui-brand; rótulo: .ui-brand-label -->
    <nav class="ui-nav" aria-label="Principal">
      <!-- Links reais .ui-nav-item; atual com aria-current="page".
           Nome acessível obrigatório quando .ui-nav-label estiver oculto. -->
    </nav>
    <div class="ui-sidebar-footer"><!-- Ações existentes --></div>
  </aside>
  <main id="main-content" tabindex="-1" class="ui-main">
    <div class="ui-container ui-stack">
      <header class="ui-page-header">
        <div><!-- h1.ui-page-title e p.ui-description existentes --></div>
        <div class="ui-actions"><!-- Ações existentes --></div>
      </header>
      <section class="ui-panel" aria-labelledby="section-title">
        <div class="ui-panel-header">
          <h2 id="section-title" class="ui-section-title">Título da seção</h2>
          <div class="ui-toolbar"><!-- Controles existentes --></div>
        </div>
        <div class="ui-panel-body"><!-- Conteúdo real --></div>
      </section>
    </div>
  </main>
</body>
```

Composições comuns:

```html
<button type="button" class="ui-button ui-button--primary">Ação principal</button>
<button type="button" class="ui-button ui-button--secondary">Ação secundária</button>
<span class="ui-pill ui-tone-neutral">Categoria</span>
<span class="ui-pill ui-tone-warning">Estado de atenção existente</span>
<!-- Chip é interativo e diferente de badge; associar o handler real. -->
<button type="button" class="ui-chip" aria-pressed="false">Filtro existente</button>
```

Os textos acima são apenas exemplos estruturais. Não inseri-los como conteúdo em páginas reais.

## Mapeamento de componentes

| Componente existente | Padrão visual |
|---|---|
| Container geral | `ui-main` + `ui-container` + `ui-stack` |
| Bloco de informação | `ui-panel`, header/body/footer |
| Indicador já existente | `ui-metric`, label/value/caption |
| Botões | `ui-button` + variante |
| Estado informativo | `ui-pill` + `ui-tone-*` |
| Filtro em formato pill | `ui-chip`, estado selecionado via `aria-pressed` |
| Campo | `ui-field`, `ui-label`, `ui-input`, ajuda/erro associado |
| Tabela | `ui-table-scroll` + `ui-table`, números com `ui-number` |
| Aviso contextual | `ui-alert` + `ui-tone-*` |
| Modal/menu | API acessível existente + classes visuais equivalentes |

## Cuidados de comportamento

- `aria-disabled` sozinho não impede clique; usar `disabled` em botões nativos. Para links desabilitados, manter a semântica e impedir ativação de acordo com o componente existente.
- Não substituir controles reais por `div` com click. Não usar `role=menu` em uma simples lista de navegação sem implementar seu padrão de teclado.
- Tooltip e dropdown precisam de posicionamento real; `.ui-dropdown` define somente a superfície.
- Tabela ordenável exige controles de ordenação e `aria-sort`. Cabeçalhos usam `scope`; caption pode ser visualmente oculta. A região rolável pode usar `tabindex="0"`, `role="region"` e nome acessível quando necessário.
- Campo não editável em modo leitura pode ser texto; campos que já editam diretamente devem preservar a interação ou receber mecanismo equivalente explícito. Nenhum dado deve ficar inacessível.
- `progress` usa valor e máximo reais e nome acessível; desconhecido não equivale a zero.
- Skeleton representa carregamento real e não deve ser anunciado como dados carregados.
- Não embutir texto dentro de SVG ou imagem para reproduzir tipografia.

## Critérios de aceite

### Consistência visual

- [ ] Todas as páginas no escopo usam o mesmo shell e tokens.
- [ ] Sidebar navy, ativo azul escuro/branco, hover e foco distintos.
- [ ] Botões, cards, pills, formulários e tabelas têm as mesmas variantes entre páginas.
- [ ] Sem cores avulsas não justificadas; cores especiais viram tokens.
- [ ] Sem fontes ou bibliotecas visuais duplicadas.
- [ ] Sem conteúdo cortado, sobreposição ou barras horizontais na página inteira.

### Responsividade

- [ ] Revisar 1440px e 1920px desktop; 1024px e 768px tablet; 390px e 360px mobile.
- [ ] Sidebar completa/compacta/drawer conforme breakpoint, sem bloquear navegação.
- [ ] Testar rotação/resize com drawer aberto e fechado.
- [ ] Cards e ações se reorganizam; modais cabem na viewport.
- [ ] Texto longo e tabelas largas permanecem utilizáveis.
- [ ] Alvos de toque suficientes e inputs móveis com fonte de 16px.

### Acessibilidade e estados

- [ ] Navegação por teclado, foco visível, Escape, retorno de foco e link de pular.
- [ ] Labels, nomes acessíveis, títulos e contraste revisados.
- [ ] Zoom 200% e movimento reduzido.
- [ ] Default, hover, focus, pressed, disabled, loading e error contemplados.
- [ ] Vazio, busca sem resultados, falha de carregamento e conteúdo longo revisados.
- [ ] Cor não é o único indicador de estado.

### Preservação funcional

- [ ] Dados, textos, cálculos, permissões, URLs e integrações preservados.
- [ ] Busca, filtros, ordenação, paginação, seleção e edição mantidos.
- [ ] Nenhuma ação decorativa sem funcionalidade.
- [ ] Não houve alteração indevida de quantidade de registros.
- [ ] Build/lint e verificações existentes executados conforme o projeto.
- [ ] Screenshots representativas comparadas entre páginas e breakpoints.

Executar testes relevantes à alteração. Não criar uma suíte que apenas repita valores literais de CSS. Priorizar regressões de navegação, abertura/fechamento do drawer, foco e ações existentes se a mudança afetar esses comportamentos.

## Relatório final solicitado ao Antigravity

Informar componentes centrais alterados, páginas revisadas, validações realizadas e limitações reais. Apresentar capturas de desktop/mobile e caminho dos arquivos centrais de tema. Não afirmar implementação completa quando restarem rotas sem revisão. Não publicar automaticamente salvo autorização própria.
