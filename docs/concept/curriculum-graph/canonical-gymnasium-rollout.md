# Canonical Gymnasium Rollout Policy

This document defines the stable rollout policy for converging the existing German Gymnasium curricula into a shared competence layer without duplicating content per Bundesland.

Use this document for Gymnasium-specific target-architecture and rollout-policy decisions.  
General goal-system semantics and projection contracts are specified separately in:

- `docs/concept/curriculum-graph/general-goal-system-and-migration.md`
- `docs/concept/curriculum-graph/view-projection-and-goal-placement.md`

Execution planning and current migration status belong separately in:

- `docs/dev/canonical-gymnasium-implementation-plan.md`
- `docs/dev/canonical-gymnasium-migration-status.md`

This document keeps only the stable rollout policy and the intended target direction. Work packages, readiness scoring, and current execution status belong elsewhere.

The policy is intentionally conservative:

- keep the current Hessen landscapes working,
- avoid a big-bang rewrite,
- keep the Custom GPT contract simple,
- introduce only the minimum additional structure required for migration.

## Context

The rollout starts from a conservative Hessen-first and DE-level-canonical stance.

Source priority assumptions:

- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` is the most mature Gymnasium curriculum area and defines the rollout starting point.
- `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe` already covers Hessen Sekundarstufe I in the same general direction.
- `curricula/DE/BY/Gymnasium` already provides broad Bavaria subject coverage, but in a less normalized structure than the Hessen upper-secondary JSON landscapes.

Repository layout policy:

- existing source curricula under state-owned paths such as `curricula/DE/HE/.../json/` remain legacy source material and should not be rewritten just to host canonical convergence
- canonical Gymnasium subject landscapes should live on a Germany-level path, not inside a single Bundesland subtree
- retained non-canonical state-owned assets should also move to Germany-level archive paths, but remain state-scoped there, for example under `curricula/DE/Gymnasium/input/DE-HE/...`

The strategic objective is not to preserve state-specific duplication forever, but to converge towards one canonical competence layer per subject across the full Gymnasium path.

## Goals

- Model Sekundarstufe I and Sekundarstufe II as one continuous Gymnasium competence space.
- Support bundesland-specific Abitur preparation via filters and views.
- Allow bundesland-specific learner-facing upper tree shapes without duplicating canonical atomic goals.
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

In the first convergence step, the project should add only:

- canonical landscape files for initial subjects,
- mapping files from legacy goals to canonical goals.

The project should avoid introducing additional abstract layers unless the first convergence step proves they are necessary.

### 4. Standardize Bundesland identifiers in metadata, not in directory layout

For state-specific filters, overlays, and API-visible metadata, use ISO 3166-2 codes for Germany.

Examples:

- `DE-HE` for Hessen
- `DE-BY` for Bayern

This should become the canonical identifier format whenever the data model needs to refer to a Bundesland explicitly.

At the same time, the existing repository path layout such as `curricula/DE/HE/...` does not need to be renamed during convergence. Those directory segments are storage organization, not the long-term public identifier contract.

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

Until a reviewed cross-landscape reference contract exists, authored `requires` edges in base subject landscapes MUST remain intra-landscape.

Cross-subject prerequisites MAY be introduced only in compiled multi-subject views or via a separate bundle-level reference format.

### 7. Prefer one DE-level school root in learner-facing configuration

The learner-facing school UX should converge towards one DE-level root such as `Gymnasium (DE)` instead of exposing every subject as an independent top-level curriculum forever.

`Gymnasium (DE)` is a learner-facing curriculum bundle / composition root, not a `LearningGoal` and not a `programUnit`.

Preferred shape:

- one shared DE-level root
- subject landscapes such as Mathematik, Naturwissenschaften, Sprachen, Geschichte, Deutsch, and social-science subjects as child landscapes under that root
- subject-local filters such as `GK` / `LK` on the child landscapes
- one global root filter such as `DE-HE` / `DE-BY`, with `ALL` as the query sentinel for "no jurisdiction narrowing"

Runtime policy:

- do not clone canonical subject files per Bundesland
- bridge behavior may derive state-specific visibility from mappings and provenance
- target runtime behavior should use compiled node-level `applicability` metadata derived and validated ahead of time
- propagate the selected root Bundesland filter runtime-side into the selected child landscapes

### 7.1 Gymnasium scope registry

For canonical Gymnasium, the initial reviewed scope vocabulary should be:

- `jurisdiction`: values such as `DE-HE`, `DE-BY`, ...
- `schoolForm`: `Gymnasium`
- `stage`: `SekI`, `SekII`
- `durationModel`: `G8`, `G9`
- `courseProfile`: `GK`, `LK`

`ALL` is a query sentinel only. It MUST NOT be serialized as a placement or applicability value.

### 7.2 Prefer explicit state-scoped composition views for learner-facing default trees

If Hessen, Bayern, or another jurisdiction needs a different learner-facing upper tree for the same canonical subject graph, that difference should be authored explicitly as a separate scope-specific composition view.

Recommended policy:

- keep one shared canonical subject graph as the content source of truth
- let state-scoped composition views define the learner-facing upper structure for resolved scopes
- let these views be maintained jointly with or by the relevant jurisdiction if needed
- reference reviewed canonical subtree roots rather than duplicating goal payload
- never inline authored atomic goals into the composition view
- require that the compiled resolved-scope tree satisfies single-occurrence validation

This avoids hidden runtime reparenting and makes bundesland-specific tree shapes inspectable directly from authored view files.

### 8. Normalize Sek I to a G9 year-level grid first

For Sekundarstufe I, the first canonical reference grid should be the G9 year-level sequence:

- Jahrgang 5
- Jahrgang 6
- Jahrgang 7
- Jahrgang 8
- Jahrgang 9
- Jahrgang 10

Rationale:

- year-level buckets are easier to reason about than duration-specific program variants,
- Hessen Sek I already exists in a mature G9-oriented structure,
- Bavaria source material can contain G8 and G9 labels, but its content can still be mapped into year-level buckets without cloning the canonical graph.

Authoring and migration rule:

- preserve source truth such as `G8` / `G9` in provenance and archived inputs,
- but author and migrate the first canonical Sek-I layer against the shared G9-aligned year-level grid,
- only add duration-aware overlays later if real runtime needs justify the extra complexity.

### 9. Keep retained assets state-scoped, not mixed

Canonical DE landscapes are shared.

Retained source assets are not.

This means:

- if a legacy path such as `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi` remains relevant after convergence, it should be archived into a DE-level but still state-scoped lane
- the same rule applies to other state-owned materials such as source bundles, blueprint packages, release notes, and similar regeneration/audit assets
- `abi/` is the clearest current example of the rule, but not the only case it covers

## Minimal Data Additions

The rollout should start with only two additions.

This restriction applies to the first Gymnasium convergence step only.

The broader additive target model from `general-goal-system-and-migration.md` remains valid, but may be introduced later once projection and runtime support are ready.

Explicit scope-specific composition views are also valid later steady-state artifacts, but they are not required in this first convergence step.

### Canonical landscapes

New canonical landscapes should stay inside the existing `LearningLandscape` / `LearningGoal` family.

This preserves continuity across validation, runtime consumption, and learner-state semantics.

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

Recommended initial `matchType` values:

- `exact`
- `partial`

Do not introduce a larger taxonomy unless actual migration cases require it.

## Learner-State Migration Policy

The migration should be incremental and reversible.

### Transition phase

- Existing learners continue to work with the current legacy landscapes.
- Mastery on mapped legacy goals contributes to the corresponding canonical goals.
- Canonical views may already rely on that transferred mastery.
- If a canonical goal has no reliable mapping coverage yet, the legacy view remains authoritative for that area.

### Later phase

Once mapping coverage is stable for a subject:

- canonical mastery becomes the primary durable representation,
- legacy mastery is derived from canonical mastery where possible,
- legacy landscapes remain as views until they are no longer needed.

The migration should prioritize continuity of learner progress over purity of data architecture.

## Migration State Model

The migration unit is not a whole subject or a whole Bundesland rollout at once.

The migration unit is a **didactically closed subtree**.

Examples:

- a lower-secondary function corridor in Mathematics
- one coherent introductory upper-secondary topic field
- one Physics subtree that depends on a small, explicit Mathematics prerequisite set

This keeps adoption small enough that convergence can happen incrementally instead of requiring a big-bang migration window.

For Sek I subtrees, "didactically closed" should currently be interpreted on the shared G9-aligned year-level grid, not on separate G8/G9 canonical branches.

Concrete readiness checklists, regression gates, and status scoring belong in the dev implementation and migration-status documents, not in this concept document.

### State 1: `legacy_frozen`

Meaning:

- an existing state-specific school curriculum remains the authoritative legacy source
- its JSON under `curricula/.../json/` is treated as read-only source material for convergence work

Policy consequences:

- bug fixes in runtime, metadata interpretation, or mappings are still allowed
- canonical work must not rewrite the legacy source tree just to host new canonical content

### State 2: `subtree_adopted`

Meaning:

- a complete legacy subtree has been copied or reconstructed into the canonical DE-level subject landscape
- explicit mappings from legacy goals into canonical goals exist
- the subtree is already visible through canonical views

Required properties:

- the subtree is sufficiently closed with respect to `contains`
- prerequisite continuity is either carried over or explicitly rebound
- canonical and legacy goal identities remain distinguishable

### State 3: `cutover_ready`

Meaning:

- the adopted subtree is coherent enough that ordinary learner navigation may switch to the canonical version as the default route

Required properties:

- learner-state continuity between legacy and canonical views is preserved
- frontier and navigation semantics remain coherent
- mapping coverage is sufficient that learner progress does not fragment
- the legacy view can still act as a temporary compatibility fallback

### State 4: `legacy_view_retained`

Meaning:

- the canonical subtree is the preferred learner-facing path
- the old state-specific subtree remains available temporarily as a compatibility or audit view

This is the normal intermediate steady state before a retained legacy view may eventually be retired.

### Transition rule

The intended transition path is:

- `legacy_frozen` -> `subtree_adopted` -> `cutover_ready` -> `legacy_view_retained`

The project should avoid skipping directly from legacy authoring to full cutover without an explicit subtree adoption step.

## Preferred Adoption Sequence

The preferred strategic order is:

1. preserve current Hessen learner-facing continuity while canonical structure is added behind it
2. use Mathematics as the first canonical subject spine
3. extend Mathematics across Sek I and Sek II before broadening the cross-state surface
4. fold Bavaria into that canonical Mathematics layer through mappings and view metadata rather than duplicated content
5. only then widen multi-subject canonical navigation and selected cross-subject prerequisites

Rationale for starting with Mathematics:

- it is already mature in Hessen
- it is prerequisite-heavy
- it is the most important cross-subject dependency source for later work

This is a policy order, not a fixed sprint plan. Concrete work packages, phase plans, and sequencing updates belong in the implementation-plan document, not here.

## View Model

The intended end state is not one giant undifferentiated graph, but one canonical competence base with multiple views.

The exact projection contract for such views is defined in `docs/concept/curriculum-graph/view-projection-and-goal-placement.md`.

Examples:

- `Hessen Abitur view`
- `Bayern Abitur view`
- `study readiness view`
- `Mathematics + Physics combined view`

For learner-facing default trees, the preferred long-term form is an explicit scope-specific composition view that references canonical subtree roots and compiles to one single-occurrence tree per resolved scope.

These views should differ by reviewed composition structure, filters, placement, and weighting, not by duplicated canonical content.

## Constraints For Future Work

- Prefer extending existing schema fields over inventing new top-level systems.
- Keep runtime and GPT contracts stable while the data model evolves behind them.
- Favor small, explicit mapping files over clever implicit reconciliation logic.
- Only add cross-subject dependencies that are explainable to teachers and learners.
- When in doubt, choose a design that preserves current Hessen workflows.
- Keep concept documents focused on durable rules and move execution-specific checklists or status reporting into `docs/dev`.

## Success Criteria

The rollout is on track if the following become true:

- Hessen users can continue working without disruption.
- The same learner progress can be viewed through a legacy Hessen view and through a canonical subject view.
- Bavaria can be represented without duplicating the same mathematics competencies.
- A resolved Hessen or Bayern default tree can be compiled from explicit reviewed view files without duplicate goal occurrences.
- Study-oriented views can hide state-specific exam distinctions without losing the underlying mastery history.
- Physik can reference Mathematik prerequisites in a controlled, explicit way.
