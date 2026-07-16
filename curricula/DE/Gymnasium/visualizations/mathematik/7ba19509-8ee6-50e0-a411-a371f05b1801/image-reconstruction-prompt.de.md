# Bildrekonstruktionsprompt: Verschiebungen und Streckungen von Funktionsgraphen erkennen

## SkillPilot-Ziel

- SkillPilot-ID: `7ba19509-8ee6-50e0-a411-a371f05b1801`
- Titel: Verschiebungen und Streckungen von Funktionsgraphen erkennen
- Beschreibung: Die lernende Person kann Verschiebungen sowie Streckungen oder Stauchungen von Funktionsgraphen in x- und y-Richtung anhand von Term, Graph oder Parametern erkennen und beschreiben.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Quellbild: `7ba19509-8ee6-50e0-a411-a371f05b1801.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Diagramm auf einem hellblauen Hintergrund mit einem subtilen, helleren blauen Gittermuster. Der Haupttitel, mittig oben platziert, lautet "Verschiebungen und Streckungen von Funktionsgraphen erkennen" in fetter schwarzer serifenloser Schrift.

Unterhalb des Titels sind drei horizontal angeordnete, gleich große, abgerundete weiße Rechtecke mit hellblauen Rändern zu sehen. Jedes Rechteck enthält ein Koordinatensystem, das Funktionstransformationen illustriert.

**Erstes Rechteck (links):**
Überschrift: "Verschiebung in x-Richtung" in fettem schwarzem Text. Es zeigt ein schwarzes Koordinatensystem mit einer x-Achse, die mit "x" beschriftet ist, und einer y-Achse, die mit "y" beschriftet ist. Der Ursprung ist mit "(0|0)" markiert.
Drei Parabeln sind dargestellt:
1. Eine durchgezogene grüne Parabel, die `f(x) = x²` darstellt, mit ihrem Scheitelpunkt bei (0|0). Die Beschriftung `f(x) = x²` ist in Grün daneben.
2. Eine gepunktete orangefarbene Parabel, die `f(x+2)` darstellt, mit ihrem Scheitelpunkt bei (-2|0). Die Beschriftung `f(x+2)` ist in Orange links davon.
3. Eine gepunktete hellblaue Parabel, die `f(x-2)` darstellt, mit ihrem Scheitelpunkt bei (2|0). Die Beschriftung `f(x-2)` ist in Hellblau rechts davon.
Auf der x-Achse sind die Punkte (-2|0), (0|0) und (2|0) explizit beschriftet.
Unterhalb der x-Achse erstreckt sich ein orangefarbener, nach links zeigender Pfeil von (0|0) nach (-2|0), mit dem Text "Links-Verschiebung um 2" darunter. Ein hellblauer, nach rechts zeigender Pfeil erstreckt sich von (0|0) nach (2|0), mit dem Text "Rechts-Verschiebung um 2" darunter.

**Zweites Rechteck (Mitte):**
Überschrift: "Verschiebung in y-Richtung" in fettem schwarzem Text. Es zeigt ein schwarzes Koordinatensystem mit einer x-Achse, die mit "x" beschriftet ist, und einer y-Achse, die mit "y" beschriftet ist. Der Ursprung ist mit "(0|0)" markiert.
Drei Parabeln sind dargestellt:
1. Eine durchgezogene grüne Parabel, die `f(x) = x²` darstellt, mit ihrem Scheitelpunkt bei (0|0). Die Beschriftung `f(x) = x²` ist in Grün daneben.
2. Eine gepunktete violette Parabel, die `f(x)+2` darstellt, mit ihrem Scheitelpunkt bei (0|2). Die Beschriftung `f(x)+2` ist in Violett darüber.
3. Eine gepunktete rote Parabel, die `f(x)-2` darstellt, mit ihrem Scheitelpunkt bei (0|-2). Die Beschriftung `f(x)-2` ist in Rot darunter.
Auf der y-Achse sind die Punkte (0|0), (0|2) und (0|-2) explizit beschriftet.
Neben der y-Achse erstreckt sich ein violetter, nach oben zeigender Pfeil von (0|0) nach (0|2), mit dem Text "Oben-Verschiebung um 2" daneben. Ein roter, nach unten zeigender Pfeil erstreckt sich von (0|0) nach (0|-2), mit dem Text "Unten-Verschiebung um 2" daneben.

**Drittes Rechteck (rechts):**
Überschrift: "Streckung in y-Richtung" in fettem schwarzem Text. Es zeigt ein schwarzes Koordinatensystem mit einer x-Achse, die mit "x" beschriftet ist, und einer y-Achse, die mit "y" beschriftet ist. Der Ursprung ist mit "(0|0)" markiert.
Drei Parabeln sind dargestellt, alle mit ihren Scheitelpunkten bei (0|0):
1. Eine durchgezogene grüne Parabel, die `f(x) = x²` darstellt. Die Beschriftung `f(x) = x²` ist in Grün darüber.
2. Eine schmalere, gepunktete dunkelblaue Parabel, die `2f(x)` darstellt. Die Beschriftung `2f(x)` ist in Dunkelblau darüber. Daneben, in schwarzem Text, steht "Streckung (schmaler, Faktor 2)".
3. Eine breitere, gepunktete hellblaue Parabel, die `0,5f(x)` darstellt. Die Beschriftung `0,5f(x)` ist in Hellblau darunter. Daneben, in schwarzem Text, steht "Stauchung (breiter, Faktor 0,5)".
Der Punkt (0|0) ist auf der x-Achse beschriftet.

**Regelkarte unten rechts:**
Unterhalb des dritten Rechtecks, leicht nach rechts versetzt, befindet sich ein kleineres, abgerundetes gelbes Rechteck mit einem dunkelorangen Rand.
Es ist mit "Regelkarte für x-Richtung" in fettem schwarzem Text überschrieben.
Im Inneren befinden sich zwei Textzeilen mit begleitenden Symbolen:
1. Die erste Zeile zeigt ein Symbol einer schmaleren gepunkteten Parabel innerhalb einer breiteren gepunkteten Parabel, mit einem horizontalen Doppelpfeil, der nach innen zeigt. Der Text lautet: `f(2x): in x-Richtung um Faktor ½ gestaucht`.
2. Die zweite Zeile zeigt ein Symbol einer breiteren gepunkteten Parabel innerhalb einer schmaleren gepunkteten Parabel, mit einem horizontalen Doppelpfeil, der nach außen zeigt. Der Text lautet: `f(x/2): in x-Richtung um Faktor 2 gestreckt`.
```
