# Chemie/Biologie M7: pausierter Commit-Zwischenstand (1. Oktober 2026)

Die Zielverfolgung ist auf ausdrücklichen Wunsch des Product Owners pausiert. Dieser Stand ist eine maschinelle QS-Zwischenaufnahme, keine M7-Erklärung, menschliche Prüfung, Freigabe oder Erprobung. Das aktive [Goal](chemie-biologie-m7-goaltext-2026-09-30.md) bleibt inhaltlich erhalten; während der Pause werden keine weiteren Fachpakete integriert.

## Aktueller maschineller Stand

Maßgeblich sind die aktuellen curricularAtomic-Ziel-IDs in der zentralen Registry und der am 1. Oktober 2026 um 02:35 UTC erzeugte [Curriculum-Statusbericht](status/curriculum-quality-status.json). Der gebündelte zentrale Fünf-Gate-Check hatte null Blocking Issues und alle sechs Pflichtchecks je Fach bestanden.

| Fach | Streng D∩P∩A∩M∩V | Offene aktuelle Ziele | Reifegrad | CQR-303 |
| --- | ---: | ---: | --- | --- |
| Biologie | 35/363 | 328 | M6 | WARN |
| Chemie | 58/376 | 318 | M6 | WARN |
| Mathematik | 807/807 | 0 | M7 | PASS |
| Physik | 478/478 | 0 | M7 | PASS |

Biologie hat D 35, P 35, A 363, M 363 und V 42 aktuelle Einzelbindungen. Gegenüber dem Ausgangsstand 31/362 sind vier Ziele fachlich neu streng abgeschlossen, bei einem zusätzlichen aktuellen BW-Ziel im Nenner. Die früheren 31 Abschlüsse wurden mit aktuellen Bindungen erhalten; die D-/P-Bindungen für `1984fd66` und `5c2ce7b1` wurden gezielt wiederhergestellt und sind **keine** zusätzlichen neuen Fachabschlüsse. Die sieben neuen E-Phasen-Bilder und die 5c2-Bildkorrektur wurden fachlich und in 360-/680-Pixel-Ansichten geprüft; ihre V-Bindungen allein erzeugen keinen strengen Fünf-Gate-Abschluss. Chemie hatte im dokumentierten [B009-Paket](chemie-b009-three-current-integration-2026-10-01.md) netto drei neue strenge Abschlüsse auf 58/376 erreicht.

## Fachliche Grenzen des Zwischenstands

Der globale Biologie-Capstone nennt weiterhin 201 aktuelle Ziele, die sonst keine lokale Prüfungsdeckung haben, obwohl seine vier Aufgaben diese 201 Ziele nicht materiell nachweisen. CQR-101-PASS bestätigt hier nur die strukturelle Route. Neue E-Phasen-Aufgaben sind ausschließlich inaktive Entwürfe: der unabhängig nachgeprüfte Zell-/Protein-Entwurf v2 ist als Kandidat KEEP; die RGT-Aufgabe v3 und die Pflanzen-/Meristem-Aufgabe v1 bleiben wegen nachgewiesener Bestehenslücken HOLD. Keine dieser Aufgaben wurde in den aktiven Kanon integriert oder als Abschluss gezählt. Separate menschliche Release-Gates bleiben offen.

## Commit-Prüfung

Am stabilen Integrationsstand bestanden `quality:deep-understanding-rollout:check`, `quality:curriculum-status:check` einschließlich neun geschützter Reifegrad-Untergrenzen, `check:goal-visualization-assets` (1.742 Links in 21 Landschaften), `check:goal-visualization-qa`, `test:deep-understanding-rollout`, `test:goal-description-rollout-synthesis`, `test:goal-description-rollout-batch`, `test:goal-visualization-qa-status` und `git diff --check`. Alle geänderten oder neuen JSON-Dateien waren parsebar. Für diesen Commit-Zwischenstand wurde kein vollständiger App-Build oder menschlicher Release-Check behauptet.

Beim Fortsetzen zuerst den zentralen Bericht und das In-flight-Ledger erneut lesen, dann nur aktuelle offene Ziele und belegte HOLD-Befunde bearbeiten. Historische Reviews und Kandidaten bleiben erhalten; ein späterer Commit muss aktive Dateien und die zugehörigen neuen Nachweisartefakte gemeinsam aufnehmen.

Der Stand liegt auf dem lokalen Branch `curriculum/chemie-biologie-m7-pause-20261001`. Alle 2.989 betroffenen Pfade sind für einen Commit vorgemerkt; es gibt keine ungestagten oder unversionierten Änderungen. `git diff --cached --check` besteht. Ein Commit oder Push wurde nicht ausgeführt.
