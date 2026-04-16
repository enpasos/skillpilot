# Canonical Gymnasium Physics Parity Plan

Snapshot: `2026-04-16`

This document tracks the path for bringing canonical DE Gymnasium Physics to the same operational level as canonical Mathematics.

Parity does not mean "same size" or "same number of Bundeslaender".
It means "same artifact family, same validation discipline, same runtime readiness, and the same migration hygiene".

See also:

- `docs/dev/canonical-gymnasium-implementation-plan.md`
- `docs/dev/canonical-gymnasium-migration-status.md`
- `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`
- `docs/dev/canonical-gymnasium-physics-topic-workboard.md`
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
6. "pilot" naming survives only where the content is still intentionally historical or provisional

Non-goal:

- forcing Physics to copy mathematics-specific semantics or counts

Parity means Physics should use the same machinery.
It does not mean Physics must immediately have `800` goals, `70` composition views, or `31` mapping files.

## 2. Current state

Observed repository state on `2026-04-16` after the current hardening, BW rollout, Berlin widening, Brandenburg retained `3.2.1` -> `3.2.2` widening, the Schleswig-Holstein first-entry plus three retained SH follow-ons on the same field source family, and the Rheinland-Pfalz widening through the first GF quantum corridor `Quantenobjekte I` plus the adjacent GF atom-model corridor `Quantenmechanische Atomvorstellung I`:

| Area | Mathematics | Physics | Comment |
| --- | ---: | ---: | --- |
| goals in canonical file | `800` | `433` | size difference is fine |
| goals with raw inline `applicability` | `800` | `57` | Physics now relies on registry-backed applicability compilation for the hardened corridor |
| goals with `shortKey` | `276` | `98` | acceptable for now |
| `programUnits` | `14` | `9` | M1 schema layer now present in Physics |
| `goalPlacements` | `81` | `19` | M1 placement layer now present in Physics |
| `competencyCatalog` entries | `6` | `5` | Physics now has reviewed process-competency entries |
| goals with `competencyRefs` | `52` | `17` | focused reviewed coverage, not bulk-stamped |
| composition views | `70` | `13` | Physics now has DE-wide + `DE-HE` + `DE-BY` reviewed views |
| committed mapping files | `31` | `8` | Physics has Hessen Sek I, Hessen Sek II, Bavaria Gymnasium, Baden-Wuerttemberg upper-secondary, Berlin upper-secondary, Brandenburg upper-secondary, Schleswig-Holstein upper-secondary, and Rheinland-Pfalz upper-secondary |

Relevant Physics files:

- canonical landscape:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- composition-view lanes:
  - DE-wide baseline: `curricula/DE/Gymnasium/composition-views/physik/de-de-gym-*.view.json`
  - Hessen scope views: `curricula/DE/Gymnasium/composition-views/physik/de-he-*.view.json`
  - Bavaria scope views: `curricula/DE/Gymnasium/composition-views/physik/de-by-*.view.json`
- mapping lanes:
  - `curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_physics_upper_secondary_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_physics_upper_secondary_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_physics_upper_secondary_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
- registry-backed provenance/applicability:
  - `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
  - `curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json`

Important asymmetry:

- Mathematics still has the broader Bundesland and composition-view footprint.
- Physics now matches the artifact discipline for the currently reviewed Hessen+Bavaria corridor.
- The remaining gap is rollout breadth, not basic canonical machinery.

## 3. Milestones

### 3.1 M1: Hessen + Bavaria hardened parity

Status: `completed`

Delivered outcome:

- canonical Physics now includes reviewed `programUnits`, `goalPlacements`, and a minimal reviewed `competencyCatalog`
- Physics now has explicit state-scoped composition views for `DE-HE` and `DE-BY`
- active mapping and canonical identifiers no longer present Physics as a live `pilot`
- Physics provenance and applicability exceptions now live in the DE-level registries instead of staying inline in the canonical graph JSON
- backend and app validation now fence this hardened state directly

Validation evidence from this cycle:

```bash
cd app
npm run validate:graph
npm run validate:view-filters
npm run validate:composition-views
```

Observed results:

- `validate:graph`: `593 landscape(s) passed validation.`
- `validate:view-filters`: `0 error(s), 1382 warning(s), 337 accepted warning(s)`
- `validate:composition-views`: `86 composition view(s) passed validation.`

```bash
cd backend
./gradlew test --tests 'com.skillpilot.backend.service.CompositionViewServiceTest'
./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'
./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.service.LearnerServiceCrossSubjectPilotTest' --tests 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest'
```

Observed results:

- Physics composition-view matching tests pass for `DE-HE` and `DE-BY`
- `LandscapeServiceTest` and `GoalMappingRepositoryFixtureTest` pass with the registry-backed Physics assertions
- the cross-subject learner/controller regression bundle stayed green during the active naming cleanup

### 3.2 M2: Bundesland rollout framework parity

Status: `active`

Required outcome:

- Physics onboarding for the next Bundesland follows a repeatable lane-by-lane process
- state-scoped view naming, mapping naming, provenance updates, applicability compilation, and runtime tests follow the same discipline already used by Mathematics
- the first concrete post-`M1` lane is selected and documented in:
  - `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`
- the first concrete post-`M1` lane now exists as an active DE-level source lane:
  - `DE-NW` upper-secondary Physics source snapshot + registry activation + mapping scaffold
- the next concrete post-`M1` lane now also exists as an active DE-level source lane with one first reviewed corridor:
  - `DE-BW` upper-secondary Physics source snapshot + registry activation + first reviewed field corridor
- the first concrete fifth-state lane now also exists as an active DE-level source lane with one first reviewed corridor:
  - `DE-BE` upper-secondary Physics source snapshot + registry activation + first reviewed Q1 field/capacitor corridor
- the first concrete sixth-state lane now also exists as an active DE-level source lane with one first reviewed corridor:
  - `DE-BB` upper-secondary Physics source snapshot + registry activation + first reviewed Q1 field/capacitor corridor plus first retained `3.2.1` magnetic-field / Lorentz-force follow-on and first retained `3.2.2` charged-particle-motion follow-on from the shared BE/BB upper-secondary source family
- the first concrete seventh-state lane now also exists as an active DE-level source lane with one first reviewed corridor:
  - `DE-SH` upper-secondary Physics source snapshot + registry activation + first reviewed field-concept corridor plus three retained follow-ons on the official SH topic `Elektrische und magnetische Felder`
- the next explicit new-state lane now exists as an active DE-level source lane with four first reviewed GF/LF-common corridors, one first reviewed GF wave corridor, three reviewed GF/LF oscillation/wave follow-ons, and one first reviewed GF quantum corridor:
  - `DE-RP` upper-secondary Physics source snapshot + registry activation + first reviewed GF/LF-common field-concept corridor plus first reviewed GF/LF-common static-field interaction follow-on plus one narrow reviewed `Hall-Effekt` follow-on plus two adjacent conservative LK follow-ons on `Kreisbahnen` and `gekreuzten Feldern` plus first reviewed GF/LF-common induction corridor plus one adjacent shared self-induction/switching follow-on and one adjacent narrow LK induction follow-on on `Differentialform` plus one first reviewed GF/LF-common harmonics corridor plus one first reviewed GF wave corridor `Harmonische Wellen` plus one first reviewed GF superposition/interference follow-on `Superposition von Wellen` plus one first narrow LF wave/superposition follow-on `Harmonische Wellen und ihre Superposition` plus one first narrow LF-Pflichtbaustein follow-on `Schwingungen und Wellen` plus one first reviewed GF quantum corridor `Quantenobjekte I` plus one adjacent first reviewed GF atom-model corridor `Quantenmechanische Atomvorstellung I`, while the remaining RP oscillation/wave micro-residues on `Periodendauer`, `Polarisation`, `Weisslichtspektrum`, and `gekoppelte Schwingungen` stay explicitly frozen and the RP Planck-estimation clause stays intentionally source-led on the current reviewed cut
- once a third active Physics state becomes real on the canonical path, a stable rollout tracker is introduced:
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`

### 3.3 Open delta vs Mathematics

The remaining Physics-vs-Math gap is now mainly this:

- fewer reviewed Bundesland source lanes
- fewer learner-facing state-scoped composition views
- narrower `shortKey` and `competencyRefs` coverage
- the Physics-specific Bundesland rollout tracker is now present for the active Hessen/Bayern/Niedersachsen/Nordrhein-Westfalen/Baden-Wuerttemberg/Berlin/Brandenburg/Schleswig-Holstein/Rheinland-Pfalz surface

## 4. Work packages

### WP1. Canonical schema parity

Status: `completed (M1)`

Delivered:

- added `9` Physics `programUnits`
- added `19` Physics `goalPlacements`
- added a reviewed Physics `competencyCatalog` with `5` process entries
- added focused `competencyRefs` coverage to `17` goals
- removed active `pilot` residue from canonical Physics naming where the node is no longer provisional

Follow-up:

- widen `competencyRefs` or placements only when the next reviewed source lane justifies it

### WP2. Composition-view parity

Status: `completed (M1)`

Delivered:

- kept the existing `5` DE-wide Physics views as baseline
- added `8` reviewed state-scoped Physics views:
  - `de-he-gk.view.json`
  - `de-he-lk.view.json`
  - `de-he-sekii-gk.view.json`
  - `de-he-sekii-lk.view.json`
  - `de-by-gk.view.json`
  - `de-by-lk.view.json`
  - `de-by-sekii-gk.view.json`
  - `de-by-sekii-lk.view.json`
- added backend matching tests so these files win over the DE-wide fallback where they should

Follow-up:

- add separate Sek-I state views only if the reviewed lower-secondary slices become strong enough to justify distinct learner-facing trees

### WP3. Mapping parity

Status: `completed (M1)`

Delivered:

- retired the active `*_pilot.json` filenames on the reviewed Physics lanes
- stabilized the current mapping filenames:
  - `hessen_physics_upper_secondary_to_canonical_physics.json`
  - `hessen_physics_lower_secondary_to_canonical_physics.json`
  - `bavaria_physics_to_canonical_physics.json`
- updated repository references across backend tests, retained-asset registries, scripts, and docs

Follow-up:

- onboard additional states lane-by-lane; do not reopen the finished naming cleanup unless a new lane makes it necessary

### WP4. Provenance and applicability parity

Status: `completed (M1)`

Delivered:

- moved active Physics provenance and applicability overrides out of the canonical graph JSON and into the shared DE-level registries
- added runtime coverage proving that localized canonical Physics unions registry overrides with derived applicability
- kept Physics on the same registry-backed applicability path as other canonical subjects

Follow-up:

- keep `physics-bundesland-rollout-tracker.json` aligned once another Physics state or corridor becomes active

### WP5. Runtime and test parity

Status: `completed (M1)`

Delivered:

- extended backend coverage for Physics composition-view matching
- extended `LandscapeServiceTest` for:
  - `programUnits`
  - `goalPlacements`
  - `competencyCatalog`
  - `competencyRefs`
  - registry-backed Physics provenance/applicability behavior
- kept mapping fixture coverage aligned with the stable non-pilot Physics filenames
- kept the standard app validation commands on the normal QA path

Follow-up:

- for each new Physics Bundesland lane, add at least:
  - mapping fixture coverage
  - registry/provenance runtime assertions
  - composition-view matching assertions if new scoped views are introduced

### WP6. Naming and residue cleanup

Status: `completed for the active canonical Physics path`

Delivered:

- active canonical Physics short keys and framework tags no longer describe the subject as a live pilot
- backend constant names for the active canonical Physics identifier were aligned with the stable naming
- the generator script now cleans active Physics naming on rebuild instead of reintroducing stale pilot residue

Remaining historical residue that is currently acceptable:

- `LearnerServiceCrossSubjectPilotTest`
- `cross-subject-pilot-learner`
- legacy-guard branches inside the adoption script

These are historical/test-scope names, not active canonical Physics identifiers.

## 5. Recommended next execution order

M1 is done.
The next useful order is still `M2`, but it should now run **topic first** on the active Physics surface:

1. choose the active Physics topic row in `docs/dev/canonical-gymnasium-physics-topic-workboard.md`
2. compare that row across all currently available Bundesland sources and make the unresolved cells explicit
3. add or refine the narrow source snapshot and committed mappings only for the next unresolved state cell inside that row
4. extend applicability and source registries for the newly reviewed topic slice
5. add state-scoped composition views only where the learner-facing tree actually differs from the DE-wide default
6. add the minimal runtime/backend tests that fence the widened topic slice
7. keep `programUnits`, `goalPlacements`, and `competencyRefs` growth source-led rather than trying to pre-expand them speculatively
8. once the active row is stable again, move to the next unresolved state cell in the same row before reopening another Physics topic

This matters because the old M1 debt is no longer the blocker.
The next risk is rollout entropy across new state lanes and cross-topic churn.

## 6. Definition of done

For current repo purposes, Physics has already reached `M1`.

Physics reaches full mathematics-style rollout parity when:

- reviewed additional Bundesland lanes can be onboarded without inventing a Physics-only process
- the standard app/backend validation bundle remains the fence for each new lane
- any remaining historical `pilot` wording is limited to legacy/test context and no longer appears on active canonical artifacts
- Physics expansion is driven by the same stable mapping, registry, view, and runtime contracts that Mathematics already uses

Current verdict:

- `M1 Hessen + Bavaria hardened parity`: done
- `M2 Bundesland rollout framework parity`: next
