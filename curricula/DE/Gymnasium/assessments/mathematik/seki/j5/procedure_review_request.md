# Procedure Review Request - Sek-I Mathematics Exam Pipeline

Status: procedure review requested before task review

Review purpose:

Before the J5 mathematics tasks themselves are reviewed, please review whether the production and review procedure is sound enough to use for this pilot package and later Sek-I mathematics exam packages.

This is a review of the method, gates, artifacts, and decision process. Do not yet perform a detailed task-quality review of `draft_v2.md` or `solution_v2.md`, except where they are useful as examples of the proposed procedure.

---

## Review Target

Primary procedure files:

- `docs/production-pipelines/seki-math-exam.md`
- `curricula/DE/Gymnasium/assessments/mathematik/seki/quality-checklist.md`

Pilot package context:

- `curricula/DE/Gymnasium/assessments/mathematik/seki/j5/README.md`
- `curricula/DE/Gymnasium/assessments/mathematik/seki/j5/blueprint.md`
- `curricula/DE/Gymnasium/assessments/mathematik/seki/j5/internal_qa_v2.md`
- `curricula/DE/Gymnasium/assessments/mathematik/seki/j5/external_review_packet_v2.md`

Response target:

- `curricula/DE/Gymnasium/assessments/mathematik/seki/j5/procedure_review.md`

---

## Reviewer Task

Please decide whether the procedure is sufficiently clear, safe, and reviewable before the task-level external review starts.

Focus on:

- whether the workflow has the right gates before promotion into `examData`
- whether source-hygiene and originality safeguards are strong enough
- whether roles, artifacts, and decision points are unambiguous
- whether the quality checklist is fit for Sek-I mathematics and reusable beyond J5
- whether internal QA, external review, finding resolution, re-QA, and release-candidate decisions are separated cleanly
- whether graph-promotion rules prevent broad or inaccurate `coveredGoalIds`, `requires`, or route endpoints
- whether the process creates enough evidence for later maintainers to audit what was reviewed and why

---

## Decision Scale

Use one of these decisions:

- `procedure_approved_for_pilot_task_review`
- `procedure_approved_with_minor_changes`
- `procedure_revision_required_before_task_review`
- `procedure_reject_and_redesign`

Task review should start only after a decision of `procedure_approved_for_pilot_task_review` or `procedure_approved_with_minor_changes`.

---

## Review Questions

1. Is the procedure sequence complete enough: reference calibration, checklist confirmation, blueprint, draft, solution, internal QA, external review, findings, re-QA, release candidate, graph promotion?
2. Are the release blockers in the checklist precise enough for a reviewer to apply consistently?
3. Is the source-hygiene rule strong enough to prevent copying, close paraphrase, or hidden dependence on external worksheets?
4. Are the boundaries between procedure review and task review clear enough?
5. Are the roles clear: who may approve the checklist/procedure, who performs task review, and who resolves findings?
6. Is the evidence trail sufficient: review files, findings ledger, resolution log, re-QA, and release-candidate record?
7. Are the graph-promotion rules narrow enough for `examData.coveredGoalIds`, `requires`, and learner-facing route placement?
8. Is the procedure practical, or does it introduce unnecessary bureaucracy for a 45-60 minute Sek-I exam package?
9. What minimum changes, if any, are required before the J5 task review starts?

---

## Requested Output Format

Please write the response in `procedure_review.md` using this structure:

```text
Reviewer:
Review date:
Overall decision:

## A. Process Soundness

## B. Source Hygiene and Originality Controls

## C. Review Roles and Evidence Trail

## D. Quality Checklist Coverage

## E. Graph Promotion Safety

## F. Required Procedure Findings

| ID | Severity | Finding | Required change |
| --- | --- | --- | --- |
|  | blocker/major/minor |  |  |

## G. Decision on Starting Task Review
```

Severity definitions:

- `blocker`: must be fixed before task-level review starts
- `major`: should be fixed before task-level review unless explicitly accepted
- `minor`: clarity or maintainability improvement

