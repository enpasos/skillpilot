## Client-State Sync for Browser SRS Progress {#sec:client-state-sync}

This chapter specifies the UI-facing backend contract for synchronizing browser Spaced-Repetition-System (SRS) flashcard progress. **Verified Recall** updates internal card verification state through its own capability-bound atomic MCP batch workflow (@ref{sec:coach-boundary-recall}), never through this browser endpoint.

### Endpoint and authentication boundary {#sec:srs-sync-endpoint}

```text
GET /api/ui/learners/{skillpilotId}/client-state/{nodeId}
PUT /api/ui/learners/{skillpilotId}/client-state/{nodeId}
```

- **First-party browser lane:** Calls the UI endpoints above using the pseudonymous `skillpilotId` to persist per-node SRS scheduling periodically, on demand, and across export/import recovery while keeping payloads strictly PII-free.
- **MCP coach lane:** Authenticates the integration via OAuth and resolves the learner exclusively through the active 24-hour `learningSessionId` (@ref{sec:openai-mcp-oauth-session}); `skillpilotId` is never an MCP tool argument or output. Legacy per-card Visible-Session routes belong solely to the isolated [Visible Session Rollback Flow](repo:docs/concept/runtime-workflows/chatgpt-visible-session-flow.md).

### Request and response payloads {#sec:srs-sync-payloads}

`PUT` sends `Content-Type: application/json` with a per-memorization-node (`nodeId`) card map:

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
    }
  }
}
```

- `srsState` stores SRS scheduling fields (`interval`, `ef`/`easeFactor`, `repetition`/`repetitions`, `nextReview`, optional `lastReviewed`) alongside backward-compatible read-preserved `verifiedRecall` metadata (browser sync cannot forge new verified-recall passes; see @ref{sec:workflow-step5}).
- `GET` returns `200 OK` with `{ "updatedAt": "...", "srsState": { ... } }` (or `404 Not Found` when unpopulated, leaving browser storage active).
- `PUT` returns `200 OK` with `{ "status": "ok", "savedAt": "...", "storedKeys": 42 }`.

### Storage, privacy, and client behavior {#sec:srs-sync-behavior}

- **Persistence:** Stored per `(learner, nodeId)` JSON record (e.g. `learner_client_state`) using `updatedAt` ordering and zero personal identifiers (no names or emails).
- **Client triggers:** Auto-syncs every **20** reviewed cards and via explicit **Save** controls; if a network sync fails, the UI surfaces an error indicator while continuing local flashcard practice uninterrupted.
