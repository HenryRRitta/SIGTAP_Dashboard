import { Navigate, Route, Routes } from "react-router-dom";
import { BrandMark } from "./components/BrandMark";
import { Layout } from "./components/Layout";
import { useSigtap } from "./lib/store";
import { HomePage } from "./pages/Home";
import { CatalogPage } from "./pages/Catalog";
import { ProcedurePage } from "./pages/Procedure";
import { AuditPage } from "./pages/Audit";
import { CidPage } from "./pages/Cid";
import { CompatPage } from "./pages/Compat";
import { ImportPage } from "./pages/ImportData";
import { GlosaPage } from "./pages/Glosa";
import { ComparePage } from "./pages/Compare";
import { LotePage } from "./pages/Lote";
import { FilaPage } from "./pages/Fila";
import { RegrasPage } from "./pages/Regras";
import { SearchPage } from "./pages/Search";
import { PrintFichaPage } from "./pages/PrintFicha";
import { PrintParecerPage } from "./pages/PrintParecer";

function Splash({ error }: { error: string | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <BrandMark />
      <p className="font-mono mt-4 text-[11px] tracking-[0.22em] text-moss uppercase">Tabela unificada SUS</p>
      <h1 className="font-display mt-2 text-4xl text-moss">Mesa SIGTAP</h1>
      <p className="mt-3 max-w-md text-mute">
        {error ?? "Carregando competência 08/2026 e indexando procedimentos, CID, CBO e consistências…"}
      </p>
      {!error && <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-line">
        <div className="h-full w-1/2 animate-pulse bg-moss" />
      </div>}
    </div>
  );
}

export default function App() {
  const { loading, error, data } = useSigtap();
  if (loading || !data) return <Splash error={error} />;

  return (
    <Routes>
      <Route path="/print/ficha/:code" element={<PrintFichaPage />} />
      <Route path="/print/parecer/:code" element={<PrintParecerPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/pesquisa" element={<SearchPage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/procedimento/:code" element={<ProcedurePage />} />
        <Route path="/auditoria" element={<AuditPage />} />
        <Route path="/auditoria/:code" element={<AuditPage />} />
        <Route path="/lote" element={<LotePage />} />
        <Route path="/fila" element={<FilaPage />} />
        <Route path="/regras" element={<RegrasPage />} />
        <Route path="/glosas" element={<GlosaPage />} />
        <Route path="/glosas/:code" element={<GlosaPage />} />
        <Route path="/comparar" element={<ComparePage />} />
        <Route path="/cid" element={<CidPage />} />
        <Route path="/compat" element={<CompatPage />} />
        <Route path="/importar" element={<ImportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
