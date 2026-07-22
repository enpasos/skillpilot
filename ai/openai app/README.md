# SkillPilot OpenAI MCP Apps

Dieser Ordner enthält zwei getrennte, ausführbare MCP-App-Prototypen:

- **SkillPilot Coach Deutsch** unter `/mcp/de`
- **SkillPilot Coach English** unter `/mcp/en`

Sie sind von den Custom-GPT-Varianten unter `ai/openai custom gpt/` und
`ai/openai-custom-gpt-visible-session/` vollständig getrennt.

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
6. Das Widget bittet in natürlicher Sprache um Bewertung.
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
    src/                    Standard-MCP-Apps-Bridge und UI
    template.html
  scripts/build-widget.mjs
  test/
  dist/                     generiert, nicht versioniert
```

Die Widgets werden aus derselben geprüften Implementierung separat kompiliert.
Toolnamen und sämtliche sichtbaren Texte werden dabei fest in das jeweilige
Sprachartefakt eingebaut.

## Sicherheits- und Zustandsgrenze

Die aktuelle Trennung ist absichtlich:

| Kanal | Inhalt | Sichtbarkeit |
| --- | --- | --- |
| `content` | kurze semantische Zusammenfassung | Benutzer und Modell |
| `structuredContent` | Labels, Aufgabe und freigegebener Lernstatus | Modell und Widget |
| Result-`_meta` | opake Session- und Auswahlreferenzen | nur Widget |
| SkillPilot-Store | Antwort, Receipt, Lernzustand | SkillPilot-Server |

Das Widget sendet über `ui/update-model-context` nur eine semantische
Zusammenfassung. Die sichtbare `ui/message` enthält keine Toolnamen, IDs oder
Tokens.

Der momentane No-Auth-Modus besitzt pro Sprache genau einen lokalen
Entwicklungszustand. Das ist bewusst **nicht mandantenfähig**. Ein öffentlich
erreichbarer Tunnel darf deshalb nur kurzzeitig, nur mit Testdaten und nur für
den Developer-Mode-Abnahmetest laufen.

## Nächste Produktionsstufe

Nach dem realen Apps-SDK-Test wird der Demo-Store durch einen Adapter auf die
vorhandene providerneutrale `CoachToolFacade` ersetzt. Gleichzeitig kommt ein
eigener OpenAI-OAuth-Binding-Flow hinzu:

```text
OpenAI OAuth principal (opak)
             |
   OpenAICoachConnection
             |
   interne SkillPilot-ID
             |
 CoachToolFacade + Datenbank
```

Die permanente SkillPilot-ID erscheint weder in Toolargumenten noch in
Toolergebnissen oder im Widget. Die app-only Referenzen bleiben kurzlebig und an
Principal, aktuellen Zustand und konkrete Auswahl gebunden.

## ChatGPT- und Plugin-Test

Die genaue Abfolge steht in [TEST_AND_PLUGIN_HANDOFF.md](TEST_AND_PLUGIN_HANDOFF.md).
Wichtig ist die aktuelle Produktgrenze: Apps werden nach erfolgreichem
Developer-Mode-Test als Bestandteil eines Plugins veröffentlicht. Die lokalen
Plugin-Manifeste können erst korrekt erzeugt werden, nachdem ChatGPT für beide
Apps je eine reale `plugin_asdk_app…`-ID vergeben hat.
