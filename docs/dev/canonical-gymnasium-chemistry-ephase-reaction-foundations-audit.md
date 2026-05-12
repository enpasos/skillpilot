# Canonical Gymnasium Chemistry: E-Phase Reaction Foundations Audit

Snapshot: `2026-05-11`

Purpose:

- review the largest broad-cluster residue found in the horizontal all-state Chemistry topic-gap audit
- decide whether broad source mappings to the canonical E-phase reaction-foundations packages expose missing atomic Chemistry goals
- keep source-backed state projections stable without inflating the canonical graph from curriculum package wording alone

## Scope

In scope:

- canonical package `Einfuehrungsphase Reaktionsgrundlagen`
- cluster-target mappings below that package in all Chemistry mapping reviews
- source goals mapped to:
  - `Erdol und Erdgas - Brennstoffe`
  - `Einfuehrung organische Verbindungen`

Out of scope:

- direct edits to the canonical Chemistry graph
- exact-remapping all broad source rows to atom leaves
- state cutover decisions

## Residue Shape

The E-phase reaction-foundations package has `442` broad cluster-target mapping edges.

| Cluster target | States | Broad mapping edges | Main source signal |
| --- | ---: | ---: | --- |
| `Erdol und Erdgas - Brennstoffe` | `11` | `236` | hydrocarbons, homologous series, crude oil / natural gas, cracking, combustion, fuel comparison, raw-material and sustainability evaluation |
| `Einfuehrung organische Verbindungen` | `11` | `206` | organic/anorganic distinction, homologous series, IUPAC / isomerism, oxygen-containing functional groups, ester formation, structure-property relations |

The broad rows are concentrated in newer large source extractions, especially `DE-SL`, `DE-SN`, `DE-ST`, `DE-RP`, `DE-TH`, and `DE-MV`.
Older compact lanes such as `DE-HB`, `DE-HH`, and `DE-NI` mostly confirm the same surface with fewer rows.

## Source Evidence

### Erdol / Erdgas / Brennstoffe

Representative evidence:

- fossil energy-carrier origin and processing
- crude oil / natural gas as mixtures of hydrocarbons and raw materials for chemical industry
- alkane / alkene / alkyne structure, homologous series, formulae, isomerism, and basic reactions
- fractional distillation, cracking, combustion, substitution, addition, and bromine evidence for multiple bonds
- ecological, economic, and ethical evaluation of fossil and renewable energy carriers
- use of researched thermodynamic data for fuel and energy-source evaluation

Judgment:

- this is a genuine shared package surface
- the current canonical atoms already cover the key assessable routines
- broad source rows often combine structure, process, use, and evaluation in one official line, so forcing one atom per line would overfit source wording

### Einfuehrung organische Verbindungen

Representative evidence:

- organic / inorganic distinction and relevance of organic compounds
- alkanes, alkenes, alkynes, alcohols, aldehydes, ketones, carboxylic acids, esters, amines, and selected biomolecular continuations
- homologous series, molecular formulae, structural formulae, IUPAC naming, and isomerism
- structure-property relations through polarity, intermolecular forces, solubility, and boiling behavior
- functional-group recognition and selected qualitative evidence
- ester formation, hydrolysis, and simple reaction-mechanism references

Judgment:

- this is also a stable shared package surface
- source rows vary strongly in granularity: some are Sek-I organic introductions, others are upper-secondary organic reaction-pathway summaries
- no single missing atomic goal appears across states that is not already represented by the current organic / functional-group / reaction-pathway atoms elsewhere in the canonical Chemistry spine

## Boundary Decisions

1. Keep `Erdol und Erdgas - Brennstoffe` as a learner-visible package surface.
2. Keep `Einfuehrung organische Verbindungen` as a learner-visible package surface.
3. Treat broad source mappings here as accepted package evidence, not source-coverage debt.
4. Do not add new canonical atoms in this pass.
5. Do not broaden state applicability merely because a source row mentions a package label.
6. Reopen only if a later exact-remapping pass finds repeated source statements for a missing assessable routine, not just repeated package wording.

## Follow-Up

The next horizontal Chemistry review lane is `Energie und Nachhaltigkeit`, because it has the next largest all-state broad-cluster signal and mixes energy, thermodynamics, sustainability, and applied evaluation more strongly than the organic introduction surface.
