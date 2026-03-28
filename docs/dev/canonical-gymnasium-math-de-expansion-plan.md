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
- the next focus shifts from opening Brandenburg's first state-local side lane to deciding whether that narrow BB entry can widen into a fuller matrix / linear-model strip or whether Berlin again provides one of the remaining explicit optional-course residues after widening the ma-Z7 matrix/transition lane through separated state-vector propagation, repeated-transition readings, long-term-development residue, and anchoring the ma-Z8 field-axiom remainder

## Update workflow

1. update `curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json`
2. run `python3 scripts/render_canonical_math_bundesland_status.py`
3. review the generated `docs/dev/canonical-gymnasium-math-bundeslaender-status.md`
4. update `docs/dev/canonical-gymnasium-math-de-expansion-plan.md`
5. commit plan, tracker, and generated status together when the rollout picture changed

## Suggested next concrete move

Keep the tracker stable and use it to drive math work in this order:

1. treat the shared `DE-BB` / `DE-BE` upper-secondary Q3 geometry strip as exhausted, keep Berlin's local matrix / transition lane now including a separated state-vector propagation step, repeated-transition readings, and a first LK long-term-development residue, sequences / series, differential-equations, complex-numbers with the ma-Z8 field-axiom residue, logic, reasoning / proof, analysis-deepening, and numerical-mathematics side lanes now also carrying the interpolation / fitting and numerical-integration residues as the first non-shared references, and now also keep Brandenburg's linear-representation / projection side lane as the first BB-local counterweight
2. decide next whether Brandenburg can widen this new tuple / point-vector, spreadsheet, and projection entry into a fuller matrix / linear-model strip or whether Berlin deepens one of the now thinner remaining local optional-course lanes while alignment remains explicit
3. keep the tracker stable while those corridor decisions remain state-local and do not change the nationwide phase picture

That makes nationwide progress visible without overloading the canonical landscape file with project-management metadata.
