#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = REPO_ROOT / "curricula/DE/Gymnasium/provenance/physics-evidence-watch-manifest.json"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def current_record(rel_path: str) -> dict[str, str | bool | None]:
    path = REPO_ROOT / rel_path
    exists = path.exists()
    return {
        "relativePath": rel_path,
        "exists": exists,
        "sha256": sha256(path) if exists else None,
    }


def main() -> None:
    manifest = load_json(MANIFEST_PATH)
    baseline_path = REPO_ROOT / manifest["baselinePath"]
    baseline = load_json(baseline_path)

    current_paths = sorted(
        {
            rel_path
            for target in manifest.get("watchTargets", [])
            for rel_path in target.get("paths", [])
            if isinstance(rel_path, str)
        }
    )
    baseline_records = {
        record["relativePath"]: record
        for record in baseline.get("watchedFiles", [])
        if isinstance(record, dict) and isinstance(record.get("relativePath"), str)
    }
    current_records = {rel_path: current_record(rel_path) for rel_path in current_paths}

    added_paths = sorted(set(current_records) - set(baseline_records))
    removed_paths = sorted(set(baseline_records) - set(current_records))
    changed_paths = sorted(
        rel_path
        for rel_path in set(current_records) & set(baseline_records)
        if baseline_records[rel_path].get("exists") != current_records[rel_path].get("exists")
        or baseline_records[rel_path].get("sha256") != current_records[rel_path].get("sha256")
    )

    print(
        f"physics-evidence-watch: changed={len(changed_paths)} added={len(added_paths)} removed={len(removed_paths)}"
    )
    for rel_path in changed_paths:
        print(f"CHANGED {rel_path}")
    for rel_path in added_paths:
        print(f"ADDED {rel_path}")
    for rel_path in removed_paths:
        print(f"REMOVED {rel_path}")

    if changed_paths or added_paths or removed_paths:
        sys.exit(1)


if __name__ == "__main__":
    main()
