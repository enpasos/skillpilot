# Math Exam Pipeline

The registered Hessen math source landscape is the single canonical release artifact for the 2026 exam setup:

- `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` (`landscapeId: 2796fc7b-ba9d-446f-8f26-711dd6d8a9a3`)

The curriculum keeps only the canonical offer release anchors as ordinary goals with minimal `release` metadata:

- `abi_gk_offer_2026`
- `abi_lk_offer_2026`

Everything in `abi/Mathe/` is derived build and QA infrastructure:

- `slot_matrix.json`: offer-slot structure and selection rules
- `coverage_requirements.json`: coverage and review requirements
- `task_bank.json`: generated inventory of exam-capable goals

How the pipeline works:

1. Update the curriculum goals and `examData` in the curriculum JSON.
2. Mark the four release anchors in the curriculum with `release.examYear`, `release.kind`, `release.courseLevel`, and `release.status`.
2. Mark the two offer release anchors in the curriculum with `release.examYear`, `release.kind`, `release.courseLevel`, and `release.status`.
3. Rebuild derived artifacts from the curriculum.
4. Validate structure, coverage, and review status against the curriculum-derived release anchors.

Commands:

```bash
python scripts/build_math_exam_task_bank.py
python scripts/validate_math_exam_pipeline.py --report tmp/math_exam_pipeline_report.json
python scripts/export_math_exam_release_bundle.py
```

Interpretation:

- `gk_offer_2026` and `lk_offer_2026` are the official offer structures.
- `gk_master_2026` and `lk_master_2026` are derived full training sets.
- The master sets are not modeled as a second `contains` tree in the curriculum. They are derived by course level from the released offer tasks plus the phase and process practice clusters.
- `draftReady` means the derived structure and declared coverage pass.
- `releaseReady` additionally requires completed manual review fields in `task_bank.json`.

Important boundary:

- `task_bank.json`, `slot_matrix.json`, `coverage_requirements.json`, validator reports, and export bundles are not the release itself.
- They may be regenerated at any time from the curriculum.
- Nothing from those QA/build artifacts should be mirrored back into the curriculum unless it is product-relevant runtime data.

Optional export:

- `export_math_exam_release_bundle.py` creates a convenience bundle for downstream use.
- That bundle is derived output, not the canonical release path.
