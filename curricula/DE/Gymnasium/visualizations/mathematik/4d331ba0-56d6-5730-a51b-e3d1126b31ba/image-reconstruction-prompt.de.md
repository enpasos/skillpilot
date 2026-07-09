# Bildrekonstruktionsprompt: Bildpunkte mit Matrizen berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `4d331ba0-56d6-5730-a51b-e3d1126b31ba`
- Titel: Bildpunkte mit Matrizen berechnen
- Beschreibung: Die lernende Person kann zu einer gegebenen Abbildungsmatrix Bildpunkte berechnen, indem sie Vektoren mit der Matrix multipliziert.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `4d331ba0-56d6-5730-a51b-e3d1126b31ba.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, modernes, lehrreiches Diagramm mit einem sanften horizontalen Farbverlauf im Hintergrund, der von Hellblau links nach Hellgrün rechts übergeht, und einer subtilen, helleren, organischen Wolkenform hinter dem Haupttitel. Der Haupttitel "Bildpunkte mit Matrizen berechnen" steht zentriert oben in fetter, schwarzer, serifenloser Schrift. Darunter sind drei horizontale, abgerundete Rechteckpaneele mit weißem Hintergrund angeordnet.

Das linke Paneel hat eine abgerundete, hellblaue Verlaufs-Titelleiste mit dem fetten, schwarzen Text "ORIGINALPUNKTE (P, Q, R)". Im Inhalt befindet sich ein 2D-kartesisches Koordinatensystem mit einem hellgrauen Gitter. Die schwarze x-Achse ist von -2 bis 3 beschriftet und endet mit 'x'. Die schwarze y-Achse ist von 1 bis 3 beschriftet und endet mit 'y' oben, der Ursprung ist mit '0' markiert. Drei kleine blaue Kreise mit schwarzer Umrandung markieren die Punkte P=(2,1), Q=(0,2) und R=(-1,1), jeweils beschriftet mit fettem, schwarzem Text. Unten links im Paneel ist eine weiße Sprechblase in Form einer Gedankenwolke mit schwarzer Umrandung, die den fetten, schwarzen Text enthält: "Punkte als Spaltenvektoren:\nP=[2;1], Q=[0;2], R=[-1;1]".

Das mittlere Paneel hat eine abgerundete, hellgrüne Verlaufs-Titelleiste mit dem fetten, schwarzen Text "ABBILDUNGSMATRIX & BERECHNUNG". Der Inhalt zeigt in fetter, schwarzer mathematischer Notation zuerst die Matrixdefinition: `A = [[1, 1], [0, 1]]`. Darunter sind drei vertikal angeordnete Matrixmultiplikationsgleichungen, die die Berechnungsschritte und Ergebnisse darstellen:
`A · P = [[1, 1], [0, 1]] · [2;1] = [1·2+1·1; 0·2+1·1] = [3;1] → P'=(3,1)`
`A · Q = [[1, 1], [0, 1]] · [0;2] = [1·0+1·2; 0·0+1·2] = [2;2] → Q'=(2,2)`
`A · R = [[1, 1], [0, 1]] · [-1;1] = [1·(-1)+1·1; 0·(-1)+1·1] = [0;1] → R'=(0,1)`

Das rechte Paneel hat eine abgerundete, hellgrüne Verlaufs-Titelleiste mit dem fetten, schwarzen Text "BILDPUNKTE (P', Q', R')". Der Inhalt zeigt ein identisches 2D-kartesisches Koordinatensystem wie im linken Paneel. Drei kleine blaue Kreise mit schwarzer Umrandung markieren die Punkte P'=(3,1), Q'=(2,2) und R'=(0,1), jeweils beschriftet mit fettem, schwarzem Text. Unten rechts im Paneel ist eine weiße Sprechblase in Form einer Gedankenwolke mit schwarzer Umrandung, die den fetten, schwarzen Text enthält: "DEUTUNG: Die Matrix berechnet\nzu jedem Punkt seinen Bildpunkt.\nDie y-Koordinaten bleiben gleich.".

Drei gekrümmte, gepunktete Pfeile verbinden die Punkte vom linken Paneel mit den entsprechenden Bildpunkten im rechten Paneel, wobei sie über das mittlere Paneel verlaufen. Ein orangefarbener gepunkteter Pfeil führt von P=(2,1) zu P'=(3,1). Ein grüner gepunkteter Pfeil führt von Q=(0,2) zu Q'=(2,2). Ein blauer gepunkteter Pfeil führt von R=(-1,1) zu R'=(0,1). Alle Texte sind in einer klaren, fetten, serifenlosen Schrift gehalten.
```
