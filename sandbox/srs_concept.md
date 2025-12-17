# Concept: Integrating Spaced Repetition System (SRS) into SkillPilot

## 1. Challenge & Objective
SkillPilot currently focuses on **competence mastery** (Understanding/Application), modeled as a dependency graph.
Vocabulary learning, however, requires **memorization** (Retention), which follows the "Forgetting Curve".

**Objective:**
enable learners to memorize ~400 vocabulary words efficiently using SRS, seamlessly integrated alongside the existing competence graph, while keeping server costs low and user experience high.

## 2. Approach Analysis: Flashcards vs. AI Tutor

The user raised a valid point: *Why use "Old School" Flashcards when we have an AI?*

| Feature | Classic Flashcards (UI) | Pure AI Tutor (Chat) | **SkillPilot Hybrid (Target)** |
| :--- | :--- | :--- | :--- |
| **Speed** | High (0.5s / word) | Low (2-5s latency) | **High** (Local logic) |
| **Flow** | High (Rhythm) | Interrupted by typing/waiting | **High** (Instant feedback) |
| **Context** | Low (Static) | High (Dynamic examples) | **High** (AI generates stories) |
| **Cost** | Zero | High (Tokens per word) | **Low** (Batch processing) |

### Recommendation: The "Two-Loop" System
We should NOT do "GPT tries to be Anki". It's too slow and expensive for simple memorization.
Instead, we combine them:

1.  **The "Gym" (Local / High-Speed)**:
    *   Pure memorization efficiency.
    *   Implementation: A sleek, minimal UI (could be chat-styled but purely client-side) to bridge the "Knowing" gap.
    *   *Purpose*: Get the word from "Unknown" to "Recognized".

2.  **The "Arena" (GPT / Context)**:
    *   Once a user "knows" a set of words in the Gym, the GPT is triggered.
    *   **Prompt**: "The user has just learned [word1, word2, ...]. Write a short story using ONLY these words + known grammar."
    *   *Purpose*: Deepen understanding and prove competence.

### 2.2 Bridging the UI Gap (The "Bruch")
**Constraint:** The AI lives in ChatGPT, the SRS Engine lives in the Web App.
**Strategy:** We embrace the break by making it a clear "Training Cycle".

1.  **Trigger (GPT)**: User asks "Train Vocab".
2.  **Handoff (GPT -> App)**: GPT replies: *"Time for your daily drill. Click here to open your [Vocabulary Gym](https://skillpilot.app/gym/daily)."*
3.  **The Workout (App)**: User clicks link, opens Web App, does 5 minutes of high-speed swiping. App syncs progress to backend.
4.  **Return (App -> GPT)**: App shows: *"Great job! 20 words learned. Go back to your AI Tutor for a story."*
5.  **Context (GPT)**: User returns. GPT (via Action) sees the new progress and generates the contextual story.

## 3. Data Architecture

### 2.1 The Hybrid Model
We distinguish between two types of Learning Goals:
1.  **Competence Node (Graph)**: "I understand the concept of Past Tense." (Evaluation: Pass/Fail or 0-100%).
2.  **Memory Item (SRS)**: "I know that 'to go' means 'gehen'." (Evaluation: Easy/Good/Hard/Again).

### 2.2 Storage Strategy (Scalability)
Storing every single review event for thousands of words on the server is expensive and slow.
**Solution: Client-Heavy, Server-Sync.**

*   **Client (Browser/App)**:
    *   Holds the full SRS state for the active curriculum (e.g., all 400 cards).
    *   Calculates the "Next Review Date" locally using an algorithm (e.g., SM-2 or FSRS).
    *   Immediate feedback loop (no server latency).
*   **Server (Database)**:
    *   Stores a **compressed blob** or simplified state per user/curriculum.
    *   Instead of `[Review1, Review2, ...]`, we store `List<{ wordId, interval, factor, nextReview }>`
    *   Sync happens:
        *   **On Load**: Fetch full state.
        *   **On Exit/Batch**: Every X minutes or after Y cards, push the updated state blob to the server.

## 3. Workflow Integration

### 3.1 Unlocking Vocabulary
Vocabulary isn't just a giant list. It's often tied to competence contexts.
*   **Contextual Unlock**: The "A1 Basics" competence node in the graph *contains* or *unlocks* the "Top 50 Structure Words" deck.
*   **Micro-Learning**: A user working on "Verbs" sees a "Practice Vocabulary" action available in that node.

### 3.2 The GPT Interaction (Traffic Optimization)
Using the GPT to quiz *every single word* one-by-one is inefficient (too many tokens, slow latency per word).
**GPT Role: The Orchestrator & Explainer.**

*   **Mode A: Fast Drill (The Native UI)** -> **Recommended**
    *   The "Drill" happens in a dedicated **Native UI Component** (not chat).
    *   The Web App renders the flashcards. User clicks "Show Answer" -> "Easy/Hard".
    *   Javascript handles the scheduling logic locally.
    *   **Traffic**: Zero calls to GPT/Server during the drill.

*   **Mode B: Deep Dive (The GPT)**
    *   If a user struggles with a word repeatedly in the Native UI, they can click "Ask AI".
    *   *Then* we send a prompt to GPT: "Explain the nuances of 'to get' implies getting vs becoming".
    *   GPT provides mnemonics or context examples.

## 4. Implementation Concept

### 4.1 Data Structure (JSON in Repo)
The vocabulary is static content. We store it in the codebase (e.g., `assets/vocab/english_400.json`).
```json
{
  "deckId": "eng_400_top",
  "cards": [
    { "id": "v001", "front": "to be", "back": "sein", "category": "structure" },
    { "id": "v002", "front": "to have", "back": "haben", "category": "structure" }
  ]
}
```

### 4.2 User State (in DB/LocalStorage)
```typescript
interface CardState {
  id: string;
  interval: number; // days
  repetition: number;
  ef: number; // easiness factor (SM-2)
  nextReviewDate: number; // timestamp
}

interface UserSRSState {
  deckId: string;
  cards: Record<string, CardState>;
  lastSync: number;
}
```

### 4.3 The "Drill" UI
A specialized view in SkillPilot (like `LearnerView` but for Drilling).
1.  **Filter**: Shows only cards where `nextReviewDate <= Now`.
2.  **Interaction**: Front -> Reveal -> Rating (Again, Hard, Good, Easy).
3.  **Update**: Apply SM-2 algorithm, update `nextReviewDate`.
4.  **Sync**: `debounce(saveToServer, 5000)`

## 5. Summary
*   **Don't** treat vocabulary like complex graph nodes.
*   **Do** build a fast, client-side "Flashcard Engine" within the web app.
*   **Do** store user progress as a compact state object on the server.
*   **Do** use GPT only for *exceptions* (explanations, mnemonics), not for the *rule* (simple quizzing).

## 6. Proof of Concept (PoC): "The English Foundation"
To validate this hybrid model, we will create a specific "Sandbox Curriculum" rather than touching the production data immediately.

### 6.1 Curriculum Scope
The PoC Curriculum will integrate three distinct layers:
1.  **Memorization (SRS)**: The "400 Most Important Words" (from `sandbox/400_most_important_english_vocabs.md`).
2.  **Competence (Graph)**:
    *   **Grammar**: The glue that holds the words together (e.g., Sentence structure S-V-O, Plurals, Conjugation of 'to be').
    *   **Comprehension**: Texts and Audio samples constructed *exclusively* using the 400 words.
3.  **Application**: Tasks to write or speak simple sentences using the memorized vocabulary.

### 6.2 The Hybrid Dependency Graph
The innovation lies in the dependencies:
*   *Node:* **"A1 Reader: My Day"** (Competence)
    *   *Requires:* **"Vocab Deck: Verbs Top 10"** (SRS Mastery > 80%)
    *   *Requires:* **"Grammar: Present Simple"** (Competence)

This ensures the user doesn't just memorize disconnected words but immediately unlocks content they can actually understand.

## 7. Strategic Outlook: The CEFR Overhaul
Upon successful validation of the PoC, we will apply this pattern to the core `curricula/EU/CEFR`.
*   **Current State**: Abstract descriptors (e.g., "Can understand familiar words").
*   **Target State**: Data-driven paths.
    *   "Can understand familiar words" becomes a concrete node requiring specific high-frequency vocabulary decks embedded in the system.
    *   This transforms SkillPilot from a "Progress Tracker" into a full-stack "Language Learning Platform".
