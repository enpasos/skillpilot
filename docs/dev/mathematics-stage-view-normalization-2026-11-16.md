# Mathematik: Stufen, Lernplätze und partielle Themenordnung

Arbeitsstand vom 17. November 2026. Dies ist ein Implementierungsnachweis, keine
Abnahme der vollständigen Länder-Karten und keine Aussage über einen CI-Lauf.

Die [Zeit- und Quellenübersicht je Land](mathematics-stage-view-source-units-2026-11-17.md)
nennt die tatsächlichen Struktur-IDs und trennt amtliche Zeitstellen von
redaktionellen oder bedarfsbedingt früheren Lernplätzen.

Die Mathematik-Sichten behalten ihre bestehenden kanonischen Ziele und die
atomaren Rollen. Eine `canonicalSubtree`-Aufteilung darf die Priorität eines
vorhandenen `prerequisiteOnly`-Verweises nicht verändern. Der Normalisierer
berechnet deshalb die Rollen vor und nach der Aufteilung und schreibt bei
Bedarf den bisherigen Supportstatus als expliziten atomaren Verweis. Er bricht
bei einer verbleibenden Abweichung ab. Die kanonischen Ziele, `requires`,
Assessments und amtlichen Eingabedateien werden dabei nicht bearbeitet.

Unter dem Mathematik-Fachknoten stehen Stufencontainer. Insbesondere gehören
die bisher neben einem kleinen `sek-ii`-Ergänzungscontainer liegenden großen
Sek-II-Themen ebenfalls unter Sekundarstufe II. Diese Korrektur ändert die
Lernbaum-Elternschaft; der bisherige Backend-Lernumfang war bereits vorhanden.

Das neue Format 1.2 unterscheidet Anzeigeordnung und verbindliche Reihenfolge.
Themencontainer deklarieren eine reduzierte Teilordnung über den tatsächlichen
kanonischen Bedarf zwischen ihren Kind-Einheiten. Die ausdrückliche E3-Ausnahme
für eigene Atome bleibt erhalten: Ein Pfad Einheit → eigenes Atom → Einheit
erzeugt keine zusätzliche Verpflichtung zum vollständigen Abschluss der ersten
Einheit. Die kanonischen Voraussetzungen ordnen diese Atome. Unabhängige Themen bleiben
parallel; nur tatsächliche aufeinanderfolgende Zeitcontainer deklarieren eine
zeitliche Kette. Die Kanten nennen ausschließlich direkte Strukturkinder.
Ein Auszug berechnet die Ordnung aus seinen verbliebenen Kindern neu; Verweise
auf entfernte Geschwister werden nicht übernommen. Ein zyklischer Gruppenschnitt
ist damit nicht heilbar: Er bleibt im Bericht `unresolvedContiguousGrouping`
und erfordert eine fachliche Umgruppierung. Solange solche Befunde bestehen,
ist die vollständige Kartenabnahme offen.

## Quellen und Grenzen der Zeitzuordnung

Der Normalisierer liest die bestehenden Mathematik-Source-Extraction-Reviews
unter `curricula/DE/Gymnasium/mapping/DE-*/` und die darin gebundenen
`sourceExtractionPath`-Dateien. Eine vorhandene Landeszuordnung hat Vorrang
vor der kanonischen Kompatibilitätsphase. Die Eingabedateien bleiben unverändert.
Bei mehreren Zuordnungen hat eine passende explizite Duration-Zuordnung Vorrang.
Danach zählt die spezifischere kanonische Zuordnung vor einer breiten
übergeordneten Gruppe. Beispielsweise macht eine allgemeine Zufalls-Gruppe in
Klasse 5/6 nicht jede spätere Vierfelder-Kompetenz zu einem 5/6-Ziel. Für
partielle Cluster-Mappings gilt eine zusätzliche Grenze: Ein `partial`-Match
mit `canonicalDistance > 0` belegt keinen atomaren Zeitpunkt. Solche Passagen
werden vor der Präzisionsauswahl ausgeschlossen und im Entscheidungsbericht
unter `excludedPartialClusterSourceGoalIds` aufgeführt. Die atomare oder exakte
Quellzuordnung bleibt erhalten. Konkret belegen BW 3.1.1, Aufgabenpunkte 23/26
auf S.17 Zahlterm-Begriffe; sie verschieben weder Bruchterme noch algebraisches
Ausmultiplizieren nach J5/6. Der direkte exakte Beleg für lineare Gleichungen
in BW 3.2.1 K19, S.24 bleibt J7/8.

Für
`GLOBAL`-Atome wird die nächste fachliche kanonische Elternphase gelesen;
`GLOBAL` ist kein Synonym für die erste Klasse der gewählten Stufe.
Die ausdrücklich als `phase:SekI` und `Orientation` markierte Einführung
`65365dce…` ist eine benannte Ausnahme: Sie erhält den redaktionellen Einstieg
in die Sek I. Ihr fehlender Kalenderjahrgang darf sie nicht durch den allgemeinen
Fallback in die Oberstufe verlagern. Dies ist keine amtliche J5-Zuordnung.
Eigene Prüfungsatome mit `nodeKind: exam`, `GLOBAL` und einer expliziten Bindung
`authoringMetadata.primaryAssessedGoalId` übernehmen den Lernplatz des geprüften
Primärziels. Beispielsweise gehört die Scheitelpunktprüfung zur zugehörigen
Quadratik-Kompetenz in J9. Ohne diese Bindung würde ein unbelegter J5-Fallback
die Aufgabe und anschließend ihre Voraussetzungen unzulässig vorziehen.

| Land / amtliche Primärquelle | Zeitangaben und Grenze der daraus folgenden Zuordnung |
| --- | --- |
| [BE](https://www.berlin.de/sen/bildung/unterricht/faecher-rahmenlehrplaene/rahmenlehrplaene/rahmenlehrplan-mathematik_go-teil-c.pdf), [BB](https://bildungsserver.berlin-brandenburg.de/rlp-online/c-faecher/mathematik) | Sek I: Kompetenzniveaus; Sek II: Q1–Q4 in den entsprechenden Ausgangspassagen |
| [BW](https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_M.pdf) | Sek I: Klassen 5/6, 7/8, 9/10; Sek II: Kursstufe ohne pauschal festgelegte Semesterfolge |
| [BY](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/mathematik) | Jahrgangsstufen 5–13; GK/LK bleiben die vorhandenen technischen Projektionen |
| [HB](https://www.lis.bremen.de/sixcms/media.php/13/GyO_Mathematik_2022.pdf) | Sek I: aktueller Bereich 5–9 gemäß Einschränkung 2022; ältere 2006-J10-Angaben sind keine aktuelle Sek-I-Zeitzuordnung. Atomare Lernplätze ohne konkrete aktuelle Zeitbindung bleiben redaktionell. Sek II: E-/Q-Inhalte ohne vollständige Semesterverteilung |
| [HH](https://www.hamburg.de/resource/blob/123074/23276415bdfb32ba8bb652f7c1998a4c/mathematik-gyo-2022-data.pdf) | Sek I: 5/6, 7/8, 9/10; Sek II: Semester 1/2 und 3/4 |
| [MV](https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_MA_SEK2.pdf) | Sek I: J5–J10 in den Themenkennungen; Sek II: fachliche Bereiche |
| [NI](https://cuvo.nibis.de/index.php?p=download&upload=208) | Sek I: Lernbereiche ohne atomgenaue Jahrgangstags im Extrakt; einzelne Lernplätze bleiben redaktionell. Sek II: E-/Q-Kennungen |
| [NW](https://lehrplannavigator.nrw.de/system/files/media/document/file/gost_klp_m_2023_06_07.pdf) | Sek I: Erprobungsstufe und weitere Stufen; Sek II: E und Q |
| [RP](https://bildung.rlp.de/lehrplaene/?tx_rlpbase_download%5Baction%5D=download&tx_rlpbase_download%5Bcontroller%5D=Download&tx_rlpbase_download%5Bitem%5D=56486&type=432522&cHash=9d657e3ab0dc693de509d67c39f2a5b7) | Orientierungsstufe, Klassen 7/8 und 9/10; G8 berücksichtigt die vorhandene verkürzte Sek-I-Zuordnung |
| [SH](https://fachportal.lernnetz.de/sh/faecher/mathematik/fachanforderungen.html?file=files/Fachanforderungen%20und%20Leitf%C3%A4den/Sekundarstufe/Fachanforderungen/Fachanforderungen%20Mathematik%20Sekundarstufe%20%282024%29%2C%20barrierearm.pdf&cid=16990) | Die Fachanforderungen benennen Inhaltsbereiche; die erhaltene Duration-Policy konkretisiert redaktionelle Lernplätze. Keine amtliche Semesterfolge wird daraus abgeleitet |
| [SL](https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_GOS_ab_2019_2020/Mathematik/LP_Ma_EP_GOS_2014.pdf?__blob=publicationFile&v=3) | Sek I: 5/6, 7, 8, 9, 10; Sek II: E und Q |
| [SN](https://www.schulportal.sachsen.de/lplandb/lehrplan/file/121/galmOUYkLcTVJh8Sk6g9) | Sek I: 5–10; Sek II: 11/12 |
| [ST](https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung/Mathematik_FLP_Gym_01_07_2019.pdf) | Sek I: 5/6, 7/8, 9, 10; Sek II: 11/12 |
| [TH](https://www.schulportal-thueringen.de/tip/resources/medien/19980?dateiname=lp_gy_mathematik_10.04.2019_TSP.pdf) | Sek I: 5/6, 7/8, 9/10; reguläres Gymnasium: E in 10, Q in 11/12. Das ebenfalls extrahierte 11S bezeichnet einen Sonderzugang, nicht die normale Einführungsphase. |
| [HE](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf) | Die bereits bearbeitete Gliederung bleibt erhalten; Themenketten werden durch explizite partielle Ordnung ersetzt. |

Die Links bezeichnen die amtlichen Ausgangsdokumente der bereits erhaltenen
Source-Extractions. Die konkreten Source-Ziele tragen `sourceRef`, `sourceSpan`
und die Dokumentkennung; die Mapping-Reviews binden sie an kanonische Ziele.
Die Jahres- und Halbjahresbezeichnungen werden nur in der in der jeweiligen
Zeile angegebenen Genauigkeit daraus gelesen.

Für Berlin stehen die Halbjahre bereits in der rechten Zuordnungsspalte von
Kapitel 3.2.2 (S. 24–28); Kapitel 4 (S. 29) bestätigt Q1 Differentialrechnung,
Q2 Integralrechnung und Wahrscheinlichkeit, Q3 analytische Geometrie und Q4
Vertiefung/komplexe Aufgaben. Der Extrakt speichert diese Angaben im Feld
`phase`. Bei mehrfach zugeordneten Kompetenzen wie `Q2/4` ist Q2 der einmalige
Erwerbsplatz; Q4 bleibt der spätere Anwendungskontext. Das behauptet keine
Tilgung des späteren amtlichen Inhalts. Brandenburg benennt Q1–Q4 im Extrakt
mit Quellstellen S. 23, 26, 29 und 31 und zusätzlich mit `phase:`-Tags.
Ein lediglich aus kanonischem `E` übernommener Lernplatz ist in beiden Ländern
keine amtliche Zuordnung zur Jahrgangsstufe 11. Gerade am regulären Gymnasium
müssen die E-Phase und der zugehörige Kalenderjahrgang getrennt gelesen werden.

Sachsen und Sachsen-Anhalt liefern hier Quellen für die Qualifikationsphase
11/12; daraus entsteht keine erfundene Quartalsfolge. Thüringens 11S-Passagen
sind ausdrücklich ein Sonderzugang. Ihr übernommener E-Lernplatz trägt im
Entscheidungsbericht `special-access-editorial-placement`; er belegt keine
reguläre Gymnasial-E-Zuordnung. Die reguläre E10/Q11–12-Struktur bleibt davon
getrennt.

Nicht aufgelöste Zeitangaben sind redaktionelle Lernplätze, keine neuen
amtlichen Herkunftsbehauptungen. Der Bericht des Normalisierers unterscheidet
`source-mapping` und `retained-editorial-placement`. Ein Lernziel kann aufgrund
eines bestehenden konkreten `requires` früher benötigt werden. Der Bericht
nennt dann das frühere und neue Zeitfenster sowie das abhängige Lernziel.
Die Quellmitgliedschaft und der Zielstatus bleiben bestehen.

Die zwölf zuvor auf die bundesweite Sek-I-Sicht zurückfallenden Länder erhalten
einen eigenen Auszug. Dessen Quelle ist der gesicherte ursprüngliche
Sek-I-Quellbaum, ergänzt durch geprüfte Lower-Source-Mappings innerhalb der
bereits bestehenden CrossStage-Ziele. Die frühere Platzierung einer notwendigen
Voraussetzung erzeugt ausdrücklich keine neue Sek-I-Quellmitgliedschaft.
`app/scripts/config/math-seki-source-membership.json` hält diese Mengen und die
Quellenbindungen getrennt vom veränderlichen Lernbaum fest.

Dabei bleibt eine bestehende Quellen-/Operationalisierungsdiskrepanz offen:
Lower-Prozess-Mappings verweisen teilweise auf sechs tatsächliche
Q4-Assessmentziele (`3095e125…`, `e45a39e5…`, `99b3435a…`, `7337049a…`,
`4c319dfd…`, `b9a501c4…`). Deren freigegebene Aufgaben prüfen Oberstufeninhalte.
Diese Aufgaben werden deshalb nicht allein durch das Lower-Prozess-Mapping zu
neuen Sek-I-Seeds. Die vollständigen CrossStage-Ziele bleiben erhalten. Die
Policy dokumentiert je Ausnahme die Quellpassage, das Mapping, die tatsächliche
Assessmentdatei und die geprüften kanonischen Ziele. Damit ist ausdrücklich
keine vollständige fachliche Operationalisierung aller Lower-Prozessquellen
behauptet; die Ausnahmen bleiben ein sichtbarer fachlicher Befund.

Für Bremen belegt die aufbewahrte Quelle
[`06-12-06_mathe_gy.pdf`](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/input/HB/06-12-06_mathe_gy.pdf)
auf gedruckter S.10 qualitative Analysis und den formalen Ableitungsbegriff noch
für den früheren Jahrgang 10. Die
[Anlage zur Einschränkung von 2022](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/input/HB/Gy_Mathe_2006_inhalt_Einschraenkungen.pdf)
ersetzt auf S.1 Nr.2 die J9-Inhalte und auf S.1–2 Nr.4 die Inhaltsstandards.
Ihre Funktionsanforderungen betreffen lineare und quadratische Funktionen;
der intuitive Grenzwert bei irrationalen Zahlen begründet keine volle
Ableitungseinheit. Die erhaltene Source-Extraction bezeichnet die alten
Übersichtszeilen unzutreffend als 5–9. Sie bleibt unverändert, erhält hier aber
keine Vorrangwirkung gegenüber der Einschränkung. Die fünf ausschließlich als
neue Mapping-Supplements aufgenommenen Ziele `2850e8f6…`, `5518ceb3…`,
`7156558c…`, `9f2fc0d1…` und `f9fdb733…` werden deshalb nicht zu neuen
Sek-I-Seeds. Die ursprüngliche Sek-I-Baummenge und die protokollierte
Supplementherkunft bleiben erhalten; `excludedSupersededSourceSupplements`
bindet die Entscheidung an beide PDF-Hashes und die konkreten Mappingzeilen.
Bremens neuer Sek-I-Auszug hat damit 237 statt 242 ungefilterte Quell-Seeds.
Die vollständigen CrossStage-Targets und echte Vorbereitung aus L bleiben
unberührt.

Wiederverwendete komplexe Oberstufen-Prozessaufgaben aus einem Sek-I-Supplement
werden nicht allein wegen dieses Supplements in Klasse 5 gelehrt. Ihr Lernplatz
muss die bestehenden Voraussetzungen berücksichtigen. Diese Abweichung zwischen
Quellmitgliedschaft und Lernplatz ist ebenfalls ausdrücklich protokolliert.

Ein tatsächlicher zusätzlicher Erwerbsplatz ist eine atomare `goalEntry` mit
`projectionRole: prerequisiteOnly` und `acquisitionPlacement: true`. Das Flag
ist notwendig: eine bloße Scope-Ausschlussdeklaration ist kein Lernplatz.
Die Runtime darf den Platz ausschließlich für ein bereits autoritativ zu L
gehörendes, bislang unplatziertes Atom materialisieren. Ohne Personal-Curriculum-
Metadaten entsteht dadurch kein sichtbares Lernziel. Jeder vom Normalisierer
ergänzte Platz wird mit Strukturpfad und kanonischem `requires`-Zeugenpfad
protokolliert; vorhandene Quellrollen bleiben bestehen.

Der zusätzliche Sammelcontainer „Benötigte Grundlagen“ darf keine voneinander
abhängigen Teile bestehender Themen auseinanderziehen. Benötigt ein neues
Vorbereitungsatom bereits Ziele eines vorhandenen Themas und bereitet dessen
spätere Ziele vor, wird es dort als eigener Erwerbsschritt eingefügt. Der
Entscheidungsbericht nennt die kanonischen Voraussetzungen und den bisherigen
und neuen Strukturknoten. Eine spätere Anwendung gehört dagegen nicht allein
deshalb in einen Grundlagenblock, weil sie dessen Ziele benötigt. Der
Normalisierer prüft auch eigene atomare Verbraucher des Themencontainers;
ein Prüfungsaufgaben-Untercontainer darf einen gemeinsam benötigten
Zwischenschritt nicht fälschlich an sich binden. Gemeinsam benötigte Vorbereitung
behält eine konkrete fachliche Gruppe. Vorhandene Themen werden
dadurch nicht zu einem großen Block zusammengefasst; verbleibende echte
Gruppierungszyklen bleiben Fehler.

Die überprüften Schnitte in `math-preparation-topic-repairs.json` verbinden
nur die explizit aufgeführten atomaren Teilmengen. Dazu gehören Grundoperationen,
Variablen und Terme, Bruch-/Dezimaldarstellungen sowie einfache Hyperbeln.
Die Regeln prüfen konkrete Ziele und kanonische Familien; gleiche Titel allein
reichen nicht. Ein anderer geprüfter Schnitt verschiebt nur die spätere
Dezimal-/Bruchdarstellung `2f565855…` zur schon vorhandenen Darstellung rationaler
Zahlen. Die frühe Zahlvorstellung und die übrigen Zahlthemen bleiben getrennt.

Bei der Aufteilung eines kanonischen Jahrgangs bleibt dessen fachliche
`contains`-Hierarchie rekursiv erhalten. Eine alphabetisch sortierte Atomliste
würde echte Fachgruppen und Prüfungsordner verlieren. Alte E-/Q-Programmhüllen
werden innerhalb der neuen Zeitcontainer aufgelöst; ihre konkreten Fachkinder
bleiben erhalten. Wird eine Prüfungsgruppe auf mehrere Erwerbszeitpunkte
verteilt, erhält nur ihre hauptsächliche verbleibende Aufgabengruppe die
`canonicalSourceGoalId` der Sammlung. Die anderen Aufgaben behalten ihre
eigenen Zielreferenzen. Das ersetzt keine Aufgabe und verändert keine Quellrolle.

`math-single-skill-topic-labels.json` benennt konkrete einzelne Lernbereiche
fachlich, etwa „Gradmaß und Bogenmaß“. Das darunterliegende atomare Lernziel
behält seinen vollständigen Titel. Technische Ersatznamen oder die bloße
Wiederholung desselben langen Zieltextes sind keine Themenbezeichnung.

Die Körper-Anwendungen werden im bestehenden Q2-Bereich von den
Vektorgrundlagen getrennt. Keines der zwanzig Körper-Atome ist Voraussetzung
der Vektorgrundlagen; umgekehrt benötigt beispielsweise das Spatprodukt das
Vektorprodukt. Die bestehenden Referenzen und Rollen werden unverändert
verschoben. Bei getrennten Periodik-Referenzen gehört der bestehende Schritt
„Trigonometrische Gleichungen lösen“ zwischen charakteristische Punkte und
periodische Modelle in denselben Themenbereich. Innere Körper-/Ebenenschnitte
bleiben separat zu prüfen.

Technische Titel wie „Lernziele am geprüften Erwerbsort“, „Vorbereitung am
tatsächlichen Bedarf“ und „Bestands-ID“ erscheinen nicht als Lernbereichstitel.
Die historischen Sammelcontainer werden anhand ihres Inhalts fachlich
aufgeteilt oder in ihr bestehendes Thema eingeordnet. Historische
`v3-preserved`-Listenindizes werden durch eine stabile Themenidentität ersetzt;
der gleiche GK-/LK-Themenbereich erhält damit dieselbe Identität vor der
Zusammenführung.

## Mathematik als notwendige Vorbereitung für Physik

Die tatsächliche gemeinsame Backend-Auswahl lieferte 48 Mathematikatome,
deren notwendiger Erwerbsplatz bislang nur in einer Physiksicht angeboten
wurde. `math-foreign-acquisition-demand.json` bindet 1.039 konkrete
Verbrauchsbeziehungen in 69 Mathematiksichten an die aktuellen 63 beteiligten
Physiksichten, die unveränderten kanonischen `requires`-Pfade und den Hash des
tatsächlichen Vorher-Nachweises. Bereits vorhandene Mathematik-Targets werden
dadurch nicht überschrieben.

Der früheste tatsächliche aktuelle Physik-Verbraucher begrenzt den Erwerbsplatz;
ein alter V4-Container ist dafür keine Zeitquelle. Die aktuelle Bindung verwendet
den eingefrorenen Physikstand V31; frühere V14-/V21-Belege bleiben als
Zwischenstände erhalten. Gegenüber V21 ändern sich keine dieser 1.039
Zeitgrenzen. Die bereits zwischen V14 und V21 korrigierten sechzehn Zeitgrenzen
betreffen die kanonische Physik-Sek-II-Zuordnung von E nach Q2. So bleiben die korrigierten
HB-/MV-Induktionsanwendungen im oberen Quellenbereich und ziehen logarithmische
Vorbereitung nicht künstlich nach J8/J9. Vier Bindungen an nicht absolut datierte
Physik-Blöcke enthalten bewusst keinen erfundenen Kalenderjahrgang.

Der gemeinsame Bedarf einschließlich seiner vollständigen kanonischen
Voraussetzungshülle gilt sowohl für die Platzierung als auch für die erklärte
Themenordnung. Ein nur wegen Physik benötigtes Atom erhält eine vollständig
bedingte eigene Fachgruppe. Ohne dieses Atom in autoritativem L verschwindet
diese Gruppe; sie erzeugt dann keine zusätzliche Abschlussbedingung für einen
sonst unabhängigen Mathematikbereich. Die Source-Seeds bleiben unverändert.
Sek-I-Auszüge übernehmen aus der Vollsicht nur solche Erwerbsmarker, die auch
in ihrem eigenen belegten Lernumfang liegen.

In Hessen G8 wird der vorhandene Laplace-Vergleich `5a2371fd…` von 5G.1 nach
6G.3 verlegt: Die erhaltene G8-Quelle nennt dort einstufige Zufallsversuche und
die Laplace-Formel (`he-math-seki-g8-6g-3-01-9324ceeb`). Die schon in 5G.1
belegten Anzahlen und Häufigkeiten bleiben dort. Die Zielrolle des verschobenen
Atoms bleibt unverändert. Für G8 wird kein zusätzlicher Sek-I-Jahrgang 10 aus
einem kanonischen Vorbereitungshinweis rekonstruiert. Ein früher benötigtes
Atom erhält seinen belegten früheren Erwerbsplatz, sonst beginnt diese
Vorbereitung in der E-Phase.

Ein Einzelstufenauszug mit vorbereitender Sek I und eigentlicher Sek II erhält
einen gemeinsamen Mathematik-Wurzelknoten mit erklärter Folge I → II. Damit
bleibt die Stufenfolge auch dann eindeutig, wenn die vorbereitende Stufe erst
durch das autoritative Personal Curriculum sichtbar wird.

Die neutralen HE-Basisansichten verschieben sechs bereits vorhandene
Target-Vorbereitungen zu ihren tatsächlich früheren kanonischen Verbrauchern;
ihre Rollen bleiben erhalten. Die graphische Ableitungsaufgabe `632a3837…`
gehört dagegen mit ihrer Vorbereitung `5518ceb3…` nach E.2, nach dem
Ableitungsbegriff `7156558c…`. Das KC2024 benennt graphisches Ableiten dort
auf S.32. Die frühere kanonische J10-Aufgabensammlung bleibt als Herkunft
referenziert; sie ist kein amtlicher HE-J10-Beleg. Der Ableitungsbegriff wird
deshalb nicht künstlich nach J10 vorgezogen.

## Reproduktion und Prüfung

`scripts/normalize_mathematics_stage_views.py --write` normalisiert die 100
Mathematik-Sichten. `--check` prüft den Normalzustand. `--report PATH` schreibt
die gebundenen Quellen, die Zuordnungsgründe und die früheren Lernplätze.
`--check` scheitert auch bei jedem ungelösten Zeitfenster und jedem
Gruppierungskonflikt. Derselbe vollständige 100-Sichten-Test ist Teil der
Regression; Idempotenz allein genügt nicht.

Die ursprüngliche 88-Sichten-Authority ist im Manifest
`math-stage-view-authority.manifest.json` mit Roh- und Inhalts-Hashes definiert.
Sie schließt die zu Arbeitsbeginn bereits akzeptierten kanonischen
Ansichtsänderungen ein. Gespeichert werden nur die 70 echten Basisansichten:
64 in `math-stage-view-authority.json`, sechs bereits in der Duration-Policy.
Die 18 Dauer-Ausgaben werden nicht als neue Eingabe kopiert. Die zwölf neuen
Landes-Sek-I-Auszüge entstehen aus ihrer separaten Mitgliedschaftspolicy.
Amtliche Lehrplanquellen werden dafür weder kopiert noch geändert.

`--from-authority` baut die 70 Basisansichten vollständig neu auf. Danach
erzeugen der Durationgenerator und der Sek-I-Generator die übrigen 30 Sichten.
Alle drei unterstützen eine Ausgabedirektorie, sodass ein vollständiger
Kandidat geprüft werden kann, bevor die produktiven Ansichtsdateien ersetzt
werden. Der Normalisierer rekonstruiert bekannte Basisansichten auch beim
Vergleich aus ihren geschützten Originaleingaben; eine alte normalisierte
Baumstruktur kann eine korrigierte Quellplatzierung deshalb nicht konservieren.

Die unabhängig geprüften Referenzschnitte und fachlichen Obergruppen stehen in
`math-reviewed-topic-reference-cuts.json` und
`math-reviewed-topic-hierarchy.json`. Die Obergruppen binden konkrete vorhandene
Einheiten-IDs; ihre Erzeugung ordnet nicht anhand ähnlicher Titel zu. Die
ursprünglichen Unterthemen und Referenzobjekte bleiben erhalten. Der gemeinsame
Normalisierer wird auch nach der atomaren Rollenprojektion der zwölf neuen
Sek-I-Auszüge ausgeführt, damit kein verkürzter zweiter Reparaturpfad entsteht.

`check_mathematics_course_view_pairs.py` prüft alle 40 GK-/LK-Paare auf gemeinsame
Identitäten, Elternpfade, Metadaten und azyklische Vereinigungen der erklärten
Ordnung. Gegenfälle für Metadatenabweichungen und erst bei der Vereinigung
entstehende Zyklen sind Teil der Regression. Der anschließende echte Java-Merger
und die Backend-/Kartenmessung bleiben eigenständige Abnahmeprüfungen.

Der Durationgenerator verwendet sechs explizit erhaltene Authoring-Eingaben in
`math-duration-stage-placement-policy.json`; er liest dafür nicht seine eigenen
normalisierten Ausgaben als neue Eingabe. Nach der bestehenden geprüften
Duration-Replay-Pipeline wendet er denselben Normalisierer auf alle 18 Ausgaben
an. Die Regression prüft auch die Gleichheit der sechs normalisierten
Authoring-Eingaben mit ihren aktuellen Vollsichten.

Gezielte Prüfungen:

```sh
python3 -B scripts/test_mathematics_stage_views.py
python3 -B scripts/test_mathematics_seki_excerpts.py
python3 -B scripts/normalize_mathematics_stage_views.py --check
python3 -B scripts/generate_mathematics_seki_excerpts.py --check
python3 -B scripts/check_mathematics_course_view_pairs.py
python3 -B scripts/test_mathematics_course_view_pairs.py
cd app
npx tsx scripts/generateMathDurationCompositionViews.ts --check
npx tsx scripts/testMathematicsStageViewConsumers.ts
```

Compiler-, Schema- und Rollenprüfungen ersetzen die tatsächliche Backend- und
Kartenmessung nicht. Reale Gruppierungszyklen bleiben fachliche Arbeitsfälle;
das Entfernen einer künstlichen Themenkette erklärt sie nicht für behoben.

Die zusätzliche Bremen-Zeitprüfung bindet die unveränderten Primär- und
Mappingdateien in `math-bremen-current-stage-placements.json`. Die aktuelle
Jahrgangsstufe 9 umfasst die belegten Körper-/Kugel- und Zählthemen; die
Simulations- und Cavalieri-Aufgaben bleiben ausdrücklich eigene passende
Operationalisierungen. Periodische Funktionsmodelle, Bogenmaß und alte
Analysisinhalte erhalten dadurch keine amtliche J9-Zuordnung. Sie bleiben
bei unveränderter Zielmitgliedschaft in der Oberstufe bzw. an ihrem konkret
belegten früheren Erwerbsbedarf. Ein eigener Sek-I-J10-Kasten entfällt.

Für Niedersachsen werden vier zuvor nur als neue Mapping-Ergänzung aufgenommene
Ableitungsziele aus der neuen Sek-I-Zielmenge ausgeschlossen. Die
[Primärquelle](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/input/NI/lower-secondary/ma_gym_si_kc_druck.pdf)
ordnet Ableitung und Integral auf der gedruckten S. 36 ausdrücklich dem
Sekundarbereich II zu. Der einschlägige untere Abschnitt beschreibt auf S. 51
die konstante Steigung linearer Funktionen. Seine vorhandene Zuordnung zum
breiten kanonischen Ableitungscluster begründet keine zusätzliche Aufnahme von
Ableitungsbegriff, Ableitungsregeln, Ableitungen trigonometrischer Funktionen oder
Monotonie-/Extremwertuntersuchungen mit Ableitungen. Die erhaltene Extraktion
nennt für diese Passage S. 50; diese Abweichung zur gedruckten S. 51 bleibt in
der Ausnahmepolicy sichtbar. Extraktion, Mapping, ursprüngliches
Ergänzungsinventar und sämtliche CrossStage-Targets bleiben unverändert.

Dasselbe enge Muster betrifft je ein neues Monotonie-/Extremwertziel in den
Sek-I-Auszügen von Saarland, Sachsen und Thüringen. Die jeweiligen Primärstellen
behandeln konstante lineare Änderungsraten (Saarland, gedruckte S. 28), anschauliche
Folgen und Grenzwerte (Sachsen, gedruckte S. 30, PDF-Seite 42) beziehungsweise
anschauliche Grenzwerte und Graphenverhalten (Thüringen, Abschnitt 2.3.2, S. 28).
Sie begründen keine zusätzliche Untersuchung mit der ersten Ableitung.
Ausgeschlossen wird deshalb jeweils nur diese neue Mapping-Ergänzung. Bereits
im ursprünglichen unteren Quellbaum enthaltene Ziele und alle CrossStage-Rollen
bleiben erhalten. Die Policy pinnt die drei unveränderten Primärdateien und
führt die ursprünglichen Mappingzeugen weiter auf.
