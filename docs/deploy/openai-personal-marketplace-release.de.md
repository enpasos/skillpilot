# SkillPilot ChatGPT Desktop Beta: Git-Marketplace und Updates

## Aktueller neutraler Plugin-Kandidat — 19. Oktober 2026

Die aktuelle bearbeitbare Quelle ist `ai/openai plugin/skillpilot-coach/`:
**SkillPilot Coach**, Identität `skillpilot-coach`, Paket **1.1.3**, exakter MCP-Endpunkt
`https://mcp-openai.skillpilot.com/mcp`, Runtime-Vertrags-Major **1**.
Identität und Endpunkt bleiben über künftige Paket-Major-Versionen hinweg bestehen;
die Paket-SemVer ist unabhängig vom Runtime-Vertrags-Major. Dieser neue Kandidat
ist lokal und unveröffentlicht. Historische `skillpilot-coach-v1`-Installationen sowie
Windows-/Voice-Berichte begründen keine Abnahme dieser neuen Identität.
Bestehende Installationen migrieren nicht automatisch. Lernstarts nutzen frische
WebGUI-Nachrichten in neuen Chats.

Verwenden Sie das [aktuelle Deployment- und Cutover-Runbook](openai-stable-origin.md) für
das Endpunkt-Deployment sowie die OAuth-/Edge-Verifikation und das
[aktuelle Einreichungsdossier](openai-plugin-v1-submission.md) für den separaten
Directory-ZIP-Weg. Die aktuelle Git-Vorbereitung lautet:

```bash
node --test scripts/openai_marketplace_release.test.mjs
node scripts/openai_marketplace_release.mjs check
marketplace_export_dir=$(mktemp -d /tmp/skillpilot-chatgpt-marketplace.XXXXXXXX)
node scripts/openai_marketplace_release.mjs prepare --output "$marketplace_export_dir"
node scripts/openai_marketplace_release.mjs verify --output "$marketplace_export_dir"
```

Der generierte Katalog wählt `skillpilot-coach` aus; dessen sieben Installationsdateien stammen
ausschließlich aus der neutralen kanonischen Quelle. Die Vorbereitung schreibt lokale Dateien und
führt weder eine Git-Veröffentlichung noch ein Server-Deployment, eine Portal-Operation oder eine
Host-Abnahme durch. Die Prüfung eines frischen Klons und tatsächliche Client-Tests folgen erst auf eine
separat autorisierte Veröffentlichung. Der Git-Import bleibt ein Desktop-Weg; Web
und Mobile erfordern den gehosteten Directory-Weg sowie jeweils eigene Host-Nachweise.
Bewahren Sie jeden zuvor veröffentlichten Commit, Tag, jedes Archiv und jedes inhaltsadressierte
Ressourcen-Byte unverändert auf.

## Historischer v1-Beta-Nachweis und frühere Betriebsanweisungen

Alles Folgende dokumentiert den früheren Pfad `skillpilot-coach-v1` einschließlich seiner
alten kanonischen Pfade und seines alten Endpunkts. Es bleibt als historischer Nachweis erhalten. Nutzen Sie für die aktuelle
Vorbereitung die oben genannte neutrale Quelle und das dort verlinkte Runbook; wenden Sie weder die alten
Installationsbefehle noch historische Abnahmeaussagen auf die neue Identität an.


**Aktive Product-Owner-Anforderung vom 5. Oktober 2026.** Aktualisierung des bestehenden Git-Marketplaces
für schnelle Korrekturen sowie Aufnahme von **ChatGPT Desktop (Beta)** in die
WebGUI. Dies hebt die Distributionspause vom September für diesen konkreten
Weg auf. Die Archiv-/CIMD-Integration wurde bereits am 24. September autorisiert.
Die offizielle OpenAI-Einreichung und das Produktions-Deployment von GUI/Server bleiben separate Vorgänge.

## Aktueller Kandidat und Nachweise

Aktuelles lokales Paket: **SkillPilot Coach v1 1.1.3**. Aktuell dokumentiertes öffentliches
Git-Release: **1.1.2**. Der aktuelle Backend-/Ressourcen-Rollout bleibt ein separater
Vorgang; der unten aufgeführte Trace vom 19. Oktober weist die tatsächlich ausgelieferte Ressource aus.
Öffentliche Git-Quelle:
[enpasos/skillpilot-chatgpt-marketplace](https://github.com/enpasos/skillpilot-chatgpt-marketplace).
Marketplace-Identität: `skillpilot-chatgpt-marketplace`; Plugin-Identität:
`skillpilot-coach-v1`. Der kanonische OpenAI-Portal-Lebenszyklus bleibt **DRAFT**;
ein Git-Release ist keine Veröffentlichung im OpenAI Directory.

Am 5. Oktober 2026 festgehaltene Nachweise:

| Prüfung | Beobachtetes Ergebnis und Grenzen |
| --- | --- |
| Windows-ChatGPT-Archivinstallation | Owner meldet erfolgreiches Deployment; bereitgestellte UI zeigt Optionen zum Hinzufügen per Archiv und Marketplace |
| Erster Lernstart | Lehnte die für Claude erzeugte `spc_`-Capability ab; der korrigierte OpenAI-Start verwendet `sps_` |
| Windows-Git-/Desktop-Weg und korrigierter Lernstart | Product Owner bestätigt „funktioniert“ nach Installation des aktuellen Git-Pakets und Nutzung des korrigierten Starts; vom Owner berichteter Nachweis, kein aufgezeichneter Tool-Trace |
| Windows Desktop Work mit Voice | Owner berichtet, dass nur das erste Lernbild angezeigt wurde. Der gelieferte Produktions-Trace zeigt erfolgreiche initiale (State 132) und nachfolgende (State 133) Renderer-Aufrufe auf Backend `0af05906c8...`; der Owner ordnet den letzten Aufruf Voice bei fehlendem Folgebild zu. Der Server liefert noch UI `12762009...`; die lokale Korrektur `08030...` und eine erfolgreiche Voice-Bildsequenz bleiben unabgenommen |
| Windows Desktop Work ohne Voice | Owner berichtet anschließend, dass der Bildablauf ohne Voice funktioniert. Dies ist vom Owner berichtete Evidenz für den Textmodus; kein abgeglichener Voice-/Text-Tool-Trace und keine Abnahme der lokalen Folgekorrektur |
| Lokale Installation in nativem Codex 0.160.0 | Exakt sieben kanonische Dateien installiert und aktiviert; App-Server `skills/list` erkennt den Coach |
| Codex-Git-Update in isoliertem Loopback-Repository | Installierte Dateien sofort aktualisiert, einschließlich synthetischer Versionserhöhung; Test-Fixture anschließend entfernt |
| Manuelles Git-Update auf dem Desktop | Owner berichtet, dass das manuelle Marketplace-Update beim Wechsel auf 1.1.2 funktioniert; kein korrelierter Trace zu installierter Version/Tools |
| Automatische Git-Updates auf dem Desktop | Owner beobachtete beim Wechsel auf 1.1.2 kein automatisches Update. Automatische Ersetzung bleibt unabgenommen; dies belegt nicht, dass automatische Updates niemals stattfinden |
| Desktop-OAuth-/Tool-Trace, gespeicherter Lernfortschritt, Fortsetzung und Erneuerung | Produktions-Trace bestätigt erfolgreiche Kontexte, Mastery-Persistenz und zwei Renderer-Aufrufe; Owner ordnet den letzten Renderer Voice zu. Clientseitig sichtbares Folgebild, vollständige OAuth-/Erneuerungsabnahme und die lokale Korrektur bleiben unabgenommen |
| ChatGPT Web und native Mobile-Apps | Unabgenommen; nicht als unterstützte Beta-Oberflächen angeboten |

Die lokalen Belege liegen im von Git ignorierten Verzeichnis
`tmp/skillpilot-openai-deploy-4qe82egm/receipt/`. Sie verwenden synthetische Update-Fixtures
und enthalten keine produktive Lernenden-Capability. Sie sind lokale Nachweise,
kein Directory-Release und kein bestandener Desktop-Lernablauf.

### Lokaler Fortsetzungskandidat 1.1.3 — 19. Oktober 2026

Der Owner meldet drei Fehler in einer neuen ChatGPT-Coaching-Sitzung: Das zweite
Lernzielbild fehlt in Voice, der Coach fragt nach gespeicherter Mastery trotz eines
bereits ausgewählten Nachfolgeziels nach einer freien Themenwahl, und eine vorgeschlagene nächste
Nachricht liefert bereits die Antwort auf die Frage des Coachs.

Der anschließend bereitgestellte Produktions-Trace vom **19. Oktober** klärt die fehlende
Server-Evidenz für diesen neuen Versuch. Unter Backend-Build `fd1f419769c9…`
gelingt die Mastery-Speicherung um **11:50:26.927 UTC**, erhöht State 141 auf 142 und löst
`LEARNING_PLAN_AUTO_HANDOFF` aus. Ein frischer Kontext um **11:51:25.999 UTC** bietet weiterhin
das Bild an. Um **11:51:35.894 UTC** schließt der Nachfolge-Renderer für
dieselbe pseudonymisierte Sitzung und State 142 erfolgreich ab. Um **11:51:30.865 UTC**, während der
Renderer noch lief, lieferte der Server erfolgreich die korrigierte aktive UI
`08030bd956b6` aus; spätere Lesezugriffe liefern denselben Hash. Ressourcen-Lesezugriffe selbst besitzen
keinen Sitzungskorrelator und beweisen weder die Komponentenausführung noch die Anzeige.

Die korrigierte Ressource ist damit deployt und wird ausgeliefert; ein ausgelassener
Nachfolge-Renderer erklärt diesen Versuch nicht. Das gemeldete zweite Lernziel
besitzt zudem sein kanonisches Bild und das öffentliche Asset liefert HTTP 200. Der Wert
`goalVisualizationOffered=false` in der Renderer-Quittung ist erwartungsgemäß: Dieses Flag
beschreibt die Bildautorisierung in vollständigen Kontexten, nicht den Erfolg der Bildanzeige.
Die begleitenden MCP-`401`- und `notifications/initialized`-Warnungen begründen
keine Ursache für die fehlende Anzeige des späteren erfolgreichen Renderers.
Client-Empfang, Komponenten-Events, Bildladen und sichtbare Anzeige bleiben
unbeobachtet. Dies ist ein neuer Nachweis, getrennt vom Vorfall am 5. Oktober.

Die lokale Lebenszyklus-Analyse und die Reproduktion mit dem gebündelten SDK zeigten außerdem eine bedingte
Race-Condition: Schlägt der Standard-UI-Handshake fehl, bevor ein verzögertes ChatGPT-Kompatibilitätsergebnis
eintrifft, fordert das Widget das Schließen an, obwohl dieser Ergebniskanal
das Bild noch ausliefern könnte. Der Produktions-Trace zeigt keinen
solchen Handshake-Fehler; fünf Sekunden Tool-Latenz allein erreichen nicht das
60-Sekunden-Timeout des SDKs. Die lokale Korrektur in 1.1.3 hält diesen verborgenen Kompatibilitätskanal
nun für ein verzögertes Ergebnis empfangsbereit; tatsächliche Bildfehler schließen die UI weiterhin.
Ihre neue Ressource ist `9c09821e96ab…`; die deployten `08030…`-Bytes bleiben
unverändert erhalten. Dies ist weder eine nachgewiesene Ursache noch eine bestätigte Host-Behebung für den
Voice-Vorfall. Hier werden keine rohen
Sitzungskorrelatoren, Lernenden-Capabilities oder Chat-Auszüge gespeichert.

Kandidat **1.1.3** entfernt das widprüchliche Verbot, ein ausgewähltes Nachfolgeziel
vor der Fortsetzung zu benennen: Nach bestätigter Mastery wird dessen exakter Titel angeboten, auf
die lernende Person gewartet und erst danach gerendert und unterrichtet. Zudem untersagt er vom Coach formulierte antwortgebende
Antwortvorschläge und wahrt unabhängige Mastery-Nachweise. Das reine Bild-Widget
verfasst keine Folgenachrichten;
die aktuelle [OpenAI-Komponentenreferenz](https://developers.openai.com/apps-sdk/reference)
dokumentiert zwar von Komponenten verfasste Nachrichten, jedoch keine hier genutzte Steuerung zum Deaktivieren
der ChatGPT-eigenen Antwortvorschläge. Die Unterdrückung dieser Vorschläge und die
Voice-Bildsequenz erfordern weiterhin eine tatsächliche Host-Verifikation.

Die Deployment-Modernisierung vom 19. Oktober erzeugt zusätzlich das dokumentierte
Einreichungs-ZIP mit aktuellen Review-Feldern und aus den kanonischen Quellen abgeleiteten Release-Notes.
Der Git-Import bleibt ausschließlich für Desktop bestimmt; der öffentliche Remote-MCP-Directory-Weg
adressiert zusätzlich Web und Mobile. Der lokale Chromium-Bild-Smoke-Test
lief bei 1280, 390 und 320 Pixeln erfolgreich durch – jeweils mit zwei aufeinanderfolgenden Bildern sowohl nach
normalem Start als auch nach abgelehnter Standardinitialisierung. Dies ist ein Nachweis mit responsiven
Test-Fixtures, keine Abnahme auf ChatGPT Web, iOS oder Android. Siehe das
[aktuelle Deployment-Runbook](openai-plugin-v1-release.md#11-zieloberflächen-und-der-aktuelle-zip-weg)
und die [Bewertung zu Major-Versionen](../concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md#neubewertung-vom-19-oktober-2026-eine-dauerhafte-plugin-identität).

Dies ist eine lokale Vorbereitung – kein Git-Rollout, kein Backend-Deployment, keine Portal-Einreichung
und keine Client-Abnahme. Bewahren Sie die veröffentlichten Installations-Bytes von 1.1.2
sowie alle früheren Entwürfe unverändert auf.

### Dokumentiertes Git-Deployment 1.1.1

Veröffentlicht am **5. Oktober 2026** als Commit
[`358ee9c02efa5b072b41b90ce2f09c181f0bb693`](https://github.com/enpasos/skillpilot-chatgpt-marketplace/commit/358ee9c02efa5b072b41b90ce2f09c181f0bb693)
auf `main`, mit Paket-Digest
`6056eddba3287f85a4a292da52a97b60f6042dd01373c19ca79e58f2f9ba42c8`.
Ein frischer öffentlicher Klon bestand die byte-exakte kanonische Verifikation sowie seinen eigenen
Validator. [GitHub-Validierungslauf 37271037379](https://github.com/enpasos/skillpilot-chatgpt-marketplace/actions/runs/37271037379)
wurde erfolgreich abgeschlossen. Das Update führte ein Fast-Forward des ursprünglichen `main`-Branches durch und änderte
sechs Dateien; das alte annotierte Tag `v1.1.0` löst weiterhin auf seinen ursprünglichen Commit auf.
Es wurde kein Tag `v1.1.1` angelegt; der vollständige obige Commit ist die unveränderliche Referenz.
Die exportierten Abnahmefelder bleiben ausstehend. Dies dokumentiert das Git-Deployment,
nicht eine Desktop-Installation oder eine Veröffentlichung im OpenAI-Portal.

Das zuvor veröffentlichte Git-Release **1.1.0** bleibt unveränderlich: Commit
[`7b184ca44675a6fc20ced73cb30a3ad2958c356f`](https://github.com/enpasos/skillpilot-chatgpt-marketplace/commit/7b184ca44675a6fc20ced73cb30a3ad2958c356f),
annotiertes Tag `v1.1.0`, Paket-Digest
`15508140a3770e21896554c1aececf78a2fc421531e5f316fc16ffb101045843` sowie erfolgreicher
[Validierungslauf 34681183427](https://github.com/enpasos/skillpilot-chatgpt-marketplace/actions/runs/34681183427).
Liefern Sie unter dieser veröffentlichten Version niemals abweichende Bytes aus. Der aktuelle Patch
übernimmt die bereits im Quellstand vorhandenen kanonischen Datenschutz-/Coaching-Korrekturen.

Der Product Owner bestätigte anschließend am **5. Oktober 2026**, dass der veröffentlichte Git-/Desktop-Weg und
der korrigierte Lernstart funktionieren, und forderte diesen Weg über die reguläre
GUI **Lernen starten** sowie aktuelle ChatGPT-Hinweise an. Regulärer
Start und Cockpit-Navigation bieten nun die Provider-Auswahl ohne Test-Query-Parameter an.
Das Produktions-Deployment der GUI wird getrennt von dieser Owner-Rückmeldung verfolgt.
Lassen Sie die ursprünglichen Export-Abnahmefelder unverändert; die Bestätigung ergänzt
hier den Nachweis, ohne den veröffentlichten Kandidaten oder dessen Beleg umzuschreiben.

### Dokumentiertes Git-Deployment 1.1.2

Nachdem die lokalen Prüfungen bestanden waren, forderte der Product Owner ausdrücklich den sofortigen
Marketplace-Rollout an. Veröffentlicht am **5. Oktober 2026** als Commit
[`cf5e23a7908412f3f28a1a66485d0e106c346154`](https://github.com/enpasos/skillpilot-chatgpt-marketplace/commit/cf5e23a7908412f3f28a1a66485d0e106c346154)
auf `main`, mit Paket-Digest
`8a301fecdaf55de09cd39c9d8ba18191512aef7b1f910efaf2e75501e3274982`.
Ein frischer öffentlicher Klon stimmte mit sämtlichen kanonischen Export-Bytes überein und bestand seinen eigenständigen
Validator. [GitHub-Validierungslauf 37300661165](https://github.com/enpasos/skillpilot-chatgpt-marketplace/actions/runs/37300661165)
wurde erfolgreich abgeschlossen. Das Update führte ein Fast-Forward gegenüber `1.1.1` durch, bewahrte dessen Commit
sowie das ursprüngliche Tag `v1.1.0` und änderte lediglich Paketmanifest, README,
Changelog und Inventar. Es wurde kein Tag `v1.1.2` angelegt; nutzen Sie den vollständigen Commit als
unveränderliche Referenz.

Die lokale Validierung bestand **55 OpenAI-App-Tests**, **55 Backend-Tests** (einschließlich
Basic-/nativer CIMD-Flows und Provider-Differenzialverträgen), **96 Release-/Einreichungs-/Marketplace-Tests**,
Frontend-FAQ-Prüfungen sowie das statische mTLS-Gate.
Die für den Rollout 1.1.2 vorbereitete Timeout-korrigierte Bildressource ist an den
SHA-256-Wert
`12762009bd8e00c392e06aefac685e17653f50a5e7efeb21f865429a9fab641e` gebunden.
Die Git-Veröffentlichung deployt weder diese Backend-Ressource noch führt sie eine OpenAI-Portal-Einreichung
durch oder begründet eine Abnahme der Desktop-/Voice-Bildsequenz. Die exportierten
Host-Abnahmefelder bleiben ausstehend. Bewahren Sie die lokalen Vorbereitungsbelege
als Nachweis vor der Veröffentlichung auf, statt sie umzuschreiben.

### Lokale Bildladekorrektur 1.1.2

Der anschließende Test des Owners nutzte **Windows ChatGPT Desktop, Work, Voice**.
Das Lernen und das Speichern von Erfolgen schienen zu funktionieren, es wurde jedoch nur das erste Lernbild
angezeigt. Der Owner bestätigte, dass das spätere Bild im
Cockpit verfügbar ist. Es handelt sich um eine Untersuchung der Anzeige, nicht um einen Hinweis auf ein fehlendes
Curriculum-Bild. Der Bericht belegt weder, ob das spätere Renderer-Tool
aufgerufen wurde, noch wie lange die Übertragung seiner Ressource bzw. seines Bildes dauerte.

Im wiederholten Windows-Desktop-Test am **5. Oktober 2026** berichtet der Owner, dass
das manuelle Marketplace-Update funktioniert; beim Wechsel auf **1.1.2** wurde kein automatisches Update
beobachtet. Auch im wiederholten **Work/Voice**-Test fehlten neue
Lernzielbilder, während das Cockpit gespeicherte Lernziele und Folgebilder zeigte.
Dies begründet weder eine erfolgreiche Host-Abnahme der Timeout-Korrektur
noch ein generelles Ausbleiben automatischer Updates. Eine Neuinstallation, ein frischer Chat,
der tatsächlich genutzte MCP-Ressourcen-Hash sowie korrelierte Tool-/Anzeige-Traces bleiben
für diesen Nachtest unbestätigt. Der öffentliche `/version.json`-Nachweis identifiziert lediglich die GUI-Revision; er
identifiziert nicht die vom Desktop-Chat geladene MCP-Ressource.

Der Owner testete anschließend ohne Voice und berichtet, dass der Bildablauf
funktioniert. Dies grenzt den beobachteten Fehler auf den Voice-Workflow ein; es
klärt jedoch nicht, ob Voice den Nachfolge-Renderer ausgelassen hat oder ob dessen Host die
UI nach einem erfolgreichen Aufruf nicht dargestellt hat. Der begleitende Text ist die bestehende Commit-Beschreibung
der Timeout-Korrektur, kein Laufzeit-Trace. Zum Zeitpunkt dieser Prüfung meldet die öffentliche GUI weiterhin
`0af05906c8dfa4c62212b6600759c37f902211c6`; die nachfolgend beschriebene Kompatibilitätskorrektur
bleibt lokal und wurde noch nicht deployt.

Der Owner stellte für den **5. Oktober 2026** zunächst einen gefilterten Produktions-MCP-Trace und danach einen erweiterten Trace
bereit und bestätigte, dass der letzte Renderer-Aufruf zum
fehlerhaften **Voice**-Ablauf gehörte. Die untenstehenden Zeiten sind Abschlusszeiten im Server-Log in **UTC**
(die deutsche Ortszeit liegt zwei Stunden später):

| Zeit | Server-Nachweis |
| --- | --- |
| 15:31:40 | Erfolgreicher Kontext bei State 132 bietet eine Visualisierung an |
| 15:32:00 | Erfolgreicher initialer Aufruf von `render_skillpilot_goal_visualization` bei State 132, `resultCode=OK` |
| 15:35:03–15:42:17 | Fünf weitere erfolgreiche Kontext-Aufrufe bei State 132, die jeweils eine Visualisierung anbieten |
| 15:42:39 | Erfolgreiches Schreiben der Mastery setzt dieselbe pseudonymisierte Sitzung auf State 133 fort und liefert einen Nachfolgekontext, der eine Visualisierung anbietet |
| 15:43:19 | Erfolgreicher frischer Kontext bei State 133 bietet eine Visualisierung an |
| 15:43:32 | Erfolgreicher Nachfolgeaufruf von `render_skillpilot_goal_visualization` bei State 133, `resultCode=OK`; Owner bestätigt Voice und meldet das fehlende Folgebild |
| 15:31:53–15:55:00 | Acht erfolgreiche Ressourcen-Lesezugriffe liefern `12762009bd8e`, aktiv in Server-Build `0af05906c8dfa4c62212b6600759c37f902211c6` |

Jeder protokollierte Tool-Aufruf war erfolgreich. Der Wert `goalVisualizationOffered=false` des Renderers
ist erwartungsgemäß: Seine Darstellungsquittung ist kein vollständiger Kontext, der ein weiteres
Bild anbietet. Seine Laufzeit von 6.925 ms legt den ungefähren Server-Eintritt auf **15:43:25.794**,
sodass der Ressourcen-Lesezugriff um **15:43:25.869** stattfand, während das Nachfolge-Tool
noch lief, und nicht vor dem Aufruf. Weder diese Reihenfolge noch ein erfolgreicher Ressourcen-Lesezugriff
beweist die Komponentenausführung, das Laden des Bildes oder die Anzeige. Ressourcen-Lesezugriffe besitzen keinen
Sitzungskorrelator. Wiederholte Kontextangebote allein verlangen kein erneutes Rendern
eines bereits gezeigten Paares `(goalId, stateVersion)`.

Der Trace bestätigt, dass das deployte Backend weiterhin die vorherige Ressource auslieferte;
er zeigt nicht die lokale Korrektur `08030bd956b6`. Die Unterscheidung zwischen Voice und Text wird in der
Server-Telemetrie nicht erfasst; diese Zuordnung für den letzten Renderer-Aufruf stammt vom Owner.
Damit scheidet ein fehlender Nachfolge-Renderer als Erklärung
für diesen Voice-Vorfall aus. Der ungelöste Fehler liegt nach dem erfolgreichen
Server-Aufruf: Client-Empfang, der tatsächliche UI-Event-Kanal, das Laden des Bildes und
die sichtbare Darstellung bleiben unbeobachtet. Die früheren MCP-`401`-Warnungen und Warnungen über einen fehlenden
`notifications/initialized`-Handler begründen keine Ursache für
das fehlende Bild des späteren erfolgreichen Renderers; die serverseitige Benachrichtigung
ist kein Komponenten-UI-Handshake-Trace. Aus diesen Zeilen folgt keine weitere Code- oder
Authentifizierungsänderung. Deployen Sie zuerst die bereits getestete lokale Korrektur
und verifizieren Sie deren neue Ressource, bevor ein weiterer Defekt diagnostiziert wird. Bewahren Sie die
Moduszuordnung und die Trennung zwischen Server-Erfolg und sichtbarem Ergebnis, ohne den
Sitzungs-Fingerprint, die Request-UUID oder rohe Lernendendaten im Repository abzulegen.

Ein Vergleich mit dem aktuellen **Claude 1.1.12** ergab einen konkreten Unterschied:
Claudes Korrektur vom 30. September, Commit `a85246ff36c`, hält ausstehende Renderer offen, sodass
spät eintreffende Tool-Ergebnisse und Bilder noch angezeigt werden können. Vor der Korrektur
forderte der OpenAI-Renderer nach 10 Sekunden ohne Ergebnis oder
15 Sekunden ohne Bild das Schließen durch den Host an und verwarf das ausstehende Bild. Ein Host, der dem
Schließwunsch folgt, kann spätere Ergebnisse verwerfen. Der lokale Kandidat **1.1.2** entfernt diese
Timeout-Schließungen, hält ausstehende Inhalte verborgen, dedupliziert identische
Ergebnisse, ignoriert ungültige Ergebnisse und schließt bei fehlgeschlagener Initialisierung oder
Bildfehlern. Jede bereits beworbene inhaltsadressierte Ressource behält ihre exakten
Bytes; der korrigierte Renderer erhält einen neuen Ressourcen-Hash.

Die lokale Regressionsabdeckung prüft verzögerte Ergebnisse/Bilder und die aufeinanderfolgende
Bildauslieferung über die gebündelte MCP-Apps-Bridge. Backend-Tests prüfen den vollständigen
Nachfolgekontext nach gespeicherter Mastery sowohl für Basic-OAuth als auch für natives CIMD-OAuth.
Beides beweist nicht, dass der gemeldete Vorfall auf dem Windows-Host vollständig behoben ist. Auch für Claude
selbst steht die kandidatenspezifische Zwei-Bilder-Host-Abnahme noch aus; dessen
lokale Implementierung dient als Vergleichsbasis, nicht als ChatGPT-Host-Nachweis.

Für den Rollout durch den Owner sind das passende Backend samt Ressource zu deployen und das Git-Plugin
auf **1.1.2** zu aktualisieren, anschließend die installierte Version zu prüfen und ein frischer ChatGPT-Start
in **Work** zu verwenden. Zu prüfen sind: erstes Bild, gespeicherter Erfolg, ausdrückliche Zustimmung
zum Fortfahren und das nächste Bild im selben Voice-Chat. Fehlt das Bild weiterhin,
ist zwischen einem fehlenden Renderer-Aufruf und einem erfolgreichen Renderer-Aufruf,
dessen UI nie sichtbar wird, zu unterscheiden. Halten Sie sämtliche Tool-/Status-Nachweise bereinigt; nehmen Sie
weder Chat-Text noch Tokens oder Lernsitzungs-Capabilities auf. Das oben dokumentierte
Git-Deployment ändert keine Produktionsserver-Einstellung.

### Nachgelagerte lokale Backend-/Widget-Korrektur

Der wiederholte Bericht des Owners allein klärte noch nicht, ob der zweite Renderer
aufgerufen wurde; der erweiterte Trace und die obige Zuordnung durch den Owner bestätigen nun, dass er
in Voice erfolgreich aufgerufen wurde, während das Folgebild fehlte.
Die Überprüfung von Backend und Coach-Instruktionen ergab keine Beschränkung auf nur das erste Bild:
Jedes neue zulässige Paar `(goalId, stateVersion)` bleibt nach der
Fortsetzung durch die lernende Person berechtigt. Bestehende datenschutzkonforme MCP-Logs unterscheiden zwischen einem Kontext,
der ein Bild anbietet, dem tatsächlichen Render-Aufruf samt Status und dem Lesezugriff auf die aktive oder
beibehaltene UI-Ressource. Auch ein erfolgreicher Render-Aufruf beweist noch keine Anzeige.

Lokale Reproduktionen deckten zwei konkrete Widget-Fehler auf. Ein Nachfolgeergebnis, das ausschließlich
über ChatGPTs dokumentierte `toolResponseMetadata` geliefert wurde, blieb unbeachtet – einschließlich der
Umschläge `mcp_tool_result` und `call_tool_result.result`. Außerdem konnte ein verspätet eintreffender persistierter
`widgetState` das erste Bild über ein neueres natives Ergebnis zurückschreiben.
Die Korrektur liest klar abgegrenzte bekannte Ergebnisumschläge, wendet Live-Event-Ergebnisse
vor jedem Bootstrap-Zustand an und lässt niemals zu, dass persistierter Zustand oder veraltete Window-Snapshots
ein Live-Ergebnis überschreiben. Validierung, Duplikatbehandlung,
Verhalten bei verzögerten Bildern sowie der vollständige Text-Coaching-Pfad bleiben erhalten. Claudes aktueller
Renderer nutzt den nativen MCP-Apps-Kanal und besitzt keinen ChatGPT-Kompatibilitäts-Snapshot-Pfad;
sein Verhalten beweist keine ChatGPT-Host-Abnahme.
[Referenz zur OpenAI-Komponenten-Bridge](https://developers.openai.com/plugins/reference#windowopenai-component-bridge)

Die neue lokale Backend-Ressource besitzt den SHA-256-Wert
`08030bd956b68b816523f4971b6d18ab154eef01381882b01d7f1991cc643391`.
Die zuvor beworbene Ressource `12762009...` bleibt byte-identisch
als aufbewahrte Historie registriert. Dies erfordert einen Backend-Rollout durch den Owner; es ändert
weder die sieben veröffentlichten Git-Installationsdateien von **1.1.2**, noch veröffentlicht es ein weiteres Git-Release
oder reicht etwas im OpenAI-Portal ein. Der unveröffentlichte Portal-Entwurf wird aktualisiert,
um die aktuellen Backend-Ressourcen zu beschreiben. Der ursächliche Zusammenhang zwischen dem tatsächlichen Voice-Symptom
und diesen lokalen Fehlern sowie eine erfolgreiche Zwei-Bilder-Host-Abnahme bleiben offen.

Die lokale Validierung dieser Folgekorrektur bestand **66 App-Tests**, einschließlich kanalübergreifender
Auslieferung mit dem echten SDK, **77 Backend-Tests** für Ressourcen, Telemetrie und den
Claude-/OpenAI-Differenzialvertrag sowie **65 Release-/Kandidaten-/Marketplace-Tests**.
Versionierung, historische Review-Nachweise und die exakte Prüfung des unveröffentlichten Entwurfs
waren ebenfalls erfolgreich. Diese Prüfungen sind lokal und stellen keine neue Desktop-Abnahme dar.

Nutzen Sie nach dem Backend-Rollout durch den Owner einen frisch über SkillPilot gestarteten Work-Chat mit
dem bereits veröffentlichten Plugin **1.1.2**. Prüfen Sie das erste Bild, den gespeicherten Erfolg,
die ausdrückliche Zustimmung zum Fortfahren und das nächste Bild. Schlägt dies weiterhin fehl, bewahren Sie
ausschließlich bereinigte Tool-/Status-Nachweise auf: ob der frische Kontext ein
Bild angeboten hat, ob `render_skillpilot_goal_visualization` erfolgreich lief und
ob der Host `uiArtifact=08030bd956b6 artifactRole=active` oder beibehaltene
ältere Bytes gelesen hat. Beenden Sie zum gezielten Vergleich Voice und fordern Sie im selben Chat ausdrücklich das
aktuelle Lernzielbild an; halten Sie fest, ob sich Tool-Aufruf und
Anzeige unterscheiden. Weder Lernenden-Capabilities noch Tokens, permanente SkillPilot-IDs oder Chat-Inhalte
gehören in diesen Nachweis.

Erfassen Sie für ein kurzes passendes Voice-Testfenster die vorhandene Server-Telemetrie:

```bash
journalctl -u skillpilot --since "30 minutes ago" --no-pager -o short-iso |
  grep -E 'OpenAI Coach V1 MCP V1 (tool invocation|resource read)'
```

Korrelieren Sie Kontext- und Render-Aufrufe anhand von Zeitstempel, `learningSessionHash` und
`stateVersion`. Prüfen Sie `goalVisualizationOffered=true` im vollständigen Kontext oder
Nachfolgeergebnis; die Darstellungsquittung des Renderers bietet selbst kein weiteres
Bild an und protokolliert dieses Flag regulär als `false`. Ressourcen-Lesezugriffe besitzen
keinen Sitzungs-/Request-Korrelator und können vom Host zwischengespeichert werden; weder ihr
Zeitpunkt noch das Ausbleiben eines frischen Lesezugriffs beweist daher, welche Bytes ein bestimmter Chat angezeigt hat.
Vergleichen Sie den Hash mit `serverBuild`: `artifactRole=active` bezieht sich auf den jeweiligen
Server-Build, sodass der frühere Build zu Recht `12762009...` als aktiv bezeichnet, während
der lokale Folge-Build `08030bd956b6` als aktiv ausweist.
Halten Sie das vom Owner berichtete sichtbare Ergebnis strikt getrennt von jedem Server-Erfolg.

## Tester-Durchlauf: Windows ChatGPT Desktop

1. Fügen Sie unter **Plugins → Hinzufügen → Marketplace hinzufügen** die Adresse
   `https://github.com/enpasos/skillpilot-chatgpt-marketplace` hinzu.
2. Öffnen Sie `skillpilot-chatgpt-marketplace` und installieren Sie **SkillPilot Coach v1**;
   prüfen Sie Version **1.1.2** sowie den aktivierten Coach-Skill. Vermeiden Sie es, die Archivkopie
   und die Marketplace-Kopie gleichzeitig im selben Chat zu aktivieren.
3. Verbinden Sie das Plugin über den Authentifizierungsfluss des Hosts. Das fixierte native
   CIMD-Profil nutzt S256-PKCE und übermittelt kein Operator-/Client-Secret. Wählen Sie Auto
   oder CIMD, falls diese Auswahl angezeigt wird. Dokumentieren Sie bereinigte Fehler samt Host/Version
   und Zeitstempel, anstatt Authentifizierungsregeln zu ändern.
4. Nutzen Sie den regulären Einstieg **Lernen starten** in SkillPilot oder kehren Sie aus dem
   Cockpit dorthin zurück. Laden Sie den Lernstand, schließen Sie die Konfiguration ab und wählen Sie
   **ChatGPT Desktop (Beta)**. Wählen Sie **Lernen mit ChatGPT vorbereiten** und kopieren Sie
   die gesamte Nachricht unverändert in einen **neuen Desktop-Chat**, in dem dieses Plugin
   aktiviert ist. `?coach=chatgpt-desktop` wählt den Provider optional vorab aus;
   `?chatgptTest=1` bleibt in der aktualisierten GUI eine kompatible Vorauswahl ohne separates
   Startfeld. Bis der Owner diese GUI deployt, erreicht der bisherige Query-Parameter
   weiterhin die zuvor verfügbare OpenAI-Testübergabe.
5. Prüfen Sie einen echten Aufruf von `get_skillpilot_context`, den erwarteten Lernstand/die erwartete Sprache,
   einen repräsentativen Lerndurchlauf, gespeicherten Fortschritt, Fortsetzung und Token-Erneuerung.
   Binden Sie die Nachweise an den exakten Host, das Paket und den Marketplace-Commit.

Ein für Claude erzeugter Start nutzt den Claude-Launch-Endpunkt und kann kein
Lernen über OpenAI autorisieren. Die GUI ruft `/openai/v1/launch` für ChatGPT und
`/claude/v1/launch` für Claude auf. Ein Wechsel des Providers macht einen vorbereiteten Start ungültig.
Die OAuth-Verbindung und die Lern-Capability bleiben getrennte Berechtigungsnachweise.
Veröffentlichen Sie weder einen dieser Nachweise noch eine permanente SkillPilot-ID in öffentlichen Belegen.

Für eine unterstützte Codex-CLI in der nativen Umgebung des vorgesehenen Clients:

```bash
codex plugin marketplace add https://github.com/enpasos/skillpilot-chatgpt-marketplace --ref main
codex plugin add skillpilot-coach-v1@skillpilot-chatgpt-marketplace
codex plugin marketplace upgrade skillpilot-chatgpt-marketplace
```

Prüfen Sie nach der Aktualisierung die installierte Version und starten Sie einen neuen Chat. Native Windows-
und WSL-Installationen können getrennte Konfigurationsverzeichnisse verwenden. Die lokale Aktualisierung per CLI
wurde getestet, und der Owner berichtet von einem funktionierenden manuellen Desktop-Marketplace-Update
auf 1.1.2. Bei diesem Übergang wurde kein automatisches Update beobachtet; für automatische
Updates in ChatGPT Desktop stehen Abnahmenachweise weiterhin aus.
Siehe [OpenAI-Paketierung](https://developers.openai.com/plugins/build/plugins),
[Plugin-Befehle](https://learn.chatgpt.com/docs/developer-commands#codex-plugin)
und [Windows-/WSL-Konfiguration](https://learn.chatgpt.com/docs/windows/windows-app#share-config-auth-and-sessions-with-wsl).

## Reproduzierbare Vorbereitung und Veröffentlichung

Die einzige bearbeitbare Coach-Quelle ist `ai/openai plugin/skillpilot-coach-v1/`.
Der Exporter kopiert exakt sieben versionierte Installationsdateien zuzüglich Katalog,
Validator, CI, Dokumentation, Lizenz und SHA-256-Inventar. Nehmen Sie niemals
Portal-Exporte, Zugangsdaten, private Lernendendaten oder eine zweite bearbeitbare Skill-Kopie auf.

```bash
node --test scripts/openai_marketplace_release.test.mjs
node scripts/openai_marketplace_release.mjs check
marketplace_export_dir=$(mktemp -d /tmp/skillpilot-chatgpt-marketplace.XXXXXXXX)
node scripts/openai_marketplace_release.mjs prepare --output "$marketplace_export_dir"
node scripts/openai_marketplace_release.mjs verify --output "$marketplace_export_dir"
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_versioning.mjs
git diff --check
```

`prepare` verlangt ein leeres Zielverzeichnis; `verify` vergleicht jedes exportierte Byte
mit den aktuellen kanonischen Eingaben. Dokumentieren Sie bei einem lokal modifizierten Build
die Quellrevision und den Quell-Diff. Jede Änderung der Eingaben erfordert einen frischen Export. Die
Quelldatei `.github/workflows/openai-marketplace.yml` stellt diese Strecke über
manuelles `workflow_dispatch` bereit; das exportierte Repository validiert Pushes und PRs.

Veröffentlichen Sie bei einem autorisierten Git-Deployment den verifizierten Export ohne
Force-Push, bewahren Sie unabhängige Remote-Inhalte sowie das alte Tag, prüfen Sie anschließend einen
frischen öffentlichen Klon gegen den Export und dokumentieren Sie das GitHub-Validierungsergebnis.
Neue unveränderliche Releases sollten eine neue Version und ein neues Tag verwenden. Führen Sie niemals
`record-published` für ein Git-Beta-Update aus: Dieser Befehl gehört ausschließlich zur tatsächlichen
Veröffentlichung im OpenAI-Portal. Paketprüfungen ersetzen keine echte Host-Abnahme.

## Sicherheits- und Abnahmegrenzen

Verwenden Sie den bestehenden Endpunkt `https://mcp-coach-v1.skillpilot.com/mcp` und den bestehenden OAuth-Issuer.
Natives öffentliches CIMD ist ein exakt fixiertes Client-Profil und niemals ein Fallback
nach fehlgeschlagener gehosteter vertraulicher Authentifizierung. Gültiges OAuth und eine unabhängige
providerspezifische Lernsitzungs-Autorisierung bleiben verpflichtend. Der erste
native Test darf das bereits autorisierte mTLS `observe` nutzen; dieses Git-Update
ändert keine Servereinstellung. Siehe [natives CIMD](openai-native-cimd.md).

Dokumentieren Sie Desktop-Git-Installation, Verbindung, tatsächliche Tool-Aufrufe, vollständigen Lernablauf,
Token-Erneuerung und Update-Ergebnisse jeweils getrennt. Schließen Sie aus einem synchronisierten Chat, einer Archivinstallation,
einem Claude-Ablauf oder einem lokalen CLI-Test weder auf Web-/Mobile-Unterstützung noch auf
eine Abnahme mit unabhängigem Konto. Die nachfolgenden Notizen vom September bleiben Historie;
deren damalige Transport-Blocker und Distributionspause übersteuern nicht die
spätere ausdrückliche Autorisierung für den nativen Desktop-/Git-Weg.

## Historisches Experiment mit registrierter App (vor Installation abgebrochen)

**Abgelöst am 12. September 2026:** Nach Bereitstellung des App-Links stellte der Product
Owner klar, dass die Beta-Installation von Grund auf funktionieren muss und nicht von
einer reparierten oder zuvor konfigurierten persönlichen App abhängen darf. Die nachfolgend beschriebene lokale Probe
bleibt ausschließlich als diagnostische Vorarbeit erhalten. Installieren oder veröffentlichen Sie sie nicht als
Beta-Lösung. Sie wurde weder installiert noch verbunden oder veröffentlicht.

Am **12. September 2026** stimmte der Product Owner zu, ein separates
Git-Marketplace-Paket zu untersuchen, das auf eine registrierte OpenAI-MCP-App verweist. Ziel war es,
über Git ausgelieferte Skill-Updates beizubehalten und zugleich die Produktionssicherheitskette
zu durchlaufen. Dies war keine Entscheidung, den veröffentlichten Direkt-MCP-Kandidaten zu ersetzen,
ein weiteres Paket zu veröffentlichen, Zugangsdaten zu ändern oder die Authentifizierung abzuschwächen.

Der erste Direkt-MCP-Versuch in Windows ChatGPT **26.901.51231** endete noch vor
OAuth: Die Produktions-Edge protokollierte `403 / certificate_required` um
**08:36:11, 08:38:14 und 08:38:24 UTC**. Diese Beobachtungen belegen, dass diese
Anfragen kein Client-Zertifikat mitlieferten; sie belegen nicht, dass jeder
Git-Marketplace-Transport grundsätzlich inkompatibel mit mTLS ist.

Die vorgeschlagene Alternative sah folgende getrennte Verantwortlichkeiten vor:

| Komponente | Verantwortlichkeit |
| --- | --- |
| Git-Marketplace | Verteilung des Plugins, der kanonischen Skills und der Assets |
| Plugin-`.app.json` | Referenz auf die explizit ausgewählte registrierte App |
| Registrierte OpenAI-App-Verbindung | Bereitstellung des gehosteten MCP-Transports und der OAuth-Verbindung |
| Produktions-Edge und Backend von SkillPilot | Durchsetzung von mTLS, OAuth und unabhängiger Lernsitzungs-Autorisierung |

OpenAI dokumentiert `.app.json`-Referenzen auf bestehende Apps sowie sein verwaltetes MCP-Client-Zertifikat.
Das Zusammenspiel erfordert dennoch echte Host-Nachweise; eine App-Referenz
allein beweist nicht, dass eine Anfrage tatsächlich dieses Zertifikat nutzt.
[OpenAI: Referenzen auf bestehende Apps](https://learn.chatgpt.com/docs/enterprise/plugin-management#reference-an-existing-app-with-appjson),
[OpenAI: mTLS](https://developers.openai.com/plugins/build/auth#mutual-tls-mtls)

Die ursprünglich vorgeschlagene Diagnosesequenz lautete:

1. Den Link zur Detailseite der **aktuellen** registrierten SkillPilot-App vom
   Owner einholen und die vorgesehene Verbindung bestätigen. Keine ID aus einem alten
   Screenshot oder einer gelöschten Verbindung wiederverwenden. Das Paket nutzt die App-ID, nicht den
   `plugin_`-Wrapper aus der Detailseiten-URL. Weder ein Client-Secret noch eine Lernsitzung
   gehören in diese Eingabe oder in das Paket.
2. Einen isolierten Kandidaten mit eigener Test-Identität vorbereiten.
   `SKILL.md`, `references/coaching-policy.md` und Bild-Assets byte-identisch
   aus der kanonischen Quelle ableiten. Den direkten MCP-`dependencies`-Eintrag aus
   der experimentellen `agents/openai.yaml` entfernen, deren Interface und Policy jedoch beibehalten;
   andernfalls deklariert sie weiterhin einen zweiten HTTP-Transport. `.app.json` und eine
   Manifest-`apps`-Referenz verwenden, **ohne** direkte `.mcp.json`- oder `mcpServers`-Deklaration.
   Den bestehenden Direkt-Exporter, seine negativen App-Referenz-Tests,
   das veröffentlichte `v1.1.0` sowie die öffentliche Einreichungsquelle unverändert lassen.
3. Den tatsächlichen Host des Owners gegen den **unveränderten Produktionsendpunkt** testen.
   Einen erfolgreichen Tool-Request mit `VERIFIED`-Transport und dem
   konfigurierten OAuth-Profil korrelieren. Eine erfolgreiche Installation oder Anmeldung allein genügt nicht.
4. Den Ablauf mit einem unabhängigen persönlichen Beta-Konto wiederholen. Das Referenzieren einer App gewährt
   keinen Zugriff auf sie; Workspace-Freigaben sind kein Nachweis für kontoübergreifende
   Beta-Verfügbarkeit. Ist die App nicht verfügbar, diese Zugriffsgrenze als
   offen dokumentieren, anstatt Serverprüfungen abzuschwächen.
5. Ein tatsächlich über Git ausgeliefertes Paket-/Skill-Update sowie einen weiteren authentifizierten
   Lernschritt verifizieren. Web- und nativen Mobile-Betrieb separat testen, bevor
   diese Oberflächen zugesichert werden. Jedes unbeobachtete Abnahmeergebnis auf ausstehend belassen.

Der Vorschlag, Zertifikatsprüfungen vorübergehend zu deaktivieren, war eine Eventualüberlegung,
**keine Autorisierung zur Aktivierung**. `mTLS=enforce`, OAuth-Client-Prüfungen und
Lernsitzungs-Autorisierung bleiben unverändert. Ein zertifikatsloser Beta-Test
würde weder die vorgesehene Produktionssicherheitskette validieren noch
eine unabhängige OAuth-Client-Inkompatibilität lösen.

Gegenstand der öffentlichen Einreichung bleibt der tatsächliche HTTPS-MCP-Server über
**With MCP**, nicht dieser Wrapper mit Referenz auf eine bestehende App. Gemeinsames Backend- und Skill-Verhalten
machen die beiden Paketierungswege nicht identisch.
[OpenAI: Einreichungsanforderungen](https://developers.openai.com/plugins/deploy/submission#submit-the-mcp-server-not-an-existing-integration-reference)

### Vom Owner ausgewählte Registrierung und lokaler Kandidat

Der Owner stellte am 12. September 2026 die aktuelle persönliche Detailseiten-URL bereit:
`https://chatgpt.com/plugins/plugin_asdk_app_6aa39de25e70819195ce64ee4c22a0e0?view=personal`.
Die zugehörige App-ID lautet `asdk_app_6aa39de25e70819195ce64ee4c22a0e0`.
Die Seite zeigt **1.0.0** an. Diese Beobachtung identifiziert die ausgewählte
Registrierung; sie belegt weder deren Endpunkt noch den aktuellen Tool-Snapshot,
die OAuth-Bereitschaft oder die deployte Backend-Version. Tun Sie die Anzeige nicht als
bloße Kosmetik ab und behandeln Sie die Registrierung nicht allein deshalb als abgenommen, weil die Seite lädt.

Ein separater lokaler Kandidat ist unter
`tmp/openai-app-reference-probe-20260912/` vorbereitet, mit der Plugin-Identität
`skillpilot-coach-v1-appref-test`, der Katalog-Identität
`skillpilot-chatgpt-appref-test` und der Version **1.1.0-appref.1**, abgeleitet aus
dem damals kanonischen Paket **1.1.0**. Es handelt sich weder um eine Installation noch um ein Rollback
auf das in der registrierten App angezeigte Paket 1.0.0. Seine `.app.json` nutzt ausschließlich das
dokumentierte Feld `id`: Der installierte Plugin-Creator-Validator akzeptiert das in neuerer
Dokumentation gezeigte optionale Feld `required` nicht. Die aktuelle
offizielle Referenz erlaubt das Weglassen dieses Felds; diese Kompatibilitätsentscheidung
ändert keine Server-Autorisierungsregel.
[OpenAI: Validierung von App-Referenzen](https://developers.openai.com/plugins/deploy/submission-errors#mcp-server-reference-errors)

Der kanonische Skill-Name bleibt `skillpilot-coach-v1`; aktivieren Sie niemals gleichzeitig den
Direkt-Kandidaten und diese Probe in demselben Testkontext. Das lokale Einmal-Hilfsskript
`tmp/prepare_openai_app_reference_probe_20260912.mjs verify` prüft das exakte
11-Dateien-Inventar, die Inhaltsgleichheit zur Quelle sowie sämtliche ausstehenden Abnahmekennzeichnungen.
Die `tmp/`-Artefakte sind lokale Experimentdateien und keine dauerhaften öffentlichen Releases.

Aktueller Status: **vor der Installation abgebrochen; nicht der Beta-Installationspfad**.
Die lokalen Artefakte bleiben deinstalliert und unveröffentlicht; ihre ausstehenden Belege
sind kein Abnahmenachweis. Es wurden keine Produktionssicherheitseinstellungen geändert.

## Historische Clean-Install-Anforderungen vom September

Das Abnahmeziel ist ein unabhängiges persönliches Beta-Konto **ohne vorheriges
SkillPilot-Plugin, registrierten Connector, lokale Konfiguration oder
Entwickler-Zugangsdaten**. Dessen vollständiger Ablauf muss lauten:

1. Den veröffentlichten SkillPilot-Git-Marketplace hinzufügen.
2. Das aktuelle Plugin installieren und die reguläre Kontoverbindung samt Consent abschließen.
3. Eine frische Lernsitzung in der SkillPilot-WebGUI starten und das Plugin
   gegen den unveränderten Produktions-MCP-Endpunkt nutzen.
4. Dasselbe erzwungene mTLS, das konfigurierte OAuth-Client-Profil und die unabhängigen
   Lernsitzungsprüfungen nachweisen, die in der Produktion gefordert sind.
5. Ein über Git ausgeliefertes Plugin-/Skill-Update empfangen und den authentifizierten
   Lernschritt ohne manuelle Dateibearbeitung oder Entwickler-Setup wiederholen.

Eine betreiber-seitige Dienstregistrierung kann erforderlich sein, muss aber reproduzierbar
sein und die resultierende Integration für die vorgesehenen unabhängigen
Konten verfügbar machen. Eine private, nur für den Owner nutzbare App-ID, ein Secret-Setup pro Testperson, Eingriffe in den Cache,
Änderungen an Versionsbezeichnungen oder ein zertifikatsloser Transport erfüllen diesen Workflow nicht.
Weder das Paketformat noch die Git-Verteilung gewähren für sich genommen App-Verfügbarkeit.

Die derzeit dokumentierten Formate wahren diese Unterscheidung: Portables
`plugin.json`/`mcp.json` beschreibt einen gebündelten Server; ein Mapping auf eine registrierte App
referenziert eine bestehende Integration. Eine unterstützte Git-Deklaration, die für ein frisches unabhängiges Konto
die benötigte gehostete Registrierung anlegt, konnte bislang nicht
nachgewiesen werden. Der direkte Desktop-Pfad scheiterte an der erzwungenen Zertifikatsprüfung;
die persönliche App-Referenz-Probe löst nicht die kontoübergreifende Verfügbarkeit.
Dies ist eine ungelöste Bereitstellungs-/Transportvoraussetzung, keine bestandene Beta-Installation
und kein Grund, die Authentifizierung abzuschwächen.
[OpenAI: Plugin paketieren](https://developers.openai.com/plugins/build/plugins),
[OpenAI: Referenzen auf bestehende Apps](https://learn.chatgpt.com/docs/enterprise/plugin-management#reference-an-existing-app-with-appjson)

Schreiben Sie keinen weiteren Installations-Workaround vor, solange kein unterstützter Weg diese
Voraussetzungen erfüllt. Echte Nachweise mit einem frischen Konto einschließlich Updates müssen
vorliegen, bevor dieser Weg als beta-reif bezeichnet wird.

Die [historische Bewertung vom 12. September 2026](openai-beta-distribution-assessment.md)
dokumentiert den anschließenden Vergleich der Detailseiten zweier Konten, die verworfene Alternative eines geteilten
Workspaces, die Tunnel-/CIMD-Prüfungen sowie nicht abgesendete Support-/Forenentwürfe.
Es wurde kein vollständiger qualifizierender Beta-Weg vor dem Review etabliert. Die darauffolgende
[Product-Owner-Entscheidung](claude-beta-chatgpt-release-strategy.md) beendet weitere
Distributionsarbeiten: zuerst Claude stabilisieren, danach eine fokussierte ChatGPT-Host-Abnahme
dieses Kandidaten durchführen und einreichen. Das Verhalten von ChatGPT lässt sich nicht
aus Claude-Ergebnissen ableiten. Dies ändert weder die Produktionsauthentifizierung noch die
unten aufgeführten historisch offenen Abnahmeergebnisse; diese Marketplace-Matrix ist kein
Gate für die offizielle Einreichung.

## Historische Abnahmematrix vom September

Die ursprüngliche Real-Host-Matrix ist bewusst als offen festgehalten:

| Prüfung | Ursprünglicher Status |
| --- | --- |
| Frisches Konto: Katalog, exakte Version, gebündelter Skill | Ausstehend |
| Installiertes Plugin: authentifizierter Produktions-MCP-Betrieb | Ausstehend |
| ChatGPT Desktop: vollständiger Lernschritt | Ausstehend |
| ChatGPT Web: vollständiger Lernschritt | Ausstehend |
| ChatGPT Web bei vollständig beendetem Desktop-Client | Ausstehend |
| Natives iOS / natives Android | Ausstehend / ausstehend |
| Update von einer zuvor installierten Marketplace-Version | Ausstehend |

Halten Sie für jedes beobachtete Ergebnis den exakten Kandidaten, Marketplace-Commit, Host,
Kontoumfang, Zeitpunkt und Nachweisverweis fest. Ein neues Paket erbt die Abnahme eines
vorherigen Kandidaten nicht automatisch. Nicht unterstützte und fehlgeschlagene Prüfungen
bleiben strikt von bestandenen Prüfungen getrennt; keines von beidem rechtfertigt konstruierte Abnahmen.

Generieren Sie für ein nachfolgendes Git-Update aus der neuen kanonischen Version neu, bestehen Sie
die Prüfungen beider Repositories und verifizieren Sie den veröffentlichten Baum erneut. Im Test-Client
lautet der dokumentierte Befehl zur Katalogaktualisierung:

```bash
codex plugin marketplace upgrade skillpilot-chatgpt-marketplace
```

Prüfen Sie anschließend die tatsächlich installierte Version, den gebündelten Skill, die Authentifizierung und
einen Lernschritt. Eine Katalogaktualisierung beweist weder den Austausch des Pakets noch automatische
kontoweite Updates. Löschen Sie niemals ein anderes Plugin, das Benutzerprofil oder eine
Marketplace-Quelle als routinemäßigen Aktualisierungs-Workaround.
