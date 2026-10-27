import { useEffect, useRef } from "react";
import { TypeaheadField, type TypeaheadHit, type TypeaheadSource } from "./TypeaheadField";

export function SearchBox({
  value,
  onChange,
  onSubmit,
  onPick,
  autoFocus,
  placeholder = "Código, nome, CID-10 ou CBO",
  source = "procedimentos",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onPick?: (hit: TypeaheadHit) => void;
  autoFocus?: boolean;
  placeholder?: string;
  source?: TypeaheadSource;
}) {
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        ref.current?.querySelector("input")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      ref={ref}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <TypeaheadField
        variant="box"
        source={source}
        value={value}
        onChange={onChange}
        onPick={onPick}
        onSubmit={onSubmit}
        autoFocus={autoFocus}
        placeholder={placeholder}
      />
    </form>
  );
}
