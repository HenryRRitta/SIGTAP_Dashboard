import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { formatCode, money, relOf } from "../lib/format";
import { notaDe, readSerie } from "../lib/local";
import { useSigtap } from "../lib/store";
import type { CompetenciaDiff, Procedure } from "../lib/types";

export function ComparePage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "competencia" ? "competencia" : "procedimentos";
  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="font-display text-4xl">Comparar</h2>
      <p className="mt-2 text-mute">Confronte dois procedimentos da mesma competência ou veja o que mudou de um mês para o outro.</p>
      <div className="mt-4 flex gap-1 border-b border-line">
        <TabBtn active={tab === "procedimentos"} onClick={() => setParams({ tab: "procedimentos" })}>
          Dois procedimentos
        </TabBtn>
        <TabBtn active={tab === "competencia"} onClick={() => setParams({ tab: "competencia" })}>
          Competências 07 × 08/2026
        </TabBtn>
      </div>
      {tab === "procedimentos" ? <CompareProcedures /> : <CompetenciaDiffView />}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm ${active ? "border-b-2 border-moss font-semibold text-moss" : "text-mute"}`}
    >
      {children}
    </button>
  );
}

function CompareProcedures() {
  const { search, byCode, maps } = useSigtap();
  const [params, setParams] = useSearchParams();
  const [qa, setQa] = useState(params.get("a") ?? "");
  const [qb, setQb] = useState(params.get("b") ?? "");
  const a = byCode(qa) ?? (qa ? search(qa)[0] : undefined);
  const b = byCode(qb) ?? (qb ? search(qb)[0] : undefined);

  useEffect(() => {
    const next = new URLSearchParams(params);
    next.set("tab", "procedimentos");
    if (a) next.set("a", a.c);
    if (b) next.set("b", b.c);
    setParams(next, { replace: true });
  }, [a?.c, b?.c]);

  return (
    <div className="mt-6">
      <div className="grid gap-3 md:grid-cols-2">
        <SearchBox value={qa} onChange={setQa} placeholder="Procedimento A" />
        <SearchBox value={qb} onChange={setQb} placeholder="Procedimento B" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <FichaMini proc={a} />
        <FichaMini proc={b} />
      </div>
      {a && b && maps && (
        <section className="mt-6 overflow-auto rounded-xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-mute">
              <tr>
                <th className="px-3 py-2">Campo</th>
                <th>{formatCode(a.c)}</th>
                <th>{formatCode(b.c)}</th>
              </tr>
            </thead>
            <tbody>
              <Row k="Total" va={money(a.tot)} vb={money(b.tot)} />
              <Row k="SH" va={money(a.sh)} vb={money(b.sh)} />
              <Row k="SA" va={money(a.sa)} vb={money(b.sa)} />
              <Row k="SP" va={money(a.sp)} vb={money(b.sp)} />
              <Row k="Complexidade" va={a.cx} vb={b.cx} />
              <Row k="Sexo" va={a.sx} vb={b.sx} />
              <Row k="Qtd máx." va={String(a.qmax ?? "N/A")} vb={String(b.qmax ?? "N/A")} />
              <Row k="Permanência" va={String(a.perm ?? "N/A")} vb={String(b.perm ?? "N/A")} />
              <Row k="Instrumentos" va={relOf(a).registros.join(", ")} vb={relOf(b).registros.join(", ")} />
              <Row k="CIDs principais" va={String(relOf(a).cidsP.length)} vb={String(relOf(b).cidsP.length)} />
              <Row k="CBOs" va={String(relOf(a).cbos.length)} vb={String(relOf(b).cbos.length)} />
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function Row({ k, va, vb }: { k: string; va: string; vb: string }) {
  const diff = va !== vb;
  return (
    <tr className={`border-t border-line ${diff ? "bg-warning-bg" : ""}`}>
      <td className="px-3 py-2 text-mute">{k}</td>
      <td>{va}</td>
      <td>{vb}</td>
    </tr>
  );
}

function FichaMini({ proc }: { proc?: Procedure }) {
  if (!proc) return <div className="rounded-xl border border-dashed border-line p-6 text-sm text-mute">Selecione um procedimento.</div>;
  return (
    <Link to={`/procedimento/${proc.c}`} className="rounded-xl border border-line bg-card p-4">
      <p className="font-mono text-moss">{formatCode(proc.c)}</p>
      <p className="mt-1 font-semibold">{proc.n}</p>
      <p className="mt-2 tabular">{money(proc.tot)}</p>
    </Link>
  );
}

function CompetenciaDiffView() {
  const [diff, setDiff] = useState<CompetenciaDiff | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  useEffect(() => {
    fetch("/data/diff.json")
      .then((r) => {
        if (!r.ok) throw new Error("Diff não encontrado");
        return r.json();
      })
      .then(setDiff)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : "Erro"));
  }, []);
  if (err) return <p className="mt-6 text-mute">{err}</p>;
  if (!diff) return <p className="mt-6 text-mute">Carregando comparação 07/2026 × 08/2026…</p>;

  const q = filtro.trim().toLowerCase();
  const match = (c: string, n: string) => !q || c.includes(q) || n.toLowerCase().includes(q);

  return (
    <div className="mt-6">
      <p className="text-sm text-mute">
        De {diff.deLabel} ({diff.totais.antes} procedimentos) para {diff.paraLabel} ({diff.totais.depois}).
      </p>
      <SerieBarras />
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Kpi n={diff.totais.incluidos} l="incluídos" />
        <Kpi n={diff.totais.excluidos} l="excluídos" />
        <Kpi n={diff.totais.alterados} l="alterados" />
        <Kpi n={diff.valor.valorDepois - diff.valor.valorAntes} l="Δ soma SH+SA+SP" money />
      </div>
      <input className="field mt-6" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Filtrar código ou nome" />
      <Section title={`Incluídos (${diff.incluidos.length})`}>
        {diff.incluidos.filter((x) => match(x.c, x.n)).map((x) => (
          <ProcLine key={x.c} c={x.c} n={x.n} extra={money(x.tot)} />
        ))}
      </Section>
      <Section title={`Excluídos (${diff.excluidos.length})`}>
        {diff.excluidos.filter((x) => match(x.c, x.n)).map((x) => (
          <ProcLine key={x.c} c={x.c} n={x.n} extra={money(x.tot)} gone />
        ))}
      </Section>
      <Section title={`Alterados (${diff.alterados.length})`}>
        {diff.alterados.filter((x) => match(x.c, x.n)).map((x) => (
          <article key={x.c} className="border-b border-line py-2 text-sm">
            <Link className="font-mono text-moss" to={`/procedimento/${x.c}`}>
              {formatCode(x.c)}
            </Link>{" "}
            {x.n}
            <ul className="mt-1 text-mute">
              {Object.entries(x.ch).map(([k, v]) => (
                <li key={k}>
                  {labelCampo(k)}: {fmt(v, 0)} → {fmt(v, 1)}
                </li>
              ))}
            </ul>
            {notaDe(x.c) && <p className="mt-1 text-xs text-moss">{notaDe(x.c)}</p>}
          </article>
        ))}
      </Section>
    </div>
  );
}

function SerieBarras() {
  const serie = readSerie();
  const max = Math.max(...serie.map((p) => p.soma), 1);
  if (serie.length < 2) return null;
  return (
    <section className="mt-4 rounded-xl border border-line bg-card p-4">
      <h3 className="font-display text-xl">Série de competências</h3>
      <p className="mt-1 text-xs text-mute">Soma de referência SH+SA+SP. 07 e 08/2026 já vêm na mesa; importar um ZIP acrescenta o mês.</p>
      <ul className="mt-3 space-y-2">
        {serie.map((p) => (
          <li key={p.competencia} className="text-sm">
            <div className="flex justify-between gap-3">
              <span>{p.label}</span>
              <span className="tabular text-mute">
                {p.total.toLocaleString("pt-BR")} proc. · {p.soma.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-moss" style={{ width: `${Math.max(8, (p.soma / max) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Kpi({ n, l, money: isMoney }: { n: number; l: string; money?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <p className="tabular text-2xl font-semibold">{isMoney ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : n}</p>
      <p className="text-xs text-mute">{l}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="font-display text-2xl">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ProcLine({ c, n, extra, gone }: { c: string; n: string; extra: string; gone?: boolean }) {
  const nota = notaDe(c);
  return (
    <p className="border-b border-line py-1.5 text-sm">
      {gone ? (
        <span className="font-mono">{formatCode(c)}</span>
      ) : (
        <Link className="font-mono text-moss" to={`/procedimento/${c}`}>
          {formatCode(c)}
        </Link>
      )}{" "}
      {n} <span className="text-mute">{extra}</span>
      {nota && <span className="mt-1 block text-xs text-moss">{nota}</span>}
    </p>
  );
}

function labelCampo(k: string) {
  const map: Record<string, string> = {
    n: "Nome",
    tot: "Total",
    sh: "SH",
    sa: "SA",
    sp: "SP",
    cx: "Complexidade",
    sx: "Sexo",
    qmax: "Qtd máx.",
    perm: "Permanência",
    fin: "Financiamento",
    det: "Atributos",
    reg: "Instrumentos",
  };
  return map[k] ?? k;
}

function fmt(v: unknown, idx: number) {
  const arr = v as unknown[];
  const item = arr[idx];
  if (Array.isArray(item)) return item.join(", ") || "—";
  if (typeof item === "number") return item.toLocaleString("pt-BR");
  return String(item ?? "—");
}
