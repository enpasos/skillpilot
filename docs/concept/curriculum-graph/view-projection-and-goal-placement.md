# View Projection and Goal Placement

This document defines the conceptual contract for deriving user-facing trees and other navigable views from curriculum JSON.

Use this document for:

- the contract for visible trees and projected views
- the role of `programUnits`, `goalPlacements`, scope-specific composition views, and competency projections
- the rule that a reader should be able to reconstruct the default tree from documented JSON fields

Use related documents for adjacent concerns:

- `docs/concept/curriculum-graph/general-goal-system-and-migration.md`
- `docs/dev/curriculum-graph-minimal-schema-runtime-fallback-and-math-pilot.md`
- `docs/concept/curriculum-graph/graph-definition.md`

These related documents explain the layered model, the transition strategy, and the formal goal graph. This document answers a narrower question:

**How must projection work so that a reader can determine the visible tree from the JSON with simple, documented rules and without reading runtime code?**

## Design objective

The projection model should satisfy six requirements:

1. It must be understandable from the data alone.
2. It must keep content structure separate from program structure.
3. It must support multiple placements of the same goal without duplicating goal identity.
4. It must be deterministic across implementations.
5. It must avoid hidden reparenting heuristics.
6. For any resolved learner-facing scope, the default tree must show each goal at most once.

In practical terms:

- a viewer should be able to inspect `contains`, `programUnits`, `goalPlacements`, and explicit filters
- then derive the default tree shape with local, explicit rules
- without relying on title matching, `phase` guesses, or runtime-specific anchor inference

## Core distinction: four different view families

SkillPilot should distinguish four different view families.

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

### 4. Scope-specific composition tree

Question answered:

- "How should one resolved scope see this subject as one learner-facing default tree?"

Source of truth:

- a scope-specific composition view file
- the canonical goal graph

This is the preferred learner-facing default tree for views such as:

- `DE-HE / Gymnasium / SekII / Mathematik / LK`
- `DE-BY / Gymnasium / SekII / Mathematik / LK`

It is not a raw rendering of the goal graph.

It is a compiled tree projection built from explicit composition structure plus canonical subtree expansion.

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

When a reviewed scope-specific composition view exists, `goalPlacement` is no longer the primary authoring surface for the learner-facing default tree of that scope.

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
- scope-specific composition tree: composition view file plus canonical subtree expansion

A view may enrich rendering with badges or filters from other layers, but it should not silently replace its structural source of truth.

### Rule 4: A reviewed composition view is the preferred source of truth for a learner-facing default tree

If a repository defines an explicit composition view for a resolved scope, the learner-facing default tree for that scope should be compiled from:

- the composition view file
- the canonical goal graph

In that case:

- `programUnits` and `goalPlacements` still remain valid for program views, reporting, filters, and diagnostics
- but they must not silently override the reviewed composition view when building the default learner-facing tree

### Rule 5: A default tree is a single-occurrence projection in a resolved scope

A default learner-facing tree is always evaluated relative to a resolved scope such as:

- `jurisdiction = DE-HE`
- `schoolForm = Gymnasium`
- `stage = SekII`
- `courseProfile = LK`

Within that resolved scope:

- each visible goal must occur at most once in the default tree
- each visible goal must have at most one visible parent in the default tree
- `secondary` placements, `assessed` placements, badges, overlays, or diagnostics must not create additional node instances

Changing the resolved scope may legitimately yield a different visible path to the same atomic goal.

But within one resolved scope, the default tree must remain a single-occurrence tree projection rather than a raw graph rendering.

## Scope-specific composition view contract

The preferred way to define a learner-facing Bundesland or curriculum tree is an explicit composition view file.

Such a file may be maintained jointly with, or even by, the responsible jurisdiction, because it defines only the scope-specific top structure and the chosen attachment points into the canonical graph.

Recommended tooling consequence:

- local authoring should ideally expose one editor for canonical clusters and a separate editor for composition views, rather than one mixed editor that edits both layers at once

Implementation-oriented details for that tooling split belong in:

- `docs/dev/curriculum-authoring-editors.md`

### What a composition view may contain

- structure nodes for the learner-facing upper tree
- labels and explicit child order for those structure nodes
- references to canonical subtree roots
- explicit scope metadata describing when the view applies

### What a composition view must not contain

- no authored atomic goals
- no new canonical goal payload
- no new `requires` edges
- no hidden inference based on title or `phase`

### Canonical subtree references

A composition view should reference reviewed canonical subtree roots.

Preferred rule:

- referenced roots are canonical cluster goals, not atomic goals

This keeps the composition file small and keeps the canonical content model authoritative for the subtree contents.

### Non-overlap rule

Within one compiled default tree, expanded canonical subtree references must be pairwise disjoint with respect to visible goals.

If two referenced subtree roots would expand to overlapping visible canonical goals, the composition view is invalid for default-tree compilation unless an explicit reviewed resolution contract exists.

The preferred initial rule is simpler:

- overlapping subtree references are a compile-time validation error

### Early compile rule

The default learner-facing tree should be produced by an early deterministic compile step:

1. resolve the scope
2. select the matching composition view, if one exists
3. expand canonical subtree references
4. validate single occurrence, non-overlap, and parent uniqueness
5. emit a compiled tree artifact for the runtime

This compile step must happen early enough that programmatic validation rules can run on the compiled tree before any UI rendering logic.

### Learning roles in a compiled composition view

A compiled composition view distinguishes two runtime roles without changing the canonical goal graph:

- `target`: a selectable learning target in this learner-facing scope
- `prerequisiteOnly`: a supporting goal whose global mastery may block or unlock a target, but which is not itself selectable in this scope

The role is authored explicitly on `canonicalSubtree` and `goalEntry` references with
`projectionRole: "target" | "prerequisiteOnly"`. If the field is omitted, the
reference is a `target`. Descendants of a `canonicalSubtree` inherit its authored
role.

If overlapping references assign different roles to the same canonical goal,
the more specific reference decides:

1. a direct `goalEntry` overrides a role inherited from any
   `canonicalSubtree`
2. among overlapping `canonicalSubtree` references, the nearest/deepest
   matching subtree root overrides a broader subtree
3. only when two assignments have equal specificity does `target` win

This precedence lets a broad reviewed subtree remain selectable while individual
supporting goals inside it are explicitly demoted to `prerequisiteOnly`, without
copying or enumerating the rest of the subtree.

Role assignment is intentionally **not** derived transitively from `requires`, nor
inferred from broad metadata such as `phase`, year, or stage. The canonical
`requires` graph still determines whether an explicitly included supporting goal
blocks or unlocks a target. This makes that support relationship reviewable and
prevents unrelated inherited goals from silently becoming hidden blockers.

The runtime contract is:

- only targets may appear in learner navigation or as frontier candidates
- only targets contribute to scope progress and scope completion
- a prerequisite-only goal never becomes a frontier candidate in that view
- the global mastery value of a prerequisite-only goal still blocks or unlocks dependent targets through the unchanged canonical `requires` edges
- targeted repetition of an earlier goal requires an explicit target reference or a separate reviewed repetition plan; it must not become selectable merely because it is an earlier-phase goal

This distinction keeps bridge competencies available for sequencing while
preventing unrelated or supporting goals from leaking into the Sek-II frontier.

For the reviewed Hessen Sek-II-LK mathematics projection:

- the J9/J10 bridge goals are explicitly included as `prerequisiteOnly`
- the five formula-sheet goals and the J7 chain are explicitly included as
  `prerequisiteOnly`: they are not frontier targets, but their existing global
  mastery may still block or unlock genuine Sek-II targets that canonically
  require them
- genuine Sek-II goals are explicitly included as targets
- if an earlier goal should become selectable for targeted repetition, the view
  must promote it explicitly to `target` or use a separately reviewed repetition
  plan

Compilation must not:

- create duplicate goal identities
- copy or reset mastery values
- rewrite canonical `requires` or `contains` edges
- replace stable goal IDs

The role assignment is therefore projection metadata only. Canonical goal identity, the canonical DAG, and learner mastery remain global and unchanged across composition views.

## Default content tree contract

The default content tree is the canonical content-only view.

### Definition

- nodes are goals
- content edges are exactly the explicit `contains` edges between goals
- roots are goals that are intentionally designated as content roots or have no content parent in the selected landscape

A landscape that claims a default content tree MUST ensure that every visible goal has at most one visible content parent in the resolved scope.

If the authored graph gives a goal multiple direct content parents globally, the repository must document a deterministic parent-resolution rule for the default content tree.

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
- they do not create additional visible occurrences of the goal in the default tree

Resolution rules:

- exactly one matching `primary` placement => attach there
- zero matching `primary` placements => do not invent a parent; hide the goal from the default program tree or surface an `unplacedInScope` diagnostic
- more than one matching `primary` placement => invalid default projection unless a documented tie-break or reviewed cross-jurisdiction placement profile resolves it

This keeps the primary tree readable and prevents uncontrolled duplication inside the program view.

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

## Consequence for placements across multiple program units

If a goal is placed in multiple program units, the default program tree for a resolved scope still shows that goal at most once.

For example:

- one matching `primary` placement may make the goal visible under `E`
- additional `secondary` or `assessed` placements for `Q1` or `Q2` may still be surfaced as metadata, badges, or optional overlays

But they must not create additional occurrences of the same goal inside the default learner-facing tree.

## Sketch of a composition view

Illustrative shape:

```json
{
  "viewId": "de-he-gym-sekii-math-lk",
  "landscapeId": "canonical-math-de",
  "scope": {
    "jurisdiction": "DE-HE",
    "schoolForm": "Gymnasium",
    "stage": "SekII",
    "courseProfile": "LK"
  },
  "rootNodes": [
    {
      "kind": "structure",
      "id": "sek2",
      "label": "Sekundarstufe II",
      "children": [
        {
          "kind": "structure",
          "id": "e-phase",
          "label": "E-Phase",
          "children": [
            { "kind": "canonicalSubtree", "goalId": "550e8400-e29b-41d4-a716-446655440100" }
          ]
        }
      ]
    }
  ]
}
```

Interpretation:

- the composition file defines only the learner-facing structure nodes
- subtree contents still come from the canonical graph
- the compiled result must still satisfy single-occurrence validation

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
- treating a compiled default tree as something that is discovered late inside the UI

Transitional compatibility logic may still exist during migration.

But it should be treated as a temporary implementation detail, not as the conceptual rule for future landscapes.

## Summary

The key conceptual rule is simple:

- the content tree comes from `contains`
- the program tree comes from `programUnits` plus `goalPlacements`
- the competency view comes from competency references
- the learner-facing default scope tree should come from a reviewed composition view plus canonical subtree expansion

And therefore:

- `goalPlacement` is useful
- but only when it stays explicit and view-specific
- not when it silently rewrites the content tree
