# Node Types

SkillPilot models learning goals as nodes in a competence graph. This document defines the node types currently used.

Use this document for node-specific semantics only.  
Graph relations, placements, and projected view contracts are specified separately in:

- `docs/concept/curriculum-graph/graph-definition.md`
- `docs/concept/curriculum-graph/view-projection-and-goal-placement.md`

The categories in this document are pedagogical goal kinds.

They are orthogonal to the structural atomic/cluster classification from `graph-definition.md` and orthogonal to program-unit kinds such as `exam`.

## Summary

| Type | Purpose | Typical content |
| --- | --- | --- |
| Understanding | Conceptual or procedural understanding | "The learner can ..." goals |
| Memorize | Spaced repetition recall | Facts, vocabulary, formulas |
| Exam | Assessment tasks with scoring | Exam problems, Abitur tasks |

Node-type-specific runtime state ultimately resolves to mastered/not-mastered status consumed by graph-level frontier semantics.

## Cross-cutting metadata: applicability

`applicability` is **not** a node type.

It is optional, compiled goal metadata for learner-facing filtered views.

Generic target shape:

```json
{
  "applicability": {
    "jurisdiction": ["DE-HE", "DE-BY"]
  }
}
```

Interpretation:

- keys are filter dimensions, not hardcoded application cases
- values are the allowed values for that dimension on the goal
- the field is intended for runtime filtering and projected-view validation
- it is compiled from source truth such as provenance, mappings, and reviewed overrides
- it should not replace ordinary semantic `tags`

For canonical Gymnasium, the first planned dimension is:

- `jurisdiction`

Possible later dimensions could include:

- `courseProfile`
- `stage`
- `durationModel`

Authoring note:

- `applicability` is generated runtime metadata
- reviewed authoring-side exceptions may live under `extendedData.applicabilityOverrides`

## Understanding

**Purpose:** Standard learning goals that describe conceptual or procedural understanding.

**Characteristics:**
-   Covers the majority of existing goals in current landscapes.
-   Described as assessable competencies (e.g., "The learner can ...").
-   Progress is tracked via mastery values and prerequisites (`requires`).
-   Filtered visibility may additionally be constrained by compiled `applicability` metadata where a landscape uses scoped learner views.
-   If no special fields are present, a goal is treated as an Understanding node by default.

## Memorize

**Purpose:** Spaced-repetition style knowledge items (facts, vocabulary, formulas).

**Goal:** Maximize retention while minimizing time-on-task.

**Key principles:**
1. **SM-2 scheduling:** Reviews follow the SuperMemo-2 algorithm.
2. **Stateful per card:** Each card stores its current interval, repetition count, easiness factor, and next review date.
3. **Quality-driven:** User ratings map to quality scores and directly update the SM-2 state.

### State model

Each card stores a compact review state:
- `interval`: days until next review
- `repetition`: consecutive successful reviews
- `ef`: easiness factor
- `nextReview`: timestamp (ms) for the next scheduled review

### Scheduling logic (SM-2)

Rules applied on each review:
- If `quality >= 3`, increment `repetition`. Set `interval = 1` when the previous repetition was `0`, `interval = 6` when it was `1`, otherwise `interval = round(lastInterval * ef)`. Update `ef` with the SM-2 formula and clamp to `>= 1.3`.
- If `quality < 3`, set `repetition = 0`, `interval = 1`, keep `ef` unchanged.
- Set `nextReview = now + interval * 24h`.

### Due and mastery semantics

- A card is **due** if `nextReview <= now` or if it has no stored state yet.
- A memorization goal is treated as **mastered** when **no cards are due today**.

### Queue order

Due cards are **shuffled per session** before taking up to 20 cards for a drill.

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
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "shortKey": "exam-analysis-a1-2026-sample",
  "title": "A1 (Analysis)",
  "description": "Exam task from 2026 sample.",
  "weight": 1.0,
  "tags": ["GK", "Exam"],
  "dimensionTags": { "phase": "Q3", "demandLevel": "AB1" },
  "requires": ["550e8400-e29b-41d4-a716-446655440010"],
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

- **Access control:** `requires` is used to gate exam tasks until prerequisites are met.
- **Remediation:** If the user fails, `requires` drives targeted review suggestions.

### Scoring and mastery

- **Pass/Fail:** `passed = (total >= scoring.passingPoints)`.
- **Total points:** `total = min(sum(stepPointsAwarded), scoring.maxPoints)`.
- **Mastery update:** On pass, set mastery to `1.0`. On fail, leave mastery unchanged.
- **Optional nuance:** Partial mastery could be considered if `total / maxPoints` is high, but is not part of the default flow.

### Exam Mode (AI exam supervisor)

In Exam Mode, the AI acts as a strict but fair exam supervisor. The tutor role begins only after grading.

**Persona:**
- Neutral, precise, no hints during solving.
- If the user asks for help, remind them to submit or give up first.
- Task must be delivered **verbatim** and **unchanged** (task block only). A short exam header and a fixed submission instruction are allowed **outside** the task block.

**Workflow:**
1. **Exam header + Task:** Show a short exam header (neutral, 2–4 lines, includes active goal title + description), then show `examData.taskContent` **verbatim** (no rephrasing, no chunking).  
   If points/instructions are part of the task, they appear there—otherwise do not add them.
   After the task, add one fixed submission instruction line (e.g., “Bitte reiche deine vollständige Lösung in einer Nachricht ein …”).
2. **Solve:** User submits a **single complete** solution (text/formula/photo). No hints.
   - Only allow clarifying questions about readability if needed.
   - If the user asks for help or submits partial work, only request a full submission or give up.
   - If the user gives up, treat it as a submission and proceed to grading.
3. **Grade:** Iterate through `scoring.steps`, assign points.
4. **Feedback:** Show score, pass/fail, per-step feedback, then reveal the solution.
   Then switch back to Trainer mode and go through the findings.

**Prompt contract (summary):**
- Display the exam header, then `taskContent` verbatim, then the fixed submission instruction (no extra text beyond those).
- No hints, no chunking; wait for a single full submission.
- Grade strictly by `scoring.steps`.
- Logic errors -> 0 points for that step; calculation errors -> partial points.
- `total = min(sum(stepPointsAwarded), scoring.maxPoints)`.
- `passed = (total >= scoring.passingPoints)`.
- Persist mastery only on pass.
- Optional JSON output:
  ```
  { "examResult": { "goalId": "<GoalID>", "score": 4, "maxScore": 5, "passed": true } }
  ```
