## Curricula, skill graphs, and provenance {#sec:curricula-and-provenance}

### Curriculum {unnumbered=true}

*DE: Curriculum, Lehrplan* — see [Whitepaper](repo:docs/whitepaper/whitepaper.en.md)

The external, authority-defined body of rules SkillPilot docks onto: a state syllabus, a module handbook, or a standard such as CEFR. The curriculum remains the **normative source**; SkillPilot does not create standards, it makes existing ones operational.

Not the same as the skill graph derived from it. In the quality dashboard, "Curriculum" is used more narrowly for one canonical skill landscape file.

### Skill graph {unnumbered=true}

*DE: Skill-Graph* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

The versioned, machine-readable **operative model** derived from a curriculum: goals connected by `contains` and `requires`, together with their semantics, validity conditions, and frontier logic. The skill graph is what SkillPilot builds, validates, and navigates; the curriculum stays the normative source above it.

### Skill landscape {unnumbered=true}

*DE: Skill-Landschaft* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

One delimited, published instance of a skill graph: a single subject-and-school-type unit identified by a `landscapeId`, owned by champions, rated with a maturity level, and shipped as a release package. A skill landscape may be serialized into several locale files that share its ID.

Use *skill graph* when the point is the model, *skill landscape* when the point is **which** one.

### Canonical landscape {unnumbered=true}

*DE: kanonische Landschaft* — see [Canonical Gymnasium Rollout Policy](repo:docs/concept/skill-graph/canonical-gymnasium-rollout.md)

A skill landscape maintained once for a whole school type and reused by all jurisdictions, instead of one separately authored landscape per state. Jurisdiction-specific differences are expressed through applicability and composition views, not by copying goals.

### Root curriculum and curriculum manifest {unnumbered=true}

*DE: Wurzelcurriculum, Curriculum-Manifest* — see [Levels of Personalization](repo:docs/concept/levels-of-personalization.md)

A root curriculum is a skill landscape that is selectable in the UI and valid for champion registration. The set of root curricula is declared explicitly in [curricula/curriculum_manifest.json](repo:curricula/curriculum_manifest.json); CI fails if the manifest and the computed set of roots disagree.

### Source snapshot {unnumbered=true}

*DE: Quellen-Snapshot* — see [Curriculum Quality](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md)

A captured, parseable extract of an official curriculum document, kept in the repository together with an official HTTP(S) link to the original. Coverage claims are only ever proven against the snapshots present in the repository.

### Source goal and source registry {unnumbered=true}

*DE: Originalziel, Source-Ziel; Source-Registry* — see [Curriculum Quality](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md)

A source goal is a learning objective as written in the original curriculum. The source registry records which source goals exist and how their **atomic source closure** maps onto canonical goals. Coverage is checked in both directions: every visible atomic goal needs source evidence, and every registered source goal must map completely into the view.

### `sourceRef` vs `resourceLinks` {unnumbered=true}

*DE: Herkunftsnachweis vs. Lernressourcen* — see [Source And Resource Links](repo:docs/concept/skill-graph/source-and-resource-links.md)

`sourceRef`, mappings, and provenance answer "Why does this goal exist?" Official curriculum references remain evidence, not optional study material.

The [Content Integration Architecture](repo:docs/concept/skill-graph/content-integration.md) puts optional external learning materials in separate packages that reference goal IDs; the learner selects packages independently of the curriculum. `resourceLinks` remains the compatibility field for existing resources and the separately governed SkillPilot-owned goal visualizations. Direct external didactic links in canonical goals are migration debt, not the target authoring model.

Learning material must never be smuggled in as provenance, and provenance is not a study link.

### Runtime package and ontology package {unnumbered=true}

*DE: Runtime-Paket, Ontologie-Paket* — see [Dual Curriculum Package Releases](repo:docs/concept/skill-graph/dual-curriculum-package-releases.md)

The two equivalent release artifacts of one curriculum release: a JSON runtime package consumed by the application, and an FWU-style ontology package for semantic interchange. Both are produced from the same reviewed release unit.

---

## Inside the skill graph {#sec:inside-skill-graph}

### Goal {unnumbered=true}

*DE: Lernziel* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

A node of the skill graph: a learnable, assessable competence, usually phrased as "Die lernende Person kann …". Every goal has a stable UUID `id`, a `title`, and a positive `weight`.

A year, semester, module, phase, or track is **not** a goal.

### Atomic goal {unnumbered=true}

*DE: atomares Lernziel* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

A goal with no `contains` children. Atomic goals are the assessable units: mastery is recorded on them, the frontier is computed over them, and in the target state all authored `requires` edges connect atomic goals.

The classification is derived from the graph structure, not authored. Stored classification metadata must agree with the derived one.

### Cluster goal {unnumbered=true}

*DE: Cluster-Ziel* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

A goal with at least one `contains` child. Clusters serve navigation, filtering, and aggregated progress. Their satisfaction is derived from their atomic descendants rather than recorded directly.

### Atomic basis {unnumbered=true}

*DE: atomare Basis* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

Written $\mathrm{Atoms}(g)$: the goal itself if it is atomic, otherwise its atomic `contains` descendants. It is the set whose mastery witnesses satisfaction of a cluster.

### `contains` {unnumbered=true}

*DE: enthält* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

The authored hierarchy relation $C$: $(p, c)$ means parent $p$ directly contains child $c$ in **content** terms. Its arrow points from parent to child. `contains` must be acyclic but allows multiple parents (polyhierarchy).

Ancestor/descendant relationships are derived through paths of one or more `contains` edges. `contains` is not a prerequisite and not a program placement.

### `requires` {unnumbered=true}

*DE: setzt voraus* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

The authored prerequisite relation $R$: $(g, p)$ means goal $g$ directly requires prerequisite $p$. Its arrow points from the dependent goal to its prerequisite; $p$ must be satisfied before $g$ is approached. It must be acyclic. Under the binding target state, all authored `requires` edges connect **atomic** goals ($R \subseteq A \times A$) and no `requires` edge points to an assessment goal; existing prerequisites on clusters are evaluated via `contains` inheritance and atomic expansion during migration.

Both `contains` and `requires` record direct relationships; derived relationships are computed rather than modeled as extra relation types.

### Inherited prerequisites {unnumbered=true}

*DE: vererbte Voraussetzungen* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

Additional prerequisites derived from the `requires` of a goal's `contains` ancestors, excluding pairs already authored on the goal itself: $R_{\mathrm{inherited}} = R_{\mathrm{eff}} \setminus R$. With multiple parents, all ancestor paths contribute. Inheritance through containment is distinct from following a chain of prerequisites.

### Effective prerequisites {unnumbered=true}

*DE: effektive Voraussetzungen* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

The derived prerequisite relation $R_{\mathrm{eff}} = R \cup R_{\mathrm{inherited}}$, combining a goal's own `requires` with prerequisites inherited from its `contains` ancestors and expanded onto atomic basis goals ($R_{\mathrm{at}}$). In a fully atomic-authored prerequisite graph, authored and effective atomic prerequisites coincide.

### Prerequisite reachability {unnumbered=true}

*DE: Erreichbarkeit von Voraussetzungen* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

Goals connected by one or more edges of the specified prerequisite relation, written $R^+$ or $R_{\mathrm{at}}^+$. This transitive closure includes single edges and longer chains. A learning-flow view uses the inverse direction and labels it explicitly.

### Weight {unnumbered=true}

*DE: Gewicht* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md) and [AGENTS.md](repo:AGENTS.md)

A strictly positive number expressing a goal's share in progress. Convention in the canonical landscapes: atomic goals carry `weight = 1`, clusters carry the number of their *unique* atomic descendants, so a goal reachable through several parents is counted once.

### Goal ID and `shortKey` {unnumbered=true}

*DE: Lernziel-ID, Kurzschlüssel* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

`id` is the canonical UUID identity of a goal; it may be shown to learners and coaches and is not an access credential. `shortKey` is an optional stable ASCII identifier for exports, APIs, and cross-layer references; it is unique per logical landscape and never replaces `id`.

### Graph validity {unnumbered=true}

*DE: Graphgültigkeit* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

A graph is valid iff IDs are unique, `contains`, `requires`, and the effective atomic prerequisite relation are acyclic, and both minimality rules hold:

- **Local minimality:** a prerequisite already inherited from a `contains` ancestor must not be restated on the child node.
- **Transitive minimality:** an edge must not be present if the same prerequisite already follows from other effective prerequisite paths.

### Motivation anchor {unnumbered=true}

*DE: Motivationsanker* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

An atomic orientation goal that opens a didactic route by answering "why this subject or topic?", for example `Warum Physik? – Weltverständnis & Zukunft`. Route checks measure connectivity back to such an anchor.

### Terminal autonomy goal {unnumbered=true}

*DE: terminales Autonomieziel* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

An atomic goal at which the learner performs independently, typically an exam-mode exercise goal such as the atomic tasks under `Übungen Q2`. It closes a didactic route.

### Route coverage {unnumbered=true}

*DE: Routenabdeckung* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

The property that every route-relevant atomic goal lies on at least one prerequisite path from a motivation anchor to a terminal autonomy goal. The intended learning direction runs from orientation through understanding (and parallel memorization where needed) to independent application.

### Plan unit {unnumbered=true}

*DE: Planeinheit* — see [Learning Units](repo:docs/concept/skill-graph/learning-units.md) and [View Projection](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Declared unit in the shared plan of one Land and duration model across selected subjects (`SekI`, `SekII` with `SekII after SekI`, nesting years and `E`/`Q1`–`Q4`); orders the learning path under E1–E4, creates no new competency, and recognizes nothing implicitly on its own.

### Subject unit {unnumbered=true}

*DE: Fachliche Einheit* — see [Learning Units](repo:docs/concept/skill-graph/learning-units.md)

Declared cluster in the canonical subject landscape with a learning promise and revision; applies across all Bundesländer (leaf subject units stay whole inside one plan unit across all 16 Länder). Under the applicable recognition concept, a **unit with assessments**, own exams and valid complete `coverageReviews` demonstrates independent application of its own content goals under R1–R5. The undecided proposal of 19 November distinguishes this from a representative judgement about the unit and separately justified planning release for whole atoms.

### `after` {unnumbered=true}

*DE: `after`* — see [Unit Ordering](repo:docs/concept/skill-graph/learning-unit-progression.md)

Declared order between sibling units of the same parent unit: the preceding unit is done in the intended learning flow before the next unit begins. `after` inherits order rather than demand, imposes no technical access lock, writes no mastery, and expands no knowledge context.

### Backflow {unnumbered=true}

*DE: Rückgriff* — see [Unit Ordering](repo:docs/concept/skill-graph/learning-unit-progression.md)

A goal in an earlier unit or plan unit requires, directly or transitively, a goal placed in a later one. That violates E2/E3 (including preparation); display, learner map, and focus must never hide backflows.

### Preparation {unnumbered=true}

*DE: Vorbereitung* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

A necessary atom outside a Land plan's carried seed targets receives a deterministic derived learning placement at **earliest actual need** inside the closed personal scope $L$. Justified earlier preparation of a carried target remains explicitly labeled (`reviewedPreparation`) without overwriting official source assignment.

### Additional demand {unnumbered=true}

*DE: Zusatzbedarf* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Necessary prerequisite atoms in $L$ outside the selected subject seed targets $S$. Only those genuinely needed atoms are added, independently of current mastery; displaying them by unit never pulls in unneeded siblings of an external unit.

### Carried in / placed in {unnumbered=true}

*DE: Geführt in / steht in* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

*Carried in* means officially evidenced curricular source assignment (`officialSource`); *placed in* means didactic learning placement inside a plan unit. Earlier preparation or a provisional canonical phase marker creates neither Land source evidence nor learner results.

### Default assignment {unnumbered=true}

*DE: Standardzuordnung* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Explicitly labeled provisional didactic assignment (`canonicalDefault`) derived from a canonical marker such as `dimensionTags.phase` while Land source evidence is absent. Replaces neither source evidence nor coverage checks and never overrides an authoritative view.

### Assessment gap {unnumbered=true}

*DE: Prüfungslücke* — see [Assessment evidence and recognition contract](repo:docs/concept/skill-graph/assessment-gated-completion.md)

Under the applicable recognition contract, an own content goal of a unit with assessments lacking suitable reviewed task and rubric coverage remains a failing finding (R1/R2). Repair supplies a sound assessment and independent review, never fictitious prerequisites or relaxed quality gates. The proposal of 19 November resolves no such finding and changes no gate status.
