# Goal Visualization Review - Physik Batch 008

Review date: 2026-07-02

Scope: canonical `DE Gymnasium Physik`, eighth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-008.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-008`

Context:

- This batch covers heat as energy, electrical energy transformations, a physics-relevance orientation anchor, and three measurement-quality goals: measurement deviations, uncertainty notation, and significant figures.
- The review applied the strict arrow rule: every visible physical arrow, energy/output marker, measurement pointer, connector, or dashed marker must have a coherent source and target. If an arrow can be read as a physical statement, it must be physically right.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `eeba6bf8-a2b9-4d7d-a1d6-67286c923cef` | Waerme als Energieform qualitativ einordnen | `accepted_pilot` | The accepted image shows heat transfer from a warm body toward a cold body, followed by temperature equalization. The energy-balance bar splits supplied energy into body warming and energy released to the surroundings, with the correct statement that energy is conserved. The heat arrow has a coherent source and target from warm to cold. |
| `cbb26ed2-6979-46f6-a4ae-128f5c5d9d76` | Elektrische Energieumwandlungen qualitativ beschreiben | `accepted_pilot` | The accepted image shows a lamp, motor, and heating wire with simple working closed circuits. Electrical energy is shown as input, and the outputs `Licht`, `Bewegung`, and `Waerme` are assigned to the correct devices. Concept arrows run from input or device toward output and no current-direction arrow is drawn in the circuits. |
| `5c44b9ba-9b05-4774-95d5-073230d3fc4f` | Warum Physik? - Weltverstaendnis & Zukunft | `accepted_pilot` | The accepted image is an orientation collage with smartphone, medicine/MRI, stars, and energy technology. It avoids school/audience labels and brand marks. The only directional markers are local sunlight marks toward the solar panel; they have a coherent source-target reading and do not connect unrelated tiles. |
| `8aff7aac-321b-5172-ac55-877876bfd2cd` | Messabweichungen und Fehlerarten unterscheiden | `accepted_pilot` | The accepted image correctly contrasts systematic deviation as a tight group of measured dots on one side of the true-value line with random deviation as scattered dots around the true value. The examples `Nullpunkt falsch` and `Ableseschwankung` match the two error types. Axis arrows are mathematical scale markers, not physical motion arrows. |
| `f6b1d812-ce8b-5852-b417-e6c29b533c7a` | Messunsicherheiten angeben | `accepted_pilot` | The accepted image shows a ruler value `12,3 cm`, a symmetric uncertainty interval from `12,2 cm` to `12,4 cm`, and the correct notation `l = (12,3 +/- 0,1) cm` rendered with a plus-minus sign. The checklist keeps unit and decimal-place consistency. Annotation arrows point to the measured value and uncertainty. |
| `b615830a-e8b0-5754-81e0-99da98343a8d` | Signifikante Stellen korrekt verwenden | `accepted_pilot` | The accepted image correctly states that `3,20 m` has `3` significant figures, `0,045 m` has `2`, and `1200 m` is unclear without additional notation. The example `4,56 cm + 1,2 cm = 5,8 cm` is correctly rounded to one decimal place. The visible arrow is an annotation pointing to the rounded result. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 008 goals were deferred as provider limitations.
- `0` Batch 008 candidates were rejected before import.
- Every visible physical arrow, arrow-like marker, energy/output marker, measurement pointer, connector, ray-like line, or dashed segment in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 008 asset used an SVG fallback as the final asset.
- No final Batch 008 provider prompt text contains the string `SkillPilot`.
- No final Batch 008 provider prompt text contains its canonical goal ID.
- No final Batch 008 provider prompt text contains `Mathematik`.
