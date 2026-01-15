# Concept: ExamProblem Node Type

## 1. Overview
The `ExamProblem` represents a specific type of node in the curriculum graph focused on **application and assessment** (e.g., Abitur questions) rather than abstract skill acquisition.

## 2. Integration Strategy
To maintain compatibility with the existing `LearningLandscape` graph and tools (which expect `goals`), `ExamProblem` will be implemented as a **specialized LearningGoal**.

### Schema Extension
We will extend the existing `LearningGoal` schema in `landscape-runtime.schema.json` by adding an optional `examData` object. This avoids breaking existing loaders while strictly typing the new fields.

**New Field (`examData`) in `LearningGoal`:**
```json
"examData": {
  "type": "object",
  "required": ["taskContent", "solutionContent", "scoring"],
  "properties": {
    "taskContent": { "type": "string", "description": "Markdown with LaTeX/images" },
    "taskContentEn": { "type": "string", "description": "English translation (optional)" },
    "solutionContent": { "type": "string", "description": "Markdown with solution/grading steps" },
    "solutionContentEn": { "type": "string", "description": "English translation (optional)" },
    "scoring": {
       "type": "object",
       "required": ["maxPoints", "passingPoints", "steps"],
       "properties": {
         "maxPoints": { "type": "number" },
         "passingPoints": { "type": "number" },
         "steps": { 
           "type": "array", 
           "items": { "type": "object", "required": ["id", "points", "description"], "properties": { ... } } 
         }
       }
    }
  }
}
```

### JSON Structure Example
The node sits within the standard `goals` array.

```json
{
  "id": "uuid-for-exam-variant",
  "title": "A1 (Analysis)",
  "titleEn": "A1 (Calculus)",
  "description": "Exam task from 2026 sample.",
  "weight": 1.0, 
  "tags": ["GK", "Exam"],
  "dimensionTags": { "phase": "Q3", "demandLevel": "AB1" }, 
  "requires": ["skill-id-1"], // Standard gating
  "contains": [],
  "examData": {
    "taskContent": "Berechnen Sie die Nullstellen von $f(x)$...",
    "taskContentEn": "Calculate the roots of $f(x)$...",
    "solutionContent": "Ansatz $f(x)=0$ liefert...",
    "solutionContentEn": "Setting $f(x)=0$ yields...",
    "scoring": {
      "maxPoints": 5,
      "passingPoints": 3,
      "steps": [
        { "id": "s1", "points": 2, "description": "Nullstellenansatz" },
        { "id": "s2", "points": 3, "description": "Lösung" }
      ]
    }
  }
}
```

## 3. Data & Semantics

### Localization
We follow the existing pattern: `field` (Local, usually German) and `fieldEn` (English, optional). Browsers select the field based on the UI language setting.

### `requires` Semantics
*   **Access Control:** The `requires` field functions as a standard prerequisite. Information is locked until prerequisites are met (or deemed "ready").
*   **Remediation:** If the user **fails** the exam (score < `passingPoints`), the generic `requires` list is used to generate specific review recommendations.

### Scoring vs. Mastery
*   **Algorithm:** `Mastery = (AchievedPoints >= PassingPoints) ? 1.0 : 0.0`.
*   **Nuance:** Partial mastery (0.5) could be considered if `AchievedPoints / MaxPoints > 0.5` but `< passingPoints`, but for now we settle on a binary Pass/Fail for the node status.

## 4. Asset Management
*   **Storage:** Images (e.g., `image1.png`) are stored **alongside the curriculum JSON file** in the source repo (e.g., `curricula/.../json/assets/`).
*   **Build:** The build process copies these assets to `public/data/assets/` or similar.
*   **Reference:** Markdown uses relative paths: `![Sketch](./assets/image1.png)`. The frontend markdown renderer must resolve these relative to the curriculum base URL.

## 5. Interaction Flow (AI "Proctor")
1.  **Start:** User opens node. UI detects `examData` and switches to **Proctor Mode**.
2.  **Task:** Display `taskContent`. Hide `solutionContent`.
3.  **Input:** User enters text/image.
4.  **Eval:** AI (Prompt) receives:
    *   User Input
    *   `solutionContent`
    *   `scoring` schema
    *   **Instruction:** "Grade the input against the solution. Assign points per step. Be strict."
5.  **Feedback:**
    *   AI returns structured JSON result: `{ "points": 4, "total": 5, "feedback": "...", "passed": true }`.
    *   UI updates Mastery state locally and notifies Server.
