<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# Bio Q1: begrenzter Autorenstand v5

**Autorenkandidat mit ausstehender unabhängiger Nachprüfung.** Dieser Agent hatte den v4-B-Review vor dem Rollenwechsel eingefroren und handelt hier als Autor. Er erteilt seinem v5-Output keine unabhängige Freigabe. Das Paket enthält elf begrenzte Komponenten mit 24 vollständigen DE/EN-Fällen; sieben Komponenten haben weiterhin keine kanonische ID.

## Tatsächliche v4-Eingänge und A/B-Abweichung

Der v4-Autorenfreeze `89816e95…` bindet 63 eigene Dateien und 179 Eingänge. Der tatsächliche A-Freeze `b120e468…` bindet neun Dateien; der abgeschlossene B-Freeze `5a7a71ff…` bindet 20. Alle drei eigenen Dateibindungen wurden erneut geprüft. Die genauen Referenzen und SHA-256 stehen im Eingangsmanifest und im Delta.

A urteilte acht KEEP/drei REVISE-Komponenten und 18 KEEP/vier REVISE-Fälle. B urteilte zehn KEEP/eine REVISE-Komponente und 22 KEEP-Fälle innerhalb ihrer fiktiven Modelle, hielt aber ebenfalls die weitergehenden MV-/ST-Operatoren offen. Die Differenz betrifft konkret die beiden kurzen Gen-/Produktmodelle und die Trennung von brauchbaren kontrollierten Schutzfällen und vollständiger Quellenoperatorenabdeckung.

Die v5 übernimmt As präzisere Modellgrenze: Ein angezeigter Drei-Reste-Ausschnitt wird ausdrücklich von einem vollständigen längeren Funktionsprotein getrennt. Bs Akzeptanz der gegebenen fiktiven Funktionsannahmen wird dokumentiert; sie wird nicht als Zustimmung zu v5 fortgeschrieben. Die beiden guten kontrollierten Mutagenfälle bleiben exakt erhalten. Beide Reviews verlangten für die weitergehenden Operatoren einen tatsächlich bearbeitbaren Alltags-/Umweltkontext mit begründetem Urteil.

## Präzise Änderungen

| Bestandteil | Tatsächlicher Autorendelta |
| --- | --- |
| `mechanism-pro-euk-a` | DE/EN-Material, Auftrag, Lösung und positive Bedingungen: `ATG GAA … TTT TGA` ist eine explizite Kurzschrift eines längeren intronfreien Enzymgens. Die Auslassung bedeutet vollständige Codons im gleichen Raster und wird in mRNA/Peptid weitergeführt. Die Funktion des vollständigen Enzyms ist separat gegeben. Codons, Anticodon und typische Kompartimente bleiben richtig. |
| `protein-function-a` | DE/EN-Material, Auftrag, Lösung und positive Bedingungen: derselbe lange ausgelassene Abschnitt in Referenz/V/W. Die erhaltenen Werte `100±4`, `12±2`, `98±4` betreffen gleiche Mengen vollständiger längerer gereinigter Proteine. Die drei dargestellten Reste werden nicht als vollständige gemessene Enzyme ausgegeben. |
| `mutagen_causes_and_protection` | Nur die DE/EN-Beschreibung dieses Null-ID-Prototyps wird auf ein begründetes, kriterienbezogenes Expositionsurteil erweitert. Es wird keine ID oder native Route vergeben. |
| `everyday-uv-risk-decision-c` | Neuer vollständiger DE/EN-Fall: konkreter Schulsporttag, vorgegebene Expositionen `100/25/10`, drei organisatorisch mögliche Schutzalternativen, ausdrückliche Priorität und Organisationskonflikt. Empfehlung C samt bedingter Alternative B, genetischer Gefahrenbezug und Grenzen von Wärme-/Personenrisiko-Schlüssen sind positiv verlangt. |
| `environment-air-pah-risk-decision-d` | Neuer vollständiger DE/EN-Fall: Holzofenrauch und tägliche Buswartezeit, benannte PAH-Gefahr, sichere erreichbare Alternativen mit Zeitkosten, Expositionssummen `60/10/55` über fünf vergleichbare Tage. Begründetes Urteil B, fehlender Filterbeleg, Streuung und Wettergrenzen sind positiv verlangt. |

Alle 20 übrigen ursprünglichen Fälle sind als JSON-Objekte exakt erhalten. Der Delta benennt jedes geänderte Feld und die alten/neuen Hashes der zwei revidierten Fälle. Die ursprünglichen R/M-Schutzdaten und ihre kontrollierten Wirksamkeitsfragen bleiben vollständig erhalten. Die neuen Fälle ergänzen den Entscheidungsoperator; ihr Material sind ausdrücklich fiktive Zahlen und Situationen, keine durchgeführten Versuche oder reale Lernendenleistungen.

## Originalklauseln und tatsächliche Fachquellen

MV2022, Klasse10, gedruckt26/physisch30, fordert als Verknüpfungsbeispiel: „das Gefahrenpotenzial von Mutagenen im alltäglichen Leben reflektieren“. ST2022, gedruckt/physisch43, fordert: „Umwelteinflüsse unter dem Aspekt der genetischen Risiken bewerten“. Die tatsächlichen Original-PDFs und frisch extrahierten Seiten sind gebunden. Die beiden neuen Fälle liefern dafür Handlungsmöglichkeiten, Informationen, benannte Kriterien, Abwägung und begründete Lösungen; eine Zahlenrangfolge allein genügt den positiven Bedingungen nicht. Der Quellenbeitrag bleibt ein **begrenzter Vorschlag mit ausstehender Nachprüfung**.

Die UV-Prämisse und qualitative Schutzansätze stützen sich auf tatsächlich gelesene offizielle [BfS-Informationen](https://multimedia.gsb.bund.de/BFS/BFS/Animation/uv/) und den [BfS-Auftragsbericht](https://doris.bfs.de/jspui/bitstream/urn%3Anbn%3Ade%3A0221-2020062522246/4/BfS_2020_3619S72403.pdf), gedruckt10/physisch13. Sie belegen die qualitative Gefahr und Expositionsverringerung; die neuen `100/25/10` sind ausschließlich vorgegebene Modellwerte.

Für den Umweltfall werden die Aussagen zu unvollständiger Holzverbrennung, partikelgebundenem Benzo(a)pyren und Metaboliten aus dem tatsächlichen [UBA-Original](https://www.umweltbundesamt.de/themen/luft/luftschadstoffe-im-ueberblick/benzoapyren-im-feinstaub) benutzt. DNA-Addukte, Reparatur und mögliche Mutation werden anhand des tatsächlichen [IARC-Originalkapitels](https://www.iarc.who.int/wp-content/uploads/2018/07/161-Chapter12.pdf), gedruckt149/physisch1, begrenzt. Kein gesetzlicher Grenzwert oder persönlicher Krankheitsprozentsatz wird daraus übertragen. Rohabrufe und Extraktionen liegen ausschließlich in `tmp`; die Matrix bindet ihre konkreten Bytes.

HE-KC2024 Q1.1, gedruckt/physisch38, grundlegendes Niveau für GK und LK, bindet den Mechanismusumfang unverändert. Die tatsächlichen originalen [BY12-GA](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend) und [BY12-EA](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht) Lernbereiche2.4 binden den gemeinsamen Proteinfunktionsteil. Klarere Modellkonventionen erweitern deren Originalumfang nicht. Der unveränderte Code ist weiterhin an [NCBI-Tabelle1](https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1) gebunden.

## Erhaltung und offene Integration

Die 464 WholeGoals, vier operativen DE/EN-Beschreibungen, vier ursprünglichen P-Profile mit acht ursprünglichen P-Fallkörpern und 17 vorhandenen inerten Quellen-/Mapping-Payloads sind über ihre tatsächlichen v4-Eingänge exakt erhalten. Die vier bestehenden Partner-Supplementbindungen bleiben erhalten. Es gibt keine neue kanonische ID, keine aktive Quellen-/Mappingänderung, keinen neuen native-D/P/A/M/V-Eintrag und keinen M7-Zuwachs. Die sieben vorgeschlagenen Null-ID-Ziele bleiben inaktiv.

ST bezeichnet den Schuljahrgang10 ausdrücklich als **Einführungsphase**. Diese Quellenstufe bleibt für Integration gehalten: v5 hat keinen präzisen nativen Per-goal-Stufennachweis erstellt und keine gesamten Quellenstufen-Defaults geändert. Die engere ST-Punkt-/Genom-Sicht wird weiterhin von der breiteren SN-/TH-Taxonomie getrennt. Held3417 mit Mutation und Rekombination samt seinen Vorzielen bleibt gehalten. SH2023 outgoing-Kohorten und neue SH2026-Kohorten, andere Quellen-/Stufen-/Kohortenschulden sowie BY-EA-Onkogenese und der separate PCR-/Replikationsvergleich bleiben offen.

Ein guter Komponentenfall bewirkt keine Whole-Original-Freigabe und kein Upgrade eines vorhandenen partiellen Mappings auf `exact`. Vor jeder aktiven Integration fehlen weiterhin endgültige ID-/Placement-/Applicability-/Prerequisite- und native-Evidenzbindungen. Die bisherigen atomaren und Memory-Entscheidungen werden nicht selbst zertifiziert; die Beschreibungserweiterung des Mutagen-Prototyps braucht eine gezielte unabhängige Prüfung. Es werden keine neuen SRS-/Verified-Recall-Pflichten behauptet.

## Geprüfter Umfang und nächste Prüfung

Gezielte Autorprüfungen belegen alle sechs vollständigen DE/EN-Felder pro Fall für 24 Fälle mit positiven Bedingungen, genau zwei revidierte ursprüngliche Fälle, 20 exakt erhaltene ursprüngliche Fälle, zwei neue Fälle, sieben Null-IDs, erhaltene Vorgängerbindungsbytes und korrekte neue Summen. Es wurden keine vollständigen Builds, keine neuen nativen Book-/Compilerläufe und keine globalen Qualitätsprüfschleifen ausgeführt. Der delegierte aktive Stand bleibt Bio67/383 und Chemie112/378; dieses Paket erzeugt null aktive Abschlüsse.

Die unabhängigen A-/B-Nachprüfer müssen die zwei revidierten und zwei neuen Fälle vollständig DE/EN sowie die geänderte Null-ID-Beschreibung und deren Operator-/Atomaritätsgrenze prüfen. Erst danach kann eine getrennte native Integration vorbereitet werden. Die v5 behauptet weder unabhängige Zustimmung noch menschliche Freigabe oder Erprobung.

Eigene didaktische Inhalte: CC-BY-4.0; technische Prüfscripts: Apache-2.0. Drittquellen behalten ihre Rechte und werden als tatsächliche Eingänge referenziert.
