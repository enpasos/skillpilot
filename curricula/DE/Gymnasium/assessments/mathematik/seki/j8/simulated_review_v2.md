# Focused Currency-Rendering Review - J8 Mathematics Exam v2

Reviewer: Codex focused technical and didactic QA

Review date: 2026-08-04

Decision: approved for promotion of Tasks 1, 2, 6 and 7 v2

Scope:

- `draft_v2.md`, Tasks 1, 2, 6 and 7
- `solution_v2.md`, Tasks 1, 2, 6 and 7
- `blueprint.md`, source versions and design notes
- preservation of the promoted v1 source artifacts

## Finding and Resolution

The affected tasks used plain currency codes such as `$40 EUR$`, `$17 EUR$` and `$120 EUR$`. KaTeX renders `EUR` there as mathematical variables instead of an upright currency code.

The v2 source applies the established convention:

- `{,}` for German decimal commas inside mathematical markup;
- `\,` for explicit spacing between amount and currency;
- `\mathrm{EUR}` for an upright currency code.

The matching solution uses the same convention for all affected amounts and writes the solved unit prices with German decimal commas. No wording, mathematical requirement, point value, prerequisite or covered goal changes.

## Verification and Promotion

- All currency amounts in Tasks 1, 2, 6 and 7 render with a separated, upright `EUR`.
- The solved prices render as `2,20 EUR` and `4,20 EUR`.
- Canonical Tasks 3-5 continue to reference `draft_v1.md`.
- Canonical Tasks 1, 2, 6 and 7 reference `draft_v2.md` and retain the same graph links, demand levels and scoring.

With these conditions satisfied, Tasks 1, 2, 6 and 7 v2 are ready for promotion.
