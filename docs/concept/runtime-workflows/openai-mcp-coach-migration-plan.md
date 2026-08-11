# Migration des SkillPilot-Coaches zur OpenAI-MCP-App

**Stand:** 11. August 2026

**Status:** Die web-started mehrsprachige V1-MCP-App ist der aktuelle
ChatGPT-Pfad. Ihr Coach-Vertrag bleibt mit verdichtetem neutralem
Werkzeugkatalog chat-first. Der noch unveröffentlichte
`1.0.0-SNAPSHOT`-Arbeitsstand bindet zwei getrennte aktive hashgebundene
`text/html;profile=mcp-app`-Ressourcen für bild-only Lernzielvisualisierung und
Karteikartenlernen. Beide read-only UI-Werkzeuge binden ausschließlich ihre
eigene Ressource; app-only Kartenreview und gewöhnliche Coach-Werkzeuge bleiben
UI-los. Früh beworbene Startressourcen bleiben passiv lesbar.
Serverauthentisiertes TLS und das
fail-closed geprüfte OAuth-Clientprofil bilden die aktuelle Betriebsbasis. mTLS
ist nicht Teil von `1.0.0`; eine mögliche spätere Transporthärtung wird separat
entworfen.

**Ziel:** den ursprünglichen GPT-Lerncoach funktional als
providergehostetes Plugin aus Coach-Skill und direkt zur Prüfung eingereichtem
MCP-Server wiederherstellen. Skill- und Tool-Kontrollschicht sind neutral
Englisch; sichtbare Kommunikation und Nutzdaten folgen der vom Backend an die
Lernsession gebundenen Interaktionssprache. Das versionierte Quellpaket bindet den
Server direkt über `.mcp.json` und referenziert für den lokalen Pilot zusätzlich
die reale bereits registrierte Verbindung über die hostgenerierte
`.app.json`-Abbildung. Es gibt keine manuell in den Chat zu übertragenden
technischen Schlüssel und keine Abhängigkeit von Custom-GPT-Action-Retention.
Permanente ID, Providerhinweis und Level-2-Konfiguration bleiben ausschließlich
im SkillPilot-WebGUI. Die pro Start automatisch transportierte, kurzlebige
`learningSessionId` bleibt davon ausdrücklich getrennt.

Die übergeordnete Architekturentscheidung ist in
[skillpilot-owned-coach-architecture.md](skillpilot-owned-coach-architecture.md)
beschrieben. Dieses Dokument übersetzt sie in eine konkrete, schrittweise
Migration mit Abnahmekriterien, Cutover und Rollback.
Die feste V1-Identität, kompatible Versionsänderungen, Contract-Snapshots und
der Lebenszyklus werden normativ im
[Versionierungs- und Lebenszyklusplan](openai-plugin-versioning-and-lifecycle.md)
geführt.
Das nie veröffentlichte
[Direktstart-Konzept](openai-mcp-app-direct-start-bootstrap.md) ist mit
Policy-Revision 3 superseded und wird nur historisch aufbewahrt.

Die technische Migration und die Zuordnung der früheren Regeln sind nicht mit
sichtbarer Endnutzerparität gleichzusetzen. Das allgemeine Coach-
Verhaltensmodell, die Golden Journeys, der ehrliche Integrationsstand und die
modellgestützte End-to-End-Abnahme werden normativ in
[Verhaltensintegration des MCP-Lerncoaches](openai-mcp-coach-behavioral-integration.md)
geführt.

## 1. Entscheidung

SkillPilot migriert **nicht** den sichtbaren Session-Workaround und baut den
bestehenden Custom GPT auch nicht weiter aus. Der aktuelle produktionsnahe Pfad
ist eine mehrsprachige, chat-first OpenAI-MCP-App mit zwölf neutralen Werkzeugen
und zwei dedizierten MCP-Apps-UIs:

```text
ChatGPT App „SkillPilot Coach v1“
        |
        | TLS + OAuth Bearer
        v
https://mcp-coach-v1.skillpilot.com/mcp
        |
        | dedizierter TLS-vHost; /mcp -> /internal/openai/v1/mcp
        v
Spring Boot am loopback-gebundenen internen V1-Pfad
        |
        +-- isolierter OpenAI-V1-MCP-Transport und neutraler Toolvertrag
        |     +-- 12 neutrale Werkzeuge
        |     +-- 2 getrennte aktive UI-Ressourcen
        +-- OAuth Authorization Server
        |     +-- fester vertraulicher Client: client_id + client_secret_basic
        |     +-- Authorization Code + PKCE S256
        |     +-- exakte Callback-, Resource- und Scope-Allowlist
        +-- learningSessionId -> Lernender, Ablauf exakt Start + 24h
        +-- CoachStateProjection
        +-- CoachToolFacade
        +-- LearnerService / Curriculum / Datenbank
```

Der Chat bei OpenAI bleibt die Benutzeroberfläche. Die Modellnutzung läuft über
das eigene Providerkonto der lernenden Person und wird dort im gewählten
kostenlosen oder fest bepreisten Consumer-Tarif kontingentiert beziehungsweise
abgerechnet. SkillPilot ruft in diesem Coach-Pfad keine kostenpflichtige
OpenAI-Modell-API auf.

Die V1-App wird für jede freigegebene Interaktionssprache durch eigene
Acceptance-Fälle stabilisiert; eine weitere Sprache erzeugt keine zweite App.
Der Lernzielbild-Renderer und der Karteikartenlauncher binden im
unveröffentlichten V1-Draft jeweils genau ihre
eigene aktive hashgebundene MCP-Apps-Ressource. Renderer-spezifisch bleibt genau
eine bild-only Ressource gebunden. Interaktive fachliche Widgets für Auswahl,
Antwortabgabe oder Prüfungs-Receipts bleiben mögliche spätere Verbesserungen
und sind kein Bestandteil des V1-Vertrags.

## 2. Was der Retentionstest ändert – und was nicht

Der UI-lose MCP-Test vom 22. Juli 2026 hat in einem normalen ChatGPT-Chat
nachgewiesen:

- Werte aus `structuredContent` konnten innerhalb eines Assistant-Turns an ein
  zweites Tool übergeben werden;
- dieselben ausschließlich strukturiert gelieferten Werte konnten nach einer
  weiteren Usernachricht wiederverwendet werden;
- eine explizite, getrennte Verifikation im nächsten Turn war erfolgreich;
- die Custom-GPT-Action-Regression wurde in diesem kurzen MCP-Szenario nicht
  reproduziert.

Details stehen in
[RESULTS-2026-07-22.md](https://github.com/enpasos/skillpilot/blob/main/ai/openai%20app/mcp-regression/RESULTS-2026-07-22.md).

Das bleibt die Grundlage für den chat-first Vertrag: Fachliche IDs dürfen in
`structuredContent` bleiben und müssen dem Lernenden nicht als Schlüssel gezeigt
werden. Der Test beweist jedoch noch nicht das Verhalten nach langen Dialogen,
Kontextkompaktierung, Reload, parallelen Chats oder Hoständerungen. Deshalb gilt
weiterhin:

> Chat-Kontext ist ein komfortabler Transport, aber niemals die autoritative
> Ablage des Lernzustands.

Bei fehlendem oder möglicherweise veraltetem Kontext lädt die App den aktuellen
Zustand erneut aus dem SkillPilot-Backend. Jeder fachliche Toolaufruf übergibt
dabei die beim UI-Start automatisch in die Startnachricht eingesetzte
`learningSessionId`. Jede Mutation wird dort erneut gegen OAuth-Client,
Lernsession, Zustandsmaschine und aktuelle fachliche Optionen geprüft.

## 3. Nicht verhandelbare Grenzen

1. **Keine manuell zu transportierenden Geheimnisse:** permanente
   SkillPilot-ID, OAuth-Token, Client-Secret und Choice-Keys erscheinen nicht
   im Chat. Die zufällige, exakt 24 Stunden gültige `learningSessionId`
   wird beim Start automatisch in die ChatGPT-Startnachricht eingesetzt und
   unverändert an jedes fachliche Tool übergeben.
2. **Backend als einzige Autorität:** Curriculum, Scope, aktives Ziel, Mastery,
   Recall und Prüfungszustand liegen dauerhaft nur bei SkillPilot.
3. **Provider bezahlt das Modell:** kein stiller Fallback auf eine von
   SkillPilot bezahlte OpenAI-API.
4. **Sprache backendautoritativ:** ein neutraler Fachvertrag ohne frei
   wählbaren `language`-Parameter. Die beim First-Party-Start festgelegte Locale
   wird aus der Lernsession geladen und steuert sämtliche sichtbare
   Kommunikation.
5. **UI-Funktionen strikt trennen:** Der erste produktionsnahe Vertrag besitzt
   zwei aktive hashgebundene `text/html;profile=mcp-app`-Ressourcen. Bild-
   Renderer und Karteikartenlauncher tragen jeweils `ui.resourceUri` und
   `openai/outputTemplate` ausschließlich für ihre eigene Ressource.
   Kartenreview und gewöhnliche Werkzeuge bleiben ungebunden.
   Renderer-spezifisch existiert genau ein read-only
   Rendering-Werkzeug mit genau einer aktuellen bild-only Ressource; sie
   rendert ausschließlich die strukturierte `goalVisualization` und darf weder
   Auswahl noch Lernzustand mutieren. Interaktive fachliche Auswahl-, Abgabe-
   und Prüfungswidgets bleiben mögliche spätere Härtungsstufen außerhalb des
   V1-Vertrags.
6. **Alte Quellen bleiben stehen:** `ai/openai custom gpt/` und
   `ai/openai-custom-gpt-visible-session/` werden weder überschrieben noch in den
   neuen App-Ordner gemischt.
7. **MCP-Regression bleibt Testcode:** `ai/openai app/mcp-regression/` wird nicht
   Teil des produktiven Toolkatalogs.
8. **Funktionsparität statt Methodenparität:** Entscheidend sind vollständige
   Lernabläufe, nicht identische alte HTTP-Operationen.
9. **Getrennte Sicherheitsbindungen:** Der feste vertrauliche OAuth-Client
   authentisiert die konkrete App mit `client_id` und
   `client_secret_basic`. Die davon unabhängige, bei jedem **Lernen starten**
   frisch erzeugte 24h-Lernsession adressiert den gewählten Lernenden. Jeder
   fachliche Toolaufruf benötigt beides. OAuth allein erzeugt oder wählt keine
   Lernsession; die Lernsession allein autorisiert keinen MCP-Aufruf. mTLS ist
   nicht Teil des `1.0.0`-Vertrags.
10. **WebGUI-only Setup:** Permanente SkillPilot-ID, Providerhinweis,
    Curriculum, Stufe, Fächer, Kursprofile und Personalisierung bleiben im
    First-Party-WebGUI. Der V1-Modellvertrag besitzt dafür keine Werkzeuge.
11. **Pre-response Sessionprüfung:** Vor jeder lernendenbezogenen Antwort muss
    `get_skillpilot_context` im aktuellen Assistant-Turn erfolgreich sein.

## 4. Zieltopologie

### 4.1 Mehrere isolierte MCP-Server im Spring-Prozess

Die globale Spring-AI-MCP-Autokonfiguration wird nicht als produktive
Mehrprovidergrenze verwendet: Sie erzeugt einen einzelnen Transport und sammelt
Tool-Spezifikationen global ein. Stattdessen werden mit dem bereits vorhandenen
Java-MCP-SDK explizit mehrere Server verdrahtet:

```text
Spring Boot
  +-- /internal/openai/v1/mcp
  |     +-- eigener WebMvcStatelessServerTransport
  |     +-- eigener McpStatelessSyncServer
  |     +-- neutral englische OpenAI-V1-Instructions
  |     +-- ausschließlich OpenAI-V1-Tools
  |
  +-- /api/claude/mcp
        +-- eigener WebMvcStatelessServerTransport
        +-- eigener McpStatelessSyncServer
        +-- Claude-Instructions
        +-- ausschließlich Claude-Tools
```

Die Server verwenden `.immediateExecution(true)`, damit der auf dem
Servlet-Thread validierte Spring-Security-Kontext während des Toolaufrufs
erhalten bleibt. Tool-Spezifikationen werden pro Server ausdrücklich registriert
und niemals global aus allen `ToolCallbackProvider`-Beans zusammengesammelt.

Das Java-MCP-SDK unterstützt `outputSchema`, Tool-Annotationen, Tool-/Result-
`meta` und echtes `structuredContent`. Der OpenAI-V1-Vertrag verwendet deshalb
einen kleinen eigenen Spec-/Result-Adapter statt ausschließlich des allgemeinen
Spring-`@Tool`-Konverters.

Der bestehende Node-Code unter `ai/openai app/` bleibt ein isoliertes
Regressionstest- und Apps-UI-Testbett. Er ist kein produktiver Proxy, hält keine
Produktividentität und wird nicht zwischen ChatGPT und Spring geschaltet.

### 4.2 Sicherheits- und Fachgrenze

Reverse Proxy und Spring bilden gemeinsam die Transport- und Sicherheitsgrenze; Spring
bleibt die Fachgrenze. Die aktuelle Betriebsbasis verwendet
serverauthentisiertes TLS bis Nginx und verpflichtet Spring bei jedem
MCP-Aufruf zur vollständigen OAuth-Prüfung. Discovery, Authorization, Token und
Browser-Binding bleiben normal browserfähig.

mTLS ist weder Bestandteil dieses Vertrags noch der aktuellen Betriebs- und
CI-Gates. Der dedizierte Host isoliert Domainverifikation und Plugin-Lifecycle;
er verlangt kein Clientzertifikat. Eine spätere Transporthärtung wird als
eigenständige Änderung mit neuer Bedrohungsanalyse geplant.

Der eigene OpenAI-V1-Adapter liegt unmittelbar an `CoachToolFacade` und
`CoachStateProjection`. Er:

- validiert bei **jedem** Aufruf Token, Issuer, Audience, Ablauf und Scope;
- verlangt bei **jedem fachlichen Tool** eine gültige `learningSessionId`;
- löst ausschließlich deren HMAC-/Hashwert auf den Lernenden auf;
- verwendet weder OAuth-Subject noch „zuletzt verwendeten Lernenden“ als
  Fallback;
- projiziert ausschließlich allowlist-basierte Coach-Daten;
- revalidiert jede Mutation gegen den aktuellen Zustand;
- gibt nach jeder Mutation den frisch projizierten Folgezustand zurück;
- protokolliert weder Token noch interne SkillPilot-ID, komplette Prompts oder
  Schülerantworten.

Der MCP-Endpunkt ist ausschließlich über den dafür vorgesehenen stabilen
HTTPS-Origin und den OAuth-geschützten dedizierten Reverse Proxy erreichbar.
Nginx bildet dessen `/mcp` exakt auf `/internal/openai/v1/mcp` ab. Der
Spring-Port ist auf Loopback gebunden und darf nicht öffentlich exponiert
werden. Andere
Backendendpunkte und interne Identitäten werden dadurch nicht freigegeben.
Falls später aus echten Betriebsgründen eine Prozesstrennung erforderlich wird,
kann sie hinter unveränderter öffentlicher URL erfolgen.

Eine mögliche spätere Transporthärtung würde allenfalls die aufrufende
Infrastruktur attestieren, nicht den sichtbaren App-Namen. Die produktive App-Bindung geschieht deshalb am
Authorization Server über genau einen festen vertraulichen OAuth-Client mit
langem zufälligem Secret, `client_secret_basic`, exakter Callback-Allowlist,
PKCE `S256`, Resource-/Audience-Bindung und engen Scopes. Offene DCR, CIMD,
`none`, `private_key_jwt` und ein stiller Profil-Fallback sind nicht Teil des
aktiven V1-Produktivprofils. Die verbindliche Detailarchitektur steht in
[OpenAI-MCP-Clientbindung](../../security/openai-mcp-client-binding.md).

### 4.3 Stabile öffentliche URLs

Für die erste Produktions-App wird eine dauerhaft isolierte Major-Linie
verwendet:

```text
Plugin: skillpilot-coach-v1
MCP Endpoint: https://mcp-coach-v1.skillpilot.com/mcp
OAuth Resource/Audience: https://mcp-coach-v1.skillpilot.com/mcp
Protected Resource Metadata: https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp
Domain Challenge: https://mcp-coach-v1.skillpilot.com/.well-known/openai-apps-challenge
OAuth Issuer: https://skillpilot.com/api/openai/v1
```

Der Tunnel bleibt ausschließlich Entwicklungsinfrastruktur. Ein interner
Serverwechsel darf die veröffentlichte MCP-URL nicht verändern. Ein späterer
inkompatibler Major erhält einen neuen Pluginnamen sowie einen eigenen MCP-Origin
und eine eigene exakte OAuth-Resource. Eine weitere Sprache innerhalb von V1
nicht. Die V1-Linie besitzt keinen öffentlichen Kompatibilitätsalias.
Ausschließlich der V1-Origin ist derzeit aktiver Directory-Vertrag; die
reservierten neutralen V2- bis V9-Hosts antworten bis zur jeweiligen
Vertragsfreigabe mit `404`. Frühere, nie veröffentlichte `mcp-coach-de-v*`- und
`mcp-coach-en-v*`-Hosts werden nicht als Kompatibilitätsrouten weitergeführt.

## 5. Sprachneutraler MCP-Vertrag der ersten Version

Die Werkzeuge sind in neutralem Englisch beschrieben und fachlich eng
geschnitten. Fachliche Tools besitzen keinen frei wählbaren Sprachparameter.
`learningSessionId` ist ausnahmslos Pflichtargument jedes fachlichen Werkzeugs;
die übrigen Argumente sind werkzeugspezifisch. Das Backend liefert
`communicationLocale` und alle
lernerseitigen Nutzdaten in der Zielsprache. Die Namen bleiben technisch
eindeutig:

| Tool | Aufgabe |
| --- | --- |
| `get_skillpilot_context(learningSessionId)` | SkillPilot-Lerncoach bei einer natürlichen SkillPilot-Lernabsicht starten oder fortsetzen sowie den kompakten Lernzustand für die explizit adressierte Lernsession rehydrieren |
| `get_skillpilot_navigation(learningSessionId, target)` | Optionen für einen ausdrücklichen Wechsel von Fokus (`scope`) oder aktivem Ziel laden |
| `set_skillpilot_scope(learningSessionId, goalIds)` | Lernumfang setzen |
| `set_skillpilot_active_goal(learningSessionId, goalId, redirect)` | Erlaubtes Frontier-Ziel aktivieren |
| `set_skillpilot_mastery(learningSessionId, goalId)` | Das aktive atomische Nicht-SRS-Ziel nach harter Evidenz mit Mastery `1.0` abschließen |
| `start_skillpilot_verified_recall(learningSessionId, goalId, batchSize)` | Kartenprüfung starten oder fortsetzen |
| `get_skillpilot_verified_recall_answer(learningSessionId, goalId, cardId)` | Sollantwort erst nach der Lernendenantwort laden |
| `record_skillpilot_verified_recall_result(learningSessionId, goalId, cardId, passed, feedback)` | Recall-Ergebnis speichern |
| `get_skillpilot_exam_evaluation(learningSessionId, goalId)` | Freigegebene Lösung und Bewertungsraster erst nach vollständiger Abgabe laden |

### 5.1 LLM-gerechter Eingabevertrag

Das veröffentlichte MCP-`inputSchema` ist eine Arbeitsanweisung für das Modell,
nicht die technische Validierungsschicht des Backends. Es enthält deshalb nur
Informationen, die dem Modell beim richtigen Tool-Aufruf helfen:

- Datentypen, Pflichtfelder und kurze handlungsorientierte Beschreibungen;
- echte fachliche Auswahlmengen wie `target`;
- fachlich relevante Zahlen- und Listengrenzen wie `batchSize` oder eine
  nichtleere, eindeutige `goalIds`-Liste.

Technische Formdetails opaker Referenzen werden nicht an das Modell
veröffentlicht. Insbesondere enthalten die Tool-Schemas für
`learningSessionId`, `goalId` und `cardId` keine regulären Ausdrücke und keine
Mindest- oder Maximallängen. Das Modell soll solche Werte ausschließlich aus
der aktuellen SkillPilot-Startnachricht beziehungsweise dem jüngsten
SkillPilot-Ergebnis unverändert übernehmen, nicht selbst konstruieren.

Die Vereinfachung schwächt die Sicherheits- und Datenintegritätsgrenze nicht:
Das Spring-Backend prüft weiterhin Format, Nichtleere, Gültigkeit,
Aktualität, Berechtigungen und erlaubte Werte vollständig und lehnt jeden
ungültigen Aufruf fail-closed ab. Modellvertrag und Servervalidierung bleiben
damit bewusst getrennt.

Der V1-Modellvertrag enthält keine Wahl- oder Mutationseingaben für permanente
Identität oder Level 2. Jurisdiction, Curriculum beziehungsweise kanonische
View, Dauer, Stage, Subjects, fachbezogene Profile und Personalisierung werden
ausschließlich im First-Party-WebGUI gewählt und transaktional gespeichert.
Der Provider erhält davon nur den für die frische Lernsession bestätigten
Lernkontext. Chatseitige Navigation ist auf ausdrücklich gewünschte Level-3-
Änderungen von Fokus oder aktivem Ziel begrenzt.

Der umgesetzte OpenAI-V1-Vertrag konkretisiert `chooseMemoryMode` inzwischen
provider-spezifisch: „Karteikarten lernen“ startet die dedizierte MCP-Apps-
Komponente, „Mit Lerncoach prüfen“ startet Verified Recall. Provider ohne diese
Komponente behalten den Cockpit-Link als Übungsweg. Ein `retest`-Feld wird erst
veröffentlicht, wenn es vom Backend tatsächlich fachlich ausgewertet wird.

### 5.1 WebGUI-eigenes Level 2 und gemeinsamer authored Flow

Der versionierte `personalizationFlow` und der daraus im Backend erzeugte
`PersonalizationPlan` bleiben die gemeinsame Quelle der Wahrheit für
First-Party-Startseite und Cockpit. Sie definieren Jurisdiction beziehungsweise
kanonische View, Dauer, explizite Stage, Subjects, Kursprofile, Kardinalitäten
und Abschlussbedingungen, ohne Semantik aus Labels, Graphkanten oder fest
codierten Fach-IDs abzuleiten.

Das First-Party-WebGUI besitzt den vollständigen Interaktions- und
Persistenzvertrag für diese Level-2-Konfiguration:

- CREATE oder EXISTING sowie der Providerhinweis werden vor dem Launch
  abgeschlossen und gelangen nie in den Provider-Modellpfad.
- Das WebGUI zeigt nur aktuelle backend-authored Optionen, wendet sie
  transaktional an und projiziert den Plan nach jedem bestätigten Schritt neu.
- Kursprofile sind Fachattribute. Eine LK-Wahl impliziert weder Stage noch
  Dauermodell; parallele Fächer behalten ihre unabhängigen Profile.
- Unvollständige oder ungültige authored Flows sperren den Lernstart; das WebGUI
  leitet keinen Ersatz aus Frontier, Applicability, Tags oder Labels ab.
- Eine Level-2-Änderung revalidiert Fokus und aktives Ziel gegen die neue
  `target`-Projektion, ohne stabile Ziel-IDs oder globale Mastery umzuschreiben.

Erst nach vollständigem Level 2 darf **Lernen starten** / **Start learning**
die frische Lernsession erzeugen und den neuen Chat öffnen. Der MCP-Kontext
projiziert den bestätigten Lernumfang, veröffentlicht aber keine Level-2-
Optionen oder Mutationen. Meldet eine vorbereitete Session unerwartet
unvollständiges Setup, gibt der Coach nur die servereigene WebGUI-Instruktion
oder URL aus und stoppt die fachliche Arbeit.

Der gemeinsame Flow bleibt domänenneutral. Synthetische Labels,
Mehrfachfach-Kardinalitäten, filterlose Landschaften, teilweise ältere
Konfigurationen, transaktionales Scheitern und der Erhalt paralleler Fächer
werden als Backend-/WebGUI-Vertrag getestet, nicht als Modellorchestrierung.

### 5.2 Context-Ergebnis

`get_skillpilot_context(learningSessionId)` ist trotz seines stabilen
technischen Namens das eindeutige Bootstrap-Werkzeug. Wenn die App ausgewählt
oder SkillPilot genannt
wurde und die lernende Person lernen, üben, starten, fortsetzen oder den
gespeicherten Lernstand verwenden möchte, muss es im aktuellen Assistant-Turn
vor jeder lernendenbezogenen Antwort erfolgreich laufen. Eine allgemeine
Lehrplanübersicht oder ein frei erfundener
Lernpfad ist kein zulässiger Ersatz. Dasselbe Werkzeug rehydriert den Zustand
nach einem neuen Chat, Reload, langem Dialog, möglicher Kontextkompaktierung,
Unsicherheit oder Konflikt.

Es serialisiert **nicht** den rohen
`UnifiedLearnerStateResponse`. Der kompakte Vertrag enthält nur:

- Lernzustand, `requiredAction` und Interaktionsmodus;
- Curriculumtitel, Fach und fachliche öffentliche ID;
- aktives Ziel mit Titel, Beschreibung, Typ und Cockpit-Link sowie optional die
  eng projizierte `goalVisualization` für ein passendes kanonisches Bild des
  aktiven atomaren Ziels;
- bei Prüfungen ausschließlich Aufgabe und Maximalpunkte;
- aktuell erlaubte Fokus- oder Zieloptionen mit Label und fachlicher ID;
- Frontier, relevante Ressourcen und nächste erlaubte Werkzeuge;
- Scope- und Curriculumfortschritt sowie Abschlussstatus;
- eine kurze zustandsabhängige Arbeitsanweisung.

`content` enthält eine kurze natürliche Zusammenfassung. IDs und strukturierte
Optionen bleiben in `structuredContent` und werden nicht unnötig in der
Chatantwort wiederholt. Für ein aktives atomares Ziel mit passendem kanonischem
`goal-visualization`-Link enthält `structuredContent.goalVisualization`
ausschließlich Ziel-ID, Titel, optionale Beschreibung, öffentliche Bild-URL,
Alttext und Cockpit-Link. Das dedizierte read-only Werkzeug
`render_skillpilot_goal_visualization` validiert daraus serverseitig
ausschließlich ein freigegebenes JPEG oder PNG und gibt die strukturierte
`goalVisualization` an die bild-only MCP-Apps-UI weiter. Genau sein Descriptor
enthält `ui.resourceUri` und `openai/outputTemplate`; alle gewöhnlichen
Werkzeuge bleiben von der UI-Ressource ungebunden. Wenn das neueste
Vollresultat eine `goalVisualization` enthält und den Renderer erlaubt, läuft
dieser genau einmal mit dessen unveränderter Ziel-ID; die Top-Level-
`stateVersion` wird in `expectedStateVersion` kopiert. Alte oder bereits
versuchte Freigaben werden nicht verwendet. Das Bild dient nur
der Orientierung, nie als
Evidenz,
Aufgabe, Lösung, Bewertung oder Mastery-Nachweis. Weder User-Agent- noch
Surface-Metadaten schalten den Renderer frei oder ab. Ein erfolgreiches
Toolresultat bestätigt nur die Bereitstellung; SkillPilot behauptet nicht, dass
der jeweilige Host das Bild tatsächlich dargestellt hat.
Die Zusammenfassung beginnt beim Einstieg mit den
bestätigten Kontextangaben und führt anschließend die gemeinsam beantwortbaren,
authored offenen Angaben auf. Sie darf spätere sichtbare Fragen zur Orientierung
enthalten, macht daraus aber keine vorzeitig gültigen Schreiboptionen.

Der opake `optionId`-Vertrag ist für den produktiven mehrsprachigen
OpenAI-V1-MCP-Adapter umgesetzt. Die pausierte Claude-Integration und die
isolierte Visible-Session-Rollback-Variante besitzen weiterhin ihre eigenen
Legacy-Verträge; ihre Existenz ist weder ein Fallback für diesen Flow noch ein
Beleg dafür, dass sie Mehrfachauswahl und `COMPLETE_GROUP` bereits unterstützen.

## 6. Migration der bisherigen Knowledge-Dokumente

Eine MCP-App allein besitzt nicht dieselbe Knowledge-Upload-Fläche wie ein
Custom GPT. Das versionierte Quellpaket unter
[`ai/openai plugin/skillpilot-coach-v1`](https://github.com/enpasos/skillpilot/tree/main/ai/openai%20plugin/skillpilot-coach-v1)
ergänzt sie deshalb um einen Coach-Skill. Die bisherigen Dokumente werden nach
Funktion migriert:

| Bisheriger Inhalt | Zielort |
| --- | --- |
| Rolle, Sprache, Stil, Dialogzyklus und allgemeine Coachingregeln | `ai/openai plugin/skillpilot-coach-v1/skills/skillpilot-coach-v1/SKILL.md` |
| ausführliche Didaktik, Mastery-Evidenz, ungewöhnliche Lösungswege und Prüfungsverhalten | `ai/openai plugin/skillpilot-coach-v1/skills/skillpilot-coach-v1/references/coaching-policy.md` |
| wenige werkzeugübergreifende Zustands-, Session-, Sprach- und Fail-closed-Regeln | kurze neutral englische MCP-Server-`instructions` |
| Regeln und Vorbedingungen für genau ein Werkzeug | Toolbeschreibung und Ein-/Ausgabeschema |
| zustandsabhängige Aufgabe, Rubrik, Recall- oder Exam-Regel | dynamisches `structuredContent` des jeweiligen Tools |
| Autorisierung, Mastery-, Recall- und Exam-Invarianten | Spring-Backend-Guards und Domainlogik |
| echte größere Nachschlageinhalte | später optionaler read-only `search`/`fetch`-Index |
| Lernzielvisualisierung | optionale sichere `goalVisualization` in `structuredContent` plus genau eine aktiv gebundene hashgebundene `text/html;profile=mcp-app`-Ressource, die ausschließlich das geprüfte JPEG oder PNG darstellt; frühere ausgelieferte Hash-URIs bleiben passiv lesbar; nur der Renderer ist gebunden, niemals fachliche Quelle oder Host-Darstellungsgarantie |
| Einstieg und Level-2-Konfiguration | ausschließlich First-Party-WebGUI für permanente ID, Providerhinweis, Curriculum, Stufe, Fächer, Kursprofile und Personalisierung; finaler WebGUI-Start erzeugt frische Session und neuen Chat; ohne Session nur fester WebGUI-Hinweis, bei Sessionfehler nur server-owned Instruktion und `startUrl` |
| normales Karteikartenlernen | eigene aktive Kartenressource am read-only Launcher; begrenzter Kartenstapel nur in Resultat-`_meta`; app-only Review ungebunden und ohne Mastery-Mutation |
| spätere fachliche Widgetdarstellung | jeweils eigene UI-Ressource sowie eng begrenzte app-only Metadaten und Tools; niemals fachliche Modellanweisung |

Die bewährte fachlich-didaktische Ausgangsbasis liegt unter
`ai/openai custom gpt`, insbesondere in `system_instructions.de.md` sowie den
deutschen Dokumenten zu Lerncoach, Mastery, Prüfung, Zustandsmaschine,
Fehlerbehandlung und Deep Links. Bereits fachlich verbesserte Regeln aus dem
Visible-Session-Paket, etwa zur fairen Anerkennung gleichwertiger Lösungswege,
haben Vorrang. Nicht übernommen werden alte Startcode-, Action-,
`chatSessionToken`-, Linkkonstruktions- und sichtbare Relayregeln.

Während des Piloten bleiben die heutigen ausführlichen Server-Instruktionen
unverändert als App-only-Rollback bestehen. Erst nach nachgewiesener
Verhaltensparität mit explizit gewähltem Skill werden die Regeln an ihre
Zielorte verschoben und die Server-Instruktionen ausgedünnt.

Die vollständige Quellen-/Zielmatrix einschließlich der bewusst obsoleten
Relay-Regeln und der verbleibenden modellseitigen Grenzen steht in
[openai-mcp-coach-knowledge-parity.md](openai-mcp-coach-knowledge-parity.md).

Kritische Bewertungsregeln dürfen nicht davon abhängen, dass das Modell freiwillig
ein Dokument sucht. Der jeweilige Workflow liefert sie unmittelbar mit. Dazu
gehören insbesondere:

- alternative fachlich korrekte Lösungswege und Darstellungen anerkennen;
- explizit verlangte Formate weiterhin prüfen;
- keine Wortlautgleichheit mit einer Musterlösung verlangen;
- Mastery erst nach der vorgesehenen Evidenz setzen;
- im Prüfungsmodus keine lösungslenkende Nachfrage stellen;
- Recall-Antworten erst nach der Lernendenantwort freigeben.

## 7. OAuth-Appbindung und Lernsession

Die verbindliche Trennung von App-Authentisierung durch OAuth und der
expliziten Lernsession mit absoluter Laufzeit von exakt 24 Stunden steht in
[openai-mcp-oauth-learner-session-architecture.md](openai-mcp-oauth-learner-session-architecture.md).
Bei Widersprüchen ist dieses abgegrenzte Architekturdokument für Identitäts- und
Sitzungsfragen maßgeblich.

Die bestehende Claude-OAuth-Implementierung dient als technische Vorlage, wird
aber nicht als OpenAI-Alias verwendet. OpenAI V1 erhält eigene Konfiguration,
Scopes, Lernsessionen, Tests und Widerrufslogik.

### 7.1 Verbindungsablauf

1. Der App-Autor konfiguriert in ChatGPT und SkillPilot genau denselben festen
   vertraulichen OAuth-Client: exakte `client_id`, langes zufälliges
   `client_secret`, exakte Callback-URI und
   Token-Endpunkt-Authentisierung `client_secret_basic`.
2. Authorization Code mit PKCE `S256` verbindet die App mit SkillPilot. Diese
   OAuth-Verbindung authentisiert den Client, erzeugt aber weder Lernenden- noch
   Lernsessionzustand.
3. Die lernende Person lädt oder erzeugt ihre SkillPilot-ID in der
   SkillPilot-Weboberfläche, konfiguriert dort Providerhinweis und Level 2 und
   klickt ausdrücklich auf **Lernen starten**. Die permanente ID gelangt in
   keinem Fall in Chat oder MCP-Vertrag.
4. Genau in diesem Augenblick wendet SkillPilot den eng typisierten Start-Intent
   an und erzeugt eine frische, hochentropische `learningSessionId`. Auch zwei
   Starts desselben Lernenden erzeugen zwei verschiedene IDs.
5. Das Backend speichert nur HMAC beziehungsweise Hash der Sessionreferenz zusammen mit
   Lernendenreferenz, Erzeugungszeitpunkt und absolutem Ablaufzeitpunkt. Die
   normale Laufzeit beträgt exakt 24 Stunden und wird durch Nutzung nicht
   verlängert. Nur der gegatete, requestlokale First-Party-Live-Test aus der
   verbindlichen Sessionarchitektur darf eine einzelne Session verkürzen.
6. SkillPilot setzt die Sessionreferenz automatisch in die natürliche
   ChatGPT-Startnachricht ein und öffnet einen neuen Chat. Die lernende Person
   muss die Referenz nicht kopieren; die Startnachricht enthält weder permanente
   ID noch OAuth-Token oder Client-Secret.
7. ChatGPT übergibt bei jedem fachlichen MCP-Aufruf sowohl das OAuth-Bearer-Token
   als auch die `learningSessionId` als unverändertes Toolargument.
8. Das Backend akzeptiert einen fachlichen Aufruf nur, wenn OAuth-Client,
   Resource, Scopes und Lernsession gültig sind. Ein OAuth-Subject, Chat-Metadaten
   oder ein „zuletzt verwendeter Lernender“ sind keine Fallback-Identität.
9. OAuth allein darf keine Lernsession erzeugen oder auswählen. Eine
   Lernsession allein darf keinen MCP-Aufruf autorisieren.

Vor jedem Backendstart muss der Browser weiterhin ausdrücklich bestätigen, dass
die für das OpenAI-Konto geltende Mindestalterregel erfüllt ist und bei unter
18-Jährigen die Erlaubnis eines Elternteils oder einer erziehungsberechtigten
Person vorliegt. SkillPilot speichert dafür weder Geburtsdatum noch
Altersprofil; die Angabe ist eine bewusste Selbstbestätigung und keine
Identitäts- oder Altersverifikation.

Eine Installation direkt in ChatGPT ohne aktuelle Startnachricht darf OAuth
erfolgreich verbinden, ruft aber kein SkillPilot-Werkzeug auf. Der Coach nennt
nur lokalisiert `https://skillpilot.com/` und den WebGUI-Startweg. Liefert ein
fachliches Tool `SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED` oder
`SESSION_VERSION_UNAVAILABLE`, gibt der Coach `instruction` unverändert aus
oder wählt den exakten lokalisierten Eintrag aus `instructions`. Die exakte
`startUrl` ergänzt er nur, wenn sie nicht schon enthalten ist. Er lehrt nicht
weiter, erneuert OAuth nicht und verwendet die alte Session nicht erneut. Der First-Party-
Webstart erzeugt die neue Session und öffnet einen neuen Chat.

### 7.2 Vorgesehene Sicherheitsparameter

| Objekt | Vorgabe |
| --- | --- |
| Access Token | 30–60 Minuten |
| Refresh Token | höchstens 30 Tage, rotierend |
| Lernsession | bei jedem **Lernen starten** frisch; normal exakt 24 Stunden nach Erzeugung; nur gegateter First-Party-Diagnoserequest requestlokal `3601..86400` Sekunden und höchstens `PT24H`; weder Toolaufruf noch Token-Refresh verlängert sie |
| Audience/Resource | exakt `https://mcp-coach-v1.skillpilot.com/mcp` |
| Scopes | `skillpilot.openai.v1.read` und `skillpilot.openai.v1.write` |
| PKCE | ausschließlich `S256` |
| OAuth-Client | genau eine feste vertrauliche Client-ID; kein offenes DCR und kein stiller Profilwechsel |
| Token-Endpunkt-Clientauthentisierung | ausschließlich `client_secret_basic` |
| Client-Secret | lang, zufällig, nur in ChatGPT-Konfiguration und SkillPilot-Secret-Store; rotierbar |
| Redirect-URI | exakte produktive Allowlist |
| MCP-Netzwerkclient | serverauthentisiertes TLS und OAuth |

Der `resource`-Wert wird bei Authorization- und Token-Request exakt und ohne
Trimmen oder Slash-Normalisierung verglichen. Spring speichert ihn im
Authorization Request; die Introspektion jedes Access Tokens prüft diesen
persistierten Wert erneut und veröffentlicht nur danach dieselbe URL als
`aud`. Damit ist ein technisch gültiges Token für eine andere MCP-Ressource
nicht im V1-Coach verwendbar; die Bindung bleibt auch nach einem
Refresh erhalten.

`_meta["openai/session"]`, ein OAuth-Subject und „zuletzt verwendete Nutzer“
sind niemals Lernenden-Identitätsquellen. Einzige fachliche Referenz ist die
explizite `learningSessionId` aus der von SkillPilot erzeugten Startnachricht.
Sie wird nur gehasht/HMAC-gebunden gespeichert und als Pflichtargument jedes
fachlichen Tools validiert.

Der MCP-Host veröffentlicht Protected-Resource-Metadaten. Spring liefert
ungültige oder fehlende Autorisierung als standardkonforme
`WWW-Authenticate`-Challenge einschließlich `_meta["mcp/www_authenticate"]`
zurück. Ein Aufruf ohne Bearer Token erreicht diese Prüfung und erhält `401`.

## 8. Vollständige Workflow-Parität

Der V1-Coach gilt erst als migriert, wenn folgende Nutzerreisen in jeder
freigegebenen Interaktionssprache auf realen SkillPilot-Daten funktionieren:

| Nutzerreise | Abnahmekriterium |
| --- | --- |
| Verbinden und Wiederaufnahme | fester vertraulicher OAuth-Client plus automatisch transportierte, gültige `learningSessionId`; Context-Read verlangt beides |
| Natürlicher Einstieg | „Mathe in der Oberstufe in Hessen“ wird aufgelöst; nur die echte offene Frage GK/LK bleibt |
| Curriculum/Profil/Scope | alle aktuellen Auswahl- und Wechselabläufe funktionieren |
| Frontier und Zielwahl | nur fachlich erlaubte Ziele; Backend revalidiert |
| Erklären und Üben | ursprüngliche didaktische Regeln und Ressourcen bleiben erhalten |
| Lösung bewerten | gleichwertige korrekte Wege werden anerkannt; explizite Anforderungen bleiben bindend |
| Mastery | nur erlaubter Wert und korrektes aktives Ziel; frischer Folgezustand |
| Fortschritt und Abschluss | Scope- und Curriculumfortschritt konsistent |
| Verified Recall | Start, Antwortfreigabe, Ergebnis, Tageslock und automatische Mastery |
| Prüfung | Aufgabe ohne Lösung; Auswertung erst nach vollständiger sichtbarer Abgabe; keine Nachfrage |
| Fehler und Retry | keine Doppelmutation; sinnvoller Reload bei Konflikt |
| Reload/Kompaktierung | Zustand wird mit derselben noch gültigen Lernsession-ID aus dem Backend rehydriert |
| Parallele Chats | durch getrennte Lernsession-IDs keine Vermischung; unzulässige Writes werden abgewehrt |

Für die erste chat-first Parität sieht SkillPilot die freie Chatantwort weiterhin
nicht als eigene Abgabe. Das entspricht dem bisherigen providergehosteten Coach:
Das Modell sieht die Antwort und bewertet sie, das Backend schützt aber die
Freigabe der Musterlösung. Ein kryptografisch starker Abgabenbeleg folgt später
über ein Widget mit `attemptId`, direkter Abgabe und Submission Receipt. Diese
spätere Härtung darf den chat-first Start nicht blockieren, muss aber vor
hochwirksamen Prüfungs- oder Zertifizierungsfällen erneut bewertet werden.

## 9. Umsetzungsetappen und Exit-Gates

### Etappe 0 – Baseline einfrieren

- Legacy-, Visible-Session-, MCP-Prototyp- und Regressionstest-Quellen getrennt
  markieren;
- die vollständigen sprachmarkierten Nutzerreisen und bisherigen Knowledge-Regeln als
  Acceptance-Manifest erfassen;
- die positiven MCP-Testbelege archivieren;
- keine bestehenden Startpfade ändern.

**Exit:** reproduzierbare Baseline und vollständige technische
Regelzuordnung. Die sichtbare Verhaltensparität wird separat über die Golden
Journeys der Coach-Verhaltensintegration abgenommen.

**Implementierungsstand:** abgeschlossen. Custom-GPT-, Visible-Session-,
Node-Prototyp- und MCP-Regressionsquellen bleiben getrennt.

### Etappe 1 – Produktionsfähiges Skelett

- globale MCP-Autokonfiguration durch explizit isolierte Spring-MCP-Server für
  Claude und OpenAI V1 ersetzen;
- separaten neutralen OpenAI-V1-Paket-/Vertragsbereich anlegen;
- `CoachStore`, UI-Ressourcen und Node-Demodaten vollständig außerhalb dieses
  Laufzeitpfads halten;
- kompaktes OpenAI-V1-Context-DTO anlegen;
- `get_skillpilot_context(learningSessionId)` zunächst mit synthetischem
  OAuth-Client und sicherer Testlernsession Ende-zu-Ende verbinden;
- Protected-Resource-Metadaten, Health und Readiness ergänzen.

**Exit:** Die Developer-App lädt echten, sicher projizierten Lernzustand ohne
manuell zu übertragenden technischen Schlüssel; die Testlernsession wird
automatisch als Toolargument mitgeführt.

**Implementierungsstand:** Spring-Transport, echte Projektion und isolierte
Tool-Allowlist sind implementiert und im aktuellen mehrsprachigen V1-MCP-Pfad
ausgerollt. Die fachliche Acceptance wird weiter vervollständigt.

### Etappe 2 – OpenAI-V1-OAuth

- providerfähigen gemeinsamen Authorization-Server-Kern aus der Claude-Vorlage
  herauslösen, ohne Claude und OpenAI datenbankseitig zu vermischen;
- festen vertraulichen OpenAI-V1-Client, Scopes, Token und Widerruf
  implementieren;
- explizite, gehashte Lernsessionen mit absolutem 24h-Ablauf und ohne
  OAuth-Subject-Fallback implementieren;
- Resource/Audience-, PKCE-, Replay-, Cross-Learner- und Expiry-Tests ergänzen;
- festen `client_secret_basic`-Client, PKCE und exakte Redirect-Allowlist
  fail-closed ergänzen; DCR, CIMD, `none`, `private_key_jwt` und stille
  Profilwechsel ablehnen;
- Cockpit-Aktion „Mit ChatGPT verbinden“ hinter Feature Flag bereitstellen.

**Exit:** Zwei Testlernende sind strikt getrennt; kein fachlicher Toolaufruf ist
ohne gültige, passende Verbindung möglich.

**Implementierungsstand:** Die Zielkonfiguration ist genau ein fester
vertraulicher OAuth-Client mit `client_secret_basic`, PKCE `S256`, exakten
Callback-URIs, Resource/Audience und Scopes. Jeder UI-Start erzeugt davon
unabhängig eine neue gehashte Lernsession, die als Pflichtargument jedes
fachlichen Tools geprüft wird. Die produktive Abnahme umfasst deshalb sowohl
OAuth-/Refresh-/Revocationstests als auch Missing-, Expiry-, Cross-Learner- und
No-Fallback-Tests der Lernsession. Ein strikt datenloser
Discovery-Bootstrap darf nur eine zirkuläre Erstkonfiguration ermöglichen; er
stellt keine fachlichen Tools, Lernerdaten oder Coach-Readiness bereit und wird
vor dem Vollbetrieb deaktiviert.

### Etappe 3 – Normaler Lernworkflow

- Curriculum, Personalisierung, Scope, Navigation und Zielwahl anbinden;
- ursprüngliche Coaching- und Bewertungsregeln in Instructions, Tools und
  dynamische Context-Antworten migrieren;
- Ressourcen, Fortschritt, Erklärung, Aufgabe und Mastery abnehmen;
- natürlicher Einstieg mit möglichst nur einer echten Rückfrage testen.

**Exit:** Der vollständige normale Lernzyklus funktioniert in jeder
freigegebenen Interaktionssprache besser als
der sichtbare Key-/Value-Workaround und ohne Funktionsverlust zum ursprünglichen
Coach.

**Implementierungsstand:** elf neutrale Werkzeuge, Context-Projektion,
Knowledge-Verteilung und Cockpit-Start sind ausgerollt. Die fachliche
End-to-End-Acceptance in ChatGPT läuft weiter; bekannte Workflowabweichungen
werden allgemein in Zustandsprojektion und Toolkoordination korrigiert, nicht
durch fallspezifische Curriculumregeln.

### Etappe 4 – Recall und Prüfung

- drei Verified-Recall-Tools anbinden und alle Domain-Grenzen testen;
- sichere Prüfungsprojektion und getrennte Evaluation anbinden;
- alternative richtige Lösungswege, explizite Formanforderungen,
  Handschrift-Leseunsicherheit und „keine Nachfrage im Prüfungsmodus“ als
  Regressionstests aufnehmen.

**Exit:** Recall- und Exam-Acceptance-Suite vollständig grün.

**Implementierungsstand:** Backendvertrag und Regressionstests sind grün; die
sichtbare reale Chatabgabe und Modellbewertung müssen im Providerhost abgenommen
werden.

### Etappe 5 – Resilienz und Langzeittest

Mindestens folgende reale ChatGPT-Tests werden durchgeführt:

- zehn Wiederholungen der kurzen Cross-Turn-Retention;
- realistische große Context-Payloads;
- 20-, 50- und längere Dialogverläufe;
- provozierter Kontextdruck beziehungsweise Kompaktierung;
- Seiten-Reload, Browserneustart und neuer Chat mit OAuth plus noch gültiger
  Lernsession-ID;
- parallele Chats desselben Lernenden;
- abgelaufene Token, Token-Refresh, Widerruf und erneute Verbindung;
- Timeout, `409`, `429`, Retry und Backend-Neustart;
- Web und Mobilgerät in den vorgesehenen Tarifen und Regionen.

**Exit:** Kein Test benötigt manuelles Kopieren technischer Schlüssel;
Kontextverlust führt mit der noch gültigen automatisch transportierten
Lernsession höchstens zu einem frischen Context-Read, nicht zu verlorenem
Lernzustand.

### Etappe 6 – Gestufter mehrsprachiger Cutover

- neuen Frontendvariantentyp `openai-mcp` additiv neben `legacy` und
  `visible-session` einführen;
- bestehende Varianten und Routen unverändert lassen;
- internen Pilot, kleinen Canary und anschließend schrittweise Freigabe fahren;
- Installation, Verbindungsablauf und Rückkehr aus dem Cockpit praktisch prüfen;
  kein nicht dokumentiertes ChatGPT-Deep-Link-Verhalten voraussetzen;
- erst nach bewiesener App-Verfügbarkeit im kostenlosen beziehungsweise
  festpreisbasierten Zieltarif den MCP-Pfad zum Standard machen.

**Exit:** Die mehrsprachige V1-MCP-App ist der Standardpfad; Visible Session bleibt
sofort aktivierbarer Rückfallpfad.

**Implementierungsstand:** `openai-mcp` ist der aktuelle mehrsprachige
Frontendpfad. `visible-session` bleibt als isolierter Rollback erhalten und ist
keine produktive Referenzarchitektur mehr. Die allgemeine Freigabe des
MCP-Pfads setzt zusätzlich die vollständig abgenommene Kombination aus festem
vertraulichem OAuth-Client und expliziter 24h-Lernsession voraus. mTLS ist kein
Gate der Version `1.0.0`.

### Etappe 7 – Zwei getrennte MCP-Apps-UIs

- zwei aktive hashgebundene `text/html;profile=mcp-app`-Ressourcen im
  unveröffentlichten `1.0.0`-Draft ausliefern: read-only Lernzielbild und
  Karteikartenlernen;
- `render_skillpilot_goal_visualization` und
  `start_skillpilot_memory_practice` jeweils ausschließlich an ihre eigene
  aktuelle Ressource binden; Kartenreview und gewöhnliche Coach-Werkzeuge
  bleiben ungebunden;
- früh beworbene Startressourcen byte-identisch passiv lesbar halten, aber an
  kein aktives Werkzeug binden;
- fehlende, ungültige oder zu große Bilder sicher auf die normale
  Chatdarstellung degradieren;
- renderer-spezifisch nur `render_skillpilot_goal_visualization` an genau eine
  aktuelle bild-only Ressource binden;
- die strukturierte `goalVisualization` bild-only rendern, ohne
  User-Agent-/Surface-Gate und ohne zu behaupten, dass der Host sie angezeigt
  hat;
- den begrenzten Karteikartenstapel ausschließlich über Resultat-`_meta` an die
  Komponente liefern; Umdrehen und Navigation bleiben lokal, nur die explizite
  Bewertung schreibt die angezeigte Karte;
- jede bereits an reale Test-Clients ausgelieferte HTML-Hash-URI mit ihren
  exakten Bytes passiv lesbar halten; nur die aktuelle URI wird gebunden und
  nach dem Deployment mit aktualisierten Plugin-Metadaten in einem frischen
  Chat geprüft;
- interaktive fachliche Auswahl-, Abgabe- und Prüfungswidgets nur in einer
  späteren, ausdrücklich neu entworfenen Ausbaustufe ergänzen.

**Zwischenstand:** Beide aktiven UI-Ressourcen sind im unveröffentlichten
V1-Draft implementiert und separat gebunden. Für die Lernzielvisualisierung bleibt
genau eine aktuelle hashgebundene bild-only Ressource an den Renderer gebunden;
frühere ausgelieferte Bild-URIs sind ausschließlich passiv lesbar.

**Exit:** Die zwei UI-Funktionen schwächen den chat-first Coach nicht; der
normale Text- beziehungsweise Cockpit-Fallback bleibt unabhängig davon
erhalten, ob der Host die bereitgestellten Komponenten tatsächlich darstellt.

### Etappe 8 – Weitere Interaktionssprachen

- Backend-Payloadkatalog und Session-Sprachallowlist erweitern;
- für jede Sprache Golden Journeys, negative Sprachwechseltests und
  Lokalisierungs-Acceptance ergänzen;
- denselben V1-Endpunkt, OAuth-Client, neutralen Skill und Toolvertrag verwenden;
- Rollout über Backendfreigabe und Telemetrie je Session-Sprache beobachten.

**Exit:** eigenständig grüne Nutzerreisen je freigegebener Sprache, ohne neue
Plugin-Identität.

## 10. Deployment, Observability und Rollback

### 10.1 Umgebungen

- **Lokal:** ein Spring-Backend mit getrennten MCP-Endpunkten, Tunnel nur für
  Developer Mode, synthetische Daten bis zur vollständigen Mandantentrennung.
- **Staging:** eigener stabiler Origin, eigene Developer-App, eigener OAuth-
  Client, produktionsähnliche Datenbank ohne reale Lernendendaten.
- **Produktion:** das bestehende Spring-Backend als immutable Artefakt mit
  Git-SHA und MCP-Contract-Hash, Blue/Green-Umschaltung hinter stabilem Origin.

Der Deploymentpfad muss MCP-Contract-Tests, OAuth-Metadaten und die getrennten
Readiness-Gates vor der Umschaltung prüfen. Eine zweite Runtime ist nicht nötig.

### 10.2 Telemetrie

Der Anwendungscode erfasst Toolaufrufe, Ergebnisstatus und Latenz sowie einen
fest begrenzten Satz operationaler Ereignisse: OAuth- und Refreshfehler, `401`,
`403`, `409`, `429`, Timeouts, Replay-Ablehnungen, Cross-Provider-Ablehnungen und
unerwartete Toolfehler. App-/Artefaktversionen kommen als globale Deployment-
Tags aus der Metrikinfrastruktur; der veröffentlichte MCP-Vertrag ist zusätzlich
über den deterministischen `contractHash` im geschützten Health-Contributor
identifizierbar. MCP-/Backend-/DB-Readiness wird über die Actuator-Gruppe
`readiness` einschließlich `openAiDeCoach` und `db` geliefert.

Nicht protokolliert werden OAuth-Tokens, permanente SkillPilot-ID, rohe
`openai/session`, vollständige Prompts, Schülerantworten oder Prüfungsraster.

Das Spring-Backend erzwingt ein lokales Rate Limit pro direktem Netzwerkpeer und
getrenntem OpenAI-Endpunktbereich. Bei Überschreitung antwortet es mit `429` und
`Retry-After`. In einem Mehrinstanzbetrieb ergänzt ein vertrauenswürdiges Gateway
zwingend ein gemeinsames Limit. Der Anwendungslimiter parst keine Forwarding-
Header selbst; er darf sich nur hinter einem vertrauenswürdigen, Header
sanitisierenden Proxy auf die vom Servlet-Container normalisierte Adresse
stützen.

### 10.3 Schalter und Rückfall

Mindestens drei unabhängige Schalter sind vorgesehen:

1. `SKILLPILOT_OPENAI_COACH_V1_ENABLED`
2. `SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED`
3. öffentlicher Reverse-Proxy-Upstream beziehungsweise Frontendvariante

Bei einem Fach- oder Sicherheitsproblem werden zuerst Writes deaktiviert, dann
das vorherige Backendartefakt beziehungsweise der Visible-Session-Startpfad
reaktiviert. Datenbankänderungen erfolgen nur nach
Expand–Migrate–Contract; ein Rollback erfordert keine destruktive Down-Migration.
OAuth-Verbindungen werden nur bei einem Sicherheitsvorfall pauschal widerrufen.

## 11. Go-/No-Go-Gates

Der mehrsprachige V1-Cutover ist nur erlaubt, wenn alle folgenden Punkte erfüllt sind:

- kein SkillPilot-eigener OpenAI-Modell-API-Aufruf im Coach-Laufzeitpfad;
- echte Nutzbarkeit in den vorgesehenen kostenlosen und festen Consumer-Tarifen;
- vollständige Workflow-Parität in jeder freigegebenen Interaktionssprache;
- OAuth-, Mandantentrennungs-, Datenschutz- und Minderjährigenprüfung;
- keine manuell zu übertragenden technischen Schlüssel; die automatisch
  eingesetzte `learningSessionId` wird nicht vom Nutzer verwaltet;
- Rehydration nach Kontextverlust und Wiederaufnahme;
- verlässliche Installation und Verbindung aus dem SkillPilot-Cockpit;
- Telemetrie, Kill Switch und getesteter Rollback;
- Legacy- und Visible-Session-Quellen bleiben separat verfügbar.

Ein grüner MCP-Protokolltest allein ist kein Release-Gate. Die
Lernzielvisualisierung benötigt zusätzlich Byte-, MIME-, Größen-, Alttext-,
Darstellungs- und Degradationstests. Ihr Fehlen oder ein nicht auslieferbares
Bild darf den vollständigen chat-first Coach-Dialog nicht blockieren.

## 12. Nächster ausführbarer Schnitt

Der mehrsprachige V1-MCP-Pfad wird zunächst auf der TLS/OAuth-Betriebsbasis funktional
stabilisiert. Der nächste kontrollierte Schnitt ändert keine Lernziel-,
Mastery-, Curriculum- oder Coach-Semantik:

1. Datenbank und aktive Nginx-Konfiguration sichern;
2. exakte vertrauliche Client-ID, langes zufälliges Client-Secret, produktive
   Callback-URI und die bei einem tatsächlichen Clientwechsel ausdrücklich zu
   entfernenden Altclient-IDs festhalten;
3. Secure-Mode-Werte für `client_secret_basic`, Client-ID, Client-Secret,
   Callback, Resource und Scopes aus dem Secret-Store setzen;
4. Bootstrap deaktivieren, Backend auf Loopback binden, normal deployen und
   die fail-closed Runtime-Gates ausführen;
5. die App einmal neu verbinden; OAuth/PKCE, `client_secret_basic`,
   Token-Austausch und Read-/Write-Scope über die echte ChatGPT-App abnehmen;
   anschließend zweimal **Lernen starten**, unterschiedliche Session-IDs
   nachweisen und Context-Rehydration mit beiden separat prüfen;
6. eine verwendete Altclient-Allowlist nach erfolgreichem Cutover aus dem
   Environment entfernen und die vollständige Workflow-Paritätsmatrix
   weiterführen;
7. das versionierte neutrale Plugin-/Skill-Quellpaket mit seiner realen lokalen
   `.app.json`-Abbildung über den persönlichen Marketplace installieren und
   nach jedem Paketupdate in einem neuen Chat laden;
8. den bereits aus dem bewährten Custom-GPT-Korpus und den aktuellen
   `COACH-*`-Policies abgeleiteten, implizit deaktivierten Coach-Skill gegen
   App-only-Baseline, Golden Journeys sowie positive und negative
   Aktivierungsfälle im realen Host testen;
9. die implementierten Backendguards für die aktuelle veröffentlichte
   Curriculumsmenge und das aktuelle sichtbare aktive Recall-Merkziel als
   Regression-Gates beibehalten;
10. erst nach diesem Paritäts- und Backendgate die monolithischen
   Server-Instruktionen
   schrittweise auf werkzeugübergreifende Invarianten reduzieren.

Die exakten Betriebswerte, Smoke-Tests und Rollbackschritte stehen in
[openai-mcp-coach-v1.md](../../deploy/openai-mcp-coach-v1.md).

## 13. Offizielle OpenAI-Grundlagen

- [OpenAI: Plugin-Architektur](https://developers.openai.com/plugins/concepts/plugins)
- [OpenAI: Skills bauen](https://developers.openai.com/plugins/build/skills)
- [OpenAI: Plugins paketieren](https://developers.openai.com/plugins/build/plugins)
- [OpenAI: MCP-Server-Instruktionen und Toolmetadaten](https://developers.openai.com/plugins/build/mcp-server)
- [OpenAI: Plugin authentication und OAuth-Metadaten](https://developers.openai.com/plugins/build/auth)
- [OpenAI: Client identification](https://developers.openai.com/plugins/build/auth#client-identification)
- [OpenAI: Client registration und Authentisierung](https://developers.openai.com/plugins/build/auth#client-registration)
- [OpenAI: Mutual TLS](https://developers.openai.com/plugins/build/auth#mutual-tls-mtls)
- [OpenAI: Resource-/Audience-Bindung](https://developers.openai.com/plugins/build/auth#echo-the-resource-parameter-throughout-the-oauth-flow)
- [Data-only Apps ohne eigene UI](https://learn.chatgpt.com/docs/build-app#app-building-model)
- [Plugins in ChatGPT und Codex](https://help.openai.com/de-de/articles/20001256-plugins-in-chatgpt-and-codex)
- [OpenAI-Mindestalter und Elternzustimmung](https://help.openai.com/en/articles/8313401-is-chatgpt-safe-for-all-ages)
