import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

export function SearchBox({
  value,
  onChange,
  onSubmit,
  autoFocus,
  placeholder = "Código, nome, CID-10 ou CBO",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 shadow-card"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <Search size={18} className="text-moss" />
      <input
        ref={ref}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[16px] outline-none placeholder:text-mute"
      />
      {onSubmit && (
        <button type="submit" className="hidden min-h-10 rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-moss-2 sm:inline">
          Buscar
        </button>
      )}
      {!onSubmit && <kbd className="hidden rounded border border-line px-1.5 font-mono text-[11px] text-mute md:inline">/</kbd>}
    </form>
  );
}
