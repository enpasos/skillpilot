## Skill Graph Production Pipeline {#sec:pp-skill-graph}

This chapter defines the general, repeatable, auditable blueprint for turning any authoritative or institutional curriculum source into a clean `SkillLandscape` JSON graph under `curricula/<...>/json/<file>.json` (or `curricula/DE/Gymnasium/canonical/`; for exam authoring, see @ref{sec:pp-exam-example}).

### Inputs and Steps 0–2: Extraction, Outline, and JSON Generation {#sec:pp-sg-outline-json}

Inputs comprise (1) a normalized plain-text source extract capturing topics, outcomes, prerequisites, grading scope, and source URL/locator, (2) a human-curated outline separating root, clusters, and measurable atomic goals, plus optional (3) sibling landscapes for consistent naming and ID patterns:

- **Step 0 (Extract source):** Normalize the official curriculum into clean plain text (no HTML) with an explicit URL/page reference.
- **Step 1 (Structured outline):** Create a root node, group phases/topic fields into clusters, and cut competencies into measurable **atomic goals** (1–3 tasks, phrased as "The learner can ..."). Include **motivation anchors** and **phase-local autonomy clusters** of ordinary exam character (`Übungen E-Phase`, `Übungen Q1`–`Q4`, plus optional `Übungen Prozesskompetenzen`), keeping global Abitur/final-exam branches separate as an additional assessment layer.
- **Step 2 (Encode JSON):**
  - **Stable IDs:** Project-namespaced UUID v5 or deterministic mapping from `(landscapeId, shortKey)` (`shortKey` is optional, unique within `landscapeId`; repeating the same `(goalId, shortKey)` pair across locale files is valid, reusing one `shortKey` for distinct `goalId`s is forbidden).
  - **Required fields:** Top-level `landscapeId`, `title`, `description`, `locale`, `subject`, `goals`; goal-level `id`, `title`, `description`, `weight`, `requires`, `contains`, `dimensionTags` (at least `phase`; prefer `area`, `topicCode`, `demandLevel`, `processCompetencies`, `guidingIdeas`; optional `tags`, `core`, `examples`, `sourceRef`, `resourceLinks`).
  - **Localization, assets & links:** Multilingual landscapes keep separate meaning-aligned locale JSONs; co-located images use relative Markdown paths. `sourceRef` holds canonical provenance, while `resourceLinks` holds ordered learning links (broad overviews on root/clusters, goal-specific practice/visualization links on atomic nodes).

### Steps 3–7: Relations, Reference Implementations, Validation, and Registration {#sec:pp-sg-relations-qa}

- **Step 3 (`contains` hierarchy):** Form an acyclic DAG (cluster $\to$ subgoals) with shallow, meaningful grouping.
- **Step 4 (`requires` sequencing):** Author **atomic-to-atomic** prerequisites without transitive redundancy ([Graph Definition](repo:docs/concept/skill-graph/graph-definition.md), [Graph Validation Rules](repo:docs/qa-ci/graph-validation-rules.md)); inherited cluster `requires` remain a transition mechanism only. Every learner-facing atomic goal should lie on at least one teachable route from a motivation anchor to a phase-local autonomy goal. Two retained Hessen snapshots under `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/` serve as practical authoring benchmarks: `DE_HES_S_GYM_2_PHYSIK.de.json.snapshot` and `DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot` (local `Übungen E-Phase`/`Q1`–`Q4` plus `Übungen Prozesskompetenzen`, cleanly separated from global Abitur containers; live runtime landscapes reside under `curricula/DE/Gymnasium/canonical/`).
- **Step 5 (Validation & manual reviews):**

```bash
cd app
npm run validate:graph
```

Complement structural checks with manual atomicity ([Atomic Review](repo:docs/qa-ci/atomic-review-process.md)) and prerequisite ([Requires Review](repo:docs/qa-ci/requires-review-process.md)) passes.

- **Step 6 (Register curriculum):** Add root curricula to `curricula/curriculum_manifest.json` or attach sub-curricula via parent `contains`.
- **Step 7 (QA checklist):** Clear titles/descriptions testable in 1–3 tasks, canonical atomic `requires`, acyclic `contains`/`requires`, closed motivation-to-local-autonomy routes per phase, stable IDs, consistent metadata (`phase`, `area`, `level`, `core`, `weight`), and aligned localization.
