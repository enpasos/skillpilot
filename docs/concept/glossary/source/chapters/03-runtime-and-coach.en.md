## Learner runtime {#sec:learner-runtime}

### Levels of personalization {unnumbered=true}

*DE: Personalisierungsstufen* — see [Levels of Personalization](repo:docs/concept/levels-of-personalization.md)

The four-step narrowing from curriculum to individual mastery: **1** base curriculum → **2** committed personal curriculum → **3a** current focus plus **3b** one active atomic goal → **4** global mastery. Catalog navigation such as school, university, or languages precedes Level 1 and is not learner scope.

### Base curriculum {unnumbered=true}

*DE: Basiscurriculum* — see [Learning Workflow](repo:docs/concept/runtime-workflows/learning-workflow.md)

The skill landscape chosen before learning starts; it provides the full goal universe for that learner.

### Personal curriculum {unnumbered=true}

*DE: persönliches Curriculum, persönlicher Lehrplan* — see [Learning Workflow](repo:docs/concept/runtime-workflows/learning-workflow.md)

The committed, longer-lived subset of the base curriculum in scope for one learner (jurisdiction or canonical view, applicable duration model, stage, subjects, and course profiles per subject). It resolves the learner-facing composition view and becomes the candidate space for focus, frontier, progress, and completion, while the backend may still consult the full graph for strict prerequisite checks.

This state is backend-owned and configured exclusively through the first-party WebGUI and Cockpit; the chat coach neither asks for nor mutates it.

### Personalization {unnumbered=true}

*DE: Personalisierung* — see [Behavioral Integration of the MCP Coach](repo:docs/concept/runtime-workflows/openai-mcp-coach-behavioral-integration.md)

The learner's authored validity choices such as jurisdiction or course profile. Personalization is never inferred from `contains` or `requires`. Selectable options always come from the latest backend state as opaque IDs. Course profiles apply per subject so Mathematik LK and Physik GK can coexist.

### Learning scope and focus {unnumbered=true}

*DE: Lernumfang und Fokus* — see [Behavioral Integration of the MCP Coach](repo:docs/concept/runtime-workflows/openai-mcp-coach-behavioral-integration.md)

Two levels the coach must keep apart:

- **Learning scope:** the committed Personal Curriculum for this learner.
- **Focus (Level 3a):** the currently selected subtree or learning corridor (`plannedGoals`) from which frontier and goal options are drawn. Once the Personal Curriculum is complete, focus is never empty: without a valid explicit selection, the highest first visible root is chosen deterministically. A year or phase may bound focus without becoming a goal.

Frontier and goal recommendations are offered only once scope and focus are resolved.

### Active goal {unnumbered=true}

*DE: aktives Ziel* — see [Learning Workflow](repo:docs/concept/runtime-workflows/learning-workflow.md)

Exactly one backend-confirmed atomic goal (**Level 3b**) currently worked on in UI and coach. Normally drawn from the frontier; for a non-frontier selection, the system diagnoses missing prerequisites rather than silently bypassing them.

### Frontier {unnumbered=true}

*DE: Frontier, nächste erreichbare Lernziele* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

The set of not-yet-mastered **atomic** goals whose effective prerequisites are all satisfied — the didactic zone of proximal development, deterministically computed from the graph rather than guessed by the AI.

### Satisfaction {unnumbered=true}

*DE: Erfüllung* — see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)

$\mathrm{Sat}(g)$ holds iff the atomic basis of $g$ is non-empty and fully mastered. An atomic goal is satisfied iff it is mastered; a cluster iff all its atomic descendants are mastered.

### Optimistic mode {unnumbered=true}

*DE: optimistischer Modus* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Filter to the selected view scope first (including explicit `prerequisiteOnly` foundations), then evaluate prerequisites. Learners can start directly in their chosen scope without being globally blocked by gaps from earlier years. This is the default mode.

### Strict mode (pessimistic mode) {unnumbered=true}

*DE: strikter Modus, pessimistischer Modus* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Candidates still come from the filtered scope, but prerequisites are enforced globally across the entire graph. Used diagnostically to surface missing foundations outside the active filter (`strictMode`).

### Missing prerequisites {unnumbered=true}

*DE: fehlende Voraussetzungen* — see [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

The unsatisfied effective prerequisites of a goal, split into gaps inside and outside the active filter — the diagnostic answer to "why is this goal still locked?".

### Mastery {unnumbered=true}

*DE: Beherrschung; Lernziel geschafft oder noch nicht geschafft* — see [Learning Workflow](repo:docs/concept/runtime-workflows/learning-workflow.md) and [Implicit Mastery](repo:docs/concept/skill-graph/assessment-gated-completion.md)

The single stored outcome for an atomic goal: **mastered or not mastered** (encodable as `0` and `1`, without intermediate partial grades or extra qualification tiers). Mastery belongs to stable goal IDs and applies globally across composition views. Cluster or subject progress is the weighted share of unique mastered atomic goals.

The binding 4 November 2026 concept adds **effective mastery** $M_{\mathrm{eff}} = M \cup I$, where $I$ is derived recognition of ordinary competencies through independent application in valid local assessment contracts. Exam and memory goals never enter $I$. Runtime adaptation to this extended contract remains pending.

### Curriculum timeline and pacing plan {unnumbered=true}

*DE: Curriculum-Zeitachse, Curriculum-Zeitplan, Stoffverteilungsplan* — see [Curriculum Timeline, Buffer Planning, and Target-vs-Actual Pacing](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)

A versioned execution-plan overlay assigning resolved curriculum clusters to concrete local date ranges and teaching capacity for a class or learner. It owns calendar, buffer, plan blocks, and revisions without ever writing dates into canonical goals, program units, placements, or composition views.

### Planning unit {unnumbered=true}

*DE: Planungseinheit* — see [Curriculum Timeline, Buffer Planning, and Target-vs-Actual Pacing](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)

A plan-local unit used to distribute expected curriculum progress across available time capacity (transparent baseline: one unit per schedulable atomic target). It is neither a grade nor canonical `weight`; baseline mastery before plan start does not count as newly learned planning units.

### Plan milestone {unnumbered=true}

*DE: Planmeilenstein, konkretes Ziel bis Datum* — see [Curriculum Timeline, Buffer Planning, and Target-vs-Actual Pacing](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)

A dated commitment such as "complete the selected Mathematics Abitur tasks by 15 March". It separates subject-matter kind from deadline rigidity and scheduled workload from mastery-derived completion, driving dated goal lists, forecasts, and replanning without creating mastery on its own.

### Course plan status snapshot {unnumbered=true}

*DE: Kurs-Planlage, Plan-und-Planlage-Seite* — see [Curriculum Timeline, Buffer Planning, and Target-vs-Actual Pacing](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)

A digest-bound as-of read model of one plan revision showing textual course plan, planned block progress, confirmed teaching coverage, and separately labeled mastery distribution with input-data quality. It introduces no new source of truth alongside plan and mastery data.

### Learning velocity {unnumbered=true}

*DE: Lerngeschwindigkeit* — see [Learning Velocity](repo:docs/concept/didactic/learning-velocity.md)

The observed rate of atomic goals becoming mastered over time. The Cockpit chart counts recorded completions per calendar week; a bound pacing plan compares newly achieved planning units per effective teaching week against its target curve. Neither form is a grade or learner ranking.

### Autopilot {unnumbered=true}

*DE: Autopilot* — see [Frontier Goal Selection Strategies & Autopilot](repo:docs/concept/didactic/frontier-goal-selection-strategies-autopilot.md)

An opt-in mode that automatically activates the first entry of the strategy-ordered next-steps list once the active goal reaches mastered state.

### Selection strategy {unnumbered=true}

*DE: Auswahlpriorisierung* — see [Frontier Goal Selection Strategies & Autopilot](repo:docs/concept/didactic/frontier-goal-selection-strategies-autopilot.md)

How frontier goals are ordered: `Random` for variety across topic areas, `Sequential` for linear progression along the curriculum structure. Stored per learner alongside autopilot and `strictMode`.

---

## Coach, session, and identity {#sec:coach-session-identity}

### SkillPilot ID {unnumbered=true}

*DE: SkillPilot-ID* — see [Quickstart](repo:docs/quickstart/story.de.md)

The learner's permanent, pseudonymous key to their learning profile — requiring no registration with name or email address. The permanent SkillPilot ID stays strictly backend-only and never appears as a tool argument, tool result, or chat content.

### Learning session {unnumbered=true}

*DE: Lernsession* — see [OAuth and Learner Session Architecture](repo:docs/concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)

An opaque, randomly generated key with an absolute 24-hour lifetime addressing the exact learner context confirmed by **Start learning** (*Lernen starten*). Every start creates a fresh session; the adapter passes it unchanged on every learner-specific tool call.

### OAuth app binding {unnumbered=true}

*DE: OAuth-Verbindung* — see [OpenAI MCP Client Binding](repo:docs/security/openai-mcp-client-binding.md)

The revocable OAuth authorization authenticating an approved provider integration against the backend. It authenticates the **integration**, not the learner: OAuth alone neither selects a learner profile nor creates a learning session.

### SkillPilot Lerncoach {unnumbered=true}

*DE: SkillPilot Lerncoach* — see [ChatClient/Backend Communication Contract](repo:docs/concept/runtime-workflows/provider-neutral-coach-boundary.md)

The AI-facing dialogue layer turning backend state into a learning conversation. The coach leads the dialogue; the backend decides authoritatively on learning state, active filters, allowed transitions, and reachable next steps.

### Cockpit {unnumbered=true}

*DE: Cockpit* — see [Quickstart](repo:docs/quickstart/story.de.md)

The SkillPilot web surface displaying learning map, progress, learning-plan status, and SRS flashcard practice. Cockpit and coach operate on the same backend learning state; the unaided recall test (*Verified Recall*) is graded through the coach flow rather than the Cockpit drill.

### Safe state projection {unnumbered=true}

*DE: sichere Zustandsprojektion* — see [ChatClient/Backend Communication Contract](repo:docs/concept/runtime-workflows/provider-neutral-coach-boundary.md)

The rule that only an explicitly allowlisted, data-minimized projection of learner state crosses the provider boundary. Internal identities, secrets, and private file paths are stripped before anything reaches model, chat, or widget.

### Provider-neutral boundary {unnumbered=true}

*DE: providerneutrale Grenze* — see [ChatClient/Backend Communication Contract](repo:docs/concept/runtime-workflows/provider-neutral-coach-boundary.md)

The strict separation between the shared SkillPilot domain core and provider-specific adapters. Domain rules, exam authorization, and state projection live in the shared core so adding or replacing an AI provider never forks learning logic.
