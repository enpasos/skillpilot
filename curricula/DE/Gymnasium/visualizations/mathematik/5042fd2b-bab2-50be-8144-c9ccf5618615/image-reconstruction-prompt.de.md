# Bildrekonstruktionsprompt: Graphen von Integrand und Integralfunktion wechselseitig deuten

## SkillPilot-Ziel

- SkillPilot-ID: `5042fd2b-bab2-50be-8144-c9ccf5618615`
- Titel: Graphen von Integrand und Integralfunktion wechselseitig deuten
- Beschreibung: Die lernende Person kann vom Graphen einer Funktion auf den Verlauf einer zugehörigen Integralfunktion schließen und umgekehrt aus einer Integralfunktion den Graphen der Integrandenfunktion erschließen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Quellbild: `5042fd2b-bab2-50be-8144-c9ccf5618615.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein mathematisches Diagramm auf einem hellblauen Hintergrund mit subtilen, verblassten Kreidezeichnungen. Oben zentriert steht der Titel in schwarzer, fetter Schrift: "Graphen von Integrand und Integralfunktion wechselseitig deuten". Darunter sind zwei große, weiße Rechteckfelder mit abgerundeten Ecken vertikal angeordnet.

Das obere Feld zeigt links den Text "Integrand\nf(x)" in Schwarz. Rechts davon befindet sich ein Koordinatensystem mit einer schwarzen, nach rechts zeigenden x-Achse (beschriftet "x") und einer schwarzen, nach oben zeigenden y-Achse (beschriftet "y"). Die y-Achse hat schwarze Teilstriche und Beschriftungen bei 0, 2 und -2. Die x-Achse hat Teilstriche und Beschriftungen bei 0 und 2. Eine rote, gerade Linie, die die Funktion f(x) = 2 - x darstellt, verläuft von (0,2) durch (2,0) nach rechts unten. Der Bereich zwischen dieser roten Linie und der x-Achse ist hellrot schattiert. Über dem schattierten Bereich für x < 2 steht in einem hellroten, abgerundeten Kasten der Text "f(x) > 0". Unter dem schattierten Bereich für x > 2 steht in einem hellroten, abgerundeten Kasten der Text "f(x) < 0". Bei x=2 auf der x-Achse ist ein roter Punkt, von dem eine schwarze Linie nach oben zu dem schwarzen Text "f(2) = 0\n(Nullstelle)" führt. Rechts neben der roten Linie steht der schwarze Text "f(x) = 2 - x".

In der Mitte, zwischen den beiden weißen Feldern, verläuft eine gestrichelte schwarze Linie. Oberhalb dieser Linie sind drei hellrote, abgerundete Textkästen horizontal angeordnet: "f > 0 → F steigt" (links), "f = 0 → waagrechte Tangente an F" (Mitte) und "f < 0 → F fällt" (rechts). Unterhalb der gestrichelten Linie sind zwei hellblaue, abgerundete Textkästen horizontal angeordnet: "Wechselseitiges Deuten\n(Integration)" (links) und "Wechselseitiges Deuten\n(Ableitung / Steigung)" (rechts).
Pfeile verbinden diese Elemente:
- Ein roter, geschwungener Pfeil zeigt vom oberen Graphen (Bereich f(x) > 0) nach unten rechts zum Kasten "f > 0 → F steigt".
- Ein hellblauer, geschwungener Pfeil zeigt vom Kasten "f > 0 → F steigt" nach unten links zum Kasten "Wechselseitiges Deuten\n(Integration)".
- Ein hellblauer, geschwungener Pfeil zeigt vom Kasten "Wechselseitiges Deuten\n(Integration)" nach oben rechts zum oberen Graphen (Bereich f(x) > 0).
- Ein roter, geschwungener Pfeil zeigt vom oberen Graphen (Bereich f(x) < 0) nach unten links zum Kasten "f < 0 → F fällt".
- Ein hellblauer, geschwungener Pfeil zeigt vom Kasten "f < 0 → F fällt" nach unten rechts zum Kasten "Wechselseitiges Deuten\n(Ableitung / Steigung)".
- Ein hellblauer, geschwungener Pfeil zeigt vom Kasten "Wechselseitiges Deuten\n(Ableitung / Steigung)" nach oben links zum oberen Graphen (Bereich f(x) < 0).
- Ein roter, vertikaler Pfeil zeigt vom roten Punkt bei x=2 auf der x-Achse des oberen Graphen nach unten zum Kasten "f = 0 → waagrechte Tangente an F".
- Ein roter, vertikaler Pfeil zeigt vom Kasten "f = 0 → waagrechte Tangente an F" nach unten zum Hochpunkt des unteren Graphen.

Das untere Feld zeigt links den Text "Integralfunktion\nF(x) mit\nF'(x)=f(x)" in Schwarz. Rechts davon befindet sich ein Koordinatensystem mit einer schwarzen, nach rechts zeigenden x-Achse (beschriftet "x") und einer schwarzen, nach oben zeigenden y-Achse (beschriftet "y"). Die y-Achse hat schwarze Teilstriche und Beschriftungen bei 0 und 2. Die x-Achse hat Teilstriche und Beschriftungen bei 0, 2 und 4. Eine blaue, parabolische Kurve, die die Funktion F(x) = 2x - x²/2 darstellt, verläuft von (0,0) über einen Hochpunkt bei (2,2) nach (4,0). Für x < 2 steht auf der Kurve der schwarze Text "F steigt\n(Steigung > 0)". Für x > 2 steht auf der Kurve der schwarze Text "F fällt\n(Steigung < 0)". Bei x=2 auf der Kurve ist ein blauer Punkt, von dem eine schwarze Linie nach unten zu dem schwarzen Text "F hat Hochpunkt\n(waagrechte Tangente)" führt. Eine gestrichelte blaue Linie verläuft horizontal durch diesen Hochpunkt. Rechts neben der blauen Kurve steht der schwarze Text "F(x) = 2x - x²/2".
```
