# Goal Visualization Review - Physik Batch 068

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Physik`, sixty-eighth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed_with_one_deferred_provider_limitation`

Batch file: `tmp/goal-visualization-physik-batch-068.txt`

Prompt append dir:

- `tmp/goal-visualization-prompt-appends/physik-batch-068`

Context:

- This batch covers six further atomic goals: electron diffraction as a matter-wave experiment, quantum interferometers, potential curves and bonding, Pauli principle and multi-electron energy levels, Geiger-Mueller counters, and nuclide charts with decay chains.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider request text did not include subject/scope labels, canonical technical identifiers, or product names. The canonical landscape was used for final import.
- The nuclide-chart goal was not linked. Four Nano Banana Pro candidates were rejected because the decay arrows were not consistently trustworthy: the first dense chart had ambiguous and non-grid-exact alpha/beta-minus arrows; the simplified real-chain regeneration still displaced alpha and beta-minus steps by the wrong number of grid cells; a reference-image attempt preserved arrow geometry but corrupted small tile text; the final blank-tile reference-image attempt again changed the required alpha and beta-minus vector lengths. Because a wrong decay-arrow source/target would be actively misleading, no asset or canonical link was created for this goal.
- Final accepted assets are visual-first Nano Banana Pro images. No SVG fallback was used as a final asset. A temporary local reference image was used only for rejected Nano Banana Pro nuclide-chart attempts.

Generator/prompt policy:

- Final live provider request text does not contain the string `SkillPilot`.
- Final live provider request text does not contain canonical goal IDs.
- Final live provider request text does not contain `Mathematik`.
- Final live provider request text does not contain `Physik`.
- Final live provider request text does not contain `DE_DEU`.
- Final live provider request text does not contain `Gymnasium`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- Batch 068 generation succeeded without provider quota failures.
- Four generated nuclide-chart candidates were rejected for arrow/source/target accuracy or small-label corruption; no active visualization link was created for that goal.
- No other Batch 068 goal needed regeneration before final import.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `e296aba6-f407-5944-a2bd-e5296e4c9f06` | Elektronenbeugung als Materiewellenexperiment auswerten | `accepted_pilot` | The accepted image shows an electron source, acceleration voltage, graphite foil, and screen in left-to-right order. The only explicit beam arrow runs from the source side toward the foil, and the diffracted beam continues to centered concentric rings on the screen. The comparison inset correctly shows larger `U` leading to smaller `lambda` and smaller rings, and the formula `lambda = h / p` is correct. |
| `52b6722a-b3b2-5d2d-a507-0215532b0422` | Quanteninterferometer mit Phasen und Weginformation deuten | `accepted_pilot` | The accepted image shows a Mach-Zehnder-style interferometer with source, first beam splitter, two mirror arms, phase element, second beam splitter, and detectors `D1`/`D2`. Optical path lines are connected consistently, with only one small source-to-splitter direction cue. The phasor inset starts `A1`, `A2`, and `A_ges` from the same origin, and the two outcome cards distinguish interference without path information from loss of interference with path information. |
| `43adaa0b-1f37-5d55-a496-6900555274a1` | Potentialverlaeufe und Atombindung quantenmechanisch plausibilisieren | `accepted_pilot` | The accepted image shows `E` versus `r`, with a potential curve that is high at small distance, has one minimum below `E = 0` at `r0`, and approaches `E = 0` from below at large distance. Bound levels `E1` and `E2` are below zero and near the minimum. The molecule sketch shows increased density between two nuclei, matching the bonding interpretation. |
| `badb0ef3-233d-560e-bc2a-9df99f09fe7d` | Mehrelektronenatome mit Pauli-Prinzip und Energieniveaus deuten | `accepted_pilot` | The accepted image orders `1s`, `2s`, and `2p` from lower to higher energy. `1s` and `2s` boxes contain paired opposite spin arrows, and the three `2p` boxes contain no more than two electrons per box, with opposite spins where paired. The notes `max. 2 pro Orbital` and `kein gleicher Zustand doppelt` match the Pauli-principle intent. |
| `b1ad9493-acca-5366-9ecd-4b7bf7edaf4a` | Geiger-Mueller-Zaehler funktional erklaeren | `accepted_pilot` | The accepted image treats the Geiger-Mueller tube as a detector, not as a source: the radiation arrow enters the tube from the sample side, and the output is an electrical count pulse to the display. The central wire is labelled `Anode +`, the outer tube is labelled `Kathode -`, and the internal gas, ionisation, gas discharge, and pulse sequence are consistent. |
| `64b30d2e-cbe1-55d8-915a-a050d736b96e` | Nuklidkarten und Zerfallsreihen auswerten | `deferred_provider_limitation` | No image was accepted. The first candidate used a dense chart with ambiguous curved decay arrows whose source and target cells did not reliably encode `alpha` as two cells down-left and `beta-` as one cell down-right. A simplified real-chain regeneration still placed the arrows at wrong grid displacements. A reference-image attempt preserved geometry but changed the small tile label `Start` to `Stort`; the final blank-tile reference-image attempt again changed the vector lengths. Because every visible decay arrow must have a correct source and target, no asset or canonical link was created. |

## Batch Checks

- `5` Physik learning-goal assets were imported and accepted.
- `1` Physik learning-goal visualization was deferred as `deferred_provider_limitation`.
- `4` generated nuclide-chart candidates were rejected and not linked.
- `0` provider quota failures occurred during Batch 068.
- Every visible electron-beam arrow, diffraction pattern, comparison arrow, optical path, phasor arrow, potential curve, energy level, spin arrow, radiation arrow, detector signal arrow, chart axis, and decay arrow in the reviewed images was checked for representational consistency. The nuclide-chart candidates failed this check and were not accepted.
- No Batch 068 asset used an SVG fallback as the final asset.
- No final live Batch 068 provider request text contains the string `SkillPilot`.
- No final live Batch 068 provider request text contains its canonical goal ID.
- No final live Batch 068 provider request text contains `Mathematik`.
- No final live Batch 068 provider request text contains `Physik`.
- No final live Batch 068 provider request text contains `DE_DEU`.
- No final live Batch 068 provider request text contains `Gymnasium`.
