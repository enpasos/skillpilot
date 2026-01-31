# Node Types

SkillPilot models learning goals as nodes in a competence graph. This document defines the node types currently used.

## Summary

| Type | Purpose | Typical content |
| --- | --- | --- |
| Understanding | Conceptual or procedural understanding | "The learner can ..." goals |
| Memorize | Spaced repetition recall | Facts, vocabulary, formulas |
| Exam | Assessment tasks with scoring | Exam problems, Abitur tasks |

## Understanding

**Purpose:** Standard learning goals that describe conceptual or procedural understanding.

**Characteristics:**
*   Covers the majority of existing goals in current landscapes.
*   Described as assessable competencies (e.g., "The learner can ...").
*   Progress is tracked via mastery values and prerequisites (`requires`).
*   If no special fields are present, a goal is treated as an Understanding node by default.

## Memorize

**Purpose:** Spaced-repetition style knowledge items (facts, vocabulary, formulas).

**Goal:** Maximize retention while minimizing time-on-task.

**Key principles:**
1. **Event-based:** The current level is derived from the full history (event sourcing).
2. **Gentle regression:** Failure reduces level but does not reset it to zero.
3. **Exponential intervals:** Successful reviews increase spacing over time.

### Data model (abstract)

Each card keeps a history of review events:
* `timestamp`: when the review happened
* `result`: `SUCCESS`, `FAILURE`, or `EASY`

### Level calculation

Whenever a card status is needed, compute the current level `L` from the history:

1. Initialize `L = 0`.
2. Sort history chronologically.
3. For each event:
   * `SUCCESS` -> `L = L + 1`
   * `EASY` -> `L = L + 2` (bonus for strong recall)
   * `FAILURE` -> `L = ceil(L * 0.5)` (gentle regression)
4. `L` never falls below 0.

### Scheduling intervals

After computing `L`, determine the next review date based on the interval table.

| Level (L) | Interval (days) | Phase |
| --- | --- | --- |
| 0 | 0 (today) | acquisition |
| 1 | 1 | consolidation |
| 2 | 3 | consolidation |
| 3 | 7 | long-term memory |
| 4 | 16 | long-term memory |
| 5 | 35 | maintenance |
| n > 5 | `I_(n-1) * 2.5` | maintenance |

**Rule of thumb:** `I_n ~= I_(n-1) * 2.5` for `n > 5`.

### Leech detection (stuck cards)

Mark a card as `SUSPENDED` if:
* More than 3 `FAILURE` events appear in the last 5 reviews, **or**
* The level drops from `> 2` to `< 2` more than 3 times.

The user should revise or rewrite the card before it returns to the review queue.

### Pseudocode

```text
function getCardStatus(card, user):
  history = loadHistory(card, user)
  level = 0

  for event in history (sorted ascending by date):
    if event.isSuccess():
      level = level + 1
    else if event.isEasy():
      level = level + 2
    else if event.isFailure():
      level = max(0, ceil(level * 0.5))

  lastSuccessDate = getLastSuccessDate(history)
  intervalDays = calculateInterval(level)
  dueDate = lastSuccessDate + intervalDays

  return {
    currentLevel: level,
    isDue: (today >= dueDate),
    nextReview: dueDate
  }
```

## Exam

**Purpose:** Exam problems that simulate assessment tasks with scoring.

### Integration strategy

Exam nodes are implemented as specialized `LearningGoal` entries so they still live inside the `goals` array.
They add an optional `examData` field to the existing schema.

#### Schema extension (examData)

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
          "items": { "type": "object", "required": ["id", "points", "description"] }
        }
      }
    }
  }
}
```

#### JSON example

```json
{
  "id": "uuid-for-exam-variant",
  "title": "A1 (Analysis)",
  "description": "Exam task from 2026 sample.",
  "weight": 1.0,
  "tags": ["GK", "Exam"],
  "dimensionTags": { "phase": "Q3", "demandLevel": "AB1" },
  "requires": ["skill-id-1"],
  "contains": [],
  "examData": {
    "taskContent": "Compute the roots of f(x)...",
    "taskContentEn": "Compute the roots of f(x)...",
    "solutionContent": "Set f(x)=0 and solve...",
    "solutionContentEn": "Set f(x)=0 and solve...",
    "scoring": {
      "maxPoints": 5,
      "passingPoints": 3,
      "steps": [
        { "id": "s1", "points": 2, "description": "Setup" },
        { "id": "s2", "points": 3, "description": "Solve" }
      ]
    }
  }
}
```

### Localization

Follow the existing pattern: `field` (local language) and `fieldEn` (English). The UI selects the matching field based on the active language.

### Requires semantics

* **Access control:** `requires` is used to gate exam tasks until prerequisites are met.
* **Remediation:** If the user fails, `requires` drives targeted review suggestions.

### Scoring and mastery

* **Pass/Fail:** `passed = (total >= scoring.passingPoints)`.
* **Total points:** `total = min(sum(stepPointsAwarded), scoring.maxPoints)`.
* **Mastery update:** On pass, set mastery to `1.0`. On fail, leave mastery unchanged.
* **Optional nuance:** Partial mastery could be considered if `total / maxPoints` is high, but is not part of the default flow.

### Asset management

* Store images alongside the curriculum JSON (e.g., `curricula/.../json/assets/`).
* Build step copies assets into `public/data/assets/` (or equivalent).
* Use relative Markdown paths: `![Sketch](./assets/image1.png)`.

### Exam Mode (AI exam supervisor)

In Exam Mode, the AI acts as a strict but fair exam supervisor. The tutor role begins only after grading.

**Persona:**
* Neutral, precise, no hints during solving.
* If the user asks for help, remind them to submit or give up first.
* Task must be delivered **verbatim** and **unchanged** (task block only). A short exam header and a fixed submission instruction are allowed **outside** the task block.

**Workflow:**
1. **Exam header + Task:** Show a short exam header (neutral, 2–4 lines, includes active goal title + description), then show `examData.taskContent` **verbatim** (no rephrasing, no chunking).  
   If points/instructions are part of the task, they appear there—otherwise do not add them.
   After the task, add one fixed submission instruction line (e.g., “Bitte reiche deine vollständige Lösung in einer Nachricht ein …”).
2. **Solve:** User submits a **single complete** solution (text/formula/photo). No hints.
   * Only allow clarifying questions about readability if needed.
   * If the user asks for help or submits partial work, only request a full submission or give up.
   * If the user gives up, treat it as a submission and proceed to grading.
3. **Grade:** Iterate through `scoring.steps`, assign points.
4. **Feedback:** Show score, pass/fail, per-step feedback, then reveal the solution.
   Then switch back to Trainer mode and go through the findings.

**Prompt contract (summary):**
* Display the exam header, then `taskContent` verbatim, then the fixed submission instruction (no extra text beyond those).
* No hints, no chunking; wait for a single full submission.
* Grade strictly by `scoring.steps`.
* Logic errors -> 0 points for that step; calculation errors -> partial points.
* `total = min(sum(stepPointsAwarded), scoring.maxPoints)`.
* `passed = (total >= scoring.passingPoints)`.
* Persist mastery only on pass.
* Optional JSON output:
  ```
  { "examResult": { "goalId": "<GoalID>", "score": 4, "maxScore": 5, "passed": true } }
  ```

### Technical integration notes

* The host must ensure `examData` is available to the GPT (e.g., via AI state for the **active goal**).
* Image upload is essential for math (handwritten solutions).
* The chat needs to track whether it is in task, solve, or grading phase.
* The mode switch should be visible to the user (e.g., a "Exam Simulation" badge).
