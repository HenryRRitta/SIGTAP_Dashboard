import { useState } from "react";
import { Link } from "react-router-dom";
import { formatCode } from "../lib/format";
import { patchFila, readFila, removeFila, type FilaStatus } from "../lib/local";
import { downloadCsv } from "../lib/workspace";

const STATUS: { id: FilaStatus | "todas"; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "analise", label: "Em análise" },
  { id: "diligenciar", label: "Diligenciar" },
  { id: "glosado", label: "Glosado" },
  { id: "deferido", label: "Deferido" },
];

const STATUS_LABEL: Record<FilaStatus, string> = {
  analise: "Em análise",
  diligenciar: "Diligenciar",
  glosado: "Glosado",
  deferido: "Deferido",
};

export function FilaPage() {
  const [filtro, setFiltro] = useState<FilaStatus | "todas">("todas");
  const [tick, setTick] = useState(0);
  const rows = readFila();
  const visiveis = filtro === "todas" ? rows : rows.filter((r) => r.status === filtro);

  function refresh() {
    setTick(tick + 1);
  }

  function exportar() {
    const mes = new Date().toISOString().slice(0, 7);
    downloadCsv(`fila-pareceres-${mes}.csv`, [
      ["data", "procedimento", "nome", "documento", "usuario", "cnes", "conclusao", "status", "glosas", "alertas", "achados"],
      ...visiveis.map((r) => [
        r.criadoEm.slice(0, 10),
        r.code,
        r.nome,
        r.documento,
        r.usuario,
        r.cnes,
        r.conclusao,
        r.status,
        r.fail,
        r.warn,
        r.detalhe,
      ]),
    ]);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="font-display text-4xl">Fila de pareceres</h2>
      <p className="mt-2 max-w-2xl text-mute">
        Contas em análise, glosadas ou deferidas. Fica neste navegador. Exporte o mês para o gestor.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS.map((s) => (
          <button
            key={s.id}
            onClick={() => setFiltro(s.id)}
            className={`rounded-full px-3 py-1 text-sm ${filtro === s.id ? "bg-moss text-white" : "border border-line bg-card"}`}
          >
            {s.label}
            {s.id !== "todas" ? ` (${rows.filter((r) => r.status === s.id).length})` : ` (${rows.length})`}
          </button>
        ))}
        <button className="rounded-full border border-line bg-card px-3 py-1 text-sm" onClick={exportar}>
          Exportar CSV do filtro
        </button>
      </div>
      {visiveis.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-line p-8 text-center text-mute">
          Fila vazia. Consista uma conta em Auditoria ou envie glosas a partir do lote.
        </p>
      )}
      <ul className="mt-6 space-y-3">
        {visiveis.map((r) => (
          <li key={r.id} className="rounded-xl border border-line bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-mute">{new Date(r.criadoEm).toLocaleString("pt-BR")}</p>
                <Link className="font-mono text-moss" to={`/procedimento/${r.code}`}>
                  {formatCode(r.code)}
                </Link>
                <p className="font-medium">{r.nome}</p>
                <p className="mt-1 text-sm text-mute">
                  {r.usuario || "usuário não informado"} · doc {r.documento || "—"} · CNES {r.cnes || "—"}
                </p>
                <p className="mt-1 text-sm">
                  {r.fail} glosa(s), {r.warn} alerta(s)
                  {r.detalhe ? ` · ${r.detalhe}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <select
                  className="field w-44"
                  value={r.status}
                  onChange={(e) => {
                    patchFila(r.id, { status: e.target.value as FilaStatus });
                    refresh();
                  }}
                >
                  {(Object.keys(STATUS_LABEL) as FilaStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 text-sm">
                  <Link className="text-moss" to={`/auditoria/${r.code}`}>
                    Reabrir
                  </Link>
                  <button
                    className="text-clay"
                    onClick={() => {
                      removeFila(r.id);
                      refresh();
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
