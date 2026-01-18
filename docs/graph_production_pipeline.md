# Curriculum Graph

This document is a general, repeatable blueprint for producing a curriculum graph JSON from any source curriculum.
It is written to be auditable and reusable across domains, institutions, and languages.

---

## Scope

* **Input:** Any authoritative curriculum source (PDF, handbook, spreadsheet, API, internal docs).
* **Output:** A clean `LearningLandscape` JSON under `curricula/<...>/json/<file>.json`.
* **Goal:** A DAG of goals with consistent metadata, stable IDs, and minimal prerequisites.

---

## Inputs (Source of Truth)

1) **Raw source extract (phase 0/1)**
   * Plain text or structured notes.
   * Captures: topic list, outcomes, prerequisites, grading scope, and metadata.

2) **Human skill breakdown (phase 2)**
   * A structured outline of nodes:
     * Root (curriculum or module)
     * Cluster nodes (themes, phases, topics)
     * Atomic goals (measurable skills)

3) **Existing landscape context (optional)**
   * Related landscapes for consistency.
   * Target naming conventions and ID patterns.

---

## Step 0: Extract the source

Goal: normalize the official curriculum into a clean, readable input.

Guidelines:
* Use **plain text** (no HTML).
* Capture titles, outcomes, prerequisites, and scope.
* Keep a clear link to the original source (URL or reference).

---

## Step 1: Create a structured outline

Goal: turn the source into a hierarchical graph outline.

Rules of thumb:
* Start with a **root node** (the full curriculum or module).
* Create **cluster nodes** for phases or topic fields.
* Create **atomic nodes** for measurable goals (1-3 tasks per goal).
* Keep titles short and descriptions assessable ("The learner can ...").

---

## Step 2: Generate JSON

Goal: encode the outline as `LearningLandscape` JSON.

### 2.1 Stable identifiers
Use stable IDs so regeneration does not break references.

Options:
* UUID v5 with a project namespace.
* A deterministic mapping from `(landscapeId, shortKey)`.

### 2.2 Required fields (minimum)

Top-level:
* `landscapeId`, `title`, `description`, `locale`, `subject`, `goals`

Goal-level:
* `id`, `shortKey`, `title`, `description`
* `phase`, `area`, `level`, `core`, `weight`
* `requires`, `contains`, `tags`

### 2.3 Localization

If multilingual:
* Keep separate locale JSONs per landscape.
* Ensure titles and descriptions are aligned in meaning.

### 2.4 Assets

If the curriculum uses images:
* Store assets alongside the JSON in the curriculum directory.
* Reference with relative Markdown paths.

---

## Step 3: Add `contains` relations

Goal: define the hierarchy (cluster -> subgoal).

Guidelines:
* `contains` should form a DAG (no cycles).
* Keep the hierarchy shallow and meaningful.

---

## Step 4: Add `requires` relations

Goal: model prerequisites with minimal and readable edges.

Rules:
* Prefer **cluster-level** prerequisites when they apply broadly.
* Use **inherited requires** rather than repeating edges on every leaf.
* Avoid transitive redundancy.

Reference: `docs/requires_relation_checks.md`

---

## Step 5: Validation

Run the validator:

```
cd app
npm run validate:graph
```

Fix any errors (missing IDs, invalid phases, cycles, manifest mismatches).

---

## Step 6: Register the curriculum

If this is a root curriculum:
* Add it to `curricula/curriculum_manifest.json`.

If this is a sub-curriculum:
* Ensure the parent landscape contains the root node ID.

---

## Step 7: QA checklist

* Titles and descriptions are clear and measurable.
* Atomic goals are testable in 1-3 tasks.
* `contains` and `requires` are acyclic.
* IDs are stable and consistent.
* Metadata (phase/area/level/core/weight) is consistent.
* Localization is aligned (if applicable).
