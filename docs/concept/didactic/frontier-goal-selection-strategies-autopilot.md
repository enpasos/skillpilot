# Frontier Goal Selection Strategies & Autopilot

This document describes the frontier goal selection strategies and the "Autopilot" automated learning mode in SkillPilot.

## 1. Frontier Goal Selection Strategies (Auswahlpriorisierung)

The system offers different strategies for prioritizing the "Next Steps" (Frontier Goals) displayed to the learner. This helps cater to different learning styles and pacing preferences.

### Strategy 1: Random (Abwechslung)
-   **Concept**: Provides variety by shuffling the available next steps.
-   **Use Case**: Best for learners who want to explore different topics or avoid fatigue from staying in one domain too long.
-   **Implementation**:
    -   The backend provides the valid set of `stateMachineOptions`.
    -   The frontend shuffles this list deterministically (or randomly on refresh) to present a mixed set of options.

### Strategy 2: Sequential (Schritt für Schritt)
-   **Concept**: Follows a strict, linear progression based on the curriculum structure.
-   **Use Case**: Best for learners who prefer a structured path and want to "finish one topic" before moving to the next.
-   **Implementation**:
    -   The list is sorted by the goals' hierarchical position (Tree Index) or ID order.
    -   Sibling nodes are prioritized before moving to new branches.

## 2. Autopilot Mode

The Autopilot feature removes friction by automatically transitioning the learner to the best next goal upon completion of the current one.

### Behavior
-   **Trigger**: When the current `activeGoal` transitions to **Mastered** state.
-   **Selection**: The system picks the **first** goal from the "Next Steps" list, *after* applying the selected **Strategy**.
    -   If *Random*: Picks a random valid next step.
    -   If *Sequential*: Picks the logically next step in the curriculum.
-   **Action**: Automatically calls `setActiveGoal(nextGoalId)` without user intervention.

### Configuration
-   **UI**: These settings are available in the "Mein Lehrplan" (Personal Curriculum) modal.
-   **Persistence**: Settings are stored in the `Learner` backend entity (`learningStrategy`, `autoPilot`, `strictMode`, `showGoalVisualizationsInChat`) to persist across sessions and devices.
-   **API**: Preferences are updated via `PUT /api/ui/learners/{skillpilotId}/preferences` with a partial payload such as `{ "learningStrategy": "...", "autoPilot": true/false, "strictMode": true/false, "showGoalVisualizationsInChat": true/false }`; omitted fields keep their persisted value.
-   **Strict mode interaction**: `strictMode` controls whether frontier prerequisites are enforced only inside the filtered scope (optimistic) or globally (strict/pessimistic).
