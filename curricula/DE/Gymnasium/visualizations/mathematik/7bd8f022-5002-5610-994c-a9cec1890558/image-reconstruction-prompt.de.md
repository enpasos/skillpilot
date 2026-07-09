# Bildrekonstruktionsprompt: Drehungen um Koordinatenachsen mit Matrizen darstellen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `7bd8f022-5002-5610-994c-a9cec1890558`
- Titel: Drehungen um Koordinatenachsen mit Matrizen darstellen (LK)
- Beschreibung: Die lernende Person kann Abbildungsmatrizen für Drehungen um die Koordinatenachsen im $\mathbb{R}^3$ untersuchen und bestimmen sowie Bildpunkte berechnen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `7bd8f022-5002-5610-994c-a9cec1890558.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, modernes, lehrreiches Diagramm im Vektorgrafikstil auf weißem Hintergrund. Oben befindet sich eine breite, hellgraue Kopfzeile mit dem zentrierten schwarzen Text "Drehungen um Koordinatenachsen mit Matrizen darstellen (LK)" in einer serifenlosen Schriftart.

Darunter ist der Inhalt in zwei Reihen angeordnet. Die obere Reihe enthält drei Elemente:
1.  **Oben links:** Ein 3D-Koordinatensystem mit dem Ursprung unten links. Die rote X-Achse zeigt nach vorne rechts, die grüne Y-Achse nach hinten rechts und die blaue Z-Achse nach oben. Die Achsen sind mit "x" (rot), "y" (grün) und "z" (blau) beschriftet. Ein brauner Punkt "P" befindet sich im ersten Oktanten. Gestrichelte schwarze Linien projizieren P auf die XY-Ebene und von dort auf die X- und Y-Achsen. Ein weiterer brauner Punkt markiert die Projektion von P auf die XY-Ebene. Ein gestrichelter schwarzer Bogen im Uhrzeigersinn verbindet die X-Achse mit der Y-Achse, beginnend nahe der roten "x"-Beschriftung und endend nahe der grünen "y"-Beschriftung, was eine Rotation in der XY-Ebene andeutet.
2.  **Oben mittig:** Ein weiteres 3D-Koordinatensystem, ähnlich dem linken, aber mit dem Ursprung explizit als "(0,0,0)" beschriftet. Die Achsen sind rot (X), grün (Y) und blau (Z) und mit "x", "y", "z" beschriftet. Ein brauner Punkt "P" ist im ersten Oktanten dargestellt, mit gestrichelten Linien zu den Achsen. Ein großer, grauer, gekrümmter Pfeil um die blaue Z-Achse zeigt eine 90-Grad-Drehung gegen den Uhrzeigersinn an, daneben steht der Text "90°". Oben links in diesem Diagramm steht der Text "R³".
3.  **Oben rechts (und sich nach unten erstreckend):** Eine vertikale Box mit abgerundeten Ecken und einem dünnen schwarzen Rand. Die Kopfzeile der Box ist hellgrau mit dem schwarzen Text "Beispielpunkt-Berechnung". Der Inhalt der Box ist in schwarzer serifenloser Schrift und mathematischer Notation:
    *   `P = (2,1,3)`
    *   `P' = R_Z(90°) ⋅ P`
    *   `P' = \begin{pmatrix} 0 & -1 & 0 \\ 1 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix} \cdot \begin{pmatrix} 2 \\ 1 \\ 3 \end{pmatrix}`
    *   `= \begin{pmatrix} 0 \cdot 2 + (-1) \cdot 1 + 0 \cdot 3 \\ 1 \cdot 2 + 0 \cdot 1 + 0 \cdot 3 \\ 0 \cdot 2 + 0 \cdot 1 + 1 \cdot 3 \end{pmatrix}`
    *   `= \begin{pmatrix} -1 \\ 2 \\ 3 \end{pmatrix}`
    *   Am Ende der Berechnung befindet sich ein hellgraues, abgerundetes Rechteck mit dem Text `P' = (-1,2,3)`.

Die untere Reihe enthält zwei Boxen links und in der Mitte, die sich unter den oberen Diagrammen befinden:
1.  **Unten links:** Eine Box mit abgerundeten Ecken und einem dünnen schwarzen Rand. Die Kopfzeile ist hellgrau mit dem schwarzen Text "Drehmatrix R_Z(90°)". Der Inhalt der Box ist die Matrixdefinition:
    *   `R_Z(90°) = \begin{pmatrix} 0 & -1 & 0 \\ 1 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix}`
2.  **Unten mittig:** Eine Box mit abgerundeten Ecken und einem dünnen schwarzen Rand. Die Kopfzeile ist hellgrau mit dem schwarzen Text "Wirkung auf Basisvektoren". Der Inhalt ist ein 3D-Koordinatensystem mit dem Ursprung in der Mitte. Die Achsen sind rot (X), grün (Y) und blau (Z).
    *   Ein blauer Pfeil zeigt entlang der positiven Z-Achse nach oben, beschriftet mit `\vec{e}_z = (0,0,1)`.
    *   Ein grüner Pfeil zeigt entlang der posit positiven Y-Achse nach rechts, beschriftet mit `\vec{e}_y = (0,1,0)`.
    *   Ein roter Pfeil zeigt entlang der negativen X-Achse nach links, beschriftet mit `- \vec{e}_x = (-1,0,0)`.
    *   Ein roter Pfeil zeigt entlang der positiven X-Achse, der den ursprünglichen `\vec{e}_x` darstellt.
    *   Ein grüner Pfeil zeigt entlang der positiven Y-Achse, der den ursprünglichen `\vec{e}_y` darstellt.
    *   Gekrümmte Pfeile zeigen die Rotation an:
        *   Ein Pfeil von der positiven X-Achse (rot) zur positiven Y-Achse (grün) im Uhrzeigersinn, beschriftet mit `R_Z`.
        *   Ein Pfeil von der positiven Y-Achse (grün) zur negativen X-Achse (rot) im Uhrzeigersinn, beschriftet mit `R_Z`.
        *   Ein Pfeil von der positiven Z-Achse (blau) zu sich selbst, beschriftet mit `R_Z \rightarrow \vec{e}_z`.
```
