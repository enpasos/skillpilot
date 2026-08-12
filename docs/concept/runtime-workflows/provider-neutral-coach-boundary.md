# Kommunikationsvertrag zwischen ChatClient und SkillPilot-Backend

**Status:** kanonische, provider-neutrale Kommunikationsnorm für alle
SkillPilot-Lerncoaches.

**Geltungsbereich:** OpenAI MCP App V1, künftige Provideradapter und alle
neuen Coach-Werkzeuge. Sicherheits-, Session-, Didaktik- und
Deploymentdokumente konkretisieren diese Grenze, dürfen sie aber nicht
abweichend neu definieren.

## Ein Satz, der die Grenze festlegt

> Der ChatClient versteht und formuliert; das Backend weiß, entscheidet,
> validiert, speichert und liefert den nächsten technischen Schritt.

Das ist keine Aussage über die allgemeine Leistungsfähigkeit beider Seiten,
sondern eine bewusste Arbeitsteilung:

- Ein Sprachmodell ist stark beim Verstehen freier Sprache, beim Erkennen
  fachlicher Muster, beim dialogischen Erklären und beim semantischen
  Vergleichen unterschiedlicher Lösungswege.
- Das Backend ist stark bei Identität, aktuellem Zustand, exakten Mengen und
  Reihenfolgen, Berechtigungen, Transaktionen, Nebenläufigkeit, Persistenz und
  reproduzierbaren Entscheidungen.

Eine technische Entscheidung wird deshalb nie dem Modell überlassen, wenn das
Backend sie selbst ableiten, prüfen oder atomar ausführen kann. Umgekehrt wird
das Backend nicht zu einem Ersatz-Sprachmodell ausgebaut: Es interpretiert
keine offenen Lernendenäußerungen und bewertet keine fachlich gleichwertigen
Formulierungen durch Wortlautvergleich.

## Verantwortungsmatrix

| Beteiligter | Besitzt | Besitzt ausdrücklich nicht |
| --- | --- | --- |
| Lernende Person | Lernabsicht, Antworten, freie Formulierungen und ausdrückliche Zustimmung | technische IDs, Zustandsversionen, Retry-Schlüssel oder Toolreihenfolgen |
| ChatClient / Provider-Modell | Sprachverstehen, eindeutige Intent-Zuordnung zu frisch gelieferten Optionen, didaktischen Dialog, fachlich-semantischen Vergleich und lernendengerechte Formulierung | autoritativen Lernzustand, technische Auswahlmengen, Workflowfortschritt, Persistenzerfolg oder Berechtigung |
| Provideradapter / MCP-Vertrag | kleine use-case-orientierte Werkzeugoberfläche, sichere Projektion, kurze Beschreibungen, lokalisierte Ergebnisdarstellung und Transportbindung | eigene Fachdatenbank, rohe Domain-DTOs oder promptbasierte Sicherheitsgarantien |
| SkillPilot-Backend | Identität, Session, Curriculum, Personalisierung, Fokus, aktives Ziel, Frontier, Mastery, Recall, Prüfungsfreigabe, technische IDs und Capabilities, Mengen, Reihenfolge, Vollständigkeit, State, Concurrency, Idempotenz, Persistenz und Fortsetzung | freie Sprachinterpretation oder die semantische Beurteilung sichtbarer Lernendenarbeit |
| App-Widget | direkte deterministische Interaktion innerhalb seines eng begrenzten UI-Workflows | Ersatz für den autoritativen Backendzustand oder allgemeine Chat-Orchestrierung |

Die Interaktionssprache ist ebenfalls Backendzustand. Der ChatClient verwendet
die `communicationLocale` des jüngsten autoritativen Vollergebnisses für jede
sichtbare Antwort und leitet sie nicht aus Toolnamen, Hostlocale oder
Curriculumsprache ab.

## Der minimale Turn-Vertrag

Ein normaler Lernenden-Turn hat genau diese Form:

```text
neue Lernendennachricht
        |
        v
genau ein frischer Vollzustand
        |
        v
Entscheidung auf diesem Vollzustand
        |
        +-- sprechen / fragen / gebundene UI-Aktion --> sichtbare Antwort
        |
        +-- höchstens eine eindeutige Mutation aus diesem Vollzustand
                  |
                  v
          autoritativer Nachfolgerzustand
                  |
                  +-- fortbestehende eindeutige Absicht
                  |   erneut auf den neuen Zustand anwenden
                  |
                  +-- sprechen / gebundene UI-Aktion --> sichtbare Antwort
```

Regeln:

1. Nach einer neuen Lernendennachricht wird genau einmal frischer Kontext
   geladen. Polling innerhalb desselben Assistant-Turns ist verboten.
2. Der jüngste erfolgreiche Vollzustand ist die einzige Autorität für
   Sprache, Zustand, Optionen und erlaubte Aktionen.
3. Eine erfolgreiche Mutation liefert ihren vollständigen
   Nachfolgerzustand. Dieser ersetzt den vorherigen Kontext für den Rest des
   Turns; ein anschließender Context-Reload ist redundant. Er ist zugleich ein
   neuer Vollzustand: Eine fortbestehende eindeutige Absicht darf erneut auf
   genau eine dort erlaubte Mutation abgebildet werden.
4. Ein schmaler Renderer- oder Widget-Receipt ist kein Vollkontext.
5. Bei einem State-Konflikt darf genau einmal frisch geladen und die Absicht
   neu bewertet werden. Wiederholte Konflikte oder andere harte Fehler stoppen
   den strukturierten Ablauf.

## Werkzeuge bilden Nutzerhandlungen ab

Ein Werkzeug repräsentiert eine zusammenhängende Handlung mit einem für die
lernende Person erkennbaren Ergebnis. Es spiegelt keine interne Service-API und
keine Datenbankoperation eins zu eins.

Vor einem neuen oder geänderten Werkzeug werden diese Fragen in der
angegebenen Reihenfolge beantwortet:

1. Welches Ergebnis erwartet die lernende Person?
2. Welcher Anteil erfordert wirklich Sprachverstehen oder semantische
   Beurteilung?
3. Welche technischen Werte kann das Backend selbst ableiten?
4. Welche zusammengehörenden technischen Schritte kann das Backend in einer
   Transaktion oder einem Batch ausführen?
5. Welche eine Fortsetzung gilt nach Erfolg?

Folgerungen:

- Ableitbare technische Parameter erscheinen nicht im Modellinput.
- Wiederholte technische Item-Schleifen werden als eine Batchoperation
  angeboten.
- Unterschiedliche Berechtigungen, Risiken oder notwendige
  Nutzerbestätigungen bleiben getrennte Werkzeuge.
- Ein Read und ein Write bleiben unterscheidbar; Annotationen beschreiben das
  wirkliche Verhalten.
- Toolnamen und Beschreibungen sprechen über Nutzerabsicht, nicht über
  interne Implementierungsbegriffe.

Die offizielle OpenAI-Leitlinie fordert ebenfalls use-case-orientierte,
zusammenhängende Aktionen, explizite Eingaben und verbietet, für die
Korrektheit notwendige IDs oder Scopes vom Modell erraten zu lassen. Diese
Leitlinie ist Mindeststandard, nicht Ersatz für die strengere SkillPilot-
Grenze.

## Eingaben: semantisch klein, technisch abgeleitet

Ein Modellinput enthält nur Werte, die eine der folgenden Bedingungen
erfüllen:

- Die lernende Person hat den Wert semantisch geliefert, zum Beispiel eine
  Antwort oder ein Feedback.
- Das Modell hat eine fachlich-semantische Entscheidung getroffen, die das
  Backend nicht selbst treffen kann, zum Beispiel `passed` nach Vergleich der
  sichtbaren Antwort mit einer freigegebenen Sollantwort.
- Der Wert ist ein frisch vom Backend veröffentlichter Optionspayload oder
  eine opake Capability und wird unverändert kopiert.

Das Modell darf technische Werte nicht konstruieren, kürzen, sortieren,
zählen, zusammenführen oder aus älteren Ergebnissen wiederverwenden.

Insbesondere besitzt das Backend:

- Ziel- und Kartenidentitäten, sofern der aktuelle Workflow sie eindeutig
  bestimmt;
- Batchgröße, konkrete Menge und Reihenfolge;
- Vollständigkeits- und Duplikatprüfung;
- Zustandsversion und Retry-Identität, sofern sie aus einer Capability
  ableitbar sind;
- Fristen, Eligibility, Berechtigungen und erlaubte Zustandsübergänge.

Einige allgemeine V1-Schreibwerkzeuge erhalten weiterhin eine frisch
veröffentlichte Option, `expectedStateVersion` und `clientRequestId`. Das
Modell **wählt** diese Werte nicht: Es kopiert den Optionspayload und die
Version unverändert und erzeugt nur die dokumentierte neue Request-UUID. Bei
neuen mehrstufigen Workflows ist die bevorzugte Form eine serverseitig
abgeleitete Capability, damit auch diese technische Last entfällt.

## Ergebnisse: eine Faktenquelle, eine nächste Aktion

Ein Modellergebnis bleibt klein und hat klar getrennte Rollen:

- `structuredContent` enthält nur die Fakten, die das Modell für die
  sichtbare Antwort oder den nächsten erlaubten Aufruf benötigt.
- `content` enthält höchstens eine kurze, nutzbare Zusammenfassung und keine
  zweite Zustandsmaschine.
- `_meta` enthält ausschließlich widget-private Daten. Es ist kein
  Cross-Turn-Gedächtnis und keine Autorisierungsgrenze.

Jedes Ergebnis hat genau **einen logischen imperativen Kanal**:

- Ein normaler Vollkontext verwendet das zusammengehörige Paar aus
  `requiredAction` und lokalisierter `instruction`.
- Ein abgeschlossener Spezialworkflow verwendet eine einzelne
  `continuation`.
- Ein Ergebnis darf nicht gleichzeitig eine Spezial-`continuation` und einen
  zweiten handlungssteuernden Context-Text liefern.

Fakten dürfen redundant prüfbar sein; Handlungsanweisungen dürfen nicht
konkurrieren. Wenn die nächste technische Aktion deterministisch feststeht,
liefert das Backend sie. Der ChatClient fragt nicht noch einmal nach Kontext
und wartet nicht auf ein inhaltsleeres „ok“.

## Opake Capabilities statt technischer Bauanleitungen

Eine Capability kapselt die technische Workflowautorität, die das Modell nur
transportieren muss. Sie ist:

- nicht vom Modell zu interpretieren oder zu verändern;
- an Session, Workflowtyp und relevante kanonische Zustandsdaten gebunden;
- kurzlebig beziehungsweise durch State und Eligibility begrenzt;
- serverseitig auf Vollständigkeit, Wiederverwendung und Stale State
  geprüft;
- kein Ersatz für OAuth, Autorisierung oder Backendvalidierung.

Sensible technische Nutzdaten werden nicht nur base64-kodiert. Wenn ihre
Vertraulichkeit relevant ist, wird die Capability authentifiziert
verschlüsselt. Der ChatClient sieht nur den opaken Transportwert.

## Referenz: Verified Recall

Verified Recall zeigt die gewünschte Grenze besonders deutlich.

Alt und unzulässig:

```text
Batchgröße vom Modell wählen
-> je Karte Sollantwort laden
-> je Karte Ergebnis schreiben
-> State-Version fortschreiben
-> selbst zählen, ob alles gespeichert ist
-> selbst entscheiden, wie es weitergeht
```

Aktueller Vertrag:

```text
start_skillpilot_verified_recall(learningSessionId)
-> kompletter serverseitiger Batch + batchCapability

get_skillpilot_verified_recall_answers(
  learningSessionId,
  batchCapability
)
-> komplette geordnete Sollantworten + gradingCapability

record_skillpilot_verified_recall_results(
  learningSessionId,
  gradingCapability,
  assessments[{passed, feedback}]
)
-> ein atomarer Receipt + genau eine continuation
```

Das Modell zeigt alle Fragen, wartet auf die vollständige Antwort und
beurteilt jede Antwort nach Bedeutung. Das Backend garantiert Ziel, Anzahl,
Reihenfolge, Vollständigkeit, genau einen Write, Idempotenz, Mastery und die
Fortsetzung. Bei einem Folgebatch enthält das Ergebnis keinen konkurrierenden
Successor-Context; beim Ende des Recall-Batches enthält der factual Context
keine zweite imperative `instruction` oder `requiredAction`.

## Freie Auswahl und ausdrückliche Zustimmung

Das Backend darf keine menschliche Entscheidung vortäuschen. Wenn mehrere
fachlich sinnvolle Optionen bestehen oder eine folgenreiche Aenderung
ausdrückliche Zustimmung braucht, veröffentlicht es eine kleine aktuelle
Optionsmenge. Der ChatClient:

1. versteht die freie Formulierung der lernenden Person;
2. ordnet sie nur bei Eindeutigkeit einer frischen Option zu;
3. kopiert deren vollständigen Payload unverändert;
4. fragt nur bei echter Mehrdeutigkeit nach.

Das Backend revalidiert die Option beim Write. Eine frühere Option, eine
erfundene ID oder ein aus der Hierarchie abgeleiteter Payload ist ungültig.

## Fehlerkommunikation

Fehler sind ebenfalls Backendentscheidungen. Ein Fehlerresultat liefert:

- einen stabilen Code;
- keine teilweise fachliche Mutation;
- eine kurze lokalisierte Recovery-Anweisung, wenn eine sichere Recovery
  existiert;
- nur die für diese Recovery notwendige URL oder Option.

Der ChatClient erklärt keinen technischen Ersatzablauf, verspricht keinen
späteren Save und setzt Unterricht oder Bewertung nicht fort. Sessionfehler
enden ausschließlich mit der serverseitigen WebGUI-Startanweisung. Ein
fehlgeschlagenes UI-Rendering darf dagegen den bereits erfolgreichen
fachlichen Textpfad nicht blockieren.

## Datenschutz und sichtbare Technik

Nicht in modell- oder nutzersichtbare Ergebnisse gehören:

- permanente SkillPilot-ID, OAuth-Token, Client-Secret oder interne
  Autorisierungsreferenzen;
- rohe Domainobjekte, Datenbank- oder Dateipfade;
- nicht freigegebene Antworten, Lösungen oder Bewertungsdaten;
- technische Diagnostik und unnötige personenbezogene Daten.

Die automatisch transportierte `learningSessionId` ist eine explizite
Anwendungscapability für den aktuellen Chat. Sie wird vom ChatClient
unverändert an Fachwerkzeuge weitergegeben, aber niemals sichtbar erklärt,
rekonstruiert oder von der lernenden Person erfragt. OAuth authentisiert den
Providertransport; die Lernsession adressiert den Lernenden. Beides bleibt
getrennt.

## Anti-Patterns

Folgende Muster sind ein Architekturfehler, auch wenn ein starkes Modell sie in
einem Testlauf zufällig korrekt ausführt:

- technische Schleifen pro Karte, Ziel oder Rubrikpunkt;
- optionale Modellparameter für Werte, die das Backend bereits kennt;
- mehrere konkurrierende `instruction`-, `requiredAction`-, `next`- oder
  `continuation`-Kanäle für denselben Schritt;
- ein erneuter Context-Read nach einem bereits autoritativen
  Mutationsergebnis;
- Sicherheits- oder Vollständigkeitsregeln, die nur im Prompt stehen;
- rohe interne DTOs als bequemer Tooloutput;
- IDs, URLs oder Hierarchiepfade, die das Modell selbst zusammensetzt;
- sichtbare Behauptungen über Saves, Counts oder Abschluss ohne
  Backendreceipt;
- Backend-NLP, das freie Antworten durch exakten Wortlautvergleich bewertet.

## Verbindlicher Ort einer Regel

| Regelart | Einziger primärer Ort |
| --- | --- |
| Diese Verantwortungsgrenze und neue Tool-Designentscheidungen | dieses Dokument |
| Lernendensichtbares Coach-Verhalten und Golden Journeys | [Verhaltensintegration](openai-mcp-coach-behavioral-integration.md) |
| Produkt-, Provider- und Deploymenttopologie | [SkillPilot-eigene Coach-Architektur](skillpilot-owned-coach-architecture.md) |
| OAuth, Lernsession und Ablauf | [OpenAI OAuth-/Sessionarchitektur](openai-mcp-oauth-learner-session-architecture.md) |
| Wiederholbares Modellverhalten | ausgelieferte `SKILL.md` und `coaching-policy.md` |
| Werkzeugbedingung | genau eine Toolbeschreibung und ihr Schema |
| Aktuelle Entscheidung | genau ein frisches Toolergebnis |
| Fachliche oder Sicherheitsgarantie | Backendguard, Transaktion und Test |
| Betrieb und Release | Runbooks unter `docs/deploy/` |

Abgeschlossene Migrationspläne und frühere Knowledge-Paritätsmatrizen sind
keine aktuellen Normquellen. Ihre Geschichte bleibt in Git erhalten; aktive
Dokumente verlinken sie nicht als Vertragsautorität.

## Abnahmeregel für jede Schnittstellenänderung

Eine Aenderung ist erst fertig, wenn alle Antworten „ja“ lauten:

1. Bildet jedes Werkzeug genau eine zusammenhängende Nutzerhandlung ab?
2. Sind alle backendableitbaren technischen Werte aus dem Modellinput
   entfernt?
3. Muss das Modell keine technische Menge, Reihenfolge oder Schleife verwalten?
4. Liefert jeder Erfolg genau eine autoritative Fortsetzung?
5. Kann das Backend unvollständige, doppelte, stale und unerlaubte Aufrufe
   selbst ablehnen?
6. Ist ein exakter Retry von einer fachlich neuen Operation unterscheidbar?
7. Sind sichtbare Aussagen über Zustand und Counts durch einen Receipt
   belegt?
8. Bleiben freie Sprache und semantische Fachbeurteilung beim ChatClient?
9. Gibt es Contracttests für gültige, ungültige und adversariale Inputs?
10. Belegt ein realer Provider-Trace die beabsichtigte Toolanzahl und
    Fortsetzung ohne zusätzliche Polls?

## Referenzen

- [OpenAI: Define tools](https://developers.openai.com/plugins/plan/tools)
- [OpenAI: Build an MCP server](https://developers.openai.com/plugins/build/mcp-server)
- [OpenAI OAuth-/Sessionarchitektur](openai-mcp-oauth-learner-session-architecture.md)
- [OpenAI-Plugin-Versionierung und Lebenszyklus](openai-plugin-versioning-and-lifecycle.md)
- [OpenAI-MCP-Clientbindung](../../security/openai-mcp-client-binding.md)
