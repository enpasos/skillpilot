# SkillPilot-Deployment-Prozess

Dieses Dokument beschreibt den aktuellen automatisierten Deployment-Workflow für
Linux-Server. Operatoren nutzen den stabilen Einstiegspunkt im Repository-Stammverzeichnis
`./deploy_skillpilot.sh`; dieser delegiert an die generische Deployment-Engine
`scripts/deploy.sh`.

## Stabiler Produktionseinstiegspunkt

Der reguläre Produktionsbefehl lautet:

```bash
./deploy_skillpilot.sh
```

Der Produktionshost muss Poppler (`pdfinfo`, `pdftohtml`),
Fontconfig (`fc-list`, `fc-match`) sowie Liberation Sans/Mono in allen vier
Schnitten (Regular/Bold/Italic/Bold-Italic) für den Bau der Lernzielbücher und deren
Fail-Closed-Publikationsprüfungen bereitstellen. Unter Rocky Linux, RHEL oder Fedora:

```bash
sudo dnf install poppler-utils fontconfig liberation-sans-fonts liberation-mono-fonts
```

Das Deployment prüft diese Befehle, bevor der Git-Checkout aktualisiert oder
Assets kopiert werden. Eine fehlende Produktionsabhängigkeit kann daher niemals eine neue
`index.html` neben veralteten gehashten Frontend-Assets hinterlassen.

Lernzielbuch-PDFs und ihre öffentlichen Indizes werden generiert und nicht eingecheckt.
Das Deployment verwendet `npm ci`, installiert das zum Lockfile passende Playwright-Chromium,
prüft dessen Startfähigkeit und generiert bzw. verifiziert alle vier Bücher vor Vite.
Die Betriebssystembibliotheken für den Browser müssen bereits vorhanden sein; es gibt keinen stillen Fallback auf
einen Systembrowser. Siehe [das Runbook zum Buch-Build und zur Bereinigung der Historie](goal-book-build-and-history-cleanup.md),
insbesondere vor der Weiternutzung eines alten Produktions-Checkouts nach der einmaligen
Bereinigung der Git-Historie.

Generierte Shell-Dateien wie `backend/src/main/resources/static/index.html`,
`sw.js` und `version.json` werden bewusst nicht versioniert. Vite erzeugt sie zusammen mit
ihren inhaltsgehashten CSS-/JavaScript-Dateien während des Deployments als ein gemeinsames Artefakt;
Git darf niemals nur die HTML-Hälfte dieses Bundles aktualisieren.

Der Einstiegspunkt im Stammverzeichnis fixiert `VITE_SKILLPILOT_COACH_VARIANT=openai-mcp` – die
aktuelle Produktionsarchitektur für den deutschen Coach – und führt anschließend
`scripts/deploy.sh` aus. Die Engine validiert die Variante weiterhin vor dem
Build sowie erneut in den lokalen und öffentlich ausgelieferten Frontend-Artefakten. So bleibt es
bei einem einzigen Betriebsbefehl, ohne die Deployment-Schutzleitplanke zu entfernen.

Ein beabsichtigtes Rollback nutzt denselben Einstiegspunkt mit einer expliziten
Kommandozeilenoption:

```bash
./deploy_skillpilot.sh --coach-variant visible-session
```

Auf dem Produktionsserver kann der historische Launcher im Home-Verzeichnis des Operators
im Alltag als Symlink auf das versionierte Skript erhalten bleiben:

```bash
ln -s /home/enpasos/skillpilot/deploy_skillpilot.sh \
  /home/enpasos/deploy_skillpilot.sh
```

Der versionierte Einstiegspunkt löst Symlinks auf, bevor er das Repository ermittelt;
der Aufruf von `/home/enpasos/deploy_skillpilot.sh` führt daher weiterhin die eingecheckte
Deployment-Engine aus `/home/enpasos/skillpilot` aus. Es muss keine zweite Kopie der
Deployment-Logik gepflegt werden.

## Geprüfte Curriculum-Asset-Änderungen und Transparenzinventar

Nach freigegebenen Layer-A-Curriculum- oder Bildänderungen sind vor dem Commit die Runtime-Assets
aufzubereiten und das Inventar zu prüfen:

```bash
npm --prefix app run prepare:runtime-assets
node scripts/check_ai_transparency_inventory.mjs
```

Weichen die gemessenen Curriculum-/Bildzahlen ab, kann ein expliziter Patch-Vorschlag inspiziert werden:

```bash
node scripts/check_ai_transparency_inventory.mjs --emit-layer-a-patch
```

Dieser Befehl gibt lediglich einen Patch aus; er schreibt keine Dateien und gibt keine Inhalte frei.
Prüfen Sie jede vorgeschlagene Änderung, wenden Sie den akzeptierten Patch an und führen Sie anschließend die reguläre
Prüfung erneut aus. Der Vorschlag beschränkt sich auf gemessene Layer-A-Inventarfelder; Policy-
und Review-Aussagen bleiben unverändert. Fehlende oder abweichende Asset-Kopien, geänderte
feste Medien-Hashes und nicht unterstützte Schemaversionen blockieren den Vorschlag weiterhin.
Ein regulärer CI-/Build-/Deploy-Lauf aktualisiert das Inventar niemals stillschweigend.
Die Erkennung von C2PA-Container-Markern stellt keine Verifikation eines Nachweises oder seiner
Authentizität dar.

## Überblick

Der Deployment-Prozess führt derzeit alle folgenden Schritte aus:
1.  Einfordern einer expliziten, gültigen Frontend-Coach-Variante für dieses Artefakt.
2.  Prüfen, ob der Ziel-`systemd`-Service erreichbar ist, ob für den exakten
    Neustartbefehl eine passwortlose `sudo`-Berechtigung vorliegt, ob die erforderlichen
    PDF-Validierungswerkzeuge verfügbar sind und ob das Datenbank-Backup erstellt werden kann
    (`pg_dump`, eine geschützte Zugangsdatendatei, eine lesbare Datenbank).
3.  Stashen lokaler Änderungen im Arbeitsbaum, sofern `SKILLPILOT_SKIP_GIT_UPDATE=1`
    das Deployment nicht auf einen bereits verifizierten Commit und Arbeitsbaum fixiert.
4.  Holen des neuesten Codes aus Git und – falls sich `HEAD` geändert hat – Neustart der frisch
    ausgecheckten Deployment-Engine, sofern das Git-Update nicht explizit übersprungen wurde.
5.  Validieren des OpenAI-V1-Release-Vertrags und etwaiger expliziter Public-URL-Overrides
    vor dem Kopieren von Assets, dem Bauen oder dem Neustart des Dienstes.
6.  Bereitstellen der **Curriculum-Decks** aus `curricula/.../json/` sowohl in die statischen Frontend- als auch in die Backend-Datenordner.
7.  Bereitstellen der **Whitepaper-Assets** nach `app/public/whitepaper` und in die Comic-Ordner.
8.  Bereitstellen der **Quickstart-/Story-Assets** nach `app/public/`.
9.  Installieren der Frontend-Abhängigkeiten und Verifizieren des eingecheckten KI-Transparenzinventars gegen die exakt auszuliefernden Assets.
10. Neubau der React-App.
11. Verifizieren der angeforderten Coach-Variante und der referenzierten CSS-/JavaScript-Shell-Assets im generierten statischen Backend-Artefakt.
    Sicherstellen, dass der Gemini-Coach-Download byte-identisch dem veröffentlichten ZIP entspricht.
12. Bauen des Backends in einem isolierten Deployment-Verzeichnis, getrennt vom
    Standard-Gradle-Build-Verzeichnis, das vom aktuell laufenden Produktions-`bootRun`-Prozess
    genutzt wird.
13. Verifizieren, dass die verarbeiteten Backend-Ressourcen den exakt ausgelieferten Git-Commit
    sowie eine vollständige Frontend-Shell enthalten, bevor der Dienst neu gestartet wird.
14. Für die Variante `openai-mcp`: Ausführen der fokussierten Backend-Sicherheits- und
    Vertragstests.
15. Erstellen eines Dumps der PostgreSQL-Datenbank mit `scripts/backup_db.sh`. Ein fehlgeschlagener oder
    unvollständiger Dump beendet das Deployment; das bisherige Backend bedient weiter Anfragen.
16. Neustart des `skillpilot`-Systemdienstes.
17. Warten, bis der öffentliche Readiness-Endpunkt HTTP 200 liefert (gemeinsame Prozess- und Datenbank-Readiness, keine Provider-Abnahme).
18. Verifizieren der ausgelieferten CSS-/JavaScript-Shell-Assets, der Coach-Variante und der KI-Transparenztexte gegen den öffentlichen Host.
    Erneutes Prüfen des Gemini-Skill-Downloads; eine HTML-SPA-Antwort lässt das Deployment fehlschlagen.
19. Für die Variante `openai-mcp`: Einfordern des öffentlichen pfadbasierten OpenAI-V1-Smoke-Tests;
    anschließend Ausführen des Quellenbegründungs-Deployment-Smoke-Tests gegen den öffentlichen Host.

## Die Deployment-Engine (`scripts/deploy.sh`)

Dies ist der aktuelle Automatisierungsablauf:

```bash
#!/bin/bash
set -e

# Deploy from the repository that contains this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

SERVICE_NAME="${SKILLPILOT_SERVICE_NAME:-skillpilot}"

echo "Pruefe explizite Coach-Variante..."
# The script accepts only visible-session, openai-mcp, or legacy and aborts
# before Git/build/restart when VITE_SKILLPILOT_COACH_VARIANT is absent.

echo "Pruefe Restart-Voraussetzungen..."
# The script validates systemctl access and the command-specific NOPASSWD grant
# before doing expensive build work.

echo "Pruefe Lernzielbuch-PDF-Werkzeuge..."
# pdfinfo and pdftohtml are required before the checkout can be updated.

echo "Pruefe Voraussetzungen fuer das Datenbank-Backup..."
# pg_dump, the protected credential file and a readable database are required
# before the checkout can be updated (scripts/lib/deploy_database_backup.sh).

if [ "${SKILLPILOT_SKIP_GIT_UPDATE:-0}" = "1" ]; then
  echo "Ueberspringe Git-Update (SKILLPILOT_SKIP_GIT_UPDATE=1)."
else
  echo "Stash local changes..."
  git stash

  echo "Hole Updates..."
  git pull
fi

echo "Pruefe konsistente OpenAI-Plugin-V1-Versionierung..."
node scripts/check_openai_plugin_versioning.mjs

if [ "${VITE_SKILLPILOT_COACH_VARIANT}" = "openai-mcp" ]; then
  echo "Pruefe exakte OpenAI-Plugin-V1-Runtime-Konfiguration..."
  node scripts/validate_openai_v1_runtime_config.mjs
fi

echo "Pruefe unveraenderten OpenAI-Plugin-V1-Snapshot..."
node scripts/openai_plugin_release.mjs verify

echo "Deploying Vocabulary Decks..."
python3 scripts/deploy_decks.py

echo "Deploying Whitepaper assets..."
python3 scripts/deploy_whitepaper.py

echo "Deploying Story assets..."
python3 scripts/deploy_story.py

cd app
echo "Installiere Abhaengigkeiten..."
npm ci

echo "Installiere den zum Lockfile passenden Chromium..."
if [ -z "${GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH:-}" ]; then
  ./node_modules/.bin/playwright install chromium
fi
# The executable deploy.sh additionally checks Poppler/Fontconfig and launches
# Chromium before the build; use that script as the authoritative procedure.

echo "Baue Anwendung..."
npm run build

echo "Pruefe KI-Transparenznachweis..."
npm run check:ai-transparency-inventory

echo "Pruefe Coach-Variante im Frontend-Artefakt..."
node ../scripts/verify_frontend_coach_variant.mjs \
  ../backend/src/main/resources/static \
  "${VITE_SKILLPILOT_COACH_VARIANT}"

echo "Pruefe KI-Transparenz im Frontend-Artefakt..."
node ../scripts/verify_ai_transparency_artifact.mjs \
  ../backend/src/main/resources/static

echo "Pruefe Frontend-Shell-Assets im Build-Artefakt..."
node ../scripts/verify_frontend_shell_assets.mjs \
  ../backend/src/main/resources/static

cd ../backend
chmod +x gradlew
export SKILLPILOT_BACKEND_BUILD_DIR="${PROJECT_ROOT}/tmp/deploy/backend-build"
./gradlew clean build -x test

if [ "${VITE_SKILLPILOT_COACH_VARIANT}" = "openai-mcp" ]; then
  echo "Pruefe eingebettete Backend-Buildkennung..."
  node ../scripts/validate_openai_v1_runtime_config.mjs \
    --built-application "${SKILLPILOT_BACKEND_BUILD_DIR}/resources/main/application.yml"
fi

node ../scripts/verify_frontend_shell_assets.mjs \
  "${SKILLPILOT_BACKEND_BUILD_DIR}/resources/main/static"
cd ..

echo "Sichere die Datenbank vor dem Neustart..."
# Runs scripts/backup_db.sh with the credentials from the protected file and
# aborts before the restart when the dump fails or is incomplete.

echo "Starte Service neu..."
sudo -n -- "$(command -v systemctl)" restart "${SERVICE_NAME}"

SMOKE_BASE_URL="${SKILLPILOT_BASE_URL:-https://skillpilot.com}"
echo "Warte auf oeffentliche Readiness..."
# Polls /actuator/health/readiness until HTTP 200 or the configured timeout.

echo "Pruefe ausgelieferte Frontend-Shell-Assets..."
node scripts/verify_frontend_shell_assets.mjs \
  "${SMOKE_BASE_URL}"

echo "Pruefe ausgelieferte Coach-Variante..."
node scripts/verify_frontend_coach_variant.mjs \
  "${SMOKE_BASE_URL}" \
  "${VITE_SKILLPILOT_COACH_VARIANT}"

echo "Pruefe ausgelieferte KI-Transparenz..."
node scripts/verify_ai_transparency_artifact.mjs \
  "${SMOKE_BASE_URL}"

echo "Pruefe Quellenbegruendungs-Smoke-Test..."
cd app
npm run smoke:goal-source-rationales:deployment -- --base-url="${SMOKE_BASE_URL}"
```

## Warum diese Reihenfolge?

1.  **Coach-Varianten-Preflight zuerst**: Jedes Deployment muss den beabsichtigten Frontend-Vertrag explizit benennen; es gibt keinen Produktionsstandardwert, der stillschweigend Visible Session oder MCP auswählen könnte.
2.  **Preflight für Neustart und Build-Werkzeuge**: Das Skript bricht vor dem Stashen,
    dem Kopieren von Assets oder dem Build ab, falls die aktuelle Umgebung den
    `systemd`-Service nicht erreichen kann, keine befehlsspezifische passwortlose Neustartberechtigung besitzt oder
    `pdfinfo`/`pdftohtml` fehlen. Es öffnet niemals eine allgemeine `sudo`-Passwortabfrage.
3.  **`git stash` + `git pull`**: Das aktuelle Skript geht davon aus, dass das Deployment
    aus einem möglicherweise modifizierten Arbeitsbaum erfolgt, und schützt den Pull durch vorheriges Stashen.
    Ändert der Pull `HEAD`, startet es die neu ausgecheckte Deployment-Engine
    neu, bevor es fortfährt. Für den koordinierten Cutover auf die stabile Origin sind zuerst
    generierte Serverdateien zu sichern und der exakt verifizierte Quellstand vorzubereiten; anschließend ist
    `SKILLPILOT_SKIP_GIT_UPDATE=1` zu nutzen, um ein Stashen oder Verändern dieses Quellstands zu vermeiden.
    Siehe das [Cutover-Runbook](openai-stable-origin.md).
4.  **OpenAI-V1-Preflight**: Der eingecheckte Release-Vertrag wird
    vor dem Kopieren von Assets, dem Build und dem Neustart validiert. Die drei kanonischen öffentlichen V1-URL-Variablen
    dürfen fehlen; in diesem Fall greifen die versionierten Anwendungsstandards.
    Ein explizit gesetzter Wert – einschließlich eines leeren Werts – muss
    exakt mit dem kanonischen V1-Wert übereinstimmen; ein veralteter Alias, Tippfehler, Leerzeichen oder
    eine abweichende Origin schlagen fail-closed fehl.
5.  **Deck-/Story-/Whitepaper-Deployment** muss vor dem Frontend-Build erfolgen, damit dieser den exakten Satz öffentlicher Assets erhält.
6.  **Frontend-Build vor der Inventarverifikation** synchronisiert die generierten Runtime-Assets sowohl in das Frontend als auch in den nicht versionierten Backend-Build-Baum. Das verhindert, dass die Inventarprüfung ein aktuelles Frontend-Asset mit einer veralteten Backend-Kopie vergleicht.
7.  **Prüfung des KI-Transparenzinventars** bindet aktuelle Visualisierungs-Provider und C2PA-Container-Marker, Illustrationssammlungen, kanonische Lernziel-/Kartenzahlen sowie Podcast-Hashes an das geprüfte Inventar unter `docs/legal/`. Asset-Abweichungen stoppen das Deployment daher vor dem Backend-Build oder Neustart.
8.  **Verifikation des Frontend-Artefakts** muss vor dem Backend-Build
    oder Neustart abgeschlossen sein. Der Shell-Verifier liest `index.html`, weist Cross-Origin-Stylesheet-/Modulreferenzen zurück
    und prüft, dass jede referenzierte lokale Datei
    vorhanden und nicht leer ist.
    Der Gemini-Skill-Verifier verlangt vor dem Neustart die fixierten Original-ZIP-Bytes sowohl im
    Frontend-Artefakt als auch in den verarbeiteten Backend-Ressourcen.
9.  **Isolierter Backend-Build und Verifikation der Build-Kennung** erzeugen das
    aktualisierte Server-Artefakt außerhalb des Standardverzeichnisses `backend/build`.
    Das verhindert, dass Gradle-`clean`/`processResources` während eines fehlgeschlagenen Deployments
    den Classpath des noch laufenden Produktions-`bootRun`-Prozesses verändern.
    Gradle bettet den vollständigen kleingeschriebenen `HEAD`-Commit sowohl in
    `skillpilot.openai.coach.v1.server-build` als auch in die MCP-`server-version` ein; die
    Deployment-Engine prüft die verarbeitete Ressource vor dem Neustart.
    `SKILLPILOT_SERVER_BUILD` ist keine Laufzeiteinstellung und kann diese
    Artefakt-Identität nicht ersetzen.
10. **Fokussierte OpenAI-Sicherheits- und Vertragstests** laufen vor dem Neustart für das
    Artefakt `openai-mcp`.
11. **Datenbank-Backup unmittelbar vor dem Neustart**: Der Neustart wendet
    ausstehende Liquibase-Änderungen an und führt neuen Code gegen den Lernendenzustand aus, wobei
    der Server keine anderweitige Sicherung dieser Datenbank besitzt. Der Dump wird daher
    erstellt, nachdem sämtliche Build- und Vorabprüfungen bestanden sind und unmittelbar
    vor `systemctl restart`. Ein fehlgeschlagener Dump oder ein Dump ohne den `pg_dump`-Abschluss-Trailer
    beendet das Deployment, während das bisherige Backend
    weiter Anfragen bedient. Siehe [Datenbank-Backup](#datenbank-backup).
12. **`systemctl restart`** aktiviert das frisch gebaute Frontend-/Backend-Bundle.
13. **Warten auf öffentliche Readiness** fängt das normale Startfenster von Spring Boot und Reverse-Proxy
    nach `systemctl restart` ab. Ein vorübergehendes `502` führt daher nicht
    zu einem fälschlich fehlgeschlagenen Deployment. Diese Gruppe prüft ausschließlich die gemeinsame Prozess-
    und Datenbank-Readiness. OpenAI besitzt eine separate Health-Gruppe `openaiReadiness`;
    die [profilspezifische Host-/Release-Abnahme](oauth-client-authentication.md)
    bleibt vor der Aktivierung eines Profils erforderlich. Eine erfolgreiche gemeinsame Readiness oder
    der nachfolgende Public-Contract-Smoke-Test ersetzt diese Abnahme nicht.
14. **Öffentliche Shell-Verifikation nach Readiness** ruft `index.html` und die
    exakt referenzierten CSS-/Modul-Assets mit Cache-Bypass-Headern ab. Sie verlangt
    erfolgreiche, nicht leere Same-Origin-Antworten mit den erwarteten Content-Types,
    sodass fehlende gehashte Assets oder eine als CSS ausgelieferte HTML-Fehlerseite das Deployment abbrechen.
    Der öffentliche Gemini-Skill-Download muss HTTP 200, einen ZIP-Content-Type
    und denselben fixierten Archiv-Digest liefern. Siehe das separate Dokument zum
    [Gemini-Gateway-Deployment](https://github.com/enpasos/skillpilot/blob/main/deploy/gemini-v1/README.md) für dessen HTTPS-,
    private Konfigurations- und Aktivierungsschritte.
15. **Verpflichtender öffentlicher OpenAI-V1-Vertrags-Smoke-Test** läuft nach der Readiness bei
    jedem `openai-mcp`-Deployment. Er verifiziert das dedizierte
    TLS-Zertifikat für `mcp-openai.skillpilot.com`, direkte Antworten ohne
    Weiterleitungen, HTTP `200` samt exakter Resource in den pfadspezifischen
    Protected-Resource-Metadaten sowie HTTP `401` samt exakter
    `WWW-Authenticate`-Metadatenreferenz unter
    `https://mcp-openai.skillpilot.com/mcp`. Die verworfenen Routen auf der Haupt-Origin
    und die interne Transportroute müssen HTTP `404` liefern; die stillgelegten
    Hosts `mcp-coach-v1` bis `mcp-coach-v9` müssen HTTP `404` liefern.
    Die erstmalige Aktivierung erfordert den [koordinierten Backend-/Edge-Cutover](openai-stable-origin.md).
16. **Weitere Deployment-Smoke-Tests** prüfen, ob der öffentliche Host die beabsichtigte
    Coach-Variante sowohl in den Versionsmetadaten als auch im HTML ausliefert und die geprüften
    DE/EN-Audio-, Coach- und rechtlichen Transparenztexte enthält. Der Quellenbegründungs-Smoke-Test
    erkennt anschließend den aktiven Curriculum-Modus: Repository-Deployments müssen
    die beiden exakten Kompatibilitätsindizes ausliefern, während Paket-Deployments
    die Catalog API 1.2 und funktionierende generationsgebundene Quellennachweis-Routen bereitstellen müssen.

## Datenbank-Backup

Der Lernendenzustand (Mastery, Pläne, Fokus, Sitzungen) existiert ausschließlich in der
Produktions-PostgreSQL-Datenbank; abgesehen von den eigenen Exporten der Lernenden gibt es keine weitere
Kopie. Jedes Deployment schreibt daher vor dem Neustart des Backends einen vollständigen SQL-Dump.

**Einmalige Einrichtung auf dem Server** als deployender Benutzer:

```bash
install -d -m 700 ~/.config/skillpilot
install -m 600 /dev/null ~/.config/skillpilot/db-backup.env
# then add one line: POSTGRES_PASSWORD=<database password>
```

Die Datei ist eine einfache `KEY=value`-Liste. Sie wird geparst, niemals ausgeführt, und es werden ausschließlich
`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`,
`POSTGRES_PASSWORD` und `SKILLPILOT_BACKUP_RETENTION_DAYS` gelesen; fehlende
Werte verwenden die Standards aus `application.yml`. Sie muss dem deployenden
Benutzer mit Modus `600` gehören – oder `root` ohne jegliche Zugriffsrechte für Dritte –, sodass stattdessen
eine lesbare Service-`EnvironmentFile` über
`SKILLPILOT_DB_BACKUP_ENV_FILE` angegeben werden kann. `pg_dump` muss in einer Version installiert sein, die
den Server lesen kann.

**Was ein Deployment ausführt:**

- Der Preflight prüft `pg_dump`, die Zugangsdatendatei und deren Schutzrechte und
  liest einmalig das Schema der Tabelle `learner`. Eine fehlende Voraussetzung beendet das
  Deployment innerhalb weniger Sekunden noch vor dem Git-Update und jedem Build-Schritt. Das
  erste Deployment, das diesen Schritt enthält, hält an dieser Stelle an, bis die
  Zugangsdatendatei existiert.
- Unmittelbar vor dem Neustart schreibt `scripts/backup_db.sh` die Datei
  `skillpilot_<date>_<time>.sql` nach `~/skillpilot-db-backups` (überschreibbar per
  `SKILLPILOT_DB_BACKUP_DIR`), Verzeichnismodus `700`, Dateimodus `600`. Ein Dump wird
  nur dann bereitgestellt, wenn `pg_dump` erfolgreich durchlief und seinen Abschluss-Trailer geschrieben hat.
  Dumps, die älter als 30 Tage sind, werden entfernt (`SKILLPILOT_BACKUP_RETENTION_DAYS`).
  Inhalte des Lernziel-Feedback-Posteingangs sind wie in der
  [Datenschutzdokumentation](../security/data-privacy.md) beschrieben ausgenommen.
- `SKILLPILOT_DEPLOY_SKIP_DB_BACKUP=1` deployt ohne Dump und gibt eine
  Warnung aus. Diese Option existiert für Notfälle, in denen die Datenbank selbst für
  `pg_dump` nicht erreichbar ist; der Produktionseinstiegspunkt setzt sie niemals.

**Wiederherstellung (Restore)** in eine leere Datenbank derselben PostgreSQL-Hauptversion bei
gestopptem Backend:

```bash
psql -h localhost -U skillpilot -d skillpilot -v ON_ERROR_STOP=1 -f ~/skillpilot-db-backups/skillpilot_<date>_<time>.sql
```

Die Dumps liegen auf demselben Host wie die Datenbank. Sie schützen vor einer fehlerhaften
Migration oder einem fehlerhaften Release, nicht jedoch vor dem Verlust des Servers; eine regelmäßige Kopie auf
ein anderes System sowie ein Dump zwischen Deployments (beispielsweise ein täglicher `cron`-Eintrag,
der `scripts/backup_db.sh` mit derselben Zugangsdatendatei aufruft) bleiben
separate Betriebsentscheidungen.

## Details zum Asset-Deployment

- `scripts/deploy_decks.py`
  - durchsucht `curricula/**/json/` nach Dateien, die auf `_deck*.json` passen
  - kopiert sie nach:
    - `app/public/data/`
    - `backend/src/main/resources/static/data/`
- `scripts/deploy_whitepaper.py`
  - kopiert `docs/whitepaper/` nach `app/public/whitepaper/`
  - kopiert Comic-Assets für `comic1`, `comic2` und `comic3`
- `scripts/deploy_story.py`
  - kopiert `docs/quickstart/*` nach `app/public/`

## Betriebshinweise

- `./deploy_skillpilot.sh` ist der reguläre Produktionseinstiegspunkt und fixiert stets
  `openai-mcp`. Veraltete Umgebungswerte für `VITE_SKILLPILOT_COACH_VARIANT` werden
  bewusst ignoriert.
- `VITE_SKILLPILOT_COACH_VARIANT` bleibt bei einem direkten Aufruf der Engine
  `scripts/deploy.sh` verpflichtend und muss exakt `visible-session`,
  `openai-mcp` oder `legacy` lauten.
  - Mehrsprachiges MCP-Deployment: `./deploy_skillpilot.sh`
  - Visible-Session-Rollback:
    `./deploy_skillpilot.sh --coach-variant visible-session`
  - Der `openai-mcp`-Build nutzt dieselbe V1-App für jede vom Backend unterstützte
    Kommunikationssprache.
- Die kanonischen öffentlichen OpenAI-V1-Werte sind sichere, versionierte
  Anwendungsstandards:
  - MCP-Endpunkt: `https://mcp-coach-v1.skillpilot.com/mcp`
  - OAuth-Resource: `https://mcp-coach-v1.skillpilot.com/mcp`
  - Protected-Resource-Metadaten:
    `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp`
  V1 bindet exakt zwei aktive inhaltsadressierte MCP-Apps-UI-Ressourcen auf der
  festen Widget-Domain `https://mcp-coach-v1.skillpilot.com`: den reinen Bild-Lernziel-Renderer
  und das interaktive Kartenlernen. Zuvor beworbene Bild-Hash-URIs
  bleiben passiv und byte-identisch lesbar. Das Karten-Review-Tool
  ist App-exklusiv und ungebunden; reguläre Tools bleiben UI-frei. Vergabe der permanenten ID und
  Level-2-Einrichtung verbleiben ausschließlich in der SkillPilot-WebGUI. Bloßer MCP-`ImageContent`
  ist nicht der
  Sichtbarkeitsvertrag, und
  die Laufzeit wendet kein `openai/userAgent`- oder Client-Surface-Gate an.
  Diese URLs sind unveränderliche Vertragswerte und keine Umgebungseinstellungen.
  Veraltete `SKILLPILOT_OPENAI_DE_*`-URL-Namen und neu erfundene
  `SKILLPILOT_OPENAI_COACH_V1_*`-URL-Overrides schlagen fail-closed fehl.
  Entfernen Sie veraltete `SKILLPILOT_OPENAI_DE_UI_ORIGIN`-, obsolet gewordene V1-Origin- sowie alte
  sprachgebundene mTLS-/Smoke-Variablen vor dem ersten Subdomain-Deployment.
  Die aktuelle neutrale Edge nutzt ausschließlich
  `SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE=disabled|observe|enforce` und eine
  `root`-eigene Nginx-Modusdatei; alte `SKILLPILOT_OPENAI_DE_*`-Namen bleiben verboten.
- Behandeln Sie MCP-Toolbeschreibungen, Input-/Output-Schemata, Annotationen,
  Server-Instruktionen und Skills als versionierte modellsichtbare Metadaten. Ein Server-Deployment
  aktualisiert kompatibles Live-Ergebnisverhalten, schreibt jedoch weder eine bestehende
  ChatGPT-Konversation noch deren frühere Tool-Ergebnisse um. Wählen Sie bei einer
  Developer-Mode-Verbindung nach dem Deployment **Refresh** auf der Verbindung, prüfen Sie die
  ermittelten Metadaten und testen Sie in einer neuen Konversation. Scannen, prüfen und veröffentlichen Sie bei einem
  veröffentlichten Plugin einen neuen Metadaten-Snapshot. Ein Neuladen der Browserseite ist
  kein Ersatz. Siehe OpenAIs
  [Verfahren zur Metadaten-Aktualisierung](https://developers.openai.com/plugins/deploy/connect-chatgpt#refresh-metadata)
  und
  [Versionierung veröffentlichter MCP-Metadaten](https://developers.openai.com/plugins/deploy/app-review#how-published-mcp-metadata-versions-work).
- Ein einziges Spring-Boot-Artefakt `skillpilot-server` hostet sämtliche Coach-Linien. Werte,
  die zu V1 gehören, verwenden `SKILLPILOT_OPENAI_COACH_V1_*`; echte gemeinsame
  Prozessrichtlinien nutzen `SKILLPILOT_OPENAI_*` ohne Sprach-/Versionssegmente.
- Die additiven Nginx-Vorlagen sind
  `deploy/nginx/skillpilot-mcp-coaches.conf` zur Einbindung innerhalb von `http {}` sowie
  `deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf` zur Einbindung
  ausschließlich innerhalb des bestehenden HTTPS-`server {}`-Blocks von `skillpilot.com` vor dessen
  allgemeiner `location /`. Die erste Datei aktiviert ausschließlich das neutrale V1 und hält
  die neutralen V2 bis V9 auf `404`; die zweite verhindert einen Alias über die Haupt-Origin oder interne Pfade.
  Die dedizierte Coaches-Vorlage wendet außerdem die OpenAI-Client-mTLS-Grenze
  nur auf V1 `/mcp` an; sie ersetzt keine bestehenden vHosts und schützt
  OAuth-/Discovery-Pfade nicht mit einem Client-Zertifikat.
- Die Produktion nutzt exakt eine systemd-`EnvironmentFile`, im Regelfall
  `/etc/skillpilot/skillpilot.env`. Vor dem Kopieren von Assets oder dem Build
  prüft `./deploy_skillpilot.sh`, dass genau diese Datei für den Dienst konfiguriert ist,
  und weist entfernte OpenAI-Namen sowie versuchte Public-URL-Overrides zurück.
  Es inspiziert ausschließlich Variablennamen; OAuth-, Datenbank- und sonstige
  Geheimwerte werden weder protokolliert noch ausgegeben. Dieselben verbotenen Namen dürfen auch nicht
  über Unit-weite Einstellungen `Environment=` oder `PassEnvironment=` übergeben werden. Eine veraltete
  globale systemd-Manager-Umgebung wird ebenfalls abgewiesen. Ein vom Standard abweichender
  Dateipfad muss explizit über
  `SKILLPILOT_SERVICE_ENV_FILE` ausgewählt werden.
- Markiert systemd diese eine Datei als optional (`ignore_errors=yes`) und fehlt sie,
  akzeptiert der Preflight die kanonischen Anwendungsstandards, nachdem die
  übrigen Umgebungskanäle geprüft wurden. Eine fehlende Pflichtdatei
  (`ignore_errors=no`) bleibt ein Deployment-Fehler.
- Halten Sie eine Umgebungsdatei mit OAuth- oder Datenbank-Geheimnissen standardmäßig im Besitz von `root` und
  mit Modus `0600`. Das explizit konfigurierte Admin-Gruppenprofil erlaubt
  ausschließlich `/etc/skillpilot/skillpilot.env` als `root:skillpilot-admin` mit `0660`
  unterhalb von `/etc/skillpilot` mit demselben Eigentümer/derselben Gruppe und `0750`; siehe
  [direkter Admin-Dateizugriff](admin-file-access.md). Andere Gruppen, andere Pfade
  mit Gruppenzugriff und gruppenschreibbare Verzeichnisse bleiben untersagt. Kann
  der Deploy-Benutzer das `root`-geschützte Verzeichnis nicht durchqueren oder die Datei nicht lesen, wird die
  Allowlist-Inhaltsprüfung als `SKIP` gemeldet; die exakte V1-Startvalidierung von Spring
  bleibt dann die abschließende Fail-Closed-Grenze. Unit-weite und globale
  systemd-Quellen werden weiterhin vor dem Build geprüft.
- Pflegen Sie `SKILLPILOT_SERVER_BUILD` nicht in
  `/etc/skillpilot/skillpilot.env`. Der Backend-Build bettet den vollständigen Git-Commit
  in das JAR ein und das Deployment verifiziert ihn vor dem Neustart. Der Neubau eines Commits
  trägt daher automatisch die korrekte Build-Kennung, ohne dass ein Operator die
  Service-Umgebung bearbeiten muss.
- `git stash` ist Bestandteil des aktuellen Skriptverhaltens.
  - Operatoren sollten beachten, dass lokal geänderte Dateien per Stash gesichert und weder zusammengeführt noch deployt werden.
- Der initiale Backend-Build läuft mit `-x test`; ein `openai-mcp`-Deployment
  führt anschließend vor dem Neustart die fokussierten OpenAI-Sicherheits-, OAuth-, Vertrags- und End-to-End-Tests aus.
  - Die CI bleibt für die vollständige Backend-Regressionssuite verantwortlich.
- Der Dienstname lautet standardmäßig `skillpilot`.
  - Überschreiben Sie ihn mit `SKILLPILOT_SERVICE_NAME=<service-name>`, wenn eine Umgebung mit abweichendem Unit-Namen deployt wird.
- Das Skript stasht im Normalfall lokale Änderungen und führt vor dem Build einen Git-Pull aus.
  - Setzen Sie `SKILLPILOT_SKIP_GIT_UPDATE=1` nur dann, wenn exakt der gewünschte Arbeitsbaum bereits auf dem Server vorliegt, etwa nach dem manuellen Einspielen eines Patches bei einem SSH-Recovery-Deployment.
- Der Smoke-Test nach dem Neustart prüft standardmäßig `https://skillpilot.com`.
  - Überschreiben Sie dies mit `SKILLPILOT_BASE_URL=https://staging.example.org` für einen anderen Host.
- Das Warten auf öffentliche Readiness beträgt standardmäßig 180 Sekunden bei einem Intervall von 5 Sekunden.
  - Überschreiben Sie dies mit `SKILLPILOT_DEPLOY_READINESS_TIMEOUT_SECONDS=<seconds>` und
    `SKILLPILOT_DEPLOY_READINESS_INTERVAL_SECONDS=<seconds>`, wenn eine Zielumgebung
    ein abweichendes Startprofil aufweist.
- Deployments als `enpasos` benötigen für den Neustart eine befehlsspezifische, passwortlose `sudo`-Berechtigung.
  Das Skript verwendet bewusst `sudo -n` und fragt niemals nach einem
  Linux-Passwort:

  ```sudoers
  enpasos ALL=(root) NOPASSWD: /usr/bin/systemctl restart skillpilot
  ```

  Prüfen Sie vor dem Anlegen der Regel den tatsächlichen Binärpfad auf dem Server mit `command -v systemctl`.
  Vergeben Sie kein uneingeschränktes passwortloses `sudo`.

## Voraussetzungen auf dem Server

- **Python 3**: Erforderlich zum Ausführen von `scripts/deploy_decks.py`, `scripts/deploy_whitepaper.py` und `scripts/deploy_story.py`.
- **Node.js & npm**: Erforderlich zum Installieren der Abhängigkeiten und zum Bauen des Frontends.
- **Java**: Erforderlich für den Backend-Gradle-Build.
- **Git**: Erforderlich zum Abrufen von Updates.
- **Sudo-Zugriff**: Eine befehlsspezifische `NOPASSWD`-Berechtigung ist erforderlich, um
  den Systemdienst `skillpilot` neu zu starten, wenn das Deployment als Nicht-Root-Benutzer erfolgt.
- **PostgreSQL-Client**: `pg_dump` und die unter [Datenbank-Backup](#datenbank-backup) beschriebene
  geschützte Zugangsdatendatei sind für den Dump vor
  jedem Neustart erforderlich.
