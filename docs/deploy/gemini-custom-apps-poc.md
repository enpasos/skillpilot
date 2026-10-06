# Gemini Custom apps: isolierter technischer PoC

Stand: **6. Oktober 2026**. Auftrag:
[Issue #70](https://github.com/enpasos/skillpilot/issues/70) und der ausdrückliche
Wunsch des Product Owners, den PoC selbstständig zu planen und umzusetzen.
Diese technische Betriebsdokumentation fällt gemäß [LICENSING.md](https://github.com/enpasos/skillpilot/blob/main/LICENSING.md)
unter **Apache-2.0**.

## Ergebnis und Ziel

**Der technische MCP-Durchstich funktioniert; die Fortsetzung in einem neuen
Chat ist noch nicht zuverlässig nachgewiesen. Die PoC-Bewertung ist abgeschlossen.** Der PoC unter
[`ai/gemini/poc`](https://github.com/enpasos/skillpilot/tree/main/ai/gemini/poc) enthält einen kleinen, getrennten
MCP-Canary. Er soll feststellen, ob die normale Gemini-Web-App einen eigenen
MCP-Server verbinden, seine Werkzeuge erkennen und eine bestätigte synthetische
Schreibaktion ausführen kann. Lokale Protokolltests beantworten diese
Hostfrage nicht. Am **6. Oktober 2026** funktionierten im angemeldeten,
englischen Gemini-Consumer-Web-Testbrowser über den gemessenen US-Netzwerkweg
die erste OAuth-Verbindung und native MCP-Werkzeug-Discovery. Die drei
Werkzeugnamen waren im Save-custom-app-Dialog sichtbar; die App wurde als
**SkillPilot PoC** gespeichert. Der erste Chat-Leseversuch scheiterte mit
Tokenantwort **400** und MCP-Antwort **401**, bevor ein `tools/call` ankam.
Ein Reconnect zeigte einen Refresh-Request ohne erforderliches `resource`;
die ausdrücklich aktivierte Korrektur bestand anschließend den Host-Retest.
Status/Context und eine passende Modellantwort waren erfolgreich, eine
abgelehnte Schreibfreigabe ließ den Zustand unverändert. An der neuen gültigen
Origin bestand anschließend auch eine manuell bestätigte Schreibaktion samt
Persistenznachweis: Zustand **0 → 1**. Ein tatsächlicher Replay behielt
Zustand 1 und den identischen Receipt. Der erste Versuch in einem neuen Chat
meldete hingegen bei gültiger Origin und erfolgreicher nativer Discovery
Werkzeug-Nichtverfügbarkeit ohne `tools/call`; der erneute Versuch scheiterte
ebenfalls vor einem Tool-Aufruf. Die Ursache ist unbestätigt. Frühere Versuche
gegen eine ungültig gewordene
Tunneladresse sind **TRANSPORT_CONFOUNDED**, kein Nachweis eines Gemini-Fehlers.
Ein vollständiger Lernfluss und Beta-Reife sind damit nicht nachgewiesen.

Der erste Nachweis verwendet ausschließlich Testzustand. Er ist kein
SkillPilot-Lernablauf, speichert keine reale Mastery und verwendet weder Gemini
API noch Gemini CLI. Ein neuer Kurs und die öffentliche Beta folgen erst nach
den vorgelagerten technischen Nachweisen. Ausführungsbefehle und die genaue
Konfiguration stehen im Runbook des PoC-Verzeichnisses.

## Dokumentierte Voraussetzungen und offene Hypothesen

Google nennt für Custom apps: USA, mindestens 18 Jahre, persönliches Konto,
Englisch und aktives Keep Activity. Einrichtung: Web-App → Connected Apps →
Custom apps → MCP-URL; ohne DCR ist die Eingabe von Credentials unter Advanced
features vorgesehen. `@` wählt die App gezielt. Schreibaktionen verlangen
manuelle Bestätigung. Die Consumer-Hilfe nennt keine genaue Callback-URL,
Clientauthentifizierung oder MCP-Revision. Diese Parameter sind zu messen.
[Google: Custom apps](https://support.google.com/gemini/answer/17209137?hl=en)

Der eigene US-Testweg wurde am **6. Oktober 2026** im bestehenden angemeldeten
Browser mit nutzbarer Custom-app-URL-Eingabe beobachtet. Die Meldung des
Maintainers, Mullvad gestartet zu haben, und die gemessene US-Netzwerkroute sind
getrennte Befunde. Eine US-IP allein beweist weder Kontoberechtigung noch
Freischaltung; die Einrichtung wurde deshalb zusätzlich in der UI geprüft.
Die geprüften Quellen belegen keine
spezielle Google-Freigabe dieses Entwicklungswegs. Anbieterbedingungen und
tatsächlich angezeigte Hinweise bleiben ein eigenständiger Prüfpunkt; daraus
werden keine Konto-, Standort- oder Providerentscheidungen abgeleitet.
[Google Terms of Service](https://policies.google.com/terms?hl=en-US)

Skills lassen sich als `SKILL.md` beziehungsweise ZIP mit dieser Datei im
Hauptverzeichnis importieren. Namen verwenden Kleinbuchstaben und Bindestriche.
Dateiänderungen erfordern einen Reupload; Skill-Scripts dürfen keine externen
Webanfragen ausführen. Ein Skill ersetzt deshalb die MCP-Verbindung nicht.
[Google: Skills](https://support.google.com/gemini/answer/17094296?hl=en)

Für einen geschützten HTTP-PoC dient der MCP-Standard als technische Grundlage:
Resource- und Authorization-Server-Metadaten, S256 PKCE, exakte Redirect-Bindung,
resource/Audience-Bindung und Bearer-Prüfung pro Anfrage. Refresh und Widerruf
sind gesondert zu prüfen. DCR ist im aktuellen Standard für Kompatibilität
erhalten; daraus folgt keine bestätigte Gemini-CIMD-Unterstützung.
[MCP Authorization, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)

Die lokale Implementation muss ihre tatsächlich unterstützte Protokollrevision
ausweisen. Der tatsächliche Gemini-Trace vom 6. Oktober bestätigt native
Streamable-HTTP-Discovery und Chat-Werkzeugaufrufe mit **2025-11-25**.
Die zuverlässige Wiederaufnahme in einem neuen Chat bleibt gesondert zu prüfen.
Technische Beschreibungen
von Gemini Enterprise, API oder CLI belegen keine Eigenschaften der normalen
Gemini-Web-App. [MCP Transports](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports)

## Umfang des Canary

Der Canary besitzt genau drei fachlich kleine Werkzeugrollen:

| Werkzeugrolle | Zweck | Zustandswirkung |
| --- | --- | --- |
| Status | Build-/PoC-Identität und eine korrelierbare Antwort prüfen | Keine |
| Context | Den ausschließlich synthetischen Testkontext lesen | Keine |
| Completion | Einen synthetischen Abschluss nachvollziehbar speichern | Schreibend; echte Hostbestätigung zu testen |

Das Completion-Werkzeug bleibt in MCP ausdrücklich schreibend deklariert. Ein
erfolgreicher HTTP-Aufruf oder eine Chatbehauptung reicht als Speichernachweis
nicht: Der geprüfte Testzustand muss sich genau wie vorgesehen ändern. Eine
abgelehnte Hostfreigabe darf ihn nicht ändern. Wiederholte Aufrufe dürfen keine
zweite Buchung erzeugen.

Der Prozess besitzt eine eigene Gemini-Testbindung und arbeitet außerhalb der
bestehenden Providerendpunkte. OAuth-App-Zugang und die synthetische
Testsession bleiben getrennt. Weder produktive Lernendenkennungen noch echte
Lernstände gehören in diesen Durchstich. Die vorhandenen OpenAI-/Claude-
Authentifizierungs- und Sessiongrenzen werden dafür nicht geändert.

Der Canary ist noch kein vollständiger Backendadapter. Eine synthetische
Completion beweist weder didaktische Evidenzbewertung noch reale Mastery,
Lernsession-Fortsetzung oder den SkillPilot-Coach. Diese Nachweise sind Teil
des späteren gemeinsamen Backendadapters.

## Arbeitsfolge und Entscheidungsgrenzen

1. **Eigener interaktiver Zugang.** Der Maintainer prüft mit seinem persönlichen
   Testkonto die tatsächliche Custom-apps-Einrichtung zunächst ohne VPN und
   anschließend, sofern ein eigener US-VPN-Zugang vorhanden ist, im vorgesehenen
   US-Testkontext. Ein neuer Login beziehungsweise eine neue Browsersitzung
   prüft Reproduzierbarkeit. Konto-/Spracheinstellungen und Keep Activity werden
   als Voraussetzungen betrachtet; der PoC verändert sie nicht automatisch.
2. **Canary in der normalen Gemini-Web-App.** Erst bei sichtbarer Einrichtung
   werden der getrennte Testserver verbunden, Discovery und Status/Context
   korreliert und die synthetische Completion einschließlich Ablehnung,
   Wiederholung und anschließender Zustandsprüfung getestet. Die tatsächlich
   angeforderten OAuth-Parameter werden bereinigt erfasst. Unbekannte Parameter
   werden nicht durch das Lockern vorhandener Providergrenzen akzeptiert.
3. **Gemeinsamer Backendadapter.** Erst nach erfolgreichem Canary wird die
   vorhandene SkillPilot-Fachlogik über einen getrennten Gemini-Providerzugang
   angebunden. Dann folgen echte Testlernstände, Verständnisnachweis,
   bestätigte Speicherung, neuer Chat, Sessionablauf, Erneuerung und Widerruf.
4. **Demonstrator und Beta.** Erst nach dem vollständigen Lernfluss folgen ein
   begrenzter englischer Demonstrator, Sicherheitsprüfung, US-Onboarding ohne
   VPN und der zusätzliche Test eines berechtigten US-Nutzers. Ein externer
   US-Test ersetzt den eigenen Maintainer-Test nicht. Veröffentlichung bleibt
   eine getrennte Operation.

Fehlende UI-Freischaltung wird als Zugangsbefund erfasst. Sie ist kein
SkillPilot-Serverfehler und wird nicht mit einer API-Demo übergangen. Ein
bestätigter Canary ermöglicht die Arbeit am Backendadapter; er gibt noch
keine vollständige Lernintegration oder Beta frei.

## Acceptance-Matrix

`NOT_RUN` bedeutet: kein tatsächlicher Hosttest durchgeführt. `PASS` erfordert
den Nachweis der jeweiligen Zeile. `FAIL_OBSERVED` bezeichnet einen tatsächlich
gescheiterten Versuch und behauptet noch keine Ursache.
`TRANSPORT_CONFOUNDED` bedeutet, dass eine ungültige Tunneladresse die
Hostbewertung verhindert. `FAIL_OBSERVED_CHAT_DISPATCH` erfasst eine
Modell-Nichtverfügbarkeit ohne Tool-Aufruf bei erfolgreicher nativer Verbindung;
die Ursache bleibt unbestätigt. Lokale Tests besitzen eine eigene Bewertung und
setzen niemals eine Hostzeile auf `PASS`.

| Ebene | Prüfung | Erforderlicher Nachweis | Status am 05.10.2026 (historisch) | Status am 06.10.2026 |
| --- | --- | --- | --- | --- |
| Hostzugang | Persönliches Testkonto ohne VPN | Angemeldete UI und tatsächliche Sichtbarkeit der Custom-apps-Einrichtung | NOT_RUN | NOT_RUN; im DE-Kontext nur Überschrift beobachtet |
| Hostzugang | Eigener US-VPN-Testweg | Derselbe Kontokontext, geprüfter Ausgang und tatsächlich nutzbare Einrichtung | NOT_RUN | PASS: US-Route und URL-Eingabe beobachtet; Mullvad owner-reported |
| Hostzugang | Reproduzierbarkeit | Erneuter Login/neue Browsersitzung mit gleichem Ergebnis | NOT_RUN | NOT_RUN |
| Canary/Host | Erste Verbindung und OAuth | Korrelierter Discovery-/Autorisierungs-/Tokenablauf mit realem Gemini | NOT_RUN | PASS: `/token` 200 um 00:23:52 UTC; kein Nachweis dauerhafter Tokenfunktion |
| Canary/Host | Werkzeug-Discovery | Native `initialize`/`tools/list` und drei Werkzeugnamen im tatsächlichen Hostdialog | NOT_RUN | PASS: 00:23:53–54 UTC, Revision 2025-11-25; App gespeichert |
| Canary/Host | Read im Chat | Status/Context liefern korrelierte Serverantworten | NOT_RUN | PASS: 00:31:35–36 UTC, Zustand 0 und passende Modellantwort; ursprünglicher Fehler separat dokumentiert |
| Canary/Host | Refresh | Korrelierter Refresh-Grant mit unveränderter Resource-/Client-Bindung | NOT_RUN | PASS: 00:31:16 UTC mit expliziter Omission-Option; strikter Ausgangsversuch scheiterte |
| Canary/Host | Bestätigte Completion | Gemini zeigt Schreibfreigabe; nach Zustimmung ändert sich ausschließlich der Testzustand | NOT_RUN | PASS: Allow 00:44:30 UTC, Completion 00:44:33.823 UTC mit Zustand 1; frischer Store-/Disk-Nachweis 00:44:51 UTC |
| Canary/Host | Abgelehnte Completion | Ablehnung ohne Completion-Buchung | NOT_RUN | PASS: 00:32:26 UTC, UI-Ablehnung und Zustand 0 → 0; kein Completion-Aufruf |
| Canary/Host | Frische App/Pro-Modell | Gültige Testadresse und korrelierter Read im neuen Einrichtungskontext | NOT_RUN | PASS an neuer Origin: Status/Context 00:43:35–47 UTC; vorherige alte-URL-Versuche TRANSPORT_CONFOUNDED |
| Canary/Host | Wiederholung | Kein doppelter Abschluss; identischer Receipt beim tatsächlichen Replay | NOT_RUN | PASS: Allow 00:45:43 UTC, Completion 00:45:47.233 UTC mit Zustand 1; identischer Disk-Receipt 00:45:48.695 UTC |
| Canary/Host | Unterbrochener Write | Definierter Zustand nach Unterbrechung eines tatsächlichen Schreibaufrufs | NOT_RUN | NOT_RUN |
| Canary/Host | Neuer Chat | Synthetischen gespeicherten Testzustand erneut über die verbundene App lesen | NOT_RUN | FAIL_OBSERVED_CHAT_DISPATCH: 00:46:23–25 und 00:48:35–36 UTC, native Discovery 200, Modellfehler und kein `tools/call`; Ursache unbestätigt |
| Adapter/Host, später | Vollständiger Lernfluss | Verständnisnachweis und tatsächliche SkillPilot-Testmastery samt Session-Fortsetzung | NOT_RUN | NOT_RUN |
| Adapter/Host, später | Session-/Tokenlebenszyklus | Tatsächliche Erneuerung, Widerruf und vorgesehene Sessionwiederherstellung | NOT_RUN | NOT_RUN |
| Beta, später | Frisches US-Onboarding | Berechtigter US-Nutzer verbindet und lernt ohne VPN anhand der Anleitung | NOT_RUN | NOT_RUN |

Die zugehörigen lokalen Prüffelder sind: Discovery/Transport, gültiger
OAuth-Ablauf, abgewiesene falsche Credentials/Redirects/Audience/PKCE,
Testsession-Isolation, tatsächliche synthetische Persistenz und idempotente
Wiederholung. **Aktuelle lokale Ergebnisse am 6. Oktober: PASS — 36/36 Tests**,
ausgeführt mit Node 22.22.0 und MCP
SDK 1.30.0; am 5. Oktober waren es **27 Tests**. Darunter: acht gleichzeitige
identische Writes mit genau einem Receipt, Wiederherstellung aus der Datei nach App-/Store-Neustart,
24-Stunden-Expiry und die exakte Ein-Stunden-Grenze, zusätzlicher Freitext,
abgewiesene große/ungültige JSON-Inputs und ein real blockierter Disk-Commit
ohne falschen Erfolg. Fünf Proxytests belegen die Sperre des Operatorzugangs.

Der automatisierte lokale und der automatisierte öffentliche HTTPS-Durchstich
vom **5. Oktober 2026** haben **PASS_LOCAL_ONLY** beziehungsweise
**PASS_HTTPS_ONLY**: Consent, S256,
Tokenaustausch, MCP-Discovery, unabhängige Testsession, tatsächlich gespeicherter
Marker, exakter Replay und nachfolgender Read waren erfolgreich. Beide Reports
tragen ausdrücklich `actualGeminiHost: false`. Der öffentliche Proxy antwortet
auf `/operator/sessions` mit 404. Die tatsächliche Gemini-OAuth-/Discovery-
Verbindung vom 6. Oktober ist separat belegt. Der ursprüngliche Chat-Lesefehler
wurde nach der begrenzten Refresh-Korrektur durch erfolgreiche echte Reads
abgelöst. Der aktuelle lokale Smoke vom **6. Oktober, 00:34:08 UTC** ist
**PASS_LOCAL_ONLY**, weiterhin `actualGeminiHost: false`. Lokale und
automatisierte HTTPS-Writes belegen weder Gemini-Schreibfreigabe noch
Gemini-Persistenz.

Die temporäre HTTPS-Testadresse und Start-/Stoppbefehle stehen im
[PoC-Runbook](https://github.com/enpasos/skillpilot/blob/main/ai/gemini/poc/README.md). Der Loopback-Callback dient
ausschließlich dem automatisierten Test. Die tatsächliche Google-Callback-URI
ist exakt und ausschließlich privat gepinnt: Ihr Ursprung ist
`https://oauth-redirect.googleusercontent.com`, ihr `user_bound_custom-mcp`-
Pfad enthält eine Kontokennung und wird deshalb nicht veröffentlicht.
Ein fester dauerhafter Hostname ist für den PoC nicht erforderlich. Die
temporäre HTTPS-Origin samt OAuth-Issuer/Ressource und die Callback-Bindung
müssen innerhalb eines Testfensters stabil bleiben; ein Tunnelwechsel verlangt
Neukonfiguration und erneute Verbindung der Custom app. Tunnel-Erreichbarkeit
ist kein US-VPN-Zugang. Historische OpenAI-Artefakte bestehen den Review-History-Checker;
17 bestehende OAuth-CI-/Release-Evidenztests bestehen ebenfalls. Produktive
Providerdateien wurden nicht geändert.

Der bereinigte [Nachweis mit Quellhashes](gemini-custom-apps-poc-evidence-2026-10-05.json)
bindet diese Ergebnisse an den getesteten lokalen PoC-Stand und das
reproduzierbare Skill-Archiv. Er enthält keine privaten State-Dateien,
Credentials oder Chatinhalte.

## Historischer Befund der verfügbaren Umgebung am 5. Oktober 2026

Read-only geprüft am **5. Oktober 2026, etwa 21:15 MESZ**:

- Eine Netzwerk-Geoprobe meldete **Deutschland/Hessen**. Es wurde kein
  US-Netzwerktest durchgeführt.
- In den geprüften Pfaden und Prozessen wurde kein nutzbarer VPN-Zugang
  beziehungsweise keine VPN-Konfiguration gefunden.
- Ein ausführbarer Chromium ist im Playwright-Cache vorhanden. Es wurde kein
  angemeldetes persönliches Google-Testprofil gefunden; das vorhandene
  `google-chrome-for-testing`-Konfigurationsverzeichnis enthielt nur Crash Reports.
- Eine echte Chromium-Navigation mit temporärem, abgemeldetem Profil zu
  `https://gemini.google.com/app` lud mit Titel **Google Gemini** und sichtbarem
  **Sign in**. Custom apps wurden darin nicht nachgewiesen; es gab keine
  Browserfehlerseite.
- Ein öffentlicher, unauthentifizierter HTTP-Aufruf derselben Seite war
  erfolgreich. Das belegt Seitenzugriff, keine Kontofreischaltung.

Der angemeldete DE-/US-VPN-Vergleich war zu diesem Zeitpunkt deshalb
**NOT_RUN**. Es fehlte ein nutzbarer eigener interaktiver Kontozugang samt
US-Testnetzwerk. Daraus folgt
kein Urteil über die Berechtigung des Maintainer-Kontos, keine Behauptung, dass
Custom apps für dieses Konto gesperrt seien, und keine bestätigte oder
widerlegte Gemini-Kompatibilität des Canary.

Die anschließende Zugangsprüfung bezog auch den Windows-Host ein: Ein Edge-
Executable ist vorhanden, lässt sich aus dieser Umgebung aber nicht starten
(`Exec format error`, keine nutzbare Windows-Interop). Die üblichen Browser-
Debug-Endpunkte auf 9222/9223 waren weder auf Loopback noch am Host-Gateway
erreichbar. Es wurden keine Cookies, Passwörter oder Browserprofilinhalte
ausgelesen. Ein eventuell vorhandenes angemeldetes Windows-Konto bleibt damit
unzugänglich; seine Berechtigung und eine mögliche Windows-VPN-Konfiguration
sind weiterhin nicht beurteilt. Der erneute öffentliche Health-/Metadaten-
Check des vorbereiteten Testservers war erfolgreich. Die unabhängige Code-
und Runbook-Prüfung fand keine konkrete weitere Implementierungslücke, die
ohne tatsächlichen Gemini-Trace eine zusätzliche Änderung rechtfertigt.

## Nachweisführung

### Browserübergabe am 6. Oktober 2026

Auf die Nachfrage zur Auflösung der Blockierung wurde ein zusätzlicher
nutzbarer Weg gefunden: WSLg ist verfügbar. Ein separates sichtbares Chromium-
Testfenster wurde mit einem eigenen Profil unter dem ignorierten
`tmp/gemini-poc/browser-profile/` und ausschließlich lokalem Debug-Port 9222
geöffnet. Die Browsersteuerung über diesen Port ist tatsächlich bestätigt.
Windows-Interop ist für diesen Weg nicht erforderlich. Eine Google-Anmeldung
oder US-Verfügbarkeit wird dadurch noch nicht behauptet.

Der Maintainer übernimmt die persönliche Anmeldung einschließlich einer
eventuellen Mehrfaktorprüfung direkt im Fenster. Passwörter und Tokens gehören
nicht in den Chat. Nach der Anmeldung lässt sich zunächst die DE-Baseline
prüfen, anschließend mit dem vom Maintainer verbundenen US-VPN der gleiche
Browser erneut. Die anschließenden Prüfungen des tatsächlichen Netzzugangs und
der Custom-apps-Sichtbarkeit sind unten dokumentiert.

Anschließend meldete der Maintainer die abgeschlossene Anmeldung. Im tatsächlich
steuerbaren Browser waren Gemini-Einstellungen und die Seite Connected Apps
zugänglich. `hl=en` an der Gemini-URL stellte die UI auf Englisch um;
`html lang="en"` und der sichtbare Settings-Button wurden geprüft. Damit wurde
keine globale Google-Kontosprache verändert. Auf der Connected-Apps-Seite ist
die Überschrift Custom apps sichtbar. Zu diesem Zeitpunkt war die nutzbare
Einrichtung noch nicht getestet; die Netzwerkprobe des Workspace meldete DE.

### US-Route und nutzbare Custom-app-Eingabe am 6. Oktober 2026

Der Maintainer meldete anschließend, Mullvad VPN gestartet zu haben. Im selben
angemeldeten Linux-Chromium über CDP auf Loopback-Port 9222 meldete eine
HTTPS-Cloudflare-Geoprobe **US**. Eine unabhängige Netzwerkprobe aus der Shell
meldete ebenfalls **US**. Diese Messungen belegen den US-Netzwerkweg;
der verwendete VPN-Anbieter ist owner-reported.

Nach erneutem Laden von `https://gemini.google.com/apps?hl=en` und Anklicken
des Chips **Custom apps** zeigte die englische UI ein tatsächliches
`INPUT` mit `aria-label="Add a custom app link to get started"`,
`placeholder="https://your-app-link.com/mcp"` sowie einen **Next**-Button.
`html lang="en"` war bestätigt. Damit ist die nutzbare Custom-app-URL-Eingabe
im bestehenden angemeldeten US-Testkontext beobachtet. Ein neuer Login oder
eine neue Browsersitzung wurde für diesen Nachweis nicht durchgeführt.
Nach **Next** erschien außerdem der Dialog **Connect to an MCP server** mit
**Additional settings** und **Show more**. Das ist ein weiterer
Einrichtungsbefund, noch kein tatsächlicher OAuth-Ablauf.

Dieser UI-Befund lag vor der späteren OAuth-/Discovery-Verbindung. Die
Eingabemaske allein beweist keine Gemini-Kompatibilität des Canary.

Bei der Wiederherstellung des temporären öffentlichen HTTPS-Testwegs antwortete
die alte Quick-Tunnel-Adresse mit **HTTP 530**. Auch ein neu gestarteter
Quick Tunnel lieferte **530**; seine erforderliche Transportprüfung über Port
7844 hatte noch kein `PASS`. Dies ist ein temporärer Tunnel-/Transportbefund,
kein Gemini-Verbindungs- oder OAuth-Ergebnis. Anschließend wurde der öffentliche
Testweg über einen temporären anonymen localhost.run-SSH-Tunnel auf Port 22
wiederhergestellt: Health antwortete mit **200**, `/operator/sessions` mit
**404**. Der vollständige automatisierte HTTPS-Durchstich vom
**6. Oktober 2026, 00:05:06.291 UTC** erreichte **PASS_HTTPS_ONLY** mit
MCP-Revision `2025-11-25`, synthetischem Zustandswechsel `0 → 1` und exaktem
idempotentem Replay. Der Report trägt `actualGeminiHost: false`; er ist kein
Gemini-Hosttest. Die historischen automatisierten HTTPS-Ergebnisse vom
5. Oktober bleiben erhalten.

### Tatsächliche Gemini-Verbindung und erster Chatversuch am 6. Oktober 2026

Die folgenden Beobachtungen stammen aus der normalen angemeldeten,
englischen Gemini-Consumer-Web-App im bestehenden US-Testkontext, nicht aus
dem automatisierten MCP-Client:

- **00:23:52 UTC:** Gemini authentifizierte sich mit dem explizit gewählten
  `client_secret_post`-Profil; `/token` antwortete **200**.
- **00:23:53–54 UTC:** Native MCP-Anfragen für `initialize`,
  `notifications/initialized` und `tools/list` waren erfolgreich;
  die Protokollrevision war **2025-11-25**. Der Save-custom-app-Dialog zeigte
  `get_skillpilot_poc_status`, `get_skillpilot_poc_context` und
  `record_skillpilot_poc_completion`. Die App wurde als **SkillPilot PoC**
  gespeichert.
- **00:25:22 UTC:** Beim ersten Chat-Leseversuch wurde die Post-
  Clientauthentifizierung erneut akzeptiert, der Tokenendpunkt antwortete
  jedoch **400** und `/mcp` **401**. Der Chat meldete Nichtverfügbarkeit.
  Es kam kein `tools/call` an; eine erfolgreiche Status-/Context-Antwort im
  Chat ist damit nicht nachgewiesen.
- **00:29:22 UTC:** Ein tatsächlicher Reconnect grenzte die Ursache ein:
  Der `authorization_code`-Austausch mit vorhandenem `resource` antwortete
  **200**. Unmittelbar danach akzeptierte der Server erneut die Post-
  Clientauthentifizierung, wies aber den `refresh_token`-Grant ohne `resource`
  mit **`invalid_grant`**, bereinigtem Grund **`resource_missing`** und
  **400** ab; `/mcp` antwortete anschließend **401**. Dieser Befund belegt
  eine Abweichung des beobachteten Gemini-Refresh-Requests, keinen Fehler
  der Client-Credentials.
- **00:31:16 UTC:** Mit ausdrücklich aktivierter
  `POC_ALLOW_REFRESH_RESOURCE_OMISSION=1` funktionierte der reale Post-Refresh
  ohne Resource-Parameter. Der Grant behielt seine ursprüngliche Audience.
- **00:31:35–36 UTC:** Tatsächliche Status-/Context-Werkzeugaufrufe antworteten
  erfolgreich; Context zeigte Zustand **0**, das Modell gab eine passende
  Antwort. Weitere native Context-Reads, unter anderem um **00:34:10 UTC**,
  waren ebenfalls erfolgreich.
- **00:32:26 UTC:** Der Test lehnte die tatsächliche Gemini-Schreibfreigabe
  in der UI ab. Der synthetische Zustand blieb **0 → 0**; kein Completion-
  Werkzeugaufruf beziehungsweise Abschluss wurde gebucht. Das ist **PASS**
  für die Ablehnung. Tatsächliche Context-Reads um **00:32:58.804 UTC** und
  **00:34:10.514 UTC** bestätigten weiterhin Zustand 0.
- Beim anschließenden Versuch im selben Chat lieferte Context erneut **200**.
  Danach zeigte das Modell Nichtverfügbarkeit beziehungsweise blieb hängen;
  der Versuch wurde unterbrochen. Es kam kein Write an. Diese Beobachtung
  grenzt die weitere Ursache nicht abschließend ein.
- Nach späteren Versuchen mit frischer App beziehungsweise Pro-Modell lag der
  letzte native Serveraufruf bei **00:39:17 UTC**. Um **00:41–42 UTC** lieferte
  Health an der alten Origin `https://d487fefc13b041.lhr.life` **502**; der
  SSH-Tunnel kündigte `https://840518030c40a1.lhr.life` als neue Origin an.
  Die erfolglosen Versuche gegen die alte URL sind **TRANSPORT_CONFOUNDED**
  und lassen sich nicht Gemini zuschreiben. Ein dauerhafter Hostname ist dafür
  nicht erforderlich; die tatsächlich gültige URL muss pro Testfenster stabil
  bleiben und vor jedem Test geprüft werden.
- **00:42:36 UTC:** An der neuen Origin wurde ein tatsächlicher S256-Callback
  beobachtet und nach der erwarteten Ablehnung des unbekannten Callbacks exakt
  privat gepinnt. **00:42:43–46 UTC:** Codeaustausch, Refresh und native
  Werkzeug-Discovery waren erfolgreich, die App wurde gespeichert. Der
  anschließende Pro-Modell-Read ist unten gesondert belegt.
- **00:43:35 UTC / 00:43:47 UTC:** An der neuen Origin waren tatsächliche
  Status- und Context-Aufrufe im UI-Modus **Pro** (Menübezeichnung
  **3.1 Pro**) erfolgreich; Context zeigte zunächst Zustand **0**.
- **00:44:30 UTC:** Nach einer expliziten App-Ansprache mit frischem Context
  und Zustimmung zeigte Gemini die manuelle Schreibfreigabe; **Allow** wurde
  angeklickt. **00:44:33.823 UTC:** Der tatsächliche Completion-Werkzeugaufruf
  erreichte **200**, Zustand **1**. **00:44:51 UTC:** Ein frischer Store und
  die persistierte Datei bestätigten `completed: true`, `stateVersion: 1`
  und den gespeicherten Receipt mit `savedAt` **00:44:33.822 UTC**.
- **00:45:43 UTC:** Eine zweite manuelle **Allow**-Bestätigung autorisierte
  den Replay. **00:45:47.233 UTC:** Der tatsächliche Completion-Aufruf
  antwortete erneut mit **200**, weiterhin Zustand **1**.
  **00:45:48.695 UTC:** Der Disk-Vergleich bestätigte den identischen
  ursprünglichen Receipt und unveränderte Version 1; das Modell berichtete
  ebenfalls Version 1 und denselben Receipt. Replay ist damit **PASS**.
- **00:46:23–25 UTC:** Der erste Versuch in einem neuen Chat an der weiterhin
  gültigen Origin erreichte native `initialize`/`tools/list` mit **200**;
  das Modell meldete Werkzeug-Nichtverfügbarkeit, ohne dass ein `tools/call`
  ankam. Das ist **FAIL_OBSERVED_CHAT_DISPATCH** mit unbestätigter Ursache,
  kein Erfolg der Chat-Fortsetzung.
- **00:48:35–36 UTC:** Der einmalige erneute Context-Versuch im selben
  frischen Chat verwendete eine natürliche Context-Anfrage mit expliziter
  App-Ansprache und zwei Sekunden Wartezeit nach der Auswahl. Native
  `initialize`/`tools/list` antworteten erneut mit **200**; das Modell meldete
  einen allgemeinen Fehler, wiederum ohne `tools/call`. Damit bleibt die
  Wiederaufnahme in einem neuen Chat **FAIL_OBSERVED_CHAT_DISPATCH**;
  die konkrete Ursache ist nicht nachgewiesen.

Die gemessenen Abweichungen während der Einrichtung wurden ausschließlich im
isolierten PoC korrigiert. Googles OAuth-`state` von **1166–1168 Zeichen** passt
nun in die weiterhin begrenzte Spanne von **8–4096 Zeichen**.
`Referrer-Policy: strict-origin` auf der Autorisierungsseite erlaubt dem
Chromium-Consent-POST eine gültige gleichursprüngliche `Origin`; fremde
Consent-Ursprünge werden weiterhin abgewiesen. Ein Browser mit explizitem
HTML-Accept erhält nach Consent einen geschützten einzelnen Link
**Weiter zu Gemini** auf den exakten Callback. Sein Anklicken vermeidet
Googles mehrstufige Weiterleitung als Formularnavigation unter
`form-action 'self'`; der CSP bleibt erhalten. Nicht-HTML-Clients behalten
den 302-Ablauf mit denselben Consent-/Callback-/PKCE-/Scope-/Resource-Prüfungen.

Die Clientauthentifizierung ist ein fest gewähltes Profil:
`client_secret_basic` bleibt der Standard; der tatsächliche Gemini-Lauf nutzt
`POC_CLIENT_AUTH_METHOD=client_secret_post`. Metadaten weisen genau die gewählte
Methode aus, abweichende Methoden erhalten keinen automatischen Fallback.
Bereinigte Traces erfassen begrenzte Authentifizierungsmethoden und bekannte
MCP-Methoden/Revisionen ohne OAuth-Queries, Tokens oder Roh-Callback.

MCP **2025-11-25** verlangt `resource` in Autorisierungs- und Tokenanfragen;
der beobachtete Gemini-Refresh erfüllt diese Clientanforderung nicht.
[MCP: Resource Parameter Implementation](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#resource-parameter-implementation)
Die begrenzte Interoperabilitätskorrektur ist als explizite, standardmäßig
deaktivierte Option `allowRefreshResourceOmission` implementiert
(`POC_ALLOW_REFRESH_RESOURCE_OMISSION=1`); die private `connection.json`
vermerkt den booleschen Wert. Ausschließlich ein vollständig
fehlender `resource`-Parameter bei einem gültigen, demselben Client gebundenen
Refresh-Grant darf dann dessen einzige ursprünglich freigegebene Audience
beibehalten. Falsche, leere, fehlerhafte oder doppelte Resource-Parameter werden
weiterhin abgewiesen; Autorisierung und Codeaustausch bleiben strikt.
Scope-, Ablauf-, Rotation-, Replay- und Widerrufsprüfungen bleiben erhalten.
Die Policy stützt sich auf die Resource-Bindung ursprünglicher Grants nach
[RFC 8707 §2.2](https://www.rfc-editor.org/rfc/rfc8707.html#section-2.2).
Sie ist ein begrenzter OAuth-Interoperabilitätsweg und kein Nachweis von
Geminis MCP-Konformität. Der tatsächliche Host-Retest der Korrektur bestand
um **00:31:16 UTC**; der aktuelle vollständige lokale Teststand ist oben
separat erfasst.

OAuth, korrigierter Refresh, Werkzeug-Discovery, Chat-Reads, abgelehnte
Completion, bestätigte Completion samt Persistenz und exakter Replay sind
damit **PASS**.
Der technische Gemini-Kernweg ist mit dem Post-Profil und der begrenzten
Refresh-Option nachgewiesen; die vollständige Acceptance-Matrix bleibt
**NOT_PROVEN**. Der erste neue Chat scheiterte trotz nativer Verbindung;
auch der erneute Versuch scheiterte vor dem Tool-Aufruf. Unterbrochener Write
und Widerruf bleiben
**NOT_RUN**. Frühere frische App-/Pro-Modell-Versuche an der alten Origin sind
**TRANSPORT_CONFOUNDED**. Die frühere Nichtverfügbarkeit nach einem gültigen
Context 200 hat keine bestätigte Ursache und wird nicht der Ablehnung
zugeschrieben.

Die technische PoC-Bewertung ist damit abgeschlossen. Sie beendet nicht
Issue #70 oder eine vollständige Gemini-Integration. Frischer Login,
vollständiger Lernfluss und US-Beta-Onboarding bleiben außerhalb dieses
Durchstichs **NOT_RUN**.
Das optionale Skill-Archiv ist unverändert; sein Import und tatsächlicher
Einsatz in Gemini bleiben ebenfalls **NOT_RUN**.

Hostnachweise enthalten Datum, Host-/Modellbezeichnung, PoC-Build und
Protokollrevision, Testfall, bereinigte Request-Korrelation und den tatsächlichen
Testzustand vor/nach der Aktion. UI-Sichtbarkeit, Serveraufruf und gespeicherter
Zustand sind eigenständige Nachweise. Für einen erfolgreichen Test müssen die
zugehörigen Beobachtungen zusammenpassen.

Keine Roh-Callback-URIs mit Google-Kontokennung, Tokens, Client-Secrets,
Google-Kontoadressen, dauerhaften Lernendenkennungen oder persönlichen
Chatdaten veröffentlichen. Keine
Geburtsdaten oder Altersnachweise sammeln; die Anbieter-Voraussetzung wird
nicht als neue SkillPilot-Datenerhebung umgesetzt. Testmaterial bleibt
synthetisch. Ein lokaler automatischer Client ist im Protokoll ausdrücklich
als solcher gekennzeichnet und wird nie als Gemini-Web-Host geführt.
