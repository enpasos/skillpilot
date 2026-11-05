# Mathematik: Arbeitsstand der Lerneinheiten-Umsetzung

Stand: 5. November 2026. Dieser Nachweis ergänzt den
[Umsetzungsplan](learning-units-implementation-plan.md); er ersetzt dessen
Abnahmen nicht. Aktiver Auftrag ist **S2 bis einschließlich S4**, also die
vollständige Mathematik-Umsetzung. Ein erster Vertrag ist ein Zwischenergebnis.

## Gesicherte Grundlage

- Basis: `main` nach Merge von [PR #81](https://github.com/enpasos/skillpilot/pull/81),
  Commit `0ce5a8d791eeb9783a919195fd8590bfb79f3595`.
- Neuer Arbeitsbranch: `feat/mathematics-learning-units`.
- S1 ergänzt die Lernkarte im vollständigen Cockpit. Die erforderliche CI des
  Kandidaten bestand; der Owner meldet den laufenden Rollout. Dessen Smoke-Test
  und eine echte Coach-Hostabnahme sind damit noch nicht nachgewiesen.
- Grundlegende Analyse und unabhängige Reviews: Astra Ultra. Technische
  Umsetzung, Inventarisierung und Tests: 6.1 Sol Ultra. Detailentscheidungen
  erfolgen innerhalb des bestätigten Konzepts selbständig.

## Lieferstücke und offene Abnahmen

| Stufe | Aktuelle Arbeit | Noch kein Erfolgsnachweis für |
| --- | --- | --- |
| S2 | Präzise bestehende Skalarprodukt-/Projektionskompetenz, eigenes Prüfungsziel, Erwerbszuordnung und unveränderlichen Aufgabenanspruch prüfen. | Veröffentlichten Vertrag mit vollständiger Quellenbindung und unabhängiger Inhaltsprüfung. |
| S3 | Gemeinsamen Compiler und M-only-Evaluator, Eigentumsbindung und Katalogzulassung aufbauen. | Produktive gemeinsame Anerkennung in Frontier, Cockpit, Coach und Planung; Performance-/Regressionsabnahme. |
| S4 | Tatsächliche native Mathematikangebote über Backend, Planner und übrige GUI-Einstiege inventarisieren; passende Bausteine aus PR #79 prüfen. | Vollständige Einheits-, Aufgaben- und Kartenabdeckung aller angebotenen Mathematikumfänge und deren aktuelle QA. |

Der Angebotsnenner wird erst nach Abgleich aller tatsächlichen Einstiegswege
fixiert. Ein Plannerlauf allein darf andere GUI-Angebote nicht unbemerkt aus
dem Auftrag entfernen. Alte Zahlen und Dateizahlen aus PR #79 sind keine
aktuellen Abnahmeergebnisse.

## Verbindliche technische Grenzen

Eigene Ziele werden aus autoritativen Program-/Placementdaten gebunden; weder
Baumansicht noch Fokus oder besuchter Lehrplan erzeugen Erwerbsrechte.
Nur das vorhandene binäre explizite M wird gespeichert. Abgeleitete Anerkennung
aus gültigen unveränderlichen Verträgen gilt global; Prüfungen und Karten
bleiben explizit. Die vollständige transitive Nachfrage passiert auch bereits
gemeisterte Zwischenziele und externe Unterstützung. I fließt nicht erneut in
die lokale Ableitung ein.

Gesamtfortschritt berücksichtigt gültiges I; Periodenkontingente und ihre
Historie zählen nur datierte explizite Abschlüsse. Neue Einheiten führen keine
zusätzlichen technischen Zugangssperren ein. Jede Lieferstufe muss unabhängig
mit der bisherigen Produktionskonfiguration nutzbar bleiben.

## Selektive Nachnutzung von PR #79

Quelle ist Remotehead `802f333f80c58d3409ab5d9fb3e9913fecafbf54` von
[PR #79](https://github.com/enpasos/skillpilot/pull/79). Der zusätzliche lokale
Testcheckpoint `4f1241b634c7e399c7651b90425b556acd4610f6` ist separat zu benennen,
wenn daraus Tests übernommen werden.

| Baustein | Entscheidung und erneute Prüfung |
| --- | --- |
| Native Angebotsauflösung aus dem früheren Integritätstest | Discovery-/Projektionsharness nachnutzen; heutige Backend-/Plannerauflösung und IDs erneut ermitteln. |
| Aufgaben, Rubriken und Quellen | Paketweise übernehmen, soweit Kompetenzanspruch und historische Identität passen; neue Eigentums-/Anwendungsprüfung erforderlich. |
| Graph- und Cachebausteine | Bestehende main-Basis zuerst prüfen; volle transitive Nachfrage und unveränderliche Verträge ergänzen. |
| Mastery-Stopp und frühere scoped Waiver | Keine Übernahme dieser abgelösten Semantik. |
| Umtypisierung alter Verständnisziele zu Prüfungen | Keine pauschale Übernahme; historische Verständnisbedeutung bewahren. |
| Alte QA-/M7-/CI-Ergebnisse | Nur Historie; am neuen Kandidaten neu prüfen. |

Commits und CI werden am jeweiligen Kandidaten dokumentiert. Lokale Tests,
terminale GitHub-CI, Deployment und beobachtete Hostabläufe bleiben getrennte
Nachweise. Ein Merge, Produktionsrollout oder eine Pluginveröffentlichung ist
durch diesen Arbeitsauftrag nicht zusätzlich autorisiert.
