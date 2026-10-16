# BW-LK: acht Memory-Sichtbefunde — begrenzte Autoranalyse

**Ergebnis: Analysepaket, keine integrierbare Kompositionsänderung.** Die acht ursprünglichen Befunde bleiben offen. Alle ursprünglichen Materialien und Entscheidungen sind unverändert.

Der unveränderte Stock-Memorychecker prüft hier tatsächlich die ganze aktuelle 554-Knoten-Landschaft mit allen 422 M-Entscheidungen und 75 bestehenden Kartenbindungen. Die ursprünglichen neun Aggregate-Sichten bleiben erhalten; genau eine ganze BW-Sicht wird jeweils ergänzt. Es gibt keine Auswahl nur der acht Ziele und keine Umdeklaration auf `no_memory_needed`.

| Getrennte BW-Population | Sichtbare Ziele | Sichtbare Memoryknoten | Tatsächlich fehlende Memory-Refs vorher | Nach vier hypothetischen target-Knoten |
|---|---:|---:|---:|---:|
| Eingefrorene NAT9-Sicht | 182 | 0 | 37 | 9 |
| Aktuelle Source3/Acquisition-Sicht | 191 | 0 | 40 | 9 |

37/40 sind tatsächliche Ref-Fehler dieser neuen vollständigen Populationen. Die Zahlen sind weder die acht früher dokumentierten selektierten Befunde noch die Summe aller zehn Sichtprüfungen. Die exakten Zielmengen, Scope/Stage/Tags und Rohfehler stehen in `evidence/POPULATIONS.exact-four-whole422-stock-runs.json` und `evidence/REMAINING.nine-exact-whole-scope-ref-errors-both-views.json`.

Die vier Knoten würden die acht lokalen Referenzen schließen, jedoch sämtliche 45 Karten ihrer ganzen Decks sichtbar machen. Neun Karten haben momentan Herkunftsziele ohne BW-Anwendbarkeitsbindung. Für einige gibt es direkte BW-Quellenstellen; daraus folgt keine pauschale Freigabe aller anderen Karten. Die tatsächliche WebGUI- und Backend-Auswahl läuft über GK/LK-Tags und schränkt diese Decks nicht auf die in der BW-Komposition enthaltenen Herkunftsziele ein. Es wird kein Runtime-Umbau vorgeschlagen.

Die Dateien unter `diagnostic-rejected/` sind ausdrücklich verworfene Prüffiktionen und dürfen nicht als Kandidaten integriert werden. Der ganze Vorherbaum bleibt darin als exakter geordneter Präfix erhalten; nur vier bestehende Memoryziele mit `projectionRole: target` werden diagnostisch angehängt. Keine curricularAtomic-Zielmenge, kein Scope, keine Karte, kein Curriculumtag und kein Zieltext wird reduziert oder geändert. `prerequisiteOnly` wird nicht verwendet.

Alle vier korrigierten vollständigen Stockläufe scheitern ehrlich an den Sichtbefunden. 422 Zielentscheidungen und 75 Kartenbindungen sind aktuell, ohne fehlende oder veraltete Records. Die ersten Läufe mit einer versehentlich aktiven statt eingefrorenen Natural-Q2-Deckdatei bleiben zusätzlich erhalten und sind durch die additive Hostkorrektur klar getrennt. Ein anfänglicher Fehler im temporären Vergleichsskript ist ebenfalls dokumentiert.

Keine neue Fachabstimmung, keine Humanfreigabe, kein M7-/Core-/Ganzkursabschluss und keine aktive Integration. Die weiteren Arbeiten benötigen einen getrennten begrenzten Auftrag; dieses Paket endet mit Analyse und Siegel.
