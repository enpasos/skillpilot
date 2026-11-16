#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Regression checks for the explicit, source-bound HE duration projections."""
import copy
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
