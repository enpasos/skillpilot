## Knowledge Context: What a Learner Can Be Assumed to Know {#sec:sga-knowledge-context}

Every piece of content that belongs to a learning goal, be it an explanation, an example, a task, a memory card, a goal image, or a sentence of the coach, addresses a learner who knows some things and does not yet know others. This chapter defines that knowledge as a projection of the skill graph and states what the graph must provide for it.

**Status, 13 November 2026.** Concept and Product Owner requirement. Nothing in this chapter is implemented. The numbers come from a prototype run over the canonical catalog on that day; the prototype is not part of the repository. This page changes no learning goals, graph edges, assessments, or coach behaviour.

### The Requirement {#sec:sga-kc-requirement anchors="the-requirement"}

The learner's knowledge context must be respected. The Product Owner requires three things:

- The knowledge context of a learning goal is derived **deterministically from data stored in the graph**. Nobody writes it by hand.
- It is **compact** enough to accompany every single step.
- It is given to **every AI step that generates or reviews content of the skill landscape**, as a constant cross-check, and to the **coach** together with the respective goal.

The occasion was content that uses subject matter the learner has not met at that point: a unit on differentiating polynomial functions must not show $\sin x$ or $e^x$ in an application or a goal image while trigonometric and exponential functions come later. The reverse error exists as well: a task that needs quadratic equations although no prerequisite path provides them.

### Definition {#sec:sga-kc-definition anchors="definition"}

Let $g$ be an atomic learning goal. Its **secured goals** $W(g)$ are the atomic goals that $g$ requires directly or transitively under the normalized relation of the [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md): inherit, expand to atoms, close transitively. The **knowledge context** of $g$ is the following projection:

| Part | Derivation | Meaning |
| --- | --- | --- |
| Goal | title and description of $g$ | what is being developed here |
| Builds on | the goals of $W(g)$ that no other goal of $W(g)$ requires | the entry competencies |
| Secured | all goals of $W(g)$, grouped by area | may be used |
| Leads to | the goals that require $g$ directly | must not be anticipated |
| Not yet | the first goals of the same top-level area outside $W(g)$: those that require no other such goal | the neighbouring subject matter that suggests itself |
{cols="14%,44%,42%"}

One rule of use applies to generator, reviewer, and coach alike: **what some goal of the catalog develops may be used only if that goal is secured for $g$.** What $g$ itself develops is the subject of the work. What no goal of the catalog develops counts as baseline knowledge, such as everyday and primary-school knowledge, and is judged by review.

The projection has two renderings with a fixed order of entries. The **core** consists of goal, builds on, leads to, and not yet; it accompanies the coach. The **full** rendering adds the secured goals; it accompanies generation and review.

The same definition covers the other kinds of nodes. An assessment or memory goal $q$ develops nothing; its content may use $W(q)$. The knowledge context of a learning unit is the union of the contexts of its own goals and assessments; nothing is written for a unit by hand. Because the prerequisite relation is canonical, the knowledge context is the same in every curriculum context.

Nothing new is stored for the knowledge context. It is a projection of `contains`, `requires`, titles, and descriptions, as the frontier is a projection of prerequisites and mastery.

### What the Prototype Shows {#sec:sga-kc-prototype anchors="what-the-prototype-shows"}

The prototype derived the knowledge context of every ordinary atomic goal of canonical Mathematics and Physics.

| Quantity | Mathematics, median | Mathematics, 90th percentile | Physics, median | Physics, 90th percentile |
| --- | --- | --- | --- | --- |
| Goals | 807 | | 478 | |
| Builds on | 1 | 2 | 1 | 3 |
| Secured | 30 | 51 | 54 | 113 |
| Leads to | 1 | 4 | 1 | 4 |
| Not yet | 15 | 25 | 11 | 29 |
| Core, characters of titles | 950 | 1,440 | 730 | 1,630 |
{cols="28%,18%,18%,18%,18%"}

The core is compact: roughly 250 to 450 tokens of titles. The secured goals rarely fill a whole cluster, so they cannot be shortened to cluster names; the full rendering lists them.

The second finding matters more. **The derived context is exactly as good as the edges.** For the Mathematics goal "Ganzrationale Funktionen ableiten" the graph secures 34 goals, and none of them concerns linear, quadratic, power, or polynomial functions; "Ganzrationale Funktionen über Term und Graph beschreiben" and "Potenzen mit natürlichen Exponenten deuten und berechnen" appear under "not yet". The goal "Ganzrationale Funktionen mit Differentialrechnung analysieren" does not have the goal on differentiating polynomial functions on its prerequisite path. The existing gates establish that `requires` is acyclic, atomic, and transitively minimal. None of them establishes that the prerequisites of a goal suffice.

### Sufficiency: The Property the Graph Must Gain {#sec:sga-kc-sufficiency anchors="sufficiency-the-property-the-graph-must-gain"}

The knowledge context can bind content only where the graph is **sufficient**:

- **A goal is sufficient** if someone who has $W(g)$ and baseline knowledge can learn $g$ as it is described.
- **An artifact is faithful** if it uses only $W(g)$ and what $g$ develops.

A review with the knowledge context as input yields three kinds of findings:

| Finding | Treatment |
| --- | --- |
| A needed competence is an existing goal outside $W(g)$. | Candidate for a `requires` edge. It is a pedagogical modelling decision with honest provenance and goes through subject review; transitive minimality keeps holding. |
| The description of the goal reaches into later subject matter. | Finding about the boundary or the placement of the goal. The text is never narrowed silently. |
| A needed competence is no goal of the catalog and not baseline knowledge. | Finding about a gap. No goal is invented. |
{cols="42%,58%"}

The derivation is deterministic. Whether a text stays inside the context is a review by a model or a person. The context turns that review into a question with a checkable answer: which goals of the catalog does this text presuppose, and are they all secured?

Verdicts are **monotone**. An added edge only enlarges $W(g)$, so a goal that was sufficient and an artifact that was faithful remain so. Only when $W(g)$ loses a goal must the content of $g$ be reviewed again, and a comparison of two states of the graph finds those goals deterministically.

### Who Receives the Context {#sec:sga-kc-consumers anchors="who-receives-the-context"}

| Consumer | Use |
| --- | --- |
| Generation and review of goal texts and edges | The sufficiency question for every goal; the review proposes candidate edges and never adds them itself. |
| Goal images | The image prompt carries the context; today it carries only the title and description of the goal. The image review records faithfulness. |
| Memory cards, practice tasks, and exams | The context of the assessment or memory goal bounds task, solution, and rubric. |
| Learning units | The context of the unit replaces any hand-written statement of its subject matter; the coverage review of an own assessment receives it. |
| Learning-goal book | The context of the goal bounds its page. |
| Coach | The core context of the active goal. The backend merges it with the learner's state: a secured goal that is not yet mastered is not assumed, and a "not yet" goal that the learner has mastered may be used. |
{cols="30%,70%"}

The coach receives titles of goals and mastery states that its context already carries in other places. No chat prose flows back to the backend, and the selection stays with the backend.

### Order of Introduction {#sec:sga-kc-order anchors="order-of-introduction"}

1. **Derive.** A deterministic repository tool and a report per subject. No gate changes.
2. **Review sufficiency** block by block, starting with one pilot block per subject. The share of goals with findings shows what it costs to make a subject sufficient.
3. **Check faithfulness** of images, cards, and tasks, together with the design of the learning units of a block.
4. **Serve the coach** per subject once the subject is sufficient. A context from an insufficient graph would forbid what learners in fact know.

Two decisions are open: whether sufficiency becomes a milestone gate, and at which milestone; and whether titles and descriptions suffice as the stored data, or whether goals should name the terms they introduce so that texts can be screened mechanically. Both are decided with the numbers of the pilot blocks.
