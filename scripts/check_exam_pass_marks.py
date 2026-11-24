"""Audit numeric pass marks in canonical Gymnasium assessments. SPDX-License-Identifier: Apache-2.0"""

import argparse
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
CATALOG = Path("curricula/DE/Gymnasium/canonical")
# Product Owner decision of 24 November 2026: a learner who has understood everything and makes
# occasional small formal errors must pass. The share follows the accepted Hessian E.1 parts
# (14 of 17, 15 of 18, 17 of 20). Indispensable performances are protected by their weight.
MAX_PASSING_SHARE = 0.85


def scored_exams(document):
    exams = {}
    for goal in document["goals"]:
        exam = goal.get("examData") or {}
        if exam.get("scoring"):
            exams[goal["id"]] = exam
    return exams


def grading_material(exam):
    # Metadata-only changes do not constitute a new task or grading decision.
    return {key: exam.get(key) for key in (
        "taskContent", "taskContentEn", "solutionContent", "solutionContentEn", "scoring", "coveredGoalIds",
    )}


def graded_in_parts(exam):
    scoring = exam["scoring"]
    return scoring["maxPoints"] > 1 or len(scoring.get("steps", [])) > 1


def above_achievable_pass_mark(exam):
    scoring = exam["scoring"]
    return graded_in_parts(exam) and scoring["passingPoints"] > MAX_PASSING_SHARE * scoring["maxPoints"] + 1e-9


def requires_revision(exam, previous):
    return (above_achievable_pass_mark(exam)
            and (previous is None or grading_material(exam) != grading_material(previous)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", help="Compare new or revised material with this Git commit (CI).")
    args = parser.parse_args()
    base_files = set()
    if args.base:
        base = subprocess.check_output(["git", "rev-parse", "--verify", args.base + "^{commit}"],
                                       cwd=ROOT, text=True).strip()
        base_files = set(subprocess.check_output(["git", "ls-tree", "-r", "--name-only", base, "--", str(CATALOG)],
                                                 cwd=ROOT, text=True).splitlines())
    paths = sorted((ROOT / CATALOG).glob("*.json"))
    if not paths:
        parser.error("canonical Gymnasium catalog missing")
    total = above = full_marks = 0
    failures = []
    for path in paths:
        rel = path.relative_to(ROOT).as_posix()
        old = {}
        if args.base and rel in base_files:
            old = scored_exams(json.loads(subprocess.check_output(["git", "show", f"{base}:{rel}"], cwd=ROOT)))
        exams = scored_exams(json.loads(path.read_bytes()))
        for goal_id, exam in exams.items():
            total += 1
            if above_achievable_pass_mark(exam):
                above += 1
                full_marks += exam["scoring"]["passingPoints"] >= exam["scoring"]["maxPoints"]
                if args.base and requires_revision(exam, old.get(goal_id)):
                    failures.append(f"{rel}: {goal_id}")
    print(f"{total} scored assessments, {above} graded assessments with a pass mark above "
          f"{MAX_PASSING_SHARE:.0%} of the points, {full_marks} of them requiring full marks.")
    for item in failures:
        print(f"{item} needs a pass mark of at most {MAX_PASSING_SHARE:.0%} of the points. Protect indispensable "
              "performances by their weight and review partial credit and coverage.", file=sys.stderr)
    return int(bool(failures))


if __name__ == "__main__":
    sys.exit(main())
