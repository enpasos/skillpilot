## Learning-Goal Book and Local Time Planning for Teachers {#sec:teacher-goal-book-planning}

:::note{title="Status and Scope Boundary"}
Approved by the Product Owner on 5 September 2026 for planning and implementation; Stage 1 is implemented locally under **Teachers → Class → Planning → Edit Plan**. This workflow neither triggers a curriculum QA rerun nor constitutes a production deployment. Core domain terms and the strict separation between scheduling and stored learner outcomes follow [Curriculum Time Axis and Pacing](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md), while keeping class records strictly browser-local rather than introducing server-side class management.
:::

### Product goal {#sec:goal-book-planning-goal}

Teachers can plan a manageable instructional unit directly from the learning-goal book governing their course: inspect and pick suitable goals, assign dates, and immediately see which goals remain unscheduled and which prerequisites lie outside or chronologically after the unit.

Stage 1 connects existing course planning with the learning-goal book without introducing a second schedule model or centralized class storage. Existing plan sections, local revisions, date checks, and explicit handoff into learner-owned schedules are reused. Subsequent exam-preparation support (@ref{sec:exam-preparation-planning}) adds exam-material vs. task-coverage comparison, a preparation-completion preview, and individually toggleable plan sections.

### Stage 1 capabilities {#sec:goal-book-planning-stage1}

1. **Course-projected goal selection:** Within the active course context, the teacher selects learning goals using their descriptions and book layout. The authoritative course projection bounds selectable goals; a publicly visible book goal is not automatically part of a specific course, and subject, state, stage, track, and course profile are never re-guessed.
2. **Explicit draft adoption:** Selected goals populate the local section draft while start date, end date, and optional custom title remain teacher choices. Saving updates only the browser-local plan; only confirmed Cockpit activation updates the learner's personal schedule.
3. **Accessible timeline:** A compact timeline visualizes learning sections, buffers, and milestones alongside full text/date form inputs so neither mouse interaction nor drag-and-drop is required.
4. **Visible planning basis and prerequisite hints:** Scheduled and unscheduled goals within the planning basis are highlighted together with concrete prerequisite hints distinguishing out-of-plan goals from out-of-order dates, without claiming individual learner mastery.
5. **Non-destructive source navigation:** Teachers can jump from any scheduled goal to its book entry and primary curriculum sources without losing unsaved draft edits.

### Security and semantic boundaries {#sec:goal-book-planning-boundaries}

- **Browser-local privacy boundary:** Class names, memberships, and legacy local notes remain exclusively in browser storage; public goal-book fetches never transmit class or learner identifiers.
- **No silent schedule rewrites:** Book or curriculum updates never silently rewrite plans or dates; incompatible goals surface as explicit conflicts (see @ref{sec:course-plan-update-continuity}).
- **Single source of outcomes:** Stored learner goal results remain the sole source of achieved goals. Former manual teaching coverage and completeness attestations are retired as a progress workflow (legacy local entries remain intact without generating mastery).
- **Read-only progress and immutable baseline:** Per-learner subject progress is read-only from the backend's personal target scope and stored results (counting completed orientation goals in scope without claiming subject mastery, and reporting missing/stale reads as unavailable rather than zero). Plan set $G$ stays fixed once captured, and learner plan status follows @ref{sec:unified-plan-status}.
- **No fabricated hour budgets:** Raw atomic goal counts do not measure teaching hours; no pseudo-precise automatic hour budgets are synthesized from node counts, and missing plan evaluations render as unknown rather than "all unscheduled".
- **No AI or calendar coupling in Stage 1:** Neither new AI calls nor external calendar services or publications are added; any future AI schedule proposal would have to expose editable assumptions on time, prior knowledge, practice, and buffers. Historical OpenAI review artifacts and published packages remain untouched; local checks do not constitute deployment.

UI implementation resides in `CoursePlanLearningBook.tsx` and `CoursePlanTimeline.tsx` wired into `CoursePlanPilotView.tsx`; `testTrainerCoursePlanUi.ts` covers selection bounds, privacy, draft protection, keyboard focus, timeline proportions, and narrow viewports.

### Acceptance criteria {#sec:goal-book-planning-acceptance}

- A realistic Mathematics or Physics unit can be created inside an existing course, populated from the learning-goal book, dated, saved, and reopened; goals outside the course projection cannot be added.
- Switching views, cancelling, and navigating back never lose saved plans or unconfirmed edits without warning; timeline, date inputs, and goal pickers work via keyboard and on narrow screens.
- Stored goal completions match across goal tree, Cockpit, and planning for identical learner/subject/scope; progress reads stay strictly read-only, and model/UI regressions, TypeScript, and build checks pass.
