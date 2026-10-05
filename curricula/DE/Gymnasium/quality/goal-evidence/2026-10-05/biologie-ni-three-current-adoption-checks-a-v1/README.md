# Unabhängige NI3-Adoptionsprüfung A

Status: **candidate / ai_candidate**. Keine Source-Human-Freigabe, keine aktive Änderung und keine P-Inhalte gelesen. Die tatsächlichen Original-PDF-Seiten 87, 88 und 89 wurden als Bilder angesehen und als Text gelesen. Die Prüfung bleibt auf das NI3-Paket begrenzt.

## Ergebnis

Die fünf gezielten Quellzellen, das FW6-003-Retirement und die drei neuen kanonischen Kompetenzen sind fachlich tragfähig. **MAPPING-2: 7 PASS. MAPPING-3: 6 PASS, 1 HOLD.** Alle 14 Einzelbefunde stehen in [mapping-2-3.independent-checks.frozen.json](mapping-2-3.independent-checks.frozen.json).

| Schritt | Check | Befund |
|---|---|---|
| MAPPING-2 | source-goals-created | PASS |
| MAPPING-2 | passage-to-source-goal-coverage | PASS |
| MAPPING-2 | source-goal-ids-unique | PASS |
| MAPPING-2 | source-goals-reference-passages | PASS |
| MAPPING-2 | source-goal-trace-complete | PASS |
| MAPPING-2 | source-goal-count-peer-baseline-local-audit | PASS, gezielte Zählungsabstimmung |
| MAPPING-2 | current-selected-source-adoption-review | PASS |
| MAPPING-3 | mapping-2-complete | PASS als gekoppelter Adoptionskandidat |
| MAPPING-3 | m3-review-file-present | PASS |
| MAPPING-3 | m3-review-decisions-reference-source-goals | PASS |
| MAPPING-3 | m3-review-targets-exist | PASS gegen staged Canonical |
| MAPPING-3 | m3-all-source-goals-reviewed | PASS für entschiedene Datensätze; Abdeckung gesondert |
| MAPPING-3 | m3-all-source-goals-covered-by-canonical | **HOLD für vollständige fachliche Abdeckung** |
| MAPPING-3 | current-selected-source-adoption-review | PASS |

Die strukturelle Prüfung bestätigt 123 eindeutige Source-Ziele, 123 entschiedene Gruppen und 334 eindeutige Mappingzeilen mit gültigen Zielen. 118 Source-Records und Entscheidungen sowie 328 Mappingzeilen bleiben exakt gegenüber dem aktuellen v2-Vorgänger erhalten. Die sechs betroffenen Gruppen reduzieren ihre Zeilen von 20 auf 6. Fünf Source-Zellen ändern sich; FW6-003 entfällt. Es wurde keine historische Gesamtprüfung neu durchgeführt.

## Konkreter HOLD

Der erhaltene aktuelle Befund zu `ni-biology-seki-kc2015-fw6-008-d14910ea` lässt den selbstständigen Nachweis der Rekombinationsprinzipien ausdrücklich offen. Die tatsächliche Originalzelle auf Seite 87 verlangt diese Prinzipien auf Grundlage der Meiose. Die verbleibenden Ziele beschreiben Mitose/vereinfachte Meiose beziehungsweise vergleichen Teilungszahl, Tochterzellzahl und Chromosomensatz; sie liefern keinen expliziten Rekombinationsnachweis. `mapped` und die strukturelle Abdeckung 123/123 dürfen diesen dokumentierten offenen Fachbefund nicht in eine vollständige Abdeckung umdeuten.

Die Statusnormalisierung leitet nicht blockiertes MAPPING-3 aus den strukturellen Counts ab. Deshalb schlägt die exakte Metadatenkandidatin **MAPPING-2 complete, MAPPING-3 blocked, currentStep MAPPING-3** vor. Das ermöglicht die gezielte NI3-Adoption, ohne volle Quellenabdeckung zu behaupten.

Drei unveränderte Source-Metadaten-Caches (`FW6-008`, `FW7-003`, `FW7-012`) enthalten noch das bereits aus dem aktuellen v2-Mapping entfernte Trisomie-Ziel `0dd8380d-b542-5126-8d8e-f95d9ccded90`. Dieser erhaltene Widerspruch ist im Befund dokumentiert. Die geprüften Status-/Atlashelper lesen diese `canonicalTargets`-Caches nicht; die tatsächlichen Mappingzeilen und Entscheidungen bilden die operative Route. Die 118 Records wurden deshalb erhalten, ohne den Widerspruch zu verdecken.

## Drei Atome und zwei Eltern

Die [eigenständigen Beschreibungsentscheidungen](target-descriptions.independent-verdict.candidate.json) lauten jeweils **KEEP**:

- `359e6313-cd86-54d1-bee5-8e680101dc32`: beobachtbare innerartliche Variation über Generationen ohne vorgegebenes Entwicklungsziel; Originalspalte Ende Jg. 6 auf Seite 89.
- `0263fb84-33b1-52a3-a47e-dad56be7c9bc`: Gen–Genprodukt–Merkmal als einfacher Zusammenhang ohne molekulargenetische Aspekte; zwei gemeinsam stützende Originalzellen, zusätzliche Spalte Ende Jg. 10 auf Seite 88.
- `36d3bf01-e68b-55be-8e20-5652ada36a51`: Erbgleichheit durch Verteilung gegebener identischer Chromosomenkopien begründen; zusätzliche Spalte Ende Jg. 10 auf Seite 87. DNA-Replikationsmechanismus und Meiose werden nicht zu weiteren Voraussetzungen.

Die beiden Eltern ändern ausschließlich `contains`: Grundlagen 7→8 Kinder, Genetik 10→12 Kinder. Alle bestehenden Kinder und übrigen Felder bleiben erhalten. Die tatsächlichen Repositoryhelper bestätigen die fünf aktuellen Fingerprints, direkten NI-Bindungen und die Grenzen gegen unbelegte Quellenvererbung. Die künftige Menge umfasst **366 curricularAtomic-Ziele** (363+3), insgesamt 444 kanonische Records. Das ist eine geprüfte Kandidatenmenge; die aktive semantische Registry wurde nicht geändert.

## Exakte Übergabe

- [Erlaubte Source-Evidenzmetadaten](allowed-source-evidence-metadata.delta.candidate.json): nur `qualityReview` und `pipelineStatus`, mit aktuellem Binding und begrenzter AI-Autorität.
- [Erlaubte Mapping-Evidenzmetadaten](allowed-mapping-evidence-metadata.delta.candidate.json): begrenzter Adoptionsstatus; alle 334 Zeilen und 123 Entscheidungen bleiben gebunden.
- [Scanner und Bytearchivroute](scanner-and-byte-archive.route.candidate.json): alte Source-Datei und beide alten Review-Dateien nach SHA-verifiziertem Bytearchiv außerhalb beider Scanner aus den aktiven Pfaden entfernen; genau ein aktueller Nachfolger je Lane. Die Archivoperation wurde hier nicht ausgeführt.
- [Validierung](validation.json): begrenzte Kandidatenprüfung PASS; alle gebundenen Inputs und aktiven Quellpfade unverändert.

[Frozen Receipt](frozen-receipt.json): `af8e23d7d5e4316ebbc49e774e17afd8646c2a5cc01f6ee9776cc8b79915a425`.

Der Source-/D-Befund wurde vor jeder P-Lektüre eingefroren; P-Inhalte wurden auch danach nicht gelesen. Tatsächliche Zeitbeobachtungen und die nicht zugängliche Modell-ID sind in [execution-parameters.json](execution-parameters.json) dokumentiert. Es werden keine API-Parameter, Human Approval, vollständige M7-Abdeckung oder aktive Integration behauptet.
