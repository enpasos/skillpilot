# SkillPilot-eigene Lerncoach-Zielarchitektur

Status: strategische Zielarchitektur; noch nicht der produktive Standardpfad.
Die ChatGPT Visible Session bleibt bis zur vollständigen Workflow-Parität erhalten.

## Entscheidung

Der nächste Lerncoach soll als **SkillPilot-kontrollierter Turn-Orchestrator** im
bestehenden Web-Cockpit und Spring-Boot-Backend entstehen. OpenAI, Anthropic oder
weitere Modelle werden austauschbare Inferenzanbieter. Sie verwalten weder den
fachlichen Lernzustand noch entscheiden sie allein, ob ein notwendiger
Backend-Schritt ausgeführt wird.

ChatGPT Apps und Claude MCP bleiben sinnvolle zusätzliche Zugangskanäle. Sie sind
aber nicht der Kern der Zustands- und Workflow-Architektur, weil ein frei
formulierter Turn im Provider-Client weiterhin davon abhängt, dass der Host das
richtige Tool aufruft.

## Warum die Visible Session nicht das Zielbild ist

Die Visible Session erhält die aktuelle Anwendung trotz der Custom-GPT-Regression
funktionsfähig. Dafür trägt sie Sitzungstoken, Lernziel-IDs und zeitlich lokale
Auswahlreferenzen sichtbar durch den Dialog. Eindeutige Action-Responses können
innerhalb desselben Assistententurns weitergereicht werden. Über einen neuen
User-Turn hinweg bleibt die Weitergabe jedoch instruktions- und hostabhängig.

Prompting kann unnötige Rückfragen reduzieren, aber drei Grenzen nicht aufheben:

- SkillPilot erhält den freien User-Turn nicht garantiert und kann den Tool-Loop
  deshalb nicht selbst erzwingen;
- der Host kann Gesprächskontext kompaktieren oder Action-Werte nicht wieder
  bereitstellen;
- technische Relay-Werte müssen sichtbar werden, sobald ein weiterer User-Turn
  sie wieder benötigt.

Die bereits bestehende
[providerneutrale Coach-Grenze](provider-neutral-coach-boundary.md) bleibt gültig.
Die neue Architektur setzt oberhalb dieser Grenze einen kontrollierten
Turn-Orchestrator.

## Zielbild

```text
SkillPilot-Web/PWA
       |
       | authentifizierter User-Turn, Text/Bild, stabile turnId
       v
CoachTurnController
       |
       v
CoachTurnOrchestrator --------------------> CoachModelPort
  |        |        |                         |-- OpenAI-Adapter
  |        |        |                         `-- Anthropic-Adapter
  |        |        `--> CoachContextCompiler
  |        |
  |        |--> CoachIntentResolver
  |        `--> CoachConversationStore
  |
  `--> neue zwingende SafeCoachRuntime-Grenze
          |-- freigegebene Coach-DTOs
          |-- CoachStateProjection
          `--> CoachToolFacade + LearnerService + Datenbank

optionale Kanäle nachgelagert:
ChatGPT App/Widget | Claude MCP | weitere Provider-Clients
```

Die logischen Komponenten bleiben zunächst im vorhandenen Spring-Boot-Prozess.
Ein zusätzliches Gateway oder Microservice ist erst sinnvoll, wenn unabhängige
Skalierung, Deployment oder Mandantentrennung dies erfordern.

## Verantwortlichkeiten

### SkillPilot-Web/PWA

- besitzt die natürliche Chat-Oberfläche ohne sichtbare technische IDs;
- rendert Text, Mathematik, Bilder, Fortschritt und echte Auswahlkomponenten;
- verwendet für Retries desselben Turns dieselbe stabile `turnId`;
- stellt nur fachliche Rückfragen dar, nicht interne State-Machine-Schritte.

Der bestehende unverdrahtete `ChatLayout` ist höchstens ein visueller Ausgangspunkt
und kein fertiger Coach. Die neue Variante soll getrennt unter
`app/src/coachVariants/firstParty/` entstehen.

### CoachTurnOrchestrator

- lädt vor jedem Turn den aktuellen SkillPilot-Zustand;
- stellt dem Modell nur die sichere Projektion und die aktuell erlaubten
  Operationen bereit;
- führt Tool-Aufrufe serverseitig aus, lädt danach den Zustand erneut und setzt den
  Loop bis zur fachlichen Antwort oder einer echten Mehrdeutigkeit fort;
- begrenzt Tool-Schritte und Retries;
- serialisiert Turns je Conversation und dedupliziert sie serverseitig über
  mindestens `(conversationId, turnId)` plus Request-Hash;
- weist dieselbe `turnId` mit abweichendem Inhalt zurück und lädt vor jeder
  Mutation frischen State;
- hält Gesprächskontext und dauerhaften Lernzustand getrennt.

Ein Provider-Response oder eine Provider-Conversation-ID darf als
Fortsetzungsoptimierung dienen, aber nie als Quelle für Curriculum, Scope, aktives
Ziel, Mastery, Recall-Status oder Prüfungsfreigaben. Die OpenAI Responses API kann
Kontext über Conversations oder `previous_response_id` fortsetzen; SkillPilot
rehydriert den fachlichen Zustand trotzdem vor jedem Turn aus dem eigenen Backend.

Die `SafeCoachRuntime` ist eine Grenze *by construction*: Sie gibt ausschließlich
freigegebene Coach-DTOs zurück und wendet `CoachStateProjection` zwingend auf
Zustand, Ressourcen und Mutationsergebnisse an. Der Orchestrator darf nicht direkt
auf rohe `UnifiedLearnerStateResponse`-Objekte oder interne Service-DTOs zugreifen.

### CoachIntentResolver

Das Modell extrahiert aus natürlicher Sprache nur nutzernahe Facetten, zum Beispiel:

```text
Fach: Mathematik
Schulstufe: Sekundarstufe II
Bundesland: Hessen
Kursprofil: noch offen
```

Eine autoritative, lokalisierte Facetten- und Aliasliste normalisiert beispielsweise
`Mathe -> Mathematik`, `Oberstufe -> Sekundarstufe II` und
`Hessen -> DE-HE`. Das Modell liefert nur typisierte nutzernahe Facetten; interne
IDs und erlaubte Werte stammen ausschließlich aus dem SkillPilot-Katalog.

Der Resolver ordnet diese Facetten deterministisch den aktuellen Curriculum-
Angeboten, Filtern, Placements und Composition Views zu. Weil zu Beginn noch keine
interne `landscapeId` bekannt sein muss, ermittelt zuerst ein providerneutraler
Use-Case wie `findLandscapeCandidates(subject, locale, schoolForm, ...)` die
passenden Landschaften. Erst danach wird deren Scope aufgelöst. Eine kombinierte
Setup-Absicht wird zunächst als Plan validiert und erst dann über die zulässigen
Anwendungsoperationen angewendet. Bleibt genau eine Dimension mehrdeutig, fragt
der Coach nur danach.

Der Akzeptanzfall lautet:

> Ich möchte Mathe in der Oberstufe in Hessen lernen.

Er soll Fach, Stufe und Bundesland ohne Formular-Dialog auflösen. Nur eine wirklich
fehlende Angabe wie Jahrgang oder GK/LK darf eine kurze Rückfrage erzeugen.

Die Auflösung beginnt nicht bei null. `CompositionViewService.findMatchingView`
verarbeitet bereits vollständige Scopes. Der Repository-Modus verwendet dabei
Ranking und Fallbacks, während der Package-Modus einen exakten Offering-Scope
verlangt. Für natürliche Sprache fehlt jedoch eine providerneutrale Abfrage mit
**partiellem** Scope. Diese Lücke soll einmalig an der gemeinsamen
Anwendungsgrenze geschlossen werden, nicht im ChatGPT-Adapter:

- ein typisierter Kandidaten-Use-Case wie
  `findScopeCandidates(landscapeId, partialScope)` enumeriert Repository-Views oder
  Package-Offerings, normalisiert beide Modi auf denselben Vertrag, filtert alle
  bereits genannten Dimensionen und liefert deterministisch deduplizierte
  fachliche Scope-Metadaten; Fallback- und Ranking-Regeln müssen für beide Modi
  explizit festgelegt und durch identische Vertragstests abgesichert sein;
- ein transaktionaler Use-Case wie
  `configureCompositionScope(skillpilotId, candidateRef)` nimmt keine frei vom
  Modell erzeugte Scope-Map an. `candidateRef` bindet eine zuvor ermittelte
  `offeringId` oder `viewId` an die aktuelle Kataloggeneration, zum Beispiel über
  `generationSha256`. Der Use-Case validiert die Referenz unmittelbar vor dem
  Schreiben erneut, schreibt die bestehende Personalisierung, ersetzt den
  geplanten Scope durch das kanonische Root-Ziel des gewählten Fachs, entfernt ein
  nicht mehr passendes aktives Ziel und erhält vorhandene Mastery;
- die heute in `LearnerService`, `CurriculaService` und teilweise im Frontend
  verteilte Kodierung zwischen Personal-Konfiguration und Composition Scope wird
  dafür in eine gemeinsame Komponente gezogen.

Die Mutation darf nicht mehrere Filter blind an das heutige generische
`setPersonalCurriculum` übergeben. Jurisdiction am kanonischen Root, Kursprofil am
Fachknoten und Sek-I-/Sek-II-Auswahl haben unterschiedliche Semantik. Der neue
Use-Case schreibt sie über den gemeinsamen Scope-Codec gezielt. Die derzeit private
Root-Auflösung aus `LandscapeService` wird dafür als zentraler typisierter Vertrag
herausgezogen; ein fehlendes oder mehrdeutiges `root`-Tag ist ein Fehler und darf
nicht still auf das erste Goal zurückfallen. Die gesamte Konfiguration läuft in
einer Datenbanktransaktion mit Learner-Row-Lock, vollständigem Rollback und genau
einem Post-Commit-State-Event. Sonst kann ein Kursfilter überschrieben werden oder
die Frontier wieder auf den Top-Level-Modulen stehen bleiben.

Für Mathematik, Gymnasium, Hessen und Sekundarstufe II soll die partielle Abfrage
im aktuellen Angebot genau GK und LK als verbleibende Kandidaten liefern. Der
Coach fragt dann nur „Grundkurs oder Leistungskurs?“ und wendet anschließend eine
vollständige, validierte Konfiguration an.

### CoachModelPort und Provider-Adapter

Der gemeinsame Port beschreibt Modellfähigkeiten, nicht externe SkillPilot-
Actions. Provider-Adapter übersetzen Prompt, Nachrichten, Bilder, strukturierte
Intent-Ausgaben, Tool-Aufrufe und Streaming jeweils passgenau. Es gibt ausdrücklich
kein universelles externes „one size fits all“-Schema.

DE und EN behalten getrennte Promptpakete und Akzeptanzfälle. Gemeinsame
didaktische Regeln werden fachlich synchron gehalten, aber nicht durch ein
providerfremdes Schema erzwungen.

## Turn-Ablauf

1. Browser sendet User-Text, optionale Anhänge, Sprache, Conversation-ID und
   stabile `turnId`.
2. Backend authentifiziert den Lernenden und lädt den aktuellen Zustand.
3. Der Orchestrator baut einen begrenzten, sicheren Modellkontext.
4. Das Modell antwortet fachlich oder liefert eine strukturierte Absicht bzw. einen
   erlaubten Tool-Wunsch.
5. SkillPilot validiert diesen Wunsch gegen den frischen State, führt ihn aus und
   lädt den neuen State.
6. Solange die aktuelle User-Absicht eindeutig weiterführt, wiederholt der
   Orchestrator Schritte 3 bis 5 im selben Serverturn.
7. Die UI erhält Streaming-Text und bei Bedarf eine fachliche Auswahlkomponente.

Damit ist Action-to-Action-Weitergabe eine interne Serveroperation. Sie hängt weder
von sichtbaren Auswahlcodes noch von der Erinnerung eines Provider-Chats ab.

## Gesprächszustand und Datenschutz

Dauerhafter Lernzustand und Gesprächsverlauf sind verschiedene Datenklassen:

- Der Lernzustand bleibt in den heutigen SkillPilot-Domainmodellen.
- SkillPilot hält einen kanonischen Conversation- und Turn-Verlauf mit definierter
  Aufbewahrung. Nur so bleiben UI-Verlauf und Providerwechsel konsistent.
- Ein `CoachContextCompiler` erzeugt für jeden Modellaufruf einen begrenzten
  Kontext aus den letzten Turns, einer versionierten strukturierten pädagogischen
  Summary und dem stets frisch geladenen Backend-Zustand.
- Tokenbudgets und die Regeln für Verdichtung, Summary-Neubildung und Rehydration
  sind Teil dieses Vertrags. Eine Summary darf niemals Mastery, Recall-Nachweise,
  Prüfungsabgaben oder Prüfungsfreigaben autorisieren.
- Provider-Kontext-IDs sind optionale Adapterdaten. Sie sind nicht rekonstruierbar,
  können aber verworfen und durch einen neuen Provider-Kontext ersetzt werden,
  der aus dem kanonischen Verlauf und der aktuellen Summary aufgebaut wird.
- Anhänge erhalten eigene Aufbewahrungs- und Löschregeln.
- API-Schlüssel liegen ausschließlich serverseitig.

Jede Conversation ist serverseitig an die authentifizierte SkillPilot-Sitzung und
den berechtigten Lernenden gebunden. Die dauerhafte SkillPilot-ID erscheint weder
als Modellargument noch dient ein vom Browser übertragener Bezeichner allein als
Identitätsnachweis. Conversation-IDs sind nicht erratbar und werden bei jedem Turn
gegen die aktuelle Autorisierung geprüft.

Vor einem öffentlichen Rollout müssen Datenschutzerklärung, Einwilligung,
Aufbewahrungsfristen, Export/Löschung und die Verarbeitung von Daten Minderjähriger
neu bewertet werden. Anders als beim heutigen Custom-GPT-Flow verarbeitet das
SkillPilot-Backend dann Chattexte und gegebenenfalls Bilder.

## Prüfungen und Recall

Die vorhandenen sicheren Fach-Use-Cases bleiben maßgeblich. Für eine stärkere
Prüfungsgrenze soll der eigene Coach später den bereits skizzierten Attempt-Flow
verwenden:

```text
startExam -> attemptId
submitExamAnswer(attemptId, answer) -> submissionReceipt
getExamEvaluation(attemptId, submissionReceipt)
```

Damit kann das Backend die tatsächliche Abgabe prüfen, bevor es Lösung und Raster
freigibt. Verified Recall wird entsprechend als serverseitig geführter Batch mit
stabilen Turn- und Kartenbelegen ausgeführt.

## Zweite Architekturoption: Provider-App mit SkillPilot-Widget

Eine ChatGPT App kann OAuth, strukturierte Tool-Ergebnisse und eingebettete
SkillPilot-Komponenten verwenden. Auswahl, Fortschritt, Recall und Prüfungsabgabe
können dann in einem Widget liegen, während technische IDs unsichtbar bleiben.
Der heutige Claude-Pfad ist dagegen ein MCP-/OAuth-Toolkanal; eine vergleichbare
eingebettete Widget-Oberfläche wird dafür nicht vorausgesetzt.

Diese Option eignet sich als zusätzlicher Distributionskanal, nicht als alleiniger
Kern. Außerhalb des Widgets entscheidet weiterhin der Provider-Host, ob ein freier
User-Turn SkillPilot erreicht. Die offizielle OpenAI Apps-SDK-Architektur bestätigt
MCP-Tools, strukturierte Ergebnisse und eingebettete Komponenten, ersetzt aber
keinen SkillPilot-kontrollierten Turn-Eingang.

## Vergleich

| Kriterium | Visible Session | SkillPilot-eigener Coach | Provider-App/Widget |
| --- | --- | --- | --- |
| natürliche Benutzerführung | eingeschränkt | vollständig kontrollierbar | im Widget gut |
| technische IDs im Chat | teilweise sichtbar | unsichtbar | unsichtbar möglich |
| jeder User-Turn erreicht SkillPilot | nein | ja | nur im eigenen Widget garantiert |
| Providerwechsel | hoher Konfigurationsaufwand | Adapterwechsel | je Host eigener Adapter |
| API- und Betriebskosten bei SkillPilot | gering | höher | abhängig vom Kanal |
| Datenschutzänderung | Chat bleibt beim Host | SkillPilot verarbeitet Chat | SkillPilot verarbeitet Widgetdaten |
| Rolle | Übergang/Fallback | strategischer Kern | zusätzlicher Kanal |

Beim SkillPilot-eigenen Coach trägt SkillPilot die separaten Modell-API-Kosten;
vorhandene ChatGPT- oder Claude-Abonnements der Lernenden decken diese nicht. Vor
einem Rollout brauchen wir deshalb ein Zahler-Modell, Nutzerquoten, harte
Ausgabenlimits, Rate Limits und ein definiertes Verhalten bei Provider-Ausfällen.

## Migrationspfad

1. Die Visible Session bleibt separat und rollbackfähig; der aktuelle Same-Turn-
   Fix reduziert nur die akute Reibung.
2. Zuerst die gemeinsamen Katalog- und Scope-Use-Cases implementieren:
   Landschaftskandidaten, partielle Scope-Kandidaten und transaktionale Anwendung
   einer kataloggebundenen Kandidatenreferenz.
3. Einen vertikalen First-Party-Prototyp hinter einem Feature-Flag bauen: Textchat,
   DE/EN, natürliche Setup-Absicht, genau ein aktives Ziel und Streaming.
4. `CoachIntentResolver` gegen echte Curriculum-Angebote und Composition Views in
   Repository- und Package-Modus testen, insbesondere mit
   „Mathe – Oberstufe – Hessen“.
5. Unterricht, Mastery, Ressourcen und Bild-Uploads ergänzen.
6. Verified Recall und Exam mit serverseitigen Belegen ergänzen.
7. Einen zweiten Modellanbieter anbinden und identische fachliche E2E-Fälle
   ausführen.
8. Erst nach vollständiger Workflow-Parität, Datenschutzfreigabe und realen
   Browser-E2E-Tests den SkillPilot-eigenen Coach zum Standard machen.
9. ChatGPT App und Claude MCP anschließend auf denselben Kern setzen; die bisherigen
   provider-spezifischen Schnittstellen bleiben passgenau.

## Freigabekriterien für den neuen Standard

- Der natürliche Akzeptanzsatz erreicht in höchstens einer fachlich notwendigen
  Rückfrage den richtigen Hessen-/Mathematik-/Sek-II-Kontext.
- Weder Sitzungstoken noch interne Curriculum-, Filter-, Scope- oder Goal-Keys
  erscheinen in der Unterhaltung.
- Reload, Retry und doppeltes Senden verändern Mastery oder Setup nicht doppelt.
- Nach Providerwechsel bleiben fachlicher Zustand und sichtbarer Gesprächsverlauf
  konsistent.
- Authentifizierung und Autorisierung binden jede Conversation serverseitig an den
  richtigen Lernenden; interne Identitäten gelangen nicht in den Modellkontext.
- Summary-Kompaktierung ändert keine fachliche Autorisierung und ist mit langen
  realen Lerndialogen getestet.
- Unterricht, Mastery, Ressourcen, Bilder, Recall, Prüfungen, Fortschritt und
  Abschluss sind in DE und EN E2E geprüft.
- Prüfungsdaten werden erst nach nachweisbarer Abgabe freigegeben.
- Zahler-Modell, Quoten, Ausgabenlimits, Rate Limits und Provider-Ausfälle sind
  produktionsreif geregelt.

## Referenzen

- [Provider-Neutral Learning-Coach Boundary](provider-neutral-coach-boundary.md)
- [Current ChatGPT Visible Session Flow](chatgpt-visible-session-flow.md)
- [OpenAI: Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)
- [OpenAI Apps SDK: MCP](https://developers.openai.com/apps-sdk/concepts/mcp-server)
- [ChatGPT-App-Zielbild](<../../../ai/openai app/concept.md>)
