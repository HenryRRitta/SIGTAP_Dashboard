import { useEffect, useId, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ClipboardCheck,
  FolderTree,
  GitCompare,
  Inbox,
  Link2,
  Menu,
  Scale,
  Search,
  ShieldAlert,
  Stethoscope,
  Table2,
  Upload,
  X,
} from "lucide-react";
import { BrandMark } from "./BrandMark";
import { useSigtap } from "../lib/store";

const NAV = [
  { to: "/", label: "Mesa", icon: Search, end: true },
  { to: "/catalogo", label: "Catálogo", icon: FolderTree },
  { to: "/auditoria", label: "Auditoria", icon: ClipboardCheck },
  { to: "/lote", label: "Lote", icon: Table2 },
  { to: "/fila", label: "Fila", icon: Inbox },
  { to: "/glosas", label: "Glosas", icon: ShieldAlert },
  { to: "/comparar", label: "Comparar", icon: GitCompare },
  { to: "/cid", label: "CID e CBO", icon: Stethoscope },
  { to: "/compat", label: "Compatibilidades", icon: Link2 },
  { to: "/regras", label: "Regras", icon: Scale },
  { to: "/importar", label: "Competência", icon: Upload },
];

export function Layout() {
  const { data } = useSigtap();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const drawerId = useId();

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="min-h-dvh bg-paper text-ink" data-nav-open={open ? "true" : undefined}>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[rgb(18_33_57_/_48%)] md:hidden"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id={drawerId}
        aria-label="Menu principal"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh flex-col bg-sidebar px-2 py-5 text-sidebar-text transition-transform duration-200 md:z-30 md:w-20 md:translate-x-0 md:visible nav:w-60 nav:px-3 ${
          open ? "w-[min(288px,85vw)] translate-x-0" : "invisible w-[min(288px,85vw)] -translate-x-full md:visible"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-2 px-2 nav:px-1">
          <div className="min-w-0">
            <div className="hidden md:flex md:justify-center nav:hidden">
              <BrandMark onDark compact />
            </div>
            <div className="md:hidden nav:block">
              <BrandMark onDark />
            </div>
            <p className="mt-3 hidden font-display text-[16px] font-bold leading-tight text-white nav:block">Mesa SIGTAP</p>
            <p className="mt-1 hidden text-xs text-sidebar-muted nav:block">Auditoria da tabela unificada SUS</p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white md:hidden"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto" aria-label="Principal">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              title={item.label}
              className={({ isActive }) =>
                `relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors md:justify-center nav:justify-start ${
                  isActive
                    ? "bg-sidebar-active font-semibold text-white before:absolute before:top-3 before:bottom-3 before:left-0 before:w-[3px] before:rounded-full before:bg-[#A5B4FC]"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                }`
              }
            >
              <item.icon size={20} aria-hidden="true" />
              <span className="nav-label md:hidden nav:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 hidden border-t border-[#34435A] px-2 pt-4 text-xs text-sidebar-muted nav:block">
          <p className="font-medium text-white">Competência {data?.meta.competenciaLabel}</p>
          <p className="mt-1">{data?.meta.totalProcedimentos.toLocaleString("pt-BR")} procedimentos vigentes</p>
        </div>
      </aside>
      <div className="min-w-0 md:pl-20 nav:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-2.5 md:hidden">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-card"
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls={drawerId}
            onClick={() => setOpen(true)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <BrandMark compact />
          <p className="text-sm text-mute">{data?.meta.competenciaLabel}</p>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-6 nav:px-8 nav:py-8" data-path={loc.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
