# CQR-204: Erhalt der Informatik-Prüfungsverträge

Privater Implementierungsnachfolger zum endlichen Vertrag
`informatics-retained-assessment-coverage-v1`; noch keine aktive Anwendung oder
QA-Freigabe. Der Einbau ergänzt die bestehenden Struktur- und Placeholderchecks.
Ein CQR-204-Pass benötigt beides: gültige aktuelle Struktur und einen positiven,
exakt aus echten Quellbytes neu berechneten historischen Erhaltungsbefund.

Die feste Referenz enthält 24 Prüfungen: 14 deklarierte atomare Coverageverträge
und zehn Prüfungen mit tatsächlich fehlendem Coveragefeld. Bei letzteren lautet
der positive Befund ausschließlich „historische Prüfungsidentität erhalten;
Abdeckung weiterhin undeklariert“. Kein leeres Array, kein Vollständigkeits-
oder Anerkennungsbeleg wird daraus erzeugt. Alle Definitionen werden geprüft,
auch außerhalb normaler Views, bei Draftstatus und geänderter Platzierung.

Der Source-Reader erfasst die Bytes vor dem Parsen. Informatik-Objekte und der
ExpectedContext sind tief eingefroren. Eine private WeakMap bindet den Kontext
an Owner und die tatsächlich entdeckten Definitions-/Requiredmengen. Die
Discovery bindet auch genau die im selben Durchlauf konsumierten Viewbytes.
Reports können diesen Context nicht importieren. Der Consumer verlangt genau
je einen passenden CQR-204/CQR-202, das vollständige erwartete Manifest und
positiven erwarteten Schutzstatus. Die bestehende Maturity bleibt bei einem
isolierten Coveragefehler höchstens M3; die eigenständige Floor-CLI liest die
aktuellen Quellen unabhängig neu und verwirft auch einen mit richtigen Hashes
gefälschten M7-Report. Andere Owner behalten ihre bestehenden Gates ohne eine
neue historische Coveragezusage.

Die 21 endlichen Testgruppen laufen über `testCurriculumExamReadiness.ts`.
Echte historische Quellbytes liefern 14+10 positive Erhaltungszeilen, während
sechs echte Placeholder Strukturfehler bleiben. Zwei native Q3.2-Mutationen
belegen 21→22 und 18→19, die expliziten historischen Pins den Gegenfall.
Ein separat fest gepinnter synthetischer 24er-Testvertrag läuft in einem
isolierten Prozess unter demselben verpflichtenden Informatik-Owner durch
SourceCapture, WeakMap, Producer, Maturity und Floor. Nur seine festen
Historienpins, Test-Dateipfade und konkrete synthetische Reviewbindungen werden
im isolierten Testloader ersetzt. Es existiert keine produktive Testfactory oder
reportgesteuerte Policy-Ausnahme. Positiv ergibt dieses Fixture M6; genau ein
Coveragefehler ergibt M3. M7 benötigt weiterhin echte gültige V-Evidenz.

Die aktive Informatikquelle854 hat weiterhin24 Definitionen,14 deklarierte und10 unbekannte Coveragezustände. Ihr Retentionbefund besteht; sechs reale Platzhalter bleiben Strukturfehler und die echten Graphfehler bestehen. Es gibt keine konkrete Bedeutungs-/Erstbelegungsbindung, keine SourceV3-Materialintegration und keine CQR104-/Routenänderung.
