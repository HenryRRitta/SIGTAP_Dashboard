import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { formatCode, money } from "../lib/format";
import { useSigtap } from "../lib/store";
import { FavoriteButton } from "./FavoriteButton";

function Tile({ code, showUses = false }: { code: string; showUses?: boolean }) {
  const { byCode, usage } = useSigtap();
  const proc = byCode(code);
  if (!proc) return null;
  const vezes = usage[proc.c] ?? 0;

  return (
    <article className="relative min-h-[116px] rounded-xl border-2 border-moss/20 bg-card shadow-card transition hover:border-moss/55">
      <div className="absolute right-2 top-2 z-10">
        <FavoriteButton code={proc.c} />
      </div>
      <Link to={`/procedimento/${proc.c}`} className="block h-full p-4 pr-14">
        <p className="font-mono text-[13px] font-semibold text-moss">{formatCode(proc.c)}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">{proc.n}</h3>
        <p className="mt-2 text-sm text-mute">
          <span className="tabular font-medium text-ink">{money(proc.tot)}</span>
          {showUses && vezes > 0 ? ` · ${vezes}× nesta mesa` : null}
        </p>
      </Link>
    </article>
  );
}

function EmptyFavorites() {
  return (
    <div className="rounded-xl border border-dashed border-moss/35 bg-white/70 px-4 py-6 text-center">
      <Star size={22} className="mx-auto text-moss" aria-hidden="true" />
      <p className="mt-2 font-medium">Nenhum favorito ainda</p>
      <p className="mt-1 text-sm text-mute">
        Abra um procedimento e toque em <strong className="text-ink">Favoritar</strong>, ou na estrela do cartão.
      </p>
    </div>
  );
}

export function FavoritesSession({ compact = false }: { compact?: boolean }) {
  const { pinned, mostUsed, maps } = useSigtap();
  const favoritos = pinned.filter((c) => maps?.proc.has(c));
  const usados = mostUsed.filter((c) => maps?.proc.has(c) && !favoritos.includes(c));
  const favShow = compact ? favoritos.slice(0, 8) : favoritos;
  const usedShow = compact ? usados.slice(0, 6) : usados.slice(0, 16);

  return (
    <section className="rounded-xl border-2 border-moss/25 bg-leaf p-5 shadow-card md:p-6" aria-labelledby="sessao-favoritos">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.16em] text-moss uppercase">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            Acesso rápido
          </p>
          <h2 id="sessao-favoritos" className="font-display mt-1 text-2xl md:text-3xl">
            Favoritos
          </h2>
          <p className="mt-1 max-w-xl text-sm text-mute">
            {favoritos.length
              ? `${favoritos.length} procedimento${favoritos.length === 1 ? "" : "s"} à mão para auditoria.`
              : "Guarde aqui os códigos que você mais consiste."}
          </p>
        </div>
        {compact && (
          <Link
            to="/favoritos"
            className="inline-flex min-h-11 items-center rounded-xl bg-moss px-4 py-2 text-sm font-medium text-white hover:bg-moss-2"
          >
            Abrir sessão
          </Link>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {favShow.length ? favShow.map((c) => <Tile key={c} code={c} />) : <div className="sm:col-span-2 lg:col-span-4"><EmptyFavorites /></div>}
      </div>
      {compact && favoritos.length > favShow.length && (
        <p className="mt-3 text-sm text-moss">
          <Link to="/favoritos" className="font-medium hover:underline">
            +{favoritos.length - favShow.length} na sessão completa
          </Link>
        </p>
      )}

      {usedShow.length > 0 && (
        <div className="mt-6 border-t border-moss/20 pt-5">
          <h3 className="font-display text-xl">Mais usados</h3>
          <p className="mt-1 text-sm text-mute">Contagem das fichas que você abriu neste navegador.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {usedShow.map((c) => (
              <Tile key={c} code={c} showUses />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
