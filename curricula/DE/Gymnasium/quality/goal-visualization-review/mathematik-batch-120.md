# Goal Visualization Review - Mathematik Batch 120

Review date: 2026-07-01

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering matrix addition and subtraction, matrix-vector products, matrix multiplication, simple inverse matrices, stochastic transition-matrix checks, and Markov-chain state calculations.
- All Nano Banana Pro provider calls completed successfully.
- Per-goal prompt appends constrained each visualization to fixed matrices, dimensions, arithmetic, vector conventions, transition probabilities, and interpretation text.
- One goal required targeted regeneration after fachlicher review: the first Markov-state candidate calculated with a row-vector convention but displayed the state vectors as column vectors.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Rejected / Regenerated Candidates

| Goal ID | Attempt | Decision | Reason |
| --- | --- | --- | --- |
| `25157542-a262-562f-a29c-ac8d53b9798f` | initial Batch 120 candidate | `rejected_regenerated` | The candidate correctly computed `z1=(0,50;0,50)` and `z2=(0,45;0,55)`, but it used the formula `z_neu = z_alt * P` while drawing `z0`, `z1`, and `z2` as column vectors. That notation mismatch made the Markov convention misleading. |

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `6ebdc8cc-3393-5eb3-aadb-107e4f6d12b8` | Matrizen addieren und subtrahieren | `accepted_pilot` | The image correctly uses `A=[[2,-1],[0,4]]` and `B=[[3,5],[-2,1]]`. It shows addition and subtraction entrywise, gives `A+B=[[5,4],[-2,5]]`, gives `A-B=[[-1,-6],[2,3]]`, and explicitly handles `0-(-2)=2`. |
| `6f09c97e-779b-500b-8092-3fb9696aa5bb` | Matrix-Vektor-Produkte berechnen | `accepted_pilot` | The image correctly computes `P*x0` with `P=[[0,8,0,3],[0,2,0,7]]` and `x0=[70;30]`. It shows row-vector dot products for the two components and gives `x1=[65;35]`. |
| `304111dd-426b-520b-a275-3fa37da1b0e0` | Matrizen multiplizieren | `accepted_pilot` | The image correctly checks the dimensions `2x3 * 3x2 -> 2x2`, uses row-times-column multiplication, and gives `A*B=[[2,7],[14,10]]`. The highlighted `c12=1*1+2*3+0*2=7` calculation is correct, and the image warns against entrywise multiplication. |
| `ce198bc9-b014-52ba-814f-25cc3e020668` | Einfache inverse Matrizen bestimmen | `accepted_pilot` | The image correctly uses `A=[[2,1],[1,1]]`, computes `det(A)=2*1-1*1=1`, gives `A^-1=[[1,-1],[-1,2]]`, and verifies `A*A^-1=[[1,0],[0,1]]`. |
| `9bf67cce-4c8f-5497-8e64-825b83c6aa40` | Stochastische Übergangsmatrizen für Markov-Ketten prüfen | `accepted_pilot` | The image consistently uses the row convention: rows are current states and columns are next states. It checks all entries are between `0` and `1`, shows the row sums `0,6+0,4+0,0=1,0`, `0,2+0,5+0,3=1,0`, and `0,1+0,0+0,9=1,0`, and concludes that `P` is a valid stochastic transition matrix. |
| `25157542-a262-562f-a29c-ac8d53b9798f` | Zustände in Markov-Ketten berechnen | `accepted_pilot` | Accepted after one targeted regeneration. The final image consistently shows horizontal row vectors and uses `z_neu = z_alt * P` with `P=[[0,7,0,3],[0,2,0,8]]`. It computes `z1=[0,50 0,50]`, then `z2=[0,45 0,55]`, and correctly interprets the result as `45%` in state `A` and `55%` in state `B` with total sum `1,0`. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `1` Batch 120 asset required one targeted regeneration after fachlicher review.
- `1` non-imported candidate was rejected after fachlicher review.
- No Batch 120 asset required SVG fallback.
- No final Batch 120 provider request contains the string `SkillPilot`.
- No final Batch 120 provider request contains its canonical goal ID.
- No Batch 120 asset was deferred for provider quality limitations.
