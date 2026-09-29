# Instrução principal — sistema visual compartilhado

Atue como designer de produto e engenheiro frontend. Implemente em TODAS as páginas deste projeto o sistema visual descrito nos arquivos deste pacote. O objetivo é uma interface moderna, sóbria e consistente, com sidebar azul-marinho, superfícies claras, ações índigo, tipografia limpa e hierarquia evidente.

## Escopo obrigatório

Trabalhe exclusivamente na apresentação, estrutura visual, responsividade e acessibilidade dos componentes. Preserve textos, números, regras de negócio, cálculos, permissões, integrações, autenticação, rotas, parâmetros de URL, persistência e ações existentes. Não use dados da imagem de referência para substituir dados reais. Não crie indicadores, estados ou conteúdo de negócio. Não elimine campos, linhas ou páginas para reproduzir a composição do exemplo.

Não renderize o projeto como uma imagem. Implemente componentes reais, com HTML semântico e CSS, no framework já utilizado. O pacote é uma especificação de integração; o CSS não transforma sozinho uma aplicação sem associar classes aos componentes.

## Leia primeiro

1. `02-SISTEMA-VISUAL.md`: regras e medidas dos componentes.
2. `03-theme.css`: tokens e classes CSS de referência, isolados sob `.modern-ui`.
3. `04-INTEGRACAO-E-VALIDACAO.md`: adaptação e critérios de conclusão.

## Execução

1. Inspecione o projeto, suas instruções locais, framework, estilos, componentes compartilhados e todas as rotas. Identifique a área de aplicação do tema e eventuais interfaces de terceiros.
2. Faça um inventário das páginas e famílias visuais: shell, navegação, cabeçalhos, ações, filtros, cards, tabelas, formulários, modais, abas, badges/pills, mensagens e paginação.
3. Reutilize o framework, o roteamento, a biblioteca de ícones e os componentes acessíveis existentes. Não instale outro framework ou outro sistema de componentes para executar uma alteração visual. Não atualize dependências sem necessidade concreta.
4. Crie tokens centralizados e componentes compartilhados. Adapte o CSS fornecido à organização atual. Se houver Tailwind, CSS Modules, styled-components ou biblioteca de temas, traduza os tokens para esse sistema; não mantenha dois sistemas concorrentes.
5. Aplique o tema em uma página representativa e valide desktop/mobile. Em seguida, propague para todas as páginas e variantes, sem encerrar após a primeira tela.
6. Preserve os handlers e contratos existentes. Os botões e links devem continuar funcionando. Onde houver edição, mantenha seus campos e ações acessíveis; a tabela pode usar visual de leitura com edição explícita somente se isso preservar o fluxo existente.
7. Evite estilos globais destrutivos, seletores específicos por texto, cores espalhadas, `!important`, dimensões fixas que cortem conteúdo e cópias de componentes por página.
8. Valide e corrija todas as rotas afetadas. Entregue a implementação, a relação das páginas revisadas e eventuais limitações reais.

## Direção de arte

Sidebar azul-marinho profundo; item ativo com fundo azul-índigo escuro e texto branco; fundo geral cinza muito claro; cards brancos; títulos em azul-marinho; textos secundários cinza-azulados; botão principal índigo sólido; bordas finas; sombras discretas; cantos de 12px nos painéis e 8px nos controles; pills arredondadas. Ícones de traço uniforme. Sem imagens decorativas, gradientes vistosos, vidro/transparências excessivas ou sombras pesadas.

Priorize consistência e leitura. Não replique o tamanho estreito da imagem conceitual: respeite os breakpoints do pacote e a densidade necessária em cada página. Não transforme todo número em card nem todo texto em pill. Use a cor semântica apenas quando o estado já existir na aplicação.

Execute o trabalho completo no projeto. Não entregue apenas uma proposta ou uma imagem. Não publique/deploy automaticamente: finalize com código revisável e validação local, salvo se houver autorização própria para publicação.
