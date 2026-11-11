## General Goal System and Incremental Migration {#sec:sga-goal-system}

SkillPilot's long-term goal model follows two governing principles: **"As much semantics as necessary, as little ontology as possible"** and **"Goals are stable. Structure is contextual."** The formal mathematical graph core is specified in [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md); projection rules live in @ref{sec:sga-view-projection}, and runtime fallback mechanics live in [Minimal Schema & Runtime Fallback](repo:docs/dev/skill-graph-minimal-schema-runtime-fallback-and-math-pilot.md).

### Four Semantic Layers Plus One Composition-View Layer {#sec:sga-gs-layers}

Rather than mixing subject competencies, school-year containers, and process taxonomies into one undifferentiated hierarchy, the target architecture separates four semantic layers plus one learner-facing projection layer:

| Layer | JSON / Artifact Carrier | Role and Invariants |
| --- | --- | --- |
| **Goal layer** | `goals[]`, `contains`, `requires` | Durable assessable atomic goals and subject-matter clusters; owns mastery, frontier eligibility, and canonical IDs. |
| **Program layer** | `programUnits[]` (`id`, `kind`, `label`, `order`, `parentUnitId`) | Contextual structural units such as year, semester, module, phase, track, or exam; never mastered directly. |
| **Placement layer** | `goalPlacements[]` (`goalId`, `unitId`, `relation`, `context`) | Attaches unchanged canonical goals (`primary`, `secondary`, `assessed`) to program units under explicit scope contexts. |
| **Competency-axis layer** | `competencyCatalog[]` (`id`, `label`, `dimension`), `competencyRefs[]` | Orthogonal capability taxonomies (for example `K1`–`K6` process competencies); never main content parents unless assessable. |
| **Composition-view layer** | `*.view.json` (`structure`, `canonicalSubtree`, `goalEntry`) | Scope-specific learner-facing upper trees referencing reviewed canonical subtrees without duplicating goal payloads. |
{cols="22%,32%,46%"}

Interpretation invariants:

- Year, semester, module, and phase containers are **not** the durable semantic backbone of the skill graph; `phase` is retained as compatibility/badge metadata rather than canonical parentage.
- Broad capability families (`K1`–`K6`) are taxonomy axes, not program units; only concrete, assessable process skills become actual `LearningGoal` nodes.
- Initial learner narrowing (jurisdiction, school form, stage, duration model, course profile) acts as **entry scope** over program units, placements, composition views, and compiled `applicability` ([Levels of Personalization](repo:docs/concept/levels-of-personalization.md)), never as duplicated canonical goals.

### Recursive Learning Units and Incremental Migration {#sec:sga-gs-migration}

Recursive educational units (Graph Definition §11, [Learning Units](repo:docs/concept/skill-graph/learning-units.md); §12, [Optional Planning](repo:docs/concept/skill-graph/planning-and-budget.en.md)) compose over the same stable canonical goals:

1. Within one resolved course, each planned atomic acquisition has **one directly owning unit**; ancestor units aggregate child targets without re-owning them.
2. Competence mastered or recognized in a child unit is **globally effective** immediately, even while a broader parent integration exam remains open; local recognition applies only to directly owned ordinary targets inside units that satisfy the validity rules R1–R5 of 11 November 2026 ([Graph Definition §13.3](repo:docs/concept/skill-graph/assessment-gated-completion.md#sec-why-graph-not-enough)).
3. Passing a parent unit's integration exam never marks protected child exams or memorization decks as passed; explicit whole-unit progression ([Unit Progression](repo:docs/concept/skill-graph/learning-unit-progression.md)) is validated separately from atomic `requires` acyclicity.

> [!NOTE]
> **Implementation boundary:** This chapter defines the target semantic split and incremental 6-phase migration path (additive optional schema fields $\to$ projection-first UI with `phase` fallback $\to$ pilot slice $\to$ subtree adoption $\to$ composition-view cutover $\to$ legacy retirement) without forcing a big-bang rewrite or claiming an already implemented `LearningUnit` runtime compiler.
