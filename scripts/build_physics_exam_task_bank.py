#!/usr/bin/env python3
"""Build the 2026 Hessen physics exam task bank from the landscape JSON."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from exam_release_utils import require_release_collection_specs, task_belongs_to_collection


ROOT = Path(__file__).resolve().parent.parent
LANDSCAPE_PATH = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json"
SLOT_MATRIX_PATH = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/slot_matrix.json"
TASK_BANK_PATH = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/task_bank.json"

PHASE_ROOTS = {
    "56df0c93-e489-4534-9063-a98c6ff2411c": ("phase_practice", "E", "mechanics"),
    "0d8968ef-7011-488a-a3f1-e6e2ab7e66ff": ("phase_practice", "Q1", "fields_induction"),
    "bb23a52c-01f0-46f2-968f-2175049b7ca8": ("phase_practice", "Q2", "waves_oscillations"),
    "77007d19-7167-4ff7-80e0-b54ba98c9875": ("phase_practice", "Q3", "quantum_atom"),
    "49f01cc7-38d6-4184-ab58-bbdacefc07ee": ("phase_practice", "Q4", "modern_physics"),
}

FORM_ROOTS = {
    "0366ca7b-5a40-4645-8841-8af9d435e4d0": ("GK", "2026_1"),
    "4fe650ce-aa4d-48e9-9502-3a43e3e6e563": ("GK", "2026_2"),
    "525a3fa2-49e9-4d36-aba5-b78434e03bf9": ("LK", "2026_1"),
    "6ba4cb36-e658-495c-85a5-6d2b501c9fdf": ("LK", "2026_2"),
}

INTERPRETATION_OPERATORS = {
    "interpretieren",
    "beurteilen",
    "bewerten",
    "deuten",
    "kritisch einordnen",
    "vergleichend beurteilen",
    "modellgrenzen diskutieren",
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


def infer_track(goal: dict, ancestors: set[str], offer_root_ids: list[str]) -> tuple[str, str, str]:
    if any(root_id in ancestors for root_id in offer_root_ids):
        return ("abi_offer", "Abitur", infer_offer_domain(goal, ancestors))
    for root_id, track_data in PHASE_ROOTS.items():
        if root_id in ancestors:
            return track_data
    return ("unclassified", goal.get("dimensionTags", {}).get("phase", "UNKNOWN"), "unknown")


def infer_course_level(goal: dict) -> str:
    tags = set(goal.get("tags", []))
    if {"GK", "LK"} <= tags:
        return "BOTH"
    if "LK" in tags:
        return "LK"
    if "GK" in tags:
        return "GK"
    return "UNKNOWN"


def infer_form_id(ancestors: set[str]) -> str | None:
    for root_id, (_, form_id) in FORM_ROOTS.items():
        if root_id in ancestors:
            return form_id
    return None


def infer_offer_domain(goal: dict, ancestors: set[str]) -> str:
    form_id = infer_form_id(ancestors)
    proposal_id = infer_proposal_id(goal["title"])
    if form_id is None or proposal_id is None:
        return "unknown"
    if proposal_id == "A":
        return "fields_induction"
    if proposal_id == "B":
        return "waves_oscillations"
    if proposal_id == "C":
        return "quantum_atom"
    if proposal_id == "D" and infer_course_level(goal) == "LK":
        return "xray_quantum_depth"
    if proposal_id == "D":
        return "quantum_depth"
    return "unknown"


def infer_allowed_tools(track: str) -> str:
    if track == "abi_offer":
        return "standard_exam_aids"
    return "AUTHOR_DEFINED"


def infer_proposal_id(title: str) -> str | None:
    match = re.search(r"Vorschlag ([A-D])", title)
    return match.group(1) if match else None


def build_release_collections(
    task_course_level: str,
    production_track: str,
    ancestors: set[str],
    collection_specs: list[dict],
) -> list[str]:
    collections: list[str] = []
    for collection in collection_specs:
        if not task_belongs_to_collection(collection, task_course_level, production_track, ancestors):
            continue
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
        "physicsConsistency": "seeded",
        "solutionConsistency": "seeded",
        "motivationPraxisbezug": "seeded" if is_offer else "pending",
        "originality": "pending",
    }


def build_slot_lookup(slot_matrix: dict) -> dict[tuple[str, str, str], dict]:
    lookup: dict[tuple[str, str, str], dict] = {}
    for slot in slot_matrix["slots"]:
        key = (slot["collectionId"], slot["formId"], slot["proposalId"])
        lookup[key] = slot
    return lookup


def coverage_hints_from_slot(slot: dict) -> list[str]:
    hints: list[str] = []
    if slot.get("materialBound"):
        hints.append("material_bound_all_proposals")
        if slot.get("materialTypes"):
            hints.append("data_or_measurement_context_all_proposals")
    operators = set(slot.get("operatorProfile", []))
    if operators & INTERPRETATION_OPERATORS:
        hints.append("interpretation_or_bewertung_all_proposals")
    if slot["courseLevel"] == "LK" and slot["proposalId"] == "D" and "Q3.3" in slot.get("topicCodes", []):
        hints.append("lk_q3_3_in_proposal_d")
    if slot["courseLevel"] == "LK" and slot.get("mandatoryExtensions"):
        hints.append("lk_moseley_extension_present")
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
        form_id = infer_form_id(ancestors) if track == "abi_offer" else None
        proposal_id = infer_proposal_id(goal["title"]) if track == "abi_offer" else None
        slot = None
        slot_ids: list[str] = []
        domain = fallback_domain
        topic_codes: list[str] = []
        mandatory_terms: list[str] = []
        mandatory_extensions: list[str] = []
        coverage_hint_ids: list[str] = []
        material_bound = False

        if track == "abi_offer":
            collection_id = "gk_offer_2026" if course_level == "GK" else "lk_offer_2026"
            slot = slot_lookup.get((collection_id, form_id or "", proposal_id or ""))
            if slot is None:
                raise ValueError(
                    f"No slot mapping for physics offer task {goal['id']} ({goal['title']}) "
                    f"with collection={collection_id}, formId={form_id}, proposalId={proposal_id}."
                )
            slot_ids = [slot["id"]]
            domain = slot["domain"]
            topic_codes = list(slot.get("topicCodes", []))
            mandatory_terms = list(slot.get("mandatoryTerms", []))
            mandatory_extensions = list(slot.get("mandatoryExtensions", []))
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

        task_entries.append(
            {
                "id": goal["id"],
                "goalId": goal["id"],
                "shortKey": goal.get("shortKey") or slugify(goal["title"]),
                "title": goal["title"],
                "courseLevel": course_level,
                "productionTrack": track,
                "releaseCollections": [],
                "slotIds": slot_ids,
                "formId": form_id,
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
                    "mandatoryTerms": mandatory_terms,
                    "mandatoryExtensions": mandatory_extensions,
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
        )

        task_entries[-1]["releaseCollections"] = build_release_collections(
            course_level,
            track,
            ancestors,
            collection_specs,
        )

    task_entries.sort(
        key=lambda item: (
            item["productionTrack"],
            item["courseLevel"],
            item["phase"],
            item.get("formId") or "",
            item.get("proposalId") or "",
            item["title"],
        )
    )

    payload = {
        "examSpecId": "hessen-landesabitur-2026-physics",
        "version": 1,
        "landscapePath": str(LANDSCAPE_PATH.relative_to(ROOT)),
        "tasks": task_entries,
    }

    TASK_BANK_PATH.parent.mkdir(parents=True, exist_ok=True)
    with TASK_BANK_PATH.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    print(f"Wrote {len(task_entries)} tasks to {TASK_BANK_PATH}")


if __name__ == "__main__":
    main()
