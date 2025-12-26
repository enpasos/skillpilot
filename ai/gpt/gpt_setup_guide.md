# SkillPilot GPT Setup Guide

This file documents how to configure a custom GPT in ChatGPT so it can act as a **SkillPilot trainer**.

The goal: a GPT that guides learners through the SkillPilot competence graph, calls `getFrontier` to find the best next steps, and updates mastery via `setMastery`.

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
    Persönlicher Lerntrainer, der mit der SkillPilot-Lernlandkarte arbeitet, deinen aktuellen Wissensstand einschätzt und dir Schritt für Schritt passende Aufgaben vorschlägt.
    ```

### 2.2 Hinweise (System Instructions)

In the GPT builder, paste the **entire** content of `ai/gpt/system_instructions.md` into **Hinweise** (plain text, unchanged).

*Note: These instructions are critical for ensuring the AI uses UUIDs correctly and understands the difference between Frontier and Planned goals.*

-----

### 2.3 Conversation Starters

```text
Ich möchte mit Mathe in der Oberstufe starten. Ich bin ungefähr in Q1.
```

```text
Ich will Physik üben für meinen Physik Bachelor. 
```

```text
Ich will nach CEFR Französisch von Grund auf lernen.
```

-----  

### 2.4 Quick sanity check

After setup, send a message that contains a UUID.

Expected behavior:
- The assistant **calls the backend immediately** and only responds **after** the result is available.
- No placeholder text like "Ich lade..." or a follow-up nudge from the user.

If it waits for a "ping", the system instructions or actions are not correctly wired.

## 3. Knowledge: attaching knowledge_docs

In the **Wissen** section of the GPT builder:

1.  Click **„Datei hochladen“**.
2.  Upload the all knowledge_docs from this repository.

The GPT willconsult this file to understand the pedagogical "Training Loop".

-----

## 4. Actions: The Optimized Schema

In the **Aktionen** section:

1.  Click **"Create new action"**.
2.  **Authentication:** None (or API Key if you configured one).
3.  **Schema:** **Do not use the URL import.** Instead, copy and paste the **Optimized JSON** below directly into the schema box. This version contains specific instructions for the AI (like "Use UUIDs") that are missing from the raw server export.

*(See Section 7 for the JSON content)*

-----

## 5. Model choice

  - **Empfohlenes Modell:** **GPT-4o** (or GPT-5.1 if available).
      - This model follows the complex instruction to map UUIDs much better than smaller models.

-----

## 6. How the GPT and SkillPilot API work together

End-to-end flow for a typical learner session:

1.  **Init:** The GPT checks for a nickname and `skillpilotId`. If missing, it calls `createLearner` (optionally with a topic like "Math").
2.  **Context:** It calls `getLearnerState` (or uses the state from `createLearner`) to get the Curriculum, Frontier, Goals, and `stateMachine` immediately.
3.  **Discovery:** It looks at `frontierAtomic` first (fallback to `frontier`). These are the goals ready to be learned.
4.  **Personalization:** If `stateMachine.requiredAction` is `setPersonalization` (e.g. GK/LK or subject/level filters are needed), ask for the missing preference and call `setPersonalization`.
5.  **Scope:** If the user has a specific topic goal ("I want to learn Stochastik/Analysis"), call `setScope` to focus the plan.
6.  **Lock Goal:** It calls `setActiveGoal` for the chosen atomic goal.
7.  **Teaching:** It teaches that locked goal and does exercises.
8.  **Mastery:** After success, it calls `setMastery` **immediately** (no confirmation prompt). If competence is not verified, it must **not** call `setMastery`. This returns the **new** frontier immediately.
9.  **Loop:** It picks the next goal from `frontierAtomic`, locks it, and continues.

-----

## 7. Optimized API Schema (Copy this into ChatGPT)

siehe ../skillpilot-api-4ai.json
