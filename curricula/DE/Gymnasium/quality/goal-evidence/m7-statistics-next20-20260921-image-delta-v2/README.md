# Statistics next20 — current P candidates after the image corrections

This version preserves all 20 existing bilingual author profiles and their
40 concrete application cases. It updates their current resource bindings
through the native P materializer, after an actual bounded content review.

- **12 changed PNGs:** each current production image and corresponding rendered
  PDF goal page was opened and checked. The old image objections are resolved
  with goal-specific observations in `reuse-notes.json` and
  `reuse-delta-review.receipt.json`, not by hashes alone.
- **8 unchanged images:** both existing KEEP passes, exact image bytes, complete
  goal records and prerequisite/reverse-prerequisite context remain valid.
  Their images were not needlessly reviewed again.
- **20 profiles unchanged:** every native profile fingerprint equals its prior
  value. All goal fingerprints remain unchanged; exactly the 12 image-delta
  review-input fingerprints change. The other 8 review-input fingerprints are
  identical to the original candidates.
- **40 case checks passed:** the historical arithmetic/logical test section was
  reused without its obsolete full-snapshot and registry assumptions. This is
  consistency checking, not proof of actual learner performance.

All materialized records remain **`needs_human_review` / `ai_candidate`, E1/G1**.
The schema status is preserved truthfully; this preparation grants neither
human approval nor machine adjudication. It records **zero new substantive
profile completions**, no D decisions and no strict M7 closure. Central
registration and independent review/integration belong to the coordinating
workflow and were not performed here.

The existing statistics-next20 D configuration was prepared with the native
command. Its 20-page goal model and independent round-A/round-B inputs are
available under the configured output directory. No D review was authored.

## Bounded validation

Passed on 21 September 2026:

```sh
node curricula/DE/Gymnasium/quality/goal-evidence/m7-statistics-next20-20260921-image-delta-v2/prepare-reuse.mjs
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/m7-statistics-next20-20260921-image-delta-v2/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-statistics-next20-20260921-image-delta-v2/positive-evidence.candidates.json
npm --prefix app run quality:goal-description-rollout-batch -- check --config curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-20/m7-statistics-next20-v1.config.json
```

`prepare-reuse.mjs --write` only creates missing outputs in this new version
directory; it refuses to overwrite differing versioned artifacts. Native P
generation uses the second command with `--write`. Historical artifacts,
canonical goals, the central registry and the in-flight ledger remain untouched.
No global report or full build was run.

## Separate rendering observations

Actual PDF inspection also found literal LaTeX in the description on goal page
11 (`5f328147-…`) and the literal `$p$` token on page 8 (`82bce6e8-…`). The
corrected images themselves display the mathematical relationships correctly.
These observations were reported to the coordinator for the D/rendering lane;
they are not silently marked fixed by this P reuse. No renderer or canonical
description change was made.

The scalar confidence-diagram source audit for `77d607e0-…` is reused with its
unchanged source-extraction, mapping and HE composition bindings. The current
replacement was actually inspected and shows `p` against `h_n`; this pass does
not falsely claim another inspection of the official curriculum PDF.
