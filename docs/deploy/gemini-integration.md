# SkillPilot in Gemini – lokaler Integrationskandidat

**Stand: 6. Oktober 2026.** Diese Integration verbindet die reale SkillPilot-
Lernlogik mit einer Gemini Custom App und einem importierbaren Coach-Skill.
Sie ist ein lokaler Kandidat, keine veröffentlichte oder ausgerollte Beta.
Die [synthetische PoC-Bewertung](gemini-custom-apps-poc.md) bleibt als eigener
historischer Befund erhalten. Das separate
[Integrations-Prüfprotokoll](gemini-integration-evidence-2026-10-06.json)
belegt inzwischen im tatsächlichen Gemini-Webhost den Skill-Import, echte
Lernwerkzeuge, gespeicherten Fortschritt und Fortsetzung in einem neuen Chat.
Getestet wurde ein eigenes Operator-Testprofil in einer separaten lokalen
Datenbank, mit vom Testagenten eingereichten fachlichen Aufgabenlösungen.
Dies ist keine Mehrnutzer- oder Langzeit-Lernstudie.

Der frühere Direktlink-Test bestätigte die Erreichbarkeit des öffentlichen
Lernzielbilds, jedoch keine Bildanzeige im Chat. Das ist historischer
Transportnachweis, keine Abnahme der Bildintegration. Erforderlich ist die
tatsächliche Anzeige des Lernzielbilds direkt im Gemini-Chat; sie bleibt
ungelöst. Kartenübung, Verified Recall,
Prüfungen und negative Sicherheitsfälle benötigen zusätzlich zu ihren lokalen
Tests eigene Host-Abnahme. Eine Produktionsbereitstellung wurde nicht vorgenommen.

Für den anschließenden kontrollierten Testbetrieb auf `skillpilot.com` sind
ein wiederholbar ausführbarer Installer, eine eigene Gateway-Unit und
nginx-Konfigurationen vorbereitet. Die [Deployment-Anleitung](https://github.com/enpasos/skillpilot/blob/main/deploy/gemini-v1/README.md)
beschreibt die privaten Schlüssel, die Ergänzung der bestehenden Spring-
Konfiguration, TLS und den exakt gemessenen Google-Callback. Diese Vorbereitung
aktiviert keine Produktionsdienste. Der normale Rollout prüft zudem die
unveränderte Skill-ZIP im Build und über den öffentlichen Download; HTML an
dieser Adresse wird als Fehler behandelt.

Ein zusätzlicher Test mit einer tatsächlich in der WebGUI erzeugten und
kopierten Startnachricht erreichte zunächst erfolgreiche OAuth-Erneuerung,
Initialisierung und Werkzeugliste, aber keinen Kontextaufruf. Gemini behauptete
fehlenden Toolzugriff. Nach expliziter erneuter **@SkillPilot**-Auswahl las der
Host um **02:17:25 UTC** den korrekten Zustand 10 und das aktive Nachfolgeziel,
ohne den Lernstand zu ändern. Dies bleibt ein beobachteter Dispatch-Fehlversuch
des Hosts ohne nachgewiesene Ursache. Keine Backend-JSON-Daten als Ersatz in den
Chat kopieren; die App erneut auswählen und den echten Kontextaufruf wiederholen.

Beim anschließenden lokalen Nutzertest am **6. Oktober 2026** berichtete der
Product Owner, dass der Werkzeugzugriff über **Gemini Spark BETA** funktioniert.
Der Gateway bestätigte den Kontextaufruf um **08:57:40 Uhr** und den Renderer
um **08:57:50 Uhr**, jeweils **Berliner Zeit (CEST, UTC+2)**, mit HTTP 200 und
erfolgreicher Werkzeugantwort. Im gelieferten Screenshot fehlt das Lernzielbild.
Die dortige Modellbegründung eines „Renderfehlers“ ist kein Nachweis eines
Serverfehlers. Die erforderliche Bildanzeige direkt im Chat bleibt ungelöst.
Bereits um **08:52 Uhr Berliner Zeit** hatte ein kontrollierter
normaler Gemini-Chat den Lernkontext erfolgreich geladen. Spark ist daher eine
beobachtete Alternative bei fehlendem Werkzeugzugriff, keine nachgewiesene
Voraussetzung für alle Konten. Die historischen Prüfprotokolle und Paket-Hashes
bleiben unverändert; dieser Anschlussversuch ersetzt deren Befunde nicht.

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
`/plugins/gemini/skillpilot-coach-v1-0.1.0.zip` automatisch vor. Das tatsächlich
importierte Archiv bleibt unter `ai/gemini/coach/artifacts/` erhalten. Die
Vorbereitung prüft seinen festen Hash und die enthaltenen Quellen und kopiert
die unveränderten Archivbytes; die Kompression hängt dadurch nicht von der
Python-/zlib-Version des Deployment-Hosts ab. Änderungen an der Skill-Datei
benötigen einen neuen versionierten Kandidaten und einen vollständigen erneuten
Importtest in Gemini.

Der tatsächliche Gemini-Import des ersten lokalen ZIP-Kandidaten wurde am
6. Oktober 2026 mit einem Hinweis auf einen nicht unterstützten Dateityp
abgelehnt. Das Archiv enthielt den Eintrag `LICENSE` ohne Dateiendung.
Der korrigierte Kandidat nennt dieselben Lizenzbytes `LICENSE.txt`;
`.txt` gehört zu den vom Importer unterstützten Dateitypen. Die fehlende
Endung ist eine plausible Ursache des beobachteten Fehlers, kein bestätigter
Root Cause. Der anschließende Host-Retest bestätigte den korrigierten Kandidaten;
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
Damit sind Import und gespeicherte Anweisungen nachgewiesen. Die anschließenden
getrennten Host-Prüfungen belegten den normalen Lernstart mit Skill und App,
einen erfolgreichen Mastery-Write nach fachlicher Aufgabenlösung und denselben
gespeicherten Zustand im neuen Chat. Der Retest mit den korrigierten Renderer-
Bytes speicherte um **01:59:31 UTC** den nächsten Erfolg (`stateVersion=10`)
und lud ihn um **02:02:53 UTC** in einem weiteren neuen Chat. Unabhängige
kanonische Zustandsabfragen bestätigen jeweils genau ein neu gemeistertes Ziel.

Google schaltet Skills schrittweise frei. Für Custom Apps nennt Google
derzeit ein persönliches Konto ab 18 Jahren, US-Zugang, Englisch und aktivierte
**Keep Activity**. Konto-Verfügbarkeit ist vor einem Betatest zu prüfen.
Siehe [Google: Custom Apps](https://support.google.com/gemini/answer/17209137?hl=en-12)
und [Google: Skills importieren](https://support.google.com/gemini/answer/17094296?hl=en).

Es gibt derzeit **kein öffentliches Beta-Onboarding**. Für einen eigenen
kontrollierten Test müssen der Gateway, sein erreichbarer HTTPS-Zugang und
die eigenen privaten OAuth-Clientdaten eingerichtet sein. Ein Backend-Rollout
allein stellt diese Verbindung nicht bereit. Die Einrichtung ist unter
[Gateway und Spring-Adapter](#lokalen-oauth-gateway-und-spring-adapter-starten)
beschrieben; einen allgemeinen Nutzerzugang oder gemeinsame Zugangsdaten
stellt die Auswahl **Gemini (Beta)** in der WebGUI nicht bereit.

1. In Gemini Web **Settings → Connected Apps → Custom apps → Add a custom app**
   öffnen. Ist noch keine App verbunden, heißt das URL-Feld laut Google
   **Add a custom app link to get started**. Die HTTPS-MCP-Serveradresse der
   eigenen vorbereiteten Testumgebung eintragen. Für den festen privaten
   OAuth-Client **Advanced features → Show more** öffnen; im beobachteten
   Testdialog hieß der Bereich **Additional settings**. Dort die eigene
   Client-ID und das eigene Client-Secret aus der privaten Testkonfiguration
   eintragen, **Next** wählen und Anmeldung/Freigabe für **SkillPilot**
   abschließen. Im abschließenden Dialog **Save your custom app** den Namen
   **SkillPilot** eintragen und nochmals **Connect** wählen. Erst wenn die App
   unter **Custom apps** erscheint, ist sie gespeichert. Google dokumentiert
   die erweiterten Verbindungsdaten als
   „credentials“, ohne die einzelnen Feldbeschriftungen zu nennen. Keine
   tatsächlichen Secrets, Callback-URLs oder temporären Serveradressen in die
   öffentliche Anleitung übernehmen.
2. Die ZIP unter **Gemini Settings → Skills** importieren.
3. In SkillPilot das Lernerprofil und den persönlichen Lernplan fertig
   einrichten, **Gemini (Beta)** wählen und eine Lernsession vorbereiten.
4. Einen neuen Gemini-Chat öffnen, mit **/** `skillpilot-coach-v1` auswählen
   und mit **@** die Custom App **SkillPilot** auswählen. Fehlen die Werkzeuge
   im normalen Chat und bietet das Konto **Gemini Spark BETA** beziehungsweise
   **Switch to Spark** an, diesen Modus wählen und Skill und App dort erneut
   auswählen. Danach die komplette vorbereitete Startnachricht einfügen und
   senden. Google schaltet Skills schrittweise frei; eine allgemeine
   Spark-Pflicht ist durch die bisherigen Tests nicht belegt.
5. Nur erfolgreiche Tool-Rückgaben gelten als gespeicherte Fortschritte.
   Gemini fragt bei Schreibzugriffen gegebenenfalls nach **Allow**; **Deny**
   muss den Lernstand unverändert lassen.

Ein erfolgreicher Renderer bestätigt keine Bildanzeige im Chat. Die Integration
benötigt eine tatsächliche Anzeige des Lernzielbilds direkt im Gemini-Host;
diese Integrationsgrenze ist noch offen.

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

Die Session hat eine absolute Laufzeit von 24 Stunden. Werkzeugaufrufe benötigen mindestens eine Stunde Restlaufzeit; starte daher spätestens nach 23 Stunden eine neue Lernsitzung. Eine OAuth-Erneuerung
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

Der globale Wert `skillpilot.public-base-url` bezeichnet dagegen den
öffentlichen SkillPilot-Origin für Cockpit- und kanonische Asset-Links, nicht
den Gemini-Gateway. Für Lernzielbilder muss dieser Origin gültige öffentliche
HTTPS-Assets unter `/assets/goal-visualizations/…` ausliefern. Der aktuelle
Gemini-Renderer liefert daraus validierte Bild-URLs. Dies bestätigt keine
Bildanzeige im Gemini-Chat. Ein privater
`localhost`-Origin ist für die Anzeige im entfernten Gemini-Host ungeeignet.
Beim lokalen Test dürfen bereits öffentliche Assets genutzt werden, während
Lernerprofil, Lernsession und Schreibzugriffe in der Entwicklungsdatenbank bleiben.

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

## Produktionsrollout und anschließende Aktivierung

Ein Backend-Rollout nach bestandener CI installiert zunächst die neue
Provider-Lane. **Er allein stellt noch keine Gemini-Verbindung bereit.** Der
normale [Deployment-Einstieg](deployment.md) `./deploy_skillpilot.sh` baut
WebGUI, Skill-Download und gemeinsames Spring-Backend. Er installiert oder
startet keinen Node-Gateway und richtet keinen Gemini-Domainnamen,
TLS-Endpunkt oder OAuth-Client ein. Ein reiner Java-Artefaktwechsel liefert
auch keine aktualisierte WebGUI.

| Stand | Tatsächlicher Effekt |
| --- | --- |
| Neues Backend, Gemini weiterhin deaktiviert | Neue Datenbanktabellen; keine Gemini-Beans, Security-Chain, Scheduler oder Routen |
| Zusätzlicher WebGUI-Build | Gemini-Auswahl und Skill-Download vorhanden; eine Lernsession benötigt weiterhin den aktivierten Backend-Adapter |
| Gemini-Adapter korrekt aktiviert | First-party Launch und interne MCP-Route verfügbar; öffentliches OAuth und MCP benötigen zusätzlich den Gateway |
| Gateway, HTTPS und exakt gepinnter Callback eingerichtet | Verbindung für das kontrollierte Operator-Konto testbar; kein automatisches Mehrnutzer-Onboarding |

Liquibase führt die additive Änderung `039-add-gemini-connector-v1` auch bei
deaktiviertem Gemini aus. Sie legt ausschließlich
`gemini_v1_learning_session`, `gemini_v1_session_idempotency`, deren Indizes und
Foreign Keys an. Sie migriert keine vorhandenen Lernenden, Mastery-Werte,
OAuth-Grants oder Claude-/OpenAI-Sitzungen. Vor dem üblichen Backend-Rollout
die vorhandene PostgreSQL-Sicherung verwenden; danach den ausgeführten
ChangeSet im Liquibase-Ledger prüfen. Die Gemini-Lane ist im Java-Default
`enabled=false`; alle wirksamen Beans tragen dieselbe Aktivierungsbedingung.
`GeminiV1DisabledContextTest` prüft fehlende operative Beans und MVC-Routen,
`GeminiV1RuntimeValidationTest` die Ablehnung fehlender Schlüssel, fremder
Audiences und widersprüchlicher öffentlicher URLs. Diese lokalen Tests sind
keine Produktions- oder Gemini-Host-Abnahme.

### Konkrete Operator-Folge

1. Den freigegebenen Commit und seine CI-Prüfungen festhalten und über den
   bestehenden Deployment-Einstieg ausrollen. Gemini zunächst deaktiviert
   lassen. Gemeinsame Readiness und die vorhandenen Provider prüfen.
2. Einen eigenen, dauerhaft verfügbaren HTTPS-Origin mit gültigem Zertifikat
   wählen. Für den laufenden Betrieb sollen OAuth-Issuer, Ressourcenname und
   Callback stabil bleiben; eine feste VPN-IP ist nicht erforderlich. Den
   Beispiel-Domainnamen nicht als eingerichteten Dienst behandeln.
3. Den Node-22-Gateway aus demselben geprüften Commit im **gleichen
   Netzwerk-Namespace** wie das bestehende Spring-Backend installieren.
   Auf einem gewöhnlichen Host können beide Prozesse nebeneinander laufen.
   Separate Container brauchen einen ausdrücklich gemeinsamen Namespace;
   zwei unabhängige Container auf demselben Host teilen ihr Loopback nicht.
   Der Upstream bleibt die exakte HTTP-Loopback-Adresse
   `http://127.0.0.1:<bestehender-backend-port>/gemini/v1/mcp`.
4. Die fünf eigenen Schlüssel privat bereitstellen: Gemini-Session-Signing,
   Gemini-Capability, Gateway-Assertion, Operator-Zustimmung und vertraulicher
   OAuth-Client. Mindestens 32 zufällige Bytes je Schlüssel verwenden und
   keinen bestehenden Provider-Schlüssel ersetzen. Nur der Assertion-Schlüssel
   ist zwischen dem Gemini-Gateway und Gemini-Spring-Adapter identisch.
   Die Gateway-Dateien liegen unter `.runtime/` **der installierten
   Gateway-Kopie**; der CLI bietet keinen abweichenden Config-Verzeichnis-
   Parameter. Eigentümer und Dateirechte müssen dem Gateway-Prozess das Lesen
   erlauben, ohne die Dateien öffentlich zugänglich zu machen.
5. Den `skillpilot.gemini.connector.v1`-Block aus der obigen Spring-
   Zusatzkonfiguration mit dem gewählten Origin einrichten. **Nicht** die
   lokalen Beispielwerte `server.address`, `server.port` oder eine
   Entwicklungsdatenbank auf die bestehende Produktion übertragen. Der
   Adapter verwendet dieselbe produktive Datasource und kanonische Lernlogik
   wie das vorhandene Backend; seine Session-/Replaytabellen bleiben getrennt.
6. Die Zusatzdatei für den tatsächlichen Spring-Service lesbar installieren
   und über `SPRING_CONFIG_ADDITIONAL_LOCATION=file:/…/gemini-v1.yml` in das
   vorhandene, normalerweise `/etc/skillpilot/skillpilot.env` genannte
   systemd-EnvironmentFile einbinden. Bereits vorhandene Zusatzkonfiguration
   erhalten. Die YAML-Platzhalter benötigen dort
   `GEMINI_GATEWAY_SECRET`, `GEMINI_SESSION_SIGNING_SECRET` und
   `GEMINI_CAPABILITY_SECRET`; dieselbe Gateway-Secret-Datei nutzt den ersten
   Wert. `enabled: true` aktiviert erst nach vollständiger Konfiguration.
   Spring verweigert bei ungültigen Werten den Start des gemeinsamen Prozesses;
   deshalb die exakte Konfiguration vor dem Neustart prüfen. Keine Secret-
   Werte in Shell-Ausgaben oder Release-Protokolle schreiben.
7. Den Gateway als eigenen überwachten Node-Prozess starten, Loopback-
   Health prüfen und den eigenen HTTPS-vHost ausschließlich auf diesen
   Gateway schalten. Anschließend öffentliche Health-/OAuth-Metadaten und
   den exakten Ressourcenwert `<origin>/mcp` kontrollieren.
8. Für das vorgesehene eigene Gemini-Konto den unbekannten Callback zunächst
   ablehnen lassen, aus diesem Verbindungsversuch privat erfassen und genau
   pinnen. Gateway neu starten, Custom App erneut verbinden, Skill importieren
   und eine frische WebGUI-Lernsession mit einem Testprofil starten. Erst echte
   Tool-Aufrufe und kanonische Zustandskontrollen belegen diesen Betrieb.

Der Gateway bindet selbst ausschließlich an `127.0.0.1`; Port und Upstream
wählen `GEMINI_GATEWAY_PORT` und `GEMINI_BACKEND_MCP_URL`. Es ist keine
weiter entfernte Backend-URL zulässig. Vorhandene globale Listener-,
Forwarded-Header-, Datasource-, OpenAI- und Claude-Einstellungen benötigen
für Gemini keine Änderung. Der Edge darf `/gemini/v1/**` nicht öffentlich auf
Spring veröffentlichen. Am eigenen Gemini-HTTPS-vHost bleiben die folgenden
Gateway-Pfade unverändert; andere Pfade erhalten `404`:

```text
/mcp
/authorize  /consent  /token  /revoke
/health  /privacy
/.well-known/oauth-authorization-server
/.well-known/oauth-protected-resource
/.well-known/oauth-protected-resource/mcp
```

Den bestehenden OpenAI-/Claude-vHost nicht für Gemini umwidmen. Proxy- und
Service-Logs dürfen keine Authorization-Header, Bodies oder vollständigen
OAuth-Querystrings speichern; für Zugriffsprotokolle genügen Pfad, Methode
und Status. Querystrings auf `/authorize` enthalten private Zustands- und
Callbackwerte. Der aktuelle Gateway läuft als ein Operator-Prozess ohne
gemeinsamen OAuth-Speicher für mehrere Instanzen. Neustarts löschen seine
Grants, und auch ohne Neustart benötigt das Konto spätestens nach einer
Stunde eine neue Verbindung. Diese Betriebsgrenze bleibt nach einem
Produktionsrollout bestehen.

Zum Zurücknehmen der Aktivierung den eigenen Gemini-vHost sperren, den
Gateway stoppen und Gemini im Spring-Zusatzblock auf `enabled: false` setzen;
anschließend den gemeinsamen Backend-Prozess regulär neu starten. Vorhandene
Lernerdaten und die additiven Tabellen erhalten. Ein Gateway-Neustart ist
kein Mastery-Rollback und verlängert keine Lernsession.

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
  erkennbarer Zustimmung, mit korrekt direkt im Gemini-Chat angezeigtem
  Lernzielbild;
- denselben gespeicherten Zustand in einem neuen Chat wieder laden;
- Ablehnung, Wiederholung, abgelaufene Session und widersprüchliche Version
  verändern oder überschreiben keinen unautorisierten Lernstand;
- normale Karten, Verified Recall und Prüfungen halten Antwort- und
  Bewertungsgrenzen ein.

Für jeden Nachweis Paket-/Quellhash, tatsächlichen Host, Zeitpunkt, Toolstatus
und kanonische Zustandsänderung erfassen. Keine Tokens, Callbacks mit Konto-ID,
Chattranskripte, Antworten oder dauerhaften Lerner-IDs veröffentlichen.
Die neue-Chat-Dispatch-Störung des synthetischen PoC bleibt als historischer
Fehlversuch dokumentiert; ihre Ursache ist nicht nachgewiesen. Die spätere
Integration bestand kontrollierte Wiederholungen mit gesundem Endpoint,
erneut ausgewähltem Skill und App und derselben ursprünglichen Lernsession.
Echte Kontextaufrufe luden den gespeicherten Zustand und zeigten das richtige
Nachfolgeziel. Das beweist diesen geprüften Ablauf, keine allgemeine
Verfügbarkeitsgarantie für andere Konten oder spätere Host-Versionen.

Die lokale Umsetzung autorisiert keine Produktionsbereitstellung, öffentliche
Beta-Verteilung, Portal-Veröffentlichung oder Änderung bestehender Credentials.
