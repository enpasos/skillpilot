# Goal Visualization Review - Physik Batch 018

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, eighteenth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-018.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-018`

Context:

- This batch covers Newtonian gravitation, gravitational potential, qualitative planetary motion, the three Kepler laws, the second Kepler law from angular momentum conservation, and the third Kepler law by scaling.
- The review applied the strict arrow rule: every visible force arrow, measurement arrow, graph axis arrow, formula-flow arrow, relation pointer, connector, and orbit-like line was checked for coherent source and target. If an arrow-like mark could be read as a physical or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated a candidate without provider retry.
- Three first candidates were rejected during fachlicher review and regenerated with stricter prompt constraints.
- Two regenerated candidates needed a second regeneration because a potential formula lost its minus sign and a Kepler equal-area diagram still showed visibly unequal areas.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `eb0ffdea-c12d-56df-b7e8-c0297d2f8aff` | Gravitationsgesetz und Gewichtskraft anwenden | `accepted_pilot_after_regeneration` | The first candidate was rejected because the `r` marker was not clearly center-to-center. The accepted regenerated image marks center dots for `M` and `m`, uses `r` as the center-to-center distance, and has the single physical force arrow `F_G` starting at `m` and pointing toward the center of `M`. The formulas `F_G=G*M*m/r^2`, `g=F_G/m=G*M/r^2`, and `F_G=m*g` are correct, as is the example `m=2 kg`, `g=9,8 N/kg`, `F_G=19,6 N`. |
| `a42f91a4-0d21-5aa9-ae11-f48be6f2e431` | Gravitationskraft und Gravitationspotential | `accepted_pilot_after_second_regeneration` | The first candidate was rejected because the potential graph contained an extra red arrow with no clear physical meaning. The first regeneration was rejected because the potential formula lost the required minus sign. The accepted image shows one inward gravitational force arrow from `m` toward `M`, `U(r)=-G*M*m/r`, `F_r=-dU/dr=-G*M*m/r^2`, and a potential curve below `0` that approaches `0` from below as `r` increases. |
| `60211ac1-cbe1-5182-87ef-673a068c5b0a` | Planetenbewegungen deuten | `accepted_pilot` | The accepted image shows a planet on an orbit, a single green force arrow starting at the planet and pointing to `M`, labelled `F_G=F_z`, and a red velocity arrow starting at the planet tangent to the orbit. The orbit curve itself has no arrowhead. The formulas `F_z=m*v^2/r` and `F_G=G*M*m/r^2` support the statement that gravitation supplies the centripetal force. |
| `497f1311-17d6-56ff-afb1-422a738e5c16` | Kepler-Gesetze anwenden | `accepted_pilot_after_second_regeneration` | The first candidate was rejected because it added curved orbit-direction arrows in the equal-area panel. The first regeneration was rejected because the two marked areas were visibly unequal while labelled `A_1=A_2`. The accepted image shows the first law with the sun at one focus of an ellipse, the second law as a correct circular special case with two visibly equal sectors for equal time intervals, and the third-law table with `a=1, T=1` and `a=4, T=8`, each yielding `T^2/a^3=1`. |
| `16caf92e-2800-57d1-946c-5b92ce848a96` | 2. Kepler-Gesetz aus Drehimpulserhaltung herleiten (LK) | `accepted_pilot` | The accepted image shows two swept areas for equal time intervals and central-force arrows `F_G` that start at the planet positions and point toward `M`. The orbit line has no direction arrow. The derivation chain `F_G || r`, `tau=r x F_G=0`, `L=m*(r x v)=konstant`, and `dA/dt=|L|/(2m)=konstant` is coherent for a central force. |
| `89cadf81-143b-5f6b-82bd-29ba20d92a1b` | 3. Kepler-Gesetz per Skalierungsargument herleiten (LK) | `accepted_pilot` | The accepted image compares the scaling `F_G ~ 1/a^2` and `a_z ~ a/T^2`, cancels the mass, and concludes `T^2 ~ a^3` and `T^2/a^3 = konstant`. The check table is consistent: `a=1 -> T=1` and `a=4 -> T=8`, so both rows give `T^2/a^3=1`. Orbit outlines are shown without direction arrows. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 018 goals were deferred as provider limitations.
- `3` generated Batch 018 first candidates were rejected for fachliche or arrow-rule reasons.
- `2` generated Batch 018 regenerated candidates were rejected for remaining formula or area-visualization errors.
- `0` temporary provider failures occurred in Batch 018.
- Every visible physical arrow, field/force arrow, measurement arrow, graph axis arrow, relation pointer, connector, formula-flow arrow, orbit-like line, or trajectory-like curve in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 018 asset used an SVG fallback as the final asset.
- No final Batch 018 provider prompt text contains the string `SkillPilot`.
- No final Batch 018 provider prompt text contains its canonical goal ID.
- No final Batch 018 provider prompt text contains `Mathematik`.
