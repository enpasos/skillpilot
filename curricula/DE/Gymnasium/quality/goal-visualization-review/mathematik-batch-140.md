# Goal Visualization Review - Mathematik Batch 140

Review date: 2026-07-02

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed_with_deferred_provider_limitation`

Batch file: `tmp/goal-visualization-batch-140.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/batch-140`

Context:

- This batch covers LK number-theory factoring and spatial-coordinate reflection goals plus two lower-secondary spatial-geometry orientation goals.
- Five accepted goals were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.
- Several geometry retries used temporary raster reference images under `tmp/goal-visualization-references/batch-140/` as image-to-image guidance for Nano Banana Pro. These references are not final assets and no SVG fallback was used.
- The goal `Räumliche Objekte im Koordinatensystem verorten` remains uncovered because repeated Nano Banana Pro attempts produced false axis/edge/point relationships.

Generator/prompt policy:

- Provider prompt text does not contain the string `SkillPilot`.
- Provider prompt text does not contain canonical goal IDs.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `1c1754b7-2cd3-5635-824d-ce93f7b99514` | Faktorisierungsverfahren erläutern (LK) | `accepted_pilot` | The congruence-of-squares example is correct: `N=91`, `x=10`, `x^2-N=100-91=9=3^2`, hence `10^2 ≡ 3^2 (mod 91)`. The gcd computations `ggT(10-3,91)=7` and `ggT(10+3,91)=13` correctly produce `91=7*13`. The only visible arrow points from the difference calculation to `9=3^2` and has a valid source-target relation. |
| `fcd1d180-ddce-5408-8c5d-70e417b179e7` | Punkte in allgemeinen Raumkonfigurationen spiegeln (LK) | `rejected_regenerated` | The first candidate had correct coordinate text for `P(5|1|3)`, `P'(-1|1|3)`, and `M(2|1|3)`, but combined this with a 3D axis sketch where the segment `PP'` was not parallel to the displayed x-direction. It was not imported. |
| `fcd1d180-ddce-5408-8c5d-70e417b179e7` | Punkte in allgemeinen Raumkonfigurationen spiegeln (LK) | `accepted_pilot_after_regeneration` | The accepted image uses an x-direction cross-section with `y=1` and `z=3` fixed. `P'(-1|1|3)`, `M(2|1|3)`, and `P(5|1|3)` are placed at equal x-distances `3` from the mirror plane `E: x=2`; the checks `5-2=3` and `2-(-1)=3` are correct. No mapping arrows are shown. |
| `a97c7cce-1343-5d04-926f-4a4f323b3c21` | Geraden in allgemeinen Raumkonfigurationen spiegeln (LK) | `rejected_regenerated` | The first candidate had correct point labels and direction vector text, but used decorative 3D axes that were not aligned with the displayed reflection direction. It was rejected under the strict arrow/source-target and geometry-consistency rule. |
| `a97c7cce-1343-5d04-926f-4a4f323b3c21` | Geraden in allgemeinen Raumkonfigurationen spiegeln (LK) | `accepted_pilot_after_regeneration` | The accepted image reflects the line by two point pairs: `A(5|0|1)` to `A'(-1|0|1)` and `B(5|2|3)` to `B'(-1|2|3)`, with midpoints `M_A(2|0|1)` and `M_B(2|2|3)` on `E: x=2`. The direction vector check `B-A = B'-A' = (0|2|2)` is correct. Dashed connector segments have no arrowheads and connect the matching pairs only. |
| `985d5529-a586-50eb-bd7f-2db2be8906d1` | Ebenen in allgemeinen Raumkonfigurationen spiegeln (LK) | `rejected_regenerated` | The first candidate contained the right point and plane equations but added a 3D axis sketch that was inconsistent with the left-to-right x-coordinate layout. It was not imported. |
| `985d5529-a586-50eb-bd7f-2db2be8906d1` | Ebenen in allgemeinen Raumkonfigurationen spiegeln (LK) | `accepted_pilot_after_regeneration` | The accepted image shows three parallel planes `F: x=5`, `S: x=2`, and `F': x=-1`. It uses the three non-collinear point pairs `A/A'`, `B/B'`, and `C/C'`; the visible connector segments pass through the matching midpoint labels `M_A`, `M_B`, and `M_C` on `S`. The table correctly repeats `(5+(-1))/2=2` for all three x-coordinates. |
| `aae119f2-925f-5fc1-b795-b52c9e980863` | Räumliche Objekte im Koordinatensystem verorten | `rejected_regenerated` | The first text-only candidate had a correct coordinate table but a misleading cuboid sketch: point labels were duplicated, and a visible `Δy`/edge annotation did not connect the intended vertices. It was not imported. |
| `aae119f2-925f-5fc1-b795-b52c9e980863` | Räumliche Objekte im Koordinatensystem verorten | `rejected_regenerated` | The first image-to-image retry still swapped the displayed x/y axis interpretation: the text stated `A-B=4 in x`, but the horizontal edge and axis label did not match the x-direction. It was rejected. |
| `aae119f2-925f-5fc1-b795-b52c9e980863` | Räumliche Objekte im Koordinatensystem verorten | `rejected_regenerated` | A second image-to-image retry with x diagonal down-left produced an invented extra point `G(5|1|0)` and placed `D(1|4|0)` on a visibly upper cuboid edge, contradicting `z=0`. It was rejected. |
| `aae119f2-925f-5fc1-b795-b52c9e980863` | Räumliche Objekte im Koordinatensystem verorten | `deferred_provider_limitation` | A final reduced-reference retry removed the full cuboid and requested only the three edges `A-B`, `A-D`, and `A-E`, but Nano Banana Pro still drew `A-B` horizontally while labeling the x-axis diagonally and introduced an indirect `A-D` path. Because multiple attempts produced false axis/edge/point relationships, no active goal-visualization link or published asset was created for this goal. |
| `7680701b-35e3-519e-beaa-09753e733756` | Schrägbilder räumlicher Objekte zeichnen | `rejected_regenerated` | The first candidate had correct text but the visible receding depth edges were too long relative to the `4 cm` front width for a `2 cm real -> 1 cm gezeichnet` oblique sketch. It was not imported. |
| `7680701b-35e3-519e-beaa-09753e733756` | Schrägbilder räumlicher Objekte zeichnen | `accepted_pilot_after_regeneration` | The accepted image shows a construction sequence for a cuboid with front rectangle `4 cm x 3 cm`, depth edges at `45°`, and depth shortened to `1 cm` for `2 cm` real depth. The final back rectangle is parallel to the front rectangle, and the receding edges are visibly about one quarter of the `4 cm` front width. No decorative or misleading arrows are shown. |

## Batch Checks

- `5` normal pilot learning-goal assets are imported and accepted.
- `1` goal is marked `deferred_provider_limitation` after repeated provider attempts with false mathematical geometry.
- Every visible arrow, arrow-like marker, pointer, or connector in the accepted images was checked for source-target consistency; no accepted image contains a false mathematical arrow.
- No Batch 140 asset used an SVG fallback as the final asset.
- No final Batch 140 provider prompt text contains the string `SkillPilot`.
- No final Batch 140 provider prompt text contains its canonical goal ID.
