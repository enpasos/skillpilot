# Canonical Gymnasium Mathematics DE Expansion Plan

Snapshot: `2026-03-20`

This note defines the next expansion phase after the current Hessen/Bavaria adoption work:

- keep the canonical Gymnasium layer shared at DE level
- stop broadening additional subjects for now
- expand `Mathematik` across further Bundeslaender one state at a time

It complements:

- `docs/concept/curriculum-graph/canonical-gymnasium-rollout.md`
- `docs/dev/canonical-gymnasium-implementation-plan.md`
- `docs/dev/canonical-gymnasium-migration-status.md`
- `docs/dev/canonical-gymnasium-by-math-sek1-probe.md`

## Why switch to Math-first DE expansion now

`Mathematik` is the right pressure-test subject for the next phase because it exposes most of the generic convergence problems early:

- Sek-I normalization onto the shared `J5-J10` grid
- Sek-I to upper-secondary bridge modeling on the same canonical spine
- mixed state coverage via compiled `applicability`
- state-specific retained-source handling and mapping audit trails
- later cross-subject prerequisites into `Physik`

If these problems are solved repeatedly on one subject across several states, the later non-math subject rollout should become more mechanical.

## Repo reality on 2026-03-20

Current adopted mapping lanes:

- `DE-HE/lower-secondary`
- `DE-HE/upper-secondary`
- `DE-BY/gymnasium`

Current additional Gymnasium input placeholders already present:

- `BB`
- `BE`
- `BW`
- `HB`
- `HH`
- `MV`
- `NI`
- `NW`
- `RP`
- `SH`
- `SL`
- `SN`
- `ST`
- `TH`

Important limitation:

- outside `DE-HE` and `DE-BY`, these state lanes currently hold only README-level source references
- there is no imported mathematics source bundle or mapping fixture yet for a third state

Operational consequence:

- the next real task is source onboarding and archive/provenance preparation for one additional math state
- it is not yet another applicability cleanup inside already-onboarded non-math subjects

## Working rule

From here on, canonical Gymnasium expansion should follow this order:

1. add one new Bundesland to canonical `Mathematik`
2. keep the migration unit to one didactically closed mathematics corridor at a time
3. only after one additional state is stable, decide whether the next increment is:
   - another math corridor in the same state, or
   - the first math corridor of the next state

Explicit non-goal:

- do not try to onboard one whole Bundesland across many subjects before the shared multi-state mathematics spine has been tested further

## Per-state onboarding ladder

Every new math state should pass the same ladder.

### Stage A. Source import

- archive the state-owned math source files under `curricula/DE/Gymnasium/input/<STATE>/...`
- keep Sek I and upper-secondary source ownership visible
- do not start canonical authoring from links alone

### Stage B. Mapping lane scaffold

- create state-scoped mapping lanes under `curricula/DE/Gymnasium/mapping/DE-<STATE>/`
- split `lower-secondary` and `upper-secondary` if the source structure is split that way

### Stage C. Provenance registration

- register source landscapes and source-goal closure/membership material in the shared DE-level provenance registries
- make later runtime and validator work independent from live external source trees

### Stage D. Structural overlap

- establish the first reviewed structural overlap on the canonical math spine:
  - Sek-I year anchors `J5-J10`
  - upper-secondary anchor phases / clusters where applicable

### Stage E. First reviewed corridor

- add one narrow, didactically closed reviewed math corridor with explicit mappings
- keep the first corridor small enough that learner cutover and applicability validation remain explainable

### Stage F. Runtime activation

- only after structural overlap and the first reviewed corridor are stable, consider learner cutover or broader applicability widening

## Corridor order to reuse across states

Use the same corridor order for every new math state whenever the source material allows it.

1. structural anchors
- `J5-J10`
- upper-secondary anchor phases / major clusters

2. function corridor
- function concept
- graph interpretation
- function values
- late Sek-I to upper-secondary function-family bridge

3. stochastics corridor
- data / basic probability
- compound experiments
- bridge into upper-secondary stochastic clusters

4. geometry and algebra corridor
- linear systems
- similarity / trigonometry / spatial geometry
- bridge into upper-secondary analytic geometry / linear algebra

5. residual breadth
- the remaining arithmetic, algebra, geometry, and modeling strips

This order keeps the early state comparisons focused on the most reusable canonical spine.

## Preferred next state: `DE-NW`

`DE-NW` is the best next onboarding target with the current repo evidence.

Reasons:

- the existing input lane already points to both:
  - `Kernlehrplan Mathematik Sekundarstufe I Gymnasium (2019/2020)`
  - `Kernlehrplan Mathematik gymnasiale Oberstufe (2023/2024)`
- the source references sit behind one provider family (`QUA-LiS` / Lehrplannavigator), which should simplify repeatable extraction compared with more fragmented state portals
- the Sek-I reference is already explicitly `Gymnasium G9`, which aligns well with the current canonical `J5-J10` authoring grid
- NRW adds a strong third comparison case next to Hessen and Bavaria without forcing an immediate G8-first normalization problem

Current blocker:

- `curricula/DE/Gymnasium/input/NW/` currently contains only `README.md`

Interpretation:

- the next executable task is **NRW math source import**
- the task after that is **DE-NW mapping-lane setup**

## Initial NRW task list

1. import/archive the NRW mathematics source bundle for Sek I and Sek II under `curricula/DE/Gymnasium/input/NW/`
2. scaffold `curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary/` and `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/`
3. add source-landscape and provenance registry entries for the imported NRW math sources
4. write one short inventory note for NRW math structure:
   - source files
   - year/phase segmentation
   - obvious overlap with existing canonical math anchors
5. start the first reviewed NRW corridor on the shared function spine

## Decision rule after NRW

After the first NRW math corridor is stable, decide using this rule:

- if the main new problems are still source-import and provenance problems, onboard one more state before widening NRW breadth
- if the main new problems are canonical-shape problems, widen NRW inside mathematics before taking the next state

The point is to learn the generic multi-state mathematics pattern as quickly as possible without opening a full nationwide scope all at once.
