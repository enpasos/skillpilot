# Goal Visualization Review - Physik Batch 028

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, twenty-eighth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-028.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-028`

Context:

- This batch covers electric-field energy, the Millikan experiment, charged-particle motion in homogeneous electric fields, the cathode-ray tube, Gauss's method for Earth's horizontal magnetic-field component, and torque on magnetic dipoles.
- The review applied the strict arrow rule: every visible force arrow, field arrow, vector arrow, beam direction, pointer, curve marker, compass direction, and apparatus direction cue was checked for coherent source-target meaning.
- Final accepted assets are visual-first Nano Banana Pro images with minimal labels. No SVG fallback was used.

Generator/prompt policy:

- Final live provider prompt text does not contain the string `SkillPilot`.
- Final live provider prompt text does not contain canonical goal IDs.
- Final live provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated candidates without temporary provider failure.
- The first cathode-ray-tube candidate was rejected because the electron beam was wavy before the deflection plates.
- The next cathode-ray-tube candidate was rejected because it added a non-physical callout arrow near the deflection label.
- Three Gauss-method candidates were rejected for unsafe direction cues: a wrong direction arrow near a bar magnet, decorative field/rotation arrows, or user-interface arrow icons.
- The final Gauss-method image intentionally avoids standalone arrows and uses only a pfeilloser angle arc.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `fd9fd8ad-c4a1-5552-9ea0-1878e0636f20` | Energie des elektrischen Feldes | `accepted_pilot` | The accepted image shows a charged plate capacitor with the positive plate on the left and the negative plate on the right. All five electric-field arrows point from `+` to `-`. The stored-energy glow is inside the field region, and the formula `W = 1/2 * C * U^2` is correct for capacitor energy. |
| `0f803c37-8191-5a07-9b31-9603ded98fe2` | Millikan-Versuch und Elementarladung | `accepted_pilot` | The accepted image shows top plate `+`, bottom plate `-`, and downward electric-field arrows from `+` to `-`. The oil drop has equal-length force arrows `Fg` downward and `Fel` upward, matching the hovering condition `Fel = Fg` for the negatively charged droplet case used in the Millikan setup. The quantization note `q = n * e` is correct as a magnitude relation. |
| `741774ef-15fc-4bcf-a370-e2c5cf4257d0` | Geladene Teilchen in homogenen elektrischen Feldern untersuchen | `accepted_pilot` | The accepted image shows a positive particle `+q` entering a homogeneous field between a positive upper plate and a negative lower plate. All field arrows point downward, `Fel` points downward, and the dashed trajectory curves downward, which is correct for a positive charge. The formula `Fel = q * E` is correct for the shown positive charge. |
| `5fda8623-69e0-5503-9c6d-86d054a8cf91` | initial Batch 028 candidate | `rejected_regenerated` | Rejected because the electron beam was drawn as a wave before the deflection plates. In a cathode-ray tube without an oscillating field, the incoming beam should be straight before entering the deflection region. |
| `5fda8623-69e0-5503-9c6d-86d054a8cf91` | first regeneration candidate | `rejected_regenerated` | Rejected because the physics was improved but a curved callout arrow was added near `Ablenkung durch E-Feld`. The arrow was not a necessary physical vector and could be misread as a direction cue. |
| `5fda8623-69e0-5503-9c6d-86d054a8cf91` | Braunsche Roehre (Oszilloskop) | `accepted_pilot_after_second_regeneration` | The accepted image shows the upper deflection plate as `+`, the lower plate as `-`, and exactly three downward field arrows from `+` to `-`. The electron beam is straight before the plates and then bends upward, which is correct because the electron force is opposite to the downward electric field. No extra physical or callout arrows are present. |
| `58db62d4-458f-5e2d-9ca0-968e09f4944b` | first Batch 028 candidate | `rejected_regenerated` | Rejected because an added direction arrow near the bar magnet pointed in a misleading/wrong direction for the shown magnet side. A wrong arrow in this apparatus image makes the candidate unusable. |
| `58db62d4-458f-5e2d-9ca0-968e09f4944b` | second Batch 028 candidate | `rejected_regenerated` | Rejected because decorative field-line/rotation-like arrow icons and inconsistent compass direction markings remained visible. |
| `58db62d4-458f-5e2d-9ca0-968e09f4944b` | third Batch 028 candidate | `rejected_regenerated` | Rejected because the compass face still contained circular arrow markings and the timer contained a play-button triangle. Those are unnecessary arrow-like cues in a strict no-false-arrow image. |
| `58db62d4-458f-5e2d-9ca0-968e09f4944b` | Gausssches Verfahren anwenden | `accepted_pilot_after_third_regeneration` | The accepted image uses a tabletop apparatus with compass, ruler, bar magnet, suspended magnet, and analog stopwatch. The only angular cue is a plain `phi` arc without arrowhead. `N` and `S` are placed on the corresponding red/blue magnet or compass-needle ends, and no standalone physical direction arrow is drawn. |
| `d02438ba-0cc9-5993-831e-5e44d35e32c4` | Drehmoment auf Magnetnadeln und Dipole | `accepted_pilot` | The accepted image shows a homogeneous magnetic field with all `B` arrows pointing to the right. The dipole's north end is tilted above the field direction, so the shown clockwise torque markers reduce the angle `alpha` toward alignment with `B`. The formula `M = mu * B * sin(alpha)` is correct. No force arrows are drawn. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 028 goals were deferred as provider limitations.
- `5` generated Batch 028 candidates were rejected before final accepted replacements.
- `0` temporary provider failures occurred in Batch 028.
- Every visible physical arrow, field arrow, force arrow, vector arrow, beam direction, graph/axis arrow, pointer, compass cue, angle marker, or arrow-like icon in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 028 asset used an SVG fallback as the final asset.
- No final live Batch 028 provider prompt text contains the string `SkillPilot`.
- No final live Batch 028 provider prompt text contains its canonical goal ID.
- No final live Batch 028 provider prompt text contains `Mathematik`.
