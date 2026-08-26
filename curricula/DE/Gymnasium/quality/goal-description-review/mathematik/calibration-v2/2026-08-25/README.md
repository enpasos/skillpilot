# Mathematik description-review calibration v2 — 2026-08-25

This directory is the durable, byte-bound audit set for the first 20
`curricularAtomic` mathematics goals completed under the bilingual
understanding-oriented description-review contract.

## Result

- 20 unique current canonical goals have two blind independent `keep` reviews.
- All 20 have a current-context `resolved` resolution with
  `authority: "ai_synthesis"` and no human-attestation claim.
- Each resolution binds the exact campaign, run, results-file and record bytes,
  the persisted dual summary, the current goal/page fingerprints, and the
  per-goal V3 review-context fingerprint.
- Strict description-review progress represented by this artifact set is
  **20/780 = 2.6%** for Mathematik.
- Positive-understanding evidence profiles are a separate QA layer and are not
  asserted by this artifact set. Consequently, these records alone do not
  increase the stricter all-lanes implementation percentage.

## Artifact groups

`calibration-20/` preserves the original 20-goal review bundle and both blind
campaigns byte-for-byte. Its dual summary includes 18 comparisons still used
by current resolutions plus the historical pre-revision Thales comparison and
the comparison for `8dd9f210-2683-5902-acab-e3be22725232` before its current
representation metadata was bound. No current resolution uses either stale
comparison.

`thales-current/` preserves the fresh one-goal bundle and two blind `keep`
campaigns for `743e5470-ff39-551e-9aba-529656418c66` after the canonical
description clarified that the centre-to-external-point segment is the
diameter of the auxiliary Thales circle.

`representation-metadata-current/` preserves the fresh one-goal bundle and two
blind `keep` campaigns for `8dd9f210-2683-5902-acab-e3be22725232` after its
current semantic and representation context was bound. Its current resolution
uses this group's per-goal/page/context fingerprints and exact campaign, run,
results-file and record bytes.

`resolutions/` contains exactly one closed-schema per-goal resolution for each
of the 20 goals. `resolution-index.json` binds their paths, file digests,
resolution fingerprints, source groups, decisions, and the strict count.

## Deterministic checks

From `app/`:

```bash
npm run check:math-description-calibration-resolutions
npm run test:goal-description-dual-round-resolution
```

The first command reconstructs all three dual summaries and every resolution from
the persisted campaign artifacts, validates each one against the current
canonical mathematics landscape, and compares the exact expected bytes with
the checked-in files. Regeneration is explicit:

```bash
npm run quality:math-description-calibration-resolutions
```
