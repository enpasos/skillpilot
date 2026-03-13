#!/usr/bin/env python3

from __future__ import annotations

import copy
import json
import uuid
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
UUID_NAMESPACE = uuid.UUID("fd8eb76f-7f91-4e69-8fb9-7a1647d4b0bb")


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


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
        external_ref_overrides: dict[str, str] | None = None,
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
        self.external_ref_overrides = external_ref_overrides or {}


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
        "Gemeinsame Wurzel für Mathematik am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und behält "
        "den bereits aufgebauten Sek-I-Funktionsanschluss für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for mathematics at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and keeps "
        "the previously established lower-secondary function bridge for later cross-state convergence."
    ),
    landscape_title="Mathematik (Gymnasium, DE)",
    landscape_title_en="Mathematics (Gymnasium, DE)",
    landscape_description=(
        "Mathematik für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig und behält "
        "den vorhandenen Sek-I-Funktionsanschluss als Ausgangspunkt für spätere bundesländerübergreifende Angleichung."
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
        "Gemeinsame Wurzel für Physik am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und behält "
        "die bereits eingeführten expliziten Mathematik-Voraussetzungen im Mechanik-Korridor."
    ),
    root_description_en=(
        "Shared root for physics at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and keeps "
        "the already introduced explicit mathematics prerequisites in the mechanics corridor."
    ),
    landscape_title="Physik (Gymnasium, DE)",
    landscape_title_en="Physics (Gymnasium, DE)",
    landscape_description=(
        "Physik für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig und behält "
        "die bereits aufgebauten fachübergreifenden Mathematik-Voraussetzungen im Mechanikbereich."
    ),
    landscape_description_en=(
        "Physics for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum and keeps "
        "the already established cross-subject mathematics prerequisites in the mechanics domain."
    ),
    framework_id="canonical-gymnasium-physics",
    external_ref_overrides={
        "e2b6b4d1-02db-4a27-948e-ecfbdb44dab3": "858113c5-e53b-57bb-b01f-ba95c3ddcb6f",
    },
)

CHEMISTRY = SubjectConfig(
    subject_key="chemistry",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_CHEMIE.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_chemistry_upper_secondary_to_canonical_chemistry.json",
    source_landscape_id="2f391ba2-ba1e-40e4-a8d2-dff049516c13",
    source_landscape_title="Chemie Oberstufe (Hessen, KC 2024)",
    target_landscape_id="c436b994-8f44-5134-b9f8-0c9f5d6a5ba0",
    root_goal_id="442c31c5-c561-5c7a-90bb-2335d779175c",
    root_goal_mode="exact_root",
    root_title="Chemie",
    root_title_en="Chemistry",
    root_description=(
        "Gemeinsame Wurzel für Chemie am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for chemistry at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Chemie (Gymnasium, DE)",
    landscape_title_en="Chemistry (Gymnasium, DE)",
    landscape_description=(
        "Chemie für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "Chemistry for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-chemistry",
)

BIOLOGY = SubjectConfig(
    subject_key="biology",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_BIOLOGIE.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_biology_upper_secondary_to_canonical_biology.json",
    source_landscape_id="3e56aa75-c76c-4de5-883b-0aac98297846",
    source_landscape_title="Biologie Oberstufe (Hessen, KC 2024)",
    target_landscape_id="08a43a1b-d97e-522c-9dfa-c950a493364e",
    root_goal_id="e8d54127-d42e-51f5-bfa5-51d826069f95",
    root_goal_mode="exact_root",
    root_title="Biologie",
    root_title_en="Biology",
    root_description=(
        "Gemeinsame Wurzel für Biologie am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for biology at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Biologie (Gymnasium, DE)",
    landscape_title_en="Biology (Gymnasium, DE)",
    landscape_description=(
        "Biologie für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "Biology for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-biology",
)

INFORMATICS = SubjectConfig(
    subject_key="informatics",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_INFORMATIK.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_informatics_upper_secondary_to_canonical_informatics.json",
    source_landscape_id="c1a02ddd-736d-4975-920b-18b03aff147f",
    source_landscape_title="Informatik Oberstufe (Hessen, KC 2024)",
    target_landscape_id="7d51b38c-a149-5407-bddc-d2ce7878b020",
    root_goal_id="29ec47db-7dfe-553d-b850-40e06f164545",
    root_goal_mode="exact_root",
    root_title="Informatik",
    root_title_en="Computer Science",
    root_description=(
        "Gemeinsame Wurzel für Informatik am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for computer science at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Informatik (Gymnasium, DE)",
    landscape_title_en="Computer Science (Gymnasium, DE)",
    landscape_description=(
        "Informatik für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "Computer science for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-informatics",
)

HISTORY = SubjectConfig(
    subject_key="history",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_GESCHICHTE.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_history_upper_secondary_to_canonical_history.json",
    source_landscape_id="bdc89685-73d3-446c-af5a-eaf642c07463",
    source_landscape_title="Geschichte Oberstufe (Hessen, KC 2024)",
    target_landscape_id="92406d94-e3c1-58ec-b7c6-12122278d25a",
    root_goal_id="37edc7ba-faca-5142-a909-4d8ecf4bd18b",
    root_goal_mode="exact_root",
    root_title="Geschichte",
    root_title_en="History",
    root_description=(
        "Gemeinsame Wurzel für Geschichte am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for history at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Geschichte (Gymnasium, DE)",
    landscape_title_en="History (Gymnasium, DE)",
    landscape_description=(
        "Geschichte für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "History for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-history",
)

GERMAN = SubjectConfig(
    subject_key="german",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_DEUTSCH.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_german_upper_secondary_to_canonical_german.json",
    source_landscape_id="f1ba2118-853f-4aa0-bef5-4f749bc621ed",
    source_landscape_title="Deutsch Oberstufe (Hessen, KC 2024)",
    target_landscape_id="67bd301b-e11a-582d-94ba-4f4b1a4cefff",
    root_goal_id="a9154942-479f-54e7-9f65-7312be75686d",
    root_goal_mode="exact_root",
    root_title="Deutsch",
    root_title_en="German",
    root_description=(
        "Gemeinsame Wurzel für Deutsch am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for German at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Deutsch (Gymnasium, DE)",
    landscape_title_en="German (Gymnasium, DE)",
    landscape_description=(
        "Deutsch für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "German for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-german",
)

POLITICS_ECONOMICS = SubjectConfig(
    subject_key="politics_economics",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_POLITIKWIRTSCHAFT.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_POLITIKWIRTSCHAFT.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_politics_economics_upper_secondary_to_canonical_politics_economics.json",
    source_landscape_id="1d0e9f8f-0087-49e4-8ea2-976e5a89b165",
    source_landscape_title="Politik und Wirtschaft Oberstufe (Hessen, KC 2024)",
    target_landscape_id="51b60137-46e8-5498-973e-ea38bb32f327",
    root_goal_id="94b281ca-2317-5d73-9a4a-0ae2d5896c1e",
    root_goal_mode="exact_root",
    root_title="Politik und Wirtschaft",
    root_title_en="Politics and Economics",
    root_description=(
        "Gemeinsame Wurzel für Politik und Wirtschaft am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for politics and economics at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Politik und Wirtschaft (Gymnasium, DE)",
    landscape_title_en="Politics and Economics (Gymnasium, DE)",
    landscape_description=(
        "Politik und Wirtschaft für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "Politics and economics for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-politics-economics",
)

ENGLISH = SubjectConfig(
    subject_key="english",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_ENGLISCH.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_ENGLISCH.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_english_upper_secondary_to_canonical_english.json",
    source_landscape_id="bc2124fa-2974-46cc-85e7-2392e61250e1",
    source_landscape_title="Englisch Oberstufe (Hessen, KC 2024)",
    target_landscape_id="c8c84073-46ae-57ec-898a-882d08d7a72f",
    root_goal_id="c787e8c5-fc6e-5a8b-8482-92a8fe65553f",
    root_goal_mode="exact_root",
    root_title="Englisch",
    root_title_en="English",
    root_description=(
        "Gemeinsame Wurzel für Englisch am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for English at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Englisch (Gymnasium, DE)",
    landscape_title_en="English (Gymnasium, DE)",
    landscape_description=(
        "Englisch für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "English for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-english",
)

FRENCH = SubjectConfig(
    subject_key="french",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_FRANZOESISCH.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_FRANZOESISCH.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_french_upper_secondary_to_canonical_french.json",
    source_landscape_id="30acd190-609c-4109-8ee7-06fc5594af19",
    source_landscape_title="Französisch Oberstufe (Hessen, KC 2024)",
    target_landscape_id="96a915cc-4fd6-5dc2-8cee-aaf3ab8c2977",
    root_goal_id="3cdb4109-e977-54f3-b662-0800e2f043d3",
    root_goal_mode="exact_root",
    root_title="Französisch",
    root_title_en="French",
    root_description=(
        "Gemeinsame Wurzel für Französisch am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for French at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Französisch (Gymnasium, DE)",
    landscape_title_en="French (Gymnasium, DE)",
    landscape_description=(
        "Französisch für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "French for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-french",
)

LATIN = SubjectConfig(
    subject_key="latin",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_LATEIN.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_LATEIN.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_latin_upper_secondary_to_canonical_latin.json",
    source_landscape_id="fe28bda8-03f3-4c4a-8286-7fcfce4eeac1",
    source_landscape_title="Latein Oberstufe (Hessen, KC 2024)",
    target_landscape_id="668cf206-941e-51f8-8704-3e8938631235",
    root_goal_id="34596272-3efc-58f9-b213-b5665ce59c3d",
    root_goal_mode="exact_root",
    root_title="Latein",
    root_title_en="Latin",
    root_description=(
        "Gemeinsame Wurzel für Latein am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for Latin at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Latein (Gymnasium, DE)",
    landscape_title_en="Latin (Gymnasium, DE)",
    landscape_description=(
        "Latein für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "Latin for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-latin",
)

SPANISH = SubjectConfig(
    subject_key="spanish",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_SPANISCH.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_SPANISCH.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_spanish_upper_secondary_to_canonical_spanish.json",
    source_landscape_id="936efc61-a4d5-49fd-8694-085d1347db80",
    source_landscape_title="Spanisch Oberstufe (Hessen, KC 2024)",
    target_landscape_id="90eedebf-9ea8-5247-85dd-31c147f907c3",
    root_goal_id="1b23eb50-e5f6-5958-8c99-ff8ca9668031",
    root_goal_mode="exact_root",
    root_title="Spanisch",
    root_title_en="Spanish",
    root_description=(
        "Gemeinsame Wurzel für Spanisch am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for Spanish at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Spanisch (Gymnasium, DE)",
    landscape_title_en="Spanish (Gymnasium, DE)",
    landscape_description=(
        "Spanisch für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "Spanish for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-spanish",
)

GREEK = SubjectConfig(
    subject_key="greek",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_GRIECHISCH.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GRIECHISCH.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_greek_upper_secondary_to_canonical_greek.json",
    source_landscape_id="c7209caa-18e5-4dd8-b68f-dd86e228d045",
    source_landscape_title="Griechisch Oberstufe (Hessen, KC 2024)",
    target_landscape_id="70a2cb55-127b-5c6e-b518-4a1c9f4f77a0",
    root_goal_id="224a8ce5-e781-5973-acbd-9994b329fe8d",
    root_goal_mode="exact_root",
    root_title="Griechisch",
    root_title_en="Greek",
    root_description=(
        "Gemeinsame Wurzel für Griechisch am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for Greek at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Griechisch (Gymnasium, DE)",
    landscape_title_en="Greek (Gymnasium, DE)",
    landscape_description=(
        "Griechisch für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "Greek for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-greek",
)

CHINESE = SubjectConfig(
    subject_key="chinese",
    source_landscape_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_CHINESISCH.de.json",
    target_landscape_path=REPO_ROOT
    / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHINESISCH.de.json",
    mapping_path=REPO_ROOT
    / "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_chinese_upper_secondary_to_canonical_chinese.json",
    source_landscape_id="7651cbe2-5fb8-464d-b0c4-3e830cda41dd",
    source_landscape_title="Chinesisch Oberstufe (Hessen, KC 2024)",
    target_landscape_id="8fdb83f5-b42a-5b36-ab5d-64edd4b2ab80",
    root_goal_id="494065c2-8707-5284-b6ba-a159df15bb6c",
    root_goal_mode="exact_root",
    root_title="Chinesisch",
    root_title_en="Chinese",
    root_description=(
        "Gemeinsame Wurzel für Chinesisch am Gymnasium in Deutschland. "
        "Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und schafft "
        "damit einen belastbaren Startpunkt für die spätere bundesländerübergreifende Konvergenz."
    ),
    root_description_en=(
        "Shared root for Chinese at Gymnasium in Germany. "
        "The current baseline fully adopts the Hessian upper-secondary curriculum and establishes "
        "a reliable starting point for later cross-state convergence."
    ),
    landscape_title="Chinesisch (Gymnasium, DE)",
    landscape_title_en="Chinese (Gymnasium, DE)",
    landscape_description=(
        "Chinesisch für das Gymnasium in Deutschland. "
        "Die aktuelle Baseline sichert die hessische Oberstufe vollständig als Ausgangspunkt "
        "für spätere bundesländerübergreifende Angleichung."
    ),
    landscape_description_en=(
        "Chinese for Gymnasium in Germany. "
        "The current baseline fully secures the Hessian upper-secondary curriculum as the starting point "
        "for later cross-state alignment."
    ),
    framework_id="canonical-gymnasium-chinese",
)


def bootstrap_target(config: SubjectConfig, legacy: dict[str, Any]) -> dict[str, Any]:
    legacy_root = legacy["goals"][0]
    return {
        "landscapeId": config.target_landscape_id,
        "locale": legacy.get("locale", "de-DE"),
        "country": legacy.get("country", "DE"),
        "region": legacy.get("region", "DEU"),
        "schoolType": legacy.get("schoolType", "Gymnasium"),
        "subject": legacy.get("subject") or config.root_title,
        "frameworkId": config.framework_id,
        "title": config.landscape_title,
        "titleEn": config.landscape_title_en,
        "description": config.landscape_description,
        "descriptionEn": config.landscape_description_en,
        "filters": copy.deepcopy(legacy.get("filters") or []),
        "goals": [
            {
                "id": config.root_goal_id,
                "title": config.root_title,
                "titleEn": config.root_title_en,
                "description": config.root_description,
                "descriptionEn": config.root_description_en,
                "core": legacy_root.get("core", True),
                "weight": legacy_root.get("weight", 1),
                "tags": [],
                "contains": [],
                "requires": [],
                "type": "cluster",
            }
        ],
    }


def adopt_subject(config: SubjectConfig) -> tuple[int, int]:
    legacy = load_json(config.source_landscape_path)
    current = load_json(config.target_landscape_path) if config.target_landscape_path.exists() else bootstrap_target(config, legacy)

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
            override = config.external_ref_overrides.get(normalized) or config.external_ref_overrides.get(raw)
            if override:
                mapped.append(override)
                continue
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
                    "Cluster für grundlegende Vorstellungen zu Zuordnungen, linearen Funktionen "
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
    chemistry_goals, chemistry_mappings = adopt_subject(CHEMISTRY)
    biology_goals, biology_mappings = adopt_subject(BIOLOGY)
    informatics_goals, informatics_mappings = adopt_subject(INFORMATICS)
    history_goals, history_mappings = adopt_subject(HISTORY)
    german_goals, german_mappings = adopt_subject(GERMAN)
    politics_economics_goals, politics_economics_mappings = adopt_subject(POLITICS_ECONOMICS)
    english_goals, english_mappings = adopt_subject(ENGLISH)
    french_goals, french_mappings = adopt_subject(FRENCH)
    latin_goals, latin_mappings = adopt_subject(LATIN)
    spanish_goals, spanish_mappings = adopt_subject(SPANISH)
    greek_goals, greek_mappings = adopt_subject(GREEK)
    chinese_goals, chinese_mappings = adopt_subject(CHINESE)
    print(
        json.dumps(
            {
                "mathGoals": math_goals,
                "mathMappings": math_mappings,
                "physicsGoals": physics_goals,
                "physicsMappings": physics_mappings,
                "chemistryGoals": chemistry_goals,
                "chemistryMappings": chemistry_mappings,
                "biologyGoals": biology_goals,
                "biologyMappings": biology_mappings,
                "informaticsGoals": informatics_goals,
                "informaticsMappings": informatics_mappings,
                "historyGoals": history_goals,
                "historyMappings": history_mappings,
                "germanGoals": german_goals,
                "germanMappings": german_mappings,
                "politicsEconomicsGoals": politics_economics_goals,
                "politicsEconomicsMappings": politics_economics_mappings,
                "englishGoals": english_goals,
                "englishMappings": english_mappings,
                "frenchGoals": french_goals,
                "frenchMappings": french_mappings,
                "latinGoals": latin_goals,
                "latinMappings": latin_mappings,
                "spanishGoals": spanish_goals,
                "spanishMappings": spanish_mappings,
                "greekGoals": greek_goals,
                "greekMappings": greek_mappings,
                "chineseGoals": chinese_goals,
                "chineseMappings": chinese_mappings,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
