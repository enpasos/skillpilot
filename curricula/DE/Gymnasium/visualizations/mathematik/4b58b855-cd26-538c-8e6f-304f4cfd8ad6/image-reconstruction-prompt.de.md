# Bildrekonstruktionsprompt: Fehler 1. und 2. Art deuten

## SkillPilot-Ziel

- SkillPilot-ID: `4b58b855-cd26-538c-8e6f-304f4cfd8ad6`
- Titel: Fehler 1. und 2. Art deuten
- Beschreibung: Die lernende Person kann Fehler 1. und 2. Art unterscheiden, ihre Bedeutung in Anwendungen (z. B. medizinische Tests, Qualitätskontrolle) erklären und Beispiele zuordnen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `4b58b855-cd26-538c-8e6f-304f4cfd8ad6.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, handgezeichnetes Diagramm im Cartoon-Stil mit schwarzen Umrissen und weichen Pastellfarben auf weißem Hintergrund.

Der Haupttitel, zentriert oben, lautet "Fehler 1. und 2. Art deuten" in schwarzer, fetter, serifenloser Schrift.

Darunter befindet sich ein großes, hellgraues Rechteck mit abgerundeten Ecken und schwarzem Rand, das den gesamten Inhalt umschließt. Innerhalb dieses großen Rechtecks, oben mittig, ist ein kleineres, hellgraues Rechteck mit abgerundeten Ecken und schwarzem Rand platziert, das den Text "Entscheidung vs. Wahrheit" enthält.

Das große Rechteck ist vertikal durch eine schwarze gestrichelte Linie in zwei Hauptbereiche unterteilt. Der linke Bereich hat einen hellblauen Kopfzeilenhintergrund, der rechte Bereich einen hellorangen Kopfzeilenhintergrund. Rechts neben dem großen Rechteck, durch eine vertikale gestrichelte Linie getrennt, befindet sich ein schmalerer Bereich mit einem hellgrauen Rechteck mit abgerundeten Ecken und schwarzem Rand oben.

**Linker Hauptbereich (Fehler 1. Art):**
Die Kopfzeile hat einen hellblauen Hintergrund und schwarzen Rand, mit dem Text "Wahrheit: H0 ist wahr (z.B. Produkt OK, p ≤ 0,10)" in Schwarz.
Darunter befindet sich ein Diagramm einer Normalverteilung:
Eine horizontale schwarze Linie (x-Achse). Eine hellblaue, glockenförmige Kurve (Normalverteilung) ist über der x-Achse zentriert. Eine vertikale gestrichelte schwarze Linie erstreckt sich von der x-Achse nach oben und schneidet die Kurve. Der Bereich unter der Kurve rechts von dieser gestrichelten Linie ist mit einem rotbraunen diagonalen Schraffurmuster gefüllt. Dieser schraffierte Bereich stellt den "Fehler 1. Art (α)" dar.
Ein schwarzer Pfeil zeigt vom Scheitelpunkt der Kurve nach unten links und ist mit "Verteilung bei H0 wahr" beschriftet.
Ein schwarzer Pfeil zeigt vom schraffierten Bereich nach oben rechts und ist mit "Ablehnungsbereich (X ≥ k)" beschriftet.
Ein rotes Rechteck mit abgerundeten Ecken und schwarzem Rand, das den Text "Entscheidung: H0 verwerfen" enthält, ist rechts von der Kurve positioniert. Ein roter Pfeil zeigt von diesem Rechteck zum schraffierten Bereich.
Unter der Kurve, mittig, ist ein rotes Rechteck mit abgerundeten Ecken und schwarzem Rand platziert, das den Text "Fehler 1. Art (α)" enthält.

Darunter folgen zwei Beispiele, jeweils in einem hellgrauen Rechteck mit abgerundeten Ecken und schwarzem Rand:
1.  **Beispiel Qualitätskontrolle:** Links eine Cartoon-Illustration eines Förderbands mit drei blauen Kartons. Rechts vom Förderband fallen weitere blaue Kartons in einen grauen Behälter, der mit "Ausschuss" (schwarzer Text auf weißem Grund, schwarzer Rand) beschriftet ist. Rechts daneben der schwarze Text: "Beispiel Qualitätskontrolle: Gute Charge irrtümlich verworfen."
2.  **Beispiel Medizin:** Links eine Cartoon-Illustration eines lächelnden Mannes mit hellbraunem Haar und hellblauem Hemd. Rechts von ihm ein weißes Klemmbrett mit einem roten Kreuz-Symbol und schwarzen Linien. Unter dem Mann ein rotes Rechteck mit "POSITIV" in weißer Schrift. Rechts daneben der schwarze Text: "Beispiel Medizin: Gesunder Patient falsch-positiv getestet."

**Rechter Hauptbereich (Fehler 2. Art):**
Die Kopfzeile hat einen hellorangen Hintergrund und schwarzen Rand, mit dem Text "Wahrheit: H1 ist wahr (z.B. Produkt defekt, p > 0,10)" in Schwarz.
Darunter befindet sich ein Diagramm einer Normalverteilung:
Eine horizontale schwarze Linie (x-Achse). Eine hellorangefarbene, glockenförmige Kurve (Normalverteilung) ist über der x-Achse nach rechts verschoben. Eine vertikale gestrichelte schwarze Linie erstreckt sich von der x-Achse nach oben und schneidet die Kurve. Diese Linie befindet sich an derselben x-Position wie die gestrichelte Linie im linken Diagramm. Der Bereich unter der Kurve links von dieser gestrichelten Linie ist mit einem rotbraunen diagonalen Schraffurmuster gefüllt. Dieser schraffierte Bereich stellt den "Fehler 2. Art (β)" dar.
Ein schwarzer Pfeil zeigt vom Scheitelpunkt der Kurve nach unten links und ist mit "Verteilung bei H1 wahr" beschriftet.
Ein schwarzer Pfeil zeigt von der gestrichelten Linie nach oben links und ist mit "Ablehnungsbereich (X ≥ k)" beschriftet.
Ein hellblaues Rechteck mit abgerundeten Ecken und schwarzem Rand, das den Text "Entscheidung: H0 nicht verwerfen" enthält, ist links von der Kurve positioniert. Ein hellblauer Pfeil zeigt von diesem Rechteck zum schraffierten Bereich.
Unter der Kurve, mittig, ist ein hellblaues Rechteck mit abgerundeten Ecken und schwarzem Rand platziert, das den Text "Fehler 2. Art (β)" enthält.

Darunter folgen zwei Beispiele, jeweils in einem hellgrauen Rechteck mit abgerundeten Ecken und schwarzem Rand:
1.  **Beispiel Qualitätskontrolle:** Links eine Cartoon-Illustration eines Förderbands mit zwei kaputten braunen Kartons. Rechts davon empfängt ein offener brauner Karton, beschriftet mit "OK - Versand" (schwarzer Text auf weißem Grund, schwarzer Rand), über einen roten Pfeil einen kaputten Karton vom Förderband. Rechts daneben der schwarze Text: "Beispiel Qualitätskontrolle: Schlechte Charge irrtümlich ausgeliefert."
2.  **Beispiel Medizin:** Links eine Cartoon-Illustration eines kranken Mannes mit hellbraunem Haar, roten Wangen und einem Thermometer im Mund, der ein hellblaues Hemd trägt und hustet. Rechts von ihm ein weißes Klemmbrett mit einem roten Symbol eines gebrochenen Herzens und schwarzen Linien. Unter dem Mann ein hellgrünes Rechteck mit "NEGATIV" in weißer Schrift. Rechts daneben der schwarze Text: "Beispiel Medizin: Kranker Patient falsch-negativ (übersehen)."

**Rechter Seitenbereich (Teststärke):**
Oben ein hellgraues Rechteck mit abgerundeten Ecken und schwarzem Rand, das den Text "Teststärke (1 - β)" in Schwarz enthält.
Darunter befindet sich ein Diagramm einer Normalverteilung:
Eine horizontale schwarze Linie (x-Achse). Eine hellorangefarbene, glockenförmige Kurve (Normalverteilung) ist über der x-Achse positioniert, identisch in Form und Position zur "Verteilung bei H1 wahr" im rechten Hauptbereich. Eine vertikale gestrichelte schwarze Linie erstreckt sich von der x-Achse nach oben und schneidet die Kurve. Diese Linie befindet sich an derselben x-Position wie die gestrichelten Linien in den anderen beiden Diagrammen. Der Bereich unter der Kurve rechts von dieser gestrichelten Linie ist mit einem rotbraunen diagonalen Schraffurmuster gefüllt. Dieser schraffierte Bereich stellt die "Teststärke (1 - β)" dar.
Ein schwarzer Pfeil zeigt vom Scheitelpunkt der Kurve nach unten links und ist mit "Verteilung bei H1 wahr" beschriftet.
Unter dem Diagramm steht der schwarze Text: "Teststärke (1 - β): Wahrscheinlichkeit, H1 korrekt zu erkennen" gefolgt von einem grünen Häkchen-Symbol in einem Kreis.

Die vertikalen gestrichelten Linien in allen drei Normalverteilungsdiagrammen repräsentieren denselben Schwellenwert 'k'. Der "Ablehnungsbereich (X ≥ k)" ist der Bereich rechts von diesem Schwellenwert. Der "Fehler 1. Art (α)" ist die Wahrscheinlichkeit, H0 zu verwerfen, wenn H0 wahr ist, dargestellt durch den schraffierten Bereich unter der H0-Verteilung im Ablehnungsbereich. Der "Fehler 2. Art (β)" ist die Wahrscheinlichkeit, H0 nicht zu verwerfen, wenn H1 wahr ist, dargestellt durch den schraffierten Bereich unter der H1-Verteilung links vom Ablehnungsbereich. Die "Teststärke (1 - β)" ist die Wahrscheinlichkeit, H0 zu verwerfen, wenn H1 wahr ist, dargestellt durch den schraffierten Bereich unter der H1-Verteilung im Ablehnungsbereich.
```
