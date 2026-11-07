#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only six-goal candidate guards and bounded executable/reference checks."""
import itertools
import json
from pathlib import Path
import re
import shutil
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts"))
import canonical_goal_identity_migration as identity

BASE = Path(__file__).parent
STEM = "informatics-q4-gk-terminal-candidate-2026-11-06"


def check(condition, message):
    if not condition:
        raise ValueError(message)


def run():
    m = json.loads((BASE / (STEM + ".review-input.json")).read_bytes())
    source_raw = (ROOT / m["sourceGuard"]["path"]).read_bytes()
    check(identity.digest(source_raw) == m["sourceGuard"]["sha256"], "Source guard changed")
    source = json.loads(source_raw)
    goals = {g["id"]: g for g in source["goals"]}
    old = goals[m["sourceGuard"]["original19GoalId"]]
    check(identity.digest(identity.stable(old)) == m["sourceGuard"]["original19GoalCanonicalSha256"], "Original19 definition changed")
    ids = [g for g in old["examData"]["coveredGoalIds"] if "GK" in goals[g].get("tags", [])]
    candidate_raw = (ROOT / m["proposedExamData"]["path"]).read_bytes()
    check(identity.digest(candidate_raw) == m["proposedExamData"]["sha256"], "Candidate bytes changed")
    candidate = json.loads(candidate_raw)
    check(len(ids) == 6 and ids == candidate["coveredGoalIds"] == m["coverageDerivation"]["coveredGoalIds"], "Wrong GK subset/order")
    check(m["status"] == "candidate-review-pending" and candidate["reviewStatus"] == "draft", "False release claim")
    check(m["proposedNewGoalId"] not in goals, "New goal already exists in this source; explicit rebase required")
    meta = m["proposedGoalWithoutExamData"]
    meta_raw = (ROOT / m["metaSource"]["path"]).read_bytes()
    check(identity.digest(meta_raw) == m["metaSource"]["sha256"], "Independent metadata source changed")
    meta_source = json.loads(meta_raw)
    check(meta_source["valueWithoutExamData"] == meta and meta_source["requiredCoveredGoalIds"] == ids,
          "Wrong independent metadata/coverage binding")
    check(meta["id"] == m["proposedNewGoalId"] and meta["tags"] == ["GK", "Practice", "Assessment"], "Wrong own GK identity/role")
    check(identity.digest(identity.stable(meta)) == m["metaSource"]["valueWithoutExamDataCanonicalSha256"], "GK metadata binding changed")
    criteria = {"K01", "K02", "K04", "K05", "K07", "K08"}
    steps = candidate["scoring"]["steps"]
    check(len(steps) == 6 and {s["id"] for s in steps} == criteria and all(s["points"] == 1 for s in steps), "Rubric differs")
    check(candidate["scoring"]["maxPoints"] == candidate["scoring"]["passingPoints"] == 6, "Compensating pass possible")
    check(candidate["taskContent"] == (BASE / (STEM + ".task.md")).read_text(), "Task text differs")
    check(candidate["solutionContent"] == (BASE / (STEM + ".solution.md")).read_text(), "Solution text differs")
    check(set(re.findall(r"\[(K\d\d)\]", candidate["taskContent"])) == criteria, "Task criterion set differs")
    for artifact in m["authoredMaterials"]:
        check(identity.digest((ROOT / artifact["path"]).read_bytes()) == artifact["sha256"], "Material changed")
    check([r["goalId"] for r in m["goalEvidenceBindings"]] == ids, "Goal-to-evidence mapping differs")
    for row in m["goalEvidenceBindings"]:
        actual = goals[row["goalId"]]
        check(actual == row["originalGoal"] and "GK" in actual["tags"], "Bound goal changed/not GK")
        check(identity.digest(identity.stable(actual)) == row["goalCanonicalSha256"], "Goal hash changed")
        check(row["criterionId"] in criteria and row["points"] == 1, "Wrong criterion mapping")
    derived = m["derivedFrom19Candidate"]
    check(identity.digest((ROOT / derived["examDataPath"]).read_bytes()) == derived["examDataSha256"], "Reviewed19 candidate changed")

    code = re.search(r"```python\n(.*?)\n```", candidate["solutionContent"], re.S).group(1)
    namespace = {}
    exec(compile(code, "authored-GK-full-adder", "exec"), namespace)
    for x, y, c in itertools.product(range(2), repeat=3):
        s, k = namespace["full_add"](x, y, c)
        check(x + y + c == s + 2 * k, "Full-adder mismatch")
    for a, b in itertools.product(range(4), repeat=2):
        check(namespace["add_two_bits"](a, b) == a + b, "Ripple-adder mismatch")
    for a, b, c in itertools.product(range(2), repeat=3):
        dnf = (a and not b and c) or (a and b and not c) or (a and b and c)
        check(bool(dnf) == bool(a and (b or c)), "Boolean DNF/KV mismatch")
    check(0x2D + 0x17 == 0x44 and ((~13 + 1) & 255) == 0xF3 and 0x7F + 1 == 0x80, "Arithmetic mismatch")
    prolog = (BASE / (STEM + ".prolog.pl")).read_text()
    def facts(name):
        return re.findall(r"(?m)^" + name + r"\((\w+),(\w+)\)\.$", prolog)
    parent = facts("parent")
    grandparent = [(a, d) for a, b in parent for c, d in parent if b == c]
    sibling = [(x, y) for p, x in parent for q, y in parent if p == q and x != y]
    check(grandparent == [("ada", "dora"), ("ada", "emil")], "Kinship reference mismatch")
    check(sibling == [("ben", "clara"), ("clara", "ben")], "Sibling reference mismatch")
    def enter(badges):
        return [(p, z) for p, role in facts("role") for z, required in facts("zone")
                if role == required and (p, "valid") in badges]
    check(enter(facts("badge")) == [("ada", "lab"), ("ben", "library")], "Access reference mismatch")
    changed = [(p, "valid" if p == "clara" else state) for p, state in facts("badge")]
    check(enter(changed) == [("ada", "lab"), ("ben", "library"), ("clara", "lab")], "Changed fact reference mismatch")
    return {"status": "PASS-bounded-checks-only", "readOnly": True, "candidateExamDataSha256": identity.digest(candidate_raw),
            "sourceSha256": identity.digest(source_raw), "gkGoalBindings": 6, "binaryCriteria": 6,
            "passingPoints": 6, "maxPoints": 6, "authoredPythonFullAdderCases": 8,
            "authoredPythonRippleAdderCases": 16, "booleanCases": 8,
            "prologFactReferenceModels": "PASS", "prologProgramExecuted": False,
            "prologRuntimeAvailable": shutil.which("swipl") is not None,
            "independentDidacticReviewClaimed": False, "viewScopeIntegrationClaimed": False,
            "limits": ["Python reference execution and fact models do not execute the Prolog rules.",
                       "Global collision and complete first-party view/profile proof belong to the separate reviewed scope proposal.",
                       "No source, stored result, QA, practice, publication or release state is modified."]}


if __name__ == "__main__":
    try:
        print(json.dumps(run(), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError) as invalid:
        print(json.dumps({"status": "FAIL", "error": str(invalid)}), file=sys.stderr)
        sys.exit(1)
