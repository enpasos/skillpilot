# SkillPilot in Gemini – lokaler Integrationskandidat

**Stand: 6. Oktober 2026.** Diese Integration verbindet die reale SkillPilot-
Lernlogik mit einer Gemini Custom App und einem importierbaren Coach-Skill.
Sie ist ein lokaler Kandidat, keine veröffentlichte oder ausgerollte Beta.
Die [synthetische PoC-Bewertung](gemini-custom-apps-poc.md) bleibt unverändert;
ihre erfolgreichen Probe-Schreibzugriffe beweisen keinen echten Lernablauf.
Aktuelle tatsächliche Gemini-Abnahme gehört in ein separates Prüfprotokoll.

## Komponenten und Grenzen

| Komponente | Aufgabe |
| --- | --- |
| `ai/gemini/coach/SKILL.md` | Funktionale Coach-Anweisungen, Apache-2.0 |
| Gemini Custom App **SkillPilot** | Registrierte MCP-Tools für den kanonischen Lernstand |
| `ai/gemini/gateway` | Eigener OAuth-Gateway und signierte, auf Loopback begrenzte Backend-Verbindung |
| Gemini Lernsession `spg_…` | Eigene kurzlebige Sitzung; dauerhafte Lern-ID bleibt im Backend |
| `CoachToolFacade` und `CoachStateProjection` | Gemeinsame Lernlogik und sichere Modelldaten |
| WebGUI **Lernen starten → Gemini (Beta)** | Eigene Lernsession vorbereiten und Startnachricht übergeben |

Gemini hat eigene OAuth-Verbindungen, Fähigkeiten, Sitzungen und Replay-Daten.
Autorisierte Anbieter arbeiten am selben kanonischen Lernerprofil; es gibt
keine zweite Mastery-Datenbank. Die bestehenden Claude-/OpenAI-Pakete und
veröffentlichten UI-Ressourcen werden nicht verändert. Lernantworten,
Chattranskripte und Modellbegründungen werden nicht an SkillPilot gesendet.

Der Gemini Adapter bietet native Text-/JSON-Antworten und autorisierte Bilder.
Er setzt keine Claude- oder ChatGPT-HTML-Widgets voraus. Normale Kartenübung
hat eine separate Antwortfreigabe und ausdrückliche Selbsteinschätzung;
Verified Recall und Prüfungen behalten ihre geschützten Antwortgrenzen.

## Coach-Skill bauen und einrichten

```bash
python3 ai/gemini/coach/scripts/package_skill.py --frontend
python3 ai/gemini/coach/scripts/test_package.py
```

Die reproduzierbare ZIP-Datei liegt unter
`ai/gemini/coach/dist/skillpilot-coach-v1-0.1.0.zip`. Sie enthält ausschließlich
`SKILL.md` und `LICENSE.txt` auf der Wurzelebene. `LICENSE.txt` enthält exakt
die Bytes der Apache-2.0-Datei `LICENSE` im Repository. Das Manifest dokumentiert
Quell- und ZIP-Hashes; es enthält keine Zugangsdaten. Der normale Frontend-
Build bereitet den Download unter
`/plugins/gemini/skillpilot-coach-v1-0.1.0.zip` automatisch vor. Änderungen an
der Skill-Datei benötigen einen vollständigen erneuten Import in Gemini.

Der tatsächliche Gemini-Import des ersten lokalen ZIP-Kandidaten wurde am
6. Oktober 2026 mit einem Hinweis auf einen nicht unterstützten Dateityp
abgelehnt. Das Archiv enthielt den Eintrag `LICENSE` ohne Dateiendung.
Der korrigierte Kandidat nennt dieselben Lizenzbytes `LICENSE.txt`;
`.txt` gehört zu den vom Importer unterstützten Dateitypen. Die fehlende
Endung ist eine plausible Ursache des beobachteten Fehlers, kein bestätigter
Root Cause. Der folgende Host-Retest prüft den korrigierten Kandidaten;
die erste Ablehnung bleibt als historischer Befund erhalten.

Der **korrigierte Skill-ZIP-Import ist im tatsächlichen Gemini-Host bestätigt**:
am **6. Oktober 2026 um 01:17:28 UTC** über **Upload skill → files → ZIP →
Save skill**. Der gespeicherte Skill `skillpilot-coach-v1` war um
**01:19:30 UTC** in der Skill-Bibliothek sichtbar. Im importierten Editor
standen 13.690 Zeichen Coach-Anweisungen, einschließlich des Memory-/Mastery-
Toolvertrags. Der Inhalts-Hash entspricht dem kanonischen Skill-Text nach
Entfernung des Frontmatters und äußerem Whitespace-Trim.
Der tatsächlich getestete ZIP-Hash lautet
`2a5f5de47cd04345196cd21f0ab4dc4e0b3247b509a9deaaa0e2f8cd74d30a40`.
Damit sind Import und gespeicherte Anweisungen nachgewiesen. Ob Gemini sie im
Lernchat korrekt anwendet, echten Fortschritt speichert und in einem neuen
Chat weiterlernt, benötigt weiterhin eigene Host-Prüfungen.

Google schaltet Skills schrittweise frei. Für Custom Apps nennt Google
derzeit ein persönliches Konto ab 18 Jahren, US-Zugang, Englisch und aktivierte
**Keep Activity**. Konto-Verfügbarkeit ist vor einem Betatest zu prüfen.
Siehe [Google: Custom Apps](https://support.google.com/gemini/answer/17209137?hl=en-12)
und [Google: Skills importieren](https://support.google.com/gemini/answer/17094296?hl=en).

1. Den freigegebenen Beta-MCP-Zugang als Custom App mit Namen **SkillPilot**
   verbinden. Serveradresse und eigene Verbindungsdaten müssen zur tatsächlich
   getesteten Umgebung gehören; keinen gemeinsamen Produktions-Client-Secret
   in eine öffentliche Anleitung schreiben.
2. Die ZIP unter **Gemini Settings → Skills** importieren.
3. In SkillPilot das Lernerprofil und den persönlichen Lernplan fertig
   einrichten, **Gemini (Beta)** wählen und eine Lernsession vorbereiten.
4. Einen neuen Gemini-Chat öffnen, mit **/** `skillpilot-coach-v1` auswählen
   und mit **@** die Custom App **SkillPilot** auswählen. Danach die komplette
   vorbereitete Startnachricht einfügen und senden.
5. Nur erfolgreiche Tool-Rückgaben gelten als gespeicherte Fortschritte.
   Gemini fragt bei Schreibzugriffen gegebenenfalls nach **Allow**; **Deny**
   muss den Lernstand unverändert lassen.

Die UI öffnet ausschließlich `https://gemini.google.com/app?hl=en`, ohne
Sitzungsschlüssel als URL-Parameter. Die Startnachricht bleibt im aktuellen
UI-Zustand und wird nur auf ausdrücklichen Klick kopiert. Providerwechsel,
Profil-/Lernplanwechsel und Seitenwechsel verwerfen die angezeigte Session.

## Backend-Vertrag

```text
POST /api/ui/learners/{skillpilotId}/gemini/v1/launch
Body: {"communicationLocale":"de"|"en","client":"web-start"}
Response: {"prompt":"…","webUrl":"https://gemini.google.com/app?hl=en",
           "learningSessionId":"spg_…","expiresAt":"…"}
```

Der Provider ist standardmäßig deaktiviert und benötigt explizite lokale
Konfiguration unter `skillpilot.gemini.connector.v1`. Die interne MCP-Route
ist `/gemini/v1/mcp`; der vorgesehene öffentliche Ressourcenname
`https://mcp-gemini-v1.skillpilot.com/mcp` ist ein Konfigurationsziel,
kein Nachweis einer existierenden Bereitstellung. Root-Origin, Audience,
OAuth-Profil, Callback und Gateway-Vertrauen müssen zur konkret getesteten
HTTPS-Umgebung passen. Fehlgeschlagene Authentifizierung darf keinen anderen
Anbieter oder öffentlichen Client als Fallback verwenden.

Die Session hat eine absolute Laufzeit von 24 Stunden. Eine OAuth-Erneuerung
verlängert sie nicht. Für einen neuen Chat Skill und App erneut auswählen,
die noch gültige Startnachricht senden und frischen Kontext laden. Nach Ablauf
in der WebGUI eine neue Session vorbereiten. Kanonisch gespeicherter Fortschritt
bleibt erhalten; Chat-Verfügbarkeit und Session-Gültigkeit sind getrennte Fragen.

Die im Backend festgelegte Sitzungssprache steuert das Coaching. Die englische
Gemini-Oberfläche und die Sprache des Unterrichtsmaterials ändern diese
Sitzungssprache nicht. Lernplan-Status gilt für den serverseitig ausgewählten
Tag oder die Woche; der Standard ist eine Wochenplanung.

## Lokalen OAuth-Gateway und Spring-Adapter starten

Der aktuelle Weg besteht aus einem Node.js-Gateway und dem Spring-Adapter:

```text
Gemini Custom App
  → tatsächlich eingerichteter HTTPS-Origin /mcp
  → Node-Gateway auf 127.0.0.1:8795
  → signierte POST-Anfrage an 127.0.0.1:8080/gemini/v1/mcp
  → kanonische SkillPilot-Lernlogik und separate Entwicklungsdatenbank
```

Voraussetzungen: **Node.js 22.22.0**, **Amazon Corretto 25** gemäß
`.java-version`/`.corretto-version`, Python 3 für den Skill-Build und eine
separate lokale Entwicklungsdatenbank. Den Backend-Testbetrieb nicht an eine
Produktionsdatenbank oder vorhandene Produktions-Credentials anschließen.
Der öffentliche HTTPS-Zugang muss ausschließlich den Gateway erreichen;
Spring und private Konfiguration bleiben lokal. Eine temporäre HTTPS-Adresse
ist verwendbar, solange sie den Test überlebt. Ein Adresswechsel benötigt
neuen Origin, neue Audience, einen dazu passenden exakt gemessenen Callback
und eine neue Gemini-Verbindung. Eine feste VPN-IP ist dafür nicht notwendig.

### Private Gateway-Konfiguration

Unter `ai/gemini/gateway/.runtime/` folgende Dateien vorbereiten. Das Verzeichnis
ist Git-ignoriert und erhält Modus `0700`; alle Dateien erhalten `0600`.
Werte ausschließlich in der privaten lokalen Konfiguration speichern.

| Datei | Inhalt |
| --- | --- |
| `connection.json` | Nicht veröffentlichter Origin und das feste Client-Profil, Schema unten |
| `operator-key` | Zufälliger Schlüssel für die lokale OAuth-Zustimmungsseite |
| `client-secret` | Eigener zufälliger Secret des exakt konfigurierten vertraulichen Clients |
| `gateway-secret` | Eigener Schlüssel mit mindestens 32 Bytes, identisch nur zwischen Gateway und Gemini-Spring-Adapter |
| `gemini-callback.txt` | Eine vollständig gemessene, exakt zugelassene Redirect-URI je Zeile |

`operator-key`, `client-secret` und `gateway-secret` sind verschieden. Keine
OpenAI-/Claude-Schlüssel wiederverwenden. Der Gateway-Schlüssel unterscheidet
sich außerdem von den Gemini-Session- und Capability-Schlüsseln im Backend.
Die Zustimmung erfolgt über den `operator-key`, nicht über eine dauerhafte
Lerner-ID. Google-Callbacks können eine Konto-ID enthalten; sie bleiben privat.

Schema von `connection.json`, mit einem **reinen Beispiel-Origin**:

```json
{
  "origin": "https://gemini-beta.example.org",
  "clientId": "skillpilot-gemini-beta",
  "clientAuthMethod": "client_secret_post",
  "allowRefreshResourceOmission": false
}
```

`origin` ist der tatsächlich eingerichtete HTTPS-Origin ohne Pfad, Query oder
Fragment. Er muss exakt zur Backend-Audience `<origin>/mcp` passen.
`clientAuthMethod` ist ein festes Profil: `client_secret_post` oder
`client_secret_basic`, niemals ein automatischer Fallback nach einem Fehler.
Das gemessene Gemini-PoC-Profil verwendete Post. Der ausführbare Gateway
aktiviert weder DCR noch einen öffentlichen OAuth-Client.

`allowRefreshResourceOmission` ist ein echtes JSON-Boolean, niemals der String
`"true"` oder `"false"`. Der Standard `false` verlangt die Ressource auch beim
Refresh. Die explizite Kompatibilität `true` akzeptiert nur das vollständige
Fehlen der Ressource auf einem bereits validierten, noch gültigen Refresh-Grant
für dieselbe einzige Audience. Eine andere, leere, doppelte oder malformed
Ressource bleibt verboten. Die Option ist nur wegen des tatsächlich gemessenen
Gemini-Verhaltens vorgesehen; sie erweitert keinen anderen Provider.

Einen unbekannten Callback zunächst ablehnen lassen. Seine vollständige URI
nur aus dem eigenen aktuellen Verbindungsversuch privat erfassen, prüfen und
als exakten Eintrag pinnen. Der Audit protokolliert für unbekannte Callbacks
lediglich Origin und Fingerprint. Kein Callback wird geraten oder über einen
Wildcard-Host, Kontobereich oder URL-Präfix erlaubt. Nach Callback-Änderung den
Gateway neu starten und Gemini erneut verbinden.

### Private Spring-Konfiguration

Den Adapter explizit aktivieren und alle öffentlichen Werte auf denselben
tatsächlichen HTTPS-Origin setzen. Beispiel für eine private zusätzliche
Spring-YAML-Datei; Secret-Platzhalter sind durch eigene lokale Schlüssel zu
ersetzen oder über einen privaten Secret-Mechanismus bereitzustellen:

```yaml
server:
  address: 127.0.0.1
  port: 8080
skillpilot:
  gemini:
    connector:
      v1:
        enabled: true
        public-base-url: https://gemini-beta.example.org
        public-mcp-url: https://gemini-beta.example.org/mcp
        public-resource-metadata-url: https://gemini-beta.example.org/.well-known/oauth-protected-resource/mcp
        public-auth-server-metadata-url: https://gemini-beta.example.org/.well-known/oauth-authorization-server
        public-documentation-url: https://enpasos.github.io/skillpilot/deploy/gemini-integration/
        gateway-audience: https://gemini-beta.example.org/mcp
        gateway-secret: ${GEMINI_GATEWAY_SECRET}
        signing-secret: ${GEMINI_SESSION_SIGNING_SECRET}
        capability-secret: ${GEMINI_CAPABILITY_SECRET}
```

Zusätzlich die getrennte lokale Datenbank konfigurieren. Die drei Backend-
Schlüssel benötigen jeweils 32–4096 Zeichen ohne Whitespace und müssen
voneinander und von anderen Provider-Schlüsseln verschieden sein. Nur
`gateway-secret` ist mit der gleichnamigen privaten Gateway-Datei identisch.
`enabled: true` ist ein YAML-Boolean; alternativ aktiviert
`SKILLPILOT_GEMINI_CONNECTOR_V1_ENABLED=true` den Adapter über Spring's
Umgebungsbindung. Fehlende oder widersprüchliche Einstellungen verhindern den
Start. Bei deaktiviertem Adapter existieren keine Gemini-Lernsession- oder
MCP-Routen und keine aktiven Gemini-Datenbank-Repositories.

Die private Zusatzdatei über `SPRING_CONFIG_ADDITIONAL_LOCATION=file:/…`
einbinden. Danach den Backend-Prozess mit dem festgelegten JDK starten und in
einem zweiten Prozess den Gateway ausführen:

```bash
cd ai/gemini/gateway
npm ci --ignore-scripts
npm test
GEMINI_GATEWAY_PORT=8795 \
GEMINI_BACKEND_MCP_URL=http://127.0.0.1:8080/gemini/v1/mcp \
npm start
```

Die Gateway-Umgebungsvariablen wählen nur Port und den exakten Loopback-
Upstream. OAuth-Booleans werden aus dem privaten JSON gelesen, nicht aus
String-Werten der Shell. `npm start` liest die privaten Dateien und bindet
an `127.0.0.1`; es erzeugt oder veröffentlicht keine Credentials.

### OAuth und Transport-Laufzeiten

Der Gateway stellt `/mcp`, `/authorize`, `/consent`, `/token`, `/revoke`,
`/health`, `/privacy` und die OAuth-Metadaten unter `.well-known` bereit.
Die Custom App bekommt die öffentliche `<origin>/mcp`-Adresse und das eigene
exakte Client-Profil über Gemini **Advanced settings**. Auf der Zustimmungsseite
den privaten Verbindungsschlüssel eingeben und anschließend den angebotenen
Link zurück zu Gemini nutzen. Der veröffentlichte Spring-Default-Domainname
ist hierfür kein Nachweis einer bereitgestellten Umgebung.

Der Gateway akzeptiert exakt `skillpilot.read skillpilot.write`; er bietet
keinen stillen Scope-Fallback. Autorisierungscode: 120 Sekunden und einmalig;
Zustimmung: 5 Minuten; Zugriffstoken: 5 Minuten; Refresh-Familie: absolut
1 Stunde mit Rotation und Widerruf bei Wiederverwendung. OAuth-Grants liegen
im Gateway-Speicher und gehen bei einem Neustart verloren. Nach Neustart oder
Grant-Ablauf muss die Custom App erneut verbunden werden. Davon unabhängig
bleibt die Lernsession maximal 24 Stunden gültig; eine neue Transport-
Verbindung verlängert sie nicht.

Jede weitergeleitete MCP-Anfrage erhält eine neue HMAC-SHA256-Assertion mit
30 Sekunden Gültigkeit. Sie bindet Audience, OAuth-Verbindung, Scopes, Methode,
exakten internen Pfad und SHA256 der ursprünglichen Body-Bytes. Spring
akzeptiert nur Loopback, prüft die Signatur und verwirft Replay. Der OAuth-
Bearer des Nutzers wird nicht an Spring weitergegeben. Die Gateway-Assertion
identifiziert keine lernende Person; dafür bleibt `spg_…` erforderlich.
Native Spring-JSON- oder einzelne SSE-Ergebnisse werden zu einer begrenzten
JSON-MCP-Antwort normalisiert, ohne HTML-Widgets vorauszusetzen.

Dieser Gateway ist ein **operatorverwaltetes Einzelprofil für kontrollierte
Integrationstests**. Er ist kein abgenommener öffentlicher Dienst für mehrere
Konten. Eine öffentliche Mehrnutzer-Beta benötigt eigenes per-Konto-Onboarding,
geeignete Clientregistrierung, langlebige Grant-Verwaltung und eine gesonderte
Abnahme. Der aktuelle Verbindungsschlüssel oder Client-Secret darf nicht an
eine allgemeine Nutzergruppe verteilt werden.

## Lokale Prüfung und CI

```bash
# Node 22.22.0 im PATH
npm --prefix ai/gemini/gateway test
python3 ai/gemini/coach/scripts/test_package.py
npm --prefix app run test:gemini-v1-start
```

Backend mit dem repositoryweit festgelegten Corretto:

```bash
cd backend
./gradlew test --console=plain --tests 'com.skillpilot.backend.connectors.gemini.v1.*Test'
```

Der Workflow `.github/workflows/gemini-integration.yml` prüft Gateway-OAuth und
Assertion-Transport, den gesamten Gemini-Backend-Testnamensraum, den normalen
GUI-Einstieg in Chromium, den unveränderten Claude-Handoff, TypeScript/Vite-
Build und das reproduzierbare Skill-ZIP einschließlich bytegleichem Download.
Die Backend-Berichte müssen alle Gemini-Testklassen ohne Skips enthalten.
Dieser Workflow arbeitet ohne Google-Konto, private Verbindung oder reale
Gemini-Sitzung und liefert daher ausschließlich lokale Prüfbelege.

## Abnahme vor Freigabe

Lokale Tests sind kein Gemini-Hostnachweis. Vor einer Freigabe muss das gleiche
getestete Paket im tatsächlichen Gemini-Konto diese Abläufe zeigen:

- Custom App verbinden, OAuth-Erneuerung und echte Tool-Aufrufe;
- importierter Skill steuert den Lernstart über die normale WebGUI;
- echter Lernkontext, autorisierte Aufgabe, ausreichende unabhängige Evidenz,
  bestätigter Mastery-Write und identischer Fortschritt im Cockpit;
- weitere Aufgabe beziehungsweise backendgewähltes Nachfolgeziel erst nach
  erkennbarer Zustimmung, mit korrekter Bilddarstellung;
- denselben gespeicherten Zustand in einem neuen Chat wieder laden;
- Ablehnung, Wiederholung, abgelaufene Session und widersprüchliche Version
  verändern oder überschreiben keinen unautorisierten Lernstand;
- normale Karten, Verified Recall und Prüfungen halten Antwort- und
  Bewertungsgrenzen ein.

Für jeden Nachweis Paket-/Quellhash, tatsächlichen Host, Zeitpunkt, Toolstatus
und kanonische Zustandsänderung erfassen. Keine Tokens, Callbacks mit Konto-ID,
Chattranskripte, Antworten oder dauerhaften Lerner-IDs veröffentlichen.
Die bekannte neue-Chat-Dispatch-Störung aus dem PoC bleibt ein offener
Hostbefund, bis eine kontrollierte Wiederholung mit gesundem Endpoint und
aktivem Skill/App den vollständigen Ablauf bestätigt. Ihre Ursache ist
nicht nachgewiesen.

Die lokale Umsetzung autorisiert keine Produktionsbereitstellung, öffentliche
Beta-Verteilung, Portal-Veröffentlichung oder Änderung bestehender Credentials.
