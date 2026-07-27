# ChatGPT-App „SkillPilot Coach (Deutsch)“: Deployment und Cutover

**Stand:** 26. Juli 2026

**Status:** Der deutsche MCP-Coach ist der aktuelle ChatGPT-Produktpfad. Die
Clientbindung wird nach vollständiger Prüfung des ausgewählten
OAuth-Clientprofils und erneutem Workflow-Acceptance-Test allgemein
freigegeben. OpenAI-mTLS ist eine optionale spätere Härtung und keine
Voraussetzung für den produktiven Kompatibilitätsmodus.

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
Benutzer geben niemals OAuth-Token, OAuth-Client-Secret oder dauerhafte
SkillPilot-ID im Chat ein. Jeder ausdrückliche Start in SkillPilot erzeugt
jedoch eine davon unabhängige, absolut 24 Stunden gültige
`learningSessionId`. SkillPilot trägt diese Referenz automatisch in die
Startnachricht ein; ChatGPT übergibt sie unverändert an jedes fachliche
MCP-Werkzeug.

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

Der Produktivvertrag verwendet Authorization Code mit PKCE `S256` und genau
einen vorregistrierten **vertraulichen OAuth-Client** für die App
`SkillPilot Coach (Deutsch)`. Dessen feste Client-ID, langes zufälliges
Client-Secret, exakte Callback-Allowlist, feste MCP-Resource und feste Scopes
werden vom App-Autor auf beiden Seiten konfiguriert. ChatGPT authentisiert sich
am Token-Endpunkt mit `client_secret_basic`; SkillPilot akzeptiert weder
`none` noch offene Dynamic Client Registration, CIMD oder
`private_key_jwt` im aktiven Produktivprofil.

Das Secret ist ausschließlich geschützte Konfiguration in ChatGPT und
SkillPilot. Es gehört weder in Repository, Browser, Startnachricht,
Toolargumente noch Logs. PKCE bindet zusätzlich den Authorization Code an den
von ChatGPT erzeugten Verifier. Normales serverauthentisiertes HTTPS bleibt
Pflicht. Optionales OpenAI-mTLS kann den MCP-Rand später zusätzlich härten,
ist aber weder App-Identität noch Voraussetzung dieses Vertrags.

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
4. Eine feste, nur dieser App zugeordnete Client-ID und ein langes zufälliges
   Client-Secret erzeugen. Dieselben Werte in ChatGPT und SkillPilot
   konfigurieren; das Secret nie in Dokumentation oder Tickets kopieren.
5. Die dort angezeigte app-spezifische Produktions-Callback-URL der Form
   `https://chatgpt.com/connector/oauth/{callback_id}` unverändert übernehmen.
6. Mehrere echte Callback-URLs als kommaseparierte Liste konfigurieren. Keine
   Beispiel- oder Legacy-URL ergänzen, die nicht in der App-Verwaltung steht.
7. In ChatGPT als Token-Endpunkt-Authentisierung `client_secret_basic`
   auswählen. Bootstrap ausschalten und Vollbetrieb mit Client-ID, Secret,
   Callback, OAuth, MCP und aktivierten Schreiboperationen atomar aktivieren.
   Ein read-only Canary ist ein bewusst nicht produktionsbereiter
   Diagnosezustand.

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

Für den sicheren Cutover können Code und additive Liquibase-Migration zunächst
in einem getrennten read-only Canary geprüft werden. Der produktive
Kompatibilitätsmodus benötigt dagegen aktivierte Schreiboperationen und
verwendet normales
serverauthentisiertes HTTPS am Reverse Proxy und verpflichtendes OAuth/PKCE mit
exakter Resource-/Audience- und Scope-Prüfung. Die optionale, privilegierte
mTLS-Edge-Installation ist getrennt in
[openai-mcp-edge-mtls.md](openai-mcp-edge-mtls.md) beschrieben. Das normale
`./deploy_skillpilot.sh` prüft die mTLS-Laufzeitgrenze nur, wenn diese Härtung
ausdrücklich aktiviert ist.

```text
SERVER_ADDRESS=127.0.0.1

SKILLPILOT_PUBLIC_BASE_URL=https://skillpilot.com
# Unabhängig vom OAuth-Client-Secret erzeugen, z. B.: openssl rand -hex 32
SKILLPILOT_SIGNING_SECRET=<mindestens-32-hochentropische-zeichen>

SKILLPILOT_OPENAI_DE_ENABLED=true
SKILLPILOT_OPENAI_DE_BOOTSTRAP_ENABLED=false
SKILLPILOT_OPENAI_DE_OAUTH_ENABLED=true
SKILLPILOT_OPENAI_DE_MCP_ENABLED=true
SKILLPILOT_OPENAI_DE_WRITES_ENABLED=true
SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED=false

# Erst nach separater, optionaler mTLS-Edge-Installation:
# SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED=true
# SKILLPILOT_OPENAI_DE_MTLS_EDGE_TRUSTED_PROXIES=127.0.0.1,::1

SKILLPILOT_OPENAI_DE_MCP_URL=https://skillpilot.com/api/openai/de/mcp
SKILLPILOT_OPENAI_DE_RESOURCE_METADATA=https://skillpilot.com/api/openai/de/oauth/protected-resource
SKILLPILOT_OPENAI_DE_CHATGPT_URL=https://chatgpt.com/

SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_AUTHENTICATION_METHOD=client_secret_basic
SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_ID=<exakte-feste-client-id-dieser-app>
SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET=<langes-zufälliges-client-secret>
SKILLPILOT_OPENAI_DE_OAUTH_REDIRECT_URIS=<exakte-callback-url-oder-kommaliste>

# Nur bei einem tatsächlichen Client-ID-Wechsel, einmalig und danach entfernen:
# SKILLPILOT_OPENAI_DE_OAUTH_LEGACY_CLIENT_IDS=<exakte-alte-client-id-oder-kommaliste>

SKILLPILOT_OPENAI_DE_SECURE_COOKIE=true
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

`SKILLPILOT_OPENAI_DE_WRITES_ENABLED=true` ist für den funktionsfähigen
Produktivcoach verpflichtend. Personalisierung, Navigation, Aufgabenfortschritt
und Mastery sind fachlich schreibende Vorgänge. Bei `false` funktionieren
Discovery, OAuth und lesende Werkzeuge weiterhin, aber der Coach bricht beim
ersten erforderlichen Zustandswechsel mit `503 Service Unavailable` ab. Dieser
Wert ist deshalb ausschließlich für einen bewusst isolierten read-only Canary
geeignet. Die Betriebsabschaltung darf keine erneute OAuth-Verbindung auslösen.

Der normale aktivierte Provider startet ausschließlich im sicheren
Clientmodus; es gibt keinen produktiven `secure-mode=false`-Schalter. Der
sichere Clientmodus verlangt `client_secret_basic` und prüft die exakte
Client-ID, das Secret in konstantzeitgeeigneter Form, Redirect-Allowlist,
Resource, Scopes und PKCE `S256`. Fehlendes Secret, `none`,
`private_key_jwt`, DCR, CIMD und jeder stille Profil-Fallback brechen den Start
beziehungsweise den Tokenaustausch fail-closed ab. Nur bei ausdrücklich
aktivierter mTLS-Härtung werden zusätzlich numerisch konfigurierte Trusted
Proxies und die fail-closed Edge-Bestätigung verlangt.

Auch `SKILLPILOT_SIGNING_SECRET` ist für den aktivierten OpenAI-DE-Provider
verpflichtend. Der Prozess bricht den Start ab, wenn der Wert fehlt, dem
unsicheren Platzhalter entspricht, weniger als 32 Nicht-Leerzeichen enthält
oder strukturell zu wenig Entropie aufweist. Der Wert wird in dieser Prüfung
weder protokolliert noch in einer Fehlermeldung wiedergegeben. Er ist ein
eigenständiges HMAC-Betriebsgeheimnis und darf nicht mit dem OAuth-Client-
Secret identisch sein.

Das Client-Secret wird als Betriebsgeheimnis verwaltet: restriktive
Dateirechte, keine Shell-History, kein Request-/Health-Detail, keine
Clientausgabe. Bei einer Rotation werden zunächst ChatGPT und SkillPilot
koordiniert umgestellt, anschließend alle mit dem alten Clientvertrag
ausgestellten Tokens widerrufen.

Die Legacy-Client-Allowlist ist nicht Bestandteil des Basisprofils. Sie wird
nur bei einem tatsächlichen Client-ID-Wechsel verwendet. SkillPilot entfernt
dann ausschließlich für die exakt genannten Altclients deren OAuth-
Authorizations, Consents, registrierte Clientzeilen sowie Access- und Refresh-
Tokens. Historische Verbindungs-, Binding-Grant- und Pending-Launch-
Altartefakte dürfen beim einmaligen Cutover zusätzlich bereinigt werden. Die
heutigen `openai_de_learning_session`-Datensätze werden durch eine reine
OAuth-Clientrotation dagegen nicht gelöscht. Anschließend muss nur der neu
konfigurierte Client lesbar sein; andernfalls bricht der Start ab.

Vor diesem Cutover ist ein Datenbank-Backup Pflicht. Die Einstellung ist
idempotent für bereits entfernte IDs, soll aber nach dem erfolgreichen
Produktionsstart wieder aus dem Environment entfernt werden. Alte Access- und
Refresh-Tokens sowie Autorisierungen sind absichtlich unwiderruflich
ungültig; ein reines Anwendungs-Rollback stellt sie nicht wieder her. Benutzer
autorisieren die SkillPilot-App danach einmal neu.

Die aktuelle additive Migration stellt
`openai_de_learning_session` als eigenständige Startberechtigung bereit. Der
Datensatz enthält mindestens den Hash der zufälligen `learningSessionId`, die
interne Lernendenreferenz, `started_at` und `expires_at`. Die dauerhafte
SkillPilot-ID und der Klartext der Session-ID werden dort nicht dupliziert.
Alte, ausschließlich über ein OAuth-Subject adressierte Sitzungszeilen sind
kein Fallback und werden beim Cutover kontrolliert entfernt oder migriert.

Der Start-Intent ist ein kurzlebiger Auftrag an das Fachbackend. Bei **jedem**
Klick auf **Lernen starten** wendet SkillPilot den eng typisierten Intent unter
Learner-Lock auf den autoritativen Zustand an und erzeugt unmittelbar danach
eine neue kryptografisch zufällige `learningSessionId`. Auch zwei Starts
desselben Lernenden erzeugen verschiedene IDs. Die absolute Frist wird durch
`SKILLPILOT_OPENAI_DE_LEARNING_SESSION_TTL` gesteuert und beträgt produktiv
`PT24H`. MCP-Aufrufe, Access-Token-Refresh, Reload und neue oder parallele
Chats verlängern sie nicht.

Die Session-ID wird einmal automatisch in den URL-codierten Startprompt
eingetragen und danach von ChatGPT unverändert als Pflichtargument an jedes
lernendenbezogene Tool weitergegeben. SkillPilot löst ausschließlich den Hash
auf den Lernenden auf. OAuth allein erzeugt oder wählt keine Lernsession; eine
Session-ID allein autorisiert keinen MCP-Aufruf. Fehlt einer der beiden
Nachweise, liefert der Fachvertrag `SESSION_REQUIRED` beziehungsweise einen
OAuth-Fehler. Ein Fallback vom OAuth-Subject auf einen Lernenden ist
unzulässig.

Das Cockpit startet ausschließlich über
`POST /api/ui/learners/{skillpilotId}/openai/de/launch`. Ein erfolgreicher
Aufruf wendet den typisierten Start-Intent an und erzeugt genau eine neue
Lernsession samt Startprompt. Jeder weitere Aufruf erzeugt unabhängig von
Browser, bestehender App-Autorisierung oder früheren Starts eine neue Session.
Der `/launch`-Aufruf ist eigenständig und benötigt keinen vorgeschalteten
Verbindungsstatus oder kurzlebigen Browser-Zwischenzustand.

Abgelaufene oder widerrufene Lernsession-Datensätze werden unabhängig vom
OAuth-Lebenszyklus abgewiesen und bereinigt. Authorization Codes, Access- und
Refresh-Tokens sowie Consents folgen ausschließlich ihrem eigenen OAuth-
Lebenszyklus. Insbesondere erzeugt Tokenausgabe oder Token-Refresh keine
Lernsession und verlängert keine bestehende. Das Intervall der technischen
Bereinigung steuert `SKILLPILOT_OPENAI_DE_CLEANUP_INTERVAL_MS`; der
Standardwert ist eine Stunde.

Jeder `/launch`-Aufruf muss `providerEligibilityConfirmed=true` ausdrücklich
mitsenden. Fehlt die Bestätigung oder ist sie falsch, weist das Backend den
Start mit `403` ab. Das Cockpit fragt sie einmal pro Browser-Sitzung ab: Die
lernende Person bestätigt damit, mindestens 13 Jahre alt zu sein, jede am
Aufenthaltsort geltende höhere Altersgrenze zu erfüllen und unter 18 die
Erlaubnis eines Elternteils oder einer erziehungsberechtigten Person zu haben.
SkillPilot leitet das Alter nicht aus Klassenstufe oder Curriculum ab und
speichert dafür weder Geburtsdatum noch Altersprofil. Es handelt sich um eine
bewusste Selbstbestätigung, nicht um eine Identitäts- oder Altersverifikation
und nicht um OAuth-Client- oder Lernendenidentität.

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
`SKILLPILOT_OPENAI_DE_WRITES_ENABLED=false` ist ein erlaubter read-only
Canary-Zustand und setzt die gemeinsame Readiness nicht auf `DOWN`. Ob der
vollständige Coach produktiv funktionsfähig ist, muss deshalb zusätzlich über
die Betriebsumgebung beziehungsweise einen separaten Deployment-Preflight
geprüft werden.

Die Health-Details enthalten ausschließlich nicht geheime Statuswerte, darunter
`mcpEnabled`, `oauthEnabled`, `writesEnabled`, `secureMode`,
`mtlsEdgeEnabled`, `clientAuthenticationMethod`, `publicClientConfigured`,
`privateKeyJwtConfigured`, `clientIdConfigured`, `redirectUrisConfigured`,
`contractToolCount`, `contractHash`, `rateLimitEnabled` und
`rateLimitConfigured`. Der
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
5. OAuth mit der festen Client-ID, dem dazugehörigen Client-Secret und der
   exakten Callback-URL konfigurieren. Als Authentisierungsmethode am
   Token-Endpunkt `client_secret_basic` wählen. DCR, CIMD, `none` und
   `private_key_jwt` gehören nicht in diese produktive App-Konfiguration.
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
`outputTemplate`. Auswahl und Coaching bleiben im normalen Chat. Die
`learningSessionId` erscheint ausschließlich in der automatisch vorbereiteten
Startnachricht und wird danach als Toolparameter weitergereicht; sie ist keine
dauerhafte SkillPilot-ID und kein OAuth-Token.

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
       and (.token_endpoint_auth_methods_supported | index("client_secret_basic"))'

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
AUTH_METHOD="${SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_AUTHENTICATION_METHOD:-client_secret_basic}"

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
  | jq -e --arg issuer "$BASE/api/openai/de" --arg auth "$AUTH_METHOD" \
      '.issuer == $issuer
       and (.code_challenge_methods_supported | index("S256"))
       and (.token_endpoint_auth_methods_supported == [$auth])
       and (.registration_endpoint | not)'

curl -sS -o /dev/null -D - \
  -X POST "$BASE/api/openai/de/mcp" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl-smoke","version":"1"}}}' \
  | sed -n '/^HTTP\|^[Ww][Ww][Ww]-Authenticate/p'
test "$AUTH_METHOD" = client_secret_basic
```

Erwartung beim letzten Aufruf im TLS/OAuth-Kompatibilitätsmodus: `401` mit
einem `WWW-Authenticate`-Header, der auf die
OpenAI-DE-Resource-Metadata-URL verweist. Ein gültiges Token ohne
Schreibscope muss stattdessen `error="insufficient_scope"` erhalten.

Nur bei aktivierter optionaler mTLS-Härtung ist für den öffentlichen Aufruf
ohne OpenAI-Clientzertifikat bereits am Edge `403` zu erwarten. Der
mTLS-verifizierte Aufruf aus ChatGPT ohne oder mit ungültigem Token muss
dahinter weiterhin `401` liefern. Token, Cookies, Authorization Codes,
SkillPilot-IDs und vollständige Schülerantworten dürfen nicht in geteilte Logs
oder Tickets kopiert werden.

`MANAGEMENT_BASE` bezeichnet den internen beziehungsweise geschützten
Managementzugang; Actuator darf dafür nicht ungefiltert über den öffentlichen
Anwendungs-Origin freigegeben werden. Falls Health-Details für den Deployment-
Abgleich autorisiert sichtbar sind, muss `contractHash` aus
`openAiDeCoach` über alle Instanzen desselben Artefakts identisch sein.

## 6. Acceptance-Reihenfolge

### Stufe A – isolierter read-only Canary

Diese Stufe dient ausschließlich der gezielten Prüfung von Discovery, OAuth,
Sitzungsauflösung und lesenden Werkzeugen. Die gemeinsame Readiness bleibt
dabei absichtlich nutzbar; der Zustand ist dennoch kein funktionsfähiger
Produktivcoach.

- Fehlende oder verneinte Provider-Altersbestätigung muss bereits am Cockpit-
  Start mit `403` scheitern; eine bestätigte berechtigte Person darf fortfahren.
- App aus einem frischen Chat verbinden; PKCE, Consent und Callback abschließen.
- Fehlendes/falsches Client-Secret, falsche Client-ID, falsche Callback-URI und
  falsche Resource müssen am OAuth-Vertrag scheitern; Secrets dürfen dabei
  weder in Antwort noch Log erscheinen.
- In SkillPilot zweimal nacheinander **Lernen starten** und nachweisen, dass
  zwei verschiedene `learningSessionId`-Werte mit jeweils eigenem absoluten
  Ablauf entstanden sind.
- `get_skillpilot_context_de` und alle Navigationsabfragen mit gültigem OAuth
  und der jeweils richtigen Session-ID prüfen.
- Dasselbe Access Token ohne Session-ID, mit falscher, abgelaufener oder zu
  einem anderen Lernenden gehörender Session-ID muss scheitern.
- Eine gültige Session-ID ohne gültiges OAuth Access Token muss ebenfalls
  scheitern.
- Reload, neuer Chat und längerer Dialog müssen den Zustand wieder aus dem
  Backend laden können, solange ChatGPT die Session-ID weiter an jedes Tool
  übergibt.
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

### Stufe B – funktionsfähiger Schreibpilot

Nach Stufe A `SKILLPILOT_OPENAI_DE_WRITES_ENABLED=true` setzen und neu starten.
Erst dieser Zustand ist als vollständiger Produktivcoach freizugeben.
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

- `CURRENT_UNIT`: Ein einzelner Aufruf von
  `POST /api/ui/learners/{skillpilotId}/openai/de/launch` muss Intent und
  Lernendenzustand unter Learner-Lock anwenden und genau eine neue Session
  erzeugen. Das gilt unabhängig davon, ob die App bereits autorisiert ist;
  OAuth-Tokenausgabe darf daran weder beteiligt sein noch darauf warten;
- Verified Recall: Ziel und Batchgröße müssen als typisierter Intent ankommen,
  das aktivierte Ziel muss serverseitig als atomares Memory-/SRS-Ziel validiert
  sein;
- Abi 2026: Kursniveau und Prüfungsziel müssen typisiert gespeichert und auf
  die bekannten GK-/LK-Kampagnenziele, vorhandene `examData` und den passenden
  Kurs-Tag begrenzt sein;
- ein erster MCP-Aufruf in einem beliebigen parallelen Chat darf keinen
  Start-Intent konsumieren oder anwenden; jeder Chat benötigt die beim
  expliziten Start erzeugte Session-ID;
- nach Ablauf der TTL muss die Lernsession unabhängig von OAuth abgewiesen und
  bereinigt werden; abgelaufene OAuth-Codes und -Tokens werden separat
  bereinigt, während eine weiterhin gültige App-Autorisierung bestehen bleibt.

In allen drei Fällen enthält die sichtbare Startnachricht genau die neu
erzeugte `learningSessionId` sowie den fachlichen Startzweck. Sie enthält weder
dauerhafte SkillPilot-ID, OAuth-Token, Client-Secret noch interne Lernziel-ID.
Der Benutzer muss die Session-ID weder kopieren noch verändern.

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

Bei jedem Start ruft das Cockpit einmal
`POST /api/ui/learners/{skillpilotId}/openai/de/launch` auf und öffnet ChatGPT
mit der zurückgegebenen, natürlichsprachlichen Startnachricht im URL-codierten
`prompt`-Parameter. Der Benutzer muss keinen Text kopieren oder einfügen.
Spezielle Starts werden serverseitig als enges, auditierbares Intent-Schema
vorbereitet; es wird kein freier Instruktionstext aus dem Browser übernommen.
Jeder erfolgreiche Aufruf erzeugt unabhängig vom App-Autorisierungsstatus eine
neue `learningSessionId` mit exakt 24 Stunden absoluter Gültigkeit und
nimmt sie in denselben Prompt auf. Die dauerhafte SkillPilot-ID bleibt
außerhalb von OAuth-Principal, Chat, URL-Prompt und Toolvertrag. ChatGPT muss
die Session-ID aus dem Prompt unverändert in **jedem** fachlichen MCP-Aufruf
mitsenden. Die Session-ID ist nicht an eine Chat-Konversation gebunden; sie
kann innerhalb ihrer Frist in einem neuen Chat weiterverwendet werden, wird
aber weder durch Nutzung noch durch OAuth-Refresh verlängert.

Der Deployment-Canary muss für `CURRENT_UNIT`, `VERIFIED_RECALL` und
`ABI26_EXAM` zusätzlich prüfen, dass ChatGPT den genau einmal vorhandenen
`prompt`-Parameter in den Composer übernimmt. Die URL beziehungsweise der
Prompt darf weder dauerhafte SkillPilot-ID noch Lernziel-ID, OAuth-Token oder
Client-Secret enthalten; die einmalige
`learningSessionId` ist darin dagegen ausdrücklich erforderlich.

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

- Konfiguration derselben festen Client-ID und desselben langen zufälligen
  Client-Secrets in der deutschen App und im SkillPilot-Server sowie Übernahme
  der tatsächlichen Callback-URL; am Token-Endpunkt muss
  `client_secret_basic` ausgewählt sein;
- Nachweis, dass der Backendport nicht direkt aus dem Internet erreichbar ist;
  eine einmalige privilegierte mTLS-Edge-Installation ist eine getrennt
  geplante optionale Härtung;
- Datenbank-Backup, Deployment des Spring-Boot-Artefakts samt Migration und
  atomarer Environment-Umstellung;
- Aktualisierung der deutschen App-Version mit der kanonischen Server-URL und
  anschließende erneute OAuth-Autorisierung;
- dokumentierte positive und negative End-to-End-Evidenz aus ChatGPT;
- erst danach Freigabe der Schreibfunktion und allgemeine Freigabe des
  Produktpfads.
