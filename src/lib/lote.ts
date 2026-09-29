import type { AuditCheck, AuditInput, Procedure } from "./types";
import { digits } from "./format";
import { auditScore, runAudit, runLocalChecks } from "./audit";
import { parecerAutomatico } from "./glosa";
import { findCnes, findTeto } from "./local";

export type ContaLote = {
  linha: number;
  procedimento: string;
  sexo: AuditInput["sexo"];
  idadeAnos: string;
  idadeMeses: string;
  cid: string;
  cbo: string;
  registro: string;
  quantidade: string;
  cnes: string;
  documento: string;
  usuario: string;
  cns: string;
  leito: string;
  valor: string;
  bruto: Record<string, string>;
};

export type ResultadoLote = ContaLote & {
  proc?: Procedure;
  checks: AuditCheck[];
  fail: number;
  warn: number;
  ok: number;
  conclusao: "conforme" | "glosar" | "diligenciar";
};

const ALIAS: Record<string, string> = {
  procedimento: "procedimento",
  codigo: "procedimento",
  codigo_sigtap: "procedimento",
  co_procedimento: "procedimento",
  proc: "procedimento",
  procedimento_id: "procedimento",
  proc_realizado: "procedimento",
  sexo: "sexo",
  tp_sexo: "sexo",
  sexo_usuario: "sexo",
  idade: "idadeAnos",
  idade_anos: "idadeAnos",
  nu_idade: "idadeAnos",
  idadeanos: "idadeAnos",
  idade_meses: "idadeMeses",
  meses: "idadeMeses",
  tp_idade: "tpIdade",
  cid: "cid",
  cid10: "cid",
  cid_principal: "cid",
  diagnostico: "cid",
  co_cid: "cid",
  cbo: "cbo",
  ocupacao: "cbo",
  cbo_executante: "cbo",
  registro: "registro",
  instrumento: "registro",
  tp_registro: "registro",
  instrumento_registro: "registro",
  quantidade: "quantidade",
  qtd: "quantidade",
  qt: "quantidade",
  qt_procedimento: "quantidade",
  cnes: "cnes",
  co_cnes: "cnes",
  documento: "documento",
  aih: "documento",
  apac: "documento",
  nu_aih: "documento",
  nu_apac: "documento",
  numero: "documento",
  usuario: "usuario",
  paciente: "usuario",
  nome: "usuario",
  nome_usuario: "usuario",
  cns: "cns",
  cpf: "cns",
  nu_cns: "cns",
  leito: "leito",
  tipo_leito: "leito",
  co_leito: "leito",
  valor: "valor",
  vl_total: "valor",
  valor_apresentado: "valor",
};

function normHeader(h: string) {
  return h
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function parseCsvText(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const first = src.split(/\r?\n/, 1)[0] ?? "";
  const semi = (first.match(/;/g) ?? []).length;
  const comma = (first.match(/,/g) ?? []).length;
  const delim = semi > comma ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.trim());
      if (row.some((c) => c)) rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) {
    row.push(cell.trim());
    if (row.some((c) => c)) rows.push(row);
  }
  return rows;
}

function sexoDe(v: string): AuditInput["sexo"] {
  const s = v.trim().toUpperCase();
  if (s.startsWith("M") || s === "1") return "M";
  if (s.startsWith("F") || s === "3") return "F";
  return "";
}

function registroDe(v: string): string {
  const d = digits(v);
  if (d.length === 1) return d.padStart(2, "0");
  if (d.length >= 2) return d.slice(0, 2);
  const t = v.trim().toUpperCase();
  if (t.includes("BPA-C") || t === "BPA C") return "01";
  if (t.includes("BPA-I") || t.includes("BPAI")) return "02";
  if (t.includes("AIH")) return "03";
  if (t.includes("APAC")) return "06";
  if (t.includes("RAAS")) return "08";
  return "";
}

function rowToConta(map: Record<string, string>, linha: number): ContaLote {
  const get = (k: string) => map[k] ?? "";
  let idadeAnos = digits(get("idadeAnos"));
  let idadeMeses = digits(get("idadeMeses"));
  const tp = get("tpIdade");
  if (tp === "2" && idadeAnos) {
    const dias = Number(idadeAnos);
    idadeAnos = "0";
    idadeMeses = String(Math.floor(dias / 30));
  } else if (tp === "3" && idadeAnos && !idadeMeses) {
    idadeMeses = idadeAnos;
    idadeAnos = "0";
  }
  return {
    linha,
    procedimento: digits(get("procedimento")),
    sexo: sexoDe(get("sexo")),
    idadeAnos,
    idadeMeses,
    cid: get("cid").trim().toUpperCase().replace(".", ""),
    cbo: digits(get("cbo")),
    registro: registroDe(get("registro")),
    quantidade: digits(get("quantidade")) || get("quantidade").trim(),
    cnes: digits(get("cnes")),
    documento: get("documento"),
    usuario: get("usuario"),
    cns: digits(get("cns")),
    leito: digits(get("leito")),
    valor: get("valor").replace(/\./g, "").replace(",", "."),
    bruto: map,
  };
}

export function parseContas(text: string): ContaLote[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("<") || trimmed.includes("<?xml")) return parseXmlContas(trimmed);
  const rows = parseCsvText(trimmed);
  const headerRow = rows[0];
  if (!headerRow || rows.length < 2) return [];
  const headers = headerRow.map(normHeader);
  const keys = headers.map((h) => ALIAS[h] ?? h);
  const out: ContaLote[] = [];
  for (let i = 1; i < rows.length; i++) {
    const map: Record<string, string> = {};
    const line = rows[i];
    if (!line) continue;
    line.forEach((cell, idx) => {
      const key = keys[idx];
      if (key) map[key] = cell;
    });
    out.push(rowToConta(map, i + 1));
  }
  return out;
}

function flatten(el: Element, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const attr of el.attributes) {
    out[normHeader(attr.name)] = attr.value;
  }
  const children = [...el.children];
  if (children.length === 0) {
    const key = prefix || normHeader(el.tagName);
    if (el.textContent?.trim()) out[key] = el.textContent.trim();
    return out;
  }
  for (const child of children) {
    Object.assign(out, flatten(child, normHeader(child.tagName)));
  }
  return out;
}

function parseXmlContas(text: string): ContaLote[] {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("XML inválido.");
  const counts = new Map<string, Element[]>();
  const walk = (el: Element) => {
    if (el.children.length) {
      const list = counts.get(el.tagName) ?? [];
      list.push(el);
      counts.set(el.tagName, list);
      for (const c of el.children) walk(c);
    }
  };
  walk(doc.documentElement);
  const candidate = [...counts.entries()]
    .filter(([, els]) => els.length > 1 && (els[0]?.children.length ?? 0) > 0)
    .sort((a, b) => b[1].length - a[1].length)[0];
  const nodes = candidate?.[1] ?? [doc.documentElement];
  return nodes.map((el, i) => {
    const flat = flatten(el);
    const mapped: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) mapped[ALIAS[k] ?? k] = v;
    return rowToConta(mapped, i + 1);
  });
}

export function consistirLote(contas: ContaLote[], byCode: (c: string) => Procedure | undefined): ResultadoLote[] {
  return contas.map((conta) => {
    const proc = conta.procedimento ? byCode(conta.procedimento) : undefined;
    if (!proc) {
      const checks: AuditCheck[] = [
        {
          id: "codigo",
          titulo: "Procedimento",
          status: "fail",
          detalhe: conta.procedimento
            ? `Código ${conta.procedimento} não existe nesta competência.`
            : "Linha sem código de procedimento.",
        },
      ];
      return { ...conta, checks, fail: 1, warn: 0, ok: 0, conclusao: "glosar" };
    }
    const input: AuditInput = {
      sexo: conta.sexo,
      idadeAnos: conta.idadeAnos,
      idadeMeses: conta.idadeMeses,
      cid: conta.cid,
      cbo: conta.cbo,
      registro: conta.registro,
      quantidade: conta.quantidade,
    };
    const valor = conta.valor.trim() === "" ? null : Number(conta.valor);
    const checks = [
      ...runAudit(proc, input),
      ...runLocalChecks(proc, {
        cnes: conta.cnes,
        leito: conta.leito,
        valor: valor !== null && !Number.isNaN(valor) ? valor : null,
        estabelecimento: conta.cnes ? findCnes(conta.cnes) ?? null : undefined,
        teto: findTeto(proc.c),
        quantidade: conta.quantidade,
      }),
    ];
    const score = auditScore(checks);
    return {
      ...conta,
      proc,
      checks,
      fail: score.fail,
      warn: score.warn,
      ok: score.ok,
      conclusao: parecerAutomatico(checks),
    };
  });
}

export const MODELO_CSV = `procedimento;sexo;idade_anos;cid;cbo;registro;quantidade;cnes;documento;usuario;leito;valor
0411010034;F;28;O820;225125;03;1;2077469;1234567890123;Maria Silva;01;545.73
0411010034;F;5;O820;225125;03;1;2077469;1234567890124;Ana Costa;01;545.73
0207030057;F;64;C61;225320;06;1;2077469;APAC0001;Helena Souza;;1200
0202040194;M;41;I10;225125;02;1;2077469;BPA0002;João Lima;;155.96
0301010072;M;50;;225125;03;1;2077469;AIH0003;Carlos Nunes;;10
0411010034;F;32;O820;225125;03;3;2077469;1234567890125;Paula Dias;01;1637.19
`;
