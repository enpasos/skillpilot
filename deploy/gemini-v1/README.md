# Gemini V1: kontrollierten Testbetrieb bereitstellen

Diese Dateien bereiten den dauerhaften HTTPS-Zugang für das eigene
Operator-Konto unter `https://mcp-gemini-v1.skillpilot.com/mcp` vor. Der Gateway
bleibt ein einzelner Node-Prozess mit einem festen vertraulichen OAuth-Client.
Seine Grants leben maximal eine Stunde und gehen bei einem Neustart verloren;
danach die Custom App erneut verbinden. Dies ist kein Mehrnutzer-Onboarding.
Die direkte Lernzielbildanzeige im Gemini-Chat bleibt ein offener Abnahmepunkt.
Die lokale Integration und vorhandene historische Nachweise bleiben im
[Integrationsrunbook](../../docs/deploy/gemini-integration.md) beschrieben.

## Voraussetzungen und genaue Zuständigkeit

Zuerst die CI des freigegebenen Commits prüfen und den normalen
`./deploy_skillpilot.sh`-Rollout einschließlich WebGUI durchführen. Anschließend
den **tatsächlichen bestehenden Spring-Port**, den Dienstbenutzer und den
absoluten Pfad zu **Node 22.22.0** prüfen. Den lokalen Beispiel-Port nicht
ungeprüft übernehmen. Gateway und Spring laufen im gleichen Host-Netzwerk-
Namespace. Spring-Port, Datasource, globale Forwarded-Header-Einstellungen und
die anderen Provider bleiben bestehen.
Gateway und bestehender Spring-Dienst müssen denselben OS-Benutzer verwenden,
damit beide die privaten `0600`-Dateien lesen können. Bei einer produktiven
Installation prüft der Installer den geladenen Backend-Dienst, seinen Benutzer
und seinen Host-Netzwerk-Namespace. Ein anderer Dienstname kann ausdrücklich
mit `--backend-service` angegeben werden; der Standard ist `skillpilot.service`.

Der Installer verändert nur die eigene `.runtime/` des installierten
Gateway-Checkouts, `/etc/skillpilot/gemini-v1/` und die eigene
`skillpilot-gemini-v1-gateway.service` sowie das ausschließlich für HTTP-01
gedachte `/var/lib/skillpilot-gemini-acme/`. Er startet keinen Dienst, führt keinen
Backend-Neustart aus, verändert keine vorhandene Spring-EnvironmentFile und
aktiviert keinen nginx-Include. Die vorbereiteten nginx-Dateien liegen bewusst
außerhalb von automatisch geladenen `conf.d`-Verzeichnissen. Geänderte eigene
Artefakte erhalten vor dem Ersetzen eine private Sicherung. Vorhandene Schlüssel
werden erhalten; abweichende bekannte Origins, Portbindungen oder Spring-
Schlüsselbindungen brechen die Vorbereitung ab.

## 1. Gateway und private Dateien vorbereiten

Im produktiven Checkout die drei tatsächlichen Werte setzen. Die folgenden
Beispielpfade ersetzen, bevor die Befehle ausgeführt werden:

```bash
cd /home/enpasos/skillpilot
GEMINI_NODE_BIN=/absolute/path/to/node-22.22.0/bin/node
GEMINI_SPRING_PORT=8080
GEMINI_SERVICE_USER=enpasos

"${GEMINI_NODE_BIN}" --version
PATH="$(dirname "${GEMINI_NODE_BIN}"):${PATH}" npm --prefix ai/gemini/gateway ci --ignore-scripts
PATH="$(dirname "${GEMINI_NODE_BIN}"):${PATH}" npm --prefix ai/gemini/gateway test
sudo python3 scripts/install_gemini_v1_gateway.py \
  --repository /home/enpasos/skillpilot \
  --node "${GEMINI_NODE_BIN}" \
  --backend-port "${GEMINI_SPRING_PORT}" \
  --user "${GEMINI_SERVICE_USER}"
sudo systemd-analyze verify /etc/systemd/system/skillpilot-gemini-v1-gateway.service
```

Für eine reine lokale Vorschau zusätzlich `--destination-root /private/staging`
verwenden. Systempfade und private Runtime werden dann unter diesem Präfix
vorbereitet; nichts wird gestartet. Ein solcher Staging-Baum enthält echte
Testschlüssel und bleibt privat. Im lokalen Modus den eigenen Benutzer und die
eigene Gruppe wählen.

Beim ersten Lauf erzeugt der Installer fünf unterschiedliche Schlüssel aus
jeweils 32 zufälligen Bytes. `.runtime/` erhält `0700`, seine Dateien `0600`.
Die private Spring-Datei übernimmt Gateway-Assertion-, Session-Signing- und
Capability-Schlüssel aus den drei entsprechenden Dateien. Nur der Assertion-
Schlüssel wird von beiden laufenden Prozessen verwendet; die beiden anderen
schützen die Backend-Sitzungen und Fähigkeiten. Die Spring-Datei enthält
ausschließlich den Gemini-v1-Block,
ohne Server-, Datenbank- oder andere Provider-Einstellungen. Der eigene
Gateway hat eine separate EnvironmentFile mit ausschließlich Port und
Loopback-Upstream. Der kontrollierte OAuth-Client verwendet das tatsächlich
gemessene `client_secret_post`-Profil und die gemessene Refresh-Kompatibilität
für eine vollständig fehlende Ressource. Eine andere Ressource bleibt verboten.

Die private Browser-Einrichtung steht in
`ai/gemini/gateway/.runtime/DEIN-PRODUKTIONS-GEMINI-TEST.md`; sie enthält Client-
Secret und Verbindungsschlüssel. Nicht in Git, Screenshots, Issues oder
Release-Protokolle übernehmen. Mit einem leeren Callback sind Metadaten-
Discovery und die Messung des abgelehnten Redirects möglich; die Autorisierung
bleibt gesperrt.

## 2. Bestehendes Backend ergänzen und regulär neu starten

In der **bereits bestehenden einzigen** EnvironmentFile des Spring-Dienstes
(gewöhnlich `/etc/skillpilot/skillpilot.env`) die bisherige
`SPRING_CONFIG_ADDITIONAL_LOCATION` erhalten und die neue Location am Ende
ergänzen. Gibt es bisher keine Location, lautet die vollständige Zeile:

```text
SPRING_CONFIG_ADDITIONAL_LOCATION=file:/etc/skillpilot/gemini-v1/spring.yml
```

Mit einer bestehenden Zusatzdatei lautet die zusammengeführte Zeile etwa:

```text
SPRING_CONFIG_ADDITIONAL_LOCATION=file:/etc/skillpilot/existing.yml,file:/etc/skillpilot/gemini-v1/spring.yml
```

Nur **eine** wirksame Zuweisung behalten; die ganze EnvironmentFile nicht
ersetzen und kein zweites Spring-EnvironmentFile-Drop-in anlegen. Vorhandene
Gemini-Umgebungs-Overrides müssen exakt zu dieser Konfiguration passen:
Spring-Environment-Werte können die Zusatzdatei übersteuern. Die vorhandenen
OpenAI-, Claude- und Datasource-Werte nicht ändern. Eine private Sicherung der
bestehenden EnvironmentFile vor der Änderung behalten.

Die gemeinsame Readiness und vorhandenen Provider vor und nach dem normalen
Backend-Neustart prüfen. Der Backend-Neustart ist eine eigene Betriebsaktion;
ein aktiver Gateway ersetzt ihn nicht. Die private Zusatzdatei aktiviert
Gemini erst bei ihrem tatsächlichen Laden. Eine fehlerhafte Gemini-Konfiguration
kann den gemeinsamen Spring-Start verhindern und benötigt daher diese Prüfung.

## 3. Eigenes HTTPS-Zertifikat und nginx-Edge

DNS muss die tatsächliche Produktionsadresse des Servers erreichen. Die
Zertifikats-Lineage lautet genau `mcp-gemini-v1.skillpilot.com`. Den bestehenden
Default-, OpenAI- oder Claude-vHost nicht umwidmen und kein fremdes Zertifikat
als Gemini-Zertifikat verwenden.

Zuerst **nur** `nginx-acme.conf` einmal aus dem bestehenden nginx-`http`-Block
einbinden. Auf einem Host mit gewöhnlichem `conf.d/*.conf`-Include ist dafür
dieser eigene Symlink verwendbar, sofern der Name bisher frei ist:

```bash
sudo ln -s /etc/skillpilot/gemini-v1/nginx-acme.conf /etc/nginx/conf.d/skillpilot-gemini-v1.conf
sudo nginx -t
sudo systemctl reload nginx
sudo certbot certonly --webroot \
  --webroot-path /var/lib/skillpilot-gemini-acme \
  --cert-name mcp-gemini-v1.skillpilot.com \
  -d mcp-gemini-v1.skillpilot.com \
  --deploy-hook '/usr/sbin/nginx -t && /usr/bin/systemctl reload nginx'
```

Anschließend **denselben eigenen Include** auf `nginx-tls.conf` umstellen.
Nicht beide Varianten gleichzeitig laden. Beide HTTP-Varianten behalten
denselben engen HTTP-01-Webroot für Zertifikatserneuerungen; alle anderen
HTTP-Pfade bleiben gesperrt. Falls der eigene Symlink bereits
existiert, sein Ziel zuerst prüfen; einen fremden vorhandenen Eintrag nicht
überschreiben. In jedem bestehenden first-party-WebGUI-Serverblock zusätzlich
`/etc/skillpilot/gemini-v1/nginx-main-deny.conf` einbinden. Das verhindert einen
öffentlichen Alias der internen `/gemini/v1/`-Spring-Routen. Die vorhandenen
Provider-Deny-Snippets bleiben bestehen.

Der für diese Lineage gespeicherte Deploy-Hook prüft nginx und lädt es nach
einer erfolgreichen Zertifikatserneuerung neu, damit das erneuerte Zertifikat
auch tatsächlich ausgeliefert wird. Die oben angegebenen absoluten Toolpfade
am Host prüfen. Nach dem TLS-Umschalten auch die gespeicherte Erneuerung samt
Hook prüfen:

```bash
sudo certbot renew --cert-name mcp-gemini-v1.skillpilot.com --dry-run --run-deploy-hooks
```

Vor der Aktivierung prüfen:

```bash
sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl enable --now skillpilot-gemini-v1-gateway.service
curl --fail --silent --show-error http://127.0.0.1:8795/health
sudo systemctl reload nginx
curl --fail --silent --show-error https://mcp-gemini-v1.skillpilot.com/health
curl --fail --silent --show-error https://mcp-gemini-v1.skillpilot.com/.well-known/oauth-authorization-server
curl --fail --silent --show-error https://mcp-gemini-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp
```

Keine Option verwenden, die Zertifikatsfehler ignoriert. Die OAuth-Metadaten
müssen diesen Issuer, `/authorize`, `/token` und genau die Ressource
`https://mcp-gemini-v1.skillpilot.com/mcp` beschreiben. Öffentliches `/mcp` ohne
Bearer muss `401` mit einem passenden `WWW-Authenticate`-Header liefern;
unbekannte Pfade erhalten `404`. Der nginx-vHost leitet ausschließlich die zehn
exakten Gateway-Pfade an `127.0.0.1:8795` weiter. Er veröffentlicht keine
Spring-Route. Access- und Request-Error-Logs sind für diesen eigenen vHost
ausgeschaltet, weil OAuth-Querystrings Callback und private Zustandswerte
enthalten können. Der Gateway-Audit enthält nur freigegebene Ereignisfelder.

## 4. Callback messen und echten Hosttest starten

Für das eigene Operator-Konto in Gemini die MCP-URL und die privaten Client-
Felder eintragen. Den vollständigen Callback aus **Copy redirect URI** oder
dem konkreten eigenen Verbindungsversuch privat erfassen. Die temporäre
Tunnel-Verbindung hat einen anderen Callback und ist kein gültiger Ersatz.
Genau diese neue URI in
`ai/gemini/gateway/.runtime/gemini-callback.txt` pinnen, Rechte `0600` und
kanonische LF-Zeilenenden erhalten. CRLF-Zeilenenden verändern die intern
gepinnten URI-Bytes und werden von der Prüfung abgelehnt.
Keine Wildcards, Kontopräfixe oder vermuteten Redirects hinzufügen.

```bash
sudo -u "${GEMINI_SERVICE_USER}" python3 scripts/verify_gemini_v1_runtime.py \
  --gateway-dir /home/enpasos/skillpilot/ai/gemini/gateway \
  --node "${GEMINI_NODE_BIN}" \
  --backend-port "${GEMINI_SPRING_PORT}" \
  --spring-config /etc/skillpilot/gemini-v1/spring.yml
sudo systemctl restart skillpilot-gemini-v1-gateway.service
```

Die Prüfung ohne `--allow-unconfigured-callback` verlangt einen gepinnten
Callback und identische private Spring-/Gateway-Bindungen. Sie beweist nicht,
dass Spring diese Datei geladen hat oder Gemini bereits verbunden ist.
Anschließend die Custom App neu verbinden und im abschließenden Dialog
**Save your custom app → SkillPilot → Connect** tatsächlich speichern.
Den ausgelieferten Coach-Skill importieren, eine frische Lernsession aus der
produktiven WebGUI vorbereiten und Skill sowie App im Gemini-Menü auswählen.
Bei fehlendem Werkzeugzugriff im normalen Chat kann das für dieses Konto
angebotene **Gemini Spark BETA** probiert werden; eine allgemeine Pflicht
für Spark ist bisher nicht nachgewiesen.

Die Abnahme verlangt reale Kontextaufrufe, einen repräsentativen Lernfluss,
kanonisch gespeicherten Fortschritt und Fortsetzung. Mit einem eigenen
synthetischen Testprofil beginnen. Erfolgreiche Health-, OAuth- oder Renderer-
Antworten allein belegen keine direkte Lernzielbildanzeige. Die Bildanzeige
bleibt getrennt offen und ein Direktlink gilt nicht als Ersatz.

## Rücknahme

Nur den eigenen Gemini-HTTPS-vHost sperren oder auf seine deny-only-ACME-
Variante zurücksetzen, `nginx -t` prüfen und nginx neu laden. Den Gateway
stoppen. Gemini in der privaten Spring-Datei auf `enabled: false` setzen oder
nur diese zusätzliche Location aus der bestehenden EnvironmentFile entfernen,
anschließend den gemeinsamen Backend-Dienst regulär neu starten. Vorhandene
Lernerdaten, additive Gemini-Tabellen und andere Provider-Einstellungen erhalten.
Die vorbereitete Unit prüft `enabled: true`; nach einer Deaktivierung den
Gateway nicht wieder starten, bevor eine vollständig geprüfte Aktivierung
vorliegt.

## Lokale Checks

```bash
python3 scripts/test_gemini_v1_deployment.py
```

Die Tests decken wiederholte Vorbereitung ohne Schlüsselwechsel, isolierte
Backups, unveränderte andere Provider-Dateien, unabhängige Schlüssel,
Dateirechte, Symlink-Ablehnung, feste Origins, Node-Pin, Callback-Grenzen und
die drei Spring-Schlüsselbindungen ab. Mit vorhandenen `nginx` und `openssl`
wird die echte nginx-Syntax mit einem eigenen Wegwerfzertifikat geprüft und
ein kontrollierter HTTP-01-Test vor und nach dem TLS-Umschalten ausgeführt.
Fehlen diese Werkzeuge lokal, bleibt dieser einzelne Check ausdrücklich
übersprungen; das tatsächliche `nginx -t` vor Aktivierung ist weiterhin nötig.
