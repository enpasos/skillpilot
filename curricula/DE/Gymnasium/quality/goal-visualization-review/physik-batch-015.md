# Goal Visualization Review - Physik Batch 015

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, fifteenth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-015.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-015`

Context:

- This batch covers deriving momentum conservation from Newton's laws, reference-frame choice and superposition, horizontal projectile motion, tangential and angular speed, deriving centripetal force, and applying centripetal force.
- The review applied the strict arrow rule: every visible physical arrow, measurement arrow, diagram axis arrow, relation pointer, connector, and trajectory-like line was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All initial live Nano Banana Pro requests generated a candidate without provider retry.
- Four initial candidates were rejected during fachlicher review and regenerated once with stricter prompt constraints.
- The regeneration batch generated all four replacement candidates without provider retry.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `f524f05c-4456-4fc3-a1f7-f40741fc1f16` | Impulserhaltung aus Newtonschen Axiomen (LK) | `accepted_pilot` | The accepted image uses a formula ladder, not a physical collision scene. It correctly states `F_AB = -F_BA`, links `dp_A/dt` and `dp_B/dt` to the internal force pair, derives `d/dt(p_A+p_B)=F_BA+F_AB=0`, and concludes `p_ges=p_A+p_B=konstant`. The assumptions box correctly limits the statement to a closed system, internal forces, and an inertial frame. |
| `68c90ba6-c438-463c-9a53-cf61062d416a` | Bezugssysteme und Superpositionsprinzip | `accepted_pilot` | The accepted image shows a vector triangle for motion superposition. The blue boat-relative-water vector starts at `O`, the green water-relative-bank vector starts exactly at the blue vector head, and the red boat-relative-bank resultant starts at `O` and ends exactly at the green vector head. The labels consistently distinguish the reference frames. |
| `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2` | Waagerechter Wurf analysieren | `accepted_pilot_after_regeneration` | The first candidate was rejected because the equal-time points did not sit consistently at the intended horizontal positions. The accepted regenerated image shows a downward-positive coordinate diagram with equal horizontal spacing at `x=0,2,4,6` for `t=0,1,2,3 s`, vertically increasing displacement consistent with `y=1/2*g*t^2`, and the component equations `x=v_x*t`, `v_x=2 m/s`, `g=10 m/s^2`. No force arrow is drawn along the trajectory. |
| `ec7a0a68-730b-5c94-ac72-a937508f8303` | Bahn- und Winkelgeschwindigkeit | `accepted_pilot_after_regeneration` | The first candidate was rejected because it added an extra arrowhead on the circular path or angle sector. The accepted regenerated image has one physical arrow only: a tangent arrow at point `P` labelled `v=6 m/s`. The radius is labelled `r=2 m`, the angle sector is labelled `Delta phi=3 rad`, `Delta t=1 s`, and the formula box correctly gives `omega=3 rad/s` and `v=omega*r=6 m/s`. |
| `e918b31f-6f39-5dee-ade6-3617080fb24f` | Zentripetalkraft herleiten | `accepted_pilot_after_regeneration` | The first candidate was rejected because decorative icons added extra arrow-like marks around the diagram. The accepted regenerated image gives `a_z=v^2/r`, `F_z=m*a_z`, and `F_z=m*v^2/r`. In the circle sketch, the single physical force arrow starts at the mass and points inward to the center `M`; no outward centrifugal force is shown as a real force. |
| `accb1d9e-cd48-5983-bcef-9b9bca4a9114` | Kreisbewegung mit Zentripetalkraft anwenden | `accepted_pilot_after_regeneration` | The first candidate was rejected because it added an unneeded arrowhead on the circular path. The accepted regenerated image shows `m=2 kg`, `r=1,5 m`, `v=3 m/s`, and a single inward force arrow from the mass toward `M`, labelled `F_z=12 N`. The calculation `F_z=m*v^2/r=2 kg*(3 m/s)^2/1,5 m=12 N` is correct, and no outward or tangential force arrow is present. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 015 goals were deferred as provider limitations.
- `4` generated Batch 015 first candidates were rejected for fachliche or arrow-rule reasons and regenerated successfully.
- `0` temporary provider failures occurred in Batch 015.
- Every visible physical arrow, arrow-like marker, measurement arrow, diagram axis arrow, relation pointer, connector, ray-like line, or trajectory-like curve in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 015 asset used an SVG fallback as the final asset.
- No final Batch 015 provider prompt text contains the string `SkillPilot`.
- No final Batch 015 provider prompt text contains its canonical goal ID.
- No final Batch 015 provider prompt text contains `Mathematik`.
