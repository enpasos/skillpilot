# Node Types

SkillPilot models learning goals as nodes in a skill graph. This document defines the node types currently used.

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

**Goal:** Maximize retention while minimizing time-on-task, while still requiring a hard recall check before the graph treats the memorization goal as complete.

**Key principles:**
1. **SM-2 scheduling:** Reviews follow the SuperMemo-2 algorithm.
2. **Stateful per card:** Each card stores its current interval, repetition count, easiness factor, and next review date.
3. **Quality-driven:** User ratings map to quality scores and directly update the SM-2 state.
4. **Verified recall gate:** SRS practice is not by itself a mastery proof. A memorization node is complete only after every required card has been answered correctly in a learning-coach/GPT-led hard recall test.
5. **Learner-triggered testing:** The learner can start this hard recall test at any time from the active memorization goal, not only when the SRS queue is empty.

### State model

Each card stores two related state lanes.

The SRS practice lane stores:
- `interval`: days until next review
- `repetition`: consecutive successful reviews
- `ef`: easiness factor
- `nextReview`: timestamp (ms) for the next scheduled review

The verified recall lane stores the hard-test result:
- `verifiedRecall.status`: `passed` or `failed`
- `verifiedRecall.attempts`: number of hard-test attempts for this card
- `verifiedRecall.failures`: number of failed hard-test attempts
- `verifiedRecall.lastTestedAt`: timestamp of the last hard-test decision
- `verifiedRecall.passedAt`: timestamp of the latest passing hard-test decision, present only when the card currently counts as verified
- `verifiedRecall.lastFailedAt`: timestamp of the latest failed hard-test decision, present after failures

### Scheduling logic (SM-2)

Rules applied on each review:
- If `quality >= 3`, increment `repetition`. Set `interval = 1` when the previous repetition was `0`, `interval = 6` when it was `1`, otherwise `interval = round(lastInterval * ef)`. Update `ef` with the SM-2 formula and clamp to `>= 1.3`.
- If `quality < 3`, set `repetition = 0`, `interval = 1`, keep `ef` unchanged.
- Set `nextReview = now + interval * 24h`.

### Due and mastery semantics

- A card is **due** if `nextReview <= now` or if it has no stored state yet.
- SRS progress and verified recall progress are shown separately.
- A memorization goal is treated as **mastered** only when:
  - no required cards are currently due in the SRS lane, and
  - every required card has `verifiedRecall.status = passed`.
- Passing a hard recall test also updates the card's SRS lane as a strong successful retrieval.
- Failing a hard recall test removes verified status for that card, schedules it back into practice, and keeps the memorization node incomplete until the card is passed in a later hard test.

This keeps the node model simple: the card node remains the learning goal; the hard test is a validation aspect of that goal, not a separate graph node.

### learning-coach/GPT-led hard recall

The normal flashcard drill remains a Cockpit practice surface. The hard recall check is conducted by the learning-coach/GPT because it needs a controlled dialog: prompt first, learner answer without card help, then answer lookup and persisted pass/fail decision.

When a memorization goal is active, the runtime should expose two learner actions:
- **Practice:** open the Cockpit SRS drill for normal spaced repetition.
- **Verify:** hand over to the learning-coach/GPT for hard recall of the current active memory goal.

Runtime behavior:
- Prefer cards that are not yet verified.
- If all cards are already verified, allow a retest over the deck; a failed retest reopens that card.
- The learning-coach/GPT first retrieves only the card prompt.
- The learner answers without help, preferably in writing when the check is meant to be strict.
- Only after the learner has submitted an answer does the learning-coach/GPT retrieve the expected answer.
- The learning-coach/GPT evaluates the answer and records `passed` or `failed`.
- Passed cards count as verified immediately and are scheduled as a strong successful retrieval in SRS.
- Failed cards remain unverified and re-enter SRS practice as due.

### Queue order

Due cards are **shuffled per session** before taking up to 20 cards for a drill.
Hard-test cards should prefer unverified cards. Retests are optional and learner-triggered.

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

In Exam Mode, the AI acts as a strict but fair exam supervisor. The learning coach role begins only after grading.

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
   Then switch back to learning-coach mode and go through the findings.

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
