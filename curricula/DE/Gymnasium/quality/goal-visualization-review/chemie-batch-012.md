# Goal Visualization Review - Chemie Batch 012

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, twelfth Nano Banana Pro rollout batch for atomic goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-chemie-batch-012.txt`

Prompt append dir:

- `tmp/goal-visualization-prompt-appends/chemie-batch-012`

Context:

- This batch covers alkali metals and typical compounds, reactions of alkali metals and alkali-metal oxides with water, halogens and uses, salt-class classification by anions, the lime cycle, and gypsum formation in flue-gas scrubbing.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider request text did not include canonical technical identifiers, unrelated subject/scope labels, or product names. The canonical landscape was used for final import.
- One initial candidate required targeted regeneration because the flue-gas scrubbing formula was not balanced. The accepted regeneration uses a balanced overall formula.
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

- Batch 012 generation and targeted regeneration succeeded without provider quota failures.
- `6` Chemie learning-goal candidates were accepted after fachlicher review.
- `1` generated candidate was rejected and regenerated.
- `0` goals were deferred for provider limitations.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `e0e201bd-a1fd-5985-ab08-fd24c8655f3d` | Alkalimetalle und ihre Verbindungen charakterisieren | `accepted_pilot` | Accepted. The image highlights only `Li`, `Na`, and `K` in group 1, shows the intended property cards (`weich`, `silbrig glänzend`, `sehr reaktiv`, `bilden M+ Ionen`), and gives typical examples `NaCl`, `KCl`, and lithium-ion battery use. It includes safe storage under oil and does not add reaction equations or unsafe handling. |
| `16a80de2-b5e0-5467-a9b3-5860730d7d8b` | Reaktionen von Alkalimetallen und Alkalimetalloxiden mit Wasser deuten | `accepted_pilot` | Accepted. The two reaction cards show the balanced equations `2 Na + 2 H2O -> 2 NaOH + H2` and `Na2O + H2O -> 2 NaOH`. The resulting beakers are labelled alkaline and show `Na+`/`OH-`; the two cards are not connected as a reaction sequence. |
| `58486300-3f84-5aa1-9ed4-66186af62669` | Halogene und ihre Verwendung charakterisieren | `accepted_pilot` | Accepted. The image shows the halogens as diatomic `F2`, `Cl2`, `Br2`, and `I2`, marks reactivity and halogenide formation, and uses everyday examples for fluoride, chlorine compounds, and iodine without presenting elemental chlorine gas as a household cleaner. |
| `b5086548-169e-5d63-a14a-dabf631fa013` | Halogenide, Sulfate, Nitrate und Carbonate einordnen | `accepted_pilot` | Accepted. The classification table uses correct anions and charges for selected halogenides, sulfate `SO4^2-`, nitrate `NO3-`, and carbonate `CO3^2-`, with example formulas `NaCl`, `CaSO4`, `KNO3`, and `CaCO3`. |
| `d726e00e-1f87-5ba5-8c79-76ad4022365e` | Kalkkreislauf chemisch beschreiben | `accepted_pilot` | Accepted. The lime cycle shows the correct three formula steps: `CaCO3 -> CaO + CO2`, `CaO + H2O -> Ca(OH)2`, and `Ca(OH)2 + CO2 -> CaCO3 + H2O`. The cycle arrows connect burning, slaking, setting, and limestone without reversing the reactions. |
| `414489cb-453e-5de4-ab0f-0fc01175e522` | initial Batch 012 candidate | `rejected_regenerated` | Rejected because the overall formula card `SO2 + Ca(OH)2 + O2 + H2O -> CaSO4 · 2 H2O` was not stoichiometrically balanced. Candidate: `tmp/goal-visualizations/414489cb-453e-5de4-ab0f-0fc01175e522/generated/414489cb-453e-5de4-ab0f-0fc01175e522.generated.2026-07-06T02-52-46-191Z.jpg`. |
| `414489cb-453e-5de4-ab0f-0fc01175e522` | Gipsbildung bei Rauchgaswaesche deuten | `accepted_pilot_after_regeneration` | Accepted. The regenerated image shows a flow from `Rauchgas mit SO2` through `Kalkmilch Ca(OH)2` and oxidation/sulfate formation to `Gips CaSO4 · 2 H2O`. The formula card is balanced as `2 SO2 + 2 Ca(OH)2 + O2 + 2 H2O -> 2 (CaSO4 · 2 H2O)`, and no pollutant bypass arrow is shown. |

## Batch Checks

- `6` Chemie learning-goal assets were imported and accepted.
- `0` Chemie learning-goal visualizations remain deferred from this batch.
- `1` generated candidate was rejected and regenerated.
- `0` provider quota failures occurred during Batch 012.
- Every visible element group label, ion charge, formula, reaction coefficient, salt-class example, lime-cycle arrow, flue-gas-scrubbing flow arrow, and product formula in the reviewed candidates was checked for representational consistency.
- No Batch 012 asset used an SVG fallback as the final asset.
- No final live Batch 012 provider request text contains the string `SkillPilot`.
- No final live Batch 012 provider request text contains its canonical goal ID.
- No final live Batch 012 provider request text contains `Mathematik`.
- No final live Batch 012 provider request text contains `Physik`.
- No final live Batch 012 provider request text contains `DE_DEU`.
- No final live Batch 012 provider request text contains `Gymnasium`.
- No final live Batch 012 provider request text contains product/model names.
