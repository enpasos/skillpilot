# Halbleiter und Dioden: elementarer Zugang und vertieftes Modell

> Historischer Erststand: Diese Belege beschreiben die erste Lieferung vor den
> unabhängigen Fachreviews. Der aktuelle Autorierungsstand, erneuerte Aufgaben,
> korrigierte Bilder und frische Eingabepins stehen unter
> [post-corrected-independent-review-v3](post-corrected-independent-review-v3/README.md).
> Die anschließende vollständige Quellenprüfung und ihre begrenzte BY-Korrektur
> stehen unter [source-coverage-followup-v4](source-coverage-followup-v4/README.md).
> Die danach gefundene und korrigierte Quellenvererbung sowie die tatsächlich
> kompilierten Geltungsbereiche stehen unter
> [applicability-followup-v5](applicability-followup-v5/README.md).
> Die zweite Autorierungsphase bleibt unter `post-independent-review-v2` erhalten. Der unten
> protokollierte Motivationsbefund wurde durch die begründete Wiederherstellung
> des typisierten Einstiegsvertrags behoben; er ist kein aktueller Gatebefund.

15. November 2026. Begrenzte fachliche K1-Lieferung zum Stufen-Handover aus
PR #156. Ausgangspunkt ist der kanonische Datenstand von `96035c60b1`;
die anschließende Zusammenführung des Handover-Dokuments änderte diesen
Datenstand nicht. [before.json](before.json) ist die vor jeder Mutation
tatsächlich erzeugte Diagnose. [after.json](after.json) wird aus dem aktuellen
Katalog erzeugt und enthält den Vergleich. Beide sind begrenzte Diagnosen,
keine Quellenfreigabe und kein vollständiges Stufen-Gate. Insbesondere liest
sie verfasste Sichtenrollen und keine nach Lernerkonfiguration abgeschlossene
Personal-Curriculum-Projektion.

## Fachliche Entscheidung und Belege

Ein einfacher Ladungsträgerzugang, das funktionale Verhalten eines Bauteils,
die eigene experimentelle Untersuchung und ein energetisches Bändermodell
sind verschiedene Kompetenzen. Man kann eine vorgegebene Kennlinie deuten
oder eine Kennlinie aufnehmen, bevor man den inneren p-n-Übergang erklärt.
Eine mögliche Unterrichtsreihenfolge wird deshalb nicht pauschal zur
notwendigen Voraussetzung aller anderen Wege.

- Der amtliche [bayerische LehrplanPLUS, Physik 10, Profilbereich NTG 5.1](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/physik)
  führt eigene Bauteilexperimente, die Interpretation der Diodenkennlinie und
  einfache Erklärungsmodelle. Er schreibt dort kein Bändermodell vor. Das
  rechtfertigt den begrenzten elementaren Modellweg, keine Aussage über alle
  Schulprofile oder alle Länder.
- Die amtliche [Fortbildung Baden-Württemberg, IMP, Unterrichtsgang Diode](https://lehrerfortbildung-bw.de/u_matnatech/imp/gym/bp2016/fb2/p01_eui/1_hintergrund/2_gang/4_diode/)
  lässt die Lernenden in Stunde 13/14 Polung und Kennlinie untersuchen,
  behandelt in Stunde 15 die Gleichrichtung und in Stunde 16 die Erklärung.
  Das ist ein konkretes Gegenbeispiel zur zwingenden Reihenfolge
  Bändermodell → p-n-Erklärung → Experiment. Es ist ein Unterrichtsvorschlag,
  kein Wirkungsnachweis und keine allgemeine Verpflichtung. Die dort
  beschriebene didaktische Nullstrom-/Schwellspannungsnäherung wird nicht als
  exakte Eigenschaft jeder realen Diode übernommen.
- García-Carmona und Criado begründen in ihrem
  [Originalbeitrag von 2011](https://ensciencias.uab.cat/article/view/v29-n1-garcia-criado)
  einen elementaren Zugang für das Alter 14–16 und untersuchen typische
  Verständnisprobleme. Der [offene Originaltext](https://ensciencias.uab.cat/article/download/v29-n1-garcia-criado/71-pdf-es)
  nennt insbesondere die Verwechslung von Löchern mit Protonen, von
  Dotieratomen mit Ladungsträgern und von n-/p-Typ mit einer Nettoladung des
  ganzen Kristalls. Diese Unterscheidungen tragen Ziel, Bild und Aufgabe.
- Die frühere kleine Untersuchung der Autoren von
  [2009](https://doi.org/10.1080/09500690802272074) untersucht laut tatsächlich gelesenem Verlagsabstract eine Pilotgruppe von
  60 Lernenden im Alter 14–15 an einer Schule in Sevilla. Das ist begrenzte
  empirische Evidenz zur möglichen Einführung elementarer Begriffe und kein
  allgemeiner Nachweis einer optimalen Sequenz. Der Verlagsvolltext war nicht
  zugänglich. Weder diese Arbeit noch die beschriebenen Lehrpläne belegen eine
  Wirksamkeit von SkillPilot.

Zusätzlich wurden die erhaltenen amtlichen Original-PDFs von Saarland
(Klasse 9 NW, S. 27–28), Sachsen (Klasse 8/9, PDF-S. 32/34) und
Schleswig-Holstein (2022, gedruckte S. 25 / PDF-S. 27) tatsächlich gelesen.
Sachsen trennt elementare Leitungsmechanismen von späteren Bändermodellen;
Saarland führt Elektronen-/Löcherleitung, Dotierung, p-n-Modell, Kennlinie und
Gleichrichtung in der Sekundarstufe I. Schleswig-Holstein erwartet bei den
empfohlenen LED-Schaltungen ausdrücklich keine Erklärung des Diodeninneren.
Die Grenze zwischen Funktionsmodell und innerer Erklärung bleibt erhalten.

## Konkrete Ziele und Voraussetzungen

| Ziel | Ergebnis |
| --- | --- |
| `df010b2b` Bändermodell und Dotierung | Vollständiges bestehendes Zielobjekt unverändert. Vorhandene gespeicherte Beherrschung wird nicht auf eine verkürzte neue Bedeutung umgedeutet. Es bleibt der vertiefte qualitative energetische Modellweg. |
| `9f265f49` Dotierung im einfachen Ladungsträgermodell | Neues Atom: am vorgegebenen Silizium-Bindungsmodell mobile Elektronen/Löcher, ortsfeste Dotierionen und insgesamt neutrales Material erklären. Vorwissen: Materialklassifikation und einfache Ladungsphänomene. |
| `dc55adac` Funktionales Diodenverhalten | Neues Atom: eine vorgegebene qualitative Kennlinie und beide Polungen im Schaltplan deuten. Vorwissen: Schaltplanverständnis und Achsen/Skalen/Einheiten. Keine Voraussetzung einer eigenen Diodenmessung oder eines p-n-Modells. |
| `2084b7d4` p-n-Sperrschicht erklären | Benötigt das elementare Trägermodell. Die energetische Bandbeschreibung ist dafür nicht verpflichtend. Zieltext und vorhandenes Bild bleiben erhalten. |
| `3857891b` Kennlinie experimentell bestimmen | Benötigt echte Strom-/Spannungsmesskompetenz und Diagrammverständnis. Die eigene sichere Durchführung und Originalmessung bleiben Bestandteil des Nachweises. Eine vorherige mikroskopische Erklärung entfällt. |
| `3b586f2a` Gleichrichter erklären | Benötigt funktionales Diodenverhalten und die Unterscheidung von Gleich-/Wechselspannung nach Polarität und Zeitverlauf. |
| `4a42cddd` Gleich-/Wechselspannung einordnen | Das unveränderte begriffliche Ziel benötigt das Lesen von Diagrammen und den typisierten Physik-Einstiegsmarker. Eine vorherige apparative Messleistung ist dafür keine notwendige Voraussetzung. |
| `7badac4d` Materialklassifikation | Der unveränderte qualitative Vergleich verlangt keine negativen Exponenten und keine Mathematik-Orientierung. Diese beiden Kanten entfallen; der Physik-Einstiegsmarker bleibt erhalten. |

Eine unabhängige Prüfung des Modellvertrags hat die ursprüngliche Entfernung
aller Orientierungsbezüge korrigiert: Der bestehende Vertrag verlangt einen
abgeschlossenen motivierenden Einstieg als eigenen Zieltyp und direkt atomare
Orientierungs-/Terminalrouten. Deshalb tragen die beiden Ziele den
Physik-Orientierungsanker `5c44b9ba` direkt. Er vermittelt und bescheinigt kein
Rechen-, Mess- oder Physikwissen. Die fachlichen Voraussetzungen bleiben von
diesem typisierten Einstiegsmarker getrennt. Das neue `after` für Einheiten
hat diesen besonderen Abschlussvertrag nicht aufgehoben. CQR/GVR-Regeln und
geschützte Reifegrade werden für diese Korrektur nicht abgeschwächt.

Das erste vorgeschlagene Ladungsträger-Vorwissen war noch zu stark:
`dc7dd287` zog über rationale Addition zwanzig weitere Mathematikziele hinein.
Die tatsächliche Kontextableitung hat das sichtbar gemacht. Statt dieses
Apparat-/Recheninventar als Stellvertreterwissen zu verlangen, sichert das
neue Ziel einfache Ladungsvorzeichen und qualitative Wechselwirkung und
entwickelt seine spezifische neutrale Träger-/Ionenbilanz selbst. Die
bestehenden anderen Elektrostatikziele werden dadurch nicht umgeschrieben.

## Aufgaben und Bilder

`a8d99168` prüft beide Dotierungsfälle an einem ausdrücklich vorgegebenen
Bindungsmodell sowie den Transfer auf falsche Vorstellungen von Löchern und
Ionenbewegung. `8670cff6` liefert ein tatsächliches
[Schaltplan-/Kennlinienmaterial](../../../visualizations/physik/8670cff6-fe9c-5f7e-8cba-d170134965a6/8670cff6-fe9c-5f7e-8cba-d170134965a6.png),
explizite Bezugsrichtungen und drei beschriftete Datenpunkte. Die Aufgaben
verlangen keine angeblich selbst durchgeführte Messung.

Beide Aufgaben haben eine gewöhnliche analytische Bewertung mit drei
4-Punkte-Blöcken und Bestehen ab 9 von 12 Punkten. Die beiden Dotierungs-
beziehungsweise Polungsfälle erhalten je einen eigenen Block. Wer einen
Fall vollständig auslässt, erreicht höchstens 8 Punkte; es gibt keine
versteckte Alles-oder-nichts-Regel. DE/EN-Aufträge, Lösungen und Punktevergabe
wurden tatsächlich unabhängig maschinell gelesen, das separate
Kennlinienmaterial tatsächlich betrachtet. Der genaue Beleg steht in
[assessment-review.json](assessment-review.json). `released` ist die
Inhaltsfreigabe dieser maschinell geprüften Aufgabe, keine menschliche
Abnahme und keine beobachtete Lernendenleistung.

Die alte Bandmodellaufgabe `1abfd5ef` behält ID und vollständigen
Aufgaben-/Lösungs-/Bewertungskörper. Ihre irreführende Sek-I-Marke wird zur
Sek-II-Einordnung korrigiert; ihr Zielpfad bleibt im oberen Übungsbereich.
Die zwei alten, an den eingefrorenen Reduktionsbeleg gebundenen Aufgaben
werden nicht verändert.

Die beiden neuen Lernzielbilder sind eigene editierbare SVGs, präzise als
PNG gerendert. Die enge native Vektorausführung ist hier durch exakte
Ion-/Trägervorzeichen, Neutralitätsbilanz, Schaltverbindungen und Kurvenachsen
begründet. Es wurde kein Raster fremd bearbeitet und kein angeblicher
Bildanbieteraufruf protokolliert. Bestehende Bilder bleiben bytegleich.
Nach tatsächlicher Prüfung bei kleiner Bildschirmbreite wurden die neuen
Bilder vereinfacht und vertikal angeordnet. Eine Abbildung ist Orientierung,
kein Kompetenznachweis. Eigenständige V- und Bild/P-Reviews bleiben in der
separaten aktuellen QA-Spur.

## Quellenrollen und Stufen

[source-decisions.json](source-decisions.json) bindet 32 begrenzte Korrekturen
in vier Mapping-Artefakten. Nur die falsche Zuordnung zum fortgeschrittenen
Bandziel und zum gesamten Festkörper-Teilbaum wird aus den betroffenen
Sek-I-Passagen entfernt. Ein neues elementares Ziel wird nur dort ergänzt,
wo die konkrete Passage seinen Teilinhalt trägt. Ein Bauteilname, eine
Berufsrecherche oder ein Temperatureffekt wird dadurch nicht zu einer
vollständigen Dotierungs- oder Bandmodellkompetenz. Andere bestehende
Mappinganteile sind außerhalb dieses begrenzten Korrekturumfangs.

Die erhaltenen Source-Extraction-Eingaben werden nicht bearbeitet. Ihre
Roh-Hashes und die tatsächlich gelesenen einzelnen Source-Ziele stehen im
Beleg. Das aktive Generatoroverlay reproduziert genau diese Entscheidungen;
der fokussierte Test prüft jede primitive Mappingkante, alle 32 Zeugen,
Byteidentität und das unveränderte Verhalten für fremde Quellen.

Die neuen Atome sind bundesweit wiederverwendbare Kompetenzen.
`applicability` ist dabei keine Behauptung, jeder Landeslehrplan fordere sie.
Die expliziten elementaren Targets der Sichten folgen den begrenzten Quellen
in BY, BW, SL und SN. Bei BY bleiben NTG und bei SL der NW-Zweig als
Quellenbegrenzung erhalten. Die bereits belegte p-n-Matrix für ST/TH und die
Oberstufenanteile von HE/RP/TH bleiben eigenständig. Wo nur eine spätere
Aufgabe den Stoff benötigt, steht er als Oberstufenvorbereitung; eine
hartcodierte Sek-I-Rolle für acht weitere Länder ist kein Quellenbeleg.

Für ST/TH kann derselbe Klassifikationsstoff nach den bisherigen Sichten
weiter als oberes Target und früher als Vorbereitung auftreten. Die
getrennte Aussage „im Landesplan geführt“ und „als notwendige Vorbereitung
früher gelernt“ braucht den neuen Planvertrag. Diese Lieferung behauptet
keine vollständige Auflösung aller solchen Stufenrückgriffe. Die tatsächliche
Diagnose und der umfassendere F6-/Planvertrag haben getrennte Umfänge.

## Prüfumfang

Die hier enthaltenen Vorher-/Nachherdaten, einzelne Compiler-/Projektions-
läufe und maschinellen Inhaltsreviews sind lokale Evidenz. Vollständige
D/P/A/M/V-Aktivierung, geschützte Maturity-Floors, die abschließende gesamte
CI und terminal erfolgreiche Main-CI werden vom integrierenden Lauf
getrennt belegt. Ein unvollständiger Zwischenlauf wird nicht als Abschluss
oder Lernwirksamkeit ausgegeben. Die V9-Registry, ihr Parent und gespeicherte
Lernendenergebnisse bleiben unverändert.

Der konkrete lokale Zwischenbefund steht in
[local-preintegration-validation.json](local-preintegration-validation.json):
70 native Sichtkompilationen und alle 32 Quellentscheidungen mit ihren
70 Wiederherstellungspfaden bestehen. Die tatsächliche Prüfung aller
69 Lernendenbäume erreicht 3.246 obere Übungsplatzierungen. Ihre abschließende
CQR-104-Prüfung meldet weiterhin 120 fehlende Motivationsrouten für vier
Ziele, nachdem sachlich nicht notwendige `requires` entfernt wurden.
Es fehlen dabei keine terminalen Prüfungswege, Prerequisiten oder
Materialabdeckungen. Dieser Modellkonflikt zwischen Motivation und harter
Voraussetzung ist ein offener Integrationsbefund; er wird ausdrücklich nicht
durch Wiederherstellung fachlich falscher Kanten überdeckt.
