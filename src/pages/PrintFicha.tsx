import { Link, useParams } from "react-router-dom";
import { CodeLine, PrintShell } from "../components/PrintShell";
import { formatCode, money, relOf } from "../lib/format";
import { checklistGlosa, familiaDaConta } from "../lib/glosa";
import { useSigtap } from "../lib/store";

export function PrintFichaPage() {
  const { code = "" } = useParams();
  const { data, maps, byCode } = useSigtap();
  const proc = byCode(code);
  if (!proc || !data || !maps) {
    return <p className="p-8">Procedimento não encontrado.</p>;
  }
  const rel = relOf(proc);
  const familia = familiaDaConta(rel.registros);
  const glosas = checklistGlosa(proc);

  return (
    <PrintShell title="Ficha técnica do procedimento" competencia={data.meta.competenciaLabel}>
      <CodeLine code={proc.c} name={proc.n} />
      <p className="text-sm text-mute">
        {maps.grupo.get(proc.g)} · {maps.subgrupo.get(`${proc.g}${proc.sg}`)} · {maps.forma.get(`${proc.g}${proc.sg}${proc.fo}`)}
      </p>
      <section className="mt-4 grid grid-cols-4 gap-2 text-sm">
        <Cell k="Total" v={money(proc.tot)} />
        <Cell k="SH" v={money(proc.sh)} />
        <Cell k="SA" v={money(proc.sa)} />
        <Cell k="SP" v={money(proc.sp)} />
      </section>
      <section className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <Cell k="Complexidade" v={data.lookups.complexidade[proc.cx] ?? proc.cx} />
        <Cell k="Sexo" v={data.lookups.sexo[proc.sx] ?? proc.sx} />
        <Cell k="Idade" v={`${proc.iminL ?? "–"} a ${proc.imaxL ?? "–"}`} />
        <Cell k="Qtd máxima" v={proc.qmax?.toString() ?? "Não se aplica"} />
        <Cell k="Média permanência" v={proc.perm ? `${proc.perm} dia(s)` : "Não se aplica"} />
        <Cell k="Pontos SP" v={proc.pts?.toString() ?? "Não se aplica"} />
        <Cell k="Financiamento" v={maps.financiamento.get(proc.fin) ?? proc.fin} />
        <Cell k="Família de registro" v={familia} />
      </section>
      <section className="mt-5">
        <h3 className="font-display text-xl">Descrição</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{proc.d || "Sem descrição nesta competência."}</p>
      </section>
      <section className="mt-5 text-sm">
        <h3 className="font-display text-xl">Registro e consistência</h3>
        <p className="mt-2">Instrumentos: {rel.registros.map((r) => maps.registro.get(r) ?? r).join("; ") || "—"}</p>
        <p>Modalidades: {rel.modalidades.map((m) => maps.modalidade.get(m) ?? m).join("; ") || "—"}</p>
        <p>Atributos: {rel.detalhes.map((d) => `${d} ${maps.detalhe.get(d)?.n}`).join("; ") || "—"}</p>
        <p>CID principal: {rel.cidsP.length} · secundário: {rel.cidsS.length} · CBO: {rel.cbos.length}</p>
        <p>Habilitações: {rel.habilitacoes.map((h) => h.cod).join(", ") || "nenhuma"} · Leitos: {rel.leitos.join(", ") || "—"}</p>
      </section>
      <section className="mt-5">
        <h3 className="font-display text-xl">Checklist de glosa ({familia})</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {glosas.map((g) => (
            <li key={g.id}>
              <b>{g.titulo}</b> [{g.gravidade}] — {g.texto}
            </li>
          ))}
        </ol>
      </section>
      <p className="no-print mt-6 text-sm">
        <Link className="text-moss" to={`/procedimento/${proc.c}`}>
          Voltar à ficha {formatCode(proc.c)}
        </Link>
      </p>
    </PrintShell>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-mute">{k}</p>
      <p className="font-medium">{v}</p>
    </div>
  );
}
