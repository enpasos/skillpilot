# Unabhängige NI-Biologie Quellen- und Kandidatenprüfung A

**Eingefrorene maschinelle Quellen-/Kandidatenprüfung. Keine HumanApproval, keine aktuellen nativen Book-D-Reviews, kein P-Review und kein M7-Abschluss.**

Eigene Quellen-, DE/EN-, Atomicity- und Memory-Begründungen wurden zuerst in `first-judgments.freeze.json` gebunden, bevor irgendein fremder Reviewoutput oder P gelesen wurde. Beides wurde auch danach nicht gelesen. Autorenentscheidungen wurden ausschließlich als Vorschläge behandelt. Geschrieben wurde nur in diesem neuen Ordner.

## Ergebnis

| Gegenstand | Eigenes Urteil | Grenze |
| --- | --- | --- |
| Vier Sek-I-Vorlagen | Fachlich, DE/EN, stufengerecht und semantisch atomar als Quellenkandidaten geeignet | Keine stabilen IDs, keine endgültige Platzierung, keine D/P/A/M/V-Ledgerfreigabe |
| Sechzehn Quellzeilen | Literaltext, echte Seite und Jahrgangsspalte visuell bestätigt | Sechs eng abgegrenzte Retarget-Kandidaten; zehn normative HOLD-Anteile bleiben offen |
| Stammbaumkante `440854be-7f06-5678-91cb-ba8dcab56959` | Ersatz DNA → einfache Erbgänge fachlich geeignet und nativ azyklisch | Eigene Diploidie-/Rekombinationsfolgen im Familienstammbaum bleiben bis tatsächlichem D-Kontext HOLD |
| Canonical `9f73b963-5fac-5a90-a993-d7b7c0cc8526` | Aktueller DE/EN-Body fachlich fehlerhaft | Keine stillschweigende Reparatur oder Freigabe |

Alle vier konkreten Vorlagen erhalten in dieser Kandidatenprüfung `no_memory_needed`: Ihre Leistung ist Klassifikation, Kriterienanwendung oder kausaler Modelltransfer. Ein neues Pflichtdeck wird aus diesen Bodies nicht begründet. Jede Begründung ist einzeln dokumentiert; es wurden keine Memory-Ledger oder Decks geändert. Bereits vorhandene Memory-Entscheidungen werden dadurch nicht neu bestätigt.

## Tatsächliche Quelle und Operatoren

Geprüft wurden eigene neue Renderings des wirklichen amtlichen PDFs auf den physischen und gedruckten Seiten 75, 77, 87, 89, 90 und 91. Der Repository-PDF-Digest ist `sha256:7b3c69767b4c9a47d87598bee76a28bf7b6d2f6c9b039f2e655a9ad14d47aeac`. Die Source-Locatoren benutzen zusätzlich den nullbasierten PDF-Seitenindex und die Tabellenzeile/Jahrgangsspalte.

S.87 erlaubt in Sek I die cytologische/chromosomale Ebene und ein stark vereinfachtes Gen–Genprodukt–Merkmal-Modell; DNA-Aufbau/Replikation, Proteinbiosynthese und Punktmutation folgen in Sek II. S.89 begrenzt Mutation ausdrücklich auf die phänomenologisch-beschreibende Ebene. Die vier Vorlagen halten diese Grenze ein. Der Operatorenanhang S.103–108 wurde zusätzlich gelesen: `erklären` verlangt eigene kausale Verknüpfung, `erläutern` verständliche Veranschaulichung, `deuten` einen Erklärungszusammenhang und `nennen` eigenständig angegebene Elemente. Bestimmungsschlüssel haben den tatsächlich biologischen Kontext aus EG1; die numerische allgemeine `bestimmen`-Definition wird nicht falsch auf Artenbestimmung übertragen.

Ein direkter unabhängiger Byte-Download mit urllib lieferte HTTP 403. Die offizielle [NIBIS-Primärquelle](https://cuvo.nibis.de/index.php?p=download&upload=18) wurde erfolgreich mit dem Web-PDF-Werkzeug geöffnet und als Ministry-KC von 2015 mit 110 Seiten identifiziert. Ein eigenständig neu heruntergeladener Byte-Digest oder eine unabhängige aktuelle Bytegleichheit wird deshalb nicht behauptet. Der tatsächlich inspizierte lokale Primärquellenstand und alle Eingänge sind exakt gehasht.

Die vorgeschlagenen sechzehn SourceText-/Seiten-/Jahrgangs-/SourceRef-Werte stimmen. Eine spätere operative Extraktionsänderung muss ebenfalls Titel, Beschreibung, `sourceSpan`-Label, `sourceSpanText`, Grade-Tags und den konkreten Tabellenzeilen-/Spaltenlocator konsistent binden. Die begrenzten Autorenkorrekturen sind noch kein vollständiger aktiver Extraktionspatch und keine rückwirkende neue Genehmigung früherer Mappingrecords.

## Zehn HOLD-Anteile

Offen bleiben allgemeines Ordnen nach vorgegebenen Kriterien (5/6), Organismus-/Populationsebene unterscheiden (9/10), Diploidie/Rekombination im Familienstammbaum erläutern (9/10), Variabilitätsvorteil geschlechtlicher gegenüber ungeschlechtlicher Fortpflanzung erläutern (9/10), Artenkenntnis einer ausgewählten Gruppe (5/6), Züchtungsverfahren durch Variantenwahl erläutern (5/6), nicht-erbliche individuelle Anpassung gegenüber erblicher Angepasstheit unterscheiden (9/10), Familienähnlichkeit als Verwandtschaftsindiz deuten (5/6), Haustier-/Wildtierähnlichkeit mit gemeinsamen Vorfahren erklären (5/6) und wichtige Merkmale/Gemeinsamkeiten **aller fünf** Wirbeltiergruppen nennen (5/6).

Diese normativen Leistungen sind weder aus dem Bedarf gestrichen noch durch gegebene Aufgabeninformationen als bewiesen behandelt. Die anderen alten Targets derselben Source-Zeilen bleiben historischer Kontext; sie werden nicht neu freigegeben. Deshalb stellt das Ergebnis auch für die sechs positiven Retarget-Vorschläge keine vollständige Mappingrecord-, View- oder Source-Coverage-Freigabe dar.

## Kanonische Wiederverwendung und Fehler

Der tatsächliche aktive Bestand (441 Records) und NI5Base446 wurden vollständig durchsucht und die relevanten DE/EN-Bodies und Kanten direkt gelesen. Die fünf NI5-Atome bleiben inhaltlich unverändert. Die 441 bestehenden Bodies unterscheiden sich zwischen aktivem Bestand und NI5Base nur in zwei `contains`-Platzierungen.

`0380f992-723a-513d-8c3f-8ca7f8e0394f` ist die geeignete bestehende Schlüsselkompetenz. Der bestehende Stammbaum kann mit der gezielten Kantenänderung und später ausdrücklich geprüftem Source-/D-Kontext wiederverwendet werden. Ein Systematikansatzvergleich ersetzt keine morphologisch/anatomische Hierarchie; ein Drei-Artkonzepte-Vergleich ersetzt keinen einfachen Fortpflanzungsgemeinschaftsbegriff. Molekulare Mutationstypenanalyse ersetzt die ausdrücklich nichtmolekulare Erklärung nicht.

Der tatsächliche globale `9f73…`-Text nennt Mutation, Rekombination **und Selektion** gleichrangig als Ursachen genetischer Variation, sowohl in DE als auch EN. Mutation/Rekombination stellen neue Varianten bereit; Selektion verändert deren Häufigkeiten und kann in besonderen Fällen vorhandene Variation erhalten. Das rettet die unqualifizierte aktuelle Ursachenliste nicht. Der Fehler besteht unabhängig von der NI-Bindung.

Die neue Evolutionsvorlage ist fachlich geeignet. Weil `9f73…` bereits Grundprinzipien der Evolution bezeichnet, könnte eine **ausdrückliche** separate fachliche Korrektur mit Prüfung sämtlicher echter globaler Source- und Voraussetzungspflichten später seine stabile ID wiederverwendbar machen. Diese Alternative ist gegen den heutigen fehlerhaften Body nicht bereits bewiesen. Die Entscheidung für eine neue ID darf die notwendige globale Fehlerkorrektur nicht ersetzen; dieser Review führt diese Korrektur nicht aus und verkleinert keine normative Breite.

## Native Gegenprüfung

Das eigene Skript `verify-native-independent.mts` konstruiert das einzelne Kanten-Delta selbst aus NI5Base und prüft es gegen den eingefrorenen Autorenbody. Es benutzt die echten Funktionen `prepareLandscapeEntries`, `normalizeCanonicalLandscape` und `validateCanonicalLandscape`. Der `effectiveRequires`-Graph wird zusätzlich auf fehlende Referenzen und Zyklen geprüft, einschließlich tatsächlicher geerbter Voraussetzungen.

Aktiv441, NI5Base446, Kantenfassung446 und ein rein temporäres Modell450 ohne endgültige neue Platzierungen bestehen diese gezielte Prüfung. Nach dem Stammbaumwechsel enthält seine echte transitive Kette einfache Erbgänge, vereinfachte Meiose, Zellgrundlagen und Orientierung, aber keine DNA/Proteinbiosynthese. Drei der fünf alten DNA-Pfade entfallen; die globalen molekularen Endpunkte `9f73…` und `ffef…` behalten ihre Pfade. Das einzelne Delta verändert 15 bestehende Kontexte. Mit vier unplatzierten temporären Vorlagen sind es 20.

Der 450-Test bindet **keine endgültige `contains`-Platzierung**, keine Composition View und keine Mapping-/Source-Materialisierung. Er beweist daher keine vollständige finale Scope-/Stufen-/Elternvererbungsbereitschaft. Neue Platzierungen müssen anschließend wieder gegen echte native Voraussetzungen geprüft werden. Es wurden keine langen QS-/Buildläufe ausgeführt.

## Dateien und Freeze

- `input-bindings.independent.json`: exakte Inputs und erneute Prüfung sämtlicher eingefrorener Autorenartefakte.
- `four-template-DEEN-source-atomicity-memory.independent.json`: vier eigene Einzelurteile.
- `sixteen-source-scope-bindings.independent.json`: sechzehn literal-, seiten- und operatorgebundene Urteile samt zehn HOLDs.
- `prerequisite-edge.independent.json` und `native-independent.receipt.json`: eigenes Kantenurteil und reproduzierbare echte native Prüfung.
- `canonical-reuse.independent.json`: tatsächliche relevante DE/EN-Bodies und Wiederverwendungsentscheidungen.
- `scientific-blockers.independent.json` und `operator-and-stage.independent.json`: globaler Fehler, Stufengrenzen und fachliche Präzisierung.
- `first-judgments.freeze.json`: erste unabhängige Quellen-/Beschreibung-/A-M-Begründungen vor fremden Reviews/P.
- `review.freeze.manifest.json` und `freeze-verification.receipt.json`: endgültige Hashbindung und überprüfter unveränderter Eingangsstand.

Eigene didaktische Reviews: CC-BY-4.0, Attribution SkillPilot. Technische Prüfscripte: Apache-2.0. Amtlicher PDF-Text und originalgetreue Seitenabbilder behalten die fremde Herkunft/rechtliche Lage; keine pauschale eigene Lizenzierung. Mathematik/Physik, Runtime, Privacy, Plugin, CI, Publication, Canonical, Mapping, Registry, QA, Ledger, MemoryDeck und Viewdateien wurden nicht verändert.
