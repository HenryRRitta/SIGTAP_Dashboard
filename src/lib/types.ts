export type RelServico = { servico: string; classificacao: string };
export type RelHab = { cod: string; grupo: string | null };
export type RelCompat = {
  compativel: string;
  regP: string;
  regC: string;
  tipo: string;
  qtd: number | null;
};
export type RelExcecao = {
  restricao: string;
  compativel: string;
  regP: string;
  regC: string;
  tipo: string;
};
export type RelIncremento = { hab: string; sh: number; sa: number; sp: number };
export type RelSia = { cod: string; tipo?: string };

export type Rel = {
  cidsP: string[];
  cidsS: string[];
  cbos: string[];
  registros: string[];
  modalidades: string[];
  detalhes: string[];
  habilitacoes: RelHab[];
  leitos: string[];
  servicos: RelServico[];
  compat: RelCompat[];
  excecoes: RelExcecao[];
  incrementos: RelIncremento[];
  regras: string[];
  renases: string[];
  tuss: string[];
  origem: string[];
  siaSih: RelSia[];
  redes: string[];
};

export type Procedure = {
  c: string;
  n: string;
  g: string;
  sg: string;
  fo: string;
  cx: string;
  sx: string;
  qmax: number | null;
  perm: number | null;
  pts: number | null;
  imin: number | null;
  imax: number | null;
  iminL: string | null;
  imaxL: string | null;
  sh: number;
  sa: number;
  sp: number;
  tot: number;
  fin: string;
  rub: string;
  tperm: number | null;
  d: string;
  rel?: Rel;
};

export type Named = { c: string; n: string; d?: string };
export type Subgrupo = { g: string; sg: string; n: string };
export type Forma = { g: string; sg: string; fo: string; n: string };
export type Classif = { s: string; c: string; n: string };
export type CidInfo = { n: string; sexo?: string; agravo?: string; estadio?: string };

export type Lookups = {
  grupos: Named[];
  subgrupos: Subgrupo[];
  formas: Forma[];
  registros: Named[];
  modalidades: Named[];
  financiamentos: Named[];
  rubricas: Named[];
  detalhes: Named[];
  habilitacoes: Named[];
  leitos: Named[];
  servicos: Named[];
  classificacoes: Classif[];
  regras: Named[];
  renases: Named[];
  redes: Named[];
  componentes: { c: string; n: string; rede?: string }[];
  grupoHab: Named[];
  complexidade: Record<string, string>;
  sexo: Record<string, string>;
  compatTipo: Record<string, string>;
};

export type Meta = {
  competencia: string;
  competenciaLabel: string;
  fonte: string;
  arquivo: string;
  totalProcedimentos: number;
  totalCids: number;
  totalCbos: number;
  totalRelCid: number;
  totalRelCbo: number;
  totalCompat: number;
  porGrupo: Record<string, number>;
  porComplexidade: Record<string, number>;
  porSexo: Record<string, number>;
  somaValoresReferencia: number;
};

export type SigtapData = {
  meta: Meta;
  lookups: Lookups;
  procedures: Procedure[];
  cids: Record<string, CidInfo>;
  cbos: Record<string, string>;
  tuss: Record<string, string>;
  siaSih: Record<string, { n: string; t?: string }>;
  cidIndex: Record<string, string[]>;
  cboIndex: Record<string, string[]>;
  names: Record<string, string>;
};

export type AuditInput = {
  sexo: "M" | "F" | "";
  idadeAnos: string;
  idadeMeses: string;
  cid: string;
  cbo: string;
  registro: string;
  quantidade: string;
};

export type AuditStatus = "ok" | "fail" | "warn" | "info";

export type AuditCheck = {
  id: string;
  titulo: string;
  status: AuditStatus;
  detalhe: string;
};

export type CompetenciaDiff = {
  de: string;
  deLabel: string;
  para: string;
  paraLabel: string;
  totais: {
    antes: number;
    depois: number;
    incluidos: number;
    excluidos: number;
    alterados: number;
  };
  valor: {
    incluidos: number;
    excluidos: number;
    valorAntes: number;
    valorDepois: number;
  };
  incluidos: { c: string; n: string; tot: number; cx: string }[];
  excluidos: { c: string; n: string; tot: number; cx: string }[];
  alterados: { c: string; n: string; ch: Record<string, unknown> }[];
};
