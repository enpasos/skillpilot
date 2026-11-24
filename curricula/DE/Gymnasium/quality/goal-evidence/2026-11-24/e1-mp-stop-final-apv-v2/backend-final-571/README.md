# Vollständiger reiner Backend-Endlauf

Produktcommit: `571769b53aa6007498c6cec9c78feb8a49115f39`.
Kein Daten- oder Code-Overlay; HEAD und sämtliche getrackten Eingaben bleiben
während des Laufs unverändert. Task 3 ist durch den echten Main-Merge enthalten.

**486/486 PASS**, null Fehler, null übersprungene Fälle; nativer Build 15m58s.
Zwölf volle bekannte Klassen plus die exakte Seed-Methode ergeben 13 native
JUnit-Suitedateien. Die unbekannte historische Zwölferliste mit 527 Fällen wird
nicht als rekonstruiert behauptet; die tatsächliche aktuelle Auswahl steht im
separaten Inventar.

| Native Klasse | Fälle | PASS |
| --- | ---: | ---: |
| AssessmentMaterialRevisionTest | 3 | 3 |
| UnitAssessmentContractTest | 2 | 2 |
| UnitOrientationPlanningCreditTest | 6 | 6 |
| UnitPlanningReleaseTest | 3 | 3 |
| ClaudeV1CompletionRouteIntegrationTest | 105 | 105 |
| LearnerControllerIntegrationTest | 1 | 1 |
| CoachSubjectContinuationIntegrationTest | 36 | 36 |
| CompositionViewServiceTest | 70 | 70 |
| LearnerPlanningScopeServiceTest | 14 | 14 |
| LearnerServiceCrossSubjectPilotTest | 97 | 97 |
| LearnerServiceTest | 134 | 134 |
| UnitIntroductionForeignFocusReviewTest | 6 | 6 |
| UnitLearningMaterialServiceTest | 9 | 9 |

Die Teilgruppen stammen aus echten JUnit-Fällen, deren native Ordinalposition,
Displayname und Status exakt mit den qualifizierten Gradle-Methodenereignissen
übereinstimmen. Jede Zeile bindet Roh-XML-SHA und Logzeile. Parametrisierte
Displaynamen werden nicht bloß aus Selektorlisten als bestanden angenommen.

| Gesondert geprüfte Gruppe | Ergebnis |
| --- | ---: |
| Pflichtfälle laut Handover §5 | 24/24 PASS |
| Aktuelle Science-Sek-I-Seed-Methode | 1/1 PASS |
| Historische kanonische und Legacy-MP-Ergebnisse | 2/2 PASS |
| Direkter E.1-Kindeinstieg und verschachtelter Einstieg mit/ohne Autopilot | 3/3 PASS |
| Geführter Elternabstieg | 1/1 PASS |
| Aktuelle Kartenursprünge TV/BES/LAWS/FALL | 4/4 PASS |
| Verbleibende freiwillige Aufgaben einschließlich WURF/FFX | 15/15 PASS |

`verification.actual.json` ist der kompakte Gesamtbeleg;
`qualified-subsets.actual.json` enthält alle gesondert gebundenen Teilfälle;
`junit-raw-and-excerpts.actual.json` nennt sämtliche 486 Fallstatus.
Alle roten Tests: `[]`.

Die 13 `EXCERPT-TEST-*.xml` sind ausdrücklich gekennzeichnete Auszüge mit
Suite-/Fallstatus und Laufzeit. Sie enthalten weder Systemoutputs noch Properties.
Die vollständigen nativen XML bleiben unter
`/tmp/e1-t5/backend-final-pure-571-build/test-results/test/`, der Rohlog unter
`/tmp/e1-t5/backend-final-pure-571.log`; ihre Roh-SHAs sind gebunden. Kein großer
Systemoutput wird ins Repository übernommen. Die nativen Läufe und Auszüge sind
lokale Regressionsevidenz, keine Behauptung einer abgeschlossenen Main-CI.

Der frühere fbde-Lauf mit fünf Fehlern und der nach 41 PASS-Events für den neuen
Produktcheckpoint abgebrochene f332-Lauf bleiben unverändert als Geschichte
gebunden. Ihre Ergebnisse werden nicht auf diesen Endstand umgehängt.
