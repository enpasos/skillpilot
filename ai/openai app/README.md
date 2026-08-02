# SkillPilot OpenAI MCP Apps

Dieser Ordner enthält zwei getrennte, ausführbare MCP-App-Prototypen:

- **SkillPilot Coach Deutsch** unter `/mcp/de`
- **SkillPilot Coach English** unter `/mcp/en`

Sie sind von den Custom-GPT-Varianten unter `ai/openai custom gpt/` und
`ai/openai-custom-gpt-visible-session/` vollständig getrennt.

> **Abgrenzung:** Dieser Node-Server ist ein lokales Widget- und
> Protokoll-Testbett. Der zur Veröffentlichung vorgesehene deutsche
> Produktvertrag ist die chat-first Linie **SkillPilot Coach DE v1** unter
> `https://mcp-coach-de-v1.skillpilot.com/mcp`; derselbe vollständige URL ist
> die exakte OAuth-Resource/Audience. Der Node-MCP-Server wird nicht produktiv
> geschaltet; die hier gebaute, selbstenthaltene read-only
> Lernzielvisualisierung wird dagegen als versionierte Ressource vom
> Spring-Boot-MCP-Server ausgeliefert. Der `1.0.0`-Draft ist noch nicht
> veröffentlicht.

## Was der Prototyp beweist

Der vertikale Ablauf ist protokollseitig vollständig:

1. Das Modell öffnet den Coach mit einer natürlichen Lernabsicht.
2. Das Widget zeigt nur die fachlich offene Entscheidung Grundkurs oder
   Leistungskurs.
3. Der Benutzer klickt ein sichtbares Label; die opake Auswahlreferenz bleibt in
   Widget-Metadaten.
4. Das Widget ruft das app-only Auswahltool direkt auf.
5. Eine Aufgabe erscheint, die Antwort wird persistent eingereicht und aus dem
   sichtbaren beziehungsweise modelllesbaren Status entfernt.
6. Das Widget zeigt nach dem Speichern den Button **Lösung jetzt bewerten
   lassen**; dessen expliziter Klick sendet die natürliche Bewertungsbitte.
7. Das Provider-Modell lädt die ausstehende Antwort über ein argumentloses
   Lesetool und speichert die Bewertung.
8. Ein späterer Turn kann den aktuellen Zustand ohne sichtbares Token und ohne
   alte Action-Antwort frisch laden.

Die lokale Vorschau simuliert Schritt 7 deterministisch. Sie ist kein Ersatz für
den anschließenden Test mit einem realen ChatGPT-Modell.

## Lokal starten

Voraussetzung ist Node.js 20 oder neuer.

```bash
cd "ai/openai app"
npm install
npm start
```

Danach stehen bereit:

- deutsche Host-Simulation: <http://localhost:8790/preview/de>
- englische Host-Simulation: <http://localhost:8790/preview/en>
- Health-Check: <http://localhost:8790/health>
- deutsche MCP-App: `http://localhost:8790/mcp/de`
- englische MCP-App: `http://localhost:8790/mcp/en`

Der Button **Prototyp zurücksetzen** löscht nur den lokalen Zustand der jeweiligen
Sprache. Die Ablage liegt standardmäßig unter
`tmp/openai-mcp-app-prototype/coach-state.json` und wird nicht versioniert.

Mit einem anderen Ablageort:

```bash
SKILLPILOT_MCP_APP_DATA_DIR=/tmp/skillpilot-mcp-app npm start
```

## Tests

```bash
npm test
npm audit --audit-level=moderate
```

Die Tests prüfen insbesondere:

- getrennte DE-/EN-Toolkataloge ohne Sprachparameter;
- MCP-Initialisierung, `tools/list`, `resources/list` und `resources/read`;
- MIME-Type `text/html;profile=mcp-app`;
- app-only Sichtbarkeit der direkten Auswahl- und Einreichungstools;
- korrekte Read-/Write-/Open-World-/Destructive-Annotationen;
- opake Referenzen ausschließlich im Result-`_meta`;
- keine Referenzlecks in `content` oder `structuredContent`;
- vollständigen Auswahl-, Einreichungs-, Bewertungs- und Rehydrationsablauf;
- idempotente Wiederholung von Kurswahl und Einreichung ohne Doppelmutation;
- Persistenz nach Neuinstanziierung des Stores;
- selbstenthaltene Widgets ohne externe Skripte, Styles oder Service Worker.
- die separate Lernzielbild-Komponente mit
  `ui/notifications/tool-result`, optionalem `window.openai.toolOutput`,
  zugänglichem Alttext, `ui/open-link` und sicherer leerer Darstellung ohne
  gültiges Bild.

## Paketstruktur

```text
ai/openai app/
  server/
    contracts/de.mjs       separater deutscher Außenvertrag
    contracts/en.mjs       separater englischer Außenvertrag
    coach-store.mjs        persistenter Demo-Zustand
    create-mcp-server.mjs  MCP-Tools und UI-Ressource
    app-server.mjs         Streamable-HTTP-Endpunkte
  widget/
    src/                    Standard-MCP-Apps-Bridge, Coach- und Zielbild-UI
    template.html
  scripts/build-widget.mjs
  test/
  dist/                     generiert, nicht versioniert
```

Die interaktiven Coach-Widgets werden aus derselben geprüften Implementierung
separat pro Sprache kompiliert. Zusätzlich entsteht
`dist/goal-visualization/widget.html`. Diese kompakte Komponente erwartet
`structuredContent.goalVisualization` mit Ziel-ID, Titel, optionaler
Beschreibung, öffentlicher HTTPS-Bild-URL, Alttext und Cockpit-Link. Ohne
vollständige gültige Daten bleibt sie verborgen. Bei gültigen Daten versucht
sie das Bild unabhängig von Plattform- oder User-Agent-Werten zu laden und
zeigt es erst nach erfolgreichem `load`. Ein Ladefehler oder der begrenzte
15-Sekunden-Timeout blendet sie aus und fordert ihren Teardown an.

## Sicherheits- und Zustandsgrenze

Die aktuelle Trennung ist absichtlich:

| Kanal | Inhalt | Sichtbarkeit |
| --- | --- | --- |
| `content` | kurze semantische Zusammenfassung | Benutzer und Modell |
| `structuredContent` | Labels, Aufgabe und freigegebener Lernstatus | Modell und Widget |
| Result-`_meta` | opake Session- und Auswahlreferenzen | nur Widget |
| SkillPilot-Store | Antwort, Receipt, Lernzustand | SkillPilot-Server |

Das Widget sendet über `ui/update-model-context` nur eine semantische
Zusammenfassung. Nach dem sicheren Speichern fordert ein eigener sichtbarer
Button die fachliche Bewertung an. Dieser explizite Benutzer-Klick verwendet
mit dem offiziellen MCP-Apps-Client ausschließlich den Standardaufruf
`ui/message`. Das Widget prüft dabei sowohl die vom Host angekündigte
Textnachrichten-Fähigkeit als auch `isError` in der Antwort und zeigt Annahme oder
Ablehnung sichtbar an. Die Nachricht enthält keine Toolnamen, IDs oder Tokens.
Die Trennung zwischen „speichern“ und „bewerten lassen“ verhindert, dass ein
hostseitig ignorierter automatischer Follow-up den Ablauf unbemerkt anhält.
Änderungen am kompilierten Widget erhalten eine neue `ui://`-Resource-URI, damit
ChatGPT kein veraltetes Bundle aus dem Cache lädt.

Für laufende Developer-Mode-Chats bleiben die bisherigen Template-URIs als
nicht aufgelistete Lese-Aliase erreichbar. Dadurch kann ein
bereits gecachter Toolvertrag nach einem Roll-forward trotzdem das aktuelle
Widget laden. `resources/list` und alle aktuellen Tool-Metadaten veröffentlichen
weiterhin ausschließlich die neueste URI.

Der momentane No-Auth-Modus besitzt pro Sprache genau einen lokalen
Entwicklungszustand. Das ist bewusst **nicht mandantenfähig**. Ein öffentlich
erreichbarer Tunnel darf deshalb nur kurzzeitig, nur mit Testdaten und nur für
den Developer-Mode-Abnahmetest laufen.

## Produktionsgrenze neben dem Prototyp

Der produktive deutsche Spring-Boot-Pfad verwendet bereits die
providerneutrale `CoachToolFacade`. OAuth autorisiert die feste registrierte
App-Verbindung; unabhängig davon adressiert die bei **Lernen starten** erzeugte
und automatisch transportierte `learningSessionId` genau einen Lernenden:

```text
OAuth-Appautorisierung + learningSessionId
                  |
       serverseitige Sessionabbildung
                  |
        interne SkillPilot-ID
                  |
       CoachToolFacade + Datenbank
```

Die permanente SkillPilot-ID erscheint weder in Toolargumenten noch in
Toolergebnissen oder im Widget. OAuth allein wählt keinen Lernenden; jeder
fachliche Modellaufruf trägt die unveränderte, absolut auf 24 Stunden begrenzte
Lernsession.

Der Spring-Pfad registriert die Zielbild-Komponente unter
`ui://skillpilot/coach/v1/sha256-157aab83e83d6fcf208c4a1ae138c020aa4f117e9b990ba78d029b570fb9644c/goal-visualization.html`
ausschließlich für das read-only Werkzeug
`render_skillpilot_goal_visualization_de`. Der Kontext erlaubt dieses
Anzeige-Werkzeug nur für ein aktives atomares Ziel mit passendem kanonischem
Bildlink und aktivierter Lernzielbild-Einstellung. Ohne Bild entsteht deshalb
keine UI-Karte. Die Karte ist Orientierung, keine Evidenz, Aufgabe, Lösung,
Bewertung oder Zustandsmutation. Da `1.0.0` noch nicht veröffentlicht wurde,
gehört sie zum selben veränderlichen Draft und löst keinen Versionssprung aus.

## ChatGPT- und Plugin-Test

Die genaue Abfolge steht in [TEST_AND_PLUGIN_HANDOFF.md](TEST_AND_PLUGIN_HANDOFF.md).
Das versionierte deutsche Quellpaket liegt unter
[`../openai plugin/skillpilot-coach-de-v1`](<../openai plugin/skillpilot-coach-de-v1/>).
Es enthält Manifest, direkte MCP-Bindung, Coach-Skill und die echte
hostgenerierte `.app.json`-Abbildung der bereits registrierten deutschen
Pilot-App. Diese zusätzliche Abbildung ist nur für den lokalen
End-to-End-Test bestimmt; für die öffentliche Einreichung bleibt der direkt
eingereichte MCP-Server maßgeblich.
Paket-, Contract- und Lifecycle-Regeln stehen im
[Versionierungs- und Lebenszyklusplan](../../docs/concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md).
