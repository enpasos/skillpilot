# Production Pipelines Documentation Index

This page is the entry point for repeatable production and export pipelines. Keep pipeline status reports in `docs/qa-ci/status/` and implementation notes in `docs/dev/`.

## Program Status

- [Dual Curriculum Package Implementation Status](../dev/dual-curriculum-package-implementation-status.md)
  Current implementation checkpoint for the paired JSON-runtime and FWU-ontology release program.

## Pipelines

- [Production Pipelines Handbook PDF (EN)](skillpilot-production-pipelines.en.pdf) · [Produktionshandbuch-PDF (DE)](skillpilot-production-pipelines.de.pdf)
  Unified single-source compendium (Volume V) covering skill-graph authoring, secure package provisioning, subject-export ZIPs, MEM/FWU Core roundtrips, and exam production workflows.
- [Skill Graph (EN)](skill-graph.md) · [Deutsch (DE)](skill-graph.de.md)
  Pipeline notes for skill graph production.
- [Curriculum Package Provisioning (DE)](curriculum-package-provisioning.md) · [English (EN)](curriculum-package-provisioning.en.md)
  Secure quarantine, content-addressed installation, CAS activation, and rollback for JSON runtime packages.
- [SkillPilot Subject Export Package (EN)](skillpilot-subject-export-package.md) · [Deutsch (DE)](skillpilot-subject-export-package.de.md)
  Subject export package structure and release pipeline.
- [MEM/FWU Roundtrip Pipeline (EN)](mem-fwu-roundtrip.md) · [Deutsch (DE)](mem-fwu-roundtrip.de.md)
  Operational pipeline for MEM/FWU roundtrip artifacts.
- [Exam Example (EN)](exam-example.md) · [Deutsch (DE)](exam-example.de.md)
  Pipeline notes for exam example production.
- [Sek-I Mathematics Exam (EN)](seki-math-exam.md) · [Deutsch (DE)](seki-math-exam.de.md)
  Reviewed production pipeline for Gymnasium mathematics Sek-I year-level exam tasks.

## Maintenance

- Add new repeatable production pipelines here.
- `cd app && npm run check:docs-indexes` fails if a direct Markdown child of `docs/production-pipelines/` is missing from this index.
