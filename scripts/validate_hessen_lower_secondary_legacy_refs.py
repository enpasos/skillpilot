#!/usr/bin/env python3
"""Validate the Hessen lower-secondary legacy-tree handoff boundary."""

from __future__ import annotations

import fnmatch
import json
from pathlib import Path

from file_pattern_search import find_matching_files, to_relative


ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = ROOT / "curricula/DE/Gymnasium/provenance/hessen-lower-secondary-retirement-registry.json"


def load_registry() -> dict:
    with REGISTRY_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def matches_any(path: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatch(path, pattern) for pattern in patterns)


def find_matches(pattern: str, scan_roots: list[str]) -> list[str]:
    return [to_relative(ROOT, line) for line in find_matching_files(ROOT, pattern, scan_roots)]


def main() -> None:
    registry = load_registry()
    legacy_tree_path = registry["legacyTreePath"]
    legacy_tree_must_be_absent = registry.get("legacyTreeMustBeAbsent", False)
    scan_roots = registry["scanRoots"]
    excluded = registry.get("excludedPathGlobs", [])
    allowed = registry.get("allowedReferenceGlobs", [])
    legacy_tree_name = Path(legacy_tree_path).name
    pattern = rf"{legacy_tree_path}|{legacy_tree_name}"
    legacy_tree_exists = (ROOT / legacy_tree_path).exists()

    raw_matches = find_matches(pattern, scan_roots)
    scoped_matches = [path for path in raw_matches if not matches_any(path, excluded)]
    allowlisted = [path for path in scoped_matches if matches_any(path, allowed)]
    violations = [path for path in scoped_matches if not matches_any(path, allowed)]

    print("Hessen lower-secondary legacy-tree reference validation")
    print("-------------------------------------------------------")
    print(f"Legacy tree: {legacy_tree_path}")
    print(f"Legacy tree present: {'yes' if legacy_tree_exists else 'no'}")
    print(f"Scanned roots: {', '.join(scan_roots)}")
    print(f"Allowlisted operational references: {len(allowlisted)}")
    print(f"Violations: {len(violations)}")

    if legacy_tree_must_be_absent and legacy_tree_exists:
        print("\nViolation: retired Hessen lower-secondary legacy tree still exists in the active repo.")
        raise SystemExit(1)

    if violations:
        print("\nViolating files:")
        for path in violations:
            print(f"- {path}")
        raise SystemExit(1)

    print(
        "\nOK: Hessen Sek-I legacy-tree references are confined to the explicit "
        "delete-handoff allowlist."
    )


if __name__ == "__main__":
    main()
