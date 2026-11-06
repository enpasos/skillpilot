# Gesamtnachlauf nach Mathematik- und Sprachkorrekturen

Der normale vollständige CQR-Producer einschließlich Memory-Prehook ist lokal
mit Exit 0 abgeschlossen. Sein Bericht vom `2026-11-06T18:13:50.840Z` enthält
die tatsächlich angewandten Mathematik-Memory- und fünf Sprachoperationen.
Alle 21 kanonischen Katalogprüfungen bestehen G15 und G42. Der allgemeine
Graphvalidator besteht für 593 Landschaften; die Compositionprüfung besteht
für 352 Views und 21 Kataloge mit null Fehlern und 2358 Warnungen.

Der getrennte harte Floorcheck endet mit Exit 1. Deutsch, Geschichte und Latein
erreichen M6; sieben geschützte Fachuntergrenzen bleiben offen:

| Fach | Ziel | Aktuell | Strukturbefunde |
| --- | --- | --- | ---: |
| Mathematik | M7 | M0 | 919 |
| Physik | M7 | M0 | 626 |
| Biologie | M7 | M0 | 375 |
| Chemie | M7 | M0 | 354 |
| Informatik | M6 | M0 | 59 |
| Politik und Wirtschaft | M6 | M0 | 603 |
| Wirtschaftswissenschaften | M7 | M0 | 104 |

Die Befundzahlen beschreiben CQR-001. Weitere offene Regeln bleiben separat
wirksam. Insbesondere lehnt CQR-202 im Informatik-Routenscope sechs generische
Abschlussprüfungen ab. Erfolgreiche Berichterzeugung ist kein bestandener
Meilenstein. Der [maschinenlesbare Gesamtbeleg](post-memory-orientation-current-cqr-2026-11-06.json)
bindet alle 21 Quellen, die unveränderte Floorpolicy, Reportbytes und tatsächlichen
lokalen Nachläufe. Die lokalen `tmp`-Logs sind nicht Bestandteil des Git-Archivs.

Der ältere [Remote-Lauf auf 5cb5e567](https://github.com/enpasos/skillpilot/actions/runs/42259521320)
ist vollständig beendet: fünf Jobs bestehen, Backend, Frontend und Curriculum
scheitern. Beim Backend ist genau ein Test rot: Niedersachsen/Informatik erwartet
22 Ziele und erhält 21; insgesamt wurden 2754 Tests ausgeführt, 19 übersprungen.
Beim Frontend scheitert die Fächerauswahl im Trainer-Gymnasium-Test. Beide
Fehler benötigen ihre konkrete Reparatur und anschließende Prüfung. Curriculum
scheitert an denselben sieben harten Fachuntergrenzen, nicht an einer
Frischeabweichung des Reports. Der [Remote-Beleg](remote-main-5cb-terminal-2026-11-06.json)
nennt alle acht Jobs und die tatsächlichen Fehlerstellen. Die späteren
Mathematik-, CQR-202- und Sprachkorrekturen sind in diesem alten Remote-Lauf
noch nicht enthalten.
