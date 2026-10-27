import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { BackLink } from "../components/BackLink";
import { FavoriteWithAlert } from "../components/Excludencia";
import { FavoritesSession } from "../components/FavoritesSession";
import { ProcedureCard } from "../components/ProcedureCard";
import { SearchBox } from "../components/SearchBox";
import { formatCode } from "../lib/format";
import type { Procedure } from "../lib/types";
import { useSigtap } from "../lib/store";

function bateFiltro(p: Procedure, termo: string) {
  const digits = termo.replace(/\D/g, "");
  return p.n.toLowerCase().includes(termo) || formatCode(p.c).includes(termo) || (digits.length >= 2 && p.c.includes(digits));
}

export function FavoritosPage() {
  const { pinned, mostUsed, byCode, usage, maps } = useSigtap();
  const [q, setQ] = useState("");
  const termo = q.trim().toLowerCase();

  const favoritos = useMemo(() => {
    const rows = pinned.map((c) => byCode(c)).filter((p): p is Procedure => Boolean(p));
    return termo ? rows.filter((p) => bateFiltro(p, termo)) : rows;
  }, [pinned, byCode, termo]);

  const usados = useMemo(() => {
    const rows = mostUsed
      .filter((c) => maps?.proc.has(c))
      .map((c) => byCode(c))
      .filter((p): p is Procedure => Boolean(p));
    const filtrados = termo ? rows.filter((p) => bateFiltro(p, termo)) : rows;
    return filtrados.slice(0, 24);
  }, [mostUsed, byCode, maps, termo]);

  return (
    <div className="mx-auto max-w-6xl">
      <BackLink to="/">Voltar à mesa</BackLink>
      <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.16em] text-moss uppercase">
        <Star size={14} fill="currentColor" aria-hidden="true" />
        Sessão permanente neste navegador
      </p>
      <h2 className="font-display mt-1 text-4xl">Favoritos e mais usados</h2>
      <p className="mt-2 max-w-2xl text-mute">
        Toque no card para abrir a ficha. A estrela guarda ou tira o procedimento. A lista fica neste computador, sem enviar nada.
      </p>

      <div className="mt-5">
        <SearchBox value={q} onChange={setQ} placeholder="Filtrar favoritos ou mais usados…" />
      </div>

      {!termo ? (
        <div className="mt-6">
          <FavoritesSession />
        </div>
      ) : (
        <section className="mt-8">
          <h3 className="font-display text-2xl">Favoritos com “{q.trim()}”</h3>
          {favoritos.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-mute">
              Nenhum favorito com esse filtro.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {favoritos.map((p) => (
                <ProcedureCard key={p.c} proc={p} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-10">
        <h3 className="font-display text-2xl">Histórico de uso</h3>
        <p className="mt-1 text-sm text-mute">Ordenado pelo número de vezes que a ficha foi aberta.</p>
        {usados.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-mute">
            {termo ? "Nenhum código usado combina com o filtro." : "Abra fichas de procedimento para montar este ranking."}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card shadow-card">
            {usados.map((p, i) => (
                <li key={p.c} className="flex items-center gap-2 px-2 py-1 hover:bg-mist">
                  <Link to={`/procedimento/${p.c}`} className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2">
                    <span className="tabular w-8 text-sm font-semibold text-mute">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="font-mono text-moss">{formatCode(p.c)}</span>
                      <span className="text-mute"> — </span>
                      <span className="font-medium">{p.n}</span>
                    </span>
                    <span className="tabular rounded-full bg-leaf px-2.5 py-0.5 text-xs font-semibold text-moss">
                      {usage[p.c] ?? 0}×
                    </span>
                  </Link>
                  <FavoriteWithAlert proc={p} />
                </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
