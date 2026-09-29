import type { Procedure } from "./types";

export function digits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCode(code: string): string {
  const d = digits(code);
  if (d.length !== 10) return code.trim();
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 6)}.${d.slice(6, 9)}-${d[9]}`;
}

export function normalizeQuery(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function looksLikeCode(value: string): boolean {
  const d = digits(value);
  return d.length >= 8 && d.length <= 10;
}

export function looksLikeCid(value: string): boolean {
  return /^[a-zA-Z]\d{2,3}[a-zA-Z0-9]?$/.test(value.trim());
}

export function looksLikeCbo(value: string): boolean {
  const d = digits(value);
  return d.length === 6 && !looksLikeCode(value);
}

export function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function compactInt(value: number): string {
  return value.toLocaleString("pt-BR");
}

export function emptyRel() {
  return {
    cidsP: [] as string[],
    cidsS: [] as string[],
    cbos: [] as string[],
    registros: [] as string[],
    modalidades: [] as string[],
    detalhes: [] as string[],
    habilitacoes: [],
    leitos: [] as string[],
    servicos: [],
    compat: [],
    excecoes: [],
    incrementos: [],
    regras: [] as string[],
    renases: [] as string[],
    tuss: [] as string[],
    origem: [] as string[],
    siaSih: [],
    redes: [] as string[],
  };
}

export function relOf(proc?: Procedure) {
  return proc?.rel ?? emptyRel();
}

export const COMPLEX_TONE: Record<string, string> = {
  "0": "bg-neutral-bg text-neutral",
  "1": "bg-success-bg text-success",
  "2": "bg-info-bg text-info",
  "3": "bg-warning-bg text-warning",
};

export const COMPAT_LABEL: Record<string, string> = {
  "1": "Compatível",
  "2": "Excludente",
  "3": "Concomitante",
  "4": "Sequencial",
  "5": "Obrigatória",
};

export const COMPAT_TONE: Record<string, string> = {
  "1": "bg-success-bg text-success",
  "2": "bg-danger-bg text-danger",
  "3": "bg-info-bg text-info",
  "4": "bg-leaf text-moss",
  "5": "bg-warning-bg text-warning",
};
