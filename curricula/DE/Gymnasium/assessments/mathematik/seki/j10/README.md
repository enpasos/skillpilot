# J10 Mathematics Exam Work Package

Status: Task 1 uses v2; Task 5 uses v3 after focused AI review of time, units and motion interpretation; Tasks 2-4 and 6 remain on v1

Artifacts:

- `draft_v1.md` - immutable learner-facing source of the initial release
- `solution_v1.md` - immutable solution and scoring source of the initial release
- `blueprint.md` - coverage and design matrix
- `simulated_review_v1.md` - internal simulated release review
- `draft_v2.md` - learner-facing source for Task 1; localized decimal and currency typesetting
- `solution_v2.md` - matching solution source for Task 1 v2
- `simulated_review_v2.md` - focused German-number and currency-rendering review and promotion decision
- `draft_v3.md` - learner-facing source for Task 5 only; explicit time, units, initial position and supporting-line distinction
- `solution_v3.md` - matching solution source for Task 5 v3
- `simulated_review_v3.md` - actual, hash-bound focused AI correction review; not human approval or a full-package re-review

Promotion rule:

- Canonical Tasks 2-4 and 6 continue to reference `draft_v1.md`.
- Canonical Task 1 references `draft_v2.md` and uses the matching v2 task and solution content.
- Canonical Task 5 references `draft_v3.md#task-5` and uses the matching v3 task and solution content. Its total, pass threshold, legacy scoring step ID, prerequisites and covered goal IDs are unchanged.
- All previously promoted source versions remain byte-unchanged. Later findings must be processed as a new version rather than by silently editing an existing version.
