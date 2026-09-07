# Bildrekonstruktionsprompt: Verknüpfungen von Exponential- und ganzrationalen Funktionen untersuchen

## SkillPilot-Ziel

- SkillPilot-ID: `e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c`
- Titel: Verknüpfungen von Exponential- und ganzrationalen Funktionen untersuchen
- Beschreibung: Die lernende Person kann Funktionen analysieren, in denen Exponentialfunktionen mit ganzrationalen Funktionen addiert, multipliziert oder verkettet werden, und diese auch in Sachsituationen untersuchen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Quellbild: `e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein detailliertes, handgezeichnetes, pädagogisches Diagramm im Stil einer Whiteboard-Skizze auf einem sehr hellen cremefarbenen Hintergrund. Alle Elemente sind mit schwarzen, leicht unregelmäßigen Linien umrandet und haben abgerundete Ecken. Die Schrift ist klar, leserlich und wirkt leicht informell, wie von Hand geschrieben.

Oben mittig steht der Haupttitel in großer, fetter, schwarzer Schrift: "Verknüpfungen von Exponential- und ganzrationalen Funktionen untersuchen".

Darunter sind drei vertikal ausgerichtete, rechteckige Hauptkästen nebeneinander angeordnet. Jeder Kasten hat einen hellblauen Header-Bereich mit schwarzem Text und einen weißen Inhaltsbereich.

**Linker Kasten: "Funktion & Komponenten"**
Der Header lautet "Funktion & Komponenten". Im Inhaltsbereich steht die Funktion `f(x) = x² ⋅ e⁻ˣ` in schwarzer Schrift. Der Term `x²` ist hellgrün hinterlegt, und `e⁻ˣ` ist hellblau hinterlegt. Rechts unter der Funktion steht "für x ≥ 0" in schwarzer Schrift. Zwei geschwungene Pfeile zeigen von "für x ≥ 0" nach oben: ein hellgrüner Pfeil zum `x²`-Term und ein hellorange/gelber Pfeil zum `e⁻ˣ`-Term.
Unter der Funktion sind zwei weitere, kleinere Kästen nebeneinander angeordnet. Der linke Kasten ist hellgrün hinterlegt und enthält den schwarzen Text "ganzrationale Funktion (Polynom)" sowie eine kleine schwarze Parabel (U-förmig). Der rechte Kasten ist hellorange/gelb hinterlegt und enthält den schwarzen Text "Exponentialfunktion" sowie eine kleine schwarze Kurve, die einen exponentiellen Abfall darstellt (beginnt hoch und nähert sich der x-Achse).
Eine gepunktete schwarze Linie führt vom unteren Rand dieses Kastens nach unten zu einer hellblauen Gedankenblase mit weißer Umrandung. In der Gedankenblase befinden sich zwei Zahnräder (ein graues und ein gelbes) und der schwarze Text "Produktregel anwenden". Unter der Gedankenblase sind drei kleine, leere Kreise, die weitere Gedankenblasen andeuten.

**Mittlerer Kasten: "Ableitung & Analyse"**
Der Header lautet "Ableitung & Analyse". Im Inhaltsbereich werden die Schritte zur Ableitung dargestellt:
1.  `f'(x) = (2x) ⋅ e⁻ˣ + (x²) ⋅ (-e⁻ˣ)` in schwarzer Schrift. Der Term `(2x)` ist hellgrün, `e⁻ˣ` ist hellorange/gelb, `(x²)` ist hellgrün und `(-e⁻ˣ)` ist hellorange/gelb hinterlegt. Rechts daneben steht `(Produktregel)` in schwarzer Schrift.
2.  `= e⁻ˣ ⋅ (2x - x²)` in schwarzer Schrift. `e⁻ˣ` ist hellorange/gelb, `(2x - x²)` ist hellgrün hinterlegt.
3.  `= e⁻ˣ ⋅ x ⋅ (2 - x)` in schwarzer Schrift. `e⁻ˣ` ist hellorange/gelb, `x` ist hellgrün und `(2 - x)` ist hellgrün hinterlegt.
Ein hellblauer Pfeil zeigt nach unten. Darunter steht "Nullstellen der Ableitung (f'(x) = 0)" in schwarzer Schrift.
Anschließend: Ein rotes, durchgestrichenes `x` vor `e⁻ˣ > 0 (keine Nullstelle)` in schwarzer Schrift. Daneben, in schwarzen Kreisen, `x = 0` und `2 - x = 0 ⇒ x = 2`. Rechts von den Kreisen steht "Nullstellen" in schwarzer Schrift.
Darunter befindet sich eine Vorzeichentabelle. Eine horizontale Linie ist mit den Zahlen `0` und `2` markiert. Links von `0` und rechts von `2` zeigen Pfeile nach außen. Vertikale Linien trennen die Bereiche unter `0` und `2`.
Die erste Zeile der Tabelle zeigt die Vorzeichen: Links von `0` ist ein `-`, zwischen `0` und `2` ist ein `+`, und rechts von `2` ist ein `-`.
Die zweite Zeile beginnt mit `y` in der ersten Spalte. Im Bereich zwischen `0` und `2` steht `f'(x) > 0` und ein grüner Pfeil nach oben mit "f steigt". Dieser Bereich ist hellgrün hinterlegt. Im Bereich rechts von `2` steht `f'(x) < 0` und ein roter Pfeil nach unten mit "f fällt".
Unter der Tabelle befindet sich ein hellgelber Kasten mit abgerundeten Ecken, der den schwarzen Text "Maximum bei x = 2" enthält.

**Rechter Kasten: "Graph & Kontext"**
Der Header lautet "Graph & Kontext". Im Inhaltsbereich ist ein Koordinatensystem mit einer blauen Kurve dargestellt. Die x-Achse ist von `0` bis `6` beschriftet und mit `x` gekennzeichnet. Die y-Achse ist von `0` bis `0,6` in 0,1er-Schritten beschriftet und mit `f(x)` gekennzeichnet. Die blaue Kurve beginnt bei `(0,0)`, steigt zu einem Hochpunkt um `(2, 0.54)` an und fällt dann stetig ab, sich der x-Achse nähernd. Rote Punkte markieren die Kurve bei `(0,0)`, `(1, ~0.36)`, `(2, ~0.54)`, `(3, ~0.45)`, `(4, ~0.29)`, `(5, ~0.17)` und `(6, ~0.09)`. Eine gestrichelte vertikale Linie führt von `x=2` zum Hochpunkt auf der Kurve, und eine gestrichelte horizontale Linie führt vom Hochpunkt zur y-Achse. Ein roter Pfeil zeigt vom Hochpunkt auf den roten Text "Hochpunkt (Maximum)". Darunter stehen die roten Koordinaten `(2, 4/e²)`.
Unter dem Graphen befindet sich ein hellblauer Kasten mit abgerundeten Ecken. Darin ist ein kleines Diagramm zu sehen: Ein graues Batteriesymbol mit einem grünen Blitz, gefolgt von einem rechten Pfeil, der auf ein abfallendes Balkendiagramm zeigt (gelb-orangefarbener Verlauf mit einem roten Pfeil nach unten). Unter diesem Diagramm steht der schwarze Text "Sachsituation untersuchen (z.B. Modellierung)".

Alle Texte sind in einer klaren, leicht abgerundeten, handgeschriebenen Schriftart gehalten.
```
