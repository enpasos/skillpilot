# Additiver technischer Nachfolger: abgeleitete Source-Header

Die gemeinsame Methoden4-v2-/Split3-Komposition bleibt vollständig versiegelt und unverändert. Dieser kleine Nachfolger aktualisiert ausschließlich vier bereits vorhandene `summary`-Header in ganzen inaktiven Mappingdateien. Alle Mappingzeilen, Entscheidungen, Quellenpartner, Statusfelder, Zielobjekte, Ansichten, Fälle und Profile bleiben exakt erhalten.

Die tatsächlich gelesene normale Regel steht in `app/scripts/generateCurriculumQualityStatus.ts`, Funktion `readSourceExtractionPipelinesByLandscapeId`: gültige Quellziel-IDs werden einmal gezählt; sobald eine ihrer Zuordnungen `exact` ist, zählt das Quellziel als exact, andernfalls bei vorhandener partial-Zuordnung als partial. Die gleichnamigen Edge-Zähler der anderen Source-Snapshot-Funktion sind für diese Source-Extraction-Dateien nicht die passende Regel.

| Source | Header vorher exact / partial | Nachher |
| --- | ---: | ---: |
| BB | 98 / 107 | 97 / 108 |
| BE | 98 / 107 | 97 / 108 |
| HE | 127 / 75 | 125 / 77 |
| NI | 82 / 251 | 79 / 254 |

Der HE-Header wich bereits vor der Komposition von den damaligen tatsächlichen Mappingzeilen ab (128 / 74). Der neue Wert wird vollständig aus den aktuellen zusammengesetzten Zeilen berechnet. BY bleibt bei 277 / 55 unverändert. HB, RP und SN erhalten keinen neuen Header.

`SOURCE12.whole-current-composed-file-selection.with-derived-summary-refresh.neutral.json` ist die aktuelle Auswahl der zwölf ganzen Source-Dateien: vier neue After-Dateien und acht exakt erhaltene Vorgängerdateien. `CAS4.whole-summary-before-after-and-whole-file-pins.actual.json` enthält die ganzen vorherigen und neuen Header sowie vollständige Before-/After-Dateipins. Historische Originale werden nicht überschrieben.

Die begrenzte Neuberechnung und Retentionsprüfung bestand. Alle 89 Dateien des versiegelten gemeinsamen Vorgängers und sämtliche H-Eingaben bleiben unverändert. Die vorhandenen Schema-, Rollen-, DAG- und Scope-Ergebnisse werden wiederverwendet, da ihre Nutzdaten exakt gleich sind. Kein Gesamtbuild, neuer Host, normale Adoption oder neuer fachlicher Review. Strenger Gate-Zuwachs: 0. M7, menschliche Freigabe und Erprobung werden nicht behauptet.
