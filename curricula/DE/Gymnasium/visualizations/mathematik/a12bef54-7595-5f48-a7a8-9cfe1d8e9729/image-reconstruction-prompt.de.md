# Bildrekonstruktionsprompt: Allgemeinen Transformationsterm interpretieren

## SkillPilot-Ziel

- SkillPilot-ID: `a12bef54-7595-5f48-a7a8-9cfe1d8e9729`
- Titel: Allgemeinen Transformationsterm interpretieren
- Beschreibung: Die lernende Person kann den Term $g(x)=a\cdot f(b\cdot(x-c))+d$ als Kombination von Verschiebung, Streckung beziehungsweise Stauchung und Spiegelung deuten, auch ohne konkret gegebenen Funktionsterm von $f$.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `a12bef54-7595-5f48-a7a8-9cfe1d8e9729.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Infografik-Diagramm auf weißem Hintergrund. Oben mittig steht der Titel "Allgemeinen Transformationsterm Interpretieren" in großer, fetter, schwarzer serifenloser Schrift.

Direkt darunter, mittig platziert, befindet sich ein hellbeiges Band mit dunkler Umrandung, das die mathematische Formel `g(x) = a ⋅ f(b ⋅ (x − c)) + d` enthält. Die Variablen `a`, `b`, `c`, `d` sind farblich hervorgehoben: `a` ist orange, `b` ist lila, `c` ist blau und `d` ist grün.

Unterhalb des Bandes sind vier gleich große, abgerundete Rechtecke horizontal nebeneinander angeordnet, jeweils mit einer dunklen Umrandung. Jedes Rechteck hat oben links eine karikaturartige Hand, die auf den Inhalt zeigt. Die Farben der Rechtecke und ihrer Inhalte korrespondieren mit den farbigen Variablen der Formel im Band.

Das erste Rechteck (links, hellblau) ist in zwei Abschnitte unterteilt. Der obere Abschnitt enthält den Text "c: Horizontale Verschiebung" in fetter, schwarzer Schrift. Der untere Abschnitt enthält den Text "Verschiebung nach rechts bei c > 0." und darunter ein Diagramm: eine horizontale Achse mit einem Pfeil nach rechts und der Beschriftung 'x', einem kleinen vertikalen Strich auf der Achse, der mit 'c' beschriftet ist, und einem blauen horizontalen Pfeil darüber, der nach rechts zeigt und mit "(Gegenteilige Richtung)" beschriftet ist.

Das zweite Rechteck (hellgrün) ist ebenfalls zweigeteilt. Der obere Abschnitt enthält den Text "d: Vertikale Verschiebung" in fetter, schwarzer Schrift. Der untere Abschnitt enthält den Text "Verschiebung nach oben bei d > 0." und darunter ein Diagramm: eine vertikale Achse mit einem Pfeil nach oben und der Beschriftung 'y', einem kleinen horizontalen Strich auf der Achse, der mit 'd' beschriftet ist, und einem grünen vertikalen Doppelpfeil, dessen obere Hälfte nach oben zeigt.

Das dritte Rechteck (orange) ist ebenfalls zweigeteilt. Der obere Abschnitt enthält den Text "a: Vertikale Veränderung & Spiegelung" in fetter, schwarzer Schrift. Der untere Abschnitt enthält den Text "Streckung/Stauchung in y-Richtung mit Faktor |a|." mit einem vertikalen Doppelpfeil und der Beschriftung `|a|` daneben. Darunter steht "Spiegelung an der x-Achse bei a < 0." mit einem stilisierten orangefarbenen Kurven-Diagramm, das eine Spiegelung an einer horizontalen Achse darstellt.

Das vierte Rechteck (rechts, lila) ist ebenfalls zweigeteilt. Der obere Abschnitt enthält den Text "b: Horizontale Veränderung & Spiegelung" in fetter, schwarzer Schrift. Der untere Abschnitt enthält den Text "Veränderung in x-Richtung mit Faktor 1/|b|." mit einem horizontalen Doppelpfeil und der Beschriftung `1/|b|` daneben. Darunter steht "Spiegelung an der y-Achse bei b < 0." mit einem stilisierten lila Kurven-Diagramm, das eine Spiegelung an einer vertikalen Achse darstellt.

Unterhalb dieser vier Rechtecke, linksbündig, steht der Titel "Beispiel-Deutung" in fetter, schwarzer serifenloser Schrift. Direkt darunter, ebenfalls linksbündig, ist die Formel `g(x) = -2 ⋅ f(0.5 ⋅ (x − 3)) + 1` in schwarzer serifenloser Schrift dargestellt.

Darunter befindet sich ein horizontaler Flussdiagramm-Ablauf. Ein großer, hellbeiger Pfeil zeigt von der Beispielformel nach rechts. Dieser Pfeil führt zu einer Kette von fünf abgerundeten Rechtecken, die jeweils durch kleinere, hellbeige Pfeile miteinander verbunden sind und nach rechts zeigen.

Das erste Rechteck (hellblau) enthält den Text "nach rechts\n3".
Der nächste Pfeil führt zum zweiten Rechteck (lila), das den Text "in x-Richtung\ngestreckt mit\nFaktor 2 (1/0.5)" enthält.
Der nächste Pfeil führt zum dritten Rechteck (orange), das den Text "in y-Richtung\ngestreckt mit\nFaktor 2" enthält.
Der nächste Pfeil führt zum vierten Rechteck (orange), das den Text "an der\nx-Achse\ngespiegelt" enthält.
Der letzte Pfeil führt zum fünften Rechteck (hellgrün), das den Text "nach oben\n1" enthält.

Alle Texte sind in einer klaren, gut lesbaren, fetten serifenlosen Schrift gehalten, außer den mathematischen Formeln, die eine Standard-Mathematikschrift verwenden. Die Umrandungen der Elemente sind dunkelgrau oder schwarz.
```
