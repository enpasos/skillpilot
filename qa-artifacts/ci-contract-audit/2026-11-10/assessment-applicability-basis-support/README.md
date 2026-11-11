# Assessment-Anwendbarkeit: getrennte technische Grundlage

Der Compiler unterstützt eine explizite, live ausgewertete lokale
Anwendbarkeitsbasis für atomare Prüfungs-/Praxisziele. Damit kann ein späterer
verifizierter Schritt die bisherige Scopeformel erhalten, während `requires`
atomisiert wird. Die Basis verändert weder Lernbedarf noch Mastery oder
Quellenzuordnung. Es wird noch kein kanonisches Ziel auf das neue Feld umgestellt.

Ungültige, doppelte, fehlende, zyklische, fremde und Memory-abhängige Referenzen
scheitern hart. Ohne neues Feld bleibt das Verhalten unverändert: Der
[Bestandsvergleich](catalog-comparison.json) hat für alle 21 Kataloge und 6.524
Zielzeilen exakt dieselben vollständigen Ausgabebytes ergeben. Die bestehenden
212 Compilerwarnungen werden weder entfernt noch zu einer neuen Abnahme erklärt.

Die [lokalen Prüfungen](local-checks.json) enthalten die tatsächlichen Ergebnisse:
17 Source-/Applicability-Regressionen, Beschreibungskontext und Dual-Round,
App-TypeScript, gewöhnliches Lint, fünf Dokumentchecks und den dreifachen
PDF-Build. Neue Gegenfälle schließen auch bislang ungeprüfte neue Metadaten aus
alten Reviewkontexten und V6-/V7-Beweisen aus. Produktions-Beweiscode, historische
Schemas, Reviewinputs und Reifegraduntergrenzen bleiben unverändert.

Die lokale vollständige Beweiskette wurde nach den synthetischen Gegenfällen
und den tatsächlich bestandenen historischen V5-/aktuellen V6-Stufen gezielt
unterbrochen, um den konkreten Runtime-Native-Testfehler zuerst zu reparieren.
Exit137 ist keine bestandene Gesamtprüfung. Die volle Zertifizierung am
endgültigen Head bleibt in CI verpflichtend. Die neuen Tests laufen über die
bestehenden `quality:source-coverage-audit:check`, `test:transitive-minimality`
und GoalBook-Pipeline-Aufrufe.

Eine zugelassene Migration, vollständige tatsächliche L-/APV-Auslieferung und
native Gegenprobe werden vor Biologie-Daten benötigt. Das Standard-G17-Gate und
die vollständige Main-Abnahme aller zehn geschützten Fächer bleiben offen.
