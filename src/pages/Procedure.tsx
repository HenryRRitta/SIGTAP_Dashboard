import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Bookmark, ClipboardCheck, Copy, FileDown, GitCompare } from "lucide-react";
import { BackLink } from "../components/BackLink";
import { auditScore, runAudit } from "../lib/audit";
import { COMPAT_LABEL, COMPLEX_TONE, formatCode, money, relOf } from "../lib/format";
import { checklistGlosa, familiaDaConta } from "../lib/glosa";
import { useSigtap } from "../lib/store";
import type { AuditInput } from "../lib/types";
import { copyText, fichaResumo, openPrint, readNotes, saveNote } from "../lib/workspace";
import { notaDe, tussOfSigtap } from "../lib/local";

const TABS = [
  "Visão",
  "Consistências",
  "Glosas",
  "CID",
  "CBO",
  "Compatibilidades",
  "CNES",
  "Regras",
  "Origem",
] as const;

export function ProcedurePage() {
  const { code = "" } = useParams();
  const { data, maps, byCode, pin, pinned, remember } = useSigtap();
  const proc = byCode(code);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Visão");

  useEffect(() => {
    if (proc) remember(proc.c);
  }, [proc, remember]);

  if (!proc || !maps || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        <BackLink to="/catalogo">Voltar ao catálogo</BackLink>
        <p className="mt-4 text-mute">Procedimento {formatCode(code)} não encontrado nesta competência.</p>
      </div>
    );
  }

  const rel = relOf(proc);
  const isPinned = pinned.includes(proc.c);

  return (
    <div className="mx-auto max-w-6xl">
      <BackLink to={`/catalogo?grupo=${proc.g}&sub=${proc.sg}&forma=${proc.fo}`}>Voltar ao catálogo</BackLink>
      <p className="mt-3 font-mono text-[12px] text-moss">
        <Link className="hover:underline" to={`/catalogo?grupo=${proc.g}`}>
          {proc.g} {maps.grupo.get(proc.g)}
        </Link>
        {" · "}
        <Link className="hover:underline" to={`/catalogo?grupo=${proc.g}&sub=${proc.sg}`}>
          {proc.sg} {maps.subgrupo.get(`${proc.g}${proc.sg}`)}
        </Link>
        {" · "}
        <Link className="hover:underline" to={`/catalogo?grupo=${proc.g}&sub=${proc.sg}&forma=${proc.fo}`}>
          {proc.fo} {maps.forma.get(`${proc.g}${proc.sg}${proc.fo}`)}
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-lg text-moss">{formatCode(proc.c)}</p>
          <h2 className="font-display mt-1 max-w-3xl text-3xl md:text-4xl">{proc.n}</h2>
          {notaDe(proc.c) && <p className="mt-2 max-w-3xl text-sm text-moss">{notaDe(proc.c)}</p>}
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <button
            onClick={() => pin(proc.c)}
            className={`rounded-xl border px-3 py-2 text-sm ${isPinned ? "border-moss bg-leaf text-moss" : "border-line bg-card"}`}
          >
            <Bookmark size={15} className="mr-1 inline" />
            {isPinned ? "Fixado" : "Fixar"}
          </button>
          <Link to={`/auditoria/${proc.c}`} className="rounded-xl bg-moss px-3 py-2 text-sm text-white">
            <ClipboardCheck size={15} className="mr-1 inline" />
            Simular conta
          </Link>
          <Link to={`/glosas/${proc.c}`} className="rounded-xl border border-line bg-card px-3 py-2 text-sm">
            Checklist de glosa
          </Link>
          <Link to={`/comparar?a=${proc.c}`} className="rounded-xl border border-line bg-card px-3 py-2 text-sm">
            <GitCompare size={15} className="mr-1 inline" />
            Comparar
          </Link>
          <button
            onClick={() => openPrint(`/print/ficha/${proc.c}`)}
            className="rounded-xl border border-line bg-card px-3 py-2 text-sm"
          >
            <FileDown size={15} className="mr-1 inline" />
            PDF da ficha
          </button>
          <button
            onClick={() => void copyText(fichaResumo(proc, data.meta.competenciaLabel))}
            className="rounded-xl border border-line bg-card px-3 py-2 text-sm"
          >
            <Copy size={15} className="mr-1 inline" />
            Copiar resumo
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Valor label="Total de referência" value={money(proc.tot)} />
        <Valor label="Serviço hospitalar" value={money(proc.sh)} />
        <Valor label="Serviço ambulatorial" value={money(proc.sa)} />
        <Valor label="Serviço profissional" value={money(proc.sp)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${COMPLEX_TONE[proc.cx]}`}>
          {data.lookups.complexidade[proc.cx]}
        </span>
        <span className="rounded-full bg-neutral-bg px-2.5 py-1 text-xs text-neutral">Sexo {data.lookups.sexo[proc.sx]}</span>
        <span className="rounded-full bg-neutral-bg px-2.5 py-1 text-xs text-neutral">{maps.financiamento.get(proc.fin) ?? proc.fin}</span>
        {rel.modalidades.map((m) => (
          <span key={m} className="rounded-full bg-leaf px-2.5 py-1 text-xs text-moss">
            {maps.modalidade.get(m) ?? m}
          </span>
        ))}
        {rel.registros.map((r) => (
            <span key={r} className="rounded-full bg-warning-bg px-2.5 py-1 text-xs text-warning">
            {maps.registro.get(r) ?? r}
          </span>
        ))}
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`shrink-0 px-3 py-2 text-sm ${tab === item ? "border-b-2 border-moss font-semibold text-moss" : "text-mute"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="mt-6">
        {tab === "Visão" && <Visao />}
        {tab === "Consistências" && <Consistencias />}
        {tab === "Glosas" && <GlosasTab />}
        {tab === "CID" && <CidTab />}
        {tab === "CBO" && <CboTab />}
        {tab === "Compatibilidades" && <CompatTab />}
        {tab === "CNES" && <CnesTab />}
        {tab === "Regras" && <RegrasTab />}
        {tab === "Origem" && <OrigemTab />}
      </section>
    </div>
  );

  function Visao() {
    if (!proc || !maps || !data) return null;
    const rel = relOf(proc);
    return (
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Box title="Descrição / orientação de uso">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
              {proc.d || "Este procedimento não possui texto descritivo na competência carregada."}
            </p>
          </Box>
          <Box title="Atributos gerais">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Item k="Quantidade máxima" v={proc.qmax?.toString() ?? "Não se aplica"} />
              <Item k="Média de permanência" v={proc.perm ? `${proc.perm} dia(s)` : "Não se aplica"} />
              <Item k="Tempo de permanência" v={proc.tperm ? `${proc.tperm} dia(s)` : "Não se aplica"} />
              <Item k="Pontos (SP)" v={proc.pts?.toString() ?? "Não se aplica"} />
              <Item k="Idade mínima" v={proc.iminL ?? "Não se aplica"} />
              <Item k="Idade máxima" v={proc.imaxL ?? "Não se aplica"} />
              <Item k="Financiamento" v={maps.financiamento.get(proc.fin) ?? "—"} />
              <Item k="Subtipo / rubrica" v={proc.rub ? maps.rubrica.get(proc.rub) ?? proc.rub : "—"} />
            </dl>
          </Box>
        </div>
        <div className="space-y-4">
          <Box title="O que o auditor olha primeiro">
            <ul className="space-y-2 text-sm">
              <li>Instrumento: {rel.registros.map((r) => maps.registro.get(r) ?? r).join("; ") || "não informado"}</li>
              <li>CID principal: {rel.cidsP.length} · secundário: {rel.cidsS.length}</li>
              <li>CBO: {rel.cbos.length} ocupações</li>
              <li>Habilitações CNES: {rel.habilitacoes.length}</li>
              <li>Compatibilidades: {rel.compat.length}</li>
              <li>Atributos complementares: {rel.detalhes.length}</li>
            </ul>
          </Box>
          <Box title="Atributos complementares">
            {rel.detalhes.length === 0 ? (
              <p className="text-sm text-mute">Nenhum atributo complementar.</p>
            ) : (
              <ul className="space-y-2">
                {rel.detalhes.map((d) => (
                  <li key={d} className="text-sm">
                    <span className="font-mono text-moss">{d}</span> {maps.detalhe.get(d)?.n}
                  </li>
                ))}
              </ul>
            )}
          </Box>
        </div>
      </div>
    );
  }

  function Consistencias() {
    if (!proc || !maps || !data) return null;
    const rel = relOf(proc);
    return (
      <div className="space-y-4">
        <Box title="Regras de consistência desta ficha">
          <div className="grid gap-3 md:grid-cols-2">
            {rel.detalhes.map((d) => {
              const info = maps.detalhe.get(d);
              return (
                <article key={d} className="rounded-xl border border-line bg-paper p-3">
                  <p className="font-mono text-xs text-moss">{d}</p>
                  <p className="font-medium">{info?.n}</p>
                  {info?.d && <p className="mt-1 text-sm leading-relaxed text-mute">{info.d}</p>}
                </article>
              );
            })}
          </div>
        </Box>
        <MiniAudit code={proc.c} />
      </div>
    );
  }

  function GlosasTab() {
    if (!proc || !maps || !data) return null;
    const rel = relOf(proc);
    const items = checklistGlosa(proc);
    const familia = familiaDaConta(rel.registros);
    return (
      <div className="space-y-3">
        <p className="text-sm text-mute">
          Família {familia} · {items.length} pontos. PDF em{" "}
          <button className="text-moss underline" onClick={() => openPrint(`/print/ficha/${proc.c}`)}>
            ficha completa
          </button>
          .
        </p>
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-line bg-card p-4">
            <p className="text-[11px] uppercase tracking-wide text-mute">{item.gravidade} · {item.fundamento}</p>
            <p className="font-semibold">{item.titulo}</p>
            <p className="mt-1 text-sm">{item.texto}</p>
          </article>
        ))}
        <NotesBox code={proc.c} />
      </div>
    );
  }

  function CidTab() {
    if (!proc || !maps || !data) return null;
    const rel = relOf(proc);
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <CidList titulo="CID principal" codes={rel.cidsP} />
        <CidList titulo="CID secundário" codes={rel.cidsS} />
      </div>
    );
  }

  function CidList({ titulo, codes }: { titulo: string; codes: string[] }) {
    if (!data) return null;
    return (
      <Box title={`${titulo} (${codes.length})`}>
        {codes.length === 0 ? (
          <p className="text-sm text-mute">Nenhum CID neste papel.</p>
        ) : (
          <ul className="max-h-[480px] space-y-1 overflow-auto text-sm">
            {codes.map((cid) => (
              <li key={cid} className="flex gap-2 border-b border-line/60 py-1.5">
                <Link className="font-mono text-moss" to={`/cid?q=${cid}`}>
                  {cid}
                </Link>
                <span>{data.cids[cid]?.n ?? "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </Box>
    );
  }

  function CboTab() {
    if (!proc || !maps || !data) return null;
    const rel = relOf(proc);
    return (
      <Box title={`Ocupações autorizadas (${rel.cbos.length})`}>
        {rel.cbos.length === 0 ? (
          <p className="text-sm text-mute">Sem CBO vinculado. Verifique o atributo 021 (não exige CBO).</p>
        ) : (
          <ul className="max-h-[560px] space-y-1 overflow-auto text-sm">
            {rel.cbos.map((cbo) => (
              <li key={cbo} className="flex gap-2 border-b border-line/60 py-1.5">
                <Link className="font-mono text-moss" to={`/cid?q=${cbo}`}>
                  {cbo}
                </Link>
                <span>{data.cbos[cbo] ?? "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </Box>
    );
  }

  function CompatTab() {
    if (!proc || !maps || !data) return null;
    const rel = relOf(proc);
    const grouped = new Map<string, typeof rel.compat>();
    for (const row of rel.compat) {
      const list = grouped.get(row.tipo) ?? [];
      list.push(row);
      grouped.set(row.tipo, list);
    }
    return (
      <div className="space-y-4">
        {rel.compat.length === 0 && <p className="text-mute">Sem compatibilidades cadastradas.</p>}
        {[...grouped.entries()].map(([tipo, rows]) => (
          <Box key={tipo} title={`${COMPAT_LABEL[tipo] ?? tipo} (${rows.length})`}>
            <div className="overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-mute">
                  <tr>
                    <th className="py-1">Compatível</th>
                    <th>Registro princ.</th>
                    <th>Registro compat.</th>
                    <th>Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="py-1.5">
                        <Link className="text-moss" to={`/procedimento/${row.compativel}`}>
                          {formatCode(row.compativel)}
                        </Link>
                        <p className="text-mute">{data.names[row.compativel]}</p>
                      </td>
                      <td>{maps.registro.get(row.regP) ?? row.regP}</td>
                      <td>{maps.registro.get(row.regC) ?? row.regC}</td>
                      <td>{row.qtd ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Box>
        ))}
        {rel.excecoes.length > 0 && (
          <Box title={`Exceções (${rel.excecoes.length})`}>
            <ul className="space-y-2 text-sm">
              {rel.excecoes.map((e, i) => (
                <li key={i}>
                  Restrição {formatCode(e.restricao)} · {formatCode(e.compativel)} · {COMPAT_LABEL[e.tipo] ?? e.tipo}
                </li>
              ))}
            </ul>
          </Box>
        )}
      </div>
    );
  }

  function CnesTab() {
    if (!proc || !maps || !data) return null;
    const rel = relOf(proc);
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Box title={`Habilitações (${rel.habilitacoes.length})`}>
          <ul className="space-y-2 text-sm">
            {rel.habilitacoes.map((h, i) => (
              <li key={i}>
                <span className="font-mono text-moss">{h.cod}</span> {maps.habilitacao.get(h.cod)}
                {h.grupo ? <span className="text-mute"> · grupo {h.grupo}</span> : null}
              </li>
            ))}
            {rel.habilitacoes.length === 0 && <li className="text-mute">Sem exigência de habilitação.</li>}
          </ul>
        </Box>
        <Box title={`Leitos (${rel.leitos.length})`}>
          <ul className="space-y-2 text-sm">
            {rel.leitos.map((l) => (
              <li key={l}>
                <span className="font-mono text-moss">{l}</span> {maps.leito.get(l)}
              </li>
            ))}
            {rel.leitos.length === 0 && <li className="text-mute">Sem tipo de leito vinculado.</li>}
          </ul>
        </Box>
        <Box title={`Serviço / classificação (${rel.servicos.length})`}>
          <ul className="space-y-2 text-sm">
            {rel.servicos.map((s, i) => (
              <li key={i}>
                {maps.servico.get(s.servico)} · {maps.classif.get(`${s.servico}-${s.classificacao}`) ?? s.classificacao}
              </li>
            ))}
            {rel.servicos.length === 0 && <li className="text-mute">Sem serviço/classificação obrigatório.</li>}
          </ul>
        </Box>
        <Box title={`Incrementos por habilitação (${rel.incrementos.length})`}>
          {rel.incrementos.length === 0 ? (
            <p className="text-sm text-mute">Sem incremento percentual.</p>
          ) : (
            <IncrementCalc
              sh={proc.sh}
              sa={proc.sa}
              sp={proc.sp}
              incrementos={rel.incrementos}
              nomeHab={(c) => maps.habilitacao.get(c) ?? c}
            />
          )}
        </Box>
      </div>
    );
  }

  function RegrasTab() {
    if (!proc || !maps || !data) return null;
    const rel = relOf(proc);
    return (
      <div className="space-y-4">
        <Box title="Regras condicionadas">
          {rel.regras.length === 0 ? (
            <p className="text-sm text-mute">Sem regra condicionada.</p>
          ) : (
            rel.regras.map((c) => {
              const r = maps.regra.get(c);
              return (
                <article key={c} className="mb-3">
                  <p className="font-mono text-xs text-moss">{c}</p>
                  <p className="font-medium">{r?.n}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-mute">{r?.d}</p>
                </article>
              );
            })
          )}
        </Box>
        <Box title="RENASES">
          <ul className="text-sm">
            {rel.renases.map((c) => (
              <li key={c}>
                {c} · {maps.renases.get(c)}
              </li>
            ))}
            {rel.renases.length === 0 && <li className="text-mute">Sem vínculo RENASES.</li>}
          </ul>
        </Box>
        <Box title="Componente de rede">
          <ul className="text-sm">
            {rel.redes.map((c) => (
              <li key={c}>
                {c} · {maps.componente.get(c)}
              </li>
            ))}
            {rel.redes.length === 0 && <li className="text-mute">Sem componente de rede.</li>}
          </ul>
        </Box>
      </div>
    );
  }

  function OrigemTab() {
    if (!proc || !maps || !data) return null;
    const rel = relOf(proc);
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Box title="Origem SIGTAP">
          <ul className="text-sm">
            {rel.origem.map((c) => (
              <li key={c}>
                <Link className="text-moss" to={`/procedimento/${c}`}>
                  {formatCode(c)}
                </Link>{" "}
                {data.names[c]}
              </li>
            ))}
            {rel.origem.length === 0 && <li className="text-mute">Sem código de origem.</li>}
          </ul>
        </Box>
        <Box title="Origem SIA / SIH">
          <ul className="text-sm">
            {rel.siaSih.map((s, i) => (
              <li key={i}>
                {s.cod} {data.siaSih[s.cod]?.n} {s.tipo ? `(${s.tipo})` : ""}
              </li>
            ))}
            {rel.siaSih.length === 0 && <li className="text-mute">Sem origem SIA/SIH.</li>}
          </ul>
        </Box>
        <Box title="TUSS">
          <ul className="text-sm">
            {rel.tuss.map((c) => (
              <li key={c}>
                {c} · {data.tuss[c]}
              </li>
            ))}
            {tussOfSigtap(proc.c).map((t) => (
              <li key={`local-${t.tuss}`}>
                {t.tuss} · {t.nome || "relação local ANS"}
              </li>
            ))}
            {rel.tuss.length === 0 && tussOfSigtap(proc.c).length === 0 && (
              <li className="text-mute">
                Sem mapeamento TUSS nesta competência. Importe a planilha da ANS em{" "}
                <Link className="text-moss" to="/regras">
                  Regras
                </Link>
                .
              </li>
            )}
          </ul>
        </Box>
      </div>
    );
  }
}

function MiniAudit({ code }: { code: string }) {
  const { byCode } = useSigtap();
  const proc = byCode(code)!;
  const [input, setInput] = useState<AuditInput>({
    sexo: "",
    idadeAnos: "",
    idadeMeses: "",
    cid: "",
    cbo: "",
    registro: "",
    quantidade: "",
  });
  const checks = useMemo(() => runAudit(proc, input), [proc, input]);
  const score = auditScore(checks);

  return (
    <Box title="Simulação rápida da conta">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
          <input className="field" value={input.cid} onChange={(e) => setInput({ ...input, cid: e.target.value })} />
        </Field>
        <Field label="CBO">
          <input className="field" value={input.cbo} onChange={(e) => setInput({ ...input, cbo: e.target.value })} />
        </Field>
      </div>
      <p className="mt-3 text-sm">
        <b className="text-danger">{score.fail} glosa(s)</b> · {score.warn} alerta(s) · {score.ok} ok
      </p>
      <ul className="mt-3 space-y-2">
        {checks.map((c) => (
          <li key={c.id} className={`rounded-xl px-3 py-2 text-sm ${tone(c.status)}`}>
            <b>{c.titulo}.</b> {c.detalhe}
          </li>
        ))}
      </ul>
    </Box>
  );
}

function tone(status: string) {
  if (status === "ok") return "bg-success-bg text-success";
  if (status === "fail") return "bg-danger-bg text-danger";
  if (status === "warn") return "bg-warning-bg text-warning";
  return "bg-neutral-bg text-neutral";
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-card p-4 shadow-card">
      <h3 className="font-display text-xl">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-mute">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}

function Valor({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4 shadow-card">
      <p className="text-xs text-mute">{label}</p>
      <p className="tabular mt-1 text-xl font-semibold">{value}</p>
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

function NotesBox({ code }: { code: string }) {
  const [note, setNote] = useState(() => readNotes()[code] ?? "");
  return (
    <Box title="Anotação local do auditor">
      <textarea
        className="field min-h-24"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          saveNote(code, e.target.value);
        }}
        placeholder="Não sai da sua máquina. Útil para pendências da conta, CNES ou parecer."
      />
    </Box>
  );
}

function IncrementCalc({
  sh,
  sa,
  sp,
  incrementos,
  nomeHab,
}: {
  sh: number;
  sa: number;
  sp: number;
  incrementos: { hab: string; sh: number; sa: number; sp: number }[];
  nomeHab: (c: string) => string;
}) {
  const [hab, setHab] = useState(incrementos[0]?.hab ?? "");
  const inc = incrementos.find((i) => i.hab === hab);
  const nsh = inc ? sh * (1 + inc.sh / 100) : sh;
  const nsa = inc ? sa * (1 + inc.sa / 100) : sa;
  const nsp = inc ? sp * (1 + inc.sp / 100) : sp;
  return (
    <div className="text-sm">
      <select className="field" value={hab} onChange={(e) => setHab(e.target.value)}>
        {incrementos.map((i) => (
          <option key={i.hab} value={i.hab}>
            {i.hab} · {nomeHab(i.hab)}
          </option>
        ))}
      </select>
      {inc && (
        <p className="mt-3">
          Tabela: {money(sh + sa + sp)} → com incremento {inc.sh}/{inc.sa}/{inc.sp}%:{" "}
          <b>
            {money(nsh + nsa + nsp)}
          </b>{" "}
          (SH {money(nsh)} · SA {money(nsa)} · SP {money(nsp)})
        </p>
      )}
    </div>
  );
}
