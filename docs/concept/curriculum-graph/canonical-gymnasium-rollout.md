# Canonical Gymnasium Rollout Plan

This document captures the rollout strategy for converging the existing German Gymnasium curricula into a shared competence layer without duplicating content per Bundesland.

The plan is intentionally conservative:

- keep the current Hessen landscapes working,
- avoid a big-bang rewrite,
- keep the Custom GPT contract simple,
- introduce only the minimum additional structure required for migration.

## Context

Current repository status:

- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` is the most mature Gymnasium curriculum area and defines the rollout starting point.
- `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe` already covers Hessen Sekundarstufe I in the same general direction.
- `curricula/DE/BY/Gymnasium` already provides broad Bavaria subject coverage, but in a less normalized structure than the Hessen upper-secondary JSON landscapes.

Repository layout rule for the rollout:

- existing source curricula under state-owned paths such as `curricula/DE/HE/.../json/` remain legacy source material and should not be rewritten just to host canonical convergence
- canonical Gymnasium subject landscapes should live on a Germany-level path, not inside a single Bundesland subtree

The strategic objective is not to preserve state-specific duplication forever, but to converge towards one canonical competence layer per subject across the full Gymnasium path.

## Goals

- Model Sekundarstufe I and Sekundarstufe II as one continuous Gymnasium competence space.
- Support bundesland-specific Abitur preparation via filters and views.
- Support study-oriented preparation without state filters when the target is university readiness rather than a specific exam.
- Preserve combined multi-subject views because subjects such as Physik depend on competencies from Mathematik.
- Keep the Custom GPT and MCP/API usage model as simple as it is today.

## Non-goals

- No duplication of canonical goals per Bundesland.
- No big-bang replacement of existing Hessen landscapes.
- No early introduction of a large generic overlay engine.
- No requirement that the Custom GPT must choose between legacy and canonical data layers.

## Core Decisions

### 1. Canonical subject layer first

For each subject, the target state is one canonical competence graph spanning the Gymnasium path from Sekundarstufe I to Abitur readiness.

This canonical graph should continue to use the existing `LearningLandscape` / `LearningGoal` structure where possible, rather than introducing a completely new graph format.

### 2. Legacy curricula stay alive during transition

Existing landscapes remain available during a migration period, especially the Hessen upper-secondary landscapes.

During that period, old landscapes are treated as supported legacy views, not as throwaway prototypes.

### 3. Add a small mapping layer, not a second content universe

The minimal new structural element is a mapping from legacy goals to canonical goals.

At the beginning, the project should add only:

- canonical landscape files for pilot subjects,
- mapping files from legacy goals to canonical goals.

The project should avoid introducing additional abstract layers unless the pilot proves they are necessary.

### 4. Standardize Bundesland identifiers in metadata, not in directory layout

For state-specific filters, overlays, and API-visible metadata, use ISO 3166-2 codes for Germany.

Examples:

- `DE-HE` for Hessen
- `DE-BY` for Bayern

This should become the canonical identifier format whenever the data model needs to refer to a Bundesland explicitly.

At the same time, the existing repository path layout such as `curricula/DE/HE/...` does not need to be renamed during the pilot. Those directory segments are storage organization, not the long-term public identifier contract.

### 5. Keep GPT-facing APIs stable

The Custom GPT should continue to see one learner state, one frontier, and one mastery model.

The GPT should not need to know:

- whether a goal is stored in a legacy or canonical layer,
- whether a view is state-specific or study-oriented,
- how migration is implemented.

That translation belongs in backend/runtime code, not in prompts or GPT tool logic.

### 6. Support cross-subject dependencies

The long-term model must support selected cross-subject `requires` edges where they are didactically justified.

Examples:

- Physik goals may require Mathematik goals.
- Chemistry or economics goals may require basic algebra or statistics goals.

These cross-subject edges should be added sparingly and only where they improve learner navigation in a concrete way.

### 7. Prefer one DE-level school root in learner-facing configuration

The learner-facing school UX should converge towards one DE-level root such as `Gymnasium (DE)` instead of exposing every pilot subject as an independent top-level curriculum forever.

Preferred shape:

- one shared DE-level root
- subject landscapes such as Mathematik, Physik, Chemie, Biologie, Informatik, Geschichte, Deutsch, Politik und Wirtschaft, Englisch, Französisch, Latein, Spanisch, Griechisch, Chinesisch, Musik, and Wirtschaftswissenschaften as child landscapes under that root
- subject-local filters such as `GK` / `LK` on the child landscapes
- one global root filter such as `DE-HE` / `DE-BY` / `ALL`

Implementation rule:

- do not clone canonical subject files per Bundesland
- derive state-specific visibility from mappings and provenance
- propagate the selected root Bundesland filter runtime-side into the selected child landscapes

## Minimal Data Additions

The rollout should start with only two additions.

### Canonical landscapes

New canonical landscapes continue to use the existing runtime-compatible structure.

This keeps loaders, validation rules, mastery aggregation, and GPT-facing state handling close to the current design.

### Goal mappings

Introduce a small mapping file type from legacy goals to canonical goals.

Suggested shape:

```json
{
  "version": 1,
  "sourceLandscapeId": "legacy-landscape-id",
  "targetLandscapeId": "canonical-landscape-id",
  "mappings": [
    {
      "legacyGoalId": "old-goal-id",
      "canonicalGoalId": "new-goal-id",
      "matchType": "exact"
    }
  ]
}
```

Recommended `matchType` values for the pilot:

- `exact`
- `partial`

Do not introduce a larger taxonomy unless the pilot needs it.

## Learner-State Migration Strategy

The migration should be incremental and reversible.

### Transition phase

- Existing learners continue to work with the current legacy landscapes.
- Mastery updates on mapped legacy goals are projected onto canonical goals.
- Canonical views can already use that projected mastery.
- If a canonical goal has no reliable mapping coverage yet, the legacy view remains authoritative for that area.

### Later phase

Once mapping coverage is stable for a subject:

- canonical mastery becomes the primary durable representation,
- legacy mastery values are derived from canonical mastery where possible,
- legacy landscapes remain as views until they are no longer needed.

The migration should prioritize continuity of learner progress over purity of data architecture.

## Operational Migration Model

The operational migration unit is not a whole subject or a whole Bundesland rollout at once.

The migration unit is a **didactically closed subtree**.

Examples:

- a lower-secondary function corridor in Mathematics
- one coherent introductory upper-secondary topic field
- one Physics subtree that depends on a small, explicit Mathematics prerequisite set

This keeps cutovers small enough that a subtree can later be switched over within a few days instead of requiring a long big-bang migration window.

### State 1: `legacy_frozen`

Meaning:

- an existing state-specific school curriculum remains the authoritative legacy source
- its JSON under `curricula/.../json/` is treated as read-only source material for convergence work

Implications:

- bug fixes in runtime, metadata interpretation, or mappings are still allowed
- canonical work must not rewrite the legacy source tree just to host new canonical content

### State 2: `subtree_adopted`

Meaning:

- a complete legacy subtree has been copied or reconstructed into the canonical DE-level subject landscape
- explicit mappings from legacy goals into canonical goals exist
- the subtree is already visible through canonical views

Acceptance conditions:

- the subtree is sufficiently closed with respect to `contains`
- prerequisite edges are either carried over or explicitly rebound
- no goal-identity collision with legacy goals exists

### State 3: `cutover_ready`

Meaning:

- the adopted subtree is stable enough that ordinary learner navigation can switch to the canonical version with low operational risk

Acceptance conditions:

- canonical learner-state projection behaves deterministically
- frontier behavior is acceptable in regression tests
- the mapping coverage is good enough that learner progress does not fragment
- a rollback path through the legacy view still exists

### State 4: `legacy_view_retained`

Meaning:

- the canonical subtree is the preferred operational path
- the old state-specific subtree remains available temporarily as a compatibility or audit view

This is the expected near-term state after a successful cutover.

### Transition rule

The intended transition path is:

- `legacy_frozen` -> `subtree_adopted` -> `cutover_ready` -> `legacy_view_retained`

The project should avoid skipping directly from legacy authoring to full cutover without an explicit subtree adoption step.

## Rollout Order

### Phase 0: protect the current Hessen value

- Treat `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` as the starting point.
- Do not destabilize current Hessen learner or GPT flows.

### Phase 1: pilot subject = Mathematik

- Derive a first canonical Mathematics graph from the mature Hessen upper-secondary implementation.
- Extend that canonical graph downward by attaching Hessen Sekundarstufe I mathematics.
- Add the first legacy-to-canonical mappings for Hessen mathematics.

Why mathematics first:

- it is already mature in Hessen,
- it is prerequisite-heavy,
- it is the most important cross-subject dependency source for later work.

### Phase 2: map Bavaria Mathematics

- Map `curricula/DE/BY/Gymnasium/Mathematik.json` into the canonical mathematics layer.
- Preserve Bavarian placement, sequencing, and level distinctions as view/filter metadata, not as duplicated content.

### Phase 3: add dual mastery handling

- Support projected canonical mastery while keeping legacy learner paths intact.
- Keep API responses unified so the GPT remains unaffected.

### Phase 4: introduce multi-subject canonical views

- Allow combined learner navigation across subjects.
- Start with Mathematics + Physics because this pair has the clearest didactic dependency pattern.

### Phase 5: selected cross-subject prerequisites

- Add only the most defensible Mathe -> Physik prerequisite edges first.
- Avoid broad cross-linking until real learner-navigation benefits are demonstrated.

## View Model

The intended end state is not one giant undifferentiated graph, but one canonical competence base with multiple views.

Examples:

- `Hessen Abitur view`
- `Bayern Abitur view`
- `study readiness view`
- `Mathematics + Physics combined view`

These views should differ by filters, placement, and weighting, not by duplicated canonical content.

## Constraints For Future Work

- Prefer extending existing schema fields over inventing new top-level systems.
- Keep runtime and GPT contracts stable while the data model evolves behind them.
- Favor small, explicit mapping files over clever implicit reconciliation logic.
- Only add cross-subject dependencies that are explainable to teachers and learners.
- When in doubt, choose a design that preserves current Hessen workflows.

## Success Criteria

The rollout is on track if the following become true:

- Hessen users can continue working without disruption.
- The same learner progress can be viewed through a legacy Hessen view and through a canonical subject view.
- Bavaria can be represented without duplicating the same mathematics competencies.
- Study-oriented views can hide state-specific exam distinctions without losing the underlying mastery history.
- Physik can reference Mathematik prerequisites in a controlled, explicit way.
