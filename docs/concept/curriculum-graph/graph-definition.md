# SkillPilot Curriculum Graph Specification

This document defines the SkillPilot curriculum graph as a mathematical structure, including its entities, relations, derived semantics (inheritance), and validity constraints.

The intent is that independent implementations interpret and validate graphs in the same way.

> Normative vs implementation: this document is the conceptual/normative definition.  
> The currently enforced CI validator profile (including rollout severities and runtime rule IDs) is documented in `docs/qa-ci/graph-validation-rules.md`.

---

## 1. Notation and conventions

- $G$ is a finite set of **goals** (also called skills or nodes).
- A **binary relation** $X \subseteq G \times G$ is a set of ordered pairs $(a,b)$.
- For any relation $X$, $X^+$ denotes the **transitive closure** of $X$.  
  Informally, $(a,b)\in X^+$ means there exists a directed path from $a$ to $b$ following edges in $X$.
- A directed graph $(G,X)$ is **acyclic** iff there is no $g \in G$ such that $(g,g)\in X^+$.

---

## 2. Goals and attributes

Each goal $g \in G$ is a distinct entity.

### 2.1 Attribute domains

- $\text{UUID}$: the set of UUID values.
- $\Sigma^*$: the set of finite strings over an alphabet $\Sigma$.
- $\mathbb{R}_{>0}$: strictly positive real numbers.
- $P$: a set of phases.  
  A curriculum MAY additionally declare a totally ordered comparable subset $(P_{ord},\le)$ with $P_{ord}\subseteq P$.  
  Phase-monotonicity rules in this specification apply only on that declared ordered subset.

### 2.2 Attribute mappings

Each goal $g\in G$ has the following attributes:

- $Id: G \to \text{UUID}$
- $Title: G \to \Sigma^*$
- $Phase: G \to P$
- $Weight: G \to \mathbb{R}_{>0}$

### 2.3 Identifier uniqueness

Identifiers MUST be unique:

$$
\forall g,h\in G:\ g\neq h \Rightarrow Id(g)\neq Id(h)
$$

### 2.4 Atomic and cluster goals (canonical semantic classification)

Once the direct containment relation $C$ from §4 is fixed, the atomic/cluster split is defined canonically by the graph structure:

$$
A = \{\, g\in G \mid \neg \exists c\in G:\ (g,c)\in C \,\}
$$

$$
K = G \setminus A
$$

Interpretation:

- $A$: the set of **atomic goals**  
  Assessable leaf goals with no direct `contains` children.
- $K$: the set of **cluster goals**  
  Structural aggregation goals with at least one direct `contains` child.

Implementations MAY store explicit node-type metadata, but if they do, it MUST agree with this derived classification.  
This makes all later references to “atomic” and “cluster” portable across implementations.

---

## 3. Relations

The curriculum graph is defined using two primary relations on $G$:

- a hierarchy relation called **Contains**
- a dependency relation called **Direct Requires**

---

## 4. Contains relation

### 4.1 Definition

The **Contains** relation is a binary relation:

$$
C \subseteq G \times G
$$

$(p,c)\in C$ means **parent** $p$ contains **child** $c$.

**Note:** $C$ is the *direct* containment relation (“direct contains”).  
Indirect containment (ancestor/descendant) is derived via the transitive closure $C^+$.

Edges in $C$ are interpreted as hierarchical grouping (e.g., Module contains Topic).

### 4.2 Containment constraint (polyhierarchy)

$(G,C)$ MUST be acyclic (containment cannot contain cycles):

$$
\neg \exists g\in G:\ (g,g)\in C^+
$$

This allows **multiple parents** per node (a polyhierarchy).  
If you want a strict tree/forest, see the recommended rule in §8.3.

### 4.3 Ancestors and descendants

Define:

$$
Ancestors(g) = \{\, a\in G \mid (a,g)\in C^+ \,\}
$$

$$
Descendants(g) = \{\, d\in G \mid (g,d)\in C^+ \,\}
$$

For later progression semantics, define the **atomic basis** of a goal:

$$
Atoms(g)=
\begin{cases}
\{g\} & \text{if } g\in A\\
Descendants(g)\cap A & \text{if } g\in K
\end{cases}
$$

Interpretation:

- for an atomic goal, its basis is itself,
- for a cluster goal, its basis is the set of atomic descendants whose mastery witnesses satisfaction of that cluster in set-based progression semantics.

Clusters with $Atoms(g)=\varnothing$ are structurally allowed, but they SHOULD NOT participate in prerequisite authoring or learner progression semantics.

---

## 5. Direct Requires relation

### 5.1 Definition

The **Direct Requires** relation is a binary relation:

$$
R_d \subseteq G \times G
$$

$(u,v)\in R_d$ means **$u$ is a direct prerequisite of $v$**.  
Equivalently: to learn/attempt $v$, $u$ must be satisfied first.

### 5.2 Canonical modeling target (recommended)

The formal model allows direct prerequisite edges between arbitrary goals in $G$.  
However, for high-quality and mature curricula, the **canonical prerequisite layer** SHOULD primarily live between atomic goals:

$$
R_d \subseteq A \times A
$$

Interpretation:

- atomic goals carry the precise didactic sequencing logic,
- cluster goals remain useful for navigation, filtering, and aggregation,
- cluster-level `requires` edges are best treated as a transitional authoring aid or as an intentionally strong universal statement.

If a direct prerequisite is authored on a cluster goal, it is stronger than a mere summary: under the semantics in §6 it constrains descendants via inheritance.

### 5.3 DAG constraint

$(G,R_d)$ MUST be acyclic:

$$
\neg \exists g\in G:\ (g,g)\in R_d^+
$$

---

## 6. Effective Requires semantics

For compatibility with the current runtime and validator profile, direct prerequisites can be specified at higher-level nodes and inherited by their descendants in the hierarchy. This yields the **Effective Requires** relation.

This inheritance model is useful during early-stage authoring, but the long-term modeling target remains the atomic prerequisite layer from §5.2.

### 6.1 Effective Requires relation

Define $R_{eff}\subseteq G\times G$ by:

$$
(u,v)\in R_{eff}
\iff
\big((u,v)\in R_d\big)
\ \lor\
\big(\exists a\in Ancestors(v): (u,a)\in R_d\big)
$$

Interpretation:

- A goal inherits all direct prerequisites declared on its ancestors.
- Only **direct** prerequisites declared in $R_d$ are inherited from ancestors.

**Note (with multiple parents):** If a node has multiple parents, it inherits the union of prerequisites from *all* ancestor paths.

### 6.2 Effective prerequisite set

For convenience, define the set of effective prerequisites of a node:

$$
Pre_{eff}(v) = \{\, u\in G \mid (u,v)\in R_{eff} \,\}
$$

### 6.3 Relation to the canonical atomic model

In the target state where prerequisites are authored canonically on atomic goals, hierarchy inheritance becomes mostly a compatibility mechanism rather than the primary source of learning logic.

In particular:

- if no ancestor of a goal $v$ carries outgoing prerequisite edges, then $Pre_{eff}(v)$ is just the directly authored prerequisite set of $v$,
- if $R_d \subseteq A \times A$, then cluster hierarchy does not inject additional prerequisite facts into atomic goals.

---

## 7. Validity constraints

A SkillPilot curriculum graph is **valid** iff all constraints in this section hold.

### 7.1 Effective Requires must be acyclic

The dependency graph induced by effective prerequisites MUST be acyclic:

$$
\neg \exists g\in G:\ (g,g)\in R_{eff}^+
$$

This constraint is stricter than acyclicity of $R_d$ alone because inheritance via $C$ can introduce cycles.

**Non-normative example (illustrative):**  
Let $(A,B)\in C$ (i.e., $A$ contains $B$). Suppose $(X,A)\in R_d$ and $(B,X)\in R_d$.  
Then $B \to X \to A$ exists in $R_d$, but inheritance adds $(X,B)\in R_{eff}$ (since $A$ is an ancestor of $B$), creating a cycle $B \to X \to B$ in $R_{eff}$.

### 7.2 Local minimality

A direct prerequisite MUST NOT be redundantly stated on a node if it is already inherited from an ancestor.

$$
\forall g\in G,\ \forall u\in G:
(u,g)\in R_d \Rightarrow
\neg \exists a\in Ancestors(g): (u,a)\in R_d
$$

### 7.3 Transitive minimality

A direct prerequisite edge MUST NOT be present if the prerequisite relationship already follows from other effective prerequisite paths.

Formally, for each $(u,g)\in R_d$, remove that single direct edge and recompute effective requirements; the prerequisite must no longer be implied transitively.

Let:

$$
R_d' = R_d \setminus \{(u,g)\}
$$

and let $R_{eff}'$ be the effective relation computed from $R_d'$ using the definition in §6.1.

Then the constraint is:

$$
\forall (u,g)\in R_d:\ (u,g)\notin (R_{eff}')^+
$$

Interpretation: every edge in $R_d$ is necessary to preserve prerequisite reachability under the inheritance rules.

---

## 8. Recommended structural rules

The following are common modeling rules that typically improve graph quality. They may be treated as warnings or enforced as hard constraints depending on the product needs.

### 8.1 Avoid requiring descendants

A goal SHOULD NOT require its own descendant:

$$
(u,v)\in R_d \Rightarrow u \notin Descendants(v)
$$

This prevents “inside-out” prerequisite definitions that often indicate a modeling error (e.g., a parent depending on one of its parts).

### 8.2 Avoid prerequisites along containment edges

Often, prerequisites SHOULD be modeled between peer concepts rather than between ancestors/descendants in the hierarchy. Common guidance:

- For $(u,v)\in R_d$: $u \notin Ancestors(v)$ and $u \notin Descendants(v)$

If your product needs exceptions, treat this as a heuristic.

In the current validator profile, the ancestor cases are covered by rollout rules `GVR-001` and `GVR-003` (see `docs/qa-ci/graph-validation-rules.md`).

### 8.3 Optional: At most one parent per node (tree/forest mode)

If you want a strict tree/forest hierarchy, enforce:

$$
\forall c\in G:\ \left|\{\,p\in G \mid (p,c)\in C\,\}\right| \le 1
$$

### 8.4 Prefer atomic prerequisite authoring

For mature landscapes, the actual didactic sequencing SHOULD be authored on atomic goals first.

Practical guidance:

- Prefer adding `requires` edges between atomic goals instead of between clusters.
- Use cluster-level `requires` only temporarily during early modeling, or when the prerequisite claim truly applies to all relevant descendants.
- When refining a curriculum over time, move broad cluster dependencies downward into the relevant atomic goals and let higher-level dependency views be derived from that atomic layer.

This keeps frontier logic precise and avoids over-blocking learners with coarse prerequisites.

### 8.5 Didactic route coverage: motivation to autonomy

SkillPilot landscapes SHOULD expose one or more didactic routes through the atomic prerequisite graph.

Let:

- $M \subseteq A$ be the set of **motivation anchors**  
  (for example, atomic goals such as "Warum Physik?" / "Why Physics?")
- $T \subseteq A$ be the set of **terminal autonomy goals**  
  (for example, independent exam-task solving or other authentic capstone performances)
- $E_{route} \subseteq A$ be an optional set of **explicitly excluded support-only atomic goals**  
  (for example, memorization-only nodes or other operational helper nodes)

Default:

$$
E_{route}=\varnothing
$$

If a profile uses a non-empty $E_{route}$, the identifying predicate MUST be machine-readable and documented by that profile.

An atomic goal $a\in A\setminus E_{route}$ is **route-covered** iff:

$$
\exists m\in M,\ \exists t\in T:
\big(a=m \lor (m,a)\in R_d^+\big)
\ \land\
\big(a=t \lor (a,t)\in R_d^+\big)
$$

Interpretation: every route-relevant atomic goal should lie on at least one didactic path that starts with motivation and ends in autonomous performance.

This means the atomic `requires` graph should not be a loose bag of local dependencies.  
It should form teachable routes whose overall direction is:

- motivation,
- understanding / guided learning,
- memorization where needed,
- independent application / exam-level performance.

In the current validator rollout, rules `GVR-004` and `GVR-005` implement only the first half of this idea: they ensure connectivity from atomic goals back to a motivation anchor in the effective-prerequisite graph. A future stricter profile can extend this to full route coverage toward terminal autonomy goals, preferably on the atomic prerequisite layer.

### 8.5.1 Reference example: Physics E-phase subtree

A concrete reference implementation for this target state exists in the Physics landscape:

- file: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json`
- subtree root: `Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen`

In its curated state, this subtree is intended as a model example for mature prerequisite authoring:

- normal learning goals in the subtree use atomic `requires` as their canonical didactic layer,
- cluster goals inside the subtree do not carry direct `requires`,
- all non-memory atomic goals in the subtree lie on atomic routes from the global motivation anchor `Warum Physik? – Weltverständnis & Zukunft` to one or more terminal autonomy goals in `Übungen E-Phase`,
- the memorization node `Lernkarten - E-Phase` is explicitly modeled as a memory node and should be treated separately from normal route-coverage judgments.

This example is useful because it shows that the target semantics in §5.2 and §8.5 are not merely aspirational; they can be implemented in a real curriculum subtree without relying on inherited cluster prerequisites.

### 8.5.2 Reference example: Mathematics upper-secondary landscape

A second concrete reference implementation exists in the Mathematics landscape:

- file: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json`
- scope: the ordinary curriculum phases `E`, `Q1`, `Q2`, `Q3`, `Q4` plus the global process-competency exercise branch

In its curated state, this landscape is intended as a whole-landscape reference for mature route coverage:

- normal learning goals use atomic `requires` as their canonical didactic layer,
- the phase-local autonomy targets are modeled explicitly via `Übungen E-Phase`, `Übungen Q1`, `Übungen Q2`, `Übungen Q3`, `Übungen Q4` and `Übungen Prozesskompetenzen`,
- each of these exercise branches contains atomic exam-mode-capable goals with concrete `examData`,
- outside the intentionally separate global Abitur containers, the landscape no longer relies on cluster-level `requires` for ordinary didactic sequencing,
- the global Abitur containers remain a distinct assessment layer and should not be confused with the local terminal autonomy goals that close the ordinary phase routes.

This example is useful because it demonstrates the target semantics not only for a subtree, but for an entire subject landscape with multiple phases and an additional cross-phase process-competency branch.

### 8.6 Derive cluster-level dependency views from atomic routes

For cluster goals $k_1,k_2\in K$, higher-level dependency views SHOULD normally be derived from atomic descendants rather than authored as standalone prerequisite facts.

Typical summary semantics include:

- **existential summary:** some atomic descendant of $k_2$ depends on some atomic descendant of $k_1$,
- **coverage summary:** a defined share of atomic descendants of $k_2$ depends on descendants of $k_1$.

If a UI, report, or API exposes cluster-level dependencies, it SHOULD document which summary semantics it uses.  
A raw boolean cluster edge is often too coarse for mature curricula.

---

## 9. Learning availability and progression

The primitive learner state for progression semantics is an **atomic mastered set**:

$$
M_A \subseteq A
$$

This reflects the intended authoring model: atomic goals are mastered directly, while cluster satisfaction is derived from atomic mastery.

### 9.1 Available next goals

Define the global **satisfaction predicate**:

$$
Sat(g,M_A)
\iff
\big(Atoms(g)\neq\varnothing\big)\ \land\ \big(Atoms(g)\subseteq M_A\big)
$$

Interpretation:

- an atomic goal is satisfied iff it is in $M_A$,
- a cluster goal is satisfied iff all of its atomic descendants are in $M_A$.

The normative learner frontier is defined on atomic goals:

$$
Frontier(M_A) =
\left\{
a \in A\setminus M_A \ \middle|\ 
\forall u\in G:\ (u,a)\in R_{eff}^+ \Rightarrow Sat(u,M_A)
\right\}
$$

Interpretation: an atomic goal is available if all of its effective prerequisite goals are already satisfied, where cluster prerequisites are evaluated through their atomic descendants.

If a product also exposes **cluster availability** for navigation purposes, it SHOULD derive it from the same satisfaction predicate:

$$
Frontier_K(M_A)=
\left\{
k\in K \mid Atoms(k)\neq\varnothing\ \land\ \neg Sat(k,M_A)\ \land\ \forall u\in G:\ (u,k)\in R_{eff}^+ \Rightarrow Sat(u,M_A)
\right\}
$$

This keeps learner progression deterministic even while cluster-level `requires` remain legal in the compatibility model.

In the current compatibility model, availability is evaluated on $R_{eff}$.  
In a mature atomic-authored landscape, frontier decisions for atomic goals should be driven primarily by the atomic prerequisite layer, with inherited cluster prerequisites serving only as transitional support where they still exist.

---

## 10. Phase ordering

This section applies only to curricula that declare an ordered comparable phase subset $(P_{ord},\le)$ as described in §2.1.

### 10.1 Monotone prerequisite flow

In typical curricula, prerequisites SHOULD point backward in time or remain within the same phase:

$$
(u,v)\in R_{eff}\ \land\ Phase(u)\in P_{ord}\ \land\ Phase(v)\in P_{ord}
\Rightarrow Phase(u)\le Phase(v)
$$

Goals whose phases are not in the declared ordered subset are outside the scope of this rule.  
If the system supports remedial or non-linear paths, violations of this rule may be allowed as explicit exceptions.

In the current validator profile, this check is implemented as rule `GVR-002` (strict by default; temporary warn mode via `VALIDATE_GRAPH_STRICT_RULES=0`).

---

## 11. Summary of required validity conditions

A curriculum graph $(G,C,R_d)$ is valid iff:

1. $Id$ is injective on $G$
2. $(G,C)$ is acyclic (containment DAG / polyhierarchy; multiple parents allowed)
3. $(G,R_d)$ is a DAG
4. $R_{eff}$ (computed from $C$ and $R_d$) is acyclic
5. $R_d$ satisfies local minimality
6. $R_d$ satisfies transitive minimality

Everything else in this specification is either derived (definitions) or recommended modeling guidance.

---

## 12. Filters and scoped evaluation (Optimistic vs. Pessimistic)

A **filter** restricts the global curriculum graph to a subset of nodes (e.g., *Grade 12* AND *Subject: Mathematics* AND *Track: Advanced*).

### 12.1 Filter predicate and induced subgraph

A filter is modeled as a predicate:

$$
F: G \to \{0,1\}.
$$

It selects the filtered node set:

$$
G_F = \{\, g \in G \mid F(g)=1 \,\}.
$$

The induced (restricted) relations are:

$$
C_F = C \cap (G_F \times G_F),
\qquad
R_{d,F} = R_d \cap (G_F \times G_F).
$$

For scoped learner evaluation, the normative filtered effective relation is the **restriction of the global effective relation**:

$$
R_{eff}|_F = R_{eff} \cap (G_F \times G_F)
$$

This means:

- effective prerequisite facts are computed once on the full graph,
- then prerequisite facts whose source or target lies outside the filter are ignored,
- but in-scope prerequisite facts are preserved even if they arose globally via an out-of-scope ancestor.

This avoids making scoped availability depend on whether a prerequisite was authored directly on a child or inherited from a filtered-out ancestor.

### 12.2 Optimistic mode

In **optimistic mode**, we first apply the filter and then compute availability inside the filtered graph only.  
Intuition: when a learner is in the filtered scope (e.g., Grade 12), we temporarily assume that missing prerequisites from outside the scope do not block progress.

Define the filtered atomic set:

$$
A_F = A \cap G_F
$$

Define the scope-relative atomic basis:

$$
Atoms_F(g)=Atoms(g)\cap G_F
$$

and the corresponding scope-relative satisfaction predicate:

$$
Sat_F(g,M_A)
\iff
\big(Atoms_F(g)\neq\varnothing\big)\ \land\ \big(Atoms_F(g)\subseteq M_A\big)
$$

Then the optimistic frontier is:

$$
Frontier_{opt}(M_A,F) =
\left\{
a \in A_F \setminus M_A \ \middle|\ 
\forall u\in G_F:\ (u,a)\in (R_{eff}|_F)^+ \Rightarrow Sat_F(u,M_A)
\right\}.
$$

### 12.3 Pessimistic mode or strict mode

In **pessimistic mode** or **strict mode**, candidate goals are still restricted to the filtered set, but prerequisites are enforced **globally** (including nodes outside the filter).

Let $R_{eff}$ be computed on the full graph $(G,C,R_d)$. Then:

$$
Frontier_{pess}(M_A,F) =
\left\{
a \in A_F \setminus M_A \ \middle|\ 
\forall u\in G:\ (u,a)\in R_{eff}^+ \Rightarrow Sat(u,M_A)
\right\}.
$$

### 12.4 Diagnostic: missing prerequisites

For diagnosis, define the set of missing prerequisites of a goal $g$:

$$
Missing(g,M_A) =
\{\, u \in G \mid (u,g)\in R_{eff}^+ \land \neg Sat(u,M_A) \,\}.
$$

To distinguish gaps inside vs. outside the filter:

$$
\begin{aligned}
Missing_{in}(g,M_A,F)  &= Missing(g,M_A)\cap G_F,\\
Missing_{out}(g,M_A,F) &= Missing(g,M_A)\setminus G_F.
\end{aligned}
$$


Operationally, one can start with optimistic mode for efficiency and exploration; if a learner struggles with a goal, switch to pessimistic mode (or compute $Missing_{out}$) to identify prerequisite gaps outside the current filter.

### 12.5 Optional: relaxed pessimism via a prerequisite scope

A “weakened” pessimistic approach can be modeled by choosing a **scope** set $S \subseteq G$ of prerequisites that must be enforced (e.g., only prerequisites from the last one or two phases, or only prerequisites up to a bounded depth).

Define:

$$
Frontier_{scope}(M_A,F,S) =
\left\{
a \in A_F \setminus M_A \ \middle|\ 
\forall u\in S:\ (u,a)\in R_{eff}^+ \Rightarrow Sat(u,M_A)
\right\}.
$$

Special cases:

- $S = G$ gives the fully pessimistic mode.
- Choosing $S$ smaller than $G$ yields a relaxed pessimistic check that can be widened iteratively if needed.
