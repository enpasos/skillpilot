## Goals, Identity, and Relations {#sec:core}

Sections~@ref{sec:core} to~@ref{sec:filters} form the formal core. This section introduces learning goals and the two authored relation kinds. Section~@ref{sec:relations} derives the relations used in computation, while Section~@ref{sec:validity} states the graph validity conditions. Section~@ref{sec:state} models a learner's state and Section~@ref{sec:filters} evaluates availability and diagnostics inside a scoped subset of the graph.

### The Base Object {#sec:core-object}

The normative core is a finite directed graph

$$
\mathcal G=(G,C,R),\qquad C,R\subseteq G\times G.
$$

$G$ is the set of learning goals. $C$ denotes `contains`: one goal contains another. $R$ denotes `requires`: one goal requires another as a prerequisite. Exactly these two *explicitly authored* relation kinds exist in the skill graph; only they are stored by curriculum authors. Derived relations, curricular placements, source mappings, and evidence belong to separate model layers.

Each pair $(x,y)$ is directed. For any relation $X$ on $G$,

$$
X^{-1}=\{(y,x)\mid(x,y)\in X\}
$$

denotes the inverse relation and $X^+$ the transitive closure: $(x,y)\in X^+$ holds if and only if a directed $X$-path of at least one edge leads from $x$ to $y$. Zero-length paths do not count. A relation $X$ is *acyclic* if no goal leads back to itself along such a path, that is, $\forall g\in G:(g,g)\notin X^+$. A directed acyclic graph is called a DAG for short. The raw union $C\cup R$ is *not* the relation against which DAG conditions are checked indiscriminately: the two edge kinds carry distinct semantics. Section~@ref{sec:validity} specifies which relations must be acyclic.

Figure~@ref{fig:overview} illustrates both relation kinds on an example.

:::principle {title="Arrow Direction Is Part of the Definition"}
$k\xrightarrow{\mathtt{contains}}c$: cluster $k$ contains goal $c$. $g\xrightarrow{\mathtt{requires}}p$: goal $g$ requires prerequisite $p$. A learning-flow view instead depicts $R^{-1}$: from prerequisite to the skill building upon it. That inverse direction must be explicitly labelled.
:::

::figure{id="fig:overview"}

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

The two authored relation kinds induce the derived relations used to compute availability, progress, and completion. Table~@ref{tab:relations} summarizes them; the subsections below define each entry in order.

:::table {#tab:relations caption="Authored and derived relations. In the canonical target state $R=R_A=\Reff=\Rat$; only the transitive closure $\Rat^+$ remains derived." cols="15mm,45mm,X"}
| Symbol | Name | Construction and use |
| --- | --- | --- |
| $C$ | Containment | Authored `contains` edges. They group goals and determine atoms, clusters, and each goal's atomic basis. |
| $R$ | Authored (direct) requirements | Stored `requires` edges. In the canonical target state they connect atoms only. |
| $\Reff$ | Effective requirements | $R$ together with requirements inherited from `contains` ancestors. |
| $\Rat$ | Atomically normalized requirements | Every effective prerequisite is expanded into its atomic basis, leaving pairs of atoms only. |
| $\Rat^+$ | Transitive closure | All prerequisites reachable across chains. Basis of demand, frontier, and implicit mastery. |
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

$(g,p)\in R$ means that $g$ directly requires $p$. The edge $(g,p)$ is called a *requirement* of $g$, and the goal $p$ is a *prerequisite* of $g$. Multiple outgoing edges are conjunctive: $g$ requires *all* listed prerequisites, not a choice among them. Alternatives require a dedicated selection contract outside this relation. The relation $R$ must be acyclic. Figure~@ref{fig:requires} shows four direct requirements.

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

For runtime evaluation, prerequisites are normalized to atoms first. Every effective prerequisite is replaced by its atomic basis:

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

A complete skill graph satisfies the canonical target state if and only if, alongside the attribute and identity requirements of Section~@ref{sec:core}, atomic normal form @eqref{eq:atomic-target}, acyclicity, and atomic transitive minimality hold:

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

In the atomic chain $\nd{Q}\to\nd{B}\to\nd{A}$, an extra direct edge $\nd{Q}\to\nd{A}$ is redundant and must be removed. The remaining closure still demands $\nd{A}$ even when $\nd{B}$ is already mastered. Transitive pairs are derived rather than stored as additional direct edges. The binding transitive-minimality rule of 4 November 2026 remains in force; the decision of 8 November 2026 fixes atomic normal form as the canonical target state. The Product Owner decision of 12 November 2026 requires complete deterministic validation of that current state and retires the earlier migration-order and preservation obligations.

The internal check identifier `G17` denotes complete atomic normal form plus complete transitive minimality across the declared canonical subject inventory, including required cross-subject prerequisites and inheriting ancestors; a partial scan or a single route profile does not suffice.

#### Complete Target-State Validation in the Milestone Examination.

Under the Product Owner decision of 12 November 2026, acceptance depends on the current inventory. Every subject milestone pass `M1`--`M7` requires successful complete deterministic validation of the declared canonical subject inventory, including all necessary cross-subject prerequisites and inheriting ancestors. Neither a sample nor just the goals visible within the current learner focus suffices.

Validation requires resolved identities and references, acyclicity, atomic source and target nodes for every authored `requires`, consistent explicit types, and complete transitive minimality. Missing or incomplete checks never count as passing. A violation caps the subject and its scope milestones at `M0`; an incomplete catalog aborts the status run ([GD-C17](@rule{GD-C17})).

A prescribed sequence of editing steps or equality with a historical prerequisite closure, projection, or frontier is no longer an acceptance condition. Current scope, applicability, target-set, frontier, completion, and mastery rules remain binding in their respective validation areas; `G17` alone does not prove those additional rules. Historical reduction proofs remain available for the review bindings that actually use them, without defining the current validation catalog. Source fidelity and review freshness remain required; graph edits never write learner outcomes.

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

Since 11 November 2026, `CQR-001` in the [status generator](repo:app/scripts/generateCurriculumQualityStatus.ts) runs the [removal auditor](repo:app/scripts/auditTransitiveMinimality.ts) on every declared root of the complete current canonical Gymnasium catalog, including the required cross-subject goals and their inheriting ancestors. Besides references and the effective DAG, it reports every authored requirement with a non-atomic source or prerequisite goal, every redundant authored requirement, and every contradicting explicit type. Once atomic normal form holds, the removal criterion coincides with @eqref{eq:atomicmin}; a pass therefore establishes `G17` for that root. A violation caps the subject at `M0` and thereby blocks every milestone pass `M1`--`M7`. The [current catalog inventory](repo:app/scripts/currentCurriculumCatalog.ts) is derived from the curriculum manifest and the canonical overview's subject declarations and checked against the complete canonical directory. The generator aborts on an incomplete catalog; historical reduction proofs do not determine this validation scope. The direct CI command `check:transitive-minimality` checks all 21 canonical roots and fails on violations independently of protected floors; `CQR-001` does not check roots outside the canonical Gymnasium catalog. The direct `check:curriculum-maturity-floors` command also checks pinned individual subject/scope obligations against the Git base selected through `--base-ref`, rather than trusting numeric maturity alone. A pass certifies the current state. The reduction proof serves only to reuse review evidence that depends on it. It is frozen since 12 November 2026: its registry records the reviewed value per goal, an unchanged goal keeps its reviews, and a changed goal faces strict checks against current review inputs; stale evidence receives no credit (Appendix~@ref{sec:rule-milestones}).

The earlier CQR/GVR baseline hardening reached `main` on 13 November 2026 through [PR #131](https://github.com/enpasos/skillpilot/pull/131). The later integration state `2129b207f4`, following changes to frozen review evidence and the Mathematics assessment, passed all 14 jobs of [CI #2315](https://github.com/enpasos/skillpilot/actions/runs/43398052180). The [delivery record](repo:docs/dev/cqr-gvr-hard-gate-plan-2026-11-12.md) distinguishes the PR and main runs. This establishes technical enforcement within each declared domain; the four missing visibility scopes of `CQR-104` and broader subject coverage of `GVR-012` remain open. This QA evidence establishes neither human trials nor implementation of broader runtime contracts.

**Current candidate:** The follow-up work is in [PR #141](https://github.com/enpasos/skillpilot/pull/141), based on updated main at `2ad03c810c`, and has not been integrated into main. The new balance of 12 HARD / 50 PARTIAL / 55 OPEN / 28 OPT/DOC and three directly required `GVR-012` scopes in an inventory of twelve describes this locally verified candidate. Local evidence is recorded in the [follow-up record](repo:docs/dev/cqr-gvr-hard-gate-plan-2026-11-12.md); final remote CI and main acceptance are not recorded here as complete. Historical CI #2315 applies only to its original state.

The Product Owner decision of 13 November 2026 fixes the grading domain of every `GD-*` rule to the 21-root canonical Gymnasium catalog. Obligations from M5, M6, or M7 are assessed against their stated threshold; currently ten subjects are pinned at M6/M7, five of them at M7. Non-canonical landscapes are outside this work programme. A hard grade still requires complete enforcement of every sub-obligation in the row: the domain decision does not close runtime contracts, semantic route gaps, or general assessment-coverage gaps.

Two rule families currently enforce parts of the target state: *Curriculum Quality Review* (CQR) and *graph-validation rollout rules* (GVR). Besides `CQR-001`, direct atomic subject-route coverage is checked by `CQR-102`; hard semantic route validation for Mathematics Sek I/Sek II and Biology Sek II is enforced by `GVR-012`. Within their declared scopes, both already require direct atomic routes and reject inherited cluster paths as substitutes. Rule-code prefixes are listed in Appendix~@ref{sec:rule-code-legend}.

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

Writing $O$ and $Z$ (rather than $M$ and $T$ as in earlier editions) avoids collisions with the mastery set $M$ and the target sets $T(U)$ and $T_\pi$. Restricting to $R_A$ prevents a cluster from acting as a hidden intermediate node in an atomic route proof. This formula is a structural connectivity criterion, not a proof of didactic quality.

Concrete route profiles additionally constrain educational stage, admissible goal types, and semantic order: orientation at entry, subject learning, optional support via memory goals where needed, and independent performance at the end. Memory goals do not thereby become mandatory checkpoints everywhere. Profile rules verify distinct claims: complete routes over effective prerequisites (`CQR-101`), direct atomic routes (`CQR-102`), and absence of `requires` on selected clusters (`CQR-103`). The shared `CQR-102` evaluator enforces direct atomic reachability across all twelve declared profiles. In three of the twelve profiles (Mathematics lower/upper secondary, Biology upper secondary), `GVR-012` additionally enforces the stronger semantic complete-route contract. The [shared semantic route inventory](repo:app/scripts/lib/semanticRouteInventory.ts) derives six candidates from the QA profiles and four complete current classification ledgers. Physics lower/upper secondary and Chemistry upper secondary remain diagnostic with 8/1/3 route findings; six other scopes lack complete current ledgers. No finding is resolved by reclassification or a weakened route rule. Retired GVR identifiers remain reserved and are not active gates. These profile checks do not constitute a repository-wide proof of atomic normal form across all subjects; `CQR-001` and the direct G17 gate cover the explicitly bounded 21-root canonical Gymnasium catalog (Section~@ref{sec:mandatory-validity}).

**Binding expansion target from M7 (Product Owner decision of 13 November 2026):** `GVR-012` shall become mandatory for every registered QA scope of subjects obligated to meet M7. Today this means seven scopes of five subjects; three are secured and four have unresolved route or classification findings. The complete M7 obligation is activated only after evidence-backed closure of those findings. The five M6 scopes remain in the twelve-scope inventory and become mandatory on later promotion to M7. `GVR-012` stays PARTIAL until complete technical enforcement; existing required scopes and pins remain protected. `3/12` still denotes inventory coverage, while `3/7` denotes coverage of the current M7 target. The complete twelve-scope diagnostic is not an M7 promotion check; its failure for missing M6 ledgers remains meaningful. A later HARD gate does not automatically upgrade broader GD rules.

Higher-level dependency summaries between clusters may be derived from atomic routes. For example, an existential summary $k_2\to k_1$ means:

$$
\exists a\in\Atoms(k_2),\ b\in\Atoms(k_1):(a,b)\in R_A^+.
$$

A percentage coverage summary additionally requires an explicit denominator. Derived summaries never create new authored cluster requirements.

## Learner State, Satisfaction, and Progress {#sec:state}

The preceding sections describe the skill graph independently of any learner. This section adds learner state: what is persisted, what counts as effectively mastered, which goals are available next, and how progress is aggregated.

### Satisfaction Without Backward Prerequisite Inference {#sec:satisfaction}

#### Explicit outcomes.

Exactly one binary state $m:A\to\{0,1\}$ is persisted, with $M=\{a\in A\mid m(a)=1\}$. $M$ is the set of explicit achievements, or explicit mastery for short. An explicit achievement on a content goal demonstrates verified understanding appropriate to that goal. Orientation, memorization, and assessments each apply their own completion contract (Section~@ref{sec:goal-types}). No partial score creates a third mastery state.

#### Preview of implicit mastery.

Sections~@ref{sec:learning-units} and~@ref{sec:assessment} introduce learning units and the derivation of implicit mastery; here only their result is needed. For every learning unit $U$ holding a local contract durably valid for this learner, the implicit set $I_U\subseteq A$ is derived. That contract binds the unit's directly owned acquisition targets, their content revision, and the subject-reviewed evidentiary scope of the unit's assessments. On content goals, $I_U$ demonstrates independent application. Concretely, a passed assessment on linear functions can substantiate independent application of $U$'s own content goals even when those goals were not checked off individually. An independent flashcard obligation or sibling child unit may still be open; full completion of the unit is not a prerequisite for this recognition. A derivatively satisfied orientation marker retains strictly the meaning of a completed entry step; it claims neither subject competence nor that a motivational dialogue occurred.

#### Effective mastered set.

The effective global mastered set is

$$
\Meff=M\cup\bigcup_{U\in\mathcal U_{\mathrm{valid}}}I_U.
$$

Here $\mathcal U_{\mathrm{valid}}$ contains the learner- and revision-bound authoritative local contracts that remain durably applicable, not merely currently visible units or latest content revisions. Both forms of justification carry equal weight in their effective outcome: they satisfy future prerequisites, count toward achieved progress, and remain effective across focus or schedule changes. $I_U$ never writes synthetic rows into explicit mastery storage. Section~@ref{sec:assessment} defines the derivation and the subject-review prerequisites of the contract.

All subsequent formulas use $\Meff$. The original illustrations in Figures~@ref{fig:frontier} and~@ref{fig:filters} write $M_A$ for the explicit set $M$. Those examples involve no implicit mastery, so $\Meff=M$ there.

#### Satisfaction.

A goal $g$, whether an atom or a cluster, is *satisfied* when its entire atomic basis is effectively mastered:

:::equation {#eq:sat}
\Sat(g,\Meff)\iff \Atoms(g)\ne\varnothing\ \land\ \Atoms(g)\subseteq\Meff.
:::

Satisfaction propagates forward only. Mastering a dependent content goal by itself never proves its prerequisites; only a valid local contract supports additional implicit recognition. Cluster progress never writes outcomes back to its children.

### Global Frontier {#sec:frontier}

The *frontier* is the set of atomic goals available next:

:::equation {#eq:frontier}
\Frontier(\Meff)=\left\{g\in A\setminus\Meff\;\middle|\; \forall p\in A:\ (g,p)\in\Rat^+\Rightarrow p\in\Meff\right\}.
:::

An atom belongs to the frontier when it is still open itself and its entire atomic demand is effectively mastered: $\ReqAtoms(g)\subseteq\Meff$. The frontier requires all transitive effective atomic prerequisites. A mastered intermediate goal does not short-circuit this check. Partially worked goals do not count as satisfied. A cluster prerequisite is evaluated through its atomic basis.

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

Each atom contributes through its effective binary status: all or nothing. An empty target set admits no such quotient; the UI must report “no goals in the selected scope” rather than a fabricated 100%. Across multiple clusters, $S$ is formed as the set union of their target atoms; clusters and children must never be summed together. A progress figure such as 50% denotes the share of achieved goals in the scope, never half-mastery of an individual goal.

Distinct from that aggregate ratio is the segmented completion indicator in the goal tree, which may display explicitly stored and implicitly derived contributions separately. Both count in $P(S)$; a completely filled total bar means $P(S)=1$. Any separate metric restricted to explicit outcomes must state its narrower numerator.

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

Level 2 denotes the longer-term scope of a learner's Personal Curriculum, for instance for a specific jurisdiction and course profile (Section~@ref{sec:personal-scope}). A reviewed composition view specifies the canonical goal references for that scope (Section~@ref{sec:composition-views}), while role validation distinguishes actual learning targets `target` from pure prerequisite helpers `prerequisiteOnly` (Section~@ref{sec:projection-roles}). Under the Product Owner decision of 9 November 2026, projecting a selected atomic target set $T\subseteq A$ must retain in the underlying prerequisite graph at least

$$
\Closure(T)=T\cup\{p\in A\mid\exists t\in T:(t,p)\in\Rat^+\}
$$

together with the canonical prerequisite relationships required to preserve their full transitive demand. $\Closure(T)$ thus consists of the selected targets and their complete atomic demand (written $U(T)$ in earlier editions). Applicability and reviewed Level 2 composition determine $T$, but must never prune indispensable canonical intermediate goals before prerequisite chains are computed. On transition data, the canonical structure needed for inheritance and atomic expansion must remain available as well.

Consequently, if $a$ requires $b$ and $b$ requires $c$, selecting $a$ and $c$ must retain $b$ in the underlying graph so that $a$'s demand for $c$ is preserved. Losing that path makes the projection invalid; the missing nodes and relationships must be retained rather than worked around by authoring new `requires` edges in the composition view or weakening canonical prerequisites.

Structural completeness does not require displaying every retained node in the visible learner tree. Conversely, silent structural loading alone is insufficient: authored seed references remain hard-validated. For required atoms, a compiled target role backed by a verified canonical prerequisite path and recorded provenance satisfies the role obligation without requiring a manual view reference per atom. Unknown references, cycles, and missing or unreachable required atoms remain hard errors even when already mastered. Unrelated `contains` descendants are not enrolled thereby. Under the explicit Product Owner decision of 10 November 2026, $L=\Closure(S)$ forms the personal learning basis, where $S$ is the union of atomic seed targets from the selected reviewed subject scopes. First, their reviewed course and jurisdiction filters select the eligible seeds $S$; next, closure is computed on the unpruned canonical graph. Additional necessary atoms remain included despite those seed filters, whereas unrelated goals from other courses or jurisdictions are excluded. Every necessary atom belongs to learning, progress, and completion. $L$ is fixed by personal configuration and curriculum/projection revision independently of mastery. Mastered atoms remain satisfied in the denominator without requiring repetition; mastered intermediates never truncate the transitive closure; and an unproven entry assumption never satisfies a learning obligation.

This explicit personal compile rule supersedes the former blanket ban on automatic target addition solely at the Personal Curriculum boundary. Every open necessary atom requires an actually navigable acquisition target in the overall plan. Subject-local `prerequisiteOnly` references remain admissible when the same canonical ID is targeted elsewhere in the plan, counted once. The rule never enrolls siblings, entire foreign units, or whole subjects merely because one atom is needed, yet retains every individually necessary atom in $L$ even if that spans every atom of a subject. It neither alters official curricular assignment or source applicability nor widens focus or creates, copies, transfers, or deletes mastery; goal-type-specific completion rules remain authoritative. Backend and WebGUI implement this closed personal learning basis, while applicability validation and full native, curriculum, and remote acceptance of the current state remain separately evidenced.

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
