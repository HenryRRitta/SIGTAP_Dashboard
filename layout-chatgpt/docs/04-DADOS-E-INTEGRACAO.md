# Dados, importação e integração — diretrizes

## Princípio
A fonte de verdade é a base oficial SIGTAP da competência importada. A interface não deve manter nem gerar números arbitrários, nem calcular critérios clínicos/administrativos que não estejam respaldados nos relacionamentos e tabelas oficiais. Arquivos de demo do starter são ilustração visual isolada.

## Arquitetura recomendada (adaptável à stack do projeto)
- `Importador`: lê distribuição oficial, valida integridade, codificação, layout e competência; armazena staging, aplica transação atômica, emite relatório de importação e falhas.
- `Persistência`: SQLite local por sua praticidade para leitura offline; relações/indexação conforme arquivos realmente fornecidos; preservar dados brutos e registrar versão do layout utilizado.
- `Consultas`: uma API/adapter interno desacoplado da UI, com filtro obrigatório por competência.
- `Frontend`: renderiza resposta do adapter e estados de falha/ausência; não faz inferências de regras SIGTAP por aparência da tela.

## Interfaces lógicas sugeridas
```ts
interface Competencia { id: string; origem: string; importadaEm: string; status: 'valida'|'erro'|'importando'; }
interface ValorSigtap { sa?: number|null; sh?: number|null; sp?: number|null; ambulatorial?: number|null; hospitalar?: number|null; moeda: 'BRL'; }
interface ProcedimentoResumo { codigo: string; descricao: string; grupo?: string; subgrupo?: string; formaOrganizacao?: string; complexidade?: string; modalidade?: string; valores: ValorSigtap; }
interface ConsultaFiltro { competencia: string; texto?: string; categoria?: string; grupo?: string; subgrupo?: string; complexidade?: string; modalidade?: string; financiamento?: string; instrumento?: string; habilitacao?: string; pagina: number; tamanhoPagina: number; ordenacao?: string; }
interface DetalheProcedimento extends ProcedimentoResumo { atributos: Record<string, unknown>; cids: string[]; cbos: string[]; compatibilidades: unknown[]; }
interface PontoHistorico { competencia: string; valores: ValorSigtap; presente: boolean; }
```

## Operações
`listarCompetencias()`; `obterResumo(competencia)`; `buscarProcedimentos(filtro)`; `obterProcedimento(competencia,codigo)`; `obterHistorico(codigo,competencias)`; `consultarCompatibilidades(competencia,codigo)`; `obterStatusBase()`; `importarCompetencia(arquivo)`; `exportarResultados(filtros)`.

## Regras importantes
- Códigos são strings, preservando zeros à esquerda.
- Competência em `AAAAMM` internamente; `MM/AAAA` na UI.
- Sempre rotular a competência de cada visualização e exportação.
- Distinguir *não informado* (null) de 0,00.
- Valores, unidades, totais e variações devem seguir o esquema oficial e as regras da competência; não assumir que SA+SH+SP seja sempre o total exibível para todos os tipos de item.
- CID e CBO são relacionamentos multivalorados; buscar através dos relacionamentos efetivamente importados.
- Nunca misturar o conjunto de procedimentos, medicamentos e OPM apenas para atingir contagens do mockup.
- Mudança de competência pode incluir inclusão, exclusão e alteração de procedimento: histórico deve diferenciar os três casos.
- Verificar a licença/regras de uso e os arquivos reais da fonte pública durante a implementação do importador; não prometer importação funcional sem testar arquivos reais.
- Banco e diretórios locais: tratar caminhos Windows com cuidado, incluir backup, registro de erros e mecanismos de recuperação.

## Controle de integridade — campos sugeridos
Competência, fonte/URL ou identificação do pacote oficial, nome do arquivo, tamanho, hash SHA-256, data/hora, versão/layout, quantidade de registros importados por tabela, validações executadas, erros/avisos e status final. A importação deve ser idempotente ou pedir confirmação explícita para substituir uma competência existente.
