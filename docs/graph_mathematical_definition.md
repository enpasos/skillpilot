# SkillPilot Curriculum Graph Specification

This document defines the SkillPilot curriculum graph as a mathematical structure, including its entities, relations, derived semantics (inheritance), and validity constraints.

The intent is that independent implementations interpret and validate graphs in the same way.

---

## 1. Notation and conventions

* $G$ is a finite set of **goals** (also called skills or nodes).
* A **binary relation** $X \subseteq G \times G$ is a set of ordered pairs $(a,b)$.
* For any relation $X$, $X^+$ denotes the **transitive closure** of $X$.
  Informally, $(a,b)\in X^+$ means there exists a directed path from $a$ to $b$ following edges in $X$.
* A directed graph $(G,X)$ is **acyclic** iff there is no $g \in G$ such that $(g,g)\in X^+$.

---

## 2. Goals and attributes

Each goal $g \in G$ is a distinct entity.

### 2.1 Attribute domains

* $\text{UUID}$: the set of UUID values.
* $\Sigma^*$: the set of finite strings over an alphabet $\Sigma$.
* $\mathbb{R}_{>0}$: strictly positive real numbers.
* $P$: a set of phases. If phase ordering is used, phases form a totally ordered set $(P,\le)$.

### 2.2 Attribute mappings

Each goal $g\in G$ has the following attributes:

* $Id: G \to \text{UUID}$
* $Title: G \to \Sigma^*$
* $Phase: G \to P$
* $Weight: G \to \mathbb{R}_{>0}$

### 2.3 Identifier uniqueness

Identifiers MUST be unique:

$$
\forall g,h\in G:\ g\neq h \Rightarrow Id(g)\neq Id(h)
$$

---

## 3. Relations

The curriculum graph is defined using two primary relations on $G$:

* a hierarchy relation called **Contains**
* a dependency relation called **Direct Requires**

---

## 4. Contains relation

### 4.1 Definition

The **Contains** relation is a binary relation:

$$
C \subseteq G \times G
$$

$(p,c)\in C$ means **parent** $p$ contains **child** $c$.

Edges in $C$ are interpreted as hierarchical grouping (e.g., Module contains Topic).

### 4.2 Forest constraint

$(G,C)$ MUST be a forest, meaning:

1. **At most one parent per node**
   $$
   \forall c\in G:\ \left\lvert{p\in G \mid (p,c)\in C}\right\rvert \le 1
   $$

2. **No cycles**
   $$
   \neg \exists g\in G:\ (g,g)\in C^+
   $$

### 4.3 Ancestors and descendants

Define:

$$
Ancestors(g) = { a\in G \mid (a,g)\in C^+ }
$$

$$
Descendants(g) = { d\in G \mid (g,d)\in C^+ }
$$

---

## 5. Direct Requires relation

### 5.1 Definition

The **Direct Requires** relation is a binary relation:

$$
R_d \subseteq G \times G
$$

$(u,v)\in R_d$ means **$u$ is a direct prerequisite of $v$**.
Equivalently: to learn/attempt $v$, $u$ must be satisfied first.

### 5.2 DAG constraint

$(G,R_d)$ MUST be acyclic:

$$
\neg \exists g\in G:\ (g,g)\in R_d^+
$$

---

## 6. Effective Requires semantics

Direct prerequisites can be specified at higher-level nodes and inherited by their descendants in the hierarchy. This yields the **Effective Requires** relation.

### 6.1 Effective Requires relation

Define $R_{eff}\subseteq G\times G$ by:

$$
(u,v)\in R_{eff}
\iff
\big((u,v)\in R_d\big)
\ \lor
\big(\exists a\in Ancestors(v): (u,a)\in R_d\big)
$$

Interpretation:

* A goal inherits all direct prerequisites declared on its ancestors.
* Only **direct** prerequisites declared in $R_d$ are inherited from ancestors.

### 6.2 Effective prerequisite set

For convenience, define the set of effective prerequisites of a node:

$$
Pre_{eff}(v) = { u\in G \mid (u,v)\in R_{eff} }
$$

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
Let $P$ contain $C$ (i.e., $(P,C)\in C$). Suppose $(X,P)\in R_d$ and $(C,X)\in R_d$.
Then $C \to X \to P$ exists in $R_d$, but inheritance adds $(X,C)\in R_{eff}$ (since $P$ is an ancestor of $C$), creating a cycle $C \to X \to C$ in $R_{eff}$.

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
R_d' = R_d \setminus {(u,g)}
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

* For $(u,v)\in R_d$: $u \notin Ancestors(v)$ and $u \notin Descendants(v)$

If your product needs exceptions, treat this as a heuristic.

---

## 9. Learning availability and progression

Let $M\subseteq G$ be the set of goals the learner has **mastered**.

### 9.1 Available next goals

The learner’s frontier (available next goals) is:

$$
Frontier(M) =
\left{
g \in G\setminus M \ \middle|\
\forall u\in G:\ (u,g)\in R_{eff}^+ \Rightarrow u\in M
\right}
$$

Interpretation: a goal is available if all of its prerequisite goals (including transitive prerequisites) are mastered.

---

## 10. Phase ordering

Assume phases are totally ordered by $\le$.

### 10.1 Monotone prerequisite flow

In typical curricula, prerequisites SHOULD point backward in time or remain within the same phase:

$$
(u,v)\in R_{eff} \Rightarrow Phase(u)\le Phase(v)
$$

If the system supports remedial or non-linear paths, violations of this rule may be allowed as explicit exceptions.

---

## 11. Summary of required validity conditions

A curriculum graph $(G,C,R_d)$ is valid iff:

1. $Id$ is injective on $G$
2. $(G,C)$ is a forest (at most one parent, no cycles)
3. $(G,R_d)$ is a DAG
4. $R_{eff}$ (computed from $C$ and $R_d$) is acyclic
5. $R_d$ satisfies local minimality
6. $R_d$ satisfies transitive minimality

Everything else in this specification is either derived (definitions) or recommended modeling guidance.

---
