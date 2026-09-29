import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { COMPAT_LABEL, COMPAT_TONE, formatCode } from "../lib/format";
import { useSigtap } from "../lib/store";

export function CompatPage() {
  const { data, maps, search, byCode } = useSigtap();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const procA = byCode(a) ?? search(a)[0];
  const procB = byCode(b) ?? (b.trim() ? search(b)[0] : undefined);

  const rows = useMemo(() => {
    if (!procA?.rel) return [];
    let list = procA.rel.compat;
    if (procB) list = list.filter((r) => r.compativel === procB.c);
    return list;
  }, [procA, procB]);

  const reverse = useMemo(() => {
    if (!procA || !procB) return [];
    return (procB.rel?.compat ?? []).filter((r) => r.compativel === procA.c);
  }, [procA, procB]);

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="font-display text-4xl">Compatibilidades</h2>
      <p className="mt-2 max-w-2xl text-mute">
        Confira se um secundário, especial ou OPM pode ser cobrado junto do principal — e se a relação é compatível, excludente, concomitante, sequencial ou obrigatória.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm text-mute">Procedimento principal</p>
          <SearchBox value={a} onChange={setA} placeholder="Principal da AIH/APAC" />
        </div>
        <div>
          <p className="mb-2 text-sm text-mute">Procedimento a confrontar (opcional)</p>
          <SearchBox value={b} onChange={setB} placeholder="Secundário, especial ou OPM" />
        </div>
      </div>
      {procA && (
        <p className="mt-4 text-sm">
          Principal:{" "}
          <Link className="text-moss" to={`/procedimento/${procA.c}`}>
            {formatCode(procA.c)}
          </Link>{" "}
          {procA.n}
        </p>
      )}
      {procA && procB && rows.length === 0 && reverse.length === 0 && (
        <p className="mt-4 rounded-xl border border-warning-bg bg-warning-bg p-4 text-sm text-warning">
          Não há relação cadastrada entre {formatCode(procA.c)} e {formatCode(procB.c)}. Em AIH/APAC isso costuma significar cobrança indevida do par.
        </p>
      )}
      <div className="mt-6 overflow-auto rounded-xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist text-mute">
            <tr>
              <th className="px-3 py-2">Tipo</th>
              <th>Compatível</th>
              <th>Registro principal</th>
              <th>Registro compatível</th>
              <th>Qtd</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${COMPAT_TONE[row.tipo]}`}>
                    {COMPAT_LABEL[row.tipo] ?? row.tipo}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <Link className="text-moss" to={`/procedimento/${row.compativel}`}>
                    {formatCode(row.compativel)}
                  </Link>
                  <p className="text-mute">{data!.names[row.compativel]}</p>
                </td>
                <td>{maps?.registro.get(row.regP) ?? row.regP}</td>
                <td>{maps?.registro.get(row.regC) ?? row.regC}</td>
                <td>{row.qtd ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
