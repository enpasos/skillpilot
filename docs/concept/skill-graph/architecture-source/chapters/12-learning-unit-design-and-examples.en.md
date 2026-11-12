## Learning-Unit Design Criteria and Examples {#sec:sga-unit-design}

This chapter makes the didactic purpose of [learning units](repo:docs/concept/skill-graph/learning-units.md) concrete. It explains how to draw and test a unit boundary and applies these criteria to two worked candidates: motion with constant acceleration in upper-secondary physics and number sense in grade 5 mathematics.

**Status, 11 November 2026.** The examples are **concept candidates**, not reviewed assessment contracts and not an approved partition of any official curriculum. This page changes no learning goals, graph edges, assessments, or access rules. The binding contracts are [Learning Units](repo:docs/concept/skill-graph/learning-units.md) (Graph Definition §11), [Implicit Mastery](repo:docs/concept/skill-graph/assessment-gated-completion.md) (§13), and the separate [progression and access decision](repo:docs/concept/skill-graph/learning-unit-progression.md). Where this chapter and those contracts differ, the contracts win.

### Establish a Secure Foundation {#sec:sga-ud-foundation anchors="1-establish-a-secure-foundation"}

A learning unit bundles one coherent conceptual step: learners understand a model or a subject-matter relationship and can act independently with it. The motivation explains which question becomes answerable and why the effort pays off. A unit may correspond to a familiar topic; it may equally open up a new way of thinking that connects several topics. Its scope follows this learning promise. A final application or synthesis can also form a unit; it does not need a later unit to justify its existence.

The unit's assessment, or its set of assessments, shows whether this foundation actually holds. In the regular course, material that builds on it is developed only after the required foundation has been demonstrated. Otherwise a gap is made visible, worked on in a focused way, and assessed again. An honestly identified deficit is more helpful than a pass whose apparent security later lets the learning path fail.

This does not demand flawless performance. An isolated arithmetic slip is judged differently from a missing central understanding. Ordinary grading must reliably reflect this difference: a competence that is promised but fundamentally missing must not be compensated by incidental points elsewhere. This creates no second pass verdict and no second stored outcome; the ordinary grading contract of the assessment applies unchanged.

### Recognising a Meaningful Boundary {#sec:sga-ud-boundary anchors="2-recognising-a-meaningful-boundary"}

A boundary is supported by an understandable shared learning promise and by an independent application that can test the whole claimed conceptual step. A recognisable transition to later demands is another important reason; a final unit needs no successor. Subject proximity and dense prerequisite connections are indications, not an automatic cut. A sparse, transitively minimal chain can also be closely connected. Shared foundations such as equations or number sense connect many topics without turning them into one giant unit.

The following justifications are unsuitable:

- "There already is an assessment": the assessment must arise from the learning promise; its existing scope does not determine the unit.
- "The group needs at least a few goals": there is no minimum number. A single goal can be comprehensive enough; many goals can be only loosely connected.
- "The heading looks tidy": an additional parent heading creates neither coherence nor a new learning outcome.
- "Then all edges fit": prerequisites are neither invented nor removed to make a desired partition fit afterwards.

A subject-matter questionable edge is a finding of its own. Its review must not be replaced by silently narrowing the meaning of the goals involved. Even an atomically acyclic sequence can, through poor grouping, produce a contradiction between whole blocks; boundary or nesting must then be reconsidered.

### Learn, Demonstrate, and Continue Learning {#sec:sga-ud-loop anchors="3-learn-demonstrate-and-continue-learning"}

The course starts with a meaningful question and a clear outlook: what can I do afterwards, and what do I need it for? Required prior knowledge is named concretely. Development and practice with feedback follow. The coach may explain, structure, and support when difficulties arise.

The subsequent assessment demands the claimed independent application. Step-by-step help that supplies exactly the decisive choice of model or reasoning can be practice, but it does not demonstrate this independence. Task variants must carry the same learning promise and must not merely repeat the practised surface.

When the evidence is missing, the concrete gap is explained, for example the confusion of two quantities. Suitable further development and practice follow, then a fresh assessment variant with equivalent content. A retry must not sidestep the problem through memorising an identical task. Valid competence evidence obtained elsewhere is not deleted by this.

The didactic principle is thereby fixed. Whether technical start locks follow from it, and how deliberate direct assessment attempts behave under such a lock, remains a separate, undecided policy; see [progression and access](repo:docs/concept/skill-graph/learning-unit-progression.md). Direct assessment access remains the current baseline, and an attempt that is not passed records no learner result.

### Main Example: Motion with Constant Acceleration (Upper-Secondary Physics) {#sec:sga-ud-physics anchors="4-main-example-motion-with-constant-acceleration-upper-secondary-physics"}

#### Learning Promise and Coherence {#sec:sga-ud-phys-promise anchors="learning-promise-and-coherence"}

**Candidate:** "I can independently model, calculate, and explain a one-dimensional motion with constant acceleration." Learners choose an axis and signs, take initial position and initial velocity into account, and connect position, velocity, and acceleration in formulas and graphs.

The guiding question can be: "How do I describe a thrown ball from release to impact with a single model?" Free fall from rest and vertical throws are cases of the same model here. They are not split into two single-goal units merely because they carry different names. Different initial conditions make the common relationship visible.

For the time from the chosen start onwards, constant acceleration gives:

$$
x(t)=x_0+v_0t+\tfrac12at^2,\qquad v(t)=v_0+at,\qquad a(t)=a.
$$

In a course where derivatives are already available, learners can use them to check and physically interpret the relationships from $x$ to $v$ and from $v$ to $a$. This is not a blanket assumption about every entry course. The quadratic equation of motion can be developed without integral calculus or provided as a model equation; the entry described here requires no formal integral calculus.

The following simplified values illustrate the relationship for a vertical throw from release height ($x_0=0$, $v_0=+20\,\mathrm{m/s}$, $a=-10\,\mathrm{m/s^2}$, no air resistance, up to the return to release height):

| $t$ in $\mathrm{s}$ | $x$ in $\mathrm{m}$ | $v$ in $\mathrm{m/s}$ | $a$ in $\mathrm{m/s^2}$ |
| --- | --- | --- | --- |
| $0$ | $0$ | $+20$ | $-10$ |
| $1$ | $15$ | $+10$ | $-10$ |
| $2$ | $20$ | $0$ | $-10$ |
| $3$ | $15$ | $-10$ | $-10$ |
| $4$ | $0$ | $-20$ | $-10$ |
{cols="25%,25%,25%,25%"}

At $t=2\,\mathrm{s}$ the position reaches its maximum and the velocity is zero, while the acceleration remains $-10\,\mathrm{m/s^2}$. The table serves the concept review only; it is not an approved assessment task.

#### Entry and Continuation {#sec:sga-ud-phys-entry anchors="entry-and-continuation"}

What is needed are the mathematical skills these tasks actually require: using terms and units and solving equations, including the quadratic equations that occur. If the chosen task demands derivatives, those must be available beforehand as well. An application visible in the physics task does not prove the complete corresponding mathematics goals across the board; their own meaning and valid evidence count for that.

Uniform motion can form a sensible subject-matter entry, for example to distinguish velocity from acceleration. This creates no obligation to complete every physics unit that comes earlier in the calendar first.

Force-and-motion tasks that actually build on this, or later applications with energy and motion curves, can follow. Forces and energy are new concepts there and are not already mastered through this kinematics evidence. The candidate claims neither an official order that is binding everywhere nor a lock on all other physics topics.

#### What an Independent Assessment Must Reveal {#sec:sga-ud-phys-assessment anchors="what-an-independent-assessment-must-reveal"}

A possible task describes a ball thrown vertically upwards from a raised platform. Without a given solution path, learners set up the model, determine the highest point and a later impact, and explain suitable position, velocity, and acceleration graphs. Air resistance is explicitly neglected; the time interval considered ends at the first impact.

A complementary variant changes the release height or prescribes the positive axis pointing downwards. The point is whether initial conditions and signs are derived from the situation instead of being copied from a familiar sequence of numbers. Not every single task must repeat every aspect; the relevant task set must cover the complete claimed learning promise.

| Observation | Meaning for the Claimed Evidence |
| --- | --- |
| "At the highest point $v=0$, so $a=0$ as well." | The central distinction is missing; the complete motion model is not yet demonstrated. |
| A correctly set-up model contains a single calculation error with consistent follow-up working. | Not automatically counter-evidence against understanding the model; judge it by the applicable ordinary grading rule. |
| After an axis change the signs change, but the predicted impact stays physically consistent. | Indication of transferable understanding rather than mere formula use. |
{cols="42%,58%"}

An ordinary pass rule under which the first misconception could be fully compensated by other points does not fit the claimed evidence. Conversely, this requirement implies no duty of flawlessness. It must be implemented in the ordinary task and rubric, without a hidden additional pass condition. If the existing total-score grading cannot carry the claim, the assessment or the claimed coverage must be revised before release. The task sketches and counterexamples do not yet replace a worked-out, independently reviewed production rubric.

For the misconception at the highest point, learning continues exactly there: for instance by comparing the velocity immediately before and after, with suitable graphs and the distinction between an instantaneous value and a rate of change. A fresh situation then tests the same distinction independently.

#### A Larger Candidate: Kinematics Including Superposition {#sec:sga-ud-phys-larger anchors="a-larger-candidate-kinematics-including-superposition"}

One-dimensional motion is not yet fixed as the final unit boundary. A larger unit could carry the promise: **"I can describe the motions of this entry course, choose suitable motion models, and compose motions from components."** The step from one to two dimensions would then be an inner conceptual step up to a common thematic conclusion.

A possible course leads from representations of position, velocity, and acceleration through uniform and uniformly accelerated motion to independent components and their composition. For an idealised projectile without air resistance, horizontal and vertical motion are described separately in a fixed frame of reference and recombined at the **same time**. Independence follows from this model; it does not hold for arbitrary superposed motions.

An assessment sketch of its own could present a trajectory and two contradictory explanations of its components. Learners evaluate them, justify the time assignment, and set up their own consistent description. For an oblique throw with non-vanishing horizontal velocity, only the vertical velocity component is zero at the highest point. Whoever transfers the statement from the vertical throw to the whole velocity vector without checking has not yet demonstrated the extended relationship. The mathematical entry competencies for components, vectors, and, where needed, trigonometric decomposition must be added accordingly.

**A larger unit does not move all feedback to the end.** Before the course builds on the one-dimensional model, its decisive understanding must have been assessed. The larger unit can contain a required intermediate assessment for this purpose. That assessment remains an ordinary assessment goal with a binary result; it does not automatically require a child unit or an additional stored status. A conversation with decisive solution hints does not provide the independent evidence.

Three cuts therefore need to be compared:

| Candidate | Justification and Test Point |
| --- | --- |
| Separate unit on one-dimensional motion | Does the first new model already carry a usable conclusion of its own? |
| Larger kinematics unit with learning sections and several assessments | Does only the transfer to components yield the intended overall understanding, without hiding early gaps? |
| Kinematics with genuine child units and its own synthesis | Do the child units each have their own learning promise and conclusion that justify this additional hierarchy? |
{cols="38%,62%"}

The learning sections of the second variant are not yet child units. In the third variant the existing child obligations continue to apply; a synthesis does not replace their assessments. "All of kinematics" also needs a definite scope: whether circular motion, relative motion, or variable acceleration belong to it must be decided for the concrete course and its learning goals. The two dimensions alone do not prove completeness of the kinematics topic.

#### Recognition Inside a Larger Unit {#sec:sga-ud-phys-recognition anchors="recognition-inside-a-larger-unit"}

Under the recognition rule confirmed on 11 November 2026, an own ordinary goal of a unit is recognized only once no open own assessment or memory goal of that unit still requires it, directly or transitively. In the larger kinematics candidate, the intermediate assessment on one-dimensional motion and the final assessment on composed motion both require the one-dimensional modelling goals. Passing the intermediate assessment is an ordinary binary pass with its full feedback value. It does not yet recognize those goals implicitly while the final assessment is open; they stay open unless they have been mastered explicitly. Once the final assessment is passed as well, they are recognized.

This is a consequence, not a design target. The boundary follows the conceptual transition (Section 12.2), not a desired recognition timing; splitting or rearranging assessments or units merely to obtain earlier recognition is not permitted. If one-dimensional motion is a self-contained conceptual step with a learning promise of its own, that is a didactic argument for a child unit with its own assessment. The child's valid contract then recognizes the child's own goals independently of further assessments of the parent. The larger unit is complete only after all its own assessments, required cards, and required child units. No new assessment type arises; acquisition ownership, evidence, and unit completion remain distinguishable, and tasks and ordinary grading must genuinely carry the claimed application. This describes the target contract, not the implemented runtime or the quality of current assessments.

#### What Textbook Structures Show {#sec:sga-ud-phys-textbooks anchors="what-textbook-structures-show"}

Textbooks are examined for how they justify coherence, prior knowledge, inner order, and conclusions. Our own drafts arise from this; tasks, texts, or chapter structures are not adopted as templates. The following first observations were recorded on 6 November 2026 and have not been re-checked for this page:

- The published assignment of **Impulse Physik Oberstufe** to Hessen (Klett, 2022, PDF pages 2--3) leads, within the first book chapter, from linear motion through free fall and two-dimensional motion to projectiles and circular motion. Forces follow in the second chapter. This shows a larger thematic bracket with inner learning steps. [Publisher document](https://asset.klett.de/assets/1fe831bc/Stoffverteilungsplan_Impulse_Physik_Oberstufe_HE.pdf)
- **OpenStax Physics**, chapter 5, explains its order explicitly: vector operations prepare several two-dimensional applications. The coherence is therefore a shared method. The chapter also includes other applications; its boundary is not simply our proposed kinematics boundary. [Chapter introduction](https://openstax.org/books/physics/pages/5-introduction)
- In the section on projectile motion, component decomposition and the shared time are central. Teaching notes combine comprehension questions with a targeted return to difficulties. This is a pointer towards inner comprehension checks. [Section 5.3](https://openstax.org/books/physics/pages/5-3-projectile-motion)

**Our conclusion:** a topic can form a larger unit and at the same time need important inner checkpoints. A book chapter provides a justifiable candidate, but not yet evidence of a complete SkillPilot application assessment. A textbook's linear reading order is not a prerequisite graph, and neither a chapter number nor a large end-of-chapter test fixes the only sensible boundary of our units and intermediate assessments. The sources cited prove neither the effectiveness of our cut nor a currently binding curriculum.

#### Mathematical Methods Must Be Available in Time {#sec:sga-ud-phys-math anchors="mathematical-methods-must-be-available-in-time"}

Tangents, derivatives, or area methods may be used only if the skills they need were acquired beforehand or are explicitly developed in the unit. "Planned for the same school year" is not sufficient. For every dependent activity it must be clarified whether the method is actually available at that point. Possible solutions are timely joint subject planning, explicit development of the missing method, or a suitable different approach with an unchanged competence claim.

For the entry described here, a subject-correct route without formal integration suffices: for a linear velocity, rectangles and triangles yield the signed change of position. Areas below the time axis count negatively; at a sign change the area is split. The distance travelled must be distinguished from this. This approach claims no corresponding complete method for arbitrary velocity curves. None of this silently credits mathematics mastery or changes existing prerequisites or goal scopes.

### Preliminary Comparison: Number Sense in Grade 5 Mathematics {#sec:sga-ud-math5 anchors="5-preliminary-comparison-number-sense-in-grade-5-mathematics"}

The [canonical mathematics graph](repo:curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json) contains the following five goals; they are also referenced in the Hessian G9 composition views. This inventory is not a partition of the whole year. The goal titles are given in English translation; the stable IDs identify the authored German goals.

| Existing Goal (Translated Title) | Meaning to Be Preserved Completely |
| --- | --- |
| Explain and compare the decimal system as a place-value system | Explain the decimal place-value system, decompose numbers into place values, and compare it with a given other number system. |
| Represent natural numbers and locate them on the number line | Represent natural numbers in digits and words and locate them, with justification, on a scaled number line. |
| Order and compare natural numbers | Compare and order natural numbers with justification and use relation signs. |
| Round natural numbers | Round to a given or contextually appropriate place and explain the resulting approximation. |
| Justify the unboundedness of the natural numbers with the successor principle | Justify with the generalised successor principle that there is no largest natural number. |
{cols="38%,62%"}

For comparison with the graph, the stable IDs in this order are `624764d6-becd-5f9b-ada3-0d4f9d143073`, `cf474eab-1379-4877-907e-58b0892ce734`, `9ef6c4fa-b97a-5d7a-86c1-96690f02d916`, `fe07241a-b779-5f35-a82d-7aa51ae74f42`, and `1a25ef44-f310-4c23-9ba8-44baec60d3b0`.

A possible promise reads: "I understand the structure of the natural numbers, can switch between representations, and estimate orders of magnitude with justification." The five goals are thus connected by one theme. The existing subject-matter paths are sparse, however: representation leads to ordering; place value leads to rounding and to unboundedness. Representation and place value additionally require the existing shared orientation entry, which is not subject-matter evidence. The five goals acquire no additional inherited subject prerequisites through this.

It is still open whether this forms a self-contained unit "number sense" or whether connecting it with calculating with natural numbers yields the better conceptual step. Independent applications, the actual later demand, and the justifiability of the boundary must be compared. The count of five decides this question as little as the existence of two branches does.

A shopping context with counting and estimating can supply suitable applications. On its own, however, it does not demonstrate the comparison of number systems or the general successor argument. These parts must not be dropped silently in order to pass off a convenient final task as complete evidence. Under rule R1, each of the five goals would need an own assessment of the unit that requires it; a convenient final task that requires only some of them leaves the others uncovered, which is a rule violation and never a free recognition.

The existing edge from the goal "Use multiplication and integer division as inverse operations" (`cafd6520-c4af-4109-9863-cc49ba6fad4d`) to the unboundedness goal is a reason for a subject review of its necessity, not an already decided correction. The calculation goal explicitly covers natural **and integer** numbers, signs, and the conditions of admissible division. Its scope must not be narrowed for the comparison with a unit on natural numbers.

### Consistency with the Recognition Model and the Unit Validity Rules {#sec:sga-ud-validity anchors="6-consistency-with-the-recognition-model-and-the-unit-validity-rules"}

Each atomic goal keeps one stored binary explicit result. Explicit mastery $M$ is joined by recognition $I$ derived from the fixed contracts of the directly owning unit: $M_{\mathrm{eff}}=M\cup I$. This competence acts globally, also under another focus or Personal Curriculum. Neither additional stored mastery tiers nor a hidden second qualification verdict arise.

Recognition is derived per valid local contract of the owning unit. An own ordinary goal is recognized once no open own assessment or memory goal of that unit still requires it, directly or transitively, also through already mastered intermediate goals. If assessments Q1 and Q2 belong to the same unit and both require goal A, then A stays open after Q1 is passed until Q2 is passed as well. An open assessment of another, later unit never reopens or withholds an already recognized goal.

The Product Owner decision of 11 November 2026 binds this rule to five unit validity rules ([Graph Definition §13.3](repo:docs/concept/skill-graph/assessment-gated-completion.md#sec-why-graph-not-enough)):

- **R1:** every own ordinary content goal of a unit lies on a prerequisite path from at least one own assessment of that unit, directly or transitively; a path that leads only to a memory goal does not count. Validity condition of the unit definition, hard from the first authored unit.
- **R2:** for every own ordinary goal, at least one own assessment that requires it has reviewed evidence that its tasks and ordinary grading really test the goal. Milestone M5, with the current per-goal binding at M7.
- **R3:** an assessment claims coverage only for goals it requires directly or transitively. Same placement as R1.
- **R4:** every acquisition target has exactly one directly owning unit. Same placement as R1.
- **R5:** a later re-cut of units or later edges never grant additional recognition to existing results; the contract is versioned. Runtime contract and precondition before implicit recognition is enabled in production.

Implicit recognition therefore exists only inside units whose contract satisfies R1--R4 with reviewed coverage. Otherwise the unit's own ordinary goals stay open, and the violation keeps the curriculum from reaching the respective milestone. A goal that no assessment covers stays open and is a rule violation; it is never recognized for free. For authored learning-unit catalogs, `validate:learning-units` ([validateLearningUnits.ts](repo:app/scripts/validateLearningUnits.ts)) enforces R1, R3, and the uniqueness part of R4 fail-closed in the required curriculum CI; the completeness part of R4 applies only to catalogs declared complete. R2 is not yet enforced as a milestone gate: the validator only checks claimed coverage reviews and reports missing ones. R5 and implicit recognition itself are not yet implemented. Neither candidate in this chapter belongs to an authored catalog.

For unit design this means: every own ordinary goal of a candidate needs an own assessment that requires it, and a path only to a memory goal is not enough; an assessment's claimed coverage never exceeds what it requires, and a missing prerequisite path is a subject-review finding rather than a reason for a redundant edge; and each goal is owned by exactly one unit, while a parent may display child goals without owning them.

Assessments and required cards need their own explicit results. Explicit mastery of an ordinary goal does not automatically pass a separately required unit assessment. Conversely, a single atomic prerequisite does not automatically require completion of the whole foreign unit; that needs a subject-justified whole-unit prerequisite. A parent completion replaces no open child assessment; completed children pass no additional parent assessment. Validly recognized individual competence stays in force while other obligations of the unit are still open.

All effective prerequisites remain authoritative, including inheritance, clusters, and complete transitive paths. An already mastered intermediate goal must not hide the demand of a still-open local assessment. Transitive minimality stays in force.

**Not adopted.** An alternative recorded on the archived branch of pull request #83 as a "6 November 2026 target decision" proposed immediate recognition from the qualified coverage list of a single passed assessment, including proof by a parent or foreign unit. The Product Owner reviewed it on 11 November 2026 and did not adopt it.

### Short Design Sheet {#sec:sga-ud-sheet anchors="7-short-design-sheet"}

Before any implementation planning, answer for every candidate:

1. What can learners do independently afterwards, and why does it matter?
2. Which concrete entry competencies are needed, and are they available, also across subjects, before the first dependent activity?
3. Which existing goals belong directly to the unit, which required child units does it have, and is every goal owned by exactly one unit (R4)?
4. What is the central conceptual step, and what actually builds on it?
5. Which tasks and ordinary grading rules demonstrate the whole promise? Does every own ordinary goal lie on a path from an own assessment (R1), and does at least one such assessment carry reviewed evidence for it (R2)?
6. Does every assessment claim coverage only for goals it requires (R3)?
7. Could someone pass despite lacking an essential competence?
8. Which focused further learning and fresh assessment follow such a gap?
9. Which sources and complete goal meanings justify scope and boundary?

Before planning again, the examples should make traceable why the boundaries hold up in subject terms, the assessments miss nothing essential, and a failure leads to meaningful further learning. An alternative cut must be comparable on the same questions. This sheet authorizes no implementation, no complete assignment of school years, and no technical access lock.
