# ChatGPT-App „SkillPilot Coach v1“: Deployment und Cutover

**Stand:** 2. August 2026

**Status:** Der mehrsprachige MCP-Coach ist der aktuelle ChatGPT-Entwicklungs- und
Produktkandidat; der interne Arbeitsstand `1.0.0-SNAPSHOT` zielt auf die noch
nicht öffentlich veröffentlichte Paketversion `1.0.0`.
Die Clientbindung wird nach vollständiger Prüfung des ausgewählten
OAuth-Clientprofils und erneutem Workflow-Acceptance-Test allgemein
freigegeben. Der V1-Vertrag verwendet normales HTTPS und OAuth/PKCE auf dem
dedizierten `mcp-coach-v1.skillpilot.com`-Origin. Client-TLS ist nicht
aktiviert.

Dieses Runbook aktiviert den mehrsprachigen, chat-first MCP-Lerncoach mit einer eng
begrenzten read-only MCP-UI für Lernzielvisualisierungen. MCP-Server,
OAuth-Authorization-Server, UI-Ressourcenauslieferung und SkillPilot-Fachlogik
laufen im **bestehenden Spring-Boot-Prozess**. Der Node-MCP-Server unter
`ai/openai app/` bleibt ein lokales Regressionstestbett; dort liegt zugleich die
geprüfte Quellimplementierung der Lernzielkarte, deren selbstenthaltenes
Build-Artefakt in den Spring-Boot-Ressourcenpfad übernommen wird.

Die Architektur- und Migrationsentscheidungen stehen in
[openai-mcp-coach-migration-plan.md](../concept/runtime-workflows/openai-mcp-coach-migration-plan.md).
Der verbindliche Identitäts- und Sitzungsablauf steht getrennt in
[openai-mcp-oauth-learner-session-architecture.md](../concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md).
Paket-, Contract- und Lifecycle-Versionen folgen dem
[Versionierungs- und Lebenszyklusplan](../concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md);
Release, Rollback und Stilllegung folgen dem
[V1-Release-Runbook](openai-plugin-v1-release.md).
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
| Plugin-Identität | `skillpilot-coach-v1` |
| MCP Server URL | `https://mcp-coach-v1.skillpilot.com/mcp` |
| OAuth Resource / Audience | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Widget-Origin | `https://mcp-coach-v1.skillpilot.com` |
| Lernzielbild-Ressource | `ui://skillpilot/coach/v1/sha256-c890cf271307d815256450a2b20b27d57015a84e9f4e39c97532eaefc4e30c26/goal-visualization.html` |
| Protected Resource Metadata | `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| Domain-Challenge | `https://mcp-coach-v1.skillpilot.com/.well-known/openai-apps-challenge` |
| OAuth Issuer | `https://skillpilot.com/api/openai/v1` |
| Authorization-Server-Metadata | `https://skillpilot.com/.well-known/oauth-authorization-server/api/openai/v1` |
| Authorization Endpoint | `https://skillpilot.com/api/openai/v1/oauth2/authorize` |
| Token Endpoint | `https://skillpilot.com/api/openai/v1/oauth2/token` |
| Revocation Endpoint | `https://skillpilot.com/api/openai/v1/oauth2/revoke` |

Die Tabelle nennt die Ressource, die der aktuelle Tool-Descriptor aktiv
referenziert. Bereits in Browser- oder nativen App-Chats gespeicherte
Nachrichten dürfen jedoch weiterhin jede frühere, ebenfalls inhaltsadressierte
Ressource anfordern: `sha256-12f95e37...`, `sha256-5564f42d...`,
`sha256-bed59e4c...`, `sha256-45e1f58d...` und `sha256-157aab83...`. Der
V1-Server hält alle diese URIs über `resources/list` und `resources/read`
bytegenau verfügbar; nur die Ressource mit `sha256-c890...` ist das aktive
Template für neue Tool-Ergebnisse.

Ein `resources/read` wird als eigenes Telemetrieereignis protokolliert
(`uiArtifact`, `artifactRole=active|retained`, Status, Latenz). Damit ist
serverseitig unterscheidbar, ob ein Client die Komponente überhaupt abgeholt
hat und ob er dabei den aktiven oder einen historischen `template_pointer`
verwendet.

Der additive V1-vHost reicht ausschließlich den öffentlichen Pfad `/mcp` an
den loopback-gebundenen Spring-Transport `/internal/openai/v1/mcp` weiter.
Es gibt keinen öffentlichen Kompatibilitätsalias. Der produktive App-Eintrag
verwendet ausschließlich diese V1-**Server URL**, nicht den Entwicklungstunnel
und nicht einen Pfad auf `skillpilot.com`.

## 2. Discovery-Bootstrap und OAuth-Werte

Der Produktivvertrag verwendet Authorization Code mit PKCE `S256` und genau
einen vorregistrierten **vertraulichen OAuth-Client** für die Linie
`SkillPilot Coach v1`. Dessen feste Client-ID, langes zufälliges
Client-Secret, exakte Callback-Allowlist, feste MCP-Resource und feste Scopes
werden vom App-Autor auf beiden Seiten konfiguriert. ChatGPT authentisiert sich
am Token-Endpunkt mit `client_secret_basic`; SkillPilot akzeptiert weder
`none` noch offene Dynamic Client Registration, CIMD oder
`private_key_jwt` im aktiven Produktivprofil.

Das Secret ist ausschließlich geschützte Konfiguration in ChatGPT und
SkillPilot. Es gehört weder in Repository, Browser, Startnachricht,
Toolargumente noch Logs. PKCE bindet zusätzlich den Authorization Code an den
von ChatGPT erzeugten Verifier. Normales serverauthentisiertes HTTPS bleibt
Pflicht. Eine Clientzertifikat-Infrastruktur ist nicht Teil des V1-Vertrags.

Die ChatGPT-Verwaltung prüft die MCP-URL, bevor sie ihre erweiterten OAuth-
Einstellungen zeigt. Gleichzeitig benötigt der vollständige SkillPilot-
Authorization-Server die app-spezifische Callback-URL. Dafür existiert ein
expliziter, datenloser Bootstrapmodus:

1. Vollbetrieb deaktiviert lassen und ausschließlich
   `SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED=true` setzen.
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
OpenAI-V1-OAuth absichtlich ab. Bootstrap und Vollbetrieb dürfen ebenfalls
nicht gleichzeitig aktiviert sein; diese Fehlkonfiguration bricht den Start ab.

## 3. Runtime-Konfiguration

Für den sicheren Cutover können Code und additive Liquibase-Migration zunächst
in einem getrennten read-only Canary geprüft werden. Der produktive
Vollbetrieb benötigt dagegen aktivierte Schreiboperationen und
verwendet normales serverauthentisiertes HTTPS am dedizierten V1-vHost und
verpflichtendes OAuth/PKCE mit exakter Resource-/Audience- und Scope-Prüfung.
Der separate Host isoliert Domainverifikation und Plugin-Lifecycle; er aktiviert
kein mTLS. Der bestehende `skillpilot.com`-vHost wird nicht grundsätzlich
umgebaut; er erhält nur die unten beschriebene enge `404`-Sperre gegen
MCP-/Internpfad-Aliasse.

Die reproduzierbare additive vHost-Konfiguration liegt unter
`deploy/nginx/skillpilot-mcp-coaches.conf`. Sie MUSS innerhalb des vorhandenen
Nginx-`http {}`-Blocks eingebunden werden. Eine Einbindung auf globaler Ebene
vor `http {}` führt zu `server directive is not allowed here` und ist
unzulässig. Die zugehörige Certbot-Lineage
`skillpilot-mcp-coaches` umfasst nach der Umstellung exakt die bereits
angelegten Major-Hosts V1 bis V9:

```text
mcp-coach-v1.skillpilot.com
mcp-coach-v2.skillpilot.com
mcp-coach-v3.skillpilot.com
mcp-coach-v4.skillpilot.com
mcp-coach-v5.skillpilot.com
mcp-coach-v6.skillpilot.com
mcp-coach-v7.skillpilot.com
mcp-coach-v8.skillpilot.com
mcp-coach-v9.skillpilot.com
```

Die zuvor lokal vorbereiteten Namen `mcp-coach-de-v*` und
`mcp-coach-en-v*` gehörten zu keiner Veröffentlichung. Sie werden weder in
Nginx weitergeleitet noch als Kompatibilitätsroute erhalten. Verbliebene DNS-
Einträge oder alte Zertifikat-SANs dürfen nach dem V1-Cutover entfernt werden.

Nur V1 wird an Spring weitergeleitet. Die übrigen acht HTTPS-vHosts sind
reserviert und liefern für jeden Pfad `404`; ihre DNS- und TLS-Bereitschaft ist
keine Veröffentlichung. Änderungen werden immer zuerst mit `nginx -t` geprüft
und erst danach per Reload aktiviert. Bestehende vHosts werden weder ersetzt
noch grundsätzlich umgebaut.

Zusätzlich wird
`deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf` ausschließlich
**innerhalb** des bestehenden HTTPS-`server {}`-Blocks für `skillpilot.com`
und dort vor dessen allgemeinem `location /` eingebunden. Dieses enge
Location-Snippet sperrt den verworfenen öffentlichen Pfad, den internen
Spring-Transport und das interne Protected-Resource-Metadata-Ziel am
Haupt-Origin mit `404`. Es darf weder auf globaler Ebene
noch im `http {}`-Block eingebunden werden. So bleibt der bestehende Haupt-vHost
ansonsten unverändert, und nur der dedizierte V1-vHost veröffentlicht den
MCP-Vertrag.

Vor einer Installation werden die bestehende Nginx-Hauptdatei und bereits
vorhandene Ziel-Snippets unter eindeutigen Namen gesichert. Eine vorhandene,
funktionierende MCP-vHost-Datei wird zuerst gegen die Repository-Vorlage
verglichen und nicht blind überschrieben:

Zuvor muss der Produktions-Checkout nachweislich bereits den sprachneutralen
Cutover enthalten. Diese Prüfung ist verpflichtend: Ein altes Skript würde
weiter den DE-Host testen; ein alter vHost kann unbekannte neue Hostnamen als
Default-vHost irrtümlich an V1 weiterleiten. Alle fünf Befehle müssen erfolgreich
sein und der letzte darf keine Ausgabe erzeugen:

```bash
grep -F 'server_name mcp-coach-v1.skillpilot.com;' \
  deploy/nginx/skillpilot-mcp-coaches.conf
grep -F 'mcp-coach-v9.skillpilot.com' \
  deploy/nginx/skillpilot-mcp-coaches.conf
grep -F 'proxy_pass http://127.0.0.1:8787/internal/openai/v1/mcp;' \
  deploy/nginx/skillpilot-mcp-coaches.conf
grep -F 'MCP_ORIGIN="https://mcp-coach-v1.skillpilot.com"' \
  scripts/verify_openai_v1_public_edge.sh
! grep -E 'mcp-coach-(de|en)-v[1-9]' \
  deploy/nginx/skillpilot-mcp-coaches.conf
```

Schlägt eine Prüfung fehl, wird nichts nach `/etc/nginx` installiert. Zuerst
muss der freigegebene Commit gepullt werden. Ein erfolgreicher Lauf eines
veralteten Smoke-Skripts ist kein Ersatz für diesen Inhaltscheck.

```bash
sudo cp -a -n /etc/nginx/nginx.conf \
  /etc/nginx/nginx.conf.before-mcp-subdomain-includes

if sudo test -e /etc/nginx/skillpilot-mcp-coaches.conf; then
  sudo cp -a -n /etc/nginx/skillpilot-mcp-coaches.conf \
    /etc/nginx/skillpilot-mcp-coaches.conf.before-repository-sync
  sudo diff -u /etc/nginx/skillpilot-mcp-coaches.conf \
    deploy/nginx/skillpilot-mcp-coaches.conf || true
fi

if sudo test -e /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf; then
  sudo cp -a -n \
    /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf \
    /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf.before-repository-sync
  sudo diff -u \
    /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf \
    deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf || true
fi
```

Erst nach Prüfung des Diffs werden aus dem Repository-Root die beiden Dateien
getrennt installiert:

```bash
sudo install -o root -g root -m 0644 \
  deploy/nginx/skillpilot-mcp-coaches.conf \
  /etc/nginx/skillpilot-mcp-coaches.conf
sudo install -o root -g root -m 0644 \
  deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf \
  /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf
```

Die zwei Includes haben absichtlich verschiedene Kontexte:

```nginx
http {
    # bestehende globale Einstellungen bleiben unverändert
    include /etc/nginx/skillpilot-mcp-coaches.conf;

    server {
        server_name skillpilot.com skillpilot.org skillpilot.mobi;

        # vor dem bestehenden allgemeinen `location /`
        include /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf;

        location / {
            # bestehende SkillPilot-Proxykonfiguration
        }
    }
}
```

Der Ausschnitt ist eine Platzierungshilfe und kein Ersatz für den bestehenden
Haupt-vHost. Das zweite Include wird gezielt in genau diesen vorhandenen
`server {}`-Block aufgenommen; weitere Einträge bleiben unverändert. Danach
wird immer zuerst die vollständige Konfiguration geprüft. Nur ein erfolgreicher
Test erlaubt den Reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl is-active nginx
```

Vor dem öffentlichen V1-Smoke muss die bestehende Let's-Encrypt-Lineage auf
die neun sprachneutralen Major-Hosts umgestellt werden. Zuerst müssen alle
vorhandenen DNS-A-/AAAA-Einträge auf denselben Server zeigen; ein fehlender
AAAA-Eintrag ist zulässig, ein veralteter AAAA-Eintrag dagegen nicht. Nach den
Backups und der
sichtbaren Diff-Prüfung wird der additive Repository-vHost installiert und mit
`nginx -t` sowie Reload aktiviert, damit der Port-80-vHost alle HTTP-Challenges
bedienen kann. Der bestehende Haupt-vHost wird dabei nicht ersetzt. Erst danach
folgen Dry-Run und tatsächliche Erneuerung derselben Lineage:

```bash
sudo certbot certonly --nginx --dry-run \
  --preferred-challenges http \
  --key-type ecdsa \
  --cert-name skillpilot-mcp-coaches \
  -d mcp-coach-v1.skillpilot.com \
  -d mcp-coach-v2.skillpilot.com \
  -d mcp-coach-v3.skillpilot.com \
  -d mcp-coach-v4.skillpilot.com \
  -d mcp-coach-v5.skillpilot.com \
  -d mcp-coach-v6.skillpilot.com \
  -d mcp-coach-v7.skillpilot.com \
  -d mcp-coach-v8.skillpilot.com \
  -d mcp-coach-v9.skillpilot.com

sudo certbot certonly --nginx \
  --preferred-challenges http \
  --key-type ecdsa \
  --cert-name skillpilot-mcp-coaches \
  --force-renewal \
  -d mcp-coach-v1.skillpilot.com \
  -d mcp-coach-v2.skillpilot.com \
  -d mcp-coach-v3.skillpilot.com \
  -d mcp-coach-v4.skillpilot.com \
  -d mcp-coach-v5.skillpilot.com \
  -d mcp-coach-v6.skillpilot.com \
  -d mcp-coach-v7.skillpilot.com \
  -d mcp-coach-v8.skillpilot.com \
  -d mcp-coach-v9.skillpilot.com

sudo certbot certificates
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl is-active nginx
```

Der zweite Aufruf ersetzt den Domain-Satz derselben Lineage; er erzeugt keine
parallele Sprachlinie. Vor einer Bestätigung muss die von Certbot angezeigte
Domainliste exakt auf V1 bis V9 geprüft werden. Danach muss V1 seinen
geschützten Vertrag liefern und V2 bis V9 müssen über gültiges TLS für jeden
Pfad `404` liefern; `./scripts/verify_openai_v1_public_edge.sh` prüft beides.
`--force-renewal` ist hier bewusst gesetzt, weil der erfolgreich geprüfte neue
SAN-Satz sofort in dieselbe Lineage geschrieben werden soll. `--expand` ist
ungeeignet: Es würde die alten, nicht veröffentlichten DE-/EN-SANs beibehalten,
statt den Domain-Satz exakt zu ersetzen.

```text
SERVER_ADDRESS=127.0.0.1

SKILLPILOT_PUBLIC_BASE_URL=https://skillpilot.com
# Unabhängig vom OAuth-Client-Secret erzeugen, z. B.: openssl rand -hex 32
SKILLPILOT_SIGNING_SECRET=<mindestens-32-hochentropische-zeichen>

SKILLPILOT_OPENAI_COACH_V1_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED=false
SKILLPILOT_OPENAI_COACH_V1_OAUTH_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_MCP_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=true

SKILLPILOT_OPENAI_CHATGPT_URL=https://chatgpt.com/

SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD=client_secret_basic
SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ID=<exakte-feste-client-id-dieser-app>
SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET=<langes-zufälliges-client-secret>
SKILLPILOT_OPENAI_COACH_V1_OAUTH_REDIRECT_URIS=<exakte-callback-url-oder-kommaliste>

# Nur bei einem tatsächlichen Client-ID-Wechsel, einmalig und danach entfernen:
# SKILLPILOT_OPENAI_COACH_V1_OAUTH_LEGACY_CLIENT_IDS=<exakte-alte-client-id-oder-kommaliste>

SKILLPILOT_OPENAI_SECURE_COOKIE=true
SKILLPILOT_OPENAI_LEARNING_SESSION_TTL=PT24H
SKILLPILOT_OPENAI_CLEANUP_INTERVAL_MS=3600000
SKILLPILOT_OPENAI_OAUTH_ACCESS_TOKEN_TTL=PT1H
SKILLPILOT_OPENAI_OAUTH_REFRESH_TOKEN_TTL=P30D

SKILLPILOT_OPENAI_RATE_LIMIT_ENABLED=true
SKILLPILOT_OPENAI_RATE_LIMIT_WINDOW=PT1M
SKILLPILOT_OPENAI_RATE_LIMIT_MCP_REQUESTS=120
SKILLPILOT_OPENAI_RATE_LIMIT_OAUTH_REQUESTS=60
SKILLPILOT_OPENAI_RATE_LIMIT_UI_REQUESTS=60
SKILLPILOT_OPENAI_RATE_LIMIT_METADATA_REQUESTS=120
SKILLPILOT_OPENAI_RATE_LIMIT_MAX_CLIENT_BUCKETS=10000
```

Die drei öffentlichen V1-URLs werden nicht als Umgebungsvariablen
konfiguriert. Sie sind unveränderliche Bestandteile des V1-Vertrags:

- MCP und OAuth-Resource: `https://mcp-coach-v1.skillpilot.com/mcp`
- Protected-Resource-Metadaten:
  `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp`

Auch ein `SKILLPILOT_OPENAI_COACH_V1_UI_ORIGIN` ist unzulässig: Der Widget-Origin ist
als `https://mcp-coach-v1.skillpilot.com` fest im V1-Vertrag verankert und
wird identisch über `_meta.ui.domain` und `_meta["openai/widgetDomain"]`
ausgeliefert. Alte URL-Variablen und gleichnamige neue Override-Versuche führen
fail-closed zum Abbruch. Damit kann eine alte oder falsch geschriebene Route den
versionierten V1-Vertrag nicht unbemerkt ersetzen.

Vor dem ersten Subdomain-Deployment werden insbesondere alte Einträge für
`SKILLPILOT_OPENAI_DE_UI_ORIGIN`, `SKILLPILOT_OPENAI_DE_V1_ORIGIN`,
`SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED`,
`SKILLPILOT_OPENAI_DE_MTLS_EDGE_TRUSTED_PROXIES` und mTLS-Smoke-Zertifikate aus
der EnvironmentFile entfernt. Sie gehören nicht zum `1.0.0`-Vertrag. Ebenso
müssen `SKILLPILOT_OPENAI_DE_MCP_URL`,
`SKILLPILOT_OPENAI_DE_OAUTH_RESOURCE` und
`SKILLPILOT_OPENAI_DE_RESOURCE_METADATA` vollständig entfernt werden.

`./deploy_skillpilot.sh` prüft vor Asset-Kopien, Build und Service-Restart die
tatsächlich von der systemd-Unit referenzierte EnvironmentFile. Der
Produktionsvertrag erlaubt genau eine solche Datei, standardmäßig
`/etc/skillpilot/skillpilot.env`; für einen abweichenden Pfad muss
`SKILLPILOT_SERVICE_ENV_FILE` ausdrücklich gesetzt werden. Aus der Datei werden
ausschließlich Namen entfernter OpenAI-V1-Variablen erkannt; ihre Werte und
alle OAuth-, Datenbank- oder anderen Secrets werden weder protokolliert noch
ausgegeben. Dieselben alten Namen dürfen auch nicht über `Environment=`,
`PassEnvironment=` oder die globale systemd-Umgebung eingeschleust werden.
Ist die eine EnvironmentFile in systemd optional (`ignore_errors=yes`) und
fehlt, akzeptiert der Preflight nach Prüfung der übrigen Umgebungskanäle die
kanonischen V1-Defaults. Eine fehlende verpflichtende Datei
(`ignore_errors=no`) bleibt ein Fehler.
Eine EnvironmentFile mit OAuth- oder Datenbank-Secrets bleibt `root:root` und
`0600`. Ihre Rechte dürfen für den Deployment-Preflight nicht gelockert werden.
Kann der Deploy-Benutzer die root-geschützte Datei oder einen Elternordner nicht
lesen beziehungsweise durchlaufen, meldet der Preflight diesen Inhaltscheck
sichtbar als `SKIP`; die exakte Spring-Startprüfung bleibt die finale
fail-closed-Grenze. Eine allgemeine `sudo cat`-Freigabe oder weltlesbare
Secret-Datei ist ausdrücklich nicht zulässig.

Die Migration ist absichtlich fail-closed: alte `SKILLPILOT_OPENAI_DE_*`-
und `SKILLPILOT_OPENAI_COACH_DE_V1_*`-Namen werden nicht als stille
V1-Aliasse übernommen. Alle V1-spezifischen
Werte tragen `SKILLPILOT_OPENAI_COACH_V1_*`; gemeinsame Richtlinien des
einzigen Spring-Prozesses tragen `SKILLPILOT_OPENAI_*` ohne Sprach- oder
Versionssegment. Alte Namen werden entfernt, nicht leer gesetzt.

Die neun Nginx-Origins sind keine neun Spring-Prozesse und werden nicht über
eine gemeinsame URL-Umgebungsvariable umgeschaltet. Jeder öffentliche Host
wird in Nginx fest auf den internen Pfad seiner Vertragslinie abgebildet. Nur
V1 ist derzeit implementiert; die übrigen reservierten Hosts antworten
absichtlich mit `404`. Für spätere Linien gilt bereits jetzt diese eindeutige
Namenskonvention:

| öffentlicher Host | Spring-Konfigurationsgruppe | linienbezogene Environment-Namen | aktueller Status |
| --- | --- | --- | --- |
| `mcp-coach-v1.skillpilot.com` | `skillpilot.openai.coach.v1` | `SKILLPILOT_OPENAI_COACH_V1_*` | aktiv, intern `/internal/openai/v1/*` |
| `mcp-coach-v2.skillpilot.com` | `skillpilot.openai.coach.v2` | `SKILLPILOT_OPENAI_COACH_V2_*` | reserviert, `404` |
| `mcp-coach-v3.skillpilot.com` | `skillpilot.openai.coach.v3` | `SKILLPILOT_OPENAI_COACH_V3_*` | reserviert, `404` |
| `mcp-coach-v4.skillpilot.com` | `skillpilot.openai.coach.v4` | `SKILLPILOT_OPENAI_COACH_V4_*` | reserviert, `404` |
| `mcp-coach-v5.skillpilot.com` | `skillpilot.openai.coach.v5` | `SKILLPILOT_OPENAI_COACH_V5_*` | reserviert, `404` |
| `mcp-coach-v6.skillpilot.com` | `skillpilot.openai.coach.v6` | `SKILLPILOT_OPENAI_COACH_V6_*` | reserviert, `404` |
| `mcp-coach-v7.skillpilot.com` | `skillpilot.openai.coach.v7` | `SKILLPILOT_OPENAI_COACH_V7_*` | reserviert, `404` |
| `mcp-coach-v8.skillpilot.com` | `skillpilot.openai.coach.v8` | `SKILLPILOT_OPENAI_COACH_V8_*` | reserviert, `404` |
| `mcp-coach-v9.skillpilot.com` | `skillpilot.openai.coach.v9` | `SKILLPILOT_OPENAI_COACH_V9_*` | reserviert, `404` |

Die reservierten Namen sind eine Konvention, noch keine akzeptierte
Laufzeitkonfiguration. Der aktuelle Server bricht beim Setzen einer noch nicht
implementierten Linie oder eines unbekannten linienbezogenen Namens ab, statt
den Eintrag still zu ignorieren. Eine Linie wird erst mit eigenem Vertrag,
interner Route, Spring-Konfigurationsgruppe und Tests aktiviert. Gemeinsame
Prozesswerte wie Cookie-Härtung, Session-TTLs und Rate Limits bleiben einmalig
unter `SKILLPILOT_OPENAI_*`.

Auch `SKILLPILOT_SERVER_BUILD` wird nicht in
`/etc/skillpilot/skillpilot.env` gepflegt. Gradle baut genau ein Artefakt
`skillpilot-server` und bettet den vollständigen
lowercase Commit von `HEAD` beim Verarbeiten der Backend-Ressourcen in
`skillpilot.openai.coach.v1.server-build` und
`skillpilot.openai.coach.v1.mcp.server-version` ein. `scripts/deploy.sh` prüft beide
Werte gegen den tatsächlich ausgecheckten Commit, bevor der Dienst neu
gestartet wird. Die Telemetrie und Health-Ausgabe beschreiben dadurch das
ausgelieferte Artefakt und keinen manuell nachgetragenen Umgebungswert.

`SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=true` ist für den funktionsfähigen
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
beziehungsweise den Tokenaustausch fail-closed ab.

Auch `SKILLPILOT_SIGNING_SECRET` ist für den aktivierten OpenAI-V1-Provider
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

Das historische physische Tabellenpräfix `openai_de_` bleibt bei dieser
additiven Umstellung bewusst als interner Migrationsanker bestehen. Es ist kein
Sprach- oder Vertragsmerkmal mehr; die verbindliche Kommunikationssprache
steht pro Sitzung in `communication_locale`. Ein Umbenennen bestehender
Tabellen und interner Java-Typen wäre eine eigenständige, risikoreichere
Datenbankmigration ohne Nutzen für den öffentlichen V1-Vertrag und gehört
nicht in diesen Cutover.

Der Start-Intent ist ein kurzlebiger Auftrag an das Fachbackend. Bei **jedem**
Klick auf **Lernen starten** wendet SkillPilot den eng typisierten Intent unter
Learner-Lock auf den autoritativen Zustand an und erzeugt unmittelbar danach
eine neue kryptografisch zufällige `learningSessionId`. Auch zwei Starts
desselben Lernenden erzeugen verschiedene IDs. Die absolute Frist wird durch
`SKILLPILOT_OPENAI_LEARNING_SESSION_TTL` gesteuert und beträgt produktiv
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
`POST /api/ui/learners/{skillpilotId}/openai/v1/launch`. Ein erfolgreicher
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
Bereinigung steuert `SKILLPILOT_OPENAI_CLEANUP_INTERVAL_MS`; der
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

Bei `SKILLPILOT_OPENAI_COACH_V1_ENABLED=true` registriert Spring den Health-Contributor
`openAiDeCoach`. Er fließt in die Actuator-Gruppe `readiness` ein. Der Beitrag
ist nur `UP`, wenn MCP und OAuth aktiviert sind, die erforderlichen Client- und
Callback-Werte gesetzt sind, die öffentlichen MCP-/Metadata-Ziele gültiges
HTTPS verwenden und der erwartete Vertrag mit genau zwölf Werkzeugen geladen ist.
Die Readiness-Gruppe enthält zusätzlich den Datenbank-Health-Check `db`; ein
nicht erreichbarer Persistenzdienst darf daher nicht als einsatzbereiter Coach
gemeldet werden.
`SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=false` ist ein erlaubter read-only
Canary-Zustand und setzt die gemeinsame Readiness nicht auf `DOWN`. Ob der
vollständige Coach produktiv funktionsfähig ist, muss deshalb zusätzlich über
die Betriebsumgebung beziehungsweise einen separaten Deployment-Preflight
geprüft werden.

Die Health-Details enthalten ausschließlich nicht geheime Statuswerte, darunter
`serverBuild`, `serverBuildConfigured`, `mcpEnabled`, `oauthEnabled`,
`writesEnabled`, `secureMode`,
`clientAuthenticationMethod`, `publicClientConfigured`,
`privateKeyJwtConfigured`, `clientIdConfigured`, `redirectUrisConfigured`,
`contractToolCount`, `contractHash`, `rateLimitEnabled` und
`rateLimitConfigured`. Der
`serverBuild` ist der im Backend-Artefakt eingebettete Git-Commit;
`contractHash` ist ein deterministischer SHA-256-Hash über Serverinstruktionen
und öffentliche Tooldeskriptoren. Client-ID, Callback-URLs, MCP-URL, Tokens,
SkillPilot-IDs und Lerninhalte werden nicht ausgegeben. Health-Details dürfen
nur über den internen, geschützten Managementzugang freigegeben werden.

Die exakten Micrometer-Namen heißen:

```text
skillpilot.openai.coach.v1.mcp.tool.duration
skillpilot.openai.coach.v1.operational.event
```

Der Timer besitzt aus dem Anwendungscode ausschließlich die begrenzten Tags `tool`
(zwölf bekannte Toolnamen oder `unknown`) und `status` (`success`, `error` oder
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

1. Name: `SkillPilot Coach v1`.
2. Sprachneutrale Beschreibung, zum Beispiel:

   ```text
   Personal learning coach for your saved SkillPilot learning state. Guides you through learning goals, tasks, and review while keeping your progress up to date.
   ```

3. Verbindung: `Server URL`.
4. MCP-URL: `https://mcp-coach-v1.skillpilot.com/mcp`.
5. OAuth mit der festen Client-ID, dem dazugehörigen Client-Secret und der
   exakten Callback-URL konfigurieren. Als Authentisierungsmethode am
   Token-Endpunkt `client_secret_basic` wählen. DCR, CIMD, `none` und
   `private_key_jwt` gehören nicht in diese produktive App-Konfiguration.
6. Nach jeder Änderung an Werkzeugliste, Werkzeugbeschreibungen oder
   Serverinstruktionen zuerst das Backend deployen. Danach unter
   `Einstellungen → Plugins` die Developer-Mode-App öffnen und `Refresh`
   ausführen. Prüfen, dass genau die zwölf sprachneutralen Produktivwerkzeuge
   erscheinen; keine Claude-, Regression- oder lokalen Widget-Testwerkzeuge
   dürfen sichtbar sein. Zusätzlich müssen die aktive versionierte
   Lernzielbild-Ressource und alle bereits ausgelieferten, unveränderlichen
   Vorgänger über `resources/list` und `resources/read` verfügbar sein.

Die sichtbare Beschreibung erklärt ausschließlich den Produktnutzen. ChatGPT
verwendet sie zwar als Signal für die App-Discovery, SkillPilot darf seine
fachliche Korrektheit oder seinen Arbeitsablauf aber nicht von ihrem Wortlaut
abhängig machen. Positive und negative Auswahlgrenzen gehören in die
Werkzeugbeschreibung, werkzeugübergreifende Abläufe in die
MCP-Serverinstruktionen und verbindliche Autorisierung sowie Zustandsübergänge
ins Backend.

Der stabile technische Name des Bootstrap-Werkzeugs bleibt
`get_skillpilot_context`. Sein englischer Titel muss
`Start or continue the SkillPilot learning coach` lauten. Seine Beschreibung nennt
positive Routingfälle (SkillPilot auswählen oder nennen; lernen, üben, starten,
fortsetzen, wiederaufnehmen und Lernstand verwenden) und die negative Grenze
(keine allgemeine Fachfrage ohne SkillPilot-Bezug). Kein zweites,
semantisch gleiches Alias-Werkzeug veröffentlichen.

Der unveröffentlichte Arbeitsstand `1.0.0-SNAPSHOT` registriert genau eine
read-only Widget-Ressource für das Bild des aktiven atomaren Lernziels. Nur
`render_skillpilot_goal_visualization` referenziert sie über
`ui.resourceUri` sowie den ChatGPT-Kompatibilitätsalias
`openai/outputTemplate`. Die übrigen Werkzeuge besitzen keine UI-Bindung;
Auswahl und Coaching bleiben im normalen Chat. Der Kontext projiziert
`goalVisualization` und erlaubt das Anzeige-Werkzeug nur bei einem aktiven
atomaren Ziel mit passendem kanonischem Bildlink und aktivierter
Cockpit-Einstellung. Die sichere Projektion darf interne Zielmetadaten tragen;
sichtbar rendert das Widget jedoch ausschließlich das Bild mit dem am
`img`-Element hinterlegten Alttext. Titel, Lernzielbeschreibung und Cockpit-Link
erscheinen nicht in der UI. Fehlt ein gültiges Bild, entsteht keine UI-Karte und
der normale Chatablauf funktioniert unverändert. Ein gültiges Bild wird auf
jeder Oberfläche sofort unsichtbar geladen und erst nach erfolgreichem `load`
gezeigt. Das Widget verwendet Plattform- und User-Agent-Werte nicht, um Mobile-
Browser, native Apps oder andere Hosts von der Anzeige auszuschließen. Bei
einem konkreten Bildfehler oder nach dem begrenzten Lade-Timeout bleibt die UI
verborgen und fordert ihren Teardown an; die normale Chat-Antwort bleibt der
vollständige Fallback. Der Host entscheidet über den Teardown. Initialisiert
eine Oberfläche die MCP-UI gar nicht, können Backend und Widget einen vom Host
erzeugten leeren Platzhalter nicht serverseitig unterdrücken.

Die `learningSessionId` erscheint ausschließlich in der automatisch
vorbereiteten Startnachricht und wird danach als Toolparameter weitergereicht;
sie ist keine dauerhafte SkillPilot-ID und kein OAuth-Token. Die Bildkarte ist
reine Orientierung, keine Evidenz, Aufgabe, Lösung, Bewertung oder
Mastery-Aktion.

## 5. Technischer Smoke-Test

### 5.1 Datenloser Discovery-Bootstrap

Für diesen einmaligen Zustand gilt:

```text
SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_ENABLED=false
SKILLPILOT_OPENAI_COACH_V1_OAUTH_ENABLED=false
SKILLPILOT_OPENAI_COACH_V1_MCP_ENABLED=false
SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=false
```

Dann:

```bash
MCP_URL=https://mcp-coach-v1.skillpilot.com/mcp
RESOURCE_METADATA=https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp
AUTH_BASE=https://skillpilot.com

curl -fsS "$RESOURCE_METADATA" \
  | jq -e --arg resource "$MCP_URL" \
      --arg issuer "$AUTH_BASE/api/openai/v1" \
      '.resource == $resource
       and (.authorization_servers | index($issuer))'

curl -fsS "$AUTH_BASE/.well-known/oauth-authorization-server/api/openai/v1" \
  | jq -e --arg issuer "$AUTH_BASE/api/openai/v1" \
      '.issuer == $issuer
       and (.code_challenge_methods_supported | index("S256"))
       and (.token_endpoint_auth_methods_supported | index("client_secret_basic"))'

curl -sS -o /dev/null -D - \
  -X POST "$MCP_URL" \
  -H 'Content-Type: application/json' \
  --data '{}' \
  | sed -n '/^HTTP\|^[Ww][Ww][Ww]-Authenticate/p'

for path in oauth2/authorize oauth2/token oauth2/revoke oauth2/introspect; do
  test "$(curl -sS -o /dev/null -w '%{http_code}' \
    "$AUTH_BASE/api/openai/v1/$path")" = 404
done
```

Erwartung: beide Metadatenabrufe sind gültig, MCP antwortet `401` mit
`WWW-Authenticate`, und sämtliche OAuth-Protokollendpunkte bleiben `404`.
Der intern aus Kompatibilitätsgründen noch `openAiDeCoach` benannte
Health-Contributor existiert in diesem Zustand absichtlich nicht; die allgemeine
Readiness des übrigen SkillPilot-Dienstes muss weiterhin `UP` sein.

### 5.2 Vollbetrieb, zunächst read-only

```bash
MCP_URL=https://mcp-coach-v1.skillpilot.com/mcp
RESOURCE_METADATA=https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp
AUTH_BASE=https://skillpilot.com
MANAGEMENT_BASE=http://127.0.0.1:8787
AUTH_METHOD="${SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD:-client_secret_basic}"

curl -fsS "$MANAGEMENT_BASE/actuator/health/readiness" \
  | jq -e '.status == "UP"'

curl -fsS "$MANAGEMENT_BASE/actuator/health/openAiDeCoach" \
  | jq -e '.status == "UP"'

curl -fsS "$RESOURCE_METADATA" \
  | jq -e --arg resource "$MCP_URL" \
      --arg issuer "$AUTH_BASE/api/openai/v1" \
      '.resource == $resource
       and (.authorization_servers | index($issuer))
       and (.scopes_supported | index("skillpilot.openai.v1.read"))
       and (.scopes_supported | index("skillpilot.openai.v1.write"))'

curl -fsS "$AUTH_BASE/.well-known/oauth-authorization-server/api/openai/v1" \
  | jq -e --arg issuer "$AUTH_BASE/api/openai/v1" --arg auth "$AUTH_METHOD" \
      '.issuer == $issuer
       and (.code_challenge_methods_supported | index("S256"))
       and (.token_endpoint_auth_methods_supported == [$auth])
       and (.registration_endpoint | not)'

curl -sS -o /dev/null -D - \
  -X POST "$MCP_URL" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl-smoke","version":"1"}}}' \
  | sed -n '/^HTTP\|^[Ww][Ww][Ww]-Authenticate/p'
test "$AUTH_METHOD" = client_secret_basic
```

Erwartung beim letzten Aufruf: `401` mit
einem `WWW-Authenticate`-Header, der auf die
OpenAI-V1-Resource-Metadata-URL verweist. Ein gültiges Token ohne
Schreibscope muss stattdessen `error="insufficient_scope"` erhalten.

Token, Cookies, Authorization Codes, SkillPilot-IDs und vollständige
Schülerantworten dürfen nicht in geteilte Logs oder Tickets kopiert werden.

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
- `get_skillpilot_context` und alle Navigationsabfragen mit gültigem OAuth
  und der jeweils richtigen Session-ID prüfen.
- Bei einem aktiven atomaren Ziel mit passendem kanonischem
  `goal-visualization`-Link muss das dedizierte Anzeige-Werkzeug die Inline-Karte
  auf einem unterstützten Web-Host anzeigen. Sichtbar ist ausschließlich das
  Bild; der Alttext bleibt am `img`-Element, während Titel,
  Lernzielbeschreibung und Cockpit-Link nicht gerendert werden. Ein Clusterziel
  sowie ein atomisches Ziel ohne gültigen oder passenden Bildlink dürfen keine
  leere oder defekte Karte erzeugen; der Chat bleibt normal lesbar.
- Beim Öffnen desselben Chats im mobilen Browser und in der nativen Mobile-App
  muss die normale Chat-Antwort vollständig nutzbar bleiben. Auf beiden
  Oberflächen wird das Bild versucht und nur nach erfolgreichem `load` sichtbar.
  Ein Bildfehler oder Lade-Timeout muss die UI ausblenden und den Teardown
  anfordern. Ein bereits vom Host angelegter Platzhalter ist bei ausbleibender
  UI-Initialisierung eine externe Host-Darstellung und kann nicht serverseitig
  garantiert entfernt werden.
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
| `Verwende die App SkillPilot Coach v1 und fahre mit dem in SkillPilot vorbereiteten nächsten Schritt fort.` | `get_skillpilot_context` läuft vor der ersten fachlichen Antwort. Die Antwort nennt zuerst den bestätigten Einstiegskontext und fragt danach die authored noch offenen Angaben gemeinsam ab. |
| `Ich möchte Mathe Oberstufe Hessen lernen.` bei ausgewählter App | `get_skillpilot_context` läuft; eindeutige Teile werden als bestätigter Kontext genannt und nicht erneut erfragt. Alle aktuell bestimmbaren offenen Angaben werden in einer gemeinsamen Frage angeboten. |
| Mehrere offene Angaben in einer Nachricht und in umgekehrter Reihenfolge beantworten | Der Coach übernimmt die Mehrfachabsicht unabhängig von der Antwortreihenfolge. Er wendet intern jeweils nur die aktuelle Option an, lädt danach den Plan frisch und löst erst dann die nächste Angabe auf. |
| Eine Antwort auf eine spätere, nur orientierend angezeigte Frage geben | Keine vorweggenommene oder gespeicherte Option-ID wird geschrieben. Der Coach arbeitet zuerst die aktuelle authored Entscheidung ab und prüft die Angabe anschließend gegen die frisch projizierten Optionen; nur verbleibende Mehrdeutigkeit führt zu einer Rückfrage. |
| `Lass uns dort weitermachen, wo ich aufgehört habe.` bei ausgewählter App | `get_skillpilot_context` lädt den gespeicherten Zustand; kein neuer Lernpfad wird erfunden. |
| `Erkläre mir allgemein die Mitternachtsformel.` ohne ausgewählte App und ohne SkillPilot-Bezug | SkillPilot wird nicht aufgerufen. |
| `Use SkillPilot Coach v1 and resume my current lesson.` | Das Bootstrap-Tool lädt die Session; die Antwort verwendet ausschließlich die darin festgelegte Interaktionssprache. |

Die Anwendung schreibt pro Toolaufruf ausschließlich eine begrenzte
Diagnosezeile mit Toolname, Status und Dauer, beispielsweise:

```text
OpenAI V1 MCP tool invocation: tool=get_skillpilot_context status=success durationMs=42
```

Lerninhalte, Antworten, Toolargumente, Tokens und Lernendenkennungen dürfen
darin nicht erscheinen. Für den Live-Test kann die Zeile mit
`journalctl -u skillpilot` geprüft werden.

### Stufe B – funktionsfähiger Schreibpilot

Nach Stufe A `SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=true` setzen und neu starten.
Erst dieser Zustand ist als vollständiger Produktivcoach freizugeben.
Dann mit einem dedizierten Testlernstand sämtliche Nutzerreisen prüfen:

1. Curriculum und Personalisierung;
2. Scope und aktives Frontier-Ziel;
   beim Zielwechsel muss `set_skillpilot_active_goal` dieselbe
   Visualisierung aktualisieren beziehungsweise ohne gültiges Bild sauber
   ausblenden;
3. Erklärung, Aufgabe und fachlich alternative korrekte Lösung;
4. Mastery-Update einschließlich Konfliktfall;
5. Verified Recall mit Antwortfreigabe erst nach Lernendenantwort;
6. Prüfung ohne lösungslenkende Nachfrage und Evaluation erst nach vollständiger
   sichtbarer Abgabe;
7. Wiederaufnahme, Parallelchat, Retry, Widerruf und erneute Verbindung.

Zusätzlich sind die drei Cockpit-Starts separat zu prüfen:

- `CURRENT_UNIT`: Ein einzelner Aufruf von
  `POST /api/ui/learners/{skillpilotId}/openai/v1/launch` muss Intent und
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
und feste Consumer-Abo-Nutzung, Deutschland/EU und die vorgesehenen Browser-
und App-Oberflächen praktisch bestätigt sind. Auf jeder Oberfläche bleibt die
normale textuelle Chat-Antwort der verbindliche Fallback; eine Bild-UI gehört
nur dann zur Freigabezusage, wenn ihr tatsächlicher Lade- und
Rehydrationsnachweis dort bestanden ist.

## 7. Cockpit-Canary und Cutover

Die Variante ist eine bewusste Entscheidung pro Frontend-Artefakt. Der stabile
Produktionseinstieg im Repository-Root setzt die aktuelle Produktentscheidung
`openai-mcp`; die generische Deployment-Engine akzeptiert weiterhin keinen
impliziten Default. An der Engine muss für jedes Deployment genau einer der
Werte `visible-session`, `openai-mcp` oder `legacy` gesetzt sein.

Für den mehrsprachigen MCP-Canary beziehungsweise Cutover ist der stabile
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

Die OpenAI-MCP-Variante verwendet für alle freigegebenen Sprachen dieselbe
V1-App. Die beim Start serverseitig erzeugte Lernsession legt ihre
`communicationLocale` fest; Plugin-Control-Plane und Toolvertrag bleiben neutrales
Englisch. Eine Sprache erzeugt weder einen weiteren Host noch eine weitere App.

Bei jedem Start ruft das Cockpit einmal
`POST /api/ui/learners/{skillpilotId}/openai/v1/launch` auf und öffnet ChatGPT
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
2. Zuerst `SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=false`, bei vollständiger
   Abschaltung zusätzlich `SKILLPILOT_OPENAI_COACH_V1_MCP_ENABLED=false`,
   `SKILLPILOT_OPENAI_COACH_V1_OAUTH_ENABLED=false` und
   `SKILLPILOT_OPENAI_COACH_V1_ENABLED=false` sowie
   `SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED=false` setzen.
3. App in ChatGPT deaktivieren beziehungsweise die betroffene Version nach dem
   [V1-Release-Runbook](openai-plugin-v1-release.md) zurückziehen.
4. Bestehende OpenAI-V1-Verbindungen serverseitig widerrufen, falls ein
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
  Client-Secrets in der V1-App und im SkillPilot-Server sowie Übernahme
  der tatsächlichen Callback-URL; am Token-Endpunkt muss
  `client_secret_basic` ausgewählt sein;
- Nachweis, dass der Backendport nicht direkt aus dem Internet erreichbar ist;
- Datenbank-Backup, Deployment des Spring-Boot-Artefakts samt Migration und
  atomarer Environment-Umstellung;
- Aktualisierung der V1-App-Version mit der kanonischen Server-URL und
  anschließende erneute OAuth-Autorisierung;
- dokumentierte positive und negative End-to-End-Evidenz aus ChatGPT;
- erst danach Freigabe der Schreibfunktion und allgemeine Freigabe des
  Produktpfads.
