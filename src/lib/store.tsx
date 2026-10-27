import MiniSearch from "minisearch";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Procedure, SigtapData } from "./types";
import { digits, formatCode, looksLikeCbo, looksLikeCid, looksLikeCode, normalizeQuery } from "./format";
import { carregarTabelaCompetencia } from "./competenciaApi";
import { loadTabelaLocal, saveTabelaLocal } from "./sigtapPersist";

const ATIVA_KEY = "mesa-competencia-ativa";

type Maps = {
  proc: Map<string, Procedure>;
  grupo: Map<string, string>;
  subgrupo: Map<string, string>;
  forma: Map<string, string>;
  registro: Map<string, string>;
  modalidade: Map<string, string>;
  financiamento: Map<string, string>;
  rubrica: Map<string, string>;
  detalhe: Map<string, { n: string; d: string }>;
  habilitacao: Map<string, string>;
  leito: Map<string, string>;
  servico: Map<string, string>;
  classif: Map<string, string>;
  regra: Map<string, { n: string; d: string }>;
  renases: Map<string, string>;
  componente: Map<string, string>;
};

type SearchHit = Procedure & { score?: number };

type Store = {
  loading: boolean;
  error: string | null;
  data: SigtapData | null;
  maps: Maps | null;
  search: (q: string) => SearchHit[];
  searchNome: (q: string) => Procedure[];
  byCode: (code: string) => Procedure | undefined;
  recent: string[];
  pin: (code: string) => void;
  pinned: string[];
  usage: Record<string, number>;
  mostUsed: string[];
  remember: (code: string) => void;
  replaceData: (next: SigtapData) => void;
};

const Ctx = createContext<Store | null>(null);

async function loadBundled(): Promise<SigtapData> {
  const res = await fetch("/data/sigtap.json");
  if (!res.ok) throw new Error("Não foi possível carregar a tabela SIGTAP.");
  return (await res.json()) as SigtapData;
}

async function loadInicial(): Promise<SigtapData> {
  const ativa = localStorage.getItem(ATIVA_KEY);
  const local = await loadTabelaLocal();
  if (ativa && local?.meta.competencia === ativa) return local;
  if (ativa) {
    try {
      const fromApi = (await carregarTabelaCompetencia(ativa)) as unknown as SigtapData;
      if (fromApi.meta?.competencia && Array.isArray(fromApi.procedures)) {
        void saveTabelaLocal(fromApi);
        return fromApi;
      }
    } catch {
      /* cai no empacotado ou na última tabela do navegador */
    }
  }
  const bundled = await loadBundled();
  if (local && (local.meta.competencia ?? "") >= (bundled.meta.competencia ?? "")) return local;
  return bundled;
}

function buildMaps(data: SigtapData): Maps {
  const classif = new Map<string, string>();
  for (const item of data.lookups.classificacoes) {
    classif.set(`${item.s}-${item.c}`, item.n);
  }
  return {
    proc: new Map(data.procedures.map((p) => [p.c, p])),
    grupo: new Map(data.lookups.grupos.map((g) => [g.c, g.n])),
    subgrupo: new Map(data.lookups.subgrupos.map((s) => [`${s.g}${s.sg}`, s.n])),
    forma: new Map(data.lookups.formas.map((f) => [`${f.g}${f.sg}${f.fo}`, f.n])),
    registro: new Map(data.lookups.registros.map((r) => [r.c, r.n])),
    modalidade: new Map(data.lookups.modalidades.map((m) => [m.c, m.n])),
    financiamento: new Map(data.lookups.financiamentos.map((f) => [f.c, f.n])),
    rubrica: new Map(data.lookups.rubricas.map((r) => [r.c, r.n])),
    detalhe: new Map(data.lookups.detalhes.map((d) => [d.c, { n: d.n, d: d.d ?? "" }])),
    habilitacao: new Map(data.lookups.habilitacoes.map((h) => [h.c, h.n])),
    leito: new Map(data.lookups.leitos.map((l) => [l.c, l.n])),
    servico: new Map(data.lookups.servicos.map((s) => [s.c, s.n])),
    classif,
    regra: new Map(data.lookups.regras.map((r) => [r.c, { n: r.n, d: r.d ?? "" }])),
    renases: new Map(data.lookups.renases.map((r) => [r.c, r.n])),
    componente: new Map(data.lookups.componentes.map((c) => [c.c, c.n])),
  };
}

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function readUsage(): Record<string, number> {
  try {
    const raw = localStorage.getItem("mesa-usage");
    const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function bumpAllowed(code: string) {
  try {
    const key = `mesa-usage-bump:${code}`;
    const now = Date.now();
    const last = Number(sessionStorage.getItem(key) ?? "0");
    if (now - last < 2500) return false;
    sessionStorage.setItem(key, String(now));
    return true;
  } catch {
    return true;
  }
}

export function SigtapProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SigtapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<string[]>(() => readList("mesa-recent"));
  const [pinned, setPinned] = useState<string[]>(() => readList("mesa-pinned"));
  const [usage, setUsage] = useState<Record<string, number>>(() => readUsage());

  useEffect(() => {
    loadInicial()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, []);

  const maps = useMemo(() => (data ? buildMaps(data) : null), [data]);

  const mini = useMemo(() => {
    if (!data) return null;
    const ms = new MiniSearch({
      fields: ["c", "fmt", "n"],
      storeFields: ["c"],
      idField: "c",
      searchOptions: { prefix: true, fuzzy: 0.2, boost: { c: 4, fmt: 3, n: 2 } },
    });
    ms.addAll(
      data.procedures.map((p) => ({
        c: p.c,
        fmt: formatCode(p.c),
        n: p.n,
      })),
    );
    return ms;
  }, [data]);

  const remember = useCallback((code: string) => {
    if (code.length !== 10) return;
    setRecent((prev) => {
      if (prev[0] === code) return prev;
      const next = [code, ...prev.filter((c) => c !== code)].slice(0, 12);
      localStorage.setItem("mesa-recent", JSON.stringify(next));
      return next;
    });
    if (!bumpAllowed(code)) return;
    setUsage((prev) => {
      const next = { ...prev, [code]: (prev[code] ?? 0) + 1 };
      localStorage.setItem("mesa-usage", JSON.stringify(next));
      return next;
    });
  }, []);

  const pin = useCallback((code: string) => {
    if (code.length !== 10) return;
    setPinned((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [code, ...prev].slice(0, 40);
      localStorage.setItem("mesa-pinned", JSON.stringify(next));
      return next;
    });
  }, []);

  const mostUsed = useMemo(
    () =>
      Object.entries(usage)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([c]) => c),
    [usage],
  );

  const value: Store = {
    loading,
    error,
    data,
    maps,
    recent,
    pinned,
    usage,
    mostUsed,
    replaceData: (next) => {
      setData(next);
      localStorage.setItem(ATIVA_KEY, next.meta.competencia);
      void saveTabelaLocal(next);
    },
    remember,
    byCode: (code) => {
      const d = digits(code);
      return maps?.proc.get(d) ?? maps?.proc.get(d.padStart(10, "0"));
    },
    pin,
    search: (q) => {
      if (!data || !maps || !mini) return [];
      const raw = q.trim();
      if (!raw) return [];

      if (looksLikeCode(raw)) {
        const code = digits(raw);
        const exact = [...maps.proc.values()].filter((p) => p.c.startsWith(code)).slice(0, 40);
        if (exact.length) return exact;
      }

      if (looksLikeCid(raw)) {
        const cid = raw.toUpperCase();
        const codes = data.cidIndex[cid] ?? data.cidIndex[cid.padEnd(4, " ")] ?? [];
        return codes.map((c) => maps.proc.get(c)).filter(Boolean) as Procedure[];
      }

      if (looksLikeCbo(raw)) {
        const cbo = digits(raw);
        const codes = data.cboIndex[cbo] ?? [];
        return codes.map((c) => maps.proc.get(c)).filter(Boolean) as Procedure[];
      }

      const hits = mini.search(raw);
      const seen = new Set<string>();
      const out: SearchHit[] = [];
      for (const hit of hits) {
        if (seen.has(hit.c)) continue;
        const proc = maps.proc.get(hit.c);
        if (proc) {
          seen.add(hit.c);
          out.push(proc);
        }
        if (out.length >= 80) break;
      }
      return out;
    },
    searchNome: (q) => {
      if (!data || !maps) return [];
      const raw = q.trim();
      if (!raw) return [];

      if (looksLikeCode(raw) || looksLikeCid(raw) || looksLikeCbo(raw)) {
        return value.search(raw);
      }

      const tokens = normalizeQuery(raw).split(/\s+/).filter(Boolean);
      const digitQ = digits(raw);
      const hits = data.procedures.filter((p) => {
        const nome = normalizeQuery(p.n);
        const hay = `${nome} ${p.c}`;
        return tokens.every((t) => hay.includes(t)) || (digitQ.length >= 4 && p.c.includes(digitQ));
      });
      return hits.sort((a, b) => a.n.localeCompare(b.n, "pt-BR") || a.c.localeCompare(b.c));
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSigtap() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSigtap fora do provider");
  return ctx;
}
