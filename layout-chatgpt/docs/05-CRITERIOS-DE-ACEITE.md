# Critérios de aceite / QA

- [ ] Não existe sidebar fixa; menu horizontal integrado ao projeto original.
- [ ] Aparência corresponde à referência 01, sem copiar a faixa de documentação como interface operacional.
- [ ] Os sete recursos estão implementados/representados em seus fluxos corretos: Busca universal, Ficha SIGTAP, Valores SUS, Histórico, Compatibilidades, Base local e Controle de integridade.
- [ ] Competência atual aparece e governa TODOS os dados da tela.
- [ ] Sem base importada, a UI apresenta estado vazio e caminho de importação, sem números inventados.
- [ ] Busca por código e descrição; busca CID e CBO quando suas tabelas relacionadas estiverem disponíveis.
- [ ] Filtros combinados, limpeza, ordenação e paginação funcionam com dados reais.
- [ ] Seleção de linha atualiza o detalhe sem perder busca/filtro.
- [ ] Ficha tem atributos, valores, CID/CBO, compatibilidades e histórico com estados vazios adequados.
- [ ] Histórico compara competências de forma identificável, sem fabricar pontos ausentes.
- [ ] Dados monetários com `pt-BR`, distinção entre null e zero e fórmulas compatíveis com a fonte.
- [ ] Importador valida competência, preserva fonte e registra relatório verificável de integridade.
- [ ] Todos os botões levam a ação real ou indicam claramente indisponibilidade; nenhum botão placebo.
- [ ] Navegação por teclado, rótulos, foco visível, contraste e layout em 1920px/1440px/1024px/768px/375px.
- [ ] Construção sem erros e testes de: mudança de competência, filtros, busca vazia, erro do adapter, importação repetida e histórico inexistente.
- [ ] Entrega contém lista de arquivos alterados, comandos de instalação/execução e pendências de integração oficial.
