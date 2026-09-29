import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { ProcedureCard } from "../components/ProcedureCard";
import { formatCode, relOf } from "../lib/format";
import { checklistGlosa, familiaDaConta, familiaInstrumento, type Gravidade } from "../lib/glosa";
import { useSigtap } from "../lib/store";
import { openPrint } from "../lib/workspace";

const TONE: Record<Gravidade, string> = {
  glosa: "border-danger-bg bg-danger-bg",
  alerta: "border-warning-bg bg-warning-bg",
  conferir: "border-neutral-bg bg-neutral-bg",
};

export function GlosaPage() {
  const { code = "" } = useParams();
  const { data, maps, search, byCode } = useSigtap();
  const [q, setQ] = useState(code);
  const [instrumento, setInstrumento] = useState("");
  const hits = useMemo(() => (q.trim() ? search(q).slice(0, 6) : []), [q, search]);
  const proc = byCode(q) ?? hits[0];
  const rel = proc ? relOf(proc) : null;
  const items = proc ? checklistGlosa(proc, instrumento || undefined) : [];
  const familia = instrumento ? familiaInstrumento(instrumento) : proc && rel ? familiaDaConta(rel.registros) : "GERAL";

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="font-display text-4xl">Checklist de glosa</h2>
      <p className="mt-2 max-w-2xl text-mute">
        Roteiro por instrumento — AIH, APAC, BPA, RAAS e e-SUS APS — a partir dos atributos reais da tabela, não de um checklist genérico.
      </p>
      <div className="mt-6">
        <SearchBox value={q} onChange={setQ} placeholder="Procedimento a auditar" />
      </div>
      {proc && (
        <div className="mt-4">
          <ProcedureCard proc={proc} />
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <select className="field max-w-sm" value={instrumento} onChange={(e) => setInstrumento(e.target.value)}>
          <option value="">Instrumento da conta (automático)</option>
          {data!.lookups.registros.map((r) => (
            <option key={r.c} value={r.c}>
              {r.c} · {r.n}
            </option>
          ))}
        </select>
        {proc && (
          <button
            className="rounded-xl bg-moss px-4 py-2 text-sm text-white"
            onClick={() => openPrint(`/print/ficha/${proc.c}`)}
          >
            Exportar ficha PDF
          </button>
        )}
      </div>
      {proc && (
        <p className="mt-3 text-sm text-mute">
          Família ativa: <b className="text-ink">{familia}</b> · {items.length} pontos de conferência ·{" "}
          <Link className="text-moss" to={`/auditoria/${proc.c}`}>
            ir para o simulador
          </Link>
        </p>
      )}
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <article key={item.id} className={`rounded-xl border p-4 ${TONE[item.gravidade]}`}>
            <p className="text-[11px] font-semibold tracking-wide uppercase">{item.gravidade} · {item.fundamento}</p>
            <h3 className="mt-1 font-semibold">{item.titulo}</h3>
            <p className="mt-1 text-sm leading-relaxed">{item.texto}</p>
          </article>
        ))}
      </div>
      {proc && maps && (
        <p className="mt-8 text-sm text-mute">
          Procedimento {formatCode(proc.c)} no grupo {maps.grupo.get(proc.g)}.
        </p>
      )}
    </div>
  );
}
