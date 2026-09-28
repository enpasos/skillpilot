# Bedingter Aufgabenanschluss für die Bildstimuli A1 und A2

Stand: 27. September 2026. Dies ist ein **nichtkanonischer Text- und
Bewertungsentwurf** zu den zwei Prompts in
`tmp/math-m7-image-prompts-2026-09-27/PLANNED_ASSESSMENT_STIMULI.md`.
Die Ziel-PNGs sind derzeit nicht vorhanden. Das Bild muss jeweils tatsächlich
als Prüfungsstimulus ausgegeben werden; weder Prompt noch Sollkoordinaten in
diesem Dokument sind eine Schülerabbildung oder eine Deckungsfreigabe.
`TASKS.md`, `candidate-routes.json`, die zwei `coverageReviewHolds`, alle
kanonischen Prüfungen und Statusdateien bleiben unverändert.

## A1 · Vorgegebene 3D-Darstellung lesen

Geplanter Stimulus:
`images/planned-assessment-stimuli/q2-075f1ef2-3d-ablesen.png`.
Anschluss an `q2-coordinates-vectors-metric`, als neuer Teil 6 zusätzlich zu
den fünf heutigen Teilen. Die Abbildung darf P und Q sowie den von P nach Q
gerichteten Pfeil `v` zeigen, aber keine Koordinatentupel oder Lösung.

### Vorgeschlagener Wortlaut für Lernende (8 BE)

> **6. Lesen aus einer vorgegebenen Raumdarstellung (8 BE).** Entnehmen Sie
> Abbildung A1 die Koordinaten der Punkte P und Q und notieren Sie beide als
> Dreiertupel. Bestimmen Sie die Komponenten des eingezeichneten, von P nach Q
> gerichteten Pfeils `v`; zeigen Sie Ihre Punktdifferenz. Erklären Sie, warum
> `v` eine Verschiebung beschreibt und nicht selbst die Lage eines Punkts
> angibt.

### Erwartete Antwort und Rubrik

- `P=(2|1|3)` (2 BE): drei richtige Koordinaten 2, ein oder zwei richtige 1,
  keine richtige 0. Die Punkte sollen **aus der gelieferten Abbildung**
  abgelesen werden; eine selbst gezeichnete Skizze aus den Sollwerten ist
  dafür keine Ersatzleistung.
- `Q=(1|3|1)` (2 BE): dieselbe Teilpunktregel.
- `v=Q−P=(1−2|3−1|1−3)=(−1|2|−2)` (2 BE): 1 BE für die richtige
  Richtung `Q−P`, 1 BE für die dazu richtig berechneten drei Komponenten.
  Bei einem Ablesefehler in P oder Q die rechnerisch konsistente Subtraktion
  als Folgefehler anerkennen; die Ablesepunkte selbst bleiben getrennt
  bewertet.
- Deutung (2 BE): 1 BE für „P und Q bezeichnen Orte, `v` die gerichtete
  Verschiebung von P nach Q“; 1 BE dafür, dass derselbe freie
  Verschiebungsvektor auch an einem anderen Startpunkt angelegt werden
  könnte und deshalb ohne gewählten Startpunkt kein Punkt ist. `v` ist weder
  der Ortsvektor von Q noch das Tupel der Punktkoordinaten von P.

Falls der Stimulus fachlich und visuell bestätigt wird und der Teil **als
zusätzlicher** Teil integriert wird, ergäbe die reine BE-Rechnung aus den
heutigen `[4,4,4,4,4]` die vorläufigen `stepPoints: [4,4,4,4,4,8]`
und `maxPoints: 28`. Das ist kein freigegebener
`passingPoints`-Wert oder geänderter Assessment-Datensatz.

### Vor dem Einsatz zu halten

Die tatsächlichen Pixel müssen alle sechs Koordinaten aus konsistenten
Achsen, Einheitsmarken und Hilfslinien **eindeutig ablesbar** machen. Die
vorgegebene axonometrische Projektion ist als 2D-Abbildung allein nicht
injektiv; gerade deshalb sind eindeutige 3D-Raster-/Projektionshilfen
entscheidend. Pfeilanfang P, Pfeilspitze Q, Achsenorientierung, Punktlagen
und `Q−P` getrennt kontrollieren. Kein Koordinatentupel oder die Antwort darf
im Bild, seiner sichtbaren Beschriftung oder einer Schüler-Altbeschreibung
vorweggenommen werden. Für einen barrierearmen gleichwertigen Zugang braucht
es eine fachlich geprüfte Darbietung, die die Ableseleistung erhält.

Das Ziel `075f1ef2-6860-4b20-9df2-878157eb395e` umfasst **Eintragen,
Ablesen und Deuten**. Der heutige Teil 1 prüft selbstständiges Eintragen;
erst ein korrektes A1 könnte die fehlende vorgegebene Ablesesituation
ergänzen. Die Aufnahme als `coveredGoalId` bleibt dennoch unter dem
bestehenden Hold bis zur unabhängigen Prüfung der gesamten benoteten
Leistung. Der heutige Projektionsaudit findet nur 7 von 32 deklarierten
GK-/LK-Sichten für alle sechs Ziele der Kandidatenaufgabe gemeinsam; weder
dieses Bild noch eine bloße Einschränkung auf sieben Sichten repariert die
fehlenden lokalen Wege der übrigen Sichten.

## A2 · Sechs Körper in vorgegebenen Raumansichten erkennen

Geplanter Stimulus:
`images/planned-assessment-stimuli/q2-d379e28b-sechs-koerper.png`.
Anschluss an `q2-cuboid-spatial-representations`, als neuer Teil 6 zusätzlich
zu den fünf heutigen Teilen. In der Schülerfassung tragen die sechs Karten
nur A–F und für die Geometrie notwendige neutrale Maße/Markierungen. Die
folgenden Körpernamen und Koordinaten bleiben ausschließlich im
Lösungsschlüssel.

### Vorgeschlagener Wortlaut für Lernende (12 BE)

> **6. Körper aus vorgegebenen Raumansichten identifizieren (12 BE).**
> Benennen Sie für jede Karte A–F in Abbildung A2 die Körperart möglichst
> genau. Begründen Sie anschließend jeweils mit **sichtbaren** Kanten,
> Kantenlängen oder Lotfußpunkten, worin sich A und B, C und D sowie E und F
> unterscheiden. Unterscheiden Sie bei C/D und E/F die
> senkrechte Körperhöhe von einer schiefen Seiten- oder Verbindungskante.

### Erwartete Antwort und Rubrik

| Karte | Lösung für Prüfende | Geometrischer Kontrollpunkt |
| --- | --- | --- |
| A | Würfel | Drei Kantenrichtungen mit gleicher Länge 2; 2×2×2. |
| B | Nicht würfelförmiger Quader | Drei Kantenlängen 4, 3, 2; rechteckige Flächen, aber nicht alle Kanten gleich. |
| C | Gerades Dreiecksprisma | Dreieck in `z=0`; Deckdreieck um `(0|0|2)` verschoben, Verbindungsseitenkanten senkrecht, Höhe 2. |
| D | Schiefes Dreiecksprisma | Dasselbe Grunddreieck; Deckdreieck um `(1|0|2)` verschoben, Kantenvektor `(1|0|2)` nicht senkrecht, Höhe dennoch 2. |
| E | Gerade quadratische Pyramide | Quadrat 4×4; Spitze `(2|2|3)` lotrecht über dem Grundflächenmittelpunkt `(2|2|0)`, Höhe 3. |
| F | Schiefe quadratische Pyramide | Gleiches Quadrat; Spitze `(3|2|3)` lotrecht über `(3|2|0)`, um 1 in x vom Mittelpunkt versetzt, Höhe 3. |

Die **sechs richtigen Namen** ergeben je 1 BE (6 BE). Für jede der drei
Paarbegründungen gibt es 2 BE (weitere 6 BE): A/B: 1 für die gemeinsame
Quader-/Rechtwinkligkeit, 1 für gleiche gegenüber unterschiedlichen
Kantenlängen; C/D: 1 für kongruente parallele Dreiecke, 1 für senkrechte
gegenüber schrägen Verbindungsseitenkanten bei **gleicher Lot-Höhe 2**;
E/F: 1 für gemeinsame Quadratgrundfläche und Lot-Höhe 3, 1 für den
Lotfußpunkt im Mittelpunkt gegenüber dem um 1 verschobenen Lotfußpunkt.
Eine bloße Wiederholung der Körpernamen ohne bildbezogene Begründung
erhält die Begründungspunkte nicht. „Schief“ meint bei D und F **nicht**
eine andere senkrechte Höhe.

Falls der Stimulus fachlich und visuell bestätigt wird und der Teil **als
zusätzlicher** Teil integriert wird, ergäbe die reine BE-Rechnung aus den
heutigen `[4,6,6,14,5]` die vorläufigen `stepPoints: [4,6,6,14,5,12]`
und `maxPoints: 47`. Die bisherigen 14 BE von Teil 4
prüfen Koordinatenmodelle und eigene Skizzen; die 12 neuen BE würden das
eigenständige Erkennen aus **bereitgestellten** Raumansichten bewerten.
Eine spätere ersetzende statt ergänzende Fassung müsste ihre gesamte
Rubrik und die Summen neu aufstellen.

### Vor dem Einsatz zu halten

Die echte Abbildung muss genau sechs unbenannte, geometrisch richtige
Körperkarten zeigen. A hat tatsächlich drei gleiche Kantenlängen; B
sichtbar 4/3/2. C und D haben dasselbe 3–4–5-Grunddreieck. C hat vertikale
Verbindungskanten `(0|0|2)`, D parallele schräge Kanten `(1|0|2)`;
Deckdreiecke bleiben jeweils kongruent und parallel zur Grundfläche. E und
F haben dasselbe 4×4-Grundquadrat; bei E trifft das Spitzenlot den
Mittelpunkt, bei F den Punkt `(3|2|0)`. Verdeckte Kanten, Lotmarken und
Perspektive müssen auch vergrößert auf einem kleinen Bildschirm eine
unabhängige Identifikation erlauben. Die Lehrenden prüfen die tatsächlichen
Pixel gegen die private Kontrollmatrix, nicht nur den Generierungsprompt.
Falls die KI eine Form oder Projektion verfälscht, das Bild verwerfen und
koordinatengenau neu zeichnen.

Das Ziel `d379e28b-d9d5-5cab-b383-318e0499c0c7` verlangt fachsprachliches
Beschreiben **und** Identifizieren in Raumdarstellungen. Teil 4 des
heutigen Entwurfs leitet fünf Zusatzkörper aus Koordinatenmodellen und
eigenen Skizzen ab. Erst A2 könnte die unabhängige vorgegebene Bildansicht
ergänzen. Der heutige Projektionsaudit findet zwar 32/32 gemeinsame
Sichten für die vier Ziele der Kandidatenaufgabe; dies ist nur ein
notwendiger Scope-Check, keine Abdeckungs- oder Prüfungsfreigabe.

## Gemeinsame Integrationssperren

1. Beide PNGs sind erst nach Erzeugung und unabhängiger Sichtprüfung echte
   Stimuli. Die genaue Bildversion/der Hash, lesbare Prüfungsdarstellung,
   fachliche Projektion und ein nicht lösungsverratender barrierearmer
   Zugang müssen gebunden sein. Wird ein Bild nicht zuverlässig an den
   Lernenden ausgeliefert, kann der betreffende Teil weder bewertet noch
   als Coverage-Evidenz gezählt werden.
2. Aufgabenstellung, `taskContent`, `solutionContent`, Rubrik,
   `scoring.steps`, `maxPoints` und ggf. `passingPoints` müssen für eine
   gewählte **zusätzliche oder ersetzende** Fassung gemeinsam konsistent
   gemacht werden. Die hier genannten 28/47 BE sind lediglich die Summen
   der zusätzlichen Entwurfsvarianten. `requires` und `coveredGoalIds`
   sind danach je tatsächlicher Leistung und fairer Eingangsvoraussetzung
   **getrennt** zu prüfen; die zwei `coverageReviewHolds` bleiben jetzt
   bestehen.
3. Die Gesamtroute braucht unabhängigen Mathematik-/Didaktikreview,
   GK-/LK- und Bundeslandprojektion, faire Geräte-/Upload- und
   barrierearme Zugänge, einen realen Q2-Terminalpfad und neue
   GoalBook-/QA-/D-/P-/M7-Fingerprint-Checks. Dieses Textdokument ändert
   keinen bereits freigegebenen oder veröffentlichten Prüfungsstand.
