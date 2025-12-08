# AI API Design & Best Practices

## 1. Phase 1: Initial Contact & ID Verification

The AI acts as a state machine to handle new vs. returning users.

### State Machine Flow

1.  **INITIAL -> CHECK_ID**: User expresses intent. AI asks: "Do you already have a SkillPilot ID?" (DO NOT call `createLearner` yet).
2.  **CHECK_ID -> PROVISIONING**: User says "No". AI calls `createLearner(topic="...")`.
3.  **CHECK_ID -> LOADING**: User provides UUID. AI calls `getLearnerState(skillpilotId)`.
4.  **PROVISIONING -> ACTIVE**: `createLearner` returns success. Proceed based on `nextAllowedActions`.

---

## 2. Phase 2: The Learning Loop (API Specification)

### 2.1 Unified Learner State (`GET /api/ai/learners/{id}/state`)
**Purpose**: The "One Ring" endpoint. Returns `curriculum`, `frontier` (rich objects), and `nextAllowedActions`.

### 2.2 Initialization (`POST /api/ai/learners`)
**Request**: `{}` (Empty body) or `{"topic": "..."}`
**Response**: Returns `skillpilotId` and `availableLandscapes`.

### 2.3 Personalization (`POST /api/ai/learners/{id}/personalization`)
**Purpose**: Restrict curriculum to specific subjects/modules using UUIDs from the Frontier.

**Request**:
```json
{
  "goalIds": ["uuid-1", "uuid-2"]
}
```
**Behavior**: Backend automatically selects the landscapes containing these goals.

### 2.4 Scoping (`POST /api/ai/learners/{id}/scope`)
**Purpose**: Focus on specific topics within the current curriculum.

**Request**:
```json
{
  "instruction": "I want to focus on Stochastics."
}
```
**Behavior**: Backend marks relevant cluster goals as "Planned".

### 2.5 Mastery Update (`POST /api/ai/learners/{id}/mastery`)
**Purpose**: Report success and get immediate next steps.

**Request**:
```json
{
  "mastery": {
      "goal-uuid-123": 1.0
  }
}
```
**Response**: Returns the **updated** `frontier` immediately.
