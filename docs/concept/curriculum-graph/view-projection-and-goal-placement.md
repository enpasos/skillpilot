# View Projection and Goal Placement

This document defines the conceptual contract for deriving user-facing trees and other navigable views from curriculum JSON.

Use this document for:

- the contract for visible trees and projected views
- the role of `programUnits`, `goalPlacements`, and competency projections
- the rule that a reader should be able to reconstruct the default tree from documented JSON fields

Use related documents for adjacent concerns:

- `docs/concept/curriculum-graph/general-goal-system-and-migration.md`
- `docs/dev/curriculum-graph-minimal-schema-runtime-fallback-and-math-pilot.md`
- `docs/concept/curriculum-graph/graph-definition.md`

These related documents explain the layered model, the transition strategy, and the formal goal graph. This document answers a narrower question:

**How must projection work so that a reader can determine the visible tree from the JSON with simple, documented rules and without reading runtime code?**

## Design objective

The projection model should satisfy five requirements:

1. It must be understandable from the data alone.
2. It must keep content structure separate from program structure.
3. It must support multiple placements of the same goal without duplicating goal identity.
4. It must be deterministic across implementations.
5. It must avoid hidden reparenting heuristics.

In practical terms:

- a viewer should be able to inspect `contains`, `programUnits`, `goalPlacements`, and explicit filters
- then derive the default tree shape with local, explicit rules
- without relying on title matching, `phase` guesses, or runtime-specific anchor inference

## Core distinction: three different view families

SkillPilot should distinguish three different view families.

### 1. Content tree

Question answered:

- "What belongs under what in content terms?"

Source of truth:

- goals
- `contains`

This is the learner-facing content hierarchy.

### 2. Program tree

Question answered:

- "Where in the curriculum or program is this goal introduced, revisited, or assessed?"

Source of truth:

- `programUnits`
- `goalPlacements`

This is the learner-facing structural curriculum view.

### 3. Competency tree or competency axis view

Question answered:

- "Along which process or capability axis is this goal classified?"

Source of truth:

- `competencyCatalog`
- `competencyRefs`

This is an orthogonal taxonomy view, not the main content parent tree.

## What `goalPlacement` is for

`goalPlacement` exists to attach an unchanged goal to explicit program structure.

It is useful when:

- the same goal belongs to `E`, `Q1`, and `Q2`
- the same goal is placed in `J9` in one state and `J10` in another
- the same goal is taught in one module and examined in another
- the same goal should be visible in a program view without being re-authored as a new goal

Conceptually, `goalPlacement` answers:

- where is this goal primarily anchored in the program?
- where else is it structurally relevant?
- under which reviewed context does that placement apply?

## What `goalPlacement` is not for

`goalPlacement` must not be used as:

- a hidden replacement for `contains`
- a prerequisite relation
- a mastery container
- a repair mechanism for an unclear content tree
- a reason to infer parentage from titles such as `E-Phase ...` or `Q1 ...`

If a reader should understand from the JSON that goal `A` belongs under content cluster `B`, then `B.contains` must explicitly contain `A`.

## Non-negotiable projection rules

The following rules are the target contract.

### Rule 1: No title-based or phase-based structural inference

Projection must not derive parent-child structure from:

- goal titles
- localized labels
- `phase`
- `dimensionTags.phase`
- string similarity between unit labels and goal titles

Such fields may support filtering, ordering, badges, or diagnostics, but not default parent inference.

### Rule 2: Every visible parent-child edge must come from one explicit source

A visible edge in a default tree must come from exactly one of these sources:

- content edge from `contains`
- program edge from `parentUnitId`
- placement edge from `goalPlacements`
- competency edge from `competencyRefs`

No default visible tree edge should exist only because runtime code guessed it.

### Rule 3: One source of truth per default view

Default views should use one primary relation family:

- content tree: `contains`
- program tree: `programUnits` plus `goalPlacements`
- competency tree: `competencyCatalog` plus `competencyRefs`

A view may enrich rendering with badges or filters from other layers, but it should not silently replace its structural source of truth.

## Default content tree contract

The default content tree is the simplest and most important tree.

### Definition

- nodes are goals
- content edges are exactly the explicit `contains` edges between goals
- roots are goals that are intentionally designated as content roots or have no content parent in the selected landscape

A landscape that claims a default content tree MUST either:

- satisfy at most one direct content parent per goal in the resolved scope
- or document an explicit multi-parent rendering strategy

### Ordering

The default sibling order in the content tree should be:

1. the order of IDs in the parent's `contains` array
2. an explicitly documented child-order field, if such a field is introduced later and used consistently

The default content tree must not reorder siblings by inferred didactic flow unless the UI explicitly offers a separate labeled mode such as "Didactic order".

### Filters

Filtering may:

- hide nodes
- retain ancestors needed to keep a visible path understandable

Filtering must not:

- create a new parent
- move a goal under a different content cluster
- interpret `phase` metadata as parentage

## Default program tree contract

The default program tree is a projection from explicit program structure.

### Definition

- program units form a tree or forest via `parentUnitId`
- unit order comes from explicit `order`
- goals are attached to program units via `goalPlacements`

### Program unit nodes

Program unit nodes may be rendered as synthetic UI nodes if needed.

But they must correspond one-to-one to explicit `programUnits`.

That means:

- a synthetic node for `E-Phase` is acceptable if and only if there is an explicit `programUnit` for `E-Phase`
- reusing an existing content goal as the structural anchor for `E-Phase` is not the target model
- the renderer should show the program unit itself, not guess a nearby content cluster to stand in for it

### Placement semantics

Recommended meaning of placement relations:

- `primary`: default program anchor of the goal in the resolved scope
- `secondary`: additional program relevance, but not the default parent edge in the main tree
- `assessed`: relevant for assessment or exam views

### Default attachment rule

In the default program tree:

- a goal is attached below the program unit(s) for which it has a matching `primary` placement
- `secondary` and `assessed` placements are shown as secondary references, badges, or optional overlays
- they do not silently create additional default parent edges

Resolution rules:

- exactly one matching `primary` placement => attach there
- zero matching `primary` placements => do not invent a parent; hide the goal from the default program tree or surface an `unplacedInScope` diagnostic
- more than one matching `primary` placement => invalid default projection unless a documented tie-break or reviewed cross-jurisdiction placement profile resolves it

This keeps the primary tree readable and prevents uncontrolled duplication.

### Matching context

Placement matching may depend on reviewed context fields such as:

- `jurisdiction`
- `durationModel`
- `courseProfile`
- `schoolForm`
- `stage`

Context narrows whether a placement is active.

Context does not change the identity of the goal.

`ALL` may be used only as a query sentinel while resolving a scope. It must not be serialized inside a placement entry.

### Ordering of placed goals

The default order of goals directly attached to a program unit should be explicit and data-driven.

Recommended precedence:

1. an explicit future placement-order field, if introduced
2. otherwise the order of matching entries in `goalPlacements`

The default program tree should not use hidden topological reordering as its only explanation for sibling order.

### Recommended validity rule

For a resolved runtime scope, a goal should normally have at most one matching `primary` placement in the default program tree.

If multiple program memberships are intended:

- use one `primary` placement
- use `secondary` or `assessed` for the others

This keeps the default tree simple and deterministic.

## Default competency view contract

The default competency view should be projected from explicit competency metadata.

Rules:

- competency categories come from `competencyCatalog`
- goal membership comes from `competencyRefs`
- process titles or tags may be transitional fallbacks, but not the preferred canonical contract

The competency view is a separate projection.

It should not require process nodes to become the main content parents of goals.

## Interaction with `applicability`

`applicability` and `goalPlacement` serve different purposes.

- `goalPlacement` says where a goal belongs in a program view
- `applicability` says in which filtered runtime views a goal is visible

Therefore:

- `goalPlacement` may attach a goal to `Q1`
- `applicability` may additionally say that the goal is visible only for `DE-HE`

`applicability` may hide a node in a filtered view.

It must not create a new parent edge.

## Interaction with `phase`

`phase` is compatibility metadata and may remain useful for:

- display badges
- filtering
- migration compatibility

`phase` is not the default structural source of truth for parent-child relations in projected trees.

In particular:

- `phase: E` does not mean "is a child of the E-Phase node"
- `phase: Q1` does not mean "must be nested under a Q1 content cluster"

If such nesting is wanted in a content tree, it must be explicit in `contains`.

If such nesting is wanted in a program tree, it must be explicit in `programUnits` plus `goalPlacements`.

## Worked example: `Analysis und Wachstum (Sek II)`

Assume the curriculum JSON says:

- the goal `Analysis und Wachstum (Sek II)` contains `E.2`, `E.3`, `E.4`, `Q1 Analysis`, and `Q2.1 Vertiefung der Analysis`
- the goal has placements:
  - `E` as `primary`
  - `Q1` as `secondary`
  - `Q2` as `secondary`

Then the content tree is:

```text
Analysis und Wachstum (Sek II)
  E.2 Einfuehrung des Ableitungsbegriffs
  E.3 Anwendungen des Ableitungsbegriffs
  E.4 Exponentialfunktionen
  Q1 Analysis - Integralrechnung und Differenzialgleichungen
  Q2.1 Vertiefung der Analysis
```

And the program tree is:

```text
Sekundarstufe II
  E-Phase
    Analysis und Wachstum (Sek II)
  Q1
    [secondary reference] Analysis und Wachstum (Sek II)
  Q2
    [secondary reference] Analysis und Wachstum (Sek II)
```

What does **not** follow from that JSON:

```text
E-Phase - Analysis-Cluster
  Analysis und Wachstum (Sek II)
```

That nesting is valid only if the JSON explicitly says so through `contains`.

It must not arise because runtime code matched the word `E` in one place and the words `E-Phase` in another.

## Authoring rules

To keep the model understandable, authors should follow these rules.

### Rule A: Use `contains` only for content composition

Use `contains` when the parent is a real content bundle such as:

- topic cluster
- content corridor
- exercise cluster
- motivation cluster

Do not use `contains` merely to simulate a year or phase placement if `programUnits` and `goalPlacements` can express it directly.

### Rule B: Use `goalPlacements` for program structure

Use `goalPlacements` when the statement is:

- "this goal belongs to E"
- "this goal belongs to Q1 in one context and Q2 in another"
- "this goal is assessed in this exam section"

### Rule C: Do not author hybrid anchor goals for projection

Avoid goals whose main purpose is:

- to stand in for `E`
- to stand in for `Q1`
- to act as a runtime docking node for placements

Such hybrids blur the line between content and structure.

If a phase node is needed in the program tree, that should come from `programUnits`.

### Rule D: If a reader should infer the tree from JSON, the JSON must say it directly

This is the practical test:

- can a careful reader reconstruct the default visible tree by following documented fields only?

If the answer is no, the model is too implicit.

## Consequences for runtime design

The target runtime should expose distinct view modes instead of one mixed tree:

- content tree
- program tree
- competency view

This does not mean the UI must overwhelm users with different modes.

It means the runtime should know which contract it is currently rendering.

The target runtime should therefore avoid:

- attaching program placements to content clusters through title matching
- using `phase` as implicit parent inference
- mixing `contains` and placement edges into one unexplained default tree

Transitional compatibility logic may still exist during migration.

But it should be treated as a temporary implementation detail, not as the conceptual rule for future landscapes.

## Summary

The key conceptual rule is simple:

- the content tree comes from `contains`
- the program tree comes from `programUnits` plus `goalPlacements`
- the competency view comes from competency references

And therefore:

- `goalPlacement` is useful
- but only when it stays explicit and view-specific
- not when it silently rewrites the content tree
