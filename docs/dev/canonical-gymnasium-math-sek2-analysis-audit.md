# Canonical Gymnasium Mathematics: Sek II Analysis Audit

Snapshot: `2026-04-01`

Purpose:

- review the current canonical `Sek II Analysis` inventory after the lower-secondary packaging passes
- use already reviewed upper-secondary state evidence to test whether the current canonical analysis cuts are pedagogically stable
- define the next canonical work packages for `Sek II Analysis`

## Scope

In scope:

- the canonical upper-secondary analysis topic surface in
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- the already reviewed upper-secondary source and mapping evidence from
  - `BB`
  - `BE`
  - `BW`
  - `BY`
  - `HB`
  - `HH`
  - `HE`
  - `NI`
  - `NW`
  - `SN`
  - `SH`

Out of scope:

- direct canonical JSON refactoring in this step
- learner-facing composition views
- upper-secondary stochastics, analytic geometry, and matrix corridors except where the current analysis packaging still mixes with them

## Reviewed source evidence

### Hessen (`HE`)

Observed signal:

- `HE` remains the mature donor baseline for E-phase analysis and later upper-secondary analysis progression
- the Hessen lane confirms that the canonical graph already has real material for derivative entry, function investigation, model work, and integral reasoning

### Brandenburg and Berlin (`BB`, `BE`)

Observed signal:

- the currently reviewed `BB` and `BE` upper-secondary lanes already connect into the shared E-analysis baseline
- they validate a stable common core, but they do not yet force many additional visible subpackages on their own

### Bremen (`HB`)

Observed signal:

- `HB` already connects reviewed upper-secondary analysis work into the shared E-analysis baseline and the broad integral corridor
- Bremen therefore pressure-tests late analysis packaging, especially around the transition from derivative work into integral work

### Hamburg (`HH`)

Observed signal:

- `HH` already connects reviewed upper-secondary analysis work into the shared E-analysis baseline and the broad integral corridor
- the Hamburg lane increases pressure on whether the current visible split between E-foundations, model corridors, and the integral corridor is already sufficient

### Nordrhein-Westfalen (`NW`)

Observed signal:

- `NW` now adds a reviewed mixed upper-secondary analysis lane with:
  - an explicit E-phase derivative and first-curve parent
  - a broad GK follow-on that mixes optimisation, exponential work, and integral understanding
  - narrow LK integral strips and a late LK function-family strip
- Nordrhein-Westfalen confirms that the visible `AN2-AN4` surface can absorb both broader parents and narrower late strips without forcing a new visible `AN5` package.

### Sachsen (`SN`)

Observed signal:

- `SN` now adds a first reviewed upper-secondary analysis corridor on the broad upper snapshot itself
- the Sachsen Grundkurs split cleanly separates:
  - derivative entry and derivative-based investigation
  - model-heavy `e`/`ln`/trigonometric / regression work
  - integral reconstruction, Hauptsatz, and area interpretation
- Sachsen therefore supports the frozen visible `AN2-AN4` surface directly and does not create new pressure toward a separate visible `AN5` package

## Current canonical analysis inventory

The canonical graph is already materially seeded here.

Important current package surfaces:

1. `Grundlagen der Analysis und mathematische Modelle`
2. `Einstieg Ableitungsbegriff und Aenderungsraten`
3. `Ableitungen zur Funktionsuntersuchung und Optimierung nutzen`
4. `Natuerliche Exponentialfunktion, Logarithmus und Modelle`
5. `Periodische Funktionen und trigonometrische Ableitungen`
6. `Integralrechnung und Differenzialgleichungen (Sek II)`
7. `Funktionenscharen und Parameteruntersuchungen (Sek II)` inside the broader Q4 mixed corridor

## Audit judgment

The canonical Sek-II analysis topic is not missing a backbone.
The main risk is packaging, not first missing content.

Three tensions are currently most relevant:

1. shared GK core versus LK-only enrichment is not yet checked explicitly enough
2. the integral corridor still looks broader than ideal because integral core and differential-equation continuation are bundled together
3. Q4 parameter families currently sit inside a mixed corridor together with non-analysis material

## Findings

### 1. E-phase foundations and derivative entry should stay visible as a separate upper-secondary entry package

The reviewed state evidence supports a stable common entry corridor for:

- basic analysis foundations
- derivative entry
- early function investigation

This package surface should be treated as materially real, not as only a Hessen artifact.

### 2. Differential calculus and model corridors need an explicit shared-core check

The current canonical analysis surface already distinguishes between:

- derivative / optimisation work
- exponential and logarithmic models
- periodic / trigonometric model work

But the current state of the graph still needs an explicit audit of whether these visible cuts separate shared upper-secondary core from LK-depth consistently enough.

### 3. The current integral corridor is probably too broad for final steady state

`Integralrechnung und Differenzialgleichungen (Sek II)` is already useful as a visible corridor.
But it likely still bundles:

- integral concept and reconstruction
- area and context interpretation
- later continuation toward differential equations

more broadly than we will want in the steady-state canonical packaging.

### 4. Q4 function families should not stay hidden inside a mixed late corridor forever

`Funktionenscharen und Parameteruntersuchungen (Sek II)` already exists as a reviewed analysis subtree.
The open question is whether that is already enough as a visible analysis surface, or whether the broader mixed Q4 corridor still hides too much analysis-specific structure.

## Proposed canonical work packages

For `Sek II Analysis`, use these work packages:

1. `AN1 E-phase analysis foundations and derivative entry`

## Residue update: `NI` late-continuation pressure test

The reviewed `NI` upper-secondary lane adds the strongest current pressure test for the open late-continuation question because it contains explicit evidence for both sides of the corridor:

1. differential-equation continuation and solution checking
2. function families and parameter fitting

Current reviewed `NI` mapping evidence does not force a new visible `AN5` package:

1. differential-equation continuation items already land on a shared canonical differential-equation target
2. parameter-fitting and function-family items already land on distinct canonical late-analysis targets

Judgment:

1. keep the visible package surface at `AN2-AN4`
2. treat `AN5-late-continuation` as `accept` for now
3. reopen only if another reviewed lane shows a shared late-continuation split that cannot be absorbed by the existing atomic targets
   - basic analysis foundations
   - derivative entry
   - first function investigation routines

2. `AN2 Differential calculus, investigation, and optimisation`
   - derivative-based analysis
   - monotonicity, extrema, optimisation
   - core shared calculation and interpretation routines

3. `AN3 Exponential, logarithmic, and periodic models`
   - natural exponential function
   - logarithmic understanding and modelling
   - periodic / trigonometric model work

4. `AN4 Integral concepts, reconstruction, and context interpretation`
   - integral concept
   - bestandsrekonstruktion / Hauptsatz bridges
   - area and context interpretation

5. `AN5 Differential equations and late parameter families`
   - differential-equation continuation
   - function families / parameter investigations
   - keep explicitly open until the shared-core versus LK-depth boundary is tested harder

## Design step executed

The first canonical Sek-II analysis packaging pass is now in place.

Accepted package surface:

1. `AN2` is now visible as `Differentialrechnung, Untersuchung und Optimierung`.
2. `AN3` is now visible as `Exponential-, logarithmische und periodische Modelle (Sek II)`.
3. `AN4` is now visible as `Integralbegriffe, Rekonstruktion und Kontextdeutung (Sek II)`.

Important boundary decision:

1. the broad integral corridor no longer carries ordinary differential equations directly
2. late continuation stays reachable above `AN4`
3. no separate visible `AN5` package is currently justified; differential-equation continuation and late parameter work are absorbed by the existing late-analysis atoms

## Recommendation

Freeze Sek-II analysis package churn. Additional reviewed state work should only serve residue control, not reopen the package cut without clear contrary evidence.

Open questions now reduced to:

1. Does another reviewed lane expose a shared canonical gap beyond the current late-continuation atoms?
2. Is the shared-core versus LK-depth boundary inside the late continuation corridor still stable under broader reviewed evidence?

## Recommended next concrete step

Do not schedule a dedicated next package step for Sek-II analysis. Keep the current surface frozen and only reopen it if a later validator finding or reviewed lane produces a concrete shared mismatch.

## Exit criteria for this audit

This topic audit is complete when:

1. the canonical subpackage boundaries above are either accepted or revised
2. the canonical graph has a stable Sek-II analysis packaging
3. reviewed `BB`, `BE`, `BW`, `BY`, `HB`, `HH`, `HE`, `NI`, `NW`, `SN`, and `SH` evidence can be described as aligned to the revised packaging or intentionally broader because of source granularity
4. the late-continuation question stays frozen unless new reviewed residue forces further canonical restructuring
