:::titlebox {title="Scope of this edition"}
**As of 24 November 2026.** The recognition rule confirmed on 4 and 11 November remains in force. It determines how learner outcomes and validly recognized skills affect the next learning goals and completion. Sections~@ref{sec:state}, @ref{sec:unit-completion} and~@ref{sec:assessment} give the formulas. Appendix~@ref{sec:implementation} reports implementation status.

**Proposal for expert review, 19 November.** A passed unit could support an overall judgement at the stated level. The unit could release its own content goals for subsequent planning when supported by reviewed evidence. The separately marked Sections~@ref{sec:proposal-unit-completion} and~@ref{sec:proposal-unit-assessment} present this proposal for discussion.
:::

## Reader's Guide and Scope {#sec:readers-guide unnumbered=true}

The first chapters introduce the graph and show how to read it for an individual learner. Learning units, scheduling and assessment-based recognition build on that foundation. The examples illustrate the model. Each curriculum defines the content of its subject.

### The Model in Seven Steps {#sec:seven-steps unnumbered=true}

These seven steps preview the reasoning of the document. Concrete English goal names come from the Mechanics example in the original illustrations, starting in Figure~@ref{fig:overview}.

1. **Goals and two relation kinds.** Every learning goal carries a stable identity. `contains` groups goals: *Kinematics* contains *Velocity*. `requires` states the preparation a goal needs: *Velocity* requires *Vectors*. Grouping alone never establishes a prerequisite (Sections~@ref{sec:core} and~@ref{sec:relations}).
2. **Atoms and clusters.** Goals without children are atomic; learner outcomes are stored only on them. Clusters group goals. In the canonical target state, every authored requirement connects an atom to an atom, and none is redundant. Legacy requirements on or toward clusters remain readable as transition data (Sections~@ref{sec:relations} and~@ref{sec:validity}).
3. **Learner state and frontier.** An explicit result belongs to an atomic goal. The *frontier* contains the open goals whose prerequisites are satisfied in the scope being considered (Section~@ref{sec:state}).
4. **Scoped views.** The Personal Curriculum fixes a learner's longer-term scope, while focus selects a temporary working subset. Derivations always run on the full graph first and restrict afterwards. Normal (*optimistic*) mode checks prerequisites inside the scope; strict mode checks all prerequisites globally (Sections~@ref{sec:filters} to~@ref{sec:personal-scope}).
5. **Goal types.** A subject goal may call for understanding, application or independent performance. Individual evidence must meet that claim. Orientation, recall and assessment each have their own outcome contract (Section~@ref{sec:goal-types}).
6. **Learning units.** Under the contract in force, completion requires mastery or recognition of the unit’s own goals and completion of its children (Section~@ref{sec:unit-completion}). Section~@ref{sec:proposal-unit-completion} proposes representative qualification through declared required performances.
7. **Assessment-based recognition.** Under R1–R5, an ordinary goal owned by a unit can gain recognition before the entire unit is complete. This recognition applies across subjects (Section~@ref{sec:assessment}). Section~@ref{sec:proposal-planning-release} describes the later planning release under discussion.

### Structure, Status, and Rule Identifiers {#sec:structure-and-status unnumbered=true}

Appendix~@ref{sec:rule-milestones} records the validation obligations in force. The proposals in Sections~@ref{sec:proposal-unit-completion} and~@ref{sec:proposal-unit-assessment} would change those obligations only after an explicit decision.

:::table {cols="33mm,X,35mm,12mm"}
| Sections | Guiding question | Status | Rules |
| --- | --- | --- | --- |
| @ref{sec:core}--@ref{sec:filters}: Formal Core | What can be learned, what does it require, and what is available next -- across the full graph and inside a scoped view? | Normative core | `GD-C` |
| @ref{sec:context-model}--@ref{sec:evidence-context}: Context, Views, Goal Types, Quality | Where does a goal sit in an educational program, what belongs to personal scope, when does a goal count as achieved, and what is its provenance? | Adjacent contract | `GD-X` |
| @ref{sec:learning-units}: Learning Units | Which goals form a coherent subject-matter whole, and when is it complete? | Domain structure | `GD-U` |
| @ref{sec:levels}: Acquisition and Time Planning | Can acquisition be arranged into a valid order and calendar budget? | Optional profile | `GD-P` |
| @ref{sec:assessment} Recognition | When does a competence qualify for recognition under R1–R5? | Contract in force | `GD-A` |
| Appendices~@ref{sec:rule-milestones}--@ref{sec:build} | How is each rule checked, where does the implementation diverge, and what do terms and symbols mean? | Reference | `GD-D` |
:::

For curriculum authors the main concerns are graph validity, goal types and content provenance. Developers of the learning workflow will find the selection rules in Sections~@ref{sec:state} and~@ref{sec:filters} and the meaning of outcomes in Sections~@ref{sec:goal-types} and~@ref{sec:assessment}. Appendix~@ref{sec:rule-milestones} identifies the available checks for each rule.

### Reading Conventions {#sec:conventions unnumbered=true}

**Normative force.** “Must”, “must not”, and “binding” denote normative model rules. “Not yet implemented” means bindingly specified, but not yet realized in the runtime. “Optional” marks an additional profile. “Not yet decided” marks an unresolved question; the OPEN traffic light instead denotes a binding obligation without an evidenced hard gate.

**Notation.** Italic uppercase letters denote sets and relations ($G$, $A$, $R$, $M$); italic lowercase letters denote arbitrary goals ($g$, $p$, $a$). Concrete example nodes from a figure are set upright in sans-serif to match the figure labels: in the chain $\nd{Q}\to\nd{B}\to\nd{A}$, $\nd{A}$ is one individual goal rather than the set $A$ of atomic goals. Spelled-out example names such as *Velocity* appear in italics. In a graph, a `contains` arrow points from cluster to child and a `requires` arrow from goal to prerequisite. To read a prerequisite path in learning order, start at the other end. Monospace denotes field and identifier names such as `requires`. Figures~@ref{fig:overview} to~@ref{fig:filters} preserve the original English-labelled illustrations of the core specification; their captions explain every label.

**Terminology.** The distinctions below are easily conflated and are therefore used throughout this document with these exact meanings. Appendix~@ref{sec:glossary} provides the complete glossary and symbol index.

::include{block="frontmatter-distinctions"}

### Sources and Limits of Claims {#sec:frontmatter-sources unnumbered=true}

The domain contracts in the repository remain the authoritative primary sources. Appendix~@ref{sec:sources} maps every chapter to those sources. Appendix~@ref{sec:implementation} compiles the dated Product Owner decisions cited in the text and documents the implementation divergences audited when preparing this edition. Mathematical examples, figure captions, and plausibility checks replace neither subject-matter task reviews nor empirical studies with learners.
