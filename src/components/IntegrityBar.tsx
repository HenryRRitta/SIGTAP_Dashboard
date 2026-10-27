import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { compactInt } from "../lib/format";
import { useSigtap } from "../lib/store";

export function IntegrityBar() {
  const { data } = useSigtap();
  if (!data) return null;
  const quando = data.meta.importadoEm
    ? new Date(data.meta.importadoEm).toLocaleString("pt-BR")
    : "competência empacotada na mesa";

  return (
    <div className="exe-panel mt-3 flex flex-wrap items-center gap-3 px-4 py-3 text-success">
      <ShieldCheck size={20} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">Controle de integridade</p>
        <p className="text-xs text-mute">
          Competência {data.meta.competenciaLabel} · {data.meta.arquivo} · {quando} ·{" "}
          {compactInt(data.meta.totalProcedimentos)} procedimentos · fonte {data.meta.fonte}
        </p>
      </div>
      <Link to="/importar" className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">
        LOCAL / OFFLINE
      </Link>
    </div>
  );
}
