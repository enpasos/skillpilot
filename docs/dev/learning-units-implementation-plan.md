# Umsetzungsplan: Lerneinheiten und integrierte Lernkarte

**Stand: 5. November 2026. Arbeitsgrundlage für die Umsetzung.** Dieser Plan ersetzt den
[vorherigen Neustartplan](curriculum-recognition-restart-plan.md) als Arbeitsgrundlage.
Der alte Plan und [PR #79](https://github.com/enpasos/skillpilot/pull/79) bleiben als
Historie und Bausteinbestand erhalten. Ein geprüftes Konzept, lokale Browserprüfung,
grüne CI, Deployment und tatsächlich beobachteter Coachablauf sind verschiedene Nachweise.

## 1. Ergebnis und Reihenfolge

Wir führen das akzeptierte rekursive **Lerneinheitenmodell** ein und bauen die
angebotenen Curricula darauf um: zuerst **Mathematik**, anschließend jeweils
separat **Physik → Chemie → Biologie**. Der Mathematik-Meilenstein bedeutet den
vollständigen Fachumbau innerhalb der zu Beginn erfassten Angebote, nicht das
Fertigstellen einer einzelnen Demonstration. Wirtschaft gehört nicht zu diesem Auftrag.

Das vollständige bestehende Cockpit bleibt die Basis. Die neue Karte kommt als
zusätzliche Navigation neben den Baum. Zielkarte, Lernzielbild, Tachos, Prüfungen,
Kartenübungen, Coachstart, Einstellungen und Datenverwaltung bleiben erhalten.
Erst erprobte Verbesserungen dürfen später weitere Teile des Baums ersetzen.

Wir liefern früh zwei voneinander unabhängige Ergebnisse:

1. **Karte im bestehenden Cockpit:** mit echten sichtbaren Zielen und bisherigen
   Abläufen, ohne den gesamten Curriculumsumbau abzuwarten.
2. **Eine vollständige echte Lerneinheit:** mit geprüfter Aufgabenbedeutung,
   korrekter Anerkennung und einem beobachtbaren Lernablauf; anschließend Ausbau
   bis zum Mathematik-Fachabschluss.

Grundlage sind [Lerneinheiten](../concept/skill-graph/learning-units.md),
[Anerkennung](../concept/skill-graph/assessment-gated-completion.md),
[Fortschreiten und Zugang](../concept/skill-graph/learning-unit-progression.md),
[Graph Definition](../concept/skill-graph/graph-definition.md) und die
[illustrierte Gesamtdarstellung (PDF)](../concept/skill-graph/skillpilot-graph-definition.pdf).
Dieser Plan konkretisiert die Umsetzung; er eröffnet diese beschlossenen Begriffe nicht neu.

## 2. Ausgangspunkt und ehrlicher Lieferstand

**Fortschreibung vom 5. November:** [PR #80](https://github.com/enpasos/skillpilot/pull/80)
ist mit `e2514eacb595010648ffe50bc4c444ba4553257c` in `main` gemergt.
Der Product Owner meldet Deployment und bestandenen Smoke-Test. Damit ist S0
ausgerollt; die Meldung ersetzt keine darüber hinausgehende Coach-Hostabnahme.
S1 beginnt auf dem neuen Branch `feat/cockpit-learning-map`, direkt auf diesem
frisch abgerufenen `origin/main`. Der vorherige Branch wird nicht fortgeführt.
Die folgende Bestandsaufnahme beschreibt die Ausgangslage dieses Schritts;
eine Vorschau oder ein Merge allein schließen S1 noch nicht ab.

Planungsbasis ist main `8fda13b6505df9f2ba4f8239e1703d8e54d2456e` mit dem akzeptierten
Lerneinheitenkonzept. Der am 4. November erneut gelesene alte Draft-PR #79 ist
offen und ungemergt, Remotehead `802f333f80c58d3409ab5d9fb3e9913fecafbf54`.
Der zusätzliche lokale Checkpoint `4f1241b634c7e399c7651b90425b556acd4610f6`
besitzt darüber hinaus sieben geänderte Testdateien; seine Produktions-,
Canonical- und Viewdateien entsprechen dem alten Remotehead. Beide Quellen
bleiben getrennt. Ihre Ergebnisse gelten nur für die jeweils geprüfte damalige
Revision und Semantik.

| Bestandteil | Heute belegt | Noch zu liefern |
| --- | --- | --- |
| Rekursive Lerneinheiten | Konzept und Formeln beschlossen. | Autoritative Datenbindung, Compiler, Runtime und geprüfte echte Einheiten. |
| Karte im vollständigen Cockpit | Vorschau auf main; native Produktanbindung mit derselben Baumprojektion entsteht in [PR #81](https://github.com/enpasos/skillpilot/pull/81). | S1-Nachweise am endgültigen Kandidaten und gesonderte Produktionsabnahme. |
| Bisherige Completion-Engine | Vorhandener automatischer Bedarfs-/Erlassmechanismus. | Neue globale Anerkennung aus unveränderlichen lokalen Einheitsverträgen; alte Semantik nicht unverändert übernehmen. |
| Prüfungen und Inhalte | Bestehende Quellen, Aufgaben, Rubriken und QA-Bestände auf main und im alten PR. | Prüfung des neuen Anwendungsanspruchs, Erwerbszuordnung und historische ID-Bedeutung. |
| Fachabschluss Mathematik | Noch nicht erreicht. | Sämtliche angebotenen Auflösungen und ihre erforderlichen Verträge nach diesem Konzept abnehmen. |

Die aktuelle Vorschau und ihre Grenzen stehen in der technischen
Bedienbeschreibung `app/prototypes/full-cockpit-README.md`.
Sie ist keine bereits ausgerollte Runtime und ihre Beispielgruppen sind keine
freigegebene Aufteilung des Mathematikcurriculums.

## 3. Verbindliche Umsetzungskriterien

- **Ein gespeichertes Ergebnis je atomarem Ziel:** ausschließlich binäres M.
  Implizite Anerkennung ergänzt das abgeleitete M_eff global gleichwertig, ohne
  Masteryzeilen für Vorbereitungsziele oder zusätzliche Lernerqualifikationen anzulegen.
- **Eigene und enthaltene Ziele trennen:** Own(U) gehört direkt zur Einheit;
  T(U) enthält dedupliziert auch erforderliche Kinder. Jedes Ziel hat innerhalb
  eines aufgelösten Erwerbswegs eine direkte Heimat. Eltern duplizieren die
  Erwerbszuordnung ihrer Kinder nicht.
- **Eigene Pflichten bleiben explizit:** Prüfungen Q und Karten K werden nie
  implizit bestanden. Ein bestandenes Elternexamen ersetzt weder Kinderprüfungen
  noch deren Recall; offene Elternpflichten öffnen gültige Kinderergebnisse nicht.
- **Anerkennung braucht Anwendung:** Aufgaben und normale Bestehensrubrik müssen
  jede freigegebene wesentliche Kompetenz tatsächlich fordern. `requires`, ein
  Coverage-Feld oder ein aktualisierter Hash beweisen dies nicht allein.
- **Volle transitive Nachfrage und minimale Kanten:** durch explizit gemeisterte
  Zwischenziele und externe Unterstützung hindurch rechnen. I nicht erneut in
  die lokale Anerkennungsableitung einspeisen. Gewöhnliche ungedeckte Endpunkte
  sind Fehler; M=0 darf nicht plötzlich Fachkompetenzen anerkennen.
- **Globale Gleichwertigkeit:** gültige Anerkennung erfüllt spätere Voraussetzungen
  und bleibt bei Fokus-, Fach- und Lehrplanwechsel erhalten. Der aktuelle
  Zielumfang bestimmt den Fortschrittsnenner, nicht die Existenz gültiger Ergebnisse.
- **Planung getrennt zählen:** Gesamtfortschritt einschließlich gültigem I;
  Tages-/Wochenkontingent nur tatsächliche explizite Ereignisse. Die vorhandene
  explizit-only-Präferenz betrifft die Plananrechnung, keine fachliche Aberkennung.
- **Zugang nicht nebenbei verändern:** die technische Sperrwirkung von
  Ganz-Einheits-Voraussetzungen ist offen. Neue Gruppierungen erzeugen keine
  pauschalen Gates; der bestehende bewusste Direktprüfungszugriff bleibt erhalten.

## 4. Lieferstufen und Abnahmen

**Verbindlich für jede Stufe S0–S5 und für jedes einzelne Fach in S5:** Der
konkret reviewte, committed Kandidat muss mit der bestehenden produktiven
Konfiguration build- und deploybar sein und die vorhandenen produktiven Abläufe
erhalten. Keine Stufe darf eine spätere Stufe zur Reparatur oder Fertigstellung
des produktiven Pfads voraussetzen. Diese Bedingung gilt zusätzlich zu jeder
Abnahme in der folgenden Tabelle.

Beschlossene Korrekturen wie globale Anerkennung und getrennte Gesamt-/
Periodenanrechnung werden ausdrücklich als beabsichtigte Verhaltensänderungen
benannt und gegen ihre neuen Sollwerte geprüft. Funktionserhalt konserviert
keine abgelöste Semantik. Unfertige Erweiterungen bleiben außerhalb des
produktiven Pfads. Zusätzliche Flags oder Konfiguration sind dafür keine
pauschale Pflicht; falls nötig, werden sie begründet und bewusst entschieden.

Zur Fertigmeldung gehören die für das Delta angemessene Regression der
bisherigen Cockpit-, Baum-, Plan-, Prüfungs-, Karten-, Mastery-, Coach-, Session-,
Personalisierungs- und Datenabläufe sowie der Release-Preflight am konkreten
Kandidaten. Bei betroffenen Daten oder Verträgen werden Migration und Rollback
reviewt; die erforderliche CI muss am exakten Commit terminal grün sein.
Eine bestandene Prototypprüfung ersetzt diese Nachweise nicht. Deploybarkeit,
tatsächlicher Rollout und echte Hostabnahme bleiben getrennte Nachweise;
die Meilensteinabnahme autorisiert kein Deployment.

| Stufe | Konkretes Lieferstück | Abnahme / sichtbarer Nachweis |
| --- | --- | --- |
| **S0 – gesicherter Neustart** | Neuer Branch und Draft-PR; dieser Plan; inventarisierte Nachnutzung; geprüfte lokale Cockpit-Erweiterung gesichert. | Benannte Commits, klare Grenze zum alten PR und keine ungesicherte mehrtägige Gesamtänderung. |
| **S1 – Karte im Produkt-Cockpit** | Baum im vorhandenen Navigationsbereich, Lernkarte als Vollfensteransicht aus dem Hauptbereich, beide mit nativen Daten; Originalhauptinhalt und Aktionen bleiben bestehen. | Echte aufgelöste Lehrplanansicht, Zielwahl ohne Aktivwechsel, Reveal/Fokus/Fachwechsel, Zustandserhalt, mobile Bedienung und frühe Owner-Demo. Eigener kleiner PR, CI und separater Rolloutkandidat. |
| **S2 – erster geprüfter Einheitsvertrag** | Kleine reale Mathematikeinheit mit stabiler Placementbindung, Own/Children/Q/K, geeigneter Einführung, Quellen, Aufgaben/Rubrik und historischer Ergebnisentscheidung. | Native Angebotsauflösung und unabhängiges fachliches Gegenbeispielreview; kein bloßer Demo-Snapshot. |
| **S3 – vollständiger Einheitsablauf** | Minimale gemeinsame Compiler-/Runtimebasis und die Einheit aus S2 durch Cockpit, Coach, Prüfung, Recall soweit erforderlich, Anerkennung, Frontier und Plan. | Durchgängige Demo an derselben veröffentlichten Revision; gespeichertes M und abgeleitetes I sichtbar unterscheidbar, fachlich gleichwertig. CI, Deployment und echte Claude-Abnahme getrennt nachweisen. |
| **S4 – Mathematik vollständig** | Alle tatsächlich angebotenen Mathematikauflösungen in sinnvolle rekursive Einheiten überführt und fachlich/technisch geprüft. | Fixiertes Angebotsinventar vollständig grün, kein ungedeckter Rest, alle erforderlichen QA-/M7-/Releasegates, unabhängiges Review und freigegebener Fach-Rollout. |
| **S5 – weitere Fächer** | Physik, danach Chemie, danach Biologie mit derselben Engine und eigenen Inhalten/Verträgen. | Je Fach eigene Angebotsliste, Inhaltsabnahme, Regression und Rollout. Mathematik bleibt unabhängig freigabefähig und nutzbar. |

S1 und die fachliche Arbeit an S2 können parallel laufen. S3 braucht den
freigegebenen Vertrag aus S2; der allgemeine Mechanismus wird an dieser einen
realen Einheit fertiggestellt, bevor breite Inhaltskorrekturen anlaufen.
Ein geschlossener kleiner Block wird jeweils zuerst reviewt, committed und
gegen CI geprüft. Ein lokales Beispiel allein wird nicht als S4 berichtet.

### S1: Karte als ergänzende Navigation

Die bereits vorhandenen Scoped-Tree-Daten sind die gemeinsame Quelle. Die Karte
liest dieselben sichtbaren Mitglieder, authored Kinder, Auswahl, aktives Ziel,
expliziten Ergebnisse und gültigen impliziten Ergebnisse. Sie führt keine eigene
Personalisierung, Frontier oder Abschlussberechnung ein.

Einzelklick/Enter wählt das betrachtete Ziel; das aktive Lernziel wechselt nur
über den bisherigen expliziten Backendweg. Hinein-/Auftauchen verändert keinen
Lernfokus. Bestehende Reveal- und Plansprünge führen zuverlässig zum richtigen
sichtbaren Ziel. Bild und vollständige Details erscheinen weiterhin genau einmal
in der Original-Zielkarte. Reine Fokusbewegung löst keine Auswahl aus.

Für die neue Lerneinheitenprojektion werden zwei Kantenbedeutungen unterschieden:
bewusst authored Ganz-Einheits-Voraussetzungen und bloße Zusammenfassungen
atomarer Anforderungen. Die zweite Art ist Kontext, kein Vollabschluss-Gate.
Inverse Pfeilrichtung zeigt den möglichen Lernfluss. Temporäre fehlende Daten,
Scopeänderung, Suche und Layoutfehler brauchen klare lokale Zustände.
Zusammenfassungen bewahren die Herkunft zu ihren atomaren Kanten; ausgeblendete
Unterstützung bleibt als Kontext erklärbar, ohne in den Zielnenner aufzurücken.
Ein Navigationsbereich heißt erst dann Lerneinheit, wenn diese Rolle fachlich
gebunden ist. Die vorhandenen Ergebnisanzeigen werden in S1 korrekt als
bisherige Projektion verwendet, nicht als schon implementierte globale Anerkennung
aus S3 ausgegeben.

Die lokale Snapshot-Aufbereitung wird durch einen Produktadapter ersetzt.
Fetch-, EventSource- und Storage-Testadapter gelangen nicht in den Produktpfad.
ELK-Layout, Culling und Kamerahistorie bleiben wiederverwendbare Darstellungstechnik.
Die neue Ansicht darf zunächst ohne vollständige curriculare Lerneinheiten mit
der vorhandenen geprüften Hierarchie arbeiten; sie behauptet dadurch noch keine
neuen Abschlussverträge.

### S1: Bedienung und Nachweise des Produktkandidaten

[PR #81](https://github.com/enpasos/skillpilot/pull/81) ergänzt den Produktadapter.
Der Baum bleibt dauerhaft im Lernzielmenü. Nach Owner-Vorgabe vom 9. November
2026 steht **Lernkarte** im Hauptbereich oben rechts neben **Lernen starten** und
öffnet die zusätzliche Navigation als Dialog über das ganze Fenster; ein
Schließen-Kreuz oder Escape führt zurück ins Cockpit. Erst beim ersten Öffnen
werden die Karte und ihre Layouttechnik geladen. Einzelklick oder Enter wählt
ein Ziel für die gewohnte Zielkarte, ohne die Karte zu schließen; danach zeigen
Zielkarte und Baum dieses Ziel. Beim erneuten Öffnen bleibt die zuletzt gezeigte
Kartenebene erhalten, solange zwischenzeitlich kein anderes Ziel gewählt oder
angesteuert wurde.
Doppelklick oder der eigene Öffnungsknopf führt in einen Bereich, Shift mit
Doppelklick wieder hinaus. Blattziele besitzen keinen Öffnungsknopf.
Auswahl und Zoom setzen weder Mastery noch Lernfokus oder aktives Ziel.

Bereiche zeigen die vorhandene sichtbare Hierarchie. Zusammengefasste Pfeile
sind beschreibende Graphbezüge; zusätzliche Voraussetzungen und deren Herkunft
lassen sich bei Bedarf aufklappen. Dadurch entstehen keine neuen Lerneinheiten
oder Ganz-Einheits-Sperren. Ergebnisanzeigen verwenden weiterhin den bestehenden
Backendstand; S3-Anerkennung wird damit nicht vorweggenommen.

Die native Prüfung beginnt bei `index.html` und `App`, ohne Prototyp-Adapter.
Abgeschottete Test-HTTP-Antworten prüfen Bedienung und Zustandsisolation;
zusätzlich vergleicht ein Test die Kartenprojektion mit der aktuell hinterlegten
hessischen Mathematikansicht Sekundarstufe II LK. Beides ist von einer echten
Produktions- oder Coach-Hostabnahme zu unterscheiden.

Relevante Befehle in `app/` sind `npm run test:learner-map`,
`npm run test:learner-cockpit-startup` und `npm run test:learner-learning-plans`.
Nach dem normalen Produktionsbuild prüft `npm run test:learner-map-build` die
tatsächlich erzeugten Karten-/Workerdateien und deren Ausschluss vom
Start-Precache. Diese Prüfungen sind im Frontend-CI-Pfad eingebunden.
S1 benötigt keine neuen Backend-, Datenbank-, Curriculum- oder Pluginverträge
und keine zusätzliche Betriebskonfiguration. Beim Rollout bleiben der normale
Release-Preflight und ein Smoke-Test einschließlich Baum/Karte, Zielwahl,
Prüfung, Kartenübung und Plan erforderlich. Ein Kartenfehler muss lokal bleiben
und die Rückkehr zum Baum erlauben.

### S2: zuerst eine fachlich kleine echte Einheit

Primärer Prüfauftrag ist der vorhandene **Skalarprodukt-/Projektionsausschnitt**
mit A=`3016ec37-1c2e-47db-83f5-e767923bc97e` und
Q=`e98672c6-871a-5d0b-889c-5afc51040f0d`. Aktuelle direkte/subtree Referenzen
weisen zunächst auf **Hessen Sekundarstufe II LK**, nicht auf eine vorausgesetzte
GK-Zuordnung. Die tatsächliche native Angebotsauflösung ist noch zu prüfen.
Das vorhandene Memoryreview von A nennt `no_memory_needed`; daraus folgt keine
Befreiung fremder Karten oder weiterer Ziele.

Vor Implementierung müssen fünf Dinge belegt sein: eine passende echte
Einheitsgrenze mit Erwerbszuordnung; vollständige eigene Q/K und Kinder;
normalisierte externe Unterstützung; passende normale Aufgabe/Rubrik für
selbständige Anwendung; stabile historische Prüfungsbedeutung. Ein positiver
Rechenfall und der alte Zwei-Ziel-Pilot beweisen den neuen Anspruch nicht.
Einführung und verständliches Lernversprechen dürfen ohne neue künstliche
Motivationsatome beschrieben werden.

Der bisher vorgeschlagene größere Bereich Q2.4 „Matrizen und Übergangsprozesse“
bleibt ein nachfolgender Kandidat. Seine 15 Fachziele und das breite bestehende
Kartendeck dürfen den ersten sichtbaren Lernablauf nicht unnötig vergrößern.
Wenn der kleinere Kandidat fachlich nicht trägt, wird die Grenze oder Aufgabe
begründet korrigiert; eine begrenzte Alternative wird ausdrücklich benannt,
statt unbemerkt immer weitere Curricula zu bearbeiten.

### S3: minimale gemeinsame Architektur

1. **Datenvertrag festlegen:** vorhandene Program-/Placement-/Compositiondaten
   verwenden. Sie besitzen bisher keinen vollständigen Own-/Children-/Q-/K-Vertrag.
   Eine kleine Schemaentscheidung benennt die minimal nötige Ergänzung,
   stabile Unit-Referenzen, gewählte Pflichtkinder und getrennte Zugangsmetadaten.
   Keine zweite kopierte Zielhierarchie und keine gepflegten Erlass-Ziellisten.
   Schema-/Loader-/Exportversionen müssen unbekannte Abschlusssemantik erkennen;
   still ignorierte neue Felder dürfen bei alten Consumern keinen falschen Abschluss erzeugen.
2. **Statisch kompilieren:** Mitgliedschaft, Ownership, Quellenrollen, Karten,
   vollständige atomare Anforderungen, Aufgaben und Rubriken an unveränderliche
   veröffentlichte Vertragsrevisionen binden. Referenzen, Zyklen, transitive
   Minimalität, lokale Verbraucher und bei Blockfolge deren Realisierbarkeit prüfen.
3. **Einheitlich auswerten:** der bisherige Mastery-Bedarfsstopp wird für diese
   Anerkennung ersetzt. Ein kohärenter Lernenden-/SRS-Snapshot liefert M und
   daraus M_eff aus allen dafür gültigen lokalen Verträgen. Die globale
   Vertragsgeltung hängt nicht von einem früheren Scopebesuch ab.
4. **Bestehende Abläufe anschließen:** Voraussetzungen, notwendige Arbeit,
   freiwillige Vertiefung, Fokusabschluss/-weitung, Gesamtfortschritt und Plan
   verwenden denselben Backendstand. Kinder und Eltern schließen rekursiv;
   ungeprüfte oder unaufgelöste Verträge gelten nicht als erledigt.
   API und UI behalten die getrennte Herkunft M/I für Icons, Export und Historie;
   M_eff dient der fachlichen Erfüllung. Den eigenen Compiler-/Evaluatorcache des
   Planpfads gemeinsam mit dem normalen Completionpfad umstellen.
5. **Coach und Betrieb abnehmen:** gemeinsame Skills nutzen veröffentlichte
   Backendoptionen, nennen konkrete Einheit/Prüfung und verlangen Zustimmung
   vor Zielwechsel. Ausführliche normale Prüfungsbewertung bleibt bestehen.
   Instruktionen gehören nicht in eine Startup-Nachricht.

Statische Verträge werden nach Artefaktdigest und Semantikrevision gecacht;
Q/K-Rückwärtsindizes begrenzen dynamische Neuberechnung. Pro relevantem Vertrag
genügt eine lineare Traversierung über Knoten/Kanten; keine quadratische
Transitivitätsmatrix oder kalte Gesamtkompilierung je Anfrage. Dynamische
Snapshots benötigen Lernendenrevision, zuverlässigen SRS-Bezug, begrenzte Caches
und getestete Invalidierung. Messwerte für Kaltstart, warme Anfragen und große
aktuelle Angebote vor und nach der Änderung dokumentieren; erst daraus werden
begründete Regressionsgrenzen vereinbart.

### Konkrete technische Arbeitspakete

| Paket | Bestehende Ansatzpunkte und notwendige Ergänzung |
| --- | --- |
| Produktkarte | `App.tsx`, `LearnerView.tsx`, `treeProjectionRuntime` und `compositionViewRuntime`: echten Adapter anschließen; `FullCockpitMap` ist bisher nur lokal. UI-Tests ausdrücklich in einen passenden CI-Pfad aufnehmen und Worker-/Assetbuild prüfen. |
| Format und Kompilierung | `ProgramUnit`, `GoalPlacement`, Runtime-/Composition-/Paketschemata und Authoringwerkzeuge; vorhandene `CompletionProfileCompiler`, `CompiledCompletionGraph` und `CompletionCanonicalGraphResolver` wiederverwenden. Neue Einheitsbedeutung explizit versionieren. |
| Gemeinsame Lesesicht | `LearnerService`, `UnifiedLearnerStateResponse`, `MasteryResponse`, `CoachStateProjection` und `CoachToolFacade`: kohärenten M-/I-/M_eff-Snapshot bis zur normalen Frontier und Fortsetzung tragen. Der bisherige Name `computeEffectiveMastery` allein belegt diese neue Semantik nicht. |
| Planung | `LearnerLearningPlanService`, `LearningPlanCompletionProjection`, `UnifiedLearningPlanStatusCalculator`: neuen Kern statt einer abweichenden zweiten Berechnung verwenden; explizite Ereignisse erhalten. |
| Coach und Release | Gemeinsame Skills, `ClaudeV1CompletionContractRegistry` und vorhandene Task-/Sessionprüfungen: geprüfte Bedeutung und Versionsbindung gemeinsam aktualisieren, veröffentlichte Pluginbytes bewahren. |
| Fachprüfung und CI | Graph-/Composition-/Schema-/Packagechecks, bestehende Completion-/Frontier-/SRS-/Plan-/HTTP-/PostgreSQL-Tests sowie `assessment-completion.yml`: neue Vertragsdateien und Prüfungen tatsächlich ausführen. Alte Gegenmodelltests gezielt ersetzen. |

Die frühere automatische Semantik trägt heute ausdrücklich die Version
`direct-demand-stops-at-mastery-v1`. Tests wie
`masteredIntermediateStopsDemandFromAnOpenAssessment` und
`anAssessmentFreeScopeCompletesWithoutAnyStoredMastery` sichern das Gegenmodell;
sie dürfen nicht als unveränderliche neue Sollwerte weiterlaufen.

## 5. Mathematik systematisch und vollständig umbauen

Zu Beginn der Umsetzung entsteht aus dem tatsächlichen Backend-/Plannerangebot
ein versioniertes Inventar: Land, Stufe, Dauer, Kursprofil/Kursunion,
aufgelöste Targets/Support, erforderliche Einheiten und deren Own/Q/K/Children.
Dateizahlen und alte Angebotszahlen ersetzen diesen Nenner nicht. Gemeinsame
kanonische Ziele werden nicht pro Land kopiert.

Pro fachlichem Paket werden zuerst sinnvolle kleine Erwerbseinheiten begründet,
dann Eltern/Aggregate und gegebenenfalls echte Syntheseprüfungen. Bestehende
Quellen- und Inhaltsnachweise für unveränderte Inhalte bleiben nutzbar; neue
Grenzen und neue Anwendungsansprüche werden zusätzlich geprüft. Kalenderjahr,
Clustername und Darstellung erzeugen allein keinen Abschlussvertrag.

Breite Kartenziele brauchen ehrliche Ownership: eine passende größere Einheit
oder eine fachlich geprüfte Aufteilung mit stabilen Karten-/Zielidentitäten und
Evidenzmigration. Karten nicht zum Elternknoten verschieben oder verkürzen,
um künstlich fertige kleine Kinder zu erhalten. Eine spätere Einheit darf
bereits erworbene Kompetenzen anwenden, ohne deren Erwerb neu zu verbuchen.

Jedes Paket schließt mit deterministischen Strukturprüfungen und unabhängiger
Aufgaben-/Rubrikprüfung. Gleiche Vertragsbedeutungen dürfen ein Inhaltsreview
teilen; jede tatsächlich angebotene Projektion bleibt maschinell zu prüfen.
M7 ist maschinelle QA und ersetzt weder dieses Inhaltsreview noch menschliche
Erprobung oder einen Nachweis der Lernwirksamkeit.

## 6. Alten PR gezielt nachnutzen

Die neue statische Inventur vergleicht die genannte main-Basis mit dem alten
Remote-/Produktionsstand; sie ist kein neu erfolgreicher Angebotslauf:

| Kanonischer Mathematikbestand | main-Basis | Alter PR |
| --- | ---: | ---: |
| Curriculare atomare Identitäten | 807 | dieselben 807 |
| Zusätzliche Prüfungs-IDs | – | 39 |
| Bestehende IDs mit neuer exam-Rolle | – | 35 |
| Registrierte Viewdateien | 88 | 147 |

Die 39 neuen IDs und 35 Rollenwechsel sind unterschiedliche Mengen. Die
unveränderten 807 curricularen Identitäten bleiben unabhängig von der
Ausführungsrolle in der QA-Population. Mehr Viewdateien beweisen noch keine
vollständige native Auflösung oder neue Vertragsfreigabe.

Kein Gesamtmerge und kein pauschaler Cherry-pick des alten Großdeltas. Für jeden
übernommenen Baustein werden Quellref, Dateien, Entscheidung, neue Semantik und
die neue Abnahme im PR dokumentiert. Zuerst prüfen, was bereits auf main vorhanden
ist; bestehende Arbeit wird nicht ein zweites Mal eingeführt.

| Baustein | Geplante Behandlung |
| --- | --- |
| Graphresolver, Indizes, Cachebudgets, Task-/Owner-/Revisionsschutz | Vorhandene Basis erhalten; fehlende geeignete Teile isoliert übernehmen. |
| Automatische Mastery-Stopp-/Full-PC-Erlasssemantik | Ersetzen; nicht als neue globale Anerkennung weiterführen. |
| Memory-Klassifikation, Taskbereitschaft, Fokus-/Composition-/Kursunionkorrekturen | Eng prüfen und nachnutzen; kein Ersatz für Inhaltsprüfung oder Erwerbszuordnung. |
| Prüfungsaufgaben, Rubriken, Quellen-/Placementgeneratoren | Paketweise prüfen; passende vorhandene Aufgaben erhalten, Lücken gezielt verbessern. |
| Bestehende Verständnis-ID wird im alten PR zum Exam | Alte ID/M-Bedeutung bewahren; stärkerer Anspruch bekommt grundsätzlich eigene Prüfungs-ID. Gleichbedeutende historische Ausnahmen einzeln belegen. |
| Semantisches Ledger, QA-Populationsresolver, deterministische Strukturtests | Erhalten und auf Einheits-/Own-/Kind- und tatsächliche Angebotsprüfung erweitern. |
| Gesamt-/Periodentrennung, Restart-/Provider-/Browserfixtures | Wiederverwenden und neue Sollwerte/Identitäten einsetzen. |
| Alte M7-/N6-/CI-Berichte und PDFs | Historische Belege referenzieren; nicht als neue erfolgreiche Abnahme kopieren. |
| Neue lokale Karte und bewährte Original-Cockpitkomponenten | Darstellungstechnik und bestandene Zustands-/Mobile-Tests nachnutzen; Testtransport durch native Datenbindung ersetzen. |

`MemoryGoalClassification`, `ExamTaskReadiness` und `AssessmentTaskContract`
sind Beispiele für im alten PR vorhandene Ergänzungen, die auf der genannten
main-Basis noch fehlen. Sie werden getrennt vom bereits vorhandenen Resolver
bewertet. Taskbereitschaft oder sicherer Prüfungsstart sind keine zusätzliche
gespeicherte Lernendenqualifikation und ersetzen keinen Anwendungsnachweis.

Das Einzelinventar der früheren ID-Umtypisierungen im
[alten Neustartplan, Abschnitt 6](curriculum-recognition-restart-plan.md#6-wiederverwendung-und-zwingende-id-migration)
bleibt Recherchehilfe. Die Liste ist keine bereits getroffene Migrationsentscheidung.

## 7. Gemeinsame Abnahmematrix

| Bereich | Wesentliche Fälle |
| --- | --- |
| Anerkennung | Q→B→A auch durch gemeistertes B; mehrere lokale Verbraucher; externe spätere Prüfung; M=0; keine impliziten Q/K; ungedeckte Fachendpunkte sind Fehler. |
| Rekursion | Pure Aggregate; eigene Elternsynthese; fertiges Kind bei offener Elternprüfung; bestandene Elternprüfung bei offenen Kinderprüfungen/Karten; Deduplizierung und eindeutige Ownership. |
| Historie | Alter gültiger Pass behält Bedeutung ohne zweiten Pass; erweiterter Anspruch erhält keine rückwirkende Anerkennung; keine Waiver-Materialisierung als M. |
| Scope und Daten | Native Angebote einschließlich Kursunionen, target/prerequisiteOnly und externer Unterstützung; globale Anerkennung nach Fokus-/Lehrplanwechsel; normale/strikte Voraussetzungen unterscheiden. |
| UX | Alle bisherigen Cockpitelemente erreichbar; Bild genau einmal; Baum/Karte teilen Auswahl; Aktivwechsel nur explizit; Suche, Reveal, mobile Navigation und laufender Drill bleiben korrekt. |
| Coach | Alle passenden Prüfungen backendseitig auffindbar, Paging vollständig; direkter gewählter Start; ausführliche Bewertung; Fortsetzen und Zustimmung zum Zielwechsel. |
| Pläne | Gesamt einschließlich I, Periode ausschließlich explizit; keine zusätzlichen Ereignisse durch Anerkennung; gewählte Anrechnungspräferenz bleibt lokal zur Planung. |
| Betrieb | Konsistente Revisionen, SRS-/Lernerisolation, Kalt-/Warmverhalten, Cacheinvalidierung, Neustart und fehlende Artefakte; Fehler einer unabhängigen Einheit sperren kein anderes Fach pauschal. |
| Deploybarkeit je Meilenstein/Fach | Reviewter Commit mit bestehender Produktionskonfiguration build- und deploybar; Regression und Release-Preflight bestanden, erforderliche CI am exakten Head grün; betroffene Migration/Rollback geprüft, keine Reparatur durch spätere Stufen nötig. |

Für jede geänderte fachliche Freigabemenge gilt zusätzlich der Gegenversuch:
**Kann jemand nach der normalen Rubrik bestehen, obwohl die wesentliche
anerkannte Kompetenz vollständig fehlt?** Falls ja, muss der Vertrag, die
Aufgabe/Rubrik oder die Einheitsgrenze korrigiert werden. Keine Kompensation
durch fachfremde Punkte und keine künstlichen `requires`-Kanten nur für QA.
Die Inhaltsprüfung wird nach den tatsächlich verschiedenen
`D_U(a) = {p ∈ P_U | p R⁺ a}` gebündelt. Jede tatsächlich freigebende Kombination
und erlaubte Aufgabenvariante braucht eine tragfähige normale Rubrik; ein
blindes Durchprobieren aller 2^Q-Teilmengen ist kein vorgeschaltetes Gesamtprojekt.
Das gilt ausdrücklich auch **vor Vollabschluss der Einheit**: Ist D_U(a)
bereits bestanden, kann a anerkannt sein, obwohl eine unabhängige Prüfung oder
Kartenpflicht die Einheit noch offen hält. Review und Tests prüfen deshalb
beispielsweise Q_a bestanden/Q_b offen mit getrennten Kompetenzen A/B; sie
warten nicht pauschal auf alle Q/K. Anerkennung und Gesamtabschluss bleiben getrennt.

## 8. Migration, Rollout und Arbeitsweise

- Arbeit auf neuem Branch ab aktuellem main, mit kleinen nachvollziehbaren
  Commits und Draft-PR. Der neue PR darf zunächst Plan und geprüfte Vorschau
  sichern; sein Titel und Status behaupten keine fertige Runtime.
- **6.1 Sol Ultra** übernimmt technische Bestandsaufnahme, Implementierung,
  Generatoren und Tests. **Astra Ultra** übernimmt grundlegende Analyse,
  Einheits-/Prüfungsbedeutung und unabhängige Reviews. Ein Review erzeugt keine
  Produktionsfreigabe für ungeprüfte andere Inhalte.
- Keine Umschreibung bestehender Lerner-Mastery durch den Curriculumsumbau.
  Alte falsche Erlasse werden nicht in explizite Ergebnisse umgewandelt.
  Gültige historische Verträge bleiben rekonstruierbar; Rückrollen darf nicht
  still gültige anerkannte Kompetenzen verlieren lassen.
- Bei fehlendem/ungültigem neuen Vertrag keine neue Anerkennung behaupten;
  verlässliche explizite Ergebnisse und sichere normale Lernwege erhalten.
  Gemischter Alt-/Neustand braucht eine ausdrücklich getestete Semantikgrenze,
  keine unbemerkte pauschale Abschaltung des bisherigen Angebots.
- Backend, WebGUI und nötige gemeinsame Coach-/Pluginartefakte werden als
  zusammenpassende konkrete Kandidaten geplant. Claude zuerst, reale Hostabnahme
  gesondert. Andere Provider nutzen denselben fachlichen Vertrag; kein zweiter
  fachlicher Kern und keine schwächere Ersatzfunktion als dauerhafte Architektur.
- Nach jedem Lieferstück: lokale relevante Tests, unabhängiges Review, Commit,
  Push und terminale CI am konkreten Head. Deployment/Marketplace-Veröffentlichung
  und Owner-Abnahme bleiben ausdrücklich ausgewiesene eigene Schritte.

Der Fortschrittsbericht nennt pro Lieferung **implementiert, lokal geprüft,
inhaltlich reviewt, CI grün, deploybar, ausgerollt, im echten Host beobachtet**.
**Deploybar** nennt den konkreten Commit und die Nachweise aus Abschnitt 4. Für Mathematik
kommen erledigte/offene Einheiten und Angebote aus dem fixierten Inventar hinzu.
Nenneränderungen werden erklärt. Keine schwankenden geschätzten Gesamtprozente
anstelle fertiger, sichtbar demonstrierbarer Ergebnisse.

## 9. Nächster ausführbarer Schritt

S0 ist ausgerollt. Jetzt S1 an eine echte aufgelöste Mathematikansicht anbinden,
mit einem eigenen PR sowie den Funktions- und Deploybarkeitsnachweisen aus
Abschnitt 4. Anschließend beziehungsweise unabhängig parallel für den benannten
kleinen S2-Kandidaten einen vollständigen Vertragsbefund erzeugen. Vor größerem
Inhaltsausbau steht die erste tatsächliche Owner-Demo. Die genaue technische
Sperrwirkung von Einheitszugängen wird als separate Produktentscheidung behandelt
und blockiert diese beiden Lieferstücke nicht.
