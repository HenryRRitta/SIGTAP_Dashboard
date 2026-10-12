export type CompetenciaRemota = {
  competencia: string;
  label: string;
  arquivo: string;
  url: string;
  pubDate: string;
};

export type VerificarResposta = {
  ok: boolean;
  latest: CompetenciaRemota | null;
  atual?: { competencia?: string; arquivo?: string };
  temNova: boolean;
  erro?: string;
};

export type CatalogoItem = {
  competencia: string;
  label: string;
  arquivo: string;
  totalProcedimentos: number;
  atualizadoEm: string;
};

export type ListaAnoResposta = {
  ok: boolean;
  ano: string;
  remotas: CompetenciaRemota[];
  locais: CatalogoItem[];
  faltando: CompetenciaRemota[];
  erro?: string;
};

export type BaixarEvento = {
  ok?: boolean;
  etapa?: string;
  ano?: string;
  total?: number;
  i?: number;
  n?: number;
  competencia?: string;
  label?: string;
  arquivo?: string;
  totalProcedimentos?: number;
  erro?: string;
  itens?: CatalogoItem[];
};

export type AtualizarResposta = {
  ok: boolean;
  unchanged?: boolean;
  meta?: {
    competencia: string;
    competenciaLabel: string;
    arquivo: string;
    totalProcedimentos: number;
    importadoEm?: string;
    origemUrl?: string;
  };
  saved?: { zip: string; json: string };
  erro?: string;
};

async function lerJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text.slice(0, 180) || `HTTP ${res.status}`);
  }
}

export async function verificarCompetencia(atual?: { competencia?: string; arquivo?: string }): Promise<VerificarResposta> {
  const q = new URLSearchParams();
  if (atual?.competencia) q.set("competencia", atual.competencia);
  if (atual?.arquivo) q.set("arquivo", atual.arquivo);
  const res = await fetch(`/api/competencia/verificar?${q}`, { cache: "no-store" });
  if (res.status === 404) {
    return { ok: false, latest: null, temNova: false, erro: "Atualização automática só funciona com o servidor local (npm run dev)." };
  }
  const data = await lerJson<VerificarResposta>(res);
  if (!res.ok) throw new Error(data.erro || `Falha ao consultar o DATASUS (HTTP ${res.status}).`);
  return data;
}

export async function atualizarCompetencia(atual?: { competencia?: string; arquivo?: string }): Promise<AtualizarResposta> {
  const res = await fetch("/api/competencia/atualizar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(atual ?? {}),
  });
  if (res.status === 404) {
    throw new Error("Atualização automática só funciona com o servidor local (npm run dev).");
  }
  const data = await lerJson<AtualizarResposta>(res);
  if (!res.ok || !data.ok) throw new Error(data.erro || `Falha ao atualizar (HTTP ${res.status}).`);
  return data;
}

export async function listarCompetenciasAno(ano = "2026"): Promise<ListaAnoResposta> {
  const res = await fetch(`/api/competencia/lista?ano=${encodeURIComponent(ano)}`, { cache: "no-store" });
  if (res.status === 404) {
    return { ok: false, ano, remotas: [], locais: [], faltando: [], erro: "Lista de competências só funciona com o servidor local (npm run dev)." };
  }
  const data = await lerJson<ListaAnoResposta>(res);
  if (!res.ok || !data.ok) throw new Error(data.erro || `Falha ao listar competências (HTTP ${res.status}).`);
  return data;
}

export async function carregarTabelaCompetencia(competencia: string) {
  const res = await fetch(`/api/competencia/tabela?c=${encodeURIComponent(competencia)}`, { cache: "no-store" });
  const data = await lerJson<{ erro?: string } & Record<string, unknown>>(res);
  if (!res.ok) {
    const label = competencia.length === 6 ? `${competencia.slice(4)}/${competencia.slice(0, 4)}` : competencia;
    throw new Error(data.erro || `A competência ${label} ainda não está baixada.`);
  }
  return data;
}

export async function baixarCompetenciasAno(ano: string, onEvent: (evento: BaixarEvento) => void) {
  const res = await fetch("/api/competencia/baixar-ano", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ano }),
  });
  if (res.status === 404) {
    throw new Error("O download das competências só funciona com o servidor local (npm run dev).");
  }
  if (!res.body) {
    const data = await lerJson<BaixarEvento>(res);
    if (!res.ok || data.ok === false) throw new Error(data.erro || "Falha ao baixar as competências.");
    onEvent(data);
    return;
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let acc = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += dec.decode(value, { stream: true });
    const lines = acc.split("\n");
    acc = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const evento = JSON.parse(line) as BaixarEvento;
      onEvent(evento);
      if (evento.ok === false && evento.erro) throw new Error(evento.erro);
    }
  }
  if (acc.trim()) {
    const evento = JSON.parse(acc) as BaixarEvento;
    onEvent(evento);
    if (evento.ok === false && evento.erro) throw new Error(evento.erro);
  }
}
