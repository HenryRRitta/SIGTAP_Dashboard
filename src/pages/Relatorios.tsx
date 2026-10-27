import { Link } from "react-router-dom";
import { ClipboardCheck, GitCompare, Inbox, ShieldAlert, Table2, FolderTree } from "lucide-react";

const ITEMS = [
  { to: "/comparar?tab=competencia", icon: GitCompare, title: "Histórico de competência", text: "Incluídos, excluídos e variação de SH/SA/SP entre meses comparáveis." },
  { to: "/comparar", icon: GitCompare, title: "Comparar dois procedimentos", text: "Confronte atributos e valores na mesma competência." },
  { to: "/lote", icon: Table2, title: "Consistência em lote", text: "CSV ou XML de AIH, APAC ou BPA." },
  { to: "/auditoria", icon: ClipboardCheck, title: "Simular consistência", text: "Sexo, idade, CID, CBO e instrumento." },
  { to: "/fila", icon: Inbox, title: "Fila de pareceres", text: "Em análise, glosado ou deferido." },
  { to: "/glosas", icon: ShieldAlert, title: "Checklist de glosa", text: "Roteiro por instrumento de registro." },
  { to: "/catalogo", icon: FolderTree, title: "Catálogo por grupo", text: "Navegação hierárquica da tabela unificada." },
];

export function RelatoriosPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="text-[26px] font-bold text-navy-950">Relatórios e conferência</h2>
      <p className="mt-2 max-w-2xl text-sm text-mute">
        Extrações e rotinas de auditoria da competência ativa. Nenhum indicador desta tela usa amostra ilustrativa.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className="exe-panel flex gap-3 p-4 hover:border-moss/40">
            <item.icon size={20} className="text-moss" />
            <span>
              <span className="block font-semibold text-navy-950">{item.title}</span>
              <span className="mt-1 block text-sm text-mute">{item.text}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
