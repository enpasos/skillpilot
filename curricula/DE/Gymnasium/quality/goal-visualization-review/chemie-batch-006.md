# Goal Visualization Review - Chemie Batch 006

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, sixth Nano Banana Pro rollout batch for atomic goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-chemie-batch-006.txt`

Prompt append dirs:

- `tmp/goal-visualization-prompt-appends/chemie-batch-006`
- `tmp/goal-visualization-prompt-appends/chemie-batch-006-regeneration-1`
- `tmp/goal-visualization-prompt-appends/chemie-batch-006-regeneration-2`
- `tmp/goal-visualization-prompt-appends/chemie-batch-006-regeneration-3`

Context:

- This batch covers air composition for combustion, simple combustion as a reaction, suitable extinguishing agents, exothermic/endothermic reactions, influences on scientific knowledge, and conservation of mass.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider request text did not include canonical technical identifiers, unrelated subject/scope labels, or product names. The canonical landscape was used for final import.
- The air-composition, methane-combustion, and mass-conservation goals needed targeted regeneration because the first candidates contained misleading arrows or particle representations.
- Final accepted assets are Nano Banana Pro outputs. No SVG fallback was used as a final asset.

Generator/prompt policy:

- Final live provider request text does not contain the string `SkillPilot`.
- Final live provider request text does not contain canonical goal IDs.
- Final live provider request text does not contain `Mathematik`.
- Final live provider request text does not contain `Physik`.
- Final live provider request text does not contain `DE_DEU`.
- Final live provider request text does not contain `Gymnasium`.
- Final live provider request text does not contain product/model names.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- Batch 006 generation and targeted regenerations succeeded without provider quota failures.
- `6` Chemie learning-goal candidates were accepted after fachlicher review.
- `5` generated candidates were rejected and regenerated.
- `0` goals were deferred for provider limitations.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `2dae4132-40a9-5ee3-ac0c-11c5d1302f36` | initial Batch 006 candidate | `rejected_regenerated` | Rejected because nitrogen molecules near the flame had visible arrows that could be read as nitrogen participating in, or being produced by, combustion. Candidate: `tmp/goal-visualizations/2dae4132-40a9-5ee3-ac0c-11c5d1302f36/generated/2dae4132-40a9-5ee3-ac0c-11c5d1302f36.generated.2026-07-06T01-13-15-191Z.jpg`. |
| `2dae4132-40a9-5ee3-ac0c-11c5d1302f36` | Luftzusammensetzung für Verbrennungen beschreiben | `accepted_pilot_after_regeneration` | Accepted after targeted regeneration. The image shows air as a mixture with `ca. 78 % N2`, `ca. 21 % O2`, and `ca. 1 % andere Gase`; only the `O2` molecule has a reaction arrow toward the flame. `N2` is shown as surrounding non-reactive gas without arrows. |
| `fa203f3a-0e81-5bcb-a4c8-e4374b7f04a3` | initial Batch 006 candidate | `rejected_regenerated` | Rejected because the oxygen molecule drawing placed `O2` labels on individual oxygen atoms, which could be read as too many oxygen molecules despite the correct equation. Candidate: `tmp/goal-visualizations/fa203f3a-0e81-5bcb-a4c8-e4374b7f04a3/generated/fa203f3a-0e81-5bcb-a4c8-e4374b7f04a3.generated.2026-07-06T01-13-44-636Z.jpg`. |
| `fa203f3a-0e81-5bcb-a4c8-e4374b7f04a3` | Einfache Verbrennungsvorgänge chemisch deuten | `accepted_pilot_after_regeneration` | Accepted after targeted regeneration. The equation `CH4 + 2 O2 -> CO2 + 2 H2O + Energie` is balanced; methane, two oxygen molecules, carbon dioxide, and two bent water molecules are represented with correct atom labels and grouping. The reaction arrow points from reactants to products. |
| `350a394f-e0d4-5e42-8e9a-39da9df33518` | Wirkung geeigneter Löschmittel erklären | `accepted_pilot` | Accepted. The image uses the fire triangle with fuel, oxygen, and heat. Water is tied to cooling paper/wood, the fire blanket separates a pan fire from oxygen, and the `CO2` extinguisher displaces oxygen near an electrical device. The warning not to use water on a grease fire is present and not contradicted. |
| `1286f2fe-89b7-4454-8e11-85b6abd6e278` | Exotherme und endotherme Reaktionen unterscheiden | `accepted_pilot` | Accepted. The energy axes point upward. In the exothermic panel products are lower than reactants and energy leaves to the surroundings with a rising thermometer; in the endothermic panel products are higher and energy enters with a cooling example. |
| `b3c9c4b8-5575-5200-86cf-26c14ebcc3d8` | Einflüsse auf naturwissenschaftliches Wissen bewerten | `accepted_pilot` | Accepted. The workflow `Beobachtung -> Daten -> Modell -> Bewertung` keeps evidence central while technology, society, environment, economy, and history influence questions, methods, and applications. The decision card balances benefit, risk, and sustainability instead of presenting knowledge as arbitrary opinion. |
| `1bdaf7f2-ff3b-455a-a7fb-95a44642762a` | initial Batch 006 candidate | `rejected_regenerated` | Rejected because the particle inset did not visibly preserve the same atom counts before and after. Candidate: `tmp/goal-visualizations/1bdaf7f2-ff3b-455a-a7fb-95a44642762a/generated/1bdaf7f2-ff3b-455a-a7fb-95a44642762a.generated.2026-07-06T01-15-36-755Z.jpg`. |
| `1bdaf7f2-ff3b-455a-a7fb-95a44642762a` | first mass-conservation regeneration | `rejected_regenerated` | Rejected because the particle inset was corrected but the before setup was not clearly a closed system. Candidate: `tmp/goal-visualizations/1bdaf7f2-ff3b-455a-a7fb-95a44642762a/generated/1bdaf7f2-ff3b-455a-a7fb-95a44642762a.generated.2026-07-06T01-18-43-831Z.jpg`. |
| `1bdaf7f2-ff3b-455a-a7fb-95a44642762a` | second mass-conservation regeneration | `rejected_regenerated` | Rejected because the separate inset was correct, but the large flask/balloon scenes showed additional particle dots with non-matching visible counts. Candidate: `tmp/goal-visualizations/1bdaf7f2-ff3b-455a-a7fb-95a44642762a/generated/1bdaf7f2-ff3b-455a-a7fb-95a44642762a.generated.2026-07-06T01-20-29-103Z.jpg`. |
| `1bdaf7f2-ff3b-455a-a7fb-95a44642762a` | Massenerhaltung bei Reaktionen erklären | `accepted_pilot_after_third_regeneration` | Accepted after the third targeted regeneration. Both panels show a closed flask-balloon system on a digital balance with `150 g` before and after. No extra atom dots appear in the large flask/balloon scenes, and the separate inset `A2 + B2 -> 2 AB` preserves exactly two red and two blue atoms before and after. |

## Batch Checks

- `6` Chemie learning-goal assets were imported and accepted.
- `0` Chemie learning-goal visualizations remain deferred from this batch.
- `5` generated candidates were rejected and regenerated.
- `0` provider quota failures occurred during Batch 006.
- Every visible reaction arrow, oxygen/nitrogen role, molecule grouping, fire-triangle relation, extinguisher-effect relation, energy-level diagram, heat-flow cue, context-to-evidence relation, mass label, and particle count in the reviewed candidates was checked for representational consistency.
- No Batch 006 asset used an SVG fallback as the final asset.
- No final live Batch 006 provider request text contains the string `SkillPilot`.
- No final live Batch 006 provider request text contains its canonical goal ID.
- No final live Batch 006 provider request text contains `Mathematik`.
- No final live Batch 006 provider request text contains `Physik`.
- No final live Batch 006 provider request text contains `DE_DEU`.
- No final live Batch 006 provider request text contains `Gymnasium`.
- No final live Batch 006 provider request text contains product/model names.
