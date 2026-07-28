# J5 Mathematics Exam Work Package

Status: released into canonical skill graph

This folder is the reviewed production package for the Jahrgangsstufe 5 exam set.
It follows `docs/production-pipelines/seki-math-exam.md`.

Current artifacts:

- `reference-scan.md` - committed summary of local-only reference calibration, without copied task content
- `blueprint.md` - task matrix and intended curriculum coverage
- `draft_v1.md` - learner-facing raw draft
- `solution_v1.md` - solution and scoring draft
- `finding_resolution_v1.md` - internal handling of v1 findings
- `draft_v2.md` - revised 30 BE learner-facing raw draft for external review
- `solution_v2.md` - revised solution and scoring draft
- `internal_qa_v2.md` - internal QA after v2 revisions
- `procedure_review_request.md` - request for reviewing the production/review procedure before task-level external review
- `procedure_review.md` - target file for received procedure-review feedback
- `external_review_template.md` - form for external didactic review
- `external_review_packet_v2.md` - single-file review packet for sending draft v2 to an external reviewer
- `external_review.md` - received external didactic review feedback
- `findings.md` - structured findings ledger derived from external review
- `finding_resolution_v2.md` - resolution log for external-review findings
- `draft_v3.md` - release-candidate learner-facing raw draft
- `solution_v3.md` - release-candidate solution and scoring draft
- `re_qa.md` - completed re-QA after findings were processed
- `release_candidate.md` - final release-candidate decision record

Local-only reference pool:

- `tmp/seki-math-exam-reference-pool/`

Promotion record:

The package has been promoted into `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`.
The existing year-level exam nodes under `Prüfungen Jahrgangsstufe 5` were updated with narrow `requires` and `examData.coveredGoalIds`.
