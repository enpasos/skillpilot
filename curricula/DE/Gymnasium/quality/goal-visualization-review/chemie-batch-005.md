# Goal Visualization Review - Chemie Batch 005

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, fifth Nano Banana Pro rollout batch for atomic goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-chemie-batch-005.txt`

Prompt append dir: `tmp/goal-visualization-prompt-appends/chemie-batch-005`

Context:

- This batch covers chemical symbolic language, source and argument evaluation, societal and professional contexts, criteria-led evaluation of action options, distinguishing reactions from state changes, and basic oxidation/reduction.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider request text did not include canonical technical identifiers, unrelated subject/scope labels, or product names. The canonical landscape was used for final import.
- The provider-safe wording for the reaction/state-change distinction was adjusted before live generation from a scope-sensitive term to the neutral content phrase `Zustandsaenderung`; the canonical goal text was not changed.
- The redox goal required two targeted regenerations because the first accepted-looking candidate still had an insufficient electron count for `Mg2+`/`O2-`.
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

- Batch 005 generation succeeded without provider quota failures.
- `6` generated candidates were accepted after fachlicher review.
- `2` generated Redox candidates were rejected and regenerated before final import.
- `0` goals were deferred for provider limitations.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `95dc0ee5-a0af-5682-af32-d66e36fbeb50` | Chemische Fach- und Symbolsprache ebenengerecht verwenden | `accepted_pilot` | Accepted. The image separates everyday word, substance level, particle level, and symbolic equation. Water molecules are bent, the beaker is not confused with a molecule, and the equation `2 H2 + O2 -> 2 H2O` is balanced. |
| `b6327e98-8ab9-5d7f-b826-4023bc1a56a7` | Quellen und Argumente zu chemischen Sachverhalten auswerten | `accepted_pilot` | Accepted. The image separates measured data, advertising, and fachlicher text, then routes them through source, author, date, data, and evidence checks. Pro and contra statements are tied to evidence cards instead of unsupported opinion or invented official thresholds. |
| `542822de-cb96-56cf-a487-0fc3b5820f57` | Chemie in Gesellschaft und Berufsfeldern einordnen | `accepted_pilot` | Accepted. The image shows medicine, environment, material, and energy contexts plus laboratory, production, and environmental analysis roles. It keeps benefit, risk, and responsibility visible and does not claim that a context is automatically risk-free. |
| `1df17884-96ae-57d7-9da9-dbebd082596f` | Chemische Handlungsoptionen kriteriengeleitet bewerten | `accepted_pilot` | Accepted. The image compares glass, reusable plastic, and single-use plastic against safety, environment, cost, and use criteria. The matrix requires a justified decision and keeps chances and risks visible rather than declaring one option universally best. |
| `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566` | Chemische Reaktionen von physikalischen Vorgängen unterscheiden | `accepted_pilot` | Accepted. Melting is represented as a state change where `H2O` remains `H2O`, while iron with oxygen forms the new substance iron oxide. The `neuer Stoff?` criterion is applied consistently to the before/after particle views. |
| `bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a` | initial Batch 005 candidate | `rejected_regenerated` | Rejected because the electron-transfer arrows were too ambiguous for the reduction side. Candidate: `tmp/goal-visualizations/bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a/generated/bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a.generated.2026-07-06T00-58-37-672Z.jpg`. |
| `bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a` | first Redox regeneration | `rejected_regenerated` | Rejected because it showed only `e-` while the intended magnesium/oxide ions require `2 e-`; text and charges did not match tightly enough. Candidate: `tmp/goal-visualizations/bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a/generated/bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a.generated.2026-07-06T01-01-22-798Z.jpg`. |
| `bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a` | Oxidation und Reduktion bei einfachen Reaktionen erkennen | `accepted_pilot_after_second_regeneration` | First candidate rejected because the reduction electron arrow was not visually unambiguous enough. First regeneration rejected because it showed only `e-` while the product lattice used `Mg2+` and `O2-`. Second regeneration accepted: the equation `2 Mg + O2 -> 2 MgO` is balanced, magnesium is shown as losing `2 e-` to become `Mg2+`, oxygen is shown as gaining `2 e-` to become `O2-`, and the product lattice uses `Mg2+`/`O2-`. |

## Batch Checks

- `6` Chemie learning-goal assets were imported and accepted.
- `0` Chemie learning-goal visualizations remain deferred from this batch.
- `2` generated candidates were rejected and regenerated.
- `0` provider quota failures occurred during Batch 005.
- Every visible equation, molecule arrangement, source-to-argument relation, criteria-table entry, before/after particle relation, state-change/reaction distinction, ion charge, and electron-transfer arrow in the reviewed candidates was checked for representational consistency.
- No Batch 005 asset used an SVG fallback as the final asset.
- No final live Batch 005 provider request text contains the string `SkillPilot`.
- No final live Batch 005 provider request text contains its canonical goal ID.
- No final live Batch 005 provider request text contains `Mathematik`.
- No final live Batch 005 provider request text contains `Physik`.
- No final live Batch 005 provider request text contains `DE_DEU`.
- No final live Batch 005 provider request text contains `Gymnasium`.
- No final live Batch 005 provider request text contains product/model names.
