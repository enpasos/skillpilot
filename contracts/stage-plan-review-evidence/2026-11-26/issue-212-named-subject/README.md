# Fachwunsch mit Autopilot während einer Klausur: unabhängige Gegenprüfung

Ein Fach, das die Lernperson im Chat nennt, lässt sich auch mit Autopilot während einer auswertbaren Klausur wählen ([Issue #212](https://github.com/enpasos/skillpilot/issues/212), dritter Punkt; Entscheidung des Product Owners vom 26. November 2026). Claude hat die Änderung umgesetzt und deshalb nicht selbst geprüft. Codex hat zwei getrennte Prüfmodelle den Stand unabhängig voneinander lesen lassen und das Verhalten mit eigenen Läufen an den echten Diensten gegen den Stand von `main` gemessen.

## Geprüfter Stand

Geprüft wurde der Implementierungscommit `6852e07203` auf der Basis `0c743ce7e3`. [Zusammenfassung](review-6852e07203/review.md) · [Prüfmodell A](review-6852e07203/reviewer-a.md) · [Prüfmodell B](review-6852e07203/reviewer-b.md) · [Prüfbeleg](review-6852e07203/independent-review.actual.json)

Die Dateien sind unverändert übernommen. Die Rohdaten (Laufprotokolle, Messwerte, Probencode) liegen außerhalb des Repositorys; Verweise der Gutachten auf `raw/` führen deshalb hier ins Leere.

## Befunde und was daraus wurde

| Frage | Ergebnis der Gegenprüfung | Folge |
|---|---|---|
| Ist das genannte Fach mit Autopilot wählbar und startet es? | Ja, auch wenn die Klausur gerade keinen Schritt starten kann; ebenso bei zwei auswertbaren Plänen, bei einem veralteten Plan des genannten Fachs und bei einem Einheitenauftrag. | – |
| Startet „weiter“ ohne Fach etwas anderes als bisher? | Nein. Alter und neuer Dienst verhalten sich in fünf Lagen gleich, mit und ohne Autopilot. Die automatische Abstimmung und die Übergabe nach einem bestandenen Ziel lesen die zusätzlichen Fächer nicht. | – |
| Startet das veröffentlichte Fach immer ein Lernziel? | Beim ersten Wunsch ja. Beginnt der Lernweg des Fachs mit einer Grundlage eines anderen Fachs, startet diese. Wird das Fach danach noch einmal genannt, lehnte der Schreibweg ab, obwohl das Fach weiter angeboten war. Ohne Autopilot bestand das schon vorher; mit der Änderung erreicht es auch der Autopilot. | Korrigiert im Planstatus. Ein Fach, dessen nächster Schritt schon läuft, wird nicht mehr als wählbar angeboten; es gibt dort nichts, wohin gewechselt werden könnte. Der Schreibweg bleibt unverändert: Ein Wechsel ohne Wirkung wird weiter abgelehnt, wie es zwei vorhandene Tests festhalten. Eigener Testfall. |
| OpenAI und Gemini | Beide lesen denselben Status; kein Vertrag und kein Test erwartet, dass Autopilot andere Fächer ausblendet. | – |
| Tests | Der wiederholte Fachwunsch fehlte. | Ergänzt. |

## Bestätigung der Korrektur

Codex hat die Korrektur auf dem PR-Stand `8cf0b20bd7` mit einer eigenen Probe an den echten Diensten bestätigt, mit und ohne Autopilot: Der erste Fachwunsch startet die Grundlage des anderen Fachs. Danach wird das genannte Fach nicht mehr als wählbar angeboten, und ein erzwungener zweiter Wechsel wird abgelehnt, ohne das laufende Ziel zu ändern. [Bestätigung](confirmation-8cf0b20bd7/confirmation.md)

Die Datei ist unverändert übernommen (SHA-256 `762557231ffe1c638c9b49fb2c424e2c689241d050dcbf2d3fd024f30f72518c`). Ihre Verweise auf `raw/` führen hier ebenfalls ins Leere.
