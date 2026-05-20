# SkillPilot GPT Setup Guide

This file documents how to configure a custom GPT in ChatGPT so it can act as a **SkillPilot trainer**.

The goal: a GPT that starts from a browser-generated SkillPilot start code, redeems it into a chat session, guides learners through the SkillPilot competence graph, and updates mastery via `setMastery`.

---

## 1. Prerequisites

- You have access to the GPT builder (“Create → New GPT”).
- You have the **Optimized OpenAPI JSON** ready (provided at the bottom of this file).

---

## 2. Creating the SkillPilot Trainer GPT

Open **Create → New GPT → Konfigurieren** and fill out the fields as follows.

### 2.1 Name and description

- **Name**
  ```text
  SkillPilot GPT
  ```

  - **Beschreibung**
    ```text
    Ich bin Dein Lerntrainer. Schick zum Start den voreingestellten Prompt ab.
    ```

### 2.2 Hinweise (System Instructions)

In the GPT builder, paste the **entire** content of `ai/openai custom gpt/system_instructions.de.md` into **Hinweise** (plain text, unchanged).

*Note: These instructions are critical for ensuring the AI uses start codes and chat session tokens correctly and understands the difference between Frontier and Planned goals.*

-----

### 2.3 Gesprächsaufhänger

Keine Gesprächsaufhänger konfigurieren. Der Start erfolgt ausschließlich über den von `skillpilot.com` vorbelegten Prompt mit Startcode.
-----  

### 2.4 Quick sanity check

After setup, send a message that contains a start code, e.g. `Starte SkillPilot mit Startcode: SP-ABCD-EFGH`.

Expected behavior:
- The assistant **calls `redeemStartCode` immediately** and only responds **after** the result is available.
- No placeholder text like "Ich lade..." or a follow-up nudge from the user.
- No question for a SkillPilot-ID.
- No `createLearner` call inside the GPT.
- Follow-up calls use the returned `chatSessionToken`.

If it waits for a "ping", the system instructions or actions are not correctly wired.

Zusatzcheck nach einer erfolgreichen Mastery:
- Das GPT darf **nicht** nur textlich „Neues Lernziel: ...“ sagen.
- Entweder der Tool-Response liefert dieses Ziel bereits in `activeGoal`, oder das GPT muss zuerst `setActiveGoal` ausführen.
- Wenn nur `goalOptions`/Frontier-Kandidaten vorliegen, sind das **noch keine** bestaetigten aktuellen Ziele.

## 3. Knowledge: attaching knowledge_docs

In the **Wissen** section of the GPT builder:

1.  Click **„Datei hochladen“**.
2.  Upload all `knowledge_docs` from this repository.

The GPT will consult these files to understand the pedagogical "Training Loop".

-----

## 4. Actions: The Optimized Schema

In the **Aktionen** section:

1.  Click **"Create new action"**.
2.  **Authentication:** API Key (Bearer). Use the same value as `skillpilot.ai.api-key` on the backend.
3.  **Schema:** **Do not use the URL import.** Instead, copy and paste the **Optimized JSON** below directly into the schema box. This version contains specific instructions for the AI (start code -> chat session token -> learner state) that are missing from the raw server export.

*(See Section 7 for the JSON content)*

-----

## 5. Model choice

  - **Empfohlenes Modell:** **GPT-4o** (oder **GPT-5.1**, falls verfuegbar).
      - Diese Modelle folgen dem mehrstufigen Tool-Flow fuer Startcode -> Chat-Session -> State -> Mastery -> neues Active Goal deutlich stabiler.
  - **Nicht empfohlen fuer diesen Flow:** schnelle Instant-/Mini-Modelle wie **GPT-5.3 Instant**.
      - Typischer Fehler: Das Modell formuliert ein „naechstes Lernziel“ nur textlich, statt vorab den erforderlichen Tool-Call auszufuehren.

-----

## 6. How the GPT and SkillPilot API work together

End-to-end flow for a typical learner session:

1.  **Init:** The learner starts on `skillpilot.com`. The browser creates or loads the local SkillPilot-ID and asks the backend for a short-lived start code.
2.  **Redeem:** The GPT receives a prompt like `Starte SkillPilot mit Startcode: SP-ABCD-EFGH` and immediately calls `redeemStartCode`.
3.  **Session:** The GPT stores the returned `chatSessionToken` internally and uses it for every later action. It does not ask for or display the real SkillPilot-ID.
4.  **Bootstrap:** It reads `stateMachine.requiredAction` from the redeemed state. If `setCurriculum` is required, it asks the user to choose from `stateMachine.curriculumOptions` and calls `setCurriculum`.
5.  **Context:** It uses the state returned by `redeemStartCode` or `getLearnerState` to get Curriculum, Frontier, Goals, and `stateMachine` immediately.
6.  **Discovery:** It looks at `frontier` and selects goals with `type=atomic`. If only clusters are present, call `setScope` to drill down.
7.  **Personalization:** If `stateMachine.requiredAction` is `setPersonalization` (e.g. GK/LK or subject/level filters are needed), ask for the missing preference and call `setPersonalization`.
8.  **Scope:** If the user has a specific topic goal ("I want to learn Stochastik/Analysis"), call `setScope` to focus the plan.
9.  **Lock Goal:** It calls `setActiveGoal` for the chosen atomic goal.
10. **Teaching:** If `stateMachine.requiredAction` is `teachActiveGoal`, this is a conversational teaching/checking step, not a tool call. It teaches the locked goal and does exercises, but without front-loading the exact sample solution for the very next task. Unusual learner solutions must be reconstructed before correction so valid creative strategies are not missed; wrong or unjustified steps remain wrong and must be rejected clearly. At least one answer must require transfer or a second independent check. If the goal has multiple clearly named aspects, all of them must be checked.
11. **Mastery:** Only after demonstrated competence in the current dialogue, it calls `setMastery` with the `goalId` of the active goal. If competence is not verified, it must **not** call `setMastery`. Mere repetition of the trainer's own wording is not enough, and partial coverage of a multi-aspect goal is not enough either. This returns the **new** frontier immediately.
12. **Loop:** It follows the returned state. If a new active goal is already present, introduce it and ask the learner; never mark it mastered without fresh evidence.

-----

## 7. Optimized API Schema (Copy this into ChatGPT)

siehe ../skillpilot-api-4ai.de.json
