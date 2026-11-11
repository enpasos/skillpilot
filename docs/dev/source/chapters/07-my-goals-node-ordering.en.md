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
