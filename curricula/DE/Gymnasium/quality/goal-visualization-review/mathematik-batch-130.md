# Goal Visualization Review - Mathematik Batch 130

Review date: 2026-07-02

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering parametric parabolic trajectories, transition vectors and transition matrices, stochastic matrices for Markov chains, matrix powers, limiting matrices, and term evaluation by substitution.
- All Nano Banana Pro provider calls completed successfully.
- For all transition-matrix goals, the reviewed convention is column-stochastic: columns are labelled `von`, rows are labelled `nach`, and column sums equal `1`.
- Three initial candidates were accepted after fachlicher review.
- Three goals required targeted regeneration because of a wrong/misleading context label, an unwanted branding-like header, a confusing red error mark, or duplicate graph arrows. All were corrected and accepted after review.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted or rejected assets.

## Rejected / Regenerated Candidates

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `6aa593a3-6690-581d-9b7d-37cac78187a1` | Übergangsprozesse mit stochastischen Matrizen modellieren | `rejected_regenerated` | The first candidate had the matrix and calculation correct but labelled the lower context group as `Anbieter A` instead of `Anbieter B`. The first regeneration fixed the labels but drew two visible `0.7` loops for the `B -> B` transition, which could be read as duplicate transitions. These candidates were not imported. The final accepted image uses only the matrix table and calculation. |
| `0de1e45c-aea9-5e53-932a-027dcf509efa` | Matrixpotenzen für langfristige Übergangsprozesse nutzen (LK) | `rejected_regenerated` | The first candidate was mathematically correct but included an unwanted branding-like header line (`Infographic | Mathematiko`). It was not imported. The accepted regeneration removed branding and kept the matrix powers, intermediate vectors, and long-term interpretation correct. |
| `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` | Termwerte durch Einsetzen berechnen | `rejected_regenerated` | The first candidate computed the term value correctly, but a red X/overlay near the first substitution line could be read as marking a correct part of the term as wrong. It was not imported. The accepted regeneration shows only the correct calculation and a neutral note about parentheses for negative values. |

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `eb112b6f-4cc4-58af-975a-f1ea61b727f0` | Parabelbahnen mithilfe von Parametern darstellen (LK) | `accepted_pilot` | The image correctly uses `x(t)=2t`, `y(t)=-t^2+4t`, and `0<=t<=4`, marks `P0(0|0)`, the vertex `S(4|4)` at `t=2`, and the landing point `P4(8|0)`, and interprets `t`, `x(t)`, `y(t)`, and the meaningful time interval. |
| `03685f87-7570-5bb3-b1c7-134124abb317` | Übergangsprozesse mit Zustandsvektoren und Übergangsmatrizen beschreiben | `accepted_pilot` | The image correctly presents `v_0=(100,50,20)^T`, a column-stochastic transition matrix with columns `von A/B/C` and rows `nach A/B/C`, shows all three column sums as `1.0`, and computes `v_1=M*v_0=(72,55,43)^T` while preserving the total population `170`. |
| `6aa593a3-6690-581d-9b7d-37cac78187a1` | Übergangsprozesse mit stochastischen Matrizen modellieren | `accepted_pilot_after_second_regeneration` | The accepted final image correctly uses the column-stochastic matrix `[[0.8,0.3],[0.2,0.7]]` with columns `von A`, `von B` and rows `nach A`, `nach B`, shows column sums `0.8+0.2=1.0` and `0.3+0.7=1.0`, and computes `v_1=M*v_0=(0.75,0.25)^T` for `v_0=(0.9,0.1)^T`. |
| `0de1e45c-aea9-5e53-932a-027dcf509efa` | Matrixpotenzen für langfristige Übergangsprozesse nutzen (LK) | `accepted_pilot_after_regeneration` | The accepted regeneration correctly shows `M=[[0.8,0.3],[0.2,0.7]]`, `v_0=(0.9,0.1)^T`, `v_1=(0.75,0.25)^T`, `M^2=[[0.70,0.45],[0.30,0.55]]`, `v_2=(0.675,0.325)^T`, `v_5≈(0.609,0.391)^T`, `v_10≈(0.600,0.400)^T`, and the long-term approach to `(0.6,0.4)^T`. |
| `922d89fc-1cbd-56e9-ac5d-5cb59085de6c` | Grenzprozesse und Grenzmatrizen interpretieren (LK) | `accepted_pilot` | The image correctly shows `M=[[0.8,0.3],[0.2,0.7]]`, the limiting matrix `G=[[0.6,0.6],[0.4,0.4]]` with equal columns, and interprets both start states `(1,0)^T` and `(0,1)^T` as tending to the same stable long-term state `(0.6,0.4)^T`. |
| `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` | Termwerte durch Einsetzen berechnen | `accepted_pilot_after_regeneration` | The accepted regeneration correctly evaluates `T(x,y)=2*x^2-3*y+4` for `x=-2`, `y=3`: `T(-2,3)=2*(-2)^2-3*3+4=2*4-9+4=8-9+4=3`, with a clear note that `(-2)^2=4`. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `3` Batch 130 assets required targeted regeneration after fachlicher review.
- `4` non-imported candidates were rejected after fachlicher review.
- No Batch 130 asset required SVG fallback.
- No final Batch 130 provider request contains the string `SkillPilot`.
- No final Batch 130 provider request contains its canonical goal ID.
- No Batch 130 asset was deferred for provider quality limitations.
