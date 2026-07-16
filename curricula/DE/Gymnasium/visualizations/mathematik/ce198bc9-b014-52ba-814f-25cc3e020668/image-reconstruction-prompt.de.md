# Bildrekonstruktionsprompt: Einfache inverse Matrizen bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `ce198bc9-b014-52ba-814f-25cc3e020668`
- Titel: Einfache inverse Matrizen bestimmen
- Beschreibung: Die lernende Person kann für einfache 2x2-Matrizen oder Diagonalmatrizen die Inverse bestimmen und das Ergebnis durch Multiplikation prüfen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Quellbild: `ce198bc9-b014-52ba-814f-25cc3e020668.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein hellblauer Hintergrund mit subtilen, weißen Kreidezeichnungen von Pfeilen und abstrakten mathematischen Symbolen. Oben mittig steht der Titel "Einfache inverse Matrizen bestimmen" in großer, fetter, schwarzer, abgerundeter Schrift.

Auf der linken Seite befindet sich eine dunkelgrüne Tafel mit einem hellbraunen Holzrahmen. Auf der Tafel steht in weißer Schrift "Matrix A". Darunter ist eine 2x2-Matrix dargestellt: "A = [2 1; 1 1]". Die Zahl "2" oben links und die Zahl "1" unten rechts in dieser Matrix sind gelb hervorgehoben. Am unteren Rand der Tafel liegen ein weißes Kreidestück und ein brauner Tafelschwamm. Ein kleiner Cartoon-Charakter mit weißem Gesicht, schwarzen Augen und einem roten Lächeln ist an der linken Seite der Tafel befestigt. Er hat zwei braune Arme, einer zeigt nach oben auf den Text "Matrix A", der andere nach unten. Zwei weiße Sprechblasen mit schwarzem Rand sind mit der Tafel verbunden: Eine oben rechts, die den Text "Gegebene einfache 2x2-Matrix" enthält, und eine weitere unten links, ebenfalls mit dem Text "Gegebene einfache 2x2-Matrix".

Rechts von der Tafel, etwas höher positioniert, ist ein rechteckiges Feld mit einem dunkelblauen Kopfbereich und einem dunkelgrünen Hauptbereich, umrandet von einem hellblauen Rahmen. Im Kopfbereich steht in weißer Schrift "Determinantencheck (det)". Eine silberne Lupe mit weißer Linse überlappt leicht die obere linke Ecke dieses Feldes. Im Hauptbereich steht in weißer Schrift: "det(A) = (2 • 1) - (1 • 1) = 1". Darunter befindet sich ein grüner Pfeil, der nach rechts zeigt, gefolgt von einem grünen Kreis mit einem weißen Häkchen. Darunter steht "invertierbar" und in Klammern "(da det ≠ 0)", alles in weißer Schrift.

Unterhalb des "Determinantencheck"-Feldes und rechts von der Tafel, horizontal mit der Tafelmitte ausgerichtet, befindet sich ein weiteres rechteckiges Feld im gleichen Stil. Im Kopfbereich steht in weißer Schrift "Inverse Matrix A⁻¹". Im Hauptbereich steht in weißer Schrift: "A⁻¹ = [1 -1; -1 2]". Die Zahl "1" oben links und die Zahl "2" unten rechts in dieser Matrix sind gelb hervorgehoben. Eine weiße Sprechblase mit schwarzem Rand ist am unteren Rand dieses Feldes angebracht und enthält den Text: "Hauptdiagonale tauschen, Nebendiagonale negieren (bei det(A)=1)".

Rechts von diesem "Inverse Matrix A⁻¹"-Feld, etwas höher positioniert, so dass seine Oberkante mit der Oberkante des "Determinantencheck"-Feldes abschließt, befindet sich das dritte rechteckige Feld im gleichen Stil. Im Kopfbereich steht in weißer Schrift "Probe: A * A⁻¹". Ein gelbes, lächelndes Emoji mit einem Daumen hoch überlappt leicht die obere linke Ecke dieses Feldes. Im Hauptbereich steht in weißer Schrift: "[2 1; 1 1] • [1 -1; -1 2]". Die Zahl "1" oben links und die Zahl "2" unten rechts in der zweiten Matrix sind gelb hervorgehoben. Darunter, jeweils mit einem Gleichheitszeichen beginnend, folgen die Schritte der Matrixmultiplikation: "[(2*1) + (1*(-1)) (2*(-1)) + (1*2); (1*1) + (1*(-1)) (1*(-1)) + (1*2)]", dann "[2 - 1 -2 + 2; 1 - 1 -1 + 2]", und schließlich die Ergebnis-Matrix "[1 0; 0 1]". Diese letzte Matrix ist von einem leuchtenden hellblauen Rechteck umgeben. Darunter steht "Ergebnis:" und "Einheitsmatrix (E)", beides in weißer Schrift.

Zwei große, weiße Pfeile mit dunkelblauem Rand verbinden die Felder. Der erste Pfeil zeigt von der unteren rechten Seite der Tafel zum linken Rand des "Inverse Matrix A⁻¹"-Feldes und trägt den Text "Inverse bestimmen". Der zweite Pfeil zeigt vom rechten Rand des "Inverse Matrix A⁻¹"-Feldes zum linken Rand des "Probe: A * A⁻¹"-Feldes und trägt den Text "Probe durch Multiplikation (A * A⁻¹)".
```
