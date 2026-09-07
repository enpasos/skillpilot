# Bildrekonstruktionsprompt: Extrema der Einzelspaltbeugung bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `6e4faa1f-bccf-574e-bdb9-544f44c1d7f7`
- Titel: Extrema der Einzelspaltbeugung bestimmen
- Beschreibung: Die lernende Person kann bei senkrechtem monochromatischem Lichteinfall auf einen gleichmäßig beleuchteten Einzelspalt die Minima im Fernfeld durch paarweise Auslöschung erklären und ihre Winkel und Schirmpositionen berechnen. Daraus bestimmt sie die Breite des Zentralmaximums; die Lage der Nebenmaxima ermittelt sie aus einem bereitgestellten Intensitätsverlauf und kennzeichnet Näherungen, statt halbe Ordnungen als exakte Maximapositionen anzunehmen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `6e4faa1f-bccf-574e-bdb9-544f44c1d7f7.generated.2026-09-07T01-51-08-476Z.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein wissenschaftliches Diagramm im Stil einer Lehrtafel auf hellblauem Hintergrund. Der obere Bereich zeigt einen Titel und Untertitel in schwarzer, fetter Schrift. Der Titel lautet "Einzelspalt: Minima und Maxima". Darunter steht der Untertitel "Senkrechter monochromatischer Einfall • gleichmäßig beleuchteter Spalt • Fernfeld".

Der linke Bereich ist in zwei Abschnitte unterteilt. Oben links befindet sich ein schematisches Diagramm einer Einzelspaltbeugungsanordnung. Fünf parallele, horizontale schwarze Pfeile von links nach rechts stellen einfallendes Licht dar. Links davon ist "λ: Wellenlänge" mit einem Pfeil zum obersten Lichtstrahl beschriftet. Unter den Lichtstrahlen steht "b: Spaltbreite" mit einem Pfeil zur Spaltbreite. Rechts von den Lichtstrahlen ist ein vertikaler, grauer Spalt dargestellt, dessen Breite mit einem vertikalen Doppelpfeil als 'b' markiert ist. Eine gestrichelte horizontale Linie verläuft von der Mitte des Spaltes nach rechts zur Mitte eines vertikalen, grauen Schirms. Auf dem Schirm ist ein Beugungsmuster mit einem hellen Zentralmaximum und schwächeren Nebenmaxima dargestellt. Ein Punkt 'O' markiert die Mitte des Zentralmaximums auf dem Schirm. Eine vertikale Strecke 'y₁' ist vom Punkt 'O' nach oben zum ersten Minimum auf dem Schirm eingezeichnet. Eine gestrichelte Linie verbindet die obere Kante des Spaltes mit dem Punkt 'y₁' auf dem Schirm. Eine weitere gestrichelte Linie verbindet die Mitte des Spaltes mit dem Punkt 'y₁' auf dem Schirm. Der Winkel zwischen der horizontalen Achse und der gestrichelten Linie von der Spaltmitte zu 'y₁' ist als 'θ₁' beschriftet. Ein Textfeld "Erstes Minimum: Spalthälften löschen sich paarweise aus." mit einem Pfeil zeigt auf den Punkt 'y₁'. Eine vertikale Klammer auf dem Schirm um das Zentralmaximum ist mit "Zentralmaximum" beschriftet und reicht von "m=+1" oben bis "m=-1" unten. Unterhalb des Spaltes zeigt ein horizontaler Doppelpfeil den Abstand 'L' zwischen Spalt und Schirm an, beschriftet mit "L: Schirmabstand L". Oben links im Diagramm steht "nicht maßstäblich".

Unten links befindet sich ein Diagramm einer Intensitätskurve. Es ist ein 2D-Koordinatensystem mit einer horizontalen x-Achse und einer vertikalen y-Achse. Die y-Achse ist mit "I / I₀" und einem Pfeil nach oben beschriftet. Die x-Achse ist mit "u = b sin θ / λ" und einem Pfeil nach rechts beschriftet. Die Achsen sind bei -2, -1, 0, +1, +2 auf der x-Achse und bei 1 auf der y-Achse markiert. Eine blaue Kurve zeigt die Intensitätsverteilung: Sie hat ein Maximum von 1 bei u=0, fällt auf 0 bei u=±1, steigt dann zu kleineren Nebenmaxima an (ungefähr 0,047), fällt wieder auf 0 bei u=±2 und so weiter. Eine gestrichelte horizontale Linie bei y=0,047 ist eingezeichnet. Ein Textfeld "Nebenmaxima aus der Intensitätskurve: zuerst u ≈ ±1,43" mit einem Pfeil zeigt auf das erste Nebenmaximum rechts. Ein weiteres Textfeld "Warnhinweis: Nicht exakt auf halben Ordnungen!" mit einem Pfeil zeigt auf den Bereich der Nebenmaxima.

Der rechte Bereich enthält fünf gestapelte, hellbeige Kästen mit schwarzem Rand, die Formeln und numerische Daten enthalten.
Der erste Kasten oben ist beschriftet mit "Minima: b sin θ_m = m λ" und darunter "m = ±1, ±2, ... (m ≠ 0)".
Der zweite Kasten ist beschriftet mit "Schirmgeometrie: y_m = L tan θ_m".
Der dritte Kasten ist beschriftet mit "Kleine Winkel: y_m ≈ m (λ L / b)".
Der vierte Kasten ist beschriftet mit "Breite des Zentralmaximums: W = 2 |y₁|".
Der fünfte und unterste Kasten enthält numerische Beispiele: "λ = 500 nm, b = 0,20 mm, L = 2,0 m", darunter "Erste Minima: y₁ ≈ ±5,0 mm", darunter "Zentralmaximum: W ≈ 10,0 mm", und darunter "Erste Nebenmaxima: y ≈ ±7,2 mm".
```
