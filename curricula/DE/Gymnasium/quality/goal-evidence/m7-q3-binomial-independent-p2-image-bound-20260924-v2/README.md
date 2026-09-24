# Q3 Binomial: current image-bound P-v2 AI candidates

This versioned successor binds two independently rechecked P-v2 profiles to
the active current PNG images. It does **not** overwrite the earlier text-only
package or its historical assessment of the old `9b6` v2 image. The current
`9b6` v3 image visibly states *four fair, independent tosses*, resolving that
old image HOLD. The canonical DE/EN description was subsequently rewritten
in readable prose; this package fingerprints that current wording.

`materialize-image-bound-split.mjs` pins all six predecessor input files by
SHA-256, checks the two unchanged substantive profile fingerprints, and
requires the exact public and canonical PNG bytes plus matching AI-only QA
hashes. It copies the other **five Q3 raw review lines byte-for-byte** to a
separate retained owner. `provenance.json` records source pins, each retained
line hash, and the active image URLs/digests. Neither owner is centrally
registered by this package; replacing the prior seven-record owner requires
registering both new configs together, never alongside that owner.

| Goal | Active PNG SHA-256 | Independent positive-evidence cases |
| --- | --- | --- |
| `9b6f4d7d-a804-5666-b7ea-85bb3c73da4a` | `cfc3330cbdeee3ec592a19662174cb7f4f80af70cb3c857c185baf2a5015ada0` | The image's `n=4,p=1/2,k=2` example is teaching support only. The profile asks for `n=4,p=0.3,k=1`: four disjoint placements, `0.3·0.7³=0.1029` per pattern and `0.4116` overall; a second `n=5,p=0.8,k=4` case yields `0.4096`. |
| `aa00edfa-cf8d-500e-994f-7e33a5ebd045` | `58cd2f73b87e66856188dc09c03562dbd8cb6186174e3745014e6162f6dfb837` | Instead of the image's three `Bin(4,1/2)` values, the profile asks for `X~Bin(5,0.4)`: `P(X=0)=0.07776`, `P(2≤X≤4)=0.6528`, `P(X≥2)=0.66304`; their last-two difference is `P(X=5)=0.01024`. A second `n=5,p=0.2` defect case tests a rare upper tail. |

Both active images were visually and mathematically rechecked at original
1536×1024 pixels and 360 px. The `9b6` sequences are the six distinct 2K2Z
patterns, each with probability `1/16` under the visible fair-independent
premise. The `aa00` highlighted sets `{2}`, `{1,2}`, `{0,1,2}` and values
`6/16`, `10/16`, `11/16` are correct. Neither image provides the answers to
the fresh profile cases.

The materialized current goal fingerprints are
`sha256:3aac144889f922be769d6826d439d66f7ab0e16d5182b4b457a9bc9aeeab6e37`
for `9b6` and
`sha256:208f5e3425aaaee8294b7da42aeb6a4fe83afec2a4a25b779315c122bb66b438`
for `aa00`; profile fingerprints remain respectively
`sha256:4f4ba39480ca49c4c7615f407a47036f72aa182f8296b37edcc9d48ac8b9409d`
and `sha256:da9188fa9c8e6d7e3c75375e75ab103462314ee8ee3797da0643a924fda94b38`.
The image-sensitive review-input fingerprints are in the JSONL ledger. All
seven records are `needs_human_review` / `ai_candidate`, `E1/G1`; no human
approval, learner mastery, D review, or public release is claimed.

The official P checker reports **2 current, 0 blocking issues** for the
image-bound pair and **5 current, 0 blocking issues** for the retained owner.
The candidate materializer reproduces the two-record ledger byte-for-byte in
no-write mode. No canonical, image, QA, registry, or D file is edited here.

Reproduce from repository root:

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-image-bound-20260924-v2/materialize-image-bound-split.mjs
npm --prefix app exec -- tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-image-bound-20260924-v2/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-image-bound-20260924-v2/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-image-bound-20260924-v2/positive-evidence.config.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-image-bound-20260924-v2/retained-q3-five.config.json
```
