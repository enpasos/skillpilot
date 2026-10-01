# Biologie E-Phase: sieben gezielt geprüfte Bildbindungen

**Paketstand 2026-10-01:** Sieben bisher ohne primäres Bild geführte aktuelle E-Phasen-Ziele haben jetzt ein aktives RGB-PNG im Querformat 1672 × 941 Pixel. Jedes ausgewählte Original wurde vom Autor und mindestens einer unabhängigen KI-QA am tatsächlichen Bild sowie bei 360 und 680 Pixeln fachlich und visuell geprüft. Gutes vorhandenes Bildmaterial wurde für dieses Paket nicht ersetzt. Die V-KI-Entscheidung ist keine menschliche Freigabe.

| Ziel (Anfang) | Aktive Fassung | Unabhängiger Bildbefund |
| --- | --- | --- |
| `56663bb4` Tierentwicklung | v1 | KEEP, [Review A](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ephase-seven-new-images-20261001-v1/review-a.md) |
| `9d931642` Pflanzenentwicklung | v3 | v1/v2 HOLD, v3 KEEP, [Review B](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ephase-plant-development-20261001-v3/v3-review-b.md) |
| `a545b28f` Meristem-Signale | v2 | v1 HOLD, v2 KEEP, [Review B](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ephase-three-image-corrections-20261001-v2/review-b.md) |
| `7a79fda6` Membranmodelle | v1 | KEEP, [Review B](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ephase-seven-new-images-20261001-v1/review-b.md) |
| `dd196715` allosterische Hemmung | v1 | KEEP, Review B wie oben |
| `e566ae2f` RGT-Regel | v2 | v1 HOLD, v2 KEEP, Review B wie oben |
| `861fbc18` Transportprozesse | v1 | KEEP, Review B wie oben |

Die Originale liegen unter `curricula/DE/Gymnasium/visualizations/biologie/<ID>/<ID>.png`; `prompt.de.md` dokumentiert Provider, Format, Bildanweisung und Entscheidung. Für alle sieben stimmen Original, Public- und Backend-Static-Kopie bytegenau überein; die aktuelle Kanon-URL und der Alttext sind gesetzt. Im Biologie-V-Ledger steht `aiApproved: yes`, `humanApproved: no` mit dem Hash der tatsächlich gebundenen Datei.

**Gezielte Checks:** `npm --prefix app run check:goal-visualization-assets` PASS für 1742 Links in 21 Landschaften; `npm --prefix app run check:goal-visualization-qa -- --subject biologie` PASS. Ein erster Asset-Lauf meldete sieben fehlende `prompt.de.md`; diese Provenienzdateien wurden ergänzt und der Lauf bestand anschließend. `git diff --check` war nach den Textänderungen ohne Befund. Kein vollständiger QS-Lauf oder Build wurde pro Einzelbild gestartet.

**Strenger Fortschritt:** Dieses Bildpaket schließt allein kein neues curricularAtomic-Ziel streng ab: **Nettozuwachs 0, neue fachliche Abschlüsse 0, wiederhergestellte Gesamtbindungen 0.** Der letzte gebündelte zentrale Bericht **vor** diesen sieben Bildbindungen zeigte Biologie 29/363 und Chemie 58/376 streng, Mathematik 807/807 und Physik 478/478 M7. Die sieben Ziele brauchen weiterhin ihre übrigen aktuellen D/P/A/M-Nachweise. Der aktuelle Bericht wird nach dem stabilen D-/Source-Scope-Integrationsstand gebündelt erneuert; bis dahin wird kein höherer strenger Wert behauptet.

Ein weiterer bereits aktiver Biologie-Bildlink zu `5c2ce7b1` wurde wegen eines konkreten fachlichen Ziel-/Bildfehlers separat angehalten. Eine 16:9-Korrektur ist als **inaktiver Kandidat** unter `quality/goal-visualization-review/biologie-m7-5c2-protein-transport-correction-20261001-v1/` angelegt; sie zählt hier nicht als Freigabe.

**Nächster Schritt:** unabhängige 5c2-Bild-QA und gezielte Korrektur seiner Quellen-/Seitenbindung; danach die zwei betroffenen D-Kontexte und den zentralen Fünf-Gate-Bericht erneut prüfen. Menschliche Prüfung, Freigabe und Erprobung bleiben eigene Release-Gates.
