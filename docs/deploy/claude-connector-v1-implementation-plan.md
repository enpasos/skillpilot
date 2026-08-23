# SkillPilot Claude Connector v1 — Umsetzungsplan

**Status:** Claude-v1-only Product-Owner-Unfreeze vom 23. August 2026;
Pre-Submission-Kandidat wird auf First-Party-24h-Lernsessions umgebaut;
externe Abnahme und Veröffentlichung nicht freigegeben

**Stand:** 23. August 2026

**Repository-Basis:** `main` bei `f405abce61a3`

**Architekturgrundlage:**
[SkillPilot Claude Connector v1 — one-JVM architecture and service concept](claude-connector-v1-concept.md)

**Verbindliche Schutzregel:**
[SkillPilot Coach v1.0.0: aktive OpenAI-Review-Sperre](openai-plugin-v1-review-freeze.md)

Dieser Plan übersetzt das beschlossene Claude-Konzept in ausführbare
Arbeitspakete. Er ersetzt keine Product-Owner-, Security-, Legal- oder
Release-Freigabe.

> **Ablösung des alten Plans:** Die bis 21. August beschriebene verschlüsselte
> ID-Datei-/Binding-Seite ist vollständig verworfen. Verbindlich ist nur die in
> dieser Revision beschriebene Zielstruktur: lernendenfreies Connector-OAuth,
> First-Party-Start unter `https://skillpilot.com/?coach=claude`, eine opake
> `spc_`-Lernsession für exakt 24 Stunden und die permanente ID ausschließlich
> innerhalb SkillPilots. Widersprechende ältere Evidenz ist nicht wiederverwendbar.

> **Unverhandelbare Abgrenzung:** Die bestehende OpenAI App wird weiter
> genutzt. `ai/openai app/**`, der eingereichte OpenAI-Plugin-Kandidat und sein
> beobachtbarer V1-Vertrag dürfen durch diese Arbeit weder gelöscht, ersetzt,
> umbenannt noch funktional verändert werden. Claude v1 kommt als zusätzliche,
> standardmäßig deaktivierte Provider-Lane in dasselbe Backend.

---

## 1. Zielzustand

Am Ende der Umsetzung existiert ein providerisolierter Remote-MCP-Connector für
Claude mit folgenden Eigenschaften:

- öffentliche MCP-URL
  `https://mcp-claude-v1.skillpilot.com/mcp`;
- eigener OAuth-Issuer, eigene Client-, Token-, Scope-, Subject- und
  Capability-Grenzen;
- Betrieb im bestehenden Spring-Boot-Deployable, in derselben JVM, demselben
  systemd-Dienst und über denselben Datasource-Pool;
- keine zweite JVM, kein zusätzlicher Backend-Port, kein zweiter
  Connection-Pool und kein eingebettetes Modell;
- Wiederverwendung der kanonischen Lernzustandsregeln ausschließlich über
  `CoachToolFacade` und `CoachStateProjection`;
- gemeinsamer kanonischer Lernfortschritt für WebGUI, ChatGPT und Claude mit
  optimistischer Nebenläufigkeitskontrolle;
- genau zwölf Werkzeuge für Lernbegleitung, Lernzielvisualisierung, normale
  Karteikartenübung, Level-3-Fokus, aktives Lernziel, Mastery, Verified Recall
  und Prüfungsmodus;
- keine Änderung der Personal-Curriculum-Konfiguration auf Level 2;
- zwei content-addressed MCP Apps für das freigegebene Lernzielbild und private
  normale Karteikartenübung; Kartenbewertungen ändern nur den
  Wiederholungsplan, niemals Mastery;
- das Claude-Plugin als bevorzugte Einmal-Installation mit Skill und demselben
  Remote-MCP-Server; beide MCP Apps kommen über den Connector, eine getrennte
  Installation bleibt nur Fallback ohne Funktionsvorteil;
- jede Lernsitzung startet ausschließlich über
  `https://skillpilot.com/?coach=claude` im gemeinsamen SkillPilot-Webstart;
  die lernende Person wählt dort sichtbar ID, Curriculum, persönliches
  Curriculum und Claude, bevor eine opake `spc_`-Kennung ausgestellt wird, die
  exakt 24 Stunden nach Ausstellung endet;
- dauerhaftes Connector-OAuth einschließlich `offline_access` bleibt reiner
  Transport und enthält oder wählt keine Lernendenidentität;
- der alte Claude-Beta-Endpunkt bleibt deaktiviert und ist weder Grundlage
  noch Fallback des neuen Connectors.

Die Produktionstopologie ist:

```text
Claude ── HTTPS ──> neuer Claude-v1-nginx-vhost
                         │ exakte Pfadumschreibung
                         v
                  bestehender Spring-Boot-Prozess
                         │
                 Claude-v1-Package ──> CoachToolFacade
                         │                    │
                  eigenes OAuth/             v
                  MCP/Idempotenz       kanonischer Lernzustand

ChatGPT ─────────> bestehende, eingefrorene OpenAI-v1-Lane ──┘
WebGUI ──────────> bestehende First-Party-Lane ───────────────┘
```

Die gemeinsame JVM ist bewusst gewählt, weil die Produktionsmaschine nicht
genug RAM für einen zweiten Prozess hat. Sie beseitigt nicht das gemeinsame
Crash-, Heap-, Startup- und Migrationsrisiko. Dieses Restrisiko wird durch
Fail-closed-Konfiguration, begrenzte Ressourcen, Differentialtests,
Disabled-first-Rollout und schnellen Rollback kontrolliert.

---

## 2. Harte Arbeitsgrenzen

### 2.1 Nicht ändern

Der Entwickler darf im Rahmen dieses Vorhabens insbesondere nicht ändern:

- `ai/openai app/**`;
- `ai/openai plugin/skillpilot-coach-v1/**`;
- `contracts/openai/skillpilot-coach-v1/**`;
- den eingereichten OpenAI-Snapshot, dessen Hashanker, Reviewvideo,
  Reviewfixtures oder Portalwerte;
- `backend/src/main/java/com/skillpilot/backend/ai/CoachToolFacade.java`;
- `backend/src/main/java/com/skillpilot/backend/ai/CoachStateProjection.java`;
- OpenAI-OAuth-, MCP-, Session-, Widget-, mTLS- oder Edge-Code;
- `app/src/components/SessionSetup.tsx` oder den bestehenden
  First-Party-Startablauf;
- `backend/src/main/resources/application.yml`;
- bestehende OpenAI-nginx-Dateien;
- Tabellen, Records oder Endpunkte der pausierten Claude-Beta durch
  Umdeutung, Migration oder Löschung.

Wenn eine notwendige Funktion über die heutigen öffentlichen Fassaden nicht
sicher ausdrückbar ist, wird die betreffende Claude-Funktion verschoben. Es
wird kein direkter Schreibzugriff auf Learner-Tabellen und kein
providerlokaler fachlicher Workaround eingebaut.

### 2.2 Zulässige neue Bereiche

Vorgesehene neue Implementierungsbereiche sind:

```text
backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/
backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/
backend/src/main/resources/claude-connector-v1/
ai/claude/app/
ai/claude/connector-v1/
ai/claude/plugin/skillpilot-coach-v1/
deploy/nginx/skillpilot-claude-connector-v1.conf
docs/deploy/claude-connector-v1-*.md
```

Eine additive Liquibase-Datei und ihre Aufnahme in den Master-Changelog sind
erst nach Freigabe des gemeinsamen Startup-Effekts zulässig.

### 2.3 Stop-Bedingungen

Die Arbeit stoppt und wird an Product Owner beziehungsweise Security
eskaliert, wenn mindestens eine dieser Bedingungen eintritt:

- eine Änderung an einem eingefrorenen OpenAI-Pfad oder -Vertrag wäre nötig;
- der neue Connector benötigt eine weitere Backend-JVM oder einen weiteren
  Datasource-Pool;
- Beta und v1 lassen sich nicht fail-closed gegenseitig ausschließen;
- Claude-v1-Token oder Capabilities funktionieren auf einer anderen
  Provider-Lane;
- eine Schreiboperation kann `expectedStateVersion` und Idempotenz nicht vor
  der Mutation prüfen;
- eine permanente SkillPilot-ID, ID-Datei oder ein ID-Datei-Passwort müsste
  Claude, OAuth, MCP oder Logs erreichen;
- OAuth oder Refresh könnte eine Lernsession auswählen, erzeugen, erneuern oder
  über die exakt 24 Stunden hinaus verlängern;
- Prüfungs- oder Recall-Lösungen würden im normalen Coach-Kontext sichtbar;
- ein erforderlicher Security-Matcher fällt auf die aktuell permissive
  Default-`SecurityFilterChain` zurück;
- die vereinbarte RAM-, Pool- oder OpenAI-Latenzgrenze wird überschritten;
- ein Freeze-, Contract- oder Differentialtest schlägt fehl.

---

## 3. Freigaben vor dem ersten produktionswirksamen Code

Die folgenden Entscheidungen werden in einem kurzen Decision Record mit Datum,
Owner und Ergebnis festgehalten. Offene Punkte sind keine stillschweigende
Zustimmung.

| Gate | Entscheidung | Verantwortlich | Blockiert |
| --- | --- | --- | --- |
| A | Branch-/Merge-Regel während des OpenAI-Reviews | Product Owner/Release | Merge in einen deploybaren Branch |
| B | Exakter Effekt auf den gemeinsamen Backend-Build und Behandlung des laufenden OpenAI-Reviews | Product Owner/Release | jedes Produktionsdeployment |
| C | OAuth-CIMD-Policy für Hosted Claude und Claude Code | Security | OAuth-Implementierung |
| D | First-Party-Start, exakt 24h `spc_`, all-tool session binding und OAuth/Session-Trennung | Security/Product | öffentlicher Lernzugriff |
| E | Claude-spezifische Datenschutzerklärung, Retention und Mindestalter | Legal/Product | Real-User-Test und Veröffentlichung |
| F | Numerisches RAM-, Thread-, Pool- und Latenzbudget | Operations | Lasttest und Aktivierung |
| G | Publisher-Organisation und Directory-Berechtigung | Product/Operations | Directory-Einreichung |
| H | Reviewer-Testkonto mit realistischem, aber wegwerfbarem Lernzustand | Product/QA | Directory-Einreichung |

Die Product-Owner-Entscheidung vom 23. August 2026 gibt ausschließlich den
providerisolierten Umbau des noch nicht eingereichten Claude-v1-Kandidaten frei.
Sie hebt die OpenAI-Review-Sperre nicht auf und ist keine automatische Merge-,
Produktions-, Restart- oder Portal-Freigabe. Diese Wirkungen bleiben über Gate
B und das Release-Runbook separat zu entscheiden.

---

## 4. Öffentlicher und interner Vertrag

Vor der Implementierung werden die folgenden Pfade in einem Contract-Test
festgeschrieben. Discovery-Dokumente und Redirects nennen ausschließlich die
öffentlichen HTTPS-URLs; der interne Präfix ist kein öffentlicher Alias.

| Externer Pfad am Claude-v1-Host | Interner Spring-Pfad |
| --- | --- |
| `/mcp` | `/internal/connectors/claude/v1/mcp` |
| `/.well-known/oauth-protected-resource/mcp` | `/internal/connectors/claude/v1/oauth/protected-resource` |
| `/.well-known/oauth-authorization-server` | `/internal/connectors/claude/v1/oauth/authorization-server` |
| `/oauth2/authorize` | `/internal/connectors/claude/v1/oauth2/authorize` |
| `/oauth2/token` | `/internal/connectors/claude/v1/oauth2/token` |
| `/oauth2/revoke` | `/internal/connectors/claude/v1/oauth2/revoke` |
| `/privacy` | `/internal/connectors/claude/v1/privacy` |

Zusätzliche Regeln:

- `resource` ist exakt
  `https://mcp-claude-v1.skillpilot.com/mcp`, einschließlich `/mcp`;
- der Issuer ist exakt `https://mcp-claude-v1.skillpilot.com`;
- unbekannte Pfade, Hosts und Versionsnamen liefern `404`;
- die internen Pfade liefern über `skillpilot.com` und den OpenAI-Host
  ebenfalls `404`;
- nginx überschreibt die externen Pfade deterministisch und leitet keine
  beliebigen Unterpfade weiter;
- Anwendung und Edge prüfen Host, externen Resource-Identifier und internen
  Pfad unabhängig voneinander;
- `/api/claude/mcp` bleibt der deaktivierte Beta-Pfad und wird nie Alias oder
  Fallback für v1.

---

## 5. Zielstruktur im Backend

Die Klassennamen sind eine konkrete Startvorgabe. Abweichungen sind zulässig,
wenn Package-Grenze und Verantwortlichkeiten erhalten bleiben.

```text
connectors/claude/v1/
├── ClaudeV1Contract.java
├── ClaudeV1Properties.java
├── ClaudeV1Configuration.java
├── ClaudeV1RuntimeValidation.java
├── session/
│   ├── ClaudeV1LearningSession.java
│   ├── ClaudeV1LearningSessionRepository.java
│   ├── ClaudeV1LearningSessionService.java
│   └── ClaudeV1SessionTokenCodec.java
├── oauth/
│   ├── ClaudeV1OAuthConfiguration.java
│   ├── ClaudeV1OAuthMetadataController.java
│   ├── ClaudeV1CimdMetadataValidator.java
│   ├── ClaudeV1OpaqueTokenIntrospector.java
│   └── ClaudeV1TokenLifecycleService.java
├── mcp/
│   ├── ClaudeV1McpServerConfiguration.java
│   ├── ClaudeV1McpContractAdapter.java
│   ├── ClaudeV1CoachContextProjector.java
│   └── ClaudeV1CapabilityService.java
├── persistence/
│   ├── ClaudeV1IdempotencyRecord.java
│   └── ClaudeV1IdempotencyRepository.java
├── observability/
│   └── ClaudeV1Telemetry.java
└── web/
    ├── ClaudeV1CoachUiController.java
    ├── ClaudeV1CoachStartRequest.java
    └── ClaudeV1LaunchResponse.java
```

Keine v1-Klasse importiert eine Klasse aus
`com.skillpilot.backend.openai...` oder
`com.skillpilot.backend.claude...`. Zulässige gemeinsame Abhängigkeiten sind
providerneutrale API-, AI-, MCP-, Domain- und Service-Grenzen.

---

## 6. Arbeitspakete

### WP0 — Baseline und Schutzbeweis

**Zweck:** Vor jeder Implementierung eine reproduzierbare OpenAI- und
Repository-Baseline sichern.

**Aufgaben:**

1. Aktuellen Commit, Java-/Node-Version und sauberen Worktree dokumentieren.
2. Alle vier OpenAI-Freeze-/Contract-Prüfungen ausführen.
3. Den exportierten OpenAI-V1-Contract-Fingerprint und das zwölf Werkzeuge
   umfassende Toolset als Testbaseline referenzieren, nicht neu veröffentlichen.
4. Eine Datei-Matrix `create`, `read-only reference`, `forbidden` in der
   Implementierungs-PR-Beschreibung führen.
5. CI so planen, dass Änderungen unter den verbotenen Pfaden für diese Arbeit
   sofort fehlschlagen.

**Abnahme:** Freeze- und Contract-Prüfungen sind grün; kein OpenAI-Byte wurde
verändert.

**Aufwand:** 0,5–1 Personentag.

### WP1 — Deaktiviertes Package und fail-closed Konfiguration

**Zweck:** Eine neue, bei fehlender Freigabe vollständig inaktive Provider-Lane
anlegen.

**Aufgaben:**

1. `ClaudeV1Properties` mit Präfix
   `skillpilot.claude.connector.v1` implementieren.
2. Master-Schalter standardmäßig `false`; keine `matchIfMissing=true`-Semantik.
3. Konfiguration ausschließlich über Environment/System Properties binden;
   `application.yml` bleibt unverändert.
4. Beim Aktivieren folgende Werte fail-closed validieren: öffentlicher Origin,
   Issuer, Resource, interner Basis-Pfad, separates Capability-/Hash-Secret,
   Access-/Refresh-TTL, Cache- und Response-Grenzen sowie Rate-Limits.
5. Startup abbrechen, wenn gleichzeitig `skillpilot.claude.enabled=true` und
   `skillpilot.claude.connector.v1.enabled=true` sind.
6. Keine eigenen Executor-, Scheduler-, Webserver- oder Datasource-Beans
   anlegen.

**Tests:**

- disabled: keine v1-Router, Filter, OAuth-, MCP- oder Telemetrie-Beans;
- enabled mit unvollständiger Konfiguration: Startup schlägt verständlich und
  ohne Secret-Ausgabe fehl;
- Beta plus v1: Startup schlägt fehl;
- OpenAI plus v1: beide disjunkten Kontexte starten;
- keine mehrdeutige unqualifizierte Bean-Injektion.

**Abnahme:** Mit Schalter `false` ist die öffentliche Route nicht vorhanden und
der OpenAI-Contract-Fingerprint bleibt identisch.

**Aufwand:** 1–2 Personentage.

### WP2 — Exakte Routing- und Security-Grenze

**Zweck:** Sicherstellen, dass keine Claude-Anfrage in die permissive
Default-Chain oder eine andere Provider-Lane fällt.

**Aufgaben:**

1. Alle Pfade in `ClaudeV1Contract` als Konstanten definieren.
2. Zwei exakte Security-Chains implementieren:
   OAuth/Connect und MCP-Resource-Server.
3. Auf der heutigen Repository-Basis `@Order(5)` und `@Order(6)` verwenden:
   Beta 1/2 ist gegenseitig ausgeschlossen, OpenAI belegt 3/4, die unnummerierte
   Default-Chain bleibt danach. Änderungen dieser Reihenfolge benötigen einen
   neuen vollständigen Chain-Test.
4. `securityMatcher` ausschließlich auf den internen v1-Pfaden verwenden; kein
   generisches `/oauth2/**` und kein alleiniger Host-Matcher.
5. Host-/Origin-Grenze zusätzlich in der Anwendung prüfen. Weitergeleitete
   Header gelten nur aus der bekannten Reverse-Proxy-Grenze.
6. Unauthentifizierte MCP-Aufrufe mit `401` und korrektem
   `WWW-Authenticate: Bearer resource_metadata="..."` beantworten.
7. Unknown path, wrong host, wrong version und Beta-Pfad jeweils mit `404`
   beziehungsweise fail-closed Auth-Fehler testen.

**Tests:** MockMvc-/Embedded-Server-Matrix für jeden öffentlichen und internen
Pfad, jeden Host und beide Provider-Tokenrichtungen.

**Abnahme:** Kein v1-Pfad erreicht die Default-Chain; Claude-Token funktionieren
nur am exakten Claude-v1-Resource-Identifier.

**Aufwand:** 2–3 Personentage.

### WP3 — OAuth 2.1, CIMD und Token-Lifecycle

**Zweck:** Hosted Claude und Claude Code sicher anbinden, ohne DCR und ohne
statische Anthropic-Secrets.

**Aufgaben:**

1. Protected Resource Metadata und Authorization Server Metadata ausliefern.
2. In der Server-Metadatei
   `client_id_metadata_document_supported: true`,
   `token_endpoint_auth_methods_supported: ["none"]` und
   `code_challenge_methods_supported: ["S256"]` veröffentlichen.
3. Nur diese CIMD-Client-IDs zulassen:
   `https://claude.ai/oauth/mcp-oauth-client-metadata` und
   `https://claude.ai/oauth/claude-code-client-metadata`.
4. CIMD-Dokumente mit kurzen Connect-/Read-Timeouts, harter Body-Grenze,
   JSON-Schemavalidierung, Self-reference-Prüfung, begrenztem Cache und ohne
   Redirect auf fremde/private Ziele laden.
5. Hosted-Callback exakt auf
   `https://claude.ai/api/mcp/auth_callback` beschränken.
6. Für Claude Code nur `http://127.0.0.1:<ephemeral>/callback` und
   `http://localhost:<ephemeral>/callback` akzeptieren. Beim Vergleich darf nur
   der Port variieren; Schema, Host und Pfad bleiben exakt.
7. Authorization Code plus PKCE S256 erzwingen; `plain`, fehlende Challenge,
   DCR und Client-Credentials-Grant ablehnen.
8. Token-Endpunkt für
   `application/x-www-form-urlencoded` implementieren.
9. Kurze opaque Access Tokens, rotierende Refresh Tokens,
   Refresh-Replay-Erkennung, `invalid_grant` und Revocation implementieren.
10. Read- und Write-Scope trennen; `resource`/Audience bei Authorization,
    Token-Ausgabe und Introspection exakt prüfen.
11. `clientInfo` nur für Telemetrie verwenden, nie für Autorisierung.

Die vorhandenen generischen OAuth-Tabellen und
`ProviderScopedOAuth2AuthorizationService` dürfen genutzt werden, sofern der
v1-Client-Repository-Wrapper alte Claude-Beta- und OpenAI-Datensätze sicher als
fremd behandelt. Beta-OAuth-Klassen werden nicht wiederverwendet.

**Tests:** Hosted- und Code-Flow, PKCE-Negativfälle, Redirect-Manipulation,
SSRF/DNS/Redirect-Negativfälle, Resource-Mismatch, Scope-Mismatch,
Refresh-Rotation/Replays, Revocation und Token-Cross-Provider-Matrix.

**Abnahme:** Beide offiziellen Claude-Clienttypen funktionieren; DCR ist nicht
vorhanden; ein Token ist auf genau Client, Connection, Scope und Claude-v1-
Resource gebunden.

**Aufwand:** 5–8 Personentage plus Security Review.

### WP4 — First-Party-Lernsitzung sicher ausstellen

**Zweck:** Einen vorhandenen pseudonymen SkillPilot-Lernzustand für höchstens
24 Stunden freigeben, ohne die permanente ID an Claude oder OAuth zu geben.

**Aufgaben:**

1. Eine isolierte First-Party-Route
   `https://skillpilot.com/?coach=claude` bereitstellen; bestehende
   ChatGPT-Startbytes und -Semantik nicht ändern.
2. Der First-Party-POST
   `/api/ui/learners/{skillpilotId}/claude/v1/launch` wählt den Learner nur
   innerhalb der SkillPilot-WebGUI und gibt niemals die permanente ID an
   Claude zurück.
3. `ClaudeV1SessionTokenCodec` erzeugt eine opake `spc_`-Kennung mit 43
   Base64url-Zeichen und HMAC-Integrität.
4. `ClaudeV1LearningSessionService` setzt `SESSION_TTL` exakt auf 24 Stunden;
   Nutzung verschiebt das Ende nicht.
5. Jede der zwölf Tool-Schemas verlangt `learningSessionId`; das gilt explizit
   auch für `review_skillpilot_memory_practice_card`.
6. Toolaufrufe prüfen Learner-Session und Connector-OAuth getrennt. OAuth und
   `offline_access` dürfen keine Lernsession auswählen, ausstellen, erneuern
   oder verlängern.
7. Fehlende, manipulierte, abgelaufene und fremde Sessions scheitern
   fail-closed; ein neuer First-Party-Start ist die einzige Erneuerung.
8. Keine permanente ID oder OAuth-Zugangsdaten in URL, Referrer, Analytics,
   Logs, Toolergebnissen oder normalem Claude-Text. Einzige explizite
   V1-Ausnahme ist der vom Nutzer gewählte Web-Handoff: genau eine aktuelle
   24-Stunden-Session steht URL-kodiert im einzigen `q`-Parameter von
   `https://claude.ai/new`, damit Claude die Startnachricht vorbefüllt. Sie
   darf weder von SkillPilot analysiert oder geloggt noch automatisch gesendet
   werden; der Nutzer prüft und sendet selbst.

**Tests:** Tokenformat und HMAC, exakt 24h mit kontrollierter Uhr, fehlende und
abgelaufene Session, Cross-Learner/Session, all-tool Schema-Guard, app-only
Review-Guard, OAuth-Refresh bei abgelaufener Session, Log-Redaktion sowie
strikte Web-Handoff-Allowlist mit exakt einem `q`-Parameter und ohne permanente
ID, Zusatzparameter, Fragment, Zugangsdaten, Fremdhost oder Auto-Send.

**Abnahme:** Eine bestehende Testperson startet über SkillPilot; alle zwölf
Tools funktionieren nur mit der aktuellen Session; nach exakt 24 Stunden ist
ein neuer Start nötig, während der Connector verbunden bleiben darf; Claude
sieht nie die permanente ID.

**Aufwand:** 3–5 Personentage plus Threat-Model Review.

### WP5 — Provider-Persistenz, Revision und Idempotenz

**Zweck:** Genau-einmalige Schreibsemantik auf dem gemeinsamen kanonischen
Lernzustand herstellen.

**Aufgaben:**

1. Bestehende OAuth-Tabellen nur über ein v1-spezifisches
   `RegisteredClientRepository` und den provider-scoped Wrapper ansprechen.
2. Nicht auf `claude_connection`, `claude_binding_grant` oder
   `claude_pending_launch` zugreifen.
3. Die bereits produktiv ausgeführte Migration
   `023-add-claude-connector-v1.yaml` niemals ändern. Den Modellwechsel nur
   additiv über `024-replace-claude-v1-binding-with-learning-sessions.yaml`
   durchführen.
4. IDs und One-time-Handles nur gehasht speichern, soweit ein späterer
   Klartextvergleich nicht nötig ist. Keine Tokens, Passwörter, Prompts,
   Antworten oder Lösungen im Audit.
5. Sessionauflösung und Idempotenz in den providerisolierten Services halten.
   Sie dürfen keine OpenAI-Klasse importieren, übernehmen aber dieselben
   kanonischen Garantien:
   Learner-Lock, Vergleich von `expectedStateVersion`, UUID-
   `clientRequestId`, Request-Hash, atomare Mutation und deterministischer
   Replay des begrenzten Ergebnisses.
6. Vor jeder Mutation die aktuelle `Learner.coachStateRevision` prüfen. Nach
   erfolgreicher Mutation muss die Revision genau entsprechend der kanonischen
   Domainregel fortgeschritten sein.
7. Idempotenzdaten mit kurzer, dokumentierter TTL löschen. Replay-Payloads
   dürfen ausschließlich die begrenzte, bereits an den Client ausgegebene
   Zustandsprojektion enthalten, keine Chat- oder Learner-Antworten.
8. Revocation löscht oder sperrt nur die gewählte Claude-v1-Verbindung und
   deren Token/Transaktionen; der Lernzustand und andere Provider bleiben
   erhalten.

**Tests:** Duplicate Request, gleiche UUID mit anderem Payload, stale revision,
parallele Writes, Rollback nach Exception, Token-Revocation und
Migrations-Backward-Compatibility bei deaktiviertem v1.

**Abnahme:** Kein last-writer-wins-Verlust; Dubletten erzeugen keine zweite
Mutation; Beta- und OpenAI-Datensätze bleiben unangetastet.

**Aufwand:** 4–6 Personentage.

### WP6 — MCP-Vertrag und providerisolierte MCP Apps

**Zweck:** Die kleinste sichere Claude-v1-Werkzeugoberfläche mit Parität der
zwölf Lernverantwortlichkeiten bereitstellen.

Vorgesehene Namen und Annotationen:

| MCP-Tool | Klasse | Annotation | Fachliche Grenze |
| --- | --- | --- | --- |
| `get_skillpilot_coach_context` | read | `readOnlyHint: true` | projizierter aktueller Zustand, keine versteckte Mutation |
| `render_skillpilot_goal_visualization` | read + App | `readOnlyHint: true` | freigegebenes Bild nur für das exakte aktive Ziel und den aktuellen Zustand |
| `start_skillpilot_memory_practice` | read + App | `readOnlyHint: true` | private vollständige Fälligkeitsauswahl, keine Mastery-Mutation |
| `review_skillpilot_memory_practice_card` | app-only write | `destructiveHint: false` | exakt angezeigte Karte; nur Wiederholungsplan, niemals Mastery |
| `get_skillpilot_navigation_options` | read | `readOnlyHint: true` | aktuelle Level-3-Optionen, kein Level 2 |
| `set_skillpilot_focus` | write | `destructiveHint: true` | exakt eine frisch publizierte Focus-Option |
| `set_skillpilot_active_goal` | write | `destructiveHint: true` | erlaubtes aktives Ziel, expliziter Redirect |
| `set_skillpilot_mastery` | write | `destructiveHint: true` | aktives Ziel, Orientation-/Exam-Regeln |
| `start_skillpilot_verified_recall` | read | `readOnlyHint: true` | servergewählter vollständiger Batch ohne Zustandsmutation |
| `get_skillpilot_verified_recall_answers` | sensitive read | `readOnlyHint: true` | capability-gebundene Gesamtantworten |
| `record_skillpilot_verified_recall_results` | write | `destructiveHint: true` | ein vollständiger atomarer Befund |
| `get_skillpilot_exam_evaluation` | sensitive read | `readOnlyHint: true` | freigegebene Lösung/Rubrik für aktives Exam |

Jedes Tool erhält zusätzlich einen menschlich lesbaren `title`. Namen bleiben
unter 64 Zeichen. Beschreibungen erklären ausschließlich Zweck,
Aufrufzeitpunkt und tatsächliche Datenwirkung; Coaching-Anweisungen gehören in
die Server Instructions.

**Adapter-Regeln:**

1. `CoachToolFacade` und `CoachStateProjection` werden per Konstruktor
   injiziert und nur über ihre öffentlichen Methoden verwendet.
2. Kein v1-Ergebnis enthält `skillpilotId`, OAuth-Subject, Token, interne URL
   oder ungefilterte Exam-Lösung außerhalb des Evaluation-Tools.
3. Read-Tools verändern weder Lernzustandsrevision noch Retention-/Activity-
   Zeitstempel. Reine technische Metriken dürfen aggregiert werden.
4. Jede Write-Schema verlangt `expectedStateVersion` und `clientRequestId`,
   sofern eine serverseitige Capability diese Werte nicht bereits eindeutig
   bindet.
5. `set_skillpilot_focus` akzeptiert ausschließlich eine aktuell durch die
   kanonische Fassade publizierte `selectionGoalIds`-Liste.
6. `set_skillpilot_mastery` akzeptiert nur das aktive atomare Ziel und bildet
   Orientation, normale Kompetenz, Memory und Exam getrennt ab.
7. Toolantworten sind größenbegrenzt, zweisprachig projizierbar und enthalten
   klare, maschinenlesbare Fehlercodes für Input, Auth, Conflict, Stale State
   und Capability-Mismatch.
8. Keine Catch-all-API und kein freies URL-, Method- oder Query-Argument.
9. Beide UI-Ressourcen sind content-addressed und nutzen den MCP-Apps-MIME-Typ.
   Vorderseite, Rückseite und Review-Capability einer Karte stehen nur in
   Component-Metadaten; der modell-sichtbare Receipt enthält nur begrenzten
   Status und Fortschritt.
10. Das Review-Tool ist nur für die App sichtbar und bindet Verbindung, Ziel,
    Karte, Ausgaberevision und Ablaufzeit kryptographisch. Es akzeptiert nur
    `not_known` oder `known` und eine frische `clientRequestId`.

**Abnahme:** Toolkatalog enthält exakt zwölf freigegebene Werkzeuge, zwei
Ressourcen, korrekte Schemas und Annotationen; alle gültigen Aufrufe liefern
fachliche Antworten statt generischer 400/500-Fehler. Normale Kartenpraxis ist
in Tests von Verified Recall und Mastery getrennt.

**Aufwand:** 5–8 Personentage einschließlich Contract-Tests.

### WP7 — Verified Recall und Prüfungs-Capabilities

**Zweck:** Lösungsmaterial nur im vorgesehenen, providergebundenen Ablauf
freigeben.

**Verified Recall:**

- Start-Tool übernimmt weder `goalId` noch `batchSize` vom Modell, sondern
  verwendet aktives Memory-Ziel und serverbestimmte vollständige Batchgröße.
- Es ruft die Facade-Variante ohne callergewählte Batchgröße auf.
- Die Batch-Capability bindet Provider, Claude-v1-Verbindung, Learner, Ziel,
  Karten-IDs in Reihenfolge, Anzahl, Ausgaberevision und Ablaufzeit.
- Answer-Tool gibt alle Sollantworten als einen vollständigen Satz aus und
  erzeugt eine getrennte Grading-Capability. Der Modellablauf ruft es genau
  einmal auf; ein technisch identischer Retry bleibt idempotent und verändert
  keinen Zustand.
- Record-Tool akzeptiert genau einen geordneten Befund für jede Karte. Fehlende,
  zusätzliche, vertauschte oder fremde Karten führen ohne Teilmutation zum
  Fehler.
- Backend-Mastery und Continuation kommen ausschließlich aus der kanonischen
  Batch-Funktion; das Modell speichert keine zusätzliche Memory-Mastery.

**Prüfung:**

- Normaler Coach-Kontext enthält Aufgabe und höchstens Maximalpunktzahl, nie
  Lösung, Passing Points oder Rubrik.
- Evaluation-Tool prüft aktives Exam, Zustand und Claude-v1-Verbindung und
  mintet eine kurze provider-/learner-session-/goal-/revisiongebundene
  Evaluation-Capability.
- Exam-Mastery verlangt diese Capability, endliche `earnedPoints`, konkrete
  Rückmeldung und mindestens `passingPoints`.
- Alternative fachlich korrekte Verfahren werden akzeptiert; die Musterlösung
  ist keine Methodenvorschrift.

**Wichtige Beweisgrenze:** Der MCP-Server erhält den Claude-Chat nicht. Er kann
daher technisch nicht beweisen, dass der Lernende vor dem Answer- oder
Evaluation-Aufruf bereits vollständig geantwortet hat. Serverseitig beweisbar
sind Geheimhaltung bis zum Toolaufruf, State-/Connection-/Goal-Bindung,
Vollständigkeit des Result-Batches und die Capability-Kette. Das vorherige
Warten auf eine vollständige sichtbare Abgabe ist zusätzlich eine
Server-Instruction und ein Real-Claude-Verhaltenstest; es darf nicht als
kryptographisch erzwungen dokumentiert werden.

**Tests:** Capability-Replay, anderer Provider, anderer Learner, anderes Ziel,
andere Verbindung, stale state, abgelaufen, Batch-Manipulation, atomarer Rollback,
Exam nicht bereit und nicht bestandene Prüfung.

**Abnahme:** Vorzeitiges oder fremdes Wiederverwenden von Lösungsmaterial
scheitert fail-closed; vollständige gültige Abläufe funktionieren atomar.

**Aufwand:** 3–5 Personentage; teilweise parallel zu WP6.

### WP8 — Edge, Datenschutz und Betrieb

**Zweck:** Den Connector getrennt veröffentlichen, ohne OpenAI-v1-Edge-Dateien
anzufassen.

**Aufgaben:**

1. Neue Datei `deploy/nginx/skillpilot-claude-connector-v1.conf` anlegen.
2. Eigenen DNS-Namen und eigene Zertifikatslinie vorbereiten.
3. Nur die in Abschnitt 4 definierten Pfade auf den bestehenden Backend-Port
   umschreiben; alles andere `404`.
4. Kein Include und keine Location in einer bestehenden OpenAI-nginx-Datei
   ändern.
5. Connector-spezifische Privacy-Seite mit Datenerhebung, Zweck, Speicherung,
   Retention, Drittweitergabe, Kontakt und Revocation bereitstellen.
6. Request-/Response-Body-Logging für OAuth, First-Party-Launch, MCP, Recall und
   Exam ausschließen; permanente IDs, `spc_`-Sessions und Token zusätzlich in
   strukturierten Logs redigieren.
7. Provider-Telemetrie auf Zähler, Statusklasse, Latenz, begrenzte
   Fehlerkategorie, Heap/Pool und Revocation beschränken.
8. Keinen globalen `HealthIndicator` registrieren, der Claude-Fehler in die
   bestehende OpenAI-/Backend-Readiness propagiert. Bis zu einer ausdrücklich
   getrennten Actuator-Gruppe werden Claude-Zustände über Metriken und einen
   providerinternen Diagnosepfad beobachtet.
9. Numerische RAM-, Thread-, DB-Pool- und OpenAI-p95-Grenzen aus Gate F in den
   Lasttest übernehmen.

**Abnahme:** `nginx -t` ist grün, `nginx -T` zeigt nur den neuen vhost-Diff,
Privacy/Revocation sind erreichbar, und eine Claude-Störung macht OpenAI nicht
unready.

**Aufwand:** 2–4 Personentage plus Operations/Legal.

### WP9 — Testmatrix und Real-Claude-Abnahme

**Zweck:** Protokoll-, Fach-, Sicherheits- und Ein-JVM-Verhalten vor einer
Veröffentlichung belegen.

**Automatisierte Testgruppen:**

- `ClaudeV1DisabledContextTest`;
- `ClaudeV1RuntimeValidationTest`;
- `ClaudeV1SecurityChainIntegrationTest`;
- `ClaudeV1OAuthFlowIntegrationTest`;
- `ClaudeV1CimdMetadataValidatorTest`;
- `ClaudeV1LearningSessionServiceTest`;
- `ClaudeV1SessionTokenCodecTest`;
- `ClaudeV1McpContractTest`;
- `ClaudeV1MemoryPracticeContractTest`;
- `ClaudeV1VerifiedRecallContractTest`;
- `ClaudeV1ExamContractTest`;
- `ClaudeV1CoachUiControllerTest`;
- `ClaudeV1CrossProviderIsolationTest`;
- `ClaudeV1OpenAiDifferentialContractTest`.

**Verpflichtende Cross-Provider-Fälle:**

1. ChatGPT liest Revision N; Claude schreibt N+1; ChatGPT-Schreibversuch mit N
   wird abgewiesen; Reload zeigt N+1.
2. Derselbe Ablauf in Gegenrichtung.
3. Claude-Token auf OpenAI/Beta/Main-API und OpenAI-Token auf Claude werden
   abgewiesen.
4. Revocation einer Claude-Verbindung beendet keine OpenAI-Session.
5. Claude-Timeout, ungültige Requests und Last erzeugen keine partielle
   Lernzustandsmutation.

**Real-Client-Abnahme:**

- alle zwölf Toolpfade und beide Ressourcen mit MCP Inspector prüfen;
- eine reale Hosted-Claude-Plugin-Installation testen; den Remote-Connector
  zusätzlich separat als Custom Connector prüfen, soweit dies für die
  Directory-Abnahme erforderlich ist;
- beide MCP Apps in Hosted Claude mit privaten Kartenmetadaten und app-only
  Review testen;
- den bevorzugten Plugin-Installationsweg mit Skill, genau einem Connector und
  beiden connectorgelieferten MCP Apps testen;
- Claude Code und Cowork nur dann separat testen und beanspruchen, wenn diese
  Oberflächen veröffentlicht werden sollen;
- DE- und EN-Coaching, Konflikt, Recall, Exam, Revocation und Reconnect testen;
- mit vollständig bestücktem, wegwerfbarem Erwachsenen-Testlearner testen;
- keine echten Lernenden- oder Produktiv-Credentials im Mitschnitt verwenden.

Anthropic stellt für Connectoren keine separate Client-Staging-Umgebung bereit.
Vor dem Produktionsgate wird deshalb eine kurzlebige, authentifizierte
Entwickler-/Staging-Instanz über einen öffentlichen Test-Host oder Tunnel
angebunden. Das ist kein zweiter Prozess auf der RAM-begrenzten
Produktionsmaschine. Der Tunnel wird nach dem Test geschlossen.

**Abnahme:** Alle automatisierten Tests, MCP Inspector, Hosted Claude und die
jeweils beanspruchten Plugin-Clients sind grün; die OpenAI-Differenz ist null.

**Aufwand:** 4–7 Personentage.

### WP10 — Disabled-first-Rollout, Aktivierung und Submission

**Zweck:** Das gemeinsame Deployment mit kleinstmöglichem Rückfallrisiko
aktivieren.

**Reihenfolge:**

1. Gate B ausdrücklich freigeben lassen; Entscheidung muss Zielversion,
   Dateiumfang, gemeinsamen Restart-Effekt und OpenAI-Reviewfolge nennen.
2. Datenbank-Backup und Artefakt-Rollbackversion verifizieren.
3. Neues gemeinsames Backend-Artefakt mit
   `skillpilot.claude.connector.v1.enabled=false` deployen.
4. OpenAI-Freeze-, Contract-, OAuth-, MCP-, Widget- und First-Party-Smokes
   vollständig ausführen.
5. Nur bei null beobachtbarer OpenAI-Differenz Claude-v1 per Environment
   aktivieren und den bestehenden Dienst kontrolliert neu starten.
6. Interne Routen und Auth prüfen, während der öffentliche vhost noch aus ist.
7. DNS/Zertifikat/vhost aktivieren; `nginx -t`, `nginx -T` und externe
   Negativtests ausführen.
8. Erneut OpenAI-Smokes und RAM/Pool/Latenz prüfen.
9. Real-Claude-Custom-Connector-Abnahme wiederholen.
10. Erst danach mit Dokumentations-URL, Privacy-URL, Icon,
    Test-Credentials und Setup-Anleitung im Anthropic-Portal einreichen.

Für die Directory-Einreichung braucht der Publisher nach aktuellem
Anthropic-Verfahren eine Team- oder Enterprise-Organisation und
Directory-Management-Rechte. Der Connector selbst wird zuvor mit einem Custom
Connector getestet; diese Laufzeit entspricht der Directory-Laufzeit.

**Rollback:**

1. Claude-v1-vhost deaktivieren;
2. v1-Master-Schalter auf `false` setzen;
3. bestehenden Dienst kontrolliert neu starten;
4. Claude-v1-Transporttoken und offene Lernsessionen widerrufen;
5. OpenAI-Smokes wiederholen;
6. bei Artefakt- oder Migrationsfehler auf das gesicherte gemeinsame Artefakt
   zurückrollen; additive v1-Tabellen nicht destruktiv entfernen.

**Abnahme:** Rollback ist vor Aktivierung praktisch geprobt; Submission erfolgt
erst nach einem stabilen öffentlichen Custom-Connector-Test.

**Aufwand:** 2–4 Personentage plus Review-Wartezeit.

---

## 7. Reihenfolge und Abhängigkeiten

```text
WP0 ──> WP1 ──> WP2 ──> WP3 ──> WP4
                 │       │       │
                 └───────┴──> WP5 ──> WP6 ──> WP7
                                      │       │
                                      └──> WP8/WP9 ──> WP10
```

Der kritische Pfad liegt in OAuth/CIMD, First-Party-Sessionausstellung,
Revision/Idempotenz und Real-Claude-Abnahme. WP6 und WP7 dürfen erst gegen
Mock-Sessions entwickelt werden, sobald deren Capability- und
State-Version-Vertrag feststeht.

Grobe Gesamtschätzung für einen mit Spring Security und MCP vertrauten
Entwickler: **28–45 Personentage**, zuzüglich Product-, Security-, Legal-,
Operations- und externer Review-Zeit. Die Spanne ist keine Terminzusage; offene
Gates, insbesondere Identity/OAuth und RAM-Headroom, dominieren das Risiko.

---

## 8. Verifikationsbefehle

Vor jedem Review-fähigen Stand:

```bash
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/openai_plugin_release.mjs verify
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_versioning.mjs
node ai/claude/plugin/skillpilot-coach-v1/check-package.mjs
node --test ai/claude/plugin/skillpilot-coach-v1/check-package.test.mjs
npm --prefix ai/claude/app test
node --test scripts/check_claude_connector_v1_release.test.mjs
node scripts/check_claude_connector_v1_release.mjs

cd backend
./gradlew test --tests 'com.skillpilot.backend.connectors.claude.v1.*' \
  --tests 'com.skillpilot.backend.connectors.claude.v1.**'
./gradlew test
```

Dokumentation:

```bash
cd app
npm run check:docs-links
npm run check:docs-indexes
npm run check:terminology
```

Vor dem Edge-Reload auf der freigegebenen Zielumgebung:

```bash
nginx -t
nginx -T
```

`nginx -T` kann Secrets oder interne Details enthalten und gehört nicht
ungefiltert in CI-Logs oder Tickets.

---

## 9. Definition of Done für den Claude.ai-Directory-Kandidaten

Der aktuelle Claude Connector v1 beansprucht für die Directory-Einreichung
ausschließlich Claude.ai. Er gilt nur dann als umsetzungs- und releasefertig,
wenn alle folgenden Punkte erfüllt sind:

- die OpenAI App und ihr V1-Vertrag sind byte- und verhaltensgleich zur
  freigegebenen Baseline;
- v1 ist standardmäßig aus und Beta plus v1 startet nie gemeinsam;
- es existiert nur das bestehende Backend-Deployable und die bestehende JVM;
- öffentliche und interne Pfade, OAuth-Issuer und Resource-Identifier sind
  exakt versioniert und isoliert;
- Claude.ai besteht OAuth mit PKCE S256;
- jede Lernsitzung startet über `https://skillpilot.com/?coach=claude` und
  erhält ausschließlich eine opake `spc_`-Kennung für exakt 24 Stunden;
- alle zwölf Tools einschließlich des app-only Review-Tools verlangen dieselbe
  aktuelle `learningSessionId`;
- OAuth und `offline_access` bleiben reiner Connectortransport und können keine
  Lernsitzung auswählen, erzeugen, erneuern oder verlängern;
- Claude erhält nie die permanente SkillPilot-ID, eine ID-Datei oder deren
  Passwort;
- alle zwölf freigegebenen Tools haben genaue Schemas, Titel und korrekte
  Anthropic-Annotationen;
- beide content-addressed MCP Apps sind deterministisch gebaut; private
  Kartendaten bleiben component-only und das Review-Tool app-only;
- normale Karteikartenpraxis ändert nur Wiederholungsplanung und nie Mastery;
- Level 2 ist nicht schreibbar; Level 3 und Lernzustandsmutationen verwenden
  kanonische Regeln, Revision und Idempotenz;
- Recall- und Exam-Capabilities sind provider-, learner-, learner-session-, goal-,
  state- und zeitgebunden;
- Cross-Provider-Konflikt-, Token-, Revocation- und Fault-Tests sind grün;
- RAM-, Thread-, Pool- und OpenAI-Latenzbudgets sind numerisch erfüllt;
- Privacy, Altersgrenze, Supportkontakt, Testkonto und Reviewer-Anleitung sind
  freigegeben;
- Disabled-first-Rollout und Rollback sind praktisch belegt;
- MCP Inspector und eine frische Claude.ai-Verbindung wurden gegen den finalen
  öffentlichen Endpoint getestet;
- Product Owner hat die konkrete Produktionsaktivierung ausdrücklich
  freigegeben.

### 9.1 Definition of Done des bevorzugten Plugin-Wegs

Das Plugin ist der bevorzugte Einmal-Installationsweg für den Claude.ai-
Kandidaten. Claude Code und Cowork sind zusätzliche Oberflächen und nicht Teil
des aktuellen Directory-v1-Claims. Das Plugin darf erst veröffentlicht werden,
wenn:

- der lokale Paketcheck und die offizielle Prüfung mit
  `claude plugin validate ai/claude/plugin/skillpilot-coach-v1` bestehen;
- Installation, OAuth, First-Party-Start, alle zwölf Tools und beide MCP Apps
  in einer frischen beanspruchten Claude.ai-Umgebung getestet wurden;
- Skill und Connector genau einmal installiert sind und die beiden MCP Apps
  über den Connector bereitstehen;
- eine unterstützte Fallback-Installation kein doppeltes oder abweichendes
  SkillPilot-Toolset erzeugt;
- Claude Code und Cowork jeweils separat vollständig getestet wurden, bevor die
  Plugin-Dokumentation diese Oberflächen beansprucht;
- die Plugin-Dokumentation ausschließlich die tatsächlich belegten Clients und
  Funktionen beansprucht.

---

## 10. Aktuelle externe Referenzen

Technische Anforderungen wurden zuletzt am 23. August 2026 gegen die aktuellen
Primärquellen geprüft:

- [Anthropic: Authentication for connectors](https://claude.com/docs/connectors/building/authentication)
- [Anthropic: Testing your connector](https://claude.com/docs/connectors/building/testing)
- [Anthropic: Pre-submission checklist](https://claude.com/docs/connectors/building/review-criteria)
- [Anthropic: Submitting to the Connectors Directory](https://claude.com/docs/connectors/building/submission)
- [Model Context Protocol: Authorization](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)

Da Anthropic Connector-, OAuth- und Directory-Anforderungen ändern kann, sind
diese Quellen unmittelbar vor Real-Client-Test und Submission erneut zu
prüfen. Änderungen der externen Anforderungen autorisieren keine Änderung am
eingefrorenen OpenAI-Vertrag.
