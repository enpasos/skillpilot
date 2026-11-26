# Nicht auswertbarer Lernplan und Klausurumfang: unabhängige Gegenprüfung

Ein Lernplan, der sich heute nicht auswerten lässt, legt keinen Klausurumfang fest ([Issue #205](https://github.com/enpasos/skillpilot/issues/205), Entscheidung des Product Owners vom 26. November 2026). Claude hat die Änderung umgesetzt und deshalb nicht selbst geprüft. Codex hat zwei getrennte Prüfmodelle den Stand unabhängig voneinander lesen lassen und das Verhalten mit eigenen Läufen am echten Dienst gemessen.

## Geprüfter Stand

Geprüft wurde der Implementierungscommit `1768850305` auf der Basis `a3f6b067df`. [Zusammenfassung](review-1768850305/review.md) · [Prüfmodell A](review-1768850305/reviewer-a.md) · [Prüfmodell B](review-1768850305/reviewer-b.md) · [Prüfbeleg](review-1768850305/independent-review.actual.json)

Die vier Dateien sind unverändert übernommen; ihre Prüfsummen stehen im Prüfbeleg. Die dort gebundenen Rohdaten (Laufprotokolle, Messwerte, Probencode) liegen außerhalb des Repositorys. Verweise der Gutachten auf `raw/` führen deshalb hier ins Leere.

## Befunde und was daraus wurde

| Befund | Gemessen | Ergebnis |
|---|---|---|
| Eine gültige Klausur in einem anderen Fach schließt das Fach weiter. | Mathematik mit auswertbarer Klausur, Physik mit veraltetem Plan: Die Physik bot kein Lernziel an, mit und ohne Autopilot. Der Lernweg der Physik enthält Mathematik-Voraussetzungen; sie zählten als gewünschtes Fach und zogen die Mathematik-Klausur hinein. | Korrigiert. Für den ausdrücklichen Wunsch nach einem Fach zählt nur der Plan dieses Fachs. Neuer Test mit zwei gespeicherten Plänen und beiden Autopilot-Werten. |
| Das angebotene Fortsetzen startet kein Lernziel. | Veralteter Plan mit Klausurtag und nur pausierter Lernzeit: Der Coach bot das Fortsetzen an, der veröffentlichte Aufruf meldete einen Fehler und startete kein Lernziel. | Korrigiert. Ein Plan, der sich nicht auswerten lässt, legt auch keine Pause fest. Als fünfte Ursache im Test, mit dem veröffentlichten Aufruf. |
| Der Fokus einer früheren Klausur-Aktivierung begrenzt die Lernfront weiter. | Klausur aktiviert, einziges Thema bestanden, Plan veraltet: drei offene Ziele im Fach, die angezeigte Lernfront ist leer. Fortsetzen und Fachwahl starten ein Ziel. | Offen. Die Unterscheidung zwischen einem gewählten Fokus und dem Fokus einer Aktivierung braucht eine gespeicherte Herkunft des Fokus. |
| Die Prüfung wird häufiger ausgeführt. | Pro Coach-Kontext 4 → 17 bis 18 Auswertungen (37–49 → 91–144 ms), pro Fortsetzen 12 → 53 bis 56 (95–115 → 307–420 ms), jeweils für eine Lernperson, die einem Plan mit Klausurtag folgt. | Für dieses Paket hingenommen und offen ausgewiesen. Eine Wiederverwendung innerhalb eines Aufrufs braucht zuerst die vollständige Liste der Eingaben der Prüfung. |
| Die Tests prüften nur „Lernfront nicht leer“. | Die Aussage unterscheidet nicht, ob die Lernfront noch auf den alten Klausurstoff begrenzt ist. | Korrigiert. Der Test verlangt, dass das Fach genau das anbietet, was es ohne „Plänen folgen“ anbietet. |

## Bestätigungslauf

Geprüft wurde `096a54ceb1` mit den beiden Proben, die zuvor scheiterten. [Bericht](confirmation-096a54ceb1/confirmation.md) · [Prüfbeleg](confirmation-096a54ceb1/confirmation.actual.json)

| Probe | Ergebnis auf `096a54ceb1` | Folge |
|---|---|---|
| Veralteter Plan mit nur pausierter Lernzeit | Bestanden. Das veröffentlichte Fortsetzen startet ein Lernziel, das Angebot wird danach zurückgenommen. | – |
| Zwei Fächer, Autopilot an | Bestanden nach der geltenden Regel: Die Physik bietet dieselben Ziele wie ohne „Plänen folgen“, wird aber nicht zur Wahl angeboten. | – |
| Zwei Fächer, Autopilot aus | Die Physik wird angeboten, der veröffentlichte Fachwechsel aber abgelehnt; kein Ziel startet. Gewählt wurde als erstes Ziel die Mathematik-Voraussetzung „Warum Mathematik?“, die außerhalb der Mathematik-Klausur liegt. | Korrigiert. Die Physik bietet eine Voraussetzung eines anderen Fachs nur an, wenn der Plan dieses Fachs sie zulässt. Der eigene Test verwendet jetzt ein Klausurthema außerhalb des Physik-Lernwegs; zuvor war es zufällig genau diese Voraussetzung. |

Der Erstbericht nannte für den Fall mit der pausierten Lernzeit den Status 409. Der Bestätigungslauf stellt klar, dass der damalige Lauf nur den Fehler des Aufrufs belegt, keinen Zahlenwert.

Bestätigt hat die Gegenprüfung: Die Regel stimmt an den geprüften Einzelstellen. Bewertung, Anrechnung, Planerfüllung und Lernergebnisse sind nicht berührt. Ein Fehler der Zielauflösung markiert die Transaktion der aufrufenden Stelle nicht als gescheitert. Mit Autopilot und einer auswertbaren Klausur bietet der Coach wie bisher kein anderes Fach zur Wahl an; das ist die bestehende Regel für auswertbare Klausuren und nicht Teil dieser Änderung.
