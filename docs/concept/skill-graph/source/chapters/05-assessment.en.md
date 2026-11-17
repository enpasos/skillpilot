## Implicit Mastery Through Valid Local Assessments {#sec:assessment}

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

Assessment goals require passing their own assessment, and memory goals require verified recall of their cards. The remaining *unprotected* own goals are content and orientation goals. Experimental content goals are also subject to R1 and R2. Deriving satisfaction of an orientation goal means only that the introduction is settled (Section~@ref{sec:orientation}).

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
