## Client-State-Synchronisation für Browser-SRS-Fortschritt {#sec:client-state-sync}

Dieses Kapitel definiert den UI-seitigen Backendvertrag zur Synchronisation des lokalen Karteikarten-Wiederholungsstands (Spaced Repetition System, SRS). **Verified Recall** aktualisiert verifizierte Kartenergebnisse ausschließlich über seinen eigenen, Capability-gebundenen atomaren MCP-Batch-Use-Case (@ref{sec:coach-boundary-recall}), niemals über diesen Browser-Endpunkt.

### Endpunkt und Authentifizierungsgrenze {#sec:srs-sync-endpoint}

```text
GET /api/ui/learners/{skillpilotId}/client-state/{nodeId}
PUT /api/ui/learners/{skillpilotId}/client-state/{nodeId}
```

- **First-Party-Browserpfad:** Nutzt die obigen UI-Endpunkte mit der pseudonymen `skillpilotId`, um den SRS-Planungsstand je Gedächtnisknoten (`nodeId`) periodisch, manuell sowie für Export/Import-Wiederherstellung frei von personenbezogenen Daten zu sichern.
- **MCP-Coach-Pfad:** Authentisiert die App per OAuth und adressiert Lernende ausschließlich über die aktive 24-Stunden-`learningSessionId` (@ref{sec:openai-mcp-oauth-session}); die `skillpilotId` ist niemals MCP-Toolargument oder -ergebnis. Frühere kartenweise Visible-Session-Routen gehören ausschließlich zum isolierten [Visible-Session-Rollback](repo:docs/concept/runtime-workflows/chatgpt-visible-session-flow.md).

### Request- und Response-Struktur {#sec:srs-sync-payloads}

`PUT` überträgt `Content-Type: application/json` mit der Karten-Map eines Gedächtnisknotens (`nodeId`):

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

- `srsState` speichert die SRS-Felder (`interval`, `ef`/`easeFactor`, `repetition`/`repetitions`, `nextReview`, optional `lastReviewed`) sowie abwärtskompatible `verifiedRecall`-Metadaten (Browser-Sync kann keinen neuen Verified-Recall-Erfolg fälschen; siehe @ref{sec:workflow-step5}).
- `GET` liefert `200 OK` mit `{ "updatedAt": "...", "srsState": { ... } }` (bzw. `404 Not Found`, worauf der Client lokal weiterarbeitet).
- `PUT` bestätigt `200 OK` mit `{ "status": "ok", "savedAt": "...", "storedKeys": 42 }`.

### Speicherung, Datenschutz und Client-Verhalten {#sec:srs-sync-behavior}

- **Persistenz:** Speicherung als JSON-Datensatz pro `(learner, nodeId)` (z. B. `learner_client_state`) nach `updatedAt` ohne personenbezogene Angaben (keine Namen oder E-Mail-Adressen).
- **Client-Auslöser:** Automatische Synchronisation nach jeweils **20** bearbeiteten Karten sowie über manuelles **Speichern**; schlägt der Abgleich fehl, zeigt die UI den Fehler an und führt das lokale Üben unterbrechungsfrei fort.
