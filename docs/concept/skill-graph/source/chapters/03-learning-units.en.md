## Declared Units: Structure, Order, and Evidence {#sec:learning-units}

**Applicable structure and recognition contract.** Completion Equation~@eqref{eq:unit-complete} and recognition before full completion remain in force. The separate proposal of 19 November appears in Section~@ref{sec:proposal-unit-completion} and in Section~@ref{sec:proposal-unit-assessment}. “Target model” here means confirmed target requirements; the motivation draft of 17 November is labelled as a proposal.

A learning unit connects a learning promise to a coherent path through its goals. When a unit has assessments of its own, it introduces the topic through a dedicated opening and its assessments show what learners can apply independently by the end. The opening is a proposal of 17 November for the regular learning path.

:::principle {title="Cluster, Unit, Unit With Assessments"}
A **cluster** groups goals. A declared **unit** can be studied as one continuous block in the intended learning flow. A **unit with assessments** demonstrates independent application of its own content goals through its own assessments with reviewed coverage. An assessment-free unit can order goals and child units. Subjects serve as filters on the learning map.
:::

:::principle {title="Subject Units and Plan Units"}
Subject units describe conceptual steps that apply across the Länder. **Plan units** organise the shared plan across the subjects selected for one Land and duration model. They include stages, years and phases. Different Länder may therefore schedule the same subject unit at different points.
:::

### Motivation and Distinct Domain Claims {#sec:unit-claims}

A unit’s **learning promise** describes what learners will be able to do and why it matters. The 17 November proposal suggests that every unit with assessments of its own has exactly one **motivation goal** of its own. This is an atomic orientation goal. The backend supplies the coach with the learning promise and the relevant details of the active unit. The coach illustrates its purpose with a concrete situation where possible. For the dot product, the coach might begin: “Your path on the map heads northeast. By the end you can show how much of the journey takes you east and use that to explain the dot product.”

The [proposed short opening](repo:docs/concept/skill-graph/learning-unit-motivation-concept-2026-11-17.md) uses an application example written for the motivation goal and attributed to SkillPilot as a didactic contribution. Section~@ref{sec:orientation} describes how the coach guides and concludes the opening.

Learners can ask for a short review during the conversation. If the current unit has suitable flashcards, the coach can also offer them once a concept has been explored. The learner can practise the cards or carry on with their question. After practice the coach returns to the open question at the same learning goal. Learners who ask for an explanation get one in the conversation. Practice updates the card review schedule. A unit that expressly requires verified recall has a separate check for it.

A simplified example with two content goals shows how the graph represents a learning path. In Figure~@ref{fig:unit-entry-paths}, assessment $\nd{q}$ requires content goal $\nd{b}$, which requires $\nd{a}$, which in turn requires the opening $\nd{m}$. Each arrow points from a goal to its prerequisite. A learner following the intended order starts at $\nd{m}$ and works through $\nd{a}$ and $\nd{b}$ towards the assessment. The subject-matter coverage review establishes whether the tasks and their grading actually demonstrate application of $\nd{a}$ and $\nd{b}$.

::figure{id="fig:unit-entry-paths"}

**Proposed edge rule.** Every atomic goal the unit owns, apart from orientation goals, reaches its motivation goal along a prerequisite path. This also applies to exercises represented as own goals. The motivation goal requires no content goals. Direct references to it come from within its unit. Starting from the other prerequisites, a tool adds the desired connections and writes direct motivation edges only where no other path provides the connection. This lets the first content goal require both the opening and prior knowledge from a child unit or another subject. The complete graph must be acyclic and transitively minimal.

**Proposal of 17 November.** A child unit with its own assessments has its own opening too. The parent explains the broader purpose and the child introduces the next conceptual step. **It remains open** whether the child’s motivation should require that of its nearest enclosing unit with assessments. The current proposal recommends the unit’s own opening when a learner starts the whole unit. A mandatory edge would also apply to someone who needs just one of the child’s goals as preparation for another subject. Such an edge would require a limited exception to prerequisite-free orientation and compatible placements in each Land plan.

The unit boundary follows a meaningful conceptual transition. A few well-founded prerequisites can support such a transition. A questionable edge is reviewed on its subject-matter merits independently of the desired grouping. The [design criteria](repo:docs/concept/skill-graph/learning-unit-design-and-examples.md) give examples.

At full rollout each content goal, including an experimental one, belongs as an own goal to a unit with motivation and assessments. Its assessments sit in its cluster and cover its own content goals under R1 to R5. A parent synthesis assessment can also require learners to combine content from several children. An aggregate without assessments of its own can connect its children through order alone. During rollout assessment-free units may also order content goals of their own.

Tasks and rubrics should reveal essential misconceptions. A learner who encounters a gap practises that skill. An equivalent task on a later attempt can show whether they can apply it in a new situation. Section~@ref{sec:exams} describes the rules for retakes. An **assessment gap** exists if coverage of a content goal lacks subject-matter evidence. Repair requires appropriate tasks, solutions and rubrics with independent review.

### Own Goals, Child Units, and Total Scope {#sec:unit-own-children}

All the atomic goals beneath a unit $U$'s cluster form its **total scope** $T(U)$. The units immediately below it form $\Children(U)$. Each atom in its scope that belongs to none of these child units is an **own goal** of $U$. These goals form $\Own(U)$. Direct child units and own goals together are the unit's **children**. An intervening cluster used purely for grouping is skipped when assigning goals to units.

:::equation {#eq:unit-targets}
T(U) = \Own(U) \cup \bigcup_{V \in \Children(U)} T(V).
:::

Total scope is non-empty. An aggregate may have no own goals when its children carry the scope. E1 makes each contained atom's smallest unit unique. Overlapping references create neither extra goals nor duplicate progress points. Goals and units without a parent unit are children of an imaginary root. In a full Land plan every goal lies inside one of the two stages; the nationwide canonical structure is no Land plan and may carry goals beside its top units.

#### Representation in the Unit Entry {#sec:unit-representation}

The entry in the placement layer references the cluster and carries the learning promise, revision and any `after` declarations. For a unit with assessments it identifies the coverage reviews of its own assessments. The proposal of 17 November would add a reference to its own motivation goal. References keep the goals and assessment data in their canonical locations.

:::table {#tab:unit-representation caption="Unit entry under the existing contract and in the target model." cols="30mm,46mm,X"}
| Item | Existing contract | Target model |
| --- | --- | --- |
| Subject unit | `programUnits`, kind `learningUnit`, `promise`, `promiseEn`, `revision` | Declared cluster in the same placement layer; promise and revision remain. |
| Own goals and children | `goalPlacements` with `relation: own`, no `context`, and `parentUnitId` | Derived from `contains` and nested unit declarations. |
| Opening (proposal of 17 November) | The three existing subject units already carry a learning promise. | A reference to exactly one own motivation goal per unit with assessments of its own. |
| Coverage reviews | `coverageReviews`, at most one per own assessment, bound to task and rubric hashes and a review record | Required for units with assessments. |
| Plan units | Stage-plan foundation under `v1.3`, without an activated Land plan | One shared plan per Land and duration model; views are derived excerpts. |
| Completion and results | No stored unit mastery | Still derived; no writing back to goals and no recognition from `after`. |
:::

**Implementation status.** The three subject units in [package contract 1.2](repo:contracts/curriculum-package/v1.2/README.md) use `learningUnitsV1`. They have no unit motivation goal yet. The validator checks R1, R3 and unique assignment through `own`, among other requirements. The [stage-plan foundation](repo:contracts/curriculum-package/v1.3/README.md) is separate. A new contract version is planned for the opening reference. Before a subject-wide anchor is replaced, the route checks must recognise unit openings within the relevant scope.

Introduction of the new unit structure follows measurement F8. F9 to F13 include package representation, validation and the learning runtime. Subject-matter repairs to goals, prerequisites and assessments under K1 to K13 can proceed in parallel with current independent evidence. Changing a goal listed in the frozen V9 registry ends the historical review transfer for that goal.

### Completion Without Additional Stored Unit Mastery {#sec:unit-completion}

The full unit is complete exactly when its own goals are satisfied and all required child units are complete:

:::equation {#eq:unit-complete}
\Complete(U) \iff \bigl(\Own(U) \subseteq \Meff\bigr) \;\land\; \bigwedge_{V \in \Children(U)} \Complete(V).
:::

Figure~@ref{fig:unit-entry-paths} illustrates the distinction between a **required portion** and a **whole unit**. Suppose a physics goal needs only $\nd{a}$ from this mathematics unit. The introduction $\nd{m}$ and the external prerequisite $\nd{p}$ then also enter the Personal Curriculum. Once both and $\nd{a}$ are satisfied, this part of the mathematical preparation is complete. Completing the mathematics unit also requires $\nd{b}$ and assessment $\nd{q}$.

Figure~@ref{fig:recursive-unit} shows two learner states in mechanics. In the first, kinematics and dynamics are complete and the shared synthesis assessment is open. In the second, the synthesis assessment is passed while assessments and card recall in the child units remain open. In both cases the mechanics unit as a whole is still open. Its status follows from the goal outcomes.

::figure{id="fig:recursive-unit"}

#### Proposal of 19 November: representative unit completion {#sec:proposal-unit-completion}

**Proposal not yet adopted.** A declared subject unit could demonstrate a bounded learning promise at a named level through representative final performances. This differs from complete atomic satisfaction under applicable Equation~@eqref{eq:unit-complete}. Required work on this route would end without recording skipped individual activities as performed. Existing atomic learning assignments retain their scope.

The proposed contract binds identity, learning promise, level, revision $\rho$, own required evidence $\operatorname{OwnEvidence}(U,\rho)$ and required children $\Children_{\mathrm{req}}(U,\rho)$. **Only for this proposal**:

:::equation {#eq:unit-complete-proposal}
\begin{aligned}
\Complete(U,\rho) \iff {}& \operatorname{Valid}(U,\rho)\land\operatorname{OwnEvidence}(U,\rho)\\
&\land\!\bigwedge_{V\in\Children_{\mathrm{req}}(U,\rho)}\Complete(V,\rho_V).
\end{aligned}
:::

In the proposal, $\operatorname{Valid}$ requires an expressly declared, subject-approved contract with real obligations; an empty list is insufficient. $\rho_V$ binds the child's revision. Pure aggregates can bundle real required children. Without an approved direct assessment route, scheduled individual obligations remain necessary. Every independent required exam needs its own valid pass; expressly declared practical or recall obligations apply on both routes. Performing an experiment is no general extra obligation for every unit. Where an individual atom's claim requires own performance, however, neither dialogue nor assessment can evidence that whole atom solely through analysis of supplied data.

The E.1 trial combines two existing child exams with new own parts A and B. All four are required. A child can release its own ordinary atoms only through its own passed, revision-bound contract; parent completion gains no authority over child or foreign-subject atoms. Details, the deliberate delay in release and open decisions appear in Section~@ref{sec:proposal-unit-assessment}.


### Recognition Before Overall Completion {#sec:unit-early-recognition}

Before the whole unit is complete, a content goal of its own can already count as independently applied and its motivation goal as a completed opening. The valid contract of the responsible unit determines this (Section~@ref{sec:assessment}). A child therefore retains recognition of its goals while the parent synthesis assessment is still open.

Figure~@ref{fig:orientation-outcome} shows how an open assessment or memory goal affects this inference. Section~@ref{sec:global-effect} specifies the binding to a contract revision.

### `after`, Atomic Demand, and Rules E1 to E4 {#sec:unit-progression}

`U after V` orders all atoms of U after all atoms of V in the intended learning flow. This order connects sibling units, including children of the imaginary root. It identifies what comes later in the plan. A claim about where learners will use something again requires a concrete application. `requires` connects atomic goals and expresses their preparation needs. Assessments are endpoints of the learning path. A synthesis assessment may require content from its child units, while their assessment results count as independent obligations for full completion.

:::table {#tab:unit-ordering caption="Binding ordering rules; each structure is checked separately." cols="14mm,X"}
| Rule | Requirement |
| --- | --- |
| E1 Tree | Units are nested or share no atoms; each contained goal has at most one smallest unit. In the full Land plan every goal has exactly one learning placement. R4 expresses this uniqueness in local assessment-contract terms. |
| E2 Learnable in one block | An ordering of all atoms exists that respects every direct and transitive demand and every `after`, with each unit forming one continuous block. |
| E3 Complete | If a requires b, inspect their smallest common unit, or the imaginary root. If a and b lie in two different child units there, the child of a must lie after the child of b through the declared `after` closure. If at least one child is an own atom, demand itself orders it. |
| E4 Sparse | Among the children of the same unit, no declared `after` follows already from the other `after` declarations there. Canonical and Land structures are checked separately. |
:::

For E2, inspect the children of each unit, including the children of the imaginary root. Child $X$ depends on child $Y$ if $X$ declares `after` $Y$ or an atom in $X$ requires one in $Y$. This graph must be acyclic at every level. To see why this is a separate check, take $a\to b\to c$. The learning order is $c,b,a$. If $a$ and $c$ belong to one unit and $b$ to another, learners must leave the first unit and return to it later. The grouping then needs subject review.

E3 checks the order against the goals’ actual prerequisites. E4 checks each hierarchy separately for redundant ordering. A subject order can still be needed even when two years already follow the same order in a Land plan. Minimality of atomic prerequisites has its own check (G17).

:::principle {title="Selection Among Reachable Goals"}
`after` orders suggestions among already reachable goals. Explicit learner choice and the dated learning plan retain priority. Focus rules and direct assessment access continue to apply. B9 thereby supersedes the former access profile `GD-U14` with `Open` and `Cleared`.
:::

#### “Unit by unit” learning mode. {#sec:unit-by-unit}

When suggesting the next goal, the “unit by unit” mode considers only reachable goals. Three terms describe which of these to offer first.

- A child is **done** once all its atomic goals in the Personal Curriculum $L$ are effectively mastered. For a child unit $V$ this means $T(V)\cap L\subseteq\Meff$. Any outstanding assessments and card recalls within that portion count.
- A unit is **started** when at least one goal in this portion is satisfied and at least one remains open.
- An open child is **up next** once its predecessors among its siblings are done. Declared `after` relations and atomic prerequisites crossing between children determine these predecessors.

Selection starts at the imaginary root. At each level it considers children with at least one reachable goal, in the following order:

1. an open child unit that is both **up next** and already **started** (finish an already started unit coherently);
2. otherwise an open child (child unit or own atom) that is **up next**;
3. otherwise an open **started** child unit (when prior skipping left a predecessor open);
4. otherwise any child still containing a reachable frontier goal.

When the selected child is a unit, selection continues inside it by the same rule until it reaches an atomic goal.

For this learning mode, the proposal is to recommend the opening of the unit that is up next when the learner starts it. Section~@ref{sec:orientation} describes entry with a narrower focus, deliberate direct assessment selection or no prior progress. Implementation of the “unit by unit” learning mode is pending.

In a complete Land plan the two units at the root are lower and upper secondary education, in that order. If an atom from the later stage is already required in the earlier one, the dependency needs subject review and the preparation must be placed appropriately. Parent units are ordered first. Each subject leaf unit must then be shown to fit entirely within one plan unit in each of the 16 Länder. The children of a larger unit may span several plan units. In that case the larger unit appears as a whole only in the nationwide subject view. Appendix~@ref{sec:implementation} records progress in enforcing these rules.

:::sources
[Units and their wiring](repo:docs/concept/skill-graph/learning-unit-wiring-concept-2026-11-14.md), [Unit motivation proposal](repo:docs/concept/skill-graph/learning-unit-motivation-concept-2026-11-17.md), [Stage decisions and handover](repo:docs/dev/stage-plan-units-handover-2026-11-15.md), [Stage-plan foundation](repo:contracts/curriculum-package/v1.3/README.md), [Recognition and global completion](repo:docs/concept/skill-graph/assessment-gated-completion.md).
:::
