import { TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { excludenciasOf, formatCode } from "../lib/format";
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

export function ExcludenciaAlert({ proc }: { proc: Procedure }) {
  const n = excludenciasOf(proc).length;
  if (n === 0) return null;
  const rotulo =
    n === 1 ? "Há 1 excludência cadastrada" : `Há ${n} excludências cadastradas`;
  return (
    <span
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#f3c4c0] bg-danger-bg text-danger"
      title={rotulo}
      aria-label={rotulo}
    >
      <TriangleAlert size={16} aria-hidden="true" />
    </span>
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
