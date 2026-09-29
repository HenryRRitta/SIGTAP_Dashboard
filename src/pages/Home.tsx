import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardCheck, GitCompare, Inbox, ShieldAlert, Table2 } from "lucide-react";
import { SearchBox } from "../components/SearchBox";
import { ProcedureCard } from "../components/ProcedureCard";
import { SearchResults, type SearchView } from "../components/SearchResults";
import { compactInt, money } from "../lib/format";
import { useSigtap } from "../lib/store";

const VIEW_KEY = "mesa-busca-view";

function readView(): SearchView {
  try {
    return localStorage.getItem(VIEW_KEY) === "tabela" ? "tabela" : "cartoes";
  } catch {
    return "cartoes";
  }
}

export function HomePage() {
  const { data, maps, searchNome, recent, pinned } = useSigtap();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [view, setView] = useState<SearchView>(readView);
  const hits = useMemo(() => (q.trim() ? searchNome(q) : []), [q, searchNome]);
  const meta = data!.meta;

  const recentProcs = recent.map((c) => maps?.proc.get(c)).filter(Boolean);
  const pinnedProcs = pinned.map((c) => maps?.proc.get(c)).filter(Boolean);

  function escolherView(next: SearchView) {
    setView(next);
    localStorage.setItem(VIEW_KEY, next);
  }

  function irParaResultados() {
    const t = q.trim();
    if (t) navigate(`/pesquisa?q=${encodeURIComponent(t)}&view=${view}`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="font-mono text-[12px] tracking-[0.18em] text-moss uppercase">Competência {meta.competenciaLabel}</p>
      <h2 className="font-display mt-1 text-4xl md:text-5xl">Consulta para auditoria médica SUS</h2>
      <p className="mt-3 max-w-2xl text-[17px] text-mute">
        Busque pelo código SIGTAP, nome, CID-10 ou CBO. A ficha mostra atributos gerais, consistências, habilitações CNES e o que costuma glosar.
      </p>
      <div className="mt-6">
        <SearchBox value={q} onChange={setQ} onSubmit={irParaResultados} autoFocus />
      </div>

      {q.trim() ? (
        <SearchResults hits={hits} termo={q.trim()} view={view} onViewChange={escolherView} />
      ) : (
        <>
          <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Procedimentos" value={compactInt(meta.totalProcedimentos)} hint="vigentes nesta competência" />
            <Kpi label="Alta complexidade" value={compactInt(meta.porComplexidade["3"] ?? 0)} hint="grupo de maior risco de glosa" />
            <Kpi label="Vínculos CID" value={compactInt(meta.totalRelCid)} hint={`${compactInt(meta.totalCids)} diagnósticos`} />
            <Kpi label="Soma de referência" value={money(meta.somaValoresReferencia)} hint="SH + SA + SP da tabela" />
          </section>

          <section className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Shortcut to="/auditoria" icon={ClipboardCheck} title="Simular consistência" text="Sexo, idade, CID, CBO e instrumento — depois o parecer em PDF." />
            <Shortcut to="/lote" icon={Table2} title="Consistir um lote" text="CSV ou XML de AIH, APAC ou BPA. Mapa de glosas e CSV de volta." />
            <Shortcut to="/fila" icon={Inbox} title="Fila de pareceres" text="Em análise, glosado ou deferido. Exportação mensal para o gestor." />
            <Shortcut to="/glosas" icon={ShieldAlert} title="Checklist de glosa" text="Roteiro por AIH, APAC, BPA, RAAS e e-SUS APS." />
            <Shortcut to="/comparar?tab=competencia" icon={GitCompare} title="O que mudou no mês" text="Incluídos, excluídos e série de competências." />
          </section>

          <section className="mt-10">
            <h3 className="font-display text-2xl">Grupos da tabela</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data!.lookups.grupos.map((g) => (
                <Link
                  key={g.c}
                  to={`/catalogo?grupo=${g.c}`}
                  className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 hover:border-moss/40"
                >
                  <div>
                    <p className="font-mono text-[12px] text-moss">{g.c}</p>
                    <p className="font-medium">{g.n}</p>
                  </div>
                  <p className="tabular text-mute">{compactInt(meta.porGrupo[g.c] ?? 0)}</p>
                </Link>
              ))}
            </div>
          </section>

          {pinnedProcs.length > 0 && (
            <section className="mt-10">
              <h3 className="font-display text-2xl">Fixados</h3>
              <div className="mt-4 space-y-3">
                {pinnedProcs.map((p) => p && <ProcedureCard key={p.c} proc={p} />)}
              </div>
            </section>
          )}

          {recentProcs.length > 0 && (
            <section className="mt-10">
              <h3 className="font-display text-2xl">Vistos recentemente</h3>
              <div className="mt-4 space-y-3">
                {recentProcs.map((p) => p && <ProcedureCard key={p.c} proc={p} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-line bg-card p-6 shadow-card">
      <p className="text-sm text-mute">{label}</p>
      <p className="tabular mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-mute">{hint}</p>
    </div>
  );
}

function Shortcut({
  to,
  icon: Icon,
  title,
  text,
}: {
  to: string;
  icon: typeof ClipboardCheck;
  title: string;
  text: string;
}) {
  return (
    <Link to={to} className="rounded-xl bg-moss px-5 py-4 text-white shadow-card hover:bg-moss-2">
      <Icon size={18} />
      <p className="mt-3 font-display text-xl">{title}</p>
      <p className="mt-1 text-sm text-white/80">{text}</p>
    </Link>
  );
}
