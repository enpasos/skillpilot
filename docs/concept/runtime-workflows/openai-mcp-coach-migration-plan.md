# Migration des SkillPilot-Coaches zur OpenAI-MCP-App

**Stand:** 31. Juli 2026

**Status:** Die mehrsprachige V1-MCP-App ist der aktuelle ChatGPT-Pfad. Ihr
Coach-Vertrag bleibt chat-first und kann im noch unveröffentlichten
`1.0.0-SNAPSHOT`-Arbeitsstand das Bild des aktiven atomaren Lernziels über genau
eine hashgebundene `text/html;profile=mcp-app`-Ressource bild-only darstellen.
Nur der dedizierte Renderer ist an diese Ressource gebunden; gewöhnliche Tools
bleiben UI-los. Serverauthentisiertes TLS und das
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
`.app.json`-Abbildung. Es gibt keine manuell zu übertragenden technischen
Schlüssel und keine Abhängigkeit von Custom-GPT-Action-Retention; die pro Start
automatisch transportierte, kurzlebige `learningSessionId` ist davon
ausdrücklich ausgenommen.

Die übergeordnete Architekturentscheidung ist in
[skillpilot-owned-coach-architecture.md](skillpilot-owned-coach-architecture.md)
beschrieben. Dieses Dokument übersetzt sie in eine konkrete, schrittweise
Migration mit Abnahmekriterien, Cutover und Rollback.
Die feste V1-Identität, kompatible Versionsänderungen, Contract-Snapshots und
der Lebenszyklus werden normativ im
[Versionierungs- und Lebenszyklusplan](openai-plugin-versioning-and-lifecycle.md)
geführt.

Die technische Migration und die Zuordnung der früheren Regeln sind nicht mit
sichtbarer Endnutzerparität gleichzusetzen. Das allgemeine Coach-
Verhaltensmodell, die Golden Journeys, der ehrliche Integrationsstand und die
modellgestützte End-to-End-Abnahme werden normativ in
[Verhaltensintegration des MCP-Lerncoaches](openai-mcp-coach-behavioral-integration.md)
geführt.

## 1. Entscheidung

SkillPilot migriert **nicht** den sichtbaren Session-Workaround und baut den
bestehenden Custom GPT auch nicht weiter aus. Stattdessen entsteht eine
mehrsprachige, chat-first OpenAI-MCP-App mit einer eng begrenzten
bild-only MCP-Apps-UI für das aktive atomare Lernziel:

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
Die optionale Lernzielbildausgabe über genau eine aktiv gebundene hashgebundene MCP-Apps-
Ressource ist Teil des unveröffentlichten V1-Drafts. Sie zeigt ausschließlich
das Bild; interaktive Widgets für Auswahl, Antwortabgabe oder Prüfungs-Receipts
bleiben mögliche spätere Verbesserungen und sind kein Bestandteil des
V1-Vertrags.

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
4. **Sprache backendautoritativ:** ein neutraler Vertrag ohne frei wählbaren
   `language`-Parameter. Die beim Start festgelegte `communicationLocale` wird
   aus der Lernsession geladen und steuert sämtliche sichtbare Kommunikation.
5. **Bildausgabe eng begrenzen:** Der erste produktionsnahe Vertrag besitzt
   genau ein read-only Rendering-Werkzeug und genau eine aktiv gebundene hashgebundene
   `text/html;profile=mcp-app`-Ressource. Nur der Renderer trägt
   `ui.resourceUri` und `openai/outputTemplate`; gewöhnliche Werkzeuge bleiben
   ungebunden. Die UI rendert ausschließlich die strukturierte
   `goalVisualization` und darf weder Auswahl noch Lernzustand mutieren.
   Interaktive Auswahl-, Abgabe- und Prüfungswidgets bleiben mögliche spätere
   Härtungsstufen außerhalb des V1-Vertrags.
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

Die Werkzeuge sind in neutralem Englisch beschrieben, fachlich eng geschnitten
und besitzen keinen frei wählbaren Sprachparameter. `learningSessionId` ist
ausnahmslos Pflichtargument jedes Werkzeugs; die übrigen Argumente sind
werkzeugspezifisch. Das Backend liefert `communicationLocale` und alle
lernerseitigen Nutzdaten in der Zielsprache. Die Namen bleiben technisch
eindeutig:

| Tool | Aufgabe |
| --- | --- |
| `get_skillpilot_context(learningSessionId)` | SkillPilot-Lerncoach bei einer natürlichen SkillPilot-Lernabsicht starten oder fortsetzen sowie den kompakten Lernzustand für die explizit adressierte Lernsession rehydrieren |
| `get_skillpilot_navigation(learningSessionId, target)` | Optionen für einen ausdrücklichen Wechsel von Curriculum, Personalisierung, Scope oder Ziel laden |
| `set_skillpilot_curriculum(learningSessionId, curriculumId)` | Ein Curriculum aus den aktuell erlaubten Optionen setzen |
| `set_skillpilot_personalization(learningSessionId, optionId)` | Genau eine aktuell angebotene, opak referenzierte Personalisierungsoption setzen |
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
veröffentlicht. Insbesondere enthält das Tool-Schema für `learningSessionId`,
`curriculumId`, `optionId`, `goalId` und `cardId` keine regulären Ausdrücke und
keine Mindest- oder Maximallängen. Das Modell soll solche Werte ausschließlich
aus der aktuellen SkillPilot-Startnachricht beziehungsweise dem jüngsten
SkillPilot-Ergebnis unverändert übernehmen, nicht selbst konstruieren.

Die Vereinfachung schwächt die Sicherheits- und Datenintegritätsgrenze nicht:
Das Spring-Backend prüft weiterhin Format, Nichtleere, Gültigkeit,
Aktualität, Berechtigungen und erlaubte Werte vollständig und lehnt jeden
ungültigen Aufruf fail-closed ab. Modellvertrag und Servervalidierung bleiben
damit bewusst getrennt.

Ein generisches `applyChoice` ist für die chat-first Version nicht vorgesehen. Der
Personalisierungsplan veröffentlicht für jede aktuell zulässige Auswahl eine
opake `optionId`. Das Modell übergibt ausschließlich diese ID unverändert; es
rekonstruiert weder Landschafts- noch Filter-IDs und löst keine sichtbaren Label
auf. Die Mutationsgrenze erzeugt den Plan unter Zeilensperre erneut und akzeptiert
genau eine noch aktuelle ID. Unbekannte, veraltete, wiederholte oder mehrdeutige
Werte werden vor jeder Zustandsänderung abgewiesen.

Die Kardinalität einer Landschaftsauswahl wird pro Gruppe explizit durch
`minSelections` und `maxSelections` beschrieben und ist nicht auf ein Fach oder
eine Einzelauswahl festgelegt. Eine nichtleere `SkillLandscape.filters`-Liste
beschreibt dagegen weiterhin genau **eine lokale Single-Choice-Dimension** der
betreffenden Landschaft. Daher darf eine einzelne Filterentscheidung höchstens
eine Filteroption dieser Landschaft setzen. Diese Grenze folgt aus dem heutigen
Persistenzmodell, nicht aus Namen wie Bundesland, Fach oder Kurs.

Erreicht eine Gruppe ihre Höchstzahl, gilt sie automatisch als abgeschlossen.
Liegt die Zahl der gewählten Werte dagegen zwischen Minimum und Maximum,
veröffentlicht der Plan neben den verbleibenden Werten eine opake
`COMPLETE_GROUP`-Option. Nur diese explizite Protokollaktion beendet die
Gruppeninstanz vorzeitig; aus einem Benutzertext wie „das reicht“ oder aus dem
Ausbleiben weiterer Werte darf der Provideradapter keinen Abschluss ableiten.
Eine optionale Gruppe mit `minSelections = 0` kann auf demselben Weg ohne
fachliche Auswahl abgeschlossen werden. Der Abschluss wird als reservierter
Flow-Zustand gespeichert, verändert aber weder Landschafts- noch Filterauswahl.
Bei dynamischen Gruppen gelten Minimum, Maximum und Abschluss jeweils für die
konkrete Gruppeninstanz, nicht pauschal für alle ausgewählten Landschaften.

Personalisierungsaufrufe des Coaches sind inkrementelle, transaktionale
Änderungen: Sie erhalten bereits im Cockpit gesetzte Curriculum-, Fach-,
Stufen- und Kurswerte. Mutation und Projektion des Folgezustands gehören zu
derselben Transaktion, damit ein Projektionsfehler keine teilweise gespeicherte
Konfiguration hinterlässt. Vollständige Konfigurationsschreibvorgänge der
SkillPilot-Weboberfläche behalten dagegen ausdrücklich ihre
Vollersatzsemantik.

Eine spätere Widget-Version darf opake, kurzlebige Choice-Referenzen und
app-exklusive Tools ergänzen.

`chooseMemoryMode` braucht kein eigenes Tool: „Im Cockpit üben“ führt zum
Cockpit-Link, „Mit Lerncoach prüfen“ startet Verified Recall. Ein `retest`-Feld
wird erst veröffentlicht, wenn es vom Backend tatsächlich fachlich ausgewertet
wird.

### 5.1 Expliziter PersonalizationFlow, zentraler Plan und spärliche Persistenz

Die Personalisierung ist keine aus dem sichtbaren Dialog abzuleitende
Modellheuristik. Eine Curriculumwurzel kann dafür einen versionierten
`personalizationFlow` deklarieren. Das Backend wertet diese Deklaration zu einem
zentralen `PersonalizationPlan` aus. Flow und Plan sind die einzigen Autoritäten
für:

- Stufen, Gruppen und deren deterministische Reihenfolge;
- Mindest- und Höchstzahl der Auswahlen je Gruppe;
- die für die aktuelle Dimension zulässigen Optionen;
- die kanonischen Mutationsziele wie Filter- und Landschafts-IDs;
- die Entscheidung, ob die Einrichtung abgeschlossen ist.

MCP-Kontext, Navigation, Mutationsvalidierung und Cockpit-Projektion verwenden
denselben Plan. Er besitzt derzeit drei allgemeine, kombinierbare Quelltypen:

- `landscapeFilters`: die explizit deklarierten Filter genau einer Landschaft;
- `landscapes`: eine explizit geordnete Menge von Landschaften;
- `filtersForSelectedLandscapes`: je zuvor gewählter Landschaft deren
  deklarierte Filter.

Diese Quelltypen sind reine Metadatenoperationen. Der Planer durchläuft weder den
Skill-Graphen noch dessen `contains`- oder `requires`-Kanten. Er leitet
Personalisierung auch nicht aus Frontier, Applicability, Composition Views,
Tags, Labeln, Fachnamen, Regionen oder fest codierten IDs ab. Sichtbare,
lokalisierbare Label dienen ausschließlich der Darstellung. Hessen,
Mathematik und LK sind nur Daten einer konkreten Flow-Instanz.

Damit ein Provider die Entscheidung ohne Wissen über eine konkrete Domäne
korrekt führen kann, projiziert der MCP-Kontext neben den opaken Optionen auch
die aktuelle Entscheidungsfrage beziehungsweise Stufen- und Gruppenlabel sowie
`minSelections`, `maxSelections` und `selectedCount`. Diese Angaben sind
Laufzeitdaten des Plans, keine Instruktionen in der öffentlich sichtbaren
App-Beschreibung. Der Adapter darf weder Kardinalität noch Bedeutung aus
Labels, früheren Chatnachrichten oder bekannten Curriculumnamen erraten.

Für den Einstieg gilt zusätzlich ein allgemeiner UX-Vertrag:

1. Der Coach nennt zuerst knapp den vom Backend bestätigten Einstiegskontext.
   Bereits feststehende Angaben werden nicht erneut erfragt.
2. Danach fragt er die im authored Flow noch offenen Angaben gemeinsam ab,
   soweit sie aus dem aktuellen autoritativen Plan bestimmbar sind. Die
   sichtbare Reihenfolge ist nur Orientierung; die lernende Person darf mehrere
   Angaben zusammen und in beliebiger Reihenfolge beantworten.
3. Spätere Entscheidungsgruppen und ihre sichtbaren Antworten sind in dieser
   Sammelfrage nur Orientierung. Sie sind keine vorab ausführbaren
   Mutationsoptionen und ihre technischen Referenzen werden nicht
   zwischengespeichert oder vorweggenommen.
4. Das Backend verarbeitet die erkennbare Mehrfachabsicht weiterhin streng
   sequenziell: genau eine aktuell zulässige Option anwenden, den
   `PersonalizationPlan` frisch laden und erst danach die nächste Angabe gegen
   die nun aktuellen Optionen auflösen. Nur tatsächlich mehrdeutige oder nach
   der Neuprojektion noch offene Angaben werden erneut erfragt.

Damit ist die Benutzerantwort reihenfolgefrei, ohne die Autorität der
zustandsabhängigen Mutationsschnittstelle aufzuweichen. Bedingte Folgefragen,
deren Inhalt erst nach einer vorgelagerten Auswahl feststeht, werden als solche
kenntlich gemacht oder erst nach der frischen Neuprojektion konkretisiert; der
Coach erfindet dafür keine Optionen.

Fehlt `personalizationFlow`, besteht für diese Curriculumwurzel keine
verpflichtende geführte Personalisierung. Existiert ein Flow, ist aber
syntaktisch oder semantisch ungültig, schlägt die Einrichtung geschlossen fehl:
Lehren, Frontier-Aktivierung und schreibende Lernaktionen bleiben gesperrt,
anstatt aus dem Graphen einen vermeintlichen Ersatzablauf zu erraten.

Die Filter-ID wird immer im Namensraum ihrer deklarierenden Landschaft
aufgelöst; die kanonische Schreibweise stammt aus den Metadaten. Eine
Filtergruppe hat wegen des heutigen Landschaftsvertrags höchstens
`maxSelections = 1`. Eine Landschaftsgruppe darf dagegen beliebige ausdrücklich
deklarierte `minSelections`/`maxSelections` verwenden. Dynamische Filtergruppen
werden als je eine Gruppeninstanz pro zuvor ausgewählter, tatsächlich gefilterter
Landschaft ausgewertet.

Für `filtersForSelectedLandscapes` gilt in Flow-Version 1 eine bewusst enge
Grenze: Werden `filterIds` angegeben, bilden sie ein gemeinsames,
groß-/kleinschreibungsunabhängig eindeutiges Filtervokabular und jede ID muss in
jeder Landschaft auflösbar sein, die die referenzierte Vorgängergruppe anbieten
kann. Unterschiedliche eingeschränkte Listen je Landschaft sind in Version 1
nicht darstellbar. Bei heterogenen Filtervokabularen wird `filterIds` deshalb
weggelassen; dann verwendet jede ausgewählte Landschaft ihre eigenen
deklarierten Filter. Ein ausdrücklich deklarierter Flow muss mindestens eine
Stufe enthalten, und jede Stufe sowie Gruppe braucht ein nichtleeres sichtbares
Label. Verstöße machen den gesamten Flow ungültig und lösen keinen stillen
Fallback aus.

Für die Zustandsmaschine gilt eine harte Priorität: Solange eine erforderliche
Einrichtungsdimension offen ist, veröffentlicht der Kontext zuerst die
entsprechende Setup-Aktion wie `setCurriculum`, `setPersonalization` oder
`setScope`. Lehren, Aufgabengenerierung, automatische Zielaktivierung und
sonstige Autopilot-Schritte sind dann noch nicht zulässig. Erst nach einer
gültigen, vollständig projizierten Auswahl wird die Frontier berechnet. Die
Frontier ist damit Ergebnis der Personalisierung, niemals deren Eingabe oder
Steuersignal.

Persistiert wird die Personalisierung **spärlich**: Eine Coach-Mutation schreibt
nur die durch die aktuelle `optionId` adressierte Landschaft und gegebenenfalls
deren kanonischen Filter, nicht die vollständige erreichbare Landschafts- oder
Scope-Closure. Der neue Planpfad durchläuft dabei ausdrücklich keine alten,
fachspezifischen Kompatibilitätsregeln für Filterbezeichnungen. Ein
fehlender Nachfahr-Eintrag ist deshalb insbesondere **keine dauerhaft
gespeicherte negative Entscheidung** und nicht gleichbedeutend mit einem
expliziten `selected: false`. Er darf aber ebenso wenig pauschal als
ausdrücklich ausgewählt gelten. Im heutigen Projektionsvertrag wird ein
fehlender Nachfahr nach Beginn einer persönlichen Konfiguration im gefilterten
Lernzielgraphen zunächst nicht ausgewählt; der `PersonalizationPlan` kann ihn
weiterhin als offene oder angebotene Auswahl veröffentlichen. Geerbte,
implizite oder voreingestellte Werte gelten nur, wenn die Metadaten des
aktuellen Plans sie tatsächlich definieren.

Insbesondere darf das Backend nicht den gesamten fachlichen Abschluss als
explizit ausgewählt materialisieren, nur damit ein inkrementeller
Schreibvorgang funktioniert. Die Leseprojektion wertet die spärliche
Konfiguration zusammen mit den aktuellen Metadaten aus; eine Mutation schreibt
nur das kanonische Delta. Ältere Datensätze, die beispielsweise nur eine
Wurzelentscheidung enthalten, werden deshalb als teilweise eingerichteter
Zustand interpretiert und nicht als ausdrückliche Abwahl sämtlicher
untergeordneter Landschaften. So können sich Metadaten weiterentwickeln, ohne
dass vollmaterialisierte Alt-Snapshots die aktuelle Semantik überdecken.

Inkrementelle Coach-Mutationen verändern ausschließlich die im Plan adressierte
Dimension. Bereits ausdrücklich gewählte parallele Fächer und deren
Kursausprägungen bleiben erhalten. Die Auswahl von Mathematik LK darf
beispielsweise Biologie oder ein anderes ausdrücklich gewähltes Fach nicht
stillschweigend abwählen. Eine exklusive Einzelfachauswahl ist nur zulässig,
wenn die Metadaten des Plans diese Dimension ausdrücklich als exklusiv
definieren und die lernende Person diese Auswahl trifft. Der vollständige
Ersatz einer Konfiguration bleibt ein ausdrücklich davon getrennter
Cockpit-Workflow.

Kursprofile sind fachbezogene Werte und keine globale Eigenschaft einer
Lernsession. Mathematik LK und Physik GK müssen daher gleichzeitig abbildbar
sein. Ein Kursprofil setzt weder die Lernstufe noch G8/G9: „Mathematik LK“
beantwortet Fach und Mathematik-Kursprofil; ein nur auf Sekundarstufe II
begrenzter Lernumfang, ein stufenübergreifender Neustart und das Dauer- oder
Jahrgangsmodell bleiben eigenständige Entscheidungen. Solange eine davon für
die aktuelle Nutzerabsicht erforderlich und nicht eindeutig bekannt ist,
bleibt sie als Rückfrage offen.

Jede eingereichte kanonische ID muss genau zu einer aktuellen Planoption passen.
Mutation und Neuberechnung von Plan und Coach-Kontext liegen in derselben
Transaktion. Nach jeder Mutation wird deshalb aus dem gespeicherten Delta und
den aktuellen Metadaten der Folgezustand neu projiziert; der Client darf ihn
nicht selbst fortschreiben.

Eine Landschaft, die außerhalb der bisherigen Skill-Graph-Closure liegt,
darf nur dann in den Lernzeitkontext aufgenommen werden, wenn sie von einer
gültigen `landscapes`-Quelle des aktiven Flows ausdrücklich angeboten und im
persönlichen Zustand ausdrücklich gewählt wurde. Eine beliebige oder alte
Konfigurationszeile erweitert den Laufzeitkontext nicht. Filter bleiben dabei
grundsätzlich im Namensraum ihrer deklarierenden Landschaft; eine Projektion
auf eine übergeordnete Wurzel ist ausschließlich eine separat dokumentierte
Legacy-Kompatibilität und keine Semantik des neuen Flows.

Weitere unabhängige Personalisierungsachsen werden nicht durch Fach-, Label- oder
ID-Sonderregeln nachgerüstet. Sie benötigen einen neuen, versionierten
Flow-Quelltyp samt Schema, Validierung, Persistenzsemantik und neutralen
Vertragstests. Paketweite `scopeDimensions`/`offeredScopes` können dafür später
eine zusätzliche autoritative Datenquelle werden; sie dürfen erst verwendet
werden, wenn Planerzeugung, Mutation und Projektion gemeinsam darauf umgestellt
sind. Nicht darstellbare Entscheidungen werden bis dahin fail-closed abgewiesen.

Die Architektur ist erst fachübergreifend abgenommen, wenn mindestens folgende
Fälle ohne Sonderlogik funktionieren:

- Wurzel → erste deklarierte Stufe → Landschaft → lokaler Filter →
  nächster Setup- oder Lernschritt, auch mit rein synthetischen IDs und Labels;
- Landschaftsgruppen mit unterschiedlichen `minSelections`/`maxSelections`
  sowie filterlose Landschaften;
- Erhaltung bereits explizit und schrittweise gewählter paralleler
  Landschaften beziehungsweise Fächer;
- Wiederaufnahme einer älteren, nur teilweise gespeicherten
  Wurzel-/Nachfahrkonfiguration;
- atomare Ablehnung veralteter Option-IDs, roher Coach-Konfiguration,
  überschrittener Kardinalität und landschaftsfremder Filter-IDs ohne teilweise
  Zustandsänderung;
- keine Ableitung aus Frontier-Tags und keine fest codierten Label, Fachnamen
  oder fachlichen IDs in Laufzeitlogik oder Vertragstests.

### 5.2 Context-Ergebnis

`get_skillpilot_context(learningSessionId)` ist trotz seines stabilen
technischen Namens das eindeutige Bootstrap-Werkzeug. Wenn die App ausgewählt
oder SkillPilot genannt
wurde und die lernende Person lernen, üben, starten, fortsetzen oder den
gespeicherten Lernstand verwenden möchte, muss es vor der ersten fachlichen
Antwort laufen. Eine allgemeine Lehrplanübersicht oder ein frei erfundener
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
- aktuell erlaubte Optionen mit Label und passender Referenz: opake `optionId`
  für Personalisierung, fachliche ID nur für bewusst fachliche Navigation;
- bei einer offenen Personalisierungsgruppe deren Entscheidungslabel,
  Gruppeninstanz, Minimum, Maximum und bereits gewählte Anzahl;
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
Werkzeuge bleiben von der UI-Ressource ungebunden. Wenn das
neueste vollständige Kontext- oder Mutationsergebnis eine zulässige
Visualisierung enthält und den Renderer erlaubt, läuft er unmittelbar danach
im selben Assistant-Turn genau einmal mit unveränderter Ziel-ID und
`expectedStateVersion` aus genau diesem Ergebnis. Er validiert den aktuellen
Backendzustand erneut. Bei fehlender, veralteter, ungültiger oder zu großer
Visualisierung wird kein Bild ausgeliefert; der normale Chatablauf bleibt
vollständig erhalten. Das Bild dient nur der Orientierung, nie als Evidenz,
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
| spätere interaktive Widgetdarstellung | app-only Metadaten und Tools; niemals fachliche Modellanweisung |

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
3. Die lernende Person lädt oder erzeugt ihre SkillPilot-ID ausschließlich in
   der SkillPilot-Weboberfläche, wählt den fachlichen Einstieg und klickt
   ausdrücklich auf **Lernen starten**.
4. Genau in diesem Augenblick wendet SkillPilot den eng typisierten Start-Intent
   an und erzeugt eine frische, hochentropische `learningSessionId`. Auch zwei
   Starts desselben Lernenden erzeugen zwei verschiedene IDs.
5. Das Backend speichert nur HMAC beziehungsweise Hash der ID zusammen mit
   Lernendenreferenz, Erzeugungszeitpunkt und absolutem Ablaufzeitpunkt. Die
   Laufzeit beträgt exakt 24 Stunden und wird durch Nutzung nicht
   verlängert.
6. SkillPilot setzt die ID automatisch in die URL-codierte natürliche
   ChatGPT-Startnachricht ein. Die lernende Person muss nichts kopieren und
   sieht niemals die permanente SkillPilot-ID, ein OAuth-Token oder das
   Client-Secret.
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

Eine Installation direkt in ChatGPT ohne vorheriges **Lernen starten** darf
OAuth erfolgreich verbinden, erhält bei fachlichen Tools jedoch
`SESSION_REQUIRED` und verweist verständlich zurück auf SkillPilot.

### 7.2 Vorgesehene Sicherheitsparameter

| Objekt | Vorgabe |
| --- | --- |
| Access Token | 30–60 Minuten |
| Refresh Token | höchstens 30 Tage, rotierend |
| Lernsession | bei jedem **Lernen starten** frisch; Ablauf exakt 24 Stunden nach Erzeugung; weder Toolaufruf noch Token-Refresh verlängert sie |
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

### Etappe 7 – Bild-only MCP-Apps-UI

- read-only Lernzielbild für aktive atomare Ziele über genau eine aktiv gebundene hashgebundene
  `text/html;profile=mcp-app`-Ressource im unveröffentlichten `1.0.0`-Draft
  ausliefern;
- fehlende, ungültige oder zu große Bilder sicher auf die normale
  Chatdarstellung degradieren;
- nur `render_skillpilot_goal_visualization` mit `ui.resourceUri` und
  `openai/outputTemplate` an die eine aktuelle Ressource binden; gewöhnliche
  Werkzeuge bleiben ungebunden;
- die strukturierte `goalVisualization` bild-only rendern, ohne
  User-Agent-/Surface-Gate und ohne zu behaupten, dass der Host sie angezeigt
  hat;
- jede bereits an reale Test-Clients ausgelieferte HTML-Hash-URI mit ihren
  exakten Bytes passiv lesbar halten; nur die aktuelle URI wird gebunden und
  nach dem Deployment mit aktualisierten Plugin-Metadaten in einem frischen
  Chat geprüft;
- interaktive Widgets nur in einer späteren, ausdrücklich neu entworfenen
  Ausbaustufe ergänzen.

**Zwischenstand:** Die read-only Lernzielvisualisierung über eine einzelne
hashgebundene, bild-only MCP-Apps-UI-Ressource ist im unveröffentlichten V1-
Draft implementiert. Eine interaktive MCP-UI ist nicht Teil von V1.

**Exit:** Die optionale Bildausgabe schwächt den chat-first Coach nicht und
der normale Textpfad bleibt unabhängig davon erhalten, ob der Host die
bereitgestellte UI-Komponente tatsächlich darstellt.

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
