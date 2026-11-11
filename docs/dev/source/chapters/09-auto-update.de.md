## Echtzeit-Auto-Update-Architektur (SSE) {#sec:dev-auto-update}

Sobald ein externer KI-Coach (über MCP oder REST) Mastery speichert oder das aktive Lernziel wechselt, aktualisiert sich die Cockpit-WebGUI ohne manuelles Neuladen in Echtzeit über **Server-Sent Events (`SSE`)** ([Client-State-Synchronisation](repo:docs/concept/runtime-workflows/client-state-sync.md)).

### Backend-Event-Bus, SSE-Endpunkt und React-Reconnect-Hook {#sec:dev-au-pipeline}

```text
LearnerService-Schreibzugriff -> LearnerStateChangedEvent
  -> SseService (SseEmitter-Map + ~25s-Heartbeat)
  -> GET /api/ui/updates/{skillpilotId} (text/event-stream)
  -> useLearnerUpdates(skillpilotId) -> refreshMastery() / State-Reload
```

- **Spring-Events:** Zustandsänderungen in [`LearnerService.java`](repo:backend/src/main/java/com/skillpilot/backend/service/LearnerService.java) feuern ein `LearnerStateChangedEvent` (`MASTERY_UPDATE`, `GOAL_UPDATE` / `ACTIVE_GOAL_UPDATE`).
- **SSE-Controller & Emitter-Verwaltung:** `UpdateController` stellt `GET /api/ui/updates/{skillpilotId}` (`text/event-stream`) bereit; `SseService` verwaltet die `SseEmitter`-Instanzen je SkillPilot-ID, räumt geschlossene/abgelaufene Verbindungen auf und sendet alle `~25s` einen `heartbeat`-Event, damit Reverse-Proxys (Nginx/Cloudflare) ruhige Streams nicht trennen.
- **Frontend-Hook (`useLearnerUpdates`):** Öffnet eine Browser-`EventSource`, stößt bei eingehenden Events `refreshMastery()` sowie das Nachladen des aktiven Ziels an und verbindet sich nach Netzwerkabbrüchen mit exponentiellem Backoff neu.
- **Skalierungsgrenze:** Die In-Memory-NIO-Verteilung über `SseEmitter` bedient Einzelknoten-Instanzen ressourcenschonend; bei horizontaler Mehrknoten-Skalierung wird ein Pub/Sub-Relay (z. B. Redis Pub/Sub oder PostgreSQL `LISTEN/NOTIFY`) zwischen den Replikaten ergänzt.
