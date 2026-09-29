import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { formatCode } from "../lib/format";

export function PrintShell({
  title,
  competencia,
  children,
}: {
  title: string;
  competencia: string;
  children: ReactNode;
}) {
  const [params] = useSearchParams();
  useEffect(() => {
    if (params.get("autoprint") === "1") {
      const t = window.setTimeout(() => window.print(), 450);
      return () => window.clearTimeout(t);
    }
  }, [params]);

  return (
    <div className="print-sheet mx-auto max-w-3xl bg-white px-8 py-8 text-ink">
      <header className="border-b-2 border-moss pb-3">
        <div className="flex items-start justify-between gap-4">
          <img src="/brand/logo-fluxsus.png" alt="FluxSUS" className="h-10 w-auto object-contain" />
          <div className="text-right text-sm">
            <p>Competência da tabela</p>
            <p className="font-semibold">{competencia}</p>
          </div>
        </div>
        <p className="font-mono mt-3 text-[10px] tracking-[0.22em] text-moss uppercase">Sistema Único de Saúde · Tabela SIGTAP</p>
        <h1 className="font-display mt-1 text-3xl">{title}</h1>
        <p className="text-sm text-mute">FluxSUS · Mesa SIGTAP · auditoria da Tabela Unificada</p>
      </header>
      <div className="no-print mt-4 flex gap-2">
        <button className="rounded-lg bg-moss px-3 py-2 text-sm text-white" onClick={() => window.print()}>
          Salvar PDF / imprimir
        </button>
        <button className="rounded-lg border border-line px-3 py-2 text-sm" onClick={() => window.close()}>
          Fechar
        </button>
      </div>
      <div className="mt-6">{children}</div>
      <footer className="mt-10 border-t border-line pt-3 text-[11px] text-mute">
        Documento gerado em {new Date().toLocaleString("pt-BR")} · código formatado no padrão GR.SB.FO.PPP-D · valores de referência nacional da tabela, sem tetos locais.
      </footer>
    </div>
  );
}

export function CodeLine({ code, name }: { code: string; name: string }) {
  return (
    <div className="mb-4">
      <p className="font-mono text-moss">{formatCode(code)}</p>
      <h2 className="font-display text-2xl">{name}</h2>
    </div>
  );
}
