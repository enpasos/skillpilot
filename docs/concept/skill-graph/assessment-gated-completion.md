# Assessment-Gated Completion and Prerequisite Discharge

A learner who can demonstrate the required outcomes should be able to take
the level's assessments directly and avoid unnecessary preparatory work.
This proposal computes **completion of a learning scope** from the existing
mastery results and reviewed curriculum rules. It does not change what it
means for an individual learning goal to be achieved.

> **Binding data-model boundary.** Mastery remains the single stored outcome
> for each learning goal. An assessment goal with mastery is passed and counts
> immediately. There is no additional qualifying pass, profile-specific
> recognition, evidence record or stored waiver state for that goal. Completion
> of a level and preparation no longer required for it are derived results.

> **Design proposal — not current runtime behaviour.**
> This optional completion profile builds on the
> [Skill Graph](graph-definition.md) and [Curriculum Levels](curriculum-levels.md).
> It defines a derived view of the existing learner state. The
> [normal frontier](graph-definition.md#9-learning-availability-and-progression)
> and the [current exam access gate](node-types.md#requires-semantics) remain
> unchanged until implementation of the proposed access and continuation rules.
> The profile introduces no additional learner-result storage.

## 1. Decisions and learner experience

The proposed profile makes the following decisions:

1. **A fixed level scope owns the completion calculation.** Later-level goals
   and unselected optional assessments do not block this level's completion.
   Hiding a goal or changing the temporary learning focus never reduces its
   obligations.
2. **Every required assessment needs mastery.** A passed assessment counts in
   the same way as any other achieved learning goal. Optional task banks and
   alternative assessment forms are not additional compulsory exams. Existing
   required targets remain required until an authorised scope rule resolves a
   choice.
3. **Waiver rules are reviewed curriculum rules.** A prerequisite path is not
   proof of assessment coverage. Authoring review determines which mastered
   assessment goals justify waiving which preparation. Ordinary goal mastery
   can discharge a demand, but cannot by itself enable an assessment-based rule.
4. **Shared prerequisites stay open while a participating consumer needs them
   directly or indirectly.** An enabled waiver takes effect only after every
   such consumer has mastery or its work is itself legitimately waived.
5. **Waived work never becomes global mastery.** A later learning context may
   require mastery of that competence. Its availability is calculated for its
   own scope; it does not add a new obligation to this level's calculation.

The learner deliberately chooses either the normal learning route or a direct
attempt at an eligible level assessment. Passing writes the existing mastery
result before any derived progress is shown. Failure preserves existing
mastery and offers targeted support or another attempt. No failed-attempt or
score record is added by this profile.

The Cockpit and learning coach distinguish **goal achieved**, **preparation no
longer required for this level**, and **still required**. These are views of
mastery and the calculation, not three stored goal states. The interface names
required assessments still to pass and explains why preparation is no longer
necessary. It does not count that preparation as individually mastered skills
or merge it into the global mastery percentage.

## 2. Resolve the level and its obligations

For one learner, fix a curriculum revision, an applicable completion-profile
revision, and the authoritative level placement and selection. Let $T_i$ be
the full set of required atomic targets of level $i$. Resolve any authored
elective choices before computing completion. Neither a display filter nor
Level-3 focus is an input to this resolution.

Let $Q_i$ be **all required assessment goals in $T_i$**, with
$\varnothing\ne Q_i\subseteq T_i$. Each must have mastery. If the
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
to this level. The underlying landscapes must satisfy the
[base graph-validity contract](graph-definition.md#10-summary-of-required-validity-conditions),
and their composition must satisfy its applicable identity, reference and
projection contracts. The additional atomic-cycle check below does not replace
those checks: a cyclic containment relation or redundant authored prerequisite
is not legitimised by an unchanged waiver result. For the resolved atomic goals $A$, expand
[Graph Definition §12.2](graph-definition.md#122-structural-feasibility):

$$
F=\{(a,b)\in A\times A\mid b\in RequiredAtoms(a)\},
\qquad D=F^+.
$$

Taking closure **after atomic expansion** matters: an atom inside a required
cluster can have its own prerequisites. Reject unresolved references, then
define the prerequisite-closed context and its demand relation by:

$$
\begin{aligned}
V_H&=T_i\cup\{b\mid\exists t\in T_i:(t,b)\in D\},\\
R_H&=D\cap(V_H\times V_H).
\end{aligned}
$$

Write $H=(V_H,R_H)$ for this resolved obligation context.
Reject any reflexive pair in $R_H$: this detects a cyclic expanded requirement
reachable from this level's targets, including self-dependence through a
required cluster. This additional check applies to the complete context,
including supporting goals, not to a display-filtered subset. An atomic
expansion defect in an unrelated component does not invalidate this local
calculation, although it remains a defect for any profile that reaches it.
The full base-graph validity precondition above still applies.
$R_H$ is a finite, irreflexive, transitive demand relation. Its pairs are
derived dependency obligations, not additional authored edges. For example,
$C\to B\to A$ resolves to $(C,B)$, $(B,A)$ **and $(C,A)$**. Even when B is
mastered, an open C still prevents a waiver of A. Omitting the
indirect pair would waive A while the normal transitive frontier could still
require it for C. Adding a redundant authored edge cannot change this result.

This is a derived relation for work discharge. It neither edits the authored
graph nor substitutes for the normative frontier. Equivalence here means
identical resolved atomic prerequisite reachability; it does not assert that
every cluster refactoring preserves all other runtime behaviour.

The calculation uses one consistent set of inputs: learner, curriculum and
profile revisions, level, resolved choices, target roles, dependency resolution
and current mastery. Different subject views of the same canonical goal use
one identity and one mastery result. A consistent read of these inputs is not
an additional persisted evidence snapshot.

Unresolved choices, missing references or an invalid graph produce an
**invalid or unresolved calculation**, not an empty target set, an empty
frontier or a completed level. Report the configuration problem separately
from a learner's remaining goals. A level with no required assessments does
not use this profile; its ordinary completion contract remains applicable.

## 3. Mastery and reviewed waiver rules

Let $M_A$ be the current set of mastered atomic goals under the existing
[goal-type semantics](node-types.md). The sole learner-result input to this
calculation is

$$
E:=M_A\cap V_H.
$$

$E$ is a restriction of the existing mastery state, not an independently
stored or separately approved set of results. An assessment already carrying
mastery belongs to $E$ whenever it belongs to $V_H$, regardless of when that
mastery was acquired. The profile cannot reject that success for lack of
additional metadata. An assumed entry basis or opening an assessment does not
write mastery and therefore does not add a goal to $E$. The profile introduces
no separate mastery threshold.

Let $P\subseteq V_H$ contain **every assessment, orientation and memorisation
goal**, together with any other goal that the applicable type or curriculum
contract makes non-waivable. This profile introduces no exception for those
types. Protection preserves an existing obligation; it does not create a new
target or make every available practice assessment compulsory.

### Reviewed waiver rules

The profile declares a finite set of reviewed rules $(S_r,W_r)$:

- $\varnothing\ne S_r\subseteq Q_i$ identifies the assessment goals that
  must have mastery together to enable the rule.
- $W_r\subseteq V_H\setminus P$ identifies the ordinary atomic learning goals
  whose separate work those assessment successes justify waiving.
- Every $v\in W_r$ must be a strict prerequisite of at least one supporting
  assessment: $\exists q\in S_r:(q,v)\in R_H$.

The simplest profile has **one rule**, with $S_r=Q_i$ and a reviewed set of
waivable goals. Separate rules are useful only when independently sufficient
assessment groups justify earlier waivers. These are static curriculum policy
inputs, not individual learner records or a new authored edge type.

Authoring review must establish the substantive justification for each $W_r$
from the assessment tasks,
[declared coverage](../runtime-workflows/exam-preparation-planning.md), rubrics
and the ordinary success contract of the assessment goals.
`requires` reachability and `examData.coveredGoalIds` alone cannot establish
that justification. If a passing total could conceal a critical missing
outcome, or a written task does not adequately cover practical performance,
leave the affected target outside $W_r$. A waiver rule must be justified by
what mastery of its assessment goals already means; it must not introduce a
second, stricter acceptance test for individual learners.

Only **mastery of the required assessment goals** enables a rule:

$$
W(E)=\bigcup_{r:\ S_r\subseteq E}W_r.
$$

Derived waivers never enable another rule by pretending to be mastery.
Mastering an ordinary goal can discharge its outstanding demands, but without
an enabled rule its prerequisites acquire no waiver. Required targets without
a reviewed waiver rule still need their own mastery. The strict-prerequisite condition excludes isolated
targets from waiver eligibility.

### One assessment result, including repeated attempts

The [current exam workflow](node-types.md#scoring-and-mastery) remains the
outcome contract: a pass writes mastery; a failure leaves it unchanged and
stores neither the failed attempt nor its score. Existing assessment mastery
counts immediately, without a separate compatibility or recognition decision.
There is no state meaning "passed, but not qualified for this level".

The workflow permits repeated attempts at the same task and reveals the
solution after grading. This profile adds no form history, exposure ledger,
additional pass certificate or expiry rule. A repeated attempt is evaluated
under the ordinary assessment contract. A later failure does not remove an
existing success. Known solutions can limit what repeated-task performance
establishes; the completion calculation does not turn ordinary mastery into
proctored or identity-verified certification. Assessment quality remains an
authoring and coaching responsibility, not another stored learner outcome.

## 4. Derive waived work with a least fixed point

For fixed $H$, policy and current mastery input, define all participating goals
that directly or indirectly require $v$:

$$
Consumers_H(v)=\{u\in V_H\mid(u,v)\in R_H\}.
$$

Starting only from mastery in $E$, add eligible work whose every
incoming consumer is already mastered or its work is waived:

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

**Why this is well-defined.** On the finite set of subsets of $V_H$, the
operator $\Phi_E(X)=X\cup\{v\in W(E)\mid Consumers_H(v)\subseteq X\}$ is
monotone and inflationary. Iteration from $E$ therefore terminates at the
least fixed point containing $E$. Every newly added element is in $W(E)$,
which is disjoint from $P$, so protected goals can enter only through $E$.
An implementation may process consumers before their prerequisites in a
topological order of $R_H$, but must obtain this same result. Compute a reason
for each waiver from the enabled rule, its mastered assessment goals and the
already resolved consumers. These explanations are reproducible from the same
inputs; they do not require stored individual waiver grants. Iteration rounds
explain the derivation; they are not elapsed learning time or separate learner
actions.

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
mastery. Both demand status and waiver status are calculated views. Persist
neither as additional learner outcomes, and never edit graph edges to store them.

An **active demand** is not the same as an unsatisfied prerequisite. If C is
open and A has mastery, $C\to A$ is active even though A itself
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

| Mastered $E$ | Enabled $W(E)$ | Waived $I$ | Interpretation |
| --- | --- | --- | --- |
| $\varnothing$ | $\varnothing$ | $\varnothing$ | No passes and no waivers. |
| $\{B\}$ | $\varnothing$ | $\varnothing$ | B's demands are discharged; C remains required. |
| $\{B,C\}$ | $\{A,D\}$ | $\{A,D\}$ | A is waived in round 1, D in round 2. |
| $\{A\}$ | $\varnothing$ | $\varnothing$ | A discharges its demand on D, but no assessment rule enables a waiver. |
| $\{A,B,C\}$ | $\{A,D\}$ | $\{D\}$ | A keeps its mastery; only D is waived. |

If an additional **required target** Z in this level also requires D and
remains open, D stays open after B and C pass. If Z belongs only to a later
level, it is outside this context and does not block this level's waiver.
If Z is an unrelated required target, it still requires mastery. If D is a
protected memory goal, it cannot occur in $W_r$ and needs its own mastery
wherever it is a target.

**A supporting goal can still block a waiver.** Let $T_i=\{Q,A\}$,
$Q_i=\{Q\}$, and let the resolved chain be $Q\to B\to A$. With
$E=\{Q\}$ and a reviewed rule $(\{Q\},\{A\})$, the context also includes B.
Since B is neither mastered nor eligible for a waiver, it remains an open
consumer of A. Hence $I=\varnothing$ and the level is incomplete. B does not
enter the completion denominator, but its demand still matters. Mastery of A
suffices for completion; alternatively, mastery of B allows A's enabled waiver.
A separately reviewed rule could also make B waivable if B is an ordinary,
unprotected goal with adequate coverage.
Never waive B automatically merely because it is supporting or
`prerequisiteOnly`, and never promote it silently to a level target.

The direction matters. For $Q\to A\to B$ with the same targets, mastery
and waiver rule, B is not a consumer of A. A is waived and the level completes
while supporting B remains open, even if B is protected. If B also becomes a
required target, the same mastery and rule no longer complete the level.
A consumer B that remains open at the fixed point, with $(B,A)\in R_H$,
prevents an otherwise eligible A from being waived; supporting status alone
neither blocks completion nor justifies a waiver.

For this optional profile:

$$
Complete(i,H,E)\iff(Q_i\subseteq E)\land(T_i\subseteq X_*).
$$

All required assessments must pass, and every required target must be
mastered or its work legitimately waived. The assessment clause is written
explicitly for clarity; it also follows from $Q_i\subseteq T_i\cap P$.
Only targets count towards level completion and its denominator. Supporting
prerequisites retain their role even when their separate work can be waived.

**Passing the assessments alone is sufficient only for a profile that proves
that claim.** Review the coverage and waiver rules, then evaluate the fixed
point with $E=Q_i$. The claim holds exactly when $T_i\subseteq X_*$ in that
case. If protected orientation, recall or other non-waivable targets remain,
state that those additional goals require mastery. This calculation validates
the policy's consequences; it is not evidence of assessment quality.

## 6. Direct assessment access and subsequent learning

The proposed direct route allows the learner to deliberately attempt a
required assessment in $Q_i$ even when didactic prerequisites keep it outside
the normal frontier. Offer it for each $q\in Q_i\setminus E$, subject to the
existing authorisation and assessment conditions. An assessment with mastery
already satisfies its obligation; do not demand another pass or reset its
result. Voluntary repetition remains separate from required work.

The bypass concerns didactic `requires` gating only. It does not waive
separately required practical safety, supervision, accessibility arrangements
or other assessment conditions. The ordinary assessment workflow decides
success and writes mastery. An attempt alone writes no success. Failure leaves
mastery unchanged and offers targeted remediation without silently enlarging
the learner's selected scope.

A failed mastery write cannot enable a waiver or produce a claimed completion.
The response must distinguish feedback about the attempt from a confirmed
save. Retrying that write must be idempotent and must not award another
learning-success event for an already mastered goal.

The normal learning route remains available. A level-completion result never
adds blanket prerequisites between levels and never substitutes $X_*$ for
the actual mastery set. In an explicitly active completion profile, pending
target work is $T_i\setminus X_*$. Ordinary recommendations come from its
intersection with the existing frontier; the direct assessment route is
offered separately. Do not recommend waived work as unfinished work in this
same profile. Voluntary review remains available. If pending ordinary work
has no available goal, distinguish the learner's current focus restriction
from missing prerequisite mastery. Offer appropriate support; any focus
change follows the existing selection and continuation rules and needs
learner acceptance. An empty frontier proves neither level completion nor
permission to widen focus automatically. After completion, offer closing the
level or moving to another profile, and wait for the learner's choice.
This derived level result does not set the ordinary `scopeCompleted` or
`curriculumComplete` flags to true when their own mastery-based conditions are
not satisfied. Show the named level's completion separately.

For subsequent learning:

1. Determine availability from real results under the existing normal/strict
   and focus contracts.
2. If preparation waived in another resolved profile is required here, explain
   the different requirements of those named scopes. Describe an earlier
   waiver only when that earlier calculation is actually known; current
   mastery alone does not establish that history. Calculate each scope by its
   own rules; adding the new context alone does not reopen the old one.
3. Offer a targeted demonstration through the ordinary goal-type workflow or
   suitable learning support. Persist mastery only from new appropriate
   evidence, and wait for the learner's choice before starting that work.

Where normal focus rules already permit entry, introduce no additional block
because of this profile. A waiver must not be exported into another level,
subject, plan or global frontier as mastery. A target can therefore contribute
to a completed level while still lacking an individual global competence
record; show the two claims with their named scopes.

## 7. Recalculation and adoption requirements

Completion is a current calculation over the resolved scope, static profile
and graph revision, and existing mastery. Later-level consumers outside this
context do not affect it. Changing the applicable scope, rules, dependencies
or mastery requires recalculation. A response must identify the context it
actually describes; it must not silently carry a previously displayed result
into changed obligations.

If an incorrect mastery result is corrected through the ordinary authorised
mastery workflow, recompute completion and explain any work that is now
required. There is no separate pass-revocation or waiver-correction register.
Current mastery alone cannot reconstruct earlier learner states or guarantee
historical completion claims after their inputs change. This proposal therefore
adds no persisted completion certificates, evidence snapshots or historical
learner-result registry. Existing technical state versions and ordinary
operational history do not become a second outcome contract.

Within fixed scope and policy, $E\subseteq E'$ implies
$X_*(E)\subseteq X_*(E')$: adding mastery cannot reopen completed or waived
work. A previously waived goal may instead gain mastery, so the set
$I=X_*\setminus E$ itself need not grow. Across changed scopes, rules or
corrected mastery, recompute instead of assuming monotonicity. Never use an
earlier derived waiver as an input to the next mastery set.

A future implementation needs one authoritative backend calculation for the
scope, existing mastery, normalised demands and fixed point, using a consistent
read of those inputs. Learner views, coach tools and planning consume that same
result and its computed explanations. Any cache is disposable, tied to all
relevant inputs and never authoritative learner-result storage. Changes to
individual goal outcomes stay with the existing goal-type/mastery workflows.

Keep mastered and waived counts separate. A plan may remove waived work from
its remaining schedule only through an explicit integration contract. Waivers
create no goal-success events, learned-goal counts or weekly quota credit, and
do not rewrite the fixed planning baseline or invent learning-time savings.

Expose calculation validity, derived completion and availability of an
assessment attempt as separate facts. If a required, unmastered assessment
cannot currently be offered, report the content or access problem separately
from learner progress. An already mastered assessment remains fulfilled even
if its task is currently unavailable. Do not fabricate mastery to work around
a missing task, and do not introduce another qualifying-success status.

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
| Protected or isolated required target | No waiver; mastery of that target remains required. |
| Open additional in-level consumer of D | D remains open even if its waiver rule is enabled. |
| Open supporting consumer B in Q → B → A, with only A eligible | A stays open; supporting status does not remove B's demand or make B a target. |
| Open supporting prerequisite B in Q → A → B, with only A eligible | A can be waived and the level can complete; protecting B does not change this, but making B a required target does. |
| Later-level consumer; hidden in-level consumer | The former does not block this level; hiding the latter changes nothing. |
| Optional exam or alternative form | No new target or compulsory pass merely because the task is available. |
| Equivalent atomic, cluster and transitive representations | Same resolved atomic reachability produces the same $R_H$ and waiver result. |
| Open C requires B, B requires A, and B has mastery | C's indirect demand keeps A open even if a separate assessment enables its waiver rule. |
| Missing reference, or reflexive/cyclic atomic expansion reachable from a target | Reject the profile calculation with an identified cause. |
| Atomic-expansion cycle in an unrelated base-valid component | Do not reject this local calculation; reject any profile whose target closure reaches the cycle. |
| Invalid base graph, unresolved choice or no required assessment | No completion calculation under this profile; report the applicable configuration or profile boundary. |
| Inadequate coverage or compensable critical outcome | No approved waiver rule for the affected target. |
| Failed exam | Mastery stays unchanged; no failed-attempt or score record is introduced. |
| Required assessment already has mastery, including a previous success | Count it immediately, without another qualification check or forced attempt. |
| Solution feedback, repeated task or later failed attempt | Apply the ordinary assessment contract; add no exposure ledger or second success status, and preserve existing mastery on failure. |
| More mastery at fixed scope and policy | Completed-or-waived work stays complete; a waived goal may gain mastery. |
| Active profile continuation | Recommend pending available targets, offer direct assessments separately, and never silently repeat waived work. |
| Failed mastery write, concurrent change or replay | No optimistic waiver; calculate from consistent current inputs and preserve write idempotency. |
| New context or later learning goal | Calculate that scope from the same global mastery; add no consumers to the earlier scope merely because they share prerequisites. |
| Corrected mastery or changed applicable curriculum rules | Recompute the current result; do not invent historical completion data from the current mastery map. |
| Required unmastered assessment unavailable or independent condition unmet | Explain unavailable access; no fabricated mastery or learner-failure event. |
| Already mastered assessment currently unavailable | Its mastery still satisfies the assessment obligation. |
| Level complete while preparatory targets lack mastery | Show scoped completion and waived preparation; preserve global mastery and ordinary scope/curriculum completion flags. |
| Every derived update | Mastery, target roles and authored graph remain unchanged; no individual waiver or completion state is persisted. |

This document specifies a proposed policy. It announces no enabled level
schema, deployed exam bypass, new API or migration of learner data.
