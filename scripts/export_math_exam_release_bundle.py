#!/usr/bin/env python3
"""Export the validated Hessen 2026 math exam pipeline as a release bundle."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path
from hessen_upper_secondary_paths import resolve_hessen_upper_secondary_abi_directory


ROOT = Path(__file__).resolve().parent.parent
ABI_DIR = resolve_hessen_upper_secondary_abi_directory("math")
DEFAULT_BLUEPRINT = ABI_DIR / "abi_2026_mathe_exam_blueprint.json"
DEFAULT_SLOT_MATRIX = ABI_DIR / "slot_matrix.json"
DEFAULT_COVERAGE = ABI_DIR / "coverage_requirements.json"
DEFAULT_TASK_BANK = ABI_DIR / "task_bank.json"
DEFAULT_REPORT = ROOT / "tmp/math_exam_pipeline_report.json"
DEFAULT_OUTPUT = ABI_DIR / "release/hessen_landesabitur_2026_math_release_bundle.json"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def relative(path: Path) -> str:
    return str(path.resolve().relative_to(ROOT))


def ensure_release_ready(report: dict) -> None:
    if report.get("globalFindings"):
        raise SystemExit("Cannot export release bundle: validator report contains global findings.")

    not_ready = [
        collection_id
        for collection_id, collection_report in report.get("collections", {}).items()
        if not collection_report.get("releaseReady")
    ]
    if not_ready:
        raise SystemExit(
            "Cannot export release bundle: collections not release-ready: " + ", ".join(sorted(not_ready))
        )


def build_release_manifest(slot_matrix: dict, task_bank: dict, report: dict) -> dict:
    collections = []
    tasks = task_bank["tasks"]
    for collection in slot_matrix["collections"]:
        collection_id = collection["id"]
        collection_tasks = [task for task in tasks if collection_id in task.get("releaseCollections", [])]
        collections.append(
            {
                "id": collection_id,
                "label": collection["label"],
                "courseLevel": collection["courseLevel"],
                "kind": collection["kind"],
                "releaseRef": collection.get("releaseRef"),
                "taskCount": len(collection_tasks),
                "taskGoalIds": [task["goalId"] for task in collection_tasks],
                "validator": {
                    "draftReady": report["collections"][collection_id]["draftReady"],
                    "releaseReady": report["collections"][collection_id]["releaseReady"],
                    "findingCount": len(report["collections"][collection_id]["findings"]),
                },
            }
        )

    return {
        "collectionCount": len(collections),
        "collections": collections,
        "taskCount": len(tasks),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--blueprint", type=Path, default=DEFAULT_BLUEPRINT)
    parser.add_argument("--slot-matrix", type=Path, default=DEFAULT_SLOT_MATRIX)
    parser.add_argument("--coverage", type=Path, default=DEFAULT_COVERAGE)
    parser.add_argument("--task-bank", type=Path, default=DEFAULT_TASK_BANK)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--allow-unreleased", action="store_true")
    args = parser.parse_args()

    blueprint = load_json(args.blueprint)
    slot_matrix = load_json(args.slot_matrix)
    coverage = load_json(args.coverage)
    task_bank = load_json(args.task_bank)
    report = load_json(args.report)

    if not args.allow_unreleased:
        ensure_release_ready(report)

    release_id = f"{blueprint['examSpecId']}-release-{date.today().isoformat()}"
    bundle = {
        "releaseId": release_id,
        "status": "release" if not args.allow_unreleased else "draft-export",
        "generatedOn": date.today().isoformat(),
        "examSpecId": blueprint["examSpecId"],
        "locale": blueprint["locale"],
        "subject": blueprint["subject"],
        "frameworkRefs": blueprint.get("frameworkRefs", []),
        "sourceFiles": {
            "blueprint": relative(args.blueprint),
            "slotMatrix": relative(args.slot_matrix),
            "coverageRequirements": relative(args.coverage),
            "taskBank": relative(args.task_bank),
            "validatorReport": relative(args.report),
        },
        "releaseManifest": build_release_manifest(slot_matrix, task_bank, report),
        "blueprint": blueprint,
        "slotMatrix": slot_matrix,
        "coverageRequirements": coverage,
        "taskBank": task_bank,
        "validatorReport": report,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        json.dump(bundle, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    print(f"Wrote release bundle to {args.output}")


if __name__ == "__main__":
    main()
