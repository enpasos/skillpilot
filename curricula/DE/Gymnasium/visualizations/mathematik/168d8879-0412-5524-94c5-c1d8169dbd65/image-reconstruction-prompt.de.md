# Bildrekonstruktionsprompt: Eigene Abbildungen modellieren und interpretieren

## SkillPilot-Ziel

- SkillPilot-ID: `168d8879-0412-5524-94c5-c1d8169dbd65`
- Titel: Eigene Abbildungen modellieren und interpretieren
- Beschreibung: Die lernende Person kann zu gegebenen geometrischen Anforderungen (z. B. Spiegelung an einer schrägen Geraden, Streckung in einer beliebigen Richtung) passende Abbildungsmatrizen konstruieren, testen und im Kontext begründen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `168d8879-0412-5524-94c5-c1d8169dbd65.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein illustratives, pädagogisches Diagramm im Cartoon-Stil mit abgerundeten Ecken und sanften Schatten. Der Hintergrund ist hellblau und geht im unteren Bereich in hellgrün über, verziert mit verstreuten, stilisierten Zahnrädern und geometrischen Formen (Dreiecke, Quadrate) in Hellblau und Hellgrün.

Oben mittig steht der Titel in schwarzer, fetter, serifenloser Schrift: 'Eigene Abbildungen modellieren und interpretieren'.

Das Hauptdiagramm befindet sich in einem großen, leicht geneigten, weißen Rechteck mit abgerundeten Ecken und einem hellblauen Rand. Dieses Rechteck ist vertikal in drei Abschnitte unterteilt, die jeweils einen hellblauen Header-Kasten mit abgerundeten Ecken und einem dunkelblauen Rand haben. Die Abschnitte sind durch hellblaue vertikale Linien getrennt und durch große, hellblaue, pfeilförmige Elemente mit dunkelblauer Umrandung miteinander verbunden, die einen Fluss von links nach rechts anzeigen.

**Abschnitt 1: GEOMETRISCHE ANFORDERUNG**
Der Header lautet: 'GEOMETRISCHE ANFORDERUNG' in schwarzer, fetter, serifenloser Schrift.
Darunter befindet sich eine weiße Sprechblase mit schwarzem Umriss, die ein kartesisches Koordinatensystem enthält. Die X- und Y-Achsen sind schwarz und mit 'x' und 'y' beschriftet. Eine blaue Linie, die die Funktion y=x darstellt, ist diagonal eingezeichnet und entlang der Linie mit 'Spiegelachse y=x' beschriftet. Ein blauer Punkt ist bei (x, y) eingezeichnet, mit gestrichelten Linien zu den Achsen, die 'x' und 'y' markieren. Ein weiterer blauer Punkt ist bei (y, x) eingezeichnet, ebenfalls mit gestrichelten Linien zu den Achsen, die 'x' und 'y' markieren. Ein schwarzer Pfeil zeigt vom Punkt (x, y) zum Punkt (y, x).
Unter der Sprechblase befindet sich ein weißes Rechteck mit abgerundeten Ecken und hellblauem Rand, das den Text enthält: 'Punkte werden an y=x gespiegelt; x- und y-Koordinate tauschen die Rollen.' in schwarzer, serifenloser Schrift.

**Abschnitt 2: ABBILDUNGSMATRIX KONSTRUIEREN**
Der Header lautet: 'ABBILDUNGSMATRIX KONSTRUIEREN' in schwarzer, fetter, serifenloser Schrift.
Darunter befindet sich ein großes, hellgrünes Rechteck mit abgerundeten Ecken und einem dunkelgrünen Rand, das die Matrix 'M =' gefolgt von einer 2x2 Matrix mit den Elementen '0 1' in der ersten Zeile und '1 0' in der zweiten Zeile, alles in schwarzer, fetter, serifenloser Schrift, darstellt.
Unter der Matrix befindet sich ein weißes Rechteck mit abgerundeten Ecken und hellblauem Rand, das den Text enthält: 'Konstruierte Matrix M für Spiegelung an y=x.' in schwarzer, serifenloser Schrift.

**Abschnitt 3: TESTEN & BEGRÜNDEN**
Der Header lautet: 'TESTEN & BEGRÜNDEN' in schwarzer, fetter, serifenloser Schrift.
Im oberen linken Bereich dieses Abschnitts befindet sich ein weißes Rechteck mit abgerundeten Ecken und hellblauem Rand, das folgenden Text in schwarzer, serifenloser Schrift enthält:
'TEST: BEISPIELPUNKTE' (fett)
'P = (3, 1) →'
'P' = M ⋅ (3, 1) = (1, 3)'
'Q = (-2, 4) →'
'Q' = M ⋅ (-2, 4) = (4, -2)'
Rechts davon ist ein kartesisches Koordinatensystem mit einem Gitter eingezeichnet. Die X- und Y-Achsen sind schwarz und von -4 bis 5 mit Strichmarkierungen und Zahlen beschriftet. Eine blaue Linie, die y=x darstellt, ist diagonal eingezeichnet und oben rechts mit 'y=x' beschriftet.
Ein roter Punkt P=(3,1) ist eingezeichnet und mit 'P = (3, 1)' beschriftet. Ein roter Punkt P'=(1,3) ist eingezeichnet und mit 'P' = (1, 3)' beschriftet. Eine gestrichelte rote Linie verbindet P und P'. Ein kleiner schwarzer Pfeil zeigt von P zu P' entlang der gestrichelten Linie. Ein kleiner roter Rombus markiert den Mittelpunkt der Strecke PP' auf der Linie y=x. Ein schwarzer Pfeil, beschriftet mit 'M ⋅ P', zeigt von P zu P'.
Ein orangefarbener Punkt Q=(-2,4) ist eingezeichnet und hat ein gelbes Sternsymbol daneben. Ein orangefarbener Punkt Q'=(4,-2) ist eingezeichnet und hat ebenfalls ein gelbes Sternsymbol daneben. Eine gestrichelte orangefarbene Linie verbindet Q und Q'. Ein kleiner schwarzer Pfeil zeigt von Q zu Q' entlang der gestrichelten Linie. Ein schwarzer Pfeil, beschriftet mit 'M ⋅ Q', zeigt von Q zu Q'.
Unter dem Graphen befindet sich ein weißes Rechteck mit abgerundeten Ecken und hellblauem Rand, das den Text enthält: 'Strecke PP' senkrecht auf y=x. Mittelpunkt auf y=x.' in schwarzer, serifenloser Schrift.
Im unteren linken Bereich dieses Abschnitts befindet sich ein weiteres weißes Rechteck mit abgerundeten Ecken und hellblauem Rand, das folgenden Text in schwarzer, serifenloser Schrift enthält:
'MODELLIERUNGSCHECK' (fett)
'R = (2, 2)'
'R' = (2, 2)'
Darunter ist ein violetter Punkt R=(2,2) auf der Linie y=x eingezeichnet. Ein violetter, gekrümmter Pfeil beginnt bei R, macht eine Schleife und zeigt zurück zu R, um zu verdeutlichen, dass R' ebenfalls (2,2) ist.
Daneben befindet sich ein weißes Rechteck mit abgerundeten Ecken und hellblauem Rand, das den Text enthält: 'R = (2, 2) bleibt fest (Fixpunkt auf Achse).' in schwarzer, serifenloser Schrift.
```
