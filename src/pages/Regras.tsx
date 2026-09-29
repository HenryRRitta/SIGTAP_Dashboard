import { useState, type ReactNode } from "react";
import {
  readCnes,
  readNotas,
  readTetos,
  readTuss,
  saveCnes,
  saveNotas,
  saveTetos,
  saveTuss,
  type CnesLocal,
  type NotaTecnica,
  type TetoLocal,
  type TussLocal,
} from "../lib/local";
import { digits, formatCode } from "../lib/format";
import { useSigtap } from "../lib/store";

export function RegrasPage() {
  const { byCode } = useSigtap();
  const [tab, setTab] = useState<"cnes" | "teto" | "tuss" | "notas">("cnes");
  const [msg, setMsg] = useState("");

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="font-display text-4xl">Regras locais</h2>
      <p className="mt-2 text-mute">
        Camada municipal por cima da tabela nacional: CNES da rede, teto MAC, TUSS e notas técnicas do mês. Tudo fica neste navegador.
      </p>
      <div className="mt-4 flex flex-wrap gap-1 border-b border-line">
        <TabBtn active={tab === "cnes"} onClick={() => setTab("cnes")}>
          CNES
        </TabBtn>
        <TabBtn active={tab === "teto"} onClick={() => setTab("teto")}>
          Teto MAC
        </TabBtn>
        <TabBtn active={tab === "tuss"} onClick={() => setTab("tuss")}>
          TUSS × SIGTAP
        </TabBtn>
        <TabBtn active={tab === "notas"} onClick={() => setTab("notas")}>
          Notas técnicas
        </TabBtn>
      </div>
      {msg && <p className="mt-3 text-sm text-moss">{msg}</p>}
      {tab === "cnes" && <CnesForm onMsg={setMsg} />}
      {tab === "teto" && <TetoForm byCode={byCode} onMsg={setMsg} />}
      {tab === "tuss" && <TussForm onMsg={setMsg} />}
      {tab === "notas" && <NotasForm onMsg={setMsg} />}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 text-sm ${active ? "border-b-2 border-moss font-semibold text-moss" : "text-mute"}`}>
      {children}
    </button>
  );
}

function CnesForm({ onMsg }: { onMsg: (s: string) => void }) {
  const [rows, setRows] = useState<CnesLocal[]>(() => readCnes());
  const [form, setForm] = useState<CnesLocal>({ cnes: "", nome: "", habilitacoes: [], leitos: [], servicos: [] });
  const [hab, setHab] = useState("");
  const [leito, setLeito] = useState("");
  const [serv, setServ] = useState("");

  function persist(next: CnesLocal[]) {
    setRows(next);
    saveCnes(next);
  }

  return (
    <section className="mt-6">
      <p className="text-sm text-mute">
        Não há dump nacional do CNES nesta mesa. Cadastre os estabelecimentos que você audita para cruzar habilitação, leito e serviço.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="CNES">
          <input className="field" value={form.cnes} onChange={(e) => setForm({ ...form, cnes: e.target.value })} />
        </Field>
        <Field label="Nome">
          <input className="field" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </Field>
        <Field label="Habilitações (código, Enter)">
          <input
            className="field"
            value={hab}
            onChange={(e) => setHab(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const c = digits(hab);
                if (c) setForm({ ...form, habilitacoes: [...new Set([...form.habilitacoes, c])] });
                setHab("");
              }
            }}
          />
        </Field>
        <Field label="Leitos CNES (Enter)">
          <input
            className="field"
            value={leito}
            onChange={(e) => setLeito(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const c = digits(leito);
                if (c) setForm({ ...form, leitos: [...new Set([...form.leitos, c])] });
                setLeito("");
              }
            }}
          />
        </Field>
        <Field label="Serviço-classificação (ex. 115011)">
          <input
            className="field"
            value={serv}
            onChange={(e) => setServ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const c = digits(serv);
                if (c) setForm({ ...form, servicos: [...new Set([...form.servicos, c])] });
                setServ("");
              }
            }}
          />
        </Field>
      </div>
      <p className="mt-2 text-xs text-mute">
        Habilitações: {form.habilitacoes.join(", ") || "—"} · Leitos: {form.leitos.join(", ") || "—"} · Serviços: {form.servicos.join(", ") || "—"}
      </p>
      <button
        className="mt-4 rounded-xl bg-moss px-4 py-2 text-sm text-white"
        onClick={() => {
          const cnes = digits(form.cnes);
          if (cnes.length < 7) {
            onMsg("Informe um CNES válido.");
            return;
          }
          persist([{ ...form, cnes }, ...rows.filter((r) => r.cnes !== cnes)]);
          setForm({ cnes: "", nome: "", habilitacoes: [], leitos: [], servicos: [] });
          onMsg("Estabelecimento salvo.");
        }}
      >
        Salvar estabelecimento
      </button>
      <ul className="mt-6 space-y-2">
        {rows.map((r) => (
          <li key={r.cnes} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 text-sm">
            <div>
              <p className="font-mono text-moss">{r.cnes}</p>
              <p>{r.nome}</p>
              <p className="text-mute">hab {r.habilitacoes.join(", ") || "—"} · leito {r.leitos.join(", ") || "—"}</p>
            </div>
            <button
              className="text-clay"
              onClick={() => {
                persist(rows.filter((x) => x.cnes !== r.cnes));
                onMsg("Removido.");
              }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TetoForm({
  byCode,
  onMsg,
}: {
  byCode: (c: string) => { n: string } | undefined;
  onMsg: (s: string) => void;
}) {
  const [rows, setRows] = useState<TetoLocal[]>(() => readTetos());
  const [form, setForm] = useState<TetoLocal>({ procedimento: "", tetoQtd: null, tetoValor: null, observacao: "" });

  function persist(next: TetoLocal[]) {
    setRows(next);
    saveTetos(next);
  }

  return (
    <section className="mt-6">
      <p className="text-sm text-mute">
        Teto de quantidade ou valor por procedimento (10 dígitos) ou prefixo (grupo/subgrupo). Vale na mesa e no lote.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Procedimento ou prefixo">
          <input className="field" value={form.procedimento} onChange={(e) => setForm({ ...form, procedimento: e.target.value })} placeholder="0411010034 ou 04" />
        </Field>
        <Field label="Teto de quantidade">
          <input
            className="field"
            value={form.tetoQtd ?? ""}
            onChange={(e) => setForm({ ...form, tetoQtd: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </Field>
        <Field label="Teto de valor (R$)">
          <input
            className="field"
            value={form.tetoValor ?? ""}
            onChange={(e) => setForm({ ...form, tetoValor: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </Field>
        <Field label="Observação / pactuação">
          <input className="field" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
        </Field>
      </div>
      <button
        className="mt-4 rounded-xl bg-moss px-4 py-2 text-sm text-white"
        onClick={() => {
          const procedimento = digits(form.procedimento);
          if (procedimento.length < 2) {
            onMsg("Informe o código ou o prefixo.");
            return;
          }
          persist([{ ...form, procedimento }, ...rows.filter((r) => r.procedimento !== procedimento)]);
          setForm({ procedimento: "", tetoQtd: null, tetoValor: null, observacao: "" });
          onMsg("Teto salvo.");
        }}
      >
        Salvar teto
      </button>
      <ul className="mt-6 space-y-2">
        {rows.map((r) => (
          <li key={r.procedimento} className="flex justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 text-sm">
            <div>
              <p className="font-mono text-moss">{r.procedimento.length === 10 ? formatCode(r.procedimento) : r.procedimento}</p>
              <p>{byCode(r.procedimento)?.n ?? "prefixo / grupo"}</p>
              <p className="text-mute">
                qtd {r.tetoQtd ?? "—"} · valor {r.tetoValor ?? "—"} {r.observacao}
              </p>
            </div>
            <button className="text-clay" onClick={() => persist(rows.filter((x) => x.procedimento !== r.procedimento))}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TussForm({ onMsg }: { onMsg: (s: string) => void }) {
  const [rows, setRows] = useState<TussLocal[]>(() => readTuss());
  const [texto, setTexto] = useState("");

  function importar() {
    try {
      const mapped: TussLocal[] = [];
      const lines = texto.replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter(Boolean);
      if (!lines.length) {
        onMsg("Cole ou envie um CSV com as colunas tuss e sigtap.");
        return;
      }
      const headerLine = lines[0] ?? "";
      const headers = headerLine.split(/[;,]/).map((h) => h.trim().toLowerCase());
      const iT = headers.findIndex((h) => h.includes("tuss"));
      const iS = headers.findIndex((h) => h.includes("sigtap") || h.includes("procedimento"));
      const iN = headers.findIndex((h) => h.includes("nome") || h.includes("descr"));
      if (iT < 0 || iS < 0) {
        onMsg("CSV precisa das colunas tuss e sigtap.");
        return;
      }
      for (const line of lines.slice(1)) {
        const cells = line.split(/[;,]/);
        const tuss = digits(cells[iT] ?? "");
        const sigtap = digits(cells[iS] ?? "");
        if (tuss && sigtap) mapped.push({ tuss, sigtap, nome: (cells[iN] ?? "").trim() });
      }
      if (!mapped.length) {
        onMsg("Nenhuma linha TUSS × SIGTAP encontrada.");
        return;
      }
      const by = new Map(rows.map((r) => [`${r.tuss}-${r.sigtap}`, r]));
      for (const m of mapped) by.set(`${m.tuss}-${m.sigtap}`, m);
      const next = [...by.values()];
      setRows(next);
      saveTuss(next);
      onMsg(`${mapped.length} relações importadas. Total: ${next.length}.`);
    } catch (e) {
      onMsg(e instanceof Error ? e.message : "Falha ao importar.");
    }
  }

  return (
    <section className="mt-6">
      <p className="text-sm text-mute">
        A competência 08/2026 veio com a relação TUSS vazia no ZIP do DATASUS. Importe a planilha oficial da ANS (colunas <b>tuss</b> e <b>sigtap</b>).
      </p>
      <textarea className="field mt-4 min-h-32 font-mono text-xs" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="tuss;sigtap;nome" />
      <label className="mt-3 block text-sm text-moss">
        <input
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void file.text().then(setTexto);
          }}
        />
        Ou envie um CSV
      </label>
      <button className="mt-3 rounded-xl bg-moss px-4 py-2 text-sm text-white" onClick={importar}>
        Importar relações
      </button>
      <p className="mt-4 text-sm text-mute">{rows.length} relações locais.</p>
      <ul className="mt-3 max-h-80 space-y-1 overflow-auto text-sm">
        {rows.slice(0, 80).map((r) => (
          <li key={`${r.tuss}-${r.sigtap}`}>
            <span className="font-mono">{r.tuss}</span> → {formatCode(r.sigtap.padStart(10, "0").slice(-10))} {r.nome}
          </li>
        ))}
      </ul>
      {rows.length > 0 && (
        <button
          className="mt-4 text-sm text-clay"
          onClick={() => {
            setRows([]);
            saveTuss([]);
            onMsg("Relações TUSS apagadas.");
          }}
        >
          Limpar TUSS local
        </button>
      )}
    </section>
  );
}

function NotasForm({ onMsg }: { onMsg: (s: string) => void }) {
  const [rows, setRows] = useState<NotaTecnica[]>(() => readNotas());
  const [codigo, setCodigo] = useState("");
  const [texto, setTexto] = useState("");

  function persist(next: NotaTecnica[]) {
    setRows(next);
    saveNotas(next);
  }

  return (
    <section className="mt-6">
      <p className="text-sm text-mute">
        Ligue o procedimento incluído ou alterado no mês à portaria, nota técnica ou ofício da SES/SMS. Aparece na ficha e no comparativo de competência.
      </p>
      <div className="mt-4 grid gap-3">
        <Field label="Código SIGTAP">
          <input className="field" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        </Field>
        <Field label="Nota / portaria">
          <textarea className="field min-h-24" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: Portaria GM/MS nº … — inclusão de cuidados paliativos." />
        </Field>
      </div>
      <button
        className="mt-4 rounded-xl bg-moss px-4 py-2 text-sm text-white"
        onClick={() => {
          const c = digits(codigo);
          if (c.length !== 10 || !texto.trim()) {
            onMsg("Informe código de 10 dígitos e o texto da nota.");
            return;
          }
          persist([{ codigo: c, texto: texto.trim() }, ...rows.filter((r) => r.codigo !== c)]);
          setCodigo("");
          setTexto("");
          onMsg("Nota salva.");
        }}
      >
        Salvar nota
      </button>
      <ul className="mt-6 space-y-2">
        {rows.map((r) => (
          <li key={r.codigo} className="rounded-xl border border-line bg-card px-4 py-3 text-sm">
            <div className="flex justify-between gap-3">
              <p className="font-mono text-moss">{formatCode(r.codigo)}</p>
              <button className="text-clay" onClick={() => persist(rows.filter((x) => x.codigo !== r.codigo))}>
                Excluir
              </button>
            </div>
            <p className="mt-1">{r.texto}</p>
          </li>
        ))}
      </ul>
    </section>
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
