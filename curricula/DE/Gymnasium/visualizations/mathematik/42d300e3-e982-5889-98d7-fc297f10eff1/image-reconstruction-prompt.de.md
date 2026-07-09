# Bildrekonstruktionsprompt: Einfluss von n und p auf Binomialverteilungen analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `42d300e3-e982-5889-98d7-fc297f10eff1`
- Titel: Einfluss von n und p auf Binomialverteilungen analysieren
- Beschreibung: Die lernende Person kann anhand von Histogrammen untersuchen, wie sich die Parameter n und p auf Lage, Streuung und Symmetrie binomialverteilter Zufallsgrößen auswirken, und entsprechende Vergleiche an Beispielen begründen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `42d300e3-e982-5889-98d7-fc297f10eff1.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein detailliertes, handgezeichnetes Diagramm auf einem hellbeigen Hintergrund, das den Einfluss von Parametern auf Binomialverteilungen darstellt. Der Stil ist informell mit dicken schwarzen Umrissen für alle Elemente.

Oben mittig steht der große, schwarze Titel: "Einfluss von n und p auf Binomialverteilungen analysieren". Darunter, kleiner und ebenfalls schwarz, der Untertitel: "Wie verändern p (Erfolgswahrscheinlichkeit) und n (Versuche) Lage, Streuung und Symmetrie? Vergleiche anhand von Histogrammen."

Das Diagramm ist in zwei Hauptabschnitte unterteilt, die jeweils in einem abgerundeten Rechteck mit dickem schwarzem Rand und hellbeigem Hintergrund liegen.

**Oberer Abschnitt: Einfluss von p (Erfolgswahrscheinlichkeit)**
Dieser Abschnitt ist überschrieben mit "Einfluss von p (Erfolgswahrscheinlichkeit)". Er enthält zwei Histogramme, die durch einen großen, orangefarbenen Pfeil mit schwarzem Rand verbunden sind, der nach rechts zeigt. Im Pfeil steht der schwarze Text: "p erhöht sich: Verschiebung nach rechts".

*   **Linkes Histogramm (kleines p):**
    *   Titel: "kleines p: p=0.25 (n=4)".
    *   Ein Balkendiagramm mit einer horizontalen Achse, beschriftet mit "k=0", "1", "2", "3", "4".
    *   Die Balken sind von links nach rechts in abnehmender Höhe und wechselnden Blau- und Grüntönen dargestellt:
        *   k=0: Blauer Balken, Höhe ca. 0.32, links davon "P(X=0)≈0.32".
        *   k=1: Hellblauer Balken, Höhe ca. 0.42, darüber "0,42".
        *   k=2: Hellgrüner Balken, Höhe ca. 0.21, darüber "0,21".
        *   k=3: Grüner Balken, Höhe ca. 0.05, darüber "0,05".
        *   k=4: Dunkelgrüner Balken, sehr geringe Höhe ca. 0.004, rechts davon "≈0,004".
    *   Links neben dem k=0 Balken steht "Asymmetrisch". Ein geschwungener schwarzer Pfeil zeigt von dem Text "Lage (Mitte) linksverschoben" auf die Spitze des k=1 Balkens.
    *   Unter der Achse befindet sich ein horizontaler, nach links zeigender Pfeil, beschriftet mit "Streuung (Breite)".

*   **Rechtes Histogramm (großes p):**
    *   Titel: "großes p: p=0.75 (n=4)".
    *   Ein Balkendiagramm mit einer horizontalen Achse, beschriftet mit "k=0", "1", "2", "3", "4".
    *   Die Balken sind von links nach rechts in zunehmender Höhe und wechselnden Grün- und Blautönen dargestellt:
        *   k=0: Dunkelgrüner Balken, sehr geringe Höhe ca. 0.004, links davon "≈0,004".
        *   k=1: Grüner Balken, Höhe ca. 0.05, darüber "0,05".
        *   k=2: Hellgrüner Balken, Höhe ca. 0.21, darüber "0,21".
        *   k=3: Hellblauer Balken, Höhe ca. 0.42, darüber "0,42".
        *   k=4: Blauer Balken, Höhe ca. 0.32, rechts davon "0,32".
    *   Rechts neben dem k=4 Balken steht "Asymmetrisch". Ein geschwungener schwarzer Pfeil zeigt von dem Text "Lage (Mitte) rechtsverschoben" auf die Spitze des k=3 Balkens.
    *   Unter der Achse befindet sich ein horizontaler, nach rechts zeigender Pfeil, beschriftet mit "Streuung (Breite) ähnlich".

**Unterer Abschnitt: Einfluss von n (Anzahl der Versuche)**
Dieser Abschnitt ist überschrieben mit "Einfluss von n (Anzahl der Versuche)". Er enthält zwei Histogramme, die durch einen großen, orangefarbenen Pfeil mit schwarzem Rand verbunden sind, der nach rechts zeigt. Im Pfeil steht der schwarze Text: "n erhöht sich: Breitere Verteilung, mehr Werte, Mitte verschiebt sich mit".

*   **Linkes Histogramm (kleines n):**
    *   Titel: "kleines n: n=4 (p=0.5)".
    *   Ein Balkendiagramm mit einer horizontalen Achse, beschriftet mit "k=0", "1", "2", "3", "4".
    *   Die Balken zeigen eine symmetrische Verteilung, von links nach rechts in Blau- und Grüntönen:
        *   k=0: Dunkelblauer Balken, Höhe ca. 1/16, darüber "1/16".
        *   k=1: Blauer Balken, Höhe ca. 4/16, darüber "4/16".
        *   k=2: Hellgrüner Balken, Höhe ca. 6/16, darüber "6/16".
        *   k=3: Grüner Balken, Höhe ca. 4/16, darüber "4/16".
        *   k=4: Dunkelgrüner Balken, Höhe ca. 1/16, darüber "1/16".
    *   Ein geschwungener schwarzer Pfeil zeigt von dem Text "Symmetrisch, Mitte bei k=2" auf die Spitze des k=2 Balkens.
    *   Unter der Achse befindet sich ein horizontaler, nach links zeigender Pfeil, beschriftet mit "geringe Streuung".

*   **Rechtes Histogramm (größeres n):**
    *   Titel: "größeres n: n=8 (p=0.5)".
    *   Ein Balkendiagramm mit einer horizontalen Achse, beschriftet mit "k=0", "1", "2", "3", "4", "5", "6", "7", "8".
    *   Die Balken zeigen eine breitere, symmetrische Verteilung, die von k=0 bis k=8 reicht. Die Höhen nehmen von den Rändern zur Mitte (k=4) hin zu und dann wieder ab. Die Farben wechseln von Blau (links) zu Grün (rechts), wobei die höchsten Balken hellblau und hellgrün sind.
    *   Ein geschwungener schwarzer Pfeil zeigt von dem Text "Symmetrisch, Mitte bei k=4" auf die Spitze des k=4 Balkens.
    *   Unter der Achse befindet sich ein horizontaler, nach rechts zeigender Pfeil, beschriftet mit "größere Streuung".
```
