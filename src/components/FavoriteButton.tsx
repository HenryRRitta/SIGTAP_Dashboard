import { Star } from "lucide-react";
import { useSigtap } from "../lib/store";

export function FavoriteButton({
  code,
  label = false,
  className = "",
}: {
  code: string;
  label?: boolean;
  className?: string;
}) {
  const { pin, pinned } = useSigtap();
  const on = pinned.includes(code);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      title={on ? "Remover dos favoritos" : "Favoritar"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        pin(code);
      }}
      className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border text-sm font-medium transition-colors ${
        on
          ? "border-moss bg-moss text-white"
          : "border-line bg-card text-moss hover:border-moss/50 hover:bg-leaf"
      } ${label ? "px-3 py-2" : "h-11 w-11"} ${className}`}
    >
      <Star size={16} fill={on ? "currentColor" : "none"} aria-hidden="true" />
      {label ? (on ? "Favorito" : "Favoritar") : null}
    </button>
  );
}
