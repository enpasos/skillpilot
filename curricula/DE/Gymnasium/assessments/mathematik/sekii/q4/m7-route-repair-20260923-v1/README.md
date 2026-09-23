# Q4-Routenreparatur: drei begrenzte Assessment-Kandidaten

Status: **fachliche Kandidaten, nicht kanonisch integriert und nicht als released freigegeben**. Die laufenden D/P-Kampagnen bleiben unberührt. Vor Integration braucht jede Aufgabe eine unabhängige fachliche Prüfung der konkreten Aufgabe, Lösung und Bewertung; erst danach dürfen `reviewStatus`, Kanonkanten und Klassifikationsbindung auf den geprüften Stand gesetzt werden.

Die aktuelle CQR-101-Regressionsliste hat neun Ziele ohne lokalen Terminalpfad. Die Rückbindung an die vorhandene Caterer-Aufgabe `3095e125-fbb7-51c6-bf12-ffbb1735b9b7` wäre unzutreffend: Sie prüft weder eigene Ergebniskontrolle noch alternative LK-Modelle oder Differential-/Integralrechnung. Ihre vier ehrlichen `coveredGoalIds` bleiben unverändert.

| Kandidat | Kurs | Exakt zu prüfende Ziele | Terminalpfad |
| --- | --- | --- | --- |
| [Busmodell dokumentieren, prüfen und verbessern](bus-model-check.md) | GK/LK | `ae2ca565`, `4a630596`, `fb4dcd2a` | Eigene Prozess-/Modellierungsaufgabe unter `Übungen Prozesskompetenzen` |
| [Zwei Wachstumsmodelle auswählen](algae-model-choice.md) | LK | `74f28ce7`, `163dd583`, `519660d0` | Eigene LK-Aufgabe unter `Übungen Prozesskompetenzen` |
| [Zuflussmodell mit Analysis prüfen](tank-rate-validation.md) | LK | `dc12f281`, `0b162cb0`, `71fe4a39` | Eigene LK-Aufgabe unter `Übungen Q4` |

Für jeden Endpunkt gilt: `requires` und `examData.coveredGoalIds` enthalten genau die Tabellenzeile; weitere Vorläufer sind über die bestehende Zielkette erreichbar, werden aber nicht pauschal als separat geprüft ausgegeben. Die erste Aufgabe ist GK/LK-tauglich; die LK-Aufgaben dürfen keinen GK-Zielpfad heimlich vom LK-Endpunkt abhängig machen. Keine neue Aufgabe gehört in die globale Abitur-Schicht. Die Aufgaben sind textuell; sie benötigen kein künstliches Lernzielbild.

Nach Freigabe der laufenden Kampagnen sind getrennt zu prüfen: stabile IDs und `practiceAssessment`-Klassifikation für die neuen Endpunkte, Fingerprints der betroffenen Parent-Cluster, GK/LK-Projektion aller betroffenen Kompositionsansichten, `CQR-101/102/201/202/203`, Graph-DAG, GoalBook-/Evidence-Bindungen der neun Inhaltsziele und geschützte M6-Floors. Eine grüne Routenmetrik allein ist keine fachliche Abnahme der neuen Aufgaben. Weder QA-Ledger noch zentrale D/P-Registry werden durch dieses Kandidatenpaket geändert.
