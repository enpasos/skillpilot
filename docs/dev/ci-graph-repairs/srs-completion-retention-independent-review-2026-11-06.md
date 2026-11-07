# Unabhängiger Review der zwei SRS-Service-Regressionen

6. November 2026. **Kein Hold gegen den engen Testdiff.** KI-Codereview, keine
menschliche Freigabe. Geprüft wurden der vollständige Diff und das Setup von
`AssessmentCompletionSrsIntegrationTest.java` mit SHA-256
`b2376826bea785cd14bce0f48b097f34e6dde0eab658df70f5217bf326098462`,
die tatsächlichen Selektions-/Schreibguards in `LearnerService.java`, die
kanonische Definition des verwendeten Memoryziels und der Workflowdiff.
Der [Laufbeleg](srs-completion-retention-regressions-2026-11-06.json) ist gebunden
an SHA-256 `45b84b35530a431d60355151950262553804781008dd9f6ba45a35e4425f0240`.
Die darin genannten Test-, Workflow- und Produktionsdateihashes stimmen mit den
gelesenen Bytes überein.

Im ersten neuen Fall wird Memory-Mastery nicht vorab in die Datenbank geschrieben.
Der öffentliche Batchdienst besteht beide erforderlichen Karten mit einem
zurückliegenden Recall-Zeitpunkt und speichert selbst das Ergebnis. Der Test liest
danach die tatsächlichen gespeicherten `nextReview`-Werte: jeder liegt **nach** der
Prüfung und **vor** dem heutigen Lesezeitpunkt. Der Fälligkeitsnachweis beruht damit
nicht allein auf einem alten Fixturedatum. Nach Rückstellung der Uhr behalten
`getMastery`, die reale Frontier und die strikte Completionprojektion den
Abschluss. Der künstlich um genau dieses Memoryziel ergänzte dreigliedrige
Testscope hat weiterhin einen gemeisterten und zwei offene Targets; er ist keine
Änderung des veröffentlichten Pilotumfangs. Gespeicherte Kartenbytes und ihre
Zeitstempel sowie explizites Mastery und dessen Zeitstempel bleiben unverändert.

Im zweiten Fall bleibt das Memoryziel aktiv und sichtbar, während eine Karte
bereits bestanden und eine andere noch offen ist. Die neue Serverauswahl enthält
nur die offene Karte. Der einzelne False-Schreibversuch erreicht nachweislich den
spezifischen Already-verified-Guard; der strukturell gültige gefälschte Batch
scheitert an der exakten Server-Batchidentität. Es ist somit kein Ersatznachweis
über einen unpassenden Active-Goal-Guard. Die gelesene Produktion prüft beide
Bedingungen vor der Persistenz. Der Test schützt Kartenbytes, Zeitstempel,
Lernerrevision und das noch nicht bestehende Memory-Mastery. Anschließend gelingt
der echte offene Batch, stellt 2/2 her und lässt den früheren Kartennachweis
unverändert. Die Testuhr und der private synthetische Completiondienst werden nach
jedem Fall zurückgesetzt.

Die drei tatsächlichen JUnit-XML-Dateien wurden separat gelesen und gegen die
Beleghashes geprüft: Assessment-SRS 9, Batchqueries 6, Practice-State-Guard 6;
zusammen **21 ausgeführt, keine Fehler, Fehlschläge oder Skips**. Beide neuen
Testnamen sind im ersten XML enthalten. Der Reviewer hat keinen erneuten Lauf
ausgeführt. Im Workflow `assessment-completion.yml` ändert sich ausschließlich
das Ausführungsminimum dieser vollständigen Klasse von sieben auf neun.
Bestehende Fehl-/Skip-/Reportidentitätsprüfungen und die weiteren Suitegrenzen
bleiben unverändert.

Der Beleg betrifft die heutigen Verträge N11/N12: terminierte Wiederholung
entzieht keinen bestehenden Abschluss, bestandene Karten werden nicht erneut
als offene Verifikationskarten ausgegeben oder überschrieben. Er ändert keine
Scheduling-, Produktions-, Karten-, Mastery- oder Anerkennungslogik. Historische
Matrixstände bleiben historische Eingaben. Der lokale H2-Servicebeleg ist keine
neue PostgreSQL-, Restart-, Host- oder Remote-CI-Abnahme.
