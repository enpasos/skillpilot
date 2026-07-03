# Goal Visualization Review - Physik Batch 019

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, nineteenth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-019.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/physik-batch-019`

Context:

- This batch covers the historical sequence of astronomical worldviews, the comparison of geocentric and heliocentric models, and the transition from Kepler's kinematic description to Newton's dynamic explanation of planetary motion.
- The review applied the strict arrow rule: every visible force arrow, measurement arrow, graph/icon arrow, formula-flow arrow, relation pointer, connector, orbit-like line, and trajectory-like curve was checked for coherent source and target. If an arrow-like mark could be read as a physical, historical, or mathematical statement, it had to be correct.
- No SVG fallback was used; all accepted assets were generated through the Nano Banana Pro pipeline and imported through the existing visualization import script.

Generator/prompt policy:

- Final provider prompt text does not contain the string `SkillPilot`.
- Final provider prompt text does not contain canonical goal IDs.
- Final provider prompt text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated a candidate without provider retry.
- Five first candidates were rejected during fachlicher review and regenerated with stricter prompt constraints.
- Seven regenerated candidates were rejected for remaining arrow-rule, model-diagram, equal-area, or text errors.
- One history/reconstruction goal required a heavily reduced text-only layout before the candidate was acceptable.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `15b56a1e-3eec-52ca-82fa-b4df9ce88415` | Astronomische Weltbilder zeitlich einordnen (GK) | `accepted_pilot` | The accepted image orders `ca. 150 n. Chr.`, `1543`, `1609-1619`, and `1687` correctly and assigns Ptolemäus/geocentric, Kopernikus/heliocentric, Kepler/ellipses/laws, and Newton/gravitational explanation coherently. The timeline ribbon and orbit sketches contain no misleading direction arrow. |
| `25edd154-b1d8-546c-94a5-88502b6725cd` | Geozentrisches und heliozentrisches Weltbild vergleichen (GK) | `accepted_pilot_after_regeneration` | The first candidate was rejected because several epicycle loops were drawn as curved arrows. The accepted regenerated image keeps Earth at the center in the geocentric panel and Sun at the center in the heliocentric panel, uses pfeilfreie orbit and epicycle lines, and correctly identifies Earth as a planet in the heliocentric model. |
| `d873ffa2-04b3-5978-a955-89563802a348` | Newtons Beitrag zur Erklärung von Planetenbewegungen erläutern (GK) | `accepted_pilot_after_regeneration` | The first candidate was rejected because it contained extra movement, acceleration, and formula arrows beyond the intended gravitational force arrow. The accepted regenerated image has exactly one physical arrow: `F_G` starts at planet `m` and points toward central mass `M`. Kepler is shown as describing ellipses/equal areas/`T^2/a^3`, while Newton explains with `F_G=G*M*m/r^2` and `F=m*a`. |
| `481ffd56-d585-56fe-b525-ed423e30eed3` | Entwicklung astronomischer Weltbilder rekonstruieren (LK) | `accepted_pilot_after_fifth_regeneration` | The first candidate was rejected because the Newton panel used a physical arrow from the Sun toward Earth. Later candidates were rejected for a double-headed `r` marker, a wrong geocentric mini-diagram, a decorative chart arrow, and a visible text error in `dynamische`. The accepted final image is intentionally text-only: Ptolemäus `ca. 150 n. Chr.` geozentrisch/Erde im Zentrum, Kopernikus `1543` heliozentrisch/Sonne im Zentrum, Kepler `1609-1619` Ellipsen statt Kreise, Newton `1687` Gravitation with `F=G*m1*m2/r^2`, and the lower model labels `geometrische Ordnung`, `neuer Mittelpunkt`, `kinematische Gesetze`, `dynamische Ursache`. |
| `1b833656-cd16-5b21-973a-9810960dcfd2` | Keplers Beschreibung und Newtons Erklärung unterscheiden (LK) | `accepted_pilot_after_third_regeneration` | The first candidate was rejected because the Newton force arrow ended beside, not on, the central mass. A regenerated candidate was rejected because the Kepler Flächensatz diagram added time/movement arrows; another was rejected for a visible bottom-line text error. The accepted image uses a pfeilfreie Kepler column with ellipse, Flächensatz, and `T^2/a^3=konstant`, and exactly one Newton force arrow from `m` toward `M`, labelled `F_G`. |
| `c968d263-8be4-5cf9-b320-e95398fe648f` | Übergang von geometrischen zu dynamischen Modellen darstellen (LK) | `accepted_pilot_after_second_regeneration` | The first candidate was rejected because it added an orbit-direction arrow and an unreliable equal-area statement. The first regeneration was rejected because `A_1` and `A_2` were visibly unequal while labelled as equal. The accepted image uses numbered panels without connector arrows, shows geometric path construction, a kinematic ellipse with text-only Kepler laws, and a dynamic panel with exactly one force arrow from `m` toward `M` plus `F_G=G*M*m/r^2` and `F=m*a`. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 019 goals were deferred as provider limitations.
- `5` generated Batch 019 first candidates were rejected for fachliche or arrow-rule reasons.
- `7` generated Batch 019 regenerated candidates were rejected for remaining arrow, model, equal-area, or text errors.
- `0` temporary provider failures occurred in Batch 019.
- Every visible physical arrow, measurement arrow, graph/icon arrow, relation pointer, connector, formula-flow arrow, orbit-like line, or trajectory-like curve in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 019 asset used an SVG fallback as the final asset.
- No final Batch 019 provider prompt text contains the string `SkillPilot`.
- No final Batch 019 provider prompt text contains its canonical goal ID.
- No final Batch 019 provider prompt text contains `Mathematik`.
