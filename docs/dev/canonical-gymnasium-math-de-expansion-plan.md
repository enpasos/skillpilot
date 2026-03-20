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

- NRW now has archived source PDFs, active pilot source snapshots, shared provenance registration, `DE-NW` applicability plumbing, and a first exact lower-secondary bridge set on the shared math spine; the next blocker is no longer generic state onboarding or hidden-prerequisite import debt
- the current NRW follow-on blocker sits one layer later in the same Stage-1 function slice: the imported source atom for representations is broader than the individual canonical value-, graph-reading-, and parameter leaves, so the next pass needs a deliberate exact-vs-partial review instead of more blind widening

Interpretation:

- Stage A (source PDF import) is complete
- Stage B (real DE-NW mapping-fixture setup) is complete
- Stage C (source-snapshot import plus shared provenance activation) is complete
- Stage D0 (third-state jurisdiction activation plus first exact NRW motivation bridge) is complete
- Stage D1 (lower-secondary prerequisite-strip widening for NRW function onboarding) is complete
- Stage D2 (first exact NRW lower-secondary arithmetic and function bridges on the shared spine) is complete
- Stage D3 (reviewed NRW partial follow-on bridges for function-value work) is complete
- Stage D4 (reviewed NRW lower-secondary linear-parameter pass plus prerequisite-backed proportional bridge) is complete
- Stage D5 (first effective NRW Stage-2 quadratic bridge via the graph-parameter atom) is complete
- Stage D6 (direct NRW Stage-2 quadratic graph-property bridge via the broad class-distinction atom) is complete
- Stage D7 (direct NRW Stage-2 quadratic application bridge via the broad growth/application atom) is complete
- Stage D8 (first NRW upper-secondary E-phase change-rate bridge beyond motivation) is complete
- Stage D9 (first NRW upper-secondary derivative-entry follow-on bridge with explicit prerequisite retention) is complete
- Stage D10 (NRW upper-secondary source split plus point-derivative bridge) is complete
- Stage D11 (NRW upper-secondary `f`/`f′` graph bridge after canonical prerequisite trim) is complete
- Stage D12 (NRW upper-secondary E-phase differential expansion plus first computational `E.3` bridges) is complete
- Stage D13 (NRW upper-secondary first Q-phase extremal-problem bridge) is complete
- Stage D14 (NRW upper-secondary E-phase tangent/normal bridge) is complete
- Stage D15 (NRW upper-secondary first integral-as-stock bridge plus Q1 cluster-prerequisite trim) is complete
- the next executable task is to stay on the same imported Q-phase integral surface without widening the broader NRW lane blindly
- the cleaner next candidate is to test whether `cc57ef8b-b0a6-4a42-b82d-92433e0ad227` can also carry `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6`, before the broader parameter or exponential lane

## Initial NRW task list

1. keep the archived NRW mathematics PDFs under `curricula/DE/Gymnasium/input/NW/` as the fixed raw source bundle
2. keep the empty repository-backed mapping fixtures under `curricula/DE/Gymnasium/mapping/DE-NW/`
3. keep the first NRW source-landscape JSON snapshots stable under the reserved `sourceLandscapeId` values
4. keep the corresponding source-landscape and provenance registry entries in sync as the NRW source snapshots widen
5. use the imported NRW math structure note as the local source inventory:
   - source files
   - year/phase segmentation
   - obvious overlap with existing canonical math anchors
6. keep the first exact NRW motivation bridge stable on the shared canonical root
7. keep the widened NRW lower-secondary prerequisite strip stable:
   - lower-secondary `Zuordnungen`
   - proportional relationships / first linear foundations
   - the imported arithmetic and equation prerequisites that feed the canonical function atoms
8. keep the first reviewed exact NRW lower-secondary bridge set stable on the shared canonical math spine:
   - natural-number and integer arithmetic anchors
   - `Rationale Zahlen an der Zahlengeraden darstellen und ordnen`
   - `Zuordnungen analysieren`
   - `Funktionsbegriff und Darstellungen verstehen`
9. keep the reviewed NRW partial follow-on bridges stable where the source stays broader than the canonical atom:
   - `Funktionswerte berechnen`
   - `Funktionswerte aus Graphen ablesen`
10. keep the reviewed NRW linear-corridor partial bridges stable:
   - `Proportionale Zuordnungen nutzen`
   - `Lineare Funktionen beschreiben`
   - `Parameter linearer Funktionen deuten`
11. keep the first effective NRW Stage-2 quadratic bridge stable:
   - `Parameter quadratischer Funktionen in Scheitelpunktform deuten`
   - the activated J9 quadratic clusters that compile from it
12. keep the reviewed NRW Stage-2 graph-property bridge stable:
   - `Eigenschaften quadratischer Funktionen aus Graphen ablesen`
   - the direct use of the broad NRW class-distinction atom without a source split
13. keep the reviewed NRW Stage-2 application bridge stable:
   - `Quadratische Funktionen in Anwendungen modellieren und loesen`
   - the activated NRW-visible quadratic application cluster
   - the direct use of the broad NRW growth/application atom without a source split
14. keep the first reviewed NRW upper-secondary analysis bridge stable:
   - `Mittlere Änderungsrate berechnen und deuten`
   - the activated NRW-visible canonical E.2 derivative-introduction cluster
15. on that active upper-secondary base, keep the NRW follow-on decisions narrow and source-led:
   - first prefer small source additions or source splits when NRW exposes a clean clause such as the E-phase tangent/normal-steigung expectation
   - after that, prefer the already imported Q-phase integral/bestands atom before broader parameter or exponential widening

## Decision rule after NRW

After the first NRW math corridor is stable, decide using this rule:

- if the main new problems are still source-import and provenance problems, onboard one more state before widening NRW breadth
- if the main new problems are canonical-shape problems, widen NRW inside mathematics before taking the next state

The point is to learn the generic multi-state mathematics pattern as quickly as possible without opening a full nationwide scope all at once.
