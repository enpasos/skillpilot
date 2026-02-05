#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path


UUID_RE = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


def is_uuid(value):
    return isinstance(value, str) and UUID_RE.match(value) is not None


def main():
    repo_root = Path(__file__).resolve().parents[1]
    curricula_root = repo_root / "curricula"
    if not curricula_root.exists():
        print(f"ERROR: curricula directory not found at {curricula_root}")
        return 1

    errors = []
    error_count = 0
    max_errors = 200
    files_checked = 0
    goals_checked = 0

    for path in sorted(curricula_root.rglob("json/*.json")):
        try:
            with path.open("r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as exc:
            error_count += 1
            if len(errors) < max_errors:
                errors.append(f"{path}: JSON parse error: {exc}")
            continue

        if not isinstance(data, dict):
            continue
        goals = data.get("goals")
        if not isinstance(goals, list):
            continue

        files_checked += 1
        for idx, goal in enumerate(goals):
            if not isinstance(goal, dict):
                error_count += 1
                if len(errors) < max_errors:
                    errors.append(f"{path}: goals[{idx}] is not an object")
                continue
            goals_checked += 1
            goal_id = goal.get("id")
            if not is_uuid(goal_id):
                error_count += 1
                if len(errors) < max_errors:
                    errors.append(f"{path}: goal id not UUID: {goal_id}")

            for field in ("requires", "contains"):
                refs = goal.get(field, [])
                if refs is None:
                    continue
                if not isinstance(refs, list):
                    error_count += 1
                    if len(errors) < max_errors:
                        errors.append(f"{path}: goal {goal_id} field {field} is not a list")
                    continue
                for ref in refs:
                    if not is_uuid(ref):
                        error_count += 1
                        if len(errors) < max_errors:
                            errors.append(f"{path}: goal {goal_id} {field} ref not UUID: {ref}")

    if error_count:
        print("ERROR: Non-UUID goal IDs or references found in curricula JSON:")
        for err in errors:
            print(f" - {err}")
        if error_count > len(errors):
            print(f" - ... and {error_count - len(errors)} more")
        return 1

    print(f"OK: All goal IDs and references are UUIDs ({files_checked} files, {goals_checked} goals).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
