#!/usr/bin/env python3
"""Build compact competência snapshots and the 07/2026 vs 08/2026 diff."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data"
NA = {"9999", "99999"}


def parse_layout(path: Path):
    rows = []
    for line in path.read_text(encoding="latin-1").splitlines():
        if not line or line.startswith("Coluna"):
            continue
        parts = line.split(",")
        if len(parts) < 4:
            continue
        rows.append((parts[0].strip().lower(), int(parts[2]), int(parts[3])))
    return rows


def parse_file(folder: Path, name: str) -> list[dict]:
    layout_path = folder / f"{name}_layout.txt"
    data_path = folder / f"{name}.txt"
    if not layout_path.exists() or not data_path.exists() or data_path.stat().st_size == 0:
        return []
    layout = parse_layout(layout_path)
    recs = []
    for raw in data_path.read_text(encoding="latin-1", errors="replace").splitlines():
        line = raw.rstrip("\r\n")
        if not line.strip():
            continue
        rec = {col: line[start - 1 : end].strip() for col, start, end in layout}
        recs.append(rec)
    return recs


def money(value: str | None) -> float:
    digits = re.sub(r"[^\d]", "", value or "")
    return int(digits) / 100.0 if digits else 0.0


def num(value: str | None) -> int | None:
    if not value or value in NA:
        return None
    try:
        return int(value)
    except ValueError:
        return None


def snapshot(folder: Path) -> dict:
    procs = parse_file(folder, "tb_procedimento")
    rl_det = parse_file(folder, "rl_procedimento_detalhe")
    rl_reg = parse_file(folder, "rl_procedimento_registro")
    dets = defaultdict(list)
    regs = defaultdict(list)
    for r in rl_det:
        dets[r["co_procedimento"]].append(r["co_detalhe"])
    for r in rl_reg:
        regs[r["co_procedimento"]].append(r["co_registro"])
    items = {}
    for r in procs:
        code = r["co_procedimento"]
        sh, sa, sp = money(r.get("vl_sh")), money(r.get("vl_sa")), money(r.get("vl_sp"))
        items[code] = {
            "n": r["no_procedimento"],
            "cx": r.get("tp_complexidade") or "0",
            "sx": r.get("tp_sexo") or "I",
            "qmax": num(r.get("qt_maxima_execucao")),
            "perm": num(r.get("qt_dias_permanencia")),
            "sh": sh,
            "sa": sa,
            "sp": sp,
            "tot": round(sh + sa + sp, 2),
            "fin": r.get("co_financiamento") or "",
            "det": sorted(dets.get(code, [])),
            "reg": sorted(regs.get(code, [])),
        }
    competencia = procs[0]["dt_competencia"] if procs else ""
    return {
        "competencia": competencia,
        "label": f"{competencia[4:]}/{competencia[:4]}" if len(competencia) == 6 else competencia,
        "total": len(items),
        "items": items,
    }


def field_changes(a: dict, b: dict) -> dict:
    keys = ["n", "cx", "sx", "qmax", "perm", "sh", "sa", "sp", "tot", "fin", "det", "reg"]
    out = {}
    for k in keys:
        if a.get(k) != b.get(k):
            out[k] = [a.get(k), b.get(k)]
    return out


def diff(old: dict, new: dict) -> dict:
    old_i, new_i = old["items"], new["items"]
    added, removed, changed = [], [], []
    for code, rec in new_i.items():
        if code not in old_i:
            added.append({"c": code, "n": rec["n"], "tot": rec["tot"], "cx": rec["cx"]})
        else:
            ch = field_changes(old_i[code], rec)
            if ch:
                changed.append({"c": code, "n": rec["n"], "ch": ch})
    for code, rec in old_i.items():
        if code not in new_i:
            removed.append({"c": code, "n": rec["n"], "tot": rec["tot"], "cx": rec["cx"]})
    valor = {
        "incluidos": round(sum(x["tot"] for x in added), 2),
        "excluidos": round(sum(x["tot"] for x in removed), 2),
        "valorAntes": round(sum(v["tot"] for v in old_i.values()), 2),
        "valorDepois": round(sum(v["tot"] for v in new_i.values()), 2),
    }
    return {
        "de": old["competencia"],
        "deLabel": old["label"],
        "para": new["competencia"],
        "paraLabel": new["label"],
        "totais": {"antes": old["total"], "depois": new["total"], "incluidos": len(added), "excluidos": len(removed), "alterados": len(changed)},
        "valor": valor,
        "incluidos": sorted(added, key=lambda x: x["c"]),
        "excluidos": sorted(removed, key=lambda x: x["c"]),
        "alterados": sorted(changed, key=lambda x: x["c"]),
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    old = snapshot(ROOT / "data" / "raw" / "202607")
    new = snapshot(ROOT / "data" / "raw" / "202608")
    payload = diff(old, new)
    path = OUT / "diff.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {path} ({path.stat().st_size / 1024:.1f} KB)")
    print(payload["totais"])


if __name__ == "__main__":
    main()
