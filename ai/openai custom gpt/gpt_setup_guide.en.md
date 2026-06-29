# SkillPilot Learning Coach Setup Guide

This file documents how to configure a custom GPT in ChatGPT so it can act as the **SkillPilot Learning Coach**.

The goal: a GPT that starts from a browser-generated SkillPilot start code, redeems it into a chat session, guides learners through the SkillPilot competence graph, and updates mastery via `setMastery`.

---

## 1. Prerequisites

- You have access to the GPT builder ("Create → New GPT").
- You have the **Optimized OpenAPI JSON** ready (provided at the bottom of this file).

---

## 2. Creating the SkillPilot Learning Coach in the GPT builder

Open **Create → New GPT → Configure** and fill out the fields as follows.

### 2.1 Name and description

- **Name**
  ```text
  SkillPilot Learning Coach
  ```

  - **Description**
    ```text
    I'm your learning coach. To start, send the pre-filled prompt.
    ```

### 2.2 Instructions (System Instructions)

In the GPT builder, paste the **entire** content of `ai/openai custom gpt/system_instructions.en.md` into **Instructions** (plain text, unchanged).

*Note: These instructions are critical for ensuring the AI uses start codes and chat session tokens correctly and understands the difference between Frontier and Planned goals.*

-----

### 2.3 Conversation Starters

Do not configure conversation starters. The session starts only via the prompt with start code pre-filled by `skillpilot.com`.
-----  

### 2.4 Quick sanity check

After setup, send a message that contains a start code, e.g. `Start SkillPilot with start code: SP-ABCD-EFGH`.

Expected behavior:
- The assistant **calls `redeemStartCode` immediately** and only responds **after** the result is available.
- No placeholder text like "I'm loading..." or a follow-up nudge from the user.
- No question for a SkillPilot ID.
- No `createLearner` call inside the GPT.
- Follow-up calls use the returned `chatSessionToken`.

If it waits for a "ping", the system instructions or actions are not correctly wired.

Additional check after a successful mastery:
- The GPT must **not** merely say “New learning goal: ...” in plain text.
- Either the tool response already returns that goal in `activeGoal`, or the GPT must call `setActiveGoal` first.
- If only `goalOptions`/frontier candidates are present, they are **not yet** confirmed current goals.

Additional check for goal images:
- Directly after `redeemStartCode`: if `assistantNextMessageMarkdown` is set, the GPT must output it verbatim as the first visible line. Otherwise follow `assistantDisplayInstruction` without displaying it, then output `mandatoryFirstAssistantLineMarkdown` or `assistantResponsePrefixMarkdown` first.
- If `state.stateMachine.activeGoalVisualizationMarkdown` or `stateMachine.activeGoalVisualizationMarkdown` is set, the GPT must output that Markdown image line verbatim first when entering `teachActiveGoal`.
- Fallback: if a confirmed `activeGoal` contains `type=goal-visualization` and `resourceType=image` in `resourceLinks`, the GPT shows one Markdown image; it prefers `role=primary` and uses `altText`.

## 3. Knowledge: attaching knowledge_docs

In the **Knowledge** section of the GPT builder:

1.  Click **"Upload files"**.
2.  Upload all knowledge_docs from this repository.

The GPT will consult these files to understand the pedagogical "Training Loop".

-----

## 4. Actions: The Optimized Schema

In the **Actions** section:

1.  Click **"Create new action"**.
2.  **Authentication:** API Key (Bearer). Use the same value as `skillpilot.ai.api-key` on the backend.
3.  **Schema:** **Do not use the URL import.** Instead, copy and paste the **Optimized JSON** below directly into the schema box. This version contains specific instructions for the AI (start code -> chat session token -> learner state) that are missing from the raw server export.

*(See Section 7 for the JSON content)*

-----

## 5. Model choice

  - **Recommended Model:** **GPT-4o** (or **GPT-5.1**, if available).
      - These models follow the multi-step start code -> chat session -> state -> mastery -> next active-goal flow much more reliably.
  - **Not recommended for this flow:** fast Instant/Mini variants such as **GPT-5.3 Instant**.
      - Typical failure mode: the model narrates a “next goal” in plain text instead of performing the required tool call first.

-----

## 6. How the SkillPilot Learning Coach and SkillPilot API work together

End-to-end flow for a typical learner session:

1.  **Init:** The learner starts on `skillpilot.com`. The browser creates or loads the local SkillPilot ID and asks the backend for a short-lived start code.
2.  **Redeem:** The GPT receives a prompt like `Start SkillPilot with start code: SP-ABCD-EFGH` and immediately calls `redeemStartCode`.
3.  **Session:** The GPT stores the returned `chatSessionToken` internally and uses it for every later action. It does not ask for or display the real SkillPilot ID.
    If a later session call returns `410` / "Chat session has expired", the GPT must stop and tell the learner to restart through `skillpilot.com` to get a new start code.
4.  **Bootstrap:** It reads `stateMachine.requiredAction` from the redeemed state. If `setCurriculum` is required, it asks the user to choose from `stateMachine.curriculumOptions` and calls `setCurriculum`.
5.  **Context:** It uses the state returned by `redeemStartCode` or `getLearnerState` to get Curriculum, Frontier, Goals, and `stateMachine` immediately.
6.  **Discovery:** It looks at `frontier` and selects goals with `type=atomic`. If only clusters are present, call `setScope` to drill down.
7.  **Personalization:** If `stateMachine.requiredAction` is `setPersonalization` (e.g. Standard/Advanced track or subject/level filters are needed), ask for the missing preference and call `setPersonalization`.
8.  **Scope:** If the user has a specific topic goal ("I want to learn Calculus/Analysis"), call `setScope` to focus the plan.
9.  **Lock Goal:** It calls `setActiveGoal` for the chosen atomic goal.
10. **Flashcards:** If `stateMachine.requiredAction` is `chooseMemoryMode`, the backend reports hard-testable cards for today; do not offer generic "Start Exercise". For practice, send the learner to the cockpit card drill. For "check me", "quiz me", "test me", "ask me", or similar, call `verified-recall/start` with the cockpit batchSize if present, ask returned `cards` as a numbered batch, call `verified-recall/answer` after the learner answers, then save `passed` or `failed` for each card with `verified-recall/result`. If `status=waiting`, reload state; the backend will no longer offer that flashcard goal until hard verification is available again.
11. **Teaching:** If `stateMachine.requiredAction` is `teachActiveGoal`, this is a conversational teaching/checking step, not a tool call. If `assistantNextMessageMarkdown` is present, output it before teaching. Otherwise follow `assistantDisplayInstruction` but do not display it. If `mandatoryFirstAssistantLineMarkdown`, `assistantResponsePrefixMarkdown`, `state.stateMachine.activeGoalVisualizationMarkdown`, or `stateMachine.activeGoalVisualizationMarkdown` is present, the GPT outputs that Markdown image line before teaching; otherwise it falls back to the primary `goal-visualization` image in `activeGoal.resourceLinks`. It teaches the locked goal and does exercises, but without front-loading the exact sample solution for the very next task. Unusual learner solutions must be reconstructed before correction so valid creative strategies are not missed; wrong or unjustified steps remain wrong and must be rejected clearly. At least one answer must require transfer or a second independent check. If the goal has multiple clearly named aspects, all of them must be checked.
12. **Mastery:** Only after demonstrated competence in the current dialogue, it calls `setMastery` with the `goalId` of the active goal. If competence is not verified, it must **not** call `setMastery`. Mere repetition of the learning coach's own wording is not enough, and partial coverage of a multi-aspect goal is not enough either. This returns the **new** frontier immediately.
13. **Loop:** It follows the returned state. If a new active goal is already present, introduce it and ask the learner; never mark it mastered without fresh evidence.

-----

## 7. Optimized API Schema (Copy this into ChatGPT)

see ../skillpilot-api-4ai.en.json
