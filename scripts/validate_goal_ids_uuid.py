#!/usr/bin/env python3
"""Validate goal/reference UUID syntax in all runtime-shaped curricula.

Owner namespaces are exact nonempty unqualified strings, not necessarily UUIDs.
Reference existence, scope and uniqueness remain responsibilities of graph gates.
"""
from dataclasses import dataclass, field
import json
import os
import re
import sys
from pathlib import Path


UUID_RE = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")


def is_uuid(value):
    return isinstance(value, str) and UUID_RE.fullmatch(value) is not None


def is_owner(value):
    return isinstance(value, str) and bool(value) and value.strip() == value and ":" not in value


def is_reference(value):
    if not isinstance(value, str):
        return False
    parts = value.split(":")
    return is_uuid(value) if len(parts) == 1 else len(parts) == 2 and is_owner(parts[0]) and is_uuid(parts[1])


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate JSON object property: " + key)
        result[key] = value
    return result


def invalid_constant(value):
    raise ValueError("Nonfinite JSON number: " + value)


@dataclass
class ValidationReport:
    files_checked: int = 0
    goals_checked: int = 0
    invalid_goal_ids: int = 0
    invalid_references: int = 0
    error_count: int = 0
    errors: list[str] = field(default_factory=list)

    def fail(self, message):
        self.error_count += 1
        if len(self.errors) < 200:
            self.errors.append(message)


def validate(curricula_root):
    report = ValidationReport()
    if not curricula_root.is_dir():
        report.fail(f"curricula directory not found at {curricula_root}")
        return report

    def walk_error(error):
        report.fail(f"Curriculum traversal error: {error}")

    for directory, children, names in os.walk(curricula_root, topdown=True, followlinks=False, onerror=walk_error):
        children[:] = sorted(name for name in children if name != "quality")
        for name in sorted(names):
            if not name.endswith(".json"):
                continue
            path = Path(directory) / name
            try:
                data = json.loads(path.read_text(encoding="utf-8"),
                                  object_pairs_hook=unique_object, parse_constant=invalid_constant)
            except (OSError, UnicodeError, ValueError) as exc:
                report.fail(f"{path}: JSON parse/read error: {exc}")
                continue
            if not isinstance(data, dict) or "landscapeId" not in data or "goals" not in data:
                continue
            # Malformed types cannot hide an object claiming both landscape fields.
            if not isinstance(data["landscapeId"], str) or not isinstance(data["goals"], list):
                report.fail(f"{path}: invalid landscape shape; landscapeId must be a string and goals a list")
                continue
            report.files_checked += 1
            if not is_owner(data["landscapeId"]):
                report.fail(f"{path}: landscapeId is not an exact nonempty unqualified owner namespace")
            for index, goal in enumerate(data["goals"]):
                report.goals_checked += 1
                if not isinstance(goal, dict):
                    report.fail(f"{path}: goals[{index}] is not an object")
                    continue
                goal_id = goal.get("id")
                if not is_uuid(goal_id):
                    report.invalid_goal_ids += 1
                    report.fail(f"{path}: goals[{index}] goal id not UUID: {goal_id!r}")
                for relation in ("requires", "contains"):
                    references = goal.get(relation, [])
                    if not isinstance(references, list):
                        report.fail(f"{path}: goal {goal_id!r} field {relation} is not a list")
                        continue
                    for reference in references:
                        if not is_reference(reference):
                            report.invalid_references += 1
                            report.fail(f"{path}: goal {goal_id!r} {relation} reference is not a UUID or owner:UUID: {reference!r}")
    if not report.files_checked:
        report.fail("No runtime-shaped curriculum landscapes were checked")
    elif not report.goals_checked:
        report.fail("No goal IDs were checked in the discovered runtime-shaped landscapes")
    return report


def main():
    report = validate(Path(__file__).resolve().parents[1] / "curricula")
    counts = (f"{report.files_checked} files, {report.goals_checked} goals; "
              f"invalid goal IDs: {report.invalid_goal_ids}; invalid references: {report.invalid_references}; "
              f"other input errors: {report.error_count - report.invalid_goal_ids - report.invalid_references}")
    if report.error_count:
        print(f"ERROR: Invalid curriculum goal IDs/reference syntax or input ({counts}; {report.error_count} errors):")
        for error in report.errors:
            print(f" - {error}")
        if report.error_count > len(report.errors):
            print(f" - ... and {report.error_count - len(report.errors)} more")
        return 1
    print(f"OK: All goal IDs and reference endpoints are UUIDs ({counts}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
