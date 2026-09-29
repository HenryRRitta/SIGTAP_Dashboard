#!/usr/bin/env python3
"""Parse DATASUS SIGTAP fixed-width TXT files into compact JSON for the dashboard."""

from __future__ import annotations

import json
import os
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "raw" / "202608"
OUT = ROOT / "public" / "data"

NA_NUM = {"9999", "99999", "999999"}


def parse_layout(path: Path) -> list[tuple[str, int, int]]:
    rows = []
    for line in path.read_text(encoding="latin-1").splitlines():
        if not line or line.startswith("Coluna"):
            continue
        parts = line.split(",")
        if len(parts) < 4:
            continue
        name, _size, start, end = parts[0], parts[1], parts[2], parts[3]
        rows.append((name.strip().lower(), int(start), int(end)))
    return rows


def parse_file(name: str) -> list[dict]:
    layout = parse_layout(SRC / f"{name}_layout.txt")
    data_path = SRC / f"{name}.txt"
    if not data_path.exists() or data_path.stat().st_size == 0:
        return []
    records = []
    with data_path.open("r", encoding="latin-1", errors="replace") as fh:
        for raw in fh:
            line = raw.rstrip("\r\n")
            if not line.strip():
                continue
            rec = {}
            for col, start, end in layout:
                rec[col] = line[start - 1 : end].strip()
            records.append(rec)
    return records


def money(value: str | None) -> float:
    if not value:
        return 0.0
    digits = re.sub(r"[^\d]", "", value)
    if not digits:
        return 0.0
    return int(digits) / 100.0


def num_or_none(value: str | None) -> int | None:
    if not value or value in NA_NUM:
        return None
    try:
        n = int(value)
    except ValueError:
        return None
    return n


def age_label(months: int | None) -> str | None:
    if months is None:
        return None
    years, rest = divmod(months, 12)
    if years == 0:
        return f"{rest} mes" if rest == 1 else f"{rest} meses"
    if rest == 0:
        return f"{years} ano" if years == 1 else f"{years} anos"
    return f"{years}a {rest}m"


def format_code(code: str) -> str:
    if len(code) != 10:
        return code
    return f"{code[0:2]}.{code[2:4]}.{code[4:6]}.{code[6:9]}-{code[9]}"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    grupos = parse_file("tb_grupo")
    subgrupos = parse_file("tb_sub_grupo")
    formas = parse_file("tb_forma_organizacao")
    procedimentos = parse_file("tb_procedimento")
    descricoes = parse_file("tb_descricao")
    cids = parse_file("tb_cid")
    ocupacoes = parse_file("tb_ocupacao")
    registros = parse_file("tb_registro")
    modalidades = parse_file("tb_modalidade")
    financiamentos = parse_file("tb_financiamento")
    rubricas = parse_file("tb_rubrica")
    detalhes = parse_file("tb_detalhe")
    desc_detalhe = parse_file("tb_descricao_detalhe")
    habilitacoes = parse_file("tb_habilitacao")
    leitos = parse_file("tb_tipo_leito")
    servicos = parse_file("tb_servico")
    classif = parse_file("tb_servico_classificacao")
    regras = parse_file("tb_regra_condicionada")
    renases = parse_file("tb_renases")
    tuss = parse_file("tb_tuss")
    sia_sih = parse_file("tb_sia_sih")
    redes = parse_file("tb_rede_atencao")
    componentes = parse_file("tb_componente_rede")
    grupo_hab = parse_file("tb_grupo_habilitacao")

    rl_cid = parse_file("rl_procedimento_cid")
    rl_cbo = parse_file("rl_procedimento_ocupacao")
    rl_reg = parse_file("rl_procedimento_registro")
    rl_mod = parse_file("rl_procedimento_modalidade")
    rl_det = parse_file("rl_procedimento_detalhe")
    rl_hab = parse_file("rl_procedimento_habilitacao")
    rl_leito = parse_file("rl_procedimento_leito")
    rl_serv = parse_file("rl_procedimento_servico")
    rl_comp = parse_file("rl_procedimento_compativel")
    rl_exc = parse_file("rl_excecao_compatibilidade")
    rl_inc = parse_file("rl_procedimento_incremento")
    rl_regra = parse_file("rl_procedimento_regra_cond")
    rl_ren = parse_file("rl_procedimento_renases")
    rl_tuss = parse_file("rl_procedimento_tuss")
    rl_origem = parse_file("rl_procedimento_origem")
    rl_sia = parse_file("rl_procedimento_sia_sih")
    rl_rede = parse_file("rl_procedimento_comp_rede")

    desc_map = {r["co_procedimento"]: r.get("ds_procedimento", "") for r in descricoes if r.get("ds_procedimento")}
    det_desc = {r["co_detalhe"]: r.get("ds_detalhe", "") for r in desc_detalhe}

    rel: dict[str, dict] = defaultdict(
        lambda: {
            "cidsP": [],
            "cidsS": [],
            "cbos": [],
            "registros": [],
            "modalidades": [],
            "detalhes": [],
            "habilitacoes": [],
            "leitos": [],
            "servicos": [],
            "compat": [],
            "excecoes": [],
            "incrementos": [],
            "regras": [],
            "renases": [],
            "tuss": [],
            "origem": [],
            "siaSih": [],
            "redes": [],
        }
    )

    cid_index: dict[str, list[str]] = defaultdict(list)
    cbo_index: dict[str, list[str]] = defaultdict(list)
    name_index: dict[str, str] = {}

    for r in rl_cid:
        code = r["co_procedimento"]
        cid = r["co_cid"]
        principal = r.get("st_principal", "").upper() == "S"
        bucket = "cidsP" if principal else "cidsS"
        rel[code][bucket].append(cid)
        cid_index[cid].append(code)

    for r in rl_cbo:
        code = r["co_procedimento"]
        cbo = r["co_ocupacao"]
        rel[code]["cbos"].append(cbo)
        cbo_index[cbo].append(code)

    for r in rl_reg:
        rel[r["co_procedimento"]]["registros"].append(r["co_registro"])
    for r in rl_mod:
        rel[r["co_procedimento"]]["modalidades"].append(r["co_modalidade"])
    for r in rl_det:
        rel[r["co_procedimento"]]["detalhes"].append(r["co_detalhe"])
    for r in rl_hab:
        rel[r["co_procedimento"]]["habilitacoes"].append(
            {
                "cod": r["co_habilitacao"],
                "grupo": r.get("nu_grupo_habilitacao") or None,
            }
        )
    for r in rl_leito:
        rel[r["co_procedimento"]]["leitos"].append(r["co_tipo_leito"])
    for r in rl_serv:
        rel[r["co_procedimento"]]["servicos"].append(
            {"servico": r["co_servico"], "classificacao": r["co_classificacao"]}
        )
    for r in rl_comp:
        rel[r["co_procedimento_principal"]]["compat"].append(
            {
                "compativel": r["co_procedimento_compativel"],
                "regP": r["co_registro_principal"],
                "regC": r["co_registro_compativel"],
                "tipo": r["tp_compatibilidade"],
                "qtd": num_or_none(r.get("qt_permitida")),
            }
        )
    for r in rl_exc:
        rel[r["co_procedimento_principal"]]["excecoes"].append(
            {
                "restricao": r["co_procedimento_restricao"],
                "compativel": r["co_procedimento_compativel"],
                "regP": r["co_registro_principal"],
                "regC": r["co_registro_compativel"],
                "tipo": r["tp_compatibilidade"],
            }
        )
    for r in rl_inc:
        rel[r["co_procedimento"]]["incrementos"].append(
            {
                "hab": r["co_habilitacao"],
                "sh": money(r.get("vl_percentual_sh")),
                "sa": money(r.get("vl_percentual_sa")),
                "sp": money(r.get("vl_percentual_sp")),
            }
        )
    for r in rl_regra:
        rel[r["co_procedimento"]]["regras"].append(r["co_regra_condicionada"])
    for r in rl_ren:
        rel[r["co_procedimento"]]["renases"].append(r["co_renases"])
    for r in rl_tuss:
        rel[r["co_procedimento"]]["tuss"].append(r["co_tuss"])
    for r in rl_origem:
        rel[r["co_procedimento"]]["origem"].append(r["co_procedimento_origem"])
    for r in rl_sia:
        rel[r["co_procedimento"]]["siaSih"].append(
            {"cod": r["co_procedimento_sia_sih"], "tipo": r.get("tp_procedimento")}
        )
    for r in rl_rede:
        rel[r["co_procedimento"]]["redes"].append(r["co_componente_rede"])

    procs = []
    by_grupo: dict[str, int] = defaultdict(int)
    by_complex: dict[str, int] = defaultdict(int)
    by_sexo: dict[str, int] = defaultdict(int)
    valor_total = 0.0

    for r in procedimentos:
        code = r["co_procedimento"]
        name_index[code] = r["no_procedimento"]
        vl_sh = money(r.get("vl_sh"))
        vl_sa = money(r.get("vl_sa"))
        vl_sp = money(r.get("vl_sp"))
        idade_min = num_or_none(r.get("vl_idade_minima"))
        idade_max = num_or_none(r.get("vl_idade_maxima"))
        rec = {
            "c": code,
            "n": r["no_procedimento"],
            "g": code[0:2],
            "sg": code[2:4],
            "fo": code[4:6],
            "cx": r.get("tp_complexidade") or "0",
            "sx": r.get("tp_sexo") or "I",
            "qmax": num_or_none(r.get("qt_maxima_execucao")),
            "perm": num_or_none(r.get("qt_dias_permanencia")),
            "pts": num_or_none(r.get("qt_pontos")),
            "imin": idade_min,
            "imax": idade_max,
            "iminL": age_label(idade_min),
            "imaxL": age_label(idade_max),
            "sh": vl_sh,
            "sa": vl_sa,
            "sp": vl_sp,
            "tot": round(vl_sh + vl_sa + vl_sp, 2),
            "fin": r.get("co_financiamento") or "",
            "rub": r.get("co_rubrica") or "",
            "tperm": num_or_none(r.get("qt_tempo_permanencia")),
            "d": desc_map.get(code, ""),
        }
        rel_item = rel.get(code)
        if rel_item:
            rec["rel"] = rel_item
        procs.append(rec)
        by_grupo[code[0:2]] += 1
        by_complex[rec["cx"]] += 1
        by_sexo[rec["sx"]] += 1
        valor_total += rec["tot"]

    lookups = {
        "grupos": [{"c": r["co_grupo"], "n": r["no_grupo"]} for r in grupos],
        "subgrupos": [
            {"g": r["co_grupo"], "sg": r["co_sub_grupo"], "n": r["no_sub_grupo"]}
            for r in subgrupos
        ],
        "formas": [
            {
                "g": r["co_grupo"],
                "sg": r["co_sub_grupo"],
                "fo": r["co_forma_organizacao"],
                "n": r["no_forma_organizacao"],
            }
            for r in formas
        ],
        "registros": [{"c": r["co_registro"], "n": r["no_registro"]} for r in registros],
        "modalidades": [{"c": r["co_modalidade"], "n": r["no_modalidade"]} for r in modalidades],
        "financiamentos": [
            {"c": r["co_financiamento"], "n": r["no_financiamento"]} for r in financiamentos
        ],
        "rubricas": [{"c": r["co_rubrica"], "n": r["no_rubrica"]} for r in rubricas],
        "detalhes": [
            {
                "c": r["co_detalhe"],
                "n": r["no_detalhe"],
                "d": det_desc.get(r["co_detalhe"], ""),
            }
            for r in detalhes
        ],
        "habilitacoes": [{"c": r["co_habilitacao"], "n": r["no_habilitacao"]} for r in habilitacoes],
        "leitos": [{"c": r["co_tipo_leito"], "n": r["no_tipo_leito"]} for r in leitos],
        "servicos": [{"c": r["co_servico"], "n": r["no_servico"]} for r in servicos],
        "classificacoes": [
            {
                "s": r["co_servico"],
                "c": r["co_classificacao"],
                "n": r["no_classificacao"],
            }
            for r in classif
        ],
        "regras": [
            {
                "c": r["co_regra_condicionada"],
                "n": r["no_regra_condicionada"],
                "d": r.get("ds_regra_condicionada", ""),
            }
            for r in regras
        ],
        "renases": [{"c": r["co_renases"], "n": r["no_renases"]} for r in renases],
        "redes": [{"c": r["co_rede_atencao"], "n": r["no_rede_atencao"]} for r in redes],
        "componentes": [
            {
                "c": r["co_componente_rede"],
                "n": r["no_componente_rede"],
                "rede": r.get("co_rede_atencao"),
            }
            for r in componentes
        ],
        "grupoHab": [
            {
                "c": r["nu_grupo_habilitacao"],
                "n": r["no_grupo_habilitacao"],
                "d": r.get("ds_grupo_habilitacao", ""),
            }
            for r in grupo_hab
        ],
        "complexidade": {
            "0": "Não se aplica",
            "1": "Atenção Básica",
            "2": "Média complexidade",
            "3": "Alta complexidade",
        },
        "sexo": {
            "M": "Masculino",
            "F": "Feminino",
            "I": "Indiferente / ambos",
            "N": "Não se aplica",
        },
        "compatTipo": {
            "1": "Compatível",
            "2": "Incompatível",
            "3": "Concomitante",
            "4": "Excludente",
        },
    }

    cid_lookup = {
        r["co_cid"]: {
            "n": r["no_cid"],
            "sexo": r.get("tp_sexo"),
            "agravo": r.get("tp_agravo"),
            "estadio": r.get("tp_estadio"),
        }
        for r in cids
    }
    cbo_lookup = {r["co_ocupacao"]: r["no_ocupacao"] for r in ocupacoes}
    tuss_lookup = {r["co_tuss"]: r["no_tuss"] for r in tuss}
    sia_lookup = {
        r["co_procedimento_sia_sih"]: {
            "n": r["no_procedimento_sia_sih"],
            "t": r.get("tp_procedimento"),
        }
        for r in sia_sih
    }

    meta = {
        "competencia": "202608",
        "competenciaLabel": "08/2026",
        "fonte": "Tabela Unificada de Procedimentos, Medicamentos e OPM do SUS",
        "arquivo": "TabelaUnificada_202608_v2608141139.zip",
        "totalProcedimentos": len(procs),
        "totalCids": len(cids),
        "totalCbos": len(ocupacoes),
        "totalRelCid": len(rl_cid),
        "totalRelCbo": len(rl_cbo),
        "totalCompat": len(rl_comp),
        "porGrupo": dict(by_grupo),
        "porComplexidade": dict(by_complex),
        "porSexo": dict(by_sexo),
        "somaValoresReferencia": round(valor_total, 2),
    }

    payload = {
        "meta": meta,
        "lookups": lookups,
        "procedures": procs,
        "cids": cid_lookup,
        "cbos": cbo_lookup,
        "tuss": tuss_lookup,
        "siaSih": sia_lookup,
        "cidIndex": {k: sorted(set(v)) for k, v in cid_index.items()},
        "cboIndex": {k: sorted(set(v)) for k, v in cbo_index.items()},
        "names": name_index,
    }

    out_file = OUT / "sigtap.json"
    out_file.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {out_file} ({out_file.stat().st_size / 1_048_576:.2f} MB)")
    print(f"Procedimentos: {len(procs)}")
    print("Grupos:", {g['c']: r['n'] for g in lookups['grupos'] for r in [g]})
    print("Complexidade:", dict(by_complex))
    print("ST_PRINCIPAL sample keys ok")
    tipos = sorted({c["tipo"] for items in rel.values() for c in items["compat"]})
    print("Tipos compatibilidade:", tipos)


if __name__ == "__main__":
    main()
