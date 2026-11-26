# Unabhängiges Originalgutachten A zu Task V

Stand: 26. November 2026. Eine blinde Runde. Geprüfter Schnitt: `7c921a452c..afdfe229e4`; der gelesene Checkout stand auf `afdfe229e4ace47e0f32802cf9a56a761145c2ef`.

Ich habe ausschließlich den Auftragseintrag vom 26. November, 14:16 CET, den gepinnten Diff, AGENTS sowie die tatsächlichen Aufrufer und einschlägigen Tests herangezogen. Ich habe keine anderen Gutachten gelesen, nicht delegiert und keine versionierte Datei oder Branch verändert. Zusätzliche dynamische Proben wurden dem koordinierenden Agenten vorgeschlagen; ihre Ergebnisse gehören nicht zu diesem Originalgutachten. Es gab keinen eigenen Gradle-Lauf. Die unten ausdrücklich als Hypothese bezeichneten Fälle sind keine behaupteten Laufresultate.

## Gesamturteil und Schweregrade

Die zentrale Korrektur ist sachgerecht: Die gewöhnliche Auswahl fragt jetzt die Frontier unter demselben zunächst vorgesehenen Fokus ab, den `DueGoal` mitführt. Damit verschwindet die konkrete Union-/Einzelfokus-Verwechslung für gewöhnliche Inhaltsziele. Eine uneingeschränkte Bestätigung „jeder Pfad nennt und speichert denselben Schritt und Fokus“ gebe ich jedoch nicht: `continuePlan` schreibt weiterhin über einen anderen Mutationspfad und erweitert dabei den Fokus. Außerdem ist die Vorbereitungskette bei echten, unabhängigen `studyRecommendations` im Mehrfachabschnittsblock nicht allgemein erhalten.

- **P2, statisch nachgewiesene Restlücke:** `continuePlan` speichert bei einer erforderlichen Öffnung zusätzliche Fokusziele, während Resume/Handoff den atomaren Zielfokus behalten. Der neue Test erreicht diesen Pfad nicht. Die Abweichung existiert im Mutationspfad bereits vor dem Diff; die neue Allpfad-Aussage und der angefragte Abnahmeumfang sind damit dennoch nicht erfüllt.
- **P2, latente generische Regression:** Bei mehreren Abschnitten kann die geänderte Frontierabfrage die Metadaten einer unabhängigen Vorbereitungsempfehlung beseitigen. Der nachgeschaltete Kettenalgorithmus kann eine nicht mehr gelieferte Empfehlung nicht verfolgen. Im aktuell ausgelieferten Material habe ich keine aktive `studyRecommendations`-Deklaration gefunden; ich behaupte deshalb keinen gegenwärtigen E.1-Lernerausfall durch diesen Punkt.
- **Offene, mechanistisch begründete Hypothesen:** Aktivierung mit einem laufenden Ziel hinter einer offenen Elternöffnung; eine geplante Kindöffnung als Ziel selbst. Beide benötigen eine gezielte Laufprobe, bevor sie als beobachtete Fehler gewertet werden. Die zweite betrifft unmittelbar die Reichweite der Umstellung auf Atomfokus.

Zur eindeutigen Referenzierung im Folgenden:

- **LPS:** `backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java`.
- **LS:** `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java`.
- **RouteTest:** `backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java`.

Alle Zeilennummern beziehen sich auf den geprüften Kopf `afdfe229e4`.

## 1. Übereinstimmung von Anzeige, Auswahl und Schreiben

**Urteil: für den zentralen gewöhnlichen Auswahlschritt ja; für sämtliche angefragten Schreibpfade nein.**

Die vier Fokusfälle werden in `firstEligibleDueGoal` nun nachvollziehbar behandelt:

| Block/Ziel | Prospektive Prüfung | Mitgeführter Fokus | Bewertung |
| --- | --- | --- | --- |
| Ein Abschnitt, Ziel weiterhin darunter | `[section]` | `section` | Gleich wie zuvor. |
| Mehrere Abschnitte | `[goal]` | `goal` | Der Diff beseitigt die vorherige Unionprüfung. |
| Kein Abschnitt | `[goal]` | `goal` | Unveränderter Zweig. |
| Ziel durch Umgruppierung außerhalb der bekannten Abschnitte | `[goal]` | `goal` | Unverändert beabsichtigter eigener Fokus; kein solcher Ersatz bei Unit Assignment. |

Belege: LPS:2196–2213 (`isOutsideBlockFocus`, `runtimeFocusGoalId`), 2291–2315. Ein unbekannter/leer aufgelöster Abschnittsumfang wird ausdrücklich nicht als Beweis einer Umgruppierung behandelt.

Die reale Planansicht geht über `summarize` → `firstScopeContinuationGoal` → denselben Selektor; `nextEligibleGoal` nimmt dessen `atomicGoalId` (LPS:1887–1890, 1910, 1933). Coachstatus/Resume-Gates verwenden dieselben Evaluierungen beziehungsweise `firstCandidateAcrossPlans` (LPS:541–545, 676–713). Coach-Resume ruft über `CoachToolFacade.resumeLearningPlan` nach dem Statusgate `resumeExplicitly` auf (`backend/src/main/java/com/skillpilot/backend/ai/CoachToolFacade.java`:296–318). Dieses und das generische `reconcile` treffen sich in `reconcileInternal` und schreiben über `applyScopeTransition` (LPS:1250–1259, 1374–1482). Der Handoff wendet denselben statischen Selektor an und revalidiert für gewöhnliche Pläne den wirklichen `LearningPlanEntry` (LS:10615–10665, 10712–10765).

**Der konkrete Gegenpfad ist `continuePlan`:** Er wählt ebenfalls über `firstScopeContinuationGoal`, schreibt dann aber mit `setPlannedGoalsAndGetState` plus `setActiveGoal` (LPS:1507–1515). `setActiveGoal` fügt bei erforderlicher Öffnung jedes außerhalb des Fokus liegende Öffnungsziel ausdrücklich als `PlannedGoal` hinzu; bei striktem Modus zusätzlich fehlende transitive Voraussetzungen (LS:11619–11639). `resolveLearningPlanEntry`, den Reconcile und Handoff benutzen, verbreitert einen ausschließlich atomaren Fokus dagegen ausdrücklich nicht (LS:11796–11809).

Für den Zustand des neuen Tests „bothOpen“ folgt daraus bereits am Quelltext: Vorgesehen ist Fokus `[target]`, erforderlicher Schritt ist `MOTION_OPENING`. Reconcile/Handoff können `[target]` speichern, `continuePlan` fügt mindestens `MOTION_OPENING` hinzu. Seine Antwort berichtet dennoch `selected.focusGoalId()` (LPS:1520), also nur `target`. Das widerspricht nicht zwingend dem benannten aktiven Schritt, aber dem angefragten identischen gespeicherten Fokus. Für eine Kindöffnung unter Abschnittsfokus ist die Erweiterung dagegen normalerweise unnötig, weil der Abschnitt seine eigene Öffnung bereits enthält.

**Aktivierung:** Der geänderte gewöhnliche Erhaltungszweig fragt jetzt korrekt `[focusGoalId]` ab (LPS:1671–1687). Er vergleicht allerdings ausschließlich das laufende Ziel mit der Frontier, anders als der Examenzweig, der die Akzeptanz des tatsächlichen Schreibens einschließlich vorgezogener Öffnung prüft. Das ist eine weitere semantische Differenz, nicht eine abweichende Fokusliste. Ein laufendes Ziel hinter einer erforderlichen Öffnung kann dort verworfen werden, obwohl `learningPlanTransitionAccepts` den Einstieg akzeptieren würde. Wenn ein früheres ebenfalls offenes Planziel existiert, kann der Aktivierungsfallback dieses wählen und das bisherige Ziel nicht für die Rückkehr parken. Ob genau dieser Zustand über die produktiven Eingangspfade erreicht wird, ist hier **nicht dynamisch geprüft**; gezielte Negativkontrolle erforderlich. Mit leerer oder schon bestandener Öffnung ist diese Hypothese nicht einschlägig.

## 2. Regressionen, Reichweite, Examenspläne und Unit Assignments

**Urteil: Der ursprüngliche Ankündigungs-/Schreibfehler wird plausibel behoben; allgemeine Reichweitenidentität ist nicht bewiesen.**

Bei einem gewöhnlichen Inhaltsziel liefert der neue Selektor entweder das Ziel selbst oder eine unter demselben Fokus angebotene erforderliche Öffnung (`dueEntryGoalId`, LPS:2338–2346). Der gemeinsame Schreibpfad löst die Öffnung erneut unter diesem Fokus auf und validiert genau diesen Einstieg (LS:11796–11815). Das ist die richtige mechanische Gegenprüfung zur früheren Unionannahme. Ich finde im Diff keinen neuen gewöhnlichen Fall, in dem bei unverändertem Zustand ein solcher Selektorkandidat durch gerade diesen gemeinsamen Schreibpfad abgelehnt werden müsste. Diese Aussage deckt nicht den oben beschriebenen abweichenden `continuePlan`-Pfad ab.

Die Menge der angebotenen Ziele darf sich gleichwohl ändern: Mit Atomfokus entfällt `deferredUnitStudyGoals` absichtlich, weil diese Methode bei ausschließlich atomaren Fokuswurzeln sofort zurückkehrt (LS:8652–8657). Ein unter der Union zugunsten eines früheren Unterrichtsschritts zurückgestelltes Ziel kann nun angeboten werden. Unter nicht striktem Modus verengt sich außerdem die geprüfte Voraussetzungensphäre mit dem Fokus (`FrontierPrerequisites.within`, LS:8581–8585; Prüfung 8611–8617). Bei `strictMode=true` bleibt die globale Voraussetzungspflicht bestehen (LS:8559–8563). Das sind reale Unterschiede der bestehenden Fokussemantik; sie sind nicht automatisch ein Schreibfehler.

**Besonders zu prüfen: geplante Kindöffnung selbst.** Das Ziel muss nicht immer ein Inhaltsziel wie das neue `target` sein. Bei einem Mehrfachabschnittsblock mit `FALL_OPENING` als fälligem Ziel und noch offener `MOTION_OPENING` ergibt der Code folgenden möglichen Widerspruch:

1. `[FALL_OPENING]` ist Atomfokus. `includeGuidedOpeningsInAtomFocus` ergänzt die offene äußerste Öffnung, und die Frontier priorisiert Eltern vor Kind (LS:8871–8883, 8972 ff.).
2. `getRequiredUnitOrientationGoalIdForFocus(FALL_OPENING, [FALL_OPENING])` behandelt das angefragte Ziel dagegen als `explicitOpening` und beschränkt sich auf genau diese Öffnung (LS:8903, 8912–8918).
3. Enthält die Frontier ausschließlich die Elternöffnung, findet `dueEntryGoalId` weder das Ziel noch die von seinem Callback genannte Kindöffnung und verwirft den Kandidaten (LPS:2342–2346). Die vorherige Abschnittsunion konnte die Kindöffnung direkt anbieten.

Das ist eine **ungetestete Hypothese mit vollständigem Mechanismus**, keine behauptete produktive Sackgasse: Ein Fallback könnte andere Personal-Curriculum-Arbeit anbieten. Die Probe muss prüfen, ob ein solcher Plan normal gespeichert werden kann und ob der Kind-Einstieg an seinem vorgesehenen Platz startbar bleibt. Gerade dieser Sonderfall fehlt im neuen Test.

**Examenspläne:** Statisch unveränderte Entscheidungssemantik. `firstCandidateAcrossPlans` und `firstScopeContinuationGoal` liefern dem geänderten Selektor weiterhin eine konstante Frontier des ganzen Examensumfangs und einen Öffnungscallback, der ebenfalls den Examensumfang verwendet (LPS:1769–1778, 2173–2189). `transitionFocus` überschreibt den individuellen `DueGoal`-Fokus bei einem Examen mit dem vollständigen Umfang (LPS:2038–2042). Der Erhaltungszweig verwendet weiterhin `learningPlanTransitionAccepts(..., scope.goalIds())` (LPS:1680–1681). Die neue Anzahl einzelner Callbackaufrufe ändert dort den Inhalt nicht. Keine eigene Regressionstest-Ausführung; der vorhandene echte Aktivierungstest `activatingAnExamPlanKeepsAGoalInProgressBehindItsRequiredOpening` (RouteTest:3069 ff.) deckt einen wichtigen Kontrollfall ab.

**Unit Assignments:** Ein gültiger Auftrag ist an genau seinen Abschnitt und seine Ausgabe gebunden; die Eingangsprüfung verlangt die einzelne `sectionGoalId` als Blockwurzel (LPS:1563–1577). Daher trifft ihn die Mehrfachwurzelumstellung nicht. `isOutsideBlockFocus` nimmt ihn weiter ausdrücklich vom Einzelzielfallback aus (LPS:2198–2201), und `dueEntryGoalId` erfindet für ihn weiterhin keine zusätzliche ungebundene Öffnung (LPS:2343). Die bestehende Negativkontrolle `aGoalMovedOutOfItsSectionKeepsItsPlaceAndRunsUnderItsOwnFocus` hält genau diesen Unterschied fest (`LearnerLearningPlanServiceTest`:351–396). „Unberührt“ ist hier ein statischer Befund, kein neuer vollständiger Lauf aller Auftragsrouten.

## 3. Elternöffnung bei mehreren Abschnitten, nur Kindöffnung bei einem

**Urteil: als ausdrücklich gewählte Navigationssemantik vertretbar, aber keine zwingende Folgerung aus der Abschnittsanzahl. Keine neue Owner-Rückfrage für die technische Konsistenzkorrektur erforderlich.**

Die Entscheidung vom 22. November unterscheidet echten Abstieg von einem Elternteil und direkten Eintritt in ein Kind; sie verlangt nicht, dass beide dieselben Öffnungen zeigen (AGENTS.md:706–724). Der eigene Atomfokus führt technisch zur zuerst offenen äußersten Einheit: LS:8871–8883 und 8920–8924. Der direkte Kindabschnitt als Fokus enthält dagegen seine Kindöffnung und löst keine künstliche Elternöffnung aus. Diese Zuordnung lässt sich mit der vorhandenen Regel vereinbaren, wenn der Mehrfachabschnittsplan als Einstieg in das einzelne Ziel entlang seines äußeren Einheitspfads behandelt wird. AGENTS.md:840–850 dokumentiert nun genau diese Implementierungsentscheidung.

Aus zwei gespeicherten Abschnitts-IDs allein folgt allerdings nicht, dass die lernende Person ausdrücklich den Elternabstieg gewählt hat. Deshalb sollte die Begründung als gewählte Semantik des Planübergangs erkennbar bleiben; sie darf nicht als neue wörtliche Owner-Entscheidung vom 22. November ausgegeben werden. Die Korrektur lässt den vorgesehenen Runtimefokus unverändert und muss diese Produktfrage nicht nebenbei umstellen.

Direkter Eintritt bei mehreren Abschnitten erfordert mehr als `runtimeFocusGoalId` auf irgendeinen Abschnitt umzubiegen: Der aktuelle, tatsächlich besitzende Kindabschnitt muss eindeutig im selben persönlichen View ermittelt werden, einschließlich Umgruppierung und mehrerer möglicher Blockwurzeln. Die Auswahl und alle Schreibpfade müssen diese Eintrittsabsicht gemeinsam benutzen. Zugleich darf `deferredUnitStudyGoals` das explizit geplante Ziel nicht durch frühere, nicht geplante Einheitsschritte verdrängen. Schließlich müssen die Anzeige, das geparkte Ziel und die Rückkehr nach der Kindöffnung unter genau dieser Semantik geprüft werden. Ein eigener Eintrittsparameter beziehungsweise eine gemeinsame Entry-Auflösung kann das ermöglichen; bloßes Verbergen der Elternöffnung reicht nicht.

## 4. Vorbereitungskette und Reihenfolge

**Urteil: Der Kettenalgorithmus funktioniert weiter mit tatsächlich gelieferter Map; die Metadatenbeschaffung erhält die Kette bei Atomfokus nicht allgemein.**

Der positive Teil: Sämtliche fälligen Kandidaten und ihre Callbackantworten werden vor der Auswertung der Kette gesammelt. `frontierByFocus` cached pro tatsächlichem Fokus; dies macht das Füllen der Map nicht nachträglich oder zu spät. Der Algorithmus verfolgt weiterhin nur erreichbare Kandidaten desselben Blocks, berücksichtigt die Fälligkeit und beendet Zyklen mit `visited` (LPS:2293–2306, 2319–2335). Eine einzelne Abschnittsfrontier liefert ihre Guidance wie zuvor.

Der negative Teil liegt **vor** der Kette. Die produktive Map wird ausschließlich aus `FrontierGoal.studyGuidance()` befüllt, die die jeweilige fokussierte Frontier geliefert hat (LPS:1947–1968; für Handoff LS:10619–10627). `unitStudyGuidance` setzt für eine Empfehlung `before → after` unter anderem `scope.contains(before)` voraus (LS:8695–8702). `computeScope([after])` enthält nur `after` und seine `contains`-Nachkommen, ausdrücklich keine Voraussetzungen (LS:15309–15344). Bei gewöhnlichen unabhängigen atomaren Zielen enthält dieser Umfang das andere Ziel `before` nicht. Eine zweite separate Abfrage unter `[before]` hilft nicht: In dieser Frontier fehlt `after`; die Guidance wird gerade am `after` angebracht. Auch `applyStudyGuidance` behält nur Empfehlungen zu gleichzeitig verfügbaren Zielen (LS:8441–8450).

Damit kann die frühere gemeinsame Abschnittsfrontier `after` mit Vorbereitung `[before]` geliefert haben, während die neuen beiden Atomfrontiers überhaupt keine solche Mapzeile erzeugen. Die Reihenfolge fällt dann auf die Datumsordnung zurück, selbst wenn beide Ziele im gleichen Block fällig sind. Der vorhandene Test `ordinaryPlanRecommendsEligiblePreparationOnceItIsDue` (`LearnerLearningPlanServiceTest`:330–349) füllt die Map von Hand und kann diesen Verlust nicht erkennen.

**Begrenzung:** Die Suche nach `"studyRecommendations"` im ausgelieferten `curricula/DE/Gymnasium/materials` ergab keinen Treffer. Der Test `studyRecommendationsBindTwoIndependentChoicesInTheSelectedViews` erklärt ausdrücklich, dass die früheren E.1-Empfehlungen entfernt wurden, und prüft das Format auf einer Kopie (`backend/src/test/java/com/skillpilot/backend/service/UnitLearningMaterialServiceTest.java`:148–162). Der Befund betrifft daher die weiterhin unterstützte generische Fähigkeit, nicht eine aktuell belegte betroffene Materialbindung. Falls diese Fähigkeit garantiert bleiben soll, braucht es getrennte Gewinnung der Blockempfehlungen oder einen anderen gemeinsamen Beratungskontext; die Zulässigkeit und das Schreiben müssen weiterhin unter dem wirklichen Runtimefokus geprüft werden.

## 5. Tests und notwendige Negativkontrollen

**Urteil: Der neue Test ist eine wertvolle enge Regressionsprobe; sein Name und der Allpfadanspruch reichen weiter als seine Aufrufe.**

Der neue parametrisierte Test (RouteTest:2435–2517) prüft die drei wichtigen Öffnungszustände, die Planansage, einen Handoff, Reconcile, den tatsächlich gespeicherten aktiven Schritt, den Fokus `[target]` sowie die Rückkehr zum Ziel. Diese Persistenz- und Folgeassertionen sind wesentlich stärker als ein reiner Antwortvergleich. Der angebliche Gegenlauf gegen den alten Service wurde hier nicht selbst ausgeführt.

Die Parameter toggeln `unitAssessmentPilotEnabled`. `autoPilot` wird in diesem Test ausdrücklich auf `false` gesetzt (RouteTest:2460); die sechs Fälle sind deshalb keine Prüfung beider Autopilot-Einstellungen. Der Test ruft weder `continuePlan`, `CoachToolFacade.resumeLearningPlan` beziehungsweise `resumeExplicitly`, `activatePlans` noch den manuellen Coach-Auswahlpfad auf. Er prüft auch keinen Block mit nur einem/keinem Abschnitt und keinen umgruppierten Zielort. Für einzelne dieser Fälle existieren ältere Tests, aber der neue Name „OnEveryPath“ allein liefert dafür keine Evidenz.

Gezielt zu ergänzen beziehungsweise zentral als Probe auszuführen:

1. Derselbe Ausgangszustand mit `continuePlan`, danach Vergleich der **vollständigen gespeicherten Fokusmenge**, des aktiven Schritts und des geparkten Zieles mit Reconcile/Handoff. Beide Antworten dürfen nicht nur das einzelne Metadatenfeld vergleichen.
2. Aktivierung mit laufendem Ziel, noch offener Elternöffnung, schon bestandener Kindöffnung und einem früheren anderen fälligen Ziel; prüfen, ob das laufende Ziel für die Rückkehr erhalten bleibt. Negativkontrolle: echter fehlender fachlicher Prerequisite darf nicht durch eine Öffnung bescheinigt werden.
3. `FALL_OPENING` selbst als geplantes fälliges Ziel, mit und ohne bestandene Elternöffnung; Mehrfachabschnitt gegenüber direktem Kindabschnitt. Prüfen, ob gerade dieser geplante Schritt startbar bleibt und der Fallback ihn nicht stillschweigend durch andere Arbeit ersetzt.
4. Eine echte `studyRecommendations`-Binding-Kopie beziehungsweise kontrollierter Spy: unabhängige Ziele `before/after`, gleiche Block-ID, beide fällig, beide Öffnungen bestanden. Die Map muss durch die echten Frontiercallbacks entstehen. Negativkontrollen: `before` noch nicht fällig, nicht erreichbar oder in anderem Block; diese Fälle dürfen keine Empfehlung vorziehen.
5. Ein Abschnitt, mehrere Abschnitte, kein Abschnitt, umgruppiertes Ziel mit gleichen Entry-/Fokusassertionen; separat Examensscope und unverfügbarer Unit Assignment als Kontrollen. Autopilot explizit an/aus schalten, falls darüber eine Aussage getroffen wird.

## Eigene Prüfung und Grenzen

- `git rev-parse HEAD`: `afdfe229e4ace47e0f32802cf9a56a761145c2ef`.
- `git diff --stat 7c921a452c..afdfe229e4`: sechs Dateien; einziger produktiver Java-Diff in LPS.
- `git diff --check 7c921a452c..afdfe229e4`: Exit 0, keine Ausgabe.
- Gelesen: vollständige produktive Diffhunks, neuer RouteTest, geänderte Unit-/Serviceintegrationstests sowie die oben referenzierten echten Anzeige-, Coach-, Reconcile-, Aktivierungs-, Handoff- und `continuePlan`-Aufrufe.
- `rg -n '"studyRecommendations"' curricula/DE/Gymnasium/materials`: keine Treffer; mit der expliziten Historienerklärung des Materialservicetests abgeglichen.
- `git status --porcelain=v1` vor Erstellung dieses unversionierten Gutachtens: leer.
- Keine eigene Gradle-/CI-Ausführung, keine Browser-/Hostprüfung, kein Nachweis einer derzeit produktiven Nutzerstörung aus den als Hypothese bezeichneten Zuständen. Die übrigen Befunde sind Quelltextnachweise mit benannten Bedingungen, keine als Laufresultat ausgegebenen Annahmen.

**Abnahmeempfehlung:** Die konkrete Union-/Runtimefokus-Korrektur übernehmen, sobald die verbleibende `continuePlan`-Fokusabweichung und die gezielten Reichweitenproben geklärt sind. Die pauschale Aussage über sämtliche Pfade und die Vorbereitungskette ist im geprüften Stand zu weitgehend. Examens- und Unit-Assignment-Semantik habe ich im Diff ohne neue Abweichung verfolgt; eine frische erfolgreiche Testsuite bleibt gesonderte Evidenz.
