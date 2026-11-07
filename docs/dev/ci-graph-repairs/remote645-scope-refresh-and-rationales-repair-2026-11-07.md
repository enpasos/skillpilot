# Lernkontextfeste Aktualisierung und aktuelle Quellenindizes

Der tatsächliche Remote-Lauf auf `6451880` scheiterte im Frontend an der
veralteten Fortschrittsanzeige und im Curriculum am veralteten Mathematik-
Quellenindex. Beide Ursachen sind im Branch lokal behoben. Die sechs
Prüfungen nach der tatsächlichen Übernahme bestehen; ein neuer Remote-Lauf
ist damit noch nicht nachgewiesen.

## Fortschrittsanzeige

Die bisherige Aktualisierung verwarf ein Ereignis, wenn bereits eine Abfrage
lief oder das Sammelfenster noch offen war. Die neue Version führt die letzte
ausstehende Aktualisierung nach. Beim Lernkontextwechsel bleibt deren eigene
Fortsetzung erhalten; veraltete Antworten und Timer dürfen weder die aktuelle
Aktualisierung verwerfen noch Daten des früheren Lernkontexts anzeigen.
Die Begrenzung auf eine laufende vollständige Aktualisierung und das bisherige
800-ms-Sammelfenster bleiben erhalten.

Der echte Browsergegenfall hält eine Antwort für A zurück, wechselt zu B und
sendet dort ein Aktualisierungsereignis. Die spät eintreffende Antwort für A
enthält absichtlich falschen Fokus und Zähler 999. Der korrigierte Branch liest
B genau einmal nach, zeigt dessen Fortschritt und lässt keine A-Daten aufblitzen.
Der identische Gegenfall scheitert beim ersten Reparaturentwurf. Auch der
ursprüngliche Ereignisburst mit erwarteten `2 von 2` bleibt streng geprüft.
Die Vorschau verwendet außerdem den tatsächlichen Backend-Ereignisnamen
`PREFERENCES_CHANGED`.

## Quellenindizes

Die gewöhnlichen Generatoren wurden mit den aktuellen Quellen ausgeführt.
Der öffentliche Mathematikindex und der vollständige Bericht enthalten die
korrigierte Beschreibung von `0c2ddfcd-1399-41ad-aaed-4f061812602a`; sechs
abhängige Berichtsdateien wurden ebenfalls regulär erneuert. Es gibt keine
Prüferänderung oder akzeptierte Fehlerbaseline.

Die unveränderten Umfänge sind 754 öffentliche Mathematikeinträge, 435
Physikeinträge und 807 vollständige Mathematikeinträge mit 53 bisherigen
Quellenroutengaps. Die aktuelle MEM-Abfrage bestätigt 260 konsistente Routen.
Das beseitigt nicht die verbleibenden Curriculum- oder Meilensteinfehler.

## Belege

Die aktive Arbeitskopie besteht den vollständigen Startup-/Scope-Browsertest
und alle fünf üblichen Quellenindexprüfungen. Der überprüfte private Nachfolger
bestand außerdem den bestehenden Ereignisburst, ESLint und den App-Typcheck.
Alle zwölf übernommenen Dateien stimmen bytegenau mit diesem Nachfolger überein.

- [Tatsächlicher Remote-Ausgangsfall und erster Entwurf](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/remote645-terminal)
- [Unabhängiger Root-Gegenfall zum Lernkontextwechsel](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/remote645-independent-queue-review)
- [Getrennt geprüfter Nachfolger mit Browser-Negativkontrolle](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/remote645-scope-safe-refresh-successor)
- [Tatsächliche Anwendung und sechs neue Prüfungen](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/remote645-reviewed-active-application)

Kanonische Quellen, QA-Freigaben, Meilensteinuntergrenzen und Produktionssysteme
wurden durch diese Reparatur nicht geändert. Der reguläre Gesamtbericht und
die weiterhin sieben verletzten Floors sind getrennte Befunde.
