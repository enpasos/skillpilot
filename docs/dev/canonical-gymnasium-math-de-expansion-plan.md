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
- `DE-NW/lower-secondary`
- `DE-NW/upper-secondary`
- `DE-NI/lower-secondary`
- `DE-NI/upper-secondary`

Current additional not-yet-onboarded Gymnasium input placeholders already present:

- `BB`
- `BE`
- `HB`
- `HH`
- `MV`
- `RP`
- `SH`
- `SL`
- `SN`
- `ST`
- `TH`

Important limitation:

- outside `DE-HE`, `DE-BY`, `DE-NW`, `DE-NI`, and `DE-BW`, these state input lanes currently hold only README-level source references
- there is no imported mathematics source bundle yet for a sixth state
- `DE-BW` now has archived mathematics source PDFs plus the first active lower-secondary source snapshot, but no upper-secondary source snapshot yet

Operational consequence:

- the next real task is source onboarding and archive/provenance preparation for one additional math state beyond Niedersachsen
- it is not another applicability cleanup inside already-onboarded non-math subjects

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

## Preferred next state after NRW: `DE-NI`

`DE-NI` is the best next onboarding target with the current repo evidence.

Reasons:

- the existing input lane already points to both:
  - `Kerncurriculum Mathematik Gymnasium Sekundarbereich I (2015)`
  - `Kerncurriculum Mathematik Sekundarbereich II (2018/2020)`
- both references sit behind one provider family (`NIBIS`), which should simplify repeatable extraction compared with more fragmented state portals
- Niedersachsen adds a fourth comparison case after Hessen, Bavaria, and NRW without immediately forcing a combined G8/G9 authoring split
- unlike several alternative placeholder states, the current NI lane is already explicitly math-first in both Sek I and Sek II under one consistent provider

Current blocker:

- Niedersachsen now has archived mathematics source PDFs under `curricula/DE/Gymnasium/input/NI/`
- the repository-backed `DE-NI` mapping lane is reserved and the first lower-secondary and upper-secondary source snapshots are now active
- the first Niedersachsen mapping pass exposed two reusable blockers:
  - the DE-level canonical runtime and compiled applicability stack still needed explicit `DE-NI` jurisdiction support
  - the lower-secondary NI functions corridor still sits behind a broader arithmetic prerequisite strip than the initial minimal mapping pass could safely close

Interpretation:

- Stage A/B/C/D are already active for NRW and no longer the main program bottleneck
- the next reusable learning step is to repeat Stage A and Stage B once for a fourth state
- Niedersachsen is the cleanest next place to do that
- Stage A and Stage B are now complete for Niedersachsen mathematics
- Stage C is now complete for the first Niedersachsen lower-secondary and upper-secondary pilot subsets
- the first Niedersachsen execution pass now also has a clean Stage-D0-style result:
  - `DE-NI` is active end-to-end in canonical Gymnasium jurisdiction handling
  - the first exact NI lower-secondary motivation bridge is live on the shared canonical root
  - the widened lower-secondary arithmetic prerequisite strip is archived in the active NI source snapshot and provenance registries
- the next Niedersachsen execution pass now also has a clean Stage-D1-style result:
  - the new NI arithmetic prerequisite strip is bridged exact onto the shared lower-secondary arithmetic spine
  - the old cluster-wide prerequisite claim on the canonical J6 rational-number cluster was removed so applicability can stay child-driven
- the next executable NI step is now:
  - retry the NI lower-secondary proportional / linear functions corridor on top of the new arithmetic base
  - only after that resume the first NI upper-secondary derivative-entry bridges
- NRW already completed:
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
- Stage D16 (NRW upper-secondary retained integral source split plus area-approximation bridge) is complete
- Stage D17 (NRW upper-secondary Q-phase Hauptsatz source add and bridge) is complete
- Stage D18 (NRW upper-secondary definite-integral area source add plus area-with-integrals bridge) is complete
- Stage D19 (NRW upper-secondary interval-additivity source add plus integral-term argumentation bridge) is complete
- Stage D20 (NRW upper-secondary introductory integral pair import plus narrower approximation remap) is complete
- Stage D21 (NRW upper-secondary exponential entry mapping-gap closure) is complete
- Stage D22 (NRW upper-secondary exponential source split plus parameter follow-on bridge) is complete
- Stage D23 (NRW upper-secondary natural-exponential follow-on bridge) is complete
- Stage D24 (NRW upper-secondary LK inverse-function source add plus natural-logarithm bridge and Q2 overview prerequisite trim) is complete
- Stage D25 (NRW upper-secondary inverse-graph source add plus canonical Q2.1 inverse-graph leaf) is complete
- the current clean next program decision is no longer another local NRW follow-on atom inside the current pilot subset
- the preferred next reusable move is now the next Bundesland onboarding lane, with `DE-NI` as the first target

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
   - after that, prefer the already imported Q-phase integral corridor:
     - `Integral als Bestand und Flächeninhalt verstehen`
     - `Flächen unter Graphen näherungsweise bestimmen`
     - `Hauptsatz der Differential- und Integralrechnung nutzen`
     - `Integralterme interpretieren und begründen`
     - `Flächen mit Integralen berechnen`
   - the same Q1.1 introduction corridor now also carries the NRW-exact leaf:
     - `9441bb35-2a2f-4edc-9d8a-bc58c257054d` from `371359c2-6e29-4863-879f-d53b044204ce` (`Graphen von Flaecheninhaltsfunktionen skizzieren`)
   - the retained Q2.1 parameter corridor is now active through a small mixed-state split of `e7c9a459-52d1-5e29-8714-2b038c4d3a7f`:
     - Hessen stays exact on `972cc7e8-be9c-444c-ba45-98e817b3cf14`
     - NRW now reaches `71683f37-24de-4e0f-badd-858b56fa4d64` and `91e2f564-3bc8-4924-af85-2a3fa84c1471` via exact mappings from `99e37d46-3b0c-4989-b8a8-c8a72501fc15` and `8ddb7c8f-b27e-4353-85b4-6801a7fdfa5b`
   - the same LK corridor now also carries the NRW-exact leaf:
     - `899ed286-0cc2-4d6d-ba46-7d4e40a11f41` from `d9121fe6-058a-4ab8-a8ce-68d6eefea520` (`Produktregel, Kettenregel und zusammengesetzte Funktionen nutzen`)
   - the earlier E-phase tangent/angle lane is now also closed through an exact split of `bb979dbd-b080-432c-8cf1-067ba6eff381`:
     - Bavaria now stays exact on `0264591c-fdd7-41c6-9fb9-7cb3a03f7658`
     - NRW now reaches `6aed5be9-f62f-482a-9b98-4253c3275e6e` exactly from `43b21038-8dbb-4f85-ab8e-898a9cef38fb`
   - the same Q2.1 inverse-function lane now also closes through an exact retained split of `392440db-6a43-59c0-a48d-958128fa16a8`:
     - Hessen now stays exact on `1e26404a-93ef-45f3-a28c-15679fbae96b`
     - NRW now reaches `c15fe32d-1c83-4127-b1a4-9125af3d8f5d` exactly from `85be691c-c569-4cdf-b332-b9d77d47666d`
   - the downstream inverse-graph lane is now also exact without another retained split:
     - the NRW source atom `e0c4432f-fc34-48c2-84d8-0e998b978500` now maps exactly to `dbc13bb0-963b-49a8-a441-2183f4b64c8e` after narrowing that NRW-only canonical leaf to the source wording
   - the adjacent Hessen-only follow-on atom `c72a8032-71f6-56ed-a896-06ae435ff2ec` currently has no comparably clean NRW source clause and should stay HE-only unless a later NRW source add changes that
   - the broad NRW E-phase source atom `22e2cc01-be7c-4478-8d22-0409ff5b14a0` is now resolved as a retained two-way split:
     - `ae5ec3d2-7ff8-4f08-92c0-5dec8006cf81` now maps `exact` to `30c013ac-5164-4c3c-8bc1-9a10b2f49533` (`Potenzfunktionen mit ganzzahligen Exponenten beschreiben`)
     - `fb1eebf2-3d5d-40a6-a0e5-879bb7d4f422` now maps `exact` to `1ce8af38-082a-477b-af48-b924c92761bf` (`Ganzrationale Funktionen beschreiben`)
   - the late-Sek-I power corridor is now resolved as a mixed-state exact split:
     - the broad HE/BY leaf `66077296-a8f8-4645-938b-7c3424cb2f14` keeps the Potenz-/Wurzelfunktionssurface
     - the new NRW leaf `30c013ac-5164-4c3c-8bc1-9a10b2f49533` keeps the narrower source wording without another `APV-202` bridge
     - the shared cluster is now child-driven instead of cluster-prerequisite-driven, so NRW does not need an extra prerequisite workaround for `6596405a-9728-41df-9163-53670ec2a937`
   - the retained Q1.1 productsum/area atom is now also resolved exactly:
     - `71539804-c722-4fe6-bc71-e4e2abe1773f` now maps `exact` to `269675a9-13cd-4a3a-ab75-63794f5c9710` (`Produktsummen und orientierte Flächen im Sachkontext deuten`)
   - the current NRW upper-secondary pilot snapshot now has `0` unmapped atomic goals
   - the next clean program decision is therefore no longer inside the current NRW snapshot:
     - either widen NRW source breadth beyond the current pilot subset
     - or begin the next Bundesland onboarding lane for canonical Gymnasium Mathematik

## Decision rule after NRW

After the first NRW math corridor is stable, decide using this rule:

- if the main new problems are still source-import and provenance problems, onboard one more state before widening NRW breadth
- if the main new problems are canonical-shape problems, widen NRW inside mathematics before taking the next state

The point is to learn the generic multi-state mathematics pattern as quickly as possible without opening a full nationwide scope all at once.

## Current NI rollout state

The Niedersachsen onboarding lane is now in mixed execution state:

- `DE-NI` lower-secondary now has:
  - archived raw PDF input
  - a first archived source snapshot
  - active shared provenance registration
  - active canonical jurisdiction support at root/runtime/compiler level
  - eight reviewed bridges:
    - the shared motivation leaf
    - three shared J6 arithmetic prerequisite leaves
    - one shared lower-secondary functions leaf
    - three reviewed partial lower-secondary function follow-on bridges
  - a source-backed arithmetic prerequisite strip now bridged onto the canonical arithmetic spine
- `DE-NI` upper-secondary now has:
  - archived raw PDF input
  - a first archived source snapshot
  - active shared provenance registration
  - one reviewed upper-secondary derivative-entry bridge on the shared E.2 spine

This keeps the Niedersachsen rollout aligned with the NRW pattern while still moving one bounded lane at a time.

Status update:

- `DE-NI` Stage B is complete
- `DE-NI` Stage A is now also complete through archived NIBIS mathematics PDFs and local provenance notes
- the first lower-secondary and upper-secondary `DE-NI` Stage C pilot subsets are now complete
- `DE-NI` now also has a first clean Stage-D0-style execution slice:
  - end-to-end jurisdiction activation
  - one exact lower-secondary motivation bridge
  - source-backed lower-secondary arithmetic prerequisite widening for the next pass
- `DE-NI` now also has a first clean Stage-D1-style execution slice:
  - three exact lower-secondary arithmetic bridges on the shared J6 rational-number spine
  - no new accepted-warning debt
- `DE-NI` now also has a first clean Stage-D2-style execution slice:
  - one exact lower-secondary Zuordnungen bridge on the shared function spine
  - three reviewed partial lower-secondary follow-on bridges for proportionality, function representations, and linear foundations
- `DE-NI` now also has a first clean Stage-D3-style execution slice:
  - one reviewed partial upper-secondary average-rate bridge on the shared E.2 derivative-entry spine
  - two explicit retained NI prerequisite bridges for the shared function-value atoms needed by that first E.2 route
- `DE-NI` now also has a first clean Stage-D4-style execution slice:
  - one reviewed partial upper-secondary qualitative derivative-entry follow-on bridge on the shared E.2 spine
  - one explicit retained NI prerequisite bridge for the shared difference-quotient limit atom needed by that route
- `DE-NI` now also has a first clean Stage-D5-style execution slice:
  - one reviewed partial upper-secondary pointwise derivative-interpretation bridge on the shared E.2 spine
  - no additional retained prerequisite debt beyond the already-open NI E.2 route
- `DE-NI` now also has a first clean Stage-D6-style execution slice:
  - one reviewed partial upper-secondary derivative-graph bridge on the shared E.2 spine
  - no new retained prerequisite debt beyond the already-open NI E.2 route
- `DE-NI` now also has a first clean Stage-D7-style execution slice:
  - one reviewed partial upper-secondary elementary-derivative-rules bridge on the shared E.2 spine
  - no new retained prerequisite debt beyond the already-open NI E.2 route
- `DE-NI` now also has a first clean Stage-D8-style execution slice:
  - one reviewed partial upper-secondary downstream extremal-problem bridge beyond the shared E.2 starter corridor
  - no new retained prerequisite debt beyond the already-open NI E.2 route
- `DE-NI` now also has a first clean Stage-D9-style execution slice:
  - the broad NI AB3 source atom is retained-split into tangent / monotonicity / optimization children
  - one reviewed partial upper-secondary downstream first-derivative investigation bridge now hangs on that narrower retained child
- `DE-NI` now also has a second clean Stage-D9-style execution slice:
  - the retained monotonicity / Wendestellen child is itself split into narrower monotonicity-extrema and Wendestellen children
  - the shared second-derivative curvature leaf is now backed by the narrower Wendestellen child instead of the broader first-stage split
- `DE-NI` now also has a bounded tangent-lane closure:
  - the retained tangent / normal child now backs the shared tangent-equation leaf through one reviewed partial bridge
  - no further NI source split was introduced for this lane
- the next executable NI step is now outside the retained NI E-phase starter subset:
  - either widen the NI upper-secondary source snapshot beyond the current derivative-usage corridor
  - or switch to the next Bundesland after closing the current NI pilot slice

## Preferred next state after NI: `DE-BW`

`DE-BW` is now the cleanest next onboarding target with the current repo evidence.

Reasons:

- the existing input lane already points to both:
  - `Bildungsplan 2016 / Neufassung 2024` for Gymnasium mathematics `Klassen 5-10`
  - `Bildungsplan 2016` for Gymnasium mathematics `Kursstufe`
- both references sit behind one provider family (`Landesbildungsserver Baden-Wuerttemberg`)
- Baden-Wuerttemberg adds a fifth comparison case after Hessen, Bavaria, NRW, and Niedersachsen while bringing a Kursstufe structure that should stress the shared upper-secondary spine differently from NI and NRW

Current blocker:

- Baden-Wuerttemberg now has the official combined Gymnasium mathematics source PDF archived under `curricula/DE/Gymnasium/input/BW/`
- the reserved lower-secondary `DE-BW` source lane now also has its first archived pilot snapshot and active shared provenance registration
- the upper-secondary `DE-BW` lane now also has its first archived pilot snapshot and active shared provenance registration
- the first reviewed Baden-Wuerttemberg lower-secondary mapping cut is now active on the shared motivation / first-functions anchors

Interpretation:

- Niedersachsen is now far enough through its first pilot slice that the next reusable learning step is no longer another bounded NI tangent/derivative cleanup
- the clean next repetition of the national math rollout pattern is therefore:
  - continue the BW lower-secondary `JG7/8` linear-functions corridor from the now active first mapping cut
  - this second BW cut is now active on shared graph-reading, linear-description, line-equation, and linear-rate-of-change leaves
  - the remaining broad BW representation debt has now been removed via a retained source split on `d45b4ec2-8604-490e-9c11-d3b8fc54251b`
  - the first reviewed BW upper-secondary analysis cut is now active on seven reviewed rows across five shared leaves after retained splits of both broad BW integral source atoms and the broad Basisfach e-function atom
  - the former broad Basisfach e-function source atom `d061f00d-6118-46de-a476-ec4c9112e222` is now retained-split into `e0769810-ba73-4a52-8e9c-660d1fb9d6e6` and `7bf62048-84ba-467f-ba23-f053c4e2989f`
  - the new Basisfach e-function-properties child `e0769810-ba73-4a52-8e9c-660d1fb9d6e6` now maps `partial` to `4047af71-de53-5dc3-80c6-a7c78fb4bfe4`
  - the new Basisfach Stammfunktions child `7bf62048-84ba-467f-ba23-f053c4e2989f` now maps `partial` to `a9ed219d-d497-55e5-a4e0-4d45d2554f6b`
  - the former broad Basisfach integral source atom `8f8c4bc8-5b0c-4a62-b6d7-f7fb263c7f1d` is retained-split into `97ab0ab9-9444-410d-b2d9-1ac9fa935ad8` and `e0c333ea-9873-4718-819c-d39b22ccee30`
  - the introductory-integral child `97ab0ab9-9444-410d-b2d9-1ac9fa935ad8` now maps `exact` to `2afba4a2-287d-5e8f-aeee-a3bcf8652236`
  - the separated Hauptsatz child `e0c333ea-9873-4718-819c-d39b22ccee30` now maps `partial` to `b9bbd2a8-1379-5ffb-817f-41467d48abef`
  - the former broad Leistungsfach integral source atom `37d1e9d7-6909-4421-a9f1-11f7b41061ff` is now retained-split into `72d7ad67-e2ef-41a0-bb52-b62eb5d071e0` and `fb742d93-6c9b-487a-bc7c-f54b363c0c01`
  - the new Leistungsfach introductory-integral child `72d7ad67-e2ef-41a0-bb52-b62eb5d071e0` now maps `partial` to `2afba4a2-287d-5e8f-aeee-a3bcf8652236`
  - the new Leistungsfach Hauptsatz / Integralfunktions child `fb742d93-6c9b-487a-bc7c-f54b363c0c01` now maps `partial` to `b9bbd2a8-1379-5ffb-817f-41467d48abef`
  - the retained BW analysis debt on this spine is now explicit and small: one prerequisite `APV-201` on `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6` plus bridge-width `APV-202` on the shared simple-integral and Hauptsatz nodes where the BW source stays intentionally narrower or differently bundled
  - the adjacent Basisfach composition / application slice is now also active on two further reviewed partial bridges:
    - `46690ab9-0b1f-4bd9-9409-4976a40c6ec2` -> `e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c`
    - `c5739dd3-a261-4229-aff6-678d8ee618b3` -> `1511b39a-4094-5450-a755-4a3ad3339733`
  - the aligned Leistungsfach composition / application follow-on is now also active on the same opened derivative / integral corridor:
    - `13e285f3-522c-4eae-9fed-8b13b2af7b7d` -> `e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c`
    - `8ab263f6-a460-4ca2-bbe9-b7e9a22bbaa2` -> `1511b39a-4094-5450-a755-4a3ad3339733`
  - the next reusable BW step should now decide how to handle the still-broad Leistungsfach e/logarithm front atom `fa4597c7-fabd-4a55-8be3-d06f7c432738`
