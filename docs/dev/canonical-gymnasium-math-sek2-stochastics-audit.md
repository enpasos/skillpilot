# Canonical Gymnasium Mathematics: Sek II Stochastics Audit

Snapshot: `2026-04-01`

Purpose:

- review the current canonical `Sek II Stochastik` inventory after the lower-secondary, geometry, data/chance, and analysis packaging passes
- use already reviewed upper-secondary state evidence to test whether the current canonical stochastics cuts are pedagogically stable
- define the next canonical work packages for `Sek II Stochastik`

## Scope

In scope:

- the canonical upper-secondary stochastics topic surface in
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- the already reviewed upper-secondary source and mapping evidence from
  - `BB`
  - `BY`
  - `HB`
  - `HH`
- `HE`
- `RP`
- `SH`
- `ST`
- `SN`

Out of scope:

- direct canonical JSON refactoring in this step
- learner-facing composition views
- upper-secondary analysis, analytic geometry, and matrix corridors except where the current stochastics packaging still mixes with them

## Reviewed source evidence

### Hessen (`HE`)

Observed signal:

- `HE` remains the mature donor baseline for Q3 foundations, probability distributions, hypothesis tests, and interval reasoning
- the Hessen lane confirms that the canonical graph already has real material for basic stochastics, conditional structure, distributions, tests, and statistical interpretation

### Bremen (`HB`)

Observed signal:

- `HB` already contributes reviewed `S1` and `S2` corridors
- Bremen pressure-tests the split between foundational stochastics and the later continuation toward binomial distributions, interval reasoning, and hypothesis tests
- several Bremen source atoms are intentionally broad, so the canonical package surface must absorb mixed breadth without forcing artificial pseudo-atoms

### Hamburg (`HH`)

Observed signal:

- `HH` already contributes a reviewed `Modul 5` corridor with an explicit split between `Binomialverteilung` and `Hypothesentests und Normalverteilung`
- Hamburg increases pressure on where normal approximation, interval logic, and test design should sit, because the source packaging mixes them more strongly than an ideal canonical split would

### Rheinland-Pfalz (`RP`)

Observed signal:

- `RP` now adds the first reviewed upper-secondary stochastics corridor on top of the newly activated `Grundfach` / `Leistungsfach` snapshot lane
- the Rheinland-Pfalz source separates the stochastics corridor explicitly into:
  - a `Grundfach` strip for probabilities, simulations, and binomial modelling
  - the two `Grundfach` Wahlpflichtfortsetzungen `Schaetzen von Wahrscheinlichkeiten` and `Testen von Hypothesen`
  - `Leistungsfach` strips for conditional probability, binomial distribution, normal approximation, confidence intervals, and hypothesis tests
- Rheinland-Pfalz therefore confirms the frozen visible `ST2-ST5` surface and the explicit `ST3` boundary without forcing another package-level bridge

### Sachsen (`SN`)

Observed signal:

- `SN` now adds a first reviewed upper-secondary stochastics corridor directly on the broad upper snapshot
- the Sachsen Grundkurs split cleanly separates:
  - multistage random experiments, urn models, tree diagrams, simulations, and independence structure
  - Bernoulli chains, binomial distributions, and characteristic values
  - sample-based parameter estimation
  - one-sided and two-sided significance tests
- Sachsen therefore supports the frozen visible `ST2-ST5` surface without forcing another package-level bridge

### Sachsen-Anhalt (`ST`)

Observed signal:

- `ST` now adds a first reviewed upper-secondary stochastics corridor on top of the newly mapped `GA` / `EA` snapshot lane
- the Sachsen-Anhalt source separates the corridor into:
  - `GA` conditional probability and binomial distribution
  - `EA` conditional probability, a mixed binomial/normal-distribution strip, and a later inferential-statistics strip with confidence intervals
- `ST` therefore pressure-tests both the shared `ST2` / `ST5` surface and the narrow `ST3` boundary without forcing another visible bridge package

## Current canonical stochastics inventory

The canonical graph is already materially seeded here.

Important current package surfaces:

1. `Stochastik, Tests und Statistik (Sek II)`
2. `Wahrscheinlichkeiten und Verteilungen (Sek II)`
3. `Grundlegende Begriffe und Methoden der Stochastik`
4. `Stichprobenkennwerte und Binomialverteilungen`
5. `Normalverteilung als Approximation der Binomialverteilung (LK)`
6. `Hypothesentests`
7. `Prognose- und Konfidenzintervalle`
8. `Wahrscheinlichkeitsverteilungen, Hypothesentests und Statistik`

## Audit judgment

The canonical Sek-II stochastics topic is not missing a backbone.
The main risk is packaging, not first missing content.

The most relevant tensions are:

1. foundations, conditional structure, simulation, and combinatorics must stay clearly separated from later inference corridors
2. binomial distribution work, sample statistics, and normal approximation are not yet checked explicitly enough as a coherent shared-core versus LK-depth package surface
3. hypothesis-test design, interval reasoning, and general statistical interpretation may still be mixed more broadly than ideal in the current visible cluster surface

## Findings

### 1. Foundational Q3 stochastics should stay visible as a separate package

The reviewed state evidence supports a stable common entry corridor for:

- outcome spaces and events
- tree diagrams and conditional probabilities
- simulations and critical reading of data-based claims
- combinatorial counting as a stochastic bridge

This package surface should remain explicit and should not be absorbed into later test or interval corridors.

### 2. Binomial-distribution work is a real shared-core package surface

The reviewed lanes support a shared visible corridor for:

- sample statistics
- Bernoulli/binomial modelling
- distribution-based reasoning in standard upper-secondary contexts

This is not just a Hessen artifact. It is pressure-tested by both Bremen and Hamburg.

### 3. Normal approximation should be checked as a boundary question, not hidden as accidental residue

`Normalverteilung als Approximation der Binomialverteilung (LK)` already exists.
The open question is not whether this content exists, but whether the current visible packaging makes the GK-core versus LK-depth boundary pedagogically clear enough.

### 4. Test design and interval reasoning should likely remain distinct visible continuations

The current canonical graph already has:

- `Hypothesentests`
- `Prognose- und Konfidenzintervalle`

That distinction is useful and should be treated as materially real.
The open question is whether the broader summarizing cluster surface still bundles these continuations too loosely with general statistics and distribution work.

### 5. Broad upper-secondary stochastics summary clusters need a cleaner steady-state role

The graph currently exposes broad surfaces such as:

- `Stochastik, Tests und Statistik (Sek II)`
- `Wahrscheinlichkeiten und Verteilungen (Sek II)`
- `Wahrscheinlichkeitsverteilungen, Hypothesentests und Statistik`

These are useful as summary or corridor nodes, but the final steady-state package surface should make it clearer which visible branches correspond to:

- foundations
- distributions
- normal approximation / LK-depth
- tests
- intervals and statistics

## Proposed canonical work packages

For `Sek II Stochastik`, use these work packages:

1. `ST1 Foundations, conditional structure, simulations, and combinatorial bridges`
   - stochastic basic concepts
   - tree diagrams, field tables, conditional probabilities
   - simulations and critical reading of data-based claims
   - combinatorial counting as a bridge into probability models

2. `ST2 Sample statistics, Bernoulli modelling, and binomial distributions`
   - random variables and distributions
   - binomial modelling
   - expectation and spread in the shared core where appropriate

3. `ST3 Normal approximation and advanced distribution interpretation`
   - normal approximation of binomial distributions
   - explicit GK versus LK boundary handling

4. `ST4 Hypothesis tests and test evaluation`
   - hypotheses
   - test variables and decision rules
   - Type-I / Type-II reasoning where canonically appropriate
   - evaluation of test outcomes

5. `ST5 Prediction intervals, confidence intervals, and sample planning`
   - interval construction
   - interval interpretation in context
   - sample-size planning and statistical communication

## Design step executed

The first canonical Sek-II stochastics packaging pass is now in place.

Accepted package surface:

1. `ST2` is now visible as `Stichprobenkennwerte, Bernoulli-Modelle und Binomialverteilungen`.
2. `ST4` is now visible as `Hypothesentests und Testbewertung`.
3. `ST5` is now visible as `Prognoseintervalle, Konfidenzintervalle und Stichprobenplanung`.
4. `ST3` remains an explicit LK-boundary marker via `Normalverteilung als Approximation binomialer Modelle (LK)`.

Important boundary decision:

1. the foundational `ST1` package remains stable and is not repackaged in this step
2. normal approximation is kept explicit as a later bridge and is not absorbed into the ordinary test or interval corridors
3. this pass sharpens visible package semantics without creating a new atomic wave

## First reviewed realignment judgment

The reviewed `BB` / `BY` / `HB` / `HH` / `HE` / `SH` / `SN` / `ST` pressure test does not force another canonical package split.

Observed result:

1. `HB` now aligns more cleanly with the revised visible surface:
   - foundations/distribution breadth sit under the foundational probability/distribution corridor
   - the later binomial corridor now lands on the explicit `ST2` package
2. `BB`, `BY`, `RP`, `SH`, `SN`, and `ST` now fit the frozen `ST2-ST5` surface cleanly enough that no additional package-level bridge is needed
3. `HE` remains exact enough that no package-level correction is needed
4. the only visible hybrid residue is `HH Modul 5.2 Hypothesentests und Normalverteilung`

Accepted judgment for the HH hybrid:

1. keep the broad parent mapping for `HH Modul 5.2` on the reviewed summary surface
2. do **not** introduce a new visible `ST3/ST4` bridge package just for this one hybrid source corridor
3. rely on the already reviewed child mappings to preserve the semantic split:
   - hypothesis-test atoms stay on `ST4`
   - normal-approximation atoms stay on `ST3`

Interpretation:

The current `HH` residue is a source-granularity issue, not yet a canonical gap.
One mixed parent corridor is not enough justification to widen the canonical graph again.

## Recommendation

Do not widen more bundesland mappings on Sek-II stochastics before the revised visible package surface is pressure-tested against reviewed evidence.

Open questions now concentrated here:

1. Is `ST3` only a boundary marker for LK-depth, or will later reviewed residue from additional states force a broader visible bridge package?
2. Are the broad Q3 summary clusters now stable enough as corridor nodes beyond the currently reviewed `BB` / `BY` / `HB` / `HH` / `HE` / `SH` lanes?
3. Do additional reviewed state lanes force a sharper separation between foundational distribution work and later inference work?

## Recommended next concrete step

Freeze package churn here unless another reviewed lane exposes a concrete shared gap.

If the next upper-secondary topic is opened, prefer:

1. `Sek II Analytische Geometrie / Vektoren`

Keep `ST1` stable unless a later reviewed lane reveals that the foundational Q3 package still leaks too much later inference material.

## Exit criteria for this audit

This topic audit is complete when:

1. the canonical subpackage boundaries above are either accepted or revised
2. the canonical graph has a stable Sek-II stochastics packaging
3. reviewed `BB`, `BY`, `HB`, `HH`, `HE`, `RP`, and `SH` evidence can be described as aligned to the revised packaging or intentionally broader because of source granularity
4. it is clear whether normal approximation, tests, and interval reasoning require further visible separation in the canonical graph

### Saarland (`SL`)

Observed signal:

- `SL` now adds a first reviewed upper-secondary stochastics corridor on top of the newly mapped `Einführungsphase`, `Hauptphase G-Kurs`, and `Hauptphase Leistungskurs` snapshot lane
- the Saarland source separates the corridor into:
  - `G-Kurs` strips for probabilities / conditional probability, binomial distribution, and a later discrete-random-variable / characteristic-value continuation
  - `Leistungskurs` strips for probabilities / conditional probability, binomial distribution, discrete random variables, normal distribution, and hypothesis tests
- Saarland therefore confirms the frozen visible `ST2-ST5` surface and the explicit `ST3` boundary without forcing another package-level bridge
