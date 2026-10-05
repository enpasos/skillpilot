<!-- SPDX-License-Identifier: Apache-2.0 -->
# Chemie 8ceb: Aufteilung mit Erhalt der vorhandenen fachlichen Reichweite

**Inaktiver Autorentwurf. Kein neuer strenger Abschluss, keine wiederhergestellte
Bindung und keine menschliche Freigabe. Integration derzeit zurückgestellt.**

Die aktuelle Beschreibung von `8ceb1749-fce0-584f-a2b8-0a309282329a` verbindet
zwei getrennt überprüfbare Mechanismen: physikalische Fraktionierung und
chemisches Cracken. Der aktuelle unabhängige D-Befund verlangt eine Aufteilung.
Das historische A-Urteil `atomic=true` bleibt unverändert als Geschichte
erhalten; es wird nicht auf neue Kinder übertragen.

## Konkreter Kandidat

Der vorhandene Elternknoten bleibt mit seiner ID, seinem Bild und seiner
fachlichen Gesamtkompetenz als `curricularArea` erhalten. Zwei Kinder
übernehmen genau die beiden Mechanismen:

| Kind-ID | Kompetenz |
| --- | --- |
| `5db9ba57-6a80-56db-8b9d-e8ca4ac41855` | Fraktionierte Destillation als physikalische Trennung mit unveränderten Molekülen erklären |
| `7c22f436-e550-5b0b-85ae-a073b0c50418` | Thermisches Cracken als chemische Umwandlung in kürzere gesättigte und ungesättigte Produkte erklären |

Die bereits vorgeschlagenen stabilen UUIDv5-Seeds sind nachgerechnet. Die
beiden Gewichte summieren sich zum bisherigen Gewicht 0,9. Die Voraussetzung
`2be` wandert vom Elternknoten zu beiden Kindern. Die tatsächlichen aktuellen
Voraussetzungen von `8ece`, `b95` und dem Abschlussknoten `14577339` ersetzen
`8ceb` jeweils durch beide Kinder; der bestehende Prüfungs-Abdeckungseintrag
bleibt in seinem bisherigen fachlichen Umfang erhalten. Dies bestätigt nicht,
dass der bisherige allgemeine Prüfungstext schon konkrete Kindkompetenzen
prüft. Jede spätere Einschränkung auf ein Kind braucht ein begründetes Review.

`2be` erhält neue direkte Nachfolger. Sein tatsächlicher strenger
Rückwärtskontext muss deshalb gezielt geprüft und gültig gebunden werden.
Das ist kein neuer fachlicher Abschluss eines unveränderten Zieltexts.

## Alle aktuellen Platzierungen

`placements-and-views.delta.candidate.json` enthält **alle 26 tatsächlichen
direkten `goalEntry`-Bindungen** mit aktuellem Datei-Hash, JSON-Pointer,
vollständigem vorherigem Knoten, Scope und konkretem Folge-Knoten. Sie liegen
in den GK-/LK-Autorensichten von BB, BE, HB, HH, MV, NI, NW, RP, SH, SL, SN,
ST und TH. Der jeweilige Eintrag wird zum `canonicalSubtree` derselben
Eltern-ID, sodass beide bestehenden Mechanismen sichtbar bleiben. Keine
Aufteilung auf bloß Hessen; keine verlorene Hälfte der früheren Kompetenz.

Der tatsächliche Compiler prüft zusätzlich **alle 37 Chemie-Autorensichten**.
34 erreichen die bisherige Gesamtkompetenz, darunter die hessischen und
bundesweiten Sichten über Unterbaumverweise. Alle erhalten ihre bisherigen
Ziele und genau beide neuen Kinder; je betroffener Sicht steigt die Zahl der
inhaltlichen Blätter um eins. Diese Prüfung belegt die strukturelle
Autorensicht-Erhaltung. **Sie belegt nicht 34 normative Lehrplanfreigaben.**

Das Inventar enthält außerdem alle 65 derzeitigen unmittelbaren Elternverweise
in Autorensichten und generierten Buchsichten. Die generierten Sichten werden
erst nach unabhängiger Freigabe an einem stabilen Integrationsstand neu erzeugt.

## Tatsächliche Quellen und offene Reichweite

Das aktuelle Atlas-Inventar erfasst 32 Mapping-Dateien und zehn unmittelbare
Quellenzeilen zum Elternziel aus fünf Dateien. Breite Vorfahrenbindungen sind
gesondert aufgeführt. Die tatsächlichen offiziellen Seiten und deren
Datei-Hashes stehen in `official-source-inspection.receipt.json`.

Der begrenzte Fortsetzungsplan `remaining-source-scope-preservation.md` und
sein JSON prüfen echte alternative Gymnasial-Klauseln für die verbleibenden
Reste. Er enthält eng begrenzte HB-/RP-Vorschläge und trennt tatsächliche
Pflichtanforderungen von optionalen Kontexten; keine neue Freigabe.

| Quelle | Tatsächlicher Befund | Enger Kandidat / Rest |
| --- | --- | --- |
| HE G9, gedruckte S. 26 / PDF-S. 27, 10.4 | Beide Verfahren ausdrücklich in verbindlichen Inhalten | Beide Kinder jeweils partiell; Bildung, Verwendung, Benzin-Siedeanalyse und weitere Bewertungen nicht vollständig durch den Split gedeckt |
| HE Oberstufe, S. 36, E.4, Ausgabe 2024 / Stand 01.08.2025 | Beide Verfahren ausdrücklich | Zwei partielle Kinder decken gemeinsam die Verfahrensklausel; kein Einzelkind ist eine exakte Entsprechung der ganzen Klausel |
| NI Oberstufe, S. 16, EP | Verfahren, Modelle, Teilchenebene und ökonomische Bewertung getrennt | Zwei Destillationszellen → Destillationskind; drei Crackzellen → Crackkind; ökonomische Bewertung bleibt bei vorhandenen Bewertungszielen und offenem Bewertungsnachweis |
| BB/BE RLP, S. 23 mit Einschränkung auf S. 17 | Dieselgewinnung/Cracken kursiv als mögliche Vertiefung in Wahlpflichtthemen; Abschnitt 3.1 nennt andere EP-Schulformen | Optionale/Schulform-Reichweite dokumentieren; kein pauschaler Pflichtnachweis für Gymnasium GK und LK |
| SL NW-Einführungsphase, S. 31 | Fraktionierte Destillation verbindlich; Cracken nur mögliches Experiment | Enge partielle Destillationsbindung für den NW-Zweig; keine Übertragung auf sprachlichen Zweig oder beliebige Hauptphase |
| SN Klasse 9, gedruckte S. 17–18 / PDF-S. 29–30 | Erdölfraktionen in LB3; Cracken im optionalen Wahlbereich 2 | Enge partielle Crackbindung; tatsächliche Durchführung, Anwendung der Eliminierungskenntnisse und Olefin-Verbund bleiben getrennte Anforderungen; Fraktionswissen allein beweist nicht Destillation |
| BY/BW | Keine direkte aktuelle Elternbindung und kein direkter Eltern-`goalEntry` gefunden | Keine erfundene Verfahrensbindung aus Rohstoff-/Erdölprodukt-Zielen; bestehende Kompatibilitätsdeklaration ist kein Pflichtnachweis |
| HB/HH/MV/NW/RP/SH/ST/TH | Technische Vorfahrenbindungen und Autorensichten vorhanden | Konkrete Verfahrensklauseln und richtige Schulform-/Pflichtreichweite bleiben zu belegen; breite Alkane-/Reaktionsziele genügen dafür nicht |

Die 16 bisherigen Jurisdiktionen bleiben im Kandidaten ausdrücklich als
**Autoren- und Kompatibilitätskontinuität** erhalten. Sie werden nicht als 16
neue Quellenfreigaben ausgegeben. Auf beiden neuen Atomen verhindert
`applicabilityMappingInheritance: "boundary"`, dass alte breite
Vorfahren-Mappings als aktuelle positive Verfahrensnachweise gelten.

Die zwölf konkreten Mapping-Deltas ersetzen die zehn bisherigen unmittelbaren
Elternbindungen klauselspezifisch und schlagen zwei eng beschränkte zusätzliche
SL-/SN-Bindungen vor. BB-/BE-, SL- und SN-Einschränkungen sind in vier exakten
Quellziel-Deltas dokumentiert. Die aktuellen technischen Atlas-Helfer erzwingen
die neu dokumentierten optionalen/Schulform-/Zweig-Einschränkungen noch nicht
vollständig. Metadaten allein schließen diese Lücke nicht. Darum sind diese
Änderungen **keine integrationsfertige M6-Bestätigung**.

## D/P/A/M/V und Bilder

Für beide Kinder liegen vollständige zweisprachige P-v2-Profile mit jeweils
zwei tatsächlichen frischen Fallbeschreibungen vor. Sie stammen aus dem
bereits vorhandenen Autorentwurf; die Herkunft ist gebunden. Wiederverwendung
ist keine unabhängige Prüfung und keine tatsächliche Lernendenleistung.

Die fachlich getrennten A- und `no_memory_needed`-M-Kandidaten begründen die
Entscheidung je Kind. Alle sechs tatsächlichen Chemie-Kartendecks wurden nach
Eltern-/Kindbindungen durchsucht: keine betroffenen Karten. Sollte das
unabhängige M-Review Karten fordern, müssen tatsächliche Karten und ihre
Sichtbarkeit erst erstellt beziehungsweise geprüft werden.

Das vorhandene Eltern-JPEG wurde tatsächlich angesehen und bleibt als
qualitative Clusterübersicht erhalten. Die Darstellung ist keine ausgeglichene
Reaktionsgleichung und keine neue atomare V-Freigabe. Für beide neuen Atome
liegen konkrete freundliche 16:9-PNG-Prompts vor. **Es wurden keine Bilder
erzeugt.** Tatsächliche native, 360-Pixel- und 680-Pixel-Prüfung und eine aktuelle
maschinelle V-Freigabe stehen aus. Gute vorhandene Bildbytes bleiben erhalten;
keine programmgenerierten SVGs.

Notwendig bleiben zwei unabhängige aktuelle D-Reviews je Kind mit aufgelösten
Befunden, echte P/A/M-Entscheidungen, geprüfte Bilder und aktuelle Bindungen.
Die betroffenen Nachfolger-, Seiten- und `2be`-Kontexte werden gezielt geprüft.
Historische Reviews bleiben unverändert. Keine Freigabe durch Hashanpassung.

## Geprüfter Stand und nächster Schritt

`candidate-check.receipt.json` dokumentiert einen bestandenen, rein inaktiven
Strukturcheck: aktuelle Vorher-Werte, UUID-Kollisionen, beide DAGs, tatsächlicher
Kanon-/Sichten-Compiler, Erhalt aller bisherigen Autorensicht-Ziele,
Quellenboundary, exakte Quellen-Deltas und P-v2-Schema. Keine vollständige QS,
kein Build, kein Commit, kein Push und keine aktive Dateiänderung.

**Strenger Fortschritt dieses Pakets: 0 neue Abschlüsse, 0 wiederhergestellte
Bindungen, Netto 0.** Eine spätere geprüfte Integration erhöht den aktuellen
Atom-Denominator um eins. Zuerst die Quellen-/Scope-Reste unabhängig klären,
dann die Kind-D/P/A/M/V-Reviews und die betroffenen Kontextbindungen durchführen,
danach die geschützten Chemie-M6- und abhängigen Layer-A-Gates prüfen. Keine
abgesenkten Grenzen und keine erzwungene Reduktion auf unbewiesene Quellen.

Eigene didaktische Ziel-/Fall-/Promptinhalte: CC-BY-4.0. Technische Skripte und
diese Entwicklerdokumentation: Apache-2.0. Rechte der offiziellen Quellen,
Bildherkunft, maschinelle Qualität und separate menschliche Release-Gates
bleiben voneinander getrennt.
