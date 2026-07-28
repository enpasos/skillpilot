#!/usr/bin/env python3
"""Reject formula-sheet wording in authored learning-goal competencies.

Source extraction artifacts may preserve the wording of a curriculum. An
operative learning goal, however, must describe what a learner understands or
can do. A narrowly documented exception is possible only when the normative
source explicitly requires formula-sheet use.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
CURRICULA = ROOT / "curricula"
EXCEPTIONS_PATH = ROOT / "scripts" / "config" / "competency-wording-exceptions.json"
SEMANTIC_FIELDS = ("title", "titleEn", "description", "descriptionEn")
FORBIDDEN = re.compile(r"\b(?:formelsammlung|formula[\s-]sheet)\b", re.IGNORECASE)


def load_json(path: Path) -> object:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_exceptions() -> dict[tuple[str, str], dict]:
    payload = load_json(EXCEPTIONS_PATH)
    if not isinstance(payload, dict) or not isinstance(payload.get("exceptions"), list):
        raise ValueError(f"{EXCEPTIONS_PATH}: expected an object with an exceptions array")

    exceptions: dict[tuple[str, str], dict] = {}
    required = {"path", "goalId", "sourceRef", "sourceQuote"}
    for index, item in enumerate(payload["exceptions"]):
        if not isinstance(item, dict) or not required <= item.keys():
            raise ValueError(
                f"{EXCEPTIONS_PATH}: exception {index} must contain "
                f"{', '.join(sorted(required))}"
            )
        if not all(isinstance(item[field], str) and item[field].strip() for field in required):
            raise ValueError(f"{EXCEPTIONS_PATH}: exception {index} contains an empty field")
        if not FORBIDDEN.search(item["sourceQuote"]):
            raise ValueError(
                f"{EXCEPTIONS_PATH}: exception {index} sourceQuote does not document "
                "the otherwise forbidden wording"
            )
        key = (item["path"], item["goalId"])
        if key in exceptions:
            raise ValueError(f"{EXCEPTIONS_PATH}: duplicate exception for {key}")
        exceptions[key] = item
    return exceptions


def main() -> int:
    try:
        exceptions = load_exceptions()
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(f"Competency wording configuration error: {error}", file=sys.stderr)
        return 2

    findings: list[str] = []
    seen_exceptions: set[tuple[str, str]] = set()
    landscape_count = 0
    goal_count = 0

    for path in sorted(CURRICULA.rglob("*.json")):
        try:
            payload = load_json(path)
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(payload, dict) or not isinstance(payload.get("goals"), list):
            continue

        landscape_count += 1
        relative_path = path.relative_to(ROOT).as_posix()
        for goal in payload["goals"]:
            if not isinstance(goal, dict) or not isinstance(goal.get("id"), str):
                continue
            goal_count += 1
            fields = [
                field
                for field in SEMANTIC_FIELDS
                if isinstance(goal.get(field), str) and FORBIDDEN.search(goal[field])
            ]
            if not fields:
                continue

            key = (relative_path, goal["id"])
            if key in exceptions:
                seen_exceptions.add(key)
                continue
            findings.append(
                f"{relative_path}: goal {goal['id']} uses formula-sheet wording "
                f"in {', '.join(fields)}"
            )

    stale_exceptions = sorted(set(exceptions) - seen_exceptions)
    for path, goal_id in stale_exceptions:
        findings.append(f"{EXCEPTIONS_PATH.relative_to(ROOT)}: stale exception for {path} / {goal_id}")

    if findings:
        print("Competency wording validation failed:", file=sys.stderr)
        for finding in findings:
            print(f"- {finding}", file=sys.stderr)
        print(
            "Canonical learning goals must express motivation, understanding, reasoning, "
            "or purposeful application. Preserve literal curriculum wording in source "
            "extraction artifacts. Add an exception only with an exact normative source "
            "reference and quote.",
            file=sys.stderr,
        )
        return 1

    print(
        f"Competency wording validation passed: {goal_count} goals "
        f"across {landscape_count} landscapes; {len(exceptions)} documented exceptions."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
