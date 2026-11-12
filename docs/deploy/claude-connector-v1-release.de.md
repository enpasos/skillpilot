# SkillPilot Claude Connector v1: Release-Runbook

**OAuth-Update, 11. September 2026:** Folgen Sie dem
[profilspezifischen Aktivierungs-Runbook](oauth-client-authentication.md).
Öffentliches CIMD mit PKCE ist ein ausdrücklich autorisiertes Produktions-Beta-Profil,
unabhängig von kontrollierten Custom-Confidential-Profilen und von Anthropic gehaltenen
Directory-Profilen. Nur Letzteres erfordert eine Bereitstellung durch Anthropic. Kein Profil darf
alte Grants hochstufen oder auf eine schwächere Client-Methode zurückfallen. Die lokale
Implementierung beweist weder eine echte Host-Abnahme noch eine Aktivierung.

Dieses Runbook macht die dedizierte Claude-v1-Edge und die Directory-Einreichung
reproduzierbar. Es autorisiert keine Produktionsänderung. Führen Sie Produktionsschritte
ausschließlich in einem ausdrücklich freigegebenen Release-Fenster aus und bearbeiten Sie niemals als Nebeneffekt den eingefrorenen
OpenAI-v1-vHost oder das Deny-Include.

Der Product Owner hat am 23. August 2026 ausschließlich den noch nicht eingereichten Claude-v1-Kandidaten
entsperrt, damit er rund um erstparteieigene 24-Stunden-Lernsitzungen neu aufgebaut
werden kann. OpenAI V1 bleibt eingefroren. Claude v2 bleibt unzugewiesen. Aktualisieren Sie
die Claude-Vertragsbasis erst dann, wenn der neu aufgebaute Kandidat und alle fokussierten Tests
bestanden sind.

## 1. Repository-Preflight

Starten Sie auf der exakt geprüften Revision mit einem sauberen Arbeitsbaum und den deklarierten
Node- und Java-Toolchains:

```bash
git status --short --branch
git rev-parse HEAD
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/openai_plugin_release.mjs verify
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_versioning.mjs
npm --prefix ai/claude/app test
node scripts/check_claude_connector_v1_release.mjs
```

Im strikten Modus `--submission-ready` wird ein Fehlschlag erwartet, solange manuelle Gates noch
offen sind. Schwächen Sie weder das Connector-Gate noch irgendeine OpenAI-Differenzialprüfung ab.

## 2. Konfiguration und Datenbank

Der bestehende systemd-Dienst liest `/etc/skillpilot/skillpilot.env`. Claude v1
verwendet ausschließlich seinen providerspezifischen Property-Namensraum:

```text
SKILLPILOT_CLAUDE_ENABLED=false
SKILLPILOT_CLAUDE_MCP_ENABLED=false
SKILLPILOT_CLAUDE_COACH_TOOLS_ENABLED=false
SKILLPILOT_CLAUDE_REGRESSION_TOOLS_ENABLED=false
SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED=true
SKILLPILOT_CLAUDE_CONNECTOR_V1_SIGNING_SECRET=<secret>
SKILLPILOT_CLAUDE_CONNECTOR_V1_CAPABILITY_SECRET=<different-secret>
```

Beide Secrets müssen unabhängig voneinander generiert werden, mindestens 32 Zeichen ohne Leerzeichen
umfassen, voneinander verschieden sein und ausschließlich in der `root`-eigenen Umgebungsdatei mit Modus
`0600` gespeichert werden. Geben Sie sie niemals in CI-Logs oder Release-Nachweisen aus.

Erstellen und validieren Sie vor der Aktivierung ein wiederherstellbares PostgreSQL-Backup. Bestätigen Sie,
dass die Liquibase-Änderungen `023-add-claude-connector-v1` und
`024-replace-claude-v1-binding-with-learning-sessions` den Status `EXECUTED` haben. Die
additive Migration 024 ersetzt das stillgelegte Bindungsmodell per ID-Datei durch
erstparteieigene Lernsitzungs-Persistenz. Bearbeiten Sie niemals die bereits ausgeführte Migration 023
und löschen Sie bei einem regulären Rollback keine Provider-Tabellen.

## 3. Dediziertes HTTP-01 und Zertifikat

Die Quelldateien im Repository sind:

- `deploy/nginx/skillpilot-claude-acme.conf`
- `deploy/nginx/skillpilot-claude-connector-v1.conf`
- `deploy/nginx/skillpilot-claude-connector-v1-contained.conf` (reiner Deny-Ersatz
  für Sicherheitsvorfälle; niemals gemeinsam mit dem aktiven TLS-vHost laden)

Installieren Sie jede Datei im Besitz von `root` unter `/etc/nginx/` und binden Sie sie exakt einmal
aus dem `http`-Kontext von Nginx ein. Sichern Sie vor dem Bearbeiten der übergeordneten Include-Liste
byte-identische Backups und Hashes der eingefrorenen OpenAI-Dateien.

Installieren Sie zunächst nur das HTTP-Bootstrap, validieren Sie es und laden Sie Nginx neu:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -sS -o /dev/null -w '%{http_code}\n' \
  http://mcp-claude-v1.skillpilot.com/
```

Erwarteter Root-Statuscode: `404`.

Stellen Sie das dedizierte ECDSA-Zertifikat über denselben `nginx`/`http-01`-Pfad aus, der auch
für die reguläre Erneuerung genutzt wird:

```bash
sudo certbot certonly \
  --nginx \
  --preferred-challenges http \
  --key-type ecdsa \
  --cert-name mcp-claude-v1.skillpilot.com \
  -d mcp-claude-v1.skillpilot.com
```

Prüfen Sie, dass das Zertifikat exakt den SAN von Claude v1 enthält, der Schlüssel
dazu passt, die Erneuerungsdatei `authenticator = nginx` verwendet und ein Erneuerungs-Trockenlauf (`dry run`)
erfolgreich ist. Eine manuelle DNS-Challenge ist nicht der reguläre Erneuerungspfad.

## 4. Aktivierung des TLS-vHosts

Installieren Sie `deploy/nginx/skillpilot-claude-connector-v1.conf` byte-identisch,
binden Sie die Datei einmalig ein und prüfen Sie, dass die beiden eingefrorenen OpenAI-Nginx-Dateien weiterhin
mit ihren Hashes vor der Änderung übereinstimmen. Anschließend:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl is-active nginx
```

Der Claude-vHost enthält exakt per Allowlist freigegebene Locations und liefert für alle
übrigen Routen `404`. Er darf keinen Claude-Alias zu `skillpilot.com` hinzufügen und darf
`mcp-coach-v1.skillpilot.com` nicht verändern.

## 5. Öffentliche Edge-Prüfungen

Führen Sie die öffentlichen Prüfungen von einem autorisierten externen Client aus durch und speichern Sie ausschließlich
bereinigte Nachweise:

- gültige TLS-Kette und passender Hostname;
- Protected-Resource-Metadaten benennen exakt die MCP-Resource und die öffentliche
  Dokumentations-URL;
- Authorization-Server-Metadaten kündigen PKCE S256 und CIMD an;
- Datenschutz- und Dokumentations-URLs liefern HTTPS 200;
- nicht authentifiziertes MCP liefert HTTP 401 zuzüglich `WWW-Authenticate`;
- Connector-OAuth einschließlich optionalem `offline_access` bleibt rein auf den Transport beschränkt
  und kann ohne aktuelle `learningSessionId` auf keinen Lernstand zugreifen;
- `https://skillpilot.com/` führt in den gemeinsamen SkillPilot-Webstart;
  dort muss die lernende Person sichtbar ihre SkillPilot-ID auswählen oder laden,
  Curriculum und persönliches Curriculum bestätigen und Claude auswählen, bevor
  eine frische opake `spc_`-Sitzung erzeugt wird, die nach exakt 24 Stunden abläuft;
- die explizite Auswahl von Claude öffnet ausschließlich Claude Web mit genau einem kodierten
  Parameter `q`, der den vorbereiteten Prompt enthält; Claude füllt ihn vorab ein, sendet ihn aber niemals
  automatisch ab, sodass die lernende Person ihn prüft und bewusst absendet;
- die Übergabe-URL enthält genau eine aktuelle `spc_`-Sitzung und weder eine permanente
  SkillPilot-ID noch Zugangsdaten, Fragmente, einen zweiten Query-Parameter oder einen fremden Host;
- abgelaufene, veränderte und fremde Sitzungen schlagen fail-closed fehl, während OAuth verbunden
  bleiben kann; ein OAuth-Refresh erzeugt, erneuert oder verlängert niemals eine Lernsitzung;
- weder eine permanente SkillPilot-ID noch eine ID-Datei oder ein ID-Datei-Passwort überschreitet die
  Erstpartei-Grenze von SkillPilot oder erscheint in Logs bzw. sichtbaren Claude-Ausgaben;
- eine nicht vertrauenswürdige `Origin` liefert HTTP 403;
- die stillgelegten Routen `/connect`, `/connect/`, `/connect/details` und `/connect/bind`
  liefern an der öffentlichen Edge HTTP 404;
- sonstige unbekannte Pfade, Altpfade, Pfade mit abschließendem Schrägstrich, interne Präfixe sowie Aliase auf der Haupt-Origin
  liefern HTTP 404;
- die Produktions-Readiness bleibt auf `UP`;
- jede eingefrorene OpenAI-v1-Edge-/Runtime-Prüfung läuft weiterhin erfolgreich durch.

Nehmen Sie weder OAuth-Codes, Tokens, Capabilities, rohe Response-Bodies mit
Lernendendaten noch ungefilterte `nginx -T`-Ausgaben in die Nachweise auf.

## 6. Neustart und Ressourcenprüfungen

Der Connector läuft in der bestehenden SkillPilot-JVM. Ein Neustart kann sowohl
ChatGPT als auch Claude kurzzeitig unterbrechen und erfordert daher das freigegebene
Wartungsfenster.

Verlangen Sie nach dem Neustart lokale Readiness, `NRestarts=0`, den erwarteten Prozessbaum,
ausreichende Hauptspeicher-/Swap-Reserven auf dem Host sowie kein unerwartetes Wachstum von Heap, Threads oder Verbindungspools.
Wiederholen Sie die OpenAI-Differenzialprüfung nach dem Aktivieren von Claude sowie nach dem Aktivieren der
Edge.

## 7. Real-Client-Abnahme

Bauen Sie das Directory-Karussell neu und zeichnen Sie es aus exakt denselben generierten MCP-App-Ressourcen
auf, die auch vom Backend ausgeliefert werden:

```bash
npm --prefix app ci
npm --prefix ai/claude/app ci
npm --prefix ai/claude/app test
./app/node_modules/.bin/playwright install chromium
node scripts/capture_claude_mcp_app_carousel.mjs
node scripts/check_claude_connector_v1_release.mjs
```

Der Aufzeichnungsbefehl verifiziert, dass jede generierte Ressource und ihre eingecheckte
Backend-Classpath-Kopie byte-identisch sind, und speichert anschließend einen versionierten Snapshot des
exakt generierten MCP-App-Manifests. Dadurch kann der Release-Checker die
Nachweisbindung in einem sauberen CI-Checkout reproduzieren, ohne auf ignorierte
`dist/`-Dateien angewiesen zu sein. Prüfen Sie die entstehenden drei PNGs und das Manifest, bevor Sie
die separaten Freigaben durch Product, QA und Legal protokollieren; ein erfolgreicher Skriptlauf
ersetzt diese Freigaben nicht.

Folgen Sie dem Testplan im Repository unter
`ai/claude/connector-v1/reviewer-test-plan.md`. Testen Sie sämtliche vierzehn Tools und
beide inhaltsadressierten MCP-Apps-Ressourcen im fixierten MCP Inspector sowie in einer
frischen Claude.ai-Connector-Sitzung, die ausschließlich über
`https://skillpilot.com/` gestartet wurde. Bestätigen Sie, dass jedes Tool – einschließlich des
App-exklusiven Karten-Review-Tools – dieselbe aktuelle `learningSessionId` verlangt und
dass die reguläre Lernkarten-Komponente
Karten und Review-Capabilities aus modellsichtbaren Inhalten heraushält, dass ihr
App-exklusives Review ausschließlich die Wiederholungsplanung ändert und dass weder reguläres Üben noch ein
einzelnes Review die Mastery verändert. Claude Code ist nicht Teil der aktuellen Directory-Zusage,
solange dafür kein eigener Abnahmenachweis vorliegt.

## 8. Rollback-Übung

Verifizieren Sie vor der Einreichung praktisch die folgende Reihenfolge:

1. die Bytes des aktiven Claude-TLS-vHosts am selben Include-Pfad durch die
   geprüfte reine Deny-Konfiguration `skillpilot-claude-connector-v1-contained.conf` ersetzen, Nginx
   neu laden und deren charakteristischen Containment-Header samt HTTP `404` prüfen;
2. `SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED=false` setzen;
3. den bestehenden SkillPilot-Dienst neu starten und auf Readiness warten;
4. Claude-v1-Transport-Tokens und Lernsitzungen gemäß
   dem freigegebenen eingeschränkten Verfahren widerrufen bzw. ablaufen lassen, auf das im
   [Runbook für Support-Bereitschaft und Incidents](claude-support-readiness-runbook.md) verwiesen wird;
5. sämtliche eingefrorenen OpenAI-v1-Prüfungen wiederholen;
6. das als fehlerfrei bekannte gemeinsame Artefakt nur dann wiederherstellen, wenn das Artefakt selbst fehlerhaft ist;
   andernfalls das als fehlerfrei bekannte Backend wieder aktivieren und Readiness nachweisen, während der
   reine Deny-vHost noch geladen ist, und erst danach den geprüften aktiven vHost wiederherstellen sowie
   Nginx neu laden.

Löschen Sie als operatives Rollback weder Provider-Tabellen noch verwenden Sie `git reset --hard`.
Dokumentieren Sie Zeitpunkte, ausführende Person, beobachtete Unterbrechung, Ergebnisse und Wiederherstellung
im externen Nachweisspeicher. Das Gate zur Support-Bereitschaft bleibt blockiert,
bis benannte Verantwortliche für Support, Betrieb und Sicherheit die
kandidatengebundene Übung zu Postfach, Alarmierung, Eindämmung und Wiederherstellung aus diesem
Runbook vollständig absolviert haben.

## 9. Directory-Einreichung

Erst nachdem `node scripts/check_claude_connector_v1_release.mjs
--submission-ready` erfolgreich durchläuft:

1. melden Sie sich in der einreichenden Team- oder Enterprise-Organisation als Owner,
   Primary Owner oder delegiertes Mitglied mit Zugriff auf die Anthropic-Directory-Verwaltung
   an;
2. öffnen Sie in den Claude.ai-Einstellungen dieser Organisation das **Remote MCP submission portal**
   und halten Sie die für die Einreichung verantwortliche Person fest;
3. verbinden Sie den finalen öffentlichen Streamable-HTTP-Server;
4. vergleichen Sie den Live-Toolkatalog mit der Vertragsbasis;
5. übernehmen Sie die geprüften Listing- und Use-Case-Werte aus
   `ai/claude/connector-v1/directory-listing.json`;
6. laden Sie bereinigte Screenshots hoch, die beide MCP Apps in ihren echten
   lernendenseitigen Zuständen ohne Zugangsdaten, Capabilities oder Lernendendaten zeigen;
7. stellen Sie das Reviewer-Paket über den freigegebenen sicheren Kanal bereit;
8. bestätigen Sie alle erforderlichen Richtlinien-Erklärungen; und
9. lesen Sie vor dem Absenden die abschließende Portal-Zusammenfassung.

Einreichung, Prüfstatus und Veröffentlichung sind externe Vorgänge bei Anthropic. Markieren Sie
dieses Repository erst dann als `PUBLISHED`, wenn der tatsächliche Directory-Zustand
vom Product Owner geprüft und protokolliert wurde.

## 10. Plugin-Pilot, persönlicher Marketplace und kuratierte Veröffentlichung

Das Paket unter `ai/claude/plugin/skillpilot-coach-v1/` bündelt den wiederverwendbaren SkillPilot-Coaching-Skill
mit einer Deklaration für denselben Remote-Connector; der Connector bleibt
alleiniger Eigentümer aller vierzehn Tools und beider MCP-Apps-UIs. SkillPilot Coach v1
enthält weder Hooks noch Subagents. Es erhebt keinen Anspruch auf Unterstützung von Claude Desktop Chat oder Cowork.
Jede zusätzliche Oberfläche erfordert separate Abnahmenachweise und ein
späteres geprüftes Release, bevor SkillPilot damit wirbt.

Der funktionierende Direktinstallations-Pilot belegt den Produktablauf im kostenpflichtigen Claude Web, nicht jedoch
einen von Anthropic kuratierten Eintrag. Anthropic dokumentiert inzwischen Repository-gestützte
persönliche Marketplaces für kostenpflichtige Claude-Konten einschließlich der Installation in
Claude Web. Diese technische Verfügbarkeit erweitert weder den von SkillPilot getesteten
Supportumfang noch ersetzt sie die Abnahme des exakten Kandidaten.

SkillPilots separate persönliche Git-Marketplace-Strecke ist in
[`claude-personal-marketplace-release.md`](claude-personal-marketplace-release.md) spezifiziert.
Sie exportiert ausschließlich die sechs geprüften Paketdateien in ein kleines eigenständiges
Repository, bindet sie an die bestehende Version und den SHA-256-Wert der Direktinstallation und
verlangt lokale, strikte CLI-, Remote-Repository-, Clean-Account-Installations- sowie
Update-Verifikationen. Solange ihr Aktivierungszustand
`prepared_not_published` lautet, bleibt die aktuelle Direktinstallations-Anleitung der
Erstpartei-Weg.

Die Einreichung im Connectors Directory in Abschnitt 9 bleibt ein unabhängiger,
reiner Connector-Weg mit eigenem Team-/Enterprise-Publisher-Gate. Sie enthält weder
den Coaching-Skill noch blockiert sie die Veröffentlichung im persönlichen Marketplace;
beide Wege können in beliebiger Reihenfolge voranschreiten. Eine spätere von Anthropic kuratierte
Plugin-Einreichung bleibt ein dritter, separater externer Vorgang. Das Plugin ist in
Claude Free nicht verfügbar. SkillPilot beansprucht für v1 weder eine native Mobile-Plugin-Installation
noch öffentliche Unterstützung für Claude Code und richtet sich an Erwachsene ab 18 Jahren.

Vor dem Einreichen des Plugins:

1. `node ai/claude/plugin/skillpilot-coach-v1/check-package.mjs` und
   `node --test ai/claude/plugin/skillpilot-coach-v1/check-package.test.mjs` ausführen;
2. `claude plugin validate ai/claude/plugin/skillpilot-coach-v1 --strict`
   mit der aktuellen Claude-CLI ausführen;
3. `node --test scripts/claude_marketplace_release.test.mjs` und
   `node scripts/claude_marketplace_release.mjs check` ausführen;
4. direkten Upload bzw. direkte Installation, OAuth, Erstpartei-Start, sämtliche vierzehn Tools und beide MCP
   Apps im kostenpflichtigen Claude-Web-Chat testen;
5. prüfen, dass Claude das vom Backend formulierte Feld `learningPlanToday.text`
   sowohl auf Tages- als auch auf Wochenbasis wortgetreu und übereinstimmend mit dem SkillPilot-Cockpit wiedergibt,
   nicht auswertbare Pläne benennt und weder eigene Zählungen noch Kennungen von Plänen oder
   Skill-Landschaften ausgibt. Eine automatische Wiederaufnahme erfordert kein aktives Lernziel,
   `guidance.state=resume` und das maßgebliche `resumeAvailable=true`. Nach erfülltem
   Kontingent oder Null-Kontingent muss auf ausdrücklichen Wunsch weiterhin an berechtigten
   persönlichen Zielen weitergearbeitet werden – bei Bedarf auch an zukünftigen oder ungeplanten Zielen. Bei
   Rückstand lädt der Coach zum Aufholen ein, ohne eine Pause in den Vordergrund zu stellen;
6. einen expliziten Wechsel von Mathematik zu Physik und zurück ausschließlich über die
   exakten lokalisierten Fachnamen aus dem aktuellen Tagesplankontext prüfen; das
   unvollendete Lernziel wird ohne Mastery geparkt, alle Pläne zählen weiter und
   keine ID eines Plans, einer Skill-Landschaft, eines Fokus oder eines Lernziels überschreitet die Modellgrenze;
7. prüfen, dass das Plugin exakt einen Skill und einen SkillPilot-Connector bereitstellt
   und dass beide MCP Apps über diesen Connector verfügbar sind;
8. prüfen, dass jede neue Lernsitzung weiterhin ausschließlich unter
   `https://skillpilot.com/` startet, während OAuth verbunden bleiben darf;
9. prüfen, dass Plugin- und Directory-Installationen mit Verweis auf
   `https://mcp-claude-v1.skillpilot.com/mcp` koexistieren können, während Claude für
   den gemeinsamen Server genau einen SkillPilot-Toolsatz bereitstellt, und dass kein zusätzlicher manueller
   Custom Connector für dieselbe URL konfiguriert ist;
10. den generierten Plugin-Quellstand im freigegebenen öffentlichen GitHub-Repository veröffentlichen und
    bestätigen, dass der eingereichte Repository-Pfad weder Zugangsdaten noch Lernsitzungen,
    Lernendendaten oder geschützte Antworten enthält; und
11. Repository-Installation, Connector-OAuth, Erstpartei-Start und den
    unterstützten Lernablauf gegen die exakte öffentliche Revision verifizieren; und
12. erst danach – sofern weiterhin ein von Anthropic kuratierter Eintrag beabsichtigt ist – diesen öffentlichen GitHub-Quellstand über den Plugin-Workflow der Anthropic Console
    als Developer, Admin oder Owner der einreichenden Console-Organisation
    mitsamt eigenen bereinigten Nachweisen einreichen.

Plugin-Prüfung, Freigabe und Veröffentlichung sind externe Vorgänge bei Anthropic. Markieren Sie
das Plugin nicht allein deshalb als öffentlich, weil lokale Prüfungen oder Upload-Tests bestanden wurden. Nach
der Veröffentlichung unterliegen kompatible GitHub-Updates weiterhin dem Screening durch Anthropic
sowie der eigenen SemVer-Richtlinie des Plugins.

Maßgebliche Plugin-Referenzen:

- [Use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)
- [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)

Kompatible reine Skill-Verbesserungen erhöhen die Plugin-SemVer eigenständig.
Eine brechende Änderung am MCP-, OAuth-, Identitäts- oder Zustandsvertrag erfordert weiterhin einen separat
geprüften Connector-Major samt eigenem Endpunkt; ein Plugin-Major darf eine solche
serverseitige brechende Änderung niemals kaschieren.
