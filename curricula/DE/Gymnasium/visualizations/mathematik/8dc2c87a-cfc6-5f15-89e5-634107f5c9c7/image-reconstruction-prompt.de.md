# Bildrekonstruktionsprompt: Abbildungsmatrix aus Basisbildern bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `8dc2c87a-cfc6-5f15-89e5-634107f5c9c7`
- Titel: Abbildungsmatrix aus Basisbildern bestimmen
- Beschreibung: Die lernende Person kann die Abbildungsmatrix einer linearen Abbildung bezüglich der Standardbasis bestimmen, indem sie die Koordinatenvektoren der Bilder der geordneten Standardbasis in derselben Reihenfolge als Spalten anordnet.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `8dc2c87a-cfc6-5f15-89e5-634107f5c9c7.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein farbenfrohes, lehrreiches und klares Cartoon-Bild im Stil einer Infografik. Der Hintergrund ist ein hellblauer Himmel mit mehreren stilisierten weißen Wolken. Oben mittig steht der Titel in einer großen, dunkelblauen, handgeschriebenen Schriftart: "Abbildungsmatrix aus Basisbildern bestimmen".

Darunter, in der Mitte des Bildes, sind drei nebeneinanderliegende, abgerundete Rechteck-Boxen angeordnet.
Die linke Box hat einen orangefarbenen Rand und eine hellorangefarbene Füllung. Ihr Titel lautet "Basis & Bildvektoren" in dunkelblauer, handgeschriebener Schrift. Darunter sind zwei Zeilen mit mathematischen Ausdrücken und Text:
In der ersten Zeile steht links "Standardbasis" und rechts "Bildvektoren" in kleinerer, dunkelblauer, handgeschriebener Schrift. Darunter: `e₁ = [1; 0]` gefolgt von einem dicken, dunkelblauen Pfeil nach rechts, dann `f(e₁) = u = [2; 1]`.
In der zweiten Zeile, ebenfalls mit "Standardbasis" und "Bildvektoren" als Labels: `e₂ = [0; 1]` gefolgt von einem dicken, dunkelblauen Pfeil nach rechts, dann `f(e₂) = v = [-1; 3]`. Alle mathematischen Symbole und Zahlen sind in dunkelblauer, handgeschriebener Schrift.

Die mittlere Box hat einen gelben, wellenförmigen Rand oben und einen geraden gelben Rand an den anderen Seiten, gefüllt mit Hellgelb. Über dem Titel ist eine stilisierte gelbe Glühbirne mit drei gelben Lichtstrahlen nach oben gezeichnet. Der Titel lautet "Merksatz" in dunkelblauer, handgeschriebener Schrift. Darunter steht der Text in dunkelblauer, handgeschriebener Schrift: "Die Bildvektoren der Basisvektoren werden als Spalten in die Matrix eingetragen." Unter dem Text zeigen zwei cartoonartige Hände mit Zeigefingern nach oben: eine Hand zeigt auf das Wort "Spalten", die andere auf das Wort "Matrix".

Die rechte Box hat einen lilafarbenen Rand und eine helllilafarbene Füllung. Ihr Titel lautet "Abbildungsmatrix A" in dunkelblauer, handgeschriebener Schrift. Darunter steht die mathematische Gleichung: `A = [u v] = [[2 -1]; [1 3]]`. Über der ersten Spalte der Matrix `[2; 1]` ist ein kleines, orangefarbenes, abgerundetes Rechteck mit dem Buchstaben "u" in dunkelblauer Schrift. Über der zweiten Spalte der Matrix `[-1; 3]` ist ein kleines, lilafarbenes, abgerundetes Rechteck mit dem Buchstaben "v" in dunkelblauer Schrift. Alle mathematischen Symbole und Zahlen sind in dunkelblauer, handgeschriebener Schrift.

Unter diesen drei Boxen befindet sich eine weitere, breite, abgerundete Rechteck-Box, die sich über die gesamte Breite des Bildes erstreckt. Sie hat einen grünen Rand und eine hellgrüne Füllung. Ihr Titel lautet "Testrechnung" in dunkelblauer, handgeschriebener Schrift. Darunter steht eine mathematische Gleichung in mehreren Schritten, alle Symbole und Zahlen in dunkelblauer, handgeschriebener Schrift: `x = [4; 2]` gefolgt von `A * x = [[2 -1]; [1 3]] * [4; 2] = [[2*4 + (-1)*2]; [1*4 + 3*2]] = [6; 10]`.

Der gesamte Stil ist freundlich, klar und leicht verständlich, mit einer konsistenten Verwendung von abgerundeten Formen und einer handgeschriebenen Ästhetik für alle Texte und mathematischen Notationen.
```
