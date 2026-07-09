# Bildrekonstruktionsprompt: Formansatz begründen und anwenden

## SkillPilot-Ziel

- SkillPilot-ID: `d108ec1f-2c8f-5267-be75-10e1b77edd7a`
- Titel: Formansatz begründen und anwenden
- Beschreibung: Die lernende Person kann Argumente für die Wahl eines Formansatzes angeben, Ableitungen zur Kontrolle nutzen und Koeffizientenvergleich sicher durchführen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `d108ec1f-2c8f-5267-be75-10e1b77edd7a.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein Lernposter im klaren, einfachen Cartoon-Stil mit weichen Farben und schwarzen Umrissen auf weißem Hintergrund. Der Haupttitel oben in großer schwarzer Schrift lautet: 'Formansatz begründen und anwenden'. Darunter sind vier vertikale, rechteckige Tafeln mit abgerundeten Ecken und schwarzen Umrissen horizontal angeordnet.

**Tafel 1: '1. Problem & Begründung'**
Die erste Tafel hat einen hellblauen Kopfbereich mit dem schwarzen Text '1. Problem & Begründung'. Darunter steht links ein Cartoon-Junge mit braunen Haaren, blauem Hemd und grauer Hose, der nach rechts schaut und seine linke Hand am Kinn hat, mit einer Denkblase über seinem Kopf. Über der Denkblase schwebt eine gelbe Glühbirne mit Lichtstrahlen. Rechts vom Jungen befindet sich eine kleine schwarze Tafel mit Holzrahmen. Auf der Tafel steht in weißer Schrift:
'Gegeben:
f(x) = (4x+1) • e^2x
Begründung für Ansatz:
Ableiten von
(lineares Polynom)*e^2x
ergibt wieder
(lineares Polynom)*e^2x'

**Tafel 2: '2. Ansatz & Ableitung'**
Die zweite Tafel hat einen hellblauen Kopfbereich mit dem schwarzen Text '2. Ansatz & Ableitung'. Darunter ist eine Cartoon-Hand zu sehen, die einen grauen Stift hält und nach unten rechts auf den Text zeigt. Der Text in dieser Tafel lautet:
'Ansatz:
F(x) = (ax+b) • e^2x'
Darunter zeigt ein hellgrüner Pfeil nach unten. Neben dem Pfeil steht 'Ableiten' (oben) und '(Produkt- & Kettenregel)' (unten). Darunter steht:
'F'(x) = a • e^2x + (ax+b) • e^2x • 2'
Die nächste Zeile ist in einem hellgelb hinterlegten Kasten hervorgehoben:
'F'(x) = (2ax + a + 2b) • e^2x'
Ein geschwungener schwarzer Pfeil zeigt von dem '• 2' in der Zeile vor dem gelben Kasten nach unten zu dem Text unter dem gelben Kasten, der lautet:
'Faktor 2 beachten!
(Kettenregel)'

**Tafel 3: '3. Koeffizientenvergleich'**
Die dritte Tafel hat einen hellgrünen Kopfbereich mit dem schwarzen Text '3. Koeffizienten-vergleich'. Darunter sind zwei Spalten mit Text. Die linke Spalte zeigt:
'f(x) =
(4x+1) • e^2x'
Die rechte Spalte zeigt:
'F'(x) =
(2ax + a + 2b) • e^2x'
Darunter kreuzen sich vier Pfeile, die die Koeffizientenvergleiche visuell darstellen: Ein roter Pfeil zeigt von '4x' (im Ausdruck für f(x)) zu '2ax' (im Ausdruck für F'(x)). Ein weiterer roter Pfeil zeigt von '1' (im Ausdruck für f(x)) zu '(a + 2b)' (im Ausdruck für F'(x)). Ein blauer Pfeil zeigt von '2ax' (im Ausdruck für F'(x)) zu '4x' (im Ausdruck für f(x)). Ein weiterer blauer Pfeil zeigt von '(a + 2b)' (im Ausdruck für F'(x)) zu '1' (im Ausdruck für f(x)).
Unter den Pfeilen folgen zwei weitere Spalten mit den Vergleichsergebnissen. Die linke Spalte (x-Koeffizient) zeigt:
'x-Koeffizient:
2a = 4
→ a = 2'
Die rechte Spalte (Konstante) zeigt:
'Konstante:
a + 2b = 1
→ 2 + 2b = 1
→ 2b = -1
→ b = -½'

**Tafel 4: '4. Ergebnis & Kontrolle'**
Die vierte Tafel hat einen hellgrünen Kopfbereich mit dem schwarzen Text '4. Ergebnis & Kontrolle'. Links ist ein grünes Häkchen-Symbol in einem Kreis zu sehen. Rechts davon befindet sich ein hellgelb hinterlegter Kasten mit dem Text:
'Ergebnis:
F(x) = (2x - ½) • e^2x'
Unter dem gelben Kasten steht:
'Kontrolle:
F'(x) bilden'
Ein hellgrüner geschwungener Pfeil zeigt von der Zeile 'F'(x) bilden' nach oben zum 'Ergebnis' Kasten. Darunter ist die Kontrollrechnung dargestellt:
'F'(x) = (2 • e^2x + (2x - ½) • 2e^2x)
= (4x+1)e^2x'
Rechts steht eine Cartoon-Frau mit braunen Haaren und einem hellgrünen Pullover, die mit ihrem rechten Zeigefinger auf die Zeile '= (4x+1)e^2x' zeigt.
```
