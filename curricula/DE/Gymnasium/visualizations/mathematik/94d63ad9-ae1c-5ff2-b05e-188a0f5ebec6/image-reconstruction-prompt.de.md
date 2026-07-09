# Bildrekonstruktionsprompt: Flächen unter Graphen näherungsweise bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6`
- Titel: Flächen unter Graphen näherungsweise bestimmen
- Beschreibung: Die lernende Person kann Flächeninhalte unter Funktionsgraphen durch Rechtecksummen (Ober- und Untersummen) und andere Näherungsverfahren bestimmen, diese als Summen schreiben und die Genauigkeit der Approximation einschätzen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein mathematisches Diagramm auf weißem Hintergrund, das die Annäherung von Flächen unter Graphen mittels Unter- und Obersummen darstellt. Der Titel oben mittig lautet: "Flächen unter Graphen näherungsweise bestimmen" in schwarzer, fetter, serifenloser Schrift.

Darunter befinden sich zwei nebeneinander angeordnete Diagramme.

Das linke Diagramm ist mit "Untersumme (Näherung von unten)" überschrieben, in schwarzer, fetter, serifenloser Schrift. Es zeigt ein Koordinatensystem mit einer schwarzen x-Achse und einer schwarzen y-Achse, beide mit Pfeilspitzen an den positiven Enden. Der Ursprung ist mit "0" beschriftet. Die x-Achse ist von 0 bis 4 mit ganzen Zahlen beschriftet und endet mit einem "x". Die y-Achse ist von 1 bis 5 mit ganzen Zahlen beschriftet und endet mit einem "y". Eine schwarze, gerade Linie repräsentiert die Funktion f(x) = x+1, die durch die Punkte (0,1), (1,2), (2,3), (3,4) und (4,5) verläuft. Die Funktionsgleichung "f(x) = x+1" steht neben der Linie in schwarzer, fetter, serifenloser Schrift. Unterhalb der Linie sind vier blaue, gefüllte Rechtecke mit schwarzen Umrissen gezeichnet, die die Untersumme darstellen. Das erste Rechteck hat die Basis [0,1] und die Höhe f(0)=1. Das zweite Rechteck hat die Basis [1,2] und die Höhe f(1)=2. Das dritte Rechteck hat die Basis [2,3] und die Höhe f(2)=3. Das vierte Rechteck hat die Basis [3,4] und die Höhe f(3)=4. In der Basis jedes Rechtecks steht "Δx = 1" in schwarzer, fetter, serifenloser Schrift. Unter der x-Achse steht "Rechtecke basierend auf linken Randwerten" in schwarzer, fetter, serifenloser Schrift.

Das rechte Diagramm ist mit "Obersumme (Näherung von oben)" überschrieben, in schwarzer, fetter, serifenloser Schrift. Es zeigt ein identisches Koordinatensystem und die gleiche schwarze Funktionslinie f(x) = x+1 wie das linke Diagramm. Unterhalb der Linie sind vier orangefarbene, gefüllte Rechtecke mit schwarzen Umrissen gezeichnet, die die Obersumme darstellen. Das erste Rechteck hat die Basis [0,1] und die Höhe f(1)=2. Das zweite Rechteck hat die Basis [1,2] und die Höhe f(2)=3. Das dritte Rechteck hat die Basis [2,3] und die Höhe f(3)=4. Das vierte Rechteck hat die Basis [3,4] und die Höhe f(4)=5. In der Basis jedes Rechtecks steht "Δx = 1" in schwarzer, fetter, serifenloser Schrift. Unter der x-Achse steht "Rechtecke basierend auf rechten Randwerten" in schwarzer, fetter, serifenloser Schrift.

Unter den Diagrammen befindet sich eine Tabelle mit schwarzen Rändern und weißem Hintergrund. Sie hat drei Spalten und fünf Zeilen. Die Kopfzeile enthält die Beschriftungen: "Intervall", "linker Wert (für Untersumme)", "rechter Wert (für Obersumme)". Die Datenzeilen sind:
- "[0,1]", "f(0) = 1", "f(1) = 2"
- "[1,2]", "f(1) = 2", "f(2) = 3"
- "[2,3]", "f(2) = 3", "f(3) = 4"
- "[3,4]", "f(3) = 4", "f(4) = 5"
Der gesamte Text in der Tabelle ist schwarz und serifenlos.

Unter der Tabelle sind zwei Berechnungsformeln in separaten, abgerundeten Rechteckboxen mit schwarzem Rand und weißem Hintergrund angeordnet.
Die linke Box enthält: "Untersumme = Δx * (f(0) + f(1) + f(2) + f(3)) = 1 * (1 + 2 + 3 + 4) = 10".
Die rechte Box enthält: "Obersumme = Δx * (f(1) + f(2) + f(3) + f(4)) = 1 * (2 + 3 + 4 + 5) = 14".
Der gesamte Text in den Formelboxen ist schwarz und serifenlos.

Darunter, mittig, befindet sich eine weitere abgerundete Rechteckbox mit schwarzem Rand und weißem Hintergrund, die das Ergebnis anzeigt: "Ergebnis: 10 ≤ Fläche ≤ 14" in schwarzer, fetter, serifenloser Schrift.

Ganz unten, mittig, steht der abschließende Satz: "Exakter Wert = 12; Feinere Rechtecke (kleineres Δx) verbessern die Näherung." in schwarzer, serifenloser Schrift.

Der Gesamtstil ist klar, lehrreich und mathematisch, mit einer sauberen Ästhetik und einer einfachen Farbpalette aus Blau, Orange, Schwarz und Weiß. Alle Linien und Formen sind präzise gezeichnet.
```
