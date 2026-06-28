# J5 Internal QA v2

Status: internal QA after v2 revisions

Reviewed files:

- `draft_v2.md`
- `solution_v2.md`
- `blueprint.md`
- `finding_resolution_v1.md`
- `../quality-checklist.md`

Date: 2026-06-26

Decision: `ready_for_external_review`

---

## Summary

The v2 package resolves the internal v1 findings sufficiently for external review.

It is still not release-ready:

- external review has not happened
- no external findings have been processed
- no re-QA after external review exists
- no `examData` promotion should happen yet

---

## Design Pattern Gate

- Low Floor / High Ceiling: pass. Each task begins with data reading or direct calculation and ends in explanation, misconception diagnosis, model limit, property classification, or practical decision.
- AfB cascade: pass. AfB I is represented by direct calculations and reading; AfB II by context translation and representation work; AfB III by explanation, misconception diagnosis, and model-limit reasoning at J5 level.
- Representation change: pass. Tables, number line/integer reasoning, coordinates, verbal explanation, and equations are all present.
- Misconception design: pass. Task 2 targets signed-number distance; Task 4 targets the rectangle/square misconception.
- Authenticity: pass. All contexts are school-based and compact. No single umbrella scenario is reused.
- Model critique loop: pass. Task 3 and Task 5 require practical interpretation beyond the raw calculation.
- Dominant verbs: pass. The package uses `berechne`, `ordne`, `erkläre`, `widerlege`, `entscheide`, `begründe`, and `kontrolliere`.

---

## Resolved Internal Findings

| ID | Status | Evidence |
| --- | --- | --- |
| J5-QA-001 | resolved | Task 4 now focuses on coordinate geometry, rectangle/square distinction, and right-angle reasoning instead of another measurement-scale context. |
| J5-QA-002 | resolved | Draft v2 has 30 BE. |
| J5-QA-003 | partially resolved | Figure/angle reasoning is present through Task 4; formal angle measurement remains out of scope. |

---

## Remaining External Review Questions

- Is 45 minutes realistic for 30 BE with explanation prompts?
- Is Task 1 too arithmetic-heavy compared with the rest of the package?
- Should Task 4 include an explicit drawing instruction for reviewers who expect a constructed figure?
- Is the model-limit wording in Task 3 age-appropriate for J5?
- Is Task 5's remainder/up-rounding decision clear enough without introducing formal ceiling notation?

---

## Promotion Status

Do not promote to `examData` yet.

Required before promotion:

1. external review completed
2. findings processed
3. re-QA completed
4. final release candidate selected
5. narrow graph metadata prepared
