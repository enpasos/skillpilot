# Proof of Concept: "English Foundation" & SRS Integration

This document outlines the conceptual framework for the **"English Foundation" Proof of Concept (PoC)**, which demonstrates the integration of **Spaced Repetition Systems (SRS)** into SkillPilot's competence-based learning architecture.

## 1. The Challenge
SkillPilot's core strength is its **Competence Tree**, which excels at modeling **understanding-driven** goals (concepts, reasoning, problem-solving). However, language learning and other domains require a significant amount of **rote memorization** (vocabulary, formulas, dates) which cannot be effectively managed by a static dependency tree alone.

## 2. Core Concept: "The Two Loops"

The PoC implements a hybrid model that merges two distinct learning loops, allowing for both strategic oversight and tactical efficiency.

### A. The Competence Loop (Strategic)
*   **Role:** Manager & Planner.
*   **Mechanism:** The Competence Tree (`EnglishFoundation.json`).
*   **Function:** Defines **WHAT** to learn (e.g., "Vocabulary: Top 400") and tracks overall **Mastery** (0-100%).
*   **Integration:** Goals requiring memorization are tagged (e.g., `srs-deck:vocab_400`). This signals the system to delegate the learning process to the SRS engine.

### B. The Memorization Loop (Tactical / SRS)
*   **Role:** Coach & Drill Sergeant.
*   **Mechanism:** The Flashcard Drill (SM-2 Algorithm).
*   **Function:** Defines **HOW** to learn. It schedules reviews to maximize retention and minimize time spent.
*   **Logic:**
    *   **Algorithm:** SM-2 (SuperMemo 2). Optimizes review intervals based on user feedback (Again, Hard, Good, Easy).
    *   **State:** Tracks computed metrics per card: `NextReviewDate`, `Interval`, `EasinessFactor`.

## 3. User Flow in the PoC

1.  **Context**: The user selects the **"English Foundation (PoC)"** curriculum.
2.  **Plan**: The user identifies the goal **"Vocabulary: Top 400"** as a prerequisite for the "Reader: My First Day" goal.
3.  **Action**: Clicking the "Vocabulary" goal detects the `srs-deck` tag and opens the **Flashcard Drill View** instead of the standard Goal Detail View.
4.  **Drill**: The user engages in an active recall session:
    *   *Front*: "Dog"
    *   *Back*: "Hund"
    *   *Rating*: User rates recall difficulty (Again/Hard/Good/Easy).
5.  **Result**:
    *   **Micro-Level**: The card's interval is updated (e.g., "See you in 3 days").
    *   **Macro-Level**: The mastery of the "Vocabulary" goal in the Competence Tree increases as more cards graduate to "Long Term Memory".

## 4. Technical Implementation (PoC Scope)

*   **Frontend-Driven**: For this PoC, the SRS logic (scheduling and state) is computed entirely in the client (`FlashcardDrill.tsx`).
*   **Persistence**: State is persisted in `localStorage` (`srs_state_eng_400`) to allow multi-session testing without backend schema changes.
*   **Data Source**: A static JSON file (`vocab_400.json`) serves as the immutable deck definition.
*   **Visual Integration**: The `LearnerView` was refactored into a split-pane layout to accommodate the interactive drill component alongside the navigation tree.

## 5. Strategic Value
This PoC proves that SkillPilot can support **heterogeneous learning types**. It is no longer limited to abstract competencies but can provide specific, optimized tools for rote learning tasks while maintaining the high-level semantic structure of the curriculum.
