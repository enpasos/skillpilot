"""Audit numeric pass marks in canonical Gymnasium assessments. SPDX-License-Identifier: Apache-2.0"""

import argparse
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
CATALOG = Path("curricula/DE/Gymnasium/canonical")


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


def requires_revision(exam, previous):
    scoring = exam["scoring"]
    return (scoring["maxPoints"] > 1 and scoring["passingPoints"] >= scoring["maxPoints"]
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
    total = full_marks = 0
    failures = []
    for path in paths:
        rel = path.relative_to(ROOT).as_posix()
        old = {}
        if args.base and rel in base_files:
            old = scored_exams(json.loads(subprocess.check_output(["git", "show", f"{base}:{rel}"], cwd=ROOT)))
        exams = scored_exams(json.loads(path.read_bytes()))
        for goal_id, exam in exams.items():
            total += 1
            if requires_revision(exam, None):
                full_marks += 1
                if args.base and requires_revision(exam, old.get(goal_id)):
                    failures.append(f"{rel}: {goal_id}")
    print(f"{total} scored assessments, {full_marks} multi-point assessments with a full-mark threshold.")
    for item in failures:
        print(f"{item} needs a passing score below full marks and a review of partial credit and coverage.",
              file=sys.stderr)
    return int(bool(failures))


if __name__ == "__main__":
    sys.exit(main())
