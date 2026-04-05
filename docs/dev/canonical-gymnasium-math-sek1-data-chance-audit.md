# Canonical Gymnasium Mathematics: Sek I Data / Chance Audit

Snapshot: `2026-04-05`

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
  - `MV`
  - `SH`
  - `RP`
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

### Mecklenburg-Vorpommern (`MV`)

Observed signal:

- `MV` now contributes a first reviewed early lower-secondary data/chance corridor on the explicit `Klassen 5/6` lane
- the Mecklenburg-Vorpommern source separates
  - `Statistische Erhebungen`
  - `einstufige Zufallsexperimente`
- this makes `MV` a useful pressure test for whether the visible early data/chance surface can absorb both survey/display work and first Laplace-style probability work without forcing a separate early diagram or early-probability package
- `MV` now contributes a first reviewed lower-secondary data/chance corridor on the explicit `Klasse 9` lane
- the Mecklenburg-Vorpommern source separates
  - `Haeufigkeiten, Mittelwerte und Streumasse`
  - `statistische Erhebungen`
- this makes `MV` a useful pressure test for whether the visible `D4` descriptive-statistics surface can absorb both summary measures and survey-design/evaluation residue without forcing a separate survey or critical-statistics package
- `MV` now also contributes a first reviewed later-probability corridor on the explicit `Klasse 10` lane
- the Mecklenburg-Vorpommern source separates
  - `Zufallsexperimente mit und ohne Zuruecklegen`
  - `Zufallsgroessen und Binomialverteilung`
- this confirms that the visible `D3` surface can coexist with the frozen broad `D1-D5` surface for later random-variable residue without forcing a separate visible `D6` package

### Thueringen (`TH`)

Observed signal:

- `TH` now contributes a first reviewed lower-secondary data/chance corridor on the explicit `Klassenstufen 5/6` lane
- the Thueringen source separates
  - `Daten erfassen und darstellen`
  - `statistische Kenngroessen und mit Zufall experimentieren`
- this makes `TH` a useful pressure test for whether the early data surface can coexist with a still-mixed early statistics/chance strip on the broad Sek-I data/chance surface without forcing either a separate early diagram package or a separate early-probability package
- `TH` now also contributes a first reviewed broad `Klassenstufen 7/8` data/chance corridor
- the archived `7/8` source still exposes only one shared `Stochastik` strip
- this confirms that the shared broad Sek-I data/chance surface can absorb a reviewed wide `7/8` lane without forcing a sharper canonical split from source granularity alone
- `TH` now also contributes a first reviewed broad `Klassenstufen 9/10` data/chance corridor
- the archived `9/10` source still exposes only one shared `Stochastik` strip
- this confirms that the same shared broad later Sek-I data/chance surface can absorb a reviewed wide `9/10` lane without forcing a sharper canonical split from source granularity alone

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

## Sachsen-Anhalt JG 7/8 chance corridor connected (`2026-04-03`)

- the ST `JG 7/8` strip `Zufaellige Ereignisse, Haeufigkeiten, Wahrscheinlichkeiten` now points to the existing Laplace / frequency bridge
- the ST `JG 7/8` strip `Mehrstufige Zufallsversuche und Wahrscheinlichkeiten` now points to the visible multi-step random-experiment surface
- the reviewed ST lane therefore confirms the current `D2/D3` split without forcing a new mixed early-probability package

## Sachsen-Anhalt JG 10 random-variables corridor connected (`2026-04-03`)

- the ST `JG10` strip `Zufallsgroessen` now points to the broad visible `Daten und Zufall (Sek I)` surface
- the reviewed ST lane therefore confirms that later Sek-I random-variable residue can stay on the frozen `D1-D5` package surface without forcing a separate visible `D6` package

## Sachsen-Anhalt JG 9 frequency-distributions corridor connected (`2026-04-03`)

- the ST `JG9` strip `Haeufigkeitsverteilungen` now points to the visible `D4` descriptive-statistics surface
- the reviewed ST lane therefore confirms that later Sek-I distribution-comparison residue can stay on the frozen descriptive-statistics package without forcing a separate visible histogram or frequency-distribution package


## Rheinland-Pfalz Klassenstufen 9 und 10 data/chance corridor connected (`2026-04-03`)

- the broad RP `Klassenstufen 9 und 10: Daten und Zufall` anchor now carries a reviewed split into `Vierfeldertafeln, zweistufige Zufallsexperimente` and `Wahrscheinlichkeiten durch Simulationen`
- the first strip points to the visible multi-stage-experiment surface
- the second strip points to the visible probability-from-frequencies bridge
- the RP lane therefore confirms the visible Sek-I chance surface without forcing a new visible later random-variable package

## Saarland Klassenstufe 7 data/chance corridor connected (`2026-04-04`)

- the broad SL `Klassenstufe 7: Daten und Zufall` anchor now carries a first reviewed corridor on the shared Sek-I data/chance surface
- the current Saarland grade-7 source still exposes only one shared data/chance strip
- this confirms that the shared broad Sek-I data/chance surface can absorb an explicit reviewed class-7 lane without forcing a sharper state-local split from source granularity alone
## Saarland Klassenstufe 8 data/chance corridor connected (`2026-04-04`)

- the broad SL `Klassenstufe 8: Daten und Zufall` anchor now carries a first reviewed corridor on the shared Sek-I data/chance surface
- the current Saarland grade-8 source still exposes only one shared data/chance strip
- this confirms the shared broad Sek-I data/chance surface can absorb an explicit reviewed class-8 lane without forcing a sharper state-local split
## Saarland Klassenstufe 9 data/chance corridor connected (`2026-04-04`)

- the broad SL `Klassenstufe 9: Daten und Zufall` anchor now carries a first reviewed corridor on the shared Sek-I data/chance surface
- the current Saarland grade-9 source still exposes only one shared data/chance strip
- this confirms the shared broad Sek-I data/chance surface can absorb an explicit reviewed class-9 lane without forcing a sharper state-local split

## Saarland Klassenstufe 10 data/chance corridor connected (`2026-04-04`)
- the broad SL `Klassenstufe 10: Daten und Zufall` anchor now carries a first reviewed corridor on the shared Sek-I data/chance surface
- the current Saarland grade-10 source still exposes only one shared data/chance strip
- this confirms the shared Sek-I data/chance surface can absorb an explicit reviewed grade-10 lane without forcing a sharper state-local split

## Additional reviewed nationwide evidence (`BW`, `BY`, `SH`)

### Baden-Wuerttemberg (`BW`)

Observed signal:

- the reviewed Baden-Wuerttemberg lower-secondary lane already carries explicit `3.1.5`, `3.2.5`, and `3.3.5` widening steps on the shared Sek-I data/chance spine
- `3.1.5 Daten und Zufall` now bridges reviewed early data leaves for frequencies, arithmetic mean, and critical diagram reading
- `3.2.5 Daten und Zufall` now bridges reviewed later descriptive-statistics and Laplace work
- `3.3.5 Daten und Zufall` now bridges reviewed later conditional-probability, four-field, stochastic-independence, random-variable, and binomial surfaces
- together this confirms that the visible `D1-D5` surface can absorb the Baden-Wuerttemberg lane without forcing another package split

### Bayern (`BY`)

Observed signal:

- the reviewed Bavaria retained gymnasium lane now already reaches the visible Sek-I data/chance surface across `M5-M10`
- the active BY mappings now cover simple counting, frequencies, arithmetic mean, descriptive statistics with quartiles and boxplots, Laplace situations, linked events with Vierfelderstrukturen, tree diagrams, simulation, and conditional-structure work
- together this keeps Bavaria on the current `D1-D5` package surface instead of forcing a new nationwide data/chance pass

### Schleswig-Holstein (`SH`)

Observed signal:

- Schleswig-Holstein no longer only serves as the original third-state validation lane; the lower-secondary source snapshot is now fully refined across `5/6` and `7/8/9` on `Daten und Zufall`
- the active SH mappings now cover early statistical surveys, simple combinatorics, one-stage random experiments, frequencies, probability, multi-stage random experiments, quartiles / boxplots, and data-comparison work
- there are now no remaining unmapped SH Sek-I source atoms or source clusters in the active data/chance-owning lane; the remaining mismatch is broad-source residue, not a missing canonical package

## Nordrhein-Westfalen lower-secondary data/chance corridor connected (`2026-04-05`)

Observed signal:

- the active Nordrhein-Westfalen lower-secondary source snapshot now also carries explicit reviewed data/chance corridors from `2.3`, `2.4.1`, and `2.4.2`
- the mapped NRW lower-secondary lane now covers early statistical data collection and representation, first measures of data, one- and two-stage random experiments, Laplace-based probability, simulation, critical reading of statistical representations, conditional probability, stochastic independence, and combinatorics
- the compiled canonical applicability now keeps `DE-NW` on the shared `Daten und Zufall (Sek I)` root together with the visible `D1`, `D2`, `D3`, `D4`, and `D5` package handles
- the Nordrhein-Westfalen data/chance cell can therefore now be treated as resolved on topic level

## Berlin / Brandenburg lower-secondary data/chance corridors connected (`2026-04-05`)

Observed signal:

- the active shared BE/BB lower-secondary source snapshots now also carry explicit reviewed data/chance corridors from the Sek-I `Daten und Zufall` surface on Niveaustufen `E-H`
- the mapped Berlin and Brandenburg lower-secondary lanes now cover statistical surveys and samples, diagram work with frequencies and simple data measures, boxplots / histograms / descriptive-statistics reading, survey critique and manipulation detection, Laplace-oriented probability reasoning, tree/vierfelder-based conditional structure, and explicit combinatorial probability bridges
- the compiled canonical applicability can therefore keep both `DE-BE` and `DE-BB` on the shared `Daten und Zufall (Sek I)` root together with the visible `D1`, `D2`, `D3`, `D4`, and `D5` package handles
- the Berlin and Brandenburg data/chance cells can therefore now be treated as resolved on topic level

## Niedersachsen lower-secondary data/chance corridor connected (`2026-04-05`)

Observed signal:

- the active Niedersachsen lower-secondary source snapshot now also carries an explicit reviewed data/chance corridor from the five real Lernbereiche `Planung und Durchfuehrung statistischer Erhebungen`, `Masszahlen statistischer Erhebungen`, `Wahrscheinlichkeit`, `Ein- und mehrstufige Zufallsversuche`, and `Baumdiagramme und Vierfeldertafeln`
- the mapped Niedersachsen lower-secondary lane now covers survey planning and data preparation, chart/frequency work, simple descriptive-statistics measures, probability as a model of relative frequencies, Laplace reasoning, simulation, multi-stage tree-diagram work, and vierfelder-linked-event interpretation
- the compiled canonical applicability can therefore keep `DE-NI` on the shared `Daten und Zufall (Sek I)` root together with the visible `D1`, `D2`, `D3`, and `D4` package handles, while the NI source still does not force a separate new canonical package beyond the frozen `D1-D5` cut
- the Niedersachsen data/chance cell can therefore now be treated as resolved on topic level

## Coverage checkpoint (`2026-04-05`)

- `NI` now joins `BE`, `BB`, `BW`, `BY`, `NW`, and `SH` together with the already reviewed `HB`, `HH`, `HE`, `MV`, `RP`, `SL`, `SN`, `ST`, and `TH` lanes as resolved against the frozen `D1-D5` package surface
- the nationwide data/chance row is therefore fully resolved once across all `16` states and is no longer blocked by package design or by state-lane breadth debt
- the next nationwide math move should therefore no longer be another Sek-I data/chance sweep; it should shift to applicability, learner-facing scope stabilization, and the broader `P6/F6` cutover work
