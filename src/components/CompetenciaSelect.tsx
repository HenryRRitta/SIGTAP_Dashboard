import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  baixarCompetenciasAno,
  carregarTabelaCompetencia,
  listarCompetenciasAno,
  type CatalogoItem,
} from "../lib/competenciaApi";
import { pushSerie } from "../lib/local";
import { useSigtap } from "../lib/store";
import type { SigtapData } from "../lib/types";

const ANO = "2026";
const BAIXAR = "baixar-ano";
const IMPORTAR = "importar";

export function CompetenciaSelect() {
  const { data, replaceData } = useSigtap();
  const navigate = useNavigate();
  const [locais, setLocais] = useState<CatalogoItem[]>([]);
  const [faltando, setFaltando] = useState(0);
  const [busy, setBusy] = useState("");
  const [switching, setSwitching] = useState(false);
  const [erro, setErro] = useState("");
  const baixando = useRef(false);
  const auto = useRef(false);

  const atual = data?.meta.competencia ?? "";

  async function recarregarLista() {
    const lista = await listarCompetenciasAno(ANO);
    const rows = [...lista.locais];
    if (data?.meta.competencia && !rows.some((row) => row.competencia === data.meta.competencia)) {
      rows.unshift({
        competencia: data.meta.competencia,
        label: data.meta.competenciaLabel,
        arquivo: data.meta.arquivo,
        totalProcedimentos: data.meta.totalProcedimentos,
        atualizadoEm: data.meta.importadoEm ?? "",
      });
    }
    rows.sort((a, b) => b.competencia.localeCompare(a.competencia));
    setLocais(rows);
    setFaltando(lista.faltando.length);
    if (lista.erro) setErro(lista.erro);
    return lista;
  }

  async function baixarTodas() {
    if (baixando.current) return;
    baixando.current = true;
    setErro("");
    setBusy("Consultando o FTP do DATASUS…");
    try {
      await baixarCompetenciasAno(ANO, (evento) => {
        if (evento.etapa === "baixando" && evento.label && evento.i && evento.n) {
          setBusy(`Baixando ${evento.label} (${evento.i}/${evento.n})`);
        } else if (evento.etapa === "fim") {
          setBusy("");
          setFaltando(0);
        }
      });
      await recarregarLista();
      setBusy("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao baixar as competências de 2026.");
      setBusy("");
    } finally {
      baixando.current = false;
    }
  }

  useEffect(() => {
    let cancel = false;
    recarregarLista()
      .then((lista) => {
        if (cancel) return;
        if (lista.faltando.length && !auto.current) {
          auto.current = true;
          void baixarTodas();
        }
      })
      .catch((err: unknown) => {
        if (!cancel) setErro(err instanceof Error ? err.message : "Não foi possível listar as competências.");
      });
    return () => {
      cancel = true;
    };
  }, [data?.meta.competencia]);

  async function onChange(value: string) {
    if (value === IMPORTAR) {
      navigate("/importar");
      return;
    }
    if (value === BAIXAR) {
      void baixarTodas();
      return;
    }
    if (!value || value === atual) return;
    setErro("");
    setSwitching(true);
    setBusy(`Carregando ${value.slice(4)}/${value.slice(0, 4)}…`);
    try {
      const tabela = (await carregarTabelaCompetencia(value)) as unknown as SigtapData;
      if (!tabela.meta?.competencia || !Array.isArray(tabela.procedures)) {
        throw new Error("O arquivo local desta competência está incompleto.");
      }
      replaceData(tabela);
      pushSerie({
        competencia: tabela.meta.competencia,
        label: tabela.meta.competenciaLabel,
        total: tabela.meta.totalProcedimentos,
        soma: tabela.meta.somaValoresReferencia,
      });
      setBusy("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível abrir esta competência.");
      setBusy("");
    } finally {
      setSwitching(false);
    }
  }

  const opcoes = locais.length
    ? locais
    : data
      ? [
          {
            competencia: data.meta.competencia,
            label: data.meta.competenciaLabel,
          },
        ]
      : [];

  return (
    <div className="flex items-center gap-2">
    <label className="grid">
      <span className="sr-only">Competência</span>
      <select
        aria-label="Competência"
        aria-busy={Boolean(busy)}
        disabled={switching}
        className="max-w-[11rem] rounded-md border border-[#87a2c5] bg-navy px-2 py-2 text-[12px] text-white sm:max-w-none sm:text-[13px]"
        value={atual}
        title={erro || busy || "Competência da Tabela Unificada"}
        onChange={(e) => void onChange(e.target.value)}
      >
        {opcoes.map((item) => (
          <option key={item.competencia} value={item.competencia}>
            {item.label}
          </option>
        ))}
        {faltando > 0 && (
          <option value={BAIXAR}>{busy ? busy : `Baixar todas de ${ANO} (${faltando} faltando)`}</option>
        )}
        <option value={IMPORTAR}>Importar outra…</option>
      </select>
    </label>
      {busy ? <span className="hidden max-w-[10rem] truncate text-[10px] text-[#b9cae4] xl:inline">{busy}</span> : null}
    </div>
  );
}
