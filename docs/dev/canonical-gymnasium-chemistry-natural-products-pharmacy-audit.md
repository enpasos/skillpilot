# Canonical Gymnasium Chemistry: Natural Products and Pharmacy Audit

Snapshot: `2026-05-11`

Purpose:

- review the broad-cluster residue for `Naturstoffe und Synthesechemie`, especially `Q2 Pharmazie`
- decide whether biomolecule, food, polymer, pharmaceutical, synthesis, and analysis evidence exposes missing atomic Chemistry goals
- distinguish chemical assessable routines from broad Wahlbereich, regulatory, historical, or social pharmacy contexts

## Scope

In scope:

- canonical package `Naturstoffe und Synthesechemie`
- canonical subpackage `Q2 Pharmazie`
- broad cluster-target mappings below that package in all Chemistry mapping reviews
- direct atom-target evidence around natural products, polymers, aromatics, and pharmaceuticals

Out of scope:

- direct edits to the canonical Chemistry graph
- exact-remapping all broad source rows to atom leaves
- state cutover decisions

## Residue Shape

The natural-products and synthesis package has `1600` source-to-canonical mapping edges across `698` unique source goals from `15` states.
Only `22` edges target clusters directly; `1578` already target atomic goals.

| Cluster target | States | Broad mapping edges | Main source signal |
| --- | ---: | ---: | --- |
| `Q2 Pharmazie` | `4` | `20` | medicines, active ingredients, dosage forms, pharmaceutical history, misuse, interactions, quality control, synthesis and analysis examples |
| `Naturstoffe und Synthesechemie` | `1` | `2` | functional groups in natural products and everyday significance of natural products |

The broad `Q2 Pharmazie` rows are concentrated in `DE-RP`, `DE-SN`, `DE-SH`, and one `DE-SL` bridge row.
The two top-package rows come from `DE-NI`.

## Source Evidence

### Natural Products, Food, Polymers, and Aromatics

Representative evidence:

- functional groups in natural products and everyday relevance of natural products
- amino acids, proteins, peptide bonds, protein folding, denaturation, and detection reactions
- carbohydrates, reducing sugars, glucose, starch, and food chemistry applications
- fats, esters, nutritional and sustainability evaluation
- polymer classification, polymerization, polycondensation, polyaddition, thermal behavior, recycling, and bioplastics
- aromatic systems, benzene, mesomeric structures, substitution, and directing effects

Judgment:

- this is a mature shared package surface
- direct atom mappings are very strong across the whole subtree
- the two broad top-package rows are legitimate package evidence and do not expose a missing natural-products atom

### Pharmacy and Medicines

Representative evidence:

- definitions and distinctions among medicine, active ingredient, drug, medication, aid, biopharmaceutical, and homeopathic product
- development history of pharmaceutical chemistry and modern pharmacology
- medication misuse and dependency
- galenics, selected dosage examples, release behavior, and retard medicines
- active-ingredient interactions with other substances or light
- quality control, good manufacturing practice, pharmaceutical law, chromatography, titration, and analytical checks
- active ingredient groups, manufacture, production, marketing, toxicity, dosage, overdose, and workplace limits
- ASS / aspirin, ACC, paracetamol, salicylic acid, hydrolysis, saponification, back titration, and tablet binders

Judgment:

- this is a valid pharmaceutical application package
- existing atoms already cover active-ingredient classification, dosage forms, carboxylic-acid derivative formation, retrosynthesis, ASS extraction, qualitative / quantitative analgesic analysis, pain / COX inhibition, antacids, digestive aids, and selected pharmaceutical evaluation contexts
- several broad rows are historical, regulatory, marketing, safety, or health-education context rather than standalone chemical competencies
- a future exact-remapping pass may watch dosage, overdose, interactions, and misuse, but current evidence does not yet justify adding a new canonical atom

## Atom Evidence Contrast

Direct atom evidence is strong:

- `Radikalische Polymerisation beschreiben`: `157` mapping edges from `15` states
- `Kunststoffe einteilen`: `152` mapping edges from `15` states
- `Recyclingstrategien abwägen`: `145` mapping edges from `15` states
- `Aminosäuren charakterisieren`: `104` mapping edges from `14` states
- `Kohlenhydrate analysieren`: `74` mapping edges from `9` states
- `Proteinstruktur und Faltung`: `70` mapping edges from `14` states
- `Fette bewerten`: `59` mapping edges from `14` states
- `Benzolstruktur deuten`: `57` mapping edges from `14` states
- `Schmerzmittelwirkstoffe chemisch einordnen`: `22` mapping edges from `6` states
- `Darreichungsformen von Arzneimitteln vergleichen`: `21` mapping edges from `5` states
- `Acetylsalicylsäure aus Schmerztabletten extrahieren und vergleichen`: `7` mapping edges from `3` states
- `Carbonsäureester und Carbonsäureamide durch Kondensation bilden`: `7` mapping edges from `2` states

The `Q2 Pharmazie` subtree alone has `83` mapping edges from `37` unique source goals in `7` states: `20` broad package edges and `63` direct atom edges.
This confirms that broad pharmaceutical residue is mostly optional-module packaging and cross-disciplinary context.

## Boundary Decisions

1. Keep `Naturstoffe und Synthesechemie` as a learner-visible package surface.
2. Keep `Q2 Pharmazie` as a learner-visible applied-depth package.
3. Treat broad source mappings here as accepted package evidence, not source-coverage debt.
4. Do not add new canonical atoms in this pass.
5. Do not broaden state applicability merely because a source row mentions natural products, pharmaceuticals, medicine, dosage, or regulatory context at package level.
6. Keep medication misuse, dependency, pharmaceutical law, manufacturing practice, marketing, and workplace limits as boundary context unless exact-remapping later shows a repeated chemically assessable routine.
7. Reopen only if a later exact-remapping pass finds repeated source statements for a missing chemistry routine not already represented by the active-ingredient, dosage-form, analysis, retrosynthesis, pain, antacid, digestive-aid, natural-product, polymer, or aromatic atoms.

## Follow-Up

The named high-priority broad-residue rows from the horizontal audit are now reviewed.
The next F4 step is a closure sweep over the remaining low-priority broad-cluster mappings, then a P5 candidate decision for states that can be safely broadened without adding unsupported canonical atoms.
