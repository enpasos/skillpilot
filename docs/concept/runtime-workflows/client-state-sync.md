# Client-State Sync (SRS Progress)

This document defines the backend contract for syncing **local SRS flashcard progress** from the browser to the backend. The goal is to provide **intermediate backups** between full exports.

## Endpoint

```
GET /api/ui/learners/{skillpilotId}/client-state/{nodeId}
PUT /api/ui/learners/{skillpilotId}/client-state/{nodeId}
```

## Purpose
- Persist **local SRS progress** per memorization node (`nodeId`) periodically (e.g., after 20 cards) or on-demand.
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
    "hes_analysis_c01": {
      "id": "hes_analysis_c01",
      "interval": 3,
      "easeFactor": 2.4,
      "repetitions": 2,
      "nextReview": 1706892870000,
      "lastReviewed": 1706806470000
    },
    "hes_funbas_c02": {
      "id": "hes_funbas_c02",
      "interval": 1,
      "easeFactor": 2.3,
      "repetitions": 1,
      "nextReview": 1706806500000
    }
  }
}
```

Notes:
- `nodeId` is the memorization node (learning goal) ID.
- The `srsState` object mirrors the **per-node** local storage entry and is treated as **opaque** by the backend.
- Fields inside each entry follow the SRS model (`interval`, `easeFactor`, `repetitions`, `nextReview`, optional `lastReviewed`).

## Read (GET)

**200 OK**
```json
{
  "updatedAt": "2026-02-02T19:30:00.000Z",
  "srsState": {
    "hes_analysis_c01": {
      "id": "hes_analysis_c01",
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
- Manual **Save** button available in the UI.
- On sync failure, UI indicates an error but continues to work locally.
