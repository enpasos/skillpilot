# Learning Workflow

This document describes the runtime workflow from static curricula to learner-specific navigation and mastery updates.

The workflow is provider-neutral inside the backend. The current German
learner-facing ChatGPT adapter is the
[OpenAI MCP App](openai-mcp-oauth-learner-session-architecture.md): a fixed
confidential OAuth client authenticates the App, while every explicit
**Lernen starten** action creates a fresh, absolutely expiring 24-hour learning
session for the selected learner. SkillPilot inserts the opaque session ID into
the ChatGPT start message automatically, and the App must pass it unchanged to
every learner-specific MCP tool call. The permanent SkillPilot ID remains
backend-only; OAuth alone neither selects a learner nor creates a learning
session.
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

### Before Step 1: Catalog Navigation

The UI may first group available curricula into catalog areas such as school,
university and higher education, or languages and continuing education. This
helps the learner find a curriculum but does not become part of learner state.

### Step 1: Base Curriculum Selection
Before learning starts, a **base curriculum** must be chosen.

- Definition: the authority-defined landscape that provides the full goal universe.
- Example: "Gymnasium (DE)" or a specific university pathway.

### Step 2: Committed Personal Curriculum
The learner narrows the base curriculum to the longer-lived subset relevant for
their own path.

- Definition: the committed selection of authored curriculum dimensions that
  should count as in-scope.
- Example: selecting advanced Math and basic Physics while omitting unrelated subjects.
- School order: jurisdiction or explicit canonical view, applicable duration
  model, stage, subjects, then course profile per subject.
- Result: the resolved learner-facing composition view becomes the candidate
  space for focus, frontier, progress, and completion.
- Ownership: one backend-owned state is edited through the start screen, the
  Cockpit, prospectively an MCP UI, or an unambiguous ChatCoach request. The web
  editor is the primary control surface, not the only one.
- Invariants: LK is a subject profile and never implies upper secondary;
  missing stage information never means both stages; ambiguous scope requests
  require clarification.

### Step 3: Focus and Active Atomic Goal
The learner can define focus at two different levels.

- **Level 3a — planned goals / focus roots:** one or more goals can be marked as planned.
  - Their descendants define the learner's current focus scope.
  - Once Level 2 is complete, the focus is never empty. If no still-valid
    focus has been chosen, the system selects the highest first visible root
    in the learner-facing tree as a deterministic default.
  - Interactive learner selection is single-choice; backend and coach
    contracts may still set more than one focus root for a deliberate combined
    corridor.
  - While Level 2 is incomplete or unresolved, an empty focus remains valid.
- **Level 3b — active atomic goal:** exactly one atomic goal can be active as
  the immediate working target in the UI/learning-coach loop.
  - The active goal should normally come from the frontier, but the system can still diagnose blockers for non-frontier selections.

Year, phase, or module choices are focus over program structure; they are not
silently converted into canonical learning goals. A focus change does not
rewrite the Personal Curriculum.

When focus is widened, the backend follows the learner-facing ancestor path
toward the root and publishes valid broader ancestors that add unmastered
`target` goals. Options are ordered nearest suitable ancestor first. The coach
or UI uses these published options rather than reconstructing hierarchy or IDs.
An automatic widening proposal requires completed current-scope progress; an
empty frontier is not completion. The first option is offered as the default,
but focus is persisted only after learner acceptance.

### Step 4: Frontier Calculation and Navigation Loop
Learning proceeds along the **frontier**: the set of sensible next goals.

- A goal is frontier-eligible when:
  - the goal itself is not yet mastered
  - all **effective** prerequisites are sufficiently mastered
- Effective prerequisites include:
  - the goal's direct `requires`
  - inherited `requires` from ancestor clusters via `contains`

`requires` is directional. If A is required by B, mastery of B does not imply
mastery of A. An unmastered A remains in normal frontier evaluation and appears
once A's own effective prerequisites are satisfied. Focus widening never
creates backward mastery or removes such targets from expected progress.

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
- Mastery remains global when the Personal Curriculum, composition view, focus,
  or active goal changes.
- Cluster mastery is aggregated from contained descendants using goal weights.
- Memorization/SRS goals are a special case.
  - Their mastery is derived from card state rather than manually set.
  - SRS scheduling shows whether cards are currently due.
  - Verified recall records whether each required card has been answered correctly in a learning-coach/GPT-led hard test.
  - A memorization goal counts as mastered only after all required cards are verified and no required card is currently due.
  - The learner may start the hard recall test at any time while the memorization node is the active goal.
  - A memorization node offers ordinary flashcard learning in the Cockpit and,
    where the provider supports the dedicated reviewed component, directly in
    the chat UI. Both surfaces use the same simple learner-facing decisions
    (`Noch nicht gewusst` / `Gewusst`) and explicit previous/next navigation;
    only the repetition schedule changes.
  - Verified Recall remains a separate learning-coach handoff. Neither the
    Cockpit nor the ordinary chat card component grades that strict recall or
    treats a practice rating as mastery evidence.

When mastery changes:

- satisfied prerequisites unlock new goals
- the frontier is recomputed
- the learner state refreshes, including next steps and summaries
