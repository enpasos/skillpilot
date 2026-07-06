# Goal Visualization Review - Physik Batch 070

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Physik`, seventieth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-070.txt`

Prompt append dir:

- `tmp/goal-visualization-prompt-appends/physik-batch-070`

Context:

- This batch covers six further atomic goals from astronomy and astrophysics: determining the astronomical unit from observation data, classifying Solar-System bodies, estimating solar quantities from observations, judging solar activity and space weather, evaluating stellar spectra and temperature laws, and estimating radiation equilibrium and life conditions.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider request text did not include subject/scope labels, canonical technical identifiers, or product names. The canonical landscape was used for final import.
- The classification goal needed two regenerations because the visible comet tail initially pointed toward the Sun direction. The accepted candidate used a temporary reference image that fixed the geometry: Sun on the left, comet nucleus to its right, tail extending away from the Sun.
- The solar-observation goal was regenerated once because an arrow connected `Winkeldurchmesser` to `Sonnenflecken-Wanderung`; the accepted image separates the three measurement-to-quantity pairs.
- The stellar-spectra goal was regenerated once because the Stefan-Boltzmann comparison arrow pointed from `hoehere T` toward `tiefere T`; the accepted image uses side-by-side power bars instead.
- The radiation-equilibrium goal was regenerated once because an extra red arrow ran from the balance card toward Earth; the accepted image only keeps the physical radiation arrows and bottom workflow arrows.
- Final accepted assets are visual-first Nano Banana Pro images. No SVG fallback was used as a final asset. A temporary local reference image was used only as a provider input for the final classification regeneration.

Generator/prompt policy:

- Final live provider request text does not contain the string `SkillPilot`.
- Final live provider request text does not contain canonical goal IDs.
- Final live provider request text does not contain `Mathematik`.
- Final live provider request text does not contain `Physik`.
- Final live provider request text does not contain `DE_DEU`.
- Final live provider request text does not contain `Gymnasium`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- Batch 070 generation succeeded without provider quota failures.
- Five generated candidates were rejected and not linked: two classification candidates with wrong comet-tail orientation, one solar-observation candidate with a wrong measurement arrow, one stellar-spectra candidate with a misleading Stefan-Boltzmann comparison arrow, and one radiation-equilibrium candidate with an extra incorrect radiation arrow.
- No Batch 070 goal was deferred.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `5cf160e5-e0c2-5552-b2cf-0f04871c5e7e` | Astronomische Einheit aus Beobachtungsdaten bestimmen | `accepted_pilot` | The accepted image uses parallax-style observation lines without arrowheads, a `Parallaxe p` measurement card, and a top-down Sun-Earth-planet model. The model marks `Sonne-Erde = 1 AE` without inventing a numerical value. The visible sight lines are observation geometry, not physical light arrows. |
| `982df2f3-e040-5f4b-b668-0fe05d994b29` | Himmelskoerper des Sonnensystems physikalisch klassifizieren | `accepted_pilot_after_second_regeneration` | The first two candidates were rejected because the comet tail pointed toward the visible Sun direction. The accepted reference-guided candidate keeps the classification cards consistent: planet, dwarf planet, moon, asteroid, and comet criteria are separated; the comet card places the Sun on the left and the comet tail extends to the right, away from the Sun. |
| `94a3a80e-f1de-51a2-b834-1e3431c5d3ca` | Sonnenbeobachtungen zur Bestimmung von Zustandsgrößen auswerten | `accepted_pilot_after_regeneration` | The first candidate was rejected because a visible arrow ran from `Winkeldurchmesser` toward `Sonnenflecken-Wanderung`. The accepted regeneration has three independent columns: `Winkeldurchmesser` to `Radius`, `Sonnenflecken-Wanderung` to `Rotation`, and `Spektrum` to `Temperatur`. The telescope/camera is shown with a `Sonnenfilter`, and no unfiltered direct observation is implied. |
| `4e823349-b60c-5d2a-b96f-d3f23ae50e3a` | Sonnenaktivitaet und Weltraumwetter fachlich beurteilen | `accepted_pilot` | The accepted image shows magnetic field loops and sunspots on the Sun, an outbreak/disturbance travelling from the Sun toward Earth, and a magnetosphere on the incoming-disturbance side. Effect icons for `Polarlicht`, `Satellit`, and `Stromnetz` are presented as context, not guaranteed disasters. The activity curve is a qualitative `Fleckenzahl`/`Aktivitaetszyklus` sketch. |
| `a7bec355-48c5-5107-bfab-d6956f9c9205` | Sternspektren und Temperaturgesetze auswerten | `accepted_pilot_after_regeneration` | The first candidate was rejected because a Stefan-Boltzmann comparison arrow pointed from the hotter star toward the cooler star. The accepted regeneration shows Fraunhofer lines as dark absorption lines, Wien behaviour with the hotter peak at shorter/blue wavelength and the cooler peak at longer/red wavelength, and Stefan-Boltzmann behaviour as larger emitted-power bars for higher temperature. |
| `a5031dfc-6d25-5a04-850a-5c7d8a254c21` | Strahlungsgleichgewichte und Lebensbedingungen abschaetzen | `accepted_pilot_after_regeneration` | The first candidate was rejected because an extra red arrow ran from the balance card toward Earth. The accepted image shows exactly the physical radiation directions needed for the concept: incoming shortwave radiation from star to planet and outgoing heat radiation from planet to space. The balance card is not connected by a radiation arrow, and the bottom workflow arrows run only from assumptions to temperature estimate and life-conditions context. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Physik learning-goal visualizations were deferred.
- `5` generated candidates were rejected and not linked.
- `0` provider quota failures occurred during Batch 070.
- Every visible sight line, comet-tail direction, observation arrow, disturbance arrow, magnetosphere cue, wavelength/temperature relation, power comparison, radiation arrow, and workflow arrow in the reviewed images was checked for representational consistency.
- No Batch 070 asset used an SVG fallback as the final asset.
- No final live Batch 070 provider request text contains the string `SkillPilot`.
- No final live Batch 070 provider request text contains its canonical goal ID.
- No final live Batch 070 provider request text contains `Mathematik`.
- No final live Batch 070 provider request text contains `Physik`.
- No final live Batch 070 provider request text contains `DE_DEU`.
- No final live Batch 070 provider request text contains `Gymnasium`.
