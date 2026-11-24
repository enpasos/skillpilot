# SPDX-License-Identifier: Apache-2.0
"""The normal schema gate must discover materials through the live catalog."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from validate_schemas import validate_unit_learning_materials


ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "contracts/unit-learning-material/v1/material.schema.json"
HESSE_E1_MATERIAL = ROOT / "curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json"
FREE_FALL_MATERIAL = ROOT / "curricula/DE/Gymnasium/materials/physics/he-e1-accelerated-and-free-fall.json"
PHYSICS_LANDSCAPE = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json"
HORIZONTAL_THROW = "89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2"
PART_B = "39f52dcb-ff1d-5cad-9ccb-30da803cfa85"
VOLUNTARY_PART_B = "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9"


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

    def recommendation_fixture(self):
        document = json.loads(HESSE_E1_MATERIAL.read_text())
        document["studyRecommendations"] = [
            {"beforeGoalId": HORIZONTAL_THROW, "afterGoalId": PART_B},
            {"beforeGoalId": HORIZONTAL_THROW, "afterGoalId": VOLUNTARY_PART_B},
        ]
        return document

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

    def test_regular_learning_marker_is_a_language_independent_v3_boolean(self):
        introduction = {"question": "Why?", "promise": "Find out.", "scene": "A ball is held.",
                        "imageUrl": "/assets/ball.png", "imageAlt": "A ball.", "topics": ["Motion"]}
        material = {**self.material, "schemaVersion": 3,
                    "unit": {**self.material["unit"], "orientationGoalId": "intro"},
                    "intro": {"de": introduction, "en": introduction}}
        text = {"title": "Compare", "prompt": "Compare two cases.", "hint": "Plot them.", "solution": "They differ."}
        task = {"goalId": "comparison", "de": text, "en": text}
        for fields in ({}, {"requiredForRegularLearning": True}, {"requiredForRegularLearning": False}):
            self.assertEqual([], self.validate_second({**material, "exercises": [{**task, **fields}]}))
        for invalid in ({"requiredForRegularLearning": "true"}, {"de": {**text, "requiredForRegularLearning": True}}):
            self.assertTrue(self.validate_second({**material, "exercises": [{**task, **invalid}]}))
        marked = {**task, "requiredForRegularLearning": True}
        self.assertTrue(self.validate_second({**material, "schemaVersion": 2, "exercises": [marked]}))

    def test_only_v3_and_v4_accept_typed_individual_assessment_offers(self):
        document = json.loads(FREE_FALL_MATERIAL.read_text())
        offer = document["individualAssessmentOffers"][0]
        for version in (3, 4):
            self.assertEqual([], self.validate_second({**document, "schemaVersion": version}))
        for offers in ([], [offer, offer], [dict(targetGoalId="protocol")],
                       [dict(targetGoalId="protocol", assessmentGoalId=" ")], [dict(offer, required=True)]):
            with self.subTest(offers=offers):
                self.assertTrue(self.validate_second({**document, "individualAssessmentOffers": offers}))
        self.assertTrue(self.validate_second({**self.material, "individualAssessmentOffers": [offer]}))

    def test_v3_and_v4_sequence_regular_content_steps_and_their_linked_assessment(self):
        document = json.loads(FREE_FALL_MATERIAL.read_text())
        document["unit"]["assessmentGoalId"] = "assess"
        for version in (3, 4):
            document["schemaVersion"] = version
            self.assertEqual([], self.validate_second({**document, "guidedStudyOrder": ["measure", "model", "assess"]}))
            for order in ([], ["assess"], ["measure", "measure", "assess"], ["measure", "other"],
                          [document["unit"]["orientationGoalId"], "assess"]):
                with self.subTest(version=version, order=order):
                    self.assertTrue(self.validate_second({**document, "guidedStudyOrder": order}))

    def test_hesse_e1_v4_orders_throw_by_prerequisites_without_parent_recommendations(self):
        document = json.loads(HESSE_E1_MATERIAL.read_text())
        self.assertEqual(4, document["schemaVersion"])
        self.assertNotIn("studyRecommendations", document)
        # The E.1 cut makes the order a real prerequisite. The four native Hessen
        # projections and child-unit-4 order are covered by testHessePhysicsFlashcardActions.ts.
        goals = {goal["id"]: goal for goal in json.loads(PHYSICS_LANDSCAPE.read_text())["goals"]}
        for assessment_id in (PART_B, VOLUNTARY_PART_B):
            self.assertIn(HORIZONTAL_THROW, goals[assessment_id]["requires"])
        self.assertEqual([], self.validate_second(document))

    def test_study_recommendations_are_optional_v4_pairs_of_goal_uuids(self):
        document = self.recommendation_fixture()
        first, _ = document.pop("studyRecommendations")
        self.assertEqual([], self.validate_second(document))
        self.assertEqual([], self.validate_second({**document, "studyRecommendations": []}))
        for version in (1, 2, 3):
            errors = self.validate_second({**document, "schemaVersion": version, "studyRecommendations": [first]})
            self.assertTrue(any("studyRecommendations" in error for error in errors))
        for recommendations in (None, first, [first, first], [{"beforeGoalId": HORIZONTAL_THROW}],
                                [{**first, "beforeGoalId": "unknown"}], [{**first, "afterGoalId": PART_B + "\n"}],
                                [{**first, "requiresMastery": True}]):
            with self.subTest(recommendations=recommendations):
                errors = self.validate_second({**document, "studyRecommendations": recommendations})
                self.assertTrue(any("$.studyRecommendations" in error for error in errors))

    def test_study_recommendations_reject_self_links_and_indirect_cycles(self):
        document = self.recommendation_fixture()
        first, second = document["studyRecommendations"]
        for recommendations, expected in (
            ([{**first, "afterGoalId": HORIZONTAL_THROW.upper()}], "before itself"),
            ([first, {**first, "beforeGoalId": HORIZONTAL_THROW.upper()}], "duplicate goal pair"),
            ([first, {"beforeGoalId": PART_B, "afterGoalId": HORIZONTAL_THROW}], "recommendation cycle"),
            ([first, {**second, "beforeGoalId": PART_B},
              {"beforeGoalId": VOLUNTARY_PART_B, "afterGoalId": HORIZONTAL_THROW}], "recommendation cycle"),
        ):
            with self.subTest(recommendations=recommendations):
                errors = self.validate_second({**document, "studyRecommendations": recommendations})
                self.assertTrue(any(expected in error for error in errors))

    def test_catalog_rejects_missing_or_outside_file(self):
        self.assertTrue(any("two.json" in e for e in validate_unit_learning_materials(self.root, SCHEMA)))
        outside = self.root.parent / "outside.json"
        outside.write_text(json.dumps(self.material))
        self.catalog.write_text(json.dumps({"schemaVersion": 1, "materials": ["../outside.json"]}))
        self.assertTrue(any("outside curriculum" in e for e in validate_unit_learning_materials(self.root, SCHEMA)))

    def test_versioned_orientation_credits_require_an_explicit_list_of_recall_obligations(self):
        document = json.loads(HESSE_E1_MATERIAL.read_text())
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
