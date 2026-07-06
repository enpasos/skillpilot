# Goal Visualization Review - Chemie Batch 010

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, tenth Nano Banana Pro rollout batch for atomic goal visualizations.

Status: `completed`

Batch file: `tmp/goal-visualization-chemie-batch-010.txt`

Prompt append dir:

- `tmp/goal-visualization-prompt-appends/chemie-batch-010`

Context:

- This batch covers spectroscopic evidence for sublevels, quantum numbers and occupation rules, transition-metal ion charges, substance amount and mole, molar mass, and the relation between atomic mass unit and gram-scale portions.
- The batch was generated with the existing Nano Banana Pro pipeline and reviewed from temporary `--no-import` outputs before import.
- A provider-safe local landscape snapshot was used for live generation so the provider request text did not include canonical technical identifiers, unrelated subject/scope labels, or product names. The canonical landscape was used for final import.
- Three initial candidates required targeted regeneration: the sublevel image had spelling/transition-risk issues, the molar-mass image visually showed three one-mole boxes for a two-mole example, and the u/g image introduced a false equality between `12 u` and Avogadro's number.
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

- Batch 010 generation and targeted regeneration succeeded without provider quota failures.
- `6` Chemie learning-goal candidates were accepted after fachlicher review.
- `4` generated candidates were rejected and regenerated.
- `0` goals were deferred for provider limitations.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `49235cbe-6658-5e7e-8bd4-398416bcebdc` | initial Batch 010 candidate | `rejected_regenerated` | Rejected because the image contained spelling/label issues (`Evidence-to-Modell`, `Qualierungsenergie`, `Lichtemmission`) and internal energy-level arrows that could be read as unsupported spectral transitions. Candidate: `tmp/goal-visualizations/49235cbe-6658-5e7e-8bd4-398416bcebdc/generated/49235cbe-6658-5e7e-8bd4-398416bcebdc.generated.2026-07-06T02-24-04-636Z.jpg`. |
| `49235cbe-6658-5e7e-8bd4-398416bcebdc` | first sublevel regeneration | `rejected_regenerated` | Rejected because the technical key misspelled `Nebenquantenzahl` as `Nebenquantezahl`; otherwise the reduced visual structure was close. Candidate: `tmp/goal-visualizations/49235cbe-6658-5e7e-8bd4-398416bcebdc/generated/49235cbe-6658-5e7e-8bd4-398416bcebdc.generated.2026-07-06T02-29-41-551Z.jpg`. |
| `49235cbe-6658-5e7e-8bd4-398416bcebdc` | Unterenergiestufen aus Spektren und Ionisierungsenergien ableiten | `accepted_pilot_after_second_regeneration` | Accepted. The final image connects an emission-line strip and qualitative ionization-energy jumps to an energy-level model with `n=1`, `n=2`, `n=3`, and separated `2s/2p` and `3s/3p` sublevels. It avoids electron-orbit drawings, exact numerical values, element-specific line labels, and internal energy-level transition arrows. |
| `3bc48951-025c-5144-99b1-924db611a5f9` | Quantenzahlen und Besetzungsregeln zur PSE-Anordnung nutzen | `accepted_pilot` | Accepted. The nitrogen orbital diagram shows `1s` and `2s` paired and the three `2p` boxes singly occupied with parallel arrows, matching Hund's rule. Aufbau and Pauli rules are separated from the PSE block sketch; no incorrect extra electrons or block labels are shown. |
| `a138d7bf-163a-59e0-a50a-8438ef4f5168` | Ionenladungen von Nebengruppenelementen orbitalenergetisch begründen | `accepted_pilot` | Accepted. The iron example shows neutral iron as `[Ar] 4s2 3d6`, `Fe2+` as `[Ar] 3d6`, and `Fe3+` as `[Ar] 3d5`. The electron-removal sequence removes `4s` electrons first and represents `d5` as five singly occupied `3d` boxes. |
| `1dc15fa2-fca4-56b0-b5c1-4d215613dde0` | Stoffmenge und Einheit Mol nutzen | `accepted_pilot` | Accepted. The image treats mol as a counting unit, uses `n = N / N_A`, identifies `N` as particle count and `N_A` as Avogadro constant, and shows `1 mol = 6,022 · 10^23 Teilchen`. It does not equate mol with grams. |
| `8a2ad724-df5e-5986-8de9-560ba43caac2` | initial Batch 010 candidate | `rejected_regenerated` | Rejected because the worked two-mole example visually showed three `1 mol` boxes on the input side, conflicting with `2 mol H2O -> 36 g`. Candidate: `tmp/goal-visualizations/8a2ad724-df5e-5986-8de9-560ba43caac2/generated/8a2ad724-df5e-5986-8de9-560ba43caac2.generated.2026-07-06T02-26-03-857Z.jpg`. |
| `8a2ad724-df5e-5986-8de9-560ba43caac2` | Molare Masse bestimmen und verwenden | `accepted_pilot_after_regeneration` | Accepted. The final image uses only water, shows `M(H2O) = 2 · 1 g/mol + 16 g/mol = 18 g/mol`, applies `m = n · M`, and represents the `2 mol H2O` example with exactly two `1 mol H2O` boxes leading to `36 g`. |
| `dd3fc8fe-2316-5fbc-b569-00651c83bc81` | initial Batch 010 candidate | `rejected_regenerated` | Rejected because a speech bubble falsely linked `12 u` with Avogadro's number, implying `12 u = 6,022 · 10^23 Atome`. Candidate: `tmp/goal-visualizations/dd3fc8fe-2316-5fbc-b569-00651c83bc81/generated/dd3fc8fe-2316-5fbc-b569-00651c83bc81.generated.2026-07-06T02-26-30-274Z.jpg`. |
| `dd3fc8fe-2316-5fbc-b569-00651c83bc81` | Atomare Masseneinheit und Grammbezug einordnen | `accepted_pilot_after_regeneration` | Accepted. The final image separates particle and portion level: one atom is labelled `12 u` and `12 u pro Atom`, the portion is labelled `1 mol`, `12 g`, and `12 g pro mol`, and the only Avogadro equality is `1 mol = 6,022 · 10^23 Atome`. |

## Batch Checks

- `6` Chemie learning-goal assets were imported and accepted.
- `0` Chemie learning-goal visualizations remain deferred from this batch.
- `4` generated candidates were rejected and regenerated.
- `0` provider quota failures occurred during Batch 010.
- Every visible orbital occupation, electron-removal step, ion charge, Avogadro exponent, molar-mass value, substance-amount relation, mass unit, and arrow/source-target relation in the reviewed candidates was checked for representational consistency.
- No Batch 010 asset used an SVG fallback as the final asset.
- No final live Batch 010 provider request text contains the string `SkillPilot`.
- No final live Batch 010 provider request text contains its canonical goal ID.
- No final live Batch 010 provider request text contains `Mathematik`.
- No final live Batch 010 provider request text contains `Physik`.
- No final live Batch 010 provider request text contains `DE_DEU`.
- No final live Batch 010 provider request text contains `Gymnasium`.
- No final live Batch 010 provider request text contains product/model names.
