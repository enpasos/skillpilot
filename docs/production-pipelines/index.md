# Production Pipelines Documentation Index

This page is the entry point for repeatable production and export pipelines. Keep pipeline status reports in `docs/qa-ci/status/` and implementation notes in `docs/dev/`.

## Program Status

- [Dual Curriculum Package Implementation Status](../dev/dual-curriculum-package-implementation-status.md)
  Current implementation checkpoint for the paired JSON-runtime and FWU-ontology release program.

## Pipelines

- [Skill Graph](skill-graph.md)
  Pipeline notes for skill graph production.
- [Curriculum Package Provisioning](curriculum-package-provisioning.md)
  Secure quarantine, content-addressed installation, CAS activation, and rollback for JSON runtime packages.
- [Exam Example](exam-example.md)
  Pipeline notes for exam example production.
- [Sek-I Mathematics Exam](seki-math-exam.md)
  Reviewed production pipeline for Gymnasium mathematics Sek-I year-level exam tasks.
- [MEM/FWU Roundtrip Pipeline](mem-fwu-roundtrip.md)
  Operational pipeline for MEM/FWU roundtrip artifacts.
- [SkillPilot Subject Export Package](skillpilot-subject-export-package.md)
  Subject export package structure and release pipeline.

## Maintenance

- Add new repeatable production pipelines here.
- `cd app && npm run check:docs-indexes` fails if a direct Markdown child of `docs/production-pipelines/` is missing from this index.
