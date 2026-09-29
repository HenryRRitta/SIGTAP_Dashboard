import JSZip from "jszip";
import type { Procedure, Rel, SigtapData } from "./types";

type LayoutField = { name: string; start: number; end: number };

function parseLayout(text: string): LayoutField[] {
  return text
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(","))
    .filter((p) => p.length >= 4)
    .map((p) => ({ name: p[0]!.trim().toLowerCase(), start: Number(p[2]), end: Number(p[3]) }));
}

function parseFixed(text: string, layout: LayoutField[]): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const rec: Record<string, string> = {};
    for (const field of layout) {
      rec[field.name] = raw.slice(field.start - 1, field.end).trim();
    }
    rows.push(rec);
  }
  return rows;
}

function money(value?: string): number {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits ? Number(digits) / 100 : 0;
}

function numOrNull(value?: string): number | null {
  if (!value || value === "9999") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function ageLabel(months: number | null): string | null {
  if (months === null) return null;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return rest === 1 ? "1 mes" : `${rest} meses`;
  if (rest === 0) return years === 1 ? "1 ano" : `${years} anos`;
  return `${years}a ${rest}m`;
}

function emptyRel(): Rel {
  return {
    cidsP: [],
    cidsS: [],
    cbos: [],
    registros: [],
    modalidades: [],
    detalhes: [],
    habilitacoes: [],
    leitos: [],
    servicos: [],
    compat: [],
    excecoes: [],
    incrementos: [],
    regras: [],
    renases: [],
    tuss: [],
    origem: [],
    siaSih: [],
    redes: [],
  };
}

export async function parseSigtapZip(file: File, onProgress?: (msg: string) => void): Promise<SigtapData> {
  onProgress?.("Lendo ZIP…");
  const zip = await JSZip.loadAsync(file);
  const latin = (name: string) => {
    const entry = zip.file(name) ?? zip.file(new RegExp(`${name}$`, "i"))?.[0];
    return entry ? entry.async("uint8array").then((buf) => new TextDecoder("latin1").decode(buf)) : Promise.resolve("");
  };

  const table = async (name: string) => {
    const [layoutTxt, dataTxt] = await Promise.all([latin(`${name}_layout.txt`), latin(`${name}.txt`)]);
    if (!layoutTxt || !dataTxt) return [] as Record<string, string>[];
    return parseFixed(dataTxt, parseLayout(layoutTxt));
  };

  onProgress?.("Convertendo tabelas…");
  const [
    grupos,
    subgrupos,
    formas,
    procedimentos,
    descricoes,
    cids,
    ocupacoes,
    registros,
    modalidades,
    financiamentos,
    rubricas,
    detalhes,
    descDetalhe,
    habilitacoes,
    leitos,
    servicos,
    classif,
    regras,
    renases,
    tuss,
    siaSih,
    redes,
    componentes,
    grupoHab,
    rlCid,
    rlCbo,
    rlReg,
    rlMod,
    rlDet,
    rlHab,
    rlLeito,
    rlServ,
    rlComp,
    rlExc,
    rlInc,
    rlRegra,
    rlRen,
    rlTuss,
    rlOrigem,
    rlSia,
    rlRede,
  ] = await Promise.all([
    table("tb_grupo"),
    table("tb_sub_grupo"),
    table("tb_forma_organizacao"),
    table("tb_procedimento"),
    table("tb_descricao"),
    table("tb_cid"),
    table("tb_ocupacao"),
    table("tb_registro"),
    table("tb_modalidade"),
    table("tb_financiamento"),
    table("tb_rubrica"),
    table("tb_detalhe"),
    table("tb_descricao_detalhe"),
    table("tb_habilitacao"),
    table("tb_tipo_leito"),
    table("tb_servico"),
    table("tb_servico_classificacao"),
    table("tb_regra_condicionada"),
    table("tb_renases"),
    table("tb_tuss"),
    table("tb_sia_sih"),
    table("tb_rede_atencao"),
    table("tb_componente_rede"),
    table("tb_grupo_habilitacao"),
    table("rl_procedimento_cid"),
    table("rl_procedimento_ocupacao"),
    table("rl_procedimento_registro"),
    table("rl_procedimento_modalidade"),
    table("rl_procedimento_detalhe"),
    table("rl_procedimento_habilitacao"),
    table("rl_procedimento_leito"),
    table("rl_procedimento_servico"),
    table("rl_procedimento_compativel"),
    table("rl_excecao_compatibilidade"),
    table("rl_procedimento_incremento"),
    table("rl_procedimento_regra_cond"),
    table("rl_procedimento_renases"),
    table("rl_procedimento_tuss"),
    table("rl_procedimento_origem"),
    table("rl_procedimento_sia_sih"),
    table("rl_procedimento_comp_rede"),
  ]);

  onProgress?.("Montando relacionamentos…");
  const descMap = Object.fromEntries(descricoes.map((r) => [r.co_procedimento!, r.ds_procedimento ?? ""]));
  const detDesc = Object.fromEntries(descDetalhe.map((r) => [r.co_detalhe!, r.ds_detalhe ?? ""]));
  const rel = new Map<string, Rel>();
  const getRel = (code: string) => {
    let item = rel.get(code);
    if (!item) {
      item = emptyRel();
      rel.set(code, item);
    }
    return item;
  };

  const cidIndex: Record<string, string[]> = {};
  const cboIndex: Record<string, string[]> = {};
  const pushIdx = (idx: Record<string, string[]>, key: string, code: string) => {
    (idx[key] ??= []).push(code);
  };

  for (const r of rlCid) {
    const code = r.co_procedimento!;
    const cid = r.co_cid!;
    if ((r.st_principal ?? "").toUpperCase() === "S") getRel(code).cidsP.push(cid);
    else getRel(code).cidsS.push(cid);
    pushIdx(cidIndex, cid, code);
  }
  for (const r of rlCbo) {
    getRel(r.co_procedimento!).cbos.push(r.co_ocupacao!);
    pushIdx(cboIndex, r.co_ocupacao!, r.co_procedimento!);
  }
  for (const r of rlReg) getRel(r.co_procedimento!).registros.push(r.co_registro!);
  for (const r of rlMod) getRel(r.co_procedimento!).modalidades.push(r.co_modalidade!);
  for (const r of rlDet) getRel(r.co_procedimento!).detalhes.push(r.co_detalhe!);
  for (const r of rlHab) {
    getRel(r.co_procedimento!).habilitacoes.push({
      cod: r.co_habilitacao!,
      grupo: r.nu_grupo_habilitacao || null,
    });
  }
  for (const r of rlLeito) getRel(r.co_procedimento!).leitos.push(r.co_tipo_leito!);
  for (const r of rlServ) {
    getRel(r.co_procedimento!).servicos.push({
      servico: r.co_servico!,
      classificacao: r.co_classificacao!,
    });
  }
  for (const r of rlComp) {
    getRel(r.co_procedimento_principal!).compat.push({
      compativel: r.co_procedimento_compativel!,
      regP: r.co_registro_principal!,
      regC: r.co_registro_compativel!,
      tipo: r.tp_compatibilidade!,
      qtd: numOrNull(r.qt_permitida),
    });
  }
  for (const r of rlExc) {
    getRel(r.co_procedimento_principal!).excecoes.push({
      restricao: r.co_procedimento_restricao!,
      compativel: r.co_procedimento_compativel!,
      regP: r.co_registro_principal!,
      regC: r.co_registro_compativel!,
      tipo: r.tp_compatibilidade!,
    });
  }
  for (const r of rlInc) {
    getRel(r.co_procedimento!).incrementos.push({
      hab: r.co_habilitacao!,
      sh: money(r.vl_percentual_sh),
      sa: money(r.vl_percentual_sa),
      sp: money(r.vl_percentual_sp),
    });
  }
  for (const r of rlRegra) getRel(r.co_procedimento!).regras.push(r.co_regra_condicionada!);
  for (const r of rlRen) getRel(r.co_procedimento!).renases.push(r.co_renases!);
  for (const r of rlTuss) getRel(r.co_procedimento!).tuss.push(r.co_tuss!);
  for (const r of rlOrigem) getRel(r.co_procedimento!).origem.push(r.co_procedimento_origem!);
  for (const r of rlSia) {
    getRel(r.co_procedimento!).siaSih.push({
      cod: r.co_procedimento_sia_sih!,
      tipo: r.tp_procedimento,
    });
  }
  for (const r of rlRede) getRel(r.co_procedimento!).redes.push(r.co_componente_rede!);

  const names: Record<string, string> = {};
  const byGrupo: Record<string, number> = {};
  const byCx: Record<string, number> = {};
  const bySx: Record<string, number> = {};
  let soma = 0;
  const procedures: Procedure[] = procedimentos.map((r) => {
    const code = r.co_procedimento!;
    names[code] = r.no_procedimento ?? "";
    const imin = numOrNull(r.vl_idade_minima);
    const imax = numOrNull(r.vl_idade_maxima);
    const sh = money(r.vl_sh);
    const sa = money(r.vl_sa);
    const sp = money(r.vl_sp);
    const proc: Procedure = {
      c: code,
      n: r.no_procedimento ?? "",
      g: code.slice(0, 2),
      sg: code.slice(2, 4),
      fo: code.slice(4, 6),
      cx: r.tp_complexidade || "0",
      sx: r.tp_sexo || "I",
      qmax: numOrNull(r.qt_maxima_execucao),
      perm: numOrNull(r.qt_dias_permanencia),
      pts: numOrNull(r.qt_pontos),
      imin,
      imax,
      iminL: ageLabel(imin),
      imaxL: ageLabel(imax),
      sh,
      sa,
      sp,
      tot: Math.round((sh + sa + sp) * 100) / 100,
      fin: r.co_financiamento || "",
      rub: r.co_rubrica || "",
      tperm: numOrNull(r.qt_tempo_permanencia),
      d: descMap[code] ?? "",
      rel: rel.get(code),
    };
    byGrupo[proc.g] = (byGrupo[proc.g] ?? 0) + 1;
    byCx[proc.cx] = (byCx[proc.cx] ?? 0) + 1;
    bySx[proc.sx] = (bySx[proc.sx] ?? 0) + 1;
    soma += proc.tot;
    return proc;
  });

  const competencia = procedimentos[0]?.dt_competencia ?? "000000";
  const label = competencia.length === 6 ? `${competencia.slice(4)}/${competencia.slice(0, 4)}` : competencia;

  return {
    meta: {
      competencia,
      competenciaLabel: label,
      fonte: "Tabela Unificada de Procedimentos, Medicamentos e OPM do SUS",
      arquivo: file.name,
      totalProcedimentos: procedures.length,
      totalCids: cids.length,
      totalCbos: ocupacoes.length,
      totalRelCid: rlCid.length,
      totalRelCbo: rlCbo.length,
      totalCompat: rlComp.length,
      porGrupo: byGrupo,
      porComplexidade: byCx,
      porSexo: bySx,
      somaValoresReferencia: Math.round(soma * 100) / 100,
    },
    lookups: {
      grupos: grupos.map((r) => ({ c: r.co_grupo!, n: r.no_grupo! })),
      subgrupos: subgrupos.map((r) => ({ g: r.co_grupo!, sg: r.co_sub_grupo!, n: r.no_sub_grupo! })),
      formas: formas.map((r) => ({
        g: r.co_grupo!,
        sg: r.co_sub_grupo!,
        fo: r.co_forma_organizacao!,
        n: r.no_forma_organizacao!,
      })),
      registros: registros.map((r) => ({ c: r.co_registro!, n: r.no_registro! })),
      modalidades: modalidades.map((r) => ({ c: r.co_modalidade!, n: r.no_modalidade! })),
      financiamentos: financiamentos.map((r) => ({ c: r.co_financiamento!, n: r.no_financiamento! })),
      rubricas: rubricas.map((r) => ({ c: r.co_rubrica!, n: r.no_rubrica! })),
      detalhes: detalhes.map((r) => ({ c: r.co_detalhe!, n: r.no_detalhe!, d: detDesc[r.co_detalhe!] ?? "" })),
      habilitacoes: habilitacoes.map((r) => ({ c: r.co_habilitacao!, n: r.no_habilitacao! })),
      leitos: leitos.map((r) => ({ c: r.co_tipo_leito!, n: r.no_tipo_leito! })),
      servicos: servicos.map((r) => ({ c: r.co_servico!, n: r.no_servico! })),
      classificacoes: classif.map((r) => ({
        s: r.co_servico!,
        c: r.co_classificacao!,
        n: r.no_classificacao!,
      })),
      regras: regras.map((r) => ({
        c: r.co_regra_condicionada!,
        n: r.no_regra_condicionada!,
        d: r.ds_regra_condicionada,
      })),
      renases: renases.map((r) => ({ c: r.co_renases!, n: r.no_renases! })),
      redes: redes.map((r) => ({ c: r.co_rede_atencao!, n: r.no_rede_atencao! })),
      componentes: componentes.map((r) => ({
        c: r.co_componente_rede!,
        n: r.co_componente_rede ? r.no_componente_rede! : "",
        rede: r.co_rede_atencao,
      })),
      grupoHab: grupoHab.map((r) => ({
        c: r.nu_grupo_habilitacao!,
        n: r.no_grupo_habilitacao!,
        d: r.ds_grupo_habilitacao,
      })),
      complexidade: {
        "0": "Não se aplica",
        "1": "Atenção Básica",
        "2": "Média complexidade",
        "3": "Alta complexidade",
      },
      sexo: { M: "Masculino", F: "Feminino", I: "Indiferente / ambos", N: "Não se aplica" },
      compatTipo: {
        "1": "Compatível",
        "2": "Excludente",
        "3": "Concomitante",
        "4": "Sequencial",
        "5": "Obrigatória",
      },
    },
    procedures,
    cids: Object.fromEntries(
      cids.map((r) => [
        r.co_cid!,
        { n: r.no_cid!, sexo: r.tp_sexo, agravo: r.tp_agravo, estadio: r.tp_estadio },
      ]),
    ),
    cbos: Object.fromEntries(ocupacoes.map((r) => [r.co_ocupacao!, r.no_ocupacao!])),
    tuss: Object.fromEntries(tuss.map((r) => [r.co_tuss!, r.no_tuss!])),
    siaSih: Object.fromEntries(
      siaSih.map((r) => [r.co_procedimento_sia_sih!, { n: r.no_procedimento_sia_sih!, t: r.tp_procedimento }]),
    ),
    cidIndex,
    cboIndex,
    names,
  };
}
