# Requires Relation Checks

This document lists the checks we can run around `requires` and `effective requires`.
Goal: keep prerequisites minimal, correct, and inherited via `contains`.

## Definitions
- **Direct requires**: the `requires` array on a goal.
- **Effective requires**: direct requires of the goal + direct requires of all `contains` ancestors.

## Hard checks (must pass)
1. **Reference integrity**: every `requires` id exists in the same landscape.
2. **No self-requires**: a goal must not require itself.
3. **No duplicates**: `requires` lists are unique.
4. **Acyclic direct requires**: no cycles in the direct `requires` graph.
5. **Acyclic effective requires**: no cycles after inheritance.

## Minimality checks (keep requires small)
6. **Inherited redundancy**: if a direct `requires` is already inherited from an ancestor, remove it.
7. **Transitive redundancy**: if goal `G` requires `A` and `A` (effective) requires `B`, then `G` must not directly require `B`.
8. **Shared requires lifting**: if all children of a cluster share the same direct `requires`, move those to the cluster and remove from children.

## Heuristic checks (review needed)
9. **Forward-phase edges**: flag `requires` that point to a later phase (order: E < Q1 < Q2 < Q3 < Q4; ignore GLOBAL).
10. **Subtree requires**: flag `requires` that point into a goal's own `contains` subtree (often indicates inverted modeling).
11. **Sparse later-phase requires**: if a later-phase goal has empty effective requires while siblings are constrained, review for missing prerequisites.

## Output format
- List violations with goal id + shortKey.
- Separate: hard errors, minimality suggestions, heuristics.

## Rule of thumb
Prefer **effective requires** (inheritance via `contains`) over direct `requires`.
Never add a direct `requires` if it is already implied transitively.
