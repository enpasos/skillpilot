# Assessment-Gated Completion and Prerequisite Discharge

A learner who can demonstrate the required outcomes should be able to take
the level's assessments directly and avoid unnecessary preparatory work.
This proposal distinguishes **explicit completion**, **work waived for a
particular level**, and **availability of the next learning goal**.
A level can be completed through suitable assessment evidence without
claiming that every preceding competence was independently demonstrated.

> **Design proposal — not current runtime behaviour.**
> This optional completion profile builds on the
> [Skill Graph](graph-definition.md) and [Curriculum Levels](curriculum-levels.md).
> It defines a derived learner-state overlay. Authored graph edges, stored
> mastery, the [normal frontier](graph-definition.md#9-learning-availability-and-progression)
> and the [current exam access gate](node-types.md#requires-semantics) remain
> unchanged until a separate implementation and migration decision.

## 1. Decisions and learner experience

The proposed profile makes the following decisions:

1. **A fixed level scope owns the completion claim.** Later-level goals and
   unselected optional assessments do not block this level's completion.
   Hiding a goal or changing the temporary learning focus never reduces its
   obligations.
2. **Every required assessment needs an explicit qualifying pass.** Optional
   task banks and alternative assessment forms are not additional compulsory
   exams. Existing required targets remain required until an authorised scope
   rule explicitly resolves a choice.
3. **Waivers require reviewed assessment evidence.** A prerequisite path is
   not proof of assessment coverage. Ordinary goal completion can discharge
   a demand, but cannot by itself authorise an assessment-based waiver.
4. **Shared prerequisites stay open while a participating consumer needs them
   directly or indirectly.** An enabled waiver takes effect only after every
   such consumer is complete or itself legitimately waived.
5. **Waived work never becomes global mastery.** A later learning context may
   require a separate demonstration of that competence. The earlier level's
   completion remains a claim about its own scope and evidence snapshot.

The learner deliberately chooses either the normal learning route or a direct
attempt at an eligible level assessment. A qualifying pass is saved before
any waiver is derived. Failure offers targeted support and another suitable
attempt; it does not remove existing success or create completion evidence.

The interface distinguishes **completed with explicit evidence**, **separate
work waived for this level**, and **still open**. It names any required
assessment still to pass. It does not describe waived targets as individually
mastered skills or merge them into the global mastery percentage.

## 2. Resolve the level and its obligations

For one learner, fix a curriculum revision, an applicable completion-profile
revision, and the authoritative level placement and selection. Let $T_i$ be
the full set of required atomic targets of level $i$. Resolve any authored
elective choices before computing completion. Neither a display filter nor
Level-3 focus is an input to this resolution.

Let $Q_i$ be **all required assessment goals in $T_i$**, with
$\varnothing\ne Q_i\subseteq T_i$. Each must be passed explicitly. If the
curriculum permits alternative endpoints, the applicable selection contract
must resolve which endpoint is required; this proposal adds no new selector
and silently removes no current target. Equivalent task forms for the same
assessment endpoint do not create additional goal obligations.

Include the prerequisites needed to interpret these targets, including
inherited, cluster, cross-landscape, cross-subject and `prerequisiteOnly`
requirements. Do not include an unrelated future consumer merely because it
also needs one of these prerequisites. Such a consumer belongs to its own
completion context. Preserve the distinction between $T_i$ and supporting
prerequisites throughout; adding a prerequisite to the context never promotes
it to a target.

### One canonical atomic demand relation

An arrow $B\to A$ means **B requires A**. The overlay counts **all direct and
indirect atomic requirements**, so equivalent atomic and cluster
representations do not produce different waiver results.

First resolve the applicable graph and all references, before restricting it
to this level. For its atomic goals $A$, expand
[Graph Definition §12.2](graph-definition.md#122-structural-feasibility):

$$
F=\{(a,b)\in A\times A\mid b\in RequiredAtoms(a)\},
\qquad D=F^+.
$$

Taking closure **after atomic expansion** matters: an atom inside a required
cluster can have its own prerequisites. Reject missing references and any
reflexive pair in $D$, which also detects a cyclic expanded requirement.
Define the prerequisite-closed context and its demand relation by:

$$
\begin{aligned}
V_H&=T_i\cup\{b\mid\exists t\in T_i:(t,b)\in D\},\\
R_H&=D\cap(V_H\times V_H).
\end{aligned}
$$

Write $H=(V_H,R_H)$ for this resolved obligation context.
$R_H$ is a finite, irreflexive, transitive demand relation. Its pairs are
derived dependency obligations, not additional authored edges. For example,
$C\to B\to A$ resolves to $(C,B)$, $(B,A)$ **and $(C,A)$**. Even when B is
explicitly complete, an open C still prevents a waiver of A. Omitting the
indirect pair would waive A while the normal transitive frontier could still
require it for C. Adding a redundant authored edge cannot change this result.

This is a derived relation for work discharge. It neither edits the authored
graph nor substitutes for the normative frontier. Equivalence here means
identical resolved atomic prerequisite reachability; it does not assert that
every cluster refactoring preserves all other runtime behaviour.

The context identity binds the learner, curriculum and profile revisions,
level, resolved choices, target roles and dependency resolution. An evidence
snapshot identifies the particular calculation. Different subject views of
the same canonical goal must not duplicate its identity or evidence.

## 3. Evidence and permission to waive work

Let $E\subseteq V_H$ contain goals with persisted explicit completion evidence
accepted for this profile and snapshot. Ordinary, orientation and memory
results retain their respective [goal-type semantics](node-types.md).
For assessments, acceptance requires the qualifying evidence described below.
An assumed entry basis, an opened exam, a failed submission or an unsupported
mastery estimate never becomes a qualifying pass.

Let $P\subseteq V_H$ contain **every assessment, orientation and memorisation
goal**, together with any other goal that the applicable type or curriculum
contract makes non-waivable. This profile introduces no exception for those
types. Protection preserves an existing obligation; it does not create a new
target or make every available practice assessment compulsory.

### Reviewed waiver rules

The profile declares a finite set of reviewed rules $(S_r,W_r)$:

- $\varnothing\ne S_r\subseteq Q_i$ identifies the assessment passes required
  together to enable the rule.
- $W_r\subseteq V_H\setminus P$ identifies the ordinary atomic learning goals
  whose separate work those passes justify waiving.
- Every $v\in W_r$ must be a strict prerequisite of at least one supporting
  assessment: $\exists q\in S_r:(q,v)\in R_H$.

The simplest profile has **one rule**, with $S_r=Q_i$ and a reviewed set of
waivable goals. Separate rules are useful only when independently sufficient
assessment groups justify earlier waivers. These are conceptual policy
inputs, not a new authored edge type or an implemented schema.

A review must establish the substantive justification for each $W_r$ from
the assessment tasks, [declared coverage](../runtime-workflows/exam-preparation-planning.md),
rubrics and permitted conditions. `requires` reachability and
`examData.coveredGoalIds` alone cannot establish that justification. A total
passing score must not allow a critical required outcome to be compensated
away: use reviewed minimum criteria where needed, or keep the affected target
explicit-only. Practical performance, recall and other distinct outcomes
cannot be replaced by an unrelated written result. The waiver claims adequate
evidence for this completion policy, not independent proof of every atom.

Only accepted **explicit evidence** enables a rule:

$$
W(E)=\bigcup_{r:\ S_r\subseteq E}W_r.
$$

Derived waivers never enable another rule by pretending to be assessment
evidence. Explicitly completing an ordinary goal can remove its outstanding
demands, but without an enabled rule its prerequisites acquire no waiver.
Goals without a reviewed rule remain explicit-only. The strict-prerequisite
condition excludes isolated targets from waiver eligibility.

### Qualifying passes and repeated attempts

A qualifying assessment pass must be traceable to the assessment endpoint,
task form and content/rubric revision, the applicable pass criteria and
conditions, an authorised evaluation, and successful persistence. Store only
the evidence metadata necessary for that decision under the existing privacy
contract; this concept does not authorise storing learner answers or chat.

The [current exam workflow](node-types.md#scoring-and-mastery) permits unlimited
same-task retries and reveals the solution after grading. For this profile,
assess known solution exposure **before and during independent submission**.
Showing the task alone is not solution exposure. Feedback supplied after a
qualifying attempt does not retrospectively invalidate that pass.

A later attempt at a form whose solution is already known remains practice.
A qualifying retry needs a different, reviewed equivalent form; cosmetic
rewording of the solved task is insufficient. Exposure handling uses recorded
platform history and declared prior exposure. It cannot prove that a learner
has never seen a public solution elsewhere; state this limit and do not claim
proctored or identity-verified certification. An exhausted form pool leaves
the qualifying route unavailable. Ordinary learning remains available, but
cannot complete this profile until its required qualifying passes exist.

Before enabling this profile, specify reliable form/exposure handling and
equivalence review, with sufficient forms and a defined process to review and
supply further forms. Show missing assessment availability as a provision
gap, not learner failure. Unknown form or exposure provenance cannot silently
be treated as qualifying. Minimal exposure metadata can support this
requirement; it does not require saving failed scores or submissions, and
does not alter the current no-success-write-on-failure rule.

Existing passes retain their recorded meaning. They count for this profile
only when their evidence meets its criteria or an explicit, reviewed
compatibility decision establishes equivalence. A legacy scalar mastery value
alone cannot do so. Do not invent a general expiry period; any requalification
must follow a declared evidence or goal-type rule.

## 4. Derive waived work with a least fixed point

For fixed $H$, policy and evidence snapshot, define all participating goals
that directly or indirectly require $v$:

$$
Consumers_H(v)=\{u\in V_H\mid(u,v)\in R_H\}.
$$

Starting only from accepted explicit results, add eligible work whose every
incoming consumer is already complete or waived:

$$
\begin{aligned}
X_0&:=E,\\
X_{n+1}&:=X_n\cup
\{v\in W(E)\mid Consumers_H(v)\subseteq X_n\},\\
X_*&:=\bigcup_{n\geq0}X_n,\qquad I:=X_*\setminus E.
\end{aligned}
$$

$I$ is the set of work waived **only in this context**. The iteration is
monotone for fixed inputs and reaches its least fixed point after at most
$|V_H\setminus E|$ rounds that add a goal. In particular,
$I\cap P=\varnothing$. No empty-consumer shortcut can waive an unrelated goal,
because every candidate is tied to an enabled, reviewed assessment rule.

Because $R_H$ contains every resolved prerequisite path, a waived goal cannot
be a prerequisite of any still-open goal in this context:

$$
v\in I\ \Longrightarrow\
\{u\in V_H\mid(u,v)\in R_H\}\subseteq X_*.
$$

This prevents a waiver from removing work that an open target in the same
profile still needs. Consumers in a different context remain a separate case.

Demand status is also derived:

$$
Discharged_H=\{(u,v)\in R_H\mid u\in X_*\},
\qquad Active_H=R_H\setminus Discharged_H.
$$

Completion of a consumer discharges its outgoing demands. When an ordinary
goal becomes waived, its demands discharge in the next iteration. Propagation
stops at an open consumer, an ineligible goal or a protected goal without
explicit completion. Do not persist these statuses by editing graph edges.

An **active demand** is not the same as an unsatisfied prerequisite. If C is
open and A explicitly mastered, $C\to A$ is active even though A itself
satisfies the ordinary mastery test. Conversely, $A\in I$ implies neither
$A\in M_A$ nor $Sat(A,M_A)$. The fixed point never changes stored results.

## 5. Worked examples and level completion

B and C are required, protected assessments. Both require A; A requires D.
The reviewed rule requires **both passes** before A or D is eligible for a
waiver:

$$
\begin{aligned}
R_H&=\{(B,A),(C,A),(A,D),(B,D),(C,D)\},\\
T_i&=V_H=\{A,B,C,D\},\quad P=Q_i=\{B,C\},\\
(S_r,W_r)&=(\{B,C\},\{A,D\}).
\end{aligned}
$$

![Two stages showing the immediate prerequisite arrows; the calculation also includes B to D and C to D. With only B passed, the waiver rule is not enabled. With both B and C passed, the reviewed rule enables A and D; A is waived in round 1 and D in round 2. Neither result creates mastery.](assets/assessment-gated-completion.svg)

The figure shows the immediate arrows for readability. The calculation also
counts the indirect demands $B\to D$ and $C\to D$: D has three consumers,
A, B and C, and becomes waived only after all three are done.

| Explicit $E$ | Enabled $W(E)$ | Waived $I$ | Interpretation |
| --- | --- | --- | --- |
| $\varnothing$ | $\varnothing$ | $\varnothing$ | No passes and no waivers. |
| $\{B\}$ | $\varnothing$ | $\varnothing$ | B's demands are discharged; C remains required. |
| $\{B,C\}$ | $\{A,D\}$ | $\{A,D\}$ | A is waived in round 1, D in round 2. |
| $\{A\}$ | $\varnothing$ | $\varnothing$ | A discharges its demand on D, but no assessment rule enables a waiver. |
| $\{A,B,C\}$ | $\{A,D\}$ | $\{D\}$ | A keeps its explicit result; only D is waived. |

If an additional **required target** Z in this level also requires D and
remains open, D stays open after B and C pass. If Z belongs only to a later
level, it is outside this context and does not block this level's waiver.
If Z is an unrelated required target, it remains explicit-only. If D is a
protected memory goal, it cannot occur in $W_r$ and needs its own explicit
completion wherever it is a target.

For this optional profile:

$$
Complete(i,H,E)\iff(Q_i\subseteq E)\land(T_i\subseteq X_*).
$$

All required assessments must pass, and every required target must be
explicitly complete or legitimately waived. The assessment clause is written
explicitly for clarity; it also follows from $Q_i\subseteq T_i\cap P$.
Only targets count towards level completion and its denominator. Supporting
prerequisites retain their role even when their separate work can be waived.

**Passing the assessments alone is sufficient only for a profile that proves
that claim.** Review the coverage and waiver rules, then evaluate the fixed
point with $E=Q_i$. The claim holds exactly when $T_i\subseteq X_*$ in that
case. If protected orientation, recall or other explicit-only targets remain,
state them as additional completion conditions. This calculation validates
the policy's consequences; it is not evidence of assessment quality.

## 6. Direct assessment access and subsequent learning

The proposed direct route allows the learner to deliberately attempt a
required assessment in $Q_i$ even when didactic prerequisites keep it outside
the normal frontier. Offer this route for every $q\in Q_i\setminus E$,
including an endpoint whose ordinary mastery marker is already 1 but lacks
qualifying evidence for this profile. Do not reset that earlier result to
permit the new attempt. This explicit route changes assessment eligibility
only; learner authorisation, resolved scope, assessment conditions and the
requirement to grade and persist a qualifying full submission still apply.
An attempt alone writes no completion or waiver. Failure preserves the
current no-success-write rule and offers targeted remediation without
silently enlarging the learner's selected scope.

A failed persistence operation cannot enable a waiver or produce a claimed
completion. A later successful retry of that write must remain one result
for the same evaluated attempt, not a second assessment event.

The normal learning route remains available. A level-completion result never
adds blanket prerequisites between levels and never substitutes $X_*$ for
the actual mastery set. In an explicitly active completion profile, pending
target work is $T_i\setminus X_*$. Ordinary recommendations come from its
intersection with the existing frontier; the direct assessment route is
offered separately. Do not recommend waived work as unfinished work in this
same profile. Voluntary review remains available. If pending ordinary work
has no available goal, distinguish the learner's current focus restriction
from missing prerequisite evidence. Offer appropriate support; any focus
change follows the existing selection and continuation rules and needs
learner acceptance. An empty frontier proves neither level completion nor
permission to widen focus automatically. After completion, offer closing the
level or moving to another profile, and wait for the learner's choice.

For subsequent learning:

1. Determine availability from real results under the existing normal/strict
   and focus contracts.
2. If an earlier waived competence is now a blocking requirement, explain
   that its separate work was waived for the earlier level and that this new
   learning goal still needs evidence. Preserve the earlier completion claim.
3. Offer a targeted demonstration through the ordinary goal-type workflow or
   suitable learning support. Persist mastery only from new appropriate
   evidence, and wait for the learner's choice before starting that work.

Where normal focus rules already permit entry, introduce no additional block
because of this profile. A waiver must not be exported into another level,
subject, plan or global frontier as mastery. A target can therefore contribute
to a completed level while still lacking an individual global competence
record; show the two claims with their named scopes.

## 7. Recalculation and adoption requirements

Keep a completion statement bound to its scope, profile, curriculum revision
and accepted evidence snapshot. Adding a later-level consumer cannot rewrite
that earlier claim. Changing a target selection, waiver rule, prerequisite
revision or applicable evidence creates a new calculation; do not silently
carry the old completion into new obligations. A historical completion and a
current reassessment remain distinguishable, including for goal types whose
current completion can change, such as memory.

Within fixed scope and policy, $E\subseteq E'$ implies
$X_*(E)\subseteq X_*(E')$: adding accepted evidence cannot reopen completed
or waived work. A previously waived goal may instead become explicitly
complete, so the set $I=X_*\setminus E$ itself need not grow. Across changed
scopes, policies or withdrawn evidence, recompute instead of assuming
monotonicity. Never use an earlier derived waiver as an explicit input to the
next calculation. Explain which changed obligation or evidence rule leaves
work open.

A future implementation needs one authoritative backend resolver for the
scope, accepted evidence, normalised demands and fixed point, with a
consistent snapshot and a reviewable reason for each waiver. Learner views,
coach tools and planning must consume that same result. Keep explicit and
waived counts separate; a plan may remove waived work from its remaining
schedule only through an explicit integration contract. Waivers create no
goal-success events, learned-goal counts or weekly quota credit, and do not
rewrite the fixed planning baseline or invent learning-time savings.

The independent [structural feasibility and workload checks](curriculum-levels.md)
remain mandatory for any claim made under those profiles. Direct exam access
does not justify a cycle, a later-level prerequisite or an unsupported workload.
Local mathematical checks do not establish task quality, reliable grading or
learner benefit; these need reviewed assessments and learner trials.

The minimum review matrix is:

| Case | Required result |
| --- | --- |
| Only B passed; then B and C passed | No waiver, then A and D in successive rounds under the example rule. |
| Only ordinary A completed | Its demand discharges, but D receives no assessment-based waiver. |
| Protected or isolated required target | No derived completion; appropriate explicit evidence remains required. |
| Open additional in-level consumer of D | D remains open even if its waiver rule is enabled. |
| Later-level consumer; hidden in-level consumer | The former does not block this level; hiding the latter changes nothing. |
| Optional exam or alternative form | No new target or compulsory pass merely because the task is available. |
| Equivalent atomic, cluster and transitive representations | Same resolved atomic reachability produces the same $R_H$ and waiver result. |
| Open C requires B, B requires A, and B is explicit | C's indirect demand keeps A open even if a separate assessment enables its waiver rule. |
| Missing reference, reflexive or cyclic atomic expansion | Reject the profile calculation with an identified cause. |
| Inadequate coverage or compensable critical outcome | No approved waiver rule for the affected target. |
| Failed exam, known-solution retry or unqualified legacy result | No qualifying pass is manufactured. |
| Ordinary exam mastery is 1 but its pass does not qualify | Permit a qualifying attempt without resetting the existing result. |
| First qualifying pass followed by solution feedback | Preserve the pass; later same-form retries do not create fresh qualifying evidence. |
| More accepted explicit evidence at fixed scope and policy | Completed-or-waived work stays complete; a waiver may become explicit completion. |
| Active profile continuation | Recommend pending available targets, offer direct assessments separately, and never silently repeat waived work. |
| Failed write, concurrent evidence change or replay | No optimistic waiver; use one consistent persisted snapshot and idempotent result. |
| New context or later learning goal | Recalculate scoped work; preserve real mastery and historical claims. |
| Every derived update | Explicit evidence, target roles and authored graph remain unchanged. |

This document specifies a proposed policy. It announces no enabled level
schema, deployed exam bypass, new API or migration of learner data.
