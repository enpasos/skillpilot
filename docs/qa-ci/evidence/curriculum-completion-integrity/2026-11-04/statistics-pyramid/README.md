# Vorhandene Statistik- und Pyramidenprüfungen

Zwei vorhandene Prüfungen erhalten zusätzliche fachlich geprüfte Plätze:
die Statistikprüfung in zwölf bayerischen und schleswig-holsteinischen
LK-Angeboten und Kursvereinigungen, die Pyramidenprüfung in vier bayerischen
LK-Angeboten und Kursvereinigungen. Es entstehen keine neuen Prüfungs-IDs.
Aufgaben, Lösungen, Bewertungsregeln, Abdeckung und Voraussetzungen bleiben
unverändert. Alle 807 curricularen Mathematikziele bleiben erhalten.

Die tatsächliche Backendmessung über 161 Angebote und 46 Kursvereinigungen
bestätigt 16 zusätzliche Prüfungsplätze. Dadurch schließen sich 100 weitere
Ziel-Angebots-Lücken und 68 Endpunktpaare. 322 Kontext- und Bedarfsmengen sind
unabhängig nachgerechnet. Keine gewöhnlichen Ziele verschwinden oder kommen
hinzu; es entstehen keine neuen Abschlusslücken. Vier schleswig-holsteinische
GK-Angebote erhalten ausdrücklich geprüfte Vorbereitungsrollen, damit die
LK-Prüfung dort nicht versehentlich zum eigenen Ziel wird.

Es verbleiben **255 ungedeckte IDs / 2.718 Ziel-Angebots-Paare und 164
gewöhnliche Endpunkt-IDs / 1.819 Endpunktpaare**. 17 Angebote bestehen die
Strukturprüfung; 144 bleiben offen. Dies ist keine vollständige Mathematik-,
M7-, CI- oder Deployment-Abnahme.

Die [Messausführung](native-execution.json), ihre
[ursprünglichen Eingabehashes](original-native-input-hashes.json), die
[Herkunft der ausgeführten Klassen](native-runtime-origin.json) und der
[unabhängig nachgerechnete Vergleich](native-comparison.json) beziehen sich
auf das eingefrorene Ausgangspaket. Spätere reine Änderungen am
Autoren-Generator und seinen Hashbindungen werden gesondert ausgewiesen;
die ursprüngliche Messung wird dadurch nicht umgeschrieben.

Das unabhängige Astra-Review und alle elf regulären Autorenprüfungen bestehen.
127 geprüfte Dateien sind bytegenau übernommen. Von den 3.285 ursprünglichen
Messungseingaben bleiben 3.284 identisch; ausschließlich die Hashbindung des
Autoren-Generators in der Stage-Policy ändert sich nachträglich. Der finale
Generator, seine Bindungen und der normale Stage-Verbraucher sind separat
geprüft. Laufzeitgraph, Produktionslogik und die 147 Ansichten der ursprünglichen
Messung bleiben dabei unverändert. Elf gezielte Ablehnungsproben sichern die
Grenzen der regulären Erzeugung ab.

[Bindungen](binding.json), [geprüfte Dateien](reviewed-payload.manifest.json),
[Import](root-import.json), [reguläre Nachprüfungen](quality-summary.actual.json),
[versiegelte Übergabe](handoff.json).

Die feste Summenprüfung der öffentlichen API enthielt noch Zielzahlen vor den
letzten drei geprüften Datenkorrekturen. Die ursprünglichen Prüfungen zeigen
41 veraltete Werte unter 44 Kombinationen; alle Zielmitgliedschaftsprüfungen
bleiben erhalten. Die neuen Zahlen sind sowohl gegen die tatsächlichen
Backend-Zielmengen als auch gegen die HTTP-Antworten geprüft. Die vollständige
Controllerklasse besteht anschließend mit 38/38 Tests ohne Skips. Die älteren
Kompatibilitätsabfragen für nicht angebotene Schulzeitmodelle werden dabei
nicht als zusätzliche reale Lehrplanangebote ausgegeben.

[Ursprüngliche Befunde](http-counts-before-summary.txt),
[Herleitung der Zahlen](http-count-deltas.actual.json),
[gezielter Nachlauf](http-counts-after-execution.json),
[vollständige Klasse](http-controller-class-execution.json),
[Testergebnis](http-controller-class-summary.txt).
