# Claude-Coach-Beta: Betrieb und Rollout

Diese Runbook-Seite beschreibt den additiven Claude-Coach neben dem bestehenden
Custom-GPT-Coach. Beide verwenden dieselbe SkillPilot-Fachlogik und denselben
Lernstand. Der ChatGPT-Pfad bleibt unabhängig und muss auch bei deaktivierter
Claude-Beta unverändert funktionieren.

Die Beta ist standardmäßig vollständig ausgeschaltet. Sie ist derzeit nur für
volljährige Testpersonen vorgesehen.

## Architektur

Es gibt **keinen zweiten Serverprozess** und keinen Node-Dienst im Betrieb:

```text
SkillPilot UI ─┐
               ├─ HTTPS / Reverse Proxy ─ Spring Boot :8080 ─ PostgreSQL
Claude MCP  ───┤                         ├ UI- und Coach-API
Claude OAuth ──┘                         ├ OAuth Authorization Server
                                         └ Streamable-HTTP-MCP-Server
```

Der React-Build wird weiterhin als statischer Bestandteil des Spring-Boot-Artefakts
ausgeliefert. OAuth, MCP und die bisherigen REST-Endpunkte laufen im selben
Spring-Boot-Prozess. Der bestehende Reverse Proxy muss lediglich alle benötigten
Pfade unverändert an diesen Prozess weiterleiten.

Produktive öffentliche Endpunkte:

| Zweck | URL |
| --- | --- |
| MCP, Streamable HTTP | `https://skillpilot.com/api/claude/mcp` |
| MCP Protected Resource Metadata | `https://skillpilot.com/api/claude/oauth/protected-resource` |
| OAuth Authorization Server Metadata | `https://skillpilot.com/.well-known/oauth-authorization-server` |
| OAuth Authorize / Token / Revoke | `https://skillpilot.com/oauth2/authorize`, `/oauth2/token`, `/oauth2/revoke` |
| Claude-CIMD-Client-ID | `https://claude.ai/oauth/mcp-oauth-client-metadata` |
| Claude OAuth Callbacks | `https://claude.ai/api/mcp/auth_callback`, `https://claude.com/api/mcp/auth_callback` |
| UI-Verbindungsstart | `/api/ui/learners/{skillpilotId}/claude/connect-start` |
| UI-Coach-Start | `/api/ui/learners/{skillpilotId}/claude/launch` |
| UI-Verbindung trennen | `DELETE /api/ui/learners/{skillpilotId}/claude/connection` |

## Feature-Flags und Konfiguration

Das Frontend-Flag ist ein **Build-Time-Flag**. Alle anderen Werte sind
Spring-Boot-Runtime-Konfiguration und gehören im Produktivbetrieb in das
`systemd`-Environment beziehungsweise dessen `EnvironmentFile`.

| Variable | Produktion für Beta | Bedeutung |
| --- | --- | --- |
| `VITE_CLAUDE_BETA_ENABLED` | `true` | Zeigt die Claude-Buttons; erfordert einen neuen Frontend-Build. Ohne Wert ist die UI verborgen. |
| `SKILLPILOT_CLAUDE_ENABLED` | `true` | Master-Schalter für UI-Routen, OAuth, Tokenprüfung und Coach-Tools. |
| `SKILLPILOT_CLAUDE_MCP_ENABLED` | `true` | Schaltet den Spring-AI-MCP-Transport ein; erbt ohne eigenen Wert vom Master-Schalter. |
| `SKILLPILOT_CLAUDE_COACH_TOOLS_ENABLED` | `true` | Exponiert die echten Lernstands- und Coach-Tools. Für einen isolierten synthetischen Regressionstest vorübergehend auf `false` setzen. |
| `SKILLPILOT_CLAUDE_REGRESSION_TOOLS_ENABLED` | `false` | Exponiert nur bei gezielten Regressionstests zusätzlich die synthetischen Probe-Tools; im Coach-Betrieb ausgeschaltet lassen. |
| `SKILLPILOT_PUBLIC_BASE_URL` | `https://skillpilot.com` | Öffentlicher OAuth-Issuer. |
| `SKILLPILOT_CLAUDE_MCP_URL` | `https://skillpilot.com/api/claude/mcp` | Öffentliche MCP-Resource/Audience. |
| `SKILLPILOT_CLAUDE_RESOURCE_METADATA` | `https://skillpilot.com/api/claude/oauth/protected-resource` | URL im `WWW-Authenticate`-Challenge. |
| `SKILLPILOT_CLAUDE_OAUTH_CLIENT_ID` | `https://claude.ai/oauth/mcp-oauth-client-metadata` | Von Anthropic gehostete CIMD-URL; nur nach verifizierter Anbieteränderung überschreiben. |
| `SKILLPILOT_CLAUDE_SECURE_COOKIE` | `true` | Erzwingt das `Secure`-Attribut des kurzlebigen Binding-Cookies. |
| `SKILLPILOT_CLAUDE_BINDING_TTL` | `PT5M` | Gültigkeit des einmaligen Browser-Bindings. |
| `SKILLPILOT_CLAUDE_LAUNCH_TTL` | `PT5M` | Gültigkeit eines normalen Coach-Starts. |
| `SKILLPILOT_CLAUDE_ACCESS_TOKEN_TTL` | `PT1H` | Gültigkeit eines opaken OAuth-Access-Tokens. |
| `SKILLPILOT_CLAUDE_REFRESH_TOKEN_TTL` | `P30D` | Gültigkeit des rotierenden Refresh-Tokens. |
| `SKILLPILOT_SIGNING_SECRET` | starker, stabiler Secret-Wert | HMAC-Schutz kurzlebiger Grants; nie mit dem unsicheren Default betreiben. |

`SKILLPILOT_CLAUDE_MCP_ENABLED=true` bei ausgeschaltetem Master-Schalter ist
keine zulässige Konfiguration. Beim Ein- und Ausschalten immer beide Schalter
konsistent setzen.

Die persistente Registrierung des bekannten Claude-Clients wird bei jedem
Spring-Boot-Start mit Callback-URLs, Scopes und den beiden konfigurierten
Token-TTLs abgeglichen. Änderungen dieser Werte greifen damit nach einem
kontrollierten Neustart.

## OAuth, CIMD und MCP

Der Connector verwendet OAuth Authorization Code mit PKCE (`S256`). Claude ist
ein öffentlicher Client ohne Client-Secret. Die Claude-CIMD-URL ist zugleich die
Client-ID und wird für diese Beta explizit zugelassen. Ein offener Dynamic Client
Registration Endpoint (DCR) ist nicht erforderlich und wird nicht angeboten.

Der Consent umfasst:

- `skillpilot.read`: Lernstand und aktuelle Lernziele lesen;
- `skillpilot.write`: Lernfortschritt nach Anweisung aktualisieren;
- `offline_access`: Verbindung durch ein rotierendes Refresh-Token erhalten.

Das MCP-Endpoint ist stateless und verlangt ein opakes Bearer-Token. Ohne Token
antwortet es mit `401` sowie einem `WWW-Authenticate`-Header, der auf die
Protected Resource Metadata verweist. Schreibende Tools prüfen zusätzlich den
Write-Scope. `getCoachContext` lädt den aktuellen Zustand erneut; der Coach soll
nicht darauf angewiesen sein, dass ältere Tool-Responses noch im Modellkontext
liegen. Authorization- und Token-Requests werden nur für die exakt konfigurierte
MCP-Resource akzeptiert; ein fehlender oder fremder `resource`-Wert liefert
`invalid_target`.

## Nutzerfluss und Gerätewechsel

### Einmal verbinden

1. Die volljährige Testperson startet auf SkillPilot und wählt ihr Curriculum.
2. **Claude einmalig verbinden** ruft `connect-start` auf.
3. Das Backend erzeugt einen einmaligen, fünf Minuten gültigen Grant und setzt
   ihn als `HttpOnly; Secure; SameSite=Lax`-Cookie nur für `/oauth2/authorize`.
4. Die UI öffnet die vorbefüllte offizielle Connector-Seite von Claude.
5. Der OAuth-Redirect erreicht im selben Browser SkillPilot. Das Backend
   verbraucht den Grant, zeigt die Scopes und bindet ein opakes Connection-Subject
   an den Lernstand. Als „verbunden“ gilt es erst, nachdem der Token-Endpoint
   tatsächlich einen Access-Token ausgestellt hat. Das Cookie wird anschließend
   gelöscht.

Der erste OAuth-Schritt muss in dem Browser abgeschlossen werden, in dem
SkillPilot `connect-start` ausgeführt hat. Der Grant steht weder in der
Connector-URL noch in einem Chat-Prompt. Der Verbindungsbutton öffnet die
Connector-Einrichtung auch dann erneut, wenn im Backend bereits eine frühere
Verbindung bekannt ist; so lässt sich ein in Claude gelöschter Connector oder ein
anderes Claude-Konto gezielt neu verbinden. Die alte Verbindung bleibt bis zur
erfolgreichen neuen Token-Ausgabe funktionsfähig und wird dann mitsamt ihren
OAuth-Grants ersetzt.

### Normal starten

1. **Mit Claude starten** prüft zuerst den Verbindungsstatus. Fehlt die erste
   Verbindung noch, öffnet derselbe Klick stattdessen die Connector-Einrichtung.
2. Bei bestehender Verbindung ruft die UI `launch` auf. Das Endpoint lehnt einen
   Start ohne vorherige Verbindung mit `409 Conflict` ab.
3. Das Backend hinterlegt für fünf Minuten einen Pending Launch an der bereits
   autorisierten Verbindung.
4. Die UI öffnet Claude und kopiert nur den kurzen, generischen Startprompt.
   Es gibt keinen sichtbaren Startcode und keine SkillPilot-ID im Prompt.
5. Claude ruft `getCoachContext` auf. Das Backend ordnet das OAuth-Subject dem
   Lernstand zu und verbraucht den für genau diese Verbindung hinterlegten
   Pending Launch.

Da der Start absichtlich keinen sichtbaren Chatcode enthält, immer nur einen
neuen Claude-Coach-Chat gleichzeitig vorbereiten. Die Verbindung kann in
SkillPilot jederzeit über **Claude-Verbindung trennen** widerrufen werden; dabei
werden ihre Pending Launches sowie Access-, Refresh- und Consent-Datensätze
serverseitig ungültig gemacht.

Ob ein neu geöffneter Claude-Chat den Connector ohne weitere Auswahl aktiviert,
muss im echten Claude-Acceptance-Test geprüft werden. Falls Claude ihn nicht
automatisch anbietet, aktiviert die Testperson **SkillPilot** einmal im
Connector-Menü dieses Chats; die kopierte Startnachricht fordert den Connector
anschließend ausdrücklich an.

### Notebook und Mobil-App

Web und Claude Desktop bleiben der primäre Weg zum Hinzufügen des Custom
Connectors. Die Installation in Claude für iOS und Android ist derzeit ebenfalls
möglich, aber noch Beta. Nach der Verbindung steht der Connector im selben
Claude-Konto geräteübergreifend zur Verfügung. Für den Wechsel:

1. auf dem Notebook den SkillPilot-Coach in Claude starten;
2. in der Mobile-App mit demselben Claude-Konto und Workspace denselben Chat aus
   dem Verlauf öffnen;
3. dort zum Beispiel ein Foto aufnehmen und im bestehenden Chat weiterarbeiten.

Der Gerätewechsel benötigt keinen neuen SkillPilot-Startcode. Er hängt aber von
Claude-Konto, Workspace, Chat-Synchronisation und einem dort aktivierten Connector
ab. Wird ein anderes Claude-Konto verbunden, ersetzt es nach erfolgreichem OAuth
die vorige Verbindung dieses SkillPilot-Lernstands.

## Altersgrenze, Datenschutz und Secrets

- Claude.ai ist nach Anthropic-Vorgabe ein Angebot ab 18 Jahren. Diese Beta darf
  deshalb nicht als Lernweg für Minderjährige beworben oder freigeschaltet werden.
  Ein späterer minderjährigengerechter Weg über eine eigene SkillPilot-UI und die
  Anthropic API wäre ein separates Produkt- und Safeguard-Projekt.
- Das Frontend-Flag ist global und keine Alters- oder Nutzer-Allowlist. Es darf
  deshalb zunächst nur in einer kontrollierten Beta-Umgebung beziehungsweise für
  einen bewusst abgegrenzten Test mit volljährigen Personen aktiviert werden.
- Die dauerhafte SkillPilot-ID bleibt zwischen SkillPilot-UI und Backend. Sie ist
  weder OAuth-Principal noch MCP-Parameter und wird aus den explizit erlaubten
  Coach-Response-Feldern vollständig weggelassen. Auch `copySources` werden nicht
  an Claude ausgegeben, weil sie IDs anderer Lernstände enthalten können.
- Die SkillPilot-ID ist im bisherigen Produkt zugleich ein Bearer-Geheimnis für
  den Lernstand. Sie darf daher weder in Claude, Logs, Screenshots noch fremden
  Browserprofilen offengelegt werden.
- Anthropic hält als OAuth-Client notwendigerweise Access- und Refresh-Token.
  Das Modell erhält diese Token jedoch nicht als Prompt, Tool-Argument oder
  Tool-Response. SkillPilot speichert die opaken Token über den Spring
  Authorization Server in PostgreSQL; Datenbank und Backups sind entsprechend
  als Secret-Material zu schützen.
- Der Browser-Binding-Grant wird serverseitig nur als HMAC gespeichert, einmalig
  verbraucht und kurz befristet. Der normale Launchprompt ist generisch.
- Claude sieht die für das Coaching erforderlichen Lernziele, Lernstände,
  Antworten und vom Benutzer hochgeladenen Inhalte. Dafür gelten zusätzlich die
  Datenschutz- und Aufbewahrungsregeln des gewählten Claude-Kontos.
- Nie `Authorization`, `Cookie`, `Set-Cookie`, OAuth-Codes oder Token in Logs,
  Screenshots, Support-Tickets oder MCP-Inspector-Exports übernehmen. Auch
  SkillPilot-ID-haltige UI-Pfade nur mit geschützten und befristeten Access-Logs
  betreiben.
- Der allgemeine Request-Logger protokolliert für `/api/claude/mcp` bewusst keine
  Request- oder Response-Bodies, auch nicht auf DEBUG.
- Nur den Connector-Link von `skillpilot.com` verwenden und die angezeigten
  Scopes prüfen. Custom Connectors sind bei Anthropic weiterhin Beta.

Custom Connectors sind derzeit für Free, Pro, Max, Team und Enterprise verfügbar;
im Free-Plan ist höchstens ein Custom Connector möglich. Bei Team/Enterprise
können zusätzlich Freigaben durch Owner erforderlich sein.

## Rollout

1. Vor der ersten Aktivierung Datenbank-Backup erstellen und den bekannten
   Git-Stand markieren. Die Liquibase-Erweiterung ist additiv.
2. Backend mit beiden Runtime-Flags `true`, aber Frontend-Flag noch `false`
   deployen. Discovery, OAuth-Challenge und MCP-Transport prüfen.
3. Für das kontrollierte Testfenster mit `VITE_CLAUDE_BETA_ENABLED=true` neu
   bauen, damit der browsergebundene OAuth-Start über den normalen UI-Button
   erfolgen kann. Das Flag ist global; außerhalb des Testfensters wieder
   deaktivieren, solange die Beta noch nicht allgemein angeboten werden soll.
4. Vor echten Coach-Tools mit einem leeren Test-Lernstand und einem volljährigen
   Claude-Testkonto den isolierten MCP-Regressionslauf ausführen: Coach-Tools
   aus, synthetische Regressionstools an. Die öffentliche Kurzfassung liegt unter
   `/claude/mcp-regression`, das vollständige Protokoll unter
   `ai/claude/mcp-regression/TEST_PROTOCOL.md`.
5. Regressionstools wieder ausschalten, Coach-Tools einschalten und mit demselben
   Testkonto Verbindung, Consent, Lesen und eine bestätigte Schreibaktion testen.
6. Notebook-zu-Mobile-Wechsel mit demselben Claude-Konto prüfen.
7. Erst danach entscheiden, ob die Beta-UI aktiviert bleibt. ChatGPT parallel
   mit dem RegressionGPT und einem normalen SkillPilot-Start gegenprüfen.

## Smoke-Test

Voraussetzungen: `curl`, `jq`, eine dedizierte Test-SkillPilot-ID und keine
Ausgabeumleitung in geteilte CI-Logs.

```bash
BASE=https://skillpilot.com
TEST_LEARNER_ID='<dedizierte-test-id>'

curl -fsS "$BASE/.well-known/oauth-authorization-server" \
  | jq -e --arg base "$BASE" \
      '.issuer == $base
       and .client_id_metadata_document_supported == true
       and (.code_challenge_methods_supported | index("S256"))'

curl -fsS "$BASE/api/claude/oauth/protected-resource" \
  | jq -e --arg resource "$BASE/api/claude/mcp" \
      '.resource == $resource
       and (.scopes_supported | index("skillpilot.read"))
       and (.scopes_supported | index("skillpilot.write"))'

curl -sS -o /dev/null -D - \
  -X POST "$BASE/api/claude/mcp" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2025-11-25' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl-smoke","version":"1"}}}' \
  | sed -n '/^HTTP\|^[Ww][Ww][Ww]-Authenticate/p'
```

Erwartung beim dritten Aufruf: `401` und ein `WWW-Authenticate`-Header mit
`resource_metadata="https://skillpilot.com/api/claude/oauth/protected-resource"`.

### Isolierter Claude-MCP-Basistest

Vor dem ersten echten Coach-Aufruf nur die synthetischen Werkzeuge exponieren:

```text
--skillpilot.claude.mcp.coach-enabled=false
--skillpilot.claude.mcp.regression-enabled=true
```

Nach dem Neustart einen leeren Test-Lernstand über den normalen OAuth-Fluss
verbinden. Die Schritte `RUN_SINGLE`, `RUN_CHAIN`, `RUN_RETAIN` plus
`RECALL_RETAIN` und der backend-bestätigte Lauf `RUN_RETAIN` plus
`VERIFY_RETAIN` stehen auf
`https://skillpilot.com/claude/mcp-regression`. Der letzte Lauf gilt nur dann
als bestanden, wenn der Verifier `proof_valid=true` liefert und die
privacy-sicheren Auditereignisse für denselben `probe_id` identische Token- und
Proof-Hashes enthalten. Zwischen den beiden RETAIN-Turns den Prozess nicht neu
starten.

Danach den normalen Werkzeugumfang wiederherstellen und neu starten:

```text
--skillpilot.claude.mcp.coach-enabled=true
--skillpilot.claude.mcp.regression-enabled=false
```

Bereits offene Claude-Chats können Tool-Metadaten zwischenspeichern; die
anschließende Coach-Abnahme deshalb in einem frischen Chat durchführen. Das
vollständige Evidenz- und Cleanup-Protokoll steht in
`ai/claude/mcp-regression/TEST_PROTOCOL.md`.

Optional den UI-Start mit einer reinen Test-ID prüfen. Die Cookie-Datei enthält
einen kurzlebigen Secret-Wert und wird deshalb sofort gelöscht:

```bash
COOKIE_JAR="$(mktemp "${TMPDIR:-/tmp}/skillpilot-claude.XXXXXX")"
trap 'rm -f "$COOKIE_JAR"' EXIT

curl -fsS -c "$COOKIE_JAR" \
  -X POST "$BASE/api/ui/learners/$TEST_LEARNER_ID/claude/connect-start" \
  -H 'Content-Type: application/json' \
  --data '{"language":"de","client":"rollout-smoke"}' \
  | jq -e '.installUrl | startswith("https://claude.ai/customize/connectors?")'

```

`connect-start` allein stellt noch keine Verbindung her. Vor abgeschlossenem
OAuth-Consent muss `launch` deshalb `409` liefern. Nach der echten Verbindung mit
dem Claude-Testkonto denselben Start separat prüfen:

```bash
curl -fsS \
  -X POST "$BASE/api/ui/learners/$TEST_LEARNER_ID/claude/launch" \
  -H 'Content-Type: application/json' \
  --data '{"language":"de","client":"rollout-smoke"}' \
  | jq -e '.prompt != "" and .webUrl == "https://claude.ai/new"'
```

### MCP Inspector

```bash
npx -y @modelcontextprotocol/inspector@latest
```

Im Inspector `Streamable HTTP` und
`https://skillpilot.com/api/claude/mcp` wählen. Ohne Credential muss der
Inspector den `401`-Challenge und die beiden Metadata-Dokumente erreichen. Die
Produktions-Beta akzeptiert absichtlich nur den zugelassenen Claude-CIMD-Client;
ein beliebiger Inspector-OAuth-Client muss den Consent daher nicht abschließen.

Für einen authentifizierten Tool-Test entweder den echten Claude-Testconnector
verwenden oder in einer isolierten Staging-Umgebung einen eigenen Inspector-Client
registrieren. Falls dort ein kurzlebiges Staging-Bearer-Token verwendet wird,
kann es in der Inspector-UI eingetragen werden. Danach müssen mindestens
`getCoachContext`, `setScope`, `setActiveGoal` und `setMastery` sichtbar sein.
Produktions-Token niemals aus Datenbank oder Netzwerkverkehr extrahieren, nur um
einen Inspector-Test zu erzwingen.

## Reverse Proxy

Wenn der vorhandene Catch-all bereits jeden Pfad unverändert an Spring Boot
weitergibt, ist **keine Nginx-Änderung** nötig. Andernfalls müssen mindestens
`/.well-known/`, `/oauth2/`, `/api/claude/` und die vorhandenen `/api/ui/`-Pfade
denselben Spring-Boot-Prozess erreichen. Besonders `/.well-known/` darf weder als
statische Datei noch als SPA-`index.html` beantwortet werden.

Minimaler zusätzlicher Nginx-Block, nur falls der Catch-all fehlt:

```nginx
location ^~ /.well-known/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_buffering off;
    proxy_read_timeout 300s;
}
```

Für `/oauth2/` und `/api/claude/` gelten dieselben Header- und TLS-Anforderungen.
`proxy_pass` darf den Originalpfad nicht entfernen. Nach jeder Proxy-Änderung den
oben genannten Discovery-`curl` ausführen; `Content-Type` muss JSON sein und der
Issuer muss `https://skillpilot.com` lauten.

## Rollback

Schneller sicherer Rückweg ohne Auswirkungen auf ChatGPT:

1. Bei einem Security- oder Datenrisiko sofort
   `SKILLPILOT_CLAUDE_MCP_ENABLED=false` und
   `SKILLPILOT_CLAUDE_ENABLED=false` setzen und Spring Boot neu starten.
2. `VITE_CLAUDE_BETA_ENABLED=false` setzen, Frontend neu bauen und deployen, damit
   die Claude-Buttons verschwinden.
3. Den Claude-Änderungscommit mit `git revert <commit>` zurücknehmen und über den
   normalen Deploymentweg ausrollen. Kein `git reset --hard` auf dem Server.
4. Die additiven Liquibase-Tabellen bei einem normalen Rollback nicht löschen.
   Bestehende Token bleiben bei deaktivierten Endpunkten unbrauchbar; bei einem
   Security-Incident zusätzlich vor dem Abschalten über die UI-Verbindungstrennung
   Token/Connections widerrufen und Secrets rotieren.
5. Custom-GPT-Start, RegressionGPT und das SkillPilot-Cockpit erneut prüfen.

## Offizielle Quellen

- Claude-Dokumentation: Custom Connectors bauen und testen:
  https://claude.com/docs/connectors/building
- Claude-Dokumentation: OAuth, CIMD, PKCE, Callback und Token Refresh:
  https://claude.com/docs/connectors/building/authentication
- Claude-Dokumentation: Directory- und Custom-Connectoren:
  https://claude.com/docs/connectors/building/directory-vs-custom
- Claude Help Center: Custom Connectors, Pläne, Einrichtung und Sicherheit:
  https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp
- Claude Help Center: Connectoren auf Web, Desktop und Mobile:
  https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities
- Anthropic: 18+-Grenze von Claude.ai:
  https://www.anthropic.com/policy
- MCP Authorization Specification, einschließlich CIMD, PKCE und Discovery:
  https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization
- MCP Inspector:
  https://modelcontextprotocol.io/docs/tools/inspector
- Offizielles MCP-Inspector-Repository und Bearer-Token-Hinweise:
  https://github.com/modelcontextprotocol/inspector
