# SPDX-License-Identifier: Apache-2.0
"""Bounded mechanical corroboration, run only after FIRST was sealed."""

from __future__ import annotations

import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = next(parent for parent in ROOT.parents if (parent / "AGENTS.md").is_file())
ORIGINAL = REPO / "tmp/chemie-m7-resumed-20261016/route13-neutral-reviewer-input-v1/INPUT.whole-scientific-goals-before-after.no-peer-votes.json"
EXPECTED_INPUT = "8845a7dac939c7ed785d9a5d36803c0d41c62184847391f7609c46a088fb8054"
FIRST = ROOT / "FIRST.science.frozen.json"
EXPECTED_FIRST = "3f2ba9e97cccea5795dfda4f8fc822f12ad69fe377ebe5cb6011c89900a2cd36"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


assert digest(FIRST) == EXPECTED_FIRST
assert digest(ORIGINAL) == EXPECTED_INPUT
inputs = ROOT / "inputs"
inputs.mkdir(exist_ok=True)
archived = inputs / ORIGINAL.name
if archived.exists():
    assert digest(archived) == EXPECTED_INPUT
else:
    shutil.copyfile(ORIGINAL, archived)
packet = json.loads(archived.read_text())
baseline = {goal["id"]: goal for goal in packet["baseWholeCanonical"]["goals"]}
after = dict(baseline)
rows = []
errors = []
for operation in packet["operations"]:
    goal_id = operation["goalId"]
    whole = operation["afterWhole"]
    candidate = next(goal for goal in whole if goal["id"] == goal_id) if isinstance(whole, list) else whole
    assert candidate["id"] == goal_id
    before_matches = operation["beforeWhole"] == baseline.get(goal_id)
    if not before_matches:
        errors.append({"goalId": goal_id, "kind": "beforeWhole does not equal neutral baseline"})
    exact = operation["exactAfterFile"]
    source_path = Path(exact["path"])
    expected_source = exact["sha256"].removeprefix("sha256:")
    source_hash_matches = digest(source_path) == expected_source
    source = json.loads(source_path.read_text())
    source_goal = next(goal for goal in source if goal["id"] == goal_id) if isinstance(source, list) else source
    source_goal_matches = source_goal == candidate
    if not source_hash_matches or not source_goal_matches:
        errors.append({"goalId": goal_id, "kind": "exact author-source mismatch"})
    after[goal_id] = candidate
    exam = candidate.get("examData")
    rows.append({
        "goalId": goal_id,
        "beforeWholeMatchesBaseline": before_matches,
        "exactAfterSource": str(source_path.relative_to(REPO)),
        "exactAfterSourceSha256": digest(source_path),
        "exactAfterSourceHashMatches": source_hash_matches,
        "exactAfterSourceGoalMatches": source_goal_matches,
        "directRequiresCount": len(candidate.get("requires", [])),
        "containsCount": len(candidate.get("contains", [])),
        "coveredGoalIds": exam.get("coveredGoalIds", []) if exam else [],
        "scoringPoints": sum(step["points"] for step in exam["scoring"]["steps"]) if exam else None,
        "maxPoints": exam["scoring"]["maxPoints"] if exam else None,
        "passingPoints": exam["scoring"]["passingPoints"] if exam else None,
        "taskLanguageFieldsPresent": [key for key in ("taskContent", "taskContentEn") if exam and exam.get(key)],
        "solutionLanguageFieldsPresent": [key for key in ("solutionContent", "solutionContentEn") if exam and exam.get(key)],
    })

for row in rows:
    candidate = after[row["goalId"]]
    for key in ("requires", "contains"):
        refs = candidate.get(key, [])
        if len(set(refs)) != len(refs):
            errors.append({"goalId": row["goalId"], "kind": "duplicate references", "field": key})
        for target in refs:
            if target not in after:
                errors.append({"goalId": row["goalId"], "kind": "unresolved reference", "field": key, "target": target})
    if row["maxPoints"] is not None and row["scoringPoints"] != row["maxPoints"]:
        errors.append({"goalId": row["goalId"], "kind": "scoring sum mismatch"})
    for target in row["coveredGoalIds"]:
        if target not in after or after[target].get("contains") or after[target].get("examData"):
            errors.append({"goalId": row["goalId"], "kind": "covered target not an ordinary baseline leaf", "target": target})


def cycles_for(field):
    seen, active, stack, cycles = set(), set(), [], []

    def visit(goal_id):
        if goal_id in active:
            cycles.append(stack[stack.index(goal_id):] + [goal_id])
            return
        if goal_id in seen or goal_id not in after:
            return
        active.add(goal_id)
        stack.append(goal_id)
        for target in after[goal_id].get(field, []):
            visit(target)
        stack.pop()
        active.remove(goal_id)
        seen.add(goal_id)

    for goal_id in after:
        visit(goal_id)
    return cycles


gk = after["14577339-9e0c-5b44-8e47-91e1a4947367"]
lk = after["32705a3a-9b7f-5cc0-ba41-881d13d0c45b"]
gk_requires, lk_requires = set(gk["requires"]), set(lk["requires"])
gk_lk_only = [goal_id for goal_id in gk["requires"] if "LK" in after[goal_id].get("tags", []) and "GK" not in after[goal_id].get("tags", [])]
require_cycles, contains_cycles = cycles_for("requires"), cycles_for("contains")
report = {
    "recordKind": "bounded-mechanical-corroboration-after-frozen-science",
    "createdAtUtc": datetime.now(timezone.utc).isoformat(),
    "firstScienceSha256Before": digest(FIRST),
    "archivedExactNeutralInput": str(archived.relative_to(REPO)),
    "archivedExactNeutralInputSha256": digest(archived),
    "operationCount": len(rows),
    "baselineObjectCount": len(baseline),
    "virtualAfterObjectCount": len(after),
    "examOperationCount": sum(row["maxPoints"] is not None for row in rows),
    "contextClusterOperationCount": sum(row["maxPoints"] is None for row in rows),
    "rows": rows,
    "courseAdmission": {
        "gkDirectRequires": len(gk_requires),
        "lkDirectRequires": len(lk_requires),
        "gkAdmissionOutsideLkAdmission": sorted(gk_requires - lk_requires),
        "gkAdmissionWithLkOnlyTags": gk_lk_only,
        "gkCoveredCount": len(gk["examData"]["coveredGoalIds"]),
        "lkCoveredCount": len(lk["examData"]["coveredGoalIds"]),
        "assessedTargetsOutsideOwnAdmission": {
            "gk": sorted(set(gk["examData"]["coveredGoalIds"]) - gk_requires),
            "lk": sorted(set(lk["examData"]["coveredGoalIds"]) - lk_requires),
        },
    },
    "requiresCyclesInVirtualAfter": require_cycles,
    "containsCyclesInVirtualAfter": contains_cycles,
    "errors": errors,
    "limits": [
        "Object/list counts are mechanical and are not the curricularAtomic or M7 denominator.",
        "Separate direct DAG checks are not a composition-view, inherited-prerequisite, runtime-frontier or whole-course route certification.",
        "No schema/campaign result mapping, H/R mutation, source/CAS rebind, normal curriculum write, full build or learner execution was performed.",
        "Mechanical evidence cannot broaden the scientific decisions or language boundaries in FIRST.",
    ],
}
assert digest(FIRST) == EXPECTED_FIRST
report["firstScienceSha256After"] = digest(FIRST)
out = ROOT / "MECHANICAL.after-frozen-science.json"
out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
json.loads(out.read_text())
print(json.dumps({key: report[key] for key in ("operationCount", "baselineObjectCount", "virtualAfterObjectCount", "examOperationCount", "contextClusterOperationCount", "courseAdmission", "requiresCyclesInVirtualAfter", "containsCyclesInVirtualAfter", "errors", "firstScienceSha256After")}, ensure_ascii=False, indent=2))
print("ReportSHA256", digest(out))
