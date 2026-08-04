# Focused German-Number and Currency-Rendering Review - J10 Mathematics Exam v2

Reviewer: Codex focused technical and didactic QA

Review date: 2026-08-04

Decision: approved for promotion of Task 1 v2

Scope:

- `draft_v2.md`, Task 1
- `solution_v2.md`, Task 1
- `blueprint.md`, source version and design notes
- preservation of the promoted v1 source artifacts

## Finding and Resolution

Task 1's solution used plain currency codes such as `$2500 EUR$` and `$2969.22 EUR$`. KaTeX renders `EUR` there as mathematical variables, and the decimal points did not follow the German notation used by the reviewed J7 Task 4.

The v2 source applies the established convention:

- `{,}` for German decimal commas inside mathematical markup;
- `\,` for explicit spacing between amount and currency or unit;
- `\mathrm{EUR}` for an upright currency code.

The decimal factors and calculated values in Task 1 use the same localized notation. No wording, mathematical requirement, point value, prerequisite or covered goal changes.

## Verification and Promotion

- The monetary amounts render as `2500 EUR` and `2969,22 EUR` with an upright, separated currency code.
- Decimal factors and results use German commas without changing their numerical values.
- Canonical Tasks 2-6 continue to reference `draft_v1.md`.
- Canonical Task 1 references `draft_v2.md` and retains the same graph links, demand levels and scoring.

With these conditions satisfied, Task 1 v2 is ready for promotion.
