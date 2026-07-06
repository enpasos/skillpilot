# Goal Visualization Review - Chemie Batch 008

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, eighth Nano Banana Pro rollout batch for atomic goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-chemie-batch-008.txt`

Prompt append dirs:

- `tmp/goal-visualization-prompt-appends/chemie-batch-008`
- `tmp/goal-visualization-prompt-appends/chemie-batch-008-regeneration-1`
- `tmp/goal-visualization-prompt-appends/chemie-batch-008-regeneration-2`
- `tmp/goal-visualization-prompt-appends/chemie-dalton-regeneration-3`

Context:

- This batch covers fossil carbon dioxide increase, criteria-based evaluation of energy carriers, constant mass ratios, the Dalton model and model character, symbol/formula reading, and deriving simple reaction equations.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider request text did not include canonical technical identifiers, unrelated subject/scope labels, or product names. The canonical landscape was used for final import.
- The carbon-cycle, constant-mass-ratio, and Dalton-model goals needed targeted regeneration because first candidates contained misleading arrows, product-side component labels, non-conserved particle counts, or unsuitable model icons/labels.
- The final Dalton correction used the pipeline's image-to-image reference support with a near-correct Nano Banana Pro candidate as local reference.
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

- Batch 008 generation and targeted regeneration succeeded without provider quota failures.
- `6` Chemie learning-goal candidates were accepted after fachlicher review.
- `6` generated candidates were rejected and regenerated.
- `0` goals were deferred for provider limitations.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `0503c975-3934-5206-962e-b1c247de0c12` | initial Batch 008 candidate | `rejected_regenerated` | Rejected because the carbon-cycle diagram included an additional red arrow that could be read as atmospheric carbon dioxide moving into soil, making a source/target relation ambiguous or wrong. Candidate: `tmp/goal-visualizations/0503c975-3934-5206-962e-b1c247de0c12/generated/0503c975-3934-5206-962e-b1c247de0c12.generated.2026-07-06T01-47-19-478Z.jpg`. |
| `0503c975-3934-5206-962e-b1c247de0c12` | Fossilen CO2-Anstieg mit dem Kohlenstoffkreislauf begründen | `accepted_pilot_after_regeneration` | Accepted after targeted regeneration. The visible carbon stores are atmosphere, plants/animals, soil, and fossil carbon. The arrows show photosynthesis from atmosphere to biomass, respiration/decomposition from biomass to atmosphere, long-term storage from soil to fossil carbon, and fossil combustion from fossil carbon to atmosphere. No arrow sends atmospheric carbon into soil/fossil carbon. |
| `9198b4cf-e454-562f-83f0-b1b74e68765d` | Energieträger kriteriengeleitet bewerten | `accepted_pilot` | Accepted. The image presents a criteria board for hydrogen, methane, and coal, with qualitative comparison by carbon dioxide at use, storage/transport, energy per mass, and origin/availability. Hydrogen is not shown as producing carbon dioxide at the point of use; methane and coal are shown as carbon dioxide producing, with coal higher. |
| `e0d05c36-eaac-4c75-8ead-3fd5bdafefca` | initial Batch 008 candidate | `rejected_regenerated` | Rejected because Probe 2 visually labelled the product side as `MgO` plus separate `O`, suggesting leftover oxygen or a product mixture rather than only magnesium oxide. Candidate: `tmp/goal-visualizations/e0d05c36-eaac-4c75-8ead-3fd5bdafefca/generated/e0d05c36-eaac-4c75-8ead-3fd5bdafefca.generated.2026-07-06T01-48-23-767Z.jpg`. |
| `e0d05c36-eaac-4c75-8ead-3fd5bdafefca` | first regeneration candidate | `rejected_regenerated` | Rejected because the Probe 2 product drawing showed only five visible green magnesium pieces despite the `6 g Mg` input label and `10 g MgO` product label. Candidate: `tmp/goal-visualizations/e0d05c36-eaac-4c75-8ead-3fd5bdafefca/generated/e0d05c36-eaac-4c75-8ead-3fd5bdafefca.generated.2026-07-06T01-52-40-003Z.jpg`. |
| `e0d05c36-eaac-4c75-8ead-3fd5bdafefca` | Konstante Massenverhältnisse beschreiben | `accepted_pilot_after_second_regeneration` | Accepted after a second targeted regeneration. The image uses continuous proportional bars instead of countable pieces. The balanced equation `2 Mg + O2 -> 2 MgO`, the mass ratio `Mg : O = 3 : 2`, and both rows `3 g Mg + 2 g O -> 5 g MgO` and `6 g Mg + 4 g O -> 10 g MgO` are mutually consistent. |
| `9b5d6326-d27c-4ece-8c72-debda705464a` | initial Batch 008 candidate | `rejected_regenerated` | Rejected because a lower model-strip reaction did not conserve the visible atom count, despite the upper reaction panel being acceptable. Candidate: `tmp/goal-visualizations/9b5d6326-d27c-4ece-8c72-debda705464a/generated/9b5d6326-d27c-4ece-8c72-debda705464a.generated.2026-07-06T01-48-52-995Z.jpg`. |
| `9b5d6326-d27c-4ece-8c72-debda705464a` | first regeneration candidate | `rejected_regenerated` | Rejected because the otherwise correct three-panel version included a modern orbit/atom icon in the hypothesis strip, which is unsuitable in a Dalton-model visualization. Candidate: `tmp/goal-visualizations/9b5d6326-d27c-4ece-8c72-debda705464a/generated/9b5d6326-d27c-4ece-8c72-debda705464a.generated.2026-07-06T01-53-10-786Z.jpg`. |
| `9b5d6326-d27c-4ece-8c72-debda705464a` | second regeneration candidate | `rejected_regenerated` | Rejected because the product-side blue and red spheres were individually labelled `AB`; `AB` must label the bonded pair as a whole, not a single sphere. Candidate: `tmp/goal-visualizations/9b5d6326-d27c-4ece-8c72-debda705464a/generated/9b5d6326-d27c-4ece-8c72-debda705464a.generated.2026-07-06T01-56-03-329Z.jpg`. |
| `9b5d6326-d27c-4ece-8c72-debda705464a` | Dalton-Modell und Modellcharakter erläutern | `accepted_pilot_after_third_regeneration` | Accepted after a final image-to-image correction. The accepted image uses only solid Dalton spheres, shows identical atoms for the same element, labels `AB` only at the bonded blue-red pair, and conserves the reaction count from `A:2, B:2` before to `A:2, B:2` after. |
| `e7c363d4-e02d-4895-8750-ba62c2eb63fe` | Chemische Symbole und Formeln sicher nutzen | `accepted_pilot` | Accepted. Element symbols `H`, `O`, `C`, `Na`, and `Cl` are used with correct capitalization. The molecule cards match their particle drawings: bent `H2O` with two hydrogen atoms and one oxygen atom, straight `CO2` with one carbon and two oxygen atoms, and `CH4` with one carbon and four hydrogen atoms. |
| `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` | Einfache Reaktionsgleichungen ableiten | `accepted_pilot` | Accepted. The word scheme, formula scheme, and balanced equation for magnesium combustion are consistent: `Magnesium + Sauerstoff -> Magnesiumoxid`, `Mg + O2 -> MgO`, and `2 Mg + O2 -> 2 MgO`. The particle balance shows two magnesium atoms plus one oxygen molecule producing two magnesium oxide units, with `Mg: 2` and `O: 2` before and after. |

## Batch Checks

- `6` Chemie learning-goal assets were imported and accepted.
- `0` Chemie learning-goal visualizations remain deferred from this batch.
- `6` generated candidates were rejected and regenerated.
- `0` provider quota failures occurred during Batch 008.
- Every visible arrow source/target, carbon-store relation, comparison criterion, carbon dioxide cue, mass value, mass ratio, product label, model icon, Dalton-particle count, formula capitalization, subscript meaning, molecule geometry, reaction equation, coefficient, and atom counter in the reviewed candidates was checked for representational consistency.
- No Batch 008 asset used an SVG fallback as the final asset.
- No final live Batch 008 provider request text contains the string `SkillPilot`.
- No final live Batch 008 provider request text contains its canonical goal ID.
- No final live Batch 008 provider request text contains `Mathematik`.
- No final live Batch 008 provider request text contains `Physik`.
- No final live Batch 008 provider request text contains `DE_DEU`.
- No final live Batch 008 provider request text contains `Gymnasium`.
- No final live Batch 008 provider request text contains product/model names.
