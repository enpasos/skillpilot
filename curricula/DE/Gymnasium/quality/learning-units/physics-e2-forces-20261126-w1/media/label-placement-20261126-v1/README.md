# W1: Korrektur der beiden kollidierenden Bildbeschriftungen

Nachfolger zur Rückmeldung vom 26. November 2026, 20:23 CET, auf `5cbb5da48c`.

| Ziel | Einzige Änderung in der vorhandenen SVG-Konstruktion | Kraftlänge / Referenz im fertigen Bild |
|---|---|---|
| `30ddb2d7` | `FR = −4 N`: `(700, 390)` → `(700, 350)` | 360 px für 4 N / 180 px für 2 N |
| `e2da5eec` | `FH = 2000 N`: `(460, 300)` → `(900, 450)` | 180 px für 2000 N / 90 px für 1000 N |

Die Beschriftungen stehen nun auf freiem Hintergrund. Beide Originale und beide Ersatzbilder wurden tatsächlich bei 1600 × 900 und 360 px geöffnet. Schrift, Zahlen, Pfeile, Körper, Fahrbahn und Legenden bleiben unverändert. Die alten SVGs reproduzieren die vorherigen JPGs bytegenau. Ein Vergleich der dekodierten JPGs findet außerhalb der beiden Beschriftungsbereiche einschließlich der zugehörigen JPEG-Blöcke kein verändertes Pixel.

Der etablierte Import wurde jeweils mit der deutschen kanonischen Physik-Landschaft, `physik`, dem bisherigen Anbieter `OpenAI / Codex image_gen; precise force diagram rendered from SVG`, dem tatsächlichen aktualisierten Produktionsprompt und CC-BY-4.0 ausgeführt. Die Alttexte wurden gegen die Ersatzbilder geprüft und bleiben unverändert. Der Katalog war unmittelbar vor und nach den zwei Importen bytegleich; die Bildkorrektur ändert keine Lernziel- oder Aufgabenobjekte. Die vier Kopien je Bild stimmen überein.

Die [Sichtprüfung](image-inspection.actual.json) hält die zwei neuen Autorenprüfungen fest. Die [aktuelle Fünfer-Entscheidung](image-decisions.actual.json) übernimmt die Entscheidungen für B, G und `5f289cdc` exakt und bindet nur deren aktuellen gemeinsamen Nachfolger. Es gibt keine neue Prüfung dieser drei unveränderten Bilder. Frühere Belege bleiben erhalten. Menschliche oder unabhängige Freigabe wird nicht behauptet.

[Native Prüfungen](native-checks.actual.json): fünf Pfeil-Bildentscheidungen akzeptiert, vier manipulierte Gegenproben verworfen; QA-Synchronität, globaler Assetcheck und Physik-Rollout mit verpflichtender vollständiger Bildabdeckung bestehen. Die Rollout-Zählung ändert nur eine zusätzliche Prüfliste und zwei protokollierte Nutzerkorrekturen.

Die [kompakte aktuelle Bindungsliste](current-images.actual.json) nennt die aktuellen Dateien. Originalkonstruktionen, Vorher-/Nachher-Ansichten, Pixelvergleich, Importprotokoll und native Rohbelege liegen außerhalb des Repositorys unter dem Alias `evidenceStore`, relativ `retention-inputs/image-label-placement-v1/`; alle konkreten Dateihashes stehen in Sichtprüfung und Prüfbeleg. Die ursprünglichen Konstruktionen sind unveränderte Mitglieder von `dossier-before-slim-20261126-v1.tar.gz`, SHA-256 `59a0a6247b94a5c47bd10701656f3c58e805c15c84916ef90874967825f7a58d`. Es wurde kein neuer Bildgenerator aufgerufen.
