# Physics Exam Pipeline

The registered Hessen physics source landscape is the single canonical release artifact for the 2026 exam setup:

- `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` (`landscapeId: 24f2ca0f-b94a-444e-bb70-677cb6f85c02`)

The curriculum keeps only the canonical offer release anchors as ordinary goals with minimal `release` metadata:

- `abi_gk_offer_2026`
- `abi_lk_offer_2026`

Everything in `abi/Physik/` is derived build and QA infrastructure:

- `slot_matrix.json`: offer-slot structure, form variants, and selection rules
- `coverage_requirements.json`: coverage, review, and master-bucket requirements
- `task_bank.json`: generated inventory of exam-capable goals

How the pipeline works:

1. Update the curriculum goals and `examData` in the curriculum JSON.
2. Mark the two offer release anchors in the curriculum with `release.examYear`, `release.kind`, `release.courseLevel`, and `release.status`.
3. Rebuild derived artifacts from the curriculum.
4. Validate structure, coverage, and review status against the curriculum-derived release anchors.

Commands:

```bash
python scripts/build_physics_exam_task_bank.py
python scripts/validate_physics_exam_pipeline.py --report tmp/physics_exam_pipeline_report.json
```

Interpretation:

- `gk_offer_2026` and `lk_offer_2026` are the official offer structures.
- `gk_master_2026` and `lk_master_2026` are derived full training sets.
- Physics 2026 currently uses two sample forms per course level: `2026_1` and `2026_2`.
- The master sets are not modeled as a second `contains` tree in the curriculum. They are derived by course level from the released offer tasks plus the phase practice clusters.
- `draftReady` means the derived structure and declared coverage pass.
- `releaseReady` additionally requires completed manual review fields in `task_bank.json`.

Important boundary:

- `task_bank.json`, `slot_matrix.json`, `coverage_requirements.json`, and validator reports are not the release itself.
- They may be regenerated at any time from the curriculum.
- Nothing from those QA/build artifacts should be mirrored back into the curriculum unless it is product-relevant runtime data.

Current expected gap pattern:

- The current physics curriculum already contains offer tasks for GK and LK.
- The master validation also expects phase-practice coverage for `E`, `Q1`, `Q2`, `Q3`, and `Q4`.
- If the curriculum currently only contains `examData` in `E` plus Abitur offer tasks, the validator should flag the missing `Q1` to `Q4` practice buckets explicitly.
