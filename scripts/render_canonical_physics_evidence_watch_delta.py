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


def current_record(rel_path: str) -> dict[str, str | bool | None]:
    path = REPO_ROOT / rel_path
    exists = path.exists()
    return {
        "relativePath": rel_path,
        "exists": exists,
        "sha256": sha256(path) if exists else None,
        "lastModifiedUtc": format_mtime_utc(path) if exists else None,
    }


def short_hash(value: str | None) -> str:
    if not value:
        return "-"
    return value[:12]


def render() -> str:
    manifest = load_json(MANIFEST_PATH)
    baseline = load_json(REPO_ROOT / manifest["baselinePath"])
    targets = manifest.get("watchTargets", [])

    current_paths = sorted(
        {
            rel_path
            for target in targets
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
    changed_paths = []
    unchanged_paths = []
    for rel_path in sorted(set(current_records) & set(baseline_records)):
        baseline_record = baseline_records[rel_path]
        current = current_records[rel_path]
        if (
            baseline_record.get("exists") != current.get("exists")
            or baseline_record.get("sha256") != current.get("sha256")
        ):
            changed_paths.append(rel_path)
        else:
            unchanged_paths.append(rel_path)

    lines: list[str] = []
    lines.append("# Canonical Gymnasium Physics Evidence Watch Delta")
    lines.append("")
    lines.append(f"Snapshot: `{datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}`")
    lines.append("")
    lines.append("This file is generated from:")
    lines.append("")
    lines.append(f"- `{MANIFEST_PATH.relative_to(REPO_ROOT)}`")
    lines.append(f"- `{Path(manifest['baselinePath'])}`")
    lines.append(f"- `{Path(__file__).relative_to(REPO_ROOT)}`")
    lines.append("")
    lines.append("## Headline")
    lines.append("")
    lines.append(f"- Baseline snapshot: `{baseline.get('updatedAt', '-')}`")
    lines.append(f"- Current watched files: `{len(current_records)}`")
    lines.append(f"- Unchanged watched files: `{len(unchanged_paths)}`")
    lines.append(f"- Changed watched files: `{len(changed_paths)}`")
    lines.append(f"- Added watch paths since baseline: `{len(added_paths)}`")
    lines.append(f"- Removed watch paths since baseline: `{len(removed_paths)}`")
    lines.append("")
    lines.append("## Interpretation")
    lines.append("")
    lines.append("- A file-level delta is a maintenance signal, not an automatic rollout reopen.")
    lines.append("- Reopen remains gated by the documented reopen rules in the watch manifest.")
    lines.append("")
    lines.append("## Changed files")
    lines.append("")
    if not changed_paths:
        lines.append("- none")
    else:
        lines.append("| File | Exists (baseline -> current) | SHA256-12 (baseline -> current) | Last modified UTC (baseline -> current) |")
        lines.append("| --- | --- | --- | --- |")
        for rel_path in changed_paths:
            baseline_record = baseline_records[rel_path]
            current = current_records[rel_path]
            lines.append(
                f"| `{rel_path}` | `{baseline_record.get('exists')} -> {current.get('exists')}` | "
                f"`{short_hash(baseline_record.get('sha256'))} -> {short_hash(current.get('sha256'))}` | "
                f"`{baseline_record.get('lastModifiedUtc') or '-'} -> {current.get('lastModifiedUtc') or '-'}` |"
            )

    lines.append("")
    lines.append("## Added watch paths")
    lines.append("")
    if not added_paths:
        lines.append("- none")
    else:
        for rel_path in added_paths:
            lines.append(f"- `{rel_path}`")

    lines.append("")
    lines.append("## Removed watch paths")
    lines.append("")
    if not removed_paths:
        lines.append("- none")
    else:
        for rel_path in removed_paths:
            lines.append(f"- `{rel_path}`")

    lines.append("")
    lines.append("## Target delta register")
    lines.append("")
    lines.append("| Target | Changed files | Added paths | Removed paths |")
    lines.append("| --- | ---: | ---: | ---: |")
    for target in targets:
        target_paths = [rel_path for rel_path in target.get("paths", []) if isinstance(rel_path, str)]
        target_changed = sum(1 for rel_path in target_paths if rel_path in changed_paths)
        target_added = sum(1 for rel_path in target_paths if rel_path in added_paths)
        target_removed = sum(1 for rel_path in removed_paths if rel_path in target_paths)
        lines.append(f"| `{target['id']}` | `{target_changed}` | `{target_added}` | `{target_removed}` |")

    lines.append("")
    lines.append("## Regeneration")
    lines.append("")
    lines.append("```bash")
    lines.append(manifest["baselineCommand"])
    lines.append(manifest["deltaCommand"])
    if "checkCommand" in manifest:
        lines.append(manifest["checkCommand"])
    if "runCommand" in manifest:
        lines.append(manifest["runCommand"])
    lines.append("```")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    manifest = load_json(MANIFEST_PATH)
    output_path = REPO_ROOT / manifest["deltaViewPath"]
    output_path.write_text(render(), encoding="utf-8")


if __name__ == "__main__":
    main()
