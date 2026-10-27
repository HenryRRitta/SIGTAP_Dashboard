import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Filter,
  Hospital,
  Network,
  Pill,
} from "lucide-react";
import { IntegrityBar } from "../components/IntegrityBar";
import { ProcedurePanel } from "../components/ProcedurePanel";
import { TypeaheadField } from "../components/TypeaheadField";
import {
  PAGE_SIZE,
  filtrarProcedimentos,
  resumoCompetencia,
  tituloCategoria,
  type CategoriaConsulta,
} from "../lib/consulta";
import { COMPLEX_TONE, compactInt, formatCode, money } from "../lib/format";
import { useSigtap } from "../lib/store";
import type { Procedure } from "../lib/types";

function catFromParam(raw: string | null): CategoriaConsulta {
  if (raw === "procedimentos" || raw === "medicamentos" || raw === "opm") return raw;
  return "todos";
}

export function HomePage() {
  const { data, maps, searchNome, byCode, remember } = useSigtap();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const categoria = catFromParam(params.get("cat"));
  const q = params.get("q") ?? "";
  const [draft, setDraft] = useState(q);

  useEffect(() => {
    setDraft(q);
  }, [q]);

  useEffect(() => {
    const next = draft.trim();
    if (next === q) return;
    const timer = window.setTimeout(() => {
      patch({ q: next });
    }, 200);
    return () => window.clearTimeout(timer);
    // A busca instantânea só reage à digitação; patch lê os demais filtros do URL atual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);
  const grupo = params.get("grupo") ?? "";
  const sub = params.get("sub") ?? "";
  const forma = params.get("forma") ?? "";
  const cx = params.get("cx") ?? "";
  const fin = params.get("fin") ?? "";
  const registro = params.get("registro") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const sel = params.get("sel") ?? "";

  const resumo = useMemo(
    () => resumoCompetencia(data!, (cod) => maps?.modalidade.get(cod)),
    [data, maps],
  );

  const rows = useMemo(
    () =>
      filtrarProcedimentos(
        data!.procedures,
        {
          categoria,
          texto: draft,
          grupo,
          subgrupo: sub,
          forma,
          complexidade: cx,
          financiamento: fin,
          instrumento: registro,
        },
        searchNome,
      ),
    [data, categoria, draft, grupo, sub, forma, cx, fin, registro, searchNome],
  );

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageSafe = Math.min(page, pages);
  const slice = rows.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);
  const selected = (sel ? byCode(sel) : undefined) ?? slice[0];

  const subgrupos = data!.lookups.subgrupos.filter((s) => !grupo || s.g === grupo);
  const formas = data!.lookups.formas.filter((f) => (!grupo || f.g === grupo) && (!sub || f.sg === sub));

  function patch(next: Record<string, string>, resetPage = true) {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    if (resetPage) p.delete("page");
    if (next.grupo !== undefined) {
      p.delete("sub");
      p.delete("forma");
    }
    setParams(p, { replace: true });
  }

  function buscar() {
    patch({ q: draft.trim() });
  }

  function selecionar(proc: Procedure) {
    patch({ sel: proc.c }, false);
    remember(proc.c);
  }

  function limpar() {
    setDraft("");
    setParams(categoria === "todos" ? new URLSearchParams() : new URLSearchParams({ cat: categoria }));
  }

  const meta = data!.meta;
  const chips = [
    grupo && `Grupo ${grupo}`,
    sub && `Subgrupo ${sub}`,
    forma && `Forma ${forma}`,
    cx && (data!.lookups.complexidade[cx] ?? cx),
    fin && (maps?.financiamento.get(fin) ?? fin),
    registro && (maps?.registro.get(registro) ?? registro),
    draft && `Busca “${draft.trim()}”`,
  ].filter(Boolean) as string[];

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        <Metric icon={ClipboardList} label="Procedimentos" value={compactInt(resumo.procedimentos)} detail="grupos da tabela, sem 06 e 07" />
        <Metric
          icon={Activity}
          label="Com modalidade ambulatorial"
          value={resumo.ambulatorial ? compactInt(resumo.ambulatorial) : "—"}
          detail={resumo.ambulatorial ? "pelo cadastro de modalidade" : "sem classificação ambulatorial na base"}
        />
        <Metric
          icon={Hospital}
          label="Com modalidade hospitalar"
          value={resumo.hospitalar ? compactInt(resumo.hospitalar) : "—"}
          detail={resumo.hospitalar ? "pelo cadastro de modalidade" : "sem classificação hospitalar na base"}
        />
        <Metric icon={Pill} label="Medicamentos" value={compactInt(resumo.medicamentos)} detail="grupo 06" />
        <Metric icon={Network} label="OPM" value={compactInt(resumo.opm)} detail="grupo 07" />
        <Metric icon={CalendarDays} label="Competência atual" value={meta.competenciaLabel} detail={`${compactInt(resumo.total)} registros vigentes`} />
      </div>

      <div className="exe-panel mb-3 flex flex-wrap items-end gap-2 p-3">
        <label className="grid w-44 gap-1 text-[11px] text-mute">
          Categoria
          <select
            aria-label="Categoria"
            className="field"
            value={categoria}
            onChange={(e) => {
              const v = e.target.value as CategoriaConsulta;
              patch({ cat: v === "todos" ? "" : v, grupo: "", sub: "", forma: "" });
            }}
          >
            <option value="todos">Todos</option>
            <option value="procedimentos">Procedimentos</option>
            <option value="medicamentos">Medicamentos</option>
            <option value="opm">OPM</option>
          </select>
        </label>
        <TypeaheadField
          variant="home"
          ariaLabel="Buscar procedimento"
          placeholder="Buscar por código, descrição, CID-10 ou CBO…"
          value={draft}
          onChange={setDraft}
          onSubmit={buscar}
          onPick={(hit) => {
            setDraft(hit.title);
            patch({ q: hit.title, sel: hit.code });
            remember(hit.code);
          }}
        />
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#d5e2f4] px-3 text-sm text-[#1955a4]"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          <Filter size={16} /> Filtros avançados
        </button>
      </div>

      {filtersOpen && (
        <div className="exe-panel mb-3 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Field label="Grupo" value={grupo} onChange={(v) => patch({ grupo: v })} options={[{ v: "", n: "Todos" }, ...data!.lookups.grupos.map((g) => ({ v: g.c, n: `${g.c} · ${g.n}` }))]} />
          <Field label="Subgrupo" value={sub} onChange={(v) => patch({ sub: v })} options={[{ v: "", n: "Todos" }, ...subgrupos.map((s) => ({ v: s.sg, n: `${s.g}.${s.sg} · ${s.n}` }))]} />
          <Field label="Forma" value={forma} onChange={(v) => patch({ forma: v })} options={[{ v: "", n: "Todas" }, ...formas.map((f) => ({ v: f.fo, n: `${f.fo} · ${f.n}` }))]} />
          <Field label="Complexidade" value={cx} onChange={(v) => patch({ cx: v })} options={[{ v: "", n: "Todas" }, ...Object.entries(data!.lookups.complexidade).map(([v, n]) => ({ v, n }))]} />
          <Field label="Financiamento" value={fin} onChange={(v) => patch({ fin: v })} options={[{ v: "", n: "Todos" }, ...data!.lookups.financiamentos.map((f) => ({ v: f.c, n: f.n }))]} />
          <Field label="Instrumento" value={registro} onChange={(v) => patch({ registro: v })} options={[{ v: "", n: "Todos" }, ...data!.lookups.registros.map((r) => ({ v: r.c, n: r.n }))]} />
          <button type="button" className="field text-moss" onClick={limpar}>
            Limpar filtros
          </button>
        </div>
      )}

      {chips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="rounded-full bg-leaf px-2.5 py-1 text-[11px] text-moss">
              {c}
            </span>
          ))}
        </div>
      )}

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.9fr)_minmax(360px,1fr)]">
        <section className="exe-panel min-w-0 overflow-hidden">
          <div className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-navy-950">
                {tituloCategoria(categoria)} ({compactInt(rows.length)})
              </h2>
              <small className="text-xs text-mute">
                Exibindo {(pageSafe - 1) * PAGE_SIZE + (slice.length ? 1 : 0)}–{(pageSafe - 1) * PAGE_SIZE + slice.length} de {compactInt(rows.length)}
              </small>
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por complexidade">
              {[{ v: "", n: "Todas" }, ...Object.entries(data!.lookups.complexidade).map(([v, n]) => ({ v, n }))].map((opt) => {
                const on = cx === opt.v;
                return (
                  <button
                    key={opt.v || "todas"}
                    type="button"
                    aria-pressed={on}
                    onClick={() => patch({ cx: opt.v })}
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      on
                        ? opt.v
                          ? COMPLEX_TONE[opt.v] ?? "bg-navy-950 text-white"
                          : "bg-navy-950 text-white"
                        : "border border-line bg-card text-mute hover:border-moss/40 hover:text-moss"
                    }`}
                  >
                    {opt.n}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="max-h-[540px] overflow-auto px-2 pb-2">
            <table className="exe-table w-full min-w-[860px] text-left text-[11px]">
              <thead>
                <tr>
                  {["Código", "Descrição", "Grupo", "Subgrupo", "Forma", "Complexidade", "SA (R$)", "SH (R$)", "SP (R$)", "Total ref."].map((h) => (
                    <th key={h} className="px-2 py-2.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((p) => (
                  <tr
                    key={p.c}
                    className={p.c === selected?.c ? "selected" : ""}
                    tabIndex={0}
                    onClick={() => selecionar(p)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selecionar(p);
                      }
                    }}
                  >
                    <td className="px-2 py-2.5 font-mono text-moss whitespace-nowrap">{formatCode(p.c)}</td>
                    <td className="px-2 py-2.5 max-w-[280px] truncate">{p.n}</td>
                    <td className="px-2 py-2.5">{p.g}</td>
                    <td className="px-2 py-2.5">{p.sg}</td>
                    <td className="px-2 py-2.5">{p.fo}</td>
                    <td className="px-2 py-2.5">{data!.lookups.complexidade[p.cx] ?? p.cx}</td>
                    <td className="tabular px-2 py-2.5 text-right">{money(p.sa)}</td>
                    <td className="tabular px-2 py-2.5 text-right">{money(p.sh)}</td>
                    <td className="tabular px-2 py-2.5 text-right">{money(p.sp)}</td>
                    <td className="tabular px-2 py-2.5 text-right font-semibold">{money(p.tot)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="p-8 text-center text-sm text-mute">
                Nenhum resultado{q ? ` para “${q}”` : ""} nesta competência.
                <button type="button" className="ml-2 text-moss underline" onClick={limpar}>
                  Limpar busca e filtros
                </button>
              </p>
            )}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-end gap-2 border-t border-line px-3 py-2 text-xs">
              <button type="button" className="rounded border border-line px-2 py-1 disabled:opacity-40" disabled={pageSafe <= 1} onClick={() => patch({ page: String(pageSafe - 1) }, false)}>
                Anterior
              </button>
              <span className="tabular text-mute">
                {pageSafe} / {pages}
              </span>
              <button type="button" className="rounded border border-line px-2 py-1 disabled:opacity-40" disabled={pageSafe >= pages} onClick={() => patch({ page: String(pageSafe + 1) }, false)}>
                Próxima
              </button>
            </div>
          )}
        </section>
        <ProcedurePanel proc={selected} />
      </div>
      <IntegrityBar />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="exe-panel flex min-h-[90px] items-center gap-3 p-3">
      <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-leaf text-moss">
        <Icon size={22} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-mute">{label}</p>
        <p className="tabular text-[22px] font-bold leading-tight text-navy-950">{value}</p>
        <p className="truncate text-[11px] text-mute">{detail}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; n: string }[];
}) {
  return (
    <label className="grid gap-1 text-[11px] text-mute">
      {label}
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o) => (
          <option key={o.v || "all"} value={o.v}>
            {o.n}
          </option>
        ))}
      </select>
    </label>
  );
}
