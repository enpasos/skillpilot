#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
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


def format_mtime_utc(path: Path) -> str:
    timestamp = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    return timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")


def main() -> None:
    manifest = load_json(MANIFEST_PATH)
    unique_paths = sorted(
        {
            rel_path
            for target in manifest.get("watchTargets", [])
            for rel_path in target.get("paths", [])
            if isinstance(rel_path, str)
        }
    )

    watched_files = []
    for rel_path in unique_paths:
        path = REPO_ROOT / rel_path
        exists = path.exists()
        watched_files.append(
            {
                "relativePath": rel_path,
                "exists": exists,
                "sha256": sha256(path) if exists else None,
                "lastModifiedUtc": format_mtime_utc(path) if exists else None,
            }
        )

    baseline = {
        "version": 1,
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "manifestVersion": manifest.get("version"),
        "manifestUpdatedAt": manifest.get("updatedAt"),
        "mode": manifest.get("mode"),
        "watchedFileCount": len(watched_files),
        "watchedFiles": watched_files,
    }

    output_path = REPO_ROOT / manifest["baselinePath"]
    output_path.write_text(json.dumps(baseline, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
