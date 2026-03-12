#!/usr/bin/env python3
"""Build the 2026 Hessen informatics exam task bank from the landscape JSON."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from exam_release_utils import require_release_collection_specs, task_belongs_to_collection


ROOT = Path(__file__).resolve().parent.parent
LANDSCAPE_PATH = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_INFORMATIK.de.json"
SLOT_MATRIX_PATH = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Informatik/slot_matrix.json"
TASK_BANK_PATH = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Informatik/task_bank.json"

PHASE_ROOTS = {
    "b9cb98f0-16c5-5b5a-a15a-8f9e718a07c1": ("phase_practice", "E", "internet_web_programming"),
    "8f92401f-897d-5282-8859-b58f12f4bf95": ("phase_practice", "Q1", "algorithmic_oop"),
    "66a91fef-7608-56f0-a213-c5f7aa4a4be7": ("phase_practice", "Q2", "databases"),
    "c90da7df-48d2-51df-ae55-64972d4150e8": ("phase_practice", "Q3", "theoretical_informatics"),
    "0aaf7a1f-c87b-5f03-83d9-9b3a674973d8": ("phase_practice", "Q4", "technical_informatics_prolog"),
}

Q1_GOAL_IDS = {
    "9aa30b59-f7bd-49f8-9814-faaeaddbe4e8",
    "f9207c66-1347-4121-bf56-fd3ce0ad4ec9",
    "e1feb075-47f4-43e9-9f7b-418323dd0fb7",
    "431089c2-9152-4387-a142-ba80852d9a7b",
}
Q2_GOAL_IDS = {
    "18f714d2-62ea-440f-be5c-f4c203fe9d90",
    "250ee1b5-a9af-44a9-bfa1-d0322370e32b",
    "b12daa97-81eb-4e4c-8039-9c9bc243dcdd",
}
Q3_GOAL_IDS = {
    "f4847d81-6764-4fa7-b9e1-ece381520408",
    "074cec9d-b501-405c-a131-be6db239ddad",
    "a6c5846e-d9f5-4958-9efe-401171a65d11",
    "e87645e8-1100-4370-aa89-67f278a2a62c",
    "b76f6f88-78ee-4cdf-a7ce-36109d5eb169",
    "8eee5d80-e5cd-40a4-9f1b-6745c4c08e85",
    "7fcdd1bc-ee17-4ffe-ae8c-5a4956d871f3",
    "37161bc0-5580-4b03-8543-a003dbb45a54",
    "0143f5a2-9a31-4ab2-9aba-bc28b6eb4be8",
}

INTERPRETATION_OPERATORS = {
    "analysieren",
    "begruenden",
    "beurteilen",
    "entwickeln",
    "modellieren",
    "optimieren",
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
    patterns = [
        r"Pflichtaufgabe ([AB])",
        r"Vorschlag (A|B1|B2|C1|C2)",
    ]
    for pattern in patterns:
        match = re.search(pattern, title)
        if match:
            return match.group(1)
    return None


def infer_offer_domain(goal: dict) -> str:
    required_ids = set(goal.get("requires", []))
    title = goal.get("title", "").lower()

    if required_ids & Q2_GOAL_IDS:
        return "databases"
    if required_ids & Q3_GOAL_IDS:
        return "theoretical_informatics"
    if required_ids & Q1_GOAL_IDS:
        return "algorithmic_oop"

    if any(keyword in title for keyword in ("datenbank", "sql", "relation")):
        return "databases"
    if any(keyword in title for keyword in ("automat", "grammatik", "turing", "register", "berechen", "komplex")):
        return "theoretical_informatics"
    return "algorithmic_oop"


def infer_track(goal: dict, ancestors: set[str], offer_root_ids: list[str]) -> tuple[str, str, str]:
    if any(root_id in ancestors for root_id in offer_root_ids):
        return ("abi_offer", "Abitur", infer_offer_domain(goal))
    for root_id, track_data in PHASE_ROOTS.items():
        if root_id in ancestors:
            return track_data
    return ("unclassified", goal.get("dimensionTags", {}).get("phase", "UNKNOWN"), "unknown")


def infer_allowed_tools(track: str) -> str:
    if track == "abi_offer":
        return "standard_exam_aids"
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
        "informaticsConsistency": "seeded",
        "solutionConsistency": "seeded",
        "motivationPraxisbezug": "seeded" if is_offer else "pending",
        "originality": "pending",
    }


def build_slot_lookup(slot_matrix: dict) -> dict[tuple[str, str, str], dict]:
    lookup: dict[tuple[str, str, str], dict] = {}
    for slot in slot_matrix["slots"]:
        key = (slot["collectionId"], slot["proposalId"], slot["domain"])
        lookup[key] = slot
    return lookup


def coverage_hints_from_slot(slot: dict) -> list[str]:
    hints: list[str] = []
    if slot.get("materialBound"):
        hints.append("material_bound_all_proposals")
    if slot.get("languageVariants"):
        hints.append("java_or_python_variant_ready")
    if slot.get("domain") == "algorithmic_oop" and str(slot.get("selectionRole", "")).startswith("mandatory"):
        hints.append("algorithmic_mandatory_component_present")
    if slot.get("proposalId") in {"B1", "B2"}:
        hints.append("databases_or_theory_choice_present")
    if slot.get("courseLevel") == "LK":
        hints.append("lk_depth_in_all_proposals")
        if slot.get("proposalId") in {"B", "C1", "C2"}:
            hints.append("cross_half_year_coverage_present")
    if any(op in INTERPRETATION_OPERATORS for op in slot.get("operatorProfile", [])):
        hints.append("operatorically_rich_offers_present")
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
            domain = infer_offer_domain(goal)
            slot = slot_lookup.get((collection_id, proposal_id or "", domain))
            if slot is None:
                raise ValueError(
                    f"No slot mapping for informatics offer task {goal['id']} ({goal['title']}) "
                    f"with collection={collection_id}, proposalId={proposal_id}, domain={domain}."
                )
            slot_ids = [slot["id"]]
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
            item["domain"],
            item["title"],
        )
    )

    payload = {
        "examSpecId": "hessen-landesabitur-2026-informatics",
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
