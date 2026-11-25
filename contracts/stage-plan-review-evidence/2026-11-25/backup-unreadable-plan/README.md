# Sicherung mit nicht lesbarem Lernplan: unabhängige Gegenprüfung

Die Änderung stellt die Lernergebnisse einer Sicherung auch dann wieder her, wenn ein darin enthaltener Lernplan heute nicht mehr lesbar ist, und übernimmt diesen Plan als veraltet. Claude hat sie umgesetzt und deshalb nicht selbst geprüft. Codex hat zwei getrennte Prüfmodelle (GPT-6.1 Sol und GPT-6.2 Astra) den Stand lesen lassen und das Verhalten mit eigenen Läufen am echten Dienst gemessen. Dieser Ordner enthält die unveränderten Prüfberichte.

## Geprüfter Stand

Geprüft wurde `05a2b1c8c3` mit dem Implementierungscommit `ba1c911e98` auf der Basis `1001aa2c7f`. [Zusammenfassung](review-05a2b1c8c3/review.md) · [Prüfmodell A](review-05a2b1c8c3/reviewer-a.original.md) · [Prüfmodell B](review-05a2b1c8c3/reviewer-b.original.md) · [Prüfbeleg](review-05a2b1c8c3/independent-review.actual.json)

| Eigener Lauf der Gegenprüfung | Ergebnis |
|---|---|
| Wiederherstellung am geprüften Stand, mit zweitem Import in eine neue Lernperson | 15 von 15 Fällen bestanden |
| Dieselben Fälle ohne die Übernahme als veraltet | 10 von 10 Wiederherstellungen scheitern am ursprünglichen Lesefehler |
| Veralteter Plan mit Klausurtag ohne die Korrektur der Transaktion | 2 von 4 Fällen scheitern, beide mit „Plänen folgen“ |
| Weitere Kurs-, Dauer- und Stufenwechsel ohne Klausurtag | 42 Lese-, Fortsetzungs- und Abgleichaufrufe gelingen |
| Zweiter Import: Blöcke, Marker, Prüfsumme und Lernergebnis | stimmen überein; kein neues Feld in der Sicherung |

## Bestätigungslauf: freigegeben

Geprüft wurde die Änderung `05a2b1c8c3..526131aaac` auf dem Stand `39e951dd1a`. Beide Prüfmodelle bestätigen die vier Korrekturen der Tabelle unten. 16 von 16 Fällen bestanden: die 15 Fälle der ersten Runde und der umgestellte Test zum fachfremden Plan; in den zehn Wiederherstellungsfällen wurde die erneut exportierte Sicherung zusätzlich in eine zweite Lernperson importiert. Den empfohlenen eigenen Ergebnistyp halten beide für diese Übergabe für entbehrlich. Nach der Bestätigung kam nur noch die genauere Beschreibung der Fehlergrenze hinzu, die die Prüfer angeregt hatten (ein Kommentar im Code und der Regeltext). [Zusammenfassung](review-39e951dd1a/review.md) · [Prüfmodell A](review-39e951dd1a/reviewer-a.original.md) · [Prüfmodell B](review-39e951dd1a/reviewer-b.original.md) · [Prüfbeleg](review-39e951dd1a/independent-review.actual.json) · [Geprüfte Änderung](review-39e951dd1a/raw/reviewed.diff)

## Befunde und Korrekturen

| Befund | Gemessen | Korrektur |
|---|---|---|
| Ein vorhandener Test hielt die alte Regel fest. | `signedPlanImportRejectsAtomicGoalsOutsideThePersonalSubjectScope` erwartete die Abweisung einer Sicherung, deren Plan ein fachfremdes Lernziel nennt. Die Sicherung wird jetzt angenommen und der Plan als veraltet übernommen. | Der Test prüft die neue Regel: Lernergebnis wiederhergestellt, Plan als veraltet gespeichert und unwirksam, und derselbe Block wird beim Speichern eines Plans weiter abgewiesen. |
| Ein Plan zu einer Landschaft, die es im Katalog nicht mehr gibt, fehlt in der Planliste. | Null Einträge mit und ohne „Plänen folgen“, obwohl der Plan gespeichert ist und in der nächsten Sicherung steht. Die Prüfung im Test war mit einer leeren Trefferliste zufrieden. | Als Regel festgehalten und ausdrücklich geprüft: Für eine solche Landschaft lässt sich kein Plan speichern; ihr Plan bleibt im Speicher und in späteren Sicherungen und erscheint nicht in der Liste. |
| Die Formprüfung nimmt mehr an, als ein Speichern heute ablegen würde. | Die archivierten Werte bleiben erhalten, nicht ihre normalisierte Form; ein Plan, dessen einziger Block ein Klausurtag ist, wird übernommen. | Als Regel festgehalten: Die Prüfung betrifft die Form, nicht die heutige Speicherbarkeit. |
| Ein technischer Fehler kann wie ein veralteter Plan aussehen. | Von beiden Prüfmodellen im Code belegt, im vorliegenden Katalog nicht beobachtet: Die Prüfsummenbildung übersetzt einen Fehler im Strukturgraphen in einen Clientfehler. | Das Lesen des Plans gegen das Curriculum (Fach, Lernziele, Abschnitte, Klausurthemen, Blockreihenfolge) ist von der Prüfsummenbildung getrennt. Scheitert ein gelesener Plan danach oder mit etwas anderem als einem Clientfehler, wird er weiter als veraltet übernommen, weil die Lernergebnisse Vorrang haben, aber als unerwarteter Fehler mit Ursache protokolliert. Ein eigener Ergebnistyp für veraltete Fachbezüge, den die Prüfer empfehlen, ist nicht umgesetzt. |

Bestätigt ohne Änderungsbedarf: Jede lesende Stelle behandelt den Plan mit dem Marker als veraltet, die Curriculum-Auswahl kann den Marker nicht liefern, Format und Signatur der Sicherung sind unverändert, und die Korrektur der Transaktion ist richtig und für die sieben weiteren benannten Lesemethoden ohne nachgewiesenen Bedarf.

## Grenzen

- **Veralteter Plan mit Klausurtag.** Solange Plänen gefolgt wird, bietet der Coach im Fach kein Lernziel an (Lernfront 0 statt 1). Die Gegenprüfung bestätigt die Messung und die Empfehlung in [Issue #205](https://github.com/enpasos/skillpilot/issues/205); die Entscheidung liegt beim Product Owner.
- **Cockpit.** Statushinweis und Fachzeile bleiben bei einem veralteten Plan sichtbar, seine Einzelheiten und der Wechsel sind ausgeblendet. Eine gültige Neufassung lässt sich über den Dienst mit der aktuellen Revision speichern; für Einheitenaufträge ist der Weg im Browser nachgewiesen. Eine Bedienfolge, mit der Lernende einen beliebigen veralteten Plan im Cockpit selbst öffnen und reparieren, ist nicht nachgewiesen. Das gilt für jeden veralteten Plan, nicht nur für einen wiederhergestellten.
- Die rohen JUnit-Berichte und Protokolle beider Runden (zusammen etwa 28 MB) sind nicht im Repository. Ihre Prüfsummen stehen in den Prüfbelegen; die Messprogramme und die kleinen Ergebnisdateien liegen unter `review-05a2b1c8c3/raw/` und `review-39e951dd1a/raw/`.
