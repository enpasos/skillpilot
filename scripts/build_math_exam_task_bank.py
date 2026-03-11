#!/usr/bin/env python3
"""Build the 2026 Hessen math exam task bank from the landscape JSON."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from math_exam_release_utils import require_release_collection_specs


ROOT = Path(__file__).resolve().parent.parent
LANDSCAPE_PATH = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json"
SLOT_MATRIX_PATH = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Mathe/slot_matrix.json"
TASK_BANK_PATH = ROOT / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Mathe/task_bank.json"

GK_PART1_ID = "bdf27846-8d7a-5a48-a108-3e5a9660e62a"
LK_PART1_ID = "47d7c4aa-e6a0-5955-8c24-d2d07c3cb898"
GK_PART2_ID = "f13a3bae-88ed-53e9-b5a7-21179a264119"
LK_PART2_ID = "3cdb44da-e46e-504c-ad61-e04b282359d2"

PHASE_ROOTS = {
    "579e6b1a-02fc-53ed-81fd-e2413d9d6575": ("phase_practice", "E", "analysis"),
    "eda62545-ff80-544e-82e0-301131d16605": ("phase_practice", "Q1", "analysis"),
    "2797a516-1be3-5ab2-8f28-b60e70444f66": ("phase_practice", "Q2", "linalg_geo"),
    "74f9a8ba-8ac3-5acb-a161-552da913e905": ("phase_practice", "Q3", "stoch"),
    "0f344cd9-d4c8-5065-8776-23ce1c1f92ee": ("phase_practice", "Q4", "mixed"),
    "1cbbc7d5-11b5-5ef6-a228-001c77f80944": ("process_practice", "GLOBAL", "process"),
}

OFFER_OVERRIDES = {
    "52470a68-dd71-5a8c-b312-e5faab22959f": {
        "slotIds": ["gk_a_analysis_n1_mandatory"],
        "topicCodes": ["Q1.1", "Q1.2"],
        "specialHintIds": [],
    },
    "f2d5f069-a1fa-5df5-aa69-eb5e32865b95": {
        "slotIds": ["gk_a_analysis_n2_optional"],
        "topicCodes": ["Q1.2"],
        "specialHintIds": [],
    },
    "4414c5fa-ceaa-54f0-bbf2-d605f0d48431": {
        "slotIds": ["gk_a_stoch_n1_mandatory"],
        "topicCodes": ["Q3.1"],
        "specialHintIds": [],
    },
    "828178ed-12eb-5b15-b346-c6a18a2e38bf": {
        "slotIds": ["gk_a_linalg_geo_n1_mandatory"],
        "topicCodes": ["Q2.6"],
        "specialHintIds": [],
    },
    "a5a5a5a5-a5a5-4a5a-8a5a-a5a5a5a5a5a5": {
        "slotIds": ["gk_a_stoch_n1_optional"],
        "topicCodes": ["Q3.1"],
        "specialHintIds": [],
    },
    "8c2c7b50-6f7a-4c91-9e2b-3f4c6e5a1b3d": {
        "slotIds": ["gk_a_analysis_n1_optional"],
        "topicCodes": ["Q1.2"],
        "specialHintIds": [],
    },
    "3b4e9d1a-5f8c-4a3b-2e1d-7f9a8c6b5e0d": {
        "slotIds": ["gk_a_linalg_geo_n2_optional"],
        "topicCodes": ["Q2.3"],
        "specialHintIds": [],
    },
    "9e1c4b7a-3f2d-8a5c-6b0e-1d7f9a3c5b8e": {
        "slotIds": ["gk_a_linalg_geo_n1_optional"],
        "topicCodes": ["Q2.1"],
        "specialHintIds": [],
    },
    "5a7f9b3c-1e2d-6a8b-4c0e-9d3f5a7b1c6e": {
        "slotIds": ["gk_a_stoch_n2_optional"],
        "topicCodes": ["Q3.2"],
        "specialHintIds": [],
    },
    "0ba923a8-1641-51a7-b01e-7860bf97d513": {
        "slotIds": ["gk_b1_analysis"],
        "topicCodes": ["Q1.1", "Q1.2", "Q1.3", "Q1.4"],
        "specialHintIds": ["q1_3_limits"],
    },
    "2f4a8b6c-1e9d-3a5f-7b0e-8c2d4a6b1e3f": {
        "slotIds": ["gk_b2_analysis"],
        "topicCodes": ["Q1.2", "Q1.4"],
        "specialHintIds": [],
    },
    "147b8cd6-b659-5581-9875-45c3339b522b": {
        "slotIds": ["gk_c_linalg_geo"],
        "topicCodes": ["Q2.2", "Q2.3", "Q2.6"],
        "specialHintIds": ["q2_6_normal_vector", "q2_angle_in_lagebeziehung"],
    },
    "d1d1d1d1-d1d1-4d1d-8d1d-d1d1d1d1d1d1": {
        "slotIds": ["gk_d_stoch"],
        "topicCodes": ["Q3.1", "Q3.3", "Q3.4"],
        "specialHintIds": ["q3_inverse_distribution_part2"],
    },
    "2ef712f1-84fe-5395-b232-af7017163449": {
        "slotIds": ["lk_a_analysis_n1_mandatory_1"],
        "topicCodes": ["Q1.2", "Q1.3"],
        "specialHintIds": ["q1_3_limits"],
    },
    "eebf8986-8745-51cd-8c3d-b20ab23b7577": {
        "slotIds": ["lk_a_analysis_n2_optional_1"],
        "topicCodes": ["Q1.4"],
        "specialHintIds": [],
    },
    "770ad9dc-abbe-5504-9dad-10a4bd96b6bb": {
        "slotIds": ["lk_a_stoch_n2_optional_1"],
        "topicCodes": ["Q3.3"],
        "specialHintIds": [],
    },
    "d1428383-7c50-4819-bf39-49774301551a": {
        "slotIds": ["lk_a_linalg_geo_n1_mandatory"],
        "topicCodes": ["Q2.2", "Q2.3"],
        "specialHintIds": ["q2_angle_in_lagebeziehung"],
    },
    "c5620909-0d2e-4375-a86d-91340156930b": {
        "slotIds": ["lk_a_analysis_n1_mandatory_2"],
        "topicCodes": ["Q1.1", "Q1.4"],
        "specialHintIds": [],
    },
    "f8915421-26c7-4402-ba45-31298467185c": {
        "slotIds": ["lk_a_stoch_n1_mandatory"],
        "topicCodes": ["Q3.1"],
        "specialHintIds": [],
    },
    "7b9c1d3e-5a8f-2b4a-6c0e-1d9f3a5b7c8e": {
        "slotIds": ["lk_a_analysis_n2_optional_2"],
        "topicCodes": ["Q1.4"],
        "specialHintIds": [],
    },
    "4a6b8c2d-9e1f-3a5b-7c0e-1d9f3a5b7c8e": {
        "slotIds": ["lk_a_linalg_geo_n2_optional_1"],
        "topicCodes": ["Q2.1"],
        "specialHintIds": [],
    },
    "1c3d5e7f-9a2b-4c6d-8e0b-1a3f7c9b5e0d": {
        "slotIds": ["lk_a_linalg_geo_n2_optional_2"],
        "topicCodes": ["Q2.3"],
        "specialHintIds": [],
    },
    "6b8c2d4e-1f9a-3b5c-7e0d-1a9f3b5c7e0d": {
        "slotIds": ["lk_a_stoch_n2_optional_2"],
        "topicCodes": ["Q3.2"],
        "specialHintIds": [],
    },
    "bc60e300-96be-599a-89b6-8fcca380803d": {
        "slotIds": ["lk_b1_analysis"],
        "topicCodes": ["Q1.1", "Q1.2", "Q1.3", "Q1.4"],
        "specialHintIds": [],
    },
    "3d5e7f9a-2b4c-6d8e-0b1a-3f7c9b5e0d1a": {
        "slotIds": ["lk_b2_analysis"],
        "topicCodes": ["Q1.1", "Q1.2", "Q1.4"],
        "specialHintIds": [],
    },
    "971b981d-d8e0-5c4c-9b93-e401b19f32fc": {
        "slotIds": ["lk_c_linalg_geo"],
        "topicCodes": ["Q2.4"],
        "specialHintIds": [],
    },
    "d2d2d2d2-d2d2-4d2d-8d2d-d2d2d2d2d2d2": {
        "slotIds": ["lk_d_stoch"],
        "topicCodes": ["Q3.1", "Q3.3", "Q3.4"],
        "specialHintIds": ["q3_inverse_distribution_part2"],
    },
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
        return ("abi_offer", "Abitur", infer_offer_domain(goal))
    for root_id, track_data in PHASE_ROOTS.items():
        if root_id in ancestors:
            return track_data
    return ("unclassified", goal["dimensionTags"].get("phase", "UNKNOWN"), infer_offer_domain(goal))


def infer_offer_domain(goal: dict) -> str:
    title = goal["title"]
    if "Analysis" in title:
        return "analysis"
    if "Stochastik" in title:
        return "stoch"
    if "Lineare Algebra" in title:
        return "linalg_geo"
    return "mixed"


def infer_course_level(goal: dict) -> str:
    tags = set(goal.get("tags", []))
    if {"GK", "LK"} <= tags:
        return "BOTH"
    if "LK" in tags:
        return "LK"
    if "GK" in tags:
        return "GK"
    return "UNKNOWN"


def infer_exam_part(ancestors: set[str]) -> str:
    if GK_PART1_ID in ancestors or LK_PART1_ID in ancestors:
        return "A"
    if GK_PART2_ID in ancestors or LK_PART2_ID in ancestors:
        return part_from_offer_title(ancestors)
    return "PRACTICE"


def part_from_offer_title(ancestors: set[str]) -> str:
    if GK_PART2_ID in ancestors or LK_PART2_ID in ancestors:
        return "PART2"
    return "PRACTICE"


def infer_part_from_title(title: str, ancestors: set[str]) -> str:
    if GK_PART1_ID in ancestors or LK_PART1_ID in ancestors:
        return "A"
    if GK_PART2_ID in ancestors or LK_PART2_ID in ancestors:
        if title.startswith("B1") or title.startswith("B2"):
            return "B"
        if title.startswith("C1"):
            return "C"
        if title.startswith("D1"):
            return "D"
    return "PRACTICE"


def infer_niveau(goal: dict, ancestors: set[str]) -> int | None:
    if GK_PART1_ID not in ancestors and LK_PART1_ID not in ancestors:
        return None
    match = re.search(r"Niveau (\d)", goal["title"])
    return int(match.group(1)) if match else None


def infer_allowed_tools(ancestors: set[str]) -> str:
    if GK_PART1_ID in ancestors or LK_PART1_ID in ancestors:
        return "none"
    if GK_PART2_ID in ancestors or LK_PART2_ID in ancestors:
        return "WTR_OR_CAS"
    return "AUTHOR_DEFINED"


def collection_accepts_course_level(collection_course_level: str, task_course_level: str) -> bool:
    if task_course_level == "BOTH":
        return collection_course_level in {"GK", "LK"}
    return collection_course_level == task_course_level


def build_release_collections(
    task_course_level: str,
    ancestors: set[str],
    collection_specs: list[dict],
) -> list[str]:
    collections: list[str] = []
    for collection in collection_specs:
        landscape_goal_id = collection.get("resolvedLandscapeGoalId")
        if not landscape_goal_id or landscape_goal_id not in ancestors:
            continue
        if not collection_accepts_course_level(collection["courseLevel"], task_course_level):
            continue
        collections.append(collection["id"])
    return collections


def infer_source_root(ancestors: set[str], offer_root_ids: list[str]) -> str | None:
    for root_id in (*offer_root_ids, *PHASE_ROOTS):
        if root_id in ancestors:
            return root_id
    return None


def quality_profile(course_level: str, track: str, exam_part: str, niveau: int | None) -> str:
    level_prefix = "shared" if course_level == "BOTH" else course_level.lower()
    if track == "abi_offer" and exam_part == "A" and niveau is not None:
        return f"{level_prefix}_part1_n{niveau}"
    if track == "abi_offer" and exam_part in {"B", "C", "D"}:
        return f"{level_prefix}_part2"
    if track == "phase_practice":
        return f"{level_prefix}_phase_practice"
    if track == "process_practice":
        return f"{level_prefix}_process_practice"
    return f"{level_prefix}_unspecified"


def quality_status(track: str, exam_part: str) -> dict[str, str]:
    has_context_seed = track == "abi_offer" and exam_part in {"B", "C", "D"}
    abi_style_seed = track == "abi_offer"
    return {
        "abiStyle": "seeded" if abi_style_seed else "pending",
        "motivationPraxisbezug": "seeded" if has_context_seed else "pending",
        "solutionConsistency": "seeded",
        "originality": "pending",
    }


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

    task_entries: list[dict] = []

    for goal in goals:
        exam_data = goal.get("examData")
        if not exam_data:
            continue

        ancestors = ancestor_closure(goal["id"], parents)
        if not ancestors:
            continue

        track, phase_bucket, domain = infer_track(goal, ancestors, offer_root_ids)
        if track == "unclassified":
            continue

        course_level = infer_course_level(goal)
        exam_part = infer_part_from_title(goal["title"], ancestors)
        niveau = infer_niveau(goal, ancestors)
        override = OFFER_OVERRIDES.get(goal["id"], {})
        slot_ids = override.get("slotIds", [])
        existing_entry = existing_by_goal_id.get(goal["id"], {})
        existing_review_status = existing_entry.get("quality", {}).get("reviewStatus", {})
        merged_review_status = quality_status(track, exam_part)
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
                "releaseCollections": build_release_collections(course_level, ancestors, collection_specs),
                "slotIds": slot_ids,
                "examPart": exam_part,
                "phase": goal["dimensionTags"].get("phase", "UNKNOWN"),
                "domain": domain,
                "niveau": niveau,
                "allowedTools": infer_allowed_tools(ancestors),
                "beTotal": exam_data["scoring"]["maxPoints"],
                "demandLevel": goal["dimensionTags"].get("demandLevel"),
                "goalRefs": goal.get("requires", []),
                "coverage": {
                    "phaseBucket": phase_bucket,
                    "themeKey": slugify(goal["title"]),
                    "topicCodes": override.get("topicCodes", []),
                    "specialHintIds": override.get("specialHintIds", []),
                    "coverageSource": "manual_offer_override" if override else "bucket_only",
                },
                "sourceRootGoalId": root_id,
                "sourceRootTitle": goals_by_id[root_id]["title"],
                "sourceParentGoalId": parent_id,
                "sourceParentTitle": goals_by_id[parent_id]["title"],
                "quality": {
                    "qualityProfileId": quality_profile(course_level, track, exam_part, niveau),
                    "reviewStatus": merged_review_status,
                },
                "status": existing_entry.get("status", "seeded"),
            }
        )

    task_entries.sort(
        key=lambda item: (
            item["productionTrack"],
            item["courseLevel"],
            item["phase"],
            item["examPart"],
            item["title"],
        )
    )

    payload = {
        "examSpecId": "hessen-landesabitur-2026-math",
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
