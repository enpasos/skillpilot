# Laufendes Ziel nach einer Umgruppierung: unabhängige Gegenprüfung

Die Änderung erhält die laufende Arbeit einer Lernperson, wenn ein neuer Zuschnitt das Lernziel aus dem fokussierten Abschnitt verschiebt. Claude hat sie umgesetzt und deshalb nicht selbst geprüft. Codex hat zwei getrennte Prüfmodelle (GPT-6.1 Sol und GPT-6.2 Astra) den jeweiligen Stand lesen lassen und das Verhalten mit eigenen Läufen am echten Dienst gemessen. Dieser Ordner enthält die unveränderten Prüfberichte beider Runden.

## Anlass

Die Gegenprüfung des E.2-Zuschnitts fand den Fehler: Wer E.2 als Fokus hat und gerade an einem Lernziel arbeitet, das der Zuschnitt nach E.5 verschiebt, verliert den Zeiger auf seine Arbeit. Dasselbe besteht seit dem E.1-Zuschnitt vom 23. November auf `main` für „Physik im Straßenverkehr“ und die Bezugssysteme unter einem Fokus auf E.1.

| Gemessen auf `53fd44c88b` | Ergebnis |
|---|---|
| Der Coach liest den Lernstand | zeigt die Lernfront statt des laufenden Ziels |
| Regulärer Zustandsabruf | löscht den gespeicherten Zeiger auf das laufende Ziel |
| Der Coach will das laufende Ziel als bestanden buchen | wird abgewiesen |

Lernergebnisse gehen dabei nicht verloren, und das Ziel bleibt im Chat erreichbar, aber nur über einen Fokuswechsel und eine neue Auswahl.

## Erste Runde: Korrektur erforderlich

Geprüft wurde `1431a79dbe`. Die erste Fassung nahm das laufende Ziel in den wirksamen Fokus auf. Das stellte die Fortsetzung her, veränderte aber auch alles, was dieselbe Liste als Auswahl der Lernperson liest. [Zusammenfassung](review-1431a79dbe/review.md) · [Prüfmodell A](review-1431a79dbe/reviewer-a.md) · [Prüfmodell B](review-1431a79dbe/reviewer-b.md) · [Prüfbeleg](review-1431a79dbe/independent-review.actual.json)

| Befund | Gemessen | Korrektur |
|---|---|---|
| Das laufende Ziel erschien als gewählter Fokus. | Der Lernstand meldete zwei Fokuseinträge, gespeichert war einer. Ein erneuter Klick auf den schon gewählten Abschnitt löste dadurch einen Schreibvorgang aus, der das laufende Ziel beenden kann. | Der gewählte Fokus wird wieder gelesen wie auf `main`. |
| Die Sicherung trug das laufende Ziel als Fokus. | Nach Export und Import standen Abschnitt und Ziel dauerhaft im Fokus, auch bei einer laufenden Direktprüfung. | Abfrage und Export lesen den gewählten Fokus. |
| Navigations- und Abschlussangebote wuchsen. | Fünf statt vier Navigationsziele, sieben statt sechs Abschlussprofile, jeweils zusätzlich E.2. | Beide lesen den gewählten Fokus. |
| Ein gespeicherter Prüfungszeiger wurde nicht mehr bereinigt. | Eine Prüfung außerhalb des Fokus ohne gültige Direktbindung und ohne ausdrückliche Wahl ihres Angebots blieb aktiv. | Prüfungen und Kartenstapel sind von der Regel ausgenommen. |
| Die Begründung „dieser Zustand kann nur aus einer Umgruppierung stammen“ war falsch. | Eine gültige Direktprüfung liegt ohne jede Umgruppierung außerhalb des gespeicherten Fokus. | Der Regeltext nennt die Regel ohne diese Behauptung. |

Die Laufzeitmessung (2.304 gemessene Abrufe) zeigte keinen reproduzierbaren Anstieg.

## Bestätigungslauf: freigegeben

Geprüft wurde `fc7cab9ca1`. Das laufende Ziel bleibt jetzt nur dort erhalten, wo es unterrichtet und abgeschlossen wird: in der Lernfront, beim nötigen Einheitenauftakt, im Einheitenkontext des Coach und bei der Zustandsprüfung, die es sonst löschen würde. Beide Prüfmodelle bestätigen die Korrektur; 18 gezielte Läufe bestanden, mit ein- und ausgeschaltetem Einheitenpilot. [Zusammenfassung mit Dreiervergleich](review-fc7cab9ca1/review.md) · [Prüfmodell A](review-fc7cab9ca1/reviewer-a.md) · [Prüfmodell B](review-fc7cab9ca1/reviewer-b.md) · [Prüfbeleg](review-fc7cab9ca1/independent-review.actual.json) · [Vergleich der drei Stände](review-fc7cab9ca1/comparison.actual.json)

| Beobachtung | `main` | erste Fassung | freigegebene Fassung |
|---|---|---|---|
| Laufendes Ziel Straßenverkehr oder Bezugssysteme, Zustandsabruf und Abschluss im Coach | fällt auf die Lernfront zurück, Abschluss abgewiesen | bleibt im Unterricht, Abschluss gelingt | bleibt im Unterricht, Abschluss gelingt |
| Gewählter Fokus im Cockpit und in der Abfrage | E.1 | E.1 und das Ziel | E.1 |
| Sicherung exportieren und in eine neue Lernperson importieren | E.1 | E.1 und das Ziel | E.1 |
| Navigationsziele und Abschlussprofile | 4 und 6 | 5 und 7 | 4 und 6, dieselben wie auf `main` |
| Prüfungszeiger außerhalb des Fokus ohne Bindung | wird gelöscht | bleibt | wird gelöscht |
| Neuer Start eines Ziels außerhalb des Fokus | abgewiesen | abgewiesen | abgewiesen |

## Grenzen

- **Ausdrücklich neu gesetzter Fokus.** Schreibt die Lernperson ihren Fokus neu, auch denselben, endet die Arbeit an einem Ziel außerhalb davon wie bei jedem Fokuswechsel. Der gewöhnliche Klick im Cockpit auf den schon gewählten Abschnitt löst keinen Schreibvorgang aus.
- **Prüfungen und Kartenstapel.** Eine regulär begonnene Prüfung, die ein Zuschnitt später aus dem Abschnitt verschiebt, verliert ihren Zeiger wie bisher. Der E.2-Zuschnitt verschiebt keine Prüfung.
- **Wer Lernplänen folgt**, wird vom Umfang seiner Pläne geführt; dort gilt die Regel aus dem Paket „Alte Lernpläne nach einer Umgruppierung“.
- Die rohen JUnit-Berichte und Protokolle beider Runden (zusammen etwa 107 MB) sind nicht im Repository. Ihre Prüfsummen stehen in den Prüfbelegen; die Messprogramme liegen bei.
