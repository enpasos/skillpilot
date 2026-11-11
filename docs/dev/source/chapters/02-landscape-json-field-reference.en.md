## Landscape JSON Field Reference {#sec:dev-landscape-json}

This chapter documents the field-level authoring and runtime contract for `SkillLandscape` JSON files validated against [`docs/landscape-runtime.schema.json`](repo:docs/landscape-runtime.schema.json) and mapped into `UiGoal` in [`goalTypes.ts`](repo:app/src/goalTypes.ts) (see node semantics in [Node Types](repo:docs/concept/skill-graph/node-types.md) and projection contracts in [View Projection](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)).

### Top-Level `SkillLandscape` Fields {#sec:dev-lj-top}

| Field | Required? | Purpose & Constraints |
| --- | --- | --- |
| `landscapeId` | Yes | Globally unique stable identifier of the skill landscape. |
| `locale` | Yes | Primary authoring locale (`"de"` or `"en"`). |
| `subject` | Yes | Canonical subject key used for routing, grouping, and asset paths. |
| `title`, `description` | Yes | Localized title and overview (`titleEn`, `descriptionEn` optional for inline EN translations). |
| `frameworkId`, `filters` | Optional | Institutional framework tag and selectable scope filter definitions (for example `GK`, `LK`, jurisdiction). |
| `programUnits`, `goalPlacements`, `competencyCatalog` | Optional | Additive projection-layer arrays (@ref{sec:dev-minimal-schema}). |
| `goals` | Yes | Ordered array of `LearningGoal` records forming the `contains` and `requires` DAGs. |
{cols="26%,14%,60%"}

### `LearningGoal`, `dimensionTags`, and Provenance Fields {#sec:dev-lj-goal}

| Field Group | Fields & Runtime Interpretation |
| --- | --- |
| **Identity & text** | `id` (stable UUID, never reused for new meaning), optional landscape-unique `shortKey`, `title` (`titleEn`), `description` (`descriptionEn`). |
| **Graph relations** | `contains` (ordered child goal IDs; empty `[]` = atomic goal, non-empty = cluster goal) and `requires` (prerequisite goal IDs; target state strictly atomic-to-atomic). |
| **Classification & weight** | `weight` (numeric workload/progress weight), optional `core` (`boolean`), `courseLevel`, `tags` (`string[]`), `semanticKind` / `nodeKind` / `type`, `applicability`, and `competencyRefs`. |
| **Pedagogical payloads** | `examples`, `extendedData` (including `applicabilityOverrides` and manual tree-order hints), `examData` (`taskContent`, `solutionContent`, `scoring`), and `experimentData`. |
| **`dimensionTags`** | Structured metadata object: `phase` (`E`, `Q1`–`Q4`, `SekI`, `GLOBAL`, compatibility/badge field), `demandLevel` (`AB1`–`AB3`), `processCompetencies`, `guidingIdeas`, `framework`, `area`, `topicCode`. |
| **Provenance & media** | `sourceRef` (official curriculum locator) and `resourceLinks` (`type: "curriculum"` or `"goal-visualization"`, never new external provider links on canonical goals; see [Source & Resource Links](repo:docs/concept/skill-graph/source-and-resource-links.md)). |
{cols="26%,74%"}

At runtime, frontend loaders normalize `LearningGoal` entries into `UiGoal` (`goalTypes.ts`) and evaluate scope filters, frontier availability, SRS decks, and mastery aggregation without mutating authored JSON identities.
