# B010: konkrete Quellen- und Stufennachbesserung

Status: **candidate / ai_candidate**, informierte Autorenrevision nach Kenntnis
der beiden eingefrorenen Source-Arbeiten. Keine unabhängige oder blinde
Final-Book-D-Runde. Kein P-Inhalt gelesen oder erzeugt. Keine operative
Canonical-, Registry-, View-, Mapping-, QA-, Ledger- oder Deckänderung. Keine
menschliche Freigabe oder Erprobung. **Strenge zusätzliche Closure: 0.**

## Tatsächlich fertiggestellte Kandidaten

| Aktuelles Ziel | Konkreter Stand | Noch erforderliche Prüfung |
| --- | --- | --- |
| 950c73c6-4ed1-488a-9267-1142e95e0055 | Vollständige DE/EN-Revision erhält Modellieren, Koordinationszahl und typische Eigenschaften durch elektrostatische Kräfte/Ionenbeweglichkeit. Aktuelle HE10.1-B05A01-Provenienz ersetzt den nicht mehr vorhandenen UUID-Schlüssel; B05A02/B05A03 und tatsächliche BY-Modelloperatoren sind zusätzlich gebunden. | Neuer Bildkandidat und unabhängige V-/D-/P-Prüfung; die zwei älteren HE9-Halogenreaktionszuordnungen bleiben ausdrücklich Source-HOLD. |
| 16a80de2-b5e0-5467-a9b3-5860730d7d8b | Beide Wasserreaktionssysteme erhalten; Produkte erklären die gemeinsame alkalische Lösung. Ursprüngliche zwei direkte Voraussetzungen bleiben erhalten; konkrete frühere Stoffroute liegt als geprüfter Struktur-/View-Kandidat vor. | Unabhängige Source-/Final-Book-Prüfung muss den angegebenen, nicht voll elektronentheoretischen Eingang bestätigen. e0-Split bleibt offen. |
| 58486300-3f84-5aa1-9ed4-66186af62669 | Vollständige stoffgenaue Eigenschafts-Verwendungsbegründung. Fehlende Alltags-/Verbindungs-Teilklausel HE9.2-B02A02 ist ausdrücklich zusätzlich gebunden; die Reaktions-Teilklausel wird nicht vereinnahmt. Konkrete frühe Stoffroute liegt vor. | Unabhängige Prüfung des konkreten Kandidatentexts, der zusätzlichen Teilzuordnung und des späteren Buchkontexts. |
| 414489cb-453e-5de4-ab0f-0fc01175e522 | Gips-Teilklausel aus HE10.3 ist exakt gebunden; SO2-Aufnahme, Oxidation und Sulfatbindung werden am vereinfachten Kalkschema erklärt. Ursprüngliche Voraussetzungen und spätere Strukturroute bleiben erhalten. | Frische unabhängige D-/P-/V-Nachweise. Die bereits offene 11bea-Prerequisite-Frage wird nicht verdeckt oder als abgeschlossen gezählt. |
| 1f5ee84f-245a-5a1e-a260-f960f26523e9 | Dünger-Teilklausel aus HE10.3 ist gebunden. Mineralische Nährstoffionenquellen und bedingte Nutzen/Risiko-Begründung bleiben verbunden; Pflanzenbedarf, Menge und Transport werden ausdrücklich bereitgestellt. | Frische unabhängige D-/P-/V-Nachweise. Die vorhandene kleine Transportbeschriftung ersetzt keine lesbaren Aufgabeninformationen. |
| 72236f2c-771e-4ab6-933a-e549ee49d15b | Rutherford-/Partikel-Splitoptionen und tatsächliche HE/BY-Teilbindungen erhalten; Partikeloption nennt Ort, Ladung und relative Masse. | **HOLD:** Split/Companion-ID, aktuelle Provenienz und fünf zusätzliche Atommasse-/Isotopen-/Rein-/Mischelement-/Modellgrenzen-/Ionentheorie-Zellen. |
| e0e201bd-a1fd-5985-ab08-fd24c8655f3d | Element-/Verbindungs-Optionen erhalten; Compound-Option erhält ausdrücklich Charakterisierung, Eigenschaften und daraus begründete Verwendung. Die unpassende Edelgasregelpflicht entfällt nur im inaktiven frühen Strukturkandidaten. | **HOLD:** semantischer Split, endgültige Companion-ID, genaue Source-/Bild-/Memory-/D-/P-Bindung. Im Validierungssnapshot bleibt das aktuelle e0-Ziel unsplit und nicht M7-abgeschlossen. |

`five-description-and-provenance-deltas.json` enthält exakte Vorher/Nachher-Fälle
für die fünf vollständigen zweisprachigen Texte und die 950-Provenienz. Es gab
keine pauschale Umlautkonvertierung. `split-options-preserved-and-rebased.json`
enthält die beiden **ID-null**-Companion-Optionen. Neue atomare IDs wurden nicht
adoptiert; der aktuelle Denominator wird hier nicht verändert.

## Quellen und tatsächlich gelesene Inhalte

Die aktuelle amtliche HE-PDF wurde erneut erfolgreich mit HTTP 200 gelesen:
324637 Bytes, bytegleich zur gebundenen lokalen Originaldatei. Die tatsächlichen
Seitenbilder der physischen Seiten 19, 22 und 25 (gedruckt 18, 21 und 24) wurden
angesehen. HE9.2 trägt die Elementgruppen, HE10.1 die differenzierten
Atom-/Gitterinhalte und HE10.3 die getrennten Gips-/Düngerfälle.
[Amtlicher HE-Lehrplan](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf).

Die drei relevanten amtlichen BY-HTML-Seiten wurden tatsächlich mit HTTP 200
gelesen. Die Modellierungs-/Salzeigenschaftsoperatoren von BY8, der
Atombau-/PSE-Operator von BY9 NTG und der explizite Streuversuchskontext von BY9
übrige Zweige wurden mit den aktuellen Extractions abgeglichen.
[BY8](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium%20/8/chemie),
[BY9 NTG](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch-ntg),
[BY9 übrige Zweige](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch).

`actual-official-http-source-bindings.receipt.json` bindet die tatsächlich
gelesenen HTTP-Antworten nach Status/Bytes/SHA256. Vollständige amtliche
PDF-/HTML-Texte werden hier nicht als neue Commit-Artefakte gespeichert.
`current-source-clause-bindings-and-bounded-coverage.json` enthält 14 genaue
aktuelle Source-Zellen mit ihren Elternzeilen und konkreten Teilgrenzen.

Für die fünf HE-Spezialfälle wird keine zusätzliche BY-Klausel erfunden. Ein
fehlender BY-Atlas-Witness beweist keine fehlende HE-Klausel und wird auch nicht
durch eine allgemeine BY-Applicability ersetzt. Die bestehenden Länderwerte
bleiben im Kandidaten erhalten; eine wissenschaftliche BY-Abdeckung wird hier
ausdrücklich nicht neu behauptet. Eine noch nötige länderspezifische
Applicability-Rekonsiliation bleibt sichtbar.

## Konkrete frühe Stoffroute

Die alte gemeinsame Elementgruppen-/Salzklammer verlangt das vollständige
Atombau-/Bindungscluster. Die aktuelle HE9-Stoffroute setzt damit regelmäßig
HE10-Inhalte voraus. Der Lehrplan erlaubt eine vorgezogene Einführung nur mit
konkreter Physikabstimmung; eine solche Konferenzentscheidung wird hier nicht
angenommen.

Der Kandidat legt deshalb die drei frühen Elementgruppen-/Wasserziele in einen
eigenen **strukturellen Geschwistercluster**. Bei e0 und 584 tragen allgemeine
Stoffeigenschaften und die Element-/Verbindungsunterscheidung die stoffgenaue
Argumentation. Für 16a bleiben e0 und die bereits vorhandene Indikator-/Lösungs-
Kompetenz als direkte Voraussetzungen erhalten. Die ausgewählten
Reaktionsbeobachtungen/Produktidentitäten werden bereitgestellt oder im Ziel
erarbeitet. Die einfache Hydroxid-/Alkalitätserklärung wird lokal vermittelt;
vollständige Edelgasregel, Elektronenschalen, Brønsted oder Ionengittertheorie
werden dafür nicht als bereits bewältigte Kompetenz behauptet. Ein späterer
vertiefter Ionen-/Elektronenweg bleibt in seinen bestehenden Zielen erhalten.

Der neue Cluster hat eine ausdrücklich **provisorische, nicht adoptierte**
Struktur-ID. Kein neues Atom wird eingeführt. Alle fünf vorhandenen expliziten
Runtime-Referenzen auf den alten Teilbaum erhalten im Kandidaten die konkrete
neue Geschwisterreferenz. Die nativen Compiler bestätigen für jeden dieser fünf
Views dieselbe atomare Targetmenge wie zuvor. Source-Atlas-Views referenzieren
die Ziele direkt und brauchen dafür keine Zusatzänderung.

Der erhaltene späte Cluster wird passend zu seinen vier verbleibenden Kindern
als „Salzklassen und Alltagsanwendungen“ beschrieben. Seine Primärprovenienz wird
auf die tatsächliche HE10.3-Salzklassenzelle gebunden. Dieser konkrete
Elternlabel-/Quellenwechsel ist dokumentiert; er erfordert die gezielte spätere
Buch-Kontextbindung der vier Kinder, einschließlich der zwei bereits fachlich
abgeschlossenen Geschwister. Ihre Fachtexte werden dadurch nicht neu beurteilt.

Die bereits vollständig geschlossenen b508/d726 behalten sämtliche Zielfelder,
ihren kanonischen Beschreibungs-Kontext und ihre direkten, effektiven und
transitiven Voraussetzungen. Das ist tatsächlich geprüft. Veränderte spätere
Buchnavigation/-reihenfolge und Zielseiten werden damit noch nicht als
freigegeben behauptet; Root muss nach Wahl des konkreten Strukturstands nur die
tatsächlich betroffenen Seiten-/Kontextbindungen prüfen.

## Keine versteckte Vollfreigabe alter Zuordnungen

`hessen-source-mapping-additive.candidate.review.json` bewahrt jeden bisherigen
Source-Schlüssel und jedes bisherige Mapping-Tupel und ergänzt **eine partielle
584-Zuordnung**. Damit ist genau der Alltags-/Verbindungsanteil zusätzlich
explizit gebunden. Es wurde keine normative Source-Zelle gelöscht oder deren
Denominator verkleinert.

Zwei echte Altprobleme bleiben getrennt in
`source-mapping-before-after-cases.json`:

- Das 950-Gitterziel beweist weder Halogen-Metall-Reaktionen noch
  Hydrogenhalogenid-/HCl-Reaktionen. Seine älteren HE9-Teilzuordnungen erhalten
  hier keine neue wissenschaftliche Zustimmung. Ein späteres Entfernen/Ersetzen
  benötigt genaue verbliebene Klauselabdeckung und gegebenenfalls weitere
  gewöhnliche Ziele.
- Der Rutherford-/Partikel-Split beweist nicht automatisch die fünf zusätzlich
  als exact angehängten HE10.1-Atombauaspekte. Diese bleiben offen; historische
  exact-Bezeichnungen sind keine fachliche Prüfung.

## Bilder und Memory

Die vier tatsächlich vorhandenen Bilder für 16a, 584, 414 und 1f wurden als
Quellraster sowie in den gebundenen tatsächlichen 360-/680-Pixel-Ansichten
angesehen: **KEEP**. Quell-, Frontend- und Backendkopien sind bytegleich; die
aktuellen QA-Assethashes passen. Die Quellraster sind 2752 × 1536; `view_image`
zeigte sie mit hoher Detailstufe bei 2048 × 1143. Es wird keine Prüfung bei
unverändertem nativen Pixelmaß behauptet.

Konkrete Grenzen sind in `actual-existing-images.keep-advisory.receipt.json`
dokumentiert. Beim Düngerbild bleiben die kleineren Transporttexte bei 360
eine Lesbarkeitsgrenze; erforderliche Transportinformationen müssen in der
Aufgabe deutlich bereitstehen. Das vereinfachte Phosphatzeichen ist eine
Stoffkategorie, kein Dominanznachweis von freiem PO4³⁻ im Boden. Für 950 fehlt
weiterhin ein tatsächlich freigegebenes Bild; Root erstellt separat einen
inaktiven neuen Bildkandidaten. Dieser Ordner erzeugt/importiert kein Bild und
verändert keine operative V-Entscheidung.

Die fünf überarbeiteten Ziele brauchen nach eigener fachlicher Entscheidung
keine zusätzlichen Karten: räumliche Modellierung, Produktvergleich,
stoffgenaue Verwendungsbegründung und kontextgebundene Anwendung bleiben
Verständnisziele. Der native fünf-Ziele-M-Checker bestätigt genau diese
aktuellen Kandidaten. Er behauptet keine neue vollständige Shared-Deck-Freigabe.
Die vorhandene Partikel-Memoryroute bleibt in allen fünf nativen Kandidatenviews
sichtbar; tatsächliche Kartenbytes werden nicht verändert. Nach einem späteren
722-Split sind die Karten-/Origin-/Sichtbarkeitsbindungen gesondert zu prüfen.

## Tatsächliche gezielte Checks

`final-native-terminal.receipt.json` bindet die tatsächlichen erfolgreichen
Terminalaufrufe:

- Native Contains-Validierung ohne Fehler; gesonderte gezielte
  Effective-Requires-/Cluster-Mitgliedschaftsprüfung der sieben Ziele und der
  zwei unveränderten vollständigen Geschwister: Exit 0.
- Fünf native Runtime-View-Compiler: keine Fehler, gleiche atomare Targetmenge,
  bestehende Partikel-Memoryroute sichtbar.
- 14 exakte aktuelle Source-Zellen; jeder ursprüngliche Mapping-Eintrag
  erhalten, genau ein partieller Eintrag hinzugefügt.
- A für fünf neue Textkandidaten: 5 atomic, keine fehlenden/stale/obsoleten
  Records. M für dieselben fünf: 5 no_memory_needed, keine fehlenden/stale/
  obsoleten Records. Tatsächliche native Binder und Checker jeweils Exit 0.
- Vollständiger Kandidaten-Landscape gegen das bestehende Runtime-Schema
  bestanden; eigene JSON-/JSONL-Syntax bestanden.

Erste Diagnosefehler bleiben erhalten: Eine eigene frühe DFS vermischte
Contains-Mitgliedschaft und Requires fälschlich zu einem gemeinsamen DAG. Nach
Trennung zeigte die echte Reachability-Prüfung, dass eine zusätzlich vorgeschlagene
8d4-Reaktionsvoraussetzung über dessen allgemeinen Vorgängercluster erneut den
späteren Gesamt-Atombauweg importieren würde. Diese zusätzliche Kante wurde
verworfen; die originalen zwei direkten 16a-Voraussetzungen bleiben bestehen.
Die jeweiligen tatsächlichen Exit-1-Diagnosen sind neben dem erfolgreichen
Endlauf dokumentiert. Ein eigener früher JSONL-Linter behandelte außerdem die
legitime leere native Kartenzeile als Datensatz; der Endlauf folgt dem nativen
Parser, ohne Befunde/Datensätze zu entfernen.

Kein globaler Langlauf oder vollständiger Buch-/Anwendungsbuild wurde gestartet.
Keine technische Hashbindung zählt als neues fachliches Urteil.

## Nächste Integration

Root entscheidet den konkreten Struktur-/Quellenstand und die noch nötige
länderspezifische Abdeckung; dann folgen unabhängige Source-/Final-Book-D-Prüfer
für die tatsächlich gewählten Texte, Seiten, Kontexte und Assets, frische P-
Kandidaten und maschinelle V-Freigaben. Die beiden Splits und die offen genannten
zusätzlichen Klauseln bleiben im nächsten gezielten Paket. Ungeprüfte Kandidaten
und Grenzen zählen weiterhin als **0 neue strenge Abschlüsse**.

`author-remediation.freeze.manifest.json` bindet alle eigenen Artefakte vor
Freeze; die SHA-Datei bindet den Freeze. Wiederholungen, neue Befunde oder
Revisionen müssen einen neuen Versionsordner verwenden. Die historischen
Source-Ordner bleiben unverändert.
