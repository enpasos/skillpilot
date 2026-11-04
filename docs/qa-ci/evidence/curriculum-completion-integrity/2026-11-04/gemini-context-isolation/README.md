# Getrennte Datenbanken für Gemini-Testkontexte

Der GitHub-Job 126297258239 scheiterte mit 17 fehlenden `LEARNER`-Tabellen.
Drei unterschiedliche Spring-Testkontexte benutzten denselben H2-Datenbanknamen.
Beim Verdrängen eines älteren Kontexts löschte dessen `create-drop`-Aufräumen
auch die Tabellen eines weiterhin aktiven Kontexts.

Die gemeinsame Gemini-Testkonfiguration verwendet nun einen pro Kontext
eigenen Namen. Cachegröße 2, Heap, `create-drop`, Testauswahl und Assertions
bleiben gleich. Alle Annotationen mit der Java-Konstante wurden für die
Prüfung neu kompiliert. Produktionskonfiguration und Produktionsdaten bleiben
unverändert.

Der vollständige lokale Verbund der 22 CI-Testklassen reproduziert zunächst
**153 erfolgreiche und dieselben 17 fehlgeschlagenen Tests**. Danach bestehen
**170 von 170 Tests**, ohne Skips oder Abbrüche. Die JDBC-Beobachtung bestätigt
fünf Kontexte mit getrennten, innerhalb jedes Kontexts stabilen URLs und durchgehend
vorhandener `LEARNER`-Tabelle.

[Vorher-/Nachher-Nachweis](database-isolation.actual.json) ·
[Exakter Import](root-import.json) · [Ergebnis](after.summary.txt)

Dies ist eine gezielte lokale CI-Reparatur, keine vollständige Backend- oder
GitHub-Abnahme des neuen Commits.
