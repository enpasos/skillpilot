# Goal Visualization Review - Physik Batch 036

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, thirty-sixth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-036.txt`

Prompt append dirs:

- `tmp/goal-visualization-prompt-appends/physik-batch-036`
- `tmp/goal-visualization-prompt-appends/physik-batch-036-regeneration-1`

Context:

- This batch covers total internal reflection and optical fibers, double-slit interference, grating spectra, standing electromagnetic waves, solar cells and light sensors, and photon energy and momentum.
- The review applied the strict arrow rule: every visible ray, propagation arrow, model arrow, graph-axis arrow, label pointer, bracket, wavefront, curve marker, and color-order cue was checked for source-target consistency.
- Directional arrows were accepted only when their represented source, direction, and target were unambiguous. Two initial candidates were regenerated because the visible representation was physically misleading or internally contradictory.
- Final accepted assets are visual-first Nano Banana Pro images. No SVG fallback was used.

Generator/prompt policy:

- Final live provider request text does not contain the string `SkillPilot`.
- Final live provider request text does not contain canonical goal IDs.
- Final live provider request text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated candidates without temporary provider failure.
- One initial spectrum candidate was rejected because the color separation did not represent wavelength-dependent angular distance from the central order.
- One initial solar-cell/light-sensor candidate was rejected because a switch/circuit state contradicted the shown active output.
- No Batch 036 goal was deferred as a provider limitation.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `58fc7852-722c-5a67-be6a-bfd1be0b527e` | Totalreflexion und Glasfasern | `accepted_pilot` | The accepted image shows a ray inside glass hitting a boundary above the critical condition and staying inside the optical fiber. There is no refracted ray escaping into air, and all path cues remain consistent with guided light in the fiber core. |
| `6270e558-d657-5363-a6b2-e49a032a453b` | Interferenz am Doppelspalt | `accepted_pilot` | The accepted image shows source, double slit, and screen in a clear setup. The screen labels `m = 0`, `m = +1`, and `m = -1` are symmetric around the central maximum, and the relation `y_m approx m lambda L / d` matches the shown far-field geometry. |
| `91683676-01cf-5003-80fa-a04d043b4e61` | initial Batch 036 candidate | `rejected_regenerated` | Rejected because the spectrum was represented mainly as horizontal rainbow bars. That did not reliably encode that, in the first orders, violet is closer to the central order and red is farther away on both sides. |
| `91683676-01cf-5003-80fa-a04d043b4e61` | Spektren mit Beugungsgitter deuten | `accepted_pilot_after_regeneration` | The accepted image shows `m = 0` as a central white order and mirrored `m = -1` and `m = +1` spectra on the screen. In both first-order spectra, violet is closer to the center and red is farthest away. The displayed relation `d sin(theta) = m lambda` is correct. |
| `4c919da9-157a-5a14-a725-f7343975c9ab` | Stehende elektromagnetische Wellen | `accepted_pilot` | The accepted image shows a resonator-style standing electromagnetic wave with nodes at the ends and no propagation arrow that would imply transport to the right. The field pattern is presented as a standing mode, not as a traveling wave. |
| `f75c494c-5723-5cd8-8ec9-dc3d8ec7eca6` | initial Batch 036 candidate | `rejected_regenerated` | Rejected because the light-sensor panel showed an open switch while the LED/output was active. That circuit-state contradiction would make the visualization misleading despite the attractive style. |
| `f75c494c-5723-5cd8-8ec9-dc3d8ec7eca6` | Wie funktionieren Solarzellen und Lichtsensoren? | `accepted_pilot_after_regeneration` | The accepted image presents a solar cell illuminated by photons and a light-sensor application without false current-direction arrows or an open-switch contradiction. The microscopic inset uses photon, electron, and hole cues only as qualitative orientation. |
| `d2860d7f-32ff-5d74-b2f8-b7bfc8d75aec` | Energie und Impuls von Photonen | `accepted_pilot` | The accepted image orders red, green, and violet photon examples consistently: red has the longest wavelength and lower energy, violet has the shortest wavelength and higher energy. The displayed relations `E = h f`, `p = h / lambda`, and `c = lambda f` are correct. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 036 goals were deferred as provider limitations.
- `2` generated Batch 036 candidates were rejected before final accepted replacements.
- `0` temporary provider failures occurred in Batch 036.
- Every visible physical arrow, ray, graph-axis arrow, bracket, field cue, formula marker, curve marker, and color-order cue in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 036 asset used an SVG fallback as the final asset.
- No final live Batch 036 provider request text contains the string `SkillPilot`.
- No final live Batch 036 provider request text contains its canonical goal ID.
- No final live Batch 036 provider request text contains `Mathematik`.
