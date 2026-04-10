# Canonical Gymnasium Physics Parity Plan

Snapshot: `2026-04-10`

This document defines the concrete path for bringing canonical DE Gymnasium Physics to the same operational level as canonical Mathematics.

It does not mean "same size" or "same number of Bundeslaender on day one".
It means "same artifact family, same validation discipline, same runtime readiness, and the same migration hygiene".

See also:

- `docs/dev/canonical-gymnasium-implementation-plan.md`
- `docs/dev/canonical-gymnasium-migration-status.md`
- `docs/dev/canonical-gymnasium-math-bundeslaender-status.md`
- `docs/concept/curriculum-graph/canonical-gymnasium-rollout.md`

## 1. Definition of parity

Physics is on mathematics-level parity only when all of the following are true:

1. the canonical Physics landscape carries the same reviewed schema layers that Mathematics already uses where they are semantically justified:
   - `programUnits`
   - `goalPlacements`
   - `competencyCatalog`
   - reviewed `competencyRefs`
2. learner-facing composition views exist as explicit reviewed files rather than relying on implicit runtime fallback alone
3. reviewed source lanes are represented through stable mapping and provenance artifacts
4. applicability is compiled and validated from the same DE-level registry and view-filter pipeline
5. backend/runtime tests cover the Physics-specific landscape, mapping, and composition-view contracts
6. "pilot" naming survives only where the content is still intentionally provisional

Non-goal:

- forcing Physics to copy mathematics-specific semantics or counts

Parity means Physics should use the same machinery.
It does not mean Physics must immediately have `800` goals, `70` composition views, or `31` mapping files.

## 2. Current baseline

Observed repository state on `2026-04-10`:

| Area | Mathematics | Physics | Gap |
| --- | ---: | ---: | --- |
| goals in canonical file | `800` | `433` | size is fine; not the main problem |
| goals with `applicability` | `800` | `433` | already good on both |
| goals with `shortKey` | `276` | `98` | acceptable but can widen over time |
| `programUnits` | `14` | `0` | missing in Physics |
| `goalPlacements` | `81` | `0` | missing in Physics |
| `competencyCatalog` entries | `6` | `0` | missing in Physics |
| goals with `competencyRefs` | `52` | `0` | missing in Physics |
| composition views | `70` | `5` | Physics has only DE-wide baseline views |
| committed mapping files | `31` | `3` | Physics only has Hessen Sek I, Hessen Sek II, Bavaria pilot |

Relevant files today:

- canonical reference:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- canonical target:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- current Physics composition views:
  - `curricula/DE/Gymnasium/composition-views/physik/de-de-gym-seki-physics.view.json`
  - `curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-gk.view.json`
  - `curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-lk.view.json`
  - `curricula/DE/Gymnasium/composition-views/physik/de-de-gym-sekii-physics-gk.view.json`
  - `curricula/DE/Gymnasium/composition-views/physik/de-de-gym-sekii-physics-lk.view.json`
- current Physics mappings:
  - `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_to_canonical_physics.json`

Important asymmetry:

- Mathematics already has the full DE-level scope machinery.
- Physics is already runtime-relevant and cutover-capable for reviewed corridors, but still structurally looks like a narrower subject pilot.

## 3. Target shape

The Physics parity target has two layers:

### 3.1 M1: Hessen + Bavaria hardened parity

This is the first serious target.
Physics should reach the same artifact discipline as the current hardened multi-state subjects, while still only covering reviewed Hessen and Bavaria slices.

Required outcome:

- canonical Physics file includes reviewed `programUnits`, `goalPlacements`, and a small reviewed `competencyCatalog`
- Physics composition views exist not only for DE-wide defaults, but also for the reviewed state scopes that already have mappings
- current reviewed mappings and provenance lanes no longer look like temporary pilot leftovers
- validation and backend tests explicitly fence this hardened state

### 3.2 M2: Bundesland rollout framework parity

This is the second target.
Physics should then support the same style of further state expansion as Mathematics.

Required outcome:

- a stable Physics rollout tracker exists
- new state onboarding can be done lane-by-lane without inventing a new process
- view naming, mapping naming, provenance updates, applicability compilation, and runtime tests follow a repeatable pattern

## 4. Work packages

## WP1. Canonical schema parity

Status: `planned`

Primary file:

- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`

Tasks:

- add reviewed `programUnits` for:
  - `Gymnasium`
  - `SekI`
  - `SekII`
  - relevant phase/year buckets already implicit in the graph
  - `GK` / `LK` / exam units only where they drive placement or learner views
- add reviewed `goalPlacements` for the currently adopted Physics corridors
- introduce a minimal Physics `competencyCatalog` only for reviewed, source-backed axes
- add `competencyRefs` only where the source semantics are clear enough; do not bulk-stamp them
- normalize remaining `shortKey` names that still encode "pilot" when the node is no longer provisional

Guardrails:

- do not rewrite the whole Physics graph just to force a math-shaped ontology
- keep authored `requires` inside the base Physics landscape intra-landscape
- keep the existing Math bridge intact; do not duplicate math atoms into Physics

Exit criteria:

- Physics top-level keys match the mathematics artifact family where applicable
- new structural metadata is validated by existing graph/runtime loaders
- no runtime contract breaks for existing Physics learner flows

## WP2. Composition-view parity

Status: `planned`

Primary directory:

- `curricula/DE/Gymnasium/composition-views/physik/`

Current gap:

- Physics has only `5` DE-wide views
- Mathematics has explicit DE-wide and state-scoped views across stage/course combinations

Tasks:

- keep the existing five DE-wide Physics views as the default baseline
- add reviewed state-scoped Physics views for the states that already have committed mappings:
  - `DE-HE`
  - `DE-BY`
- use the mathematics convention: explicit reviewed scope files instead of hidden runtime reparenting
- compile each view against the canonical Physics landscape and enforce single-occurrence output

Recommended first view matrix:

- `de-he-gk.view.json`
- `de-he-lk.view.json`
- `de-he-sekii-gk.view.json`
- `de-he-sekii-lk.view.json`
- `de-by-gk.view.json`
- `de-by-lk.view.json`
- `de-by-sekii-gk.view.json`
- `de-by-sekii-lk.view.json`

Optional later extension:

- `de-he-seki.view.json`
- `de-by-seki.view.json`

if and only if the reviewed Sek-I slices are strong enough to justify separate learner-facing trees.

Exit criteria:

- `app/package.json` validation path stays clean for the new Physics views:
  - `npm run validate:composition-views`
  - `npm run validate:view-filters`
- backend composition-view matching is covered for the new Physics scope files

## WP3. Mapping parity

Status: `planned`

Current Physics mapping baseline:

- Hessen Sek II: `376` mappings
- Hessen Sek I: `53` mappings
- Bavaria Gymnasium: `26` mappings

Tasks:

- harden the current reviewed Physics mappings first
- decide whether the remaining `*_pilot.json` filenames still describe reality
- if the reviewed scope is now stable enough, rename:
  - `hessen_physics_upper_secondary_to_canonical_physics.json`
  - `bavaria_physics_to_canonical_physics.json`
  to non-pilot filenames
- update all repository references together:
  - backend tests
  - retained-asset registries
  - scripts
  - docs
- only then plan additional state onboarding

Rule:

- naming cleanup is not cosmetic here
- as long as filenames and short keys still say `pilot`, downstream readers will continue to treat Physics as a special case

Exit criteria:

- mapping filenames reflect the actual operational state
- repository fixture tests cover the current canonical filenames
- no retained-asset registry or script still depends on obsolete pilot names

## WP4. Provenance and applicability parity

Status: `planned`

Primary files:

- `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
- `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
- `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
- `curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json`

Tasks:

- verify that every reviewed Physics source lane used for cutover has matching DE-level provenance coverage
- move remaining Physics-specific exceptions out of canonical graph JSON where the repo policy already expects registry-based overrides
- compile and review Physics applicability with the same pipeline used for Mathematics
- avoid Physics-only special cases in runtime filtering unless there is a documented reason

Recommended follow-up artifact once a third non-Hessen state becomes active:

- `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`

This does not need to exist before M1.
It becomes useful once Physics is no longer just a Hessen+Bavaria lane.

Exit criteria:

- applicability compilation stays clean for the reviewed Physics scope
- provenance lookups do not depend on live legacy trees
- Physics no longer needs subject-specific runtime exceptions just to behave like other canonical subjects

## WP5. Runtime and test parity

Status: `planned`

Primary test surfaces:

- `backend/src/test/java/com/skillpilot/backend/service/CompositionViewServiceTest.java`
- `backend/src/test/java/com/skillpilot/backend/landscape/GoalMappingRepositoryFixtureTest.java`
- `backend/src/test/java/com/skillpilot/backend/landscape/LandscapeServiceTest.java`

Tasks:

- extend composition-view matching tests for the new Physics state-scoped views
- extend mapping-fixture tests if Physics mapping filenames or counts change
- add Physics assertions for the new structural metadata:
  - `programUnits`
  - `goalPlacements`
  - `competencyCatalog`
- keep closure tests proving that canonical Physics continues to pull in canonical Mathematics, not legacy math
- keep view-filter validation and composition-view validation on the normal QA path

Validation commands:

```bash
cd app
npm run validate:graph
npm run validate:view-filters
npm run validate:composition-views
```

```bash
cd backend
./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.service.CompositionViewServiceTest'
```

Exit criteria:

- the Physics parity bundle is guarded by the same automated checks as Mathematics
- no new Physics behavior is validated only manually

## WP6. Naming and residue cleanup

Status: `planned`

Tasks:

- remove `pilot` from active Physics naming where the subject is no longer a pilot in practice
- audit internal identifiers and comments that still encode obsolete staging
- align backend constant names such as `CANONICAL_PHYSICS_PILOT_ID` only after repository file naming is settled
- keep rename churn tightly bundled with test and registry updates

Important:

- do not start with renames alone
- do renames only after the schema/view/provenance work makes the new name truthful

Exit criteria:

- repository naming describes the real operational state
- future contributors do not need to guess whether Physics is still an exception lane

## 5. Recommended execution order

1. harden the canonical Physics file:
   - `programUnits`
   - `goalPlacements`
   - minimal reviewed `competencyCatalog`
2. add the first state-scoped Physics composition views for `DE-HE` and `DE-BY`
3. compile/apply applicability and clean up registry-backed exceptions
4. rename current mapping artifacts away from `pilot` only if the hardened state is now real
5. extend backend tests and app validation to fence the new state
6. only after that, decide whether a broader Physics Bundesland rollout should start

This order matters.
If we rename first, we only hide the remaining parity debt.
If we add more states first, we multiply debt across more files.

## 6. Definition of done

Physics is "at the same level as mathematics" for current repo purposes when:

- the canonical Physics file carries the same reviewed schema classes as Mathematics where semantically justified
- reviewed `DE-HE` and `DE-BY` Physics scopes have explicit composition-view files
- reviewed Physics mappings and registries no longer look like temporary pilot residue
- the standard app and backend validation commands cover the Physics parity bundle
- no active Physics artifact that is already part of the stable canonical path still needs the word `pilot`

At that point, Physics is no longer a special migration corridor.
It becomes a normal canonical DE Gymnasium subject with the same operational tooling standard as Mathematics.
