# Chemie Exam Pipeline

This folder hosts derived build and QA artifacts for the Hessen 2026 chemistry Abitur pipeline.

## Source of truth

- The canonical release artifact remains the registered Hessen chemistry source landscape:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` (`landscapeId: 2f391ba2-ba1e-40e4-a8d2-dff049516c13`)
- Only runtime-relevant release anchors belong in the curriculum.
- Future build and QA files in `abi/Chemie/` are derived artifacts, not the release itself.

## Current chemistry state

- phase-local practice anchors exist for `E`, `Q1`, `Q2`, `Q3`, `Q4`
- two draft offer anchors exist in the curriculum:
  - `abi_gk_offer_2026`
  - `abi_lk_offer_2026`
- the first five material-based practice tasks with `examData` exist, one per phase
- source package and first 2026 blueprint exist
- first derived planning artifacts now exist:
  - `slot_matrix.json`
  - `coverage_requirements.json`

## Intended next batches

1. Add more phase-practice tasks until phase coverage is robust for GK and LK.
2. Build chemistry-specific derived artifacts:
   - `task_bank.json`
   - builder / validator scripts
3. Construct independent GK and LK offer sets for 2026.
4. Run review batches until offer and later master collections are release-ready.

## Modeling rules

- local phase practice stays inside the normal curriculum tree
- no separate master subtree in the curriculum
- master collections should later be derived in the pipeline, not modeled as duplicate runtime navigation
- AI-facing interfaces should only expose learner-relevant data, not internal release metadata unless needed
