# Requires Relation Checks

This document lists the checks we can run around `requires` and `effective requires`.
Goal: keep prerequisites minimal, correct, and inherited via `contains`.

## Scope
A subset of these checks is implemented in `app/scripts/validateGraph.ts` and run in CI via `npm run validate:graph`.
Minimality checks are recommended but not enforced in CI at the moment.

## Definitions
- **Direct requires**: the `requires` array on a goal.
- **Effective requires**: direct requires of the goal + direct requires of all `contains` ancestors.

## Hard checks (CI errors)
1. **Reference integrity**: every `requires`/`contains` id resolves (local IDs, or cross-landscape refs via `LANDSCAPE:ID`).
2. **No self-requires / self-contains**: a goal must not require or contain itself.
3. **Acyclic direct requires**: no cycles in the direct `requires` graph.
4. **Acyclic effective requires**: no cycles after inheritance.
5. **Acyclic contains**: no cycles in the `contains` hierarchy.

## Minimality checks (recommended)
1. **Inherited redundancy**: if a direct `requires` is already inherited from an ancestor, remove it.
2. **Transitive redundancy**: if a `requires` edge is implied by another path in the effective-requires graph, remove it.
3. **Shared requires lifting**: if all children of a cluster share the same direct `requires`, move those to the cluster and remove from children.

## Heuristic checks (not automated)
1. **Forward-phase edges**: flag `requires` that point to a later phase (order: E < Q1 < Q2 < Q3 < Q4; ignore GLOBAL).
2. **Subtree requires**: flag `requires` that point into a goal's own `contains` subtree (often indicates inverted modeling).
3. **Sparse later-phase requires**: if a later-phase goal has empty effective requires while siblings are constrained, review for missing prerequisites.

## Output format
- CI output lists violations with landscape id and goal id (errors only for now).

## Rule of thumb
Prefer **effective requires** (inheritance via `contains`) over direct `requires`.
Never add a direct `requires` if it is already implied transitively.
