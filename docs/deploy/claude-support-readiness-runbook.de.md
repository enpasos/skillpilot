# Support-Readiness-Runbook für den persönlichen Claude-Marketplace

> **Status: unvollständig.** Die Support-Bereitschaft (Support Readiness) bleibt ein Veröffentlichungs-Blocker.
> Jedes unten stehende Feld `UNASSIGNED - BLOCKING` benötigt eine freigegebene verantwortliche Person oder einen freigegebenen Wert,
> und die Übungen zu Postfach, Workflow-Benachrichtigung sowie Rollback erfordern protokollierte
> Nachweise. Dieses Runbook und ein grüner synthetischer Check setzen kein Release-Gate
> auf `pass`.

Dieses Runbook regelt Support und Incident Response für den bestehenden
Personal-Marketplace-Kandidaten `skillpilot-coach-v1` sowie dessen dedizierten Remote-Connector.
Es autorisiert weder eine Veröffentlichung noch eine Änderung der Produktionskonfiguration,
einen Token- oder Sitzungswiderruf oder eine Ausweitung des getesteten Client-Vertrags.
Der eingefrorene Vertrag für OpenAI Coach v1 bleibt unverändert.

## Freigegebener zugriffsbeschränkter Nachweisspeicher

Der Product Owner hat einen privaten Google-Drive-Ordner als zugriffsbeschränkten
Nachweisspeicher bestimmt. Er muss ausschließlich im Zugriff des Eigentümers bleiben, bei deaktivierter Linkfreigabe und aktivierter MFA
auf dem Eigentümerkonto. Jedes abgeschlossene Release wird als ein finales,
unveränderliches ZIP- oder PDF-Nachweispaket aufbewahrt; ein veränderbares natives Dokument allein
reicht als Nachweis nicht aus. Die private Kontoadresse, rohe Postfach- und Alarmzustellungsdetails,
Screenshots sowie sonstiges vertrauliches Material verbleiben außerhalb dieses
Repositorys.

Der freigegebene Speicher wurde am 1. September 2026 unterhalb des bestehenden privaten
SkillPilot-Drive-Ordners angelegt. Ein erfolgreicher Schreibtest samt anschließendem Auslesen der Metadaten meldete
`shared: false`, genau eine Eigentümerberechtigung und keinerlei öffentliche, Domain-, Gruppen- oder
Linkberechtigung. Der Product Owner bestätigte separat, dass MFA auf dem
zugehörigen Google-Konto aktiv ist. Die private Ordner-ID, URL, Kontodetails und MFA-Nachweise
bleiben außerhalb dieses Repositorys. Öffentliche Release-Aufzeichnungen verwenden die opake
Referenz `SP-CLAUDE-EVIDENCE-STORE-001` und speichern ausschließlich diese Referenz sowie
den SHA-256 jedes finalen Nachweispakets.

## Verantwortlichkeiten und Support-Abgrenzung

| Zuständigkeit | Aktueller Wert | Anforderung an die Bereitschaft |
| --- | --- | --- |
| Öffentliche Annahmestelle | `support@skillpilot.com` | Postfach-Roundtrip, Zugriff durch die hauptverantwortliche Person und jede benannte Vertretung sowie die aktuelle Kontosicherheits- bzw. ausdrücklich akzeptierte Restrisiko-Entscheidung müssen im zugriffsbeschränkten Speicher nachgewiesen sein. |
| Hauptverantwortlicher Support Owner | Dr. Matthias Unverzagt (zugleich Product Owner) | Verantwortet Meldungsannahme und Vorfallsausrufung. |
| Stellvertretender Support Owner | Keine; Product Owner hat das Einzelverantwortlichen-Risiko akzeptiert | Aktive öffentliche Bewerbung während einer unbeaufsichtigten Abwesenheit pausieren; das Repository und bestehende Installationen müssen nicht allein wegen Abwesenheit des Owners deaktiviert werden. |
| Operations Owner | Dr. Matthias Unverzagt | Autorisiert zur Durchführung von Connector-Eindämmung und Wiederherstellung. |
| Security Owner | Dr. Matthias Unverzagt | Verantwortet Vorfälle zu Zugangsdaten, Tokens und Lernendensitzungen. |
| Abgedeckte Supportzeiten | Kein fest besetztes Zeitfenster; Best Effort; kein garantiertes SLA | Aktive öffentliche Bewerbung pausiert während einer unbeaufsichtigten Abwesenheit. |
| Interne Reaktionsziele | Best Effort; keine garantierte Reaktionszeit | Bei Feststellung eines Sicherheits- oder Datenschutzvorfalls Bewerbung pausieren und den Connector so bald wie praktisch möglich im erforderlichen Umfang eindämmen. |
| Workflow-Alarmroute | Private GitHub-Benachrichtigungsroute des verantwortlichen Owners | Die private Zustelladresse verbleibt ausschließlich im zugriffsbeschränkten Nachweis; Zustellung und Quittierung erfordern weiterhin eine Übung (Drill). |
| Erkennung bei authentifizierten Tools | `BEST-EFFORT REACTIVE BETA - ACCEPTED` | Es gibt keinen hostseitigen E-Mail-Monitor pro Einzeloperation und keinen Anspruch auf Echtzeiterkennung oder SLA. Signale sind der nach Best Effort geplante öffentliche synthetische Check, die konfigurierte GitHub-Benachrichtigungsroute bei Workflow-Fehlern, Supportmeldungen sowie die gezielte Einsichtnahme in das providergebundene Operationsfehler-Protokoll. |
| Zugriffsbeschränktes Widerrufsverfahren | `SP-CLAUDE-V1-IR-001` Version `1.0.0` (`draft`; isolierte Probe und Freigabe blockieren weiterhin) | Operations und Security Owner ist Dr. Matthias Unverzagt. Der geprüfte One-Shot-Quellcode und die zugehörigen Tests liegen unter [`scripts/claude_v1_revoke.py`](https://github.com/enpasos/skillpilot/blob/main/scripts/claude_v1_revoke.py) und [`scripts/test_claude_v1_revoke.py`](https://github.com/enpasos/skillpilot/blob/main/scripts/test_claude_v1_revoke.py). Vorfallsspezifische Befehle, Zugriffsdetails und Nachweise ausschließlich im freigegebenen zugriffsbeschränkten Nachweisspeicher aufbewahren; niemals Geheimnisse oder Live-Werte committen. |

Die unterstützte Produktgrenze entspricht der Dokumentation im
[Claude-Connector-Benutzerhandbuch](claude-connector-v1-user-guide.md) und im
[Release-Runbook für den persönlichen Marketplace](claude-personal-marketplace-release.md).
Der Support darf die bloße technische Verfügbarkeit auf einem anderen Claude-Client, Tarif oder
einer anderen Oberfläche ohne separaten Abnahmenachweis nicht zu einer SkillPilot-Supportzusage machen.

## Prüfung ausführen

Der synthetische Check arbeitet rein lesend. Er sendet ausschließlich anmeldedatenfreie `GET`-Anfragen an eine
feste Allowlist, weist Weiterleitungen zurück, begrenzt Antwortgrößen und gibt niemals
Antwortrümpfe (Response Bodies) aus. Er verifiziert die aktuelle unveränderliche Plugin-Veröffentlichung, die öffentlichen
Rechts- und Datenschutzseiten, die Betriebsbereitschaft der Anwendung, die OAuth-Discovery des Connectors sowie
die nicht authentifizierte MCP-Challenge.

Während eines Backend-Rollouts akzeptiert die Publikationsprüfung die exakte unveränderliche
eingecheckte Veröffentlichung, den ausdrücklich ausgewählten bereits veröffentlichten Build
**1.1.12** oder die aktuell lokal mit dem deterministischen Build-Generator des Backends
reproduzierte Veröffentlichung. Der historische Build wird gegen sein
unveränderliches archiviertes Dossier, die protokollierte Publikationsbindung und das aufbewahrte Archiv verifiziert;
sein erwarteter Index wird aus lokalen Release-Metadaten rekonstruiert. Die Vorbereitung von
**1.1.13** setzt daher nicht voraus, dass dieser Nachfolger bereits ausgerollt ist.
Jeder Pfad verifiziert den gesamten Index und das gesamte Archiv; eine beliebige Remote-Version
oder ein beliebiger Hash wird niemals akzeptiert. Temporäre Build-Ressourcen werden nach der
Prüfung entfernt. Der gemeldete Kandidat benennt die tatsächlich ausgelieferte Veröffentlichung.
Diese Verfügbarkeitsprüfung ersetzt weder das Deployment-Gate, welches die
exakt neu gebaute Veröffentlichung verlangt, noch begründet sie eine Host-Abnahme.

Führen Sie zunächst die zugehörigen Unit-Tests und anschließend die Live-Prüfung aus:

```bash
node --test scripts/claude_support_synthetic.test.mjs
node scripts/claude_support_synthetic.mjs verify
```

Die Implementierung befindet sich in
[claude_support_synthetic.mjs](https://github.com/enpasos/skillpilot/blob/main/scripts/claude_support_synthetic.mjs).
Der
[Workflow Claude Support Synthetic](https://github.com/enpasos/skillpilot/blob/main/.github/workflows/claude-support-synthetic.yml)
führt dieselben Unit-Tests aus und startet die Live-Prüfung nach Zeitplan oder per
manuellem Aufruf (`workflow_dispatch`). Pull Requests führen ausschließlich die Unit-Tests aus und kontaktieren keine
Produktionsendpunkte.

## Ergebnisse und Alarme prüfen

Ein bestandenes JSON-Ergebnis enthält die UTC-Prüfzeit, Kandidatenversion und
SHA-256 sowie je öffentlicher Einzelprüfung ein begrenztes Ergebnisobjekt. Es enthält keine lokalen Pfade,
Zugangsdaten, Lernendendaten oder Antwortrümpfe. Bewahren Sie das JSON-Artefakt und
die unveränderliche Workflow-Run-URL im freigegebenen Nachweisspeicher auf.

Ein fehlgeschlagener geplanter Lauf ist zunächst nur ein Signal in GitHub Actions. Eine nachgewiesene
Alarmierung liegt erst vor, wenn die hauptverantwortliche empfangende Person und jede benannte Vertretung
die Benachrichtigung tatsächlich erhalten. Um diese Route zu testen, lösen Sie den Workflow manuell mit
aktiviertem `exercise_alert` aus. Der Workflow führt zuerst den echten synthetischen Check aus und
schlägt anschließend absichtlich fehl. Protokollieren Sie Auslöse-, Zustellungs- und Quittierungszeitstempel
im Übungsnachweis. Schwächen Sie die Prüfung niemals ab, nur um die Übung grün zu bekommen.

## Best-Effort-Erkennungsgrenze für authentifizierte Tools

Der öffentliche synthetische Check kann authentifizierte Tools bewusst nicht ausführen. Am
3. September 2026 wählte und akzeptierte der Product Owner für die Personal-Marketplace-Beta
die folgende einfachere Betriebsgrenze:

- kein hostseitiger E-Mail-Monitor pro Einzeloperation und kein zusätzlicher systemd-Dienst;
- das Produktions-Deployment darf keine Zugangsdaten für ein technisches Postfach oder SMTP
  hinzufügen oder vorhalten;
- keine garantierte Echtzeiterkennung, kein fest besetztes Überwachungsfenster und kein SLA;
- stündlich geplante, anmeldedatenfreie öffentliche Prüfungen sowie die konfigurierte GitHub-Benachrichtigungsroute
  bei Workflow-Fehlern zuzüglich eingehender Meldungen über
  `support@skillpilot.com`; sowie
- gezielte Einsichtnahme durch den autorisierten Operations Owner in das bestehende
  providergebundene Operationsfehler-Protokoll für Claude v1, dessen Anwendungsmeldung
  ausschließlich den Operationsnamen und die Dauer enthält.

Ein Fehler bei einer authentifizierten Operation kann daher unerkannt bleiben, bis eine
Supportmeldung, ein damit zusammenhängender Ausfall einer öffentlichen Oberfläche oder eine manuelle Prüfung ihn aufdeckt.
Auch das Scheduling von GitHub-Workflows und die Benachrichtigungszustellung erfolgen nach Best Effort
und können sich verzögern.
Dieses Restrisiko wird ausschließlich für die aktuelle, nach Best Effort betriebene Personal-Marketplace-Beta
akzeptiert. Öffentliche Materialien dürfen weder eine proaktive Überwachung einzelner Tools noch
eine Echtzeiterkennung oder garantierte Reaktionszeiten suggerieren.

Diese Betriebsgrenze erfüllt oder ersetzt nicht das separate Gate für die exakte Client-Abnahme,
das unabhängig davon blockierend bleibt. Reproduzieren Sie während eines gemeldeten
Vorfalls authentifiziertes Verhalten nur bei Bedarf und ausschließlich mit
dem autorisierten volljährigen Testkontext; verwenden Sie niemals Zugangsdaten von Kundinnen und Kunden oder
echte Lernendenzustände. Wiederholen Sie nach der Wiederherstellung die betroffenen Clean-Client-Prüfungen sowie den öffentlichen
synthetischen Check.

Vor jeder institutionellen Bereitstellung, jedem Directory-Eintrag sowie jeder Zusage eines fest besetzten Supports,
eines SLAs oder allgemeiner Verfügbarkeit (General Availability) sind verwaltete strukturierte Observability, dauerhafte Zustellung mit Wiederholungsversuchen sowie ein
unabhängiges Lebenszeichen des Monitors neu zu bewerten. Eine solche Ausweitung ist eine eigenständige
Release- und Betriebsentscheidung und nicht Bestandteil dieses Beta-Runbooks.

## Sichere Meldungsannahme

Fragen Sie nur die Mindestinformationen ab, die zur Einordnung einer Meldung erforderlich sind:

- UTC-Zeitpunkt und Angabe, ob der Fehler beim Hinzufügen des Marketplace, bei der Installation,
  bei der Connector-Autorisierung, beim First-Party-Start oder in der regulären Nutzung auftrat;
- installierte Plugin-Version und – sofern sichtbar – die Revision des Marketplace-Repositorys;
- Claude-Tarifklasse und Client-Oberfläche, ohne Kontokennungen;
- bereinigter Fehlertext sowie die zugehörige Workflow-Run-URL des synthetischen Checks.

Fordern Sie niemals eine permanente SkillPilot-ID, einen `spc_`-Lernendensitzungswert,
eine vorbereitete `q`-URL, einen OAuth-Code oder ein OAuth-Token, ein Cookie, eine Capability, ein vollständiges
Chat-Transkript oder einen Screenshot mit Lernendendaten an und bewahren Sie solche Daten auch nicht auf. Geht ein solcher Wert
unerwartet ein, kopieren Sie ihn nicht weiter, beschränken Sie den Zugriff und leiten Sie den Vorgang gemäß dem
freigegebenen Incident-Prozess an den Security Owner weiter.

## Triage und Fehlerbehebung

| Signal | Erste sichere Maßnahme | Eskalation |
| --- | --- | --- |
| Prüfung der unveränderlichen Veröffentlichung, der Rechts- oder der Datenschutzseite schlägt fehl | Rollout-Bewerbung stoppen und den synthetischen Check einmal aus einer sauberen Umgebung heraus erneut starten. Veröffentlichte Bytes niemals ersetzen und keinen Force-Push auf die Marketplace-Historie ausführen. | Operations Owner; zusätzlich Security Owner bei Verdacht auf Integritätsverletzung oder Offenlegung. |
| Betriebsbereitschaft der Anwendung steht nicht auf `UP` | Freigegebene Dienst- und Deployment-Telemetrie prüfen; Lernende nicht zu wiederholten Neuversuchen auffordern. | Operations Owner und Vorfallsausrufung gemäß dem freigegebenen Reaktionsziel. |
| OAuth-Metadaten oder MCP-Bearer-Challenge weichen ab | Connector-Autorisierung als fail-closed behandeln. Niemals nach einem OAuth-Code oder Token fragen. | Security Owner und Operations Owner. |
| Marketplace lässt sich nicht hinzufügen oder das Plugin fehlt | Vollständige HTTPS-URL des Marketplace-Repositorys, berechtigten unterstützten Tarif/Client sowie eine Aktualisierung prüfen. Ausschließlich den bereinigten Client-Fehler aufbewahren. | Support Owner; Release Owner, falls auf dem sauberen Abnahmekonto reproduzierbar. |
| Connector-Autorisierung schlägt fehl | Öffentlichen Discovery-Synthetik-Check prüfen. Nutzende erst dann zum Neustart der Autorisierung bitten, wenn der öffentliche Vertrag fehlerfrei ist. | Security Owner bei Schleifen, unerwartetem Consent-Dialog oder offengelegten Werten. |
| Ein verbundener Client lehnt die Lernendensitzung ab | Neue Sitzung ausschließlich über `https://skillpilot.com/` starten; niemals den Sitzungswert per E-Mail entgegennehmen. | Support Owner; Operations Owner, falls mit einer autorisierten synthetischen Fixture reproduzierbar. |
| Ein authentifiziertes Tool schlägt fehl, während der öffentliche synthetische Check besteht | Nur bei Bedarf mit der autorisierten volljährigen Test-Fixture reproduzieren, anschließend gezielt nach dem providergebundenen Claude-v1-Operationsfehler-Eintrag filtern, ohne umliegende Journal-Einträge oder rohe Lernendendaten zu kopieren. | Operations Owner und Security Owner; Bewerbung pausieren, falls Integrität, Datenschutz oder ein systematischer Fehler betroffen sein könnten. |
| Anbieterweiter Client-Ausfall bei bestandenen SkillPilot-Prüfungen | Anbieterstatus als externe Abhängigkeit dokumentieren und keine SkillPilot-Bytes verändern. | Support Owner überwacht die Entstörung; kein SkillPilot-Rollback ohne SkillPilot-Befund. |

## Vertrag des zugriffsbeschränkten Widerrufswerkzeugs

Das separat installierte Werkzeug behält seine Anforderung `root:root 0600` für
das gemeinsam genutzte EnvironmentFile bei. Falls der [direkte Admin-Dateizugriff](admin-file-access.md)
aktiviert wurde, stellen Sie vor der Ausführung von `plan` oder `execute` exakt diese Dateirechte wieder her:

```bash
sudo chown root:root /etc/skillpilot/skillpilot.env
sudo chmod 0600 /etc/skillpilot/skillpilot.env
```

Das `root` gehörende, für die Gruppe nicht beschreibbare Verzeichnis `/etc/skillpilot` darf
`root:skillpilot-admin 0750` beibehalten. Die direkte Bearbeitung per WinSCP bleibt ausgesetzt, bis das
Admin-Profil nach Abschluss des Incident-Verfahrens ausdrücklich wiederhergestellt wird. Diese
Rechteänderung verändert weder das installierte Werkzeug noch dessen Freigabe oder Hash.

`SP-CLAUDE-V1-IR-001` ist ein ausschließlich unter `root` ausführbares One-Shot-Vorfallswerkzeug – kein Daemon,
kein Endpunkt und kein regulärer Deployment-Schritt. Installieren Sie ausschließlich den geprüften Quellstand aus dem
exakten freigegebenen Commit. Verifizieren Sie zuerst, dass dieser Pfad in jenem Commit unverändert ist,
protokollieren Sie seinen SHA-256 und installieren Sie ihn anschließend byte-identisch:

```bash
SKILLPILOT_APPROVED_COMMIT=REVIEWED_40_CHARACTER_COMMIT
test "$(git rev-parse --verify HEAD^{commit})" = \
  "${SKILLPILOT_APPROVED_COMMIT}"
git ls-files --error-unmatch scripts/claude_v1_revoke.py
git cat-file -e \
  "${SKILLPILOT_APPROVED_COMMIT}:scripts/claude_v1_revoke.py"
git diff --exit-code "${SKILLPILOT_APPROVED_COMMIT}" -- \
  scripts/claude_v1_revoke.py
sha256sum scripts/claude_v1_revoke.py
sudo install -d -o root -g root -m 0755 \
  /usr/local/libexec/skillpilot
sudo install -o root -g root -m 0755 \
  scripts/claude_v1_revoke.py \
  /usr/local/libexec/skillpilot/claude_v1_revoke
sudo sha256sum /usr/local/libexec/skillpilot/claude_v1_revoke
sudo stat -c '%U:%G %a %n' \
  /usr/local/libexec/skillpilot/claude_v1_revoke
```

Beide Hashes müssen übereinstimmen und die installierten Metadaten müssen exakt
`root:root 755` lauten. Führen Sie niemals die beschreibbare Quellkopie des Deploy-Benutzers aus. Das
installierte Werkzeug verweigert jeden anderen Pfad, Eigentümer oder Dateimodus. Es leitet genau eine
PostgreSQL-Zielverbindung ausschließlich aus den fünf `POSTGRES_*`-Werten ab, welche die
eindeutig identifizierte SkillPilot-Anwendungs-JVM innerhalb der aktiven
`skillpilot.service`-cgroup geerbt hat, übergibt ausschließlich diese Werte an `psql` und gibt sie niemals
aus. Der verbundene Server liefert einen nicht geheimen Fingerabdruck `targetSha256` zurück, der
Datenbankname, effektive Datenbankrolle, Datenbank-OID, Serveradresse und
Port sowie die Startzeit des PostgreSQL-Postmasters bindet. Dies unterstützt bewusst die
aktuelle `bootRun`-Diensttopologie, bei der die systemd-`MainPID` der Gradle-Wrapper
statt der Anwendungs-JVM sein kann. Das Werkzeug ruft ausschließlich feste,
vom `PATH` unabhängige Systembefehls-Anker auf. Ein regulärer Anker wird direkt akzeptiert.
Ein von der Distribution verwalteter Symlink-Anker wird nur über eine
begrenzte, zyklenfreie Kette akzeptiert, in der jeder Link `root:root` gehört, jedes lexikalische
Elternverzeichnis `root` gehört und weder für Gruppe noch für andere beschreibbar ist und das
Endziel eine `root:root` gehörende, nicht beschreibbare reguläre ausführbare Datei ohne besondere
Modus-Bits ist. Ausgeführt wird das aufgelöste Endziel, nicht der Symlink-Anker. Das Werkzeug
bricht fail-closed ab, falls der Dienst ein
direktes Spring-Datasource-, Konfigurations- oder Profil-Override, eine externe
`application*`-Konfigurationsdatei an einem Standardsuchort, ein weiteres
EnvironmentFile, eine unerwartete Form des Datenbanknamens, mehr oder weniger als genau eine
passende Anwendungs-JVM oder einen sich ändernden Dienstprozess aufweist.

Hierbei handelt es sich um eine betriebliche Schutzprüfung, nicht um eine Host-Attestierung. Das Werkzeug inspiziert keine
Spring-Objekte zur Laufzeit und kann nicht unabhängig beweisen, welche Datasource ein modifizierter
Anwendungs-Classpath ausgewählt hat. Es vertraut der Root-Grenze des Hosts, der systemd-Unit,
dem laufenden Prozess, der geerbten Umgebung und dem ausgerollten Anwendungs-Classpath.
Der aktuelle `bootRun`-Classpath ist für den Deployment-Benutzer beschreibbar.
Bestehen Zweifel an der Integrität von Host, Deployment-Konto, Checkout, Prozess, Konfiguration oder Classpath,
führen Sie `execute` auf diesem Host nicht aus. Halten Sie den öffentlichen Edge
eingedämmt, führen Sie den Widerruf über einen unabhängig verifizierten, DBA-kontrollierten
Datenbankpfad durch und bauen Sie den Host aus geprüften unveränderlichen Artefakten neu auf. Die Umstellung der
Produktion auf ein digest-gebundenes, `root` gehörendes unveränderliches Anwendungsartefakt ist eine
gesonderte Härtungsmaßnahme vor einem über die Beta hinausgehenden Rollout.

Bevor die Support-Bereitschaft auf `pass` gehen kann, führen Sie ausschließlich den schreibgeschützten Produktionsplan aus und
bewahren Sie das einzelne bereinigte JSON-Ergebnis im zugriffsbeschränkten Nachweisspeicher auf:

```bash
sudo /usr/local/libexec/skillpilot/claude_v1_revoke plan \
  --procedure-id SP-CLAUDE-V1-IR-001 \
  --incident-id SPDRILL-YYYYMMDD-NNN
```

`plan` validiert das verbundene Produktionsschema, die Migrationen, den exakten Claude-v1-Umfang
sowie die Datenbankziel-Schutzprüfungen, ohne eine Zeile zu verändern. Der Owner muss prüfen,
ob die vier Aggregatzähler plausibel sind, und `targetSha256` zusammen mit
dem Plan aufbewahren. Ein Datenbankneustart, Failover, Rollenwechsel oder geändertes Verbindungsziel
verändert diesen Fingerabdruck und macht den Plan ungültig. Unerwartete Zählerstände oder
eine fehlgeschlagene Schutzprüfung stoppen das Verfahren; sie werden niemals durch Ausweiten des
Löschumfangs behoben. Der Platzhalter `REVIEWED_40_CHARACTER_COMMIT` hält das
Installationsbeispiel bewusst inaktiv, bis der freigegebene Commit vorliegt.

Der vor der Veröffentlichung erstellte Plan autorisiert niemals ein `execute`. Ersetzen Sie während eines tatsächlichen
Vorfalls die installierten aktiven Claude-v1-Vhost-Bytes unter demselben Include-Pfad
durch die geprüfte, rein abweisende Datei
[`skillpilot-claude-connector-v1-contained.conf`](https://github.com/enpasos/skillpilot/blob/main/deploy/nginx/skillpilot-claude-connector-v1-contained.conf),
setzen Sie das Claude-v1-Backend-Flag auf `false`, starten Sie den gemeinsamen Dienst neu bis zur
Betriebsbereitschaft, validieren Sie Nginx und laden Sie Nginx neu. Die `root` gehörende Eindämmungsdatei muss den
Modus `0644` besitzen; Quell- und installierter SHA-256 müssen übereinstimmen. Eine frische TLS-Anfrage an
`/mcp` muss sowohl HTTP `404` als auch den Header
`X-SkillPilot-Claude-V1-Containment: SP-CLAUDE-V1-CONTAINED-1` liefern. Diese eindeutige
Antwort beweist, dass eine neue Verbindung die geladene rein abweisende Konfiguration erreicht hat
und nicht lediglich über einen alten Proxy-Worker auf ein deaktiviertes Backend traf.

```bash
sha256sum deploy/nginx/skillpilot-claude-connector-v1-contained.conf
sudo install -o root -g root -m 0644 \
  deploy/nginx/skillpilot-claude-connector-v1-contained.conf \
  /etc/nginx/skillpilot-claude-connector-v1.conf
sudo sha256sum /etc/nginx/skillpilot-claude-connector-v1.conf
sudo nginx -t
sudo systemctl reload nginx
curl --silent --show-error --proto '=https' --max-time 10 --dump-header - \
  --output /dev/null \
  https://mcp-claude-v1.skillpilot.com/mcp
```

Wiederholen Sie anschließend `plan` mit der Vorfallskennung `SPINC-...`. Erst danach darf der
Security Owner diese vier frischen Zählerstände, den `targetSha256` dieses Plans sowie dessen
`toolSha256` mit derselben Vorfallskennung in einen `execute`-Aufruf übernehmen:

```bash
sudo /usr/local/libexec/skillpilot/claude_v1_revoke plan \
  --procedure-id SP-CLAUDE-V1-IR-001 \
  --incident-id SPINC-YYYYMMDD-NNN
```

```bash
sudo /usr/local/libexec/skillpilot/claude_v1_revoke execute \
  --procedure-id SP-CLAUDE-V1-IR-001 \
  --incident-id SPINC-YYYYMMDD-NNN \
  --expect-oauth PLAN_OAUTH_COUNT \
  --expect-consents PLAN_CONSENT_COUNT \
  --expect-sessions PLAN_SESSION_COUNT \
  --expect-idempotency PLAN_IDEMPOTENCY_COUNT \
  --expect-target-sha256 PLAN_TARGET_SHA256 \
  --expect-tool-sha256 PLAN_TOOL_SHA256 \
  --confirm REVOKE-CLAUDE-V1-AUTHORIZATIONS-AND-SESSIONS
```

Die Platzhalter halten dieses Beispiel bewusst nicht direkt ausführbar. `execute`
erfordert sämtliche Werte, den exakten Tool-Hash, das ausdrücklich auf `false` gesetzte Claude-v1-Flag,
einen unverändert laufenden Dienst sowie exakt den `root` gehörenden, rein abweisenden Nginx-Vhost
unter `/etc/nginx/skillpilot-claude-connector-v1.conf`. Die Proxy-Prüfung bindet
den SHA-256 dieser Datei, verifiziert, dass die auf der Festplatte geladene Konfiguration keinen
Claude-v1-Upstream enthält, und verlangt den charakteristischen Header samt `404` aus einer frischen,
anmeldedatenfreien Loopback-TLS-Anfrage. Das Werkzeug sperrt die sechs beteiligten Tabellen, noch bevor
die destruktive Transaktion ihren ersten Snapshot aufnimmt. Dies kann OAuth-Schreibvorgänge
anderer Provider kurzzeitig verzögern, während Lesevorgänge verfügbar bleiben. Row-Level
Security, Tabellenvererbung, unerwartete kaskadierende Fremdschlüssel, benutzerdefinierte `DELETE`-Trigger
oder Rewrite-Regeln führen vor jeder Mutation zum Abbruch. Die Transaktion löscht entweder
exakt den aktuellen aggregierten Claude-v1-Umfang oder führt ein Rollback aus. Der Ziel-Fingerabdruck
muss auch nach Erwerb der Tabellensperren noch übereinstimmen, sodass ein veralteter Plan
von einer anderen Datenbankinstanz, Rolle, Endpunktadresse oder Postmaster-Generation
abgewiesen wird. Zudem erzwingt das Werkzeug einen synchronen lokalen Commit und lehnt einen PostgreSQL-Server
mit deaktiviertem `fsync` ab, damit ein gemeldeter Commit nicht bloß gepufferter Prozesszustand
ist.

Das Ergebnis ist stets genau ein bereinigtes JSON-Objekt. `status: "applied"` ist der einzige
reguläre Erfolgsstatus. `status: "applied_but_containment_unverified"` bedeutet, dass die
gemeldeten aggregierten Löschzahlen festgeschrieben wurden, die abschließende Nachprüfung von Dienst oder Live-Eindämmung
jedoch fehlschlug. `status: "apply_outcome_unverified"` bedeutet, dass der
Datenbank-Client keinen belastbaren Commit-Nachweis zurückgab; in diesem Fall werden lediglich die erwarteten
Zählerstände und der erwartete Ziel-Fingerabdruck ausgegeben. Halten Sie bei jedem vom Erfolg abweichenden
Status die Eindämmung aufrecht, führen Sie ein frisches `plan` aus, um den aktuellen
Zustand festzustellen, und wiederholen Sie den Aufruf niemals mit geschätzten oder veralteten Werten.

Jede Änderung an Umfang, SQL, Schutzprüfungen, CLI-/Operator-Vertrag oder
Datenbankziel-Auflösung des Verfahrens erfordert eine neue Verfahrensversion, eine neue isolierte
Probe, ein Review sowie eine byte-identische Produktionsinstallation. Frühere
Nachweise veralten dadurch. Version `1.0.0` darf niemals abweichende destruktive
Semantik bezeichnen.

## Vorfallseindämmung und Wiederherstellung

1. Legen Sie einen Vorfallseintrag an, weisen Sie Schweregrad und Verantwortliche zu, protokollieren Sie die UTC-Erkennungszeit
   und pausieren Sie jede neue Marketplace-Bewerbung. Bewahren Sie sämtliche sensiblen Nachweise im
   freigegebenen zugriffsbeschränkten Speicher auf.
2. Stellen Sie fest, ob die Ursache in der Marketplace-Verteilung, im SkillPilot-Connector,
   in der gemeinsamen Anwendung oder in einem externen Claude-Client liegt. Sichern Sie
   das letzte bestandene kandidatengebundene Synthetik-Ergebnis.
3. Bei einem Integritäts- oder Datengrenzenvorfall am Connector befolgt eine autorisierte bedienende Person
   die Deaktivierungsreihenfolge in der
   [Connector-Rollback-Übung](claude-connector-v1-release.md#8-rollback-drill).
   Diese Produktionsmaßnahmen setzen Vorfallsbefugnis voraus; dieses Runbook führt
   sie nicht selbst aus.
4. Der Security Owner führt ein frisches `plan` aus, prüft dessen Aggregatzähler und
   Ziel-Fingerabdruck und startet die zähler-, ziel- und tool-hash-gebundene
   `execute`-Form des freigegebenen zugriffsbeschränkten Widerrufsverfahrens. Es widerruft
   sowohl Claude-v1-Transportautorisierungen
   als auch eigenständige Claude-v1-Lernendensitzungen, ist unumkehrbar
   und darf widerrufene Zugangsdaten niemals aus einem Backup wiederherstellen. Verwenden Sie ausschließlich die
   oben beschriebene installierte Kopie. Solange das versionierte Verfahren seine
   isolierte Probe, den schreibgeschützten Produktionsplan und die Freigabe nicht bestanden hat, kann die Support-Bereitschaft
   nicht auf `pass` gesetzt werden.
5. Wiederholen Sie nach der Eindämmung und vor der Wiederherstellung die eingefrorenen OpenAI-Differenzprüfungen.
   Eine Maßnahme auf der Claude-Seite darf weder den OpenAI-v1-Edge noch
   Paket, Tools, Schemata, UI, Sitzungen oder Review-Artefakte stillschweigend verändern.
6. Stellen Sie den Betrieb ausschließlich aus einem geprüften unveränderlichen Kandidaten wieder her. Ein inhaltlicher Rollback im Marketplace
   erfolgt stets als neues Release mit höherer SemVer; verwenden Sie niemals eine Versionsnummer mit abweichenden
   Bytes wieder, löschen Sie keine Historie und führen Sie keinen Force-Push auf `main` aus.
7. Schließen Sie den Vorfall erst ab, nachdem der synthetische Check, die Clean-Client-Abnahme sowie
   die relevanten Rollback-/Wiederherstellungsprüfungen bestanden sind und die verantwortlichen Owner dies freigegeben haben.

## Zweiteilige Probe vor der Veröffentlichung

Die Personal-Marketplace-Beta weist Widerruf und Produktionswiederherstellung in zwei
getrennten Übungen nach. So wird vermieden, echte Nutzerberechtigungen allein zum Testen
einer Notfallmaßnahme zu löschen, während das exakte destruktive Verfahren dennoch vollständig
erprobt wird, bevor es unter Zeitdruck im Ernstfall benötigt wird.

1. **Bereitschaft für den zugriffsbeschränkten Widerruf.** Der Integrationstest im Repository führt
   exakt die eingebettete Transaktion aus `SP-CLAUDE-V1-IR-001` Version `1.0.0`
   gegen eine temporäre PostgreSQL-Wegwerfdatenbank mit dedizierten Claude-v1-Fixtures
   sowie negativen Kontrollfällen für OpenAI und zurückgezogene Claude-Beta-Stände aus. Er muss außerdem
   das Rollback bei einem späten Fehler, die Widerstandsfähigkeit gegen einen manipulierten `search_path`,
   den Ausschluss eines konkurrierenden OAuth-Schreibprozesses, die Abweisung von Row-Level Security und
   Tabellenvererbung sowie die Abweisung unerwarteter Kaskaden, `DELETE`-Trigger
   und widersprüchlicher Provider-/Principal-Formen beweisen. Die Transaktion darf
   ausschließlich die auf Provider und Version eingegrenzten Claude-v1-OAuth-Autorisierungen und
   Claude-v1-Lernsitzungen löschen und muss die Negativkontrollen sowie den
   dauerhaften Curriculum-/Mastery-Zustand außerhalb dieser Sitzungen bewahren. Installieren Sie unabhängig davon
   denselben Quellstand byte-identisch als `root:root` mit Modus `0755` und führen Sie
   gegen die Produktion ausschließlich das schreibgeschützte `plan` aus. Bewahren Sie lediglich Aggregatzähler,
   den nicht geheimen Ziel-Fingerabdruck, Zeitstempel, Verfahrens-/Versions-Hashes sowie
   Bestanden-/Fehlgeschlagen-Ergebnisse auf; speichern Sie niemals Zeilenwerte, Tokens, Sitzungs-Hashes oder Lernendenkennungen.
2. **Probe von Eindämmung und Wiederherstellung in der Produktion.** Pausieren Sie in einem ausdrücklich freigegebenen
   Wartungsfenster die Bewerbung, ersetzen Sie ausschließlich den Claude-v1-TLS-Vhost
   durch den geprüften, rein abweisenden Eindämmungs-Vhost und laden Sie Nginx neu, setzen Sie das
   Claude-v1-Feature-Flag auf `false`, starten Sie den gemeinsamen Dienst neu und weisen Sie die
   charakteristische Eindämmungsantwort nach, während die Betriebsbereitschaft der Anwendung und die eingefrorene
   OpenAI-v1-Differenzprüfung fehlerfrei bleiben. Aktivieren Sie anschließend das unveränderte, als fehlerfrei bekannte
   Backend-Flag wieder, starten Sie den Dienst neu und weisen Sie die Betriebsbereitschaft nach, solange der rein abweisende
   Vhost noch geladen ist; stellen Sie erst danach denselben geprüften aktiven TLS-Vhost wieder her
   und laden Sie Nginx neu. Rollen Sie unveränderte Artefakte nicht allein für die Übung neu aus.
   Wiederholen Sie anschließend den Live-Synthetik-Check sowie die erforderliche Prüfung mit einem sauberen volljährigen Test-Client und
   protokollieren Sie die beobachtete Unterbrechungsdauer.

Der Product Owner akzeptierte am 3. September 2026, dass die Produktionsprobe
keinen Massenwiderruf echter OAuth-Freigaben oder Lernendensitzungen durchführt. Ein produktionsweiter
Widerruf bleibt einem tatsächlichen Sicherheits- oder Datengrenzenvorfall vorbehalten und wird
dann erst nach erfolgter Eindämmung durch den autorisierten Operations-/Security-Owner
ausgeführt. Wiederherstellung nach einem Widerruf bedeutet eine neue OAuth-Verbindung und eine neue
First-Party-Lernsitzung; sie bedeutet niemals das Wiederherstellen widerrufener Datensätze.

Dieser zweiteilige Beta-Nachweis schwächt oder erfüllt nicht das strengere, unabhängige
Rollback-Gate für das Connector Directory in
[dem Connector-Release-Runbook](claude-connector-v1-release.md#8-rollback-drill).

## Übung protokollieren

Nutzen Sie die
[Vorlage für die Support-Readiness-Übung](https://github.com/enpasos/skillpilot/blob/main/ai/claude/plugin/skillpilot-coach-v1/release/support-readiness-drill.template.md)
als Checkliste und legen Sie die ausgefüllten Nachweise anschließend außerhalb des öffentlichen
Repositorys ab. Dokumentieren Sie die akzeptierte Best-Effort-Grenze und verweisen Sie auf die separaten
bereinigten Deployment- und Übungsnachweise; bewahren Sie keine rohen Tool-Argumente,
Lernendenzustände, Logs oder Zugangsdaten auf. Die eingecheckte Datei ist bewusst eine
offene Kandidatenvorlage und stellt keinen Release-Nachweis dar.

## Mindestkriterien für das Bestehen

Die Support-Bereitschaft darf erst in einer separaten, freigegebenen Statusänderung auf `pass`
gesetzt werden, nachdem sämtliche folgenden Bedingungen für exakt diesen Kandidaten, Quell-Commit und
reproduzierbaren Marketplace-Baum-SHA-256 erfüllt sind:

1. Verantwortliche Personen für Support, Betrieb und Sicherheit sind benannt, verfügen über die
   erforderlichen Zugriffsrechte und geben die Support-Abgrenzung frei; eine Person kann
   mehrere Rollen innehaben, und eine fehlende Vertretung erfordert eine ausdrücklich akzeptierte
   Einzelverantwortlichen-Regelung, die die öffentliche Bewerbung während einer Abwesenheit pausiert;
2. das öffentliche Support-Postfach schließt eingehende und ausgehende Roundtrips mit
   jeder eingeteilten antwortenden Person erfolgreich ab, ohne Unklarheiten durch Auto-Replies oder Spam-Routing;
3. der tatsächliche Abdeckungsumfang – einschließlich des Fehlens eines fest besetzten
   Zeitfensters – sowie die internen Schweregrad-/Reaktionsziele sind freigegeben, ohne dass
   ein nicht abgedecktes SLA veröffentlicht wird;
4. der geplante synthetische Check ist aktiviert, sein jüngster kandidatengebundener Lauf ist erfolgreich,
   und sowohl sein bereinigtes JSON als auch die unveränderliche Run-URL sind aufbewahrt;
5. die Übung mit absichtlich fehlgeschlagenem Lauf erreicht den hauptverantwortlichen Alarmpfad sowie
   jeden eingeteilten Vertretungspfad, wobei Eingangs- und Quittierungszeitstempel
   aufbewahrt sind;
6. der Product Owner hat die Best-Effort-Erkennungsgrenze für authentifizierte Tools akzeptiert,
   kandidatenspezifische Deployment-Nachweise bestätigen, dass hierfür kein hostseitiger
   WARN-zu-E-Mail-Dienst und keine SMTP-Zugangsdaten installiert sind, und weder
   Release- noch Support-Unterlagen behaupten Echtzeit-Monitoring oder ein SLA;
7. das exakt versionierte, zugriffsbeschränkte Widerrufsverfahren hat die isolierte
   Probe gegen eine Wegwerfdatenbank bestanden – einschließlich negativer Kontrollfälle für OpenAI und zurückgezogene Beta-Stände,
   Transaktions-Rollback sowie Prüfungen auf festes Schema, konkurrierende Schreibprozesse, Row-Level
   Security, Tabellenvererbung, Kaskaden, Trigger und Provider-Umfang –,
   ohne Lernendendaten, Zugangsdaten oder Zeilenwerte im Nachweis;
8. seine byte-identische Produktionskopie ist als `root:root` mit Modus `0755` installiert,
   die Voraussetzung eines vertrauenswürdigen Hosts ist ausdrücklich bestätigt, und ein erfolgreiches
   schreibgeschütztes `plan` hat die konfigurierte Verbindung des laufenden Dienstes, den
   Ziel-Fingerabdruck und das verbundene Produktionsschema ohne Datenbankmutation
   validiert;
9. die Produktionsprobe zu Connector-Eindämmung, eingefrorener OpenAI-Differenzprüfung und
   Wiederherstellung auf den als fehlerfrei bekannten Zustand wurde in einem freigegebenen Wartungsfenster bestanden,
   ohne echte Zugangsdaten massenhaft zu widerrufen und unter Protokollierung der beobachteten Unterbrechung
   des gemeinsamen Dienstes;
10. mindestens ein bereinigtes Support-Szenario wurde Ende-zu-Ende von der
    hauptverantwortlichen Person und – sofern benannt – eines von der Vertretung triagiert; ohne
    Vertretung wurde stattdessen die Einzelverantwortlichen-Abwesenheits- und Bewerbungspausen-Regelung
    erprobt; und
11. der Product Owner prüft die vollständigen Nachweise und autorisiert ausdrücklich
    die spätere Änderung des Gate-Status.

Fehlende, veraltete oder nicht zum Kandidaten passende Nachweise schlagen fail-closed fehl. Ein grüner
synthetischer Check, eine ausgefüllte Vorlage oder eine konfigurierte E-Mail-Adresse allein reicht niemals
aus. Da die entfernte Marketplace-Revision vor der Erstveröffentlichung noch nicht existiert, ist sie
keine Voraussetzung für die Support-Bereitschaft. Binden Sie sie später in
die Nachweise zur Repository-Verifizierung und zur exakten Client-Aktivierung ein, sobald sie
vorliegt.
