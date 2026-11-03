# c83dc2d1: begrenzte echte Poisson-Coverage

**Das exakte Delta ist fachlich freigegeben.** Als einzige Coverage wird `c9a897ca-a0a2-5895-bbc4-23b20840c548` eingetragen, nachdem Teil 1 die bisher fehlenden Leistungen tatsächlich verlangt und bewertet. `84069c5e` bleibt ausgeschlossen.

Die bisher direkt vorgegebene Zahl λ=2 wird durch ein ausdrücklich vereinfachtes Binomialmodell ersetzt: 1000 unabhängige potentielle Anrufende je Zeitintervall, je entweder ein Anruf mit p=0,002 oder kein Anruf. Die Lernenden definieren die Anzahl pro Intervall als Zufallsvariable, begründen das Binomialmodell, motivieren die Poisson-Näherung und bestimmen λ=np=2 selbst. Danach berechnen sie dieselben fünf erwarteten Häufigkeiten. Die Lösung trennt die exakte Binomialverteilung des vereinfachten Modells von ihrer Poisson-Näherung.

Damit werden alle Teile des vorhandenen ganzen c9-Vertrags gezeigt: Binomialnäherung für seltene Einzelereignisse, Modellierung pro Zeiteinheit, eigene Parameterbestimmung und konkrete Wahrscheinlichkeitsrechnung. Die zusätzliche Arbeit ist Teil derselben kohärenten Modellprüfung; es entsteht keine neue Prüfung.

Die sieben Punkte von Teil 1 werden präzisiert: 1 BE Zufallsvariable/Binomialmodell, 1 BE Näherungsmotivation, 1 BE λ samt Deutung, 4 BE Häufigkeiten. Die übrigen Teile samt Lösungen und Rubriken bleiben exakt erhalten. Insgesamt bleiben 7/4/4/5 Punkte, 20 Maximalpunkte und 10 Bestehenspunkte. `requires`, Scope, Quelle und bestehende Mastery bleiben unverändert.

Das vorhandene Pflichtgate wird nicht abgeschwächt. Der frühere Satz, die leere Coverage-Liste könne hier bestehen bleiben, wird hinsichtlich der Freigabefähigkeit korrigiert; die damalige Kritik an der unvollständig gezeigten Coverage bleibt richtig. Historische Reviewdateien werden nicht überschrieben.

Die JSON-Datei enthält vier exakte Feldersetzungen mit Vorher-/Nachher-Zielhash sowie die vollständige Vertragszuordnung. Eigene Zahlenkontrollen bestätigen λ=2, die erwarteten Häufigkeiten 13,5/27,1/27,1/18,0/14,3 und die Dreifachintervall-Randwahrscheinlichkeit 0,2560202395. Der vollständige Graph des in-memory geänderten Kandidaten ist gültig. Vor Aktivierung bleibt das bestehende Release-/Readiness-Gate am endgültigen gemeinsamen Kandidaten auszuführen. Diese Inhaltsfreigabe ist keine Quellen-, Scope- oder M7-Gesamtfreigabe.

Basis: `common-offline-canonical-math.content-reviewed.json`, SHA `87bed8c1c27e10e1a0f92b26448cc18c9abf5a3c742e84a11de94ad55b155002`.

Vorher-Zielhash: `aca12da02de0a2d6b9d34f151b781bfc2c74f5461c8a51012ab9307218e27b85`.

Genehmigter Nachher-Zielhash vor neuer Release-Notiz: `383e54fc8c47e5c7d35499bf9328d556ed52fcd0b8a0ce569e87e718c795e2a5`.
