# Client-State Sync (SRS and Verified Recall Progress)

This document defines the backend contract for syncing **flashcard progress** to the backend. The browser uses it for local SRS backups; Trainer/GPT verification also writes its per-card `verifiedRecall` results into the same node state.

## Endpoint

```
GET /api/ui/learners/{skillpilotId}/client-state/{nodeId}
PUT /api/ui/learners/{skillpilotId}/client-state/{nodeId}
```

Trainer/GPT hard-recall tools use the AI-facing endpoints:

```
POST /api/ai/{lang}/learners/{skillpilotId}/verified-recall/start
POST /api/ai/{lang}/learners/{skillpilotId}/verified-recall/answer
POST /api/ai/{lang}/learners/{skillpilotId}/verified-recall/result
```

`start` returns the next prompt but not the answer. It may receive `goalId` or use the active goal; `retest: true` can request a fresh card even when all cards are already verified. `answer` returns the expected answer only after the learner has submitted their response. `result` stores `passed`/`failed`, updates SRS scheduling, and returns the next prompt status.

## Purpose
- Persist **SRS and verified recall progress** per memorization node (`nodeId`) periodically (e.g., after 20 cards), on-demand, or after Trainer/GPT hard-recall decisions.
- Keep the backend **PII-free**; the only identifier is the pseudonymous `skillpilotId`.
- Allow later recovery or cross-device continuity via **export/import**.

## Request

**Headers**
- `Content-Type: application/json`

**Body**
```json
{
  "updatedAt": "2026-02-02T19:30:00.000Z",
  "srsState": {
    "math_analysis_c01": {
      "id": "math_analysis_c01",
      "interval": 3,
      "easeFactor": 2.4,
      "repetitions": 2,
      "nextReview": 1706892870000,
      "lastReviewed": 1706806470000,
      "verifiedRecall": {
        "status": "passed",
        "attempts": 1,
        "failures": 0,
        "lastTestedAt": "2026-02-02T19:28:00.000Z",
        "passedAt": "2026-02-02T19:28:00.000Z"
      }
    },
    "math_funbas_c02": {
      "id": "math_funbas_c02",
      "interval": 1,
      "easeFactor": 2.3,
      "repetitions": 1,
      "nextReview": 1706806500000,
      "verifiedRecall": {
        "status": "failed",
        "attempts": 2,
        "failures": 1,
        "lastTestedAt": "2026-02-02T19:29:00.000Z",
        "lastFailedAt": "2026-02-02T19:29:00.000Z"
      }
    }
  }
}
```

Notes:
- `nodeId` is the memorization node (learning goal) ID.
- The `srsState` object mirrors the **per-node** card-state entry and is stored as a JSON blob by the backend.
- Fields inside each card entry follow the SRS model (`interval`, `ef`/`easeFactor`, `repetition`/`repetitions`, `nextReview`, optional `lastReviewed`) plus optional `verifiedRecall` hard-test metadata.
- The verified recall lane is stored inside the card entry to keep the persistence shape backward-compatible. The backend may still inspect this lane for mastery calculation and Trainer/GPT verification tools.

## Read (GET)

**200 OK**
```json
{
  "updatedAt": "2026-02-02T19:30:00.000Z",
  "srsState": {
    "math_analysis_c01": {
      "id": "math_analysis_c01",
      "interval": 3,
      "easeFactor": 2.4,
      "repetitions": 2,
      "nextReview": 1706892870000,
      "lastReviewed": 1706806470000
    }
  }
}
```

## Response

**200 OK**
```json
{
  "status": "ok",
  "savedAt": "2026-02-02T19:30:02.123Z",
  "storedKeys": 42
}
```

**404 Not Found**
- If the endpoint is not implemented on the backend. The client should silently keep local storage and continue.

## Backend Storage Recommendation
- Store as a JSON blob **per learner + nodeId** (e.g., table `learner_client_state`).
- Prefer **last-write-wins** using `updatedAt`.
- No PII in payload; do not add names/emails.

## Security / Privacy
- Same authentication/authorization rules as other `/api/ui/learners/*` endpoints.
- Payload contains only SRS progress, no personal identifiers.

## Client Behavior
- Auto-sync after every **20** reviewed cards.
- Trainer/GPT verification writes after each hard-test decision.
- Manual **Save** button available in the UI where exposed.
- On sync failure, UI indicates an error but continues to work locally.
