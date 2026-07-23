# ChatGPT-Test und Plugin-Handoff

## 1. Vorbedingungen

Für einen realen ChatGPT-Test benötigt jede App einen öffentlich erreichbaren
HTTPS-Endpunkt. Für maximale Robustheit sind zwei getrennte App-Registrierungen
vorgesehen:

| App | lokaler Endpunkt | produktiver Zielhost |
| --- | --- | --- |
| SkillPilot Coach Deutsch | `/mcp/de` | `https://coach-de-mcp.skillpilot.com/mcp` |
| SkillPilot Coach English | `/mcp/en` | `https://coach-en-mcp.skillpilot.com/mcp` |

Die getrennten Hosts sind nicht nur sprachlich sauber. Sie vermeiden auch den
Konflikt, dass zwei getrennt veröffentlichte Plugins auf demselben MCP-Host nur
dieselbe Domain-Challenge-URL besitzen würden.

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
3. Eine App **SkillPilot Coach Deutsch** mit dem öffentlichen DE-MCP-Endpunkt
   anlegen.
4. Zuerst nur den deutschen End-to-End-Ablauf stabilisieren und abnehmen.
5. Erst danach eine zweite App **SkillPilot Coach English** mit dem öffentlichen
   EN-MCP-Endpunkt anlegen und denselben Abnahmelauf separat durchführen.

ChatGPT zeigt in den App-Metadaten unter anderem eine App-ID `asdk_app_…` und
eine Versions-ID `asdk_app_v_…`. Diese beiden Werte sind Diagnosemetadaten. Für
das spätere lokale Plugin-Wiring wird dagegen die Kennung aus der Browser-URL
benötigt; sie beginnt laut OpenAI-Dokumentation mit `plugin_asdk_app_…`.

Die Verfügbarkeit von Installation, Authentifizierung und Nutzung kann laut
OpenAI von Tarif, Workspace-Einstellungen, Rolle, Oberfläche, Region und
App-Funktionen abhängen. Deshalb müssen kostenloser Zugang und festes Abo als
getrennte reale Akzeptanzfälle geprüft werden; aus der Sichtbarkeit des Plugin-
Verzeichnisses allein folgt noch keine Nutzbarkeit.

## 3. Akzeptanzablauf je aktiver Sprache

1. Neuer Chat ohne alten Kontext.
2. App explizit auswählen und natürlich formulieren:
   „Ich möchte Mathematik in der Oberstufe in Hessen lernen.“
3. Erwartung: genau die sichtbaren Optionen Grundkurs und Leistungskurs; keine
   Session-ID, kein Token und kein technischer Auswahlkey.
4. Grundkurs im Widget anklicken.
5. Erwartung: Aufgabe erscheint ohne zusätzlichen technischen Chat-Turn.
6. Einen fachlich richtigen, aber anders als eine Musterlösung formulierten Weg
   einreichen.
7. Erwartung: Das Widget bestätigt zunächst nur die sichere Einreichung und zeigt
   **Lösung jetzt bewerten lassen**. Diesen Button anklicken.
8. Erwartung: Das Widget bestätigt die Annahme durch die MCP-Bridge sichtbar;
   anschließend erscheinen eine natürliche Bewertungsbitte, faire Bewertung und
   persistiertes Feedback. Eine Ablehnung durch den Host darf nicht still bleiben.
   Es ist keine manuell getippte Brückennachricht nötig.
9. Einen neuen normalen User-Turn senden.
10. Erwartung: Das Modell lädt den aktuellen SkillPilot-Zustand frisch; es fragt
    nicht nach einer alten ID und fällt nicht auf die Kurswahl zurück.
11. Chat neu laden und erneut fortsetzen.
12. Längeren Dialog führen, bis Host-Kontextkompaktierung plausibel ist, und die
    Schritte 9 bis 11 wiederholen.

Zusätzlich prüfen:

- Desktop und Mobil;
- kostenloser Providerzugang und fixes Verbraucherabo;
- Deutsch und Englisch strikt getrennt;
- Abbruch, Retry und Doppelklick;
- veraltetes Widget nach Reset;
- keine geheimen oder permanenten Kennungen in Chat, DOM-Screenshot oder
  exportiertem Gespräch.

## 4. Lokales Plugin-Paket erst mit echten App-IDs erzeugen

Seit 9. Juli 2026 werden Apps über Plugins auffindbar. Für den **lokalen oder
Workspace-internen Plugin-Test** verweist ein korrektes `.app.json` auf die von
ChatGPT im Developer Mode erzeugte `plugin_asdk_app…`-ID. Deshalb wird kein
Platzhaltermanifest eingecheckt.

Nach erfolgreichem Developer-Mode-Test die `plugin_asdk_app_…`-ID aus der
Browser-URL an Codex übergeben. Dann wird der Plugin-Creator zunächst nur für
das abgenommene deutsche Paket verwendet:

```text
$plugin-creator create a plugin for SkillPilot Coach Deutsch using
plugin_asdk_app_<DE-ID>. Include a personal marketplace entry for local testing.
```

Danach werden `.app.json`, `.codex-plugin/plugin.json`, rechtliche Links,
Screenshots und Installationsmetadaten für den lokalen beziehungsweise internen
Plugin-Test geprüft. Das englische Paket folgt erst nach der separaten
englischen Developer-Mode-Abnahme und erhält seine eigene
`plugin_asdk_app_…`-ID.

### Öffentliche Einreichung ist ein eigener Ablauf

Die öffentliche Directory-Einreichung verwendet im Submission-Portal die Option
**With MCP**. Dort werden der produktive MCP-Server, Authentifizierung,
Review-Zugang, CSP, Domain-Verifikation und Review-Material direkt angegeben und
die Tools gescannt. OpenAI weist ausdrücklich darauf hin, dort **keine bestehende
ChatGPT-App-ID** einzutragen. Das lokale `.app.json` mit `plugin_asdk_app…` ist
daher Test-Wiring und nicht das Veröffentlichungsvehikel für den produktiven
MCP-Server.

## 5. Domain-Verifikation

Der Server stellt optional den offiziellen Challenge-Pfad bereit:

```text
/.well-known/openai-apps-challenge
```

Der Rückgabewert wird ausschließlich aus `OPENAI_APPS_CHALLENGE` gelesen und als
reiner Text ausgegeben. Ohne Konfiguration antwortet der Pfad mit 404.

In Produktion erhält jede getrennt eingereichte Sprach-App einen eigenen Host
und damit eine eigene Challenge-URL. Dieser sprachspezifische Host ist zugleich
die eindeutige Widget-Origin: `https://coach-de-mcp.skillpilot.com` für Deutsch
und `https://coach-en-mcp.skillpilot.com` für Englisch. Bei abweichender
Deployment-Topologie kann die Origin gezielt über
`SKILLPILOT_WIDGET_DOMAIN_DE` beziehungsweise
`SKILLPILOT_WIDGET_DOMAIN_EN` überschrieben werden; eine Variable muss im
Normalfall nicht gesetzt werden. Der Wert muss eine HTTPS-Origin ohne Pfad sein.
Der Server liefert ihn sowohl als
`_meta.ui.domain` als auch über den ChatGPT-Kompatibilitätsalias
`_meta["openai/widgetDomain"]` aus.

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
