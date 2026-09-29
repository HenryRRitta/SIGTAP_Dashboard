import { Link } from "react-router-dom";

export function BrandMark({
  compact = false,
  onDark = false,
}: {
  compact?: boolean;
  onDark?: boolean;
}) {
  return (
    <Link
      to="/"
      className={`block shrink-0 ${onDark ? "rounded-lg bg-white p-1.5" : ""}`}
      aria-label="FluxSUS — Mesa SIGTAP"
    >
      <img
        src="/brand/logo-fluxsus.png"
        alt="FluxSUS — Processos em Saúde"
        className={compact ? "h-8 w-auto max-w-[2.25rem] object-contain" : "h-10 w-auto object-contain"}
      />
    </Link>
  );
}
