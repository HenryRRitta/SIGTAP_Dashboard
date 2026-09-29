import { LayoutGrid, Table2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ProcedureCard } from "./ProcedureCard";
import { COMPLEX_TONE, compactInt, formatCode, money, relOf } from "../lib/format";
import { useSigtap } from "../lib/store";
import type { Procedure } from "../lib/types";
import { downloadCsv } from "../lib/workspace";

export type SearchView = "cartoes" | "tabela";

export function SearchResults({
  hits,
  termo,
  view,
  onViewChange,
}: {
  hits: Procedure[];
  termo: string;
  view: SearchView;
  onViewChange: (view: SearchView) => void;
}) {
  const { data, maps } = useSigtap();
  const porCx = hits.reduce<Record<string, number>>((acc, p) => {
    acc[p.cx] = (acc[p.cx] ?? 0) + 1;
    return acc;
  }, {});
  const soma = hits.reduce((s, p) => s + p.tot, 0);
  const comPerm = hits.filter((p) => p.perm != null);
  const permMedia = comPerm.length ? comPerm.reduce((s, p) => s + (p.perm ?? 0), 0) / comPerm.length : null;

  if (!termo) return null;

  if (hits.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-dashed border-line p-8 text-center text-mute">
        Nenhum procedimento com “{termo}” nesta competência.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Encontrados" value={compactInt(hits.length)} />
        <Kpi label="Alta complexidade" value={compactInt(porCx["3"] ?? 0)} />
        <Kpi label="Soma de referência" value={money(soma)} />
        <Kpi
          label="Permanência média"
          value={permMedia == null ? "—" : `${permMedia.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} dia(s)`}
        />
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-line bg-card p-1">
          <ViewBtn active={view === "cartoes"} onClick={() => onViewChange("cartoes")} icon={LayoutGrid} label="Cartões" />
          <ViewBtn active={view === "tabela"} onClick={() => onViewChange("tabela")} icon={Table2} label="Tabela" />
        </div>
        <button
          className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm"
          onClick={() =>
            downloadCsv(`sigtap-pesquisa-${termo}.csv`, [
              ["codigo", "nome", "complexidade", "sexo", "permanencia", "qtd_max", "sh", "sa", "sp", "total", "instrumentos"],
              ...hits.map((p) => [
                formatCode(p.c),
                p.n,
                data!.lookups.complexidade[p.cx] ?? p.cx,
                data!.lookups.sexo[p.sx] ?? p.sx,
                p.perm ?? "",
                p.qmax ?? "",
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
      </div>

      {view === "cartoes" ? (
        <div className="mt-4 space-y-3">
          {hits.map((p) => (
            <ProcedureCard key={p.c} proc={p} />
          ))}
        </div>
      ) : (
        <div className="mt-4 overflow-auto rounded-xl border border-line bg-card shadow-card">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="bg-mist text-[12px] font-semibold text-mute">
                <th className="px-4 py-3">Procedimento</th>
                <th className="px-3 py-3">Complexidade</th>
                <th className="px-3 py-3 text-right">Valor</th>
                <th className="px-3 py-3">Permanência</th>
                <th className="px-3 py-3">Sexo</th>
                <th className="px-3 py-3">Qtd máx.</th>
                <th className="px-3 py-3">Instrumento</th>
              </tr>
            </thead>
            <tbody>
              {hits.map((p) => {
                const rel = relOf(p);
                const cx = data!.lookups.complexidade[p.cx] ?? p.cx;
                return (
                  <tr key={p.c} className="border-t border-line hover:bg-mist">
                    <td className="px-4 py-3">
                      <Link to={`/procedimento/${p.c}`} className="block">
                        <span className="font-mono text-moss">{formatCode(p.c)}</span>
                        <span className="text-mute"> — </span>
                        <span className="font-medium text-ink">{p.n}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${COMPLEX_TONE[p.cx] ?? "bg-leaf text-moss"}`}>
                        {cx}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular font-semibold text-success">{money(p.tot)}</td>
                    <td className="px-3 py-3 tabular text-mute">{p.perm != null ? `${p.perm} dia(s)` : "—"}</td>
                    <td className="px-3 py-3">{data!.lookups.sexo[p.sx] ?? p.sx}</td>
                    <td className="px-3 py-3 tabular">{p.qmax ?? "—"}</td>
                    <td className="px-3 py-3 text-mute">
                      {rel.registros.map((r) => maps?.registro.get(r) ?? r).join(", ") || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ViewBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutGrid;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
        active ? "bg-moss text-white" : "text-mute hover:text-ink"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-card px-4 py-3 shadow-card">
      <p className="text-xs text-mute">{label}</p>
      <p className="tabular mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
