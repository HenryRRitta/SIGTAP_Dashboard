import type { AuditCheck, AuditInput, Procedure } from "./types";
import { digits, relOf } from "./format";
import type { CnesLocal, TetoLocal } from "./local";

function idadeEmMeses(input: AuditInput): number | null {
  const anos = input.idadeAnos.trim() === "" ? null : Number(input.idadeAnos);
  const meses = input.idadeMeses.trim() === "" ? 0 : Number(input.idadeMeses);
  if (anos === null || Number.isNaN(anos) || Number.isNaN(meses)) return null;
  return anos * 12 + meses;
}

export function runAudit(proc: Procedure, input: AuditInput): AuditCheck[] {
  const rel = relOf(proc);
  const checks: AuditCheck[] = [];
  const detalhes = new Set(rel.detalhes);

  if (input.sexo) {
    if (proc.sx === "I" || proc.sx === "N") {
      checks.push({
        id: "sexo",
        titulo: "Sexo do usuário",
        status: "ok",
        detalhe: `Procedimento admite qualquer sexo (${proc.sx === "N" ? "não se aplica" : "indiferente"}).`,
      });
    } else if (proc.sx === input.sexo) {
      checks.push({
        id: "sexo",
        titulo: "Sexo do usuário",
        status: "ok",
        detalhe: `Sexo ${input.sexo} está autorizado.`,
      });
    } else {
      checks.push({
        id: "sexo",
        titulo: "Sexo do usuário",
        status: "fail",
        detalhe: `Procedimento restrito ao sexo ${proc.sx}. Sexo informado (${input.sexo}) é glosa clássica de consistência.`,
      });
    }
  } else {
    checks.push({
      id: "sexo",
      titulo: "Sexo do usuário",
      status: proc.sx === "M" || proc.sx === "F" ? "warn" : "info",
      detalhe:
        proc.sx === "M" || proc.sx === "F"
          ? `Restrito ao sexo ${proc.sx}. Informe o sexo na conta para consistir.`
          : "Sem restrição de sexo.",
    });
  }

  const meses = idadeEmMeses(input);
  if (meses !== null) {
    const minOk = proc.imin === null || meses >= proc.imin;
    const maxOk = proc.imax === null || meses <= proc.imax;
    if (minOk && maxOk) {
      checks.push({
        id: "idade",
        titulo: "Faixa etária",
        status: "ok",
        detalhe: `Idade ${input.idadeAnos}a ${input.idadeMeses || "0"}m dentro da faixa ${proc.iminL ?? "sem mínimo"} – ${proc.imaxL ?? "sem máximo"}.`,
      });
    } else {
      checks.push({
        id: "idade",
        titulo: "Faixa etária",
        status: "fail",
        detalhe: `Idade fora da faixa autorizada (${proc.iminL ?? "sem mínimo"} a ${proc.imaxL ?? "sem máximo"}).`,
      });
    }
    if (detalhes.has("042")) {
      checks.push({
        id: "idade-critica",
        titulo: "Liberação de crítica de idade",
        status: "warn",
        detalhe: "Atributo 042: não admite liberação de crítica de idade pelo gestor.",
      });
    }
  } else if (proc.imin !== null || proc.imax !== null) {
    checks.push({
      id: "idade",
      titulo: "Faixa etária",
      status: "warn",
      detalhe: `Há faixa etária (${proc.iminL ?? "–"} a ${proc.imaxL ?? "–"}). Informe a idade para consistir.`,
    });
  }

  const cid = input.cid.trim().toUpperCase();
  if (cid) {
    const all = [...rel.cidsP, ...rel.cidsS];
    if (all.length === 0) {
      checks.push({
        id: "cid",
        titulo: "CID-10",
        status: "warn",
        detalhe: "Este procedimento não tem CID vinculado na tabela. Confira se o instrumento exige CID mesmo assim.",
      });
    } else if (rel.cidsP.includes(cid) || rel.cidsP.includes(cid.padEnd(4, " "))) {
      checks.push({
        id: "cid",
        titulo: "CID-10 principal",
        status: "ok",
        detalhe: `${cid} está na lista de CID principal.`,
      });
    } else if (rel.cidsS.includes(cid) || rel.cidsS.includes(cid.padEnd(4, " "))) {
      checks.push({
        id: "cid",
        titulo: "CID-10",
        status: "warn",
        detalhe: `${cid} consta só como CID secundário. No principal da conta isso pode glosar.`,
      });
    } else {
      checks.push({
        id: "cid",
        titulo: "CID-10",
        status: "fail",
        detalhe: `${cid} não está relacionado a este procedimento (${rel.cidsP.length} principais, ${rel.cidsS.length} secundários).`,
      });
    }
  } else if (detalhes.has("048") || rel.cidsP.length > 0) {
    checks.push({
      id: "cid",
      titulo: "CID-10",
      status: detalhes.has("048") ? "fail" : "warn",
      detalhe: detalhes.has("048")
        ? "Atributo 048: exige CID. Sem CID a produção tende a ser rejeitada."
        : `Há ${rel.cidsP.length} CIDs principais possíveis. Informe o CID da conta.`,
    });
  }

  if (detalhes.has("043")) {
    checks.push({
      id: "cid-sec",
      titulo: "CID de causa associada",
      status: "warn",
      detalhe: "Atributo 043: exige CID de causas associadas (secundário).",
    });
  }

  const cbo = digits(input.cbo);
  if (cbo) {
    if (detalhes.has("021")) {
      checks.push({
        id: "cbo",
        titulo: "CBO do executante",
        status: "info",
        detalhe: "Atributo 021: não exige CBO. Ainda assim o CNO/CNES do profissional deve ser coerente.",
      });
    } else if (rel.cbos.length === 0) {
      checks.push({
        id: "cbo",
        titulo: "CBO do executante",
        status: "warn",
        detalhe: "Não há CBO vinculado na tabela para este procedimento.",
      });
    } else if (rel.cbos.includes(cbo)) {
      checks.push({
        id: "cbo",
        titulo: "CBO do executante",
        status: "ok",
        detalhe: `CBO ${cbo} está habilitado a executar o procedimento.`,
      });
    } else {
      checks.push({
        id: "cbo",
        titulo: "CBO do executante",
        status: "fail",
        detalhe: `CBO ${cbo} não consta na lista (${rel.cbos.length} ocupações autorizadas). Glosa frequente em BPA-I, APAC e AIH.`,
      });
    }
  } else if (!detalhes.has("021") && rel.cbos.length > 0) {
    checks.push({
      id: "cbo",
      titulo: "CBO do executante",
      status: "warn",
      detalhe: `${rel.cbos.length} CBOs autorizados. Informe o CBO do profissional executante.`,
    });
  }

  if (input.registro) {
    if (rel.registros.includes(input.registro)) {
      checks.push({
        id: "registro",
        titulo: "Instrumento de registro",
        status: "ok",
        detalhe: `Instrumento ${input.registro} está previsto para o procedimento.`,
      });
    } else {
      checks.push({
        id: "registro",
        titulo: "Instrumento de registro",
        status: "fail",
        detalhe: `Instrumento ${input.registro} não é válido. Válidos: ${rel.registros.join(", ") || "nenhum"}.`,
      });
    }
  } else if (rel.registros.length) {
    checks.push({
      id: "registro",
      titulo: "Instrumento de registro",
      status: "info",
      detalhe: `Pode ser registrado em: ${rel.registros.join(", ")}.`,
    });
  }

  const qtd = input.quantidade.trim() === "" ? null : Number(input.quantidade);
  if (qtd !== null && !Number.isNaN(qtd)) {
    if (proc.qmax === null) {
      checks.push({
        id: "qtd",
        titulo: "Quantidade máxima",
        status: "ok",
        detalhe: "Quantidade máxima não se aplica (9999 na tabela).",
      });
    } else if (qtd <= proc.qmax) {
      checks.push({
        id: "qtd",
        titulo: "Quantidade máxima",
        status: "ok",
        detalhe: `${qtd} dentro do limite de ${proc.qmax}.`,
      });
    } else if (detalhes.has("005")) {
      checks.push({
        id: "qtd",
        titulo: "Quantidade máxima",
        status: "warn",
        detalhe: `Quantidade ${qtd} acima de ${proc.qmax}, mas o atributo 005 admite liberação na AIH pelo gestor.`,
      });
    } else {
      checks.push({
        id: "qtd",
        titulo: "Quantidade máxima",
        status: "fail",
        detalhe: `Quantidade ${qtd} excede o máximo de ${proc.qmax}.`,
      });
    }
  } else if (proc.qmax !== null) {
    checks.push({
      id: "qtd",
      titulo: "Quantidade máxima",
      status: "info",
      detalhe: `Limite: ${proc.qmax} por tratamento/atendimento.`,
    });
  }

  if (detalhes.has("036")) {
    checks.push({
      id: "aut",
      titulo: "Autorização prévia",
      status: "warn",
      detalhe: "Atributo 036: exige autorização. Confira APAC/AIH e laudo.",
    });
  }
  if (detalhes.has("009") && !detalhes.has("034")) {
    checks.push({
      id: "cns",
      titulo: "Identificação do usuário",
      status: "warn",
      detalhe: "Atributo 009: exige CPF ou CNS.",
    });
  }
  if (rel.habilitacoes.length) {
    checks.push({
      id: "hab",
      titulo: "Habilitação CNES",
      status: "warn",
      detalhe: `Exige habilitação no CNES (${rel.habilitacoes.length} código(s)). Estabelecimento sem o cadastro gera glosa.`,
    });
  }
  if (rel.leitos.length) {
    checks.push({
      id: "leito",
      titulo: "Tipo de leito",
      status: "info",
      detalhe: `Leitos previstos: ${rel.leitos.join(", ")}.`,
    });
  }
  if (rel.servicos.length) {
    checks.push({
      id: "servico",
      titulo: "Serviço / classificação CNES",
      status: "warn",
      detalhe: `Exige serviço/classificação cadastrado (${rel.servicos.length}).`,
    });
  }
  if (detalhes.has("001")) {
    checks.push({
      id: "anestesia",
      titulo: "Anestesia inclusa",
      status: "info",
      detalhe: "Atributo 001: valor da anestesia já está no SH/SA/SP. Cobrar anestesia à parte é glosa.",
    });
  }
  if (detalhes.has("017")) {
    checks.push({
      id: "opm",
      titulo: "OPM obrigatória",
      status: "warn",
      detalhe: "Atributo 017: exige informação de órtese/prótese/material especial compatível.",
    });
  }

  return checks;
}

export function runLocalChecks(
  proc: Procedure,
  extra: {
    cnes?: string;
    leito?: string;
    valor?: number | null;
    quantidade?: string;
    estabelecimento?: CnesLocal | null;
    teto?: TetoLocal | undefined;
  },
): AuditCheck[] {
  const rel = relOf(proc);
  const checks: AuditCheck[] = [];

  if (extra.cnes) {
    if (!extra.estabelecimento) {
      checks.push({
        id: "cnes-local",
        titulo: "CNES do estabelecimento",
        status: "info",
        detalhe: `CNES ${extra.cnes} não está no cadastro local. Cadastre habilitação, leito e serviço em Regras para cruzar com a tabela.`,
      });
    } else {
      const habs = new Set(extra.estabelecimento.habilitacoes.map((h) => digits(h)));
      const missing = rel.habilitacoes.filter((h) => !habs.has(digits(h.cod)));
      if (rel.habilitacoes.length && missing.length === rel.habilitacoes.length) {
        checks.push({
          id: "cnes-hab",
          titulo: "Habilitação CNES",
          status: "fail",
          detalhe: `${extra.estabelecimento.nome} (${extra.cnes}) não tem habilitação ${rel.habilitacoes.map((h) => h.cod).join(", ")}.`,
        });
      } else if (rel.habilitacoes.length) {
        checks.push({
          id: "cnes-hab",
          titulo: "Habilitação CNES",
          status: "ok",
          detalhe: `${extra.estabelecimento.nome} possui habilitação compatível.`,
        });
      }
      const leitosEst = extra.estabelecimento.leitos.map(digits);
      if (extra.leito && rel.leitos.length && !rel.leitos.includes(extra.leito) && !rel.leitos.includes(extra.leito.padStart(2, "0"))) {
        checks.push({
          id: "leito-conta",
          titulo: "Tipo de leito da conta",
          status: "fail",
          detalhe: `Leito ${extra.leito} não é um dos previstos (${rel.leitos.join(", ")}).`,
        });
      } else if (extra.leito && leitosEst.length && !leitosEst.includes(digits(extra.leito))) {
        checks.push({
          id: "leito-cnes",
          titulo: "Leito no CNES local",
          status: "fail",
          detalhe: `Estabelecimento não tem o leito ${extra.leito} no cadastro local.`,
        });
      }
      const servEst = new Set(extra.estabelecimento.servicos.map((s) => digits(s)));
      if (rel.servicos.length) {
        const ok = rel.servicos.some((s) => servEst.has(digits(s.servico + s.classificacao)) || servEst.has(digits(s.servico)));
        checks.push({
          id: "cnes-serv",
          titulo: "Serviço / classificação CNES",
          status: ok ? "ok" : "fail",
          detalhe: ok
            ? "Serviço/classificação presente no cadastro local."
            : `Exige serviço ${rel.servicos.map((s) => `${s.servico}-${s.classificacao}`).join(", ")} no CNES.`,
        });
      }
    }
  }

  const teto = extra.teto;
  if (teto) {
    const qtd = extra.quantidade?.trim() === "" ? null : Number(extra.quantidade);
    if (teto.tetoQtd !== null && qtd !== null && !Number.isNaN(qtd) && qtd > teto.tetoQtd) {
      checks.push({
        id: "teto-qtd",
        titulo: "Teto local de quantidade",
        status: "fail",
        detalhe: `Quantidade ${qtd} acima do teto municipal/MAC de ${teto.tetoQtd}. ${teto.observacao}`.trim(),
      });
    } else if (teto.tetoQtd !== null) {
      checks.push({
        id: "teto-qtd",
        titulo: "Teto local de quantidade",
        status: "info",
        detalhe: `Teto local: ${teto.tetoQtd} ${teto.observacao}`.trim(),
      });
    }
    if (teto.tetoValor !== null && extra.valor != null && extra.valor > teto.tetoValor) {
      checks.push({
        id: "teto-valor",
        titulo: "Teto local de valor",
        status: "fail",
        detalhe: `Valor apresentado ${extra.valor} acima do teto de ${teto.tetoValor}. ${teto.observacao}`.trim(),
      });
    }
  }

  return checks;
}

export function auditScore(checks: AuditCheck[]) {
  const fail = checks.filter((c) => c.status === "fail").length;
  const warn = checks.filter((c) => c.status === "warn").length;
  const ok = checks.filter((c) => c.status === "ok").length;
  return { fail, warn, ok };
}
