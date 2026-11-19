## Node types (learning modes) {#sec:node-types}

Pedagogical goal kinds are orthogonal to the structural atomic/cluster split. See [Node Types](repo:docs/concept/skill-graph/node-types.md).

### Understanding {unnumbered=true}

*DE: Verstehen*

The default type: conceptual or procedural competence, coached and practised in dialogue. A goal with no special exam or memorization fields is an Understanding node; orientation goals are marked explicitly and do not test subject knowledge.

### Memorize {unnumbered=true}

*DE: Sich merken*

A spaced-repetition goal for facts, vocabulary, notation, or selected formulas. Controlled unaided recall (*Verified Recall*) across **all required cards** of a fully resolved deck establishes permanent goal mastery; subsequent SRS review due dates do not withdraw established mastery.

### Exam {unnumbered=true}

*DE: Selbstständig Probleme lösen, Prüfungsknoten*

A goal carrying `examData`: an independent assessment or practice task with a model solution and scoring scheme. In the target model no `requires` edge points to an `Exam` goal (assessments are endpoints of prerequisite paths). The applicable recognition concept binds independent application of own content goals to R1–R5 and reviewed `coverageReviews` of declared **units with assessments**. Standalone practice tasks and Abitur exams remain selectable as usual but do not establish implicit recognition on their own. The proposal of 19 November would judge unit completion separately; it expands no existing exam's meaning.

### `examData` and scoring {unnumbered=true}

*DE: Prüfungsdaten, Bewertung* — see [Node Types](repo:docs/concept/skill-graph/node-types.md)

Task content, solution content, and a scoring object with `maxPoints`, `passingPoints`, and per-step points: $\mathrm{total} = \min(\sum \text{step points}, \mathrm{maxPoints})$, passed iff $\mathrm{total} \ge \mathrm{passingPoints}$. Only passing writes mastery (`1.0`); an unsuccessful attempt is explained in dialogue without altering stored learner state, so the task can be retried.

### Exam Mode {unnumbered=true}

*DE: Prüfungsmodus* — see [Node Types](repo:docs/concept/skill-graph/node-types.md)

The runtime mode in which the AI coach acts as a strict, neutral exam supervisor: the task is delivered verbatim, no hints are given during work, one complete submission is graded step by step, and only afterwards does the coaching role resume.

### SRS and SM-2 {unnumbered=true}

*DE: Kartei, Wiederholungsplanung* — see [Node Types](repo:docs/concept/skill-graph/node-types.md)

Spaced-repetition scheduling following the SuperMemo-2 algorithm. Each card stores `interval`, `repetition`, easiness factor `ef`, and `nextReview`. A card is **due** when `nextReview <= now` or when it has no state yet.

### Verified recall {unnumbered=true}

*DE: geprüfter Abruf* — see [Node Types](repo:docs/concept/skill-graph/node-types.md)

The hard recall gate on memorization cards: the coach shows only the prompt, the learner answers unaided, and only afterwards does the coach retrieve the expected answer and persist `passed` or `failed`. Ordinary SRS practice in the Cockpit never substitutes for this check.

---

## Structure layers and projection {#sec:structure-layers}

### Layer model {unnumbered=true}

*DE: Schichtenmodell* — see [General Goal System and Migration](repo:docs/concept/skill-graph/general-goal-system-and-migration.md)

SkillPilot separates five layers that older legacy graphs sometimes mixed:

:::table{cols="3.6cm,5.2cm,X"}
| Layer | Holds | Example |
| --- | --- | --- |
| Goal layer | assessable competences and content clusters | "lineare Funktionen verknüpfen" |
| Unit & program layer | canonical unit clusters, shared Land plan units, and `programUnits` | `SekI`/`SekII`, `Jahrgang 8`, `Q1`, subject unit |
| Placement layer | Land-plan bindings (*carried in* vs. *placed in*) and `goalPlacements` | "carried in Q1, prepared at earliest need" |
| Competency-axis layer | taxonomy entries | `K1 Mathematisch argumentieren` |
| Projection & map layer | goal tree and learner map from Land plans / `.view.json` | `DE-BY / Gymnasium / G9 / SekII / Mathematik / LK` |
:::

### Program unit {unnumbered=true}

*DE: Programmeinheit* — see [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

An explicit organizational structural container (year, semester, module, phase, track, exam section) forming an ordered tree via `parentUnitId` and `order`. A content goal must never be reused as a stand-in for a program unit. Under compatibility contract 1.2, a `programUnits` entry of kind `learningUnit` temporarily declares a learning unit before subject units move to declared clusters after `F8`.

### Learning unit {unnumbered=true}

*DE: Lerneinheit* — see [Learning Units](repo:docs/concept/skill-graph/learning-units.md) and [Unit Ordering (§11.5)](repo:docs/concept/skill-graph/learning-unit-progression.md)

A recursively composed educational whole in the three-tier progression **Cluster $\to$ Unit $\to$ Unit with assessments**. In the binding target model, a subject unit is declared as a canonical cluster with a learning promise, `revision`, sibling `after` order, and optional `coverageReviews`; own goals (`Own(U)`) and direct child units derive from `contains`, and leaf subject units stay whole inside one plan unit across all 16 Bundesländer. Until migration (`F8`–`F11`), the three existing canonical units use compatibility contract 1.2 (`programUnits` of kind `learningUnit` with `own` placements and `parentUnitId`; see [field reference](repo:docs/dev/landscape-json-field-reference.md)).

Every unit obeys the ordering rules **E1–E4** without imposing technical access locks via `after`. Completion derives from child units and own obligations without a stored unit-mastery value. Adopted individual recognition under R1–R5 and its incomplete implementation remain separate from the representative unit judgement in the proposal of 19 November. The proposal neither declares all constituent atoms mastered nor waives a required child exam ([Unit evidence and applicable recognition contract](repo:docs/concept/skill-graph/assessment-gated-completion.md)).

### Goal placement {unnumbered=true}

*DE: Zielplatzierung* — see [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

An entry attaching an unchanged goal to a program unit under a reviewed context (`primary`, `secondary`, `assessed`). A placement never re-parents the content `contains` tree and never creates a duplicate occurrence in the default tree. Under compatibility contract 1.2, relation `own` temporarily records direct learning-unit ownership without attaching anything to the program tree.

### Competency axis {unnumbered=true}

*DE: Kompetenzachse* — see [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

An orthogonal taxonomy view built from `competencyCatalog` plus `competencyRefs`, for example process competencies `K1`–`K6`. Broad capability families are taxonomy entries, neither goals nor program units.

### Composition view {unnumbered=true}

*DE: Composition View, Sichtkomposition* — see [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

An explicit, reviewed definition of the learner-facing upper tree for one resolved scope: structure nodes, labels, ordering, and references to canonical subtree roots. It contains neither newly authored atomic goals nor new `requires` edges and—where present—is the authoritative source for that scope's default tree.

### Canonical subtree reference {unnumbered=true}

*DE: kanonische Teilbaumreferenz* — see [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

A pointer from a composition view to a reviewed cluster root of the canonical graph; the subtree contents stay in the canonical model. Within one compiled view tree, expanded references must be pairwise disjoint.

### Projection role {unnumbered=true}

*DE: Projektionsrolle* — see [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Authored per composition-view reference as `projectionRole` (defaulting to `target`):

- `target` — a selectable learning target in this scope; counts toward navigation, frontier, progress, and completion.
- `prerequisiteOnly` — a supporting goal whose global mastery may unlock or block targets but which is not itself selectable here.

Roles are never inferred implicitly from `requires`, `phase`, year, or stage. On overlap, specificity decides (direct `goalEntry` beats subtree role, deeper subtree beats broader subtree; only at equal specificity does `target` win).

### Applicability {unnumbered=true}

*DE: Gültigkeit, Anwendbarkeit* — see [Node Types](repo:docs/concept/skill-graph/node-types.md) and [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Optional compiled goal metadata mapping filter dimensions (`jurisdiction`, `schoolForm`, `stage`, `durationModel`, `courseProfile`, …) to allowed values. An omitted dimension is unrestricted. Applicability is not a node type and never creates parent edges; it only filters visibility in scoped views.

### Applicability override {unnumbered=true}

*DE: Gültigkeits-Override* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Audit metadata under `extendedData.applicabilityOverrides` recording which active applicability values were added via an explicit, justified exception rather than ordinary source alignment. At runtime, compiled `applicability` remains authoritative.

### Entry scope {unnumbered=true}

*DE: Einstiegskontext* — see [General Goal System and Migration](repo:docs/concept/skill-graph/general-goal-system-and-migration.md)

The small set of contextual choices made before navigating content: school form, stage, jurisdiction, duration model, course profile, current year or phase. Entry scope acts as a query and navigation filter and never forces goal duplication.

### Resolved scope {unnumbered=true}

*DE: aufgelöster Kontext* — see [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

A fully determined combination such as `DE-HE / Gymnasium / G9 / SekII / Mathematik / LK`. Default trees, single-occurrence validity, and coverage checks are always evaluated relative to one resolved scope.

### Default tree {unnumbered=true}

*DE: Standardbaum* — see [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

The single tree a learner sees for a resolved scope. Every visible edge comes from exactly one explicit source (`contains`, `parentUnitId`, `goalPlacements`, or `competencyRefs`), never from title or `phase` heuristics. **Single-occurrence rule:** within one resolved scope each visible goal appears at most once and under at most one visible parent.

### Content tree, program tree, competency view {unnumbered=true}

*DE: Inhaltsbaum, Programmbaum, Kompetenzsicht* — see [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

The three classic view families, each with one structural source of truth (`contains` for content, `programUnits` + `goalPlacements` for program, `competencyCatalog` + `competencyRefs` for competency axes), complemented by the scope-specific goal tree and learner map.

### Goal tree and learner map {unnumbered=true}

*DE: Lernzielbaum und Lernkarte* — see [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Two coordinated presentations of the same resolved projection: the **goal tree** shows all structure nodes, units, non-unit clusters, and atomic goals. The **learner map** contracts all non-unit clusters along `contains`, displays units and atomic goals only (with subjects acting as filters), and draws arrows strictly between direct children of the opened unit from sibling `after` and crossing atomic `requires` without hiding backflows.

### `phase` {unnumbered=true}

*DE: Phase* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

Compatibility metadata (`E`, `Q1`–`Q4`, …) used for badges, filtering, or provisional default assignments (`canonicalDefault`) while Land source evidence is absent. `phase` is explicitly **not** canonical graph semantics, substitutes for no source proof, and never implies parentage.

### `ALL` {unnumbered=true}

*DE: `ALL`-Platzhalter* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

A query-only sentinel meaning "do not restrict this dimension" during scope resolution. `ALL` must never be serialized as an applicability or placement value.
