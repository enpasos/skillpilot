# Positive evidence: separate J7 right-prism goals

This package binds the two newly atomic competencies to their current goal text
and primary visualization. It replaces, rather than inherits, the old combined
volume-and-surface profile for `59d5a330-61be-4590-ab46-cf7cefecd144`.

- Volume: a right-triangular container and a parallelogram-base prism require
  independent identification of base area and perpendicular solid height.
- Surface area: a closed cuboid and a closed triangular prism require an
  explicit, complete account of exterior faces.
- All four cases use dimensions different from the primary 3–4–5 image; the
  volume and surface competencies are assessed separately.

The materialized records are AI-authored `E1`/`G1` candidates with
`needs_human_review`; this package does not supply human approval or, by
itself, complete the Mathematics M7 gate. If a goal or linked image changes,
rematerialize the fingerprint-bound review before using it as current evidence.

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- \
  --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-j7-prism-split-current-v1/positive-evidence.config.json \
  --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-j7-prism-split-current-v1/positive-evidence.candidates.json \
  --write
npm --prefix app run quality:positive-goal-evidence:check -- \
  --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-j7-prism-split-current-v1/positive-evidence.config.json
```
