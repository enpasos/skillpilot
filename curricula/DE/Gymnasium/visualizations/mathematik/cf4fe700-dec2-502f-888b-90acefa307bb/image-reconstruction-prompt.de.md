# Bildrekonstruktionsprompt: Informationen aus Darstellungen entnehmen

## SkillPilot-Ziel

- SkillPilot-ID: `cf4fe700-dec2-502f-888b-90acefa307bb`
- Titel: Informationen aus Darstellungen entnehmen
- Beschreibung: Die lernende Person kann aus einer Darstellung relevante Informationen entnehmen (z. B. Nullstellen, Steigungen, Schnittpunkte) und in Worten oder Symbolen formulieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Quellbild: `cf4fe700-dec2-502f-888b-90acefa307bb.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein didaktisches Diagramm auf einem hellbeigen Hintergrund, das die Analyse eines Graphen darstellt. Oben mittig steht der fette schwarze Titel "Informationen aus einem Graphen ablesen".

Auf der linken Seite befindet sich ein Koordinatensystem mit einer hellgrauen Gitterstruktur. Die schwarze x-Achse ist horizontal mit einem Pfeil nach rechts und dem Label 'x'. Die schwarze y-Achse ist vertikal mit einem Pfeil nach oben und dem Label 'y'. Der Ursprung ist mit "0" beschriftet. Die x-Achse hat schwarze Markierungen bei "0", "1", "2", "3". Die y-Achse hat schwarze Markierungen bei "0", "1", "2", "3", "4", "5", "6".

Eine dicke blaue Linie verläuft durch das Koordinatensystem. Sie beginnt am Punkt (0|1) auf der y-Achse und steigt bis zum Punkt (2|5). Beide Punkte sind mit kleinen blauen Kreisen auf der Linie markiert.
Oberhalb des Koordinatensystems, leicht rechts der y-Achse, steht der schwarze Text "Informationen entnehmen".

Ein rechtwinkliges Steigungsdreieck ist unterhalb der blauen Linie eingezeichnet. Es wird gebildet durch eine vertikale schwarze Linie vom Punkt (2|5) nach unten zum Punkt (2|1) auf der Höhe von y=1, und eine horizontale schwarze Linie vom Punkt (0|1) nach rechts zum Punkt (2|1). Der rechte Winkel ist am Punkt (2|1) mit einem kleinen Quadrat markiert.
Entlang der vertikalen Seite des Dreiecks steht "Δy = 4". Entlang der horizontalen Seite steht "Δx = 2".
Die Koordinaten der relevanten Punkte sind ebenfalls beschriftet: "(0|1)" am Startpunkt der Linie auf der y-Achse, "(2|1)" am unteren rechten Eckpunkt des Steigungsdreiecks und "(2|5)" am oberen Endpunkt der Linie.
Rechts oberhalb des Steigungsdreiecks ist die Steigungsberechnung in schwarzem Text dargestellt: "m = Δy / Δx = 4 / 2 = 2".

Auf der rechten Seite des Bildes sind drei vertikal gestapelte, abgerundete weiße Rechtecke mit dicken schwarzen Umrissen.
Das oberste Rechteck enthält den fetten schwarzen Text "y-Achsenabschnitt: 1".
Das mittlere Rechteck enthält den fetten schwarzen Text "Steigung: 2".
Das unterste Rechteck enthält den fetten schwarzen Text "Punkt bei x = 2: (2|5)".

Drei geschwungene, hellblaue Pfeile mit schwarzen Umrissen verbinden die linke Diagrammhälfte mit den rechten Informationsboxen.
Der oberste Pfeil zeigt von der blauen Linie am y-Achsenabschnitt (Punkt (0|1)) zur Box "y-Achsenabschnitt: 1".
Der mittlere Pfeil zeigt von der Steigungsberechnung "m = Δy / Δx = 4 / 2 = 2" zur Box "Steigung: 2".
Der unterste Pfeil zeigt vom Punkt (2|5) auf der blauen Linie zur Box "Punkt bei x = 2: (2|5)".
```
