# Canonical Gymnasium Chemistry: Dye Chemistry Audit

Snapshot: `2026-05-11`

Purpose:

- review the broad-cluster residue for the canonical `Farbstoffchemie` package
- decide whether dye, color-model, spectroscopy, textile, and indicator evidence exposes missing atomic Chemistry goals
- keep source-backed dye contexts stable without expanding the canonical graph from broad Wahlbereich or application wording alone

## Scope

In scope:

- canonical package `Farbstoffchemie`
- cluster-target mappings below that package in all Chemistry mapping reviews
- source goals mapped to the dye-chemistry package and its atomic children

Out of scope:

- direct edits to the canonical Chemistry graph
- exact-remapping all broad source rows to atom leaves
- state cutover decisions

## Residue Shape

The dye-chemistry package has `183` source-to-canonical mapping edges across `105` unique source goals from `12` states.
Only `30` of those edges target the broad `Farbstoffchemie` cluster directly; the other `153` already target atomic goals.

| Cluster target | States | Broad mapping edges | Main source signal |
| --- | ---: | ---: | --- |
| `Farbstoffchemie` | `5` | `30` | color and light interaction, chromophores / auxochromes, dye classes, synthesis, textile dyeing, indicators, history and applications |

Broad rows are concentrated in `DE-RP` (`18`), `DE-SN` (`7`), `DE-SH` (`3`), with one broad row each in `DE-BW` and `DE-ST`.
This is a smaller residue than the previous F4 packages and is surrounded by strong direct atom evidence.

## Source Evidence

### Color Model and Dye Structures

Representative evidence:

- electromagnetic radiation, absorption, emission, reflection, and spectra
- light absorption, color, chromophore models, chromophore / auxochrome / antiauxochrome groups
- bathochromic, hypsochromic, and halochromic effects
- delocalized pi-electron systems and structural classification of dyes
- dye classes such as azo, carbonyl, polymethine, triphenylmethane, indigo, plant dyes, mineral pigments, and food or indicator dyes

Judgment:

- this is a stable shared dye-chemistry surface
- existing atoms already cover emission/absorption, delocalized electrons, absorbed/reflected light, substituent effects, absorption spectra, and indicator structure changes
- broad source rows often present a whole optional dye module in one line, so top-cluster mappings are appropriate package evidence

### Synthesis, Textile Dyeing, and Industry

Representative evidence:

- azo-dye synthesis and selected mechanistic treatment
- at least two additional dye classes where mechanisms are not always required
- textile dyeing, dye-fiber interactions, suitable dyeing methods, and fiber adhesion
- vat dyeing / indigo contexts
- economic and historical relevance of synthetic dye development
- application-oriented research and development using dyes as an example substance group

Judgment:

- existing atoms cover azo / triphenylmethane synthesis, textile dye-fiber interactions, vat dyeing, and dye-industry significance
- some source rows are LK-only or Wahlbereich depth; they should remain source-backed depth, not a reason to create a broader mandatory GK surface

### Boundary Contexts

Representative evidence:

- UV/VIS photometry, simple spectral evaluation, and concentration determination
- atom absorption / atom emission spectroscopy
- chromatographic separation of dye mixtures
- dye-sensitized solar-cell contexts, chelate complex dyes, and climate / radiation vocabulary overlap

Judgment:

- these are legitimate boundary signals between dye chemistry, instrumental analysis, materials, and energy contexts
- they do not prove missing dye atoms
- exact atom mappings already route the recurring assessable routines into spectroscopy, indicator, color-model, or application atoms

## Atom Evidence Contrast

Direct atom evidence under the same package is strong:

- `Indikatorfarbstoffe über Strukturänderungen erklären`: `54` mapping edges from `11` states
- `Farbigkeit durch delokalisierte Elektronen erklären`: `36` mapping edges from `7` states
- `Absorptionsspektren von Farbstoffen auswerten`: `32` mapping edges from `7` states
- `Azo- und Triphenylmethanfarbstoffe mechanistisch darstellen`: `8` mapping edges from `5` states
- `Farbstoffe im Alltag und Gesundheit bewerten`: `6` mapping edges from `3` states
- `Emission und Absorption zur Farbigkeit unterscheiden`: `5` mapping edges from `3` states
- `Textilfarbstoffe über Farbstoff-Faser-Wechselwirkungen beurteilen`: `5` mapping edges from `4` states

This confirms that the broad residue is mostly source granularity and optional-module packaging, not an uncovered learner-facing topic.

## Boundary Decisions

1. Keep `Farbstoffchemie` as a learner-visible package surface.
2. Treat broad source mappings here as accepted package evidence, not source-coverage debt.
3. Do not add new canonical atoms in this pass.
4. Do not broaden state applicability merely because a source row mentions dyes, color, spectra, or textile applications at package level.
5. Keep spectroscopy, chromatography, solar-cell, and chelate examples as boundary contexts unless a later review exposes a repeated missing assessable routine.
6. Reopen only if exact-remapping later finds a recurring source routine that is not already represented by color-model, spectra, synthesis, textile, indicator, industry, or boundary-analysis atoms.

## Follow-Up

The next horizontal Chemistry review lane is `Naturstoffe und Synthesechemie / Q2 Pharmazie`, especially the broad `Q2 Pharmazie` residue, because it mixes biomolecules, pharmaceuticals, synthesis pathways, mechanism depth, and state-specific optional applications.
