# Client-State Sync (SRS Progress)

This document defines the backend contract for syncing **local SRS flashcard progress** from the browser to the backend. The goal is to provide **intermediate backups** between full exports.

## Endpoint

```
PUT /api/ui/learners/{skillpilotId}/client-state
```

## Purpose
- Persist **local SRS progress** periodically (e.g., after 20 cards) or on-demand.
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
    "srs_state_<skillpilotId>_<goalId>": {
      "id": "hes_analysis_c01",
      "interval": 3,
      "easeFactor": 2.4,
      "repetitions": 2,
      "nextReview": 1706892870000,
      "lastReviewed": 1706806470000
    },
    "srs_state_<skillpilotId>_<goalId>": {
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
- The `srsState` object mirrors the local storage entries and is treated as **opaque** by the backend.
- Keys use the browser convention: `srs_state_${skillpilotId}_${goalId}`.
- Fields inside each entry follow the SRS model (`interval`, `easeFactor`, `repetitions`, `nextReview`, optional `lastReviewed`).

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
- Store as a JSON blob per learner (e.g., column `clientState` or collection `client_state`).
- Prefer **last-write-wins** using `updatedAt`.
- No PII in payload; do not add names/emails.

## Security / Privacy
- Same authentication/authorization rules as other `/api/ui/learners/*` endpoints.
- Payload contains only SRS progress, no personal identifiers.

## Client Behavior
- Auto-sync after every **20** reviewed cards.
- Manual **Sync** button available in the UI.
- On sync failure, UI indicates an error but continues to work locally.
