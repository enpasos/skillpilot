# Goal Visualization Review - Chemie Batch 007

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, seventh Nano Banana Pro rollout batch for atomic goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-chemie-batch-007.txt`

Prompt append dirs:

- `tmp/goal-visualization-prompt-appends/chemie-batch-007`
- `tmp/goal-visualization-prompt-appends/chemie-batch-007-regeneration-1`

Context:

- This batch covers pure substances, elements, compounds, mixtures, energy profiles, bond-energy explanations, formula determination from data, stoichiometric substance amounts, and comparing fuels by carbon dioxide balance and reaction heat.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider request text did not include canonical technical identifiers, unrelated subject/scope labels, or product names. The canonical landscape was used for final import.
- The substance-classification, formula-determination, and fuel-comparison goals needed targeted regeneration because the first candidates had misleading particle or calculation details.
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

- Batch 007 generation and targeted regeneration succeeded without provider quota failures.
- `6` Chemie learning-goal candidates were accepted after fachlicher review.
- `3` generated candidates were rejected and regenerated.
- `0` goals were deferred for provider limitations.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `42a84bca-d27e-581f-a43a-eee424f0504d` | initial Batch 007 candidate | `rejected_regenerated` | Rejected because the `N2 + O2` mixture panel included an apparent single blue atom, so the particle model did not consistently show diatomic nitrogen and oxygen molecules. Candidate: `tmp/goal-visualizations/42a84bca-d27e-581f-a43a-eee424f0504d/generated/42a84bca-d27e-581f-a43a-eee424f0504d.generated.2026-07-06T01-30-57-720Z.jpg`. |
| `42a84bca-d27e-581f-a43a-eee424f0504d` | Elemente, Verbindungen und Gemische unterscheiden | `accepted_pilot_after_regeneration` | Accepted after targeted regeneration. The four jars distinguish element as pure substance, compound as pure substance, mixture of elements, and mixture of compounds. The `N2 + O2` mixture uses only bonded diatomic molecules, water is bent, and carbon dioxide is straight. |
| `542d88e9-4cd3-5f90-bd20-b50ab030d72a` | Energieprofile chemischer Reaktionen deuten | `accepted_pilot` | Accepted. The energy axis points upward, the reaction path is exothermic with products below reactants and `Delta E < 0`, and both catalyzed and uncatalyzed paths start and end at the same levels. The catalyzed activation barrier is visibly lower. |
| `a530ee7d-1002-5f02-ae05-a9d46410ac78` | Energieumsatz mit Bindungsänderungen erklären | `accepted_pilot` | Accepted. Bond breaking is labelled as requiring energy input, bond formation as releasing energy outward, and the balanced example `H2 + Cl2 -> 2 HCl` is represented without exact numerical claims. |
| `e675fa94-6e23-59c0-b376-4340bf44c00e` | initial Batch 007 candidate | `rejected_regenerated` | Rejected because the calculation used `75 / 12 u = 6,25 mol`, which is dimensionally misleading. Candidate: `tmp/goal-visualizations/e675fa94-6e23-59c0-b376-4340bf44c00e/generated/e675fa94-6e23-59c0-b376-4340bf44c00e.generated.2026-07-06T01-32-21-907Z.jpg`. |
| `e675fa94-6e23-59c0-b376-4340bf44c00e` | Relative Atommassen und Molekülformeln aus Daten bestimmen | `accepted_pilot_after_regeneration` | Accepted after targeted regeneration. The image states the `100 g Probe` assumption, converts `75 % C` and `25 % H` to `75 g` and `25 g`, computes `n(C)=75 g / 12 g/mol = 6,25 mol` and `n(H)=25 g / 1 g/mol = 25 mol`, obtains `C:H=1:4`, and checks `M(CH4)=16 g/mol`. |
| `9f355f63-4fb7-5638-9538-6e8a246ec4b2` | Stoffumsätze einfacher Molekülreaktionen berechnen | `accepted_pilot` | Accepted. The equation `H2 + Cl2 -> 2 HCl` is balanced. The coefficient row `1,1,2`, given row `2 mol, 2 mol, ?`, calculated row `2 mol, 2 mol, 4 mol`, and molecule row with two `H2` plus two `Cl2` giving four `HCl` are mutually consistent. |
| `4dab7d52-5b89-52ab-a425-17a7707f44c8` | initial Batch 007 candidate | `rejected_regenerated` | Rejected because the methane row visually showed only one `O2` molecule for `CH4` combustion, despite needing `2 O2`. Candidate: `tmp/goal-visualizations/4dab7d52-5b89-52ab-a425-17a7707f44c8/generated/4dab7d52-5b89-52ab-a425-17a7707f44c8.generated.2026-07-06T01-33-15-519Z.jpg`. |
| `4dab7d52-5b89-52ab-a425-17a7707f44c8` | CO2-Bilanz und Reaktionswärme von Brennstoffen vergleichen | `accepted_pilot_after_regeneration` | Accepted after targeted regeneration. The visible equations are balanced: hydrogen combustion produces water and no local `CO2`, methane uses `CH4 + 2 O2 -> CO2 + 2 H2O`, and carbon uses `C + O2 -> CO2`. The table correctly distinguishes `0 mol CO2` for hydrogen at the reaction site and `1 mol CO2` for methane and carbon. |

## Batch Checks

- `6` Chemie learning-goal assets were imported and accepted.
- `0` Chemie learning-goal visualizations remain deferred from this batch.
- `3` generated candidates were rejected and regenerated.
- `0` provider quota failures occurred during Batch 007.
- Every visible particle class, molecule geometry, reaction path, activation-energy cue, energy-direction cue, unit conversion, formula check, stoichiometric table value, molecule count, fuel-combustion equation, and carbon dioxide balance entry in the reviewed candidates was checked for representational consistency.
- No Batch 007 asset used an SVG fallback as the final asset.
- No final live Batch 007 provider request text contains the string `SkillPilot`.
- No final live Batch 007 provider request text contains its canonical goal ID.
- No final live Batch 007 provider request text contains `Mathematik`.
- No final live Batch 007 provider request text contains `Physik`.
- No final live Batch 007 provider request text contains `DE_DEU`.
- No final live Batch 007 provider request text contains `Gymnasium`.
- No final live Batch 007 provider request text contains product/model names.
