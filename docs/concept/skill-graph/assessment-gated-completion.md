# Assessment-Gated Completion and Prerequisite Discharge

A learner who can already pass an assessment should not have to repeat each
preceding learning step. This proposal separates **evidenced completion**
from **derived discharge** of work no longer needed for remaining goals,
while preserving explicitly passed, non-waivable level-end assessments.

> **Design proposal — not current runtime behaviour.**
> This is a formally defined learner-state *overlay* on the
> [Skill Graph](graph-definition.md) and [Curriculum Levels](curriculum-levels.md).
> It does not modify authored graph edges, stored mastery, the normative
> [frontier (§9)](graph-definition.md#9-learning-availability-and-progression),
> or the current [exam access gate](node-types.md#requires-semantics).
> Those contracts remain authoritative until a separate implementation and
> migration decision. In particular, **implicit completion never fabricates mastery**.

## 1. Meanings and arrow direction

- **Explicitly completed:** appropriate, persisted success evidence for the
  goal type; for an assessment, a graded, **passed** full submission.
- **Implicitly done:** the ordinary learning step needs no separate work in
  this particular resolved obligation context; **no independent mastery
  evidence** is inferred for that node.
- **Active demand:** a `requires` pair whose dependent is not completed.
  This is **not** synonymous with an *unsatisfied* prerequisite: the required
  goal might already have explicit mastery.
- **Discharged demand:** a `requires` pair whose dependent goal is completed
  explicitly or implicitly, so that dependent no longer needs the linked
  prerequisite work.

An arrow $B\to A$ means **B requires A**, exactly as in
[Graph Definition §5](graph-definition.md#5-requires-relation). Successfully
completing B discharges *its own* requirement $B\to A$, **not** a separate
requirement $C\to A$ from another consumer.

## 2. Context and evidence

For one learner and fixed curriculum revision, resolve an obligation context
$H=(V_H,R_H)$, including the participating target goals, their prerequisites,
and **all dependents whose outstanding demand should count** for this context.
Do not silently exclude a relevant consumer merely because a display filter
or temporary Level-3 focus hides it. The context, its target scope, and the
curriculum revision must be identified in any derived result.

$V_H$ is a finite set of atomic progress goals. The directed, acyclic
$R_H\subseteq V_H\times V_H$ is the *resolved atomic demand relation*, with
arrows from **dependent to prerequisite**. In the canonical atomic-only case,
it uses applicable direct/inherited `requires` facts. Where authors require
clusters, expand their **conjunctive atomic requirements** consistently with
[Graph Definition §9](graph-definition.md#9-learning-availability-and-progression):
each required atom in $RequiredAtoms(a)$ from
[§12.2](graph-definition.md#122-structural-feasibility) must be represented
for the corresponding atomic dependent $a$. This may introduce transitive
demand pairs; they are not newly authored edges. Resolve cross-landscape and
cross-subject requirements first. A context with a cyclic or reflexive
expanded relation is not eligible for this proposed profile.

Fix:

| Symbol | Meaning |
| --- | --- |
| $E\subseteq V_H$ | Goals backed by appropriately **persisted explicit success**; opening or failing an exam never adds it to $E$. |
| $P\subseteq V_H$ | **Protected** goals, including **every assessment** in the context. Orientation and memorisation remain non-waivable unless a separate goal-type contract permits a waiver. |
| $W\subseteq V_H\setminus P$ | Eligible ordinary atomic learning goals whose work can be discharged. |
| $Q_i\subseteq P$ | A **non-empty** set of **mandatory assessment endpoints** of level $i$, each requiring an explicit pass. |
| $T_i\subseteq V_H$ | The level's full **required target set**, including its assessment endpoints, resolved from the authoritative curriculum scope. |

The evidence set $E$ is not derived from this algorithm. In particular,
the plan's assumed **entry basis** in Graph Definition §12.1 does not
write a learner's mastery, and a soft mastery estimate must not be
silently promoted to a recorded pass. These are conceptual inputs, **not
claims that corresponding schema fields already exist**.

## 3. Least-fixed-point rule

Let $R_H^+$ denote transitive prerequisite reachability. A candidate
for implicit completion must be a *strict prerequisite* of a protected
endpoint or of an explicitly completed goal:

$$
U=\{\,v\in V_H\mid
\exists s\in P\cup E:\ (s,v)\in R_H^+\,\}.
$$

This relevance guard excludes unrelated isolated goals: the rule below
must not declare every unreferenced goal implicitly done merely because
its consumer set is empty.

For any $v\in V_H$, define its incoming consumers (the sources of arrows
**pointing to** $v$):

$$
Consumers_H(v)=\{\,u\in V_H\mid(u,v)\in R_H\,\}.
$$

Starting **only from explicit evidence**, iteratively add eligible goals
whose every incoming consumer is already done:

$$
\begin{aligned}
X_0 &:= E,\\
X_{n+1} &:= X_n\ \cup\
\left\{\,v\in U\cap W\ \middle|\
Consumers_H(v)\subseteq X_n\,\right\},\\
X_* &:= \bigcup_{n\geq 0}X_n,
\qquad I:=X_*\setminus E.
\end{aligned}
$$

$X_*$ is the **least fixed point starting from $E$**, not an arbitrarily
chosen larger fixed point. The finite monotone iteration stabilises
after at most $|V_H|$ strict additions. Acyclicity avoids cycles of
mutual, self-justifying implicit completion. $I$ is **derived, scope-bound
work discharge**, not explicit mastery.

The status of each resolved demand pair is likewise derived:

$$
\begin{aligned}
Discharged_H &= \{\,(u,v)\in R_H\mid u\in X_*\,\},\\
Active_H &= R_H\setminus Discharged_H.
\end{aligned}
$$

Completing a dependent discharges **all its outgoing demands**. Once
a normal prerequisite becomes implicit, *its* outgoing demands discharge
in the following round. Thus the effect propagates backwards along
prerequisites, stopping wherever even one incoming consumer remains open,
or a protected goal needs an explicit result. Do not mutate $R_H$ to
persist these statuses.

**Important distinction:** a still-open consumer C can have an *active
demand* $C\to A$ even if A is already **explicitly mastered** and
therefore satisfies C's normal entrance requirement. Completing C, not
merely mastering A, discharges that demand. Likewise $A\in I$ does not
imply $A\in M_A$ or $Sat(A,M_A)$ under the currently normative mastery
semantics.

## 4. Two exams and a shared prerequisite

B and C are protected assessment endpoints. Both require A; A in turn
requires D. All four nodes are atomic.

![Two-stage diagram. Left: B has an explicit exam pass, C is open, and only B to A is discharged; A and D stay open. Right: B and C both pass explicitly, so A and then D become implicitly done. All arrows point from dependent to prerequisite.](assets/assessment-gated-completion.svg)

For $R_H=\{(B,A),(C,A),(A,D)\}$, $P=Q_i=\{B,C\}$,
$W=\{A,D\}$ and $T_i=\{A,B,C,D\}$:

| Explicit $E$ | Implicit $I$ | Interpretation |
| --- | --- | --- |
| $\varnothing$ | $\varnothing$ | Both exams and all prerequisite work stay open. |
| $\{B\}$ | $\varnothing$ | $B\to A$ discharged; $C\to A$ active, so A and D stay open. |
| $\{B,C\}$ | $\{A,D\}$ | A becomes implicit in round 1; D in round 2. |
| $\{A\}$ | $\{D\}$ | A discharges D's work, but both exams still need explicit passes. |

If another **open** goal also requires D in this context, D stays open
even when A becomes implicit. An unrelated, isolated ordinary goal Z
is not in $U$ and does not acquire an implicit result. An unpassed
protected exam cannot become done even if no arrows point to it.

## 5. Assessment access and level completion

**Proposed direct-exam route.** A learner may deliberately select an
assessment endpoint even if prerequisites block it in the normal frontier.
This is only **permission to attempt**, never a pass or an automatic
learning-state write. On failure, preserve the current no-success-write
rule and offer targeted prerequisite remediation; after grading a passed
full submission, persist the pass before adding the endpoint to $E$.
The ordinary prerequisite-aware route remains available.

For the proposed **assessment-gated level profile**, require **both**
explicit success on all mandatory assessments and completion/waiver of
the *entire* resolved required target set:

$$
Complete(i,H)\iff
(Q_i\subseteq E)\ \land\ (T_i\subseteq X_*).
$$

Passing all $Q_i$ is therefore **necessary but not automatically
sufficient**. If the intention is that passing those assessments alone
can finish a level, the assessment graph must actually cover every
ordinary required target through its backward prerequisite cone, with
no other still-active in-scope consumer blocking a waiver. This is a
curriculum **coverage/design requirement**, not a theorem that arbitrary
exams assess an entire level. A required non-waivable goal still needs
its own appropriate explicit completion. A disconnected required
target cannot disappear under the empty-consumers condition.

An outcome such as "A implicitly done for this level" is **not global
mastery**. The complete Personal Curriculum can have consumers outside
this level; recompute in their context rather than exporting the level's
waiver as a global result. Scope, target roles, evidence and the graph
revision must remain distinguishable. Never delete or silently turn
`prerequisiteOnly` goals into `target` goals.

The level's existing [structural feasibility and workload checks](curriculum-levels.md)
remain separate: bypassing an exam's entrance gate does not justify
a circular dependency, a later-level prerequisite or an unreviewed
reference workload.

## 6. Adoption conditions and review cases

A future backend implementation needs an explicit resolved context key,
a reviewed goal-type protection and waiver policy, a consistent
evidence snapshot, the least-fixed-point computation, and distinct UI
language for **verified mastery** and **waived work**. The existing
[frontier](graph-definition.md#9-learning-availability-and-progression)
continues to use actual mastery until a separately specified runtime
contract changes it; simply substituting $X_*$ for $M_A$ would be wrong.
Nothing on this page announces a deployed exam bypass, persisted edge
status, new API, enabled level schema or migration of learner data.

The minimum review matrix covers: B passed while C remains open; B and C
passed with two rounds of propagation; an unpassed protected exam; an
explicitly mastered prerequisite; a second consumer of D; isolated
required goals; context changes; inherited/cluster and cross-landscape
requirements; rejection of cyclic expansions; and unchanged explicit
evidence on every derived update.

Related: [Node Types](node-types.md) defines the current exam pass and
grading rule; [Graph Definition §12](graph-definition.md#12-optional-curriculum-level-assignments)
defines the independent, optional level-planning validity profile.
