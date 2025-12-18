#!/usr/bin/env python3
from __future__ import annotations

import json
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


@dataclass(frozen=True)
class ChildSpec:
    suffix: str
    title: str
    title_en: str
    description: str
    description_en: str
    requires_short_keys: tuple[str, ...] = ()


@dataclass(frozen=True)
class SplitSpec:
    parent_short_key: str
    parent_title: str | None
    parent_title_en: str | None
    parent_description: str | None
    parent_description_en: str | None
    children: tuple[ChildSpec, ...]


def _dedupe_keep_order(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        if item in seen:
            continue
        seen.add(item)
        out.append(item)
    return out


def make_child_goal(parent: dict[str, Any], child_short_key: str, spec: ChildSpec, id_by_short_key: dict[str, str]) -> dict[str, Any]:
    dim = parent.get("dimensionTags") or {}
    topic_code = dim.get("topicCode") or ""
    prefix = topic_code.split(".", 1)[0] if "." in topic_code else topic_code
    child_topic = f"{prefix}.{child_short_key}" if prefix else child_short_key

    requires = [id_by_short_key[k] for k in spec.requires_short_keys if k in id_by_short_key]

    return {
        "id": str(uuid.uuid4()),
        "shortKey": child_short_key,
        "title": spec.title,
        "titleEn": spec.title_en,
        "description": spec.description,
        "descriptionEn": spec.description_en,
        "core": parent.get("core", True),
        "weight": 1,
        "tags": ["atomic"],
        "dimensionTags": {
            **dim,
            "topicCode": child_topic,
        },
        "requires": requires,
        "contains": [],
        "examples": [],
        "sourceRef": parent.get("sourceRef", ""),
    }


def apply_split(data: dict[str, Any], spec: SplitSpec) -> None:
    goals: list[dict[str, Any]] = data.get("goals", [])
    idx = next((i for i, g in enumerate(goals) if g.get("shortKey") == spec.parent_short_key), None)
    if idx is None:
        raise SystemExit(f"Parent shortKey not found: {spec.parent_short_key}")

    parent = goals[idx]
    if parent.get("contains"):
        # Already split (or already a cluster) — keep idempotent behavior.
        return

    if spec.parent_title is not None:
        parent["title"] = spec.parent_title
    if spec.parent_title_en is not None:
        parent["titleEn"] = spec.parent_title_en
    if spec.parent_description is not None:
        parent["description"] = spec.parent_description
    if spec.parent_description_en is not None:
        parent["descriptionEn"] = spec.parent_description_en

    # Ensure parent is cluster
    tags = parent.get("tags") or []
    tags = [t for t in tags if t != "atomic"]
    if "cluster" not in tags:
        tags.append("cluster")
    parent["tags"] = tags

    id_by_short_key = {g.get("shortKey"): g.get("id") for g in goals if g.get("shortKey") and g.get("id")}

    children: list[dict[str, Any]] = []
    child_ids: list[str] = []
    for child in spec.children:
        child_short_key = f"{spec.parent_short_key}_{child.suffix}"
        new_goal = make_child_goal(parent, child_short_key, child, id_by_short_key)
        children.append(new_goal)
        child_ids.append(new_goal["id"])
        id_by_short_key[child_short_key] = new_goal["id"]

    parent["contains"] = child_ids

    # Insert children right after parent (keep local grouping)
    goals[idx + 1:idx + 1] = children


def main() -> None:
    target = Path("curricula/DE/BW/Uni_Heidelberg/Bachelor_Biowissenschaften/json/DE_BAW_U_HEIDELBERG_BA_BIOWISS.de.json")
    data = json.loads(target.read_text(encoding="utf-8"))

    splits: list[SplitSpec] = [
        SplitSpec(
            parent_short_key="pha_k_nnen_experimentelle_beobachtungen_mit_theoretischen_konzepten_zu_verkn_pfen",
            parent_title=None,
            parent_title_en="Relate Experimental Observations to Theory",
            parent_description="Die Studierenden können experimentelle Beobachtungen mit theoretischen Konzepten verknüpfen und daraus physikalisch begründete Schlussfolgerungen ziehen.",
            parent_description_en="Students can relate experimental observations to theoretical concepts and derive physically justified conclusions.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Beobachtungen theoretisch einordnen",
                    title_en="Interpret Observations Using Theory",
                    description="Die Studierenden können experimentelle Beobachtungen relevanten theoretischen Konzepten zuordnen.",
                    description_en="Students can relate experimental observations to relevant theoretical concepts.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Physikalisch begründete Schlüsse ziehen",
                    title_en="Draw Physically Justified Conclusions",
                    description="Die Studierenden können aus Messdaten und Beobachtungen physikalisch begründete Schlussfolgerungen ableiten.",
                    description_en="Students can derive physically justified conclusions from measurements and observations.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="pha_k_nnen_dar_ber_hinaus_entwickeln_die_studierenden_methodische_kompetenzen",
            parent_title=None,
            parent_title_en="Develop Methodological Competencies (Physics)",
            parent_description="Die Studierenden entwickeln methodische Kompetenzen im Umgang mit physikalischen Denk- und Arbeitsweisen und bearbeiten Probleme systematisch und lösungsorientiert.",
            parent_description_en="Students develop methodological competencies in physical ways of thinking and working and solve problems systematically and in a solution-oriented way.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Physikalische Denk- und Arbeitsweisen anwenden",
                    title_en="Apply Physical Ways of Thinking and Working",
                    description="Die Studierenden können physikalische Denk- und Arbeitsweisen (z. B. Modellbildung, Abschätzung, Einheitentest) bei Aufgaben anwenden.",
                    description_en="Students can apply physical ways of thinking and working (e.g., modeling, estimation, unit checks) to problems.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Probleme systematisch bearbeiten",
                    title_en="Solve Problems Systematically",
                    description="Die Studierenden können Probleme systematisch analysieren und einen lösungsorientierten Lösungsweg entwickeln.",
                    description_en="Students can analyze problems systematically and develop a solution-oriented approach.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="pha_verstehen_die_zugrunde_liegenden_physikalischen_konzepte_und_k_nnen",
            parent_title=None,
            parent_title_en="Understand Concepts and Translate to Models",
            parent_description="Die Studierenden verstehen zugrunde liegende physikalische Konzepte und können sie in mathematische Modelle und Beschreibungen übersetzen.",
            parent_description_en="Students understand underlying physical concepts and can translate them into mathematical models and descriptions.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Physikalische Konzepte verstehen",
                    title_en="Understand Physical Concepts",
                    description="Die Studierenden können zentrale physikalische Konzepte erklären.",
                    description_en="Students can explain key physical concepts.",
                ),
                ChildSpec(
                    suffix="2",
                    title="In mathematische Modelle übersetzen",
                    title_en="Translate into Mathematical Models",
                    description="Die Studierenden können physikalische Konzepte in mathematische Modelle und Beschreibungen übersetzen.",
                    description_en="Students can translate physical concepts into mathematical models and descriptions.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="pha_erwerben_fundierte_kenntnisse_in_den_grundlagen_der_klassischen",
            parent_title=None,
            parent_title_en="Fundamentals of Classical Physics",
            parent_description="Die Studierenden erwerben fundierte Kenntnisse in zentralen Bereichen der klassischen Physik (Mechanik, Dynamik, Wärmelehre, Elektrodynamik).",
            parent_description_en="Students acquire solid knowledge of core areas of classical physics (mechanics, dynamics, thermodynamics, electrodynamics).",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Grundlagen der Mechanik",
                    title_en="Fundamentals of Mechanics",
                    description="Die Studierenden können grundlegende Konzepte der Mechanik erklären und anwenden.",
                    description_en="Students can explain and apply basic concepts of mechanics.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Grundlagen der Dynamik",
                    title_en="Fundamentals of Dynamics",
                    description="Die Studierenden können grundlegende Konzepte der Dynamik erklären und anwenden.",
                    description_en="Students can explain and apply basic concepts of dynamics.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Grundlagen der Wärmelehre",
                    title_en="Fundamentals of Thermodynamics",
                    description="Die Studierenden können grundlegende Konzepte der Wärmelehre erklären und anwenden.",
                    description_en="Students can explain and apply basic concepts of thermodynamics.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Grundlagen der Elektrodynamik",
                    title_en="Fundamentals of Electrodynamics",
                    description="Die Studierenden können grundlegende Konzepte der Elektrodynamik erklären und anwenden.",
                    description_en="Students can explain and apply basic concepts of electrodynamics.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="phb_k_nnen_experimentelle_beobachtungen_mit_theoretischen_konzepten_zu_verkn_pfen",
            parent_title=None,
            parent_title_en="Relate Experimental Observations to Theory",
            parent_description="Die Studierenden können experimentelle Beobachtungen mit theoretischen Konzepten verknüpfen und daraus physikalisch begründete Schlussfolgerungen ziehen.",
            parent_description_en="Students can relate experimental observations to theoretical concepts and derive physically justified conclusions.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Beobachtungen theoretisch einordnen",
                    title_en="Interpret Observations Using Theory",
                    description="Die Studierenden können experimentelle Beobachtungen relevanten theoretischen Konzepten zuordnen.",
                    description_en="Students can relate experimental observations to relevant theoretical concepts.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Physikalisch begründete Schlüsse ziehen",
                    title_en="Draw Physically Justified Conclusions",
                    description="Die Studierenden können aus Messdaten und Beobachtungen physikalisch begründete Schlussfolgerungen ableiten.",
                    description_en="Students can derive physically justified conclusions from measurements and observations.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="phb_k_nnen_dar_ber_hinaus_entwickeln_die_studierenden_methodische_kompetenzen",
            parent_title=None,
            parent_title_en="Develop Methodological Competencies (Physics)",
            parent_description="Die Studierenden entwickeln methodische Kompetenzen im Umgang mit physikalischen Denk- und Arbeitsweisen und bearbeiten Probleme systematisch und lösungsorientiert.",
            parent_description_en="Students develop methodological competencies in physical ways of thinking and working and solve problems systematically and in a solution-oriented way.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Physikalische Denk- und Arbeitsweisen anwenden",
                    title_en="Apply Physical Ways of Thinking and Working",
                    description="Die Studierenden können physikalische Denk- und Arbeitsweisen (z. B. Modellbildung, Abschätzung, Einheitentest) bei Aufgaben anwenden.",
                    description_en="Students can apply physical ways of thinking and working (e.g., modeling, estimation, unit checks) to problems.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Probleme systematisch bearbeiten",
                    title_en="Solve Problems Systematically",
                    description="Die Studierenden können Probleme systematisch analysieren und einen lösungsorientierten Lösungsweg entwickeln.",
                    description_en="Students can analyze problems systematically and develop a solution-oriented approach.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="phb_verstehen_die_zugrunde_liegenden_physikalischen_konzepte_und_k_nnen",
            parent_title=None,
            parent_title_en="Understand Concepts and Translate to Models",
            parent_description="Die Studierenden verstehen zugrunde liegende physikalische Konzepte und können sie in mathematische Modelle und Beschreibungen übersetzen.",
            parent_description_en="Students understand underlying physical concepts and can translate them into mathematical models and descriptions.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Physikalische Konzepte verstehen",
                    title_en="Understand Physical Concepts",
                    description="Die Studierenden können zentrale physikalische Konzepte erklären.",
                    description_en="Students can explain key physical concepts.",
                ),
                ChildSpec(
                    suffix="2",
                    title="In mathematische Modelle übersetzen",
                    title_en="Translate into Mathematical Models",
                    description="Die Studierenden können physikalische Konzepte in mathematische Modelle und Beschreibungen übersetzen.",
                    description_en="Students can translate physical concepts into mathematical models and descriptions.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="phb_erwerben_fundierte_kenntnisse_in_den_elektromagnetischen_wellen",
            parent_title=None,
            parent_title_en="Fundamentals of Modern Physics",
            parent_description="Die Studierenden erwerben fundierte Kenntnisse in ausgewählten Bereichen der Physik (elektromagnetische Wellen, Optik, Atomphysik, Festkörper, Kernphysik).",
            parent_description_en="Students acquire solid knowledge in selected areas of physics (electromagnetic waves, optics, atomic physics, solid state, nuclear physics).",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Elektromagnetische Wellen",
                    title_en="Electromagnetic Waves",
                    description="Die Studierenden können grundlegende Konzepte elektromagnetischer Wellen erklären.",
                    description_en="Students can explain basic concepts of electromagnetic waves.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Optik",
                    title_en="Optics",
                    description="Die Studierenden können grundlegende Konzepte der Optik erklären.",
                    description_en="Students can explain basic concepts of optics.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Atomphysik",
                    title_en="Atomic Physics",
                    description="Die Studierenden können grundlegende Konzepte der Atomphysik erklären.",
                    description_en="Students can explain basic concepts of atomic physics.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Festkörper (Vielteilchensysteme)",
                    title_en="Solid State (Many-Body Systems)",
                    description="Die Studierenden können grundlegende Konzepte der Festkörperphysik als Vielteilchensysteme erläutern.",
                    description_en="Students can explain basic concepts of solid state physics as many-body systems.",
                ),
                ChildSpec(
                    suffix="5",
                    title="Kernphysik",
                    title_en="Nuclear Physics",
                    description="Die Studierenden können grundlegende Konzepte der Kernphysik erklären.",
                    description_en="Students can explain basic concepts of nuclear physics.",
                ),
            ),
        ),
        # --- Biology (Bio1–Bio4) ---
        SplitSpec(
            parent_short_key="bio1_k_nnen_langfristige_arbeitsziele_zu_definieren_und_diese_strukturiert",
            parent_title=None,
            parent_title_en="Define and Pursue Long-Term Goals",
            parent_description="Die Studierenden können langfristige Arbeitsziele definieren und diese strukturiert und eigenverantwortlich verfolgen.",
            parent_description_en="Students can define long-term work goals and pursue them in a structured and self-directed way.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Langfristige Arbeitsziele definieren",
                    title_en="Define Long-Term Work Goals",
                    description="Die Studierenden können langfristige Arbeitsziele formulieren.",
                    description_en="Students can formulate long-term work goals.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Arbeitsziele strukturiert verfolgen",
                    title_en="Pursue Goals in a Structured Way",
                    description="Die Studierenden können Arbeitsziele planen und eigenverantwortlich verfolgen.",
                    description_en="Students can plan and pursue goals independently.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio2_k_nnen_langfristige_arbeitsziele_zu_definieren_und_diese_strukturiert",
            parent_title=None,
            parent_title_en="Define and Pursue Long-Term Goals",
            parent_description="Die Studierenden können langfristige Arbeitsziele definieren und diese strukturiert und eigenverantwortlich verfolgen.",
            parent_description_en="Students can define long-term work goals and pursue them in a structured and self-directed way.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Langfristige Arbeitsziele definieren",
                    title_en="Define Long-Term Work Goals",
                    description="Die Studierenden können langfristige Arbeitsziele formulieren.",
                    description_en="Students can formulate long-term work goals.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Arbeitsziele strukturiert verfolgen",
                    title_en="Pursue Goals in a Structured Way",
                    description="Die Studierenden können Arbeitsziele planen und eigenverantwortlich verfolgen.",
                    description_en="Students can plan and pursue goals independently.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio3_k_nnen_langfristige_arbeitsziele_zu_definieren_und_diese_strukturiert",
            parent_title=None,
            parent_title_en="Define and Pursue Long-Term Goals",
            parent_description="Die Studierenden können langfristige Arbeitsziele definieren und diese strukturiert und eigenverantwortlich verfolgen.",
            parent_description_en="Students can define long-term work goals and pursue them in a structured and self-directed way.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Langfristige Arbeitsziele definieren",
                    title_en="Define Long-Term Work Goals",
                    description="Die Studierenden können langfristige Arbeitsziele formulieren.",
                    description_en="Students can formulate long-term work goals.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Arbeitsziele strukturiert verfolgen",
                    title_en="Pursue Goals in a Structured Way",
                    description="Die Studierenden können Arbeitsziele planen und eigenverantwortlich verfolgen.",
                    description_en="Students can plan and pursue goals independently.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio4_k_nnen_langfristige_arbeitsziele_zu_definieren_und_diese_strukturiert",
            parent_title=None,
            parent_title_en="Define and Pursue Long-Term Goals",
            parent_description="Die Studierenden können langfristige Arbeitsziele definieren und diese strukturiert und eigenverantwortlich verfolgen.",
            parent_description_en="Students can define long-term work goals and pursue them in a structured and self-directed way.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Langfristige Arbeitsziele definieren",
                    title_en="Define Long-Term Work Goals",
                    description="Die Studierenden können langfristige Arbeitsziele formulieren.",
                    description_en="Students can formulate long-term work goals.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Arbeitsziele strukturiert verfolgen",
                    title_en="Pursue Goals in a Structured Way",
                    description="Die Studierenden können Arbeitsziele planen und eigenverantwortlich verfolgen.",
                    description_en="Students can plan and pursue goals independently.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio1_k_nnen_ihren_eigenen_lern_und_arbeitsprozess_zielgerichtet_und",
            parent_title=None,
            parent_title_en="Organize Learning and Work Processes",
            parent_description="Die Studierenden können ihren eigenen Lern- und Arbeitsprozess zielgerichtet und effizient organisieren.",
            parent_description_en="Students can organize their own learning and work processes in a goal-oriented and efficient way.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Eigenen Lernprozess organisieren",
                    title_en="Organize Own Learning Process",
                    description="Die Studierenden können ihren Lernprozess zielgerichtet und effizient organisieren.",
                    description_en="Students can organize their learning process effectively and efficiently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Eigenen Arbeitsprozess organisieren",
                    title_en="Organize Own Work Process",
                    description="Die Studierenden können ihren Arbeitsprozess zielgerichtet und effizient organisieren.",
                    description_en="Students can organize their work process effectively and efficiently.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio2_k_nnen_ihren_eigenen_lern_und_arbeitsprozess_zielgerichtet_und",
            parent_title=None,
            parent_title_en="Organize Learning and Work Processes",
            parent_description="Die Studierenden können ihren eigenen Lern- und Arbeitsprozess zielgerichtet und effizient organisieren.",
            parent_description_en="Students can organize their own learning and work processes in a goal-oriented and efficient way.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Eigenen Lernprozess organisieren",
                    title_en="Organize Own Learning Process",
                    description="Die Studierenden können ihren Lernprozess zielgerichtet und effizient organisieren.",
                    description_en="Students can organize their learning process effectively and efficiently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Eigenen Arbeitsprozess organisieren",
                    title_en="Organize Own Work Process",
                    description="Die Studierenden können ihren Arbeitsprozess zielgerichtet und effizient organisieren.",
                    description_en="Students can organize their work process effectively and efficiently.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio3_k_nnen_ihren_eigenen_lern_und_arbeitsprozess_zielgerichtet_und",
            parent_title=None,
            parent_title_en="Organize Learning and Work Processes",
            parent_description="Die Studierenden können ihren eigenen Lern- und Arbeitsprozess zielgerichtet und effizient organisieren.",
            parent_description_en="Students can organize their own learning and work processes in a goal-oriented and efficient way.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Eigenen Lernprozess organisieren",
                    title_en="Organize Own Learning Process",
                    description="Die Studierenden können ihren Lernprozess zielgerichtet und effizient organisieren.",
                    description_en="Students can organize their learning process effectively and efficiently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Eigenen Arbeitsprozess organisieren",
                    title_en="Organize Own Work Process",
                    description="Die Studierenden können ihren Arbeitsprozess zielgerichtet und effizient organisieren.",
                    description_en="Students can organize their work process effectively and efficiently.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio4_k_nnen_ihren_eigenen_lern_und_arbeitsprozess_zielgerichtet_und",
            parent_title=None,
            parent_title_en="Organize Learning and Work Processes",
            parent_description="Die Studierenden können ihren eigenen Lern- und Arbeitsprozess zielgerichtet und effizient organisieren.",
            parent_description_en="Students can organize their own learning and work processes in a goal-oriented and efficient way.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Eigenen Lernprozess organisieren",
                    title_en="Organize Own Learning Process",
                    description="Die Studierenden können ihren Lernprozess zielgerichtet und effizient organisieren.",
                    description_en="Students can organize their learning process effectively and efficiently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Eigenen Arbeitsprozess organisieren",
                    title_en="Organize Own Work Process",
                    description="Die Studierenden können ihren Arbeitsprozess zielgerichtet und effizient organisieren.",
                    description_en="Students can organize their work process effectively and efficiently.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio1_k_nnen_dar_ber_hinaus_entwickeln_sie_die_f_higkeit",
            parent_title=None,
            parent_title_en="Build Interdisciplinary Connections",
            parent_description="Die Studierenden erkennen fachübergreifende Zusammenhänge, vernetzen wissenschaftliche Inhalte und analysieren interdisziplinäre Verbindungen zwischen Teilbereichen.",
            parent_description_en="Students identify interdisciplinary connections, link scientific content systematically, and analyze connections between subfields.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Fachübergreifende Zusammenhänge erkennen",
                    title_en="Identify Interdisciplinary Connections",
                    description="Die Studierenden können fachübergreifende Zusammenhänge erkennen.",
                    description_en="Students can identify interdisciplinary connections.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissenschaftliche Inhalte vernetzen",
                    title_en="Link Scientific Content",
                    description="Die Studierenden können wissenschaftliche Inhalte systematisch vernetzen.",
                    description_en="Students can systematically connect scientific content.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Verbindungen zwischen Teilbereichen analysieren",
                    title_en="Analyze Links Between Subfields",
                    description="Die Studierenden können interdisziplinäre Verbindungen zwischen Teilbereichen herstellen und analysieren.",
                    description_en="Students can establish and analyze links between subfields.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio2_k_nnen_dar_ber_hinaus_entwickeln_sie_die_f_higkeit",
            parent_title=None,
            parent_title_en="Build Interdisciplinary Connections",
            parent_description="Die Studierenden erkennen fachübergreifende Zusammenhänge, vernetzen wissenschaftliche Inhalte und analysieren interdisziplinäre Verbindungen zwischen Teilbereichen.",
            parent_description_en="Students identify interdisciplinary connections, link scientific content systematically, and analyze connections between subfields.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Fachübergreifende Zusammenhänge erkennen",
                    title_en="Identify Interdisciplinary Connections",
                    description="Die Studierenden können fachübergreifende Zusammenhänge erkennen.",
                    description_en="Students can identify interdisciplinary connections.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissenschaftliche Inhalte vernetzen",
                    title_en="Link Scientific Content",
                    description="Die Studierenden können wissenschaftliche Inhalte systematisch vernetzen.",
                    description_en="Students can systematically connect scientific content.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Verbindungen zwischen Teilbereichen analysieren",
                    title_en="Analyze Links Between Subfields",
                    description="Die Studierenden können interdisziplinäre Verbindungen zwischen Teilbereichen herstellen und analysieren.",
                    description_en="Students can establish and analyze links between subfields.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio3_k_nnen_dar_ber_hinaus_entwickeln_sie_die_f_higkeit",
            parent_title=None,
            parent_title_en="Build Interdisciplinary Connections",
            parent_description="Die Studierenden erkennen fachübergreifende Zusammenhänge, vernetzen wissenschaftliche Inhalte und analysieren interdisziplinäre Verbindungen zwischen Teilbereichen.",
            parent_description_en="Students identify interdisciplinary connections, link scientific content systematically, and analyze connections between subfields.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Fachübergreifende Zusammenhänge erkennen",
                    title_en="Identify Interdisciplinary Connections",
                    description="Die Studierenden können fachübergreifende Zusammenhänge erkennen.",
                    description_en="Students can identify interdisciplinary connections.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissenschaftliche Inhalte vernetzen",
                    title_en="Link Scientific Content",
                    description="Die Studierenden können wissenschaftliche Inhalte systematisch vernetzen.",
                    description_en="Students can systematically connect scientific content.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Verbindungen zwischen Teilbereichen analysieren",
                    title_en="Analyze Links Between Subfields",
                    description="Die Studierenden können interdisziplinäre Verbindungen zwischen Teilbereichen herstellen und analysieren.",
                    description_en="Students can establish and analyze links between subfields.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio4_k_nnen_dar_ber_hinaus_entwickeln_sie_die_f_higkeit",
            parent_title=None,
            parent_title_en="Build Interdisciplinary Connections",
            parent_description="Die Studierenden erkennen fachübergreifende Zusammenhänge, vernetzen wissenschaftliche Inhalte und analysieren interdisziplinäre Verbindungen zwischen Teilbereichen.",
            parent_description_en="Students identify interdisciplinary connections, link scientific content systematically, and analyze connections between subfields.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Fachübergreifende Zusammenhänge erkennen",
                    title_en="Identify Interdisciplinary Connections",
                    description="Die Studierenden können fachübergreifende Zusammenhänge erkennen.",
                    description_en="Students can identify interdisciplinary connections.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissenschaftliche Inhalte vernetzen",
                    title_en="Link Scientific Content",
                    description="Die Studierenden können wissenschaftliche Inhalte systematisch vernetzen.",
                    description_en="Students can systematically connect scientific content.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Verbindungen zwischen Teilbereichen analysieren",
                    title_en="Analyze Links Between Subfields",
                    description="Die Studierenden können interdisziplinäre Verbindungen zwischen Teilbereichen herstellen und analysieren.",
                    description_en="Students can establish and analyze links between subfields.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio1_einen_berblick_ber_das_tierische_und_pflanzliche_organismenreich",
            parent_title=None,
            parent_title_en="Overview of Animal and Plant Kingdoms",
            parent_description="Die Studierenden können grundlegende Konzepte zum tierischen und pflanzlichen Organismenreich erklären.",
            parent_description_en="Students can explain basic concepts of the animal and plant kingdoms.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Tierisches Organismenreich: Überblick",
                    title_en="Animal Kingdom: Overview",
                    description="Die Studierenden können grundlegende Konzepte zum tierischen Organismenreich erklären.",
                    description_en="Students can explain basic concepts of the animal kingdom.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Pflanzliches Organismenreich: Überblick",
                    title_en="Plant Kingdom: Overview",
                    description="Die Studierenden können grundlegende Konzepte zum pflanzlichen Organismenreich erklären.",
                    description_en="Students can explain basic concepts of the plant kingdom.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio1_einen_berblick_ber_das_tierische_und_pflanzliche_organismenreich_2",
            parent_title=None,
            parent_title_en="Overview of Animal and Plant Kingdoms",
            parent_description="Die Studierenden können grundlegende Konzepte zum tierischen und pflanzlichen Organismenreich wiedergeben.",
            parent_description_en="Students can recall basic concepts of the animal and plant kingdoms.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Tierisches Organismenreich wiedergeben",
                    title_en="Recall Animal Kingdom Basics",
                    description="Die Studierenden können grundlegende Konzepte zum tierischen Organismenreich wiedergeben.",
                    description_en="Students can recall basic concepts of the animal kingdom.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Pflanzliches Organismenreich wiedergeben",
                    title_en="Recall Plant Kingdom Basics",
                    description="Die Studierenden können grundlegende Konzepte zum pflanzlichen Organismenreich wiedergeben.",
                    description_en="Students can recall basic concepts of the plant kingdom.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio2_zell_und_molekularbiologie_zu_verstehen_und_wiederzugeben",
            parent_title=None,
            parent_title_en="Understand and Explain Cell & Molecular Biology",
            parent_description="Die Studierenden können grundlegende Konzepte der Zell- und Molekularbiologie verstehen und wiedergeben.",
            parent_description_en="Students can understand and explain basic concepts of cell and molecular biology.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Zellbiologie verstehen und wiedergeben",
                    title_en="Understand and Explain Cell Biology",
                    description="Die Studierenden können grundlegende Konzepte der Zellbiologie verstehen und wiedergeben.",
                    description_en="Students can understand and explain basic concepts of cell biology.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Molekularbiologie verstehen und wiedergeben",
                    title_en="Understand and Explain Molecular Biology",
                    description="Die Studierenden können grundlegende Konzepte der Molekularbiologie verstehen und wiedergeben.",
                    description_en="Students can understand and explain basic concepts of molecular biology.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio2_die_grundlagen_der_biochemie",
            parent_title=None,
            parent_title_en="Fundamentals of Biochemistry and Cell/Molecular Biology",
            parent_description="Die Studierenden können Grundlagen der Biochemie sowie der Zell- und Molekularbiologie verstehen und wiedergeben.",
            parent_description_en="Students can understand and explain fundamentals of biochemistry and of cell and molecular biology.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Grundlagen der Biochemie",
                    title_en="Fundamentals of Biochemistry",
                    description="Die Studierenden können grundlegende Konzepte der Biochemie verstehen und wiedergeben.",
                    description_en="Students can understand and explain basic concepts of biochemistry.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Grundlagen der Zellbiologie",
                    title_en="Fundamentals of Cell Biology",
                    description="Die Studierenden können grundlegende Konzepte der Zellbiologie verstehen und wiedergeben.",
                    description_en="Students can understand and explain basic concepts of cell biology.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Grundlagen der Molekularbiologie",
                    title_en="Fundamentals of Molecular Biology",
                    description="Die Studierenden können grundlegende Konzepte der Molekularbiologie verstehen und wiedergeben.",
                    description_en="Students can understand and explain basic concepts of molecular biology.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio3_erwerben_ein_grundlegendes_verst_ndnis_zentraler_bereiche_der_biowissenschaften",
            parent_title=None,
            parent_title_en="Core Areas of Biosciences (Overview)",
            parent_description="Die Studierenden erwerben ein grundlegendes Verständnis zentraler Bereiche der Biowissenschaften (Physiologie, Entwicklungsbiologie, Biotechnologie).",
            parent_description_en="Students acquire a basic understanding of core areas of biosciences (physiology, developmental biology, biotechnology).",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Physiologie: Grundlagen",
                    title_en="Physiology: Fundamentals",
                    description="Die Studierenden können grundlegende Konzepte der Physiologie erklären.",
                    description_en="Students can explain basic concepts of physiology.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Entwicklungsbiologie: Grundlagen",
                    title_en="Developmental Biology: Fundamentals",
                    description="Die Studierenden können grundlegende Konzepte der Entwicklungsbiologie erklären (tierische und pflanzliche Organismen).",
                    description_en="Students can explain basic concepts of developmental biology (animal and plant organisms).",
                ),
                ChildSpec(
                    suffix="3",
                    title="Biotechnologie: Grundlagen",
                    title_en="Biotechnology: Fundamentals",
                    description="Die Studierenden können grundlegende Konzepte der Biotechnologie erklären (weiße, rote und grüne Biotechnologie).",
                    description_en="Students can explain basic concepts of biotechnology (white, red, and green biotechnology).",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio4_erwerben_ein_grundlegendes_verst_ndnis_zentraler_bereiche_der_biowissenschaften",
            parent_title=None,
            parent_title_en="Core Areas of Biosciences (Overview)",
            parent_description="Die Studierenden erwerben ein grundlegendes Verständnis zentraler Bereiche der Biowissenschaften (Immunologie, Bakteriologie, Virologie, Parasitologie, Verhaltensbiologie, Ökologie).",
            parent_description_en="Students acquire a basic understanding of core areas of biosciences (immunology, bacteriology, virology, parasitology, behavioral biology, ecology).",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Immunologie: Grundlagen",
                    title_en="Immunology: Fundamentals",
                    description="Die Studierenden können grundlegende Konzepte der Immunologie erklären.",
                    description_en="Students can explain basic concepts of immunology.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Bakteriologie: Grundlagen",
                    title_en="Bacteriology: Fundamentals",
                    description="Die Studierenden können grundlegende Konzepte der Bakteriologie erklären.",
                    description_en="Students can explain basic concepts of bacteriology.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Virologie: Grundlagen",
                    title_en="Virology: Fundamentals",
                    description="Die Studierenden können grundlegende Konzepte der Virologie erklären.",
                    description_en="Students can explain basic concepts of virology.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Parasitologie: Grundlagen",
                    title_en="Parasitology: Fundamentals",
                    description="Die Studierenden können grundlegende Konzepte der Parasitologie erklären.",
                    description_en="Students can explain basic concepts of parasitology.",
                ),
                ChildSpec(
                    suffix="5",
                    title="Verhaltensbiologie: Grundlagen",
                    title_en="Behavioral Biology: Fundamentals",
                    description="Die Studierenden können grundlegende Konzepte der Verhaltensbiologie erklären.",
                    description_en="Students can explain basic concepts of behavioral biology.",
                ),
                ChildSpec(
                    suffix="6",
                    title="Ökologie: Grundlagen",
                    title_en="Ecology: Fundamentals",
                    description="Die Studierenden können grundlegende Konzepte der Ökologie erklären.",
                    description_en="Students can explain basic concepts of ecology.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio1_k_nnen_die_kombination_aus_fachlichem_wissen",
            parent_title=None,
            parent_title_en="Apply Knowledge to Complex Questions",
            parent_description="Die Studierenden können komplexe biologische Fragestellungen sowohl in wissenschaftlichen als auch in praxisnahen Kontexten kompetent bearbeiten.",
            parent_description_en="Students can tackle complex biological questions competently in both scientific and applied contexts.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Komplexe Fragestellungen wissenschaftlich bearbeiten",
                    title_en="Handle Complex Questions Scientifically",
                    description="Die Studierenden können komplexe biologische Fragestellungen im wissenschaftlichen Kontext strukturiert bearbeiten.",
                    description_en="Students can tackle complex biological questions in a structured way in scientific contexts.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Komplexe Fragestellungen praxisnah bearbeiten",
                    title_en="Handle Complex Questions in Practice",
                    description="Die Studierenden können komplexe biologische Fragestellungen in praxisnahen Kontexten kompetent bearbeiten.",
                    description_en="Students can tackle complex biological questions competently in applied contexts.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio2_k_nnen_die_kombination_aus_fachlichem_wissen",
            parent_title=None,
            parent_title_en="Apply Knowledge to Complex Questions",
            parent_description="Die Studierenden können komplexe biologische Fragestellungen sowohl in wissenschaftlichen als auch in praxisnahen Kontexten kompetent bearbeiten.",
            parent_description_en="Students can tackle complex biological questions competently in both scientific and applied contexts.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Komplexe Fragestellungen wissenschaftlich bearbeiten",
                    title_en="Handle Complex Questions Scientifically",
                    description="Die Studierenden können komplexe biologische Fragestellungen im wissenschaftlichen Kontext strukturiert bearbeiten.",
                    description_en="Students can tackle complex biological questions in a structured way in scientific contexts.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Komplexe Fragestellungen praxisnah bearbeiten",
                    title_en="Handle Complex Questions in Practice",
                    description="Die Studierenden können komplexe biologische Fragestellungen in praxisnahen Kontexten kompetent bearbeiten.",
                    description_en="Students can tackle complex biological questions competently in applied contexts.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio3_k_nnen_die_kombination_aus_fachlichem_wissen",
            parent_title=None,
            parent_title_en="Apply Knowledge to Complex Questions",
            parent_description="Die Studierenden können komplexe biologische Fragestellungen sowohl in wissenschaftlichen als auch in praxisnahen Kontexten kompetent bearbeiten.",
            parent_description_en="Students can tackle complex biological questions competently in both scientific and applied contexts.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Komplexe Fragestellungen wissenschaftlich bearbeiten",
                    title_en="Handle Complex Questions Scientifically",
                    description="Die Studierenden können komplexe biologische Fragestellungen im wissenschaftlichen Kontext strukturiert bearbeiten.",
                    description_en="Students can tackle complex biological questions in a structured way in scientific contexts.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Komplexe Fragestellungen praxisnah bearbeiten",
                    title_en="Handle Complex Questions in Practice",
                    description="Die Studierenden können komplexe biologische Fragestellungen in praxisnahen Kontexten kompetent bearbeiten.",
                    description_en="Students can tackle complex biological questions competently in applied contexts.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bio4_k_nnen_die_kombination_aus_fachlichem_wissen",
            parent_title=None,
            parent_title_en="Apply Knowledge to Complex Questions",
            parent_description="Die Studierenden können komplexe biologische Fragestellungen sowohl in wissenschaftlichen als auch in praxisnahen Kontexten kompetent bearbeiten.",
            parent_description_en="Students can tackle complex biological questions competently in both scientific and applied contexts.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Komplexe Fragestellungen wissenschaftlich bearbeiten",
                    title_en="Handle Complex Questions Scientifically",
                    description="Die Studierenden können komplexe biologische Fragestellungen im wissenschaftlichen Kontext strukturiert bearbeiten.",
                    description_en="Students can tackle complex biological questions in a structured way in scientific contexts.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Komplexe Fragestellungen praxisnah bearbeiten",
                    title_en="Handle Complex Questions in Practice",
                    description="Die Studierenden können komplexe biologische Fragestellungen in praxisnahen Kontexten kompetent bearbeiten.",
                    description_en="Students can tackle complex biological questions competently in applied contexts.",
                ),
            ),
        ),

        # --- Chemistry ---
        SplitSpec(
            parent_short_key="chemie_erwerben_die_f_higkeit_zum_aufbau_und_betrieb_der",
            parent_title=None,
            parent_title_en="Operate Basic Chemistry Apparatus",
            parent_description="Die Studierenden können grundlegende chemische Apparaturen sicher aufbauen und betreiben (Rückfluss, Zutropfen, Umkristallisation, Destillation, Extraktion).",
            parent_description_en="Students can safely set up and operate basic chemistry apparatus (reflux, controlled addition, recrystallization, distillation, extraction).",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Rückflussapparatur betreiben",
                    title_en="Operate a Reflux Setup",
                    description="Die Studierenden können einen Reaktionsansatz unter Rückflussbedingungen sicher erhitzen.",
                    description_en="Students can safely heat a reaction mixture under reflux conditions.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Kontrolliert zutropfen",
                    title_en="Perform Controlled Addition",
                    description="Die Studierenden können Substrate kontrolliert zutropfen und den Prozess überwachen.",
                    description_en="Students can add substrates in a controlled manner and monitor the process.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Umkristallisation durchführen",
                    title_en="Perform Recrystallization",
                    description="Die Studierenden können Rohprodukte durch Umkristallisation reinigen.",
                    description_en="Students can purify crude products by recrystallization.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Fraktionierende Destillation",
                    title_en="Fractional Distillation",
                    description="Die Studierenden können eine fraktionierende Destillation aufbauen und durchführen.",
                    description_en="Students can set up and perform a fractional distillation.",
                ),
                ChildSpec(
                    suffix="5",
                    title="Extraktion durchführen",
                    title_en="Perform Extraction",
                    description="Die Studierenden können eine Extraktion zur Stofftrennung durchführen.",
                    description_en="Students can perform an extraction for substance separation.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="chemie_die_erlernten_methoden_f_r_die_l_sung_einfacher_chemischer",
            parent_title=None,
            parent_title_en="Apply Methods, Work Safely, Document Results",
            parent_description="Die Studierenden können erlernte Methoden anwenden, Experimente sicher durchführen, Gefahrstoffe sachgerecht handhaben und Ergebnisse wissenschaftlich protokollieren.",
            parent_description_en="Students can apply learned methods, conduct experiments safely, handle hazardous substances appropriately, and document results scientifically.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Methoden zur Problemlösung einsetzen",
                    title_en="Apply Methods to Solve Problems",
                    description="Die Studierenden können erlernte Methoden zur Lösung einfacher chemischer Problemstellungen einsetzen.",
                    description_en="Students can apply learned methods to solve simple chemistry problems.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Experimente sicher durchführen",
                    title_en="Conduct Experiments Safely",
                    description="Die Studierenden können chemische Experimente sicher durchführen.",
                    description_en="Students can conduct chemistry experiments safely.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Gefahrstoffe sachgerecht handhaben",
                    title_en="Handle Hazardous Substances Properly",
                    description="Die Studierenden können mit Gefahrstoffen sach- und arbeitsschutzgerecht umgehen.",
                    description_en="Students can handle hazardous substances according to safety regulations.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Ergebnisse protokollieren",
                    title_en="Document Results",
                    description="Die Studierenden können Ergebnisse in wissenschaftlicher Form protokollieren.",
                    description_en="Students can document results in a scientific format.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="chemie_k_nnen_organische_chemie",
            parent_title=None,
            parent_title_en="Organic Chemistry (Biorelevant Basics)",
            parent_description="Die Studierenden kennen biochemisch relevante Stoffklassen, Reaktionen und Mechanismen der organischen Chemie und wenden grundlegende Konzepte an.",
            parent_description_en="Students know biochemically relevant classes of compounds, reactions, and mechanisms in organic chemistry and can apply basic concepts.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Organische Stoffklassen kennen",
                    title_en="Know Classes of Organic Compounds",
                    description="Die Studierenden können biochemisch und biologisch relevante organisch-chemische Stoffklassen benennen und einordnen.",
                    description_en="Students can name and classify biochemically and biologically relevant classes of organic compounds.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Reaktionen beschreiben",
                    title_en="Describe Reactions",
                    description="Die Studierenden können zentrale Reaktionen der organischen Chemie beschreiben.",
                    description_en="Students can describe key reactions in organic chemistry.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Reaktionsmechanismen erklären",
                    title_en="Explain Reaction Mechanisms",
                    description="Die Studierenden können grundlegende Reaktionsmechanismen der organischen Chemie erklären.",
                    description_en="Students can explain basic reaction mechanisms in organic chemistry.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Grundkonzepte anwenden",
                    title_en="Apply Basic Concepts",
                    description="Die Studierenden können grundlegende Konzepte der organischen Chemie auf einfache Aufgaben anwenden.",
                    description_en="Students can apply basic organic chemistry concepts to simple problems.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="chemie_erkennen_an_konkreten_beispielen_die_inter_und_transdisziplin_ren",
            parent_title=None,
            parent_title_en="Interdisciplinary Links and Consequences",
            parent_description="Die Studierenden erkennen inter- und transdisziplinäre Zusammenhänge naturwissenschaftlicher Gesetzmäßigkeiten und diskutieren gesellschaftliche, ökonomische und ökologische Konsequenzen.",
            parent_description_en="Students recognize interdisciplinary links between scientific principles and discuss societal, economic, and ecological consequences.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Zusammenhänge zwischen Physik, Chemie und Biologie erkennen",
                    title_en="Recognize Links Between Physics, Chemistry, and Biology",
                    description="Die Studierenden können an Beispielen Zusammenhänge physikalischer, chemischer und biologischer Gesetzmäßigkeiten erkennen.",
                    description_en="Students can recognize links between physical, chemical, and biological principles in examples.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Konsequenzen diskutieren",
                    title_en="Discuss Consequences",
                    description="Die Studierenden können gesellschaftliche, ökonomische und ökologische Konsequenzen dieser Zusammenhänge diskutieren.",
                    description_en="Students can discuss societal, economic, and ecological consequences of these connections.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="chemie_erlernen_sicheres_und_sauberes_arbeiten_mit_brennbaren_l_sungsmitteln",
            parent_title=None,
            parent_title_en="Work Safely with Hazardous Chemicals",
            parent_description="Die Studierenden arbeiten sicher und sauber mit brennbaren Lösungsmitteln, reizenden Substraten und ätzenden Reagenzien.",
            parent_description_en="Students work safely and cleanly with flammable solvents, irritant substrates, and corrosive reagents.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Mit brennbaren Lösungsmitteln sicher arbeiten",
                    title_en="Handle Flammable Solvents Safely",
                    description="Die Studierenden können sicher und sauber mit brennbaren Lösungsmitteln arbeiten.",
                    description_en="Students can work safely and cleanly with flammable solvents.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Mit reizenden Substraten sicher arbeiten",
                    title_en="Handle Irritant Substrates Safely",
                    description="Die Studierenden können sicher und sauber mit reizenden Substraten arbeiten.",
                    description_en="Students can work safely and cleanly with irritant substrates.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Mit ätzenden Reagenzien sicher arbeiten",
                    title_en="Handle Corrosive Reagents Safely",
                    description="Die Studierenden können sicher und sauber mit ätzenden Reagenzien arbeiten.",
                    description_en="Students can work safely and cleanly with corrosive reagents.",
                ),
            ),
        ),

        # --- Study Skills / EIDS ---
        SplitSpec(
            parent_short_key="eids_k_nnen_die_grundlagen_der_wissens_und_informationsbeschaffung",
            parent_title=None,
            parent_title_en="Information Literacy Basics",
            parent_description="Die Studierenden erwerben Grundlagen der Wissens- und Informationsbeschaffung, filtern Informationen, bereiten sie strukturiert auf und stellen Ergebnisse im Vortrag dar.",
            parent_description_en="Students acquire basics of information literacy: searching, filtering, structuring information, and presenting results.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissens- und Informationsbeschaffung",
                    title_en="Information Acquisition",
                    description="Die Studierenden können Grundlagen der Wissens- und Informationsbeschaffung anwenden.",
                    description_en="Students can apply basic techniques for acquiring information.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Informationsflut filtern",
                    title_en="Filter Information",
                    description="Die Studierenden können relevante Informationen aus einer Informationsflut filtern.",
                    description_en="Students can filter relevant information from large amounts of sources.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Informationen strukturieren",
                    title_en="Structure Information",
                    description="Die Studierenden können Informationen strukturiert aufarbeiten.",
                    description_en="Students can structure and synthesize information.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Ergebnisse im Vortrag darstellen",
                    title_en="Present Results",
                    description="Die Studierenden können Informationen und Ergebnisse im Vortrag verständlich darstellen.",
                    description_en="Students can present information and results clearly in a talk.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="eids_filtern_der_informationsflut_und_das_strukturierte_aufarbeiten_von",
            parent_title=None,
            parent_title_en="Filter, Structure, and Present Information",
            parent_description="Die Studierenden können Informationen filtern, strukturiert aufarbeiten und im Vortrag darstellen.",
            parent_description_en="Students can filter information, structure it, and present it in a talk.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Informationen filtern",
                    title_en="Filter Information",
                    description="Die Studierenden können relevante Informationen auswählen und begründen.",
                    description_en="Students can select relevant information and justify their choices.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Informationen aufarbeiten",
                    title_en="Process Information",
                    description="Die Studierenden können Informationen strukturiert aufarbeiten und zusammenfassen.",
                    description_en="Students can process and summarize information in a structured way.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Vortrag vorbereiten und halten",
                    title_en="Prepare and Deliver a Talk",
                    description="Die Studierenden können einen Vortrag vorbereiten und Informationen verständlich präsentieren.",
                    description_en="Students can prepare a talk and present information clearly.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="eids_wissens_und_informationsbeschaffung",
            parent_title=None,
            parent_title_en="Apply Information Acquisition and Document Results",
            parent_description="Die Studierenden können Wissens- und Informationsbeschaffung praktisch anwenden und Ergebnisse dokumentieren.",
            parent_description_en="Students can apply information acquisition in practice and document results.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Informationen recherchieren",
                    title_en="Research Information",
                    description="Die Studierenden können Informationsquellen praktisch nutzen, um Informationen zu recherchieren.",
                    description_en="Students can use information sources to research information in practice.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Ergebnisse dokumentieren",
                    title_en="Document Results",
                    description="Die Studierenden können Ergebnisse der Recherche nachvollziehbar dokumentieren.",
                    description_en="Students can document research results in a traceable way.",
                ),
            ),
        ),

        # --- Ex/BFK (cross-cutting competencies) ---
        SplitSpec(
            parent_short_key="ex_bfk_k_nnen_angebote_des_career_service_zur_beruflichen_orientierung",
            parent_title=None,
            parent_title_en="Use Career Service Offers",
            parent_description="Die Studierenden nutzen Angebote zur beruflichen Orientierung und Kompetenzentwicklung, um ihr Kompetenzprofil weiterzuentwickeln und sich auf komplexe interdisziplinäre Fragestellungen vorzubereiten.",
            parent_description_en="Students use career service offers for orientation and competence development to build their profile and prepare for complex interdisciplinary questions.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Angebote zur beruflichen Orientierung nutzen",
                    title_en="Use Career Orientation Offers",
                    description="Die Studierenden können Angebote zur beruflichen Orientierung nutzen.",
                    description_en="Students can use offers for career orientation.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Kompetenzprofil weiterentwickeln",
                    title_en="Develop a Competence Profile",
                    description="Die Studierenden können ihr persönliches Kompetenzprofil gezielt weiterentwickeln.",
                    description_en="Students can deliberately develop their personal competence profile.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Auf interdisziplinäre Fragestellungen vorbereiten",
                    title_en="Prepare for Interdisciplinary Questions",
                    description="Die Studierenden können sich auf interdisziplinäre und komplexe Fragestellungen vorbereiten.",
                    description_en="Students can prepare for interdisciplinary and complex questions.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ex_bfk_k_nnen_diese_angebote_unterst_tzen_den_erwerb_zentraler_wissenschaftlicher",
            parent_title=None,
            parent_title_en="Develop Key Competencies",
            parent_description="Die Studierenden entwickeln wissenschaftliche, kommunikative, methodische und ethische Kompetenzen für reflektierte und verantwortungsvolle Tätigkeiten.",
            parent_description_en="Students develop scientific, communicative, methodological, and ethical competencies for reflective and responsible practice.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissenschaftliche Kompetenzen entwickeln",
                    title_en="Develop Scientific Competencies",
                    description="Die Studierenden können wissenschaftliche Kompetenzen entwickeln.",
                    description_en="Students can develop scientific competencies.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Kommunikative Kompetenzen entwickeln",
                    title_en="Develop Communication Skills",
                    description="Die Studierenden können kommunikative Kompetenzen entwickeln.",
                    description_en="Students can develop communication skills.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Methodische Kompetenzen entwickeln",
                    title_en="Develop Methodological Skills",
                    description="Die Studierenden können methodische Kompetenzen entwickeln.",
                    description_en="Students can develop methodological skills.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Ethische Kompetenzen entwickeln",
                    title_en="Develop Ethical Competencies",
                    description="Die Studierenden können ethische Kompetenzen für verantwortungsvolles Handeln entwickeln.",
                    description_en="Students can develop ethical competencies for responsible action.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ex_bfk_k_nnen_zur_gezielten_f_rderung_fach_bergreifender_und_interdisziplin_rer_f_higkeiten",
            parent_title=None,
            parent_title_en="Foster Interdisciplinary Skills",
            parent_description="Die Studierenden fördern fachübergreifende und interdisziplinäre Fähigkeiten durch ausgewählte Veranstaltungen zu überfachlichen Kompetenzen.",
            parent_description_en="Students foster cross-disciplinary and interdisciplinary skills through selected courses on generic competencies.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Veranstaltungen gezielt auswählen",
                    title_en="Select Courses Deliberately",
                    description="Die Studierenden können geeignete Veranstaltungen aus dem Bereich überfachlicher Kompetenzen auswählen.",
                    description_en="Students can select suitable courses on generic competencies.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Interdisziplinäre Fähigkeiten ausbauen",
                    title_en="Strengthen Interdisciplinary Skills",
                    description="Die Studierenden können fachübergreifende und interdisziplinäre Fähigkeiten ausbauen.",
                    description_en="Students can strengthen cross-disciplinary and interdisciplinary skills.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ex_bfk_k_nnen_im_rahmen_von_biodiversit_tsexkursionen_erwerben_die_studierenden",
            parent_title=None,
            parent_title_en="Field Skills in Biodiversity Excursions",
            parent_description="Die Studierenden erwerben Feldkompetenzen in der Erkennung und Bestimmung von Arten sowie im Verständnis ökologischer Zusammenhänge.",
            parent_description_en="Students acquire field skills for recognizing and identifying species and for understanding ecological relationships.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Arten erkennen und bestimmen",
                    title_en="Recognize and Identify Species",
                    description="Die Studierenden können Arten im Feld erkennen und bestimmen.",
                    description_en="Students can recognize and identify species in the field.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Ökologische Zusammenhänge verstehen",
                    title_en="Understand Ecological Relationships",
                    description="Die Studierenden können ökologische Zusammenhänge im Feldkontext verstehen.",
                    description_en="Students can understand ecological relationships in a field context.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ex_bfk_k_nnen_teilnahme_am_cos_symposium_sowie_an_weiteren",
            parent_title=None,
            parent_title_en="Participate in Scientific Meetings",
            parent_description="Die Studierenden stärken ihre Präsentations- und Diskussionsfähigkeit durch Teilnahme am COS Symposium und an weiteren wissenschaftlichen Tagungen.",
            parent_description_en="Students strengthen presentation and discussion skills by participating in the COS symposium and other scientific meetings.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Präsentationsfähigkeit stärken",
                    title_en="Strengthen Presentation Skills",
                    description="Die Studierenden können Präsentationsfähigkeit durch wissenschaftliche Tagungen stärken.",
                    description_en="Students can strengthen presentation skills through scientific meetings.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Diskussionsfähigkeit stärken",
                    title_en="Strengthen Discussion Skills",
                    description="Die Studierenden können Diskussionsfähigkeit durch wissenschaftliche Tagungen stärken.",
                    description_en="Students can strengthen discussion skills through scientific meetings.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ex_bfk_k_nnen_zugleich_werden_sie_f_r_die_relevanz_biologischer",
            parent_title=None,
            parent_title_en="Biodiversity and Conservation in Sustainability Context",
            parent_description="Die Studierenden werden für die Relevanz biologischer Vielfalt im Kontext globaler Nachhaltigkeitsziele sensibilisiert und ordnen die Bedeutung des Naturschutzes wissenschaftlich ein.",
            parent_description_en="Students are sensitized to the relevance of biodiversity in the context of global sustainability goals and can place the importance of conservation in a scientific context.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Relevanz biologischer Vielfalt verstehen",
                    title_en="Understand the Relevance of Biodiversity",
                    description="Die Studierenden können die Relevanz biologischer Vielfalt im Kontext globaler Nachhaltigkeitsziele erläutern.",
                    description_en="Students can explain the relevance of biodiversity in the context of global sustainability goals.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Naturschutz wissenschaftlich einordnen",
                    title_en="Place Conservation in Scientific Context",
                    description="Die Studierenden können die Bedeutung des Naturschutzes für eine zukunftsfähige Entwicklung wissenschaftlich einordnen.",
                    description_en="Students can place the importance of conservation for sustainable development in a scientific context.",
                ),
            ),
        ),

        # --- PWA (ethics / societal context) ---
        SplitSpec(
            parent_short_key="pwa_k_nnen_berfachliche_zusammenh_nge_und_ihre_gesellschaftlichen_und_ethischen",
            parent_title=None,
            parent_title_en="Contextualize Research Societally and Ethically",
            parent_description="Die Studierenden erfassen überfachliche Zusammenhänge und gesellschaftliche/ethische Implikationen und ordnen Forschungsgebiete in ihren gesellschaftlichen Kontext ein.",
            parent_description_en="Students understand interdisciplinary connections and societal/ethical implications and place research areas in their societal context.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Gesellschaftliche und ethische Implikationen erfassen",
                    title_en="Understand Societal and Ethical Implications",
                    description="Die Studierenden können gesellschaftliche und ethische Implikationen wissenschaftlicher Arbeit erfassen.",
                    description_en="Students can understand societal and ethical implications of scientific work.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Forschung im Kontext einordnen",
                    title_en="Place Research in Context",
                    description="Die Studierenden können Forschungsgebiete und -aufgaben in ihren gesellschaftlichen Kontext einordnen.",
                    description_en="Students can place research areas and tasks in their societal context.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="pwa_k_nnen_die_folgen_von_theorie_und_praxis_des",
            parent_title=None,
            parent_title_en="Assess Consequences and Reflect Ethically",
            parent_description="Die Studierenden beurteilen Folgen von Theorie und Praxis ihres Faches für Natur und Gesellschaft und reflektieren berufliches Handeln ethisch.",
            parent_description_en="Students assess consequences of theory and practice of their field for nature and society and reflect ethically on professional action.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Folgen für Natur und Gesellschaft beurteilen",
                    title_en="Assess Consequences for Nature and Society",
                    description="Die Studierenden können die Folgen von Theorie und Praxis des eigenen Faches für Natur und Gesellschaft beurteilen.",
                    description_en="Students can assess consequences of theory and practice of their field for nature and society.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Berufliches Handeln ethisch reflektieren",
                    title_en="Reflect Ethically on Professional Action",
                    description="Die Studierenden können ihr berufliches Handeln unter ethisch-moralischen Gesichtspunkten reflektieren.",
                    description_en="Students can reflect on their professional actions from an ethical perspective.",
                ),
            ),
        ),

        # --- Practicals / reports ---
        SplitSpec(
            parent_short_key="hp_e1_k_nnen_resultate_reflektieren_und_diskutieren_und_das_theoretische",
            parent_title=None,
            parent_title_en="Reflect on Results and Apply Knowledge",
            parent_description="Die Studierenden können Resultate reflektieren und diskutieren sowie theoretisches Wissen und Kompetenzen in der Praxis einsetzen.",
            parent_description_en="Students can reflect on and discuss results and apply theoretical knowledge and skills in practice.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Resultate reflektieren und diskutieren",
                    title_en="Reflect on and Discuss Results",
                    description="Die Studierenden können Resultate reflektieren und diskutieren.",
                    description_en="Students can reflect on and discuss results.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Theorie in der Praxis einsetzen",
                    title_en="Apply Theory in Practice",
                    description="Die Studierenden können theoretisches Wissen und erworbene Kompetenzen in der Praxis einsetzen.",
                    description_en="Students can apply theoretical knowledge and acquired skills in practice.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="hp_e2_k_nnen_resultate_reflektieren_und_diskutieren_und_das_theoretische",
            parent_title=None,
            parent_title_en="Reflect on Results and Apply Knowledge",
            parent_description="Die Studierenden können Resultate reflektieren und diskutieren sowie theoretisches Wissen und Kompetenzen in der Praxis einsetzen.",
            parent_description_en="Students can reflect on and discuss results and apply theoretical knowledge and skills in practice.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Resultate reflektieren und diskutieren",
                    title_en="Reflect on and Discuss Results",
                    description="Die Studierenden können Resultate reflektieren und diskutieren.",
                    description_en="Students can reflect on and discuss results.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Theorie in der Praxis einsetzen",
                    title_en="Apply Theory in Practice",
                    description="Die Studierenden können theoretisches Wissen und erworbene Kompetenzen in der Praxis einsetzen.",
                    description_en="Students can apply theoretical knowledge and acquired skills in practice.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="hp_k_nnen_problemstellungen_erkennen",
            parent_title=None,
            parent_title_en="Identify Problems and Apply Knowledge",
            parent_description="Die Studierenden erkennen Problemstellungen, reflektieren und diskutieren sie und setzen theoretisches Wissen in der Praxis um.",
            parent_description_en="Students identify problems, reflect on and discuss them, and apply theoretical knowledge in practice.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Problemstellungen erkennen",
                    title_en="Identify Problems",
                    description="Die Studierenden können relevante Problemstellungen erkennen.",
                    description_en="Students can identify relevant problems.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Problemstellungen reflektieren und diskutieren",
                    title_en="Reflect and Discuss Problems",
                    description="Die Studierenden können Problemstellungen reflektieren und diskutieren.",
                    description_en="Students can reflect on and discuss problems.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Wissen in der Praxis umsetzen",
                    title_en="Apply Knowledge in Practice",
                    description="Die Studierenden können theoretisches Wissen und Kompetenzen in der Praxis umsetzen.",
                    description_en="Students can apply theoretical knowledge and skills in practice.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="hp_k_nnen_die_vermittlung_und_erarbeitung_von_schl_sselqualifikationen_wie",
            parent_title=None,
            parent_title_en="Key Skills: Time Management and Self-Directed Action",
            parent_description="Die Studierenden erwerben Schlüsselqualifikationen wie Zeitmanagement und eigenverantwortliches, zielorientiertes Handeln.",
            parent_description_en="Students acquire key skills such as time management and self-directed, goal-oriented action.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Zeitmanagement anwenden",
                    title_en="Apply Time Management",
                    description="Die Studierenden können qualitatives und operatives Zeitmanagement anwenden.",
                    description_en="Students can apply qualitative and operational time management.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Eigenverantwortlich handeln",
                    title_en="Act Self-Responsibly",
                    description="Die Studierenden können eigenverantwortlich und zielorientiert handeln.",
                    description_en="Students can act self-responsibly and in a goal-oriented way.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="hp_k_nnen_hp_proteine_und_nukleins_uren_modulinhalte_zugeh_rige_lehrveranstaltungen",
            parent_title=None,
            parent_title_en="Practical Qualification (Proteins and Nucleic Acids)",
            parent_description="Ziel ist der Erwerb praktischer Qualifikationen anhand konkreter biologischer Problemstellungen (Proteine und Nukleinsäuren).",
            parent_description_en="The goal is to acquire practical qualification by working on concrete biological problems (proteins and nucleic acids).",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Praktische Qualifikationen erwerben",
                    title_en="Acquire Practical Skills",
                    description="Die Studierenden können praktische Qualifikationen im Labor erwerben.",
                    description_en="Students can acquire practical laboratory skills.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Biologische Problemstellungen bearbeiten",
                    title_en="Work on Biological Problems",
                    description="Die Studierenden können konkrete biologische Problemstellungen praktisch bearbeiten.",
                    description_en="Students can work on concrete biological problems in practice.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="k_k_nnen_problemstellungen_erkennen",
            parent_title=None,
            parent_title_en="Identify Problems and Apply Knowledge",
            parent_description="Die Studierenden erkennen Problemstellungen, reflektieren und diskutieren sie und setzen theoretisches Wissen in die Praxis um.",
            parent_description_en="Students identify problems, reflect on and discuss them, and apply theoretical knowledge in practice.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Problemstellungen erkennen",
                    title_en="Identify Problems",
                    description="Die Studierenden können relevante Problemstellungen erkennen.",
                    description_en="Students can identify relevant problems.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Problemstellungen reflektieren und diskutieren",
                    title_en="Reflect and Discuss Problems",
                    description="Die Studierenden können Problemstellungen reflektieren und diskutieren.",
                    description_en="Students can reflect on and discuss problems.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Wissen in die Praxis umsetzen",
                    title_en="Apply Knowledge in Practice",
                    description="Die Studierenden können theoretisches Wissen und Kompetenzen in die Praxis umsetzen.",
                    description_en="Students can apply theoretical knowledge and skills in practice.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="dis_k_nnen_problemstellungen_des_eigenen_faches_werden_erkannt",
            parent_title=None,
            parent_title_en="Identify, Discuss, and Integrate Problems",
            parent_description="Die Studierenden erkennen, artikulieren, reflektieren und diskutieren Problemstellungen des eigenen Faches und führen Erkenntnisse mit anderen Disziplinen zusammen.",
            parent_description_en="Students identify, articulate, reflect on, and discuss problems in their field and integrate insights with other disciplines.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Problemstellungen erkennen und artikulieren",
                    title_en="Identify and Articulate Problems",
                    description="Die Studierenden können Problemstellungen des eigenen Faches erkennen und artikulieren.",
                    description_en="Students can identify and articulate problems in their field.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Problemstellungen reflektieren und diskutieren",
                    title_en="Reflect and Discuss Problems",
                    description="Die Studierenden können Problemstellungen reflektieren und diskutieren.",
                    description_en="Students can reflect on and discuss problems.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Interdisziplinär zusammenführen",
                    title_en="Integrate Across Disciplines",
                    description="Die Studierenden können Erkenntnisse des eigenen Tuns mit anderen Disziplinen in komplexen Zusammenhängen zusammenführen.",
                    description_en="Students can integrate their own insights with other disciplines in complex contexts.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="dis_k_nnen_die_so_erlangten_ergebnisse_k_nnen_sie",
            parent_title=None,
            parent_title_en="Present, Discuss, and Evaluate Results",
            parent_description="Die Studierenden können Ergebnisse (z. B. aus der Bachelorarbeit) präsentieren, diskutieren und kritisch bewerten.",
            parent_description_en="Students can present, discuss, and critically evaluate results (e.g., from the bachelor's thesis).",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Ergebnisse präsentieren",
                    title_en="Present Results",
                    description="Die Studierenden können Ergebnisse in Präsentationen mündlich vor Fachwissenschaftlern präsentieren.",
                    description_en="Students can present results orally to an expert audience.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Ergebnisse diskutieren",
                    title_en="Discuss Results",
                    description="Die Studierenden können Ergebnisse in Fachgesprächen diskutieren.",
                    description_en="Students can discuss results in scientific discussions.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Ergebnisse kritisch bewerten",
                    title_en="Critically Evaluate Results",
                    description="Die Studierenden können Ergebnisse kritisch bewerten.",
                    description_en="Students can critically evaluate results.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ba_k_nnen_die_so_erlangten_ergebnisse_k_nnen_sie_schriftlich",
            parent_title=None,
            parent_title_en="Document, Present, Discuss, Evaluate",
            parent_description="Die Studierenden können Ergebnisse schriftlich dokumentieren, präsentieren, diskutieren und kritisch bewerten.",
            parent_description_en="Students can document results in writing, present and discuss them, and critically evaluate them.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Ergebnisse schriftlich dokumentieren",
                    title_en="Document Results in Writing",
                    description="Die Studierenden können Ergebnisse schriftlich dokumentieren.",
                    description_en="Students can document results in writing.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Ergebnisse präsentieren",
                    title_en="Present Results",
                    description="Die Studierenden können Ergebnisse mündlich präsentieren.",
                    description_en="Students can present results orally.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Ergebnisse diskutieren",
                    title_en="Discuss Results",
                    description="Die Studierenden können Ergebnisse diskutieren.",
                    description_en="Students can discuss results.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Ergebnisse kritisch bewerten",
                    title_en="Critically Evaluate Results",
                    description="Die Studierenden können Ergebnisse kritisch bewerten.",
                    description_en="Students can critically evaluate results.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ba_k_nnen_aufbauend_auf_ihrem_fachwissen_sind_sie_dazu",
            parent_title=None,
            parent_title_en="Evaluate, Contextualize, Conclude",
            parent_description="Die Studierenden können Informationen bewerten, in Kontext setzen und eigene Schlüsse ziehen.",
            parent_description_en="Students can evaluate information, put it into context, and draw their own conclusions.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Informationen bewerten",
                    title_en="Evaluate Information",
                    description="Die Studierenden können Informationen fachlich bewerten.",
                    description_en="Students can evaluate information professionally.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Informationen in Kontext setzen",
                    title_en="Put Information into Context",
                    description="Die Studierenden können Informationen zueinander in Kontext setzen.",
                    description_en="Students can relate information and put it into context.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Eigene Schlüsse ziehen",
                    title_en="Draw Conclusions",
                    description="Die Studierenden können aus bewerteten Informationen eigene Schlüsse ziehen.",
                    description_en="Students can draw their own conclusions from evaluated information.",
                ),
            ),
        ),

        # --- Bioinformatics ---
        SplitSpec(
            parent_short_key="bioinf_k_nnen_am_ende_des_moduls_verf_gen_die_studierenden",
            parent_title=None,
            parent_title_en="Core Bioinformatics Methods",
            parent_description="Die Studierenden verfügen über grundlegende Kenntnisse in Sequenzanalyse, funktioneller Genomanalyse, Datenbanken, Bilddatenanalyse und Biostatistik.",
            parent_description_en="Students have basic knowledge of sequence analysis, functional genomics data analysis, biological databases, biological image data analysis, and biostatistics.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Sequenzanalyse",
                    title_en="Sequence Analysis",
                    description="Die Studierenden können grundlegende Methoden der Sequenzanalyse anwenden.",
                    description_en="Students can apply basic methods of sequence analysis.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Funktionelle Genomanalyse",
                    title_en="Functional Genomics Data Analysis",
                    description="Die Studierenden können Daten zur funktionellen Genomanalyse auswerten.",
                    description_en="Students can analyze data for functional genomics.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Biologische Datenbanken nutzen",
                    title_en="Use Biological Databases",
                    description="Die Studierenden können biologische Datenbanken nutzen.",
                    description_en="Students can use biological databases.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Biologische Bilddaten auswerten",
                    title_en="Analyze Biological Image Data",
                    description="Die Studierenden können biologische Bilddaten auswerten.",
                    description_en="Students can analyze biological image data.",
                ),
                ChildSpec(
                    suffix="5",
                    title="Biostatistische Analyse",
                    title_en="Biostatistical Analysis",
                    description="Die Studierenden können grundlegende biostatistische Analysen durchführen.",
                    description_en="Students can perform basic biostatistical analyses.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bioinf_k_nnen_hypothesen_aufstellen_und_testen",
            parent_title=None,
            parent_title_en="Form, Test, Interpret",
            parent_description="Die Studierenden können Hypothesen aufstellen, testen und Daten/Ergebnisse kritisch interpretieren.",
            parent_description_en="Students can formulate and test hypotheses and critically interpret data and results.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Hypothesen aufstellen",
                    title_en="Formulate Hypotheses",
                    description="Die Studierenden können Hypothesen aufstellen.",
                    description_en="Students can formulate hypotheses.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Hypothesen testen",
                    title_en="Test Hypotheses",
                    description="Die Studierenden können Hypothesen testen.",
                    description_en="Students can test hypotheses.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Daten und Ergebnisse interpretieren",
                    title_en="Interpret Data and Results",
                    description="Die Studierenden können Daten und Ergebnisse kritisch interpretieren.",
                    description_en="Students can critically interpret data and results.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="bioinf_k_nnen_zudem_daten_aus_experimenten_oder_studien_vorbereiten",
            parent_title=None,
            parent_title_en="Data Wrangling, Visualization, EDA",
            parent_description="Die Studierenden können Daten vorbereiten, visualisieren und explorativ analysieren (EDA).",
            parent_description_en="Students can prepare data, visualize it, and perform exploratory data analysis (EDA).",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Daten vorbereiten (Data Wrangling)",
                    title_en="Prepare Data (Data Wrangling)",
                    description="Die Studierenden können Daten aus Experimenten oder Studien für Analysen aufbereiten.",
                    description_en="Students can prepare data from experiments or studies for analysis.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Daten visualisieren",
                    title_en="Visualize Data",
                    description="Die Studierenden können Daten sinnvoll visualisieren.",
                    description_en="Students can visualize data effectively.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Explorative Datenanalyse (EDA)",
                    title_en="Exploratory Data Analysis (EDA)",
                    description="Die Studierenden können Daten explorativ analysieren, um Muster und Auffälligkeiten zu erkennen.",
                    description_en="Students can explore data to identify patterns and anomalies.",
                ),
            ),
        ),

        # --- General / foundational modules ---
        SplitSpec(
            parent_short_key="gkphys_kennen_die_konzepte_und_methoden_verschiedener_einzeldisziplinen_morphologie",
            parent_title=None,
            parent_title_en="Methods Across Disciplines (Physiology)",
            parent_description="Die Studierenden kennen Konzepte und Methoden aus Morphologie, Biochemie, Molekularbiologie und medizinischer Diagnostik und nutzen sie, um Lebensfunktionen zu verstehen.",
            parent_description_en="Students know concepts and methods from morphology, biochemistry, molecular biology, and medical diagnostics and use them to understand life functions.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Morphologie: Konzepte und Methoden",
                    title_en="Morphology: Concepts and Methods",
                    description="Die Studierenden kennen grundlegende Konzepte und Methoden der Morphologie.",
                    description_en="Students know basic concepts and methods in morphology.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Biochemie: Konzepte und Methoden",
                    title_en="Biochemistry: Concepts and Methods",
                    description="Die Studierenden kennen grundlegende Konzepte und Methoden der Biochemie.",
                    description_en="Students know basic concepts and methods in biochemistry.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Molekularbiologie: Konzepte und Methoden",
                    title_en="Molecular Biology: Concepts and Methods",
                    description="Die Studierenden kennen grundlegende Konzepte und Methoden der Molekularbiologie.",
                    description_en="Students know basic concepts and methods in molecular biology.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Medizinische Diagnostik: Methoden",
                    title_en="Medical Diagnostics: Methods",
                    description="Die Studierenden kennen grundlegende Methoden der medizinischen Diagnostik.",
                    description_en="Students know basic methods of medical diagnostics.",
                ),
                ChildSpec(
                    suffix="5",
                    title="Lebensfunktionen interdisziplinär untersuchen",
                    title_en="Investigate Life Functions Interdisciplinarily",
                    description="Die Studierenden können Methoden verschiedener Disziplinen kombinieren, um Lebensfunktionen zu erforschen.",
                    description_en="Students can combine methods from different disciplines to investigate life functions.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="gkphys_k_nnen_grundlegende_arbeitstechniken_und_versuchsans_tze_der_experimentellen_physiologie",
            parent_title=None,
            parent_title_en="Experimental Physiology Techniques",
            parent_description="Die Studierenden verstehen und wenden grundlegende Arbeitstechniken und Versuchsansätze der experimentellen Physiologie an (von molekular bis Organismus).",
            parent_description_en="Students understand and apply basic techniques and experimental approaches in experimental physiology (from molecular to organism level).",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Arbeitstechniken verstehen",
                    title_en="Understand Techniques",
                    description="Die Studierenden können grundlegende Arbeitstechniken der experimentellen Physiologie erklären.",
                    description_en="Students can explain basic techniques of experimental physiology.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Versuchsansätze anwenden",
                    title_en="Apply Experimental Approaches",
                    description="Die Studierenden können grundlegende Versuchsansätze der experimentellen Physiologie anwenden.",
                    description_en="Students can apply basic experimental approaches in experimental physiology.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Skalenübergreifend denken",
                    title_en="Think Across Scales",
                    description="Die Studierenden können physiologische Prozesse von molekularer Ebene bis zum Organismus in Beziehung setzen.",
                    description_en="Students can relate physiological processes from molecular level up to the whole organism.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="gkebio_einfache_entwicklungsbiologische_experimente_durchzuf_hren_und_die_zugrunde_liegenden",
            parent_title=None,
            parent_title_en="Developmental Biology Experiments: Observe and Document",
            parent_description="Die Studierenden können einfache entwicklungsbiologische Experimente durchführen, Prozesse beobachten und schriftlich dokumentieren.",
            parent_description_en="Students can conduct simple developmental biology experiments, observe processes, and document them in writing.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Experimente durchführen",
                    title_en="Conduct Experiments",
                    description="Die Studierenden können einfache entwicklungsbiologische Experimente durchführen.",
                    description_en="Students can conduct simple developmental biology experiments.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Prozesse beobachten",
                    title_en="Observe Processes",
                    description="Die Studierenden können zugrunde liegende Prozesse exakt beobachten.",
                    description_en="Students can observe underlying processes precisely.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Beobachtungen dokumentieren",
                    title_en="Document Observations",
                    description="Die Studierenden können Beobachtungen schriftlich dokumentieren.",
                    description_en="Students can document observations in writing.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="gkebio_k_nnen",
            parent_title="Versuche auswerten und Ergebnisse vergleichen",
            parent_title_en="Evaluate Experiments and Compare Results",
            parent_description="Die Studierenden werten Versuche qualitativ und quantitativ aus und bewerten eigene Ergebnisse im Vergleich zu anderen und zur Literatur.",
            parent_description_en="Students evaluate experiments qualitatively and quantitatively and assess their results compared to others and to the literature.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Versuche qualitativ auswerten",
                    title_en="Qualitatively Evaluate Experiments",
                    description="Die Studierenden können Versuche qualitativ auswerten.",
                    description_en="Students can qualitatively evaluate experiments.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Versuche quantitativ auswerten",
                    title_en="Quantitatively Evaluate Experiments",
                    description="Die Studierenden können Versuche quantitativ auswerten.",
                    description_en="Students can quantitatively evaluate experiments.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Ergebnisse vergleichen und bewerten",
                    title_en="Compare and Assess Results",
                    description="Die Studierenden können eigene Ergebnisse mit Ergebnissen anderer und mit Literaturwerten vergleichen und bewerten.",
                    description_en="Students can compare their results with others' results and literature values and assess them.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="gkebio_k_nnen_2",
            parent_title="Modell, Beobachtung und Theorie-Praxis-Abgleich",
            parent_title_en="Model, Observation, and Theory–Practice Comparison",
            parent_description="Die Studierenden setzen Modellvorstellungen und praktische Beobachtungen in Bezug, gehen kritisch mit Modellen um und identifizieren Diskrepanzen zwischen Theorie und Praxis.",
            parent_description_en="Students relate models to practical observations, critically work with models, and identify discrepancies between theory and practice.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Modelle und Beobachtungen in Bezug setzen",
                    title_en="Relate Models and Observations",
                    description="Die Studierenden können Modellvorstellungen und praktische Beobachtungen in Bezug setzen.",
                    description_en="Students can relate model concepts and practical observations.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Kritisch mit Modellen umgehen",
                    title_en="Work Critically with Models",
                    description="Die Studierenden können aktiv und kritisch mit entwicklungsbiologischen Modellen umgehen.",
                    description_en="Students can work actively and critically with developmental biology models.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Diskrepanzen identifizieren",
                    title_en="Identify Discrepancies",
                    description="Die Studierenden können Diskrepanzen zwischen Theorie und Praxis identifizieren.",
                    description_en="Students can identify discrepancies between theory and practice.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="gkbiwi_sind_in_der_lage_genau_zu_beobachten_und",
            parent_title=None,
            parent_title_en="Observe and Document",
            parent_description="Die Studierenden können genau beobachten und Beobachtungen bildlich und textlich dokumentieren.",
            parent_description_en="Students can observe carefully and document observations visually and in writing.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Genau beobachten",
                    title_en="Observe Carefully",
                    description="Die Studierenden können genau beobachten.",
                    description_en="Students can observe carefully.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Bildlich dokumentieren",
                    title_en="Document Visually",
                    description="Die Studierenden können Beobachtungen bildlich dokumentieren.",
                    description_en="Students can document observations visually.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Textlich dokumentieren",
                    title_en="Document in Writing",
                    description="Die Studierenden können Beobachtungen textlich dokumentieren.",
                    description_en="Students can document observations in writing.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="gkmmb_k_nnen_grundlegende_techniken_und_verfahren_der_biochemie",
            parent_title=None,
            parent_title_en="Core Laboratory Techniques (Biochem/MolBio/Microbio)",
            parent_description="Die Studierenden können grundlegende Techniken der Biochemie, Molekularbiologie und Mikrobiologie beschreiben und anwenden.",
            parent_description_en="Students can describe and apply basic techniques in biochemistry, molecular biology, and microbiology.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Biochemie: Techniken anwenden",
                    title_en="Biochemistry: Apply Techniques",
                    description="Die Studierenden können grundlegende biochemische Techniken beschreiben und anwenden.",
                    description_en="Students can describe and apply basic biochemistry techniques.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Molekularbiologie: Techniken anwenden",
                    title_en="Molecular Biology: Apply Techniques",
                    description="Die Studierenden können grundlegende molekularbiologische Techniken beschreiben und anwenden.",
                    description_en="Students can describe and apply basic molecular biology techniques.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Mikrobiologie: Techniken anwenden",
                    title_en="Microbiology: Apply Techniques",
                    description="Die Studierenden können grundlegende mikrobiologische Techniken beschreiben und anwenden.",
                    description_en="Students can describe and apply basic microbiology techniques.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="mathe_k_nnen_trans_und_interdisziplin_r_denken_und_handeln",
            parent_title=None,
            parent_title_en="Think and Act Interdisciplinarily",
            parent_description="Die Studierenden können trans- und interdisziplinär denken und handeln.",
            parent_description_en="Students can think and act transdisciplinarily and interdisciplinarily.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Trans- und interdisziplinär denken",
                    title_en="Think Interdisciplinarily",
                    description="Die Studierenden können trans- und interdisziplinär denken.",
                    description_en="Students can think transdisciplinarily and interdisciplinarily.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Trans- und interdisziplinär handeln",
                    title_en="Act Interdisciplinarily",
                    description="Die Studierenden können trans- und interdisziplinär handeln.",
                    description_en="Students can act transdisciplinarily and interdisciplinarily.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="s_k_nnen_der_erwerb",
            parent_title=None,
            parent_title_en="Specialist Knowledge, Presentation, Media Skills",
            parent_description="Die Studierenden vertiefen biologisches Spezialwissen, erlernen Präsentationstechniken und bauen Medienkompetenz aus.",
            parent_description_en="Students deepen specialist biological knowledge, learn presentation techniques, and build media competence.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Biologisches Spezialwissen vertiefen",
                    title_en="Deepen Specialist Biological Knowledge",
                    description="Die Studierenden können biologisches Spezialwissen erwerben, vertiefen und ausbauen.",
                    description_en="Students can acquire and deepen specialist biological knowledge.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Präsentationstechniken erlernen",
                    title_en="Learn Presentation Techniques",
                    description="Die Studierenden können verschiedene Präsentationstechniken erlernen und anwenden.",
                    description_en="Students can learn and apply different presentation techniques.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Medienkompetenz entwickeln",
                    title_en="Develop Media Competence",
                    description="Die Studierenden können Medienkompetenz erarbeiten und ausbauen.",
                    description_en="Students can develop and strengthen media competence.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="s_k_nnen_eigenst_ndig_fachinformationen_recherchieren",
            parent_title=None,
            parent_title_en="Research, Assess, Contextualize Information",
            parent_description="Die Studierenden recherchieren Fachinformationen, ordnen und bewerten sie und setzen sie zueinander in Kontext.",
            parent_description_en="Students research subject information, classify and evaluate it, and put it into context.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Fachinformationen recherchieren",
                    title_en="Research Subject Information",
                    description="Die Studierenden können eigenständig Fachinformationen recherchieren.",
                    description_en="Students can research subject information independently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Fachinformationen einordnen",
                    title_en="Classify Information",
                    description="Die Studierenden können recherchierte Fachinformationen einordnen.",
                    description_en="Students can classify researched information.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Fachinformationen bewerten",
                    title_en="Evaluate Information",
                    description="Die Studierenden können Fachinformationen fachlich bewerten.",
                    description_en="Students can evaluate information professionally.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Informationen in Kontext setzen",
                    title_en="Put Information into Context",
                    description="Die Studierenden können Informationen zueinander in Kontext setzen.",
                    description_en="Students can relate information and put it into context.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="zv_immunologie_wiederzugeben_und_k_nnen_die_wichtigsten_kernaussagen_auch",
            parent_title=None,
            parent_title_en="Explain Immunology to Different Audiences",
            parent_description="Die Studierenden können Immunologie-Grundlagen wiedergeben und Kernaussagen auch Nicht-Fachwissenschaftlern verständlich erklären.",
            parent_description_en="Students can recall fundamentals of immunology and explain key messages clearly to non-experts.",
            children=(
                ChildSpec(
                    suffix="1",
                    title="Immunologie-Grundlagen wiedergeben",
                    title_en="Recall Immunology Fundamentals",
                    description="Die Studierenden können grundlegende Konzepte der Immunologie wiedergeben.",
                    description_en="Students can recall basic concepts of immunology.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Kernaussagen verständlich erklären",
                    title_en="Explain Key Messages Clearly",
                    description="Die Studierenden können wichtigste Kernaussagen auch Nicht-Fachwissenschaftlern verständlich erklären.",
                    description_en="Students can explain key messages clearly to non-experts.",
                ),
            ),
        ),
    ]

    # Apply in reverse order of appearance for stable insertion indices
    goals = data.get("goals", [])
    index_by_short_key = {g.get("shortKey"): i for i, g in enumerate(goals) if g.get("shortKey")}
    splits_sorted = sorted(splits, key=lambda s: index_by_short_key.get(s.parent_short_key, -1), reverse=True)

    for spec in splits_sorted:
        apply_split(data, spec)

    target.write_text(json.dumps(data, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
