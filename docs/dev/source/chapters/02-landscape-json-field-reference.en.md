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
| `programUnits`, `goalPlacements`, `competencyCatalog` | Optional | Additive projection-layer arrays (@ref{sec:dev-minimal-schema}); `programUnits` and `goalPlacements` also declare learning units (@ref{sec:dev-lj-units}). |
| `learningUnitCoverage` | Optional | `partial` or `complete`; absent means `partial` (@ref{sec:dev-lj-units}). |
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

### Learning Units in the Placement Layer {#sec:dev-lj-units}

Since the Product Owner decision of 12 November 2026, [learning units](repo:docs/concept/skill-graph/learning-units.md) (Graph Definition §11) are part of the skill landscape and are declared in its placement layer. [Curriculum-package contract 1.2](repo:contracts/curriculum-package/v1.2/README.md) carries them; builds under contract 1.0 or 1.1 omit them completely. The existing program-unit kinds (`program`, `stage`, `year`, `phase`, `semester`, `module`, `track`, `exam`) and placement relations (`primary`, `secondary`, `assessed`) keep their meaning.

| Element | Authoring rule |
| --- | --- |
| **Unit** | A `programUnits` entry with `kind: "learningUnit"` and exactly these fields: `id` (lowercase slug such as `math-dot-product-projection`), `label` and `promise` in the authoring locale, `labelEn` and `promiseEn` in English, `revision` (dated revision of the unit definition, `YYYY-MM-DD-vN`), optional `parentUnitId`, optional `order`, optional `coverageReviews`. The promise states what learners can do independently afterwards and why it matters. Any other field is a finding, and `labelEn`, `promise`, `promiseEn`, `revision`, and `coverageReviews` are not allowed on other kinds. |
| **Hierarchy** | `parentUnitId` names the learning unit that requires this unit as a child. Both ends are learning units of the same landscape; a unit has at most one parent, and the hierarchy must be acyclic. A whole-unit prerequisite cannot be expressed. |
| **Ownership** | A `goalPlacements` entry with `relation: "own"`, the `unitId` of a learning unit, and the `goalId` of an atomic goal of the same landscape, without `context` or any other field. A learning unit takes no other relation, and a goal has at most one owning unit. Ownership changes no visible tree. |
| **Reviewed coverage (R2)** | Optional `coverageReviews` on the learning unit: a list of objects with exactly `assessmentGoalId` (an own assessment of the unit; at most one entry per assessment), `goalIds` (own ordinary goals of the unit that this assessment requires and lists in `coveredGoalIds`), `reference` (repository-relative path of the review record), `taskRevision`, and `rubricRevision`. The revisions are `sha256:` hashes over UTF-8 JSON with recursively sorted object keys, unchanged array order, and compact separators: `taskRevision` over the assessment's `{taskContent, solutionContent}`, `rubricRevision` over its `scoring`. Review-bound content uses integer numbers only. Any change of task, solution, or rubric makes the review stale. The review belongs to the unit's local contract and never changes a goal's bytes; `examData` has no review field. |
| **Coverage claim** | Top-level `learningUnitCoverage`: `partial` or `complete`; absent means `partial`. `complete` asserts that every atomic goal of the landscape has exactly one owning learning unit. |
{cols="22%,78%"}

A unit copies no goal data: goal kinds, prerequisites, and `coveredGoalIds` stay on the goals. Whole-unit prerequisites, access locks, and waiver lists cannot be expressed. `npm --prefix app run validate:learning-units` ([validateLearningUnits.ts](repo:app/scripts/validateLearningUnits.ts); rules in [learningUnitContracts.ts](repo:app/scripts/lib/learningUnitContracts.ts)) checks the learning units of the canonical Gymnasium landscapes in the required curriculum CI and fails on any finding: `LU-UNIT`, `LU-UNIT-ID`, and `LU-PLACEMENT` for malformed declarations; `LU-REF`, `LU-ATOMIC`, `LU-KIND`, `LU-EMPTY-SCOPE`, `LU-CHILD`, `LU-HIERARCHY`, and `LU-GRAPH` for structure; and `LU-R1`, `LU-R3`, `LU-R4-MULTIPLE`, `LU-R4-UNOWNED`, and `LU-R2-EVIDENCE` for the unit validity rules. Missing reviewed coverage is reported, not rejected. The runtime does not use learning units yet; every goal is still completed by its own explicit result.
