# SPDX-License-Identifier: Apache-2.0
"""Verify sealed A01/SC01 review inputs and mathematical rubric bounds only."""
import datetime
import hashlib
import importlib.util
import json
import re
import subprocess
from pathlib import Path

import jsonschema

ROOT = Path.cwd()
BASE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10"
PACKAGE = BASE / "chemie-b008-five-terminal-a01-sc01-targeted-independent-a-20261010-v1"
AUTHOR = BASE / "chemie-b008-five-assessments-sc01-sum-gate-author-successor-20261010-v1"
A01 = BASE / "chemie-b008-modelportfolio-a01-targeted-author-successor-20261010-v1"
ORIGINAL = BASE / "chemie-b008-phase-local-inquiry-model-society-terminal-author-20261010-v1"
FIRST_A = BASE / "chemie-b008-five-terminal-assessments-independent-a-20261010-v1"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def binding(path):
    return {"path": path.relative_to(ROOT).as_posix(),
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "bytes": path.stat().st_size}


def verify(record):
    path = ROOT / record["path"]
    assert not Path(record["path"]).is_absolute()
    assert path.resolve().is_relative_to(ROOT.resolve()) and not path.is_symlink()
    assert binding(path) == record
    assert subprocess.run(["git", "check-ignore", "--quiet", record["path"]], cwd=ROOT).returncode == 1


frozen_counts = {}
for folder, seal in [(ORIGINAL, "author-successor.final.freeze.json"),
                     (A01, "A01-author-successor.final.freeze.json"),
                     (AUTHOR, "SC01-author-successor.final.freeze.json"),
                     (FIRST_A, "independent-a.final.freeze.json")]:
    data = read(folder / seal)
    for record in data["files"]:
        verify(record)
    frozen_counts[folder.name] = len(data["files"])
for seal in ["FIRST.A01-targeted-review.freeze.json", "FIRST.SC01-current-review.freeze.json"]:
    verify(read(PACKAGE / seal)["firstReview"])
inputs = read(AUTHOR / "inputs/portable-exact-input-and-adapter-bindings.json")["inputs"]
for record in inputs:
    verify(record)
review = read(PACKAGE / "FIRST.SC01-current-five-assessment-scoring-and-effect.actual-independent-a.json")
for record in review["inputBindings"]:
    verify(record)
candidate_path = AUTHOR / "candidate/whole517.inactive.SC01-five-assessment-author-successor.json"
candidate = read(candidate_path)
before = read(A01 / "candidate/whole517.inactive.modelportfolio-A01-author-successor.json")
by = {goal["id"]: goal for goal in candidate["goals"]}
old = {goal["id"]: goal for goal in before["goals"]}
assert len(candidate["goals"]) == len(by) == len(old) == 517
changed = [goal_id for goal_id in old if old[goal_id] != by[goal_id]]
review_ids = [row["goalId"] for row in review["fiveAssessmentCurrentScoringDecisions"]]
assert sorted(changed) == sorted(review_ids)
assert sum(old[goal_id] == by[goal_id] for goal_id in old) == 512
adapter = ROOT / "backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1McpContractAdapter.java"
source = adapter.read_text()
max_desc = int(re.search(r"MAX_SCORING_DESCRIPTION_LENGTH = (\d+)", source).group(1))
max_steps = int(re.search(r"MAX_SCORING_STEPS = (\d+)", source).group(1))
max_identifier = int(re.search(r"MAX_IDENTIFIER_LENGTH = (\d+)", source).group(1))
assert "if (earnedPoints < evaluation.scoring().passingPoints())" in source
max_seen = 0
for goal_id in review_ids:
    old_goal, goal = old[goal_id], by[goal_id]
    assert [field for field in set(old_goal) | set(goal)
            if old_goal.get(field) != goal.get(field)] == ["examData"]
    old_exam, exam = old_goal["examData"], goal["examData"]
    changed_fields = {field for field in set(old_exam) | set(exam)
                      if old_exam.get(field) != exam.get(field)}
    assert changed_fields == {"taskContent", "solutionContent", "scoring", "sourceArtifactPath"}
    assert exam["reviewStatus"] == "needs_review"
    assert goal["requires"] == exam["coveredGoalIds"]
    scoring, old_scoring = exam["scoring"], old_exam["scoring"]
    assert scoring["maxPoints"] == old_scoring["maxPoints"]
    assert [(s["id"], s["points"]) for s in scoring["steps"]] == [
        (s["id"], s["points"]) for s in old_scoring["steps"]]
    assert 0 < len(scoring["steps"]) <= max_steps
    assert len({s["id"] for s in scoring["steps"]}) == len(scoring["steps"])
    assert sum(s["points"] for s in scoring["steps"]) == scoring["maxPoints"]
    minimum_step = min(s["points"] for s in scoring["steps"])
    assert scoring["passingPoints"] == scoring["maxPoints"] - minimum_step + 1
    separator = "\n\n## Verbindliche Punktbewertung der Pflichtteile\n\n"
    task_core, task_rule = exam["taskContent"].split(separator)
    solution_core, solution_rule = exam["solutionContent"].split(separator)
    assert task_rule == solution_rule
    expected_task = old_exam["taskContent"].replace(
        f'{old_scoring["passingPoints"]} BE', f'{scoring["passingPoints"]} BE')
    expected_solution = old_exam["solutionContent"].replace(
        f'{old_scoring["passingPoints"]} BE', f'{scoring["passingPoints"]} BE')
    if goal_id == "ab315f52-a9e3-5c1c-a404-7fb1a96a3eaf":
        expected_solution = expected_solution.replace(
            "auch wenn schriftliche Teile rechnerisch 51 BE erreichen könnten",
            "wenn ohne Anwendung der operativen Nullregeln aus anderen Teilen genügend Punkte zusammengezählt werden könnten")
    assert task_core == expected_task and solution_core == expected_solution
    for step in scoring["steps"]:
        desc = step["description"]
        java_length = len(desc.encode("utf-16-le")) // 2
        max_seen = max(max_seen, java_length)
        assert java_length <= max_desc and len(step["id"]) <= max_identifier
        assert step["points"] > 0 and desc in task_rule
        assert "0 BE für diesen gesamten Schritt" in desc
        assert "mindestens eine" in desc and "vollständig fehlt" in desc
        assert re.findall("„([^“]+)“", desc)
    task = ROOT / exam["sourceArtifactPath"]
    solution = task.with_name(task.name.replace(".task.de.md", ".solution.de.md"))
    prefix = "<!-- SPDX-License-Identifier: CC-BY-4.0 -->\n"
    assert task.read_text() == prefix + exam["taskContent"] + "\n"
    assert solution.read_text() == prefix + exam["solutionContent"] + "\n"
for row in review["independentNegativeIndividualAbsenceCases"]:
    goal = by[row["goalId"]]
    scoring = goal["examData"]["scoring"]
    step = next(s for s in scoring["steps"] if s["id"] == row["affectedStepId"])
    assert row["individuallyOmittedRequiredDimension"] in step["description"]
    bound = scoring["maxPoints"] - step["points"]
    assert bound == row["earnedTotalUpperBound"] < scoring["passingPoints"]
    assert not row["passesCurrentAggregateGate"]
assert len(review["independentNegativeIndividualAbsenceCases"]) == 86
assert len(review["independentNegativeWholeStepCases"]) == 23
for row in review["independentPositiveCompletePartialCreditCases"]:
    scoring = by[row["goalId"]]["examData"]["scoring"]
    points = row["constructedOriginalQualityBasedStepPoints"]
    assert len(points) == len(scoring["steps"])
    assert all(0 < earned <= step["points"] for earned, step in zip(points, scoring["steps"]))
    assert sum(points) == scoring["passingPoints"]
hold = by["eed5eda3-2daf-5d48-b935-23dadd622d9b"]
assert hold["extendedData"]["courseScopeHold"]["status"] == "HOLD_UNSPECIFIED_C11"
assert hold["extendedData"]["courseScopeHold"]["explicitScopeKeys"] == []
assert not hold["extendedData"]["courseScopeHold"]["PSelected"]
assert "GK" not in hold["tags"] and "LK" not in hold["tags"]
model_task = by["7bfe515c-e59f-521c-9781-b75e33caf0ec"]["examData"]["taskContent"]
assert "Prüfen Sie für **beide Fälle A und B jeweils eine eigene Hypothese**" in model_task
spec = importlib.util.spec_from_file_location("normal_schema_validator", ROOT / "scripts/validate_schemas.py")
normal = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normal)
schema = read(ROOT / "docs/landscape-runtime.schema.json")
jsonschema.Draft202012Validator(schema).validate(candidate)
affected = sorted(PACKAGE.rglob("*.json"))
assert all(normal.validate_file(str(p.relative_to(ROOT)), schema) for p in affected)
assert normal.curriculum_symlink_errors(ROOT) == []
print(json.dumps({
    "schemaVersion": 1,
    "role": "Scoped normal-schema, exact historical preservation and current adapter-bound rubric verification; no host test or performance observation",
    "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "actualExitCode": 0,
    "wholeCandidate": binding(candidate_path),
    "frozenHistoricalAndAuthorFileCountsExact": frozen_counts,
    "authorExternalInputBindingsExact": len(inputs),
    "other512WholeGoalsExact": True,
    "onlyFiveExamDataFieldsChanged": True,
    "taskAndSolutionScientificCoreExactExceptReviewedThresholdWording": True,
    "all23OperativeStepDescriptionsMeetCurrentBackendBounds": True,
    "maximumStepDescriptionJavaUtf16Length": max_seen,
    "actualBackendMaximumStepDescriptionLength": max_desc,
    "current86IndividualAbsenceBoundsReject": True,
    "current23EntireStepAbsenceBoundsReject": True,
    "currentFiveCompleteImperfectExamplesPass": True,
    "normalRuntimeSchema": "PASS",
    "normalAffectedReviewJsonCount": len(affected),
    "normalCurriculumSymlinkErrors": [],
    "current517NativeContextReproduced": False,
    "actualRuntimeOrHostCalls": 0,
    "C11PSelected": False, "humanApproval": False,
    "operativeWrites": [], "netStrictGain": 0,
}, ensure_ascii=False, indent=2))
