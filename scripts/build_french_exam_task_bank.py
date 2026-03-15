#!/usr/bin/env python3
"""Build the 2026 Hessen French exam task bank from the landscape JSON."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from exam_release_utils import require_release_collection_specs, task_belongs_to_collection
from hessen_upper_secondary_paths import resolve_hessen_upper_secondary_exam_paths


ROOT = Path(__file__).resolve().parent.parent
EXAM_PATHS = resolve_hessen_upper_secondary_exam_paths("french")
LANDSCAPE_PATH = EXAM_PATHS.landscape_path
SLOT_MATRIX_PATH = EXAM_PATHS.slot_matrix_path
TASK_BANK_PATH = EXAM_PATHS.task_bank_path
SOURCE_LANDSCAPE_ID = EXAM_PATHS.source_landscape_id
SOURCE_LANDSCAPE_REGISTRY_PATH = EXAM_PATHS.source_landscape_registry_path

PHASE_ROOTS = {
    "d6082547-1160-5755-9e97-40d723b9e8d2": ("phase_practice", "E", "introductory_french_basics"),
    "b44141bb-d6ee-566f-943b-a55047eac0e6": ("phase_practice", "Q1", "relations_society_identity"),
    "23fac53c-d4d0-5ab1-bae0-0a03f7f2f4ed": ("phase_practice", "Q2", "encounter_other_globalization"),
    "71c8e024-65ab-5bb8-ba6c-77373e866a94": ("phase_practice", "Q3", "self_responsibility_work"),
    "27bc932b-96bc-57c4-9efc-1ab3e086c8dc": ("phase_practice", "Q4", "media_globalization_reflection"),
}

WRITING_OPERATORS = {
    "analysieren",
    "beurteilen",
    "bewerten",
    "erklaeren",
    "eroertern",
    "erlaeutern",
    "interpretieren",
    "kommentieren",
    "sprachmitteln",
    "strukturieren",
    "verfassen",
}


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", ascii_text.lower()).strip("_")


def build_parent_map(goals: list[dict]) -> dict[str, list[str]]:
    parents: dict[str, list[str]] = {}
    for goal in goals:
        for child_id in goal.get("contains", []):
            parents.setdefault(child_id, []).append(goal["id"])
    return parents


def direct_parent(goal_id: str, parents: dict[str, list[str]]) -> str | None:
    parent_ids = parents.get(goal_id, [])
    return parent_ids[0] if parent_ids else None


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


def infer_course_level(goal: dict) -> str:
    tags = set(goal.get("tags", []))
    if {"GK", "LK"} <= tags:
        return "BOTH"
    if "LK" in tags:
        return "LK"
    if "GK" in tags:
        return "GK"
    return "UNKNOWN"


def infer_proposal_id(title: str) -> str | None:
    match = re.search(r"(?:Pflichtaufgabe|Vorschlag) ((?:A)|(?:B1)|(?:B2))", title)
    return match.group(1) if match else None


def infer_offer_domain(proposal_id: str | None) -> str:
    mapping = {
        "A": "mediation_europe_globalization",
        "B1": "relations_society_identity",
        "B2": "self_media_responsibility",
    }
    return mapping.get(proposal_id, "unknown")


def infer_track(goal: dict, ancestors: set[str], offer_root_ids: list[str]) -> tuple[str, str, str]:
    proposal_id = infer_proposal_id(goal["title"])
    if any(root_id in ancestors for root_id in offer_root_ids):
        return ("abi_offer", "Abitur", infer_offer_domain(proposal_id))
    for root_id, track_data in PHASE_ROOTS.items():
        if root_id in ancestors:
            return track_data
    return ("unclassified", goal.get("dimensionTags", {}).get("phase", "UNKNOWN"), "unknown")


def infer_allowed_tools(track: str) -> str:
    if track == "abi_offer":
        return "language_exam_aids"
    return "AUTHOR_DEFINED"


def build_release_collections(
    task_course_level: str,
    production_track: str,
    ancestors: set[str],
    collection_specs: list[dict],
) -> list[str]:
    collections: list[str] = []
    for collection in collection_specs:
        if task_belongs_to_collection(collection, task_course_level, production_track, ancestors):
            collections.append(collection["id"])
    return collections


def infer_source_root(ancestors: set[str], offer_root_ids: list[str]) -> str | None:
    for root_id in (*offer_root_ids, *PHASE_ROOTS):
        if root_id in ancestors:
            return root_id
    return None


def quality_profile(course_level: str, track: str) -> str:
    level_prefix = "shared" if course_level == "BOTH" else course_level.lower()
    if track == "abi_offer":
        return f"{level_prefix}_offer"
    if track == "phase_practice":
        return f"{level_prefix}_phase_practice"
    return f"{level_prefix}_unspecified"


def quality_status(track: str, material_bound: bool) -> dict[str, str]:
    is_offer = track == "abi_offer"
    return {
        "abiStyle": "seeded" if is_offer else "pending",
        "materialQuality": "seeded" if is_offer and material_bound else "pending",
        "frenchConsistency": "seeded",
        "solutionConsistency": "seeded",
        "motivationPraxisbezug": "seeded" if is_offer else "pending",
        "originality": "pending",
    }


def build_slot_lookup(slot_matrix: dict) -> dict[tuple[str, str], dict]:
    lookup: dict[tuple[str, str], dict] = {}
    for slot in slot_matrix["slots"]:
        key = (slot["collectionId"], slot["proposalId"])
        lookup[key] = slot
    return lookup


def coverage_hints_from_slot(slot: dict) -> list[str]:
    hints: list[str] = []
    if slot.get("materialBound"):
        hints.append("material_bound_all_proposals")
    if slot.get("proposalId") == "A":
        hints.append("mediation_present")
    if slot.get("proposalId") in {"B1", "B2"} and any(op in WRITING_OPERATORS for op in slot.get("operatorProfile", [])):
        hints.append("integrated_reading_writing_present")
    if slot.get("courseLevel") == "LK":
        hints.append("lk_depth_in_all_proposals")
    return sorted(set(hints))


def main() -> None:
    landscape = load_json(LANDSCAPE_PATH)
    slot_matrix = load_json(SLOT_MATRIX_PATH)
    existing_task_bank = load_json(TASK_BANK_PATH) if TASK_BANK_PATH.exists() else {"tasks": []}
    existing_by_goal_id = {task["goalId"]: task for task in existing_task_bank.get("tasks", [])}

    goals = landscape["goals"]
    goals_by_id = {goal["id"]: goal for goal in goals}
    parents = build_parent_map(goals)
    collection_specs = require_release_collection_specs(goals, slot_matrix["collections"])
    offer_root_ids = [
        collection["resolvedLandscapeGoalId"]
        for collection in collection_specs
        if collection["kind"] == "offer"
    ]
    slot_lookup = build_slot_lookup(slot_matrix)

    task_entries: list[dict] = []

    for goal in goals:
        exam_data = goal.get("examData")
        if not exam_data:
            continue

        ancestors = ancestor_closure(goal["id"], parents)
        if not ancestors:
            continue

        track, phase_bucket, fallback_domain = infer_track(goal, ancestors, offer_root_ids)
        if track == "unclassified":
            continue

        course_level = infer_course_level(goal)
        proposal_id = infer_proposal_id(goal["title"]) if track == "abi_offer" else None
        slot = None
        slot_ids: list[str] = []
        domain = fallback_domain
        topic_codes: list[str] = []
        coverage_hint_ids: list[str] = []
        material_bound = False

        if track == "abi_offer":
            collection_id = "gk_offer_2026" if course_level == "GK" else "lk_offer_2026"
            slot = slot_lookup.get((collection_id, proposal_id or ""))
            if slot is None:
                raise ValueError(
                    f"No slot mapping for french offer task {goal['id']} ({goal['title']}) "
                    f"with collection={collection_id}, proposalId={proposal_id}."
                )
            slot_ids = [slot["id"]]
            domain = slot["domain"]
            topic_codes = list(slot.get("topicCodes", []))
            coverage_hint_ids = coverage_hints_from_slot(slot)
            material_bound = bool(slot.get("materialBound"))

        existing_entry = existing_by_goal_id.get(goal["id"], {})
        existing_review_status = existing_entry.get("quality", {}).get("reviewStatus", {})
        merged_review_status = quality_status(track, material_bound)
        merged_review_status.update(existing_review_status)

        parent_id = direct_parent(goal["id"], parents)
        root_id = infer_source_root(ancestors, offer_root_ids)
        if not parent_id or not root_id:
            continue

        task_entry = {
            "id": goal["id"],
            "goalId": goal["id"],
            "shortKey": goal.get("shortKey") or slugify(goal["title"]),
            "title": goal["title"],
            "courseLevel": course_level,
            "productionTrack": track,
            "releaseCollections": [],
            "slotIds": slot_ids,
            "proposalId": proposal_id,
            "phase": goal.get("dimensionTags", {}).get("phase", "UNKNOWN"),
            "domain": domain,
            "allowedTools": infer_allowed_tools(track),
            "beTotal": exam_data["scoring"]["maxPoints"],
            "demandLevel": goal.get("dimensionTags", {}).get("demandLevel"),
            "goalRefs": goal.get("requires", []),
            "coverage": {
                "phaseBucket": phase_bucket,
                "themeKey": slugify(goal["title"]),
                "topicCodes": topic_codes,
                "coverageHintIds": coverage_hint_ids,
                "coverageSource": "slot_matrix" if slot else "bucket_only",
            },
            "materialBound": material_bound,
            "sourceRootGoalId": root_id,
            "sourceRootTitle": goals_by_id[root_id]["title"],
            "sourceParentGoalId": parent_id,
            "sourceParentTitle": goals_by_id[parent_id]["title"],
            "quality": {
                "qualityProfileId": quality_profile(course_level, track),
                "reviewStatus": merged_review_status,
            },
            "status": existing_entry.get("status", "seeded"),
        }

        task_entry["releaseCollections"] = build_release_collections(
            course_level,
            track,
            ancestors,
            collection_specs,
        )
        task_entries.append(task_entry)

    task_entries.sort(
        key=lambda item: (
            item["productionTrack"],
            item["courseLevel"],
            item["phase"],
            item.get("proposalId") or "",
            item["title"],
        )
    )

    payload = {
        "examSpecId": "hessen-landesabitur-2026-french",
        "version": 1,
        "sourceLandscapeId": SOURCE_LANDSCAPE_ID,
        "sourceLandscapeRegistryPath": str(SOURCE_LANDSCAPE_REGISTRY_PATH.relative_to(ROOT)),
        "tasks": task_entries,
    }

    TASK_BANK_PATH.parent.mkdir(parents=True, exist_ok=True)
    with TASK_BANK_PATH.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    print(f"Wrote {len(task_entries)} tasks to {TASK_BANK_PATH}")


if __name__ == "__main__":
    main()
