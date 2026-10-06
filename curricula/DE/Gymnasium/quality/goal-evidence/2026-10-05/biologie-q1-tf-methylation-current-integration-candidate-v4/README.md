# Biologie TF/Methylierung: geprüfter Integrationskandidat v4

**Inaktiv.** Der tatsächliche aktive Vorher-Check ergibt **38/363**. Der native
Zukunftscheck im begrenzten physischen Isolat ergibt **40/364 (11,0 %)**:
D40/P40/A364/M364/V47, sechs erforderliche Checks bestanden, keine blockierenden
Issues. Sämtliche vorher strengen 38 Ziel-IDs bleiben enthalten. Operativ ist
dieser Kandidat noch nicht integriert und erzeugt deshalb aktuell **0** neue
strenge Abschlüsse.

## Fachliche und technische Grundlage

Exakt übernommen werden die 38 vorgeschlagenen aktuellen Inputs des gefrorenen
`biologie-q1-tf-methylation-current-source-consumer-candidate-v3`-Pakets. Seine
112 gefrorenen Dateien bleiben unverändert. Beide unabhängigen fachlichen
D-A3-/D-B3-Runden und das separate P2-Dossier sind abgeschlossen und eingefroren.
Die früheren Autorenprofile und die vorhandenen A/M/V-Prüfungen bleiben erhalten.

Native `summarize`, Synthesis-Manifest, drei Resolutions, `finalize --write` und
erneutes `finalize` bestehen. Die neue Batch-Config verweist auf dieses separate
v4-Ausgabeverzeichnis; die v3-Batch-/Buch-/Kampagnenidentitäten bleiben für den
exakten geprüften Eingang erhalten. Weder A- noch B-Record-Bindungen werden
geändert. `native-finalbook/` enthält genau die tatsächlich von A/B geprüften
v3-Exportbytes und die hier nativ finalisierten zusätzlichen Abschlussartefakte.

Der zunächst nativ erneut erzeugte D3-Export ist unter
`first-native-preparation-export/` erhalten. Sein BookModel und alle fachlichen
Inhalte sind gleich; Chromium erzeugt neue PDF-Erstellungs-/Änderungszeitstempel
und damit einen neuen gebundenen Print-source-SHA. Für die Abschlüsse wird das
bereits tatsächlich geprüfte PDF bytegenau übernommen. Nur
`batch-manifest.configPath` und `configDigest` werden als technische
Relokationsbindung ausgewiesen und anschließend nativ geprüft. Das ist kein
neuer fachlicher Review und keine Anpassung unabhängiger Review-Hashes.

## Umfang und Nettozuwachs nach erfolgreicher aktiver Integration

| Ziel | Einordnung |
| --- | --- |
| `946ce2e7-c30d-5670-839d-003b0619c284` | TF: neuer aktueller fachlicher Fünf-Gate-Abschluss nach engerem Scope |
| `0ac51522-352c-50d1-8b95-8d3992b4db15` | DNA-Methylierung: neuer fachlicher Fünf-Gate-Abschluss, neue stabile Companion-ID |
| `8eb86a82-122d-5cae-8f80-bb2850b29c2f` | vorhandenes Gel: gezielte D-/Quellenbindung, kein neuer Fachabschluss |

Damit sind **+2 fachliche Abschlüsse**, **1 bestehende Wiederbindung** und **+1
aktuelles curricularAtomic-Ziel** vorbereitet. PCR erhält keinen neuen
Fachabschluss. Historische Gesamtzahlen werden nicht verwendet.

Der Quellenconsumer verwendet die konfigurierten aktuellen Mapping-Pfade.
Die aktuell tatsächlich geprüfte HE-Ausgabe Stand 01.08.2025 auf physischer und
gedruckter S.39 ist explizit über
`KC2024_BIOLOGIE_SEKII_STAND_20250801` gebunden. Die beiden korrigierten lokalen
Source-Goals tragen die TF/Methylierungs- beziehungsweise PCR/Gel-Komponente.
148 sonstige ältere Source-Goals erhalten im neuen Snapshot lediglich den
ausdrücklichen alten 2024-Dokumentenschlüssel; sie werden nicht neu fachlich
geprüft. Der schon als 2025/S.39 bezeichnete PCR/Gel-Eintrag bekommt die richtige
2025-Dokumentbindung. Der TF/Methylierungs-Eintrag bekommt zudem den aktuellen
Quellenverweis. Die ältere eigenständige PCR-Q1.2.10-Citation zur 2024-Ausgabe
bleibt als legitimer anderer Zeuge erhalten. Keine URL-Filterausnahme und kein
Löschen aller alten Quellen erfolgt.

Die vorhandenen breiteren bayerischen Regulations- und DNA-Analytik-Ziele
bleiben vollständig erhalten. Die drei geprüften Teilkomponenten schließen
deren Gesamtoperatoren nicht. Exakte kanonische Feldänderungen betreffen fünf
Zielobjekte: TF, Methylierung, den Q1.2-Cluster, den Abschluss-Endpunkt und den
Tumorsuppressor-Anwendungsnachfolger. Alle vorher strengen 38 vollständigen
kanonischen Ziele und V-QA-Zeilen bleiben gleich.

## Präziser Integrationsvorschlag

- `proposed-active-inputs.freeze.json` nennt alle 38 bytegenauen Inputs. Davon
  werden gegen den tatsächlichen aktiven Stand 22 Dateien geändert oder ergänzt;
  16 sind gleich.
- `central-registry.proposed.json` behält alle vier Fächer und verändert
  ausschließlich den Biologie-Eintrag. Änderungen: aktuelle vollständige A/M-
  Configs, neuer D3-Index mit ausdrücklicher Gel-Supersession und zusätzlich P2.
  Mathematik-, Physik- und Chemie-Einträge sind exakt erhalten.
- `full-atomicity.*` und `full-memory.*` enthalten die bereits geprüften
  vollständigen 364er-Entscheidungen; keine neuen historischen Reviews.
- `active38-and-future40-protection.actual.receipt.json` verbindet den
  tatsächlichen aktiven 38/363-Vorher-Check und den tatsächlichen 40/364-
  Zukunftscheck mit allen 38 unveränderten Ziel-/V-/Asset-Bindungen.
- `exact-selected-source-and-canonical-field-deltas.actual.json` gibt die
  exakten Feld- und Citation-Deltas aus; der allgemeine Compilerbefund bleibt im
  gefrorenen `biologie-original-source-active-mapping-remediation-v3`-Dossier.
- `integrate-reviewed-v4.py` führt standardmäßig einen **lesenden Preflight**
  aus. `--apply` ist für die getrennte Root-Integration nach eigener Prüfung.
  Es prüft alle frozen Kandidatenbytes und aktive Vorherbindungen und übernimmt
  nur die vorgesehenen Inputs plus Biologie-Eintrag. Aktuelle andere
  Registry-Fächer bleiben auch bei paralleler Fortsetzung erhalten. Dieses
  Dossier führt `--apply` nicht aus.

Das In-flight-Ledger wird vom Root-Integrator getrennt gepflegt; der Helper
schreibt es nicht. Die neue Methylierungs-ID ist kein bereits erledigtes
historisches Ledger-Ziel.

## Lokale Publication-/Abschluss-QS nach Root-Integration

Die bisher ausgegebenen lokalen nativen Biology-Publication-Artefakte beruhen
auf dem alten 363er-Stand und müssen nach Integration an einem stabilen Stand
neu materialisiert werden. Die hier geprüften nativen v3-Source-Sidecars sind
auf das exakte neue 364er-BookModel gebunden; sie dürfen nicht an einen alten
Publication-BookDigest angeheftet werden.

Der bestehende native `build:goal-books`-Builder erzeugt aktuelle Modelle,
PDF/HTML/Manifeste und OriginalSources automatisch mit der generischen aktuellen
Companion-Auswahl. Danach `check:goal-book-publication` und
`build:goal-book-original-sources --check` über die bestehende CLI verwenden.
Diese vollständigen lokalen Exporte und abhängigen Layer-A-Checks werden vom
Root an seinem stabilen Integrationsstand gebündelt. Hier wurde kein kompletter
App-/Goal-book-Publication-Build ausgeführt und nichts extern veröffentlicht.

Anschließend ist der aktive zentrale all4-Fünf-Gate-Bericht zu prüfen,
insbesondere Mathematik-M7 und Physik-M7 als geschützte Untergrenzen. Der
gezielte Zukunftsreport beweist deren Registry-Erhalt, ersetzt den abschließenden
aktiven all4-Check jedoch nicht. CQR-303/M7 für ganz Biologie und Chemie bleiben
weiter offene Gesamtaufgaben; 40/364 ist ein geprüfter Zwischenstand.

P2 bleibt `needs_human_review` / `ai_candidate`; V bleibt maschinelle Prüfung
mit `humanApproved: no`. Keine menschliche Freigabe, Erprobung, konkrete
Lernendenleistung, Runtime-/Plugin-/Sicherheits-/Datenschutzänderung, externe
Publikation oder Git-Operation wird behauptet.
