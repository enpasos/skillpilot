# Goal Visualization Review - Physik Batch 025

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, twenty-fifth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-025.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-025`

Context:

- This batch covers the quantitative first law of thermodynamics, quantitative Carnot comparison, and the first rotation-mechanics goals: torque, angular momentum conservation, moment of inertia, rotational energy, and angular acceleration torque.
- The review applied the strict arrow rule: every visible physical arrow, torque arrow, rotation arrow, implication arrow, pointer, connector, curve, and formula marker was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final live provider prompt text does not contain the string `SkillPilot`.
- Final live provider prompt text does not contain canonical goal IDs.
- Final live provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated a candidate without temporary provider failure.
- The first and second candidates for `Ersten Hauptsatz in Prozessen quantitativ bilanzieren` were rejected before import because they contained decorative or physical arrows. The second candidate still showed thermometer and piston arrows; the thermometer-up cue for `Q > 0` was too broad as a general statement.
- A stricter text-only prompt produced the accepted third candidate for that goal.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `23c5382a-4b0f-5715-84b5-cf87b8323152` | first Batch 025 candidate | `rejected_regenerated` | Rejected because decorative arrow-like and circular-arrow symbols appeared in the `W > 0` and `Delta U` cards. For this energy-balance goal, unanchored arrows can imply process directions or energy cycles that are not part of the checked statement. |
| `23c5382a-4b0f-5715-84b5-cf87b8323152` | second Batch 025 candidate | `rejected_regenerated` | Rejected because it still contained a thermometer-up arrow for `Q > 0` and a piston-arrow illustration for expansion. The piston arrow was coherent for expansion, but the thermometer cue could be read as the false general claim that heat input always raises temperature. |
| `23c5382a-4b0f-5715-84b5-cf87b8323152` | Ersten Hauptsatz in Prozessen quantitativ bilanzieren | `accepted_pilot_after_regeneration` | The accepted text-only image uses the explicit convention `W = Arbeit des Gases` and `Delta U = Q - W`. It states `Q > 0` as heat supplied to the gas, `W > 0` as work done by the gas during expansion, and `Delta U` as change in internal energy. The example `Q = 500 J`, `W = 200 J`, `Delta U = 500 J - 200 J = 300 J` is correct, and the image contains no physical process arrows. |
| `73b5af24-7750-520a-bb16-43136ce19a5c` | Wirkungsgrad und Carnot-Grenze quantitativ vergleichen | `accepted_pilot` | The accepted image states `eta_real = W_nutz / Q_h`, `eta_C = 1 - T_c/T_h`, and `eta_real <= eta_C`. The numerical example `Q_h = 1000 J`, `W_nutz = 350 J`, `T_h = 600 K`, `T_c = 300 K` gives `eta_real = 0,35` and `eta_C = 0,50`, which is correct. The comparison bars are consistent with `eta_real < eta_C`; small decorative formula icons do not encode false physical arrows. |
| `cf570e66-2ce2-5923-9033-c97d74119553` | Drehmoment beschreiben | `accepted_pilot` | The accepted image shows a lever with the pivot on the left and one downward force arrow at the right force-application point. The lever-arm marker spans from pivot to application point, and the force is perpendicular to the lever, so `M = F * r` is correct for the drawn case. The red curved torque arrow indicates the clockwise rotation tendency caused by the shown downward force and is source-target consistent. |
| `37f17e7e-9fcf-5dca-ac10-e94cb8420be5` | Drehimpuls als Erhaltungsgroesse | `accepted_pilot` | The accepted image states `L = I * omega`, `M_ext = 0 -> L = konstant`, and `I_1 * omega_1 = I_2 * omega_2`. The before/after pirouette comparison correctly pairs arms far out with large `I` and small `omega`, and arms near the body with small `I` and large `omega`. It does not claim energy conservation. |
| `642aebd7-66cd-5a50-b543-73c4b207525d` | Traegheitsmoment und Rotationsenergie | `accepted_pilot` | The accepted image correctly compares mass near the axis with smaller `I` and mass farther outside with larger `I`. It states `E_rot = 1/2 * I * omega^2` and explains that `I` depends on mass distribution and rotation axis. The logical arrows in the comparison table point from condition to consequence and are correct. |
| `5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931` | Rotationsenergie und Beschleunigungsmoment berechnen | `accepted_pilot` | The accepted image states `E_rot = 1/2 * I * omega^2`, `M = I * alpha`, and `alpha = Delta omega / Delta t`. The examples `I = 0,50 kg m^2`, `omega = 4,0 rad/s`, `E_rot = 4,0 J`, `alpha = 2,0 rad/s^2`, and `M = 1,0 N m` are correct. The small rotation-direction symbols are around the drawn rotation axes and do not contradict the formulas. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 025 goals were deferred as provider limitations.
- `2` generated Batch 025 candidates were rejected before import.
- `0` generated Batch 025 regenerated candidates were rejected after the accepted text-only third candidate.
- `0` temporary provider failures occurred in Batch 025.
- Every visible physical arrow, torque arrow, rotation arrow, implication arrow, pointer, connector, curve, formula marker, or axis line in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 025 asset used an SVG fallback as the final asset.
- No final live Batch 025 provider prompt text contains the string `SkillPilot`.
- No final live Batch 025 provider prompt text contains its canonical goal ID.
- No final live Batch 025 provider prompt text contains `Mathematik`.
