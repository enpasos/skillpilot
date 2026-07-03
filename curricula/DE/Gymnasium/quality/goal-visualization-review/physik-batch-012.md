# Goal Visualization Review - Physik Batch 012

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, twelfth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-012.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-012`

Context:

- This batch covers Newton's third law, applying Newton's third law, inertial and non-inertial reference systems, applying `F=m*a`, mechanical energy, and kinetic energy.
- The review applied the strict arrow rule: every visible physical arrow, measurement arrow, diagram axis arrow, relation pointer, connector, and trajectory-like line was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- The first live batch request returned provider `504` timeouts for `ad984bb6-e225-432a-952d-d83cda40b7f8`, `a0aaedcb-41f8-4891-af77-a69a76b8c10d`, and `00245a43-eb89-47d2-92d7-21799dbec9f3`.
- Those three goals were retried through the same Nano Banana Pro pipeline and generated successfully before review.
- The timeouts did not produce imported assets and are not treated as fachlich rejected candidates.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `ad984bb6-e225-432a-952d-d83cda40b7f8` | Newtons 3. Axiom (Wechselwirkungsprinzip) | `accepted_pilot_after_provider_retry` | The accepted image shows two skaters pushing on each other with two equal and opposite red force arrows. The left arrow is labelled as the force of B on A and acts on skater A; the right arrow is labelled as the force of A on B and acts on skater B. The statement correctly says that the force pair acts on two different bodies. |
| `a0aaedcb-41f8-4891-af77-a69a76b8c10d` | Newtons 3. Axiom anwenden | `accepted_pilot_after_provider_retry` | The accepted image shows the foot-ground interaction as an equal and opposite contact-force pair. One arrow acts on the foot and is labelled `F Boden auf Fuss`; the other acts on the ground/contact partner and is labelled `F Fuss auf Boden`. The sorting note correctly warns that action and reaction do not both act on the foot and should not be confused with force balance. |
| `00245a43-eb89-47d2-92d7-21799dbec9f3` | Inertialsysteme und Bezugssysteme | `accepted_pilot_after_provider_retry` | The accepted image correctly contrasts an inertial system with constant velocity and no pseudo-force against a non-inertial, rightward-accelerating train. The backward arrow inside the accelerating train is explicitly labelled as an apparent force, so it is not presented as a real force in an inertial frame. |
| `5f289cdc-fda1-4058-b44f-041ba1398e79` | Grundgleichung der Mechanik anwenden | `accepted_pilot` | The accepted image shows one cart with `m=2 kg`, one rightward force arrow `F=6 N`, and one rightward acceleration arrow `a=3 m/s^2`. The calculation `a=F/m=6 N/2 kg=3 m/s^2` is correct, and the force and acceleration arrows point in the same direction. |
| `94784e0a-7ddc-48be-91fb-dc82b78eb322` | Mechanische Energie | `accepted_pilot` | The accepted image shows `E_mech = E_kin + E_pot` and three stacked energy bars with constant total `100 J`. The high position has `E_pot=100 J` and `E_kin=0 J`, the middle position has `50 J + 50 J`, and the low position has `E_pot=0 J` and `E_kin=100 J`. Vertical height markers point from ground to the relevant ramp height. |
| `7eeff2de-6015-49a6-a96e-a488d886dc9f` | Kinetische Energie | `accepted_pilot` | The accepted image uses `E_kin = 1/2*m*v^2` with fixed mass `m=2 kg` and correctly gives `E_kin=1 J`, `4 J`, and `9 J` for `v=1`, `2`, and `3 m/s`. The bar chart follows the quadratic dependence and the comparison arrow from `1` to `4` supports the statement that doubled speed gives fourfold kinetic energy. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 012 goals were deferred as provider limitations.
- `0` generated Batch 012 candidates were rejected for fachliche reasons.
- `3` temporary provider `504` failures were retried successfully before review.
- Every visible physical arrow, arrow-like marker, measurement arrow, diagram axis arrow, relation pointer, connector, ray-like line, or trajectory-like curve in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 012 asset used an SVG fallback as the final asset.
- No final Batch 012 provider prompt text contains the string `SkillPilot`.
- No final Batch 012 provider prompt text contains its canonical goal ID.
- No final Batch 012 provider prompt text contains `Mathematik`.
