## Sibling Node Ordering in 'My Goals' {#sec:dev-node-ordering}

In the learner-facing competence tree ([`CompetenceTree.tsx`](repo:app/src/components/CompetenceTree.tsx)), sibling nodes under a cluster are ordered deterministically by `sortSiblingGoalsBalanced` in [`goalSorter.ts`](repo:app/src/utils/goalSorter.ts) so prerequisites appear before dependents while preserving intentional didactic structure.

### Hard Direct `requires` Topological Sort Plus Six-Tier Tie-Breaker {#sec:dev-no-algorithm}

Given sibling goals under one parent cluster (guaranteed acyclic on `requires`), `sortSiblingGoalsBalanced` executes Kahn's topological sort over **direct sibling-to-sibling `requires` edges** and resolves ready-queue ties strictly in six lexicographic tiers:

| Priority | Criterion | Exact Rule |
| --- | --- | --- |
| **1. Manual order** | Explicit authoring override | Numeric `extendedData.{treeOrder,sortOrder,displayOrder,order,position}` or tag `order:<n>`. |
| **2. Didactic bucket** | Pedagogical framing | `why` (orientation/motivation) $<$ `tutorial` / core competencies $<$ `flashcards` (memory) $<$ `exercises` / exams. |
| **3. Phase order** | Curricular progression | `SekI` / `5`–`10` $<$ `E` $<$ `Q1` $<$ `Q2` $<$ `Q3` $<$ `Q4` $<$ `Abitur` / `GLOBAL`. |
| **4. Descendant support** | Soft cross-cluster `requires` | `softScore(v)` over descendant-level prerequisite dependencies gated by `minAbsoluteSupport = 2` and `minRelativeSupport = 0.25` so isolated single edges do not unexpectedly reorder large clusters. |
| **5. Localized title** | Human-readable fallback | Collator `localeCompare` (`de-DE`, `numeric: true`). |
| **6. Canonical ID** | Final determinism | Lexicographic `goal.id` comparison ensuring 100% deterministic output. |
{cols="20%,24%,56%"}

Note that default raw content-tree inspection ([View Projection](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)) preserves authored `contains` / `treeOrder` sequence, whereas `sortSiblingGoalsBalanced` powers the didactic learner navigation view when explicit `treeOrder` overrides are absent.

### Declared Partial Order and Integrated Learning Map {#sec:dev-no-declared-order}

The sorting described above is the competence-tree heuristic. In the state views delivered through [#160](https://github.com/enpasos/skillpilot/pull/160), source format 1.2 `childOrder.after` has a separate role: it declares a reviewed partial order between sibling units. The composition compiler retains it as `compositionChildOrder`. `after` adds neither `requires` nor frontier access and changes no stored mastery. An authorised learning placement for a necessary atom is likewise not an additional order edge.

The integrated learning map delivered through [#153](https://github.com/enpasos/skillpilot/pull/153) and [#162](https://github.com/enpasos/skillpilot/pull/162) displays units, their order, and subject dependencies. The learning-goal tree remains the content navigation. An activated stage plan supplies shared identities and nested years/phases; without activated plan metadata the map projection remains explicitly provisional. Red backward-dependency arrows require curriculum repair and are not hidden through sorting. The [management record](repo:docs/dev/stage-plan-management-summary.md) states current delivery and acceptance boundaries.
