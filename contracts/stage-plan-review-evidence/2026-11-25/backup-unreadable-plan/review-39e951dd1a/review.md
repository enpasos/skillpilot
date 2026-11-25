# Bestätigung der vier Backup-Korrekturen

**Zur Übernahme bestätigt.** Zwei unabhängige Prüfer haben den vier Dateien umfassenden Änderungsstand `05a2b1c8c3..526131aaac` begutachtet. Die Diensttests liefen auf `39e951dd1a`. Alle 15 Fälle der ersten Runde sowie der geänderte Test für den fachfremden Plan bestanden. In den zehn Wiederherstellungsfällen wurde das erneut exportierte, regulär signierte Backup jeweils zusätzlich in einen zweiten Lernenden importiert. Die Blöcke, der Fingerabdruck, der erneute Export und der geprüfte Lernfortschritt stimmten. [Ausführung](raw/confirmed-head.actual.json)

| Korrektur | Ergebnis |
|---|---|
| Signierter Altplan mit fachfremdem Inhalt | Der Import bewahrt Lernfortschritt und Plan. Ein regulärer Speicheraufruf mit demselben fachfremden Block erhält 400. Der veraltete Plan ist zum aktuellen Curriculum inkompatibel. |
| Verschwundenes Fach | Die korrigierten Assertions fordern genau einen veralteten Listeneintrag für ein bekanntes Fach und null für ein vollständig verschwundenes Fach. Der Export bewahrt auch dessen Blöcke. Eine Aufnahme in die bearbeitbare Fachliste wäre erst bei einem eigenen Archivleser sinnvoll. |
| Form und Speicherbarkeit | Leitfaden und Javadoc beschreiben die tatsächliche Prüfung, einschließlich des alleinstehenden Prüfungstags und der ursprünglichen Blockwerte. Die erste Runde belegte den Unterschied zur Normalisierung durch einen realen Speicheraufruf. |
| Fehlerklassifikation | Das Lesen prüft Umfang, zurückgezogene Ziele, Normalisierung, Foki und Reihenfolge. Danach verwendet der Fingerabdruck dieselben geordneten Blöcke, erfassten Auswahlen und dasselbe Curriculum wie bisher. Ein erwarteter 4xx-Lesefehler wird auf INFO, ein vom Auffangpfad erfasster unerwarteter Fehler auf WARN mitsamt Ursache gemeldet. |

Beide Gutachten bestätigen den erhaltenen Erfolgspfad. Neben dem Altplan wurde im Test der lesbare benachbarte Plan aus demselben Backup weiterhin als aktuell wiederhergestellt. Bei unbekanntem Fach bleiben die Daten lesbar im Export. Die referenzierten Blöcke, die Ableitung des Fingerabdrucks, Revision 1 und der Erfassungszeitpunkt des aktuellen Plans folgen beim erfolgreichen Wiederherstellen der bisherigen Berechnung.

Die Dokumentation kann die Ausnahmegrenze noch genauer benennen. Eine direkt vorliegende 5xx-Ausnahme wird weitergereicht. Der Auffangpfad für unerwartete Fehler gilt für `IllegalStateException`, `IllegalArgumentException` sowie einen 4xx nach erfolgreichem Lesen. Ein typisiertes Ergebnis ist für diese Übergabe entbehrlich. Der entkoppelte Befund zu #205 bleibt bestehen. Im erneuten nativen Vergleich ergaben sich bei eingeschalteter Planbefolgung mit unlesbarem Prüfungstag null Frontier-Ziele und keine Wiederaufnahme, ohne Prüfungstag ein Frontier-Ziel und verfügbare Wiederaufnahme.

Die Einzelurteile sowie die beiden nativen Ergebnissätze sind im [Prüfnachweis](independent-review.actual.json) gebunden. Die [erste](reviewer-a.original.md) und die [zweite Originalantwort](reviewer-b.original.md) enthalten ihre unabhängigen Befunde.
