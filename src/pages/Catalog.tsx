import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BackLink } from "../components/BackLink";
import { SearchBox } from "../components/SearchBox";
import { ProcedureCard } from "../components/ProcedureCard";
import { compactInt, formatCode } from "../lib/format";
import { useSigtap } from "../lib/store";
import { downloadCsv } from "../lib/workspace";

export function CatalogPage() {
  const { data, maps, search } = useSigtap();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const grupo = params.get("grupo") ?? "";
  const sub = params.get("sub") ?? "";
  const forma = params.get("forma") ?? "";
  const cx = params.get("cx") ?? "";
  const registro = params.get("registro") ?? "";
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    let rows = q.trim() ? search(q) : data!.procedures;
    if (grupo) rows = rows.filter((p) => p.g === grupo);
    if (sub) rows = rows.filter((p) => p.sg === sub);
    if (forma) rows = rows.filter((p) => p.fo === forma);
    if (cx) rows = rows.filter((p) => p.cx === cx);
    if (registro) rows = rows.filter((p) => p.rel?.registros.includes(registro));
    return rows;
  }, [data, q, search, grupo, sub, forma, cx, registro]);

  const subgrupos = data!.lookups.subgrupos.filter((s) => !grupo || s.g === grupo);
  const formas = data!.lookups.formas.filter((f) => (!grupo || f.g === grupo) && (!sub || f.sg === sub));

  function set(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "grupo") {
      next.delete("sub");
      next.delete("forma");
    }
    if (key === "sub") next.delete("forma");
    setParams(next);
  }

  function voltar() {
    if (forma) set("forma", "");
    else if (sub) set("sub", "");
    else if (grupo || cx || registro) {
      setParams(new URLSearchParams());
      setQ("");
    } else {
      navigate("/");
    }
  }

  const backLabel = forma
    ? "Voltar ao subgrupo"
    : sub
      ? "Voltar ao grupo"
      : grupo || cx || registro
        ? "Voltar aos grupos"
        : "Voltar à mesa";

  const mostrarLista = Boolean(grupo || q.trim() || cx || registro);

  return (
    <div className="mx-auto max-w-6xl">
      <BackLink onClick={voltar}>{backLabel}</BackLink>
      <nav className="mt-2 flex flex-wrap items-center gap-1 text-sm text-mute">
        <Link to="/" className="hover:text-moss">
          Mesa
        </Link>
        <span>/</span>
        <button type="button" className="hover:text-moss" onClick={() => { setParams(new URLSearchParams()); setQ(""); }}>
          Catálogo
        </button>
        {grupo && (
          <>
            <span>/</span>
            <button type="button" className="hover:text-moss" onClick={() => { set("grupo", grupo); }}>
              {grupo} {maps?.grupo.get(grupo)}
            </button>
          </>
        )}
        {sub && (
          <>
            <span>/</span>
            <button type="button" className="hover:text-moss" onClick={() => { const next = new URLSearchParams(params); next.delete("forma"); setParams(next); }}>
              {sub} {maps?.subgrupo.get(`${grupo}${sub}`)}
            </button>
          </>
        )}
        {forma && (
          <>
            <span>/</span>
            <span className="text-ink">{maps?.forma.get(`${grupo}${sub}${forma}`)}</span>
          </>
        )}
      </nav>
      <h2 className="font-display mt-3 text-4xl">
        {grupo ? (maps?.grupo.get(grupo) ?? "Catálogo") : "Catálogo"}
      </h2>
      <p className="mt-2 text-mute">
        {grupo
          ? "Escolha o subgrupo ou a forma, ou volte aos grupos da tabela."
          : "Escolha um grupo da tabela unificada. Depois você pode voltar a este menu."}
      </p>
      <div className="mt-6">
        <SearchBox value={q} onChange={setQ} placeholder="Buscar neste nível" />
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-5">
        <Select label="Grupo" value={grupo} onChange={(v) => set("grupo", v)} options={[{ v: "", n: "Todos" }, ...data!.lookups.grupos.map((g) => ({ v: g.c, n: `${g.c} · ${g.n}` }))]} />
        <Select label="Subgrupo" value={sub} onChange={(v) => set("sub", v)} options={[{ v: "", n: "Todos" }, ...subgrupos.map((s) => ({ v: s.sg, n: `${s.g}.${s.sg} · ${s.n}` }))]} />
        <Select label="Forma" value={forma} onChange={(v) => set("forma", v)} options={[{ v: "", n: "Todas" }, ...formas.map((f) => ({ v: f.fo, n: `${f.fo} · ${f.n}` }))]} />
        <Select
          label="Complexidade"
          value={cx}
          onChange={(v) => set("cx", v)}
          options={[{ v: "", n: "Todas" }, ...Object.entries(data!.lookups.complexidade).map(([v, n]) => ({ v, n }))]}
        />
        <Select
          label="Instrumento"
          value={registro}
          onChange={(v) => set("registro", v)}
          options={[{ v: "", n: "Todos" }, ...data!.lookups.registros.map((r) => ({ v: r.c, n: r.n }))]}
        />
      </div>

      {!grupo && !q.trim() && !cx && !registro && (
        <section className="mt-8">
          <h3 className="font-display text-2xl">Grupos da tabela</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data!.lookups.grupos.map((g) => (
              <button
                key={g.c}
                type="button"
                onClick={() => set("grupo", g.c)}
                className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 text-left hover:border-moss/40"
              >
                <div>
                  <p className="font-mono text-[12px] text-moss">{g.c}</p>
                  <p className="font-medium">{g.n}</p>
                </div>
                <p className="tabular text-mute">{compactInt(data!.meta.porGrupo[g.c] ?? 0)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {grupo && !sub && (
        <section className="mt-8">
          <h3 className="font-display text-2xl">Subgrupos</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {subgrupos.map((s) => (
              <button
                key={`${s.g}${s.sg}`}
                type="button"
                onClick={() => set("sub", s.sg)}
                className="rounded-xl border border-line bg-card px-4 py-3 text-left hover:border-moss/40"
              >
                <p className="font-mono text-[12px] text-moss">
                  {s.g}.{s.sg}
                </p>
                <p className="font-medium">{s.n}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {grupo && sub && !forma && (
        <section className="mt-8">
          <h3 className="font-display text-2xl">Formas de organização</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {formas.map((f) => (
              <button
                key={`${f.g}${f.sg}${f.fo}`}
                type="button"
                onClick={() => set("forma", f.fo)}
                className="rounded-xl border border-line bg-card px-4 py-3 text-left hover:border-moss/40"
              >
                <p className="font-mono text-[12px] text-moss">{f.fo}</p>
                <p className="font-medium">{f.n}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {mostrarLista && (
        <>
          <p className="mt-8 flex flex-wrap items-center justify-between gap-2 text-sm text-mute">
            <span>
              {list.length.toLocaleString("pt-BR")} procedimento(s)
              {grupo ? ` · ${maps?.grupo.get(grupo)}` : ""}
            </span>
            <button
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-ink"
              onClick={() =>
                downloadCsv(`sigtap-catalogo-${data!.meta.competencia}.csv`, [
                  ["codigo", "nome", "grupo", "complexidade", "sexo", "sh", "sa", "sp", "total", "instrumentos"],
                  ...list.map((p) => [
                    formatCode(p.c),
                    p.n,
                    p.g,
                    p.cx,
                    p.sx,
                    p.sh,
                    p.sa,
                    p.sp,
                    p.tot,
                    (p.rel?.registros ?? []).join("|"),
                  ]),
                ])
              }
            >
              Exportar CSV
            </button>
          </p>
          <div className="mt-4 space-y-3">
            {list.slice(0, 120).map((p) => (
              <ProcedureCard key={p.c} proc={p} />
            ))}
          </div>
          {list.length > 120 && <p className="mt-4 text-sm text-mute">Mostrando 120 de {list.length}. Refine a busca ou a hierarquia.</p>}
        </>
      )}
    </div>
  );
}

function Select({
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
    <label className="text-sm">
      <span className="mb-1 block text-mute">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-card px-3 py-2 outline-none"
      >
        {options.map((o) => (
          <option key={o.v + o.n} value={o.v}>
            {o.n}
          </option>
        ))}
      </select>
    </label>
  );
}
