# FW6-008: gezielte Rekombinations-Fortsetzung als Preservation-Kandidat

**candidate / ai_candidate**, keine aktive Mutation und keine ID-Adoption. Die Original-PDF-Seite 87 wurde erneut tatsächlich als Bild angesehen. Der eigene Source-/D-Befund wurde vor jeder P-Lektüre eingefroren; P-Inhalte wurden nicht gelesen.

## Fachlicher Befund

Der aktuelle FW6-008-HOLD besteht: `1d2b1038-dcd5-529a-b085-9e14f1d58c76` beschreibt Mitose und vereinfachte Meiose; `ec88fc1d-ee0f-5a01-9464-dc358241050e` vergleicht Teilungszahl, Tochterzellzahl und Chromosomensatz. Beide sind zutreffende **partial**-Komponenten, liefern jedoch keinen ausdrücklichen Nachweis der Rekombinationsprinzipien. Der operative v2-Befund hält diese Lücke ausdrücklich fest.

Auch die weiteren tatsächlich geprüften aktuellen Ziele liefern keine passende vollständige Alternative: Evolutions- und Biodiversitätsziele sind breiter oder setzen fortgeschrittene Genetik voraus; Kreuzungsziele verlangen statistische Auswertung beziehungsweise Vorhersage; Meiose-/Genommutationsziele betreffen Abläufe oder Fehler. Trisomie 21 erklärt zusätzliche Chromosomen, keine normale Neukombination. Für zwölf aktuelle Ziele sind Beschreibungen, Voraussetzungen, Anwendungsscope, tatsächliche NI-View-Einträge und Repository-Fingerprints dokumentiert: [current-goals-context-and-fingerprints.receipt.json](current-goals-context-and-fingerprints.receipt.json).

## Ein zusätzlicher Companion

Die exakte DE-/EN-Vorlage steht in [companion.goal-template.candidate.json](companion.goal-template.candidate.json). Ihr Source-/D-Urteil lautet **KEEP als begrenzter AI-Kandidat**. Sie erklärt die Neukombination anhand **vorgegebener korrekter Meiose-Chromosomenmodelle** durch unabhängige Verteilung und entsprechenden Abschnittsaustausch zwischen Nichtschwesterchromatiden. Diese zwei Beiträge werden als ein zusammenhängendes Erklärziel beurteilt; eigenständige Modellkonstruktion, quantitative Routinen und molekulare Mechanismen gehören nicht dazu.

Die Originalzelle auf Seite 87 nennt die Rekombinationsprinzipien auf Grundlage der Meiose in der zusätzlichen Spalte Ende Jg. 10. Die Wahl der zwei genannten chromosomalen Beiträge ist eine ausdrücklich ausgewiesene fachliche Konkretisierung dieses Bullets. Biologisch werden unabhängige Verteilung und Crossing-over als Wege zur Neukombination beschrieben; der Abschnittsaustausch liefert neue Kombinationen in Keimzellen. Quellen: [National Research Council: Glossary](https://www.ncbi.nlm.nih.gov/books/NBK218254/?report=classic), [NHGRI: Crossing Over](https://www.genome.gov/genetics-glossary/Crossing-Over). Die normative Kompetenz bleibt das tatsächlich gelesene NI-PDF, nicht diese ergänzende Biologiequelle.

Der [konkrete gelieferte Modellkontext](required-provided-model-context.candidate.json) enthält zwei korrekte Alternative-Meiosevergleiche und einen korrekten Abschnittsaustauschvergleich. Die lernende Person erläutert diese gelieferten Modelle; sie muss sie nicht unbeeinflusst selbst konstruieren. Modelle und Notation werden vorgegeben. Als bestehende direkte Voraussetzung ist der Pflanzen-/Tierzellenvergleich vorgesehen; das breite Mitose-/Meioseziel wird nicht umgeschrieben oder zu einer zusätzlichen umfassenden Routinepflicht gemacht.

Die kanonische UUID bleibt **null**. Root muss sie ausdrücklich adoptieren und die tatsächlichen finalen Fingerprints berechnen. Die Vorlage allein ist kein aktueller D-/P-/A-/M-/V-Abschluss und löst den operativen Source-HOLD noch nicht.

## Erhalten und präzise versionieren

- [Source-Zelle und drei Cache-Deltas](source-cell-and-three-cache.delta.candidates.json): FW6-008 erhält die genaue Originalformulierung und Jg.-10-Spalte. Drei advisory `canonicalTargets`-Caches entfernen ausdrücklich das schon operativ aus v2 entfernte Trisomie-Ziel. Bei FW7-003 und FW7-012 wird ausschließlich diese Cache-Ausrichtung vorgeschlagen; keine neue historische Fachfreigabe.
- [Mapping-Delta](mapping-fw6-008.delta.candidate.json): beide aktuellen partial-Zeilen bleiben erhalten. Eine zusätzliche Companion-Zeile darf nach tatsächlicher ID-Adoption und unabhängigem finalem Source-/D-Review die Lücke tragen. Alle anderen 122 NI3-Entscheidungen und sämtliche 334 NI3-Zeilen bleiben erhalten.
- [Parent und Placement](parent-placement.before-after.candidate.json): Genetik-Elterncluster bleibt in allen anderen Feldern unverändert; aktive 10 Kinder → NI3-vorbereitete 12 → mit Companion 13. Direkter NI-Source-View-Eintrag, NI-only-Applicability und Inheritance-Grenze werden benötigt. Kein bestehendes Atom wird entfernt oder umklassifiziert.

Nach NI3 plus diesen drei weiteren Source-Record-Deltas bleiben **115 vollständige Source-Records** unverändert; nach der gezielten FW6-008-Entscheidungsersetzung bleiben **117 historische Entscheidungen** unverändert. Die früher festgestellten 118 werden als datierte historische Beobachtung erhalten und nicht stillschweigend als aktueller Unverändert-Count weitergeführt. Die aktuelle Quellmenge bleibt 123. Der zusätzliche Companion ergibt geplant **367 Atome, 445 Gesamtziele und 335 Mappingzeilen**; diese Zahlen sind keine aktive Coverage.

Normative `sourceLandscapeId` ist **0b27a054-e81e-5423-aa71-d3d8d9d8f0db**; `canonicalLandscapeId` ist **08a43a1b-d97e-522c-9dfa-c950a493364e**. Der [Qualifier zum historischen Route-Label](historical-route-landscape-label.qualifier.candidate.json) erläutert die dortige Fehlbenennung, ohne den alten Route-/Freeze-Inhalt zu ändern.

## Adoptionsweg und offene Gates

[adoption-route.candidate.json](adoption-route.candidate.json) beschreibt die begrenzte Reihenfolge: Root-ID-Adoption in einer neuen inaktiven Version, tatsächliche aktuelle Source-/D-/Darstellungsprüfung, separate P/A/M/V-Gates, gekoppelte aktuelle Source-/Mappingversion und bytegetreues Archiv außerhalb beider aktiver Scanner. Erst dann kann der FW6-008-Source-HOLD sachlich aufgehoben werden. 123 `mapped`-Datensätze allein reichen dazu nicht.

Die aktive NI3-M6-Untergrenze bleibt während dieser Vorbereitung unverändert. Alle 363 bestehenden Atomtexte und Goal-Bodies bleiben auch im geprüften NI3-Staging erhalten. Eine spätere Integration muss tatsächlich geänderte Buch-/Kontextbindungen prüfen und die erreichte M6-Untergrenze gegen den aktiven Ausgangszustand bestätigen; Textbewahrung allein ersetzt diesen Nachweis nicht. Es werden keine globale historische Neuprüfung, Source-Human-Freigabe oder operative M3-Vollabdeckung behauptet.

## Freeze und Validierung

- [Source-/D-Freeze](source-description-verdict.frozen.json): `07aad72c7b1c022541a86a0313fc60dba7a7305c0661d144725bd73b6b351713`
- [Gesamtreceipt](frozen-receipt.json): `d502f063db4d2ab32282f5d7843fcbc6890d717ca698dd8ad2ed801057d50b09`
- [Validierung](validation.json): zwölf tatsächliche Goal-Bindings, Source-Delta-Abstimmung, gegebenes korrektes Modell, unveränderte aktive Inputs und alter NI3-Freeze bestätigt. Ein vollständiger Canonical-/Book-Build wurde mangels adoptierter ID nicht als bestanden ausgegeben.

Die genaue lokale Modell-ID/API-Parameter sind nicht zugänglich und wurden nicht erfunden. Artefakte dieser eingefrorenen Version bleiben unverändert; weitere Materialisierung erfolgt in einer neuen Version.
