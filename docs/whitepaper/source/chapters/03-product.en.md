## The Product: How SkillPilot Works {#sec:product}

Everyday learning brings four steps together: **choose a reachable goal, work on it, record progress, and plan further learning.** The following sections trace this path from the Personal Curriculum to the daily or weekly workload.

### From Curriculum to the Next Learning Goal {#sec:curriculum-to-goal}

The official curriculum sets the requirements. SkillPilot translates them into specific learning goals and prerequisites. This learning map, the selected personal scope, and recorded progress determine which goals are reachable next.

::figure{#fig:current-cockpit}

#### From Curriculum to Learning Map

Curricula, module handbooks, and standards provide the authoritative requirements. The learning goals derived from them remain linked to their sources, sections, and versions. The **skill graph** makes these requirements actionable:

- **Learning goals and topics:** Individual, assessable abilities form atomic goals. Clusters group them into broader topics or modules.
- **Prerequisites (`requires`):** A goal refers to the foundations it needs.
- **Composition (`contains`):** A topic refers to the learning goals it includes.

This creates several possible learning paths rather than one fixed sequence. Formal checks safeguard the structure, for example against cycles. Content quality assurance also checks whether goals are correct in their subject and their prerequisites make educational sense (section 5.1). The [graph definition](https://enpasos.github.io/skillpilot/concept/skill-graph/graph-definition/) explains the formal model; changes are versioned and reviewed (section 6).

#### Cross-Subject Prerequisites: Mathematics and Physics

**The learning map already connects Mathematics and Physics through specific `requires` links.** For example, “Describe motions using distance-time diagrams” requires “Read axes, scales and units,” among other foundations. The more advanced Physics goal “Investigate Motions with Diagrams” builds on “Calculate and interpret average rate of change,” among other goals.

The mathematical foundations retain their own learning-goal IDs and previously recorded progress. SkillPilot can therefore take that progress into account when learning Physics too. Which goals belong to the personal selection and which serve only as prerequisites is explicitly defined.

#### Four Levels of Personalization

The shared learning map becomes a personal learning path. SkillPilot distinguishes the lasting scope, the current step, and progress already achieved:

1. **Base Curriculum (Level 1):** The selected base curriculum, such as “Gymnasium (DE),” provides the available learning goals.
2. **Personal Curriculum (Level 2):** Federal state, school stage, subjects, and, where applicable, duration and course model determine the personal learning scope. This selection is made in the SkillPilot web app, not in the coach chat.
3. **Learning Focus and Active Goal (Level 3):** A temporarily selected subset and exactly one current learning goal guide the ongoing work. The coach uses the options offered by the backend. Widening the focus requires consent; within confirmed plan-guided or autopilot learning, the next permitted goal can be selected automatically.
4. **Learning Progress / Mastery (Level 4):** Progress is stored against stable learning-goal IDs and is retained when the view or focus changes.

A subject-specific **composition view** arranges the shared goals for the selected educational context. It distinguishes **goals to be learned (`target`)** from **prerequisites only (`prerequisiteOnly`)**. Only target goals count toward the visible learning tree, goal selection, progress, and completion of this scope. Prerequisite-only goals retain their recorded progress for prerequisite checks.

Lower-secondary foundations can therefore be taken into account in an upper-secondary view, or mathematical foundations when learning Physics, where that role is explicitly modeled. Including them as learning goals in their own right requires an appropriately selected personal scope. Neither moving to a new school stage nor a cross-subject link certifies their mastery.

#### Frontier: Which Goals Are Reachable Now

The backend calculates the **frontier** from the learning scope and recorded progress: goals not yet mastered whose effective prerequisites are met. The checks also include foundations explicitly modeled as `prerequisiteOnly` outside the visible learning scope. Optional **Strict Mode** additionally checks prerequisites globally.

This selection sets the boundaries for the coach’s next learning step. It reflects the recorded state and is not a psychological assessment of an individual’s learning potential.

### Learning Through Dialogue and Recording Progress {#sec:dialogue-and-progress}

**Think for yourself. Get support. Explain it yourself.**

::figure{#fig:learning-moment}

The moment of understanding belongs to the learner.

The **SkillPilot Learning Coach** turns the selected goal into a concrete learning task. It explains, offers hints, asks follow-up questions, and discusses solution methods. It receives the current learning scope, frontier, and permitted transitions from the backend. **Learners still do their own thinking**: for example, solving a task with paper and pencil, photographing their solution, and then discussing the feedback. AI should support the necessary effort effectively, not replace it.

#### Making Understanding Visible

For subject-specific understanding goals, the coach asks for reasoning and explanations in the learner’s own words rather than only correct final answers. Drawing on Socratic dialogue and the **Feynman technique**, this approach aims to reveal gaps in understanding and support targeted further practice. It is a teaching approach, not evidence of the effectiveness of the overall system. This knowledge assessment explicitly does not apply to orientation nodes.

#### Mastery: Recording Achieved Progress

Work on a task provides evidence of whether a learning goal has been understood. For ordinary learning goals, the coach makes a completion decision under the applicable evidence rules; SkillPilot checks and stores the permitted state change. The Cockpit shows the recorded progress, which is taken into account when selecting further learning goals.

This learning state is called **mastery**. Each learning goal has one outcome: achieved or not yet achieved. Assessment goals follow the same rule; a passed goal needs no additional qualification. Percentages for broader topics are weighted aggregates of achieved goals, not partial grades for individual goals. Orientation and memorization have their own completion rules (section 3.3).

The stored learning state remains separate from complete dialogues and additional artifacts. Institutions may require evidence outside this learning-goal state; this does not create a second outcome per goal in SkillPilot.

#### A Short Path from Feedback to Improvement

Does an explanation miss the point, is an exercise unclear, or does the coach behave differently than expected? **For supported subject-matter learning goals, you can give feedback directly in the Cockpit; the current goal is already linked to the feedback.** The feedback is critically reviewed during the next revision and considered for appropriate corrections. Learning experiences reach the place where the content and coaching can be improved. You do not need to be a Curriculum Champion to contribute. Please describe the specific problem without including private details or the full learning chat.

#### Learning Velocity

Learning Velocity shows how many **atomic goals** are newly recorded as mastered per week. It is an indicator of progress over time, not a measure of intelligence or a fixed trait of a child; learning goals can also require different amounts of effort. When new abilities become apparent after a longer initial learning phase, further steps can become available. **Recorded learning progress determines the next step — it is not a judgment of a child’s potential.** An earlier pace does not limit subsequent learning.

### Understanding, Memorizing, and Applying Independently {#sec:learning-modes}

The path to a learning goal depends on what needs to be learned. SkillPilot combines different forms of learning:

- **Understanding:** The coach explains concepts, supports learners’ own attempts at a solution, and asks for reasoning.
- **Memorization:** Vocabulary, notation, or selected formulas are reviewed as needed.
- **Independent application:** Practice and assessment tasks require independent work, for example on paper followed by a photo upload. The coach discusses and assesses solutions according to the requirements of each task.

Within a context such as “Mathematics, Year 7” or “Advanced Physics Course, Hesse, Abitur Preparation,” **modeled learning routes** connect these forms of learning. One possible route leads from orientation through guided understanding to independent application. Necessary memorization can run in parallel. Prerequisites and the current learning state determine the next permitted step; there is no rigid four-step sequence. The appendix provides a schematic example.

**Orientation** helps learners experience the purpose of a topic and the concrete possibilities it offers. It invites personal engagement and does not test subject knowledge. Merely selecting a suggested interest first starts the corresponding follow-up. For this goal type, the existing mastery state means completed orientation, not subject mastery; no additional completion marker is stored.

For content that needs to be memorized, **spaced repetition** complements work with explanations and tasks: the flashcard system (SRS) schedules when cards are reviewed, while the skill graph determines the next learning goals. Ordinary flashcard practice changes only the review schedule. Mastery of a memorization goal is derived from server-side card state and the separate **Verified Recall**, an unaided recall check. This distinction also remains visible in the Cockpit.

**Practice and assessment nodes** lead to independent application. In lower-secondary mathematics, year-level exams are organized under “Exams for Year …”; upper-secondary education adds appropriate course and Abitur exam tasks. Their review status is part of the respective curriculum’s quality assurance. Further task formats, for example for programming, writing, or speaking, can be added.

### From Curriculum to Everyday Learning: Learning Plans and Coach Guidance {#sec:learning-plan}

**Your progress stays connected.**

::figure{#fig:learning-core}

The coach explains through conversation; SkillPilot keeps the curriculum, confirmed learning progress, and planning connected. It stores learning state, not the conversation.

A navigable curriculum does not yet answer the everyday question: **“What do I need to learn today or this week, and how far have I got?”** A learning plan connects progress already made, goals still open, and time remaining. It makes deviations from the planned pace visible and provides a basis for agreeing on more learning time, additional support, or a different rhythm. Individual learning therefore does not mean learning without commitments to a time frame. **The plan guides learning, but must not prevent it.**

#### The Teacher Plans the Framework

The **Personal Curriculum** defines which competencies belong to the selected educational context. The **learning plan** specifies which topics or groups of learning goals should be addressed within which periods. It complements the skill graph without replacing its goals or prerequisites. To work through an entire curriculum, the plan must cover its intended scope; completing a partial plan does not automatically mean completing the curriculum.

Under **“Course planning”**, teachers prepare learning sections, date ranges, buffer time, and milestones. Subject plans, for example for mathematics and physics, apply **together** but are evaluated **per subject**: each subject has its own daily or weekly target, and work ahead in one subject does not offset backlog in another. Switching the current subject does not deactivate another subject plan or impose an order such as “finish all of mathematics before physics.” Several plans of the same subject are merged; overlapping sections do not count the same goal twice. The learner chooses the time resolution in the Personal Curriculum learning configuration in the Cockpit.

The **learner preview** shows each subject’s daily or weekly target and an outlook over the next seven calendar days before changes are applied; in weekly mode, entries are grouped by calendar week. It uses the same calculation as the Cockpit and chat. Dates are scheduled on weekdays from Monday to Friday. Goal counts describe the workload, not learning minutes. The teacher reviews scope and workload and adjusts the plan when necessary.

Drafts initially remain on the planning device. Only explicit joint confirmation makes them effective for the learner; later draft edits do not silently alter ongoing learning. **Teaching coverage is not learner mastery:** recording “covered in class” does not establish individual competence.

#### Daily and Weekly Resolution

Learners choose between **1 day** and **1 week**. This setting applies consistently to the Cockpit, chat, learner-specific planning, and selection of the next planned goal:

- **Daily resolution:** The workload covers the current calendar day.
- **Weekly resolution:** The workload covers the current calendar week from Monday to Sunday. Learners can complete it at the start of the week, over the weekend, or spread it out. Earlier days within the same week do not create additional backlog.

The choice is saved for the SkillPilot ID; weekly resolution is the default. Switching changes the time frame of the evaluation while preserving plan dates and achieved learning progress.

#### Plan Status in the Cockpit: Workload, Overall Progress, and Plan Balance

In plan mode, the Cockpit displays **two gauges with needles** for each subject. They bring together three different measures: the current workload, overall progress, and work ahead or backlog against the plan.

::figure{#fig:learning-plan-cockpit}

- **Current workload — “Today” or “This week”:** The left gauge shows the completed share as “x of y.” Work already done ahead of schedule counts toward it, so the display does not count only goals newly completed during this period.
- **Overall progress — “Overall: x of y”:** The number above the right gauge counts all achieved atomic goals in the subject’s current Personal Curriculum, including goals completed before the learning plan began. Each goal counts once.
- **Plan balance — behind, on track, or ahead:** The right needle and the text below show progress against the subject plan. Work ahead is taken into account within the same subject.

**A completed daily or weekly workload can coexist with older backlog.** Conversely, a currently unfinished workload alone does not create additional backlog. Subject balances remain separate. The active goal, offered subject switches, and expandable **“Plan details”** complete the overview. The Cockpit and coach use the same values calculated by SkillPilot.

#### The Learner Works in Chat

With plan mode enabled and a valid learning session, SkillPilot handles the organization in the background:

1. **Orient:** The coach quotes the plan status formulated by SkillPilot verbatim: for each subject, the daily or weekly target and any backlog or work ahead. The Cockpit shows a short form of the plan balance beside the gauge; the coach does no arithmetic of its own. It announces the active learning goal separately, once, when the learning task begins.
2. **Resume automatically:** A valid ongoing goal is continued; otherwise, while the daily or weekly workload remains open, a due goal whose prerequisites permit learning is selected, if one is available. Joint activation can already select this first goal. No extra “Continue learning” click or manual goal search is needed.
3. **Learn and check progress:** The coach explains, sets tasks, and supports the work. Only progress recorded under the applicable evidence rules changes the learning state and thus the plan status. The plan-guided flow then leads to the next permitted step.
4. **Switch subjects or finish:** A request such as “Physics now” switches within the available subject options; other requirements remain in place. Once the period targets are reached, the coach acknowledges this and does not start another goal on its own. Reaching a daily or weekly target does not mean there is no backlog; in that case, the coach invites the learner to catch up without pressure. Further learning remains available on request, and future goals do not automatically become extra duties for the current period. The plan status explicitly identifies plans that cannot be evaluated instead of presenting them as complete.

A status-only question does not start a new task; a requested pause remains a pause. If prerequisites or invalid planning block open goals, the coach reports the blockage instead of inventing a completed daily or weekly workload or a replacement duty. Plan corrections remain on the planning side. An expired learning session still requires a fresh start through SkillPilot; chat guidance does not extend the session.

#### Example: Mathematics and Physics on the Same Day

An **illustrative daily example**, not live data: in mathematics, 13 plan goals are scheduled through today and 9 progress-effective plan goals have been achieved; in physics, 10 are scheduled and 11 have been achieved. The **plan balance** also counts plan goals scheduled for later, but excludes goals already mastered when the plan was created. By contrast, “Overall: x of y” in the Cockpit covers all current atomic goals in the Personal Curriculum, including earlier achievements.

:::table{cols="3.6cm,3.6cm,X"}
| Subject | Daily workload | Additional plan status |
|---|---|---|
| Mathematics | 1 of 3 | 2 learning goals behind |
| Physics | 2 of 2 | 1 learning goal ahead |
:::

The two mathematics goals still open today and the additional backlog are shown separately. Work ahead in physics does **not** offset the mathematics backlog. “Ahead” describes the amount of progress, not mastery of every item scheduled earlier; earlier open goals remain available for goal selection.

On a weekly basis, the same rule applies to the amount due by the end of the current week, the weekly workload, and completions during that week, so the figures may differ. The coach names the active goal separately from plan status: **“Your active learning goal: …”**. Completing a daily or weekly workload does not prevent further learning.

This turns the curriculum into a guided learning path: **The teacher is responsible for scope and timing, SkillPilot calculates the next permitted steps, the coach leads the dialogue, and the learner concentrates on learning.**

---
