# Goal Visualization Review - Chemie Batch 009

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, ninth Nano Banana Pro rollout batch for atomic goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-chemie-batch-009.txt`

Prompt append dirs:

- `tmp/goal-visualization-prompt-appends/chemie-batch-009`
- `tmp/goal-visualization-prompt-appends/chemie-batch-009-regeneration-1`
- `tmp/goal-visualization-prompt-appends/chemie-batch-009-regeneration-2`
- `tmp/goal-visualization-prompt-appends/chemie-batch-009-regeneration-3`

Context:

- This batch covers redox-equation setup using oxidation numbers, distinguishing redox from acid-base reactions, everyday and technical relevance of redox reactions, electrical conductivity comparisons, ions as charge carriers, and electrolysis of simple salts.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider request text did not include canonical technical identifiers, unrelated subject/scope labels, or product names. The canonical landscape was used for final import.
- The redox-equation goal needed repeated targeted regeneration because early candidates introduced a wrong copper half-equation term or ambiguous electron arrows/icons. The accepted version deliberately uses formula cards without particle-level arrows.
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

- Batch 009 generation and targeted regeneration succeeded without provider quota failures.
- `6` Chemie learning-goal candidates were accepted after fachlicher review.
- `3` generated candidates were rejected and regenerated.
- `0` goals were deferred for provider limitations.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `22133f29-ef02-4408-8f8d-2bbea3275d91` | initial Batch 009 candidate | `rejected_regenerated` | Rejected because the right-hand calculation area inserted `Zn2+` into the copper reduction line, making the half-equation wrong despite the final total equation being correct. Candidate: `tmp/goal-visualizations/22133f29-ef02-4408-8f8d-2bbea3275d91/generated/22133f29-ef02-4408-8f8d-2bbea3275d91.generated.2026-07-06T02-07-11-157Z.jpg`. |
| `22133f29-ef02-4408-8f8d-2bbea3275d91` | first Redox regeneration | `rejected_regenerated` | Rejected because the formula text was mostly correct, but the particle-level reduction drawing used arrows around electron dots in a way that could be read as electrons leaving `Cu2+`. Candidate: `tmp/goal-visualizations/22133f29-ef02-4408-8f8d-2bbea3275d91/generated/22133f29-ef02-4408-8f8d-2bbea3275d91.generated.2026-07-06T02-11-52-122Z.jpg`. |
| `22133f29-ef02-4408-8f8d-2bbea3275d91` | second Redox regeneration | `rejected_regenerated` | Rejected because added icons next to the otherwise correct formula lines showed only a single `e-`, undermining the required `2 e-` transfer. Candidate: `tmp/goal-visualizations/22133f29-ef02-4408-8f8d-2bbea3275d91/generated/22133f29-ef02-4408-8f8d-2bbea3275d91.generated.2026-07-06T02-14-00-688Z.jpg`. |
| `22133f29-ef02-4408-8f8d-2bbea3275d91` | Einfache Redoxgleichungen mit Oxidationszahlen erstellen | `accepted_pilot_after_third_regeneration` | Accepted after reducing the visual to formula cards. The accepted image shows `Zn: 0 -> +II`, `Cu: +II -> 0`, `Oxidation: Zn -> Zn2+ + 2 e-`, `Reduktion: Cu2+ + 2 e- -> Cu`, and `Gesamt: Zn + Cu2+ -> Zn2+ + Cu`; there are no extra electron arrows, cancellation marks, spectator ions, or conflicting side formulas. |
| `1f30d81c-8a26-5675-8c0a-1cb82e96d3ba` | Redox- und Säure-Base-Reaktionen unterscheiden | `accepted_pilot` | Accepted. The redox example `Zn + 2 H+ -> Zn2+ + H2` shows zinc oxidation, hydrogen reduction, and electron transfer. The acid-base example `H+ + OH- -> H2O` is separated as proton transfer, with no electron-transfer arrow in that column. |
| `17fe22c4-1248-5f37-9d0c-52ee4571d09f` | Bedeutung von Redoxreaktionen erörtern | `accepted_pilot` | Accepted. The image relates redox to battery use, corrosion, and metal extraction, and includes a Nutzen/Risiken scale. It avoids detailed reaction equations and specific electron arrows, so no unsupported source-target electron claims are introduced. |
| `018bec90-445f-4a88-b8bc-228f8335dee6` | Leitfähigkeit von Stoffen vergleichen | `accepted_pilot` | Accepted. The same low-voltage lamp circuit is used across four panels. Copper wire and sodium chloride solution are shown conducting; solid sodium chloride and sugar solution are shown not conducting. Electrodes in liquids are separated and no unsafe mains setup is shown. |
| `4285d84a-2c9a-4d51-8250-8bed4daf2d2e` | Ionen als Ladungsträger erklären | `accepted_pilot` | Accepted. The image shows a sodium chloride crystal as alternating ions, dissolution into separated `Na+` and `Cl-`, and ion movement in solution. `Na+` arrows point to the minus pole and `Cl-` arrows point to the plus pole; no electrons are shown moving through the solution. |
| `70b12d1c-abaf-45c6-ae9e-b571e9cbc126` | Elektrolyse einfacher Salze deuten | `accepted_pilot` | Accepted. The image uses molten sodium chloride, not an aqueous solution. `Na+` moves to `Kathode (-)`, `Cl-` moves to `Anode (+)`, and the visible electrode reactions `Na+ + e- -> Na` and `2 Cl- -> Cl2 + 2 e-` match the overall equation `2 NaCl(l) -> 2 Na + Cl2`. |

## Batch Checks

- `6` Chemie learning-goal assets were imported and accepted.
- `0` Chemie learning-goal visualizations remain deferred from this batch.
- `3` generated candidates were rejected and regenerated.
- `0` provider quota failures occurred during Batch 009.
- Every visible oxidation number, electron count, half-equation, total equation, proton/electron-transfer distinction, ion charge, ion-movement arrow, lamp state, electrode sign, electrode reaction, and product formula in the reviewed candidates was checked for representational consistency.
- No Batch 009 asset used an SVG fallback as the final asset.
- No final live Batch 009 provider request text contains the string `SkillPilot`.
- No final live Batch 009 provider request text contains its canonical goal ID.
- No final live Batch 009 provider request text contains `Mathematik`.
- No final live Batch 009 provider request text contains `Physik`.
- No final live Batch 009 provider request text contains `DE_DEU`.
- No final live Batch 009 provider request text contains `Gymnasium`.
- No final live Batch 009 provider request text contains product/model names.
