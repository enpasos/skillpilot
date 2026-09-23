# Unabhängige Bildprüfung v2 – Winkel zwischen zwei Ebenen

- Lernziel: `bda6a659-9640-53a5-8be0-24705ab623ef` (`Winkel zwischen zwei Ebenen berechnen`)
- Geprüfte Datei: `plane-angle-direction-candidate.png`
- SHA-256: `01c320fb4ea450c66d4c14104d14093fd288112e4f97cade2554109ddbc64164`
- Tatsächliche Originalgröße: **1678 × 937 px**, RGB-PNG. Die Datei ist bytegleich mit dem dokumentierten generierten Ergebnis.
- Entscheidung: **KEEP als Bildkandidat**. Dies ist eine unabhängige fachliche und gestalterische Sichtprüfung, keine Publikationsfreigabe, kein Import und keine Aktualisierung eines QA-Ledgers.

## Fachliche Prüfung am tatsächlichen PNG

Die gezeichneten Vektoren `n_E=(1,0,0)` und `n_F=(1,1,0)` stehen in der dargestellten xy-Ebene korrekt auf der positiven x-Achse beziehungsweise diagonal bei 45°. Das Skalarprodukt ist `1·1+0·1+0·0=1`, die Beträge sind `1` und `√2`. Die angezeigte Formel mit Betrag des Skalarprodukts ergibt damit `cos(φ)=1/√2` und den kleineren, nicht orientierten Ebenenschnittwinkel `φ=45 Grad`. Der Befund gilt unabhängig von der Wahl des Vorzeichens der Normalen.

Die neue Unterzeile lautet sichtbar und lesbar: „Richtung der Schnittgeraden: parallel zur z-Achse“. Sie ist aus diesen zwei nicht parallelen Normalen korrekt ableitbar: Ein Richtungsvektor der Schnittgeraden ist orthogonal zu beiden Normalen, hier also parallel zu `(0,0,1)`. Anders als eine Gleichung `x=0, y=0` behauptet die neue Unterzeile keine unbelegte Lage der Schnittgeraden. Der rechte Deutungssatz („Der Schnittwinkel der Ebenen ist hier 45 Grad“) ist für das Beispiel korrekt. Weitere falsche mathematische Beschriftungen oder Rechenschritte sind im Originalbild nicht erkennbar.

Die Visualisierung trifft das Q2-Ziel: Berechnung über geeignete Normalen und geometrische Deutung. Sie ergänzt die vorhandenen Voraussetzungen „Normalenvektor einer Ebene bestimmen und nutzen“ und „Skalarprodukt zur Winkelberechnung nutzen“; sie macht aus dem Ziel keine Aufgabe zur Bestimmung der exakten Schnittgeraden. Der in der aktuellen HE-Quelle Q2.3, S. 42, Spiegelstrich 8 genannte Winkel zwischen zwei Ebenen wird damit sachgerecht veranschaulicht.

## Darstellung und Grenzen

Der freundliche, abstrakte Blau-Orange-Stil bleibt konsistent. Titel, Vektoren, Achsen, Rechenblock und beide Bildunterschriften sind in der Originalauflösung scharf und gut lesbar; die neue Unterzeile sitzt innerhalb ihrer Box. Das Bild zeigt bewusst die Normalen statt zwei perspektivisch gezeichneter Ebenen. Das ist für die Winkelberechnung verständlich, belegt aber allein keine konkrete Ebenenlage; die neue Formulierung wahrt genau diese Grenze.

Die Pfeile sind nur **schematische Richtungsbilder**, keine maßstäblich eingetragenen Koordinatenvektoren: Die sichtbaren Pfeillängen wirken etwa gleich, obwohl die rechts korrekt berechneten Beträge `1` und `√2` sind; auch die zeichnerische x-Projektion von `n_F` ist nicht exakt die Pfeillänge von `n_E`. Ohne Skalenmarken ist aus der Zeichnung keine Länge oder Koordinate abzulesen. Dies ist ein didaktischer Vorbehalt, aber bei korrekten Richtungen und explizit korrekter Rechnung kein falscher numerischer Bildsatz. Eine spätere maßstäbliche Überarbeitung wäre nur dann nötig, wenn die Illustration selbst zum Ablesen von Vektorkoordinaten dienen soll. Lesbarkeit bei stark verkleinerter Darstellung auf Mobilgeräten wurde hier nicht separat geprüft.
