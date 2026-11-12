:::titlebox {title="Scope and Status of This Edition"}
Complete English reference, as of **11 November 2026**. SkillPilot models learning goals and their relationships: `contains` groups goals into a hierarchy, while `requires` identifies subject-matter prerequisites. Canonical goal identities are preserved across the canonical inventory, the Personal Curriculum, the active focus, and stored learner outcomes. **Learning units** (*Lerneinheiten*) bind a learning promise to directly owned goals and child units; optional schedules allocate their acquisition to available calendar periods and workload budgets. Explicitly verified understanding and independent application demonstrated through valid local assessments both count toward the effective mastered set.

**Normative force and implementation.** Atomic normal form $R\subseteq A\times A$ and its complete deterministic validation on the current inventory before any milestone pass are binding. The Product Owner decision of 12 November 2026 replaces the earlier migration-order and preservation obligations with this target-state check. Appendix~@ref{sec:rule-milestones} maps every rule to its validation area, makes actual hard enforcement visible via traffic-light (*Ampel*) status, and delineates existing CI gates. Global application recognition is **not yet implemented** on audited `main`; Appendix~@ref{sec:implementation} documents how current runtime behavior differs. Completion of a learning unit is derived from its own obligations and required child units without persisting an additional mastery tier.
:::

## Reader's Guide and Scope {#sec:readers-guide unnumbered=true}

A SkillPilot skill graph describes *what* can be learned and which prerequisites govern it. Four further claims build on that foundation while remaining deliberately separate in the model:

- **Curricular views** determine which of these stable goals apply to a learner and where they sit within an educational program.
- **Learner state** records for each atomic goal whether it has been achieved.
- **Learning units** explain subject-matter coherence from a manageable topic up to a broader domain. Their completion is derived recursively from child units and directly owned obligations rather than persisted as a flat flag.
- **Planning** distributes acquisition and practice across available time.

Deriving implicit mastery connects explicit outcomes, transitive prerequisites, and subject-reviewed local contracts of learning units. All of these claims may reference one another, but none may silently substitute for another.

This reference is intended for joint review and further development of the model. It covers the graph definition in the broad sense: identity, edges, inheritance, validity, availability, projection, goal types, progress, scheduling, completion, provenance, and quality assurance. Complete syllabus texts and concrete task banks are not reproduced here. Worked examples serve as illustrations rather than approved curriculum subgraphs.

### The Model in Seven Steps {#sec:seven-steps unnumbered=true}

These seven steps preview the reasoning of the document. Concrete English goal names come from the Mechanics example in the original illustrations, starting in Figure~@ref{fig:overview}.

1. **Goals and two relation kinds.** Every learning goal carries a stable identity. `contains` groups goals: *Kinematics* contains *Velocity*. `requires` states subject prerequisites: *Velocity* requires *Vectors*. Grouping alone never establishes a prerequisite (Sections~@ref{sec:core} and~@ref{sec:relations}).
2. **Atoms and clusters.** Goals without children are atomic; learner outcomes are stored only on them. Clusters group goals. In the canonical target state, every authored requirement connects an atom to an atom, and none is redundant. Legacy requirements on or toward clusters remain readable as transition data (Sections~@ref{sec:relations} and~@ref{sec:validity}).
3. **Learner state and frontier.** Each atomic goal has exactly one stored binary result. An open atom becomes available next -- in the *frontier* -- only once all atoms it requires directly or across prerequisite chains are mastered (Section~@ref{sec:state}).
4. **Scoped views.** The Personal Curriculum fixes a learner's longer-term scope, while focus selects a temporary working subset. Derivations always run on the full graph first and restrict afterwards. Normal (*optimistic*) mode checks prerequisites inside the scope; strict mode checks all prerequisites globally (Sections~@ref{sec:filters} to~@ref{sec:personal-scope}).
5. **Goal types.** A goal's pedagogical type defines what counts as achieving it: verified understanding for a content goal, completed motivational entry for an orientation goal, verified recall for a memory goal, and a passed exam for an assessment goal (Section~@ref{sec:goal-types}).
6. **Learning units.** A learning unit binds a coherent learning promise to its own goals and required child units. Its completion is derived from those obligations rather than stored separately (Section~@ref{sec:learning-units}).
7. **Implicit mastery.** Once no open assessment and no open memory goal of a learning unit still depends on one of its own content goals, that content goal counts as independently applied -- provided the unit's local contract has passed subject review and is valid. Explicitly verified understanding and application demonstrated in this way together form the effective mastered set; both satisfy later prerequisites and count toward progress (Section~@ref{sec:assessment}).

### Structure, Status, and Rule Identifiers {#sec:structure-and-status unnumbered=true}

Each part answers a guiding question and carries its own status. The final column lists the prefix under which Appendix~@ref{sec:rule-milestones} tracks that part's rules, such as [GD-C07](@rule{GD-C07}) for a formal-core rule.

:::table {cols="33mm,X,35mm,12mm"}
| Sections | Guiding question | Status | Rules |
| --- | --- | --- | --- |
| @ref{sec:core}--@ref{sec:filters}: Formal Core | What can be learned, what does it require, and what is available next -- across the full graph and inside a scoped view? | Normative core | `GD-C` |
| @ref{sec:context-model}--@ref{sec:evidence-context}: Context, Views, Goal Types, Quality | Where does a goal sit in an educational program, what belongs to personal scope, when does a goal count as achieved, and what is its provenance? | Adjacent contract | `GD-X` |
| @ref{sec:learning-units}: Learning Units | Which goals form a coherent subject-matter whole, and when is it complete? | Domain structure | `GD-U` |
| @ref{sec:levels}: Acquisition and Time Planning | Can acquisition be arranged into a valid order and calendar budget? | Optional profile | `GD-P` |
| @ref{sec:assessment}: Implicit Mastery | When does a passed assessment also substantiate the goals it builds upon? | Binding concept, not yet implemented | `GD-A` |
| Appendices~@ref{sec:rule-milestones}--@ref{sec:build} | How is each rule checked, where does the implementation diverge, and what do terms and symbols mean? | Reference | `GD-D` |
:::

:::table {cols="35mm,X"}
| Status | Meaning in this reference |
| --- | --- |
| Normative core | Binding mathematical graph semantics from `graph-definition.md`; additional validator profiles may impose stricter constraints. |
| Adjacent contract | Semantics of projection, goal types, provenance, or learning workflows; actual implementation coverage must be verified per rule. |
| Domain structure | Recursive learning units with a learning promise, directly owned goals, and derived completion; not a claimed runtime feature today. |
| Optional profile | Calendar and workload budgeting plus conditional entry to learning units; hard technical locks and direct assessment entry remain undecided there. |
| Not yet implemented | The new implicit-mastery recognition contract is bindingly specified, but not yet deployed; current runtime code follows an earlier demand model (Appendix~@ref{sec:implementation}). |
:::

Curriculum authors primarily need Sections~@ref{sec:core} to~@ref{sec:validity}, @ref{sec:goal-types}, and~@ref{sec:evidence-context}. Runtime logic primarily rests on Sections~@ref{sec:state}, @ref{sec:filters}, @ref{sec:personal-scope}, and~@ref{sec:assessment}; quality assurance and review additionally rely on Appendices~@ref{sec:rule-milestones} to~@ref{sec:test-strategy}. Sections~@ref{sec:learning-units} and~@ref{sec:levels} address everyone who structures and schedules courses.

### Reading Conventions {#sec:conventions unnumbered=true}

**Normative force.** “Must”, “must not”, and “binding” denote normative model rules. “Not yet implemented” means bindingly specified, but not yet realized in the runtime. “Optional” marks an additional profile; “open” or “not yet decided” marks a deliberately unresolved question.

**Notation.** Italic uppercase letters denote sets and relations ($G$, $A$, $R$, $M$); italic lowercase letters denote arbitrary goals ($g$, $p$, $a$). Concrete example nodes from a figure are set upright in sans-serif to match the figure labels: in the chain $\nd{Q}\to\nd{B}\to\nd{A}$, $\nd{A}$ is one individual goal rather than the set $A$ of atomic goals. Spelled-out example names such as *Velocity* appear in italics. Arrows always point in the direction of the relation, from cluster to child and from goal to prerequisite. Monospace denotes field and identifier names such as `requires`. Figures~@ref{fig:overview} to~@ref{fig:filters} preserve the original English-labelled illustrations of the core specification; their captions explain every label.

**Terminology.** The distinctions below are easily conflated and are therefore used throughout this document with these exact meanings. Appendix~@ref{sec:glossary} provides the complete glossary and symbol index.

::include{block="frontmatter-distinctions"}

### Sources and Limits of Claims {#sec:frontmatter-sources unnumbered=true}

The domain contracts in the repository remain the authoritative primary sources. Appendix~@ref{sec:sources} maps every chapter to those sources. Appendix~@ref{sec:implementation} compiles the dated Product Owner decisions cited in the text and documents the implementation divergences audited when preparing this edition. Mathematical examples, figure captions, and plausibility checks replace neither subject-matter task reviews nor empirical studies with learners.
