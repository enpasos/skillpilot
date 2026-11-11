## Learning Workflow {#sec:learning-workflow}

This chapter traces the operational runtime flow from static skill landscapes under `curricula/` to personalized navigation and binary mastery updates.

Inside the backend the workflow is provider-neutral. For ChatGPT (@ref{sec:openai-mcp-oauth-session}), a registered OAuth client authenticates the integration while every explicit **Start Learning** (*Lernen starten*) click creates a fresh, absolutely expiring 24-hour `learningSessionId` injected into the launch prompt and passed unchanged to every domain MCP tool call; the permanent SkillPilot ID stays strictly backend-only. The [Visible Session Flow](repo:docs/concept/runtime-workflows/chatgpt-visible-session-flow.md) remains an isolated rollback path, and the Claude lane uses the same state projection while awaiting full end-to-end client acceptance. Shared ChatClient/backend boundaries are governed by @ref{sec:provider-neutral-coach-boundary}.

### Data foundation: landscapes, structure, and filters {#sec:workflow-data-foundation}

Each skill landscape under `curricula/` is a DAG with `contains` (hierarchy/composition) and `requires` (didactic prerequisites). During ongoing cluster-edge migration, runtime navigation derives **effective prerequisites** from both direct `requires` and `requires` inherited via `contains` ancestors, while Personal Curriculum filters narrow the visible learner view without preventing strict prerequisite checks across the structural graph.

### Lifecycle steps 1–3: Base Curriculum, Personal Curriculum, and Focus {#sec:workflow-steps-1-to-3}

1. **Base Curriculum (Level 1):** Preceded by stateless catalog navigation, the learner selects one authority-defined root curriculum providing the complete goal universe.
2. **Committed Personal Curriculum (Level 2):** Configured solely in the first-party WebGUI (jurisdiction/canonical view $\rightarrow$ duration model $\rightarrow$ stage $\rightarrow$ subjects $\rightarrow$ per-subject course profile), producing the candidate space for focus, frontier, progress, and teacher course-plan selectors (which read Level 2 independently of mutable Level-3 focus).
3. **Focus and Active Goal (Level 3):**
   - **Level 3a (Focus roots):** Once Level 2 is complete, focus is never empty (defaulting deterministically to the first visible root if unset, while multi-root corridors remain supported for backend/coach plans).
   - **Level 3b (Active atomic goal):** At most one atomic goal active in the UI/coach loop.
   - **Plan-guided progression:** Confirmed teacher schedule activation atomically replaces included subject schedules, enables plan mode (suppressing generic Autopilot), and selects the first due frontier goal for an unfinished period quota; foreground subject switches park unfinished work without mutating mastery, and post-completion handoffs rank unfinished subject quotas deterministically without ever bypassing `requires` or inventing fallback goals (see [Unified Learning-Plan Status](repo:docs/concept/didactic/unified-learning-plan-status.md) and legacy [Daily Learning Progress](repo:docs/concept/runtime-workflows/daily-learning-progress.md)).
   - **Focus widening:** Offers backend-published broader ancestors along the visible path to root only after genuine completion of the current scope and learner confirmation.

### Step 4: frontier calculation and evaluation modes {#sec:workflow-step4}

An atomic goal enters the **frontier** iff it is not yet mastered and all of its effective prerequisites are satisfied under their goal-type contracts. Under the 4 November 2026 [Assessment-Gated Completion](repo:docs/concept/skill-graph/assessment-gated-completion.md) model (runtime adaptation pending), effective mastery $M_{\mathrm{eff}} = M \cup W$ satisfies prerequisites without writing synthetic mastery rows, while ordinary mastery of $B$ in $Q \to B \to A$ never recognizes $A$ while local assessment $Q$ remains open.

- **Optimistic mode:** Restricts prerequisite blocking to the active focus (computing transitive reachability prior to target masking so hidden intermediate nodes never sever paths), letting learners start inside their chosen scope.
- **Strict mode:** Keeps candidates inside the filtered scope while enforcing global prerequisite closure to surface foundational gaps outside the filter.

When a learner requests a non-frontier goal, the runtime traces missing effective prerequisites and redirects to those blockers.

### Step 5: mastery, aggregation, and feedback {#sec:workflow-step5 anchors="step-5-mastery-aggregation-and-feedback"}

Every atomic goal has one authoritative persisted outcome on its stable UUID: **mastered or not mastered** (`0.0` or `1.0`; intermediate values are never a third pedagogical state).

- **Global persistence and aggregation:** Mastery stays global across view, Level-2, and Level-3 changes. Cluster/scope progress is the weighted share of unique effectively mastered atomic goals (60% means e.g. 6 of 10 goals mastered, never 60% of one goal).
- **Memorization (SRS) goals:** Derive their binary goal outcome from card state: ordinary flashcard practice in Cockpit or the dedicated MCP App component (`Not yet known` / `Known` with back/next navigation) updates SRS scheduling only, whereas **Verified Recall** is a separate unaided coach batch test. A memorization goal counts as mastered only once all required cards are verified and none is currently due (see [Node Types](repo:docs/concept/skill-graph/node-types.md)). Orientation completion markers record finished onboarding dialogue without claiming subject competence.
- **Implementation status (verified 30 October 2026):** `LearnerService` accepts only `0.0` or `1.0` on new general mastery writes and `GoalCard.tsx` exposes binary controls, while `Mastery.java` retains `double` storage with the `>= 0.9` read compatibility threshold for historical rows. Browser SRS sync cannot fabricate verified recall, and signed imports preserve verified card state (see [Completion Pilot](repo:docs/dev/assessment-gated-completion-pilot.md)). Whenever mastery changes, unlocked prerequisites, frontier options, and progress summaries recompute immediately.
