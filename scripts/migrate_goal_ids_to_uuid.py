#!/usr/bin/env python3
import argparse
import json
import sys
import uuid
from pathlib import Path


SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")


def is_uuid(value: str) -> bool:
    try:
        uuid.UUID(str(value))
        return True
    except Exception:
        return False


def deterministic_uuid(seed: str) -> str:
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, seed))


def migrate_file(path: Path, curricula_root: Path, dry_run: bool):
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, dict):
        return 0, {}
    goals = data.get("goals")
    if not isinstance(goals, list):
        return 0, {}

    landscape_seed = None
    if isinstance(data.get("landscapeId"), str) and data["landscapeId"].strip():
        landscape_seed = data["landscapeId"].strip()
    else:
        landscape_seed = str(path.relative_to(curricula_root))

    existing_ids = set()
    for g in goals:
        if isinstance(g, dict) and is_uuid(g.get("id")):
            existing_ids.add(g["id"])

    mapping = {}
    for g in goals:
        if not isinstance(g, dict):
            continue
        old_id = g.get("id")
        if not is_uuid(old_id):
            seed = f"goal/{landscape_seed}/{old_id}"
            new_id = deterministic_uuid(seed)
            if new_id in existing_ids or new_id in mapping.values():
                suffix = 1
                while True:
                    candidate = deterministic_uuid(f"{seed}#{suffix}")
                    if candidate not in existing_ids and candidate not in mapping.values():
                        new_id = candidate
                        break
                    suffix += 1
            mapping[old_id] = new_id
            existing_ids.add(new_id)

    if not mapping:
        return 0, {}

    def replace_ids(value):
        if isinstance(value, list):
            return [replace_ids(v) for v in value]
        if isinstance(value, dict):
            return {k: replace_ids(v) for k, v in value.items()}
        if isinstance(value, str) and value in mapping:
            return mapping[value]
        return value

    # Only replace within goals to avoid accidental changes in descriptions.
    changed = False
    for g in goals:
        if not isinstance(g, dict):
            continue
        if g.get("id") in mapping:
            g["id"] = mapping[g["id"]]
            changed = True
        for field in ("requires", "contains"):
            refs = g.get(field)
            if refs is None:
                continue
            if isinstance(refs, list):
                new_refs = [mapping.get(r, r) for r in refs]
                if new_refs != refs:
                    g[field] = new_refs
                    changed = True

    if changed and not dry_run:
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")

    return len(mapping), mapping


def main():
    parser = argparse.ArgumentParser(description="Migrate non-UUID goal IDs to deterministic UUIDs.")
    parser.add_argument("--dry-run", action="store_true", help="Compute mappings without writing files.")
    parser.add_argument("--report", type=str, default="", help="Write JSON mapping report to file.")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    curricula_root = repo_root / "curricula"
    if not curricula_root.exists():
        print(f"ERROR: curricula directory not found at {curricula_root}")
        return 1

    total_files = 0
    total_ids = 0
    report = {}

    for path in sorted(curricula_root.rglob("json/*.json")):
        changed_count, mapping = migrate_file(path, curricula_root, args.dry_run)
        if mapping:
            total_files += 1
            total_ids += changed_count
            report[str(path.relative_to(repo_root))] = mapping

    if args.report:
        report_path = Path(args.report)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        with report_path.open("w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
            f.write("\n")

    if total_ids == 0:
        print("OK: No non-UUID goal IDs found. No changes needed.")
    else:
        action = "Would migrate" if args.dry_run else "Migrated"
        print(f"{action} {total_ids} goal IDs across {total_files} files.")
        if args.report:
            print(f"Mapping report: {args.report}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
