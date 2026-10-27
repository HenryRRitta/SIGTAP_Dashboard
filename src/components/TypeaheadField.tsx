import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Search } from "lucide-react";
import { digits, formatCode, looksLikeCid } from "../lib/format";
import { useSigtap } from "../lib/store";

export type TypeaheadHit = {
  id: string;
  code: string;
  title: string;
  detail: string;
  kind: "procedimento" | "cid" | "cbo";
  viaCid?: boolean;
};

export type TypeaheadSource = "procedimentos" | "cid-cbo";
export type TypeaheadVariant = "box" | "home" | "nav" | "field";

function podeAbrir(query: string) {
  const q = query.trim();
  return q.length >= 2 || digits(q).length >= 2;
}

export function TypeaheadField({
  value,
  onChange,
  onPick,
  onSubmit,
  placeholder,
  ariaLabel,
  variant = "box",
  source = "procedimentos",
  autoFocus,
  submitLabel = "Buscar",
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  onPick?: (hit: TypeaheadHit) => void;
  onSubmit?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  variant?: TypeaheadVariant;
  source?: TypeaheadSource;
  autoFocus?: boolean;
  submitLabel?: string;
  icon?: ReactNode;
}) {
  const { searchNome, data, maps } = useSigtap();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const hits = useMemo(() => {
    if (!data || !podeAbrir(value)) return [];
    const q = value.trim();
    const out: TypeaheadHit[] = [];

    if (source === "cid-cbo") {
      const upper = q.toUpperCase();
      const lower = q.toLowerCase();
      const digit = digits(q);
      for (const [c, info] of Object.entries(data.cids)) {
        if (c.startsWith(upper) || info.n.toLowerCase().includes(lower)) {
          out.push({ id: `cid-${c}`, code: c.trim(), title: info.n, detail: "CID-10", kind: "cid" });
        }
        if (out.length >= 5) break;
      }
      let cboN = 0;
      for (const [c, n] of Object.entries(data.cbos)) {
        if ((digit.length >= 3 && c.startsWith(digit)) || n.toLowerCase().includes(lower)) {
          out.push({ id: `cbo-${c}`, code: c, title: n, detail: "CBO", kind: "cbo" });
          cboN += 1;
        }
        if (cboN >= 5) break;
      }
    }

    const cidQuery = looksLikeCid(q);
    for (const proc of searchNome(q).slice(0, 8)) {
      if (out.some((h) => h.kind === "procedimento" && h.code === proc.c)) continue;
      out.push({
        id: `p-${proc.c}`,
        code: proc.c,
        title: proc.n,
        detail: maps?.grupo.get(proc.g) ?? `Grupo ${proc.g}`,
        kind: "procedimento",
        viaCid: cidQuery,
      });
      if (out.filter((h) => h.kind === "procedimento").length >= 8) break;
    }
    return out.slice(0, 10);
  }, [data, maps, searchNome, source, value]);

  useEffect(() => {
    setActive(0);
  }, [value]);

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  const show = open && hits.length > 0;

  function escolher(hit: TypeaheadHit) {
    onChange(hit.kind === "procedimento" ? hit.code : hit.code);
    onPick?.(hit);
    setOpen(false);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(0, hits.length - 1)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      if (show && hits[active]) {
        e.preventDefault();
        escolher(hits[active]);
        return;
      }
      if (onSubmit) {
        e.preventDefault();
        onSubmit();
        setOpen(false);
      }
      return;
    }
    if (e.key === "Escape") {
      if (show) {
        e.preventDefault();
        setOpen(false);
      }
    }
  }

  const input = (
    <input
      autoFocus={autoFocus}
      aria-label={ariaLabel ?? placeholder ?? "Buscar"}
      aria-autocomplete="list"
      aria-controls={listId}
      aria-expanded={show}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      placeholder={placeholder}
      value={value}
      className={
        variant === "nav"
          ? "w-36 bg-transparent py-2.5 text-sm text-ink outline-none md:w-44"
          : variant === "home"
            ? "min-h-10 flex-1 bg-transparent text-[15px] outline-none"
            : variant === "field"
              ? "field w-full"
              : "w-full bg-transparent text-[16px] outline-none placeholder:text-mute"
      }
      onChange={(e) => {
        onChange(e.target.value);
        setOpen(true);
      }}
      onFocus={() => setOpen(true)}
      onKeyDown={onKey}
    />
  );

  const lista = show ? (
    <ul
      id={listId}
      role="listbox"
      className={`typeahead-panel ${variant === "nav" ? "right-0 left-auto w-[min(28rem,calc(100vw-2rem))]" : "inset-x-0"}`}
    >
      {hits.map((hit, i) => (
        <li key={hit.id} role="option" aria-selected={i === active}>
          <button
            type="button"
            className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm ${
              i === active ? "bg-selected" : "hover:bg-leaf"
            }`}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setActive(i)}
            onClick={() => escolher(hit)}
          >
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-[12px] text-moss">
                {hit.kind === "procedimento" ? formatCode(hit.code) : hit.code}
              </span>
              {hit.viaCid ? (
                <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">
                  CID
                </span>
              ) : null}
            </span>
            <span className="line-clamp-2 text-ink">{hit.title}</span>
            <span className="text-[11px] text-mute">{hit.detail}</span>
          </button>
        </li>
      ))}
    </ul>
  ) : null;

  if (variant === "nav") {
    return (
      <div ref={wrapRef} className="relative">
        <div className="flex items-center gap-1.5">
          <Search size={16} aria-hidden="true" />
          {input}
        </div>
        {lista}
      </div>
    );
  }

  if (variant === "home") {
    return (
      <div ref={wrapRef} className="relative min-w-[240px] flex-1">
        <div className="flex items-center gap-2 rounded-md border border-line px-3 py-1">
          {icon ?? <Search size={18} className="text-mute" />}
          {input}
          {onSubmit && (
            <button type="button" className="rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-950" onClick={onSubmit}>
              {submitLabel}
            </button>
          )}
        </div>
        {lista}
      </div>
    );
  }

  if (variant === "field") {
    return (
      <div ref={wrapRef} className="relative">
        {input}
        {lista}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 shadow-card">
        {icon ?? <Search size={18} className="text-moss" />}
        {input}
        {onSubmit && (
          <button type="submit" className="hidden min-h-10 rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-moss-2 sm:inline" onClick={onSubmit}>
            {submitLabel}
          </button>
        )}
      </div>
      {lista}
    </div>
  );
}
