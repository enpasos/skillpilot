# Biologie E-Phase: gezielter Beschreibungsreview, Runde A

Status: **unabhängiger maschineller Kandidat**, keine menschliche Freigabe und keine Aktivierung im D-Gate. Umfang sind die acht durch die Layer-A-Reparatur betroffenen E-Phasen-Ziele sowie `0dd8380d`, `2517be3f` und `37147890`, deren didaktische Voraussetzungen gezielt korrigiert werden. Die historischen D-Entscheidungen und Runde B wurden für diesen Review nicht herangezogen. Dieses v2-Artefakt erhält die neun fachlichen Ersturteile der Runde A aus v1 und ergänzt nur die zwei neu betroffenen Ziele.

## Prüfgrundlage

- Aktuelle kanonische Biologie: `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json`.
- Amtliches HE-Kerncurriculum: `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf`, gedruckte Seiten 35–36, E.1 bis E.3. Diese Primärquelle ist maßgeblich, wenn die ältere Source-Extraction mehrere Inhalte in einer künstlichen Kompetenz zusammenfasst.
- Aktive HE-Zuordnung: `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-ephase-20260930-v2.review.json`. Die zugehörige Extraktion wurde nur zur Identifizierung der alten Source-Ziel-IDs verwendet.
- Für die fachliche Reichweite einzelner Länderzuordnungen zusätzlich die aktuellen BY- und BW-Source-Extractions und Mappings. Die fachliche Prüfung beruht auf dem konkreten Quellinhalt, nicht auf einer rohen `applicability`-Liste.
- Die acht aktiven PNGs wurden als Kontaktblatt aus tatsächlichen Dateien angesehen; das neunte PNG wurde einzeln in Originaldarstellung geprüft. Das war nur ein Widerspruchscheck zum D-Text; es ist keine Visualisierungsfreigabe.

## Einzelentscheidungen

### `1042bb24-96ba-553b-a956-abaf9c74dc43` — Endosymbiontentheorie

**D: KEEP-Kandidat.** Der DE/EN-Text verlangt dasselbe Modell: die Aufnahme früherer Bakterien und deren Fortbestehen als Mitochondrien beziehungsweise Plastiden in eukaryotischen Linien. Die amtliche HE-E.1-Passage nennt Endosymbiontentheorie für die Evolution der Eucyten. Das Ziel bleibt getrennt vom Überblick Einzeller–Vielzeller; Endosymbiose wird nicht als Ursache der Vielzelligkeit ausgegeben. Eine neue, anders beschriftete Zellfolge könnte erklärt und von einer bloßen Beobachtung unterschieden werden. Die Bildfolge ist unterstützender Modellkontext, kein Beleg für die Theorie. Ein Transferfall müsste die Organellenentwicklung erklären, ohne zu behaupten, alle Eukaryoten hätten Chloroplasten.

### `6199e4c7-06d1-559a-98ab-acf805a478ba` — Einzeller, Zellverband, Vielzeller

**D: KEEP-Kandidat unter zutreffender Quellenprojektion.** Verglichen wird eine einzige fachliche Dimension, die Zellorganisation; die drei Formen sind Beispiele auf dieser Vergleichsachse. HE E.1 nennt den evolutionsbiologischen Überblick vom Einzeller zum Vielzeller. Die Beschreibung fordert keinen unbelegten direkten Abstammungsweg und koppelt Vielzelligkeit nicht kausal an Endosymbiose. Lernende könnten neue Mikroaufnahmen anhand der Zellorganisation einordnen und den Unterschied zwischen lockerem Verband und integriertem Vielzeller begründen. Ein bloßes Nachzeichnen der drei Bildfelder wäre keine Verständnisevidenz. Für weitere Länderansichten ist ein dortiger voller Quellenbeleg gesondert nötig.

### `d06adc48-b845-54af-b17c-06b5cb910b11` — pH-Abhängigkeit der Enzymaktivität

**D: KEEP-Kandidat.** DE und EN begrenzen die Kompetenz gleich auf die Deutung kontrollierter Daten zu einem pH-Einfluss samt Optimum. HE E.2 nennt pH als einen Einflussfaktor; Temperatur und Substratkonzentration liegen in anderen Atomen. Die kontrollierten Vergleichsbedingungen verhindern eine Scheinkausalität. Als Nachweis können Lernende an einer neuen Messreihe die Aktivität über pH vergleichen, den höchsten beobachteten Bereich bestimmen und die Aussage auf das untersuchte Enzym und die Bedingungen begrenzen. Aus der Kurve allein folgt kein molekularer Denaturierungsmechanismus.

### `d71e2310-2331-5e66-b7df-c2807fccb329` — Organisationsstufen eines Vielzellers

**D: KEEP-Kandidat.** Die Relation Zelle–Gewebe–Organ–Organismus ist eine zusammenhängende Organisationskompetenz und entspricht dem Organisationsstufen-Anteil von HE E.1. Lebenskennzeichen sind getrennt. In einem anderen pflanzlichen oder tierischen Beispiel können Lernende konkrete Teile zuordnen und erklären, wie Zellen ein Gewebe und Gewebe ein Organ bilden. Die englische Beschreibung erhält denselben Ein-Organismus-Bezug.

### `e063b97d-9e03-5094-8c73-72a3eeec803d` — einfaches Biomembranmodell

**D: KEEP-Kandidat für den HE-Inhalt; BY-Reichweite gezielt prüfen.** Die Zeichnung einer Lipiddoppelschicht mit Proteinen und selektiver Passage ist eine zusammenhängende Modellleistung. HE E.1 bindet Biomembranschema, Bilayer sowie selektive Permeabilität und Proteintransport. Lernende sollten in einem neuen Schema die zwei Lipidlagen und ein geeignetes Transportprotein sinnvoll anordnen und an einem Stoffbeispiel erläutern, weshalb nicht alle Teilchen denselben Weg durch die Membran nehmen. Das aktuelle BY-B13-EA.2.2/B13-GA.2.2-Quellenziel stützt Membranaufbau nach Flüssig-Mosaik-Modell und Transportvorgänge; ob es die volle Selektivitätsforderung dieser Formulierung trägt, muss am konkreten BY-Scope entschieden werden. Die aktive Abbildung mit einem zusätzlichen ATP-Feld erweitert den kurzen Zieltext nicht.

### `e1484671-208b-5ad1-a71d-7d994fb2174b` — Zellzyklus

**D: KEEP-Kandidat.** Das Einordnen von G1, S, G2 und M samt DNA-Verdopplung in S vor der Teilung ist ein einzelnes Zyklusmodell. HE E.3 nennt den Zellzyklus neben dem getrennten Mitose/Meiose-Vergleich. DE und EN sind gleichwertig. Lernende könnten eine neu sortierte Phasenfolge richtig anordnen und begründen, warum die DNA vor der M-Phase repliziert werden muss; die bloße Wiedergabe des vorhandenen Bildes reicht nicht.

### `e76315b1-2fed-525c-8efa-ca09da46f632` — Diffusion und Osmose

**D: KEEP-Kandidat für HE, aber nur als integrierte Gegenüberstellung beider Bewegungen.** In einem Konzentrations-/Membranfall sind die Richtung der Nettodiffusion des betrachteten Stoffes und die Richtung der osmotischen Wasserbewegung zu trennen; das ist ein gemeinsamer Transfer über Konzentrationen und Durchlässigkeit, keine zwei unverbundenen Routineaufgaben. HE E.1 deckt Diffusion und Osmose ab. Lernende müssten bei veränderten Konzentrationen beide Bewegungen erneut begründen und bei umgekehrtem Gefälle die Richtungen neu bestimmen. Die Anfangsprojektionen nach BY B10.3.8 und BW 3.3.4 waren fachlich zu weit: BY belegt nur Diffusion beim Gasaustausch, BW nur Osmose bei Plasmolyse. Solange die ganze kombinierte Kompetenz dort ohne weitere Quelle sichtbar ist, bleibt die jeweilige Länderbindung offen. Das dritte Bildfeld „Aktiver Transport“ ist nur Kontrast und kein Teil der D-Kompetenz.

### `ec88fc1d-ee0f-5a01-9464-dc358241050e` — Mitose und Meiose

**D: KEEP-Kandidat.** Der Vergleich hat eine einzige Bewertungsfrage mit drei passenden Kriterien: Zahl der Teilungen, Zahl der Tochterzellen und Chromosomensatz. HE E.3 nennt den Vergleich ausdrücklich. Lernende können ein neues Teilungsschema anhand dieser Merkmale zuordnen und die Reduktion des Chromosomensatzes bei Meiose gegenüber der Erhaltung bei Mitose begründen. DE und EN stimmen im Anspruch überein; Zellzyklusphasen werden nicht zusätzlich gefordert.

### `0dd8380d-b542-5126-8d8e-f95d9ccded90` — freie Trisomie 21

**D: KEEP-Kandidat nach Prüfung der neuen Voraussetzung und Seite.** Der DE/EN-Text benennt dieselbe kausale Erklärung: eine Fehlverteilung von Chromosom 21 kann eine Keimzelle mit zwei Kopien und nach Vereinigung mit einer normalen Keimzelle eine Zelle mit drei Kopien entstehen lassen; die zusätzliche ganze Chromosomenkopie ist eine Genommutation. Das amtliche HE-E.3-Thema nennt Mutation als Prinzip am Beispiel Trisomie 21 (gedruckte S. 36). Der Text beansprucht weder einen Katalog von Mutationsarten noch eine Erklärung aller Trisomie-Formen. In einem geänderten Chromosom-21-Zahlmodell könnten Lernende die zusätzliche Kopie erklären und ein falsches Modell mit bloßer Genänderung zurückweisen. Das bestehende 4:3-Bild zeigt nur die Zahlenbeziehung 2 + 1 = 3; es zeigt die Meiose nicht, behauptet das im Alt-Text auch nicht und ersetzt die Erklärung einer Fehlverteilung nicht. Ein vollständiger Mitose/Meiose-Vergleich ist für diese Kompetenz keine notwendige Voraussetzung; die korrigierte Route muss das berücksichtigen.

### `2517be3f-e42f-5e41-889d-70f00dc24686` — frühe Embryonalentwicklung

**D: REVISE-Kandidat; kein Carryover.** Der aktuelle deutsche Text verbindet die Übersicht von der Befruchtung zur Blastocyste mit unspezifizierten „Störungen“; die englische Fassung fordert analog „potential disorders“. Das ist mehr als der Titel „Frühe Embryonalentwicklung skizzieren“ und vermischt zwei unabhängig prüfbare amtliche HE-E.3-Punkte: die frühe Entwicklung im Überblick und embryonale Schädigungen anhand von Beispielen. Die ältere Extraction fasst beides künstlich zusammen; ihre `exact`-Zuordnung ist kein Beleg für die genaue amtliche Reichweite. Die in diesem Ziel beobachtbare Leistung sollte eine geordnete Skizze der frühen Entwicklungsstadien in einem neuen Fall oder Diagramm sein. **Vorschlag DE:** „Die lernende Person kann die wesentlichen Schritte von der Befruchtung bis zur Blastocyste in zeitlicher Reihenfolge skizzieren.“ **Vorschlag EN:** „The learner can outline the main stages from fertilization to the blastocyst in chronological order.“ Die getrennte Schädigungs-/Teratogen-Kompetenz ist im Graph vorhanden, aber wird durch diesen gezielten D-Review nicht neu freigegeben. Jede kanonische Revision benötigt anschließend eigene aktuelle D/P/A/M/V- und Seiten-/Quellenbindung.

### `37147890-84e4-5ba7-80e1-92fbf2070d7c` — Geschlechtsfestlegung

**D: SPLIT_REVIEW / HOLD.** Das aktuelle Ziel verlangt Karyogramme zu interpretieren **und** Kern-, somatisches sowie psychisches Geschlecht zu unterscheiden. Diese Leistungen sind getrennt erwerbbar und die Formulierung „Geschlechtsfestlegung analysieren“ kann fälschlich suggerieren, ein Karyogramm bestimme alle drei Dimensionen. Die amtliche HE-E.3-Passage auf gedruckter S. 36 nennt Karyogramm, X-/Y-Chromosomen und die drei Dimensionen in einem Themenpunkt, schreibt aber keinen solchen Schluss aus einem Karyogramm vor. Der alte `exact`-Match auf die synthetische Extraction entscheidet die fachliche Granularität nicht.

**Präziser Split-Vorschlag, Kandidat:**

1. Beim bestehenden Ziel die Kompetenz auf die begrenzte Karyogramm-Aussage eingrenzen. **Titel DE:** „X-/Y-Konstellation im Karyogramm deuten“. **Titel EN:** „Interpret the X/Y chromosome pattern in a karyogram“. **Beschreibung DE:** „Die lernende Person kann in einem Karyogramm die X-/Y-Chromosomenkonstellation beschreiben und daraus begrenzte Aussagen zum Kerngeschlecht ableiten.“ **Beschreibung EN:** „The learner can describe the X/Y chromosome pattern in a karyogram and draw limited conclusions about chromosomal sex.“ Ein Transferfall zeigt eine andere X/Y-Konstellation; die lernende Person benennt nur, was das Bild tatsächlich belegt, und macht keine Aussage über Körpermerkmale oder Identität.
2. Für die eigenständige Dimensionsunterscheidung ein neues kanonisches Atom mit neuer stabiler ID anlegen. **Titel DE:** „Dimensionen von Geschlecht unterscheiden“. **Titel EN:** „Distinguish dimensions of sex and gender“. **Beschreibung DE:** „Die lernende Person kann Kerngeschlecht, somatisches Geschlecht und psychisches Geschlecht unterscheiden und an einem neuen Fall erläutern, weshalb eine Dimension die anderen nicht sicher festlegt.“ **Beschreibung EN (Terminologie-Kandidat):** „The learner can distinguish chromosomal sex, somatic sex and gender identity and explain in a new case why one dimension does not reliably determine the others.“ Die Übersetzung des amtlichen Begriffs „psychisches Geschlecht“ als „gender identity“ ist gesondert terminologisch zu prüfen; sie wird hier nicht als amtlicher englischer Wortlaut ausgegeben. Der Transfer prüft die Unterscheidung in einem neuen Fall und vermeidet Zuschreibungen aus einem Karyogramm.

Eine engere integrierte Alternative wäre ein einziges Ziel zur Aussagekraft **und Grenze** des Karyogramms, müsste aber ebenfalls Titel, DE/EN-Text und Nachweise neu binden. Bis Kanonentscheidung, Source-Match, positive Evidenz und zwei unabhängige neue Reviews vorliegen, bleibt das D-Gate offen. Eine Karyogramm-Ablesung allein reicht für den bisherigen Gesamttext nicht.

## Offene Bindungspunkte

1. Die gedruckten Seitenzahlen der aktuellen lokalen amtlichen HE-PDF sind 35–36. In Teilen der aktiven HE-Mapping-Rationales stehen noch 33–34. Die Abschnittsbindung E.1/E.2/E.3 ist inhaltlich plausibel; die Seitenangaben müssen auf die verwendete PDF-Version bezogen richtiggestellt werden.
2. `e76315b1` darf nicht allein durch Teilquellen aus BY und BW als ganze kombinierte Kompetenz in diesen Scopes erscheinen. Korrektur der effektiven Projektion oder zusätzliche tragfähige Quellenbindung ist vor einem D-Gate-CARRYOVER erforderlich.
3. `e063b97d` hat in BY eine partielle Modell-/Transportquelle. Die konkrete Reichweite der Selektivitätsforderung muss vor Übernahme dieses Länder-Kontexts geklärt sein.

Die Bilanz dieser Runde lautet **neun KEEP-Kandidaten, ein REVISE-Kandidat und ein offener SPLIT_REVIEW-Fall**; daraus folgt **kein neuer strenger M7-Abschluss**. Nach finaler Quellen-/Seiten- und `requires`-Korrektur sind die genau betroffenen aktuellen Ziel-, Seiten-, Kontext- und Quellenfingerprints neu zu binden und mit Runde B unabhängig abzugleichen. Eine bloße Hash-Übernahme wäre keine fachliche Prüfung.
