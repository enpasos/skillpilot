## Stable Goals, Contextual Structure {#sec:context-model}

Sections~@ref{sec:context-model} through~@ref{sec:evidence-context} specify the contracts surrounding the skill graph: curricular structure, personal scope, goal types, time planning, and provenance and quality.

The skill graph answers *what* a learner should be able to do and which domain prerequisites are required for it. An educational program additionally answers *where* those goals are situated. A personal schedule determines *when* they are worked on. These three questions require distinct data: reorganizing a curriculum must neither mint a new competence nor erase previously stored learner outcomes.

The general goal model distinguishes four semantic layers and one presentation layer (Table~@ref{tab:layers}). It sets the direction for incremental migration; not every data structure named here is already implemented across all skill landscapes.

:::table {#tab:layers caption="Five modeling responsibilities over one shared set of stable goals." cols="27mm,X,X"}
| Layer | Meaning | Example and boundary |
| --- | --- | --- |
| Goals | Concrete competencies and subject clusters; `requires` and `contains` live here. | Solving a linear equation; foundations of linear functions. |
| Programs | Years, semesters, modules, phases, other structural units, and learning units (kind `learningUnit`). | Year 8 is an organizational container, not a competence. |
| Placements | Contextual link from a goal into a program unit. | The same goal is acquired in Year 8 in one program and in Year 9 in another. |
| Competency axes | Domain taxonomies and cross-cutting categories. | K1 “Mathematical reasoning” is a category; “identifying gaps in an argument” can be a concrete goal. |
| Composition view | Reviewed upper structure of the visible tree for a resolved educational scope. | A state-specific view references canonical subtrees without copying their goals. |
:::

### Identity Across Different Placements {#sec:identity-across-contexts}

The identity, attribute, and atomicity rules from Section~@ref{sec:core} apply unchanged across every layer. A new placement therefore creates no new competence. A program unit of kind `exam` is not yet an assessment goal with tasks, scoring rubric, and learner outcome. And `phase: Q1` creates neither a parent edge to a Q1 node nor a prerequisite edge between Q1 and Q2.

Legacy trees may still contain year and phase nodes as a compatibility scaffold. In the general goal model, explicit program structure assumes that role while subject goals remain independent. The same content can thus be arranged differently across multiple educational programs without copying its goal ID or stored learner results.

### Placements and Projections {#sec:placements-projections}

A *projection* derives a visible tree or another navigable view from the curriculum data. It is evaluated for a *resolved context* in which dimensions such as jurisdiction, school form, stage, duration model, and course profile are fixed.

In the target model, `programUnits` form an explicit tree or forest of program units, and `goalPlacements` attach goals to those units. A `primary` placement supplies the default program anchor; `secondary` indicates additional structural relevance, and `assessed` marks an assessment reference. Secondary and assessment placements never create extra visible copies of the same goal. Relation `own` records without context that a learning unit directly owns an atomic goal (Section~@ref{sec:unit-own-children}); it is not a program anchor.

Within a resolved context, exactly one matching primary placement yields a unique anchor. When no primary placement matches, the view must not invent a parent node. Multiple matching primary placements require an explicitly reviewed resolution contract; otherwise the projection is ambiguous. Context fields never alter the goal ID.

The default content view follows explicit `contains` edges alone. The program view follows program units and placements. The competency view follows catalog entries and competency references. Sibling order comes from the declared data order; topological sorting by prerequisites is a separately labeled didactic view.

### Reviewed Composition Views {#sec:composition-views}

A *composition view* specifies the visible upper structure of a curriculum through structure nodes, labels, child order, and references to canonical subtrees. It contains neither newly authored atomic goals nor new `requires` edges. Wherever such a view is authoritative for a resolved context, a renderer must not override it through guesses based on titles, `phase`, or alternative placements.

For example, a structure node “Mechanics” may carry a `canonicalSubtree` reference to the canonical Kinematics cluster, pulling in its reviewed `contains` substructure. Beside it, a `goalEntry` reference may attach the single canonical atom “Add forces vectorially.” Both reference existing canonical goals rather than authoring new ones. A structure node does not automatically become a domain cluster of kind `curricularArea`; that classification requires its own authoritative definition.

The compiled default tree must show each visible goal at most once and under at most one visible parent. A global DAG may have multiple content parents; projecting it to a visible tree therefore requires a deterministic, reviewed resolution rule. Overlapping subtree references are invalid without such a contract. A precedence rule for overlapping projection roles is never permission to duplicate goals in the visible tree.

Compilation should run early, in this order:

1. Resolve the context and select the matching composition view.
2. Expand canonical references and preserve their canonical atomic basis.
3. Retain complete prerequisite chains.
4. Validate projection roles and visible parents.
5. Emit the compiled artifact for the runtime.

The closure condition from Section~@ref{par:projection-closure} applies even when a view selects only a subset of canonical atoms. That makes structural validation possible before any user interface renders a tree.

#### Canonical identity is preserved.

A canonical cluster must never become an independently assessable or masterable atom through a direct reference or collapsed child display. This rule holds regardless of whether a separate `semanticKind` review exists. A collapsed presentation stands for its reviewed canonical atomic basis; prerequisite checks, progress, and completion retain that basis, fixed through `canonicalSubtree` or explicit references to the intended canonical atoms. Changing projections must never copy an existing cluster-ID value down to child goals.

A cluster authoritatively classified as `curricularArea` must not appear via a direct `goalEntry` reference as an opaque, seemingly atomic runtime goal. A `canonicalSubtree` reference preserves its reviewed descendants; alternatively, explicit view structure names the intended atomic goals. This presentation rule does not alter any projection role.

#### Implementation boundary of 9 and 10 November 2026.

The existing canonical resolver already traverses prerequisite chains recursively. In the 9 November 2026 audit, a legacy `goalEntry` path could still strip the children of a canonical cluster and expose it as an atomic runtime node. Since 10 November 2026, the personal learner runtime and the WebGUI resolve canonical atomic seeds and preserve the genuine target descendants of legacy direct cluster entries; other consumers as well as full native and curriculum admission still require their own verification evidence. Compatibility is never permission to author opaque substitute atoms; normal and strict mode retain their focus semantics.

:::sources
[General Goal System and Migration](repo:docs/concept/skill-graph/general-goal-system-and-migration.md); [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md).
:::

## Personal Scope, Focus, and Visible Goals {#sec:personal-scope}

### Four Levels of Personalization {#sec:four-levels}

Choosing “School,” “Higher Education,” or “Languages” is catalog navigation rather than learner scope. Only afterwards do the four personalization levels -- Level~1 through Level~4 -- begin. They must be kept distinct from domain learning units (Section~@ref{sec:learning-units}) and from the periods of an optional calendar schedule (Section~@ref{sec:levels}).

1. **Base Curriculum:** An explicitly selectable root curriculum provides the goal universe.
2. **Personal Curriculum:** The committed, longer-lived, backend-owned educational scope. For school curricula, it comprises the state or canonical context, the applicable eight- or nine-year secondary duration model (`G8`/`G9`), an explicitly resolved stage, the selected subjects, and their course profiles.
3. **Learning Focus and Active Goal:** One or more focus roots narrow the temporary working corridor; exactly one atomic goal is the immediate active target. Both focus and active goal are mutable.
4. **Mastery:** The binary outcome “mastered” or “not yet mastered” belongs to the stable atomic goal ID. Outcomes persist across view and focus changes; cluster progress is derived from them.

`GK` and `LK` denote basic and advanced course profiles (*Grundkurs* and *Leistungskurs*), and SkillPilot also uses them as technical projection labels; wherever official course structures differ, the explicitly declared mapping applies without asserting an identically named official course type. In the Bavarian Mathematics rollout, for instance, `GK` targets the complete compulsory four-hour Mathematics curriculum at elevated level, while `LK` targets those goals plus all five modules of the separate Mathematics *Vertiefungskurs*: using Level~3 focus to work on the three modules actually taught does not remove the other two from the Level~2 target, total progress, or completion, and does not assert that Bavaria offers Mathematics as a selectable *Leistungsfach*. Likewise, under the Product Owner decision of 16 October 2026, the Chemistry rollout includes all authored topics of the applicable scope in the initial target projection while deferring a preceding topic-selection flow -- including Schleswig-Holstein's officially optional medication theme in the interim `GK`/`LK` Chemistry target, while preserving its official optional status without claiming a universal curriculum requirement or learner selection. A course profile is a subject attribute and never implies a school stage; missing stage information remains unresolved.

Changing the Personal Curriculum revalidates the current focus and active goal against the new target set without deleting or writing global mastery outcomes. Configuring the Personal Curriculum is owned by SkillPilot's first-party WebGUI surfaces; the language-model coach connected through the concrete OpenAI V1 adapter reads that scope and neither presents nor mutates it.

Under the Product Owner decision of 10 November 2026, the complete personal learning basis is $L = \Closure(S)$ from Section~@ref{par:projection-closure}: the valid seed targets together with all necessary atomic prerequisites on the unpruned canonical skill graph. It remains fixed independently of mastery; existing valid mastery counts as satisfied rather than causing removal or forced repetition. A narrow focus restricts only the temporary working corridor. Necessary goals outside the focus remain authoritative for total progress and completion; completing a focus never completes the entire Personal Curriculum.

### Target Role and Prerequisite Support {#sec:projection-roles}

A reference inside a composition view may explicitly carry one of two *projection roles*:

:::description
- **`target`.** The goal belongs to the selectable learning set, frontier, progress, and completion of this view.
- **`prerequisiteOnly`.** The goal remains available for prerequisite checks with its global identity and stored state; within this view it is neither selectable nor counted in the local progress denominator.
:::

When omitted, the role defaults to `target`. Subtree references pass their role down to descendants. Overlapping role assignments are resolved by specificity: a direct `goalEntry` reference overrides subtree inheritance; a nearer subtree root overrides a broader one; only at equal specificity does `target` win. This precedence resolves the role rather than permitting duplicate visible occurrences.

Authored subject roles are never guessed from age or phase. By contrast, the explicitly authorized personal closure rule adds necessary atomic acquisition targets to the full plan $L$ without rewriting authored subject roles or inventing new dependencies. A mathematics goal can be a learning target in Mathematics and supporting prerequisite context in Physics while still being counted once in a joint plan. Its Physics role neither erases Mathematics outcomes nor creates a second competence acquisition. However, a genuinely necessary atom cannot remain mere prerequisite support across the entire Personal Curriculum without an acquisition target. Official curriculum assignment and inclusion as necessary preparation remain distinct claims. The backend and WebGUI implement the closed personal learning basis; applicability validation and complete acceptance of the current state remain separately evidenced.

At the personal compilation boundary, the Product Owner decision of 10 November 2026 supersedes the earlier blanket requirement of 7 November to manually reference every reachable prerequisite with an explicit role:

- Authored seed references and subject-local roles remain validated.
- A necessary atom's derived global target role, backed by a checked canonical prerequisite path and recorded provenance, suffices without a manual target or support reference per atom.
- Unknown references, cycles, and missing, unexposed, or unaccounted required atoms remain hard errors regardless of mastery and focus.

This compile-time validity check is distinct from later Level~3 focus selection: a validly resolved prerequisite outside the active focus still does not block normal mode.

Under the Product Owner decision of 11 November 2026, these hard errors belong to validation, curriculum QA, and native acceptance rather than to learner reads. When the canonical graph of a learning context is not strictly compilable, the runtime keeps the reviewed seed scope without the derived closure, claims no learning basis, offers no goal whose prerequisite demand is broken, and logs the failure once per curriculum and error code; learner state, results, and export stay readable. Errors in the seed selection itself remain hard errors. The rule covers the many non-canonical curricula whose root cluster contains and requires its own orientation goal and changes none of their data.

*Transition-data example:* Suppose a Physics goal $g$ requires a Mathematics cluster $k$. Its canonical atomic basis and transitive prerequisites are resolved prior to display filters. A subject-local `prerequisiteOnly` reference to $k$ may remain in Physics, yet every genuinely required atom still receives an acquisition target in the full Personal Curriculum -- whether in Mathematics or as derived preparation -- without manual per-atom references or enrolling an entire extra subject. Canonical identity, provenance, and mastery remain intact.

### Applicability Is Not Placement {#sec:applicability-vs-placement}

`applicability` holds compiled filter metadata for runtime views, such as a state filter. It is derived from inspectable sources, mappings, provenance, and reviewed overrides. It answers in which filtered contexts a goal is visible, whereas a placement answers where the goal sits inside a program structure. Neither datum is evidence of individual mastery.

For state-specific extensions, an explicitly declared inheritance boundary can prevent a broad ancestor source mapping from being reported as source provenance for newly added descendants; direct sources and mappings on the extension branch remain authoritative. Likewise, the visibility of a local practice or assessment endpoint may be derived from its prerequisites under a dedicated contract, establishing applicability without automatically asserting official source-curriculum coverage.

### Switching Focus Without Implicit Mastery {#sec:focus-switch}

A focus consists of the union of the selected focus roots and their visible descendants, intersected with the Personal Curriculum. Normal mode checks transitive effective prerequisites within that focus; explicitly selected strict mode checks them globally. In normal mode, an outside-focus prerequisite neither blocks availability nor becomes mastered by being masked. Section~@ref{sec:filter-modes} gives the formal frontier definitions.

Focus widening follows the unique visible parent path. Each backend-published widening option must form a strict superset and add at least one unmastered target goal. With multiple roots, it replaces only the covered branch and carries independent roots forward. The coach adopts the published option verbatim and waits for learner agreement before changing focus.

An automatic widening proposal is offered only once the current focus is genuinely complete; an empty frontier alone may indicate a blocked, incomplete focus rather than completion. After widening, newly included unmastered prerequisites are checked normally: mastering a dependent goal never writes mastery backward. By contrast, application recognition already derived under a valid local contract remains globally effective, so later consumers -- goals requiring that competence -- as well as subsequent plan or focus switches never reopen it.

:::sources
[Levels of Personalization](repo:docs/concept/levels-of-personalization.md); [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md).
:::

## Goal Types and the Meaning of an Outcome {#sec:goal-types}

For each goal, the skill graph receives only the finished binary outcome established under that goal type's workflow. The graph itself does not judge whether an explanation was convincing, an orientation dialogue closed appropriately, or every required flashcard was recalled reliably; those decisions belong to each goal type's completion contract.

Every learning goal has a binary outcome: mastered or not yet mastered. The goal type defines what “mastered” means. For a content goal, it means explicitly established understanding, while valid assessment derivation additionally attests independent application. For orientation, it marks completion of the motivational entry rather than a subject certificate. For memorization, it denotes passing the goal's own controlled recall check over the required cards. For an assessment goal, it denotes passing the assessment. Differences among completion workflows introduce neither partial mastery levels nor parallel goal outcomes. Table~@ref{tab:goal-types} summarizes the four goal types.

:::table {#tab:goal-types caption="The four goal types and the meaning of their binary outcome." cols="27mm,X,X,21mm"}
| Goal type | What “mastered” means | How the outcome is established | Implicitly derivable |
| --- | --- | --- | --- |
| Content goal | Understanding is established; under implicit mastery, independent application is attested. | Sufficiently evidenced mastery in the coach-led workflow (Section~@ref{sec:understanding}) or a valid local contract (Section~@ref{sec:assessment}). | yes |
| Orientation goal | Motivational entry is completed; not a subject-matter certificate. | Tailored follow-up, positive summary, and learner agreement to close (Section~@ref{sec:orientation}). | marker only |
| Memory goal | Completion recall over the required card deck is passed. | Verified recall of all required cards without card hints (Section~@ref{sec:memory}). | no |
| Assessment goal | The assessment is passed. | Rubric-based grading of the single complete submission (Section~@ref{sec:exams}). | no |
:::

### Understanding and Application {#sec:understanding}

A content goal describes conceptual or procedural understanding. Grading must cover the aspects demanded by the goal description. Solving a single task is one piece of evidence rather than automatic mastery of the entire goal: multi-step transfer within one task can suffice, whereas imposing an arbitrary minimum task count would be just as unfounded as crediting every isolated correct answer.

In the coach-led workflow, sufficiently evidenced mastery is persisted immediately, and the coach may report a saved outcome only once persistence is confirmed. Requesting separate learner consent before saving is not domain evidence and is not added as an extra completion gate for ordinary content mastery. Moving on to the next topic remains a separate choice: the coach offers the backend-selected next target and waits for recognizable learner agreement before starting new material.

### Orientation as a Distinct Completion Contract {#sec:orientation}

A goal authoritatively classified as `orientation` presents concrete possibilities and honest positive perspectives on the upcoming material. It tests neither prior knowledge nor terminology, calculation skills, recall, transfer, or exam performance. Like every learning goal, its outcome is binary; grading personal motivation on a percentage scale would be misleading.

The workflow proceeds in three steps:

1. **Follow-up.** When the learner picks one of the offered interests, the coach opens a tailored motivational follow-up linking that interest to something concrete the learner can understand, explore, shape, or do, and invites a low-pressure personal reaction, choice, or question. Merely repeating an offered label does not complete orientation.
2. **Summary.** After a meaningful response to that follow-up -- or an explicit wish to leave orientation -- the coach gives a positive summary together with a separate offer to close.
3. **Closure.** Only a further learner reply agreeing to that closure establishes the completion marker.

This workflow must neither be reinterpreted as a subject exam nor transferred to ordinary content goals. Orientation nodes are prerequisite-free atomic entry anchors; assessment and memory metadata never belong on the same node.

At a genuine zero-progress entry into a projected scope, open orientation goals are the only selectable frontier goals. Learners with established subject progress are not reset to this entry gate.

### Memorization: Practice and Verified Recall {#sec:memory}

A memory goal bundles the required cards of a flashcard deck. Three distinct concepts apply:

- **Card practice.** A spaced-repetition system (SRS) schedules card review intervals over time.
- **Verified recall of a card.** Controlled recall records whether an individual card was answered accurately without card hints; flipping cards or self-rating during practice does not constitute verified recall.
- **Goal completion.** Mastery of the learning goal itself is established by passing its own controlled completion check across the required deck -- *completion recall*.

Card-level process lanes and goal completion must remain distinct; they introduce neither a second mastery tier nor an extra stored goal outcome.

#### Completion condition.

Let $\operatorname{Cards}(g)$ denote the fully resolved, valid set of required cards for memory goal $g \in A_{\mathrm{mem}}$, and let $\operatorname{RecallPassed}(g)$ denote an explicitly established passing completion-recall check over that required card set. That goal-level completion check is neither a mere tally of current per-card flags nor an extra data field or separate assessment node:

$$
\Complete_{\mathrm{memory}}(g) \iff \operatorname{RecallPassed}(g).
$$

Missing or unresolved card definitions never count as an empty, automatically completed deck, and clearing a due practice queue never substitutes for completion recall.

#### Due dates do not withdraw completion.

Ordinary completed learning goals carry no recurring review due state. For memory goals, a subsequent card due date governs card practice rather than automatically withdrawing established goal completion. Likewise, a later voluntary card check updates that card's process lanes without automatically revoking completed goal mastery. The earlier conjunction “all cards verified and no card due” is superseded by the binding Product Owner clarification.

#### Card scheduling under SM-2.

The currently documented SRS contract tracks SM-2 (SuperMemo 2) state per card: interval, repetition count, easiness factor, and next review timestamp. Any card without stored state is due. Successful practice extends the interval under the documented rules, whereas insufficient recall resets the repetition sequence; scheduling never replaces verified recall.

#### Verified recall workflow.

From an active memory goal, the learner may start verified recall -- the *hard recall check* -- even while the SRS practice queue is non-empty. First only the card prompt is retrieved, and the learner answers without card hints; only afterwards is the expected answer loaded and the attempt recorded as passed or failed. Passing also updates the card's SRS lane as a strong successful retrieval, whereas failing clears the card's verified status and returns it to practice as due.

#### Implementation boundary.

Historical code inspection noted that `LearnerService` and `useSrsMastery` derive a value from current verified-recall flags. That observation neither authorizes withdrawing completed mastery nor proves full conformance with the completion contract above. This documentation clarification alters neither runtime behavior nor learner data; general completion accounting consumes the same binary goal outcome without introducing a separate memory-mastery tier.

### Assessment Goals in the Current Workflow {#sec:exams}

Assessment goals carry `examData` with task content, solution content, and a scoring rubric specifying maximum points, passing threshold, and gradable steps. For validly awarded step points $p_j$, the current contract sets:

$$
\Score = \min\!\left\{\sum_j p_j,\;\MaxPoints\right\}, \qquad \Passed \iff \Score \ge \PassingPoints.
$$

Step points follow the authored rubric criteria; the total-score formula alone legitimizes neither invented step points nor negative scores nor altered task prompts.

#### Access.

Ordinary learning access checks transitive effective prerequisites, including atomic satisfaction of required clusters. Assessment goals additionally grant general *direct assessment access*: missing preparatory mastery does not block an intentional assessment attempt, provided task availability, personal scope, and an authorized learner session hold. Existing direct assessment access must be kept distinct from the new global implicit-mastery derivation, which is **not yet implemented** on `main`.

#### Exam-mode workflow.

In Exam Mode, the learner receives the complete, verbatim task prompt and works through it without content hints. The single complete submission is graded strictly against the rubric. On pass, mastery is persisted immediately; on failure, neither an outcome nor a score is persisted and any existing mastery remains untouched. Only confirmed persistence authorizes reporting that the pass is saved.

#### Post-grading semantics.

After grading, the learner receives the outcome, score, per-step feedback, and model solution; new material begins only after a subsequent learner choice. Unlimited retries of the same task remain permitted. Seeing the solution may reduce the evidential weight of a later retry without creating a second qualification tier: stored exam mastery remains an explicit pass of that assessment goal. Broader application recognition requires a valid, domain-reviewed local contract; a legacy unreviewed scoring rubric does not satisfy that requirement automatically. Neither an extra per-learner qualification field nor a second partial assessment is introduced.

:::sources
[Node Types and Exam Workflow](repo:docs/concept/skill-graph/node-types.md); [Project Rules on Orientation, Evidence, and Continuation](repo:AGENTS.md); [Backend Derivation of Memory Mastery](repo:backend/src/main/java/com/skillpilot/backend/service/LearnerService.java); [Frontend Derivation of Memory Mastery](repo:app/src/hooks/useSrsMastery.ts).
:::

## Time Planning as a Complementary Overlay {#sec:time-context}

A schedule binds a declared planning scope, a curriculum revision, a calendar, available capacity, and a plan version. Absolute dates never belong on canonical goals, clusters, or placements: the same content can be studied at different times across courses without altering its canonical identity.

Time planning is an execution overlay rather than a fifth personalization level. It may prioritize goals currently available in the active working corridor, yet it creates neither prerequisite edges nor a new frontier nor learner outcomes. Whereas a learning unit expresses domain coherence, a dated schedule must additionally ensure that each prerequisite is scheduled in time before its planned dependents.

Available capacity accounts for actual instructional or study minutes after holidays, cancellations, and other exclusions. Planned activities, protected reserve, and committed subject budgets must fit within that capacity without double counting. Section~@ref{sec:levels} specifies the formal budget check and its requirement for calibrated effort estimates.

Planned targets and actual attainment share the same named scope. Explicit outcomes together with validly derived application recognition form global cumulative attainment; manual teaching-coverage flags neither establish nor conceal completion, and missing learner results remain visibly unavailable. New plan revisions must never silently reinterpret historical goals, stored outcomes, or past progress statements.

The documented local planning pilot and the target backend-owned architecture must be kept distinct; in particular, the learning-unit definition claims no implemented cross-subject budget validator.

:::sources
[Curriculum Time Axis, Buffer Planning, and Pacing](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md).
:::

## Provenance, Resources, and Defensible Quality Claims {#sec:evidence-context}

### Three Kinds of Links {#sec:three-links}

Curricular provenance, first-party visualization, and optional study resources serve distinct purposes. An official source reference justifies including or phrasing a learning goal; a first-party goal illustration conveys its core idea; a textbook, video, or simulation supports study. None of these links constitutes evidence of individual learner mastery.

The binding content architecture states: resources reference the curriculum; the curriculum never privileges resource providers. New optional external learning resources live in separate content packs pointing to stable goal IDs. Selecting a content pack alters neither Personal Curriculum nor prerequisites, mastery, or completion rules, and incomplete resource coverage must never block ordinary learning.

Official sources, mappings, and structured provenance remain inspectable on the curriculum, while first-party goal visualizations retain their separate canonical reference and quality contract. Legacy external links on canonical goals are transitional material rather than a permanent second authoring architecture, and returning a link alone never proves that a coach read the linked resource.

### Source Rationales for Goals and Relations {#sec:source-rationales}

An inspectable provenance chain links each canonical goal to a source document, a specific source passage, a traceable extraction, and a reviewed mapping decision -- whether one-to-one, partial, aggregating, or splitting across multiple goals. A human-readable rationale explains that relationship honestly rather than presenting every mapping as a verbatim curriculum quote.

For `requires` and `contains`, provenance must likewise distinguish relationships explicitly stated in the source from domain-justified modeling decisions. Plausible goal wording never licenses retroactively invented provenance; unresolved sources, superseded editions, and conflicting mappings remain visible findings.

A human-readable rationale renders existing structured evidence rather than forming a second authoritative registry. Structured references and fingerprints allow documents, exports, and runtime tools to emit consistent rationales. MEM (*Metadata for Educational Media*) links digital educational media to curriculum topics and competencies, and FWU denotes the *Institut für Film und Bild in Wissenschaft und Unterricht gGmbH*, whose curriculum ontology is referenced here (see the [MEM/FWU roundtrip plan](repo:docs/concept/skill-graph/mem-fwu-roundtrip-plan.md)). Cross-checking against those ontology records can corroborate or challenge the classical source route, replacing it only under an explicitly reviewed contract for a declared scope.

### Algorithmic Validity and Domain Quality {#sec:quality-levels}

Quality layers build upon one another without making identical claims. A parser catches malformed JSON; a reference check catches unknown IDs; a cycle check catches forbidden edge loops. None of those checks alone judges whether a competence is well-scoped, an explanation clear, or a task didactically sound.

Each validity and route profile from Section~@ref{sec:validity} applies to a named validation scope: a local migration gate or a single passing structural check does not automatically certify every skill-graph, projection, and learnability requirement.

For in-depth curriculum QA, SkillPilot tracks five concurrently active evidence areas -- D, P, A, M, and V denote area names rather than mathematical symbols:

- **D -- Description:** Is the goal wording factually accurate and clear?
- **P -- Positive understanding evidence:** Which observable performance demonstrates the intended understanding?
- **A -- Atomicity:** Is the competence appropriately scoped?
- **M -- Memory:** Is the decision on necessary memorization elements justified and current?
- **V -- Visualization:** Is the illustration didactically appropriate and bound to the reviewed image and goal hashes?

Maturity tiers M0 through M7 structure automated curriculum QA and are unrelated to the mastery set $M$ (Appendix~@ref{sec:rule-milestones}). Tier M7 denotes complete passing automated checks for these five areas and all prerequisite lower tiers across the declared scope. It is neither human release sign-off nor human learner testing nor proof of instructional effectiveness -- claims that require dedicated studies and evidence of their own. Even multiple concurring AI reviews never substitute for a separately required human decision.

Every review binds the exact revision of its artifacts: a valid image review for an older asset hash does not certify a replacement image, and editing goal wording or prerequisites can invalidate prior content evidence, whereas a purely technical relocation may qualify under a narrowly justified compatibility proof. Neither case may be masked by wholesale hash refreshing.

### Publication and Interchange {#sec:publication-interchange}

Domain edits happen in canonical authoring sources; packages, goal books, illustrations, and validation reports are rebuilt from them while historical published archives remain immutable.

JSON and ontology packages are built from the same canonical revision, with the JSON runtime model serving as the normative reference. Ontology roundtrips must preserve goal identities, relations, projection roles, texts, and domain fields under their semantic-equality contract, while binary assets require byte-identical payloads. An interchange format must never introduce divergent runtime semantics.

External goal references must resolve completely: a Physics package with mathematical prerequisites must ship their definitions rather than empty placeholders. That complete structural *closure* does not by itself decide which goals become selectable `target` items for a learner.

Publication and validation claims always name the artifact, scope, version, and bound source revisions. A passing local build proves neither host rendering nor pedagogical effectiveness, and this compendium grants neither release nor production sign-off.

### Licensing and Private Learner Data {#sec:licensing-privacy}

Apache-2.0 governs software, technical schemas, developer documentation, and functional coach instructions; CC-BY-4.0 governs SkillPilot's own skill landscapes, goal texts, didactic tasks, flashcards, illustrations, and educational documentation. Classification follows function rather than file extension, without blanket dual licensing across mixed collections.

Third-party sources, dependencies, media, and trademarks retain their own terms; source citation and AI provenance establish neither rights ownership nor content quality. Exports carry applicable licenses, provenance, and modification notices, while private learner outcomes, session records, and conversations belong neither under the public content license nor inside public source or review packages.

:::sources
[Source and Resource Links](repo:docs/concept/skill-graph/source-and-resource-links.md); [Human-Readable Source Rationales](repo:docs/concept/skill-graph/human-readable-source-rationales.md); [Graph Validation Rules](repo:docs/qa-ci/graph-validation-rules.md); [Curriculum Quality Maturity and Routes](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md); [Learning Goal Book and Evidence Review Pipeline](repo:docs/concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md); [Dual Curriculum Package Releases](repo:docs/concept/skill-graph/dual-curriculum-package-releases.md); [Licensing](repo:LICENSING.md).
:::
