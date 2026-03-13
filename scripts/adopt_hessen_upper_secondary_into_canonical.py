#!/usr/bin/env python3

from __future__ import annotations

import copy
import json
import unicodedata
import uuid
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
UUID_NAMESPACE = uuid.UUID("fd8eb76f-7f91-4e69-8fb9-7a1647d4b0bb")


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(asciiize(data), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def asciiize_text(value: str) -> str:
    replacements = {
        "ä": "ae",
        "Ä": "Ae",
        "ö": "oe",
        "Ö": "Oe",
        "ü": "ue",
        "Ü": "Ue",
        "ß": "ss",
        "–": "-",
        "—": "-",
        "−": "-",
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
        "„": '"',
        "…": "...",
        "·": "·",
    }
    normalized = "".join(replacements.get(ch, ch) for ch in value)
    normalized = unicodedata.normalize("NFKD", normalized)
    return normalized.encode("ascii", "ignore").decode("ascii")


def asciiize(value: Any) -> Any:
    if isinstance(value, str):
        return asciiize_text(value)
    if isinstance(value, list):
        return [asciiize(item) for item in value]
    if isinstance(value, dict):
        return {key: asciiize(item) for key, item in value.items()}
    return value


def dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def preserve_current_goals(
    current_goals: list[dict[str, Any]],
    *,
    legacy_canonical_ids: set[str],
    root_goal_id: str,
    retained_ids: set[str],
) -> list[dict[str, Any]]:
    preserved: list[dict[str, Any]] = []
    for goal in current_goals:
        goal_id = goal["id"]
        if goal_id == root_goal_id:
            continue
        if goal_id in retained_ids:
            continue
        if goal_id in legacy_canonical_ids:
            continue
        preserved.append(copy.deepcopy(goal))
    return preserved


def stable_uuid(seed: str) -> str:
    return str(uuid.uuid5(UUID_NAMESPACE, seed))


def normalize_ref(ref: str) -> str:
    if ":" in ref:
        return ref.split(":", 1)[1]
    return ref


def merge_extended_data(
    existing_extended: dict[str, Any] | None,
    legacy_extended: dict[str, Any] | None,
    provenance: dict[str, Any],
) -> dict[str, Any]:
    merged: dict[str, Any] = {}
    if existing_extended:
        merged.update(copy.deepcopy(existing_extended))
    if legacy_extended:
        for key, value in legacy_extended.items():
            if key == "provenance":
                continue
            merged[key] = copy.deepcopy(value)
    merged.pop("pilot", None)

    current_provenance = merged.get("provenance")
    if isinstance(current_provenance, dict):
        for key, value in current_provenance.items():
            if key not in provenance:
                provenance[key] = copy.deepcopy(value)
    merged["provenance"] = provenance
    return merged


def merge_tags(legacy_tags: list[str] | None, existing_tags: list[str] | None) -> list[str]:
    legacy = list(legacy_tags or [])
    extras = [tag for tag in (existing_tags or []) if tag != "pilot"]
    return dedupe(legacy + extras)


class SubjectConfig:
    def __init__(
        self,
        *,
        subject_key: str,
        source_landscape_path: Path,
        target_landscape_path: Path,
        mapping_path: Path,
        source_landscape_id: str,
        source_landscape_title: str,
        target_landscape_id: str,
        root_goal_id: str,
        root_goal_mode: str,
        retained_current_goal_ids: list[str] | None = None,
        root_title: str,
        root_title_en: str,
        root_description: str,
        root_description_en: str,
        landscape_title: str,
        landscape_title_en: str,
        landscape_description: str,
        landscape_description_en: str,
        framework_id: str,
        additional_root_contains: list[str] | None = None,
    ) -> None:
        self.subject_key = subject_key
        self.source_landscape_path = source_landscape_path
        self.target_landscape_path = target_landscape_path
        self.mapping_path = mapping_path
        self.source_landscape_id = source_landscape_id
        self.source_landscape_title = source_landscape_title
        self.target_landscape_id = target_landscape_id
        self.root_goal_id = root_goal_id
        self.root_goal_mode = root_goal_mode
        self.retained_current_goal_ids = retained_current_goal_ids or []
        self.root_title = root_title
        self.root_title_en = root_title_en
        self.root_description = root_description
        self.root_description_en = root_description_en
        self.landscape_title = landscape_title
        self.landscape_title_en = landscape_title_en
        self.landscape_description = landscape_description
        self.landscape_description_en = landscape_description_en
        self.framework_id = framework_id
        self.additional_root_contains = additional_root_contains or []


MATH = SubjectConfig(
    subject_key="math",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_math_upper_secondary_to_canonical_math_pilot.json",
    source_landscape_id="2796fc7b-ba9d-446f-8f26-711dd6d8a9a3",
    source_landscape_title="Mathematik Oberstufe (Hessen, KC 2024)",
    target_landscape_id="68a8ac50-f5f5-4e24-8aa9-5e408ca01ced",
    root_goal_id="c01b1ce9-a667-4a46-b251-ec33ae602b15",
    root_goal_mode="math_super_root",
    retained_current_goal_ids=[
        "5c6b7342-0f67-4b4c-894d-fd83a6df64b3",
        "2bb4bb91-7929-483a-b735-44275f6b5cdc",
        "c1f50bcc-7848-4e49-b9de-0ec030cc6bca",
        "af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186",
        "9023226b-fc17-412b-807c-2bb45cd551d5",
        "e4f3a846-d2b8-4ee5-b0a2-4dc2833b2ecb",
        "c23705d2-57fc-4260-80d8-2d340203a173",
        "5a9702f4-7e4d-457d-b98c-f0bafcd1e386",
    ],
    root_title="Mathematik",
    root_title_en="Mathematics",
    root_description=(
        "Gemeinsame Wurzel fuer Mathematik am Gymnasium in Deutschland. "
        "Die aktuelle Baseline uebernimmt die hessische Oberstufe vollstaendig und behaelt "
        "den bereits aufgebauten Sek-I-Funktionsanschluss fuer die spaetere bundeslaenderuebergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for mathematics at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and keeps "
        "the previously established lower-secondary function bridge for later cross-state convergence."
    ),
    landscape_title="Kanonische Mathematik (Gymnasium, DE)",
    landscape_title_en="Canonical Mathematics (Gymnasium, DE)",
    landscape_description=(
        "Mathematik fuer das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollstaendig und behaelt "
        "den vorhandenen Sek-I-Funktionsanschluss als Ausgangspunkt fuer spaetere bundeslaenderuebergreifende Angleichung."
    ),
    landscape_description_en=(
        "Mathematics for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum and keeps "
        "the existing lower-secondary function bridge as the starting point for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-math",
    additional_root_contains=["5c6b7342-0f67-4b4c-894d-fd83a6df64b3"],
)

PHYSICS = SubjectConfig(
    subject_key="physics",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_physics_upper_secondary_to_canonical_physics_pilot.json",
    source_landscape_id="24f2ca0f-b94a-444e-bb70-677cb6f85c02",
    source_landscape_title="Physik Oberstufe (Hessen, KC 2024)",
    target_landscape_id="7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a",
    root_goal_id="bf980fff-b62b-4ea4-a20d-31681a7ad785",
    root_goal_mode="exact_root",
    root_title="Physik",
    root_title_en="Physics",
    root_description=(
        "Gemeinsame Wurzel fuer Physik am Gymnasium in Deutschland. "
        "Die aktuelle Baseline uebernimmt die hessische Oberstufe vollstaendig und behaelt "
        "die bereits eingefuehrten expliziten Mathematik-Voraussetzungen im Mechanik-Korridor."
    ),
    root_description_en=(
        "Shared root for physics at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and keeps "
        "the already introduced explicit mathematics prerequisites in the mechanics corridor."
    ),
    landscape_title="Kanonische Physik (Gymnasium, DE)",
    landscape_title_en="Canonical Physics (Gymnasium, DE)",
    landscape_description=(
        "Physik fuer das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollstaendig und behaelt "
        "die bereits aufgebauten fachuebergreifenden Mathematik-Voraussetzungen im Mechanikbereich."
    ),
    landscape_description_en=(
        "Physics for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum and keeps "
        "the already established cross-subject mathematics prerequisites in the mechanics domain."
    ),
    framework_id="canonical-gymnasium-physics",
)


def adopt_subject(config: SubjectConfig) -> tuple[int, int]:
    legacy = load_json(config.source_landscape_path)
    current = load_json(config.target_landscape_path)

    legacy_goals_by_id = {goal["id"]: goal for goal in legacy["goals"]}
    current_goals_by_id = {goal["id"]: goal for goal in current["goals"]}
    legacy_root = legacy["goals"][0]
    current_root = current_goals_by_id[config.root_goal_id]

    override_ids: dict[str, str] = {}
    for goal in current["goals"]:
        provenance = ((goal.get("extendedData") or {}).get("provenance") or {})
        if provenance.get("sourceLandscapeId") != config.source_landscape_id:
            continue
        source_goal_id = provenance.get("sourceGoalId")
        if source_goal_id:
            override_ids[source_goal_id] = goal["id"]

    def canonical_id_for_legacy(legacy_goal_id: str) -> str:
        if legacy_goal_id == legacy_root["id"]:
            return config.root_goal_id
        if legacy_goal_id in override_ids:
            return override_ids[legacy_goal_id]
        return stable_uuid(f"{config.subject_key}:{config.target_landscape_id}:{legacy_goal_id}")

    def map_refs(refs: list[str] | None) -> list[str]:
        mapped: list[str] = []
        for raw in refs or []:
            normalized = normalize_ref(raw)
            if normalized in legacy_goals_by_id:
                mapped.append(canonical_id_for_legacy(normalized))
            else:
                mapped.append(raw)
        return dedupe(mapped)

    retained_current_goals = [
        copy.deepcopy(current_goals_by_id[goal_id])
        for goal_id in config.retained_current_goal_ids
        if goal_id in current_goals_by_id
    ]
    retained_current_goal_ids = {goal["id"] for goal in retained_current_goals}
    legacy_canonical_ids = {canonical_id_for_legacy(goal["id"]) for goal in legacy["goals"]}
    preserved_current_goals = preserve_current_goals(
        current["goals"],
        legacy_canonical_ids=legacy_canonical_ids,
        root_goal_id=config.root_goal_id,
        retained_ids=retained_current_goal_ids,
    )

    if config.subject_key == "math":
        for goal in retained_current_goals:
            if goal["id"] == "5c6b7342-0f67-4b4c-894d-fd83a6df64b3":
                goal["title"] = "Funktionsgrundlagen (Sek I)"
                goal["titleEn"] = "Function Foundations (Lower Secondary)"
                goal["description"] = (
                    "Cluster fuer grundlegende Vorstellungen zu Zuordnungen, linearen Funktionen "
                    "und quadratischen Funktionen aus der gymnasialen Sekundarstufe I."
                )
                goal["descriptionEn"] = (
                    "Cluster for foundational ideas of mappings, linear functions, and quadratic "
                    "functions from lower secondary Gymnasium mathematics."
                )

    adopted_goals: list[dict[str, Any]] = []

    def transform_goal(legacy_goal: dict[str, Any], existing_goal: dict[str, Any] | None) -> dict[str, Any]:
        transformed = copy.deepcopy(legacy_goal)
        transformed["id"] = canonical_id_for_legacy(legacy_goal["id"])
        if existing_goal and existing_goal.get("shortKey"):
            transformed["shortKey"] = existing_goal["shortKey"]
        transformed["tags"] = merge_tags(legacy_goal.get("tags"), existing_goal.get("tags") if existing_goal else None)
        transformed["contains"] = map_refs(legacy_goal.get("contains"))
        transformed["requires"] = map_refs(legacy_goal.get("requires"))
        if existing_goal:
            transformed["contains"] = dedupe(transformed["contains"] + list(existing_goal.get("contains") or []))
            transformed["requires"] = dedupe(transformed["requires"] + list(existing_goal.get("requires") or []))
        provenance = {
            "sourceLandscapeId": config.source_landscape_id,
            "sourceLandscapeTitle": config.source_landscape_title,
            "sourceGoalId": legacy_goal["id"],
        }
        transformed["extendedData"] = merge_extended_data(
            existing_goal.get("extendedData") if existing_goal else None,
            legacy_goal.get("extendedData"),
            provenance,
        )
        if "type" not in transformed or not transformed["type"]:
            transformed["type"] = "cluster" if transformed.get("contains") else "atomic"
        return transformed

    generated_ids: set[str] = {config.root_goal_id}
    generated_ids.update(goal["id"] for goal in retained_current_goals)
    generated_ids.update(goal["id"] for goal in preserved_current_goals)

    for legacy_goal in legacy["goals"]:
        if legacy_goal["id"] == legacy_root["id"]:
            continue
        existing_goal = current_goals_by_id.get(canonical_id_for_legacy(legacy_goal["id"]))
        transformed = transform_goal(legacy_goal, existing_goal)
        if transformed["id"] in generated_ids:
            raise RuntimeError(f"Duplicate generated goal id {transformed['id']} in {config.subject_key}")
        generated_ids.add(transformed["id"])
        adopted_goals.append(transformed)

    root_contains = dedupe(
        list(config.additional_root_contains)
        + list(current_root.get("contains") or [])
        + [canonical_id_for_legacy(child_id) for child_id in legacy_root.get("contains", [])]
    )

    if config.root_goal_mode == "math_super_root":
        root_goal = copy.deepcopy(current_root)
        root_goal["title"] = config.root_title
        root_goal["titleEn"] = config.root_title_en
        root_goal["description"] = config.root_description
        root_goal["descriptionEn"] = config.root_description_en
        root_goal["contains"] = root_contains
        root_goal["requires"] = []
        root_goal["tags"] = dedupe(
            [tag for tag in current_root.get("tags", []) if tag != "pilot"]
            + list(legacy_root.get("tags") or [])
            + ["canonical", "subject:mathematics", "root"]
        )
        root_goal["weight"] = float((legacy_root.get("weight") or 0) + sum(goal.get("weight", 0) for goal in retained_current_goals if goal["id"] == "5c6b7342-0f67-4b4c-894d-fd83a6df64b3"))
        provenance = {
            "sourceLandscapeId": config.source_landscape_id,
            "sourceLandscapeTitle": config.source_landscape_title,
            "sourceGoalId": legacy_root["id"],
            "additionalSourceLandscapeIds": ["b167b4cd-4b78-4c84-a721-6b2adbbcab3c", "c1600692-e543-5cf2-a399-6bd96e6b817f"],
        }
        root_goal["extendedData"] = merge_extended_data(current_root.get("extendedData"), None, provenance)
        if "dimensionTags" in root_goal:
            root_goal["dimensionTags"]["framework"] = config.framework_id
    else:
        root_goal = transform_goal(legacy_root, current_root)
        root_goal["title"] = config.root_title
        root_goal["titleEn"] = config.root_title_en
        root_goal["description"] = config.root_description
        root_goal["descriptionEn"] = config.root_description_en
        root_goal["contains"] = root_contains
        root_goal["tags"] = dedupe(
            [tag for tag in root_goal.get("tags", []) if tag != "pilot"]
            + ["canonical", f"subject:{config.subject_key}", "root"]
        )
        root_goal["extendedData"] = merge_extended_data(
            current_root.get("extendedData"),
            legacy_root.get("extendedData"),
            {
                "sourceLandscapeId": config.source_landscape_id,
                "sourceLandscapeTitle": config.source_landscape_title,
                "sourceGoalId": legacy_root["id"],
            },
        )

    current["frameworkId"] = config.framework_id
    current["title"] = config.landscape_title
    current["titleEn"] = config.landscape_title_en
    current["description"] = config.landscape_description
    current["descriptionEn"] = config.landscape_description_en
    current["goals"] = [root_goal] + retained_current_goals + preserved_current_goals + adopted_goals

    mapping = {
        "version": 1,
        "sourceLandscapeId": config.source_landscape_id,
        "targetLandscapeId": config.target_landscape_id,
        "mappings": [
            {
                "legacyGoalId": goal["id"],
                "canonicalGoalId": canonical_id_for_legacy(goal["id"]),
                "matchType": "exact",
            }
            for goal in legacy["goals"]
        ],
    }

    write_json(config.target_landscape_path, current)
    write_json(config.mapping_path, mapping)
    return len(current["goals"]), len(mapping["mappings"])


def main() -> None:
    math_goals, math_mappings = adopt_subject(MATH)
    physics_goals, physics_mappings = adopt_subject(PHYSICS)
    print(
        json.dumps(
            {
                "mathGoals": math_goals,
                "mathMappings": math_mappings,
                "physicsGoals": physics_goals,
                "physicsMappings": physics_mappings,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
