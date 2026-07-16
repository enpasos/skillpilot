# Bildrekonstruktionsprompt: Einfluss von n und p auf Binomialverteilungen analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `42d300e3-e982-5889-98d7-fc297f10eff1`
- Titel: Einfluss von n und p auf Binomialverteilungen analysieren
- Beschreibung: Die lernende Person kann anhand von Histogrammen untersuchen, wie sich die Parameter n und p auf Lage, Streuung und Symmetrie binomialverteilter Zufallsgrößen auswirken, und entsprechende Vergleiche an Beispielen begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Quellbild: `42d300e3-e982-5889-98d7-fc297f10eff1.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein detailliertes, lehrreiches Diagramm im Stil einer Infografik mit klarem, weißem Hintergrund und schwarzen Rahmenlinien. Das Diagramm ist in zwei Hauptabschnitte unterteilt, die durch eine horizontale Linie getrennt sind.

Ganz oben steht der zentrierte, große und fette Titel in Schwarz: 'Einfluss von n und p auf Binomialverteilungen analysieren'.
Darunter befindet sich der zentrierte, schwarze Untertitel: 'Wie verändern p (Erfolgswahrscheinlichkeit) und n (Versuche) Lage, Streuung und Symmetrie? Vergleiche anhand von Histogrammen.'.

**Oberer Abschnitt: Einfluss von p**
Dieser Abschnitt ist überschrieben mit dem zentrierten, fetten Titel 'Einfluss von p (Erfolgswahrscheinlichkeit)'. Er enthält zwei Histogramme, die durch einen großen, hellblauen Pfeil mit schwarzem Rand verbunden sind, der von links nach rechts zeigt.

Linkes Histogramm (kleines p):
Oben links steht der schwarze Text 'Asymmetrisch (linksverschiebt)'. Links neben dem Histogramm steht der schwarze Text 'kleines p: p=0,25 (n=4)', wobei 'kleines p:' fett ist.
Das Histogramm zeigt fünf vertikale Balken über einer horizontalen Achse, die mit 'k = 0 1 2 3 4' beschriftet ist. Die Balkenhöhen sind wie folgt: k=0 (kurz, blau), k=1 (am höchsten, blau), k=2 (mittel, blau), k=3 (kurz, grün), k=4 (sehr kurz, grün).
Ein schwarzer Pfeil zeigt von der Spitze des Balkens bei k=1 nach oben rechts zu dem schwarzen Text 'P(X=1) Lage (Mitte) linksverschoben'.
Unter der horizontalen Achse befindet sich ein doppelseitiger Pfeil mit dem schwarzen Text 'Streuung (Breite)'.

Mittlerer Erklärungspfeil (oben):
Der große, hellblaue Pfeil mit schwarzem Rand zeigt von links nach rechts. Im Inneren des Pfeils steht der schwarze Text: 'p steigt: Der Erwartungswert μ = n·p wandert nach rechts.'.
Unterhalb dieses Pfeils steht der schwarze Text: 'Bei p=0,25 und p=0,75 ist die Streuung gleich groß; die Formen sind gespiegelt.'.

Rechtes Histogramm (großes p):
Oben rechts steht der schwarze Text 'Asymmetrisch (rechtsverschiebt)'. Rechts neben dem Histogramm steht der schwarze Text 'großes p: p=0,75 (n=4)', wobei 'großes p:' fett ist.
Das Histogramm zeigt fünf vertikale Balken über einer horizontalen Achse, die mit 'k = 0 1 2 3 4' beschriftet ist. Die Balkenhöhen sind wie folgt: k=0 (sehr kurz, blau), k=1 (kurz, blau), k=2 (mittel, grün), k=3 (am höchsten, grün), k=4 (mittel, grün).
Ein schwarzer Pfeil zeigt von der Spitze des Balkens bei k=3 nach oben links zu dem schwarzen Text 'P(X=3) Lage (Mitte) rechtsverschoben'.
Unter der horizontalen Achse befindet sich ein doppelseitiger Pfeil mit dem schwarzen Text 'Streuung (Breite) ähnlich'.

**Unterer Abschnitt: Einfluss von n**
Dieser Abschnitt ist überschrieben mit dem zentrierten, fetten Titel 'Einfluss von n (Anzahl der Versuche)'. Er enthält zwei Histogramme, die durch einen großen, hellblauen Pfeil mit schwarzem Rand verbunden sind, der von links nach rechts zeigt.

Linkes Histogramm (kleines n):
Oben links steht der schwarze Text 'Symmetrisch, Mitte bei k=2'. Links neben dem Histogramm steht der schwarze Text 'kleines n: n=4 (p=0,5)', wobei 'kleines n:' fett ist.
Das Histogramm zeigt fünf vertikale Balken über einer horizontalen Achse, die mit 'k = 0 1 2 3 4' beschriftet ist. Die Balkenhöhen sind wie folgt: k=0 (kurz, blau), k=1 (mittel, blau), k=2 (am höchsten, grün), k=3 (mittel, grün), k=4 (kurz, grün).
Ein schwarzer Pfeil zeigt von der Spitze des Balkens bei k=2 nach unten.
Unter der horizontalen Achse befindet sich ein doppelseitiger Pfeil mit dem schwarzen Text 'geringe Streuung'.

Mittlerer Erklärungspfeil (unten):
Der große, hellblaue Pfeil mit schwarzem Rand zeigt von links nach rechts. Im Inneren des Pfeils steht der schwarze Text, aufgeteilt in drei Zeilen:
'n steigt: μ = n·p steigt.'
'Die absolute Streuung σ = √(n·p·(1−p)) steigt.'
'Die relative Streuung σ/n sinkt.'

Rechtes Histogramm (größeres n):
Oben rechts steht der schwarze Text 'Symmetrisch, Mitte bei k=4'. Rechts neben dem Histogramm steht der schwarze Text 'größeres n: n=8 (p=0,5)', wobei 'größeres n:' fett ist.
Das Histogramm zeigt neun vertikale Balken über einer horizontalen Achse, die mit 'k = 0 1 2 3 4 5 6 7 8' beschriftet ist. Die Balkenhöhen sind wie folgt: k=0 (sehr kurz, blau), k=1 (kurz, blau), k=2 (mittel, blau), k=3 (hoch, blau), k=4 (am höchsten, grün), k=5 (hoch, grün), k=6 (mittel, grün), k=7 (kurz, grün), k=8 (sehr kurz, grün).
Ein schwarzer Pfeil zeigt von der Spitze des Balkens bei k=4 nach unten.
Unter der horizontalen Achse befindet sich ein doppelseitiger Pfeil mit dem schwarzen Text 'größere Streuung'.
```
