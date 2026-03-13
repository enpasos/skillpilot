# Canonical Gymnasium Implementation Plan

This document turns the rollout strategy from the concept docs into an implementation-oriented plan.

See also:

- `docs/concept/curriculum-graph/canonical-gymnasium-rollout.md`

## Purpose

The implementation should start without breaking:

- existing Hessen learner flows,
- existing Custom GPT flows,
- the current unified learner-state contract.

The project should therefore start with a small, testable pilot rather than a broad curriculum rewrite.

## Guardrails

- Do not duplicate canonical goals per Bundesland.
- Keep `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` operational throughout the transition.
- Keep the Custom GPT interface unchanged: one learner state, one frontier, one mastery flow.
- Use ISO 3166-2 state codes in new Bundesland-facing metadata, filters, and API-visible fields, for example `DE-HE` and `DE-BY`.
- Do not rename existing curriculum directory segments just to enforce that convention during the pilot.
- Prefer additive infrastructure over destructive migration.
- Introduce only the minimum new data structures required for the first pilot.
- Preserve multi-subject navigation as a design target from the beginning.

## First implementation slice

The first slice should be:

- subject: Mathematics
- source: Hessen Gymnasiale Oberstufe
- mode: additive pilot

This slice should produce a canonical math pilot without yet changing the outward-facing learner workflow.

## Deliverables

### D1. Canonical pilot landscape

Create one first canonical mathematics landscape derived from the mature Hessen upper-secondary mathematics landscape.

Initial constraints:

- runtime-compatible `LearningLandscape` JSON
- no broad restructuring yet
- IDs stable inside the canonical file
- only one subject in scope

### D2. Goal mapping file

Create one explicit mapping file from Hessen upper-secondary mathematics goals to canonical mathematics goals.

Pilot scope:

- support `exact`
- support `partial`
- avoid larger semantics until needed

### D3. Backend projection layer

Add a small backend component that can:

- resolve canonical mastery from legacy mastery via mappings,
- keep current learner-state responses stable,
- hide legacy/canonical complexity from the Custom GPT.

The projection layer should be read-first. Do not start with an invasive write migration.

### D4. Invariant tests

Add tests proving that, for the overlapping Hessen pilot scope:

- learner state remains available,
- frontier behavior stays stable,
- mastery projection is deterministic,
- existing API/controller contracts remain unchanged.

## Work packages

## WP0. Baseline inventory

Status: `done`

Tasks:

- identify the exact Hessen mathematics source landscape file(s)
- identify which goal IDs are already stable enough for mapping
- identify backend classes responsible for goal loading, learner state, frontier, and mastery persistence
- identify where a mapping registry can be added with minimal surface area

Expected output:

- one short inventory note in `tmp/canonical-gymnasium-work_notes.md`

Baseline inventory result:

- Hessen upper-secondary mathematics source file identified:
  `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json`
- source landscape ID identified:
  `2796fc7b-ba9d-446f-8f26-711dd6d8a9a3`
- smallest backend insertion points identified:
  - landscape loading / lookup: `backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java`
  - mastery read / write and unified learner state: `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java`
- mapping files can safely live under curriculum-adjacent directories as plain JSON files because the current landscape loader already skips JSON files that do not expose `landscapeId` plus a `goals` array

## WP1. Mapping format and loader

Status: `done`

Tasks:

- define the mapping JSON shape
- add a backend loader for mapping files
- validate duplicate or conflicting mappings early
- keep the format intentionally narrow for the pilot

Suggested initial file location:

- `curricula/.../mapping/` or another curriculum-adjacent location that keeps ownership visible

Decision rule:

- choose the smallest location and loader design that does not force later duplication

WP1 result:

- minimal mapping format implemented in backend:
  - top-level fields: `version`, `sourceLandscapeId`, `targetLandscapeId`, `mappings`
  - entry fields: `legacyGoalId`, `canonicalGoalId`, `matchType`
- supported `matchType` values currently:
  - `exact`
  - `partial`
- conflicting duplicate mappings for the same `legacyGoalId` are rejected eagerly
- non-landscape, non-mapping JSON files continue to be ignored
- initial storage convention for authored mapping files:
  - keep them curriculum-adjacent under `curricula/.../mapping/*.json`
- Bundesland identifier convention for later overlay/filter metadata:
  - use ISO 3166-2 codes such as `DE-HE` and `DE-BY`
  - keep existing repo path segments such as `DE/HE` unchanged unless a separate filesystem migration becomes necessary
- mapping discovery rule:
  - inspect ordinary `.json` files and identify mapping files by JSON shape, not by a special filename suffix
- mapping files intentionally omit `landscapeId` and `goals`, so the existing `LandscapeService` continues to ignore them
- implementation classes:
  - `backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingService.java`
  - `backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingFile.java`
  - `backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingEntry.java`
  - `backend/src/main/java/com/skillpilot/backend/landscape/ResolvedGoalMapping.java`
- initial test coverage:
  - `backend/src/test/java/com/skillpilot/backend/landscape/GoalMappingServiceTest.java`

## WP2. Canonical math pilot

Status: `done`

Tasks:

- create the first canonical mathematics landscape file
- keep the file close to the current `LearningLandscape` structure
- document the provenance from Hessen upper-secondary mathematics
- do not mix in Bayern or Sek I yet

Acceptance criteria:

- file loads through the normal landscape-loading path
- graph validation passes

WP2 result:

- first canonical mathematics pilot landscape added:
  - `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- first real Hessen-to-canonical mapping fixture added:
  - `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_math_upper_secondary_to_canonical_math_pilot.json`
- pilot location decision for now:
  - keep the first canonical seed close to the mature Hessen source to avoid premature global restructuring
- pilot scope kept intentionally small:
- pilot root
  - motivation goal
  - one introductory analysis branch for functions and representations
- coexistence strategy:
  - all pilot goals use new IDs
  - the pilot landscape is exposed as its own root curriculum so it can be selected directly during the pilot
- verification:
  - backend tests confirm loading of the pilot landscape and the repository mapping fixture
  - graph validation passes with the new pilot landscape present

## WP3. Read-side mastery projection

Status: `done`

Tasks:

- compute canonical mastery from mapped legacy mastery
- keep legacy mastery storage intact
- do not require Custom GPT changes
- do not force learner data migration yet

Important note:

- mastery is currently keyed by learner + goal key, not by learner + landscape, so projection can be introduced additively

WP3 result:

- read-side projection added in:
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getMastery`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getMasteryWithTimestamps`
- pilot projection rule for now:
  - only `exact` mappings project mastery into canonical goals
  - projection only applies when the canonical goal is visible in the current selected curriculum view
  - higher existing canonical mastery wins over projected legacy mastery
  - timestamped reads break ties by newer timestamp
- effect on runtime behavior:
  - legacy Hessen views keep their stored mastery behavior
  - canonical pilot views can consume projected legacy mastery without GPT/API changes
  - frontier and learner-state assembly automatically benefit because they already read mastery through `LearnerService`
- direct test coverage now includes:
  - canonical mastery read projection
  - canonical frontier based on projected legacy mastery
  - canonical learner-state compatibility without legacy goal leakage
  - legacy-view non-leakage in the opposite direction

## WP4. Learner-state compatibility

Status: `done`

Tasks:

- ensure `getLearnerState` can still return one coherent state
- ensure frontier logic remains stable for legacy Hessen learners
- ensure canonical pilot views can consume projected mastery
- avoid any requirement that the GPT must understand data-layer transitions

Acceptance criteria:

- no new mandatory GPT actions
- no new client-side branching based on legacy/canonical mode

WP4 result:

- learner-state compatibility added around view-dependent goal IDs in:
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getLearnerState`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getRichFrontier`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getPlannedGoals`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#setPlannedGoals`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#setActiveGoal`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#setMastery`
- current compatibility rule:
  - when the current selected curriculum exposes canonical goals, legacy goal IDs are normalized into visible canonical goal IDs where a mapping exists
  - `exact` mappings are used for active-goal and mastery flows
  - `partial` mappings are additionally allowed for planned-goal / scope anchoring
  - persistence stays lightweight: no bulk migration of stored learner state is required for the pilot
- practical effect:
  - canonical pilot views no longer leak mapped legacy IDs into planned goals or active-goal state
  - `setMastery` can complete successfully even if the stored active goal is still a legacy ID but the visible tutoring loop is canonical
  - UI/GPT flows keep one coherent learner-state contract
- targeted verification now covers:
  - projected planned-goal IDs in canonical view
  - projected active-goal IDs in canonical view
  - canonical mastery writes when the stored active goal originated from a legacy ID

## WP5. Test coverage

Status: `in_progress`

Tasks:

- add unit tests for mapping load and lookup
- add service tests for mastery projection
- add learner-state invariants for the pilot
- add one regression test ensuring legacy Hessen behavior remains intact

## WP6. Hessen Sek I math attachment

Status: `in_progress`

Tasks:

- extend canonical mathematics downward with Hessen Sek I
- keep mappings explicit
- avoid changing the API surface while expanding content coverage

WP6 progress so far:

- first Hessen Sek I attachment slice added to the canonical math pilot:
  - mappings / functional relationships
  - proportional relationships
  - linear functions
  - quadratic equations
  - quadratic functions
- canonical seed now references both Hessen upper-secondary and Hessen Sek I source material
- explicit second mapping file added for Hessen Sek I -> canonical pilot
- no API/GPT contract changes were required for this content expansion

## WP7. Bavaria math mapping

Status: `in_progress`

Tasks:

- map `curricula/DE/BY/Gymnasium/Mathematik.json` into the canonical mathematics layer
- preserve Bavarian structure as placement/view metadata rather than duplicated content

WP7 progress so far:

- first Bavaria mapping fixture added:
  - `curricula/DE/BY/Gymnasium/mapping/bavaria_math_to_canonical_math_pilot.json`
- initial pilot scope stays deliberately narrow and reuses the already stabilized canonical function path:
  - function concept
  - linear-function interpretation
  - line equations, roots, and line intersections
  - direct proportionality
  - vertex determination for quadratic functions
  - quadratic-function interpretation
  - quadratic graph properties
  - solving quadratic equations
- the canonical pilot now carries two small Bavaria-compatible atoms instead of forcing narrower Bavarian goals onto broader pre-existing canonical goals:
  - `Lineare Funktionen rechnerisch untersuchen`
  - `Scheitelpunkte quadratischer Funktionen bestimmen`
- these two atoms are now also anchored on the Hessen Sek-I side with explicit `partial` mappings from:
  - `Lineare Gleichungen und Ungleichungen loesen`
  - `Binomische Formeln nutzen`
- Bavarian topic clusters currently map with `partial` semantics into the canonical Sek-I function cluster so scope/planning can converge without duplicating content
- targeted repository-fixture and learner-service regression tests now cover this first Bavaria slice

## WP8. Cross-subject pilot

Status: `later`

Tasks:

- add a first combined Mathematics + Physics view
- add only a small set of explicit Mathe -> Physik `requires` edges
- verify that navigation improves before expanding cross-subject dependencies further

## Recommended execution order

1. WP0 baseline inventory
2. WP1 mapping format and loader
3. WP2 canonical math pilot
4. WP3 read-side mastery projection
5. WP4 learner-state compatibility
6. WP5 test coverage
7. WP6 Hessen Sek I math attachment
8. WP7 Bavaria math mapping
9. WP8 cross-subject pilot

## Status model

Use these status values in this document and in work notes:

- `todo`
- `in_progress`
- `blocked`
- `done`
- `later`

## Change policy

Use `docs/` for durable project knowledge:

- architecture decisions
- rollout stages
- stable file formats
- accepted migration rules

Use `tmp/canonical-gymnasium-work_notes.md` for volatile execution notes:

- current sprint status
- open questions
- intermediate decisions
- concrete next actions

## Definition of a good first milestone

The first milestone is successful if:

- a canonical mathematics pilot exists,
- Hessen upper-secondary mathematics maps into it,
- current learner APIs still behave the same from the GPT point of view,
- at least one deterministic mastery projection path is tested,
- no existing Hessen learner workflow is broken.
