:::titlebox {title="Scope and Status of This Edition"}
Edition of **17 November 2026**. This definition follows a learner's question from the shared goal catalog to the next learning decision: *Where do I start, and how can I tell what I can do?* Goals and their prerequisites determine the available paths. In the target model a unit with its own assessments gives a path a beginning and an end. Its orientation goal introduces what the learning is for, and its assessments demonstrate independent application.

Section~@ref{sec:learning-units} describes this extension and identifies the open design choices. Appendix~@ref{sec:implementation} records what has been implemented. Appendix~@ref{sec:rule-milestones} identifies the rules enforced by quality checks.
:::

## Reader's Guide and Scope {#sec:readers-guide unnumbered=true}

The first chapters introduce the graph and show how to read it for an individual learner. Learning units, scheduling and assessment-based recognition build on that foundation. The examples illustrate the model. Each curriculum defines the content of its subject.

### The Model in Seven Steps {#sec:seven-steps unnumbered=true}

These seven steps preview the reasoning of the document. Concrete English goal names come from the Mechanics example in the original illustrations, starting in Figure~@ref{fig:overview}.

1. **Goals and two relation kinds.** Every learning goal carries a stable identity. `contains` groups goals: *Kinematics* contains *Velocity*. `requires` states the preparation a goal needs: *Velocity* requires *Vectors*. Grouping alone never establishes a prerequisite (Sections~@ref{sec:core} and~@ref{sec:relations}).
2. **Atoms and clusters.** Goals without children are atomic; learner outcomes are stored only on them. Clusters group goals. In the canonical target state, every authored requirement connects an atom to an atom, and none is redundant. Legacy requirements on or toward clusters remain readable as transition data (Sections~@ref{sec:relations} and~@ref{sec:validity}).
3. **Learner state and frontier.** An explicit result belongs to an atomic goal. The *frontier* contains the open goals whose prerequisites are satisfied in the scope being considered (Section~@ref{sec:state}).
4. **Scoped views.** The Personal Curriculum fixes a learner's longer-term scope, while focus selects a temporary working subset. Derivations always run on the full graph first and restrict afterwards. Normal (*optimistic*) mode checks prerequisites inside the scope; strict mode checks all prerequisites globally (Sections~@ref{sec:filters} to~@ref{sec:personal-scope}).
5. **Goal types.** A goal's pedagogical type defines what counts as achieving it: verified understanding for a content goal, completed motivational entry for an orientation goal, verified recall for a memory goal, and a passed exam for an assessment goal (Section~@ref{sec:goal-types}).
6. **Learning units.** A unit brings related goals together. In a unit with assessments, the recommended path goes from orientation through content to independent application. Full completion includes the goals of its child units (Section~@ref{sec:learning-units}).
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

For curriculum authors the main concerns are graph validity, goal types and content provenance. Developers of the learning workflow will find the selection rules in Sections~@ref{sec:state} and~@ref{sec:filters} and the meaning of outcomes in Sections~@ref{sec:goal-types} and~@ref{sec:assessment}. Appendix~@ref{sec:rule-milestones} identifies the available checks for each rule.

### Reading Conventions {#sec:conventions unnumbered=true}

**Normative force.** “Must”, “must not”, and “binding” denote normative model rules. “Not yet implemented” means bindingly specified, but not yet realized in the runtime. “Optional” marks an additional profile. “Not yet decided” marks an unresolved question; the OPEN traffic light instead denotes a binding obligation without an evidenced hard gate.

**Notation.** Italic uppercase letters denote sets and relations ($G$, $A$, $R$, $M$); italic lowercase letters denote arbitrary goals ($g$, $p$, $a$). Concrete example nodes from a figure are set upright in sans-serif to match the figure labels: in the chain $\nd{Q}\to\nd{B}\to\nd{A}$, $\nd{A}$ is one individual goal rather than the set $A$ of atomic goals. Spelled-out example names such as *Velocity* appear in italics. In a graph, a `contains` arrow points from cluster to child and a `requires` arrow from goal to prerequisite. To read a prerequisite path in learning order, start at the other end. Monospace denotes field and identifier names such as `requires`. Figures~@ref{fig:overview} to~@ref{fig:filters} preserve the original English-labelled illustrations of the core specification; their captions explain every label.

**Terminology.** The distinctions below are easily conflated and are therefore used throughout this document with these exact meanings. Appendix~@ref{sec:glossary} provides the complete glossary and symbol index.

::include{block="frontmatter-distinctions"}

### Sources and Limits of Claims {#sec:frontmatter-sources unnumbered=true}

The domain contracts in the repository remain the authoritative primary sources. Appendix~@ref{sec:sources} maps every chapter to those sources. Appendix~@ref{sec:implementation} compiles the dated Product Owner decisions cited in the text and documents the implementation divergences audited when preparing this edition. Mathematical examples, figure captions, and plausibility checks replace neither subject-matter task reviews nor empirical studies with learners.
