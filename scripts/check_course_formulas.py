"""Check that courses built with units write their formulas in TeX. SPDX-License-Identifier: Apache-2.0

Product Owner, 27 November 2026: every mathematical expression is written in TeX, because a
rendered formula reads much better than its plain-text imitation. The check covers the
landscapes that state `learningUnitCoverage: "complete"` (courses built with units) and the
card decks and Markdown documents beside them. It reports in a learner-facing text a
character that imitates formula typesetting (superscripts and subscripts, the minus sign,
the multiplication sign, arrows, relations, pieces of large brackets), an equals sign, a
caret or a tuple of numbers outside a formula, an unpaired dollar sign, and a formula whose
delimiter stands beside a space (remark-math reads "$5 and $10" as one formula). Code,
escaped dollar signs and link addresses are not read. Formulas stand between `$…$` or
`$$…$$`. Alternative texts of images stay plain, because a screen reader reads them aloud.
A lone variable written as a plain letter is not detected; that stays a matter of review.
"""

import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
TEXT_KEYS = {"markdown", "title", "titleEn", "description", "descriptionEn", "taskContent", "taskContentEn",
             "solutionContent", "solutionContentEn", "label", "labelEn", "promise", "promiseEn", "front", "back"}
# Superscripts and subscripts, modifier letters used as indices, minus sign, multiplication sign,
# arrows, common relations and operators, pieces of large brackets.
IMITATION = re.compile("[\u00b2\u00b3\u00b9\u2070-\u209f\u1d2c-\u1d6a\u2c7c\u2212\u00d7\u2190-\u21ff"
                       "\u2208\u221a\u221e\u2248\u2260\u2264\u2265\u239b-\u23ae]")
MATH = re.compile(r"\$\$.*?\$\$|\$[^$\n]+\$", re.S)
INLINE_MATH = re.compile(r"(?<!\$)\$([^$\n]+)\$(?!\$)")
CODE = re.compile(r"```.*?```|`[^`\n]+`", re.S)
# Link targets and bare addresses carry `=` in their query strings; the alternative text of a
# Markdown image stays plain like every image description.
ADDRESS = re.compile(r"!\[[^\]]*\]|\]\([^)\s]*\)|https?://\S+")
NUMBER = r"[-\u2212]?\d+(?:\.\d+)?"
TUPLE = re.compile(rf"\(\s*{NUMBER}(?:\s*,\s*{NUMBER})+\s*\)")


def formula_findings(text):
    """Return what a learner-facing text still writes as a plain-text formula."""
    # Characters that imitate typesetting count everywhere, also in a code block that draws a matrix.
    findings = sorted(set(IMITATION.findall(MATH.sub(" ", text.replace("\\$", " ")))))
    # Code is shown as written, and an escaped dollar is a currency sign.
    text = CODE.sub(" ", text).replace("\\$", " ")
    # remark-math reads "$5 and $10" as one formula; a delimiter beside a space shows it.
    if any(body != body.strip() for body in INLINE_MATH.findall(text)):
        findings.insert(0, "formula delimiter beside a space")
    prose = ADDRESS.sub(" ", MATH.sub(" ", text))
    if "$" in prose:
        findings.append("unpaired $")
    if "=" in prose:
        findings.append("= outside a formula")
    if "^" in prose:
        findings.append("^ outside a formula")
    if TUPLE.search(prose):
        findings.append("number tuple outside a formula")
    return findings


def texts(node, path=""):
    if isinstance(node, dict):
        for key, value in node.items():
            if isinstance(value, str) and key in TEXT_KEYS:
                yield f"{path}/{key}", value
            else:
                yield from texts(value, f"{path}/{key}")
    elif isinstance(node, list):
        for index, value in enumerate(node):
            yield from texts(value, f"{path}/{index}")


# Evidence, retained sources and images hold no course catalog and are very deep; they are not searched.
SKIPPED_DIRECTORIES = {"quality", "visualizations", "input", "provenance", "static"}


def catalog_files(directory):
    for path in sorted(directory.iterdir()):
        if path.is_dir():
            if path.name not in SKIPPED_DIRECTORIES:
                yield from catalog_files(path)
        elif path.suffix == ".json":
            yield path


def course_documents(root):
    """Courses that state complete unit coverage, each with the decks named by its goals."""
    for path in catalog_files(root / "curricula"):
        try:
            document = json.loads(path.read_text(encoding="utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
        if not isinstance(document, dict) or document.get("learningUnitCoverage") != "complete":
            continue
        yield path, document
        for markdown in sorted({*path.parent.glob("*.md"), *path.parent.parent.glob("*.md")}):
            yield markdown, {"markdown": markdown.read_text(encoding="utf-8")}
        for goal in document.get("goals", []):
            source = (goal.get("extendedData") or {}).get("vocabularySource")
            if isinstance(source, str):
                deck = path.parent / Path(source).name
                yield deck, json.loads(deck.read_text(encoding="utf-8")) if deck.is_file() else None


def check(root=ROOT):
    problems, courses = [], 0
    for path, document in course_documents(root):
        relative = path.relative_to(root)
        if document is None:
            problems.append(f"{relative}: deck named by a goal is not beside its course")
            continue
        courses += "learningUnitCoverage" in document
        for where, text in texts(document):
            found = formula_findings(text)
            if found:
                problems.append(f"{relative}{where}: {', '.join(found)}")
    return courses, problems


BOUNDS = Path("scripts/config/formula-typesetting-bounds.json")


def catalog_counts(root=ROOT):
    """Texts that still write a formula as plain text, per bounded Gymnasium catalog and its decks."""
    bounds = json.loads((root / BOUNDS).read_text(encoding="utf-8"))["catalogs"]
    counts = {}
    for name in bounds:
        path = root / "curricula/DE/Gymnasium/canonical" / name
        document = json.loads(path.read_text(encoding="utf-8"))
        found = [where for where, text in texts(document) if formula_findings(text)]
        for goal in document.get("goals", []):
            source = (goal.get("extendedData") or {}).get("vocabularySource")
            deck = root / "curricula/DE/Gymnasium/memory-decks" / Path(source).name if isinstance(source, str) else None
            if deck and deck.is_file():
                found += [f"{deck.name}{where}" for where, text in texts(json.loads(deck.read_text(encoding="utf-8")))
                          if formula_findings(text)]
        counts[name] = len(set(found))
    return bounds, counts


def check_bounds(root=ROOT):
    """A bounded catalog may hold at most its bound; a lower count must lower the bound with it."""
    bounds, counts = catalog_counts(root)
    problems = []
    for name, bound in bounds.items():
        count, limit = counts[name], bound["texts"]
        if count > limit:
            problems.append(f"{name}: {count} texts write a formula as plain text, the bound is {limit}. "
                            "Write the new or changed formulas in TeX.")
        elif count < limit:
            problems.append(f"{name}: only {count} texts are left; lower the bound in {BOUNDS} from {limit} to {count}.")
    return counts, problems


def main():
    courses, problems = check()
    counts, bound_problems = check_bounds()
    problems += bound_problems
    for problem in problems:
        print(f"::error::{problem}")
    if problems:
        print(f"{len(problems)} problem(s). Write formulas in TeX between $…$ (AGENTS.md §7).")
        return 1
    print(f"Course formulas passed: {courses} course(s) with complete unit coverage write their formulas in TeX.")
    for name, count in counts.items():
        print(f"  {name}: {count} texts with plain-text formulas left (bound held).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
