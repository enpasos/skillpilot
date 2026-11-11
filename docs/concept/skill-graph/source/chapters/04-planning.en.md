## Optional Acquisition and Time Planning: Sequence and Budget {#sec:levels anchors="12-learning-units-and-optional-planning-profiles,12-optional-curriculum-level-assignments"}

This section answers two planning questions: can the goals of a schedule be acquired in the proposed temporal sequence at all, and does the available time suffice? Both checks evaluate a reference plan rather than a learner's stored state.

:::principle {title="Status: Optional Planning Profile"}
Learning units carry domain coherence and recursive completion. An optional schedule assigns their acquisition targets to planning periods -- such as school years or semesters -- and checks available time capacity. That calendar assignment neither defines learning units nor alters base skill-graph validity or stored mastery, nor does it introduce technical unit locks. No production cross-subject budget validator is claimed.
:::

A domain learning unit may be acquired at different times across educational programs. Here a planning period denotes a scheduled interval -- figuratively a construction stage: competencies remain the building blocks and retain their domain prerequisites. Nothing here requires completing every subject of one calendar year before any later goal becomes accessible.

### Plan Scope, Entry Basis, and Single Initial Acquisition {#sec:plan-entry anchors="121-plan-scope-and-entry-basis"}

For a resolved reference plan $\pi$, let

$$
\begin{aligned}
T_\pi &\subseteq A && \text{planned acquisition targets},\\
B_\pi &\subseteq A \setminus T_\pi && \text{explicitly assumed entry basis},\\
n_\pi &\in \N_{>0}, \qquad \ell_\pi : T_\pi \to \{1, \ldots, n_\pi\} && \text{planning period}.
\end{aligned}
$$

The plan thus specifies what is to be acquired ($T_\pi$), what is assumed present at entry ($B_\pi$), and in which of the $n_\pi$ planning periods each target is acquired for the first time ($\ell_\pi$). The period sets and their prefixes are

$$
S_i = \{g \in T_\pi \mid \ell_\pi(g) = i\}, \quad S_{<i} = \bigcup_{j < i} S_j, \quad S_{\le i} = \bigcup_{j \le i} S_j.
$$

This calendar assignment (Figure~@ref{fig:levels}) references -- rather than replaces -- the domain acquisition ownership of learning units. Each planned target receives one initial acquisition period in the plan, while another educational program may place it differently. Subsequent review, deepening, or application constitutes additional scheduled activity rather than a second goal identity. $B_\pi$ is a planning assumption that writes no learner mastery; individual gaps inside that entry basis require separate diagnosis and extra study time.

::figure{id="fig:levels"}

### Structural Feasibility Through a Completion Witness {#sec:witness anchors="122-structural-feasibility"}

The assumed entry basis sets a planning horizon whose prior acquisition history is not reconstructed. Solely for this hypothetical reference-plan check, define

$$
\Rat^{\pi} = \{(a, b) \in \Rat \mid a \notin B_\pi\}.
$$

Let $\Frontier_\pi$ denote the frontier from @eqref{eq:frontier} evaluated over $\Rat^{\pi}$ and its full transitive closure. Every planned target and earlier planning period retains its full transitive demand; reconstruction stops only at declared entry competencies in $B_\pi$. That planning boundary never licenses stopping at mastered intermediates during real learner evaluation.

A *completion witness* for a planning period is an ordering of its targets in which each goal is available as soon as its turn arrives. A period $S_i$ of $s_i$ goals is structurally feasible when its elements can be enumerated as $a_1, \ldots, a_{s_i}$ such that

:::equation {#eq:level-witness}
a_j \in \Frontier_\pi\!\left(B_\pi \cup S_{<i} \cup \{a_1, \ldots, a_{j-1}\}\right) \qquad (1 \le j \le s_i).
:::

For instance, if $g$ requires $p$, both lie in the same period, and all of their remaining prerequisites are already satisfied, then $p, g$ is a completion witness whereas $g, p$ is not. Evaluation uses the global check domain, preserving inherited, cluster-expanded, and resolved cross-subject prerequisites; a normal-mode focus filter could mask relevant dependencies. The hypothetical witness uses neither direct-exam shortcuts nor anticipated implicit recognition.

For diagnostics, define the required atomic demand from @eqref{eq:demand} under the plan relation:

:::equation {#eq:reqatoms}
\ReqAtoms_\pi(g) = \{b \in A \mid (g, b) \in (\Rat^{\pi})^+\}.
:::

Existence of a completion witness necessarily implies

:::equation {#eq:level-closure}
\forall g \in T_\pi : \quad \ReqAtoms_\pi(g) \subseteq B_\pi \cup S_{\le \ell_\pi(g)}.
:::

Every required atom therefore belongs to the entry basis or is acquired no later than the dependent goal's own planning period. A required competence outside $B_\pi \cup T_\pi$ is an unplanned gap; a required target assigned to a later period is a sequence error. Same-period prerequisites remain valid whenever a witness exists. Base skill-graph validity -- including cycles after atomic expansion -- must already hold prior to this set check; the explicit witness ties period assignment to a concretely realizable acquisition sequence.

A finite decision procedure starts each period from $W^{(0)} = B_\pi \cup S_{<i}$ and iterates

$$
W^{(r+1)} = W^{(r)} \cup \bigl(S_i \cap \Frontier_\pi(W^{(r)})\bigr).
$$

It succeeds if and only if its fixed point contains all of $S_i$. Because satisfying additional prerequisites can never revoke availability of a still-open goal, any batch added simultaneously can also be acquired one goal at a time; conversely, no valid completion witness can fail this iteration prematurely. The procedure is a *hypothetical* traversal that alters no learner data; on a purely atomic DAG, prerequisite-respecting topological order recovers the familiar special case.

### Effort, Reserve, and Budget {#sec:workload-budget anchors="123-workload-feasibility"}

Structural feasibility does not yet prove that a school year affords enough time. Every workload claim must state reference learners, entry conditions, target and elective selections, calendar exclusions, estimation method, and uncertainty. Collecting those declared estimation assumptions of plan $\pi$ into $\Theta_\pi$, let $\widehat t_h(\Theta_\pi) \ge 0$ denote the estimated duration of an actual activity $h$ under $\Theta_\pi$. All quantities must share one calibrated time unit:

:::equation {#eq:budget}
\Work_\pi(i; \Theta_\pi) + \Reserve_\pi(i) \le \Budget_\pi(i), \qquad i = 1, \ldots, n_\pi.
:::

Here $\Work \ge 0$, $\Reserve \ge 0$, and $\Budget > 0$. Reserve remains protected and cannot simultaneously count as schedulable capacity; a zero buffer is permissible only when disclosed explicitly. Exam preparation or review already included inside $\Work$ must not be double-counted as reserve demand.

A declared activity model may set $\Work_\pi(i; \Theta_\pi) = \sum_{h \in \mathcal H_i} \widehat t_h(\Theta_\pi)$, where $\mathcal H_i$ counts each genuine effort item once: initial acquisition, targeted practice, card recall, assessment, and any other scheduled work. Shared canonical atoms are not counted twice as initial acquisitions across Mathematics and Physics, though dedicated application practice in Physics may legitimately add its own time. Uncalibrated “goal points” or `weight` values are never minute estimates. Table~@ref{tab:workload} illustrates separate accounting of work and protected reserve.

:::table {#tab:workload caption="Worked illustration: $\Work = 60$ and $\Reserve = 10$ fit inside $\Budget = 75$. The invented figures illustrate the arithmetic only rather than empirically validated durations of any SkillPilot curriculum." cols="42mm,22mm,X"}
| Illustrative item | Hours | Meaning |
| --- | --- | --- |
| Initial acquisition | 42 | Already deduplicated across shared goals |
| Practice and application | 12 | Additional scheduled activities |
| Assessment and review | 6 | Included inside planned work |
| Protected reserve | 10 | Not available for the work items above |
| Available time | 75 | Net of calendar exclusions |
:::

An aggregate budget alone is insufficient whenever individual subjects, rooms, or timetable slots impose binding caps: under a declared subject allocation, each subject slice must also satisfy $\Work_{i,s} + \Reserve_{i,s} \le \Budget_{i,s}$ without double-counting shared instructional time, and a dated timetable must schedule prerequisites ahead of their concrete use.

### Validity Claims and Completion Boundaries {#sec:plan-boundaries anchors="124-validity-and-progression-boundaries"}

Under this optional profile, a schedule and acquisition plan is valid when it is both structurally feasible and workload-feasible under its declared assumptions; without calibrated effort estimates, only the structural claim is admissible. Every feasibility claim binds the plan, curriculum revision, resolved scope, and estimation assumptions, without guaranteeing uniform learning speed across individuals.

Completion of a domain learning unit still follows the recursive goal-type and child-unit obligations from Section~@ref{sec:learning-units}. One calendar period may host several learning units, and one learning unit may span multiple calendar periods; nothing in this scheduling profile makes the entire preceding year a universal prerequisite for every subsequent goal.

:::sources
[Learning Units](repo:docs/concept/skill-graph/learning-units.md); [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md); [Curriculum Time Axis, Buffer Planning, and Pacing](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md).
:::
