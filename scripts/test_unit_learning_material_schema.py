# SPDX-License-Identifier: Apache-2.0
"""The normal schema gate must discover materials through the live catalog."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from validate_schemas import validate_unit_learning_materials


ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "contracts/unit-learning-material/v1/material.schema.json"


class UnitLearningMaterialSchemaTests(unittest.TestCase):
    def setUp(self):
        temporary = TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name) / "curricula"
        self.root.mkdir()
        self.catalog = self.root / "unit-learning-materials.json"
        self.catalog.write_text(json.dumps({"schemaVersion": 1, "materials": ["one.json", "two.json"]}))
        introduction = {"question": "Why?", "promise": "Compare methods."}
        self.material = {
            "schemaVersion": 1,
            "unit": {"landscapeId": "computing", "compositionNodeId": "search", "viewIds": ["lecture"]},
            "intro": {"de": introduction, "en": introduction},
        }
        (self.root / "one.json").write_text(json.dumps(self.material))

    def validate_second(self, document):
        (self.root / "two.json").write_text(json.dumps(document))
        return validate_unit_learning_materials(self.root, SCHEMA)

    def test_intro_only_and_bilingual_practice(self):
        text = {"title": "Study", "prompt": "Compare two cases.", "hint": "Draw them.", "solution": "They differ."}
        practice = {"goalId": "comparison", "de": text, "en": {**text, "evidenceCriteria": ["Describe both."]}}
        self.assertEqual([], self.validate_second({**self.material, "exercises": [practice]}))
        for language in ("de", "en"):
            for bad in ("a string instead of a list", ["   "], [5]):
                with self.subTest(language=language, bad=bad):
                    row = {**practice, language: {**text, "evidenceCriteria": bad}}
                    errors = self.validate_second({**self.material, "exercises": [row]})
                    self.assertTrue(any(f"two.json $.exercises[0].{language}.evidenceCriteria" in e for e in errors))
        incomplete = {**practice, "en": {"title": "Missing the task"}}
        self.assertTrue(self.validate_second({**self.material, "exercises": [incomplete]}))

    def test_authored_version_and_fields_are_explicit(self):
        for fields in ({"schemaVersion": 2}, {"schemaVersion": "1"}, {"exercise": []}):
            with self.subTest(fields=fields):
                self.assertTrue(self.validate_second({**self.material, **fields}))
        del self.material["schemaVersion"]
        self.assertTrue(self.validate_second(self.material))

    def test_v2_guided_entry_is_complete_and_v1_remains_readable(self):
        introduction = {"question": "Why?", "promise": "Find out.", "scene": "A ball is held.",
                        "imageUrl": "/assets/ball.png", "imageAlt": "A ball.", "topics": ["Motion"]}
        versioned = {**self.material, "schemaVersion": 2,
                     "unit": {**self.material["unit"], "orientationGoalId": "intro"},
                     "intro": {"de": introduction, "en": introduction}}
        self.assertEqual([], self.validate_second(versioned))
        for field in ("scene", "imageUrl", "imageAlt", "topics"):
            incomplete = {**introduction}
            del incomplete[field]
            self.assertTrue(self.validate_second({**versioned, "intro": {"de": incomplete, "en": introduction}}))
        for image_url in ("https://provider.example/ball.png", "javascript:alert(1)"):
            invalid = {**introduction, "imageUrl": image_url}
            self.assertTrue(self.validate_second({**versioned, "intro": {"de": invalid, "en": introduction}}))
        self.assertTrue(self.validate_second({**versioned, "unit": self.material["unit"]}))

    def test_catalog_rejects_missing_or_outside_file(self):
        self.assertTrue(any("two.json" in e for e in validate_unit_learning_materials(self.root, SCHEMA)))
        outside = self.root.parent / "outside.json"
        outside.write_text(json.dumps(self.material))
        self.catalog.write_text(json.dumps({"schemaVersion": 1, "materials": ["../outside.json"]}))
        self.assertTrue(any("outside curriculum" in e for e in validate_unit_learning_materials(self.root, SCHEMA)))

    def test_only_v2_accepts_an_explicit_list_of_orientation_recall_obligations(self):
        example = ROOT / "curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json"
        document = json.loads(example.read_text())
        credit = document["unit"]["assessmentContract"]["planningCredits"][0]
        for ids in ([], ["recall"]):
            credit["orientation"] = {"requiredRecallGoalIds": ids}
            self.assertEqual([], self.validate_second(document))
        for invalid in ({}, {"requiredRecallGoalIds": ["recall", "recall"]}):
            credit["orientation"] = invalid
            self.assertTrue(self.validate_second(document))
        legacy = {**self.material, "unit": {**self.material["unit"],
                                            "assessmentContract": document["unit"]["assessmentContract"]}}
        del credit["orientation"]
        self.assertEqual([], self.validate_second(legacy))
        credit["orientation"] = {"requiredRecallGoalIds": []}
        self.assertTrue(self.validate_second(legacy))


if __name__ == "__main__":
    unittest.main()
