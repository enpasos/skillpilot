## Goals, Identity, and Relations {#sec:core}

A goal can belong to one topic while requiring knowledge from another. The graph records these two facts separately. Together they help determine which goals a learner can approach next.

### The Base Object {#sec:core-object}

The goals and their relationships form a finite directed graph

$$
\mathcal G=(G,C,R),\qquad C,R\subseteq G\times G.
$$

$G$ is the set of learning goals. The skill graph stores exactly two kinds of edge. Authors use $C$ (`contains`) to organise goals and $R$ (`requires`) to state their prerequisites. Curriculum placements, source mappings and evidence are recorded in their respective model layers.

Each pair $(x,y)$ is directed. For any relation $X$ on $G$,

$$
X^{-1}=\{(y,x)\mid(x,y)\in X\}
$$

denotes its inverse. The transitive closure $X^+$ contains a pair $(x,y)$ exactly when a directed path of one or more $X$-edges leads from $x$ to $y$. The relation is *acyclic* if no such path returns to its starting goal, that is, $\forall g\in G:(g,g)\notin X^+$. A directed acyclic graph is called a DAG. Section~@ref{sec:validity} checks the hierarchy and prerequisites according to their respective meanings.

In Figure~@ref{fig:overview}, the goal *Velocity* belongs to the cluster *Kinematics*. A separate arrow identifies its prerequisite *Vectors*.

:::principle {title="Arrow Direction Is Part of the Definition"}
$k\xrightarrow{\mathtt{contains}}c$: cluster $k$ contains goal $c$. $g\xrightarrow{\mathtt{requires}}p$: goal $g$ requires prerequisite $p$. A learning-flow view instead depicts $R^{-1}$: from prerequisite to the skill building upon it. That inverse direction must be explicitly labelled.
:::

::figure{id="fig:overview"}

The order of whole units is declared separately. `U after V` places all goals of U after all goals of V in the intended learning sequence. This plan declaration leaves each goal’s demand and the learner’s state unchanged (Section~@ref{sec:unit-progression}). An assessment can itself have prerequisites. In the target model no other goal requires that assessment. Existing counterexamples require subject-matter repair.

### Attributes and Stable Identity {#sec:core-attributes}

Every goal carries three normative base attributes. They are total mappings, defined for every goal:

$$
\Id:G\to\mathrm{UUID},\qquad \Title:G\to\Sigma^*,\qquad \Weight:G\to\R_{>0}.
$$

$\Id$ is injective: distinct goals have distinct IDs. The UUID remains the canonical identity across placements, locale files, and views. Single-letter identifiers in this document are mathematical variables only, not statements about the serialized ID format.

Two further attributes are partial mappings ($\rightharpoonup$) that need not be defined on every goal. An optional $\ShortKey:G\rightharpoonup\Sigma^*$ is unique within a logical skill landscape, that is, across the shared goal inventory of one curriculum. Multiple locale files for the same goal may repeat the same pair of ID and ShortKey. By contrast, the partial mapping $\PhaseCompat:G\rightharpoonup P_{\mathrm{compat}}$ captures compatibility or display metadata, often serialized under `phase`; it defines neither canonical identity nor didactic learning order. Table~@ref{tab:attributes} situates other common fields.

:::table {#tab:attributes caption="Supplementary goal attributes and their bounded semantics." cols="29mm,X"}
| Field | Domain meaning outside the minimal core |
| --- | --- |
| `description` | Clear, verifiable goal statement, typically “The learner can …”. Orientation goals follow their own semantics (Section~@ref{sec:goal-types}). |
| `area`, `tags` | Subject classification and metadata; a tag never replaces an authoritative decision on goal type or scope. |
| `level` | Difficulty or cognitive demand tier; neither a subject learning unit nor a personalization level. |
| `core` | Core goal versus extension within the given contract; an extension may still be a mandatory target in a selected course profile. |
| `weight` | Share in progress aggregation; not a time duration, not subject-evidence strength, and not a pass probability. |
| `examples` | References to worked examples or tasks; mere presence proves neither task quality nor competence mastery. |
| `resourceLinks` | Existing reference field used for SkillPilot-owned visualizations, official sources, and legacy links. Under the current contract, new optional external study materials belong in separate content packages. |
:::

### Atomic Goals and Clusters {#sec:core-atoms-clusters}

The *structural* classification follows solely from $C$:

$$
A=\{g\in G\mid\nexists c\in G:(g,c)\in C\},\qquad K=G\setminus A.
$$

A goal without `contains` children is *atomic* (an atom, a leaf); every other goal is a *cluster*. A goal may have multiple parents: the canonical `contains` graph may form a polyhierarchy. Any explicit classification metadata stored alongside nodes must agree with this derived split.

Structural atomicity does not automatically imply *semantic* atomicity. A leaf bundling five independent sub-competencies remains a graph leaf formally, yet fails semantic quality review.

Alongside its structural kind, every atomic goal has a pedagogical *goal type*. The default is the *content goal*; orientation, memorization, and assessments form dedicated pedagogical kinds:

- A **content goal**, the ordinary subject-matter learning goal, describes conceptual understanding or procedural skill.
- An **orientation goal** describes a motivational entry point.
- A **memory goal** describes verified recall of required cards.
- An **assessment goal** describes a graded exam task with its own passing criterion.

Section~@ref{sec:goal-types} specifies when a goal of each type counts as achieved. These kinds are neither additional structural node classes nor program units.

## Containment, Prerequisites, and Inheritance {#sec:relations}

To find the learning frontier, the graph must account for a goal’s direct prerequisites and the preparation those prerequisites require in turn. Older data can also place requirements on or from clusters. Table~@ref{tab:relations} introduces the relations used in this calculation.

:::table {#tab:relations caption="Authored and derived relations. In the canonical target state $R=R_A=\Reff=\Rat$; only the transitive closure $\Rat^+$ remains derived." cols="15mm,45mm,X"}
| Symbol | Name | Construction and use |
| --- | --- | --- |
| $C$ | Containment | Authored `contains` edges. They group goals and determine atoms, clusters, and each goal's atomic basis. |
| $R$ | Authored (direct) requirements | Stored `requires` edges. In the canonical target state they connect atoms only. |
| $\Reff$ | Effective requirements | $R$ together with requirements inherited from `contains` ancestors. |
| $\Rat$ | Atomically normalized requirements | Every effective prerequisite is expanded into its atomic basis, leaving pairs of atoms only. |
| $\Rat^+$ | Transitive closure | All prerequisites reachable across chains. Used to calculate demand and the frontier. |
| $R_A$ | Directly authored atomic requirements | $R\cap(A\times A)$; basis of the didactic route check in Section~@ref{sec:routes}. |
:::

### Hierarchy and Atomic Basis {#sec:hierarchy}

For the finite acyclic containment graph, define

$$
\begin{aligned}
\Anc(g)&=\{k\in G\mid(k,g)\in C^+\},\\
\Desc(g)&=\{d\in G\mid(g,d)\in C^+\},\\
\Atoms(g)&=\begin{cases}\{g\},&g\in A,\\\Desc(g)\cap A,&g\in K.\end{cases}
\end{aligned}
$$

$\Anc(g)$ contains the ancestors of $g$, $\Desc(g)$ its descendants, and $\Atoms(g)$ its *atomic basis*. Every ancestor has children and is therefore a cluster. The short forms $\Anc$ and $\Desc$ correspond to `Ancestors` and `Descendants` in the original illustrations.

Every cluster possesses at least one atomic leaf: in a finite acyclic graph, every descending path terminates after finitely many steps at a goal without children. Consequently, $\Atoms(g)$ is non-empty for every goal. A node without children is atomic rather than an empty cluster. Across multiple parent paths, each atom is counted once in the set. Figure~@ref{fig:contains} illustrates direct and indirect containment.

::figure{id="fig:contains"}

### Direct Requirements Are Conjunctive {#sec:direct-requires}

In $(g,p)\in R$, $g$ is the goal and $p$ its prerequisite. The arrow points from $g$ to something that must first be learned or completed. A content goal can therefore require an orientation goal. Several arrows from $g$ mean that all the listed prerequisites apply. Alternatives need a separate selection rule. $R$ is acyclic. Figure~@ref{fig:requires} shows a goal with four prerequisites.

Under the binding decision of 8 November 2026, the canonical target state satisfies

:::equation {#eq:atomic-target}
R\subseteq A\times A.
:::

This property is called *atomic normal form*: *every* authored requirement has an atomic source goal and an atomic prerequisite goal. Even a universal cluster claim intended to apply to every descendant of a cluster has no permanent exception. Clusters serve hierarchical grouping and derived dependency summaries.

Data that still contain requirements outgoing from or pointing to clusters are called *transition data* in this document. Existing cluster requirements retain their transition reading semantics: a requirement authored on a cluster applies to all descendants through inheritance, and a cluster prerequisite expands into its atomic basis (Section~@ref{sec:effective}). Transition compatibility does not satisfy the canonical target norm.

::figure{id="fig:requires"}

### Effective Requirements {#sec:effective}

So that transition data are also read unambiguously, three ordered steps prepare authored requirements: inherit first, expand to atoms second, and take the transitive closure third. This exact sequence applies wherever this document evaluates prerequisites.

#### Step 1: Inherit.

The effective relation also reads legacy cluster requirements. It combines a goal's own direct requirements with those declared on its `contains` ancestors:

:::equation {#eq:effective}
(g,p)\in\Reff\iff (g,p)\in R\ \lor\ \exists k\in\Anc(g):(k,p)\in R.
:::

Here

$$
R_{\mathrm{inherited}}=\Reff\setminus R,\qquad \Reff=R\cup R_{\mathrm{inherited}},\qquad \Pre_{\mathrm{eff}}(g)=\{p\mid(g,p)\in\Reff\}.
$$

Multiple parent paths combine requirements by set union without duplication. *Inheritance* in @eqref{eq:effective} and *transitive closure* $\Reff^+$ are distinct operations: inheritance propagates ancestor requirements downward along `contains` to descendants, whereas transitive closure follows chains of `requires` edges. Figure~@ref{fig:inheritance} illustrates an inherited requirement.

::figure{id="fig:inheritance"}

#### Step 2: Expand to atoms.

For each atom $a$, each effective prerequisite $p$ is now expanded to its atomic basis. If $p$ is already atomic, this yields just that goal:

$$
\Rat=\{(a,b)\in A\times A\mid \exists p\in G:(a,p)\in\Reff\land b\in\Atoms(p)\}.
$$

#### Step 3: Take the transitive closure.

The transitive closure $\Rat^+$ therefore also captures prerequisite chains continuing beyond the expansion of a required cluster. Mastery of an intermediate goal never truncates this closure. Section~@ref{sec:assessment} likewise retains $\Rat$ for this normalized atomic relation while keeping $R$ for authored edges.

Figure~@ref{fig:atomic-expansion} illustrates Steps 2 and 3 on a cluster requirement: external foundation $\nd{c}$ remains reachable via $\nd{a}$ once cluster $\nd{K}$ is expanded.

::figure{id="fig:atomic-expansion"}

#### Atomic demand of a goal.

Several later formulas ask the same question: which atoms does a goal require altogether? For any goal $g$, define

:::equation {#eq:demand}
\begin{aligned}
B(g)&=\bigcup_{p\in\Pre_{\mathrm{eff}}(g)}\Atoms(p),\\
\ReqAtoms(g)&=B(g)\cup\{b\in A\mid\exists a\in B(g):(a,b)\in\Rat^+\}.
\end{aligned}
:::

$\ReqAtoms(g)$ is called the *atomic demand* of $g$ (written $D(g)$ in earlier editions). For an atom $g$, $\ReqAtoms(g)=\{b\in A\mid(g,b)\in\Rat^+\}$. For a cluster, atomic demand captures its own and inherited prerequisite claims without treating its own `contains` children as additional prerequisites. Atomic demand depends solely on the graph, never on learner state. In Figure~@ref{fig:atomic-expansion}, $\ReqAtoms(\nd{g})=\{\nd{a},\nd{b},\nd{c}\}$.

In the fully atomic-authored target state, $\Reff=R=\Rat$: `contains` ancestors are clusters and carry no outgoing requirements. Transitive chains remain relevant as graph structure.

## Validity, Minimality, and Learnability {#sec:validity}

### Mandatory Conditions {#sec:mandatory-validity anchors="73-atomic-transitive-minimality-and-ordered-migration-g17,73-transitive-minimality"}

In the canonical graph, goal identities and references must resolve and the attributes from Section~@ref{sec:core} must be defined. All authored prerequisites satisfy atomic normal form @eqref{eq:atomic-target}. Validity also requires two conditions:

:::equation {#eq:acyclic}
\forall g\in G:\ (g,g)\notin C^+,\quad (g,g)\notin R^+,\quad (g,g)\notin\Reff^+,\quad (g,g)\notin\Rat^+,
:::

:::equation {#eq:atomicmin}
\forall(a,b)\in R:\quad (a,b)\notin\bigl(R\setminus\{(a,b)\}\bigr)^+.
:::

Condition~@eqref{eq:acyclic} requires that none of the four relations leads any goal back to itself. Condition~@eqref{eq:atomicmin} requires that no authored requirement is already reachable via the remaining authored edges. All identities and references must resolve; unknown node IDs never count as satisfied prerequisites.

#### On acyclicity.

The DAG condition on $R$ already follows from that on $\Reff$ because $R\subseteq\Reff$, yet it remains listed as a clear standalone authoring check. Acyclicity of $C$ remains required independently. Direct acyclicity alone is insufficient because inheritance can create an effective cycle (Figure~@ref{fig:cycles}). Likewise, a self-cycle exposed by atomic expansion remains a modeling error even when the unexpanded edges look acyclic.

::figure{id="fig:cycles"}

#### On transitive minimality.

In the atomic chain $\nd{Q}\to\nd{B}\to\nd{A}$, an extra direct edge $\nd{Q}\to\nd{A}$ must be removed. The path through $\nd{B}$ still reaches $\nd{A}$, which remains a prerequisite even when $\nd{B}$ has been mastered. The decision of 4 November 2026 requires this transitive minimality and that of 8 November requires atomic normal form.

#### G17 as a prerequisite for subject milestones.

Under the decision of 12 November 2026, `G17` checks the subject’s entire current canonical inventory before any subject milestone `M1`--`M7` can pass. This includes the necessary prerequisites from other subjects and every ancestor from which a requirement is inherited.

The check requires valid identities and references, acyclicity, atomic endpoints for every `requires` edge, consistent explicit types and complete transitive minimality. A violation or incomplete check caps the subject and its scopes at `M0`. An incomplete catalog aborts the status run ([GD-C17](@rule{GD-C17})).

Acceptance is based on the state under examination, regardless of the migration order or equivalence with a historical closure, projection or frontier. The separate checks for scope, applicability, target sets, frontier, completion, source fidelity and review freshness retain their own criteria. A graph edit writes no learner result.

#### Diagnostics on transition data are not deletion instructions.

Two legacy checks remain useful as diagnostics. Passing either replaces neither atomic normal form nor complete target-state validation.

The former *local minimality condition* reads

:::equation {#eq:localmin}
(g,p)\in R\Longrightarrow \nexists k\in\Anc(g):(k,p)\in R.
:::

It flags direct duplicates of inherited requirements. Removing an atomic edge while retaining a cluster requirement does not establish a valid target state: clusters carry no outgoing requirements there, so @eqref{eq:localmin} holds automatically.

The *edge-removal test* formerly run under `G17` is likewise a diagnostic on transition data: for each authored edge $e=(g,p)$, it forms $R'=R\setminus\{e\}$, recomputes $\Reff'$ against unchanged $C$, and flags redundancy whenever $(g,p)\in(\Reff')^+$. Figure~@ref{fig:inherited-redundancy} illustrates both this mathematically sound diagnosis on transition data and why naive deletion fails: the alternative path still relies on a cluster requirement.

::figure{id="fig:inherited-redundancy"}

#### What current checks establish.

Since 11 November 2026, the [status generator](repo:app/scripts/generateCurriculumQualityStatus.ts) has run the [removal auditor](repo:app/scripts/auditTransitiveMinimality.ts) on every declared canonical Gymnasium root for `CQR-001`. It reports invalid references, cycles in the effective graph, non-atomic endpoints, redundant requirements and contradictory explicit types. Under atomic normal form its removal criterion is exactly @eqref{eq:atomicmin}.

The [catalog inventory](repo:app/scripts/currentCurriculumCatalog.ts) reconciles the curriculum manifest and subject declarations with the canonical directory. `check:transitive-minimality` checks all 21 roots regardless of their required minimum milestone. `check:curriculum-maturity-floors` also checks pinned subject and scope obligations against the Git base selected by `--base-ref`. The reduction registry frozen on 12 November governs only the reuse of earlier reviews for individual goals. Changed goals face strict checks against current review inputs (Appendix~@ref{sec:rule-milestones}).

Initial enforcement on `main` is documented for [PR #131](https://github.com/enpasos/skillpilot/pull/131) on 13 November 2026. After follow-up changes to review evidence and the Mathematics assessment, commit `2129b207f4` passed all 14 jobs of [CI #2315](https://github.com/enpasos/skillpilot/actions/runs/43398052180). The [delivery record](repo:docs/dev/cqr-gvr-hard-gate-plan-2026-11-12.md) identifies the revisions checked by PR and main runs. It supports technical enforcement in the respective domains. Four visibility scopes of `CQR-104` and broader `GVR-012` coverage were still open. Human trials and further runtime contracts require their own evidence.

The Product Owner decision of 13 November 2026 fixes the grading domain of every `GD-*` rule to the 21-root canonical Gymnasium catalog. Obligations from M5, M6, or M7 are assessed against their stated threshold; currently ten subjects are pinned at M6/M7, five of them at M7. Non-canonical landscapes are outside this work programme. A hard grade still requires complete enforcement of every sub-obligation in the row: the domain decision does not close runtime contracts, semantic route gaps, or general assessment-coverage gaps.

Two rule families currently enforce parts of the target state: *Curriculum Quality Review* (CQR) and *graph-validation rollout rules* (GVR). Besides `CQR-001`, direct atomic subject-route coverage is checked by `CQR-102`; hard semantic route validation for Mathematics Sek I/Sek II, Biology Sek II and Physics Sek II is enforced by `GVR-012`. Within their declared scopes, both already require direct atomic routes and reject inherited cluster paths as substitutes. Rule-code prefixes are listed in Appendix~@ref{sec:rule-code-legend}.

### Additional Profiles and Counterexamples {#sec:profiles}

A strict tree profile may require at most one parent per node:

$$
\forall c\in G:\quad \bigl|\{k\in G\mid(k,c)\in C\}\bigr|\leq1.
$$

This is not a base requirement of the polyhierarchy. Similarly, requirements targeting a goal's own ancestors are undesirable and prohibited in named validator profiles. Requirements targeting a goal's own descendants induce an effective self-dependency through inheritance and already fail the base DAG contract.

:::principle {title="A DAG Alone Does Not Prove Learnability"}
As a transition-data counterexample, let $G=\{k,a\}$, $C=\{(k,a)\}$, and $R=\{(a,k)\}$: cluster $k$ contains atom $a$, and $a$ requires $k$. Both the direct and effective relations are acyclic and minimal. Yet $\Atoms(k)=\{a\}$: to start $a$, $a$ would already have to be satisfied, so the global frontier from an empty learner state is empty. The cluster requirement already violates atomic normal form; moreover, the atomically normalized relation $\Rat$ contains the self-loop $(a,a)$ and violates acyclicity. A completion witness (Section~@ref{sec:witness}) exposes the same defect.
:::

Three distinct claims must therefore remain separate:

1. The base skill graph is valid.
2. The selected projection is valid.
3. The target set is completely learnable from a declared entry baseline.

A single passing validator check does not automatically prove all three claims.

### Didactic Routes from Orientation to Autonomy {#sec:routes anchors="85-didactic-route-coverage-motivation-to-autonomy"}

A didactic route leads from motivational entry through subject learning to independent performance. Let $O\subseteq A$ denote orientation (motivation) anchors, $Z\subseteq A$ terminal autonomy goals representing independent capstone performance, and $E_{\mathrm{route}}\subseteq A$ explicitly exempted support goals. Write $R_A=R\cap(A\times A)$ for the direct atomic relation. Without an exemption profile, $E_{\mathrm{route}}=\varnothing$; any exemptions require a documented, machine-readable selection contract. An atom $a\in A\setminus E_{\mathrm{route}}$ is *route-covered* if

$$
\begin{aligned}
\exists o\in O,\ z\in Z:\quad &(a=o\ \lor\ (o,a)\in(R_A^{-1})^+)\\
{}\land\;&(a=z\ \lor\ (a,z)\in(R_A^{-1})^+).
\end{aligned}
$$

In plain terms: the atom lies on at least one learning path starting at an orientation anchor and ending at a terminal autonomy goal. The path follows $R_A^{-1}$, the learning-flow direction from prerequisite to dependent goal.

The route profile determines which goals count as entry points. To introduce unit orientation, a profile would also admit the orientation goal named in a unit declaration as an anchor in the applicable scope. The path to the endpoint must still run through atomic goals. Content review establishes whether the tasks assess the promised skill (Section~@ref{sec:why-graph-not-enough}).

The subject and stage determine which goals may appear along a route. Profiles check reachability through effective prerequisites (`CQR-101`), directly authored atomic paths (`CQR-102`), prerequisites on clusters (`CQR-103`) and endpoint visibility (`CQR-104`). The stronger `GVR-012` check also covers goal types, side prerequisites and the order of preparation. The target is enforcement across all registered scopes of subjects required to reach M7.

Appendix~@ref{sec:implementation} records current coverage and outstanding findings, including the reach of the Physics profile in stage views. The [route inventory](repo:app/scripts/lib/semanticRouteInventory.ts) and the [QA profile generator](repo:app/scripts/generateCurriculumQualityStatus.ts) document which goals are examined.

Higher-level dependency summaries between clusters may be derived from atomic routes. For example, an existential summary $k_2\to k_1$ means:

$$
\exists a\in\Atoms(k_2),\ b\in\Atoms(k_1):(a,b)\in R_A^+.
$$

A percentage coverage summary additionally requires an explicit denominator. Derived summaries never create new authored cluster requirements.

## Learner State, Satisfaction, and Progress {#sec:state}

**Applicable confirmed contract (4/11 November 2026).** The following formulas using $\Meff$ describe the binding recognition model. Full implementation, especially revision-bound global derivation, requires separate evidence. The proposal of 19 November is discussed only in Section~@ref{sec:proposal-unit-assessment}.

The preceding sections describe the skill graph independently of any learner. This section adds learner state: what is persisted, what counts as effectively mastered, which goals are available next, and how progress is aggregated.

### Satisfaction Without Backward Prerequisite Inference {#sec:satisfaction}

#### Explicit outcomes.

Exactly one binary state $m:A\to\{0,1\}$ is persisted, with $M=\{a\in A\mid m(a)=1\}$. $M$ is the set of explicit achievements, or explicit mastery for short. An explicit achievement on a content goal demonstrates verified understanding appropriate to that goal. Orientation, memorization, and assessments each apply their own completion contract (Section~@ref{sec:goal-types}). No partial score creates a third mastery state.

#### Recognition through an assessment.

A valid local assessment contract can establish that further goals of a unit $U$ are satisfied for a learner. This set is $I_U\subseteq A$. For example, an assessment of linear functions can demonstrate independent application of the unit’s covered content goals even when they have not been completed individually. An independent card obligation or another child unit may still be open. For orientation, the inference means only that the opening counts as done. Sections~@ref{sec:learning-units} and~@ref{sec:assessment} give the subject-matter and formal conditions.

#### Effective mastered set.

The effective global mastered set is

$$
\Meff=M\cup\bigcup_{U\in\mathcal U_{\mathrm{valid}}}I_U.
$$

$\mathcal U_{\mathrm{valid}}$ includes all local contracts that remain valid for the learner, each with its applicable revision. A change of visible units, focus or plan preserves these contracts. Explicit and validly inferred achievements both satisfy later prerequisites and count towards progress. The system stores explicit achievements. The derivation in Section~@ref{sec:assessment} leaves these records intact.

All subsequent formulas use $\Meff$. The original illustrations in Figures~@ref{fig:frontier} and~@ref{fig:filters} write $M_A$ for the explicit set $M$. Those examples involve no implicit mastery, so $\Meff=M$ there.

#### Satisfaction.

A goal $g$, whether an atom or a cluster, is *satisfied* when its entire atomic basis is effectively mastered:

:::equation {#eq:sat}
\Sat(g,\Meff)\iff \Atoms(g)\ne\varnothing\ \land\ \Atoms(g)\subseteq\Meff.
:::

Cluster satisfaction is calculated from the results of its atoms. It creates no new result for a child. Likewise, passing an individual content goal alone does not create a record for its prerequisites. Further recognition requires a valid local contract.

### Global Frontier {#sec:frontier}

The *frontier* is the set of atomic goals available next:

:::equation {#eq:frontier}
\Frontier(\Meff)=\left\{g\in A\setminus\Meff\;\middle|\; \forall p\in A:\ (g,p)\in\Rat^+\Rightarrow p\in\Meff\right\}.
:::

An open atom $g$ is available if $\ReqAtoms(g)\subseteq\Meff$. A foundation behind an already mastered intermediate goal still counts. For a cluster prerequisite in transition data, the atoms in its basis count.

For navigation, an analogous cluster availability set may be derived using the cluster's atomic demand $\ReqAtoms(k)$ from @eqref{eq:demand}, covering its own and inherited requirements expanded to atoms and closed transitively:

$$
\Frontier_K(\Meff)=\{k\in K\mid\neg\Sat(k,\Meff),\ \ReqAtoms(k)\subseteq\Meff\}.
$$

Cluster availability does not replace the atomic learning frontier. A user interface may additionally enforce binding entry and selection rules such as the orientation entry gate; the mathematical frontier is therefore not automatically identical to every displayed UI menu. Figure~@ref{fig:frontier} shows the frontier for the running example.

::figure{id="fig:frontier"}

### Aggregation Without Double Counting {#sec:aggregation}

Let $S\subseteq A$ be an explicitly specified set of target atoms and $w(a)>0$ the progress weight of atom $a$. Weighted total progress is the weight share of effectively mastered atoms:

$$
P(S)=\frac{\sum_{a\in S\cap\Meff}w(a)}{\sum_{a\in S}w(a)}\qquad(S\ne\varnothing).
$$

Each atom contributes through its effective binary status: all or nothing. An empty target set admits no such quotient; the UI must report “no goals in the selected scope” rather than a fabricated 100%. Across multiple clusters, $S$ is formed as the set union of their target atoms; clusters and children must never be summed together. Progress of 50% means that the achieved goals account for half the total weight.

The goal tree’s completion display can show explicit and inferred contributions separately. Together they give $P(S)$. A full overall progress bar represents $P(S)=1$. A display counting only explicit results must identify that choice.

Under the convention $w(a)=1$, a cluster's weight equals the count of its unique atomic descendants. That is a sound authoring convention rather than a requirement of uniform weights in every domain. Core and extension shares may be reported separately, while the committed Personal Curriculum determines what belongs to completion. An aggregated ratio is neither a calibrated probability nor a school grade; any grading scheme requires a separate, justified mapping.

## Filters, Focus, and Global Diagnostics {#sec:filters}

Up to this point, the entire graph has been evaluated globally. In practice, however, a learner works inside a scoped subset: longer-term within their Personal Curriculum (personalization Level 2) and temporarily within an active focus (Level 3). This section models every such subset as a filter and fixes the evaluation order: derive on the full graph first, restrict afterwards. Sections~@ref{sec:context-model} and~@ref{sec:personal-scope} introduce the Personal Curriculum, composition views, and projection roles in detail.

### Filters as Predicates and Compiled Applicability {#sec:filter-predicate anchors="112-filter-predicate-and-induced-subgraph"}

At the formal level, a filter is simply a predicate $F:G\to\{0,1\}$ selecting the goal subset $G_F=\{g\mid F(g)=1\}$. A filter may be evaluated from dimensional *applicability* metadata (`applicability`), such as jurisdiction, educational stage, or course profile. Let $D$ denote the set of filter dimensions and $V_d$ the value vocabulary for dimension $d$. A formally typed space of partial assignments is

$$
\mathcal V_D=\bigsqcup_{J\subseteq D}\prod_{d\in J}\Pow(V_d),\qquad \Applicability:G\rightharpoonup\mathcal V_D.
$$

An applicability record assigns allowed value sets to a subset of dimensions $J\subseteq D$; the disjoint union records that defined domain $J$. In general metadata filtering, an omitted dimension leaves the goal unrestricted on that dimension, whereas a present dimension carrying an empty value set admits no concrete selection value. Only the query sentinel `ALL` bypasses even that restriction. Treating omitted metadata as unrestricted never permits treating an unresolved personal stage selection as fully resolved.

For an active query selection $Q$, filter evaluation proceeds dimension by dimension:

$$
F_Q(g)=1\iff\bigwedge_{d\in D_{\mathrm{active}}}
\left\{
\begin{array}{l}
Q(d)=\mathrm{ALL},\ \text{or}\ g\notin\operatorname{dom}(\Applicability),\ \text{or}\\
d\notin\operatorname{dom}(\Applicability(g)),\ \text{or}\\
Q(d)\in \Applicability(g)(d).
\end{array}\right.
$$

A goal matches the selection when, for every active dimension, one of four cases holds: the query specifies `ALL`; the goal carries no applicability mapping; the dimension is absent from its mapping; or the queried value is explicitly permitted. Each branch is evaluated only where the corresponding partial mapping is defined. `ALL` is strictly a query sentinel and must never be persisted as an authored scope value. Explicit `applicabilityOverrides` document reviewed exceptions for auditability while runtime projection evaluates compiled `applicability` alone. Visibility under a filter does not by itself prove source coverage.

### Inherit Globally First, Restrict Afterwards {#sec:global-then-restrict}

The induced relations are

$$
C_F=C\cap(G_F\times G_F),\quad R_F=R\cap(G_F\times G_F),\quad \Reff|_F=\Reff\cap(G_F\times G_F).
$$

Effective prerequisites are computed *before* filtering. Otherwise, a requirement inherited from a filtered-out ancestor could vanish even when both the dependent goal and its prerequisite lie inside the focus. Likewise, structural atomicity is never recomputed from the filtered tree: $A_F=A\cap G_F$. Hiding a cluster's children never turns that cluster into a new atomic goal.

#### Complete Prerequisite Chains in Projections. {#par:projection-closure}

For the longer-term scope of the Personal Curriculum (Level 2, Section~@ref{sec:personal-scope}), reviewed subject views select canonical goals (Section~@ref{sec:composition-views}). Within a subject view, a goal may carry the role `target` or the supporting role `prerequisiteOnly` (Section~@ref{sec:projection-roles}). The decision of 9 November 2026 requires the graph underlying a selection $T\subseteq A$ to retain at least the set below:

$$
\Closure(T)=T\cup\{p\in A\mid\exists t\in T:(t,p)\in\Rat^+\}
$$

$\Closure(T)$ (formerly $U(T)$) comprises the selected atoms and their entire transitive demand. The canonical links between them must also be retained. For transition data this includes the structure needed for inheritance and atomic expansion.

Along the path $a\to b\to c$, selecting $a$ and $c$ must retain the intermediate goal $b$ in the underlying graph. This preserves the prerequisite chain even if a view hides $b$. If $b$ is missing from the underlying graph, the projection needs repair. The composition view introduces no substitute edge.

For personal scope, the reviewed jurisdiction and course filters first select atomic seed targets $S$ across the chosen subjects. Under the decision of 10 November 2026, $L=\Closure(S)$ is then computed on the unpruned canonical graph. Every necessary atom stays in scope, including atoms from other courses and subjects. Siblings in the same unit are included only when themselves needed. Outstanding work and demonstrated units are determined within that fixed scope.

The personal configuration and the curriculum and projection revision determine $L$. A mastered goal stays satisfied in the denominator and needs no repetition. Closure includes its prerequisites too. Assumed prior knowledge is not evidence of mastery.

Compilation validates the authored seed references. For every necessary atom it establishes the target role, a valid canonical prerequisite path and its provenance. An open atom needs a reachable acquisition path. A goal classed as `prerequisiteOnly` within one subject may be a target in the overall plan and counts once under its canonical ID. Unknown references, cycles and missing or unreachable necessary atoms are validation errors regardless of previous results.

Only compilation of the personal learning basis adds targets in this way. Official curriculum assignments, source applicability, focus and goal-type-specific completion rules retain their meanings. Adding a target creates, transfers or deletes no mastery. The backend and WebGUI implement this scope. Applicability checks and full native, curriculum and remote acceptance need their own current evidence.

### Normal Mode and Strict Mode {#sec:filter-modes}

Both modes select their candidate goals from within the scoped subset; they differ solely in which prerequisites they check: normal mode checks only prerequisites inside the subset, whereas strict mode checks all prerequisites globally.

In normal (*optimistic*) mode, scope-relative satisfaction uses the relative basis

$$
\Atoms_F(g)=\Atoms(g)\cap G_F,\qquad \Sat_F(g,\Meff)\iff\Atoms_F(g)\subseteq\Meff.
$$

An empty relative basis does not block availability here; that neither certifies global competence nor mutates stored learner state. Inheritance, atomic expansion, and transitive closure are computed globally first, after which normal mode restricts the required atomic endpoints:

$$
\Frontier_{\mathrm{opt}}(\Meff,F)=\{g\in A_F\setminus\Meff\mid \forall p\in A_F:\ (g,p)\in\Rat^+\Rightarrow p\in\Meff\}.
$$

In strict (*pessimistic / strict*) mode, candidates remain restricted to the focus while prerequisites are checked across the full graph:

$$
\Frontier_{\mathrm{strict}}(\Meff,F)=\{g\in A_F\setminus\Meff\mid \forall p\in A:\ (g,p)\in\Rat^+\Rightarrow p\in\Meff\}.
$$

Hence, for identical inputs,

$$
\Frontier_{\mathrm{strict}}(\Meff,F)\subseteq \Frontier_{\mathrm{opt}}(\Meff,F).
$$

Given $g\to x\to p$ with $G_F=\{g,p\}$, $p$ remains visibly required as a transitive prerequisite in normal mode, while strict mode additionally checks $x$. Even mastery of $x$ never removes $p$ from the transitive check. The scope rule stands on its own and never converts filtered-out prerequisites into mastery. Figure~@ref{fig:filters} contrasts both modes side by side.

::figure{id="fig:filters"}

### Missing Prerequisites and Missing Atoms {#sec:missing}

A diagnostic answers two distinct questions: which prerequisite goal is unsatisfied, and which atomic goals are still missing to satisfy it? Both answers evaluate the global relations:

$$
\begin{aligned}
\Missing(g,\Meff)&=\{p\in G\mid(g,p)\in\Reff\land\neg\Sat(p,\Meff)\},\\
\MissingAtoms(g,\Meff)&=\ReqAtoms(g)\setminus\Meff.
\end{aligned}
$$

$\Missing$ identifies the unsatisfied effective prerequisite nodes themselves for human explanation. $\MissingAtoms$ provides the complete global gap diagnosis: every atom in the goal's atomic demand that is not yet effectively mastered. The partitions $\MissingAtoms\cap G_F$ and $\MissingAtoms\setminus G_F$ separate internal from external atomic gaps. A naive list of directly required clusters can conceal missing external atoms or gaps behind intermediate nodes: for instance, if $g$ requires a cluster $k$ containing only an open atom $b$ while $G_F=\{g,k\}$, then the unsatisfied prerequisite node $k$ lies inside the scope whereas the missing atom $b$ lies outside. Diagnostics neither create new edges nor alter learner outcomes, and they must not be conflated with the blocker list of normal mode.

:::sources
[Graph Definition](repo:docs/concept/skill-graph/graph-definition.md); [Graph Validation Rules](repo:docs/qa-ci/graph-validation-rules.md); [Project Conventions](repo:AGENTS.md).
:::
