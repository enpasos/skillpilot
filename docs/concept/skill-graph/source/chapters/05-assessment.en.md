## Implicit Mastery Through Valid Local Assessments {#sec:assessment}

**Applicable confirmed contract.** The decisions of 4 and 11 November remain in force; the formulas and R1–R5 in this main section are not merely contract history. Their full technical enforcement is a separate matter. The unadopted proposal of 19 November follows in Section~@ref{sec:proposal-unit-assessment}.

:::principle {title="Binding Concept Revision of 4 November 2026"}
An explicit pass on a content goal establishes understanding. Passing a valid local assessment can establish independent application of the underlying competencies. That implicit mastery carries equal global weight: it satisfies subsequent prerequisites and counts toward cumulative attainment. Assessment and memory goals themselves remain strictly explicit.
:::

Recognition depends on which assessments and memory goals in the goal's own unit remain open. The rule of 11 November 2026 applies only to contracts with reviewed subject-matter evidence (Section~@ref{sec:why-graph-not-enough}). An explicit outcome remains possible at any time. The [concept specification](repo:docs/concept/skill-graph/assessment-gated-completion.md) defines global derivation. The stored binary value $m$ remains the sole outcome per goal. Section~@ref{sec:why-graph-not-enough} describes current enforcement.

### Local Contract, Target Scope, and Protected Goal Types {#sec:local-contract}

#### Local contract.

A *local recognition contract*, also called an *acquisition contract*, belongs to a unit $U$ with its own assessments (Section~@ref{sec:learning-units}). It binds the canonical IDs of the unit's own goals $\Own(U)$, the curriculum revision and the reviewed meaning of its own assessments. The unit declares their coverage in valid, complete `coverageReviews` (Section~@ref{sec:unit-representation}). Rules R1 to R5 also apply. Missing or invalid reviews violate the contract of a unit declared to have assessments. Stages, years, course phases and other units without their own assessment contract organize goals. Even when they contain standalone practice tasks or Abitur exams, they grant no recognition.

Total scope $T(U)$ also contains the targets of child units. Each child's own contract governs recognition of its targets. A later synthesis assessment, a change of view or focus, or the selection of different plan roots cannot change that ownership. Support outside $T(U)$ does not count toward full unit completion.

#### Protected goals.

Let $Q \subseteq A$ denote the authoritatively classified assessment goals and $A_{\mathrm{mem}} \subseteq A$ the memory goals, while $K = G \setminus A$ remains the set of structural clusters. In the target model no prerequisite edge points to an assessment goal in $Q$: assessments are endpoints in learning order and never prerequisites of later subject goals; in the opposite arrow direction of $R$, this means $R \cap (G \times Q)=\varnothing$. A unit's own protected goals are

$$
Q_U = \Own(U) \cap Q, \qquad A_{\mathrm{mem},U} = \Own(U) \cap A_{\mathrm{mem}}, \qquad P_U = Q_U \cup A_{\mathrm{mem},U}.
$$

Assessment goals require passing their own assessment, and memory goals require verified recall of their cards. The remaining *unprotected* own goals are content and orientation goals. Experimental content goals are also subject to R1 and R2. An individual atom has the same stated claim on both evidence routes: if it requires the learner’s own experiment, neither dialogue explanation nor analysis of supplied data demonstrates the whole atom. This introduces no extra experiment obligation for every unit. Deriving satisfaction of an orientation goal means only that the introduction is settled (Section~@ref{sec:orientation}).

#### Underlying relation.

All formulas below evaluate the fully inherited and atomically expanded prerequisite relation $\Rat$ from Section~@ref{sec:effective}, including hidden and cross-subject support. Every reference must resolve and the normalized relation must be acyclic; full prerequisite closure is evaluated prior to any display restriction.

### Transitive Open Demand and Implicit Set {#sec:transitive-demand}

For any subset $X \subseteq A$, let $\operatorname{Reach}_{\Rat}^{*}(X)$ denote $X$ itself together with every atom directly or transitively required by an element of $X$:

$$
\operatorname{Reach}_{\Rat}^{*}(X) = X \cup \{b \in A \mid \exists a \in X : (a, b) \in \Rat^+\}.
$$

Given global explicit mastery $M = \{a \mid m(a) = 1\}$, define

:::equation {#eq:needed}
N_U = \operatorname{Reach}_{\Rat}^{*}(P_U \setminus M),
:::

:::equation {#eq:implicit}
I_U = \Own(U) \setminus (M \cup P_U \cup N_U).
:::

Here $N_U$ is *open demand* -- the still-open protected goals of $U$ together with their full atomic prerequisite demand -- and $I_U$ is the *implicit set*. An own goal belongs to $I_U$ if and only if it is

1. not already explicitly mastered,
2. not protected, and
3. no longer required by any open protected goal of the unit.

Reflexive reachability retains the open roots themselves together with *all* of their transitive prerequisites: traversal **never** stops at an explicitly mastered intermediate goal or at the boundary of $\Own(U)$. Consequently, $I_U$ remains invariant whenever a redundant shortcut edge is added or removed for required transitive minimality, and $I_U \cap M = \varnothing$ as well as $I_U \cap P_U = \varnothing$ hold unconditionally.

Figure~@ref{fig:waivers} shows three goals $S=\{\nd{Q},\nd{B},\nd{A}\}$. Orientation is already complete and lies outside the diagram. Assessment $\nd{Q}$ requires $\nd{B}$, which requires $\nd{A}$. If only $\nd{B}$ of the three has an explicit result, $N_U\cap S=S$. Both content goals are still on the path from the open assessment. If only $\nd{Q}$ of the three has been passed, that demand is gone. The valid contract recognizes $\nd{B}$ and $\nd{A}$.

::figure{id="fig:waivers"}

**What happens to the unit's motivation goal?** In Figure~@ref{fig:orientation-outcome}, both the unit's assessment $\nd{q}$ and its flashcard goal $\nd{k}$ require content goal $\nd{a}$, which requires the introduction $\nd{m}$. A learner who takes and passes the assessment directly has an outcome for $\nd{q}$. While $\nd{k}$ is open, its demand still includes $\nd{a}$ and $\nd{m}$. If the learner also passes verified recall, the valid contract recognizes independent application of $\nd{a}$. The introduction $\nd{m}$ is settled even if no conversation took place. No outcome is recorded for $\nd{m}$ through this derivation. A learner who experienced the introduction and said “continue” has an explicit outcome for $\nd{m}$ even with an assessment or flashcard goal still open.

::figure{id="fig:orientation-outcome"}

#### Complexity.

Let $V_U^{\mathrm{reach}} = \operatorname{Reach}_{\Rat}^{*}(P_U \setminus M)$ denote the reachable atomic nodes and $E_U^{\mathrm{reach}} = \{(a, b) \in \Rat \mid a \in V_U^{\mathrm{reach}}\}$ their outgoing prerequisite edges. Direct graph traversal visits each such node and edge at most once, computing $I_U$ across $\Own(U)$ in $O(|\Own(U)| + |V_U^{\mathrm{reach}}| + |E_U^{\mathrm{reach}}|)$ steps -- and globally in at most $O(|A| + |\Rat|)$ -- without materializing a quadratic transitive closure.

### Why the Skill Graph Alone Does Not Prove Application {#sec:why-graph-not-enough}

Table~@ref{tab:unit-validity} gives the five conditions for establishing and applying a valid subject-matter contract.

:::table {#tab:unit-validity caption="Conditions of the local recognition contract and their intended enforcement (decision of 11 November 2026)." cols="12mm,X,52mm"}
| Rule | Requirement | Placement |
| --- | --- | --- |
| R1 | Every own ordinary content goal lies on a prerequisite path from at least one own assessment of the unit, directly or transitively; a path that leads only to a memory goal does not count. | Validity condition of the unit definition, in the same class as acyclicity: hard from the first authored unit; a violating unit cannot be merged. |
| R2 | For every own content goal, a review establishes that the tasks and grading rubric of at least one own assessment demand independent application of that goal. That assessment requires the goal. | Assessment approval and coverage metadata at `M5`, with current per-goal evidence at `M7`. |
| R3 | An assessment claims coverage only for goals it requires directly or transitively: $\operatorname{Cov}(q)\subseteq\{b\in A\mid(q,b)\in\Rat^+\}$. | As R1. |
| R4 / E1 | The smallest unit of a goal is unique in the resolved structure; own goals and child units derive from declared clusters. Content recognition uses the smallest responsible subject unit with assessments. | E1 is the structural contract; full rollout assigns every content goal to a unit with assessments. |
| R5 | A later re-cut of units or later edges never grant additional recognition to existing results; the contract is versioned. | Runtime contract; precondition before implicit recognition is enabled in production. |
:::

R4 becomes tree rule E1 in the target model (Section~@ref{sec:unit-progression}). The existing 1.2 contract still describes explicit `own` placements for the three existing units. Their migration is scheduled in F8 to F11.

#### Structural conditions (R1, R3, R4).

The formula applies to all own goals under the valid contract without a separate eligibility mask. Each own content goal needs reviewed evidence of application. A content goal with no downstream assessment and a goal that prepares only for flashcard recall violate R1. Explicit mastery remains possible for both.

$\operatorname{Cov}(q)$ contains the content goals whose independent application assessment $q$ verifiably requires. By R3, each own goal in this set remains in $N_U$ while the assessment is open. A missing path calls for subject review. An existing indirect path suffices.

#### Content condition (R2).

Independent subject review examines the task, solution, grading rubric and claimed coverage together. If a learner can pass solely on points for other work, the assessment does not establish the omitted competence. The review must consider every combination of passed assessments that releases a goal under the set formula. A title, an entry in `coveredGoalIds`, a `requires` path or a formally valid points allocation cannot by itself supply this evidence.

The motivation goal can lie on the same prerequisite path. It represents an introduction to the topic. The assessment claims no competence coverage for that goal. Missing coverage for a content goal, however, violates the contract. The ordinary binary assessment outcome carries its stated evidential meaning only under valid R1 to R4. A software update or a revised diagram cannot extend the meaning of a historical pass. R5 governs later changes (Section~@ref{sec:global-effect}).

#### Current enforcement.

Required curriculum CI for the canonical Gymnasium subjects checks the declared units with [validateLearningUnits.ts](repo:app/scripts/validateLearningUnits.ts) (`validate:learning-units`). The validator reads goal types, prerequisites and `coveredGoalIds`. Errors in R1, R3, unique ownership (R4), declarations, own goals, total scope or hierarchy fail the check. Full assignment of all acquisition goals is required only for `learningUnitCoverage: "complete"`. No landscape currently claims this status.

For R2, the validator checks declared `coverageReviews` against the tasks and rubrics and reports goals without a review. A missing review currently triggers neither a structural error nor an R2 gate at `M5` or `M7`. The [reference calculation](repo:app/scripts/lib/learningUnitRecognition.ts) checks the set equations against shared conformance cases in required CI. Global revision-bound derivation, including R5, is not yet implemented on the main branch.

### Global Effectiveness and Durable Contract Binding {#sec:global-effect}

Let $\mathcal U_{\mathrm{valid}}$ denote the authoritative local contracts durably bound to this learner at their applicable revisions -- rather than arbitrary visited views or all latest content revisions:

$$
\Meff = M \cup \bigcup_{U \in \mathcal U_{\mathrm{valid}}} I_U.
$$

That union is not restricted to currently displayed learning units or the active Personal Curriculum view: contract identity, revision, and evidential meaning must remain evaluable across scope changes. Derivation always runs directly from explicit outcomes $M$ and valid contracts without feeding previously derived implicit sets back as explicit mastery inputs.

A later learning unit $\nd{U2}$ carrying another assessment $\nd{q_2}$ must never reopen an application competence $\nd{a}$ already established under $\nd{U1}$ (Figure~@ref{fig:local-recognition}); instead, $\nd{a}$ satisfies $\nd{q_2}$'s prerequisite. Under a fixed contract set, adding explicit mastery can only enlarge $\Meff$: open protected roots shrink, their transitive demand contracts, and any newly explicitly mastered goal leaving $I_U$ stays inside $\Meff$ via $M$.

::figure{id="fig:local-recognition"}

A stable assessment goal ID binds a stable recognition meaning, and equivalent task variants must uphold that same qualified contract. Expanded recognition claims must never silently upgrade legacy exam passes: they require either a new assessment identity or an explicitly reviewed meaning-preserving migration, without adding per-learner qualification records. Whenever historical evidential meaning is unresolved, the explicit pass stands without fabricating broader application recognition, and genuine score or content corrections remain distinct from ordinary downstream consumer or plan switches.

R5 applies directly when introducing motivation goals. If an existing unit gains an introduction later, a historical assessment pass cannot retroactively settle that new introduction. Production use of global derivation requires a durable binding to the applicable contract revision.

### Protected Goals and Full Unit Completion {#sec:protected-completion}

#### Recognition is not yet full completion.

Full unit completion follows recursively from Equation~@eqref{eq:unit-complete}: all own goals must be satisfied and every required child unit must be complete. Given global $\Meff$, that condition coincides with $T(U) \subseteq \Meff$ provided every required child obligation is represented inside $T(U)$, and full completion always entails $P_U \subseteq M$ on own protected goals.

Once every own assessment and memory goal of $U$ is passed, $N_U = \varnothing$, allowing $U$'s valid local contract to complete its own unprotected goals. Completion of required child units **never** follows from that fact alone: a parent synthesis assessment may stay open while child content competencies are already globally recognized, and conversely passing the parent synthesis never satisfies an open child assessment or memory obligation.

#### Open protected goals in the same contract.

An open own memory goal blocks full unit completion without blocking implicit recognition of another own content goal that it does not transitively require (Figure~@ref{fig:protected}). Whenever an open memory goal does require a content goal directly or transitively, however, that content goal stays in open demand. Likewise, when multiple assessments inside the same local contract share a common foundation, all of them must be passed before that foundation leaves open demand.

::figure{id="fig:protected"}

Figure~@ref{fig:shared-assessments} shows two assessments of the same unit with a common foundation. After the first pass, the second still requires that foundation. Demand ends in this example only after the second pass.

::figure{id="fig:shared-assessments"}

A later assessment in another unit has its own contract (Figure~@ref{fig:local-recognition}). The scope of each contract needs independent justification and subject review.

#### Assessment access.

Even with the introduction open, a learner can deliberately select an available assessment in their scope and attempt it directly (Section~@ref{sec:exams}). Authentication and session ownership are required. B9 of 14 November 2026 supersedes the earlier open access profile (Section~@ref{sec:unit-progression}). In the target model ordinary learning access uses $\Meff$, transitive prerequisites and the normal and strict focus rules.

### Cumulative Attainment and Dated Period Events {#sec:period-accounting}

For a fixed named plan target set $T_{\mathrm{Plan}}$, cumulative plan attainment counts the effectively mastered goals of the plan:

$$
H_{\mathrm{gesamt}} = |T_{\mathrm{Plan}} \cap \Meff|.
$$

Forming the union $\Meff$ prior to intersecting with $T_{\mathrm{Plan}}$ prevents double-counting across explicit outcomes, implicit sets, and overlapping contracts; any dedicated explicit-only view must label its distinct counter clearly.

By contrast, an active schedule period counts solely dated explicit completion events under its event contract: newly derived application recognition, prior mastery brought into the course, or a widened plan display never fabricates an extra dated completion event inside the current period (Figure~@ref{fig:period}).

::figure{id="fig:period"}

The [unified learning-plan status contract](repo:docs/concept/didactic/unified-learning-plan-status.md) specifies the user-facing surfaces. Static contract definitions may be cached per revision while derived sets remain computed projections rather than a second stored truth, and invalid or unresolved contracts stay visibly unavailable. Automated checks of these formulas replace neither independent content review nor human learner testing or instructional effectiveness studies.

:::sources
[Assessment-Gated Completion and Implicit Mastery](repo:docs/concept/skill-graph/assessment-gated-completion.md); [Completion Semantics Clarification of 4 November 2026](repo:docs/concept/skill-graph/completion-semantics-clarification-2026-11-04.md); [Unified Learning-Plan Status Contract](repo:docs/concept/didactic/unified-learning-plan-status.md).
:::

### Proposal of 19 November: what completing a unit could demonstrate {#sec:proposal-unit-assessment}

**Proposal for expert review, 19 November 2026.** Passing the stated final assessments demonstrates the **named unit at its stated level**. This judgement may rest on representative performances. It does not claim that every included detail was assessed individually. Support with such a detail may still be needed after valid completion.

:::principle {title="A judgement about the unit, separate statements about individual goals"}
Unit completion, actual individual evidence and justified release of prerequisites for subsequent planning remain distinguishable. A skipped learning step receives no invented success. Required work on the demonstrated route nevertheless ends.
:::

This is the **unadopted proposal of 19 November 2026**. The applicable derivation of global atomic mastery from absent outstanding demand remains in the main text (Sections~@ref{sec:transitive-demand} and~@ref{sec:global-effect}). The local Hessian G8 and G9 Physics E.1 preview explicitly enables the versioned unit-assessment contract. The pilot is disabled by default. It covers six reviewed views. Rules R1–R5 remain binding. All four tasks have independent subject reviews. The product owner’s first pedagogical acceptance of the unit is pending.

#### Proposal: Completion contract, scope and actual evidence {#sec:proposal-unit-contract}

The completion contract of a declared subject unit binds its **identity, learning promise, level, version and required evidence**. It lists all own required exams and required children, plus separate flashcard recall or real performance where necessary. Full completion follows from this evidence under Equation~@eqref{eq:unit-complete-proposal}; membership of a goal in the cluster is insufficient.

Before a direct attempt, the learner sees which parts jointly constitute completion. The standard is the same as after working through. A previously passed part that remains valid counts towards completion. Where completion supports only a narrower promise, that promise must be visible before the assessment. The Land, course profile and level must not be silently exchanged in the evidence.

**Exam identity.** Each independent required exam needs its own valid pass. A shared title or pooled points account does not replace these passes. A task with a broader claim or changed qualifying rubric needs a new exam identity. This does not upgrade old results. Equivalent versions may carry the same meaning where their task and assessment demonstrably preserve that claim.

**Proposed required evidence.** Performing an own experiment is an additional unit-completion obligation only where the contract expressly declares it. An actually required experiment or verified flashcard recall is recorded only when performed. The same atom has the same subject standard on both routes: where its text requires own performance, an explicit individual outcome in dialogue requires corresponding evidence too. Merely explaining or analysing supplied data is insufficient. Passing a written analysis creates no performance event for an experiment. Practice cards and preparatory tasks may be omitted on the direct route where they are not stated required evidence. Exams remain endpoints of the learning route; their results are not attached as subject `requires` edges to later content goals.

#### Proposal: Why the graph and a points total are insufficient {#sec:proposal-evidence-review}

Assessment design begins with a question: **What independent performance would convince us to entrust someone with a task at this level?** Task, solution and rubric must jointly support this judgement. Representative means a justified selection; passing must not allow indispensable concepts to be bypassed entirely.

The independent subject review examines the complete goal list. For each goal it records which performance is required to pass, which part remains open and why the overall judgement can tolerate that gap. Direct subject connections beyond the unit deserve particular attention. If someone can pass while entirely misunderstanding a concept essential to the next step, the unit needs a different task, an indispensable criterion or a narrower promise. A central synthesis goal without an outgoing connection can also be indispensable.

The review also examines the **planning effect for each whole atom claimed**. A `requires` path identifies preparation needs; it proves neither observed performance nor sufficient assessment breadth. `coveredGoalIds`, a title and a formally valid allocation of points do not constitute subject approval either. Releasing other atoms requires full unit completion. The review must justify which indispensable performances in the required package support the entire claim of each atom.

A compensatory rubric can undermine the overall judgement: the exam “Multi-phase motion and model testing”, retired on 24 November 2026, requires 18 of 30 points to pass. Even without the seven points for acceleration phases, 23 points remain attainable. Passing this exam alone therefore cannot assert indispensable acceleration competence. The [E.1 discussion document](repo:docs/concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md) shows how the allocation of points can protect the core performance in each of two separate assessments.

How many tasks support a reliable judgement requires subject and empirical investigation. No fixed minimum for every subject is established here. Subject reviews, automated consistency checks and learner trials provide different evidence. Agreement between the coaches used must be tested against concrete submissions with expected judgements concealed; it does not replace subject judgement.

#### Proposal: Trial example: Hesse, Physics E.1 {#sec:unit-assessment-example}

The proposed promise is: *I can use measurement data to decide when a velocity is approximately constant and when it changes. I can use this to predict motion, including simultaneous uniform and accelerated motion.* For this learning promise, the Hessian G8 and G9 E.1 contract requires four exams. Since 24 November 2026 the section has four child structures in learning order, each holding one required part. Only the second, “Free fall of heavy balls”, is a declared unit with its own opening; the other three are view structures until they have opening goals and coverage reviews. The section also offers two voluntary assessments: the exam on horizontal projectile motion and the own task with two free-fall measurement series.

:::table {#tab:unit-assessment-e1 caption="Four required exam passes for Hessian E.1 completion." cols="50mm,X"}
| Required part and child structure | Own evidence and claim |
| --- | --- |
| A · cart, in “Uniform motion” | Pass mark 14 out of 17. Passing requires a model supported by the early and late motion and a quantitative arrival prediction that accounts for the reading limits. |
| B · horizontal projectile, in “Two motions at once” | Pass mark 15 out of 18. Both motion models need support from the data. A determinate landing position follows from the shared flight time. |
| C · modelling vertical projectile motion with constant acceleration, in “Ball and feather, air and vacuum” | Hessian version, pass mark 17 out of 20. Supports modelling, axis choice and idealisation in particular. |
| D · acceleration report: velocity, position and model limits, in the declared unit “Free fall of heavy balls” | Hessian version, pass mark 17 out of 20. Requires constructed diagrams and distinguishing displacement from distance after a reversal, among other things. |
:::

**The E.1 qualification requires all four passes.** Each passed part counts through its own record for the specified task and rubric version. All four parts are available in German and English; the [planning-release review of 24 November](repo:curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-planning-release-2026-11-24/coverage-review.actual.json) binds their current task and rubric versions. The multi-phase motion and horizontal projectile tasks served as source material. The multi-phase exam is retired: it lies in the historical container without a successor, and its results transfer to nothing. Under the identity rule above, an edition with a changed recognition claim needs a new assessment identity.

##### What A and B demonstrate and what remains open.

**A · cart** allows minor errors in an otherwise sound prediction. Evidence for a change on the final stretch, both bounds and the full distinction between measurement deviations comes from individual contributions. **B · horizontal projectile** assesses the models against both data series and uses them in a coupled prediction. Each assessment has its own additive pass mark. C and D retain their separately bound rubrics.

E.1 assessment B tests prediction of the combined projectile motion. For the individual free-fall goal, learners determine gravitational acceleration, justify their position–time model and check a further measurement. Under the decision of 23 November 2026 they can use their own data or the supplied experimental record. Personal measurements provide evidence of conducting the experiment themselves. The [two reviewed routes](repo:curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-free-fall-2026-11-23/fachreview.md) preserve the evidence boundaries of the four assessment parts.

The [discussion document](repo:docs/concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md) gives both tasks and the previous blind comparisons. The [independent review of partial credit](repo:curricula/DE/Gymnasium/quality/release-model/physics-he-e1-partial-credit-review-2026-11-20.md) checks the current thresholds. The data are constructed. Repeated blind scoring by the coaches actually used and trials with learners remain open for this revision.

#### Proposal: Planning release and stable result meaning {#sec:proposal-planning-release}

**Standard in the proposal.** Planning concerns the **full canonical claim** of a required atom. The same standard applies to an explicit outcome $M$ from dialogue and assessment release $F_{\mathrm{plan}}$; assessment demands no stronger evidence for the same atom. Where application at this breadth was required to pass the bound evidence and has received subject approval, the learning plan can build on it. Requiring only a part is insufficient for general release. Representative evidence of unit completion alone does not answer this question.

**Proposed release rule.** Let $M$ be the actually demonstrated atomic goals, $A_{\mathrm{content}}$ the ordinary content atoms and $\mathcal V$ the fully demonstrated valid units with their respective bound revisions $(U,\rho)$. The subject-reviewed release set $P_{U,\rho}$ contains exclusively **own ordinary atoms of that unit and revision**. Here $\Own_{\rho}(U)$ denotes the goals owned in that version. For the proposal:

$$
P_{U,\rho}\subseteq\Own_{\rho}(U)\cap A_{\mathrm{content}},\qquad
F_{\mathrm{plan}}=\bigcup_{(U,\rho)\in\mathcal V}P_{U,\rho},\qquad D=M\cup F_{\mathrm{plan}}.
$$

A Physics exam can use a Mathematics atom but cannot release it on behalf of the Mathematics unit. Parent completion likewise releases no child atoms. A child unit contributes its own reviewed atoms only upon its own valid pass, even while its parent remains open. An individual exam part creates no additional release before its responsible unit is fully completed. **Only in the proposal**, regular prerequisite checking uses:

:::equation {#eq:planning-release}
\ReqAtoms(g)\subseteq M\cup F_{\mathrm{plan}}.
:::

The complete direct and transitive prerequisite closure remains decisive, respecting normal and strict focus. The formula creates **no new mastery set**: $F_{\mathrm{plan}}$ remains a planning justification distinguishable from $M$. Release does not record an actually required performance or required recall as having occurred. Nor does it create a second completion event.

:::table {#tab:unit-assessment-release caption="Planning effect of the four-part E.1 evidence under the planning release reviewed on 24 November 2026." cols="53mm,X"}
| Whole content atom | Planning effect and limitation |
| --- | --- |
| Uniformly accelerated motion and acceleration (declared child unit) | Released through D, including initial values, reversals, diagrams and signed areas. A, B and C alone do not support this whole claim. |
| Idealisations and limits of motion models | Open. C requires the justified idealisation and its limits, but the goal lies outside the declared child unit. |
| Distinguishing measurement deviations and error types | Open. A can be passed without fully identifying the systematic deviation. |
| Stating measurement uncertainties | Open. A2 uses a supplied reading limit. Choosing a suitable uncertainty from measurement conditions remains unassessed. |
| Uniform motion and velocity | Open: A assesses model prediction, not the atom's full experimental and graphical claim. |
| Measuring motion and representing it in a time-position graph | Open: all four parts work with supplied data; recording a motion experimentally is not required. |
| Distinguishing average and instantaneous velocity | Open: comparing secant and tangent slopes is not required. |
| Investigating free fall experimentally | Open. B tests the projectile prediction. Determining g and independently checking the free-fall model belong to the individual goal. |
| Analysing horizontal projectile motion | Open: an own experiment and the x-y trajectory diagram are not required performances. |
| Time-velocity graph and displacement as area | Open: areas occur in the tasks, but the full route from position data through interval velocities to a signed area balance is not required. |
| Describing motion with time-position and time-velocity laws | Open: D requires accelerated motion in two cases; no part requires comparing both laws for uniform and accelerated motion from graphs. |
| Comparing the fall of light and heavy bodies | Open: C transfers the model to a light hollow ball in air; the comparison with a vacuum and the equal fall time are not required. |
:::

The [planning-release review](repo:curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-planning-release-2026-11-24/coverage-review.actual.json) gives the reasons for each row; the [child unit review](repo:curricula/DE/Gymnasium/quality/learning-units/physics-constant-acceleration-2026-11-24-v4.md) binds the first row to its owner. For E.1, learners analyse supplied data. An individual experimental goal requiring an investigation of their own stays open until they demonstrate that performance. This applies to both $M$ and $F_{\mathrm{plan}}$.

Of the twelve content goals in the version-bound E.1 contract, **one is released for planning**: accelerated motion, through D. Further goals in regular study, such as preparing a measurement record, have their own evidence requirements. Eleven goals need further evidence if the plan is to build on them. Six of these are direct prerequisites for ten distinct ordinary physics goals outside the Hessian E.1 section. For example, the velocity vector of the horizontal projectile, placed in E.3, requires the whole horizontal projectile goal. A learner demonstrating an individual goal in dialogue must also meet its full requirements. For the experimental free-fall goal the coach guides a personal investigation or uses accessible original measurements; the voluntary own task with two free-fall series, also offered in Saxony, gives a result of its own and no planning release.

**When release takes effect.** A declared, revision-bound child unit releases a goal of its own once its own assessment is passed and subject review confirms that passing requires the whole goal. “Free fall of heavy balls” releases accelerated motion when D is passed, even before A, B and C. The other three child structures release nothing until they are declared with opening goals and coverage reviews; both measurement goals would remain open even then, because no required part demands them in full. Existing individual evidence in $M$ counts immediately. The rule of 11 November can recognise an own atom once all local exam or recall obligations relevant to that atom have been fulfilled.

The version, subject scope and planning effect remain durably bound to the underlying success. A focus change, new parent unit, additional edges or a broader new assessment claim never expand an old result. Suitable earlier evidence remains traceable across plan changes. A justified correction to results or content must be distinguished from such a retrospective expansion.

#### Proposal: Open prerequisites and required individual evidence {#sec:proposal-open-prerequisites}

A completed unit route can coexist with open individual assignments. An own assignment is fulfilled when its specified evidence exists or subject-appropriate release supports its **entire** claim. Where real performance or independent recall is explicitly prescribed, that performance remains required. A merely skipped exercise within the completed route is not carried forward as a backlog.

Where a later goal needs an open atom, the backend tells the coach the need and its reason: for example “fall model analysed; own experiment not demonstrated” or “interval velocity used; instantaneous velocity open”. Deliberately choosing an entry unit does not remove this gap globally. It creates no success in other units either.

**Open decision: short check or supported application.** For a directly required ordinary prerequisite whose necessary application has neither been demonstrated individually nor evidenced at the full required breadth by the passed version, a targeted short check could come first. The discussion document instead proposes offering entry with a note and observing application in the new task. If difficulties arise, the coach explains and practises the missing step. This local entry decision replaces no required evidence and does not release the atom globally. A binding decision and the corresponding backend information remain outstanding.

When application is observed, only the active goal receives an outcome. The open prerequisite may reappear at a later step. A learner seeking durable evidence can choose the prerequisite as the active goal, demonstrate the specified performance and return to the original task. An incidental observation carries no lasting credit.

**Open decision: replacing a child obligation for the parent route.** A parent assessment might support a narrower, differently worded overall completion even though individual child obligations have not been taken. A subject review would have to approve the claimed overall standard and the children's indispensable contributions explicitly. Until such a decision, all required parts apply; the E.1 example requires four. Such an exception must not fabricate child completion, real performance or flashcard recall.

#### Proposal: Learning plan, cumulative progress and dated period events {#sec:proposal-period-accounting}

The learning plan distinguishes at least three statements: **unit demonstrated by assessment**, **scheduled activities fully worked through**, and **outstanding own acquisition assignments**. The learner can thus recognise completion of a route while seeing which individually unassessed claims remain open for another route. Cumulative progress needs a named scope and visible counting method.

**Product Owner decision for the E.1 pilot, 20 November 2026.** When the learner explicitly chooses E.1 qualification as an assignment, passing the four designated versions A–D ends its required work. That assignment then has no further required next step. Individually open skills remain available voluntarily or count towards another explicitly chosen assignment. An additional free-fall experiment retains its own evidence requirement. Existing atomic plans retain their stated scope. A historical part receipt without the planning-release binding at grading counts towards that part. The cockpit and coach explain its missing planning credit. A green check on the learning map marks a goal the learner demonstrated directly. The same check in gray marks credit supported by evidence from other work. Ending an obligation alone gives the goal no check mark.

A unit counter such as “2 of 3 required units demonstrated” is meaningful only for a fully structured scope. Where units are only partly declared, goal counters remain necessary for the other areas. Both counting methods must not be merged into one percentage without a stated denominator. Likewise, the number of released prerequisites must not appear as the number of goals actually worked through.

In the weekly workload, the real exam success counts **once** under its event contract. The derived unit display, multiple released atoms and later display of prior work create no further completion events. Evidence earned outside the current period remains earlier performance. New independent assessment attempts and retakes need an explicitly specified event contract; recalculating a display is insufficient.

Current practice permits repeating a known task even after viewing its solution. This remains useful when working through. For a new qualifying demonstration, an equivalent version unfamiliar to the learner is proposed. Where model choice is assessed, merely changing numbers while retaining the identical solution route is insufficient. This new quality rule is not implemented; until a suitable version exists, the known task can remain available for practice. Previously stored successes remain valid.

#### Proposal: Boundary with atomic recognition in force {#sec:proposal-contract-change}

The **applicable** decisions of 4 and 11 November use outstanding demand $N_U$, the own implicit set $I_U$ and their global union $\Meff$. Their operative formulas and R1–R5 remain in Sections~@ref{sec:transitive-demand} through~@ref{sec:period-accounting}. The 22 November decision governs the guided opening (Section~@ref{sec:unit-claims}). **The following changes to trigger and effect dated 19 November have not been adopted.**

R2 still supplies the subject-matter standard for releasing an individual atom. The task and rubric must make its full application essential to passing. The trigger and consequence change. Under the earlier model demand for an atom could cease before unit completion. In this unadopted proposal only a fully demonstrated unit activates a reviewed release for later prerequisites. The unit can pass while entire individual goals remain open.

The applicable atomic recognition model has its own checks. [validateLearningUnits.ts](repo:app/scripts/validateLearningUnits.ts) checks the applicable unit contract, including structure, R1, R3 and own ownership. The [reference evaluation](repo:app/scripts/lib/learningUnitRecognition.ts) checks the applicable set equations; fully global revision-bound derivation under R5 is not yet implemented. Under its current contract, the [backend evaluation](repo:backend/src/main/java/com/skillpilot/backend/completion/CompletionEvaluator.java) can treat ordinary goals as done within scope when outstanding demand disappears, without an exam having been passed. None of these mechanisms evidences the unit performance proposed here.

In the E.1 pilot, one passed assessment bound to the review in effect at grading, D, covers one named prerequisite for planning: accelerated motion. All four parts demonstrate the unit. The dedicated setting `skillpilot.completion.unit-assessment-pilot-enabled` defaults to false. Enabling the pilot adds the unit display and makes its planning credits available to the learning plan, frontier and coach. Grading creates the receipt for that version. The credit creates neither individual mastery receipts nor an additional completion event. Pedagogical acceptance and adoption as a general rule are pending.

:::sources
[Discussion document of 19 November](repo:docs/concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md); [Child unit review of 24 November](repo:curricula/DE/Gymnasium/quality/learning-units/physics-constant-acceleration-2026-11-24-v4.md); [Historical product decisions](repo:docs/concept/skill-graph/completion-semantics-clarification-2026-11-04.md); [Unified learning-plan status contract](repo:docs/concept/didactic/unified-learning-plan-status.md).
:::
