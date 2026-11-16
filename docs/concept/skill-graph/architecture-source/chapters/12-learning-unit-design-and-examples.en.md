## Learning-Unit Design Criteria and Examples {#sec:sga-unit-design}

This chapter makes the didactic purpose of [recursive learning units](repo:docs/concept/skill-graph/learning-units.md) (Graph Definition §11), the [ordering rules E1 to E4](repo:docs/concept/skill-graph/learning-unit-progression.md), and [implicit mastery](repo:docs/concept/skill-graph/assessment-gated-completion.md) (§13) concrete. In the three-tier target model (**Cluster $\to$ Unit $\to$ Unit with assessments**), a subject unit is declared as a canonical cluster and introduced top-down per subject: first as a coarse, E1–E4 backflow-free subject unit ordered by sibling `after`, and subsequently refined into leaf units with own assessments (`coverageReviews`) that stay whole inside a single plan unit across all 16 Bundesländer.

Two worked subject studies illustrate boundary analysis, knowledge context, and assessment coverage: **motion with constant acceleration** in upper-secondary Physics and **number sense** in grade-5 Mathematics. Initial cuts of both were authored on 13 November 2026 under compatibility contract 1.2 with reviewed R2 coverage (`2` goals and `1` assessment in Physics, `5` goals and `2` assessments in Mathematics); migrating them to declared cluster units, comparing them against broader cuts (such as full kinematics or joining number sense with natural-number arithmetic), and running the 16-Länder whole-leaf check follow in steps `F8`–`F11`.

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

#### The Knowledge Context of a Unit {#sec:sga-ud-frame anchors="the-knowledge-context-of-a-unit"}

Whatever elaborates the goals of a unit addresses a learner who knows some things and does not yet know others. This knowledge is the [knowledge context](repo:docs/concept/skill-graph/knowledge-context.md): a projection of the skill graph that says for every goal what it builds on, what is secured, what builds on it, and which neighbouring subject matter is not yet secured (Product Owner requirement of 13 November 2026). The knowledge context of a unit is the union of the contexts of its own goals and assessments. Nothing is written for a unit by hand.

In a unit on differentiating polynomial functions, the context secures power functions with natural exponents, their multiples and sums, and the rules the unit develops. Trigonometric, exponential, and logarithmic functions and the product and chain rules are not secured. An application in this unit, and equally the image of one of its goals, then shows a polynomial function and never $\sin x$ or $e^x$, however natural such an example looks to an author who knows the whole subject.

Two rules follow for the design of a unit:

1. **Every elaboration stays inside.** Tasks and sample solutions of the own assessments, memory cards, practice tasks, goal images, and the coach's examples for the unit's goals use only what the context secures and what the unit develops. Whatever leaves it is assigned to the wrong unit or is changed.
2. **The graph must suffice.** If the unit needs something that its context does not secure, the graph lacks a prerequisite, a goal reaches into later subject matter, or the boundary is wrong. That is a finding for subject review. No edge is invented and no goal text is narrowed to remove it.

The context is derived before tasks, cards, and images of the unit are written or reviewed. It is the same in every curriculum context, because the prerequisite relation is canonical: neither "planned for the same school year" nor a sibling `after` order unlocks concepts inside $W(g)$; in E3’s case of two distinct child units, `after` orders the prerequisite child unit before the dependent one (when either branch is an own atom, demand itself provides the order), whereas only atomic `requires` paths secure concepts for tasks, cards, images, and explanations.

### Learn, Demonstrate, and Continue Learning {#sec:sga-ud-loop anchors="3-learn-demonstrate-and-continue-learning"}

The course starts with a meaningful question and a clear outlook: what can I do afterwards, and what do I need it for? Required prior knowledge is named concretely. Development and practice with feedback follow. The coach may explain, structure, and support when difficulties arise.

The subsequent assessment demands the claimed independent application. Step-by-step help that supplies exactly the decisive choice of model or reasoning can be practice, but it does not demonstrate this independence. Task variants must carry the same learning promise and must not merely repeat the practised surface.

When the evidence is missing, the concrete gap is explained, for example the confusion of two quantities. Suitable further development and practice follow, then a fresh assessment variant with equivalent content. A retry must not sidestep the problem through memorising an identical task. Valid competence evidence obtained elsewhere is not deleted by this.

In the intended learning flow, `after` and the "Unit by Unit" learning mode ([Unit Progression](repo:docs/concept/skill-graph/learning-unit-progression.md)) guide learners coherently through an opened unit up to its assessments without imposing technical unit locks: `after` changes neither atomic demand nor mastery or frontier eligibility, learners may attempt assessments directly at any time, an attempt that is not passed records no negative result, and no `requires` edge of later subject goals points to an assessment goal.

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

The knowledge context of this example secures the description of motion in diagrams, uniform motion, and average and instantaneous velocity, together with linear functions and the reading of graphs. Vectors and motion in two dimensions, forces as causes, and derivatives and integrals are not secured. Neither are quadratic equations: no prerequisite path of the two goals provides them, although the tasks need them. That is a finding under the second rule of the knowledge context of a unit.

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

### Second Example: Number Sense in Grade 5 Mathematics {#sec:sga-ud-math5 anchors="5-preliminary-comparison-number-sense-in-grade-5-mathematics"}

The [canonical mathematics graph](repo:curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json) contains the following five goals; they are also referenced in the Hessian G9 composition views. This selection is not a partition of the whole year. The goal titles are given in English translation; the stable IDs identify the authored German goals.

| Existing Goal (Translated Title) | Meaning to Be Preserved Completely |
| --- | --- |
| Explain and compare the decimal system as a place-value system | Explain the decimal place-value system, decompose numbers into place values, and compare it with a given other number system. |
| Represent natural numbers and locate them on the number line | Represent natural numbers in digits and words and locate them, with justification, on a scaled number line. |
| Order and compare natural numbers | Compare and order natural numbers with justification and use relation signs. |
| Round natural numbers | Round to a given or contextually appropriate place and explain the resulting approximation. |
| Justify the unboundedness of the natural numbers with the successor principle | Justify with the generalised successor principle that there is no largest natural number. |
{cols="38%,62%"}

For comparison with the graph, the stable IDs in this order are `624764d6-becd-5f9b-ada3-0d4f9d143073`, `cf474eab-1379-4877-907e-58b0892ce734`, `9ef6c4fa-b97a-5d7a-86c1-96690f02d916`, `fe07241a-b779-5f35-a82d-7aa51ae74f42`, and `1a25ef44-f310-4c23-9ba8-44baec60d3b0`.

The learning promise reads: "I understand the structure of the natural numbers, can switch between representations, and estimate orders of magnitude with justification." The five goals are thus connected by one theme. The existing subject-matter paths are sparse, however: representation leads to ordering; place value leads to rounding and to unboundedness. Representation and place value additionally require the existing shared orientation entry, which is not subject-matter evidence. The five goals acquire no additional inherited subject prerequisites through this.

Under compatibility contract 1.2, these five goals together with two associated assessments already form an initial leaf unit. During the top-down subject-unit rollout (`F9`–`F11`), subject review still examines whether separating "number sense" and natural-number arithmetic as child units beneath a shared parent unit holds up didactically and keeps each leaf unit whole inside one plan unit across all 16 Bundesländer. Independent applications, actual downstream demand, and boundary justifiability must be weighed against each other; the count of five decides this question as little as the existence of two branches does.

A shopping context with counting and estimating can supply suitable applications. On its own, however, it does not demonstrate the comparison of number systems or the general successor argument. These parts must not be dropped silently in order to pass off a convenient final task as complete evidence. Under rule R1, each of the five goals would need an own assessment of the unit that requires it; a convenient final task that requires only some of them leaves the others uncovered, which is a rule violation and never a free recognition.

The existing edge from the goal "Use multiplication and integer division as inverse operations" (`cafd6520-c4af-4109-9863-cc49ba6fad4d`) to the unboundedness goal is a reason for a subject review of its necessity, not an already decided correction. The calculation goal explicitly covers natural **and integer** numbers, signs, and the conditions of admissible division. Its scope must not be narrowed for the comparison with a unit on natural numbers.

### Consistency with the Ordering and Recognition Model (E1–E4 and R1–R5) {#sec:sga-ud-validity anchors="6-consistency-with-the-recognition-model-and-the-unit-validity-rules"}

Each atomic goal keeps one stored binary explicit result. Explicit mastery $M$ is joined by recognition $I$ derived from the fixed contracts of the directly owning unit with assessments: $M_{\mathrm{eff}}=M\cup I$. This competence acts globally, also under another focus or Personal Curriculum. Neither additional stored mastery tiers nor a hidden second qualification verdict arise.

Every unit — whether an assessment-free plan unit, a parent subject unit, or a leaf unit with assessments — must first satisfy the four **ordering rules E1–E4** ([Unit Progression](repo:docs/concept/skill-graph/learning-unit-progression.md)):

- **E1 (Subtree and projection shape):** A subject unit is a declared canonical cluster (own goals and child units derive from `contains`), and a plan unit is a projected plan container; leaf subject units stay whole inside a single plan unit across all 16 Bundesländer.
- **E2 (Contiguous block order):** There exists an order of all atoms that respects atomic demand and `after` while keeping every unit contiguous. Thus the child-block graph formed by crossing demand and `after` must be acyclic at every unit, including the virtual root. Path convexity alone does not suffice: for $\operatorname{Own}(U)=\{a,c\}$, $\operatorname{Own}(V)=\{b,d\}$, $a\to b$, and $d\to c$, the atomic graph is acyclic and both sets are path-convex, yet the blocks require each other.
- **E3 (Sibling-local completeness of `after`):** Whenever an atom beneath sibling unit $B$ requires an atom beneath sibling unit $A$ of the same parent unit, $B$ follows $A$ in the declared `after` order (zero backflows against unit order; no `requires` edge points to an assessment goal).
- **E4 (Irredundancy):** No declared `after` link repeats what already follows transitively across other siblings in `after`.

A local recognition contract, by contrast, is formed exclusively by a **unit with assessments** (with own assessments and valid complete `coverageReviews`). Units without an own recognition-assessment contract — including stages, years, course semesters, and assessment-free parent units, even when they hold standalone practice tasks or Abitur exams — only order and recognize nothing implicitly. Missing or invalid coverage of a declared assessment-bearing unit instead remains a contract violation, never a reclassification as assessment-free. Inside a unit with assessments, an own content goal (including experimental content goals) is recognized once no open own assessment or memory goal of that unit still requires it, directly or transitively, also through already mastered intermediate goals. If assessments Q1 and Q2 belong to the same unit and both require goal A, then A stays open after Q1 is passed until Q2 is passed as well. An open assessment of another, later unit never reopens or withholds an already recognized goal.

Every unit with assessments is governed by the five **validity rules R1–R5** ([Graph Definition §13.3](repo:docs/concept/skill-graph/assessment-gated-completion.md#sec-why-graph-not-enough)):

- **R1:** Every own content goal of a unit with assessments (including experimental content goals) lies on a prerequisite path from at least one own assessment of that unit, directly or transitively; a path that leads only to a memory goal does not count. Validity condition of the unit with assessments, hard from the moment its `coverageReviews` are declared.
- **R2:** For every own content goal, at least one own assessment that requires it has reviewed evidence that its tasks and ordinary grading genuinely test the goal without compensating-point bypasses. Milestone M5, with the current per-goal binding at M7.
- **R3:** An assessment claims coverage only for goals it requires directly or transitively. Same placement as R1.
- **R4:** Every acquisition target has exactly one directly owning unit in the resolved course. Same placement as R1.
- **R5:** A later re-cut of units or later edges never grant additional recognition to existing results; the contract is versioned via `revision`. Runtime contract and precondition before implicit recognition is enabled in production.

**Current implementation and contract status:** Normative recognition is limited to units with assessments whose contract satisfies R1–R5 with reviewed coverage; it is not yet in production. In the target model, an uncovered goal stays open and constitutes a rule violation, never a free recognition. Currently three learning units are authored in canonical Mathematics and Physics under compatibility contract 1.2 (as `programUnits` of kind `learningUnit` with `own` placements in `goalPlacements`, comprising the dot-product pilot and the initial cuts of the two examples in this chapter; see [Graph Definition §11.2](repo:docs/concept/skill-graph/learning-units.md#sec-unit-representation)). `validate:learning-units` ([validateLearningUnits.ts](repo:app/scripts/validateLearningUnits.ts)) enforces R1, R3, and the uniqueness part of R4 fail-closed in required CI and verifies claimed `coverageReviews` (the completeness part of R4 applies when `learningUnitCoverage` is `"complete"`). Migrating to declared cluster units with E1–E4 subject validation, R5 contract versioning, and production runtime recognition ($M_{\mathrm{eff}}$) follows in `F8`–`F12`.

For unit design this means: every unit must be convexly learnable in one block (E2) and reflect crossing prerequisite demand across siblings via `after` (E3/E4), while every unit with assessments needs own assessments inside the same cluster for all own content goals (R1–R3) and every planned goal belongs directly to exactly one unit in the resolved course (R4).

Assessments and required cards need their own explicit results. Explicit mastery of an ordinary goal does not automatically pass a separately required unit assessment. Conversely, a single atomic prerequisite does not automatically require completion of the whole foreign unit; only an explicitly authored, subject-justified `after` states that the whole other unit is done before work begins in the intended flow. This is order, not an additional prerequisite type: it changes neither atomic demand nor frontier and locks no deliberate assessment attempt. A parent completion replaces no open child assessment; completed children pass no additional parent assessment. Validly recognized individual competence stays in force while other obligations of the unit are still open.

All effective prerequisites remain authoritative, including inheritance, clusters, and complete transitive paths. An already mastered intermediate goal must not hide the demand of a still-open local assessment. Transitive minimality stays in force.

**Not adopted.** An alternative recorded on the archived branch of pull request #83 as a "6 November 2026 target decision" proposed immediate recognition from the qualified coverage list of a single passed assessment, including proof by a parent or foreign unit. The Product Owner reviewed it on 11 November 2026 and did not adopt it.

### Short Design Sheet {#sec:sga-ud-sheet anchors="7-short-design-sheet"}

Before any implementation planning, answer for every candidate:

1. What can learners do independently afterwards, and why does it matter?
2. Is the candidate a canonical cluster (E1), and if it is a leaf unit, does it stay whole inside a single plan unit across all 16 Bundesländer?
3. Does the complete child-block graph from atomic demand and `after` admit an acyclic order at every level, so every unit can be learned contiguously (E2)?
4. Which concrete entry competencies are needed, are they available in time (including across subjects), and is crossing demand between sibling units ordered completely and irredundantly via `after` with zero `requires` pointing to assessments (E3, E4)?
5. What does the unit's knowledge context secure via `requires` alone, what is not yet secured, and do all tasks, cards, images, and examples stay strictly inside that context?
6. Which existing goals belong directly to the unit (`Own(U)`), which child units does it have, and is every goal owned directly by at most one unit (R4)?
7. What is the central conceptual step, and should the candidate be a **unit with assessments** (`coverageReviews`) right away or an assessment-free parent unit first?
8. If it is a unit with assessments: which tasks and ordinary grading rules inside the unit cluster demonstrate the whole promise, does every own content goal (including experimental goals) lie on a path from an own assessment (R1), and does at least one such assessment carry reviewed evidence for it (R2)?
9. Does every assessment claim coverage only for goals it requires directly or transitively (R3)?
10. Could someone pass despite lacking an essential competence?
11. Which focused further learning and fresh assessment follow such a gap?
12. Are standalone practice tasks or Abitur exams cleanly separated from own recognition assessments?
13. Which official sources (*carried in*) and complete goal meanings justify scope, learning placement (*placed in*), and boundary?

Before planning again, the examples should make traceable why the boundaries hold up in subject terms, the assessments miss nothing essential, and a failure leads to meaningful further learning. An alternative cut must be comparable on the same questions. This sheet authorizes no implementation, no complete assignment of school years, and no technical access lock.
