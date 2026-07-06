# Goal Visualization Review - Chemie Batch 003

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, third Nano Banana Pro rollout batch for atomic goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-chemie-batch-003.txt`

Prompt append dirs:

- `tmp/goal-visualization-prompt-appends/chemie-batch-003`
- `tmp/goal-visualization-prompt-appends/chemie-batch-003-regeneration-1`

Context:

- This batch covers salt dissolution energy, pH classification, everyday pH consequences, acidic/basic particle models, structure-property classification, and reaction-type classification.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider request text did not include canonical technical identifiers, unrelated subject/scope labels, or product names. The canonical landscape was used for final import.
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

- Batch 003 initial generation and regeneration succeeded without provider quota failures.
- `6` Chemie learning-goal candidates were accepted after fachlicher review.
- `2` initial generated candidates were rejected and regenerated.
- `0` goals were deferred for provider limitations.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `5abc5961-6368-52bb-88b9-6a846c3c37a8` | initial Batch 003 candidate | `rejected_regenerated` | Rejected because water molecules around `Cl-` visibly had oxygen atoms facing the anion. For chloride hydration, the hydrogen side of water must point toward the anion. |
| `5abc5961-6368-52bb-88b9-6a846c3c37a8` | Lösen von Salzen energetisch erklären | `accepted_pilot_after_regeneration` | Accepted after targeted regeneration. The accepted image keeps the lattice separation, qualitative energy balance, and hydration examples simple. Oxygen sides face `Na+`, hydrogen sides face `Cl-`, and the energy balance is not given a universal sign. |
| `d2ccd1d5-56f7-583f-9724-e97441367f91` | Saure, alkalische und neutrale Lösungen unterscheiden | `accepted_pilot` | Accepted. The pH scale runs from `0` to `14`, `7` is centered and neutral, `pH 2` is acidic, and `pH 11` is alkaline. The indicator colors and arrows point to the correct scale regions. |
| `0bf26276-2780-506c-ac34-35dd44a29409` | pH-Werte in Alltag, Technik und Biologie erörtern | `accepted_pilot` | Accepted. Lemon juice is placed at `pH 2`, water at `pH 7`, and soap solution at `pH 10`. The consequence icons for enamel, habitat, and skin protection are placed in the matching pH contexts. |
| `fd309753-4d48-5570-a4ec-09dfeb20ff9c` | Saure und basische Lösungen auf Teilchenebene deuten | `accepted_pilot` | Accepted. The acidic panel contains `H3O+` and `Cl-`; the basic panel contains `OH-` and `Na+`. The displayed `HCl + H2O -> H3O+ + Cl-` inset is consistent with the particle model. |
| `02dc29ae-4046-556a-b048-d64a0feb8f16` | Stoffe nach Struktur und Eigenschaften ordnen | `accepted_pilot` | Accepted. The image separates ionic, metallic, and molecular substance classes. It does not claim that solid `NaCl` conducts electricity, represents copper as conductive and malleable, and represents pure water as molecular and non-conductive. |
| `7a05a1ce-45d3-571e-be51-afcd8dfd33ca` | initial Batch 003 candidate | `rejected_regenerated` | Rejected because the `2 e-` arrow in the electron-transfer card ended at the product side instead of at `Cu2+`, and the particle graphic suggested `Mg+` rather than `Mg2+`. |
| `7a05a1ce-45d3-571e-be51-afcd8dfd33ca` | Reaktionstypen mechanismisch einordnen | `accepted_pilot_after_regeneration` | Accepted after targeted regeneration. The proton-transfer card shows `HCl + H2O -> H3O+ + Cl-`; the electron-transfer card has one `2 e-` arrow from `Mg` to `Cu2+` and the equation `Mg + Cu2+ -> Mg2+ + Cu`; the reversible card keeps the forward and reverse arrows local. |

## Batch Checks

- `6` Chemie learning-goal assets were imported and accepted.
- `0` Chemie learning-goal visualizations remain deferred from this batch.
- `2` generated candidates were rejected and regenerated.
- `0` provider quota failures occurred during Batch 003.
- Every visible pH scale position, pH-context arrow, ion label, hydration orientation, proton-transfer arrow, electron-transfer arrow, reversible-reaction arrow, and structure-property mapping in the reviewed candidates was checked for representational consistency.
- No Batch 003 asset used an SVG fallback as the final asset.
- No final live Batch 003 provider request text contains the string `SkillPilot`.
- No final live Batch 003 provider request text contains its canonical goal ID.
- No final live Batch 003 provider request text contains `Mathematik`.
- No final live Batch 003 provider request text contains `Physik`.
- No final live Batch 003 provider request text contains `DE_DEU`.
- No final live Batch 003 provider request text contains `Gymnasium`.
- No final live Batch 003 provider request text contains product/model names.
