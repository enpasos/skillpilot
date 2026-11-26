# Lernplan-Fortsetzung bei Blöcken mit mehreren Abschnitten: unabhängige Gegenprüfung

Die Auswahl des nächsten Lernziels beurteilt jedes fällige Ziel unter dem Fokus, der für es gespeichert wird ([Issue #197](https://github.com/enpasos/skillpilot/issues/197)). Claude hat die Änderung umgesetzt und deshalb nicht selbst geprüft. Codex hat zwei getrennte Prüfmodelle den Stand unabhängig voneinander lesen lassen und das Verhalten mit eigenen Läufen an den echten Diensten gegen den Stand von `main` gemessen.

## Geprüfter Stand

Geprüft wurde der Implementierungscommit `afdfe229e4` auf der Basis `7c921a452c`. [Zusammenfassung](review-afdfe229e4/review.md) · [Prüfmodell A](review-afdfe229e4/reviewer-a.md) · [Prüfmodell B](review-afdfe229e4/reviewer-b.md) · [Prüfbeleg](review-afdfe229e4/independent-review.actual.json)

Die vier Dateien sind unverändert übernommen. Die im Prüfbeleg gebundenen Rohdaten (Laufprotokolle, Messwerte, Probencode) liegen außerhalb des Repositorys; Verweise der Gutachten auf `raw/` führen deshalb hier ins Leere.

## Befunde und was daraus wurde

| Befund | Gemessen | Ergebnis |
|---|---|---|
| Ein laufendes Lernziel geht beim Aktivieren eines Plans verloren. | Auftakt der Untereinheit bestanden, Auftakt von E.1 offen, das laufende Ziel im Plan, ein anderes Planziel früher fällig: Gestartet wurde das andere Ziel, das laufende war weder Fokus noch Rückkehrziel. Auf `main` blieb es als Fokus und Rückkehrziel erhalten. | Korrigiert. Das laufende Ziel bleibt auch hinter seinem nötigen Auftakt erhalten; die Antwort nennt den gestarteten Auftakt. Test mit drei Zuständen. |
| Eine Vorbereitungsempfehlung wird übersprungen. | Drei unabhängige Ziele im selben fälligen Block, mit einer Kette von zwei Empfehlungen: Bei einem Abschnitt begann der Plan mit der Vorbereitung, bei zwei Abschnitten mit dem ursprünglichen Ziel. Die beiden heute hinterlegten Materialien enthalten keine solche Empfehlung. | Korrigiert. Die Empfehlungen einer Einheit werden im Zusammenhang der Abschnitte des Blocks gelesen; starten darf weiterhin nur, was der eigene gespeicherte Fokus anbietet. Tests an der Auswahl. |
| Der Auftakt der Untereinheit ist selbst das einzige eingeplante Ziel. | Bei zwei Abschnitten und zwei offenen Auftakten startet das Cockpit jetzt zuerst den Auftakt von E.1 statt direkt den Auftakt der Untereinheit. Das ausdrückliche Fortsetzen im Coach startet den Auftakt von E.1; auf `main` endete es mit einem Fehler. | Nicht geändert. Unter dem eigenen Fokus kommt der äußere Auftakt zuerst, bei einem Auftakt wie bei einem Inhaltsziel. Als geändertes Verhalten ausgewiesen. |
| Das Cockpit-„Fortsetzen“ speichert mehr Fokus-Einträge, als es meldet. | Bei nötigem Auftakt speichert `continuePlan` zusätzlich den Auftakt und eine Grundlage. Das bestand schon auf `main`. | Nicht Teil dieses Pakets; die Gleichheit des gespeicherten Fokus wird für diesen Weg nicht behauptet. |
| Auftakt von E.1 vor dem Auftakt der Untereinheit bei mehreren Abschnitten. | Ein Block mit einem Abschnitt zeigt nur den Auftakt der Untereinheit, ein Block mit mehreren Abschnitten beide. | Offen als Produktentscheidung: ob ein solcher Block als direkter Einstieg in die Untereinheit gelten soll. |

## Bestätigungslauf

Geprüft wurde `f303f7ebdd` mit den fünf Proben der Gegenprüfung, die auf dem ersten Stand zum Teil scheiterten. Alle fünf bestehen. Beim Aktivieren eines Plans mit einem früher fälligen anderen Ziel bleibt das laufende Ziel in allen drei Zuständen erhalten: Ist ein Auftakt offen, wird der Auftakt von E.1 gemeldet und gespeichert, und das laufende Ziel bleibt Fokus und Rückkehrziel; sind beide Auftakte bestanden, bleibt es selbst aktiv. Die Vorbereitungskette beginnt bei einem wie bei zwei Abschnitten mit derselben Vorbereitung. [Bericht](confirmation-f303f7ebdd/confirmation.md)

Bestätigt hat die Gegenprüfung: Für das gemeldete Inhaltsziel stimmen Planansicht, Coach, automatischer Abgleich und Cockpit überein. Klausurpläne und Einheitenaufträge sind nicht berührt. Gegen den Dienst von `main` scheitern genau vier der sechs neuen Testfälle.
