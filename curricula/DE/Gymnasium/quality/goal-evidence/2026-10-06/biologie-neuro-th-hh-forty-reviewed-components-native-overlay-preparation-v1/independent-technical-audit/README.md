<!-- SPDX-License-Identifier: Apache-2.0 -->

# Unabhängiger technischer Artefaktaudit

Der gemeinsame Kandidat ist technisch konsistent als inaktives Diagnosepaket. Eine Integration bleibt **HOLD**. Der ursprüngliche Quellenatlas-Vertrag verlangt 390 Ziele; beide vorhandenen nativen Kandidatenversuche erreichen 382. Es wurden keine neuen nativen Builder, externen Quellenabrufe, Globalchecks oder PDF-Builds gestartet. Dies ist keine neue fachliche Quellenprüfung.

Der eigenständige Auditor hat sämtliche 1.241 Bindungen des gemeinsamen Eingangsguards vor und nach der Prüfung bytegenau bestätigt. Alle 22 vollständigen geordneten Baseline-, HOLD- und gemeinsamen Zielmengen wurden mit den tatsächlichen Receipts verglichen. Auch das komprimierte Baseline-Receipt wurde vollständig dekodiert; seine 69 Eingangsbindungen und tatsächlichen Ausgabebindungen stimmen mit den aktuellen Dateien überein.

40 direkte, aus Quellmetadaten abgeleitete TH/HH-Zeugen stellen exakt 19 TH/Sek I- und 21 HH/Sek I-Paare wieder her. Jeder davon bleibt ein begrenzter Teilbeleg mit `sourceWholeCoverage=false` und `targetWholeCoverage=false`. Die 24 TH- und elf HH-Ganzpaar-HOLDs bleiben tatsächlich in der Restmenge. Die 200 verbleibenden verlorenen Paare sind exakt **147 Paare aus der historischen 187er Outside-Worklist plus 53 Paare der ausgewählten 21 Ziele**; die anderen 40 historischen Paare sind die gerade wiederhergestellten Paare.

Alle fünf tatsächlichen BookModels wurden vollständig hinsichtlich Seitenmenge, Eindeutigkeit, Titel/Beschreibung und lokaler Voraussetzung-/Folgeverknüpfungen geprüft: Quellenatlas 390 → 382 → 382, vollständiger Katalog 390 → 390. Die 451 kanonischen Ganzziele außerhalb der ausgewählten 21 und sämtliche 472 `requires`-/`contains`-Felder sind exakt erhalten. Die gebundenen aktuellen Schutzmengen bleiben Biologie 74, Chemie 127, Mathematik 807 und Physik 478.

## 33 geschützte Quellenatlas-Seiten

Die geschützten 74 kanonischen Ganzziele und ihre vollständigen Katalogseiten sind exakt erhalten. 33 Quellenatlas-Ganzseiten ändern sich jedoch. Bei **31** davon verschwinden sämtliche Unterschiede nach rekursivem Ausblenden von `pageNumber`, `navigationOrder`, `treeOrder` und dem abgeleiteten `pageFingerprint`. Das schließt veränderte Seitenzahlen in unveränderten Voraussetzung-/Folgelinks ein. Ihre Quell-, Stufen- und Kurskontexte ändern sich nicht.

Genau **zwei** geschützte Atlas-Seiten verlieren tatsächlich `DE-NW / SekI / G9 / kein Kursprofil`:

| Lernziel-ID | Vollständiger Titel | Tatsächliche Kontextänderung |
| --- | --- | --- |
| `5b2571d9-f079-52b2-b21b-8f389c7409f4` | Bakteriellen Zellbau einordnen | NRW/Sek I/G9 entfällt |
| `49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd` | Bakterielle Zweiteilung modellhaft erklären | NRW/Sek I/G9 entfällt |

Es gibt unter diesen 33 geschützten Seiten keine weitere tatsächliche Kontextänderung und keinen neuen Stufen-/Kurszusatz. Diese zwei NRW-Verluste sind eine konkrete Integrationsgrenze. Ein unverändertes kanonisches Ziel oder eine unveränderte vollständige Katalogseite beweist keinen unveränderten Quellenatlas-Kontext. Einzelklassifikation: [protected33.actual-numbering-versus-context-classification.json](protected33.actual-numbering-versus-context-classification.json).

## Drei HE-Zielzusätze und begrenzte HH-Aussagen

Die drei HE-Ziele „Aktionspotential und Codierung erklären“, „Erregungsleitung an Nervenfasern vergleichen“ und „Ruhepotential aus Ionenverteilungen erklären“ kommen jeweils in GK und LK hinzu: sechs Paare. Alle sechs sind bereits im eingefrorenen ursprünglichen Neuro-Overlay vorhanden; die 40 TH/HH-Komponenten erzeugen keinen zusätzlichen HE-Zusatz. Die Ganzroutinen bleiben unfreigegeben. Aus bloßer Erregungsleitung folgt weder ein vollständiger Nervenfaservergleich noch ein Vergleich der Leistungsfähigkeit wirbelloser und wirbeltierlicher Nervensysteme.

Die tatsächlich übernommenen HH-Grenzen bleiben in den Mapping-Entscheidungen erhalten: Bei Paar 22 belegt Drogeneinfluss auf das Nervensystem keine konkrete Drogenwirkung auf ein bestimmtes Sinnesorgan. Bei Paar 29 belegt allgemeine Gesunderhaltung keine spezifische Kreislauf- oder Lungenvorsorge. Die technischen Sichtbarkeitsrestaurierungen dürfen diese Teilbeleggrenzen nicht überschreiben.

## Acht tatsächlich fehlende aktuelle Ziele

| Lernziel-ID | Vollständiger aktueller Titel | Frühere Baseline-Sichten | Anzahl früherer direkter Zeugen |
| --- | --- | --- | ---: |
| `4f631f78-e13a-58e5-9092-f4db0b8d377a` | Hebbsches Lernen und Netzwerke | HE/Sek II/LK | 1 |
| `8b23f8fb-555d-5720-b5f2-dd6f28a0e786` | Sensorische Codierung | HE/Sek II/LK | 1 |
| `97b24279-def0-5ce6-8726-a1cac9cd38ad` | Neuronale Netzwerke modellieren | HE/Sek II/LK | 1 |
| `9b966664-906b-5a5d-8008-cae18de043aa` | Neuromodulation und Neurotransmitter | HE/Sek II/LK | 1 |
| `a46cafde-7359-5249-8754-19aaa3174ba4` | Signalverarbeitung und Plastizität | HE/Sek II/GK und LK | 2 |
| `c9a06264-cce2-54dd-9604-46dd5949f02e` | Langzeitpotenzierung und -depression | HE/Sek II/LK | 1 |
| `f6280154-d57c-599c-94bf-73313005a6df` | Neuropharmakologie | HE/Sek II/LK | 1 |
| `ff1bf88f-2413-5668-a071-ce9fc499cba3` | Synaptische Übertragung | BB, BE, HH, MV, NW, RP, SH, SN, ST, TH jeweils Sek I; BY und HE jeweils Sek II/GK und LK | 15 |

Alle historischen Zeugen einschließlich jeder Scope-/Mapping-/Extraction-/Source-ID sind vollständig in [eight-omitted-current-goals.actual-baseline-witnesses-and-bounded-pointers.json](eight-omitted-current-goals.actual-baseline-witnesses-and-bounded-pointers.json) erfasst. Die acht Ziele bleiben im vollständigen Katalog erhalten und fehlen im Quellenatlas. Die alten HE-Labels `Q2.3.2`, `.3`, `.11` bis `.16` stammen aus verfassten Operationalisierungen; die eingefrorene HE-Migration kennzeichnet sie ausdrücklich als `isOfficialBullet=false`. Ihre historische Präsenz ist kein neuer amtlicher Beleg.

## Nächste begrenzte Quellkandidaten

Die [sechs begrenzten Arbeitspakete](next-six-bounded-source-packages.actual-rest-pairs-only.json) enthalten ausschließlich tatsächliche Restpaare und vorhandene amtliche Dokumentpointers:

1. Die zwei geschützten NRW-Bakterienziele: NRW KLP 2019, Inhaltsfeld 7. Den jeweils passenden Originaloperator und die konkrete Teilroutine für Zellbau bzw. Zweiteilung binden; der bisherige Sammelrecord ersetzt diesen Nachweis nicht.
2. Synaptische Übertragung und Neuropharmakologie: HE Seite 43, ursprünglicher GK2-Abschnitt über Acetylcholin-Synapse, Kanaltypen, Stoffbeispiel und neuromuskuläre Synapse. Elektrische Synapsen und allgemeine neuropharmakologische Breite bleiben offen.
3. Signalverarbeitung/Plastizität, LTP/LTD und Hebb: HE Seite 43, ursprünglicher LK5-Abschnitt „zelluläre Prozesse des Lernens“. Die drei besonderen Zielroutinen und ihre Operatoren benötigen separate Entscheidung; diese breite Stelle ist kein Ganzziel-Beleg.
4. Neuronale Netzwerke: HE Seite 43, ursprünglicher LK4-Abschnitt zur synaptischen Verrechnung. Konvergenz/Divergenz und Modellnetzwerkanalyse werden dadurch nicht automatisch belegt.
5. Neuromodulation: HE Seite 43, ursprünglicher LK3-Abschnitt zur hormonellen und neuronalen Steuerung. Spezifische Dopamin-/Serotoninsysteme bleiben ungebunden.
6. Sensorische Codierung: Die retained `Q2.4.GK1`-Route liegt außerhalb der Q2.3-Migration. Der Elternagent hat während dieses Audits einen rein textuellen Locator auf Seite 43 geliefert: Sinnesorgan und Signaltransduktion von der Wahrnehmung zur Reaktion. [Addendum](q24-parent-supplied-technical-locator.addendum.json). Frequenz-, Orts- und Populationscode benötigen weiterhin eigenständige Quellen- und Tiefenprüfung.

Keine dieser Kandidatenlisten behauptet neue Unterstützung. Für die HE-Schlüssel wird keine amtliche Bulletnummerierung behauptet. Es wurden keine Elterndateien verändert, keine aktiven Bindungen wiederhergestellt und keine M7-Freigaben hinzugefügt. **Strict-Nettozuwachs: 0.**

Maschineller Prüfbericht: [independent-technical-audit.actual.result.json](independent-technical-audit.actual.result.json). Es wurden keine unerwarteten technischen Inkonsistenzen in den bestehenden Artefakten gefunden; die dokumentierten Quellen-, Scope- und Ganzroutinengrenzen blockieren weiterhin die Integration.
