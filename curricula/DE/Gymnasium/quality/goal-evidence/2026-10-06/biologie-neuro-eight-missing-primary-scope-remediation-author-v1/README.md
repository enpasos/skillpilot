<!-- SPDX-License-Identifier: Apache-2.0 -->

# Acht fehlende aktuelle Neuroziele: Primärquellen-Rohpaket

## Status und Reichweite

**Author-Rohpaket für zwei unabhängige Prüfungen. Keine formale Freigabe, keine aktive Änderung.**

Der unveränderte versiegelte TH-19/HH-21-/Neuro21-Bericht dient ausschließlich als Routing. Sein tatsächlicher Quellenatlas blieb bei **382 von 390** aktuellen atomaren Biologiezielen. Dieses Paket untersucht die dort tatsächlich fehlenden acht ganzen Ziele erneut anhand frischer amtlicher Primärquellen. Es führt keinen Quellenatlas-, BookModel-, PDF-Build oder zentralen QS-Lauf aus und behauptet keine Wiederherstellung der 390er-Union.

Alle acht ganzen aktuellen Ziele bleiben Source HOLD. Zu jedem stehen der ganze aktuelle DE/EN-Text, verfasste historische HE-Zeugen, tatsächliche Originalbestandteile, Source-IDs/Originalanker, Stufen-/Kursgrenzen, eine minimale inaktive DE/EN-Korrektur und konkrete offene Bestandteile im Roh-JSON. Die Kandidaten behalten ihre stabilen IDs; 472 kanonische Knoten und sämtliche Kanten bleiben erhalten. Außerhalb der acht Ziele bleiben 464 ganze Objekte exakt. Die aktuell geschützten Bio74-Ziele werden auch im inaktiven Kandidaten nicht geändert.

## Tatsächlich erneut gelesene Primärquellen

Vier amtliche öffentliche Dokumente wurden frisch abgerufen und gebunden:

| Quelle | Tatsächliche Stelle | Nachweis |
| --- | --- | --- |
| [HE KC Biologie 2024](https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf) | Physische und gedruckte Seite 43: Q2.3/Q2.4; Seite 33: Verbindlichkeitsübersicht | Frischer bytegleicher PDF-Abruf, echte Raster beider Seiten erzeugt **und tatsächlich angesehen**, Originaltext/BBox erhalten |
| [BY 13, erhöhtes Anforderungsniveau](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/erhoeht#313324) | Lernbereich 2, echter HTML-Anker `313324` | Vollständige 14 Kompetenzerwartungen und 16 Inhaltspositionen des Neuroabschnitts frisch online gelesen |
| [BY 13, grundlegendes Anforderungsniveau](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/grundlegend#314384) | Lernbereich 2, echter HTML-Anker `314384` | Vollständige sieben Kompetenzerwartungen und acht Inhaltspositionen des Neuroabschnitts frisch online gelesen |
| [NW KLP Biologie Gymnasium Sek I 2019](https://lehrplannavigator.nrw.de/system/files/media/document/file/g9_bi_klp_-3413_2019_06_23_0.pdf) | Physische und gedruckte Seite 35, IF7/UF1 | Frischer bytegleicher PDF-Abruf, echter Raster tatsächlich angesehen; separate Diagnose |

Die tatsächlichen HE-/NW-PDF-Digests sind `52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558` und `536d51639cab388fc2966540fc9f9538327ea024e9d906a76792cee335b354a5`. BY hat HTML-Anker und keine behaupteten gedruckten/physikalischen Seiten. Die HTML-Snapshots und vollständigen Originalabschnitte bleiben erhalten.

**Kursgrenzen:** HE nennt die gemeinsame grundlegende Ebene ausdrücklich für Grundkurs und Leistungskurs und die zusätzliche erhöhte Ebene nur für den Leistungskurs. Die amtlichen BY-Überschriften heißen grundlegendes bzw. erhöhtes Anforderungsniveau. Projektionsprofile GK/LK werden davon getrennt ausgewiesen. NW Sek I besitzt hier kein GK/LK-Profil.

**Zusätzliche echte HE-Grenze:** Q2.3 ist verbindlich; Q2.4 ist in der Originalübersicht nicht eines der verbindlichen Q2-Themenfelder 1 und 3. Der Sinnesorgan-/Transduktionsbullet auf Seite 43 ist daher kein allgemeiner HE-GK/LK-Pflichtbeleg. Die alten selbstverfassten `Q2.3.2`, `.3`, `.11` bis `.16` sind keine amtlichen Einzelbullets. Auch die neuen Positionskeys sind offen deklarierte Autorenlocators.

## Acht inaktive Kandidaten

| Aktuelles Ziel | Vorschlag bei derselben ID | Offene Grenze |
| --- | --- | --- |
| Hebbsches Lernen und Netzwerke | Vorgegebene Hebb-Regel als Lernmodell anwenden | Hebb bleibt deklarierte Modellspezialisierung; keine benannte separate Originalpflicht |
| Sensorische Codierung | Rezeptor-/Transduktionsdarstellungen und Reizstärke-/Reizdauer-Codierung deuten | Keine belegte vollständige Dreierpflicht Frequenz-/Orts-/Populationscode; keine allgemeine HE-Q2.4-Pflicht |
| Neuronale Netzwerke modellieren | Gegebene Mehrzell-Verschaltung, postsynaptische Potentiale vergleichen, Erregung/Hemmung ableiten | Keine erfundene eigene Topologie- oder Konvergenz-/Divergenzpflicht |
| Neuromodulation und Neurotransmitter | Serotonin-Wiederaufnahmehemmer an gegebenem Modell als begrenzte Depressionskomponente erklären | Keine Dopamin-/Serotonin-Systembreite; keine klinische Ganzquellenfreigabe; HE-Hormonbullet nur unpassender Kontext |
| Signalverarbeitung und Plastizität | Verbindungsänderung und gleiche Eingangssignale an gegebenen Netzmodellen erklären | Deklarierte Modellspezialisierung; keine eigene wörtliche HE-GK-Routine |
| Langzeitpotenzierung und -depression | Vorgegebene langfristige Wirksamkeitsänderungen/Befunde als Lernmodelle einordnen | LTP/LTD bleiben Autorenmodell; keine benannte Mechanismenpflicht |
| Neuropharmakologie | Ein Stoffbeispiel aus chemischen Synapsenprozessen ableiten, neuromuskuläres Prinzip erläutern | Keine unbeschränkte psychoaktive Mechanismenroutine; übrige GK2-Pflichten erhalten |
| Synaptische Übertragung | Erregende chemische ACh-Synapse samt Transmitter und Kanalrollen erklären | Elektrischer Synapsenmodus nicht belegt; Stoff-/neuromuskuläre Restpflichten erhalten |

Fünf Kandidaten begrenzen die Routine; drei bleiben erklärte Modell-/Befundspezialisierungen, deren curricularer Status und Operatorhöhe unabhängig zu prüfen sind. Quelle, Quellelement, kanonisches Gesamtziel und Autorenoperationalisierung sind getrennt. **Keine** Kandidatenroutine oder ganze Originalquelle wird hier freigegeben. Die inaktiven Mappingvorschläge bleiben `needs_canonical_goal`, mit leeren tatsächlichen Mappings; kein nativer Zeuge wird künstlich hergestellt.

Die Spezialisierungen werden nicht als drei neue wörtliche Quellenpflichten neben dem bestehenden Zelluläre-Lernprozesse-Ziel gezählt. Abgrenzungen zu diesem Ziel, zur EPSP/IPSP-Grundroutine, zum Rezeptor-/Aktionspotentialziel und zwischen den drei Chemiesynapsen-/Stoff-/Serotoninroutinen stehen ausdrücklich in der Review-Worklist. Kein neuer kanonischer Zielknoten wird vorgeschlagen. Die vollständige BY-Depressionskompetenz bleibt eine eigene erhaltene Quellenpflicht; der aktuelle Alzheimer-Zieltext ist kein vollständiger Partner dafür.

## Zwei getrennte geschützte NW/G9-Verluste

| Ganze aktuelle ID | Vollständiger aktueller Titel | Vorhandene getrennte v3-Source-ID |
| --- | --- | --- |
| `5b2571d9-f079-52b2-b21b-8f389c7409f4` | Bakteriellen Zellbau einordnen | `22637879-a1cf-5128-bd59-2a2e12d8c193` |
| `49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd` | Bakterielle Zweiteilung modellhaft erklären | `23c1ecdb-9a65-5e24-bb22-88852b178638` |

Beide aktuellen Baseline-Zeugen sind technisch **direkte** Relationen des breiten IF7-Sammelrecords, keine Clustervererbung. Der tatsächliche HOLD-Overlay stellt diesen ganzen Sammelrecord auf HOLD und entfernt dabei seine beiden geschützten Direktrelationen. Die frische Originalseite 35 belegt den UF1-Bau-/Vermehrungsbullet. Plasmid-/DNA-Modelltiefe ist Autorenoperationalisierung; die ganze bakterielle/virale Quelle wird dadurch nicht geschlossen.

Die zwei getrennten v3-Komponenten und ihre partial Mappings liegen bereits in ihrem unveränderten historischen Author-Dossier. Der dort deklarierte spätere aktive Extraction-Pfad existiert aktuell **nicht**, und diese getrennten Mappingkandidaten sind nicht in die tatsächlichen aktiven Atlas-Inputs eingebunden. Der historische unabhängige B-Bericht hat beide begrenzten Komponenten KEEP/partial geprüft; dies bleibt historische Routing-Evidenz. Die genaue zweite unabhängige Entscheidung und aktuelle technische Einbindung müssen vor einer späteren Übernahme explizit gebunden werden. Historische Bio67/Chem112-Schutzsummen werden nicht als aktuelle Mengen verwendet.

Dieses Paket diagnostiziert den konkreten Verlust und bereitet die separate technische Übernahme vor. Es stellt keine NW-Anwendbarkeit wieder her und führt keine neue formale NW-Quellenfreigabe aus. IF7-/Viren-HOLD und die ganzen aktuellen Bio74-Ziele bleiben erhalten.

## Prüfbares Rohpaket

- [Lesbares Einzelblatt](eight-goals-and-two-NW-losses.author-raw-readable.md): ganze DE/EN-Kompetenzen, Teilbelege, Kandidaten und offene Grenzen.
- `eight-current-goals.actual-primary-scope-and-DEEN-candidates.author-v1.json`: tatsächliche acht Rohentscheidungsdatensätze, ganze Vorher-/Nachher-Objekte und sämtliche ausgewählten Originalrecords.
- `HE43.actual-original-components-bbox-and-stage-course.json`: echte Originaltexte, BBox-Zeilen, Stufen-/Kurs-/Verbindlichkeitsgrenzen.
- `BY13-EA-GA.actual-original-neural-section.records.json`: alle 45 aktuellen Originalrecords mit Roh-HTML und echten Abschnittsankern.
- `BY13-EA-GA.exact-current-merged-source-IDs-and-original-occurrences.addendum.json`: aktuelle deduplizierte Source-ID getrennt von ursprünglichen EA-/GA-Vorkommen.
- `current472-whole-canonical.actual.snapshot.json` und `current472-eight-only.canonical.author-v1.candidate.json`: ganze aktuelle Eingangs- und inaktive Kandidatenbytes.
- `eight-bounded-components-and-declared-specialisations.source-candidates.author-v1.json` und `eight-inactive-source-component-mapping-proposals.author-v1.json`: explizite ungemappte Autorenkomponenten; Originalpflichten erhalten.
- `NW-two-protected-losses.actual-primary-and-direct-mapping-diagnosis.json`: aktuelle direkte Entscheidung, Original-Source-Objekt, echte Primärstelle und vorhandene getrennte Komponenten je Verlust.
- `actual-primary-text-html-and-raster-reading.author-v1.receipt.json`: tatsächliche Lesebestätigung; Rastererzeugung und Rasteransicht getrennt.
- `actual-final-preservation-and-historical-NW-routing.guard.json`: Eingangs-/Routing-/aktuelle Bio74/Chem127/Math807/Phys478-Erhaltung.
- `eight-missing-primary-scope-remediation-author-v1.final.freeze.json`: endgültiger eigener Freeze.

Der erste tatsächliche lokale Rasteraufruf scheiterte vor einer Ansicht an einem Python-Argumenttyp. Skript, Fehler und bis dahin entstandene Dateien bleiben unter `preparation/first-raster-command-type-error/` erhalten. Der korrigierte Folgeabruf und die nachfolgenden tatsächlichen Ansichten sind getrennt belegt.

Originäre Proposaltexte und technische Artefakte folgen `LICENSING.md`; amtliche Originalquellen werden nicht durch eine eigene Lizenzbehauptung umetikettiert. Original-TH19/HH21, der versiegelte 382-Bericht und sämtliche bisherigen Source-HOLDs bleiben unverändert. **Aktive Writes, neue unabhängige Freigaben und Strict-Nettozuwachs: 0.**
