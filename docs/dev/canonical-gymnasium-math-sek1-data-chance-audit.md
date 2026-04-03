# Canonical Gymnasium Mathematics: Sek I Data / Chance Audit

Snapshot: `2026-04-03`

Purpose:

- review the current canonical `Sek I Daten / Zufall` inventory before more bundeslandwise widening
- use already reviewed `HB` and `HH` Sek-I evidence to test whether the current canonical cuts are pedagogically stable
- define the next canonical work packages for `Sek I Daten / Zufall`

## Scope

In scope:

- the canonical Sek-I data/chance topic surface in
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- the already reviewed lower-secondary source and mapping evidence from
  - `HB`
  - `HH`
  - `SH`
  - `SN`
- `ST`

Out of scope:

- full bundesland completion
- direct canonical JSON refactoring in this step
- learner-facing composition views

## Reviewed source evidence

### Hamburg (`HH`)

Reviewed lower-secondary source anchors exist in three bands:

1. `J6 Daten und Zufall`
2. `J8 Daten und Zufall`
3. `J10 Daten und Zufall`

Observed signal:

- `HH` confirms that data/chance is a stable, visible lane across the whole Sek-I progression
- current reviewed `HH` evidence is still broad; it is strong enough for package validation, but not yet for fine atomic forcing

### Schleswig-Holstein (`SH`)

Reviewed lower-secondary source and mapping evidence is now explicit enough for package validation:

1. `Jahrgangsband 5/6: Daten und Zufall`
   - statistische Erhebungen
   - kombinatorische Fragestellungen
   - einstufige Zufallsexperimente

2. `Jahrgangsband 7/8/9: Daten und Zufall`
   - Haeufigkeit
   - Wahrscheinlichkeit
   - mehrstufige Zufallsexperimente
   - beschreibende Statistik
   - Spannweite, Quartile und Boxplots
   - Datenverteilungen vergleichen und deuten

Observed signal:

- `SH` validates that `D4` is not just an appendix to general probability work, but a visible later Sek-I package of its own
- `SH` also stabilizes the split between `D2`, `D3`, and `D4` more clearly than `HB` and `HH` alone
- the early `5/6` lane still keeps combinatorics adjacent to first data/chance work, so `D5` should remain an explicit open decision rather than being silently absorbed

### Bremen (`HB`)

Reviewed lower-secondary data/chance corridors already exist as broad strips:

1. `J5/6 Stochastik`
   - lists
   - diagrams
   - means
   - first random experiments

2. `J7/8 Stochastik`
   - distributions
   - Laplace
   - two-stage random experiments

3. `J9 Stochastik`
   - combinatorics
   - four-field tables

Observed signal:

- `HB` supports a progression from early data routines toward probability models and then toward structured multi-step and conditional settings
- `HB` strongly suggests that combinatorics / four-field-table work should not be hidden inside a diffuse broad statistics package

### Sachsen (`SN`)

Reviewed lower-secondary source and mapping evidence is now explicit in three later Sek-I lanes:

1. `K8 Lernbereich 2 Zufallsversuche`
   - Ereignisse und Laplace-Wahrscheinlichkeiten
   - Baumdiagramme
   - Simulationen
   - Abzaehlprobleme

2. `K10 Lernbereich 2 Diskrete Zufallsgroessen`
   - Wahrscheinlichkeitsverteilungen
   - Stabdiagramme und Histogramme
   - Wahrscheinlichkeiten mit `genau/mindestens/hoechstens k`
   - Pfadregeln und Abzaehlverfahren
   - Verteilungsfunktion
   - Erwartungswert, Varianz, Standardabweichung
   - faire und unfaire Spiele

3. `K9 Lernbereich 4 Auswerten von Daten`
   - Modalwert, Median, arithmetisches Mittel
   - Spannweite, Varianz, Standardabweichung
   - Klassenbildung und Histogramme
   - typische Fehler und Manipulationen in der Statistik

Observed signal:

- `SN` now also confirms the existing `D2`, `D3`, and `D5` surfaces with an explicit K8 chance-experiment strip
- `SN` adds a real later Sek-I random-variable strip on top of the already frozen `D1-D5` surface
- `SN` now also adds a real later descriptive-statistics strip that sits cleanly on the existing `D4` surface
- `SN` now also adds an earlier K7 data-display strip that still fits the same broad `D4` surface
- the Sachsen K10 strip is still internally mixed between later probability structure, counting bridge, and descriptive-statistics adjacency
- the Sachsen K8 strip is internally mixed between first Laplace work, tree structures, simulation, and counting
- the Sachsen K9 strip is internally mixed between descriptive-statistics routine, histogram work, and critical-reading residue
- the Sachsen K7 strip is internally mixed between diagram forms and first critical reading of statistical data
- together this is strong enough for reviewed corridor mappings, but still not clean enough to force a separate visible canonical `D6` package for discrete random variables or a separate visible critical-statistics package

### Sachsen-Anhalt (`ST`)

Observed signal:

- `ST` now contributes a first reviewed early lower-secondary data lane through `JG 5/6`
- the lane is still broad and splits only into data-display work and measures-of-data work
- both strips fit the existing descriptive-statistics surface
- this confirms that early Sachsen-Anhalt data work does not currently force a separate visible early diagram-reading or measures package

## Current canonical data/chance inventory

The canonical graph is already materially seeded here.

Important existing package handles:

1. early package
   - `Fruehe Daten-, Zufalls- und Zaehlvorstellungen (Sek I)`

2. later package
   - `Spaetere Daten-, Wahrscheinlichkeits- und Statistikvorstellungen (Sek I)`

3. descriptive-statistics package
   - `Kenngroessen von Daten bestimmen und interpretieren`
   - `Beschreibende Statistik mit Quartilen, Boxplots und Verteilungen (Sek I)`

4. probability / experiment packages
   - `Laplace-Wahrscheinlichkeiten und relative Haeufigkeiten`
   - `Zusammengesetzte Zufallsexperimente modellieren und simulieren`
   - atoms for `Baumdiagramme`, `Pfadregeln`, simulation

5. top-level package
   - `Daten und Zufall (Sek I)`

## Audit judgment

The canonical data/chance topic is not missing a foundation.
The main packaging decision is now materially stabilized: `HB`, `HH`, and especially `SH` support `D1-D4` as a workable nationwide cut.

Main problem:

- the current top-level topic mixes
  - early data routines,
  - later probability,
  - multi-stage experiment structure,
  - and descriptive statistics
  without exposing the package boundaries clearly enough for state-by-state validation

This is therefore primarily a packaging-and-cut problem, not first a missing-content problem.

## Findings

### 1. Early data routines are present but not visibly separated enough from later probability

The canonical graph already has:

- absolute / relative frequencies
- diagrams
- arithmetic mean
- first random experiments

This is good.
But for topic-first steering, these should become a visibly own package:

- collecting, displaying, and interpreting data
- first random situations

### 2. Laplace / relative-frequency work is pedagogically real and should remain explicit

`HB J7/8` clearly supports a package around:

- distributions
- Laplace
- first probability reasoning

The canonical graph already contains this material, but it sits partly spread across the early and later mixed package handles.

### 3. Multi-stage experiments are already a strong canonical unit

This part looks healthier:

- `Zusammengesetzte Zufallsexperimente modellieren und simulieren`
- `Baumdiagramme und Pfadregeln`
- simulation

This should stay an explicit later package.

### 4. Descriptive statistics is present, but its relation to the rest is too implicit

The canonical graph already includes:

- median
- quartiles
- boxplots
- comparing distributions

That is strong.
But at the package level it is still not clear enough whether descriptive statistics is:

- just an appendix to probability
- or a full own later Sek-I subpackage

The reviewed state evidence points to the second reading.

### 5. Combinatorics / four-field-table work deserves an explicit decision

`HB J9` gives an important signal:

- combinatorics
- four-field tables

This does not yet force a large new canonical wave, but it does require a packaging decision:

- either these stay inside the multi-stage / conditional package
- or they become a visible subpackage of later probability structure

That decision should be made explicitly, not by drift.

## Proposed canonical work packages

For `Sek I Daten / Zufall`, use these work packages:

1. `D1 Early data routines and first random experiments`
   - collecting data
   - tables / diagrams
   - absolute / relative frequencies
   - arithmetic mean
   - first simple random situations

2. `D2 Laplace ideas and probability from frequencies`
   - probability notions
   - relative frequency as empirical bridge
   - Laplace settings

3. `D3 Multi-stage experiments, tree diagrams, conditional structure`
   - tree diagrams
   - path rules
   - simulations
   - four-field-table adjacency

4. `D4 Descriptive statistics and data comparison`
   - median
   - quartiles
   - boxplots
   - compare distributions

5. `D5 Combinatorics / structured counting bridge`
   - only if the reviewed state evidence shows this repeatedly enough
   - otherwise keep it attached to `D3`

## Recommendation

Do not widen more bundesland mappings on Sek-I data/chance before one canonical pass answers these questions:

1. Should `D1` become a clearly visible own canonical subcluster?
2. Should `D4 descriptive statistics` become a more explicit later subcluster?
3. Should combinatorics / four-field-table work remain inside `D3`, or should there be a visible `D5` bridge package?

## Recommended next concrete step

Run one canonical design step only on:

## Sachsen K10 random-variable and K9 descriptive-statistics corridors connected (`2026-04-03`)

- `SN K10 Lernbereich 2 Diskrete Zufallsgroessen` now points to the broad visible `Daten und Zufall (Sek I)` surface
- the split Sachsen source strips there now separate
  - distributions of discrete random variables,
  - event probabilities with path rules / counting procedures / distribution function,
  - expected value / variance / standard deviation / fair games
- `SN K9 Lernbereich 4 Auswerten von Daten` now also points to the visible `D4` descriptive-statistics surface
- `SN K7 Lernbereich 4 Vernetzung: Darstellen von Daten` now also points to the visible `D4` descriptive-statistics surface
- the split Sachsen source strips there now separate
  - Lageparameter,
  - Streuungsmasse und Histogramme,
  - kritische Beurteilung statistischer Darstellungen
- the earlier Sachsen K7 strip intentionally stays broad on the same `D4` surface instead of forcing a separate visible diagram-reading package
- the later probability strips intentionally stay on broad existing `D3` and `D4`-adjacent package targets
- the later descriptive-statistics strips intentionally stay on broad existing `D4` targets instead of forcing a new visible histogram or manipulation package
- together this confirms reviewed late-Sek-I residue, but still does not justify a new visible canonical random-variable package beyond `D1-D5`

1. `D1 Early data routines and first random experiments`
2. `D2 Laplace ideas and probability from frequencies`
3. `D3 Multi-stage experiments, tree diagrams, conditional structure`
4. `D4 Descriptive statistics and data comparison`

Why this cut:

- `HB` and `HH` already provide enough reviewed evidence for the broad progression
- the package decision matters more right now than adding lots of new atoms
- it keeps combinatorics / four-field-table work open as an explicit follow-up decision instead of forcing it too early

## Exit criteria for this audit

This topic audit is complete when:

1. the canonical subpackage boundaries above are either accepted or revised
2. the canonical graph has a stable Sek-I data/chance packaging
3. reviewed `HB` and `HH` evidence can be described as aligned to the revised packaging or intentionally broader because of source granularity
4. it is clear whether combinatorics / four-field-table work stays inside `D3` or deserves a visible `D5` package
5. at least one reviewed third-state lane beyond `HB` and `HH` confirms whether `D4` really behaves like an explicit later package

## Design step executed (`2026-04-01`)

The canonical packaging step for `Sek I Daten / Zufall` is now executed.

Accepted package cut:

1. `D1` = `Fruehe Datenroutinen, Haeufigkeiten und Datendeutung (Sek I)`
2. `D2` = `Laplace-Vorstellungen und Wahrscheinlichkeit aus Haeufigkeiten (Sek I)`
3. `D3` = `Mehrstufige Zufallsexperimente, Baumdiagramme und bedingte Struktur (Sek I)`
4. `D4` = `Beschreibende Statistik und Datenvergleich (Sek I)`

What changed in the canonical decision:

- the broad mixed `J6 Prozentrechnung und Daten` corridor is no longer pulled wholesale into the top-level data/chance package
- instead, the data-facing early atoms now sit in an explicit `D1` package
- `D2` is now a visible probability bridge from frequencies to Laplace settings
- `D3` explicitly carries tree diagrams, simulation, and for now also the adjacency to combined events / four-field structures
- `D4` is now an explicit descriptive-statistics package instead of an implicit appendix

Explicit non-decision kept open:

- `D5` (`Zaehlen / Kombinatorik` as its own visible package) is still intentionally open
- reviewed `HB J9` evidence is strong enough to keep that question alive, but not yet strong enough to force a separate package in this step

Resulting next step:

1. realign reviewed `HB` and `HH` lower-secondary data/chance mappings to `D1-D4`
2. only after that decide whether later reviewed state evidence forces an explicit `D5`

## Third-state validation executed (`2026-04-01`)

`SH` now serves as the first external validation lane beyond `HB` and `HH`.

What `SH` confirms:

1. `D1` remains a legitimate early package, even when simple combinatorics sits adjacent to first data/chance work
2. `D2` and `D3` can stay separated from later descriptive-statistics work
3. `D4` is pedagogically real as a visible later package because the source lane exposes
   - `beschreibende Statistik`
   - `Spannweite, Quartile und Boxplots`
   - `Datenverteilungen vergleichen und deuten`

Resulting topic status:

- `D1-D4` are now not only canonical design decisions but also externally validated by a third reviewed state lane
- the last package decision `D5` (`Zaehlen / Kombinatorik` as a separate visible bridge) is now executed

Recommended next step after this validation:

1. treat `Sek I Daten / Zufall` as canonically stable enough to freeze further package churn
2. use additional state lanes only for mapping and residue control, not to reopen the `D1-D5` cut without strong contrary evidence

## D5 decision executed (`2026-04-01`)

The open `D5` question is now resolved in favour of a visible package.

Why this decision is now justified:

- `HB` contributes a reviewed later Sek-I signal via `J9 Stochastik: Kombinatorik und Vierfeldertafeln`
- `SH` keeps combinatorial questions explicitly adjacent to early data/chance work in `Jahrgangsband 5/6`
- the Hessen lower-secondary source lane contributes an explicit later atom `Abzaehlstrategien nutzen` with direct probability use

Canonical consequence:

1. `D5` is now visible as `Zaehlen, Kombinatorik und Wahrscheinlichkeitsbruecken (Sek I)`
2. the package currently bundles
   - the existing early atom for simple counting principles
   - one later bridge atom for combinatorial reasoning in probability situations
3. `D3` keeps four-field tables, conditional structure, and multi-step random experiments
4. `D5` does not absorb those `D3` structures; it stays a counting/probability bridge

Result:

- `Sek I Daten / Zufall` now has a stable visible `D1-D5` package surface
- the topic should now be treated as materially packaged, with later work focused on mapping quality rather than package invention

## Sachsen-Anhalt JG 5/6 data corridor connected (`2026-04-03`)

- the ST `JG 5/6` strips `Erfassen, Darstellen und Auswerten von Daten` and `Kenngroessen von Daten` now both point to the existing descriptive-statistics surface
- the reviewed ST lane therefore confirms the broad early `D4` packaging without reopening the current Sek-I data/chance cut

