# ChatGPT-Test und Plugin-Handoff

## 1. Vorbedingungen

Für einen realen ChatGPT-Test benötigt jede App einen öffentlich erreichbaren
HTTPS-Endpunkt. Für maximale Robustheit sind zwei getrennte App-Registrierungen
vorgesehen:

| App | lokaler Prototyp | vorgesehener MCP-Endpunkt |
| --- | --- | --- |
| SkillPilot Coach DE v1 | `/mcp/de` | `https://mcp-coach-de-v1.skillpilot.com/mcp` |
| SkillPilot Coach English | `/mcp/en` | noch nicht freigegeben |

Der Node-Endpunkt `/mcp/de` ist ausschließlich Prototyp. Der ausgelieferte
deutsche Vertrag und das versionierte Plugin-Paket verwenden den dedizierten
V1-Origin. Die zugehörige OAuth-Resource/Audience ist exakt der vollständige
Endpoint-URL `https://mcp-coach-de-v1.skillpilot.com/mcp`. Es gibt keinen
öffentlichen Kompatibilitätsalias.

Für den ersten Developer-Mode-Test kann ein kurzlebiger HTTPS-Tunnel auf den
lokalen Server zeigen. Dabei gelten zwingend:

- nur synthetische Testdaten;
- keine produktiven SkillPilot-Konten;
- Tunnel unmittelbar nach dem Test schließen;
- URL nicht weitergeben;
- No-Auth niemals als Produktionskonfiguration behandeln.

Der Server bindet absichtlich nur an `127.0.0.1`. Ein auf demselben Rechner
laufender HTTPS-Tunnel leitet auf `127.0.0.1:8790` weiter; eine externe Bindung
über `HOST=0.0.0.0` ist dafür nicht erforderlich.

Ein kostenloser, nicht reservierter Tunnel kann nach einer Unterbrechung eine
neue URL erhalten. Antwortet eine zuvor registrierte URL mit `503 no tunnel
here`, muss die Developer-Mode-App auf die neue URL zeigen oder neu angelegt
werden. Flüchtige Tunnel-URLs gehören weder in Quellcode noch in ein
Plugin-Manifest.

## 2. Developer-Mode-Apps gestuft anlegen

In ChatGPT:

1. **Settings → Security and login → Developer mode** aktivieren.
2. **Settings → Plugins** beziehungsweise `chatgpt.com/plugins` öffnen.
3. Eine App **SkillPilot Coach DE v1** mit dem öffentlichen DE-MCP-Endpunkt
   anlegen.
4. Zuerst nur den deutschen End-to-End-Ablauf stabilisieren und abnehmen.
5. Erst danach eine zweite App **SkillPilot Coach English** mit dem öffentlichen
   EN-MCP-Endpunkt anlegen und denselben Abnahmelauf separat durchführen.

ChatGPT zeigt in den App-Metadaten unter anderem eine App-ID `asdk_app_…` und
eine Versions-ID `asdk_app_v_…`. Die `asdk_app_…`-ID ist der Wert der
hostgenerierten `.app.json`-Abbildung; die Versions-ID dient der Diagnose. Eine
separat sichtbare `plugin_asdk_app_…`-Kennung identifiziert die
Remote-Plugin-Registrierung und wird nicht als App-ID in `.app.json`
eingetragen.

Die Verfügbarkeit von Installation, Authentifizierung und Nutzung kann laut
OpenAI von Tarif, Workspace-Einstellungen, Rolle, Oberfläche, Region und
App-Funktionen abhängen. Deshalb müssen kostenloser Zugang und festes Abo als
getrennte reale Akzeptanzfälle geprüft werden; aus der Sichtbarkeit des Plugin-
Verzeichnisses allein folgt noch keine Nutzbarkeit.

## 3. Produkt- und Prototyp-Akzeptanz getrennt halten

### 3.1 Aktueller chat-first deutscher Produktpfad mit Zielbild-UI

1. In SkillPilot mit einem geeigneten Testlernenden **Lernen starten** wählen
   und einen neuen Chat ohne alten Kontext öffnen.
2. Im Plugin-Pilot Plugin und Skill explizit auswählen und die von SkillPilot
   vorbereitete Startnachricht unverändert absenden.
3. Erwartung: Der Coach lädt vor der ersten fachlichen Antwort den frischen
   SkillPilot-Kontext. Lernsession, Token und technische Auswahlkeys erscheinen
   nicht in der Antwort. Ist das aktive Ziel atomar und besitzt einen passenden
   kanonischen Bildlink, erscheint zusätzlich die read-only Lernzielkarte mit
   Alttext und Cockpit-Link.
4. Bei der Testpersonalisierung „Grundkurs“ als normalen Chattext antworten.
   Erwartung: Genau die aktuell veröffentlichten Optionen sind sichtbar, die
   Auswahl wird bestätigt gespeichert und der Folgezustand frisch geladen.
5. Einen fachlich richtigen, aber anders als eine Musterlösung formulierten Weg
   einreichen. Erwartung: Der Coach bewertet fachlich statt nach Wortlaut und
   speichert Mastery erst nach der geforderten sichtbaren Evidenz.
6. Im Prüfungsmodus eine vollständige sichtbare Abgabe senden. Erwartung: kein
   Scaffolding, keine Bewertung vor vollständiger Abgabe, danach faire
   kriteriumsbezogene Punkte und nur bei bestandenem Ergebnis eine bestätigte
   Mastery-Speicherung. Es gibt in diesem chat-first Pfad keinen Widget-Button
   **Lösung jetzt bewerten lassen**.
7. Einen neuen normalen User-Turn senden. Erwartung: Das Modell lädt den
   aktuellen Zustand frisch, fragt nicht nach einer alten ID und fällt nicht
   auf eine abgeschlossene Auswahl zurück.
8. Chat neu laden und erneut fortsetzen. Danach einen längeren Dialog bis zu
   plausibler Host-Kontextkompaktierung führen und denselben
   Rehydrationsnachweis wiederholen.
9. Einen Plugin-Starter ohne vorbereitete Lernsession öffnen. Erwartung: kein
   Toolaufruf und eine knappe Rückführung zu SkillPilot und **Lernen starten**.
10. Ein Clusterziel und ein atomares Ziel ohne gültiges Bild laden. Erwartung:
    keine leere oder defekte Karte; die normale Chatdarstellung bleibt
    vollständig nutzbar.
11. Ein erlaubtes atomares Ziel mit passendem Bild aktivieren. Erwartung:
    `set_skillpilot_active_goal_de` aktualisiert die Karte automatisch. Das Bild
    wird nicht als Evidenz, Aufgabe, Lösung oder Mastery-Nachweis behandelt.

### 3.2 Widget-Prototyp als getrennte Baseline

Der lokale `/mcp/de`-Prototyp behält einen eigenen UI-Akzeptanzlauf. Dieser
belegt ausschließlich Widget- und MCP-Bridge-Verhalten und ist kein Nachweis
für den produktiven Spring-Vertrag oder dessen separate Zielbild-Ressource:

1. App mit dem öffentlichen Prototyp-Endpunkt explizit auswählen.
2. Grundkurs im Widget anklicken; die Aufgabe muss ohne zusätzlichen
   technischen Chat-Turn erscheinen.
3. Eine vollständige Lösung einreichen. Das Widget bestätigt zunächst nur die
   sichere Einreichung und zeigt **Lösung jetzt bewerten lassen**.
4. Den Button anklicken. Die MCP-Bridge muss die Annahme sichtbar bestätigen;
   anschließend erscheinen Bewertungsbitte, faire Bewertung und persistiertes
   Feedback. Eine Host-Ablehnung darf nicht still bleiben.

Zusätzlich prüfen:

- Desktop und Mobil;
- kostenloser Providerzugang und fixes Verbraucherabo;
- Deutsch und Englisch strikt getrennt;
- Abbruch, Retry und Doppelklick;
- im Prototyp ein veraltetes Widget nach Reset;
- keine geheimen oder permanenten Kennungen in Chat, DOM-Screenshot oder
  exportiertem Gespräch.

## 4. Versioniertes Plugin-Paket und optionales lokales App-Wiring

Das deutsche Quellpaket ist unter
[`../openai plugin/skillpilot-coach-de-v1`](<../openai plugin/skillpilot-coach-de-v1/>)
versioniert. Es enthält Pluginmanifest, direkte produktive MCP-Bindung,
Coach-Skill, Policy-Referenz und die zunächst explizite Aktivierung. Der
CI-Vertrag prüft außerdem die aktuellen finalen Directory-Limits,
MCP-Pflichtlinks, die parsebare Skillmetadaten-Struktur und dass keine alte
Action-/Relaymechanik in den Coachvertrag zurückkehrt.

Der im Codex-`plugin-creator` gebündelte lokale Hilfsvalidator kann gegenüber
dem aktuellen Directory-Schema zeitlich zurückliegen. Lehnt er beispielsweise
das für MCP-Pakete inzwischen erforderliche `interface.supportURL` als
unbekannt ab, darf dieses Feld nicht entfernt werden. Maßgeblich sind der
aktuelle offizielle Submission-Vertrag und der eingecheckte CI-Check; nach
einem Toolupdate wird der Hilfsvalidator erneut ausgeführt.

Für den zusätzlichen **lokalen oder Workspace-internen Test über die bereits
registrierte ChatGPT-Verbindung** enthält das Paket jetzt die vom Host erzeugte
`.app.json`-Abbildung. Ihr App-Alias und ihre `asdk_app…`-ID wurden unverändert
aus der realen Registrierung übernommen. Die separat gespeicherte
`plugin_asdk_app…`-Kennung bezeichnet die Remote-Plugin-Registrierung und wird
nicht in `.app.json` eingesetzt. Ein Platzhalter oder eine manuelle
Präfixkonvertierung ist weiterhin unzulässig.

Für den persönlichen Test wird das Quellpaket über den
`plugin-creator`-Workflow in den persönlichen Marketplace gespiegelt. Ein
Cachebuster wird nur auf dieser persönlichen Kopie gesetzt; die versionierte
Quellversion bleibt stabil. Danach wird das Plugin installiert, der
Providerhost neu geladen und der Test in einem neuen Chat ausgeführt. Erst
dieser neue Chat kann den gebündelten Skill und die App-Werkzeuge gemeinsam
laden.

Der Skill ist aus den bewährten deutschen Coach-Inhalten unter
`ai/openai custom gpt` und den aktuellen `COACH-*`-Policies abgeleitet. Rolle,
Stil, Scaffolding, Feynman-Loop, faire Behandlung ungewöhnlicher Lösungswege,
Mastery-Evidenz, Prüfungsführung und ehrliche Fehlerbehandlung werden
übernommen. Nicht übernommen werden alte Startcode-, `chatSessionToken`-,
Action-, Relay- oder modellseitige Deep-Link-Mechanismen.

Geprüft werden `.app.json`, `.codex-plugin/plugin.json`,
`release/line.json`, `release/lifecycle.json`,
`skills/skillpilot-coach-de-v1/SKILL.md`,
`skills/skillpilot-coach-de-v1/agents/openai.yaml`, rechtliche Links, Screenshots
und Installationsmetadaten für den lokalen beziehungsweise internen
Plugin-Test. Die vom Host erzeugte App-Abbildung wird
unverändert geprüft; Präfixe werden nicht manuell konvertiert.

Der Plugin-Pilot testet Aktivierung und Ausführung getrennt:

- explizite Skill-/Plugin-Auswahl startet den SkillPilot-Workflow;
- indirekte SkillPilot-Lernwünsche werden zunächst nur als Beobachtungsfall
  erfasst, solange implizite Aktivierung deaktiviert ist;
- eine allgemeine Fachfrage ohne SkillPilot-Bezug aktiviert den Skill nicht;
- Golden Journeys, Toolspur, sichtbare Antwort und Backendzustand entsprechen
  der App-only-Baseline;
- die Toolspur weist ausdrücklich die in `.app.json` registrierte
  App-Verbindung nach. Ein erfolgreicher Aufruf nur über die parallele direkte
  `.mcp.json`-Bindung ist kein Nachweis für das kombinierte Plugin;
- fehlende App, ungültige Lernsession und Toolfehler enden kontrolliert ohne
  erfundenen Ersatzlernpfad.

Erst nach diesem Gate darf implizite Aktivierung freigegeben und dürfen die
ausführlichen MCP-Server-Instruktionen schrittweise auf kurze
werkzeugübergreifende Invarianten reduziert werden. Das englische Paket folgt
erst nach der separaten englischen Developer-Mode-Abnahme und erhält seine
eigene `asdk_app_…`-Abbildung, eine getrennte Remote-Plugin-Registrierung sowie
einen eigenen englischen Skill.

### Öffentliche Einreichung ist ein eigener Ablauf

Die öffentliche Directory-Einreichung verwendet im Submission-Portal die Option
**With MCP**. Dort werden der produktive MCP-Server, Authentifizierung,
Review-Zugang, CSP, Domain-Verifikation und Review-Material direkt angegeben und
die Tools gescannt. OpenAI weist ausdrücklich darauf hin, dort **keine bestehende
ChatGPT-App-ID** einzutragen. Die vom Host erzeugte und durch den
`plugin-creator`-Workflow paketierte `.app.json` ist daher Test-Wiring und nicht
das Veröffentlichungsvehikel für den produktiven MCP-Server.

## 5. Domain-Verifikation

Der Server stellt optional den offiziellen Challenge-Pfad bereit:

```text
/.well-known/openai-apps-challenge
```

Der Rückgabewert wird ausschließlich aus `OPENAI_APPS_CHALLENGE` gelesen und als
reiner Text ausgegeben. Ohne Konfiguration antwortet der Pfad mit 404.

Für die deutsche V1 liegen Challenge, Protected-Resource-Metadaten und der
MCP-Produktpfad auf `mcp-coach-de-v1.skillpilot.com`; der MCP-URL ist
`https://mcp-coach-de-v1.skillpilot.com/mcp`. Der OAuth-Issuer und seine
Browser-Endpunkte bleiben unter `https://skillpilot.com/api/openai/de`. Die
path-spezifischen Protected-Resource-Metadaten liegen unter
`https://mcp-coach-de-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp`,
die Domain-Challenge unter
`https://mcp-coach-de-v1.skillpilot.com/.well-known/openai-apps-challenge`.
DE V2/V3 und EN V1/V2/V3 sind nur als Hosts reserviert und liefern bis zur
jeweiligen Vertragsfreigabe `404`. Die read-only Zielbild-UI des
weiterhin unveröffentlichten `1.0.0`-Drafts lässt die benutzerdefinierte
Widget-Domain zunächst weg und läuft dadurch in der Provider-Sandbox. Ihre Resource-URI
`ui://skillpilot/coach/v1/1.0.0/goal-visualization.html`, Integrität, CSP,
Alttext und Degradationsverhalten sind eigene Release-Gates. Erst eine
tatsächliche Portal-Veröffentlichung versiegelt diesen Stand; bis dahin bleibt
die Paketversion `1.0.0`.

Der lokale Widget-Prototyp verwendet standardmäßig die eindeutigen Origins
`https://coach-de-mcp.skillpilot.com` für Deutsch und
`https://coach-en-mcp.skillpilot.com` für Englisch. Diese Widget-Origins machen
die gleichnamigen Hosts nicht zu produktiven MCP-Endpunkten. Bei abweichender
Prototyp-Topologie kann die Origin gezielt über
`SKILLPILOT_WIDGET_DOMAIN_DE` beziehungsweise
`SKILLPILOT_WIDGET_DOMAIN_EN` überschrieben werden; eine Variable muss im
Normalfall nicht gesetzt werden. Der Wert muss eine HTTPS-Origin ohne Pfad sein.
Der Server liefert ihn sowohl als
`_meta.ui.domain` als auch über den ChatGPT-Kompatibilitätsalias
`_meta["openai/widgetDomain"]` aus.

Release, Rollback, Unpublish und Retention folgen dem
[V1-Release-Runbook](../../docs/deploy/openai-plugin-v1-release.md). Ein
Breaking Change wird nicht in `skillpilot-coach-de-v1` überschrieben, sondern
als neue Plugin-Linie mit eigenem MCP-Origin und eigener
OAuth-Resource aufgebaut.

## 6. Review- und Produktgrenzen

Vor einer öffentlichen Einreichung sind mindestens erforderlich:

- produktives OAuth und ein voll funktionsfähiges Review-Testkonto;
- korrekte Tool-Annotationen und minimale Eingaben;
- vollständige Fehlerbehandlung und niedrige Latenz;
- Datenschutzrichtlinie und Nutzungsbedingungen;
- keine Werbung im Widget;
- kein Verkauf oder Upselling digitaler Produkte beziehungsweise Abos innerhalb
  der App;
- Freigabe für die beabsichtigte Altersgruppe und Regionen. Nach den aktuellen
  OpenAI-App-Richtlinien darf die veröffentlichte App nicht ausdrücklich Kinder
  unter 13 adressieren; diese Zielgruppe ist für den OpenAI-Kanal daher bis zu
  einer anderslautenden Providerfreigabe ausgeschlossen;
- vollständige DE-/EN-Workflow-Parität pro App.

Die Nutzerzahlung für das ChatGPT-Modell findet außerhalb der SkillPilot-App
direkt beim Modellprovider statt. Sie ist kein In-App-Commerce-Vorgang von
SkillPilot.

## Offizielle Referenzen

- [Plugins in ChatGPT and Codex](https://help.openai.com/de-de/articles/20001256-plugins-in-chatgpt-and-codex)
- [Apps SDK Quickstart](https://developers.openai.com/apps-sdk/quickstart)
- [Build an app](https://learn.chatgpt.com/docs/build-app)
- [Build plugins](https://learn.chatgpt.com/docs/build-plugins)
- [Submit plugins](https://learn.chatgpt.com/docs/submit-plugins)
- [App guidelines](https://developers.openai.com/apps-sdk/app-guidelines)
