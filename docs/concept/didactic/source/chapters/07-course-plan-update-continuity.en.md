## Reliable Course Plans Across Curriculum Updates {#sec:course-plan-update-continuity}

:::note{title="Status and Scope"}
As of 8 September 2026 — Product Owner requested UX and architecture concept; automated transition rules and structured diagnostic payloads beyond the initial local hotfix remain future implementation work. *Plan author* refers to the teacher or mentor defining learning sections and dates. This specification implies neither automatic deployment nor changes to published coach contracts.
:::

### Goal and current baseline {#sec:update-continuity-goal}

A teacher who schedules "Upper-Secondary Physics through late September" must be able to keep using that schedule after editorial refinements or semantically equivalent goal revisions without manual repair steps. Teacher intervention belongs only where the chosen competence scope, a deadline, or a didactically relevant prerequisite genuinely changes. Primary protection sits **before** curriculum publication: routine updates must never silently break a substantively valid active schedule.

- **Local teacher draft:** A local fix already prevents a single retired atomic ID in the historical subject-wide baseline from locking every section in the draft.
- **Copied learner schedule:** The independent personal schedule already ignores subject-wide fingerprint churn, yet retired copied atom IDs or altered prerequisite ordering can still lock a subject plan, and split goals require reviewed transition mappings (title similarity never suffices).
- **Diagnostic and communication boundary:** Subject cards must separate local draft state from the active learner schedule, and the backend must stop collapsing distinct conflicts into generic `stale` / `personal-curriculum-changed` claims without proof. Because classes live exclusively in browser storage, no server push channel can notify an offline teacher ahead of the learner's next visit.

### Plan-author workflow and status states {#sec:update-continuity-states}

1. **Planning:** Pick competence scope and dates; *"Make available for learners"* copies only after confirmed preview. Compatibility promises appear in UI copy only once backed by the technical guarantees below.
2. **Compatible update:** The schedule continues running with no modal, red badge, or re-activation step (optional history note: *"Goal descriptions updated. Your schedule remains active."*).
3. **Optional competence addition:** The active plan keeps running (e.g. *"Physics active · 1 section has an update suggestion"*).
4. **Targeted review and decision:** Opening the notice lands directly on the affected section with keyboard focus, exact reason, learner impact, and explicit choices (e.g. *"Keep current scope"* vs. *"Include added topic"*); cancelling leaves the valid schedule untouched.

Every subject card answers **"What applies to the learner right now?"** first and displays **"Your draft"** secondarily.

:::table{cols="4.6cm,4.8cm,X"}
| Situation | Plan-author badge | Behavior |
| --- | --- | --- |
| Active plan valid | `Active for learner` | Learning proceeds; no action needed. |
| Local draft edited | `Active for learner · Draft modified` | Prior schedule governs until confirmed handoff. |
| Optional curriculum expansion | `Active · Update suggestion` | Inspectable impact; no blocking dialog. |
| Genuine conflict | `Decision needed: Section …` | Exact cause, affected goals, and resolution (e.g. verified LK $\rightarrow$ GK profile change). |
| Technical fetch failure | `Status currently unavailable · last checked …` | Retry option; never prompts schedule edits. |
| Plan mode intentionally off | `Plan learning paused` | Explained as deliberate state, not an error. |
:::

Red styling is reserved for verified execution blockers; version bumps, changed atom counts, or network failures do not prove a domain conflict.

### Platform obligations across updates {#sec:update-continuity-platform}

**Separate planning intent from derived execution:** Competence scope, validity, and dates are durable; expanded atomic goal lists are versioned projections, and recomputation neither rewrites historical baselines nor fabricates mastery.

:::table{cols="5.6cm,X"}
| Change category | Required platform handling |
| --- | --- |
| Editorial wording/display on same goal | Keep compatible with zero plan action. |
| Change outside scheduled scope | Zero impact on this schedule. |
| Rename / internal cluster restructuring | Resolve via stable IDs or reviewed successor links (never title heuristics). |
| Equivalent split of an atomic goal | Require reviewed predecessor $\rightarrow$ successor mapping covering task scheduling, evidence semantics, and progress counts (no artificial backlog spike, no automatic 100% mastery carry-over). |
| New competence goal in same cluster | Surface as optional suggestion; keep previously committed scope runnable. |
| New prerequisite edge | Check valid ordering inside existing dates first; escalate only real scope/date changes. |
| Learner Personal Curriculum change | Report separately as a learner-scope change with targeted reconciliation. |
:::

Before release, a dedicated update gate diffs old vs. new skill graphs for removed anchors, splits, and prerequisite changes, replays representative schedules, and blocks unresolved breaks (paired with privacy-preserving read-only impact checks on stored personal schedules and post-release smoke tests). For learners, partial conflicts keep unaffected valid subjects runnable (e.g. *"Physics is being checked. You can continue with Mathematics today."*) without unlocking unverified dependent tasks or turning learners into error messengers.

### Four verifiable rollout steps and code anchors {#sec:update-continuity-rollout}

1. **Shared diagnostic contract** replacing generic `stale` with structured cause, subject/section, impact, check timestamp, and action shared across Trainer, preview, and Cockpit.
2. **Visible UX states** on subject cards and course overviews after walking through three reference scenarios with the Product Owner (editorial update, equivalent atom split, genuine course-profile change).
3. **Reviewed successor mappings and CI update gate** across legacy and current schedule formats (the step that actually eliminates unexpected update breaks).
4. **End-to-end learner-then-teacher acceptance** backed by regressions, update gate, and smoke checks.

Relevant implementation paths: `app/src/utils/localTeacherCoursePlan.ts`, `app/src/components/CoursePlanPilotView.tsx`, `app/src/views/TrainerView.tsx`, `app/src/utils/teacherLearningPlanActivation.ts`, `app/src/components/TrainerLearningPlanActivation.tsx`, `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java`, `LearnerLearningPlanService.java`, and `app/src/utils/learnerLearningPlanCopy.ts` (see also @ref{sec:existing-learner-teacher-view}, @ref{sec:teacher-goal-book-planning}, and [Review Freeze](repo:docs/deploy/openai-plugin-v1-review-freeze.md)).
