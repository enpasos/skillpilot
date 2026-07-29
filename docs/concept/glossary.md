# Glossary

This page defines the core terms SkillPilot coins and relies on. It is the shared vocabulary for curriculum authors, champions, developers, and AI adapters.

## How to read this page

- **Definitions are short on purpose.** Each entry states what the term means and, where it matters, what it is *not*. The linked document stays the normative source; this page never overrides it.
- **DE** gives the German term used in the app, in German documentation, and by the learning coach. Field names such as `contains`, `requires`, or `applicability` are code identifiers and stay English in both languages.
- **Terms are grouped by layer**, from curriculum sources up to quality governance, because most misunderstandings come from mixing layers rather than from a single word.

Two rules explain a large part of the vocabulary below:

- **Goals are stable, structure is contextual.** A goal is a learnable, assessable competence with a stable identity; years, phases, tracks, and jurisdictions are context around it.
- **As much semantics as necessary, as little ontology as possible.** A new distinction is introduced only when it solves a concrete authoring, migration, validation, projection, or runtime problem.

---

## 1. Curricula, skill graphs, and provenance

### Curriculum

*DE: Curriculum, Lehrplan* — see [Whitepaper](../whitepaper/whitepaper.en.md)

The external, authority-defined body of rules SkillPilot docks onto: a state syllabus, a module handbook, or a standard such as CEFR. The curriculum remains the **normative source**; SkillPilot does not create standards, it makes existing ones operational.

Not the same as the skill graph derived from it. In the quality dashboard, "Curriculum" is used more narrowly for one canonical skill landscape file.

### Skill graph

*DE: Skill-Graph* — see [Graph Definition](skill-graph/graph-definition.md)

The versioned, machine-readable **operative model** derived from a curriculum: goals connected by `contains` and `requires`, together with their semantics, validity conditions, and frontier logic. The skill graph is what SkillPilot builds, validates, and navigates; the curriculum stays the normative source above it.

### Skill landscape

*DE: Skill-Landschaft* — see [Graph Definition](skill-graph/graph-definition.md)

One delimited, published instance of a skill graph: a single subject-and-school-type unit identified by a `landscapeId`, owned by champions, rated with a maturity level, and shipped as a release package. A skill landscape may be serialized into several locale files that share its ID.

Use *skill graph* when the point is the model, *skill landscape* when the point is **which** one.

### Canonical landscape

*DE: kanonische Landschaft* — see [Canonical Gymnasium Rollout Policy](skill-graph/canonical-gymnasium-rollout.md)

A skill landscape maintained once for a whole school type and reused by all jurisdictions, instead of one separately authored landscape per state. Jurisdiction-specific differences are expressed through applicability and composition views, not by copying goals.

### Root curriculum and curriculum manifest

*DE: Wurzelcurriculum, Curriculum-Manifest* — see [Levels of Personalization](levels-of-personalization.md)

A root curriculum is a skill landscape that is selectable in the UI and valid for champion registration. The set of root curricula is declared explicitly in `curricula/curriculum_manifest.json`; CI fails if the manifest and the computed set of roots disagree.

### Source snapshot

*DE: Quellen-Snapshot* — see [Curriculum Quality](../qa-ci/curriculum-quality-maturity-and-routes.md)

A captured, parseable extract of an official curriculum document, kept in the repository together with an official HTTP(S) link to the original. Coverage claims are only ever proven against the snapshots present in the repository.

### Source goal and source registry

*DE: Originalziel, Source-Ziel; Source-Registry* — see [Curriculum Quality](../qa-ci/curriculum-quality-maturity-and-routes.md)

A source goal is a learning objective as written in the original curriculum. The source registry records which source goals exist and how their **atomic source closure** maps onto canonical goals. Coverage is checked in both directions: every visible atomic goal needs source evidence, and every registered source goal must map completely into the view.

### `sourceRef` vs `resourceLinks`

*DE: Herkunftsnachweis vs. Lernressourcen* — see [Source And Resource Links](skill-graph/source-and-resource-links.md)

Two separate goal-level fields with two separate questions:

- `sourceRef` answers "Where does this goal come from?" (provenance, source of truth).
- `resourceLinks` answers "What would help someone learn or teach this goal?" (ordered helpful resources).

Learning material must never be smuggled in as provenance, and provenance is not a study link.

### Runtime package and ontology package

*DE: Runtime-Paket, Ontologie-Paket* — see [Dual Curriculum Package Releases](skill-graph/dual-curriculum-package-releases.md)

The two equivalent release artifacts of one curriculum release: a JSON runtime package consumed by the application, and an FWU-style ontology package for semantic interchange. Both are produced from the same reviewed release unit.

---

## 2. Inside the skill graph

### Goal

*DE: Lernziel* — see [Graph Definition §2](skill-graph/graph-definition.md)

A node of the skill graph: a learnable, assessable competence, usually phrased as "Die lernende Person kann …". Every goal has a stable UUID `id`, a `title`, and a positive `weight`.

A year, semester, module, phase, or track is **not** a goal.

### Atomic goal

*DE: atomares Lernziel* — see [Graph Definition §2.4](skill-graph/graph-definition.md)

A goal with no `contains` children. Atomic goals are the assessable units: mastery is recorded on them, the frontier is computed over them, and the didactic prerequisite layer should live between them.

The classification is derived from the graph structure, not authored. Stored classification metadata must agree with the derived one.

### Cluster goal

*DE: Cluster-Ziel* — see [Graph Definition §2.4](skill-graph/graph-definition.md)

A goal with at least one `contains` child. Clusters serve navigation, filtering, and aggregated progress. Their satisfaction is derived from their atomic descendants rather than recorded directly.

### Atomic basis

*DE: atomare Basis* — see [Graph Definition §4.3](skill-graph/graph-definition.md)

Written `Atoms(g)`: the goal itself if it is atomic, otherwise its atomic descendants. It is the set whose mastery witnesses satisfaction of a cluster.

### `contains`

*DE: enthält* — see [Graph Definition §4](skill-graph/graph-definition.md)

The hierarchy relation: `(p, c)` means parent `p` bundles child `c` in **content** terms. `contains` must be acyclic but allows multiple parents (polyhierarchy). Indirect containment is the transitive closure.

`contains` is not a prerequisite and not a program placement.

### `requires` (direct requires)

*DE: setzt voraus* — see [Graph Definition §5](skill-graph/graph-definition.md)

The prerequisite relation: `(u, v)` means `u` must be satisfied before `v` is approached. It must be acyclic. In mature skill landscapes it should be authored between **atomic** goals; cluster-level `requires` is a transitional authoring aid or a deliberately universal claim.

### Effective requires

*DE: effektive Voraussetzungen* — see [Graph Definition §6](skill-graph/graph-definition.md)

The prerequisite relation the runtime actually evaluates: a goal's own direct `requires` plus everything its `contains` ancestors require. With multiple parents, a goal inherits the union over all ancestor paths.

The frontier is computed on effective requires, which is why a coarse cluster prerequisite can block many atomic goals at once.

### Weight

*DE: Gewicht* — see [Graph Definition §2.2](skill-graph/graph-definition.md) and [AGENTS.md](https://github.com/enpasos/skillpilot/blob/main/AGENTS.md)

A strictly positive number expressing a goal's share in progress and later grading. Convention in the canonical landscapes: atomic goals carry `weight = 1`, clusters carry the number of their *unique* atomic descendants, so a goal reachable through several parents is counted once.

### Goal ID and `shortKey`

*DE: Lernziel-ID, Kurzschlüssel* — see [Graph Definition §2.3](skill-graph/graph-definition.md)

`id` is the canonical UUID identity of a goal; it may be shown to learners and coaches and is not an access credential. `shortKey` is an optional stable ASCII identifier for exports, APIs, and cross-layer references. It must be unique per logical landscape and never replaces `id`.

### Graph validity

*DE: Graphgültigkeit* — see [Graph Definition §10](skill-graph/graph-definition.md)

A graph is valid iff IDs are unique, `contains` and `requires` are acyclic, effective requires is acyclic, and both minimality rules hold:

- **Local minimality:** a prerequisite already inherited from an ancestor must not be restated on the node.
- **Transitive minimality:** an edge must not be present if the same prerequisite already follows from other effective paths.

### Motivation anchor

*DE: Motivationsanker* — see [Graph Definition §8.5](skill-graph/graph-definition.md)

An atomic goal that opens a didactic route by answering "why this subject at all?", for example `Warum Physik? – Weltverständnis & Zukunft`. Route checks measure connectivity back to such an anchor.

### Terminal autonomy goal

*DE: terminales Autonomieziel* — see [Graph Definition §8.5](skill-graph/graph-definition.md)

An atomic goal at which the learner performs independently, typically an exam-mode exercise goal such as the atomic tasks under `Übungen Q2`. It closes a didactic route.

### Route coverage

*DE: Routenabdeckung* — see [Graph Definition §8.5](skill-graph/graph-definition.md)

The property that a route-relevant atomic goal lies on at least one prerequisite path from a motivation anchor to a terminal autonomy goal. The intended direction of a route is motivation → understanding → memorization where needed → independent application.

A skill landscape should expose teachable routes, not a loose bag of local dependencies.

---

## 3. Node types (learning modes)

The three node types are pedagogical goal kinds. They are orthogonal to the structural atomic/cluster split. See [Node Types](skill-graph/node-types.md).

### Understanding

*DE: Verstehen*

The default type: conceptual or procedural competence, coached and practised in dialogue. A goal with no special fields is an Understanding node.

### Memorize

*DE: Sich merken*

A spaced-repetition goal for facts, vocabulary, or formulas. It is mastered only when no required card is due **and** every required card has passed a verified recall test.

### Exam

*DE: Selbstständig Probleme lösen, Prüfungsknoten*

A goal carrying `examData`: an assessment task with a solution and a scoring scheme. `requires` gates access to the task and drives targeted remediation after a failure.

### `examData` and scoring

*DE: Prüfungsdaten, Bewertung* — see [Node Types](skill-graph/node-types.md)

Task content, solution content, and a scoring object with `maxPoints`, `passingPoints`, and per-step points. `total = min(sum(step points), maxPoints)`, `passed = total >= passingPoints`. Mastery is set to `1.0` on pass and left unchanged on failure.

### Exam Mode

*DE: Prüfungsmodus* — see [Node Types](skill-graph/node-types.md)

The runtime mode in which the AI acts as a strict, neutral exam supervisor: the task is delivered verbatim, no hints are given, one complete submission is graded step by step, and only then does the coaching role resume.

### SRS and SM-2

*DE: Kartei, Wiederholungsplanung* — see [Node Types](skill-graph/node-types.md)

Spaced repetition scheduling after the SuperMemo-2 algorithm. Each card stores `interval`, `repetition`, easiness factor `ef`, and `nextReview`. A card is **due** when `nextReview <= now` or when it has no state yet.

### Verified recall

*DE: geprüfter Abruf* — see [Node Types](skill-graph/node-types.md)

The hard recall gate on memorization cards: the coach shows only the prompt, the learner answers unaided, and only afterwards does the coach retrieve the expected answer and persist `passed` or `failed`. SRS practice alone is explicitly not a mastery proof.

---

## 4. Structure layers and projection

### Layer model

*DE: Schichtenmodell* — see [General Goal System and Migration](skill-graph/general-goal-system-and-migration.md)

SkillPilot separates five layers that older skill landscapes still mix:

| Layer | Holds | Example |
| --- | --- | --- |
| Goal layer | assessable competences and content clusters | "lineare Funktionen verknüpfen" |
| Program layer | structural units | `Jahrgang 8`, `E-Phase`, module, track, exam |
| Placement layer | links from goals into program units | "this goal belongs to Q1" |
| Competency-axis layer | taxonomy entries | `K1 Mathematisch argumentieren` |
| Composition-view layer | scope-specific learner-facing trees | `DE-BY / Gymnasium / SekII / Mathematik / LK` |

### Program unit

*DE: Programmeinheit* — see [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)

An explicit structural container (year, semester, module, phase, track, exam section) forming a tree via `parentUnitId` with an explicit `order`. A program-tree node must correspond one-to-one to a declared program unit; a content goal must not be reused as a stand-in for a phase.

### Goal placement

*DE: Zielplatzierung* — see [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)

An entry attaching an unchanged goal to a program unit under a reviewed context. Relations:

- `primary` — the default program anchor in the resolved scope
- `secondary` — additional relevance, shown as reference or badge
- `assessed` — relevant for assessment and exam views

A placement never re-parents the content tree and never creates a second occurrence of a goal in the default tree.

### Competency axis

*DE: Kompetenzachse* — see [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)

An orthogonal taxonomy view built from `competencyCatalog` plus `competencyRefs`, for example process competencies `K1`–`K6`. Broad capability families are taxonomy entries, not goals and not program units.

### Composition view

*DE: Composition View, Sichtkomposition* — see [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)

An explicit, reviewed file that defines the learner-facing upper tree for one resolved scope: structure nodes, their labels and order, and references to canonical subtree roots. It must not contain authored atomic goals, new goal payload, or new `requires` edges.

Where a composition view exists, it is the preferred source of truth for that scope's default tree.

### Canonical subtree reference

*DE: kanonische Teilbaumreferenz* — see [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)

A pointer from a composition view to a reviewed cluster root of the canonical graph; the subtree contents stay in the canonical model. Within one compiled tree, expanded references must be pairwise disjoint.

### Projection role

*DE: Projektionsrolle* — see [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)

Authored per composition-view reference as `projectionRole`, defaulting to `target`:

- `target` — a selectable learning target in this scope; appears in navigation, frontier, progress, and completion.
- `prerequisiteOnly` — a supporting goal whose global mastery may block or unlock targets but which is never itself selectable or a frontier candidate here.

Roles are never inferred from `requires`, `phase`, year, or stage. On overlap, specificity decides: a direct `goalEntry` beats an inherited subtree role, the deepest matching subtree beats a broader one, and only at equal specificity does `target` win.

### Applicability

*DE: Gültigkeit, Anwendbarkeit* — see [Node Types](skill-graph/node-types.md) and [Graph Definition §11.1](skill-graph/graph-definition.md)

Optional compiled goal metadata mapping filter dimensions (`jurisdiction`, `schoolForm`, `stage`, `durationModel`, `courseProfile`, …) to the values for which the goal is visible. An absent dimension means "unrestricted on that dimension".

Applicability is not a node type and never creates a parent edge; it can only hide a goal in a filtered view.

### Applicability override

*DE: Gültigkeits-Override* — see [Graph Definition §11.1.1](skill-graph/graph-definition.md)

Review metadata under `extendedData.applicabilityOverrides` marking which in-force applicability values were added by an explicit, documented exception rather than by ordinary source alignment. It is audit information, not a second filter system; the runtime still evaluates the compiled `applicability`.

### Entry scope

*DE: Einstiegskontext* — see [General Goal System and Migration](skill-graph/general-goal-system-and-migration.md)

The small set of contextual choices a learner makes before navigating content: school form, stage, jurisdiction, duration model, course profile, current year or phase. Entry scope is a query and navigation context applied to program units, placements, and applicability — it must never force duplication of goals.

### Resolved scope

*DE: aufgelöster Kontext* — see [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)

A fully determined combination such as `DE-HE / Gymnasium / SekII / Mathematik / LK`. Default trees, single-occurrence validity, and coverage checks are always evaluated relative to one resolved scope.

### Default tree

*DE: Standardbaum* — see [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)

The one tree a learner sees for a resolved scope. Every visible edge must come from exactly one explicit source (`contains`, `parentUnitId`, `goalPlacements`, or `competencyRefs`); structure is never inferred from titles, labels, or `phase`.

**Single-occurrence rule:** within one resolved scope each visible goal appears at most once and under at most one visible parent. A different scope may legitimately show a different path to the same goal.

### Content tree, program tree, competency view

*DE: Inhaltsbaum, Programmbaum, Kompetenzsicht* — see [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)

The three classic view families, each with exactly one structural source of truth: `contains` for content, `programUnits` plus `goalPlacements` for program, `competencyCatalog` plus `competencyRefs` for competency. The scope-specific composition tree is the fourth family and the preferred learner-facing default.

### `phase`

*DE: Phase* — see [Graph Definition §2.2](skill-graph/graph-definition.md)

Legacy compatibility metadata (`E`, `Q1`–`Q4`, …) that may drive badges, filtering, or migration tooling. It is explicitly **not** canonical graph semantics and never implies parentage: `phase: Q1` does not mean "child of the Q1 cluster".

### `ALL`

*DE: `ALL`-Platzhalter* — see [Graph Definition §11.1](skill-graph/graph-definition.md)

A query sentinel meaning "do not restrict this dimension" while resolving a scope. It must never be serialized as an applicability or placement value.

---

## 5. Learner runtime

### Levels of personalization

*DE: Personalisierungsstufen* — see [Levels of Personalization](levels-of-personalization.md)

The four-step narrowing from curriculum to individual mastery: **1** base
curriculum → **2** committed personal curriculum → **3a** current focus plus
**3b** one active atomic goal → **4** global mastery. Catalog navigation such
as school, university, or languages precedes Level 1 and is not learner scope.

### Base curriculum

*DE: Basiscurriculum* — see [Learning Workflow](runtime-workflows/learning-workflow.md)

The authority-defined skill landscape chosen before learning starts; it provides the full goal universe for that learner.

### Personal curriculum

*DE: persönlicher Lehrplan* — see [Learning Workflow](runtime-workflows/learning-workflow.md)

The committed, longer-lived subset of the base curriculum that counts as in
scope for one learner, reflecting jurisdiction or canonical view, applicable
duration model, stage, subjects, and course profiles per subject. It resolves
the learner-facing composition view and becomes the candidate space for focus,
frontier, progress, and completion, while the backend may still use the full
graph for strict prerequisite checks.

The state is backend-owned and can be edited through several hosts. The web UI
is the primary control surface, but an MCP UI or an unambiguous ChatCoach
request may use the same contract. It is not the learner's temporary year or
topic focus.

### Personalization

*DE: Personalisierung* — see [Behavioral Integration of the German MCP Coach](runtime-workflows/openai-mcp-coach-behavioral-integration.md)

The authored validity decisions of a learner, such as jurisdiction or course profile. Personalization is never derived from the skill graph: neither `contains` nor `requires` may be read as a personalization decision. Options always come from the most recent backend state and are opaque — an adapter selects one of them by its ID and never constructs an ID of its own.

Course profiles are stored per subject, so Mathematik LK and Physik GK can coexist.

### Learning scope and focus

*DE: Lernumfang und Fokus* — see [Behavioral Integration of the German MCP Coach](runtime-workflows/openai-mcp-coach-behavioral-integration.md)

Two decisions the coach must keep apart:

- **Learning scope** is the committed Personal Curriculum relevant for this learner.
- **Focus (Level 3a)** is the currently selected subtree or learning corridor
  that frontier and goal options are drawn from. It is expressed through
  planned goals (scope roots); if none are set, the whole personal curriculum
  stays in focus. A year or phase may define focus without becoming a goal.

Frontier and recommendations are only offered once scope and focus are resolved.

### Active goal

*DE: aktives Ziel* — see [Learning Workflow](runtime-workflows/learning-workflow.md)

Exactly one backend-confirmed atomic goal (**Level 3b**) that is the current
working target of UI and coach. It should normally come from the frontier; for
a non-frontier selection the system diagnoses the blockers instead of silently
allowing it.

### Frontier

*DE: Frontier, nächste erreichbare Lernziele* — see [Graph Definition §9.1](skill-graph/graph-definition.md)

The set of not-yet-mastered **atomic** goals whose effective prerequisites are all satisfied — the didactic zone of proximal development, computed rather than suggested.

The frontier is not an AI recommendation: it is the mathematically determined set of unlocked goals in the active graph section. A cluster frontier may be derived for navigation from the same satisfaction predicate.

### Satisfaction

*DE: Erfüllung* — see [Graph Definition §9.1](skill-graph/graph-definition.md)

`Sat(g)` holds iff the goal's atomic basis is non-empty and fully mastered. An atomic goal is satisfied iff it is mastered; a cluster iff all its atomic descendants are.

### Optimistic mode

*DE: optimistischer Modus* — see [Graph Definition §11.3](skill-graph/graph-definition.md)

Filter first, then check prerequisites only inside the filtered graph. Learners can start directly in the selected scope without being blocked by gaps from earlier years. This is the default exploration mode.

### Strict mode (pessimistic mode)

*DE: strikter Modus, pessimistischer Modus* — see [Graph Definition §11.4](skill-graph/graph-definition.md)

Candidates still come from the filtered graph, but prerequisites are enforced globally. Used diagnostically when a learner struggles, to expose missing foundations outside the current filter. Learners toggle it via the `strictMode` preference.

### Missing prerequisites

*DE: fehlende Voraussetzungen* — see [Graph Definition §11.5](skill-graph/graph-definition.md)

The unsatisfied effective prerequisites of a goal, split into gaps inside the filter and gaps outside it. This split is the diagnostic behind "why is this goal still locked?".

### Mastery

*DE: Beherrschungsgrad* — see [Learning Workflow](runtime-workflows/learning-workflow.md)

Progress stored per atomic goal on a `0.0`–`1.0` scale. Cluster mastery is aggregated from contained descendants using goal weights; memorization mastery is derived from card state rather than set manually. Mastery belongs to goals, never to structure, and stays global across composition views.

### Learning velocity

*DE: Lerngeschwindigkeit* — see [Learning Velocity](didactic/learning-velocity.md)

The count of newly mastered atomic goals per calendar (ISO) week, counting a goal when mastery reaches `0.9` or higher. It measures consistency and momentum and is deliberately **not** a grading metric.

### Autopilot

*DE: Autopilot* — see [Frontier Goal Selection Strategies & Autopilot](didactic/frontier-goal-selection-strategies-autopilot.md)

An opt-in mode that automatically activates the next goal once the active goal reaches mastered state, picking the first entry of the next-steps list after the selection strategy has been applied.

### Selection strategy

*DE: Auswahlpriorisierung* — see [Frontier Goal Selection Strategies & Autopilot](didactic/frontier-goal-selection-strategies-autopilot.md)

How frontier goals are ordered for the learner: `Random` for variety across topics, `Sequential` for a strict linear progression along the curriculum structure. Stored per learner together with the autopilot and strict-mode preferences.

---

## 6. Coach, session, and identity

### SkillPilot ID

*DE: SkillPilot-ID* — see [Quickstart (DE)](../quickstart/story.de.md)

The learner's permanent, pseudonymous key to their learning state. There is no registration with name or email. The permanent ID stays backend-only: it is never a tool argument, tool result, or chat content.

### Learning session

*DE: Lernsession* — see [OAuth and Learner Session Architecture](runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)

An opaque, randomly generated key with an absolute 24-hour lifetime that addresses exactly the learner state chosen by an explicit **Lernen starten** action. Every start creates a fresh session; SkillPilot inserts it into the prepared start message automatically, and the adapter passes it unchanged to every learner-specific tool call.

### OAuth app binding

*DE: OAuth-Verbindung* — see [OpenAI MCP Client Binding](../security/openai-mcp-client-binding.md)

The one-time, revocable, confidential-client authorization that lets the approved provider app talk to the backend. It authenticates the **app**, not the learner: OAuth alone neither selects a learner nor creates a learning session.

### SkillPilot Lerncoach

*DE: SkillPilot Lerncoach* — see [Provider-Neutral Learning-Coach Boundary](runtime-workflows/provider-neutral-coach-boundary.md)

The AI-facing interaction layer that turns backend state into dialogue. The coach speaks; the backend decides. Learning state, active filters, allowed transitions, and next steps are authoritative in the backend and are never reconstructed from conversation memory.

### Cockpit

*DE: Cockpit* — see [Quickstart (DE)](../quickstart/story.de.md)

The SkillPilot web surface showing learning goals, progress, and sensible next steps, including the SRS practice drill. Cockpit and coach work on the same learning state; the Cockpit does not grade the hard recall test.

### Safe state projection

*DE: sichere Zustandsprojektion* — see [Provider-Neutral Learning-Coach Boundary](runtime-workflows/provider-neutral-coach-boundary.md)

The rule that only an allowlisted, minimized view of learner state crosses the provider boundary. Internal identity, secrets, and private asset paths are removed before anything reaches a model, chat, or widget.

### Provider-neutral boundary

*DE: providerneutrale Grenze* — see [Provider-Neutral Learning-Coach Boundary](runtime-workflows/provider-neutral-coach-boundary.md)

The separation between the shared SkillPilot application core and provider-specific adapters. Domain rules, exam authorization, and state projection live in the shared core so that adding or replacing a provider does not fork the learning logic.

---

## 7. Quality, review, and governance

### Curriculum Champion

*DE: Curriculum-Champion:in* — see [Champion Guide](../qa-ci/champion-guide.md)

A person taking responsibility for one curriculum's practical usability: working through it as a learner, improving it via issues and pull requests, and building contact with the content owners. Several champions may share one curriculum; registration is verified through GitHub OAuth.

### Four-level champion model

*DE: Vier-Stufen-Champion-Modell* — see [Four-Level Champion Model](../qa-ci/four-level-champion-model.md)

The QA cascade separating algorithmic from human review: `1a` the CI pipeline (real today), `1b` a static AI agent and `1c` a dynamic AI agent (both forward-looking), and `2` the human champion certificate.

### QA scope

*DE: QA-Scope* — see [Curriculum Quality](../qa-ci/curriculum-quality-maturity-and-routes.md)

An explicitly configured route profile that checks one learner-facing part of a curriculum, defined by its curriculum, a label such as `Sekundarstufe I`, its motivation anchors, its selected atomic goals, its terminal autonomy areas, and a cluster selector.

A QA scope counts registered QA profiles — not paths in the graph, not exercises, not learning-path variants. The earlier label "Routen" was misleading and has been retired.

### CQR rule

*DE: CQR-Regel* — see [Curriculum Quality](../qa-ci/curriculum-quality-maturity-and-routes.md)

A Curriculum-Quality-Review rule with a stable ID that the quality dashboard evaluates, for example `CQR-003` for bidirectional jurisdiction coverage or `CQR-101` for closed routes. CQR rules judge curriculum content quality.

### GVR rule

*DE: GVR-Regel* — see [Graph Validation Rules](../qa-ci/graph-validation-rules.md)

A graph-validation rollout rule with a stable ID enforced by the CI validator, for example `GVR-001` (a goal must not require its own `contains` ancestor). GVR rules judge structural graph integrity and are errors by default.

### Maturity level

*DE: Reifegrad* — see [Curriculum Quality](../qa-ci/curriculum-quality-maturity-and-routes.md)

A cumulative, conservative rating from the quality dashboard. A single QA scope reaches at most `M3`; a curriculum can reach `M0`–`M7`. `M5` is the core school-ready level: sources captured, jurisdiction views proven in both directions, all mandatory QA scopes route- and exam-complete, and the core review debts cleared. `M6` adds the reviewed memory layer, `M7` the fully rolled-out and human-approved goal visualizations.

`M5` means the automated Phase-1 quality assurance is clean — not that no subject-matter improvement is left.

### Semantic atomicity

*DE: semantische Atomarität* — see [Semantic Atomicity Review](../qa-ci/semantic-atomicity-review.md)

The review question of whether a goal really is one assessable competence rather than several bundled ones. Structural atomicity (no `contains` children) is necessary but not sufficient for it.

### Generated artifact

*DE: generiertes Artefakt* — see [Documentation Guidelines](../dev/documentation-guidelines.md)

A report, status page, or dashboard file produced by a script. It carries a "do not edit manually" notice naming its generator, regeneration command, and source of truth. Decisions belong in the source files that generate it, never in the artifact.

---

## 8. Distinctions that are easy to get wrong

| These are not the same | Why it matters |
| --- | --- |
| `contains` vs `requires` | Containment bundles content; requires sequences learning. Only requires drives the frontier. |
| `contains` vs `goalPlacement` | Content composition vs program membership. A placement must never re-parent the content tree. |
| Direct requires vs effective requires | The runtime evaluates the inherited relation, so a cluster prerequisite silently constrains all descendants. |
| Atomic goal vs cluster goal | Mastery, frontier, and coverage counts are defined on atomic goals; clusters only aggregate. |
| Structural atomicity vs semantic atomicity | A leaf node can still bundle several competences. |
| `applicability` vs projection role | Applicability decides *whether* a goal is visible in a scope; the projection role decides whether it is *selectable* there. |
| `applicability` vs node type | Applicability is cross-cutting view metadata, not a fourth node type. |
| Entry scope vs personal curriculum | Entry scope narrows the query; the personal curriculum is the learner's committed subset. |
| Learning scope vs focus | Scope is what is relevant at all; focus is the corridor the current frontier is drawn from. |
| Frontier vs recommendation | The frontier is computed from the graph; strategy and autopilot only order and pick within it. |
| Optimistic vs strict mode | Same candidates, different prerequisite reach — strict mode is a diagnostic, not a stricter curriculum. |
| SRS practice vs verified recall | Practice schedules repetition; only the coach-led hard test closes a memorization goal. |
| SkillPilot ID vs learning session | A permanent backend-only identity vs a fresh, opaque 24-hour key that travels to the provider. |
| OAuth connection vs learning session | OAuth authorizes the app; the session selects the learner. |
| `phase` vs program unit | `phase` is compatibility metadata; only an explicit program unit may become a structural node. |
| QA scope vs learning route | A QA scope is a registered check profile, not a path a learner walks. |
| CQR vs GVR rules | Content quality review vs structural graph validation. |
| Curriculum vs skill graph | The normative external document vs the versioned operative model derived from it. |
| Skill graph vs skill landscape | The model and its semantics vs one delimited, published instance with a `landscapeId`, a champion, and a maturity level. |

---

## Maintenance

- `cd app && npm run check:terminology` fails on retired synonyms; add a rule there when a term is consolidated here.
- Add a term here when it is used across documents and its meaning is not obvious from the code.
- Keep each entry to a definition plus, where useful, one delimitation; details belong in the linked normative document.
- If a definition here and in a linked document disagree, the linked document wins and this page must be corrected.
