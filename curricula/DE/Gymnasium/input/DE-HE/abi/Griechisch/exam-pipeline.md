# Exam Pipeline - Griechisch

This folder contains derived build and QA artifacts for the Hessen 2026 Ancient Greek exam pipeline.

## Source of truth
- The canonical release artifact is the registered Hessen Ancient Greek source landscape:
  `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` (`landscapeId: c7209caa-18e5-4dd8-b68f-dd86e228d045`)
- This folder is build and QA infrastructure only.

## Collections
- `gk_offer_2026`: released GK offer set with three proposals A-C, pick exactly one
- `lk_offer_2026`: released LK offer set with three proposals A-C, pick exactly one
- `gk_master_2026`: derived from all GK offer tasks plus phase practice tasks
- `lk_master_2026`: derived from all LK offer tasks plus phase practice tasks

## Workflow
1. Maintain practice and offer tasks in the curriculum JSON.
2. Rebuild the derived task bank with `python scripts/build_greek_exam_task_bank.py`.
3. Validate with `python scripts/validate_greek_exam_pipeline.py --report tmp/greek_exam_pipeline_report.json`.
4. Treat `task_bank.json` and the validator report as derived artifacts, not runtime release content.

## Ancient-Greek-specific notes
- The official 2026 structure is `translation + interpretation`, three proposals, pick one.
- Offer tasks cover Homer, Herodotus and Plato/Protagoras as the official Q1-Q3 focus.
- Q4 reception remains relevant for master-set practice but is not part of the official 2026 offer core.
