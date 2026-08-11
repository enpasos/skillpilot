# SkillPilot Coach v1: Release, Rollback und Stilllegung

**Stand:** 11. August 2026
**Status:** verbindliches Betriebsverfahren für die noch unveröffentlichte,
mehrsprachige Plugin-Linie V1

Dieses Runbook setzt den
[Versionierungs- und Lebenszyklusplan](../concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md)
operativ um. Es gilt für `skillpilot-coach-v1`.

## 1. Feste Identität und V1-Vertrag

| Bestandteil | Verbindlicher Wert |
| --- | --- |
| Plugin-Identität | `skillpilot-coach-v1` |
| Anzeigename | `SkillPilot Coach v1` |
| aktueller Paketstand | `1.0.0` |
| Contract Major | `1` |
| Lifecycle-Policy | `policyRevision=3` |
| öffentlicher MCP-Endpunkt und OAuth Resource/Audience | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Protected Resource Metadata | `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| Domain-Challenge | `https://mcp-coach-v1.skillpilot.com/.well-known/openai-apps-challenge` |
| aktive MCP-Apps-UIs | genau zwei: Lernzielbild und Karteikartenlernen |
| Support-URL | `https://skillpilot.com/imprint` |
| Veröffentlichungsstatus | noch nicht veröffentlicht; interner Draft `1.0.0-SNAPSHOT` |
| Quellpaket | `ai/openai plugin/skillpilot-coach-v1/` |

Permanente SkillPilot-ID, CREATE/EXISTING, Providerhinweis sowie Curriculum,
Stage, Subjects, Profile und Personalisierung werden ausschließlich im
First-Party-WebGUI konfiguriert. **Lernen starten** / **Start learning** erzeugt
bei jedem Aufruf eine frische opake `learningSessionId` und öffnet einen neuen
Chat mit der vorbereiteten Startnachricht. OAuth autorisiert die feste App,
wählt aber keinen Lernenden aus.

Ohne aktuelle Startnachricht ruft der Coach kein SkillPilot-Werkzeug auf. Er
gibt nur einen kurzen Hinweis in der Unterhaltungssprache mit dem festen Link
`https://skillpilot.com/` aus und stoppt. Vor jeder lernendenbezogenen
Coach-Antwort muss `get_skillpilot_context` im aktuellen Assistant-Turn
erfolgreich sein. Auf `SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED` und
`SESSION_VERSION_UNAVAILABLE` gibt der Coach `instruction` unverändert aus.
Fehlt es, verwendet er den exakten Eintrag aus `instructions` für die letzte
autoritative `communicationLocale`, andernfalls für die aktuelle
Unterhaltungssprache. Die exakte `startUrl` wird nur ergänzt, wenn sie nicht
bereits in der Instruktion steht. Es folgen keine Fachantwort, kein Retry der
alten Session und kein OAuth-Reconnect; die Fortsetzung erfolgt über die
WebGUI und den dadurch geöffneten neuen Chat.

Der Draft bindet genau zwei aktive content-addressierte MCP-Apps-Ressourcen:

- `render_skillpilot_goal_visualization` bindet ausschließlich die aktive
  bild-only Lernzielressource;
- `start_skillpilot_memory_practice` bindet ausschließlich die aktive
  Karteikartenressource; die Kartenbewertung bleibt app-only und ungebunden.

Alle bereits an reale Test-Clients beworbenen Start- und Bild-Hash-URIs bleiben
mit ihren exakten Bytes passiv lesbar. Diese Retention ist keine aktive
Funktion: Kein Werkzeug darf eine erhaltene Startressource binden. Bei einer
frischen `goalVisualization` plus Renderer-Freigabe läuft der Renderer einmal
mit der unveränderten `goalId`; die Top-Level-`stateVersion` wird in dessen
Eingabe `expectedStateVersion` kopiert. Eine alte oder bereits versuchte
Freigabe wird nicht wiederverwendet. Der Textpfad bleibt vollständig, auch
wenn der Host die optionale UI nicht darstellt.

Neue sessiongebundene Operationen benötigen mindestens `PT1H` Restlaufzeit;
exakt eine Stunde ist gültig. Ein bereits committeter identischer Write darf
sein gespeichertes Resultat nur bei noch nicht abgelaufener Session und
verfügbaren gepinnten Workflow-/Curriculumversionen replayen und führt keine
Mutation erneut aus.

Für den kontrollierten Live-Test darf nur der First-Party-Launch das optionale
`diagnosticSessionTtlSeconds` akzeptieren. Das Feld ist ausschließlich bei
aktivem Diagnose-Gate, als ganze Zahl von `3601..86400` und höchstens bis zur
normalen `PT24H`-Laufzeit zulässig. Es gilt nur für die von diesem Request
erzeugte Session. Bereits der nächste Launch ohne Feld verwendet automatisch
wieder `PT24H`; die globale TTL wird für den Test nicht geändert.

Maschinenlesbare Quellen der Wahrheit sind:

- `.codex-plugin/plugin.json` für Paket-SemVer und Listing;
- `release/line.json` für Contract Major, Endpoint und Zustandsversionen;
- `release/lifecycle.json` für Support-, Publikations- und Startstatus sowie
  die monotone `policyRevision`;
- `contracts/drafts/openai/skillpilot-coach-v1/<version>-SNAPSHOT/` für den
  fortschreibbaren unveröffentlichten Draft;
- `contracts/published/openai/skillpilot-coach-v1/<version>/` und
  `contracts/openai/skillpilot-coach-v1/release-index.json` ausschließlich für
  tatsächlich im OpenAI-Portal veröffentlichte Versionen.

Solange `1.0.0` nicht veröffentlicht wurde, bleibt die öffentliche Zielversion
unverändert. Interne Korrekturen aktualisieren denselben Draft; erst eine reale
Veröffentlichung versiegelt ihn.

## 2. Release vorbereiten

1. Release Notes, Lifecycle, Listing, Skill, Policy, Serververtrag und zentrale
   Dokumentation gemeinsam aktualisieren. Innerhalb des unveröffentlichten
   Drafts wird keine künstliche Patchversion erzeugt.
2. Die V1-URLs bleiben feste Vertragswerte im Backend-Artefakt. Geheimnisse und
   OAuth-Clientwerte bleiben ausschließlich in geschützter Konfiguration.
3. Generische und versionsspezifische Gates ausführen:

   ```bash
   npm --prefix "ai/openai app" test
   node scripts/check_openai_plugin_versioning.mjs
   node scripts/check_skillpilot_coach_plugin.mjs
   node scripts/openai_plugin_release.mjs candidate
   ```

4. Den internen Draft erzeugen oder aktualisieren:

   ```bash
   node scripts/openai_plugin_release.mjs prepare
   ```

   `prepare` ersetzt nur den unveröffentlichten Snapshot. Es ändert weder
   SemVer noch Published-Index und stoppt bei einer bereits veröffentlichten
   Version, unversionierten Plugin-Datei oder einem Symlink.
5. Quellen und Draft reproduzierbar prüfen:

   ```bash
   node scripts/openai_plugin_release.mjs verify
   npm --prefix app run check:docs-links
   npm --prefix app run check:docs-indexes
   git diff --check
   ```

6. Erst danach Backend und V1-Edge ausrollen, die App-Metadaten aktualisieren
   und in einem frischen Chat erneut scannen.

## 3. Release-Acceptance

Vor einer Portalaktualisierung sind mindestens folgende Nachweise erforderlich:

1. Discovery, Domain-Challenge, OAuth/PKCE, Resource-/Audience-Prüfung,
   Callback-Allowlist, Scope-Fehler und Revocation sind grün; Geheimnisse
   erscheinen weder in Antworten noch Logs.
2. CREATE und EXISTING, Providerhinweis und alle Level-2-Dimensionen
   funktionieren ausschließlich im First-Party-WebGUI.
3. Zwei aufeinanderfolgende WebGUI-Starts erzeugen verschiedene Sessionwerte
   und jeweils einen neuen Chat. Permanente SkillPilot-ID, OAuth-Werte und
   interne Lernziel-ID erscheinen nicht in der Startnachricht.
4. Ohne aktuelle Startnachricht erfolgt kein Toolaufruf, sondern nur der feste
   WebGUI-Hinweis. Mit Startnachricht läuft vor jeder sichtbaren Coach-Antwort
   ein erfolgreicher aktueller Kontextabruf.
5. Die drei Session-Recovery-Codes ergeben ausschließlich die servereigene
   Instruktion und nötigenfalls die nicht duplizierte `startUrl`; Fachantwort,
   OAuth-Neuverbindung und Weiterarbeit mit der alten Session bleiben aus.
6. Chatseitig funktionieren nur die ausdrücklichen Level-3-Änderungen von Fokus
   und aktivem Ziel. Level 2 wird weder abgefragt noch mutiert.
7. `resources/list` enthält genau zwei aktiv gebundene UI-Ressourcen und alle
   beworbenen Vorgänger byte-identisch passiv. Bild- und Kartenwerkzeug binden
   ausschließlich ihre jeweilige aktive Ressource.
8. Das Lernzielbild erscheint nur bei frischer passender Projektion und
   Freigabe. Ohne Bild, bei Clusterzielen oder nach veralteter Freigabe gibt es
   keinen Renderer-Aufruf und keine leere UI; der Text bleibt vollständig.
9. Normales Karteikartenlernen verändert nur die Wiederholungsplanung und bleibt
   vom strengen Verified Recall getrennt. Orientierung, dialogisches Lernen,
   Mastery und Prüfung erfüllen ihre jeweiligen Evidenz- und Feedbackregeln.
10. Der Session-Guard akzeptiert exakt `PT1H`, lehnt neue Operationen darunter
    ab und replayt einen zulässigen identischen Write höchstens ohne neue
    Mutation.
11. Der requestlokale Test mit `3660` Sekunden oder optional `5400` Sekunden
    zeigt den Guard-Übergang. `3600`, `86401`, Werte über der normalen Laufzeit
    und das Feld bei deaktiviertem Gate scheitern fail-closed. Der unmittelbar
    folgende Launch ohne Feld liefert wieder `PT24H`.
12. Sicherheits-, Datenschutz-, Rechts-, Client- und Verhaltensabnahme sind
    dokumentiert. Dieses Runbook behauptet keinen zusätzlichen
    ID-in-Komponente-Submission-Blocker; die V1-Identitätsverarbeitung liegt im
    First-Party-WebGUI.

Erst nach erfolgreichem **Publish** im OpenAI-Portal wird der geprüfte Draft
unveränderlich registriert:

```bash
node scripts/openai_plugin_release.mjs record-published \
  --confirm-openai-published
```

Vorher darf `release-index.json` die Version nicht als veröffentlicht führen.

## 4. Rollback innerhalb von V1

Ein Rollback ändert weder Plugin-Identität noch Contract Major, MCP-Origin oder
OAuth-Resource.

1. Schreiboperationen bei Datenintegritätsrisiko über den Kill-Switch
   deaktivieren.
2. Den letzten grünen Backend-/Edge-Build wiederherstellen.
3. Für eine veröffentlichte Version nur den unveränderten Snapshot unter
   `contracts/published/` verwenden.
4. Fehlerhafte veröffentlichte Skill- oder Listing-Metadaten mit einer neuen
   kompatiblen Patchversion beheben; eine publizierte Version nie neu befüllen.
5. OAuth-Tokens oder Lernsessionen nur bei einem konkreten Sicherheits- oder
   Datenintegritätsgrund pauschal widerrufen.

## 5. Deprecation, Unpublish und Löschung

Die Zustandsänderung beginnt in `release/lifecycle.json`:

- `SUPPORTED`: funktionsfähig und sicherheitsgepflegt, aber nicht empfohlen;
- `DEPRECATED`: funktionsfähig mit Nachfolger und veröffentlichten Fristen;
- `UNPUBLISHED`: keine Neuinstallation, bestehende Installationen bleiben bis
  zum dokumentierten Supportende funktionsfähig;
- `RETIRED`: kontrollierte Ablehnung ohne Verlust globalen Lernstands.

Unpublish ist kein technischer Shutdown. Eine Linie wird erst gelöscht, wenn
Support-, Unpublish- und Löschfristen abgelaufen sind, keine unterstützten
Installationen oder Migrationspfade verbleiben und globale Mastery unabhängig
erhalten bleibt. Veröffentlichte Snapshots, Release Notes und Auditnachweise
bleiben unveränderlich. MCP-Origin, OAuth-Resource und UI-Artefakte werden erst
nach dem letzten unterstützten Client entfernt.

Eine zukünftige V2 überschreibt V1 nie still. Beide Linien besitzen getrennte
Identitäten, Origins, Resources, Skills, Snapshots, Telemetrie und
Lebenszyklen.
