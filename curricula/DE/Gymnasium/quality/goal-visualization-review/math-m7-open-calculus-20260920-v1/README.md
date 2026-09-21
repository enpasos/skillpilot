# Mathematik: aktuelle Bildprüfung B043h/B041h

Stand: 20. September 2026. Informierte KI-Erstprüfung von genau 17 aktuell beanspruchten Zielen. Alle 17 bestehenden Raster wurden tatsächlich mit `view_image` geöffnet; Quelle, Webkopie und Backendkopie wurden per SHA-256 verglichen und sind jeweils bytegleich. Historische Befunde wurden anschließend mit dem heutigen Bild und Zieltext abgeglichen. Keine neue Blindrunde, Generierung, Freigabe oder zentrale Anrechnung.

[Vorbereitungsreceipt](preparation-audit.json) enthält je Ziel Pfad, Hash, konkrete Prüfungen, Bildbefunde und getrennte Text-/Strukturarbeit. Zwölf Korrekturprompts sind sofort für gezielte generative Kandidaten bereit. Ein weiterer bleibt von der fachlichen Scopeentscheidung abhängig. Technische IDs stehen ausschließlich in Dateipfaden und Receipt, nicht im Providerprompt.

| Entscheidung | Ziele |
| --- | --- |
| Konkrete Bildkorrektur vorbereitet | alle elf B043h-Ziele sowie `34604a97…` aus B041h |
| Bestehendes Bild KEEP | `31be24f0…`, `0d21097c…`, `23c8b5f9…`, `19481f5d…` |
| Korrektur nach Scopeentscheidung | `809ef78a…`: Atomizitätsdissens offen; falsche Y-Skala und Optional-Markierung separat dokumentiert |

Die vier KEEP-Bilder haben korrekte mathematische Beispiele. Ihre offenen Beschreibungspakete betreffen getrennt Stammfunktions-Atomizität, Kettenregelverständnis, Anfangsbestand oder DE/EN-Parität. Die korrekten Bilder ersetzen diese Entscheidungen nicht und werden dafür nicht neu erzeugt. Beim Bestands-/Mittelwertziel `809ef78a…` ist der vorbereitete Prompt nur für die heutige gebündelte Darstellung passend; ein Split verlangt erst eine andere fachliche Bildzuordnung.

Bei den B043h-Bildern wurden die historischen Fehler erneut unmittelbar gesehen: falscher Anfangswertpfeil, Oszillatorlabel/Phasenbild, falsche Kurvenhöhen, doppelte Minuszeichen, widersprüchliche Punktkoordinaten, falsche Ursprungsspiegelung, falsche Reihenfolge von Streckung und Verschiebung, Achsenmaßstäbe sowie fehlerhafte Umkehrgraphen. Stil ist kein Austauschgrund. Gute Bildteile und Rechnungen bleiben Bezugspunkt der gezielten Korrekturen.

Die Kandidatenkontrolle und Integration koordiniert der Hauptagent. Jeder tatsächliche neue Kandidat braucht eigene Sichtprüfung und aktuelle Inhaltsbindungen. Bestehende QA-Ledger, Registry, Claims, Kanonik und Geschichte wurden hier nicht verändert.
