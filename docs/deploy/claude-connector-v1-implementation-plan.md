# SkillPilot Claude Connector v1 — Umsetzungsplan

**Status:** Lokaler Pre-Submission-Kandidat; externe Abnahme, Merge und
Veröffentlichung nicht freigegeben

**Stand:** 21. August 2026

**Repository-Basis:** `main` bei `f405abce61a3`

**Architekturgrundlage:**
[SkillPilot Claude Connector v1 — one-JVM architecture and service concept](claude-connector-v1-concept.md)

**Verbindliche Schutzregel:**
[SkillPilot Coach v1.0.0: aktive OpenAI-Review-Sperre](openai-plugin-v1-review-freeze.md)

Dieser Plan übersetzt das beschlossene Claude-Konzept in ausführbare
Arbeitspakete. Er ersetzt keine Product-Owner-, Security-, Legal- oder
Release-Freigabe.

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
- ein optionales Claude-Code-/Cowork-Plugin mit demselben Remote-MCP-Server und
  einer wiederverwendbaren Claude-spezifischen Skill-Anweisung;
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
- ID-Datei oder Passwort müssten zur Entschlüsselung an den Server gesendet
  werden;
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
| D | Lokale ID-Datei-Entschlüsselung und Binding-Threat-Model | Security/Product | öffentlicher OAuth-Flow |
| E | Claude-spezifische Datenschutzerklärung, Retention und Mindestalter | Legal/Product | Real-User-Test und Veröffentlichung |
| F | Numerisches RAM-, Thread-, Pool- und Latenzbudget | Operations | Lasttest und Aktivierung |
| G | Publisher-Organisation und Directory-Berechtigung | Product/Operations | Directory-Einreichung |
| H | Reviewer-Testkonto mit realistischem, aber wegwerfbarem Lernzustand | Product/QA | Directory-Einreichung |

Während der aktiven OpenAI-Review-Sperre darf eine isolierte
Implementierungs-Branch vorbereitet und lokal getestet werden, wenn die
Branch-Regel aus Gate A dies ausdrücklich erlaubt. Sie darf nicht automatisch
in das Produktionsartefakt gelangen. Die Freigabe von Gate A ist keine
Freigabe für Gate B.

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
| `/connect/**` | `/internal/connectors/claude/v1/connect/**` |
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
├── identity/
│   ├── ClaudeV1Connection.java
│   ├── ClaudeV1BindingTransaction.java
│   ├── ClaudeV1ConnectionRepository.java
│   └── ClaudeV1BindingService.java
├── oauth/
│   ├── ClaudeV1OAuthConfiguration.java
│   ├── ClaudeV1OAuthMetadataController.java
│   ├── ClaudeV1CimdMetadataValidator.java
│   ├── ClaudeV1BindingAuthenticationFilter.java
│   ├── ClaudeV1OpaqueTokenIntrospector.java
│   └── ClaudeV1TokenLifecycleService.java
├── mcp/
│   ├── ClaudeV1McpServerConfiguration.java
│   ├── ClaudeV1McpContractAdapter.java
│   ├── ClaudeV1CoachContextProjector.java
│   ├── ClaudeV1SessionCoordinator.java
│   └── ClaudeV1CapabilityService.java
├── persistence/
│   ├── ClaudeV1IdempotencyRecord.java
│   └── ClaudeV1IdempotencyRepository.java
├── observability/
│   └── ClaudeV1Telemetry.java
└── web/
    └── ClaudeV1ConnectionController.java
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

### WP4 — Bestehenden Learner sicher binden

**Zweck:** Eine Claude-Verbindung an einen vorhandenen pseudonymen
SkillPilot-Lernzustand binden, ohne neues Accountsystem.

**Aufgaben:**

1. Eine connector-eigene, statische Binding-Seite unter dem Claude-v1-Origin
   bereitstellen; keine Änderung an der WebGUI und kein Import ihres Bundles.
2. Nur den Entschlüsselungsteil des bestehenden ID-Dateiformats als kleines
   browsernatives ES-Modul unter
   `backend/src/main/resources/claude-connector-v1/` implementieren.
3. PBKDF2-SHA-256 mit 600.000 Iterationen, AES-256-GCM, AAD, Längen- und
   Exact-key-Prüfungen bytekompatibel zum bestehenden Format halten.
4. Die Datei und ihr Passwort ausschließlich im Browser verarbeiten. Nur die
   entschlüsselte, validierte UUID darf im TLS-geschützten Binding-POST
   übertragen werden.
5. Kein ID-Wert in URL, Redirect, Referrer, Cookie, Titel, Browser Storage,
   Analytics oder Logs.
6. Binding-Transaktion mit OAuth-State, PKCE-Anfrage, Client-ID und Redirect
   verbinden; Handle kurzlebig, zufällig, gehasht und einmalig nutzbar.
7. CSRF, Session Fixation, Open Redirects und Wiederholung abgefangener
   Binding-POSTs abwehren.
8. Nach erfolgreicher Prüfung ein neues opakes Claude-v1-Subject erzeugen. Das
   permanente SkillPilot-ID-Feld wird weder OAuth-Subject noch Toolargument.
9. Nutzer ohne bestehende ID-Datei zur normalen SkillPilot-WebGUI verweisen und
   den OAuth-Vorgang anschließend neu starten lassen; keine automatische
   Learner-Erzeugung.
10. CSP ohne Inline-Script und ohne Drittanbieter-Netzzugriff setzen.

Die ES-Modul-Duplizierung ist bewusst eng auf **Decrypt-only** begrenzt. Ein
Kompatibilitätstest mit festen, nicht realen Testvektoren verhindert Drift zum
eingefrorenen WebGUI-Dateiformat. Nach Ende der Freeze-Situation kann eine
gemeinsame neutrale Browserbibliothek separat bewertet werden; sie ist keine
Voraussetzung für v1.

**Tests:** Browser-Test mit Test-ID-Datei, falschem Passwort, manipuliertem
Envelope, zu großer Datei, Replay, CSRF und Netzwerk-Mitschnitt. Der Mitschnitt
darf weder Dateiinhalt noch Passwort enthalten.

**Abnahme:** Eine bestehende Testperson kann verbinden; Server und Logs sehen
nie Passwort oder verschlüsselten Dateiinhalt; Claude sieht nie die permanente
ID.

**Aufwand:** 3–5 Personentage plus Threat-Model Review.

### WP5 — Provider-Persistenz, Revision und Idempotenz

**Zweck:** Genau-einmalige Schreibsemantik auf dem gemeinsamen kanonischen
Lernzustand herstellen.

**Aufgaben:**

1. Bestehende OAuth-Tabellen nur über ein v1-spezifisches
   `RegisteredClientRepository` und den provider-scoped Wrapper ansprechen.
2. Nicht auf `claude_connection`, `claude_binding_grant` oder
   `claude_pending_launch` zugreifen.
3. Falls erforderlich, genau eine additive Migration
   `023-add-claude-connector-v1.yaml` anlegen mit mindestens:
   `claude_v1_connection`, `claude_v1_binding_transaction` und
   `claude_v1_idempotency`.
4. IDs und One-time-Handles nur gehasht speichern, soweit ein späterer
   Klartextvergleich nicht nötig ist. Keine Tokens, Passwörter, Prompts,
   Antworten oder Lösungen im Audit.
5. Einen Claude-eigenen `ClaudeV1SessionCoordinator` implementieren. Er darf
   keine OpenAI-Klasse importieren, übernimmt aber dieselben kanonischen
   Garantien:
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
  mintet eine kurze provider-/connection-/goal-/revisiongebundene
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
6. Request-/Response-Body-Logging für OAuth, Binding, MCP, Recall und Exam
   ausschließen; permanente IDs und Token zusätzlich in strukturierten Logs
   redigieren.
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
- `ClaudeV1BindingBrowserTest`;
- `ClaudeV1McpContractTest`;
- `ClaudeV1MemoryPracticeContractTest`;
- `ClaudeV1VerifiedRecallContractTest`;
- `ClaudeV1ExamContractTest`;
- `ClaudeV1SessionCoordinatorTest`;
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
- eine reale Hosted-Claude-Verbindung als Custom Connector testen;
- beide MCP Apps in Hosted Claude mit privaten Kartenmetadaten und app-only
  Review testen;
- die optionale Plugin-Lane getrennt in Claude Code und Cowork mit offizieller
  Plugin-Validierung testen;
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
4. Claude-v1-Token und offene Binding-Transaktionen widerrufen;
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

Der kritische Pfad liegt in OAuth/CIMD, lokalem Learner-Binding,
Revision/Idempotenz und Real-Claude-Abnahme. WP6 und WP7 dürfen erst gegen
Mock-Identity entwickelt werden, sobald deren Capability- und
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
- ID-Datei und Passwort werden ausschließlich lokal im Browser verarbeitet;
- Claude erhält nie die permanente SkillPilot-ID;
- alle zwölf freigegebenen Tools haben genaue Schemas, Titel und korrekte
  Anthropic-Annotationen;
- beide content-addressed MCP Apps sind deterministisch gebaut; private
  Kartendaten bleiben component-only und das Review-Tool app-only;
- normale Karteikartenpraxis ändert nur Wiederholungsplanung und nie Mastery;
- Level 2 ist nicht schreibbar; Level 3 und Lernzustandsmutationen verwenden
  kanonische Regeln, Revision und Idempotenz;
- Recall- und Exam-Capabilities sind provider-, learner-, connection-, goal-,
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

### 9.1 Separate Definition of Done der optionalen Plugin-Lane

Claude Code und Cowork sind nicht Teil des aktuellen Directory-v1-Claims und
blockieren dessen Einreichung nicht. Das optionale Plugin darf erst separat
veröffentlicht oder als kompatibel beworben werden, wenn zusätzlich:

- der lokale Paketcheck und die offizielle Prüfung mit
  `claude plugin validate ai/claude/plugin/skillpilot-coach-v1` bestehen;
- Installation, OAuth, alle zwölf Tools und beide MCP Apps jeweils in einer
  frischen Claude-Code- und Cowork-Umgebung getestet wurden;
- eine gleichzeitige Installation von Directory-Connector und Plugin kein
  doppeltes oder abweichendes SkillPilot-Toolset erzeugt;
- die Plugin-Dokumentation ausschließlich die tatsächlich belegten Clients und
  Funktionen beansprucht.

---

## 10. Aktuelle externe Referenzen

Technische Anforderungen wurden am 18. August 2026 gegen die aktuellen
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
