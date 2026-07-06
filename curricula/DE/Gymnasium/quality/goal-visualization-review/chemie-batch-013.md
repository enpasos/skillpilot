# Goal Visualization Review - Chemie Batch 013

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, thirteenth Nano Banana Pro rollout batch for atomic goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-chemie-batch-013.txt`

Prompt append dir:

- `tmp/goal-visualization-prompt-appends/chemie-batch-013`

Context:

- This batch covers fertilizer salts and ions, qualitative elemental analysis of hydrocarbons, Rutherford atom model basics, Bohr energy levels and shell distribution, periodic-table structure interpretation, and ion formation by the noble-gas rule.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider input text did not include canonical technical identifiers, unrelated subject/scope labels, or product names. The canonical landscape was used for final import.
- Two initial candidates required targeted regeneration. The elemental-analysis image needed clearer evidence stations; the energy-level image needed removal of misleading charge/electron marks.
- Final accepted assets are Nano Banana Pro outputs. No SVG fallback was used as a final asset.

Generator/prompt policy:

- Final live provider input text does not contain the string `SkillPilot`.
- Final live provider input text does not contain canonical goal IDs.
- Final live provider input text does not contain `Mathematik`.
- Final live provider input text does not contain `Physik`.
- Final live provider input text does not contain `DE_DEU`.
- Final live provider input text does not contain `Gymnasium`.
- Final live provider input text does not contain product/model names.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- Batch 013 generation and targeted regenerations succeeded without provider quota failures.
- `6` Chemie learning-goal candidates were accepted after fachlicher review.
- `3` generated candidates were rejected and regenerated.
- `0` goals were deferred for provider limitations.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `1f5ee84f-245a-5a1e-a260-f960f26523e9` | Duengemittel chemisch einordnen | `accepted_pilot` | Accepted. The image classifies fertilizer as a salt/ion source, shows correct ions and charges for `NO3-`, `NH4+`, and `PO4^3-`, and separates plant-nutrient benefit from overfertilization risk. Arrows run from fertilizer salt to dissolved ions and roots without implying a wrong reaction mechanism. |
| `ddb76915-4d63-5375-901d-4e659f5e9b09` | initial Batch 013 candidate | `rejected_regenerated` | Rejected because the carbon-dioxide proof station was not visually clear enough as cloudy limewater and the image contained an awkward English/German label (`Heatingselement`). Candidate: `tmp/goal-visualizations/ddb76915-4d63-5375-901d-4e659f5e9b09/generated/ddb76915-4d63-5375-901d-4e659f5e9b09.generated.2026-07-06T03-02-09-146Z.jpg`. |
| `ddb76915-4d63-5375-901d-4e659f5e9b09` | Qualitative Elementaranalyse von Kohlenwasserstoffen auswerten | `accepted_pilot_after_regeneration` | Accepted. The regenerated image shows the gas-flow path from hydrocarbon combustion with `O2` through `H2O-Nachweis: wasserfreies CuSO4 wird blau` and then `CO2-Nachweis: Kalkwasser wird trueb`. The interpretation cards correctly map `CO2` to carbon in the sample and `H2O` to hydrogen in the sample. |
| `72236f2c-771e-4ab6-933a-e549ee49d15b` | Kern-Huelle-Modell und Elementarteilchen beschreiben | `accepted_pilot` | Accepted. The Rutherford setup shows a gold foil with most alpha particles passing straight and only a few deflected. The atom sketch keeps protons and neutrons in the nucleus and electrons in the shell, without placing electrons in the nucleus or implying that all alpha particles bounce back. |
| `f5efab9d-2c61-44ea-b36a-87f873b51fd8` | initial Batch 013 candidate | `rejected_regenerated` | Rejected because the shell sketch included a small plus-sign particle outside the nucleus, which could be read as a proton or positive charge outside the nucleus. Candidate: `tmp/goal-visualizations/f5efab9d-2c61-44ea-b36a-87f873b51fd8/generated/f5efab9d-2c61-44ea-b36a-87f873b51fd8.generated.2026-07-06T03-03-07-177Z.jpg`. |
| `f5efab9d-2c61-44ea-b36a-87f873b51fd8` | first regenerated Batch 013 candidate | `rejected_regenerated` | Rejected because the inner shell was labelled `2 e-` but visibly contained three electron marks, creating a contradiction with the sodium distribution. Candidate: `tmp/goal-visualizations/f5efab9d-2c61-44ea-b36a-87f873b51fd8/generated/f5efab9d-2c61-44ea-b36a-87f873b51fd8.generated.2026-07-06T03-09-07-219Z.jpg`. |
| `f5efab9d-2c61-44ea-b36a-87f873b51fd8` | Energiestufenmodell und Elektronenverteilung anwenden | `accepted_pilot_after_regeneration` | Accepted. The second regeneration uses shell count badges and the compact distribution label `Na: 2 | 8 | 1` for sodium, keeps the nucleus as `Na, 11 p+`, and shows a qualitative ionization-energy jump after removing the first electron. No proton, plus-sign particle, or positive charge is drawn outside the nucleus. |
| `e9d74940-1e0e-4511-9718-4851f49ad7a5` | Periodensystem zur Strukturdeutung nutzen | `accepted_pilot` | Accepted. The periodic-table view highlights sodium and chlorine with correct structural data: `Na` has ordinal/proton number `11` and one valence electron, while `Cl` has ordinal/proton number `17` and seven valence electrons. Group and valence-electron interpretation are not confused with ion formation. |
| `a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca` | Ionenbildung mit der Edelgasregel deuten | `accepted_pilot` | Accepted. The image shows the correct electron-transfer equations `Na -> Na+ + e-` and `Cl + e- -> Cl-`, with sodium forming a cation and chlorine forming an anion. Arrow directions follow the electron transfer and do not reverse charge formation. |

## Batch Checks

- `6` Chemie learning-goal assets were imported and accepted.
- `0` Chemie learning-goal visualizations remain deferred from this batch.
- `3` generated candidates were rejected and regenerated.
- `0` provider quota failures occurred during Batch 013.
- Every visible ion charge, gas-flow arrow, evidence arrow, subatomic-particle placement, shell-count label, periodic-table property, electron-transfer equation, charge sign, and ion-formation arrow in the reviewed candidates was checked for representational consistency.
- No Batch 013 asset used an SVG fallback as the final asset.
- No final live Batch 013 provider input text contains the string `SkillPilot`.
- No final live Batch 013 provider input text contains its canonical goal ID.
- No final live Batch 013 provider input text contains `Mathematik`.
- No final live Batch 013 provider input text contains `Physik`.
- No final live Batch 013 provider input text contains `DE_DEU`.
- No final live Batch 013 provider input text contains `Gymnasium`.
- No final live Batch 013 provider input text contains product/model names.
