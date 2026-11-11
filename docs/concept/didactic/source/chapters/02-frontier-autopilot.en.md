## Frontier Goal Selection Strategies and Autopilot {#sec:frontier-autopilot}

This chapter specifies how SkillPilot orders available next goals on the learner's frontier and how the optional **Autopilot** mode transitions between goals.

### Frontier goal selection strategies {#sec:selection-strategies}

Once the backend determines the valid frontier (`stateMachineOptions`) from the skill graph, personal curriculum scope, and mastery state, selection strategies order those candidate goals to match different study habits.

#### Strategy 1: Random (*Abwechslung*)

- **Concept:** Introduces variety by shuffling the currently reachable frontier goals.
- **Use case:** Suited to learners who want interleaved practice across topics or want to avoid fatigue from staying in a single branch too long.
- **Implementation:** The backend supplies the valid `stateMachineOptions` set; the client shuffles the list deterministically (or on refresh) to present a varied selection without violating `requires` prerequisites.

#### Strategy 2: Sequential (*Schritt für Schritt*)

- **Concept:** Follows a structured progression along the curriculum tree.
- **Use case:** Suited to learners who prefer completing one topic cluster cleanly before moving to the next branch.
- **Implementation:** Candidate goals are ordered by their hierarchical tree position (tree index / stable goal order), prioritizing sibling goals within the current branch before advancing to subsequent branches.

### Autopilot mode {#sec:autopilot-mode}

Autopilot reduces navigation friction by automatically advancing the learner to the next eligible frontier goal when the current goal is completed.

#### Runtime behavior

- **Trigger:** Fires when the current `activeGoal` transitions to the **Mastered** state.
- **Selection:** Picks the **first** goal from the valid frontier after applying the configured selection strategy (*Random* or *Sequential*). When an active learning plan governs progression (see @ref{sec:existing-learner-setup}), plan handoff rules take precedence and generic Autopilot is suppressed.
- **Action:** Invokes `setActiveGoal(nextGoalId)` automatically without requiring manual tree selection.

#### Configuration and persistence

- **UI:** Configured in the *Mein Lehrplan* (*Personal Curriculum*) settings modal.
- **Persistence:** Stored on the backend `Learner` entity (`learningStrategy`, `autoPilot`, `strictMode`, `showGoalVisualizationsInChat`) so preferences persist across sessions and devices.
- **API:** Updated via `PUT /api/ui/learners/{skillpilotId}/preferences` using a partial JSON payload (`learningStrategy`, `autoPilot`, `strictMode`, `showGoalVisualizationsInChat`); omitted fields keep their persisted values.
- **Strict-mode interaction:** `strictMode` determines whether frontier prerequisites are checked only within the active scope (*optimistic*) or across the complete global prerequisite closure (*strict*; see [Context and Views](repo:docs/concept/skill-graph/context-and-views.en.md)).
