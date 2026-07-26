# ChatGPT-App „SkillPilot Coach (Deutsch)“: Deployment und Cutover

**Stand:** 26. Juli 2026

**Status:** Der deutsche MCP-Coach ist der aktuelle ChatGPT-Produktpfad. Die
verschärfte Clientbindung wird erst nach erfolgreichem
mTLS-/CIMD-/`private_key_jwt`-Cutover und erneutem Workflow-Acceptance-Test
allgemein freigegeben.

Dieses Runbook aktiviert den deutschen, zunächst UI-losen MCP-Lerncoach. Der
MCP-Server, OAuth-Authorization-Server und die SkillPilot-Fachlogik laufen im
**bestehenden Spring-Boot-Prozess**. Der Node-Code unter `ai/openai app/` bleibt
ein lokales Regressionstest- und späteres Widget-Testbett und wird nicht in den
Produktivpfad geschaltet.

Die Architektur- und Migrationsentscheidungen stehen in
[openai-mcp-coach-migration-plan.md](../concept/runtime-workflows/openai-mcp-coach-migration-plan.md).
Der verbindliche Identitäts- und Sitzungsablauf steht getrennt in
[openai-mcp-oauth-learner-session-architecture.md](../concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md).
Insbesondere verwaltet ChatGPT OAuth Access- und Refresh-Token automatisch;
Benutzer geben niemals Token oder SkillPilot-ID im Chat ein. Die davon
unabhängige Lernsession ist serverseitig und absolut auf 24 Stunden begrenzt.

## 1. Öffentlicher Vertrag

| Zweck | URL |
| --- | --- |
| MCP Resource / Server URL | `https://skillpilot.com/api/openai/de/mcp` |
| Protected Resource Metadata | `https://skillpilot.com/.well-known/oauth-protected-resource/api/openai/de/mcp` |
| direkter Metadata-Alias | `https://skillpilot.com/api/openai/de/oauth/protected-resource` |
| OAuth Issuer | `https://skillpilot.com/api/openai/de` |
| Authorization-Server-Metadata | `https://skillpilot.com/.well-known/oauth-authorization-server/api/openai/de` |
| Authorization Endpoint | `https://skillpilot.com/api/openai/de/oauth2/authorize` |
| Token Endpoint | `https://skillpilot.com/api/openai/de/oauth2/token` |
| Revocation Endpoint | `https://skillpilot.com/api/openai/de/oauth2/revoke` |

Der Reverse Proxy muss diese Pfade unverändert an denselben Spring-Boot-Dienst
weiterleiten. Der produktive App-Eintrag verwendet **Server URL**, nicht den
Entwicklungstunnel.

## 2. Discovery-Bootstrap und OAuth-Werte

Der Produktivvertrag verwendet Authorization Code, PKCE `S256`, eine feste
HTTPS-CIMD-Client-ID und `private_key_jwt`. SkillPilot akzeptiert damit nicht
nur ein gültiges Benutzer-Token, sondern verlangt beim Token- und
Revocation-Endpunkt zusätzlich den kryptografischen Nachweis der exakt
konfigurierten stabilen ChatGPT-OAuth-Clientidentität. Dies ist ohne eine
ausdrückliche Provider-Garantie keine eindeutige Attestation des sichtbaren
App-Namens gegenüber jeder anderen App derselben Infrastruktur. SkillPilot
unterstützt für diesen Vertrag
absichtlich weder offene Dynamic Client Registration noch eine erfundene
allgemeine Callback-URL.

Die ChatGPT-Verwaltung prüft die MCP-URL, bevor sie ihre erweiterten OAuth-
Einstellungen zeigt. Gleichzeitig benötigt der vollständige SkillPilot-
Authorization-Server die app-spezifische Callback-URL. Dafür existiert ein
expliziter, datenloser Bootstrapmodus:

1. Vollbetrieb deaktiviert lassen und ausschließlich
   `SKILLPILOT_OPENAI_DE_BOOTSTRAP_ENABLED=true` setzen.
2. Nach dem Restart die vier Discovery-URLs und den konstanten MCP-`401`
   verifizieren. Der Bootstrap registriert weder Tools noch OAuth-Client,
   Token-Endpunkte, Lernerdienste oder einen Coach-Health-Contributor.
3. In der ChatGPT-App-Verwaltung `Server URL`, die produktive MCP-URL und
   `OAuth` wählen.
4. Die von ChatGPT in der Verwaltung für diese Verbindung angezeigte
   HTTPS-CIMD-Metadaten-URL und deren öffentliche JWKS-URL unverändert
   übernehmen. Keine URL raten oder aus dem sichtbaren App-Namen ableiten.
5. Die dort angezeigte app-spezifische Produktions-Callback-URL der Form
   `https://chatgpt.com/connector/oauth/{callback_id}` unverändert übernehmen.
6. Mehrere echte Callback-URLs als kommaseparierte Liste konfigurieren. Keine
   Beispiel- oder Legacy-URL ergänzen, die nicht in der App-Verwaltung steht.
7. Bootstrap ausschalten und Vollbetrieb mit CIMD-Client-ID, JWKS-URL,
   `private_key_jwt`, Callback, OAuth und MCP atomar aktivieren. Der erste
   Vollbetrieb bleibt read-only.

Der Bootstrap-MCP-Endpunkt weist **jede** Methode und auch beliebige Bearer-
Werte mit `401` plus `WWW-Authenticate` ab. Authorization-, Token-, Revocation-
und Introspection-Endpunkte bleiben dabei `404`. Die OpenAI-Dokumentation
definiert diesen Challenge-/Metadata-Vertrag als Discovery-Mechanismus; ob ein
konkreter ChatGPT-UI-Build damit seine erweiterten Einstellungen freischaltet,
wird dennoch praktisch geprüft. Bei einem UI-Fehler wird der Sicherheitsvertrag
nicht gelockert. Das lokale Rate-Limit und die datensparsame Status-Telemetrie
schützen bereits diesen öffentlichen Bootstrap-Rand; bei mehreren Instanzen
bleibt zusätzlich ein gemeinsames Gateway-Limit erforderlich.

Ohne Client-ID oder Callback-Liste bricht der Spring-Start bei aktiviertem
OpenAI-DE-OAuth absichtlich ab. Bootstrap und Vollbetrieb dürfen ebenfalls
nicht gleichzeitig aktiviert sein; diese Fehlkonfiguration bricht den Start ab.

## 3. Runtime-Konfiguration

Für den sicheren Cutover werden Code und additive Liquibase-Migration zunächst
mit deaktivierter Schreibfunktion bereitgestellt. Danach folgt ein read-only
Canary. Vor dem ersten sicheren Vollbetrieb muss die privilegierte, einmalige
mTLS-Edge-Installation nach
[openai-mcp-edge-mtls.md](openai-mcp-edge-mtls.md) abgeschlossen sein. Das
normale `./deploy_skillpilot.sh` installiert weder CA-Dateien noch
Nginx-Konfiguration, prüft die aktive Schutzschicht aber bei jedem
`openai-mcp`-Deployment und bricht bei einer Lücke ab.

```text
SERVER_ADDRESS=127.0.0.1

SKILLPILOT_PUBLIC_BASE_URL=https://skillpilot.com
SKILLPILOT_SIGNING_SECRET=<starker-stabiler-secret-wert>

SKILLPILOT_OPENAI_DE_ENABLED=true
SKILLPILOT_OPENAI_DE_BOOTSTRAP_ENABLED=false
SKILLPILOT_OPENAI_DE_OAUTH_ENABLED=true
SKILLPILOT_OPENAI_DE_MCP_ENABLED=true
SKILLPILOT_OPENAI_DE_WRITES_ENABLED=false
SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED=true
SKILLPILOT_OPENAI_DE_MTLS_EDGE_TRUSTED_PROXIES=127.0.0.1,::1

SKILLPILOT_OPENAI_DE_MCP_URL=https://skillpilot.com/api/openai/de/mcp
SKILLPILOT_OPENAI_DE_RESOURCE_METADATA=https://skillpilot.com/api/openai/de/oauth/protected-resource
SKILLPILOT_OPENAI_DE_CHATGPT_URL=https://chatgpt.com/

SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_AUTHENTICATION_METHOD=private_key_jwt
SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_ID=<exakte-https-cimd-metadaten-url-dieser-app>
SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_JWK_SET_URI=<exakte-https-jwks-url-derselben-cimd-origin>
SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_ASSERTION_SIGNING_ALGORITHM=RS256
SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_ASSERTION_REPLAY_CACHE_SIZE=10000
SKILLPILOT_OPENAI_DE_OAUTH_REDIRECT_URIS=<exakte-callback-url-oder-kommaliste>
# Nur einmalig beim Cutover; danach wieder entfernen:
SKILLPILOT_OPENAI_DE_OAUTH_LEGACY_CLIENT_IDS=<exakte-alte-client-id-oder-kommaliste>

SKILLPILOT_OPENAI_DE_SECURE_COOKIE=true
SKILLPILOT_OPENAI_DE_BINDING_TTL=PT5M
SKILLPILOT_OPENAI_DE_LAUNCH_TTL=PT5M
SKILLPILOT_OPENAI_DE_LEARNING_SESSION_TTL=PT24H
SKILLPILOT_OPENAI_DE_CLEANUP_INTERVAL_MS=3600000
SKILLPILOT_OPENAI_DE_ACCESS_TOKEN_TTL=PT1H
SKILLPILOT_OPENAI_DE_REFRESH_TOKEN_TTL=P30D

SKILLPILOT_OPENAI_DE_RATE_LIMIT_ENABLED=true
SKILLPILOT_OPENAI_DE_RATE_LIMIT_WINDOW=PT1M
SKILLPILOT_OPENAI_DE_RATE_LIMIT_MCP_REQUESTS=120
SKILLPILOT_OPENAI_DE_RATE_LIMIT_OAUTH_REQUESTS=60
SKILLPILOT_OPENAI_DE_RATE_LIMIT_UI_REQUESTS=60
SKILLPILOT_OPENAI_DE_RATE_LIMIT_METADATA_REQUESTS=120
SKILLPILOT_OPENAI_DE_RATE_LIMIT_MAX_CLIENT_BUCKETS=10000
```

`SKILLPILOT_OPENAI_DE_WRITES_ENABLED=false` lässt Discovery, OAuth und lesende
Werkzeuge zu, blockiert aber alle Lernstandsänderungen zusätzlich zum OAuth-
Scope. Diese Betriebsabschaltung wird als normale, vorübergehende
Feature-Fehlermeldung ausgegeben und darf keine erneute OAuth-Verbindung
auslösen. Erst nach bestandenem read-only Canary wird der Schalter bewusst auf
`true` gesetzt.

Der normale aktivierte Provider startet ausschließlich im sicheren
Clientmodus; es gibt keinen produktiven `secure-mode=false`-Schalter. Der
sichere Clientmodus prüft zusätzlich:

- `client_id` ist eine absolute HTTPS-URL zu einem Metadatendokument;
- die JWKS-URL ist HTTPS und hat exakt dieselbe Origin wie die CIMD-URL;
- Client Assertions sind mit dem konfigurierten asymmetrischen Algorithmus
  signiert und enthalten `kid`, `jti` und `exp`;
- `iss` und `sub` entsprechen der registrierten CIMD-Client-ID, die Audience
  passt zum SkillPilot-Authorization-Server, und jedes `jti` wird nur einmal
  akzeptiert;
- Redirect-URIs stimmen exakt mit der produktiven Allowlist überein.

Vor Cutover und Clientregistrierung ruft der Start das CIMD-Dokument per HTTPS
ohne Redirects mit kurzen Timeouts und harter Größenbegrenzung ab. Erwartet
werden 2xx, JSON-Content-Type und ein JSON-Objekt mit exakter `client_id`,
nichtleerem `client_name`, allen konfigurierten Redirect-URIs, der exakt
gepinnten gleich-originigen `jwks_uri` und `private_key_jwt`. Netzwerkfehler,
abweichende Metadaten und jeder DCR-/`none`-Fallback brechen den Start ab.

`none` ist im sicheren Vollbetrieb unzulässig. Für den einmaligen Cutover wird
keine offene Suche nach beliebigen Public Clients durchgeführt. Stattdessen
werden ausschließlich die in
`SKILLPILOT_OPENAI_DE_OAUTH_LEGACY_CLIENT_IDS` exakt genannten alten
Client-IDs akzeptiert. SkillPilot prüft, dass jeder gefundene Altclient
tatsächlich nur `none` verwendet, und entfernt in einer Transaktion dessen
Authorizations, Consents, Verbindungen, Pending Launches und Lernsessions.
Anschließend muss ausschließlich der konfigurierte CIMD-Client mit
`private_key_jwt` lesbar sein; andernfalls bricht der Start ab.

Vor diesem Cutover ist ein Datenbank-Backup Pflicht. Die Einstellung ist
idempotent für bereits entfernte IDs, soll aber nach dem erfolgreichen
Produktionsstart wieder aus dem Environment entfernt werden. Alte Access- und
Refresh-Tokens sowie Autorisierungen sind absichtlich unwiderruflich
ungültig; ein reines Anwendungs-Rollback stellt sie nicht wieder her. Benutzer
autorisieren die SkillPilot-App danach einmal neu.

Die Migrationen `009`, `010` und `011` legen neben Verbindung und einmaligem
Browser-Binding auch den typisierten Start-Intent, die browsergebundene
Einmalverwendung und die OAuth-Gültigkeitsgrenze der Verbindung ab. Erlaubt sind nur
`CURRENT_UNIT`, `VERIFIED_RECALL` und `ABI26_EXAM`; ein freies `promptContext`
gehört ausdrücklich nicht zum OpenAI-MCP-Startvertrag.

Migration `012` ergänzt `openai_de_learning_session` mit genau
`connection_subject`, `started_at` und `expires_at`.
`connection_subject` ist zugleich Primärschlüssel und Fremdschlüssel auf
`openai_de_connection.subject`; Löschen der Verbindung löscht den
Sitzungsdatensatz kaskadierend. SkillPilot-ID, Start-Intent und Sitzungsstatus
werden dort nicht dupliziert. Der Lernende wird über die Verbindung aufgelöst,
der Intent wirkt vor der Aktivierung auf den autoritativen Lernendenzustand,
und `ACTIVE` beziehungsweise `EXPIRED` ergeben sich aus Verbindung,
Datensatzexistenz und `expires_at`.

Der Start-Intent ist ein kurzlebiger Auftrag an das Fachbackend, keine Bindung
an eine bestimmte ChatGPT-Konversation. Bei einer erstmaligen Verbindung
speichert der Binding Grant den Intent zunächst **ohne** Curriculum oder
Lernziel zu verändern. Erst nachdem der OAuth-Server das erste Access Token
erfolgreich ausgestellt hat, wendet SkillPilot den Pending Launch unter
Learner- und Datensatz-Lock an. Access-Token-Persistenz, Intent-Anwendung und
Autorisierungsmarkierung liegen dabei in derselben Datenbanktransaktion; ein
Apply-Fehler rollt den gesamten Schritt zurück. Bei einer bereits autorisierten Verbindung wird
derselbe Intent synchron beim Cockpit-Start angewendet. `consumed_at` am
Binding Grant bezeichnet ausschließlich dessen einmaligen Austausch gegen eine
Verbindung; `consumed_at` am Pending Launch bezeichnet die erfolgreiche
serverseitige Anwendung des Intents. Kein MCP-Toolaufruf konsumiert einen
Launch.

Nach erfolgreicher Anwendung des Intents erzeugt beziehungsweise ersetzt
SkillPilot die serverseitige OpenAI-DE-Lernsession. Ihre absolute Frist wird
durch `SKILLPILOT_OPENAI_DE_LEARNING_SESSION_TTL` gesteuert und beträgt
produktiv `PT24H`. MCP-Aufrufe, Access-Token-Refresh, Reload und neue oder
parallele Chats verlängern diese Frist nicht. Nach Ablauf bleibt die
OAuth-Verbindung bestehen; lernendenbezogene Tools liefern
`SESSION_REQUIRED`, bis der Lernende in SkillPilot erneut **Lernen starten**
auswählt.

Ein erneuter Cockpit-Start im selben Browser ersetzt einen noch offenen
Binding Grant atomar. Damit können abgebrochene Popups, abgebrochene
ChatGPT-Dialoge und unterbrochene Redirects unmittelbar neu gestartet werden,
ohne bis zum Ablauf der Binding-TTL in einem HTTP-409-Zustand festzuhängen. Der
vorherige Einmal-Token wird durch die Ersetzung ungültig; weiterhin existiert
höchstens ein offener Grant je Browser-Sitzung.

Abgelaufene Binding Grants und Pending Launches werden regelmäßig entfernt.
`SKILLPILOT_OPENAI_DE_CLEANUP_INTERVAL_MS` steuert das Intervall in Millisekunden;
der Standardwert ist eine Stunde. Eine Verbindung, die bis zum Ablauf der
Launch-TTL nie ein erstes Access Token erhalten hat, wird dabei kontrolliert
widerrufen; zugehörige Pending Launches, Authorization Codes und Consents werden
gelöscht. Bereits autorisierte Verbindungen werden von dieser Bereinigung nicht
erfasst.

Jeder Browserstart muss `providerEligibilityConfirmed=true` ausdrücklich
mitsenden. Fehlt die Bestätigung oder ist sie falsch, weist das Backend den
Start mit `403` ab. Das Cockpit fragt sie einmal pro Browser-Sitzung ab: Die
lernende Person bestätigt damit, mindestens 13 Jahre alt zu sein, jede am
Aufenthaltsort geltende höhere Altersgrenze zu erfüllen und unter 18 die
Erlaubnis eines Elternteils oder einer erziehungsberechtigten Person zu haben.
SkillPilot leitet das Alter nicht aus Klassenstufe oder Curriculum ab und
speichert dafür weder Geburtsdatum noch Altersprofil. Es handelt sich um eine
bewusste Selbstbestätigung, nicht um eine Identitäts- oder Altersverifikation.

Der Coach-Pfad benötigt **keinen OpenAI-Modell-API-Key**. Modell und Chat werden
vom ChatGPT-Konto der lernenden Person bereitgestellt; SkillPilot stellt nur
MCP-, OAuth- und Fachbackend bereit.

Die konfigurierte MCP-Resource ist sicherheitsrelevant und wird absichtlich
**exakt** behandelt. Weder führende oder nachgestellte Leerzeichen noch eine
zusätzliche abschließende `/` werden akzeptiert. Der Authorization Request
wird mit diesem Wert persistiert; Token-Introspektion prüft ihn bei jedem
MCP-Aufruf erneut als Audience. Derselbe Schutz gilt nach Refresh-Token-
Rotation.

### 3.1 Health, Readiness und Metriknamen

Bei `SKILLPILOT_OPENAI_DE_ENABLED=true` registriert Spring den Health-Contributor
`openAiDeCoach`. Er fließt in die Actuator-Gruppe `readiness` ein. Der Beitrag
ist nur `UP`, wenn MCP und OAuth aktiviert sind, die erforderlichen Client- und
Callback-Werte gesetzt sind, die öffentlichen MCP-/Metadata-Ziele gültiges
HTTPS verwenden und der erwartete Vertrag mit genau elf Werkzeugen geladen ist.
Die Readiness-Gruppe enthält zusätzlich den Datenbank-Health-Check `db`; ein
nicht erreichbarer Persistenzdienst darf daher nicht als einsatzbereiter Coach
gemeldet werden.
`SKILLPILOT_OPENAI_DE_WRITES_ENABLED=false` ist ein erlaubter Canary-Zustand und
setzt Readiness nicht auf `DOWN`.

Die Health-Details enthalten ausschließlich nicht geheime Statuswerte, darunter
`mcpEnabled`, `oauthEnabled`, `writesEnabled`, `secureMode`,
`mtlsEdgeEnabled`, `privateKeyJwtConfigured`, `clientIdConfigured`,
`redirectUrisConfigured`, `contractToolCount`, `contractHash`,
`rateLimitEnabled` und `rateLimitConfigured`. Der
`contractHash` ist ein deterministischer SHA-256-Hash über Serverinstruktionen
und öffentliche Tooldeskriptoren. Client-ID, Callback-URLs, MCP-URL, Tokens,
SkillPilot-IDs und Lerninhalte werden nicht ausgegeben. Health-Details dürfen
nur über den internen, geschützten Managementzugang freigegeben werden.

Die exakten Micrometer-Namen heißen:

```text
skillpilot.openai.de.mcp.tool.duration
skillpilot.openai.de.operational.event
```

Der Timer besitzt aus dem Anwendungscode ausschließlich die begrenzten Tags `tool`
(elf bekannte Toolnamen oder `unknown`) und `status` (`success`, `error` oder
`exception`). Der Timer liefert Aufrufzahl und Dauer. Argumente, Prompts,
Antworten, Lernenden- oder Verbindungskennungen und OAuth-Werte sind weder Tags
noch Messdaten. Ein konfigurierter Exporter kann zusätzliche globale
Infrastruktur-Tags ergänzen; auch diese dürfen keine personenbezogenen Werte
enthalten.

Der zweite Name ist ein Counter mit genau einem begrenzten Tag `event`. Er
erfasst ausschließlich `oauth_failure`, `refresh_failure`, `session_required`,
`http_401`, `http_403`, `http_409`, `http_429`, `timeout`, `replay_rejected`,
`cross_provider_rejected` und `tool_exception`. Es gibt keine dynamischen
Fehlertexte, Kennungen, Pfade oder Lerninhalte als Tags. Cross-Learner-/IDOR-
Abwehr wird zusätzlich in negativen Integrationstests geprüft; der MCP-Vertrag
nimmt absichtlich keine Lernendenkennung als Toolargument entgegen.

Der lokale Limiter trennt MCP, OAuth, Cockpit-Start und Metadaten und verwendet
nur die vom Servlet-Container normalisierte Netzwerkadresse. Er parst keine
Forwarding-Header. Deshalb muss der produktive Reverse Proxy eingehende
`Forwarded`-/`X-Forwarded-*`-Header verwerfen beziehungsweise selbst ersetzen,
und der Backendport darf nicht direkt aus dem Internet erreichbar sein. Bei
mehreren Backendinstanzen ist zusätzlich ein gemeinsames Gateway-Limit
verbindlich; der In-Process-Limiter ist bewusst nur eine letzte lokale
Schutzschicht. Eine Ablehnung antwortet mit `429`, `Retry-After` und `no-store`.

Der allgemeine Request-Body-Logger überspringt MCP-, Provider-OAuth- und
OpenAI-Cockpit-Startpfade vollständig. Insbesondere Authorization Codes,
PKCE-Verifier, Access-/Refresh-Tokens und typisierte Lernziel-Startintents dürfen
auch bei aktiviertem Debug-Logging nicht als Request-Body in den
Anwendungslogs erscheinen.

## 4. ChatGPT-App konfigurieren

1. Name: `SkillPilot Coach (Deutsch)`.
2. Beschreibung exakt:

   ```text
   Persönlicher deutscher Lerncoach für deinen gespeicherten SkillPilot-Lernstand. Begleitet dich durch Lernziele, Aufgaben und Wiederholungen und hält deinen Fortschritt fest.
   ```

3. Verbindung: `Server URL`.
4. MCP-URL: `https://skillpilot.com/api/openai/de/mcp`.
5. OAuth mit der in Abschnitt 2 übernommenen CIMD-Client-ID und Callback-URL
   konfigurieren. Der SkillPilot-Metadatenvertrag kündigt ausschließlich
   `private_key_jwt` an; es gibt weder ein manuell geteiltes Client-Secret noch
   einen offenen DCR-Endpunkt.
6. Nach jeder Änderung an Werkzeugliste, Werkzeugbeschreibungen oder
   Serverinstruktionen zuerst das Backend deployen. Danach unter
   `Einstellungen → Plugins` die Developer-Mode-App öffnen und `Refresh`
   ausführen. Prüfen, dass genau die elf deutschen Produktivwerkzeuge
   erscheinen; keine Claude-, Regression- oder Widget-Testwerkzeuge dürfen
   sichtbar sein.

Die sichtbare Beschreibung erklärt ausschließlich den Produktnutzen. ChatGPT
verwendet sie zwar als Signal für die App-Discovery, SkillPilot darf seine
fachliche Korrektheit oder seinen Arbeitsablauf aber nicht von ihrem Wortlaut
abhängig machen. Positive und negative Auswahlgrenzen gehören in die
Werkzeugbeschreibung, werkzeugübergreifende Abläufe in die
MCP-Serverinstruktionen und verbindliche Autorisierung sowie Zustandsübergänge
ins Backend.

Der stabile technische Name des Bootstrap-Werkzeugs bleibt
`get_skillpilot_context_de`. Sein Titel muss
`SkillPilot-Lerncoach starten oder fortsetzen` lauten. Seine Beschreibung nennt
positive Routingfälle (SkillPilot auswählen oder nennen; lernen, üben, starten,
fortsetzen, wiederaufnehmen und Lernstand verwenden) und die negative Grenze
(keine allgemeine Fachfrage ohne SkillPilot-Bezug). Kein zweites,
semantisch gleiches Alias-Werkzeug veröffentlichen.

Die erste Version registriert bewusst keine Widget-Ressource und kein
`outputTemplate`. Auswahl und Coaching bleiben im normalen Chat; technische
Transportwerte werden nicht sichtbar ausgegeben.

## 5. Technischer Smoke-Test

### 5.1 Datenloser Discovery-Bootstrap

Für diesen einmaligen Zustand gilt:

```text
SKILLPILOT_OPENAI_DE_BOOTSTRAP_ENABLED=true
SKILLPILOT_OPENAI_DE_ENABLED=false
SKILLPILOT_OPENAI_DE_OAUTH_ENABLED=false
SKILLPILOT_OPENAI_DE_MCP_ENABLED=false
SKILLPILOT_OPENAI_DE_WRITES_ENABLED=false
```

Dann:

```bash
BASE=https://skillpilot.com

curl -fsS "$BASE/.well-known/oauth-protected-resource/api/openai/de/mcp" \
  | jq -e --arg resource "$BASE/api/openai/de/mcp" \
      --arg issuer "$BASE/api/openai/de" \
      '.resource == $resource
       and (.authorization_servers | index($issuer))'

curl -fsS "$BASE/.well-known/oauth-authorization-server/api/openai/de" \
  | jq -e --arg issuer "$BASE/api/openai/de" \
      '.issuer == $issuer
       and (.code_challenge_methods_supported | index("S256"))
       and (.token_endpoint_auth_methods_supported | index("none"))'

curl -sS -o /dev/null -D - \
  -X POST "$BASE/api/openai/de/mcp" \
  -H 'Content-Type: application/json' \
  --data '{}' \
  | sed -n '/^HTTP\|^[Ww][Ww][Ww]-Authenticate/p'

for path in oauth2/authorize oauth2/token oauth2/revoke oauth2/introspect; do
  test "$(curl -sS -o /dev/null -w '%{http_code}' \
    "$BASE/api/openai/de/$path")" = 404
done
```

Erwartung: beide Metadatenabrufe sind gültig, MCP antwortet `401` mit
`WWW-Authenticate`, und sämtliche OAuth-Protokollendpunkte bleiben `404`.
`openAiDeCoach` existiert in diesem Zustand absichtlich nicht; die allgemeine
Readiness des übrigen SkillPilot-Dienstes muss weiterhin `UP` sein.

### 5.2 Vollbetrieb, zunächst read-only

```bash
BASE=https://skillpilot.com
MANAGEMENT_BASE=http://127.0.0.1:8080

curl -fsS "$MANAGEMENT_BASE/actuator/health/readiness" \
  | jq -e '.status == "UP"'

curl -fsS "$MANAGEMENT_BASE/actuator/health/openAiDeCoach" \
  | jq -e '.status == "UP"'

curl -fsS "$BASE/.well-known/oauth-protected-resource/api/openai/de/mcp" \
  | jq -e --arg resource "$BASE/api/openai/de/mcp" \
      --arg issuer "$BASE/api/openai/de" \
      '.resource == $resource
       and (.authorization_servers | index($issuer))
       and (.scopes_supported | index("skillpilot.openai.de.read"))
       and (.scopes_supported | index("skillpilot.openai.de.write"))'

curl -fsS "$BASE/.well-known/oauth-authorization-server/api/openai/de" \
  | jq -e --arg issuer "$BASE/api/openai/de" \
      '.issuer == $issuer
       and (.code_challenge_methods_supported | index("S256"))
       and (.token_endpoint_auth_methods_supported == ["private_key_jwt"])
       and (.token_endpoint_auth_signing_alg_values_supported | index("RS256"))
       and (.registration_endpoint | not)
       and (.client_id_metadata_document_supported == true)'

curl -sS -o /dev/null -D - \
  -X POST "$BASE/api/openai/de/mcp" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl-smoke","version":"1"}}}' \
  | sed -n '/^HTTP\|^[Ww][Ww][Ww]-Authenticate/p'
```

Erwartung beim letzten Aufruf: `403`. Der Request besitzt kein
OpenAI-Clientzertifikat und wird deshalb bereits am mTLS-Edge abgewiesen, bevor
das Backend einen Bearer Token prüft. Ein mTLS-verifizierter Aufruf aus
ChatGPT ohne oder mit ungültigem Token muss danach `401` und einen
`WWW-Authenticate`-Header mit der OpenAI-DE-Resource-Metadata-URL liefern. Ein
gültiges Token ohne Schreibscope muss stattdessen
`error="insufficient_scope"` erhalten. Diese beiden hinter dem mTLS-Gate
liegenden Fälle werden über die verbundene ChatGPT-App beziehungsweise den
Edge-Integrationstest geprüft, nicht durch ein öffentliches `curl` ohne
Clientzertifikat. Token, Cookies, Authorization Codes, SkillPilot-IDs und
vollständige Schülerantworten dürfen nicht in geteilte Logs oder Tickets
kopiert werden.

`MANAGEMENT_BASE` bezeichnet den internen beziehungsweise geschützten
Managementzugang; Actuator darf dafür nicht ungefiltert über den öffentlichen
Anwendungs-Origin freigegeben werden. Falls Health-Details für den Deployment-
Abgleich autorisiert sichtbar sind, muss `contractHash` aus
`openAiDeCoach` über alle Instanzen desselben Artefakts identisch sein.

## 6. Acceptance-Reihenfolge

### Stufe A – read-only Canary

- Fehlende oder verneinte Provider-Altersbestätigung muss bereits am Cockpit-
  Start mit `403` scheitern; eine bestätigte berechtigte Person darf fortfahren.
- App aus einem frischen Chat verbinden; PKCE, Consent und Callback abschließen.
- `get_skillpilot_context_de` und alle Navigationsabfragen prüfen.
- Reload, neuer Chat und längerer Dialog müssen den Zustand wieder aus dem
  Backend laden können.
- Eine Mutation muss bei deaktiviertem Write-Kill-Switch sicher abgewiesen
  werden, ohne den Nutzer in eine erneute Autorisierung zu schicken.
- Andere Lernende, fremde Resource-Werte, abgelaufene/revozierte Tokens und
  fehlende Scopes müssen negativ getestet werden.

#### Routing-Golden-Prompts

Nach jeder Änderung an Werkzeugtitel, Werkzeugbeschreibung oder
Serverinstruktionen zuerst das Backend deployen und anschließend in der
Developer-Mode-App `Refresh` ausführen. Jeden Test danach in einem frischen Chat
mit aktivierter App ausführen. Für jeden Fall Toolname, Ergebnis und sichtbare
Antwort notieren:

| Prompt | Erwartung |
| --- | --- |
| `Verwende die App SkillPilot Coach (Deutsch) und fahre mit dem in SkillPilot vorbereiteten nächsten Schritt fort.` | `get_skillpilot_context_de` läuft vor der ersten fachlichen Antwort. |
| `Ich möchte Mathe Oberstufe Hessen lernen.` bei ausgewählter App | `get_skillpilot_context_de` läuft; eindeutige Teile werden übernommen und nur die echte offene Entscheidung, typischerweise GK/LK, bleibt. |
| `Lass uns dort weitermachen, wo ich aufgehört habe.` bei ausgewählter App | `get_skillpilot_context_de` lädt den gespeicherten Zustand; kein neuer Lernpfad wird erfunden. |
| `Erkläre mir allgemein die Mitternachtsformel.` ohne ausgewählte App und ohne SkillPilot-Bezug | SkillPilot wird nicht aufgerufen. |
| `Use SkillPilot Coach (Deutsch) and resume my current lesson.` | Der deutsche Bootstrap bleibt auch bei einem englischen direkten App-Auftrag auffindbar und antwortet anschließend deutsch. |

Die Anwendung schreibt pro Toolaufruf ausschließlich eine begrenzte
Diagnosezeile mit Toolname, Status und Dauer, beispielsweise:

```text
OpenAI-DE MCP tool invocation: tool=get_skillpilot_context_de status=success durationMs=42
```

Lerninhalte, Antworten, Toolargumente, Tokens und Lernendenkennungen dürfen
darin nicht erscheinen. Für den Live-Test kann die Zeile mit
`journalctl -u skillpilot` geprüft werden.

### Stufe B – Schreibpilot

Nach Stufe A `SKILLPILOT_OPENAI_DE_WRITES_ENABLED=true` setzen und neu starten.
Dann mit einem dedizierten Testlernstand sämtliche Nutzerreisen prüfen:

1. Curriculum und Personalisierung;
2. Scope und aktives Frontier-Ziel;
3. Erklärung, Aufgabe und fachlich alternative korrekte Lösung;
4. Mastery-Update einschließlich Konfliktfall;
5. Verified Recall mit Antwortfreigabe erst nach Lernendenantwort;
6. Prüfung ohne lösungslenkende Nachfrage und Evaluation erst nach vollständiger
   sichtbarer Abgabe;
7. Wiederaufnahme, Parallelchat, Retry, Widerruf und erneute Verbindung.

Zusätzlich sind die drei Cockpit-Starts separat zu prüfen:

- erstmalige, noch unverbundene Sitzung mit Curriculumwechsel: Vor erfolgreicher
  Ausgabe des ersten Access Tokens darf der Lernstand unverändert bleiben;
  unmittelbar danach müssen Curriculum und Intent unter Learner-Lock atomar
  angewendet und der Pending Launch als konsumiert markiert sein;
- Verified Recall: Ziel und Batchgröße müssen als typisierter Intent ankommen,
  das aktivierte Ziel muss serverseitig als atomares Memory-/SRS-Ziel validiert
  sein;
- Abi 2026: Kursniveau und Prüfungsziel müssen typisiert gespeichert und auf
  die bekannten GK-/LK-Kampagnenziele, vorhandene `examData` und den passenden
  Kurs-Tag begrenzt sein;
- ein erster MCP-Aufruf in einem beliebigen parallelen Chat darf keinen
  Start-Intent konsumieren oder anwenden; jeder Chat liest lediglich den
  bereits autorisierten, gemeinsamen Backendzustand neu ein;
- nach Ablauf der TTL muss die regelmäßige Bereinigung Binding Grants und
  Pending Launches entfernen sowie abgebrochene, nie autorisierte Verbindungen
  einschließlich OAuth-Code-Daten widerrufen; autorisierte Verbindungen müssen
  bestehen bleiben.

In allen drei Fällen darf die sichtbare Startnachricht den Zweck und bei
Verified Recall die Kartenanzahl nennen, aber weder SkillPilot-ID noch Lernziel-
ID oder andere technische Schlüssel enthalten.

Die App wird erst dann zum Standard, wenn zusätzlich die vorgesehene kostenlose
und feste Consumer-Abo-Nutzung, Deutschland/EU, Web und die benötigten mobilen
Oberflächen praktisch bestätigt sind.

## 7. Cockpit-Canary und Cutover

Die Variante ist eine bewusste Entscheidung pro Frontend-Artefakt. Der stabile
Produktionseinstieg im Repository-Root setzt die aktuelle Produktentscheidung
`openai-mcp`; die generische Deployment-Engine akzeptiert weiterhin keinen
impliziten Default. An der Engine muss für jedes Deployment genau einer der
Werte `visible-session`, `openai-mcp` oder `legacy` gesetzt sein.

Für den deutschen MCP-Canary beziehungsweise Cutover ist der stabile
Produktionsaufruf:

```bash
./deploy_skillpilot.sh
```

Der Einstieg im Repository-Root setzt die produktive Variante bewusst auf
`openai-mcp` und delegiert an `scripts/deploy.sh`. Die Engine akzeptiert
weiterhin keinen fehlenden oder ungültigen Variantenwert und bricht dann
**vor** Git-Update, Build und Restart ab. Dadurch bleibt die Artefaktprüfung
erhalten, ohne dass beim normalen Deployment jedes Mal eine Buildvariable
manuell angegeben werden muss. Ein Rollback überschreibt die Variante
ausdrücklich mit `--coach-variant visible-session` am selben Einstiegspunkt.
Eine eventuell noch in der Shell vorhandene
`VITE_SKILLPILOT_COACH_VARIANT`-Variable wird vom Produktionseinstieg bewusst
ignoriert.

Der Build schreibt die aufgelöste Variante nach
`backend/src/main/resources/static/version.json` in das Feld `coachVariant` und
als `<meta name="skillpilot-coach-variant" ...>` nach
`backend/src/main/resources/static/index.html`.
`scripts/deploy.sh` prüft beide Werte unmittelbar nach dem Frontend-Build mit
`scripts/verify_frontend_coach_variant.mjs` und stoppt bei jeder Abweichung vor
dem Backend-Build und Restart. Nach dem Restart liest dasselbe Prüfskript
`version.json` und `index.html` noch einmal cache-frei von
`SKILLPILOT_BASE_URL` (Standard: `https://skillpilot.com`). Ein alter
Visible-Session-Build hinter Proxy oder Cache lässt das Deployment dadurch
ebenfalls fehlschlagen.

Die OpenAI-MCP-Variante ist derzeit ausschließlich für Deutsch freigegeben. Der
globale Build-Schalter stellt deshalb nur Deutsch auf MCP um; Englisch bleibt
ohne Nutzerfehler auf der bisherigen `visible-session`-Variante und der
bestehenden englischen GPT-URL.

Beim ersten Start erzeugt das Cockpit ein kurzlebiges Browser-Binding und öffnet
ChatGPT mit einer kurzen, natürlichsprachlichen Startnachricht im URL-codierten
`prompt`-Parameter. Der Benutzer muss keinen Text kopieren oder einfügen.
Spezielle Starts werden serverseitig als enges, auditierbares Intent-Schema
vorbereitet; es wird kein freier Instruktionstext aus dem Browser übernommen.
Nach erfolgreicher Verbindung erzeugen spätere Starts keine sichtbare
Session-ID. Die dauerhafte SkillPilot-ID bleibt außerhalb von OAuth-Principal,
Chat, URL-Prompt und Toolvertrag. Die Startnachricht beschreibt nur den
gewünschten Einstieg. Sie und der Pending Launch werden nicht einer konkreten
Chat-Konversation zugeordnet; neue und parallele Chats rehydrieren den bereits
vorbereiteten Lernstand über OAuth-Principal und aktive serverseitige
24h-Lernsession aus dem Backend.

Der Deployment-Canary muss für `CURRENT_UNIT`, `VERIFIED_RECALL` und
`ABI26_EXAM` zusätzlich prüfen, dass ChatGPT den genau einmal vorhandenen
`prompt`-Parameter in den Composer übernimmt. Die URL darf weder SkillPilot-ID
noch Lernziel-ID, Binding Grant, OAuth-Token oder Lernsession-ID enthalten.

## 8. Rollback

1. Frontend ausdrücklich mit
   `./deploy_skillpilot.sh --coach-variant visible-session` bauen und
   ausliefern. Die Artefaktprüfung muss `visible-session` bestätigen.
2. Zuerst `SKILLPILOT_OPENAI_DE_WRITES_ENABLED=false`, bei vollständiger
   Abschaltung zusätzlich `SKILLPILOT_OPENAI_DE_MCP_ENABLED=false`,
   `SKILLPILOT_OPENAI_DE_OAUTH_ENABLED=false` und
   `SKILLPILOT_OPENAI_DE_ENABLED=false` sowie
   `SKILLPILOT_OPENAI_DE_BOOTSTRAP_ENABLED=false` setzen.
3. App in ChatGPT deaktivieren beziehungsweise die betroffene Version
   zurückziehen.
4. Bestehende OpenAI-DE-Verbindungen serverseitig widerrufen, falls ein
   Sicherheitsgrund vorliegt.

Die additiven Datenbanktabellen können stehen bleiben. Die getrennten Quellen
unter `ai/openai custom gpt/` und `ai/openai-custom-gpt-visible-session/` werden
nicht entfernt oder überschrieben.

## 9. Externe Restarbeiten

Lokaler Code kann weder die echte App-Verwaltung konfigurieren noch Provider-
Review, Tarifverfügbarkeit oder einen produktiven OAuth-Callback bestätigen.
Für den sicheren Cutover des bereits aktuellen MCP-Produktpfads werden daher
noch benötigt:

- Übernahme der exakten CIMD-Metadaten-URL, JWKS-URL und tatsächlichen
  Callback-URL aus der deutschen App;
- einmalige privilegierte mTLS-Edge-Installation und Nachweis, dass der
  Backendport nur über den vertrauenswürdigen Proxy erreichbar ist;
- Datenbank-Backup, Deployment des Spring-Boot-Artefakts samt Migration und
  atomarer Environment-Umstellung;
- Aktualisierung der deutschen App-Version mit der kanonischen Server-URL und
  anschließende erneute OAuth-Autorisierung;
- dokumentierte positive und negative End-to-End-Evidenz aus ChatGPT;
- erst danach Freigabe der Schreibfunktion und allgemeine Freigabe des
  verschärften Produktpfads.
