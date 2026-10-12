import type { Procedure, SigtapData } from "./types";
import { relOf } from "./format";

export type CategoriaConsulta = "todos" | "procedimentos" | "medicamentos" | "opm";

export type FiltroConsulta = {
  categoria: CategoriaConsulta;
  texto: string;
  grupo: string;
  subgrupo: string;
  forma: string;
  complexidade: string;
  financiamento: string;
  instrumento: string;
};

export const GRUPO_MEDICAMENTOS = "06";
export const GRUPO_OPM = "07";
export const PAGE_SIZE = 15;

export function categoriaDoGrupo(grupo: string): CategoriaConsulta {
  if (grupo === GRUPO_MEDICAMENTOS) return "medicamentos";
  if (grupo === GRUPO_OPM) return "opm";
  return "procedimentos";
}

export function naCategoria(proc: Procedure, categoria: CategoriaConsulta) {
  if (categoria === "todos") return true;
  if (categoria === "medicamentos") return proc.g === GRUPO_MEDICAMENTOS;
  if (categoria === "opm") return proc.g === GRUPO_OPM;
  return proc.g !== GRUPO_MEDICAMENTOS && proc.g !== GRUPO_OPM;
}

export function resumoCompetencia(data: SigtapData, modalidadeNome: (cod: string) => string | undefined) {
  const medicamentos = data.meta.porGrupo[GRUPO_MEDICAMENTOS] ?? 0;
  const opm = data.meta.porGrupo[GRUPO_OPM] ?? 0;
  const procedimentos = Math.max(0, data.meta.totalProcedimentos - medicamentos - opm);
  let ambulatorial = 0;
  let hospitalar = 0;
  for (const proc of data.procedures) {
    let amb = false;
    let hosp = false;
    for (const m of relOf(proc).modalidades) {
      const nome = (modalidadeNome(m) ?? "").toLowerCase();
      if (nome.includes("hospital")) hosp = true;
      else if (nome.includes("ambulat")) amb = true;
    }
    if (amb) ambulatorial += 1;
    if (hosp) hospitalar += 1;
  }
  return {
    total: data.meta.totalProcedimentos,
    procedimentos,
    medicamentos,
    opm,
    ambulatorial,
    hospitalar,
    altaComplexidade: data.meta.porComplexidade["3"] ?? 0,
  };
}

export function filtrarProcedimentos(
  procedures: Procedure[],
  filtro: FiltroConsulta,
  buscar: (q: string) => Procedure[],
): Procedure[] {
  const texto = filtro.texto.trim();
  let rows = texto ? buscar(texto) : procedures;

  rows = rows.filter((p) => naCategoria(p, filtro.categoria));
  if (filtro.grupo) rows = rows.filter((p) => p.g === filtro.grupo);
  if (filtro.subgrupo) rows = rows.filter((p) => p.sg === filtro.subgrupo);
  if (filtro.forma) rows = rows.filter((p) => p.fo === filtro.forma);
  if (filtro.complexidade) rows = rows.filter((p) => p.cx === filtro.complexidade);
  if (filtro.financiamento) rows = rows.filter((p) => p.fin === filtro.financiamento);
  if (filtro.instrumento) rows = rows.filter((p) => relOf(p).registros.includes(filtro.instrumento));
  return rows;
}

export function tituloCategoria(categoria: CategoriaConsulta) {
  if (categoria === "medicamentos") return "Medicamentos encontrados";
  if (categoria === "opm") return "OPM encontradas";
  if (categoria === "procedimentos") return "Procedimentos encontrados";
  return "Registros encontrados";
}
