# Exam Pipeline - Latein

This folder contains derived build and QA artifacts for the Hessen 2026 Latin exam pipeline.

## Source of truth
- The canonical release artifact is the registered Hessen Latin source landscape:
  `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` (`landscapeId: fe28bda8-03f3-4c4a-8286-7fcfce4eeac1`)
- This folder is build and QA infrastructure only.

## Collections
- `gk_offer_2026`: released GK offer set with three proposals A-C, pick exactly one
- `lk_offer_2026`: released LK offer set with three proposals A-C, pick exactly one
- `gk_master_2026`: derived from all GK offer tasks plus phase practice tasks
- `lk_master_2026`: derived from all LK offer tasks plus phase practice tasks

## Workflow
1. Maintain practice and offer tasks in the curriculum JSON.
2. Rebuild the derived task bank with `python scripts/build_latin_exam_task_bank.py`.
3. Validate with `python scripts/validate_latin_exam_pipeline.py --report tmp/latin_exam_pipeline_report.json`.
4. Treat `task_bank.json` and the validator report as derived artifacts, not runtime release content.

## Latin-specific notes
- The official 2026 structure is `translation + interpretation`, three proposals, pick one.
- Offer tasks cover Q1 rhetoric, Q2 community/state, and Q3 philosophy/ethics.
- Q4 reception remains relevant for master-set practice but is not part of the official 2026 offer core.
