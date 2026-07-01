# Goal Visualization Review - Mathematik Batch 119

Review date: 2026-07-01

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering plane-plane intersections, plane-polyhedron Schnittfiguren, tuple organization in spreadsheets, matrix entry reading, transition graphs, and scalar multiplication of matrices.
- All Nano Banana Pro provider calls completed successfully.
- Per-goal prompt appends constrained each visualization to fixed equations, coordinate values, spreadsheet cells, matrix entries, transition probabilities, and arithmetic.
- One goal required targeted regeneration after fachlicher review: the first plane-polyhedron candidate had a visually ambiguous axis/intercept assignment even though its table values were correct.
- One transition-graph asset was later replaced after user review: the graph now shows all nine possible directed transitions, including zero-probability transitions and self-loops, and the table now uses a `von`/`nach` matrix with source states as columns.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Rejected / Regenerated Candidates

| Goal ID | Attempt | Decision | Reason |
| --- | --- | --- | --- |
| `3aea4d33-4170-5ecc-82b0-3a3974cc2237` | initial Batch 119 candidate | `rejected_regenerated` | The candidate used the intended plane `x+y+z=4` and listed `A=(4;0;0)`, `B=(0;4;0)`, `C=(0;0;4)` correctly in the table, but the cube sketch made the x/y axis assignment visually ambiguous and risked swapping the intercepts. This was not reliable enough for an accepted geometry visualization. |
| `5e893892-393e-5df0-b705-fb3b3458122f` | original Batch 119 accepted asset | `rejected_after_user_review_replaced` | The original asset correctly showed the positive transitions, but it omitted zero-probability transitions and self-loops, and used a compact row-list table instead of the requested `von`/`nach` transition matrix. It was replaced after user review. |

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `857c1c46-5d94-5dfb-9697-9a9fd04103c3` | Schnittgerade zweier Ebenen bestimmen | `accepted_pilot` | The image correctly uses `E1: x+y+z=3` and `E2: x-y+z=1`, subtracts the equations to get `2y=2`, derives `y=1` and `x+z=2`, then parameterizes the Schnittgerade as `s: X=(2;1;0)+t*(-1;0;1)`. The displayed control point and direction satisfy both plane equations. |
| `3aea4d33-4170-5ecc-82b0-3a3974cc2237` | Schnittfiguren von Ebenen mit Polyedern bestimmen | `accepted_pilot` | Accepted after one targeted regeneration. The final image correctly shows the cube `0<=x,y,z<=4`, the plane `E: x+y+z=4`, and the three intercepts `A=(4;0;0)` on the x-axis, `B=(0;4;0)` on the y-axis, and `C=(0;0;4)` on the z-axis. The table checks all three points and identifies the Schnittfigur as Dreieck `ABC`. |
| `f378917f-2ca7-4c68-bd66-3f9457095dd5` | Tupelsachverhalte in Tabellenkalkulation organisieren und Zellbezüge lesen | `accepted_pilot` | The image correctly organizes the tuple data `P(2,5)`, `Q(4,1)`, and `R(6,3)` in a spreadsheet-like table. The highlighted cell references are consistent with the shown values, including `B3=4` and `C4=3`. |
| `b5062446-332f-4a67-aaf7-3bfa3e5aded9` | Matrixeinträge über Zeilen und Spalten lesen und deuten | `accepted_pilot` | The image correctly presents the matrix with rows `[3,5,1]` and `[2,0,-4]`, labels rows and columns clearly, and reads `a_1,2=5` and `a_2,3=-4` from the correct row-column positions. |
| `5e893892-393e-5df0-b705-fb3b3458122f` | Übergangsprozesse mit Zustands- und Übergangsgraphen beschreiben | `accepted_pilot_after_user_review_correction` | The corrected image keeps the graph/table split, shows all nine directed transitions including `A->A`, `B->B`, `C->C`, `C->B`, and all other zero-probability transitions, and uses source-color-consistent arrows. The table is a `von`/`nach` matrix with source states as columns, target states as rows, values `nach A: 0,0 | 0,4 | 1,0`, `nach B: 0,7 | 0,0 | 0,0`, `nach C: 0,3 | 0,6 | 0,0`, and column sums `1,0`. |
| `4fb40e58-58c1-5964-b58e-3347a8022b97` | Skalare Multiplikation von Matrizen durchführen | `accepted_pilot` | The image correctly uses `k=3` and `A=[[2,-1],[0,4]]`, multiplies every entry by `3`, and gives the result `3A=[[6,-3],[0,12]]`. The sign of `3*(-1)=-3` and the zero entry are handled correctly. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `1` Batch 119 asset required one targeted regeneration after fachlicher review.
- `1` Batch 119 asset was later replaced after user review correction.
- `1` non-imported candidate was rejected after fachlicher review.
- `1` previously imported candidate was replaced after user review.
- No Batch 119 asset required SVG fallback.
- No final Batch 119 provider request contains the string `SkillPilot`.
- No final Batch 119 provider request contains its canonical goal ID.
- No Batch 119 asset was deferred for provider quality limitations.
