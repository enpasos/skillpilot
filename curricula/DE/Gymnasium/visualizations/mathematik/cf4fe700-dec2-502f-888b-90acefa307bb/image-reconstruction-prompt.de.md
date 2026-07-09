# Bildrekonstruktionsprompt: Informationen aus Darstellungen entnehmen

## SkillPilot-Ziel

- SkillPilot-ID: `cf4fe700-dec2-502f-888b-90acefa307bb`
- Titel: Informationen aus Darstellungen entnehmen
- Beschreibung: Die lernende Person kann aus einer Darstellung relevante Informationen entnehmen (z. B. Nullstellen, Steigungen, Schnittpunkte) und in Worten oder Symbolen formulieren.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `cf4fe700-dec2-502f-888b-90acefa307bb.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein didaktisches Diagramm auf einem hellbeigen Hintergrund. Oben mittig steht der schwarze, fette Titel: "Informationen aus Darstellungen entnehmen".

Auf der linken Seite befindet sich ein Koordinatensystem mit einem hellgrauen Gitter. Die dicken schwarzen Achsen sind mit Pfeilen versehen und beschriftet: die vertikale Achse mit 'y' und die horizontale Achse mit 'x'. Die y-Achse hat Markierungen und Zahlen von 0 bis 6 (0, 1, 2, 3, 4, 5, 6). Die x-Achse hat Markierungen und Zahlen von 0 bis 3 (0, 1, 2, 3).

Eine dicke blaue Linie, die eine lineare Funktion darstellt, verläuft durch die Punkte (0,1) und (2,5). Diese beiden Punkte sind jeweils mit einem kleinen blauen Kreis markiert.

Mehrere Beschriftungen sind mit dünnen schwarzen Linien oder Pfeilen mit dem Graphen verbunden:
1.  Unterhalb des Punktes (0,1) befindet sich ein weißes, abgerundetes Rechteck mit schwarzem Rand, das den Text "y-Achsenabschnitt: 1" enthält. Ein dünner schwarzer, gebogener Pfeil zeigt von diesem Textfeld zum Punkt (0,1).
2.  Rechts vom Punkt (2,5) befindet sich ein weißes, abgerundetes Rechteck mit schwarzem Rand, das den Text "Punkt: (2|5)" enthält. Eine dünne schwarze Linie verbindet dieses Textfeld mit dem Punkt (2,5).
3.  Ein Steigungsdreieck ist eingezeichnet: Eine horizontale schwarze Linie verläuft von (0,1) nach (2,1), darunter steht die Beschriftung "+2". Eine vertikale schwarze Linie verläuft von (2,1) nach (2,5), links davon steht die Beschriftung "+4". Am Punkt (2,1) ist ein kleines schwarzes Quadrat eingezeichnet, das einen rechten Winkel symbolisiert.
4.  Rechts neben dem Steigungsdreieck befindet sich ein weißes, abgerundetes Rechteck mit schwarzem Rand, das den Text "Steigung: 2" enthält. Ein dünner schwarzer, gebogener Pfeil zeigt von der vertikalen Linie des Steigungsdreiecks zu diesem Textfeld.

Auf der rechten Seite des Bildes sind drei vertikal angeordnete, weiße, abgerundete Rechtecke mit schwarzem Rand zu sehen. Jedes dieser Felder wird von einem dicken, blau schattierten Pfeil von links angesteuert:
1.  Das obere Feld enthält den Text "Startwert (y-Achsenabschnitt): 1". Ein dicker, blau schattierter Pfeil zeigt von der oberen linken Seite des Diagramms (aus der Nähe des Punktes (2,5) und seiner Beschriftung "Punkt: (2|5)") nach rechts oben zu diesem Feld.
2.  Das mittlere Feld enthält den Text "Änderungsrate (Steigung): 2". Ein dicker, blau schattierter Pfeil zeigt von dem Textfeld "Steigung: 2" auf der linken Seite direkt nach rechts zu diesem Feld.
3.  Das untere Feld enthält den Text "Funktionswert bei x=2: 5". Ein dicker, blau schattierter Pfeil zeigt von der unteren linken Seite des Diagramms (aus der Nähe des Punktes (0,1) und seiner Beschriftung "y-Achsenabschnitt: 1") nach rechts unten zu diesem Feld.

Der Stil ist klar, lehrreich und hat leicht skizzierte Umrisse für die Textfelder und Pfeile.
```
