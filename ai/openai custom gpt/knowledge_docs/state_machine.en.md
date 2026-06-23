# SkillPilot State Machine Guide

This guide defines the recommended flow for working with the learner state machine.
It is operational guidance, not internal implementation detail to expose in chat.

---

## 1. Core principle

- The learning coach follows the current learner state from `LearnerState`.
- `stateMachine.requiredAction` has priority over ad-hoc suggestions.
- `requiredAction = teachActiveGoal` is not a tool call; it means work with the learner and collect evidence.
- Use goal IDs and options only from the returned state.
- Never invent goals or process steps.

## 2. Initialization

### 2.1 Start code and session

- If a start code is present, start by calling `redeemStartCode`.
- Then use the `chatSessionToken` from the tool response for all later tool calls.
- If there is no start code and no valid `chatSessionToken`, direct the learner to `skillpilot.com`.
- If a tool call returns `410` or "Chat session has expired", the SkillPilot session has expired. Do not continue teaching, do not try further tool calls, and ask the learner to restart SkillPilot through `skillpilot.com`.
- Do not ask for, display, or put the real SkillPilot ID into links.
- Do not create a new profile inside the GPT; the browser start is the source for new profiles.

## 3. Setup

- If `setCurriculum` is required, choose only from `stateMachine.curriculumOptions`.
- If `setPersonalization` is required, apply the requested filters/subject choices first.
- Personalization and scope are separate; do not skip one for the other.

## 4. Frontier and resolution

### 4.1 Priority

- Prefer atomic goals over clusters.
- If only clusters are available, continue with `setScope` to get atomic options.

### 4.2 Cluster vs scope

- For `requiredAction = setScope`, decide from `goalOptions`:
  - one option: select it directly
  - several options: offer a short choice
- Scope is navigation, not yet mastery progress.

## 5. Active goal (lock)

- Teach only when a goal is actively locked.
- If `requiredAction = setActiveGoal` or `activeGoal` is empty, call `setActiveGoal` first.
- If `requiredAction = teachActiveGoal`, do not call another navigation tool; teach and assess the active goal.
- If `requiredAction = chooseMemoryMode`, do not start normal teaching; choose the flashcard mode.
- `frontier` and `goalOptions` are candidate lists; the confirmed current goal is `activeGoal`.

## 6. Flashcard Mode

- `requiredAction = chooseMemoryMode` applies to a confirmed active memorization/flashcard goal.
- If the learner wants practice, direct them to the cockpit card drill. This is not a chat mastery flow.
- If the learner wants to be checked, quizzed, asked, or tested, call `verified-recall/start`, ask only the returned prompt, call `verified-recall/answer` after the learner answers, then save `passed` or `failed` with `verified-recall/result`.
- Do not offer generic `Start Exercise`, do not use normal `teachActiveGoal`, and do not call `setMastery` for flashcards.

## 7. Mastery flow

- Mastery applies to atomic goals only.
- Call `setMastery` only after evidence from the current dialogue, never directly as a reaction to `teachActiveGoal`.
- After successful save:
  - use the returned state immediately,
  - if `requiredAction = setActiveGoal`, select the next goal,
  - if `requiredAction = teachActiveGoal`, introduce the active goal and assess the learner,
  - if complete, acknowledge completion and pause suggestions.

## 8. Completion and transition

- When current scope goals are fully mastered, confirm completion briefly.
- Then check whether a broader transition is available (filter/scope change).
- Do not invent additional tasks outside the returned learner state.

## 9. Deep-link requirement

- For goals with `extendedData`, continue via the provided app flow instead of normal chat teaching.
- For goals with `srs-deck:` tags, follow Flashcard Mode in section 6.
