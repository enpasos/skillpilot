# Goal Visualization Review - Physik Batch 043

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, forty-third Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-043.txt`

Prompt append dirs:

- `tmp/goal-visualization-prompt-appends/physik-batch-043`
- `tmp/goal-visualization-prompt-appends/physik-batch-043-regeneration-1`
- `tmp/goal-visualization-prompt-appends/physik-batch-043-regeneration-2`

Context:

- This batch covers GPS time corrections, Minkowski diagrams, silicon technology, conductor/insulator/semiconductor comparison, qualitative band models with doping, and p-n junction/diode behavior.
- The review applied the strict arrow/path rule: every visible satellite signal, process arrow, axis arrow, worldline, light-cone line, simultaneity line, charge marker, band position, polarity marker, circuit connection, lamp state, and diode curve was checked for source-target or representational consistency.
- For accepted semiconductor visualizations, no accepted material-current or carrier-motion arrow is used. The accepted diode image uses polarity labels and graph-axis arrows only.
- Final accepted assets are visual-first Nano Banana Pro images. No SVG fallback was used.

Generator/prompt policy:

- Final live provider request text does not contain the string `SkillPilot`.
- Final live provider request text does not contain canonical goal IDs.
- Final live provider request text does not contain `Mathematik`.
- Final live provider request text does not contain `DE_DEU`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- One live Nano Banana Pro request for the p-n junction/diode goal temporarily failed with `503 service_unavailable`; the same goal was retried and later generated candidates successfully.
- Three initial candidates were rejected before final import; two of those goals required a second regeneration.
- No Batch 043 goal was deferred as a provider limitation.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `a9169a74-de19-54a9-a8ac-a2ce43c7342e` | initial Batch 043 candidate | `rejected_regenerated` | Rejected because the height correction was visually placed next to the Earth clock and could imply that the Earth clock becomes faster by altitude. Additional curved label arrows also weakened the strict arrow policy. |
| `a9169a74-de19-54a9-a8ac-a2ce43c7342e` | GPS und Relativitätstheorie | `accepted_pilot_after_regeneration` | The accepted image places the satellite-clock card in the satellite context with `Bewegung langsamer` and `Hoehe schneller`, keeps the Earth clock as comparison, and uses satellite-to-receiver signal arrows that terminate at the ground receiver. |
| `6ebb6182-f221-5f4c-b112-4ac72b104321` | Minkowski-Diagramme nutzen | `accepted_pilot` | The accepted image shows `ct` and `x` axes, a symmetric 45-degree light cone through the origin, a vertical resting-observer worldline, a tilted moving-observer worldline inside the light cone, and separate dashed simultaneity lines. No worldline has an arrowhead. |
| `70b358bf-da6d-53ba-8393-51d5c2365b04` | Vom Sand zum Smartphone: Die digitale Revolution | `accepted_pilot` | The accepted image shows the material/production sequence `Quarzsand -> Silizium -> Wafer -> Mikrochip` in the correct order. The three process arrows point only from each stage to the next stage. |
| `7badac4d-2874-5b3a-87e8-bf8f4440b2a6` | initial Batch 043 candidate | `rejected_regenerated` | Rejected because the conductor and semiconductor panels contained particle/current arrows despite the no-arrow requirement. Under the strict arrow policy, these ambiguous charge-motion arrows are not acceptable. |
| `7badac4d-2874-5b3a-87e8-bf8f4440b2a6` | first Batch 043 regeneration | `rejected_regenerated` | Rejected because the conductor panel showed a glowing lamp but no visible battery, so the test circuit was not physically complete. |
| `7badac4d-2874-5b3a-87e8-bf8f4440b2a6` | Leiter, Nichtleiter und Halbleiter | `accepted_pilot_after_second_regeneration` | The accepted image uses the same battery-material-lamp comparison in all three panels. Copper has many charge dots and a bright lamp, plastic/glass has few charge dots and an off lamp, and silicon is shown as a controllable semiconductor. No arrows are drawn. |
| `df010b2b-b182-5f7e-bbe4-49b72e48c27a` | Bändermodell und Dotierung | `accepted_pilot` | The accepted image shows overlapping bands for the conductor, a small gap for the semiconductor, the donor level near the conduction band for n-doping, and the acceptor level near the valence band for p-doping. The band positions match the qualitative model. |
| `7f0798cb-5966-5dcb-beb3-84f637ab6139` | initial Batch 043 candidate | `rejected_regenerated` | Rejected because the circuit panels contained duplicated diode elements and did not give a clean one-device interpretation of forward and reverse bias. |
| `7f0798cb-5966-5dcb-beb3-84f637ab6139` | first Batch 043 regeneration | `rejected_regenerated` | Rejected because the reverse-bias panel again placed the positive terminal on the p side, which contradicts the labelled `Sperrrichtung`. |
| `7f0798cb-5966-5dcb-beb3-84f637ab6139` | p-n-Übergang und Diode | `accepted_pilot_after_second_regeneration` | The accepted image shows the p side left and n side right, a depletion region with fixed negative ions on the p-side edge and fixed positive ions on the n-side edge, forward bias with `+` on p and `-` on n, reverse bias with `-` on p and `+` on n, and a qualitative diode curve rising for positive voltage. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 043 goals were deferred as provider limitations.
- `5` generated Batch 043 candidates were rejected before final accepted replacements.
- `1` temporary provider failure occurred in Batch 043; it was retried successfully before review and import.
- Every visible satellite signal, process arrow, axis arrow, worldline, light-cone line, simultaneity line, charge marker, band position, polarity marker, circuit connection, lamp state, and diode curve in the accepted images was checked for source-target or representational consistency; no accepted image contains a false physical arrow or path.
- No Batch 043 asset used an SVG fallback as the final asset.
- No final live Batch 043 provider request text contains the string `SkillPilot`.
- No final live Batch 043 provider request text contains its canonical goal ID.
- No final live Batch 043 provider request text contains `Mathematik`.
- No final live Batch 043 provider request text contains `DE_DEU`.
