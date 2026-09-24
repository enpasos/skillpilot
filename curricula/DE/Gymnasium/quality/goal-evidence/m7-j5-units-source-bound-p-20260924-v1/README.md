# BY J5 units: source-bound current P-v2 AI candidate

This package separates `f2e42af5-67a6-477e-82ea-e65b09cc6cb3` from the active 22-record batch-002 retained owner after an independent D review found an out-of-scope required P case. The old 22-record config and ledger remain unchanged. `materialize-candidate-and-retention.mjs` verifies exact SHA-256 digests of both old owner files, the moved record's goal and profile fingerprints, current bilingual canonical wording, and the original JPG bytes. It retains the other **21 raw review lines byte-for-byte** under `retained-batch-002-unaffected-21.*`; `provenance.json` records the pins and output paths. The retained 21 have no new image binding, exactly as the source owner did.

The [Bavarian Gymnasium Mathematik 5 curriculum, M5.4.1](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/5/mathematik), explicitly names money, length, mass, and time for unit conversion. It does not name volume there, and the canonical graph treats volumetric units as a subsequent goal. The old P profile required a litre/millilitre bottle case as its second demonstration. The new profile keeps two independent demonstrations within the J5 source scope: ordering fresh lengths `2,35 m`, `228 cm`, and `0,0024 km` in a common unit; then checking `1 h 20 min` against a false `120 min` display and comparing the corrected `80 min` with `75 min`. The latter changes quantity type, base relation (decimal length to 60-minute hour), notation, and task direction; it cannot be copied from the current ribbon JPG. Its original digest remains `sha256:d38294eb4db797cd97bbee6350babe425d2fd25575f09e9317e1ee615c1d9197`. The essential understanding also now states that numerical value and unit size vary inversely while the measured quantity remains unchanged.

The revised profile fingerprint is `sha256:9bf78ebdbf7d2177c99ac7e9b497fc97d65dae6b1d14fb8205b25ea2c58e519f`. The one new record remains `needs_human_review` / `ai_candidate`, `E1/G1`, with no review-run IDs or human approval. Both P checkers report 0 blocking issues (one current new record, 21 current retained records). The candidate no-write reproduction check and the V2 profile, candidate-materializer, and positive-review self-tests pass.

No canonical, visualization/QA, D-review, or registry files were edited here. Until the central P rollout replaces the old 22-record owner with both new config paths, this package is prepared but not centrally active; registering both old and new owners would duplicate ownership.

Reproduce from repository root:

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-j5-units-source-bound-p-20260924-v1/materialize-candidate-and-retention.mjs
npm --prefix app exec -- tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/m7-j5-units-source-bound-p-20260924-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-j5-units-source-bound-p-20260924-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-j5-units-source-bound-p-20260924-v1/positive-evidence.config.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-j5-units-source-bound-p-20260924-v1/retained-batch-002-unaffected-21.config.json
```
