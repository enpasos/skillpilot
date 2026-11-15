## General Goal System and Incremental Migration {#sec:sga-goal-system}

SkillPilot's long-term goal model follows two governing principles: **"As much semantics as necessary, as little ontology as possible"** and **"Goals are stable. Structure is contextual."** The formal mathematical graph core is specified in [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md); projection rules live in @ref{sec:sga-view-projection}, and runtime fallback mechanics live in [Minimal Schema & Runtime Fallback](repo:docs/dev/skill-graph-minimal-schema-runtime-fallback-and-math-pilot.md).

### Four Semantic Layers Plus Projection and Map Views {#sec:sga-gs-layers}

Rather than mixing subject competencies, school-year containers, and process taxonomies into one undifferentiated hierarchy, the target architecture separates four semantic layers plus one learner-facing projection and map layer:

| Layer | JSON / Artifact Carrier | Role and Invariants |
| --- | --- | --- |
| **Goal layer** | `goals[]`, `contains`, `requires` | Durable assessable atomic goals and subject-matter clusters; only atoms carry mastery. Carries atomic prerequisite paths ($R_{\mathrm{at}} \subseteq A \times A$), and canonical IDs. In the target model a subject learning unit is declared in the placement layer by referring to a canonical cluster, and its own assessments reside inside that cluster ([Graph Definition §11.2](repo:docs/concept/skill-graph/learning-units.md#sec-unit-representation)). |
| **Unit & program layer** | Declared unit clusters (`after`, `coverageReviews`, `revision`), Land plan units (`SekI`, `SekII`, years, `E`/`Q1`–`Q4`), and `programUnits[]` | Structures the learning path via recursive subject learning units (**Cluster $\to$ Unit $\to$ Unit with assessments**) and shared per-Land/duration **plan units** ordered by sibling `after`; `programUnits` carries calendar-style program containers and temporarily `kind: "learningUnit"` under compatibility contract 1.2. Never mastered directly. |
| **Placement layer** | Land-plan bindings (*carried in* vs. *placed in*) plus `goalPlacements[]` (`goalId`, `unitId`, `relation`, `context`) | Separates evidenced official source assignment (*carried in*) from didactic learning placement (*placed in*, including justified earlier preparation and derived earliest need in the closed scope $L$); `goalPlacements` attaches goals (`primary`, `secondary`, `assessed`) to program containers and temporarily carries `own` under contract 1.2. |
| **Competency-axis layer** | `competencyCatalog[]` (`id`, `label`, `dimension`), `competencyRefs[]` | Orthogonal capability taxonomies (for example `K1`–`K6` process competencies); never main content parents unless assessable. |
| **Projection & map layer** | Shared Land plans, `*.view.json` (`structure`, `canonicalSubtree`, `goalEntry`) | Drives, without duplicating goal payloads, both the **goal tree** (all clusters, units, and goals) and the **learner map** (units and atomic goals only by contracting non-unit clusters along `contains`, with subjects acting as filters). |
{cols="22%,32%,46%"}

Interpretation invariants:

- Year, semester, module, and phase containers are **not** the durable semantic backbone of the canonical subject graph; `phase` is retained as compatibility/badge metadata and justifies at most a labeled provisional `canonicalDefault` assignment, never an official Land source claim.
- Broad capability families (`K1`–`K6`) are taxonomy axes, not program units; only concrete, assessable process skills become actual `LearningGoal` nodes.
- Initial learner narrowing (jurisdiction, school form, stage, duration model, course profile) acts as **entry scope** over shared Land plans, placements, composition views, and compiled `applicability` ([Levels of Personalization](repo:docs/concept/levels-of-personalization.md)), never as duplicated canonical goals.

### Recursive Learning Units and Incremental Migration {#sec:sga-gs-migration}

Recursive educational units (Graph Definition §11, [Learning Units](repo:docs/concept/skill-graph/learning-units.md); §12, [Optional Planning](repo:docs/concept/skill-graph/planning-and-budget.en.md)) compose over the same stable canonical goals:

1. **Single direct course owner & global effect:** Within one resolved course, every planned atomic goal has **exactly one directly owning unit** (`Own(U)` derives from the descendants of $U$ minus child units in the cluster-unit target model); ancestor units aggregate child targets without duplicating ownership, and competence mastered or recognized in a child unit is **globally effective** immediately.
2. **Three tiers — Cluster, Unit, Unit with assessments:** Every unit (subject unit and plan unit alike) obeys the four ordering rules **E1–E4** ([Unit Progression](repo:docs/concept/skill-graph/learning-unit-progression.md)). By contrast, only a **unit with assessments** (with own assessments and valid complete `coverageReviews`) forms a local recognition contract under **R1–R5** ([Graph Definition §13.3](repo:docs/concept/skill-graph/assessment-gated-completion.md#sec-why-graph-not-enough)); stages, years, course semesters, and assessment-free subject units order without recognizing anything implicitly.
3. **Sibling `after` without access locks:** A subject- or curriculum-justified `after` declares the intended order of whole sibling units for the learner map and target learning mode **"Unit by Unit"** ([Graph Definition §11.5](repo:docs/concept/skill-graph/learning-unit-progression.md#sec-unit-by-unit)), without adding atomic demand, mutating mastery, or locking the frontier; no `requires` edge points to an `Exam` goal (assessments are endpoints of prerequisite paths).
4. **Protected evidence & cross-Land leaf wholeness:** Passing a parent integration exam never marks protected child exams or required memorization decks as passed, and canonical leaf subject units stay whole (unsplit) within a single plan unit across all 16 Bundesländer.

> [!NOTE]
> **Implementation boundary:** The three learning units authored so far in Mathematics and Physics still use compatibility contract **1.2** (`programUnits` of kind `learningUnit` + `own` placements, verified by `validate:learning-units`). The [stage-plan foundation (`v1.3`)](repo:contracts/curriculum-package/v1.3/README.md) provides shared Land/duration authorities (`SekI`/`SekII`, years, `E`/`Q1`–`Q4`), derived `.view.json` projections, and backflow reporting, while `#153` ships the read-only learner-map preview; zero real Land plans are activated yet, and migrating to declared cluster units, moving own assessments into unit clusters, runtime implicit mastery ($M_{\mathrm{eff}}$), and runtime "Unit by Unit" selection follow in steps `F1`–`F13`.
