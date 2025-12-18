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


def make_child_goal(
    parent: dict[str, Any],
    child_short_key: str,
    spec: ChildSpec,
    id_by_short_key: dict[str, str],
) -> dict[str, Any]:
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
        "weight": 1.0,
        "tags": ["atomic"],
        "dimensionTags": {
            **dim,
            "topicCode": child_topic,
        },
        "requires": _dedupe_keep_order(requires),
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
    goals[idx + 1 : idx + 1] = children


def main() -> None:
    target = Path(
        "curricula/DE/BW/Uni_Heidelberg/Master_Molecular_BioSciences/json/DE_BAW_U_HEIDELBERG_MA_MOLBIOSCI.de.json"
    )
    data = json.loads(target.read_text(encoding="utf-8"))

    splits: list[SplitSpec] = [
        # --- Frontiers in BioSciences I (FrontI) ---
        SplitSpec(
            parent_short_key="fronti_genome_structure",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Struktur und Organisation von Genomen beschreiben",
                    title_en="Describe genome structure and organization",
                    description="Die Studierenden können die Struktur und Organisation von Genomen beschreiben.",
                    description_en="Students can describe genome structure and organization.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Zentrale Konzepte zur Genomorganisation einordnen",
                    title_en="Classify core concepts of genome organization",
                    description="Die Studierenden können zentrale Konzepte zur Genomstruktur und -organisation einordnen.",
                    description_en="Students can classify core concepts related to genome structure and organization.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="fronti_gene_expression_regulation",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Mechanismen der Genexpressionsregulation erläutern",
                    title_en="Explain mechanisms of gene expression regulation",
                    description="Die Studierenden können Mechanismen der Regulation der Genexpression erläutern.",
                    description_en="Students can explain mechanisms of gene expression regulation.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Beispiele zur Genexpressionsregulation analysieren",
                    title_en="Analyze examples of gene expression regulation",
                    description="Die Studierenden können Beispiele zur Regulation der Genexpression analysieren.",
                    description_en="Students can analyze examples of gene expression regulation.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="fronti_proteome_basics",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Begriff Proteom erläutern",
                    title_en="Explain the term proteome",
                    description="Die Studierenden können den Begriff Proteom erläutern.",
                    description_en="Students can explain the term proteome.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Grundansätze der Proteomik benennen",
                    title_en="Name basic approaches in proteomics",
                    description="Die Studierenden können grundlegende Ansätze der Proteomik benennen.",
                    description_en="Students can name basic approaches in proteomics.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="fronti_interactome_basics",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Begriff Interactom erläutern",
                    title_en="Explain the term interactome",
                    description="Die Studierenden können den Begriff Interactom erläutern.",
                    description_en="Students can explain the term interactome.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Strategien zur Interaktionsanalyse skizzieren",
                    title_en="Outline strategies for interaction analysis",
                    description="Die Studierenden können grundlegende Strategien zur Analyse von Interaktionen skizzieren.",
                    description_en="Students can outline basic strategies for analyzing interactions.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="fronti_cell_organization_dynamics",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Prinzipien der Zellorganisation und -dynamik beschreiben",
                    title_en="Describe principles of cell organization and dynamics",
                    description="Die Studierenden können Prinzipien der Zellorganisation und Zelldynamik beschreiben.",
                    description_en="Students can describe principles of cell organization and cell dynamics.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Zellorganisation und -dynamik auf Fragestellungen anwenden",
                    title_en="Apply cell organization and dynamics to questions",
                    description="Die Studierenden können Prinzipien der Zellorganisation und Zelldynamik auf Fragestellungen anwenden.",
                    description_en="Students can apply principles of cell organization and cell dynamics to questions.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="fronti_methods_broad_spectrum",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Methoden zur Bearbeitung biologischer Fragestellungen auswählen",
                    title_en="Select methods for biological questions",
                    description="Die Studierenden können geeignete Methoden zur Bearbeitung biologischer Fragestellungen auswählen.",
                    description_en="Students can select suitable methods for addressing biological questions.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Methodenauswahl begründen",
                    title_en="Justify method selection",
                    description="Die Studierenden können ihre Methodenauswahl begründen.",
                    description_en="Students can justify their method selection.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="fronti_apply_new_methods_reflect",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Neue wissenschaftliche Methoden anwenden",
                    title_en="Apply new scientific methods",
                    description="Die Studierenden können neue wissenschaftliche Methoden zielgerichtet anwenden.",
                    description_en="Students can apply new scientific methods purposefully.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Einsatz neuer Methoden kritisch reflektieren",
                    title_en="Critically reflect on the use of new methods",
                    description="Die Studierenden können den Einsatz neuer wissenschaftlicher Methoden kritisch reflektieren.",
                    description_en="Students can critically reflect on the use of new scientific methods.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="fronti_critical_analysis_research_status",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissenschaftliche Inhalte kritisch analysieren",
                    title_en="Critically analyze scientific content",
                    description="Die Studierenden können wissenschaftliche Inhalte kritisch analysieren.",
                    description_en="Students can critically analyze scientific content.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissenschaftliche Inhalte fachlich einordnen",
                    title_en="Classify scientific content",
                    description="Die Studierenden können wissenschaftliche Inhalte fachlich einordnen.",
                    description_en="Students can classify scientific content in a subject-specific way.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Bezug zum aktuellen Forschungsstand herstellen",
                    title_en="Relate content to the current state of research",
                    description="Die Studierenden können den Bezug wissenschaftlicher Inhalte zum aktuellen Forschungsstand herstellen.",
                    description_en="Students can relate scientific content to the current state of research.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="fronti_literature_search_english_abstract",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Relevante wissenschaftliche Literatur recherchieren",
                    title_en="Search relevant scientific literature",
                    description="Die Studierenden können relevante wissenschaftliche Literatur recherchieren.",
                    description_en="Students can search for relevant scientific literature.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Literatur auswerten",
                    title_en="Evaluate literature",
                    description="Die Studierenden können recherchierte wissenschaftliche Literatur auswerten.",
                    description_en="Students can evaluate scientific literature they have found.",
                    requires_short_keys=("fronti_literature_search_english_abstract_1",),
                ),
                ChildSpec(
                    suffix="3",
                    title="Englischsprachiges Abstract zusammenfassen",
                    title_en="Summarize an English abstract",
                    description="Die Studierenden können Kernaussagen in einem englischsprachigen Abstract zusammenfassen.",
                    description_en="Students can summarize key statements in an English abstract.",
                    requires_short_keys=("fronti_literature_search_english_abstract_2",),
                ),
                ChildSpec(
                    suffix="4",
                    title="Abstract präsentieren",
                    title_en="Present an abstract",
                    description="Die Studierenden können Inhalte eines englischsprachigen Abstracts präsentieren.",
                    description_en="Students can present the content of an English abstract.",
                    requires_short_keys=("fronti_literature_search_english_abstract_3",),
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="fronti_major_theory_knowledge",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Theoretische Grundlagen der Molekularen Biowissenschaften erläutern",
                    title_en="Explain theoretical foundations of molecular biosciences",
                    description="Die Studierenden können zentrale theoretische Grundlagen der Molekularen Biowissenschaften erläutern.",
                    description_en="Students can explain key theoretical foundations of molecular biosciences.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissen im gewählten Major anwenden",
                    title_en="Apply knowledge in the chosen major",
                    description="Die Studierenden können vertieftes Wissen im gewählten Major anwenden.",
                    description_en="Students can apply advanced knowledge in their chosen major.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="fronti_experimental_techniques_data_analysis",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Anspruchsvolle experimentelle Techniken anwenden",
                    title_en="Apply advanced experimental techniques",
                    description="Die Studierenden können anspruchsvolle experimentelle Techniken sicher anwenden.",
                    description_en="Students can safely apply advanced experimental techniques.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Erfolgskontrollen durchführen",
                    title_en="Perform quality and success controls",
                    description="Die Studierenden können geeignete Erfolgskontrollen durchführen.",
                    description_en="Students can perform appropriate quality and success controls.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Daten eigenständig auswerten",
                    title_en="Evaluate data independently",
                    description="Die Studierenden können Daten eigenständig auswerten.",
                    description_en="Students can evaluate data independently.",
                ),
            ),
        ),
        # --- Frontiers in BioSciences II (FrontII) ---
        SplitSpec(
            parent_short_key="frontii_organ_development",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Prinzipien der Organentwicklung beschreiben",
                    title_en="Describe principles of organ development",
                    description="Die Studierenden können grundlegende Prinzipien der Organentwicklung beschreiben.",
                    description_en="Students can describe basic principles of organ development.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Prinzipien der Organentwicklung einordnen",
                    title_en="Classify principles of organ development",
                    description="Die Studierenden können grundlegende Prinzipien der Organentwicklung einordnen.",
                    description_en="Students can classify basic principles of organ development.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_developmental_biology",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Grundkonzepte der Entwicklungsbiologie erläutern",
                    title_en="Explain core concepts of developmental biology",
                    description="Die Studierenden können grundlegende Konzepte der Entwicklungsbiologie erläutern.",
                    description_en="Students can explain basic concepts of developmental biology.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Entwicklungsbiologie auf Beispiele anwenden",
                    title_en="Apply developmental biology to examples",
                    description="Die Studierenden können Konzepte der Entwicklungsbiologie auf Beispiele anwenden.",
                    description_en="Students can apply concepts of developmental biology to examples.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_oncology",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Grundkonzepte der Onkologie erläutern",
                    title_en="Explain basic concepts of oncology",
                    description="Die Studierenden können grundlegende Konzepte der Onkologie erläutern.",
                    description_en="Students can explain basic concepts of oncology.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Molekulare Mechanismen in der Onkologie einordnen",
                    title_en="Classify molecular mechanisms in oncology",
                    description="Die Studierenden können molekulare Mechanismen der Onkologie einordnen.",
                    description_en="Students can classify molecular mechanisms in oncology.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_host_pathogen_relationships",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Mechanismen von Wirt-Pathogen-Beziehungen beschreiben",
                    title_en="Describe mechanisms of host–pathogen relationships",
                    description="Die Studierenden können zentrale Mechanismen von Wirt-Pathogen-Beziehungen beschreiben.",
                    description_en="Students can describe key mechanisms of host–pathogen relationships.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Beispiele zu Wirt-Pathogen-Beziehungen analysieren",
                    title_en="Analyze examples of host–pathogen relationships",
                    description="Die Studierenden können Beispiele zu Wirt-Pathogen-Beziehungen analysieren.",
                    description_en="Students can analyze examples of host–pathogen relationships.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_systems_biology",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Ziele und Grundideen der Systembiologie erläutern",
                    title_en="Explain goals and core ideas of systems biology",
                    description="Die Studierenden können Ziele und Grundideen der Systembiologie erläutern.",
                    description_en="Students can explain the goals and core ideas of systems biology.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Beispiele der Systembiologie einordnen",
                    title_en="Classify examples in systems biology",
                    description="Die Studierenden können Beispiele der Systembiologie einordnen.",
                    description_en="Students can classify examples in systems biology.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_ecological_systems",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Grundkonzepte ökologischer Systeme erläutern",
                    title_en="Explain core concepts of ecological systems",
                    description="Die Studierenden können grundlegende Konzepte ökologischer Systeme erläutern.",
                    description_en="Students can explain basic concepts of ecological systems.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Ökologische Konzepte auf Fallbeispiele beziehen",
                    title_en="Relate ecological concepts to case studies",
                    description="Die Studierenden können Konzepte ökologischer Systeme auf Fallbeispiele beziehen.",
                    description_en="Students can relate concepts of ecological systems to case studies.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_evolution",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Grundprinzipien der Evolution erläutern",
                    title_en="Explain basic principles of evolution",
                    description="Die Studierenden können grundlegende Prinzipien der Evolution erläutern.",
                    description_en="Students can explain basic principles of evolution.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Evolution in biologische Zusammenhänge einordnen",
                    title_en="Classify evolution in biological contexts",
                    description="Die Studierenden können Evolution in biologische Zusammenhänge einordnen.",
                    description_en="Students can classify evolution in biological contexts.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_independent_topic_exploration",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Neue Themengebiete eigenständig erschließen",
                    title_en="Explore new topics independently",
                    description="Die Studierenden können neue Themengebiete eigenständig erschließen.",
                    description_en="Students can explore new topics independently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Sich in komplexe Fragestellungen einarbeiten",
                    title_en="Work into complex questions",
                    description="Die Studierenden können sich gezielt in komplexe Fragestellungen einarbeiten.",
                    description_en="Students can work into complex questions in a targeted way.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_problem_solving_new_knowledge",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Neues Wissen methodisch sicher nutzen",
                    title_en="Use new knowledge methodically and safely",
                    description="Die Studierenden können neues Wissen methodisch sicher nutzen.",
                    description_en="Students can use new knowledge methodically and safely.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Problemlösungen in breiteren Zusammenhängen entwickeln",
                    title_en="Develop solutions in broader contexts",
                    description="Die Studierenden können Problemlösungen in breiteren fachlichen Zusammenhängen entwickeln.",
                    description_en="Students can develop solutions in broader subject-specific contexts.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_major_practical_qualifications",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Praktische Qualifikationen im Major nachweisen",
                    title_en="Demonstrate practical qualifications in the major",
                    description="Die Studierenden können erweiterte praktische Qualifikationen zu Fragestellungen ihres gewählten Majors nachweisen.",
                    description_en="Students can demonstrate advanced practical qualifications related to questions in their chosen major.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Praktische Qualifikationen reflektieren",
                    title_en="Reflect on practical qualifications",
                    description="Die Studierenden können ihre praktischen Qualifikationen reflektieren.",
                    description_en="Students can reflect on their practical qualifications.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_contextualize_scientific_relationships",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissenschaftliche Zusammenhänge einordnen",
                    title_en="Classify scientific relationships",
                    description="Die Studierenden können wissenschaftliche Zusammenhänge fachlich fundiert einordnen.",
                    description_en="Students can classify scientific relationships in a well-founded way.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissenschaftliche Zusammenhänge kritisch bewerten",
                    title_en="Critically evaluate scientific relationships",
                    description="Die Studierenden können wissenschaftliche Zusammenhänge kritisch bewerten.",
                    description_en="Students can critically evaluate scientific relationships.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_literature_english_abstract",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Weiterführende wissenschaftliche Literatur recherchieren",
                    title_en="Search advanced scientific literature",
                    description="Die Studierenden können weiterführende wissenschaftliche Literatur recherchieren.",
                    description_en="Students can search advanced scientific literature.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Literatur auswerten",
                    title_en="Evaluate literature",
                    description="Die Studierenden können weiterführende wissenschaftliche Literatur auswerten.",
                    description_en="Students can evaluate advanced scientific literature.",
                    requires_short_keys=("frontii_literature_english_abstract_1",),
                ),
                ChildSpec(
                    suffix="3",
                    title="Englischsprachiges Abstract strukturieren und zusammenfassen",
                    title_en="Structure and summarize an English abstract",
                    description="Die Studierenden können wesentliche Inhalte strukturiert in einem englischsprachigen Abstract zusammenfassen.",
                    description_en="Students can summarize essential content in a structured English abstract.",
                    requires_short_keys=("frontii_literature_english_abstract_2",),
                ),
                ChildSpec(
                    suffix="4",
                    title="Abstract präsentieren",
                    title_en="Present an abstract",
                    description="Die Studierenden können wesentliche Inhalte eines englischsprachigen Abstracts präsentieren.",
                    description_en="Students can present the essential content of an English abstract.",
                    requires_short_keys=("frontii_literature_english_abstract_3",),
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_interdisciplinary_communication",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissenschaftliche Inhalte analytisch durchdringen",
                    title_en="Analyze scientific content deeply",
                    description="Die Studierenden können wissenschaftliche Inhalte analytisch durchdringen.",
                    description_en="Students can analyze scientific content deeply.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissenschaftliche Inhalte anwendungsorientiert bearbeiten",
                    title_en="Work on scientific content in an application-oriented way",
                    description="Die Studierenden können wissenschaftliche Inhalte anwendungsorientiert bearbeiten.",
                    description_en="Students can work on scientific content in an application-oriented way.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Wissenschaftliche Inhalte interdisziplinär kommunizieren",
                    title_en="Communicate scientific content interdisciplinarily",
                    description="Die Studierenden können wissenschaftliche Inhalte in interdisziplinären Kontexten kommunizieren.",
                    description_en="Students can communicate scientific content in interdisciplinary contexts.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="frontii_theory_practice_transfer",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Theoretische Inhalte praxisnah umsetzen",
                    title_en="Implement theoretical content in practice",
                    description="Die Studierenden können theoretisch vermittelte Inhalte praxisnah umsetzen.",
                    description_en="Students can implement theoretically taught content in practice.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Theorie im begleitenden Praktikum anwenden",
                    title_en="Apply theory in the accompanying practical course",
                    description="Die Studierenden können theoretisch vermittelte Inhalte im begleitenden Praktikum anwenden.",
                    description_en="Students can apply theoretically taught content in the accompanying practical course.",
                ),
            ),
        ),
        # --- Focus BioSciences I (FocI) ---
        SplitSpec(
            parent_short_key="foci_major_specialist_knowledge",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Spezialwissen im Major aufbauen",
                    title_en="Build specialist knowledge in the major",
                    description="Die Studierenden können biologisches Spezialwissen im gewählten Major aufbauen.",
                    description_en="Students can build specialist knowledge in their chosen major.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Spezialwissen im Major vertiefen",
                    title_en="Deepen specialist knowledge in the major",
                    description="Die Studierenden können biologisches Spezialwissen im gewählten Major vertiefen.",
                    description_en="Students can deepen specialist knowledge in their chosen major.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Spezialwissen im Major anwenden",
                    title_en="Apply specialist knowledge in the major",
                    description="Die Studierenden können biologisches Spezialwissen im gewählten Major anwenden.",
                    description_en="Students can apply specialist knowledge in their chosen major.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_time_management_self_responsible_action",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Zeitmanagement nutzen",
                    title_en="Use time management",
                    description="Die Studierenden können qualitatives und operatives Zeitmanagement nutzen.",
                    description_en="Students can use qualitative and operational time management.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Eigenverantwortlich zielorientiert handeln",
                    title_en="Act responsibly and goal-oriented",
                    description="Die Studierenden können eigenverantwortlich zielorientiert handeln.",
                    description_en="Students can act responsibly and in a goal-oriented manner.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_presentation_techniques_media_competence",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Präsentationstechniken einsetzen",
                    title_en="Use presentation techniques",
                    description="Die Studierenden können Präsentationstechniken einsetzen.",
                    description_en="Students can use presentation techniques.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Medienkompetenz für wissenschaftliche Kommunikation aufbauen",
                    title_en="Build media competence for scientific communication",
                    description="Die Studierenden können Medienkompetenz für wissenschaftliche Kommunikation aufbauen.",
                    description_en="Students can build media competence for scientific communication.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_language_communication_skills",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Sprachkompetenz gezielt ausbauen",
                    title_en="Develop language skills purposefully",
                    description="Die Studierenden können ihre Sprachkompetenz gezielt ausbauen.",
                    description_en="Students can develop their language skills purposefully.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Kommunikationsfähigkeiten durch Vorträge und Diskussionen ausbauen",
                    title_en="Develop communication skills through presentations and discussions",
                    description="Die Studierenden können ihre Kommunikationsfähigkeiten durch Vorträge und Diskussionen gezielt ausbauen.",
                    description_en="Students can develop their communication skills through presentations and discussions.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_complex_systems_major_context",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Komplexe Organisation biologischer Systeme im Major einordnen",
                    title_en="Classify complex organization of biological systems in the major",
                    description="Die Studierenden können Wissen zur komplexen Organisation biologischer Systeme im Major kritisch einordnen.",
                    description_en="Students can critically classify knowledge about the complex organization of biological systems in their major.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissen zu komplexen Systemen im Major anwenden",
                    title_en="Apply knowledge about complex systems in the major",
                    description="Die Studierenden können Wissen zur komplexen Organisation biologischer Systeme im Major anwenden.",
                    description_en="Students can apply knowledge about the complex organization of biological systems in their major.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_theory_to_practice_practicum",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Theoretische Konzepte praktisch umsetzen",
                    title_en="Implement theoretical concepts in practice",
                    description="Die Studierenden können theoretisch erlernte Konzepte praktisch umsetzen.",
                    description_en="Students can implement theoretically learned concepts in practice.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Theorie im begleitenden Praktikum anwenden",
                    title_en="Apply theory in the accompanying practical course",
                    description="Die Studierenden können theoretisch erlernte Konzepte im begleitenden Praktikum anwenden.",
                    description_en="Students can apply theoretically learned concepts in the accompanying practical course.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_selfdirected_new_topics_integrate_findings",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Neue Themenfelder selbstständig erschließen",
                    title_en="Explore new subject areas independently",
                    description="Die Studierenden können neue Themenfelder selbstständig erschließen.",
                    description_en="Students can explore new subject areas independently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Sich an aktuellen Fragestellungen orientieren",
                    title_en="Orient to current research questions",
                    description="Die Studierenden können sich an aktuellen Fragestellungen orientieren.",
                    description_en="Students can orient their work to current research questions.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Neue Erkenntnisse in eigenes Fachwissen integrieren",
                    title_en="Integrate new findings into own knowledge",
                    description="Die Studierenden können neue Erkenntnisse in ihr Fachwissen integrieren.",
                    description_en="Students can integrate new findings into their subject knowledge.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_problem_solving_interdisciplinary_linking",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Problemlösungsansätze im wissenschaftlichen Arbeiten entwickeln",
                    title_en="Develop problem-solving approaches in scientific work",
                    description="Die Studierenden können Problemlösungsansätze im wissenschaftlichen Arbeiten entwickeln.",
                    description_en="Students can develop problem-solving approaches in scientific work.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Methoden und Erkenntnisse interdisziplinär verknüpfen",
                    title_en="Link methods and insights interdisciplinarily",
                    description="Die Studierenden können Methoden sowie Erkenntnisse interdisziplinär verknüpfen.",
                    description_en="Students can link methods and insights interdisciplinarily.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_practical_qualifications_problem_tasks",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Praktische Qualifikationen durch Problemstellungen erwerben",
                    title_en="Acquire practical qualifications through problem tasks",
                    description="Die Studierenden können praktische Qualifikationen im Major durch die Bearbeitung konkreter biologischer Problemstellungen erwerben.",
                    description_en="Students can acquire practical qualifications in their major by working on concrete biological problem tasks.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Praktische Qualifikationen reflektieren",
                    title_en="Reflect on practical qualifications",
                    description="Die Studierenden können erworbene praktische Qualifikationen reflektieren.",
                    description_en="Students can reflect on acquired practical qualifications.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_handle_publications_critically",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissenschaftliche Publikationen recherchieren",
                    title_en="Search for scientific publications",
                    description="Die Studierenden können wissenschaftliche Publikationen gezielt recherchieren.",
                    description_en="Students can search for scientific publications in a targeted way.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Zentrale Inhalte kritisch erfassen",
                    title_en="Critically capture key content",
                    description="Die Studierenden können zentrale Inhalte wissenschaftlicher Publikationen kritisch erfassen.",
                    description_en="Students can critically capture key content of scientific publications.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Aussagekraft von Publikationen reflektieren",
                    title_en="Reflect on the validity of publications",
                    description="Die Studierenden können die Aussagekraft wissenschaftlicher Publikationen reflektieren.",
                    description_en="Students can reflect on the validity of scientific publications.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_develop_present_scientific_talk",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissenschaftlichen Vortrag entwickeln",
                    title_en="Develop a scientific talk",
                    description="Die Studierenden können einen wissenschaftlichen Vortrag entwickeln.",
                    description_en="Students can develop a scientific talk.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Vortrag adressatengerecht präsentieren",
                    title_en="Present a talk to a specific audience",
                    description="Die Studierenden können einen wissenschaftlichen Vortrag adressatengerecht präsentieren.",
                    description_en="Students can present a scientific talk to a specific audience.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Vortrag im fachlichen Diskurs vertreten",
                    title_en="Defend a talk in scientific discussion",
                    description="Die Studierenden können einen wissenschaftlichen Vortrag im fachlichen Diskurs vertreten.",
                    description_en="Students can defend a scientific talk in scientific discussion.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="foci_develop_own_research_questions",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Eigene wissenschaftliche Fragestellungen entwickeln",
                    title_en="Develop own scientific research questions",
                    description="Die Studierenden können eigene wissenschaftliche Fragestellungen und Ideen entwickeln.",
                    description_en="Students can develop their own scientific research questions and ideas.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Fragestellungen methodisch strukturieren",
                    title_en="Structure questions methodically",
                    description="Die Studierenden können eigene wissenschaftliche Fragestellungen methodisch durchdacht strukturieren.",
                    description_en="Students can structure their own scientific research questions methodically.",
                ),
            ),
        ),
        # --- Focus BioSciences II (FocII) ---
        SplitSpec(
            parent_short_key="focii_analyze_publications_critically",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Publikationen systematisch analysieren",
                    title_en="Analyze publications systematically",
                    description="Die Studierenden können wissenschaftliche Publikationen systematisch analysieren.",
                    description_en="Students can analyze scientific publications systematically.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Zentrale Aussagen erfassen",
                    title_en="Capture key statements",
                    description="Die Studierenden können zentrale Aussagen wissenschaftlicher Publikationen erfassen.",
                    description_en="Students can capture key statements of scientific publications.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Relevanz und Aussagekraft kritisch diskutieren",
                    title_en="Discuss relevance and validity critically",
                    description="Die Studierenden können Relevanz sowie Aussagekraft wissenschaftlicher Publikationen kritisch diskutieren.",
                    description_en="Students can critically discuss the relevance and validity of scientific publications.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="focii_conceive_present_scientific_talk",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissenschaftlichen Vortrag konzipieren",
                    title_en="Conceive a scientific talk",
                    description="Die Studierenden können einen wissenschaftlichen Vortrag eigenständig konzipieren.",
                    description_en="Students can conceive a scientific talk independently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Vortrag angemessen präsentieren",
                    title_en="Present a talk appropriately",
                    description="Die Studierenden können einen wissenschaftlichen Vortrag angemessen präsentieren.",
                    description_en="Students can present a scientific talk appropriately.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Vortrag im fachlichen Austausch vertreten",
                    title_en="Defend a talk in professional exchange",
                    description="Die Studierenden können einen wissenschaftlichen Vortrag im fachlichen Austausch vertreten.",
                    description_en="Students can defend a scientific talk in professional exchange.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="focii_develop_research_ideas",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Eigene Forschungsideen entwickeln",
                    title_en="Develop own research ideas",
                    description="Die Studierenden können eigene Forschungsideen entwickeln.",
                    description_en="Students can develop their own research ideas.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Forschungsideen methodisch strukturieren",
                    title_en="Structure research ideas methodically",
                    description="Die Studierenden können eigene Forschungsideen methodisch sinnvoll strukturieren.",
                    description_en="Students can structure their research ideas methodically.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="focii_independent_new_topics_literature_critical",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Neue Themengebiete erschließen",
                    title_en="Explore new topics",
                    description="Die Studierenden können neue Themengebiete erschließen.",
                    description_en="Students can explore new topics.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Relevante Informationen recherchieren",
                    title_en="Search for relevant information",
                    description="Die Studierenden können relevante Informationen recherchieren.",
                    description_en="Students can search for relevant information.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Informationen kritisch bewerten",
                    title_en="Critically evaluate information",
                    description="Die Studierenden können recherchierte Informationen kritisch bewerten.",
                    description_en="Students can critically evaluate the information they have found.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="focii_major_specialist_knowledge",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissen zur Organisation biologischer Systeme vertiefen",
                    title_en="Deepen knowledge on the organization of biological systems",
                    description="Die Studierenden können ihr Wissen zur Organisation biologischer Systeme im gewählten Major vertiefen.",
                    description_en="Students can deepen their knowledge of the organization of biological systems in their chosen major.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissen in Theorie und Praxis anwenden",
                    title_en="Apply knowledge in theory and practice",
                    description="Die Studierenden können ihr Wissen in theoretischen wie praktischen Kontexten anwenden.",
                    description_en="Students can apply their knowledge in both theoretical and practical contexts.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="focii_theory_to_practice_practicum",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Theoretische Konzepte in die Praxis übertragen",
                    title_en="Transfer theoretical concepts into practice",
                    description="Die Studierenden können theoretische Konzepte in die Praxis übertragen.",
                    description_en="Students can transfer theoretical concepts into practice.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Experimentelle Methoden im Praktikum gezielt einsetzen",
                    title_en="Apply experimental methods purposefully in the practical course",
                    description="Die Studierenden können experimentelle Methoden im Praktikum gezielt einsetzen.",
                    description_en="Students can apply experimental methods purposefully in the practical course.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="focii_write_project_proposal",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Forschungsidee für ein Project Proposal entwickeln",
                    title_en="Develop a research idea for a project proposal",
                    description="Die Studierenden können eine Forschungsidee für einen wissenschaftlichen Projektvorschlag entwickeln.",
                    description_en="Students can develop a research idea for a scientific project proposal.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Project Proposal strukturiert darstellen",
                    title_en="Write a structured project proposal",
                    description="Die Studierenden können eine Forschungsidee strukturiert als wissenschaftlichen Projektvorschlag (Project Proposal) darstellen.",
                    description_en="Students can present a research idea as a structured scientific project proposal.",
                ),
            ),
        ),
        # --- Biolab (Biolab) ---
        SplitSpec(
            parent_short_key="biolab_data_analysis_statistics_good_practice",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Daten statistisch auswerten",
                    title_en="Analyze data statistically",
                    description="Die Studierenden können Daten statistisch auswerten.",
                    description_en="Students can analyze data statistically.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Gute wissenschaftliche Praxis einhalten",
                    title_en="Follow good scientific practice",
                    description="Die Studierenden können Prinzipien der guten wissenschaftlichen Praxis einhalten.",
                    description_en="Students can follow principles of good scientific practice.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="biolab_documentation_reports_software_tools",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissenschaftliche Dokumentation erstellen",
                    title_en="Create scientific documentation",
                    description="Die Studierenden können wissenschaftliche Dokumentationen erstellen.",
                    description_en="Students can create scientific documentation.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Forschungsberichte mit Software erstellen",
                    title_en="Create research reports using software",
                    description="Die Studierenden können Forschungsberichte mit professioneller Software (z. B. Origin, R, GraphPad, Illustrator) erstellen.",
                    description_en="Students can create research reports using professional software (e.g., Origin, R, GraphPad, Illustrator).",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="biolab_experimental_design_from_question",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Fragestellung in experimentelles Design überführen",
                    title_en="Translate a question into an experimental design",
                    description="Die Studierenden können eine wissenschaftliche Fragestellung in ein experimentelles Design überführen.",
                    description_en="Students can translate a scientific question into an experimental design.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Geeignete Methoden auswählen",
                    title_en="Select suitable methods",
                    description="Die Studierenden können geeignete Methoden auswählen.",
                    description_en="Students can select suitable methods.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="biolab_plan_organize_conduct_experiments",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Experimente planen",
                    title_en="Plan experiments",
                    description="Die Studierenden können Experimente weitgehend selbstständig planen.",
                    description_en="Students can plan experiments largely independently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Experimente organisieren",
                    title_en="Organize experiments",
                    description="Die Studierenden können Experimente weitgehend selbstständig organisieren.",
                    description_en="Students can organize experiments largely independently.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Experimente durchführen",
                    title_en="Conduct experiments",
                    description="Die Studierenden können Experimente weitgehend selbstständig durchführen.",
                    description_en="Students can conduct experiments largely independently.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="biolab_present_defend_results",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissenschaftliche Inhalte strukturiert vortragen",
                    title_en="Present scientific content in a structured way",
                    description="Die Studierenden können wissenschaftliche Inhalte strukturiert vortragen.",
                    description_en="Students can present scientific content in a structured way.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Wissenschaftliche Inhalte adressatengerecht präsentieren",
                    title_en="Present scientific content to a specific audience",
                    description="Die Studierenden können wissenschaftliche Inhalte adressatengerecht präsentieren.",
                    description_en="Students can present scientific content to a specific audience.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Wissenschaftliche Inhalte im Dialog verteidigen",
                    title_en="Defend scientific content in dialogue",
                    description="Die Studierenden können wissenschaftliche Inhalte im Dialog mit Fachpublikum verteidigen.",
                    description_en="Students can defend scientific content in dialogue with a professional audience.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="biolab_problem_solving_strategies_networked_thinking",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Problemlösungsstrategien entwickeln",
                    title_en="Develop problem-solving strategies",
                    description="Die Studierenden können Problemlösungsstrategien entwickeln.",
                    description_en="Students can develop problem-solving strategies.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Problemlösungsstrategien reflektieren",
                    title_en="Reflect on problem-solving strategies",
                    description="Die Studierenden können Problemlösungsstrategien reflektieren.",
                    description_en="Students can reflect on problem-solving strategies.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Problemlösungsstrategien kreativ und vernetzt anwenden",
                    title_en="Apply problem-solving strategies creatively and in a networked way",
                    description="Die Studierenden können Problemlösungsstrategien kreativ sowie vernetzt im Erkenntnisprozess anwenden.",
                    description_en="Students can apply problem-solving strategies creatively and in a networked way within the process of gaining knowledge.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="biolab_research_practice_major",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Forschungsnahe praktische Kompetenzen im Major aufbauen",
                    title_en="Build research-related practical competencies in the major",
                    description="Die Studierenden können forschungsnahe praktische Kompetenzen im gewählten Major aufbauen.",
                    description_en="Students can build research-related practical competencies in their chosen major.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Praktische Kompetenzen im Laboralltag anwenden",
                    title_en="Apply practical competencies in everyday lab work",
                    description="Die Studierenden können forschungsnahe praktische Kompetenzen im Laboralltag anwenden.",
                    description_en="Students can apply research-related practical competencies in everyday lab work.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="biolab_self_organized_work_time_management",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Selbstorganisiert in komplexen Forschungsvorhaben arbeiten",
                    title_en="Work self-organized in complex research projects",
                    description="Die Studierenden können selbstorganisiert und zielgerichtet in komplexen Forschungsvorhaben arbeiten.",
                    description_en="Students can work self-organized and goal-oriented in complex research projects.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Zeitmanagement in Forschungsvorhaben anwenden",
                    title_en="Apply time management in research projects",
                    description="Die Studierenden können Zeitmanagement in komplexen Forschungsvorhaben anwenden.",
                    description_en="Students can apply time management in complex research projects.",
                ),
            ),
        ),
        # --- Working in BioSciences (WIB) ---
        SplitSpec(
            parent_short_key="wib_analyze_contextualize_questions_design",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Wissenschaftliche Fragestellungen analysieren",
                    title_en="Analyze scientific questions",
                    description="Die Studierenden können wissenschaftliche Fragestellungen analysieren.",
                    description_en="Students can analyze scientific questions.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Fragestellungen kontextualisieren",
                    title_en="Contextualize questions",
                    description="Die Studierenden können wissenschaftliche Fragestellungen kontextualisieren.",
                    description_en="Students can contextualize scientific questions.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Forschungsdesign aus Fragestellungen ableiten",
                    title_en="Derive a research design from questions",
                    description="Die Studierenden können Fragestellungen in ein methodisch fundiertes Forschungsdesign überführen.",
                    description_en="Students can translate questions into a methodologically sound research design.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="wib_evaluate_results_statistics_good_practice",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Experimentelle Ergebnisse auswerten",
                    title_en="Evaluate experimental results",
                    description="Die Studierenden können experimentelle Ergebnisse unter Berücksichtigung guter wissenschaftlicher Praxis auswerten.",
                    description_en="Students can evaluate experimental results while considering good scientific practice.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Ergebnisse statistisch absichern",
                    title_en="Validate results statistically",
                    description="Die Studierenden können experimentelle Ergebnisse statistisch absichern.",
                    description_en="Students can validate experimental results statistically.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Ergebnisse dokumentieren",
                    title_en="Document results",
                    description="Die Studierenden können experimentelle Ergebnisse dokumentieren.",
                    description_en="Students can document experimental results.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="wib_integrate_external_research_contexts",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Externe Forschungskontexte integrieren",
                    title_en="Integrate external research contexts",
                    description="Die Studierenden können externe Forschungskontexte (z. B. Auslandspraktikum, Industriekooperation) integrieren.",
                    description_en="Students can integrate external research contexts (e.g., international internships, industry collaborations).",
                ),
                ChildSpec(
                    suffix="2",
                    title="Kompetenzen international und praxisrelevant weiterentwickeln",
                    title_en="Develop competencies internationally and practice-oriented",
                    description="Die Studierenden können ihre Kompetenzen international und praxisrelevant weiterentwickeln.",
                    description_en="Students can develop their competencies in an international and practice-oriented way.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="wib_learn_new_topics_literature_integrate",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Sich in neue Themengebiete einarbeiten",
                    title_en="Work into new topics",
                    description="Die Studierenden können sich strukturiert in neue Themengebiete einarbeiten.",
                    description_en="Students can work into new topics in a structured way.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Fachliteratur recherchieren",
                    title_en="Search relevant literature",
                    description="Die Studierenden können Fachliteratur recherchieren.",
                    description_en="Students can search relevant literature.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Fachliteratur kritisch bewerten",
                    title_en="Critically evaluate literature",
                    description="Die Studierenden können Fachliteratur kritisch bewerten.",
                    description_en="Students can critically evaluate literature.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Literatur in den Forschungsprozess integrieren",
                    title_en="Integrate literature into the research process",
                    description="Die Studierenden können Literatur und Erkenntnisse in den Forschungsprozess integrieren.",
                    description_en="Students can integrate literature and findings into the research process.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="wib_manage_time_resources_reflect_optimize",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Zeit- und Ressourcenpläne steuern",
                    title_en="Manage time and resource plans",
                    description="Die Studierenden können Zeit- und Ressourcenpläne steuern.",
                    description_en="Students can manage time and resource plans.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Arbeitsprozess kritisch reflektieren",
                    title_en="Reflect on the work process critically",
                    description="Die Studierenden können den Arbeitsprozess kritisch reflektieren.",
                    description_en="Students can reflect on the work process critically.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Arbeitsprozess optimieren",
                    title_en="Optimize the work process",
                    description="Die Studierenden können den Arbeitsprozess optimieren.",
                    description_en="Students can optimize the work process.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="wib_plan_organize_conduct_projects",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Forschungsprojekte planen",
                    title_en="Plan research projects",
                    description="Die Studierenden können Forschungsprojekte eigenverantwortlich planen.",
                    description_en="Students can plan research projects independently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Forschungsprojekte organisieren",
                    title_en="Organize research projects",
                    description="Die Studierenden können Forschungsprojekte eigenverantwortlich organisieren.",
                    description_en="Students can organize research projects independently.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Forschungsprojekte durchführen",
                    title_en="Conduct research projects",
                    description="Die Studierenden können Forschungsprojekte eigenverantwortlich durchführen.",
                    description_en="Students can conduct research projects independently.",
                ),
                ChildSpec(
                    suffix="4",
                    title="Moderne experimentelle Techniken auswählen",
                    title_en="Select modern experimental techniques",
                    description="Die Studierenden können moderne experimentelle Techniken angemessen auswählen.",
                    description_en="Students can select modern experimental techniques appropriately.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="wib_present_discuss_results_dialog",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Forschungsergebnisse mündlich präsentieren",
                    title_en="Present research results orally",
                    description="Die Studierenden können Forschungsergebnisse mündlich präsentieren.",
                    description_en="Students can present research results orally.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Forschungsergebnisse im Dialog diskutieren",
                    title_en="Discuss research results in dialogue",
                    description="Die Studierenden können Forschungsergebnisse im kritischen Dialog mit Fachpublikum diskutieren.",
                    description_en="Students can discuss research results in critical dialogue with a professional audience.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="wib_problem_solving_under_uncertainty",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Problemlösungsstrategien entwickeln",
                    title_en="Develop problem-solving strategies",
                    description="Die Studierenden können Problemlösungsstrategien entwickeln.",
                    description_en="Students can develop problem-solving strategies.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Kreative Denkansätze nutzen",
                    title_en="Use creative thinking approaches",
                    description="Die Studierenden können kreative Denkansätze nutzen.",
                    description_en="Students can use creative thinking approaches.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Entscheidungen unter Unsicherheit treffen",
                    title_en="Make decisions under uncertainty",
                    description="Die Studierenden können auch unter unsicheren Bedingungen forschungsbezogene Entscheidungen treffen.",
                    description_en="Students can make research-related decisions under uncertain conditions.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="wib_write_report_visualization_software",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Projektbericht oder Abschlussarbeit verfassen",
                    title_en="Write a project report or thesis",
                    description="Die Studierenden können einen Projektbericht oder eine Abschlussarbeit verfassen.",
                    description_en="Students can write a project report or a thesis.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Abbildungen und Datenvisualisierungen erstellen",
                    title_en="Create figures and data visualizations",
                    description="Die Studierenden können Abbildungen und Datenvisualisierungen erstellen.",
                    description_en="Students can create figures and data visualizations.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Professionelle Software zur Berichtserstellung einsetzen",
                    title_en="Use professional software for report creation",
                    description="Die Studierenden können professionelle Software zur Erstellung von Berichten (inkl. Visualisierung) einsetzen.",
                    description_en="Students can use professional software to create reports (including visualizations).",
                ),
            ),
        ),
        # --- Masterarbeit (MA) ---
        SplitSpec(
            parent_short_key="ma_apply_methods_data_analysis",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Methoden zur Datenanalyse anwenden",
                    title_en="Apply methods for data analysis",
                    description="Die Studierenden können geeignete Methoden zur Analyse experimenteller oder theoretischer Daten anwenden.",
                    description_en="Students can apply suitable methods for analyzing experimental or theoretical data.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Daten auswerten",
                    title_en="Evaluate data",
                    description="Die Studierenden können experimentelle oder theoretische Daten auswerten.",
                    description_en="Students can evaluate experimental or theoretical data.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ma_contextualize_current_research_interdisciplinary",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Projekt im Kontext aktueller Forschung verorten",
                    title_en="Position the project within current research",
                    description="Die Studierenden können ihr Projekt im Kontext aktueller Forschung verorten.",
                    description_en="Students can position their project within current research.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Projekt kritisch bewerten",
                    title_en="Critically evaluate the project",
                    description="Die Studierenden können ihr Projekt kritisch bewerten.",
                    description_en="Students can critically evaluate their project.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Projekt interdisziplinär oder gesellschaftlich einordnen",
                    title_en="Classify the project in interdisciplinary or societal contexts",
                    description="Die Studierenden können ihr Projekt in interdisziplinäre oder gesellschaftliche Zusammenhänge einordnen.",
                    description_en="Students can classify their project in interdisciplinary or societal contexts.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ma_develop_research_questions",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Eigene Forschungsfragen entwickeln",
                    title_en="Develop own research questions",
                    description="Die Studierenden können eigene Forschungsfragen entwickeln.",
                    description_en="Students can develop their own research questions.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Forschungsfragen systematisch bearbeiten",
                    title_en="Work on research questions systematically",
                    description="Die Studierenden können eigene Forschungsfragen systematisch bearbeiten.",
                    description_en="Students can work on their research questions systematically.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ma_plan_execute_document_project",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Komplexes Projekt planen",
                    title_en="Plan a complex project",
                    description="Die Studierenden können ein komplexes wissenschaftliches Projekt selbstständig planen.",
                    description_en="Students can plan a complex scientific project independently.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Komplexes Projekt durchführen",
                    title_en="Conduct a complex project",
                    description="Die Studierenden können ein komplexes wissenschaftliches Projekt selbstständig durchführen.",
                    description_en="Students can conduct a complex scientific project independently.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Projekt dokumentieren",
                    title_en="Document the project",
                    description="Die Studierenden können ein komplexes wissenschaftliches Projekt dokumentieren.",
                    description_en="Students can document a complex scientific project.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ma_present_defend_disputation_context",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Ergebnisse in der Disputation vorstellen",
                    title_en="Present results in the disputation",
                    description="Die Studierenden können die Ergebnisse der Masterarbeit in einer Disputation vorstellen.",
                    description_en="Students can present the results of the master's thesis in a disputation.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Ergebnisse in der Disputation verteidigen",
                    title_en="Defend results in the disputation",
                    description="Die Studierenden können die Ergebnisse der Masterarbeit in einer Disputation verteidigen.",
                    description_en="Students can defend the results of the master's thesis in a disputation.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Größeren Kontext erläutern",
                    title_en="Explain the broader context",
                    description="Die Studierenden können in der Disputation den größeren Kontext der Masterarbeit erläutern.",
                    description_en="Students can explain the broader context of the master's thesis in the disputation.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ma_present_discuss_results_in_english",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Ergebnisse adressatengerecht präsentieren",
                    title_en="Present results to a specific audience",
                    description="Die Studierenden können Ergebnisse adressatengerecht präsentieren.",
                    description_en="Students can present results to a specific audience.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Ergebnisse wissenschaftlich diskutieren",
                    title_en="Discuss results scientifically",
                    description="Die Studierenden können Ergebnisse wissenschaftlich diskutieren.",
                    description_en="Students can discuss results scientifically.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Ergebnisse auf Englisch präsentieren und diskutieren",
                    title_en="Present and discuss results in English",
                    description="Die Studierenden können Ergebnisse insbesondere auch auf Englisch präsentieren und diskutieren.",
                    description_en="Students can present and discuss results in English.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ma_present_discuss_results_in_english_3",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Ergebnisse auf Englisch präsentieren",
                    title_en="Present results in English",
                    description="Die Studierenden können Ergebnisse auf Englisch präsentieren.",
                    description_en="Students can present results in English.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Ergebnisse auf Englisch diskutieren",
                    title_en="Discuss results in English",
                    description="Die Studierenden können Ergebnisse auf Englisch diskutieren.",
                    description_en="Students can discuss results in English.",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ma_write_structured_reflective_thesis_software",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Forschungsarbeit schriftlich strukturieren",
                    title_en="Structure the written research work",
                    description="Die Studierenden können ihre Forschungsarbeit schriftlich strukturieren.",
                    description_en="Students can structure their research work in writing.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Forschungsarbeit reflektiert darstellen",
                    title_en="Present the research work reflectively",
                    description="Die Studierenden können ihre Forschungsarbeit reflektiert darstellen.",
                    description_en="Students can present their research work reflectively.",
                ),
                ChildSpec(
                    suffix="3",
                    title="Arbeit mit geeigneter Software dokumentieren",
                    title_en="Document the work using suitable software",
                    description="Die Studierenden können ihre Forschungsarbeit mit geeigneter Software (z. B. LaTeX, Word, R, GraphPad) dokumentieren.",
                    description_en="Students can document their research work using suitable software (e.g., LaTeX, Word, R, GraphPad).",
                ),
            ),
        ),
        SplitSpec(
            parent_short_key="ma_write_thesis_english_abstract",
            parent_title=None,
            parent_title_en=None,
            parent_description=None,
            parent_description_en=None,
            children=(
                ChildSpec(
                    suffix="1",
                    title="Ergebnisse in der Masterarbeit dokumentieren",
                    title_en="Document results in the master's thesis",
                    description="Die Studierenden können Ergebnisse schriftlich in einer Masterarbeit dokumentieren.",
                    description_en="Students can document results in writing in a master's thesis.",
                ),
                ChildSpec(
                    suffix="2",
                    title="Englischsprachige Zusammenfassung erstellen",
                    title_en="Create an English summary",
                    description="Die Studierenden können eine englischsprachige Zusammenfassung erstellen.",
                    description_en="Students can create an English summary.",
                ),
            ),
        ),
    ]

    goals = data.get("goals", [])
    index_by_short_key = {g.get("shortKey"): i for i, g in enumerate(goals) if g.get("shortKey")}
    splits_sorted = sorted(splits, key=lambda s: index_by_short_key.get(s.parent_short_key, -1), reverse=True)

    for spec in splits_sorted:
        apply_split(data, spec)

    # Text-only cleanups (idempotent)
    for goal in data.get("goals", []):
        if goal.get("shortKey") == "frontii_literature_english_abstract_3":
            goal["title"] = "Englischsprachiges Abstract strukturiert zusammenfassen"
            goal["titleEn"] = "Summarize an English abstract in a structured way"

    target.write_text(json.dumps(data, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
