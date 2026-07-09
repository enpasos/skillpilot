# Bildrekonstruktionsprompt: Bestände aus Änderungsraten und Anfangsbestand rekonstruieren und deuten

## SkillPilot-Ziel

- SkillPilot-ID: `ece68088-71a8-466b-874c-09e6baac19fc`
- Titel: Bestände aus Änderungsraten und Anfangsbestand rekonstruieren und deuten
- Beschreibung: Die lernende Person kann Bestände aus Änderungsraten und einem Anfangsbestand berechnen sowie die Rekonstruktion in inner- und außermathematischen Kontexten deuten.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `ece68088-71a8-466b-874c-09e6baac19fc.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein detailliertes, lehrreiches Infografik-Diagramm im Cartoon-Stil mit klaren, abgerundeten Formen und einer freundlichen Farbpalette. Der Hintergrund ist oben hellblau und darunter weiß.

Oben mittig befindet sich ein großer, dunkelblauer Titel auf dem hellblauen Hintergrund: "Bestände aus Änderungsraten und Anfangsbestand rekonstruieren und deuten".

Darunter liegt ein großes, horizontales Rechteck mit abgerundeten Ecken und einem hellgelben Rand. Das Innere dieses Rechtecks ist hellblau. Dieses Rechteck ist vertikal in drei Hauptbereiche unterteilt: "Gegeben", "Rekonstruktion (Berechnung)" und "Deutung (Visualisierung)".

**Bereich 1: "Gegeben"**
Dieser Bereich hat einen hellgrünen Header mit abgerundeten Ecken und dunkelblauem Text "Gegeben". Der Inhalt ist in vier hellblaue Unterfelder mit dünnem dunkelblauem Rand unterteilt, angeordnet in einem 2x2-Raster.

*   **Oberes linkes Feld:**
    *   Text: "Anfangsbestand B(0) = 5 Liter"
    *   Darunter eine einfache Cartoon-Zeichnung eines transparenten Glases, das etwa zur Hälfte mit hellblauem Wasser gefüllt ist.
*   **Oberes rechtes Feld:**
    *   Text: "Änderungsrate r(t) = 3t² Liter/Min."
    *   Darunter eine einfache Cartoon-Zeichnung eines silbernen Wasserhahns mit blauem Griff, aus dem hellblaues Wasser in ein kleines, leeres, transparentes Glas tropft.
    *   Eine hellblaue Sprechblase zeigt vom tropfenden Wasser nach rechts und enthält den Text "Zuflussrate (positiv)".
*   **Unteres linkes Feld:**
    *   Text: "Anfangsbestand B(0) = 5 Liter"
    *   Darunter eine Cartoon-Zeichnung eines lächelnden, hellblauen Wassertropfen-Charakters mit Armen und Beinen, der neben einer runden analogen Uhr steht. Die Uhr hat ein weißes Zifferblatt, schwarze Stunden- und Minutenzeiger, die auf 12 zeigen, und schwarze Strichmarkierungen.
    *   Neben der Uhr steht der Text: "t = 0 Min."
*   **Unteres rechtes Feld:**
    *   Text: "Änderungsrate r(t) = 3t² Liter/Min."
    *   Darunter ein 2D-Koordinatensystem. Die X-Achse ist mit "t (Min.)" beschriftet und hat Markierungen bei 0, 1, 2. Die Y-Achse ist mit "r(t)" beschriftet. Eine blaue Kurve, die r(t) = 3t² darstellt, steigt von (0,0) an. Zwei Punkte sind auf der Kurve markiert und mit gestrichelten Linien zu den Achsen verbunden: (1,3) und (2,12).

**Bereich 2: "Rekonstruktion (Berechnung)"**
Dieser Bereich hat einen hellgrünen Header mit abgerundeten Ecken und dunkelblauem Text "Rekonstruktion (Berechnung)". Der Hintergrund dieses Bereichs ist hellgrün.

*   **Oben:** Eine weiße Box mit abgerundeten Ecken und dunkelblauem Rand enthält die Gleichung: `B(t) = B(0) + ∫₀ᵗ r(s) ds`
*   **Darunter:** Die Gleichung: `B(t) = 5 + ∫₀ᵗ 3s² ds = 5 + t³`
*   **Darunter:** Ein großer, dicker, weißer Pfeil mit dunkelblauer Umrandung, der nach unten zeigt.
*   **Darunter:** Der Text: "Für t = 2 Min.:"
*   **Darunter:** Eine hellgrüne Box mit abgerundeten Ecken und dunkelblauem Rand enthält die Berechnung:
    *   Text: "Änderung (Zuwachs) ="
    *   Gleichung: `∫₀² 3s² ds`
    *   Gleichung: `= [s³]₀² = 2³ - 0³ = 8 Liter`
*   **Ganz unten:** Die Gleichungen:
    *   `B(2) = Anfangsbestand + Änderung`
    *   `= 5 + 8 = 13 Liter`

**Bereich 3: "Deutung (Visualisierung)"**
Dieser Bereich hat einen hellgelben Header mit abgerundeten Ecken und dunkelblauem Text "Deutung (Visualisierung)". Der Hintergrund dieses Bereichs ist hellgelb.

*   **Oben:** Ein 2D-Koordinatensystem. Die X-Achse ist mit "t (Min.)" beschriftet und hat Markierungen bei 0, 1, 2. Die Y-Achse ist mit "Volumen (Liter)" beschriftet und hat Markierungen bei 0, 5, 13.
    *   Eine blaue Kurve, die `B(t) = 5 + t³` darstellt, beginnt bei (0,5) und steigt bis (2,13).
    *   Der Bereich unter der Kurve ist schattiert:
        *   Ein hellblaues Rechteck von (0,0) bis (2,5) ist schattiert.
        *   Ein hellgrüner Bereich oberhalb des hellblauen Rechtecks und unter der blauen Kurve von t=0 bis t=2 ist schattiert.
    *   Gestrichelte horizontale Linien verbinden y=5 mit der Kurve bei t=0 und y=13 mit der Kurve bei t=2.
    *   Eine gestrichelte vertikale Linie verbindet t=2 mit der Kurve.
    *   Ein grüner Punkt markiert (2,13) auf der Kurve.
    *   Eine hellblaue Sprechblase zeigt vom grünen Punkt (2,13) nach rechts und enthält den Text "Endbestand B(2) = 13 Liter".
    *   Eine hellgrüne Sprechblase zeigt vom hellgrün schattierten Bereich nach rechts und enthält den Text "Änderung (Integralfläche = Zuwachs = 8 Liter)".
    *   Eine hellblaue Sprechblase zeigt vom hellblau schattierten Rechteck nach rechts und enthält den Text "Anfangsbestand (5 Liter)".
*   **Darunter:** Eine weiße Box mit abgerundeten Ecken und dunkelblauem Rand enthält den Text: "Deutung: Das Integral liefert die Bestandsänderung. Anfangsbestand plus Änderung ergibt den Bestand."
*   **Ganz unten:** Eine weiße Box mit abgerundeten Ecken und dunkelblauem Rand enthält ein rotes Warnsymbol (ein rotes "X" in einem roten Kreis mit einem diagonalen Strich) und den Text:
    *   "Achtung: Rate r(2)=12 ≠ Bestand B(2)=13!"
    *   "Anfangsbestand B(0) nicht vergessen!"
```
