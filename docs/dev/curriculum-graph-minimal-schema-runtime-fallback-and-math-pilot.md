# General Goal System: Minimal Schema, Runtime Fallback, and Math Pilot

This document is the implementation-oriented follow-up to:

- `docs/concept/curriculum-graph/general-goal-system-and-migration.md`
- `docs/concept/curriculum-graph/view-projection-and-goal-placement.md`

Use this document for:

- the smallest additive schema extension worth introducing now
- transition-time fallback precedence
- the first canonical mathematics pilot slice

It does not redefine the long-term projection contract for visible trees.  
That target contract lives in `docs/concept/curriculum-graph/view-projection-and-goal-placement.md`.

It answers three narrower questions:

1. what is the smallest schema extension worth introducing now?
2. how should runtime compatibility work during transition?
3. what is the smallest useful pilot slice in canonical Gymnasium mathematics?

The intent is to unblock continued canonical mathematics work without locking SkillPilot into the wrong long-term semantics.

## Design stance

This paper applies the modeling maxim from the main concept:

**As much semantics as necessary, as little ontology as possible.**

So this document does not try to design a full educational ontology.

It defines only the smallest additions needed to:

- separate goals from structural program context
- support entry-scope-based views
- keep existing runtime behavior working
- let future authoring stop accumulating `phase`-centric semantic debt

## Non-goals

This paper does not propose:

- a rewrite of mastery storage
- a rewrite of `requires` or `contains`
- immediate removal of legacy year/phase wrapper nodes
- a full compiler redesign for `applicability`
- a full migration of all canonical mathematics corridors
- a new ontology engine

## Minimal schema

The first implementation should add only four optional structures:

- `programUnits`
- `goalPlacements`
- `competencyCatalog`
- `competencyRefs`

Existing landscapes remain valid if these are absent.

## 1. `programUnits`

`programUnits` model structural context, not competences.

Suggested minimal shape:

```json
{
  "id": "de-gym-math-q2",
  "kind": "phase",
  "label": "Q2",
  "shortLabel": "Q2",
  "order": 220,
  "parentUnitId": "de-gym-math-sek2"
}
```

### Required fields

- `id`
- `kind`
- `label`

### Optional fields

- `shortLabel`
- `order`
- `parentUnitId`

### Recommended `kind` vocabulary

Use only this small reviewed vocabulary in the first implementation:

- `program`
- `stage`
- `year`
- `phase`
- `semester`
- `module`
- `track`
- `exam`

Notes:

- `program` is the broad top-level structural bucket, for example `Gymnasium`
- `stage` is useful for `Sek I` and `Sek II`
- `phase` is useful for structures such as `E`, `Q1`, `Q2`, `Q3`, `Q4`
- `year` is useful for `J5-J13`

No richer structural taxonomy is needed yet.

## 2. `goalPlacements`

`goalPlacements` attach goals to program structure.

Suggested minimal shape:

```json
{
  "goalId": "goal-linear-functions-basic",
  "unitId": "de-gym-math-j8",
  "relation": "primary",
  "context": {
    "schoolForm": "Gymnasium",
    "stage": "SekI",
    "jurisdiction": "DE-BY",
    "durationModel": "G9"
  }
}
```

### Required fields

- `goalId`
- `unitId`
- `relation`

### Optional fields

- `context`

### Recommended `relation` vocabulary

Use only:

- `primary`
- `secondary`
- `assessed`

Interpretation:

- `primary` = main structural anchor in a scoped view
- `secondary` = also belongs here, but not as the main anchor
- `assessed` = structurally relevant for assessment/exam views

## 3. `goalPlacements.context`

The first implementation should keep placement context deliberately small.

Recommended keys:

- `schoolForm`
- `stage`
- `jurisdiction`
- `durationModel`
- `courseProfile`

Recommended first vocabulary:

- `schoolForm`: `Gymnasium`
- `stage`: `SekI`, `SekII`
- `jurisdiction`: ISO 3166-2 values such as `DE-HE`, `DE-BB`
- `durationModel`: `G8`, `G9`
- `courseProfile`: `GK`, `LK`, `GK+LK`

Rules:

- only use a context key if it affects placement or view projection
- do not push arbitrary curriculum metadata into placement context
- do not duplicate metadata already fixed by the landscape itself unless the duplication is operationally useful for filtering

## 4. `competencyCatalog`

`competencyCatalog` contains orthogonal taxonomy entries such as process competencies.

Suggested minimal shape:

```json
{
  "id": "PROCESS.K4",
  "label": "Darstellen",
  "dimension": "process-competency"
}
```

### Required fields

- `id`
- `label`
- `dimension`

No deeper subtyping is needed in the first step.

## 5. `competencyRefs`

Goals may optionally reference entries in `competencyCatalog`.

Suggested shape:

```json
{
  "id": "goal-argument-critique",
  "title": "Argumentationslücken erkennen",
  "competencyRefs": ["PROCESS.K1"]
}
```

Rules:

- keep this as a flat list of stable IDs
- do not introduce nested competency weighting or inheritance in the first step

## Runtime fallback rules

The transition runtime should be read-compatible first.

The key rule is:

**projection is preferred when present, legacy structure is the fallback when absent.**

This section defines transition precedence only.  
The target contract for content trees, program trees, and competency views is specified separately in `docs/concept/curriculum-graph/view-projection-and-goal-placement.md`.

## 1. Structural program view

When the runtime needs a structural tree such as:

- `Gymnasium -> Sek II -> Q2`
- `Gymnasium -> Sek I -> Jahrgang 8`

it should use this precedence:

1. `programUnits` + `goalPlacements`
2. legacy structural wrapper nodes
3. legacy `dimensionTags.phase` ordering hints

This keeps existing landscapes working while allowing new pilot slices to become projection-driven.

## 2. Competency view

When the runtime needs a process-competency or capability view, use:

1. `competencyCatalog` + `competencyRefs`
2. legacy process metadata such as `dimensionTags.processCompetencies` or `kompetenzen`

The competency tree should be projected. It should not require process nodes to be primary semantic parents in the goal graph.

## 3. Mastery and frontier

No runtime change is needed here.

Rules:

- mastery stays attached to goals only
- frontier stays computed from goals only
- `programUnits`, `goalPlacements`, and `competencyCatalog` do not enter mastery or frontier semantics directly

They only influence views, filtering, aggregation, and entry scope.

## 4. Entry-scope resolution

When a learner enters a landscape through a scope such as:

- `Gymnasium`
- `Sek II`
- `DE-BY`
- `GK`
- `Q2`

the runtime should:

1. resolve the requested structural unit from `programUnits`
2. filter placements by matching `context`
3. intersect that result with reviewed `applicability`
4. project the resulting goal subset into the user-facing structural view
5. then allow topic/frontier navigation inside that scoped subset

Important:

- entry scope does not change goal identity
- entry scope only narrows which placements and views are active

## 5. Authoring compatibility rule

During transition:

- existing legacy year/phase wrapper nodes may remain
- new pilot data may coexist with them

But new canonical authoring should follow this rule:

- do not create new semantic dependencies just because a goal currently appears under a year or phase wrapper
- prefer fachliche clusters and atomic goals as the semantic backbone
- express structural location through placements whenever the new schema is available

## Canonical mathematics pilot

The first pilot should be intentionally small and vertical.

It should prove:

- the schema is sufficient
- the runtime fallback is plausible
- the resulting authoring rule is usable in ongoing math rollout work

## Pilot landscape

Use:

- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`

Do not start with a separate subject or a greenfield example.

## Pilot slice

Use one narrow slice in each school stage:

- one reviewed **Sek I** fachlicher corridor
- one reviewed **Sek II** fachlicher corridor

Recommendation:

- Sek I pilot: the existing `Funktionsgrundlagen (Sek I)` corridor or one comparably stable functions corridor
- Sek II pilot: one already mature upper-secondary corridor with active multi-state relevance

The exact atomic coverage can stay small. The goal is schema and projection validation, not full semantic migration.

## Pilot deliverables

### Deliverable 1. Program-unit skeleton

Add a reviewed structural skeleton for canonical Gymnasium mathematics:

- `Gymnasium`
- `Sek I`
- `Sek II`
- `J5-J10`
- `E`, `Q1`, `Q2`, `Q3`, `Q4`

This is enough to drive the first scoped projections.

### Deliverable 2. Placement context vocabulary

Use the reviewed context keys from this paper:

- `schoolForm`
- `stage`
- `jurisdiction`
- `durationModel`
- `courseProfile`

No extra keys in the first pilot unless a concrete need appears.

### Deliverable 3. Small placement set

Add placements only for:

- the chosen Sek I pilot corridor
- the chosen Sek II pilot corridor
- optionally their immediate child goals, if needed for a meaningful projection

Do not attempt full-file placement coverage in the first pilot.

### Deliverable 4. Read-only projection path

The first runtime step should be read-only:

- derive scoped structural views from placements when present
- fall back to legacy wrappers when absent

Do not attempt a full UI rewrite in the pilot.

### Deliverable 5. Authoring rule freeze

Once the pilot is in place, continue canonical mathematics rollout under this rule:

- new corridor semantics should be authored fachlich first
- structural positioning should increasingly be placement-based

This is the main payoff of the pilot.

## Recommended work order

The next concrete steps should be:

1. define TypeScript/backend shape support for the four optional structures
2. keep loaders fully backward compatible
3. add the canonical mathematics program-unit skeleton
4. annotate one Sek I and one Sek II pilot slice with placements
5. build one read-only projection path in runtime
6. only then expand placement-based authoring to further math corridors

## Why this should happen before more canonical multi-state math modeling

Without this step, continued authoring risks hardening the wrong semantics:

- more state overlap gets encoded into year/phase wrappers
- more canonical corridor work inherits `phase` as if it were the semantic backbone
- later migration cost rises with every additional corridor

With this step:

- the architecture stays small
- the modeling direction becomes explicit
- mathematics rollout can continue with less semantic debt

## Summary

The smallest safe next step is not a full migration.

It is:

- one small schema extension
- one explicit runtime fallback strategy
- one narrow canonical mathematics pilot

That is enough to keep moving while avoiding further entrenchment of `phase`-centric modeling.
