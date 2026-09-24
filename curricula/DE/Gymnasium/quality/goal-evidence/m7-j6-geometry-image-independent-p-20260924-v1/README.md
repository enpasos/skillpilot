# J6 geometry P-v2: image-independent transfer cases

This is a prepared, AI-candidate-only split of the active five-record J6 P-v2 owner. The historical `canonical-math-positive-understanding-evidence-rollout-v1-batch-006b-j6-split-children-current-v1` config and ledger are untouched. `materialize-candidates-and-retention.mjs` pins their SHA-256 digests (`08b24d97…` / `a1f51949…`), retains the three unaffected raw record lines byte-for-byte, and creates a separate two-goal image-bound candidate package. The central rollout registry is **not** changed here; old and new configs must not be registered together because that would duplicate P ownership.

| Goal | Existing image | Repaired P case(s) |
| --- | --- | --- |
| `cddcdabd-ad58-58ad-bfbd-d9fd8fe2d8fa` | Current original/public JPG SHA-256 `4f851ba6…` explicitly shows a 4 × 3 × 2 cm cuboid and its 52 cm² surface area. | Only the former same-number diagnosis is replaced: a 6 × 4 × 2 cm cuboid has an incomplete 72 cm² proposal, missing the two 4 × 2 cm faces. Correct surface area is `2(24 + 12 + 8) = 88 cm²`. The existing 5 × 3 × 2 complete-sum and 8 × 4 × 3 net cases are unchanged. |
| `f52e9d72-4995-5c80-91d2-7761ea0cbec0` | Current original/public JPG SHA-256 `33faa361…` shows a four-square strip with squares above and below its second square. | The former exact-copy validity case and the same-net suggested repair are replaced. The first new cube net uses a row `A B C`, `D` above `A`, `E` below `B`, and `F` below `E`; its opposite pairs are `A/C`, `B/F`, `D/E`. For the invalid 2 × 3 rectangle, one valid two-square repair retains the top row and the lower square below its rightmost square, moving the other two lower squares to the right: two rows of three offset by two. The existing 4 × 3 × 2 cuboid-net case is unchanged. |

The materializer checks that each proposed cube net is an edge-connected six-square tree whose folds occupy six distinct cube-face normals, and that neither is a rotation/reflection of the image net or of the other proposed net. A 2 × 3 block is not a cube net: its 2 × 2 subblocks would force four faces around a cube vertex, where only three can meet. The cuboid arithmetic is asserted in the script. These are changed-case demonstrations, not copies of the learner-facing illustrations.

The current canonical J6 goals, DE/EN descriptions, image links, original/public bytes, and exact-hash AI visualization QA are verified by the materializer but not edited. Source context is limited to the existing mappings: the cuboid-surface goal has partial BY M5.4.2 and M6.2.1 edges (the [official BY M5.4.2 text](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/5/mathematik) explicitly allows nets and oblique drawings); the net-drawing goal has relevant BW, HE G8, and SH source-extraction edges but no direct BY source-extraction edge. This package neither strengthens nor changes those mappings.

The generated two-goal review and retained three-goal ledger each validate with **zero blocking issues**. All five remain `needs_human_review` / `ai_candidate`, `E1/G1`, with no human approval. This is a local P preparation, not central M7 activation.

Reproduce from the repository root:

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-j6-geometry-image-independent-p-20260924-v1/materialize-candidates-and-retention.mjs
npm --prefix app exec -- tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/m7-j6-geometry-image-independent-p-20260924-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-j6-geometry-image-independent-p-20260924-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-j6-geometry-image-independent-p-20260924-v1/positive-evidence.config.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-j6-geometry-image-independent-p-20260924-v1/retained-batch-006b-unaffected-3.config.json
```
