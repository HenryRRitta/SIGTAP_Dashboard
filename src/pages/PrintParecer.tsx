import { Link, useParams } from "react-router-dom";
import { CodeLine, PrintShell } from "../components/PrintShell";
import { runAudit } from "../lib/audit";
import { formatCode, money } from "../lib/format";
import { parecerAutomatico } from "../lib/glosa";
import { useSigtap } from "../lib/store";
import { readProfile, takePrint } from "../lib/workspace";

const LABEL = {
  conforme: "PRODUÇÃO CONFORME A TABELA",
  glosar: "INDICADO GLOSAR",
  diligenciar: "DILIGENCIAR / COMPLEMENTAR",
};

export function PrintParecerPage() {
  const { code = "" } = useParams();
  const { data, byCode } = useSigtap();
  const proc = byCode(code);
  const payload = takePrint();
  const profile = readProfile();
  if (!proc || !data) return <p className="p-8">Procedimento não encontrado.</p>;

  const input = payload?.input ?? {
    sexo: "",
    idadeAnos: "",
    idadeMeses: "",
    cid: "",
    cbo: "",
    registro: "",
    quantidade: "",
  };
  const checks = payload?.checks ?? runAudit(proc, input);
  const conclusao = payload?.conclusao ?? parecerAutomatico(checks);

  return (
    <PrintShell title="Parecer de consistência SIGTAP" competencia={data.meta.competenciaLabel}>
      <CodeLine code={proc.c} name={proc.n} />
      <section className="grid grid-cols-2 gap-3 text-sm">
        <Cell k="Auditor" v={profile.nome || "________________"} />
        <Cell k="Órgão" v={profile.orgao || "________________"} />
        <Cell k="Cargo" v={profile.cargo} />
        <Cell k="Competência da produção" v={payload?.competenciaProducao || "____/______"} />
        <Cell k="Estabelecimento" v={payload?.estabelecimento || "________________"} />
        <Cell k="CNES" v={payload?.cnes || "________________"} />
        <Cell k="Usuário" v={payload?.usuario || "________________"} />
        <Cell k="CNS/CPF" v={payload?.cns || "________________"} />
        <Cell k="Documento (AIH/APAC)" v={payload?.documento || "________________"} />
        <Cell k="Instrumento" v={input.registro || "não informado"} />
      </section>
      <section className="mt-4 rounded-xl border-2 border-moss p-3 text-center">
        <p className="text-xs text-mute">Conclusão do parecer</p>
        <p className="font-display text-2xl">{LABEL[conclusao]}</p>
      </section>
      <section className="mt-4 grid grid-cols-4 gap-2 text-sm">
        <Cell k="Sexo informado" v={input.sexo || "—"} />
        <Cell k="Idade" v={input.idadeAnos ? `${input.idadeAnos}a ${input.idadeMeses || "0"}m` : "—"} />
        <Cell k="CID" v={input.cid || "—"} />
        <Cell k="CBO" v={input.cbo || "—"} />
        <Cell k="Quantidade" v={input.quantidade || "—"} />
        <Cell k="SH/SA/SP" v={`${money(proc.sh)} / ${money(proc.sa)} / ${money(proc.sp)}`} />
      </section>
      <section className="mt-5">
        <h3 className="font-display text-xl">Achados</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {checks.map((c) => (
            <li key={c.id}>
              <b>{c.titulo}</b> ({c.status}) — {c.detalhe}
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-5 text-sm">
        <h3 className="font-display text-xl">Observação do auditor</h3>
        <p className="mt-2 min-h-16 whitespace-pre-wrap">{payload?.observacao || "________________________________________________________________"}</p>
      </section>
      <section className="mt-10 grid grid-cols-2 gap-10 text-sm">
        <div>
          <p>________________________________</p>
          <p>{profile.nome || "Assinatura do auditor"}</p>
        </div>
        <div>
          <p>________________________________</p>
          <p>Data</p>
        </div>
      </section>
      <p className="no-print mt-6 text-sm">
        <Link className="text-moss" to={`/auditoria/${formatCode(proc.c).replace(/\D/g, "")}`}>
          Voltar à mesa de consistência
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
