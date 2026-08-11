# AGENTS.md – Skill Graph Memory & Design Guide

This document is the **long-term memory** for SkillPilot, including the skill-graph explorer.  
It captures the *concepts and design decisions* that are **not obvious from the code alone**, so humans and LLMs can extend the project consistently across different learning domains.

---

## 1. Purpose of this project

SkillPilot is a **general open-source learning platform** that models domains as skill graphs.
Every landscape should:

1. Represent learning goals as a **DAG of competencies** (cluster + atomic goals).
2. Enable **smooth learning paths** via the `requires` frontier: no goal is suggested unless prerequisites are mastered.
3. Provide a **transparent mastery/progress view** that can later drive grading or certification models.
4. Be usable both by **human teachers/learners** and **LLM-based agents** (task generation, coaching, analytics).

This repository ships multiple Hessian KC 2024 landscapes (Mathematik, Physik, Chemie, Biologie, Informatik, Wirtschaftswissenschaften, Politik und Wirtschaft, Deutsch, Englisch, Französisch, Latein, Geschichte). In addition, we now have:

- **Hessen Sek I (G9)**: Mathe, Physik, Chemie, Biologie as competence DAGs per Jahrgang 5–10 plus Mittelstufe-Overview.
- **Sprachen CEFR (für Deutschsprachige)**: Englisch und Französisch als A1–C2 CEFR-Landschaften (IDs `GER_ENGLISH_FROM_GERMAN`, `GER_FRENCH_FROM_GERMAN`).

All conventions described below are general enough to support other curricula, subjects, or languages; the mathematics graph remains the reference implementation.

> Foreign languages (Englisch/Französisch) follow a TF × Skill × GER schema: Themenfelder aus dem KC + sprachliche Skills (reading, listening, speaking, writing, mediation, intercultural) mit `tags` wie `skill:*` und `cefr:B1/B2/C1` (E ~ B1, Q GK ~ B2, LK ~ C1).  
> German Ziele wurden KC-konform operationalisiert (prüfbare Beschreibungen, z. B. Analyse, Vergleich, Deutung, Urteilsbildung) und mit einfachen `skill:*`-Tags (lesen, schreiben, sprechen, medien, sprachreflexion) versehen.  
> Geschichte ist komplett angelegt (E + Q1–Q4), je Themenfeld GK-/LK-Ziele: Überblick, Quellenanalyse, Strukturen/Ursachen, Vergleich, historisches Urteil, Erinnerung/Deutung.

---

## 2. Mental model of the skill graph

### 2.1 Nodes = learning goals

Each node is a **learning goal** (“Lernziel”). There are two “flavours”:

- **Atomic goals**  
  Small, assessable skills (e.g. _“mittlere Änderungsrate berechnen und deuten”_).
- **Cluster goals**  
  Aggregations that group atomic goals (e.g. all goals in one Themenfeld, or all E1-Analysis basics).

Atomic goals are what the student actually “masters”.  
Cluster goals are for navigation, progress summaries, and as intermediate “levels” in the graph.

### 2.2 Edges = relationships between goals

We use exactly **two connection types**:

1. `requires` – **prerequisite**  
   - `A.requires = [B, C]` means: A should only be approached if B und C sitzen.  
   - Current compatibility model: prerequisites may still appear on clusters and can be inherited along `contains` for runtime/frontier purposes.
   - Target modeling state: the canonical didactic sequencing layer should live on **atomic goals**; cluster-level `requires` are only transitional authoring shortcuts or rare, truly universal prerequisite claims.
   - Intention: modelling **didactic dependencies** (prevents jumping into topics without foundation).

2. `contains` – **is composed of / includes**  
   - `A.contains = [B, C]` means: A is a **higher-level bundle** of B and C.  
   - If a learner truly masters A, we *usually* assume mastery of B and C.

The overall structure is a **DAG (Directed Acyclic Graph)**:
- `requires` should never form cycles.
- `contains` also should not create cycles (think of it as a hierarchy of clusters).

### 2.3 Separate goals from structure and taxonomy

The long-term target model should distinguish four semantic concepts plus one learner-facing composition layer that are currently still partly mixed in some landscapes:

- **Goal layer**: actual assessable learning goals and fachliche clusters
- **Program layer**: structural units such as year, semester, module, phase, track, or exam
- **Placement layer**: links from goals into program units
- **Competency-axis layer**: taxonomy entries such as process competencies (`K1`-`K6`)
- **Composition-view layer**: explicit scope-specific learner-facing tree definitions that reference reviewed canonical subtrees

Interpretation rules:

- year/semester/module/phase nodes are **not** the durable semantic backbone of the skill graph
- broad capability families such as `K1`-`K6` are **not** program units
- only concrete, assessable process skills become actual goals
- current `phase` values should increasingly be treated as compatibility/view metadata rather than as the canonical semantic anchor
- user-facing initial narrowing by school form, stage, jurisdiction, duration model, course profile, and current year/phase should be treated as **entry scope** over program units, placements, and applicability, not as duplicated goal semantics
- catalog navigation (for example Schule / Hochschule / Sprachen) precedes the
  selected base curriculum and is not learner scope; the committed Personal
  Curriculum is backend-owned Level 2 state, edited through the authored flow
  in first-party WebGUI surfaces. The OpenAI V1 coach neither presents nor
  mutates that configuration
- Level 2 contains jurisdiction or canonical view, applicable duration model,
  explicit stage, selected subjects, and course profile per subject; an absent
  stage stays unresolved, and LK is a subject attribute that never implies
  Sekundarstufe II
- current focus roots and the one active atomic goal are mutable Level 3 state;
  changing Level 2 revalidates them against the new learner-facing `target`
  projection without rewriting stable goal IDs or global Level 4 mastery
- learner-facing default trees for resolved scopes should preferably be compiled from reviewed composition views early enough that validation can run before UI rendering
- composition views should reference canonical subtree roots and should not inline authored atomic goals
- composition-view references may explicitly use `projectionRole: "target"` or `projectionRole: "prerequisiteOnly"`; an omitted role means `target`
- projection roles are authored scope semantics and must never be inferred automatically from phase, year, stage, or `requires`
- only `target` goals participate in the learner-facing tree, frontier, progress, and completion scope; `prerequisiteOnly` goals retain their stable canonical IDs and global mastery values solely for prerequisite checks
- when overlapping composition references assign different projection roles, specificity decides: a direct `goalEntry` overrides a role inherited from a `canonicalSubtree`, and the nearest/deepest matching `canonicalSubtree` overrides a broader subtree; only at equal specificity does `target` win
- within one resolved learner-facing scope, the default tree should show each goal at most once and under at most one visible parent
- Bundesland-specific canonical supplement branches under a broad shared root may use `extendedData.applicabilityMappingInheritance = "boundary"` on the supplement cluster. This prevents old broad ancestor-cluster source mappings from being treated as source evidence for the supplement's atomic descendants, while direct mappings/provenance inside the branch and child-union visibility upward still count.
- Practice or assessment terminal goals may use `extendedData.applicabilityFromRequires = true` when their visibility should be derived exactly from their prerequisite goals. This is for local autonomy/exam endpoints, not for ordinary content atoms, and the resulting `assessment-requires` evidence is applicability evidence only, not source-coverage evidence.
- local authoring tools should mirror this split: one tool for canonical cluster authoring, one tool for composition-view authoring
- preferred design maxim: **as much semantics as necessary, as little ontology as possible**
- add semantic distinctions only when they solve a concrete authoring, migration, validation, projection, or runtime problem

Reference:

- `docs/concept/skill-graph/general-goal-system-and-migration.md`
- `docs/dev/skill-graph-minimal-schema-runtime-fallback-and-math-pilot.md`

---

## 3. Semantics of the `Goal` fields

The `Goal` type in code currently uses a minimal set of fields.  
Semantics (the “meaning”) of those fields is:

- `id`  
  Short, stable identifier, used everywhere in the app.  
  Conventions (examples):
  - E-phase: `L_A1`, `L_AG4`, `TF_E2`, …
  - Q3 Stochastik: `TF_Q3_2_WAHRSCH_VERTEILUNGEN`, `Q3_2_03_BERNOULLI_KETTEN`, …

- `title`  
  Short phrase naming the competence. Shown prominently in the UI.

- `description`  
  Full-sentence learning goal, typically of the form:  
  _“Die lernende Person kann …”_  
  This should be understandable for teachers and learners, not only for machines.

- `phase`  
  Curriculum-specific grouping (semester, module, year).  
  *Example (Hessen math):* `E`, `Q1`, `Q2`, `Q3`, `Q4`.

- `area`  
  Domain area or strand (e.g. `Analysis`, `Geometry`, `Process Skills`). Adjust freely per landscape.

- `level`  
  Difficulty tier for the native curriculum.  
  *Example (Hessen math):* `1/2/3` map to Anforderungsbereiche I–III. In other landscapes, map to whatever taxonomy you need.

- `core`  
  - `true` = Kernziel (Pflichtstoff für alle Schüler:innen).
  - `false` = Erweiterung (typisch: LK-Inhalte oder Vertiefungen).

- `weight`  
  Relative importance of this goal for **progress and later grading**.  
  Used to compute weighted averages over sets of goals (e.g. all E1 core goals).
  - **Hessen Math (Gymnasiale Oberstufe, KC 2024):**  
    Atomic goals use `weight = 1`.  
    Cluster goals use `weight = (# of unique atomic descendants)` so progress is proportional to actual goal count.  
    If a goal appears under multiple parents, clusters count that atomic goal only once (set‑union) to avoid double counting.

- `requires`  
  List of IDs that are **didactic prerequisites** for this goal.  
  LLMs and UIs should:
  - use these to avoid suggesting goals whose prerequisites are clearly nicht gemeistert,
  - use them to compute “Frontiers” (see below).

- `contains`  
  List of IDs that are **subgoals** of this goal (cluster relationship).  
  Mainly used for navigation (“drill down”) and summaries.

- `examples`  
  List of **example task IDs** or labels that exercise this goal.  
  Actual tasks/exercises can be kept elsewhere; this field is just a cross-reference.

> **Important invariant for agents:**  
> When adding or modifying goals, keep the DAG property: do not introduce `requires` or `contains` cycles.

---

## 4. Mastery model

The UI maintains a **mastery value per goal**:

- `mastery[goalId] ∈ [0, 1]`
  - `0`   = no mastery (or not yet assessed),
  - `0.5` = partly mastered / unsicher,
  - `1`   = sicher beherrscht.

For goals authoritatively classified as `semanticKind: "orientation"`, this
numeric field is only a compatibility completion marker: `1` means that the
learner received the motivation/orientation and either explicitly chose to
continue or actively engaged in a tailored motivational follow-up. Merely
repeating or selecting one of the possibilities offered by the coach starts
that follow-up; it does not complete the orientation. The coach must connect
the selected interest to concrete things the learner can understand, explore,
shape, or do, and invite one low-pressure personal reaction, choice, or
question. This does **not** certify subject-matter mastery. Orientation must
show concrete possibilities and honest positive perspectives of the following
material; it must not test prior knowledge, terminology, calculations,
details, correctness, transfer, recall, or exam performance. Do not expose a
graded 0/50/100 mastery control for these nodes.

This is currently:

- set **manually via UI controls** (slider + quick buttons) **for non‑SRS goals**,
- stored as the binary completion marker `1` for orientation goals only after
  the learner has answered the tailored motivational follow-up or explicitly
  expressed willingness to leave the orientation and continue; a bare label
  chosen from the coach's possibilities is not sufficient,
- **auto‑derived for SRS/memorization goals** (`srs-deck:*` / `memorization`):  
  a memorization goal is treated as mastered **only if no cards are due today**,
- aggregated per **filtered goal set** into:
  - average mastery over core goals (weighted by `weight`),
  - average mastery over extension goals.

The intended use is:

1. **Learner or teacher** set/adjust mastery for atomic goals.
2. The app (or an agent) computes aggregated metrics.
3. A grading rule (not yet implemented) maps these to familiar school grades (1–6).

When agents generate feedback or suggestions, they should:

- Treat mastery values as **soft estimates**, not hard truth.
- Prefer suggesting goals
  - whose prerequisites are mastered,
  - whose own mastery is clearly < 1.

---

## 5. Frontier: “next sensible steps”

The **frontier** of a learner is the set of goals that are **good next candidates**:

- All `requires` are mastered (or above a threshold).
- The goal itself is not yet fully mastered.

Formally, for mastery map `M` and threshold `τ` (e.g. `0.8` for “mastered”):

```text
Frontier F = {
  g ∈ Goals |
    M[g] < 1  AND
    ∀ r ∈ g.requires: M[r] ≥ τ
}
````

Agents that recommend tasks should:

* Use the **frontier** as the primary pool for “what next?”.
* Possibly sort frontier goals by:

  * phase,
  * area,
  * level,
  * or teacher preference.

A future UI component can show this explicitly as a list or map.

---

## 6. Mapping curricula into the graph (example: Hessian KC)

Any curriculum or skill framework can be mapped by following the same blueprint.  
For the Hessian *Kerncurriculum Mathematik gymnasiale Oberstufe* this means:

1. **Process competencies (K1–K6)** – argumentieren, modellieren, Darstellungen verwenden, …
2. **Content competencies per topic field** – e.g. E.1–E.7, Q1.1–Q4.3.
3. **Cross-cutting dimensions** – Leitideen (L1–L5), digitale Werkzeuge, etc.

Whatever the framework, interpret it as a **universe of required goals** and encode it as a skill graph using the following strategy.

### 6.1 Structural layers

To stay organized, we think in **layers**:

* **Layer 0: Root (optional)** – one node that contains everything.
* **Layer 1: High-level clusters** – e.g. Kurshalbjahre, grade levels, or modules (`E_Analysis`, `Q1_Analysis`, … in the Hessian case).
* **Layer 2: Topic clusters** – one per table row / topic grouping (e.g. `TF_E2`, `TF_Q3_2_WAHRSCH_VERTEILUNGEN`). These `contains` the atomic goals derived from that unit.
* **Layer 3: Atomic goals** – each bullet (or small cluster of bullets) becomes 1–3 measurable goals.

Agents adding new content from the curriculum should:

* Prefer to add **atomic goals on Layer 3**.
* Link them to an appropriate **Themenfeld-cluster (Layer 2)** via `contains`.
* Optionally adjust the relevant **Kurshalbjahr-cluster (Layer 1)**.

### 6.2 Dependencies (`requires`) between Themenfeldern

Dependencies between Themenfeldern should be **simple and regular**, not over-engineered:

* Within a Themenfeld:

  * Order atomic goals in a reasonable sequence.
  * Let each goal require the 1–2 key predecessors.

* Between Themenfeldern (or modules):

  * Use the logical structure of the curriculum:
    * Example: `Q1` Analysis requires the E-phase basics; `TF_Q3_2` (binomial distributions) requires `TF_Q3_1` (foundations).
  * In mature landscapes, implement the canonical sequencing primarily on **atomic goals**. Use cluster-level `requires` only temporarily during early modeling or when the prerequisite claim truly applies to all relevant descendants.

Agents should **avoid creating very long or tangled `requires` chains**
if they can be expressed via a small number of well-chosen prerequisites.

### 6.3 Phase-local autonomy branches vs. global final-exam branches

For phase-based school curricula, ordinary didactic routes should normally end in **phase-local terminal autonomy goals**, not only in distant global final-exam nodes.

Practical modeling rule:

* Create local autonomy clusters such as `Übungen E-Phase`, `Übungen Q1`, `Übungen Q2`, `Übungen Q3`, `Übungen Q4` where appropriate.
* Initial rollout scope: canonical Gymnasium Mathematik, Sekundarstufe I. In that scope, model local autonomy at the year level: each visible year or year-band scope must contain a `Prüfungen Jahrgangsstufe <n>` folder inside the respective year/year-band structure, and the actual assessment tasks live as individual exam nodes below that folder.
* Do not place ordinary Sek-I year practice for canonical Gymnasium Mathematik as one separate `Übungen Sekundarstufe I` learner-facing branch or as a separate `Sek-I-Abschlussaufgaben Mathematik` capstone. The learner-facing terminal endpoints for Sek I mathematics are the individual year-level exam tasks under the matching `Prüfungen Jahrgangsstufe <n>` folders.
* If an old aggregate Sek-I practice cluster is retained only for compatibility, keep it out of learner-facing composition views and mark it with `extendedData.applicabilityProjection = "excluded"` so child-union applicability does not project it as a visible branch.
* Sek-I mathematics exam tasks must use coherent, age-appropriate contexts that actually carry the mathematics. Avoid copied umbrella scenarios, artificial mega-contexts, and tasks that only wrap isolated procedures in decorative prose.
* For year-level exam tasks, prefer a low-floor/high-ceiling shape: an accessible entry from concrete data or representations, followed by at least one reasoning, checking, model-limit, or explanation prompt at a level appropriate to the year.
* Keep each exam node's `requires` and `examData.coveredGoalIds` aligned with the goals that the task actually assesses; do not bulk-copy the entire year coverage onto every individual task.
* Other Sek-I subjects or school forms may adopt the same pattern after their own learner-facing composition views and assessment semantics have been reviewed; do not force the Mathematik rollout rule onto them by default.
* If the curriculum has cross-phase process competencies, a separate branch such as `Übungen Prozesskompetenzen` can be appropriate.
* Keep global Abitur/final-exam branches **separate** from these local exercise branches.
* Do not use the global final-exam branch as the only terminal target for ordinary phase goals.

Interpretation:

* Local exercise branches model ordinary klausur-style self-sufficiency inside a phase.
* In canonical Gymnasium Mathematik Sek I, year exam folders make it possible to verify that each learning route ends in a task appropriate to the learner's current year, instead of only in a coarse stage-level practice bucket.
* Global final-exam branches model an additional assessment layer with different selection and assessment semantics.
* Mature learner-facing landscapes should aim for atomic route coverage from motivation anchors through ordinary atomic goals toward one or more local terminal autonomy goals.

---

## 7. Conventions for new learning goals

When adding new goals (especially atomic ones), follow these conventions:

1. **Descriptions are student-facing**

   * Use *“Die lernende Person kann …”* style wording.
   * Make them specific enough to be tested in 1–3 tasks.
   * Formulate competencies around motivation, understanding, reasoning, or
     purposeful application, problem solving, and construction. Merely looking
     up a formula and substituting values is not a learning goal.
   * Do not mention a *Formelsammlung* / *formula sheet* in canonical goal
     titles or descriptions unless the normative curriculum explicitly makes
     its use part of the competence. Such a rare exception must be documented
     with an exact source reference and quote in
     `scripts/config/competency-wording-exceptions.json`. Source-extraction
     artifacts may retain the original wording without becoming operative
     competence formulations.

2. **IDs reflect structure**

   * Pick a convention that mirrors the native curriculum (semester, module, etc.).
   * Example (Hessen math): `E2_01_...`, `Q3_2_03_BERNOULLI_KETTEN`, cluster IDs starting with `TF_`.

3. **Keep goals atomic**

   * Avoid “kann Analysis in der Oberstufe”.
   * Aim for granularity where one exam task can reasonably assess 1–3 goals.

4. **DAG sanity**

   * Check that `requires` and `contains` don’t produce cycles.
   * `requires` should generally **point “backwards” in time** (to earlier phases or earlier goals in the same Themenfeld).

5. **Core vs Extension**

   * Use `core: true` for what every student (GK) must be able to do.
   * Use `core: false` for:

     * LK-only extensions,
     * enrichment topics,
     * deeper applications.

6. **Separate local autonomy from global exam layers**

   * In phase-based school curricula, add explicit local terminal autonomy branches for ordinary learning routes.
   * Keep global Abitur/final-exam goals on their own branch instead of mixing them into the normal phase exercise structure.
   * Do not introduce coarse cluster-level `requires` just to connect ordinary curriculum goals to a global exam branch.

### 7.1 Semantic atomicity review

Technical content leaf nodes (`contains: []`) are not automatically semantically atomic.

Rule:

* A content leaf goal is semantically atomic only if it contains exactly one content learning goal.
* Broad titles/descriptions that combine independent routines such as “A, B und C bestimmen” should be split or sent to developer review.
* Some combinations such as “berechnen und deuten” may still be one semantic goal; this must be judged from the content, not from keywords alone.
* Non-content leaves such as motivation anchors, SRS/memorization decks, terminal practice nodes, and `examData` assessment nodes are out of scope for semantic content atomicity; they are covered by their own QA lanes.

Process:

* Semantic atomicity is tracked in external review ledgers under `curricula/DE/Gymnasium/quality/semantic-atomicity/`.
* Review records use `atomic`, `needs_developer_review`, or `non_atomic`.
* `atomic` means `semanticAtomic: true`; uncertain or too-broad goals stay visible in the review queue.
* Review records include a fingerprint of semantic fields, so later small graph edits make prior decisions stale until the goal is reviewed again.
* The local Workbench route `/semantic-atomicity-review` is only an algorithmic ledger editor. Semantic bulk review decisions are made from the Codex command line and then written back to the ledger.
* The pilot documentation is `docs/qa-ci/semantic-atomicity-review.md`.

### 7.2 Memory-card review

Memory/SRS cards are not a default learning strategy. They are justified only where a learner must reliably recall compact facts, formulas, vocabulary, notation, definitions, or similar hard memory items. Ordinary mathematical understanding should remain anchored in explanation, worked examples, problem solving, `requires`, and assessment nodes.

Rule:

* Normal SkillPilot learning goals must exist first.
* Then all relevant ordinary atomic goals in the configured scope are reviewed for memory-card suitability.
* The review is tracked under `curricula/DE/Gymnasium/quality/memory-card-review/`.
* Review records use `no_memory_needed`, `memory_required`, or `needs_developer_review`.
* `memory_required` records must reference concrete `memoryGoalIds` and `deckIds`.
* Every active primary card must also be reviewed in the matching `*.cards.review.jsonl` ledger.
* A kept card needs `kept`, `necessary: true`, and at least one concrete `originGoalId`.
* Each `originGoalId` of a kept card must be a current `memory_required` ordinary atomic goal and must reference the card's deck.
* Configured `visibilityScopes` must prove that when a `memory_required` goal is visible in a learner-facing composition view, at least one of its referenced memory goals is visible in that same view.
* Cards marked `remove` may stay in the card ledger as an audit trail, but they must be removed from active deck files.
* Every existing `nodeKind: "memory"` / `memorization` / `srs-deck:*` goal in the configured scope must be traced back through kept cards and at least one `memory_required` decision.
* Review records include a fingerprint of semantic goal fields, so goal text changes make the decision stale.
* Human-readable audit reports under `docs/qa-ci/status/memory-card-review-*.md` are generated from the ledgers; they must not be edited as a second source of truth.
* `CQR-302` is the M6 dashboard rule for memory-card decision tracing. `M5` stays the core curriculum QA level and does not depend on memory-card review configuration. Missing or open memory-card review configuration counts as open for `M6`; it is currently completed for `Mathematik (Gymnasium, DE)`, `Physik (Gymnasium, DE)`, and `Chemie (Gymnasium, DE)`.

Naming and ownership:

* Public memory decks for canonical German Gymnasium subjects are owned by the DE/Gymnasium canonical layer, not by a Bundesland source lane.
* Deck IDs, active card IDs, and public deck filenames must not encode source-state prefixes such as `he`, `hes`, or `DE-HE`; use canonical scope names such as `de_gymnasium_math_*`, `de_gymnasium_physics_*`, and `de_gymnasium_chemistry_*`.
* Canonical deck source files live under `curricula/DE/Gymnasium/memory-decks/` and are deployed to runtime `/data/...` files. They intentionally do not live below `curricula/DE/Gymnasium/canonical/`, because that directory is reserved for `SkillLandscape` JSON files scanned by validators.
* Bundesland-specific visibility is handled by composition views, applicability, provenance, and review ledgers. It must not be encoded by duplicating decks or by naming a canonical deck after one source state.
* Source-state information may remain in provenance and retained source assets, but not in learner-facing SRS deck identifiers.

Interpretation:

* `no_memory_needed` is the conservative default.
* A deck should stay narrow and should not become a second curriculum hidden inside flashcards.
* Passing `CQR-302` means the configured scope has current semantic goal-level decisions, current card-level origin traces, configured learner-facing visibility for required memory nodes, and no unresolved/removal debt in active decks. It upgrades a curriculum from core-ready `M5` to memory-layer-ready `M6`.
* Do not turn a review queue green by bulk-writing `no_memory_needed`; each decision must be made from the current goal semantics.
* The OpenAI V1 coach offers normal due-card practice through the dedicated
  `start_skillpilot_memory_practice` MCP Apps UI resource. The model-visible
  result contains only bounded status and progress; card front, back and the
  bounded due-card batch live only in result `_meta` for the component.
  `review_skillpilot_memory_practice_card` is app-only, accepts exactly the
  displayed card plus `not_known` or `known`, maps those choices to the internal
  spaced-repetition qualities `1` or `4`, and updates only that card's
  repetition schedule. It never changes mastery or the active goal. Turning a
  card and moving backward or forward inside the supplied batch are component-
  local operations and must not call a tool or write learner state. The model
  starts the component exactly once; after a bounded batch has been reviewed,
  only the component may call the start tool again with the newest state version
  to load the next due batch.
* Normal in-chat card practice and strict Verified Recall are separate modes.
  Only Verified Recall can supply the hard, no-help evidence used by the
  memory-goal mastery rule. Completing today's due cards must not be described
  as mastering or completing the learning goal. The cockpit remains the
  fallback when the component cannot be used.
* Give every interactive memory-card view its own explicitly bound, reviewed,
  content-addressed MCP Apps UI resource. Do not attach generic MCP
  `ImageContent` to ordinary memory-card tools, expose private card answers in
  `structuredContent`, or reuse another tool's UI resource implicitly. Render
  card text, line breaks, Markdown and mathematics with bundled safe rendering;
  never inject untrusted card HTML.

### 7.3 Atomic goal visualizations

Atomic learning goals may optionally carry one or more didactic image references
for cockpit and provider use. The multilingual OpenAI V1 MCP coach may present
the current goal's visualization through its one explicitly bound MCP Apps UI
resource when the active goal is atomic, has a matching canonical
`goal-visualization` link, and the learner's default-on
`showGoalVisualizationsInChat` preference is not disabled.

Rule:

* Store visualization references directly on the goal in canonical `resourceLinks`, not in a separate learner-facing branch or custom top-level image field.
* Use `type: "goal-visualization"`, `resourceType: "image"`, and `skillpilotId` equal to the containing goal's `id`.
* Public URLs should be root-relative under `/assets/goal-visualizations/...`.
  The OpenAI V1 adapter resolves the matching active atomic goal's asset to an
  absolute public URL and exposes it only through the bounded
  `goalVisualization` projection used by the image renderer. Other resources
  and provider adapters continue to use a normal cockpit deep link such as
  `https://skillpilot.com/?l=<curriculumId>&goal=<goalId>`.
* `render_skillpilot_goal_visualization` is a read-only image renderer. It
  returns bounded `goalVisualization` data in `structuredContent` for the
  image-only widget. Its descriptor is the only goal-visualization descriptor that carries
  `ui.resourceUri` and the `openai/outputTemplate` compatibility alias, both
  pointing to the same active content-addressed resource. The widget displays
  only the approved image; goal title, description, ID, and cockpit URL may be
  retained for validation but are not rendered. A naked MCP `ImageContent`
  block is not the V1 display contract and must not be treated as a guaranteed
  inline presentation.
* V1 publishes exactly one active, hash-bound MCP Apps HTML resource for this
  renderer. Its URI contains the SHA-256 of the self-contained HTML bytes, and
  the renderer binds exactly that active resource. `resources/list` and
  `resources/read` also keep every previously advertised content-addressed
  resource byte-identically readable for provider metadata caches. Ordinary
  context, curriculum/mastery mutations, recall, and exam tools carry no UI
  binding and therefore do not create empty UI boxes. The independently bound
  memory-practice launcher is a separate UI contract and does not weaken this
  image-renderer invariant.
  This is the documented OpenAI component contract: a selected tool links a
  registered `text/html;profile=mcp-app` resource through
  `_meta.ui.resourceUri`, with `_meta["openai/outputTemplate"]` only as the
  ChatGPT compatibility alias. See
  `https://developers.openai.com/plugins/build/chatgpt-ui` and the explicit
  "Structured content only, no component" diagnostic at
  `https://developers.openai.com/plugins/deploy/troubleshooting#server-side-issues`.
  Never infer a visible ChatGPT component from generic MCP content alone.
* Offer the renderer only when the preference is enabled and a safe
  `goalVisualization` projection exists. The widget starts collapsed, becomes
  visible only after a valid image has loaded, and collapses and requests
  teardown when input is absent or malformed or the image fails. These failures
  must not affect the complete ordinary coaching response.
* Image authorization is surface-neutral. Do not inspect `openai/userAgent`,
  infer Desktop/Mobile/App/Browser, or apply any client-surface presentation
  gate. A conforming host may render or decline the UI resource; this optional
  presentation result must never change authentication, authorization, state,
  persistence, or the ordinary chat result.
* When the newest successful full context contains `goalVisualization` and
  permits the renderer, call it exactly once with that result's unchanged
  `goalId`, copying the top-level `stateVersion` into the renderer input
  `expectedStateVersion`. Never reuse or retry stale authorization. A
  mastery handoff remains before the successor section; render immediately
  before coaching the associated active goal. The receipt does not replace
  full context, and omitted host presentation does not weaken the text path.
* A content-addressed UI URI becomes immutable as soon as it has been advertised
  to a real client, including during draft testing. Replacing widget HTML
  produces a new active hash-bound URI; older URIs remain registered with their
  exact bytes as passive retained resources because provider metadata and chat
  snapshots may request them later. Retention is transport continuity, not a
  second active UI contract: only the current URI may be bound by a tool.
* The renderer result and widget create no state, authorization, goal selection,
  or permanent learner identity. Alt text remains accessibility metadata; the
  visible widget contains exactly the image and no caption, description, goal
  title, technical ID, or cockpit link.
* Image filenames should be the same SkillPilot ID plus image extension, using `<skillpilotId>.<ext>`, so copied assets remain self-identifying without creating Windows path-length problems.
* Keep source image and prompt metadata under `curricula/DE/Gymnasium/visualizations/<subject>/<skillpilotId>/`.
* For Gemini API generated images, keep `image-reconstruction-prompt.de.md` beside the canonical source image. It is a standalone alternative prompt derived from the generated image and may be offered or generated on demand in `/goal-visualization-qa` as a correction base; it does not override human review or fachliche correctness.
* For Nano Banana Pro automation, prefer `npm --prefix app run visualization:generate:nano-banana -- <goal>` with `GEMINI_API_KEY` or `GOOGLE_API_KEY` set; this generates the image, writes trace files under `tmp/`, creates the image-reconstruction prompt, imports the asset, and updates the canonical JSON.
* For manual providers, use `npm --prefix app run visualization:prepare -- <goal>` before generation and `npm --prefix app run visualization:import -- <goal> <file>` after download instead of hand-building paths, filenames, or JSON links.
* Provider prompts must not include SkillPilot IDs; IDs belong in filenames, directories, JSON links, and prompt metadata only. In provider-facing constraints, prefer neutral phrases such as `technical IDs` instead of naming SkillPilot.
* Record reviewed production batches under `curricula/DE/Gymnasium/quality/goal-visualization-review/`, including rejected/regenerated attempts and visible mathematical risks.
* Generated images are never accepted automatically. Treat them as technical imports until a visual fachlicher Review has checked calculations, notation, labels, geometry, age fit, text readability, and visible artifacts.
* Reject or regenerate any visualization with a wrong or misleading value, marked digit, angle, coordinate, side property, unit conversion, sign rule, counterexample, or notation. Text that is correct does not rescue a misleading drawing.
* If repeated Nano Banana Pro attempts for one goal remain fachlich wrong, remove the active `goal-visualization` link and published asset copies, mark the goal as `deferred_provider_limitation` in the review ledger, and revisit when the provider improves. Do not substitute a hand-drawn SVG in this cartoon visualization lane.
* A visualization supports orientation only. Whether shown in the cockpit or
  inline in ChatGPT, it is not source evidence, not an assessment task, not a
  solution or performance record, and not a substitute for explanation or
  practice.
* Before broad rollout, review every image for mathematical correctness, age fit, text readability, accessibility alt text, and licensing/copyright risk.
* Goal-visualization QA is tracked per subject under `curricula/DE/Gymnasium/quality/goal-visualization-qa/*.qa.json`. `CQR-303` is the dashboard rule for the `M7` visualization layer: every ordinary atomic goal in the visualization scope must have a current primary image link, the QA record hash must match the active public asset, and every image must be human-approved with no open human issue. An explicit `Approved AI` decision is valid only when its separate approval hash matches the active asset hash; it is useful technical and subject-matter evidence but never replaces human approval as the release gate. Human approval overrides older ChatGPT triage fields; stale hashes reset approval state. `M7` builds on `M6` and does not weaken core `M5` or memory `M6` requirements.

Reference:

* `docs/concept/skill-graph/atomic-goal-visualizations.md`

### 7.4 Learning-goal books and evidence review

The first learning-goal book edition is a deterministic publication and review
surface for ordinary technical atomic goals in reviewed learner-facing
composition views. It is not a second curriculum source.

Rules:

* Build HTML and PDF from one shared, versioned BookModel.
* Include each eligible `target` goal exactly once and on exactly one complete
  PDF page. Cluster and structure nodes provide chapter paths; memory,
  orientation, practice/assessment, exam, and runtime-support nodes require
  separate later edition contracts.
* Show the full public **Lernziel-ID** on every goal page. Never confuse this
  curriculum identifier with a learner's permanent SkillPilot ID.
* Use a stable topological order that respects direct in-scope `requires`.
  `contains` supplies chapter context and deterministic ordering preferences,
  but never overrides a prerequisite edge.
* Render direct `requires` and derived reverse-`requires` as checked links to
  stable goal destinations. Broken, ambiguous, or missing destinations fail the
  build.
* Never clip, truncate, silently shrink, or continue a goal onto a second page.
  A layout overflow names the affected goal and fails closed.
* Keep detailed didactic coverage in separate bilingual, fingerprint-bound goal
  evidence profiles. AI output can create review candidates only; current human
  approval is required before a profile may become authoritative.
* The fast multi-AI loop is the primary early improvement engine. The public
  teacher channel is installed as a slow, moderated signal and challenge path;
  silence is not evidence and one forceful report cannot create a global rule.
* Books, evidence profiles, review bundles, and feedback links contain public
  curriculum data only. They must never contain learner state, learner IDs,
  sessions, transcripts, credentials, or private provider traces.
* Runtime and Mastery integration are separate later gates. A prompt-level
  profile cannot by itself prove that a learner understood a goal.

Reference:

* `docs/concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md`

---

## 8. Ideas for future work (for agents and humans)

These are directions that are **intended**, even if not implemented yet:

1. **Frontier view**

   * Visualize all frontier goals for the current learner.
   * Let agents propose exercises or explanations for them.

2. **Grade mapping**

   * Turn aggregated `mastery` over core/extension + weights into familiar grades (1–6).
   * Keep the mapping **simple & explainable**.

3. **Curriculum metadata**

   * Extend `Goal` with:

     * `themenfeld` (e.g. `"E.2"`),
     * `courseLevel` (`"GK" | "LK" | "both"`),
     * `leitideen` (subset of L1–L5),
     * `kompetenzen` (references like `"K1.2"`, `"K3.4"`),
     * `sourceRef` (text reference into the Kerncurriculum PDF).
   * Use these tags for filtering, reporting and to help agents align goals with the official text.

4. **Persistence**

   * Store mastery information per student (e.g. in backend or local storage).
   * Potentially support multiple learner profiles.

5. **Task / example integration**

   * Link `examples` to real tasks (in a separate database or file).
   * Let agents generate new example tasks for given goals and attach them.

---

## 9. How agents should behave

When an LLM/agent works on this repo, it should:

* **Respect the existing structure**:

  * keep the DAG invariant,
  * follow the conventions above.
* **Be explicit about curriculum intent**:

  * when adding goals, think “what bullet in the Kerncurriculum is this covering?”.
* **Avoid restating what code already says**:

  * AGENTS.md is for *concepts & policies*,
  * code files are for implementation details.

* **Keep the project root clean**:
  * Write temporary files, verification scripts, logs, or one-off migration scripts to the `tmp/` directory (or `docs/` if permanent).
  * Never write transient files directly to the project root.

If you extend the project in a conceptually new way (new types of nodes, new semantics),
update this document so future agents don’t have to reverse-engineer intentions from code.

---

## 10. Layered architecture: A (Lernziellandschaft), B (Lernverläufe), C (LLM/MCP)

This project is intended as the *lower layer* of a larger architecture.  
We distinguish three levels that should stay conceptually separated:

- **Layer A – Lernziellandschaft (competence landscape)**  
- **Layer B – Individuelle Lernpfade & Mastery**  
- **Layer C – LLM-gestützte Navigation via MCP**

### 10.1 Layer A – Lernziellandschaft

Layer A contains the **static, curriculum-level description** of a domain:

- A directed acyclic skill graph with:
  - nodes = learning goals (atomic + cluster),
  - edges:
    - `contains` for structural hierarchy (Themenfelder, Halbjahres-Cluster, etc.),
    - `requires` for didactic prerequisites.
- All domain metadata lives here:
  - `phase`, `area`, `themenfeld`,
  - `level` (Anforderungsbereich I–III),
  - `leitideen` (L1–L5),
  - `kompetenzen` (K1–K6, ggf. mit Subcodes),
  - `courseLevel`, `sourceRef`, `examples`, …

**Representation strategy:**

- Conceptually, Layer A is **pure data**, ideally representable as JSON (or a similarly simple format) so that:
  - it can be reused by different frontends and tools,
  - other curricula or Themenwelten (z. B. Physik, Informatik, Brückenkurse) can be added as additional landscapes.
- In this repo, the JSON files under `curricula/**/json/` are the **concrete encodings** of each landscape:
  - e.g. das hessische *Kerncurriculum Mathematik gymnasiale Oberstufe* (KC 2024) sowie Physik (KC 2024) als DAG-Dateien.

Agents working on Layer A should think in terms of:

- “Which bullet / table row in the curriculum does this goal correspond to?”
- “How does this new goal fit into `contains` and `requires` without breaking the DAG?”

Layer A is **shared across all learners**; it does not contain any individual performance data.

#### Curriculum release packages

The long-term publication target for Layer A is one fachlicher release in two equivalent package variants:

* a self-contained JSON runtime package that is the normative fachlicher input for SkillPilot;
* a Lehrplan-Ontologie package derived Core-first from that exact JSON artifact, with explicit application extensions only where the Core cannot express the required semantics.

The two variants are build artifacts of one normalized content state, not independently authored sources. A release is valid only if the ontology package can be transformed back, without a hidden copy of the original JSON, into the same normalized runtime content and byte-identical binary assets. An external release index binds both artifact hashes and the shared semantic content digest.

SkillPilot runtime code should consume versioned package manifests and artifact roles, not infer curriculum semantics from repository paths. The JSON package must include the transitive runtime closure, composition views, cards, resources, and visualizations needed for standalone operation. Embedded cross-package goals retain ownership metadata; jointly installed packages may provide the same stable goal ID only when their canonical definitions are identical. Authoring repositories, build tooling, and the SkillPilot runtime may be separated after this package contract and a package-only runtime path are stable.

The first public contract profile is `full-standalone-v1`. Compiled release goals carry an explicit `semanticKind`; ontology tooling must not derive Core semantics from titles or subject-specific ID patterns. Public stable releases are authenticated by a trusted signature over an external release index that binds both package variants and their equivalence evidence.

Package validity and publication permission stay separate. `review-required` records use `licenseExpression: null`, remain usable for technical staging tests, and must fail the redistribution-readiness gate. Never infer a license from provider, provenance, AI-generation, or curation labels. Human decisions for image quality, redistribution, or source verification are hash-bound; content drift makes them stale. Machine source-text matches reduce the manual queue but never count as human or legal approvals, and complete extracted official-PDF text must not be committed merely as verification evidence.

Reference:

* `docs/concept/skill-graph/dual-curriculum-package-releases.md`
* `docs/dev/dual-curriculum-package-implementation-status.md`

### 10.2 Layer B – Individuelle Lernpfade & Mastery

Layer B describes, for a fixed Layer‑A graph, the **state of a concrete learner** (or group):

- For each learner ℓ and goal g:
  - `mastery_ℓ[g] ∈ [0,1]` as in Section 4 (0, 0.5, 1 currently in the UI).
- **SRS/memorization goals** are an exception:  
  their mastery is **computed from the SRS state** (no cards due today)  
  and **not** manually set by a learning coach or LLM.
- Optional:
  - history of visited goals, tasks, timestamps,
  - teacher comments / annotations,
  - learner preferences (z. B. „mehr Stochastik“, „erst Analysis abschließen“).

Navigation support on Layer B should:

- Use the **Frontier** definition (Section 5) to propose “nächste sinnvolle Lernziele”:
  - only suggest g if all `requires` are sufficiently mastered,
  - prefer goals with low mastery and high weight.
- Allow both:
  - *guided* navigation (Lehrer:in wählt Ziele aus, Frontier dient als Check),
  - *self-directed* navigation (Lernende sehen Frontier + Kontext, wählen selbst).

Implementation-wise:

- Layer B is **per-learner data** and should be persisted separately (database, files, …).
- The current React app keeps a single in-memory `mastery` map as a prototype of this layer.

### 10.3 Layer C – LLM-/MCP-Integration

Layer C connects the skill graph and learner states to **LLM-based agents**.
The intended architecture:

- An MCP server (or a set of servers) exposes:
  - **read access** to Layer A:
    - list of goals, neighborhood of a goal, themenfeld/phase filters, frontier computation primitives,
  - **read/write access** to Layer B:
    - get/set mastery for learner ℓ and goal g,
    - log that a task was attempted / solved,
    - derive learner-specific frontiers or summaries.
- MCP clients (e.g. ChatGPT with MCP support) connect to this server.  
  The LLM (e.g. GPT‑5.1) acts as:
  - navigator on the skill graph (“Welche Ziele passen als nächstes?”),
  - didactic assistant (Erklärungen, Aufgaben, Reflexionsfragen),
  - broker between learners/teachers and the underlying data.

Key principles for Layer C:

- The LLM **does not own the ground truth** about goals or mastery:
  - it always reads/writes via MCP tools/resources,
  - it respects `requires`/`contains` constraints coming from Layer A.
- The same provider-neutral application behavior should be reusable by
  conversational UIs and other services. External MCP/Action contracts remain
  provider-specific because authentication, context recovery, tool schemas,
  widgets, and retry semantics differ. Do not force them into one universal
  `submit_turn` or one-size-fits-all schema.
- The strategic public OpenAI coach channel is a provider-hosted plugin per
  contract major. It combines one language-neutral English control-plane skill
  with the corresponding language-neutral MCP server submitted directly for
  review. A local or
  workspace pilot may map an already registered MCP connection through
  `.app.json`; that compatibility wiring is not the public MCP submission.
  Learners can use the model under the provider's free access or fixed-price
  consumer subscription without SkillPilot paying metered inference costs. The
  plugin packages and distributes the capability; the skill controls repeatable
  dialogue and tool orchestration; the MCP server exposes live data,
  authentication and controlled actions; SkillPilot owns all fachliche state,
  authorizes every domain mutation, and exposes only passgenaue
  provider adapters. The backend-selected learning session language controls
  every learner-facing payload and response. A first-party SkillPilot model orchestrator is not
  the target while this direct-provider-billing requirement remains hard.
- The multilingual OpenAI MCP App separates two server-owned bindings:
  - OAuth 2.1 authenticates the registered confidential App connection.
  - An independent, absolute 24-hour learning session addresses one learner for
    fachliche tool use. It is created anew only by `Lernen starten` in the
    first-party SkillPilot UI after permanent-ID, provider-notice, curriculum,
    stage, subject, course-profile and personalization configuration there. It
    is never extended by OAuth refreshes or MCP calls, enters the provider flow
    only in the short prepared start message, and is passed unchanged as
    `learningSessionId` to every fachlicher MCP call. OAuth alone never chooses
    the learner, and the permanent SkillPilot ID never becomes an MCP argument.
  OpenAI attaches the OAuth bearer token to MCP requests automatically. The
  backend requires both proofs and resolves the learner only through the
  learning-session mapping. Because ChatGPT exposes no stable conversation
  identifier for this contract, `learningSessionId` is explicit application
  state, not a provider-conversation or MCP-transport session.
- Guided curriculum personalization is an explicitly authored entry protocol,
  not a projection of the skill graph:
  - a curriculum root may declare a versioned top-level `personalizationFlow`;
  - stages, groups, order, cardinalities, landscapes, and filter sources come
    only from that flow and the referenced landscape metadata;
  - `contains`, `requires`, frontier, applicability, composition views, tags,
    labels, subject names, jurisdictions, and hard-coded IDs must never invent
    a personalization decision;
  - an absent flow means no mandatory guided personalization; a malformed
    authored flow fails closed;
  - first-party authored-flow hosts submit the currently published opaque
    `optionId` unchanged. Labels are presentation only and are never mutation
    keys; the OpenAI V1 coach does not mutate this Level 2 configuration;
  - if a group has met its minimum but not its maximum, the plan publishes an
    opaque `COMPLETE_GROUP` action; only this action, or reaching the maximum,
    closes that concrete group instance. Optional groups use the same action
    to close with zero selected values;
  - provider projections expose the current decision label plus
    `minSelections`, `maxSelections`, and `selectedCount`; adapters must not
    infer cardinality or completion from labels or transcript wording;
  - mutations re-resolve the active flow under the learner row lock and persist
    only the selected landscape plus its exact authored filter;
  - a selected landscape outside the old graph closure is usable only when a
    valid active flow explicitly offered it. Arbitrary persisted configuration
    must never expand the runtime landscape set.
  Neutral, synthetic multi-stage contract tests are required so a concrete
  Hessen, Mathematik, or course-profile example cannot become runtime logic.
- Every normal model-facing learner state must pass through the shared safe
  projection: no permanent SkillPilot ID or copy-source IDs, and no exam solution,
  passing threshold, source-artifact path, or scoring rubric.
- Released exam evaluation material is a separate, explicitly authorized backend
  use case. Legacy provider-hosted chats enforce answer-before-evaluation only by
  instruction. Target MCP Apps must use a widget-backed
  `start -> submit -> receipt -> evaluate -> record` attempt so the backend can
  prove submission before releasing protected evaluation material.
- Exam grading is criterion-based, not an exact match against the released
  solution. The solution is a non-exclusive reference; subject-correct equivalent
  results, representations, permitted rounding, explanations, and alternative
  methods receive equal credit unless the task or rubric explicitly requires a
  particular answer form; explicit requirements remain binding. Exam submissions
  are graded conclusively without follow-up questions. Providers identify
  illegible work as such and score only reliably visible evidence; they must never
  invent a specific subject error from unreadable handwriting or image content.

In the long run, multiple landscapes (different Fächer, Curricula, Sprachräume) can live in Layer A,  
while Layer B maintains separate mastery maps per learner and landscape,  
and Layer C provides a **unified, sprachbasiertes Interface** auf diese Strukturen.

### 10.4 File formats & persistence (PoC conventions)

To keep the architecture transparent and repo-friendly, we use simple JSON files during the PoC:

- **Layer A (landscapes)**
  - Stored under `curricula/` (e.g. `curricula/<...>/json/<file>.json`).
  - Root curricula are explicitly listed in `curricula/curriculum_manifest.json` and validated in CI.
  - In the current repo they are maintained directly as committed JSON files; there is no `export:landscape` pipeline at the moment.
  - Fields follow `SkillLandscape` / `LearningGoal` in `app/src/landscapeTypes.ts`; the backend mirrors these structures in its landscape loader types.
  - `shortKey` is an optional ASCII identifier for cross-layer references. Current committed landscapes may still omit it, so runtime code must tolerate deterministic fallback derivation from `id`.

- **Layer B (learner state)**
  - Conceptually this can be represented as `learners/<learnerId>.json` in a file-based PoC.
  - Current implementation in this repo persists learner state in the backend and also uses browser-local prototype state for some UI flows; there is no committed `learners/` directory in the repository today.
  - Schema draft (if file-based snapshots are used):
    ```json
    {
      "learnerId": "alice",
      "landscapeId": "hessen-math-upper-secondary",
      "mastery": {
        "math_go": 0.0,
        "e_rate_avg": 0.8
      },
      "meta": {
        "lastUpdated": "2025-03-01T12:00:00Z"
      }
    }
    ```
  - Runtime/API calls currently use goal IDs / goal keys as returned by the backend.
  - If `shortKey` is available in a landscape, it is a good human-readable external reference, but consumers must handle missing `shortKey`.
  - During the PoC we can load/save these JSON files directly. Later they can move into a database or service, but the schema should remain stable so MCP tools/users can rely on it.

- **Layer C (MCP resources/tools)**
  - MCP resources should point to specific landscape or learner files (e.g. `resource:skillpilot/landscape?hessen-math-upper-secondary`).
  - MCP tools (`get_frontier`, `set_mastery`, etc.) should internally operate on the JSON schemas above. They should never assume a particular curriculum language; all metadata fields use US-English so other landscapes can be added with different locales (German, English, …).

These JSON conventions let us run the full SkillPilot proof-of-concept without additional infrastructure, and they keep the project open to future landscapes, languages and persistence layers.

### 10.5 Canonical Gymnasium convergence (transition strategy)

For German Gymnasium curricula, the long-term target is a **canonical competence layer per subject** that spans Sekundarstufe I and Sekundarstufe II and can be viewed through state-specific curriculum filters.

Practical rollout rules:

- Do **not** duplicate canonical goals per Bundesland.
- Keep existing state-specific landscapes alive during transition as **legacy views**.
- The convergence started from the Hessen upper-secondary source tree. That tree is retired and must stay absent from the active repo; its retained evidence lives under `curricula/DE/Gymnasium/input/HE/`, and the canonical layer under `curricula/DE/Gymnasium/canonical/`.
- For Sekundarstufe I, use **G9 year levels 5-10 as the first canonical reference grid**. If source materials come from tracks with different total duration such as G8 vs G9, normalize them initially onto the matching year-level buckets instead of creating separate canonical G8 and G9 goal sets.
- When legacy source material must survive the migration outside the canonical graph, keep it **bundeslandspezifisch** in DE-level retained-asset lanes. This applies not only to `abi/`, but also to source snapshots, curriculum-owned input bundles, exam blueprints, release notes, and similar state-owned materials.
- Treat retained state-owned source JSON under paths such as `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/` as frozen source evidence; do not rewrite those snapshots just to host canonical convergence.
- Use a **small mapping layer** from legacy goal IDs to canonical goal IDs instead of introducing a large new abstraction stack too early.
- When a Bundesland must be represented explicitly in metadata, filters, overlays, or APIs, use ISO 3166-2 codes such as `DE-HE` and `DE-BY`.
- Place canonical Gymnasium subject landscapes on a Germany-level path, not under a single Bundesland subtree; source ownership and canonical ownership should stay visibly separate in the repository layout.
- When different Bundeslaender or duration models (`G8`/`G9`) need different learner-facing upper tree shapes for the same canonical subject graph, prefer separate scope-specific composition-view files over runtime reparenting or duplicated atomic goals. Use `scope.durationModel` only as a projection discriminator; do not create separate canonical G8/G9 goal sets.
- Use a didactically closed **subtree** as the primary migration unit; operational states are `legacy_frozen`, `subtree_adopted`, `cutover_ready`, and `legacy_view_retained`.
- The existing repository directory layout such as `curricula/DE/HE/...` may remain unchanged during transition; path segments are not the canonical public identifier contract.
- Keep Custom GPT / MCP / API contracts as stable as possible; translation between legacy and canonical layers should happen in backend/runtime logic, not in prompt logic.
- Preserve **multi-subject navigation** and allow selected cross-subject `requires` edges where didactically justified, e.g. Mathematik -> Physik.
- Prefer one DE-level school root such as `Gymnasium (DE)` in learner-facing curriculum selection, with subject landscapes as child modules.
- Keep course-level filters such as `GK` / `LK` on the child subject landscapes.
- Put Bundesland filters such as `DE-HE`, `DE-BY`, and `ALL` on the shared DE-level root and propagate them runtime-side into the selected canonical child landscapes.
- Target runtime filtering for canonical Gymnasium should converge toward compiled node-level `applicability` metadata derived from mappings, provenance, and validated filtered-graph rules, rather than depending permanently on recursive runtime inference.
- For a resolved Gymnasium learner-facing scope, the preferred steady-state artifact is a compiled single-occurrence tree projection derived from a reviewed composition view plus canonical subtree expansion.

Operational consequence for Sek I:

- Preserve the original source labels such as `G8`, `G9`, or state-specific year naming in provenance, mapping files, and archived input material.
- But keep the first canonical authoring and migration target aligned to year levels `5`, `6`, `7`, `8`, `9`, `10`.
- Where G8/G9 matters for a learner-facing Bundesland view, carry it as `durationModel`/`durationModels` in source-extraction metadata and source registries, and as `durationModel` in goal placement contexts and composition-view scopes.

Operational consequence for retained assets:

- If a file or directory is kept because it remains relevant after canonical cutover, archive it under a DE-level state lane such as `curricula/DE/Gymnasium/input/HE/...` or `curricula/DE/Gymnasium/input/BY/...`.
- Treat the retained Hessen `abi/` assets under `curricula/DE/Gymnasium/input/HE/abi` as the model example for this rule, not as a special one-off exception.
- For official curriculum sources, commit the structured reference and extraction state, not necessarily the original PDF/HTML working copy. `sourceDocument`/`sourceDocuments` entries with official HTTP(S) URLs, titles, and roles are the durable source-of-truth in Git; local PDFs/HTML files are cache/work artifacts for extraction and may remain ignored by `.gitignore`.
- A green source-readiness state means the source situation is explicitly decided for every claimed scope dimension (Bundesland, subject, Sek I/Sek II, and G8/G9 where relevant), the official reference is usable, and any local working copy needed by the current pipeline can be reproduced or is present locally. It must not mean "the PDF is committed to Git."

Operational consequence for human-readable source rationales:

- A generated source rationale is a view over existing provenance evidence, not a new source of truth.
- Long-term explainability covers every learning goal and every direct `requires` / `contains` relation in a knowledge landscape.
- Relation rationales may explain a direct source statement, a reviewed mapping decision, a derived graph-modeling rule, or a didactic sequencing decision; do not pretend every edge is a direct curriculum quote.
- Prefer the classic reviewed source route first: canonical goal -> mapping review decision -> source extraction -> official source document.
- MEM/FWU SPARQL evidence may be added as a secondary or future primary route only with explicit route status such as consistent, review-needed, unavailable, or source-version-gap.
- Public source-rationale text should explain how to reach the original source and why the mapping supports the SkillPilot goal, while avoiding long copied source passages.
- GPT/MCP integrations must retrieve and summarize structured rationale evidence instead of inventing provenance.
- Reference: `docs/concept/skill-graph/human-readable-source-rationales.md`.

Detailed rollout plan:

- `docs/concept/skill-graph/canonical-gymnasium-rollout.md`

---

## 11. SkillPilot ID and privacy model

SkillPilot is designed to work in school contexts but should also scale to **any subject, level and region**.  
To keep the architecture simple and privacy-friendly, we separate:

- **Curriculum data (Layer A)** – public, static landscapes,
- **Learner state (Layer B)** – per‑learner mastery and history,
- **Language models / tools (Layer C)** – stateless compute that only see what they need.

### 11.1 SkillPilot ID – pseudonymous learner key

The SkillPilot server should treat every learner as a **pseudonymous profile** identified only by a server-generated key:

- `skillpilotId` – random, opaque token (e.g. 128‑bit, URL‑safe string).
- The server stores for each `skillpilotId`:
  - the learner’s mastery map per landscape,
  - optional history and technical metadata (`createdAt`, `lastUpdated`),
  - but **no personally identifying information** (no real name, no e‑mail, no school IDs).

Guiding principle:

- The skill graph knows only **“learner X with skillpilotId …”**, not who that person is in the real world.

### 11.2 What lives where?

**Server-side (SkillPilot backend)**

- Stores:
  - landscapes (`curricula/**/json/*.json`) – public curriculum-level descriptions,
  - learner state per `skillpilotId` – pseudonymous mastery and history.
- Does **not** store:
  - names, nicknames, e‑mails, or other PII.

**Language model / SkillPilot Learning Coach**

- May ask for a *nickname* to address the learner in the conversation, but must
  never ask for, display, or receive the permanent `skillpilotId` through an
  external AI adapter.
- The current OpenAI MCP App never receives the permanent
  `skillpilotId`. `Lernen starten` inserts a newly created
  `learningSessionId` automatically into the prepared start message, and
  ChatGPT passes it unchanged as a required argument to every fachlicher tool
  call. OAuth authorizes the registered App connection; the backend resolves
  the learner only through the independent learning-session mapping, never
  through an OAuth subject alone. The coach must not ask the learner to copy,
  re-enter, or repeat the session value.
- The paused Claude/MCP adapter resolves an authenticated opaque OAuth subject
  internally and has neither `skillpilotId` nor OAuth credentials as model tool
  parameters.
- German, English and later supported interaction languages use the same App
  registration for a given contract major. Widget-only selection references may be returned
  in tool-result `_meta`, but must never appear in user-visible content or
  model-visible `structuredContent`.
- Provider-neutral backend services may use the SkillPilot ID internally after
  the provider-specific trusted temporary context has been resolved. For the
  current OpenAI MCP App, this resolution happens only through the
  explicit learning-session mapping under a valid OAuth-authorized App request,
  not through the OAuth subject. That internal implementation detail must not
  leak into the external model context.

**User-local (browser / ChatGPT UI)**

- The learner is responsible for:
  - keeping their `skillpilotId` somewhere safe (e.g. in the browser, a notes file),
  - deciding which nickname they share with the learning coach or teacher.
- The current MCP-App transcript may contain the automatically inserted
  `learningSessionId` in the prepared start message. It must not contain the
  permanent `skillpilotId` or any additional access or technical selection
  credential, and the coach must not repeat the learning-session value.
  Human-readable learning-goal IDs may still be shown when they are
  intentionally part of the learning product rather than access credentials.
- The rollback-only Visible Session Custom GPT does place a temporary token in
  every response footer; that separate relay convention must not be copied into
  MCP-App workflows.
- Local frontends (web GUI, notebooks, etc.) may:
  - store the `skillpilotId` in local storage or cookies,
  - remember additional preferences or display names **locally only**.

### 11.3 API / Tools conventions

Distinguish trusted browser/domain APIs from provider-facing AI contracts.

Trusted browser and internal domain endpoints may use `skillpilotId`, provided it
is always treated as an opaque pseudonymous access key and never as a name or
email address. Typical browser/domain endpoints include:

  - `POST /learners` → returns a new `skillpilotId` plus initial state,
  - `GET /learners/{skillpilotId}/state` → returns unified state (Curriculum + Frontier + Goals + `stateMachine`),
  - `POST /learners/{skillpilotId}/mastery` → updates mastery and returns **new frontier** immediately,
  - `POST /learners/{skillpilotId}/scope` → sets focus (e.g. "Stochastik") and updates planned goals,
  - `POST /learners/{skillpilotId}/active-goal` → locks the current atomic goal for the learning-coach loop.

Provider-facing contracts must use derived temporary context instead:

- Rollback-only Visible Session Custom GPT: the browser calls
  `POST /api/ui/learners/{skillpilotId}/visible-chat-start`; the GPT then uses only
  the nine locale-specific
  `/api/ai/{lang}/sessions/{chatSessionToken}/visible/...` Actions. Values needed
  after a user turn are visible in the footer, numbered selection, full canonical
  goal ID, or Recall card prompt.
- Paused Claude/MCP: the transport authenticates an OAuth connection subject and
  resolves it inside the backend. The model never supplies a learner ID.
- Current multilingual OpenAI MCP App line `SkillPilot Coach v1`: OAuth authorizes the fixed registered App
  connection but does not select or identify the learner. `Lernen starten`
  atomically creates a new independent learning session with an
  absolute lifetime of at most 24 hours and inserts its
  `learningSessionId` into the prepared start message. Every fachlicher tool
  requires both a valid OAuth-authorized App request and exactly that current
  `learningSessionId`; the backend selects the learner only through the
  learning-session mapping. OAuth refresh, tool calls, retries, and ChatGPT
  reconnects must not extend the learning session. Before every new
  session-bound read or write, the backend requires at least `PT1H` of remaining
  absolute validity. Exactly one hour remaining is valid; less than one hour
  returns `SESSION_RENEWAL_REQUIRED` before the fachliche operation executes.
  A retry of an already committed write with the same tool name, canonically
  identical arguments, and the same `clientRequestId` may still replay its
  stored result only while the session itself has not expired and its pinned
  workflow and curriculum versions remain available; that replay performs no
  operation and no second mutation. Missing, invalid, or expired sessions
  return `SESSION_REQUIRED`, and unavailable pinned workflow or curriculum
  revisions return `SESSION_VERSION_UNAVAILABLE`. None is an OAuth failure.
- Before every learner-facing OpenAI V1 coaching response,
  `get_skillpilot_context` must succeed in that assistant turn. A mutation
  result does not waive this pre-response validity and freshness check.
- The OpenAI V1 model contract has no sessionless start tool, provider-side
  SkillPilot-ID input, or in-chat renewal. Without a current
  prepared start message, the coach gives only a short localized instruction
  to configure SkillPilot at `https://skillpilot.com/` and use **Lernen
  starten**, then stops. This is the sole locale exception: with no prepared
  session or context, it uses German for a German conversation and English for
  an English conversation only for that fixed instruction; this does not set a
  session locale. On `SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED`, or
  `SESSION_VERSION_UNAVAILABLE`, it outputs `instruction` unchanged. If only
  `instructions` is available, it selects the exact entry using the last
  authoritative `communicationLocale`, otherwise the current conversation
  language. It includes the exact `startUrl` only if the selected instruction
  does not already contain it, gives no fachliche response, and neither retries
  the old session nor reconnects OAuth. The first-party UI creates a fresh
  session and opens a new chat.
- The first-party endpoint
  `POST /api/ui/learners/{skillpilotId}/openai/v1/launch` accepts the optional
  live-test-only JSON field `diagnosticSessionTtlSeconds` only while
  `SKILLPILOT_OPENAI_COACH_V1_DIAGNOSTIC_SESSION_TTL_ENABLED=true`. Its integer
  value must be between `3601` and `86400` seconds inclusive and must not exceed
  the normal `PT24H` learning-session lifetime. It affects only the independent
  session created by that one request; the next request without the field uses
  `PT24H` automatically. Prefer `3660` seconds for an approximately
  one-minute transition across the `PT1H` action guard or `5400` seconds for a
  90-minute soak. Never lower the global learning-session TTL for this test, and
  disable the diagnostic gate again after the live check.
- The V1 public MCP endpoint and its exact OAuth Resource/Audience are both
  `https://mcp-coach-v1.skillpilot.com/mcp`. Protected-resource metadata
  is published at the RFC 9728 path-insertion URL
  `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp`,
  and the OpenAI domain challenge is scoped to the same dedicated host. No
  public compatibility alias exists. The future major hosts
  `mcp-coach-v2.skillpilot.com` through `mcp-coach-v9.skillpilot.com` are
  reserved and fail closed with `404`; only V1 is active. Earlier
  `mcp-coach-de-v*` and
  `mcp-coach-en-v*` names were unpublished local infrastructure and are not
  compatibility routes. The still-unpublished `1.0.0` draft binds exactly two
  active, hash-bound MCP Apps resources: the image-only goal renderer and the
  interactive memory-practice launcher. Previously advertised start and
  image hash URIs remain byte-identically readable as passive resources, but no
  active tool binds the retained start resources. Ordinary
  coaching, selection, mastery, Verified Recall, and exam flows remain normal
  MCP/chat flows without UI bindings; the memory-card review write is app-only
  and has no output template of its own.
- OpenAI MCP uses one App, public tool catalog, endpoint and
  registration per contract major, not per language. Plugin metadata, skill
  instructions, tool names, descriptions, schemas and stable machine values use
  neutral English. The backend pins the interaction language in the learning
  session and returns learner-facing payloads in that language; the model must
  communicate exclusively in that session language and must not infer it from
  the English control plane or host locale. Direct widget choices
  and answer submissions use app-only tools; later model turns reload current
  state through fachliche tools that also require the unchanged
  `learningSessionId`. Learner identity comes from the backend-owned
  learning-session mapping, not OAuth or conversation memory.
- Any new provider adapter must define its own minimum data projection and
  authentication/context boundary. Do not expose the permanent SkillPilot ID just
  because an internal facade accepts it.

LLM/learning-coach prompts should reinforce that:

- Nicknames are for **conversation only**.
- The permanent SkillPilot ID is never requested or exposed by an external AI.
- Persistence uses a valid OAuth-authorized App request plus the backend-owned
  mapping of the current `learningSessionId`. The prepared start message
  transports that temporary reference automatically; the learner never copies
  or re-enters it, and the permanent SkillPilot ID never enters the
  conversation.

---

## 12. AI Agent Integration (OpenAI MCP Apps, ChatGPT fallback, Claude & Gemini)

SkillPilot keeps its learning-state decisions provider-neutral in the backend and
uses separate provider-specific adapters. The current multilingual OpenAI
channel is the provider-hosted MCP App with a chat-first tool contract
and one bounded read-only image-only MCP Apps UI result; its target packaging
combines that registered connection with a language-neutral English control-plane skill as
documented in
`docs/concept/runtime-workflows/skillpilot-owned-coach-architecture.md`. The
Visible Session Custom GPT remains a rollback package and must stay isolated
from the MCP-App implementation.

The billing boundary is a hard product requirement: the learner uses the model
under the provider's available free access or fixed-price consumer subscription.
SkillPilot must not make or relay a metered model-API call for this coach path.
The provider owns model inference and the free conversational turn; SkillPilot
owns only the authenticated domain state and deterministic application tools.
Under the current OpenAI App guidelines, the published OpenAI channel must not
explicitly target children under 13. Do not infer age from grade or curriculum;
exclude that age group from this provider channel unless a later authoritative
provider policy and product review explicitly permit it.

### 12.1 Key Features for AI

- **Backend authority:** curriculum, personalization, scope, frontier, active goal,
  allowed transitions, Mastery, Verified Recall, and exam evaluation remain
  backend decisions.
- **Target OpenAI plugins:** maintain one public submission per contract major,
  not per language. V1 combines one neutral English coach-control skill with one
  directly submitted MCP server, stable tool names and descriptions, endpoint,
  App registration and test suite. The backend-owned
  learning session pins the interaction language; all learner-facing payloads
  arrive in that language and the model must use it exclusively. Local pilot
  packages may reference the registered connection through `.app.json`.
- **Coach-skill boundary:** coaching role, dialogue, didactic scaffolding, tool
  sequence, response format and bounded error behavior belong in the skill.
  MCP server instructions contain only short cross-tool invariants; per-tool
  conditions stay in tool descriptions; current-step instructions stay in fresh
  tool results. Authorization, state-transition and already implemented safety
  guarantees stay in backend guards. Chat-only evidence is not a hard guarantee
  until a server-side evidence or submission receipt exists. The skill is never
  a source of learner state or authorization.
- **Coach-content source:** synthesize the neutral English skill from the behavior that
  worked well under `ai/openai custom gpt/`, especially its established system
  instructions and learning-coach, Mastery, exam, state-machine, error and
  resource guidance. Do not copy obsolete `startCode`, `chatSessionToken`,
  Action-operation, visible-relay, or model-built deep-link mechanics. Later
  fachliche corrections and the current MCP/backend contract take precedence.
- **MCP-App state rule:** user-facing labels and released learning content belong
  in `content` / `structuredContent`. Permanent-ID handling and Level 2
  curriculum or personalization configuration stay in the first-party WebGUI;
  V1 exposes neither their choices nor their mutation tools to the model.
  Widget-only click references remain in result `_meta` and app-only tools apply
  them directly. The
  `goalVisualization` projection is present only when the learner's default-on
  chat-visualization preference is enabled and an active atomic goal has a
  matching canonical image link. The dedicated read-only
  `render_skillpilot_goal_visualization` tool carries its dedicated
  `ui.resourceUri` and `openai/outputTemplate`; both bind the one active,
  hash-addressed image-only MCP Apps resource for that renderer. It passes bounded
  `goalVisualization` data in `structuredContent`, and the widget renders only
  the image after it loads successfully. The separate memory-practice launcher
  binds its own active resource, while its rating write is app-only. Ordinary
  context reads and other state mutations carry no UI metadata and never create
  a UI box. No user-agent or
  client-surface gate changes this contract. When the newest full result
  contains `goalVisualization` and permits the renderer, the model calls it once
  with that result's unchanged goal and copies the top-level state version into
  the renderer input `expectedStateVersion`; stale attempts are neither reused
  nor retried. Every
  fachlicher model-facing tool, including state reads, receives the unchanged
  `learningSessionId` to rehydrate state after a new turn, reload, or context
  compaction.
- **OpenAI identity/session rule:** OAuth authorizes the registered App
  transport but does not select the learner. An independent, absolute 24-hour
  server-side learning session addresses the learner for fachliche tools. Only
  an explicitly confirmed first-party `Lernen starten` action creates a new
  independent session and opens a new chat; neither bearer-token refresh nor
  MCP activity slides its expiry. New session-bound operations require at least
  one hour of remaining validity, including the exact `PT1H` boundary. Below
  that boundary, the coach stops and returns only the server-owned WebGUI start
  instruction. Only a replay with the same tool name, canonically identical
  arguments, and the same `clientRequestId` for an already committed write may
  bypass the one-hour action guard while the session remains unexpired and its
  pinned workflow and curriculum versions remain available, because it
  executes no fachliche operation. Session recovery means “start a fresh
  learning session in SkillPilot and open a new chat”, never “reconnect OAuth”.
- **Prototype boundary:** `ai/openai app/` contains an executable neutral
  Streamable-HTTP MCP Apps mechanism prototype and local host simulation with
  localized demo payload catalogs. It exposes one control-plane contract rather
  than one contract per language. Its no-auth, single-demo-state store is never
  production auth. The production Spring Boot adapter requires OAuth App
  authorization plus an explicit database-backed learning-session mapping and
  uses `CoachToolFacade`; do not route real learner data through the demo store.
- **Rollback ChatGPT projection:** nine locale-specific Visible Session Actions
  consolidate setup and navigation into numbered choices, reload state on normal
  user turns, and protect Recall answers and exam solutions behind later Actions.
- **Visible cross-turn relay:** only the temporary session token, selection
  reference/numbers, canonical active-goal ID, and Recall card IDs are carried in
  conversation text when a later Action needs them.
- **Visible same-turn intake:** a natural multi-part request remains active only
  within the current assistant turn. Fresh uniquely matched selections may chain
  without displaying intermediate codes; a numbers-only reply is consumed by
  exactly one visible choice. This is a fallback optimization, not a replacement
  for the MCP-App target.
- **Provider-specific contracts:** German and English Custom GPTs have independent
  Instructions, seven Knowledge files each, and independent locale-fixed OpenAPI
  schemas. A one-size-fits-all schema is not allowed.
- **Paused Claude adapter:** the OAuth/MCP implementation remains disabled and is
  not production-ready. Personalization, shared safe state projection, and the
  protected exam-evaluation use case are implemented; release still requires a
  complete real adult-only end-to-end acceptance run.
- **Shared coach boundary:** `CoachToolFacade` owns provider-neutral workflow
  guards and `CoachStateProjection` owns the normal model-facing allowlist.
  Provider adapters resolve their own temporary session or OAuth identity and
  render passgenaue tool responses. See
  `docs/concept/runtime-workflows/provider-neutral-coach-boundary.md`.

### 12.2 Setup Guides
- **Google Gemini:** See `ai/google gem/gemini.md` for the current status notes.
- **ChatGPT Visible Session (rollback package):** See
  `ai/openai-custom-gpt-visible-session/de/gpt_setup_guide.md` and
  `ai/openai-custom-gpt-visible-session/en/gpt_setup_guide.md`. These guides
  update the two existing GPTs in place; they do not create new GPTs.
- **OpenAI MCP Apps:** See `ai/openai app/README.md` and
  `ai/openai app/TEST_AND_PLUGIN_HANDOFF.md`. The versioned multilingual source
  plugin lives under `ai/openai plugin/skillpilot-coach-v1`, directly declares
  the production MCP server plus its language-neutral English control-plane
  skill, and contains the real host-generated mapping for the registered V1
  pilot App. Preserve
  the App alias and `asdk_app...` value in `.app.json` exactly; the separate
  `plugin_asdk_app...` value identifies the remote plugin registration and must
  not be substituted into that file. The mapping is local pilot wiring, not the
  public MCP submission. Because the pilot package also retains its direct
  `.mcp.json` binding, host acceptance must prove from the tool trace that the
  registered App connection was used; a successful direct-MCP fallback alone
  is not combined Plugin-plus-App evidence.
  Package SemVer, Contract Major, release drafts, published snapshots,
  lifecycle states and major-line retirement follow
  `docs/concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md`;
  release operations follow `docs/deploy/openai-plugin-v1-release.md`.
  A not-yet-published package version may be refreshed repeatedly under
  `contracts/drafts/` without a SemVer increment. Only a confirmed publication
  may create `contracts/published/` and advance `release-index.json`; published
  snapshots are immutable.
- **ChatGPT (rollback only):** `ai/openai custom gpt/` retains the complete former
  setup and must stay unchanged so a coordinated rollback does not require Git
  archaeology. It is also the review-only content baseline for the new coaching
  skill; reuse its didactic meaning without reactivating its old transport.
- **OpenAPI specs are package-local:** The legacy rollback bundle owns
  `ai/openai custom gpt/skillpilot-api-4ai.de.json` or
  `ai/openai custom gpt/skillpilot-api-4ai.en.json`. The Visible Session package
  owns separate schemas under `ai/openai-custom-gpt-visible-session/de/` and
  `ai/openai-custom-gpt-visible-session/en/`. Do not place or treat a
  `skillpilot-api-4ai.*` file directly below `ai/` as a shared schema.

## 13. Curriculum Assets & Flashcard Decks
- **Source of Truth:** Flashcard decks (`*_deck.json`) and other curriculum-related assets must be stored in the same directory as the curriculum JSON files (e.g., `curricula/EU/CEFR/English_From_German/json/`).
- **Deployment:** These files are copied to `app/public/data/` during the build/deployment process to be accessible by the frontend.
- **Development:** When creating a new deck, save it in the curriculum directory and manually copy it to `app/public/data/` if testing locally.

---

## 14. LaTeX Rendering Context (Cockpit vs. Exam Mode)

For math formulas in task content, always distinguish between:

- **Stored/escaped LaTeX text** (e.g. `\\( ... \\)` in JSON or raw payloads),
- **Rendered math output** (when a math renderer is active in UI).

Important behavior rule:

- In **exam mode / assessment mode**, task blocks may need to be shown **verbatim**.  
  In that case, do not silently rewrite or "repair" escaped LaTeX formatting.
- In **Cockpit/normal learning views**, formulas can appear properly rendered because a math renderer is active.

Practical note for explanations to users:

- Raw `\\( ... \\)` means LaTeX is present as escaped text but currently not rendered.
- Proper inline rendering form is `\\( Q = 900\\,\\mathrm{kJ} \\)`; block form is:

```latex
$$
\eta = \frac{W}{Q}
$$
```

When users report "formulas are broken", first clarify whether the issue is:

1. content encoding (wrong LaTeX in data), or
2. rendering context (correct LaTeX, but no active math renderer in that view).
