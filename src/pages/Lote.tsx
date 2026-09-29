import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { consistirLote, MODELO_CSV, parseContas, type ResultadoLote } from "../lib/lote";
import { formatCode } from "../lib/format";
import { pushFila } from "../lib/local";
import { useSigtap } from "../lib/store";
import { downloadCsv } from "../lib/workspace";

type Filtro = "todas" | "glosas" | "alertas" | "ok" | "sem";

export function LotePage() {
  const { byCode } = useSigtap();
  const [texto, setTexto] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [erro, setErro] = useState("");
  const [resultados, setResultados] = useState<ResultadoLote[] | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [aberto, setAberto] = useState<number | null>(null);

  function processar(raw: string, arquivo = "") {
    setErro("");
    try {
      const contas = parseContas(raw);
      if (!contas.length) {
        setErro("Nenhuma conta encontrada. Use CSV com cabeçalho ou XML com um registro por conta.");
        setResultados(null);
        return;
      }
      setResultados(consistirLote(contas, byCode));
      setNomeArquivo(arquivo);
      setFiltro("todas");
      setAberto(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao ler o arquivo.");
      setResultados(null);
    }
  }

  const visiveis = useMemo(() => {
    if (!resultados) return [];
    if (filtro === "glosas") return resultados.filter((r) => r.fail > 0);
    if (filtro === "alertas") return resultados.filter((r) => r.fail === 0 && r.warn > 0);
    if (filtro === "ok") return resultados.filter((r) => r.fail === 0 && r.warn === 0);
    if (filtro === "sem") return resultados.filter((r) => !r.proc);
    return resultados;
  }, [resultados, filtro]);

  const resumo = useMemo(() => {
    if (!resultados) return null;
    return {
      n: resultados.length,
      glosas: resultados.filter((r) => r.fail > 0).length,
      alertas: resultados.filter((r) => r.fail === 0 && r.warn > 0).length,
      ok: resultados.filter((r) => r.fail === 0 && r.warn === 0).length,
    };
  }, [resultados]);

  function exportar() {
    if (!resultados) return;
    downloadCsv("mesa-sigtap-lote.csv", [
      ["linha", "procedimento", "nome", "documento", "usuario", "cnes", "sexo", "idade", "cid", "cbo", "registro", "qtd", "glosas", "alertas", "conclusao", "achados"],
      ...resultados.map((r) => [
        r.linha,
        r.procedimento,
        r.proc?.n ?? "",
        r.documento,
        r.usuario,
        r.cnes,
        r.sexo,
        r.idadeAnos,
        r.cid,
        r.cbo,
        r.registro,
        r.quantidade,
        r.fail,
        r.warn,
        r.conclusao,
        r.checks
          .filter((c) => c.status === "fail" || c.status === "warn")
          .map((c) => `${c.titulo}: ${c.detalhe}`)
          .join(" | "),
      ]),
    ]);
  }

  function enviarFila() {
    if (!resultados) return;
    const alvos = resultados.filter((r) => r.conclusao !== "conforme");
    for (const r of alvos) {
      pushFila({
        code: r.proc?.c ?? r.procedimento,
        nome: r.proc?.n ?? "Código inexistente",
        documento: r.documento,
        usuario: r.usuario,
        cnes: r.cnes,
        conclusao: r.conclusao,
        fail: r.fail,
        warn: r.warn,
        detalhe: r.checks
          .filter((c) => c.status === "fail")
          .map((c) => c.titulo)
          .join("; "),
      });
    }
    setErro(`${alvos.length} conta(s) enviadas à fila de pareceres.`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="no-print">
        <h2 className="font-display text-4xl">Consistência em lote</h2>
        <p className="mt-2 max-w-2xl text-mute">
          Importe um CSV ou XML de AIH, APAC ou BPA. Cada linha é consistida contra a competência carregada, o CNES local e o teto municipal.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-xl border border-line bg-card px-3 py-2 text-sm" onClick={() => processar(MODELO_CSV, "exemplo.csv")}>
            Carregar exemplo
          </button>
          <button
            className="rounded-xl border border-line bg-card px-3 py-2 text-sm"
            onClick={() => {
              downloadCsv(
                "modelo-lote-sigtap.csv",
                MODELO_CSV.trim()
                  .split("\n")
                  .map((line) => line.split(";")),
              );
            }}
          >
            Baixar modelo CSV
          </button>
          <Link className="rounded-xl border border-line bg-card px-3 py-2 text-sm" to="/regras">
            Cadastrar CNES e teto
          </Link>
        </div>
        <label className="mt-6 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-moss/40 bg-leaf/40 px-6 py-8 text-center">
          <input
            type="file"
            accept=".csv,.txt,.xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void file.text().then((t) => {
                setTexto(t);
                processar(t, file.name);
              });
            }}
          />
          <p className="font-medium text-moss">Solte ou clique para enviar CSV ou XML</p>
          <p className="mt-1 text-sm text-mute">Cabeçalhos reconhecidos: procedimento, sexo, idade_anos, cid, cbo, registro, quantidade, cnes…</p>
        </label>
        <textarea
          className="field mt-4 min-h-32 font-mono text-xs"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Cole aqui o CSV (ponto-e-vírgula ou vírgula) ou um XML simples."
        />
        <button className="mt-3 rounded-xl bg-moss px-4 py-2 text-sm text-white" onClick={() => processar(texto, nomeArquivo)}>
          Consistir lote
        </button>
        {erro && <p className="mt-3 text-sm text-clay">{erro}</p>}
      </div>

      {resumo && resultados && (
        <>
          <section className="mt-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-moss">
              Mapa de glosas {nomeArquivo ? `· ${nomeArquivo}` : ""} · {resumo.n} contas
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3 no-print">
              <Kpi n={resumo.glosas} l="com glosa" className="bg-danger-bg text-danger" />
              <Kpi n={resumo.alertas} l="só alerta" className="bg-warning-bg text-warning" />
              <Kpi n={resumo.ok} l="conforme" className="bg-success-bg text-success" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 no-print">
              {(["todas", "glosas", "alertas", "ok", "sem"] as Filtro[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`rounded-full px-3 py-1 text-sm ${filtro === f ? "bg-moss text-white" : "border border-line bg-card"}`}
                >
                  {f === "todas" ? "Todas" : f === "glosas" ? "Glosas" : f === "alertas" ? "Alertas" : f === "ok" ? "Conformes" : "Sem código"}
                </button>
              ))}
              <button className="rounded-full border border-line bg-card px-3 py-1 text-sm" onClick={exportar}>
                Exportar CSV
              </button>
              <button className="rounded-full border border-line bg-card px-3 py-1 text-sm" onClick={enviarFila}>
                Enviar glosas à fila
              </button>
              <button className="rounded-full border border-line bg-card px-3 py-1 text-sm" onClick={() => window.print()}>
                PDF do mapa
              </button>
            </div>
          </section>
          <div className="mt-4 overflow-auto rounded-xl border border-line bg-card print-sheet">
            <table className="w-full text-left text-sm">
              <thead className="bg-mist text-mute">
                <tr>
                  <th className="px-3 py-2">Linha</th>
                  <th>Procedimento</th>
                  <th>Documento</th>
                  <th>Usuário</th>
                  <th>Glosas</th>
                  <th>Conclusão</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((r) => (
                  <tr
                    key={r.linha}
                    className={`border-t border-line align-top ${r.fail ? "bg-danger-bg" : r.warn ? "bg-warning-bg" : ""}`}
                  >
                    <td className="px-3 py-2 tabular">{r.linha}</td>
                    <td className="py-2">
                      {r.proc ? (
                        <Link className="font-mono text-moss" to={`/procedimento/${r.proc.c}`}>
                          {formatCode(r.proc.c)}
                        </Link>
                      ) : (
                        <span className="font-mono">{r.procedimento || "—"}</span>
                      )}
                      <p className="max-w-sm text-xs text-mute">{r.proc?.n ?? "inexistente nesta competência"}</p>
                      {aberto === r.linha && (
                        <ul className="mt-2 space-y-1 text-xs">
                          {r.checks.map((c) => (
                            <li key={c.id}>
                              <b>{c.titulo}.</b> {c.detalhe}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-1 flex gap-2 no-print">
                        <button className="text-xs text-moss" onClick={() => setAberto(aberto === r.linha ? null : r.linha)}>
                          {aberto === r.linha ? "Ocultar achados" : "Ver achados"}
                        </button>
                        {r.proc && (
                          <Link className="text-xs text-moss" to={`/auditoria/${r.proc.c}`}>
                            Abrir na mesa
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="py-2">{r.documento || "—"}</td>
                    <td className="py-2">{r.usuario || "—"}</td>
                    <td className="py-2 tabular">
                      {r.fail} / {r.warn}
                    </td>
                    <td className="py-2 font-medium">{r.conclusao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ n, l, className }: { n: number; l: string; className: string }) {
  return (
    <div className={`rounded-xl border border-line p-4 ${className}`}>
      <p className="tabular text-2xl font-semibold">{n}</p>
      <p className="text-xs text-mute">{l}</p>
    </div>
  );
}
