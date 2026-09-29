import { useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { ProcedureCard } from "../components/ProcedureCard";
import { auditScore, runAudit, runLocalChecks } from "../lib/audit";
import { formatCode } from "../lib/format";
import { parecerAutomatico } from "../lib/glosa";
import { findCnes, findTeto, pushFila } from "../lib/local";
import { useSigtap } from "../lib/store";
import type { AuditInput } from "../lib/types";
import { openPrint, readProfile, stashPrint } from "../lib/workspace";

const empty: AuditInput = {
  sexo: "",
  idadeAnos: "",
  idadeMeses: "",
  cid: "",
  cbo: "",
  registro: "",
  quantidade: "",
};

export function AuditPage() {
  const { code = "" } = useParams();
  const { data, maps, byCode, search } = useSigtap();
  const [q, setQ] = useState(code);
  const [input, setInput] = useState<AuditInput>(empty);
  const [usuario, setUsuario] = useState("");
  const [cns, setCns] = useState("");
  const [estabelecimento, setEstabelecimento] = useState("");
  const [cnes, setCnes] = useState("");
  const [documento, setDocumento] = useState("");
  const [competenciaProducao, setCompetenciaProducao] = useState(data?.meta.competenciaLabel ?? "");
  const [observacao, setObservacao] = useState("");
  const [msg, setMsg] = useState("");
  const hits = useMemo(() => (q.trim() ? search(q).slice(0, 8) : []), [q, search]);
  const proc = byCode(q) ?? hits[0];
  const estab = cnes ? findCnes(cnes) : undefined;
  const teto = proc ? findTeto(proc.c) : undefined;
  const checks = useMemo(() => {
    if (!proc) return [];
    return [
      ...runAudit(proc, input),
      ...runLocalChecks(proc, {
        cnes,
        estabelecimento: estab ?? null,
        teto,
        quantidade: input.quantidade,
      }),
    ];
  }, [proc, input, cnes, estab, teto]);
  const score = auditScore(checks);
  const auto = parecerAutomatico(checks);
  const [conclusao, setConclusao] = useState<"conforme" | "glosar" | "diligenciar">(auto);
  const profile = readProfile();

  function salvarFila() {
    if (!proc) return;
    pushFila({
      code: proc.c,
      nome: proc.n,
      documento,
      usuario,
      cnes,
      conclusao,
      fail: score.fail,
      warn: score.warn,
      detalhe: checks
        .filter((c) => c.status === "fail")
        .map((c) => c.titulo)
        .join("; "),
    });
    setMsg("Conta enviada à fila de pareceres.");
  }

  function exportar() {
    if (!proc) return;
    stashPrint({
      code: proc.c,
      input,
      checks,
      conclusao,
      observacao,
      usuario,
      cns,
      estabelecimento,
      cnes,
      documento,
      competenciaProducao,
    });
    openPrint(`/print/parecer/${proc.c}`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="font-display text-4xl">Mesa de consistência</h2>
      <p className="mt-2 max-w-2xl text-mute">
        Monte a conta, aplique as regras da tabela e emita o parecer em PDF. O sistema sugere a conclusão; o auditor decide.
      </p>
      <div className="mt-6">
        <SearchBox value={q} onChange={setQ} placeholder="Procedimento da conta" />
      </div>
      {proc && (
        <div className="mt-4">
          <ProcedureCard proc={proc} />
        </div>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-xl border border-line bg-card p-4">
          <h3 className="font-display text-xl">Dados da conta</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Sexo">
              <select className="field" value={input.sexo} onChange={(e) => setInput({ ...input, sexo: e.target.value as AuditInput["sexo"] })}>
                <option value="">Não informado</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </Field>
            <Field label="Idade (anos)">
              <input className="field" value={input.idadeAnos} onChange={(e) => setInput({ ...input, idadeAnos: e.target.value })} />
            </Field>
            <Field label="CID-10">
              <input className="field" value={input.cid} onChange={(e) => setInput({ ...input, cid: e.target.value })} placeholder="Ex.: O820" />
            </Field>
            <Field label="CBO do executante">
              <input className="field" value={input.cbo} onChange={(e) => setInput({ ...input, cbo: e.target.value })} placeholder="Ex.: 225125" />
            </Field>
            <Field label="Instrumento de registro">
              <select className="field" value={input.registro} onChange={(e) => setInput({ ...input, registro: e.target.value })}>
                <option value="">Não informado</option>
                {data!.lookups.registros.map((r) => (
                  <option key={r.c} value={r.c}>
                    {r.c} · {r.n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quantidade">
              <input className="field" value={input.quantidade} onChange={(e) => setInput({ ...input, quantidade: e.target.value })} />
            </Field>
            <Field label="Usuário">
              <input className="field" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
            </Field>
            <Field label="CNS / CPF">
              <input className="field" value={cns} onChange={(e) => setCns(e.target.value)} />
            </Field>
            <Field label="Estabelecimento">
              <input className="field" value={estabelecimento} onChange={(e) => setEstabelecimento(e.target.value)} />
            </Field>
            <Field label="CNES">
              <input className="field" value={cnes} onChange={(e) => setCnes(e.target.value)} />
            </Field>
            <Field label="AIH / APAC / BPA">
              <input className="field" value={documento} onChange={(e) => setDocumento(e.target.value)} />
            </Field>
            <Field label="Competência da produção">
              <input className="field" value={competenciaProducao} onChange={(e) => setCompetenciaProducao(e.target.value)} />
            </Field>
          </div>
          <Field label="Observação do parecer">
            <textarea className="field mt-3 min-h-24" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          </Field>
        </section>
        <section className="rounded-xl border border-line bg-card p-4">
          <h3 className="font-display text-xl">Resultado e parecer</h3>
          {!proc && <p className="mt-3 text-mute">Selecione um procedimento para consistir a conta.</p>}
          {proc && (
            <>
              <p className="mt-2 text-sm">
                {formatCode(proc.c)} · {maps?.grupo.get(proc.g)}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Score n={score.fail} label="glosas" className="bg-danger-bg text-danger" />
                <Score n={score.warn} label="alertas" className="bg-warning-bg text-warning" />
                <Score n={score.ok} label="ok" className="bg-success-bg text-success" />
              </div>
              <label className="mt-4 block text-sm">
                <span className="mb-1 block text-mute">Conclusão do auditor</span>
                <select className="field" value={conclusao} onChange={(e) => setConclusao(e.target.value as typeof conclusao)}>
                  <option value="conforme">Produção conforme</option>
                  <option value="diligenciar">Diligenciar / complementar</option>
                  <option value="glosar">Glosar</option>
                </select>
                <p className="mt-1 text-xs text-mute">Sugestão automática: {auto}.</p>
              </label>
              <ul className="mt-4 space-y-2">
                {checks.map((c) => (
                  <li key={c.id} className={`rounded-xl px-3 py-2 text-sm ${c.status === "fail" ? "bg-danger-bg text-danger" : c.status === "warn" ? "bg-warning-bg text-warning" : c.status === "ok" ? "bg-success-bg text-success" : "bg-neutral-bg text-neutral"}`}>
                    <b>{c.titulo}.</b> {c.detalhe}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="inline-flex min-h-10 items-center rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-moss-2" onClick={exportar}>
                  Exportar parecer PDF
                </button>
                <button className="inline-flex min-h-10 items-center rounded-lg border border-control px-4 py-2 text-sm" onClick={salvarFila}>
                  Salvar na fila
                </button>
                <Link className="inline-flex min-h-10 items-center rounded-lg border border-control px-4 py-2 text-sm" to={`/glosas/${proc.c}`}>
                  Checklist de glosa
                </Link>
                <Link className="inline-flex min-h-10 items-center rounded-lg border border-control px-4 py-2 text-sm" to={`/procedimento/${proc.c}`}>
                  Ficha completa
                </Link>
              </div>
              {msg && <p className="mt-3 text-sm text-moss">{msg}</p>}
              {!profile.nome && (
                <p className="mt-3 text-xs text-mute">
                  Cadastre nome e órgão em <Link className="text-moss" to="/importar">Competência</Link> para o cabeçalho do PDF.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-mute">{label}</span>
      {children}
    </label>
  );
}

function Score({ n, label, className }: { n: number; label: string; className: string }) {
  return (
    <div className={`rounded-xl py-3 ${className}`}>
      <p className="tabular text-2xl font-semibold">{n}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
