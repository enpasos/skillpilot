# Canonical Gymnasium Applicability Design

Snapshot: `2026-03-16`

This note defines the target design for **generic runtime filtering on canonical Gymnasium graphs**.

It is intentionally a **design document**, not an implementation report.

Related documents:

- `docs/concept/curriculum-graph/canonical-gymnasium-rollout.md`
- `docs/dev/canonical-gymnasium-implementation-plan.md`
- `docs/dev/canonical-gymnasium-migration-status.md`

## Current implementation status

The first applicability slice is now implemented for the reviewed canonical DE Gymnasium set.

Observed repo status on `2026-03-16`:

- compiler entrypoint exists in `app/scripts/compileApplicability.ts`
- validator entrypoint exists in `app/scripts/validateViewFilters.ts`
- persistence step exists in `app/scripts/applyApplicability.ts`
- accepted review debt is tracked in `docs/qa-ci/applicability-accepted-warnings.json`
- current reviewed validator result is `0` errors, `0` active warnings, `45` accepted warnings

Interpretation:

- the design decisions below are no longer hypothetical for the reviewed scope
- the remaining architectural work is now about widening and hardening the reviewed applicability surface, especially as Bavaria broadens beyond the current Math/Physics/Chemistry/Biology/Informatik/Deutsch/Wirtschaft_und_Recht adopted corridor

## Problem

The current canonical Gymnasium runtime already supports a root-level Bundesland filter such as `DE-HE` or `DE-BY`.

However, the current rule is still transitional:

- jurisdiction-specific visibility is derived at runtime from mappings and provenance,
- the backend recursively asks whether a canonical goal belongs into the selected view,
- this is operationally useful, but it is not the clean target architecture.

This differs from `GK` / `LK` handling:

- `GK` / `LK` is effectively a **node-local runtime property**,
- Bundesland relevance is currently a **runtime inference**.

For learner-facing filtering this asymmetry is undesirable.

Example:

- a Hessen learner preparing for the mathematics Abitur should simply see the canonical goals that are relevant for `DE-HE` and `LK`,
- not a graph whose visibility is recomputed ad hoc from provenance recursion every time.

## Design principle

The target model should separate:

1. **Source truth**
- canonical goals
- provenance
- legacy-to-canonical mappings

2. **Compiled runtime applicability**
- a simple node-level, dimension-based applicability field that can be filtered at runtime

The key principle is:

- **do not manually duplicate canonical goals per Bundesland**
- **do compile view applicability onto canonical nodes before runtime**

So the system remains source-driven, but the runtime becomes node-local and simple.

Important generalization:

- the first compiled dimension is `jurisdiction`
- the mechanism itself should stay generic enough for other dimensions later
- the data model must therefore not hardcode Bundesland coverage as its only possible meaning

## Target runtime rule

For canonical Gymnasium landscapes, the runtime should be able to evaluate visibility with a simple predicate:

```text
visible(goal, selectedView) =
  matchesApplicability(goal.applicability, selectedView.filters)
  AND
  matchesCourseCoverage(goal, selectedView.courseLevel)
```

Recommended first-step interpretation:

```text
matchesApplicability(applicability, filters) =
  for every active (dimension, value) in filters:
    value == ALL
    OR (
      dimension in applicability
      AND value in applicability[dimension]
    )
```

Interpretation:

- `applicability` is the new compiled runtime field
- `jurisdiction` is the first compiled dimension inside it
- `matchesCourseCoverage(...)` can continue to be derived from existing `GK` / `LK` tags and `release.courseLevel`

This means:

- Bundesland filtering becomes node-local at runtime
- the machinery remains open for later dimensions without introducing a Germany-specific top-level field

## Proposed runtime metadata

Preferred target field on canonical goals:

```json
{
  "id": "…",
  "title": "…",
  "applicability": {
    "jurisdiction": ["DE-HE", "DE-BY"]
  }
}
```

Rules:

- field exists only where relevant, primarily on canonical Gymnasium goals
- keys are filter dimensions such as `jurisdiction`
- values in each dimension are unique and sorted
- for the first compiled dimension, values use ISO 3166-2 codes such as `DE-HE`, `DE-BY`
- `ALL` is **not** stored as a node value; it remains a runtime/UI wildcard

Important:

- `applicability` is a **compiled runtime field**
- it is **not** the primary authoring source of truth
- provenance and mappings remain authoritative inputs for deriving it

## Minimal schema delta

This design intentionally proposes the smallest new surface area.

Preferred first-step JSON shape:

```json
{
  "id": "…",
  "title": "…",
  "applicability": {
    "jurisdiction": ["DE-HE", "DE-BY"]
  },
  "extendedData": {
    "applicabilityOverrides": {
      "jurisdiction": ["DE-HE"]
    }
  }
}
```

Interpretation:

- `applicability` is the compiled runtime field
- `extendedData.applicabilityOverrides` is optional authoring input
- the override is not required on most goals
- the field is generic even if the first compiled dimension is `jurisdiction`

First-step schema recommendation:

- allow `applicability?: Record<string, string[]>` on `LearningGoal`
- keep override data inside `extendedData`
- first implementation supports only the `jurisdiction` dimension
- do not introduce separate `courseCoverage`, `abiCoverage`, or state-specific weighting fields yet

## Why not use plain tags?

Using `tags: ["DE-HE", "DE-BY"]` would make runtime filtering easy, but it mixes two concerns:

- authored semantic tags
- compiled visibility metadata

That would create long-term drift risk:

- authors might edit filter tags manually,
- the tags could diverge from mappings/provenance,
- validators would no longer know which values are authored and which are derived.

Therefore the preferred design is:

- explicit structured `applicability` for runtime visibility
- ordinary `tags` remain authored semantic metadata

## Authoring-side override mechanism

Most canonical applicability should be derived from:

- provenance,
- mappings,
- cluster structure.

However, a small explicit override path is still needed for rare cases:

- genuinely synthesized DE-level goals,
- shared bridge goals not yet backed by stable mappings,
- temporary migration repairs where the semantic decision is known before the source graph is fully normalized.

Preferred authoring-side override location:

```json
{
  "extendedData": {
    "applicabilityOverrides": {
      "jurisdiction": ["DE-HE", "DE-BY"]
    }
  }
}
```

Rules for overrides:

- overrides are exceptional, not the norm
- overrides are authoring inputs to the compiler
- runtime should read only the compiled `applicability`, not the override itself
- validators should report every override explicitly so they remain auditable

## Review checklist

This section remains the review surface for widening or changing the implemented applicability mechanism.

The reviewed scope should only expand once these points still hold.

### R1. Runtime field choice

Decision:

- use a structured goal field `applicability`
- do not introduce a Germany-specific top-level field such as `stateCoverage`
- do not overload ordinary `tags`

### R2. Source-of-truth split

Decision:

- provenance and mappings remain authoritative inputs
- `applicability` is compiled from them
- authors should not maintain `applicability` manually as the primary source of truth

### R3. Partial mapping semantics

Decision:

- `partial` mappings do contribute to applicability for the compiled dimension
- `partial` mappings do not contribute to exact mastery projection

### R4. Cluster applicability rule

Decision:

- cluster applicability in a compiled dimension is the union of visible child applicability in that dimension
- cluster applicability should not be handwritten except through exceptional overrides on missing atoms

### R5. Validation strictness

Decision:

- broken `requires` closure under an active filter dimension is a validation error
- empty visible clusters under an active filter dimension are a validation error
- runtime should not silently "repair" these inconsistencies

### R6. Persistence strategy

Decision:

- compiled `applicability` should be committed into canonical JSON
- the compiler remains the authoritative way to regenerate it

### R7. Scope boundary

Decision:

- first implementation compiles only the `jurisdiction` dimension
- not yet course-coverage normalization
- not yet abi-specific coverage fields
- not yet runtime weighting or recommendation overlays

## Compiler contract

The first compiler should be a pure, deterministic repo-local batch step.

It should read:

- canonical target landscapes under `curricula/DE/Gymnasium/canonical/`
- legacy-to-canonical mapping files under the existing `curricula/DE/**/mapping/` trees
- canonical goal metadata, especially `extendedData.provenance`
- optional `extendedData.applicabilityOverrides`

It should not edit:

- legacy source landscapes
- legacy mapping files
- retained input archives under `curricula/DE/Gymnasium/input/`

### Dimension resolution rule

The compiler must not infer applicability from human-readable text such as:

- goal titles
- descriptions
- curriculum display names

Preferred first-step resolution order:

1. explicit resolution of `jurisdiction` from known source landscape identifiers and known mapping-file ownership
2. deterministic path-based fallback such as `curricula/DE/HE/... -> DE-HE` and `curricula/DE/BY/... -> DE-BY`
3. otherwise no applicability contribution plus a compiler finding

This keeps the derivation auditable and avoids hidden heuristics.

### Two-pass derivation shape

Recommended first implementation:

1. derive atomic-goal applicability evidence from provenance, mappings, and overrides
2. compile atomic `applicability`
3. derive cluster `applicability` as the recursive union of visible children per compiled dimension
4. project filtered graphs from the compiled result and run validation on those projected graphs
5. emit a dry-run report before any JSON rewrite is attempted

### Persistence boundary

The compiler should treat persisted `applicability` as generated runtime metadata:

- canonical files may eventually be rewritten by the compiler
- evidence detail should stay in the dry-run report, not in the committed goal JSON
- rerunning the compiler on unchanged inputs should produce byte-stable sorted output

## Applicability derivation model

### Atomic canonical goals

For an atomic canonical goal `g` and a compiled dimension `d`, the compiler should derive:

```text
applicability(g, d) =
  derivedApplicability(g, d)
  UNION explicitOverrideApplicability(g, d)
```

For the first implementation, `d = jurisdiction`, so:

```text
applicability(g, jurisdiction) =
  provenanceJurisdictions(g)
  UNION mappingJurisdictions(g)
  UNION explicitOverrideApplicability(g, jurisdiction)
```

Where the derived evidence comes from:

- `provenanceJurisdictions(g)` from `extendedData.provenance`
  - `sourceLandscapeId`
  - `additionalSourceLandscapeIds`
  - `crossSubjectPrerequisiteLandscapeIds`
- `mappingJurisdictions(g)` from all legacy-to-canonical mappings that target `g`
- `explicitOverrideApplicability(g, jurisdiction)` from the optional override block above

Important distinction:

- both `exact` and `partial` mappings may contribute to **applicability for visibility**
- only `exact` mappings continue to contribute to **mastery projection**

Rationale:

- a `partial` mapping is enough to say "this canonical anchor is relevant in this filtered view"
- a `partial` mapping is not enough to claim exact mastery equivalence

### Cluster goals

For a cluster goal `c`, the compiler should derive:

```text
applicability(c, d) = UNION(applicability(child, d) for child in c.contains)
```

This applies recursively to:

- year anchors,
- subject roots,
- DE overview nodes,
- intermediate thematic clusters.

The cluster rule should stay structural:

- cluster applicability comes from visible descendants,
- not from manual duplication of every cluster-filter relation.

## Filtered-graph projection unit

Validation should not run only on raw goal-local metadata.

Instead, for each active compiled dimension/value pair, the validator should first build the projected filtered graph:

```text
G[d = v] =
  induced subgraph of all canonical goals g
  such that v in applicability(g, d)
  with only visible contains/requires edges preserved
```

For the first implementation this means at least:

- `G[jurisdiction = DE-HE]`
- `G[jurisdiction = DE-BY]`

All structural validation rules below must run on these projected filtered graphs.

This is the important operational point:

- we do not merely validate whether a node carries a value
- we validate whether the resulting filtered learner graph is coherent

## Validation rules

The whole point of compiled node-level applicability is that correctness is checked **before runtime** on projected filtered graphs.

### V0. Projection-first validation

For every supported compiled dimension `d` and every compiled value `v`:

- first project `G[d = v]`
- then validate that projected graph as a learner-facing graph

This means validation is performed on the filtered graph, not just on raw metadata fields.

### V1. Syntax validity

For every canonical goal:

- `applicability` contains only known compiled dimensions for the current compiler phase
- values inside each compiled dimension come from the allowed vocabulary
- values are unique
- values are sorted deterministically

### V2. Cluster non-emptiness on the projected graph

For every projected graph `G[d = v]`:

- every visible cluster `c` must contain at least one visible child in that projected graph

This prevents phantom clusters that are visible under a filter but structurally empty there.

### V3. Requires closure on the projected graph

For every projected graph `G[d = v]`:

- every visible goal `g` must have all required goals `r` visible in that same projected graph

This is critical.

Without this rule, a learner could see a Hessen goal whose prerequisites disappear under the Hessen filter.

The validator should fail such cases instead of letting runtime patch over them heuristically.

### V4. Root reachability on the projected graph

For every projected graph `G[d = v]`:

- every visible canonical goal `g` must be reachable from the selected canonical root through visible `contains` edges

This ensures that every filtered view is navigable as a real learner graph.

### V5. No unsupported synthetic leakage

If a canonical atomic goal has:

- no derived applicability for the compiled dimension,
- no explicit override state,

then:

- `applicability` must not contain a value for that dimension,
- and the goal must stay out of filtered runtime views for that dimension until resolved.

This keeps the canonical view conservative.

### V6. Champion/frontier/mastery compatibility

For every validated projected filtered graph:

- frontier computation must only reference visible prerequisites,
- mastery projection may only target visible canonical goals,
- champion counts must be computed over the filtered goal set for that projected view.

## Finding taxonomy

The first validator should use stable finding codes so review and CI stay readable.

Recommended first set:

| Code | Severity | Meaning | Default handling |
| --- | --- | --- | --- |
| `APV-001` | error | unknown compiled dimension or malformed compiled applicability value | fail validation |
| `APV-002` | error | duplicate or unsorted compiled applicability values | fail validation |
| `APV-003` | error | provenance or mapping source could not be resolved to a supported applicability value in the current compiler scope | fail validation in reviewed target set |
| `APV-101` | error | projected filtered graph contains a visible cluster with no visible child | fail validation |
| `APV-102` | error | projected filtered graph contains a visible goal with an invisible prerequisite | fail validation |
| `APV-103` | error | projected filtered graph contains a visible goal not reachable from the selected canonical root through visible `contains` edges | fail validation |
| `APV-104` | error | goal is visible only through an unsupported synthetic path with no provenance, mapping, or approved override evidence | fail validation |
| `APV-201` | warning | explicit applicability override is used | surface in report for audit |
| `APV-202` | warning | applicability is backed only by `partial` mappings | surface in report; allowed for visibility |
| `APV-203` | warning | compiled applicability changed since the previous committed state for a reviewed canonical file | surface in review diff |

These code names are now used by the compiler and validator in the repo; the split between hard validation errors and auditable warnings should remain stable.

## Runtime consequences

After this design is implemented, runtime filtering should no longer need to ask:

- "Does this goal have Hessen coverage via recursive provenance and mapping inference right now?"

Instead, it should simply ask:

- "Does `DE-HE` appear in `goal.applicability.jurisdiction`?"

The current recursive logic is therefore a **bridge implementation**, not the target architecture.

## Hesse Abitur example

Target learner configuration:

- root curriculum: `Gymnasium (DE)`
- root filter: `DE-HE`
- selected subject: `Mathematik`
- subject filter: `LK`

Then runtime should behave as follows:

1. project the mathematics graph with `jurisdiction = DE-HE`
2. among those visible goals, apply the ordinary `LK` course-level rule
3. compute frontier, mastery aggregation, planned goals, and champions on that filtered graph

Result:

- the learner sees the canonical DE mathematics graph
- but only the Hessen-relevant and LK-relevant slice of it
- without needing a separate Hessen clone of the canonical file

## Relationship to legacy views

This design does **not** mean that every state-specific legacy view can be deleted immediately.

It only means:

- canonical applicability should become node-local and prevalidated

Legacy views still remain authoritative whenever:

- mapping coverage is incomplete,
- applicability validation fails,
- a canonical subtree is not yet operationally trustworthy.

So this design strengthens the canonical path without weakening the fallback rule.

## Dry-run report contract

The first implementation should produce a reviewable report under `tmp/`, for example:

- `tmp/applicability/summary.json`
- `tmp/applicability/<landscapeId>.json`

Recommended report shape:

```json
{
  "landscapeId": "DE_DEU_S_GYM_CANONICAL_MATHEMATIK",
  "dimensions": ["jurisdiction"],
  "summary": {
    "goals": 1234,
    "errors": 0,
    "warnings": 7
  },
  "goals": [
    {
      "goalId": "uuid",
      "title": "Jahrgang 8 (Sek I)",
      "compiledApplicability": {
        "jurisdiction": ["DE-BY"]
      },
      "evidence": [
        {
          "dimension": "jurisdiction",
          "value": "DE-BY",
          "kind": "mapping",
          "mappingStrength": "partial",
          "source": "curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math_pilot.json"
        }
      ]
    }
  ],
  "projections": [
    {
      "dimension": "jurisdiction",
      "value": "DE-BY",
      "visibleGoals": 123,
      "errors": 0,
      "warnings": 2
    }
  ],
  "findings": [
    {
      "code": "APV-202",
      "severity": "warning",
      "goalId": "uuid",
      "message": "Applicability is backed only by partial mappings."
    }
  ]
}
```

Report requirements:

- stable ordering so diffs are reviewable
- enough evidence detail to explain every compiled applicability assignment
- no hidden dependency on runtime services or learner data
- safe to regenerate locally and in CI

## Recommended rollout

### Phase 1. Design approval

- review this document
- agree on field names and validation semantics

Recommended approval output:

- one explicit yes/no answer for each item in the review checklist above
- note any naming changes before the reviewed applicability scope is widened further

### Phase 2. Read-only compiler

Add a compiler that derives `applicability` but does not yet change runtime behavior.

Outputs:

- compiled applicability report
- validation failures
- diff preview for canonical goal files

Preferred non-destructive first output:

- write a report to `tmp/`
- do not rewrite canonical JSON automatically in the very first dry run

### Phase 3. Validator

Add a dedicated validator, for example:

- `validate:view-filters`

It should fail on:

- broken requires closure on a projected filtered graph
- empty clusters on a projected filtered graph
- malformed compiled applicability
- orphaned visible goals

### Phase 4. Persist compiled field

Persist compiled `applicability` onto canonical goals.

Preferred PoC choice:

- commit the compiled field into canonical JSON
- keep the compiler as the authoritative way to regenerate it

Rationale:

- the repo already treats landscape JSON as committed runtime data,
- review diffs stay transparent,
- CI validation stays simple.

### Phase 5. Switch runtime filter

Replace the current recursive runtime coverage inference with:

- node-local `applicability` checks for canonical Gymnasium landscapes
- for the first implementation, this means `goal.applicability.jurisdiction`

### Phase 6. Keep projection rules separate

Do **not** merge applicability for visibility and mastery projection.

Keep:

- filtered visibility from compiled `applicability`
- mastery projection from `exact` mappings only

## Pilot acceptance matrix

Before runtime changes begin, the dry-run compiler plus validator should satisfy the following pilot gates.

| Gate | Pilot slice | Expected outcome |
| --- | --- | --- |
| `A1` | canonical mathematics + `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math_pilot.json` | projected graph `jurisdiction = DE-BY` contains the `J7-J9` anchors and the existing function corridor with zero closure errors |
| `A2` | canonical mathematics + Hessen math upper-secondary and lower-secondary pilot mappings | projected graph `jurisdiction = DE-HE` for the currently cutover-relevant Hessen math slice has zero closure errors |
| `A3` | canonical economics + `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_economics_upper_secondary_to_canonical_economics.json` | the reviewed Hessen economics mirror compiles with stable `jurisdiction = DE-HE` applicability and no unexpected `DE-BY` visibility |
| `A4` | canonical overview root plus child subject roots | root and subject clusters inherit only the union of visible child values; no phantom root visibility appears in the projected filtered graphs |
| `A5` | at least one intentional override-backed synthetic goal in a reviewed fixture, if such a case exists | compiler emits `APV-201`, keeps applicability explicit, and still passes if no hard errors exist |

Recommended go/no-go rule for implementation:

- proceed to runtime integration only after the reviewed pilot set has zero `APV-0xx` and `APV-1xx` errors
- warnings may remain temporarily, but only if they are explicitly accepted in review

Current status note `2026-03-16`:

- the reviewed CI scope already satisfies the hard-error rule
- `A5` is exercised by the current accepted Bavaria `APV-201` cases tracked in `docs/qa-ci/applicability-accepted-warnings.json`

## Implementation touchpoints

This section is intentionally concrete so the first implementation can stay narrow.

### A. Shared types and schema-facing code

Expected first touchpoints:

- `app/src/landscapeTypes.ts`
- goal-level schema handling in graph scripts and loaders that already depend on `LearningGoal`

First-step change:

- add optional `applicability?: Record<string, string[]>` to `LearningGoal`
- do **not** widen the first compiler scope beyond `jurisdiction`, even if the field is generic

### B. Read-only compiler and projected-view validator

Expected first touchpoints:

- new compiler script in `app/scripts/`, e.g. `compileApplicability.ts`
- new validator script in `app/scripts/`, e.g. `validateViewFilters.ts`
- `app/package.json` for script entrypoints
- `docs/qa-ci/graph-validation-rules.md`
- `docs/qa-ci/ci.md`

Responsibility split:

- `validateGraph.ts` remains the raw-landscape validator
- the new validator operates on projected filtered graphs derived from compiled `applicability`
- the compiler writes review output under `tmp/applicability/` in its first phase
- provenance-backed applicability may resolve `sourceLandscapeId` through the DE-level registry `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`, so reviewed applicability does not depend on an active legacy source tree staying loadable

### C. Backend runtime filtering

Current hot spots already visible in the codebase:

- `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java`

Relevant current methods:

- `matchesFilter(...)`
- `matchesCourseFilter(...)`
- `matchesStateFilter(...)`
- `hasCanonicalStateCoverage(...)`

Target first-step runtime change:

- keep `matchesCourseFilter(...)` as-is
- replace transitional state recursion with node-local `goal.applicability.jurisdiction`
- keep mastery projection logic separate from visibility logic

### D. Frontend compatibility layer

Current hot spots already visible in the codebase:

- `app/src/views/LearnerView.tsx`

Current transitional behavior:

- several view decisions still fall back to tag-based checks such as `child.tags.includes(filterId)`
- this is acceptable as long as backend/runtime remains transitional

Target after backend switch:

- canonical jurisdiction filtering should no longer depend on ordinary `tags`
- frontend compatibility checks should align with compiled `applicability` semantics
- legacy landscapes may still continue to use their current simpler filter behavior

### E. Scope guard for first implementation

The first implementation should explicitly avoid:

- changing legacy landscape JSON semantics
- changing mastery projection rules
- changing `GK` / `LK` modeling
- changing multi-dimensional filter combinations
- changing learner-facing filter labels or curriculum selection UX

## First implementation scope

The first implementation should be intentionally narrow.

Included:

- compiler for canonical Gymnasium landscapes only
- support for the `jurisdiction` dimension with `DE-HE` and `DE-BY`
- `ALL` remains a runtime wildcard, not a stored applicability value
- support for provenance-derived applicability
- support for mapping-derived applicability
- support for `extendedData.applicabilityOverrides`
- validator checks `V0` to `V5` on projected filtered graphs

Deferred:

- additional German states beyond the currently modeled set
- explicit applicability dimensions beyond `jurisdiction`
- dimension-specific weighting changes
- UI badges or provenance chips for compiled applicability
- automatic migration of old canonical files beyond the reviewed target set

## Suggested implementation order

Once the design is accepted, the safest sequence is:

1. extend the goal type/schema to allow `applicability`
2. implement read-only compiler output in `tmp/`
3. implement `validate:view-filters`
4. run the compiler on the current canonical Gymnasium files
5. review the generated diffs and projection reports
6. persist `applicability` into canonical JSON
7. only then switch runtime filtering to the compiled field

## Open design decisions

### Should `courseLevel` also move into `applicability`?

Not required immediately.

Current recommendation:

- keep `GK` / `LK` runtime behavior as-is
- optionally normalize it later into `applicability.courseLevel` if that reduces complexity

### Should cross-subject prerequisites force applicability promotion?

Current recommendation:

- no automatic promotion
- if `requires` closure fails on a projected filtered graph, the validator should fail
- authors must then fix the source situation via mappings, provenance, or explicit override

This keeps applicability semantics explicit and auditable.

### Should the validator already handle multi-dimensional combinations?

Not in the first implementation.

Current recommendation:

- first validate one projected graph per supported dimension/value pair
- once a second compiled dimension exists, extend validation to the relevant cross-product of projected views

## Recommended next implementation step

After the now-landed first applicability slice, the next implementation step should be:

- widen the reviewed applicability scope and keep reducing override-backed Bavaria pilot debt before broader delete-handoff claims are raised

and not yet:

- introduce a second compiled dimension
- merge visibility applicability with mastery projection
