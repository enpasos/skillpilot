"""Regression tests for the curriculum pass-mark check. SPDX-License-Identifier: Apache-2.0"""

import unittest
from check_exam_pass_marks import requires_revision


class ExamPassMarkTest(unittest.TestCase):
    def test_new_and_revised_work_must_be_passable_below_full_marks(self):
        old = {"taskContent": "A", "scoring": {"maxPoints": 12, "passingPoints": 12}}
        self.assertTrue(requires_revision(old, None))
        for key, value in (("taskContent", "B"), ("solutionContentEn", "C"), ("coveredGoalIds", ["g"])):
            self.assertTrue(requires_revision({**old, key: value}, old), key)
        self.assertFalse(requires_revision({**old, "scoring": {"maxPoints": 12, "passingPoints": 10}}, old))

    def test_new_and_revised_work_needs_an_achievable_pass_mark(self):
        def exam(passing, maximum):
            return {"taskContent": "A", "scoring": {"maxPoints": maximum, "passingPoints": passing}}
        # Half a point below the maximum met the earlier rule and still failed after two small slips.
        for passing, maximum in ((15.5, 16), (19, 20), (35.5, 36), (23, 24), (13, 14)):
            self.assertTrue(requires_revision(exam(passing, maximum), None), (passing, maximum))
        # The accepted Hessian E.1 parts and other marks of at most 85 percent pass.
        for passing, maximum in ((14, 17), (15, 18), (17, 20), (13.5, 16), (30.5, 36), (4, 5), (1.5, 2)):
            self.assertFalse(requires_revision(exam(passing, maximum), None), (passing, maximum))
        strict = exam(19, 20)
        self.assertFalse(requires_revision({**strict, "reviewStatus": "released"}, strict))
        self.assertTrue(requires_revision({**strict, "taskContent": "B"}, strict))

    def test_preexisting_material_and_binary_decisions(self):
        old = {"scoring": {"maxPoints": 5, "passingPoints": 5}}
        self.assertFalse(requires_revision({**old, "reviewStatus": "released"}, old))
        self.assertFalse(requires_revision({"scoring": {"maxPoints": 1, "passingPoints": 1}}, None))
        normalized = {"scoring": {"maxPoints": 1, "passingPoints": 1, "steps": [{"points": 0.5}, {"points": 0.5}]}}
        self.assertTrue(requires_revision(normalized, None))


if __name__ == "__main__":
    unittest.main()
