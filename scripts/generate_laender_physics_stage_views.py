#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Source-led Physics placement authoring over explicitly reviewed atomic roles.

Source year/phase assignments and prerequisite-driven learning places are
different facts. This replay preserves the former and logs every early demand.
Actual atomic requirements diagnose placements and grouped cycles. Only an
explicit pedagogical or source calendar policy declares whole-unit ``after``.
"""
import argparse
import copy
import hashlib
import json
import re
from functools import cache
from pathlib import Path

import generate_hessen_physics_stage_views as graph
from generate_physics_partial_orders import (partial_order as derive_partial_order,
    acquisition_placements, contextual_targets, course_seeds)

ROOT, DIRECTORY = graph.ROOT, graph.DIRECTORY
SCHEMA = graph.PARTIAL_ORDER_SCHEMA
MEMBERSHIPS = json.loads((Path(__file__).with_suffix(".memberships.json")).read_text())["views"]
CANONICAL_E_SEEDS = json.loads((Path(__file__).with_suffix(".memberships.json")).read_text())["canonicalAcceptedEAtomicGoalIds"]
SOURCE_PLAN = json.loads((Path(__file__).with_suffix(".sources.json")).read_text())
BY_EXTRACTION = "curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_PHYSIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json"
BY_MAPPING = "curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json"
SOURCE_PINS = {
    BY_EXTRACTION: "c6771966752d0bb257e1a0fcef7290b92f5eb60534c03458685f2dfc14f32ee7",
    BY_MAPPING: "94c8d020a35f4278a6095cfa66e1e482d85c1a1953a340dab721d1f63c1ea0e8",
}
SOURCE_PINS.update(SOURCE_PLAN["retainedSourcePins"])


def load_pinned(path):
    source = ROOT / path
    if hashlib.sha256(source.read_bytes()).hexdigest() != SOURCE_PINS[path]:
        raise ValueError("Physics placement source changed: " + path)
    return json.loads(source.read_text())


def partial_order(groups, atoms, fixed=()):
    return derive_partial_order(groups, atoms, graph.prerequisites, fixed)

class Author:
    def __init__(self, view):
        self.view = copy.deepcopy(view)
        self.before = graph.role_atoms(view)
        self.shifts = []
        self.order_evidence = []
        self.temporal_children = {}
        self.learning_basis = None
        self.active_learning_basis = None
        self.acquisition_evidence = []

    def atoms(self, node):
        if node.get("projectionRole") == "prerequisiteOnly":
            if node.get("acquisitionPlacement") is True and self.learning_basis is not None:
                return {node["goalId"]} & self.learning_basis
            return set()
        if node["kind"] == "structure":
            return set().union(*(self.atoms(child) for child in node["children"])) if node["children"] else set()
        identifier = node["goalId"]
        selected = self.before["target"] if self.active_learning_basis is None else self.before["target"] & self.active_learning_basis
        if node["kind"] == "goalEntry":
            return {identifier} & selected if not graph.GOALS[identifier].get("contains") else set()
        def descend(identifier):
            children = graph.GOALS[identifier].get("contains", [])
            return set().union(*(descend(child) for child in children)) if children else {identifier} & selected
        return descend(identifier)

    def find(self, identifier, nodes=None):
        for siblings in [self.view["rootNodes"] if nodes is None else nodes]:
            for index, node in enumerate(siblings):
                if node.get("id", node.get("goalId")) == identifier:
                    return siblings, index, node
                if node["kind"] == "structure":
                    found = self.find(identifier, node["children"])
                    if found:
                        return found
        return None

    def take(self, identifier, optional=False):
        found = self.find(identifier)
        if not found:
            if optional:
                return None
            raise ValueError("Missing Physics placement anchor " + identifier)
        siblings, index, _ = found
        return siblings.pop(index)

    def extract(self, identifier, nodes=None):
        siblings = self.view["rootNodes"] if nodes is None else nodes
        for index, node in enumerate(siblings):
            if identifier not in self.atoms(node):
                continue
            if node.get("goalId") == identifier and not graph.GOALS[identifier].get("contains"):
                return siblings.pop(index)
            if node["kind"] != "structure":
                original = copy.deepcopy(node)
                children = [{"kind": "canonicalSubtree", "goalId": child,
                             **({"projectionRole": node["projectionRole"]} if "projectionRole" in node else {})}
                            for child in graph.GOALS[node["goalId"]].get("contains", [])]
                node = graph.structure("physics-open-" + node["goalId"], node.get("displayLabel", graph.GOALS[node["goalId"]]["title"]), children)
                node["canonicalSourceGoalId"] = original["goalId"]
                node["originalCanonicalSubtree"] = original
                siblings[index] = node
            found = self.extract(identifier, node["children"])
            if found:
                return found
        return None

    def pull_earlier(self, groups, nodes=None):
        graph.pull_earlier(groups, self.atoms, lambda identifier: self.extract(identifier, nodes), self.shifts)

    def clean(self, nodes):
        result = []
        for node in nodes:
            if node["kind"] == "structure":
                node["children"] = self.clean(node["children"])
                if not node["children"]:
                    continue
            result.append(node)
        return result

    def thematic_orders(self, node, temporal_children=(), repair=True):
        if node["kind"] != "structure":
            return
        if temporal_children:
            self.temporal_children[node["id"]] = list(temporal_children)
        for child in node["children"]:
            self.thematic_orders(child, repair=repair)
        groups = [child for child in node["children"] if child["kind"] == "structure"]
        # Opening later requirements beside their first consumer prevents
        # coarsened section cycles without hiding any atomic dependency.
        if repair:
            try:
                graph.sort_tree(node["children"], self.atoms)
            except ValueError as error:
                if "Cyclic thematic grouping" not in str(error):
                    raise
                # A source section can span both sides of a loose preparation
                # atom. Give that atom an addressable acquisition group, then
                # move only actual required atoms across the coarsened cut.
                node["children"] = [graph.structure("physics-acquisition-" + child["goalId"],
                    "Grundlagen: " + graph.GOALS[child["goalId"]]["title"], [child])
                    if child["kind"] != "structure" and self.atoms(child) else child
                    for child in node["children"]]
                groups = [child for child in node["children"] if child["kind"] == "structure"]
                self.pull_earlier(groups, node["children"])
                for child in node["children"]:
                    self.thematic_orders(child, repair=True)
                graph.sort_tree(node["children"], self.atoms)
        node["children"] = self.clean(node["children"])
        groups = [child for child in node["children"] if child["kind"] == "structure"]
        if len(groups) < 2:
            node.pop("childOrder", None)
            return
        surviving = {group["id"] for group in groups}
        # Empty source/calendar units disappear during normalization; the
        # remaining calendar retains the same declared transitive sequence.
        temporal_children = [identifier for identifier in self.temporal_children.get(node["id"], []) if identifier in surviving]
        fixed = list(zip(temporal_children[1:], temporal_children[:-1]))
        _, candidates = partial_order(groups, self.atoms)
        # The source/subject topic groups are the selected planning units. Their
        # prerequisite-compatible progression is an intentional minimal hull;
        # no independent sibling is ordered merely because it appears later.
        node["childOrder"], witnesses = derive_partial_order(groups, self.atoms,
            lambda atom: set(graph.GOALS[atom].get("requires", [])), fixed)
        self.order_evidence.append({"parentId": node["id"], "declaredOrderPairs": witnesses,
                                    "planningPolicy": "coherent source topics and explicit practice units: complete necessary introductory units before dependent units; independent siblings remain parallel",
                                    "requirementOrderCandidates": candidates})

    def normalize_learning_places(self):
        def combine_same_identity(nodes):
            result, positions = [], {}
            for node in nodes:
                if node["kind"] == "structure":
                    node["children"] = combine_same_identity(node["children"])
                    identifier = node["id"]
                    if identifier in positions:
                        previous = result[positions[identifier]]
                        metadata = lambda n: {k: v for k, v in n.items() if k not in ("children", "childOrder")}
                        if metadata(previous) != metadata(node):
                            raise ValueError("Conflicting repeated authored Physics structure identity " + identifier)
                        previous["children"].extend(node["children"])
                        previous["children"] = combine_same_identity(previous["children"])
                        continue
                    positions[identifier] = len(result)
                result.append(node)
            return result
        self.view["rootNodes"] = combine_same_identity(self.view["rootNodes"])
        # Canonical contains is a DAG: overlapping semantic bundles can repeat
        # an atom. Give the reviewed atom one learning place before repairing
        # unit cuts, otherwise extracting the first copy can leave a later copy
        # behind and make an earlier-demand migration repeat indefinitely.
        def open_targets(nodes):
            result = []
            for node in nodes:
                if node["kind"] == "structure":
                    node["children"] = open_targets(node["children"])
                elif node["kind"] == "canonicalSubtree" and node.get("projectionRole") != "prerequisiteOnly" and graph.GOALS[node["goalId"]].get("contains") and self.atoms(node):
                    original = copy.deepcopy(node)
                    node = graph.structure("physics-open-" + original["goalId"], original.get("displayLabel", graph.GOALS[original["goalId"]]["title"]),
                        open_targets([{"kind": "canonicalSubtree", "goalId": c} for c in graph.GOALS[original["goalId"]]["contains"]]))
                    node.update({"canonicalSourceGoalId": original["goalId"], "originalCanonicalSubtree": original})
                result.append(node)
            return result
        self.view["rootNodes"] = open_targets(self.view["rootNodes"])
        preferred = {}
        for node in graph.walk(self.view["rootNodes"]):
            atom = node.get("goalId")
            if atom not in self.before["target"] or node.get("projectionRole") == "prerequisiteOnly" or graph.GOALS[atom].get("contains"):
                continue
            score = (node["kind"] == "goalEntry", "placementEvidence" in node, "displayLabel" in node)
            if atom not in preferred or score > preferred[atom][0]:
                preferred[atom] = (score, node)
        def unique(nodes):
            return [({**node, "children": unique(node["children"])} if node["kind"] == "structure" else node)
                for node in nodes if node["kind"] == "structure" or node.get("goalId") not in preferred
                or node.get("projectionRole") == "prerequisiteOnly" or preferred[node["goalId"]][1] is node]
        self.view["rootNodes"] = self.clean(unique(self.view["rootNodes"]))
    def finish(self):
        self.normalize_learning_places()
        self.learning_basis = self.before["target"] | {p for atom in self.before["target"] for p in graph.prerequisites(atom)}
        self.acquisition_evidence = acquisition_placements(self.view, graph.GOALS,
            self.before["target"], graph.prerequisites, graph.structure)
        for node in self.view["rootNodes"]:
            self.thematic_orders(node)
        self.view["rootNodes"] = self.clean(self.view["rootNodes"])
        after = graph.role_atoms(self.view)
        for identifier in sorted(self.before["prerequisiteOnly"] & after["target"]):
            self.find("physics-root")[2]["children"].append({"kind": "goalEntry", "goalId": identifier, "projectionRole": "prerequisiteOnly"})
        after = graph.role_atoms(self.view)
        if after["target"] != self.before["target"] or not self.before["prerequisiteOnly"] <= after["prerequisiteOnly"] or not (after["prerequisiteOnly"] - self.before["prerequisiteOnly"]) <= self.learning_basis:
            after = graph.role_atoms(self.view)
            raise ValueError("Physics atomic roles changed: " + str({role: (sorted(self.before[role] - after[role]), sorted(after[role] - self.before[role])) for role in self.before}))
        self.view["$schema"], self.view["viewFormatVersion"] = SCHEMA, "1.2"
        self.view.setdefault("language", "de")
        return self.view



def momentum_target_rows(view):
    """Admit exactly the reviewed stage/course routes, never a whole cluster."""
    state = view["scope"].get("jurisdiction", "DE").removeprefix("DE-")
    stage, profile = view["scope"]["stage"], view["scope"].get("courseProfile")
    return [row for row in SOURCE_PLAN["reviewedMomentumBindings"]["targets"]
            if row["state"] == state and stage in ("CrossStage", row["stage"])
            and (not row.get("courseProfiles") or profile in row["courseProfiles"])]


def energy_derivation_target_rows(view):
    """The accepted primary-source claim is HE/SL shared and SN LK only."""
    state = view["scope"].get("jurisdiction", "DE").removeprefix("DE-")
    stage, profile = view["scope"]["stage"], view["scope"].get("courseProfile")
    return [row for row in SOURCE_PLAN["reviewedEnergyDerivationBindings"]["targets"]
            if row["state"] == state and stage in ("CrossStage", row["stage"])
            and (not row.get("courseProfiles") or profile in row["courseProfiles"])]


def admit_energy_derivation_targets(view):
    view = copy.deepcopy(view)
    selected = graph.role_atoms(view)["target"]
    task_id = SOURCE_PLAN["reviewedEnergyDerivationBindings"]["assessmentGoalId"]
    for row in energy_derivation_target_rows(view):
        atom = row["goalId"]
        task = graph.GOALS[task_id]
        if (graph.GOALS[atom].get("contains") or task.get("contains")
                or task.get("requires") != [atom]
                or task.get("examData", {}).get("coveredGoalIds") != [atom]
                or task["examData"].get("reviewStatus") != "released"
                or not task["examData"].get("taskContent")):
            raise ValueError("Energy derivation admission lost its goal/ordinary assessment contract")
        for identifier in (atom, task_id):
            if identifier not in selected:
                view["rootNodes"].append({"kind": "goalEntry", "goalId": identifier})
    return view


def energy_derivation_source_plan(view, topics, candidates):
    """Additional current PDF evidence leaves retained source inputs exact."""
    records = energy_derivation_target_rows(view)
    task_id = SOURCE_PLAN["reviewedEnergyDerivationBindings"]["assessmentGoalId"]
    for row in records:
        actual = hashlib.sha256((ROOT / row["sourcePath"]).read_bytes()).hexdigest()
        if actual != row["sourceSha256"]:
            raise ValueError("Reviewed energy derivation primary source changed: " + row["sourcePath"])
        key = (row["unit"], row["topic"])
        passage = {k: row[k] for k in ("sourcePath", "sourceURL", "sourceSha256", "pages", "sourceText", "boundary", "basis", "currentEditionConfirmation") if k in row}
        passage.update({"canonicalGoalId": row["goalId"],
            "allocationBasis": "reviewed elementary operationalisation of the primary-source formula derivation"})
        topic = topics.setdefault(key, {"unit": tuple(row[k] for k in ("stage", "unit", "label", "order")),
            "label": row["topic"], "sourcePassages": []})
        topic["sourcePassages"].append(passage)
        topic["reviewedEnergyDerivationBinding"] = True
        candidates[row["goalId"]] = [(0, row["order"], key)]
        # The source mandates the competence. The released task is SkillPilot's
        # own material and receives no claim of official task authorship.
        candidates[task_id] = [(0, row["order"], key)]
    return records


def admit_momentum_targets(view):
    view = copy.deepcopy(view)
    selected = graph.role_atoms(view)["target"]
    for row in momentum_target_rows(view):
        atom = row["goalId"]
        if graph.GOALS[atom].get("contains"):
            raise ValueError("Reviewed momentum target must be atomic: " + atom)
        if atom not in selected:
            view["rootNodes"].append({"kind": "goalEntry", "goalId": atom})
    return view


def momentum_source_plan(view, topics, candidates):
    """Primary PDF decisions are additional to immutable retained mappings."""
    state = view["scope"]["jurisdiction"].removeprefix("DE-")
    records = momentum_target_rows(view)
    relocation = SOURCE_PLAN["reviewedMomentumBindings"]["derivationRelocations"].get(state)
    if relocation and relocation["goalId"] in graph.role_atoms(view)["target"]:
        records = [*records, {**relocation, "state": state, "ownPlacement": True}]
    for row in records:
        atom = row["goalId"]
        unit = (row["stage"], row["unit"], row["label"], row["order"])
        key = (row["unit"], row["topic"])
        if row.get("sourcePath"):
            actual = hashlib.sha256((ROOT / row["sourcePath"]).read_bytes()).hexdigest()
            if actual != row["sourceSha256"]:
                raise ValueError("Reviewed momentum primary source changed: " + row["sourcePath"])
        passage = {k: row[k] for k in ("sourcePath", "sourceURL", "sourceSha256", "pages", "boundary", "basis") if k in row}
        passage["canonicalGoalId"] = atom
        passage["allocationBasis"] = ("own prerequisite-compatible deepening; no official atom or time claim" if row.get("ownPlacement")
            else "reviewed elementary operationalisation of the complete primary-source performance")
        if key in topics and topics[key].get("reviewedMomentumBinding"):
            topics[key]["sourcePassages"].append(passage)
        else:
            topics[key] = {"unit": unit, "label": row["topic"], "sourcePassages": [passage], "reviewedMomentumBinding": True}
        # A deliberate full-atom review outranks an old broad cluster mapping.
        candidates[atom] = [(0, row["order"], key)]
    return records

def generate_bavaria(view):
    if view["scope"].get("jurisdiction") != "DE-BY":
        raise ValueError("Bavaria Physics authoring needs a DE-BY scope")
    view = admit_momentum_targets(view)
    source, mapping = load_pinned(BY_EXTRACTION), load_pinned(BY_MAPPING)
    author = Author(view)
    author.normalize_learning_places()
    root = author.find("physics-root")[2]
    # These reviewed acquisition assessments operationalise the Ph10.1 skills;
    # they belong to that learning field rather than a detached practice bin.
    ph10 = author.find("physics-by-ph10-1")
    if ph10:
        for identifier in ("b4175564-4397-5c08-90ba-4f13231a75ec", "e0932fef-9e1c-5c95-b00c-7589e76d0e83"):
            reference = author.take(identifier, optional=True)
            if reference is not None:
                ph10[2]["children"].append(reference)
    stages = [node for node in root["children"] if node.get("id") in ("physics-seki", "physics-sekii-gk", "physics-sekii-lk")]
    ordinary = {identifier for identifier in author.before["target"] if not graph.GOALS[identifier].get("examData")}
    needed_assessments = {required for identifier in ordinary for required in graph.prerequisites(identifier)}
    task_ids = {identifier for identifier in author.before["target"]
                if graph.GOALS[identifier].get("examData", {}).get("taskContent")
                and identifier not in ("b4175564-4397-5c08-90ba-4f13231a75ec", "e0932fef-9e1c-5c95-b00c-7589e76d0e83")
                and identifier not in needed_assessments}
    tasks = [author.extract(identifier) for identifier in sorted(task_ids,
             key=lambda identifier: (len(graph.prerequisites(identifier) & task_ids), identifier))]
    by_topic = {"physics-by-" + passage["topicCode"].lower().replace(".", "-"): passage for passage in source["passages"]}
    source_goals = {goal["id"]: goal for goal in source["sourceGoals"]}
    source_assignments = {}
    for record in mapping["mappings"]:
        goal = source_goals.get(record["legacyGoalId"])
        if goal:
            source_assignments.setdefault(record["canonicalGoalId"], set()).add(goal["topicCode"])
            expanded = canonical_atoms(record["canonicalGoalId"])
            if len(expanded) <= 60:
                for atom in expanded:
                    source_assignments.setdefault(atom, set()).add(goal["topicCode"])
    # Correct only this primary-source assignment, not the retained consumer's
    # target role or its earlier learning demand. An actual source year and an
    # acquisition location are separate facts.
    source_correction = SOURCE_PLAN["reviewedMomentumBindings"]["sourceAssignmentCorrections"]["BY"]
    source_assignments[source_correction["goalId"]] = {source_correction["sourceTopicCode"]}
    for momentum_row in momentum_target_rows(view):
        source_assignments[momentum_row["goalId"]] = {"Ph10.2"}
    years, source_places, retained_support = [], {}, []
    for stage in stages:
        # Reopen only our own year wrappers during replay.
        stage["children"] = [child for node in stage["children"] for child in
                             (node["children"] if node.get("id", "").startswith("physics-by-year-") else [node])]
        stage_years = {}
        for identifier, passage in by_topic.items():
            found = author.find(identifier, stage["children"])
            if not found:
                continue
            siblings, index, node = found
            siblings.pop(index)
            year = int(re.match(r"Ph(\d+)", passage["topicCode"])[1])
            title = re.sub(r"^.*?Lernbereich \d+:\s*", "", passage["title"])
            title = re.sub(r"\s*\([^)]*Std\.\)$", "", title)
            node["label"] = passage["topicCode"] + " " + title
            stage_years.setdefault(year, []).append(node)
            for atom in author.atoms(node):
                source_places.setdefault(atom, {"sourceTopicCodes": sorted(source_assignments.get(atom, {passage["topicCode"]})),
                                                 "sourceExtraction": BY_EXTRACTION})
        if not stage_years:
            raise ValueError("Bavaria stage has no retained source topic anchors")
        units = [graph.structure(f"physics-by-year-{year}", f"Jahrgangsstufe {year}" +
                                 (": Einführungsphase" if year == 11 else ": Qualifikationsphase" if year in (12, 13) else ""), children)
                 for year, children in sorted(stage_years.items())]
        year_of = {unit["id"]: int(unit["id"].rsplit("-", 1)[1]) for unit in units}
        # Existing supplements have no stronger placement authority than their
        # reviewed source topics or actual first consumer. Keep their payloads.
        leftovers = author.clean(stage["children"])
        stage["children"] = list(units)
        years.extend(units)
        for node in leftovers:
            atoms = author.atoms(node)
            if not atoms:
                retained_support.append(node)
                continue
            placements = [int(re.match(r"Ph(\d+)", code)[1]) for atom in atoms for code in source_assignments.get(atom, [])]
            default = min(placements) if placements else year_of[units[0]["id"]]
            destination = next((unit for unit in units if year_of[unit["id"]] >= default), units[-1])
            if node.get("id", "").startswith("physics-by-practice-") and node["id"].rsplit("-", 1)[1] != str(year_of[destination["id"]]):
                node["id"] = "physics-by-acquisition-assessments-" + str(year_of[destination["id"]]) + "-from-" + node["id"].rsplit("-", 1)[1]
                node["label"] = "Erwerbsaufgaben zur Vorbereitung"
            if node["kind"] != "structure" and not graph.GOALS[node["goalId"]]["title"].startswith("Lernkarten"):
                if graph.GOALS[node["goalId"]]["title"].startswith("Warum Physik"):
                    units[0]["children"].insert(0, node)
                    continue
                node = graph.structure("physics-by-additional-" + node["goalId"], "Übungen und Anwendungen", [node])
            destination["children"].append(node)
    if not years:
        raise ValueError("No applicable Bavaria year units")
    # The new IMP atom is an explicit Ph10.2 source target, rather than a
    # generic first-year supplement. Existing year and source bundles remain.
    for row in momentum_target_rows(view):
        reference = author.extract(row["goalId"])
        destination = author.find("physics-by-ph10-2")
        if reference is None or destination is None:
            raise ValueError("Missing reviewed Bavaria momentum source place")
        destination[2]["children"].append(reference)
        source_places[row["goalId"]] = {"sourceTopicCodes": ["Ph10.2"], "sourceExtraction": BY_EXTRACTION,
            "sourceURL": row["sourceURL"], "sourceSha256": row["sourceSha256"], "pages": row["pages"],
            "basis": "new full-atom primary-source operationalisation, not an inherited broad Ph8 mapping"}

    # A target outside the authored stages belongs beside its first consumer;
    # global support references remain support and stay outside temporal claims.
    external_targets = [node for node in author.view["rootNodes"] if node is not root and author.atoms(node)]
    author.view["rootNodes"] = [node for node in author.view["rootNodes"] if node not in external_targets]
    outside = [node for node in root["children"] if node not in stages] + external_targets
    root["children"] = [*stages, *retained_support]
    for node in outside:
        if not author.atoms(node):
            root["children"].append(node)
            continue
        source_years = [int(re.match(r"Ph(\d+)", code)[1]) for atom in author.atoms(node) for code in source_assignments.get(atom, [])]
        destination = next((year for year in years if int(year["id"].rsplit("-", 1)[1]) >= min(source_years)), years[-1]) if source_years else years[0]
        consumers = [index for index, unit in enumerate(years) if any(
            required in author.atoms(node) for atom in author.atoms(unit) for required in graph.prerequisites(atom))]
        if consumers:
            destination = years[min(consumers)]
        source_topics = ["physics-by-" + code.lower().replace(".", "-") for atom in author.atoms(node) for code in sorted(source_assignments.get(atom, []))]
        topic_destination = next((author.find(identifier, destination["children"])[2] for identifier in source_topics if author.find(identifier, destination["children"])), None)
        if topic_destination is not None:
            topic_destination["children"].append(node)
            continue
        if node["kind"] != "structure":
            node = graph.structure("physics-by-preparation-" + node["goalId"], "Notwendige Grundlagen", [node])
        destination["children"].append(node)
    author.pull_earlier(years)
    for stage in stages:
        units = [node for node in stage["children"] if node.get("id", "").startswith("physics-by-year-")]
        author.thematic_orders(stage, [unit["id"] for unit in units])
    author.thematic_orders(root, [stage["id"] for stage in stages])
    ownership = {atom: index for index, unit in enumerate(years) for atom in author.atoms(unit)}
    for task in tasks:
        identifier = task["goalId"]
        assessed = set(graph.GOALS[identifier].get("examData", {}).get("coveredGoalIds", []))
        index = max((ownership[required] for required in graph.prerequisites(identifier) | assessed if required in ownership), default=0)
        destination = years[index]
        practice_id = "physics-by-practice-" + destination["id"].rsplit("-", 1)[1]
        practice = next((node for node in destination["children"] if node.get("id") == practice_id), None)
        if practice is None:
            practice = graph.structure(practice_id, "Übungen und Prüfungsaufgaben", [])
            destination["children"].append(practice)
        practice["children"].append(task)
        ownership[identifier] = index
    author.order_evidence = []
    for stage in stages:
        units = [node for node in stage["children"] if node.get("id", "").startswith("physics-by-year-")]
        author.thematic_orders(stage, [unit["id"] for unit in units], repair=False)
    author.thematic_orders(root, [stage["id"] for stage in stages], repair=False)
    result = author.finish()
    report = {"source_temporal_granularity": "SekI: J8/J9/J10; SekII: J11 introduction, J12/J13 qualification; no invented semester allocation",
              "missing_exam_unit": "Existing BY target scopes contain no separate Abitur examination goals; adding an empty or invented examination unit would change the scope or mislabel existing practice.",
              "sources": [{"path": path, "sha256": digest} for path, digest in SOURCE_PINS.items()],
              "reviewedSourceAssignmentCorrections": [source_correction],
              "reviewedMomentumBindings": momentum_target_rows(view),
              "sourceAssignments": {
                  **{row["goalId"]: {"sourceTopicCodes": ["Ph10.2"], "sourceURL": row["sourceURL"],
                      "sourceSha256": row["sourceSha256"], "pages": row["pages"],
                      "basis": "new full-atom primary-source operationalisation, not an inherited broad Ph8 mapping"}
                      for row in momentum_target_rows(view)},
                  **({source_correction["goalId"]: {
                      "sourceTopicCodes": [source_correction["sourceTopicCode"]],
                      "sourceExtraction": BY_EXTRACTION, "sourceURL": source_correction["sourceURL"],
                      "sourceSha256": source_correction["sourceSha256"], "pages": source_correction["pages"]}}
                      if source_correction["goalId"] in author.before["target"] else {})},
              "sourceTopics": [{"compositionNodeId": identifier, "topicCode": passage["topicCode"],
                  "title": passage["title"], "page": passage.get("page"), "sourceExtraction": BY_EXTRACTION,
                  "temporalUnitId": "physics-by-year-" + re.match(r"Ph(\d+)", passage["topicCode"])[1]}
                  for identifier, passage in by_topic.items()],
              "earlierDemandPlacements": [{**shift, "retainedSourceAssignment": source_places.get(shift["goalId"], {
                  "sourceTopicCodes": sorted(source_assignments.get(shift["goalId"], [])), "sourceExtraction": BY_EXTRACTION,
                  "status": "own placement; no official temporal assignment claimed"})} for shift in author.shifts],
              "acquisitionTemplateWitnesses": author.acquisition_evidence,
              "partialOrders": author.order_evidence}
    return result, report


@cache
def canonical_atoms(identifier):
    children = graph.GOALS[identifier].get("contains", [])
    return set().union(*(canonical_atoms(child) for child in children)) if children else {identifier}


def source_unit(state, stage, passage):
    """Source temporal granularity, never a semester inferred from field order."""
    code, title = passage["topicCode"], passage["title"]
    if state == "BW":
        if stage == "SekI":
            return ("SekI", "j7-8", "Jahrgangsstufen 7/8", 7) if code.startswith("3.2.") else ("SekI", "j9-10", "Jahrgangsstufen 9/10", 9)
        return "SekII", "q11-12", "Kursstufe: Jahrgangsstufen 11/12", 111
    if state == "MV":
        if stage == "SekI":
            year = int(re.match(r"J(\d+)", code)[1])
            return ("SekII", "e10", "Einführungsphase: Jahrgangsstufe 10", 110) if year == 10 else ("SekI", f"j{year}", f"Jahrgangsstufe {year}", year)
        return "SekII", "q11-12", "Qualifikationsphase: Jahrgangsstufen 11/12", 111
    if state == "SN":
        year = int(re.search(r"(?:klassenstufe|jahrgangsstufe)-(\d+)", code)[1])
        return ("SekI", f"j{year}", f"Jahrgangsstufe {year}" + (" (zugleich Einführungsphase)" if year == 10 else ""), year) if stage == "SekI" else ("SekII", f"q{year}", f"Qualifikationsphase: Jahrgangsstufe {year}", 100 + year)
    if state == "ST":
        if stage == "SekII":
            return "SekII", "q11-12", "Qualifikationsphase: Jahrgangsstufen 11/12", 111
        if "-10-" in code:
            return "SekII", "e10", "Einführungsphase: Jahrgangsstufe 10", 110
        if "-7-8-" in code:
            return "SekI", "j7-8", "Schuljahrgänge 7/8", 7
        year = int(re.search(r"schuljahrgang-(\d+)", code)[1])
        return "SekI", f"j{year}", f"Schuljahrgang {year}", year
    if state == "TH":
        if stage == "SekI":
            return ("SekI", "j7-8", "Klassenstufen 7/8", 7) if code.startswith("TH-2-1-") else ("SekI", "j9-10", "Klassenstufen 9/10", 9)
        if code.startswith("TH-3-"):
            return None  # E11 is explicitly a different school/access route.
        return "SekII", "q11-12", "Qualifikationsphase: Jahrgangsstufen 11/12", 111
    if state == "HB":
        if stage == "SekI":
            return ("SekI", "bis-j8", "Bis Ende Jahrgangsstufe 8", 8) if code.startswith("3.1-") else ("SekI", "j9", "Jahrgangsstufe 9", 9)
        return ("SekII", "e", "Einführungsphase", 110) if code.startswith("3.1-") else ("SekII", "q", "Qualifikationsphase", 111)
    if state == "HH":
        if stage == "SekI":
            return "SekI", "j7-10", "Jahrgangsstufen 7–10", 7
        return "SekII", "studienstufe", "Studienstufe", 111
    if state == "SL":
        if stage == "SekI":
            year = int(re.search(r"SEKI-(\d+)-", code)[1])
            return "SekI", f"j{year}", f"Klassenstufe {year}" + (" (NW-Zweig)" if "-NW-" in code else ""), year
        return ("SekII", "e", "Einführungsphase", 110) if "-EP-" in code else ("SekII", "hauptphase", "Hauptphase", 111)
    if state in ("BE", "BB"):
        if code.startswith("3.1.") or code.startswith("2."):
            return None  # No generic Gymnasium E11 or time claim for taxonomies.
        return "SekII", "q", "Qualifikationsphase", 111
    if state == "NI":
        if code.startswith("3.1-"):
            return None
        return ("SekII", "e", "Einführungsphase", 110) if code.startswith("3.2-") else ("SekII", "q", "Qualifikationsphase", 111)
    if state == "NW":
        return ("SekII", "e", "Einführungsphase", 110) if code.startswith("EF-") else ("SekII", "q", "Qualifikationsphase", 111)
    if state == "RP":
        return ("SekII", "e", "Einführungsphase", 110) if code.startswith("INTRO-") else ("SekII", "q", "Qualifikationsphase (Mainzer Studienstufe)", 111)
    if state == "SH":
        return ("SekII", "e", "Einführungsphase", 110) if code.startswith("2.3.1-") else ("SekII", "q", "Qualifikationsphase", 111)
    raise ValueError("No reviewed Physics source granularity for " + state)


def source_topic_title(state, passage, pdf_pages, extraction_path):
    title = passage["title"]
    if state == "SL":
        path = ROOT / passage["sourcePath"]
        if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest() != SOURCE_PINS[passage["sourcePath"]]:
            raise ValueError("Supplied SL source working copy changed")
        return SOURCE_PLAN["sourceTopicTitleOverrides"][extraction_path + "::" + passage["topicCode"]]
    title = re.sub(r"^.*?(?:Klassenstufe \d+|Schuljahrg(?:ang|änge) \d+(?:/\d+)?(?: Einführungsphase)?|Jahrgangsstufe \d+ (?:Grundkurs|Leistungskurs)):\s*", "", title)
    title = re.sub(r"^.*?(?:Einführungsphase|Qualifikationsphase(?: (?:Grundkurs|Leistungskurs))?):\s*", "", title)
    title = re.sub(r"\s*/\s*(?:Sachkompetenz|Erkenntnisgewinnungskompetenz|Bewertungskompetenz)$", "", title)
    title = re.sub(r"^\S+\s+", "", title) if title.startswith(passage["topicCode"] + " ") else title
    if state == "TH" and passage["topicCode"].startswith("TH-4-3-"):
        return "Spezielle Relativitätstheorie"
    return title


def retained_source_plan(state, profile):
    topics, candidates, sources, pdf_pages = {}, {}, [], {}
    for path in sorted((ROOT / "curricula/DE/Gymnasium/input" / state).glob("**/*PHYSIK*.source-extraction.json")):
        extraction = load_pinned(str(path.relative_to(ROOT)))
        if extraction.get("stage") not in ("SekI", "SekII"):
            continue
        mapping_paths = [mapping for mapping in (ROOT / "curricula/DE/Gymnasium/mapping" / ("DE-" + state)).glob("**/*source_extraction*.review.json")
                         if json.loads(mapping.read_text()).get("sourceExtractionPath") == str(path.relative_to(ROOT))]
        if len(mapping_paths) != 1:
            raise ValueError("Missing or ambiguous Physics source review for " + str(path))
        mapping = load_pinned(str(mapping_paths[0].relative_to(ROOT)))
        sources.extend({"path": str(p.relative_to(ROOT)), "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
                       for p in (path, mapping_paths[0]))
        passage_by_code = {passage["topicCode"]: passage for passage in extraction["passages"]}
        goals = {goal["id"]: goal for goal in extraction["sourceGoals"]}
        for record in mapping["mappings"]:
            source_goal = goals.get(record["legacyGoalId"])
            if source_goal is None or source_goal.get("courseLevel") not in (None, "unspecified", "GK_LK", profile):
                continue
            passage = passage_by_code[source_goal["topicCode"]]
            unit = source_unit(state, extraction["stage"], passage)
            if unit is None:
                continue
            title = source_topic_title(state, passage, pdf_pages, str(path.relative_to(ROOT)))
            unit_stage, unit_id, unit_label, ordinal = unit
            topic_key = (unit_id, title)
            topics.setdefault(topic_key, {"unit": unit, "label": title, "sourcePassages": []})["sourcePassages"].append({
                "sourceExtraction": str(path.relative_to(ROOT)), "topicCode": passage["topicCode"], "page": passage.get("page"),
                "sourceGoalId": source_goal["id"], "matchType": record.get("matchType")})
            identifier = record["canonicalGoalId"]
            if identifier not in graph.GOALS:
                raise ValueError("Unresolved source mapping goal " + identifier)
            expanded = canonical_atoms(identifier)
            if len(expanded) > 60:
                continue  # A root-level partial bridge cannot assign every atom to one source field.
            for atom in expanded:
                candidates.setdefault(atom, []).append((len(expanded), ordinal, topic_key))
    return topics, candidates, sources


def online_lower_plan(view):
    """Reviewed thematic allocation to the primary source's actual bands.

    These are placement judgements over the existing lower seed scope, not
    newly asserted official atom-to-source mappings. Source passages and the
    separate earlier-demand log retain that distinction.
    """
    state = view["scope"]["jurisdiction"].removeprefix("DE-")
    if state not in ("BE", "BB", "NI", "NW", "RP", "SH") or view["scope"]["stage"] != "CrossStage":
        return {}, {}, []
    seeds = set(MEMBERSHIPS[view["viewId"]]["sourceSelectedLowerAtomicGoalIds"])
    families = {}
    family_roots = {
        "mechanics": "9645f0d8-43a3-5f29-873c-daa5ace638db", "light": "051cedc5-d380-4716-9751-b18f2e67a912",
        "pressure": "84096c02-0767-4725-8956-37ce7e4b9bbf", "colors": "48fb4a0b-62a0-4c8f-9792-3aeef6316885",
        "sound": "41fd5575-b1a6-40e7-8ea2-66b75a597a79", "optics": "84b1bc70-dadf-449b-a8d4-8bcee1da1fea",
        "electricity": "4924d83e-5e4b-4819-9d70-86cda3496195", "heat": "2d3d42ae-492b-4795-a22f-eeca03aaed38",
    }
    for family, identifier in family_roots.items():
        families.update({atom: family for atom in canonical_atoms(identifier) & seeds})
    # Existing source-backed supplement names supply a topic family only.
    for atom in seeds - families.keys():
        title = graph.GOALS[atom]["title"].lower()
        families[atom] = ("nuclear" if re.search(r"atom|kern|radioaktiv|zerfall|ionisier", title)
            else "electricity" if re.search(r"strom|spannung|ladung|widerstand|elektr|magnet|schaltung", title)
            else "heat" if re.search(r"wärme|temperatur|teilchenmodell|thermisch", title)
            else "mechanics" if re.search(r"kraft|beweg|energie|leistung|wirkungsgrad|arbeit", title)
            else "methods")
    source_id = {"BE": "BE-BB-2015", "BB": "BE-BB-2015", "NI": "NI-2015", "NW": "NW-G9-2019", "RP": "RP-G9", "SH": "SH-2026"}[state]
    source = SOURCE_PLAN["onlinePrimarySources"][source_id]
    pages = {"BE": [27, 29], "BB": [27, 29], "NI": [26, 27, 28, 29], "NW": [10, 20, 30], "RP": [192, 193, 194, 207], "SH": [38]}[state]
    topics, candidates = {}, {}
    for atom, family in sorted(families.items()):
        title = graph.GOALS[atom]["title"].lower()
        if state in ("BE", "BB"):
            early = family in ("heat", "electricity", "methods", "pressure") or (family == "mechanics" and not re.search(r"geschwindigkeit|beschleunigt|bewegung.*diagramm", title))
            unit = ("SekI", "j7-8" if early else "j9-10", "Doppeljahrgangsstufe 7/8" if early else "Doppeljahrgangsstufe 9/10", 7 if early else 9)
        elif state == "NI":
            year = 5 if family in ("light", "colors", "optics", "methods") or (family == "electricity" and not re.search(r"spannung|widerstand|leistung|induktion|ladung|reihe|parallel", title)) else 9 if family in ("heat", "nuclear") else 7
            unit = ("SekI", f"j{year}-{year+1}", f"Doppeljahrgang {year}/{year+1}", year)
        elif state == "NW":
            early = family in ("light", "colors", "sound", "heat", "methods") or (family == "electricity" and not re.search(r"spannung|widerstand|leistung|induktion|ladung|reihe|parallel", title))
            unit = ("SekI", "erprobung" if early else "weitere", "Erprobungsstufe (Jahrgangsstufen 5/6)" if early else "Weitere Sekundarstufe I", 5 if early else 7)
        elif state == "RP":
            year = 1 if family in ("sound", "light", "colors", "optics", "pressure", "methods") or (family == "mechanics" and not re.search(r"energie|leistung|wirkungsgrad|arbeit", title)) or (family == "heat" and re.search(r"temperatur|ausdehn|teilchen", title)) else 3 if family == "mechanics" or (family == "electricity" and re.search(r"widerstand|reihe|parallel|kennlinie", title)) else 2
            unit = ("SekI", f"lern{year}", f"{year}. Lernjahr: Themenfelder {1+4*(year-1)}–{4*year}", year)
        else:
            early = family in ("light", "pressure", "methods") or (family == "electricity" and not re.search(r"spannung|stromstärke|widerstand|leistung|induktion|ladung|reihe|parallel", title)) or (family == "mechanics" and not re.search(r"beschleunig|newton|energie.*berechn|leistung|arbeit", title)) or (family == "heat" and not re.search(r"wärmekapaz|wärmemenge|berechn", title))
            unit = ("SekI", "block1" if early else "block2", "Block I" if early else "Block II", 1 if early else 2)
        label = {"mechanics": "Mechanische Grundlagen", "light": "Lichtausbreitung und Reflexion", "pressure": "Druck und Auftrieb", "colors": "Farben und Spektrum", "sound": "Schall und Schwingungen", "optics": "Optische Abbildungen", "electricity": "Elektrizität und Magnetismus", "heat": "Wärme und Teilchenmodell", "nuclear": "Atombau und ionisierende Strahlung", "methods": "Denk- und Arbeitsweisen"}[family]
        key = (unit[1], label)
        topics.setdefault(key, {"unit": unit, "label": label, "sourcePassages": [{"sourceURL": source["url"], "sourceSha256": source["sha256"], "pages": pages,
            "allocationBasis": "reviewed thematic learning placement over retained lower source scope; no official atom mapping claimed"}]})
        candidates[atom] = [(1, unit[3], key)]
    return topics, candidates, [{"url": source["url"], "sha256": source["sha256"], "sourceTemporalPages": pages}]


def reviewed_lower_source_decisions(state, topics, candidates):
    """Reject only new full-atom claims that the primary-source review disproved.

    Existing lower seeds are an independent retained scope authority. A real
    acquisition requirement stays in L even when it is not an official seed.
    """
    decisions = SOURCE_PLAN.get("reviewedLowerSourceMembership", {}).get("decisions", {}).get(state, {})
    original_lower = set().union(*(set(row["sourceSelectedLowerAtomicGoalIds"])
        for view_id, row in MEMBERSHIPS.items() if view_id.startswith("de-" + state.lower() + "-")))
    for atom, decision in decisions.items():
        if atom in original_lower:
            raise ValueError("A new-supplement review cannot exclude an original lower seed: " + atom)
        if decision.get("action") != "excludeNewLowerSeed" or atom not in graph.GOALS:
            raise ValueError("Invalid reviewed lower-source decision: " + atom)
        if decision["canonicalDescription"] != graph.GOALS[atom]["description"]:
            raise ValueError("Reviewed lower-source atom wording changed: " + atom)
        if "sourceTemporalUnit" in decision:
            spec = decision["sourceTemporalUnit"]
            unit = tuple(spec[key] for key in ("stage", "unit", "label", "order"))
            choices = candidates.get(atom, [])
            matching = [choice for choice in choices if any(p.get("sourceGoalId") in decision["sourceGoalIds"]
                for p in topics[choice[2]]["sourcePassages"])]
            if not matching:
                raise ValueError("Reviewed temporal correction has no retained mapping witness: " + atom)
            origin = topics[min(matching)[2]]
            key = (unit[1], origin["label"])
            topics.setdefault(key, {"unit": unit, "label": origin["label"],
                "sourcePassages": copy.deepcopy(origin["sourcePassages"]),
                "reviewedTemporalBoundary": {"goalId": atom, **decision}})
            candidates[atom].append((1, unit[3], key))
    return decisions


def reviewed_cross_stage_tasks(view, state):
    """Expose an explicitly authorised new own task, never new competencies."""
    if view["scope"]["stage"] != "CrossStage":
        return view, []
    view = copy.deepcopy(view)
    selected = graph.role_atoms(view)["target"]
    bindings = {**SOURCE_PLAN.get("reviewedLowerAssessmentBindings", {}).get(state, {}).get("assessments", {}),
        **SOURCE_PLAN.get("reviewedCrossStageAssessmentExposures", {}).get(state, {})}
    added = []
    for atom, binding in bindings.items():
        if binding.get("ensureCrossStageExposure") is not True:
            continue
        if binding.get("courseProfiles") and view["scope"].get("courseProfile") not in binding["courseProfiles"]:
            continue
        goal = graph.GOALS[atom]
        if state != "DE" and not reviewed_conditional_assessment(goal, state):
            raise ValueError("Explicit own task exposure leaves its reviewed offering: " + atom)
        if (goal.get("contains") or goal.get("examData", {}).get("reviewStatus") != "released"
                or goal.get("requires", []) != binding["requires"]
                or goal["examData"].get("coveredGoalIds", []) != binding["coveredGoalIds"]):
            raise ValueError("Explicit own task exposure lost its reviewed contract: " + atom)
        if binding.get("exposureRole") == "prerequisiteOnly":
            if atom not in graph.role_atoms(view)["prerequisiteOnly"]:
                root = next(node for node in view["rootNodes"] if node.get("id") == "physics-root")
                root["children"].append({"kind": "goalEntry", "goalId": atom, "projectionRole": "prerequisiteOnly"})
            continue  # Inventory reference only: never create S, L or a learning placement.
        base = selected - {atom}
        learning = base | {required for seed in base for required in graph.prerequisites(seed)}
        assessed_basis = learning if binding.get("existingPreparationBasis") is True else base
        if not set(binding["coveredGoalIds"]) <= assessed_basis or not graph.prerequisites(atom) <= learning:
            raise ValueError("Own task exposure cannot import a new source competency: " + atom)
        if atom not in selected:
            def place_with_covered(nodes):
                for index, node in enumerate(nodes):
                    if node["kind"] == "structure":
                        if place_with_covered(node["children"]):
                            return True
                    elif "goalId" in node and (node.get("projectionRole") != "prerequisiteOnly"
                            or (binding.get("existingPreparationBasis") is True and node.get("acquisitionPlacement") is True)):
                        if set(binding["coveredGoalIds"]) <= canonical_atoms(node["goalId"]):
                            nodes.insert(index + 1, {"kind": "goalEntry", "goalId": atom})
                            return True
                return False
            if not place_with_covered(view["rootNodes"]):
                raise ValueError("Own task exposure has no existing assessed target placement: " + atom)
        added.append(atom)
    return view, added


def reviewed_conditional_assessment(goal, state):
    extended = goal.get("extendedData", {})
    if extended.get("applicabilityFromRequires") is True:
        return True
    offered = extended.get("applicabilityOverrides", {}).get("jurisdiction")
    return (extended.get("applicabilityMappingInheritance") == "boundary" and isinstance(offered, list)
        and offered == goal.get("applicability", {}).get("jurisdiction") and "DE-" + state.upper() in offered)


def regular_source_default(ordered_specs, topics, stage):
    applicable = [spec for spec in ordered_specs if spec[0] == stage] or ordered_specs
    established = [spec for spec in applicable if any(topic["unit"][1] == spec[1]
        and "reviewedTemporalBoundary" not in topic for topic in topics.values())]
    return (established or applicable)[0][1]



def momentum_preparation_sibling(author, state):
    """Give new mechanics content an honest heading before its old consumer.

    Existing target places, calendar bands and source obligations stay exact.
    A prerequisite demand never certifies the nuclear/relativity source topic.
    """
    imp = "53afbda1-5776-502b-8867-471975d7b766"
    if state not in ("SL", "SN") or imp not in author.before["target"]:
        return author.view, []
    row = next(r for r in momentum_target_rows(author.view) if r["goalId"] == imp)
    def target_paths(nodes, trail=()):
        found = {}
        for node in nodes:
            if node["kind"] == "structure":
                found.update(target_paths(node["children"], (*trail, node["id"])))
            elif node.get("projectionRole") != "prerequisiteOnly" and node.get("goalId") in author.before["target"]:
                found[node["goalId"]] = trail
        return found
    def reference_places(nodes, trail=()):
        found = {}
        for node in nodes:
            if node["kind"] == "structure":
                for atom, places in reference_places(node["children"], (*trail, node["id"])).items():
                    found.setdefault(atom, []).extend(places)
            else:
                found.setdefault(node["goalId"], []).append((trail, node["kind"],
                    node.get("projectionRole", "target"), node.get("acquisitionPlacement") is True))
        return found
    before = target_paths(author.view["rootNodes"])
    before_references = reference_places(author.view["rootNodes"])
    reference = author.extract(imp)
    parent = author.find(f"physics-{state.lower()}-unit-{row['unit']}")
    if reference is None or parent is None:
        raise ValueError("Missing source-stage momentum preparation place")
    identifier = f"physics-{state.lower()}-{row['unit']}-momentum-preparation"
    orientation = "5c44b9ba-9b05-4774-95d5-073230d3fc4f"
    shared_entry = state == "SL" and author.view["scope"]["stage"] == "SekII"
    children = [reference]
    if shared_entry:
        # The existing broad WHY orientation and IMP need a shared first place;
        # leaving WHY in the old nuclear wrapper creates a coarse unit cycle.
        if orientation not in author.before["target"] or orientation not in graph.GOALS[imp].get("requires", []):
            raise ValueError("Shared mechanics entry lost its actual orientation prerequisite")
        intro = author.extract(orientation)
        if intro is None:
            raise ValueError("Missing existing subject orientation")
        children.insert(0, intro)
    label = "Einstieg und mechanische Grundlagen" if shared_entry else "Mechanische Grundlage: Impulse zweier Körper"
    parent[2]["children"].insert(0, graph.structure(identifier, label, children))
    # Reuse the final course projection's operative learning basis. Replaying
    # the raw union normalizer here would import filtered LK calendar places.
    operative = course_seeds(author.before["target"], graph.GOALS, author.view["scope"])
    learning = operative | {p for atom in operative for p in graph.prerequisites(atom)}
    author.active_learning_basis = author.learning_basis = learning
    # L and all canonical requirements are unchanged. Preserve every existing
    # acquisition place; rebuilding it here would flatten unrelated wrappers.
    for parent_node in graph.walk(author.view["rootNodes"]):
        if parent_node["kind"] != "structure":
            continue
        children = [n for n in parent_node["children"] if n["kind"] == "structure"]
        temporal = [n["id"] for n in children if n["id"] in ("physics-seki", "physics-bw-seki", "physics-bw-sekii")
            or n["id"].startswith("physics-sekii-")] if parent_node["id"] == "physics-root" else [n["id"] for n in children
            if re.search(r"(?:-unit-|-year-|-seki-j)", n["id"]) or n["id"] in
            ("physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4", "physics-abitur")]
        if temporal:
            author.temporal_children[parent_node["id"]] = temporal
    for root_node in author.view["rootNodes"]:
        author.thematic_orders(root_node)
    author.view["rootNodes"] = author.clean(author.view["rootNodes"])
    result = author.view
    after = target_paths(result["rootNodes"])
    allowed = {imp, orientation} if shared_entry else {imp}
    if {k:v for k,v in before.items() if k not in allowed} != {k:v for k,v in after.items() if k not in allowed}:
        raise ValueError("New momentum heading moved an established subject target")
    after_references = reference_places(result["rootNodes"])
    if {k:v for k,v in before_references.items() if k not in allowed} != {k:v for k,v in after_references.items() if k not in allowed}:
        raise ValueError("New momentum heading moved an existing target or acquisition reference")
    if shared_entry and (before[orientation][:3] != after[orientation][:3] or after[orientation][-1] != identifier):
        raise ValueError("Shared mechanics orientation changed its calendar place")
    if after[imp][-1] != identifier:
        raise ValueError("New momentum preparation could not keep its own mechanics heading")
    consumers = sorted(atom for atom in author.before["target"] if imp in graph.GOALS[atom].get("requires", []))
    if not consumers:
        raise ValueError("Own momentum preparation has no actual learning demand")
    return result, [{"goalId": imp, "sourceTemporalUnit": row["unit"],
        "sourceTopic": row["topic"], "from": list(before[imp]), "to": list(after[imp]),
        "directConsumerGoalIds": consumers,
        "allOtherTargetAndAcquisitionReferencePlacesUnchanged": True,
        "reparentedExistingOrientation": [{"goalId": orientation, "from": list(before[orientation]), "to": list(after[orientation]),
            "basis": "existing broad subject orientation shares an honest entry heading with IMP; role, year and learning results unchanged"}] if shared_entry else [],
        "basis": "own mechanics preparation before actual consumers in the same source temporal unit; no official nuclear/relativity source claim and no established subject competency moved"}]

def generate_source_land(view):
    """Rebuild only placements over the exact selected atomic scope.

    Retained mappings choose the source topic at its documented granularity;
    unmatched existing scope remains an explicitly own supplementary placement.
    """
    state = view["scope"]["jurisdiction"].removeprefix("DE-")
    view = admit_momentum_targets(view)
    view = admit_energy_derivation_targets(view)
    view, own_new_tasks = reviewed_cross_stage_tasks(view, state)
    profile = view["scope"].get("courseProfile", "GK")
    topics, candidates, sources = retained_source_plan(state, profile)
    lower_topics, lower_candidates, lower_sources = online_lower_plan(view)
    topics.update(lower_topics)
    for atom, choices in lower_candidates.items():
        candidates.setdefault(atom, []).extend(choices)
    sources.extend(lower_sources)
    momentum_bindings = momentum_source_plan(view, topics, candidates)
    energy_derivation_bindings = energy_derivation_source_plan(view, topics, candidates)
    reviewed_lower = reviewed_lower_source_decisions(state, topics, candidates)
    if not topics:
        raise ValueError("No source-bound Physics temporal plan for " + state)
    author = Author(view)
    selected = set(author.before["target"])
    original_stage = {}
    for node in graph.walk(view["rootNodes"]):
        if node.get("id") in ("physics-seki", "physics-bw-seki"):
            original_stage.update({atom: "SekI" for atom in author.atoms(node)})
        elif node.get("id", "").startswith("physics-sekii-") or node.get("id") == "physics-bw-sekii":
            original_stage.update({atom: "SekII" for atom in author.atoms(node)})
    scope_stage = view["scope"]["stage"]
    if scope_stage == "CrossStage":
        membership = MEMBERSHIPS.get(view["viewId"])
        if membership is None:
            raise ValueError("Missing pre-normalization lower source membership for " + view["viewId"])
        lower_seeds = set(membership["sourceSelectedLowerAtomicGoalIds"])
        original_stage = {atom: "SekI" if atom in lower_seeds else "SekII" for atom in selected}
    unit_specs = {topic["unit"][1]: topic["unit"] for topic in topics.values()
                  if scope_stage == "CrossStage" or topic["unit"][0] == scope_stage}
    if not unit_specs:
        raise ValueError("No applicable source temporal unit for " + view["viewId"])
    ordered_specs = sorted(unit_specs.values(), key=lambda unit: (unit[3], unit[1]))
    source_lower_seeds = set(MEMBERSHIPS.get(view["viewId"], {}).get("sourceSelectedLowerAtomicGoalIds", [])) & selected
    direct_lower = {atom for atom, choices in candidates.items() if atom in selected and any(
        size == 1 and topics[choice]["unit"][0] == "SekI" for size, _, choice in choices)} - reviewed_lower.keys()
    explicit_e10 = {atom for atom, choices in candidates.items() if atom in selected and any(
        size == 1 and topics[choice]["unit"][1] == "e10" and any("/lower-secondary/" in passage["sourceExtraction"]
        for passage in topics[choice]["sourcePassages"]) for size, _, choice in choices)} - direct_lower
    source_lower_seeds = (source_lower_seeds | direct_lower) - explicit_e10
    # Own assessment admission is evaluated separately by lower_excerpt over
    # the unchanged source competency basis. In particular an LK-only task
    # must not make the course-neutral lower source membership differ by GK/LK.
    chosen = {}
    for atom in selected:
        available = [choice for choice in candidates.get(atom, []) if choice[2][0] in unit_specs]
        if scope_stage == "CrossStage":
            source_stage = "SekI" if atom in source_lower_seeds else "SekII"
            # A partial bridge to a broad canonical bundle is not authority
            # to turn every upper atom in that bundle into lower content.
            available = [choice for choice in available if topics[choice[2]]["unit"][0] == source_stage]
            original_stage[atom] = source_stage
        if available:
            chosen[atom] = min(available)[2]
    assignments = {atom: {"sourceUnit": topics[choice]["unit"][1], "sourcePassages": topics[choice]["sourcePassages"]}
                   for atom, choice in chosen.items()}
    ordinary = {atom for atom in selected if not graph.GOALS[atom].get("examData")}
    required_assessments = {required for atom in ordinary for required in graph.prerequisites(atom)}
    practice_ids = {atom for atom in selected if graph.GOALS[atom].get("examData", {}).get("taskContent")
                    and atom not in required_assessments}
    exam_atoms = selected & (canonical_atoms("61684ca7-b725-534f-944b-c7645cea1792")
                             | canonical_atoms("79028c45-90ae-57eb-8016-f5a96af18fa2"))
    practice_ids -= exam_atoms
    references = {atom: author.extract(atom) for atom in sorted(selected)}
    if any(reference is None for reference in references.values()):
        raise ValueError("Cannot materialize the exact selected Physics atomic scope")
    # Remaining non-target references retain their payload and support role.
    residual = [copy.deepcopy(node) for node in graph.walk(author.view["rootNodes"])
                if node["kind"] != "structure" and not author.atoms(node)]
    opaque = [node for node in residual if node.get("projectionRole") != "prerequisiteOnly"]
    support = [node for node in residual if node.get("projectionRole") == "prerequisiteOnly"]
    root = graph.structure("physics-root", "Physik", [])
    author.view["rootNodes"] = [root]
    stages, units = {}, {}
    for stage in ("SekI", "SekII"):
        specs = [spec for spec in ordered_specs if spec[0] == stage]
        if not specs:
            continue
        stage_id = ("physics-bw-seki" if stage == "SekI" else "physics-bw-sekii") if state == "BW" else "physics-seki" if stage == "SekI" else "physics-sekii-" + profile.lower()
        stage_node = graph.structure(stage_id, "Sekundarstufe I" if stage == "SekI" else "Sekundarstufe II (" + profile + ")", [])
        stages[stage] = stage_node
        root["children"].append(stage_node)
        for spec in specs:
            unit = graph.structure(f"physics-{state.lower()}-unit-{spec[1]}", spec[2], [])
            units[spec[1]] = unit
            stage_node["children"].append(unit)
    topic_nodes, supplements, optional_units = {}, {}, {}
    optional_policy = SOURCE_PLAN.get("reviewedLowerSourceMembership", {}).get("retainedOptionalExtensions", {}).get(state, {})
    def content_reference(atom):
        if atom not in optional_policy:
            return references[atom]
        node = graph.structure("physics-" + state.lower() + "-optional-" + atom,
            optional_policy[atom]["visibleUnitLabel"], [references[atom]])
        optional_units[atom] = node
        return node
    own_assignments = []
    for atom in sorted(selected - practice_ids - exam_atoms):
        choice = chosen.get(atom)
        if choice:
            unit_id, label = choice
            topic = topics[choice]
            node_id = f"physics-{state.lower()}-{unit_id}-topic-" + hashlib.sha256(label.encode()).hexdigest()[:12]
            if choice not in topic_nodes:
                topic_nodes[choice] = graph.structure(node_id, label, [])
                units[unit_id]["children"].append(topic_nodes[choice])
            topic_nodes[choice]["children"].append(content_reference(atom))
        else:
            stage = original_stage.get(atom, scope_stage if scope_stage != "CrossStage" else "SekI")
            # An atom-specific stage correction is authority for that atom,
            # never a new default for every otherwise unmapped supplement.
            unit_id = regular_source_default(ordered_specs, topics, stage)
            if unit_id not in supplements:
                supplements[unit_id] = graph.structure(f"physics-{state.lower()}-{unit_id}-supplements", "Ergänzende Themen und Grundlagen", [])
                units[unit_id]["children"].append(supplements[unit_id])
            supplements[unit_id]["children"].append(content_reference(atom))
            own_assignments.append({"goalId": atom, "learningUnit": unit_id,
                                    "status": "own placement over the unchanged selected scope; no official atomic source/time claim"})
    ordered_units = [units[spec[1]] for spec in ordered_specs]
    for node in opaque:
        if node not in ordered_units[0]["children"]:
            ordered_units[0]["children"].append(node)
    root["children"].extend(support)
    # Empty source topics create no synthetic learning target.
    for node in supplements.values():
        atoms = [child for child in node["children"] if author.atoms(child)]
        if len(atoms) > 20:
            by_area = {}
            for child in atoms:
                atom = child["goalId"]
                goal = graph.GOALS[atom]
                key = next((tag.removeprefix("area:") for tag in goal.get("tags", []) if tag.startswith("area:")), None)
                key = key or ("Mathematische Grundlagen" if graph.GOAL_OWNERS[atom] != view["landscapeId"] else "Weitere Grundlagen")
                by_area.setdefault(key, []).append(child)
            node["children"] = [graph.structure(node["id"] + "-" + hashlib.sha256(label.encode()).hexdigest()[:8], label, children)
                                for label, children in sorted(by_area.items())]
    author.pull_earlier(ordered_units)
    for stage in stages.values():
        author.thematic_orders(stage, [unit["id"] for unit in stage["children"]])
    author.thematic_orders(root, [stage["id"] for stage in stages.values()])
    ownership = {atom: index for index, unit in enumerate(ordered_units) for atom in author.atoms(unit)}
    assessment_placements = []
    for atom in sorted(practice_ids, key=lambda atom: (len(graph.prerequisites(atom) & practice_ids), atom)):
        assessed = set(graph.GOALS[atom].get("examData", {}).get("coveredGoalIds", []))
        fallback = 0
        if any("reviewedTemporalBoundary" in topic for topic in topics.values()):
            stage = original_stage.get(atom, scope_stage if scope_stage != "CrossStage" else "SekII")
            default_unit = regular_source_default(ordered_specs, topics, stage)
            fallback = next(i for i, unit in enumerate(ordered_units) if unit["id"] == f"physics-{state.lower()}-unit-{default_unit}")
        required_index = max((ownership[required] for required in graph.prerequisites(atom) if required in ownership), default=fallback)
        index = max((ownership[goal] for goal in graph.prerequisites(atom) | assessed if goal in ownership), default=fallback)
        if any("reviewedTemporalBoundary" in topic for topic in topics.values()) and not any(goal in ownership for goal in assessed):
            # A shared introductory prerequisite is not a temporal assignment
            # for an otherwise unassigned complete assessment material.
            index = max(index, fallback)
        unit = ordered_units[index]
        practice_id = unit["id"] + "-practice"
        practice = next((node for node in unit["children"] if node.get("id") == practice_id), None)
        if practice is None:
            practice = graph.structure(practice_id, "Übungen und Prüfungsaufgaben", [])
            unit["children"].append(practice)
        optional = next((optional_units[goal] for goal in assessed if len(assessed) == 1 and goal in optional_units), None)
        if optional is not None:
            optional["children"].append(references[atom])
        else:
            practice["children"].append(references[atom])
        ownership[atom] = index
        if index != required_index:
            assessment_placements.append({"goalId": atom, "requiresOnlyUnit": ordered_units[required_index]["id"],
                "learningUnit": unit["id"], "coveredGoalUnits": {goal: ordered_units[ownership[goal]]["id"] for goal in sorted(assessed) if goal in ownership},
                "basis": "own released assessment follows actual assessed competencies and canonical requirements; no official task claim and no requires edit"})
    if exam_atoms:
        upper = stages.get("SekII")
        if upper is None:
            raise ValueError("An Abitur target cannot be hidden in a lower-secondary-only source view")
        exam = graph.structure("physics-" + state.lower() + "-abitur", "Abiturprüfung", [references[atom] for atom in sorted(exam_atoms)])
        upper["children"].append(exam)
        author.temporal_children[upper["id"]].append(exam["id"])
    for stage in stages.values():
        author.thematic_orders(stage, repair=False)
    author.thematic_orders(root, repair=False)
    result = author.finish()
    assignments = {atom: {"sourceTopic": chosen[atom], "sourcePassages": [passage
        for passage in topics[chosen[atom]]["sourcePassages"]
        if passage.get("canonicalGoalId", atom) == atom]} for atom in chosen}
    return result, {"source_temporal_granularity": [dict(zip(("stage", "unit", "label", "order"), spec)) for spec in ordered_specs],
                    "missing_exam_unit": None if exam_atoms else "The unchanged target scope has no separate Abitur examination goals.",
              "sourceSelectedLowerAtomicGoalIds": sorted(source_lower_seeds),
              "officialLowerAdditions": sorted(direct_lower - set(MEMBERSHIPS.get(view["viewId"], {}).get("sourceSelectedLowerAtomicGoalIds", []))),
              "officialE10StageCorrections": sorted(explicit_e10),
                    "reviewedNewLowerExclusions": [{"goalId": atom, **decision} for atom, decision in reviewed_lower.items()
                        if atom in selected],
                    "authorisedNewOwnTaskSeeds": own_new_tasks,
                    "sources": sources, "ownPlacements": own_assignments,
                    "reviewedMomentumBindings": momentum_bindings,
                    "reviewedEnergyDerivationBindings": energy_derivation_bindings,
                    "sourceTopics": [{"compositionNodeId": f"physics-{state.lower()}-{key[0]}-topic-" + hashlib.sha256(key[1].encode()).hexdigest()[:12],
                        "temporalUnitId": f"physics-{state.lower()}-unit-{key[0]}", **topic} for key, topic in topics.items()],
                    "sourceAssignments": assignments,
                    "assessmentPlacementEvidence": assessment_placements,
                    "earlierDemandPlacements": [{**shift, "retainedSourceAssignment": assignments.get(shift["goalId"],
                         {"status": "own supplementary placement; no official temporal assignment claimed"})} for shift in author.shifts],
                    "acquisitionTemplateWitnesses": author.acquisition_evidence,
                    "partialOrders": author.order_evidence}


def lower_excerpt(authority, source_seeds):
    """An excerpt selects source-stage seeds, not every early acquisition atom."""
    seeds = set(source_seeds)
    if not seeds <= graph.role_atoms(authority)["target"]:
        raise ValueError("Lower-stage source seeds leave the reviewed full authority")
    learning = seeds | {required for atom in seeds for required in graph.prerequisites(atom)}
    state = authority["scope"]["jurisdiction"].removeprefix("DE-").lower()
    assessment_bindings = SOURCE_PLAN.get("reviewedLowerAssessmentBindings", {}).get(state.upper(), {}).get("assessments", {})
    base_seeds, base_learning = set(seeds), set(learning)
    inactive_assessments = []
    for identifier, binding in assessment_bindings.items():
        goal = graph.GOALS[identifier]
        if (not reviewed_conditional_assessment(goal, state) and binding.get("existingReleasedTaskBasis") is not True) or goal.get("examData", {}).get("reviewStatus") != "released" or not goal.get("examData", {}).get("taskContent"):
            raise ValueError("Conditional lower assessment contract changed: " + identifier)
        if goal.get("requires", []) != binding["requires"] or goal["examData"].get("coveredGoalIds", []) != binding["coveredGoalIds"]:
            raise ValueError("Reviewed lower assessment evidence changed: " + identifier)
        if not graph.prerequisites(identifier) <= base_learning or not set(binding["coveredGoalIds"]) <= base_learning:
            inactive_assessments.append({"goalId": identifier,
                "missingActualPreparation": sorted(graph.prerequisites(identifier) - base_learning),
                "missingAssessedCompetencies": sorted(set(binding["coveredGoalIds"]) - base_learning),
                "basis": "conditional task is inactive; source review must never import extra competencies to make it applicable"})
            continue
        seeds.add(identifier)
    learning = seeds | {required for atom in seeds for required in graph.prerequisites(atom)}
    original = Author(authority)
    lower = copy.deepcopy((original.find("physics-seki") or original.find("physics-bw-seki"))[2])
    seen, target_seen = set(), set()
    def trim(nodes):
        kept = []
        for node in nodes:
            if node["kind"] == "structure":
                node["children"] = trim(node["children"])
                kept.append(node)
                continue
            if node.get("projectionRole") == "prerequisiteOnly":
                if node.get("acquisitionPlacement") is True:
                    if node["goalId"] not in learning or node["goalId"] in seen:
                        continue
                    seen.add(node["goalId"])
                kept.append(node)
                continue
            expanded = canonical_atoms(node["goalId"]) if node["kind"] == "canonicalSubtree" else {node["goalId"]}
            for atom in sorted(expanded & learning):
                if atom in seen:
                    continue
                seen.add(atom)
                reference = copy.deepcopy(node) if expanded == {atom} else {"kind": "goalEntry", "goalId": atom}
                reference["kind"] = "goalEntry"
                if atom in seeds:
                    reference["projectionRole"] = "target"
                    reference.pop("acquisitionPlacement", None)
                    target_seen.add(atom)
                else:
                    reference["projectionRole"] = "prerequisiteOnly"
                    reference["acquisitionPlacement"] = True
                kept.append(reference)
        return kept
    lower["children"] = trim(lower["children"])
    units = [node for node in lower["children"] if node["kind"] == "structure"]
    if not units:
        raise ValueError("No authored lower acquisition unit")
    missing_seeds = sorted(seeds - target_seen)
    if missing_seeds:
        addition = graph.structure("physics-" + state + "-source-lower-additional", "Weitere Themen und Prüfungsaufgaben", [])
        assessment_groups = {}
        ownership = {atom: index for index, unit in enumerate(units) for atom in graph.learning_atoms(unit, base_seeds, base_learning)}
        for atom in missing_seeds:
            reference = original.extract(atom)
            if reference is None and atom in assessment_bindings:
                reference = {"kind": "goalEntry", "goalId": atom}
            if reference is None:
                raise ValueError("Missing lower source seed " + atom)
            reference["kind"], reference["projectionRole"] = "goalEntry", "target"
            reference.pop("acquisitionPlacement", None)
            if atom in assessment_bindings:
                assessed = set(graph.GOALS[atom].get("examData", {}).get("coveredGoalIds", []))
                index = max((ownership[goal] for goal in graph.prerequisites(atom) | assessed if goal in ownership), default=len(units) - 1)
                if index not in assessment_groups:
                    assessment_groups[index] = graph.structure("physics-" + state + "-required-assessments-" + units[index]["id"], "Prüfungsaufgaben zu den vorhandenen Grundlagen", [])
                    units[index]["children"].append(assessment_groups[index])
                assessment_groups[index]["children"].append(reference)
            else:
                addition["children"].append(reference)
            seen.add(atom)
        if addition["children"]:
            units[-1]["children"].append(addition)
    missing_learning = sorted(learning - seen)
    template_witnesses = []
    for atom in missing_learning:
        consumers = sorted(seed for seed in seeds if atom in graph.prerequisites(seed))
        if not consumers:
            raise ValueError("An acquisition template has no selected lower consumer")
        destination = next((unit for unit in units if set(consumers) & canonical_visible_atoms(unit)), units[0])
        identifier = destination["id"] + "-required-preparation"
        preparation = next((node for node in destination["children"] if node.get("id") == identifier), None)
        if preparation is None:
            preparation = graph.structure(identifier, "Notwendige Grundlagen", [])
            destination["children"].insert(0, preparation)
        preparation["children"].append({"kind": "goalEntry", "goalId": atom, "projectionRole": "prerequisiteOnly", "acquisitionPlacement": True})
        template_witnesses.append({"goalId": atom, "consumerGoalId": consumers[0], "learningUnit": destination["id"],
                                   "basis": "existing canonical prerequisite path; acquisition only, never a source seed"})
    excerpt = copy.deepcopy(authority)
    excerpt["viewId"] = f"de-{state}-gym-seki-physics"
    excerpt["scope"]["stage"] = "SekI"
    excerpt["scope"].pop("courseProfile", None)
    excerpt["rootNodes"] = [graph.structure("physics-root", "Physik", [lower])]
    # Preserve only global support records; a full-authority target outside the
    # excerpt cannot become a source seed by virtue of its support subtree.
    global_support = [copy.deepcopy(node) for node in graph.walk(authority["rootNodes"])
                      if node["kind"] != "structure" and node.get("projectionRole") == "prerequisiteOnly"]
    for node in global_support:
        node.pop("acquisitionPlacement", None)
    excerpt["rootNodes"][0]["children"].extend(global_support)
    authored = Author(excerpt)
    authored.learning_basis = learning
    lower = (authored.find("physics-seki") or authored.find("physics-bw-seki"))[2]
    def prune(nodes):
        result = []
        for node in nodes:
            if node["kind"] == "structure":
                node["children"] = prune(node["children"])
                if not authored.atoms(node):
                    continue
            result.append(node)
        return result
    lower["children"] = prune(lower["children"])
    calendar = [unit["id"] for unit in lower["children"] if unit["kind"] == "structure"]
    authored.thematic_orders(lower, calendar)
    authored.thematic_orders(authored.find("physics-root")[2])
    result = authored.finish()
    if graph.role_atoms(result)["target"] != seeds:
        raise ValueError("Lower excerpt changed source-selected atomic seeds")
    actual_learning = graph.role_atoms(result)["target"] | {required for atom in seeds for required in graph.prerequisites(atom)}
    if actual_learning != learning:
        raise ValueError("Lower excerpt changed the canonical learning basis")
    template_witnesses = []
    for node in graph.walk(result["rootNodes"]):
        if node.get("acquisitionPlacement") is not True:
            continue
        atom = node["goalId"]
        consumer = next(seed for seed in sorted(seeds) if atom in graph.prerequisites(seed))
        pending, found = [[consumer]], {consumer}
        path = None
        while pending:
            candidate = pending.pop(0)
            if candidate[-1] == atom:
                path = candidate
                break
            for required in graph.GOALS[candidate[-1]].get("requires", []):
                if required not in found:
                    found.add(required)
                    pending.append(candidate + [required])
        if path is None:
            raise ValueError("No canonical witness for acquisition template " + atom)
        template_witnesses.append({"goalId": atom, "consumerGoalId": consumer, "requiredByPath": path,
                                   "basis": "prerequisite acquisition only; never a source seed"})
    return result, {"sourceSelectedLowerAtomicGoalIds": sorted(seeds), "learningBasisAtomicGoalIds": sorted(learning),
                    "reviewedLowerAssessmentAdditions": [{"goalId": goal, **binding,
                        "sourceClaim": "own released assessment for existing lower competencies; no official task claim"}
                        for goal, binding in assessment_bindings.items() if goal in seeds],
                    "inactiveReviewedLowerAssessments": inactive_assessments,
                    "earlierAcquisitionOnlyAtomicGoalIds": sorted(learning - seeds),
                    "sourceSeedReferencesAddedAtExistingScope": missing_seeds,
                    "acquisitionTemplateWitnesses": template_witnesses,
                    "partialOrders": authored.order_evidence}


def canonical_visible_atoms(node):
    if node["kind"] == "structure":
        return set().union(*(canonical_visible_atoms(child) for child in node["children"])) if node["children"] else set()
    return canonical_atoms(node["goalId"]) if node["kind"] == "canonicalSubtree" else {node["goalId"]}


def group_canonical_phase_content(author, phase):
    """Give restored phase content its canonical semantic topic address.

    A canonical phase is a default calendar, not itself a subject topic. Cards
    and genuine examination boards retain their existing special presentation.
    """
    if phase["id"] == "physics-abitur":
        return
    loose = [n for n in phase["children"] if n["kind"] != "structure" and author.atoms(n)
             and not graph.GOALS[n["goalId"]].get("nodeKind") == "memory"
             and not graph.GOALS[n["goalId"]]["title"].startswith("Lernkarten")]
    for node in loose:
        atom = node["goalId"]
        parents = sorted((len(canonical_atoms(identifier)), identifier) for identifier, goal in graph.GOALS.items()
                         if atom in goal.get("contains", []) and len(canonical_atoms(identifier)) <= 60)
        parent = parents[0][1] if parents else atom
        # These three restored Q4 astronomy contents belong to the retained
        # Astrophysics topic; radiation applications belong to Nuclear Physics.
        destination = None
        if phase["id"] == "physics-q4":
            title = "Kernphysik" if atom == "e5c08365-a0d3-592c-ad8e-d2c2c6e2b717" else "Astrophysik" if atom in {
                "af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93", "206fe51d-cc78-5422-b139-32cc97eb1c37",
                "6f896466-e0ec-5f8d-82ad-2890433c82ba"} else None
            destination = next((n for n in phase["children"] if n.get("label") == title and n["kind"] == "structure"), None) if title else None
        identifier = "physics-canonical-topic-" + parent
        destination = destination or next((n for n in phase["children"] if n.get("id") == identifier
            or n.get("canonicalSourceGoalId", n.get("originalCanonicalSubtree", {}).get("goalId")) == parent), None)
        if destination is None:
            destination = graph.structure(identifier, graph.GOALS[parent]["title"], [])
            phase["children"].insert(phase["children"].index(node), destination)
        phase["children"].remove(node)
        destination["children"].append(node)


def flatten_canonical_examination(view):
    """The exact bound exam collection has atomic references in both profiles."""
    for node in graph.walk(view["rootNodes"]):
        if node.get("id") == "physics-abitur":
            node["children"] = [reference for reference in graph.walk(node["children"])
                                if reference["kind"] != "structure"]
            node.pop("childOrder", None)


def normalize_canonical_surface(view):
    """Remove only reviewed redundant headings; retain goal-reference payloads."""
    for node in graph.walk(view["rootNodes"]):
        if (node.get("id") == "physics-canonical-board-topic-physics-required-preparation-physics-e-phase-230345f3-c360-4963-b390-ab94e3e2c864"
                and node.get("label") == "Freier Fall experimentell untersuchen"):
            node["label"] = "Freier Fall: Experiment und Auswertung"
        if node["kind"] != "structure":
            continue
        if node["id"] == "physics-canonical-additional-5c44b9ba-9b05-4774-95d5-073230d3fc4f":
            node["label"] = "Orientierung in der Physik"
        elif node["id"] == "physics-canonical-topic-8939373f-a243-54e4-99c6-7a18f212edcf":
            node["label"] = "Elektrische Ladung: Trennung und Ausgleich"
        duplicates = [child for child in node["children"] if child["kind"] == "structure"
            and child.get("id", "").startswith("physics-canonical-board-topic-") and child["label"] == node["label"]]
        if duplicates:
            node["children"] = [nested for child in node["children"]
                for nested in (child["children"] if child in duplicates else [child])]
            groups = [child for child in node["children"] if child["kind"] == "structure"]
            if len(groups) < 2:
                node.pop("childOrder", None)
            else:
                selected = graph.role_atoms(view)["target"]
                learning = selected | {p for atom in selected for p in graph.prerequisites(atom)}
                node["childOrder"], _ = derive_partial_order(groups,
                    lambda child: graph.learning_atoms(child, selected, learning),
                    lambda atom: set(graph.GOALS[atom].get("requires", [])))


def bundle_canonical_lower(view):
    """Reduce navigation breadth only where a semantic quotient stays acyclic."""
    author = Author(view)
    author.view = view
    stage = author.find("physics-seki")
    if stage is None:
        return []
    stage = stage[2]
    candidates = {}
    for node in stage["children"]:
        if not node.get("id", "").startswith("physics-acquisition-") or len(node["children"]) != 1:
            continue
        atom = node["children"][0].get("goalId")
        if atom is None:
            continue
        parents = sorted((len(canonical_atoms(identifier)), identifier) for identifier, goal in graph.GOALS.items()
                         if atom in goal.get("contains", []) and len(canonical_atoms(identifier)) <= 60)
        if parents:
            canonical = parents[0][1]
            candidates.setdefault(("physics-canonical-lower-topic-" + canonical, graph.GOALS[canonical]["title"]), []).append(node)
    families = [
        ("physics-canonical-lower-optics", "Licht und Optik", ("physics-seki-light", "physics-seki-optics", "physics-seki-colour")),
        ("physics-canonical-lower-electrical", "Elektrizität, Magnetismus und Halbleiter", ("physics-seki-magnetism", "physics-seki-voltage-circuits-safety-batch-011", "physics-seki-semiconductors", "physics-final-diode-seki", "physics-semiconductor-seki")),
    ]
    for identifier, label, members in families:
        candidates[(identifier, label)] = [n for n in stage["children"] if n.get("id") in members]
    evidence = []
    for (identifier, label), members in candidates.items():
        if len(members) < 2:
            continue
        group = graph.structure(identifier, label, members)
        before = stage["children"]
        first = min(before.index(n) for n in members)
        trial = [n for n in before if n not in members]
        trial.insert(first, group)
        try:
            # Any chain that leaves and re-enters the proposed topic would make
            # its whole-topic quotient cyclic. Keep those acquisition steps
            # separate instead of inventing a completion order.
            derive_partial_order(trial, author.atoms, graph.prerequisites)
        except ValueError as error:
            if "Cyclic" not in str(error):
                raise
            evidence.append({"topic": label, "merged": False, "reason": "interleaved canonical requirements make whole-topic coarsening cyclic",
                             "memberIds": [n["id"] for n in members]})
            continue
        stage["children"] = trial
        for node in (group, stage):
            children = [n for n in node["children"] if n["kind"] == "structure"]
            if len(children) > 1:
                node["childOrder"], _ = derive_partial_order(children, author.atoms,
                    lambda atom: set(graph.GOALS[atom].get("requires", [])))
        evidence.append({"topic": label, "merged": True, "memberIds": [n["id"] for n in members]})
    return evidence


@cache
def canonical_topic_for_atom(atom):
    goal = graph.GOALS[atom]
    parents = sorted((len(canonical_atoms(identifier)), identifier) for identifier, parent in graph.GOALS.items()
        if atom in parent.get("contains", []) and len(canonical_atoms(identifier)) <= 60
        and not any(word in parent["title"].lower() for word in ("übungen", "prüfungsaufgaben", "klausur")))
    if parents:
        return parents[0][1]
    return None


def bundle_large_canonical_units(view, learning=None):
    """Partition broad boards by semantic topic, accepting only acyclic cuts."""
    author = Author(view)
    author.view = view
    author.active_learning_basis = learning
    author.learning_basis = learning if learning is not None else author.before["target"] | {
        p for atom in author.before["target"] for p in graph.prerequisites(atom)}
    evidence = []
    for parent in reversed(list(graph.walk(view["rootNodes"]))):
        if parent["kind"] != "structure" or len(parent["children"]) <= 20 or parent["id"] == "physics-abitur":
            continue
        buckets = {}
        for node in parent["children"]:
            atoms = author.atoms(node)
            if len(atoms) != 1:
                continue
            atom = next(iter(atoms))
            if graph.GOALS[atom]["title"].startswith("Lernkarten"):
                continue
            topic = canonical_topic_for_atom(atom)
            if topic is None and graph.GOALS[atom].get("examData", {}).get("taskContent"):
                candidates = {}
                for required in graph.GOALS[atom].get("requires", []):
                    family = canonical_topic_for_atom(required)
                    if family:
                        candidates[family] = candidates.get(family, 0) + 1
                topic = max(candidates, key=lambda k: (candidates[k], -len(canonical_atoms(k)), k), default=None)
            if topic:
                buckets.setdefault(topic, []).append(node)
        for topic, members in buckets.items():
            if len(members) < 2 or len(members) == len(parent["children"]):
                continue
            def quotient(part):
                identifier = "physics-canonical-board-topic-" + parent["id"] + "-" + topic
                if len(part) != len(members):
                    keys = sorted(n.get("id", n.get("goalId")) for n in part)
                    identifier += "-" + hashlib.sha256("\n".join(keys).encode()).hexdigest()[:10]
                group = graph.structure(identifier, graph.GOALS[topic]["title"], part)
                first = min(parent["children"].index(n) for n in part)
                trial = [n for n in parent["children"] if n not in part]
                trial.insert(first, group)
                # Loose surrounding atoms remain in the quotient probe too.
                probe = [n if n["kind"] == "structure" else graph.structure("probe-" + n["goalId"], "", [n]) for n in trial]
                try:
                    derive_partial_order(probe, author.atoms, graph.prerequisites)
                except ValueError as error:
                    if "Cyclic" not in str(error):
                        raise
                    return None
                return group, trial
            complete = quotient(members)
            if complete:
                parts = [members]
            else:
                # A canonical family can interleave with another acquisition.
                # Preserve that distinction using maximal compatible parts;
                # do not discard the topic family or impose a false full order.
                parts = []
                for member in members:
                    for part in parts:
                        if quotient([*part, member]):
                            part.append(member)
                            break
                    else:
                        parts.append([member])
                evidence.append({"parentId": parent["id"], "topicId": topic, "merged": False,
                    "reason": "whole-family quotient is cyclic; compatible semantic subgroups used", "parts": [len(p) for p in parts]})
            for part in parts:
                if len(part) < 2:
                    continue
                result = quotient(part)
                if result is None:
                    continue
                group, trial = result
                if len(parts) > 1:
                    first_atom = next(iter(author.atoms(part[0])))
                    group["label"] += ": " + graph.GOALS[first_atom]["title"]
                parent["children"] = trial
                author.thematic_orders(group, repair=False)
                author.thematic_orders(parent, repair=False)
                evidence.append({"parentId": parent["id"], "topicId": topic, "merged": True, "children": len(part)})
    return evidence


def generate_canonical(view, stabilize=True):
    """Retain the accepted canonical default; it asserts no Land timetable."""
    view, own_new_tasks = reviewed_cross_stage_tasks(view, "DE")
    author = Author(view)
    root = author.find("physics-root")[2]
    def has_opaque_target(node):
        return any(n["kind"] == "goalEntry" and n.get("projectionRole", "target") == "target"
            and graph.GOALS[n["goalId"]].get("contains") for n in graph.walk([node]))
    stages = [n for n in root["children"] if n.get("id") == "physics-seki" or n.get("id", "").startswith("physics-sekii-")]
    if not stages:
        raise ValueError("Canonical Physics has no explicit stage")
    for node in list(author.view["rootNodes"]):
        if node is not root and (author.atoms(node) or has_opaque_target(node)):
            author.view["rootNodes"].remove(node)
            root["children"].append(node)
    upper = next((n for n in stages if n["id"].startswith("physics-sekii-")), None)
    # Every selected acquisition has a stage address, including accepted
    # methodology/safety supplements formerly placed beside the stage nodes.
    for node in list(root["children"]):
        if node in stages or not (author.atoms(node) or has_opaque_target(node)):
            continue
        root["children"].remove(node)
        owned = author.atoms(node)
        opaque_exam = has_opaque_target(node) and any(graph.GOALS[a].get("dimensionTags", {}).get("phase") == "Abitur"
            for a in canonical_visible_atoms(node))
        destination = upper if opaque_exam and upper is not None else next((s for s in stages if any(owned & graph.prerequisites(a) for a in author.atoms(s))), stages[0])
        if node["kind"] != "structure":
            identifier = node["goalId"]
            node = graph.structure("physics-canonical-additional-" + identifier, graph.GOALS[identifier]["title"], [node])
        destination["children"].append(node)
    if upper:
        phases = [n for n in upper["children"] if n.get("id") in ("physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4", "physics-abitur")]
        if len(phases) < 5:
            raise ValueError("Canonical upper Physics is missing its phase anchors")
        if not any(p["id"] == "physics-abitur" for p in phases) and any(
                graph.GOALS[a].get("dimensionTags", {}).get("phase") == "Abitur" for a in author.before["target"]):
            exam = graph.structure("physics-abitur", "Abiturprüfung", [])
            phases.append(exam)
            upper["children"].append(exam)
        lower = next((s for s in stages if s["id"] == "physics-seki"), None)
        if lower is not None:
            source_lower = set(MEMBERSHIPS[view["viewId"]]["sourceSelectedLowerAtomicGoalIds"])
            lower_learning = source_lower | {p for seed in source_lower for p in graph.prerequisites(seed)}
            for atom in sorted(author.atoms(lower) - lower_learning):
                phase = graph.GOALS[atom].get("dimensionTags", {}).get("phase")
                if phase not in ("Q1", "Q2", "Q3", "Q4", "Abitur"):
                    continue
                reference = author.extract(atom, lower["children"])
                destination = next(p for p in phases if p["id"] == "physics-" + phase.lower())
                destination["children"].append(reference)
                author.shifts.append({"goalId": atom, "from": "unintended first-stage supplement fallback",
                    "to": destination["label"], "basis": "explicit canonical phase; no prerequisite path from an accepted original lower-stage seed"})
        original_e = set(CANONICAL_E_SEEDS[view["viewId"]]) & author.before["target"]
        actual_e_preparation = {p for a in original_e for p in graph.prerequisites(a)}
        ephase = next(p for p in phases if p["id"] == "physics-e-phase")
        for atom in sorted(author.atoms(ephase) - original_e - actual_e_preparation):
            phase = graph.GOALS[atom].get("dimensionTags", {}).get("phase")
            if phase in (None, "GLOBAL"):
                prerequisite_phases = {graph.GOALS[p].get("dimensionTags", {}).get("phase") for p in graph.prerequisites(atom)}
                phase = max((p for p in prerequisite_phases if p in ("Q1", "Q2", "Q3", "Q4")), default=None)
            if phase not in ("Q1", "Q2", "Q3", "Q4", "Abitur"):
                continue
            reference = author.extract(atom)
            destination = next(p for p in phases if p["id"] == "physics-" + phase.lower())
            # A supplement's canonical Q phase is the default; only an actual
            # earlier E demand may pull it forward again. Existing reviewed E
            # assignments and their whole prerequisite closure stay untouched.
            destination["children"].append(reference)
            author.shifts.append({"goalId": atom, "from": "unintended first-phase supplement fallback", "to": destination["label"],
                "basis": "explicit canonical phase; no prerequisite path from an accepted original E seed"})
        # The accepted unbound stars supplement is Q4 content, not generic
        # E-phase preparation. Preserve its four reviewed payloads together.
        q4 = next(p for p in phases if p["id"] == "physics-q4")
        star_ids = ("69280706-5af6-5788-85b7-93287c2ffe74", "e1b21fe9-ab6f-58c4-a0b6-9895061fbabb",
                    "6c87a996-9166-5c6e-8cda-01d40720f9c8", "6da29199-f086-512c-89f2-1b5ca865eef9")
        star_refs = [author.extract(a) for a in star_ids if a in author.before["target"]]
        stars = author.take("physics-b034-stars", optional=True)
        if star_refs or stars:
            stars = stars or graph.structure("physics-b034-stars", "Sternentwicklung und Materiekreislauf", [])
            stars["children"].extend(n for n in star_refs if n is not None)
            destination = next((n for n in q4["children"] if n["kind"] == "structure" and n["label"] == "Astrophysik"), q4)
            destination["children"].append(stars)
        for node in list(author.view["rootNodes"]):
            if node is root or not author.atoms(node):
                continue
            author.view["rootNodes"].remove(node)
            upper["children"].append(node)
        extras = [n for n in upper["children"] if n not in phases and (author.atoms(n) or has_opaque_target(n))]
        upper["children"] = [n for n in upper["children"] if n not in extras]
        for node in extras:
            owned = author.atoms(node)
            default_phase = max((graph.GOALS[a].get("dimensionTags", {}).get("phase") for a in canonical_visible_atoms(node)
                if graph.GOALS[a].get("dimensionTags", {}).get("phase") in ("Q1", "Q2", "Q3", "Q4", "Abitur")), default=None)
            default = next((p for p in phases if p["id"] == "physics-" + str(default_phase).lower()), phases[0])
            target = next((p for p in phases if any(owned & graph.prerequisites(a) for a in author.atoms(p))), default)
            target["children"].append(node)
        author.pull_earlier(phases, upper["children"])
        for phase in phases:
            group_canonical_phase_content(author, phase)
        author.temporal_children[upper["id"]] = [p["id"] for p in phases]
    if len(stages) > 1:
        author.pull_earlier(stages, root["children"])
        author.temporal_children[root["id"]] = [s["id"] for s in stages]
    result = author.finish()
    flatten_canonical_examination(result)
    navigation_bundles = bundle_canonical_lower(result)
    broad_bundles = bundle_large_canonical_units(result)
    normalize_canonical_surface(result)
    evidence = {"source_temporal_granularity": "own canonical default phases; no official Land/year assignment asserted",
        "missing_exam_unit": None if upper and any(n.get("id") == "physics-abitur" for n in upper["children"]) else "No separate exam targets in this stage scope.",
        "earlierDemandPlacements": author.shifts, "acquisitionTemplateWitnesses": author.acquisition_evidence,
        "canonicalLowerNavigationBundles": navigation_bundles,
        "canonicalBroadBoardBundles": broad_bundles,
        "partialOrders": author.order_evidence}
    evidence["authorisedNewOwnTaskSeeds"] = own_new_tasks
    if stabilize:
        # Opening an accepted canonical subtree can expose one further mixed
        # acquisition cut. Reach the bounded normal form before any file write.
        for _ in range(6):
            following, follow_evidence = generate_canonical(result, False)
            if following == result:
                break
            result = following
            evidence["earlierDemandPlacements"].extend(follow_evidence["earlierDemandPlacements"])
            evidence["partialOrders"] = follow_evidence["partialOrders"]
            evidence["acquisitionTemplateWitnesses"] = follow_evidence["acquisitionTemplateWitnesses"]
        else:
            raise ValueError("Canonical Physics acquisition placement failed to stabilize")
    return result, evidence


def course_pair_projection(authority, original, placement_evidence=None):
    """Project a single checked planning DAG onto the exact course seed set.

    A common placement prevents independently repaired coarse sections from
    acquiring opposite orders in GK and LK. Pruning retains declared reachability.
    """
    source = Author(original)
    seeds = source.before["target"]
    authority_seeds = graph.role_atoms(authority)["target"]
    learning = seeds | {p for atom in seeds for p in graph.prerequisites(atom)}
    references = {atom: source.extract(atom) for atom in sorted(seeds)}
    if any(n is None for n in references.values()):
        raise ValueError("Cannot retain course target payload")
    result = copy.deepcopy(original)
    structures = {n["id"]: n for n in graph.walk(original["rootNodes"]) if n["kind"] == "structure"}
    def project(nodes):
        retained = []
        for source_node in nodes:
            node = copy.deepcopy(source_node)
            if node["kind"] == "structure":
                node["children"] = project(node["children"])
                if not node["children"]:
                    continue
                # Preserve accepted author metadata where the same semantic
                # unit exists in this course; children/order come from the DAG.
                previous = structures.get(node["id"])
                if previous:
                    node.update({k: copy.deepcopy(v) for k, v in previous.items() if k not in ("children", "childOrder")})
                if "childOrder" in source_node:
                    pairs = source_node["childOrder"]["after"]
                    visible = [c["id"] for c in node["children"] if c["kind"] == "structure"]
                    needs = {c["id"]: set() for c in source_node["children"] if c["kind"] == "structure"}
                    for pair in pairs:
                        needs[pair["unit"]].add(pair["after"])
                    @cache
                    def before(unit):
                        return needs[unit] | {p for previous in needs[unit] for p in before(previous)}
                    closure = {unit: before(unit) & set(visible) for unit in visible}
                    node["childOrder"] = {"after": [{"unit": u, "after": p} for u in visible for p in visible
                        if p in closure[u] and not any(p in closure[m] for m in closure[u] if m != p)]}
                retained.append(node)
            else:
                identifier = node["goalId"]
                if node.get("projectionRole") == "prerequisiteOnly" and node.get("acquisitionPlacement") is not True:
                    continue  # Original course support is appended separately.
                if graph.GOALS[identifier].get("contains"):
                    if node["kind"] == "goalEntry":
                        own = source.find(identifier)
                        if own and own[2].get("goalId") == identifier:
                            retained.append(copy.deepcopy(own[2]))
                    elif not canonical_atoms(identifier) & seeds:
                        continue  # Course exclusions are retained separately.
                    else:
                        raise ValueError("Common course authority has an unopened target subtree")
                elif identifier in seeds:
                    retained.append(copy.deepcopy(references[identifier]))
                elif identifier in learning and (identifier in authority_seeds or node.get("acquisitionPlacement") is True):
                    retained.append({"kind": "goalEntry", "goalId": identifier,
                        "projectionRole": "prerequisiteOnly", "acquisitionPlacement": True})
        return retained
    result["rootNodes"] = project(authority["rootNodes"])
    # Original support/exclusion payloads remain available. Their unmarked
    # duplicates cannot replace explicit acquisition templates in the product.
    support, seen = [], set()
    for node in graph.walk(original["rootNodes"]):
        if node["kind"] == "structure" or node.get("projectionRole") != "prerequisiteOnly":
            continue
        copy_node = copy.deepcopy(node)
        copy_node.pop("acquisitionPlacement", None)
        key = json.dumps(copy_node, sort_keys=True)
        if key not in seen:
            support.append(copy_node)
            seen.add(key)
    root = next(n for n in result["rootNodes"] if n.get("id") == "physics-root")
    root["children"].extend(support)
    profile = original["scope"]["courseProfile"].lower()
    rename = {"physics-sekii-lk": "physics-sekii-" + profile}
    for node in graph.walk(result["rootNodes"]):
        if node["kind"] != "structure":
            continue
        node["id"] = rename.get(node["id"], node["id"])
        if node["id"].startswith("physics-sekii-"):
            node["label"] = "Sekundarstufe II (" + profile.upper() + ")"
        for pair in node.get("childOrder", {}).get("after", []):
            pair["unit"], pair["after"] = rename.get(pair["unit"], pair["unit"]), rename.get(pair["after"], pair["after"])
    result["$schema"], result["viewFormatVersion"] = SCHEMA, "1.2"
    result.setdefault("language", "de")
    # Raw references retain the reviewed course roster. The native course
    # filter, however, determines which atoms actually seed this curriculum.
    # A filtered-out but necessary intermediate is preparation at its genuine
    # consumer, rather than an import of the other course's teaching calendar.
    planner = Author(result)
    planner.view = result
    _, applicable_learning, scoped_shifts = contextual_targets(result, graph.GOALS,
        seeds, graph.prerequisites, planner.extract, graph.structure)
    planner.active_learning_basis = planner.learning_basis = applicable_learning
    planner.acquisition_evidence = acquisition_placements(result, graph.GOALS, seeds,
        graph.prerequisites, graph.structure, consumer_seeds=seeds & applicable_learning)
    for parent in graph.walk(result["rootNodes"]):
        if parent["kind"] != "structure":
            continue
        children = [n for n in parent["children"] if n["kind"] == "structure"]
        temporal = [n["id"] for n in children if n["id"] in ("physics-seki", "physics-bw-seki", "physics-bw-sekii")
            or n["id"].startswith("physics-sekii-")] if parent["id"] == "physics-root" else [n["id"] for n in children
            if re.search(r"(?:-unit-|-year-|-seki-j)", n["id"]) or n["id"] in
            ("physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4", "physics-abitur")]
        if temporal:
            planner.temporal_children[parent["id"]] = temporal
    for node in result["rootNodes"]:
        planner.thematic_orders(node)
    result["rootNodes"] = planner.clean(result["rootNodes"])
    # The canonical surface uses these own semantic subgroups. Länder retain
    # their shared source topic identities in both profiles; moving a source
    # wrapper into profile-local packing groups would duplicate it on merge.
    if original["scope"].get("jurisdiction", "DE") == "DE":
        bundle_large_canonical_units(result, applicable_learning)
        flatten_canonical_examination(result)
        normalize_canonical_surface(result)
    if placement_evidence is not None:
        placement_evidence.extend({"viewId": original["viewId"], **shift} for shift in scoped_shifts)
    roles = graph.role_atoms(result)
    if roles["target"] != seeds or not source.before["prerequisiteOnly"] <= roles["prerequisiteOnly"]:
        raise ValueError("Common course planning changed source roles")
    return result


def common_course_pair(gk, lk, generate):
    """Use the reviewed union for placement only; retain each original S/L."""
    union = copy.deepcopy(lk)
    seeds = graph.role_atoms(gk)["target"] | graph.role_atoms(lk)["target"]
    present = graph.role_atoms(union)["target"]
    union["rootNodes"].extend({"kind": "goalEntry", "goalId": atom, "projectionRole": "target"} for atom in sorted(seeds - present))
    authority, report = generate(union)
    # Opening in place retains canonical structural source metadata.
    def open_targets(nodes):
        result = []
        for node in nodes:
            if node["kind"] == "structure":
                node["children"] = open_targets(node["children"])
            elif node["kind"] == "canonicalSubtree" and node.get("projectionRole") != "prerequisiteOnly" and graph.GOALS[node["goalId"]].get("contains") and canonical_atoms(node["goalId"]) & seeds:
                original = copy.deepcopy(node)
                node = graph.structure("physics-open-" + original["goalId"], original.get("displayLabel", graph.GOALS[original["goalId"]]["title"]),
                    open_targets([{"kind": "canonicalSubtree", "goalId": child} for child in graph.GOALS[original["goalId"]]["contains"]]))
                node.update({"canonicalSourceGoalId": original["goalId"], "originalCanonicalSubtree": original})
            result.append(node)
        return result
    authority["rootNodes"] = open_targets(authority["rootNodes"])
    # Opening a subtree changes the reference distance of exclusions. Preserve
    # the union's exact S explicitly before recomputing its refined unit cuts.
    for atom in graph.role_atoms(authority)["target"] - seeds:
        authority["rootNodes"].append({"kind": "goalEntry", "goalId": atom, "projectionRole": "prerequisiteOnly"})
    planner = Author(authority)
    for parent in graph.walk(authority["rootNodes"]):
        if parent["kind"] != "structure":
            continue
        groups = [n for n in parent["children"] if n["kind"] == "structure"]
        temporal = [n["id"] for n in groups if n["id"] == "physics-seki" or n["id"] == "physics-bw-seki" or n["id"].startswith("physics-sekii-") or n["id"] == "physics-bw-sekii"] if parent["id"] == "physics-root" else [n["id"] for n in groups if re.search(r"(?:-unit-|-year-|-seki-j)", n["id"]) or n["id"] in ("physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4", "physics-abitur")]
        if temporal:
            planner.temporal_children[parent["id"]] = temporal
    authority = planner.finish()
    report["commonCourseRefinementPlacements"] = planner.shifts
    report["commonCourseAtomicSeedCount"] = len(seeds)
    report["commonCourseAtomicSeedSha256"] = hashlib.sha256(("\n".join(sorted(seeds)) + "\n").encode()).hexdigest()
    scoped_shifts = []
    gk_result = course_pair_projection(authority, gk, scoped_shifts)
    lk_result = course_pair_projection(authority, lk, scoped_shifts)
    report["applicableCoursePreparationPlacements"] = scoped_shifts
    return gk_result, lk_result, report




def preserve_unchanged_sibling_presentation_order(view, original):
    """Retain authored tie order when membership and declared order are exact.

    Computed source membership, parentage and after relations remain the gate.
    An unchanged partial order does not require shuffling its independent
    presentation siblings, including the already accepted preparation leaves.
    """
    from collections import Counter
    previous = {n["id"]: n for n in graph.walk(original["rootNodes"]) if n["kind"] == "structure"}
    def identity(node):
        return (node["kind"], node.get("id", node.get("goalId")),
                node.get("projectionRole", "target"), node.get("acquisitionPlacement") is True)
    def pairs(node):
        return {(p["unit"], p["after"]) for p in node.get("childOrder", {}).get("after", [])}
    for node in graph.walk(view["rootNodes"]):
        old = previous.get(node.get("id"))
        if node["kind"] != "structure" or old is None or pairs(node) != pairs(old):
            continue
        current_keys = [identity(child) for child in node["children"]]
        old_keys = [identity(child) for child in old["children"]]
        if Counter(current_keys) == Counter(old_keys) and len(set(current_keys)) == len(current_keys):
            children = dict(zip(current_keys, node["children"]))
            node["children"] = [children[key] for key in old_keys]
        if "childOrder" in node and "childOrder" in old:
            after = {(p["unit"], p["after"]): p for p in node["childOrder"]["after"]}
            node["childOrder"]["after"] = [after[(p["unit"], p["after"])] for p in old["childOrder"]["after"]]
    return view


def actual_acquisition_evidence(view):
    selected = course_seeds(graph.role_atoms(view)["target"], graph.GOALS, view["scope"])
    witnesses = []
    def visit(nodes, parent=None):
        for node in nodes:
            if node["kind"] == "structure":
                visit(node["children"], node["id"])
            elif node.get("acquisitionPlacement") is True:
                atom = node["goalId"]
                consumer = next((s for s in sorted(selected) if atom in graph.prerequisites(s)), None)
                if consumer is None or atom in selected:
                    raise ValueError("An acquisition location is not proven by the selected canonical basis")
                pending, seen = [[consumer]], {consumer}
                while pending:
                    path = pending.pop(0)
                    if path[-1] == atom:
                        break
                    for previous in graph.GOALS[path[-1]].get("requires", []):
                        if previous not in seen:
                            seen.add(previous)
                            pending.append(path + [previous])
                witnesses.append({"goalId": atom, "learningPlace": parent, "consumerGoalId": consumer, "requiredByPath": path,
                    "sourceClaim": "canonical acquisition requirement only; no new official source/year mapping"})
    visit(view["rootNodes"])
    return witnesses


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    parser.add_argument("--jurisdiction", choices=["ALL", "DE", "BW", "BY", "BB", "BE", "HB", "HH", "HE", "MV", "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH"], default="ALL")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    outputs, report = [], []
    lower_authorities = {}
    for path in sorted(DIRECTORY.glob("*.view.json")):
        current = json.loads(path.read_text())
        state = current["scope"].get("jurisdiction", "DE").removeprefix("DE-")
        if state == "HE" or args.jurisdiction not in ("ALL", state):
            continue
        if state != "DE" and current["scope"]["stage"] == "SekI":
            continue  # Derived from the source-authoritative full view below.
        generate = generate_canonical if state == "DE" else generate_bavaria if state == "BY" else generate_source_land
        if args.report:
            print("Physics authoring: " + path.name, flush=True)
        generated, evidence = generate(current)
        repeated, _ = generate(generated)
        if repeated != generated:
            raise ValueError("Physics authoring is not idempotent: " + path.name)
        outputs.append((path, generated))
        report.append({"file": path.name, "changed": current != generated, **evidence})
        if state != "DE" and current["scope"]["stage"] == "CrossStage":
            seeds = evidence.get("sourceSelectedLowerAtomicGoalIds", MEMBERSHIPS[current["viewId"]]["sourceSelectedLowerAtomicGoalIds"])
            previous = lower_authorities.get(state)
            if previous and set(previous[1]) != set(seeds):
                raise ValueError("Course profiles disagree about source-selected lower Physics seeds")
            if previous is None or current["scope"]["courseProfile"] == "GK":
                lower_authorities[state] = (generated, seeds)
    # These source quotients previously produced opposite profile-local repairs
    # (fields/waves, quantum/atom models, canonical E-phase preparation). Give
    # the courses one reviewed planning authority, without changing either S.
    pairs = {}
    for index, (path, view) in enumerate(outputs):
        state = view["scope"].get("jurisdiction", "DE").removeprefix("DE-")
        stage = view["scope"]["stage"]
        if stage in ("CrossStage", "SekII") and view["scope"].get("courseProfile") in ("GK", "LK"):
            pairs.setdefault((state, stage), {})[view["scope"]["courseProfile"]] = index
    for (state, stage), indexes in pairs.items():
        if set(indexes) != {"GK", "LK"}:
            raise ValueError("Incomplete common Physics course planning pair")
        left, right = indexes["GK"], indexes["LK"]
        generate = generate_canonical if state == "DE" else generate_bavaria if state == "BY" else generate_source_land
        if args.report:
            print("Common course planning: " + state + " " + stage, flush=True)
        gk, lk, evidence = common_course_pair(outputs[left][1], outputs[right][1], generate)
        for index, generated in ((left, gk), (right, lk)):
            # Source reconstruction is deliberately course-neutral. Apply the
            # new mechanics heading only after the final shared course plan,
            # so its old target locations are the actual output contract.
            generated, momentum_preparation_places = momentum_preparation_sibling(Author(generated), state)
            path = outputs[index][0]
            generated = preserve_unchanged_sibling_presentation_order(generated, json.loads(path.read_text()))
            outputs[index] = (path, generated)
            report[index].update({"changed": json.loads(path.read_text()) != generated,
                "reviewedNewMomentumPreparationPlaces": momentum_preparation_places,
                "commonCoursePlanningAuthority": "one dependency-compatible union placement, projected onto unchanged course seeds; declared transitivity survives pruning",
                "commonCourseEarlierDemandPlacements": evidence.get("earlierDemandPlacements", []),
                "commonCourseRefinementPlacements": evidence.get("commonCourseRefinementPlacements", []),
                "applicableCoursePreparationPlacements": evidence.get("applicableCoursePreparationPlacements", []),
                "commonCourseAtomicSeedCount": evidence["commonCourseAtomicSeedCount"],
                "commonCourseAtomicSeedSha256": evidence["commonCourseAtomicSeedSha256"]})
        if stage == "CrossStage" and state in lower_authorities:
            lower_authorities[state] = (gk, lower_authorities[state][1])
    for state, (authority, seeds) in sorted(lower_authorities.items()):
        lower, evidence = lower_excerpt(authority, seeds)
        path = DIRECTORY / f"de-{state.lower()}-seki.view.json"
        outputs.append((path, lower))
        report.append({"file": path.name, "changed": not path.exists() or json.loads(path.read_text()) != lower, **evidence})
    for path, generated in outputs:
        if args.write:
            path.write_text(json.dumps(generated, ensure_ascii=False, indent=2) + "\n")
        elif json.loads(path.read_text()) != generated:
            raise ValueError("Stale Physics stage placement: " + path.name)
    for (_, generated), record in zip(outputs, report):
        record["acquisitionTemplateWitnesses"] = actual_acquisition_evidence(generated)
    if args.report:
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Physics stage views: {len(outputs)} {args.jurisdiction} views checked; atomic roles preserved.")


if __name__ == "__main__":
    main()
