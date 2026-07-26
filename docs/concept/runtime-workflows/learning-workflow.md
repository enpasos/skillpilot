# Learning Workflow

This document describes the runtime workflow from static curricula to learner-specific navigation and mastery updates.

The workflow is provider-neutral inside the backend. The current German
learner-facing ChatGPT adapter is the
[OpenAI MCP App](openai-mcp-oauth-learner-session-architecture.md): it reloads
fresh allowlisted state through OAuth-authenticated, data-only tools. The backend
resolves the learner and a separate, absolutely expiring 24-hour learning
session; no SkillPilot ID or session token is carried in chat or tool arguments.
The [Visible Session flow](chatgpt-visible-session-flow.md) remains only a
Custom-GPT rollback path and possible English fallback. The retained Claude
adapter uses the same safe state projection and protected exam authorization,
but remains disabled until its complete provider-specific workflow has passed a
real adult-only end-to-end acceptance run. The shared boundary is documented in
[Provider-Neutral Learning-Coach Boundary](provider-neutral-coach-boundary.md).

## 1. Data Foundation: Landscapes, Structure, and Filters
SkillPilot starts from curriculum landscapes stored as JSON files under `curricula/`.

- The landscape is a DAG of learning goals with two relations:
  - `contains` for hierarchy and scope
  - `requires` for didactic prerequisites
- Runtime navigation does not use only direct `requires`.
  - The system derives **effective prerequisites** by inheriting `requires` from `contains` ancestors.
- Personal curriculum filters and course selections narrow the visible/searchable subset.
  - The backend may still use the full structural graph for scope expansion and strict prerequisite checks.

## 2. The Learning Lifecycle

### Step 1: Base Curriculum Selection
Before learning starts, a **base curriculum** must be chosen.

- Definition: the authority-defined landscape that provides the full goal universe.
- Example: "Gymnasiale Oberstufe Hessen" or a specific university pathway.

### Step 2: Personal Curriculum / Filters
The learner narrows the base curriculum to the subset relevant for their own path.

- Definition: the filtered subset of the base curriculum that should currently count as in-scope.
- Example: selecting advanced Math and basic Physics while omitting unrelated subjects.
- Result: this filtered view becomes the candidate space for frontier navigation.

### Step 3: Planned Scope and Active Goal
The learner can define focus at two different levels.

- **Planned goals / scope roots:** one or more goals can be marked as planned.
  - Their descendants define the learner's current focus scope.
  - If no planned goals are set, the whole personal curriculum remains in scope.
- **Active goal:** one goal can be active as the immediate working target in the UI/learning-coach loop.
  - The active goal should normally come from the frontier, but the system can still diagnose blockers for non-frontier selections.

### Step 4: Frontier Calculation and Navigation Loop
Learning proceeds along the **frontier**: the set of sensible next goals.

- A goal is frontier-eligible when:
  - the goal itself is not yet mastered
  - all **effective** prerequisites are sufficiently mastered
- Effective prerequisites include:
  - the goal's direct `requires`
  - inherited `requires` from ancestor clusters via `contains`

SkillPilot supports two evaluation modes for filtered learning:

- **Optimistic mode:** apply the filter first and check prerequisites only inside the filtered graph.
  - This lets learners start directly in the selected scope without being blocked by out-of-filter gaps.
- **Strict mode:** candidates are still chosen from the filtered graph, but prerequisites are enforced globally.
  - This exposes missing foundations outside the current filter.

Runtime loop:

1. Calculate the frontier inside the current filtered/planned scope.
2. Let the learning coach or UI select an active goal from that frontier.
3. If the learner wants a non-frontier goal, trace the missing effective prerequisites and redirect to the blockers.

### Step 5: Mastery, Aggregation, and Feedback
Progress is stored as **mastery** on atomic goals and aggregated upward for clusters.

- Atomic mastery is tracked per goal UUID on a `0.0` to `1.0` scale.
- Cluster mastery is aggregated from contained descendants using goal weights.
- Memorization/SRS goals are a special case.
  - Their mastery is derived from card state rather than manually set.
  - SRS scheduling shows whether cards are currently due.
  - Verified recall records whether each required card has been answered correctly in a learning-coach/GPT-led hard test.
  - A memorization goal counts as mastered only after all required cards are verified and no required card is currently due.
  - The learner may start the hard recall test at any time while the memorization node is the active goal.
  - In the Cockpit, a memorization node offers practice in the SRS drill and a handoff to learning-coach/GPT verification; the Cockpit itself does not grade the hard recall.

When mastery changes:

- satisfied prerequisites unlock new goals
- the frontier is recomputed
- the learner state refreshes, including next steps and summaries
