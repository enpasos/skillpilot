# Verhaltensintegration des deutschen MCP-Lerncoaches

**Stand:** 30. Juli 2026

**Status:** lebendes, normatives Leitdokument und übergreifende Produktaufgabe  

**Kurzname:** Coach-Verhaltensintegration

## 1. Auftrag

Die große Aufgabe ist nicht mehr, einzelne SkillPilot-Funktionen irgendwie über
MCP erreichbar zu machen. Sie lautet:

> Aus Backend, Skill-Graph, Lernzustand, MCP-Vertrag und Provider-Modell
> wieder einen zusammenhängenden, verlässlichen und für Lernende natürlichen
> Coach zu bilden.

Der frühere Custom-GPT-Coach ist dafür die beobachtete Verhaltensbaseline. Die
bewährten deutschen Inhalte unter
[`ai/openai custom gpt`](<../../../ai/openai custom gpt/>) sind der
Migrationskorpus für den künftigen Coach-Skill. Seine technische Architektur,
alte Action-Methoden und insbesondere das sichtbare Relay-Protokoll werden
nicht zurückgebaut. Wiederhergestellt werden sollen die Qualitäten, die aus
Sicht der lernenden Person entscheidend waren:

- ein natürlicher Einstieg statt technischer Bedienung;
- korrektes Verstehen mehrteiliger Wünsche;
- ein passender Lernumfang und Fokus;
- wenige, aber richtige Rückfragen;
- fachlich konsistentes Coaching über viele Dialogzüge;
- faire Bewertung, Verified Recall und strenger Prüfungsmodus;
- robuste Wiederaufnahme nach Reload, langem Dialog oder Kontextverlust.

Die aktuelle MCP-Lösung ist technisch weit fortgeschritten, aber noch nicht
verhaltensgleich rund. Eine erfolgreiche OAuth-Verbindung, ein gültiger
MCP-Vertrag, vorhandene Tools oder eine technisch vollständige Zuordnung der
früheren Knowledge-Regeln beweisen noch keine Endnutzerparität.

Dieses Dokument hält den Nordstern, die allgemeinen Verhaltensregeln, die
offenen Integrationsfelder und die Abnahmeform fest. Einzelne Testergebnisse
werden daran eingeordnet. Einzelfehler sollen zu allgemeinen Verbesserungen
führen, nicht zu curricularen Sonderregeln.

## 2. Geltungsbereich und Verhältnis zu anderen Dokumenten

Dieses Dokument ist die führende Quelle für das **zusammenhängende sichtbare
Verhalten** des deutschen MCP-Lerncoaches und für dessen End-to-End-Abnahme.

Die folgenden Dokumente bleiben für ihre engeren Themen maßgeblich:

- [Wissens- und Verhaltensparität](openai-mcp-coach-knowledge-parity.md):
  technische Zuordnung der früheren Instructions und Knowledge-Regeln zu
  Laufzeitorten;
- [MCP-Migrationsplan](openai-mcp-coach-migration-plan.md):
  technische Etappen, Rollout, Betrieb und Rückfall;
- [OAuth-Appbindung und 24h-Lernsession](openai-mcp-oauth-learner-session-architecture.md):
  Trennung von App-Authentisierung und Lernsession;
- [Provider-neutrale Coach-Grenze](provider-neutral-coach-boundary.md):
  gemeinsame Anwendungsgrenze für Provideradapter;
- [SkillPilot-eigene Coach-Architektur](skillpilot-owned-coach-architecture.md):
  langfristiges Produkt- und Verantwortungsmodell;
- [OpenAI-MCP-Clientbindung](../../security/openai-mcp-client-binding.md):
  Sicherheitsmodell;
- [Deployment-Runbook](../../deploy/openai-mcp-coach-de.md):
  produktiver Betrieb und technische Smoke-Tests.

Dabei gilt:

> „Knowledge-Parität“ bedeutet zunächst, dass jede frühere Regel einem
> wirksamen technischen Ort zugeordnet ist. „Verhaltensparität“ ist erst
> erreicht, wenn die vollständigen Nutzerreisen mit realem Modellverhalten
> reproduzierbar funktionieren.

## 3. Erfolgsbild aus Sicht der lernenden Person

Eine lernende Person soll nicht wissen müssen, wie OAuth, MCP, Toolargumente,
Kontextprojektion oder Lernsessionen funktionieren. Sie soll:

1. in SkillPilot auf **Lernen starten** klicken;
2. in einem neuen Chat mit bereits eingetragener Startnachricht landen;
3. ihren Lernwunsch natürlich formulieren können;
4. kurz erfahren, welcher Kontext bereits feststeht;
5. nur nach den tatsächlich noch offenen Angaben gefragt werden;
6. anschließend am richtigen Ziel im richtigen Modus lernen;
7. nach Unterbrechungen verlässlich dort fortsetzen können.

Ein Einstieg wie „Hessen, Mathe LK“ darf daher nicht zu einer starren
Dialogkette „Bundesland → Fach → Stufe → Kurs → Jahr“ führen. Der Coach muss
alle eindeutigen Angaben als fortgeltende Absicht verstehen, die dazu passenden
aktuellen Backendoptionen nacheinander anwenden und nur die nicht ableitbaren
Restentscheidungen erfragen. `LK` beziehungsweise `GK` ist dabei immer das
Profil eines konkreten Fachkurses: Eine lernende Person kann beispielsweise
gleichzeitig Mathematik LK und Physik GK belegen. Das Kursprofil bestimmt weder
allein die Lernstufe noch das Dauer- oder Jahrgangsmodell. Wenn Lernstufe,
G8/G9, Jahrgang oder Phase fachlich offen bleiben, sind genau diese Rückfragen
richtig.

Die lernende Person sieht dabei eine kurze fachliche Orientierung, zum Beispiel:

> Du lernst im Curriculum Gymnasium (DE). Hessen und Mathematik LK sind bereits
> gewählt. Möchtest du nur in der Sekundarstufe II lernen oder auch Stoff aus
> der Sekundarstufe I einbeziehen? Gilt für dich G8 oder G9?

Die Formulierung darf variieren. Kontext, offene Entscheidung und fachliche
Bedeutung müssen korrekt sein.

## 4. Nicht verhandelbare Invarianten

Diese Regeln dürfen durch die Coach-Migration nicht verändert werden:

### 4.1 Backend und Skill-Graph

- Der jüngste erfolgreich geladene Backendzustand ist die einzige Autorität.
- Der Coach erfindet keine Curricula, Ziele, Optionen, Zustände,
  Fortschrittswerte oder erfolgreichen Mutationen.
- Lernziele besitzen global eindeutige IDs. Mastery gehört zum Lernziel und
  bleibt gleich, auch wenn dasselbe Ziel in mehreren Curricula oder Ansichten
  wiederverwendet wird.
- `requires` bestimmt didaktische Voraussetzungen, `contains` die
  Komposition. Ein Motivationsziel ist nur dann Voraussetzung anderer Ziele,
  wenn der Skill-Graph dies tatsächlich ausdrückt.
- Frontier und Empfehlungen werden erst nach korrekt festgelegtem Lernumfang
  und Fokus bestimmt.

### 4.2 Appbindung und Lernsession

- OAuth authentisiert die fest konfigurierte App gegenüber SkillPilot.
- Jeder Klick auf **Lernen starten** erzeugt in genau diesem Augenblick eine
  neue, absolut 24 Stunden gültige Lernsession für die in der SkillPilot-UI
  gewählte SkillPilot-ID. Auch dieselbe SkillPilot-ID erhält bei einem neuen
  Start eine neue Lernsession.
- Die Lernsession ist von OAuth getrennt. OAuth allein wählt keinen Lernenden
  und erzeugt keine Lernsession.
- SkillPilot trägt die Lernsession automatisch in die Startnachricht ein. Das
  Modell übernimmt sie unverändert in jeden fachlichen MCP-Aufruf. Die lernende
  Person muss sie weder kopieren noch verstehen.
- Eine Lernsession aus einer älteren Startnachricht darf nicht für einen neuen
  Start verwendet werden.

### 4.3 Nutzerkommunikation

- Keine Tool-, API-, JSON- oder Feldnamen in normalen Antworten.
- Keine permanenten SkillPilot-IDs, OAuth-Tokens oder Client-Secrets im Chat.
- Keine technische Bedienhandlung, wenn SkillPilot sie automatisieren kann.
- Keine Erfolgsaussage vor einem bestätigten Backendresultat.
- Im Prüfungsmodus gibt es keine Hinweise und keine Rückfragen.

## 5. Das allgemeine Coach-Verhaltensmodell

Der Coach benötigt kein wachsendes Bündel aus Spezialfällen, sondern einen
allgemeinen, zustandsgebundenen Entscheidungszyklus.

### 5.1 Der Zyklus

Bei Einstieg, Wiederaufnahme, Unsicherheit, möglicher Kompaktierung oder nach
einer Mutation gilt:

1. **Lernsession übernehmen**  
   Die Lernsession kommt ausschließlich aus der aktuellen SkillPilot-
   Startnachricht.
2. **Frischen Zustand laden**  
   Curriculum, Personalisierung, Lernumfang, Fokus, aktives Ziel, Frontier,
   Modus und Fortschritt werden nicht aus Gesprächserinnerung rekonstruiert.
3. **Bestätigten Kontext bilden**  
   Der Coach unterscheidet klar zwischen bereits bestätigtem Zustand,
   aktuellen Backendoptionen und bloßer Nutzerabsicht.
4. **Gesamte Nutzerabsicht auswerten**  
   Mehrere Angaben gelten unabhängig von Reihenfolge und Wortlaut als
   fortgeltende Absicht.
5. **Eindeutige nächste Option semantisch zuordnen**  
   Nur eine Option des jüngsten Zustands darf mutiert werden. Die Zuordnung
   erfolgt nach Bedeutung, nicht nach zufälliger Position oder Wortgleichheit.
6. **Genau eine erlaubte Mutation ausführen**  
   Keine spätere Auswahl wird vorweggenommen und keine ID konstruiert.
7. **Unmittelbar frisch laden**  
   Nach jeder Mutation ist ausschließlich der neue Backendzustand gültig.
8. **Absicht erneut auf den neuen Zustand anwenden**  
   Solange genau ein nächster Schritt eindeutig ist, wird der Zyklus ohne
   unnötige Zwischenfrage fortgesetzt.
9. **Nur echte Restmehrdeutigkeit erfragen**  
   Alle offenen, zusammengehörigen Angaben werden möglichst gemeinsam und mit
   dem bereits bestätigten Kontext erfragt.
10. **Erst danach fachlich arbeiten**  
    Frontier, Zielwahl, Coaching, Recall oder Prüfung beginnen erst mit
    korrekt bestätigtem Lernumfang und Fokus.

### 5.2 Scope und Fokus

Der Coach muss folgende Begriffe auseinanderhalten:

- **Einstiegskontext:** bereits gewähltes Curriculum beziehungsweise
  Schulform-/Programmpaket;
- **Personalisierung:** zum Beispiel Bundesland oder andere
  Gültigkeitsdimensionen;
- **Lernumfang:** die für die lernende Person relevante Teilmenge des
  Curriculums;
- **Fokus:** der aktuell ausgewählte Unterbaum beziehungsweise Lernkorridor,
  aus dem Frontier und Zieloptionen stammen;
- **aktives Ziel:** genau ein vom Backend bestätigtes atomisches Lernziel.

„Mathematik LK“ legt genau das Fach Mathematik und für diesen Fachkurs das
Kursprofil LK fest. Es legt nicht automatisch fest, ob der Lernumfang nur
Sekundarstufe II oder auch Sekundarstufe I umfassen soll; ebenso wenig bestimmt
es G8/G9, Jahrgang oder Phase. Kursprofile werden pro Fach gespeichert, sodass
zum Beispiel Mathematik LK und Physik GK gleichzeitig bestehen können. Der
Coach muss echte Mehrdeutigkeiten erfragen. Er darf den Fokus aber nicht auf
der gesamten Mathematik belassen und anschließend Ziele aus einem nicht
bestätigten Lernumfang anbieten.

Die fachliche Semantik muss aus den vom Backend veröffentlichten
Programmeinheiten, Optionen, Placements, Kompositionsansichten und
Kompetenzbeziehungen stammen. Sprachliche Schlussfolgerungen des Modells sind
Vorschläge zur Auswahl einer veröffentlichten Option, niemals eine eigene
Curriculumsmutation.

### 5.3 Begrenzte Fehlerbehandlung

- Bei einem Konflikt wird der Zustand genau einmal frisch geladen und die
  aktuelle Absicht erneut geprüft.
- Bei abgelaufener oder fehlender Lernsession wird zurück zu **Lernen starten**
  geführt; eine neue OAuth-Verbindung oder die Eingabe einer SkillPilot-ID ist
  nicht erforderlich.
- Bei Authentifizierungs-, Schema-, Speicher- oder wiederholtem Konfliktfehler
  stoppt der strukturierte Ablauf transparent.
- Der Coach darf nach einem Fehler keinen Erfolg vermuten, keinen Zustand
  weiterschreiben und keinen allgemeinen Lernpfad als Ersatz erfinden.

## 6. Wie die früheren Instructions und Knowledge-Regeln heute und künftig wirken

Eine MCP-App besitzt keine Custom-GPT-Knowledge-Fläche, aus der das Modell
automatisch alle früheren Dokumente als dauerhaftes Hintergrundwissen erhält.
Das kombinierte Ziel-Plugin bündelt deshalb einen Coach-Skill mit der
registrierten MCP-App. Das gewünschte Verhalten wird bewusst auf mehrere
Durchsetzungsschichten verteilt:

| Zielschicht | Aufgabe |
| --- | --- |
| dieses Leitdokument und der bewährte Custom-GPT-Korpus | menschenlesbare Produktnorm und fachlich-didaktische Migrationsquelle |
| Plugin-Skill | Coachrolle, Didaktik, Dialogzyklus, Toolreihenfolge, Ausgabe- und Stopregeln |
| kurze MCP-Server-Instruktionen | nur wenige über alle Werkzeuge geltende Invarianten |
| einfache Toolnamen, Beschreibungen und Eingabeschemas | dem Modell verständlich machen, wann und wie genau dieses Werkzeug verwendet wird |
| frische `policies` und `instruction` im projizierten Zustand | nur im aktuellen Zustand relevante Regeln und nächster Schritt |
| Backendzustandsmaschine und Guards | fachlich und sicherheitlich harte Invarianten |
| Activation-Evaluation, Acceptance-Szenarien und Tool-Traces | getrennt nachweisen, dass der Skill richtig aktiviert wird und das Gesamtsystem richtig handelt |

OpenAI beschreibt für Remote-MCP-Werkzeuge, dass Tooldefinitionen dem Modell
bereitgestellt werden und das Modell abhängig vom Kontext über Aufrufe
entscheidet; Ein- und Ausgaben der Aufrufe werden wiederum Teil des
Modellkontexts. Deshalb sind knappe, eindeutige Toolbeschreibungen,
LLM-gerechte Schemas und frische zustandsbezogene Ergebnisse Teil des
Produktverhaltens und keine bloße technische Dokumentation. Sie ersetzen
jedoch keine Backendguards.

Im aktuellen Übergangszustand liegen die Regeln technisch verteilt in:

- dem noch nicht produktiv aktivierten Quellskill unter
  `ai/openai plugin/skillpilot-coach-de/skills/skillpilot-coach-de`;
- `OpenAiDeCoachMcpContract.SERVER_INSTRUCTIONS`;
- den Toolverträgen in `OpenAiDeCoachMcpContract`;
- den dynamischen Policies und Instruktionen in
  `OpenAiDeCoachContextProjector`;
- den Domainservices, der Zustandsprojektion und ihren Guards.

Die ausführlichen Server-Instruktionen bleiben während des Skill-Piloten als
Kompatibilitätsschicht bestehen. Erst nach nachgewiesener Golden-Journey- und
Fehlerfallparität werden Coachrolle, Stil und Dialogablauf daraus entfernt.
Session-, Zustands- und Fail-closed-Invarianten bleiben dort in kurzer Form;
konkrete Aufrufbedingungen verbleiben an den Tools.

Die deutschen Dateien `system_instructions.de.md` und `knowledge_docs/*.de.md`
unter `ai/openai custom gpt` bleiben fachlich-didaktische
Ausgangsspezifikation. Sie werden nicht zur Laufzeit hochgeladen oder
automatisch als MCP-Resource eingelesen. Verwendet werden insbesondere Rolle
und Stil, Scaffolding und Feynman-Loop, ungewöhnliche Lösungswege,
Mastery-Evidenz, Prüfungsführung und ehrliche Fehlerkommunikation.

Nicht migriert werden `startCode`, `chatSessionToken`, `redeemStartCode`, alte
Action-Operations, sichtbare Relaywerte oder modellseitig konstruierte Deep
Links. Ihr fachlicher Zweck wird auf die aktuelle OAuth-,
`learningSessionId`-, MCP- und backendgenerierte Linkgrenze abgebildet.

### 6.1 Ziel für die Regelpflege

Jede produktionsrelevante Coach-Regel benötigt künftig eine stabile
Policy-Referenz und eine geschlossene Nachweiskette:

```text
bewährte Quellstelle unter ai/openai custom gpt
  -> menschenlesbare COACH-Policy
  -> wirksame Laufzeitschicht
  -> mindestens ein Acceptance-Szenario
  -> erwartete und verbotene Toolaufrufe
  -> erwarteter Backendzustand
  -> sichtbares Sollverhalten
```

Eine Regel ist erst vollständig migriert, wenn diese Kette geschlossen ist.
Eine monolithische Rieseninstruktion ist ebenso wenig das Ziel wie die
Verteilung wichtiger Regeln auf nicht auffindbare Codefragmente. Jede Regel
hat genau einen primären Zielort; zusätzliche Defense-in-depth-Orte werden
ausdrücklich benannt und nicht als zweite Quelle der Bedeutung behandelt.

## 7. Verbindliche Verhaltensregeln

| Policy-ID | Regel |
| --- | --- |
| `COACH-STATE-001` | Der frisch geladene Backendzustand ist die einzige Zustandsautorität. |
| `COACH-SESSION-001` | Die aktuelle Lernsession wird unverändert für jeden fachlichen Aufruf verwendet und nie aus OAuth oder älteren Chats abgeleitet. |
| `COACH-INTENT-001` | Natürliche mehrteilige Absichten gelten unabhängig von Reihenfolge und Wortlaut fort. |
| `COACH-CONTEXT-001` | Vor offenen Fragen wird der bereits bestätigte fachliche Kontext knapp genannt. |
| `COACH-SCOPE-001` | Lernumfang und Profil werden vollständig aufgelöst, bevor Frontier oder Ziele angeboten werden. |
| `COACH-FOCUS-001` | Zieloptionen stammen ausschließlich aus dem bestätigten aktuellen Fokus; frühere Stufen dürfen nicht hineinlecken. |
| `COACH-MUTATION-001` | Pro frischem Zustand wird nur eine aktuell erlaubte Option mutiert; danach wird neu geladen. |
| `COACH-QUESTION-001` | Der Coach fragt nur echte Restmehrdeutigkeiten und fasst zusammengehörige offene Angaben möglichst zusammen. |
| `COACH-GOAL-001` | Unterricht findet an genau einem bestätigten atomischen Ziel statt. |
| `COACH-MASTERY-001` | Mastery folgt der global eindeutigen Lernziel-ID und wird nur nach ausreichender Evidenz gespeichert. |
| `COACH-RECALL-001` | Sollantworten werden erst nach Lernendenantworten geladen; jeder Recall-Schritt wird vollständig gespeichert. |
| `COACH-EXAM-001` | Prüfung bedeutet wortgetreue Aufgabe, keine Hilfen oder Rückfragen und faire kriteriumsbezogene Bewertung gleichwertiger Wege. |
| `COACH-RESOURCE-001` | Fachliche Ressourcen werden nur aus dem frischen Zustand verwendet; der Coach entscheidet allgemein zwischen Erklärung im Chat und einem passenden Cockpit-Deep-Link. |
| `COACH-ERROR-001` | Fehlerbehandlung ist begrenzt, wahrheitsgemäß und erzeugt keinen erfundenen Ersatzablauf. |
| `COACH-PRIVACY-001` | Technische Identitäten, Geheimnisse und interne IDs bleiben außerhalb sichtbarer Coachantworten. |

Diese IDs sind zunächst die stabile Sprache für Dokumentation und
Acceptance-Szenarien. Änderungen an ihrer Bedeutung müssen bewusst in diesem
Dokument und den zugehörigen Nachweisen nachvollzogen werden.

## 8. Abstrakte Fehlerklassen

Ein Testergebnis wird zuerst einer allgemeinen Fehlerklasse zugeordnet:

1. **Session/Handoff**  
   Startnachricht fehlt, falsche oder ältere Session, doppelter Klick,
   unzuverlässiger Deep Link.
2. **Zustandsprojektion**  
   Das Backend veröffentlicht nicht genug, widersprüchlichen oder zu großen
   Kontext.
3. **Intentverständnis**  
   Eine natürliche Mehrfachangabe wird nur teilweise oder zu wörtlich
   verstanden.
4. **Scope-Auflösung**  
   Curriculum, Personalisierung, Fach, Stufe, Profil oder Jahr werden nicht
   vollständig aufgelöst.
5. **Fokussetzung**  
   Der sichtbare Unterbaum passt nicht zur bestätigten Absicht.
6. **Toolverständlichkeit**  
   Name, Beschreibung, Schema oder Ergebnis verleiten das Modell zum falschen
   Aufruf oder lassen einen notwendigen Aufruf aus.
7. **Orchestrierung**  
   Mutation, frischer Read und nächste Entscheidung erfolgen in falscher
   Reihenfolge.
8. **Kontextverlust**  
   Reload, langer Dialog oder Kompaktierung führt zu altem oder erfundenem
   Zustand.
9. **Didaktik/Modus**  
   Coaching, Mastery, Recall oder Prüfung missachten die fachlichen Regeln.
10. **Nutzerkommunikation**  
    Technische Sprache, unnötige Fragen, fehlende Orientierung oder falsche
    Erfolgsbehauptungen.

Ein Fix ist nur dann allgemein, wenn er für die Fehlerklasse und weitere
Curricula funktioniert. Beispielsweise wird „Hessen, Mathe LK“ nicht durch
eine Hessen- oder Mathematik-Sonderregel repariert, sondern durch bessere
Intentauflösung, veröffentlichte Programminformation, korrekte Fokusoptionen
und den allgemeinen Mutationszyklus.

## 9. Golden Journeys

Die folgenden Nutzerreisen bilden die minimale Verhaltensbaseline:

### GJ-01 – Frischer Start

- **Ausgang:** SkillPilot-ID und Curriculum sind in der UI gewählt.
- **Aktion:** einmal **Lernen starten**.
- **Erwartung:** neue 24h-Lernsession, neuer Chat, eingetragene Startnachricht,
  richtiger Appkontext, erster Context-Read.
- **Verboten:** zweiter Klick, manuelles Kopieren, allgemeine Lehrplanantwort.

### GJ-02 – Natürliche Mehrfachangabe

- **Eingabevarianten:** „Hessen, Mathe LK“, „Mathe Leistungskurs in Hessen“,
  „Ich bin in Hessen in der Oberstufe und habe Mathe LK“.
- **Erwartung:** Bundesland, Fach und das fachbezogene Kursprofil werden
  semantisch korrekt aufgelöst. Nur die dritte Variante löst durch
  „Oberstufe“ zusätzlich eindeutig Sekundarstufe II auf. Lernstufe,
  Dauer-/Jahrgangsmodell, Jahr oder Phase bleiben sonst offen und werden
  gezielt erfragt.
- **Verboten:** starre Einzelfragen, Wiederholung bereits beantworteter Fragen,
  globale Übertragung von LK/GK auf andere Fächer oder ein aus LK/GK
  abgeleiteter Lernstufenfokus.

### GJ-02a – Mehrere fachbezogene Kursprofile

- **Eingabe:** „Mathe LK und Physik GK“.
- **Erwartung:** Mathematik erhält das Kursprofil LK und Physik das Kursprofil
  GK. Beide Fächer bleiben ausgewählt; Lernstufe und G8/G9 bleiben unabhängig.
- **Verboten:** ein globales Kursprofil, das Überschreiben eines Fachs durch das
  andere oder die automatische Festlegung auf Sekundarstufe II.

### GJ-03 – Korrekte Orientierung und Fokus

- **Erwartung:** bestätigter Kontext wird knapp genannt; Zieloptionen stammen
  ausschließlich aus dem passenden fokussierten Unterbaum.
- **Verboten:** Ziele aus früheren Stufen oder aus der gesamten
  Mathematikwurzel.

### GJ-04 – Normaler Coachingzyklus

- **Erwartung:** ein aktives atomisches Ziel, Diagnose des Vorwissens, kleine
  Hinweise, selbstständige Arbeit, Transfer, faire Rekonstruktion alternativer
  Wege und Mastery erst nach ausreichender Evidenz.
- **Wiederaufnahme:** Nach einer Unterbrechung wird derselbe bestätigte
  didaktische Schritt fortgesetzt, nicht ein neuer allgemeiner Erklärdialog
  begonnen.

### GJ-05 – Verified Recall

- **Erwartung:** vollständiger Batch, Antwort der lernenden Person vor
  Sollantwort, fachlich äquivalente Formulierungen, jede Karte gespeichert,
  keine zusätzliche manuelle Mastery.

### GJ-06 – Prüfung

- **Erwartung:** unveränderte Aufgabe, keine Hilfe oder Nachfrage, Auswertung
  erst nach vollständiger Abgabe, Teilpunkte nach Raster, gleichwertige
  Lösungswege anerkannt.

### GJ-07 – Langdialog und Rehydration

- **Ausgang:** mindestens 10 bis 20 Dialogzüge, Nebenthema, Reload oder
  simulierter Kontextdruck.
- **Erwartung:** derselbe Backendlernzustand wird mit der noch gültigen
  Lernsession frisch geladen; keine alte Option wird mutiert.

### GJ-08 – Ablauf und Neustart

- **Ausgang:** abgelaufene oder widerrufene Lernsession.
- **Erwartung:** klarer Weg zu **Lernen starten**; der nächste UI-Start erzeugt
  eine neue Session.
- **Verboten:** Aufforderung zur Eingabe einer SkillPilot-ID, eines Tokens oder
  zu einer unnötigen OAuth-Neuverbindung.

### GJ-09 – Parallele Lernende und Chats

- **Erwartung:** unterschiedliche UI-Starts und SkillPilot-IDs bleiben strikt
  getrennt; jede Session sieht und mutiert nur ihren zugeordneten Lernzustand.

### GJ-10 – Andere Curricula

- **Erwartung:** derselbe allgemeine Entscheidungszyklus funktioniert ohne
  schul-, bundesland-, fach- oder zielbezogene Code-Sonderregel.

### GJ-11 – Ressourcen und Cockpit-Grenze

- **Erwartung:** Der Coach nutzt nur Ressourcen des frischen Zustands und
  entscheidet anhand allgemeiner fachlicher Regeln, ob eine Erklärung im Chat
  genügt oder eine Visualisierung beziehungsweise Interaktion im Cockpit
  sinnvoll ist.
- **Verboten:** erfundene Ressource, veralteter Deep-Link, Chat-Ersatz für eine
  notwendige Cockpit-Interaktion oder unnötiger Cockpit-Wechsel.

## 10. Acceptance- und Evidenzstrategie

### 10.1 Testpyramide

1. **Deterministische Vertragstests**  
   Toolkatalog, einfache Schemas, Sessionpflicht, Scopes, sichere Projektion
   und Fehlergrenzen.
2. **Zustands- und Workflowtests ohne LLM**  
   Vollständige Backendfolgen von Einstieg über Scope/Fokus bis Coaching,
   Recall oder Prüfung.
3. **MCP-Protokolltests**  
   Initialisierung, Toolauflufe, Fehlerresultate und frischer Folgezustand.
4. **Model-in-the-loop-Goldensuite**  
   Reale App, fixiertes Backendfixture, mehrere natürliche Paraphrasen,
   aufgezeichnete Toolspur und sichtbare Qualitätsrubrik.
5. **Langdialog- und Kompaktierungstests**  
   Rehydration, Reload, parallele Chats, Ablauf, Retry und Provideränderungen.

### 10.2 Objektive Evidenz

Die Aussage des Modells, es habe etwas geladen oder gespeichert, ist kein
Nachweis. Maßgeblich sind:

- tatsächliche Toolaufrufe und ihre Reihenfolge;
- erwartete und verbotene Aufrufe;
- Backendzustand vor und nach jedem Schritt;
- Session- und Scope-Trennung;
- sichtbare Antwort anhand einer kleinen fachlichen Rubrik;
- Build-, App- und Vertragsversion des Tests.

Server-verifizierbare Werte und Logs haben Vorrang vor Modellselbstauskunft.

### 10.3 Harte Gates

- 100 % korrekter Backendendzustand in den freigegebenen Golden Journeys;
- 100 % korrekter Scope und Fokus;
- keine unerlaubte Mutation;
- keine Vermischung paralleler Sessions oder Lernender;
- keine Geheimnis- oder Identitätslecks;
- keine Regression der globalen Lernziel-/Mastery-Semantik.

### 10.4 Qualitätsziele

- mindestens drei semantisch verschiedene Formulierungen pro zentraler
  Nutzerabsicht;
- mindestens 95 % erfolgreiche reale Dialogläufe je freigegebenem Szenario;
- höchstens eine nachweislich unnötige Rückfrage;
- keine wiederholte bereits beantwortete Frage;
- keine sichtbare technische API-Sprache;
- gleiche fachliche Qualität nach kurzem und langem Dialog.

## 11. Testprotokoll für die schrittweise Erprobung

Jeder manuelle Test soll kompakt mit demselben Schema festgehalten werden:

| Feld | Inhalt |
| --- | --- |
| Test-ID und Golden Journey | zum Beispiel `GJ-02 / INTENT-003` |
| Datum und Umgebung | lokal, Staging oder Produktion |
| Git-SHA, Build-, App- und Vertragsversion | reproduzierbare technische Basis |
| Lernfixture | Curriculum, SkillPilot-ID pseudonymisiert, relevanter Vorzustand |
| Startart und Lernsession | neuer UI-Start, Wiederaufnahme, Reload oder Ablauf |
| Nutzereingaben | wortgetreu, einschließlich Reihenfolge |
| erwartete Auflösung | bestätigter Kontext, offene Angaben, Scope und Fokus |
| erwartete/unerlaubte Toolspur | als Teilordnung, nicht unnötig auf einen einzigen Modellplan verengt |
| tatsächliche Toolspur | aus Telemetrie beziehungsweise Serverlog |
| erwarteter/tatsächlicher Backendzustand | vor und nach den Mutationen |
| sichtbares Ergebnis | fachliche und kommunikative Bewertung |
| Fehlerklasse und betroffene Policy-IDs | aus Abschnitt 7 und 8 |
| allgemeiner Fix, Retest, Status | kein Einzelfallpatch |

Wiederholte Screenshots und Logs gehören in ein passendes QA-Artefakt oder
Issue; dieses Leitdokument bleibt die stabile Gesamtaufgabe und wird nicht zum
ungeordneten Logbuch.

## 12. Arbeitsprogramm

### Phase A – Baseline und Regeltrace

- die wichtigsten erfolgreichen früheren Custom-GPT-Dialoge als Golden
  Journeys sichern;
- jede bindende frühere Regel einer Policy-ID, Laufzeitschicht und einem Test
  zuordnen;
- klar markieren, welche Aussagen nur technische Zuordnung und welche
  nachgewiesene Verhaltensparität bedeuten.

### Phase B – Einstieg, Scope und Fokus

- den einmaligen UI-Start regressionssicher machen;
- bestätigten Kontext und offene Angaben vollständig projizieren;
- natürliche mehrteilige Absichten allgemein auflösen;
- korrekten Lernumfang und Fokus vor jeder Zielauswahl sicherstellen.

### Phase C – Normaler Lernzyklus

- Zielwahl, Erklären, Üben, Lösungsauswertung, Ressourcen, Fortschritt und
  Mastery Ende-zu-Ende abnehmen;
- alternative korrekte Lösungswege und explizite Aufgabenanforderungen
  regressionssicher prüfen.

### Phase D – Recall und Prüfung

- modellseitige Regeln, Backendguards und sichtbare Abläufe zusammen abnehmen;
- keine grüne Freigabe allein aufgrund vorhandener Tools oder Unit-Tests.

### Phase E – Resilienz

- Reload, langer Dialog, Kompaktierung, parallele Sessions, Ablauf,
  Backendneustart und Provideränderungen testen;
- alte Conversation-Information nie über den frischen Backendzustand stellen.

### Phase F – Produktreife und Englisch

- unnötige technische Reibung und sichtbare Zwischenzustände entfernen;
- optionale UI nur dort ergänzen, wo sie Bedienung oder Integrität messbar
  verbessert;
- die englische App erst nach stabiler deutscher Verhaltensbaseline separat
  ableiten.

## 13. Aktueller ehrlicher Stand

| Bereich | Stand |
| --- | --- |
| Spring-MCP-Transport und Toolkatalog | technisch implementiert |
| OAuth-Appbindung und explizite 24h-Lernsession | technisch implementiert; produktive Regression weiter beobachten |
| Zuordnung der früheren Knowledge-Regeln | dokumentiert und technisch verteilt |
| einmaliger Start aus der SkillPilot-UI | zuletzt erfolgreich getestet; dauerhaftes Regression-Gate noch erforderlich |
| natürlicher mehrteiliger Einstieg | teilweise funktionsfähig |
| Scope- und Fokusauflösung | noch nicht allgemein zuverlässig |
| normaler Coachingzyklus | in realen Dialogen weiter abzunehmen |
| Verified Recall und Prüfung | Verträge vorhanden; reales Modellverhalten nicht vollständig abgenommen |
| Reload, Langdialog und Kompaktierung | noch nicht ausreichend nachgewiesen |
| Endnutzer-Verhaltensparität zum früheren Coach | **offen** |

Dieser Stand darf nur durch nachvollziehbare Evidenz hochgestuft werden.

## 14. Was ausdrücklich nicht getan wird

- keine Änderung der globalen Lernziel- oder Mastery-Semantik zur Reparatur
  eines Coachdialogs;
- keine Hessen-, Mathematik-, LK-, Jahrgangs- oder Lernziel-Sonderlogik als
  Ersatz für allgemeine Scope-/Fokusauflösung;
- keine 1:1-Nachbildung alter HTTP-Methoden, wenn der Nutzerworkflow anders
  vollständig und sicher funktioniert;
- keine Verhaltenssteuerung über die sichtbare Appbeschreibung;
- kein Vertrauen auf implizite Modellmemory als dauerhafte Zustandsquelle;
- keine Behauptung vollständiger Migration allein aufgrund grüner
  Vertragstests;
- keine optionale Widget-UI als Ausrede für einen unvollständigen data-only
  Dialog.

## 15. Definition of Done

Die große Aufgabe ist abgeschlossen, wenn:

1. alle Golden Journeys die harten Gates erfüllen;
2. jede normative Regel eine geschlossene Traceability-Kette besitzt;
3. mehrere Curricula und natürliche Mehrfachangaben ohne Sondercode
   funktionieren;
4. Scope und Fokus vor jeder Frontier-/Zielausgabe korrekt sind;
5. normaler Unterricht, Mastery, Recall und Prüfung fachlich abgenommen sind;
6. Reload, lange Dialoge, Kompaktierung und parallele Sessions keinen
   Lernzustand verlieren oder vermischen;
7. der Einstieg ohne manuelle technische Werte und mit einem Klick
   funktioniert;
8. die sichtbare Nutzerkommunikation mindestens die Qualitätsziele erfüllt;
9. CI, reale Provider-Tests, Telemetrie und Rollback gemeinsam grün sind;
10. der frühere Custom-GPT-Coach nur noch als historische Baseline und
    Rollbackquelle benötigt wird, nicht als fehlende Verhaltensschicht.

## 16. Fortsetzung in einem neuen Chat

Der folgende Text kann als Übergabe in einen neuen Codex-Chat kopiert werden:

```text
Arbeite im Repository /home/enpasos/projects/skillpilot an der großen Aufgabe
„Verhaltensintegration des deutschen MCP-Lerncoaches“.

Lies zuerst vollständig:
1. AGENTS.md
2. docs/concept/runtime-workflows/openai-mcp-coach-behavioral-integration.md
3. docs/concept/runtime-workflows/openai-mcp-coach-knowledge-parity.md
4. docs/concept/runtime-workflows/openai-mcp-coach-migration-plan.md
5. für Auth/Session nur bei Bedarf:
   docs/concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md

Wichtig:
- Technisch vorhandene Tools oder zugeordnete Knowledge-Regeln bedeuten noch
  keine Endnutzer-Verhaltensparität.
- Der Backendzustand ist autoritativ.
- Lernziel-IDs sind global eindeutig; verändere nicht die Mastery-Semantik.
- Repariere allgemeine Mechanismen für Intent, Scope, Fokus,
  Zustandsprojektion und Orchestrierung; baue keine Curriculum-Sonderfälle.
- Nach jeder Mutation muss der frische Zustand geladen werden.
- Bewerte ein Ergebnis anhand von Toolspur, Backendzustand und sichtbarer
  Antwort, nicht anhand der Selbstauskunft des Modells.

Aktueller Test beziehungsweise Fehler:
<hier Screenshot, Eingaben, Logs, Git-SHA und erwartetes Verhalten einsetzen>

Ordne den Fehler zuerst einer Fehlerklasse und den Policy-IDs des
Leitdokuments zu. Vergleiche bei Bedarf mit dem früheren Custom-GPT-Verhalten.
Diagnostiziere die allgemeine Ursache, implementiere nur die engste allgemeine
Korrektur und führe passende deterministische sowie reale Acceptance-Tests
durch. Dokumentiere anschließend, was bewiesen ist und was noch offen bleibt.
```

## 17. Referenzen

- [OpenAI: Plugin-Architektur](https://developers.openai.com/plugins/concepts/plugins)
- [OpenAI: Skills bauen](https://developers.openai.com/plugins/build/skills)
- [OpenAI: Connectors and remote MCP servers](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- `ai/openai custom gpt/system_instructions.de.md`
- `ai/openai custom gpt/knowledge_docs/`
- `ai/openai-custom-gpt-visible-session/de/system_instructions.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/`
- `backend/src/main/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContract.java`
- `backend/src/main/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachContextProjector.java`
