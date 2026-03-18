#!/usr/bin/env python3
"""Validate that retained Bavaria Gymnasium archive paths are normalized."""

from __future__ import annotations

import fnmatch
import json
from pathlib import Path

from file_pattern_search import find_matching_files


ROOT = Path(__file__).resolve().parent.parent
TOOLING_REGISTRY_PATH_CANDIDATES = (
    ROOT / "curricula/DE/Gymnasium/input/DE-BY/retained-asset-registry.json",
    ROOT / "curricula/DE/Gymnasium/input/BY/retained-asset-registry.json",
)
BAVARIA_LEGACY_INPUT_PREFIX = "curricula/DE/Gymnasium/input/DE-BY/"
BAVARIA_INPUT_PREFIX = "curricula/DE/Gymnasium/input/BY/"
RETIREMENT_REGISTRY_PATH = ROOT / "curricula/DE/Gymnasium/provenance/bavaria-gymnasium-retirement-registry.json"


def normalize_tooling_path(path: str) -> str:
    return path.replace(BAVARIA_LEGACY_INPUT_PREFIX, BAVARIA_INPUT_PREFIX)


def resolve_tooling_registry_path() -> Path:
    for candidate in TOOLING_REGISTRY_PATH_CANDIDATES:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(
        "Missing Bavaria Gymnasium tooling registry: "
        + ", ".join(str(path) for path in TOOLING_REGISTRY_PATH_CANDIDATES)
    )


def load_registry() -> dict:
    with resolve_tooling_registry_path().open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_legacy_pattern() -> str:
    with RETIREMENT_REGISTRY_PATH.open("r", encoding="utf-8") as handle:
        retirement_registry = json.load(handle)
    legacy_tree_path = retirement_registry["legacyTreePath"]
    return rf"{legacy_tree_path}|DE/BY/Gymnasium/"


def matches_allowlist(path: str, allowlist: list[str]) -> bool:
    return any(fnmatch.fnmatch(path, pattern) for pattern in allowlist)


def main() -> None:
    registry = load_registry()
    legacy_pattern = load_legacy_pattern()
    archive_root = ROOT / normalize_tooling_path(registry["archivePath"])
    allowlist = [
        normalize_tooling_path(pattern)
        for pattern in registry.get("allowedRawLegacyPathGlobs", [])
    ]
    archive_arg = (
        str(archive_root.relative_to(ROOT))
        if archive_root.is_absolute() and archive_root.is_relative_to(ROOT)
        else str(archive_root)
    )
    matches = find_matching_files(ROOT, legacy_pattern, [archive_arg])
    allowed = [path for path in matches if matches_allowlist(path, allowlist)]
    violations = [path for path in matches if not matches_allowlist(path, allowlist)]

    print("Bavaria Gymnasium archive legacy-path validation")
    print("-----------------------------------------------")
    print(f"Archive root: {archive_root.relative_to(ROOT)}")
    print(f"Allowlisted raw-provenance files: {len(allowed)}")
    print(f"Violations: {len(violations)}")

    if violations:
        print("\nViolating files:")
        for path in violations:
            print(f"- {path}")
        raise SystemExit(1)

    print("\nOK: Bavaria retained assets no longer embed live legacy-tree paths.")


if __name__ == "__main__":
    main()
