#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only guards and executable/reference-model checks; never a didactic approval."""
import hashlib
import itertools
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts"))
import canonical_goal_identity_migration as identity

BASE = Path(__file__).parent
STEM = "informatics-q4-terminal-candidate-2026-11-06"


def check(condition, label):
    if not condition:
        raise ValueError(label)


def run():
    manifest = json.loads((BASE / (STEM + ".review-input.json")).read_bytes())
    binding = manifest["target"]
    source_raw = (ROOT / binding["sourceFile"]).read_bytes()
    check(identity.digest(source_raw) == binding["sourceFileSha256"], "Source guard changed")
    source = json.loads(source_raw)
    goals = {g["id"]: g for g in source["goals"]}
    terminal = goals[binding["goalId"]]
    check(identity.digest(identity.stable(terminal)) == binding["originalGoalCanonicalSha256"], "Goal guard changed")
    check(identity.digest(identity.stable(terminal["examData"])) == binding["originalExamDataCanonicalSha256"], "Exam guard changed")
    proposal_path = ROOT / manifest["proposedExamData"]["path"]
    proposal_raw = proposal_path.read_bytes()
    check(identity.digest(proposal_raw) == manifest["proposedExamData"]["rawSha256"], "Candidate bytes changed")
    proposal = json.loads(proposal_raw)
    check(proposal["reviewStatus"] == "draft" and manifest["status"] == "candidate-review-pending", "False review claim")
    check(proposal["coveredGoalIds"] == terminal["examData"]["coveredGoalIds"] == binding["coveredGoalIds"], "Coverage changed")
    check(proposal["taskContent"] == (BASE / (STEM + ".task.md")).read_text(), "Task text differs")
    check(proposal["solutionContent"] == (BASE / (STEM + ".solution.md")).read_text(), "Solution text differs")
    for artifact in manifest["authoredMaterials"]:
        check(identity.digest((ROOT / artifact["path"]).read_bytes()) == artifact["sha256"], "Material changed: " + artifact["path"])
    steps = proposal["scoring"]["steps"]
    check(len(steps) == 19 and {s["id"] for s in steps} == {f"K{i:02}" for i in range(1, 20)}, "Criterion set differs")
    check(all(s["points"] == 1 for s in steps) and proposal["scoring"]["maxPoints"] == proposal["scoring"]["passingPoints"] == 19, "Compensating pass possible")
    check([r["goalId"] for r in manifest["goalEvidenceBindings"]] == proposal["coveredGoalIds"], "Evidence mapping differs")
    for row in manifest["goalEvidenceBindings"]:
        check(identity.digest(identity.stable(goals[row["goalId"]])) == row["goalCanonicalSha256"], "Covered goal changed")
        check(goals[row["goalId"]] == row["originalGoal"], "Bound full goal changed")
        check(row["criterionId"] == row["scoringStepId"] and row["points"] == 1, "Wrong rubric binding")

    solution = proposal["solutionContent"]
    program = re.search(r"```python\n(.*?)\n```", solution, re.S).group(1)
    # Executes the locally authored solution's exact two Python definitions.
    namespace = {}
    exec(compile(program, "authored-Q4-full-adder-solution", "exec"), namespace)
    full_add, add_two = namespace["full_add"], namespace["add_two_bits"]
    for x, y, c in itertools.product(range(2), repeat=3):
        s, carry = full_add(x, y, c)
        check(x + y + c == s + 2 * carry, "Full adder mismatch")
    for a, b in itertools.product(range(4), repeat=2):
        check(add_two(a, b) == a + b, "Ripple adder mismatch")
    for a, b, c in itertools.product(range(2), repeat=3):
        dnf = (a and not b and c) or (a and b and not c) or (a and b and c)
        check(bool(dnf) == bool(a and (b or c)), "Freigabe DNF/KV mismatch")
    check(((0 and 0) or 1) != (0 and (0 or 1)), "Missing circuit counterexample")
    check(0x2D + 0x17 == 0x44 and ((~13 + 1) & 255) == 0xF3 and 0x7F + 1 == 0x80, "Binary arithmetic mismatch")
    q, d_outputs = 0, []
    for d, edge in [(1, "up"), (0, "none"), (0, "down"), (0, "up"), (1, "up")]:
        if edge == "up":
            q = d
        d_outputs.append(q)
    check(d_outputs == [1, 1, 1, 0, 1], "D flip-flop trace mismatch")
    rs = {(r, s, old): None if r and s else 1 if s else 0 if r else old
          for r, s, old in itertools.product(range(2), repeat=3)}
    check([rs[(r, s, 0)] for r, s in [(0, 0), (0, 1), (1, 0), (1, 1)]] == [0, 1, 0, None], "RS Q0 mismatch")
    check([rs[(r, s, 1)] for r, s in [(0, 0), (0, 1), (1, 0), (1, 1)]] == [1, 1, 0, None], "RS Q1 mismatch")

    results = []
    for first_positions in itertools.combinations(range(6), 3):
        counters, registers, n = [0, 0], [None, None], 0
        for position in range(6):
            thread = 0 if position in first_positions else 1
            op = counters[thread]
            if op == 0:
                registers[thread] = n
            elif op == 1:
                registers[thread] += 1
            else:
                n = registers[thread]
            counters[thread] += 1
        results.append(n)
    check(len(results) == 20 and set(results) == {1, 2}, "Thread interleavings differ")
    check(results.count(1) == 18 and results.count(2) == 2, "Interleaving outcome counts differ")
    check(1 + 3 * 2 == 7 and 1 + 3 * 0.5 == 2.5, "RAM arithmetic mismatch")
    check(3 * 30 == 90 and (4 - 1) * 30 == 90 and 90 <= 120, "Cloud arithmetic mismatch")

    prolog_text = (BASE / (STEM + ".prolog.pl")).read_text()
    def facts(name):
        return re.findall(r"(?m)^" + name + r"\((\w+),(\w+)\)\.$", prolog_text)
    parents = facts("parent")
    grandparents = [(a, d) for a, b in parents for c, d in parents if b == c]
    check(grandparents == [("ada", "dora"), ("ada", "emil")], "Kinship reference mismatch")
    siblings = [(x, y) for p, x in parents for q, y in parents if p == q and x != y]
    check(siblings == [("ben", "clara"), ("clara", "ben")], "Sibling reference mismatch")
    def allowed(badges):
        return [(p, z) for p, role in facts("role") for z, required in facts("zone")
                if role == required and (p, "valid") in badges]
    check(allowed(facts("badge")) == [("ada", "lab"), ("ben", "library")], "Access reference mismatch")
    changed = [(p, "valid" if p == "clara" else state) for p, state in facts("badge")]
    check(allowed(changed) == [("ada", "lab"), ("ben", "library"), ("clara", "lab")], "Fact-change reference mismatch")
    edges = facts("edge")
    def paths(start, finish, seen):
        if start == finish:
            yield seen
        for left, right in edges:
            if left == start and right not in seen:
                yield from paths(right, finish, seen + [right])
    path_answers = list(paths("start", "finish", ["start"]))
    check(path_answers == [["start", "a", "finish"], ["start", "b", "a", "finish"]], "Graph reference mismatch")

    node = subprocess.run(["node", str(BASE / (STEM + ".functional.mjs"))], check=True, capture_output=True, text=True)
    functional = json.loads(node.stdout)
    check(functional["status"] == "PASS", "Functional executable failed")
    return {"status": "PASS-bounded-executable-and-reference-checks-only", "readOnly": True,
            "candidateExamDataSha256": identity.digest(proposal_raw), "sourceSha256": identity.digest(source_raw),
            "coverageBindings": 19, "completeBinaryCriteria": 19, "compensationPossibleAtPassingThreshold": False,
            "executedAuthoredPython": {"fullAdderCases": 8, "rippleAdderCases": 16},
            "booleanCases": 8, "rsCases": 8, "dFlipFlopOutputs": d_outputs,
            "threadInterleavings": {"total": 20, "final1": 18, "final2": 2},
            "functionalNodeExecution": functional,
            "prologReferenceModel": {"sourceFactsRead": True, "grandparentAnswers": grandparents, "simplePathAnswers": path_answers},
            "prologProgramExecuted": False, "prologRuntimeAvailable": shutil.which("swipl") is not None,
            "limits": ["Prolog fact/reference models are not a Prolog interpreter or clause/cut execution proof.",
                       "Term-equation reasoning, security explanations, didactic quality and complete competence coverage still need independent review.",
                       "No runtime, curriculum, learner, QA, publication or release state is changed."]}


if __name__ == "__main__":
    try:
        print(json.dumps(run(), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError, subprocess.CalledProcessError) as invalid:
        print(json.dumps({"status": "FAIL", "error": str(invalid)}), file=sys.stderr)
        sys.exit(1)
