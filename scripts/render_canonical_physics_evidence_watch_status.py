#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = REPO_ROOT / "curricula/DE/Gymnasium/provenance/physics-evidence-watch-manifest.json"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def sha256_prefix(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()[:12]


def format_mtime_utc(path: Path) -> str:
    timestamp = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    return timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")


def file_record(rel_path: str) -> dict[str, str | bool]:
    path = REPO_ROOT / rel_path
    exists = path.exists()
    return {
        "relativePath": rel_path,
        "exists": exists,
        "sha256Prefix": sha256_prefix(path) if exists else "-",
        "lastModifiedUtc": format_mtime_utc(path) if exists else "-",
    }


def render() -> str:
    manifest = load_json(MANIFEST_PATH)
    targets = manifest.get("watchTargets", [])

    unique_paths = sorted(
        {
            rel_path
            for target in targets
            for rel_path in target.get("paths", [])
            if isinstance(rel_path, str)
        }
    )
    unique_records = [file_record(rel_path) for rel_path in unique_paths]
    existing_unique_records = [record for record in unique_records if record["exists"]]
    missing_unique_records = [record for record in unique_records if not record["exists"]]
    kind_counts = Counter(
        target["kind"] for target in targets if isinstance(target, dict) and isinstance(target.get("kind"), str)
    )
    watched_states = sorted(
        {
            state
            for target in targets
            for state in target.get("states", [])
            if isinstance(state, str)
        }
    )

    lower_secondary_target_count = sum(
        1 for target in targets if any("/lower-secondary/" in rel_path for rel_path in target.get("paths", []))
    )
    upper_secondary_target_count = sum(
        1 for target in targets if any("/upper-secondary/" in rel_path for rel_path in target.get("paths", []))
    )

    lines: list[str] = []
    lines.append("# Canonical Gymnasium Physics Evidence Watch Status")
    lines.append("")
    lines.append(f"Snapshot: `{manifest['updatedAt']}`")
    lines.append("")
    lines.append("This file is generated from:")
    lines.append("")
    lines.append(f"- `{MANIFEST_PATH.relative_to(REPO_ROOT)}`")
    lines.append(f"- `{Path(__file__).resolve().relative_to(REPO_ROOT)}`")
    lines.append("")
    lines.append("## Headline")
    lines.append("")
    lines.append(f"- Watch mode: `{manifest.get('mode', 'maintenance_evidence_watch')}`")
    lines.append(f"- Watch targets: `{len(targets)}`")
    lines.append(f"- Watched state set: `{len(watched_states)}`")
    lines.append(f"- Path references across all targets: `{sum(len(target.get('paths', [])) for target in targets)}`")
    lines.append(f"- Unique watched files: `{len(unique_records)}`")
    lines.append(f"- Existing watched files: `{len(existing_unique_records)}/{len(unique_records)}`")
    lines.append(f"- Missing watched files: `{len(missing_unique_records)}`")
    lines.append(f"- Lower-secondary watch targets: `{lower_secondary_target_count}`")
    lines.append(f"- Upper-secondary watch targets: `{upper_secondary_target_count}`")
    lines.append("")
    lines.append("## Watch kinds")
    lines.append("")
    lines.append("| Kind | Count |")
    lines.append("| --- | ---: |")
    for kind, count in sorted(kind_counts.items()):
        lines.append(f"| `{kind}` | `{count}` |")
    lines.append("")
    lines.append("## Watch target register")
    lines.append("")
    lines.append("| Target | Kind | States | Candidate rows | Path refs | Missing files |")
    lines.append("| --- | --- | --- | --- | ---: | ---: |")
    for target in targets:
        states = ", ".join(f"`{state}`" for state in target.get("states", []))
        candidate_rows = "<br>".join(target.get("candidateRows", []))
        missing_count = sum(
            1 for rel_path in target.get("paths", []) if isinstance(rel_path, str) and not (REPO_ROOT / rel_path).exists()
        )
        lines.append(
            f"| `{target['id']}` | `{target['kind']}` | {states} | {candidate_rows} | `{len(target.get('paths', []))}` | `{missing_count}` |"
        )

    lines.append("")
    lines.append("## Unique file register")
    lines.append("")
    lines.append("| File | Exists | SHA256-12 | Last modified (UTC) |")
    lines.append("| --- | --- | --- | --- |")
    for record in unique_records:
        exists = "yes" if record["exists"] else "no"
        lines.append(
            f"| `{record['relativePath']}` | `{exists}` | `{record['sha256Prefix']}` | `{record['lastModifiedUtc']}` |"
        )

    for target in targets:
        lines.append("")
        lines.append(f"## `{target['id']}`")
        lines.append("")
        lines.append(f"- Kind: `{target['kind']}`")
        lines.append(f"- States: {', '.join(f'`{state}`' for state in target.get('states', []))}")
        lines.append("- Candidate rows:")
        for row in target.get("candidateRows", []):
            lines.append(f"  - `{row}`")
        lines.append(f"- Reopen rule: {target['reopenRule']}")
        lines.append("- Watched files:")
        lines.append("")
        lines.append("| File | Exists | SHA256-12 | Last modified (UTC) |")
        lines.append("| --- | --- | --- | --- |")
        for rel_path in target.get("paths", []):
            record = file_record(rel_path)
            exists = "yes" if record["exists"] else "no"
            lines.append(
                f"| `{record['relativePath']}` | `{exists}` | `{record['sha256Prefix']}` | `{record['lastModifiedUtc']}` |"
            )

    lines.append("")
    lines.append("## Regeneration")
    lines.append("")
    lines.append("```bash")
    lines.append(manifest["renderCommand"])
    if "runCommand" in manifest:
        lines.append(manifest["runCommand"])
    lines.append("```")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    manifest = load_json(MANIFEST_PATH)
    output_path = REPO_ROOT / manifest["statusViewPath"]
    output_path.write_text(render(), encoding="utf-8")


if __name__ == "__main__":
    main()
