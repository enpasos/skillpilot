# Bildrekonstruktionsprompt: Bedingte und gemeinsame Wahrscheinlichkeiten im Kontext unterscheiden

## SkillPilot-Ziel

- SkillPilot-ID: `c2831918-26f1-421e-90fb-ce707689594e`
- Titel: Bedingte und gemeinsame Wahrscheinlichkeiten im Kontext unterscheiden
- Beschreibung: Die lernende Person kann in Sachzusammenhängen zwischen P(B|A), P(A|B) und P(A∩B) unterscheiden und mithilfe von Baumdiagrammen oder Vierfeldertafeln von einer Darstellung zur anderen übergehen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `c2831918-26f1-421e-90fb-ce707689594e.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein freundliches, lehrreiches Diagramm im Cartoon-Stil mit hellen, klaren Farben. Der Hintergrund ist hellblau mit sehr schwachen, schematischen Umrissen von Schul- und Lerngegenständen wie einem Laptop, Tablet, Notizbuch, Bleistift, Fragezeichen, einer Tafel und einem offenen Buch.

Oben mittig befindet sich ein hellblaues, abgerundetes Rechteck mit einem dünnen dunkelblauen Rand, das den Haupttitel enthält: **Bedingte und gemeinsame Wahrscheinlichkeiten unterscheiden** in fetter, schwarzer, serifenloser Schrift.

Das Diagramm ist in drei vertikale Paneele unterteilt, die jeweils ein Konzept darstellen und durch vertikale hellblaue Trennlinien voneinander abgegrenzt sind.

**Linkes Paneel (hellgrüner Hintergrund):**
Oben eine weiße, wolkenförmige Überschrift mit dunkelblauem Rand: **Gemeinsame Wahrscheinlichkeit P(A∩B)** in fetter, schwarzer Schrift.
Darunter ein weißes, abgerundetes Rechteck mit dem Text: **A UND B** in fetter, schwarzer Schrift.
Im Zentrum ein Venn-Diagramm: Ein hellblauer Kreis mit einem niedlichen lächelnden Gesicht (repräsentiert A) überlappt mit einem orangefarbenen Kreis mit einem niedlichen lächelnden Gesicht (repräsentiert B). Der Überlappungsbereich ist leuchtend gelb mit einem sanften Glühen und ist mit **P(A∩B)** in schwarzer Schrift beschriftet. Zwei schwarze Pfeile zeigen von außerhalb des Überlappungsbereichs auf diesen, einer von oben rechts, einer von unten rechts. Neben den Pfeilen steht jeweils der Text: **Beide treten ein**.
Unten ein weißes, abgerundetes Rechteck mit dem Text: **Teil der Gesamtmenge, wo A und B zusammen vorkommen.** in schwarzer Schrift.

**Verbindungselemente zwischen dem linken und mittleren Paneel:**
Ein hellblauer, wellenförmiger Pfeil zeigt vom unteren Bereich des linken Paneels nach rechts zum unteren Bereich des mittleren Paneels.
Oben zwischen den Paneelen befindet sich ein hellblaues Zahnradsymbol, um das sich zwei gebogene Pfeile drehen, die eine kreisförmige Bewegung andeuten.

**Mittleres Paneel (hellgelber Hintergrund):**
Oben eine weiße, wolkenförmige Überschrift mit dunkelblauem Rand: **Bedingte Wahrscheinlichkeit P(B|A)** in fetter, schwarzer Schrift.
Darunter ein weißes, abgerundetes Rechteck mit dem Text: **B gegeben A** in fetter, schwarzer Schrift.
Im Zentrum ein Ereignisdiagramm: Links ein hellblauer Kreis mit einem niedlichen lächelnden Gesicht, beschriftet mit **A**, und einem grünen Häkchensymbol. Darüber eine Sprechblase mit dem Text: **A ist passiert!**. Eine schwarze Linie führt diagonal nach oben rechts von Kreis A zu einem kleineren orangefarbenen Kreis, beschriftet mit **B**. Entlang dieser Linie steht der Text: **P(B|A)**. Rechts neben Kreis B befindet sich ein kleiner Kreis, der zur Hälfte hellblau und zur Hälfte orange ist, beschriftet mit **A und B**. Unterhalb von Kreis B ist eine Sprechblase mit dem Text: **Wie wahrscheinlich ist B jetzt?**.
Unten ein weißes, abgerundetes Rechteck mit einem niedlichen hellblauen Sprechblasensymbol mit lächelndem Gesicht. Darin die Formel in fetter, schwarzer Schrift: **P(B|A) = P(A∩B) / P(A)**.

**Verbindungselemente zwischen dem mittleren und rechten Paneel:**
Ein hellroter, wellenförmiger Pfeil zeigt vom unteren Bereich des mittleren Paneels nach rechts zum unteren Bereich des rechten Paneels.
Oben zwischen den Paneelen befindet sich ein orangefarbenes Zahnradsymbol, um das sich zwei gebogene Pfeile drehen, die eine kreisförmige Bewegung andeuten.

**Rechtes Paneel (hellrosa Hintergrund):**
Oben eine weiße, wolkenförmige Überschrift mit dunkelblauem Rand: **Bedingte Wahrscheinlichkeit P(A|B)** in fetter, schwarzer Schrift.
Darunter ein weißes, abgerundetes Rechteck mit dem Text: **A gegeben B** in fetter, schwarzer Schrift.
Im Zentrum ein Ereignisdiagramm: Links ein orangefarbener Kreis mit einem niedlichen lächelnden Gesicht, beschriftet mit **B**, und einem grünen Häkchensymbol. Darüber eine Sprechblase mit dem Text: **B ist passiert!**. Eine schwarze Linie führt diagonal nach oben rechts von Kreis B zu einem kleineren hellblauen Kreis, beschriftet mit **A**. Entlang dieser Linie steht der Text: **P(A|B)**. Rechts neben Kreis A befindet sich ein kleiner Kreis, der zur Hälfte orange und zur Hälfte hellblau ist, beschriftet mit **B und A**. Unterhalb von Kreis A ist eine Sprechblase mit dem Text: **Wie wahrscheinlich ist A jetzt?**.
Unten ein weißes, abgerundetes Rechteck mit einem niedlichen orangefarbenen Sprechblasensymbol mit lächelndem Gesicht. Darin die Formel in fetter, schwarzer Schrift: **P(A|B) = P(A∩B) / P(B)**.
```
