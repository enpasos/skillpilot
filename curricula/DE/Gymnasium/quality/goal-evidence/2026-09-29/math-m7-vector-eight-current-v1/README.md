# Current vector-goal positive evidence candidates (2026-09-29)

This package contains eight **AI-authored P-v2 candidates** for the current
canonical Gymnasium mathematics goals listed in
`positive-evidence.config.json`. They are bound by the materializer to the
current goal texts, direct relations, applicability and primary visualizations.
All eight records retain `needs_human_review`, `ai_candidate`, E1 and G1.
They do not assert human review, learner mastery or publication.

## Current content and image check

I read the current German and English canonical goal text and the actual
primary raster image for each ID. The image observations below describe the
files viewed, not an automatic approval of a generated image. Their current
app-public SHA-256 values are included to identify the inspected bytes.

| Goal | Current content and actual image observation | Inspected image SHA-256 |
| --- | --- | --- |
| `571793bd` | J9 scalar multiplication in plane and space. The PNG's 2D arrows for `a=(2,1)`, `2a`, `½a`, `-a` and 3D component calculation `-2(2,1,3)=(-4,-2,-6)` are coherent. The candidate separately tests the zero factor. | `8b51e4c6ce5b4ea22b5c99fea509255c270b7cdf1050e8a0c4b17559cfae1101` |
| `c63bbffd` | J9 addition/subtraction in plane and space. The PNG correctly gives `(2,1)+(-1,2)=(1,3)`, `(2,1)-(-1,2)=(3,-1)` and `(2,1,1)+(-1,2,3)=(1,3,4)`. | `faa0b30c7d896ea59413c3fcff773e0c405e7b301e0c3718bbbf79c3860d91cc` |
| `d1352ce0` | J9 simple collinearity. The JPEG's two-dimensional examples correctly distinguish `(2,4)=2(1,2)` from a pair with unequal component factors. This candidate deliberately stays in the plane; the distinct Q2 goal below checks space vectors. | `e4cdef9030e7c66f871c8cd10ebaac0b058a14fb3dd4a82da12c34591c0aeb7e` |
| `72dfc164` | Q2 linear combinations, with current Schleswig-Holstein source reference. The PNG's `u=(1,0,1)`, `v=(0,2,1)`, `2u+v=(2,2,3)` is correct. The substantive existing profile was checked against this current goal and image, then retained with new binding. | `d0d3ef0810072d8b31874a70f9b3378e682f414aa527b955c0b7e4e40bee4fcc` |
| `54cfe5ce` | Q2 spatial collinearity, with current HMKB source reference. The PNG correctly shows `(4,-2,6)=2(2,-1,3)` and a non-collinear comparison vector. The retained profile explicitly states its zero-vector convention. | `0daaddf6f333f56d16fc7bad130358e93fbccdb7fa2ad2c11be1d6a0e918ed0b` |
| `fb7a4fa0` | Q2 magnitude in space, with current HMKB source reference. The JPEG correctly gives `|(3,4,12)|=13`; the old inverse case using the image's same numbers was replaced by an endpoint-derived displacement and translation check. | `6051d71316742e7083d6328eaac7f043329733b0a0c6705835283b3f25f49436` |
| `bea0e5a0` | J9 spatial midpoint, applicable to BB/BW/SL. The reused PNG correctly gives `A=(1,2,3)`, `B=(5,4,7)`, `M=(3,3,5)` and distance `6`. The cases instead test forward and inverse midpoint reasoning, each with equal directed half-vectors. | `a7e1ec3af922de59849a1c463aa06c725e3ead5ea6cb7b66a10acf40c060f77e` |
| `235ae698` | J10 line and segment parametrization in space. The JPEG correctly derives direction `(3,1,2)` from `A=(1,2,0)`, `B=(4,3,2)` and distinguishes unrestricted `t∈R` from the segment interval `0≤t≤1`. The retained profile tests different points and a negative interval. | `746f81f2827dfc60c390f95f6f5afc510ab5e5dd75bb946a774b16a64e441221` |

The `235ae698` JPEG also has a small isolated “V” near the central divider
below the formulas. It does not alter the readable mathematics, but it is an
actual visual blemish to consider in the separate visualization review.

The four retained substantive profiles came from the existing current-candidate
records for `72dfc164` and `54cfe5ce` in
`m7-three-png-p-recheck-20260923-v1/spatial-retained8.review.jsonl`,
`fb7a4fa0` in
`canonical-math-positive-understanding-evidence-rollout-v1-batch-044-current-keep6-v1.review.jsonl`,
and `235ae698` in
`canonical-math-positive-understanding-evidence-rollout-v1-batch-033b-coordinates-lines-motion-5-v1.review.jsonl`.
Their case arithmetic, geometric interpretations and current scope were
checked anew. The remaining four profiles were authored for this package.

Each record has two independent, mathematically checked application cases,
meaningful variation and equivalent German/English demands. In particular:
`d1352ce0` changes from a planar yes/no classification with a counterexample
to finding a missing planar component, whereas `54cfe5ce` checks all three
spatial components including a zero-component case. `fb7a4fa0` now changes
from direct vector components to a displacement derived from spatial endpoints.

## Reproduction and result

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-vector-eight-current-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-vector-eight-current-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-vector-eight-current-v1/positive-evidence.config.json
```

On 2026-09-29 the materializer verified all eight current records byte-for-byte.
The P-v2 check reported 8 configured, 0 approved, 8 needing human review,
0 rejected and 0 blocking issues. This is machine-QS candidate evidence,
not a human release gate.
