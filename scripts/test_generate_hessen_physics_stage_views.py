#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Regression checks for the explicit, source-bound HE duration projections."""
import copy
from collections import Counter
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import generate_hessen_physics_stage_views as generator


def find(view, identifier):
    return next(node for node in generator.walk(view["rootNodes"]) if node.get("id") == identifier)


def atomic_basis(view):
    seeds = generator.role_atoms(view)["target"]
    return seeds, seeds | {required for seed in seeds for required in generator.prerequisites(seed)}


def year_ownership(view):
    ownership = {}
    for year in find(view, "physics-seki")["children"]:
        if year["kind"] != "structure":
            continue
        for atom in generator.role_atoms({"rootNodes": [year]})["target"]:
            if atom in ownership:
                raise AssertionError("Repeated SekI learning place: " + atom)
            ownership[atom] = int(year["id"].split("-j")[1].split("-")[0])
    return ownership


class HessenPhysicsEPhasePlacement(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.views = {name: json.loads((generator.DIRECTORY / name).read_text())
                     for name in generator.FILES}

    def test_source_numbering_status_and_kinematic_learning_place(self):
        expected_topics = [
            ("physics-e1-motion", "E.1 Bewegungen und ihre Beschreibung"),
            ("physics-e2-newton-and-conservation", "E.2 Newton'sche Axiome und Erhaltungssätze"),
            ("he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49", "E.3 Kreisbewegung (Wurf bei E.1)"),
            ("he-physics-topic-04d1d2df-a94b-5db4-8d07-cbb512c2e0b9", "E.4 Weitere Bewegungen (nicht verbindlich)"),
            ("he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089", "E.5 Gravitation (nicht verbindlich)"),
            ("he-physics-topic-df11eb33-4900-52bf-93b3-eb82ff0f9a28", "E.6 Grundlagen der Thermodynamik (nicht verbindlich)"),
            ("he-physics-topic-9743baad-9371-52b6-98ee-72bc6dc68701", "E.7 Drehbewegungen (nicht verbindlich)"),
        ]
        outputs = {name: generator.generate(view)[0] for name, view in self.views.items()}
        outputs.update({path.name: view for path, view, _ in generator.duration_outputs()
                        if view["scope"]["stage"] != "SekI"})
        self.assertEqual(len(outputs), 8)
        for name, view in outputs.items():
            with self.subTest(view=name):
                phase = find(view, "physics-e-phase")
                self.assertEqual(phase["label"], "Einführungsphase: Mechanik")
                actual = [(node["id"], node["label"]) for node in phase["children"]
                          if node.get("id") in dict(expected_topics)]
                self.assertEqual(actual, expected_topics)
                motion = find(view, "physics-e1-motion")
                self.assertNotIn("6ea3fb3c-abdc-568f-ab13-97c36dc274e4",
                                 {node.get("goalId") for node in generator.walk(view["rootNodes"])})
                motion_atoms = generator.role_atoms({"rootNodes": [motion]})["target"]
                e3 = find(view, expected_topics[2][0])
                e3_atoms = generator.role_atoms({"rootNodes": [e3]})["target"]
                # E.1 cut (23 Nov 2026): the throw stays in E.1, vectors go to E.3.
                self.assertIn("89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2", motion_atoms)
                self.assertTrue(set(generator.E1_TO_E3) <= e3_atoms)
                self.assertFalse(set(generator.E1_TO_E3) & motion_atoms)
                self.assertFalse([node for node in generator.walk(phase["children"])
                                  if node.get("goalId") == generator.HORIZONTAL_THROW])
                units = [node for node in motion["children"] if node["kind"] == "structure"
                         and not node["id"].startswith("physics-required-preparation-")]
                self.assertEqual([(node["id"], node["label"], node["labelEn"]) for node in units],
                                 [unit[:3] for unit in generator.HESSEN_E1_CHILD_UNITS])
                self.assertEqual(motion["childOrder"]["after"], [
                    {"unit": units[index + 1]["id"], "after": units[index]["id"]} for index in range(3)])
                self.assertFalse(motion_atoms & e3_atoms)
                self.assertIn("Waagerechter Wurf", generator.GOALS["287739a3-6143-55d0-abe7-1a08889e9b49"]["title"])

    def test_assessments_are_local_without_importing_later_motion_content(self):
        obsolete = {"he-physics-topic-424b07df-bf66-5d7f-99f5-f28b32ad1f22",
                    "physics-current-measurement-5ff392b6", "physics-current-digital-modelling-5ff392b6",
                    "physics-he-practice-physics-e-phase"}
        outputs = {name: generator.generate(view)[0] for name, view in self.views.items()}
        outputs.update({path.name: view for path, view, _ in generator.duration_outputs()
                        if view["scope"]["stage"] != "SekI"})
        for name, view in outputs.items():
            with self.subTest(view=name):
                phase = find(view, "physics-e-phase")
                self.assertFalse(obsolete & {node.get("id") for node in generator.walk(phase["children"])})
                motion = find(view, "physics-e1-motion")
                for unit_id, assessments in (("physics-e1-air-and-vacuum", {generator.HESSEN_E1_VERTICAL_THROW_ASSESSMENT}),
                                             ("physics-e1-two-motions", {"bcc56921-7107-5f5f-b721-3d5e0d7e1cd9",
                                                                         "39f52dcb-ff1d-5cad-9ccb-30da803cfa85"})):
                    self.assertTrue(assessments <= {node.get("goalId") for node in find(view, unit_id)["children"]})
                self.assertEqual(motion["children"][-1]["id"], generator.HESSEN_E1_CHILD_UNITS[-1][0])
                self.assertEqual([node["id"] for node in motion["children"] if node.get("id") in
                                  {item[0] for item in generator.HESSEN_E1_CHILD_UNITS}],
                                 [item[0] for item in generator.HESSEN_E1_CHILD_UNITS])
                self.assertNotIn("2b9e565f-d9b4-5e23-b5b7-b7977cecff06", generator.role_atoms(view)["target"])
                self.assertNotIn(generator.TRAFFIC, generator.role_atoms({"rootNodes": [motion]})["target"])
                # This existing exam requires E.4 modelling and Newtonian
                # dynamics. Its sole learning place must preserve those needs
                # instead of silently moving them into E.1 for its title.
                mixed = "a9562b05-c54d-5635-9244-3f7dd24a8642"
                self.assertNotIn(mixed, generator.role_atoms({"rootNodes": [motion]})["target"])
                cross_topic = find(view, generator.E_PHASE_CROSS_TOPIC_ASSESSMENTS)
                self.assertEqual(cross_topic["label"], "Themenübergreifende Prüfungen")
                self.assertIn(mixed, {node.get("goalId") for node in cross_topic["children"]})
                references = [node for node in generator.walk(phase["children"]) if node.get("goalId") == mixed]
                self.assertEqual(len(references), 1)
                for identifier in ("ac25ffe3-fd42-592d-a937-79cc13460313", "30ddb2d7-b991-55fe-9e74-37ffe1048f9f"):
                    self.assertIn(identifier, generator.role_atoms({"rootNodes": [find(view,
                        "he-physics-topic-04d1d2df-a94b-5db4-8d07-cbb512c2e0b9")]})["target"])
                self.assertIn("5fd45dbc-0eb1-591b-99a9-7386336f1456", generator.role_atoms({"rootNodes": [find(view,
                    "physics-e2-newton-and-conservation")]})["target"])
                methods = find(view, "he-physics-topic-1e9ec823-384b-5e5f-974c-4ce224d05c19")
                self.assertTrue({"0521c3ce-999b-5b35-bb3c-7042f24a30ce", "de1ed3f0-80b2-5544-9971-c8392f76a3e8",
                                 "16bfb017-53d6-5328-a4e3-2e2b4e4398a9"}
                                <= {node.get("goalId") for node in methods["children"]})

    def test_e1_assessment_admission_only_adds_the_two_targets(self):
        exams = set(generator.HESSEN_E1_ASSESSMENTS)
        for name, current in self.views.items():
            with self.subTest(view=name):
                previous = copy.deepcopy(current)
                motion = find(previous, "physics-e1-motion")
                motion["children"] = [node for node in motion["children"] if node.get("goalId") not in exams]
                generated, _ = generator.generate(previous)
                self.assertEqual(generated, current)
                old_seeds, old_learning = atomic_basis(previous)
                new_seeds, new_learning = atomic_basis(generated)
                self.assertEqual(new_seeds, old_seeds | exams)
                self.assertEqual(new_learning, old_learning | exams)
                self.assertEqual(generator.role_atoms(generated)["prerequisiteOnly"],
                                 generator.role_atoms(previous)["prerequisiteOnly"])

    def test_e1_child_assessments_replace_historical_references_one_for_one(self):
        replacements = generator.HESSEN_E1_CHILD_ASSESSMENT_VARIANTS
        historical_by_variant = {variant: historical for historical, variant in replacements.items()}
        for name, current in self.views.items():
            with self.subTest(view=name):
                previous = copy.deepcopy(current)
                motion = find(previous, "physics-e1-motion")
                for node in generator.walk(motion["children"]):
                    identifier = node.get("goalId")
                    if identifier in historical_by_variant:
                        node["goalId"] = historical_by_variant[identifier]
                generated, _ = generator.generate(previous)
                self.assertEqual(generated, current)
                old_seeds, old_learning = atomic_basis(previous)
                new_seeds, new_learning = atomic_basis(generated)
                self.assertEqual(new_seeds, {replacements.get(identifier, identifier) for identifier in old_seeds})
                self.assertEqual(new_learning, {replacements.get(identifier, identifier) for identifier in old_learning})
                self.assertEqual(generator.role_atoms(generated)["prerequisiteOnly"],
                                 generator.role_atoms(previous)["prerequisiteOnly"])
                references = [node.get("goalId") for node in generator.walk(generated["rootNodes"])]
                self.assertTrue(set(replacements).isdisjoint(references))
                self.assertTrue(all(references.count(variant) == 1 for variant in replacements.values()))

    def test_pre_cut_throw_subtree_is_opened_once_with_unchanged_roles(self):
        for name, current in self.views.items():
            with self.subTest(view=name):
                # Reproduce the pre-cut input: the reviewed throw subtree inside E.1
                # instead of its atoms. Opening it must not change roles or basis.
                legacy = copy.deepcopy(current)
                parts = set(generator.GOALS[generator.HORIZONTAL_THROW]["contains"])
                for node in generator.walk(find(legacy, "physics-e-phase")["children"]):
                    if node["kind"] == "structure":
                        node["children"] = [child for child in node["children"] if child.get("goalId") not in parts
                                            or child.get("projectionRole") == "prerequisiteOnly"]
                find(legacy, "physics-e1-motion")["children"].append(
                    {"kind": "canonicalSubtree", "goalId": generator.HORIZONTAL_THROW})
                repaired, _ = generator.generate(legacy)
                self.assertEqual(generator.role_atoms(repaired), generator.role_atoms(current))
                self.assertEqual(atomic_basis(repaired), atomic_basis(current))
                self.assertEqual(repaired, current)
                self.assertEqual(generator.generate(repaired)[0], repaired)

    def test_missing_topic_or_duplicate_or_wrong_throw_reference_fails_closed(self):
        original = self.views["de-he-gk.view.json"]
        missing_topic = copy.deepcopy(original)
        phase = find(missing_topic, "physics-e-phase")
        phase["children"] = [node for node in phase["children"] if node.get("id") != "physics-e1-motion"]
        with self.assertRaisesRegex(ValueError, "expected one E-phase authoring topic physics-e1-motion"):
            generator.generate(missing_topic)
        for mutation in ("duplicate", "wrong-kind"):
            with self.subTest(mutation=mutation):
                invalid = copy.deepcopy(original)
                motion = find(invalid, "physics-e1-motion")
                throw = {"kind": "canonicalSubtree" if mutation == "duplicate" else "goalEntry",
                         "goalId": generator.HORIZONTAL_THROW}
                motion["children"].extend([throw, copy.deepcopy(throw)] if mutation == "duplicate" else [throw])
                with self.assertRaisesRegex(ValueError, "at most one reviewed horizontal-throw subtree"):
                    generator.generate(invalid)
        missing_member = copy.deepcopy(original)
        unit = find(missing_member, "physics-e1-two-motions")
        unit["children"] = [node for node in unit["children"] if node.get("goalId") != "39f52dcb-ff1d-5cad-9ccb-30da803cfa85"]
        generated, _ = generator.generate(missing_member)
        self.assertEqual(generated, original, "an E.1 assessment is admitted again into its child unit")

    def test_explicit_ephase_policy_and_separate_complete_requirement_candidates(self):
        expected_topics = [("physics-e2-newton-and-conservation", "physics-e1-motion"),
            ("he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49", "physics-e2-newton-and-conservation")]
        optional = list(generator.E_PHASE_TOPICS)[3:]
        e3 = "he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49"
        expected_topics.extend((identifier, "physics-e2-newton-and-conservation" if index == 2 else e3)
                               for index, identifier in enumerate(optional))
        outputs = list(self.views.values()) + [view for _, view, _ in generator.duration_outputs()
                                               if view["scope"]["stage"] != "SekI"]
        orders = []
        for view in outputs:
            with self.subTest(view=view["viewId"]):
                self.assertEqual(view["$schema"], generator.PARTIAL_ORDER_SCHEMA)
                self.assertEqual(view["viewFormatVersion"], "1.2")
                phase = find(view, "physics-e-phase")
                order, witnesses = generator.ephase_child_order(phase, lambda node: generator.role_atoms({"rootNodes": [node]})["target"])
                self.assertEqual({(pair["unit"], pair["after"]) for pair in phase["childOrder"]["after"]
                                  if pair["unit"] in generator.E_PHASE_TOPICS and pair["after"] in generator.E_PHASE_TOPICS}, set(expected_topics))
                orders.append(phase["childOrder"])
                pairs = {(pair["unit"], pair["after"]) for pair in order["after"]}
                self.assertEqual(pairs & {(later, earlier) for later in generator.E_PHASE_TOPICS for earlier in generator.E_PHASE_TOPICS}, set(expected_topics))
                ancestors = lambda unit: self.order_ancestors(unit, pairs)
                for unit, previous in pairs:
                    self.assertFalse(any(previous in ancestors(middle) for middle in ancestors(unit) if middle != previous), (unit, previous))
                for left in optional:
                    for right in optional:
                        self.assertNotIn(right, ancestors(left))
                ownership = {atom: node["id"] for node in phase["children"] if node["kind"] == "structure"
                             for atom in generator.role_atoms({"rootNodes": [node]})["target"]}
                for dependent, unit in ownership.items():
                    for required in generator.prerequisites(dependent):
                        if required in ownership and ownership[required] != unit:
                            self.assertIn(ownership[required], ancestors(unit), (dependent, required))
                for record in witnesses:
                    witness = record["witness"]
                    self.assertEqual(witness["kind"], "canonicalRequirement")
                    self.assertIn(witness["requiredGoalId"], generator.prerequisites(witness["dependentGoalId"]))
                    self.assertEqual(ownership[witness["dependentGoalId"]], record["unit"])
                    self.assertEqual(ownership[witness["requiredGoalId"]], record["after"])
        combined = {(p["unit"], p["after"]) for order in orders for p in order["after"]}
        for unit, _ in combined:
            self.assertNotIn(unit, self.order_ancestors(unit, combined), "Course-specific preparation must merge without a cycle")
        for left in optional:
            for right in optional:
                if left != right:
                    self.assertNotIn(right, self.order_ancestors(left, combined), "The optional E.4--E.7 fields stay parallel after profile union")

    @staticmethod
    def order_ancestors(unit, pairs):
        found, pending = set(), [previous for later, previous in pairs if later == unit]
        while pending:
            previous = pending.pop()
            if previous in found:
                continue
            found.add(previous)
            pending.extend(earlier for later, earlier in pairs if later == previous)
        return found

    def test_conflicting_real_demands_cannot_be_covered_with_a_planning_cycle(self):
        identifiers = list(generator.E_PHASE_TOPICS)[:3]
        phase = {"children": [generator.structure(identifier, identifier, []) for identifier in identifiers]}
        atoms = {identifier: {str(index)} for index, identifier in enumerate(identifiers)}
        with patch.object(generator, "prerequisites", side_effect=lambda atom: {"1"} if atom == "0" else set()):
            with self.assertRaisesRegex(ValueError, "Cyclic E-phase planning order"):
                generator.ephase_child_order(phase, lambda node: atoms[node["id"]])

    def test_all_he_thematic_parents_are_partial_and_srt_has_no_invented_q4_predecessor(self):
        views = list(self.views.values()) + [view for _, view, _ in generator.duration_outputs()]
        for view in views:
            for parent in generator.walk(view["rootNodes"]):
                if parent["kind"] != "structure":
                    continue
                groups = [node for node in parent["children"] if node["kind"] == "structure"]
                if len(groups) < 2:
                    continue
                with self.subTest(view=view["viewId"], parent=parent["id"]):
                    self.assertIn("childOrder", parent)
                    raw_selected = generator.role_atoms(view)["target"]
                    seeds = generator.course_seeds(raw_selected, generator.GOALS, view["scope"])
                    learning = seeds | {p for seed in seeds for p in generator.prerequisites(seed)}
                    selected = raw_selected & learning
                    ownership = {atom: node["id"] for node in groups
                                 for atom in generator.learning_atoms(node, selected, learning)}
                    pairs = {(pair["unit"], pair["after"]) for pair in parent["childOrder"]["after"]}
                    actual = {(unit, ownership[required]) for atom, unit in ownership.items()
                              for required in generator.GOALS[atom].get("requires", []) if required in ownership and ownership[required] != unit}
                    temporal = parent["id"] in ("physics-root", "physics-seki") or parent["id"].startswith("physics-sekii-")
                    if not temporal:
                        # Declared unit progressions cover the direct atomic
                        # cuts; paths through a loose parent atom remain
                        # independently demand-ordered rather than inventing
                        # an extra whole-unit predecessor.
                        allowed = actual | set(generator.E_PHASE_PLANNING_POLICY if parent["id"] == "physics-e-phase" else [])
                        for unit, previous in actual:
                            self.assertIn(previous, self.order_ancestors(unit, pairs))
                        for unit, previous in pairs:
                            self.assertIn(previous, self.order_ancestors(unit, allowed))
            phases = [node for node in generator.walk(view["rootNodes"]) if node.get("id") == "physics-q4"]
            if phases:
                q4 = phases[0]
                srt = next(node for node in q4["children"] if node.get("label") == "Spezielle Relativitätstheorie")
                self.assertFalse(any(pair["unit"] == srt["id"] for pair in q4["childOrder"]["after"]))
                srt_atoms = generator.role_atoms({"rootNodes": [srt]})["target"]
                other_q4 = generator.role_atoms({"rootNodes": [q4]})["target"] - srt_atoms
                self.assertFalse({required for atom in srt_atoms for required in generator.prerequisites(atom)} & other_q4)


class HessenPhysicsDurationViews(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.originals = {profile: json.loads((generator.DIRECTORY / f"de-he-{profile}.view.json").read_text())
                         for profile in ("gk", "lk")}
        cls.outputs = {path.name: (view, report) for path, view, report in generator.duration_outputs()}

    def test_exact_scope_roles_seeds_basis_and_common_upper_secondary(self):
        for profile, original in self.originals.items():
            for duration in ("g8", "g9"):
                view, _ = self.outputs[f"de-he-{profile}-{duration}.view.json"]
                with self.subTest(profile=profile, duration=duration):
                    self.assertEqual(generator.role_atoms(view), generator.role_atoms(original))
                    self.assertEqual(atomic_basis(view), atomic_basis(original))
                    self.assertEqual(find(view, "physics-sekii-" + profile), find(original, "physics-sekii-" + profile))
                    self.assertEqual(view["viewId"], f"de-he-gym-physics-{profile}-{duration}")
                    self.assertEqual(view["scope"], {**original["scope"], "durationModel": duration.upper()})
            g9, _ = self.outputs[f"de-he-{profile}-g9.view.json"]
            self.assertEqual(g9["rootNodes"], original["rootNodes"])

    def test_seki_scope_is_the_same_reviewed_excerpt_for_both_profiles(self):
        for duration in ("g8", "g9"):
            view, _ = self.outputs[f"de-he-seki-{duration}.view.json"]
            self.assertEqual(view["scope"]["stage"], "SekI")
            self.assertNotIn("courseProfile", view["scope"])
            self.assertFalse(any(node.get("id", "").startswith("physics-sekii-") for node in generator.walk(view["rootNodes"])))
            self.assertTrue(set(generator.HESSEN_E1_ASSESSMENTS).isdisjoint(atomic_basis(view)[1]))
            for profile in ("gk", "lk"):
                crossstage, _ = self.outputs[f"de-he-{profile}-{duration}.view.json"]
                self.assertEqual(find(view, "physics-seki"), find(crossstage, "physics-seki"))
                self.assertEqual(generator.role_atoms(view)["target"], generator.role_atoms({"rootNodes": [find(crossstage, "physics-seki")]})["target"])

    def test_g8_source_years_topic_status_and_distinct_content_splits(self):
        view, _ = self.outputs["de-he-gk-g8.view.json"]
        self.assertEqual([node["id"] for node in find(view, "physics-seki")["children"]],
                         [f"physics-he-seki-j{year}-g8" for year in (6, 7, 8, 9)])
        places = year_ownership(view)
        expected = {
            "dd7cdcea-0950-461b-96ac-ce49989fca47": 6,  # basic light
            "51de4fd9-6827-5b3d-b2ca-5e27ba961a7f": 6,  # thermometer
            "f778a659-1467-4aa7-97b2-bed78c530634": 6,  # permanent magnets
            "078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5": 7,  # lenses, not basic optics6
            "9ac4973a-21d5-48a5-90b4-eb90e10391ae": 7,  # particle model
            "f1a078ae-6262-4444-a4bc-a5ab275621cf": 7,  # current measurement
            "5308de76-79f0-44f4-8cb7-fc9de4772217": 8,  # pressure is mandatory
            "c1006f55-0406-48cc-92d4-0d8345897cf4": 8,  # optional acoustics
            "a4681378-ade4-4f20-bf77-fb020469510f": 8,  # optional colours
            "2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb": 9,  # atom/nuclear topic
            "0dd1e39c-8557-5a4e-b467-caae964fff67": 9,  # supply application
        }
        for atom, year in expected.items():
            self.assertEqual(places[atom], year, atom)
        self.assertNotIn("fakultativ", find(view, "physics-he-g8-topic-8g-3")["label"])
        for code in ("8g-4a", "8g-4b"):
            self.assertIn("fakultativ", find(view, "physics-he-g8-topic-" + code)["label"])
        source = json.loads(generator.G8_SOURCE.read_text())
        self.assertNotIn("passages", source, "Do not distribute full official-PDF text as verification evidence")
        optional = {topic["topicCode"]: topic["officialOptionalPlacementReferences"]
                    for topic in source["placementTopics"] if "officialOptionalPlacementReferences" in topic}
        self.assertEqual(optional, {
            "7G.1": ["6367d45e-919e-4c19-bcd9-7770a2d51139"],
            "8G.1": ["e41356c1-968b-435a-af25-b663f080ae5a", "581c0766-b84b-54cb-b8b6-375310329a41"]})

    def test_seki_excerpt_does_not_free_upper_course_support(self):
        upper_support = {
            "09029573-864f-40ca-bf8a-cee7bf6dcb73", "09f2cdbd-64e0-55d2-ada7-1190f4fd50df",
            "1b833656-cd16-5b21-973a-9810960dcfd2", "206fe51d-cc78-5422-b139-32cc97eb1c37",
            "330808f6-789a-583d-86df-e271a7683d8b", "38e0ff49-f132-44c8-b17a-73dada5344db",
            "481ffd56-d585-56fe-b525-ed423e30eed3", "73b309ed-1aab-5778-8494-d9b65f5a352b",
            "a0aaedcb-41f8-4891-af77-a69a76b8c10d", "ad984bb6-e225-432a-952d-d83cda40b7f8",
            "c968d263-8be4-5cf9-b320-e95398fe648f", "e3bce51c-cfeb-4706-b95e-a22b76e7dd73",
            "e4b38061-1f28-43ad-8371-a3e7c0e81856",
        }
        for duration in ("g8", "g9"):
            view, report = self.outputs[f"de-he-seki-{duration}.view.json"]
            crossstage, _ = self.outputs[f"de-he-gk-{duration}.view.json"]
            self.assertEqual({item["goalId"] for item in report["stageResolvedSupportPruning"]}, upper_support)
            self.assertFalse(upper_support & generator.role_atoms(view)["prerequisiteOnly"])
            self.assertFalse(upper_support & atomic_basis(view)[1])
            self.assertTrue({"13b338eb-f761-5817-9058-11043b9cb253", "f74c691b-0b76-54e0-8fd6-a22211994e0a"}
                            <= generator.role_atoms(view)["prerequisiteOnly"])
            self.assertEqual(atomic_basis(view), atomic_basis({"rootNodes": [find(crossstage, "physics-seki")]}))
            def outer_foreign_refs(nodes):
                found = []
                for node in nodes:
                    if node.get("id") == "physics-seki" or node.get("id", "").startswith("physics-sekii-"):
                        continue
                    if node["kind"] == "structure":
                        found.extend(outer_foreign_refs(node["children"]))
                    elif generator.GOAL_OWNERS[node["goalId"]] != view["landscapeId"]:
                        found.append(node)
                return found
            self.assertEqual(outer_foreign_refs(view["rootNodes"]), outer_foreign_refs(crossstage["rootNodes"]))

    def test_true_early_demands_and_latest_exercise_placement_are_preserved(self):
        for profile in ("gk", "lk"):
            view, report = self.outputs[f"de-he-{profile}-g8.view.json"]
            ownership = year_ownership(view)
            self.assertEqual({shift["goalId"] for shift in report["earlierDemandPlacements"]}, {
                "5ea765ac-c279-551a-8a94-a07da2381e5b", "ae67bcf1-f3ee-50d6-9a12-25a159dff659",
                "722857cf-f327-5740-8151-64eb92195ec8", "eeba6bf8-a2b9-4d7d-a1d6-67286c923cef",
                "b92827a7-5d62-5fdb-a6f5-ac44461f4a7b"})
            for shift in report["earlierDemandPlacements"]:
                self.assertIn(shift["goalId"], generator.prerequisites(shift["neededBy"]))
                self.assertLess(ownership[shift["goalId"]], shift["sourcePlacement"]["year"])
            for atom, year in ownership.items():
                for required in generator.prerequisites(atom) & ownership.keys():
                    self.assertLessEqual(ownership[required], year, (atom, required))
                if generator.GOALS[atom]["title"].startswith("Prüfungsaufgabe:"):
                    latest = max((ownership[required] for required in generator.prerequisites(atom) & ownership.keys()), default=6)
                    self.assertEqual(year, latest, atom)

    def test_replay_does_not_write_four_retained_inputs(self):
        before = {name: (generator.DIRECTORY / name).read_bytes() for name in generator.FILES}
        subprocess.run(["python", str(Path(generator.__file__)), "--write", "--duration-views"], check=True)
        subprocess.run(["python", str(Path(generator.__file__)), "--check", "--duration-views"], check=True)
        self.assertEqual(before, {name: (generator.DIRECTORY / name).read_bytes() for name in generator.FILES})

    def test_missing_anchor_unknown_scope_and_changed_source_fail_closed(self):
        original = self.originals["gk"]
        unknown = copy.deepcopy(original)
        unknown["scope"]["jurisdiction"] = "DE-BY"
        with self.assertRaisesRegex(ValueError, "HE CrossStage"):
            generator.generate_g8(unknown)
        missing = copy.deepcopy(original)
        find(missing, "physics-he-seki-methods")["children"] = []
        with self.assertRaisesRegex(ValueError, "missing G8 authoring reference"):
            generator.generate_g8(missing)
        source = json.loads(generator.G8_SOURCE.read_text())
        source["sourceDocument"]["sha256"] = "0" * 64
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "source.json"
            path.write_text(json.dumps(source))
            with patch.object(generator, "G8_SOURCE", path), self.assertRaisesRegex(ValueError, "placement extraction digest mismatch"):
                generator.generate_g8(original)

    def test_optional_pdf_cache_needs_no_network_and_supplied_bytes_are_checked(self):
        with tempfile.TemporaryDirectory() as directory:
            pdf = Path(directory) / "absent-working-copy.pdf"
            self.assertFalse(generator.check_g8_working_copy(pdf, "0" * 64))
            pdf.write_bytes(b"a supplied, altered PDF working copy")
            with self.assertRaisesRegex(ValueError, "source digest mismatch"):
                generator.check_g8_working_copy(pdf, "0" * 64)
        expected, _ = generator.generate_g8(self.originals["gk"])
        # Use the real no-cache branch while all retained source bytes stay intact.
        check = generator.check_g8_working_copy
        with tempfile.TemporaryDirectory() as directory:
            absent = Path(directory) / "not-cached.pdf"
            with patch.object(generator, "check_g8_working_copy", lambda _path, digest: check(absent, digest)):
                actual, _ = generator.generate_g8(self.originals["gk"])
        self.assertEqual(actual, expected)

    def test_upper_only_stage_identity_and_late_risk_placement_repair(self):
        for profile in ("gk", "lk"):
            current = json.loads((generator.DIRECTORY / f"de-he-sekii-{profile}.view.json").read_text())
            root = find(current, "physics-root")
            stage = find(current, "physics-sekii-" + profile)
            self.assertIn(stage, root["children"])
            self.assertTrue(all(node.get("projectionRole") == "prerequisiteOnly"
                                for child in root["children"] if child is not stage
                                for node in generator.walk([child]) if node["kind"] != "structure"))
            self.assertEqual(root["label"], "Physik")
            self.assertEqual(stage["label"], "Sekundarstufe II (" + profile.upper() + ")")
            risk = "bb5c5eab-2fc1-5336-b8cf-14d147695487"
            field = find(current, "b034-preserved-rootNodes-0-children-13-children-3")
            self.assertTrue(any(node.get("goalId") == risk for node in field["children"]))
            self.assertFalse(any(node.get("goalId") == risk for node in generator.walk(find(current, "physics-b034-nuclear")["children"])))
            legacy = copy.deepcopy(current)
            root = find(legacy, "physics-root")
            stage = find(legacy, "physics-sekii-" + profile)
            global_support = [node for node in root["children"] if node is not stage]
            legacy["rootNodes"] = [root, *global_support]
            root["label"], root["labelEn"], root["children"] = stage["label"], stage["labelEn"], stage["children"]
            field = find(legacy, "b034-preserved-rootNodes-0-children-13-children-3")
            reference = next(node for node in field["children"] if node.get("goalId") == risk)
            field["children"].remove(reference)
            find(legacy, "physics-b034-nuclear")["children"].append(reference)
            repaired, _ = generator.generate(legacy)
            self.assertEqual(generator.role_atoms(repaired), generator.role_atoms(legacy))
            self.assertEqual(atomic_basis(repaired), atomic_basis(legacy))
            self.assertEqual(repaired, current)


if __name__ == "__main__":
    unittest.main()
