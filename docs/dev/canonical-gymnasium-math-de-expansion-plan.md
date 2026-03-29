# Canonical Gymnasium Mathematics DE Expansion Plan

Snapshot: `2026-03-21`

This plan focuses on one target:

- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
  should converge toward reviewed coverage for all `16` German Bundeslaender without cloning canonical goals per state.

The landscape JSON itself should stay pure curriculum data.
Rollout planning, steering, and progress tracking should live next to it, not inside it.

## Persistent control setup

Use three persisted artifacts:

1. plan document
- `docs/dev/canonical-gymnasium-math-de-expansion-plan.md`
- purpose: stable narrative, rollout phases, rules, and exit criteria

2. machine-readable tracker
- `curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json`
- purpose: single source of truth for per-state rollout phase, next step, and lane references

3. quick status view
- `docs/dev/canonical-gymnasium-math-bundeslaender-status.md`
- purpose: easy-to-scan overview for humans
- generation: `python3 scripts/render_canonical_math_bundesland_status.py`

Working rule:

- update the JSON tracker first
- regenerate the Markdown quick view second
- commit both together

This keeps the plan persisted, diffable, and simple to review in PRs.

## Why this setup

This setup keeps concerns separated:

- the canonical math landscape remains didactic source data
- the rollout tracker remains operational metadata
- the quick view remains the simplest place to answer:
  - which states are already on the canonical spine
  - what phase each state is in
  - what the current nationwide implementation score is

It also avoids hiding planning state in a huge curriculum JSON where operational progress would be hard to inspect and easy to forget.

## Progress log

### 2026-03-21 / Step 1 completed

Executed work:

- verified the active five-state mathematics base against actual repo evidence
- archived the first Brandenburg mathematics source bundle:
  - shared BE/BB Sek-I mathematics
  - Brandenburg upper-secondary mathematics
- archived the first Berlin mathematics source bundle:
  - shared BE/BB Sek-I mathematics
  - Berlin upper-secondary mathematics
- created mapping-lane scaffolds for:
  - `DE-BB/lower-secondary`
  - `DE-BB/upper-secondary`
  - `DE-BE/lower-secondary`
  - `DE-BE/upper-secondary`
- reserved source-landscape identifiers for Brandenburg and Berlin mathematics onboarding notes
- moved `DE-BB` and `DE-BE` from `P0` to `P1` in the rollout tracker

Resulting rollout effect:

- the first backlog wave is no longer placeholder-only
- tracked nationwide score rises from `22.8%` to `24.7%`
- the next derivable task is no longer raw source hunting for BB/BE, but source-snapshot creation and provenance activation

### 2026-03-21 / Step 2 completed

Executed work:

- created the first Brandenburg mathematics source snapshots for:
  - Sekundarstufe I structural Gymnasium anchors `J7-J10`
  - gymnasiale Oberstufe phase anchors `E`, `Q1`, `Q2`, `Q3`, `Q4`
- created the first Berlin mathematics source snapshots for:
  - Sekundarstufe I structural Gymnasium anchors `J7-J10`
  - gymnasiale Oberstufe phase anchors `E`, `Q1`, `Q2`, `Q3`, `Q4`
- activated Brandenburg and Berlin in:
  - `source-landscape-registry.json`
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- updated the onboarding notes so the active snapshots and covered anchor ranges are explicit
- moved `DE-BB` and `DE-BE` from `P1` to `P2` in the rollout tracker

Resulting rollout effect:

- Brandenburg and Berlin are no longer only archived-source lanes; they are now real provenance-backed source lanes
- tracked nationwide score rises from `24.7%` to `26.6%`
- states with active snapshots rise from `5/16` to `7/16`
- the next derivable task is now explicit structural-anchor mapping for `DE-BB` and `DE-BE`, not more onboarding setup

### 2026-03-21 / Step 3 completed

Executed work:

- mapped Brandenburg Sek-I Gymnasium year anchors `J7-J10` onto the canonical lower-secondary year spine
- mapped Berlin Sek-I Gymnasium year anchors `J7-J10` onto the canonical lower-secondary year spine
- mapped Brandenburg upper-secondary phase anchors `E`, `Q1`, `Q2`, `Q3`, `Q4` onto the canonical upper-secondary phase spine as structural `partial` bridges
- mapped Berlin upper-secondary phase anchors `E`, `Q1`, `Q2`, `Q3`, `Q4` onto the canonical upper-secondary phase spine as structural `partial` bridges
- kept the structural-anchor step intentionally narrow:
  - no new reviewed corridor claims
  - no broad applicability expansion on the canonical nodes yet
- extended the generated quick view with a direct `P3+` headline metric for structural-anchor coverage

Resulting rollout effect:

- Brandenburg and Berlin now move from `P2` to `P3`
- tracked nationwide score rises from `26.6%` to `29.1%`
- states with structural anchors mapped rise from `5/16` to `7/16`
- the next derivable task is now the first reviewed corridor for each of the shared BE/BB lanes, starting with the lower-secondary functions corridor

### 2026-03-21 / Step 4 completed

Executed work:

- expanded the Brandenburg lower-secondary source snapshot from pure Gymnasium anchors into the first reviewed functions corridor from the shared BE/BB Sek-I source
- expanded the Berlin lower-secondary source snapshot in the same corridor shape
- activated the new Brandenburg and Berlin corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the shared BE/BB lower-secondary functions corridor onto the canonical lower-secondary math spine:
  - mappings and representation changes on Niveaustufe `E`
  - linear-function descriptions, representation changes, and calculations on Niveaustufe `F`
- moved `DE-BB` and `DE-BE` from `P3` to `P4` in the rollout tracker

Resulting rollout effect:

- Brandenburg and Berlin now have a real reviewed lower-secondary corridor, not only structural anchors
- tracked nationwide score rises from `29.1%` to `30.9%`
- states with reviewed corridor rise from `5/16` to `7/16`
- the next derivable task is now the first upper-secondary entry corridor for `DE-BB` and `DE-BE`, followed by the next lower-secondary follow-on corridor

### 2026-03-21 / Step 5 completed

Executed work:

- expanded the Brandenburg upper-secondary source snapshot from pure phase anchors into the first reviewed E-phase analysis entry corridor
- activated the new Brandenburg upper-secondary corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Brandenburg E-phase derivative starter strip onto the canonical upper-secondary math spine:
  - `E.2` introductory derivative surface
  - `E.3` first derivative applications
  - reviewed leaf bridges for rates of change, derivative meaning, derivative graph, derivative rules, tangents, monotonicity, curvature, conditions, and simple extremal problems
- updated the Brandenburg upper-secondary lane notes so the next follow-on work is now a `Q1` follow-on corridor rather than the first `E`-entry cut

Resulting rollout effect:

- Brandenburg now has reviewed corridor coverage on both the lower-secondary shared functions lane and the upper-secondary E-phase analysis entry lane
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Brandenburg total mapping surface rises from `18` to `32` mappings
- the next derivable task is now the matching first upper-secondary entry corridor for `DE-BE`, while Brandenburg can widen from `E` into the first `Q1` follow-on corridor

### 2026-03-21 / Step 6 completed

Executed work:

- expanded the Berlin upper-secondary source snapshot from pure phase anchors into the first reviewed Q1 differential entry corridor
- activated the new Berlin upper-secondary corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Berlin Q1 differential starter strip onto the canonical upper-secondary math spine:
  - `E.2` introductory derivative surface
  - `E.3` first derivative applications
  - reviewed leaf bridges for propedeutic limit use, secant and tangent slopes, rates of change, derivative meaning, derivative graph, rule-based differentiation, monotonicity, inflection points, necessary conditions, and simple extremal problems
- updated the Berlin upper-secondary lane notes so the next follow-on work is now a `Q2` widening step rather than the first `Q1` entry cut

Resulting rollout effect:

- Berlin now has reviewed corridor coverage on both the lower-secondary shared functions lane and the upper-secondary Q1 differential entry lane
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Berlin total mapping surface rises from `18` to `32` mappings
- the next derivable tasks are now the Brandenburg `Q1` follow-on corridor and the Berlin `Q2` follow-on corridor, while the lower-secondary shared lane can stay stable until that upper-secondary widening is secured

### 2026-03-21 / Step 7 completed

Executed work:

- expanded the Brandenburg upper-secondary source snapshot from the first reviewed E-phase derivative strip into the first reviewed Q1 model-functions follow-on corridor
- activated the new Brandenburg Q1 corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Brandenburg Q1 model-functions strip onto the canonical upper-secondary math spine:
  - `E.4` exponential-function surface
  - `E.5` trigonometric-function surface
  - reviewed leaf bridges for natural exponential growth and decay, parameter interpretation, self-derivative behaviour of `e^x`, logarithmic equation solving, exponential modelling, periodic functions, parameter effects, trig derivatives, and periodic modelling
- updated the Brandenburg upper-secondary lane notes so the next follow-on work is now a `Q2` analysis widening step rather than the first `Q1` follow-on cut

Resulting rollout effect:

- Brandenburg now has reviewed corridor coverage on both the lower-secondary shared functions lane and two reviewed upper-secondary corridors on the active analysis/model-function spine
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Brandenburg total mapping surface rises from `32` to `43` mappings
- the next derivable tasks are now the Berlin `Q2` follow-on corridor and the Brandenburg `Q2` analysis follow-on corridor, while the lower-secondary shared lane can remain stable until those upper-secondary widening steps are secured

### 2026-03-21 / Step 8 completed

Executed work:

- expanded the Berlin upper-secondary source snapshot from the first reviewed Q1 differential strip into the first reviewed Q2 integral-calculus follow-on corridor
- activated the new Berlin Q2 corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Berlin Q2 integral strip onto the canonical upper-secondary math spine:
  - `Q1.1` introductory integral surface
  - `Q1.2` first integral applications
  - reviewed leaf bridges for reconstructed stock, stock calculation from rates, geometric Fundamental-Theorem reasoning, antiderivative-based integration, area calculation with definite integrals, and context interpretation of integral terms
- updated the Berlin upper-secondary lane notes so the next follow-on work is now a `Q2` stochastics widening step rather than the first `Q2` analysis cut

Resulting rollout effect:

- Berlin now has reviewed corridor coverage on both the lower-secondary shared functions lane and two reviewed upper-secondary corridors on the active analysis spine
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Berlin total mapping surface rises from `32` to `41` mappings
- the next derivable tasks are now the Brandenburg `Q2` analysis follow-on corridor and the Berlin `Q2` stochastics follow-on corridor, while the lower-secondary shared lane can remain stable until those upper-secondary widening steps are secured

### 2026-03-21 / Step 9 completed

Executed work:

- expanded the Brandenburg upper-secondary source snapshot from the first reviewed `Q1` model-functions strip into the first reviewed `Q2` integral-calculus follow-on corridor
- activated the new Brandenburg `Q2` corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Brandenburg `Q2` integral strip onto the canonical upper-secondary math spine:
  - `Q1.1` introductory integral surface
  - `Q1.2` first integral applications
  - reviewed leaf bridges for upper and lower sums, the definite integral as common limit and reconstructed stock, stock calculation from rates and initial value, geometric Fundamental-Theorem reasoning, antiderivative-based integration, area calculation with definite integrals, and context interpretation of integral terms
- updated the Brandenburg upper-secondary lane notes so the next follow-on work is now a `Q2` stochastics widening step rather than the first `Q2` analysis cut

Resulting rollout effect:

- Brandenburg now has reviewed corridor coverage on both the lower-secondary shared functions lane and three reviewed upper-secondary corridors on the active analysis spine
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Brandenburg total mapping surface rises from `43` to `53` mappings
- the next derivable tasks are now the Berlin `Q2` stochastics follow-on corridor and the Brandenburg `Q2` stochastics follow-on corridor, while the lower-secondary shared lane can remain stable until those upper-secondary widening steps are secured

### 2026-03-21 / Step 10 completed

Executed work:

- expanded the Berlin upper-secondary source snapshot from the first reviewed `Q2` integral strip into the first reviewed `Q2` stochastics follow-on corridor
- activated the new Berlin `Q2` corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Berlin `Q2` stochastics strip onto the canonical upper-secondary math spine:
  - `Q3 Stochastik`
  - `Q3.1` basic stochastics
  - reviewed leaf bridges for Baumdiagramme, Vierfeldertafeln, bedingte Wahrscheinlichkeiten, stochastische Unabhaengigkeit, Urnenmodelle mit und ohne Zuruecklegen, and simulations of stochastic situations
- updated the Berlin upper-secondary lane notes so the next follow-on work is now a `Q2` data-and-survey widening step rather than the first `Q2` stochastics cut

Resulting rollout effect:

- Berlin now has reviewed corridor coverage on both the lower-secondary shared functions lane and three reviewed upper-secondary corridors on the active analysis/stochastics spine
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Berlin total mapping surface rises from `41` to `50` mappings
- the next derivable tasks are now the Brandenburg `Q2` stochastics follow-on corridor and the Berlin `Q2` data-and-survey follow-on corridor, while the lower-secondary shared lane can remain stable until those upper-secondary widening steps are secured

### 2026-03-21 / Step 11 completed

Executed work:

- expanded the Brandenburg upper-secondary source snapshot from the first reviewed `Q2` integral strip into the first reviewed `Q2` stochastics follow-on corridor
- activated the new Brandenburg `Q2` corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Brandenburg `Q2` stochastics strip onto the canonical upper-secondary math spine:
  - `Q3 Stochastik`
  - `Q3.1` basic stochastics
  - reviewed leaf bridges for Baumdiagramme, Vierfeldertafeln, bedingte Wahrscheinlichkeiten, stochastische Unabhaengigkeit, Urnenmodelle mit und ohne Zuruecklegen, and simulations of stochastic situations
- updated the Brandenburg upper-secondary lane notes so the next follow-on work is now a `Q2` data-and-distribution widening step rather than the first `Q2` stochastics cut

Resulting rollout effect:

- Brandenburg now has reviewed corridor coverage on both the lower-secondary shared functions lane and four reviewed upper-secondary corridors on the active analysis/stochastics spine
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Brandenburg total mapping surface rises from `53` to `62` mappings
- the next derivable tasks are now the Berlin `Q2` data-and-survey follow-on corridor and the Brandenburg `Q2` data-and-distribution follow-on corridor, while the lower-secondary shared lane can remain stable until those upper-secondary widening steps are secured

### 2026-03-21 / Step 12 completed

Executed work:

- expanded the Berlin upper-secondary source snapshot from the first reviewed `Q2` stochastics strip into the first reviewed `Q2` data-and-survey follow-on corridor
- activated the new Berlin `Q2` corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Berlin `Q2` data-and-survey strip onto the canonical upper-secondary math spine:
  - `Q3.5 Statistik und weitere Wahrscheinlichkeitsverteilungen`
  - `Zufallsexperimente statistisch auswerten`
  - `Q3.5 Statistik: Kenngroessen`
  - reviewed leaf bridges for survey planning, data preparation, sample location measures, sample dispersion measures, and survey evaluation with descriptive measures
- updated the Berlin upper-secondary lane notes so the next follow-on work is now a `Q4` distribution-and-binomial widening step rather than the first `Q2` data-and-survey cut

Resulting rollout effect:

- Berlin now has reviewed corridor coverage on both the lower-secondary shared functions lane and four reviewed upper-secondary corridors on the active analysis/stochastics/statistics spine
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Berlin total mapping surface rises from `50` to `58` mappings
- the next derivable tasks are now the Brandenburg `Q2` data-and-distribution follow-on corridor and the Berlin `Q4` distribution-and-binomial follow-on corridor, while the lower-secondary shared lane can remain stable until those upper-secondary widening steps are secured

### 2026-03-21 / Step 13 completed

Executed work:

- expanded the Brandenburg upper-secondary source snapshot from the first reviewed `Q2` stochastics strip into the first reviewed `Q2` data-and-distribution follow-on corridor
- activated the new Brandenburg `Q2` corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Brandenburg `Q2` data-and-distribution strip onto the canonical upper-secondary math spine:
  - `Q3.5 Statistik und weitere Wahrscheinlichkeitsverteilungen`
  - `Q3.5 Statistik: Kenngroessen`
  - `Q3.2 Wahrscheinlichkeitsverteilungen`
  - reviewed leaf bridges for sample location measures, sample dispersion measures, random variables and probability distributions, histograms, binomial descriptive measures, and point/intervall probabilities in binomial situations
- updated the Brandenburg upper-secondary lane notes so the next follow-on work is now a `Q2` survey-and-critique widening step rather than the first `Q2` data-and-distribution cut

Resulting rollout effect:

- Brandenburg now has reviewed corridor coverage on both the lower-secondary shared functions lane and five reviewed upper-secondary corridors on the active analysis/stochastics/statistics spine
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Brandenburg total mapping surface rises from `62` to `71` mappings
- the next derivable tasks are now the Berlin `Q4` distribution-and-binomial follow-on corridor and the Brandenburg `Q2` survey-and-critique follow-on corridor, while the lower-secondary shared lane can remain stable until those upper-secondary widening steps are secured

### 2026-03-21 / Step 14 completed

Executed work:

- expanded the Berlin upper-secondary source snapshot from the first reviewed `Q2` data-and-survey strip into the first reviewed `Q4` distribution-and-binomial follow-on corridor
- activated the new Berlin `Q4` corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Berlin `Q4` distribution-and-binomial strip onto the canonical upper-secondary math spine:
  - `Q3.2 Wahrscheinlichkeitsverteilungen`
  - reviewed leaf bridges for binomial models with `n` and `p`, Bernoulli chains, binomial probabilities, expected value, standard deviation, and first context use
- updated the Berlin upper-secondary lane notes so the next follow-on work is now a `Q4` inference, tests, and normal-approximation widening step rather than the first `Q4` distribution-and-binomial cut

Resulting rollout effect:

- Berlin now has reviewed corridor coverage on both the lower-secondary shared functions lane and five reviewed upper-secondary corridors on the active differential/stochastics/statistics spine
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Berlin total mapping surface rises from `58` to `64` mappings
- the next derivable tasks are now the Brandenburg `Q2` survey-and-critique follow-on corridor and the Berlin `Q4` inference, tests, and normal-approximation follow-on corridor, while the lower-secondary shared lane can remain stable until those upper-secondary widening steps are secured

### 2026-03-21 / Step 15 completed

Executed work:

- expanded the Brandenburg upper-secondary source snapshot from the first reviewed `Q2` data-and-distribution strip into the first reviewed `Q2` survey-and-critique follow-on corridor
- activated the new Brandenburg `Q2` corridor goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Brandenburg `Q2` survey-and-critique strip onto the canonical upper-secondary math spine:
  - `Q3.5 Statistik und weitere Wahrscheinlichkeitsverteilungen`
  - `Zufallsexperimente statistisch auswerten`
  - reviewed leaf bridges for statistical survey planning, data preparation, and the critical evaluation of survey data with descriptive measures
- updated the Brandenburg lane notes so the next follow-on work now shifts from this upper-secondary `Q2` widening step toward the next lower-secondary corridor on the shared BE/BB functions spine

Resulting rollout effect:

- Brandenburg now has reviewed corridor coverage on both the lower-secondary shared functions lane and six reviewed upper-secondary corridors on the active analysis/stochastics/statistics spine
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Brandenburg total mapping surface rises from `71` to `76` mappings
- the next derivable tasks are now the Berlin `Q4` inference, tests, and normal-approximation follow-on corridor and the first Brandenburg lower-secondary follow-on corridor, while broader lower-secondary widening can stay behind those two clearly bounded moves

### 2026-03-27 / Step 16 completed

Executed work:

- expanded the Berlin upper-secondary source snapshot from the active `Q4` distribution-and-binomial strip into the first reviewed `Q4` inference/test/normal-approximation follow-on corridor
- activated the new Berlin `Q4` follow-on goals in:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- mapped the Berlin `Q4` inference/test follow-on strip onto the canonical upper-secondary math spine:
  - `Q3.3 Hypothesentests`
  - `Q3.4 Prognose- und Konfidenzintervalle`
  - `Normalverteilung als Approximation der Binomialverteilung (LK)`
  - reviewed leaf bridges for sigma rules, sample-to-population interval inference, significance/test interpretation, Type I/II error language, and the first bell-shape normal-approximation idea
- updated the Berlin upper-secondary lane notes so the next follow-on work now shifts from this `Q4` widening step toward the first tightly shared Brandenburg/Berlin lower-secondary follow-on corridor

Resulting rollout effect:

- Berlin now has reviewed corridor coverage on both the lower-secondary shared functions lane and six reviewed upper-secondary corridors on the active differential/stochastics/statistics spine
- the nationwide score stays at `30.9%` because no state phase transition changed
- the Berlin total mapping surface rises from `64` to `69` mappings
- the next derivable task is now the first tightly shared Brandenburg/Berlin lower-secondary follow-on corridor, after which the active-lane widening order can be chosen again with the Berlin `Q4` follow-on secured

## Coverage target

For this rollout, a Bundesland counts as operationally covered only when all of the following are true:

- state-owned math source material is archived under `curricula/DE/Gymnasium/input/<STATE>/...`
- the relevant source snapshots and provenance entries are active
- the canonical math graph has reviewed overlap for both structural anchors and at least one didactically closed corridor
- state-specific visibility is represented through canonical `applicability`, not cloned goal trees
- the remaining delta is narrow enough that the state can be widened corridor by corridor without rethinking the whole spine

Long-term target:

- every state reaches at least broad reviewed lower-secondary and upper-secondary coverage on the same canonical math spine
- the final per-state runtime behavior is driven by mappings, provenance, and compiled applicability

## Program phases

The overall rollout should be managed in clear phases.

### Phase 0. Tracking scaffold

Deliverables:

- persisted plan
- persisted JSON tracker
- generated quick view
- agreed phase scale for all states

Exit criteria:

- every Bundesland has a tracker row
- the team can update status without touching the canonical math JSON

### Phase 1. Stabilize the active five-state base

Scope:

- `DE-HE`
- `DE-BY`
- `DE-NW`
- `DE-NI`
- `DE-BW`

Deliverables:

- keep existing active mapping lanes stable
- keep source, provenance, and applicability references clean
- remove ambiguity about which of these states are only pilot corridors and which already have broad coverage

Exit criteria:

- every active state is at least `P4` on the common state scale
- `DE-HE` and `DE-BY` stay the current broad-coverage reference lanes

### Phase 2. Source onboarding for the remaining eleven states

Scope:

- `DE-BB`
- `DE-BE`
- `DE-HB`
- `DE-HH`
- `DE-MV`
- `DE-RP`
- `DE-SH`
- `DE-SL`
- `DE-SN`
- `DE-ST`
- `DE-TH`

Deliverables:

- source archive lanes under `curricula/DE/Gymnasium/input/<STATE>/`
- first state-specific math source inventory notes where needed
- mapping-lane scaffolds under `curricula/DE/Gymnasium/mapping/DE-<STATE>/`

Exit criteria:

- every remaining state has moved from placeholder-only to archived-source readiness
- no state is blocked on "we still need to decide where the source bundle belongs"

### Phase 3. Nationwide first-corridor pass

Deliverables per new state:

- active source snapshot and provenance registration
- canonical structural anchors on the shared spine
- one reviewed corridor with explicit mappings

Preferred corridor order:

- structural anchors first
- then functions
- then stochastics
- then geometry/algebra

Exit criteria:

- all `16` states reach at least `P4`
- the canonical math landscape carries reviewed applicability for every onboarded state

### Phase 4. Lower-secondary breadth

Deliverables:

- widen each state beyond the first reviewed corridor across the shared `J5-J10` grid
- close obvious prerequisite strips so lower-secondary learner navigation is not just corridor-deep

Exit criteria:

- every state has broad reviewed lower-secondary coverage on the canonical spine

### Phase 5. Upper-secondary breadth

Deliverables:

- widen upper-secondary state coverage corridor by corridor
- keep Hessen as the reference donor, but validate every other state against the shared upper-secondary math structure

Exit criteria:

- every state has broad reviewed upper-secondary coverage
- the remaining open work is edge cleanup or special-state detail, not missing core curriculum regions

### Phase 6. Cutover and maintenance

Deliverables:

- stable applicability behavior for all states
- stable learner-facing selection into the DE-level canonical math landscape
- clear maintenance workflow for future curriculum revisions

Exit criteria:

- every state reaches `P6`
- the nationwide tracker no longer reflects rollout debt, only maintenance deltas

## State phase scale

Use one simple scale per Bundesland.

| State phase | Score | Meaning |
| --- | ---: | --- |
| `P0` | `0%` | Placeholder only: README/source links, no active math rollout lane |
| `P1` | `15%` | Source archived in the DE-level input lane |
| `P2` | `30%` | Source snapshot and provenance active |
| `P3` | `50%` | Structural anchors mapped on the canonical spine |
| `P4` | `65%` | First reviewed corridor mapped and usable |
| `P5` | `85%` | Broad state coverage across the main math spine |
| `P6` | `100%` | State cutover ready on the canonical math landscape |

Interpretation:

- `P4` is the threshold for "real onboarding happened"
- `P5` is the threshold for "this state is no longer just a narrow pilot"
- `P6` should be rare until the final nationwide cleanup phase

## Steering rules

- Do not store rollout status inside `DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`.
- Do not broaden many subjects in parallel before the math tracker shows nationwide momentum.
- Prefer one new didactically closed corridor over a broad, weakly reviewed state import.
- Prefer state-independent canonical goals plus state-specific applicability over state-specific goal duplication.
- Keep Sek I normalized to the shared `J5-J10` grid even if a source curriculum uses `G8` / `G9` labels differently.
- Use the same tracker fields for every state, even if one state currently has only placeholder status.

## Current baseline on 2026-03-27

Observed reviewed states already present in canonical math applicability:

- `DE-BW`
- `DE-BY`
- `DE-HE`
- `DE-NI`
- `DE-NW`

Observed active math mapping lanes:

- `DE-HE/lower-secondary`
- `DE-HE/upper-secondary`
- `DE-BY/gymnasium`
- `DE-NW/lower-secondary`
- `DE-NW/upper-secondary`
- `DE-NI/lower-secondary`
- `DE-NI/upper-secondary`
- `DE-BW/lower-secondary`
- `DE-BW/upper-secondary`

Observed remaining backlog states with placeholder input lanes:

- `DE-HB`
- `DE-HH`
- `DE-MV`
- `DE-RP`
- `DE-SH`
- `DE-SL`
- `DE-SN`
- `DE-ST`
- `DE-TH`

Program interpretation:

- the repo is beyond pure pilot mode for math
- but nationwide state coverage is still in an early stage
- the first backlog wave `DE-BB` / `DE-BE` has now reached reviewed multi-corridor upper-secondary state on both active lanes
- the shared Brandenburg/Berlin lower-secondary lane now also carries its first tightly shared algebra/equation follow-on corridor on top of the earlier functions corridor
- the shared Brandenburg/Berlin lower-secondary lane now also carries its first tightly shared geometry/constructions follow-on corridor on top of the earlier functions and algebra/equation corridors
- the shared Brandenburg/Berlin lower-secondary lane now also carries its first tightly shared transformations/similarity follow-on corridor on top of the earlier functions, algebra/equation, and geometry/constructions corridors
- the shared Brandenburg/Berlin lower-secondary lane now also carries its first tightly shared measurement follow-on corridor on top of the earlier functions, algebra/equation, geometry/constructions, and transformations/similarity corridors
- the shared Brandenburg/Berlin lower-secondary lane now also carries its first tightly shared later body/space follow-on corridor on top of the active measurement strip
- the shared Brandenburg/Berlin lower-secondary lane now also carries its first tightly shared later triangle-trigonometry follow-on corridor on top of the active measurement and later body/space strips
- the shared Brandenburg/Berlin lane has now also returned to upper-secondary widening and carries its first tightly shared Q3 vector/line-plane corridor around spatial vectors, scalar product, parametric lines, plane forms, normal vectors, and first line/plane position relations
- the shared Brandenburg/Berlin lane now also carries its first tightly shared upper-secondary Q3 intersections/angles follow-on corridor around systematic line/plane intersections and angle calculations between lines and planes
- the shared Brandenburg/Berlin lane now also carries its first tightly shared upper-secondary Q3 distance follow-on corridor around point-point, point-plane, line-plane, and plane-plane distances
- the shared Brandenburg/Berlin lane now also carries the remaining tightly shared LK-only Q3 line-distance residue around point-line and line-line distances
- the shared Brandenburg/Berlin upper-secondary Q3 geometry strip now also has Brandenburg- and Berlin-side provenance splits that separate the previously broad line/plane source anchors into parametric-line work, coordinate/normal-form plane work, cross-form plane descriptions, and first line/plane relation checks without widening the nationwide canonical phase picture
- the Berlin side of the same Q3 strip now also mirrors the later Brandenburg plane-anchor refinement by separating normal-vector work from coordinate-form work before the cross-form plane bridge, still without widening the nationwide canonical phase picture
- the Brandenburg side of the same Q3 strip now also has a second and third provenance refinement that separates vector/coordinatization work from scalar-product/length/angle work, feeds the local projection intuition lane from the scalar-product anchor, and now also isolates coordinate-form work from the normal-vector anchor before the cross-form plane bridge
- the Berlin side of the same Q3 strip now also mirrors that vector-anchor refinement by separating pure vector/coordinatization work from scalar-product/length/angle work and by feeding the angle follow-on explicitly from the new scalar-product anchor without widening the nationwide canonical phase picture
- the Berlin lane now also carries its first state-local matrix / transition side lane from simple matrix representations into first Markov-chain modeling, a separated state-vector propagation step, repeated-transition readings, long-run probability ideas, and a first explicit long-term-development residue
- the Berlin matrix / transition side lane now also mirrors that provenance cleanup internally by separating the single-step matrix-vector state update from the later multi-step state calculation before the repeated-transition reading node, still without widening the nationwide canonical phase picture
- the Berlin lane now also carries its first state-local sequences / series side lane around convergent / divergent sequences and first limit arguments
- the Berlin lane now also carries its first state-local differential-equations side lane around elementary first-order solution methods and second-order oscillation interpretations
- the Berlin lane now also carries its first state-local complex-numbers side lane around field-axiom foundations as well as algebraic form, the Gaussian plane, polar representations, and a separate periodic-process residue
- the Berlin complex-numbers side lane now also separates algebraic-form work from Gaussian-plane localization before the polar-form step, so the ma-Z8 provenance now mirrors the canonical split more closely without widening the nationwide canonical phase picture
- the Berlin complex-numbers side lane now also separates field-axiom classification from the later precise-use residue for arithmetic laws, so the ma-Z8 provenance keeps the canonical LK precision bridge while exposing the source-local conceptual split more honestly
- the Berlin lane now also carries its first state-local logic side lane around implication/equivalence work, quantifiers, chains of reasoning, and fallacy detection
- the Berlin lane now also carries its first state-local reasoning / proof side lane around direct geometry proofs, quantifier logic, induction, contradiction, and proof-strategy comparison
- the Berlin lane now also carries its first state-local analysis-deepening side lane around counterexamples to non-invertibility, theorem assumptions, local/global function properties, and first Rolle/mean-value-theorem proof checking
- the Berlin lane now also carries its first state-local numerical-mathematics side lane around computer-supported approximation methods, interpolation and fitting routines, numerical integration, error estimates, and critical reading of numerical results
- the Berlin numerical-mathematics side lane now also narrows its general calculator-based base atom to approximation-focused work, with interpolation/fitting and numerical integration kept as separate residues, so the ma-Z4 provenance mirrors the source bundle more honestly without widening the nationwide canonical phase picture
- the Brandenburg lane now also carries its first state-local linear-representation / projection side lane around tuple descriptions now split into point/vector notation, tabular tuple reading, and a separate spreadsheet-use residue plus a separated orthogonal-projection anchor for scalar-product interpretation and a narrower first linear-mapping intuition residue
- the Brandenburg linear-representation / projection side lane now also separates point-form tuple work from vector-form tuple work, so the narrower BB vector bridge sits on the explicit vector residue instead of the mixed point/vector source atom
- the Brandenburg linear-representation / projection side lane now also explicitly bridges the spreadsheet-use residue into the matrix-representation anchor and the point-form tuple residue into the already active coordinate-system anchor, so the current BB side-lane residue is fully mapped without widening the nationwide canonical phase picture
- the SH Sek-I lane now also operationalizes the remaining broad `Funktionen` / `Darstellungsformen` atoms closer to the active canonical function-concept and representation-switch targets, so the next SH residue is no longer the raw function-label bridge itself
- the SH Sek-I lane now also operationalizes the still-generic `Proportionale Funktionen` / `Antiproportionale Funktionen` / `Lineare Funktionen` atoms closer to their active canonical proportional, inverse-proportional, and linear-function targets, so the coarse raw table-label function-family residue is smaller again without changing the nationwide canonical phase picture
- the SH Sek-I lane now also operationalizes the still-generic `Variablen` / `Terme` / `Lineare Gleichungen` / `Lineare Gleichungssysteme` / `Quadratische Gleichungen` atoms closer to their active canonical algebra and equation targets, so the remaining SH residue shifts away from raw algebra/equation table labels toward the proportionality/rule-of-three and quadratic-parent leftovers
- the SH Sek-I lane now also operationalizes the still-generic `Dreisatz` / `Proportionale Funktionen und Dreisatz` / `Quadratische Funktionen und Gleichungen` / `Quadratische Funktionen` nodes closer to their active canonical rule-of-three and quadratic corridor targets, so the remaining SH residue shifts again from raw table-label parents toward the few still-broad corridor-parent nodes
- the SH Sek-I lane now also operationalizes the still-generic `Variablen und Terme` / `Funktionen und ihre Darstellungsformen` parent clusters closer to their active canonical variable/term and function-concept/representation corridors, so the remaining SH residue shifts from corridor-parent wording toward the few still-broad stage-parent nodes
- the SH Sek-I lane now also operationalizes the still-generic `Jahrgangsband 7/8/9: Strukturen und funktionaler Zusammenhang` stage-parent closer to the active canonical mixed algebra/function corridor, so the remaining SH residue shifts away from raw area-parent wording toward the few still-broad year-band parents
- the SH Sek-I lane now also operationalizes the still-generic `Jahrgangsstufe 10` year-parent closer to the active canonical J10 continuation anchor, so the remaining SH residue shifts further from raw year labels toward the still-broad `Jg 5/6` and `Jg 7/8/9` band parents
- the SH Sek-I lane now also operationalizes the still-generic `Jahrgangsband 5/6` / `Jahrgangsband 7/8/9` year-parents closer to their active canonical early- and later-Sek-I anchors, so the remaining SH residue shifts away from raw band labels toward the top-level SH root or a new explicit follow-on strip
- the SH Sek-I lane now also operationalizes the still-generic top-level `Mathematik Sekundarstufe I` root closer to the refined early-/later-/late-Sek-I progression, so the remaining SH residue shifts away from raw source-table root wording toward opening a new explicit follow-on strip
- the SH lane now also opens its first explicit upper-secondary follow-on strip by splitting `Einfuehrungsjahr: Geometrie` into vectors in R2/R3, lines, and line relations and mapping them onto the canonical space/line corridor, so the next SH residue shifts from Sek-I parent cleanup toward similarly explicit Sek-II phase-table cells such as Q1 geometry or E analysis
- the SH lane now also opens a second explicit upper-secondary follow-on strip by splitting `1. Jahr der Qualifikationsphase: Geometrie` into scalar product, planes, vector product, line-plane relations, and distances and mapping the canonical-fit subgoals onto the shared space-geometry corridor while retaining `Vektorprodukt` as an explicit SH-only residue, so the next SH residue shifts from Q1 geometry toward E analysis or another equally explicit Sek-II phase-table cell
- the SH lane now also opens an explicit upper-secondary E-analysis strip by splitting `Einfuehrungsjahr: Analysis` into derivatives, extrema, and inflection-point work and mapping the canonical-fit subgoals onto the shared derivative/extrema/curvature corridor, so the next SH residue shifts from E analysis toward Q1 analysis or another equally explicit Sek-II phase-table cell
- the SH lane now also opens an explicit upper-secondary Q1-analysis strip by splitting `1. Jahr der Qualifikationsphase: Analysis` into integral-calculus, natural-exponential-function, and differential/integral-calculus deepening atoms and mapping the canonical-fit subgoals onto the shared integral/exponential/deepening corridor, so the next SH residue shifts from Q1 analysis toward an equally explicit stochastics strip or another similarly narrow Sek-II follow-on
- the SH lane now also opens its first explicit upper-secondary stochastics strip by splitting `Einfuehrungsjahr: Stochastik` into random-experiment/Laplace basics and conditional probability and mapping the canonical-fit subgoals onto the shared foundational-stochastics corridor, so the next SH residue shifts from broad first-stochastics wording toward Q1 stochastics or another equally explicit Sek-II follow-on
- the SH lane now also opens an explicit upper-secondary Q1-stochastics strip by splitting `1. Jahr der Qualifikationsphase: Stochastik` into random-variable/distribution-characteristics work, binomial contexts, hypergeometric-without-replacement modelling, and a retained normal-distribution residue, so the next SH residue shifts from broad Q1-stochastics wording toward Q2 stochastics or another equally explicit Sek-II follow-on instead of forcing a premature LK-specific normal-distribution widening
- the SH lane now also opens a first explicit upper-secondary Q2-stochastics strip by splitting `2. Jahr der Qualifikationsphase: Stochastik` into significance-test setup and confidence-interval estimation and mapping the canonical-fit subgoals onto the shared hypothesis/interval corridor, so the next SH residue shifts from broad Q2-stochastics wording toward narrower test-decision / interval-interpretation follow-ons or another equally explicit Sek-II strip
- the SH lane now also opens a narrower upper-secondary Q2-stochastics follow-on by adding a contextual test-decision atom behind the significance-test setup step and mapping it onto the shared test-result-interpretation node, so the next SH residue shifts from generic Q2 test wording toward interval interpretation or another equally explicit Sek-II strip
- the SH lane now also opens a second narrow upper-secondary Q2-stochastics interval follow-on by adding a confidence-level interpretation atom behind the confidence-interval estimation step and mapping it onto the shared confidence-level node, so the next SH residue shifts from generic Q2 interval wording toward a broader interval-context interpretation only if a separate prediction-/interval-context source residue appears
- the SH lane now also opens a first explicit upper-secondary Q2-analysis follow-on by splitting the broad `Q2` analysis cell into a parameter/function-family atom plus a retained deepening residue and mapping the parameter step onto the shared contextual parameter-determination goal, so the next SH residue shifts away from the raw Q2-analysis parent wording toward another equally explicit Sek-II strip unless the retained deepening residue becomes source-exposed
- the SH lane now also opens a narrow upper-secondary Q1-stochastics normal-distribution follow-on by mapping the previously retained `Normalverteilung` residue onto the shared normal-approximation LK goal, so the next SH residue shifts away from the raw Q1 normal-distribution holdout toward another equally explicit Sek-II strip unless the retained Q2-analysis deepening residue or another separate source cell becomes clearer
- the SH lane now also anchors the remaining explicit upper-secondary Q1-geometry `Vektorprodukt einsetzen` residue on the already active shared normal-vector goal, so the last SH Sek-II holdouts now sit mainly in broader retained cells such as the Q2-analysis deepening residue rather than in another cleanly isolatable geometry atom
- the SH lane now also anchors the retained upper-secondary Q2-analysis deepening residue on the same shared differential/integral-calculus deepening cluster already used by the Q1 deepening step, so all currently explicit SH Sek-II source atoms are now mapped and the SH next wave should pause until a genuinely new source-exposed cell appears
- the BE lane now also anchors the broad sequences/series, differential-equations, complex-numbers, logic, and reasoning/proof side-lane parents on the corresponding shared canonical clusters, so the next Berlin residue shifts away from those lane roots toward the remaining analysis-deepening / numerical-mathematics holdouts or a return to Brandenburg if a clearer BB-local follow-on appears
- the BE lane now also anchors the broad matrix/transition side-lane parent on the shared transition-process matrix cluster, so the next Berlin residue shifts further away from the established optional-course lane roots toward the remaining analysis-deepening / numerical-mathematics holdouts or a return to Brandenburg if a clearer BB-local follow-on appears
- the BW lane now also anchors the remaining explicit lower-secondary 3.2.1 algebra/equation parents plus the narrower J9/J10 year parents on the shared Sek-I algebra, power-function, and J10 continuation clusters, so the next BW residue shifts away from still-open fine-grained algebra rows toward the broader 7/8 and 9/10 umbrella parents and the remaining non-core source sections
- the eight remaining placeholder states `DE-HB`, `DE-HH`, `DE-MV`, `DE-RP`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH` now also have repository-backed lower-secondary and upper-secondary math mapping fixtures plus reserved source-landscape IDs in state-local onboarding notes, so the nationwide backlog is no longer blocked on creating the first mapping-lane scaffold itself and can move directly to source-archive imports for those states
- the BW lane now also anchors the still-open lower-secondary 7/8 geometry and data umbrellas plus the broad 9/10 geometry and stochastics umbrellas on the shared Sek-I geometry, Sek-I data/probability, Sek-I geometry, and Sek-II probability/distribution corridors, so the remaining BW residue shifts further toward mixed top-level, function-lane, and vector-lane parents plus the remaining non-core source sections
- the BW lane now also anchors the retained lower-secondary top-level pilot root on the shared canonical mathematics root, so the remaining BW residue shifts away from the mixed top-level parent and more narrowly toward function-lane, vector-lane, and early mixed-parent cleanup plus the remaining non-core source sections
- the BW lane now also anchors the broad J7/J8 function corridor, its retained J7/J8 representation subcorridor, and the late-Sek-I coordinate/vector follow-on parent on the shared Sek-I function-foundations, functions-and-representations, and coordinate/vector entry clusters, so the remaining BW residue shifts away from those lane parents toward earlier function parents, late mixed parents, and the remaining non-core source sections
- the BW lane now also anchors the first broad function corridor plus the split J9 trigonometrie parent and J10 circle/body parent on the shared Sek-I function-foundations, J9 trigonometry, and J10 trigonometry-circle-solids clusters, so the remaining BW residue shifts away from those cleaned parents toward the still-broad J5/J6 mixed-function strip, the broad 9/10 algebra/function mixed parents, and the remaining non-core source sections
- the BW lane now also anchors the split J9 four-field/conditional-probability parent and the split J10 random-variable/binomial parent on the shared foundational stochastics-methods cluster and the shared probability-distribution overview cluster, so the remaining BW residue shifts further away from late-Sek-I stochastics split parents toward the still-broad J5/J6 mixed-function strip, the broad 9/10 algebra/function mixed parents, the broad 5/6 and 7/8 mixed umbrellas, and the remaining non-core source sections
- the BW lane now also anchors the formerly still-broad J5/J6 mixed-function strip on the shared Sek-I function-foundations cluster, so the remaining BW residue shifts away from that early function parent toward the broad 9/10 algebra/function mixed parents, the broad 5/6 and 7/8 mixed umbrella parents, and the remaining non-core source sections
- the BW lane now also anchors the overarching mixed 9/10 connector parent on the shared lower-secondary structures/functional-relationships cluster and the formerly still-broad 9/10 algebra/function follow-on parent on the shared J10 year anchor, so the remaining BW residue shifts away from broad late mixed-function parents toward the broad 5/6 and 7/8 mixed umbrellas and the remaining non-core source sections
- the BW lane now also anchors the broad mixed 5/6 umbrella on the shared J6 year anchor, the retained 5/6 Leitidee parents on the shared lower-secondary number/algebra, early measurement, early geometry, and early data clusters, and the broad mixed 7/8 umbrella on the shared J8 year anchor, so the remaining BW residue shifts away from the last open lower-secondary core parent cleanup and narrows to the retained non-core source sections
- the NI lane now also opens an explicit later-Sek-I geometry / trigonometry follow-on by importing `Entdeckungen an rechtwinkligen Dreiecken und Aehnlichkeit` into the active source snapshot and mapping the exact-fit Pythagoras and right-triangle-trigonometry atoms onto the shared J9 geometry corridor, so the next Niedersachsen residue shifts away from a generic geometry/algebra placeholder toward the remaining similarity / root / general-triangle residues or the adjacent quadratics corridor
- the NI lane now also anchors the similarity atom and the general-triangle sine/cosine-law atom from that opened right-triangle / similarity corridor on the shared J9 similarity and sine/cosine-law goals, so the next Niedersachsen residue narrows further to the root-based length-calculation atom or the adjacent quadratics corridor
- the NI lane now also anchors the remaining root-based length-calculation atom from that opened right-triangle / similarity corridor on the shared J9 square-root-basics goal, so the explicit Niedersachsen residue shifts off that geometry/trigonometry strip and onto the adjacent quadratics corridor
- the NI lane now also opens the adjacent explicit later-Sek-I `Quadratische Zusammenhaenge` corridor and anchors its quadratic-function, quadratic-equation, and quadratic-modelling atoms on the shared lower-secondary quadratic goals, so the next Niedersachsen residue narrows from a generic quadratics front to the still-visible parabola-as-locus atom or the next equally explicit local split inside that corridor
- the NI lane now also closes that opened explicit later-Sek-I `Quadratische Zusammenhaenge` corridor by introducing a dedicated canonical parabola-as-locus atom and exact-bridging the remaining NI source residue onto it, so the current Niedersachsen lower-secondary explicit strips are now exhausted at source-residue level
- the BW lane now also reaches the point where the active lower-secondary pilot snapshot has no unmapped source goals left at all, so the former Baden-Wuerttemberg lower-secondary residue collapses from "still-open rows inside the current snapshot" to "import additional retained non-core source sections or another BW lane intentionally"
- the NRW lane now also closes the remaining explicit `2.4.1 Funktionen` Stage-1 concept/context residue by bridging the mapping-context pair, adding a dedicated canonical function-concept leaf for functions as unique mappings, and anchoring the retained representation-use and Stage-1 proportional/linear parents, so the next NRW lower-secondary move shifts from `2.4.1` cleanup to the still-open `2.4.2` function-class cluster or another equally explicit NRW import
- the NRW lane now also anchors the retained lower-secondary `2.4.2 Funktionen` Stage-2 umbrella on the shared canonical J10 year anchor, so the current NRW functions snapshot is parent-anchored at both Stage-1 and Stage-2 level and the next NRW move shifts away from umbrella cleanup toward another equally explicit imported corridor
- the NRW lane now also anchors the retained upper-secondary Q-phase exponential parent on the shared canonical exponential-functions cluster, so the next NRW upper-secondary move shifts away from that reviewed exponential umbrella and toward the retained E-phase power/polynomial split or another equally explicit imported corridor
- the NRW lane now also anchors the retained upper-secondary E-phase power/polynomial split on the shared canonical `Funktionen und ihre Darstellung` cluster, so the current NRW upper-secondary pilot subset is now parent-anchored on its remaining explicit retained split parents and the next NRW move should come from another equally explicit imported corridor rather than more parent cleanup inside the current pilot subset
- the NRW lane now also reaches the explicit lower-secondary Stage-1 algebra prerequisite strip on shared canonical variables/terms, term-evaluation, fraction-term, and broad Sek-I algebra goals, so the remaining unmapped NRW Sek-I goals inside the current snapshot are structural parents rather than still-open explicit atomic residues and the next NRW move should come from another equally explicit imported corridor rather than renewed parent cleanup
- the NRW lane now also opens the first explicit upper-secondary `2.3 Analytische Geometrie und Lineare Algebra (G)` corridor and anchors its E-phase entry strip on shared canonical space/vector, mixed orientation-in-space, parametric-line, line-relation, and geometric-LGS anchors, so Nordrhein-Westfalen now spans both the initial upper-secondary analysis spine and a first upper-secondary geometry / linear-algebra entry corridor and the next NRW move should be a similarly explicit follow-on such as Q-phase geometry/linear algebra or another clearly exposed corridor
- the NRW lane now also opens the first explicit upper-secondary `2.4.1 Analytische Geometrie und Lineare Algebra (G)` Grundkurs follow-on and anchors its Q-phase strip on shared scalar-product, plane-form, coordinate-form, line-plane-intersection, and angle anchors, so Nordrhein-Westfalen now spans the initial upper-secondary analysis spine plus both an E-phase and a first Q-phase geometry / linear-algebra corridor and the next NRW move should narrow to the remaining explicit Q-phase geometry residue or another equally exposed corridor
- the NRW lane now also opens the first explicit upper-secondary `2.4.1 Stochastik` Grundkurs strip and anchors its Baumdiagramm-/Vierfeldertafel-/Unabhaengigkeits-/bedingte-Wahrscheinlichkeit atoms on the shared Q3 stochastics corridor, so Nordrhein-Westfalen now spans upper-secondary analysis plus first explicit geometry / linear-algebra and stochastics coverage and the next NRW move should narrow to the adjacent expectation/distribution strip or another equally exposed corridor
- the NRW lane now also opens the adjacent explicit upper-secondary `2.4.1 Stochastik` expectation/distribution strip and anchors its Zufallsgroessen-/Kenngroessen-/Binomialverteilungs atoms on the shared Q3 distributions corridor, so Nordrhein-Westfalen now spans upper-secondary analysis plus first explicit geometry / linear-algebra coverage and two explicit stochastics strips; the next NRW move should therefore come from another equally exposed imported corridor rather than renewed parent cleanup inside the reviewed pilot subset
- the NRW lane now also opens the first explicit upper-secondary `2.4.2 Stochastik` Leistungskurs strip and anchors its Prognoseintervall-, Konfidenzintervall-, and Stichprobenumfang atoms on the shared Q3 interval/statistics corridor, so Nordrhein-Westfalen now spans upper-secondary analysis plus first explicit geometry / linear-algebra coverage and three explicit stochastics strips; the next NRW move should therefore narrow to the adjacent normal-distribution strip or another equally exposed imported corridor
- the NRW lane now also opens the adjacent explicit upper-secondary `2.4.2 Stochastik` Leistungskurs normal-distribution strip and anchors its diskret/stetig-, Verteilungsfunktions-, normal-approximation-, and density-parameter atoms on the shared Q3 statistics / continuous-distribution corridor, so Nordrhein-Westfalen now spans upper-secondary analysis plus first explicit geometry / linear-algebra coverage and four explicit stochastics strips; the next NRW move should therefore come from another equally exposed imported corridor rather than renewed stochastic parent cleanup inside the reviewed pilot subset
- the NRW lane now also opens the first explicit upper-secondary `2.4.2 Analytische Geometrie und Lineare Algebra` Leistungskurs strip and anchors its plane-form, line-plane-relation, line-plane-intersection, angle, and distance atoms on the shared Q2 space/plane corridor, so Nordrhein-Westfalen now spans upper-secondary analysis plus explicit E-, GK-, and first LK-geometry/linear-algebra coverage alongside four explicit stochastics strips; the next NRW move should therefore narrow to the remaining explicit `2.4.2` geometry residues or another equally exposed imported corridor rather than renewed parent cleanup inside the reviewed pilot subset
- the NRW lane now also opens the adjacent explicit upper-secondary `2.4.2 Analytische Geometrie und Lineare Algebra` Leistungskurs linearsystem / solution-set strip and anchors its algorithmic-LGS atom on the shared Q2 space/plane corridor and geometric-LGS anchor, so Nordrhein-Westfalen now spans upper-secondary analysis plus explicit E-, GK-, and two LK-geometry/linear-algebra strips alongside four explicit stochastics strips; the next NRW move should therefore narrow to the remaining explicit `2.4.2` geometry residues around parameter-plane setup, reflections, or another equally exposed imported corridor rather than renewed parent cleanup inside the reviewed pilot subset
- the NRW lane now also opens the adjacent explicit upper-secondary `2.4.2 Analytische Geometrie und Lineare Algebra` Leistungskurs parameter-form strip and anchors its plane-in-parametric-form atom on the shared Q2 space/plane corridor plus the exact canonical plane-parameter-form goal, so Nordrhein-Westfalen now spans upper-secondary analysis plus explicit E-, GK-, and three LK-geometry/linear-algebra strips alongside four explicit stochastics strips; the next NRW move should therefore narrow to the remaining explicit `Parallelogramme und Dreiecke in Parameterform` residue, reflections, or another equally exposed imported corridor rather than renewed parent cleanup inside the reviewed pilot subset
- the NRW lane now also closes the adjacent explicit upper-secondary `2.4.2 Analytische Geometrie und Lineare Algebra` Leistungskurs figures-in-parametric-form residue by adding a small canonical room-geometry atom for `Parallelogramme und Dreiecke in Parameterform darstellen` and mapping the NRW source goal to it exactly, so Nordrhein-Westfalen now spans upper-secondary analysis plus explicit E-, GK-, and four LK-geometry/linear-algebra strips alongside four explicit stochastics strips; the next NRW move should therefore narrow to reflections or another equally exposed imported corridor rather than renewed parent cleanup inside the reviewed pilot subset
- the NRW lane now also opens the adjacent explicit upper-secondary `2.4.2 Analytische Geometrie und Lineare Algebra` Leistungskurs reflection strip by splitting `Spiegelungen an Ebenen` out of the imported source text, adding a small canonical room-geometry atom for `Punkte an Ebenen spiegeln`, and anchoring the NRW source goal to it exactly, so Nordrhein-Westfalen now spans upper-secondary analysis plus explicit E-, GK-, and five LK-geometry/linear-algebra strips alongside four explicit stochastics strips; the next NRW move should therefore narrow to another equally exposed imported corridor rather than renewed parent cleanup inside the reviewed pilot subset
- the NRW lane now also opens the first explicit upper-secondary `2.4.2 Funktionen und Analysis` Leistungskurs integral-applications strip and anchors reconstructed stocks / total effects, definite-integral area work, improper-integral area work, and solids of revolution on the shared canonical integral-applications corridor, so Nordrhein-Westfalen now spans upper-secondary analysis plus explicit E-, GK-, and five LK-geometry/linear-algebra strips, four explicit stochastics strips, and a first explicit LK integral-applications strip; the next NRW move should therefore narrow to the adjacent `2.4.2 Funktionen und Analysis` Hauptsatz/Stammfunktions strip rather than renewed parent cleanup inside the reviewed pilot subset
- the NRW lane now also opens the adjacent explicit upper-secondary `2.4.2 Funktionen und Analysis` Leistungskurs integral-theorem / antiderivative strip by splitting out the LK expectations on anschaulichem Hauptsatz, polynomial antiderivatives, `ln(x)` as antiderivative of `1/x`, and interval additivity / linearity of integrals, adding small canonical atoms for the narrower polynomial-antiderivative, `ln(x)`-antiderivative, and integral-property surfaces, and exact-bridging those NRW source atoms onto them; Nordrhein-Westfalen now spans upper-secondary analysis plus explicit E-, GK-, and five LK-geometry/linear-algebra strips, four explicit stochastics strips, and two explicit LK integral strips, so the next NRW move should therefore come from another equally exposed imported corridor rather than renewed parent cleanup inside the reviewed pilot subset
- the NRW lane now also opens the adjacent explicit upper-secondary `2.4.1 Stochastik` combinatorics prelude by splitting out Urnenmodelle mit/ohne Zuruecklegen, Ereignisoperationen, verknuepfte Ereignisse, and Binomialkoeffizienten, exact-bridging the event-operations, combined-event, and binomial-coefficient atoms, and reviewed-partial-bridging the with/without-replacement urn-model atoms onto the shared Bernoulli/hypergeometric corridor; Nordrhein-Westfalen now spans upper-secondary analysis plus explicit E-, GK-, and five LK-geometry/linear-algebra strips, five explicit stochastics strips, and two explicit LK integral strips, so the next NRW move should therefore come from another equally exposed imported corridor rather than renewed parent cleanup inside the reviewed pilot subset
- the NRW lane now also splits the earlier broad upper-secondary `2.4.1 Stochastik` Baumdiagramm-/Vierfeldertafel atom into a small reviewed parent plus two exact child bridges on the shared canonical tree-diagram and fourfold-table atoms, so Nordrhein-Westfalen keeps the same five explicit stochastic pilot strips while reducing one narrower NRW partial debt inside the already opened GK stochastics lane
- the NRW lane now also fully resolves the adjacent broad upper-secondary `2.4.1 Stochastik` expectation/distribution atom by splitting it into three exact children on random-variable introduction, histogram representation, and simple characteristic-value work, and by adding two small canonical sibling atoms under the existing Q3 distribution overview rather than widening a fresh corridor, so Nordrhein-Westfalen keeps the same five explicit stochastic pilot strips while removing that earlier NRW partial entirely
- the NRW lane now also splits the previously broad upper-secondary `2.4.1 Funktionen und Analysis` Hauptsatz/Stammfunktions atom into an exact theorem-explanation child on a new canonical Hauptsatz-explanation atom plus an exact polynomial-antiderivative child on the shared canonical antiderivative atom, so Nordrhein-Westfalen keeps the same reviewed GK integral strip while shifting the next NRW follow-on toward the remaining total-stock/effect residue or the retained exponential split
- the NRW lane now also fully splits the remaining upper-secondary `2.4.1 Funktionen und Analysis` total-stock/effect residue by adding a dedicated GK child and a new shared canonical stock/effect atom, and it simultaneously pulls the matching LK reconstructed-stock atom from a partial bridge onto that same exact canonical surface, so Nordrhein-Westfalen now keeps the reviewed GK integral strip with exact theorem-, antiderivative-, and stock/effect children while the next NRW follow-on should narrow to the retained exponential split or another equally explicit imported corridor
- the NRW lane now also exact-resolves the retained upper-secondary exponential three-way split by adding three narrow canonical atoms for `a^x` properties, the special role of `e^x`, and growth/decay usage, and by moving the three NRW source children off their broader partial canonical exponential surfaces onto those exact siblings; Nordrhein-Westfalen therefore keeps the retained exponential parent only as a reviewed umbrella while the next NRW follow-on should narrow to the retained E-phase power/polynomial split or another equally explicit imported corridor
- the NRW lane now also exact-resolves the explicit upper-secondary `2.3` geometry leaf `Geraden und Strecken in Parameterform darstellen` by adding a dedicated canonical upper-secondary parameter-form atom with segment and parameter-interpretation scope, and by moving the NRW source goal off the broader shared `Geraden im Raum parametrisch darstellen` surface onto that exact sibling; Nordrhein-Westfalen therefore keeps the retained E-phase power/polynomial parent as one remaining option, but the next clean NRW follow-on can now also narrow to adjacent explicit geometry leaves such as coordinate-form orientation or line-plane intersections instead of reopening parent cleanup
- the NRW lane now also exact-resolves the adjacent explicit upper-secondary `2.4.1` geometry leaf `Schnittpunkte von Geraden mit Ebenen berechnen` by adding a dedicated canonical upper-secondary line-plane-intersection atom and by moving the NRW source goal off the broader shared `Schnittpunkte im Raum berechnen` surface onto that exact sibling; Nordrhein-Westfalen therefore keeps the reviewed GK/Q2 geometry corridor while the next clean NRW follow-on can now narrow to coordinate-form orientation or scalar-product work, or return to the retained E-phase power/polynomial split
- the NRW lane now also exact-resolves the adjacent explicit upper-secondary `2.4.1` geometry leaf `Skalarprodukt geometrisch deuten und berechnen` by adding a dedicated canonical upper-secondary dot-product atom and by moving the NRW source goal off the broader shared `Skalarprodukt und Winkel berechnen` surface onto that exact sibling; Nordrhein-Westfalen therefore keeps the reviewed GK/Q2 geometry corridor while the next clean NRW follow-on can now narrow to coordinate-form orientation, or return to the retained E-phase power/polynomial split
- the NRW lane now also exact-resolves the adjacent explicit upper-secondary `2.4.1` geometry leaf `Koordinatenformen von Ebenen zur Orientierung im Raum nutzen` by adding a dedicated canonical upper-secondary coordinate-form-orientation atom and by moving the NRW source goal off the broader shared `Koordinatenform einer Ebene aufstellen und interpretieren` surface onto that exact sibling; Nordrhein-Westfalen therefore keeps the reviewed GK/Q2 geometry corridor while the next clean NRW follow-on can now narrow to the remaining intersection-angle leaf, or return to the retained E-phase power/polynomial split

## Update workflow

1. update `curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json`
2. run `python3 scripts/render_canonical_math_bundesland_status.py`
3. review the generated `docs/dev/canonical-gymnasium-math-bundeslaender-status.md`
4. update `docs/dev/canonical-gymnasium-math-de-expansion-plan.md`
5. commit plan, tracker, and generated status together when the rollout picture changed

## Suggested next concrete move

Keep the tracker stable and use it to drive math work in this order:

1. broaden Nordrhein-Westfalen from its now atom-anchored lower-secondary prerequisite/functions plus upper-secondary analysis, refined GK integral theorem/antiderivative/stock-effect split, exact retained exponential split, and E-phase/Q-phase geometry/linear-algebra pilot coverage toward broader state coverage, but do so via the retained E-phase power/polynomial split or another equally explicit NRW source corridor rather than reopening structural parent cleanup inside the already reviewed NRW snapshots
2. keep Baden-Wuerttemberg and Niedersachsen stable at their now exhausted explicit lower-secondary pilot-snapshot / strip level unless additional retained source corridors are imported intentionally
3. keep Brandenburg, Berlin, and Schleswig-Holstein stable at their explicitly source-exposed residue level unless a genuinely clearer local follow-on appears that changes the nationwide rollout picture

That makes nationwide progress visible without overloading the canonical landscape file with project-management metadata.
