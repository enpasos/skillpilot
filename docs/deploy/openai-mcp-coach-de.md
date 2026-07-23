# ChatGPT-App „SkillPilot Coach Deutsch“: Deployment und Cutover

**Stand:** 23. Juli 2026

**Status:** Implementierung vorhanden; produktive Aktivierung erst nach realem
OAuth- und Workflow-Acceptance-Test

Dieses Runbook aktiviert den deutschen, zunächst UI-losen MCP-Lerncoach. Der
MCP-Server, OAuth-Authorization-Server und die SkillPilot-Fachlogik laufen im
**bestehenden Spring-Boot-Prozess**. Der Node-Code unter `ai/openai app/` bleibt
ein lokales Regressionstest- und späteres Widget-Testbett und wird nicht in den
Produktivpfad geschaltet.

Die Architektur- und Migrationsentscheidungen stehen in
[openai-mcp-coach-migration-plan.md](../concept/runtime-workflows/openai-mcp-coach-migration-plan.md).

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

Die erste Version verwendet einen vorab registrierten öffentlichen OAuth-Client
mit Authorization Code, PKCE `S256` und `token_endpoint_auth_method=none`.
SkillPilot unterstützt für diesen Vertrag absichtlich weder offene Dynamic
Client Registration noch eine erfundene allgemeine Callback-URL.

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
4. Als stabilen, öffentlichen Client-Identifier
   `skillpilot-chatgpt-de-prod` verwenden und denselben Wert später im
   SkillPilot-Backend konfigurieren. Es gibt kein Client-Secret.
5. Die dort angezeigte app-spezifische Produktions-Callback-URL der Form
   `https://chatgpt.com/connector/oauth/{callback_id}` unverändert übernehmen.
6. Mehrere echte Callback-URLs als kommaseparierte Liste konfigurieren. Keine
   Beispiel- oder Legacy-URL ergänzen, die nicht in der App-Verwaltung steht.
7. Bootstrap ausschalten und Vollbetrieb mit Client-ID, Callback, OAuth und MCP
   atomar aktivieren. Der erste Vollbetrieb bleibt read-only.

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

Für die erste Auslieferung werden Code und additive Liquibase-Migration mit
deaktivierter Funktion bereitgestellt. Danach folgt ein read-only Canary.

```text
SKILLPILOT_PUBLIC_BASE_URL=https://skillpilot.com
SKILLPILOT_SIGNING_SECRET=<starker-stabiler-secret-wert>

SKILLPILOT_OPENAI_DE_ENABLED=true
SKILLPILOT_OPENAI_DE_BOOTSTRAP_ENABLED=false
SKILLPILOT_OPENAI_DE_OAUTH_ENABLED=true
SKILLPILOT_OPENAI_DE_MCP_ENABLED=true
SKILLPILOT_OPENAI_DE_WRITES_ENABLED=false

SKILLPILOT_OPENAI_DE_MCP_URL=https://skillpilot.com/api/openai/de/mcp
SKILLPILOT_OPENAI_DE_RESOURCE_METADATA=https://skillpilot.com/api/openai/de/oauth/protected-resource
SKILLPILOT_OPENAI_DE_CHATGPT_URL=https://chatgpt.com/

SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_ID=skillpilot-chatgpt-de-prod
SKILLPILOT_OPENAI_DE_OAUTH_REDIRECT_URIS=<exakte-callback-url-oder-kommaliste>

SKILLPILOT_OPENAI_DE_SECURE_COOKIE=true
SKILLPILOT_OPENAI_DE_BINDING_TTL=PT5M
SKILLPILOT_OPENAI_DE_LAUNCH_TTL=PT5M
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

Die Migrationen `009`, `010` und `011` legen neben Verbindung und einmaligem
Browser-Binding auch den typisierten Start-Intent, die browsergebundene
Einmalverwendung und die OAuth-Gültigkeitsgrenze der Verbindung ab. Erlaubt sind nur
`CURRENT_UNIT`, `VERIFIED_RECALL` und `ABI26_EXAM`; ein freies `promptContext`
gehört ausdrücklich nicht zum OpenAI-MCP-Startvertrag.

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
`mcpEnabled`, `oauthEnabled`, `writesEnabled`, `clientIdConfigured`,
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
erfasst ausschließlich `oauth_failure`, `refresh_failure`, `http_401`,
`http_403`, `http_409`, `http_429`, `timeout`, `replay_rejected`,
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

1. Name: `SkillPilot Coach Deutsch`.
2. Beschreibung: kurz und deutsch; Lernpfad, Aufgaben, Lernstand und
   Wiederaufnahme nennen.
3. Verbindung: `Server URL`.
4. MCP-URL: `https://skillpilot.com/api/openai/de/mcp`.
5. OAuth mit Client-ID `skillpilot-chatgpt-de-prod`, ohne Client-Secret und mit
   der in Abschnitt 2 übernommenen Callback-URL konfigurieren.
6. Nach jeder Vertragsänderung den App-Eintrag neu laden und prüfen, dass genau
   die elf deutschen Produktivwerkzeuge erscheinen; keine Claude-, Regression-
   oder Widget-Testwerkzeuge dürfen sichtbar sein.

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
       and (.token_endpoint_auth_methods_supported | index("none"))
       and (.registration_endpoint | not)
       and (.client_id_metadata_document_supported | not)'

curl -sS -o /dev/null -D - \
  -X POST "$BASE/api/openai/de/mcp" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl-smoke","version":"1"}}}' \
  | sed -n '/^HTTP\|^[Ww][Ww][Ww]-Authenticate/p'
```

Erwartung beim letzten Aufruf: `401` und ein `WWW-Authenticate`-Header mit der
OpenAI-DE-Resource-Metadata-URL sowie `error="invalid_token"` und einer
verständlichen `error_description`. Ein gültiges Token ohne Schreibscope muss
stattdessen `error="insufficient_scope"` erhalten. Token, Cookies,
Authorization Codes, SkillPilot-IDs und vollständige Schülerantworten dürfen
nicht in geteilte Logs oder Tickets kopiert werden.

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

Die Variante ist eine bewusste Entscheidung pro Frontend-Artefakt. Das
Produktionsskript akzeptiert keinen impliziten Default mehr: Für jedes
Deployment muss genau einer der Werte `visible-session`, `openai-mcp` oder
`legacy` ausdrücklich gesetzt werden.

Für den deutschen MCP-Canary beziehungsweise Cutover lautet der vollständige
Aufruf:

```bash
VITE_SKILLPILOT_COACH_VARIANT=openai-mcp scripts/deploy.sh
```

Ein Aufruf ohne Variable bricht **vor** Git-Update, Build und Restart ab. Dadurch
kann ein geplanter MCP-Cutover nicht unbemerkt als Visible-Session-Build
ausgeliefert werden. Umgekehrt wird `openai-mcp` nirgends als Deployment-Default
gesetzt; ein normaler oder Rollback-Build muss seine gewünschte Variante ebenso
explizit nennen.

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

Beim ersten Start erzeugt das Cockpit ein kurzlebiges Browser-Binding, öffnet
ChatGPT und kopiert eine kurze, natürlichsprachliche Startnachricht. Spezielle
Starts werden serverseitig als enges, auditierbares Intent-Schema vorbereitet;
es wird kein freier Instruktionstext aus dem Browser übernommen. Nach
erfolgreicher Verbindung erzeugen spätere Starts keine sichtbare Session-ID.
Die dauerhafte SkillPilot-ID bleibt außerhalb von OAuth-Principal, Chat und
Toolvertrag. Die Startnachricht beschreibt nur den gewünschten Einstieg. Sie
und der Pending Launch werden nicht einer konkreten Chat-Konversation
zugeordnet; neue und parallele Chats rehydrieren den bereits vorbereiteten
Lernstand über den OAuth-Principal aus dem Backend.

Falls der Browser den Clipboard-Zugriff verweigert oder nicht anbietet, bleibt
ChatGPT geöffnet. Das Cockpit zeigt die Startnachricht weiterhin in einem
auswählbaren Textfeld mit eigener Kopieraktion. Clipboard-Zugriff ist damit eine
Komfortfunktion und kein Erfolgskriterium für den Launch.

## 8. Rollback

1. Frontend ausdrücklich mit
   `VITE_SKILLPILOT_COACH_VARIANT=visible-session scripts/deploy.sh` bauen und
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
Für den ersten realen Lauf werden daher noch benötigt:

- die in beiden Systemen identische Client-ID `skillpilot-chatgpt-de-prod` und
  die tatsächliche Callback-URL aus der deutschen App;
- Deployment des Spring-Boot-Artefakts samt Migration und Environment;
- Aktualisierung beziehungsweise Neuerstellung der deutschen App-Version mit
  der kanonischen Server URL;
- dokumentierte End-to-End-Evidenz aus ChatGPT;
- erst danach die bewusste Standardumschaltung im Cockpit.
