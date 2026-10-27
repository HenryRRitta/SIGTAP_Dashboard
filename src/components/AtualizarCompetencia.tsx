import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { atualizarCompetencia, verificarCompetencia, type CompetenciaRemota } from "../lib/competenciaApi";
import { pushSerie } from "../lib/local";
import { useSigtap } from "../lib/store";
import type { SigtapData } from "../lib/types";

export function AtualizarCompetencia({ compact = false }: { compact?: boolean }) {
  const { data, replaceData } = useSigtap();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [latest, setLatest] = useState<CompetenciaRemota | null>(null);
  const [temNova, setTemNova] = useState(false);
  const [erro, setErro] = useState("");

  const atual = { competencia: data?.meta.competencia, arquivo: data?.meta.arquivo };

  useEffect(() => {
    let cancel = false;
    verificarCompetencia(atual)
      .then((res) => {
        if (cancel) return;
        setLatest(res.latest);
        setTemNova(res.temNova);
        if (res.erro) setErro(res.erro);
      })
      .catch((err: unknown) => {
        if (!cancel) setErro(err instanceof Error ? err.message : "Não foi possível consultar o DATASUS.");
      });
    return () => {
      cancel = true;
    };
  }, [atual.competencia, atual.arquivo]);

  async function atualizar() {
    setBusy(true);
    setErro("");
    setStatus("Consultando o RSS oficial do DATASUS…");
    try {
      setStatus("Baixando o ZIP da competência no FTP e convertendo a tabela…");
      const result = await atualizarCompetencia(atual);
      if (result.unchanged) {
        setTemNova(false);
        setStatus(`Já está na competência ${result.meta?.competenciaLabel ?? data?.meta.competenciaLabel}.`);
        return;
      }
      setStatus("Aplicando a nova tabela na mesa…");
      const res = await fetch(`/data/sigtap.json?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("O ZIP foi gravado, mas a mesa não conseguiu reler o JSON.");
      const parsed = (await res.json()) as SigtapData;
      replaceData(parsed);
      pushSerie({
        competencia: parsed.meta.competencia,
        label: parsed.meta.competenciaLabel,
        total: parsed.meta.totalProcedimentos,
        soma: parsed.meta.somaValoresReferencia,
      });
      setTemNova(false);
      setLatest({
        competencia: parsed.meta.competencia,
        label: parsed.meta.competenciaLabel,
        arquivo: parsed.meta.arquivo,
        url: parsed.meta.origemUrl ?? "",
        pubDate: parsed.meta.importadoEm ?? "",
      });
      setStatus(
        `Competência ${parsed.meta.competenciaLabel} ativa · ${parsed.meta.totalProcedimentos.toLocaleString("pt-BR")} procedimentos · ${parsed.meta.arquivo}`,
      );
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao atualizar a competência.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void atualizar()}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-moss px-3 py-2 text-sm font-medium text-white hover:bg-moss-2 disabled:opacity-60"
        >
          <RefreshCw size={16} className={busy ? "animate-spin" : ""} aria-hidden="true" />
          Atualizar a competência
        </button>
        {temNova && latest && (
          <p className="text-xs text-sidebar-muted">{latest.label} no DATASUS</p>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-xl border-2 border-moss/25 bg-leaf p-5 shadow-card">
      <p className="font-mono text-[12px] tracking-[0.16em] text-moss uppercase">DATASUS · automático</p>
      <h3 className="font-display mt-1 text-2xl">Atualizar a competência</h3>
      <p className="mt-2 text-sm text-mute">
        Um clique consulta o RSS oficial, baixa o ZIP no FTP do DATASUS, grava em <span className="font-mono">public/data</span> e
        atualiza a mesa. A tabela também fica neste navegador, então sobrevive ao F5.
      </p>
      {temNova && latest && (
        <p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-moss">
          Nova competência no DATASUS: {latest.label} ({latest.arquivo}).
        </p>
      )}
      {!temNova && latest && !busy && !status && (
        <p className="mt-3 text-sm text-mute">
          Última no DATASUS: {latest.label}. A mesa está em {data?.meta.competenciaLabel}.
        </p>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => void atualizar()}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-moss px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-2 disabled:opacity-60"
      >
        <RefreshCw size={16} className={busy ? "animate-spin" : ""} aria-hidden="true" />
        {busy ? "Atualizando…" : "Atualizar a competência"}
      </button>
      {status && <p className="mt-3 text-sm text-moss">{status}</p>}
      {erro && <p className="mt-3 text-sm text-danger">{erro}</p>}
    </section>
  );
}
