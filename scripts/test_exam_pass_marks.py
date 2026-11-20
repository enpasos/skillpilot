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

    def test_preexisting_material_and_binary_decisions(self):
        old = {"scoring": {"maxPoints": 5, "passingPoints": 5}}
        self.assertFalse(requires_revision({**old, "reviewStatus": "released"}, old))
        self.assertFalse(requires_revision({"scoring": {"maxPoints": 1, "passingPoints": 1}}, None))


if __name__ == "__main__":
    unittest.main()
