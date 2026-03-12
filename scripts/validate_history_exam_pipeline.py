#!/usr/bin/env python3
"""Validate the Hessen 2026 history exam pipeline artifacts."""

from __future__ import annotations

import argparse
import itertools
import json
from pathlib import Path

from exam_release_utils import resolve_release_collection_specs, task_belongs_to_collection


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SLOT_MATRIX = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Geschichte/slot_matrix.json"
DEFAULT_COVERAGE = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Geschichte/coverage_requirements.json"
DEFAULT_TASK_BANK = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Geschichte/task_bank.json"
DEFAULT_LANDSCAPE = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_GESCHICHTE.de.json"

RELEASE_READY_STATUSES = {"reviewed", "approved"}


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def add_finding(findings: list[dict], severity: str, code: str, message: str) -> None:
    findings.append({"severity": severity, "code": code, "message": message})


def build_parent_map(goals: list[dict]) -> dict[str, list[str]]:
    parents: dict[str, list[str]] = {}
    for goal in goals:
        for child_id in goal.get("contains", []):
            parents.setdefault(child_id, []).append(goal["id"])
    return parents


def ancestor_closure(goal_id: str, parents: dict[str, list[str]]) -> set[str]:
    ancestors: set[str] = set()
    stack = list(parents.get(goal_id, []))
    while stack:
        parent_id = stack.pop()
        if parent_id in ancestors:
            continue
        ancestors.add(parent_id)
        stack.extend(parents.get(parent_id, []))
    return ancestors


def enumerate_paths(selection_groups: list[dict]) -> list[list[str]]:
    paths: list[list[str]] = [[]]
    for group in selection_groups:
        pick = group["pick"]
        slot_ids = group["slotIds"]
        if pick == "all":
            for path in paths:
                path.extend(slot_ids)
            continue

        next_paths: list[list[str]] = []
        for combo in itertools.combinations(slot_ids, int(pick)):
            for path in paths:
                next_paths.append(path + list(combo))
        paths = next_paths
    return paths


def validate_structure(collection: dict, tasks: list[dict], slot_index: dict[str, dict], findings: list[dict]) -> dict:
    summary = {
        "slotTaskCounts": {},
        "pathCount": 0,
        "pathBeFailures": 0,
    }

    if collection.get("kind") != "offer":
        return summary

    tasks_by_slot: dict[str, list[dict]] = {slot_id: [] for slot_id in collection.get("slotIds", [])}
    for task in tasks:
        for slot_id in task.get("slotIds", []):
            if slot_id in tasks_by_slot:
                tasks_by_slot[slot_id].append(task)

    for slot_id in collection.get("slotIds", []):
        slot = slot_index[slot_id]
        assigned = tasks_by_slot[slot_id]
        summary["slotTaskCounts"][slot_id] = len(assigned)
        if len(assigned) < slot["minCandidates"] or len(assigned) > slot["maxCandidates"]:
            add_finding(
                findings,
                "error",
                "slot_candidate_count",
                f"{collection['id']} slot {slot_id} has {len(assigned)} tasks; expected {slot['minCandidates']}..{slot['maxCandidates']}.",
            )
        for task in assigned:
            if task["courseLevel"] != slot["courseLevel"]:
                add_finding(
                    findings,
                    "error",
                    "slot_course_level_mismatch",
                    f"Task {task['goalId']} in slot {slot_id} has courseLevel {task['courseLevel']} but slot expects {slot['courseLevel']}.",
                )
            if task.get("proposalId") != slot["proposalId"]:
                add_finding(
                    findings,
                    "error",
                    "slot_proposal_mismatch",
                    f"Task {task['goalId']} in slot {slot_id} has proposalId {task.get('proposalId')} but slot expects {slot['proposalId']}.",
                )
            if task["domain"] != slot["domain"]:
                add_finding(
                    findings,
                    "error",
                    "slot_domain_mismatch",
                    f"Task {task['goalId']} in slot {slot_id} has domain {task['domain']} but slot expects {slot['domain']}.",
                )
            if task["allowedTools"] != slot["allowedTools"]:
                add_finding(
                    findings,
                    "error",
                    "slot_tools_mismatch",
                    f"Task {task['goalId']} in slot {slot_id} has allowedTools {task['allowedTools']} but slot expects {slot['allowedTools']}.",
                )
            if task["beTotal"] != slot["beTotal"]:
                add_finding(
                    findings,
                    "error",
                    "slot_be_mismatch",
                    f"Task {task['goalId']} in slot {slot_id} has {task['beTotal']} BE but slot expects {slot['beTotal']}.",
                )
            if task.get("materialBound") is not True:
                add_finding(
                    findings,
                    "error",
                    "slot_material_binding",
                    f"Task {task['goalId']} in slot {slot_id} is not marked as material-bound.",
                )

    all_paths = enumerate_paths(collection.get("selectionGroups", []))
    summary["pathCount"] = len(all_paths)
    for path in all_paths:
        path_tasks: list[dict] = []
        for slot_id in path:
            assigned = tasks_by_slot.get(slot_id, [])
            if len(assigned) != 1:
                continue
            path_tasks.append(assigned[0])
        be_total = sum(task["beTotal"] for task in path_tasks)
        if be_total != collection["expectedSolvedBeTotal"]:
            summary["pathBeFailures"] += 1
            add_finding(
                findings,
                "error",
                "path_be_total",
                f"{collection['id']} path {path} yields {be_total} BE but expected {collection['expectedSolvedBeTotal']}.",
            )

    return summary


def validate_union_requirements(requirement: dict, tasks: list[dict], findings: list[dict]) -> dict:
    union_topic_codes = sorted({code for task in tasks for code in task["coverage"].get("topicCodes", [])})
    union_proposals = sorted({task.get("proposalId") for task in tasks if task.get("proposalId")})
    union_hints = sorted({hint for task in tasks for hint in task["coverage"].get("coverageHintIds", [])})

    missing_topic_codes = sorted(set(requirement.get("requiredTopicCodes", [])) - set(union_topic_codes))
    missing_proposals = sorted(set(requirement.get("requiredOfferedProposalIds", [])) - set(union_proposals))
    missing_hints = sorted(set(requirement.get("requiredCoverageHintIds", [])) - set(union_hints))

    for code in missing_topic_codes:
        add_finding(findings, "error", "missing_topic_code_union", f"Missing topic code in union coverage: {code}.")
    for code in missing_proposals:
        add_finding(findings, "error", "missing_proposal_union", f"Missing proposal in union coverage: {code}.")
    for code in missing_hints:
        add_finding(findings, "error", "missing_coverage_hint_union", f"Missing coverage hint in union coverage: {code}.")

    return {
        "unionTopicCodes": union_topic_codes,
        "unionProposalIds": union_proposals,
        "unionCoverageHintIds": union_hints,
        "missingTopicCodes": missing_topic_codes,
        "missingProposalIds": missing_proposals,
        "missingCoverageHintIds": missing_hints,
        "pickCount": requirement.get("pickCount"),
        "expectedSolvedBeTotal": requirement.get("expectedSolvedBeTotal"),
    }


def validate_bucket_requirements(
    requirement: dict,
    tasks: list[dict],
    collection_tasks: dict[str, list[dict]],
    findings: list[dict],
) -> dict:
    bucket_counts: dict[str, int] = {}
    for task in tasks:
        key = f"{task['productionTrack']}::{task['coverage']['phaseBucket']}"
        bucket_counts[key] = bucket_counts.get(key, 0) + 1

    missing_buckets: list[str] = []
    for bucket in requirement.get("bucketRequirements", []):
        key = f"{bucket['track']}::{bucket['phase']}"
        current = bucket_counts.get(key, 0)
        if current < bucket["minCount"]:
            missing_buckets.append(f"{key} ({current}/{bucket['minCount']})")
            add_finding(
                findings,
                "error",
                "missing_bucket_requirement",
                f"Bucket {key} has {current} tasks but requires at least {bucket['minCount']}.",
            )

    missing_collection_task_ids: list[str] = []
    collection_task_ids = {task["goalId"] for task in tasks}
    for required_collection in requirement.get("mustIncludeCollectionTasks", []):
        required_ids = {task["goalId"] for task in collection_tasks.get(required_collection, [])}
        missing = sorted(required_ids - collection_task_ids)
        if missing:
            missing_collection_task_ids.extend(missing)
            add_finding(
                findings,
                "error",
                "missing_offer_subset",
                f"Collection misses {len(missing)} tasks from required subset {required_collection}.",
            )

    return {
        "bucketCounts": bucket_counts,
        "missingBuckets": missing_buckets,
        "missingCollectionTaskIds": missing_collection_task_ids,
    }


def validate_quality(review_fields: list[str], tasks: list[dict], findings: list[dict]) -> dict:
    missing_fields = 0
    release_pending = 0
    pending_tasks: list[dict] = []

    for task in tasks:
        review_status = task.get("quality", {}).get("reviewStatus", {})
        task_missing_fields: list[str] = []
        task_pending_fields: list[str] = []
        for field in review_fields:
            value = review_status.get(field)
            if value is None:
                missing_fields += 1
                task_missing_fields.append(field)
                add_finding(
                    findings,
                    "error",
                    "missing_review_field",
                    f"Task {task['goalId']} is missing review field {field}.",
                )
            elif value not in RELEASE_READY_STATUSES:
                release_pending += 1
                task_pending_fields.append(field)

        if task_missing_fields or task_pending_fields:
            pending_tasks.append(
                {
                    "goalId": task["goalId"],
                    "title": task["title"],
                    "missingFields": task_missing_fields,
                    "pendingFields": task_pending_fields,
                    "reviewStatus": review_status,
                }
            )

    return {
        "tasksChecked": len(tasks),
        "missingReviewFields": missing_fields,
        "releasePendingFields": release_pending,
        "pendingTasks": pending_tasks,
    }


def validate_collection_membership(
    task_bank_tasks: list[dict],
    goals: list[dict],
    collection_specs: list[dict],
    findings: list[dict],
) -> None:
    parents = build_parent_map(goals)
    for task in task_bank_tasks:
        ancestors = ancestor_closure(task["goalId"], parents)
        expected = sorted(
            collection["id"]
            for collection in collection_specs
            if task_belongs_to_collection(collection, task["courseLevel"], task["productionTrack"], ancestors)
        )
        actual = sorted(task.get("releaseCollections", []))
        if actual != expected:
            add_finding(
                findings,
                "error",
                "release_collection_mismatch",
                f"Task {task['goalId']} has releaseCollections {actual} but expected {expected}.",
            )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--slot-matrix", type=Path, default=DEFAULT_SLOT_MATRIX)
    parser.add_argument("--coverage", type=Path, default=DEFAULT_COVERAGE)
    parser.add_argument("--task-bank", type=Path, default=DEFAULT_TASK_BANK)
    parser.add_argument("--landscape", type=Path, default=DEFAULT_LANDSCAPE)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--fail-on-error", action="store_true")
    args = parser.parse_args()

    slot_matrix = load_json(args.slot_matrix)
    coverage = load_json(args.coverage)
    task_bank = load_json(args.task_bank)
    landscape = load_json(args.landscape)

    landscape_goals = {goal["id"]: goal for goal in landscape["goals"]}
    collection_index = {collection["id"]: collection for collection in slot_matrix["collections"]}
    slot_index = {slot["id"]: slot for slot in slot_matrix["slots"]}
    coverage_index = {item["id"]: item for item in coverage["collections"]}
    collection_specs, release_errors = resolve_release_collection_specs(landscape["goals"], slot_matrix["collections"])
    collection_tasks = {
        collection_id: [task for task in task_bank["tasks"] if collection_id in task.get("releaseCollections", [])]
        for collection_id in collection_index
    }

    report = {
        "examSpecId": task_bank["examSpecId"],
        "collections": {},
        "globalFindings": [],
    }

    for message in release_errors:
        add_finding(report["globalFindings"], "error", "release_anchor_resolution", message)

    for task in task_bank["tasks"]:
        goal = landscape_goals.get(task["goalId"])
        if goal is None:
            add_finding(report["globalFindings"], "error", "missing_goal", f"Task bank goal {task['goalId']} does not exist in landscape.")
            continue
        if goal.get("examData") is None:
            add_finding(report["globalFindings"], "error", "missing_exam_data", f"Goal {task['goalId']} exists but has no examData.")
        if task["title"] != goal["title"]:
            add_finding(report["globalFindings"], "error", "title_mismatch", f"Task bank title for {task['goalId']} is stale.")
        if task["beTotal"] != goal["examData"]["scoring"]["maxPoints"]:
            add_finding(report["globalFindings"], "error", "be_mismatch_landscape", f"Task {task['goalId']} has inconsistent BE between task bank and landscape.")
        for slot_id in task.get("slotIds", []):
            if slot_id not in slot_index:
                add_finding(report["globalFindings"], "error", "unknown_slot", f"Task {task['goalId']} references unknown slot {slot_id}.")

    validate_collection_membership(task_bank["tasks"], landscape["goals"], collection_specs, report["globalFindings"])

    for collection_id, collection in collection_index.items():
        findings: list[dict] = []
        tasks = collection_tasks[collection_id]
        structure_summary = validate_structure(collection, tasks, slot_index, findings)

        requirement = coverage_index.get(collection_id, {})
        coverage_summary = {}
        if "unionRequirements" in requirement:
            coverage_summary["union"] = validate_union_requirements(requirement["unionRequirements"], tasks, findings)
        if "bucketRequirements" in requirement or "mustIncludeCollectionTasks" in requirement:
            coverage_summary["buckets"] = validate_bucket_requirements(requirement, tasks, collection_tasks, findings)

        quality_summary = validate_quality(coverage["reviewFields"], tasks, findings)

        draft_ready = not any(finding["severity"] == "error" for finding in findings)
        release_ready = draft_ready and quality_summary["releasePendingFields"] == 0

        report["collections"][collection_id] = {
            "draftReady": draft_ready,
            "releaseReady": release_ready,
            "taskCount": len(tasks),
            "structure": structure_summary,
            "coverage": coverage_summary,
            "quality": quality_summary,
            "findings": findings,
        }

    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        with args.report.open("w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2, ensure_ascii=False)
            handle.write("\n")

    print("History exam pipeline validation summary")
    print("--------------------------------------")
    if report["globalFindings"]:
        print(f"Global findings: {len(report['globalFindings'])}")
    for collection_id, collection_report in report["collections"].items():
        print(
            f"{collection_id}: tasks={collection_report['taskCount']}, "
            f"draftReady={collection_report['draftReady']}, "
            f"releaseReady={collection_report['releaseReady']}, "
            f"findings={len(collection_report['findings'])}"
        )

    has_error = bool(report["globalFindings"]) or any(
        finding["severity"] == "error"
        for collection_report in report["collections"].values()
        for finding in collection_report["findings"]
    )
    if args.fail_on_error and has_error:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
