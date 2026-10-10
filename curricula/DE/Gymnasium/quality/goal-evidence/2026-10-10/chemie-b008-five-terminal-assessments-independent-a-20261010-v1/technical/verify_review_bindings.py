# SPDX-License-Identifier: Apache-2.0
"""Reproduce scoped technical bindings; this script cannot approve a goal."""
import datetime
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

import jsonschema

ROOT = Path.cwd()
PACKAGE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-five-terminal-assessments-independent-a-20261010-v1"
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-phase-local-inquiry-model-society-terminal-author-20261010-v1"
SOURCE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-dual-bounded-scope-technical-20261010-v1"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def binding(path):
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "bytes": path.stat().st_size,
    }


def verify(record):
    path = ROOT / record["path"]
    assert not Path(record["path"]).is_absolute()
    assert path.resolve().is_relative_to(ROOT.resolve())
    assert not path.is_symlink()
    assert binding(path) == record
    assert subprocess.run(
        ["git", "check-ignore", "--quiet", record["path"]], cwd=ROOT
    ).returncode == 1


first = read(PACKAGE / "FIRST.independent-full-assessment-science-and-route-findings.actual.json")
first_freeze = read(PACKAGE / "FIRST.independent-review.freeze.json")
verify(first_freeze["firstReview"])
for record in first["inputBindings"]:
    verify(record)
author_freeze = read(AUTHOR / "author-successor.final.freeze.json")
for record in author_freeze["files"]:
    verify(record)
author_inputs = read(AUTHOR / "inputs/actual-input-bindings.json")["inputs"]
for record in author_inputs:
    verify(record)

candidate_path = AUTHOR / "candidate/whole517.inactive.terminal-assessment-author.json"
candidate = read(candidate_path)
by = {goal["id"]: goal for goal in candidate["goals"]}
assert len(candidate["goals"]) == len(by) == 517
baseline_path = ROOT / read(AUTHOR / "author/four-existing-parent-changes.whole-before-after.json")["baseline"]["path"]
old = {goal["id"]: goal for goal in read(baseline_path)["goals"]}
assert len(old) == 511
changed = [goal_id for goal_id in old if old[goal_id] != by[goal_id]]
assert len(changed) == 4
assert sum(old[goal_id] == by[goal_id] for goal_id in old) == 507
for goal_id in changed:
    assert [key for key in set(old[goal_id]) | set(by[goal_id])
            if old[goal_id].get(key) != by[goal_id].get(key)] == ["contains"]
for goal in read(AUTHOR / "author/new-six-goal-bodies.whole.json")["newGoals"]:
    assert goal == by[goal["id"]]

excerpts = read(AUTHOR / "inputs/nine-frozen-source-scope-extracts.exact.json")
original_rows = read(SOURCE / "paired24-literal-independent-source-decisions.actual.json")["rows"]
original_edges = [json.loads(line) for line in
                  (SOURCE / "paired63-literal-independent-partial-edge-decisions.actual.jsonl").read_text().splitlines()
                  if line.strip()]
assert len(excerpts["rows"]) == 9 and len(excerpts["operators"]) == 21
assert all(row in original_rows for row in excerpts["rows"])
assert all(edge in original_edges for edge in excerpts["operators"])
assert all(not edge["wholeCourseApproval"] and not edge["wholeDutyApproval"]
           for edge in excerpts["operators"])
c11 = next(row for row in excerpts["rows"] if row["goalId"].startswith("e5a5dcd8"))
assert c11["explicitScopeKeys"] == [] and c11["courseScopeHeld"]
assert not c11["selectedTechnicalBoundedScope"]

assessment_rows = []
for review in first["assessmentDecisions"]:
    goal = by[review["goalId"]]
    exam = goal["examData"]
    task = ROOT / exam["sourceArtifactPath"]
    solution = task.with_name(task.name.replace(".task.de.md", ".solution.de.md"))
    # Files carry their own license comment and a terminating newline. The
    # embedded task/solution strings omit exactly these two authoring details.
    # No scientific text, whitespace inside the text, or other comment is ignored.
    license_prefix = "<!-- SPDX-License-Identifier: CC-BY-4.0 -->\n"
    task_text, solution_text = task.read_text(), solution.read_text()
    assert task_text.startswith(license_prefix) and task_text.endswith("\n")
    assert solution_text.startswith(license_prefix) and solution_text.endswith("\n")
    assert task_text[len(license_prefix):-1] == exam["taskContent"]
    assert solution_text[len(license_prefix):-1] == exam["solutionContent"]
    assert goal["requires"] == exam["coveredGoalIds"]
    assert exam["reviewStatus"] == "needs_review"
    assert sum(step["points"] for step in exam["scoring"]["steps"]) == exam["scoring"]["maxPoints"]
    assert 0 < exam["scoring"]["passingPoints"] <= exam["scoring"]["maxPoints"]
    assessment_rows.append({"goalId": goal["id"], "task": binding(task),
                            "solution": binding(solution), "points": exam["scoring"]["maxPoints"],
                            "passingPoints": exam["scoring"]["passingPoints"],
                            "fileToEmbeddedTextNormalization": "omit exactly CC-BY-4.0 license-comment first line and one final newline; full remaining text identical",
                            "status": "needs_review", "numericGateAloneProvesEssentialPerformance": False})
assert len(assessment_rows) == 5
finding = first["scientificFindings"][0]
exam = by[finding["goalId"]]["examData"]
assert finding["taskLiteral"] in exam["taskContent"]
assert finding["rubricLiteral"] in exam["solutionContent"]
for row in first["nineCompleteDutyRouteAndSourceDecisions"]:
    for terminal_id in row["terminalAssessmentGoalIds"]:
        assert row["goalId"] in by[terminal_id]["requires"]
        assert row["goalId"] in by[terminal_id]["examData"]["coveredGoalIds"]
hold = by["eed5eda3-2daf-5d48-b935-23dadd622d9b"]
assert "GK" not in hold["tags"] and "LK" not in hold["tags"]
assert hold["extendedData"]["courseScopeHold"]["status"] == "HOLD_UNSPECIFIED_C11"
assert hold["extendedData"]["courseScopeHold"]["explicitScopeKeys"] == []
assert not hold["extendedData"]["courseScopeHold"]["PSelected"]

spec = importlib.util.spec_from_file_location("normal_schema_validator", ROOT / "scripts/validate_schemas.py")
normal = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normal)
schema = read(ROOT / "docs/landscape-runtime.schema.json")
jsonschema.Draft202012Validator(schema).validate(candidate)
affected_json = sorted(PACKAGE.rglob("*.json"))
assert all(normal.validate_file(str(path.relative_to(ROOT)), schema) for path in affected_json)
symlink_errors = normal.curriculum_symlink_errors(ROOT)
assert symlink_errors == []
result = {
    "schemaVersion": 1,
    "role": "Independent A scoped exact-input and normal schema verification; no science approval inferred from hash equality",
    "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "actualExitCode": 0,
    "authorFrozenFilesExact": len(author_freeze["files"]),
    "authorInputBindingsExact": len(author_inputs),
    "firstInputBindingsExact": len(first["inputBindings"]),
    "wholeCandidate": binding(candidate_path),
    "wholeBaselineGoals": 511, "wholeCandidateGoals": 517,
    "existingWholeGoalsUnchanged": 507,
    "changedExistingGoalsOnlyContains": changed,
    "sourceRowsExactOriginal": 9, "sourcePartialOperatorsExactOriginal": 21,
    "assessmentTaskSolutionAndScoringBindings": assessment_rows,
    "firstFindingQuotesExact": True,
    "allNineAuthoredDirectTerminalReferencesExact": True,
    "firstReviewRetainedExact": first_freeze["firstReview"],
    "normalRuntimeSchema": "PASS", "normalValidateFileAffectedJsonCount": len(affected_json),
    "normalCurriculumSymlinkErrors": symlink_errors,
    "C11PSelected": False, "current517NativeContextReproduced": False,
    "actualLearnerPerformancesObserved": 0, "humanApproval": False,
    "activeWrites": [], "netStrictGain": 0,
}
print(json.dumps(result, ensure_ascii=False, indent=2))
