## Exam Material, Task Coverage, and Preparation {#sec:exam-preparation-planning}

Course planning links an exam milestone to explicitly selected topics and task packages (without priority weights). The milestone defines the exam date and chosen learning scope; only dated learning sections create weekly quotas and schedule balances. Entry path: **Course Planning → Open Course → Planning**.

### Three distinct statements {#sec:exam-three-statements}

:::table{cols="4.4cm,X"}
| Area | Meaning |
| --- | --- |
| **Exam material** | Explicitly selected topics and their visible `contains` subtrees. |
| **Task coverage** | Explicit `examData.coveredGoalIds` of the selected exam task packages. |
| **Preparation** | Still-open learning goals and required foundations to be worked through before the exam date. |
:::

The coverage view surfaces both directions: selected topics lacking an assigned task and extra topics required by chosen tasks. Available task packages count only once selected; assessment goals are counted separately from topic goals, and canonical goals are deduplicated.

A `requires` edge establishes preparation demand rather than tested performance, and metadata mappings are presented as *recorded topic mappings* rather than fresh quality certifications. Unavailable tasks are flagged rather than scheduled; when `coveredGoalIds` references a canonical cluster expanded into visible goals by the course view, it summarizes only those already visible goals without pulling hidden goals into the course.

For kinematics under **Physics → Phase E → Exercises**, two selectable task packages (*Vertical Throw: Signs, Apex, and Return* and *Horizontal Launch: Two Motions, One Shared Time*) each provide six sub-tasks (36 credit points) with full DE/EN solutions and rubrics covering equations of motion, diagrams, and vector-free reasoning (without claiming hands-on lab skill).

### Completing preparation {#sec:exam-complete-prep}

On a saved active exam milestone, **Complete Preparation** opens a read-only preview (using the stored learner planning baseline, or treating all required goals as open when no learner state is linked). It distinguishes already mastered, scheduled-in-time, and still-unscheduled goals alongside extra foundations and open mappings across a window ending before the exam date with at least one weekday.

By default only the explicit exam selection is scheduled; extra task topics and prerequisite foundations are opt-in toggles. Out-of-course prerequisites are listed separately and never silently added to course targets, while the backend frontier continues enforcing prerequisites during learning.

**Adopt Preparation** creates an active multi-root canonical learning section without mutating exam material or duplicating goals already scheduled on time. Pulling goals forward from later sections lists every affected section and requires explicit confirmation (emptied sections remain preserved as inactive). The immutable learner planning baseline is preserved; failures keep the preview open with a clear error, and Cockpit handoff remains an explicit confirmation step.

### Active and inactive sections {#sec:exam-active-inactive}

Every learning section, buffer, and milestone can be toggled active or inactive individually (omitted `active` defaults to active for existing records). Inactive items remain visible, editable, and reactivatable, but are excluded prior to goal expansion and deduplication: they generate neither due targets nor backlog, protect no buffer days, and never act as the next deadline.

Deactivating mutates neither stored mastery nor personal course targets nor a manually active goal; reactivating retains dates and evaluates against current mastery. A wholly inactive schedule may also be explicitly handed off to the Cockpit to pause a previously active plan cleanly.

### Progress, exam focus, and coach launch {#sec:exam-focus-and-launch}

Exam material and dated scheduling remain distinct sets: an active exam's scope contains the exact visible atomic goals of its selected topics and task packages (retaining already mastered goals in the denominator; task coverage and prerequisites do not expand it). When dated preparation is still unset, the shared backend status reports exam progress alongside **Schedule open**, and the Cockpit renders overall exam progress and its expandable goal list without inventing weekly quotas or balance dials (whereas a zero-quota week inside an active dated schedule keeps its balance gauge).

One shared backend resolver determines scope across Cockpit, plan start, and coach (picking the earliest active exam date, breaking ties stably by section ID, and never merging separate exams). Activating or starting the exam plan sets the full atomic exam scope as focus while `activeGoal` marks only the current step within it.

In standard (*optimistic*) mode, effective prerequisites apply within the exam focus (starting kinematics at *"Investigate motion using diagrams"*), without marking external foundations mastered or adding them to focus; only explicit strict mode blocks on open external prerequisites. Without active exam material, voluntary study across the Personal Curriculum remains unrestricted.

**Start Learning** jumps from the Cockpit straight to provider selection and explicit new-session launch after re-verifying the stored SkillPilot ID and curriculum server-side. This workflow writes no mastery records and infers no competence from topic metadata.
