import { Link } from "react-router-dom";
import type { Procedure } from "../lib/types";
import { COMPLEX_TONE, formatCode, money, relOf } from "../lib/format";
import { useSigtap } from "../lib/store";
import { FavoriteButton } from "./FavoriteButton";

export function ProcedureCard({ proc }: { proc: Procedure }) {
  const { data, maps } = useSigtap();
  const rel = relOf(proc);
  const cx = data?.lookups.complexidade[proc.cx] ?? proc.cx;

  return (
    <article className="rounded-xl border border-line bg-card shadow-card transition hover:border-moss/40">
      <div className="flex items-start gap-2 p-4">
        <Link to={`/procedimento/${proc.c}`} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[13px] text-moss">{formatCode(proc.c)}</p>
              <h3 className="mt-1 text-[16px] leading-snug font-semibold">{proc.n}</h3>
              <p className="mt-1 text-sm text-mute">
                {maps?.grupo.get(proc.g)} · {maps?.subgrupo.get(`${proc.g}${proc.sg}`)}
              </p>
            </div>
            <div className="text-right">
              <p className="tabular text-lg font-semibold">{money(proc.tot)}</p>
              <p className="text-[11px] text-mute">SH {money(proc.sh)} · SA {money(proc.sa)} · SP {money(proc.sp)}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${COMPLEX_TONE[proc.cx]}`}>{cx}</span>
            <span className="rounded-full bg-neutral-bg px-2 py-0.5 text-[11px] font-semibold text-neutral">Sexo {proc.sx}</span>
            {rel.registros.map((r) => (
              <span key={r} className="rounded-full bg-leaf px-2 py-0.5 text-[11px] text-moss">
                {maps?.registro.get(r) ?? r}
              </span>
            ))}
          </div>
        </Link>
        <FavoriteButton code={proc.c} />
      </div>
    </article>
  );
}

export function CodeStamp({ code }: { code: string }) {
  return (
    <span className="font-mono rounded-md bg-moss px-2 py-0.5 text-[13px] tracking-wide text-white">
      {formatCode(code)}
    </span>
  );
}
