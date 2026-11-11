## Real-Time Auto-Update Architecture (SSE) {#sec:dev-auto-update}

When an external AI coach (via MCP or REST) persists mastery or switches the active goal, the Cockpit WebGUI updates immediately without manual page reloads through **Server-Sent Events (`SSE`)** ([Client-State Sync](repo:docs/concept/runtime-workflows/client-state-sync.md)).

### Backend Event Bus, SSE Endpoint, and React Reconnection Hook {#sec:dev-au-pipeline}

```text
LearnerService write -> LearnerStateChangedEvent
  -> SseService (SseEmitter map + ~25s heartbeat)
  -> GET /api/ui/updates/{skillpilotId} (text/event-stream)
  -> useLearnerUpdates(skillpilotId) -> refreshMastery() / state reload
```

- **Spring event publication:** State mutations in [`LearnerService.java`](repo:backend/src/main/java/com/skillpilot/backend/service/LearnerService.java) publish `LearnerStateChangedEvent` (`MASTERY_UPDATE`, `GOAL_UPDATE` / `ACTIVE_GOAL_UPDATE`).
- **SSE controller & emitter management:** `UpdateController` exposes `GET /api/ui/updates/{skillpilotId}` (`text/event-stream`), backed by `SseService` maintaining per-learner `SseEmitter` registrations, automatic cleanup on completion/timeout/IO error, and periodic `~25s` `heartbeat` comments so reverse proxies (Nginx/Cloudflare) keep idle streams open.
- **Frontend hook (`useLearnerUpdates`):** Opens a native browser `EventSource`, triggers `refreshMastery()` and active-goal state reloads on incoming events, and reconnects with bounded exponential backoff on network drops.
- **Scaling boundary:** In-memory NIO `SseEmitter` fan-out handles single-node deployments with minimal overhead; horizontal multi-instance deployments require an external pub/sub relay (such as Redis Pub/Sub or PostgreSQL `LISTEN/NOTIFY`) so events broadcast across all backend replicas.
