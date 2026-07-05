# Goal Visualization Review - Physik Batch 037

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, thirty-seventh Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-037.txt`

Prompt append dirs:

- `tmp/goal-visualization-prompt-appends/physik-batch-037`
- `tmp/goal-visualization-prompt-appends/physik-batch-037-regeneration-1`

Context:

- This batch covers the photoelectric effect and Einstein interpretation, linearization for determining Planck's constant, de Broglie waves, the Compton effect, Bohr quantization, and hydrogen energy levels.
- The review applied the strict arrow rule: every visible photon path, electron path, scattering arrow, transition arrow, graph-axis arrow, label pointer, wavelength marker, and curve marker was checked for source-target consistency.
- Directional arrows were accepted only when their represented source, direction, and target were unambiguous. The initial photoelectric-effect candidate was regenerated because the visible photon direction was physically wrong.
- Final accepted assets are visual-first Nano Banana Pro images. No SVG fallback was used.

Generator/prompt policy:

- Final live provider request text does not contain the string `SkillPilot`.
- Final live provider request text does not contain canonical goal IDs.
- Final live provider request text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated candidates without temporary provider failure.
- One initial generated candidate was rejected before final import because photon arrows pointed away from the metal surface in a photoelectric-effect setup.
- No Batch 037 goal was deferred as a provider limitation.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f` | initial Batch 037 candidate | `rejected_regenerated` | Rejected because the photon arrows in both panels pointed away from the metal surface instead of toward it. That reversed the represented light direction and made the photoelectric-effect setup physically misleading. |
| `cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f` | Fotoeffekt und Einstein-Deutung | `accepted_pilot_after_regeneration` | The accepted image shows violet high-frequency photons travelling toward the metal and emitted electrons moving from the metal toward the collector. The low-frequency red panel shows photons reaching the metal without electron emission. The formula `E_kin = h f - W_A` and threshold cue `f > f_G` are correct. |
| `28f6a324-5f5e-5771-91d2-c007f6c275aa` | Methode: Naturkonstanten bestimmen (Linearisierung) | `accepted_pilot` | The accepted image shows an increasing `E_kin` versus `f` graph with measured points on a straight line. The line crosses the vertical axis below zero at `-W_A`, crosses the horizontal axis at positive `f_G`, and labels the slope as `Steigung h`. |
| `dfa53498-34f5-5326-9d94-87e7b528caf3` | De-Broglie-Wellen | `accepted_pilot` | The accepted image shows small momentum with a visibly longer wavelength and larger momentum with a visibly shorter wavelength. The displayed relation `lambda = h / p` is correct, and the diffraction-pattern inset supports the qualitative wave nature of particles. |
| `2aa2ef4b-8204-59b9-ad53-71c994cd6180` | Compton-Effekt | `accepted_pilot` | The accepted image shows one incoming photon arrow toward the electron, one scattered photon arrow away from the electron, and one recoil-electron arrow away from the interaction. The scattered photon is labelled `lambda' > lambda` and is drawn with a longer wavelength than the incoming photon. |
| `ce89fa04-bbd8-53b2-be01-812e3b3044ed` | Bohr'sche Postulate und Quantisierung | `accepted_pilot` | The accepted image shows three allowed circular orbits labelled `n = 1`, `n = 2`, and `n = 3`, with electron dots only on permitted orbits. The transition arrow runs from the outer `n = 3` orbit to the `n = 2` orbit and is paired with an emitted photon wave. |
| `d7244ce4-5409-58d1-a1b4-bfae35f391e1` | Energieniveaus des Wasserstoffatoms | `accepted_pilot` | The accepted image places `n = 1` at `-13,6 eV`, `n = 2` at `-3,4 eV`, `n = 3` at `-1,5 eV`, and `n = infinity` at `0 eV`. The emission arrow points downward from `n = 3` to `n = 2`, the absorption arrow points upward from `n = 2` to `n = 3`, and the formula `E_n = -13,6 eV / n^2` is correct. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 037 goals were deferred as provider limitations.
- `1` generated Batch 037 candidate was rejected before final accepted replacement.
- `0` temporary provider failures occurred in Batch 037.
- Every visible physical arrow, photon path, electron path, transition arrow, graph-axis arrow, bracket, formula marker, wavelength marker, and curve marker in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 037 asset used an SVG fallback as the final asset.
- No final live Batch 037 provider request text contains the string `SkillPilot`.
- No final live Batch 037 provider request text contains its canonical goal ID.
- No final live Batch 037 provider request text contains `Mathematik`.
