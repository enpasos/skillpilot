# Goal Visualization Review - Physik Batch 014

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, fourteenth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-014.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-014`

Context:

- This batch covers elastic collisions, elastic-collision analysis in the center-of-mass frame, impulse, crumple-zone accident physics, inelastic collisions, and a course-advanced derivation view for conservation of mechanical energy.
- The review applied the strict arrow rule: every visible physical arrow, measurement arrow, diagram axis arrow, relation pointer, connector, and trajectory-like line was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All six live Nano Banana Pro requests generated a candidate without provider retry.
- No generated Batch 014 candidate was rejected for fachliche reasons.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `d168ae5d-f36f-4ad4-b070-d5931f8d70d1` | Elastische Stöße | `accepted_pilot` | The accepted image shows a one-dimensional equal-mass elastic collision. Before the collision, cart A has `m=1 kg`, `v_A=2 m/s`, and a rightward momentum arrow `p_A=2 kg m/s`; cart B is at rest. After the collision, cart A is at rest and cart B has `v_B'=2 m/s` with a rightward momentum arrow `p_B'=2 kg m/s`. The summary correctly keeps `p_ges` and `E_kin` unchanged. |
| `d30fd37b-1f05-44e3-a40a-4c5a88fa28c2` | Elastische Stöße im Schwerpunktsystem analysieren | `accepted_pilot` | The accepted image uses signed velocity tables instead of physical arrows. In `S*`, `v_A*` changes from `+1 m/s` to `-1 m/s` and `v_B*` from `-1 m/s` to `+1 m/s`, so the relative velocity reverses sign. The lab transformation adds `v_S=+2 m/s`, giving `v_A: 3 -> 1 m/s` and `v_B: 1 -> 3 m/s`. |
| `e790de73-f8e5-4027-bc05-9f12a0e8c9cb` | Kraftstoß | `accepted_pilot` | The accepted image shows a force-time rectangle from `0` to `0,2 s` with height `50 N`, so the shaded area is `J=10 N s`. The calculation `J=F*Δt=50 N*0,2 s=10 N s` is correct and is linked to `Δp`; the momentum line `4 kg m/s -> 14 kg m/s` has `Δp=10 kg m/s`. |
| `1232febe-868a-4dac-b4c2-e35789434601` | Unfallphysik: Kraftstoß und Knautschzone | `accepted_pilot` | The accepted image compares two force-time diagrams with equal impulse area `J=5000 N s`. The short stop uses `Δt=0,05 s` and `F=100000 N`; the crumple-zone case uses `Δt=0,20 s` and `F=25000 N`. The conclusion correctly states that the same momentum change over a longer time gives a smaller average force. |
| `0da13365-02c2-44f1-8a81-d524ca0ac3ae` | Inelastische Stöße | `accepted_pilot` | The accepted image shows a perfectly inelastic cart collision. Before, `m_A=1 kg`, `v_A=4 m/s`, `m_B=1 kg`, and `v_B=0`; after, the carts are stuck together with `v'=2 m/s` and `p_ges'=4 kg m/s`. Momentum stays `4 kg m/s`, while kinetic energy changes from `8 J` to `4 J`, with `4 J` going into internal energy/deformation. |
| `e359f8bb-6106-44aa-9edf-694528d2d2a9` | Erhaltung der mechanischen Energie tiefer verstehen (LK) | `accepted_pilot` | The accepted image is a formula ladder without object-scene force arrows. It starts from `m*a=F_cons`, multiplies by `v`, identifies `d/dt(1/2*m*v^2)`, uses the required sign `F_cons=-grad E_pot`, and reaches `d/dt(E_kin+E_pot)=0` and `E_mech=E_kin+E_pot=konstant`. The assumptions box correctly lists constant mass, inertial system, and conservative forces only. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 014 goals were deferred as provider limitations.
- `0` generated Batch 014 candidates were rejected for fachliche reasons.
- `0` temporary provider failures occurred in Batch 014.
- Every visible physical arrow, arrow-like marker, measurement arrow, diagram axis arrow, relation pointer, connector, ray-like line, or trajectory-like curve in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 014 asset used an SVG fallback as the final asset.
- No final Batch 014 provider prompt text contains the string `SkillPilot`.
- No final Batch 014 provider prompt text contains its canonical goal ID.
- No final Batch 014 provider prompt text contains `Mathematik`.
