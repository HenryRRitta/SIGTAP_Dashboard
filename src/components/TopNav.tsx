import { FormEvent, useId, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import { CompetenciaSelect } from "./CompetenciaSelect";
import { TypeaheadField } from "./TypeaheadField";
import { useSigtap } from "../lib/store";

const PRIMARY = [
  { to: "/", cat: "", label: "Início", end: true },
  { to: "/", cat: "procedimentos", label: "Procedimentos" },
  { to: "/", cat: "medicamentos", label: "Medicamentos" },
  { to: "/", cat: "opm", label: "OPM" },
  { to: "/favoritos", cat: "", label: "Consultas" },
  { to: "/compat", cat: "", label: "Compatibilidades" },
  { to: "/relatorios", cat: "", label: "Relatórios" },
];

const MORE = [
  { to: "/auditoria", label: "Auditoria" },
  { to: "/lote", label: "Lote" },
  { to: "/fila", label: "Fila" },
  { to: "/glosas", label: "Glosas" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/regras", label: "Regras" },
  { to: "/importar", label: "Base local" },
];

function navActive(pathname: string, search: string, item: (typeof PRIMARY)[number]) {
  const cat = new URLSearchParams(search).get("cat") ?? "";
  if (item.to === "/") return pathname === "/" && cat === item.cat;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function TopNav() {
  const { pinned } = useSigtap();
  const loc = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const menuId = useId();

  function irParaBusca(texto = q, sel?: string) {
    const t = texto.trim();
    const params = new URLSearchParams(loc.pathname === "/" ? loc.search : "");
    if (t) params.set("q", t);
    else params.delete("q");
    if (sel) params.set("sel", sel);
    else params.delete("sel");
    params.delete("page");
    navigate(`/?${params.toString()}`);
    setOpen(false);
  }

  function buscar(e: FormEvent) {
    e.preventDefault();
    irParaBusca();
  }

  return (
    <header className="top-nav sticky top-0 z-40">
      <Link to="/" className="shrink-0 leading-none" aria-label="SIGTAP Executive — início">
        <span className="block text-[22px] font-extrabold tracking-[0.4px]">
          SIGTAP <span className="text-[15px] font-medium text-[#b9cae4]">EXECUTIVE</span>
        </span>
      </Link>
      <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex" aria-label="Principal">
        {PRIMARY.map((item) => {
          const active = navActive(loc.pathname, loc.search, item);
          return (
            <Link
              key={`${item.to}-${item.cat}`}
              to={item.cat ? { pathname: "/", search: `cat=${item.cat}` } : item.to}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-2.5 py-3 text-[13px] ${
                active ? "bg-[#1a538c] font-semibold text-white" : "text-[#d9e7f9] hover:bg-[#1a538c] hover:text-white"
              }`}
            >
              {item.label}
              {item.to === "/favoritos" && pinned.length > 0 ? ` (${pinned.length})` : ""}
            </Link>
          );
        })}
      </nav>
      {/* Fora do nav com overflow-x-auto, que cortaria o menu aberto. */}
      <details className="relative hidden shrink-0 lg:block">
        <summary className="cursor-pointer list-none whitespace-nowrap rounded-md px-2.5 py-3 text-[13px] text-[#d9e7f9] hover:bg-[#1a538c] hover:text-white [&::-webkit-details-marker]:hidden">
          Auditoria
        </summary>
        <div
          className="absolute right-0 z-50 mt-1 min-w-44 rounded-lg border border-line bg-white py-1 text-ink shadow-card"
          onClick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")}
        >
          {MORE.map((item) => (
            <NavLink key={item.to} to={item.to} className="block px-3 py-2 text-sm hover:bg-leaf">
              {item.label}
            </NavLink>
          ))}
        </div>
      </details>
      <div className="ml-auto flex items-center gap-2">
        <CompetenciaSelect />
        <form className="hidden items-center gap-1.5 rounded-md bg-white px-2.5 text-[#385b83] sm:flex" onSubmit={buscar}>
          <TypeaheadField
            variant="nav"
            ariaLabel="Busca global"
            placeholder="Buscar na tabela..."
            value={q}
            onChange={setQ}
            onSubmit={() => irParaBusca()}
            onPick={(hit) => {
              setQ(hit.title);
              irParaBusca(hit.title, hit.code);
            }}
          />
        </form>
        <span className="hidden rounded-full bg-[#e5f7e9] px-2.5 py-1 text-[10px] font-bold text-success xl:inline">LOCAL / OFFLINE</span>
        <Bell size={18} className="hidden text-[#d9e7f9] sm:block" aria-hidden="true" />
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div id={menuId} className="w-full lg:hidden">
          <nav className="flex flex-col gap-1 pb-2" aria-label="Menu compacto">
            {PRIMARY.map((item) => {
              const active = navActive(loc.pathname, loc.search, item);
              return (
                <Link
                  key={`m-${item.to}-${item.cat}`}
                  to={item.cat ? { pathname: "/", search: `cat=${item.cat}` } : item.to}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2.5 text-sm ${
                    active ? "bg-[#1a538c] font-semibold text-white" : "text-[#d9e7f9] hover:bg-[#1a538c]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  {item.to === "/favoritos" && pinned.length > 0 ? ` (${pinned.length})` : ""}
                </Link>
              );
            })}
            {MORE.map((item) => (
              <NavLink
                key={`m-${item.to}`}
                to={item.to}
                className="rounded-md px-3 py-2.5 text-sm text-[#d9e7f9] hover:bg-[#1a538c]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <form className="flex gap-2 pb-2 sm:hidden" onSubmit={buscar}>
            <div className="min-w-0 flex-1 rounded-md bg-white px-2 text-ink">
              <TypeaheadField
                variant="field"
                ariaLabel="Busca global"
                placeholder="Buscar na tabela..."
                value={q}
                onChange={setQ}
                onSubmit={() => irParaBusca()}
                onPick={(hit) => {
                  setQ(hit.title);
                  irParaBusca(hit.title, hit.code);
                }}
              />
            </div>
            <button type="submit" className="rounded-md bg-white px-3 text-sm font-semibold text-navy">
              Buscar
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
