# Production Pipelines Documentation Index

This page is the entry point for repeatable production and export pipelines. Keep pipeline status reports in `docs/qa-ci/status/` and implementation notes in `docs/dev/`.

## Pipelines

- [Curriculum Graph](curriculum-graph.md)
  Pipeline notes for curriculum graph production.
- [Exam Example](exam-example.md)
  Pipeline notes for exam example production.
- [MEM/FWU Roundtrip Pipeline](mem-fwu-roundtrip.md)
  Operational pipeline for MEM/FWU roundtrip artifacts.
- [SkillPilot Subject Export Package](skillpilot-subject-export-package.md)
  Subject export package structure and release pipeline.

## Maintenance

- Add new repeatable production pipelines here.
- `cd app && npm run check:docs-indexes` fails if a direct Markdown child of `docs/production-pipelines/` is missing from this index.
