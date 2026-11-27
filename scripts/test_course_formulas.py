"""Tests of the formula check for courses built with units. SPDX-License-Identifier: Apache-2.0"""

import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_course_formulas import check, formula_findings  # noqa: E402


class FormulaFindings(unittest.TestCase):
    def test_tex_formulas_pass(self):
        for text in (
            "The weights $1$ and $2$ give $1(1, 1)^{\\mathsf T} + 2(1, 2)^{\\mathsf T} = (3, 5)^{\\mathsf T}$.",
            "Use the system\n\n$$\n\\begin{aligned} x + y &= 3 \\\\ x + 2y &= 5 \\end{aligned}\n$$\n\nName the objects.",
            "U1 · Linear systems by geometry and elimination",
            "At 10:42 and 23:12 in Lecture 1, read the components. Sections 10:42.360–11:35.530.",
            "Run `total = total + 1` and then\n\n```python\nx = 3\n```",
            "Run `echo $HOME` in a shell.",
            "It costs \\$5 and \\$10 today.",
            "See [the lecture](https://www.youtube.com/watch?v=abc&t=147s) and https://example.org/?n=1.",
            "The pass mark is 13 of 16 (81.25%).",
        ):
            self.assertEqual(formula_findings(text), [], text)

    def test_plain_text_formulas_are_reported(self):
        self.assertEqual(formula_findings("the columns are (1, 1)ᵀ and (1, 2)ᵀ"), ["ᵀ", "number tuple outside a formula"])
        self.assertEqual(formula_findings("coordinates b₁ and b₂"), ["₁", "₂"])
        self.assertEqual(formula_findings("have components (−2, 3)"), ["−", "number tuple outside a formula"])
        self.assertEqual(formula_findings("x + y = 3 define a line"), ["= outside a formula"])
        self.assertEqual(formula_findings("clear it with Rᵢ ← Rᵢ − mRⱼ"), sorted(["ᵢ", "ⱼ", "←", "−"]))
        self.assertEqual(formula_findings("```text\n⎡x⎤\n⎣z⎦\n```"), ["⎡", "⎣", "⎤", "⎦"])
        self.assertEqual(formula_findings("costs $5 today"), ["unpaired $"])
        self.assertEqual(formula_findings("Compare $5 and $10."), ["formula delimiter beside a space"])
        self.assertEqual(formula_findings("Expand x^2 + 1."), ["^ outside a formula"])
        self.assertEqual(formula_findings("The point (2, 3) lies on it."), ["number tuple outside a formula"])
        self.assertEqual(formula_findings("The point (−2, 3.5) lies on it."), ["−", "number tuple outside a formula"])


class CourseScope(unittest.TestCase):
    def write(self, root, name, document):
        path = root / "curricula" / "Course" / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(document, ensure_ascii=False), encoding="utf-8")

    def course(self, description, coverage="complete"):
        return {"landscapeId": "course", "learningUnitCoverage": coverage, "goals": [
            {"id": "g", "title": "Goal", "description": description,
             "resourceLinks": [{"url": "https://example.org/watch?v=abc&t=1", "altText": "the lines x + y = 3 meet"}],
             "extendedData": {"vocabularySource": "/data/deck.json"}}]}

    def test_course_with_complete_coverage_and_its_deck_are_checked(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write(root, "course.json", self.course("Solve $x + y = 3$."))
            self.write(root, "deck.json", {"cards": [{"front": "What is $Av$?", "back": "A vector."}]})
            self.assertEqual(check(root), (1, []))
            self.write(root, "deck.json", {"cards": [{"front": "What is m in Rᵢ?", "back": "A number."}]})
            courses, problems = check(root)
            self.assertEqual((courses, len(problems)), (1, 1))
            self.assertIn("deck.json/cards/0/front: ᵢ", problems[0])
            self.write(root, "course.json", self.course("Solve x + y = 3."))
            self.assertEqual(len(check(root)[1]), 2)

    def test_links_alt_texts_and_other_landscapes_are_outside_the_check(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write(root, "partial.json", self.course("Solve x + y = 3.", coverage="partial"))
            self.assertEqual(check(root), (0, []))

    def test_markdown_documents_beside_the_course_are_checked(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write(root, "course.json", self.course("Solve $x + y = 3$."))
            self.write(root, "deck.json", {"cards": []})
            (root / "curricula" / "Course" / "lecture-map.md").write_text("| Write a system as Au = b |\n", encoding="utf-8")
            problems = check(root)[1]
            self.assertEqual(len(problems), 1)
            self.assertIn("lecture-map.md/markdown: = outside a formula", problems[0])

    def test_a_missing_deck_is_reported(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write(root, "course.json", self.course("Solve $x + y = 3$."))
            self.assertEqual(len(check(root)[1]), 1)


if __name__ == "__main__":
    unittest.main()
