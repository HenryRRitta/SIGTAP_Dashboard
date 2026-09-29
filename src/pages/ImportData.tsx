import { useState } from "react";
import { Link } from "react-router-dom";
import { parseSigtapZip } from "../lib/parseZip";
import { compactInt } from "../lib/format";
import { useSigtap } from "../lib/store";
import { readProfile, saveProfile, type AuditorProfile } from "../lib/workspace";
import { pushSerie } from "../lib/local";

export function ImportPage() {
  const { data, replaceData } = useSigtap();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<AuditorProfile>(() => readProfile());

  async function onFile(file: File) {
    setBusy(true);
    try {
      const parsed = await parseSigtapZip(file, setStatus);
      replaceData(parsed);
      pushSerie({
        competencia: parsed.meta.competencia,
        label: parsed.meta.competenciaLabel,
        total: parsed.meta.totalProcedimentos,
        soma: parsed.meta.somaValoresReferencia,
      });
      setStatus(`Competência ${parsed.meta.competenciaLabel} carregada com ${parsed.meta.totalProcedimentos} procedimentos.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Falha ao importar o ZIP.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display text-4xl">Competência</h2>
      <p className="mt-2 text-mute">
        A mesa já vem com a Tabela Unificada <b>{data?.meta.competenciaLabel}</b> ({data?.meta.arquivo}). Para atualizar, baixe o ZIP mensal do DATASUS e importe aqui.
      </p>
      <section className="mt-6 rounded-xl border border-line bg-card p-5">
        <h3 className="font-display text-xl">Onde baixar</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            Página oficial:{" "}
            <a className="text-moss underline" href="http://tabela-unificada.datasus.gov.br/tabela-unificada/app/download.jsp" target="_blank" rel="noreferrer">
              tabela-unificada.datasus.gov.br — Download
            </a>
          </li>
          <li>
            Consulta da tabela:{" "}
            <a className="text-moss underline" href="http://sigtap.datasus.gov.br/tabela-unificada/app/sec/inicio.jsp" target="_blank" rel="noreferrer">
              sigtap.datasus.gov.br
            </a>
          </li>
          <li>
            FTP DATASUS:{" "}
            <a className="font-mono text-moss underline" href="ftp://ftp2.datasus.gov.br/pub/sistemas/tup/downloads/" target="_blank" rel="noreferrer">
              ftp2.datasus.gov.br/pub/sistemas/tup/downloads/
            </a>{" "}
            — arquivos <span className="font-mono">TabelaUnificada_AAAAMM_v….zip</span>
          </li>
        </ol>
        <p className="mt-3 text-sm text-mute">
          O ZIP contém os TXT de largura fixa e os layouts. O parser lê latin-1/Windows-1252, igual aos sistemas de faturamento.
        </p>
      </section>
      <label className="mt-6 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-moss/40 bg-leaf/40 px-6 py-10 text-center">
        <input
          type="file"
          accept=".zip"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
        <p className="font-medium text-moss">{busy ? "Importando…" : "Solte ou clique para enviar o ZIP da competência"}</p>
        <p className="mt-1 text-sm text-mute">{status || "Ex.: TabelaUnificada_202608_v2608141139.zip"}</p>
      </label>
      {data && (
        <dl className="mt-8 grid grid-cols-2 gap-3 text-sm">
          <Stat k="Procedimentos" v={compactInt(data.meta.totalProcedimentos)} />
          <Stat k="CIDs" v={compactInt(data.meta.totalCids)} />
          <Stat k="CBOs" v={compactInt(data.meta.totalCbos)} />
          <Stat k="Compatibilidades" v={compactInt(data.meta.totalCompat)} />
        </dl>
      )}
      <section className="mt-8 rounded-xl border border-line bg-card p-5">
        <h3 className="font-display text-xl">Identificação do auditor</h3>
        <p className="mt-1 text-sm text-mute">Vai no cabeçalho do parecer PDF. Fica só neste navegador.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block text-mute">Nome</span>
            <input className="field" value={profile.nome} onChange={(e) => setProfile({ ...profile, nome: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-mute">Órgão</span>
            <input className="field" value={profile.orgao} onChange={(e) => setProfile({ ...profile, orgao: e.target.value })} placeholder="SMS / SES / auditoria" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-mute">Cargo</span>
            <input className="field" value={profile.cargo} onChange={(e) => setProfile({ ...profile, cargo: e.target.value })} />
          </label>
        </div>
        <button
          className="mt-4 rounded-xl bg-moss px-4 py-2 text-sm text-white"
          onClick={() => {
            saveProfile(profile);
            setStatus("Identificação do auditor salva neste navegador.");
          }}
        >
          Salvar identificação
        </button>
      </section>
      <p className="mt-6 text-sm text-mute">
        CNES da rede, teto MAC, TUSS e notas técnicas ficam em{" "}
        <Link className="text-moss" to="/regras">
          Regras locais
        </Link>
        .
      </p>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-line bg-card px-4 py-3">
      <dt className="text-mute">{k}</dt>
      <dd className="tabular text-lg font-semibold">{v}</dd>
    </div>
  );
}
