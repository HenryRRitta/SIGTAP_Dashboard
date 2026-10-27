import { TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { compatibilidadesOf, excludenciasOf, formatCode } from "../lib/format";
import { useSigtap } from "../lib/store";
import type { Procedure } from "../lib/types";
import { FavoriteButton } from "./FavoriteButton";

const MAX_VISIVEIS = 3;

export function FavoriteWithAlert({
  proc,
  label = false,
  className = "",
}: {
  proc: Procedure;
  label?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <ExcludenciaAlert proc={proc} />
      <FavoriteButton code={proc.c} label={label} />
    </div>
  );
}

export function ExcludenciaAlert({
  proc,
  compact = false,
}: {
  proc: Procedure;
  compact?: boolean;
}) {
  const n = excludenciasOf(proc).length;
  if (n === 0) return null;
  const rotulo =
    n === 1 ? "Há 1 excludência cadastrada" : `Há ${n} excludências cadastradas`;
  return (
    <span
      className={
        compact
          ? "inline-flex size-7 items-center justify-center rounded-lg border border-[#f3c4c0] bg-danger-bg text-danger"
          : "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#f3c4c0] bg-danger-bg text-danger"
      }
      title={rotulo}
      aria-label={rotulo}
    >
      <TriangleAlert size={compact ? 14 : 16} aria-hidden="true" />
    </span>
  );
}

export function CompatibilidadeLink({
  proc,
  compact = false,
}: {
  proc: Procedure;
  compact?: boolean;
}) {
  const n = compatibilidadesOf(proc).length;
  if (n === 0) return null;
  const rotulo =
    n === 1 ? "Há 1 compatibilidade cadastrada" : `Há ${n} compatibilidades cadastradas`;
  return (
    <Link
      to={`/procedimento/${proc.c}`}
      title={rotulo}
      aria-label={rotulo}
      onClick={(e) => e.stopPropagation()}
      className={
        compact
          ? "inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-[#b7e4c0] bg-success-bg px-1 text-[11px] font-semibold tabular text-success hover:border-success"
          : "inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-[#b7e4c0] bg-success-bg px-1.5 text-sm font-semibold tabular text-success hover:border-success"
      }
    >
      {n}
    </Link>
  );
}

export function RelacaoStatus({ proc }: { proc: Procedure }) {
  return (
    <div className="inline-flex items-center justify-center gap-1">
      <CompatibilidadeLink proc={proc} compact />
      <ExcludenciaAlert proc={proc} compact />
    </div>
  );
}

export function ExcludenciaStrip({
  proc,
  className = "",
}: {
  proc: Procedure;
  className?: string;
}) {
  const { data } = useSigtap();
  const rows = excludenciasOf(proc);
  if (rows.length === 0) return null;

  const visiveis = rows.slice(0, MAX_VISIVEIS);
  const resto = rows.length - visiveis.length;
  const kicker =
    rows.length === 1 ? "Não cobrar junto · 1 excludência" : `Não cobrar junto · ${rows.length} excludências`;

  return (
    <div className={`border-t border-[#f3c4c0] bg-danger-bg px-4 py-2.5 ${className}`} role="note">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#b42318] uppercase">
        <TriangleAlert size={13} aria-hidden="true" />
        {kicker}
      </p>
      <ul className="mt-1.5 space-y-1">
        {visiveis.map((row) => (
          <li key={row.compativel} className="text-[13px] leading-snug text-navy-950">
            <Link
              to={`/procedimento/${row.compativel}`}
              className="font-mono font-medium text-[#b42318] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {formatCode(row.compativel)}
            </Link>{" "}
            {data?.names[row.compativel] ?? ""}
          </li>
        ))}
      </ul>
      {resto > 0 ? (
        <p className="mt-1 text-[11px] font-medium text-[#b42318]">
          e mais {resto}
        </p>
      ) : null}
    </div>
  );
}
