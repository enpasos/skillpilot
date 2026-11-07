#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Run the frozen Q4 reference programs in an actual SWI-Prolog interpreter.

This is executable program evidence, not human approval or a learner result.
The two source files remain unchanged; fact variants are private copies.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile


BASE = Path(__file__).resolve().parent
PROGRAMS = {
    "LK19": ("informatics-q4-terminal-candidate-2026-11-06.prolog.pl",
             "0fd5c0b1a2ed17e3157983f1672faed6a8d4f5d534911eac8f81d8fa6ac2cad0"),
    "GK6": ("informatics-q4-gk-terminal-candidate-2026-11-06.prolog.pl",
            "53252cb647d764b5787c01ea915d47f95c50f50c138e4eebb79a713a479f4e82"),
}
COMMON = [
    ("children", "findall(K,parent(ada,K),A)", "[ben,clara]"),
    ("grandparents", "findall([G,K],grandparent(G,K),A)", "[[ada,dora],[ada,emil]]"),
    ("sibling_forward", "findall(X,sibling(ben,X),A)", "[clara]"),
    ("sibling_backward", "findall(X,sibling(X,ben),A)", "[clara]"),
    ("sibling_self_rejected", "findall(yes,sibling(ben,ben),A)", "[]"),
    ("lab", "findall(P,can_enter(P,lab),A)", "[ada]"),
    ("library", "findall(P,can_enter(P,library),A)", "[ben]"),
    ("renewal", "findall(P,needs_renewal(P),A)", "[clara]"),
]
LK = [
    ("member_present", "findall(yes,member_id(a,[start,a,finish]),A)", "[yes]"),
    ("member_absent", "findall(yes,member_id(b,[start,a,finish]),A)", "[]"),
    ("length_empty", "findall(N,length_list([],N),A)", "[0]"),
    ("length_three", "findall(N,length_list([start,a,finish],N),A)", "[3]"),
    ("append", "findall(P,append_list([start,a],[finish],P),A)", "[[start,a,finish]]"),
    ("append_empty", "findall(P,append_list([],[],P),A)", "[[]]"),
    ("reverse", "findall(P,reverse_list([finish,a,start],P),A)", "[[start,a,finish]]"),
    ("reverse_empty", "findall(P,reverse_list([],P),A)", "[[]]"),
    ("simple_paths", "findall(P,path(start,finish,P),A)",
     "[[start,a,finish],[start,b,a,finish]]"),
    ("null_path", "findall(P,path(start,start,P),A)", "[[start]]"),
    ("bad_cut", "findall(X,gate_bug(X),A)", "[]"),
    ("open_gates", "findall(X,gate(X),A)", "[east]"),
    ("first_open", "findall(X,first_open(X),A)", "[east]"),
    ("total", "findall(T,total_rel([1,2],T),A)", "[5]"),
    ("total_empty", "findall(T,total_rel([],T),A)", "[0]"),
    ("total_reverse_instantiation_error",
     "findall(yes,catch((total_rel([_],2),fail),error(instantiation_error,_),true),A)",
     "[yes]"),
]
BADGE_CHANGED = [
    ("changed_lab", "findall(P,can_enter(P,lab),A)", "[ada,clara]"),
    ("changed_library", "findall(P,can_enter(P,library),A)", "[ben]"),
    ("changed_renewal", "findall(P,needs_renewal(P),A)", "[]"),
]
TWO_GATES = [
    ("two_open_gates", "findall(X,gate(X),A)", "[west,east]"),
    ("first_of_two_open", "findall(X,first_open(X),A)", "[west]"),
]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def verify(swipl, env):
    swipl = str(Path(swipl).resolve())
    version = subprocess.run(
        [swipl, "-q", "-f", "none", "-g",
         "current_prolog_flag(version_data,V),write_canonical(V),nl,halt."],
        env=env, capture_output=True, text=True, check=True, timeout=10)
    rows = []
    with tempfile.TemporaryDirectory(prefix="skillpilot-q4-prolog-") as temp:
        temp = Path(temp)
        for profile, (filename, expected_hash) in PROGRAMS.items():
            source = BASE / filename
            raw = source.read_bytes()
            if digest(raw) != expected_hash:
                raise ValueError("Frozen program bytes changed: " + filename)
            text = raw.decode("utf-8")
            if text.count("badge(clara,expired).") != 1:
                raise ValueError("Fact replacement guard changed")
            variants = [
                (source, "original", COMMON + (LK if profile == "LK19" else [])),
            ]
            changed = temp / (profile + "-badge.pl")
            changed.write_text(text.replace("badge(clara,expired).", "badge(clara,valid)."))
            variants.append((changed, "badge-fact-replaced", BADGE_CHANGED))
            if profile == "LK19":
                if text.count("open(east).") != 1:
                    raise ValueError("Gate insertion guard changed")
                gates = temp / "LK19-two-gates.pl"
                gates.write_text(text.replace("open(east).", "open(west).\nopen(east)."))
                variants.append((gates, "second-open-fact", TWO_GATES))
            for program, variant, queries in variants:
                for label, query, expected in queries:
                    result = subprocess.run(
                        [swipl, "-q", "-f", "none", "-s", str(program),
                         "-g", query + ",write_canonical(A),nl,halt."],
                        env=env, capture_output=True, text=True, timeout=10)
                    actual = result.stdout.strip()
                    if result.returncode != 0 or actual != expected or result.stderr.strip():
                        raise ValueError(json.dumps({"profile": profile, "variant": variant,
                            "query": label, "expected": expected, "actual": actual,
                            "exitCode": result.returncode, "stderr": result.stderr}))
                    rows.append({"profile": profile, "variant": variant, "queryId": label,
                                 "query": query, "actual": actual,
                                 "programSha256": digest(program.read_bytes())})
            if source.read_bytes() != raw:
                raise ValueError("Original program changed during execution")
    return {"schemaVersion": 1, "status": "PASS-actual-Prolog-execution",
            "readOnly": True, "runtimeVersion": version.stdout.strip(),
            "programs": [{"profile": k, "path": str(BASE / v[0]), "sha256": v[1]}
                         for k, v in PROGRAMS.items()],
            "executedQueries": len(rows), "queries": rows,
            "humanApproval": False, "learnerResultsWritten": False,
            "limits": ["Exercises the exact two frozen reference programs and guarded fact variants.",
                       "Does not prove didactic adequacy, actual learner competence, QA release or runtime deployment."]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--swipl", default=shutil.which("swipl"))
    parser.add_argument("--home", type=Path)
    parser.add_argument("--library-path", type=Path)
    args = parser.parse_args()
    if not args.swipl:
        parser.error("An actual SWI-Prolog interpreter is required; no model fallback")
    env = dict(os.environ)
    if args.home:
        env["SWI_HOME_DIR"] = str(args.home.resolve())
    if args.library_path:
        env["LD_LIBRARY_PATH"] = str(args.library_path.resolve())
    try:
        print(json.dumps(verify(args.swipl, env), ensure_ascii=False, indent=2))
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        raise SystemExit(str(error)) from error


if __name__ == "__main__":
    main()
