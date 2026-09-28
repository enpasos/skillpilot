# Bildrekonstruktionsprompt: Mittelpunkte von Raumstrecken aus Koordinaten bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `bea0e5a0-4833-5337-b6f1-7251b8cf8089`
- Titel: Mittelpunkte von Raumstrecken aus Koordinaten bestimmen
- Beschreibung: Die lernende Person kann den Mittelpunkt einer Strecke im Raum aus den Koordinaten ihrer Endpunkte bestimmen, als halbe Summe der Ortsvektoren deuten und durch gleiche Verbindungsvektoren zu beiden Endpunkten prüfen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (reused SkillPilot asset)
- Quellbild: `bea0e5a0-4833-5337-b6f1-7251b8cf8089.png`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein handgezeichnetes, lehrreiches Diagramm auf weißem Hintergrund im Stil einer Whiteboard-Skizze. Der Titel "Abstände, Beträge und Mittelpunkte im Raum berechnen" steht oben mittig in schwarzer Schrift.

Darunter befindet sich ein zentrales Diagramm: Ein rotes Liniensegment verbindet zwei Punkte. Der linke Punkt ist ein blauer Kreis, der rechte Punkt ein grüner Kreis. Eine blaue, abgerundete Sprechblase mit weißem Text "A(1|2|3)" zeigt auf den blauen Punkt. Eine grüne, abgerundete Sprechblase mit weißem Text "B(5|4|7)" zeigt auf den grünen Punkt. Eine gestrichelte schwarze Linie verläuft oberhalb des roten Liniensegments und verbindet die beiden Punkte. Mittig über dieser gestrichelten Linie schwebt eine gelbe, abgerundete Sprechblase mit schwarzem Text "Abstand: 6". Auf dem roten Liniensegment, genau in der Mitte, befindet sich ein kleiner violetter Kreis mit einem weißen "M". Eine violette, abgerundete Sprechblase mit weißem Text "Mittelpunkt: M(3|3|5)" zeigt auf diesen violetten Kreis.

Unten links ist eine Tabelle mit schwarzen Linien und abgerundeten Ecken dargestellt. Die Kopfzeile enthält "Punkt", "x₁", "x₂", "x₃". Die erste Datenzeile zeigt "A", "1", "2", "3". Die zweite Datenzeile zeigt "B", "5", "4", "7". Alle Texte in der Tabelle sind schwarz.

Unten rechts, vertikal gestapelt, sind drei Berechnungsblöcke, jeweils umrandet von einem dünnen schwarzen Rechteck mit abgerundeten Ecken. Alle Texte in diesen Blöcken sind schwarz.
Der obere Block hat den Titel "Berechnung Vektordifferenz" und die Formel "B – A = (5-1 | 4-2 | 7-3) = (4|2|4)".
Der mittlere Block hat den Titel "Berechnung Abstand (Betrag)" und die Formel "d = √((4² + 2² + 4²)) = √(16 + 4 + 16) = √36 = 6".
Der untere Block hat den Titel "Berechnung Mittelpunkt" und die Formel "M = ½ * (A + B) = ½ * (1+5 | 2+4 | 3+7) = (3|3|5)".
```
