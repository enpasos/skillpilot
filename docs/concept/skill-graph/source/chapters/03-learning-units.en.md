## Learning Units: From Learning Promise to Recursive Completion {#sec:learning-units}

The skill graph specifies which goals exist and what they require, yet it does not say which goals together form a coherent domain unit that a learner starts and completes as a recognizable whole. That responsibility belongs to a learning unit. This section defines a unit's scope, its derived completion, and the boundaries of prerequisites between whole units; Section~@ref{sec:assessment} builds implicit mastery on top of it.

:::principle {title="Domain Unit Rather Than Calendar Bucket"}
A **learning unit** (German *Lerneinheit*, future technical name `LearningUnit`) binds an understandable learning promise to its own learning goals and, where appropriate, smaller learning units -- its *child units*. The structure is recursive: Mechanics may contain Kinematics and Dynamics, and Kinematics may in turn contain smaller units. School years, semesters, and study weeks are possible scheduling anchors rather than synonyms for a learning unit. Personalization Levels 1--4, QA maturity tiers, and the difficulty field `level` keep their existing meanings.
:::

:::principle {title="Purpose: A Secure Foundation Before Building On"}
A learning unit establishes solid, independent application of its promise before the planned course builds on it. Its assessments are designed to expose essential misconceptions: an exposed gap leads to focused further learning and a fresh, equivalent assessment, whereas a false completion would send learners onward on an unstable foundation. The ordinary grading contract applies unchanged -- there is no hidden pass rule and no second stored outcome; an isolated slip with sound reasoning is judged differently from a missing central understanding. This is a didactic requirement of the unit definition, not a technical access lock (Section~@ref{sec:unit-progression}).
:::

### Motivation and Distinct Domain Claims {#sec:unit-claims}

A learning unit answers first: *What will I be able to do afterwards, and why does it matter?* A motivational opening makes that promise tangible before individual tasks or goals are presented. That opening is a didactic role: when modeled as a genuine orientation goal, it follows the orientation completion contract (Section~@ref{sec:orientation}), whereas a synthetic heading never mints an extra learning goal. Derived unit completion never asserts that a motivational conversation actually took place.

A unit boundary follows a meaningful conceptual transition: which coherent understanding and application must be secure before something new depends on it? An existing assessment, a target quota, a tidy heading, or the density of prerequisite edges is at most an indicator, never the definition. Sparse, transitively minimal chains can form strong units, and shared elementary foundations do not force every later application into one giant unit. Edges are neither added nor removed to make a desired cut fit; a questionable edge is a separate subject-matter finding. A terminal or synthesis unit needs no later consumer to justify it. The [design criteria and worked examples](repo:docs/concept/skill-graph/learning-unit-design-and-examples.md) apply these criteria to two candidates.

Relative to its child units, a parent unit may make one of three distinct claims:

- **Summarize (aggregate).** The unit merely groups competencies already acquired in its children; in that case it needs no new assessment of its own.
- **Integrate (synthesis).** When the unit additionally promises independent integration across child competencies, its own synthesis assessment may test that integrative claim over competencies already acquired in child units, without inventing artificial new content goals. The role of a synthesis assessment is that extra integration proof rather than re-passing every child.
- **Own domain competencies.** A unit may also introduce genuine new domain competencies of its own, which require their own direct acquisition ownership and valid assessment coverage.

### Direct Acquisition, Child Units, and Total Scope {#sec:unit-own-children}

An authoritative, versioned unit $U$ is specified by three sets:

- $\Own(U)$ denotes the directly assigned atomic *acquisition targets* -- the unit's own goals. Genuine orientation, assessment, and memory goals may belong to $\Own(U)$; synthetic structure markers never do.
- $\Children(U)$ denotes the mandatory child units -- the *required children* -- after any authored choices have been resolved.
- $T(U)$ denotes the deduplicated recursive goal set -- the *total scope* -- given by:

:::equation {#eq:unit-targets}
T(U) = \Own(U) \cup \bigcup_{V \in \Children(U)} T(V).
:::

In Figure~@ref{fig:recursive-unit}, Kinematics owns $\{\nd{a}, \nd{b}, \nd{q_K}, \nd{k_K}\}$, Dynamics owns $\{\nd{d}, \nd{q_D}\}$, and Mechanics owns only the synthesis assessment $\{\nd{q_S}\}$; the total scope of Mechanics spans all seven goals.

Scope and ownership obey five rules:

- Resolved total scope is non-empty. An empty navigation marker is never a completed learning unit, whereas a pure aggregate may have empty $\Own(U)$ provided its required children carry a non-empty total scope.
- Every acquisition target has exactly one directly owning unit: the smallest domain-responsible authoritative unit (rule R4 in Section~@ref{sec:why-graph-not-enough}). An ancestor view may display the same stable goals without claiming them again in $\Own(U)$.
- Overlapping references unite as sets, minting neither duplicate goals nor double-counted progress points.
- Direct ownership of $\Own(U)$ together with the domain-reviewed meaning of the unit's own assessments forms the unit's *local contract* (Section~@ref{sec:assessment}); switching focus never alters that ownership or contract.
- Every ordinary content goal in $\Own(U)$ requires an own local assessment consumer -- an assessment owned by $U$ that requires it directly or transitively (R1) -- and at least one such assessment needs reviewed evidence that its tasks and normal grading rubric really test the goal (R2). Section~@ref{sec:why-graph-not-enough} lists all validity conditions R1--R5 and where each is enforced. Without them the local contract is invalid; an ad-hoc waiver mask never substitutes for it.

Embedding reuses the existing program and placement layers or reviewed composition views (Section~@ref{sec:context-model}). Following the Product Owner decision of 12 November 2026, a learning unit is a `programUnits` entry of kind `learningUnit` in its skill landscape: it owns atomic goals of the same landscape through `goalPlacements` of relation `own` and names the unit that requires it as a child through `parentUnitId` ([runtime schema](repo:docs/landscape-runtime.schema.json)); [curriculum-package contract 1.2](repo:contracts/curriculum-package/v1.2/README.md) carries these units. Expanding a UI cluster does not create a learning unit, nor does every `contains` cluster automatically become one; in particular, general cluster satisfaction from Section~@ref{sec:state} remains distinct from the explicitly authorized unit hierarchy defined here.

### Completion Without Stored Unit Mastery {#sec:unit-completion}

A learning unit is complete if and only if all of its own goals are effectively mastered and every required child unit is complete:

:::equation {#eq:unit-complete}
\Complete(U) \iff \bigl(\Own(U) \subseteq \Meff\bigr) \;\land\; \bigwedge_{V \in \Children(U)} \Complete(V).
:::

Completion is derived from atomic outcomes rather than persisted as a separate `UnitMastery` record that writes results back to children. Assessment and memory goals remain strictly explicit, so passing a parent assessment can replace neither an open child assessment nor missing verified card recall.

For the three unit forms from Section~@ref{sec:unit-claims}, this means the following. A pure aggregate may carry no assessment of its own, deriving completion from its required children and any other own obligations. A synthesis unit may carry an own synthesis assessment without new content goals; passing that synthesis assessment is then additionally required. A pure flashcard collection establishes no claim of independent domain application, and its explicit recall duties remain mandatory; recall obligations belonging to a child unit must never be hoisted to the parent merely to make the child appear complete.

::figure{id="fig:recursive-unit"}

### Recognition Before Full Unit Completion {#sec:unit-early-recognition}

Under the binding target concept -- which is **not yet implemented** on `main` -- passing an appropriate local assessment can recognize a unit's own content goals before an independent flashcard deck or sibling child unit is finished, provided that no other open own assessment or memory goal of the unit still requires them (Section~@ref{sec:transitive-demand}). That recognition is globally effective, and a still-open parent synthesis assessment does not withdraw it.

Recognition is therefore computed solely over each unit's *own* goals excluding assessment and memory goals. A parent unit never forms an enlarged recognition scope over all of its descendants; otherwise passing a parent assessment could bypass subordinate child assessments or card-recall duties. A parent assessment may attest additional integration without retroactively expanding what child contracts certify. Section~@ref{sec:assessment} states the exact formula and its task-authoring conditions.

### Prerequisites and the Limits of a Unit Sequence {#sec:unit-progression}

Two kinds of prerequisites must be kept distinct:

- An atomic `requires` edge targeting a competence requires that competence alone rather than completion of its entire owning unit.
- A *whole-unit prerequisite* is an explicitly authorized dependency between complete learning units: it requires *full completion* of the predecessor unit and belongs to the course composition contract outside the base relations $C$ and $R$.

Neither the compiler nor the coach may conflate those two statements.

The unit hierarchy itself must be acyclic. Anyone who further claims an indivisible whole-unit sequence -- in which each unit is completed in full before the next begins -- must also validate the projected unit-dependency graph. Atomic acyclicity alone does not suffice: for $a \to b \to c$ with $\Own(U) = \{a, c\}$ and $\Own(V) = \{b\}$, unit $U$ depends on $V$ via $a \to b$ while $V$ depends on $U$ via $b \to c$. Grouping produces a mutual block cycle, so $U$ and $V$ admit no indivisible whole-unit order; resolving that finding requires re-scoping the unit boundary or explicitly permitting interleaved acquisition rather than inferring silent unit locks from atomic edges.

Atomic normal form $R \subseteq A \times A$ and its complete transitive minimality from Section~@ref{sec:validity} remain in force. The current inventory must pass complete deterministic target-state validation before any milestone pass. That rule implies no automatic minimality rule for a separate whole-unit prerequisite relation yet to be specified.

:::principle {title="Access Profile Still Undecided"}
A domain acquisition order is not yet a technical access gate. Whether and when a whole-unit prerequisite enforces a hard technical entry lock -- a *unit lock* -- and how deliberate direct assessment attempts behave under it remains **undecided**. Any such profile requires a separate product decision and host verification; the learning-unit definition itself introduces none.
:::

Only *if* an explicit gated access profile is later chosen could authorized predecessor units $\operatorname{Pred}(U)$ define:

$$
\operatorname{Open}(U) = \bigwedge_{V \in \operatorname{Pred}(U)} \operatorname{Cleared}(V), \qquad \operatorname{Cleared}(U) = \operatorname{Open}(U) \land \Complete(U).
$$

Here $\Complete$ records established evidence whereas $\operatorname{Cleared}$ expresses conditional course policy; neither opening a unit nor computing clearance writes mastery, and this conditional illustration does not settle whether direct assessment attempts remain open inside a locked unit.

:::sources
[Learning Units](repo:docs/concept/skill-graph/learning-units.md); [Learning-Unit Progression and Access Policy](repo:docs/concept/skill-graph/learning-unit-progression.md); [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md); [Assessment-Gated Completion and Implicit Mastery](repo:docs/concept/skill-graph/assessment-gated-completion.md).
:::
