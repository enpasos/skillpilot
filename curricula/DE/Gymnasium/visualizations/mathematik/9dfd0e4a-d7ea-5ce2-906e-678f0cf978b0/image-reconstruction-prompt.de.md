# Bildrekonstruktionsprompt: Histogramme erstellen und lesen

## SkillPilot-Ziel

- SkillPilot-ID: `9dfd0e4a-d7ea-5ce2-906e-678f0cf978b0`
- Titel: Histogramme erstellen und lesen
- Beschreibung: Die lernende Person kann Histogramme diskreter Zufallsgrößen erstellen, lesen und mit Kenngrößen (Erwartungswert, Varianz, Standardabweichung) in einfachen Beispielen verknüpfen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `9dfd0e4a-d7ea-5ce2-906e-678f0cf978b0.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Diagramm im handgezeichneten Cartoon-Stil auf weißem Hintergrund. Alle Elemente haben schwarze Umrisse und sind mit einer sanften blauen Farbe gefüllt, wo zutreffend. Die Schrift ist schwarz, klar und gut lesbar.

Oben mittig steht der Titel in großer, fetter, schwarzer serifenloser Schrift: "Histogramme erstellen und lesen".

Darunter befindet sich eine horizontale Flussdiagramm-Reihe von vier abgerundeten Rechtecken, die von links nach rechts mit hellblauen Pfeilen verbunden sind. Jedes Rechteck ist hellblau gefüllt und schwarz umrandet.
1. Das erste Rechteck links enthält den Text "1. Zufallsexperiment & Zufallsgröße".
2. Das zweite Rechteck enthält den Text "2. Wahrscheinlichkeitsverteilung (Tabelle)".
3. Das dritte Rechteck enthält den Text "3. Histogramm erstellen".
4. Das vierte Rechteck rechts enthält den Text "4. Histogramm lesen & Kenngrößen".

Im unteren linken Bereich sind zwei goldene Münzen mit schwarzen Umrissen dargestellt, die leicht geneigt sind und geworfen werden, wobei beide die "Kopf"-Seite zeigen. Von den Münzen gehen zwei geschwungene schwarze Pfeile nach unten und rechts ab.
- Der obere Pfeil zeigt auf ein hellblaues, abgerundetes Rechteck mit schwarzem Umriss, das den Text "ZZ\n(0 Kopf)" enthält. Rechts neben "ZZ" ist ein kleiner orangefarbener Kreis mit schwarzem Umriss und der Zahl "0" darin.
- Ein weiterer Pfeil zeigt auf ein hellblaues, abgerundetes Rechteck mit schwarzem Umriss, das den Text "ZK\n(1 Kopf)" enthält. Rechts neben "ZK" ist ein kleiner orangefarbener Kreis mit schwarzem Umriss und der Zahl "1" darin.
- Ein dritter Pfeil zeigt auf ein hellblaues, abgerundetes Rechteck mit schwarzem Umriss, das den Text "KZ\n(1 Kopf)" enthält. Rechts neben "KZ" ist ein kleiner orangefarbener Kreis mit schwarzem Umriss und der Zahl "1" darin.
- Ein vierter Pfeil, der weiter unten beginnt, zeigt auf ein hellblaues, abgerundetes Rechteck mit schwarzem Umriss, das den Text "KK\n(2 Kopf)" enthält. Rechts neben "KK" ist ein kleiner orangefarbener Kreis mit schwarzem Umriss und der Zahl "2" darin.
Eine schwarze geschweifte Klammer verbindet die rechten Seiten der Rechtecke "ZK", "KZ" und "KK" vertikal. Rechts neben dieser Klammer steht der Text "Zufallsgröße X:\nAnzahl Kopf". Ein hellblauer Pfeil führt von diesem Text zur Wahrscheinlichkeitstabelle.

In der Mitte links befindet sich eine hellblaue, abgerundete Rechtecktabelle mit schwarzem Umriss. Sie hat zwei Zeilen und vier Spalten.
- Die obere Zeile enthält die Beschriftungen "X = k", "0", "1", "2".
- Die untere Zeile enthält die Beschriftungen "P(X=k)", "1/4", "2/4\n(1/2)", "1/4".
Unterhalb der Tabelle befindet sich ein kleines hellblaues, abgerundetes Rechteck mit schwarzem Umriss, das den Text "Summe = 1" enthält. Ein kleiner schwarzer Pfeil zeigt von der unteren rechten Ecke der Tabelle auf dieses "Summe = 1" Feld. Ein hellblauer Pfeil führt von der Tabelle zum Histogramm.

In der Mitte rechts ist ein 2D-Koordinatensystem dargestellt. Die horizontale x-Achse ist mit "k" beschriftet und hat Teilstriche und Beschriftungen bei "0", "1", "2". Die vertikale y-Achse ist mit "P(X=k)" beschriftet und hat Teilstriche und Beschriftungen bei "0", "1/4" und "2/4\n(1/2)". Ein hellgraues Gitter ist sichtbar. Drei hellblaue Histogrammbalken mit schwarzen Umrissen sind eingezeichnet:
- Der Balken bei x=0 reicht bis y=1/4.
- Der Balken bei x=1 reicht bis y=2/4 (1/2).
- Der Balken bei x=2 reicht bis y=1/4.
Eine vertikale gepunktete Linie verläuft von der Oberseite des Balkens bei x=1 nach oben und biegt dann in eine horizontale gepunktete Linie ab, die nach rechts zum Feld "Erwartungswert E(X)" führt. Ein hellblauer Pfeil führt vom Histogramm zum Feld "Erwartungswert E(X)".

Im unteren rechten Bereich sind drei hellblaue, abgerundete Rechtecke mit schwarzem Umriss vertikal gestapelt.
- Das oberste Rechteck enthält ein schwarzes Umriss-Symbol einer Waage und den Text "Erwartungswert E(X)". Darunter steht die Formel: "E(X) = 0·1/4 + 1·2/4 + 2·1/4 = 1".
- Das mittlere Rechteck enthält ein schwarzes Umriss-Symbol von vier Pfeilen, die von einem zentralen Quadrat nach außen zeigen, und den Text "Varianz Var(X)". Darunter steht die Formel: "Var(X) = (0-1)²·1/4 + (1-1)²·2/4 +\n+ (2-1)²·1/4 = 1/2".
- Das unterste Rechteck enthält ein schwarzes Umriss-Symbol eines Lineals mit einem Auf- und Abwärtspfeil und den Text "Standardabweichung σ". Darunter steht die Formel: "σ = √Var(X) = √(1/2) ≈ 0,71".
Eine schwarze geschweifte Klammer verbindet die rechten Seiten der Rechtecke "Varianz Var(X)" und "Standardabweichung σ" vertikal. Ein schwarzer Pfeil zeigt von der Oberseite dieser Klammer auf das Rechteck "Standardabweichung σ", um die Ableitung anzuzeigen.
```
