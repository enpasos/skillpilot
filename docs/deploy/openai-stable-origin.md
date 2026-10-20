# Dauerhafter OpenAI Coach: neutraler Ursprung und einmaliger Cutover

Der neue SkillPilot Coach verwendet dauerhaft
`https://mcp-openai.skillpilot.com/mcp`. Paketversionen ändern diese Adresse
nicht. Der bestehende OAuth-Issuer bleibt
`https://skillpilot.com/api/openai/v1`; interne Backend-Pfade bleiben unter
`/internal/openai/v1/`. Diese technische Implementierungsversion ist keine
öffentliche Pluginversion.

Dies ist ein koordinierter Wechsel auf genau eine aktive Resource/Audience.
Der alte Host `mcp-coach-v1.skillpilot.com` liefert danach wie V2 bis V9 nur
`404`, auch für Discovery und Domain-Challenge. Er leitet weder weiter noch
liefert er neutrale Metadaten. Alte Chats werden nicht fortgesetzt. Veröffentlichte
Git-Pakete, historische Nachweise und bereits beworbene UI-Dateien bleiben
unverändert. Neue Installation und neuer Chat sind erforderlich.

## Verbindliche Werte

| Zweck | Exakter Wert |
| --- | --- |
| MCP und OAuth Resource/Audience | `https://mcp-openai.skillpilot.com/mcp` |
| Resource-Metadaten | `https://mcp-openai.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| Widget-Domain | `https://mcp-openai.skillpilot.com` |
| Domain-Challenge | `https://mcp-openai.skillpilot.com/.well-known/openai-apps-challenge` |
| OAuth-Issuer | `https://skillpilot.com/api/openai/v1` |
| Native öffentliche CIMD-Client-ID | `https://chatgpt.com/oauth/codex/7yTcOAOqrumX/client.json` |
| Nativer Callback | `http://127.0.0.1/callback/7yTcOAOqrumX`, dynamischer Loopback-Port |
| PKCE | `S256` |
| mTLS-Modus für diesen Cutover | `observe` |
| Neue Zertifikats-Lineage | `mcp-openai.skillpilot.com` |

Der native Client ist ein exakt gebundenes öffentliches OAuth-Profil. Ein
fehlgeschlagener vertraulicher Client darf nicht auf dieses Profil ausweichen.
Die neue Client-ID und ihr Callback müssen zum neuen Plugin passen; die alte
Desktop-Client-ID darf nicht weiterverwendet werden. Der dynamische Port ist
ausschließlich bei diesem exakt gebundenen HTTP-Loopback-Host und Callback-Pfad
zulässig; daraus entsteht kein allgemeines Redirect-Wildcard. Vertrauliche
Profile und ihre Zugangsdaten werden durch diese Anleitung nicht geändert.
Ein späteres gehostetes Directory-Profil verwendet separat `private_key_jwt`
mit seinem tatsächlich registrierten exakten Callback; das native Loopback-Profil
beweist dessen Funktionsfähigkeit nicht. Transitional Basic bleibt dabei aus,
sofern kein ausdrücklich beabsichtigter Übergang dafür besteht.

Die öffentliche Prüfung am 19. Oktober 2026 ergab für den neutralen Host bereits
einen autoritativen A-Eintrag `93.90.193.219`, ohne AAAA/CNAME. HTTPS scheiterte
noch am fehlenden Hostnamen im Zertifikat. Das V1–V9-Zertifikat deckt den neuen
Host nicht ab. Diese Beobachtung vor dem Cutover ist kein Deploymentnachweis.

## Betriebsstand am 20. Oktober 2026

Das Betreiberprotokoll bestätigt DNS-/HTTP-01-Vorbereitung und erfolgreiche
Let's-Encrypt-Ausstellung der separaten Lineage `mcp-openai.skillpilot.com`.
Die anschließende externe Prüfung bestätigte eine vertrauenswürdige
Zertifikatskette, ausschließlich diesen Host im SAN und Gültigkeit bis
18. Januar 2027, 03:01:15 UTC. HTTPS liefert für `/`, `/mcp` und
`/.well-known/oauth-protected-resource/mcp` direkt `404` mit
`Cache-Control: no-store`, ohne Weiterleitung.

Dafür wurde ein temporärer neutraler TLS-vHost mit ausschließlich
404-Antworten an die bestehende `/etc/nginx/skillpilot-mcp-coaches.conf`
angehängt. Dieser optionale Vorbereitungsschritt stellt bereits gültiges
HTTPS bereit; der spätere `--cutover` ersetzt die gesamte Datei und damit
auch diesen temporären Block. Die HTTP-01-Datei blieb bytegleich. Für diesen
Zwischenstand weder die ACME-Datei ändern noch einen weiteren TLS-Include
anlegen.

Der bisherige MCP-Runtime-/Backend-Stand wurde dabei nicht umgeschaltet.
Die Betreiberkonsole bestätigt die Serverrevision
`fd1f419769c96197073f3daa16b5526241084473` und 52 geänderte generierte
Deckdateien unter `app/public/data/`. Diese Dateien vor dem Quellwechsel
mitsamt Git-Diff und Dateihashes sichern; nicht durch Reset oder ungeprüftes
Stashing verwerfen. Der zusammengehörige neue Quellstand ist lokal vorbereitet
und vor dem Rollout an seinen geprüften Commit zu binden. Dieser Stand belegt
keine Plugin- oder Client-Abnahme.

## Voraussetzungen und geprüfter Stand

Alle folgenden Befehle laufen auf dem Produktionsserver im geprüften Checkout,
gewöhnlich `/home/enpasos/skillpilot`. Zuerst Commit, sauberen Git-Stand und
grüne lokale/CI-Prüfungen des zusammengehörigen Backend-/Paketstands festhalten.
Kein alter Deploymentlauncher und kein separat kopiertes Deploymentskript
darf den versionierten Einstieg ersetzen.

```bash
cd /home/enpasos/skillpilot
git status --short
git rev-parse HEAD
node scripts/check_openai_plugin_versioning.mjs
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/validate_openai_v1_runtime_config.mjs
./scripts/verify_openai_v1_mtls_edge.sh --static
```

Nginx muss den bestehenden MCP-Include
`/etc/nginx/skillpilot-mcp-coaches.conf` genau einmal aus `http {}` laden und
den vorhandenen Main-Origin-Deny-Include im `skillpilot.com`-HTTPS-vHost
behalten. Für HTTP-01 genau die zusätzliche Datei
`/etc/nginx/conf.d/skillpilot-openai-stable-acme.conf` einmal ausdrücklich aus
`http {}` laden. Die Produktionsprüfung am 19. Oktober 2026 fand keinen
`conf.d`-Wildcard-Include; dort liegt auch eine bisher ungeladene fremde
`php-fpm.conf`. Deshalb nur den unten genannten einzelnen Include ergänzen.
Der Installer prüft die tatsächliche Einbindung durch `nginx -T`; er ersetzt
keine Hauptkonfiguration und errät keine Include-Stelle. Nginx-Dumps können andere Betriebsdaten enthalten:
nicht vollständig in Chat, Tickets oder öffentliche Logs kopieren.

Benötigt werden Nginx mit `auth_request`, Certbot mit Webroot-Unterstützung,
OpenSSL, Python 3 und der bereits installierte Loopback-mTLS-Verifier. Die
üblichen Java-/Node-/Build-Voraussetzungen des
[Deploymentprozesses](deployment.md) gelten ebenfalls. DNS vor Ausstellung
erneut prüfen: A und etwaige AAAA müssen auf denselben erreichbaren Server
zeigen; ein fehlender AAAA-Eintrag ist zulässig.

## 1. HTTP-01 und separates Zertifikat

Der neue Installer hat feste Zielpfade, prüft Root-Eigentum und Dateitypen,
sichert ersetzte Dateien und protokolliert Commit und Quellhashes unter
`/var/backups/skillpilot-openai-origin/stage.*`. Bei einem fehlgeschlagenen
Staging-Test stellt er die vorherigen Nginx-Dateien wieder her. Er lädt Nginx
nicht neu und startet weder Backend noch Certbot.

Bei der ersten Einrichtung die Bootstrap-Datei **vor** dem Include anlegen.
Dann die bestehende Hauptkonfiguration sichern und im Editor genau einen
Include unmittelbar neben dem vorhandenen MCP-Include im bestehenden
`http {}`-Block ergänzen:

```bash
sudo install -d -o root -g root -m 0755 /var/lib/skillpilot-openai-acme
sudo install -o root -g root -m 0644 deploy/nginx/skillpilot-openai-stable-acme.conf /etc/nginx/conf.d/skillpilot-openai-stable-acme.conf
openai_acme_nginx_backup="/etc/nginx/nginx.conf.openai-stable-acme.$(date -u +%Y%m%dT%H%M%SZ)"
sudo cp -a /etc/nginx/nginx.conf "${openai_acme_nginx_backup}"
sudoedit /etc/nginx/nginx.conf
```

Der betreffende Ausschnitt muss anschließend so aussehen; die bestehende
Konfiguration und ihre anderen Includes bleiben vollständig erhalten:

```nginx
http {
    # bestehende Einstellungen
    include /etc/nginx/skillpilot-mcp-coaches.conf;
    include /etc/nginx/conf.d/skillpilot-openai-stable-acme.conf;
    # bestehende weitere Includes und vHosts
}
```

Keinen allgemeinen `conf.d/*.conf`-Include hinzufügen. Erst nach angelegter
Datei und diesem einzelnen Include den Installer zur Prüfung ausführen;
ohne Einbindung bricht er absichtlich ab und nimmt sein Datei-Staging zurück.

```bash
sudo ./scripts/install_openai_stable_origin_edge.sh --bootstrap
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl is-active nginx

sudo certbot certonly --webroot --dry-run \
  --webroot-path /var/lib/skillpilot-openai-acme \
  --cert-name mcp-openai.skillpilot.com \
  --key-type ecdsa \
  -d mcp-openai.skillpilot.com

sudo certbot certonly --webroot \
  --webroot-path /var/lib/skillpilot-openai-acme \
  --cert-name mcp-openai.skillpilot.com \
  --key-type ecdsa \
  -d mcp-openai.skillpilot.com \
  --deploy-hook '/usr/sbin/nginx -t && /usr/bin/systemctl reload nginx'
```

Der Bootstrap-vHost liefert ausschließlich vorhandene HTTP-01-Dateien aus
`/var/lib/skillpilot-openai-acme`; alle anderen HTTP-Pfade erhalten `404`.
Er bleibt für die Erneuerung bestehen. Die vorhandene Lineage
`skillpilot-mcp-coaches` bleibt für die HTTPS-404-Antworten der alten Hosts
erhalten und wird nicht umgeschrieben. Der neutrale TLS-vHost wird erst im
nächsten Schritt für den MCP-Zugriff installiert.

## Reload-Fenster vor dem TLS-Staging absichern

Ein Zertifikatserneuerungs-Hook oder ein anderer automatischer Nginx-Reload
könnte gestagte Dateien schon während des Backend-Builds aktivieren. Deshalb
vor `--cutover` den tatsächlichen Schedulerzustand und bestehende Reload-Jobs
prüfen und für dieses Wartungsfenster festhalten. Die Read-only-Prüfung am
19. Oktober 2026 fand konkret `certbot-renew.timer` mit
`certbot-renew.service`; der Service war inaktiv. Den Stand unmittelbar vor
der Operation erneut prüfen und den Timerzustand vor dem Stoppen notieren:

```bash
systemctl list-timers certbot-renew.timer --all --no-pager
systemctl show certbot-renew.timer --property=ActiveState --property=SubState --property=Triggers --no-pager
systemctl is-enabled certbot-renew.timer
systemctl show certbot-renew.service --property=ActiveState --property=SubState --no-pager
systemctl list-jobs --no-pager

sudo systemctl stop certbot-renew.timer
systemctl show certbot-renew.timer certbot-renew.service --property=ActiveState --property=SubState --no-pager
```

Mit dem TLS-Staging erst fortfahren, wenn Timer und Renewal-Service inaktiv
sind und kein Renewal oder Reload mehr läuft oder aussteht. Ein schon
laufendes Renewal durch den Betreiber erst abschließen lassen; ein Timer-Stopp
beendet es nicht. Weitere vorhandene Renewal-Cronjobs oder Reload-Automation
müssen für dasselbe Fenster ebenfalls gezielt angehalten beziehungsweise durch
den Betreiber ausgeschlossen sein. Währenddessen führt auch kein anderer
Operator einen Nginx-Reload aus. Keine allgemeinen Timer oder unbekannten Jobs
pauschal deaktivieren. Der Installer übernimmt diese Betriebskoordination nicht.

Die konkret pausierten Auslöser und ihren vorherigen Zustand festhalten. Sie
bleiben bis zum erfolgreichen Cutover oder bis zur geprüften Wiederherstellung
der alten Nginx-Dateien pausiert. Ein Build-Abbruch allein reicht zum
Wiederanlaufenlassen nicht aus: Die gestagten Dateien würden beim nächsten
Reload sonst doch aktiv.

## 2. OAuth-Profil und mTLS vorbereitet halten

Der Betreiber ändert ausschließlich die folgenden nicht geheimen Werte in
der bestehenden rootgeschützten systemd-EnvironmentFile, normalerweise
`/etc/skillpilot/skillpilot.env`. Die Datei niemals ausgeben oder als Shellcode
einlesen. Andere Zugangsdaten und die bestehenden Providerprofile bleiben
erhalten. Die Datei muss weiterhin Root gehören und Modus `0600` haben.

```bash
sudoedit /etc/skillpilot/skillpilot.env
```

```text
SKILLPILOT_OPENAI_COACH_V1_OAUTH_NATIVE_CIMD_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_OAUTH_NATIVE_CIMD_CLIENT_ID=https://chatgpt.com/oauth/codex/7yTcOAOqrumX/client.json
SKILLPILOT_OPENAI_COACH_V1_OAUTH_NATIVE_CIMD_AUTHORIZATION_POLICY_VERSION=native-cimd-stable-origin-v1
SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE=observe
```

Die neue Policy-Version muss für diese neue Client-/Resource-Kombination noch
nicht verwendet worden sein. Der Backend-Policy-Fingerprint schützt diese
Bindung; eine bestehende Version darf nicht mit anderen Parametern umgedeutet
werden. Öffentliche URLs sind feste Releasewerte im Code und werden nicht als
Environment-Overrides gesetzt. Der gemeinsame Issuer und die bestehenden
`skillpilot.openai.v1.read`-/`write`-Scopes bleiben erhalten.

```bash
sudo ./scripts/install_openai_v1_mtls_edge.sh --mode observe
sudo systemctl is-active skillpilot-openai-v1-mtls-verifier
sudo ./scripts/install_openai_stable_origin_edge.sh --cutover
```

Bei einer abweichenden EnvironmentFile erhalten **beide** Installer
`--service-environment-file /absoluter/pfad`; das spätere Deployment erhält
denselben Pfad über `SKILLPILOT_SERVICE_ENV_FILE`. Der bestehende mTLS-Installer
prüft und staged nur Verifier/CA/Modus, der neue Installer prüft und staged nur
die festgelegten Nginx-Dateien. `--cutover` setzt ein vorhandenes gültiges
neutrales Zertifikat, den exakten Bootstrap-Include und die bestehenden
Installationspfade voraus. Sein Preflight kontrolliert auch die einzige aktive
neutrale TLS-Bindung, die V1–V9-404-Bindungen und den Main-Origin-Deny-Include.
Noch kein Nginx-Reload nach diesem Staging.

## 3. Backend und Edge gemeinsam aktivieren

Für den einmaligen Wechsel den ausdrücklichen Cutover-Schalter des bestehenden
Deployment-Einstiegs verwenden:

```bash
SKILLPILOT_SKIP_GIT_UPDATE=1 ./deploy_skillpilot.sh --openai-stable-origin-cutover
```

`SKILLPILOT_SKIP_GIT_UPDATE=1` bindet diesen Lauf an den zuvor geprüften Commit.
Ohne den Cutover-Schalter lädt ein gewöhnliches Deployment Nginx nicht neu.
Der Schalter ist nur zusammen mit `openai-mcp` erlaubt und wird nicht aus einer
zufälligen geerbten Wrapper-Environment aktiviert.

Vor dem Build prüft der Deploymentprozess die gestagten Dateien und benötigt
die bestehenden Backend-Restart-Rechte sowie nicht interaktive Root-Rechte für
den exakten Edge-Preflight, `nginx -t` und `systemctl reload nginx`. Er ändert
keine sudo-Regeln. Fehlen diese Rechte, bricht er vor dem Build ab; der Betreiber
muss den kontrollierten Lauf mit vorhandenen passenden Rechten ausführen.

Nach erfolgreichem Backend-Build und Service-Restart wartet der Prozess auf
öffentliche Readiness. Dann prüft er dieselben Nginx-Dateien erneut, führt
`nginx -t` aus und lädt Nginx neu. Erst danach laufen die bestehenden öffentlichen
Runtime-Prüfungen. Zwischen Backend-Neustart und Edge-Reload kann die alte
Installation kurz fehlschlagen; für diesen einmaligen Wechsel ein kurzes
Wartungsfenster verwenden. Der Deploymentprozess lädt nach einem
fehlgeschlagenen Build Nginx nicht neu; diese Grenze setzt das oben gesicherte
Reload-Fenster voraus. Ein nach dem Neustart fehlgeschlagener Preflight bleibt
ein fehlgeschlagener Cutover und darf nicht als erfolgreicher Rollout gelten.

```bash
SKILLPILOT_OPENAI_COACH_V1_OAUTH_NATIVE_CIMD_ENABLED=true \
  ./scripts/verify_openai_v1_mtls_edge.sh --runtime --expected-mode observe

sudo certbot renew --cert-name mcp-openai.skillpilot.com --dry-run --run-deploy-hooks
```

Nach erfolgreicher Backend-/Edge-Aktivierung und den Runtime-Prüfungen die
pausierten Auslöser in genau ihren vorherigen Zustand zurückversetzen. War der
oben dokumentierte Timer zuvor aktiv, lautet der Befehl:

```bash
sudo systemctl start certbot-renew.timer
systemctl list-timers certbot-renew.timer --all --no-pager
```

Zuvor inaktive Scheduler bleiben inaktiv. Dieselbe Wiederaufnahme gilt nach
einem fehlgeschlagenen Cutover erst nach der unten beschriebenen
Wiederherstellung des konsistenten alten Stands.

Der öffentliche Smoke prüft gültiges TLS ohne Weiterleitung, die neutrale
Resource/Audience, beide Issuer-Discovery-Pfade, das `401` mit exakter
`resource_metadata`-Challenge, verworfene ungültige Clientzertifikate und
gesperrte interne/main-origin Aliase. Alte V1–V9-Hosts müssen für MCP,
Discovery, Domain-Challenge und unbekannte Pfade direkt `404` liefern.
`observe` lässt Anfragen ohne Clientzertifikat bis zur weiterhin erforderlichen
OAuth-Prüfung durch; ein ungültig präsentiertes Zertifikat wird verworfen.

## 4. Neues Plugin und tatsächliche Host-Abnahme

Erst nach erfolgreichem Edge-Rollout das neue, für diese exakten Werte gebaute
Paket in einer frischen Installation und einem neuen Chat verbinden. Prüfen:
native Anmeldung mit S256, echte Toolaufrufe, passende Coach-Instruktionen,
eine vollständige Lernsequenz mit Speicherung und anschließendem frischem
Zugriff sowie Token-Erneuerung. Web und mobile Clients brauchen ihre eigene
unterstützte Distributionsroute und tatsächliche Abnahme. CLI-, SDK- und
Browserprüfungen ersetzen diese Nachweise nicht. Dieser Runbook führt keine
Portal-Submission oder Paketveröffentlichung aus.

## Fehler und Rückweg

Vor Aktivierung kann ein gestagter Nginx-Stand aus dem ausgegebenen Backup
wiederhergestellt und mit `nginx -t` geprüft werden. Auch bei einem Buildfehler
diese Wiederherstellung vor dem Wiederanlaufenlassen von Renewal-/Reload-Jobs
abschließen. Nach einem Backendwechsel
bilden Backend, Nginx, Plugin-Konfiguration und OAuth-Policy einen gemeinsamen
Stand. Nicht nur den Proxy zurückdrehen: Sonst würden alter Host und neue
Audience auseinanderlaufen. Bei unklarem Zustand den betroffenen MCP-Zugang
geschlossen halten, bis ein zusammengehöriger Stand geprüft ist.

Falls der Build **vor dem Backend-Neustart** abgebrochen ist, ist der alte
Backend-/Edge-Stand noch aktiv. Die beiden vom TLS-Staging ersetzten Dateien
aus dessen konkret ausgegebenem Backup zurückkopieren; dabei den Platzhalter
durch dieses Verzeichnis ersetzen:

```bash
openai_cutover_backup_dir=/var/backups/skillpilot-openai-origin/stage.AUSGEGEBENES_VERZEICHNIS
sudo cp -a "${openai_cutover_backup_dir}/skillpilot-mcp-coaches.conf" /etc/nginx/skillpilot-mcp-coaches.conf
sudo cp -a "${openai_cutover_backup_dir}/skillpilot-main-vhost-openai-deny-locations.conf" /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf
sudo nginx -t
```

Erst nach der erfolgreichen Prüfung die pausierten Scheduler entsprechend
ihrem vorherigen Zustand wieder starten. Ist das neue Backend bereits
gestartet worden, gilt stattdessen die koordinierte Wiederherstellung des
zusammengehörigen Stands samt OAuth-Policy.

Ein Rückwechsel auf die frühere Client-/Resource-Kombination erfordert eine
**weitere neue Authorization-Policy-Version**, sobald die neue Policy einmal
gespeichert wurde. Die alte Policy-Version darf nicht wiederverwendet werden;
ihr Fingerprint ist unveränderlich. Eine Policy-Kollision wird durch einen
neuen Versionswert und den passenden geprüften Build gelöst, nicht durch
Löschen der Registry oder Abschwächen der Validierung. Die alte Paketdatei oder
das alte Zertifikat allein stellt keinen sicheren Rollback her.
