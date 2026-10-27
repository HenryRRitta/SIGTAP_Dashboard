import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { COMPAT_LABEL, COMPAT_TONE, COMPLEX_TONE, formatCode, money, relOf } from "../lib/format";
import type { CompetenciaDiff, Procedure, RelCompat } from "../lib/types";
import { useSigtap } from "../lib/store";
import { ExcludenciaStrip, FavoriteWithAlert } from "./Excludencia";

const COMPAT_VISIVEIS = 8;

export function ProcedurePanel({ proc }: { proc: Procedure | undefined }) {
  const { data, maps } = useSigtap();
  const [diff, setDiff] = useState<CompetenciaDiff | null>(null);

  useEffect(() => {
    fetch("/data/diff.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(setDiff)
      .catch(() => setDiff(null));
  }, []);

  if (!proc || !maps || !data) {
    return (
      <aside className="exe-panel p-4">
        <h2 className="text-base font-semibold text-navy-950">Detalhes do procedimento</h2>
        <p className="mt-6 text-center text-sm text-mute">Selecione um registro na tabela.</p>
      </aside>
    );
  }

  const rel = relOf(proc);
  const cx = data.lookups.complexidade[proc.cx] ?? proc.cx;
  const hist = diff?.alterados.find((x) => x.c === proc.c);
  const incluido = diff?.incluidos.find((x) => x.c === proc.c);
  const excluido = diff?.excluidos.find((x) => x.c === proc.c);

  return (
    <aside className="exe-panel min-w-0 overflow-hidden p-0">
      <div className="p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-navy-950">Detalhes do procedimento</h2>
          <p className="text-xs text-mute">Competência {data.meta.competenciaLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteWithAlert proc={proc} />
          <Link to={`/procedimento/${proc.c}`} className="text-xs font-semibold text-moss hover:underline">
            Ficha completa
          </Link>
        </div>
      </div>
      <div className="flex items-start gap-3 border-t border-line pt-3">
        <p className="font-mono text-lg font-semibold text-moss">{formatCode(proc.c)}</p>
        <p className="text-[13px] font-semibold uppercase leading-snug text-navy-950">{proc.n}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {rel.modalidades.slice(0, 2).map((m) => (
          <span key={m} className="rounded-full bg-leaf px-2 py-1 text-[11px] text-moss">
            {maps.modalidade.get(m) ?? m}
          </span>
        ))}
        <span className={`rounded-full px-2 py-1 text-[11px] ${COMPLEX_TONE[proc.cx]}`}>{cx}</span>
      </div>
      <dl className="mt-4 grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-2 text-xs">
        <dt className="font-semibold text-mute">Grupo</dt>
        <dd>
          {proc.g} · {maps.grupo.get(proc.g)}
        </dd>
        <dt className="font-semibold text-mute">Subgrupo</dt>
        <dd>
          {proc.sg} · {maps.subgrupo.get(`${proc.g}${proc.sg}`)}
        </dd>
        <dt className="font-semibold text-mute">Forma</dt>
        <dd>
          {proc.fo} · {maps.forma.get(`${proc.g}${proc.sg}${proc.fo}`)}
        </dd>
        <dt className="font-semibold text-mute">Instrumento</dt>
        <dd>{rel.registros.map((r) => maps.registro.get(r) ?? r).join(", ") || "—"}</dd>
        <dt className="font-semibold text-mute">Financiamento</dt>
        <dd>{maps.financiamento.get(proc.fin) ?? "—"}</dd>
      </dl>
      <div className="mt-3">
        <div className="grid grid-cols-4 gap-1.5">
          <Valor k="SA" v={money(proc.sa)} />
          <Valor k="SH" v={money(proc.sh)} />
          <Valor k="SP" v={money(proc.sp)} />
          <Valor k="Total ref." v={money(proc.tot)} emph />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-mute">
          Total de referência = SH + SA + SP desta competência, como na tabela unificada. Ausência de componente aparece como R$ 0,00 na fonte oficial.
        </p>
      </div>
      </div>
      <ExcludenciaStrip proc={proc} />
      <div className="grid gap-2 p-3">
        <RelCard title="Atributos">
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <Item k="Sexo" v={data.lookups.sexo[proc.sx] ?? proc.sx} />
            <Item k="Qtd. máx." v={proc.qmax?.toString() ?? "—"} />
            <Item k="Permanência" v={proc.perm != null ? `${proc.perm} dia(s)` : "—"} />
            <Item k="Idade mín." v={proc.iminL ?? "—"} />
            <Item k="Idade máx." v={proc.imaxL ?? "—"} />
            <Item k="Rubrica" v={proc.rub ? maps.rubrica.get(proc.rub) ?? proc.rub : "—"} />
          </dl>
        </RelCard>
        <CompatCard rows={rel.compat} names={data.names} />
        <RelCard title="CID" count={rel.cidsP.length + rel.cidsS.length}>
          <CidBloco
            titulo={`Principal (${rel.cidsP.length})`}
            codes={rel.cidsP}
            nomes={data.cids}
          />
          <CidBloco
            titulo={`Secundário (${rel.cidsS.length})`}
            codes={rel.cidsS}
            nomes={data.cids}
          />
        </RelCard>
        <RelCard title="CBO" count={rel.cbos.length}>
          {rel.cbos.length === 0 ? (
            <p className="text-xs text-mute">Nenhum vínculo nesta competência.</p>
          ) : (
            <ul className="max-h-28 overflow-auto text-xs">
              {rel.cbos.slice(0, 30).map((c) => (
                <li key={c} className="border-t border-line/60 py-1 first:border-t-0">
                  <Link className="font-mono text-moss" to={`/cid?q=${encodeURIComponent(c.trim())}`}>
                    {c.trim()}
                  </Link>{" "}
                  {data.cbos[c] ?? ""}
                </li>
              ))}
            </ul>
          )}
        </RelCard>
        <HistCard diff={diff} hist={hist} incluido={incluido} excluido={excluido} />
      </div>
    </aside>
  );
}

function Valor({ k, v, emph }: { k: string; v: string; emph?: boolean }) {
  return (
    <div className={`rounded-md border px-1 py-3 text-center ${emph ? "border-navy-950 bg-navy-950 text-white" : "border-line bg-mist"}`}>
      <small className={`block text-[10px] ${emph ? "text-[#dbe9f7]" : "text-mute"}`}>{k}</small>
      <b className="tabular text-[12px]">{v}</b>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-mute">{k}</p>
      <p className="font-medium text-ink">{v}</p>
    </div>
  );
}

function uniqueCompat(rows: RelCompat[]) {
  const seen = new Map<string, RelCompat>();
  for (const row of rows) {
    const key = `${row.tipo}-${row.compativel}`;
    if (!seen.has(key)) seen.set(key, row);
  }
  return [...seen.values()];
}

function CompatCard({ rows, names }: { rows: RelCompat[]; names: Record<string, string> }) {
  const unicos = uniqueCompat(rows);
  const visiveis = unicos.slice(0, COMPAT_VISIVEIS);
  const resto = unicos.length - visiveis.length;
  return (
    <RelCard title="Compatibilidades" count={unicos.length}>
      {unicos.length === 0 ? (
        <p className="text-xs text-mute">Nenhuma compatibilidade cadastrada neste procedimento.</p>
      ) : (
        <>
          <ul className="max-h-36 overflow-auto text-xs">
            {visiveis.map((row) => (
              <li key={`${row.tipo}-${row.compativel}`} className="border-t border-line/60 py-1.5 first:border-t-0">
                <span className={`mr-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${COMPAT_TONE[row.tipo] ?? "bg-neutral-bg text-neutral"}`}>
                  {COMPAT_LABEL[row.tipo] ?? row.tipo}
                </span>
                <Link className="font-mono text-moss" to={`/procedimento/${row.compativel}`}>
                  {formatCode(row.compativel)}
                </Link>{" "}
                {names[row.compativel] ?? ""}
              </li>
            ))}
          </ul>
          {resto > 0 ? <p className="mt-1 text-[11px] font-medium text-moss">e mais {resto}</p> : null}
          <Link to="/compat" className="mt-1.5 inline-block text-[11px] font-semibold text-moss hover:underline">
            Abrir conferência de pares
          </Link>
        </>
      )}
    </RelCard>
  );
}

function HistCard({
  diff,
  hist,
  incluido,
  excluido,
}: {
  diff: CompetenciaDiff | null;
  hist: CompetenciaDiff["alterados"][number] | undefined;
  incluido: CompetenciaDiff["incluidos"][number] | undefined;
  excluido: CompetenciaDiff["excluidos"][number] | undefined;
}) {
  return (
    <RelCard title="Histórico">
      <div className="text-xs text-mute">
        {!diff ? (
          <p>Carregando comparação de competências disponíveis…</p>
        ) : hist ? (
          <div>
            <p className="font-medium text-ink">
              Alterado de {diff.deLabel} para {diff.paraLabel}
            </p>
            <ul className="mt-2 space-y-1">
              {Object.entries(hist.ch).map(([k, v]) => (
                <li key={k}>
                  {k}: {fmtPar(v)}
                </li>
              ))}
            </ul>
          </div>
        ) : incluido ? (
          <p className="text-ink">
            Incluído na competência {diff.paraLabel}. Não havia registro comparável em {diff.deLabel}.
          </p>
        ) : excluido ? (
          <p>
            Este código constava em {diff.deLabel} e não está vigente em {diff.paraLabel}.
          </p>
        ) : (
          <p>
            Sem variação de valores entre {diff.deLabel} e {diff.paraLabel} para este código. Não há série de competências anteriores carregada.
          </p>
        )}
        <Link to="/comparar?tab=competencia" className="mt-2 inline-block text-[11px] font-semibold text-moss hover:underline">
          Ver o que mudou no mês
        </Link>
      </div>
    </RelCard>
  );
}

function RelCard({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <article className="rounded-[10px] border border-line bg-mist px-3 py-2.5">
      <h3 className="mb-2 flex items-center justify-between text-xs font-semibold text-navy-950">
        {title}
        {count != null ? (
          <span className="inline-flex min-w-[1.4rem] justify-center rounded-full bg-leaf px-1.5 py-px text-[11px] tabular font-medium text-moss">
            {count}
          </span>
        ) : null}
      </h3>
      {children}
    </article>
  );
}

function CidBloco({
  titulo,
  codes,
  nomes,
}: {
  titulo: string;
  codes: string[];
  nomes: Record<string, { n: string }>;
}) {
  return (
    <div className="mt-2 first:mt-0">
      <p className="text-[11px] font-semibold text-mute">{titulo}</p>
      {codes.length === 0 ? (
        <p className="mt-0.5 text-xs text-mute">Nenhum vínculo nesta competência.</p>
      ) : (
        <ul className="mt-0.5 max-h-28 overflow-auto text-xs">
          {codes.slice(0, 30).map((c) => (
            <li key={c} className="border-t border-line/60 py-1 first:border-t-0">
              <Link className="font-mono text-moss" to={`/cid?q=${encodeURIComponent(c.trim())}`}>
                {c.trim()}
              </Link>{" "}
              {nomes[c]?.n ?? ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function fmtPar(v: unknown) {
  if (!Array.isArray(v) || v.length < 2) return String(v ?? "—");
  return `${v[0] ?? "—"} → ${v[1] ?? "—"}`;
}
