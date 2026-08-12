# Verhaltensintegration des MCP-Lerncoaches

**Stand:** 12. August 2026

**Status:** lebendes, normatives Leitdokument und übergreifende Produktaufgabe  

**Kurzname:** Coach-Verhaltensintegration

## 1. Auftrag

Die große Aufgabe ist nicht mehr, einzelne SkillPilot-Funktionen irgendwie über
MCP erreichbar zu machen. Sie lautet:

> Aus Backend, Skill-Graph, Lernzustand, MCP-Vertrag und Provider-Modell
> wieder einen zusammenhängenden, verlässlichen und für Lernende natürlichen
> Coach zu bilden.

Der aktuelle V1-Coach wird an den Qualitäten gemessen, die aus Sicht der
lernenden Person entscheidend sind:

- ein natürlicher Einstieg statt technischer Bedienung;
- korrektes Verstehen mehrteiliger Wünsche;
- ein passender Lernumfang und Fokus;
- wenige, aber richtige Rückfragen;
- fachlich konsistentes Coaching über viele Dialogzüge;
- faire Bewertung, Verified Recall und strenger Prüfungsmodus;
- robuste Wiederaufnahme nach Reload, langem Dialog oder Kontextverlust.

Eine erfolgreiche OAuth-Verbindung, ein gültiger MCP-Vertrag und vorhandene
Tools beweisen noch kein verlässliches Endnutzerverhalten. Dafür zählen die
vollständige Nutzerreise, der tatsächliche Tooltrace, der kanonische
Backendzustand und die sichtbare Antwort zusammen.

Dieses Dokument hält den Nordstern, die allgemeinen Verhaltensregeln, die
offenen Integrationsfelder und die Abnahmeform fest. Einzelne Testergebnisse
werden daran eingeordnet. Einzelfehler sollen zu allgemeinen Verbesserungen
führen, nicht zu curricularen Sonderregeln.

## 2. Geltungsbereich und Verhältnis zu anderen Dokumenten

Dieses Dokument ist die führende Quelle für das **zusammenhängende sichtbare
Verhalten** des mehrsprachigen MCP-Lerncoaches und für dessen End-to-End-Abnahme.

Die folgenden Dokumente bleiben für ihre engeren Themen maßgeblich:

- [Kommunikationsvertrag zwischen ChatClient und Backend](provider-neutral-coach-boundary.md):
  kanonische Arbeitsteilung, Tooldesign, Ergebnisautorität und Fortsetzung;
- [OAuth-Appbindung und 24h-Lernsession](openai-mcp-oauth-learner-session-architecture.md):
  Trennung von App-Authentisierung und Lernsession;
- [SkillPilot-eigene Coach-Architektur](skillpilot-owned-coach-architecture.md):
  langfristiges Produkt- und Verantwortungsmodell;
- [OpenAI-MCP-Clientbindung](../../security/openai-mcp-client-binding.md):
  Sicherheitsmodell;
- [Deployment-Runbook](../../deploy/openai-mcp-coach-v1.md):
  produktiver Betrieb und technische Smoke-Tests.

Dabei gilt: Dokument- oder Schemaparität ist erst relevant, wenn vollständige
Nutzerreisen mit realem Modellverhalten reproduzierbar funktionieren.

## 3. Erfolgsbild aus Sicht der lernenden Person

Eine lernende Person soll nicht wissen müssen, wie OAuth, MCP, Toolargumente,
Kontextprojektion oder Lernsessionen funktionieren. Sie soll:

1. in SkillPilot auf **Lernen starten** klicken;
2. in einem neuen Chat mit bereits eingetragener Startnachricht landen;
3. ihren Lernwunsch natürlich formulieren können;
4. unmittelbar im bereits im WebGUI konfigurierten Kontext weiterlernen;
5. nur bei einer echten fachlichen oder Level-3-Mehrdeutigkeit gefragt werden;
6. am richtigen Ziel im richtigen Modus lernen;
7. nach Unterbrechungen verlässlich dort fortsetzen können.

Curriculum, Bundesland, Dauer- oder Jahrgangsmodell, Stufe, Fächer,
Kursprofile und Personalisierung werden ausschließlich im First-Party-WebGUI
konfiguriert. Der Chat darf diese Level-2-Werte weder erfragen noch verändern.
Freie Sprache ordnet er nur aktuellen fachlichen, Fokus- oder Zieloptionen zu.

## 4. Nicht verhandelbare Invarianten

Diese Regeln dürfen durch Provider-, Modell- oder Runtimeänderungen nicht
verändert werden:

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
- `requires` ist gerichtet. Die Beherrschung eines abhängigen Ziels belegt
  niemals rückwirkend die Beherrschung seiner noch offenen Voraussetzungen.
  Jedes nicht beherrschte `target`-Ziel bleibt nach seinen eigenen effektiven
  Voraussetzungen ein normaler Frontier-Kandidat.
- Frontier und Empfehlungen werden erst nach korrekt festgelegtem Lernumfang
  und Fokus bestimmt.

### 4.2 Appbindung und Lernsession

- OAuth authentisiert die fest konfigurierte App gegenüber SkillPilot.
- Jedes ausdrücklich bestätigte **Lernen starten** in der First-Party-UI erzeugt
  in genau diesem Augenblick eine neue, unabhängige und absolut 24 Stunden
  gültige Lernsession für die dort gewählte
  SkillPilot-ID. Auch dieselbe SkillPilot-ID erhält bei einem neuen Start eine
  neue Lernsession; ältere Sessiondatensätze werden dadurch nicht widerrufen.
- Die Lernsession ist von OAuth getrennt. OAuth allein wählt keinen Lernenden
  und erzeugt keine Lernsession.
- SkillPilot trägt die Lernsession automatisch in die Startnachricht ein. Das
  Modell übernimmt sie unverändert in jeden fachlichen MCP-Aufruf. Die lernende
  Person muss sie weder kopieren noch verstehen.
- Eine Lernsession aus einer älteren Startnachricht darf nicht für einen neuen
  Start verwendet werden.
- Jede fachliche Operation und jeder Write-Replay benötigt mindestens `PT1H`
  Restlaufzeit. Exakt `PT1H` ist zulässig, darunter endet der Chat-Lernfluss.
  Ein bereits committeter Write darf mit demselben Toolnamen, kanonisch
  identischen Argumenten und derselben `clientRequestId` nur bei weiterhin
  verfügbarer gepinnter Workflow-/Curriculumversion und unveränderter
  kanonischer Learner-Revision sein gespeichertes Resultat replayen; er mutiert
  nicht erneut.

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

Bei Einstieg, Wiederaufnahme, Unsicherheit oder möglicher Kompaktierung gilt:

1. **Lernsession übernehmen**
   Die Lernsession kommt ausschließlich aus der aktuellen SkillPilot-
   Startnachricht.
2. **Frischen Zustand laden**
   Zu Beginn jedes Learner-Turns wird der Kontext im aktuellen Assistant-Turn
   geladen. Curriculum, Personalisierung, Lernumfang, Fokus, aktives Ziel,
   Frontier, Modus und Fortschritt werden nicht aus Gesprächserinnerung
   rekonstruiert. Nach einer erfolgreichen Mutation ist ihr vollständiger
   Nachfolgerzustand für den Rest desselben Assistant-Turns autoritativ; der
   Coach lädt ihn nicht redundant erneut.
3. **Bestätigten Kontext bilden**
   Der Coach unterscheidet klar zwischen bereits bestätigtem Zustand,
   aktuellen Backendoptionen und bloßer Nutzerabsicht.
4. **Zulässige Nutzerabsicht auswerten**
   Chatseitig bleiben nur fachliche Arbeit sowie ausdrückliche Level-3-
   Änderungen von Fokus oder aktivem Ziel. Level-2-Konfiguration wird nie im
   Chat vervollständigt oder geändert.
5. **Eindeutige nächste Option semantisch zuordnen**
   Nur eine Option des jüngsten Zustands darf mutiert werden. Die Zuordnung
   erfolgt nach Bedeutung, nicht nach zufälliger Position oder Wortgleichheit.
6. **Genau eine erlaubte Mutation ausführen**
   Keine spätere Auswahl wird vorweggenommen und keine ID konstruiert.
7. **Frischen Nachfolgerzustand übernehmen**
   Nach jeder Mutation ist ausschließlich ihr vollständiger neuer
   Backendzustand gültig; ein redundanter Kontextabruf ist im selben
   Assistant-Turn nicht erforderlich.
8. **Absicht erneut auf den neuen Zustand anwenden**  
   Solange genau ein fachlicher oder Level-3-Schritt eindeutig ist, wird der
   Zyklus ohne unnötige Zwischenfrage fortgesetzt.
9. **Nur echte Restmehrdeutigkeit erfragen**  
   Alle offenen, zusammengehörigen Angaben werden möglichst gemeinsam und mit
   dem bereits bestätigten Kontext erfragt.
10. **Erst danach fachlich arbeiten**  
    Frontier, Zielwahl, Coaching, Recall oder Prüfung beginnen erst mit
    korrekt bestätigtem Lernumfang und Fokus.

### 5.2 Scope und Fokus

Der Coach muss folgende Begriffe auseinanderhalten:

- **Einstiegskontext:** im WebGUI gewähltes Curriculum beziehungsweise
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
zum Beispiel Mathematik LK und Physik GK gleichzeitig bestehen können. Diese
Level-2-Werte werden ausschließlich im WebGUI aufgelöst. Der Coach darf sie
weder erfragen noch mutieren. Er darf den Fokus aber nicht auf der gesamten
Mathematik belassen und anschließend Ziele aus einem nicht bestätigten
Lernumfang anbieten.

Die fachliche Semantik muss aus den vom Backend veröffentlichten
Programmeinheiten, Optionen, Placements, Kompositionsansichten und
Kompetenzbeziehungen stammen. Sprachliche Schlussfolgerungen des Modells dürfen
nur frische Fokus- oder Zieloptionen betreffen, niemals Curriculum oder
Personalisierung.

Bei einer Fokusweitung veröffentlicht das Backend ausschließlich den
learner-facing Vorfahrenpfad zur Root, soweit ein breiterer Fokus noch offene
`target`-Ziele hinzunimmt. Der nächstgelegene geeignete Vorfahr steht zuerst.
Der Coach verwendet ausschließlich eine exakte frische Option und leitet weder
Vorfahren noch interne IDs selbst her.
Eine automatische Empfehlung entsteht nur nach tatsächlichem Abschluss des
aktuellen Fokus; eine leere Frontier allein reicht nicht. Der Coach bietet die
erste Option an und setzt sie erst nach Zustimmung der lernenden Person.

### 5.3 Begrenzte Fehlerbehandlung

- Bei einem Konflikt wird der Zustand genau einmal frisch geladen und die
  aktuelle Absicht erneut geprüft.
- Bei `SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED` oder
  `SESSION_VERSION_UNAVAILABLE` gibt der Coach `instruction` unverändert aus
  oder wählt den exakten lokalisierten Eintrag aus `instructions`; die exakte
  `startUrl` ergänzt er nur, wenn sie nicht schon enthalten ist. Er lehrt nicht weiter, verwendet
  die alte Session nicht erneut und verbindet OAuth nicht neu. **Lernen
  starten** im First-Party-WebGUI erzeugt eine frische Session und öffnet den
  neuen Chat.
- Bei Authentifizierungs-, Schema-, Speicher- oder wiederholtem Konfliktfehler
  stoppt der strukturierte Ablauf transparent.
- Der Coach darf nach einem Fehler keinen Erfolg vermuten, keinen Zustand
  weiterschreiben und keinen allgemeinen Lernpfad als Ersatz erfinden.

## 6. Wirksame Laufzeitorte und Regelpflege

Jede Regel hat genau einen primären Ort. Weitere Stellen dürfen sie absichern,
aber nicht mit einer zweiten Bedeutung formulieren:

| Regelart | Primärer Ort |
| --- | --- |
| Grenze zwischen Sprache und technischer Orchestrierung | [Kommunikationsvertrag](provider-neutral-coach-boundary.md) |
| sichtbares didaktisches Coach-Verhalten | dieses Dokument |
| wiederholbares Modellverhalten | ausgelieferte `SKILL.md` und `coaching-policy.md` |
| werkzeugübergreifende Invariante | kurze `SERVER_INSTRUCTIONS` in `OpenAiDeV1McpContractAdapter` |
| Auswahl und Bedingung eines Werkzeugs | Toolname, Beschreibung und Schema im V1-Adapter |
| aktuell zustandsabhängige Entscheidung | genau ein frisches Toolergebnis aus `OpenAiDeCoachContextProjector` beziehungsweise dem Workflowadapter |
| fachliche und sicherheitsrelevante Garantie | Domainservice, Guard, Transaktion und Test |
| reales Zusammenspiel | Golden Journey, Tooltrace, Backendzustand und sichtbare Antwort |

Eine Regeländerung ist erst vollständig, wenn ihr primärer Ort, die wirksame
Runtime und mindestens ein passender Test zusammenpassen. Eine monolithische
Rieseninstruktion ist ebenso falsch wie dieselbe Anweisung in mehreren
Ergebniskanälen.

Technische Orchestrierung wird nicht durch mehr Prompttext abgesichert. Das
Backend besitzt deterministische IDs, Mengen, Reihenfolgen,
Vollständigkeitsprüfungen, Zustandsübergänge, Nebenläufigkeit, Idempotenz und
Fortsetzung. Das Modell besitzt Sprachverständnis, didaktischen Dialog und
fachlich-semantischen Vergleich. Sobald ein Ablauf technisch zähl- oder
validierbar ist, stellt das Backend eine vollständige atomare Operation bereit;
der Skill beschreibt nur die minimale fachliche Übergabe.

Die eingefrorenen Custom-GPT- und Visible-Session-Pakete sind historische
Baseline beziehungsweise Rollbackquelle. Sie werden weder als aktuelle
Runtime-Knowledge geladen noch für Parität editiert. Aktueller Backendvertrag,
Kommunikationsvertrag und ausgelieferter V1-Skill haben Vorrang.

## 7. Verbindliche Verhaltensregeln

| Policy-ID | Regel |
| --- | --- |
| `COACH-STATE-001` | Der frisch geladene Backendzustand ist die einzige Zustandsautorität. |
| `COACH-SESSION-001` | Die aktuelle Lernsession wird unverändert für jeden fachlichen Aufruf verwendet und nie aus OAuth oder älteren Chats abgeleitet. |
| `COACH-SESSION-002` | Operationen und gespeicherte Write-Replays benötigen mindestens `PT1H` Restlaufzeit; exakt `PT1H` ist gültig. Ein Replay mit gleichem Toolnamen, kanonisch identischen Argumenten und derselben `clientRequestId` ist nur bei verfügbarer gepinnter Workflow-/Curriculumversion und unveränderter kanonischer Learner-Revision zulässig und mutiert nicht erneut. |
| `COACH-SESSION-003` | Sessionfehler ergeben ausschließlich die unveränderte Serverinstruktion und, falls darin noch nicht enthalten, die exakte `startUrl`; keine Fachantwort oder OAuth-Neuverbindung, Fortsetzung über First-Party-Webstart und neuen Chat. |
| `COACH-BOOTSTRAP-001` | Ohne aktuelle vorbereitete Session nennt der Coach nur `https://skillpilot.com/` und den WebGUI-Startweg; er ruft kein SkillPilot-Tool auf. |
| `COACH-INTENT-001` | Natürliche mehrteilige Absichten gelten unabhängig von Reihenfolge und Wortlaut fort. |
| `COACH-CONTEXT-001` | Vor offenen Fragen wird der bereits bestätigte fachliche Kontext knapp genannt. |
| `COACH-SCOPE-001` | Level-2-Lernumfang und Profile werden ausschließlich im WebGUI aufgelöst; der Coach verwendet sie nur frisch bestätigt. |
| `COACH-FOCUS-001` | Zieloptionen stammen ausschließlich aus dem bestätigten aktuellen Fokus; frühere Stufen dürfen nicht hineinlecken. |
| `COACH-MUTATION-001` | Pro frischem Zustand wird nur eine aktuell erlaubte Option mutiert; ihr vollständiger Nachfolgerzustand ist danach für den Rest desselben Assistant-Turns autoritativ. |
| `COACH-QUESTION-001` | Der Coach fragt nur echte Restmehrdeutigkeiten und fasst zusammengehörige offene Angaben möglichst zusammen. |
| `COACH-GOAL-001` | Unterricht findet an genau einem bestätigten atomischen Ziel statt. |
| `COACH-MASTERY-001` | Mastery folgt der global eindeutigen Lernziel-ID und wird nur nach ausreichender Evidenz gespeichert. |
| `COACH-RECALL-001` | Das Backend besitzt IDs, Kartenzahl, Reihenfolge, Vollständigkeit, Status, Idempotenz und Fortsetzung eines Recall-Batches. Das Modell zeigt den vollständigen serverseitigen Batch, wartet auf alle Antworten, lädt alle Sollantworten genau einmal, vergleicht nur fachlich-semantisch und speichert alle Bewertungen genau einmal atomar. Es wählt keine Batchgröße und führt keine technischen Schleifen pro Karte aus. |
| `COACH-EXAM-001` | Prüfung bedeutet wortgetreue Aufgabe, keine Hilfen oder Rückfragen und faire kriteriumsbezogene Bewertung gleichwertiger Wege. |
| `COACH-RESOURCE-001` | Fachliche Ressourcen werden nur aus dem frischen Zustand verwendet. Eine frisch autorisierte Zielvisualisierung wird genau einmal unmittelbar über ihren gebundenen Renderer dargestellt; nach Wahl normaler Kartenpraxis startet die gebundene Kartenkomponente. Nur andere optionale Ressourcen folgen einer fachlichen Chat-/Cockpit-Entscheidung, und der Cockpit-Fallback gilt nur in den ausdrücklich dokumentierten Fällen. |
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
- **Erwartung:** neue unabhängige 24h-Lernsession, aktuelle eingetragene oder von
  SkillPilot vorbereitete Startnachricht, neuer Chat, richtiger Appkontext und
  erfolgreicher Kontextabruf im ersten Assistant-Turn vor jeder Fachantwort.
- **Verboten:** zweiter Klick, manuelles Kopieren, allgemeine Lehrplanantwort.

### GJ-02 – Level-2-Änderungswunsch im Chat

- **Eingabevarianten:** „Hessen, Mathe LK“, „Mathe Leistungskurs in Hessen“,
  „Ich bin in Hessen in der Oberstufe und habe Mathe LK“.
- **Erwartung:** keine chatseitige Curriculum- oder Personalisierungsmutation.
  Der Coach verweist knapp auf den serverseitig gelieferten WebGUI-Weg; nach
  **Lernen starten** wird im neuen Chat der vollständig konfigurierte Kontext
  frisch geladen.
- **Verboten:** Rückfragen zur Level-2-Einrichtung, konstruierte Optionen,
  inferred Stufe oder Profil und Fortsetzung mit einem nur im Chat behaupteten
  Scope.

### GJ-02a – Mehrere im WebGUI konfigurierte Kursprofile

- **Ausgang:** Das WebGUI hat Mathematik LK und Physik GK gespeichert.
- **Erwartung:** Der Coach liest beide fachbezogenen Profile aus frischem
  Kontext, verändert sie nicht und nutzt nur passende Fokus- und Zieloptionen.
- **Verboten:** ein globales Kursprofil, Überschreiben eines Fachs oder Ableiten
  der Stufe aus LK/GK.

### GJ-03 – Korrekte Orientierung und Fokus

- **Erwartung:** Bei einem neu bestätigten aktiven Ziel beginnt die erste
  inhaltliche Antwort mit dessen exaktem lokalisierten `activeGoal.title`, zum
  Beispiel „Dein aktuelles Lernziel ist: <Titel>.“; die Beschreibung ersetzt
  den Titel nicht. Zieloptionen stammen ausschließlich aus dem passenden
  fokussierten Unterbaum.
- **Verboten:** Ziele aus früheren Stufen oder aus der gesamten
  Mathematikwurzel.

### GJ-03a – Aktiver Motivationsdialog

- **Ausgang:** Ein bestätigtes Motivations- oder Orientierungsziel ist aktiv.
- **Erster Coachzug:** exakter Lernzieltitel, zwei bis vier konkrete und
  altersgerechte Möglichkeiten sowie ehrliche positive Perspektiven; danach
  eine persönliche, niedrigschwellige Interessenfrage ohne fachlich richtige
  oder falsche Antwort.
- **Lernendenantwort:** nennt nur eine angebotene Möglichkeit, zum Beispiel
  „Smartphone und KI“.
- **Zweiter Coachzug:** greift genau dieses Interesse auf, verbindet es mit ein
  bis zwei konkreten Dingen, welche die lernende Person damit verstehen,
  erkunden, gestalten oder tun kann, und stellt eine aktive persönliche
  Anschlussfrage. Das Orientierungsziel bleibt aktiv.
- **Abschluss:** erst nach einer Antwort auf diese Vertiefung oder nach einer
  ausdrücklichen Bitte, direkt weiterzulernen. Der technische Abschlussmarker
  bescheinigt keine Fachkompetenz.
- **Verboten:** Wissensdiagnose, Begriffs- oder Rechenfrage, Feynman-Teach-back,
  ein pauschales „Spannend“ mit sofortiger nächster Zielliste oder ein
  Zielwechsel allein aufgrund der Interessenwahl.

### GJ-04 – Normaler Coachingzyklus

- **Erwartung:** ein aktives atomisches Ziel, Diagnose des Vorwissens, kleine
  Hinweise, selbstständige Arbeit, Transfer, faire Rekonstruktion alternativer
  Wege und Mastery erst nach ausreichender Evidenz.
- **Wiederaufnahme:** Nach einer Unterbrechung wird derselbe bestätigte
  didaktische Schritt fortgesetzt, nicht ein neuer allgemeiner Erklärdialog
  begonnen.

### GJ-05 – Verified Recall

- **Ausgang:** Der First-Party-Start hat acht heute prüfbare Karten vorbereitet;
  der Test wird zusätzlich mit fünf und zehn vorbereiteten Karten wiederholt.
- **Erwartung:** Genau ein Aufruf von `start_skillpilot_verified_recall` ohne
  modellseitige `goalId` oder `batchSize` liefert den vollständigen
  serverseitigen Batch. Der Coach zeigt exakt alle gelieferten Fragen in der
  gelieferten Reihenfolge und wartet auf alle Antworten. Danach lädt er mit
  genau einem `get_skillpilot_verified_recall_answers` alle Sollantworten,
  akzeptiert fachlich äquivalente Formulierungen und speichert mit genau einem
  `record_skillpilot_verified_recall_results` exakt eine Bewertung je Karte.
  Der Write ist vollständig und atomar; es gibt keine per-card Toolschleife,
  keine zusätzliche manuelle Mastery und keinen weiteren Context-Abruf im
  selben Lernendenzug. Die genau eine bestätigte Backend-`continuation` wird
  unverändert und sofort umgesetzt, ohne sie auf eine lokale Fallliste zu
  reduzieren und ohne auf ein inhaltsfreies „weiter“ zu warten.
- **Verboten:** eine Teilmenge wie fünf von acht Fragen zeigen, IDs oder
  Reihenfolge selbst bestimmen, nach einzelnen Karten lesen oder schreiben,
  Erfolg vor dem atomaren Receipt behaupten oder nach dem Recall stehenbleiben.

### GJ-06 – Prüfung

- **Erwartung:** unveränderte Aufgabe, keine Hilfe oder Nachfrage, Auswertung
  erst nach vollständiger Abgabe, Teilpunkte nach Raster, gleichwertige
  Lösungswege anerkannt.

### GJ-07 – Langdialog und Rehydration

- **Ausgang:** mindestens 10 bis 20 Dialogzüge, Nebenthema, Reload oder
  simulierter Kontextdruck.
- **Erwartung:** derselbe Backendlernzustand wird mit der noch gültigen
  Lernsession frisch geladen; keine alte Option wird mutiert.

### GJ-08 – Aktionshorizont, Ablauf und Erneuerung

- **Ausgang:** weniger als `PT1H` Restlaufzeit, abgelaufene oder widerrufene
  Lernsession oder nicht verfügbare gepinnte Revision.
- **Erwartung:** ausschließlich unveränderte Serverinstruktion und die exakte
  `startUrl` nur, falls sie darin noch nicht enthalten ist; keine Fachantwort.
  Das WebGUI erzeugt nach **Lernen starten** eine
  neue unabhängige Session und öffnet einen neuen Chat. Exakt `PT1H` bleibt für
  eine neue Operation zulässig.
- **Verboten:** Aufforderung zur Eingabe einer SkillPilot-ID oder eines Tokens im
  Chat, unnötige OAuth-Neuverbindung, Wiederverwendung der alten Session oder
  fachliche Fortsetzung im alten Chat.

### GJ-09 – Parallele Lernende und Chats

- **Erwartung:** unterschiedliche UI-Starts und SkillPilot-IDs bleiben strikt
  getrennt; jede Session sieht und mutiert nur ihren zugeordneten Lernzustand.

### GJ-10 – Andere Curricula

- **Erwartung:** derselbe allgemeine Entscheidungszyklus funktioniert ohne
  schul-, bundesland-, fach- oder zielbezogene Code-Sonderregel.

### GJ-11 – Gebundene UI-Aktionen und Cockpit-Grenze

- **Erwartung:** Der Coach nutzt nur Ressourcen des frischen Zustands. Jedes
  neu autorisierte Paar aus Ziel und State-Version löst genau einmal und
  unmittelbar den gebundenen Zielbild-Renderer aus. Wählt die lernende Person
  normale Kartenpraxis, startet der Coach die gebundene Kartenkomponente. Der
  Cockpit-Fallback erscheint nur nach tatsächlichem Komponentenfehler,
  fehlender Berechtigung, ausdrücklichem Cockpit-Wunsch oder Serveranweisung.
  Nur bei anderen optionalen Ressourcen entscheidet der Coach anhand
  allgemeiner fachlicher Regeln zwischen Chat und Cockpit.
- **Verboten:** eine verpflichtende gebundene Aktion überspringen oder
  automatisch wiederholen, eine Ressource oder einen Deep-Link erfinden,
  veraltete Links verwenden, notwendige Cockpit-Interaktion durch Chat ersetzen
  oder ohne dokumentierten Grund ins Cockpit wechseln.

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

## 12. Was ausdrücklich nicht getan wird

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

## 13. Definition of Done

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

## 14. Referenzen

- [OpenAI: Plugin-Architektur](https://developers.openai.com/plugins/concepts/plugins)
- [OpenAI: Skills bauen](https://developers.openai.com/plugins/build/skills)
- [OpenAI: Connectors and remote MCP servers](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- `ai/openai plugin/skillpilot-coach-v1/skills/skillpilot-coach-v1/SKILL.md`
- `ai/openai plugin/skillpilot-coach-v1/skills/skillpilot-coach-v1/references/coaching-policy.md`
- `backend/src/main/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV1McpContractAdapter.java`
- `backend/src/main/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachContextProjector.java`
