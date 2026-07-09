# Bildrekonstruktionsprompt: Einfache inverse Matrizen bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `ce198bc9-b014-52ba-814f-25cc3e020668`
- Titel: Einfache inverse Matrizen bestimmen
- Beschreibung: Die lernende Person kann für einfache 2x2-Matrizen oder Diagonalmatrizen die Inverse bestimmen und das Ergebnis durch Multiplikation prüfen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `ce198bc9-b014-52ba-814f-25cc3e020668.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein Cartoon-Diagramm im Bildungsstil auf einem hellblauen Hintergrund mit subtilen, weißen, kreideähnlichen mathematischen Skizzen.

Oben mittig steht der große, fette, schwarze Titel: "Einfache inverse Matrizen bestimmen".

Links befindet sich eine grüne, cartoonartige Schultafel mit Holzrahmen und braunen Beinen. Die Tafel hat cartoonartige Augen und einen lächelnden Mund. Auf der Tafel steht in weißer Schrift "Matrix A" und darunter "A = " gefolgt von einer 2x2-Matrix mit gelben Zahlen: erste Zeile `[2 1]`, zweite Zeile `[1 1]`. Zwei weiße Sprechblasen zeigen auf die Tafel: die obere linke Sprechblase sagt "Gegebene einfache 2x2-Matrix", und die untere linke Sprechblase sagt ebenfalls "Gegebene einfache 2x2-Matrix". Die Tafel hat zwei cartoonartige Arme, die auf diese Sprechblasen zeigen. Auf der unteren Leiste der Tafel liegen ein weißer Kreide-Radiergummi und ein Stück weiße Kreide.

Eine große, hellblaue Pfeilform zeigt von der Tafel nach rechts. In dieser Pfeilform steht in einer weißen Sprechblase mit schwarzer Schrift "Inverse bestimmen".

Oben in der Mitte ist ein dunkelgrünes Rechteck mit einem dunkelblauen Header. Der Headertext lautet "Determinantencheck (det)". Eine Lupe mit braunem Griff überlappt leicht die obere linke Ecke des Kastens. Im Kasten steht in weißer Schrift: "det(A) = (2 • 1) - (1 • 1) = 1". Darunter befindet sich ein grüner Pfeil, der nach rechts zeigt, gefolgt von einem grünen Häkchen-Symbol. Daneben steht in weißer Schrift "invertierbar" und darunter in Klammern "(da det ≠ 0)".

Unten in der Mitte ist ein weiteres dunkelgrünes Rechteck mit einem dunkelblauen Header. Der Headertext lautet "Inverse Matrix A⁻¹". Im Kasten steht in weißer Schrift: "A⁻¹ = " gefolgt von einer 2x2-Matrix mit gelben Zahlen: erste Zeile `[1 -1]`, zweite Zeile `[-1 2]`. Eine weiße Sprechblase zeigt von unten auf diesen Kasten und enthält den schwarzen Text: "Hauptdiagonale tauschen, Nebendiagonale negieren (bei det(A)=1)".

Eine weitere große, hellblaue Pfeilform zeigt vom unteren mittleren Kasten nach rechts. In dieser Pfeilform steht in einer weißen Sprechblase mit schwarzer Schrift "Probe durch Multiplikation (A * A⁻¹)".

Rechts befindet sich ein dunkelgrünes Rechteck mit einem dunkelblauen Header. Der Headertext lautet "Probe: A * A⁻¹". Ein gelbes, lächelndes Emoji mit Daumen hoch überlappt leicht die obere linke Ecke des Kastens. Im Kasten werden in weißer Schrift die Schritte einer Matrixmultiplikation dargestellt:
1.  Zeile: `[2 1]` `[1 -1]`
             `[1 1]` `[-1 2]`
2.  Zeile (unter einem Gleichheitszeichen): `[(2*1) + (1*(-1))] [(2*(-1)) + (1*2)]`
                                         `[(1*1) + (1*(-1))] [(1*(-1)) + (1*2)]`
3.  Zeile (unter einem Gleichheitszeichen): `[2 -1 -2 +2]`
                                         `[1 -1 -1 +2]`
4.  Zeile (unter einem Gleichheitszeichen): `[1 0]`
                                         `[0 1]` (Diese Matrix ist mit einem hellblauen Leuchten oder Rand hervorgehoben.)
Darunter steht in weißer Schrift "Ergebnis:" und darunter in grüner Schrift "Einheitsmatrix (E)".
Eine weiße Sprechblase zeigt auf den unteren rechten Bereich dieses Kastens und enthält den schwarzen Text: "Deutung: Matrix und Inverse ergeben multipliziert die Einheitsmatrix." Ein weiteres gelbes, lächelndes Emoji mit Daumen hoch befindet sich unterhalb dieser Sprechblase und zeigt nach unten rechts.
```
