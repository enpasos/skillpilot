# Unabhängiges Review B – Task V / Issue #197

Stand: 26. November 2026. Geprüfter Diff: `7c921a452c..afdfe229e4` (Checkout `afdfe229e4ace47e0f32802cf9a56a761145c2ef`). Dieser Text ist die eigene, unveränderte Antwort von Reviewer B. Ich habe keine fremden Reviewerantworten gelesen. Kein Branch wurde geändert, kein Commit erstellt und kein Gradle-Lauf gestartet.

**Gesamturteil: CHANGES REQUESTED für die vollständige Zusage des Tasks.** Die Korrektur der normalen Mehrabschnittsauswahl ist schlüssig und beseitigt den konkreten Fokuswiderspruch. Der laufende Arbeitsstand wird bei der Aktivierung jedoch weiterhin nicht mit derselben Eintrittsentscheidung beurteilt wie beim Schreiben. Für allgemeine Studienempfehlungen geht außerdem Kontext verloren. Die pädagogische Bedeutung der zusätzlichen Elternöffnung ist durch den Beschluss vom 22. November allein nicht entschieden.

## Befunde nach Schwere

### B1 – P2: Aktivierung verwirft ein zulässiges laufendes Ziel hinter seiner Öffnung

`LearnerLearningPlanService.java:1680–1687` benutzt für gewöhnliche Pläne weiterhin ausschließlich die unmittelbare Frontier-Zugehörigkeit des laufenden Ziels. Der tatsächliche Schreibpfad benutzt dagegen `resolveLearningPlanEntry`, startet gegebenenfalls die Öffnung und merkt das laufende Ziel als Rückkehrziel vor (`LearnerService.java:11721–11738`, `11763–11766`, `11796–11816`). Die identische Fokusliste macht diese beiden Prädikate nicht gleich.

Gegenbeispiel: Ein Ziel aus einem Kindabschnitt ist bereits in Arbeit; dessen Kindöffnung ist erledigt, die Elternöffnung noch offen. Die Aktivierung eines Blocks mit Kindabschnitt und weiterem Abschnitt speichert künftig den Atomfokus. Unter ihm steht die Elternöffnung in der Frontier, das laufende Ziel selbst nicht. Der Schreibpfad kann den Eintritt trotzdem annehmen. `findPreservedActiveCandidate` liefert leer. Die Aktivierung fällt dann auf die allgemeine Terminauswahl zurück (`LearnerLearningPlanService.java:1055–1063`), die bei einem früher fälligen anderen Ziel dieses auswählt. Damit wird das laufende Ziel nicht als Rückkehrziel erhalten.

Eigene kontrollierte Java-Probe mit der echten privaten Methode: auf HEAD `ordinary-preservation=Optional.empty`, während `learningPlanTransitionAccepts(..., [ongoing])=true`; dieselbe Probe gegen den separat aus dem Base-Commit kompilierten Service erhält den laufenden Kandidaten. Die Frontier und das Annahmeprädikat stammen hier aus einem Mock; dies beweist den Kontrollfluss, nicht selbst die reale Hessische Projektionskonstellation. Diese folgt aus den bereits existierenden Öffnungsregeln und ist mit einer echten Integrationsprobe zu bestätigen. Der bestehende reale Test `activatingAnExamPlanKeepsAGoalInProgressBehindItsRequiredOpening` (`ClaudeV1CompletionRouteIntegrationTest.java:3069`) deckt nur den Exam-Zweig ab.

Zur Reparatur reicht es nicht, nur das Annahmeprädikat auch für gewöhnliche Pläne zu verwenden: Der erhaltene Kandidat muss auch seine Eintrittsöffnung als `atomicGoalId` und das laufende Ziel als `requestedGoalId` tragen. Sonst meldet `ActivateResponse.activeGoalId` (`LearnerLearningPlanService.java:1143`) weiterhin das Ziel, während der Write die Öffnung speichert.

### B2 – P2, derzeit latente Formatregression: unabhängige Studienempfehlungen können verschwinden

Die neue Frontier je Atomfokus (`LearnerLearningPlanService.java:2293–2306`) beschränkt den Kontext auf dieses Ziel, seine Voraussetzungen und seine ermittelten Öffnungen. `unitStudyGuidance` erzeugt eine Empfehlung aber nur, wenn deren unabhängiges Vorbereitungsziel ebenfalls im aktuellen Scope liegt (`LearnerService.java:8702–8708`). Die seiteneffektbehaftete Callback-Sammlung (`LearnerLearningPlanService.java:1947–1963`, `1966–1969`) kann eine so weggefallene Beziehung nicht mehr in `studyPreparation` eintragen.

Minimalfall: Im selben Mehrabschnittsblock sind `after` und `before` offen und fällig; der Termin bevorzugt `after`; eine fachlich ausdrücklich unabhängige Empfehlung lautet `before -> after`, ohne eine `requires`-Kante daraus zu machen. Unter der Abschnittsunion waren beide im Scope, die Map enthielt `after=[before]`, und die abschließende Schleife wählte `before`. Unter `[after]` fehlt `before` im Scope, unter `[before]` fehlt `after` in der verfügbaren Frontier. Die Map bleibt leer und die Auswahl bleibt `after`.

Eigene Java-Probe mit der echten statischen Auswahlmethode und kontrollierten scopeabhängigen Callbacks: HEAD `selected=after guidance={} callback-foci=[[after], [before]]`; Base `selected=before guidance={after=[before]} callback-foci=[[section, other]]`. Positive Kontrolle mit vorbefüllter Map wählt auch auf HEAD `before`; ein einzelner Abschnitt mit Callback-Empfehlung ebenfalls. Die nachgelagerte Schleife ist also intakt, ihre Informationsquelle ist nicht allgemein erhalten.

Ein Dateiscan des aktuellen Katalogs fand außerhalb von Qualitätshistorie, Build-Ausgaben und tmp keine ausgelieferten Materialdateien mit `studyRecommendations`; nur das v4-Schema enthält das Feld. `UnitLearningMaterialServiceTest.java:148–166` prüft das Format ausdrücklich an unabhängigen Auswahlmöglichkeiten und dokumentiert, dass die früher ausgelieferten E.1-Empfehlungen seit dem 23. November entfallen sind. Deshalb behaupte ich keinen aktuell ausgelieferten Lernendenfall, wohl aber eine Regression der unterstützten Semantik. Empfehlungen dürfen nicht durch erfundene Voraussetzungen ersetzt werden.

### B3 – P2 Produktklärung: Abschnittsanzahl erklärt keinen pädagogischen Elternabstieg

Der maßgebliche Beschluss (`AGENTS.md:706–724`, insbesondere 718–723) sagt: tatsächlicher Abstieg vom Elternteil führt erst in Eltern- und dann Kindeinheit ein; Direkteinstieg ins Kind führt mit kurzem Elternbezug in das Kind ein. Er sagt nicht, dass ein zweiter, unabhängiger Abschnitt desselben Planblocks den Eintritt in den ersten Kindabschnitt zum Elternabstieg macht.

Die neue Dokumentation (`AGENTS.md:840–850`) beschreibt die technische Folge des bereits gespeicherten Atomfokus korrekt. Die darin enthaltene pädagogische Einordnung als Einzelwahl mit zwingender äußerer Öffnung ist aber kein eigenständiger Nachweis, dass dies vom bestehenden Product-Owner-Beschluss gedeckt ist. Wenn der Plan ausdrücklich das Kind auswählt, ist die unterschiedliche Behandlung gegenüber demselben Kind in einem Einzelabschnittsblock mindestens entscheidungsbedürftig. Ich habe sie nicht geändert.

### B4 – P3 Prüfbedarf: Aufwand wächst mit der Zahl offener Atome

Der bisherige Mehrabschnittsblock benötigte eine Frontier-Berechnung; nun hat jedes offene Ziel einen anderen Cache-Schlüssel (`LearnerLearningPlanService.java:2293–2306`). Der Cache spart dort deshalb keine Arbeit. Der Callback lädt pro Ziel wieder Projektion, Mastery und Frontier-Fakten (`LearnerService.java:8228–8253`). Die neuen Tests haben nach dem Ankerabschluss nur ein offenes Ziel und messen dies nicht. Es gibt keine eigene Laufzeitmessung dieses Reviews; dies ist ein begrenzter Leistungsprüfpunkt, kein behaupteter Timeout.

## Antworten auf die fünf Fragen

### 1. Übereinstimmung – PARTIAL PASS / Aktivierung mit laufendem Ziel FAIL

Die gemeinsame Auswahl in `firstEligibleDueGoal` beurteilt normale fällige Ziele nun unter dem tatsächlich vorgesehenen Fokus: ein Abschnitt bleibt Abschnitt; mehrere Abschnitte, keine Abschnitte und aus dem Abschnitt heraus verschobene Ziele verwenden das Ziel selbst (`2204–2210`, `2291–2317`). Die eigenen statischen Proben bestätigen alle vier Fälle.

Planansicht (`1883–1885`), `continuePlan` (`1507–1516`), generisches automatisches und explizites Resume (`1415–1416`, `1475–1485`), Coach-Verfügbarkeit (`541–544`) und die Kandidatensuche nach erfolgreichem Abschluss (`LearnerService.java:10621–10648`) benutzen denselben normalen Selector. Der normale Handoff normalisiert vor dem Speichern erneut mit `resolveLearningPlanEntry` (`LearnerService.java:10727–10731`), wie der generische Übergang. Der neue Sechser-Test prüft den konkreten Mehrabschnittsfall mit beiden Pilotzuständen, vergleicht Ansicht, Reconcile und Handoff, und geht bis zum Ziel weiter. Das ist eine sinnvolle Regression.

Die Aussage gilt nicht uneingeschränkt für Aktivierung mit laufendem Ziel: siehe B1. Der Fokus ist jetzt gleich, die Eintrittsprüfung bleibt verschieden. Zudem entscheidet der unveränderte Fachfallback weiterhin aus der ganzen persönlichen Fachfrontier und speichert erst danach einen Atomfokus (`LearnerLearningPlanService.java:1976–1980`, `2166–2170`). Das ist außerhalb des korrigierten Blockpfads; ich habe keinen neuen Refusal-Fall dieses Fallbacks nachgewiesen und würde daraus keine universelle Zusage ableiten. Der Coachstatus veröffentlicht primär Verfügbarkeit und aktives Ziel, keinen vollständigen künftigen Fokus; gleiche Boolesche Verfügbarkeit beweist den kompletten gespeicherten Eintritt nicht.

### 2. Regressionen – normaler Eintritt PASS mit Einschränkungen; Aktivierung und Empfehlungen siehe B1/B2

Für den veränderten normalen Mehrabschnitts-Eintritt ist kein weiterer Fall belegt, in dem ein angebotenes Ziel vom Write abgewiesen wird: Projektion und Write verwenden jetzt denselben Atomfokus. Ein vorher durch Abschnittslehrreihenfolge zurückgestelltes explizit geplantes Ziel kann nun früher startbar sein; seine echten Voraussetzungen und Öffnungen gelten weiterhin. Der konkrete vorher gemessene falsche Kind-/Elternöffnungsschritt wird damit schlüssig behoben.

Einzelabschnitt, kein Abschnitt und nach Regrouping eigener Fokus behalten dieselben Fokusargumente wie vorher. Exam-Kandidaten kommen weiterhin aus der einmal ermittelten vollständigen Examscope-Frontier; ihr Callback ignoriert die nun durchgereichten einzelnen Fokuslisten und ihre Übergänge speichern weiter die Examscope (`LearnerLearningPlanService.java:1767–1778`, `2038–2041`, `2171–2181`). Der Exam-Zweig der Preservation benutzt weiterhin `learningPlanTransitionAccepts(..., scope.goalIds())` (`1680–1681`).

Einheitenaufträge sind kein `isAtomicLearning`-Block (`LearnerLearningPlanApi.java:105`); sie laufen deshalb nicht durch die hier geänderten normalen Dueböcke oder Preservation-Auswahl. Ihr versionsgebundener Einzelabschnitt bleibt bei der Normalisierung vorgeschrieben (`LearnerLearningPlanService.java:2416–2425`). Ich habe diese Zweige gelesen, aber keine eigene vollständige Exam-/Einheitenauftrags-Suite ausgeführt.

### 3. Restunterschied – ENTSCHEIDUNG/BESTÄTIGTE SEMANTIK ERFORDERLICH

Siehe B3. Technisch konsistent ist nicht automatisch pädagogisch beschlossen. Ein direkter Einstieg aus mehreren Abschnitten benötigt einen erhaltenen Eintrittskontext: welcher gewählte Abschnitt enthält das geplante Ziel und welche Einheit wird tatsächlich betreten? Diese Information muss neben dem einzelnen Laufzeitfokus verfügbar sein und von Vorschau, Eligibility, erforderlicher Öffnung, Write, Pending-Return und Handoff gemeinsam verwendet werden. Einfach die Kindsektion als Fokus zu speichern genügt nicht, weil dann `deferredUnitStudyGoals` (`LearnerService.java:8652–8671`) ein explizit terminiertes Ziel hinter anderen Abschnittsschritten verstecken kann. Ein explizites Atomziel und seine Eintrittseinheit sind unterschiedliche Informationen.

### 4. Vorbereitung und Reihenfolge – FAIL allgemein / PASS bei weiterhin vorhandener Map

Die Schleife (`LearnerLearningPlanService.java:2322–2335`) folgt weiter Empfehlungen nur unter ebenfalls vorhandenen fälligen Kandidaten desselben Blocks, überspringt besuchte Ziele und verhindert Endlosschleifen. Ungeplante Empfehlungen, spätere Termine oder andere Blöcke werden dadurch weiterhin nicht eigenmächtig zu Verpflichtungen.

Das genügt für die Gesamtfrage nicht. B2 zeigt den Verlust vor der Schleife. Bei einem einzelnen Abschnitt bleibt der Callbackkontext erhalten. Unter mehreren Abschnitten bleiben Beziehungen nur erhalten, wenn die erforderlichen Ziele zufällig auch in einem abgefragten Atomscope vorkommen; für unabhängige Empfehlungen ist das nicht gewährleistet. Empfohlene Reihenfolge braucht einen ausreichend breiten, gesondert ermittelten Beratungskontext; die Startfähigkeit jedes Zieles muss trotzdem unter seinem gespeicherten Fokus bleiben.

### 5. Tests – gute konkrete Regression, keine vollständige Pfadabdeckung

Der neue Test schützt drei Öffnungszustände und beide Pilotwerte sowie den Fortgang nach den Öffnungen. Er vergleicht den gespeicherten Fokus beider Startpfade und ist damit stärker als eine reine Antwortprüfung.

Es fehlen mindestens:

- Gewöhnliche Mehrabschnittsaktivierung mit laufendem, erst hinter der Elternöffnung startbarem Ziel und früher fälligem anderem Ziel; Antwort, tatsächliche Aktivität und `pendingUnitEntry.targetGoalId` müssen zusammen geprüft werden. Eine Negativkontrolle muss ein tatsächlich unzulässiges laufendes Ziel ersetzen.
- Derselbe neue Mehrabschnittsfall über `resumeExplicitly`, `continuePlan` und manuelle Coach-Auswahl; der vorhandene Verschiebungstest deckt diese Wege für ein verschobenes Ziel, nicht die neue Mehrabschnittskonstellation ab.
- Echte Studienempfehlung zwischen unabhängigen Zielen im gleichen Mehrabschnittsblock, einschließlich mindestens einer Kette; Positivkontrolle unter einem Abschnitt und Kontrollen für anderen Block, späteren Termin und bereits erledigte Vorbereitung.
- Assertions zum vorgemerkten Rückkehrziel nach jeder erforderlichen Öffnung und zum unveränderten eigentlichen Lernergebnis während reiner Navigation. Das Erreichen des Ziels ist schon geprüft; das genaue Rückkehrsignal nicht.
- Begrenzte Messung mit mehr als einem offenen Ziel je Mehrabschnittsblock für B4.

Die zwei angepassten bestehenden Mocktests erlauben nun die richtigen Fokusargumente. Sie sind keine unabhängigen Nachweise der pädagogischen Wahl der Öffnung und prüfen keine verlorene Empfehlung.

## Eigene Läufe und Grenzen

Rohmaterial: `reviewer-b-probes/run.json`, `PlanFocusBProbe.java`, `PreparationBProbe.java`, `PreservationBProbe.java` sowie der reproduzierbare Aufruf `python3 tmp/e1-handover/reviews/issue-197-plan-focus/reviewer-b-probes/reproduce.py`. Generierte Klassen und die zum Gegenlauf extrahierte Base-Quelle liegen ausschließlich unter `/tmp`; der Run-Record nennt den Ablageort. Der Reproduktionslauf extrahiert diese Quelle erneut aus Git. Die Proben ändern keine Build-Klassen. Der Run-Record bindet HEAD sowie SHA-256 von Produktionsquelle, vorhandener Build-Klasse und Base-Quelle.

- Statischer Selector, echte bestehende Build-Klasse: sieben Kontrollen erfolgreich (vier Fokusfälle und drei Vorbereitungskontrollen).
- Preservation: echter privater Servicepfad mit kontrolliertem LearnerService-Mock; HEAD verwirft, Base erhält den angebotenen laufenden Kandidaten.
- Preparation: echte statische Methode mit scopeabhängigen synthetischen Callbacks; HEAD wählt `after`, Base `before`.
- Der erste Compile-Versuch mit Standard-JDK 21 scheiterte wegen Classfile-Version 69. Der Record enthält auch diesen Versuch. Wiederholung mit dem vorhandenen Corretto 25 kompilierte und lief erfolgreich.
- Keine eigene Gradle- oder Spring-Integration, keine UI-/Hostprüfung, keine Aussage über vollständige CI. Die synthetischen Callbacks werden ausdrücklich nicht als reale Lernendenintegration ausgegeben. Keine Webrecherche war nötig: Gegenstand sind die vorliegenden Produktregeln und der lokale Java-Kontrollfluss.
