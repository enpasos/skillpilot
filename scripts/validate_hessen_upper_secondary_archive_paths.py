#!/usr/bin/env python3
"""Validate that retained Hessen upper-secondary archive paths are normalized.

Legacy `Gymnasiale_Oberstufe` path strings are only allowed inside explicitly
allowlisted raw archival provenance files. Operational metadata and authored
archive docs must not depend on those legacy path strings anymore.
"""

from __future__ import annotations

import fnmatch
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
TOOLING_REGISTRY_PATH = ROOT / "curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json"
RETIREMENT_REGISTRY_PATH = (
    ROOT / "curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json"
)


def load_registry() -> dict:
    with TOOLING_REGISTRY_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_legacy_pattern() -> str:
    with RETIREMENT_REGISTRY_PATH.open("r", encoding="utf-8") as handle:
        retirement_registry = json.load(handle)
    legacy_tree_path = retirement_registry["legacyTreePath"]
    return rf"{legacy_tree_path}|Gymnasiale_Oberstufe"


def find_matching_files(archive_root: Path, legacy_pattern: str) -> list[str]:
    archive_arg = (
        str(archive_root.relative_to(ROOT))
        if archive_root.is_absolute() and archive_root.is_relative_to(ROOT)
        else str(archive_root)
    )
    result = subprocess.run(
        ["rg", "-l", legacy_pattern, archive_arg],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode not in (0, 1):
        raise SystemExit(result.stderr.strip() or f"`rg` failed with exit code {result.returncode}")
    matches: list[str] = []
    for line in result.stdout.splitlines():
        if not line:
            continue
        path = Path(line)
        if path.is_absolute():
            matches.append(str(path.relative_to(ROOT)))
        else:
            matches.append(line)
    return matches


def matches_allowlist(path: str, allowlist: list[str]) -> bool:
    return any(fnmatch.fnmatch(path, pattern) for pattern in allowlist)


def main() -> None:
    registry = load_registry()
    legacy_pattern = load_legacy_pattern()
    archive_root = ROOT / registry["abiArchivePath"]
    allowlist = registry.get("allowedRawLegacyPathGlobs", [])

    matches = find_matching_files(archive_root, legacy_pattern)
    allowed = [path for path in matches if matches_allowlist(path, allowlist)]
    violations = [path for path in matches if not matches_allowlist(path, allowlist)]

    print("Hessen upper-secondary archive legacy-path validation")
    print("----------------------------------------------------")
    print(f"Archive root: {archive_root.relative_to(ROOT)}")
    print(f"Allowlisted raw-provenance files: {len(allowed)}")
    print(f"Violations: {len(violations)}")

    if violations:
        print("\nViolating files:")
        for path in violations:
            print(f"- {path}")
        raise SystemExit(1)

    print("\nOK: legacy path strings are confined to allowlisted raw archival provenance files.")


if __name__ == "__main__":
    main()
