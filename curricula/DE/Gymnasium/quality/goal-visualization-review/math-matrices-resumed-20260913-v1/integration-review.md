# Drei Matrixbilder: korrigierte AI-Piloten

Review date: 2026-09-13
Reviewer: Codex root (informed AI integration review)

Die bestehenden, konkret dokumentierten Bildfehler begründen die drei gezielten
Korrekturen; der Generatorwechsel allein wäre kein Grund. Die eingebaute
ChatGPT/Codex-Bildgenerierung `image_gen` erzeugte je einen Korrekturkandidaten
mit dem alten Bild als Änderungs-/Stilreferenz. Der genaue Modellname ist nicht
bekannt. Die tatsächlichen Prompts stehen in `<goalId>.prompt-v1.md`, die
zusätzlichen informierten KI-Prüfungen in `<goalId>.informed-ai-review-v1.md`.
Diese zweite Sichtprüfung war nicht blind gegenüber Korrekturauftrag/Prompt.

| Lernziel | Entscheidung | Aktiver PNG-SHA-256 |
| --- | --- | --- |
| `4fb40e58-58c1-5964-b58e-3347a8022b97` | `accepted_pilot_after_regeneration` | `4b36f820723b40eecff0fc4e2d8d40c3d551eeb43dac1f8c6f58c8adfe20ff08` |
| `6ebdc8cc-3393-5eb3-aadb-107e4f6d12b8` | `accepted_pilot_after_regeneration` | `f9f5919b014cfa4de1df6f3453a8f531f0bd1221d49bcc03fa763093757ec211` |
| `304111dd-426b-520b-a275-3fa37da1b0e0` | `accepted_pilot_after_regeneration` | `add0b17d0ea7d252f99de72a54c4abaa879e40f087f365ccaf2c40f7c2a5f14b` |

Root hat die drei tatsächlichen PNGs erneut angesehen und sämtliche dargestellten
Produkte, Summen, Differenzen, Vorzeichen und Dimensionsangaben nachgerechnet.
Skalarmultiplikation enthält keinen doppelten Faktor mehr; Add/Sub verwendet
positionsgleiche Felder ohne fehlleitende Zellpfeile; beim Matrixprodukt sind
Faktordefinitionen getrennt und sowohl AB (2×2) als auch BA (3×3) korrekt.
Die kleine Orange/Gelb-Variation bei Add/Sub vertauscht keine Position.
Notation, Alttexte und aktueller Zielumfang stimmen überein. Der vertraute
Illustrationsstil bleibt erhalten; alle anderen Mathematikbilder bleiben KEEP.

Vor dem nativen Import wurden die alten JPGs, die ursprünglichen Prompts sowie
die vollständigen alten Ziel-/QA-Daten unter `history/<goalId>/` gesichert.
Die JPGs wurden erst nach Prüfung der archivierten Hashes und aller drei neuen
PNG-Kopien aus den aktiven Quell-, Frontend- und Backendverzeichnissen entfernt.
Sie sind aus dem Archiv vollständig wiederherstellbar und werden dort nicht
vom Asset-Deploy eingesammelt. Historische Reviewpakete wurden nicht verändert.
Neue Quellen liegen unter `curricula/DE/Gymnasium/visualizations/mathematik/`,
mit je `<goalId>/<goalId>.png` und dem tatsächlichen `prompt.de.md`.
Frontend- und lokale Backendkopie stimmen bytegenau mit jeder Quelle überein.

Der native QA-Generator hat alte Bildfreigaben bei Hashwechsel verworfen.
Erst danach wurden exakt diese drei neuen Hashes anhand der tatsächlichen
Prüfungen als `aiApproved: yes` erfasst. `humanApproved: no`, `reviewStatus: pilot`
und die Trennung zur Releasefreigabe bleiben erhalten. Die drei Original-QA-
Records sind archiviert; es wurde keine menschliche Freigabe übertragen.

Das native neue B047-Paket bindet die aktuellen Ziel-/Bild-/Kontextdaten:
BookModel `sha256:467419176f0c80d50129d371a7069a2b687319e70a6f5719fb2c10d1349f2e5c`,
Bundle `sha256:8171596317dcaccf188e4858d79e92e00f269762670f4a8026768517ecde2247`.
Root hat alle drei tatsächlichen Zielseiten (physische PDF-Seiten 3–5) bei
1500-Pixel-Seitenhöhe visuell geprüft: ganze Bilder, lesbare Rechnungen, vollständige
Zieltexte und Kontextverweise, keine abgeschnittenen Inhalte. Der native Renderer
meldet drei Zielseiten auf drei Seiten. Das ist keine reale Host-/Handyabnahme.
Die beiden getrennten Blind-D-Runden und eigenständigen P-v2-Profile bleiben
zusätzliche Abschlussbedingungen; dieser Bildbeleg allein zählt keinen Abschluss.

QA-/Rollout-Parität und alle neun geschützten Reifegraduntergrenzen bestehen.
Das Transparenzinventar wurde ausschließlich auf die gemessenen Änderungen
aktualisiert: JPG −3, PNG +3, Nano-Banana-Provider −3, tatsächlicher
image_gen-Provider +3. Anzahl und C2PA-Strukturmarker bleiben unverändert;
der normale Inventarcheck besteht. Strukturmarker sind keine Zertifizierung.
Keine Runtime-, Datenschutz-, Sicherheits- oder Pluginverträge geändert,
keine Remote-Veröffentlichung durch diesen lokalen Import.
