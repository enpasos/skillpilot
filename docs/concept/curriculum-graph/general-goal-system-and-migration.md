# General Goal System and Migration

This document defines a more general target model for SkillPilot landscapes.

Use this document for:

- the layered target model
- the semantic separation between goals, program units, placements, and competency axes
- the migration direction from legacy mixed trees toward that target model

Use related documents for narrower questions:

- `docs/dev/curriculum-graph-minimal-schema-runtime-fallback-and-math-pilot.md`
- `docs/concept/curriculum-graph/view-projection-and-goal-placement.md`
- `docs/concept/curriculum-graph/graph-definition.md`

It is motivated by one concrete pressure point in the current canonical Gymnasium work:

- the runtime currently overloads `phase` with very different semantics such as `J8`, `Q2`, `S3`, `Modul`, and `Bachelorarbeit`
- the current math trees still mix **content goals** and **program structure** in the same node space
- that works for school pilots, but it does not generalize cleanly to Hochschulkontexte, mixed programs, or multiple concurrent views of the same domain

The goal of this document is therefore twofold:

1. define a **general but simple** target model for learning goals
2. define a **migration path** from the current runtime-compatible JSON landscapes toward that model without a big-bang rewrite

## Design objective

SkillPilot should support at least these cases with one conceptual model:

- school curricula with year-level and phase views
- university programs with semesters, modules, tracks, and exams
- cross-program domains where the same content-level competence appears in different structural contexts
- multiple derived views on the same canonical goals, for example:
  - by year
  - by semester
  - by module
  - by topic
  - by process competence
  - by jurisdiction

The system should stay simple enough that:

- current loaders and mastery logic do not need a full rewrite
- existing JSON landscapes remain readable and valid during the transition
- new canonical work can move gradually into the more general model

## Modeling maxim

The guiding modeling maxim for this target system is:

**As much semantics as necessary, as little ontology as possible.**

Interpretation:

- SkillPilot should prefer a small, operationally useful semantic core over a heavy ontology
- distinctions should be introduced only when they solve a real modeling or runtime problem
- the goal is not to formalize every educational nuance upfront
- the goal is to keep authoring, migration, validation, and learner-facing runtime behavior understandable

In practice, this means:

- keep the skill graph as the core
- add only a few extra semantic layers where they clearly pay off, especially `programUnits`, `goalPlacements`, and `competencyCatalog`
- avoid creating rich ontological taxonomies unless they unlock concrete value such as projection, filtering, reporting, interoperability, or safer migration
- prefer reviewed modeling discipline over theoretical completeness

This maxim is especially important for curriculum work, because curricula are usually didactic and administrative artifacts, not naturally clean ontological systems.

## User-facing entry scope

In real usage, learners and teachers will often not enter a landscape through a fully open canonical graph.

They will usually narrow the relevant material first through a small number of contextual choices such as:

- school form, for example `Gymnasium`
- stage, for example `Sekundarstufe I` or `Sekundarstufe II`
- jurisdiction, for example `DE-HE` or `DE-BB`
- duration model, for example `G8` or `G9`
- course profile, for example `GK` or `LK`
- current structural unit, for example `Jahrgang 8`, `E-Phase`, or `Q2`

This initial narrowing is important, but it should not be confused with the semantic identity of the goals.

Interpretation:

- these choices form a **user-facing entry scope**
- entry scope is a query and navigation context
- it is applied to program units, placements, and applicability
- it should not force duplication of the underlying content goals

So the long-term user flow is:

1. choose an entry scope such as `Gymnasium -> Sek II -> DE-BY -> GK -> Q2`
2. compile the relevant learner-facing tree from a reviewed composition view if one exists for that scope, otherwise fall back to the reviewed projection contract over program units and placements
3. then navigate primarily through the content topics and frontier within that scoped view

This keeps the system practical for real users without overloading the goal ontology.

For such a resolved learner-facing scope, the default tree should be a single-occurrence projection:

- the same canonical goal may appear under a different path in Hessen than in Bayern
- but within one resolved scope, it should appear only once and under at most one visible parent

## Core principle

The central modeling rule is:

**Goals are stable. Structure is contextual.**

This means:

- a **goal** is a learnable, assessable competence
- a **program unit** is a contextual container such as a year, semester, module, phase, or track
- a **competency axis entry** is a taxonomy item such as `K1` or `Scientific Writing`
- a **placement** links a goal into a program unit

So:

- `Jahrgang 8` is not itself a competence
- `Semester 3` is not itself a competence
- `K1 Mathematisch argumentieren` is usually not itself a concrete assessable goal
- but `lineare Funktionen aus Graph, Tabelle und Term verknüpfen` is a goal
- and `Argumentationslücken in einer mathematischen Begründung erkennen` can also be a goal

## The target model

The general target model has four semantic layers plus one learner-facing composition layer.

### 1. Goal layer

This layer contains the actual learning graph.

It includes:

- atomic goals
- content cluster goals
- didactic prerequisite edges via `requires`
- content aggregation edges via `contains`

Rules:

- only goals live in the mastery model
- only goals participate in the frontier
- only goals may appear in `requires`
- `contains` on goals means content composition, not year/semester placement

Examples:

- `Lineare Funktionen aus verschiedenen Darstellungen verknüpfen`
- `Ableitung als lokale Änderungsrate deuten`
- `Erhebungsdaten mit Kenngrößen auswerten`
- `Grundlagen quadratischer Funktionen`

### 2. Program layer

This layer contains the structural units of a curriculum or program.

It includes:

- years
- semesters
- modules
- phases
- tracks
- exams
- study sections such as `Grundlagenphase`

These are not goals. They are contextual units that organize goals.

Examples:

- `Jahrgang 8`
- `Q2`
- `Semester 1`
- `Analysis I`
- `Wahlpflichtbereich`

### 3. Placement layer

This layer links goals into program units.

It answers questions such as:

- in which year is this goal primarily introduced?
- in which semester is this goal assessed?
- in which jurisdiction does this goal belong to a specific module?

The same goal may have multiple placements.

That is the key reason this layer must be explicit rather than simulated through duplicated year or semester nodes.

Examples:

- the same statistics goal is placed in `J9` in one school context and in `J10` in another
- the same proof-related goal is placed in `Semester 2` of one study program and `Semester 3` of another

### 4. Competency-axis layer

This layer contains taxonomy entries that describe orthogonal dimensions of goals.

Examples:

- process competencies like `K1-K6`
- scientific practices
- language skills
- generic university capabilities such as `Scientific Writing`

These are not program units.

They are also not automatically goals.

They become goals only when the curriculum contains a concrete, assessable process-specific competence.

Examples:

- `K1 Mathematisch argumentieren` is a competency-axis entry
- `Mathematische Argumentationen auf Schlüssigkeit prüfen` can be a goal that references `K1`

### 5. Composition-view layer

This layer defines learner-facing default trees for resolved scopes such as:

- `DE-HE / Gymnasium / SekII / Mathematik / LK`
- `DE-BY / Gymnasium / SekII / Mathematik / LK`

It is not part of the canonical skill graph itself.

It is a separate view artifact that answers:

- how should one resolved scope see the subject as a single learner-facing tree?
- which reviewed upper structure should be shown first?
- which canonical subtrees should be expanded under that structure?

Recommended interpretation:

- a composition view is a separate JSON file or equivalent artifact
- it may define view-only structure nodes, labels, and order
- it references reviewed canonical subtree roots from the skill graph
- it must not inline authored atomic goals
- it must not redefine canonical `requires`
- it must compile to a single-occurrence tree in the resolved scope

This means:

- the canonical graph remains the shared content source of truth
- the composition view becomes the explicit authoring surface for a learner-facing Bundesland or curriculum tree
- validation can run on the compiled tree before any UI logic is involved

## Minimal target data structures

The target model should be introduced additively, not by replacing `LearningLandscape` and `LearningGoal`.

The minimal additions are:

- `programUnits`
- `goalPlacements`
- `competencyCatalog`
- `competencyRefs` on goals

These additions describe the general target model.

In the first Gymnasium convergence step, repositories MAY defer some of them and start with canonical landscapes plus goal mappings only.

That narrower restriction is a rollout decision, not a contradiction of the broader additive target model.

Repositories MAY additionally define separate scope-specific composition-view files for learner-facing default trees.

These are separate view artifacts rather than mandatory additions to every `LearningLandscape` object, so they are not listed here as core schema additions.

### Program units

Suggested shape:

```json
{
  "id": "de-gym-math-j8",
  "kind": "year",
  "label": "Jahrgang 8",
  "order": 8,
  "parentUnitId": "de-gym-math-sek1"
}
```

Suggested `kind` values for the first implementation:

- `year`
- `semester`
- `module`
- `phase`
- `track`
- `exam`
- `program`

No larger taxonomy is needed at the start.

### Goal placements

Suggested shape:

```json
{
  "goalId": "goal-linear-functions-basic",
  "unitId": "de-gym-math-j8",
  "relation": "primary",
  "context": {
    "jurisdiction": "DE-BY"
  }
}
```

Suggested `relation` values for the first implementation:

- `primary`
- `secondary`
- `assessed`

This is intentionally small.

It is enough to:

- generate year, semester, and module views
- represent multiple contextual placements
- distinguish the main anchor from additional placements

The `context` object on placements should also be understood as the natural home for entry-scope-sensitive distinctions such as:

- `jurisdiction`
- `schoolForm`
- `stage`
- `durationModel`
- `courseProfile`
- other reviewed program flavors that affect placement without changing the underlying goal

### Competency catalog

Suggested shape:

```json
{
  "id": "PROCESS.K1",
  "label": "Mathematisch argumentieren",
  "dimension": "process-competency"
}
```

The first implementation does not need a full ontology language.

Simple catalog entries with stable IDs are enough.

### Goal competency references

Suggested shape on goals:

```json
{
  "id": "goal-proof-critique",
  "title": "Argumentationslücken erkennen",
  "competencyRefs": ["PROCESS.K1"]
}
```

This should eventually become the general form of what current landscapes express with:

- `dimensionTags.processCompetencies`
- `kompetenzen`

## What belongs where?

### A. Things that should be modeled as goals

- assessable conceptual competences
- assessable procedural competences
- assessable process-specific competences
- content clusters that bundle these goals

Examples:

- `Ableitung als Steigung deuten`
- `Lineare Gleichungssysteme lösen`
- `Daten mit Lage- und Streuungsmaßen auswerten`
- `Argumentationslücken in einer mathematischen Lösung erkennen`

### B. Things that should be modeled as program units

- years
- semesters
- modules
- phases
- tracks
- degree milestones
- exam containers

Examples:

- `Jahrgang 9`
- `Q2`
- `Semester 1`
- `Analysis I`
- `Bachelorprüfung`

### C. Things that should be modeled as competency-axis entries

- `K1-K6`
- language skill families
- generic scientific practice families
- transversal capability families

Examples:

- `PROCESS.K1`
- `PROCESS.K4`
- `LANGUAGE.WRITING`
- `SCIENCE.MODELING`

### D. Things that may appear both as taxonomy and as goals

This is important for process competencies.

Examples:

- `K1 Mathematisch argumentieren` as taxonomy entry
- `Mathematische Argumentationen auf Gültigkeit prüfen` as a concrete goal

So the rule is:

- broad capability families live in the competency catalog
- concrete assessable realizations live in the skill graph

## Consequences for the current SkillPilot model

### 1. `phase` is too overloaded

The current runtime already mixes:

- school years like `J8`
- school phases like `Q2`
- university semesters like `S3`
- structural labels like `Modul`
- degree-level markers like `Bachelorarbeit`

This means `phase` is no longer a clean semantic field.

In the target model:

- `phase` should become a **compatibility/view field**
- explicit program structure should move to `programUnits`

### 2. Current year and phase nodes are useful, but semantically unstable

The current canonical math tree with `J5-J10`, `E`, and `Q1-Q4` is still useful as a migration scaffold and learner-facing navigation.

But semantically these are not the right long-term backbone of the skill graph.

They should gradually become:

- generated or projected view structures
- or compatibility wrappers

instead of remaining the canonical semantic container for goals.

### 3. Existing content corridors are the better long-term backbone

Nodes such as:

- `Funktionsgrundlagen (Sek I)`
- `Q2-Integralrechnung`
- `Q3 Stochastik`

are closer to the durable semantic structure than year or semester wrappers.

These should remain in the skill graph.

### 4. Mastery belongs to goals, not to structure

The system should continue to store mastery on goals only.

Progress for:

- years
- semesters
- modules
- competency axes

should be aggregated from goal mastery through placements and references.

This keeps the state model simple and avoids duplicated mastery semantics.

## Interaction with applicability

`applicability` remains useful, but it serves a different purpose.

Interpretation:

- `goalPlacements` model structural contextual placement
- `applicability` models filtered visibility in learner-facing runtime views
- reviewed composition views may define the default learner-facing tree for one resolved scope

So:

- placement says where a goal belongs in a program view
- applicability says in which filtered runtime views a goal is visible
- composition view says how one resolved scope should see one default learner-facing tree

Long-term, compiled `applicability` can be derived from:

- mappings
- provenance
- reviewed placement context
- explicit reviewed overrides

It should not replace placements.

## Interaction with user-facing entry scope

The user-facing narrowing step should be modeled as a runtime scope, not as a new semantic node type.

Recommended interpretation:

- reviewed composition views provide the preferred learner-facing default tree when a scope-specific tree must be explicit
- `programUnits` provide the program structure that users can browse and that composition/runtime logic can reference
- `goalPlacements.context` carries distinctions such as jurisdiction, duration model, and course profile
- `applicability` controls reviewed visibility in filtered runtime views
- the selected entry scope tells the runtime which projected subset to show first

For the current Gymnasium use case, this means:

- `Gymnasium` is part of the high-level program context
- `Sek I` versus `Sek II` is primarily a program-layer distinction
- `Bundesland` is primarily a placement and applicability context
- `G8` versus `G9` is primarily a duration-model context
- `GK` versus `LK` is primarily a course-profile context
- `J5-J13`, `E`, `Q1-Q4` are user-facing structural anchors, not the canonical meaning of the content goals

This is exactly the kind of initial narrowing that should happen before the user dives into content topics.

## Interaction with process competencies

Process competencies fit naturally into the model once the competency-axis layer exists.

Recommended interpretation:

- `K1-K6` are competency-axis entries, not program units
- they do not need to be primary parent nodes in the canonical math tree
- a process-competency tree in the UI should be a projected view from `competencyRefs`

Only when a process skill is concretely assessable should it be encoded as an actual goal.

Examples:

- `PROCESS.K1` = taxonomy entry
- `Begründungen auf Schlüssigkeit prüfen` = actual goal, linked to `PROCESS.K1`

## Example target shape

The following example is intentionally small.

For readability, this example uses symbolic IDs. Production landscapes still use UUID `id` values and may additionally expose readable `shortKey` values.

```json
{
  "landscapeId": "canonical-math-de",
  "title": "Mathematik (Gymnasium, DE)",
  "goals": [
    {
      "id": "goal-linear-functions",
      "title": "Lineare Funktionen aus Darstellungen verknüpfen",
      "description": "Die lernende Person kann ...",
      "weight": 1,
      "contains": [],
      "requires": [],
      "dimensionTags": {
        "framework": "canonical-math",
        "demandLevel": "AB2",
        "phase": "LEGACY"
      },
      "competencyRefs": ["PROCESS.K4", "PROCESS.K6"]
    }
  ],
  "programUnits": [
    {
      "id": "de-gym-math-sek1",
      "kind": "program",
      "label": "Sekundarstufe I"
    },
    {
      "id": "de-gym-math-j8",
      "kind": "year",
      "label": "Jahrgang 8",
      "order": 8,
      "parentUnitId": "de-gym-math-sek1"
    },
    {
      "id": "de-gym-math-j9",
      "kind": "year",
      "label": "Jahrgang 9",
      "order": 9,
      "parentUnitId": "de-gym-math-sek1"
    }
  ],
  "goalPlacements": [
    {
      "goalId": "goal-linear-functions",
      "unitId": "de-gym-math-j8",
      "relation": "primary",
      "context": {
        "jurisdiction": "DE-BY",
        "schoolForm": "Gymnasium",
        "stage": "SekI",
        "durationModel": "G9"
      }
    },
    {
      "goalId": "goal-linear-functions",
      "unitId": "de-gym-math-j9",
      "relation": "primary",
      "context": {
        "jurisdiction": "DE-BB",
        "schoolForm": "Gymnasium",
        "stage": "SekI",
        "durationModel": "G9"
      }
    }
  ],
  "competencyCatalog": [
    {
      "id": "PROCESS.K4",
      "label": "Darstellen",
      "dimension": "process-competency"
    },
    {
      "id": "PROCESS.K6",
      "label": "Kommunizieren",
      "dimension": "process-competency"
    }
  ]
}
```

## Migration strategy

The migration should be additive and reversible.

### Phase 0. Freeze semantics, not files

Before changing structure, make one modeling rule explicit:

- year, semester, module, and phase nodes are treated as structural compatibility nodes
- new content modeling should prefer content clusters and goals

This phase is conceptual, not technical.

### Phase 1. Add optional fields to the runtime contract

Add optional support for:

- `programUnits`
- `goalPlacements`
- `competencyCatalog`
- `competencyRefs`

No existing file needs to change immediately.

The runtime remains backward compatible.

### Phase 2. Mirror current structure without removing anything

For pilot landscapes such as canonical mathematics:

- keep the current tree working
- add `programUnits` that mirror existing year/phase structure
- add `goalPlacements` that mirror the current visible placement
- continue to read `phase` as fallback

This creates a dual representation during transition.

### Phase 3. Teach the runtime to project views

Update frontend/backend logic step by step so it can derive views from:

- reviewed composition views for learner-facing default trees
- `goalPlacements` for program trees
- `competencyRefs` for competency trees

with fallback to:

- legacy `phase`
- legacy year/phase wrapper nodes

This is the key compatibility step.

### Phase 4. Change authoring rules for new canonical work

Once runtime projection exists:

- new content goals should no longer be forced under year or semester parents
- new year/semester/module structure should be expressed in `programUnits`
- process families like `K1-K6` should be expressed in `competencyCatalog`
- learner-facing Bundesland or curriculum default trees should be authored as separate reviewed composition views when explicit upper structure is needed

This stops the semantic debt from growing.

### Phase 5. Extract semantic backbone from existing pilot trees

For canonical mathematics:

- keep content corridors as real goal clusters
- gradually stop treating `J5-J10`, `E`, `Q1-Q4` as the primary semantic containers
- move their long-term role into placements and projected views

This can happen corridor by corridor.

No big-bang rewrite is necessary.

### Phase 6. Deprecate overloaded phase semantics

Only after the placement-based runtime is stable:

- narrow the meaning of `dimensionTags.phase`
- or explicitly rename it for compatibility use in a later major cleanup

Until then:

- `phase` remains allowed
- but it is understood as compatibility/view metadata, not the canonical semantic anchor

## Recommended first implementation rules

To keep the first step tractable, use these rules:

- do not redesign mastery storage
- do not redesign `requires` or `contains`
- do not remove existing year/phase nodes yet
- add only the smallest new structures needed for projection
- use stable IDs for program units and competency catalog entries
- keep `competencyRefs` flat at first; do not build a complex ontology engine

For learner-facing scoping:

- model initial narrowing as runtime scope and placement context
- do not encode school form, stage, jurisdiction, duration model, or course profile by duplicating goals
- let users enter through structural views such as `Sek I`, `Q2`, or `Jahrgang 8`, then transition into content navigation

## What this means for the canonical Gymnasium math rollout

Short term:

- the current `J5-J10` scaffold remains acceptable as a migration scaffold
- the active BB/BE/BY/HE/etc. rollout can continue

Medium term:

- new canonical math work should increasingly favor content corridors plus placements
- not ever larger year-centered canonical trees

Long term:

- the canonical math graph becomes content-centered
- year and phase trees become projected learner-facing views
- the same mechanism can later support university programs without changing the underlying conceptual system

## Summary

The target system should separate five things that are currently partially mixed:

- **goals** = what is learned
- **program units** = where a goal is located in a curriculum or degree structure
- **placements** = how a goal is attached to that structure
- **competency axes** = orthogonal taxonomies like process competencies
- **composition views** = how one resolved scope sees one learner-facing default tree

This is general enough for both Gymnasium and university programs.

It is also simple enough to be introduced incrementally into the current SkillPilot runtime.
