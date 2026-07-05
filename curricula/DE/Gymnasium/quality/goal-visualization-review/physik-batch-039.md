# Goal Visualization Review - Physik Batch 039

Review date: 2026-07-03

Scope: canonical `DE Gymnasium Physik`, thirty-ninth Nano Banana Pro rollout batch for atomic learning-goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-physik-batch-039.txt`

Prompt append dirs:

- `tmp/goal-visualization-prompt-appends/physik-batch-039`
- `tmp/goal-visualization-prompt-appends/physik-batch-039-regeneration-1`
- `tmp/goal-visualization-prompt-appends/physik-batch-039-regeneration-2`

Context:

- This batch covers the Rydberg formula, photons and electrons as quantum objects, model reflection, double-slit comparisons of classical waves/classical particles/quantum objects, probability rather than deterministic path statements, and interference from individual quantum detections.
- The review applied the strict arrow rule: every visible transition arrow, conceptual arrow, label pointer, trajectory cue, ray/path cue, screen-hit pattern, probability graph, and spectrum marker was checked for source-target consistency.
- Directional arrows were accepted only when their represented source, direction, and target were unambiguous. Several generated candidates were regenerated to remove unclear arrows, deterministic quantum paths, unwanted English labels, or formula-like background artifacts.
- Final accepted assets are visual-first Nano Banana Pro images. No SVG fallback was used.

Generator/prompt policy:

- Final live provider request text does not contain the string `SkillPilot`.
- Final live provider request text does not contain canonical goal IDs.
- Final live provider request text does not contain `Mathematik`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- All live Nano Banana Pro requests generated candidates without temporary provider failure.
- Four initial candidates were rejected before final import, and one first regeneration was also rejected before a second accepted replacement.
- No Batch 039 goal was deferred as a provider limitation.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `974a2d1c-2225-519d-965f-7744fe8aafd5` | initial Batch 039 candidate | `rejected_regenerated` | Rejected because the energy-level diagram included an extra curved black arrow whose source-target meaning was not a Rydberg transition and was not a clear label pointer. The strict arrow rule requires removing such ambiguous arrows. |
| `974a2d1c-2225-519d-965f-7744fe8aafd5` | Rydberg-Formel anwenden | `accepted_pilot_after_regeneration` | The accepted image has only the two relevant downward Balmer transitions: `H_alpha` from `n = 3` to `n = 2` and `H_beta` from `n = 4` to `n = 2`. Both transition arrows start and end on the correct levels, the spectrum strip has discrete lines, and the displayed Rydberg relation is correct for `n_2 > n_1`. |
| `a359c859-eee0-40ef-a9d1-88db2e6c55b2` | Photonen und Elektronen als Quantenobjekte beschreiben | `accepted_pilot` | The accepted image shows photon and electron panels with both a localized detection event and a wave-packet representation. It does not show deterministic trajectories or fixed electron paths. Conceptual arrows point only from the shared `Quantenobjekt` label toward the panels and do not represent physical motion. |
| `defe44d2-c3d3-456b-a786-fad2cef13fe8` | initial Batch 039 candidate | `rejected_regenerated` | Rejected because it contained the unwanted English text `click` and a blank/incomplete model-limits cell. Visible image text must stay controlled and learner-facing. |
| `defe44d2-c3d3-456b-a786-fad2cef13fe8` | first Batch 039 regeneration | `rejected_regenerated` | Rejected because formula-like chalkboard background writing appeared behind the table. Those extra formulas were not part of the requested model-reflection visual and could be misleading. |
| `defe44d2-c3d3-456b-a786-fad2cef13fe8` | Die Bedeutung von Modellen an Photon und Elektron reflektieren | `accepted_pilot_after_second_regeneration` | The accepted image uses a plain background and three model cards: `Wellenmodell`, `Teilchenmodell`, and `Quantenmodell`. The cards pair each model with `Interferenz`, `Nachweis`, or `Wahrscheinlichkeit`, mark `Grenze` with question icons, and contain no formulas, English artifact text, arrows, or deterministic paths. |
| `4245c54f-d609-41bc-9eff-e9ceeff4902f` | initial Batch 039 candidate | `rejected_regenerated` | Rejected because the quantum-object panel showed deterministic arrows from slit region to screen hits. Those arrows would imply tracked quantum paths and are not acceptable for this goal. |
| `4245c54f-d609-41bc-9eff-e9ceeff4902f` | Klassische Wellen, klassische Teilchen und Quantenobjekte am Doppelspalt vergleichen | `accepted_pilot_after_regeneration` | The accepted image compares three double-slit panels without arrows: classical waves form interference bands, classical particles form two broad bands, and quantum objects are shown as individual screen detections with a non-classical pattern. No deterministic quantum trajectory is shown. |
| `5c57dbc7-d258-4aad-a84c-e773f3c493ae` | Wahrscheinlichkeitsaussagen statt klassischem Determinismus erlaeutern | `accepted_pilot` | The accepted image shows a probability cloud through the double-slit region and a hit distribution on the screen with a `P(x)` curve. The only single-path cue is deliberately crossed out and labelled `keine feste Bahn`, so it functions as a rejected classical path rather than a claimed quantum path. |
| `1a1c09f0-96b7-4c33-a623-0e8101537876` | initial Batch 039 candidate | `rejected_regenerated` | Rejected because it contained the English label `Quantum source` and label/path arrows in the setup. The final image needed German controlled text and no path-arrow cues toward individual hits. |
| `1a1c09f0-96b7-4c33-a623-0e8101537876` | Interferenz einzelner Quantenobjekte mit Wahrscheinlichkeitsaussagen beschreiben | `accepted_pilot_after_regeneration` | The accepted image shows `1 Treffer`, `20 Treffer`, and `viele Treffer` as successive screen snapshots. One hit is a single dot, the intermediate view has scattered dots, and many hits form clear interference bands with a probability curve. No path arrows from source or slits to individual detections are present. |

## Batch Checks

- `6` Physik learning-goal assets were imported and accepted.
- `0` Batch 039 goals were deferred as provider limitations.
- `5` generated Batch 039 candidates were rejected before final accepted replacements, counting the first model-regeneration candidate.
- `0` temporary provider failures occurred in Batch 039.
- Every visible transition arrow, conceptual arrow, label pointer, trajectory cue, ray/path cue, screen-hit pattern, probability graph, and spectrum marker in the accepted images was checked for source-target consistency; no accepted image contains a false physical arrow.
- No Batch 039 asset used an SVG fallback as the final asset.
- No final live Batch 039 provider request text contains the string `SkillPilot`.
- No final live Batch 039 provider request text contains its canonical goal ID.
- No final live Batch 039 provider request text contains `Mathematik`.
