# Bildrekonstruktionsprompt: Parallelprojektionen auf Ursprungsebenen mit Matrizen darstellen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `803d910d-96d1-5118-b9ca-29e93d0da76d`
- Titel: Parallelprojektionen auf Ursprungsebenen mit Matrizen darstellen (LK)
- Beschreibung: Die lernende Person kann Abbildungsmatrizen für Parallelprojektionen auf beliebige Ursprungsebenen im $\mathbb{R}^3$ untersuchen und bestimmen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Quellbild: `803d910d-96d1-5118-b9ca-29e93d0da76d.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein mathematisches Diagramm auf einem hellblauen Hintergrund mit subtilen, helleren geometrischen Dreiecksformen. Oben mittig befindet sich ein großes, horizontales, weißes Rechteck mit abgerundeten Ecken und dem schwarzen Text "Parallelprojektion auf eine Ursprungsebene".

Das Bild ist in zwei vertikale Bereiche unterteilt, die durch die zentrale 3D-Grafik getrennt sind.

**Linker Bereich ("Herleitung & Matrix"):**
Oben links ist ein kleineres, horizontales, weißes Rechteck mit abgerundeten Ecken und dem schwarzen Text "Herleitung & Matrix". Darunter folgen mehrere weiße Rechtecke mit abgerundeten Ecken, die mathematische Formeln und Beschreibungen enthalten:
1.  Ein großes Rechteck mit der Formel "P = I - (d·nᵀ) / (n·d)". Die Buchstaben P, I, d, n sind fett gedruckt.
2.  Darunter zwei kleinere, nebeneinander liegende Rechtecke. Das linke enthält "n = (1,1,1)" und darunter in kleinerer Schrift "Normalenvektor von E". Das rechte enthält "d = (0,0,1)" und darunter in kleinerer Schrift "Projektionsrichtung".
3.  Darunter ein weiteres Rechteck mit der Formel "n·d = (1,1,1)·(0,0,1) = 1".
4.  Ganz unten links ein großes Rechteck mit der Matrix "P = [[1, 0, 0], [0, 1, 0], [-1, -1, 0]]". Die Matrix ist von eckigen Klammern umschlossen.

**Rechter Bereich ("Wirkung & Kontrollen"):**
Oben rechts ist ein kleineres, horizontales, weißes Rechteck mit abgerundeten Ecken und dem schwarzen Text "Wirkung & Kontrollen". Darunter folgen mehrere weiße Rechtecke mit abgerundeten Ecken, die mathematische Formeln und Beschreibungen enthalten:
1.  Ein großes Rechteck mit dem Titel "Rechnung P·A = A'" und darunter eine Matrixmultiplikation: "[[1, 0, 0], [0, 1, 0], [-1, -1, 0]] · [[2], [-1], [3]] = [[2], [-1], [-1]]". Ein schwarzer Pfeil zeigt von der Ergebnis-Matrix nach unten rechts auf den Text "A'".
2.  Darunter ein Rechteck mit dem Titel "Probe A' ∈ E" und darunter die Gleichung "2 - 1 - 1 = 0", gefolgt von einem großen, grünen Haken-Symbol.
3.  Ganz unten rechts ein Rechteck mit dem Titel "Kontrolle P² = P" und darunter die Gleichung "P² = P", gefolgt von einem großen, grünen Haken-Symbol.

**Zentrale 3D-Grafik:**
In der Mitte des Bildes befindet sich ein dreidimensionales Koordinatensystem mit den Achsen x, y und z, die sich im Ursprung O schneiden. Die Achsen sind schwarz und haben Pfeilspitzen.
Eine orangefarbene, leicht transparente Ebene mit einem feinen Gittermuster verläuft schräg durch den Ursprung. Diese Ebene ist mit "E: x + y + z = 0" beschriftet.
Ein grüner Vektor, beschriftet mit "n", zeigt vom Ursprung senkrecht von der Ebene weg.
Ein schwarzer Vektor, beschriftet mit "d", zeigt vom Ursprung entlang der positiven z-Achse nach oben.
Ein roter Punkt, beschriftet mit "A = (2,-1,3)", befindet sich oberhalb der Ebene. Eine dünne schwarze Linie verbindet A mit dem Ursprung.
Ein dicker roter Pfeil zeigt von Punkt A parallel zum Vektor d nach unten in Richtung der Ebene.
Der Pfeil endet auf der Ebene bei einem blauen Punkt, der mit "A' = (2,-1,-1)" beschriftet ist.
Eine gestrichelte blaue Linie verbindet den Punkt A' mit dem Ursprung.
Mehrere gestrichelte graue Linien zeigen die Projektionen der Punkte A und A' auf die Koordinatenachsen an, um die räumliche Position zu verdeutlichen.
```
