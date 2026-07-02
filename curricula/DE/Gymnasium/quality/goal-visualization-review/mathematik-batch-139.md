# Goal Visualization Review - Mathematik Batch 139

Review date: 2026-07-02

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed_with_user_review_correction`

Batch file: `tmp/goal-visualization-batch-139.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/batch-139`

Context:

- This batch covers cuboid properties, volume and surface-area calculations, and selected number-theory goals for the LK lane.
- All six accepted goals were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.
- The surface-area image required targeted user-review correction. Earlier candidates were rejected for visible target-audience/header text, a misspelling, a notebook-hole side pattern, a non-cross cuboid net, duplicated cuboids, ambiguous exterior net dimension arrows, wrong orientation labeling on deck/base faces, or added net flaps.
- The final surface-area correction used Nano Banana Pro with the previous near-correct image as an image-to-image reference. This was only an input to Nano Banana Pro; no SVG fallback was used as a final asset.

Generator/prompt policy:

- Provider prompt text does not contain the string `SkillPilot`.
- Provider prompt text does not contain canonical goal IDs.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `636b3e2d-c687-5469-8850-e085df06878d` | Körpereigenschaften fachlich begründen | `accepted_pilot` | The image uses a cube and correctly highlights six congruent square faces, twelve equal edges, eight vertices, parallel opposite faces, and right angles. The visible label lines point to the matching faces, edges, vertices, and angle marks. |
| `5f548596-9bc3-532e-88a0-81d5029809e9` | Volumeninhalte von Körpern berechnen | `accepted_pilot` | The cuboid dimensions `4 cm`, `3 cm`, and `2 cm` are consistent. Both calculation paths are correct: `V = l*b*h = 4 cm*3 cm*2 cm = 24 cm^3` and `Grundfläche = 12 cm^2`, then `V = 12 cm^2*2 cm = 24 cm^3`. Dimension markers point to the intended cuboid edges. |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | Oberflächeninhalte von Körpern berechnen | `rejected_after_user_review_replaced` | The first imported candidate was rejected after user review because it visibly included a `Gymnasium - Mathematick` style header and a notebook-hole side pattern. It was also not kept because decorative arrows and the surface-net presentation were not robust enough for this lane. |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | Oberflächeninhalte von Körpern berechnen | `rejected_after_user_review_replaced` | The first no-header correction removed the visible header and side holes and kept the formula `O=2(lb+lh+bh)` with result `52 cm^2`, but the net on the right was not a clear cross-like unfolded cuboid net. It was replaced after user review. |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | Oberflächeninhalte von Körpern berechnen | `rejected_regenerated` | A reference-image retry produced the requested cross-like net structure, but duplicated the cuboid and omitted a clear `h=2 cm` label on the cuboid. It was not imported. |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | Oberflächeninhalte von Körpern berechnen | `rejected_regenerated` | A later reference-image retry showed one cuboid and correct arithmetic but added exterior dimension arrows around the net. Some of these edge labels were ambiguous or attached to the wrong visual edge, so the image was rejected under the strict arrow/source-target rule. |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | Oberflächeninhalte von Körpern berechnen | `rejected_after_user_review_replaced` | A later correction showed exactly one cuboid, correct arithmetic, no header typo, and no net arrows, but its deck/base net faces were high vertical rectangles still labeled `4 cm x 3 cm`. In this net orientation those faces share the `3 cm` edge with the `3 cm x 2 cm` mantle face, so the net labels needed to be `3 cm x 4 cm`. It was replaced after user review. |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | Oberflächeninhalte von Körpern berechnen | `rejected_regenerated` | Two subsequent image-to-image attempts changed the deck/base labels to `3 cm x 4 cm` but added visible flaps, side strips, or extra outlines around the net. These were rejected because the user-requested target was the existing simple six-rectangle net with only corrected labels and proportions. |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | Oberflächeninhalte von Körpern berechnen | `accepted_pilot_after_user_review_correction` | The accepted correction shows exactly one cuboid with `l=4 cm`, `b=3 cm`, and `h=2 cm`, the formula `O = 2(lb + lh + bh)`, and the correct calculation `O = 2(4*3 + 4*2 + 3*2) cm^2 = 2(12 + 8 + 6) cm^2 = 52 cm^2`. The right-hand net is a connected simple six-rectangle cuboid net with four mantle faces `3 cm x 2 cm`, `4 cm x 2 cm`, `3 cm x 2 cm`, `4 cm x 2 cm`; deck and base are attached to the `3 cm x 2 cm` mantle face and correctly labeled `3 cm x 4 cm`, with vertical proportions matching that orientation. The accepted image has no visible school/subject header, no `Mathematick` typo, no side-hole pattern, no net flaps, and no arrows on or around the net. |
| `d8cbf2bd-2512-5661-b431-4aea7e688912` | Modulare Arithmetik nutzen (LK) | `accepted_pilot` | The modular-power example is correct: `7^1 mod 13 = 7`, `7^2 = 49 ≡ 10 mod 13`, `7^4 ≡ 10^2 = 100 ≡ 9 mod 13`, and `7^5 ≡ 9*7 = 63 ≡ 11 mod 13`. The displayed remainder checks `49:13`, `100:13`, and `63:13` match the stated residues. |
| `e4eaff7f-1e3d-54ea-8a59-02864948b5eb` | Chinesischen Restsatz nutzen (LK) | `accepted_pilot` | The congruence system `x ≡ 2 mod 3`, `x ≡ 3 mod 5` has coprime moduli, so the solution is unique modulo `15`. The candidate list `2, 5, 8, 11, 14` and the modulo-5 checks correctly identify `8`, giving `x ≡ 8 mod 15`. |
| `d32f599e-3b38-5557-8ad3-565bcd99f4c6` | Primzahltests erläutern (LK) | `accepted_pilot` | The prime test for `29` is correct: `sqrt(29) ≈ 5,39`, so testing divisibility by `2`, `3`, and `5` is sufficient; the shown remainders are nonzero. The contrast example `91 = 7*13` correctly illustrates a composite number. |

## Batch Checks

- `6` normal pilot learning-goal assets are imported and accepted.
- `1` user-reported asset was replaced after multiple targeted regenerations.
- Every visible arrow, arrow-like marker, pointer, or leader line was checked for source-target consistency; no accepted image contains a false mathematical arrow.
- No Batch 139 asset required SVG fallback.
- No final Batch 139 provider prompt text contains the string `SkillPilot`.
- No final Batch 139 provider prompt text contains its canonical goal ID.
- No Batch 139 asset is marked `deferred_provider_limitation`.
