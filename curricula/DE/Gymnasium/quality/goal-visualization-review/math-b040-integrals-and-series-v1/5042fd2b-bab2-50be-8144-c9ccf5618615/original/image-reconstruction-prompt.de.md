# Bildrekonstruktionsprompt: Graphen von Integrand und Integralfunktion wechselseitig deuten

## SkillPilot-Ziel

- SkillPilot-ID: `5042fd2b-bab2-50be-8144-c9ccf5618615`
- Titel: Graphen von Integrand und Integralfunktion wechselseitig deuten
- Beschreibung: Die lernende Person kann vom Graphen einer Funktion auf den Verlauf einer zugehörigen Integralfunktion schließen und umgekehrt aus einer Integralfunktion den Graphen der Integrandenfunktion erschließen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `5042fd2b-bab2-50be-8144-c9ccf5618615.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein detailliertes, didaktisches Diagramm zur Veranschaulichung der Beziehung zwischen einer Funktion und ihrer Stammfunktion. Der Hintergrund ist hellblau mit schwachen, weißen mathematischen Formeln und Symbolen, die wie auf einer Tafel geschrieben aussehen. Im Vordergrund befindet sich ein großes, weißes Rechteck mit abgerundeten Ecken und schwarzem Rand, das das Hauptdiagramm enthält.

Oben im weißen Rechteck steht der schwarze Titel: "Graphen von Integrand und Integralfunktion wechselseitig deuten".

Das Diagramm ist horizontal in zwei Hauptbereiche unterteilt, getrennt durch eine gestrichelte schwarze Linie in der Mitte.

**Oberer Bereich (Integrand f(x)):**
Links neben dem Graphen steht der schwarze Text "Integrand\nf(x)".
Ein Koordinatensystem mit schwarzen x- und y-Achsen, die jeweils mit Pfeilen enden. Die y-Achse ist oben mit 'y' und die x-Achse rechts mit 'x' beschriftet. Ein hellgraues Gitter ist sichtbar.
Auf der x-Achse sind die Punkte 'x=2' und 'x=4' markiert.
Eine rote Kurve, die die Funktion f(x) darstellt, verläuft durch das Koordinatensystem.
Der Bereich zwischen der roten Kurve und der x-Achse ist hellrot schattiert.
Bei x=2 schneidet die rote Kurve die x-Achse. An dieser Stelle ist ein roter Punkt auf der x-Achse markiert. Eine dünne schwarze Linie führt von diesem Punkt nach oben zu einem weißen Textfeld mit schwarzem Rand, das "f(2) = 0\n(Nullstelle)" enthält.
Links von x=2, oberhalb der roten Kurve, befindet sich ein weißes Textfeld mit schwarzem Rand, das "f(x) > 0" enthält.
Rechts von x=2, unterhalb der roten Kurve, befindet sich ein weißes Textfeld mit schwarzem Rand, das "f(x) < 0" enthält.

**Mittlerer Bereich (Verbindung der Graphen):**
Die gestrichelte schwarze Linie trennt die beiden Graphen.
Links befindet sich ein hellblaues Rechteck mit abgerundeten Ecken und schwarzem Rand, das den Text "Wechselseitiges Deuten\n(Integration)" enthält. Ein großer, hellblauer Pfeil zeigt von diesem Feld nach unten.
Ein hellrosa Rechteck mit abgerundeten Ecken und schwarzem Rand, das "f > 0 → F steigt" enthält, ist über einem großen roten Pfeil platziert, der von der oberen Kurve (wo f(x) > 0) nach unten zeigt.
Zentral befindet sich ein hellrosa Rechteck mit abgerundeten Ecken und schwarzem Rand, das "f = 0 → waagrechte\nTangente an F" enthält. Ein großer roter Pfeil zeigt von diesem Feld nach unten, genau über x=2.
Ein hellrosa Rechteck mit abgerundeten Ecken und schwarzem Rand, das "f < 0 → F fällt" enthält, ist über einem großen roten Pfeil platziert, der von der oberen Kurve (wo f(x) < 0) nach unten zeigt.
Rechts befindet sich ein hellblaues Rechteck mit abgerundeten Ecken und schwarzem Rand, das den Text "Wechselseitiges Deuten\n(Ableitung / Steigung)" enthält. Ein großer, hellblauer Pfeil zeigt von diesem Feld nach oben.

**Unterer Bereich (Integralfunktion F(x)):**
Links neben dem Graphen steht der schwarze Text "Integralfunktion\nF(x) mit\nF'(x)=f(x)".
Ein Koordinatensystem mit schwarzen x- und y-Achsen, die jeweils mit Pfeilen enden. Die y-Achse ist oben mit 'y' und die x-Achse rechts mit 'x' beschriftet. Ein hellgraues Gitter ist sichtbar.
Auf der x-Achse sind die Punkte 'x=2' und '4' markiert.
Eine blaue Kurve, die die Funktion F(x) darstellt, verläuft durch das Koordinatensystem.
Der Bereich hinter der blauen Kurve ist in den Abschnitten links und rechts von x=2 hellblau schattiert, um die Funktionsbereiche hervorzuheben.
Bei x=2 befindet sich ein blauer Punkt auf der blauen Kurve. Eine dünne schwarze Linie führt von der x-Achse bei x=2 nach oben zu diesem Punkt. Eine gestrichelte blaue horizontale Linie erstreckt sich von diesem blauen Punkt nach rechts.
Links von x=2, unterhalb der blauen Kurve, befindet sich ein weißes Textfeld mit schwarzem Rand, das "F steigt\n(Steigung > 0)" enthält.
Rechts von x=2, unterhalb der blauen Kurve, befindet sich ein weißes Textfeld mit schwarzem Rand, das "F fällt\n(Steigung < 0)" enthält.
Oberhalb des blauen Punktes bei x=2 befindet sich ein weißes Textfeld mit schwarzem Rand, das "F hat Hochpunkt\n(waagrechte Tangente)" enthält. Eine dünne schwarze Linie verbindet dieses Feld mit dem blauen Punkt.
```
