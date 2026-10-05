# Chemie/Biologie: KI-Transparenzinventar am 5. Oktober 2026

Die bestehende [Inventarprüfung](https://github.com/enpasos/skillpilot/blob/main/scripts/check_ai_transparency_inventory.mjs)
hat den stabilen lokalen Arbeitsstand nach den vier Bildimporten gemessen.
Basis-Commit: `693872e8ea8663384281d06f61858b0f8fef332f`; die hier gebundenen
Curriculum- und Assetänderungen waren bei der Messung noch nicht committet.
Das [Inventar](../legal/ai-transparency-inventory.json) wurde in genau vier
gemessenen Layer-A-Feldern aktualisiert.

| Messfeld | Vorher | Gemessen |
| --- | ---: | ---: |
| `goalVisualizations.count` | 1742 | 1745 |
| `goalVisualizations.fileExtensions.jpg` | 1366 | 1365 |
| `goalVisualizations.fileExtensions.png` | 376 | 380 |
| `goalVisualizations.providerCounts.Google Gemini / Nano Banana Pro` | 909 | 908 |
| `goalVisualizations.providerCounts.OpenAI / ChatGPT-Codex imagegen (model not exposed)` | nicht vorhanden | 4 |
| `goalVisualizations.c2paStructure.detected` | 1691 | 1694 |

Die Tabelle zeigt die einzelnen Einträge der beiden gemessenen
Objektfelder `fileExtensions` und `providerCounts`. Die vier neuen PNGs
gehören zu zwei neu bebilderten Biologiezielen, einem neu bebilderten
Chemieziel und dem ersetzten Brennstoffzellenbild. Deshalb beträgt der
Nettozuwachs drei aktive Visualisierungslinks.

Die übrigen gemessenen Werte sind unverändert: **21** kanonische
Landschaftsdateien, **5878** Ziele, **51** URLs ohne erkannte C2PA-Marker,
**56** Memory-Deck-Dateien, **730** lokalisierte Karten und **562**
unterschiedliche Karten-IDs. Der normale Checker bestätigt zusätzlich
**64** weitere gebundene Runtimebilder und **8** gebundene Audiodateien.

## Gebundener Bildstand

Für jedes dieser vier PNGs stimmen die SHA-256-Werte der kanonischen
Quelle, der Frontendkopie und der Backendkopie überein.

| Lernziel-ID | SHA-256 des aktiven PNGs |
| --- | --- |
| `73b66ead-e44a-5486-98e3-1fb3f99620a6` – Gentests beurteilen | `7d95b075b6e625c483d356e267414b43c94ad55d06f9eddac07772440a6ab485` |
| `3891b735-9d0d-5eef-b653-6ad58b9181f6` – Gentherapie prinzipiell erklären | `4b1f8fb9c085d357a5d57782ce7f1c9a192307ef121c6457a7d4281473b70d4c` |
| `b759d50d-0e82-5b10-89a2-fe5271106e50` – Brennstoffzellen verstehen | `fdb49b85bc5c1329c63024ae1cad443fd2f8b71c48cd3c07f8eb5f01162b9cc4` |
| `27e4fe9b-4796-579b-8f7d-06c65fb600c0` – Blei-Akkumulator beschreiben | `fdbfe4bfb250f09ad73c829be506629a7f0a2ffb73059c84bbf150b35a296f11` |

Kanonische Dateibindungen der Messung:

- `DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json`:
  `bf1f0db83fb572b882630cd25327633874e35126f6a014da697c90c1c87a644f`
- `DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`:
  `e9567f2b1016b21df81b00a39f2d9be999d3618f5ec295d760535b71ef052425`

## Messung und Prüfgrenzen

Ausgeführt und mit Exitcode 0 abgeschlossen:

```bash
node scripts/check_ai_transparency_inventory.mjs --emit-layer-a-patch
node scripts/check_ai_transparency_inventory.mjs
```

Der erzeugte Patch wurde vor der Übernahme auf die tatsächlichen
Messabweichungen geprüft. Das resultierende Inventar stimmt vollständig mit
dem vom Checker erzeugten Kandidaten überein.

Die bestehende Messregel liest aktuelle kanonische JSON-Dateien und deren
`goal-visualization`-Links aus dem Dateisystem. Ungetrackte aktive Imports
werden damit bereits gemessen. Unreferenzierte Kandidaten und historische
Bilder erhöhen die Link-, Provider- oder Dateiformatzähler nicht.
Zielbeschreibungsänderungen und neue D/P-Nachweise verändern diese Zähler
allein nicht.

C2PA bleibt die dokumentierte flache Containermarkerprüfung ohne
kryptografische Validierung. Die Inventarmessung erteilt keine inhaltliche
Bildfreigabe, M7-Auszeichnung, menschliche Freigabe oder Praxiserprobung.
Snapshot-Metadaten, Policies, Lizenz- und Provenienzaussagen sowie bestehende
menschliche Freigaben und getrennte Release-Gates wurden durch diese
Inventaraktualisierung nicht verändert.
