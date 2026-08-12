# Client-State Sync for Browser SRS Progress

This document defines the UI-facing backend contract for syncing browser
flashcard progress. Verified Recall may update the same internal node state,
but it does so through its own capability-bound atomic batch use case, not
through this browser API contract.

## Endpoint

```
GET /api/ui/learners/{skillpilotId}/client-state/{nodeId}
PUT /api/ui/learners/{skillpilotId}/client-state/{nodeId}
```

The browser uses the UI-facing endpoints above. The current multilingual OpenAI
V1 MCP App authenticates through the fixed confidential OAuth client and requires a
separate active, absolutely expiring 24-hour learning session. Every explicit
**Lernen starten** action creates a new session, SkillPilot inserts its opaque
ID automatically into the prepared start message, and every fachlicher MCP
tool receives that ID as a required argument. The permanent SkillPilot ID is
never a tool argument or result.

The old Visible-Session per-card endpoints belong only to the isolated Custom-
GPT rollback implementation and are documented in
[ChatGPT Visible Session Flow](chatgpt-visible-session-flow.md). They are not an
alternative current V1 communication contract.

## Purpose
- Persist browser **SRS progress** per memorization node (`nodeId`)
  periodically, on demand, or during export/import recovery.
- Keep the backend **PII-free**. Browser/UI routes use the pseudonymous
  `skillpilotId`; the multilingual V1 MCP lane resolves the learner only through the
  explicit active 24-hour learning-session argument. OAuth authorizes the app
  but never selects the learner.
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
- The verified recall lane is stored inside the card entry to keep the persistence shape backward-compatible. The backend may still inspect this lane for mastery calculation and learning-coach/GPT verification tools.

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
- learning-coach/GPT verification writes after each hard-test decision.
- Manual **Save** button available in the UI where exposed.
- On sync failure, UI indicates an error but continues to work locally.
