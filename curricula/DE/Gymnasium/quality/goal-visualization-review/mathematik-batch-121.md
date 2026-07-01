# Goal Visualization Review - Mathematik Batch 121

Review date: 2026-07-01

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering stable Markov states, matrix powers in transition processes, long-term transition behavior, recognizing linear geometric maps, orthogonal projections, and computing image points with matrices.
- All Nano Banana Pro provider calls completed successfully.
- Per-goal prompt appends constrained each visualization to fixed matrices, vector conventions, transition values, coordinates, and transformation rules.
- Three goals required targeted regeneration after fachlicher review: the first two Markov candidates mixed row-vector conventions with column-vector drawings, and the first image-point candidate added filled polygon geometry with extra unlabeled points.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Rejected / Regenerated Candidates

| Goal ID | Attempt | Decision | Reason |
| --- | --- | --- | --- |
| `8d893e63-d7de-52d9-8bcb-f48f47d1ccbf` | initial Batch 121 candidate | `rejected_regenerated` | The candidate requested row-vector convention but displayed the fixvector calculation with vertical column vectors such as `[a;b]` and `[0,4;0,6]`, making the matrix multiplication notation inconsistent. |
| `8d893e63-d7de-52d9-8bcb-f48f47d1ccbf` | first regeneration | `rejected_regenerated` | The candidate still contained vertical state-vector notation and a misleading bracketed block in the probe/deutung area. It was not imported. |
| `33c6e64c-5955-5b07-85d4-74a97b19dd56` | initial Batch 121 candidate | `rejected_regenerated` | The main `P^2` calculation was correct, but the optional state-vector example used vertical vectors while stating `z2=z0*P^2`, mixing conventions and making the dimensions misleading. |
| `33c6e64c-5955-5b07-85d4-74a97b19dd56` | first regeneration | `rejected_regenerated` | The regenerated candidate still included vertical `z0` and `z2` vector notation despite the row-vector convention. It was not imported. |
| `4d331ba0-56d6-5730-a51b-e3d1126b31ba` | initial Batch 121 candidate | `rejected_regenerated` | The displayed point computations were correct, but the graphic filled a polygon and introduced extra unlabeled vertices, which risked confusing the goal of computing only the three requested image points. |

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `8d893e63-d7de-52d9-8bcb-f48f47d1ccbf` | Stabile Zustände mithilfe von Fixvektoren bestimmen | `accepted_pilot_after_second_regeneration` | Accepted after the second targeted regeneration. The final image avoids vertical state-vector notation, uses the matrix `P=[[0,7,0,3],[0,2,0,8]]`, solves `0,7a+0,2b=a`, `0,3a+0,8b=b`, and `a+b=1` to get `a=0,4`, `b=0,6`, and verifies that the distribution `40% A`, `60% B` remains unchanged. |
| `33c6e64c-5955-5b07-85d4-74a97b19dd56` | Matrixpotenzen in Übergangsprozessen deuten | `accepted_pilot_after_second_regeneration` | Accepted after the second targeted regeneration. The final image correctly shows `P^2=P*P=[[0,55,0,45],[0,30,0,70]]`, lists all four entry calculations, and interprets entries in `P^2` as two-step transition probabilities, including `0,55` in `A` and `0,45` in `B` after two steps from `A`. |
| `4bc6cc77-3d20-5d27-a74a-8efb0a038d17` | Langfristige Entwicklung von Übergangsprozessen (LK) | `accepted_pilot` | The image correctly uses `P=[[0,7,0,3],[0,2,0,8]]`, shows matrix-power rows for `n=1`, `2`, `5`, and `10`, and gives the Grenzmatrix with both rows `[0,4,0,6]`. It interprets the long-term behavior as convergence to the stable distribution `40% A`, `60% B`. |
| `69243680-c2c1-5661-80c0-c95a2be1dabf` | Geometrische Abbildungen als linear erkennen | `accepted_pilot` | The image correctly uses `T(x,y)=(2x,y)`, keeps the origin fixed, maps `P=(1,1)` to `P'=(2,1)` and `Q=(2,2)` to `Q'=(4,2)`, and shows that the image of the origin line `y=x` is the origin line `y=0,5x`. The warning that a translation by `(1,0)` is not linear is correct. |
| `ed5d869b-af4e-4b80-b34d-a2338e16ce34` | Orthogonale Projektionen als erste lineare Abbildungsintuition deuten | `accepted_pilot` | The image correctly projects `v=(3,2)` orthogonally onto the x-axis as `p=(3,0)`, shows the vertical lot, identifies the rest vector `v-p=(0,2)`, and gives the projection matrix `[[1,0],[0,0]]` with result `(3,0)`. |
| `4d331ba0-56d6-5730-a51b-e3d1126b31ba` | Bildpunkte mit Matrizen berechnen | `accepted_pilot_after_regeneration` | Accepted after one targeted regeneration. The final image shows only the three original points and three image points, uses `A=[[1,1],[0,1]]`, and correctly computes `P=(2,1)->P'=(3,1)`, `Q=(0,2)->Q'=(2,2)`, and `R=(-1,1)->R'=(0,1)`. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `3` Batch 121 assets required targeted regeneration after fachlicher review.
- `5` non-imported candidates were rejected after fachlicher review.
- No Batch 121 asset required SVG fallback.
- No final Batch 121 provider request contains the string `SkillPilot`.
- No final Batch 121 provider request contains its canonical goal ID.
- No Batch 121 asset was deferred for provider quality limitations.
