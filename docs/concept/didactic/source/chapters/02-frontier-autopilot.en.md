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

#### Strategy 3: Unit by Unit (*Einheit für Einheit* — target default; `F13` pending)

- **Concept:** Follows declared subject learning units, plan units, and their sibling `after` order ([Graph Definition §11.5](repo:docs/concept/skill-graph/learning-unit-progression.md#sec-unit-by-unit)) without narrowing the computed frontier or introducing technical unit locks.
- **Use case:** Target default mode for learners who want to work through an opened unit coherently up to its assessments before moving on to the next unit.
- **Proposed selection (`F13` pending).** Descent from the root considers children with a reachable goal in `stateMachineOptions`. An already started child unit that is up next according to sibling order and subject dependencies has priority. Other children that are up next follow, then other started units, then remaining candidates. Under the contract in force since 4/11 November, completion is based on effectively mastered atoms, including explicitly required assessments and memory goals. Learner choice and an active plan take precedence. Orientation rules apply at first entry.

**Under discussion.** In the proposal of 19 November, a learner can deliberately start a unit with outstanding prerequisites. That choice applies only to entry into that unit. For the next guided recommendation, the backend would still check direct and transitive prerequisites in the selected focus mode. It could draw on individually demonstrated goals ($M$) and whole content goals released by their fully demonstrated owning unit versions after subject review ($F_{\mathrm{plan}}$). [Proposed frontier](repo:docs/concept/skill-graph/assessment-gated-completion.md#sec-proposal-planning-release)

### Autopilot mode {#sec:autopilot-mode}

Autopilot reduces navigation friction by automatically advancing the learner to the next eligible frontier goal when the current goal is completed.

#### Runtime behavior

- **Trigger:** Fires when the current `activeGoal` transitions to the **Mastered** state.
- **Selection:** Picks the **first** goal from the valid frontier after applying the configured selection strategy (*Random*, *Sequential*, or target default *Unit by Unit*). When an active learning plan governs progression (see @ref{sec:existing-learner-setup}), plan handoff rules take precedence and generic Autopilot is suppressed.
- **Action:** Invokes `setActiveGoal(nextGoalId)` automatically without requiring manual tree selection.

#### Configuration and persistence

- **UI:** Configured in the *Mein Lehrplan* (*Personal Curriculum*) settings modal.
- **Persistence:** Stored on the backend `Learner` entity (`learningStrategy`, `autoPilot`, `strictMode`, `showGoalVisualizationsInChat`) so preferences persist across sessions and devices.
- **API:** Updated via `PUT /api/ui/learners/{skillpilotId}/preferences` using a partial JSON payload (`learningStrategy`, `autoPilot`, `strictMode`, `showGoalVisualizationsInChat`); omitted fields keep their persisted values.
- **Strict-mode interaction:** `strictMode` determines whether frontier prerequisites are checked only within the active scope (*optimistic*) or across the complete global prerequisite closure (*strict*; see [Context and Views](repo:docs/concept/skill-graph/context-and-views.en.md)).
