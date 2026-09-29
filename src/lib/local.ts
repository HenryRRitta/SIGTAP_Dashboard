export type CnesLocal = {
  cnes: string;
  nome: string;
  habilitacoes: string[];
  leitos: string[];
  servicos: string[];
};

export type TetoLocal = {
  procedimento: string;
  tetoQtd: number | null;
  tetoValor: number | null;
  observacao: string;
};

export type TussLocal = {
  tuss: string;
  sigtap: string;
  nome: string;
};

export type NotaTecnica = {
  codigo: string;
  texto: string;
};

export type CompetenciaPonto = {
  competencia: string;
  label: string;
  total: number;
  soma: number;
};

export type FilaStatus = "analise" | "glosado" | "diligenciar" | "deferido";

export type FilaItem = {
  id: string;
  criadoEm: string;
  code: string;
  nome: string;
  documento: string;
  usuario: string;
  cnes: string;
  conclusao: "conforme" | "glosar" | "diligenciar";
  status: FilaStatus;
  fail: number;
  warn: number;
  detalhe: string;
};

const KEYS = {
  cnes: "mesa-cnes-local",
  tetos: "mesa-tetos-local",
  tuss: "mesa-tuss-local",
  notas: "mesa-notas-tecnicas",
  fila: "mesa-fila-pareceres",
  serie: "mesa-serie-competencia",
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readCnes(): CnesLocal[] {
  return readJson(KEYS.cnes, []);
}
export function saveCnes(rows: CnesLocal[]) {
  writeJson(KEYS.cnes, rows);
}
export function findCnes(cnes: string): CnesLocal | undefined {
  const d = cnes.replace(/\D/g, "");
  return readCnes().find((e) => e.cnes.replace(/\D/g, "") === d);
}

export function readTetos(): TetoLocal[] {
  return readJson(KEYS.tetos, []);
}
export function saveTetos(rows: TetoLocal[]) {
  writeJson(KEYS.tetos, rows);
}
export function findTeto(code: string): TetoLocal | undefined {
  const d = code.replace(/\D/g, "");
  const rows = readTetos();
  return (
    rows.find((t) => t.procedimento.replace(/\D/g, "") === d) ??
    rows
      .filter((t) => d.startsWith(t.procedimento.replace(/\D/g, "")) && t.procedimento.replace(/\D/g, "").length >= 2)
      .sort((a, b) => b.procedimento.length - a.procedimento.length)[0]
  );
}

export function readTuss(): TussLocal[] {
  return readJson(KEYS.tuss, []);
}
export function saveTuss(rows: TussLocal[]) {
  writeJson(KEYS.tuss, rows);
}
export function tussOfSigtap(code: string): TussLocal[] {
  const d = code.replace(/\D/g, "");
  return readTuss().filter((t) => t.sigtap.replace(/\D/g, "") === d);
}
export function sigtapOfTuss(tuss: string): TussLocal[] {
  const d = tuss.replace(/\D/g, "");
  return readTuss().filter((t) => t.tuss.replace(/\D/g, "") === d);
}

export function readNotas(): NotaTecnica[] {
  return readJson(KEYS.notas, []);
}
export function saveNotas(rows: NotaTecnica[]) {
  writeJson(KEYS.notas, rows);
}
export function notaDe(code: string): string {
  const d = code.replace(/\D/g, "");
  return readNotas().find((n) => n.codigo.replace(/\D/g, "") === d)?.texto ?? "";
}
export function upsertNota(codigo: string, texto: string) {
  const d = codigo.replace(/\D/g, "");
  const rows = readNotas().filter((n) => n.codigo.replace(/\D/g, "") !== d);
  if (texto.trim()) rows.unshift({ codigo: d, texto: texto.trim() });
  saveNotas(rows);
}

const SERIE_SEED: CompetenciaPonto[] = [
  { competencia: "202607", label: "07/2026", total: 4996, soma: 6827013.9 },
  { competencia: "202608", label: "08/2026", total: 5023, soma: 6870370.83 },
];

export function readSerie(): CompetenciaPonto[] {
  const stored = readJson<CompetenciaPonto[]>(KEYS.serie, []);
  const by = new Map(SERIE_SEED.map((p) => [p.competencia, p]));
  for (const p of stored) by.set(p.competencia, p);
  return [...by.values()].sort((a, b) => a.competencia.localeCompare(b.competencia));
}

export function pushSerie(ponto: CompetenciaPonto) {
  const by = new Map(readSerie().map((p) => [p.competencia, p]));
  by.set(ponto.competencia, ponto);
  writeJson(KEYS.serie, [...by.values()].sort((a, b) => a.competencia.localeCompare(b.competencia)));
}

export function readFila(): FilaItem[] {
  return readJson(KEYS.fila, []);
}
export function saveFila(rows: FilaItem[]) {
  writeJson(KEYS.fila, rows);
}
export function pushFila(item: Omit<FilaItem, "id" | "criadoEm" | "status"> & { status?: FilaStatus }) {
  const rows = readFila();
  const next: FilaItem = {
    ...item,
    id: `${Date.now()}-${item.code}-${Math.random().toString(36).slice(2, 7)}`,
    criadoEm: new Date().toISOString(),
    status: item.status ?? (item.conclusao === "glosar" ? "glosado" : item.conclusao === "diligenciar" ? "diligenciar" : "analise"),
  };
  saveFila([next, ...rows].slice(0, 400));
  return next;
}
export function patchFila(id: string, patch: Partial<FilaItem>) {
  saveFila(readFila().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}
export function removeFila(id: string) {
  saveFila(readFila().filter((r) => r.id !== id));
}
