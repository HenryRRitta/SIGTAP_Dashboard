import { Outlet, useLocation } from "react-router-dom";
import { IntegrityBar } from "./IntegrityBar";
import { TopNav } from "./TopNav";

export function Layout() {
  const loc = useLocation();
  const isWorkspace = loc.pathname === "/";

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <TopNav />
      <main id="main-content" tabIndex={-1} className="workspace-main" data-path={loc.pathname}>
        <Outlet />
        {!isWorkspace && loc.pathname !== "/importar" && <IntegrityBar />}
      </main>
    </div>
  );
}
