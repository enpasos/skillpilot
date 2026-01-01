# Learner State Machine

```mermaid
stateDiagram-v2
    direction TB

    [*] --> NoID: Start
    
    state "No skillpilot_id" as NoID
    state "ID (No Curriculum)" as NoCurr
    state "ID + Selected Curriculum" as HasCurr

    NoID --> NoCurr: createLearner
    
    NoCurr --> HasCurr: setCurriculum
    
    state HasCurr {
        [*] --> Ready

        state "Ready / Learning Loop" as Ready
        state "Personalized" as Pers

        Ready --> Pers: setPersonalization (Optional)
        Pers --> Ready: (Applied)

        Ready --> Ready: setScope
        Ready --> Ready: setActiveGoal
        Ready --> Ready: setMastery
        Ready --> Ready: getLearnerState
        Ready --> Ready: getFrontier

        state Ready {
            [*] --> Frontier
            state "Frontier holen" as Frontier
            state "Lernziel bestimmen (atomar)" as SelectGoal
            state "Lehren + Verifizieren" as Teach
            state "Mastery speichern" as SaveMastery

            Frontier --> SelectGoal: getLearnerState/getFrontier
            SelectGoal --> Teach: setActiveGoal (atomic)
            Teach --> SaveMastery: setMastery (success)
            Teach --> SelectGoal: user redirects / setActiveGoal
            Teach --> Frontier: refresh state if unclear
            SaveMastery --> Frontier: returns new frontier
        }
    }

    HasCurr --> HasCurr: setCurriculum (Switch Context)
```

## Reflection on Implementation Alignment

This document compares the visual state machine diagram with the current backend implementation in `LearnerService.java`.

### ✅ Alignment

The implementation largely matches the flow depicted in the diagram:

1.  **Initialization**:
    - `createLearner` transitions the state from **"no skillpilot_id"** to **"ID but no selected_curriculum"**.

2.  **Mandatory Curriculum**:
    - If no curriculum is selected, the `stateMachine.requiredAction` is `setCurriculum`.
    - This enforces the transition from **State 2** to **State 3** ("ID + selected_curriculum").

3.  **The Core Loop**:
    - Once a curriculum is selected, the core actions (`setScope`, `setMastery`, `getLearnerState`) become available. The learning loop now formalizes: **fetch frontier → select atomic goal → teach/verify → save mastery → new frontier**.

### 💡 Observation: Personalization Flexibility

The diagram depicts a linear path:
`Select Curriculum` → `Personalize` → `Main Loop`

The current code implementation is **more flexible**:

-   **Optional Personalization**: Once a curriculum is selected, `stateMachine.requiredAction` will move from `setCurriculum` to either `setScope`/`setActiveGoal` depending on the available options, while `nextAllowedActions` still lists all allowed calls.
-   This means the AI Agent *can* choose to personalize (State 3 → 4), but it is not forced to. It can skip directly to setting a scope or starting the teaching loop (State 3 → Loop).
-   **Context Switching**: The `updateCurriculum` action can be called at any time (from State 3 or 4) to switch context. The code supports this, effectively resetting the "active" personalization context (since personalization is stored per-landscape).

### Conclusion

The implementation supports the strict flow shown in the diagram but allows for an optimized path where personalization is optional, providing greater flexibility for the AI Agent.

## Personalization vs Scope (Agent Interpretation)

- **Personalization** = choose the personal curriculum (subjects, GK/LK, level/track filters). It shrinks the overall goal set.
- **Scope** = choose a topical focus or cluster inside the personalized curriculum. It does not replace filters.
- If `requiredAction` is `setPersonalization`, do **not** call `setScope`.

## Learning Loop Rules (Agent Contract)

- Always pick **one atomic goal** from `frontierAtomic` (fallback: `frontier`) before teaching.
- **Goal lock**: stick to that goal until `setMastery` succeeds or the user explicitly redirects.
- After `setMastery`, immediately use the **new frontier** to select the next atomic goal.

## Backend StateMachine Output

The backend returns a `stateMachine` object in learner responses. It contains:
- `state`: high-level state (SETUP, FRONTIER, TEACHING)
- `requiredAction`: the **single** action the agent must perform next
- `goalOptions` / `curriculumOptions`: the content choices for that action

Agents should follow `stateMachine.requiredAction` strictly and use the provided options.
