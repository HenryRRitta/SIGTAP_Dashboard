import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BackLink } from "../components/BackLink";
import { SearchBox } from "../components/SearchBox";
import { SearchResults, type SearchView } from "../components/SearchResults";
import { useSigtap } from "../lib/store";

const VIEW_KEY = "mesa-busca-view";

function readView(param: string | null): SearchView {
  if (param === "tabela") return "tabela";
  if (param === "cartoes") return "cartoes";
  try {
    return localStorage.getItem(VIEW_KEY) === "tabela" ? "tabela" : "cartoes";
  } catch {
    return "cartoes";
  }
}

export function SearchPage() {
  const { searchNome } = useSigtap();
  const [params, setParams] = useSearchParams();
  const termo = (params.get("q") ?? "").trim();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [view, setView] = useState<SearchView>(() => readView(params.get("view")));
  const hits = useMemo(() => (termo ? searchNome(termo) : []), [termo, searchNome]);

  function atualizar(nextQ: string, nextView = view) {
    const p = new URLSearchParams();
    if (nextQ.trim()) p.set("q", nextQ.trim());
    p.set("view", nextView);
    setParams(p, { replace: true });
  }

  function escolherView(next: SearchView) {
    setView(next);
    localStorage.setItem(VIEW_KEY, next);
    atualizar(q, next);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-mute">
        <Link to="/" className="hover:text-moss">
          Mesa
        </Link>
        <span>/</span>
        <span>Pesquisa</span>
        <span>/</span>
        <span className="text-ink">Resultados</span>
      </nav>
      <div className="mt-3">
        <BackLink to="/">Voltar à mesa</BackLink>
      </div>
      <h2 className="font-display mt-3 text-4xl">Resultados da pesquisa</h2>
      <p className="mt-2 text-mute">
        {termo
          ? `${hits.length.toLocaleString("pt-BR")} procedimento(s) encontrados na Tabela Unificada do SUS. Escolha cartões ou tabela.`
          : "Digite o nome, o código SIGTAP, um CID-10 ou um CBO."}
      </p>
      <div className="mt-6">
        <SearchBox
          value={q}
          onChange={setQ}
          onSubmit={() => atualizar(q)}
          autoFocus
          placeholder="Nome do procedimento, código, CID ou CBO"
        />
      </div>
      <SearchResults hits={hits} termo={termo} view={view} onViewChange={escolherView} />
    </div>
  );
}
