# Goal Visualization Review - Mathematik Batch 007

Review date: 2026-06-28

Scope: canonical `DE Gymnasium Mathematik`, atomic goals.

Generator:

- Provider: Google Gemini / Nano Banana Pro
- Model: `gemini-3-pro-image`
- MIME type: `image/jpeg`
- Aspect ratio: `16:9`
- Review status in JSON links: `pilot`

Prompt policy:

- Provider prompts use only title and learning-goal description plus batch-level mathematical constraints.
- Concrete SkillPilot IDs are not sent to the image model.
- Provider-facing constraints use neutral wording such as `technical IDs`.
- IDs remain only in filenames, directories, JSON links, and prompt metadata.
- No SVG or hand-drawn replacement assets are used in this lane.

## Reviewed Assets

| Goal ID | Title | Decision | Notes |
| --- | --- | --- | --- |
| `37bf2eb6-75a0-44c1-a988-ca0e203cb072` | Geschwindigkeit als abgeleitete Größe verwenden | `accepted_pilot` | Shows speed as `v = s / t`, includes matching units, a correct conversion example `72 km/h = 20 m/s`, and a correct word-problem calculation `120 km / 2 h = 60 km/h`. Suitable for pilot use. |
| `2345ae25-5805-4c72-b830-32e63cc6262a` | Dichte als abgeleitete Größe verwenden | `accepted_pilot` | Shows density as `rho = m / V`, uses plausible density units such as `kg/m^3` and `g/cm^3`, and calculates `1930 g / 100 cm^3 = 19.3 g/cm^3` correctly. Suitable for pilot use. |
| `ca623958-c204-5d1b-bdd0-3f76765674cb` | Mit Größen rechnen und Ergebnisse deuten | `accepted_pilot` | Combines speed, density, proportionality, and load estimation. The displayed calculations and contextual interpretations are consistent: `120 km / 2 h = 60 km/h`, `270 g / 100 cm^3 = 2.7 g/cm^3`, `6` apples cost `3.60 EUR`, and `4.3 t < 5 t`. |
| `ca9093cd-9ccf-5fb4-9dd8-bf4f92af4e70` | Einfache proportionale Sachaufgaben mit Dreisatz und Maßstab lösen | `accepted_pilot` | Dreisatz table is internally consistent (`4 -> 2`, `1 -> 0.50`, `12 -> 6`). Scale calculations are correct: `10 cm` at `1:1000` gives `100 m`, and `5 cm` at `1:500` gives `25 m`. |
| `03a87896-088d-4b21-a37b-d0604d784540` | Größen in Sachsituationen mithilfe von Bezugsgrößen schätzen | `accepted_pilot` | Uses realistic reference quantities for estimation: walking speed, water as `1 L = 1 kg`, wood and lead mass comparisons, and recipe portions. The proportional recipe estimates and plausibility statements are consistent. |

## Checks

- No current Batch 007 provider request contains a concrete SkillPilot goal ID.
- No current Batch 007 provider request contains the string `SkillPilot`.
- Current reviewed assets do not visibly contain SkillPilot IDs.
- All five assets were accepted without SVG fallback or deferred provider limitation.

