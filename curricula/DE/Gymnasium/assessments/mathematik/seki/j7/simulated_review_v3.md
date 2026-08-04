# Focused Currency-Rendering Review - J7 Mathematics Exam v3

Reviewer: Codex focused technical and didactic QA

Review date: 2026-08-04

Decision: approved for promotion of Tasks 5 and 6 v3

Scope:

- `draft_v3.md`, Tasks 5 and 6
- `solution_v3.md`, Tasks 5 and 6
- `blueprint.md`, source versions and design notes
- preservation of all previously promoted v1 and v2 source artifacts

## Finding and Resolution

Tasks 5 and 6 still used plain currency codes such as `$35 EUR$`, `$1.80 EUR$` and `$350 EUR$`. KaTeX interprets those letters as italic mathematical variables and joins them visually to the amount.

The v3 source applies the convention already reviewed for Task 4:

- `{,}` for German decimal commas inside mathematical markup;
- `\,` for explicit spacing between amount and currency;
- `\mathrm{EUR}` for an upright currency code.

The matching solution uses the same convention for every amount. No wording, mathematical requirement, point value, prerequisite or covered goal changes.

## Verification and Promotion

- All Task 5 and 6 amounts render with a separated, upright `EUR`.
- The decimal amount renders as `1,80 EUR`, while the formulas remain mathematically unchanged.
- Canonical Tasks 1-3 and 7 continue to reference `draft_v1.md`; Task 4 continues to reference `draft_v2.md`.
- Canonical Tasks 5 and 6 reference `draft_v3.md` and retain the same graph links, demand levels and scoring.

With these conditions satisfied, Tasks 5 and 6 v3 are ready for promotion.
