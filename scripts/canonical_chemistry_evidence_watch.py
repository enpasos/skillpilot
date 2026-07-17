#!/usr/bin/env python3

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = REPO_ROOT / "curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json"
CANONICAL_CHEMISTRY_PATH = (
    "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json"
)
RAW_HASH_MODE = "raw-bytes-v1"
CANONICAL_EVIDENCE_HASH_MODE = "canonical-evidence-json-v1"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def canonical_evidence_payload(data: dict) -> bytes:
    """Return the canonical Chemistry contract without presentation-only images."""
    for goal in data.get("goals", []):
        if not isinstance(goal, dict):
            continue
        links = goal.get("resourceLinks")
        if not isinstance(links, list):
            continue
        evidence_links = [
            link
            for link in links
            if not (
                isinstance(link, dict)
                and link.get("type") == "goal-visualization"
            )
        ]
        if evidence_links:
            goal["resourceLinks"] = evidence_links
        else:
            goal.pop("resourceLinks", None)
    return json.dumps(
        data,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")


def hash_mode(rel_path: str) -> str:
    if rel_path == CANONICAL_CHEMISTRY_PATH:
        return CANONICAL_EVIDENCE_HASH_MODE
    return RAW_HASH_MODE


def watched_sha256(rel_path: str, path: Path) -> str:
    if hash_mode(rel_path) == CANONICAL_EVIDENCE_HASH_MODE:
        return hashlib.sha256(canonical_evidence_payload(load_json(path))).hexdigest()
    return sha256(path)


def short_hash(value: str | None) -> str:
    if not value:
        return "-"
    return value[:12]


def format_mtime_utc(path: Path) -> str:
    timestamp = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    return timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")


def expand_glob(pattern: str) -> list[str]:
    return sorted(
        path.relative_to(REPO_ROOT).as_posix()
        for path in REPO_ROOT.glob(pattern)
        if path.is_file()
    )


def target_paths(target: dict) -> list[str]:
    paths = {
        rel_path
        for rel_path in target.get("paths", [])
        if isinstance(rel_path, str)
    }
    for pattern in target.get("pathGlobs", []):
        if isinstance(pattern, str):
            paths.update(expand_glob(pattern))
    return sorted(paths)


def unique_watch_paths(manifest: dict) -> list[str]:
    return sorted(
        {
            rel_path
            for target in manifest.get("watchTargets", [])
            for rel_path in target_paths(target)
        }
    )


def declared_ref_count(target: dict) -> int:
    return len(target.get("paths", [])) + len(target.get("pathGlobs", []))


def current_record(rel_path: str) -> dict[str, str | bool | None]:
    path = REPO_ROOT / rel_path
    exists = path.exists()
    record: dict[str, str | bool | None] = {
        "relativePath": rel_path,
        "exists": exists,
        "sha256": watched_sha256(rel_path, path) if exists else None,
        "lastModifiedUtc": format_mtime_utc(path) if exists else None,
    }
    if hash_mode(rel_path) != RAW_HASH_MODE:
        record["hashMode"] = hash_mode(rel_path)
    return record


def display_record(rel_path: str) -> dict[str, str | bool]:
    record = current_record(rel_path)
    return {
        "relativePath": rel_path,
        "exists": record["exists"],
        "sha256Prefix": short_hash(record["sha256"]),
        "lastModifiedUtc": record["lastModifiedUtc"] or "-",
    }


def diff_records(manifest: dict, baseline: dict) -> tuple[dict, list[str], list[str], list[str], list[str]]:
    current_paths = unique_watch_paths(manifest)
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
            or baseline_record.get("hashMode", RAW_HASH_MODE)
            != current.get("hashMode", RAW_HASH_MODE)
            or baseline_record.get("sha256") != current.get("sha256")
        ):
            changed_paths.append(rel_path)
        else:
            unchanged_paths.append(rel_path)

    delta = {
        "baselineRecords": baseline_records,
        "currentRecords": current_records,
    }
    return delta, changed_paths, added_paths, removed_paths, unchanged_paths


def capture_baseline() -> None:
    manifest = load_json(MANIFEST_PATH)
    watched_files = [current_record(rel_path) for rel_path in unique_watch_paths(manifest)]

    baseline = {
        "version": 2,
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "manifestVersion": manifest.get("version"),
        "manifestUpdatedAt": manifest.get("updatedAt"),
        "mode": manifest.get("mode"),
        "watchedFileCount": len(watched_files),
        "watchedFiles": watched_files,
    }

    output_path = REPO_ROOT / manifest["baselinePath"]
    output_path.write_text(json.dumps(baseline, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def render_status() -> str:
    manifest = load_json(MANIFEST_PATH)
    targets = manifest.get("watchTargets", [])

    unique_paths = unique_watch_paths(manifest)
    unique_records = [display_record(rel_path) for rel_path in unique_paths]
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
    expanded_path_count = sum(len(target_paths(target)) for target in targets)

    lines: list[str] = []
    lines.append("# Canonical Gymnasium Chemistry Evidence Watch Status")
    lines.append("")
    lines.append(f"Snapshot: `{manifest['updatedAt']}`")
    lines.append("")
    lines.append("This file is generated from:")
    lines.append("")
    lines.append(f"- `{MANIFEST_PATH.relative_to(REPO_ROOT)}`")
    lines.append(f"- `{Path(__file__).relative_to(REPO_ROOT)}`")
    lines.append("")
    lines.append("## Headline")
    lines.append("")
    lines.append(f"- Watch mode: `{manifest.get('mode', 'maintenance_evidence_watch')}`")
    lines.append(f"- Watch targets: `{len(targets)}`")
    lines.append(f"- Watched state set: `{len(watched_states)}`")
    lines.append(f"- Declared path references across all targets: `{sum(declared_ref_count(target) for target in targets)}`")
    lines.append(f"- Expanded path references across all targets: `{expanded_path_count}`")
    lines.append(f"- Unique watched files: `{len(unique_records)}`")
    lines.append(f"- Existing watched files: `{len(existing_unique_records)}/{len(unique_records)}`")
    lines.append(f"- Missing watched files: `{len(missing_unique_records)}`")
    lines.append(f"- Canonical Chemistry hash mode: `{CANONICAL_EVIDENCE_HASH_MODE}` (excludes `goal-visualization` presentation metadata)")
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
    lines.append("| Target | Kind | States | Candidate rows | Declared refs | Expanded files | Missing files |")
    lines.append("| --- | --- | --- | --- | ---: | ---: | ---: |")
    for target in targets:
        paths = target_paths(target)
        states = ", ".join(f"`{state}`" for state in target.get("states", []))
        candidate_rows = "<br>".join(target.get("candidateRows", []))
        missing_count = sum(1 for rel_path in paths if not (REPO_ROOT / rel_path).exists())
        lines.append(
            f"| `{target['id']}` | `{target['kind']}` | {states} | {candidate_rows} | "
            f"`{declared_ref_count(target)}` | `{len(paths)}` | `{missing_count}` |"
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
        if target.get("pathGlobs"):
            lines.append("- Path globs:")
            for pattern in target.get("pathGlobs", []):
                lines.append(f"  - `{pattern}`")
        lines.append("- Watched files:")
        lines.append("")
        lines.append("| File | Exists | SHA256-12 | Last modified (UTC) |")
        lines.append("| --- | --- | --- | --- |")
        for rel_path in target_paths(target):
            record = display_record(rel_path)
            exists = "yes" if record["exists"] else "no"
            lines.append(
                f"| `{record['relativePath']}` | `{exists}` | `{record['sha256Prefix']}` | `{record['lastModifiedUtc']}` |"
            )

    lines.append("")
    lines.append("## Regeneration")
    lines.append("")
    lines.append("```bash")
    lines.append(manifest["statusCommand"])
    if "runCommand" in manifest:
        lines.append(manifest["runCommand"])
    lines.append("```")
    lines.append("")
    return "\n".join(lines)


def write_status() -> None:
    manifest = load_json(MANIFEST_PATH)
    output_path = REPO_ROOT / manifest["statusViewPath"]
    output_path.write_text(render_status(), encoding="utf-8")


def render_delta() -> str:
    manifest = load_json(MANIFEST_PATH)
    baseline = load_json(REPO_ROOT / manifest["baselinePath"])
    targets = manifest.get("watchTargets", [])
    delta, changed_paths, added_paths, removed_paths, unchanged_paths = diff_records(manifest, baseline)
    baseline_records = delta["baselineRecords"]
    current_records = delta["currentRecords"]

    lines: list[str] = []
    lines.append("# Canonical Gymnasium Chemistry Evidence Watch Delta")
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
    lines.append("- The canonical Chemistry hash excludes `goal-visualization` resource links and JSON formatting; those are presentation metadata covered by the visualization QA lane.")
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
        paths = target_paths(target)
        target_changed = sum(1 for rel_path in paths if rel_path in changed_paths)
        target_added = sum(1 for rel_path in paths if rel_path in added_paths)
        target_removed = sum(1 for rel_path in removed_paths if rel_path in paths)
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


def write_delta() -> None:
    manifest = load_json(MANIFEST_PATH)
    output_path = REPO_ROOT / manifest["deltaViewPath"]
    output_path.write_text(render_delta(), encoding="utf-8")


def check_delta() -> None:
    manifest = load_json(MANIFEST_PATH)
    baseline = load_json(REPO_ROOT / manifest["baselinePath"])
    _, changed_paths, added_paths, removed_paths, _ = diff_records(manifest, baseline)

    print(
        f"chemistry-evidence-watch: changed={len(changed_paths)} added={len(added_paths)} removed={len(removed_paths)}"
    )
    for rel_path in changed_paths:
        print(f"CHANGED {rel_path}")
    for rel_path in added_paths:
        print(f"ADDED {rel_path}")
    for rel_path in removed_paths:
        print(f"REMOVED {rel_path}")

    if changed_paths or added_paths or removed_paths:
        sys.exit(1)


def self_test() -> None:
    base = {
        "goals": [
            {
                "id": "goal-a",
                "title": "Fachlicher Vertrag",
                "resourceLinks": [
                    {"type": "curriculum", "url": "https://example.invalid/source"}
                ],
            }
        ]
    }
    with_visualization = json.loads(json.dumps(base))
    with_visualization["goals"][0]["resourceLinks"].append(
        {"type": "goal-visualization", "url": "/assets/example.png"}
    )
    changed_semantics = json.loads(json.dumps(base))
    changed_semantics["goals"][0]["title"] = "Geaenderter fachlicher Vertrag"
    changed_source = json.loads(json.dumps(base))
    changed_source["goals"][0]["resourceLinks"][0]["url"] = "https://example.invalid/other"

    base_hash = hashlib.sha256(canonical_evidence_payload(base)).hexdigest()
    visualization_hash = hashlib.sha256(
        canonical_evidence_payload(with_visualization)
    ).hexdigest()
    semantic_hash = hashlib.sha256(
        canonical_evidence_payload(changed_semantics)
    ).hexdigest()
    source_hash = hashlib.sha256(canonical_evidence_payload(changed_source)).hexdigest()

    if base_hash != visualization_hash:
        raise AssertionError("goal-visualization metadata must not reopen the evidence watch")
    if base_hash == semantic_hash:
        raise AssertionError("canonical goal semantics must remain watched")
    if base_hash == source_hash:
        raise AssertionError("non-visual source links must remain watched")
    print("Canonical Chemistry evidence-watch self-test passed.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Render and check the canonical Chemistry evidence watch.")
    parser.add_argument(
        "command",
        choices=("capture-baseline", "render-status", "render-delta", "check-delta", "self-test"),
    )
    args = parser.parse_args()

    if args.command == "capture-baseline":
        capture_baseline()
    elif args.command == "render-status":
        write_status()
    elif args.command == "render-delta":
        write_delta()
    elif args.command == "check-delta":
        check_delta()
    elif args.command == "self-test":
        self_test()


if __name__ == "__main__":
    main()
