import type { AuditCheck, AuditInput, Procedure } from "./types";

export type AuditorProfile = {
  nome: string;
  orgao: string;
  cargo: string;
};

export type ParecerPayload = {
  code: string;
  input: AuditInput;
  checks: AuditCheck[];
  conclusao: "conforme" | "glosar" | "diligenciar";
  observacao: string;
  usuario: string;
  cns: string;
  estabelecimento: string;
  cnes: string;
  documento: string;
  competenciaProducao: string;
};

const PROFILE_KEY = "mesa-auditor-profile";
const PRINT_KEY = "mesa-print-payload";
const NOTES_KEY = "mesa-notes";

export function readProfile(): AuditorProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as AuditorProfile;
  } catch {
    /* ignore */
  }
  return { nome: "", orgao: "", cargo: "Médico auditor SUS" };
}

export function saveProfile(profile: AuditorProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function readNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveNote(code: string, note: string) {
  const all = readNotes();
  if (note.trim()) all[code] = note;
  else delete all[code];
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
}

export function stashPrint(payload: ParecerPayload) {
  sessionStorage.setItem(PRINT_KEY, JSON.stringify(payload));
}

export function takePrint(): ParecerPayload | null {
  try {
    const raw = sessionStorage.getItem(PRINT_KEY);
    return raw ? (JSON.parse(raw) as ParecerPayload) : null;
  } catch {
    return null;
  }
}

export function openPrint(path: string) {
  const url = `${window.location.origin}${path}${path.includes("?") ? "&" : "?"}autoprint=1`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function copyText(text: string) {
  return navigator.clipboard.writeText(text);
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const body = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function fichaResumo(proc: Procedure, competencia: string) {
  return [
    `SIGTAP ${formatInline(proc.c)} — ${proc.n}`,
    `Competência ${competencia}`,
    `Complexidade ${proc.cx} · Sexo ${proc.sx} · Idade ${proc.iminL ?? "–"} a ${proc.imaxL ?? "–"}`,
    `SH ${proc.sh} · SA ${proc.sa} · SP ${proc.sp} · Total ${proc.tot}`,
    `Qtd máx. ${proc.qmax ?? "N/A"} · Permanência ${proc.perm ?? "N/A"}`,
  ].join("\n");
}

function formatInline(code: string) {
  return `${code.slice(0, 2)}.${code.slice(2, 4)}.${code.slice(4, 6)}.${code.slice(6, 9)}-${code[9]}`;
}
