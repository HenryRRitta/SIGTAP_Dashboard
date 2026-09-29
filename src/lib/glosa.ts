import type { AuditCheck, Procedure } from "./types";
import { relOf } from "./format";

export type Gravidade = "glosa" | "alerta" | "conferir";

export type GlosaItem = {
  id: string;
  titulo: string;
  gravidade: Gravidade;
  texto: string;
  fundamento: string;
};

export type FamiliaInstrumento = "AIH" | "APAC" | "BPA" | "RAAS" | "ESUS" | "GERAL";

export function familiaInstrumento(codigo: string): FamiliaInstrumento {
  if (["03", "04", "05"].includes(codigo)) return "AIH";
  if (["06", "07"].includes(codigo)) return "APAC";
  if (["01", "02"].includes(codigo)) return "BPA";
  if (["08", "09"].includes(codigo)) return "RAAS";
  if (codigo === "10") return "ESUS";
  return "GERAL";
}

export function familiaDaConta(registros: string[]): FamiliaInstrumento {
  if (registros.some((r) => ["03", "04", "05"].includes(r))) return "AIH";
  if (registros.some((r) => ["06", "07"].includes(r))) return "APAC";
  if (registros.some((r) => ["08", "09"].includes(r))) return "RAAS";
  if (registros.includes("10")) return "ESUS";
  if (registros.some((r) => ["01", "02"].includes(r))) return "BPA";
  return "GERAL";
}

const PERM_MAIOR = "0802010199";

export function checklistGlosa(proc: Procedure, instrumento?: string): GlosaItem[] {
  const rel = relOf(proc);
  const det = new Set(rel.detalhes);
  const familia = instrumento ? familiaInstrumento(instrumento) : familiaDaConta(rel.registros);
  const items: GlosaItem[] = [];

  const push = (item: GlosaItem) => items.push(item);

  push({
    id: "instrumento",
    titulo: "Instrumento de registro",
    gravidade: "glosa",
    fundamento: "rl_procedimento_registro",
    texto:
      rel.registros.length === 0
        ? "Sem instrumento vinculado — conferir se a produção cabe neste procedimento."
        : `Só pode sair em ${rel.registros.join(", ")}. Registrar em outro instrumento (ex.: BPA no lugar de AIH/APAC) é glosa clássica.`,
  });

  if (familia === "BPA" && rel.registros.some((r) => ["03", "04", "05", "06", "07"].includes(r))) {
    push({
      id: "bpa-indevido",
      titulo: "BPA em procedimento de AIH/APAC",
      gravidade: "glosa",
      fundamento: "instrumento de registro",
      texto: "Este código admite AIH ou APAC. Produção em BPA-C/BPA-I costuma ser rejeitada no processamento.",
    });
  }

  if (familia === "AIH") {
    push({
      id: "cid-aih",
      titulo: "CID principal da AIH",
      gravidade: "glosa",
      fundamento: "CID principal da tabela",
      texto:
        rel.cidsP.length === 0
          ? "Não há CID principal na ficha. Conferir se o diagnóstico da AIH é exigido pelo processamento local."
          : `O CID do diagnóstico principal precisa estar entre os ${rel.cidsP.length} CIDs principais. CID só secundário no campo principal glosa.`,
    });
    push({
      id: "leito-aih",
      titulo: "Tipo de leito CNES",
      gravidade: rel.leitos.length ? "glosa" : "conferir",
      fundamento: "rl_procedimento_leito",
      texto:
        rel.leitos.length === 0
          ? "Sem leito vinculado. Ainda assim o leito da AIH deve existir no CNES do estabelecimento."
          : `Leito da AIH precisa ser um destes códigos CNES: ${rel.leitos.join(", ")}.`,
    });
    if (proc.perm) {
      push({
        id: "permanencia",
        titulo: "Média de permanência",
        gravidade: "alerta",
        fundamento: "QT_DIAS_PERMANENCIA",
        texto: `Média ${proc.perm} dia(s). Permanência acima do dobro, sem atributo 004 e sem o procedimento ${PERM_MAIOR} (permanência à maior), é alvo clássico de glosa.`,
      });
    }
    if (det.has("004")) {
      push({
        id: "perm-maior",
        titulo: "Permanência à maior",
        gravidade: "conferir",
        fundamento: "atributo 004",
        texto: `Admite permanência à maior. Dias além do dobro da média exigem o registro do ${PERM_MAIOR} na AIH.`,
      });
    }
    if (det.has("003")) {
      push({
        id: "longa",
        titulo: "Longa permanência",
        gravidade: "conferir",
        fundamento: "atributo 003",
        texto: "Admite AIH de continuidade (longa permanência). Sem essa AIH complementar a conta encerra na média.",
      });
    }
    if (det.has("007")) {
      push({
        id: "perm-dia",
        titulo: "Permanência por dia",
        gravidade: "alerta",
        fundamento: "atributo 007",
        texto: "Valor é por dia. A quantidade na AIH são os dias, limitada pela quantidade máxima — não pela média.",
      });
    }
    if (det.has("008")) {
      push({
        id: "mudanca",
        titulo: "Mudança de procedimento",
        gravidade: "glosa",
        fundamento: "atributo 008",
        texto: "Não permite mudar o procedimento principal autorizado no laudo. Troca após autorização glosa.",
      });
    }
    if (det.has("001")) {
      push({
        id: "anestesia",
        titulo: "Anestesia já inclusa no SP",
        gravidade: "glosa",
        fundamento: "atributo 001",
        texto: "Não registrar procedimento especial de anestesia. O valor já está no componente SP.",
      });
    }
    if (det.has("049")) {
      push({
        id: "equipe",
        titulo: "Equipe cirúrgica",
        gravidade: "conferir",
        fundamento: "atributo 049",
        texto: "Permite informar equipe cirúrgica. CBO de cada profissional da equipe precisa ser compatível.",
      });
    }
    if (det.has("011")) {
      push({
        id: "uti",
        titulo: "Alta direta de UTI",
        gravidade: "conferir",
        fundamento: "atributo 011",
        texto: "Admite alta direta de UTI. Conferir se o tipo de leito e a permanência em UTI estão coerentes.",
      });
    }
    if (det.has("017")) {
      push({
        id: "opm-aih",
        titulo: "OPM na AIH",
        gravidade: "glosa",
        fundamento: "atributo 017 + compatibilidade",
        texto: "Exige OPM. A órtese/prótese precisa ser compatível com este principal e respeitar a quantidade permitida.",
      });
    }
    if (rel.compat.length) {
      push({
        id: "especiais",
        titulo: "Especiais, secundários e OPM",
        gravidade: "glosa",
        fundamento: "rl_procedimento_compativel",
        texto: `${rel.compat.length} relações de compatibilidade. Especial/secundário/OPM fora da lista, ou em tipo excludente, glosa.`,
      });
    }
  }

  if (familia === "APAC") {
    push({
      id: "apac-aut",
      titulo: "Autorização da APAC",
      gravidade: "glosa",
      fundamento: "instrumento 06/07 + atributo 036",
      texto: "APAC principal exige autorização prévia. Secundário só entra se for compatível com o principal autorizado.",
    });
    if (det.has("014")) {
      push({
        id: "continuidade",
        titulo: "APAC de continuidade",
        gravidade: "conferir",
        fundamento: "atributo 014",
        texto: "Admite APAC de continuidade. Conferir laudo, CID e competência de validade.",
      });
    }
    if (det.has("033")) {
      push({
        id: "validade-3",
        titulo: "Validade fixa de 3 competências",
        gravidade: "alerta",
        fundamento: "atributo 033",
        texto: "APAC com validade de 3 competências. Produção fora da vigência autorizada glosa.",
      });
    }
    if (det.has("041")) {
      push({
        id: "validade-12",
        titulo: "Validade fixa de 12 competências",
        gravidade: "alerta",
        fundamento: "atributo 041",
        texto: "APAC com validade de 12 competências. Conferir competência inicial e final da autorização.",
      });
    }
    if (det.has("054")) {
      push({
        id: "validade-2",
        titulo: "Validade fixa de 2 competências",
        gravidade: "alerta",
        fundamento: "atributo 054",
        texto: "APAC com validade de 2 competências.",
      });
    }
    if (det.has("022")) {
      push({
        id: "dados-apac",
        titulo: "Dados complementares da APAC",
        gravidade: "glosa",
        fundamento: "atributo 022",
        texto: "Exige registro de dados complementares na APAC. APAC incompleta é rejeitada.",
      });
    }
    if (det.has("066")) {
      push({
        id: "onco",
        titulo: "APAC oncológica exclusiva",
        gravidade: "glosa",
        fundamento: "atributo 066",
        texto: "APAC onco exclusiva com autorização prévia. Conferir CID oncológico, CBO e habilitação de oncologia.",
      });
    }
    if (rel.cidsP.length) {
      push({
        id: "cid-apac",
        titulo: "CID da APAC",
        gravidade: "glosa",
        fundamento: "CID principal",
        texto: `CID autorizado precisa estar nos ${rel.cidsP.length} CIDs principais deste procedimento.`,
      });
    }
  }

  if (familia === "BPA") {
    if (rel.registros.includes("01") && det.has("012")) {
      push({
        id: "bpa-idade",
        titulo: "Idade no BPA consolidado",
        gravidade: "alerta",
        fundamento: "atributo 012",
        texto: "Mesmo em BPA-C este procedimento exige idade. Faixa etária da tabela continua valendo.",
      });
    }
    if (rel.registros.includes("02")) {
      push({
        id: "bpai",
        titulo: "BPA individualizado",
        gravidade: "glosa",
        fundamento: "instrumento 02",
        texto: "BPA-I exige identificação do usuário, sexo, idade e, em regra, CID e CBO. Produção sem esses campos glosa.",
      });
    }
  }

  if (familia === "RAAS") {
    push({
      id: "raas",
      titulo: "RAAS (redes de atenção)",
      gravidade: "alerta",
      fundamento: "instrumentos 08/09",
      texto: "Conferir o tipo de RAAS (domiciliar vs psicossocial) e o serviço/classificação CNES do estabelecimento.",
    });
  }

  if (det.has("009") && !det.has("034")) {
    push({
      id: "cns",
      titulo: "CPF ou CNS",
      gravidade: "glosa",
      fundamento: "atributo 009",
      texto: "Exige CPF (preferencial) ou Cartão Nacional de Saúde.",
    });
  }
  if (det.has("036")) {
    push({
      id: "autorizacao",
      titulo: "Autorização prévia",
      gravidade: "glosa",
      fundamento: "atributo 036",
      texto: "Exige autorização. Sem AIH/APAC/laudo autorizado a produção não deveria ser apresentada.",
    });
  }
  if (det.has("048")) {
    push({
      id: "exige-cid",
      titulo: "CID obrigatório",
      gravidade: "glosa",
      fundamento: "atributo 048",
      texto: "Atributo 048: exige CID. Ausência ou CID fora da lista glosa.",
    });
  }
  if (rel.habilitacoes.length) {
    push({
      id: "cnes-hab",
      titulo: "Habilitação do estabelecimento",
      gravidade: "glosa",
      fundamento: "rl_procedimento_habilitacao",
      texto: `CNES precisa ter habilitação ${rel.habilitacoes.map((h) => h.cod).join(", ")}. Sem cadastro vigente, glosa.`,
    });
  }
  if (rel.servicos.length) {
    push({
      id: "cnes-serv",
      titulo: "Serviço/classificação CNES",
      gravidade: "glosa",
      fundamento: "rl_procedimento_servico",
      texto: "Estabelecimento precisa ter o serviço/classificação correspondente no CNES.",
    });
  }
  if (proc.qmax !== null) {
    push({
      id: "qmax",
      titulo: "Quantidade máxima",
      gravidade: det.has("005") ? "alerta" : "glosa",
      fundamento: "QT_MAXIMA_EXECUCAO",
      texto: det.has("005")
        ? `Máximo ${proc.qmax}, mas o atributo 005 admite liberação de quantidade na AIH pelo gestor.`
        : `Quantidade máxima ${proc.qmax}. Exceder sem previsão de liberação glosa.`,
    });
  }
  if (det.has("042")) {
    push({
      id: "idade-rigida",
      titulo: "Crítica de idade sem liberação",
      gravidade: "glosa",
      fundamento: "atributo 042",
      texto: `Faixa ${proc.iminL ?? "–"} a ${proc.imaxL ?? "–"}. Gestor não pode liberar crítica de idade.`,
    });
  }
  if (!det.has("021") && rel.cbos.length) {
    push({
      id: "cbo",
      titulo: "CBO do executante",
      gravidade: "glosa",
      fundamento: "rl_procedimento_ocupacao",
      texto: `${rel.cbos.length} ocupações autorizadas. CBO do profissional executante fora da lista glosa em BPA-I, APAC e AIH.`,
    });
  }

  return items;
}

export function parecerAutomatico(checks: AuditCheck[]): "conforme" | "glosar" | "diligenciar" {
  if (checks.some((c) => c.status === "fail")) return "glosar";
  if (checks.some((c) => c.status === "warn")) return "diligenciar";
  return "conforme";
}
