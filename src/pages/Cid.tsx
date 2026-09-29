import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { ProcedureCard } from "../components/ProcedureCard";
import { looksLikeCbo, looksLikeCid, digits, formatCode } from "../lib/format";
import { sigtapOfTuss } from "../lib/local";
import { useSigtap } from "../lib/store";

export function CidPage() {
  const { data, maps } = useSigtap();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const cidHits = useMemo(() => {
    const term = q.trim().toUpperCase();
    if (!term) return [];
    return Object.entries(data!.cids)
      .filter(([c, info]) => c.startsWith(term) || info.n.toLowerCase().includes(q.trim().toLowerCase()))
      .slice(0, 40);
  }, [data, q]);

  const cboHits = useMemo(() => {
    const term = q.replace(/\D/g, "");
    const name = q.trim().toLowerCase();
    return Object.entries(data!.cbos)
      .filter(([c, n]) => (term.length >= 3 && c.startsWith(term)) || n.toLowerCase().includes(name))
      .slice(0, 40);
  }, [data, q]);

  const cidKey = looksLikeCid(q) ? q.trim().toUpperCase() : cidHits[0]?.[0];
  const cboKey = looksLikeCbo(q) ? q.replace(/\D/g, "") : "";
  const procCodes = cidKey
    ? (data!.cidIndex[cidKey] ?? data!.cidIndex[cidKey.padEnd(4, " ")] ?? [])
    : cboKey
      ? (data!.cboIndex[cboKey] ?? [])
      : [];
  const tussHits = digits(q).length >= 6 ? sigtapOfTuss(q) : [];
  const procs = procCodes.map((c) => maps?.proc.get(c)).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="font-display text-4xl">CID-10 e CBO</h2>
      <p className="mt-2 text-mute">Entre pelo diagnóstico ou pela ocupação e veja os procedimentos que a tabela autoriza.</p>
      <div className="mt-6">
        <SearchBox
          value={q}
          onChange={(v) => {
            setQ(v);
            setParams(v ? { q: v } : {});
          }}
          placeholder="CID (I10, C50) ou CBO (225125) ou nome"
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-card p-4">
          <h3 className="font-display text-xl">Diagnósticos</h3>
          <ul className="mt-3 max-h-80 space-y-1 overflow-auto text-sm">
            {cidHits.map(([c, info]) => (
              <li key={c}>
                <button className="text-left" onClick={() => setQ(c)}>
                  <span className="font-mono text-moss">{c}</span> {info.n}
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-line bg-card p-4">
          <h3 className="font-display text-xl">Ocupações</h3>
          <ul className="mt-3 max-h-80 space-y-1 overflow-auto text-sm">
            {cboHits.map(([c, n]) => (
              <li key={c}>
                <button className="text-left" onClick={() => setQ(c)}>
                  <span className="font-mono text-moss">{c}</span> {n}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="mt-8">
        <h3 className="font-display text-2xl">
          Procedimentos relacionados
          {cidKey ? ` · CID ${cidKey}` : cboKey ? ` · CBO ${cboKey}` : ""}
        </h3>
        <div className="mt-4 space-y-3">
          {procs.slice(0, 60).map((p) => p && <ProcedureCard key={p.c} proc={p} />)}
        </div>
        {q && procs.length === 0 && tussHits.length === 0 && <p className="mt-4 text-mute">Nenhum procedimento vinculado a essa busca.</p>}
      </section>
      {tussHits.length > 0 && (
        <section className="mt-8">
          <h3 className="font-display text-2xl">TUSS local</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {tussHits.map((t) => (
              <li key={`${t.tuss}-${t.sigtap}`}>
                TUSS {t.tuss} →{" "}
                <Link className="font-mono text-moss" to={`/procedimento/${t.sigtap}`}>
                  {formatCode(t.sigtap.padStart(10, "0").slice(-10))}
                </Link>{" "}
                {t.nome || maps?.proc.get(t.sigtap.padStart(10, "0").slice(-10))?.n}
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="mt-8 text-sm text-mute">
        A ficha de um procedimento também lista CID principal vs secundário. Exemplo:{" "}
        <Link className="text-moss" to="/procedimento/0411010034">
          abrir operação cesariana
        </Link>
        .
      </p>
    </div>
  );
}
