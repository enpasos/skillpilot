# Tagesfortschritt: zuerst das Tagespensum, danach freiwillig mehr

Stand: 11. September 2026. Diese Norm gilt für die persönlichen Fachpläne im
Cockpit und ihre sichere Projektion für die SkillPilot-Coaches. Das Backend
berechnet die Zahlen; Oberfläche und Coach stellen sie dar. Fachliche
Mastery-Entscheidungen und Voraussetzungen ändern sich dadurch nicht.

## Lernendensicht

Das Tagespensum ist eine Anzahl pro Fach, keine starre Liste bestimmter Ziele.
Ein heute wirklich abgeschlossenes, bereits fälliges Matheziel zählt zuerst
zum Mathe-Pensum, auch wenn es ursprünglich für einen früheren Tag geplant war.
Zusätzliche Matheabschlüsse ersetzen kein noch offenes Physik-Pensum.

Beispiel: Das Mathe-Pensum beträgt 2 Ziele, zusätzlich liegen 3 offene Ziele
außerhalb dieses Pensums vor. Die bearbeiteten Ziele dürfen ältere Ziele sein.

| Echte Abschlüsse heute | Tagesanzeige | Zusätzlich geschafft | Weitere offene Planziele |
| --- | --- | --- | --- |
| 0 | 0 von 2 geschafft | 0 | 3 |
| 1 | 1 von 2 geschafft | 0 | 3 |
| 2 | 2 von 2 geschafft | 0 | 3 |
| 3 | 2 von 2 geschafft | 1 | 2 |

Die erste Priorität ist ein erreichbares Tagesziel. Nach dessen Erfüllung
würdigt der Coach den Erfolg und bietet eine Pause oder freiwilliges
Weiterlernen an. Weitere offene Planziele bleiben einsehbar, werden aber nicht
als zusätzliche Pflicht an jede Fortschrittsmeldung angehängt.

Ein Tag ohne vorgesehenes Pensum, etwa ein Wochenende, heißt „Heute kein festes
Pensum“, nicht „Alles geschafft“. Freiwillige Abschlüsse an diesem Tag sind
Zusatzfortschritt. Tagespensum erfüllt bedeutet weder Gesamtplan abgeschlossen
noch gesamte Fachkompetenz gemeistert.

## Autoritative Berechnung

Der Kalendertag wird serverseitig in `Europe/Berlin` bestimmt. Pro gültigem
Fachplan berechnet `LearnerLearningPlanService.dailyMetrics` folgende Mengen:

- `D`: eindeutige atomare Ziel-IDs, die laut unverändertem Terminplan bis heute
  fällig sind;
- `Y`: entsprechende Menge bis gestern;
- `S = |D ohne Y|`: ursprünglich für heute hinzukommende Zielanzahl;
- `O`: aktuell noch nicht gemeisterte Ziele in `D`;
- `C`: eindeutige Ziele in `D`, für die heute ein echtes Abschlussereignis
  vorliegt und deren aktuelle Mastery weiterhin mindestens `0.9` beträgt.

Die Werte sind:

```text
Tagespensum             Q = min(S, O + C)
Heute angerechnet       A = min(Q, C)
Heute noch offen        R = Q - A
Zusätzlich geschafft   E = C - A
Weitere offene Ziele   B = O - R
```

Bei normalen heutigen Abschlüssen sinkt `O` genau so weit, wie `C` steigt.
Dadurch bleibt `Q` stabil. Der Nenner schrumpft nicht bei jedem Erfolg.
Die Begrenzung verhindert ein unerfüllbares Pensum, wenn insgesamt weniger
offene Arbeit vorhanden ist als ursprünglich geplant.

Planänderungen, nachträgliche Mastery-Korrekturen oder Importe können die
verfügbare Arbeit und damit die berechnete Quote verändern. Diese Eingriffe
sind keine normalen Lernabschlüsse. Die Quote ist eine nachvollziehbare
Berechnung über den aktuellen Plan, kein zusätzlich gespeicherter Tagesplan.

`B` ist ein **Restbudget außerhalb des noch offenen Tagespensums**, keine
Zählung exakt jener Ziel-IDs mit vergangenem Fälligkeitsdatum. Der bisherige
API-Name `openOverdue` bleibt aus Kompatibilitätsgründen erhalten. Sichtbare
Texte dürfen daraus nicht „so viele Ziele sind kalendarisch überfällig“ machen.
Ein Abschluss wird nicht gleichzeitig vom Tagespensum und vom Restbudget
abgezogen. Erst Zusatzarbeit reduziert dieses verbleibende Budget.

Die Terminverteilung und die Zielreihenfolge bleiben unverändert. Auswahl und
Wechsel verwenden weiterhin nur gültige Pläne und die normale `requires`-
Frontier. Ein noch nicht fälliges Ziel oder ein Ziel eines anderen Fachs
erfüllt die Quote dieses Plans nicht. Überlappende Blöcke zählen eine Ziel-ID
nur einmal. Ungültige oder veraltete Pläne liefern keine vermeintlich sicheren
Zahlen und verhindern eine uneingeschränkte Aussage „alles geschafft“.

## Abschlussereignisse statt Änderungszeitpunkte

Die Tabelle `learner_goal_completion` wird durch Liquibase-Änderung
`033-add-learner-goal-completions` angelegt. Ein Ereignis enthält:

- interne Ereignis-ID, Lernendenbezug und Ziel-ID;
- tatsächlichen Zeitpunkt `occurred_at` und daraus abgeleiteten Berliner Tag
  `completion_date`;
- den dabei gespeicherten Mastery-Wert.

Ein Ereignis entsteht nur beim tatsächlichen Übergang von Mastery unter `0.9`
auf mindestens `0.9`. Normale Mastery-Schreibvorgänge und erfolgreich
abgeschlossener Verified Recall benutzen denselben Ledger-Dienst. Gewöhnliche
Kartenwiederholung ohne Mastery-Übergang ist kein Zielabschluss.

Mastery und Ereignis werden in derselben Transaktion unter Lernendensperre
gespeichert. Rollback nimmt beides zurück. Ein eindeutiger Datenbank-Constraint
auf Lernenden-ID, Ziel-ID und Berliner Tag verhindert Doppelzählung, auch bei
Wiederholung, Reset mit erneutem Abschluss am selben Tag oder Retry. Ein
erneuter echter Abschluss an einem späteren Tag kann ein neues Ereignis sein.
Eine aktuelle Korrektur unter die Mastery-Schwelle entfernt den heutigen
Anrechnungsanspruch, nicht das historische Ereignis.

Die Ereignisse sind historische Beobachtungen und werden nicht aus importierten
Mastery-Daten erzeugt. Beim Löschen eines Lernenden werden sie über den
Foreign Key mitgelöscht. Providerprojektionen erhalten ausschließlich die
benötigten aggregierten Zahlen, keine Ledger- oder Lernenden-IDs.

## Historie und Einführung auf einem bestehenden System

`mastery.updated_at` beweist nur eine letzte Änderung, keinen ursprünglichen
Abschluss. Deshalb gibt es **kein Backfill** aus alten Zeitstempeln. Die neue
Tabelle beginnt leer; vorhandene Mastery und Pläne bleiben unangetastet.
Vor Einführung erzielte Erfolge werden nicht nachträglich als sichere heutige
Abschlüsse behauptet. Das betrifft insbesondere einen Erfolg, der am
Deploymenttag bereits vor dem Deployment erzielt wurde.

Der bestehende History-Endpunkt unterscheidet:

- `source = completion_event`: tatsächliches aufgezeichnetes Ereignis;
- `source = legacy_last_updated`: bestehender Mastery-Eintrag mit schwächerem
  Datumsnachweis. Die Oberfläche benennt das Datum als letzte Aktualisierung.

Alte Erfolge bleiben sichtbar. Die Wochenstatistik zählt nur echte Ereignisse
nach Berliner Kalenderwochen; alte Änderungsdaten werden nicht als gemessene
Lerngeschwindigkeit ausgegeben. Die Historie kann außerdem frühere Erfolge
zeigen, die nicht im aktuellen Fachplan liegen. Nur dessen fälliger Umfang
zählt in die Tagesquote.

## Automatische Fortsetzung und ausdrückliche Zusatzarbeit

Automatische Planaktivierung, `reconcile` und die Weiterführung nach einem
Abschluss wählen nur Fächer mit noch offenem Tagespensum. Hat Mathe sein Pensum
erfüllt, darf ein geeignetes offenes Physikziel folgen, aber kein weiteres
Matheziel allein wegen des Restbudgets. Ist Physik blockiert, wird der Blocker
nicht durch ungefragte Mathe-Zusatzarbeit verdeckt.

Nach erfüllten Quoten bleibt die automatische Auswahl leer. Die explizite
Fortsetzungsaktion `resumeExplicitly` und die bewusste Fächerauswahl können
weitere bereits fällige Frontier-Ziele aktivieren. Die technischen Guards
für Zustand, Planrevision, Prüfungen, Session und Berechtigung bleiben erhalten.
Eine ausdrückliche Bitte um Zusatzarbeit berechtigt nicht zu beliebigen
zukünftigen Zielen oder zu einer Umgehung der Voraussetzungen.

Im Chat setzt der Provideradapter die Tagesanweisung bei erfüllter Quote ohne
aktives Ziel auf `complete`, auch wenn `resumeAvailable=true` als Fähigkeit
für freiwilliges Weiterlernen vorliegt. Fähigkeit ist keine Aufforderung.
Ein bereits aktiviertes, unfertiges Ziel bleibt normal bearbeitbar.
Statusfragen oder eine Pause starten auch weiterhin weder eine Aufgabe noch
eine Visualisierung oder eine Mutation.

## Schnittstelle und Vorschau

Bestehende Feldnamen bleiben, ihre Tagessemantik ist jetzt ausdrücklich:

- `dueToday`: Tagespensum `Q`;
- `completedDueToday` bzw. `completedToday`: angerechnete echte Abschlüsse `A`;
- `openDueToday` bzw. `openToday`: verbleibendes Tagespensum `R`;
- neues `extraCompletedToday`: Zusatzabschlüsse `E`;
- kumulative Felder wie `completedDueThroughToday`: aktuelle Mastery der
  kumulativ fälligen Ziele, **nicht** heute neu erreichte Erfolge.

Summen werden fachweise addiert, niemals mit fachübergreifender Verrechnung.
Die WebGUI akzeptiert bei älteren Antworten ein fehlendes Zusatzfeld als `0`,
prüft vorhandene Zusatzwerte aber auf Konsistenz. Backend, sichere
Providerprojektionen, JSON-Schemas und aktuelle Coach-Anweisungen müssen
gemeinsam ausgeliefert werden.

Die Entwurfsvorschau benutzt für heute dieselbe Berechnung mit den vorhandenen
Abschlussereignissen. Zukünftige Tage verwenden dieselbe Quotierungsregel beim
aktuellen Mastery-Snapshot, jedoch ohne erfundene künftige Ereignisse. Es ist
eine Prognose unter unverändertem Lernstand, keine Zusage künftiger Leistungen.

## Automatisierte Nachweise und reale Abnahme

Die Regressionen umfassen unter anderem:

- `LearningPlanDailyProgressTest`: Quote, ältere Ziele, Zusatzarbeit,
  Fachgrenzen, Wochenenden, Tageswechsel und Deduplizierung;
- `LearnerGoalCompletionIntegrationTest` und
  `LearnerGoalCompletionMigrationTest`: echte Writes, atomare Historie,
  Schwellenübertritt, Retry/Reset, Importe, Zeitzone und Migration;
- `LearnerLearningPlanServiceIntegrationTest`, `LearnerServiceTest` und
  `CoachToolFacadeLearningPlanTest`: gleicher Tagesstand, automatische
  Stopps, Fachwechsel, ausdrückliche Zusatzarbeit und Vorschau;
- OpenAI-/Claude-Contracttests: sichere Zahlen und passende Fortsetzung;
- App-API-, Komponenten- und Browsertests: sichtbare Fortschrittsanzeige,
  Erfolgsmeldung, freiwilliger Klick und ehrliche Historienbeschriftung.

Lokale Tests und vorbereitete Plugin-Artefakte sind kein Deployment und kein
Nachweis des tatsächlichen Host-Modellverhaltens. Nach dem regulären Deployment
ist ein kurzer realer Lernlauf in Produktion mit einem dafür vorgesehenen
Testprofil sinnvoll: älteres Ziel abschließen, gleichen Fortschritt in Chat
und Cockpit prüfen, Tagespensum erfüllen, automatischen Stopp beobachten und
freiwillig ein weiteres Ziel starten. Keine echten Lernleistungen zum Test
umetikettieren oder historische Abschlüsse erfinden.
