# Skill Graph

This document is a general, repeatable blueprint for producing a skill graph JSON from any source curriculum.
It is written to be auditable and reusable across domains, institutions, and languages.

For exam authoring workflows, see `exam-example.md`.

---

## Scope

- **Input:** Any authoritative curriculum source (PDF, handbook, spreadsheet, API, internal docs).
- **Output:** A clean `SkillLandscape` JSON under `curricula/<...>/json/<file>.json`.
- **Goal:** A DAG of goals with consistent metadata, stable IDs, and minimal prerequisites.

---

## Inputs (Source of Truth)

1. **Raw source extract (phase 0/1)**

   - Plain text or structured notes.
   - Captures: topic list, outcomes, prerequisites, grading scope, and metadata.

2. **Human skill breakdown (phase 2)**

   - A structured outline of nodes:
     - Root (curriculum or module)
     - Cluster nodes (themes, phases, topics)
     - Atomic goals (measurable skills)

3. **Existing landscape context (optional)**

   - Related landscapes for consistency.
   - Target naming conventions and ID patterns.

---

## Step 0: Extract the source

Goal: normalize the official curriculum into a clean, readable input.

Guidelines:

- Use **plain text** (no HTML).
- Capture titles, outcomes, prerequisites, and scope.
- Keep a clear link to the original source (URL or reference).

---

## Step 1: Create a structured outline

Goal: turn the source into a hierarchical graph outline.

Rules of thumb:

- Start with a **root node** (the full curriculum or module).
- Create **cluster nodes** for phases or topic fields.
- Create **atomic nodes** for measurable goals (1-3 tasks per goal).
- For learner-facing routes, include one or more **motivation** atomic goals and one or more **terminal autonomy** goals where appropriate (often practice or exam-style nodes).
- In phase-based school curricula, prefer **phase-local autonomy clusters** such as `Übungen E-Phase`, `Übungen Q1`, `Übungen Q2`, ... with ordinary klausur character.
- Keep **global Abitur / final-exam branches** separate from these local autonomy routes; they are an additional assessment layer, not a replacement for phase-local self-sufficiency goals.
- Keep titles short and descriptions assessable ("The learner can ...").

---

## Step 2: Generate JSON

Goal: encode the outline as `SkillLandscape` JSON.

### 2.1 Stable identifiers
Use stable IDs so regeneration does not break references.

Options:

- UUID v5 with a project namespace.
- A deterministic mapping from `(landscapeId, shortKey)`.

If `shortKey` is used:

- it remains optional at goal level
- but it must be unique within the logical `landscapeId`
- in multi-file locale serializations of the same landscape, repeating the same `(goalId, shortKey)` pair is acceptable, while reusing one `shortKey` for different goal IDs is not

### 2.2 Required fields (minimum)

Top-level:

- `landscapeId`, `title`, `description`, `locale`, `subject`, `goals`

Goal-level:

- `id`, `title`, `description`, `weight`, `requires`, `contains`, `dimensionTags`
- Recommended stable cross-layer field: `shortKey` (optional, but unique within `landscapeId` if present)
- Inside `dimensionTags`, require at least `phase`; prefer `area`, `topicCode`, `demandLevel`, `processCompetencies`, and `guidingIdeas` when available
- Optional metadata: `tags`, `core`, `examples`, `sourceRef`, `resourceLinks`

### 2.3 Localization

If multilingual:

- Keep separate locale JSONs per landscape.
- Ensure titles and descriptions are aligned in meaning.

### 2.4 Assets

If the curriculum uses images:

- Store assets alongside the JSON in the curriculum directory.
- Reference with relative Markdown paths.

### 2.5 Source And Resource Links

Use one consistent goal-level link model:

- `sourceRef` for the canonical provenance/source-of-truth reference
- `resourceLinks` for ordered helpful learning resources

Authoring guidance:

- put broad course pages, book references, and module overviews on root or cluster nodes
- put deep, goal-specific concept/practice/assessment links on atomic nodes
- use `resourceLinks` exclusively for goal-level learning links

---

## Step 3: Add `contains` relations

Goal: define the hierarchy (cluster -> subgoal).

Guidelines:

- `contains` should form a DAG (no cycles).
- Keep the hierarchy shallow and meaningful.

---

## Step 4: Add `requires` relations

Goal: model prerequisites as precise, readable didactic routes.

Rules:

- Prefer **atomic-to-atomic** prerequisites for the canonical didactic sequencing layer.
- Use cluster-level `requires` only temporarily during early modeling, or when the prerequisite claim truly applies to all relevant descendants.
- If higher-level dependency views are useful for navigation or reporting, derive them from atomic descendant dependencies rather than authoring them as the primary truth.
- Where the landscape is learner-facing, check that atomic goals participate in teachable routes from one or more motivation anchors to one or more terminal autonomy goals.
- In multi-phase school landscapes, close those routes with **local phase exercise goals** first; do not let ordinary phase goals point only toward a distant global Abitur branch.
- If the landscape has cross-phase process competencies, consider a dedicated terminal autonomy branch for them as well (for example `Übungen Prozesskompetenzen`).
- Avoid transitive redundancy.

Migration note:

- The current runtime/validator still supports inherited `requires` from cluster ancestors.
- Treat that as a compatibility mechanism, not as the preferred end state for mature landscapes.

References:

- `../concept/skill-graph/graph-definition.md`
- `../qa-ci/graph-validation-rules.md`

### Reference implementations

Two retained Hessen source snapshots provide concrete authoring benchmarks for this target state. They are retained authoring evidence under `curricula/DE/Gymnasium/input/HE/`, not runtime landscapes; the live landscapes are the canonical subject files under `curricula/DE/Gymnasium/canonical/`.

- **Physics upper secondary**
  - file: `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_PHYSIK.de.json.snapshot`
  - benchmark pattern:
    - mature atomic `requires` authoring
    - local autonomy branches `Übungen E-Phase`, `Übungen Q1`, `Übungen Q2`, `Übungen Q3`, `Übungen Q4`
    - ordinary klausur-style terminal goals kept separate from the global Abi branch

- **Mathematics upper secondary**
  - file: `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot`
  - benchmark pattern:
    - mature atomic `requires` authoring across the ordinary curriculum phases
    - local autonomy branches `Übungen E-Phase`, `Übungen Q1`, `Übungen Q2`, `Übungen Q3`, `Übungen Q4`
    - additional cross-phase branch `Übungen Prozesskompetenzen`
    - ordinary klausur-style terminal goals kept separate from the two global Abi containers

These files should be treated as practical reference implementations when authoring new phase-based school landscapes.

---

## Step 5: Validation

Run the validator:

```
cd app
npm run validate:graph
```

Fix any errors (missing IDs, invalid phases, cycles, manifest mismatches).

For manual review workflows beyond structural validation, see:

- `../qa-ci/atomic-review-process.md`
- `../qa-ci/requires-review-process.md`

---

## Step 6: Register the curriculum

If this is a root curriculum:

- Add it to `curricula/curriculum_manifest.json`.

If this is a sub-curriculum:

- Ensure the parent landscape contains the root node ID.

---

## Step 7: QA checklist

- Titles and descriptions are clear and measurable.
- Atomic goals are testable in 1-3 tasks.
- Atomic `requires` are authored canonically on atomic goals wherever practical.
- Cluster-level `requires` are only used intentionally, not as the default modeling shortcut.
- Atomic goals have passed an atomic review pass where the landscape is mature enough for that investment.
- Atomic goals have passed a requires review pass where the landscape is mature enough for that investment.
- `contains` and `requires` are acyclic.
- Learner-facing atomic goals lie on at least one route from a motivation anchor to a terminal autonomy goal.
- In phase-based school curricula, each ordinary phase has its own local terminal autonomy branch instead of relying only on a global final-exam branch.
- IDs are stable and consistent.
- Metadata (phase/area/level/core/weight) is consistent.
- Localization is aligned (if applicable).
