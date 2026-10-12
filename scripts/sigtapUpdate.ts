import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync, gunzipSync } from "node:zlib";
import type { Plugin } from "vite";
import { parseSigtapZip } from "../src/lib/parseZip";
import type { SigtapData } from "../src/lib/types";

export type CompetenciaRemota = {
  competencia: string;
  label: string;
  arquivo: string;
  url: string;
  pubDate: string;
};

export type CatalogoItem = {
  competencia: string;
  label: string;
  arquivo: string;
  totalProcedimentos: number;
  atualizadoEm: string;
};

const RSS_URLS = [
  "http://sigtap.datasus.gov.br/tabela-unificada/competencias.rss",
  "http://tabela-unificada.datasus.gov.br/tabela-unificada/competencias.rss",
];

const FTP_DIR = "ftp://ftp2.datasus.gov.br/pub/sistemas/tup/downloads";
const ROOT = process.cwd();
const ZIP_DIR = path.join(ROOT, "data", "zips");
const COMP_DIR = path.join(ROOT, "data", "competencias");
const INDEX_PATH = path.join(COMP_DIR, "index.json");

function competenciaDeArquivo(arquivo: string) {
  const m = arquivo.match(/TabelaUnificada_(\d{6})/i);
  return m?.[1] ?? "";
}

function labelDe(competencia: string) {
  return competencia.length === 6 ? `${competencia.slice(4)}/${competencia.slice(0, 4)}` : competencia;
}

function remotoDeArquivo(arquivo: string, pubDate = ""): CompetenciaRemota | null {
  const competencia = competenciaDeArquivo(arquivo);
  if (!competencia) return null;
  return {
    competencia,
    label: labelDe(competencia),
    arquivo,
    url: `${FTP_DIR}/${arquivo}`,
    pubDate,
  };
}

function latestPorCompetencia(arquivos: string[], ano?: string): CompetenciaRemota[] {
  const map = new Map<string, CompetenciaRemota>();
  for (const arquivo of arquivos) {
    const item = remotoDeArquivo(arquivo);
    if (!item) continue;
    if (ano && !item.competencia.startsWith(ano)) continue;
    const prev = map.get(item.competencia);
    if (!prev || item.arquivo.localeCompare(prev.arquivo) > 0) map.set(item.competencia, item);
  }
  return [...map.values()].sort((a, b) => b.competencia.localeCompare(a.competencia));
}

function parseRss(xml: string): CompetenciaRemota[] {
  const items: CompetenciaRemota[] = [];
  const blocos = xml.split(/<item>/i).slice(1);
  for (const bloco of blocos) {
    const title = bloco.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "";
    const url = bloco.match(/<link>([^<]*)<\/link>/i)?.[1]?.trim() ?? "";
    const pubDate = bloco.match(/<pubDate>([^<]*)<\/pubDate>/i)?.[1] ?? "";
    if (!url.includes("TabelaUnificada_") || !url.toLowerCase().endsWith(".zip")) continue;
    const arquivo = decodeURIComponent(url.split("/").pop() ?? "");
    const competencia = competenciaDeArquivo(arquivo);
    if (!competencia) continue;
    items.push({
      competencia,
      label: title.match(/(\d{2}\/\d{4})/)?.[1] ?? labelDe(competencia),
      arquivo,
      url,
      pubDate,
    });
  }
  return items.sort((a, b) => b.competencia.localeCompare(a.competencia) || b.arquivo.localeCompare(a.arquivo));
}

export async function listarCompetenciasRemotas(): Promise<CompetenciaRemota[]> {
  let lastErr = "RSS do DATASUS indisponível.";
  for (const url of RSS_URLS) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8" },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) {
        lastErr = `RSS HTTP ${res.status} em ${url}`;
        continue;
      }
      const xml = await res.text();
      const items = parseRss(xml);
      if (items.length) return items;
      lastErr = `RSS sem itens de TabelaUnificada em ${url}`;
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(lastErr);
}

function curlBin() {
  return process.platform === "win32" ? "curl.exe" : "curl";
}

function runCurl(args: string[]) {
  return new Promise<{ code: number; out: string; err: string }>((resolve, reject) => {
    const child = spawn(curlBin(), args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (buf: Buffer) => {
      out += buf.toString();
    });
    child.stderr.on("data", (buf: Buffer) => {
      err += buf.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, out, err }));
  });
}

function baixarComCurl(url: string, dest: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(curlBin(), ["-L", "--fail", "--max-time", "180", "-o", dest, url], {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    });
    let err = "";
    child.stderr.on("data", (buf: Buffer) => {
      err += buf.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err.trim() || `curl saiu com código ${code}`));
    });
  });
}

async function baixarFtp(url: string, dest: string) {
  try {
    await baixarComCurl(url, dest);
    return;
  } catch (err) {
    const httpUrl = url.replace(/^ftp:\/\//i, "http://");
    if (httpUrl === url) throw err;
    await baixarComCurl(httpUrl, dest);
  }
}

async function listarFtpArquivos(): Promise<string[]> {
  const result = await runCurl(["-sS", "--list-only", "--max-time", "60", `${FTP_DIR}/`]);
  if (result.code !== 0) {
    throw new Error(result.err.trim() || "Não foi possível listar o FTP do DATASUS.");
  }
  return result.out
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^TabelaUnificada_\d{6}.*\.zip$/i.test(line));
}

export async function listarCompetenciasDoAno(ano: string): Promise<CompetenciaRemota[]> {
  try {
    const arquivos = await listarFtpArquivos();
    const doAno = latestPorCompetencia(arquivos, ano);
    if (doAno.length) return doAno;
  } catch {
    /* RSS cobre só os meses mais recentes; o FTP é a lista completa. */
  }
  const rss = await listarCompetenciasRemotas();
  const map = new Map<string, CompetenciaRemota>();
  for (const item of rss) {
    if (!item.competencia.startsWith(ano)) continue;
    const prev = map.get(item.competencia);
    if (!prev || item.arquivo.localeCompare(prev.arquivo) > 0) map.set(item.competencia, item);
  }
  return [...map.values()].sort((a, b) => b.competencia.localeCompare(a.competencia));
}

async function lerCatalogo(): Promise<CatalogoItem[]> {
  try {
    const parsed = JSON.parse(await readFile(INDEX_PATH, "utf8")) as { itens?: CatalogoItem[] };
    return Array.isArray(parsed.itens) ? parsed.itens : [];
  } catch {
    return [];
  }
}

async function gravarCatalogo(itens: CatalogoItem[]) {
  await mkdir(COMP_DIR, { recursive: true });
  const uniq = [...new Map(itens.map((item) => [item.competencia, item])).values()].sort((a, b) =>
    b.competencia.localeCompare(a.competencia),
  );
  await writeFile(INDEX_PATH, JSON.stringify({ itens: uniq }, null, 2));
}

async function upsertCatalogo(item: CatalogoItem) {
  const itens = await lerCatalogo();
  await gravarCatalogo([...itens.filter((row) => row.competencia !== item.competencia), item]);
}

function gzPath(competencia: string) {
  return path.join(COMP_DIR, `${competencia}.json.gz`);
}

async function sincronizarEmpacotada() {
  const jsonPath = path.join(ROOT, "public", "data", "sigtap.json");
  if (!existsSync(jsonPath)) return;
  const raw = await readFile(jsonPath, "utf8");
  let data: SigtapData;
  try {
    data = JSON.parse(raw) as SigtapData;
  } catch {
    return;
  }
  const competencia = data.meta?.competencia;
  if (!competencia) return;
  const dest = gzPath(competencia);
  const cat = (await lerCatalogo()).find((row) => row.competencia === competencia);
  if (cat && existsSync(dest) && cat.arquivo === data.meta.arquivo) return;
  await mkdir(COMP_DIR, { recursive: true });
  await writeFile(dest, gzipSync(Buffer.from(raw)));
  await upsertCatalogo({
    competencia,
    label: data.meta.competenciaLabel,
    arquivo: data.meta.arquivo,
    totalProcedimentos: data.meta.totalProcedimentos,
    atualizadoEm: data.meta.importadoEm ?? new Date().toISOString(),
  });
}

async function garantirTabela(item: CompetenciaRemota): Promise<{ skipped: boolean; item: CatalogoItem }> {
  const dest = gzPath(item.competencia);
  const cat = (await lerCatalogo()).find((row) => row.competencia === item.competencia);
  if (cat && cat.arquivo === item.arquivo && existsSync(dest)) {
    return { skipped: true, item: cat };
  }

  await mkdir(ZIP_DIR, { recursive: true });
  const zipPath = path.join(ZIP_DIR, item.arquivo);
  if (!existsSync(zipPath)) await baixarFtp(item.url, zipPath);

  const buf = await readFile(zipPath);
  if (buf[0] !== 0x50 || buf[1] !== 0x4b) {
    throw new Error(`O arquivo ${item.arquivo} não é um ZIP da Tabela Unificada.`);
  }

  const data = await parseSigtapZip(buf, undefined, { arquivo: item.arquivo, origemUrl: item.url });
  await mkdir(COMP_DIR, { recursive: true });
  await writeFile(dest, gzipSync(Buffer.from(JSON.stringify(data))));
  const saved: CatalogoItem = {
    competencia: data.meta.competencia,
    label: data.meta.competenciaLabel,
    arquivo: data.meta.arquivo,
    totalProcedimentos: data.meta.totalProcedimentos,
    atualizadoEm: data.meta.importadoEm ?? new Date().toISOString(),
  };
  await upsertCatalogo(saved);
  return { skipped: false, item: saved };
}

export function temNovaCompetencia(atual: { competencia?: string; arquivo?: string } | undefined, latest: CompetenciaRemota) {
  const comp = atual?.competencia ?? "";
  const arq = atual?.arquivo ?? "";
  if (!comp) return true;
  if (latest.competencia > comp) return true;
  if (latest.competencia === comp && latest.arquivo && arq && latest.arquivo !== arq) return true;
  return false;
}

export async function atualizarCompetenciaNoDisco(atual?: { competencia?: string; arquivo?: string }): Promise<{
  unchanged: boolean;
  latest: CompetenciaRemota;
  data?: SigtapData;
  saved?: { zip: string; json: string; gz: string };
}> {
  const lista = await listarCompetenciasRemotas();
  const latest = lista[0];
  if (!latest) throw new Error("O RSS oficial do DATASUS não listou nenhuma competência.");
  if (!temNovaCompetencia(atual, latest)) {
    return { unchanged: true, latest };
  }

  await garantirTabela(latest);
  const jsonBuf = gunzipSync(await readFile(gzPath(latest.competencia)));
  const jsonPath = path.join(ROOT, "public", "data", "sigtap.json");
  const publicGz = path.join(ROOT, "public", "data", "sigtap.json.gz");
  await writeFile(jsonPath, jsonBuf);
  await writeFile(publicGz, gzipSync(jsonBuf));
  const data = JSON.parse(jsonBuf.toString("utf8")) as SigtapData;

  return {
    unchanged: false,
    latest,
    data,
    saved: {
      zip: path.relative(ROOT, path.join(ZIP_DIR, latest.arquivo)),
      json: path.relative(ROOT, jsonPath),
      gz: path.relative(ROOT, gzPath(latest.competencia)),
    },
  };
}

export async function montarListaAno(ano: string) {
  await sincronizarEmpacotada();
  const remotas = await listarCompetenciasDoAno(ano);
  const locais = (await lerCatalogo()).filter((item) => item.competencia.startsWith(ano));
  const localSet = new Set(locais.map((item) => item.competencia));
  const faltando = remotas.filter((item) => !localSet.has(item.competencia) || !existsSync(gzPath(item.competencia)));
  return { ano, remotas, locais, faltando };
}

type BaixarEvento = Record<string, unknown>;

export async function baixarAno(ano: string, emit: (evento: BaixarEvento) => void) {
  const { remotas } = await montarListaAno(ano);
  if (!remotas.length) {
    throw new Error(`O DATASUS não listou competências de ${ano} no FTP da Tabela Unificada.`);
  }
  emit({ ok: true, etapa: "lista", ano, total: remotas.length });
  const itens: CatalogoItem[] = [];
  const ordem = [...remotas].sort((a, b) => a.competencia.localeCompare(b.competencia));
  let i = 0;
  for (const rem of ordem) {
    i += 1;
    emit({
      ok: true,
      etapa: "baixando",
      competencia: rem.competencia,
      label: rem.label,
      arquivo: rem.arquivo,
      i,
      n: ordem.length,
    });
    const result = await garantirTabela(rem);
    emit({
      ok: true,
      etapa: result.skipped ? "ja-tinha" : "pronta",
      ...result.item,
      i,
      n: ordem.length,
    });
    itens.push(result.item);
  }
  emit({ ok: true, etapa: "fim", ano, itens });
}

export function sigtapUpdatePlugin(): Plugin {
  return {
    name: "sigtap-update",
    configureServer(server) {
      server.middlewares.use(apiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiMiddleware);
    },
  };
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function apiMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = req.url ?? "";
  const pathOnly = url.split("?")[0];
  if (!pathOnly.startsWith("/api/competencia/")) return next();

  try {
    if (pathOnly === "/api/competencia/verificar" && req.method === "GET") {
      const params = new URL(url, "http://localhost").searchParams;
      const latestList = await listarCompetenciasRemotas();
      const latest = latestList[0] ?? null;
      const atual = { competencia: params.get("competencia") ?? undefined, arquivo: params.get("arquivo") ?? undefined };
      sendJson(res, 200, {
        ok: true,
        latest,
        atual,
        temNova: latest ? temNovaCompetencia(atual, latest) : false,
      });
      return;
    }

    if (pathOnly === "/api/competencia/lista" && req.method === "GET") {
      const ano = new URL(url, "http://localhost").searchParams.get("ano") ?? "2026";
      const lista = await montarListaAno(ano);
      sendJson(res, 200, { ok: true, ...lista });
      return;
    }

    if (pathOnly === "/api/competencia/tabela" && req.method === "GET") {
      const competencia = new URL(url, "http://localhost").searchParams.get("c") ?? "";
      if (!/^\d{6}$/.test(competencia)) {
        sendJson(res, 400, { ok: false, erro: "Informe a competência no formato AAAAMM." });
        return;
      }
      await sincronizarEmpacotada();
      const dest = gzPath(competencia);
      if (!existsSync(dest)) {
        sendJson(res, 404, { ok: false, erro: `A competência ${labelDe(competencia)} ainda não está baixada.` });
        return;
      }
      const json = gunzipSync(await readFile(dest));
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(json);
      return;
    }

    if (pathOnly === "/api/competencia/atualizar" && req.method === "POST") {
      const raw = await readBody(req);
      const atual = raw ? (JSON.parse(raw) as { competencia?: string; arquivo?: string }) : {};
      const result = await atualizarCompetenciaNoDisco(atual);
      sendJson(res, 200, {
        ok: true,
        unchanged: result.unchanged,
        meta: result.data?.meta ?? {
          competencia: result.latest.competencia,
          competenciaLabel: result.latest.label,
          arquivo: result.latest.arquivo,
        },
        saved: result.saved,
        latest: result.latest,
      });
      return;
    }

    if (pathOnly === "/api/competencia/baixar-ano" && req.method === "POST") {
      const raw = await readBody(req);
      const ano = String((raw ? JSON.parse(raw) : {}).ano ?? "2026").replace(/\D/g, "").slice(0, 4);
      if (!/^\d{4}$/.test(ano)) {
        sendJson(res, 400, { ok: false, erro: "Informe o ano com quatro dígitos." });
        return;
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      const emit = (evento: BaixarEvento) => {
        res.write(`${JSON.stringify(evento)}\n`);
      };
      await baixarAno(ano, emit);
      res.end();
      return;
    }

    sendJson(res, 404, { ok: false, erro: "Rota não encontrada." });
  } catch (err) {
    if (!res.headersSent) {
      sendJson(res, 500, { ok: false, erro: err instanceof Error ? err.message : "Falha ao falar com o DATASUS." });
      return;
    }
    res.write(`${JSON.stringify({ ok: false, erro: err instanceof Error ? err.message : "Falha ao falar com o DATASUS." })}\n`);
    res.end();
  }
}
