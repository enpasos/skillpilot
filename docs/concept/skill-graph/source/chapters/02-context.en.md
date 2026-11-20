## Stable Goals, Contextual Structure {#sec:context-model}

Sections~@ref{sec:context-model} through~@ref{sec:evidence-context} specify the contracts surrounding the skill graph: curricular structure, personal scope, goal types, time planning, and provenance and quality.

The skill graph answers *what* a learner should be able to do and which domain prerequisites are required for it. An educational program additionally answers *where* those goals are situated. A personal schedule determines *when* they are worked on. These three questions require distinct data: reorganizing a curriculum must neither mint a new competence nor erase previously stored learner outcomes.

The general goal model distinguishes four semantic layers and one presentation layer (Table~@ref{tab:layers}). It sets the direction for incremental migration; not every data structure named here is already implemented across all skill landscapes.

:::table {#tab:layers caption="Five modeling responsibilities over one shared set of stable goals." cols="27mm,X,X"}
| Layer | Meaning | Example and boundary |
| --- | --- | --- |
| Goals | Concrete competencies and subject clusters; `requires` and `contains` live here. | Solving a linear equation; foundations of linear functions. |
| Units and programs | Canonical subject units (declared clusters with a learning promise and `after`), shared Land plan units (stages, years, phases), and organizational program units (temporarily including `learningUnit` under contract 1.2). | Year 8 and course phase Q1 are plan units, not competencies. |
| Placements | Land-plan binding (*carried in* vs. *placed in*) and contextual link from a goal into a program unit. | The same goal is acquired in Year 8 in one program and in Year 9 in another. |
| Competency axes | Domain taxonomies and cross-cutting categories. | K1 “Mathematical reasoning” is a category; “identifying gaps in an argument” can be a concrete goal. |
| Projection and map view | Reviewed structure of the goal tree and learner map for a resolved educational scope. | A Land plan references canonical subtrees without copying goals; the learner map contracts non-unit clusters along `contains`. |
:::

### Identity Across Different Placements {#sec:identity-across-contexts}

The identity, attribute, and atomicity rules from Section~@ref{sec:core} apply unchanged across every layer. A new placement therefore creates no new competence. A program unit of kind `exam` is not yet an assessment goal with tasks, scoring rubric, and learner outcome. And `phase: Q1` creates neither a parent edge to a Q1 node nor a prerequisite edge between Q1 and Q2.

Legacy trees may still contain year and phase nodes as a compatibility scaffold. In the general goal model, explicit program structure assumes that role while subject goals remain independent. The same content can thus be arranged differently across multiple educational programs without copying its goal ID or stored learner results.

### Placements and Projections {#sec:placements-projections}

A *projection* derives a visible tree or another navigable view from the curriculum data. It is evaluated for a *resolved context* in which dimensions such as jurisdiction, school form, stage, duration model, and course profile are fixed.

In the target model, `programUnits` form an explicit tree or forest of program units, and `goalPlacements` attach goals to those units. A `primary` placement supplies the default program anchor; `secondary` indicates additional structural relevance, and `assessed` marks an assessment reference. Secondary and assessment placements never create extra visible copies of the same goal. In the existing 1.2 compatibility contract, relation `own` records without context that a learning unit directly owns an atomic goal (Section~@ref{sec:unit-representation}); it is not a program anchor.

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



#### Goal tree and learner map.

The same resolved projection drives two coordinated presentations without a second data source. The **goal tree** (*Lernzielbaum*) displays all structure nodes, units, non-unit clusters, and atomic goals. The **learner map** (*Lernkarte*) displays **units and atomic goals only**: every cluster that is not declared as a unit is contracted along `contains`, so indirectly contained child units and atomic goals move up as direct children of the nearest enclosing unit (or the root), while subjects act as filters rather than units of their own. Inside an opened unit on the learner map, arrows run exclusively between its direct children from aggregated sibling `after` declarations and crossing atomic `requires` paths; any backflows against unit order remain visible and are never hidden.

#### Land Authority, Source Assignment, and Learning Placement.

The binding target model has one authoritative plan per Land and duration model across the selected subjects. Its full root has exactly two children, Sekundarstufe I and Sekundarstufe II, with exactly one declared `after` from II to I (Z3); beneath Sekundarstufe I lie the year units applicable to the Land and duration model, and beneath Sekundarstufe II lie the phase units `E` and `Q1` to `Q4` ordered by sibling `after`. Orientation goals, practice tasks, and assessments have a justified place inside these stages; nothing sits beside them. Course profiles select subject contributions, never contradictory stages for the same canonical goal. A single-stage view is a derived excerpt and requires no artificial empty counterpart stage. The nationwide view remains the canonical structure and is no Land plan.

**Carried in** (*geführt in*) means the curricular assignment evidenced by the Land's source. **Placed in** (*steht in*) means the didactic learning placement. Explicitly justified earlier preparation may change the learning placement without overwriting the original source assignment; it creates no new official obligation. Necessary prerequisites from the closed scope $L$ outside the Land plan's carried targets receive their derived learning placement deterministically at **earliest actual need** (in the earliest plan unit of any dependent goal in $L$), whereas carried late targets are never moved forward silently. Without Land evidence a canonical marker such as `dimensionTags.phase` may justify only an explicitly provisional **default assignment**. It substitutes for neither Land evidence nor source coverage and does not override an authoritative view. Routes inspect evaluated learning placement; source checks continue to inspect source evidence. Divergent existing readers remain an implementation finding until migrated together.

The existing [stage-plan foundation](repo:contracts/curriculum-package/v1.3/README.md) separates shared plans, subject authorities, and excerpts; generated compatibility views are not a second authoring authority. The `v1.3` directory here denotes a development contract for stage plans, not a published curriculum-package version or completed migration of production readers. No real Land plan is activated yet.

#### Canonical identity is preserved.

A collapsed view preserves the canonical atomic basis of its cluster. The basis can be checked through `canonicalSubtree` or explicit references to the intended canonical atoms. Hiding children changes neither the node type nor the children’s outcomes. A group declared as a unit also needs a learning promise and specified obligations in the applicable revision to support its own unit completion claim.

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
4. **Learner outcomes.** An explicitly achieved outcome belongs to the stable atomic goal ID and persists across changes of view or focus. Under the contract in force, unit completion is derived from mastery or recognition of its own goals and completion of its children (Section~@ref{sec:unit-completion}). A separate judgement about a passed unit version with its own planning effect is the proposal of 19 November (Section~@ref{sec:proposal-unit-assessment}).

Basic (`GK`, Grundkurs) and advanced (`LK`, Leistungskurs) course profiles belong to the selected subject. The school stage is specified separately and stays unresolved if omitted. Two examples illustrate why this matters.

- **Mathematics in Bavaria.** In the SkillPilot model `GK` denotes the compulsory four-hour advanced-level course. `LK` adds all five modules of the separate enrichment course. These technical designations are not Bavarian course names. Focusing on the three modules actually taught leaves the other two in the personal target set, total progress and completion.
- **Chemistry in Schleswig-Holstein.** Under the decision of 16 October 2026, the interim `GK`/`LK` scope includes all authored topics, including the officially optional medicinal-products theme. Topic selection is planned for a later stage. Its inclusion therefore establishes neither an individual choice nor a universal curriculum requirement.

Changing the Personal Curriculum revalidates the current focus and active goal against the new target set without deleting or writing global mastery outcomes. Configuring the Personal Curriculum is owned by SkillPilot's first-party WebGUI surfaces; the language-model coach connected through the concrete OpenAI V1 adapter reads that scope and neither presents nor mutates it.

Under the decision of 10 November 2026, the personal learning scope is $L=\Closure(S)$ from Section~@ref{par:projection-closure}. It contains the seed targets and every necessary atomic prerequisite on the canonical graph regardless of previous results. A narrow focus limits the current work. Within $L$, explicit outcomes and valid recognition under R1–R5 determine which work remains due. The separate planning effect of unit completion is described in the proposal of 19 November (Section~@ref{sec:proposal-planning-release}). Completing a focus speaks only to its scope.

### Target Role and Prerequisite Support {#sec:projection-roles}

A reference inside a composition view may explicitly carry one of two *projection roles*:

:::description
- **`target`.** The goal belongs to the selectable learning set, frontier, progress, and completion of this view.
- **`prerequisiteOnly`.** The goal remains available for prerequisite checks with its global identity and stored state; within this view it is neither selectable nor counted in the local progress denominator.
:::

When omitted, the role defaults to `target`. Subtree references pass their role down to descendants. Overlapping role assignments are resolved by specificity: a direct `goalEntry` reference overrides subtree inheritance; a nearer subtree root overrides a broader one; only at equal specificity does `target` win. This precedence resolves the role rather than permitting duplicate visible occurrences.

Subject views declare their roles explicitly. The Personal Curriculum adds the atomic acquisition targets required by existing prerequisites. A mathematics competence can thus serve as support in Physics and count once as a learning goal in the combined plan. Its canonical ID carries the learner's outcome. Age and phase do not determine subject roles. Inclusion as necessary preparation does not change official curriculum assignment. The backend and WebGUI implement this closed learning scope. Applicability and full acceptance require their own evidence.

At the personal compilation boundary, the Product Owner decision of 10 November 2026 supersedes the earlier blanket requirement of 7 November to manually reference every reachable prerequisite with an explicit role:

- Authored seed references and subject-local roles remain validated.
- A necessary atom's derived global target role, backed by a checked canonical prerequisite path and recorded provenance, suffices without a manual target or support reference per atom.
- Unknown references, cycles, and missing, unexposed, or unaccounted required atoms remain hard errors regardless of mastery and focus.

The decision of 11 November 2026 distinguishes validation from reading a learner record. Validation, curriculum QA and native acceptance treat an invalid closure as an error. If the runtime cannot strictly resolve the canonical graph, it shows the reviewed seed scope, offers no goal with broken demand and claims no derived learning basis. It logs the cause once per curriculum and error code. Learner state, results and export remain readable. An invalid seed selection remains an error. This handling of an invalid closure also covers older curricula whose root contains and requires its own orientation goal.

*Example from transitional data.* If a Physics goal $g$ requires the Mathematics cluster $k$, the atomic descendants of $k$ and their prerequisites are resolved before display filters. Physics can continue to reference $k$ as `prerequisiteOnly`. The Personal Curriculum includes the necessary atoms with their canonical provenance and existing mastery. This does not enroll an additional subject or a whole unit.

The location of a `prerequisiteOnly` entry determines neither the official stage nor the learning placement. In the target model each required atom without a learning placement in the selected plan receives one at its earliest actual use in $L$. Derivation follows the full canonical paths independently of mastery. If a goal already carried in the plan appears too late, the backflow remains visible until an evidenced subject correction or explicitly justified earlier preparation resolves it. Z4/E2 apply in both cases. Shared placement derivation is not yet in production for every reader.

### Applicability Is Not Placement {#sec:applicability-vs-placement}

`applicability` holds compiled filter metadata for runtime views, such as a state filter. It is derived from inspectable sources, mappings, provenance, and reviewed overrides. It answers in which filtered contexts a goal is visible, whereas a placement answers where the goal sits inside a program structure. Neither datum is evidence of individual mastery.

For state-specific extensions, an explicitly declared inheritance boundary can prevent a broad ancestor source mapping from being reported as source provenance for newly added descendants; direct sources and mappings on the extension branch remain authoritative. Likewise, the visibility of a local practice or assessment endpoint may be derived from its prerequisites under a dedicated contract, establishing applicability without automatically asserting official source-curriculum coverage.

### Guided recommendation and deliberate entry {#sec:focus-switch}

A focus consists of the union of the selected focus roots and their visible descendants, intersected with the Personal Curriculum. Normal mode checks transitive effective prerequisites within that focus; explicitly selected strict mode checks them globally. In normal mode, an outside-focus prerequisite neither blocks availability nor becomes mastered by being masked. Section~@ref{sec:filter-modes} gives the formal frontier definitions.

Focus widening follows the unique visible parent path. Each backend-published widening option must form a strict superset and add at least one unmastered target goal. With multiple roots, it replaces only the covered branch and carries independent roots forward. The coach adopts the published option verbatim and waits for learner agreement before changing focus.

The backend proposes widening only after focus completion. An empty frontier can also reflect outstanding prerequisites. Global recognition of ordinary goals under the contract in force since 4/11 November survives a change of focus. Prerequisite checking uses effective mastery in the selected mode (Section~@ref{sec:state}).

**Proposal of 19 November.** Learners could choose an entry unit in their own learning scope. Required practical performances and uncovered prerequisites remain outstanding. Section~@ref{sec:proposal-planning-release} describes the proposed release of content goals by their owning unit for later planning.

:::sources
[Levels of Personalization](repo:docs/concept/levels-of-personalization.md); [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md).
:::

## Goal Types and the Meaning of an Outcome {#sec:goal-types}

The goal type determines the required performance. The same subject standard applies to an individual goal on either route. The third column of Table~@ref{tab:goal-types} describes only the proposal of 19 November presented in Section~@ref{sec:proposal-unit-assessment}.

:::table {#tab:goal-types caption="Individual evidence and its role in direct demonstration of a unit." cols="26mm,X,X"}
| Goal type | Explicit individual outcome | Proposed direct unit qualification |
| --- | --- | --- |
| Content goal | The learner demonstrated the required understanding or skill (Section~@ref{sec:understanding}). | Skipped practice has no individual outcome. Later prerequisite checks can use reviewed clearance for the entire atom. |
| Orientation goal | The learner took part in the opening and agreed to complete it (Section~@ref{sec:orientation}). | Before the attempt, the learner sees what they will need to demonstrate. A skipped opening remains unvisited. |
| Memory goal | The learner recalled the required cards unaided in the completion check (Section~@ref{sec:memory}). | An explicitly required recall check remains compulsory. Ordinary practice cards can be skipped. |
| Assessment goal | The submission meets the applicable rubric (Section~@ref{sec:exams}). | All specified components in the qualifying revision count towards unit completion. |
:::

### Understanding and Application {#sec:understanding}

The coach can explain a new concept or model a step. Independent explanations and applications can demonstrate understanding. When an individual goal calls for conducting an experiment, the individual outcome also needs evidence of that performance. The coach can discuss the learner’s own experimental observations and data with them. Interpreting supplied data alone evidences analysis. The goal and coach contracts determine what independent performances suffice for the whole goal.

Once sufficient evidence is available, the coach records the outcome without asking for separate permission to save it. It can report the pass as saved once persistence is confirmed. It then offers the next topic selected by the backend and begins when the learner agrees.

### Orientation as a Distinct Completion Contract {#sec:orientation}

An atomic orientation goal (`semanticKind: "orientation"`) shows what the upcoming material will help a learner understand or do. Learners can express interests or ask questions. Prior knowledge, terminology and personal motivation are never graded. The existing contract requires orientation goals to have no prerequisites and no assessment or memory data.

**Subject introduction.** A full introduction such as “Why mathematics?” follows this workflow today.

1. **Follow-up.** When the learner chooses an interest, the follow-up begins. The coach gives a concrete example of something the learner could understand, explore or create and invites a response.
2. **Summary.** After a substantive response or an explicit wish to leave orientation, the coach summarizes the conversation positively and offers to close.
3. **Closure.** The goal is complete when the learner accepts that offer.

**Proposed unit opening (17 November).** When working through a unit, the coach poses a concrete question about its declared learning promise (Section~@ref{sec:unit-claims}). In kinematics, a ball can roll off the edge of a table. Where will it land? The learner can ask questions or finish the opening by choosing “continue”. That records an explicit outcome for the opening. Learners going straight to assessment see what they need to demonstrate. Passing creates no retrospective visit to the opening (Section~@ref{sec:proposal-unit-assessment}).

**Which goals are selectable today.** If the relevant projected working scope contains open orientation goals, ordinary entry offers only these as long as it contains neither curricular progress nor an active curricular goal. Learners already working on the subject in that scope can continue. A deliberately selected, available assessment remains directly accessible (Section~@ref{sec:exams}).

**Which opening the coach should recommend.** When a learner starts a unit, the backend would recommend that unit’s available opening as appropriate to the chosen topic, learning plan or focus. In the planned unit-by-unit approach, the opening belongs to the unit whose turn it is. Selection among equally ranked units and in other learning approaches remains open. A learner focusing explicitly on a single content goal can leave its motivation outside the focus. As a prerequisite it still belongs to the personal learning scope, but it does not block normal focus. Strict mode checks it even outside the focus (Section~@ref{sec:filter-modes}).

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

New and revised SkillPilot assessments worth more than one point use an attainable pass mark below the maximum score. Choose the threshold for the competence being assessed. State any required representation or explanation in the task. The rubric distinguishes separately demonstrable achievements. Clear evidence can appear anywhere in the submission. A contradiction affects the criteria whose evidence it undermines. The sum of the awarded points determines the result.

The subject review scores two borderline submissions. A submission that independently demonstrates the core competence must pass despite a minor slip. A submission missing a core capability that the assessment claims to cover must fall below the threshold. If either result differs, revise the task, weights or coverage claim. The reading load and required answer format should fit the age group and competence.

#### Access.

Guided learning checks transitive prerequisites under the selected focus mode. Today direct assessment access allows an intentional attempt at an available assessment while preparation remains outstanding. Personal scope and an authorized session remain required. In the proposal of 19 November “Demonstrate this unit directly” shows the learning promise and every required component for this revision before the learner starts. The offer of an attempt alone establishes no completion.

#### Exam-mode workflow.

In Exam Mode, the learner receives the complete, verbatim task prompt and works through it without content hints. The single complete submission is graded strictly against the rubric. On pass, mastery is persisted immediately; on failure, neither an outcome nor a score is persisted and any existing mastery remains untouched. Only confirmed persistence authorizes reporting that the pass is saved.

#### Post-grading semantics.

After grading, the learner receives the outcome, score, feedback and solution. The existing flow allows retries of the same task. A previously earned individual outcome persists. For another qualifying attempt, the proposal calls for an equivalent task the learner has not previously seen. While only the familiar task is available, the learner can use it for practice. Whether an earlier assessment supports that judgement must be established for the revision actually taken (Section~@ref{sec:proposal-unit-contract}).

:::sources
[Node Types and Exam Workflow](repo:docs/concept/skill-graph/node-types.md); [Project Rules on Orientation, Evidence, and Continuation](repo:AGENTS.md); [Backend Derivation of Memory Mastery](repo:backend/src/main/java/com/skillpilot/backend/service/LearnerService.java); [Frontend Derivation of Memory Mastery](repo:app/src/hooks/useSrsMastery.ts).
:::

## Time Planning as a Complementary Overlay {#sec:time-context}

A schedule binds a declared planning scope, a curriculum revision, a calendar, available capacity, and a plan version. Absolute dates never belong on canonical goals, clusters, or placements: the same content can be studied at different times across courses without altering its canonical identity.

Time planning is an execution overlay rather than a fifth personalization level. It may prioritize goals currently available in the active working corridor, yet it creates neither prerequisite edges nor a new frontier nor learner outcomes. Whereas a learning unit expresses domain coherence, a dated schedule must additionally ensure that each prerequisite is scheduled in time before its planned dependents.

Available capacity accounts for actual instructional or study minutes after holidays, cancellations, and other exclusions. Planned activities, protected reserve, and committed subject budgets must fit within that capacity without double counting. Section~@ref{sec:levels} specifies the formal budget check and its requirement for calibrated effort estimates.

Planned targets and actual attainment refer to the same specified scope. Under the contract in force, explicit outcomes and validly derived recognition count towards cumulative progress. Weekly activity counts each real assessment success once on its date. Section~@ref{sec:proposal-period-accounting} discusses a different assignment for expert review: unit qualification and individual work actually performed would be reported separately. New plan revisions preserve the meaning of historical outcomes and dates.

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
