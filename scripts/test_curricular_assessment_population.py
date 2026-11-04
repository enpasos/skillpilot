"""Assessment execution keeps the validated curricular review population."""
import unittest
import compile_curriculum_release_model as compiler
import validate_curriculum_release_model as validator


class CurricularAssessmentPopulationTest(unittest.TestCase):
    def test_actual_curricular_assessment_stays_in_both_independent_selectors(self):
        goal = {"id": "same-id", "contains": [], "semanticKind": "curricularAtomic",
                "nodeKind": "exam", "examData": {"taskContent": "Actual task"},
                "tags": ["Assessment"]}
        for module in [compiler, validator]:
            with self.subTest(module=module.__name__):
                self.assertTrue(module.is_review_relevant_leaf(goal))

    def test_non_curricular_roles_and_non_atomic_contracts_stay_out(self):
        for module in [compiler, validator]:
            for kind in ["practiceAssessment", "orientation", "memory", "runtimeSupport"]:
                with self.subTest(module=module.__name__, kind=kind):
                    self.assertFalse(module.is_review_relevant_leaf({"semanticKind": kind, "contains": []}))
            self.assertFalse(module.is_review_relevant_leaf({"semanticKind": "curricularAtomic", "contains": ["child"]}))

    def test_legacy_landscapes_keep_their_existing_fallback(self):
        for module in [compiler, validator]:
            with self.subTest(module=module.__name__):
                self.assertTrue(module.is_review_relevant_leaf({"contains": [], "tags": []}))
                self.assertFalse(module.is_review_relevant_leaf({"contains": [], "examData": {"taskContent": "Task"}}))
                self.assertFalse(module.is_review_relevant_leaf({"contains": [], "tags": ["Practice"]}))


if __name__ == "__main__":
    unittest.main()
