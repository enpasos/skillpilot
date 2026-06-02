# QA/CI Documentation

This page is the public entry point for SkillPilot curriculum-quality and validation documentation.
It is intended to be reachable on GitHub Pages at `/skillpilot/qa-ci/`.

Use this page by role: start with the overview documents, then jump to a review lane, generated status artifact, or pilot dossier as needed.

## Start Here

- [Curriculum Quality: Reifegrade, QA-Scopes und CQR-Regeln](curriculum-quality-maturity-and-routes.md)
  Detailed meaning of `M0` to `M6`, QA scopes, routes, terminal autonomy, and `CQR-*` rules.
- [CI Overview](ci.md)
  Local and GitHub Actions validation entry points.
- [Graph Validation Rules](graph-validation-rules.md)
  Single source of truth for algorithmic graph validation in CI.
- [Curriculum Quality Dashboard](curriculum-quality-dashboard.md)
  Persisted status layer used by the local Workbench dashboard.
- [Curriculum Mapping Workbench](curriculum-mapping-workbench.md)
  Two-pane audit surface from source snapshots to learner-facing SkillPilot trees.
- [Documentation Guidelines](../dev/documentation-guidelines.md)
  Rules for document roles, generated artifacts, runbooks, and dated pilot records.

## Review Lanes

These pages describe durable manual or semi-automated review processes. Their ledgers or configs are the source of truth; generated status pages are not.

- [Semantic Atomicity Review](semantic-atomicity-review.md)
  Review process for deciding whether technical content leaves are semantically atomic.
- [Requires Review Process](requires-review-process.md)
  Manual QA workflow for prerequisite quality on atomic goals.
- [Atomic Review Process](atomic-review-process.md)
  Older atomic-goal review workflow reference.
- [Relation Checks](relation-checks.md)
  Relation-check scope and CI enforcement profile.
- [MEM SPARQL Consistency Audit](mem-sparql-consistency.md)
  Durable process reference for the non-blocking live MEM/FWU endpoint comparison.
- [MEM SPARQL Consistency Runbook](mem-sparql-consistency-runbook.md)
  Operational checklist for running the audit, reading the queue, and writing ledger decisions.
- [Goal Source Rationales Runbook](goal-source-rationales-runbook.md)
  Operational checklist for generating and reviewing human-readable source rationales.

## Generated Status

These files are generated snapshots or queues. Do not edit them as source of truth; regenerate them with the command documented in the matching process, runbook, or registry.

- [Generated QA Status Artifact Registry](status/README.md)
  Full list of generated status artifacts with role, source of truth, and regeneration command.

- [Current Curriculum Quality Status](status/curriculum-quality-status.md)
  Generated snapshot consumed by the dashboard.
- [Curriculum Source Coverage Audit](status/curriculum-source-coverage-audit.md)
  Generated source-coverage status across configured curriculum evidence.
- [MEM SPARQL Consistency Audit Status](status/mem-sparql-consistency-audit.md)
  Generated live endpoint comparison report.
- [MEM SPARQL Consistency Review Issues](status/mem-sparql-consistency-review-issues.md)
  Generated human review queue from the MEM consistency audit.
- [MEM SPARQL Consistency Review Issues JSON](status/mem-sparql-consistency-review-issues.json)
  Machine-readable MEM review queue.
- [Goal Source Rationales PoC](status/goal-source-rationales-poc.md)
  Generated source-rationale proof of concept for selected canonical Mathematik goals.
- [Goal Source Rationales MEM/FWU Examples](status/goal-source-rationales-mem-examples.md)
  Generated source-rationale examples with live MEM/FWU-SPARQL matches for selected canonical Mathematik goals.
- [Goal Source Rationales MEM/FWU Plain Examples](status/goal-source-rationales-mem-examples-plain.md)
  Plain-language source-rationale view with SkillPilot paths and concrete SPARQL verification queries.
- [Memory-Card Review Rollout](status/memory-card-review-rollout.md)
  Generated triage view for the remaining `CQR-302` rollout.
- [M0 Remediation Plan](status/m0-remediation-plan.md)
  Generated work queue for curricula that still need source coverage, QA scopes, and reviews before they can leave `M0`.
- [Gymnasium Duration Model Readiness](status/gymnasium-duration-model-readiness.md)
  Generated readiness view for duration-model policy.

## Memory-Card Review Status

These are generated audit views for configured `CQR-302` reviews. The registry lists their shared source and regeneration command.

- [Biologie Memory-Card Review](status/memory-card-review-canonical-biology-full.md)
- [Chemie Memory-Card Review](status/memory-card-review-canonical-chemistry-full.md)
- [Deutsch Memory-Card Review](status/memory-card-review-canonical-german-full.md)
- [Geschichte Memory-Card Review](status/memory-card-review-canonical-history-full.md)
- [Informatik Memory-Card Review](status/memory-card-review-canonical-informatics-full.md)
- [Latein Memory-Card Review](status/memory-card-review-canonical-latin-full.md)
- [Mathematik Memory-Card Review](status/memory-card-review-canonical-math-full.md)
- [Physik Memory-Card Review](status/memory-card-review-canonical-physics-full.md)
- [Politik und Wirtschaft Memory-Card Review](status/memory-card-review-canonical-politics-economics-full.md)
- [Wirtschaftswissenschaften Memory-Card Review](status/memory-card-review-canonical-economics-full.md)

## Pilots And Dossiers

These documents capture one-off investigations, remediation slices, or dated PoC evidence. They are useful context, not durable process contracts.

- [MEM SPARQL Consistency PoC, 2026-06-01](archive/mem-sparql-consistency-poc-2026-06-01.md)
  Archived first Mathematik/Gymnasium MEM PoC baseline and investigation notes.
- [MEM SPARQL Consistency PoC Procedure](mem-sparql-consistency-poc-procedure.md)
  Compatibility pointer for old MEM PoC links.
- [Englisch M0 Remediation Pilot](status/english-remediation-pilot.md)
  Reproducible first source-expansion slice for bringing Englisch out of `M0`.
- [Biologie Memory-Card Pilot Dossier](status/memory-card-pilot-biologie.md)
  Reproducible semantic preparation artifact for the Biologie `CQR-302` pilot.
- [BW Mathematik Sek II: HE Coverage Audit](bw-math-sekii-he-coverage-audit.md)
  Fachliche Kontrolle der BW-Kursstufen-Abdeckung gegen Hessen Sek II.

## Curriculum Champion Process

- [Champion Guide](champion-guide.md)
- [Four-level Champion Model](four-level-champion-model.md)
- [Abi 2026 Mathe Deeplink MVP](abi26-mathe-deeplink-mvp.md)
